const STORAGE_KEYS = {
  vocab: "hsk_flashcards_vocab",
  progress: "hsk_flashcards_progress",
  mode: "hsk_flashcards_mode"
};

const BUILTIN_CARDS = Array.isArray(window.HSK1_BUILTIN_CARDS) ? window.HSK1_BUILTIN_CARDS : [];

const MODES = ["learn", "practice", "test"];
const QUIZ_TYPES = ["translation", "pinyin"];

const PINYIN_SYLLABLES = [
  "a", "ai", "an", "ang", "ao",
  "ba", "bai", "ban", "bang", "bao", "bei", "ben", "beng", "bi", "bian", "biao", "bie", "bin", "bing", "bo", "bu",
  "ca", "cai", "can", "cang", "cao", "ce", "cen", "ceng", "cha", "chai", "chan", "chang", "chao", "che", "chen", "cheng", "chi", "chong", "chou", "chu", "chua", "chuai", "chuan", "chuang", "chui", "chun", "chuo", "ci", "cong", "cou", "cu", "cuan", "cui", "cun", "cuo",
  "da", "dai", "dan", "dang", "dao", "de", "dei", "den", "deng", "di", "dia", "dian", "diao", "die", "ding", "diu", "dong", "dou", "du", "duan", "dui", "dun", "duo",
  "e", "ei", "en", "eng", "er",
  "fa", "fan", "fang", "fei", "fen", "feng", "fo", "fou", "fu",
  "ga", "gai", "gan", "gang", "gao", "ge", "gei", "gen", "geng", "gong", "gou", "gu", "gua", "guai", "guan", "guang", "gui", "gun", "guo",
  "ha", "hai", "han", "hang", "hao", "he", "hei", "hen", "heng", "hong", "hou", "hu", "hua", "huai", "huan", "huang", "hui", "hun", "huo",
  "ji", "jia", "jian", "jiang", "jiao", "jie", "jin", "jing", "jiong", "jiu", "ju", "juan", "jue", "jun",
  "ka", "kai", "kan", "kang", "kao", "ke", "ken", "keng", "kong", "kou", "ku", "kua", "kuai", "kuan", "kuang", "kui", "kun", "kuo",
  "la", "lai", "lan", "lang", "lao", "le", "lei", "leng", "li", "lia", "lian", "liang", "liao", "lie", "lin", "ling", "liu", "long", "lou", "lu", "luan", "lun", "luo", "lv", "lve",
  "ma", "mai", "man", "mang", "mao", "me", "mei", "men", "meng", "mi", "mian", "miao", "mie", "min", "ming", "miu", "mo", "mou", "mu",
  "na", "nai", "nan", "nang", "nao", "ne", "nei", "nen", "neng", "ni", "nian", "niang", "niao", "nie", "nin", "ning", "niu", "nong", "nou", "nu", "nuan", "nun", "nuo", "nv", "nve",
  "o", "ou",
  "pa", "pai", "pan", "pang", "pao", "pei", "pen", "peng", "pi", "pian", "piao", "pie", "pin", "ping", "po", "pou", "pu",
  "qi", "qia", "qian", "qiang", "qiao", "qie", "qin", "qing", "qiong", "qiu", "qu", "quan", "que", "qun",
  "ran", "rang", "rao", "re", "ren", "reng", "ri", "rong", "rou", "ru", "rua", "ruan", "rui", "run", "ruo",
  "sa", "sai", "san", "sang", "sao", "se", "sen", "seng", "sha", "shai", "shan", "shang", "shao", "she", "shei", "shen", "sheng", "shi", "shou", "shu", "shua", "shuai", "shuan", "shuang", "shui", "shun", "shuo", "si", "song", "sou", "su", "suan", "sui", "sun", "suo",
  "ta", "tai", "tan", "tang", "tao", "te", "teng", "ti", "tian", "tiao", "tie", "ting", "tong", "tou", "tu", "tuan", "tui", "tun", "tuo",
  "wa", "wai", "wan", "wang", "wei", "wen", "weng", "wo", "wu",
  "xi", "xia", "xian", "xiang", "xiao", "xie", "xin", "xing", "xiong", "xiu", "xu", "xuan", "xue", "xun",
  "ya", "yan", "yang", "yao", "ye", "yi", "yin", "ying", "yo", "yong", "you", "yu", "yuan", "yue", "yun",
  "za", "zai", "zan", "zang", "zao", "ze", "zei", "zen", "zeng", "zha", "zhai", "zhan", "zhang", "zhao", "zhe", "zhei", "zhen", "zheng", "zhi", "zhong", "zhou", "zhu", "zhua", "zhuai", "zhuan", "zhuang", "zhui", "zhun", "zhuo", "zi", "zong", "zou", "zu", "zuan", "zui", "zun", "zuo"
];

const PINYIN_SYLLABLE_SET = new Set(PINYIN_SYLLABLES);
const MAX_PINYIN_SYLLABLE_LENGTH = PINYIN_SYLLABLES.reduce((max, item) => Math.max(max, item.length), 0);

const TONE_TO_ANNOTATED_MAP = {
  ā: "a1", á: "a2", ǎ: "a3", à: "a4",
  ē: "e1", é: "e2", ě: "e3", è: "e4",
  ī: "i1", í: "i2", ǐ: "i3", ì: "i4",
  ō: "o1", ó: "o2", ǒ: "o3", ò: "o4",
  ū: "u1", ú: "u2", ǔ: "u3", ù: "u4",
  ǖ: "v1", ǘ: "v2", ǚ: "v3", ǜ: "v4",
  ü: "v"
};

const state = {
  vocab: [],
  progress: createEmptyProgress(),
  mode: "learn",
  filterText: "",
  round: createEmptyRound()
};

