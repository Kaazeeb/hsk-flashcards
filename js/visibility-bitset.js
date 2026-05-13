window.HSKFlashcards = window.HSKFlashcards || {};

/**
 * Compact per-user deck visibility.
 *
 * Storage model:
 *   one Supabase row per user + deck + mode
 *   z = default visible flag
 *   x = base64 bitset of exceptions to z
 *
 * A set of 30,000 cards needs at most 3,750 raw bytes per mode before base64.
 */
(function (ns) {
  const { ALL_SET_ID } = ns.constants;
  const MODES = ["learn", "practice"];

  const MODE_KEY_BY_NAME = { learn: 0, practice: 1 };
  const MODE_NAME_BY_KEY = { 0: "learn", 1: "practice" };

  // Stable numeric keys keep Supabase rows short. Add new built-in decks here;
  // never reuse old numeric keys for a different deck.
  const DECK_KEY_BY_ID = {
    [ALL_SET_ID]: 1,
    sentence_hsk1: 101,
    sentence_hsk2: 102,
    sentence_hsk3: 103,
    builtin_hanzi_pinyin_hsk1: 201,
    builtin_hanzi_pinyin_hsk2: 202,
    builtin_hanzi_pinyin_hsk3: 203,
    builtin_measure_words_hsk1: 301,
    builtin_measure_words_hsk2: 302,
    builtin_measure_words_hsk3: 303,
    builtin_stroke_order_hsk1: 401,
    builtin_stroke_order_hsk2: 402,
    builtin_stroke_order_hsk3: 403
  };

  const DECK_ID_BY_KEY = Object.fromEntries(Object.entries(DECK_KEY_BY_ID).map(([id, key]) => [String(key), id]));
  const BYTE_CACHE = new Map();

  function normalizeId(value) {
    return String(value || "").trim();
  }

  function normalizeIdList(ids) {
    const seen = new Set();
    const output = [];
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      const value = normalizeId(id);
      if (!value || seen.has(value)) return;
      seen.add(value);
      output.push(value);
    });
    return output;
  }

  function getDeckKey(deckId) {
    const id = normalizeId(deckId);
    return Object.prototype.hasOwnProperty.call(DECK_KEY_BY_ID, id) ? DECK_KEY_BY_ID[id] : null;
  }

  function getDeckIdFromKey(key) {
    return DECK_ID_BY_KEY[String(Number(key))] || "";
  }

  function getModeKey(mode) {
    return Object.prototype.hasOwnProperty.call(MODE_KEY_BY_NAME, mode) ? MODE_KEY_BY_NAME[mode] : null;
  }

  function getModeFromKey(key) {
    return MODE_NAME_BY_KEY[String(Number(key))] || "";
  }

  function cleanBase64(value) {
    return String(value || "").replace(/[^A-Za-z0-9+/=]/g, "");
  }

  function bytesToBase64(bytes) {
    if (!bytes || !bytes.length) return "";
    if (typeof btoa === "function") {
      let binary = "";
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, i + chunkSize);
        binary += String.fromCharCode(...chunk);
      }
      return btoa(binary);
    }
    if (typeof Buffer !== "undefined") return Buffer.from(bytes).toString("base64");
    throw new Error("No base64 encoder available.");
  }

  function base64ToBytes(value) {
    const text = cleanBase64(value);
    if (!text) return new Uint8Array(0);
    if (BYTE_CACHE.has(text)) return BYTE_CACHE.get(text);
    let bytes = new Uint8Array(0);
    try {
      if (typeof atob === "function") {
        const binary = atob(text);
        bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      } else if (typeof Buffer !== "undefined") {
        bytes = new Uint8Array(Buffer.from(text, "base64"));
      }
    } catch (error) {
      console.warn("Invalid visibility bitset ignored.", error);
      bytes = new Uint8Array(0);
    }
    BYTE_CACHE.set(text, bytes);
    if (BYTE_CACHE.size > 200) BYTE_CACHE.delete(BYTE_CACHE.keys().next().value);
    return bytes;
  }

  function trimZeroTail(bytes) {
    let length = bytes.length;
    while (length > 0 && bytes[length - 1] === 0) length -= 1;
    return length === bytes.length ? bytes : bytes.subarray(0, length);
  }

  function countBitsUpTo(bytes, bitCount) {
    const totalBits = Math.max(0, Math.floor(Number(bitCount) || 0));
    let count = 0;
    for (let index = 0; index < totalBits; index += 1) {
      const byte = bytes[Math.floor(index / 8)] || 0;
      if (((byte >> (index % 8)) & 1) === 1) count += 1;
    }
    return count;
  }

  function invertBitsUpTo(bytes, bitCount) {
    const totalBits = Math.max(0, Math.floor(Number(bitCount) || 0));
    const output = new Uint8Array(Math.ceil(totalBits / 8));
    for (let index = 0; index < totalBits; index += 1) {
      const byte = bytes[Math.floor(index / 8)] || 0;
      const current = ((byte >> (index % 8)) & 1) === 1;
      if (!current) output[Math.floor(index / 8)] |= 1 << (index % 8);
    }
    return trimZeroTail(output);
  }

  function optimizeModeState(state) {
    if (!state) return state;
    state.x = cleanBase64(state.x);
    state.n = Math.max(0, Math.floor(Number(state.n) || 0));
    if (!state.n || !state.x) {
      state.x = "";
      return state;
    }
    const bytes = base64ToBytes(state.x);
    const setCount = countBitsUpTo(bytes, state.n);
    if (setCount <= 0) {
      state.x = "";
      return state;
    }
    if (setCount >= state.n) {
      state.z = state.z === false;
      state.x = "";
      return state;
    }
    if (setCount > state.n / 2) {
      state.z = state.z === false;
      state.x = bytesToBase64(invertBitsUpTo(bytes, state.n));
    } else {
      state.x = bytesToBase64(trimZeroTail(bytes));
    }
    return state;
  }

  function getBitFromBase64(bitset, index) {
    const safeIndex = Math.floor(Number(index));
    if (!Number.isInteger(safeIndex) || safeIndex < 0) return false;
    const bytes = base64ToBytes(bitset);
    const byte = bytes[Math.floor(safeIndex / 8)] || 0;
    return ((byte >> (safeIndex % 8)) & 1) === 1;
  }

  function setBitInBase64(bitset, index, value) {
    const safeIndex = Math.floor(Number(index));
    if (!Number.isInteger(safeIndex) || safeIndex < 0) return cleanBase64(bitset);
    const needed = Math.floor(safeIndex / 8) + 1;
    const current = base64ToBytes(bitset);
    const bytes = current.length >= needed ? new Uint8Array(current) : new Uint8Array(needed);
    if (current.length < needed) bytes.set(current);
    const byteIndex = Math.floor(safeIndex / 8);
    const mask = 1 << (safeIndex % 8);
    if (value) bytes[byteIndex] |= mask;
    else bytes[byteIndex] &= ~mask;
    return bytesToBase64(trimZeroTail(bytes));
  }

  function buildIndexByDeck(deckIdMap = {}) {
    const output = {};
    Object.entries(deckIdMap || {}).forEach(([deckId, ids]) => {
      const id = normalizeId(deckId);
      if (!id) return;
      output[id] = {};
      normalizeIdList(ids).forEach((cardId, index) => { output[id][cardId] = index; });
    });
    return output;
  }

  function attachDeckMaps(visibility, deckIdMap = {}) {
    const safeMap = {};
    Object.entries(deckIdMap || {}).forEach(([deckId, ids]) => {
      const id = normalizeId(deckId);
      if (id) safeMap[id] = normalizeIdList(ids);
    });
    Object.defineProperty(visibility, "_deckIdMap", { value: safeMap, enumerable: false, configurable: true });
    Object.defineProperty(visibility, "_indexByDeck", { value: buildIndexByDeck(safeMap), enumerable: false, configurable: true });
    return visibility;
  }

  function normalizeModeState(raw, cardCount = 0) {
    return {
      z: raw?.z === undefined ? raw?.defaultVisible !== false : raw.z !== false,
      n: Math.max(0, Math.floor(Number(raw?.n ?? raw?.cardCount ?? cardCount) || 0)),
      x: cleanBase64(raw?.x ?? raw?.exceptions ?? "")
    };
  }

  function normalizeVisibility(raw, deckIdMap = {}) {
    const output = { version: 46, byDeck: {} };

    if (raw?.byDeck && typeof raw.byDeck === "object") {
      Object.entries(raw.byDeck).forEach(([deckId, deck]) => {
        const id = normalizeId(deckId);
        if (!id || !deck || typeof deck !== "object") return;
        const cardCount = normalizeIdList(deckIdMap[id] || []).length;
        const entry = {};
        MODES.forEach((mode) => {
          if (deck[mode]) entry[mode] = normalizeModeState(deck[mode], cardCount);
        });
        if (entry.learn || entry.practice) output.byDeck[id] = entry;
      });
    }

    const rows = Array.isArray(raw?.rows) ? raw.rows : [];
    rows.forEach((row) => {
      const deckId = getDeckIdFromKey(row?.d);
      const mode = getModeFromKey(row?.m);
      if (!deckId || !mode) return;
      if (!output.byDeck[deckId]) output.byDeck[deckId] = {};
      output.byDeck[deckId][mode] = normalizeModeState(row, normalizeIdList(deckIdMap[deckId] || []).length);
    });

    return attachDeckMaps(output, deckIdMap);
  }

  function getDeckCardIds(visibility, deckId, fallbackIds = []) {
    const id = normalizeId(deckId);
    const fromMap = visibility?._deckIdMap?.[id];
    return normalizeIdList(fromMap && fromMap.length ? fromMap : fallbackIds);
  }

  function getCardIndex(visibility, deckId, cardId, fallbackIds = []) {
    const id = normalizeId(deckId);
    const localId = normalizeId(cardId);
    if (!id || !localId) return -1;
    const direct = visibility?._indexByDeck?.[id]?.[localId];
    if (Number.isInteger(direct)) return direct;
    return getDeckCardIds(visibility, id, fallbackIds).indexOf(localId);
  }

  function getModeState(visibility, deckId, mode, fallbackIds = []) {
    const id = normalizeId(deckId);
    const cardCount = getDeckCardIds(visibility, id, fallbackIds).length;
    return normalizeModeState(visibility?.byDeck?.[id]?.[mode], cardCount);
  }

  function isCardVisible(visibility, deckId, cardId, mode, fallbackIds = []) {
    const index = getCardIndex(visibility, deckId, cardId, fallbackIds);
    if (index < 0) return true;
    const modeState = getModeState(visibility, deckId, mode, fallbackIds);
    const exception = getBitFromBase64(modeState.x, index);
    return modeState.z !== false ? !exception : exception;
  }

  function getCardVisibility(visibility, deckId, cardId, fallbackIds = []) {
    return {
      learn: isCardVisible(visibility, deckId, cardId, "learn", fallbackIds),
      practice: isCardVisible(visibility, deckId, cardId, "practice", fallbackIds)
    };
  }

  function ensureDeck(visibility, deckId) {
    const id = normalizeId(deckId);
    if (!visibility.byDeck) visibility.byDeck = {};
    if (!visibility.byDeck[id]) visibility.byDeck[id] = {};
    return visibility.byDeck[id];
  }

  function ensureModeState(visibility, deckId, mode, fallbackIds = []) {
    const deck = ensureDeck(visibility, deckId);
    const ids = getDeckCardIds(visibility, deckId, fallbackIds);
    if (!deck[mode]) deck[mode] = { z: true, n: ids.length, x: "" };
    else deck[mode] = normalizeModeState(deck[mode], ids.length);
    deck[mode].n = ids.length;
    return deck[mode];
  }

  function setModeDefault(visibility, deckId, mode, visible, fallbackIds = []) {
    if (!MODES.includes(mode)) return false;
    const nextVisible = visible !== false;
    const state = ensureModeState(visibility, deckId, mode, fallbackIds);
    const nextCount = getDeckCardIds(visibility, deckId, fallbackIds).length;
    const changed = state.z !== nextVisible || !!state.x || state.n !== nextCount;
    state.z = nextVisible;
    state.x = "";
    state.n = nextCount;
    return changed;
  }

  function setCardModeInternal(visibility, deckId, cardId, mode, visible, fallbackIds = [], optimize = true) {
    if (!MODES.includes(mode)) return false;
    const index = getCardIndex(visibility, deckId, cardId, fallbackIds);
    if (index < 0) return false;
    const nextVisible = visible !== false;
    const currentVisible = isCardVisible(visibility, deckId, cardId, mode, fallbackIds);
    if (currentVisible === nextVisible) return false;
    const state = ensureModeState(visibility, deckId, mode, fallbackIds);
    const defaultVisible = state.z !== false;
    state.x = setBitInBase64(state.x, index, nextVisible !== defaultVisible);
    if (optimize) optimizeModeState(state);
    return true;
  }

  function setCardMode(visibility, deckId, cardId, mode, visible, fallbackIds = []) {
    return setCardModeInternal(visibility, deckId, cardId, mode, visible, fallbackIds, true);
  }

  function setCardsMode(visibility, deckId, cardIds, mode, visible, fallbackIds = []) {
    if (!MODES.includes(mode)) return 0;
    const id = normalizeId(deckId);
    const targetIds = normalizeIdList(cardIds);
    if (!id || !targetIds.length) return 0;
    const allIds = getDeckCardIds(visibility, id, fallbackIds);
    const indexMap = visibility?._indexByDeck?.[id] || Object.fromEntries(allIds.map((cardId, index) => [cardId, index]));
    const state = ensureModeState(visibility, id, mode, allIds);
    const nextVisible = visible !== false;
    const defaultVisible = state.z !== false;
    const targetException = nextVisible !== defaultVisible;
    const indexes = targetIds
      .map((cardId) => indexMap[cardId])
      .filter((index) => Number.isInteger(index) && index >= 0);
    if (!indexes.length) return 0;

    const maxIndex = Math.max(...indexes);
    const needed = Math.floor(maxIndex / 8) + 1;
    const current = base64ToBytes(state.x);
    const bytes = current.length >= needed ? new Uint8Array(current) : new Uint8Array(needed);
    if (current.length < needed) bytes.set(current);

    let changed = 0;
    indexes.forEach((index) => {
      const byteIndex = Math.floor(index / 8);
      const mask = 1 << (index % 8);
      const currentException = ((bytes[byteIndex] || 0) & mask) !== 0;
      const currentVisible = defaultVisible ? !currentException : currentException;
      if (currentVisible === nextVisible) return;
      if (targetException) bytes[byteIndex] |= mask;
      else bytes[byteIndex] &= ~mask;
      changed += 1;
    });

    if (!changed) return 0;
    state.x = bytesToBase64(trimZeroTail(bytes));
    optimizeModeState(state);
    return changed;
  }

  function buildRows(visibility, deckIdMap = {}) {
    const normalized = normalizeVisibility(visibility, deckIdMap);
    const rows = [];
    Object.entries(normalized.byDeck || {}).forEach(([deckId, deck]) => {
      const d = getDeckKey(deckId);
      if (d == null) return;
      MODES.forEach((mode) => {
        const m = getModeKey(mode);
        const modeState = normalizeModeState(deck?.[mode], normalizeIdList(deckIdMap[deckId] || []).length);
        if (modeState.z !== false && !modeState.x) return;
        rows.push({ d, m, z: modeState.z !== false, n: modeState.n, x: cleanBase64(modeState.x) });
      });
    });
    return rows.sort((a, b) => a.d - b.d || a.m - b.m);
  }

  ns.visibilityBits = {
    MODES,
    DECK_KEY_BY_ID,
    DECK_ID_BY_KEY,
    getDeckKey,
    getDeckIdFromKey,
    getModeKey,
    getModeFromKey,
    normalizeVisibility,
    getCardVisibility,
    isCardVisible,
    setModeDefault,
    setCardMode,
    setCardsMode,
    buildRows,
    bytesToBase64,
    base64ToBytes,
    getBitFromBase64,
    setBitInBase64
  };
})(window.HSKFlashcards);
