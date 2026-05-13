/**
 * Main UI split: Top-level render, setup actions, event binding, and bootstrap.
 */
(function (ns) {
  const runtime = ns.mainRuntime = ns.mainRuntime || {};
  const proxy = (name) => (...args) => {
    const fn = runtime[name];
    if (typeof fn !== "function") throw new Error(`Main runtime function not loaded: ${name}`);
    return fn(...args);
  };
  const { MODES, PRACTICE_QUIZ_TYPES, TEST_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, SMART_RATINGS, normalizeCard, cardId, clamp, shuffle, parseCSV, mapRowsToCards, parseRangeInput, formatReviewDateLabel, formatLongDate, hashStringToUnitInterval, getLocalDayStamp, checkPinyinAnswer, getReviewPinyinText, shouldAutoFocusPinyinInput, getPinyinInputPlaceholder, getPinyinDisplay, createPersistenceAdapter, createAppStore, createButton, clearNode, setBar, updateResult, scheduleStudyAreaFocus, smart, state } = runtime;
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
  const resetRoundState = proxy("resetRoundState");
  const markManageListDirty = proxy("markManageListDirty");
  const getActiveSet = proxy("getActiveSet");
  const getNamedSets = proxy("getNamedSets");
  const getSetupDeckById = proxy("getSetupDeckById");
  const getSetupDeckCards = proxy("getSetupDeckCards");
  const getSelectedSetupDeckId = proxy("getSelectedSetupDeckId");
  const getReviewScopeId = proxy("getReviewScopeId");
  const getReviewScopeSets = proxy("getReviewScopeSets");
  const getPrimaryReviewSet = proxy("getPrimaryReviewSet");
  const getReviewScopeName = proxy("getReviewScopeName");
  const getCardsForSet = proxy("getCardsForSet");
  const getScopedCards = proxy("getScopedCards");
  const getReviewScopedCards = proxy("getReviewScopedCards");
  const getScopedCardMap = proxy("getScopedCardMap");
  const getAllCardMap = proxy("getAllCardMap");
  const getPracticeScopedIdsForSet = proxy("getPracticeScopedIdsForSet");
  const getPracticeScopedCardsForSet = proxy("getPracticeScopedCardsForSet");
  const getReviewPracticeIds = proxy("getReviewPracticeIds");
  const getModeCards = proxy("getModeCards");
  const getModeIds = proxy("getModeIds");
  const getAllowedQuizTypes = proxy("getAllowedQuizTypes");
  const getQuizType = proxy("getQuizType");
  const isSmartPracticeActive = proxy("isSmartPracticeActive");
  const getSmartBucketForSet = proxy("getSmartBucketForSet");
  const getSmartBucketForActiveSet = proxy("getSmartBucketForActiveSet");
  const getSmartQueueKey = proxy("getSmartQueueKey");
  const clearSmartSessionDeferrals = proxy("clearSmartSessionDeferrals");
  const deferSmartCardToSessionTail = proxy("deferSmartCardToSessionTail");
  const decorateSmartItems = proxy("decorateSmartItems");
  const sortSmartReviewItems = proxy("sortSmartReviewItems");
  const getSmartDueItems = proxy("getSmartDueItems");
  const getSmartNewItems = proxy("getSmartNewItems");
  const getSmartDueQueue = proxy("getSmartDueQueue");
  const getSmartNewQueue = proxy("getSmartNewQueue");
  const getSmartItems = proxy("getSmartItems");
  const getSmartQueue = proxy("getSmartQueue");
  const getSmartScheduleForSet = proxy("getSmartScheduleForSet");
  const mergeScheduleSummaries = proxy("mergeScheduleSummaries");
  const getReviewScheduleSummary = proxy("getReviewScheduleSummary");
  const getAllSetsScheduleByDay = proxy("getAllSetsScheduleByDay");
  const getSmartStatsForSet = proxy("getSmartStatsForSet");
  const getReviewSmartStats = proxy("getReviewSmartStats");
  const buildOrderedIds = proxy("buildOrderedIds");
  const ensureOrder = proxy("ensureOrder");
  const getOrderedIds = proxy("getOrderedIds");
  const getOrderedCards = proxy("getOrderedCards");
  const getCurrentIndex = proxy("getCurrentIndex");
  const getSmartCurrentItem = proxy("getSmartCurrentItem");
  const getSmartCurrentCard = proxy("getSmartCurrentCard");
  const getCurrentCard = proxy("getCurrentCard");
  const markSeenById = proxy("markSeenById");
  const recordQuizResult = proxy("recordQuizResult");
  const recordCardAppearanceById = proxy("recordCardAppearanceById");
  const prepareRoundAppearance = proxy("prepareRoundAppearance");
  const finalizeRoundAppearance = proxy("finalizeRoundAppearance");
  const getTouchedIds = proxy("getTouchedIds");
  const getSeenCount = proxy("getSeenCount");
  const getModeTotals = proxy("getModeTotals");
  const getModeTouchedAcrossTypes = proxy("getModeTouchedAcrossTypes");
  const getPracticeCardStats = proxy("getPracticeCardStats");
  const getPracticeCardSummaryText = proxy("getPracticeCardSummaryText");
  const updateModeButtons = proxy("updateModeButtons");
  const renderStats = proxy("renderStats");
  const getEditModeIds = proxy("getEditModeIds");
  const renderSelectionSummary = proxy("renderSelectionSummary");
  const renderOrderStatus = proxy("renderOrderStatus");
  const renderSetupPanel = proxy("renderSetupPanel");
  const getFilteredManageCards = proxy("getFilteredManageCards");
  const renderManageList = proxy("renderManageList");
  const renderManageListIfNeeded = proxy("renderManageListIfNeeded");
  const renderBuiltInDeckVisibilityPanel = proxy("renderBuiltInDeckVisibilityPanel");
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
  const showSmartSentenceAnswer = proxy("showSmartSentenceAnswer");
  const renderSmartBlocked = proxy("renderSmartBlocked");

  function render() {
    renderPageShell();
    updateModeButtons();
    updateStorageModeBadge();
    renderAuthPanel();
    renderStats();
    renderSetPanel();
    renderReviewScopePanel();
    renderSelectionSummary();
    renderOrderStatus();
    renderSetupPanel();
    renderManageListIfNeeded();

    if (state.currentPage === "images" && typeof runtime.renderImagePage === "function") {
      runtime.renderImagePage();
      return;
    }

    if (isSmartPracticeActive()) {
      const now = new Date();
      const activeSmartItems = getSmartItems(now);
      if (!activeSmartItems.length) {
        renderSmartBlocked();
        return;
      }
      const item = getSmartCurrentItem(now, activeSmartItems);
      const card = item?.card || null;
      if (!card) {
        renderSmartBlocked();
        return;
      }
      const summary = getReviewScheduleSummary(now);
      renderSmartPractice(card, activeSmartItems.length, summary.startedCount);
      return;
    }

    const card = getCurrentCard();
    if (!card) {
      const total = getOrderedIds().length;
      if (!total) {
        clearCard(`No cards selected for ${getUi().mode}`, "Use Card setup or switch card set.");
        return;
      }
      clearCard();
      return;
    }

    if (getUi().mode === "learn") {
      renderLearn(card, getCurrentIndex(), getOrderedIds().length);
      return;
    }

    if (getQuizType() === "translation") {
      renderTranslationQuiz(card, getCurrentIndex(), getOrderedIds().length);
      return;
    }

    renderPinyinQuiz(card, getCurrentIndex(), getOrderedIds().length);
  }

  function setMode(mode) {
    if (!MODES.includes(mode)) return;
    getUi().mode = mode;
    resetRoundState();
    persist();
    render();
  }

  function setQuizTypeForCurrentMode(quizType) {
    const mode = getUi().mode;
    if (mode === "learn") return;
    if (!getAllowedQuizTypes(mode).includes(quizType)) return;
    getUi().quizType[mode] = quizType;
    resetRoundState();
    persist();
    render();
  }

  function shuffleCurrentMode() {
    if (isSmartPracticeActive()) {
      state.elements.statusText.textContent = "Smart practice uses today's due queue.";
      return;
    }
    const ids = getModeIds(getUi().mode);
    if (ids.length < 2) return;
    getUi().order[getUi().mode] = shuffle(ids);
    getUi().orderType[getUi().mode] = "shuffled";
    getUi().indexes[getUi().mode] = 0;
    resetRoundState();
    persist();
    render();
  }

  function resetCurrentModeOrder() {
    if (isSmartPracticeActive()) {
      state.elements.statusText.textContent = "Smart practice uses today's due queue.";
      return;
    }
    getUi().order[getUi().mode] = getModeIds(getUi().mode);
    getUi().orderType[getUi().mode] = "default";
    getUi().indexes[getUi().mode] = 0;
    resetRoundState();
    persist();
    render();
  }

  function getSetupDeckCardIdList(deck) {
    const selected = deck || getSetupDeckById(getSelectedSetupDeckId()) || { id: ALL_SET_ID, kind: "vocab" };
    return getSetupDeckCards(selected.id).map((card) => getSetupActionCardId(card, selected)).filter(Boolean);
  }

  function ensureSetupVisibilityReady() {
    const db = getDb();
    if (db.builtinVisibility?.version === 46 && db.builtinVisibility.byDeck) return db.builtinVisibility;
    db.builtinVisibility = ns.store && typeof ns.store.normalizeBuiltinVisibility === "function"
      ? ns.store.normalizeBuiltinVisibility(db.builtinVisibility)
      : { version: 46, byDeck: {} };
    return db.builtinVisibility;
  }

  function saveSetupVisibilityMode(deckId, mode, cardIds = []) {
    if (!state.store || typeof state.store.saveVisibilityMode !== "function") return;
    const result = state.store.saveVisibilityMode(deckId, mode, cardIds);
    if (result && typeof result.catch === "function") {
      result.catch((error) => console.warn("Setup visibility save failed.", error));
    }
  }

  function setBuiltInCardFlag(deckId, localCardId, mode, value, cardIds = null) {
    const id = String(deckId || "").trim();
    const card = String(localCardId || "").trim();
    if (!id || !card || !MODES.includes(mode) || !ns.visibilityBits) return false;
    const deck = getSetupDeckById(id) || { id, kind: id === ALL_SET_ID ? "vocab" : "sentence" };
    const ids = Array.isArray(cardIds) ? cardIds : getSetupDeckCardIdList(deck);
    return ns.visibilityBits.setCardMode(ensureSetupVisibilityReady(), id, card, mode, value !== false, ids);
  }

  function getSetupActionCardId(card, deck) {
    return deck?.kind === "sentence" ? String(card?.id || "") : cardId(card);
  }

  function updateCardMode(id, mode, checked) {
    if (!MODES.includes(mode)) return;
    const deck = getSetupDeckById(getSelectedSetupDeckId()) || { id: ALL_SET_ID, kind: "vocab" };
    const allIds = getSetupDeckCardIdList(deck);
    if (!setBuiltInCardFlag(deck.id, id, mode, checked, allIds)) return;
    resetRoundState();
    clearSmartSessionDeferrals();
    saveSetupVisibilityMode(deck.id, mode, allIds);
    // The clicked checkbox already reflects the change. Avoid rebuilding the
    // whole Setup DOM list for a one-card toggle.
    renderSelectionSummary();
    renderOrderStatus();
  }

  function applyRangeToMode(mode, include) {
    const input = state.elements[`range${mode.charAt(0).toUpperCase()}${mode.slice(1)}`];
    const ranges = parseRangeInput(input?.value || "");
    if (!ranges.size || !MODES.includes(mode) || !ns.visibilityBits) return;
    const deck = getSetupDeckById(getSelectedSetupDeckId()) || { id: ALL_SET_ID, kind: "vocab" };
    const cards = getSetupDeckCards(deck.id);
    const allIds = getSetupDeckCardIdList(deck);
    const targetIds = [];

    cards.forEach((card) => {
      const position = card.setupIndex || card.index;
      if (ranges.has(position)) targetIds.push(getSetupActionCardId(card, deck));
    });
    const changed = ns.visibilityBits.setCardsMode(ensureSetupVisibilityReady(), deck.id, targetIds, mode, include !== false, allIds);
    if (!changed) return;
    ensureOrder(mode);
    resetRoundState();
    clearSmartSessionDeferrals();
    markManageListDirty();
    saveSetupVisibilityMode(deck.id, mode, allIds);
    render();
  }

  function setAllForMode(mode, value) {
    if (!MODES.includes(mode) || !ns.visibilityBits) return;
    const deck = getSetupDeckById(getSelectedSetupDeckId()) || { id: ALL_SET_ID, kind: "vocab" };
    const allIds = getSetupDeckCardIdList(deck);
    const changed = ns.visibilityBits.setModeDefault(ensureSetupVisibilityReady(), deck.id, mode, value !== false, allIds);
    if (!changed) return;
    ensureOrder(mode);
    resetRoundState();
    clearSmartSessionDeferrals();
    markManageListDirty();
    saveSetupVisibilityMode(deck.id, mode, allIds);
    render();
  }

  async function handleResetProgress() {
    await state.store.resetProgress("manual_reset");
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = "Progress reset locally and marked as a new remote review epoch.";
    render();
  }

  async function handleSaveNamedSet() {
    state.elements.statusText.textContent = "Custom user sets are disabled. Use Card setup visibility instead.";
  }

  function getCardsFromSetRangeInput() {
    const ranges = parseRangeInput(state.elements.setRangeInput?.value || "");
    if (!ranges.size) return [];
    return getDb().vocab.filter((card) => ranges.has(card.index));
  }

  async function handleSetRangeAction(action) {
    state.elements.statusText.textContent = "Custom user sets are disabled. Use Card setup visibility instead.";
  }

  async function handleDeleteSelectedSet() {
    state.elements.statusText.textContent = "Custom user sets are disabled.";
  }

  async function handleSetChange(event) {
    await state.store.setActiveSet(event.target.value);
    resetRoundState();
    clearSmartSessionDeferrals();
    markManageListDirty();
    render();
  }

  async function handleReviewSetChange(event) {
    if (typeof state.store.setReviewSet === "function") {
      await state.store.setReviewSet(event.target.value);
    } else {
      getUi().reviewSetId = event.target.value;
      await persist();
    }
    resetRoundState();
    clearSmartSessionDeferrals();
    render();
  }

  function toggleFullReviewSchedule() {
    state.reviewScheduleExpanded = !state.reviewScheduleExpanded;
    render();
  }

  function handleSetupDeckSelectChange() {
    state.filterText = state.elements.filterInput?.value || "";
    resetRoundState();
    clearSmartSessionDeferrals();
    markManageListDirty();
    render();
  }

  async function handleSetupDeckVisibilityChange() {
    // Kept as a no-op for compatibility with older markup. v46 uses per-card
    // Learn/Practice flags in the manage list instead of deck-level visibility.
  }

  function handleManageListChange(event) {
    const input = event.target.closest('input[data-card-id][data-card-mode]');
    if (!input || !state.elements.manageList.contains(input)) return;
    updateCardMode(input.dataset.cardId, input.dataset.cardMode, input.checked);
  }

  function handleRangeButtonClick(event) {
    const button = event.currentTarget;
    const mode = button.dataset.rangeMode;
    const action = button.dataset.rangeAction;
    if (!MODES.includes(mode)) return;
    if (action === "add") return applyRangeToMode(mode, true);
    if (action === "remove") return applyRangeToMode(mode, false);
    if (action === "all") return setAllForMode(mode, true);
    if (action === "none") return setAllForMode(mode, false);
  }

  // Keyboard handler covers both translation MCQ and FSRS rating selection.
  function handleTranslationKeyboard(event) {
    if (event.defaultPrevented) return;
    if (state.currentPage !== "flashcards") return;
    const active = document.activeElement;
    const isTypingField = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    if (!getCurrentCard()) return;

    if (getUi().mode === "learn" && event.key === "Enter" && !isTypingField) {
      event.preventDefault();
      nextCard();
      return;
    }

    if (isSmartPracticeActive() && state.round.smartStage === "feedback") {
      if (/[1-4]/.test(event.key)) {
        event.preventDefault();
        setSmartRating(Number(event.key));
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveSmartRatingSelection(1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveSmartRatingSelection(-1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        acceptSmartFsrsFeedback();
      }
      return;
    }

    const translationStageActive = (getQuizType() === "translation") || (isSmartPracticeActive() && state.round.smartStage === "translation");
    if (!translationStageActive) return;
    if (isTypingField) return;

    if (!state.round.answered && state.round.options.length) {
      const upper = event.key.toUpperCase();
      const letterIndex = ["A", "B", "C", "D"].indexOf(upper);
      if (letterIndex >= 0 && letterIndex < state.round.options.length) {
        event.preventDefault();
        selectTranslationOption(letterIndex);
        return;
      }
      const numberIndex = ["1", "2", "3", "4"].indexOf(event.key);
      if (numberIndex >= 0 && numberIndex < state.round.options.length) {
        event.preventDefault();
        selectTranslationOption(numberIndex);
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        moveTranslationSelection(1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        moveTranslationSelection(-1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const index = state.round.keyboardChoiceIndex >= 0 ? state.round.keyboardChoiceIndex : 0;
        const option = state.round.options[index];
        if (!option) return;
        if (isSmartPracticeActive() && state.round.smartStage === "translation") answerSmartTranslation(option);
        else answerTranslation(option);
        return;
      }
    }

    if (state.round.answered && event.key === "Enter") {
      event.preventDefault();
      nextCard();
    }
  }

  function handlePinyinKeyboard(event) {
    if (event.defaultPrevented) return;
    if (state.currentPage !== "flashcards") return;
    const active = document.activeElement;
    const isTextInput = active && active.tagName === "INPUT" && active.type === "text";
    if (event.key !== "Enter") return;

    if (isSmartPracticeActive() && state.round.smartForceNew && state.round.smartStage === "intro") {
      event.preventDefault();
      introduceCurrentSmartCard();
      return;
    }

    if (isSmartPracticeActive() && state.round.smartStage === "sentence-question" && !isTextInput) {
      event.preventDefault();
      showSmartSentenceAnswer();
      return;
    }

    if (isSmartPracticeActive() && state.round.smartStage === "pinyin") {
      if (state.round.pendingWrong) {
        event.preventDefault();
        acceptPendingSmartPinyinWrong();
        return;
      }
      if (isTextInput) {
        event.preventDefault();
        const form = active.closest("form");
        if (form) form.requestSubmit();
      }
      return;
    }

    if (getQuizType() === "pinyin") {
      if (state.round.pendingWrong) {
        event.preventDefault();
        acceptPendingPinyinWrong();
        return;
      }
      if (state.round.answered) {
        event.preventDefault();
        nextCard();
        return;
      }
      if (isTextInput) {
        event.preventDefault();
        const form = active.closest("form");
        if (form) form.requestSubmit();
      }
    }
  }

  function toggleSetupPanel() {
    getUi().setupCollapsed = !getUi().setupCollapsed;
    if (!getUi().setupCollapsed) markManageListDirty();
    persist();
    render();
  }

  function bindEvents() {
    if (state.elements.authSignUpBtn) state.elements.authSignUpBtn.addEventListener("click", handleAuthSignUp);
    if (state.elements.authSignInBtn) state.elements.authSignInBtn.addEventListener("click", handleAuthSignIn);
    if (state.elements.authSignOutBtn) state.elements.authSignOutBtn.addEventListener("click", handleAuthSignOut);
    state.elements.pageButtons.forEach((button) => button.addEventListener("click", () => setPage(button.dataset.page)));
    state.elements.resetProgressBtn.addEventListener("click", handleResetProgress);
    state.elements.shuffleBtn.addEventListener("click", shuffleCurrentMode);
    state.elements.resetOrderBtn.addEventListener("click", resetCurrentModeOrder);
    state.elements.setupToggleBtn.addEventListener("click", toggleSetupPanel);
    if (state.elements.setupDeckSelect) state.elements.setupDeckSelect.addEventListener("change", handleSetupDeckSelectChange);
    if (state.elements.setupDeckLearnToggle) state.elements.setupDeckLearnToggle.addEventListener("change", handleSetupDeckVisibilityChange);
    if (state.elements.setupDeckPracticeToggle) state.elements.setupDeckPracticeToggle.addEventListener("change", handleSetupDeckVisibilityChange);
    if (state.elements.manageList) state.elements.manageList.addEventListener("change", handleManageListChange);
    if (state.elements.filterInput) state.elements.filterInput.addEventListener("input", (event) => {
      state.filterText = event.target.value || "";
      markManageListDirty();
      renderManageListIfNeeded(true);
    });
    state.elements.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    state.elements.quizTypeButtons.forEach((button) => button.addEventListener("click", () => setQuizTypeForCurrentMode(button.dataset.quiz)));
    state.elements.rangeButtons.forEach((button) => button.addEventListener("click", handleRangeButtonClick));
    if (state.elements.saveSetBtn) state.elements.saveSetBtn.addEventListener("click", handleSaveNamedSet);
    if (state.elements.addSetRangeBtn) state.elements.addSetRangeBtn.addEventListener("click", () => handleSetRangeAction("add"));
    if (state.elements.removeSetRangeBtn) state.elements.removeSetRangeBtn.addEventListener("click", () => handleSetRangeAction("remove"));
    if (state.elements.replaceSetRangeBtn) state.elements.replaceSetRangeBtn.addEventListener("click", () => handleSetRangeAction("replace"));
    if (state.elements.deleteSetBtn) state.elements.deleteSetBtn.addEventListener("click", handleDeleteSelectedSet);
    if (state.elements.setupIntroduceBtn) state.elements.setupIntroduceBtn.addEventListener("click", () => startSmartForSet(state.elements.setupDeckSelect?.value || getActiveSet().id, "introduce"));
    if (state.elements.setupReviewBtn) state.elements.setupReviewBtn.addEventListener("click", () => startSmartForSet(state.elements.setupDeckSelect?.value || getActiveSet().id, "review"));
    if (state.elements.activeSetSelect) state.elements.activeSetSelect.addEventListener("change", handleSetChange);
    if (state.elements.reviewSetSelect) state.elements.reviewSetSelect.addEventListener("change", handleReviewSetChange);
    if (state.elements.toggleFullScheduleBtn) state.elements.toggleFullScheduleBtn.addEventListener("click", toggleFullReviewSchedule);
    if (state.elements.startDueReviewBtn) state.elements.startDueReviewBtn.addEventListener("click", startDueReviewCards);
    if (state.elements.startNewCardsBtn) state.elements.startNewCardsBtn.addEventListener("click", startNewCardIntroduction);
    if (typeof runtime.bindImageEvents === "function") runtime.bindImageEvents();
    window.addEventListener("keydown", handleTranslationKeyboard);
    window.addEventListener("keydown", handlePinyinKeyboard);
    window.addEventListener("focus", () => { refreshRemoteState(false); });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refreshRemoteState(false);
    });
  }

  // App startup order matters: auth first, then remote-capable store load, then render.
  // There is no app-data local cache; unsigned sessions start from built-in memory.
  async function bootstrap() {
    state.elements = getElements();
    if (ns.auth && typeof ns.auth.init === "function") {
      await ns.auth.init();
    }
    const builtinCards = ns.getBuiltInCards();
    const builtinImageCards = typeof ns.getBuiltInImageCards === "function" ? ns.getBuiltInImageCards() : [];
    const builtinSentenceCards = typeof ns.getBuiltInSentenceCards === "function" ? ns.getBuiltInSentenceCards() : [];
    const adapter = createPersistenceAdapter();
    state.store = createAppStore(adapter, builtinCards, builtinImageCards, builtinSentenceCards);
    state.authScope = ns.auth && typeof ns.auth.getCacheScope === "function" ? ns.auth.getCacheScope() : "anon";
    await state.store.load();
    state.filterText = state.elements.filterInput?.value || "";
    state.currentPage = getAuthStatus().signedIn ? "flashcards" : "login";
    updateStorageModeBadge();
    if (ns.auth && typeof ns.auth.subscribe === "function") {
      ns.auth.subscribe(handleAuthStateChange);
    }
    bindEvents();
    render();
  }


  Object.assign(runtime, {
    render,
    setMode,
    setQuizTypeForCurrentMode,
    shuffleCurrentMode,
    resetCurrentModeOrder,
    updateCardMode,
    applyRangeToMode,
    setAllForMode,
    handleResetProgress,
    handleSaveNamedSet,
    getCardsFromSetRangeInput,
    handleSetRangeAction,
    handleDeleteSelectedSet,
    handleSetChange,
    handleReviewSetChange,
    toggleFullReviewSchedule,
    handleSetupDeckSelectChange,
    handleSetupDeckVisibilityChange,
    handleManageListChange,
    handleRangeButtonClick,
    handleTranslationKeyboard,
    handlePinyinKeyboard,
    toggleSetupPanel,
    bindEvents,
    bootstrap
  });
})(window.HSKFlashcards);
