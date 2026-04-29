# Patch 3 — FSRS fuzz kept on, app-level fuzz bug fixed

This patch keeps native ts-fsrs fuzz enabled:

```js
FSRS_API.fsrs({ enable_fuzz: true })
```

The fix removes the app's additional probabilistic day rounding from `js/smart-fsrs.js`.

The previous app layer did this after ts-fsrs had already scheduled the card:

- calculated the fractional number of days between `now` and FSRS `due`;
- rounded that fraction to the next local day with a hash-based probability.

That was not part of ts-fsrs. It incorrectly applied randomness to short learning steps, for example a 10-minute Good step could randomly become tomorrow for a small percentage of cards.

The replacement only buckets the FSRS due timestamp to the local calendar day used by the UI. It does not add a second randomization layer.

This patch also seeds native ts-fsrs fuzz with the Smart review event id before calling `scheduler.next()`.

Reason: ts-fsrs uses its `seed` value for fuzz. If no seed is provided, the bundled PRNG falls back to `Date.now()`. During fast append-only event replay, that can make otherwise identical cards split by whichever millisecond they were replayed in. Using the event id makes local scheduling and remote rebuild deterministic while preserving native FSRS fuzz.

Remote event replay now passes `event.event_id` into `smart.reviewCard(..., { trackEvent: false, eventId: event.event_id })`.

A feedback idempotency guard is also included so the same UI feedback screen cannot commit the same review more than once.
