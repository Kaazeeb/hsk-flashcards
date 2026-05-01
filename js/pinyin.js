/**
 * Strict numeric-pinyin validation.
 *
 * Built-in cards carry a hardcoded `pinyinNumeric` answer. The app no longer
 * derives numeric tones from tone-mark pinyin at runtime because syllable
 * boundaries are ambiguous in strings such as kěnéng.
 *
 * Rules:
 * - comparison is direct;
 * - lowercase only;
 * - no spaces;
 * - no tone 5; neutral tone has no number;
 * - ü is represented by v in the hardcoded answer;
 * - erhua tone numbers come after final r, e.g. nar3, zher4.
 */
(function (ns) {
  function getExpectedPinyinNumeric(cardOrAnswer) {
    if (cardOrAnswer && typeof cardOrAnswer === "object") {
      return String(cardOrAnswer.pinyinNumeric || cardOrAnswer.pinyin_numeric || cardOrAnswer.numericPinyin || "").trim();
    }
    return String(cardOrAnswer || "").trim();
  }

  function getPinyinDisplay(cardOrAnswer) {
    return getExpectedPinyinNumeric(cardOrAnswer);
  }

  function getReviewPinyinText(card) {
    const reviewAnswer = getExpectedPinyinNumeric(card) || String(card?.pinyin || "").trim();
    return {
      reviewAnswer,
      reviewText: reviewAnswer,
      reviewSuffix: ""
    };
  }

  function normalizeUserPinyinInput(value) {
    const raw = String(value || "");
    return {
      raw,
      canonical: raw
    };
  }

  function checkPinyinAnswer(input, cardOrAnswer) {
    const guess = String(input || "");
    const expected = getExpectedPinyinNumeric(cardOrAnswer);
    const formatValid = !!expected;
    return {
      guess,
      accepted: expected ? [expected] : [],
      formatValid,
      correct: !!expected && guess === expected
    };
  }

  function shouldAutoFocusPinyinInput() {
    return !window.matchMedia || !window.matchMedia("(max-width: 760px)").matches;
  }

  function getPinyinInputPlaceholder() {
    return "ni3hao3 · nv3 · neutral tone has no number";
  }

  ns.pinyin = {
    getPinyinDisplay,
    getReviewPinyinText,
    checkPinyinAnswer,
    shouldAutoFocusPinyinInput,
    getPinyinInputPlaceholder,
    normalizeUserPinyinInput,
    canonicalizePinyinValue: getExpectedPinyinNumeric
  };
})(window.HSKFlashcards);
