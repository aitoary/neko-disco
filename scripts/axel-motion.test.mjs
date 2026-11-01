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
  // Node SSR does not load CSS; the production build checks the real stylesheet.
  outputText = outputText.replace('import "./axel-motion.css";', "");
  for (const [name, url] of Object.entries({
    react: import.meta.resolve("react"),
    "react/jsx-runtime": import.meta.resolve("react/jsx-runtime"),
    ...replacements,
  }))
    outputText = outputText.replaceAll(JSON.stringify(name), JSON.stringify(url));
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}
const { AxelMotion } = await import(
  moduleUrl("../app/axel-motion.tsx", {
    "./axel-motion-loop": moduleUrl("../app/axel-motion-loop.ts"),
  })
);

for (const motionEnabled of [true, false]) {
  test(`SSR renders the gesture around the existing dance sprite without a query or browser, motion=${motionEnabled}`, () => {
    const html = renderToString(
      createElement(
        AxelMotion,
        { motionEnabled },
        createElement("span", { className: "cat-sprite breed-sprite" }, "Bengal"),
      ),
    );
    assert.match(html, new RegExp(`data-pattern="${motionEnabled ? "loop" : "off"}"`));
    assert.match(html, /data-loop-phase="idle"/);
    assert.match(
      html,
      /class="axel-motion-layer"[^>]*><span class="cat-sprite breed-sprite">Bengal<\/span><\/span>/,
    );
    assert.doesNotMatch(html, /axel-preview-controls|data-combine-dance="false"/);
  });
}
