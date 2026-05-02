/**
 * Smart FSRS scheduling.
 *
 * Important invariants:
 * - Only cards explicitly available to the selected Practice/review scope are considered.
 * - A card enters FSRS only after its first Smart review; unstarted cards are new, not due.
 * - Due dates are bucketed by local day so reviews are daily, not hour-precise.
 * - Review history is stored as append-only events for safer multi-device sync.
 */
(function (ns) {
  const FSRS_API = typeof window !== "undefined" ? window.FSRS : null;
  const { normalizeDate, getStartOfLocalDay, getLocalNoon, addLocalDays, getLocalDayStamp, formatLocalDayKey, hashStringToUnitInterval, MS_PER_DAY, cardId } = ns.utils;
  const { SMART_RATINGS, SMART_RATING_LABELS } = ns.constants;
  function createScheduler() {
    if (!FSRS_API || typeof FSRS_API.fsrs !== "function") return null;
    const instance = FSRS_API.fsrs({ enable_fuzz: true });
    if (typeof instance.useStrategy === "function" && FSRS_API.StrategyMode?.SEED && typeof FSRS_API.GenSeedStrategyWithCardId === "function") {
      instance.useStrategy(FSRS_API.StrategyMode.SEED, FSRS_API.GenSeedStrategyWithCardId("fsrsCardId"));
    }
    return instance;
  }

  const scheduler = createScheduler();

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

  // FSRS already has native fuzz for long intervals. This app only groups the
  // resulting raw due timestamp into its actual local calendar day for UI/queue
  // behavior. Do not add a second probabilistic rounding layer here: that turns
  // short learning steps such as 10 minutes into occasional "tomorrow" cards.
  function bucketFsrsCardToDueDay(card, now = new Date()) {
    const normalized = normalizeFsrsCard(card, now);
    const dueDay = getStartOfLocalDay(normalized.due);
    const bucketedDue = getLocalNoon(dueDay);
    const scheduledDays = Math.max(0, Math.round((dueDay.getTime() - getStartOfLocalDay(now).getTime()) / MS_PER_DAY));
    return {
      ...normalized,
      due: bucketedDue,
      scheduled_days: scheduledDays
    };
  }


  function applySpacingFactor(card, now = new Date(), spacingFactor = 1) {
    const bucketed = bucketFsrsCardToDueDay(card, now);
    const factor = Number(spacingFactor);
    if (!Number.isFinite(factor) || factor <= 0 || factor >= 1 || bucketed.scheduled_days <= 1) {
      return bucketed;
    }
    const reducedDays = Math.max(1, Math.floor(bucketed.scheduled_days * factor));
    return {
      ...bucketed,
      due: getLocalNoon(addLocalDays(now, reducedDays)),
      scheduled_days: reducedDays
    };
  }

  function createSmartEntry(now = new Date()) {
    return {
      shown: 0,
      correct: 0,
      wrong: 0,
      started: false,
      lastRating: null,
      lastReviewedAt: null,
      card: null
    };
  }

  // Local Smart entries may hold unsynced review events. Normalization keeps
  // them replayable and idempotent when sent to Supabase.
  function normalizeReviewEvents(events) {
    return (Array.isArray(events) ? events : [])
      .map((event) => ({
        id: String(event?.id || "").trim(),
        rating: SMART_RATINGS.includes(Number(event?.rating)) ? Number(event.rating) : 3,
        occurredAt: normalizeDate(event?.occurredAt || event?.occurred_at || Date.now()).toISOString()
      }))
      .filter((event) => event.id && event.occurredAt);
  }

  function createReviewEventId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `smart::${crypto.randomUUID()}`;
    }
    return `smart::${Date.now().toString(36)}::${Math.random().toString(36).slice(2, 10)}`;
  }

  function normalizeEntry(entry, now = new Date()) {
    if (!entry || typeof entry !== "object") return createSmartEntry(now);
    const started = entry.started === undefined ? !!(entry.card || entry.fsrsCard) : !!entry.started;
    const lastRating = [1, 2, 3, 4].includes(Number(entry.lastRating)) ? Number(entry.lastRating) : null;
    const lastReviewedAt = entry.lastReviewedAt || entry.card?.last_review || entry.fsrsCard?.last_review || null;
    return {
      shown: Math.max(0, Math.floor(Number(entry.shown) || 0)),
      correct: Math.max(0, Math.floor(Number(entry.correct) || 0)),
      wrong: Math.max(0, Math.floor(Number(entry.wrong) || 0)),
      started,
      lastRating,
      lastReviewedAt: lastReviewedAt ? normalizeDate(lastReviewedAt, now).toISOString() : null,
      card: started ? normalizeFsrsCard(entry.card || entry.fsrsCard, now) : null,
      reviewEvents: normalizeReviewEvents(entry.reviewEvents)
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

  function isDueToday(entry, now = new Date()) {
    const dueDay = getDueDay(entry, now);
    return !!dueDay && dueDay.getTime() <= getLocalDayStamp(now);
  }

  function getDailyShuffleScore(cardLike, dueDay, now = new Date(), sessionSeed = "") {
    const id = cardId(cardLike);
    const dayKey = formatLocalDayKey(dueDay || now);
    const seed = sessionSeed || dayKey;
    return hashStringToUnitInterval(`${seed}::${id}::${dayKey}`);
  }

  // Applies one FSRS rating and appends a local review event unless replaying
  // remote history. This function is used both for real reviews and for rebuilding
  // state from append-only events; keep side effects controlled by options.trackEvent.
  function reviewCard(bucket, cardOrId, rating, now = new Date(), options = {}) {
    if (!scheduler) throw new Error("FSRS scheduler not available.");
    const id = cardId(cardOrId);
    const normalizedNow = normalizeDate(now);
    const current = getEntry(bucket, id, normalizedNow);
    const currentCard = isStarted(current) ? current.card : createEmptyFsrsCard(normalizedNow);
    const normalizedRating = SMART_RATINGS.includes(rating) ? rating : 3;
    const next = scheduler.next({ ...currentCard, fsrsCardId: id }, normalizedNow, normalizedRating);
    const rounded = applySpacingFactor(next.card, normalizedNow, options.spacingFactor || 1);
    const correct = normalizedRating !== 1;
    const occurredAt = normalizedNow.toISOString();
    const reviewEvents = [...(current.reviewEvents || [])];
    if (options.trackEvent !== false) {
      reviewEvents.push({
        id: options.eventId || createReviewEventId(),
        rating: normalizedRating,
        occurredAt
      });
    }
    bucket[id] = {
      shown: current.shown + 1,
      correct: current.correct + (correct ? 1 : 0),
      wrong: current.wrong + (correct ? 0 : 1),
      started: true,
      lastRating: normalizedRating,
      lastReviewedAt: occurredAt,
      card: normalizeFsrsCard(rounded, normalizedNow),
      reviewEvents
    };
    return bucket[id];
  }

  // Returns only already-started cards whose due day is today or earlier.
  // Cards due on the same day are shuffled with the current session seed, so the
  // order is randomized per session but stable while the page remains open.
  function getDueQueue(cardIds, bucket, vocabById, now = new Date(), options = {}) {
    const todayStamp = getLocalDayStamp(now);
    const sessionSeed = options.sessionSeed || "";
    const candidates = (cardIds || [])
      .map((id) => ({
        id,
        card: vocabById[id],
        entry: getEntry(bucket, id, now)
      }))
      .filter((item) => item.card)
      .filter((item) => isStarted(item.entry))
      .filter((item) => {
        const dueDay = getDueDay(item.entry, now);
        return !!dueDay && dueDay.getTime() <= todayStamp;
      })
      .sort((a, b) => {
        const aDay = getDueDay(a.entry, now).getTime();
        const bDay = getDueDay(b.entry, now).getTime();
        if (aDay !== bDay) return aDay - bDay;
        const aShuffle = getDailyShuffleScore(a.id, getDueDay(a.entry, now), now, sessionSeed);
        const bShuffle = getDailyShuffleScore(b.id, getDueDay(b.entry, now), now, sessionSeed);
        if (aShuffle !== bShuffle) return aShuffle - bShuffle;
        return (a.card.index || 0) - (b.card.index || 0);
      });
    return candidates;
  }

  // New queue is deliberately separate from due reviews: choosing to introduce
  // cards is a user action, not an automatic fallback when no reviews are due.
  function getNewQueue(cardIds, bucket, vocabById, now = new Date(), options = {}) {
    const sessionSeed = options.sessionSeed || "";
    return (cardIds || [])
      .map((id) => ({
        id,
        card: vocabById[id],
        entry: getEntry(bucket, id, now)
      }))
      .filter((item) => item.card)
      .filter((item) => !isStarted(item.entry))
      .sort((a, b) => {
        const aShuffle = getDailyShuffleScore(a.id, now, now, sessionSeed);
        const bShuffle = getDailyShuffleScore(b.id, now, now, sessionSeed);
        if (aShuffle !== bShuffle) return aShuffle - bShuffle;
        const aIndex = Number(a.card.index) || 0;
        const bIndex = Number(b.card.index) || 0;
        return aIndex - bIndex;
      });
  }

  // Builds the review-plan numbers shown in the UI: due today, next due date,
  // future dates, started cards, and new/unstarted cards.
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
      const day = getDueDay(entry, now);
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

  function canReviewToday(cardIds, bucket, now = new Date()) {
    return getDueQueue(cardIds, bucket, {}, now).length > 0;
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
    isDueToday,
    isStarted,
    canReviewToday,
    getNewQueue,
    ratingLabel,
    bucketFsrsCardToDueDay,
    applySpacingFactor,
    normalizeReviewEvents
  };
})(window.HSKFlashcards);
