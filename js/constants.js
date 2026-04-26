window.HSKFlashcards = window.HSKFlashcards || {};

(function (ns) {
  ns.constants = {
    STORAGE_KEY: "hsk_flashcards_db_v21",
    MODES: ["learn", "practice", "test"],
    PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
    TEST_QUIZ_TYPES: ["translation", "pinyin"],
    QUIZ_TYPES: ["translation", "pinyin", "smart"],
    ALL_SET_ID: "all_cards",
    SCHEMA_VERSION: 1,
    SMART_RATINGS: [1, 2, 3, 4],
    SMART_RATING_LABELS: {
      1: "Again",
      2: "Hard",
      3: "Good",
      4: "Easy"
    }
  };

  ns.getBuiltInCards = function getBuiltInCards() {
    const raw = Array.isArray(window.HSK1_BUILTIN_CARDS) ? window.HSK1_BUILTIN_CARDS : [];
    return raw.map((card) => ({
      hanzi: String(card.hanzi || "").trim(),
      pinyin: String(card.pinyin || "").trim(),
      translation: String(card.translation || "").trim(),
      learn: card.learn !== false,
      practice: card.practice !== false,
      test: card.test !== false
    })).filter((card) => card.hanzi && card.pinyin && card.translation);
  };
})(window.HSKFlashcards);
