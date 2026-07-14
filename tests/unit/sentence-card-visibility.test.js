"use strict";

const assert = require("node:assert/strict");

global.window = {
  HSKFlashcards: {
    constants: {
      MODES: ["learn", "practice"],
      PRACTICE_QUIZ_TYPES: ["translation", "pinyin"],
      ALL_SET_ID: "all_cards",
      REVIEW_ALL_SETS_ID: "review_all",
      IMAGE_ALL_DECK_ID: "image_all",
      SENTENCE_ALL_DECK_ID: "sentence_all",
      SCHEMA_VERSION: 46
    },
    utils: {
      normalizeCard: (card, index) => ({ ...card, index, id: String(card.id || index) }),
      cardId: (card) => String(card?.id || ""),
      createAllCardsSet: (cardIds) => ({ id: "all_cards", name: "All cards", cardIds })
    }
  }
};

require("../../js/visibility-bitset.js");
require("../../js/store.js");

const ns = window.HSKFlashcards;

function sentence(id, visibilityIndex) {
  return {
    id,
    visibilityIndex,
    level: 3,
    direction: "zh_to_en",
    deckId: "sentence_hsk3",
    deckName: "HSK 3 sentences",
    front: id,
    back: id,
    chinese: id,
    english: id
  };
}

function normalizeWithVisibility(row) {
  return ns.store.normalizeDb(
    { builtinVisibility: { version: 46, rows: [row] } },
    [],
    [],
    [sentence("retained-first", 0), sentence("retained-third", 2), sentence("new-appended", 3)]
  );
}

const hiddenException = normalizeWithVisibility({ d: 103, m: 0, z: true, n: 3, x: "BA==" });
assert.deepEqual(hiddenException.builtinVisibility._deckIdMap.sentence_hsk3, [
  "retained-first",
  "__inactive_visibility_slot__:sentence_hsk3:1",
  "retained-third",
  "new-appended"
]);
assert.equal(
  ns.store.getBuiltinCardVisibility(hiddenException.builtinVisibility, "sentence_hsk3", "retained-first").learn,
  true
);
assert.equal(
  ns.store.getBuiltinCardVisibility(hiddenException.builtinVisibility, "sentence_hsk3", "retained-third").learn,
  false
);
assert.equal(
  ns.store.getBuiltinCardVisibility(hiddenException.builtinVisibility, "sentence_hsk3", "new-appended").learn,
  true
);

const visibleException = normalizeWithVisibility({ d: 103, m: 0, z: false, n: 3, x: "BA==" });
assert.equal(
  ns.store.getBuiltinCardVisibility(visibleException.builtinVisibility, "sentence_hsk3", "retained-third").learn,
  true
);
assert.equal(
  ns.store.getBuiltinCardVisibility(visibleException.builtinVisibility, "sentence_hsk3", "new-appended").learn,
  false
);

console.log("Sentence-card sparse visibility tests passed.");
