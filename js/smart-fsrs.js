(function (ns) {
  const FSRS_API = typeof window !== "undefined" ? window.FSRS : null;
  const { normalizeDate, getStartOfLocalDay, getLocalNoon, addLocalDays, getLocalDayStamp, formatLocalDayKey, hashStringToUnitInterval, MS_PER_DAY, cardId } = ns.utils;
  const { SMART_RATINGS, SMART_RATING_LABELS } = ns.constants;
  const scheduler = FSRS_API && typeof FSRS_API.fsrs === "function" ? FSRS_API.fsrs({ enable_fuzz: true }) : null;

  function createEmptyFsrsCard(now = new Date()) {
    if (FSRS_API && typeof FSRS_API.createEmptyCard === "function") {
      return FSRS_API.createEmptyCard(now);
    }
    return {
      due: new Date(now),
      stability: 0,
      difficulty: 0,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: 0,
      last_review: undefined
    };
  }

  function normalizeFsrsCard(card, now = new Date()) {
    if (!card || typeof card !== "object") return createEmptyFsrsCard(now);
    return {
      due: normalizeDate(card.due, now),
      stability: Math.max(0, Number(card.stability) || 0),
      difficulty: Math.max(0, Number(card.difficulty) || 0),
      elapsed_days: Math.max(0, Math.floor(Number(card.elapsed_days) || 0)),
      scheduled_days: Math.max(0, Math.floor(Number(card.scheduled_days) || 0)),
      learning_steps: Math.max(0, Math.floor(Number(card.learning_steps) || 0)),
      reps: Math.max(0, Math.floor(Number(card.reps) || 0)),
      lapses: Math.max(0, Math.floor(Number(card.lapses) || 0)),
      state: Number.isFinite(Number(card.state)) ? Number(card.state) : 0,
      last_review: card.last_review ? normalizeDate(card.last_review, now) : undefined
    };
  }

  function getFuzzyRoundedDueDate(rawDue, now = new Date()) {
    const normalizedNow = normalizeDate(now);
    const normalizedDue = normalizeDate(rawDue, normalizedNow);
    const exactDays = Math.max(0, (normalizedDue.getTime() - normalizedNow.getTime()) / MS_PER_DAY);
    const lowerDays = Math.floor(exactDays);
    const fraction = exactDays - lowerDays;
    const roundedDays = lowerDays + (fraction > 0 && Math.random() < fraction ? 1 : 0);
    return getLocalNoon(addLocalDays(normalizedNow, roundedDays));
  }

  function roundFsrsCardToDueDay(card, now = new Date(), options = {}) {
    const normalized = normalizeFsrsCard(card, now);
    const roundedDue = options.forceSameDay ? getLocalNoon(now) : getFuzzyRoundedDueDate(normalized.due, now);
    const scheduledDays = Math.max(0, Math.round((getStartOfLocalDay(roundedDue).getTime() - getStartOfLocalDay(now).getTime()) / MS_PER_DAY));
    return {
      ...normalized,
      due: roundedDue,
      scheduled_days: scheduledDays
    };
  }

  function createSmartEntry(now = new Date()) {
    return {
      shown: 0,
      correct: 0,
      wrong: 0,
      started: false,
      card: null
    };
  }

  function normalizeEntry(entry, now = new Date()) {
    if (!entry || typeof entry !== "object") return createSmartEntry(now);
    const started = entry.started === undefined ? !!(entry.card || entry.fsrsCard) : !!entry.started;
    return {
      shown: Math.max(0, Math.floor(Number(entry.shown) || 0)),
      correct: Math.max(0, Math.floor(Number(entry.correct) || 0)),
      wrong: Math.max(0, Math.floor(Number(entry.wrong) || 0)),
      started,
      card: started ? normalizeFsrsCard(entry.card || entry.fsrsCard, now) : null
    };
  }

  function getEntry(bucket, cardOrId, now = new Date()) {
    const id = cardId(cardOrId);
    return normalizeEntry(bucket?.[id], now);
  }

  function isStarted(entry) {
    return !!entry?.started && !!entry?.card;
  }

  function getDueDay(cardLike, fallback = new Date()) {
    const entryCard = cardLike?.card ? cardLike.card : cardLike;
    if (!entryCard || !entryCard.due) return null;
    return getStartOfLocalDay(normalizeDate(entryCard.due, fallback));
  }

  function getLastReviewDay(entry, fallback = new Date()) {
    const entryCard = entry?.card ? entry.card : entry;
    if (!entryCard || !entryCard.last_review) return null;
    return getStartOfLocalDay(normalizeDate(entryCard.last_review, fallback));
  }

  function wasReviewedOnLocalDay(entry, day = new Date(), fallback = new Date()) {
    const reviewDay = getLastReviewDay(entry, fallback);
    if (!reviewDay) return false;
    return reviewDay.getTime() === getStartOfLocalDay(day).getTime();
  }

  function getReviewAvailableDay(entry, now = new Date()) {
    const dueDay = getDueDay(entry, now);
    if (!dueDay) return null;
    return dueDay;
  }

  function isDueToday(entry, now = new Date()) {
    const availableDay = getReviewAvailableDay(entry, now);
    return !!availableDay && availableDay.getTime() <= getLocalDayStamp(now);
  }

  function getQueueShuffleScore(cardLike, queueDay, shuffleSalt = "", now = new Date()) {
    const id = cardId(cardLike);
    const dayKey = formatLocalDayKey(queueDay || now);
    const saltPart = shuffleSalt ? `::${shuffleSalt}` : "";
    return hashStringToUnitInterval(`${id}::${dayKey}${saltPart}`);
  }

  function reviewCard(bucket, cardOrId, rating, now = new Date()) {
    if (!scheduler) throw new Error("FSRS scheduler not available.");
    const id = cardId(cardOrId);
    const current = getEntry(bucket, id, now);
    const currentCard = isStarted(current) ? current.card : createEmptyFsrsCard(now);
    const normalizedRating = SMART_RATINGS.includes(rating) ? rating : 3;
    const next = scheduler.next(currentCard, now, normalizedRating);
    const rounded = roundFsrsCardToDueDay(next.card, now, { forceSameDay: normalizedRating === 1 });
    const correct = normalizedRating !== 1;
    bucket[id] = {
      shown: current.shown + 1,
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
      started: true,
      card: normalizeFsrsCard(rounded, now)
    };
    return bucket[id];
  }

  function getDueQueue(cardIds, bucket, vocabById, now = new Date(), shuffleSalt = "", excludeIds = null) {
    const todayStamp = getLocalDayStamp(now);
    return (cardIds || [])
      .map((id) => ({
        id,
        card: vocabById[id],
        entry: getEntry(bucket, id, now)
      }))
      .filter((item) => item.card)
      .filter((item) => isStarted(item.entry))
      .filter((item) => !(excludeIds && excludeIds.has && excludeIds.has(item.id)))
      .map((item) => ({
        ...item,
        availableDay: getReviewAvailableDay(item.entry, now)
      }))
      .filter((item) => !!item.availableDay && item.availableDay.getTime() <= todayStamp)
      .sort((a, b) => {
        const aDay = a.availableDay.getTime();
        const bDay = b.availableDay.getTime();
        if (aDay !== bDay) return aDay - bDay;
        const aShuffle = getQueueShuffleScore(a.id, a.availableDay, shuffleSalt, now);
        const bShuffle = getQueueShuffleScore(b.id, b.availableDay, shuffleSalt, now);
        if (aShuffle !== bShuffle) return aShuffle - bShuffle;
        const aLast = a.entry.card.last_review ? normalizeDate(a.entry.card.last_review, now).getTime() : 0;
        const bLast = b.entry.card.last_review ? normalizeDate(b.entry.card.last_review, now).getTime() : 0;
        if (aLast !== bLast) return aLast - bLast;
        return (a.card.index || 0) - (b.card.index || 0);
      });
  }

  function getNewQueue(cardIds, bucket, vocabById, now = new Date(), shuffleSalt = "", excludeIds = null) {
    const queueDay = getStartOfLocalDay(now);
    return (cardIds || [])
      .map((id) => ({
        id,
        card: vocabById[id],
        entry: getEntry(bucket, id, now)
      }))
      .filter((item) => item.card)
      .filter((item) => !isStarted(item.entry))
      .filter((item) => !(excludeIds && excludeIds.has && excludeIds.has(item.id)))
      .sort((a, b) => {
        const aShuffle = getQueueShuffleScore(a.id, queueDay, shuffleSalt, now);
        const bShuffle = getQueueShuffleScore(b.id, queueDay, shuffleSalt, now);
        if (aShuffle !== bShuffle) return aShuffle - bShuffle;
        return (Number(a.card.index) || 0) - (Number(b.card.index) || 0);
      });
  }

  function getScheduleSummary(cardIds, bucket, now = new Date()) {
    const map = new Map();
    let dueTodayCount = 0;
    let nextDueDate = null;
    let startedCount = 0;
    let newCount = 0;
    (cardIds || []).forEach((id) => {
      const entry = getEntry(bucket, id, now);
      if (!isStarted(entry)) {
        newCount += 1;
        return;
      }
      startedCount += 1;
      const day = getReviewAvailableDay(entry, now);
      if (!day) return;
      const stamp = day.getTime();
      map.set(stamp, (map.get(stamp) || 0) + 1);
      if (stamp <= getLocalDayStamp(now)) {
        dueTodayCount += 1;
      } else if (!nextDueDate || stamp < nextDueDate.getTime()) {
        nextDueDate = day;
      }
    });
    const byDay = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([stamp, count]) => ({ date: new Date(Number(stamp)), count }));
    return {
      dueTodayCount,
      nextDueDate,
      byDay,
      startedCount,
      newCount
    };
  }

  function canReviewToday(cardIds, bucket, vocabById, now = new Date(), dueShuffleSalt = "", newShuffleSalt = "") {
    return getDueQueue(cardIds, bucket, vocabById || {}, now, dueShuffleSalt).length > 0
      || getNewQueue(cardIds, bucket, vocabById || {}, now, newShuffleSalt).length > 0;
  }

  function ratingLabel(rating) {
    return SMART_RATING_LABELS[rating] || "Good";
  }

  ns.smart = {
    scheduler,
    createSmartEntry,
    getEntry,
    reviewCard,
    getDueQueue,
    getScheduleSummary,
    getDueDay,
    getReviewAvailableDay,
    getLastReviewDay,
    wasReviewedOnLocalDay,
    isDueToday,
    isStarted,
    canReviewToday,
    getNewQueue,
    ratingLabel,
    roundFsrsCardToDueDay
  };
})(window.HSKFlashcards);
