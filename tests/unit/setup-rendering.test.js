"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const scripts = ["main-model.js", "main-setup-view.js"].map((name) => ({
  name,
  source: fs.readFileSync(path.join(__dirname, "../../js", name), "utf8")
}));

// Only the DOM operations used by the Setup list are needed here.
function element(tagName) {
  return {
    tagName, children: [], dataset: {}, attributes: {}, textContent: "",
    append(...nodes) { nodes.forEach((node) => this.appendChild(node)); },
    appendChild(node) {
      if (node.tagName === "fragment") this.children.push(...node.children);
      else this.children.push(node);
      return node;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; }
  };
}

function createHarness({ count = 3, deckId = "all_cards", reviewSetId = "sentence_all", mode = "practice" } = {}) {
  let sentenceReads = 0;
  let nextFrameId = 0;
  const frames = new Map();
  const vocab = Array.from({ length: count }, (_, index) => ({
    id: `v${index}`, index: index + 1, hanzi: `Word ${index}`,
    pinyin: `pronunciation ${index}`, translation: `meaning ${index}`
  }));
  const sentenceCards = [0, 1].map((index) => ({
    id: `s${index}`, index: index + 1, cardKind: "sentence", direction: "zh_to_en",
    deckId: "sentence_test", deckName: "Sentence fixture", front: `Prompt ${index}`, back: `Answer ${index}`
  }));
  const allSet = { id: "all_cards", name: "All cards", locked: true, cardIds: vocab.map((card) => card.id) };
  let db = {
    vocab,
    get sentenceCards() { sentenceReads += 1; return sentenceCards; },
    sets: { order: ["all_cards"], byId: { all_cards: allSet } },
    ui: { activeSetId: "all_cards", reviewSetId, mode, quizType: { practice: "smart" }, setupCollapsed: false },
    progress: { practice: { translation: {}, pinyin: {} } },
    builtinVisibility: {}, smartBySet: { all_cards: {} }, sentenceSmartByDeck: { sentence_test: {} }
  };
  const list = element("div");
  const state = {
    currentPage: "setup", filterText: "", manageListDirty: true, round: {},
    elements: { manageList: list, setupDeckSelect: { value: deckId } },
    store: {
      ensureSmartSet: (id) => db.smartBySet[id] || {},
      ensureSentenceSmartDeck: (id) => db.sentenceSmartByDeck[id] || {}
    }
  };
  const runtime = {
    MODES: ["learn", "practice"], PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
    ALL_SET_ID: "all_cards", REVIEW_ALL_SETS_ID: "review_all", SENTENCE_ALL_DECK_ID: "sentence_all",
    cardId: (card) => card.id, state, getDb: () => db, getUi: () => db.ui,
    clearNode: (node) => { node.children.length = 0; node.textContent = ""; },
    formatReviewDateLabel: (date) => date,
    smart: {
      createSmartEntry: () => ({ shown: 0, correct: 0, wrong: 0, started: false }),
      isStarted: (entry) => !!entry.started,
      getDueDay: (entry) => entry.due
    }
  };
  const context = {
    document: { createElement: element, createDocumentFragment: () => element("fragment") },
    window: {
      HSKFlashcards: {
        mainRuntime: runtime,
        store: { getBuiltinCardVisibility: (visibility, id, cardId) => visibility[id]?.[cardId] || {} }
      },
      performance: { now: () => 0 },
      requestAnimationFrame: (callback) => { frames.set(++nextFrameId, callback); return nextFrameId; },
      cancelAnimationFrame: (id) => frames.delete(id)
    }
  };
  vm.createContext(context);
  scripts.forEach(({ name, source }) => vm.runInContext(source, context, { filename: name }));

  return {
    runtime, state, list,
    get db() { return db; },
    set db(value) { db = value; },
    get sentenceReads() { return sentenceReads; },
    flushFrame() {
      if (!frames.size) return false;
      const [id, callback] = frames.entries().next().value;
      frames.delete(id);
      callback();
      return true;
    },
    render() {
      runtime.renderManageList();
      let batches = 0;
      while (this.flushFrame()) {
        assert.ok(++batches < 1000, "Setup rendering must finish");
      }
      assert.equal(list.attributes["aria-busy"], undefined);
      return list.children;
    }
  };
}

function rowStats(row) { return row.children[0].children[2].textContent; }
function rowFlags(row) { return row.children[1].children.map((label) => label.children[0]); }

