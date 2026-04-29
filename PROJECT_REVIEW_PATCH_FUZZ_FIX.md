# Fuzz-preserving scheduler fix

This patch keeps the native ts-fsrs scheduler fuzz enabled:

```js
FSRS_API.fsrs({ enable_fuzz: true })
```

The previous first patched build accidentally added a second application-level probabilistic day rounding layer in `js/smart-fsrs.js`. That wrapper could round a short 10-minute learning step to the next calendar day for a small percentage of cards.

The fix removes the extra app-level day fuzz. It now trusts `card.scheduled_days` returned by ts-fsrs and only buckets positive day intervals to local noon. Native FSRS fuzz remains active for intervals where the library applies it.

A small idempotency guard was also added to `acceptSmartFsrsFeedback()` so the same feedback screen cannot commit the same card twice during a UI transition.