const elements = {
  vocabInput: document.getElementById("vocabInput"),
  saveVocabBtn: document.getElementById("saveVocabBtn"),
  loadPlaceholderBtn: document.getElementById("loadPlaceholderBtn"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetOrderBtn: document.getElementById("resetOrderBtn"),
  filterInput: document.getElementById("filterInput"),
  manageList: document.getElementById("manageList"),
  selectionSummary: document.getElementById("selectionSummary"),
  orderStatus: document.getElementById("orderStatus"),
  statusText: document.getElementById("statusText"),
  modeButtons: [...document.querySelectorAll(".mode-btn")],
  quizTypeWrap: document.getElementById("quizTypeWrap"),
  quizTypeButtons: [...document.querySelectorAll(".quiz-type-btn")],
  rangeLearn: document.getElementById("rangeLearn"),
  rangePractice: document.getElementById("rangePractice"),
  rangeTest: document.getElementById("rangeTest"),
  rangeButtons: [...document.querySelectorAll("[data-range-action]")],
  modeLabel: document.getElementById("modeLabel"),
  quizLabel: document.getElementById("quizLabel"),
  positionLabel: document.getElementById("positionLabel"),
  cardPrompt: document.getElementById("cardPrompt"),
  cardHanzi: document.getElementById("cardHanzi"),
  cardPinyin: document.getElementById("cardPinyin"),
  cardTranslation: document.getElementById("cardTranslation"),
  resultText: document.getElementById("resultText"),
  answerArea: document.getElementById("answerArea"),
  controls: document.getElementById("controls"),
  statTotal: document.getElementById("statTotal"),
  statSeen: document.getElementById("statSeen"),
  statPracticeTranslation: document.getElementById("statPracticeTranslation"),
  statPracticePinyin: document.getElementById("statPracticePinyin"),
  statTestTranslation: document.getElementById("statTestTranslation"),
  statTestPinyin: document.getElementById("statTestPinyin"),
  barLearn: document.getElementById("barLearn"),
  barPractice: document.getElementById("barPractice"),
  barTest: document.getElementById("barTest"),
  barLearnLabel: document.getElementById("barLearnLabel"),
  barPracticeLabel: document.getElementById("barPracticeLabel"),
  barTestLabel: document.getElementById("barTestLabel")
};

function createEmptyRound() {
  return {
    answered: false,
    options: [],
    selectedLabel: "",
    selectedCorrect: false,
    answerText: "",
    resultText: "",
    resultClass: ""
  };
}

function createEmptyProgress() {
  return {
    seen: {},
    practice: {
      translation: {},
      pinyin: {}
    },
    test: {
      translation: {},
      pinyin: {}
    },
    index: {
      learn: 0,
      practice: 0,
      test: 0
    },
    order: {
      learn: [],
      practice: [],
      test: []
    },
    orderType: {
      learn: "default",
      practice: "default",
      test: "default"
    },
    quizType: {
      practice: "translation",
      test: "translation"
    }
  };
}

function createLegacyId(hanzi, pinyin, translation) {
  return `${hanzi}__${pinyin}__${translation}`;
}

function normalizeCard(card, index) {
  const hanzi = String(card.hanzi || card.word || card.palavra || "").trim();
  const pinyin = String(card.pinyin || "").trim();
  const translation = String(card.translation || card.traducao || card.meaning || "").trim();

  return {
    id: String(card.id || createLegacyId(hanzi, pinyin, translation)),
    index,
    hanzi,
    pinyin,
    translation,
    learn: card.learn !== false,
    practice: card.practice !== false,
    test: card.test !== false
  };
}

function getBuiltInCards() {
  return BUILTIN_CARDS.map((card) => ({
    hanzi: card.hanzi,
    pinyin: card.pinyin,
    translation: card.translation,
    learn: true,
    practice: true,
    test: true
  }));
}


function normalizeScoreBucket(bucket) {
  const output = {};
  if (!bucket || typeof bucket !== "object") return output;

  Object.entries(bucket).forEach(([id, entry]) => {
    if (!entry || typeof entry !== "object") return;
    output[id] = {
      correct: Number(entry.correct) || 0,
      wrong: Number(entry.wrong) || 0
    };
  });

  return output;
}

function normalizeModeProgress(bucket) {
  if (!bucket || typeof bucket !== "object") {
    return { translation: {}, pinyin: {} };
  }

  if (bucket.translation || bucket.pinyin) {
    return {
      translation: normalizeScoreBucket(bucket.translation),
      pinyin: normalizeScoreBucket(bucket.pinyin)
    };
  }

  return {
    translation: normalizeScoreBucket(bucket),
    pinyin: {}
  };
}

function normalizeProgress(progress) {
  const base = createEmptyProgress();
  if (!progress || typeof progress !== "object") return base;

  return {
    seen: progress.seen && typeof progress.seen === "object" ? progress.seen : base.seen,
    practice: normalizeModeProgress(progress.practice),
    test: normalizeModeProgress(progress.test),
    index: {
      learn: Number.isInteger(progress.index?.learn) ? progress.index.learn : 0,
      practice: Number.isInteger(progress.index?.practice) ? progress.index.practice : 0,
      test: Number.isInteger(progress.index?.test) ? progress.index.test : 0
    },
    order: {
      learn: Array.isArray(progress.order?.learn) ? progress.order.learn : [],
      practice: Array.isArray(progress.order?.practice) ? progress.order.practice : [],
      test: Array.isArray(progress.order?.test) ? progress.order.test : []
    },
    orderType: {
      learn: progress.orderType?.learn === "shuffled" ? "shuffled" : "default",
      practice: progress.orderType?.practice === "shuffled" ? "shuffled" : "default",
      test: progress.orderType?.test === "shuffled" ? "shuffled" : "default"
    },
    quizType: {
      practice: QUIZ_TYPES.includes(progress.quizType?.practice) ? progress.quizType.practice : "translation",
      test: QUIZ_TYPES.includes(progress.quizType?.test) ? progress.quizType.test : "translation"
    }
  };
}

function loadFromStorage() {
  try {
    const savedVocab = JSON.parse(localStorage.getItem(STORAGE_KEYS.vocab) || "[]");
    const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "null");
    const savedMode = localStorage.getItem(STORAGE_KEYS.mode);

    const vocabArray = Array.isArray(savedVocab) ? savedVocab : [];
    state.vocab = vocabArray
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => card.hanzi && card.pinyin && card.translation);

    state.progress = normalizeProgress(savedProgress);
    state.mode = MODES.includes(savedMode) ? savedMode : "learn";

    if (state.vocab.length) {
      elements.statusText.textContent = `${state.vocab.length} cards loaded from local storage.`;
      return;
    }

    const builtInCards = getBuiltInCards();
    if (builtInCards.length) {
      saveVocabulary(builtInCards);
      elements.statusText.textContent = `${builtInCards.length} built-in HSK 1 cards loaded.`;
      return;
    }

    elements.statusText.textContent = "No vocabulary found.";
  } catch (error) {
    const builtInCards = getBuiltInCards();
    if (builtInCards.length) {
      saveVocabulary(builtInCards);
      elements.statusText.textContent = `${builtInCards.length} built-in HSK 1 cards loaded.`;
      return;
    }

    state.vocab = [];
    state.progress = createEmptyProgress();
    state.mode = "learn";
    elements.statusText.textContent = "Could not read local data. Starting fresh.";
  }
}

