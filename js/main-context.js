/**
 * Main UI split: Runtime context, auth, and page shell.
 */
(function (ns) {
  const runtime = ns.mainRuntime = ns.mainRuntime || {};
  const proxy = (name) => (...args) => {
    const fn = runtime[name];
    if (typeof fn !== "function") throw new Error(`Main runtime function not loaded: ${name}`);
    return fn(...args);
  };
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

  const { MODES, PRACTICE_QUIZ_TYPES, TEST_QUIZ_TYPES, ALL_SET_ID, REVIEW_ALL_SETS_ID, SMART_RATINGS } = ns.constants;
  const { normalizeCard, cardId, clamp, shuffle, parseCSV, mapRowsToCards, parseRangeInput, formatReviewDateLabel, formatLongDate, hashStringToUnitInterval, getLocalDayStamp } = ns.utils;
  const { checkPinyinAnswer, getReviewPinyinText, shouldAutoFocusPinyinInput, getPinyinInputPlaceholder, getPinyinDisplay } = ns.pinyin;
  const { createPersistenceAdapter } = ns.adapters;
  const { createAppStore } = ns.store;
  const { createButton, clearNode, setBar, updateResult, scheduleStudyAreaFocus } = ns.ui;
  const smart = ns.smart;

  // Randomizes Smart queue order per browser session while keeping order stable across renders.
  function createSmartSessionSeed() {
    return ["smart-session", Date.now().toString(36), Math.random().toString(36).slice(2, 10)].join("::");
  }

  // Runtime-only state. Durable data belongs in store.state; this object tracks
  // transient UI/session details such as the current round and Smart queue seed.
  const state = {
    filterText: "",
    manageListDirty: true,
    elements: null,
    store: null,
    smartLastCardId: "",
    smartLastSetId: "",
    smartSessionSeed: createSmartSessionSeed(),
    authScope: "anon",
    authMessage: "",
    authMessageClass: "muted",
    currentPage: "login",
    round: createEmptyRound()
  };

  function createEmptyRound() {
    return {
      answered: false,
      pendingWrong: false,
      pendingCheck: null,
      options: [],
      selectedLabel: "",
      selectedCorrect: false,
      answerText: "",
      resultText: "",
      resultClass: "",
      appearanceKey: "",
      appearanceMode: "",
      appearanceQuizType: "",
      appearanceCardId: "",
      appearanceCounted: false,
      smartCardId: "",
      smartSetId: "",
      smartStage: "pinyin",
      smartPinyinCorrect: null,
      smartTranslationCorrect: null,
      smartOutcomeCorrect: null,
      smartSelectedRating: 3,
      smartForceNew: false,
      keyboardChoiceIndex: -1
    };
  }

  function getElements() {
    return {
      vocabInput: document.getElementById("vocabInput"),
      saveVocabBtn: document.getElementById("saveVocabBtn"),
      loadPlaceholderBtn: document.getElementById("loadPlaceholderBtn"),
      resetProgressBtn: document.getElementById("resetProgressBtn"),
      exportProgressBtn: document.getElementById("exportProgressBtn"),
      importProgressBtn: document.getElementById("importProgressBtn"),
      importProgressInput: document.getElementById("importProgressInput"),
      storageModeBadge: document.getElementById("storageModeBadge"),
      statusText: document.getElementById("statusText"),
      authBadge: document.getElementById("authBadge"),
      authStatusText: document.getElementById("authStatusText"),
      authEmailInput: document.getElementById("authEmailInput"),
      authPasswordInput: document.getElementById("authPasswordInput"),
      authSignUpBtn: document.getElementById("authSignUpBtn"),
      authSignInBtn: document.getElementById("authSignInBtn"),
      authSignOutBtn: document.getElementById("authSignOutBtn"),
      pageButtons: [...document.querySelectorAll(".page-btn[data-page]")],
      pagePanels: [...document.querySelectorAll(".page-panel[data-page]")],
      modeButtons: [...document.querySelectorAll(".mode-btn")],
      quizTypeWrap: document.getElementById("quizTypeWrap"),
      quizTypeButtons: [...document.querySelectorAll(".quiz-type-btn")],
      shuffleBtn: document.getElementById("shuffleBtn"),
      resetOrderBtn: document.getElementById("resetOrderBtn"),
      orderStatus: document.getElementById("orderStatus"),
      statTotal: document.getElementById("statTotal"),
      statSeen: document.getElementById("statSeen"),
      statPracticeTranslationShown: document.getElementById("statPracticeTranslationShown"),
      statPracticeTranslationCW: document.getElementById("statPracticeTranslationCW"),
      statPracticePinyinShown: document.getElementById("statPracticePinyinShown"),
      statPracticePinyinCW: document.getElementById("statPracticePinyinCW"),
      statPracticeSmartShown: document.getElementById("statPracticeSmartShown"),
      statPracticeSmartCW: document.getElementById("statPracticeSmartCW"),
      barLearn: document.getElementById("barLearn"),
      barPractice: document.getElementById("barPractice"),
      barTest: document.getElementById("barTest"),
      barLearnLabel: document.getElementById("barLearnLabel"),
      barPracticeLabel: document.getElementById("barPracticeLabel"),
      barTestLabel: document.getElementById("barTestLabel"),
      activeSetSelect: document.getElementById("activeSetSelect"),
      reviewSetSelect: document.getElementById("reviewSetSelect"),
      reviewScopeMeta: document.getElementById("reviewScopeMeta"),
      reviewPlanCompact: document.getElementById("reviewPlanCompact"),
      startDueReviewBtn: document.getElementById("startDueReviewBtn"),
      startNewCardsBtn: document.getElementById("startNewCardsBtn"),
      smartFlowStatus: document.getElementById("smartFlowStatus"),
      activeSetBadge: document.getElementById("activeSetBadge"),
      setNameInput: document.getElementById("setNameInput"),
      setRangeInput: document.getElementById("setRangeInput"),
      addSetRangeBtn: document.getElementById("addSetRangeBtn"),
      removeSetRangeBtn: document.getElementById("removeSetRangeBtn"),
      replaceSetRangeBtn: document.getElementById("replaceSetRangeBtn"),
      saveSetBtn: document.getElementById("saveSetBtn"),
      deleteSetBtn: document.getElementById("deleteSetBtn"),
      setCardCount: document.getElementById("setCardCount"),
      setNewCount: document.getElementById("setNewCount"),
      setStartedCount: document.getElementById("setStartedCount"),
      setupIntroduceBtn: document.getElementById("setupIntroduceBtn"),
      setupReviewBtn: document.getElementById("setupReviewBtn"),
      setDueToday: document.getElementById("setDueToday"),
      setNextDue: document.getElementById("setNextDue"),
      scheduleList: document.getElementById("scheduleList"),
      allScheduleList: document.getElementById("allScheduleList"),
      setsOverview: document.getElementById("setsOverview"),
      selectionSummary: document.getElementById("selectionSummary"),
      setupToggleBtn: document.getElementById("setupToggleBtn"),
      setupBody: document.getElementById("setupBody"),
      rangeLearn: document.getElementById("rangeLearn"),
      rangePractice: document.getElementById("rangePractice"),
      rangeTest: document.getElementById("rangeTest"),
      rangeButtons: [...document.querySelectorAll("[data-range-action]")],
      filterInput: document.getElementById("filterInput"),
      manageList: document.getElementById("manageList"),
      modeLabel: document.getElementById("modeLabel"),
      quizLabel: document.getElementById("quizLabel"),
      cardSetLabel: document.getElementById("cardSetLabel"),
      positionLabel: document.getElementById("positionLabel"),
      cardPrompt: document.getElementById("cardPrompt"),
      cardHanzi: document.getElementById("cardHanzi"),
      cardPinyin: document.getElementById("cardPinyin"),
      cardTranslation: document.getElementById("cardTranslation"),
      cardStats: document.getElementById("cardStats"),
      resultText: document.getElementById("resultText"),
      answerArea: document.getElementById("answerArea"),
      controls: document.getElementById("controls"),
      flashcard: document.getElementById("flashcard"),
      cardPanel: document.querySelector(".card-panel")
    };
  }

  function getDb() {
    return state.store.getState();
  }

  function persist() {
    return state.store.persist();
  }

  function getUi() {
    return getDb().ui;
  }

  function getAuthStatus() {
    return ns.auth && typeof ns.auth.getStatus === "function"
      ? ns.auth.getStatus()
      : {
          ready: false,
          providerReady: false,
          configured: false,
          signedIn: false,
          email: "",
          userId: "",
          config: { url: "", key: "" },
          lastEvent: "INIT"
        };
  }

  function setAuthMessage(text, tone = "muted") {
    state.authMessage = String(text || "").trim();
    state.authMessageClass = tone;
  }

  function updateStorageModeBadge() {
    const info = getAuthStatus();
    if (!state.elements?.storageModeBadge) return;
    if (info.signedIn) {
      state.elements.storageModeBadge.textContent = "cloud sync · signed in";
      return;
    }
    if (info.configured && info.providerReady) {
      state.elements.storageModeBadge.textContent = "Supabase ready · local cache";
      return;
    }
    if (info.configured && !info.providerReady) {
      state.elements.storageModeBadge.textContent = "Supabase script missing · local cache";
      return;
    }
    state.elements.storageModeBadge.textContent = "built in · local data layer";
  }

  // Auth scope controls local cache namespace. Switching users must reload state
  // so one user/device cache cannot bleed into another.
  async function syncStoreToAuthScope(force = false) {
    const nextScope = ns.auth && typeof ns.auth.getCacheScope === "function"
      ? ns.auth.getCacheScope()
      : "anon";
    if (!force && state.authScope === nextScope) return false;
    state.authScope = nextScope;
    await state.store.load();
    markManageListDirty();
    resetRoundState();
    return true;
  }

  let remoteRefreshInFlight = false;
  let lastRemoteRefreshAt = 0;

  // Pull remote state opportunistically when the tab regains focus. This is not
  // realtime sync, but it prevents long-open devices from staying stale forever.
  async function refreshRemoteState(force = false) {
    const info = getAuthStatus();
    if (!info.signedIn || !state.store || typeof state.store.refreshRemote !== "function") return false;
    const now = Date.now();
    if (!force && (remoteRefreshInFlight || now - lastRemoteRefreshAt < 8000)) return false;
    remoteRefreshInFlight = true;
    lastRemoteRefreshAt = now;
    try {
      await state.store.refreshRemote({ preserveUi: true });
      markManageListDirty();
      render();
      return true;
    } catch (error) {
      console.warn("Remote refresh failed.", error);
      return false;
    } finally {
      remoteRefreshInFlight = false;
    }
  }

  function renderAuthPanel() {
    const info = getAuthStatus();
    if (state.elements.authEmailInput && info.signedIn && document.activeElement !== state.elements.authEmailInput) {
      state.elements.authEmailInput.value = info.email || "";
    }
    if (state.elements.authPasswordInput && info.signedIn && document.activeElement !== state.elements.authPasswordInput) {
      state.elements.authPasswordInput.value = "";
    }

    if (state.elements.authBadge) {
      if (info.signedIn) {
        state.elements.authBadge.textContent = info.email || "Signed in";
      } else if (info.configured && info.providerReady) {
        state.elements.authBadge.textContent = "Supabase ready";
      } else if (info.configured) {
        state.elements.authBadge.textContent = "Config saved";
      } else {
        state.elements.authBadge.textContent = "Local only";
      }
    }
    if (state.elements.authSignUpBtn) {
      state.elements.authSignUpBtn.disabled = !(info.configured && info.providerReady);
    }
    if (state.elements.authSignInBtn) {
      state.elements.authSignInBtn.disabled = !(info.configured && info.providerReady);
    }
    if (state.elements.authSignOutBtn) {
      state.elements.authSignOutBtn.disabled = !info.signedIn;
    }

    let defaultMessage = "Sign in to sync your progress between devices.";
    let defaultTone = "muted";
    if (!info.providerReady) {
      defaultMessage = "Supabase client script is unavailable.";
      defaultTone = "bad";
    } else if (info.signedIn) {
      defaultMessage = `Signed in as ${info.email || "user"}. Cloud sync is active.`;
      defaultTone = "ok";
    } else {
      defaultMessage = "Connected to the hardcoded Supabase project. Sign in to sync data.";
    }

    const message = state.authMessage || defaultMessage;
    const tone = state.authMessage ? state.authMessageClass : defaultTone;
    if (state.elements.authStatusText) {
      state.elements.authStatusText.textContent = message;
      state.elements.authStatusText.className = `status ${tone === "muted" ? "muted" : tone}`;
    }
  }

  function ensureCurrentPageAllowed() {
    const signedIn = !!getAuthStatus().signedIn;
    if (!signedIn && state.currentPage !== "login") state.currentPage = "login";
    if (!["login", "setup", "flashcards"].includes(state.currentPage)) state.currentPage = signedIn ? "flashcards" : "login";
  }

  function setPage(page) {
    const signedIn = !!getAuthStatus().signedIn;
    if (!["login", "setup", "flashcards"].includes(page)) return;
    if (!signedIn && page !== "login") return;
    state.currentPage = page;
    renderPageShell();
    if (page === "setup") renderManageListIfNeeded(true);
  }

  function renderPageShell() {
    ensureCurrentPageAllowed();
    const signedIn = !!getAuthStatus().signedIn;
    state.elements.pageButtons.forEach((button) => {
      const page = button.dataset.page;
      const disabled = !signedIn && page !== "login";
      button.disabled = disabled;
      button.classList.toggle("active", state.currentPage === page);
      button.setAttribute("aria-current", state.currentPage === page ? "page" : "false");
    });
    state.elements.pagePanels.forEach((panel) => {
      panel.hidden = panel.dataset.page !== state.currentPage;
    });
  }

  function getAuthCredentials() {
    const email = String(state.elements.authEmailInput?.value || "").trim();
    const password = String(state.elements.authPasswordInput?.value || "");
    if (!email || !password) throw new Error("Enter both email and password.");
    return { email, password };
  }
  async function handleAuthSignUp() {
    try {
      const { email, password } = getAuthCredentials();
      if (!ns.auth || typeof ns.auth.signUp !== "function") throw new Error("Auth module unavailable.");
      await ns.auth.signUp(email, password);
      setAuthMessage("Sign-up submitted. If email confirmation is enabled, confirm your email first, then sign in.", "ok");
    } catch (error) {
      setAuthMessage(error?.message || "Sign-up failed.", "bad");
    }
    renderAuthPanel();
  }

  async function handleAuthSignIn() {
    try {
      const { email, password } = getAuthCredentials();
      if (!ns.auth || typeof ns.auth.signIn !== "function") throw new Error("Auth module unavailable.");
      setAuthMessage("Signing in...", "muted");
      renderAuthPanel();
      await ns.auth.signIn(email, password);
    } catch (error) {
      setAuthMessage(error?.message || "Sign-in failed.", "bad");
      renderAuthPanel();
    }
  }

  async function handleAuthSignOut() {
    try {
      if (!ns.auth || typeof ns.auth.signOut !== "function") throw new Error("Auth module unavailable.");
      await ns.auth.signOut();
    } catch (error) {
      setAuthMessage(error?.message || "Sign-out failed.", "bad");
      renderAuthPanel();
    }
  }

  async function handleAuthStateChange(info) {
    const changed = await syncStoreToAuthScope();
    if (info?.event === "SIGNED_IN") {
      setAuthMessage("Signed in. Cloud sync active.", "ok");
      state.currentPage = "flashcards";
    } else if (info?.event === "SIGNED_OUT") {
      setAuthMessage("Signed out.", "muted");
      state.currentPage = "login";
    } else if (info?.event === "READY" && info?.signedIn) {
      setAuthMessage("Session restored. Cloud sync active.", "ok");
    }
    updateStorageModeBadge();
    if (changed) state.filterText = state.elements.filterInput.value || state.filterText || "";
    render();
  }


  Object.assign(runtime, {
    MODES,
    PRACTICE_QUIZ_TYPES,
    TEST_QUIZ_TYPES,
    ALL_SET_ID,
    REVIEW_ALL_SETS_ID,
    SMART_RATINGS,
    normalizeCard,
    cardId,
    clamp,
    shuffle,
    parseCSV,
    mapRowsToCards,
    parseRangeInput,
    formatReviewDateLabel,
    formatLongDate,
    hashStringToUnitInterval,
    getLocalDayStamp,
    checkPinyinAnswer,
    getReviewPinyinText,
    shouldAutoFocusPinyinInput,
    getPinyinInputPlaceholder,
    getPinyinDisplay,
    createPersistenceAdapter,
    createAppStore,
    createButton,
    clearNode,
    setBar,
    updateResult,
    scheduleStudyAreaFocus,
    smart,
    state,
    createSmartSessionSeed,
    createEmptyRound,
    getElements,
    getDb,
    persist,
    getUi,
    getAuthStatus,
    setAuthMessage,
    updateStorageModeBadge,
    syncStoreToAuthScope,
    refreshRemoteState,
    renderAuthPanel,
    ensureCurrentPageAllowed,
    setPage,
    renderPageShell,
    getAuthCredentials,
    handleAuthSignUp,
    handleAuthSignIn,
    handleAuthSignOut,
    handleAuthStateChange
  });
})(window.HSKFlashcards);
