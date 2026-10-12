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

const [{ breedDefinitions }, { englishBreedText }] = await Promise.all([
  import(typeScriptModuleUrl("../app/breed-definitions.ts")),
  import(typeScriptModuleUrl("../app/breeds-en.ts")),
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