function persistVocabulary() {
  localStorage.setItem(STORAGE_KEYS.vocab, JSON.stringify(state.vocab));
}

function saveProgress() {
  clampIndexes();
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(state.progress));
  localStorage.setItem(STORAGE_KEYS.mode, state.mode);
}

function saveVocabulary(cards) {
  state.vocab = cards.map((card, index) => normalizeCard(card, index + 1));
  state.progress = createEmptyProgress();
  state.mode = "learn";
  resetRoundState();

  persistVocabulary();
  saveProgress();
}

function restoreBuiltInVocabulary() {
  const builtInCards = getBuiltInCards();
  if (!builtInCards.length) {
    elements.statusText.textContent = "Built-in HSK 1 list not found.";
    return;
  }

  saveVocabulary(builtInCards);
  elements.vocabInput.value = "";
  elements.statusText.textContent = `${builtInCards.length} built-in HSK 1 cards restored.`;
  render();
}


function normalizeHeader(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") {
        i += 1;
      }
      row.push(cell);
      if (row.some((item) => item.trim() !== "")) {
        rows.push(row.map((item) => item.trim()));
      }
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  if (row.some((item) => item.trim() !== "")) {
    rows.push(row.map((item) => item.trim()));
  }

  return rows;
}

function getHeaderIndexes(headerRow) {
  const headers = headerRow.map(normalizeHeader);
  const findIndex = (aliases) => headers.findIndex((value) => aliases.includes(value));

  return {
    hanziIndex: findIndex(["hanzi", "word", "palavra", "simplified", "chinese", "vocab", "vocabulary"]),
    pinyinIndex: findIndex(["pinyin"]),
    translationIndex: findIndex([
      "translation",
      "translationshort",
      "traducao",
      "traducaocurta",
      "meaning",
      "english",
      "gloss",
      "definition",
      "definicao"
    ])
  };
}

function looksLikeHeader(row) {
  const joined = row.map(normalizeHeader).join("|");
  return ["hanzi", "word", "palavra", "pinyin", "translation", "traducao"].some((key) => joined.includes(key));
}

function mapRowsToCards(rows) {
  if (!rows.length) return [];

  let startIndex = 0;
  let indexes = {
    hanziIndex: 0,
    pinyinIndex: 1,
    translationIndex: 2
  };

  if (looksLikeHeader(rows[0])) {
    indexes = getHeaderIndexes(rows[0]);
    startIndex = 1;
  }

  const cards = [];

  for (let i = startIndex; i < rows.length; i += 1) {
    const row = rows[i];
    const hanzi = row[indexes.hanziIndex] || row[0] || "";
    const pinyin = row[indexes.pinyinIndex] || row[1] || "";
    const translation = row[indexes.translationIndex] || row[2] || "";

    if (!hanzi.trim() || !pinyin.trim() || !translation.trim()) continue;

    cards.push({
      hanzi: hanzi.trim(),
      pinyin: pinyin.trim(),
      translation: translation.trim(),
      learn: true,
      practice: true,
      test: true
    });
  }

  return cards;
}

function cardId(card) {
  return card.id;
}

function getQuizType(mode = state.mode) {
  if (mode === "learn") return null;
  return state.progress.quizType[mode] || "translation";
}

function getModeCards(mode = state.mode) {
  return state.vocab.filter((card) => card[mode]);
}

function getModeIds(mode = state.mode) {
  return getModeCards(mode).map(cardId);
}

function getOrderedIds(mode = state.mode) {
  const activeIds = getModeIds(mode);
  const activeSet = new Set(activeIds);
  const storedOrder = Array.isArray(state.progress.order[mode]) ? state.progress.order[mode] : [];
  const kept = storedOrder.filter((id) => activeSet.has(id));
  const keptSet = new Set(kept);

  activeIds.forEach((id) => {
    if (!keptSet.has(id)) kept.push(id);
  });

  state.progress.order[mode] = kept;
  return kept;
}

