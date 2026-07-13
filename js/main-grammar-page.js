/**
 * Read-only HSK 1-3 grammar reference page.
 */
(function (ns) {
  const runtime = ns.mainRuntime = ns.mainRuntime || {};
  const { state } = runtime;
  const GRAMMAR_SCHEMA_VERSION = "1";
  const GRAMMAR_SYLLABUS_ID = "hsk-2025-11";
  const GRAMMAR_LEVELS = Object.freeze([1, 2, 3]);
  const EXPECTED_POINT_COUNTS = Object.freeze({ 1: 70, 2: 78, 3: 96 });
  const EXPECTED_CATEGORY_COUNTS = Object.freeze({ 1: 7, 2: 8, 3: 7 });
  const NOTE_KINDS = new Set(["formation", "usage", "constraint", "pragmatics"]);

  const grammarState = {
    selectedLevel: 1,
    categoryKey: "",
    query: "",
    openLessonId: "",
    dataByLevel: new Map(),
    errorByLevel: new Map(),
    inFlightByLevel: new Map(),
    eventsBound: false
  };

  function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
  }

  function invalid(path, reason) {
    throw new Error(`Invalid grammar data at ${path}: ${reason}`);
  }

  function requireRecord(value, path) {
    if (!isRecord(value)) invalid(path, "expected an object");
    return value;
  }

  function requireArray(value, path, { min = 0, max = Infinity } = {}) {
    if (!Array.isArray(value)) invalid(path, "expected an array");
    if (value.length < min) invalid(path, `expected at least ${min} item${min === 1 ? "" : "s"}`);
    if (value.length > max) invalid(path, `expected no more than ${max} items`);
    return value;
  }

  function requireString(value, path, { allowEmpty = false } = {}) {
    if (typeof value !== "string") invalid(path, "expected a string");
    if (!allowEmpty && !value.trim()) invalid(path, "expected a non-empty string");
    return value;
  }

  function requireUnique(value, seen, path) {
    if (seen.has(value)) invalid(path, `duplicate value ${value}`);
    seen.add(value);
  }

  function validateGrammarPayload(payload, requestedLevel) {
    requireRecord(payload, "payload");
    if (payload.schemaVersion !== GRAMMAR_SCHEMA_VERSION) invalid("payload.schemaVersion", `expected ${GRAMMAR_SCHEMA_VERSION}`);
    if (payload.syllabusId !== GRAMMAR_SYLLABUS_ID) invalid("payload.syllabusId", `expected ${GRAMMAR_SYLLABUS_ID}`);
    if (!GRAMMAR_LEVELS.includes(payload.level) || payload.level !== requestedLevel) invalid("payload.level", `expected HSK ${requestedLevel}`);

    const expectedPointCount = EXPECTED_POINT_COUNTS[requestedLevel];
    const officialIds = requireArray(payload.officialPointIds, "payload.officialPointIds", {
      min: expectedPointCount,
      max: expectedPointCount
    });
    const officialIdSet = new Set();
    officialIds.forEach((pointId, index) => {
      requireString(pointId, `payload.officialPointIds[${index}]`);
      const expectedPointId = `hsk26-g${requestedLevel}-${String(index + 1).padStart(3, "0")}`;
      if (pointId !== expectedPointId) {
        invalid(`payload.officialPointIds[${index}]`, `expected ${expectedPointId}`);
      }
      requireUnique(pointId, officialIdSet, `payload.officialPointIds[${index}]`);
    });

    const expectedCategoryCount = EXPECTED_CATEGORY_COUNTS[requestedLevel];
    const categories = requireArray(payload.categories, "payload.categories", {
      min: expectedCategoryCount,
      max: expectedCategoryCount
    });
    const categoryByKey = new Map();
    categories.forEach((rawCategory, index) => {
      const path = `payload.categories[${index}]`;
      const category = requireRecord(rawCategory, path);
      const key = requireString(category.key, `${path}.key`);
      requireString(category.labelEn, `${path}.labelEn`);
      requireString(category.labelZh, `${path}.labelZh`);
      if (categoryByKey.has(key)) invalid(`${path}.key`, `duplicate category key ${key}`);
      categoryByKey.set(key, category);
    });

    const lessons = requireArray(payload.lessons, "payload.lessons", { min: 1 });
    const lessonIds = new Set();
    const exampleIds = new Set();
    const primaryPointIds = new Set();
    const usedCategoryKeys = new Set();
    lessons.forEach((rawLesson, lessonIndex) => {
      const path = `payload.lessons[${lessonIndex}]`;
      const lesson = requireRecord(rawLesson, path);
      const lessonId = requireString(lesson.id, `${path}.id`);
      requireUnique(lessonId, lessonIds, `${path}.id`);
      if (lesson.level !== requestedLevel) invalid(`${path}.level`, `expected HSK ${requestedLevel}`);
      requireArray(lesson.primaryPointIds, `${path}.primaryPointIds`, { min: 1 }).forEach((pointId, pointIndex) => {
        const pointPath = `${path}.primaryPointIds[${pointIndex}]`;
        requireString(pointId, pointPath);
        if (!officialIdSet.has(pointId)) invalid(pointPath, `unknown official point ${pointId}`);
        requireUnique(pointId, primaryPointIds, pointPath);
      });
      requireString(lesson.titleEn, `${path}.titleEn`);
      requireString(lesson.targetFormZh, `${path}.targetFormZh`, { allowEmpty: true });
      const categoryKey = requireString(lesson.categoryKey, `${path}.categoryKey`);
      const category = categoryByKey.get(categoryKey);
      if (!category) invalid(`${path}.categoryKey`, `unknown category ${categoryKey}`);
      if (lesson.categoryEn !== category.labelEn) invalid(`${path}.categoryEn`, "does not match its category label");
      if (lesson.categoryZh !== category.labelZh) invalid(`${path}.categoryZh`, "does not match its category label");
      usedCategoryKeys.add(categoryKey);
      requireString(lesson.purposeEn, `${path}.purposeEn`);
      requireString(lesson.watchOutEn, `${path}.watchOutEn`, { allowEmpty: true });

      requireArray(lesson.patterns, `${path}.patterns`).forEach((rawPattern, patternIndex) => {
        const patternPath = `${path}.patterns[${patternIndex}]`;
        const pattern = requireRecord(rawPattern, patternPath);
        requireString(pattern.labelEn, `${patternPath}.labelEn`, { allowEmpty: true });
        requireString(pattern.pattern, `${patternPath}.pattern`);
        requireString(pattern.formationEn, `${patternPath}.formationEn`, { allowEmpty: true });
        requireString(pattern.usageEn, `${patternPath}.usageEn`, { allowEmpty: true });
      });

      requireArray(lesson.notes, `${path}.notes`, { min: 1, max: 4 }).forEach((rawNote, noteIndex) => {
        const notePath = `${path}.notes[${noteIndex}]`;
        const note = requireRecord(rawNote, notePath);
        if (!NOTE_KINDS.has(note.kind)) invalid(`${notePath}.kind`, `unknown note kind ${String(note.kind)}`);
        requireString(note.textEn, `${notePath}.textEn`);
      });

      requireArray(lesson.examples, `${path}.examples`, { min: 2 }).forEach((rawExample, exampleIndex) => {
        const examplePath = `${path}.examples[${exampleIndex}]`;
        const example = requireRecord(rawExample, examplePath);
        const exampleId = requireString(example.id, `${examplePath}.id`);
        requireUnique(exampleId, exampleIds, `${examplePath}.id`);
        const chinese = requireString(example.zh, `${examplePath}.zh`);
        requireString(example.pinyin, `${examplePath}.pinyin`);
        requireString(example.translationEn, `${examplePath}.translationEn`);

        requireArray(example.analyses, `${examplePath}.analyses`, { min: 1 }).forEach((rawAnalysis, analysisIndex) => {
          const analysisPath = `${examplePath}.analyses[${analysisIndex}]`;
          const analysis = requireRecord(rawAnalysis, analysisPath);
          requireString(analysis.textEn, `${analysisPath}.textEn`);
        });

        const parts = requireArray(example.parts, `${examplePath}.parts`, { min: 1 });
        let reconstructed = "";
        parts.forEach((rawPart, partIndex) => {
          const partPath = `${examplePath}.parts[${partIndex}]`;
          const part = requireRecord(rawPart, partPath);
          const text = requireString(part.text, `${partPath}.text`);
          if (typeof part.emphasized !== "boolean") invalid(`${partPath}.emphasized`, "expected a boolean");
          requireString(part.role, `${partPath}.role`, { allowEmpty: !part.emphasized });
          reconstructed += text;
        });
        if (reconstructed !== chinese) invalid(`${examplePath}.parts`, "text parts do not reconstruct the Chinese example exactly");
      });
    });

    categories.forEach((category, index) => {
      if (!usedCategoryKeys.has(category.key)) invalid(`payload.categories[${index}]`, "category has no lessons");
    });
    officialIds.forEach((pointId) => {
      if (!primaryPointIds.has(pointId)) invalid("payload.lessons", `missing primary lesson coverage for ${pointId}`);
    });
    return payload;
  }

  function normalizeGrammarSearchText(value) {
    let text = String(value == null ? "" : value).normalize("NFKC").toLocaleLowerCase("en-US");
    text = text.replace(/u:/g, "v").replace(/[üǖǘǚǜ]/g, "v");
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/gu, " ").trim();
  }

  function getLessonSearchText(lesson) {
    const fields = [
      lesson.titleEn,
      lesson.targetFormZh,
      lesson.categoryEn,
      lesson.categoryZh,
      lesson.purposeEn,
      lesson.watchOutEn
    ];
    lesson.patterns.forEach((pattern) => fields.push(pattern.labelEn, pattern.pattern, pattern.formationEn, pattern.usageEn));
    lesson.notes.forEach((note) => fields.push(note.textEn));
    lesson.examples.forEach((example) => {
      fields.push(example.pinyin);
      example.analyses.forEach((analysis) => fields.push(analysis.textEn));
    });
    return normalizeGrammarSearchText(fields.join(" "));
  }

  function discardRegisteredLevel(level) {
    if (ns.grammarCatalogByLevel == null) return;
    if (!isRecord(ns.grammarCatalogByLevel)) {
      ns.grammarCatalogByLevel = {};
      return;
    }
    try {
      delete ns.grammarCatalogByLevel[level];
    } catch (error) {
      ns.grammarCatalogByLevel[level] = undefined;
    }
  }

  function getRegisteredLevel(level) {
    const registry = ns.grammarCatalogByLevel;
    if (!isRecord(registry) || !Object.prototype.hasOwnProperty.call(registry, level)) return null;
    return registry[level];
  }

  function requestGrammarLevel(level) {
    const registered = getRegisteredLevel(level);
    if (registered) {
      try {
        return Promise.resolve(validateGrammarPayload(registered, level));
      } catch (error) {
        discardRegisteredLevel(level);
      }
    } else if (ns.grammarCatalogByLevel != null && !isRecord(ns.grammarCatalogByLevel)) {
      ns.grammarCatalogByLevel = {};
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const url = new URL(`js/data/grammar/grammar-lessons-hsk${level}.js`, document.baseURI);
      if (url.origin !== window.location.origin) {
        reject(new Error("Grammar content URL is not same-origin."));
        return;
      }

      script.src = url.href;
      script.async = true;
      script.dataset.grammarLevel = String(level);

      const cleanup = () => {
        script.onload = null;
        script.onerror = null;
        script.remove();
      };
      script.onload = () => {
        try {
          const payload = getRegisteredLevel(level);
          if (!payload) throw new Error(`HSK ${level} grammar content did not register.`);
          resolve(validateGrammarPayload(payload, level));
        } catch (error) {
          discardRegisteredLevel(level);
          reject(error);
        } finally {
          cleanup();
        }
      };
      script.onerror = () => {
        cleanup();
        discardRegisteredLevel(level);
        reject(new Error(`HSK ${level} grammar content could not be loaded.`));
      };
      document.head.appendChild(script);
    });
  }

  function isSelectedGrammarPage(level) {
    return state.currentPage === "grammar" && grammarState.selectedLevel === level;
  }

  function startGrammarLevelLoad(level) {
    if (grammarState.dataByLevel.has(level)) return Promise.resolve(grammarState.dataByLevel.get(level));
    if (grammarState.inFlightByLevel.has(level)) return grammarState.inFlightByLevel.get(level);
    grammarState.errorByLevel.delete(level);

    let trackedPromise;
    trackedPromise = requestGrammarLevel(level).then((payload) => {
      if (grammarState.inFlightByLevel.get(level) === trackedPromise) grammarState.inFlightByLevel.delete(level);
      grammarState.dataByLevel.set(level, payload);
      grammarState.errorByLevel.delete(level);
      if (isSelectedGrammarPage(level)) renderGrammarPage();
      return payload;
    }, (error) => {
      if (grammarState.inFlightByLevel.get(level) === trackedPromise) grammarState.inFlightByLevel.delete(level);
      grammarState.errorByLevel.set(level, error instanceof Error ? error : new Error(String(error || "Unknown load error")));
      console.warn(`HSK ${level} grammar content was rejected.`, error);
      if (isSelectedGrammarPage(level)) renderGrammarPage();
      return null;
    });
    grammarState.inFlightByLevel.set(level, trackedPromise);
    return trackedPromise;
  }

  function createElement(tagName, className = "", text = "") {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function appendMarkedChineseText(parent, text) {
    const source = String(text || "");
    let offset = 0;
    for (const match of source.matchAll(/[\u3400-\u9fff\uf900-\ufaff]+/gu)) {
      if (match.index > offset) parent.appendChild(document.createTextNode(source.slice(offset, match.index)));
      const chinese = createElement("span", "", match[0]);
      chinese.lang = "zh-Hans";
      parent.appendChild(chinese);
      offset = match.index + match[0].length;
    }
    if (offset < source.length) parent.appendChild(document.createTextNode(source.slice(offset)));
  }

  function setGrammarStatus(text, tone = "muted") {
    const target = state.elements.grammarStatus;
    if (!target) return;
    target.textContent = text;
    target.className = `grammar-status ${tone}`;
  }

  function setResultsBusy(busy) {
    if (state.elements.grammarResults) state.elements.grammarResults.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function renderLevelControls() {
    state.elements.grammarLevelButtons.forEach((button) => {
      const selected = Number(button.dataset.grammarLevel) === grammarState.selectedLevel;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.classList.toggle("active", selected);
    });
  }

  function renderUnavailableControls() {
    const select = state.elements.grammarCategorySelect;
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "All categories";
    select.replaceChildren(option);
    select.value = "";
    select.disabled = true;
    state.elements.grammarSearchInput.disabled = true;
  }

  function renderCategoryControls(payload) {
    const select = state.elements.grammarCategorySelect;
    if (grammarState.categoryKey && !payload.categories.some((category) => category.key === grammarState.categoryKey)) {
      grammarState.categoryKey = "";
    }
    const fragment = document.createDocumentFragment();
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All categories";
    fragment.appendChild(allOption);
    payload.categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.key;
      option.textContent = category.labelEn;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
    select.value = grammarState.categoryKey;
    select.disabled = false;
    state.elements.grammarSearchInput.disabled = false;
    if (state.elements.grammarSearchInput.value !== grammarState.query) {
      state.elements.grammarSearchInput.value = grammarState.query;
    }
  }

  function renderStateMessage(title, detail, { retry = false } = {}) {
    const container = createElement("div", "grammar-state-message");
    container.appendChild(createElement("h3", "grammar-state-title", title));
    if (detail) container.appendChild(createElement("p", "grammar-state-detail", detail));
    if (retry) {
      const button = createElement("button", "secondary grammar-retry-btn", "Retry");
      button.type = "button";
      button.dataset.grammarAction = "retry";
      container.appendChild(button);
    }
    state.elements.grammarResults.replaceChildren(container);
  }

  function appendMixedCategoryText(parent, categoryEn, categoryZh) {
    parent.appendChild(document.createTextNode(categoryEn));
    if (categoryZh) {
      parent.appendChild(document.createTextNode(" · "));
      const chinese = createElement("span", "", categoryZh);
      chinese.lang = "zh-Hans";
      parent.appendChild(chinese);
    }
  }

  function renderPatterns(lesson) {
    const section = createElement("section", "grammar-lesson-section");
    if (!lesson.patterns.length) {
      section.appendChild(createElement("h4", "grammar-section-title", "Classification"));
      const classification = createElement("p", "grammar-classification");
      appendMixedCategoryText(classification, lesson.categoryEn, lesson.categoryZh);
      section.appendChild(classification);
      return section;
    }

    section.appendChild(createElement("h4", "grammar-section-title", "Form"));
    lesson.patterns.forEach((pattern) => {
      const patternBlock = createElement("div", "grammar-pattern");
      if (pattern.labelEn) patternBlock.appendChild(createElement("p", "grammar-pattern-label", pattern.labelEn));
      const formula = createElement("code", "grammar-pattern-code");
      appendMarkedChineseText(formula, pattern.pattern);
      patternBlock.appendChild(formula);
      if (pattern.formationEn) patternBlock.appendChild(createElement("p", "grammar-pattern-note", pattern.formationEn));
      if (pattern.usageEn) patternBlock.appendChild(createElement("p", "grammar-pattern-note", pattern.usageEn));
      section.appendChild(patternBlock);
    });
    return section;
  }

  function renderExample(example) {
    const article = createElement("article", "grammar-example");
    const chinese = createElement("p", "grammar-example-zh");
    chinese.lang = "zh-Hans";
    example.parts.forEach((part) => {
      if (!part.emphasized) {
        chinese.appendChild(document.createTextNode(part.text));
        return;
      }
      const emphasis = createElement("strong", "grammar-target", part.text);
      emphasis.dataset.grammarRole = part.role;
      chinese.appendChild(emphasis);
    });
    article.appendChild(chinese);
    const pinyin = createElement("p", "grammar-example-pinyin", example.pinyin);
    pinyin.lang = "zh-Latn-pinyin";
    article.appendChild(pinyin);
    article.appendChild(createElement("p", "grammar-example-translation", example.translationEn));

    const analysis = createElement("div", "grammar-example-analysis");
    analysis.appendChild(createElement("span", "grammar-example-analysis-label", "Analysis"));
    example.analyses.forEach((entry) => analysis.appendChild(createElement("p", "", entry.textEn)));
    article.appendChild(analysis);
    return article;
  }

  function renderLessonBody(lesson) {
    const body = createElement("div", "grammar-lesson-body");

    const purpose = createElement("section", "grammar-lesson-section");
    purpose.appendChild(createElement("h4", "grammar-section-title", "Purpose"));
    purpose.appendChild(createElement("p", "", lesson.purposeEn));
    body.appendChild(purpose);
    body.appendChild(renderPatterns(lesson));

    const notes = createElement("section", "grammar-lesson-section");
    notes.appendChild(createElement("h4", "grammar-section-title", "How it works"));
    const noteList = createElement("ul", "grammar-note-list");
    lesson.notes.forEach((note) => noteList.appendChild(createElement("li", "", note.textEn)));
    notes.appendChild(noteList);
    body.appendChild(notes);

    const examples = createElement("section", "grammar-lesson-section");
    examples.appendChild(createElement("h4", "grammar-section-title", "Examples"));
    lesson.examples.forEach((example) => examples.appendChild(renderExample(example)));
    body.appendChild(examples);

    if (lesson.watchOutEn) {
      const caution = createElement("section", "grammar-lesson-section grammar-watch-out");
      caution.appendChild(createElement("h4", "grammar-section-title", "Watch out"));
      caution.appendChild(createElement("p", "", lesson.watchOutEn));
      body.appendChild(caution);
    }
    return body;
  }

  function renderLesson(lesson, lessonIndex) {
    const details = createElement("details", "grammar-lesson");
    details.dataset.grammarLessonId = lesson.id;
    details.setAttribute("name", "grammar-lessons");
    details.open = lesson.id === grammarState.openLessonId;

    const summary = createElement("summary", "grammar-lesson-summary");
    const summaryBody = createElement("span", "grammar-summary-body");
    summaryBody.appendChild(createElement("span", "grammar-lesson-title", lesson.titleEn));
    const target = createElement("span", "grammar-lesson-target", lesson.targetFormZh || lesson.categoryZh);
    target.lang = "zh-Hans";
    summaryBody.appendChild(target);
    summaryBody.appendChild(createElement("span", "grammar-lesson-meta", `HSK ${lesson.level} · ${lesson.categoryEn}`));
    summary.appendChild(summaryBody);
    details.append(summary, renderLessonBody(lesson));
    details.id = `grammar-lesson-${grammarState.selectedLevel}-${lessonIndex + 1}`;
    return details;
  }

  function getVisibleLessons(payload) {
    const query = normalizeGrammarSearchText(grammarState.query);
    return payload.lessons.filter((lesson) => {
      if (grammarState.categoryKey && lesson.categoryKey !== grammarState.categoryKey) return false;
      return !query || getLessonSearchText(lesson).includes(query);
    });
  }

  function renderLoadedGrammar(payload) {
    renderCategoryControls(payload);
    const visibleLessons = getVisibleLessons(payload);
    if (grammarState.openLessonId && !visibleLessons.some((lesson) => lesson.id === grammarState.openLessonId)) {
      grammarState.openLessonId = "";
    }

    const lessonCount = visibleLessons.length;
    setGrammarStatus(`${lessonCount} lesson${lessonCount === 1 ? "" : "s"} shown.`, "muted");
    setResultsBusy(false);
    if (!lessonCount) {
      renderStateMessage("No lessons found", "Try another category or search term.");
      return;
    }

    const byCategory = new Map(payload.categories.map((category) => [category.key, []]));
    visibleLessons.forEach((lesson) => byCategory.get(lesson.categoryKey).push(lesson));
    const fragment = document.createDocumentFragment();
    let lessonIndex = 0;
    payload.categories.forEach((category, categoryIndex) => {
      const lessons = byCategory.get(category.key);
      if (!lessons.length) return;
      const group = createElement("section", "grammar-group");
      const headingId = `grammar-group-${grammarState.selectedLevel}-${categoryIndex + 1}`;
      const heading = createElement("h3", "grammar-group-title");
      heading.id = headingId;
      appendMixedCategoryText(heading, category.labelEn, category.labelZh);
      group.setAttribute("aria-labelledby", headingId);
      group.appendChild(heading);
      lessons.forEach((lesson) => {
        group.appendChild(renderLesson(lesson, lessonIndex));
        lessonIndex += 1;
      });
      fragment.appendChild(group);
    });
    state.elements.grammarResults.replaceChildren(fragment);
  }

  function renderGrammarPage() {
    if (!state.elements?.grammarResults) return;
    renderLevelControls();
    const level = grammarState.selectedLevel;
    const payload = grammarState.dataByLevel.get(level);
    if (payload) {
      renderLoadedGrammar(payload);
      return;
    }

    renderUnavailableControls();
    if (grammarState.errorByLevel.has(level)) {
      setGrammarStatus(`HSK ${level} grammar is unavailable.`, "bad");
      setResultsBusy(false);
      renderStateMessage(
        "Grammar content unavailable",
        `HSK ${level} lessons could not be loaded or did not pass validation.`,
        { retry: true }
      );
      return;
    }

    if (!grammarState.inFlightByLevel.has(level)) startGrammarLevelLoad(level);
    setGrammarStatus(`Loading HSK ${level} grammar...`, "muted");
    setResultsBusy(true);
    renderStateMessage("Loading lessons", `Preparing the reviewed HSK ${level} grammar reference.`);
  }

  function handleLevelClick(event) {
    const level = Number(event.currentTarget.dataset.grammarLevel);
    if (!GRAMMAR_LEVELS.includes(level) || level === grammarState.selectedLevel) return;
    grammarState.selectedLevel = level;
    grammarState.categoryKey = "";
    grammarState.openLessonId = "";
    renderGrammarPage();
  }

  function handleCategoryChange(event) {
    grammarState.categoryKey = String(event.target.value || "");
    renderGrammarPage();
  }

  function handleSearchInput(event) {
    grammarState.query = String(event.target.value || "");
    renderGrammarPage();
  }

  function handleResultsClick(event) {
    const button = event.target.closest("[data-grammar-action]");
    if (!button || button.dataset.grammarAction !== "retry") return;
    const level = grammarState.selectedLevel;
    if (grammarState.inFlightByLevel.has(level) || !grammarState.errorByLevel.has(level)) return;
    grammarState.errorByLevel.delete(level);
    discardRegisteredLevel(level);
    startGrammarLevelLoad(level);
    renderGrammarPage();
    state.elements.grammarStatus.focus({ preventScroll: true });
  }

  function handleLessonToggle(event) {
    const details = event.target;
    if (!details || details.tagName !== "DETAILS" || !details.matches(".grammar-lesson[data-grammar-lesson-id]")) return;
    const lessonId = details.dataset.grammarLessonId;
    if (!details.open) {
      if (grammarState.openLessonId === lessonId) grammarState.openLessonId = "";
      return;
    }
    grammarState.openLessonId = lessonId;
    state.elements.grammarResults.querySelectorAll(".grammar-lesson[open]").forEach((other) => {
      if (other !== details) other.open = false;
    });
  }

  function bindGrammarEvents() {
    if (grammarState.eventsBound || !state.elements?.grammarResults) return;
    grammarState.eventsBound = true;
    state.elements.grammarLevelButtons.forEach((button) => button.addEventListener("click", handleLevelClick));
    state.elements.grammarCategorySelect.addEventListener("change", handleCategoryChange);
    state.elements.grammarSearchInput.addEventListener("input", handleSearchInput);
    state.elements.grammarResults.addEventListener("click", handleResultsClick);
    state.elements.grammarResults.addEventListener("toggle", handleLessonToggle, true);
  }

  Object.assign(runtime, {
    renderGrammarPage,
    bindGrammarEvents,
    normalizeGrammarSearchText,
    validateGrammarPayload
  });
})(window.HSKFlashcards);
