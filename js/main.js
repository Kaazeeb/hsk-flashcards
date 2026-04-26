(function (ns) {
  const { MODES, PRACTICE_QUIZ_TYPES, TEST_QUIZ_TYPES, ALL_SET_ID, SMART_RATINGS } = ns.constants;
  const { normalizeCard, cardId, clamp, shuffle, parseCSV, mapRowsToCards, parseRangeInput, formatReviewDateLabel, formatLongDate } = ns.utils;
  const { checkPinyinAnswer, getReviewPinyinText, shouldAutoFocusPinyinInput, getPinyinInputPlaceholder, getPinyinDisplay } = ns.pinyin;
  const { createPersistenceAdapter } = ns.adapters;
  const { createAppStore } = ns.store;
  const { createButton, clearNode, setBar, updateResult, scheduleStudyAreaFocus } = ns.ui;
  const smart = ns.smart;

  const state = {
    filterText: "",
    manageListDirty: true,
    elements: null,
    store: null,
    smartLastCardId: "",
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
      smartStage: "pinyin",
      smartPinyinCorrect: null,
      smartTranslationCorrect: null,
      smartOutcomeCorrect: null,
      smartSelectedRating: 3,
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
      activeSetBadge: document.getElementById("activeSetBadge"),
      setNameInput: document.getElementById("setNameInput"),
      saveSetBtn: document.getElementById("saveSetBtn"),
      deleteSetBtn: document.getElementById("deleteSetBtn"),
      setCardCount: document.getElementById("setCardCount"),
      setDueToday: document.getElementById("setDueToday"),
      setNextDue: document.getElementById("setNextDue"),
      scheduleList: document.getElementById("scheduleList"),
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

  function getScopedCards() {
    const activeSet = getActiveSet();
    const allowed = new Set((activeSet?.cardIds || []).map(String));
    return getDb().vocab.filter((card) => allowed.has(cardId(card)));
  }

  function getScopedCardMap() {
    return Object.fromEntries(getScopedCards().map((card) => [cardId(card), card]));
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

  function getModeCards(mode = getUi().mode) {
    return getScopedCards().filter((card) => card[mode] !== false);
  }

  function getModeIds(mode = getUi().mode) {
    return getModeCards(mode).map((card) => cardId(card));
  }

  function getAllowedQuizTypes(mode = getUi().mode) {
    if (mode === "practice") return PRACTICE_QUIZ_TYPES;
    if (mode === "test") return TEST_QUIZ_TYPES;
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

  function getSmartDueQueue(now = new Date()) {
    const activeSet = getActiveSet();
    const bucket = getSmartBucketForSet(activeSet.id);
    return smart.getDueQueue(getPracticeScopedIdsForSet(activeSet.id), bucket, getScopedCardMap(), now).map((item) => item.card);
  }

  function getSmartNewQueue(now = new Date()) {
    const activeSet = getActiveSet();
    const bucket = getSmartBucketForSet(activeSet.id);
    return smart.getNewQueue(getPracticeScopedIdsForSet(activeSet.id), bucket, getScopedCardMap(), now).map((item) => item.card);
  }

  function getSmartQueue(now = new Date()) {
    const dueQueue = getSmartDueQueue(now);
    if (dueQueue.length) return dueQueue;
    return getSmartNewQueue(now);
  }

  function getSmartScheduleForSet(setId, now = new Date()) {
    const setRecord = getDb().sets.byId[setId];
    if (!setRecord) return { dueTodayCount: 0, nextDueDate: null, byDay: [], startedCount: 0, newCount: 0 };
    return smart.getScheduleSummary(getPracticeScopedIdsForSet(setId), getSmartBucketForSet(setId), now);
  }

  function getSmartStatsForSet(setId) {
    const setRecord = getDb().sets.byId[setId];
    if (!setRecord) return { shown: 0, correct: 0, wrong: 0 };
    const ids = new Set(getPracticeScopedIdsForSet(setId));
    const bucket = getSmartBucketForSet(setId);
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

  function getSmartCurrentCard() {
    if (!isSmartPracticeActive()) return null;
    const activeIds = new Set(getPracticeScopedIdsForSet(getActiveSet().id));
    if (state.round.smartCardId && activeIds.has(state.round.smartCardId)) {
      const map = getScopedCardMap();
      if (map[state.round.smartCardId]) return map[state.round.smartCardId];
    }
    const queue = getSmartQueue(new Date());
    let picked = queue[0] || null;
    if (picked && queue.length > 1 && state.smartLastCardId) {
      const alternative = queue.find((item) => cardId(item) !== state.smartLastCardId);
      if (alternative) picked = alternative;
    }
    if (picked) state.round.smartCardId = cardId(picked);
    return picked;
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
    const key = `${getActiveSet().id}:${mode}:${quizType || "study"}:${cardId(card)}`;
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
      if (getActiveSet()) {
        const smartStatsIds = new Set(getPracticeScopedIdsForSet(getActiveSet().id));
        Object.entries(getSmartBucketForActiveSet()).forEach(([id, entry]) => {
          if (smartStatsIds.has(id) && ((entry.shown || 0) > 0 || (entry.correct || 0) > 0 || (entry.wrong || 0) > 0)) ids.add(id);
        });
      }
      return ids.size;
    }
    getTouchedIds(mode, "translation").forEach((id) => ids.add(id));
    getTouchedIds(mode, "pinyin").forEach((id) => ids.add(id));
    return ids.size;
  }

  function getPracticeCardStats(card) {
    const id = cardId(card);
    const progress = getDb().progress;
    const smartBucket = getSmartBucketForActiveSet();
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

  function updateModeButtons() {
    const ui = getUi();
    state.elements.modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === ui.mode);
    });
    state.elements.modeLabel.textContent = ui.mode.charAt(0).toUpperCase() + ui.mode.slice(1);
    state.elements.cardSetLabel.textContent = getActiveSet().name;

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
    const scopedCards = getScopedCards();
    const totalCards = scopedCards.length;
    const practiceTranslation = getModeTotals("practice", "translation");
    const practicePinyin = getModeTotals("practice", "pinyin");
    const smartStats = getSmartStatsForSet(getActiveSet().id);
    const learnTotal = getModeIds("learn").length;
    const practiceTotal = getModeIds("practice").length;
    const testTotal = getModeIds("test").length;

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
    setBar(state.elements.barTest, state.elements.barTestLabel, getModeTouchedAcrossTypes("test"), testTotal);
  }

  function renderSelectionSummary() {
    state.elements.selectionSummary.textContent = `Learn ${getModeIds("learn").length} · Practice ${getModeIds("practice").length} · Test ${getModeIds("test").length}`;
  }

  function renderOrderStatus() {
    if (isSmartPracticeActive()) {
      state.elements.orderStatus.textContent = "Smart practice uses only Practice cards. Started cards follow today's FSRS due order; new cards enter FSRS after their first Smart review.";
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
  }

  function getFilteredManageCards() {
    const query = state.filterText.trim().toLowerCase();
    const scoped = getScopedCards();
    if (!query) return scoped;
    return scoped.filter((card) => (
      String(card.index).includes(query)
      || card.hanzi.toLowerCase().includes(query)
      || card.pinyin.toLowerCase().includes(query)
      || card.translation.toLowerCase().includes(query)
    ));
  }

  function renderManageList() {
    clearNode(state.elements.manageList);
    const cards = getFilteredManageCards();
    if (!cards.length) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No cards match the current filter / set.";
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
      title.textContent = `#${card.index} · ${card.hanzi}`;

      const sub = document.createElement("div");
      sub.className = "manage-sub";
      sub.textContent = `${card.pinyin} · ${card.translation}`;

      const stats = document.createElement("div");
      stats.className = "manage-mini muted";
      const summary = getPracticeCardSummaryText(card);
      let smartMeta = "smart inactive";
      if (card.practice !== false) {
        const smartEntry = getSmartBucketForActiveSet()[cardId(card)] || smart.createSmartEntry(new Date());
        if (smart.isStarted(smartEntry)) {
          const due = smart.getDueDay(smartEntry, new Date());
          smartMeta = `smart due ${formatReviewDateLabel(due)}`;
        } else {
          smartMeta = "smart new";
        }
      }
      stats.textContent = `${summary.translation} · ${summary.pinyin} · ${smartMeta}`;

      meta.append(title, sub, stats);

      const flags = document.createElement("div");
      flags.className = "manage-flags";
      MODES.forEach((mode) => {
        const label = document.createElement("label");
        label.className = "flag-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = card[mode] !== false;
        input.dataset.cardId = cardId(card);
        input.dataset.cardMode = mode;
        const span = document.createElement("span");
        span.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        label.append(input, span);
        flags.appendChild(label);
      });

      row.append(meta, flags);
      state.elements.manageList.appendChild(row);
    });
  }

  function renderManageListIfNeeded(force = false) {
    if (getUi().setupCollapsed) return;
    if (!force && !state.manageListDirty) return;
    renderManageList();
    state.manageListDirty = false;
  }

  function renderSetPanel() {
    const sets = getDb().sets.order.map((id) => getDb().sets.byId[id]).filter(Boolean);
    const activeSet = getActiveSet();
    const summary = getSmartScheduleForSet(activeSet.id);

    clearNode(state.elements.activeSetSelect);
    sets.forEach((setRecord) => {
      const option = document.createElement("option");
      option.value = setRecord.id;
      option.textContent = `${setRecord.name} (${setRecord.cardIds.length})`;
      option.selected = setRecord.id === activeSet.id;
      state.elements.activeSetSelect.appendChild(option);
    });

    state.elements.activeSetBadge.textContent = activeSet.name;
    state.elements.deleteSetBtn.disabled = !!activeSet.locked;
    state.elements.setCardCount.textContent = String(getPracticeScopedIdsForSet(activeSet.id).length);
    state.elements.setDueToday.textContent = String(summary.dueTodayCount);
    state.elements.setNextDue.textContent = summary.nextDueDate ? formatReviewDateLabel(summary.nextDueDate) : (summary.newCount ? "No due cards yet" : "No pending future review");

    clearNode(state.elements.scheduleList);
    const upcoming = summary.byDay.slice(0, 24);
    if (!upcoming.length) {
      const empty = document.createElement("div");
      empty.className = "schedule-empty muted";
      empty.textContent = "No review schedule yet.";
      state.elements.scheduleList.appendChild(empty);
    } else {
      upcoming.forEach((item) => {
        const row = document.createElement("div");
        row.className = "schedule-row";
        const left = document.createElement("span");
        left.textContent = formatReviewDateLabel(item.date);
        const right = document.createElement("strong");
        right.textContent = `${item.count} card${item.count === 1 ? "" : "s"}`;
        row.append(left, right);
        state.elements.scheduleList.appendChild(row);
      });
    }

    clearNode(state.elements.setsOverview);
    sets.forEach((setRecord) => {
      const setSummary = getSmartScheduleForSet(setRecord.id);
      const row = document.createElement("div");
      row.className = `saved-set-row${setRecord.id === activeSet.id ? " active" : ""}`;
      const name = document.createElement("div");
      name.className = "saved-set-name";
      name.textContent = setRecord.name;
      const meta = document.createElement("div");
      meta.className = "saved-set-meta muted";
      const nextDue = setSummary.nextDueDate ? formatLongDate(setSummary.nextDueDate) : (setSummary.newCount ? "No due yet" : "—");
      meta.textContent = `${getPracticeScopedIdsForSet(setRecord.id).length} practice · due today ${setSummary.dueTodayCount} · new ${setSummary.newCount} · next ${nextDue}`;
      row.append(name, meta);
      state.elements.setsOverview.appendChild(row);
    });
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
    const check = checkPinyinAnswer(answerText, card.pinyin);
    state.round.answerText = answerText;
    state.round.selectedCorrect = check.correct;
    state.round.pendingCheck = check;

    if (getUi().mode === "practice" && !check.correct) {
      state.round.pendingWrong = true;
      state.round.resultText = check.formatValid
        ? "Not counted yet. Retry without penalty if this was a typo, or press Enter / → to count it wrong and reveal the answer."
        : "Not counted yet. Missing tone numbers are only allowed on neutral-tone syllables. Retry without penalty, or press Enter / → to count it wrong and reveal the answer.";
      state.round.resultClass = "bad";
      render();
      scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
      return;
    }

    state.round.answered = true;
    state.round.resultText = !check.formatValid
      ? `Use tone numbers for non-neutral syllables. Neutral 5 is optional. Example: ni3hao3, lv4, xie4xie. Correct pinyin: ${reviewAnswer}${reviewSuffix}`
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
    const check = checkPinyinAnswer(answerText, card.pinyin);
    state.round.answerText = answerText;
    state.round.pendingCheck = check;
    if (!check.correct) {
      state.round.pendingWrong = true;
      state.round.resultText = check.formatValid
        ? "Not counted yet. Retry without penalty if this was a typo, or press Enter / → to count it wrong and reveal the answer before step 2."
        : "Not counted yet. Missing tone numbers are only allowed on neutral-tone syllables. Retry without penalty, or press Enter / → to count it wrong and reveal the answer before step 2.";
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

  function acceptSmartFsrsFeedback() {
    if (state.round.smartStage !== "feedback") return;
    const card = getCurrentCard();
    if (!card) return;
    const bucket = getSmartBucketForActiveSet();
    smart.reviewCard(bucket, card, state.round.smartSelectedRating, new Date());
    persist();
    nextSmartCard();
  }

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

  function nextSmartCard() {
    state.smartLastCardId = cardId(getCurrentCard() || "");
    resetRoundState();
    persist();
    render();
    scheduleStudyAreaFocus(state.elements, { preferAnswer: true });
  }

  function renderLearn(card, queueIndex, total) {
    state.elements.cardPrompt.textContent = "Vocabulary";
    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = card.pinyin;
    state.elements.cardTranslation.textContent = card.translation;
    clearNode(state.elements.answerArea);
    updateResult(state.elements.resultText, "", "");
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
    state.elements.cardPrompt.textContent = getUi().mode === "practice" ? "Choose the English translation" : "Test: choose the English translation";
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
    const isPractice = getUi().mode === "practice";
    const { reviewText } = getReviewPinyinText(card);
    state.elements.cardPrompt.textContent = isPractice ? "Type the pinyin with tone numbers" : "Test: type the pinyin with tone numbers";
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
          : "Use tone numbers. Example: ni3hao3, lv4, xie4xie. Use v for ü. Neutral 5 is optional.",
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

  function renderSmartPractice(card, dueCount, activeCount) {
    const { reviewText } = getReviewPinyinText(card);
    const smartEntry = getSmartBucketForActiveSet()[cardId(card)] || smart.createSmartEntry(new Date());
    const isNewSmartCard = !smart.isStarted(smartEntry);
    prepareRoundAppearance("practice", "smart", card);
    setSmartPositionLabel(card, dueCount, activeCount);
    renderCurrentCardStats(card);

    state.elements.cardHanzi.textContent = card.hanzi;
    state.elements.cardPinyin.textContent = state.round.smartStage === "pinyin" ? "" : reviewText;
    state.elements.cardTranslation.textContent = state.round.smartStage === "feedback" ? card.translation : "";

    if (state.round.smartStage === "pinyin") {
      state.elements.cardPrompt.textContent = isNewSmartCard ? "Smart practice · new card · 1 of 3 · type the pinyin" : "Smart practice · 1 of 3 · type the pinyin";
      updateResult(
        state.elements.resultText,
        state.round.pendingWrong ? state.round.resultText : (isNewSmartCard ? "First Smart review for this card. It will only enter the FSRS schedule after you finish this review. Use tone numbers. Example: ni3hao3, lv4, xie4xie." : "Step 1 of 3. Use tone numbers. Example: ni3hao3, lv4, xie4xie."),
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

  function renderSmartBlocked() {
    const activeSet = getActiveSet();
    const summary = getSmartScheduleForSet(activeSet.id);
    const practiceCount = getPracticeScopedIdsForSet(activeSet.id).length;
    state.elements.cardPrompt.textContent = "Smart practice blocked";
    state.elements.cardHanzi.textContent = "—";
    if (summary.nextDueDate) {
      state.elements.cardPinyin.textContent = `Next due: ${formatReviewDateLabel(summary.nextDueDate)}`;
    } else if (summary.newCount) {
      state.elements.cardPinyin.textContent = `${summary.newCount} practice card${summary.newCount === 1 ? '' : 's'} not started in Smart yet.`;
    } else {
      state.elements.cardPinyin.textContent = "No cards scheduled yet.";
    }
    state.elements.cardTranslation.textContent = practiceCount ? "No started Practice cards are due today." : "No cards are currently marked for Practice in the active set.";
    clearNode(state.elements.cardStats);
    updateResult(state.elements.resultText, practiceCount ? "No due reviews today. New cards stay outside the FSRS schedule until their first Smart review." : "Add cards to Practice to make them eligible for Smart.", "bad");
    clearNode(state.elements.answerArea);
    clearNode(state.elements.controls);
    state.elements.controls.append(createButton("Next mode card", nextCard, "secondary", { disabled: true }));
    state.elements.positionLabel.textContent = `Due 0 / ${summary.startedCount}`;
  }

  function render() {
    updateModeButtons();
    renderStats();
    renderSetPanel();
    renderSelectionSummary();
    renderOrderStatus();
    renderSetupPanel();
    renderManageListIfNeeded();

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
      const dueQueue = getSmartDueQueue(new Date());
      const summary = getSmartScheduleForSet(getActiveSet().id);
      renderSmartPractice(card, dueQueue.length, summary.startedCount);
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
    await state.store.restoreBuiltIn();
    state.elements.vocabInput.value = "";
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = "Built-in vocabulary restored. Existing sets and progress were kept where card IDs still matched.";
    render();
  }

  async function handleResetProgress() {
    const db = getDb();
    db.progress = ns.store.createEmptyProgress();
    db.smartBySet = {};
    db.ui.indexes = { learn: 0, practice: 0, test: 0 };
    db.ui.order = { learn: [], practice: [], test: [] };
    db.ui.orderType = { learn: "default", practice: "default", test: "default" };
    resetRoundState();
    markManageListDirty();
    await persist();
    state.elements.statusText.textContent = "Progress reset. Vocabulary and named sets were kept.";
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
      state.elements.statusText.textContent = "No Practice cards are currently selected in this scope.";
      return;
    }
    const record = await state.store.saveNamedSet(name, practiceIds);
    resetRoundState();
    markManageListDirty();
    state.elements.statusText.textContent = `Named set saved: ${record.name} (${record.cardIds.length} cards).`;
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
    markManageListDirty();
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

  function handleTranslationKeyboard(event) {
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
    const active = document.activeElement;
    const isTextInput = active && active.tagName === "INPUT" && active.type === "text";
    if (event.key !== "Enter" && event.key !== "ArrowRight") return;

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
    state.elements.deleteSetBtn.addEventListener("click", handleDeleteSelectedSet);
    state.elements.activeSetSelect.addEventListener("change", handleSetChange);
    window.addEventListener("keydown", handleTranslationKeyboard);
    window.addEventListener("keydown", handlePinyinKeyboard);
  }

  async function bootstrap() {
    state.elements = getElements();
    const builtinCards = ns.getBuiltInCards();
    const adapter = createPersistenceAdapter();
    state.store = createAppStore(adapter, builtinCards);
    await state.store.load();
    state.filterText = state.elements.filterInput.value || "";
    state.elements.storageModeBadge.textContent = adapter.kind === "remote" ? "remote adapter + local cache" : "built in · local data layer";
    bindEvents();
    render();
  }

  ns.main = { bootstrap };
})(window.HSKFlashcards);
