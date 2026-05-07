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

  const STUDY_DIRECTIONS = ["zh_to_en", "en_to_zh", "zh_qa", "hanzi_to_pinyin", "measure_word", "stroke_sequence"];

  const STROKE_TYPE_LABELS = {
    1: "横 héng",
    2: "竖 shù",
    3: "撇 piě",
    4: "捺/点 nà/diǎn",
    5: "折 zhé"
  };

  const STROKE_SEQUENCE_DATA = window.HSK_STROKE_SEQUENCES || {};

  const CHAR_PINYIN_OVERRIDES = {
    谢: "xiè",
    么: "me",
    妈: "mā",
    爸: "bà",
    哥: "gē",
    姐: "jiě",
    弟: "dì",
    妹: "mèi",
    们: "men",
    子: "zi",
    服: "fu",
    饭: "fàn",
    觉: "jiào",
    候: "hou",
    亮: "liang",
    识: "shi",
    见: "jiàn",
    话: "huà",
    课: "kè",
    班: "bān",
    病: "bìng",
    点: "diǎn",
    儿: "ér"
  };

  function getChineseChars(text) {
    return [...String(text || "")].filter((char) => /[㐀-鿿]/.test(char));
  }

  function splitCompactNumericPinyin(text, count) {
    const value = String(text || "").trim();
    if (!value || !count) return [];
    if (/\s/.test(value)) {
      const parts = value.split(/\s+/).filter(Boolean);
      return parts.length === count ? parts : [];
    }
    const segments = [];
    let start = 0;
    for (let i = 0; i < value.length; i += 1) {
      if (/[1-4]/.test(value[i])) {
        segments.push(value.slice(start, i + 1));
        start = i + 1;
        if (segments.length === count) break;
      }
    }
    if (start < value.length) segments.push(value.slice(start));
    return segments.length === count ? segments : [];
  }

  function numericSyllableToMarked(syllable) {
    const raw = String(syllable || "").toLowerCase().replace(/v/g, "ü");
    const match = raw.match(/^([a-zü:]+)([1-4])?$/i);
    if (!match) return raw;
    const base = match[1].replace(/u:/g, "ü");
    const tone = Number(match[2] || 0);
    if (!tone) return base;
    const toneMarks = {
      a: ["ā", "á", "ǎ", "à"],
      e: ["ē", "é", "ě", "è"],
      i: ["ī", "í", "ǐ", "ì"],
      o: ["ō", "ó", "ǒ", "ò"],
      u: ["ū", "ú", "ǔ", "ù"],
      ü: ["ǖ", "ǘ", "ǚ", "ǜ"]
    };
    let target = -1;
    if (base.includes("a")) target = base.indexOf("a");
    else if (base.includes("e")) target = base.indexOf("e");
    else if (base.includes("ou")) target = base.indexOf("o");
    else {
      for (let i = base.length - 1; i >= 0; i -= 1) {
        if ("aeiouü".includes(base[i])) { target = i; break; }
      }
    }
    if (target < 0 || !toneMarks[base[target]]) return base;
    return base.slice(0, target) + toneMarks[base[target]][tone - 1] + base.slice(target + 1);
  }

  function cleanGloss(translation) {
    const withoutClassifiers = String(translation || "")
      .replace(/;?\s*CL:\s*.*$/i, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/\([^)]*\)/g, "")
      .trim();
    const firstPieces = withoutClassifiers.split(/;|,/).map((part) => part.trim()).filter(Boolean).slice(0, 2);
    const gloss = firstPieces.join("; ") || withoutClassifiers || "vocabulary item";
    return gloss.length > 54 ? `${gloss.slice(0, 51).trim()}...` : gloss;
  }

  function collectHanziStudyInfo(vocab) {
    const map = new Map();
    function ensure(char) {
      if (!map.has(char)) {
        map.set(char, { char, pinyin: new Set(), pinyinNumeric: new Set(), exactGlosses: [], contextGlosses: [] });
      }
      return map.get(char);
    }
    (vocab || []).forEach((card) => {
      const chars = getChineseChars(card.hanzi);
      if (!chars.length) return;
      const gloss = cleanGloss(card.translation);
      const numericParts = splitCompactNumericPinyin(card.pinyinNumeric, chars.length);
      chars.forEach((char, index) => {
        const info = ensure(char);
        if (numericParts.length === chars.length) {
          const numeric = numericParts[index];
          if (numeric) {
            info.pinyinNumeric.add(numeric);
            info.pinyin.add(numericSyllableToMarked(numeric));
          }
        }
        if (chars.length === 1) info.exactGlosses.push(gloss);
        else info.contextGlosses.push(gloss);
      });
    });
    Object.entries(CHAR_PINYIN_OVERRIDES).forEach(([char, pinyin]) => {
      if (map.has(char) && !map.get(char).pinyin.size) map.get(char).pinyin.add(pinyin);
    });
    return [...map.values()].sort((a, b) => a.char.localeCompare(b.char, "zh-Hans-CN")).map((info) => ({
      ...info,
      pinyinDisplay: [...info.pinyin].join(" / ") || "—",
      pinyinNumericDisplay: [...info.pinyinNumeric].join(" / "),
      meaning: info.exactGlosses[0] || info.contextGlosses[0] || "vocabulary item"
    }));
  }

  function extractMeasureWords(translation) {
    const match = String(translation || "").match(/CL:\s*(.+)$/i);
    if (!match) return "";
    return match[1].trim().replace(/;\s*/g, "; ");
  }

  function buildHanziPinyinCards(vocab) {
    return collectHanziStudyInfo(vocab).map((info) => ({
      id: `hanzi_pinyin_${info.char.codePointAt(0).toString(16)}`,
      level: 0,
      cardKind: "study",
      direction: "hanzi_to_pinyin",
      deckId: "builtin_hanzi_pinyin",
      deckName: "Hanzi → pinyin",
      front: info.char,
      back: info.pinyinDisplay,
      chinese: info.char,
      english: info.pinyinDisplay,
      pinyin: info.pinyinDisplay,
      pinyinNumeric: info.pinyinNumericDisplay,
      tags: ["builtin", "hanzi", "pinyin"]
    }));
  }

  function buildMeasureWordCards(vocab) {
    return (vocab || []).map((card, index) => {
      const measureWords = extractMeasureWords(card.translation);
      if (!measureWords) return null;
      const compactHanzi = String(card.hanzi || "").replace(/[^㐀-鿿]/g, "");
      return {
        id: `measure_word_${index + 1}_${compactHanzi}`,
        level: 0,
        cardKind: "study",
        direction: "measure_word",
        deckId: "builtin_measure_words",
        deckName: "Measure words from vocabulary",
        front: card.hanzi,
        back: measureWords,
        chinese: card.hanzi,
        english: measureWords,
        pinyin: card.pinyin,
        pinyinNumeric: card.pinyinNumeric,
        tags: ["builtin", "measure_words"]
      };
    }).filter(Boolean);
  }

  function buildStrokeOrderCards(vocab) {
    const legend = getStrokeLegend();
    return collectHanziStudyInfo(vocab).map((info) => {
      const strokeAnswer = String(STROKE_SEQUENCE_DATA[info.char] || "").replace(/[^1-5]/g, "");
      return {
        id: `stroke_order_${info.char.codePointAt(0).toString(16)}`,
        level: 0,
        cardKind: "study",
        direction: "stroke_sequence",
        deckId: "builtin_stroke_order",
        deckName: "Pinyin + meaning → 5-stroke sequence",
        front: `${info.pinyinDisplay} · ${info.meaning}`,
        back: `${info.char} · ${info.meaning} · ${strokeAnswer}`,
        chinese: info.char,
        english: info.meaning,
        pinyin: info.pinyinDisplay,
        pinyinNumeric: info.pinyinNumericDisplay,
        strokeSourceChar: info.char,
        strokeAnswer,
        strokeLegend: legend,
        strokeTypes: STROKE_TYPE_LABELS,
        answerMode: "numeric_strokes_5",
        tags: ["builtin", "stroke_order", "five_stroke"]
      };
    }).filter((card) => card.strokeAnswer);
  }

  function getStrokeLegend() {
    return Object.entries(STROKE_TYPE_LABELS).map(([key, label]) => `${key}=${label}`).join(" · ");
  }

  function getStrokeSequenceForHanzi(hanzi) {
    const char = getChineseChars(hanzi)[0] || String(hanzi || "").trim()[0] || "";
    return String(STROKE_SEQUENCE_DATA[char] || "").replace(/[^1-5]/g, "");
  }

  ns.strokeOrder = {
    labels: STROKE_TYPE_LABELS,
    getStrokeLegend,
    getStrokeSequenceForHanzi
  };

  ns.getBuiltInSentenceCards = function getBuiltInSentenceCards() {
    const vocab = ns.getBuiltInCards();
    const raw = [
      ...(Array.isArray(window.HSK_SENTENCE_CARDS) ? window.HSK_SENTENCE_CARDS : []),
      ...buildHanziPinyinCards(vocab),
      ...buildMeasureWordCards(vocab),
      ...buildStrokeOrderCards(vocab)
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
