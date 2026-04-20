const STORAGE_KEYS = {
  vocab: "hsk_flashcards_vocab",
  progress: "hsk_flashcards_progress",
  mode: "hsk_flashcards_mode",
  setupCollapsed: "hsk_flashcards_setup_collapsed"
};

const BUILTIN_CARDS = Array.isArray(window.HSK1_BUILTIN_CARDS) ? window.HSK1_BUILTIN_CARDS : [];

const MODES = ["learn", "practice", "test"];
const PRACTICE_QUIZ_TYPES = ["translation", "pinyin", "smart"];
const TEST_QUIZ_TYPES = ["translation", "pinyin"];
const QUIZ_TYPES = [...new Set([...PRACTICE_QUIZ_TYPES, ...TEST_QUIZ_TYPES])];

const SMART_BOX_INTERVAL_FACTORS = [0.03, 0.12, 0.4, 1.2, 3, 8];
const SMART_MAX_BOX = SMART_BOX_INTERVAL_FACTORS.length - 1;
const SMART_ERROR_DEBT_PER_WRONG = 3;
const SMART_ERROR_DEBT_DECAY_PER_CORRECT = 1;
const SMART_ERROR_DEBT_WEIGHT = 15;
const SMART_TOTAL_WRONG_WEIGHT = 3;
const SMART_NO_CORRECT_BONUS = 30;
const SMART_CORRECT_STREAK_PENALTY = 8;
const SMART_OVERDUE_WEIGHT_CAP = 8;

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
  setupCollapsed: true,
  manageListDirty: true,
  round: createEmptyRound()
};

const elements = {
  vocabInput: document.getElementById("vocabInput"),
  saveVocabBtn: document.getElementById("saveVocabBtn"),
  loadPlaceholderBtn: document.getElementById("loadPlaceholderBtn"),
  resetProgressBtn: document.getElementById("resetProgressBtn"),
  exportProgressBtn: document.getElementById("exportProgressBtn"),
  importProgressBtn: document.getElementById("importProgressBtn"),
  importProgressInput: document.getElementById("importProgressInput"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetOrderBtn: document.getElementById("resetOrderBtn"),
  filterInput: document.getElementById("filterInput"),
  manageList: document.getElementById("manageList"),
  selectionSummary: document.getElementById("selectionSummary"),
  setupToggleBtn: document.getElementById("setupToggleBtn"),
  setupBody: document.getElementById("setupBody"),
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
  statPracticeTranslationShown: document.getElementById("statPracticeTranslationShown"),
  statPracticeTranslationCW: document.getElementById("statPracticeTranslationCW"),
  statPracticePinyinShown: document.getElementById("statPracticePinyinShown"),
  statPracticePinyinCW: document.getElementById("statPracticePinyinCW"),
  statPracticeSmartShown: document.getElementById("statPracticeSmartShown"),
  statPracticeSmartCW: document.getElementById("statPracticeSmartCW"),
  cardStats: document.getElementById("cardStats"),
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
    pendingWrong: false,
    pendingCheck: null,
    options: [],
    selectedLabel: "",
    selectedCorrect: false,
    answerText: "",
    resultText: "",
    resultClass: "",
    appearanceKey: "",
    appearanceMode: "",
    appearanceQuizType: "",
    appearanceCardId: "",
    appearanceCounted: false,
    smartCardId: "",
    smartStage: "pinyin",
    smartPinyinCorrect: null,
    smartTranslationCorrect: null,
    keyboardChoiceIndex: -1
  };
}

function createEmptyProgress() {
  return {
    seen: {},
    practice: {
      translation: {},
      pinyin: {},
      smart: {},
      smartStep: 0,
      smartLastId: ""
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

    const correct = Math.max(0, Number(entry.correct) || 0);
    const wrong = Math.max(0, Number(entry.wrong) || 0);
    let shown = Number(entry.shown);

    if (!Number.isFinite(shown)) {
      shown = correct + wrong;
    }

    shown = Math.max(0, Math.floor(shown));

    output[id] = {
      shown,
      correct,
      wrong
    };
  });

  return output;
}

function normalizeSmartBucket(bucket) {
  const output = {};
  if (!bucket || typeof bucket !== "object") return output;

  Object.entries(bucket).forEach(([id, entry]) => {
    if (!entry || typeof entry !== "object") return;

    const correct = Math.max(0, Number(entry.correct) || 0);
    const wrong = Math.max(0, Number(entry.wrong) || 0);
    let shown = Number(entry.shown);

    if (!Number.isFinite(shown)) {
      shown = correct + wrong;
    }

    const legacyRepetitions = Math.max(0, Math.floor(Number(entry.repetitions) || 0));
    const importedBox = Number(entry.box);
    const box = Number.isFinite(importedBox)
      ? Math.min(SMART_MAX_BOX, Math.max(0, Math.floor(importedBox)))
      : Math.min(SMART_MAX_BOX, legacyRepetitions);

    const importedErrorDebt = Number(entry.errorDebt);
    const errorDebt = Number.isFinite(importedErrorDebt)
      ? Math.max(0, Math.floor(importedErrorDebt))
      : Math.min(60, wrong * SMART_ERROR_DEBT_PER_WRONG);

    const importedCorrectStreak = Number(entry.correctStreak);
    const correctStreak = Number.isFinite(importedCorrectStreak)
      ? Math.max(0, Math.floor(importedCorrectStreak))
      : (wrong === 0 ? correct : 0);

    output[id] = {
      shown: Math.max(0, Math.floor(shown)),
      correct,
      wrong,
      box,
      errorDebt,
      correctStreak,
      repetitions: legacyRepetitions,
      interval: Math.max(0, Math.floor(Number(entry.interval) || 0)),
      ef: Math.max(1.3, Number(entry.ef) || 2.5),
      dueStep: Math.max(0, Math.floor(Number(entry.dueStep) || 0))
    };
  });

  return output;
}

function normalizePracticeProgress(bucket) {
  if (!bucket || typeof bucket !== "object") {
    return {
      translation: {},
      pinyin: {},
      smart: {},
      smartStep: 0,
      smartLastId: ""
    };
  }

  if (bucket.translation || bucket.pinyin || bucket.smart || Number.isFinite(bucket.smartStep) || typeof bucket.smartLastId === "string") {
    return {
      translation: normalizeScoreBucket(bucket.translation),
      pinyin: normalizeScoreBucket(bucket.pinyin),
      smart: normalizeSmartBucket(bucket.smart),
      smartStep: Math.max(0, Math.floor(Number(bucket.smartStep) || 0)),
      smartLastId: String(bucket.smartLastId || "")
    };
  }

  return {
    translation: normalizeScoreBucket(bucket),
    pinyin: {},
    smart: {},
    smartStep: 0,
    smartLastId: ""
  };
}