test("Setup vocabulary rows preserve counters, Smart status, and visibility controls", () => {
  const h = createHarness();
  h.db.progress.practice.translation.v0 = { shown: 8, correct: 5, wrong: 3 };
  h.db.progress.practice.pinyin.v0 = { shown: 4, correct: 3, wrong: 1 };
  h.db.smartBySet.all_cards.v0 = { started: true, due: "2030-01-02" };
  h.db.smartBySet.all_cards.v2 = { started: true, due: "2030-01-03" };
  h.db.builtinVisibility.all_cards = { v0: { learn: false, practice: true }, v2: { practice: false } };

  const rows = h.render();
  assert.equal(rows.length, 3);
  assert.equal(rows[0].children[0].children[0].textContent, "#1 · Word 0");
  assert.equal(rows[0].children[0].children[1].textContent, "pronunciation 0 · meaning 0");
  assert.equal(rowStats(rows[0]), "translation 5/3 · seen 8 · pinyin 3/1 · seen 4 · smart due 2030-01-02");
  assert.equal(rowStats(rows[1]), "translation 0/0 · seen 0 · pinyin 0/0 · seen 0 · smart new");
  assert.equal(rowStats(rows[2]), "translation 0/0 · seen 0 · pinyin 0/0 · seen 0 · smart inactive");
  const flags = rowFlags(rows[0]);
  assert.deepEqual(flags.map((input) => input.checked), [false, true]);
  assert.deepEqual(flags.map((input) => input.dataset), [
    { cardId: "v0", cardMode: "learn", deckId: "all_cards" },
    { cardId: "v0", cardMode: "practice", deckId: "all_cards" }
  ]);
  assert.equal(rowFlags(rows[2])[1].checked, false);
});

test("vocabulary rendering does not rebuild sentence scopes for every row", () => {
  for (const mode of ["learn", "practice"]) {
    for (const reviewSetId of ["all_cards", "sentence_test", "sentence_all"]) {
      const small = createHarness({ count: 1, mode, reviewSetId });
      const large = createHarness({ count: 120, mode, reviewSetId });
      assert.equal(small.render().length, 1);
      assert.equal(large.render().length, 120);
      assert.equal(large.sentenceReads, small.sentenceReads,
        `sentence catalog scans must stay constant for ${mode}/${reviewSetId}`);
    }
  }
});

test("a new render reads current progress after a reset or database replacement", () => {
  const h = createHarness({ count: 1 });
  h.db.progress.practice.translation.v0 = { shown: 2, correct: 1, wrong: 1 };
  assert.match(rowStats(h.render()[0]), /translation 1\/1 · seen 2/);

  h.db.progress.practice = { translation: {}, pinyin: {} };
  assert.match(rowStats(h.render()[0]), /translation 0\/0 · seen 0/);

  h.db = {
    ...h.db,
    progress: { practice: { translation: { v0: { shown: 7, correct: 6, wrong: 1 } }, pinyin: {} } },
    smartBySet: { all_cards: { v0: { started: true, due: "2030-02-03" } } }
  };
  assert.equal(rowStats(h.render()[0]), "translation 6/1 · seen 7 · pinyin 0/0 · seen 0 · smart due 2030-02-03");
});

test("sentence Setup rows keep their deck Smart history and checkbox identifiers", () => {
  const h = createHarness({ deckId: "sentence_test" });
  h.db.sentenceSmartByDeck.sentence_test.s0 = { started: true, due: "2030-03-04" };
  h.db.builtinVisibility.sentence_test = { s0: { learn: false, practice: true } };
  const rows = h.render();
  assert.equal(rows.length, 2);
  assert.equal(rows[0].children[0].children[0].textContent, "#1 · Prompt 0");
  assert.equal(rows[0].children[0].children[1].textContent, "Answer 0");
  assert.equal(rowStats(rows[0]), "smart due 2030-03-04");
  assert.equal(rowStats(rows[1]), "smart new");
  assert.deepEqual(rowFlags(rows[0]).map((input) => input.checked), [false, true]);
  assert.deepEqual(rowFlags(rows[0])[0].dataset, { cardId: "s0", cardMode: "learn", deckId: "sentence_test" });
});

test("restarting a partial render discards old rows and reads replacement progress", () => {
  const h = createHarness({ count: 120 });
  h.db.progress.practice.translation.v0 = { shown: 2, correct: 2, wrong: 0 };
  h.runtime.renderManageList();
  assert.equal(h.flushFrame(), true);
  assert.ok(h.list.children.length > 0 && h.list.children.length < 120);
  const oldRow = h.list.children[0];
  assert.match(rowStats(oldRow), /translation 2\/0 · seen 2/);

  h.db.progress.practice = { translation: {}, pinyin: { v50: { shown: 9, correct: 7, wrong: 2 } } };
  h.state.manageListDirty = true;
  h.runtime.renderManageListIfNeeded();
  let batches = 0;
  while (h.flushFrame()) assert.ok(++batches < 1000, "replacement render must finish");

  assert.equal(h.list.children.length, 120);
  assert.notEqual(h.list.children[0], oldRow);
  assert.match(rowStats(h.list.children[0]), /translation 0\/0 · seen 0/);
  assert.match(rowStats(h.list.children[50]), /pinyin 7\/2 · seen 9/);
  assert.equal(h.list.attributes["aria-busy"], undefined);
});
