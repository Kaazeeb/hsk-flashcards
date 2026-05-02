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

    const card = getCurrentCard();
    if (!card) {
      if (isSmartPracticeActive()) {
        renderSmartBlocked();
        return;
      }
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

    if (isSmartPracticeActive()) {
      const queue = getSmartQueue(new Date());
      if (!queue.length) {
        renderSmartBlocked();
        return;
      }
      const activeSmartItems = getSmartItems(new Date());
      const summary = getReviewScheduleSummary();
      renderSmartPractice(card, activeSmartItems.length, summary.startedCount);
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

  function updateCardMode(id, mode, checked) {
    const card = getDb().vocab.find((item) => cardId(item) === id);
    if (!card || !MODES.includes(mode)) return;
    card[mode] = checked;
    ensureOrder(mode);
    resetRoundState();
    markManageListDirty();
    persist();
    render();
  }

  function applyRangeToMode(mode, include) {
    const input = state.elements[`range${mode.charAt(0).toUpperCase()}${mode.slice(1)}`];
    const ranges = parseRangeInput(input?.value || "");
    if (!ranges.size) return;
    let changed = 0;
    getScopedCards().forEach((card) => {
      if (!ranges.has(card.index)) return;
      if (card[mode] !== include) {
        card[mode] = include;
        changed += 1;
      }
    });
    if (!changed) return;
    ensureOrder(mode);
    resetRoundState();
    markManageListDirty();
    persist();
    render();
  }

  function setAllForMode(mode, value) {
    let changed = 0;
    getScopedCards().forEach((card) => {
      if (card[mode] !== value) {
        card[mode] = value;
        changed += 1;
      }
    });
    if (!changed) return;
    ensureOrder(mode);
    resetRoundState();
    markManageListDirty();
    persist();
    render();
  }

  async function handleSaveVocabulary() {
    const rawText = state.elements.vocabInput.value.trim();
    if (!rawText) {
      state.elements.statusText.textContent = "Paste a CSV first, or use Restore built-in.";
      return;
    }
    const rows = parseCSV(rawText);
    const cards = mapRowsToCards(rows);
    if (!cards.length) {
      state.elements.statusText.textContent = "Could not find valid rows. Expected hanzi, pinyin and translation.";
      return;
    }
    await state.store.replaceVocabulary(cards, { preserveData: false });
    state.filterText = "";
    state.elements.filterInput.value = "";
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = `${cards.length} cards saved locally. Custom sets and progress were reset for the new vocabulary.`;
    render();
  }

  async function handleRestoreBuiltIn() {
    const result = await state.store.restoreBuiltIn();
    state.elements.vocabInput.value = "";
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = result?.resetProgress
      ? "Built-in vocabulary restored. Progress was reset to avoid replaying old review history onto a different deck."
      : "Built-in vocabulary restored. Existing sets and progress were kept where card IDs still matched.";
    render();
  }

  async function handleResetProgress() {
    await state.store.resetProgress("manual_reset");
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = "Progress reset locally and marked as a new remote review epoch.";
    render();
  }

  function triggerTextDownload(filename, text, mimeType = "application/json") {
    const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function handleExportApp() {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    triggerTextDownload(`hsk-flashcards-app-${stamp}.json`, state.store.exportJson());
    state.elements.statusText.textContent = "App data exported as JSON.";
  }

  function handleImportAppClick() {
    state.elements.importProgressInput.value = "";
    state.elements.importProgressInput.click();
  }

  async function handleImportAppFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await state.store.importJson(String(reader.result || ""));
        resetRoundState();
        markManageListDirty();
        state.elements.statusText.textContent = `App data imported from ${file.name}.`;
        render();
      } catch (error) {
        state.elements.statusText.textContent = "Could not import the selected JSON file.";
      }
    };
    reader.onerror = () => {
      state.elements.statusText.textContent = "Could not read the selected JSON file.";
    };
    reader.readAsText(file);
  }

  async function handleSaveNamedSet() {
    const name = state.elements.setNameInput.value.trim();
    if (!name) {
      state.elements.statusText.textContent = "Enter a set name first.";
      return;
    }
    const practiceIds = getScopedCards().filter((card) => card.practice !== false).map((card) => cardId(card));
    if (!practiceIds.length) {
      state.elements.statusText.textContent = "No Practice cards are currently selected in this editing set.";
      return;
    }
    const record = await state.store.saveNamedSet(name, practiceIds);
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = `Named set saved from Practice selection: ${record.name} (${record.cardIds.length} cards).`;
    render();
  }

  function getCardsFromSetRangeInput() {
    const ranges = parseRangeInput(state.elements.setRangeInput?.value || "");
    if (!ranges.size) return [];
    return getDb().vocab.filter((card) => ranges.has(card.index));
  }

  async function handleSetRangeAction(action) {
    const activeSet = getActiveSet();
    const cards = getCardsFromSetRangeInput();
    if (!cards.length) {
      state.elements.statusText.textContent = "Enter ranges that match at least one card, for example 301-330.";
      return;
    }
    if (action === "add" || action === "replace") {
      cards.forEach((card) => { card.practice = true; });
    }
    const ids = cards.map((card) => cardId(card));
    let record = null;

    if ((!activeSet || activeSet.locked) && action !== "replace") {
      state.elements.statusText.textContent = "Choose a named set before adding or removing ranges.";
      return;
    }

    if (action === "add") {
      record = await state.store.addCardsToSet(activeSet.id, ids);
      state.elements.statusText.textContent = `Added ${ids.length} card${ids.length === 1 ? "" : "s"} to ${activeSet.name}. Added cards are new until Smart introduction.`;
    } else if (action === "remove") {
      record = await state.store.removeCardsFromSet(activeSet.id, ids);
      state.elements.statusText.textContent = `Removed matching range cards from ${activeSet.name}.`;
    } else if (action === "replace") {
      if (activeSet && !activeSet.locked) {
        record = await state.store.updateSetCards(activeSet.id, ids);
        state.elements.statusText.textContent = `Replaced ${activeSet.name} with ${record?.cardIds?.length || 0} cards from ranges.`;
      } else {
        const name = state.elements.setNameInput.value.trim();
        if (!name) {
          state.elements.statusText.textContent = "Enter a set name first to create a set from ranges.";
          return;
        }
        record = await state.store.saveNamedSet(name, ids);
        state.elements.statusText.textContent = `Named set saved from ranges: ${record.name} (${record.cardIds.length} cards).`;
      }
    }
    if (!record) {
      state.elements.statusText.textContent = "Could not update that set.";
      return;
    }
    state.elements.setRangeInput.value = "";
    resetRoundState();
    markManageListDirty();
    render();
  }

  async function handleDeleteSelectedSet() {
    const activeSet = getActiveSet();
    if (!activeSet || activeSet.locked) return;
    await state.store.deleteSet(activeSet.id);
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = `Deleted set: ${activeSet.name}.`;
    render();
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
    if (state.currentPage !== "flashcards") return;
    const active = document.activeElement;
    const isTypingField = active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    if (!getCurrentCard()) return;

    if (isSmartPracticeActive() && state.round.smartStage === "feedback") {
      if (/[1-4]/.test(event.key)) {
        event.preventDefault();
        setSmartRating(Number(event.key));
        return;
      }
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveSmartRatingSelection(1);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
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
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveTranslationSelection(1);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
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

    if (state.round.answered && (event.key === "Enter" || event.key === "ArrowRight")) {
      event.preventDefault();
      nextCard();
    }
  }

  function handlePinyinKeyboard(event) {
    if (state.currentPage !== "flashcards") return;
    const active = document.activeElement;
    const isTextInput = active && active.tagName === "INPUT" && active.type === "text";
    if (event.key !== "Enter" && event.key !== "ArrowRight") return;

    if (isSmartPracticeActive() && state.round.smartForceNew && state.round.smartStage === "intro") {
      event.preventDefault();
      introduceCurrentSmartCard();
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
    state.elements.saveVocabBtn.addEventListener("click", handleSaveVocabulary);
    state.elements.loadPlaceholderBtn.addEventListener("click", handleRestoreBuiltIn);
    state.elements.resetProgressBtn.addEventListener("click", handleResetProgress);
    state.elements.exportProgressBtn.addEventListener("click", handleExportApp);
    state.elements.importProgressBtn.addEventListener("click", handleImportAppClick);
    state.elements.importProgressInput.addEventListener("change", handleImportAppFile);
    state.elements.shuffleBtn.addEventListener("click", shuffleCurrentMode);
    state.elements.resetOrderBtn.addEventListener("click", resetCurrentModeOrder);
    state.elements.setupToggleBtn.addEventListener("click", toggleSetupPanel);
    state.elements.manageList.addEventListener("change", handleManageListChange);
    state.elements.filterInput.addEventListener("input", (event) => {
      state.filterText = event.target.value || "";
      markManageListDirty();
      renderManageListIfNeeded(true);
    });
    state.elements.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    state.elements.quizTypeButtons.forEach((button) => button.addEventListener("click", () => setQuizTypeForCurrentMode(button.dataset.quiz)));
    state.elements.rangeButtons.forEach((button) => button.addEventListener("click", handleRangeButtonClick));
    state.elements.saveSetBtn.addEventListener("click", handleSaveNamedSet);
    if (state.elements.addSetRangeBtn) state.elements.addSetRangeBtn.addEventListener("click", () => handleSetRangeAction("add"));
    if (state.elements.removeSetRangeBtn) state.elements.removeSetRangeBtn.addEventListener("click", () => handleSetRangeAction("remove"));
    if (state.elements.replaceSetRangeBtn) state.elements.replaceSetRangeBtn.addEventListener("click", () => handleSetRangeAction("replace"));
    state.elements.deleteSetBtn.addEventListener("click", handleDeleteSelectedSet);
    if (state.elements.setupIntroduceBtn) state.elements.setupIntroduceBtn.addEventListener("click", () => startSmartForSet(getActiveSet().id, "introduce"));
    if (state.elements.setupReviewBtn) state.elements.setupReviewBtn.addEventListener("click", () => startSmartForSet(getActiveSet().id, "review"));
    state.elements.activeSetSelect.addEventListener("change", handleSetChange);
    if (state.elements.reviewSetSelect) state.elements.reviewSetSelect.addEventListener("change", handleReviewSetChange);
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
    const adapter = createPersistenceAdapter();
    state.store = createAppStore(adapter, builtinCards, builtinImageCards);
    state.authScope = ns.auth && typeof ns.auth.getCacheScope === "function" ? ns.auth.getCacheScope() : "anon";
    await state.store.load();
    state.filterText = state.elements.filterInput.value || "";
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
    handleSaveVocabulary,
    handleRestoreBuiltIn,
    handleResetProgress,
    triggerTextDownload,
    handleExportApp,
    handleImportAppClick,
    handleImportAppFile,
    handleSaveNamedSet,
    getCardsFromSetRangeInput,
    handleSetRangeAction,
    handleDeleteSelectedSet,
    handleSetChange,
    handleReviewSetChange,
    handleManageListChange,
    handleRangeButtonClick,
    handleTranslationKeyboard,
    handlePinyinKeyboard,
    toggleSetupPanel,
    bindEvents,
    bootstrap
  });
})(window.HSKFlashcards);