function normalizeTestProgress(bucket) {
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
    practice: normalizePracticeProgress(progress.practice),
    test: normalizeTestProgress(progress.test),
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
      practice: PRACTICE_QUIZ_TYPES.includes(progress.quizType?.practice) ? progress.quizType.practice : "translation",
      test: TEST_QUIZ_TYPES.includes(progress.quizType?.test) ? progress.quizType.test : "translation"
    }
  };
}

function loadFromStorage() {
  try {
    const savedVocab = JSON.parse(localStorage.getItem(STORAGE_KEYS.vocab) || "[]");
    const savedProgress = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || "null");
    const savedMode = localStorage.getItem(STORAGE_KEYS.mode);
    const savedSetupCollapsed = localStorage.getItem(STORAGE_KEYS.setupCollapsed);

    const vocabArray = Array.isArray(savedVocab) ? savedVocab : [];
    state.vocab = vocabArray
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => card.hanzi && card.pinyin && card.translation);

    state.progress = normalizeProgress(savedProgress);
    state.mode = MODES.includes(savedMode) ? savedMode : "learn";
    state.setupCollapsed = savedSetupCollapsed === null ? true : savedSetupCollapsed === "true";

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

function markManageListDirty() {
  state.manageListDirty = true;
}

function renderSetupPanel() {
  if (!elements.setupBody || !elements.setupToggleBtn) return;
  elements.setupBody.classList.toggle("hidden", state.setupCollapsed);
  elements.setupToggleBtn.textContent = state.setupCollapsed ? "Show setup" : "Hide setup";
  elements.setupToggleBtn.setAttribute("aria-expanded", String(!state.setupCollapsed));
}

function renderManageListIfNeeded(force = false) {
  if (state.setupCollapsed) return;
  if (!force && !state.manageListDirty) return;
  renderManageList();
  state.manageListDirty = false;
}

function toggleSetupPanel() {
  state.setupCollapsed = !state.setupCollapsed;
  localStorage.setItem(STORAGE_KEYS.setupCollapsed, String(state.setupCollapsed));
  if (!state.setupCollapsed) markManageListDirty();
  render();
}

function buildProgressExportPayload() {
  return {
    app: "hsk_flashcards",
    version: 2,
    exportedAt: new Date().toISOString(),
    progress: state.progress
  };
}

function triggerTextDownload(filename, text, mimeType = "application/json") {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleExportProgress() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const json = JSON.stringify(buildProgressExportPayload(), null, 2);
  triggerTextDownload(`hsk-flashcards-progress-${stamp}.json`, json);
  elements.statusText.textContent = "Progress exported as JSON.";
}

function handleImportProgressClick() {
  if (!elements.importProgressInput) return;
  elements.importProgressInput.value = "";
  elements.importProgressInput.click();
}

function handleImportProgressFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || ""));
      const importedProgress = normalizeProgress(parsed && typeof parsed === "object" && parsed.progress ? parsed.progress : parsed);
      state.progress = importedProgress;
      resetRoundState();
      markManageListDirty();
      saveProgress();
      elements.statusText.textContent = `Progress imported from ${file.name}.`;
      render();
    } catch (error) {
      elements.statusText.textContent = "Could not import progress JSON.";
    }
  };
  reader.onerror = () => {
    elements.statusText.textContent = "Could not read the selected JSON file.";
  };
  reader.readAsText(file);
}

function saveVocabulary(cards) {
  state.vocab = cards.map((card, index) => normalizeCard(card, index + 1));
  state.progress = createEmptyProgress();
  state.mode = "learn";
  resetRoundState();
  markManageListDirty();

  persistVocabulary();
  saveProgress();
}

function getCardMatchKey(card) {
  return `${String(card.hanzi || "").trim()}__${String(card.pinyin || "").trim().toLowerCase()}`;
}

function buildCardMatchQueues(cards) {
  const queues = new Map();

  cards.forEach((card) => {
    const key = getCardMatchKey(card);
    if (!key.trim()) return;
    if (!queues.has(key)) queues.set(key, []);
    queues.get(key).push(card);
  });

  return queues;
}

function filterObjectByValidIds(bucket, validIds) {
  const output = {};

  Object.entries(bucket || {}).forEach(([id, value]) => {
    if (validIds.has(id)) output[id] = value;
  });

  return output;
}

function pruneProgressForValidCards(validIds) {
  state.progress.seen = filterObjectByValidIds(state.progress.seen, validIds);

  state.progress.practice.translation = filterObjectByValidIds(state.progress.practice.translation, validIds);
  state.progress.practice.pinyin = filterObjectByValidIds(state.progress.practice.pinyin, validIds);
  state.progress.practice.smart = filterObjectByValidIds(state.progress.practice.smart, validIds);

  state.progress.test.translation = filterObjectByValidIds(state.progress.test.translation, validIds);
  state.progress.test.pinyin = filterObjectByValidIds(state.progress.test.pinyin, validIds);

  MODES.forEach((mode) => {
    state.progress.order[mode] = (state.progress.order[mode] || []).filter((id) => validIds.has(id));
  });

  if (!validIds.has(state.progress.practice.smartLastId)) {
    state.progress.practice.smartLastId = "";
  }
}

function restoreVocabularyPreservingProgress(cards) {
  const previousQueues = buildCardMatchQueues(state.vocab);
  let preservedCount = 0;

  state.vocab = cards.map((card, index) => {
    const nextCard = normalizeCard(card, index + 1);
    const key = getCardMatchKey(nextCard);
    const queue = previousQueues.get(key);
    const previousCard = queue && queue.length ? queue.shift() : null;

    if (previousCard) {
      nextCard.id = cardId(previousCard);
      nextCard.learn = previousCard.learn !== false;
      nextCard.practice = previousCard.practice !== false;
      nextCard.test = previousCard.test !== false;
      preservedCount += 1;
    }

    return nextCard;
  });

  state.progress = normalizeProgress(state.progress);
  pruneProgressForValidCards(new Set(state.vocab.map((card) => cardId(card))));
  resetRoundState();
  markManageListDirty();

  persistVocabulary();
  saveProgress();

  return preservedCount;
}