function getOrderedCards(mode = state.mode) {
  const ids = getOrderedIds(mode);
  const byId = new Map(state.vocab.map((card) => [cardId(card), card]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

function getCurrentIndex(mode = state.mode) {
  return state.progress.index[mode] || 0;
}

function clampIndexes() {
  MODES.forEach((mode) => {
    const total = getOrderedIds(mode).length;
    const current = state.progress.index[mode] || 0;

    if (!total) {
      state.progress.index[mode] = 0;
      return;
    }

    state.progress.index[mode] = Math.min(Math.max(current, 0), total - 1);
  });
}

function getCurrentCard() {
  const cards = getOrderedCards();
  if (!cards.length) return null;
  clampIndexes();
  return cards[getCurrentIndex()] || null;
}

function getSeenCount() {
  const learnIds = new Set(getModeIds("learn"));
  return Object.keys(state.progress.seen || {}).filter((id) => learnIds.has(id)).length;
}

function getModeTotals(mode, quizType) {
  const activeIds = new Set(getModeIds(mode));
  const bucket = state.progress[mode]?.[quizType] || {};
  let correct = 0;
  let wrong = 0;
  let touched = 0;

  Object.entries(bucket).forEach(([id, entry]) => {
    if (!activeIds.has(id)) return;
    touched += 1;
    correct += entry.correct || 0;
    wrong += entry.wrong || 0;
  });

  return { correct, wrong, touched, answered: correct + wrong };
}

function getModeTouchedAcrossTypes(mode) {
  if (mode === "learn") return getSeenCount();

  const activeIds = new Set(getModeIds(mode));
  const translationIds = Object.keys(state.progress[mode]?.translation || {});
  const pinyinIds = Object.keys(state.progress[mode]?.pinyin || {});
  const union = new Set([...translationIds, ...pinyinIds].filter((id) => activeIds.has(id)));
  return union.size;
}

function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function setBar(element, labelElement, part, total) {
  element.style.width = `${percentage(part, total)}%`;
  labelElement.textContent = `${part} / ${total}`;
}

function renderStats() {
  const total = state.vocab.length;
  const learnTotal = getModeCards("learn").length;
  const practiceTotal = getModeCards("practice").length;
  const testTotal = getModeCards("test").length;
  const seen = getSeenCount();
  const practiceTranslationTotals = getModeTotals("practice", "translation");
  const practicePinyinTotals = getModeTotals("practice", "pinyin");
  const testTranslationTotals = getModeTotals("test", "translation");
  const testPinyinTotals = getModeTotals("test", "pinyin");

  elements.statTotal.textContent = String(total);
  elements.statSeen.textContent = String(seen);
  elements.statPracticeTranslation.textContent = `${percentage(practiceTranslationTotals.correct, practiceTranslationTotals.answered)}%`;
  elements.statPracticePinyin.textContent = `${percentage(practicePinyinTotals.correct, practicePinyinTotals.answered)}%`;
  elements.statTestTranslation.textContent = `${percentage(testTranslationTotals.correct, testTranslationTotals.answered)}%`;
  elements.statTestPinyin.textContent = `${percentage(testPinyinTotals.correct, testPinyinTotals.answered)}%`;

  setBar(elements.barLearn, elements.barLearnLabel, seen, learnTotal);
  setBar(elements.barPractice, elements.barPracticeLabel, getModeTouchedAcrossTypes("practice"), practiceTotal);
  setBar(elements.barTest, elements.barTestLabel, getModeTouchedAcrossTypes("test"), testTotal);
}

function updateModeButtons() {
  elements.modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });

  const modeLabel = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  elements.modeLabel.textContent = modeLabel;

  if (state.mode === "learn") {
    elements.quizTypeWrap.classList.add("hidden");
    elements.quizLabel.textContent = "Study card";
    return;
  }

  elements.quizTypeWrap.classList.remove("hidden");
  const quizType = getQuizType();
  elements.quizLabel.textContent = quizType === "translation" ? "Translation · MCQ" : "Pinyin · typed";

  elements.quizTypeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.quiz === quizType);
  });
}

function resetRoundState() {
  state.round = createEmptyRound();
}

function nextCard() {
  const total = getOrderedIds().length;
  if (!total) return;
  state.progress.index[state.mode] = state.progress.index[state.mode] >= total - 1 ? 0 : state.progress.index[state.mode] + 1;
  resetRoundState();
  saveProgress();
  render();
}

function prevCard() {
  const total = getOrderedIds().length;
  if (!total) return;
  state.progress.index[state.mode] = state.progress.index[state.mode] <= 0 ? total - 1 : state.progress.index[state.mode] - 1;
  resetRoundState();
  saveProgress();
  render();
}

function markSeen(card) {
  if (!card) return;
  state.progress.seen[cardId(card)] = true;
  saveProgress();
}

function recordQuizResult(mode, quizType, result) {
  const card = getCurrentCard();
  if (!card) return;

  const id = cardId(card);
  const bucket = state.progress[mode]?.[quizType];
  if (!bucket) return;

  const entry = bucket[id] || { correct: 0, wrong: 0 };
  entry[result] += 1;
  bucket[id] = entry;
  saveProgress();
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildTranslationOptions(mode = state.mode) {
  const card = getCurrentCard();
  if (!card) return [];

  const modeCards = getModeCards(mode);
  const uniqueDistractors = [];

  modeCards.forEach((candidateCard) => {
    const translation = String(candidateCard.translation || "").trim();
    if (!translation || translation === card.translation) return;
    if (!uniqueDistractors.includes(translation)) {
      uniqueDistractors.push(translation);
    }
  });

  const optionCount = Math.min(4, uniqueDistractors.length + 1);
  const pickedDistractors = shuffle(uniqueDistractors).slice(0, Math.max(0, optionCount - 1));
  const options = [card.translation, ...pickedDistractors];

  return shuffle(
    options.map((translation) => ({
      label: translation,
      correct: translation === card.translation
    }))
  );
}

function toAnnotatedPinyin(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/u:/g, "v")
    .replace(/0/g, "5")
    .split("")
    .map((char) => {
      if (TONE_TO_ANNOTATED_MAP[char]) return TONE_TO_ANNOTATED_MAP[char];
      if (/[a-z]/.test(char)) return char;
      if (char === "v") return "v";
      if (/[1-5]/.test(char)) return char;
      return "";
    })
    .join("");
}

