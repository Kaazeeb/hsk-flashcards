window.HSKFlashcards = window.HSKFlashcards || {};

/**
 * Remote sync codec.
 *
 * Local vocabulary card ids are descriptive. Supabase review events store compact
 * refs such as `idx:300` so URLs and event rows stay small and stable.
 */
(function (ns) {
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

  ns.syncCodec = { createCardRefCodec };
})(window.HSKFlashcards);
