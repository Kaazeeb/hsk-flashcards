(function (ns) {
  function createButton(label, onClick, className = "", attrs = {}) {
    const button = document.createElement("button");
    button.type = attrs.type || "button";
    button.textContent = label;
    if (className) button.className = className;
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "type") return;
      if (key === "dataset" && value && typeof value === "object") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          button.dataset[dataKey] = dataValue;
        });
        return;
      }
      if (key in button) {
        button[key] = value;
      } else {
        button.setAttribute(key, String(value));
      }
    });
    if (typeof onClick === "function") button.addEventListener("click", onClick);
    return button;
  }

  function clearNode(node) {
    if (node) node.innerHTML = "";
  }

  function setBar(fillEl, labelEl, numerator, denominator) {
    const safeTotal = Math.max(0, Number(denominator) || 0);
    const safeValue = Math.max(0, Number(numerator) || 0);
    const percent = safeTotal ? Math.min(100, (safeValue / safeTotal) * 100) : 0;
    if (fillEl) fillEl.style.width = `${percent}%`;
    if (labelEl) labelEl.textContent = `${safeValue} / ${safeTotal}`;
  }

  function updateResult(target, text = "", resultClass = "") {
    if (!target) return;
    target.textContent = text;
    target.className = "result";
    if (resultClass) target.classList.add(resultClass);
  }

  function scheduleStudyAreaFocus(elements, { preferAnswer = false } = {}) {
    if (!elements) return;
    const run = () => {
      const target = preferAnswer && elements.answerArea ? elements.answerArea : (elements.flashcard || elements.cardPanel || elements.answerArea);
      if (!target || typeof target.getBoundingClientRect !== "function") return;
      const rect = target.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const topMargin = Math.max(24, viewportHeight * 0.12);
      const bottomMargin = Math.max(36, viewportHeight * 0.22);
      if (rect.top < topMargin || rect.bottom > viewportHeight - bottomMargin) {
        target.scrollIntoView({ behavior: "auto", block: "center" });
      }
    };
    requestAnimationFrame(run);
    setTimeout(run, 80);
  }

  ns.ui = {
    createButton,
    clearNode,
    setBar,
    updateResult,
    scheduleStudyAreaFocus
  };
})(window.HSKFlashcards);