function segmentPinyinLettersCore(letters) {
  const memo = new Map();

  function helper(start) {
    if (start === letters.length) return [];
    if (memo.has(start)) return memo.get(start);

    for (let end = Math.min(letters.length, start + MAX_PINYIN_SYLLABLE_LENGTH); end > start; end -= 1) {
      const slice = letters.slice(start, end);
      if (!PINYIN_SYLLABLE_SET.has(slice)) continue;

      const rest = helper(end);
      if (rest) {
        const answer = [slice, ...rest];
        memo.set(start, answer);
        return answer;
      }
    }

    memo.set(start, null);
    return null;
  }

  return helper(0);
}

function segmentPinyinLetters(letters) {
  const direct = segmentPinyinLettersCore(letters);
  if (direct) return direct;

  if (letters.endsWith("r") && letters.length > 1) {
    const base = letters.slice(0, -1);
    const segmentedBase = segmentPinyinLettersCore(base);
    if (segmentedBase && segmentedBase.length) {
      const withErhua = [...segmentedBase];
      withErhua[withErhua.length - 1] = `${withErhua[withErhua.length - 1]}r`;
      return withErhua;
    }
  }

  return null;
}

function canonicalizeAnnotatedPinyin(annotated, { tonesRequired = false } = {}) {
  const letters = String(annotated || "").replace(/[1-5]/g, "");
  if (!letters) return "";

  const syllables = segmentPinyinLetters(letters);
  if (!syllables || !syllables.length) return "";

  const output = [];
  let cursor = 0;

  for (const syllable of syllables) {
    let lettersSeen = "";
    const toneDigits = [];

    while (cursor < annotated.length && lettersSeen.length < syllable.length) {
      const char = annotated[cursor];

      if (/[1-5]/.test(char)) {
        toneDigits.push(char);
        cursor += 1;
        continue;
      }

      if (/[a-z]/.test(char)) {
        lettersSeen += char;
        cursor += 1;
        continue;
      }

      cursor += 1;
    }

    while (cursor < annotated.length && /[1-5]/.test(annotated[cursor])) {
      toneDigits.push(annotated[cursor]);
      cursor += 1;
    }

    if (lettersSeen !== syllable) return "";

    let tone = toneDigits.length ? toneDigits[toneDigits.length - 1] : "";
    if (!tone) {
      if (tonesRequired) return "";
      tone = "5";
    }

    output.push(`${syllable}${tone}`);
  }

  while (cursor < annotated.length && /[1-5]/.test(annotated[cursor])) {
    cursor += 1;
  }

  if (cursor !== annotated.length) return "";
  return output.join("");
}

function canonicalizePinyinValue(value, options = {}) {
  return canonicalizeAnnotatedPinyin(toAnnotatedPinyin(value), options);
}

function getPinyinVariants(answer) {
  return String(answer || "")
    .split(/[\/;,]/)
    .map((part) => canonicalizePinyinValue(part.trim(), { tonesRequired: false }))
    .filter(Boolean);
}

function getPinyinDisplay(answer) {
  const variants = getPinyinVariants(answer);
  return variants.length ? variants.join(" / ") : String(answer || "").trim();
}

function normalizeUserPinyinInput(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!/[0-5]/.test(raw)) return "";
  return canonicalizePinyinValue(raw, { tonesRequired: true });
}

function checkPinyinAnswer(input, answer) {
  const guess = normalizeUserPinyinInput(input);
  const accepted = getPinyinVariants(answer);
  return {
    guess,
    accepted,
    formatValid: !!guess,
    correct: !!guess && accepted.includes(guess)
  };
}

function isPinyinQuizActive() {
  return state.mode !== "learn" && getQuizType() === "pinyin";
}

function isEditableField(target) {
  if (!target) return false;
  const tagName = String(target.tagName || "").toUpperCase();
  return target.isContentEditable || tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function shouldAutoFocusPinyinInput() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return true;
  return !window.matchMedia("(max-width: 760px)").matches;
}

function getPinyinInputPlaceholder() {
  return shouldAutoFocusPinyinInput()
    ? "ni3hao3 · use v for ü · use 5 for neutral"
    : "ni3hao3 · v=ü · 5=neutral";
}

function handlePinyinKeyboard(event) {
  if (!isPinyinQuizActive()) return;
  if (!getCurrentCard()) return;

  const target = event.target;
  const answerForm = target && typeof target.closest === "function" ? target.closest(".answer-form") : null;
  if (isEditableField(target) && !answerForm) return;

  if (event.key === "Enter") {
    if (!state.round.answered) return;
    event.preventDefault();
    nextCard();
    return;
  }

  if (event.key !== "ArrowRight") return;

  if (state.round.answered) {
    event.preventDefault();
    nextCard();
    return;
  }

  const input = answerForm && String(target.tagName || "").toUpperCase() === "INPUT"
    ? target
    : document.querySelector(".answer-form input");

  if (!input || !answerForm) return;

  const value = String(input.value || "");
  if (!value.trim()) return;

  const selectionStart = typeof input.selectionStart === "number" ? input.selectionStart : value.length;
  const selectionEnd = typeof input.selectionEnd === "number" ? input.selectionEnd : value.length;
  const cursorAtEnd = selectionStart === value.length && selectionEnd === value.length;

  if (target === input && !cursorAtEnd) return;

  event.preventDefault();
  submitPinyinAnswer({
    preventDefault() {},
    currentTarget: answerForm
  });
}

