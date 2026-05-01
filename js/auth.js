window.HSKFlashcards = window.HSKFlashcards || {};

/**
 * Supabase auth and remote persistence adapter.
 *
 * The browser may expose the public anon key. Actual data isolation must come
 * from Supabase Auth plus RLS policies that enforce user_id = auth.uid().
 */
(function (ns) {
  const HARDCODED_SUPABASE_URL = "https://vfivrshzlhmocjoozawx.supabase.co";
  const HARDCODED_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmaXZyc2h6bGhtb2Nqb296YXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTQwMDMsImV4cCI6MjA5Mjc5MDAwM30.DHTy3vI2aQBUSygvIhALMxdslAPItzwV7Dspv0ElE8A";

  const DOC_TABLE = "app_sync_documents";
  const EVENT_TABLE = "app_review_events";
  const SMART_EVENT_KIND = "smart_fsrs";
  const REVIEW_RESET_EVENT_KIND = "review_reset";
  const MAX_WRITE_JSON_BYTES = 60000;
  const MAX_DOC_WRITE_ROWS = 100;
  const MAX_EVENT_WRITE_ROWS = 100;
  const MAX_FILTER_URL_CHARS = 1200;
  const SELECT_PAGE_SIZE = 1000;

  const DOC_NS = { VOCAB: "vocab", CARD_FLAGS_BUNDLE: "card_flags_bundle", SET: "set", META: "meta" };
  const DOC_ID = { CURRENT: "current", SET_ORDER: "set_order", CARD_FLAGS: "current" };

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

  function codec() {
    if (!ns.syncCodec) throw new Error("Sync codec module is not loaded.");
    return ns.syncCodec;
  }

  function getCreateClient() {
    return window.supabase && typeof window.supabase.createClient === "function" ? window.supabase.createClient : null;
  }

  function clearSubscription() {
    const sub = state.subscription;
    state.subscription = null;
    if (!sub) return;
    try {
      if (typeof sub.unsubscribe === "function") sub.unsubscribe();
      if (sub.subscription && typeof sub.subscription.unsubscribe === "function") sub.subscription.unsubscribe();
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
      try { listener({ event: state.lastEvent, ...snapshot }); }
      catch (error) { console.error("Auth listener failed.", error); }
    });
  }

  function deepClone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function getClientId() {
    if (state.clientId) return state.clientId;
    state.clientId = `client_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    return state.clientId;
  }

  function toIso(value) {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function normalizeMeta(meta) {
    return ns.store && typeof ns.store.normalizeMeta === "function"
      ? ns.store.normalizeMeta(meta)
      : {
          reviewEpochId: String(meta?.reviewEpochId || "").trim(),
          reviewEpochAt: meta?.reviewEpochAt ? toIso(meta.reviewEpochAt) : null,
          reviewEpochReason: String(meta?.reviewEpochReason || "").trim()
        };
  }

  function getReviewMeta(rawState) {
    return normalizeMeta(rawState?.meta || {});
  }

  function getReviewEpochId(rawState) {
    return getReviewMeta(rawState).reviewEpochId || "";
  }

  function reviewEpochChanged(currentState, previousState) {
    return getReviewEpochId(currentState) !== getReviewEpochId(previousState);
  }

  function payloadWithEpoch(payload, epochId) {
    return epochId ? { ...(payload || {}), epochId } : { ...(payload || {}) };
  }

  function eventBelongsToEpoch(event, activeEpochId) {
    if (!activeEpochId) return event?.kind !== REVIEW_RESET_EVENT_KIND;
    return event?.kind !== REVIEW_RESET_EVENT_KIND && String(event?.payload?.epochId || "") === activeEpochId;
  }

  function compareEventOrder(a, b) {
    const aTime = new Date(a?.occurred_at || a?.created_at || 0).getTime();
    const bTime = new Date(b?.occurred_at || b?.created_at || 0).getTime();
    if (aTime !== bTime) return aTime - bTime;
    const aCreated = new Date(a?.created_at || 0).getTime();
    const bCreated = new Date(b?.created_at || 0).getTime();
    if (aCreated !== bCreated) return aCreated - bCreated;
    return String(a?.event_id || "").localeCompare(String(b?.event_id || ""));
  }

  function getLatestReviewResetMeta(eventRows) {
    let latest = null;
    [...(eventRows || [])].filter((event) => event?.kind === REVIEW_RESET_EVENT_KIND && event?.payload?.epochId)
      .sort(compareEventOrder)
      .forEach((event) => {
        latest = normalizeMeta({
          reviewEpochId: event.payload.epochId,
          reviewEpochAt: event.occurred_at || event.created_at || new Date().toISOString(),
          reviewEpochReason: event.payload.reason || "remote_reset"
        });
      });
    return latest || normalizeMeta({});
  }

  function makeReviewResetEventId(epochId) {
    return ["review_reset", String(epochId || "")].join("::");
  }

  function makeEpochScopedEventId(eventId, epochId) {
    const base = String(eventId || "");
    return epochId ? ["epoch", epochId, base].join("::") : base;
  }

  function stableStringify(value) {
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
  }

  function chunkRowsByJsonBytes(rows, maxBytes = MAX_WRITE_JSON_BYTES, maxRows = MAX_DOC_WRITE_ROWS) {
    const chunks = [];
    let current = [];
    let bytes = 2;
    (rows || []).forEach((row) => {
      const rowBytes = JSON.stringify(row).length + 1;
      if (current.length && (current.length >= maxRows || bytes + rowBytes > maxBytes)) {
        chunks.push(current);
        current = [];
        bytes = 2;
      }
      current.push(row);
      bytes += rowBytes;
    });
    if (current.length) chunks.push(current);
    return chunks;
  }

  function chunkFilterValuesByUrl(values, maxEncodedChars = MAX_FILTER_URL_CHARS) {
    const chunks = [];
    let current = [];
    let chars = 0;
    (values || []).map(String).filter(Boolean).forEach((value) => {
      const encoded = encodeURIComponent(value).length + 1;
      if (current.length && chars + encoded > maxEncodedChars) {
        chunks.push(current);
        current = [];
        chars = 0;
      }
      current.push(value);
      chars += encoded;
    });
    if (current.length) chunks.push(current);
    return chunks;
  }

  async function selectAll(builderFactory) {
    const rows = [];
    for (let from = 0; ; from += SELECT_PAGE_SIZE) {
      const result = await builderFactory().range(from, from + SELECT_PAGE_SIZE - 1);
      if (result.error) throw result.error;
      rows.push(...(result.data || []));
      if (!result.data || result.data.length < SELECT_PAGE_SIZE) break;
    }
    return rows;
  }

  async function upsertDocs(client, rows) {
    for (const chunk of chunkRowsByJsonBytes(rows || [])) {
      const { error } = await client.from(DOC_TABLE).upsert(chunk, { onConflict: "user_id,namespace,doc_id" });
      if (error) throw error;
    }
  }

  async function deleteDocs(client, userId, namespace, docIds) {
    for (const chunk of chunkFilterValuesByUrl(docIds || [])) {
      const { error } = await client.from(DOC_TABLE)
        .delete()
        .eq("user_id", userId)
        .eq("namespace", namespace)
        .in("doc_id", chunk);
      if (error) throw error;
    }
  }

  async function insertEvents(client, rows) {
    for (const chunk of chunkRowsByJsonBytes(rows || [], MAX_WRITE_JSON_BYTES, MAX_EVENT_WRITE_ROWS)) {
      const { error } = await client.from(EVENT_TABLE).upsert(chunk, { onConflict: "user_id,event_id", ignoreDuplicates: true });
      if (error) throw error;
    }
  }

  function groupDocs(rows) {
    const namespaces = {};
    (rows || []).forEach((row) => {
      if (!row || !row.namespace || row.doc_id == null) return;
      if (!namespaces[row.namespace]) namespaces[row.namespace] = {};
      namespaces[row.namespace][String(row.doc_id)] = row.payload || {};
    });
    return namespaces;
  }

  function createEmptyProgress() {
    return ns.store && typeof ns.store.createEmptyProgress === "function"
      ? ns.store.createEmptyProgress()
      : { seen: {}, practice: { translation: {}, pinyin: {} }, test: { translation: {}, pinyin: {} } };
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
    const id = String(event?.card_id || "");
    if (!id || !event.kind) return;
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

  function buildProgressDiffEvents(current, previous) {
    const events = [];
    const next = cloneProgress(current);
    const prev = cloneProgress(previous);
    Object.keys(next.seen || {}).forEach((cardId) => {
      if (next.seen[cardId] && !prev.seen?.[cardId]) events.push({ kind: "learn_seen", card_id: cardId, payload: {} });
    });
    ["practice_translation", "practice_pinyin", "test_translation", "test_pinyin"].forEach((kind) => {
      const nextBucket = getBucketByKind(next, kind) || {};
      const prevBucket = getBucketByKind(prev, kind) || {};
      const ids = new Set([...Object.keys(nextBucket), ...Object.keys(prevBucket)]);
      ids.forEach((cardId) => {
        const a = normalizeScore(nextBucket[cardId]);
        const b = normalizeScore(prevBucket[cardId]);
        const deltaShown = a.shown - b.shown;
        const deltaCorrect = a.correct - b.correct;
        const deltaWrong = a.wrong - b.wrong;
        if (deltaShown < 0 || deltaCorrect < 0 || deltaWrong < 0) throw new Error("NON_MONOTONIC_PROGRESS");
        if (deltaShown > 0 || deltaCorrect > 0 || deltaWrong > 0) {
          events.push({ kind, card_id: cardId, payload: { shown_delta: deltaShown, correct_delta: deltaCorrect, wrong_delta: deltaWrong } });
        }
      });
    });
    return events;
  }

  function buildSmartEvents(currentSmartBySet, previousSmartBySet) {
    const events = [];
    const next = deepClone(currentSmartBySet || {}) || {};
    const prev = deepClone(previousSmartBySet || {}) || {};
    Object.keys(next).forEach((setId) => {
      const nextBucket = next[setId] || {};
      const prevBucket = prev[setId] || {};
      Object.keys(nextBucket).forEach((cardId) => {
        const currentEvents = ns.smart?.normalizeReviewEvents(nextBucket[cardId]?.reviewEvents) || [];
        const previousEvents = ns.smart?.normalizeReviewEvents(prevBucket[cardId]?.reviewEvents) || [];
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
      });
    });
    return events;
  }

  function getProgressScore(progress, kind, cardId) {
    if (kind === "learn_seen") return { shown: 1, correct: 0, wrong: 0 };
    const bucket = getBucketByKind(progress || createEmptyProgress(), kind) || {};
    return normalizeScore(bucket[String(cardId)]);
  }

  function makeProgressEventId(kind, remoteCardId, payload, scoreAfter, epochId = "") {
    const prefix = [getClientId(), "progress", kind, remoteCardId];
    if (epochId) prefix.push(`epoch:${epochId}`);
    if (kind === "learn_seen") return prefix.join("::");
    return [
      ...prefix,
      `after:${scoreAfter.shown}:${scoreAfter.correct}:${scoreAfter.wrong}`,
      `delta:${payload.shown_delta || 0}:${payload.correct_delta || 0}:${payload.wrong_delta || 0}`
    ].join("::");
  }

  function buildRemoteRawState(docRows, eventRows) {
    const docs = groupDocs(docRows);
    const builtinCards = typeof ns.getBuiltInCards === "function" ? ns.getBuiltInCards() : [];
    const vocabDoc = docs[DOC_NS.VOCAB]?.[DOC_ID.CURRENT];
    const baseCards = Array.isArray(vocabDoc?.cards) && vocabDoc.cards.length ? vocabDoc.cards : builtinCards;
    const baseDb = ns.store.normalizeDb({ vocab: baseCards }, builtinCards);
    const flagsBundle = docs[DOC_NS.CARD_FLAGS_BUNDLE]?.[DOC_ID.CARD_FLAGS];
    const vocab = codec().applyFlagsBundleToVocab(baseDb.vocab || [], flagsBundle);
    const cardCodec = codec().createCardRefCodec(vocab);
    const progress = createEmptyProgress();
    const smartBySet = {};
    const meta = getLatestReviewResetMeta(eventRows);
    const activeEpochId = meta.reviewEpochId || "";

    [...(eventRows || [])]
      .sort(compareEventOrder)
      .filter((event) => eventBelongsToEpoch(event, activeEpochId))
      .forEach((event) => {
        const localCardId = cardCodec.toId(event.card_id);
        if (!localCardId) return;
        if (event.kind === SMART_EVENT_KIND) {
          const setId = String(event.set_id || "");
          if (!setId || !ns.smart || typeof ns.smart.reviewCard !== "function") return;
          if (!smartBySet[setId]) smartBySet[setId] = {};
          ns.smart.reviewCard(smartBySet[setId], localCardId, Number(event.payload?.rating) || 3, new Date(event.occurred_at || Date.now()), { trackEvent: false });
        } else {
          applyProgressEvent(progress, { ...event, card_id: localCardId });
        }
      });

    return { vocab, sets: codec().buildSetsRaw(docs, vocab, ns.constants.ALL_SET_ID), progress, smartBySet, meta };
  }

  async function loadRemoteDocs(client, userId) {
    return selectAll(() => client.from(DOC_TABLE)
      .select("namespace, doc_id, payload, updated_at")
      .eq("user_id", userId)
      .order("namespace", { ascending: true })
      .order("doc_id", { ascending: true }));
  }

  async function loadRemoteEvents(client, userId) {
    const resetRows = await selectAll(() => client.from(EVENT_TABLE)
      .select("event_id, kind, card_id, set_id, payload, occurred_at, created_at")
      .eq("user_id", userId)
      .eq("kind", REVIEW_RESET_EVENT_KIND)
      .order("occurred_at", { ascending: true })
      .order("created_at", { ascending: true }));

    const latestReset = [...resetRows]
      .filter((event) => event?.payload?.epochId)
      .sort(compareEventOrder)
      .pop() || null;

    if (!latestReset?.payload?.epochId) {
      return selectAll(() => client.from(EVENT_TABLE)
        .select("event_id, kind, card_id, set_id, payload, occurred_at, created_at")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: true })
        .order("created_at", { ascending: true }));
    }

    const activeEpochId = String(latestReset.payload.epochId);
    const activeRows = await selectAll(() => client.from(EVENT_TABLE)
      .select("event_id, kind, card_id, set_id, payload, occurred_at, created_at")
      .eq("user_id", userId)
      .neq("kind", REVIEW_RESET_EVENT_KIND)
      .eq("payload->>epochId", activeEpochId)
      .order("occurred_at", { ascending: true })
      .order("created_at", { ascending: true }));

    return [latestReset, ...activeRows];
  }

  async function syncVocabDoc(client, userId, currentState, previousState) {
    const currentCards = currentState?.vocab || [];
    const previousCards = previousState?.vocab || [];
    if (codec().sameCardList(currentCards, previousCards)) return;
    const builtinCards = typeof ns.getBuiltInCards === "function" ? ns.getBuiltInCards() : [];
    if (codec().sameCardList(currentCards, builtinCards)) {
      await deleteDocs(client, userId, DOC_NS.VOCAB, [DOC_ID.CURRENT]);
      return;
    }
    await upsertDocs(client, [{
      user_id: userId,
      namespace: DOC_NS.VOCAB,
      doc_id: DOC_ID.CURRENT,
      payload: { cards: codec().stripCards(currentCards), updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString()
    }]);
  }

  async function syncCardFlags(client, userId, currentState, previousState) {
    const currentBundle = codec().buildFlagsBundlePayload(currentState?.vocab || []);
    const previousBundle = codec().buildFlagsBundlePayload(previousState?.vocab || []);
    if (stableStringify(currentBundle) === stableStringify(previousBundle)) return;
    await upsertDocs(client, [{
      user_id: userId,
      namespace: DOC_NS.CARD_FLAGS_BUNDLE,
      doc_id: DOC_ID.CARD_FLAGS,
      payload: { ...currentBundle, updatedAt: new Date().toISOString() },
      updated_at: new Date().toISOString()
    }]);
  }

  async function syncSets(client, userId, currentState, previousState) {
    const currentSets = codec().getNamedSetsMap(currentState?.sets);
    const previousSets = codec().getNamedSetsMap(previousState?.sets);
    const ids = new Set([...Object.keys(currentSets), ...Object.keys(previousSets)]);
    const upserts = [];
    const deletes = [];
    ids.forEach((id) => {
      const current = currentSets[id] || null;
      const previous = previousSets[id] || null;
      if (codec().sameSetDoc(current, previous)) return;
      if (!current) {
        deletes.push(id);
        return;
      }
      upserts.push({
        user_id: userId,
        namespace: DOC_NS.SET,
        doc_id: id,
        payload: {
          id: current.id,
          name: current.name,
          cardRefs: codec().compactCardIdList(current.cardIds || [], currentState?.vocab || []),
          createdAt: current.createdAt,
          updatedAt: current.updatedAt,
          version: 1,
          idEncoding: "idx-v1"
        },
        updated_at: new Date().toISOString()
      });
    });

    const currentOrder = Array.isArray(currentState?.sets?.order) ? currentState.sets.order.filter((id) => id && id !== ns.constants.ALL_SET_ID) : [];
    const previousOrder = Array.isArray(previousState?.sets?.order) ? previousState.sets.order.filter((id) => id && id !== ns.constants.ALL_SET_ID) : [];
    if (JSON.stringify(currentOrder) !== JSON.stringify(previousOrder)) {
      upserts.push({ user_id: userId, namespace: DOC_NS.META, doc_id: DOC_ID.SET_ORDER, payload: { order: currentOrder }, updated_at: new Date().toISOString() });
    }
    await upsertDocs(client, upserts);
    await deleteDocs(client, userId, DOC_NS.SET, deletes);
  }

  async function syncReviewReset(client, userId, currentState, previousState) {
    const currentMeta = getReviewMeta(currentState);
    const previousMeta = getReviewMeta(previousState);
    if (!currentMeta.reviewEpochId || currentMeta.reviewEpochId === previousMeta.reviewEpochId) return;
    await insertEvents(client, [{
      user_id: userId,
      event_id: makeReviewResetEventId(currentMeta.reviewEpochId),
      kind: REVIEW_RESET_EVENT_KIND,
      card_id: "__review_epoch__",
      set_id: null,
      payload: { epochId: currentMeta.reviewEpochId, reason: currentMeta.reviewEpochReason || "reset" },
      occurred_at: currentMeta.reviewEpochAt || new Date().toISOString()
    }]);
  }

  async function syncProgress(client, userId, currentState, previousState) {
    let events = [];
    const epochId = getReviewEpochId(currentState);
    const previousProgress = reviewEpochChanged(currentState, previousState) ? createEmptyProgress() : previousState?.progress;
    try {
      events = buildProgressDiffEvents(currentState?.progress, previousProgress);
    } catch (error) {
      if (error?.message !== "NON_MONOTONIC_PROGRESS") throw error;
      console.warn("Non-monotonic progress inside the same review epoch was not synced. Use Reset progress or Import again to create a new remote review epoch.");
      return;
    }
    if (!events.length) return;
    const nowIso = new Date().toISOString();
    const cardCodec = codec().createCardRefCodec(currentState?.vocab || []);
    const rows = events.map((event) => {
      const remoteCardId = cardCodec.toRef(event.card_id);
      if (!remoteCardId) return null;
      const scoreAfter = getProgressScore(currentState?.progress, event.kind, event.card_id);
      const payload = payloadWithEpoch(event.payload || {}, epochId);
      return {
        user_id: userId,
        event_id: makeProgressEventId(event.kind, remoteCardId, payload, scoreAfter, epochId),
        kind: event.kind,
        card_id: remoteCardId,
        set_id: event.set_id || null,
        payload,
        occurred_at: nowIso
      };
    }).filter(Boolean);
    await insertEvents(client, rows);
  }

  async function syncSmart(client, userId, currentState, previousState) {
    const epochId = getReviewEpochId(currentState);
    const previousSmartBySet = reviewEpochChanged(currentState, previousState) ? {} : previousState?.smartBySet;
    const events = buildSmartEvents(currentState?.smartBySet, previousSmartBySet);
    if (!events.length) return;
    const cardCodec = codec().createCardRefCodec(currentState?.vocab || []);
    const rows = events.map((event) => {
      const remoteCardId = cardCodec.toRef(event.card_id);
      if (!remoteCardId) return null;
      return {
        user_id: userId,
        event_id: makeEpochScopedEventId(event.event_id, epochId),
        kind: event.kind,
        card_id: remoteCardId,
        set_id: event.set_id || null,
        payload: payloadWithEpoch(event.payload || {}, epochId),
        occurred_at: event.occurred_at || new Date().toISOString()
      };
    }).filter(Boolean);
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
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
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
    getClientId();
    await initializeClient();
    notify("READY");
    return getStatus();
  }
  function getClient() { return state.client; }
  function getCacheScope() { return state.user?.id || "anon"; }

  function getRemoteAdapter() {
    if (!state.client || !state.user) return null;
    const userId = state.user.id;
    return {
      kind: "supabase",
      async loadAppData() {
        const [docs, events] = await Promise.all([loadRemoteDocs(state.client, userId), loadRemoteEvents(state.client, userId)]);
        if (!docs.length && !events.length) return null;
        return buildRemoteRawState(docs, events);
      },
      async saveAppData(payload, previousPayload) {
        try {
          await syncVocabDoc(state.client, userId, payload, previousPayload || {});
          await syncCardFlags(state.client, userId, payload, previousPayload || {});
          await syncSets(state.client, userId, payload, previousPayload || {});
          await syncReviewReset(state.client, userId, payload, previousPayload || {});
          await syncProgress(state.client, userId, payload, previousPayload || {});
          await syncSmart(state.client, userId, payload, previousPayload || {});
        } catch (error) {
          const text = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
          if (text.includes("relation") || text.includes("does not exist")) {
            throw new Error("Supabase sync tables are missing. Run the current supabase_starter.sql first.");
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
      options: { emailRedirectTo: window.location.href.split("#")[0] }
    });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    if (!state.client) throw new Error("Supabase is not configured yet.");
    const { data, error } = await state.client.auth.signInWithPassword({ email: String(email || "").trim(), password: String(password || "") });
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

  ns.auth = { init, getStatus, getClient, getRemoteAdapter, getCacheScope, signUp, signIn, signOut, subscribe };
})(window.HSKFlashcards);
