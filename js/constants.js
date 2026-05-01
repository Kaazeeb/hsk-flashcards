window.HSKFlashcards = window.HSKFlashcards || {};

// Shared constants only. Keep business rules in the modules that own them
// so changes to scheduling, persistence, or pinyin do not hide in this file.
(function (ns) {
  ns.constants = {
    STORAGE_KEY: "hsk_flashcards_db_v21",
    MODES: ["learn", "practice", "test"],
    PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
    TEST_QUIZ_TYPES: ["translation", "pinyin"],
    QUIZ_TYPES: ["translation", "pinyin", "smart"],
    ALL_SET_ID: "all_cards",
    REVIEW_ALL_SETS_ID: "__all_saved_sets__",
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
      pinyinNumeric: String(card.pinyinNumeric || card.pinyin_numeric || card.numericPinyin || "").trim(),
      translation: String(card.translation || "").trim(),
      learn: card.learn !== false,
      practice: card.practice !== false,
      test: card.test !== false
    })).filter((card) => card.hanzi && card.pinyin && card.translation);
  };
})(window.HSKFlashcards);