function clearCard(message = "Waiting for vocabulary", detail = "Built-in HSK 1 loads automatically on first open.") {
  elements.cardPrompt.textContent = message;
  elements.cardHanzi.textContent = "—";
  elements.cardPinyin.textContent = detail;
  elements.cardTranslation.textContent = "";
  elements.resultText.textContent = "";
  elements.resultText.className = "result";
  elements.answerArea.innerHTML = "";
  elements.controls.innerHTML = "";
  elements.positionLabel.textContent = "0 / 0";
}

function createButton(label, onClick, className = "") {
  const button = document.createElement("button");
  button.textContent = label;
  if (className) button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function updateResult(text = "", resultClass = "") {
  elements.resultText.textContent = text;
  elements.resultText.className = `result${resultClass ? ` ${resultClass}` : ""}`;
}

function setPositionLabel(card, queueIndex, total) {
  elements.positionLabel.textContent = `${queueIndex + 1} / ${total} · #${card.index}`;
}

function renderLearn(card, queueIndex, total) {
  elements.cardPrompt.textContent = "Vocabulary";
  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = card.pinyin;
  elements.cardTranslation.textContent = card.translation;
  elements.answerArea.innerHTML = "";
  updateResult();
  setPositionLabel(card, queueIndex, total);

  markSeen(card);

  const prevBtn = createButton("Previous", prevCard, "secondary");
  const nextBtn = createButton("Next", nextCard);
  elements.controls.innerHTML = "";
  elements.controls.append(prevBtn, nextBtn);
}

function answerTranslation(option) {
  if (state.round.answered) return;

  const card = getCurrentCard();
  if (!card) return;

  const correct = !!option.correct;
  state.round.answered = true;
  state.round.selectedLabel = option.label;
  state.round.selectedCorrect = correct;
  state.round.resultText = correct
    ? `Correct. ${card.hanzi} = ${card.translation} (${card.pinyin})`
    : `Wrong. ${card.hanzi} = ${card.translation} (${card.pinyin})`;
  state.round.resultClass = correct ? "ok" : "bad";

  recordQuizResult(state.mode, "translation", correct ? "correct" : "wrong");
  render();
}

function renderTranslationQuiz(card, queueIndex, total) {
  const isPractice = state.mode === "practice";
  elements.cardPrompt.textContent = isPractice ? "Choose the English translation" : "Test: choose the English translation";
  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = state.round.answered ? card.pinyin : "";
  elements.cardTranslation.textContent = state.round.answered ? card.translation : "";
  setPositionLabel(card, queueIndex, total);

  if (!state.round.options.length) {
    state.round.options = buildTranslationOptions(state.mode);
  }

  updateResult(
    state.round.answered ? state.round.resultText : "Pick one option.",
    state.round.answered ? state.round.resultClass : ""
  );

  elements.answerArea.innerHTML = "";
  state.round.options.forEach((option) => {
    const optionButton = createButton(option.label, () => answerTranslation(option), "answer-btn");

    if (state.round.answered) {
      if (option.correct) optionButton.classList.add("correct");
      if (!option.correct && option.label === state.round.selectedLabel && !state.round.selectedCorrect) {
        optionButton.classList.add("wrong");
      }
      optionButton.disabled = true;
    }

    elements.answerArea.appendChild(optionButton);
  });

  elements.controls.innerHTML = "";
  const prevBtn = createButton("Previous", prevCard, "secondary");
  const skipLabel = state.round.answered ? "Next" : "Skip";
  const nextBtn = createButton(skipLabel, nextCard, state.round.answered ? "" : "secondary");
  elements.controls.append(prevBtn, nextBtn);
}

function submitPinyinAnswer(event) {
  event.preventDefault();
  if (state.round.answered) return;

  const card = getCurrentCard();
  if (!card) return;

  const form = event.currentTarget;
  const input = form.querySelector("input");
  const answerText = input ? input.value : "";
  const reviewAnswer = getPinyinDisplay(card.pinyin);
  const reviewOriginal = String(card.pinyin || "").trim();
  const reviewSuffix = reviewOriginal && reviewOriginal !== reviewAnswer ? ` (${reviewOriginal})` : "";
  const check = checkPinyinAnswer(answerText, card.pinyin);

  state.round.answerText = answerText;
  state.round.answered = true;
  state.round.selectedCorrect = check.correct;

  if (!check.formatValid) {
    state.round.resultText = `Use tone numbers for every syllable. Example: ni3hao3, lv4, xie4xie5. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
    state.round.resultClass = "bad";
  } else {
    state.round.resultText = check.correct
      ? `Correct. ${card.hanzi} = ${reviewAnswer}`
      : `Wrong. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
    state.round.resultClass = check.correct ? "ok" : "bad";
  }

  recordQuizResult(state.mode, "pinyin", check.correct ? "correct" : "wrong");
  render();
}


function renderPinyinQuiz(card, queueIndex, total) {
  const isPractice = state.mode === "practice";
  const reviewAnswer = getPinyinDisplay(card.pinyin);
  const reviewOriginal = String(card.pinyin || "").trim();
  const reviewText = reviewOriginal && reviewOriginal !== reviewAnswer
    ? `${reviewAnswer} · ${reviewOriginal}`
    : reviewAnswer;

  elements.cardPrompt.textContent = isPractice
    ? "Type the pinyin with tone numbers"
    : "Test: type the pinyin with tone numbers";
  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = state.round.answered ? reviewText : "";
  elements.cardTranslation.textContent = state.round.answered ? card.translation : "";
  setPositionLabel(card, queueIndex, total);

  updateResult(
    state.round.answered
      ? state.round.resultText
      : "Use tone numbers. Example: ni3hao3, lv4, xie4xie5. Use v for ü and 5 for neutral tone.",
    state.round.answered ? state.round.resultClass : ""
  );

  elements.answerArea.innerHTML = "";

  const form = document.createElement("form");
  form.className = "answer-form";
  form.addEventListener("submit", submitPinyinAnswer);

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = getPinyinInputPlaceholder();
  input.value = state.round.answerText;
  input.autocomplete = "off";
  input.spellcheck = false;
  input.disabled = state.round.answered;


  const submitBtn = createButton(state.round.answered ? "Checked" : "Submit", () => {}, state.round.answered ? "secondary" : "");
  submitBtn.type = "submit";
  submitBtn.disabled = state.round.answered;

  form.append(input, submitBtn);
  elements.answerArea.appendChild(form);

  if (!state.round.answered && shouldAutoFocusPinyinInput()) {
    setTimeout(() => {
      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }
    }, 0);
  }

  elements.controls.innerHTML = "";
  const prevBtn = createButton("Previous", prevCard, "secondary");
  const skipLabel = state.round.answered ? "Next" : "Skip";
  const nextBtn = createButton(skipLabel, nextCard, state.round.answered ? "" : "secondary");
  elements.controls.append(prevBtn, nextBtn);
}

