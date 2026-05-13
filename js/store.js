/**
 * App store and schema normalization.
 *
 * The in-memory state is still a single normalized object for UI simplicity, but
 * the persistence adapter can decompose it into granular remote documents/events.
 */
(function (ns) {
  const { MODES, PRACTICE_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, IMAGE_ALL_DECK_ID, SENTENCE_ALL_DECK_ID, SCHEMA_VERSION } = ns.constants;
  const { normalizeCard, cardId, createAllCardsSet } = ns.utils;

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

  function normalizeIdList(ids) {
    const seen = new Set();
    const output = [];
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      const value = String(id || "").trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      output.push(value);
    });
    return output;
  }

  function buildVisibilityDeckIdMap(vocab, sentenceCards) {
    const byDeck = { [ALL_SET_ID]: normalizeIdList((Array.isArray(vocab) ? vocab : []).map((card) => cardId(card))) };
    (Array.isArray(sentenceCards) ? sentenceCards : []).forEach((card) => {
      const deckId = String(card?.deckId || "").trim();
      const id = String(card?.id || "").trim();
      if (!deckId || !id) return;
      if (!byDeck[deckId]) byDeck[deckId] = [];
      byDeck[deckId].push(id);
    });
    Object.keys(byDeck).forEach((deckId) => { byDeck[deckId] = normalizeIdList(byDeck[deckId]); });
    return byDeck;
  }

  function normalizeBuiltinVisibility(raw, deckIdMap = {}) {
    if (ns.visibilityBits && typeof ns.visibilityBits.normalizeVisibility === "function") {
      return ns.visibilityBits.normalizeVisibility(raw, deckIdMap);
    }
    return { version: 46, byDeck: {} };
  }

  function getDeckVisibility() {
    // Deck-level visibility is intentionally unused. Visibility is per card/mode.
    return { learn: true, practice: true };
  }

  function getBuiltinCardVisibility(visibility, deckId, cardId) {
    if (ns.visibilityBits && typeof ns.visibilityBits.getCardVisibility === "function") {
      return ns.visibilityBits.getCardVisibility(visibility, deckId, cardId);
    }
    return { learn: true, practice: true };
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
    db.sentenceSmartByDeck = {};
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

  function normalizeSentenceCards(rawCards) {
    const directions = ["zh_to_en", "en_to_zh", "zh_qa", "hanzi_to_pinyin", "measure_word", "stroke_sequence"];
    return (Array.isArray(rawCards) ? rawCards : [])
      .map((card, index) => {
        const direction = directions.includes(String(card?.direction || "")) ? String(card.direction) : "zh_to_en";
        return {
          id: String(card?.id || `sentence_${index + 1}`).trim(),
          index: index + 1,
          cardKind: card?.cardKind === "study" ? "study" : "sentence",
          level: Math.max(0, Math.min(9, Math.floor(Number(card?.level) || 0))),
          direction,
          deckId: String(card?.deckId || card?.deck || ns.constants.SENTENCE_DEFAULT_DECK_ID).trim() || ns.constants.SENTENCE_DEFAULT_DECK_ID,
          deckName: String(card?.deckName || card?.category || ns.constants.SENTENCE_DEFAULT_DECK_NAME).trim() || ns.constants.SENTENCE_DEFAULT_DECK_NAME,
          front: String(card?.front || card?.prompt || "").trim(),
          back: String(card?.back || card?.answer || "").trim(),
          chinese: String(card?.chinese || card?.hanzi || "").trim(),
          english: String(card?.english || card?.translation || "").trim(),
          pinyin: String(card?.pinyin || "").trim(),
          pinyinNumeric: String(card?.pinyinNumeric || card?.pinyin_numeric || card?.numericPinyin || "").trim(),
          strokeSourceChar: String(card?.strokeSourceChar || card?.chinese || "").trim(),
          strokeAnswer: String(card?.strokeAnswer || "").trim(),
          strokeLegend: String(card?.strokeLegend || "").trim(),
          strokeTypes: card?.strokeTypes && typeof card.strokeTypes === "object" ? card.strokeTypes : null,
          answerMode: String(card?.answerMode || (direction === "zh_qa" ? "zh_answer" : "")).trim(),
          grammarTags: Array.isArray(card?.grammarTags) ? card.grammarTags.map(String) : [],
          tags: Array.isArray(card?.tags) ? card.tags.map(String) : []
        };
      })
      .filter((card) => card.id && card.deckId && card.front && card.back && card.chinese && (card.direction === "zh_qa" || card.direction === "stroke_sequence" || card.english));
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
    return {
      byId: { [ALL_SET_ID]: buildAllSet(vocab) },
      order: [ALL_SET_ID]
    };
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
    const validSentenceIds = new Set((db.sentenceCards || []).map((card) => String(card.id || "")));
    const validStudyIds = new Set([...validCardIds, ...validSentenceIds]);
    db.progress.seen = pruneObjectToIds(db.progress.seen, validStudyIds);
    db.progress.practice.translation = pruneObjectToIds(db.progress.practice.translation, validCardIds);
    db.progress.practice.pinyin = pruneObjectToIds(db.progress.practice.pinyin, validCardIds);
    db.ui.order.learn = db.ui.order.learn.filter((id) => validStudyIds.has(id));
    db.ui.order.practice = db.ui.order.practice.filter((id) => validStudyIds.has(id));

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

    Object.keys(db.sentenceSmartByDeck || {}).forEach((deckId) => {
      db.sentenceSmartByDeck[deckId] = pruneObjectToIds(db.sentenceSmartByDeck[deckId], validSentenceIds);
    });
  }

  // All card catalogs are standard app content. Remote data may still carry legacy
  // custom vocab/image/sentence docs, but v46 ignores those definitions and only
  // applies user progress plus per-card Learn/Practice visibility flags.
  function normalizeDb(raw, builtinCards, builtinImageCards = [], builtinSentenceCards = []) {
    const vocab = normalizeVocab(builtinCards);
    const imageCards = normalizeImageCards(builtinImageCards);
    const sentenceCards = normalizeSentenceCards(builtinSentenceCards);
    const sets = normalizeSets(raw?.sets, vocab);
    const ui = normalizeUiState(raw?.ui);
    const progress = normalizeProgress(raw?.progress);
    const smartBySet = normalizeSmartBySet(raw?.smartBySet);
    const imageProgress = normalizeImageProgress(raw?.imageProgress);
    const imageSmartByDeck = normalizeSmartBySet(raw?.imageSmartByDeck);
    const sentenceSmartByDeck = normalizeSmartBySet(raw?.sentenceSmartByDeck);
    const imageUi = normalizeImageUiState(raw?.imageUi);
    const meta = normalizeMeta(raw?.meta);
    const visibilityDeckIds = buildVisibilityDeckIdMap(vocab, sentenceCards);
    const builtinVisibility = normalizeBuiltinVisibility(raw?.builtinVisibility, visibilityDeckIds);

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
      sentenceCards,
      sentenceSmartByDeck,
      imageUi,
      meta,
      builtinVisibility
    };

    if (!db.sets.byId[db.ui.activeSetId]) db.ui.activeSetId = ALL_SET_ID;
    const sentenceDeckIds = new Set([SENTENCE_ALL_DECK_ID, ...sentenceCards.map((card) => String(card.deckId || ""))]);
    if (db.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !db.sets.byId[db.ui.reviewSetId] && !sentenceDeckIds.has(db.ui.reviewSetId)) db.ui.reviewSetId = ALL_SET_ID;
    const imageDeckIds = new Set([IMAGE_ALL_DECK_ID, ...imageCards.map((card) => card.deckId)]);
    if (!imageDeckIds.has(db.imageUi.deckId)) db.imageUi.deckId = IMAGE_ALL_DECK_ID;
    pruneDbToValidIds(db);
    return db;
  }

  function cloneDb(db) {
    return JSON.parse(JSON.stringify(db));
  }

  function buildVisibilityMutationForMode(state, deckId, mode, fallbackIds = []) {
    const id = String(deckId || "").trim();
    if (!id || !MODES.includes(mode) || !ns.visibilityBits) return null;

    let cardIds = normalizeIdList(fallbackIds);
    if (!state.builtinVisibility?._deckIdMap || !state.builtinVisibility?._indexByDeck) {
      const deckIdMap = buildVisibilityDeckIdMap(state.vocab, state.sentenceCards);
      state.builtinVisibility = normalizeBuiltinVisibility(state.builtinVisibility, deckIdMap);
      if (!cardIds.length) cardIds = deckIdMap[id] || [];
    } else if (!cardIds.length) {
      cardIds = state.builtinVisibility._deckIdMap[id] || [];
    }

    const row = typeof ns.visibilityBits.buildModeRow === "function"
      ? ns.visibilityBits.buildModeRow(state.builtinVisibility, id, mode, cardIds)
      : null;
    if (row) return row;
    return typeof ns.visibilityBits.buildModeDeleteRow === "function"
      ? ns.visibilityBits.buildModeDeleteRow(id, mode)
      : null;
  }

  function createAppStore(adapter, builtinCards, builtinImageCards = [], builtinSentenceCards = []) {
    const store = {
      adapter,
      state: null,

      async load() {
        const raw = await adapter.loadAppData();
        this.state = normalizeDb(raw, builtinCards, builtinImageCards, builtinSentenceCards);
        return this.state;
      },

      // Pull remote state while optionally keeping current UI choices. This is
      // used when returning to an open tab so another device's progress appears
      // without resetting the user's current page/mode.
      async refreshRemote({ preserveUi = true } = {}) {
        const currentUi = preserveUi ? cloneDb({ ui: this.state?.ui || createDefaultUiState() }).ui : null;
        const currentImageUi = preserveUi ? cloneDb({ imageUi: this.state?.imageUi || createDefaultImageUiState() }).imageUi : null;
        const raw = await adapter.loadAppData();
        const next = normalizeDb(raw, builtinCards, builtinImageCards, builtinSentenceCards);
        if (currentUi) next.ui = normalizeUiState(currentUi);
        if (currentImageUi) next.imageUi = normalizeImageUiState(currentImageUi);
        if (!next.sets.byId[next.ui.activeSetId]) next.ui.activeSetId = ALL_SET_ID;
        const sentenceDeckIds = new Set([SENTENCE_ALL_DECK_ID, ...((next.sentenceCards || []).map((card) => String(card.deckId || "")))]);
        if (next.ui.reviewSetId !== REVIEW_ALL_SETS_ID && !next.sets.byId[next.ui.reviewSetId] && !sentenceDeckIds.has(next.ui.reviewSetId)) next.ui.reviewSetId = ALL_SET_ID;
        const imageDeckIds = new Set([IMAGE_ALL_DECK_ID, ...(next.imageCards || []).map((card) => card.deckId)]);
        if (!imageDeckIds.has(next.imageUi.deckId)) next.imageUi.deckId = IMAGE_ALL_DECK_ID;
        this.state = next;
        return this.state;
      },

      async persist() {
        await this.adapter.saveAppData(this.state);
      },

      async saveVisibilityMode(deckId, mode, fallbackIds = []) {
        const mutation = buildVisibilityMutationForMode(this.state, deckId, mode, fallbackIds);
        if (!mutation) return false;
        if (this.adapter && typeof this.adapter.saveVisibilityRows === "function") {
          await this.adapter.saveVisibilityRows([mutation]);
          return true;
        }
        return false;
      },

      getState() {
        return this.state;
      },

      // User-created/imported card catalogs are disabled in v46. Keep these API
      // stubs so old call sites or browser console calls cannot mutate the deck.
      async replaceVocabulary() { return false; },
      async restoreBuiltIn() { return { resetProgress: false, disabled: true }; },

      async setActiveSet(setId) {
        this.state.ui.activeSetId = this.state.sets.byId[setId] ? setId : ALL_SET_ID;
        await this.persist();
      },

      async setReviewSet(setId) {
        const sentenceDeckIds = new Set([SENTENCE_ALL_DECK_ID, ...((this.state.sentenceCards || []).map((card) => String(card.deckId || "")))]);
        const value = setId === REVIEW_ALL_SETS_ID || this.state.sets.byId[setId] || sentenceDeckIds.has(setId) ? setId : ALL_SET_ID;
        this.state.ui.reviewSetId = value;
        await this.persist();
      },

      async setBuiltInDeckVisibility(deckId, flags) {
        const id = String(deckId || "").trim();
        if (!id || !ns.visibilityBits) return false;
        const deckIdMap = buildVisibilityDeckIdMap(this.state.vocab, this.state.sentenceCards);
        const cardIds = deckIdMap[id] || [];
        this.state.builtinVisibility = normalizeBuiltinVisibility(this.state.builtinVisibility, deckIdMap);
        let changed = false;
        MODES.forEach((mode) => {
          if (flags?.[mode] === undefined) return;
          changed = ns.visibilityBits.setModeDefault(this.state.builtinVisibility, id, mode, flags[mode] !== false, cardIds) || changed;
        });
        if (!changed) return false;
        await Promise.all(MODES
          .filter((mode) => flags?.[mode] !== undefined)
          .map((mode) => this.saveVisibilityMode(id, mode)));
        return true;
      },

      async setBuiltInCardVisibility(deckId, cardId, flags) {
        const id = String(deckId || "").trim();
        const localCardId = String(cardId || "").trim();
        if (!id || !localCardId || !ns.visibilityBits) return false;
        const deckIdMap = buildVisibilityDeckIdMap(this.state.vocab, this.state.sentenceCards);
        const cardIds = deckIdMap[id] || [];
        this.state.builtinVisibility = normalizeBuiltinVisibility(this.state.builtinVisibility, deckIdMap);
        let changed = false;
        MODES.forEach((mode) => {
          if (flags?.[mode] === undefined) return;
          changed = ns.visibilityBits.setCardMode(this.state.builtinVisibility, id, localCardId, mode, flags[mode] !== false, cardIds) || changed;
        });
        if (!changed) return false;
        await Promise.all(MODES
          .filter((mode) => flags?.[mode] !== undefined)
          .map((mode) => this.saveVisibilityMode(id, mode)));
        return true;
      },

      // Custom user-created sets are intentionally disabled. The standard
      // vocabulary scope is All cards; visibility is controlled per card via
      // Learn/Practice flags in Setup.
      async saveNamedSet() { return null; },
      async updateSetCards() { return null; },
      async addCardsToSet() { return null; },
      async removeCardsFromSet() { return null; },
      async deleteSet() { return false; },

      ensureSmartSet(setId) {
        if (!this.state.smartBySet[setId]) this.state.smartBySet[setId] = {};
        return this.state.smartBySet[setId];
      },

      ensureImageSmartDeck(deckId) {
        const id = String(deckId || IMAGE_ALL_DECK_ID);
        if (!this.state.imageSmartByDeck[id]) this.state.imageSmartByDeck[id] = {};
        return this.state.imageSmartByDeck[id];
      },

      ensureSentenceSmartDeck(deckId) {
        const id = String(deckId || SENTENCE_ALL_DECK_ID);
        if (!this.state.sentenceSmartByDeck[id]) this.state.sentenceSmartByDeck[id] = {};
        return this.state.sentenceSmartByDeck[id];
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
    resetReviewData,
    normalizeBuiltinVisibility,
    getDeckVisibility,
    getBuiltinCardVisibility
  };
})(window.HSKFlashcards);
