import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// These data modules have no runtime imports; use the existing compiler and Node test runner.
function typeScriptModuleUrl(path) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const [
  { breedDefinitions },
  { englishBreedText },
  { factDefinitions },
  { englishFactText },
  { japaneseFactText },
  { periodDefinitions, quizDefinitions },
  { englishPeriodText, englishQuizText },
  { japanesePeriodText },
] = await Promise.all([
  import(typeScriptModuleUrl("../app/breed-definitions.ts")),
  import(typeScriptModuleUrl("../app/breeds-en.ts")),
  import(typeScriptModuleUrl("../app/fact-definitions.ts")),
  import(typeScriptModuleUrl("../app/facts-en.ts")),
  import(typeScriptModuleUrl("../app/facts-ja.ts")),
  import(typeScriptModuleUrl("../app/activity-definitions.ts")),
  import(typeScriptModuleUrl("../app/activities-en.ts")),
  import(typeScriptModuleUrl("../app/activities-ja.ts")),
]);

test("English breed text covers exactly the 12 stable catalog IDs", () => {
  assert.equal(Object.keys(englishBreedText).length, 12);
  assert.deepEqual(
    Object.keys(englishBreedText).sort(),
    breedDefinitions.map((breed) => breed.id).sort(),
  );
});

test("English breed entries contain every text field and cannot override shared facts", () => {
  const fields = [
    "name",
    "catchphrase",
    "intro",
    "trait",
    "appearance",
    "personality",
    "detail",
    "sourceName",
  ].sort();
  for (const [id, text] of Object.entries(englishBreedText)) {
    assert.deepEqual(Object.keys(text).sort(), fields, id);
    for (const field of fields) {
      assert.equal(typeof text[field], "string", `${id}.${field}`);
      assert.ok(text[field].trim().length > 0, `${id}.${field} must not be blank`);
    }
  }
});

test("English breed names and attribution match their shared catalog entries", () => {
  // The existing publishers' English name/acronym, with the CFA explanation translated.
  const sourceNames = new Map([
    ["www.ipet-ins.com", "Daiichi ipet Insurance Co., Ltd."],
    ["cfa.org", "CFA (cat registry)"],
  ]);
  for (const breed of breedDefinitions) {
    const text = englishBreedText[breed.id];
    assert.equal(text.name.toUpperCase(), breed.english, `${breed.id}.name`);
    const sourceName = sourceNames.get(new URL(breed.source).hostname);
    assert.ok(sourceName, `${breed.id} needs an explicit English source name`);
    assert.equal(text.sourceName, sourceName, `${breed.id}.sourceName`);
  }
});

test("English breed text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in this catalog, including publisher names.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [id, text] of Object.entries(englishBreedText)) {
    for (const [field, value] of Object.entries(text)) {
      assert.doesNotMatch(value, japanese, `${id}.${field}`);
    }
  }
});

test("English fact text covers exactly the 12 stable catalog IDs", () => {
  assert.equal(Object.keys(englishFactText).length, 12);
  assert.deepEqual(
    Object.keys(englishFactText).sort(),
    factDefinitions.map((fact) => fact.id).sort(),
  );
});

test("English fact entries contain every text field and cannot override shared data", () => {
  const fields = ["label", "tag", "title", "body", "tip", "sound"].sort();
  for (const [id, text] of Object.entries(englishFactText)) {
    assert.deepEqual(Object.keys(text).sort(), fields, id);
    for (const field of fields) {
      assert.equal(typeof text[field], "string", `${id}.${field}`);
      assert.ok(text[field].trim().length > 0, `${id}.${field} must not be blank`);
    }
  }
});

test("English facts retain the existing English tags and scene exclamations", () => {
  for (const { id } of factDefinitions) {
    assert.equal(englishFactText[id].tag, japaneseFactText[id].tag, `${id}.tag`);
    assert.equal(englishFactText[id].sound, japaneseFactText[id].sound, `${id}.sound`);
  }
});

test("English fact text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in this catalog.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [id, text] of Object.entries(englishFactText)) {
    for (const [field, value] of Object.entries(text)) {
      assert.doesNotMatch(value, japanese, `${id}.${field}`);
    }
  }
});

test("English activity text covers exactly the 4 period and 3 quiz IDs", () => {
  for (const [definitions, text, count] of [
    [periodDefinitions, englishPeriodText, 4],
    [quizDefinitions, englishQuizText, 3],
  ]) {
    assert.equal(Object.keys(text).length, count);
    assert.deepEqual(Object.keys(text).sort(), definitions.map((item) => item.id).sort());
  }
});

test("English activity entries contain complete text only, including all quiz choices", () => {
  for (const [text, fields] of [
    [englishPeriodText, ["label", "headline", "text", "mood"]],
    [englishQuizText, ["q", "choices", "explain"]],
  ]) {
    for (const [id, item] of Object.entries(text)) {
      assert.deepEqual(Object.keys(item).sort(), [...fields].sort(), id);
      for (const field of fields) {
        const value = item[field];
        if (field === "choices") {
          assert.ok(Array.isArray(value), `${id}.${field}`);
          assert.equal(value.length, 3, `${id}.${field}`);
        } else {
          assert.equal(typeof value, "string", `${id}.${field}`);
        }
        for (const entry of Array.isArray(value) ? value : [value]) {
          assert.equal(typeof entry, "string", `${id}.${field}`);
          assert.ok(entry.trim().length > 0, `${id}.${field} must not be blank`);
        }
      }
    }
  }
});

test("English periods retain the existing English mood labels", () => {
  for (const { id } of periodDefinitions) {
    assert.equal(englishPeriodText[id].mood, japanesePeriodText[id].mood, id);
  }
});

test("English quiz choices retain the Japanese order, correct answer, and breed association", () => {
  // Reviewed translations in the original choice order; Japanese wording is pinned by activity.test.
  const expected = {
    "ragdoll-eyes": {
      breedId: "ragdoll",
      answer: 1,
      choices: [
        englishBreedText["american-shorthair"].name,
        englishBreedText.ragdoll.name,
        englishBreedText["russian-blue"].name,
      ],
    },
    "minuet-roots": {
      breedId: "minuet",
      answer: 0,
      choices: [
        `Persian-related cats × ${englishBreedText.munchkin.name}`,
        `${englishBreedText.bengal.name} × ${englishBreedText["russian-blue"].name}`,
        `${englishBreedText["maine-coon"].name} × ${englishBreedText.ragdoll.name}`,
      ],
    },
    "bengal-rosettes": {
      breedId: "bengal",
      answer: 2,
      choices: ["Straight stripes", "Solid white", "Ring-like spots"],
    },
  };
  for (const { id, answer, breed } of quizDefinitions) {
    assert.deepEqual(englishQuizText[id].choices, expected[id].choices, `${id}.choices`);
    assert.equal(answer, expected[id].answer, `${id}.answer`);
    assert.equal(breedDefinitions[breed].id, expected[id].breedId, `${id}.breed`);
  }
});

test("English activity text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in either activity catalog.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const text of [englishPeriodText, englishQuizText]) {
    for (const [id, item] of Object.entries(text)) {
      for (const [field, value] of Object.entries(item)) {
        for (const entry of Array.isArray(value) ? value : [value]) {
          assert.doesNotMatch(entry, japanese, `${id}.${field}`);
        }
      }
    }
  }
});