function renderOrderStatus() {
  const total = getOrderedIds().length;
  const modeLabel = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  const orderType = state.progress.orderType[state.mode] === "shuffled" ? "Shuffled" : "Sequential";
  const extra = state.mode === "learn" ? "" : ` · ${getQuizType() === "translation" ? "translation" : "pinyin"}`;

  elements.orderStatus.textContent = `${modeLabel}${extra}: ${orderType.toLowerCase()} order · ${total} active cards.`;
  elements.shuffleBtn.disabled = total < 2;
  elements.resetOrderBtn.disabled = total < 2 && state.progress.orderType[state.mode] !== "shuffled";
}

function renderSelectionSummary() {
  elements.selectionSummary.textContent = `Learn ${getModeCards("learn").length} · Practice ${getModeCards("practice").length} · Test ${getModeCards("test").length}`;
}

function updateCardMode(id, mode, checked) {
  const card = state.vocab.find((item) => cardId(item) === id);
  if (!card) return;

  card[mode] = checked;
  persistVocabulary();
  clampIndexes();
  resetRoundState();
  saveProgress();
  render();
}

function parseRangeText(text, maxIndex) {
  const indexes = new Set();
  const invalid = [];

  text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (/^\d+$/.test(part)) {
        const value = Number(part);
        if (value >= 1 && value <= maxIndex) {
          indexes.add(value);
        } else {
          invalid.push(part);
        }
        return;
      }

      const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (match) {
        let start = Number(match[1]);
        let end = Number(match[2]);
        if (start > end) [start, end] = [end, start];
        if (end < 1 || start > maxIndex) {
          invalid.push(part);
          return;
        }
        start = Math.max(start, 1);
        end = Math.min(end, maxIndex);
        for (let value = start; value <= end; value += 1) {
          indexes.add(value);
        }
        return;
      }

      invalid.push(part);
    });

  return { indexes, invalid };
}

function applyRangeToMode(mode, include) {
  if (!state.vocab.length) {
    elements.statusText.textContent = "Save vocabulary first.";
    return;
  }

  const inputElement = elements[`range${mode.charAt(0).toUpperCase() + mode.slice(1)}`];
  const raw = inputElement.value.trim();

  if (!raw) {
    elements.statusText.textContent = `Enter a range for ${mode}.`;
    return;
  }

  const { indexes, invalid } = parseRangeText(raw, state.vocab.length);
  if (!indexes.size) {
    elements.statusText.textContent = invalid.length
      ? `No valid indexes found. Ignored: ${invalid.join(", ")}`
      : "No valid indexes found.";
    return;
  }

  let changed = 0;
  state.vocab.forEach((card) => {
    if (indexes.has(card.index) && card[mode] !== include) {
      card[mode] = include;
      changed += 1;
    }
  });

  persistVocabulary();
  clampIndexes();
  resetRoundState();
  saveProgress();
  render();

  const actionLabel = include ? "added to" : "removed from";
  const suffix = invalid.length ? ` Ignored: ${invalid.join(", ")}.` : "";
  elements.statusText.textContent = `${changed} cards ${actionLabel} ${mode}.${suffix}`;
}

function setAllForMode(mode, value) {
  if (!state.vocab.length) {
    elements.statusText.textContent = "Save vocabulary first.";
    return;
  }

  let changed = 0;
  state.vocab.forEach((card) => {
    if (card[mode] !== value) {
      card[mode] = value;
      changed += 1;
    }
  });

  persistVocabulary();
  clampIndexes();
  resetRoundState();
  saveProgress();
  render();

  elements.statusText.textContent = value
    ? `${changed} cards added to ${mode}.`
    : `${changed} cards removed from ${mode}.`;
}

