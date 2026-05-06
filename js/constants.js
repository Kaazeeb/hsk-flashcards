window.HSKFlashcards = window.HSKFlashcards || {};

// Shared constants only. Keep business rules in the modules that own them
// so changes to scheduling, persistence, or pinyin do not hide in this file.
(function (ns) {
  ns.constants = {
    STORAGE_KEY: "hsk_flashcards_db_v21",
    MODES: ["learn", "practice"],
    PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
    TEST_QUIZ_TYPES: [],
    QUIZ_TYPES: ["translation", "pinyin", "smart"],
    ALL_SET_ID: "all_cards",
    REVIEW_ALL_SETS_ID: "__all_saved_sets__",
    IMAGE_ALL_DECK_ID: "all_image_cards",
    IMAGE_DEFAULT_DECK_ID: "kids_images",
    IMAGE_DEFAULT_DECK_NAME: "Kids images",
    IMAGE_ASSET_BASE_PATH: "images/flashcards/",
    IMAGE_SMART_SPACING_FACTOR: 0.55,
    SCHEMA_VERSION: 1,
    SMART_RATINGS: [1, 2, 3, 4],
    SMART_RATING_LABELS: {
      1: "Again",
      2: "Hard",
      3: "Good",
      4: "Easy"
    },
    IMAGE_SMART_RATING_LABELS: {
      1: "Again",
      2: "Almost",
      3: "Good",
      4: "Easy"
    },
    SENTENCE_ALL_DECK_ID: "all_sentence_cards",
    SENTENCE_DEFAULT_DECK_ID: "sentence_hsk1",
    SENTENCE_DEFAULT_DECK_NAME: "HSK 1 sentences"
  };

  ns.getBuiltInCards = function getBuiltInCards() {
    const raw = Array.isArray(window.HSK1_BUILTIN_CARDS) ? window.HSK1_BUILTIN_CARDS : [];
    return raw.map((card) => ({
      hanzi: String(card.hanzi || "").trim(),
      pinyin: String(card.pinyin || "").trim(),
      pinyinNumeric: String(card.pinyinNumeric || card.pinyin_numeric || card.numericPinyin || "").trim(),
      translation: String(card.translation || "").trim(),
      learn: card.learn !== false,
      practice: card.practice !== false
    })).filter((card) => card.hanzi && card.pinyin && card.translation);
  };

  ns.getBuiltInImageCards = function getBuiltInImageCards() {
    const raw = Array.isArray(window.HSK_IMAGE_CARDS) ? window.HSK_IMAGE_CARDS : [];
    const defaults = ns.constants;
    return raw.map((card, index) => {
      const deckId = String(card.deckId || card.deck || defaults.IMAGE_DEFAULT_DECK_ID).trim() || defaults.IMAGE_DEFAULT_DECK_ID;
      const deckName = String(card.deckName || card.category || defaults.IMAGE_DEFAULT_DECK_NAME).trim() || defaults.IMAGE_DEFAULT_DECK_NAME;
      const imagePath = String(card.imagePath || card.image || card.src || "").trim();
      const hanzi = String(card.hanzi || card.prompt || "").trim();
      const pinyin = String(card.pinyin || "").trim();
      const pinyinNumeric = String(card.pinyinNumeric || card.pinyin_numeric || card.numericPinyin || "").trim();
      const translation = String(card.translation || card.meaning || card.answer || "").trim();
      const id = String(card.id || `image_${index + 1}`).trim();
      return {
        id,
        index: index + 1,
        deckId,
        deckName,
        imagePath,
        hanzi,
        pinyin,
        pinyinNumeric,
        translation,
        prompt: String(card.prompt || translation || hanzi || "").trim(),
        alt: String(card.alt || translation || hanzi || "Image flashcard").trim(),
        tags: Array.isArray(card.tags) ? card.tags.map(String) : []
      };
    }).filter((card) => card.id && card.deckId && card.imagePath && (card.hanzi || card.translation || card.pinyin));
  };

  ns.getBuiltInSentenceCards = function getBuiltInSentenceCards() {
    const raw = Array.isArray(window.HSK_SENTENCE_CARDS) ? window.HSK_SENTENCE_CARDS : [];
    const defaults = ns.constants;
    return raw.map((card, index) => {
      const direction = card.direction === "en_to_zh" ? "en_to_zh" : "zh_to_en";
      const level = Math.max(1, Math.min(9, Math.floor(Number(card.level) || 1)));
      const deckId = String(card.deckId || card.deck || `sentence_hsk${level}`).trim() || defaults.SENTENCE_DEFAULT_DECK_ID;
      const deckName = String(card.deckName || card.category || `HSK ${level} sentences`).trim() || defaults.SENTENCE_DEFAULT_DECK_NAME;
      const front = String(card.front || card.prompt || "").trim();
      const back = String(card.back || card.answer || "").trim();
      const chinese = String(card.chinese || card.hanzi || (direction === "zh_to_en" ? front : back) || "").trim();
      const english = String(card.english || card.translation || (direction === "zh_to_en" ? back : front) || "").trim();
      const id = String(card.id || `sentence_${level}_${index + 1}_${direction}`).trim();
      return {
        id,
        index: index + 1,
        cardKind: "sentence",
        level,
        direction,
        deckId,
        deckName,
        front,
        back,
        chinese,
        english,
        grammarTags: Array.isArray(card.grammarTags) ? card.grammarTags.map(String) : [],
        tags: Array.isArray(card.tags) ? card.tags.map(String) : []
      };
    }).filter((card) => card.id && card.deckId && card.front && card.back && card.chinese && card.english);
  };
})(window.HSKFlashcards);
