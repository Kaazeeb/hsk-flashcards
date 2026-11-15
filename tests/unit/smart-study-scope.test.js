"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const scriptSources = Object.fromEntries(
  ["constants.js", "utils.js", "smart-fsrs.js", "main-model.js"].map((name) => [
    name, fs.readFileSync(path.join(__dirname, "../../js", name), "utf8")
  ])
);

function makeCard(id, deckId, index = 1) {
  return { id, deckId, index, deckName: deckId, cardKind: "study", direction: "hanzi_to_pinyin" };
}

function createHarness({ count = 12, cards } = {}) {
  let catalog = cards || Array.from({ length: count }, (_, index) => makeCard(`card-${index}`, `deck-${index % 2}`, index + 1));
  let sentenceReads = 0;
  const context = vm.createContext({ window: { HSKFlashcards: {} } });
  for (const name of ["constants.js", "utils.js", "smart-fsrs.js"]) {
    vm.runInContext(scriptSources[name], context, { filename: name });
  }
  const ns = context.window.HSKFlashcards;
  const { ALL_SET_ID, SENTENCE_ALL_DECK_ID } = ns.constants;
  const db = {
    get sentenceCards() { sentenceReads += 1; return catalog; },
    set sentenceCards(value) { catalog = value; },
    vocab: [{ id: "vocab-1" }],
    sets: { order: [ALL_SET_ID], byId: { [ALL_SET_ID]: { id: ALL_SET_ID, locked: true, cardIds: ["vocab-1"] } } },
    ui: { activeSetId: ALL_SET_ID, reviewSetId: SENTENCE_ALL_DECK_ID, mode: "practice", quizType: { practice: "smart" } },
    builtinVisibility: {}, smartBySet: {}, sentenceSmartByDeck: {}
  };
  const state = {
    round: { smartForceNew: false }, smartSessionSeed: "test-session", smartDeferredQueueKeys: [],
    store: {
      ensureSmartSet: (id) => db.smartBySet[id] || {},
      ensureSentenceSmartDeck: (id) => db.sentenceSmartByDeck[id] || {}
    }
  };
  ns.store = { getBuiltinCardVisibility: (visibility, deckId, cardId) => visibility[deckId]?.[cardId] || {} };
  const runtime = ns.mainRuntime = {
    ...ns.constants, ...ns.utils, smart: ns.smart, state,
    getDb: () => db, getUi: () => db.ui
  };
  vm.runInContext(scriptSources["main-model.js"], context, { filename: "main-model.js" });
  return {
    db, state, runtime,
    get sentenceReads() { return sentenceReads; },
    resetReads() { sentenceReads = 0; },
    source(id = SENTENCE_ALL_DECK_ID) {
      return {
        id, kind: "sentence",
        cardIds: catalog.filter((card) => id === SENTENCE_ALL_DECK_ID || card.deckId === id).map((card) => card.id)
      };
    }
  };
}

function idsFor(harness, source, mode) {
  return Array.from(harness.runtime.getSmartIdsForSource(source, mode));
}

test("all-study-card visibility reads the catalog a constant number of times", () => {
  for (const mode of ["learn", "practice"]) {
    const small = createHarness({ count: 1 });
    const large = createHarness({ count: 250 });
    assert.equal(idsFor(small, small.source(), mode).length, 1);
    assert.equal(idsFor(large, large.source(), mode).length, 250);
    assert.equal(large.sentenceReads, small.sentenceReads,
      `${mode} catalog reads must not grow with the number of source cards`);
    assert.ok(large.sentenceReads <= 2, "one scope lookup must not repeatedly rebuild the catalog map");
  }
});