function restoreBuiltInVocabulary() {
  const builtInCards = getBuiltInCards();
  if (!builtInCards.length) {
    elements.statusText.textContent = "Built-in HSK 1 list not found.";
    return;
  }

  const preservedCount = restoreVocabularyPreservingProgress(builtInCards);
  elements.vocabInput.value = "";
  elements.statusText.textContent = `${builtInCards.length} built-in cards restored. Progress and selections preserved for ${preservedCount} matching cards.`;
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

function getCardById(id) {
  return state.vocab.find((card) => cardId(card) === id) || null;
}

function getAllowedQuizTypes(mode = state.mode) {
  if (mode === "practice") return PRACTICE_QUIZ_TYPES;
  if (mode === "test") return TEST_QUIZ_TYPES;
  return [];
}

function getQuizType(mode = state.mode) {
  if (mode === "learn") return null;
  const current = state.progress.quizType[mode] || "translation";
  return getAllowedQuizTypes(mode).includes(current) ? current : "translation";
}

function isSmartPracticeActive(mode = state.mode, quizType = getQuizType(mode)) {
  return mode === "practice" && quizType === "smart";
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

function createSmartEntry() {
  return {
    shown: 0,
    correct: 0,
    wrong: 0,
    box: 0,
    errorDebt: 0,
    correctStreak: 0,
    repetitions: 0,
    interval: 0,
    ef: 2.5,
    dueStep: 0
  };
}

function getSmartEntry(cardOrId) {
  const id = typeof cardOrId === "string" ? cardOrId : cardId(cardOrId);
  const stored = state.progress.practice?.smart?.[id];
  if (!stored || typeof stored !== "object") {
    return createSmartEntry();
  }

  const legacyRepetitions = Math.max(0, Math.floor(Number(stored.repetitions) || 0));
  const importedBox = Number(stored.box);
  const wrong = Math.max(0, Number(stored.wrong) || 0);
  const correct = Math.max(0, Number(stored.correct) || 0);

  const box = Number.isFinite(importedBox)
    ? clampSmartBox(importedBox)
    : Math.min(SMART_MAX_BOX, legacyRepetitions);

  const importedErrorDebt = Number(stored.errorDebt);
  const errorDebt = Number.isFinite(importedErrorDebt)
    ? Math.max(0, Math.floor(importedErrorDebt))
    : Math.min(60, wrong * SMART_ERROR_DEBT_PER_WRONG);

  const importedCorrectStreak = Number(stored.correctStreak);
  const correctStreak = Number.isFinite(importedCorrectStreak)
    ? Math.max(0, Math.floor(importedCorrectStreak))
    : (wrong === 0 ? correct : 0);

  return {
    shown: Math.max(0, Number(stored.shown) || 0),
    correct,
    wrong,
    box,
    errorDebt,
    correctStreak,
    repetitions: legacyRepetitions,
    interval: Math.max(0, Math.floor(Number(stored.interval) || 0)),
    ef: Math.max(1.3, Number(stored.ef) || 2.5),
    dueStep: Math.max(0, Math.floor(Number(stored.dueStep) || 0))
  };
}

function getSmartCurrentCard() {
  if (!isSmartPracticeActive()) return null;

  const activeIds = new Set(getModeIds("practice"));
  if (state.round.smartCardId && activeIds.has(state.round.smartCardId)) {
    return getCardById(state.round.smartCardId);
  }

  const picked = pickNextSmartCard();
  if (!picked) return null;

  state.round.smartCardId = cardId(picked);
  return picked;
}

function getCurrentCard() {
  if (isSmartPracticeActive()) {
    return getSmartCurrentCard();
  }

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
  let shown = 0;
  let correct = 0;
  let wrong = 0;
  let touched = 0;

  Object.entries(bucket).forEach(([id, entry]) => {
    if (!activeIds.has(id)) return;
    touched += 1;
    shown += entry.shown || 0;
    correct += entry.correct || 0;
    wrong += entry.wrong || 0;
  });

  return { shown, correct, wrong, touched, answered: correct + wrong };
}

function getModeTouchedAcrossTypes(mode) {
  if (mode === "learn") return getSeenCount();

  const activeIds = new Set(getModeIds(mode));
  const translationIds = Object.keys(state.progress[mode]?.translation || {});
  const pinyinIds = Object.keys(state.progress[mode]?.pinyin || {});
  const smartIds = mode === "practice" ? Object.keys(state.progress.practice?.smart || {}) : [];
  const union = new Set([...translationIds, ...pinyinIds, ...smartIds].filter((id) => activeIds.has(id)));
  return union.size;
}

function getPracticeCardStats(card) {
  if (!card) {
    return {
      translation: { shown: 0, correct: 0, wrong: 0 },
      pinyin: { shown: 0, correct: 0, wrong: 0 },
      smart: { shown: 0, correct: 0, wrong: 0, box: 0, errorDebt: 0, correctStreak: 0, repetitions: 0, interval: 0, ef: 2.5, dueStep: 0 }
    };
  }

  const id = cardId(card);
  return {
    translation: state.progress.practice?.translation?.[id] || { shown: 0, correct: 0, wrong: 0 },
    pinyin: state.progress.practice?.pinyin?.[id] || { shown: 0, correct: 0, wrong: 0 },
    smart: getSmartEntry(id)
  };
}

function getPracticeCardSummaryText(card) {
  const stats = getPracticeCardStats(card);
  return {
    translation: `T: ${stats.translation.shown} seen · ${stats.translation.correct}✓ · ${stats.translation.wrong}✗`,
    pinyin: `P: ${stats.pinyin.shown} seen · ${stats.pinyin.correct}✓ · ${stats.pinyin.wrong}✗`,
    smart: `S: ${stats.smart.shown} seen · ${stats.smart.correct}✓ · ${stats.smart.wrong}✗`
  };
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
  const practiceSmartTotals = getModeTotals("practice", "smart");

  elements.statTotal.textContent = String(total);
  elements.statSeen.textContent = String(seen);
  elements.statPracticeTranslationShown.textContent = String(practiceTranslationTotals.shown);
  elements.statPracticeTranslationCW.textContent = `${practiceTranslationTotals.correct} / ${practiceTranslationTotals.wrong}`;
  elements.statPracticePinyinShown.textContent = String(practicePinyinTotals.shown);
  elements.statPracticePinyinCW.textContent = `${practicePinyinTotals.correct} / ${practicePinyinTotals.wrong}`;
  if (elements.statPracticeSmartShown) elements.statPracticeSmartShown.textContent = String(practiceSmartTotals.shown);
  if (elements.statPracticeSmartCW) elements.statPracticeSmartCW.textContent = `${practiceSmartTotals.correct} / ${practiceSmartTotals.wrong}`;

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

  elements.quizTypeButtons.forEach((button) => {
    const isAllowed = getAllowedQuizTypes(state.mode).includes(button.dataset.quiz);
    button.classList.toggle("hidden", !isAllowed);
    button.classList.toggle("active", button.dataset.quiz === quizType);
  });

  if (quizType === "translation") {
    elements.quizLabel.textContent = "Translation · MCQ";
  } else if (quizType === "pinyin") {
    elements.quizLabel.textContent = "Pinyin · typed";
  } else {
    elements.quizLabel.textContent = "Smart practice · pinyin + translation";
  }
}

function resetRoundState() {
  state.round = createEmptyRound();
}

function prepareRoundAppearance(mode, quizType, card) {
  if (!card) return;

  const id = cardId(card);
  const key = `${mode}:${quizType || "study"}:${id}`;
  if (state.round.appearanceKey === key) return;

  state.round.appearanceKey = key;
  state.round.appearanceMode = mode;
  state.round.appearanceQuizType = quizType || "";
  state.round.appearanceCardId = id;
  state.round.appearanceCounted = false;
}

function markSeenById(id) {
  if (!id) return;
  state.progress.seen[id] = true;
}

function recordQuizResult(mode, quizType, result) {
  const card = getCurrentCard();
  if (!card) return;

  const id = cardId(card);
  const bucket = state.progress[mode]?.[quizType];
  if (!bucket) return;

  const entry = bucket[id] || { shown: 0, correct: 0, wrong: 0 };
  entry[result] += 1;
  bucket[id] = entry;
  saveProgress();
}

function recordCardAppearanceById(mode, quizType, id) {
  if (!id) return false;

  if (mode === "learn") {
    markSeenById(id);
    return true;
  }

  const bucket = state.progress[mode]?.[quizType];
  if (!bucket) return false;

  const entry = bucket[id] || { shown: 0, correct: 0, wrong: 0 };
  entry.shown = (entry.shown || 0) + 1;
  bucket[id] = entry;
  return true;
}

function finalizeRoundAppearance({ save = false } = {}) {
  if (!state.round.appearanceKey || state.round.appearanceCounted) return false;

  const changed = recordCardAppearanceById(
    state.round.appearanceMode,
    state.round.appearanceQuizType,
    state.round.appearanceCardId
  );

  if (!changed) return false;

  state.round.appearanceCounted = true;
  if (save) saveProgress();
  return true;
}

function moveInOrderedMode(step, { countAppearance = true } = {}) {
  const total = getOrderedIds().length;
  if (!total) return;
  if (countAppearance) finalizeRoundAppearance();

  const current = state.progress.index[state.mode] || 0;
  const next = step > 0
    ? (current >= total - 1 ? 0 : current + 1)
    : (current <= 0 ? total - 1 : current - 1);

  state.progress.index[state.mode] = next;
  resetRoundState();
  saveProgress();
  render();
}

function nextCard(options = {}) {
  if (isSmartPracticeActive()) {
    return nextSmartCard(options);
  }

  moveInOrderedMode(1, options);
}

function prevCard(options = {}) {
  if (isSmartPracticeActive()) return;
  moveInOrderedMode(-1, options);
}

function clampSmartBox(box) {
  return Math.min(SMART_MAX_BOX, Math.max(0, Math.floor(Number(box) || 0)));
}

function getSmartActiveCount() {
  return Math.max(1, getModeCards("practice").length);
}

function getSmartCorrectInterval(box, activeCount) {
  const factor = SMART_BOX_INTERVAL_FACTORS[clampSmartBox(box)] || SMART_BOX_INTERVAL_FACTORS[0];
  return Math.max(2, Math.round(Math.max(1, activeCount) * factor));
}

function getSmartWrongInterval(activeCount) {
  return Math.max(2, Math.round(Math.max(1, activeCount) * 0.01));
}

function applySmartReviewResult(entry, correct, stepAfterReview, activeCount) {
  const updated = { ...entry };
  const currentBox = clampSmartBox(updated.box);
  const currentDebt = Math.max(0, Math.floor(Number(updated.errorDebt) || 0));

  if (correct) {
    updated.correctStreak = Math.max(0, Math.floor(Number(updated.correctStreak) || 0)) + 1;
    updated.errorDebt = Math.max(0, currentDebt - SMART_ERROR_DEBT_DECAY_PER_CORRECT);
    updated.box = clampSmartBox(currentBox + 1);
    updated.repetitions = Math.max(0, Math.floor(Number(updated.repetitions) || 0)) + 1;
    updated.interval = getSmartCorrectInterval(updated.box, activeCount);
  } else {
    updated.correctStreak = 0;
    updated.errorDebt = currentDebt + SMART_ERROR_DEBT_PER_WRONG;
    updated.box = clampSmartBox(currentBox - 2);
    updated.repetitions = 0;
    updated.interval = getSmartWrongInterval(activeCount);
  }

  updated.dueStep = stepAfterReview + updated.interval;
  return updated;
}

function recordSmartPracticeOutcome(card, correct) {
  if (!card) return;

  const id = cardId(card);
  const bucket = state.progress.practice.smart;
  const current = getSmartEntry(id);
  current[correct ? "correct" : "wrong"] += 1;

  const nextStep = (state.progress.practice.smartStep || 0) + 1;
  const updated = applySmartReviewResult(current, correct, nextStep, getSmartActiveCount());

  bucket[id] = updated;
  state.progress.practice.smartStep = nextStep;
  state.progress.practice.smartLastId = id;
  saveProgress();
}

function weightedPick(items, weightFn) {
  const weighted = items.map((item) => ({ item, weight: Math.max(0, Number(weightFn(item)) || 0) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return items[0] || null;

  let threshold = Math.random() * total;
  for (const entry of weighted) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.item;
  }

  return weighted[weighted.length - 1]?.item || null;
}

function getSmartCardWeight(card, step, activeCount) {
  const entry = getSmartEntry(card);
  const overdue = Math.max(0, step - entry.dueStep);
  const scale = Math.max(10, activeCount * 0.05);
  const overdueWeight = Math.min(
    SMART_OVERDUE_WEIGHT_CAP,
    Math.log2(1 + overdue / scale)
  );

  const noCorrectBonus = entry.correct === 0 ? SMART_NO_CORRECT_BONUS : 0;
  const errorDebtWeight = (entry.errorDebt || 0) * SMART_ERROR_DEBT_WEIGHT;
  const wrongWeight = (entry.wrong || 0) * SMART_TOTAL_WRONG_WEIGHT;
  const successPenalty = (entry.correctStreak || 0) * SMART_CORRECT_STREAK_PENALTY;

  return Math.max(
    0.1,
    1 + noCorrectBonus + errorDebtWeight + wrongWeight + overdueWeight - successPenalty
  );
}

function pickNextSmartCard() {
  const cards = getModeCards("practice");
  if (!cards.length) return null;

  const step = state.progress.practice.smartStep || 0;
  const activeCount = Math.max(1, cards.length);
  const lastId = state.progress.practice.smartLastId || "";
  let candidates = cards.filter((card) => getSmartEntry(card).dueStep <= step);

  if (!candidates.length) {
    const sorted = [...cards].sort((a, b) => getSmartEntry(a).dueStep - getSmartEntry(b).dueStep);
    const minDue = getSmartEntry(sorted[0]).dueStep;
    candidates = sorted.filter((card) => getSmartEntry(card).dueStep === minDue);
  }

  if (candidates.length > 1 && lastId) {
    const filtered = candidates.filter((card) => cardId(card) !== lastId);
    if (filtered.length) candidates = filtered;
  }

  if (candidates.length <= 1) {
    return candidates[0] || null;
  }

  return weightedPick(candidates, (card) => getSmartCardWeight(card, step, activeCount));
}

function nextSmartCard({ countAppearance = true } = {}) {
  if (countAppearance) finalizeRoundAppearance();
  if (state.round.smartCardId) {
    state.progress.practice.smartLastId = state.round.smartCardId;
  }
  resetRoundState();
  saveProgress();
  render();
}

function renderCurrentCardStats(card) {
  if (!elements.cardStats) return;
  elements.cardStats.innerHTML = "";

  if (!card) return;

  const stats = getPracticeCardStats(card);
  const hasAnyPractice = stats.translation.shown > 0 || stats.pinyin.shown > 0 || stats.smart.shown > 0;
  if (state.mode !== "practice" && !hasAnyPractice) return;

  const summary = getPracticeCardSummaryText(card);
  [summary.translation, summary.pinyin, summary.smart].forEach((text) => {
    const chip = document.createElement("span");
    chip.className = "badge subtle";
    chip.textContent = `Practice · ${text}`;
    elements.cardStats.appendChild(chip);
  });
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildTranslationOptionsForCard(card, mode = state.mode) {
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

function buildTranslationOptions(mode = state.mode) {
  return buildTranslationOptionsForCard(getCurrentCard(), mode);
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

function parseAnnotatedPinyinParts(annotated, { tonesRequired = false } = {}) {
  const text = String(annotated || "");
  const letters = text.replace(/[1-5]/g, "");
  if (!letters) return [];

  const syllables = segmentPinyinLetters(letters);
  if (!syllables || !syllables.length) return null;

  const output = [];
  let cursor = 0;

  for (const syllable of syllables) {
    let lettersSeen = "";
    const toneDigits = [];

    while (cursor < text.length && lettersSeen.length < syllable.length) {
      const char = text[cursor];

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

    while (cursor < text.length && /[1-5]/.test(text[cursor])) {
      toneDigits.push(text[cursor]);
      cursor += 1;
    }

    if (lettersSeen !== syllable) return null;

    const explicitTone = toneDigits.length > 0;
    let tone = explicitTone ? toneDigits[toneDigits.length - 1] : "";

    if (!tone) {
      if (tonesRequired) return null;
      tone = "5";
    }

    output.push({
      syllable,
      tone,
      explicitTone,
      canonical: `${syllable}${tone}`
    });
  }

  while (cursor < text.length && /[1-5]/.test(text[cursor])) {
    cursor += 1;
  }

  if (cursor !== text.length) return null;
  return output;
}

function canonicalizeAnnotatedPinyin(annotated, options = {}) {
  const parts = parseAnnotatedPinyinParts(annotated, options);
  if (!parts || !parts.length) return "";
  return parts.map((part) => part.canonical).join("");
}

function parseCanonicalPinyin(canonical) {
  const text = String(canonical || "");
  if (!text) return [];

  const parts = text.match(/[a-z]+[1-5]/g);
  if (!parts || parts.join("") !== text) return null;

  return parts.map((part) => ({
    syllable: part.slice(0, -1),
    tone: part.slice(-1),
    canonical: part
  }));
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
  if (!raw) {
    return { raw: "", annotated: "", parts: null, canonical: "" };
  }

  const annotated = toAnnotatedPinyin(raw);
  const parts = parseAnnotatedPinyinParts(annotated, { tonesRequired: false });

  return {
    raw,
    annotated,
    parts,
    canonical: parts ? parts.map((part) => part.canonical).join("") : ""
  };
}

function allowsOnlyNeutralToneOmission(guessParts, acceptedPartsList) {
  if (!Array.isArray(guessParts) || !guessParts.length) return false;

  return acceptedPartsList.some((acceptedParts) => {
    if (!Array.isArray(acceptedParts) || acceptedParts.length !== guessParts.length) return false;

    for (let index = 0; index < guessParts.length; index += 1) {
      const guessPart = guessParts[index];
      const acceptedPart = acceptedParts[index];

      if (guessPart.syllable !== acceptedPart.syllable) return false;
      if (!guessPart.explicitTone && acceptedPart.tone !== "5") return false;
    }

    return true;
  });
}

function checkPinyinAnswer(input, answer) {
  const guess = normalizeUserPinyinInput(input);
  const accepted = getPinyinVariants(answer);
  const acceptedParts = accepted
    .map((variant) => parseCanonicalPinyin(variant))
    .filter((parts) => Array.isArray(parts) && parts.length);

  const formatValid = allowsOnlyNeutralToneOmission(guess.parts, acceptedParts);

  return {
    guess: guess.canonical,
    accepted,
    formatValid,
    correct: formatValid && accepted.includes(guess.canonical)
  };
}

function isPinyinQuizActive() {
  if (state.mode === "learn") return false;
  const quizType = getQuizType();
  if (quizType === "pinyin") return true;
  return quizType === "smart" && state.round.smartStage === "pinyin";
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
    ? "ni3hao3 · use v for ü · neutral 5 optional"
    : "ni3hao3 · v=ü · neutral 5 optional";
}

function submitPinyinFormFromKeyboard(answerForm) {
  if (!answerForm) return;
  const event = {
    preventDefault() {},
    currentTarget: answerForm
  };

  if (isSmartPracticeActive()) {
    submitSmartPinyinAnswer(event);
    return;
  }

  submitPinyinAnswer(event);
}

function handlePinyinKeyboard(event) {
  if (!isPinyinQuizActive()) return;
  if (!getCurrentCard()) return;

  const target = event.target;
  const answerForm = target && typeof target.closest === "function" ? target.closest(".answer-form") : null;
  if (isEditableField(target) && !answerForm) return;

  const inSmartPinyin = isSmartPracticeActive() && state.round.smartStage === "pinyin";

  if (event.key === "Enter") {
    if (state.round.pendingWrong) {
      event.preventDefault();
      if (inSmartPinyin) {
        acceptPendingSmartPinyinWrong();
      } else {
        acceptPendingPinyinWrong();
      }
      return;
    }

    if (!inSmartPinyin && state.round.answered) {
      event.preventDefault();
      nextCard();
      return;
    }

    return;
  }

  if (event.key !== "ArrowRight") return;

  if (state.round.pendingWrong) {
    event.preventDefault();
    if (inSmartPinyin) {
      acceptPendingSmartPinyinWrong();
    } else {
      acceptPendingPinyinWrong();
    }
    return;
  }

  if (!inSmartPinyin && state.round.answered) {
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
  submitPinyinFormFromKeyboard(answerForm);
}

function isTranslationKeyboardActive() {
  if (state.mode === "learn") return false;
  const quizType = getQuizType();
  if (quizType === "translation") return true;
  return isSmartPracticeActive() && ["translation", "completed"].includes(state.round.smartStage);
}

function updateTranslationSelectionUI() {
  const selectedIndex = state.round.keyboardChoiceIndex;
  const buttons = [...elements.answerArea.querySelectorAll(".answer-btn[data-option-index]")];

  buttons.forEach((button) => {
    const index = Number(button.dataset.optionIndex);
    button.classList.toggle("selected", index === selectedIndex);
  });
}

function selectTranslationOption(index) {
  const options = Array.isArray(state.round.options) ? state.round.options : [];
  if (!options.length) return;

  const nextIndex = Math.max(0, Math.min(options.length - 1, index));
  if (state.round.keyboardChoiceIndex === nextIndex) return;

  state.round.keyboardChoiceIndex = nextIndex;
  updateTranslationSelectionUI();
}

function moveTranslationSelection(direction) {
  const options = Array.isArray(state.round.options) ? state.round.options : [];
  if (!options.length) return;

  const current = Number.isInteger(state.round.keyboardChoiceIndex) && state.round.keyboardChoiceIndex >= 0
    ? state.round.keyboardChoiceIndex
    : (direction > 0 ? -1 : 0);
  const nextIndex = (current + direction + options.length) % options.length;
  selectTranslationOption(nextIndex);
}

function submitSelectedTranslationOption() {
  const options = Array.isArray(state.round.options) ? state.round.options : [];
  const index = state.round.keyboardChoiceIndex;
  if (!Number.isInteger(index) || index < 0 || index >= options.length) return false;

  if (isSmartPracticeActive() && state.round.smartStage === "translation") {
    answerSmartTranslation(options[index]);
    return true;
  }

  if (getQuizType() === "translation" && !state.round.answered) {
    answerTranslation(options[index]);
    return true;
  }

  return false;
}

function handleTranslationKeyboard(event) {
  if (!isTranslationKeyboardActive()) return;
  if (!getCurrentCard()) return;
  if (isEditableField(event.target)) return;

  const isSmart = isSmartPracticeActive();
  const completed = isSmart ? state.round.smartStage === "completed" : state.round.answered;

  if (completed) {
    if (event.key === "Enter" || event.key === "ArrowRight") {
      event.preventDefault();
      nextCard();
    }
    return;
  }

  const options = Array.isArray(state.round.options) ? state.round.options : [];
  if (!options.length) return;

  const key = String(event.key || "").toLowerCase();
  const letterIndex = ["a", "b", "c", "d"].indexOf(key);
  const numberIndex = ["1", "2", "3", "4"].indexOf(key);

  if (letterIndex >= 0 || numberIndex >= 0) {
    const index = letterIndex >= 0 ? letterIndex : numberIndex;
    if (index < options.length) {
      event.preventDefault();
      selectTranslationOption(index);
    }
    return;
  }

  if (["ArrowDown", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    moveTranslationSelection(1);
    return;
  }

  if (["ArrowUp", "ArrowLeft"].includes(event.key)) {
    event.preventDefault();
    moveTranslationSelection(-1);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();
    submitSelectedTranslationOption();
  }
}

function clearCard(message = "Waiting for vocabulary", detail = "Built-in HSK 1 loads automatically on first open.") {
  elements.cardPrompt.textContent = message;
  elements.cardHanzi.textContent = "—";
  elements.cardPinyin.textContent = detail;
  elements.cardTranslation.textContent = "";
  elements.resultText.textContent = "";
  elements.resultText.className = "result";
  elements.answerArea.innerHTML = "";
  if (elements.cardStats) elements.cardStats.innerHTML = "";
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

function setSmartPositionLabel(card, total) {
  elements.positionLabel.textContent = `Adaptive · #${card.index} · ${total} cards`;
}

function getReviewPinyinText(card) {
  const reviewAnswer = getPinyinDisplay(card.pinyin);
  const reviewOriginal = String(card.pinyin || "").trim();
  const reviewSuffix = reviewOriginal && reviewOriginal !== reviewAnswer ? ` (${reviewOriginal})` : "";
  const reviewText = reviewOriginal && reviewOriginal !== reviewAnswer
    ? `${reviewAnswer} · ${reviewOriginal}`
    : reviewAnswer;

  return { reviewAnswer, reviewOriginal, reviewSuffix, reviewText };
}

function renderLearn(card, queueIndex, total) {
  elements.cardPrompt.textContent = "Vocabulary";
  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = card.pinyin;
  elements.cardTranslation.textContent = card.translation;
  elements.answerArea.innerHTML = "";
  updateResult();
  setPositionLabel(card, queueIndex, total);
  prepareRoundAppearance("learn", "", card);
  renderCurrentCardStats(card);

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
  prepareRoundAppearance(state.mode, "translation", card);
  renderCurrentCardStats(card);

  if (!state.round.options.length) {
    state.round.options = buildTranslationOptions(state.mode);
  }

  updateResult(
    state.round.answered ? state.round.resultText : "Pick one option. Keyboard: A-D / arrows, Enter to answer.",
    state.round.answered ? state.round.resultClass : ""
  );

  elements.answerArea.innerHTML = "";
  state.round.options.forEach((option, index) => {
    const keyLabel = ["A", "B", "C", "D"][index] || String(index + 1);
    const optionButton = createButton(`${keyLabel}. ${option.label}`, () => answerTranslation(option), "answer-btn");
    optionButton.dataset.optionIndex = String(index);

    if (!state.round.answered && state.round.keyboardChoiceIndex === index) {
      optionButton.classList.add("selected");
    }

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

function retryPinyinWithoutPenalty() {
  if (!state.round.pendingWrong) return;

  state.round.pendingWrong = false;
  state.round.pendingCheck = null;
  state.round.resultText = "";
  state.round.resultClass = "";
  render();
}

function acceptPendingPinyinWrong() {
  if (!state.round.pendingWrong) return;

  const card = getCurrentCard();
  if (!card) return;

  const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
  state.round.pendingWrong = false;
  state.round.answered = true;
  state.round.selectedCorrect = false;
  state.round.resultText = `Wrong. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
  state.round.resultClass = "bad";

  recordQuizResult("practice", "pinyin", "wrong");
  render();
}

function submitPinyinAnswer(event) {
  event.preventDefault();
  if (state.round.answered || state.round.pendingWrong) return;

  const card = getCurrentCard();
  if (!card) return;

  const form = event.currentTarget;
  const input = form.querySelector("input");
  const answerText = input ? input.value : "";
  const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
  const check = checkPinyinAnswer(answerText, card.pinyin);

  state.round.answerText = answerText;
  state.round.selectedCorrect = check.correct;
  state.round.pendingCheck = check;

  if (state.mode === "practice" && !check.correct) {
    state.round.pendingWrong = true;
    state.round.resultText = check.formatValid
      ? "Not counted yet. Retry without penalty if this was a typo, or press Enter / → to count it wrong and reveal the answer."
      : "Not counted yet. Missing tone numbers are only allowed on neutral-tone syllables. Retry without penalty, or press Enter / → to count it wrong and reveal the answer.";
    state.round.resultClass = "bad";
    render();
    return;
  }

  state.round.answered = true;

  if (!check.formatValid) {
    state.round.resultText = `Use tone numbers for non-neutral syllables. Neutral 5 is optional. Example: ni3hao3, lv4, xie4xie. Correct pinyin: ${reviewAnswer}${reviewSuffix}`;
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
  const { reviewText } = getReviewPinyinText(card);

  elements.cardPrompt.textContent = isPractice
    ? "Type the pinyin with tone numbers"
    : "Test: type the pinyin with tone numbers";
  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = state.round.answered ? reviewText : "";
  elements.cardTranslation.textContent = state.round.answered ? card.translation : "";
  setPositionLabel(card, queueIndex, total);
  prepareRoundAppearance(state.mode, "pinyin", card);
  renderCurrentCardStats(card);

  updateResult(
    state.round.pendingWrong
      ? state.round.resultText
      : state.round.answered
        ? state.round.resultText
        : "Use tone numbers. Example: ni3hao3, lv4, xie4xie. Use v for ü. Neutral 5 is optional.",
    state.round.pendingWrong || state.round.answered ? state.round.resultClass : ""
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
  input.disabled = state.round.answered || state.round.pendingWrong;

  const submitBtn = createButton(
    state.round.pendingWrong ? "Pending" : state.round.answered ? "Checked" : "Submit",
    () => {},
    state.round.answered || state.round.pendingWrong ? "secondary" : ""
  );
  submitBtn.type = "submit";
  submitBtn.disabled = state.round.answered || state.round.pendingWrong;

  form.append(input, submitBtn);
  elements.answerArea.appendChild(form);

  if (state.round.pendingWrong) {
    const pendingRow = document.createElement("div");
    pendingRow.className = "answer-pending-row";
    const retryBtn = createButton("Retry without error", retryPinyinWithoutPenalty, "secondary");
    pendingRow.appendChild(retryBtn);
    elements.answerArea.appendChild(pendingRow);
  }

  if (!state.round.answered && !state.round.pendingWrong && shouldAutoFocusPinyinInput()) {
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
  let nextBtn;

  if (state.round.pendingWrong) {
    nextBtn = createButton("Count wrong", acceptPendingPinyinWrong);
  } else {
    const skipLabel = state.round.answered ? "Next" : "Skip";
    nextBtn = createButton(skipLabel, nextCard, state.round.answered ? "" : "secondary");
  }

  elements.controls.append(prevBtn, nextBtn);
}

function retrySmartPinyinWithoutPenalty() {
  if (!state.round.pendingWrong) return;

  state.round.pendingWrong = false;
  state.round.pendingCheck = null;
  state.round.resultText = "";
  state.round.resultClass = "";
  render();
}

function acceptPendingSmartPinyinWrong() {
  if (!state.round.pendingWrong) return;

  const card = getCurrentCard();
  if (!card) return;

  const { reviewAnswer, reviewSuffix } = getReviewPinyinText(card);
  state.round.pendingWrong = false;
  state.round.smartPinyinCorrect = false;
  state.round.smartStage = "translation";
  state.round.keyboardChoiceIndex = -1;
  state.round.options = buildTranslationOptionsForCard(card, "practice");
  state.round.resultText = `Wrong pinyin. Correct pinyin: ${reviewAnswer}${reviewSuffix}. Now choose the translation.`;
  state.round.resultClass = "bad";
  render();
}

function submitSmartPinyinAnswer(event) {
  event.preventDefault();
  if (state.round.smartStage !== "pinyin" || state.round.pendingWrong) return;

  const card = getCurrentCard();
  if (!card) return;

  const form = event.currentTarget;
  const input = form.querySelector("input");
  const answerText = input ? input.value : "";
  const check = checkPinyinAnswer(answerText, card.pinyin);

  state.round.answerText = answerText;
  state.round.pendingCheck = check;

  if (!check.correct) {
    state.round.pendingWrong = true;
    state.round.resultText = check.formatValid
      ? "Not counted yet. Retry without penalty if this was a typo, or press Enter / → to count it wrong and reveal the answer before step 2."
      : "Not counted yet. Missing tone numbers are only allowed on neutral-tone syllables. Retry without penalty, or press Enter / → to count it wrong and reveal the answer before step 2.";
    state.round.resultClass = "bad";
    render();
    return;
  }

  state.round.smartPinyinCorrect = true;
  state.round.smartStage = "translation";
  state.round.keyboardChoiceIndex = -1;
  state.round.options = buildTranslationOptionsForCard(card, "practice");
  state.round.resultText = "Pinyin correct. Now choose the translation.";
  state.round.resultClass = "ok";
  render();
}

function answerSmartTranslation(option) {
  if (state.round.smartStage !== "translation") return;

  const card = getCurrentCard();
  if (!card) return;

  const translationCorrect = !!option.correct;
  const overallCorrect = state.round.smartPinyinCorrect === true && translationCorrect;

  state.round.selectedLabel = option.label;
  state.round.selectedCorrect = translationCorrect;
  state.round.smartTranslationCorrect = translationCorrect;
  state.round.smartStage = "completed";
  state.round.answered = true;
  state.round.resultText = overallCorrect
    ? `Correct. ${card.hanzi} = ${card.translation} (${card.pinyin})`
    : `Wrong. ${card.hanzi} = ${card.translation} (${card.pinyin})`;
  state.round.resultClass = overallCorrect ? "ok" : "bad";

  recordSmartPracticeOutcome(card, overallCorrect);
  render();
}

function renderSmartPractice(card, total) {
  const { reviewText } = getReviewPinyinText(card);
  prepareRoundAppearance("practice", "smart", card);
  setSmartPositionLabel(card, total);
  renderCurrentCardStats(card);

  elements.cardHanzi.textContent = card.hanzi;
  elements.cardPinyin.textContent = state.round.smartStage === "pinyin" ? "" : reviewText;
  elements.cardTranslation.textContent = state.round.smartStage === "completed" ? card.translation : "";

  if (state.round.smartStage === "pinyin") {
    elements.cardPrompt.textContent = "Smart practice · 1 of 2 · type the pinyin";
    updateResult(
      state.round.pendingWrong
        ? state.round.resultText
        : "Step 1 of 2. Use tone numbers. Example: ni3hao3, lv4, xie4xie.",
      state.round.pendingWrong ? state.round.resultClass : ""
    );

    elements.answerArea.innerHTML = "";
    const form = document.createElement("form");
    form.className = "answer-form";
    form.addEventListener("submit", submitSmartPinyinAnswer);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = getPinyinInputPlaceholder();
    input.value = state.round.answerText;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.disabled = state.round.pendingWrong;

    const submitBtn = createButton(state.round.pendingWrong ? "Pending" : "Submit", () => {}, state.round.pendingWrong ? "secondary" : "");
    submitBtn.type = "submit";
    submitBtn.disabled = state.round.pendingWrong;

    form.append(input, submitBtn);
    elements.answerArea.appendChild(form);

    if (state.round.pendingWrong) {
      const pendingRow = document.createElement("div");
      pendingRow.className = "answer-pending-row";
      const retryBtn = createButton("Retry without error", retrySmartPinyinWithoutPenalty, "secondary");
      pendingRow.appendChild(retryBtn);
      elements.answerArea.appendChild(pendingRow);
    }

    if (!state.round.pendingWrong && shouldAutoFocusPinyinInput()) {
      setTimeout(() => {
        try {
          input.focus({ preventScroll: true });
        } catch (error) {
          input.focus();
        }
      }, 0);
    }

    elements.controls.innerHTML = "";
    const skipBtn = createButton("Skip", () => nextSmartCard({ countAppearance: true }), "secondary");
    if (state.round.pendingWrong) {
      const countWrongBtn = createButton("Count wrong", acceptPendingSmartPinyinWrong);
      elements.controls.append(skipBtn, countWrongBtn);
    } else {
      elements.controls.append(skipBtn);
    }
    return;
  }

  elements.cardPrompt.textContent = state.round.smartStage === "translation"
    ? "Smart practice · 2 of 2 · choose the translation"
    : "Smart practice · result";

  if (!state.round.options.length) {
    state.round.options = buildTranslationOptionsForCard(card, "practice");
  }

  updateResult(
    state.round.smartStage === "completed"
      ? state.round.resultText
      : state.round.resultText || "Step 2 of 2. Choose the English translation. Keyboard: A-D / arrows, Enter to answer.",
    state.round.smartStage === "completed" ? state.round.resultClass : ""
  );

  elements.answerArea.innerHTML = "";
  state.round.options.forEach((option, index) => {
    const keyLabel = ["A", "B", "C", "D"][index] || String(index + 1);
    const optionButton = createButton(`${keyLabel}. ${option.label}`, () => answerSmartTranslation(option), "answer-btn");
    optionButton.dataset.optionIndex = String(index);

    if (state.round.smartStage === "translation" && state.round.keyboardChoiceIndex === index) {
      optionButton.classList.add("selected");
    }

    if (state.round.smartStage === "completed") {
      if (option.correct) optionButton.classList.add("correct");
      if (!option.correct && option.label === state.round.selectedLabel && !state.round.selectedCorrect) {
        optionButton.classList.add("wrong");
      }
      optionButton.disabled = true;
    }

    elements.answerArea.appendChild(optionButton);
  });

  elements.controls.innerHTML = "";
  if (state.round.smartStage === "completed") {
    elements.controls.append(createButton("Next", () => nextSmartCard({ countAppearance: true })));
  } else {
    elements.controls.append(createButton("Skip", () => nextSmartCard({ countAppearance: true }), "secondary"));
  }
}

function renderOrderStatus() {
  const total = getModeCards(state.mode).length;
  const modeLabel = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  const quizType = getQuizType();

  if (isSmartPracticeActive()) {
    elements.orderStatus.textContent = `${modeLabel} · smart: adaptive error-weighted order · ${total} active cards.`;
    elements.shuffleBtn.disabled = true;
    elements.resetOrderBtn.disabled = true;
    return;
  }

  const orderedTotal = getOrderedIds().length;
  const orderType = state.progress.orderType[state.mode] === "shuffled" ? "Shuffled" : "Sequential";
  const extra = state.mode === "learn"
    ? ""
    : ` · ${quizType === "translation" ? "translation" : quizType === "pinyin" ? "pinyin" : "smart"}`;

  elements.orderStatus.textContent = `${modeLabel}${extra}: ${orderType.toLowerCase()} order · ${orderedTotal} active cards.`;
  elements.shuffleBtn.disabled = orderedTotal < 2;
  elements.resetOrderBtn.disabled = orderedTotal < 2 && state.progress.orderType[state.mode] !== "shuffled";
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
  markManageListDirty();
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
  markManageListDirty();
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

    const stats = getPracticeCardStats(card);
    word.append(title, detail);

    if (stats.translation.shown > 0 || stats.pinyin.shown > 0 || stats.smart.shown > 0) {
      const cardStats = document.createElement("div");
      cardStats.className = "manage-stats";
      const summary = getPracticeCardSummaryText(card);

      const translationStat = document.createElement("span");
      translationStat.textContent = summary.translation;

      const pinyinStat = document.createElement("span");
      pinyinStat.textContent = summary.pinyin;

      const smartStat = document.createElement("span");
      smartStat.textContent = summary.smart;

      cardStats.append(translationStat, pinyinStat, smartStat);
      word.appendChild(cardStats);
    }

    const flags = document.createElement("div");
    flags.className = "manage-flags";

    MODES.forEach((mode) => {
      const label = document.createElement("label");
      label.className = "tick";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = !!card[mode];
      input.dataset.cardId = id;
      input.dataset.cardMode = mode;

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
  renderSetupPanel();
  renderManageListIfNeeded();
  renderOrderStatus();

  if (!state.vocab.length) {
    clearCard();
    return;
  }

  if (isSmartPracticeActive()) {
    const total = getModeCards("practice").length;
    if (!total) {
      clearCard("No cards selected for practice", "Use Card setup to add cards to Practice.");
      return;
    }

    const card = getCurrentCard();
    if (!card) {
      clearCard();
      return;
    }

    renderSmartPractice(card, total);
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
  markManageListDirty();
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
  if (!getAllowedQuizTypes(state.mode).includes(quizType)) return;

  state.progress.quizType[state.mode] = quizType;
  resetRoundState();
  saveProgress();
  render();
}

function shuffleCurrentMode() {
  if (isSmartPracticeActive()) {
    elements.statusText.textContent = "Smart practice uses adaptive order.";
    return;
  }

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
  if (isSmartPracticeActive()) {
    elements.statusText.textContent = "Smart practice uses adaptive order.";
    return;
  }

  state.progress.order[state.mode] = getModeIds(state.mode);
  state.progress.orderType[state.mode] = "default";
  state.progress.index[state.mode] = 0;
  resetRoundState();
  saveProgress();
  render();
}

function handleManageListChange(event) {
  const input = event.target.closest('input[data-card-id][data-card-mode]');
  if (!input || !elements.manageList.contains(input)) return;
  const mode = input.dataset.cardMode;
  const id = input.dataset.cardId;
  if (!MODES.includes(mode)) return;
  updateCardMode(id, mode, input.checked);
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
  if (elements.setupToggleBtn) elements.setupToggleBtn.addEventListener("click", toggleSetupPanel);
  if (elements.manageList) elements.manageList.addEventListener("change", handleManageListChange);

  elements.resetProgressBtn.addEventListener("click", handleResetProgress);
  elements.exportProgressBtn.addEventListener("click", handleExportProgress);
  elements.importProgressBtn.addEventListener("click", handleImportProgressClick);
  elements.importProgressInput.addEventListener("change", handleImportProgressFile);
  elements.shuffleBtn.addEventListener("click", shuffleCurrentMode);
  elements.resetOrderBtn.addEventListener("click", resetCurrentModeOrder);

  elements.filterInput.addEventListener("input", (event) => {
    state.filterText = event.target.value || "";
    markManageListDirty();
    renderManageListIfNeeded(true);
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
  window.addEventListener("keydown", handleTranslationKeyboard);
}

loadFromStorage();
bindEvents();
render();
