"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sources = Object.fromEntries(["constants.js", "utils.js", "smart-fsrs.js"].map((name) => [
  name, fs.readFileSync(path.join(__dirname, "../../js", name), "utf8")
]));

function createHarness(fixedHash) {
  const context = vm.createContext({ window: { HSKFlashcards: {} } });
  for (const name of ["constants.js", "utils.js"]) {
    vm.runInContext(sources[name], context, { filename: name });
  }
  const ns = context.window.HSKFlashcards;
  const originalHash = ns.utils.hashStringToUnitInterval;
  let hashCalls = 0;
  ns.utils.hashStringToUnitInterval = (value) => {
    hashCalls += 1;
    return fixedHash === undefined ? originalHash(value) : fixedHash;
  };
  vm.runInContext(sources["smart-fsrs.js"], context, { filename: "smart-fsrs.js" });
  return { smart: ns.smart, utils: ns.utils, originalHash, get hashCalls() { return hashCalls; } };
}

// Keep the previous comparator as the ordering contract for this optimization.
function previousOrder(harness, ids, bucket, cards, now, sessionSeed) {
  const dayKey = harness.utils.formatLocalDayKey(now);
  const seed = sessionSeed || dayKey;
  const score = (id) => harness.originalHash(`${seed}::${id}::${dayKey}`);
  return ids.filter((id) => cards[id] && !harness.smart.isStarted(harness.smart.getEntry(bucket, id, now)))
    .sort((a, b) => score(a) - score(b) || (Number(cards[a].index) || 0) - (Number(cards[b].index) || 0));
}

test("new-card ordering matches the previous algorithm across session seeds and days", () => {
  const h = createHarness();
  const ids = Array.from({ length: 40 }, (_, index) => `new-${index}`);
  const cards = Object.fromEntries(ids.map((id, index) => [id, { id, index: index + 1 }]));
  for (const now of [new Date(2030, 0, 2, 12), new Date(2030, 0, 3, 12)]) {
    for (const sessionSeed of ["", "session-a", "session-b"]) {
      const actual = h.smart.getNewQueue(ids, {}, cards, now, { sessionSeed });
      assert.deepEqual(Array.from(actual, (item) => item.id), previousOrder(h, ids, {}, cards, now, sessionSeed));
    }
  }
});

test("new-card queues exclude started and missing cards and preserve the public item shape", () => {
  const h = createHarness();
  const now = new Date(2030, 0, 2, 12);
  const cards = { fresh: { id: "fresh", index: 1 }, due: { id: "due", index: 2 }, future: { id: "future", index: 3 } };
  const bucket = {
    fresh: { started: false, shown: 2, correct: 1, wrong: 1 },
    due: { started: true, card: { due: new Date(2030, 0, 1, 12), reps: 1 } },
    future: { started: true, card: { due: new Date(2030, 0, 9, 12), reps: 1 } }
  };
  const items = h.smart.getNewQueue(["fresh", "due", "future", "missing"], bucket, cards, now);
  assert.equal(items.length, 1);
  assert.deepEqual(Object.keys(items[0]).sort(), ["card", "entry", "id"]);
  assert.equal(items[0].id, "fresh");
  assert.equal(items[0].card, cards.fresh);
  assert.equal(items[0].entry.shown, 2);
  assert.equal(items[0].entry.correct, 1);
  assert.equal(items[0].entry.wrong, 1);
  assert.equal(h.smart.isStarted(items[0].entry), false);
});

test("equal shuffle scores retain numeric index ordering and stable ties", () => {
  const h = createHarness(0.5);
  const ids = ["first-two", "one", "second-two", "no-index", "string-two"];
  const cards = {
    "first-two": { index: 2 }, one: { index: 1 }, "second-two": { index: 2 },
    "no-index": {}, "string-two": { index: "2" }
  };
  const items = h.smart.getNewQueue(ids, {}, cards, new Date(2030, 0, 2, 12));
  assert.deepEqual(Array.from(items, (item) => item.id), ["no-index", "one", "first-two", "second-two", "string-two"]);
});

test("each eligible new card is hashed once per queue construction", () => {
  const h = createHarness();
  const ids = Array.from({ length: 256 }, (_, index) => `candidate-${index}`);
  const cards = Object.fromEntries(ids.map((id, index) => [id, { id, index: index + 1 }]));
  const now = new Date(2030, 0, 2, 12);
  const bucket = { [ids[0]]: { started: true, card: { due: now, reps: 1 } } };
  ids.push("missing");
  const items = h.smart.getNewQueue(ids, bucket, cards, now, { sessionSeed: "linear-work" });
  assert.equal(items.length, 255);
  assert.equal(h.hashCalls, items.length, "sorting must not repeat hashing in every comparison");
  h.smart.getNewQueue(ids, bucket, cards, now, { sessionSeed: "another-session" });
  assert.equal(h.hashCalls, items.length * 2, "scores must be recomputed for the current call");
});
