(function (ns) {
  const { ALL_SET_ID } = ns.constants;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  function createLegacyId(hanzi, pinyin, translation) {
    return `${hanzi}__${pinyin}__${translation}`;
  }

  function normalizeCard(card, index) {
    const hanzi = String(card.hanzi || card.word || card.palavra || "").trim();
    const pinyin = String(card.pinyin || "").trim();
    const pinyinNumeric = String(card.pinyinNumeric || card.pinyin_numeric || card.numericPinyin || "").trim();
    const translation = String(card.translation || card.traducao || card.meaning || "").trim();
    return {
      id: String(card.id || createLegacyId(hanzi, pinyin, translation)),
      index,
      hanzi,
      pinyin,
      pinyinNumeric,
      translation,
      learn: card.learn !== false,
      practice: card.practice !== false
    };
  }

  function cardId(card) {
    return typeof card === "string" ? card : String(card?.id || "");
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function normalizeHeader(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function parseCSV(text) {
    const rows = [];
    let current = "";
    let row = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
        continue;
      }

      current += char;
    }

    row.push(current);
    rows.push(row);
    return rows
      .map((items) => items.map((item) => item.trim()))
      .filter((items) => items.some(Boolean));
  }

  function mapRowsToCards(rows) {
    if (!rows.length) return [];
    const headers = rows[0].map(normalizeHeader);
    const body = rows.slice(1);

    const hanziIndex = headers.findIndex((header) => ["hanzi", "word", "palavra"].includes(header));
    const pinyinIndex = headers.findIndex((header) => header === "pinyin");
    const translationIndex = headers.findIndex((header) => ["translation", "traducao", "meaning"].includes(header));
    const pinyinNumericIndex = headers.findIndex((header) => ["pinyinnumeric", "pinyinwithnumbers", "numericpinyin", "pinyin_number", "pinyinnumber"].includes(header));

    const fallback = hanziIndex < 0 || pinyinIndex < 0 || translationIndex < 0;

    const cards = body.map((row) => {
      const hanzi = fallback ? row[0] : row[hanziIndex];
      const pinyin = fallback ? row[1] : row[pinyinIndex];
      const translation = fallback ? row[2] : row[translationIndex];
      const pinyinNumeric = fallback ? row[3] : (pinyinNumericIndex >= 0 ? row[pinyinNumericIndex] : "");
      return { hanzi, pinyin, pinyinNumeric, translation, learn: true, practice: true };
    });

    return cards
      .map((card, index) => normalizeCard(card, index + 1))
      .filter((card) => card.hanzi && card.pinyin && card.translation);
  }

  function parseRangeInput(value) {
    const result = new Set();
    String(value || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .forEach((part) => {
        const match = part.match(/^(\d+)\s*-\s*(\d+)$/);
        if (match) {
          const start = Number(match[1]);
          const end = Number(match[2]);
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i += 1) result.add(i);
          return;
        }
        const single = Number(part);
        if (Number.isInteger(single) && single > 0) result.add(single);
      });
    return result;
  }

  function normalizeDate(value, fallback = new Date()) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    const parsed = new Date(value || fallback);
    return Number.isNaN(parsed.getTime()) ? new Date(fallback) : parsed;
  }

  // Local-day boundaries are product behavior: a card due today remains
  // reviewable for the whole local day, regardless of exact due hour.
  function getStartOfLocalDay(value = new Date()) {
    const date = normalizeDate(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function getLocalNoon(value = new Date()) {
    const date = getStartOfLocalDay(value);
    date.setHours(12, 0, 0, 0);
    return date;
  }

  function addLocalDays(value, days) {
    const date = getStartOfLocalDay(value);
    date.setDate(date.getDate() + days);
    return date;
  }

  function getLocalDayStamp(value = new Date()) {
    return getStartOfLocalDay(value).getTime();
  }

  function formatLocalDayKey(value = new Date()) {
    const date = getStartOfLocalDay(value);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  function formatShortDate(value) {
    if (!value) return "—";
    const date = normalizeDate(value);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function formatLongDate(value) {
    if (!value) return "—";
    const date = normalizeDate(value);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  function formatReviewDateLabel(value, now = new Date()) {
    if (!value) return "—";
    const stamp = getLocalDayStamp(value);
    const today = getLocalDayStamp(now);
    const tomorrow = getLocalDayStamp(addLocalDays(now, 1));
    if (stamp === today) return `Today · ${formatLongDate(value)}`;
    if (stamp === tomorrow) return `Tomorrow · ${formatLongDate(value)}`;
    return formatLongDate(value);
  }

  // Deterministic pseudo-random score in [0, 1). Used for stable shuffles
  // where Math.random() would make render-to-render ordering unstable.
  function hashStringToUnitInterval(value) {
    let hash = 2166136261;
    const input = String(value || "");
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967295;
  }

  function slugifySetName(value) {
    const base = String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return base || `set-${Date.now()}`;
  }

  function createSetRecord(name, cardIds) {
    const now = new Date().toISOString();
    return {
      id: slugifySetName(name),
      name: String(name || "Untitled set").trim() || "Untitled set",
      cardIds: [...new Set((cardIds || []).map(String))],
      locked: false,
      createdAt: now,
      updatedAt: now
    };
  }

  function createAllCardsSet(cardIds) {
    const now = new Date().toISOString();
    return {
      id: ALL_SET_ID,
      name: "All cards",
      cardIds: [...new Set((cardIds || []).map(String))],
      locked: true,
      createdAt: now,
      updatedAt: now
    };
  }

  function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  ns.utils = {
    MS_PER_DAY,
    normalizeCard,
    cardId,
    clamp,
    shuffle,
    parseCSV,
    mapRowsToCards,
    parseRangeInput,
    normalizeDate,
    getStartOfLocalDay,
    getLocalNoon,
    addLocalDays,
    getLocalDayStamp,
    formatLocalDayKey,
    formatShortDate,
    formatLongDate,
    formatReviewDateLabel,
    hashStringToUnitInterval,
    slugifySetName,
    createSetRecord,
    createAllCardsSet,
    arraysEqual
  };
})(window.HSKFlashcards);
