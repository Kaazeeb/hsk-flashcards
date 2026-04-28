/**
 * Pinyin normalization and validation.
 *
 * Card data stores tone-mark pinyin, while user answers are typed as numeric
 * pinyin. This module converts both sides to a canonical numeric form and then
 * compares strings. It is not a separate answer database.
 */
(function (ns) {
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
      output.push({ syllable, tone, explicitTone, canonical: `${syllable}${tone}` });
    }

    while (cursor < text.length && /[1-5]/.test(text[cursor])) cursor += 1;
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
    return parts.map((part) => ({ syllable: part.slice(0, -1), tone: part.slice(-1), canonical: part }));
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

  // Normalizes typed answers to the canonical comparison form. Neutral-tone
  // syllables may omit 5, but non-neutral tones must still be present.
  function normalizeUserPinyinInput(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return { raw: "", annotated: "", parts: null, canonical: "" };
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

  // The app compares canonicalized strings, not raw pinyin text. This keeps
  // validation strict enough for tones while tolerating spaces/apostrophes and v/ü.
  function checkPinyinAnswer(input, answer) {
    const guess = normalizeUserPinyinInput(input);
    const accepted = getPinyinVariants(answer);
    const acceptedParts = accepted.map((variant) => parseCanonicalPinyin(variant)).filter((parts) => Array.isArray(parts) && parts.length);
    const formatValid = allowsOnlyNeutralToneOmission(guess.parts, acceptedParts);
    return {
      guess: guess.canonical,
      accepted,
      formatValid,
      correct: formatValid && accepted.includes(guess.canonical)
    };
  }

  function getReviewPinyinText(card) {
    const reviewAnswer = getPinyinDisplay(card?.pinyin || "");
    return {
      reviewAnswer,
      reviewText: reviewAnswer,
      reviewSuffix: ""
    };
  }

  function shouldAutoFocusPinyinInput() {
    return !window.matchMedia || !window.matchMedia("(max-width: 760px)").matches;
  }

  function getPinyinInputPlaceholder() {
    return "ni3hao3 · use v for ü · neutral 5 optional";
  }

  ns.pinyin = {
    getPinyinDisplay,
    getReviewPinyinText,
    checkPinyinAnswer,
    shouldAutoFocusPinyinInput,
    getPinyinInputPlaceholder,
    normalizeUserPinyinInput,
    canonicalizePinyinValue
  };
})(window.HSKFlashcards);
