import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Supply the facade's two runtime imports with the project's existing TypeScript compiler.
function typeScriptModuleUrl(path, imports = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const definitionsUrl = typeScriptModuleUrl("../app/breed-definitions.ts");
const japaneseTextUrl = typeScriptModuleUrl("../app/breeds-ja.ts");
const [
  { breeds, ranking },
  { facts },
  { resolveSelection },
  { breedDefinitions },
  { japaneseBreedText },
] = await Promise.all([
  import(
    typeScriptModuleUrl("../app/breeds.ts", {
      "./breed-definitions": definitionsUrl,
      "./breeds-ja": japaneseTextUrl,
    })
  ),
  import(typeScriptModuleUrl("../app/facts.ts")),
  import(typeScriptModuleUrl("../app/selection.ts")),
  import(definitionsUrl),
  import(japaneseTextUrl),
]);

test("each catalog has 12 unique stable IDs", () => {
  for (const items of [breeds, facts]) {
    assert.equal(items.length, 12);
    assert.equal(new Set(items.map((item) => item.id)).size, items.length);
    assert.ok(items.every((item) => item.id.trim().length > 0));
  }
});

test("all breed selections keep their image and details together", () => {
  for (const breed of breeds) {
    const result = resolveSelection({ kind: "breed", id: breed.id }, breeds, facts);
    assert.equal(result.kind, "breed");
    assert.strictEqual(result.item, breed);
    assert.equal(breeds[result.index].image, breed.image);
  }
});

test("all fact selections resolve by ID", () => {
  for (const fact of facts) {
    const result = resolveSelection({ kind: "fact", id: fact.id }, breeds, facts);
    assert.equal(result.kind, "fact");
    assert.strictEqual(result.item, fact);
  }
});

test("a saved breed key resolves new objects and a reordered catalog", () => {
  const key = { kind: "breed", id: breeds[2].id };
  const updated = breeds.map((breed) => ({ ...breed, intro: `Updated: ${breed.id}` })).reverse();
  const result = resolveSelection(key, updated, facts);
  assert.equal(result.kind, "breed");
  assert.notStrictEqual(result.item, breeds[2]);
  assert.equal(result.item.id, key.id);
  assert.equal(result.item.intro, `Updated: ${key.id}`);
  assert.equal(updated[result.index].image, breeds[2].image);
  assert.equal(result.index, breeds.length - 1 - 2);
});

test("a saved fact key resolves new objects and a reordered catalog", () => {
  const key = { kind: "fact", id: facts[2].id };
  const updated = facts.map((fact) => ({ ...fact, body: `Updated: ${fact.id}` })).reverse();
  const result = resolveSelection(key, breeds, updated);
  assert.equal(result.kind, "fact");
  assert.notStrictEqual(result.item, facts[2]);
  assert.equal(result.item.id, key.id);
  assert.equal(result.item.body, `Updated: ${key.id}`);
});

test("kind distinguishes catalogs even when IDs overlap", () => {
  const fact = { ...facts[0], id: breeds[0].id };
  assert.strictEqual(
    resolveSelection({ kind: "breed", id: fact.id }, breeds, [fact]).item,
    breeds[0],
  );
  assert.strictEqual(resolveSelection({ kind: "fact", id: fact.id }, breeds, [fact]).item, fact);
});

test("no selection or an unknown ID does not select another item", () => {
  assert.equal(resolveSelection(null, breeds, facts), null);
  for (const kind of ["breed", "fact"]) {
    assert.equal(resolveSelection({ kind, id: "missing" }, breeds, facts), null);
    assert.equal(resolveSelection({ kind, id: "missing" }, [], []), null);
  }
  assert.equal(resolveSelection({ kind: "breed", id: facts[0].id }, breeds, facts), null);
  assert.equal(resolveSelection({ kind: "fact", id: breeds[0].id }, breeds, facts), null);
});

test("a removed item does not resolve to the next catalog entry", () => {
  const key = { kind: "breed", id: breeds[0].id };
  assert.equal(resolveSelection(key, breeds.slice(1), facts), null);
});

test("Japanese breed text has exactly the catalog IDs and no missing or blank fields", () => {
  assert.deepEqual(
    Object.keys(japaneseBreedText).sort(),
    breedDefinitions.map((breed) => breed.id).sort(),
  );
  const fields = [
    "name",
    "catchphrase",
    "intro",
    "trait",
    "appearance",
    "personality",
    "detail",
    "sourceName",
  ];
  for (const [id, text] of Object.entries(japaneseBreedText)) {
    for (const field of fields) {
      assert.equal(typeof text[field], "string", `${id}.${field}`);
      assert.ok(text[field].trim().length > 0, `${id}.${field} must not be blank`);
    }
  }
});

test("every composed breed field, catalog order, and ranking match the main baseline", () => {
  // Captured before splitting data from main a3f7d924b7b246f79fc368976c85911cc1a74db7.
  // Sort object keys only; array order and exact strings remain part of the comparison.
  const normalized = JSON.stringify({ breeds, ranking }, (_, value) =>
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
    "dbdd3b54c4465de0d300694a82e542b067e62df878f9c4b90c108c8d8fc08726",
  );
});
