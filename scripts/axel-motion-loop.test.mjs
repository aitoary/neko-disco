import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/axel-motion-loop.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const { startAxelMotionLoop } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

function browser(t, { reduced = false, hidden = false } = {}) {
  const media = Object.assign(new EventTarget(), { matches: reduced });
  const page = Object.assign(new EventTarget(), { hidden });
  const layer = Object.assign(new EventTarget(), { dataset: {} });
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
  const fire = (expectedDelay) => {
    assert.equal(timers.size, 1);
    const [id, timer] = [...timers][0];
    assert.equal(timer.delay, expectedDelay);
    timers.delete(id);
    timer.callback();
  };
  const end = (animationName, target) => {
    const event = Object.assign(new Event("animationend"), { animationName });
    if (target) Object.defineProperty(event, "target", { value: target });
    layer.dispatchEvent(event);
  };
  return { media, page, layer, timers, fire, end };
}

test("each cycle draws 1–3 consecutive sways, then exactly one hop after a 3s rest", (t) => {
  const b = browser(t);
  let random = 0;
  t.mock.method(Math, "random", () => random);
  const stop = startAxelMotionLoop(b.layer);
  for (const [nextRandom, expectedCount] of [
    [0.4, "1"],
    [0.999999, "2"],
    [0, "3"],
  ]) {
    assert.equal(b.layer.dataset.loopPhase, "sway");
    assert.equal(b.layer.dataset.swayCount, expectedCount);
    assert.equal(b.timers.size, 0);
    b.end("axel-preview-loop-sway");
    assert.equal(b.layer.dataset.loopPhase, "rest");
    b.end("axel-preview-loop-sway"); // Duplicate end events cannot schedule extra hops.
    b.fire(3_000);
    assert.equal(b.layer.dataset.loopPhase, "hop");
    assert.equal(b.timers.size, 0);
    b.end("axel-preview-loop-hop");
    assert.equal(b.layer.dataset.loopPhase, "rest");
    random = nextRandom;
    b.end("axel-preview-loop-hop");
    b.fire(4_000);
  }
  stop();
});

test("existing dance and child animation events cannot advance the loop", (t) => {
  const b = browser(t);
  const stop = startAxelMotionLoop(b.layer);
  b.end("cat-dance");
  b.end("axel-preview-loop-sway", new EventTarget());
  b.end("axel-preview-loop-hop");
  assert.equal(b.layer.dataset.loopPhase, "sway");
  assert.equal(b.timers.size, 0);
  stop();
});

for (const restriction of ["reduced", "hidden"]) {
  test(`${restriction} stops immediately and cancels pending pauses; resume starts a fresh cycle`, (t) => {
    const b = browser(t, { [restriction]: true });
    const target = restriction === "reduced" ? b.media : b.page;
    const property = restriction === "reduced" ? "matches" : "hidden";
    const event = restriction === "reduced" ? "change" : "visibilitychange";
    const stop = startAxelMotionLoop(b.layer);
    assert.equal(b.layer.dataset.loopPhase, "idle");
    assert.equal(b.timers.size, 0);
    const setRestricted = (value) => {
      target[property] = value;
      target.dispatchEvent(new Event(event));
    };
    for (const phase of ["sway", "before-hop", "hop", "after-hop"]) {
      setRestricted(false);
      if (phase !== "sway") b.end("axel-preview-loop-sway");
      if (phase === "hop" || phase === "after-hop") b.fire(3_000);
      if (phase === "after-hop") b.end("axel-preview-loop-hop");
      setRestricted(true);
      assert.equal(b.layer.dataset.loopPhase, "idle");
      assert.equal(b.layer.dataset.swayCount, undefined);
      assert.equal(b.timers.size, 0);
    }
    stop();
  });
}

test("cleanup cancels a pending hop and removes animation and browser listeners", (t) => {
  const b = browser(t);
  const stop = startAxelMotionLoop(b.layer);
  b.end("axel-preview-loop-sway");
  assert.equal(b.timers.size, 1);
  stop();
  b.page.dispatchEvent(new Event("visibilitychange"));
  b.media.dispatchEvent(new Event("change"));
  b.end("axel-preview-loop-sway");
  assert.equal(b.layer.dataset.loopPhase, "idle");
  assert.equal(b.timers.size, 0);
});
