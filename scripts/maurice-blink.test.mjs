import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import ts from "typescript";

let { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/maurice-blink.tsx", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  },
);
for (const name of ["react", "react/jsx-runtime"]) {
  outputText = outputText.replaceAll(
    JSON.stringify(name),
    JSON.stringify(import.meta.resolve(name)),
  );
}
const { startMauriceBlink, MauriceBlink } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

function browser(t, reduced = false) {
  const media = Object.assign(new EventTarget(), { matches: reduced });
  const page = Object.assign(new EventTarget(), { hidden: false });
  for (const [name, value] of [
    ["window", { matchMedia: () => media }],
    ["document", page],
  ]) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else delete globalThis[name];
    });
  }
  const timers = new Map();
  let sequence = 0;
  t.mock.method(globalThis, "setTimeout", (callback, delay) => {
    timers.set(++sequence, { callback, delay });
    return sequence;
  });
  t.mock.method(globalThis, "clearTimeout", (id) => timers.delete(id));
  const fire = () => {
    assert.equal(timers.size, 1);
    const [id, timer] = [...timers][0];
    timers.delete(id);
    timer.callback();
    return timer.delay;
  };
  return { media, page, timers, fire, overlay: { dataset: {} } };
}

test("one 125ms closure repeats at randomized 4–8 second onset intervals", (t) => {
  const b = browser(t);
  let random = 0;
  t.mock.method(Math, "random", () => random);
  const stop = startMauriceBlink(b.overlay);
  assert.equal(b.overlay.dataset.closed, "false");
  assert.equal(b.fire(), 4_000);
  assert.equal(b.overlay.dataset.closed, "true");
  random = 1;
  assert.equal(b.fire(), 125);
  assert.equal(b.overlay.dataset.closed, "false");
  assert.equal(b.fire(), 8_000 - 125);
  assert.equal(b.overlay.dataset.closed, "true");
  random = 0;
  assert.equal(b.fire(), 125);
  assert.equal(b.fire(), 4_000 - 125);
  stop();
  assert.equal(b.overlay.dataset.closed, "false");
  assert.equal(b.timers.size, 0);
});

test("reduced motion and hidden tabs immediately open the eyes and stop all timers", (t) => {
  const b = browser(t, true);
  const stop = startMauriceBlink(b.overlay);
  assert.equal(b.timers.size, 0);
  b.media.matches = false;
  b.media.dispatchEvent(new Event("change"));
  b.fire();
  assert.equal(b.overlay.dataset.closed, "true");
  b.media.matches = true;
  b.media.dispatchEvent(new Event("change"));
  assert.equal(b.overlay.dataset.closed, "false");
  assert.equal(b.timers.size, 0);
  b.media.matches = false;
  b.media.dispatchEvent(new Event("change"));
  b.fire();
  b.page.hidden = true;
  b.page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(b.overlay.dataset.closed, "false");
  assert.equal(b.timers.size, 0);
  b.page.hidden = false;
  b.page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(b.timers.size, 1);
  stop();
  b.page.dispatchEvent(new Event("visibilitychange"));
  b.media.dispatchEvent(new Event("change"));
  assert.equal(b.timers.size, 0);
});

test("SSR starts with a decorative open-eye overlay and no browser access", () => {
  const html = renderToString(createElement(MauriceBlink, { motionEnabled: true }));
  assert.match(html, /data-closed="false"/);
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /viewBox="0 0 512 512"/);
  assert.equal((html.match(/<image /g) ?? []).length, 2);
});
