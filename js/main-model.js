/**
 * Main UI split: Card scopes, Smart queues, and progress statistics.
 */
(function (ns) {
  const runtime = ns.mainRuntime = ns.mainRuntime || {};
  const proxy = (name) => (...args) => {
    const fn = runtime[name];
    if (typeof fn !== "function") throw new Error(`Main runtime function not loaded: ${name}`);
    return fn(...args);
  };
  const { MODES, PRACTICE_QUIZ_TYPES, TEST_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, SENTENCE_ALL_DECK_ID, SMART_RATINGS, normalizeCard, cardId, clamp, shuffle, parseCSV, mapRowsToCards, parseRangeInput, formatReviewDateLabel, formatLongDate, hashStringToUnitInterval, getLocalDayStamp, checkPinyinAnswer, getReviewPinyinText, shouldAutoFocusPinyinInput, getPinyinInputPlaceholder, getPinyinDisplay, createPersistenceAdapter, createAppStore, createButton, clearNode, setBar, updateResult, scheduleStudyAreaFocus, smart, state } = runtime;
  const createSmartSessionSeed = proxy("createSmartSessionSeed");
  const createEmptyRound = proxy("createEmptyRound");
  const getElements = proxy("getElements");
  const getDb = proxy("getDb");
  const persist = proxy("persist");
  const getUi = proxy("getUi");
  const getAuthStatus = proxy("getAuthStatus");
  const setAuthMessage = proxy("setAuthMessage");
  const updateStorageModeBadge = proxy("updateStorageModeBadge");
  const syncStoreToAuthScope = proxy("syncStoreToAuthScope");
  const refreshRemoteState = proxy("refreshRemoteState");
  const renderAuthPanel = proxy("renderAuthPanel");
  const ensureCurrentPageAllowed = proxy("ensureCurrentPageAllowed");
  const setPage = proxy("setPage");
  const renderPageShell = proxy("renderPageShell");
  const getAuthCredentials = proxy("getAuthCredentials");
  const handleAuthSignUp = proxy("handleAuthSignUp");
  const handleAuthSignIn = proxy("handleAuthSignIn");
  const handleAuthSignOut = proxy("handleAuthSignOut");
  const handleAuthStateChange = proxy("handleAuthStateChange");
  const updateModeButtons = proxy("updateModeButtons");
  const renderStats = proxy("renderStats");
  const getEditModeIds = proxy("getEditModeIds");
  const renderSelectionSummary = proxy("renderSelectionSummary");
  const renderOrderStatus = proxy("renderOrderStatus");
  const renderSetupPanel = proxy("renderSetupPanel");
  const getFilteredManageCards = proxy("getFilteredManageCards");
  const renderManageList = proxy("renderManageList");
  const renderManageListIfNeeded = proxy("renderManageListIfNeeded");
  const renderScheduleRows = proxy("renderScheduleRows");
  const renderReviewScopePanel = proxy("renderReviewScopePanel");
  const appendScheduleChips = proxy("appendScheduleChips");
  const makeSetScheduleRow = proxy("makeSetScheduleRow");
  const renderSetPanel = proxy("renderSetPanel");
  const renderCurrentCardStats = proxy("renderCurrentCardStats");
  const clearCard = proxy("clearCard");
  const setPositionLabel = proxy("setPositionLabel");
  const setSmartPositionLabel = proxy("setSmartPositionLabel");
  const buildTranslationOptionsForCard = proxy("buildTranslationOptionsForCard");
  const updateTranslationSelectionUI = proxy("updateTranslationSelectionUI");
  const selectTranslationOption = proxy("selectTranslationOption");
  const moveTranslationSelection = proxy("moveTranslationSelection");
  const answerTranslation = proxy("answerTranslation");
  const retryPinyinWithoutPenalty = proxy("retryPinyinWithoutPenalty");
  const acceptPendingPinyinWrong = proxy("acceptPendingPinyinWrong");
  const submitPinyinAnswer = proxy("submitPinyinAnswer");
  const retrySmartPinyinWithoutPenalty = proxy("retrySmartPinyinWithoutPenalty");
  const acceptPendingSmartPinyinWrong = proxy("acceptPendingSmartPinyinWrong");
  const submitSmartPinyinAnswer = proxy("submitSmartPinyinAnswer");
  const setSmartRating = proxy("setSmartRating");
  const updateSmartRatingUI = proxy("updateSmartRatingUI");
  const moveSmartRatingSelection = proxy("moveSmartRatingSelection");
  const acceptSmartFsrsFeedback = proxy("acceptSmartFsrsFeedback");
  const answerSmartTranslation = proxy("answerSmartTranslation");
  const moveInOrderedMode = proxy("moveInOrderedMode");
  const nextCard = proxy("nextCard");
  const prevCard = proxy("prevCard");
  const startSmartForSet = proxy("startSmartForSet");
  const startDueReviewCards = proxy("startDueReviewCards");
  const startNewCardIntroduction = proxy("startNewCardIntroduction");
  const startNextNewSmartCard = proxy("startNextNewSmartCard");
  const nextSmartCard = proxy("nextSmartCard");
  const renderLearn = proxy("renderLearn");
  const renderTranslationButtons = proxy("renderTranslationButtons");
  const renderTranslationQuiz = proxy("renderTranslationQuiz");
  const renderPinyinQuiz = proxy("renderPinyinQuiz");
  const introduceCurrentSmartCard = proxy("introduceCurrentSmartCard");
  const renderSmartIntroduction = proxy("renderSmartIntroduction");
  const renderSmartPractice = proxy("renderSmartPractice");
  const renderSmartBlocked = proxy("renderSmartBlocked");
  const render = proxy("render");
  const setMode = proxy("setMode");
  const setQuizTypeForCurrentMode = proxy("setQuizTypeForCurrentMode");
  const shuffleCurrentMode = proxy("shuffleCurrentMode");
  const resetCurrentModeOrder = proxy("resetCurrentModeOrder");
  const updateCardMode = proxy("updateCardMode");
  const applyRangeToMode = proxy("applyRangeToMode");
  const setAllForMode = proxy("setAllForMode");
  const handleSaveVocabulary = proxy("handleSaveVocabulary");
  const handleRestoreBuiltIn = proxy("handleRestoreBuiltIn");
  const handleResetProgress = proxy("handleResetProgress");
  const triggerTextDownload = proxy("triggerTextDownload");
  const handleExportApp = proxy("handleExportApp");
  const handleImportAppClick = proxy("handleImportAppClick");
  const handleImportAppFile = proxy("handleImportAppFile");
  const handleSaveNamedSet = proxy("handleSaveNamedSet");
  const getCardsFromSetRangeInput = proxy("getCardsFromSetRangeInput");
  const handleSetRangeAction = proxy("handleSetRangeAction");
  const handleDeleteSelectedSet = proxy("handleDeleteSelectedSet");
  const handleSetChange = proxy("handleSetChange");
  const handleReviewSetChange = proxy("handleReviewSetChange");
  const handleManageListChange = proxy("handleManageListChange");
  const handleRangeButtonClick = proxy("handleRangeButtonClick");
  const handleTranslationKeyboard = proxy("handleTranslationKeyboard");
  const handlePinyinKeyboard = proxy("handlePinyinKeyboard");
  const toggleSetupPanel = proxy("toggleSetupPanel");
  const bindEvents = proxy("bindEvents");
  const bootstrap = proxy("bootstrap");

  function resetRoundState() {
    state.round = createEmptyRound();
  }

  function markManageListDirty() {
    state.manageListDirty = true;
  }

  function getActiveSet() {
    const db = getDb();
    return db.sets.byId[db.ui.activeSetId] || db.sets.byId[ALL_SET_ID];
  }

  function getNamedSets() {
    const db = getDb();
    return db.sets.order
      .map((id) => db.sets.byId[id])
      .filter((setRecord) => setRecord && !setRecord.locked);
  }

  function getSentenceDecks() {
    const groups = new Map();
    (getDb().sentenceCards || []).forEach((card) => {
      const deckId = String(card.deckId || "");
      if (!deckId) return;
      if (!groups.has(deckId)) {
        groups.set(deckId, {
          id: deckId,
          name: card.deckName || deckId,
          kind: "sentence",
          locked: true,
          cardIds: []
        });
      }
      groups.get(deckId).cardIds.push(card.id);
    });
    return [...groups.values()].sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  function getSentenceAllDeck() {
    const decks = getSentenceDecks();
    return {
      id: SENTENCE_ALL_DECK_ID,
      name: "All sentence cards",
      kind: "sentence",
      locked: true,
      cardIds: decks.flatMap((deck) => deck.cardIds || [])
    };
  }

  function getReviewSourcesForSelect() {
    const vocabSets = getDb().sets.order.map((id) => getDb().sets.byId[id]).filter(Boolean).map((setRecord) => ({ ...setRecord, kind: "vocab" }));
    const sentenceDecks = getSentenceDecks();
    const sources = [...vocabSets];
    if (sentenceDecks.length) sources.push(getSentenceAllDeck(), ...sentenceDecks);
    return sources;
  }

  function getReviewSourceById(id) {
    const db = getDb();
    if (db.sets.byId[id]) return { ...db.sets.byId[id], kind: "vocab" };
    if (id === SENTENCE_ALL_DECK_ID && (db.sentenceCards || []).length) return getSentenceAllDeck();
    return getSentenceDecks().find((deck) => deck.id === id) || null;
  }

  function getReviewScopeId() {
    const db = getDb();
    const id = db.ui.reviewSetId || ALL_SET_ID;
    if (id === REVIEW_ALL_SETS_ID && getNamedSets().length) return id;
    return getReviewSourceById(id) ? id : ALL_SET_ID;
  }

  // Review scope can be one selected source, all saved vocab sets together, or sentence decks.
  // Each Smart review writes back to the originating source so FSRS histories stay separate.
  function getReviewScopeSets() {
    const id = getReviewScopeId();
    if (id === REVIEW_ALL_SETS_ID) return getNamedSets().map((setRecord) => ({ ...setRecord, kind: "vocab" }));
    if (id === SENTENCE_ALL_DECK_ID) return getSentenceDecks();
    const source = getReviewSourceById(id);
    return [source || { ...getActiveSet(), kind: "vocab" }].filter(Boolean);
  }

  function getPrimaryReviewSet() {
    return getReviewScopeSets()[0] || { ...getActiveSet(), kind: "vocab" };
  }

  function getReviewScopeName() {
    const id = getReviewScopeId();
    if (id === REVIEW_ALL_SETS_ID) return "All saved sets";
    if (id === SENTENCE_ALL_DECK_ID) return "All sentence cards";
    return getPrimaryReviewSet().name;
  }

  function getSentenceCardMap() {
    return Object.fromEntries((getDb().sentenceCards || []).map((card) => [card.id, card]));
  }

  function getAllSmartCardMap() {
    return { ...getAllCardMap(), ...getSentenceCardMap() };
  }

  function getSmartCardMapForSource(source) {
    return source?.kind === "sentence" ? getSentenceCardMap() : getAllCardMap();
  }

  function getSmartIdsForSource(source) {
    if (source?.kind === "sentence") {
      const valid = new Set((getDb().sentenceCards || []).map((card) => card.id));
      return (source.cardIds || []).filter((id) => valid.has(id));
    }
    return getPracticeScopedIdsForSet(source?.id || getActiveSet().id);
  }

  function getSmartBucketForSource(source) {
    if (source?.kind === "sentence") return state.store.ensureSentenceSmartDeck(source.id);
    return getSmartBucketForSet(source?.id || getActiveSet().id);
  }

  function getSmartBucketForReviewSourceId(id) {
    return getSmartBucketForSource(getReviewSourceById(id) || { ...getActiveSet(), kind: "vocab" });
  }

  function isSentenceCard(card) {
    return card?.cardKind === "sentence" || card?.direction === "zh_to_en" || card?.direction === "en_to_zh";
  }

  function getCardsForSet(setId = getActiveSet().id) {
    const setRecord = getDb().sets.byId[setId] || getActiveSet();
    const allowed = new Set((setRecord?.cardIds || []).map(String));
    return getDb().vocab.filter((card) => allowed.has(cardId(card)));
  }

  function getScopedCards() {
    return getCardsForSet(getActiveSet().id);
  }

  function getReviewScopedCards() {
    const seen = new Set();
    const cards = [];
    getReviewScopeSets().forEach((setRecord) => {
      if (setRecord.kind === "sentence") return;
      getCardsForSet(setRecord.id).forEach((card) => {
        const id = cardId(card);
        if (!seen.has(id)) {
          seen.add(id);
          cards.push(card);
        }
      });
    });
    return cards.sort((a, b) => (a.index || 0) - (b.index || 0));
  }

  function getScopedCardMap() {
    return Object.fromEntries(getReviewScopedCards().map((card) => [cardId(card), card]));
  }

  function getAllCardMap() {
    return Object.fromEntries(getDb().vocab.map((card) => [cardId(card), card]));
  }

  function getPracticeScopedIdsForSet(setId = getActiveSet().id) {
    const allMap = getAllCardMap();
    const setRecord = getDb().sets.byId[setId] || getActiveSet();
    return (setRecord?.cardIds || []).filter((id) => {
      const card = allMap[id];
      return !!card && card.practice !== false;
    });
  }

  function getPracticeScopedCardsForSet(setId = getActiveSet().id) {
    const map = getAllCardMap();
    return getPracticeScopedIdsForSet(setId).map((id) => map[id]).filter(Boolean);
  }

  function getReviewPracticeIds() {
    const ids = [];
    const seen = new Set();
    getReviewScopeSets().forEach((source) => {
      getSmartIdsForSource(source).forEach((id) => {
        if (!seen.has(id)) {
          seen.add(id);
          ids.push(id);
        }
      });
    });
    return ids;
  }

  function getModeCards(mode = getUi().mode) {
    return getReviewScopedCards().filter((card) => card[mode] !== false);
  }

  function getModeIds(mode = getUi().mode) {
    return getModeCards(mode).map((card) => cardId(card));
  }

  function getAllowedQuizTypes(mode = getUi().mode) {
    if (mode === "practice") return PRACTICE_QUIZ_TYPES;
    return [];
  }

  function getQuizType(mode = getUi().mode) {
    if (mode === "learn") return "";
    return getUi().quizType[mode] || "translation";
  }

  function isSmartPracticeActive(mode = getUi().mode, quizType = getQuizType(mode)) {
    return mode === "practice" && quizType === "smart";
  }

  function getSmartBucketForSet(setId) {
    return state.store.ensureSmartSet(setId);
  }

  function getSmartBucketForActiveSet() {
    return getSmartBucketForSet(getActiveSet().id);
  }

  function getSmartQueueKey(setId, idOrCard) {
    return `${setId || ""}:${cardId(idOrCard)}`;
  }

  function clearSmartSessionDeferrals() {
    state.smartDeferredQueueKeys = [];
  }

  function deferSmartCardToSessionTail(setId, idOrCard) {
    const key = getSmartQueueKey(setId, idOrCard);
    if (!key || key === ":") return;
    state.smartDeferredQueueKeys = (state.smartDeferredQueueKeys || []).filter((item) => item !== key);
    state.smartDeferredQueueKeys.push(key);
  }

  function pruneSmartSessionDeferrals(items) {
    const liveKeys = new Set((items || []).map((item) => getSmartQueueKey(item.setId, item.id || item.card)));
    state.smartDeferredQueueKeys = (state.smartDeferredQueueKeys || []).filter((key) => liveKeys.has(key));
  }

  function decorateSmartItems(setId, items, now = new Date()) {
    return (items || []).map((item) => ({
      ...item,
      setId,
      sortKey: hashStringToUnitInterval(`${state.smartSessionSeed}::${setId}::${item.id || cardId(item.card)}::${getLocalDayStamp(now)}`)
    }));
  }

  function sortSmartReviewItems(items) {
    pruneSmartSessionDeferrals(items);
    const deferredOrder = new Map((state.smartDeferredQueueKeys || []).map((key, index) => [key, index]));
    return [...items].sort((a, b) => {
      const aKey = getSmartQueueKey(a.setId, a.id || a.card);
      const bKey = getSmartQueueKey(b.setId, b.id || b.card);
      const aDeferred = deferredOrder.has(aKey);
      const bDeferred = deferredOrder.has(bKey);
      if (aDeferred !== bDeferred) return aDeferred ? 1 : -1;
      if (aDeferred && bDeferred) {
        const deferredDelta = deferredOrder.get(aKey) - deferredOrder.get(bKey);
        if (deferredDelta !== 0) return deferredDelta;
      }
      const aDue = smart.getDueDay(a.entry, new Date());
      const bDue = smart.getDueDay(b.entry, new Date());
      const aStamp = aDue ? aDue.getTime() : 0;
      const bStamp = bDue ? bDue.getTime() : 0;
      if (aStamp !== bStamp) return aStamp - bStamp;
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      if (a.setId !== b.setId) return String(a.setId).localeCompare(String(b.setId));
      return (a.card?.index || 0) - (b.card?.index || 0);
    });
  }

  // Due reviews and new-card introduction are separate flows. This function only
  // returns already-started FSRS cards that are due for the current review scope.
  function getSmartDueItems(now = new Date()) {
    const items = [];
    getReviewScopeSets().forEach((source) => {
      const cardMap = getSmartCardMapForSource(source);
      const bucket = getSmartBucketForSource(source);
      const due = smart.getDueQueue(getSmartIdsForSource(source), bucket, cardMap, now, { sessionSeed: `${state.smartSessionSeed}::${source.id}` });
      items.push(...decorateSmartItems(source.id, due, now).map((item) => ({ ...item, sourceKind: source.kind })));
    });
    return sortSmartReviewItems(items);
  }

  // New cards are Practice cards not yet started in FSRS. They appear only when
  // the user explicitly chooses to introduce new Smart cards.
  function getSmartNewItems(now = new Date()) {
    const items = [];
    getReviewScopeSets().forEach((source) => {
      const cardMap = getSmartCardMapForSource(source);
      const bucket = getSmartBucketForSource(source);
      const fresh = smart.getNewQueue(getSmartIdsForSource(source), bucket, cardMap, now, { sessionSeed: `${state.smartSessionSeed}::${source.id}` });
      items.push(...decorateSmartItems(source.id, fresh, now).map((item) => ({ ...item, sourceKind: source.kind })));
    });
    return sortSmartReviewItems(items);
  }

  function getSmartDueQueue(now = new Date()) {
    return getSmartDueItems(now).map((item) => item.card);
  }

  function getSmartNewQueue(now = new Date()) {
    return getSmartNewItems(now).map((item) => item.card);
  }

  function getSmartItems(now = new Date()) {
    return state.round.smartForceNew ? getSmartNewItems(now) : getSmartDueItems(now);
  }

  function getSmartQueue(now = new Date()) {
    return getSmartItems(now).map((item) => item.card);
  }

  function getSmartScheduleForSet(setId, now = new Date()) {
    const source = getReviewSourceById(setId);
    if (!source) return { dueTodayCount: 0, nextDueDate: null, byDay: [], startedCount: 0, newCount: 0 };
    return smart.getScheduleSummary(getSmartIdsForSource(source), getSmartBucketForSource(source), now);
  }

  function mergeScheduleSummaries(summaries) {
    const byStamp = new Map();
    let dueTodayCount = 0;
    let startedCount = 0;
    let newCount = 0;
    let nextDueDate = null;
    summaries.forEach((summary) => {
      dueTodayCount += summary.dueTodayCount || 0;
      startedCount += summary.startedCount || 0;
      newCount += summary.newCount || 0;
      if (summary.nextDueDate && (!nextDueDate || summary.nextDueDate.getTime() < nextDueDate.getTime())) {
        nextDueDate = summary.nextDueDate;
      }
      (summary.byDay || []).forEach((item) => {
        const stamp = item.date.getTime();
        byStamp.set(stamp, (byStamp.get(stamp) || 0) + item.count);
      });
    });
    return {
      dueTodayCount,
      nextDueDate,
      byDay: [...byStamp.entries()].sort((a, b) => a[0] - b[0]).map(([stamp, count]) => ({ date: new Date(Number(stamp)), count })),
      startedCount,
      newCount
    };
  }

  function getReviewScheduleSummary(now = new Date()) {
    return mergeScheduleSummaries(getReviewScopeSets().map((setRecord) => getSmartScheduleForSet(setRecord.id, now)));
  }

  function getAllSetsScheduleByDay(now = new Date()) {
    const groups = new Map();
    getDb().sets.order.map((id) => getDb().sets.byId[id]).filter(Boolean).forEach((setRecord) => {
      const summary = getSmartScheduleForSet(setRecord.id, now);
      summary.byDay.forEach((item) => {
        const stamp = item.date.getTime();
        const current = groups.get(stamp) || { date: item.date, count: 0, sets: [] };
        current.count += item.count;
        current.sets.push({ setId: setRecord.id, name: setRecord.name, count: item.count });
        groups.set(stamp, current);
      });
    });
    return [...groups.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  function getSmartStatsForSet(setId) {
    const source = getReviewSourceById(setId);
    if (!source) return { shown: 0, correct: 0, wrong: 0 };
    const ids = new Set(getSmartIdsForSource(source));
    const bucket = getSmartBucketForSource(source);
    let shown = 0;
    let correct = 0;
    let wrong = 0;
    Object.entries(bucket).forEach(([id, entry]) => {
      if (!ids.has(id)) return;
      shown += entry.shown || 0;
      correct += entry.correct || 0;
      wrong += entry.wrong || 0;
    });
    return { shown, correct, wrong };
  }

  function getReviewSmartStats() {
    return getReviewScopeSets().reduce((total, setRecord) => {
      const stats = getSmartStatsForSet(setRecord.id);
      total.shown += stats.shown;
      total.correct += stats.correct;
      total.wrong += stats.wrong;
      return total;
    }, { shown: 0, correct: 0, wrong: 0 });
  }

  function buildOrderedIds(mode = getUi().mode) {
    const base = getModeIds(mode);
    const stored = (getUi().order[mode] || []).filter((id) => base.includes(id));
    const missing = base.filter((id) => !stored.includes(id));
    const merged = [...stored, ...missing];
    if (getUi().orderType[mode] !== "shuffled") return base;
    return merged;
  }

  function ensureOrder(mode = getUi().mode) {
    const ids = buildOrderedIds(mode);
    getUi().order[mode] = ids;
    const total = ids.length;
    if (!total) {
      getUi().indexes[mode] = 0;
      return ids;
    }
    getUi().indexes[mode] = clamp(getUi().indexes[mode] || 0, 0, total - 1);
    return ids;
  }

  function getOrderedIds(mode = getUi().mode) {
    return ensureOrder(mode);
  }

  function getOrderedCards(mode = getUi().mode) {
    const cardsById = getScopedCardMap();
    return getOrderedIds(mode).map((id) => cardsById[id]).filter(Boolean);
  }

  function getCurrentIndex(mode = getUi().mode) {
    const total = getOrderedIds(mode).length;
    if (!total) return 0;
    return clamp(getUi().indexes[mode] || 0, 0, total - 1);
  }

  function getSmartCurrentItem() {
    if (!isSmartPracticeActive()) return null;
    if (state.round.smartCardId && state.round.smartSetId) {
      const source = getReviewSourceById(state.round.smartSetId);
      const setIds = new Set(getSmartIdsForSource(source));
      const map = getSmartCardMapForSource(source);
      if (setIds.has(state.round.smartCardId) && map[state.round.smartCardId]) {
        return { setId: state.round.smartSetId, id: state.round.smartCardId, card: map[state.round.smartCardId], sourceKind: source?.kind || "vocab" };
      }
    }
    const queue = getSmartItems(new Date());
    let picked = queue[0] || null;
    if (picked && queue.length > 1 && state.smartLastCardId) {
      const alternative = queue.find((item) => `${item.setId}:${item.id || cardId(item.card)}` !== `${state.smartLastSetId}:${state.smartLastCardId}`);
      if (alternative) picked = alternative;
    }
    if (picked) {
      state.round.smartCardId = picked.id || cardId(picked.card);
      state.round.smartSetId = picked.setId;
    }
    return picked;
  }

  function getSmartCurrentCard() {
    const item = getSmartCurrentItem();
    return item?.card || null;
  }

  function getCurrentCard() {
    if (isSmartPracticeActive()) return getSmartCurrentCard();
    const ordered = getOrderedCards();
    return ordered[getCurrentIndex()] || null;
  }

  function markSeenById(id) {
    getDb().progress.seen[id] = true;
  }

  function recordQuizResult(mode, quizType, result) {
    const card = getCurrentCard();
    if (!card) return;
    const bucket = getDb().progress[mode]?.[quizType];
    if (!bucket) return;
    const id = cardId(card);
    const entry = bucket[id] || { shown: 0, correct: 0, wrong: 0 };
    entry[result] = (entry[result] || 0) + 1;
    bucket[id] = entry;
    persist();
  }

  function recordCardAppearanceById(mode, quizType, id) {
    if (!id) return false;
    if (mode === "learn") {
      markSeenById(id);
      return true;
    }
    if (mode === "practice" && quizType === "smart") {
      return false;
    }
    const bucket = getDb().progress[mode]?.[quizType];
    if (!bucket) return false;
    const entry = bucket[id] || { shown: 0, correct: 0, wrong: 0 };
    entry.shown = (entry.shown || 0) + 1;
    bucket[id] = entry;
    return true;
  }

  function prepareRoundAppearance(mode, quizType, card) {
    if (!card) return;
    const key = `${getReviewScopeId()}:${mode}:${quizType || "study"}:${cardId(card)}`;
    if (state.round.appearanceKey === key) return;
    state.round.appearanceKey = key;
    state.round.appearanceMode = mode;
    state.round.appearanceQuizType = quizType || "";
    state.round.appearanceCardId = cardId(card);
    state.round.appearanceCounted = false;
  }

  function finalizeRoundAppearance() {
    if (!state.round.appearanceKey || state.round.appearanceCounted) return false;
    const changed = recordCardAppearanceById(state.round.appearanceMode, state.round.appearanceQuizType, state.round.appearanceCardId);
    if (!changed) return false;
    state.round.appearanceCounted = true;
    persist();
    return true;
  }

  function getTouchedIds(mode, quizType) {
    const ids = new Set(getModeIds(mode));
    const bucket = getDb().progress[mode]?.[quizType] || {};
    return Object.keys(bucket).filter((id) => ids.has(id) && ((bucket[id].shown || 0) > 0 || (bucket[id].correct || 0) > 0 || (bucket[id].wrong || 0) > 0));
  }

  function getSeenCount() {
    const learnIds = new Set(getModeIds("learn"));
    return Object.keys(getDb().progress.seen || {}).filter((id) => learnIds.has(id)).length;
  }

  function getModeTotals(mode, quizType) {
    const ids = new Set(getModeIds(mode));
    const bucket = getDb().progress[mode]?.[quizType] || {};
    let shown = 0;
    let correct = 0;
    let wrong = 0;
    let touched = 0;
    Object.entries(bucket).forEach(([id, entry]) => {
      if (!ids.has(id)) return;
      shown += entry.shown || 0;
      correct += entry.correct || 0;
      wrong += entry.wrong || 0;
      touched += ((entry.shown || 0) > 0 || (entry.correct || 0) > 0 || (entry.wrong || 0) > 0) ? 1 : 0;
    });
    return { shown, correct, wrong, touched };
  }

  function getModeTouchedAcrossTypes(mode) {
    const ids = new Set();
    if (mode === "practice") {
      getTouchedIds("practice", "translation").forEach((id) => ids.add(id));
      getTouchedIds("practice", "pinyin").forEach((id) => ids.add(id));
      getReviewScopeSets().forEach((source) => {
        const smartStatsIds = new Set(getSmartIdsForSource(source));
        Object.entries(getSmartBucketForSource(source)).forEach(([id, entry]) => {
          if (smartStatsIds.has(id) && ((entry.shown || 0) > 0 || (entry.correct || 0) > 0 || (entry.wrong || 0) > 0)) ids.add(id);
        });
      });
      return ids.size;
    }
    getTouchedIds(mode, "translation").forEach((id) => ids.add(id));
    getTouchedIds(mode, "pinyin").forEach((id) => ids.add(id));
    return ids.size;
  }

  function getPracticeCardStats(card) {
    const id = cardId(card);
    const progress = getDb().progress;
    const smartSetId = isSmartPracticeActive() && state.round.smartSetId ? state.round.smartSetId : getPrimaryReviewSet().id;
    const smartBucket = getSmartBucketForReviewSourceId(smartSetId);
    return {
      translation: progress.practice.translation[id] || { shown: 0, correct: 0, wrong: 0 },
      pinyin: progress.practice.pinyin[id] || { shown: 0, correct: 0, wrong: 0 },
      smart: smartBucket[id] || smart.createSmartEntry(new Date())
    };
  }

  function getPracticeCardSummaryText(card) {
    const stats = getPracticeCardStats(card);
    return {
      translation: `translation ${stats.translation.correct}/${stats.translation.wrong} · seen ${stats.translation.shown}`,
      pinyin: `pinyin ${stats.pinyin.correct}/${stats.pinyin.wrong} · seen ${stats.pinyin.shown}`,
      smart: `smart ${stats.smart.correct}/${stats.smart.wrong} · seen ${stats.smart.shown}`
    };
  }


  Object.assign(runtime, {
    resetRoundState,
    markManageListDirty,
    getActiveSet,
    getNamedSets,
    getSentenceDecks,
    getSentenceAllDeck,
    getReviewSourcesForSelect,
    getReviewSourceById,
    getReviewScopeId,
    getReviewScopeSets,
    getPrimaryReviewSet,
    getReviewScopeName,
    getCardsForSet,
    getScopedCards,
    getReviewScopedCards,
    getScopedCardMap,
    getAllCardMap,
    getPracticeScopedIdsForSet,
    getPracticeScopedCardsForSet,
    getReviewPracticeIds,
    getModeCards,
    getModeIds,
    getAllowedQuizTypes,
    getQuizType,
    isSmartPracticeActive,
    getSmartBucketForSet,
    getSmartBucketForActiveSet,
    getSmartBucketForReviewSourceId,
    getSmartCardMapForSource,
    getSmartIdsForSource,
    isSentenceCard,
    getSmartQueueKey,
    clearSmartSessionDeferrals,
    deferSmartCardToSessionTail,
    decorateSmartItems,
    sortSmartReviewItems,
    getSmartDueItems,
    getSmartNewItems,
    getSmartDueQueue,
    getSmartNewQueue,
    getSmartItems,
    getSmartQueue,
    getSmartScheduleForSet,
    mergeScheduleSummaries,
    getReviewScheduleSummary,
    getAllSetsScheduleByDay,
    getSmartStatsForSet,
    getReviewSmartStats,
    buildOrderedIds,
    ensureOrder,
    getOrderedIds,
    getOrderedCards,
    getCurrentIndex,
    getSmartCurrentItem,
    getSmartCurrentCard,
    getCurrentCard,
    markSeenById,
    recordQuizResult,
    recordCardAppearanceById,
    prepareRoundAppearance,
    finalizeRoundAppearance,
    getTouchedIds,
    getSeenCount,
    getModeTotals,
    getModeTouchedAcrossTypes,
    getPracticeCardStats,
    getPracticeCardSummaryText
  });
})(window.HSKFlashcards);
