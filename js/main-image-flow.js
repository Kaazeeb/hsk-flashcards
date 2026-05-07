/**
 * Image flashcards page.
 *
 * This page is prepared for lightweight built-in image cards. Image bytes are
 * served as static files from GitHub Pages; Supabase stores only events/IDs.
 */
(function (ns) {
  const runtime = ns.mainRuntime = ns.mainRuntime || {};
  const {
    IMAGE_ALL_DECK_ID,
    IMAGE_SMART_SPACING_FACTOR,
    IMAGE_SMART_RATING_LABELS,
    SMART_RATINGS,
    state,
    smart,
    createButton,
    clearNode,
    updateResult,
    scheduleStudyAreaFocus,
    formatReviewDateLabel,
    hashStringToUnitInterval,
    getLocalDayStamp,
    shuffle
  } = runtime;

  function getDb() { return runtime.getDb(); }
  function persist() { return runtime.persist(); }
  function createEmptyImageRound() { return runtime.createEmptyImageRound(); }

  function ensureImageRound() {
    if (!state.imageRound) state.imageRound = createEmptyImageRound();
    return state.imageRound;
  }

  function resetImageRound() {
    state.imageRound = createEmptyImageRound();
    return state.imageRound;
  }

  function getImageUi() {
    return getDb().imageUi;
  }

  function getImageCards() {
    return getDb().imageCards || [];
  }

  function getImageDecks() {
    const cards = getImageCards();
    const byId = new Map();
    byId.set(IMAGE_ALL_DECK_ID, { id: IMAGE_ALL_DECK_ID, name: "All image cards", count: cards.length });
    cards.forEach((card) => {
      const existing = byId.get(card.deckId) || { id: card.deckId, name: card.deckName || card.deckId, count: 0 };
      existing.count += 1;
      if (card.deckName) existing.name = card.deckName;
      byId.set(card.deckId, existing);
    });
    return [...byId.values()];
  }

  function getSelectedImageDeckId() {
    const ui = getImageUi();
    const ids = new Set(getImageDecks().map((deck) => deck.id));
    if (!ids.has(ui.deckId)) ui.deckId = IMAGE_ALL_DECK_ID;
    return ui.deckId;
  }

  function getSelectedImageDeckName() {
    const id = getSelectedImageDeckId();
    return getImageDecks().find((deck) => deck.id === id)?.name || "Image cards";
  }

  function getImageCardsForDeck(deckId = getSelectedImageDeckId()) {
    const cards = getImageCards();
    const filtered = deckId === IMAGE_ALL_DECK_ID ? cards : cards.filter((card) => card.deckId === deckId);
    return filtered.slice().sort((a, b) => (a.index || 0) - (b.index || 0));
  }

  function getImageCardMap(deckId = getSelectedImageDeckId()) {
    return Object.fromEntries(getImageCardsForDeck(deckId).map((card) => [card.id, card]));
  }

  function getImageSmartBucket(deckId = getSelectedImageDeckId()) {
    return state.store.ensureImageSmartDeck(deckId);
  }

  function getImageScheduleSummary(deckId = getSelectedImageDeckId(), now = new Date()) {
    const cards = getImageCardsForDeck(deckId);
    return smart.getScheduleSummary(cards.map((card) => card.id), getImageSmartBucket(deckId), now);
  }

  function getImageOrderIds() {
    const ui = getImageUi();
    const cards = getImageCardsForDeck();
    const valid = new Set(cards.map((card) => card.id));
    if (!ui.order.length || ui.order.some((id) => !valid.has(id)) || ui.order.length !== cards.length) {
      ui.order = cards.map((card) => card.id);
      ui.orderType = "default";
      ui.index = Math.min(ui.index || 0, Math.max(0, ui.order.length - 1));
    }
    return ui.order;
  }

  function getCurrentImageCard() {
    const ids = getImageOrderIds();
    const ui = getImageUi();
    const map = getImageCardMap();
    if (!ids.length) return null;
    ui.index = Math.min(Math.max(0, ui.index || 0), ids.length - 1);
    return map[ids[ui.index]] || null;
  }

  function imageAssetUrl(card) {
    const path = String(card?.imagePath || "").replace(/^\/+/, "");
    return `${ns.constants.IMAGE_ASSET_BASE_PATH}${path}`;
  }

  function imageQueueKey(deckId, cardId) {
    return `${deckId || ""}:${cardId || ""}`;
  }

  function clearImageSessionDeferrals() {
    state.imageSmartDeferredQueueKeys = [];
  }

  function deferImageCardToTail(deckId, cardId) {
    const key = imageQueueKey(deckId, cardId);
    state.imageSmartDeferredQueueKeys = (state.imageSmartDeferredQueueKeys || []).filter((item) => item !== key);
    state.imageSmartDeferredQueueKeys.push(key);
  }

  function sortImageSmartItems(items) {
    const live = new Set(items.map((item) => imageQueueKey(item.deckId, item.id || item.card?.id)));
    state.imageSmartDeferredQueueKeys = (state.imageSmartDeferredQueueKeys || []).filter((key) => live.has(key));
    const deferred = new Map(state.imageSmartDeferredQueueKeys.map((key, index) => [key, index]));
    return [...items].sort((a, b) => {
      const aKey = imageQueueKey(a.deckId, a.id || a.card?.id);
      const bKey = imageQueueKey(b.deckId, b.id || b.card?.id);
      const aDeferred = deferred.has(aKey);
      const bDeferred = deferred.has(bKey);
      if (aDeferred !== bDeferred) return aDeferred ? 1 : -1;
      if (aDeferred && bDeferred) return deferred.get(aKey) - deferred.get(bKey);
      const aDue = smart.getDueDay(a.entry, new Date());
      const bDue = smart.getDueDay(b.entry, new Date());
      const aStamp = aDue ? aDue.getTime() : 0;
      const bStamp = bDue ? bDue.getTime() : 0;
      if (aStamp !== bStamp) return aStamp - bStamp;
      if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey;
      return (a.card?.index || 0) - (b.card?.index || 0);
    });
  }

  function decorateImageItems(deckId, items, now = new Date()) {
    return (items || []).map((item) => ({
      ...item,
      deckId,
      sortKey: hashStringToUnitInterval(`${state.imageSmartSessionSeed}::${deckId}::${item.id || item.card?.id}::${getLocalDayStamp(now)}`)
    }));
  }

  function getImageSmartItems(now = new Date()) {
    const deckId = getSelectedImageDeckId();
    const cards = getImageCardsForDeck(deckId);
    const ids = cards.map((card) => card.id);
    const map = Object.fromEntries(cards.map((card) => [card.id, card]));
    const bucket = getImageSmartBucket(deckId);
    const round = ensureImageRound();
    const options = { sessionSeed: `${state.imageSmartSessionSeed}::${deckId}` };
    const raw = round.forceNew
      ? smart.getNewQueue(ids, bucket, map, now, options)
      : smart.getDueQueue(ids, bucket, map, now, options);
    return sortImageSmartItems(decorateImageItems(deckId, raw, now));
  }

  function getCurrentImageSmartItem(now = new Date()) {
    const items = getImageSmartItems(now);
    const round = ensureImageRound();
    if (!items.length) return null;
    let picked = items[0];
    if (round.cardId && items.length > 1 && picked.id === round.cardId) {
      picked = items.find((item) => item.id !== round.cardId) || picked;
    }
    round.cardId = picked.id || picked.card?.id || "";
    round.deckId = picked.deckId || getSelectedImageDeckId();
    return picked;
  }

  function markImageSeen(card) {
    if (!card?.id) return;
    const db = getDb();
    db.imageProgress.seen = db.imageProgress.seen || {};
    if (db.imageProgress.seen[card.id]) return;
    db.imageProgress.seen[card.id] = true;
    persist();
  }

  function renderImageDeckOptions() {
    const select = state.elements.imageDeckSelect;
    if (!select) return;
    const current = getSelectedImageDeckId();
    clearNode(select);
    getImageDecks().forEach((deck) => {
      const option = document.createElement("option");
      option.value = deck.id;
      option.textContent = `${deck.name} · ${deck.count}`;
      option.selected = deck.id === current;
      select.appendChild(option);
    });
  }

  function renderImageSchedule() {
    const deckId = getSelectedImageDeckId();
    const cards = getImageCardsForDeck(deckId);
    const summary = getImageScheduleSummary(deckId);
    if (state.elements.imageDeckMeta) {
      state.elements.imageDeckMeta.textContent = `${cards.length} image card${cards.length === 1 ? "" : "s"}`;
    }
    if (state.elements.imageScheduleCompact) {
      clearNode(state.elements.imageScheduleCompact);
      const rows = [
        `New ${summary.newCount}`,
        `Started ${summary.startedCount}`,
        `Due today ${summary.dueTodayCount}`
      ];
      if (summary.nextDueDate) rows.push(`Next ${formatReviewDateLabel(summary.nextDueDate)}`);
      rows.forEach((text) => {
        const chip = document.createElement("span");
        chip.className = "schedule-chip";
        chip.textContent = text;
        state.elements.imageScheduleCompact.appendChild(chip);
      });
    }
  }

  function renderImageTop() {
    renderImageDeckOptions();
    renderImageSchedule();
    const ui = getImageUi();
    if (state.elements.imageModeLabel) state.elements.imageModeLabel.textContent = ui.mode === "smart" ? "Images · Smart" : "Images · Learn";
    if (state.elements.imageDeckLabel) state.elements.imageDeckLabel.textContent = getSelectedImageDeckName();
    state.elements.imageModeButtons.forEach((button) => button.classList.toggle("active", button.dataset.imageMode === ui.mode));
    if (state.elements.imageFlowStatus) {
      state.elements.imageFlowStatus.textContent = "Images are static GitHub assets; Supabase stores only IDs and review events.";
    }
  }

  function clearImageCard(title = "No image cards configured yet", detail = "Add image files under images/flashcards/ and records in js/image-cards-data.js.") {
    if (state.elements.imagePrompt) state.elements.imagePrompt.textContent = title;
    if (state.elements.imageFrame) state.elements.imageFrame.classList.add("empty-image-frame");
    if (state.elements.imageCardImg) {
      state.elements.imageCardImg.removeAttribute("src");
      state.elements.imageCardImg.alt = "";
      state.elements.imageCardImg.hidden = true;
    }
    if (state.elements.imageAnswerHanzi) state.elements.imageAnswerHanzi.textContent = "—";
    if (state.elements.imageAnswerPinyin) state.elements.imageAnswerPinyin.textContent = detail;
    if (state.elements.imageAnswerTranslation) state.elements.imageAnswerTranslation.textContent = "";
    clearNode(state.elements.imageStats);
    clearNode(state.elements.imageAnswerArea);
    clearNode(state.elements.imageControls);
    updateResult(state.elements.imageResultText, "", "");
    if (state.elements.imagePositionLabel) state.elements.imagePositionLabel.textContent = "0 / 0";
  }

  function showImageCard(card, reveal = false) {
    if (!card) return;
    if (state.elements.imageFrame) state.elements.imageFrame.classList.remove("empty-image-frame");
    if (state.elements.imageCardImg) {
      state.elements.imageCardImg.src = imageAssetUrl(card);
      state.elements.imageCardImg.alt = card.alt || card.translation || card.hanzi || "Image flashcard";
      state.elements.imageCardImg.hidden = false;
      state.elements.imageCardImg.loading = "lazy";
    }
    state.elements.imageAnswerHanzi.textContent = reveal ? (card.hanzi || "—") : "?";
    state.elements.imageAnswerPinyin.textContent = reveal ? (card.pinyin || "") : "";
    state.elements.imageAnswerTranslation.textContent = reveal ? (card.translation || "") : "";
  }

  function renderImageStats(card, deckId = getSelectedImageDeckId()) {
    clearNode(state.elements.imageStats);
    const bucket = getImageSmartBucket(deckId);
    const entry = bucket[card.id] || smart.createSmartEntry(new Date());
    const seen = !!getDb().imageProgress?.seen?.[card.id];
    const chips = [seen ? "seen in Learn" : "new in Learn"];
    if (smart.isStarted(entry)) {
      const due = smart.getDueDay(entry, new Date());
      chips.push(`FSRS due ${formatReviewDateLabel(due)}`);
      chips.push(`${entry.correct || 0} good · ${entry.wrong || 0} again`);
    } else {
      chips.push("new in FSRS");
    }
    chips.forEach((text) => {
      const chip = document.createElement("span");
      chip.className = "mini-stat";
      chip.textContent = text;
      state.elements.imageStats.appendChild(chip);
    });
  }

  function renderImageLearn() {
    const card = getCurrentImageCard();
    const ids = getImageOrderIds();
    if (!card) {
      clearImageCard();
      return;
    }
    markImageSeen(card);
    state.elements.imagePrompt.textContent = "Look at the picture and read the answer";
    showImageCard(card, true);
    renderImageStats(card);
    updateResult(state.elements.imageResultText, "Learn mode shows the full answer. Use Next when the child is ready.", "");
    state.elements.imagePositionLabel.textContent = `${getImageUi().index + 1} / ${ids.length}`;
    clearNode(state.elements.imageAnswerArea);
    clearNode(state.elements.imageControls);
    state.elements.imageControls.append(
      createButton("Previous", previousImageCard, "secondary"),
      createButton("Next", nextImageCard)
    );
  }

  function renderImageSmartBlocked() {
    const round = ensureImageRound();
    const summary = getImageScheduleSummary();
    const total = getImageCardsForDeck().length;
    clearImageCard(round.forceNew ? "No new image cards" : "No due image reviews", total ? "Use First view images to introduce new cards." : "Add image records first.");
    if (state.elements.imageAnswerTranslation) {
      if (!total) state.elements.imageAnswerTranslation.textContent = "This page is ready, but no image flashcards exist yet.";
      else if (round.forceNew) state.elements.imageAnswerTranslation.textContent = "All image cards in this deck have been introduced.";
      else state.elements.imageAnswerTranslation.textContent = summary.nextDueDate ? `Next due: ${formatReviewDateLabel(summary.nextDueDate)}` : "No image cards are due today.";
    }
    clearNode(state.elements.imageControls);
    if (total && summary.newCount) {
      state.elements.imageControls.append(createButton("First view images", startImageNewCards, "secondary"));
    }
    if (total && summary.dueTodayCount) {
      state.elements.imageControls.append(createButton("Review due images", startImageDueReview));
    }
  }

  function introduceCurrentImageCard() {
    const item = getCurrentImageSmartItem();
    const round = ensureImageRound();
    if (!item || round.introCommitted) return;
    round.introCommitted = true;
    const bucket = getImageSmartBucket(item.deckId);
    smart.reviewCard(bucket, item.card, 3, new Date(), { spacingFactor: IMAGE_SMART_SPACING_FACTOR });
    persist();
    nextImageSmartCard();
  }

  function renderImageSmartIntro(item, summary) {
    const card = item.card;
    state.elements.imagePrompt.textContent = "First look · image card";
    showImageCard(card, true);
    renderImageStats(card, item.deckId);
    state.elements.imagePositionLabel.textContent = `New ${summary.newCount} / Started ${summary.startedCount}`;
    updateResult(state.elements.imageResultText, "Read the picture card with the child. Mark introduced to add it to the gentle FSRS schedule.", "");
    clearNode(state.elements.imageAnswerArea);
    clearNode(state.elements.imageControls);
    state.elements.imageControls.append(
      createButton("Skip", nextImageSmartCard, "secondary"),
      createButton("Mark introduced", introduceCurrentImageCard)
    );
  }

  function showImageSmartAnswer() {
    const round = ensureImageRound();
    round.stage = "feedback";
    renderImagePage();
  }

  function setImageSmartRating(rating) {
    const round = ensureImageRound();
    round.selectedRating = SMART_RATINGS.includes(Number(rating)) ? Number(rating) : 3;
    renderImagePage();
  }

  function acceptImageSmartRating() {
    const item = getCurrentImageSmartItem();
    const round = ensureImageRound();
    if (!item || round.feedbackCommitted) return;
    round.feedbackCommitted = true;
    const rating = SMART_RATINGS.includes(round.selectedRating) ? round.selectedRating : 3;
    const bucket = getImageSmartBucket(item.deckId);
    smart.reviewCard(bucket, item.card, rating, new Date(), { spacingFactor: IMAGE_SMART_SPACING_FACTOR });
    if (rating === 1) deferImageCardToTail(item.deckId, item.card.id);
    persist();
    nextImageSmartCard();
  }

  function renderImageSmartReview(item, summary) {
    const round = ensureImageRound();
    const card = item.card;
    const reveal = round.stage === "feedback";
    state.elements.imagePrompt.textContent = reveal ? "How did it go?" : "What is this picture?";
    showImageCard(card, reveal);
    renderImageStats(card, item.deckId);
    state.elements.imagePositionLabel.textContent = `Due ${summary.dueTodayCount} / Started ${summary.startedCount}`;
    updateResult(state.elements.imageResultText, reveal ? "Choose a gentle FSRS rating. Again sends the card to the end of today's image queue." : "Ask the child first, then show the answer.", "");
    clearNode(state.elements.imageAnswerArea);
    clearNode(state.elements.imageControls);
    if (!reveal) {
      state.elements.imageControls.append(
        createButton("Skip", nextImageSmartCard, "secondary"),
        createButton("Show answer", showImageSmartAnswer)
      );
      return;
    }
    SMART_RATINGS.forEach((rating) => {
      const label = `${rating}. ${IMAGE_SMART_RATING_LABELS[rating] || smart.ratingLabel(rating)}`;
      const button = createButton(label, () => setImageSmartRating(rating), "answer-btn", { dataset: { imageSmartRating: String(rating) } });
      if (rating === round.selectedRating) button.classList.add("selected");
      state.elements.imageAnswerArea.appendChild(button);
    });
    state.elements.imageControls.append(
      createButton("Accept rating", acceptImageSmartRating),
      createButton("Skip", nextImageSmartCard, "secondary")
    );
  }

  function renderImageSmart() {
    const item = getCurrentImageSmartItem();
    const summary = getImageScheduleSummary();
    if (!item) {
      renderImageSmartBlocked();
      return;
    }
    if (ensureImageRound().forceNew) renderImageSmartIntro(item, summary);
    else renderImageSmartReview(item, summary);
  }

  function renderImagePage() {
    ensureImageRound();
    renderImageTop();
    if (getImageUi().mode === "smart") renderImageSmart();
    else renderImageLearn();
  }

  function setImageMode(mode) {
    if (!["learn", "smart"].includes(mode)) return;
    getImageUi().mode = mode;
    resetImageRound();
    persist();
    renderImagePage();
  }

  function setImageDeck(deckId) {
    getImageUi().deckId = deckId || IMAGE_ALL_DECK_ID;
    getImageUi().index = 0;
    getImageUi().order = [];
    resetImageRound();
    persist();
    renderImagePage();
  }

  function nextImageCard() {
    const ui = getImageUi();
    const ids = getImageOrderIds();
    if (!ids.length) return;
    ui.index = (ui.index + 1) % ids.length;
    resetImageRound();
    persist();
    renderImagePage();
  }

  function previousImageCard() {
    const ui = getImageUi();
    const ids = getImageOrderIds();
    if (!ids.length) return;
    ui.index = (ui.index - 1 + ids.length) % ids.length;
    resetImageRound();
    persist();
    renderImagePage();
  }

  function nextImageSmartCard() {
    const keepNew = !!ensureImageRound().forceNew;
    resetImageRound();
    state.imageRound.forceNew = keepNew;
    renderImagePage();
    scheduleStudyAreaFocus({ answerArea: state.elements.imageAnswerArea, flashcard: state.elements.imageFrame }, { preferAnswer: false });
  }

  function startImageDueReview() {
    getImageUi().mode = "smart";
    resetImageRound();
    clearImageSessionDeferrals();
    state.imageRound.forceNew = false;
    persist();
    renderImagePage();
  }

  function startImageNewCards() {
    getImageUi().mode = "smart";
    resetImageRound();
    clearImageSessionDeferrals();
    state.imageRound.forceNew = true;
    persist();
    renderImagePage();
  }

  function shuffleImageLearn() {
    const ui = getImageUi();
    const ids = getImageCardsForDeck().map((card) => card.id);
    if (ids.length < 2) return;
    ui.order = shuffle(ids);
    ui.orderType = "shuffled";
    ui.index = 0;
    resetImageRound();
    persist();
    renderImagePage();
  }

  function resetImageOrder() {
    const ui = getImageUi();
    ui.order = getImageCardsForDeck().map((card) => card.id);
    ui.orderType = "default";
    ui.index = 0;
    resetImageRound();
    persist();
    renderImagePage();
  }

  function handleImageKeyboard(event) {
    if (state.currentPage !== "images") return;
    if (event.key !== "Enter" && !/[1-4]/.test(event.key)) return;
    const ui = getImageUi();
    if (ui.mode === "learn") {
      if (event.key === "Enter") {
        event.preventDefault();
        nextImageCard();
      }
      return;
    }
    const round = ensureImageRound();
    if (round.forceNew) {
      if (event.key === "Enter") {
        event.preventDefault();
        introduceCurrentImageCard();
      }
      return;
    }
    if (round.stage !== "feedback") {
      if (event.key === "Enter") {
        event.preventDefault();
        showImageSmartAnswer();
      }
      return;
    }
    if (/[1-4]/.test(event.key)) {
      event.preventDefault();
      round.selectedRating = Number(event.key);
      renderImagePage();
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      acceptImageSmartRating();
    }
  }

  function bindImageEvents() {
    if (state.elements.imageDeckSelect) state.elements.imageDeckSelect.addEventListener("change", (event) => setImageDeck(event.target.value));
    state.elements.imageModeButtons.forEach((button) => button.addEventListener("click", () => setImageMode(button.dataset.imageMode)));
    if (state.elements.imageShuffleBtn) state.elements.imageShuffleBtn.addEventListener("click", shuffleImageLearn);
    if (state.elements.imageResetOrderBtn) state.elements.imageResetOrderBtn.addEventListener("click", resetImageOrder);
    if (state.elements.imageStartDueBtn) state.elements.imageStartDueBtn.addEventListener("click", startImageDueReview);
    if (state.elements.imageStartNewBtn) state.elements.imageStartNewBtn.addEventListener("click", startImageNewCards);
    window.addEventListener("keydown", handleImageKeyboard);
  }

  Object.assign(runtime, {
    renderImagePage,
    bindImageEvents,
    setImageMode,
    startImageDueReview,
    startImageNewCards
  });
})(window.HSKFlashcards);
