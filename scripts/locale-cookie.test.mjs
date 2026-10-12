import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/locale-cookie.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const { readLocaleCookie, createLocaleCookie } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("reads the exact lowercase locale among unrelated cookies", () => {
  for (const locale of ["ja", "en"]) {
    assert.equal(readLocaleCookie(`neko_disco_locale=${locale}`), locale);
    assert.equal(readLocaleCookie(`theme=night; neko_disco_locale=${locale}; progress=1`), locale);
    assert.equal(readLocaleCookie(`theme=night;neko_disco_locale=${locale}`), locale);
  }
});

test("missing cookies do not imply a stored Japanese preference", () => {
  for (const cookies of [undefined, null, "", " ", "theme=night", "; theme=night;;"]) {
    assert.equal(readLocaleCookie(cookies), undefined);
  }
});

test("invalid values are not decoded, normalized, or used as locales", () => {
  for (const value of ["", "JA", "EN", "en-US", "fr", "../en", "%65n", '"en"', " en", "en=ja"]) {
    assert.equal(readLocaleCookie(`neko_disco_locale=${value}`), undefined, value);
  }
  assert.equal(readLocaleCookie("neko_disco_locale"), undefined);
});

test("similarly named cookies are not the manual locale cookie", () => {
  for (const name of [
    "locale",
    "NEKO_DISCO_LOCALE",
    "xneko_disco_locale",
    "neko_disco_locale_extra",
  ]) {
    assert.equal(readLocaleCookie(`${name}=en`), undefined, name);
    assert.equal(readLocaleCookie(`${name}=en; neko_disco_locale=ja`), "ja", name);
  }
});

test("conflicting or partly invalid duplicate values have no usable saved preference", () => {
  for (const [first, second] of [
    ["ja", "en"],
    ["en", "ja"],
    ["ja", "invalid"],
    ["invalid", "ja"],
    ["en", ""],
    ["", "en"],
  ]) {
    assert.equal(
      readLocaleCookie(`neko_disco_locale=${first}; neko_disco_locale=${second}`),
      undefined,
    );
  }
  assert.equal(readLocaleCookie("neko_disco_locale=en; neko_disco_locale"), undefined);
  assert.equal(readLocaleCookie("neko_disco_locale; neko_disco_locale=en"), undefined);
});

test("identical valid duplicates are unambiguous", () => {
  for (const locale of ["ja", "en"]) {
    assert.equal(
      readLocaleCookie(`neko_disco_locale=${locale}; theme=night; neko_disco_locale=${locale}`),
      locale,
    );
  }
});

test("HTTPS assignment has the specified lifetime, path, SameSite, and Secure attributes", () => {
  for (const locale of ["ja", "en"]) {
    assert.equal(
      createLocaleCookie(locale, "https:"),
      `neko_disco_locale=${locale}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`,
    );
  }
});

test("HTTP local assignment omits Secure, Domain, and HttpOnly", () => {
  for (const locale of ["ja", "en"]) {
    assert.equal(
      createLocaleCookie(locale, "http:"),
      `neko_disco_locale=${locale}; Max-Age=15552000; Path=/; SameSite=Lax`,
    );
  }
});

test("unsupported locale and protocol cannot produce an assignment string", () => {
  for (const locale of ["fr", "JA", "en-US", "en; Path=/other", "", null, undefined]) {
    assert.throws(() => createLocaleCookie(locale, "https:"), {
      name: "RangeError",
      message: "Unsupported locale.",
    });
  }
  for (const protocol of ["ftp:", "https", "HTTPS:", "javascript:", "", null, undefined]) {
    assert.throws(() => createLocaleCookie("en", protocol), {
      name: "RangeError",
      message: "Unsupported cookie protocol.",
    });
  }
});