function renderManageList() {
  elements.manageList.innerHTML = "";

  if (!state.vocab.length) {
    const empty = document.createElement("div");
    empty.className = "manage-empty";
    empty.textContent = "Built-in HSK 1 should load automatically. Then you can choose Learn, Practice and Test by range or one card at a time.";
    elements.manageList.appendChild(empty);
    return;
  }

  const filter = state.filterText.trim().toLowerCase();
  const cards = !filter
    ? state.vocab
    : state.vocab.filter((card) => {
        const combined = `${card.index} ${card.hanzi} ${card.pinyin} ${card.translation}`.toLowerCase();
        return combined.includes(filter);
      });

  if (!cards.length) {
    const empty = document.createElement("div");
    empty.className = "manage-empty";
    empty.textContent = "No cards match this filter.";
    elements.manageList.appendChild(empty);
    return;
  }

  cards.forEach((card) => {
    const id = cardId(card);
    const row = document.createElement("div");
    row.className = "manage-row";

    const index = document.createElement("div");
    index.className = "manage-index";
    index.textContent = `#${card.index}`;

    const word = document.createElement("div");
    word.className = "manage-word";

    const title = document.createElement("strong");
    title.textContent = card.hanzi;

    const detail = document.createElement("span");
    detail.textContent = `${card.pinyin} · ${card.translation}`;

    word.append(title, detail);

    const flags = document.createElement("div");
    flags.className = "manage-flags";

    MODES.forEach((mode) => {
      const label = document.createElement("label");
      label.className = "tick";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!card[mode];
      input.addEventListener("change", () => updateCardMode(id, mode, input.checked));

      const text = document.createTextNode(mode.charAt(0).toUpperCase() + mode.slice(1));
      label.append(input, text);
      flags.appendChild(label);
    });

    row.append(index, word, flags);
    elements.manageList.appendChild(row);
  });
}

function render() {
  updateModeButtons();
  renderStats();
  renderSelectionSummary();
  renderManageList();
  renderOrderStatus();

  if (!state.vocab.length) {
    clearCard();
    return;
  }

  const modeCards = getOrderedCards();
  const total = modeCards.length;

  if (!total) {
    clearCard(`No cards selected for ${state.mode}`, "Use Card setup to add cards to this mode.");
    return;
  }

  const card = getCurrentCard();
  const queueIndex = getCurrentIndex();

  if (!card) {
    clearCard();
    return;
  }

  if (state.mode === "learn") {
    renderLearn(card, queueIndex, total);
    renderStats();
    return;
  }

  if (getQuizType() === "translation") {
    renderTranslationQuiz(card, queueIndex, total);
    return;
  }

  renderPinyinQuiz(card, queueIndex, total);
}

function handleSaveVocabulary() {
  const rawText = elements.vocabInput.value.trim();
  if (!rawText) {
    elements.statusText.textContent = "Paste a CSV first, or use Restore built-in HSK 1.";
    return;
  }

  const rows = parseCSV(rawText);
  const cards = mapRowsToCards(rows);

  if (!cards.length) {
    elements.statusText.textContent = "Could not find valid rows. Expected hanzi, pinyin and translation.";
    return;
  }

  saveVocabulary(cards);
  elements.statusText.textContent = `${cards.length} cards saved locally.`;
  render();
}

function handleResetProgress() {
  const keptQuizType = { ...state.progress.quizType };
  state.progress = createEmptyProgress();
  state.progress.quizType = keptQuizType;
  resetRoundState();
  saveProgress();
  elements.statusText.textContent = "Progress reset. Vocabulary and card setup kept.";
  render();
}

function setMode(mode) {
  state.mode = mode;
  resetRoundState();
  saveProgress();
  render();
}

function setQuizTypeForCurrentMode(quizType) {
  if (state.mode === "learn") return;
  if (!QUIZ_TYPES.includes(quizType)) return;

  state.progress.quizType[state.mode] = quizType;
  resetRoundState();
  saveProgress();
  render();
}

function shuffleCurrentMode() {
  const ids = getOrderedIds();
  if (ids.length < 2) return;
  state.progress.order[state.mode] = shuffle(ids);
  state.progress.orderType[state.mode] = "shuffled";
  state.progress.index[state.mode] = 0;
  resetRoundState();
  saveProgress();
  render();
}

function resetCurrentModeOrder() {
  state.progress.order[state.mode] = getModeIds(state.mode);
  state.progress.orderType[state.mode] = "default";
  state.progress.index[state.mode] = 0;
  resetRoundState();
  saveProgress();
  render();
}

function handleRangeButtonClick(event) {
  const button = event.currentTarget;
  const mode = button.dataset.rangeMode;
  const action = button.dataset.rangeAction;

  if (!MODES.includes(mode)) return;

  if (action === "add") {
    applyRangeToMode(mode, true);
    return;
  }

  if (action === "remove") {
    applyRangeToMode(mode, false);
    return;
  }

  if (action === "all") {
    setAllForMode(mode, true);
    return;
  }

  if (action === "none") {
    setAllForMode(mode, false);
  }
}

function bindEvents() {
  elements.saveVocabBtn.addEventListener("click", handleSaveVocabulary);

  elements.loadPlaceholderBtn.addEventListener("click", restoreBuiltInVocabulary);

  elements.resetProgressBtn.addEventListener("click", handleResetProgress);
  elements.shuffleBtn.addEventListener("click", shuffleCurrentMode);
  elements.resetOrderBtn.addEventListener("click", resetCurrentModeOrder);

  elements.filterInput.addEventListener("input", (event) => {
    state.filterText = event.target.value || "";
    renderManageList();
  });

  elements.modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.mode));
  });

  elements.quizTypeButtons.forEach((button) => {
    button.addEventListener("click", () => setQuizTypeForCurrentMode(button.dataset.quiz));
  });

  elements.rangeButtons.forEach((button) => {
    button.addEventListener("click", handleRangeButtonClick);
  });

  window.addEventListener("keydown", handlePinyinKeyboard);
}

loadFromStorage();
bindEvents();
render();
