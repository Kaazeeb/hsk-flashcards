window.HSKFlashcards = window.HSKFlashcards || {};

/**
 * Supabase auth and remote persistence adapter.
 *
 * Security model: auth identifies the user; Supabase RLS must enforce user_id = auth.uid().
 * Sync model: settings are granular documents, while review/progress changes are append-only
 * events so an old device cannot overwrite weeks of progress with a stale snapshot.
 */
(function (ns) {
  // Browser clients may contain the public anon/publishable key, never a service-role key.
  const HARDCODED_SUPABASE_URL = "https://vfivrshzlhmocjoozawx.supabase.co";
  const HARDCODED_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaXZyc2h6bGhtb2Nqb296YXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTQwMDMsImV4cCI6MjA5Mjc5MDAwM30.DHTy3vI2aQBUSygvIhALMxdslAPItzwV7Dspv0ElE8A";

  const DOC_TABLE = "app_sync_documents";
  const EVENT_TABLE = "app_review_events";
  const LEGACY_TABLE = "app_state_documents";
  const DOC_NS = {
    SNAPSHOTS: "snapshots",
    VOCAB: "vocab",
    CARD_FLAGS: "card_flags",
    SET: "set",
    META: "meta"
  };
  const DOC_IDS = {
    PROGRESS: "progress",
    SMART: "smart",
    CURRENT: "current",
    SET_ORDER: "set_order"
  };
  const PROGRESS_EVENT_KINDS = [
    "learn_seen",
    "practice_translation",
    "practice_pinyin",
    "test_translation",
    "test_pinyin"
  ];
  const SMART_EVENT_KIND = "smart_fsrs";
  const CLIENT_ID_STORAGE_KEY = "hsk_flashcards_client_id";

  const state = {
    config: { url: HARDCODED_SUPABASE_URL, key: HARDCODED_SUPABASE_KEY },
    client: null,
    session: null,
    user: null,
    subscription: null,
    listeners: new Set(),
    lastEvent: "INIT",
    ready: false,
    providerReady: false,
    clientId: ""
  };

  function getCreateClient() {
    return window.supabase && typeof window.supabase.createClient === "function"
      ? window.supabase.createClient
      : null;
  }

  function loadConfig() {
    return { url: HARDCODED_SUPABASE_URL, key: HARDCODED_SUPABASE_KEY };
  }

  function clearSubscription() {
    const sub = state.subscription;
    state.subscription = null;
    if (!sub) return;
    try {
      if (typeof sub.unsubscribe === "function") sub.unsubscribe();
      if (sub.subscription && typeof sub.subscription.unsubscribe === "function") {
        sub.subscription.unsubscribe();
      }
    } catch (error) {
      console.warn("Failed to unsubscribe Supabase auth listener.", error);
    }
  }

  function getStatus() {
    return {
      ready: state.ready,
      providerReady: state.providerReady,
      configured: true,
      signedIn: !!state.user,
      email: state.user?.email || "",
      userId: state.user?.id || "",
      config: { ...state.config },
      lastEvent: state.lastEvent
    };
  }

  function notify(event) {
    state.lastEvent = event || state.lastEvent;
    const snapshot = getStatus();
    state.listeners.forEach((listener) => {
      try {
        listener({ event: state.lastEvent, ...snapshot });
      } catch (error) {
        console.error("Auth listener failed.", error);
      }
    });
  }

  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function getClientId() {
    if (state.clientId) return state.clientId;
    try {
      const existing = localStorage.getItem(CLIENT_ID_STORAGE_KEY);
      if (existing) {
        state.clientId = existing;
        return state.clientId;
      }
      const next = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(CLIENT_ID_STORAGE_KEY, next);
      state.clientId = next;
      return state.clientId;
    } catch (error) {
      state.clientId = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      return state.clientId;
    }
  }

  function toIso(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function normalizeCardFlags(card) {
    return {
      learn: card?.learn !== false,
      practice: card?.practice !== false,
      test: card?.test !== false
    };
  }

  function isDefaultFlags(flags) {
    return flags.learn !== false && flags.practice !== false && flags.test !== false;
  }

  function sameFlags(a, b) {
    const left = normalizeCardFlags(a);
    const right = normalizeCardFlags(b);
    return left.learn === right.learn && left.practice === right.practice && left.test === right.test;
  }

  function stripCards(cards) {
    return (Array.isArray(cards) ? cards : []).map((card) => ({
      hanzi: String(card?.hanzi || "").trim(),
      pinyin: String(card?.pinyin || "").trim(),
      translation: String(card?.translation || "").trim()
    })).filter((card) => card.hanzi && card.pinyin && card.translation);
  }

  function sameCardList(a, b) {
    const left = stripCards(a);
    const right = stripCards(b);
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) {
      if (left[i].hanzi !== right[i].hanzi || left[i].pinyin !== right[i].pinyin || left[i].translation !== right[i].translation) {
        return false;
      }
    }
    return true;
  }

  function buildFlagsMap(vocab) {
    const map = {};
    (Array.isArray(vocab) ? vocab : []).forEach((card) => {
      if (!card?.id) return;
      map[String(card.id)] = normalizeCardFlags(card);
    });
    return map;
  }

  function getNamedSetsMap(sets) {
    const byId = sets?.byId && typeof sets.byId === "object" ? sets.byId : {};
    const map = {};
    Object.values(byId).forEach((setRecord) => {
      if (!setRecord || setRecord.locked) return;
      map[String(setRecord.id)] = {
        id: String(setRecord.id),
        name: String(setRecord.name || setRecord.id).trim() || String(setRecord.id),
        cardIds: Array.isArray(setRecord.cardIds) ? [...setRecord.cardIds].map(String) : [],
        createdAt: setRecord.createdAt || new Date().toISOString(),
        updatedAt: setRecord.updatedAt || setRecord.createdAt || new Date().toISOString()
      };
    });
    return map;
  }

  function sameSetDoc(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.name !== b.name) return false;
    if (a.cardIds.length !== b.cardIds.length) return false;
    for (let i = 0; i < a.cardIds.length; i += 1) {
      if (a.cardIds[i] !== b.cardIds[i]) return false;
    }
    return true;
  }

  function createEmptyProgress() {
    return {
      seen: {},
      practice: { translation: {}, pinyin: {} },
      test: { translation: {}, pinyin: {} }
    };
  }

  function normalizeScore(entry) {
    return {
      shown: Math.max(0, Math.floor(Number(entry?.shown) || 0)),
      correct: Math.max(0, Math.floor(Number(entry?.correct) || 0)),
      wrong: Math.max(0, Math.floor(Number(entry?.wrong) || 0))
    };
  }

  function cloneProgress(progress) {
    return deepClone(progress || createEmptyProgress()) || createEmptyProgress();
  }

  function getBucketByKind(progress, kind) {
    if (kind === "practice_translation") return progress.practice.translation;
    if (kind === "practice_pinyin") return progress.practice.pinyin;
    if (kind === "test_translation") return progress.test.translation;
    if (kind === "test_pinyin") return progress.test.pinyin;
    return null;
  }

  function applyProgressEvent(progress, event) {
    if (!event || !event.kind) return;
    const id = String(event.card_id || "");
    if (!id) return;
    if (event.kind === "learn_seen") {
      progress.seen[id] = true;
      return;
    }
    const bucket = getBucketByKind(progress, event.kind);
    if (!bucket) return;
    const current = normalizeScore(bucket[id]);
    const payload = event.payload || {};
    current.shown += Math.max(0, Math.floor(Number(payload.shown_delta) || 0));
    current.correct += Math.max(0, Math.floor(Number(payload.correct_delta) || 0));
    current.wrong += Math.max(0, Math.floor(Number(payload.wrong_delta) || 0));
    bucket[id] = current;
  }

  // Normal practice/test progress is synced as positive deltas. Negative deltas
  // indicate reset/import and are handled via snapshots rather than destructive event edits.
  function buildProgressDiffEvents(current, previous) {
    const events = [];
    const next = cloneProgress(current);
    const prev = cloneProgress(previous);

    Object.keys(next.seen || {}).forEach((cardId) => {
      if (next.seen[cardId] && !prev.seen?.[cardId]) {
        events.push({ kind: "learn_seen", card_id: cardId, payload: {} });
      }
    });

    function collect(kind) {
      const nextBucket = getBucketByKind(next, kind) || {};
      const prevBucket = getBucketByKind(prev, kind) || {};
      const ids = new Set([...Object.keys(nextBucket), ...Object.keys(prevBucket)]);
      ids.forEach((cardId) => {
        const a = normalizeScore(nextBucket[cardId]);
        const b = normalizeScore(prevBucket[cardId]);
        const deltaShown = a.shown - b.shown;
        const deltaCorrect = a.correct - b.correct;
        const deltaWrong = a.wrong - b.wrong;
        if (deltaShown < 0 || deltaCorrect < 0 || deltaWrong < 0) {
          throw new Error("NON_MONOTONIC_PROGRESS");
        }
        if (deltaShown > 0 || deltaCorrect > 0 || deltaWrong > 0) {
          events.push({
            kind,
            card_id: cardId,
            payload: {
              shown_delta: deltaShown,
              correct_delta: deltaCorrect,
              wrong_delta: deltaWrong
            }
          });
        }
      });
    }

    collect("practice_translation");
    collect("practice_pinyin");
    collect("test_translation");
    collect("test_pinyin");
    return events;
  }

  function cloneSmartState(smartBySet) {
    return deepClone(smartBySet || {}) || {};
  }

  function getSmartEntryRaw(bucket, cardId) {
    return bucket && typeof bucket === "object" ? bucket[String(cardId)] || null : null;
  }

  // Smart FSRS sync is driven by locally-generated reviewEvents. The fallback
  // exists only for old local states that predate explicit events.
  function buildSmartDiffEvents(current, previous) {
    const events = [];
    const next = cloneSmartState(current);
    const prev = cloneSmartState(previous);
    const setIds = new Set([...Object.keys(next), ...Object.keys(prev)]);

    setIds.forEach((setId) => {
      const nextBucket = next[setId] || {};
      const prevBucket = prev[setId] || {};
      const cardIds = new Set([...Object.keys(nextBucket), ...Object.keys(prevBucket)]);
      cardIds.forEach((cardId) => {
        const a = getSmartEntryRaw(nextBucket, cardId);
        const b = getSmartEntryRaw(prevBucket, cardId);
        if (!a || !a.started) return;

        const currentEvents = ns.smart && typeof ns.smart.normalizeReviewEvents === "function"
          ? ns.smart.normalizeReviewEvents(a.reviewEvents)
          : (Array.isArray(a.reviewEvents) ? a.reviewEvents : []);
        const previousEvents = ns.smart && typeof ns.smart.normalizeReviewEvents === "function"
          ? ns.smart.normalizeReviewEvents(b?.reviewEvents)
          : (Array.isArray(b?.reviewEvents) ? b.reviewEvents : []);
        const previousIds = new Set(previousEvents.map((event) => String(event.id)));
        currentEvents.forEach((event) => {
          if (!event.id || previousIds.has(event.id)) return;
          events.push({
            event_id: event.id,
            kind: SMART_EVENT_KIND,
            set_id: String(setId),
            card_id: String(cardId),
            occurred_at: toIso(event.occurredAt),
            payload: { rating: event.rating }
          });
        });

        if (currentEvents.length) return;

        // Backward-compatible fallback for old local states that only have counters.
        const nextShown = Math.max(0, Math.floor(Number(a.shown) || 0));
        const prevShown = Math.max(0, Math.floor(Number(b?.shown) || 0));
        const deltaShown = nextShown - prevShown;
        if (deltaShown !== 1) return;
        const rating = Number(a.lastRating);
        const occurredAt = a.lastReviewedAt || a.card?.last_review || null;
        if (![1, 2, 3, 4].includes(rating) || !occurredAt) return;
        events.push({
          kind: SMART_EVENT_KIND,
          set_id: String(setId),
          card_id: String(cardId),
          occurred_at: toIso(occurredAt),
          payload: { rating }
        });
      });
    });

    return events;
  }

  function groupDocs(rows) {
    const namespaces = {};
    (rows || []).forEach((row) => {
      if (!row || !row.namespace || row.doc_id === undefined || row.doc_id === null) return;
      if (!namespaces[row.namespace]) namespaces[row.namespace] = {};
      namespaces[row.namespace][String(row.doc_id)] = row.payload || {};
    });
    return namespaces;
  }

  function applyFlagsToVocab(vocab, flagDocs) {
    const byId = {};
    vocab.forEach((card) => {
      byId[String(card.id)] = card;
    });
    Object.entries(flagDocs || {}).forEach(([cardId, flags]) => {
      if (!byId[cardId]) return;
      byId[cardId].learn = flags?.learn !== false;
      byId[cardId].practice = flags?.practice !== false;
      byId[cardId].test = flags?.test !== false;
    });
    return Object.values(byId).sort((a, b) => (a.index || 0) - (b.index || 0));
  }

  function buildSetsRaw(docGroups) {
    const rawById = {};
    Object.values(docGroups[DOC_NS.SET] || {}).forEach((payload) => {
      if (!payload?.id) return;
      rawById[String(payload.id)] = {
        id: String(payload.id),
        name: String(payload.name || payload.id).trim() || String(payload.id),
        cardIds: Array.isArray(payload.cardIds) ? payload.cardIds.map(String) : [],
        createdAt: payload.createdAt || new Date().toISOString(),
        updatedAt: payload.updatedAt || payload.createdAt || new Date().toISOString(),
        locked: false
      };
    });
    const orderDoc = docGroups[DOC_NS.META]?.[DOC_IDS.SET_ORDER];
    const order = Array.isArray(orderDoc?.order) ? orderDoc.order.map(String) : Object.keys(rawById);
    return { byId: rawById, order };
  }

  // Remote state is rebuilt by layering granular documents with chronologically
  // replayed append-only events. This avoids trusting any single stale device snapshot.
  function buildRemoteRawState(docRows, eventRows) {
    const docGroups = groupDocs(docRows);
    const builtinCards = typeof ns.getBuiltInCards === "function" ? ns.getBuiltInCards() : [];
    const vocabDoc = docGroups[DOC_NS.VOCAB]?.[DOC_IDS.CURRENT];
    const baseCards = Array.isArray(vocabDoc?.cards) && vocabDoc.cards.length ? vocabDoc.cards : builtinCards;
    const baseDb = typeof ns.store?.normalizeDb === "function"
      ? ns.store.normalizeDb({ vocab: baseCards }, builtinCards)
      : { vocab: baseCards.map((card, index) => ({ ...card, id: `${card.hanzi}__${card.pinyin}__${card.translation}`, index: index + 1 })) };
    const vocab = applyFlagsToVocab(baseDb.vocab || [], docGroups[DOC_NS.CARD_FLAGS] || {});
    const progressSnapshot = docGroups[DOC_NS.SNAPSHOTS]?.[DOC_IDS.PROGRESS]?.progress || null;
    const progress = cloneProgress(progressSnapshot || createEmptyProgress());
    const smartSnapshot = docGroups[DOC_NS.SNAPSHOTS]?.[DOC_IDS.SMART]?.smartBySet || {};
    const smartBySet = cloneSmartState(smartSnapshot);
    const sortedEvents = [...(eventRows || [])].sort((a, b) => {
      const aTime = new Date(a.occurred_at || a.created_at || 0).getTime();
      const bTime = new Date(b.occurred_at || b.created_at || 0).getTime();
      if (aTime !== bTime) return aTime - bTime;
      return String(a.event_id || "").localeCompare(String(b.event_id || ""));
    });
    sortedEvents.forEach((event) => {
      if (event.kind === SMART_EVENT_KIND) {
        const setId = String(event.set_id || "");
        const cardIdValue = String(event.card_id || "");
        if (!setId || !cardIdValue || !ns.smart || typeof ns.smart.reviewCard !== "function") return;
        if (!smartBySet[setId]) smartBySet[setId] = {};
        ns.smart.reviewCard(smartBySet[setId], cardIdValue, Number(event.payload?.rating) || 3, new Date(event.occurred_at || Date.now()), { trackEvent: false });
      } else {
        applyProgressEvent(progress, event);
      }
    });
    return {
      vocab,
      sets: buildSetsRaw(docGroups),
      progress,
      smartBySet
    };
  }

  function makeEventId(kind, cardIdValue, setId, occurredAt, suffix) {
    return [
      getClientId(),
      kind,
      cardIdValue || "",
      setId || "",
      String(occurredAt || ""),
      String(suffix || 0),
      Math.random().toString(36).slice(2, 8)
    ].join("::");
  }

  async function upsertDocs(client, rows) {
    if (!rows.length) return;
    const { error } = await client.from(DOC_TABLE).upsert(rows, { onConflict: "user_id,namespace,doc_id" });
    if (error) throw error;
  }

  async function deleteDocs(client, userId, namespace, docIds) {
    if (!docIds.length) return;
    const { error } = await client.from(DOC_TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("namespace", namespace)
      .in("doc_id", docIds);
    if (error) throw error;
  }

  // Destructive event deletion should only be used for explicit reset/import flows.
  // Normal multi-device sync must append events and never rewrite history.
  async function deleteEventsByKinds(client, userId, kinds) {
    if (!kinds.length) return;
    const { error } = await client.from(EVENT_TABLE)
      .delete()
      .eq("user_id", userId)
      .in("kind", kinds);
    if (error) throw error;
  }

  // event_id is idempotency protection: retries or duplicate devices should not
  // create duplicate review records for the same local review.
  async function insertEvents(client, rows) {
    if (!rows.length) return;
    const { error } = await client
      .from(EVENT_TABLE)
      .upsert(rows, { onConflict: "user_id,event_id", ignoreDuplicates: true });
    if (error) throw error;
  }

  async function syncVocabDoc(client, userId, currentState, previousState) {
    const currentCards = currentState?.vocab || [];
    const previousCards = previousState?.vocab || [];
    if (sameCardList(currentCards, previousCards)) return;
    const builtinCards = typeof ns.getBuiltInCards === "function" ? ns.getBuiltInCards() : [];
    if (sameCardList(currentCards, builtinCards)) {
      await deleteDocs(client, userId, DOC_NS.VOCAB, [DOC_IDS.CURRENT]);
      return;
    }
    await upsertDocs(client, [{
      user_id: userId,
      namespace: DOC_NS.VOCAB,
      doc_id: DOC_IDS.CURRENT,
      payload: { cards: stripCards(currentCards), updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString()
    }]);
  }

  async function syncCardFlags(client, userId, currentState, previousState) {
    const currentFlags = buildFlagsMap(currentState?.vocab || []);
    const previousFlags = buildFlagsMap(previousState?.vocab || []);
    const ids = new Set([...Object.keys(currentFlags), ...Object.keys(previousFlags)]);
    const upserts = [];
    const deletes = [];
    ids.forEach((id) => {
      const current = currentFlags[id] || { learn: true, practice: true, test: true };
      const previous = previousFlags[id] || { learn: true, practice: true, test: true };
      if (sameFlags(current, previous)) return;
      if (isDefaultFlags(current)) {
        deletes.push(id);
      } else {
        upserts.push({
          user_id: userId,
          namespace: DOC_NS.CARD_FLAGS,
          doc_id: id,
          payload: current,
          updated_at: new Date().toISOString()
        });
      }
    });
    await upsertDocs(client, upserts);
    await deleteDocs(client, userId, DOC_NS.CARD_FLAGS, deletes);
  }

  async function syncSets(client, userId, currentState, previousState) {
    const currentSets = getNamedSetsMap(currentState?.sets);
    const previousSets = getNamedSetsMap(previousState?.sets);
    const ids = new Set([...Object.keys(currentSets), ...Object.keys(previousSets)]);
    const upserts = [];
    const deletes = [];
    ids.forEach((id) => {
      const current = currentSets[id] || null;
      const previous = previousSets[id] || null;
      if (sameSetDoc(current, previous)) return;
      if (!current) {
        deletes.push(id);
      } else {
        upserts.push({
          user_id: userId,
          namespace: DOC_NS.SET,
          doc_id: id,
          payload: current,
          updated_at: new Date().toISOString()
        });
      }
    });
    const currentOrder = Array.isArray(currentState?.sets?.order)
      ? currentState.sets.order.filter((id) => id && id !== ns.constants.ALL_SET_ID)
      : [];
    const previousOrder = Array.isArray(previousState?.sets?.order)
      ? previousState.sets.order.filter((id) => id && id !== ns.constants.ALL_SET_ID)
      : [];
    if (JSON.stringify(currentOrder) !== JSON.stringify(previousOrder)) {
      upserts.push({
        user_id: userId,
        namespace: DOC_NS.META,
        doc_id: DOC_IDS.SET_ORDER,
        payload: { order: currentOrder },
        updated_at: new Date().toISOString()
      });
    }
    await upsertDocs(client, upserts);
    await deleteDocs(client, userId, DOC_NS.SET, deletes);
  }

  async function syncProgress(client, userId, currentState, previousState) {
    let events = [];
    try {
      events = buildProgressDiffEvents(currentState?.progress, previousState?.progress);
    } catch (error) {
      if (error?.message !== "NON_MONOTONIC_PROGRESS") throw error;
      console.warn("Refusing to destructively overwrite remote progress from a non-monotonic local state.");
      return;
    }
    if (!events.length) return;
    const nowIso = new Date().toISOString();
    const rows = events.map((event, index) => ({
      user_id: userId,
      event_id: makeEventId(event.kind, event.card_id, event.set_id, nowIso, index),
      kind: event.kind,
      card_id: event.card_id,
      set_id: event.set_id || null,
      payload: event.payload || {},
      occurred_at: nowIso
    }));
    await insertEvents(client, rows);
  }

  async function syncSmart(client, userId, currentState, previousState) {
    let events = [];
    try {
      events = buildSmartDiffEvents(currentState?.smartBySet, previousState?.smartBySet);
    } catch (error) {
      if (error?.message !== "NON_MONOTONIC_SMART") throw error;
      console.warn("Refusing to destructively overwrite remote Smart FSRS history from a non-monotonic local state.");
      return;
    }
    if (!events.length) return;
    const rows = events.map((event, index) => ({
      user_id: userId,
      event_id: event.event_id || makeEventId(event.kind, event.card_id, event.set_id, event.occurred_at, index),
      kind: event.kind,
      card_id: event.card_id,
      set_id: event.set_id || null,
      payload: event.payload || {},
      occurred_at: event.occurred_at || new Date().toISOString()
    }));
    await insertEvents(client, rows);
  }

  async function initializeClient() {
    clearSubscription();
    state.providerReady = !!getCreateClient();
    state.client = null;
    state.session = null;
    state.user = null;

    const createClient = getCreateClient();
    if (!createClient || !state.config.url || !state.config.key) {
      state.ready = true;
      return;
    }

    state.client = createClient(state.config.url, state.config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    const { data, error } = await state.client.auth.getSession();
    if (error) console.warn("Supabase getSession failed.", error);
    state.session = data?.session || null;
    state.user = state.session?.user || null;

    const subscriptionResult = state.client.auth.onAuthStateChange((event, session) => {
      state.session = session || null;
      state.user = state.session?.user || null;
      notify(event || "AUTH_STATE_CHANGE");
    });

    state.subscription = subscriptionResult?.data?.subscription || subscriptionResult?.data || subscriptionResult;
    state.ready = true;
  }

  async function init() {
    state.config = loadConfig();
    getClientId();
    await initializeClient();
    notify("READY");
    return getStatus();
  }

  async function setConfig(url, key) {
    state.config = loadConfig();
    await initializeClient();
    notify("CONFIG_UPDATED");
    return getStatus();
  }

  function getClient() {
    return state.client;
  }

  function getCacheScope() {
    return state.user?.id || "anon";
  }

  // The store talks to this adapter, not to Supabase directly. loadAppData pulls
  // remote docs/events; saveAppData writes granular diffs based on lastSnapshot.
  function getRemoteAdapter() {
    if (!state.client || !state.user) return null;
    const userId = state.user.id;
    return {
      kind: "supabase",
      async loadAppData() {
        let docs = [];
        let events = [];
        let docsError = null;
        let eventsError = null;
        try {
          const docsResult = await state.client
            .from(DOC_TABLE)
            .select("namespace, doc_id, payload, updated_at")
            .eq("user_id", userId);
          docsError = docsResult.error;
          docs = docsResult.data || [];
        } catch (error) {
          docsError = error;
        }
        try {
          const eventsResult = await state.client
            .from(EVENT_TABLE)
            .select("event_id, kind, card_id, set_id, payload, occurred_at, created_at")
            .eq("user_id", userId)
            .order("occurred_at", { ascending: true })
            .order("created_at", { ascending: true });
          eventsError = eventsResult.error;
          events = eventsResult.data || [];
        } catch (error) {
          eventsError = error;
        }
        if (docs.length || events.length) {
          return buildRemoteRawState(docs, events);
        }
        if (docsError || eventsError) {
          const relationMissing = `${docsError?.message || ""} ${eventsError?.message || ""}`.toLowerCase().includes("relation")
            || `${docsError?.details || ""} ${eventsError?.details || ""}`.toLowerCase().includes("does not exist");
          if (!relationMissing) throw docsError || eventsError;
        }
        const { data, error } = await state.client
          .from(LEGACY_TABLE)
          .select("payload")
          .eq("user_id", userId)
          .maybeSingle();
        if (error) throw error;
        return data?.payload || null;
      },
      async saveAppData(payload, previousPayload) {
        try {
          await syncVocabDoc(state.client, userId, payload, previousPayload || {});
          await syncCardFlags(state.client, userId, payload, previousPayload || {});
          await syncSets(state.client, userId, payload, previousPayload || {});
          await syncProgress(state.client, userId, payload, previousPayload || {});
          await syncSmart(state.client, userId, payload, previousPayload || {});
        } catch (error) {
          const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
          if (text.includes("relation") || text.includes("does not exist")) {
            throw new Error("Supabase sync tables are missing. Run the updated supabase_starter.sql migration first.");
          }
          throw error;
        }
      }
    };
  }

  async function signUp(email, password) {
    if (!state.client) throw new Error("Supabase is not configured yet.");
    const { data, error } = await state.client.auth.signUp({
      email: String(email || "").trim(),
      password: String(password || ""),
      options: {
        emailRedirectTo: window.location.href.split("#")[0]
      }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    if (!state.client) throw new Error("Supabase is not configured yet.");
    const { data, error } = await state.client.auth.signInWithPassword({
      email: String(email || "").trim(),
      password: String(password || "")
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    if (!state.client) return;
    const { error } = await state.client.auth.signOut();
    if (error) throw error;
  }

  function subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    state.listeners.add(listener);
    return () => state.listeners.delete(listener);
  }

  ns.auth = {
    init,
    setConfig,
    getStatus,
    getClient,
    getRemoteAdapter,
    getCacheScope,
    signUp,
    signIn,
    signOut,
    subscribe
  };
})(window.HSKFlashcards);