test("aggregate and individual scopes preserve each deck's Learn and Practice flags", () => {
  const h = createHarness({ cards: [makeCard("a", "deck-a"), makeCard("b", "deck-a"), makeCard("c", "deck-b"), makeCard("d", "deck-b")] });
  h.db.builtinVisibility = {
    "deck-a": { a: { learn: true, practice: false }, b: { learn: false, practice: true } },
    "deck-b": { c: { learn: false, practice: false } }
  };
  const all = h.source();
  all.cardIds.push("missing", "constructor", "toString", "__proto__");
  assert.deepEqual(idsFor(h, all, "learn"), ["a", "d"]);
  assert.deepEqual(idsFor(h, all, "practice"), ["b", "d"]);
  assert.deepEqual(idsFor(h, all), ["b", "d"]);
  const deckA = h.source("deck-a");
  deckA.cardIds.push("missing", "constructor", "toString", "__proto__");
  assert.deepEqual(idsFor(h, deckA, "learn"), ["a"]);
  assert.deepEqual(idsFor(h, deckA, "practice"), ["b"]);
  assert.deepEqual(idsFor(h, h.source("deck-b"), "learn"), ["d"]);
  assert.deepEqual(idsFor(h, h.source("deck-b"), "practice"), ["d"]);
});

test("each lookup observes current visibility and a replaced sentence catalog", () => {
  const h = createHarness({ cards: [makeCard("moving-card", "deck-a")] });
  const all = h.source();
  h.db.builtinVisibility = { "deck-a": { "moving-card": { practice: false } } };
  assert.deepEqual(idsFor(h, all), []);

  h.db.sentenceCards = [makeCard("moving-card", "deck-b")];
  assert.deepEqual(idsFor(h, all), ["moving-card"]);
  h.db.builtinVisibility["deck-b"] = { "moving-card": { practice: false } };
  assert.deepEqual(idsFor(h, all), []);
  h.db.builtinVisibility = {};
  assert.deepEqual(idsFor(h, all), ["moving-card"]);
  h.db.sentenceCards = [];
  assert.deepEqual(idsFor(h, all), []);
});

test("all-study-card Smart new and due flows keep their originating deck histories", () => {
  const h = createHarness({ cards: [
    makeCard("a-new", "deck-a", 1), makeCard("a-due", "deck-a", 2),
    makeCard("b-new", "deck-b", 3), makeCard("b-due", "deck-b", 4),
    makeCard("b-future", "deck-b", 5), makeCard("b-hidden", "deck-b", 6)
  ] });
  const now = new Date(2030, 0, 15, 12);
  const started = (day) => ({ started: true, card: { due: new Date(2030, 0, day, 12), reps: 1 } });
  h.db.sentenceSmartByDeck = {
    "deck-a": { "a-due": started(14) },
    "deck-b": { "b-due": started(15), "b-future": started(20), "b-hidden": started(14), "a-new": started(20) }
  };
  h.db.builtinVisibility = { "deck-b": { "b-hidden": { practice: false, learn: true } } };
  const due = h.runtime.getSmartItems(now);
  assert.deepEqual(Array.from(due, (item) => item.id).sort(), ["a-due", "b-due"]);
  h.state.round.smartForceNew = true;
  const fresh = h.runtime.getSmartItems(now);
  assert.deepEqual(Array.from(fresh, (item) => item.id).sort(), ["a-new", "b-new"]);
  for (const item of [...due, ...fresh]) {
    assert.equal(item.sourceKind, "sentence");
    assert.equal(item.setId, item.card.deckId);
  }
  assert.ok(due.every((item) => h.runtime.smart.isStarted(item.entry)));
  assert.ok(fresh.every((item) => !h.runtime.smart.isStarted(item.entry)));
});

test("vocabulary scope filtering retains its visibility and ignores absent cards", () => {
  const h = createHarness();
  const source = { id: h.runtime.ALL_SET_ID, kind: "vocab", cardIds: ["vocab-1", "missing"] };
  assert.deepEqual(idsFor(h, source), ["vocab-1"]);
  h.db.builtinVisibility[h.runtime.ALL_SET_ID] = { "vocab-1": { learn: true, practice: false } };
  assert.deepEqual(idsFor(h, source, "practice"), []);
  assert.deepEqual(idsFor(h, source, "learn"), ["vocab-1"]);
  assert.equal(h.sentenceReads, 0);
});
