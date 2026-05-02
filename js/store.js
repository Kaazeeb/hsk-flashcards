/**
 * App store and schema normalization.
 *
 * The in-memory state is still a single normalized object for UI simplicity, but
 * the persistence adapter can decompose it into granular remote documents/events.
 */
(function (ns) {
  const { MODES, PRACTICE_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, IMAGE_ALL_DECK_ID, SCHEMA_VERSION } = ns.constants;
  const { normalizeCard, cardId, createAllCardsSet, createSetRecord } = ns.utils;

  function createEmptyScoreBucket() {
    return {};
  }

  function normalizeScoreBucket(bucket) {
    const output = {};
    if (!bucket || typeof bucket !== "object") return output;
    Object.entries(bucket).forEach(([id, entry]) => {
      if (!entry || typeof entry !== "object") return;
      const correct = Math.max(0, Number(entry.correct) || 0);
      const wrong = Math.max(0, Number(entry.wrong) || 0);
      let shown = Number(entry.shown);
      if (!Number.isFinite(shown)) shown = correct + wrong;
      output[id] = { shown: Math.max(0, Math.floor(shown)), correct, wrong };
    });
    return output;
  }

  function createEmptyProgress() {
    return {
      seen: {},
      practice: {
        translation: createEmptyScoreBucket(),
        pinyin: createEmptyScoreBucket()
      }
    };
  }

  function createEmptyImageProgress() {
    return { seen: {} };
  }

  function createReviewEpochId(reason = "manual") {
    const safeReason = String(reason || "manual").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 24) || "manual";
    return [
      "epoch",
      safeReason,
      Date.now().toString(36),
      Math.random().toString(36).slice(2, 10)
    ].join("_");
  }

  function normalizeMeta(meta) {
    const reviewEpochId = String(meta?.reviewEpochId || "").trim();
    const reviewEpochAt = meta?.reviewEpochAt ? new Date(meta.reviewEpochAt) : null;
    return {
      reviewEpochId,
      reviewEpochAt: reviewEpochAt && !Number.isNaN(reviewEpochAt.getTime()) ? reviewEpochAt.toISOString() : null,
      reviewEpochReason: String(meta?.reviewEpochReason || "").trim()
    };
  }

  function bumpReviewEpoch(db, reason = "manual") {
    db.meta = normalizeMeta({
      reviewEpochId: createReviewEpochId(reason),
      reviewEpochAt: new Date().toISOString(),
      reviewEpochReason: reason
    });
    return db.meta;
  }

  function resetReviewData(db, reason = "manual") {
    db.progress = createEmptyProgress();
    db.smartBySet = {};
    db.imageProgress = createEmptyImageProgress();
    db.imageSmartByDeck = {};
    if (db.ui) {
      db.ui.indexes = { learn: 0, practice: 0 };
      db.ui.order = { learn: [], practice: [] };
      db.ui.orderType = { learn: "default", practice: "default" };
    }
    if (db.imageUi) {
      db.imageUi.index = 0;
      db.imageUi.order = [];
      db.imageUi.orderType = "default";
    }
    bumpReviewEpoch(db, reason);
  }

  function createDefaultUiState() {
    return {
      mode: "learn",
      quizType: {
        practice: "translation"
      },
      setupCollapsed: true,
      indexes: {
        learn: 0,
        practice: 0
      },
      order: {
        learn: [],
        practice: []
      },
      orderType: {
        learn: "default",
        practice: "default"
      },
      activeSetId: ALL_SET_ID,
      reviewSetId: ALL_SET_ID
    };
  }

  function normalizeUiState(ui) {
    const base = createDefaultUiState();
    return {
      mode: MODES.includes(ui?.mode) ? ui.mode : base.mode,
      quizType: {
        practice: PRACTICE_QUIZ_TYPES.includes(ui?.quizType?.practice) ? ui.quizType.practice : base.quizType.practice
      },
      setupCollapsed: ui?.setupCollapsed === undefined ? base.setupCollapsed : !!ui.setupCollapsed,
      indexes: {
        learn: Number.isInteger(ui?.indexes?.learn) ? ui.indexes.learn : 0,
        practice: Number.isInteger(ui?.indexes?.practice) ? ui.indexes.practice : 0
      },
      order: {
        learn: Array.isArray(ui?.order?.learn) ? ui.order.learn.map(String) : [],
        practice: Array.isArray(ui?.order?.practice) ? ui.order.practice.map(String) : []
      },
      orderType: {
        learn: ui?.orderType?.learn === "shuffled" ? "shuffled" : "default",
        practice: ui?.orderType?.practice === "shuffled" ? "shuffled" : "default"
      },
      activeSetId: typeof ui?.activeSetId === "string" ? ui.activeSetId : ALL_SET_ID,
      reviewSetId: typeof ui?.reviewSetId === "string" ? ui.reviewSetId : base.reviewSetId
    };
  }

  function normalizeSmartBySet(raw) {
    const output = {};
    if (!raw || typeof raw !== "object") return output;
    Object.entries(raw).forEach(([setId, bucket]) => {
      if (!bucket || typeof bucket !== "object") return;
      output[setId] = {};
      Object.entries(bucket).forEach(([id, entry]) => {
        if (!entry || typeof entry !== "object") return;
        output[setId][id] = {
          shown: Math.max(0, Math.floor(Number(entry.shown) || 0)),
          correct: Math.max(0, Math.floor(Number(entry.correct) || 0)),
          wrong: Math.max(0, Math.floor(Number(entry.wrong) || 0)),
          started: entry.started === undefined ? !!(entry.card || entry.fsrsCard) : !!entry.started,
          lastRating: [1, 2, 3, 4].includes(Number(entry.lastRating)) ? Number(entry.lastRating) : null,
          lastReviewedAt: entry.lastReviewedAt || entry.card?.last_review || entry.fsrsCard?.last_review || null,
          card: entry.card || entry.fsrsCard || null,
          reviewEvents: ns.smart && typeof ns.smart.normalizeReviewEvents === "function"
            ? ns.smart.normalizeReviewEvents(entry.reviewEvents)
            : (Array.isArray(entry.reviewEvents) ? entry.reviewEvents : [])
        };
      });
    });
    return output;
  }

  function normalizeProgress(progress) {
    const base = createEmptyProgress();
    return {
      seen: progress?.seen && typeof progress.seen === "object" ? progress.seen : base.seen,
      practice: {
        translation: normalizeScoreBucket(progress?.practice?.translation),
        pinyin: normalizeScoreBucket(progress?.practice?.pinyin)
      }
    };
  }

  function normalizeVocab(rawCards) {
    return (Array.isArray(rawCards) ? rawCards : [])
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => card.hanzi && card.pinyin && card.translation);
  }


  function normalizeImageCards(rawCards) {
    return (Array.isArray(rawCards) ? rawCards : [])
      .map((card, index) => ({
        id: String(card?.id || `image_${index + 1}`).trim(),
        index: index + 1,
        deckId: String(card?.deckId || card?.deck || ns.constants.IMAGE_DEFAULT_DECK_ID).trim() || ns.constants.IMAGE_DEFAULT_DECK_ID,
        deckName: String(card?.deckName || card?.category || ns.constants.IMAGE_DEFAULT_DECK_NAME).trim() || ns.constants.IMAGE_DEFAULT_DECK_NAME,
        imagePath: String(card?.imagePath || card?.image || card?.src || "").trim(),
        hanzi: String(card?.hanzi || "").trim(),
        pinyin: String(card?.pinyin || "").trim(),
        pinyinNumeric: String(card?.pinyinNumeric || card?.pinyin_numeric || card?.numericPinyin || "").trim(),
        translation: String(card?.translation || card?.meaning || card?.answer || "").trim(),
        prompt: String(card?.prompt || card?.translation || card?.hanzi || "").trim(),
        alt: String(card?.alt || card?.translation || card?.hanzi || "Image flashcard").trim(),
        tags: Array.isArray(card?.tags) ? card.tags.map(String) : []
      }))
      .filter((card) => card.id && card.deckId && card.imagePath && (card.hanzi || card.pinyin || card.translation));
  }

  function createDefaultImageUiState() {
    return {
      deckId: IMAGE_ALL_DECK_ID,
      mode: "learn",
      index: 0,
      order: [],
      orderType: "default"
    };
  }

  function normalizeImageUiState(ui) {
    const base = createDefaultImageUiState();
    return {
      deckId: typeof ui?.deckId === "string" ? ui.deckId : base.deckId,
      mode: ["learn", "smart"].includes(ui?.mode) ? ui.mode : base.mode,
      index: Number.isInteger(ui?.index) ? ui.index : 0,
      order: Array.isArray(ui?.order) ? ui.order.map(String) : [],
      orderType: ui?.orderType === "shuffled" ? "shuffled" : "default"
    };
  }

  function normalizeImageProgress(progress) {
    return { seen: progress?.seen && typeof progress.seen === "object" ? progress.seen : {} };
  }

  function buildAllSet(vocab) {
    return createAllCardsSet(vocab.map((card) => cardId(card)));
  }

  function normalizeSets(rawSets, vocab) {
    const validIds = new Set(vocab.map((card) => cardId(card)));
    const allSet = buildAllSet(vocab);
    const byId = { [ALL_SET_ID]: allSet };
    const rawById = rawSets?.byId && typeof rawSets.byId === "object" ? rawSets.byId : {};
    const rawOrder = Array.isArray(rawSets?.order) ? rawSets.order.map(String) : [];

    rawOrder.forEach((setId) => {
      if (setId === ALL_SET_ID) return;
      const entry = rawById[setId];
      if (!entry || typeof entry !== "object") return;
      const cardIds = [...new Set((entry.cardIds || []).map(String).filter((id) => validIds.has(id)))];
      byId[setId] = {
        id: setId,
        name: String(entry.name || setId).trim() || setId,
        cardIds,
        locked: false,
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString()
      };
    });

    const order = [ALL_SET_ID, ...Object.keys(byId).filter((id) => id !== ALL_SET_ID && rawOrder.includes(id))];
    Object.keys(byId).forEach((id) => {
      if (!order.includes(id)) order.push(id);
    });

    return { byId, order };
  }

  function pruneObjectToIds(bucket, validIds) {
    const output = {};
    Object.entries(bucket || {}).forEach(([id, value]) => {
      if (validIds.has(id)) output[id] = value;
    });
    return output;
  }

  function pruneDbToValidIds(db) {
    const validCardIds = new Set(db.vocab.map((card) => cardId(card)));
    db.progress.seen = pruneObjectToIds(db.progress.seen, validCardIds);
    db.progress.practice.translation = pruneObjectToIds(db.progress.practice.translation, validCardIds);
    db.progress.practice.pinyin = pruneObjectToIds(db.progress.practice.pinyin, validCardIds);
    db.ui.order.learn = db.ui.order.learn.filter((id) => validCardIds.has(id));
    db.ui.order.practice = db.ui.order.practice.filter((id) => validCardIds.has(id));

    Object.keys(db.smartBySet).forEach((setId) => {
      if (!db.sets.byId[setId]) {
        delete db.smartBySet[setId];
        return;
      }
      db.smartBySet[setId] = pruneObjectToIds(db.smartBySet[setId], validCardIds);
    });

    const validImageIds = new Set((db.imageCards || []).map((card) => String(card.id || "")));
    db.imageProgress.seen = pruneObjectToIds(db.imageProgress.seen, validImageIds);
    db.imageUi.order = db.imageUi.order.filter((id) => validImageIds.has(id));
    Object.keys(db.imageSmartByDeck || {}).forEach((deckId) => {
      db.imageSmartByDeck[deckId] = pruneObjectToIds(db.imageSmartByDeck[deckId], validImageIds);
    });
  }

  // All inbound data, whether imported JSON, built-in memory, or Supabase rebuild,
  // passes through this gate. It prunes invalid card ids and restores locked sets.
  function normalizeDb(raw, builtinCards, builtinImageCards = []) {
    const vocab = normalizeVocab(raw?.vocab?.length ? raw.vocab : builtinCards);
    const imageCards = normalizeImageCards(raw?.imageCards?.length ? raw.imageCards : builtinImageCards);
    const sets = normalizeSets(raw?.sets, vocab);
    const ui = normalizeUiState(raw?.ui);
    const progress = normalizeProgress(raw?.progress);
    const smartBySet = normalizeSmartBySet(raw?.smartBySet);
    const imageProgress = normalizeImageProgress(raw?.imageProgress);
    const imageSmartByDeck = normalizeSmartBySet(raw?.imageSmartByDeck);
    const imageUi = normalizeImageUiState(raw?.imageUi);
    const meta = normalizeMeta(raw?.meta);

    const db = {
      schemaVersion: SCHEMA_VERSION,
      vocab,
      sets,
      ui,
      progress,
      smartBySet,
      imageCards,
      imageProgress,
      imageSmartByDeck,
      imageUi,
      meta
    };

    if (!db.sets.byId[db.ui.activeSetId]) db.ui.activeSetId = ALL_SET_ID;
    if (db.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !db.sets.byId[db.ui.reviewSetId]) db.ui.reviewSetId = ALL_SET_ID;
    const imageDeckIds = new Set([IMAGE_ALL_DECK_ID, ...imageCards.map((card) => card.deckId)]);
    if (!imageDeckIds.has(db.imageUi.deckId)) db.imageUi.deckId = IMAGE_ALL_DECK_ID;
    pruneDbToValidIds(db);
    return db;
  }

  function cloneDb(db) {
    return JSON.parse(JSON.stringify(db));
  }

  function createAppStore(adapter, builtinCards, builtinImageCards = []) {
    const store = {
      adapter,
      state: null,

      async load() {
        const raw = await adapter.loadAppData();
        this.state = normalizeDb(raw, builtinCards, builtinImageCards);
        return this.state;
      },

      // Pull remote state while optionally keeping current UI choices. This is
      // used when returning to an open tab so another device's progress appears
      // without resetting the user's current page/mode.
      async refreshRemote({ preserveUi = true } = {}) {
        const currentUi = preserveUi ? cloneDb({ ui: this.state?.ui || createDefaultUiState() }).ui : null;
        const currentImageUi = preserveUi ? cloneDb({ imageUi: this.state?.imageUi || createDefaultImageUiState() }).imageUi : null;
        const raw = await adapter.loadAppData();
        const next = normalizeDb(raw, builtinCards, builtinImageCards);
        if (currentUi) next.ui = normalizeUiState(currentUi);
        if (currentImageUi) next.imageUi = normalizeImageUiState(currentImageUi);
        if (!next.sets.byId[next.ui.activeSetId]) next.ui.activeSetId = ALL_SET_ID;
        if (next.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !next.sets.byId[next.ui.reviewSetId]) next.ui.reviewSetId = ALL_SET_ID;
        const imageDeckIds = new Set([IMAGE_ALL_DECK_ID, ...(next.imageCards || []).map((card) => card.deckId)]);
        if (!imageDeckIds.has(next.imageUi.deckId)) next.imageUi.deckId = IMAGE_ALL_DECK_ID;
        this.state = next;
        return this.state;
      },

      async persist() {
        await this.adapter.saveAppData(this.state);
      },

      getState() {
        return this.state;
      },

      // CSV import may be an unrelated deck, so it resets dependent data unless
      // explicitly told to preserve/prune. Built-in restore has its own safer path.
      async replaceVocabulary(cards, { preserveData = false } = {}) {
        const nextVocab = normalizeVocab(cards);
        if (!preserveData) {
          this.state = normalizeDb({ vocab: nextVocab, imageCards: this.state?.imageCards || builtinImageCards }, nextVocab, builtinImageCards);
          resetReviewData(this.state, "replace_vocabulary");
        } else {
          this.state.vocab = nextVocab;
          this.state.sets = normalizeSets(this.state.sets, nextVocab);
          pruneDbToValidIds(this.state);
        }
        await this.persist();
      },

      async restoreBuiltIn() {
        const cards = normalizeVocab(builtinCards);
        const sameDeck = ns.syncCodec && typeof ns.syncCodec.sameCardList === "function"
          ? ns.syncCodec.sameCardList(this.state.vocab, cards)
          : JSON.stringify(this.state.vocab || []) === JSON.stringify(cards || []);
        this.state.vocab = cards;
        this.state.sets = normalizeSets(this.state.sets, cards);
        pruneDbToValidIds(this.state);
        if (!sameDeck) resetReviewData(this.state, "restore_builtin_vocabulary");
        await this.persist();
        return { resetProgress: !sameDeck };
      },

      async setActiveSet(setId) {
        this.state.ui.activeSetId = this.state.sets.byId[setId] ? setId : ALL_SET_ID;
        await this.persist();
      },

      async setReviewSet(setId) {
        const value = setId === REVIEW_ALL_SETS_ID || this.state.sets.byId[setId] ? setId : ALL_SET_ID;
        this.state.ui.reviewSetId = value;
        await this.persist();
      },

      // Sets define review scope only. Smart FSRS state is per set and card, and
      // a card enters that set's FSRS bucket only after its first Smart review.
      async saveNamedSet(name, cardIds) {
        const trimmed = String(name || "").trim();
        if (!trimmed) return null;
        const normalizedIds = [...new Set((cardIds || []).map(String))];
        const existing = Object.values(this.state.sets.byId).find((set) => !set.locked && set.name.trim().toLowerCase() === trimmed.toLowerCase());
        const now = new Date().toISOString();
        if (existing) {
          existing.cardIds = normalizedIds;
          existing.updatedAt = now;
          existing.name = trimmed;
          this.state.sets.byId[existing.id] = existing;
          await this.setActiveSet(existing.id);
          return existing;
        }
        let record = createSetRecord(trimmed, normalizedIds);
        let suffix = 2;
        while (this.state.sets.byId[record.id]) {
          record.id = `${createSetRecord(trimmed, normalizedIds).id}-${suffix}`;
          suffix += 1;
        }
        record.updatedAt = now;
        this.state.sets.byId[record.id] = record;
        this.state.sets.order.push(record.id);
        this.state.ui.activeSetId = record.id;
        await this.persist();
        return record;
      },

      async updateSetCards(setId, cardIds) {
        const record = this.state.sets.byId[setId];
        if (!record || record.locked) return null;
        const validIds = new Set(this.state.vocab.map((card) => cardId(card)));
        const normalizedIds = [...new Set((cardIds || []).map(String).filter((id) => validIds.has(id)))];
        record.cardIds = normalizedIds;
        record.updatedAt = new Date().toISOString();
        this.state.sets.byId[setId] = record;
        await this.persist();
        return record;
      },

      async addCardsToSet(setId, cardIds) {
        const record = this.state.sets.byId[setId];
        if (!record || record.locked) return null;
        const merged = [...new Set([...(record.cardIds || []), ...(cardIds || []).map(String)])];
        return this.updateSetCards(setId, merged);
      },

      async removeCardsFromSet(setId, cardIds) {
        const record = this.state.sets.byId[setId];
        if (!record || record.locked) return null;
        const remove = new Set((cardIds || []).map(String));
        return this.updateSetCards(setId, (record.cardIds || []).filter((id) => !remove.has(String(id))));
      },

      async deleteSet(setId) {
        const record = this.state.sets.byId[setId];
        if (!record || record.locked) return false;
        delete this.state.sets.byId[setId];
        this.state.sets.order = this.state.sets.order.filter((id) => id !== setId);
        delete this.state.smartBySet[setId];
        if (this.state.ui.activeSetId === setId) this.state.ui.activeSetId = ALL_SET_ID;
        if (this.state.ui.reviewSetId === setId) this.state.ui.reviewSetId = ALL_SET_ID;
        await this.persist();
        return true;
      },

      ensureSmartSet(setId) {
        if (!this.state.smartBySet[setId]) this.state.smartBySet[setId] = {};
        return this.state.smartBySet[setId];
      },

      ensureImageSmartDeck(deckId) {
        const id = String(deckId || IMAGE_ALL_DECK_ID);
        if (!this.state.imageSmartByDeck[id]) this.state.imageSmartByDeck[id] = {};
        return this.state.imageSmartByDeck[id];
      },

      exportJson() {
        return JSON.stringify({
          app: "hsk_flashcards",
          schemaVersion: SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          data: this.state
        }, null, 2);
      },

      async importJson(text) {
        const parsed = JSON.parse(String(text || ""));
        this.state = normalizeDb(parsed?.data || parsed, builtinCards, builtinImageCards);
        bumpReviewEpoch(this.state, "import_json");
        await this.persist();
      },

      async resetProgress(reason = "manual_reset") {
        resetReviewData(this.state, reason);
        await this.persist();
      },

      async update(mutator) {
        const next = mutator(this.state) || this.state;
        this.state = next;
        await this.persist();
      },

      snapshot() {
        return cloneDb(this.state);
      }
    };

    return store;
  }

  ns.store = {
    createAppStore,
    createEmptyProgress,
    createEmptyImageProgress,
    normalizeDb,
    normalizeMeta,
    bumpReviewEpoch,
    resetReviewData
  };
})(window.HSKFlashcards);
