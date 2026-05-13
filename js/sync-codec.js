window.HSKFlashcards = window.HSKFlashcards || {};

/**
 * Remote sync codec.
 *
 * Local card ids are descriptive and may contain hanzi, pinyin and translations.
 * Remote payloads use compact refs like idx:300 so Supabase URLs, event rows and
 * set documents stay small and predictable.
 */
(function (ns) {
  function normalizeCardFlags(cardOrFlags) {
    return {
      learn: cardOrFlags?.learn !== false,
      practice: cardOrFlags?.practice !== false
    };
  }

  function stripCards(cards) {
    return (Array.isArray(cards) ? cards : [])
      .map((card) => ({
        hanzi: String(card?.hanzi || "").trim(),
        pinyin: String(card?.pinyin || "").trim(),
        pinyinNumeric: String(card?.pinyinNumeric || card?.pinyin_numeric || card?.numericPinyin || "").trim(),
        translation: String(card?.translation || "").trim()
      }))
      .filter((card) => card.hanzi && card.pinyin && card.translation);
  }

  function sameCardList(a, b) {
    const left = stripCards(a);
    const right = stripCards(b);
    if (left.length !== right.length) return false;
    for (let i = 0; i < left.length; i += 1) {
      if (left[i].hanzi !== right[i].hanzi || left[i].pinyin !== right[i].pinyin || left[i].pinyinNumeric !== right[i].pinyinNumeric || left[i].translation !== right[i].translation) return false;
    }
    return true;
  }

  function getRemoteCardRef(card, fallbackIndex = 0) {
    const numericIndex = Number(card?.index || fallbackIndex);
    return Number.isInteger(numericIndex) && numericIndex > 0 ? `idx:${numericIndex}` : "";
  }

  function createCardRefCodec(vocab) {
    const idToRef = new Map();
    const refToId = new Map();
    (Array.isArray(vocab) ? vocab : []).forEach((card, index) => {
      const id = String(card?.id || "");
      const ref = getRemoteCardRef(card, index + 1);
      if (!id || !ref) return;
      idToRef.set(id, ref);
      refToId.set(ref, id);
    });
    return {
      toRef(id) {
        const value = String(id || "");
        return value ? idToRef.get(value) || "" : "";
      },
      toId(ref) {
        const value = String(ref || "");
        return value ? refToId.get(value) || "" : "";
      }
    };
  }

  function compactCardIdList(cardIds, vocab, { sort = false } = {}) {
    const codec = createCardRefCodec(vocab || []);
    const seen = new Set();
    const output = [];
    (Array.isArray(cardIds) ? cardIds : []).forEach((id) => {
      const ref = codec.toRef(id);
      if (!ref || seen.has(ref)) return;
      seen.add(ref);
      output.push(ref);
    });
    return sort ? output.sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : output;
  }

  function expandCardIdList(cardRefs, vocab) {
    const codec = createCardRefCodec(vocab || []);
    const seen = new Set();
    const output = [];
    (Array.isArray(cardRefs) ? cardRefs : []).forEach((ref) => {
      const id = codec.toId(ref);
      if (!id || seen.has(id)) return;
      seen.add(id);
      output.push(id);
    });
    return output;
  }

  function makeModeMembershipSpec(allRefs, flagsByRef, mode) {
    const enabled = [];
    const disabled = [];
    allRefs.forEach((ref) => {
      const flags = flagsByRef[ref] || { learn: true, practice: true };
      if (flags[mode] !== false) enabled.push(ref);
      else disabled.push(ref);
    });
    if (!disabled.length) return { type: "all" };
    if (!enabled.length) return { type: "none" };
    if (enabled.length <= disabled.length) return { type: "enabled", ids: enabled };
    return { type: "disabled", ids: disabled };
  }

  function buildFlagsBundlePayload(vocab) {
    const cards = Array.isArray(vocab) ? vocab : [];
    const codec = createCardRefCodec(cards);
    const allRefs = compactCardIdList(cards.map((card) => card?.id), cards, { sort: true });
    const flagsByRef = {};
    cards.forEach((card) => {
      const ref = codec.toRef(card?.id);
      if (ref) flagsByRef[ref] = normalizeCardFlags(card);
    });
    return {
      version: 1,
      idEncoding: "idx-v1",
      modes: {
        learn: makeModeMembershipSpec(allRefs, flagsByRef, "learn"),
        practice: makeModeMembershipSpec(allRefs, flagsByRef, "practice")
      }
    };
  }

  function expandModeMembershipSpec(allRefs, spec) {
    const ids = Array.isArray(spec?.ids) ? spec.ids.map(String) : [];
    const idSet = new Set(ids);
    if (spec?.type === "none") return new Set();
    if (spec?.type === "enabled") return new Set(ids);
    if (spec?.type === "disabled") return new Set(allRefs.filter((id) => !idSet.has(id)));
    return new Set(allRefs);
  }

  function flagsMapFromBundle(vocab, payload) {
    const cards = Array.isArray(vocab) ? vocab : [];
    const codec = createCardRefCodec(cards);
    const allRefs = compactCardIdList(cards.map((card) => card?.id), cards, { sort: true });
    const learn = expandModeMembershipSpec(allRefs, payload?.modes?.learn);
    const practice = expandModeMembershipSpec(allRefs, payload?.modes?.practice);
    const map = {};
    cards.forEach((card) => {
      const localId = String(card?.id || "");
      const ref = codec.toRef(localId);
      if (!localId || !ref) return;
      map[localId] = { learn: learn.has(ref), practice: practice.has(ref) };
    });
    return map;
  }

  function applyFlagsMapToVocab(vocab, flagsMap) {
    return (Array.isArray(vocab) ? vocab : [])
      .map((card) => {
        const flags = flagsMap[String(card?.id || "")] || { learn: true, practice: true };
        return { ...card, learn: flags.learn !== false, practice: flags.practice !== false };
      })
      .sort((a, b) => (a.index || 0) - (b.index || 0));
  }

  function applyFlagsBundleToVocab(vocab, payload) {
    if (!payload || typeof payload !== "object") return applyFlagsMapToVocab(vocab, {});
    return applyFlagsMapToVocab(vocab, flagsMapFromBundle(vocab, payload));
  }

  function normalizeIdList(ids) {
    const seen = new Set();
    const output = [];
    (Array.isArray(ids) ? ids : []).forEach((id) => {
      const value = String(id || "").trim();
      if (!value || seen.has(value)) return;
      seen.add(value);
      output.push(value);
    });
    return output;
  }

  function makeVisibilityModeSpec(allIds, cardFlags, mode) {
    const ids = normalizeIdList(allIds);
    if (!ids.length) return { type: "all" };
    const enabled = [];
    const disabled = [];
    ids.forEach((id) => {
      const flags = cardFlags?.[id] || { learn: true, practice: true };
      if (flags[mode] !== false) enabled.push(id);
      else disabled.push(id);
    });
    if (!disabled.length) return { type: "all" };
    if (!enabled.length) return { type: "none" };
    if (enabled.length <= disabled.length) return { type: "enabled", ids: enabled };
    return { type: "disabled", ids: disabled };
  }

  function isAllVisibilitySpec(spec) {
    return !spec || !spec.type || spec.type === "all" || (Array.isArray(spec.ids) && !spec.ids.length && spec.type !== "none");
  }

  function buildVisibilityDeckIdMap(state) {
    const byDeck = {};
    const allSetId = window.HSKFlashcards?.constants?.ALL_SET_ID || "all_cards";
    normalizeIdList((state?.vocab || []).map((card) => card?.id)).forEach((id) => {
      if (!byDeck[allSetId]) byDeck[allSetId] = [];
      byDeck[allSetId].push(id);
    });
    (Array.isArray(state?.sentenceCards) ? state.sentenceCards : []).forEach((card) => {
      const deckId = String(card?.deckId || "").trim();
      const id = String(card?.id || "").trim();
      if (!deckId || !id) return;
      if (!byDeck[deckId]) byDeck[deckId] = [];
      byDeck[deckId].push(id);
    });
    Object.keys(byDeck).forEach((deckId) => { byDeck[deckId] = normalizeIdList(byDeck[deckId]); });
    return byDeck;
  }

  function buildBuiltinVisibilityPayload(visibility, state) {
    const deckIds = buildVisibilityDeckIdMap(state);
    const source = visibility?.byDeck && typeof visibility.byDeck === "object" ? visibility.byDeck : {};
    const deckIdSet = new Set([...Object.keys(deckIds), ...Object.keys(source)]);
    const decks = {};
    [...deckIdSet].sort().forEach((deckId) => {
      const ids = deckIds[deckId] || Object.keys(source[deckId]?.cards || {}).sort();
      const cards = source[deckId]?.cards || {};
      const learn = makeVisibilityModeSpec(ids, cards, "learn");
      const practice = makeVisibilityModeSpec(ids, cards, "practice");
      if (isAllVisibilitySpec(learn) && isAllVisibilitySpec(practice)) return;
      decks[deckId] = { learn, practice };
    });
    return {
      version: 3,
      visibilityEncoding: "mode-membership-v1",
      idEncoding: "local-card-id-v1",
      vocabMigrated: visibility?.vocabMigrated === true,
      decks
    };
  }

  ns.syncCodecVisibility = {
    buildVisibilityDeckIdMap,
    buildBuiltinVisibilityPayload
  };

  function getNamedSetsMap(sets) {
    return {};
  }

  function sameSetDoc(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.name !== b.name || a.cardIds.length !== b.cardIds.length) return false;
    return a.cardIds.every((id, index) => id === b.cardIds[index]);
  }

  function buildSetsRaw(docGroups, vocab, allSetId) {
    return { byId: {}, order: [] };
  }

  ns.syncCodec = {
    stripCards,
    sameCardList,
    createCardRefCodec,
    compactCardIdList,
    expandCardIdList,
    buildFlagsBundlePayload,
    applyFlagsBundleToVocab,
    buildBuiltinVisibilityPayload,
    buildVisibilityDeckIdMap,
    getNamedSetsMap,
    sameSetDoc,
    buildSetsRaw
  };
})(window.HSKFlashcards);
