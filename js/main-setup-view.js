/**
 * Main UI split: Setup, review scope, and shared card view rendering.
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
  const getBuiltInDeckVisibility = proxy("getBuiltInDeckVisibility");
  const getBuiltInCardVisibility = proxy("getBuiltInCardVisibility");
  const getSetupVisibilityDecks = proxy("getSetupVisibilityDecks");
  const getSetupDeckById = proxy("getSetupDeckById");
  const getSetupDeckCards = proxy("getSetupDeckCards");
  const getSelectedSetupDeckId = proxy("getSelectedSetupDeckId");
  const getReviewSourcesForSelect = proxy("getReviewSourcesForSelect");
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
  const getReviewFutureScheduleRows = proxy("getReviewFutureScheduleRows");
  const getAllSetsScheduleByDay = proxy("getAllSetsScheduleByDay");
  const getSmartStatsForSet = proxy("getSmartStatsForSet");
  const getReviewSmartStats = proxy("getReviewSmartStats");
  const getSmartIdsForSource = proxy("getSmartIdsForSource");
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

  function updateModeButtons() {
    const ui = getUi();
    state.elements.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === ui.mode);
    });
    state.elements.modeLabel.textContent = ui.mode.charAt(0).toUpperCase() + ui.mode.slice(1);
    state.elements.cardSetLabel.textContent = getReviewScopeName();

    if (ui.mode === "learn") {
      state.elements.quizTypeWrap.classList.add("hidden");
      state.elements.quizLabel.textContent = "Study card";
      return;
    }
    state.elements.quizTypeWrap.classList.remove("hidden");
    const quizType = getQuizType();
    state.elements.quizTypeButtons.forEach((button) => {
      const allowed = getAllowedQuizTypes(ui.mode).includes(button.dataset.quiz);
      button.classList.toggle("hidden", !allowed);
      button.classList.toggle("active", button.dataset.quiz === quizType);
    });
    if (quizType === "translation") state.elements.quizLabel.textContent = "Translation · MCQ";
    else if (quizType === "pinyin") state.elements.quizLabel.textContent = "Pinyin · typed";
    else state.elements.quizLabel.textContent = "Smart · FSRS";
  }

  function renderStats() {
    const scopedCards = getReviewScopedCards();
    const totalCards = scopedCards.length;
    const practiceTranslation = getModeTotals("practice", "translation");
    const practicePinyin = getModeTotals("practice", "pinyin");
    const smartStats = getReviewSmartStats();
    const learnTotal = getModeIds("learn").length;
    const practiceTotal = getModeIds("practice").length;

    state.elements.statTotal.textContent = String(totalCards);
    state.elements.statSeen.textContent = String(getSeenCount());
    state.elements.statPracticeTranslationShown.textContent = String(practiceTranslation.shown);
    state.elements.statPracticeTranslationCW.textContent = `${practiceTranslation.correct} / ${practiceTranslation.wrong}`;
    state.elements.statPracticePinyinShown.textContent = String(practicePinyin.shown);
    state.elements.statPracticePinyinCW.textContent = `${practicePinyin.correct} / ${practicePinyin.wrong}`;
    state.elements.statPracticeSmartShown.textContent = String(smartStats.shown);
    state.elements.statPracticeSmartCW.textContent = `${smartStats.correct} / ${smartStats.wrong}`;

    setBar(state.elements.barLearn, state.elements.barLearnLabel, getSeenCount(), learnTotal);
    setBar(state.elements.barPractice, state.elements.barPracticeLabel, getModeTouchedAcrossTypes("practice"), practiceTotal);
  }

  function getEditModeIds(mode) {
    return getModeIds(mode);
  }

  function getSetupCardLocalId(card, deck) {
    return deck?.kind === "sentence" ? String(card?.id || "") : cardId(card);
  }

  function getSelectedSetupDeck() {
    return getSetupDeckById(getSelectedSetupDeckId());
  }

  function getSelectedSetupCards() {
    const deck = getSelectedSetupDeck();
    return deck ? getSetupDeckCards(deck.id) : [];
  }

  function getSetupCardVisibility(card, deck = getSelectedSetupDeck()) {
    if (!deck || !card) return { learn: true, practice: true };
    return getBuiltInCardVisibility(deck.id, getSetupCardLocalId(card, deck));
  }

  function renderSelectionSummary() {
    const deck = getSelectedSetupDeck();
    const cards = getSelectedSetupCards();
    let learn = 0;
    let practice = 0;
    cards.forEach((card) => {
      const flags = getSetupCardVisibility(card, deck);
      if (flags.learn !== false) learn += 1;
      if (flags.practice !== false) practice += 1;
    });
    const name = deck?.name || "Deck";
    state.elements.selectionSummary.textContent = `${name}: Learn ${learn} · Practice ${practice}`;
  }

  function renderOrderStatus() {
    if (isSmartPracticeActive()) {
      state.elements.orderStatus.textContent = `Smart FSRS uses review set: ${getReviewScopeName()}. Started cards due today are reviewed first; new cards enter FSRS after their first Smart review.`;
      return;
    }
    const type = getUi().orderType[getUi().mode];
    state.elements.orderStatus.textContent = type === "shuffled" ? "Shuffled order." : "Sequential order.";
  }

  function renderSetupPanel() {
    const collapsed = !!getUi().setupCollapsed;
    state.elements.setupBody.classList.toggle("hidden", collapsed);
    state.elements.setupToggleBtn.textContent = collapsed ? "Show setup" : "Hide setup";
    state.elements.setupToggleBtn.setAttribute("aria-expanded", String(!collapsed));
    if (!collapsed) renderBuiltInDeckVisibilityPanel();
  }

  function renderBuiltInDeckVisibilityPanel() {
    if (!state.elements.setupDeckSelect) return;
    const decks = getSetupVisibilityDecks();
    const currentValue = state.elements.setupDeckSelect.value || decks[0]?.id || "";
    clearNode(state.elements.setupDeckSelect);
    decks.forEach((deck) => {
      const option = document.createElement("option");
      option.value = deck.id;
      option.textContent = `${deck.name} (${(deck.cardIds || []).length})`;
      option.selected = deck.id === currentValue;
      state.elements.setupDeckSelect.appendChild(option);
    });
    if (currentValue && !decks.some((deck) => deck.id === currentValue) && decks[0]) {
      state.elements.setupDeckSelect.value = decks[0].id;
    }
    const deck = getSelectedSetupDeck();
    const cards = getSelectedSetupCards();
    if (state.elements.setupDeckMeta) {
      state.elements.setupDeckMeta.textContent = deck
        ? `${deck.name}: ${cards.length} cards. Use the checkboxes below to include/exclude cards from Learn and Practice.`
        : "No built-in decks found.";
    }
  }

  function getFilteredManageCards() {
    const deck = getSelectedSetupDeck();
    const query = state.filterText.trim().toLowerCase();
    const cards = getSelectedSetupCards();
    if (!query) return cards;
    return cards.filter((card) => {
      const parts = [
        String(card.setupIndex || card.index || ""),
        card.hanzi,
        card.pinyin,
        card.pinyinNumeric,
        card.translation,
        card.front,
        card.back,
        card.chinese,
        card.english,
        card.meaning,
        card.measureWords
      ].map((value) => String(value || "").toLowerCase());
      return parts.some((part) => part.includes(query));
    });
  }

  function getSetupCardTitle(card, deck) {
    const index = card.setupIndex || card.index || "";
    if (deck?.kind === "sentence") {
      if (card.direction === "hanzi_to_pinyin") return `#${index} · ${card.chinese || card.front}`;
      if (card.direction === "measure_word") return `#${index} · ${card.chinese || card.front}`;
      if (card.direction === "stroke_sequence") return `#${index} · ${card.front}`;
      return `#${index} · ${card.front}`;
    }
    return `#${card.index} · ${card.hanzi}`;
  }

  function getSetupCardSub(card, deck) {
    if (deck?.kind === "sentence") {
      if (card.direction === "hanzi_to_pinyin") return `${card.back} · ${card.meaning || card.english || ""}`;
      if (card.direction === "measure_word") return `${card.pinyin || ""} · ${card.back}`;
      if (card.direction === "stroke_sequence") return `${card.chinese || ""} · ${card.back}`;
      if (card.direction === "zh_qa") return `Q→A · ${card.back}`;
      return card.back || card.english || card.chinese || "";
    }
    return `${card.pinyin} · ${card.translation}`;
  }

  function getSetupSmartMeta(card, deck) {
    if (!deck || !card) return "smart new";
    const localId = getSetupCardLocalId(card, deck);
    const bucket = deck.kind === "sentence" ? (getDb().sentenceSmartByDeck?.[deck.id] || {}) : getSmartBucketForSet(deck.id);
    const entry = bucket[localId] || smart.createSmartEntry(new Date());
    if (smart.isStarted(entry)) {
      const due = smart.getDueDay(entry, new Date());
      return `smart due ${formatReviewDateLabel(due)}`;
    }
    return "smart new";
  }

  function renderManageList() {
    clearNode(state.elements.manageList);
    const deck = getSelectedSetupDeck();
    const cards = getFilteredManageCards();
    if (!cards.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No cards match the current filter / deck.";
      state.elements.manageList.appendChild(empty);
      return;
    }

    cards.forEach((card) => {
      const row = document.createElement("div");
      row.className = "manage-row";

      const meta = document.createElement("div");
      meta.className = "manage-meta";

      const title = document.createElement("div");
      title.className = "manage-title";
      title.textContent = getSetupCardTitle(card, deck);

      const sub = document.createElement("div");
      sub.className = "manage-sub";
      sub.textContent = getSetupCardSub(card, deck);

      const stats = document.createElement("div");
      stats.className = "manage-mini muted";
      if (deck?.kind === "sentence") {
        stats.textContent = getSetupSmartMeta(card, deck);
      } else {
        const summary = getPracticeCardSummaryText(card);
        const currentFlags = getSetupCardVisibility(card, deck);
        let smartMeta = "smart inactive";
        if (currentFlags.practice !== false) {
          const smartEntry = getSmartBucketForSet(deck?.id || getActiveSet().id)[cardId(card)] || smart.createSmartEntry(new Date());
          if (smart.isStarted(smartEntry)) {
            const due = smart.getDueDay(smartEntry, new Date());
            smartMeta = `smart due ${formatReviewDateLabel(due)}`;
          } else {
            smartMeta = "smart new";
          }
        }
        stats.textContent = `${summary.translation} · ${summary.pinyin} · ${smartMeta}`;
      }

      meta.append(title, sub, stats);

      const flags = document.createElement("div");
      flags.className = "manage-flags";
      const current = getSetupCardVisibility(card, deck);
      MODES.forEach((mode) => {
        const label = document.createElement("label");
        label.className = "flag-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = current[mode] !== false;
        input.dataset.cardId = getSetupCardLocalId(card, deck);
        input.dataset.cardMode = mode;
        input.dataset.deckId = deck?.id || ALL_SET_ID;
        const span = document.createElement("span");
        span.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        label.append(input, span);
        flags.appendChild(label);
      });

      row.append(meta, flags);
      state.elements.manageList.appendChild(row);
    });
  }

  // The manage list can contain 1000+ rows, so it is rendered lazily. Do not call
  // renderManageList from ordinary quiz progress updates.
  function renderManageListIfNeeded(force = false) {
    if (getUi().setupCollapsed) return;
    if (!force && !state.manageListDirty) return;
    renderManageList();
    state.manageListDirty = false;
  }

  function renderScheduleRows(container, items, emptyText, options = {}) {
    if (!container) return;
    clearNode(container);
    const rows = (items || []).slice(0, options.limit || 24);
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "schedule-empty muted";
      empty.textContent = emptyText || "No review schedule yet.";
      container.appendChild(empty);
      return;
    }
    rows.forEach((item) => {
      const row = document.createElement("div");
      row.className = "schedule-row";
      const left = document.createElement("span");
      left.textContent = item.label || formatReviewDateLabel(item.date);
      const right = document.createElement("strong");
      right.textContent = item.right || `${item.count} card${item.count === 1 ? "" : "s"}`;
      row.append(left, right);
      container.appendChild(row);
    });
  }

  function getFullScheduleCardTitle(card) {
    if (!card) return "Unknown card";
    if (card.cardKind || card.direction) {
      const front = String(card.front || card.hanzi || card.chinese || card.prompt || "").trim();
      const back = String(card.back || card.translation || card.answer || "").trim();
      return [front, back].filter(Boolean).join(" → ") || String(card.id || "Study card");
    }
    return [card.hanzi, card.pinyin, card.translation].filter(Boolean).join(" · ") || String(card.id || "Vocabulary card");
  }

  function renderFullReviewSchedulePanel(summary) {
    const button = state.elements.toggleFullScheduleBtn;
    const container = state.elements.reviewScheduleFull;
    if (!button && !container) return;

    const todayStamp = getLocalDayStamp(new Date());
    const futureCount = (summary.byDay || [])
      .filter((item) => item.date.getTime() > todayStamp)
      .reduce((total, item) => total + (Number(item.count) || 0), 0);

    if (button) {
      button.textContent = state.reviewScheduleExpanded
        ? "Hide all future reviews"
        : `Show all future reviews${futureCount ? ` (${futureCount})` : ""}`;
      button.setAttribute("aria-expanded", state.reviewScheduleExpanded ? "true" : "false");
    }

    if (!container) return;
    clearNode(container);
    container.classList.toggle("hidden", !state.reviewScheduleExpanded);
    if (!state.reviewScheduleExpanded) return;

    const rows = getReviewFutureScheduleRows();
    if (!rows.length) {
      const empty = document.createElement("div");
      empty.className = "schedule-empty muted";
      empty.textContent = "No future reviews are scheduled for this review source.";
      container.appendChild(empty);
      return;
    }

    const grouped = new Map();
    rows.forEach((row) => {
      const stamp = row.date.getTime();
      if (!grouped.has(stamp)) grouped.set(stamp, { date: row.date, items: [] });
      grouped.get(stamp).items.push(row);
    });

    grouped.forEach((group) => {
      const block = document.createElement("section");
      block.className = "full-schedule-day";

      const header = document.createElement("div");
      header.className = "schedule-row full-schedule-header";
      const left = document.createElement("span");
      left.textContent = formatLongDate(group.date);
      const right = document.createElement("strong");
      right.textContent = `${group.items.length} card${group.items.length === 1 ? "" : "s"}`;
      header.append(left, right);
      block.appendChild(header);

      group.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "full-schedule-card-row";
        const title = document.createElement("span");
        title.className = "full-schedule-card-title";
        title.textContent = getFullScheduleCardTitle(item.card);
        const meta = document.createElement("span");
        meta.className = "full-schedule-card-meta muted";
        meta.textContent = `${item.setName || getReviewScopeName()}${item.index ? ` · #${item.index}` : ""}`;
        row.append(title, meta);
        block.appendChild(row);
      });

      container.appendChild(block);
    });
  }

  function renderReviewScopePanel() {
    const sets = getDb().sets.order.map((id) => getDb().sets.byId[id]).filter(Boolean);
    const named = getNamedSets();
    const reviewScopeId = getReviewScopeId();
    const summary = getReviewScheduleSummary();
    const learnCount = getModeIds("learn").length;
    const practiceCount = getReviewPracticeIds().length;

    if (state.elements.reviewSetSelect) {
      clearNode(state.elements.reviewSetSelect);
      getReviewSourcesForSelect().forEach((source) => {
        const option = document.createElement("option");
        option.value = source.id;
        const learnSourceCount = getSmartIdsForSource(source, "learn").length;
        const practiceSourceCount = getSmartIdsForSource(source, "practice").length;
        option.textContent = `${source.name} (Learn ${learnSourceCount} · Practice ${practiceSourceCount})`;
        option.selected = source.id === reviewScopeId;
        state.elements.reviewSetSelect.appendChild(option);
      });
      if (named.length) {
        const option = document.createElement("option");
        option.value = REVIEW_ALL_SETS_ID;
        option.textContent = `All saved sets combined (${named.length} sets)`;
        option.selected = reviewScopeId === REVIEW_ALL_SETS_ID;
        state.elements.reviewSetSelect.appendChild(option);
      }
    }

    if (state.elements.reviewScopeMeta) {
      state.elements.reviewScopeMeta.textContent = `Learn ${learnCount} · Practice ${practiceCount} · due ${summary.dueTodayCount} · new ${summary.newCount}`;
    }

    if (state.elements.reviewPlanCompact) {
      clearNode(state.elements.reviewPlanCompact);
      const today = document.createElement("div");
      today.className = "schedule-row compact-schedule-row";
      const left = document.createElement("span");
      left.textContent = `${getReviewScopeName()} · today`;
      const right = document.createElement("strong");
      right.textContent = `${summary.dueTodayCount} due`;
      today.append(left, right);
      state.elements.reviewPlanCompact.appendChild(today);

      const upcoming = summary.byDay.filter((item) => item.date.getTime() > getLocalDayStamp(new Date())).slice(0, 5);
      if (upcoming.length) {
        upcoming.forEach((item) => {
          const row = document.createElement("div");
          row.className = "schedule-row compact-schedule-row";
          const itemLeft = document.createElement("span");
          itemLeft.textContent = formatReviewDateLabel(item.date);
          const itemRight = document.createElement("strong");
          itemRight.textContent = `${item.count} card${item.count === 1 ? "" : "s"}`;
          row.append(itemLeft, itemRight);
          state.elements.reviewPlanCompact.appendChild(row);
        });
      } else if (!summary.dueTodayCount) {
        const empty = document.createElement("div");
        empty.className = "schedule-empty muted";
        empty.textContent = summary.newCount ? `${summary.newCount} new card${summary.newCount === 1 ? "" : "s"} can be first-viewed.` : "No reviews scheduled.";
        state.elements.reviewPlanCompact.appendChild(empty);
      }
    }

    renderFullReviewSchedulePanel(summary);

    if (state.elements.startDueReviewBtn) state.elements.startDueReviewBtn.disabled = !summary.dueTodayCount;
    if (state.elements.startNewCardsBtn) state.elements.startNewCardsBtn.disabled = !summary.newCount;
    if (state.elements.smartFlowStatus) {
      if (summary.dueTodayCount) {
        state.elements.smartFlowStatus.textContent = `${summary.dueTodayCount} due card${summary.dueTodayCount === 1 ? "" : "s"} ready. New cards remain separate until you first-view them.`;
        state.elements.smartFlowStatus.className = "status ok";
      } else if (summary.newCount) {
        state.elements.smartFlowStatus.textContent = `No due reviews today. ${summary.newCount} new card${summary.newCount === 1 ? "" : "s"} can be first-viewed.`;
        state.elements.smartFlowStatus.className = "status muted";
      } else {
        state.elements.smartFlowStatus.textContent = "No due reviews and no new Smart cards in this review source.";
        state.elements.smartFlowStatus.className = "status muted";
      }
    }
  }

  function appendScheduleChips(container, byDay, limit = 5) {
    const upcoming = (byDay || []).slice(0, limit);
    if (!upcoming.length) {
      const chip = document.createElement("span");
      chip.className = "schedule-chip muted";
      chip.textContent = "No scheduled reviews";
      container.appendChild(chip);
      return;
    }
    upcoming.forEach((item) => {
      const chip = document.createElement("span");
      chip.className = "schedule-chip";
      chip.textContent = `${formatReviewDateLabel(item.date)} · ${item.count}`;
      container.appendChild(chip);
    });
  }

  function makeSetScheduleRow(setRecord, summary, activeSetId) {
    const row = document.createElement("div");
    row.className = `saved-set-row${setRecord.id === activeSetId ? " active" : ""}`;

    const main = document.createElement("div");
    main.className = "saved-set-main";
    const name = document.createElement("div");
    name.className = "saved-set-name";
    name.textContent = setRecord.name;
    const meta = document.createElement("div");
    meta.className = "saved-set-meta muted";
    const practiceCount = getSmartIdsForSource(setRecord, "practice").length;
    const nextDue = summary.nextDueDate ? formatLongDate(summary.nextDueDate) : (summary.newCount ? "not scheduled yet" : "—");
    meta.textContent = `${practiceCount} practice · new ${summary.newCount || 0} · started ${summary.startedCount || 0} · due today ${summary.dueTodayCount || 0} · next ${nextDue}`;
    const chips = document.createElement("div");
    chips.className = "schedule-chip-row";
    appendScheduleChips(chips, summary.byDay, 5);
    main.append(name, meta, chips);

    const actions = document.createElement("div");
    actions.className = "saved-set-actions";
    const introduceBtn = createButton("Introduce new", () => startSmartForSet(setRecord.id, "introduce"), "ghost small-btn");
    introduceBtn.disabled = !(summary.newCount > 0);
    const reviewBtn = createButton("Review due", () => startSmartForSet(setRecord.id, "review"), "secondary small-btn");
    reviewBtn.disabled = !(summary.dueTodayCount > 0);
    actions.append(introduceBtn, reviewBtn);

    row.append(main, actions);
    return row;
  }

  function renderSetPanel() {
    // v44: setup no longer renders a separate schedule/overview panel. The Setup
    // page is only the old card-visibility manager with a deck selector.
    if (state.elements.activeSetBadge) state.elements.activeSetBadge.textContent = getSelectedSetupDeck()?.name || "All cards";
  }

  function renderCurrentCardStats(card) {
    clearNode(state.elements.cardStats);
    if (!card) return;
    const summary = getPracticeCardSummaryText(card);
    [summary.translation, summary.pinyin, summary.smart].forEach((text) => {
      const chip = document.createElement("span");
      chip.className = "badge subtle";
      chip.textContent = `Practice · ${text}`;
      state.elements.cardStats.appendChild(chip);
    });
  }

  function clearCard(prompt = "No cards available", subtitle = "Use Card setup or switch card set.") {
    state.elements.cardPrompt.textContent = prompt;
    state.elements.cardHanzi.textContent = "—";
    state.elements.cardPinyin.textContent = subtitle;
    state.elements.cardTranslation.textContent = "";
    clearNode(state.elements.cardStats);
    updateResult(state.elements.resultText, "", "");
    clearNode(state.elements.answerArea);
    clearNode(state.elements.controls);
    state.elements.positionLabel.textContent = "0 / 0";
  }

  function setPositionLabel(card, queueIndex, total) {
    state.elements.positionLabel.textContent = `${queueIndex + 1} / ${total}`;
  }

  function setSmartPositionLabel(card, dueCount, activeCount) {
    state.elements.positionLabel.textContent = `Due ${dueCount} / Started ${activeCount}`;
  }

  // MCQ distractors are sampled from the active mode pool and avoid exact
  // duplicate translation strings; semantic duplicates are not detected here.

  Object.assign(runtime, {
    updateModeButtons,
    renderStats,
    getEditModeIds,
    renderSelectionSummary,
    renderOrderStatus,
    renderSetupPanel,
    renderBuiltInDeckVisibilityPanel,
    getFilteredManageCards,
    renderManageList,
    renderManageListIfNeeded,
    renderScheduleRows,
    renderReviewScopePanel,
    appendScheduleChips,
    makeSetScheduleRow,
    renderSetPanel,
    renderCurrentCardStats,
    clearCard,
    setPositionLabel,
    setSmartPositionLabel
  });
})(window.HSKFlashcards);
