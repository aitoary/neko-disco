import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

function moduleUrl(name, imports = {}) {
  let { outputText } = ts.transpileModule(
    readFileSync(new URL(`../app/${name}.ts`, import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
  );
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const cookieUrl = moduleUrl("locale-cookie");
const detectionUrl = moduleUrl("locale-detection", { "./locale-cookie": cookieUrl });
const { GET } = await import(moduleUrl("route", { "./locale-detection": detectionUrl }));
const { isLocale, languageHref, isSameTabSelection, saveLocalePreference } = await import(
  moduleUrl("locale-navigation", { "./locale-cookie": cookieUrl })
);

test("the entry redirects by valid cookie, then header, then Japanese", () => {
  for (const [cookie, language, locale] of [
    ["neko_disco_locale=ja", "en", "ja"],
    ["neko_disco_locale=en", "ja", "en"],
    ["neko_disco_locale=invalid", "en", "en"],
    ["neko_disco_locale=ja; neko_disco_locale=en", "en", "en"],
    ["", "en-US,en;q=0.9,ja;q=0.8", "en"],
    ["", "ja;q=0.8,en;q=0.5", "ja"],
    ["", "fr,*", "ja"],
    ["", "", "ja"],
  ]) {
    const response = GET(
      new Request("https://nekodisco.party/", {
        headers: { cookie, "Accept-Language": language },
      }),
    );
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), `https://nekodisco.party/${locale}`);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

test("the entry preserves raw query order and duplicate values and cannot share its result", () => {
  const query = "?tag=a&tag=b&empty=&space=a%20b&encoded=%23quiz";
  const response = GET(
    new Request(`https://preview.example/${query}`, {
      headers: { "Accept-Language": "en" },
    }),
  );
  assert.equal(response.headers.get("location"), `https://preview.example/en${query}`);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("vary"), "Cookie, Accept-Language");
});

test("explicit locale values are exact and never silently fall back", () => {
  assert.equal(isLocale("ja"), true);
  assert.equal(isLocale("en"), true);
  for (const value of ["fr", "JA", "en-US", "en/other", "", "../en"]) {
    assert.equal(isLocale(value), false);
    assert.throws(() => languageHref(value), RangeError);
  }
});

test("manual targets retain query duplicates and fragments without changing their encoding", () => {
  for (const locale of ["ja", "en"]) {
    assert.equal(languageHref(locale), `/${locale}`);
    assert.equal(
      languageHref(locale, "?tag=a&tag=b&space=a%20b", "#dance-floor"),
      `/${locale}?tag=a&tag=b&space=a%20b#dance-floor`,
    );
  }
  assert.throws(() => languageHref("en", "other/path"), RangeError);
  assert.throws(() => languageHref("en", "", "other/path"), RangeError);
});

test("only unmodified primary/keyboard clicks request same-tab navigation", () => {
  const primary = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };
  assert.equal(isSameTabSelection(primary), true);
  for (const modifier of ["metaKey", "ctrlKey", "shiftKey", "altKey"]) {
    assert.equal(isSameTabSelection({ ...primary, [modifier]: true }), false);
  }
  assert.equal(isSameTabSelection({ ...primary, button: 1 }), false);
  assert.equal(isSameTabSelection({ ...primary, button: 2 }), false);
});

test("manual saving writes the approved assignment and confirms the read-back preference", () => {
  for (const [locale, protocol] of [
    ["ja", "http:"],
    ["en", "https:"],
  ]) {
    let value = "theme=night",
      assignment;
    const target = {
      get cookie() {
        return value;
      },
      set cookie(next) {
        assignment = next;
        value = next.split(";")[0];
      },
    };
    assert.equal(saveLocalePreference(locale, target, protocol), true);
    assert.equal(
      assignment,
      `neko_disco_locale=${locale}; Max-Age=15552000; Path=/; SameSite=Lax${protocol === "https:" ? "; Secure" : ""}`,
    );
  }
});

test("blocked writes and unsuccessful read-back are failures rather than claimed success", () => {
  const blocked = {
    get cookie() {
      return "";
    },
    set cookie(_value) {
      throw new Error("Cookie access blocked");
    },
  };
  assert.equal(saveLocalePreference("en", blocked, "https:"), false);
  for (const previous of [
    "",
    "neko_disco_locale=ja",
    "neko_disco_locale=ja; neko_disco_locale=en",
  ]) {
    const ignored = {
      get cookie() {
        return previous;
      },
      set cookie(_value) {},
    };
    assert.equal(saveLocalePreference("en", ignored, "https:"), false);
  }
});

test("explicit routes validate the locale and connect per-locale metadata and data", () => {
  const page = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
  assert.ok(page.includes("if (!isLocale(locale)) notFound();"));
  assert.ok(page.includes("createLocaleMetadata(locale)"));
  assert.ok(page.includes("getDiscoPageData(locale)"));
  assert.ok(page.includes("key={locale}"));
  assert.doesNotMatch(page, /detectLocale|navigator\.language|readLocaleCookie/u);
});

test("the document follows the URL while session ownership stays in the common Root", () => {
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const document = readFileSync(new URL("../app/locale-document.tsx", import.meta.url), "utf8");
  const provider = readFileSync(
    new URL("../app/locale-navigation-provider.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(layout.includes("<DiscoSessionProvider>{children}</DiscoSessionProvider>"));
  assert.doesNotMatch(layout, /<DiscoSessionProvider[^>]*\bkey=/u);
  assert.ok(document.includes('lang={pathname === "/en" ? "en" : "ja"}'));
  assert.doesNotMatch(provider, /useDiscoAudio|useDiscoMotion|localStorage|sessionStorage/u);
  assert.ok(provider.includes("router.push(href, { scroll: false })"));
  assert.ok(provider.includes('window.addEventListener("popstate", historyMoved)'));
});
