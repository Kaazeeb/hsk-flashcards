"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const sources = ["main-model.js", "main-actions.js"].map((name) => ({
  name, source: fs.readFileSync(path.join(__dirname, "../../js", name), "utf8")
}));
const widgetNames = ["renderStats", "renderSetPanel", "renderSelectionSummary", "renderSetupPanel", "renderManageListIfNeeded"];
const sentenceSource = { id: "all_sentence_cards", kind: "sentence" };

function card(id, deckId = "deck-a") { return { id, deckId, deckName: deckId, cardKind: "study" }; }

function createHarness() {
  const reads = { sentence: 0, vocab: 0, visibility: 0 };
  function createDb({ cards = [card("a"), card("b", "deck-b")], vocab = [{ id: "v1" }], visibility = {} } = {}) {
    let sentenceCards = cards;
    let vocabulary = vocab;
    return {
      get sentenceCards() { reads.sentence += 1; return sentenceCards; },
      set sentenceCards(value) { sentenceCards = value; },
      get vocab() { reads.vocab += 1; return vocabulary; },
      set vocab(value) { vocabulary = value; },
      builtinVisibility: visibility,
      ui: { activeSetId: "all_cards", reviewSetId: "all_sentence_cards", mode: "practice", quizType: { practice: "smart" } },
      sets: { order: ["all_cards"], byId: { all_cards: { id: "all_cards", locked: true, cardIds: vocab.map((item) => item.id) } } }
    };
  }
  let db = createDb();
  const state = { currentPage: "setup", round: {} };
  const runtime = {
    ALL_SET_ID: "all_cards", SENTENCE_ALL_DECK_ID: "all_sentence_cards", REVIEW_ALL_SETS_ID: "all_saved_sets",
    MODES: ["learn", "practice"], PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
    state, smart: {}, cardId: (value) => typeof value === "string" ? value : value.id,
    getDb: () => db, getUi: () => db.ui,
    renderPageShell() {}, updateStorageModeBadge() {}, renderAuthPanel() {}
  };
  widgetNames.forEach((name) => { runtime[name] = () => {}; });
  const context = vm.createContext({
    window: { HSKFlashcards: {
      mainRuntime: runtime,
      store: { getBuiltinCardVisibility: (visibility, deckId, id) => {
        reads.visibility += 1;
        return { learn: true, practice: true, ...visibility[deckId]?.[id] };
      } }
    } }
  });
  sources.forEach(({ name, source }) => vm.runInContext(source, context, { filename: name }));
  return { runtime, state, reads, createDb, get db() { return db; }, set db(value) { db = value; } };
}

function lookup(runtime) {
  return {
    decks: runtime.getSentenceDecks({ mode: "practice" }),
    sentences: runtime.getSmartCardMapForSource(sentenceSource),
    vocab: runtime.getAllCardMap(),
    flags: runtime.getBuiltInCardVisibility("deck-a", "a")
  };
}

function deckIds(decks) { return Array.from(decks).flatMap((deck) => Array.from(deck.cardIds)); }

test("the real render shares catalog and visibility lookups across its widgets", () => {
  const h = createHarness();
  const results = [];
  widgetNames.forEach((name) => {
    h.runtime[name] = () => { for (let i = 0; i < 5; i += 1) results.push(lookup(h.runtime)); };
  });
  h.runtime.render();
  assert.equal(results.length, widgetNames.length * 5);
  assert.deepEqual(h.reads, { sentence: 2, vocab: 1, visibility: 2 });
  for (const result of results) {
    for (const key of Object.keys(result)) assert.equal(result[key], results[0][key]);
  }
});

test("the next render sees flag mutations, replacement catalogs, and a replacement database", () => {
  const h = createHarness();
  const source = { ...sentenceSource, cardIds: ["a", "b", "new", "replacement"] };
  const snapshots = [];
  h.runtime.renderStats = () => snapshots.push({
    ids: Array.from(h.runtime.getSmartIdsForSource(source, "practice")),
    ...lookup(h.runtime)
  });
  h.db.builtinVisibility = { "deck-a": { a: { practice: false } } };
  h.runtime.render();
  assert.deepEqual(snapshots[0].ids, ["b"]);

  h.db.builtinVisibility["deck-a"].a.practice = true;
  h.db.sentenceCards = [card("a"), card("new", "deck-c")];
  h.db.vocab = [{ id: "v2" }];
  h.runtime.render();
  assert.deepEqual(snapshots[1].ids, ["a", "new"]);
  assert.deepEqual(Object.keys(snapshots[1].sentences), ["a", "new"]);
  assert.deepEqual(Object.keys(snapshots[1].vocab), ["v2"]);
  assert.equal(snapshots[1].flags.practice, true);

  h.db = h.createDb({ cards: [card("replacement", "deck-d")], vocab: [{ id: "v3" }] });
  h.runtime.render();
  assert.deepEqual(snapshots[2].ids, ["replacement"]);
  assert.deepEqual(Object.keys(snapshots[2].sentences), ["replacement"]);
  assert.deepEqual(Object.keys(snapshots[2].vocab), ["v3"]);
  assert.notEqual(snapshots[0].decks, snapshots[1].decks);
  assert.notEqual(snapshots[1].sentences, snapshots[2].sentences);
});

