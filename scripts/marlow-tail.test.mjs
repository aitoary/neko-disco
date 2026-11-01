import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import ts from "typescript";

function moduleUrl(path, replacements = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  // Node's SSR renderer has no CSS loader; the real build validates the stylesheet.
  outputText = outputText.replace('import "./marlow-tail.css";', "");
  for (const [name, url] of Object.entries({
    react: import.meta.resolve("react"),
    "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
    ...replacements,
  }))
    outputText = outputText.replaceAll(JSON.stringify(name), JSON.stringify(url));
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const { MarlowTail } = await import(
  moduleUrl("../app/marlow-tail.tsx", {
    "./marlow-tail-twitch": moduleUrl("../app/marlow-tail-twitch.ts"),
  })
);

for (const motionEnabled of [true, false]) {
  test(`production SSR renders the original layered image, motionEnabled=${motionEnabled}`, () => {
    const html = renderToString(createElement(MarlowTail, { motionEnabled }));
    assert.match(html, new RegExp(`data-pose="${motionEnabled ? "twitch" : "rest"}"`));
    assert.match(html, /data-twitch-active="false"/);
    assert.match(html, /aria-hidden="true"/);
    assert.equal((html.match(/href="\/images\/breeds\/maine-coon.webp"/g) ?? []).length, 2);
    const ids = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, 2);
    for (const id of ids) assert.ok(html.includes(`clip-path="url(#${id})"`));
    assert.doesNotMatch(html, /<img|marlow-preview-controls/);
  });
}

test("multiple Marlow sprites have independent SVG clip IDs", () => {
  const html = renderToString(
    createElement(
      "div",
      null,
      createElement(MarlowTail, { motionEnabled: true }),
      createElement(MarlowTail, { motionEnabled: true }),
    ),
  );
  const ids = [...html.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, 4);
});
