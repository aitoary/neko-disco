import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Use the existing TypeScript compiler, without adding a test runner or loader.
function typeScriptModuleUrl(path, imports = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const definitionsUrl = typeScriptModuleUrl("../app/activity-definitions.ts");
const japaneseTextUrl = typeScriptModuleUrl("../app/activities-ja.ts");
const [
  { periods, quizzes },
  { periodDefinitions, quizDefinitions },
  { japanesePeriodText, japaneseQuizText },
  { breedDefinitions },
] = await Promise.all([
  import(
    typeScriptModuleUrl("../app/activities.ts", {
      "./activity-definitions": definitionsUrl,
      "./activities-ja": japaneseTextUrl,
    })
  ),
  import(definitionsUrl),
  import(japaneseTextUrl),
  import(typeScriptModuleUrl("../app/breed-definitions.ts")),
]);

test("activity catalogs have unique IDs and exactly matching Japanese keys", () => {
  for (const [definitions, text, count] of [
    [periodDefinitions, japanesePeriodText, 4],
    [quizDefinitions, japaneseQuizText, 3],
  ]) {
    assert.equal(definitions.length, count);
    const ids = definitions.map((item) => item.id);
    assert.ok(ids.every((id) => id.trim().length > 0));
    assert.equal(new Set(ids).size, count);
    assert.deepEqual(Object.keys(text).sort(), [...ids].sort());
  }
});

test("Japanese period and quiz text has no missing or blank fields or choices", () => {
  for (const [text, fields] of [
    [japanesePeriodText, ["label", "headline", "text", "mood"]],
    [japaneseQuizText, ["q", "explain"]],
  ]) {
    for (const [id, item] of Object.entries(text)) {
      for (const field of fields) {
        assert.equal(typeof item[field], "string", `${id}.${field}`);
        assert.ok(item[field].trim().length > 0, `${id}.${field} must not be blank`);
      }
    }
  }
  for (const [id, quiz] of Object.entries(japaneseQuizText)) {
    assert.equal(quiz.choices.length, 3, `${id}.choices`);
    for (const [index, choice] of quiz.choices.entries()) {
      assert.equal(typeof choice, "string", `${id}.choices[${index}]`);
      assert.ok(choice.trim().length > 0, `${id}.choices[${index}] must not be blank`);
    }
  }
});

test("period and quiz breed references and quiz answer positions remain valid and unchanged", () => {
  for (const item of [...periods, ...quizzes]) {
    assert.ok(Number.isInteger(item.breed));
    assert.ok(item.breed >= 0 && item.breed < breedDefinitions.length);
  }
  for (const quiz of quizzes) {
    assert.ok(Number.isInteger(quiz.answer));
    assert.ok(quiz.answer >= 0 && quiz.answer < quiz.choices.length);
  }
  assert.deepEqual(
    periods.map((period) => breedDefinitions[period.breed].id),
    ["munchkin", "ragamuffin", "bengal", "british-shorthair"],
  );
  assert.deepEqual(
    quizzes.map((quiz) => breedDefinitions[quiz.breed].id),
    ["ragdoll", "minuet", "bengal"],
  );
  assert.deepEqual(
    quizzes.map((quiz) => quiz.answer),
    [1, 0, 2],
  );
});

test("every composed activity field and array order match the main baseline", () => {
  // Captured from the inline arrays before editing main 8da1d9e2b35ff51b6de79f6b589e73f6b3cf8abf.
  // Sort object keys only; question and choice order, exact strings, and references are retained.
  const normalized = JSON.stringify({ periods, quizzes }, (_, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, value[key]]),
        )
      : value,
  );
  assert.equal(
    createHash("sha256").update(normalized).digest("hex"),
    "5118e34add580619151fae1f1e8b594981630d6eac62bbed2a4ce58640ec153a",
  );
});
