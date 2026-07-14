"use strict";

const assert = require("node:assert/strict");

global.window = {
  HSKFlashcards: {
    mainRuntime: { state: {} }
  }
};

require("../../js/main-grammar-page.js");

const {
  normalizeGrammarSearchText,
  validateGrammarPayload
} = window.HSKFlashcards.mainRuntime;

function makeExample(index) {
  const zh = `我学习汉语${index}。`;
  return {
    id: `example-${index}`,
    zh,
    pinyin: `Wǒ xuéxí Hànyǔ ${index}.`,
    translationEn: `I study Chinese, example ${index}.`,
    analyses: [{ textEn: "学习 is the action demonstrated by this test fixture." }],
    parts: [{ text: zh, emphasized: false, role: "" }]
  };
}

function makePayload() {
  const officialPointIds = Array.from(
    { length: 70 },
    (_, index) => `hsk26-g1-${String(index + 1).padStart(3, "0")}`
  );
  const categories = Array.from({ length: 7 }, (_, index) => ({
    key: `category-${index + 1}`,
    labelEn: `Category ${index + 1}`,
    labelZh: `类别${index + 1}`
  }));
  const lessons = categories.map((category, index) => ({
    id: `lesson-${index + 1}`,
    level: 1,
    primaryPointIds: officialPointIds.slice(index * 10, (index + 1) * 10),
    titleEn: `Lesson ${index + 1}`,
    targetFormZh: "学习",
    categoryKey: category.key,
    categoryEn: category.labelEn,
    categoryZh: category.labelZh,
    purposeEn: "Exercise the grammar payload contract.",
    patterns: [{
      labelEn: "Test form",
      appliesToZh: ["学习"],
      pattern: "Subject + 学习 + Object",
      formationEn: "Place the verb before its object.",
      usageEn: "Describe an act of study."
    }],
    notes: [{ kind: "formation", appliesToZh: ["学习"], textEn: "This is reviewed fixture content." }],
    watchOutEn: "",
    examples: [makeExample(index * 2 + 1), makeExample(index * 2 + 2)]
  }));
  return {
    schemaVersion: "2",
    syllabusId: "hsk-2025-11",
    level: 1,
    officialPointIds,
    categories,
    lessons
  };
}

const valid = makePayload();
assert.equal(validateGrammarPayload(valid, 1), valid);

assert.equal(normalizeGrammarSearchText("Lǚxíng"), "lvxing");
assert.equal(normalizeGrammarSearchText("LU:XING"), "lvxing");
assert.equal(normalizeGrammarSearchText("lvxing"), "lvxing");
assert.equal(normalizeGrammarSearchText("Nǐ   hǎo"), "ni hao");

const wrongLevel = structuredClone(valid);
wrongLevel.level = 2;
assert.throws(() => validateGrammarPayload(wrongLevel, 1), /payload\.level/);

const duplicatePoint = structuredClone(valid);
duplicatePoint.officialPointIds[1] = duplicatePoint.officialPointIds[0];
assert.throws(() => validateGrammarPayload(duplicatePoint, 1), /expected hsk26-g1-002/);

const wrongOfficialRange = structuredClone(valid);
wrongOfficialRange.officialPointIds[69] = "hsk26-g1-999";
assert.throws(() => validateGrammarPayload(wrongOfficialRange, 1), /expected hsk26-g1-070/);

const missingPrimaryCoverage = structuredClone(valid);
missingPrimaryCoverage.lessons[6].primaryPointIds.pop();
assert.throws(() => validateGrammarPayload(missingPrimaryCoverage, 1), /missing primary lesson coverage/);

const duplicatePrimaryCoverage = structuredClone(valid);
duplicatePrimaryCoverage.lessons[1].primaryPointIds[0] = duplicatePrimaryCoverage.lessons[0].primaryPointIds[0];
assert.throws(() => validateGrammarPayload(duplicatePrimaryCoverage, 1), /duplicate value/);

const brokenParts = structuredClone(valid);
brokenParts.lessons[0].examples[0].parts[0].text = "different";
assert.throws(() => validateGrammarPayload(brokenParts, 1), /do not reconstruct/);

const wrongSchema = structuredClone(valid);
wrongSchema.schemaVersion = "1";
assert.throws(() => validateGrammarPayload(wrongSchema, 1), /schemaVersion/);

const missingApplicability = structuredClone(valid);
delete missingApplicability.lessons[0].notes[0].appliesToZh;
assert.throws(() => validateGrammarPayload(missingApplicability, 1), /appliesToZh/);

const duplicateApplicability = structuredClone(valid);
duplicateApplicability.lessons[0].patterns[0].appliesToZh = ["学习", "学习"];
assert.throws(() => validateGrammarPayload(duplicateApplicability, 1), /duplicate value/);

console.log("Grammar page controller tests passed.");
