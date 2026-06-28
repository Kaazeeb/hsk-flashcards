# Test Repository Planning

This directory was created to centralize the HSK Flashcards testing strategy. No automated tests are implemented at this stage; the goal is to document the scope, criteria, and approach for a future test suite.

## Objectives

- Ensure that the main study, practice, and review flows keep working after code changes.
- Validate the integrity of built-in vocabulary, sentence, hanzi, measure-word, and image-card data.
- Monitor performance regressions in rendering, initial loading, remote persistence, and spaced-review calculations.
- Document functional and technical metrics that should be tracked before and after releases.
- Create a clear foundation for prioritizing unit, integration, end-to-end, accessibility, and performance tests.

## What will we test?

### 1. Application bootstrap and loading

- Script loading order declared in `index.html`.
- Initialization of `window.HSKFlashcards.main.bootstrap()` through `app.js`.
- Presence of the expected namespaces under `window.HSKFlashcards`.
- Error handling when required modules are unavailable.

### 2. Catalog and data normalization

- Expected total of HSK cards loaded from the files in `js/data/`.
- Normalization of required fields, identifiers, pinyin, translations, and metadata.
- Generation of study cards from hanzi and measure-word data.
- Current image-card catalog state when no active entries exist.
- Detection of duplicate IDs, empty fields, and invalid references.

### 3. Study and practice flows

- Vocabulary Learn mode with seen-card progress.
- Translation practice in the available directions.
- Pinyin practice with strict numeric-pinyin validation.
- Sentence, hanzi, measure-word, and stroke-sequence flows.
- Image-card flow when an active catalog exists.
- Navigation between screens, session reset, and visual counter updates.

### 4. Smart review and FSRS

- Creation and update of review events.
- Application of `Again`, `Hard`, `Good`, and `Easy` ratings.
- Calculation of due cards, upcoming cards, and intervals.
- Respect for the current epoch after progress resets.
- Separation of progress between vocabulary, sentence/study, and image cards.

### 5. Persistence and synchronization

- Remote reads and writes through Supabase when the user is authenticated.
- Behavior when Supabase is unavailable.
- Application of append-only events and compact bitset visibility.
- Updates on page load/focus in multi-device scenarios.
- Assurance that different users' data remains isolated by RLS.

### 6. Interface, responsiveness, and accessibility

- Visual states for login, setup, study, review, statistics, and image-card screens.
- Desktop, tablet, and mobile layouts.
- Keyboard navigation and visible focus for primary actions.
- Alternative text, labels, contrast, and basic semantics.
- Error messages, empty states, and user feedback.

### 7. Performance and stability

- Initial loading time for the static application.
- Time to render lists and cards on modest devices.
- Cost of scope, statistics, and smart-review calculations.
- Size of scripts loaded directly by the browser.
- Memory usage during long study sessions.
- Absence of console errors during main flows.

## How will we test?

### Planned unit tests

Focus on pure functions and business rules:

- Normalizers, date utilities, ID generation, shuffling, and ranges.
- Numeric-pinyin validation.
- Synchronization codec and visibility bitset.
- Statistics, deck-scope, and review-summary calculations.
- Smart FSRS rules and review-event normalization.

Initial criterion: each business-rule module should have tests for happy paths, invalid inputs, and edge cases.

### Planned integration tests

Focus on interactions between modules:

- Store + remote persistence.
- Store + Smart FSRS.
- Built-in catalogs + normalization + deck selection.
- Main runtime + screen rendering.
- Authentication + user-data loading.

Initial criterion: each critical flow should validate state before and after the main action.

### Planned end-to-end tests

Focus on the real browser experience:

- Open the application and complete bootstrap without errors.
- Select cards in Setup and start studying.
- Answer translation, pinyin, and smart-review prompts.
- Reset progress and confirm epoch changes.
- Log in to a test environment and validate remote persistence.
- Check responsiveness at representative resolutions.

Initial criterion: smoke tests should cover the minimum user flows before each release.

### Planned manual tests

Used for areas that are not automated yet:

- Visual review of main screens.
- Copy, translation, and error-message verification.
- Exploratory testing of navigation and empty states.
- Validation on real browsers and devices.

Initial criterion: create a manual release checklist with execution evidence.

### Planned performance tests

Recommended metrics:

- Time to first usable render.
- Full bootstrap time.
- Average card-rendering time.
- Review-calculation time when opening the Smart screen.
- Total JavaScript size loaded by the browser.
- Number of console errors and warnings.

Suggested tools:

- Browser Performance API for internal marks.
- Lighthouse for local and comparative audits.
- Playwright or an equivalent tool to capture metrics in smoke tests.
- Structured development-mode logs for critical operations.

## Function monitoring

Functions and modules that deserve special attention:

- `bootstrap` and top-level rendering, because they are the application entry point.
- Store and migrations/normalizers, because they concentrate business state.
- Smart FSRS, because it directly affects the review experience.
- Synchronization codec and visibility bitset, because they are compact and regression-sensitive.
- Persistence adapters and authentication, because they depend on external services.
- Pinyin, translation, and study-card answer flows, because they are the most-used flows.

Monitoring strategy:

- Define consistent names for technical events, for example `app.bootstrap.start`, `review.rating.saved`, and `sync.visibility.loaded`.
- Record duration, success/failure, and minimal context without exposing sensitive user data.
- Separate local development metrics from metrics allowed in production.
- Review metrics before releases and compare them with the previous version.

## Performance monitoring

Minimum indicators:

| Metric | Initial goal | Action if it regresses |
| --- | --- | --- |
| Full bootstrap | Stay below 2 seconds on a modern desktop | Review loaded scripts, built-in data, and initial rendering |
| Card rendering | Keep interaction perceptibly instant | Profile the DOM, reduce re-renders, and review synchronous calculations |
| Review calculation | Stay below 100 ms for the current catalog | Cache summaries or optimize iterations |
| Console errors | Zero in main flows | Fix before release |
| JavaScript size | Monitor growth by version | Evaluate splitting, compression, or dead-code removal |

The limits above are initial targets and should be adjusted after the first real measurement in a controlled environment.

## Suggested future structure

```text
tests/
  TEST_PLAN.md
  unit/
  integration/
  e2e/
  fixtures/
  reports/
```

- `unit/`: tests for pure functions and business rules.
- `integration/`: tests across internal modules and adapters.
- `e2e/`: browser tests for real flows.
- `fixtures/`: controlled data for repeatable scenarios.
- `reports/`: output generated by testing and performance tools.

## Criteria for starting test implementation

- Choose a unit-test runner compatible with the current architecture and no mandatory build step.
- Define whether browser tests will use Playwright, Web Test Runner, or a similar alternative.
- Create minimal fixtures without duplicating the entire real catalog.
- Add documented scripts for local and CI execution.
- Establish the initial performance baseline before automating regression alerts.

## Strategy acceptance criteria

- The `tests/` directory exists and centralizes testing documentation.
- The strategy describes what will be tested, how it will be tested, and why.
- The strategy covers critical functions, persistence, interface, accessibility, and performance.
- No automated tests are added at this stage.
