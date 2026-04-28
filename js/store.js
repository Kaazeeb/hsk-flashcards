/**
 * App store and schema normalization.
 *
 * The in-memory state is still a single normalized object for UI simplicity, but
 * the persistence adapter can decompose it into granular remote documents/events.
 */
(function (ns) {
  const { MODES, PRACTICE_QUIZ_TYPES, TEST_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, SCHEMA_VERSION } = ns.constants;
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
      },
      test: {
        translation: createEmptyScoreBucket(),
        pinyin: createEmptyScoreBucket()
      }
    };
  }

  function createDefaultUiState() {
    return {
      mode: "learn",
      quizType: {
        practice: "translation",
        test: "translation"
      },
      setupCollapsed: true,
      indexes: {
        learn: 0,
        practice: 0,
        test: 0
      },
      order: {
        learn: [],
        practice: [],
        test: []
      },
      orderType: {
        learn: "default",
        practice: "default",
        test: "default"
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
        practice: PRACTICE_QUIZ_TYPES.includes(ui?.quizType?.practice) ? ui.quizType.practice : base.quizType.practice,
        test: TEST_QUIZ_TYPES.includes(ui?.quizType?.test) ? ui.quizType.test : base.quizType.test
      },
      setupCollapsed: ui?.setupCollapsed === undefined ? base.setupCollapsed : !!ui.setupCollapsed,
      indexes: {
        learn: Number.isInteger(ui?.indexes?.learn) ? ui.indexes.learn : 0,
        practice: Number.isInteger(ui?.indexes?.practice) ? ui.indexes.practice : 0,
        test: Number.isInteger(ui?.indexes?.test) ? ui.indexes.test : 0
      },
      order: {
        learn: Array.isArray(ui?.order?.learn) ? ui.order.learn.map(String) : [],
        practice: Array.isArray(ui?.order?.practice) ? ui.order.practice.map(String) : [],
        test: Array.isArray(ui?.order?.test) ? ui.order.test.map(String) : []
      },
      orderType: {
        learn: ui?.orderType?.learn === "shuffled" ? "shuffled" : "default",
        practice: ui?.orderType?.practice === "shuffled" ? "shuffled" : "default",
        test: ui?.orderType?.test === "shuffled" ? "shuffled" : "default"
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
      },
      test: {
        translation: normalizeScoreBucket(progress?.test?.translation),
        pinyin: normalizeScoreBucket(progress?.test?.pinyin)
      }
    };
  }

  function normalizeVocab(rawCards) {
    return (Array.isArray(rawCards) ? rawCards : [])
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => card.hanzi && card.pinyin && card.translation);
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
    db.progress.test.translation = pruneObjectToIds(db.progress.test.translation, validCardIds);
    db.progress.test.pinyin = pruneObjectToIds(db.progress.test.pinyin, validCardIds);

    db.ui.order.learn = db.ui.order.learn.filter((id) => validCardIds.has(id));
    db.ui.order.practice = db.ui.order.practice.filter((id) => validCardIds.has(id));
    db.ui.order.test = db.ui.order.test.filter((id) => validCardIds.has(id));

    Object.keys(db.smartBySet).forEach((setId) => {
      if (!db.sets.byId[setId]) {
        delete db.smartBySet[setId];
        return;
      }
      db.smartBySet[setId] = pruneObjectToIds(db.smartBySet[setId], validCardIds);
    });
  }

  // All inbound data, whether local cache, imported JSON, or Supabase rebuild,
  // passes through this gate. It prunes invalid card ids and restores locked sets.
  function normalizeDb(raw, builtinCards) {
    const vocab = normalizeVocab(raw?.vocab?.length ? raw.vocab : builtinCards);
    const sets = normalizeSets(raw?.sets, vocab);
    const ui = normalizeUiState(raw?.ui);
    const progress = normalizeProgress(raw?.progress);
    const smartBySet = normalizeSmartBySet(raw?.smartBySet);

    const db = {
      schemaVersion: SCHEMA_VERSION,
      vocab,
      sets,
      ui,
      progress,
      smartBySet
    };

    if (!db.sets.byId[db.ui.activeSetId]) db.ui.activeSetId = ALL_SET_ID;
    if (db.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !db.sets.byId[db.ui.reviewSetId]) db.ui.reviewSetId = ALL_SET_ID;
    pruneDbToValidIds(db);
    return db;
  }

  function cloneDb(db) {
    return JSON.parse(JSON.stringify(db));
  }

  function createAppStore(adapter, builtinCards) {
    const store = {
      adapter,
      state: null,

      async load() {
        const raw = await adapter.loadAppData();
        this.state = normalizeDb(raw, builtinCards);
        return this.state;
      },

      // Pull remote state while optionally keeping current UI choices. This is
      // used when returning to an open tab so another device's progress appears
      // without resetting the user's current page/mode.
      async refreshRemote({ preserveUi = true } = {}) {
        const currentUi = preserveUi ? cloneDb({ ui: this.state?.ui || createDefaultUiState() }).ui : null;
        const raw = await adapter.loadAppData();
        const next = normalizeDb(raw, builtinCards);
        if (currentUi) next.ui = normalizeUiState(currentUi);
        if (!next.sets.byId[next.ui.activeSetId]) next.ui.activeSetId = ALL_SET_ID;
        if (next.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !next.sets.byId[next.ui.reviewSetId]) next.ui.reviewSetId = ALL_SET_ID;
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
          this.state = normalizeDb({ vocab: nextVocab }, nextVocab);
        } else {
          this.state.vocab = nextVocab;
          this.state.sets = normalizeSets(this.state.sets, nextVocab);
          pruneDbToValidIds(this.state);
        }
        await this.persist();
      },

      async restoreBuiltIn() {
        const cards = normalizeVocab(builtinCards);
        this.state.vocab = cards;
        this.state.sets = normalizeSets(this.state.sets, cards);
        pruneDbToValidIds(this.state);
        await this.persist();
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
        this.state = normalizeDb(parsed?.data || parsed, builtinCards);
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
    normalizeDb
  };
})(window.HSKFlashcards);
