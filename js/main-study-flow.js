/**
 * Main UI split: Study answer flow and flashcard renderers.
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
  const getReviewSourceById = proxy("getReviewSourceById");
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
  const getSmartBucketForReviewSourceId = proxy("getSmartBucketForReviewSourceId");
  const isSentenceCard = proxy("isSentenceCard");
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
  const render = proxy("render");
  const setMode = proxy("setMode");
  const setQuizTypeForCurrentMode = proxy("setQuizTypeForCurrentMode");
  const shuffleCurrentMode = proxy("shuffleCurrentMode");
  const resetCurrentModeOrder = proxy("resetCurrentModeOrder");
  const updateCardMode = proxy("updateCardMode");
  const applyRangeToMode = proxy("applyRangeToMode");
  const setAllForMode = proxy("setAllForMode");
  const handleResetProgress = proxy("handleResetProgress");
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

  function buildTranslationOptionsForCard(card, mode = getUi().mode) {
    const modeCards = getModeCards(mode);
    const uniqueDistractors = [];
    modeCards.forEach((candidateCard) => {
      const translation = String(candidateCard.translation || "").trim();
      if (!translation || translation === card.translation) return;
      if (!uniqueDistractors.includes(translation)) uniqueDistractors.push(translation);
    });
    const optionCount = Math.min(4, uniqueDistractors.length + 1);
    const pickedDistractors = shuffle(uniqueDistractors).slice(0, Math.max(0, optionCount - 1));
    const options = shuffle([
      ...pickedDistractors.map((label) => ({ label, correct: false })),
      { label: card.translation, correct: true }
    ]);
    return options;
  }

  function updateTranslationSelectionUI() {
    const buttons = [...state.elements.answerArea.querySelectorAll(".answer-btn[data-option-index]")];
    buttons.forEach((button) => {
      const index = Number(button.dataset.optionIndex);
      button.classList.toggle("selected", !state.round.answered && index === state.round.keyboardChoiceIndex);
    });
  }

  function selectTranslationOption(index) {
    if (state.round.answered) return;
    const nextIndex = clamp(index, 0, Math.max(0, state.round.options.length - 1));
    if (state.round.keyboardChoiceIndex === nextIndex) return;
    state.round.keyboardChoiceIndex = nextIndex;
    updateTranslationSelectionUI();
  }

  function moveTranslationSelection(direction) {
    if (state.round.answered || !state.round.options.length) return;
    const current = state.round.keyboardChoiceIndex >= 0 ? state.round.keyboardChoiceIndex : 0;
    const next = (current + direction + state.round.options.length) % state.round.options.length;
    selectTranslationOption(next);
  }

  function answerTranslation(option) {
    if (state.round.answered) return;
    const card = getCurrentCard();
    if (!card) return;
    const correct = !!option.correct;
    state.round.answered = true;
    state.round.selectedLabel = option.label;
    state.round.selectedCorrect = correct;
    state.round.resultText = correct
      ? `Correct. ${card.hanzi} = ${card.translation} (${card.pinyin})`
      : `Wrong. ${card.hanzi} = ${card.translation} (${card.pinyin})`;
    state.round.resultClass = correct ? "ok" : "bad";
    recordQuizResult(getUi().mode, "translation", correct ? "correct" : "wrong");
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function retryPinyinWithoutPenalty() {
    if (!state.round.pendingWrong) return;
    state.round.pendingWrong = false;
    state.round.pendingCheck = null;
    state.round.resultText = "";
    state.round.resultClass = "";
    render();
  }

  function acceptPendingPinyinWrong() {
    if (!state.round.pendingWrong) return;
    const card = getCurrentCard();
    if (!card) return;
    const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
    state.round.pendingWrong = false;
    state.round.answered = true;
    state.round.selectedCorrect = false;
    state.round.resultText = `Wrong. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
    state.round.resultClass = "bad";
    recordQuizResult("practice", "pinyin", "wrong");
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function submitPinyinAnswer(event) {
    event.preventDefault();
    if (state.round.answered || state.round.pendingWrong) return;
    const card = getCurrentCard();
    if (!card) return;
    const form = event.currentTarget;
    const input = form.querySelector("input");
    const answerText = input ? input.value : "";
    const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
    const check = checkPinyinAnswer(answerText, card);
    state.round.answerText = answerText;
    state.round.selectedCorrect = check.correct;
    state.round.pendingCheck = check;

    if (getUi().mode === "practice" && !check.correct) {
      state.round.pendingWrong = true;
      state.round.resultText = check.formatValid
        ? "Not counted yet. Retry without penalty if this was a typo, or press Enter to count it wrong and reveal the answer."
        : "Not counted yet. The answer must match the numeric pinyin shown for this card exactly. Retry without penalty, or press Enter to count it wrong and reveal the answer.";
      state.round.resultClass = "bad";
      render();
      scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
      return;
    }

    state.round.answered = true;
    state.round.resultText = !check.formatValid
      ? `Use the hardcoded numeric pinyin exactly. Neutral tone has no number. Example: ni3hao3, nv3, shen2me. Correct pinyin: ${reviewAnswer}${reviewSuffix}`
      : check.correct
        ? `Correct. ${card.hanzi} = ${reviewAnswer}`
        : `Wrong. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
    state.round.resultClass = check.correct ? "ok" : "bad";
    recordQuizResult(getUi().mode, "pinyin", check.correct ? "correct" : "wrong");
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function retrySmartPinyinWithoutPenalty() {
    if (!state.round.pendingWrong) return;
    state.round.pendingWrong = false;
    state.round.pendingCheck = null;
    state.round.resultText = "";
    state.round.resultClass = "";
    render();
  }

  function acceptPendingSmartPinyinWrong() {
    if (!state.round.pendingWrong) return;
    const card = getCurrentCard();
    if (!card) return;
    const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
    state.round.pendingWrong = false;
    state.round.smartPinyinCorrect = false;
    state.round.smartStage = "translation";
    state.round.keyboardChoiceIndex = -1;
    state.round.options = buildTranslationOptionsForCard(card, "practice");
    state.round.resultText = `Wrong pinyin. Correct pinyin: ${reviewAnswer}${reviewSuffix}. Now choose the translation.`;
    state.round.resultClass = "bad";
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function submitSmartPinyinAnswer(event) {
    event.preventDefault();
    if (state.round.smartStage !== "pinyin" || state.round.pendingWrong) return;
    const card = getCurrentCard();
    if (!card) return;
    const form = event.currentTarget;
    const input = form.querySelector("input");
    const answerText = input ? input.value : "";
    const check = checkPinyinAnswer(answerText, card);
    state.round.answerText = answerText;
    state.round.pendingCheck = check;
    if (!check.correct) {
      state.round.pendingWrong = true;
      state.round.resultText = check.formatValid
        ? "Not counted yet. Retry without penalty if this was a typo, or press Enter to count it wrong and reveal the answer before step 2."
        : "Not counted yet. The answer must match the numeric pinyin shown for this card exactly. Retry without penalty, or press Enter to count it wrong and reveal the answer before step 2.";
      state.round.resultClass = "bad";
      render();
      scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
      return;
    }
    state.round.smartPinyinCorrect = true;
    state.round.smartStage = "translation";
    state.round.keyboardChoiceIndex = -1;
    state.round.options = buildTranslationOptionsForCard(card, "practice");
    state.round.resultText = "Pinyin correct. Now choose the translation.";
    state.round.resultClass = "ok";
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function setSmartRating(rating) {
    if (!SMART_RATINGS.includes(rating)) return;
    state.round.smartSelectedRating = rating;
    updateSmartRatingUI();
  }

  function updateSmartRatingUI() {
    const buttons = [...state.elements.answerArea.querySelectorAll(".answer-btn[data-smart-rating]")];
    buttons.forEach((button) => {
      const rating = Number(button.dataset.smartRating);
      button.classList.toggle("selected", rating === state.round.smartSelectedRating);
    });
  }

  function moveSmartRatingSelection(direction) {
    const currentIndex = SMART_RATINGS.indexOf(state.round.smartSelectedRating);
    const baseIndex = currentIndex >= 0 ? currentIndex : 2;
    const nextIndex = (baseIndex + direction + SMART_RATINGS.length) % SMART_RATINGS.length;
    setSmartRating(SMART_RATINGS[nextIndex]);
  }

  // This is the moment a Smart review becomes durable: the selected FSRS rating
  // updates local scheduling state and produces an append-only sync event.
  function acceptSmartFsrsFeedback() {
    if (state.round.smartStage !== "feedback" || state.round.smartFeedbackCommitted) return;
    const card = getCurrentCard();
    if (!card) return;
    state.round.smartFeedbackCommitted = true;
    const smartSetId = state.round.smartSetId || getPrimaryReviewSet().id;
    const selectedRating = state.round.smartSelectedRating;
    const bucket = getSmartBucketForReviewSourceId(smartSetId);
    smart.reviewCard(bucket, card, selectedRating, new Date());
    if (selectedRating === 1) {
      deferSmartCardToSessionTail(smartSetId, card);
    }
    persist();
    nextSmartCard();
  }

  // Smart review result is determined by both stages, but scheduling is delayed
  // until the user gives the FSRS rating in the next feedback step.
  function answerSmartTranslation(option) {
    if (state.round.smartStage !== "translation") return;
    const card = getCurrentCard();
    if (!card) return;
    const translationCorrect = !!option.correct;
    const overallCorrect = state.round.smartPinyinCorrect === true && translationCorrect;
    state.round.selectedLabel = option.label;
    state.round.selectedCorrect = translationCorrect;
    state.round.smartTranslationCorrect = translationCorrect;
    state.round.smartOutcomeCorrect = overallCorrect;
    state.round.smartSelectedRating = overallCorrect ? 3 : 1;
    state.round.smartStage = "feedback";
    state.round.answered = true;
    state.round.resultText = overallCorrect
      ? `Correct. ${card.hanzi} = ${card.translation} (${card.pinyin}). Choose an FSRS rating.`
      : `Wrong. ${card.hanzi} = ${card.translation} (${card.pinyin}). Choose an FSRS rating.`;
    state.round.resultClass = overallCorrect ? "ok" : "bad";
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function moveInOrderedMode(step) {
    const total = getOrderedIds().length;
    if (!total) return;
    finalizeRoundAppearance();
    const current = getUi().indexes[getUi().mode] || 0;
    const next = step > 0
      ? (current >= total - 1 ? 0 : current + 1)
      : (current <= 0 ? total - 1 : current - 1);
    getUi().indexes[getUi().mode] = next;
    resetRoundState();
    persist();
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function nextCard() {
    if (isSmartPracticeActive()) return nextSmartCard();
    moveInOrderedMode(1);
  }

  function prevCard() {
    if (isSmartPracticeActive()) return;
    moveInOrderedMode(-1);
  }

  async function startSmartForSet(setId, flow) {
    const source = getReviewSourceById(setId);
    if (!source) return;
    if (typeof state.store.setReviewSet === "function") {
      await state.store.setReviewSet(setId);
    } else {
      getUi().reviewSetId = setId;
      await persist();
    }
    if (source.kind === "vocab") await state.store.setActiveSet(setId);
    if (flow === "introduce") {
      startNewCardIntroduction();
    } else {
      startDueReviewCards();
    }
  }

  function startDueReviewCards() {
    getUi().mode = "practice";
    getUi().quizType.practice = "smart";
    resetRoundState();
    clearSmartSessionDeferrals();
    state.round.smartForceNew = false;
    state.currentPage = "flashcards";
    persist();
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function startNewCardIntroduction() {
    getUi().mode = "practice";
    getUi().quizType.practice = "smart";
    resetRoundState();
    clearSmartSessionDeferrals();
    state.round.smartForceNew = true;
    state.currentPage = "flashcards";
    persist();
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function startNextNewSmartCard() {
    startNewCardIntroduction();
  }

  function nextSmartCard() {
    const keepNewFlow = !!state.round.smartForceNew;
    state.smartLastCardId = cardId(getCurrentCard() || "");
    state.smartLastSetId = state.round.smartSetId || "";
    resetRoundState();
    state.round.smartForceNew = keepNewFlow;
    persist();
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function renderStudyLearn(card, queueIndex, total) {
    const isStrokeCard = card.direction === "stroke_sequence";
    state.elements.cardPrompt.textContent = `Study card · ${getSentenceFrontLabel(card)}`;
    state.elements.cardHanzi.textContent = card.front || card.chinese || "—";
    state.elements.cardPinyin.textContent = isStrokeCard
      ? "Code: 1 横, 2 竖, 3 撇, 4 捺/点, 5 折"
      : String(card.pinyin || "");
    state.elements.cardTranslation.textContent = card.back || "";
    clearNode(state.elements.answerArea);
    if (card.direction === "zh_qa") {
      const marker = document.createElement("div");
      marker.className = "intro-note muted";
      marker.textContent = "Q→A: expected answer is Chinese, not English.";
      state.elements.answerArea.appendChild(marker);
    }
    if (isStrokeCard) {
      const answer = document.createElement("div");
      answer.className = "intro-note muted";
      answer.textContent = `Hardcoded stroke answer: ${getStrokeAnswerForCard(card)}`;
      state.elements.answerArea.appendChild(answer);
    }
    updateResult(state.elements.resultText, "Learn mode shows both sides. Press Enter for the next card.", "");
    setPositionLabel(card, queueIndex, total);
    prepareRoundAppearance("learn", "", card);
    renderCurrentCardStats(card);

    clearNode(state.elements.controls);
    state.elements.controls.append(
      createButton("Previous", prevCard, "secondary"),
      createButton("Next", nextCard)
    );
  }

  function renderLearn(card, queueIndex, total) {
    if (isSentenceCard(card)) {
      renderStudyLearn(card, queueIndex, total);
      return;
    }
    state.elements.cardPrompt.textContent = "Vocabulary";
    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = card.pinyin;
    state.elements.cardTranslation.textContent = card.translation;
    clearNode(state.elements.answerArea);
    updateResult(state.elements.resultText, "Press Enter for the next card.", "");
    setPositionLabel(card, queueIndex, total);
    prepareRoundAppearance("learn", "", card);
    renderCurrentCardStats(card);

    clearNode(state.elements.controls);
    state.elements.controls.append(
      createButton("Previous", prevCard, "secondary"),
      createButton("Next", nextCard)
    );
  }

  function renderTranslationButtons(answerHandler) {
    clearNode(state.elements.answerArea);
    state.round.options.forEach((option, index) => {
      const keyLabel = ["A", "B", "C", "D"][index] || String(index + 1);
      const button = createButton(`${keyLabel}. ${option.label}`, () => answerHandler(option), "answer-btn", { dataset: { optionIndex: String(index) } });
      if (!state.round.answered && state.round.keyboardChoiceIndex === index) button.classList.add("selected");
      if (state.round.answered) {
        if (option.correct) button.classList.add("correct");
        if (!option.correct && option.label === state.round.selectedLabel && !state.round.selectedCorrect) button.classList.add("wrong");
        button.disabled = true;
      }
      state.elements.answerArea.appendChild(button);
    });
  }

  function renderTranslationQuiz(card, queueIndex, total) {
    state.elements.cardPrompt.textContent = "Choose the English translation";
    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = state.round.answered ? card.pinyin : "";
    state.elements.cardTranslation.textContent = state.round.answered ? card.translation : "";
    setPositionLabel(card, queueIndex, total);
    prepareRoundAppearance(getUi().mode, "translation", card);
    renderCurrentCardStats(card);

    if (!state.round.options.length) state.round.options = buildTranslationOptionsForCard(card, getUi().mode);
    updateResult(
      state.elements.resultText,
      state.round.answered ? state.round.resultText : "Pick one option. Keyboard: A-D / arrows, Enter to answer.",
      state.round.answered ? state.round.resultClass : ""
    );

    renderTranslationButtons(answerTranslation);
    clearNode(state.elements.controls);
    state.elements.controls.append(
      createButton("Previous", prevCard, "secondary"),
      createButton(state.round.answered ? "Next" : "Skip", nextCard, state.round.answered ? "" : "secondary")
    );
  }

  function renderPinyinQuiz(card, queueIndex, total) {
    const { reviewText } = getReviewPinyinText(card);
    state.elements.cardPrompt.textContent = "Type the exact numeric pinyin";
    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = state.round.answered ? reviewText : "";
    state.elements.cardTranslation.textContent = state.round.answered ? card.translation : "";
    setPositionLabel(card, queueIndex, total);
    prepareRoundAppearance(getUi().mode, "pinyin", card);
    renderCurrentCardStats(card);
    updateResult(
      state.elements.resultText,
      state.round.pendingWrong
        ? state.round.resultText
        : state.round.answered
          ? state.round.resultText
          : "Use the hardcoded numeric pinyin exactly. Example: ni3hao3, nv3, shen2me. Neutral tone has no number.",
      state.round.pendingWrong || state.round.answered ? state.round.resultClass : ""
    );

    clearNode(state.elements.answerArea);
    const form = document.createElement("form");
    form.className = "answer-form";
    form.addEventListener("submit", submitPinyinAnswer);
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = getPinyinInputPlaceholder();
    input.value = state.round.answerText;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.disabled = state.round.answered || state.round.pendingWrong;
    const submitBtn = createButton(state.round.pendingWrong ? "Pending" : state.round.answered ? "Checked" : "Submit", null, state.round.answered || state.round.pendingWrong ? "secondary" : "", { type: "submit", disabled: state.round.answered || state.round.pendingWrong });
    form.append(input, submitBtn);
    state.elements.answerArea.appendChild(form);

    if (state.round.pendingWrong) {
      const pendingRow = document.createElement("div");
      pendingRow.className = "answer-pending-row";
      pendingRow.appendChild(createButton("Retry without error", retryPinyinWithoutPenalty, "secondary"));
      state.elements.answerArea.appendChild(pendingRow);
    }

    if (!state.round.answered && !state.round.pendingWrong && shouldAutoFocusPinyinInput()) {
      setTimeout(() => {
        try {
          input.focus({ preventScroll: true });
        } catch (error) {
          input.focus();
        }
      }, 0);
    }

    clearNode(state.elements.controls);
    if (state.round.pendingWrong) {
      state.elements.controls.append(
        createButton("Previous", prevCard, "secondary"),
        createButton("Count wrong", acceptPendingPinyinWrong)
      );
    } else {
      state.elements.controls.append(
        createButton("Previous", prevCard, "secondary"),
        createButton(state.round.answered ? "Next" : "Skip", nextCard, state.round.answered ? "" : "secondary")
      );
    }
  }

  function getSentenceFrontLabel(card) {
    if (card.direction === "en_to_zh") return "English → Chinese";
    if (card.direction === "zh_qa") return "Q→A · answer in Chinese";
    if (card.direction === "hanzi_to_pinyin") return "Hanzi → pinyin";
    if (card.direction === "measure_word") return "Word → measure words";
    if (card.direction === "stroke_sequence") return "Pinyin + meaning → 5-stroke sequence";
    return "Chinese → English";
  }

  function normalizeStrokeInput(value) {
    return String(value || "").replace(/[^1-5]/g, "");
  }

  function getStrokeAnswerForCard(card) {
    const existing = normalizeStrokeInput(card?.strokeAnswer);
    if (existing) return existing;
    const fallback = ns.strokeOrder?.getStrokeSequenceForHanzi?.(card?.strokeSourceChar || card?.chinese);
    const expected = normalizeStrokeInput(fallback);
    if (expected) {
      card.strokeAnswer = expected;
      card.back = `${card.chinese} · ${card.english || ""} · ${expected}`;
      return expected;
    }
    throw new Error(`No hardcoded stroke sequence available for ${card?.chinese || "this card"}.`);
  }

  async function submitSmartStrokeAnswer(event) {
    event.preventDefault();
    if (state.round.smartStage !== "stroke-answer" || state.round.strokeLoading) return;
    const card = getCurrentCard();
    if (!card) return;
    const form = event.currentTarget;
    const input = form.querySelector("input");
    const answerText = input ? input.value : "";
    const normalized = normalizeStrokeInput(answerText);
    state.round.answerText = answerText;
    try {
      const expected = getStrokeAnswerForCard(card);
      const correct = !!expected && normalized === expected;
      state.round.selectedCorrect = correct;
      state.round.smartSelectedRating = correct ? 3 : 1;
      state.round.smartStage = "feedback";
      state.round.answered = true;
      state.round.strokeLoading = false;
      state.round.resultText = correct
        ? `Correct. ${card.chinese} 5-stroke sequence: ${expected}. Choose an FSRS rating.`
        : `Wrong. ${card.chinese} 5-stroke sequence: ${expected}. Choose an FSRS rating.`;
      state.round.resultClass = correct ? "ok" : "bad";
    } catch (error) {
      console.warn(error);
      state.round.strokeLoading = false;
      state.round.resultText = `No hardcoded stroke data for ${card.chinese}. Skip this card.`;
      state.round.resultClass = "bad";
    }
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function renderSmartSentenceIntroduction(card, newCount, startedCount) {
    const smartSetId = state.round.smartSetId || getPrimaryReviewSet().id;
    const sourceName = getReviewScopeName();
    state.round.smartStage = "intro";
    prepareRoundAppearance("practice", "smart", card);
    renderCurrentCardStats(card);
    state.elements.cardPrompt.textContent = `Smart · sentence first view · ${sourceName}`;
    state.elements.cardHanzi.textContent = card.front;
    state.elements.cardPinyin.textContent = "";
    state.elements.cardTranslation.textContent = card.back;
    state.elements.positionLabel.textContent = `New ${newCount} / Started ${startedCount}`;
    updateResult(state.elements.resultText, `${getSentenceFrontLabel(card)}. Mark introduced when you have read both sides.`, "");
    clearNode(state.elements.answerArea);
    const note = document.createElement("div");
    note.className = "intro-note muted";
    note.textContent = card.direction === "zh_qa" ? "Q→A marker: this card expects a Chinese answer, not a translation." : "Built-in study cards use flip + manual FSRS rating unless the card asks for a numeric stroke sequence.";
    state.elements.answerArea.appendChild(note);
    clearNode(state.elements.controls);
    state.elements.controls.append(
      createButton("Skip", nextSmartCard, "secondary"),
      createButton("Mark introduced", introduceCurrentSmartCard)
    );
  }

  function showSmartSentenceAnswer() {
    if (state.round.smartStage !== "sentence-question") return;
    const card = getCurrentCard();
    if (!card) return;
    state.round.smartStage = "feedback";
    state.round.smartSelectedRating = 3;
    state.round.answered = true;
    state.round.resultText = card.direction === "zh_qa"
      ? "Compare your Chinese answer, then choose the FSRS rating."
      : "Choose the FSRS rating for this card.";
    state.round.resultClass = "";
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function renderSmartSentencePractice(card, dueCount, activeCount) {
    const smartSetId = state.round.smartSetId || getPrimaryReviewSet().id;
    if (state.round.smartForceNew) {
      renderSmartSentenceIntroduction(card, dueCount, activeCount);
      return;
    }
    if (state.round.smartStage === "pinyin") state.round.smartStage = card.direction === "stroke_sequence" ? "stroke-answer" : "sentence-question";
    prepareRoundAppearance("practice", "smart", card);
    setSmartPositionLabel(card, dueCount, activeCount);
    renderCurrentCardStats(card);
    state.elements.cardPrompt.textContent = `Smart study · ${getDb().sets.byId[smartSetId]?.name || getReviewScopeName()} · ${getSentenceFrontLabel(card)}`;
    state.elements.cardHanzi.textContent = card.front;
    state.elements.cardPinyin.textContent = card.direction === "stroke_sequence" ? "Enter 1-5 stroke numbers" : "";
    state.elements.cardTranslation.textContent = state.round.smartStage === "feedback" ? card.back : "";
    clearNode(state.elements.answerArea);
    clearNode(state.elements.controls);
    if (state.round.smartStage === "stroke-answer") {
      updateResult(state.elements.resultText, state.round.resultText || "Type the hardcoded 5-stroke numeric sequence. Code: 1 横, 2 竖, 3 撇, 4 捺/点, 5 折.", state.round.resultClass || "");
      const form = document.createElement("form");
      form.className = "pinyin-form";
      form.addEventListener("submit", submitSmartStrokeAnswer);
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.autocomplete = "off";
      input.placeholder = "example: 1234";
      input.className = "pinyin-input";
      input.value = state.round.answerText || "";
      input.disabled = !!state.round.strokeLoading;
      const button = createButton("Check", null, "answer-btn");
      button.type = "submit";
      button.disabled = !!state.round.strokeLoading;
      form.append(input, button);
      state.elements.answerArea.appendChild(form);
      if (card.strokeLegend) {
        const legend = document.createElement("div");
        legend.className = "intro-note muted";
        legend.textContent = card.strokeLegend;
        state.elements.answerArea.appendChild(legend);
      }
      state.elements.controls.append(createButton("Skip", nextSmartCard, "secondary"));
      setTimeout(() => input.focus({ preventScroll: true }), 0);
      return;
    }
    if (state.round.smartStage === "sentence-question") {
      const prompt = card.direction === "zh_qa"
        ? "Answer in Chinese. This is not a translation card. Then flip."
        : "Read the front, answer mentally or aloud, then flip.";
      updateResult(state.elements.resultText, prompt, "");
      if (card.direction === "zh_qa") {
        const marker = document.createElement("div");
        marker.className = "intro-note muted";
        marker.textContent = "Q→A: expected answer is Chinese, not English.";
        state.elements.answerArea.appendChild(marker);
      }
      state.elements.answerArea.appendChild(createButton("Show answer", showSmartSentenceAnswer, "answer-btn"));
      state.elements.controls.append(createButton("Skip", nextSmartCard, "secondary"));
      return;
    }
    updateResult(state.elements.resultText, state.round.resultText || "Choose the FSRS rating for this card.", state.round.resultClass || "");
    SMART_RATINGS.forEach((rating, index) => {
      const label = `${index + 1}. ${smart.ratingLabel(rating)}`;
      const button = createButton(label, () => setSmartRating(rating), "answer-btn", { dataset: { smartRating: String(rating) } });
      if (rating === state.round.smartSelectedRating) button.classList.add("selected");
      state.elements.answerArea.appendChild(button);
    });
    state.elements.controls.append(
      createButton("Accept rating", acceptSmartFsrsFeedback),
      createButton("Skip", nextSmartCard, "secondary")
    );
  }

  function introduceCurrentSmartCard() {
    const card = getCurrentCard();
    const setId = state.round.smartSetId || getPrimaryReviewSet().id;
    if (!card || !state.round.smartForceNew || !setId || state.round.smartIntroCommitted) return;
    state.round.smartIntroCommitted = true;
    const bucket = getSmartBucketForReviewSourceId(setId);
    smart.reviewCard(bucket, card, 3, new Date());
    persist();
    nextSmartCard();
  }

  function renderSmartIntroduction(card, newCount, startedCount) {
    if (isSentenceCard(card)) {
      renderSmartSentenceIntroduction(card, newCount, startedCount);
      return;
    }
    const reviewText = String(card.pinyin || "").trim();
    const smartSetId = state.round.smartSetId || getPrimaryReviewSet().id;
    const setName = getDb().sets.byId[smartSetId]?.name || smartSetId;
    state.round.smartStage = "intro";
    prepareRoundAppearance("practice", "smart", card);
    renderCurrentCardStats(card);
    state.elements.cardPrompt.textContent = `Smart · first view · ${setName}`;
    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = reviewText;
    state.elements.cardTranslation.textContent = card.translation;
    state.elements.positionLabel.textContent = `New ${newCount} / Started ${startedCount}`;
    updateResult(
      state.elements.resultText,
      "First-view mode: read the card first. Mark introduced when you are ready; then it enters the FSRS review schedule.",
      ""
    );
    clearNode(state.elements.answerArea);
    const note = document.createElement("div");
    note.className = "intro-note muted";
    note.textContent = "No answer is recorded in this step. Enter marks the card as introduced.";
    state.elements.answerArea.appendChild(note);
    clearNode(state.elements.controls);
    state.elements.controls.append(
      createButton("Skip", nextSmartCard, "secondary"),
      createButton("Mark introduced", introduceCurrentSmartCard)
    );
  }

  // Smart due review is pinyin -> translation -> FSRS rating. New-card introduction
  // is intentionally first-view only and enters FSRS with a default Good rating.
  function renderSmartPractice(card, dueCount, activeCount) {
    if (isSentenceCard(card)) {
      renderSmartSentencePractice(card, dueCount, activeCount);
      return;
    }
    const reviewText = String(card.pinyin || "").trim();
    const smartSetId = state.round.smartSetId || getPrimaryReviewSet().id;
    const smartEntry = getSmartBucketForReviewSourceId(smartSetId)[cardId(card)] || smart.createSmartEntry(new Date());
    const isNewSmartCard = !smart.isStarted(smartEntry);
    if (state.round.smartForceNew) {
      renderSmartIntroduction(card, dueCount, activeCount);
      return;
    }

    prepareRoundAppearance("practice", "smart", card);
    setSmartPositionLabel(card, dueCount, activeCount);
    renderCurrentCardStats(card);

    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = state.round.smartStage === "pinyin" ? "" : reviewText;
    state.elements.cardTranslation.textContent = state.round.smartStage === "feedback" ? card.translation : "";

    if (state.round.smartStage === "pinyin") {
      state.elements.cardPrompt.textContent = isNewSmartCard ? `Smart practice · ${getDb().sets.byId[smartSetId]?.name || smartSetId} · new card · 1 of 3 · type the pinyin` : `Smart practice · ${getDb().sets.byId[smartSetId]?.name || smartSetId} · 1 of 3 · type the pinyin`;
      updateResult(
        state.elements.resultText,
        state.round.pendingWrong ? state.round.resultText : (isNewSmartCard ? "First Smart review for this card. It will only enter the FSRS schedule after you finish this review. Use the hardcoded numeric pinyin exactly. Example: ni3hao3, nv3, shen2me." : "Step 1 of 3. Use the hardcoded numeric pinyin exactly. Example: ni3hao3, nv3, shen2me."),
        state.round.pendingWrong ? state.round.resultClass : ""
      );

      clearNode(state.elements.answerArea);
      const form = document.createElement("form");
      form.className = "answer-form";
      form.addEventListener("submit", submitSmartPinyinAnswer);
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = getPinyinInputPlaceholder();
      input.value = state.round.answerText;
      input.autocomplete = "off";
      input.spellcheck = false;
      input.disabled = state.round.pendingWrong;
      const submitBtn = createButton(state.round.pendingWrong ? "Pending" : "Submit", null, state.round.pendingWrong ? "secondary" : "", { type: "submit", disabled: state.round.pendingWrong });
      form.append(input, submitBtn);
      state.elements.answerArea.appendChild(form);
      if (state.round.pendingWrong) {
        const pendingRow = document.createElement("div");
        pendingRow.className = "answer-pending-row";
        pendingRow.appendChild(createButton("Retry without error", retrySmartPinyinWithoutPenalty, "secondary"));
        state.elements.answerArea.appendChild(pendingRow);
      }
      if (!state.round.pendingWrong && shouldAutoFocusPinyinInput()) {
        setTimeout(() => {
          try { input.focus({ preventScroll: true }); } catch (error) { input.focus(); }
        }, 0);
      }
      clearNode(state.elements.controls);
      if (state.round.pendingWrong) {
        state.elements.controls.append(
          createButton("Skip", nextSmartCard, "secondary"),
          createButton("Count wrong", acceptPendingSmartPinyinWrong)
        );
      } else {
        state.elements.controls.append(createButton("Skip", nextSmartCard, "secondary"));
      }
      return;
    }

    if (state.round.smartStage === "translation") {
      state.elements.cardPrompt.textContent = "Smart practice · 2 of 3 · choose the translation";
      if (!state.round.options.length) state.round.options = buildTranslationOptionsForCard(card, "practice");
      updateResult(state.elements.resultText, state.round.resultText || "Step 2 of 3. Choose the English translation.", state.round.resultClass || "");
      renderTranslationButtons(answerSmartTranslation);
      clearNode(state.elements.controls);
      state.elements.controls.append(createButton("Skip", nextSmartCard, "secondary"));
      return;
    }

    if (state.round.smartStage === "feedback") {
      state.elements.cardPrompt.textContent = "Smart practice · 3 of 3 · rate this review";
      updateResult(state.elements.resultText, state.round.resultText || "Choose the FSRS rating for this review.", state.round.resultClass || "");
      clearNode(state.elements.answerArea);
      SMART_RATINGS.forEach((rating, index) => {
        const label = `${index + 1}. ${smart.ratingLabel(rating)}`;
        const button = createButton(label, () => setSmartRating(rating), "answer-btn", { dataset: { smartRating: String(rating) } });
        if (rating === state.round.smartSelectedRating) button.classList.add("selected");
        state.elements.answerArea.appendChild(button);
      });
      clearNode(state.elements.controls);
      state.elements.controls.append(
        createButton("Accept rating", acceptSmartFsrsFeedback),
        createButton("Skip", nextSmartCard, "secondary")
      );
      return;
    }
  }

  // A blocked Smart review is a valid state: no due cards today and the user has
  // not chosen the explicit new-card introduction flow.
  function renderSmartBlocked() {
    const summary = getReviewScheduleSummary();
    const practiceCount = getReviewPracticeIds().length;
    const inNewFlow = !!state.round.smartForceNew;
    state.elements.cardPrompt.textContent = inNewFlow ? "No new Smart cards" : "No due Smart reviews";
    state.elements.cardHanzi.textContent = "—";
    clearNode(state.elements.cardStats);
    clearNode(state.elements.answerArea);
    clearNode(state.elements.controls);

    if (inNewFlow) {
      state.elements.cardPinyin.textContent = summary.newCount ? `${summary.newCount} new card${summary.newCount === 1 ? "" : "s"} waiting.` : "All new cards in this source have been introduced.";
      state.elements.cardTranslation.textContent = "Introduced cards now belong to the FSRS schedule and will appear when due.";
      updateResult(state.elements.resultText, summary.dueTodayCount ? "There are due reviews available." : "No due reviews today.", summary.dueTodayCount ? "ok" : "");
      state.elements.controls.append(createButton("Review due cards", startDueReviewCards, summary.dueTodayCount ? "" : "secondary", { disabled: !summary.dueTodayCount }));
      state.elements.positionLabel.textContent = `New ${summary.newCount} / ${practiceCount}`;
      return;
    }

    if (summary.nextDueDate) {
      state.elements.cardPinyin.textContent = `Next due: ${formatReviewDateLabel(summary.nextDueDate)}`;
    } else if (summary.newCount) {
      state.elements.cardPinyin.textContent = `${summary.newCount} practice card${summary.newCount === 1 ? "" : "s"} not started in Smart yet.`;
    } else {
      state.elements.cardPinyin.textContent = "No cards scheduled yet.";
    }
    state.elements.cardTranslation.textContent = practiceCount ? `No started Practice cards are due today in ${getReviewScopeName()}.` : "No cards are currently marked for Practice in this review set.";
    updateResult(state.elements.resultText, practiceCount ? "Due review only shows already-introduced cards due today. First-view new cards to add them to FSRS." : "Add cards to Practice or choose a different review set.", practiceCount ? "bad" : "");
    if (summary.newCount) {
      state.elements.controls.append(createButton("First view new cards", startNewCardIntroduction, "secondary"));
    } else {
      state.elements.controls.append(createButton("Review due cards", startDueReviewCards, "secondary", { disabled: true }));
    }
    state.elements.positionLabel.textContent = `Due 0 / ${summary.startedCount}`;
  }


  Object.assign(runtime, {
    buildTranslationOptionsForCard,
    updateTranslationSelectionUI,
    selectTranslationOption,
    moveTranslationSelection,
    answerTranslation,
    retryPinyinWithoutPenalty,
    acceptPendingPinyinWrong,
    submitPinyinAnswer,
    retrySmartPinyinWithoutPenalty,
    acceptPendingSmartPinyinWrong,
    submitSmartPinyinAnswer,
    setSmartRating,
    updateSmartRatingUI,
    moveSmartRatingSelection,
    acceptSmartFsrsFeedback,
    answerSmartTranslation,
    moveInOrderedMode,
    nextCard,
    prevCard,
    startSmartForSet,
    startDueReviewCards,
    startNewCardIntroduction,
    startNextNewSmartCard,
    nextSmartCard,
    renderLearn,
    renderTranslationButtons,
    renderTranslationQuiz,
    renderPinyinQuiz,
    renderSmartSentenceIntroduction,
    showSmartSentenceAnswer,
    submitSmartStrokeAnswer,
    renderSmartSentencePractice,
    introduceCurrentSmartCard,
    renderSmartIntroduction,
    renderSmartPractice,
    renderSmartBlocked
  });
})(window.HSKFlashcards);
