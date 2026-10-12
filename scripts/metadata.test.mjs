import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Use the existing compiler and Node runner; this module has type-only imports.
const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/locale-metadata.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const { createLocaleMetadata } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("Japanese metadata retains the existing title, description, and favicon", () => {
  const source = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const metadata = createLocaleMetadata("ja");
  for (const field of ["title", "description"]) {
    assert.equal(typeof metadata[field], "string");
    assert.ok(metadata[field].trim().length > 0);
    assert.ok(source.includes(JSON.stringify(metadata[field])), field);
  }
  assert.deepEqual(metadata.icons, { icon: "/favicon.svg", shortcut: "/favicon.svg" });
  assert.deepEqual(createLocaleMetadata("en").icons, metadata.icons);
});

test("English metadata contains complete English copy", () => {
  const metadata = createLocaleMetadata("en");
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const field of ["title", "description"]) {
    assert.equal(typeof metadata[field], "string");
    assert.ok(metadata[field].trim().length > 0, field);
    assert.doesNotMatch(metadata[field], japanese, field);
  }
  assert.match(metadata.title, /NEKO DISCO/);
});

test("each language has its own production canonical and matching alternate URLs", () => {
  for (const locale of ["ja", "en"]) {
    const { alternates } = createLocaleMetadata(locale);
    assert.equal(alternates.canonical, `https://nekodisco.party/${locale}`);
    assert.deepEqual(alternates.languages, {
      ja: "https://nekodisco.party/ja",
      en: "https://nekodisco.party/en",
      "x-default": "https://nekodisco.party/",
    });
    for (const value of [alternates.canonical, ...Object.values(alternates.languages)]) {
      const url = new URL(value);
      assert.equal(url.origin, "https://nekodisco.party");
      assert.equal(url.search, "");
      assert.equal(url.hash, "");
    }
  }
});

test("Open Graph copy, URL, and locale match the requested language", () => {
  for (const [locale, ogLocale, alternate] of [
    ["ja", "ja_JP", "en_US"],
    ["en", "en_US", "ja_JP"],
  ]) {
    const metadata = createLocaleMetadata(locale);
    assert.equal(metadata.openGraph.title, metadata.title);
    assert.equal(metadata.openGraph.description, metadata.description);
    assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
    assert.equal(metadata.openGraph.locale, ogLocale);
    assert.deepEqual(metadata.openGraph.alternateLocale, [alternate]);
    assert.equal(metadata.openGraph.siteName, "NEKO DISCO");
    assert.equal(metadata.openGraph.type, "website");
  }
});

test("unsupported locale values do not silently produce Japanese metadata", () => {
  for (const locale of ["fr", "en-US", "JA", "en?preview=1", "en#floor", "", null, undefined]) {
    assert.throws(() => createLocaleMetadata(locale), {
      name: "RangeError",
      message: "Unsupported locale.",
    });
  }
});
