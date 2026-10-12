import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Reuse the existing compiler/Node runner approach with the real Cookie module.
function typeScriptModuleUrl(path, imports = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const { detectLocale } = await import(
  typeScriptModuleUrl("../app/locale-detection.ts", {
    "./locale-cookie": typeScriptModuleUrl("../app/locale-cookie.ts"),
  })
);

test("a valid manual Cookie wins over the browser language preferences", () => {
  assert.equal(detectLocale("neko_disco_locale=ja", "en-US,en;q=0.9,ja;q=0.1"), "ja");
  assert.equal(detectLocale("neko_disco_locale=en", "ja-JP,ja;q=0.9,en;q=0"), "en");
});

test("missing, invalid, or ambiguous Cookies fall through to Accept-Language", () => {
  for (const cookie of [
    null,
    undefined,
    "",
    "theme=night",
    "neko_disco_locale=JA",
    "neko_disco_locale=fr",
    "neko_disco_locale=ja; neko_disco_locale=en",
    "neko_disco_locale=en; neko_disco_locale=ja",
    "neko_disco_locale=ja; neko_disco_locale=invalid",
  ]) {
    assert.equal(detectLocale(cookie, "en-US,ja;q=0.9"), "en", cookie);
  }
});

test("no supported positive preference defaults to Japanese", () => {
  for (const header of [null, undefined, "", " ", "fr,de;q=0.8", "*", "*;q=0.9", "en;q=0,ja;q=0"]) {
    assert.equal(detectLocale(undefined, header), "ja", header);
  }
});

test("supported basic and regional ranges ignore case and normalize to ja or en", () => {
  for (const tag of ["en", "EN", "en-US", "En-gb", "en-Latn-US"]) {
    assert.equal(detectLocale(null, `${tag},ja;q=0.1`), "en", tag);
  }
  for (const tag of ["ja", "JA", "ja-JP", "Ja-jp"]) {
    assert.equal(detectLocale(null, `${tag},en;q=0.1`), "ja", tag);
  }
});

test("highest positive quality wins, while unsupported languages and wildcards do not compete", () => {
  for (const [header, expected] of [
    ["ja;q=0.1,en;q=0.9", "en"],
    ["en;q=0.1,ja;q=0.9", "ja"],
    ["fr;q=1,ja;q=0.6,en;q=0.8", "en"],
    ["*;q=1,en;q=0.5,ja;q=0.4", "en"],
    ["en;q=0,en-US;q=0.5,ja;q=0.1", "en"],
  ]) {
    assert.equal(detectLocale(null, header), expected, header);
  }
});

test("omitted q means 1 and valid positive HTTP qvalues are accepted", () => {
  assert.equal(detectLocale(null, "en,ja;q=0.999"), "en");
  assert.equal(detectLocale(null, "ja,en;q=0.999"), "ja");
  for (const quality of ["0.001", "0.5", "0.999", "1", "1.", "1.0", "1.00", "1.000"]) {
    assert.equal(detectLocale(null, `en;q=${quality},ja;q=0`), "en", quality);
  }
});

test("equal qualities preserve the original header order", () => {
  for (const [header, expected] of [
    ["en,ja", "en"],
    ["ja,en", "ja"],
    ["en;q=0.5,ja;q=0.500", "en"],
    ["ja;q=0.500,en;q=0.5", "ja"],
  ]) {
    assert.equal(detectLocale(null, header), expected, header);
  }
});

test("every valid zero quality is excluded", () => {
  for (const quality of ["0", "0.", "0.0", "0.00", "0.000"]) {
    assert.equal(detectLocale(null, `en;q=${quality},ja;q=0.1`), "ja", quality);
    assert.equal(detectLocale(null, `ja;q=${quality},en;q=0.1`), "en", quality);
  }
});

test("invalid, out-of-range, or over-precise qvalues invalidate only that item", () => {
  for (const quality of [
    "",
    ".8",
    "00.8",
    "+0.5",
    "-0.1",
    "1.001",
    "2",
    "0.5000",
    "NaN",
    "0.8junk",
  ]) {
    assert.equal(detectLocale(null, `en;q=${quality},ja;q=0.5`), "ja", quality);
    assert.equal(detectLocale(null, `ja;q=${quality},en;q=0.5`), "en", quality);
  }
});

test("malformed parameters and duplicate q do not silently get the default weight", () => {
  for (const entry of ["ja;q", "ja;foo=bar", "ja;q=1;foo=bar", "ja;q=1;q=0.5", "ja;q=1;Q=1"]) {
    assert.equal(detectLocale(null, `${entry},en;q=0.5`), "en", entry);
  }
});

test("invalid ranges are not matched by an accidental language prefix", () => {
  for (const tag of ["english", "en_US", "en-", "en--US", "en-abcdefghi", "en/../ja"]) {
    assert.equal(detectLocale(null, `${tag},ja;q=0.5`), "ja", tag);
  }
  for (const tag of ["japanese", "ja_JP", "ja-", "ja-*", "ja/../en"]) {
    assert.equal(detectLocale(null, `${tag},en;q=0.5`), "en", tag);
  }
});

test("separator whitespace, case-insensitive Q, and empty list items are tolerated", () => {
  assert.equal(detectLocale(null, "\t JA-jp \t;\t Q=0.8 ,  EN-us;q=0.9  "), "en");
  assert.equal(detectLocale(null, ",,en-US;q=0.9,,,ja;q=0.8,"), "en");
});
