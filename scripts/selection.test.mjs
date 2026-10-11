import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Load these import-free runtime modules with the project's existing TypeScript compiler.
async function loadTypeScript(path) {
  const { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

const [{ breeds }, { facts }, { resolveSelection }] = await Promise.all(
  ["../app/breeds.ts", "../app/facts.ts", "../app/selection.ts"].map(loadTypeScript),
);

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