test("a thrown widget clears the render cache before later reads or renders", () => {
  const h = createHarness();
  const failure = new Error("widget failed");
  h.runtime.renderStats = () => { lookup(h.runtime); throw failure; };
  assert.throws(() => h.runtime.render(), (error) => error === failure);
  h.db.sentenceCards = [card("new")];
  h.db.vocab = [{ id: "v2" }];
  h.db.builtinVisibility = { "deck-a": { a: { practice: false }, new: { practice: false } } };
  const after = lookup(h.runtime);
  assert.deepEqual(deckIds(after.decks), []);
  assert.deepEqual(Object.keys(after.sentences), ["new"]);
  assert.deepEqual(Object.keys(after.vocab), ["v2"]);
  assert.equal(after.flags.practice, false);
  let rendered;
  h.runtime.renderStats = () => { rendered = lookup(h.runtime); };
  h.runtime.render();
  assert.deepEqual(Object.keys(rendered.sentences), ["new"]);
  assert.notEqual(rendered.sentences, after.sentences);
});

test("deck IDs, card IDs, and visibility modes have separate cache entries", () => {
  const h = createHarness();
  h.db.sentenceCards = [card("a"), card("b"), card("c", "deck-b"), card("d", "deck-b")];
  h.db.builtinVisibility = {
    "deck-a": { a: { practice: false }, b: { learn: false }, shared: { learn: false, practice: true } },
    "deck-b": { c: { learn: false, practice: false }, shared: { learn: true, practice: false } },
    "a::b": { c: { practice: false } }, a: { "b::c": { practice: true } }
  };
  h.runtime.withRenderModelCache(() => {
    for (let pass = 0; pass < 2; pass += 1) {
      assert.deepEqual(deckIds(h.runtime.getSentenceDecks()), ["a", "b", "c", "d"]);
      assert.deepEqual(deckIds(h.runtime.getSentenceDecks({ mode: "learn" })), ["a", "d"]);
      assert.deepEqual(deckIds(h.runtime.getSentenceDecks({ mode: "practice" })), ["b", "d"]);
      assert.deepEqual(deckIds(h.runtime.getSentenceDecks({ mode: "any" })), ["a", "b", "d"]);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("deck-a", "shared", "learn"), false);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("deck-a", "shared", "practice"), true);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("deck-b", "shared", "learn"), true);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("deck-b", "shared", "practice"), false);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("a::b", "c", "practice"), false);
      assert.equal(h.runtime.isBuiltInCardModeEnabled("a", "b::c", "practice"), true);
    }
  });
  assert.equal(h.reads.sentence, 4);
  assert.equal(h.reads.visibility, 8);
});

test("nested cache scopes restore the outer cache and leave no cache outside rendering", () => {
  const h = createHarness();
  let outer;
  let inner;
  const failure = new Error("nested render failed");
  const result = h.runtime.withRenderModelCache(() => {
    outer = lookup(h.runtime);
    assert.throws(() => h.runtime.withRenderModelCache(() => {
      inner = lookup(h.runtime);
      assert.equal(lookup(h.runtime).sentences, inner.sentences);
      throw failure;
    }), (error) => error === failure);
    assert.equal(lookup(h.runtime).sentences, outer.sentences);
    assert.equal(lookup(h.runtime).flags, outer.flags);
    return "render result";
  });
  assert.equal(result, "render result");
  assert.notEqual(outer.sentences, inner.sentences);
  const outside = lookup(h.runtime);
  const outsideAgain = lookup(h.runtime);
  for (const key of Object.keys(outside)) {
    assert.notEqual(outside[key], outer[key]);
    assert.notEqual(outsideAgain[key], outside[key]);
  }
});
