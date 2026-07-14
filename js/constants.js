window.HSKFlashcards = window.HSKFlashcards || {};

// Shared constants only. Keep business rules in the modules that own them
// so changes to scheduling, persistence, or pinyin do not hide in this file.
(function (ns) {
  ns.constants = {
    STORAGE_KEY: "hsk_flashcards_db_v21",
    MODES: ["learn", "practice"],
    PRACTICE_QUIZ_TYPES: ["translation", "pinyin", "smart"],
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
    return raw.map((card) => {
      const partOfSpeech = String(card.partOfSpeech || card.part_of_speech || card.pos || "").trim();
      const example = String(card.example || card.exampleSentence || card.example_sentence || "").trim();
      return {
        hanzi: String(card.hanzi || "").trim(),
        pinyin: String(card.pinyin || "").trim(),
        pinyinNumeric: String(card.pinyinNumeric || card.pinyin_numeric || card.numericPinyin || "").trim(),
        translation: String(card.translation || "").trim(),
        ...(partOfSpeech ? { partOfSpeech } : {}),
        ...(example ? { example } : {}),
        learn: card.learn !== false,
        practice: card.practice !== false
      };
    }).filter((card) => card.hanzi && card.pinyin && card.translation);
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

  const STUDY_DIRECTIONS = ["zh_to_en", "en_to_zh", "zh_qa", "hanzi_to_pinyin", "measure_word", "stroke_sequence"];

  const STROKE_TYPE_LABELS = {
    1: "横 héng",
    2: "竖 shù",
    3: "撇 piě",
    4: "捺/点 nà/diǎn",
    5: "折 zhé"
  };

  function getChineseChars(text) {
    return [...String(text || "")].filter((char) => /[㐀-鿿]/.test(char));
  }

  function getHardcodedHanziData() {
    return (Array.isArray(window.HSK_HANZI_CARDS) ? window.HSK_HANZI_CARDS : [])
      .map((item, index) => ({
        id: String(item?.id || `hanzi_${index + 1}`).trim(),
        level: Math.max(1, Math.min(3, Math.floor(Number(item?.level) || 1))),
        hanzi: String(item?.hanzi || "").trim(),
        pinyin: String(item?.pinyin || "").trim(),
        pinyinNumeric: String(item?.pinyinNumeric || item?.pinyin_numeric || "").trim(),
        meaning: String(item?.meaning || item?.english || item?.translation || "vocabulary item").trim(),
        strokeAnswer: String(item?.strokeAnswer || "").replace(/[^1-5]/g, "")
      }))
      .filter((item) => item.id && item.hanzi && item.pinyin && item.strokeAnswer)
      .sort((a, b) => a.level - b.level || a.hanzi.localeCompare(b.hanzi, "zh-Hans-CN"));
  }

  function getHardcodedMeasureWordData() {
    return (Array.isArray(window.HSK_MEASURE_WORD_CARDS) ? window.HSK_MEASURE_WORD_CARDS : [])
      .map((item, index) => ({
        id: String(item?.id || `measure_${index + 1}`).trim(),
        level: Math.max(1, Math.min(3, Math.floor(Number(item?.level) || 1))),
        hanzi: String(item?.hanzi || "").trim(),
        pinyin: String(item?.pinyin || "").trim(),
        pinyinNumeric: String(item?.pinyinNumeric || item?.pinyin_numeric || "").trim(),
        meaning: String(item?.meaning || item?.english || item?.translation || "vocabulary item").trim(),
        measureWords: String(item?.measureWords || item?.classifiers || item?.back || "").trim()
      }))
      .filter((item) => item.id && item.hanzi && item.measureWords)
      .sort((a, b) => a.level - b.level || a.hanzi.localeCompare(b.hanzi, "zh-Hans-CN"));
  }

  function buildHanziPinyinCards() {
    return getHardcodedHanziData().map((info) => ({
      id: `hanzi_pinyin_${info.id}`,
      level: info.level,
      cardKind: "study",
      direction: "hanzi_to_pinyin",
      deckId: `builtin_hanzi_pinyin_hsk${info.level}`,
      deckName: `HSK ${info.level} Hanzi → pinyin`,
      front: info.hanzi,
      back: info.pinyin,
      chinese: info.hanzi,
      english: info.pinyin,
      pinyin: info.pinyin,
      pinyinNumeric: info.pinyinNumeric,
      meaning: info.meaning,
      strokeAnswer: info.strokeAnswer,
      tags: ["builtin", "hanzi", "pinyin", `hsk${info.level}`]
    }));
  }

  function buildMeasureWordCards() {
    return getHardcodedMeasureWordData().map((item) => ({
      id: `measure_word_${item.id}`,
      level: item.level,
      cardKind: "study",
      direction: "measure_word",
      deckId: `builtin_measure_words_hsk${item.level}`,
      deckName: `HSK ${item.level} measure words`,
      front: item.hanzi,
      back: item.measureWords,
      chinese: item.hanzi,
      english: item.measureWords,
      pinyin: item.pinyin,
      pinyinNumeric: item.pinyinNumeric,
      meaning: item.meaning,
      tags: ["builtin", "measure_words", `hsk${item.level}`]
    }));
  }

  function buildStrokeOrderCards() {
    const legend = getStrokeLegend();
    return getHardcodedHanziData().map((info) => ({
      id: `stroke_order_${info.id}`,
      level: info.level,
      cardKind: "study",
      direction: "stroke_sequence",
      deckId: `builtin_stroke_order_hsk${info.level}`,
      deckName: `HSK ${info.level} pinyin + meaning → 5-stroke sequence`,
      front: `${info.pinyin} · ${info.meaning}`,
      back: `${info.hanzi} · ${info.meaning} · ${info.strokeAnswer}`,
      chinese: info.hanzi,
      english: info.meaning,
      pinyin: info.pinyin,
      pinyinNumeric: info.pinyinNumeric,
      strokeSourceChar: info.hanzi,
      strokeAnswer: info.strokeAnswer,
      strokeLegend: legend,
      strokeTypes: STROKE_TYPE_LABELS,
      answerMode: "numeric_strokes_5",
      tags: ["builtin", "stroke_order", "five_stroke", `hsk${info.level}`]
    }));
  }

  function getStrokeLegend() {
    return Object.entries(STROKE_TYPE_LABELS).map(([key, label]) => `${key}=${label}`).join(" · ");
  }

  function getStrokeSequenceForHanzi(hanzi) {
    const char = getChineseChars(hanzi)[0] || String(hanzi || "").trim()[0] || "";
    const record = getHardcodedHanziData().find((item) => item.hanzi === char);
    return String(record?.strokeAnswer || "").replace(/[^1-5]/g, "");
  }

  ns.strokeOrder = {
    labels: STROKE_TYPE_LABELS,
    getStrokeLegend,
    getStrokeSequenceForHanzi
  };

  ns.getBuiltInSentenceCards = function getBuiltInSentenceCards() {
    const raw = [
      ...(Array.isArray(window.HSK_SENTENCE_CARDS) ? window.HSK_SENTENCE_CARDS : []),
      ...buildHanziPinyinCards(),
      ...buildMeasureWordCards(),
      ...buildStrokeOrderCards()
    ];
    const defaults = ns.constants;
    return raw.map((card, index) => {
      const rawDirection = String(card.direction || "").trim();
      const direction = STUDY_DIRECTIONS.includes(rawDirection) ? rawDirection : "zh_to_en";
      const level = Math.max(0, Math.min(9, Math.floor(Number(card.level) || 0)));
      const deckId = String(card.deckId || card.deck || `sentence_hsk${level || 1}`).trim() || defaults.SENTENCE_DEFAULT_DECK_ID;
      const deckName = String(card.deckName || card.category || `HSK ${level || 1} sentences`).trim() || defaults.SENTENCE_DEFAULT_DECK_NAME;
      const front = String(card.front || card.prompt || "").trim();
      const back = String(card.back || card.answer || "").trim();
      const chinese = String(card.chinese || card.hanzi || (direction === "en_to_zh" ? back : `${front} ${back}`) || "").trim();
      const english = String(card.english || card.translation || (direction === "zh_to_en" ? back : direction === "en_to_zh" ? front : "") || "").trim();
      const id = String(card.id || `sentence_${level}_${index + 1}_${direction}`).trim();
      return {
        id,
        index: index + 1,
        visibilityIndex: card.visibilityIndex !== null && card.visibilityIndex !== undefined
          && card.visibilityIndex !== "" && Number.isInteger(Number(card.visibilityIndex))
          && Number(card.visibilityIndex) >= 0
          ? Number(card.visibilityIndex)
          : null,
        cardKind: card.cardKind === "study" ? "study" : "sentence",
        level,
        direction,
        deckId,
        deckName,
        front,
        back,
        chinese,
        english,
        pinyin: String(card.pinyin || "").trim(),
        pinyinNumeric: String(card.pinyinNumeric || "").trim(),
        strokeSourceChar: String(card.strokeSourceChar || card.chinese || "").trim(),
        strokeAnswer: String(card.strokeAnswer || "").trim(),
        strokeLegend: String(card.strokeLegend || "").trim(),
        strokeTypes: card.strokeTypes && typeof card.strokeTypes === "object" ? card.strokeTypes : null,
        answerMode: String(card.answerMode || (direction === "zh_qa" ? "zh_answer" : "")).trim(),
        grammarTags: Array.isArray(card.grammarTags) ? card.grammarTags.map(String) : [],
        tags: Array.isArray(card.tags) ? card.tags.map(String) : []
      };
    }).filter((card) => card.id && card.deckId && card.front && card.back && card.chinese && (card.direction === "zh_qa" || card.direction === "stroke_sequence" || card.english));
  };
})(window.HSKFlashcards);
