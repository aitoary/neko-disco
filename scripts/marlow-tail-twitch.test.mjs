import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/marlow-tail-twitch.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const { startMarlowTailTwitch, marlowTwitchDuration } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

function browser(t) {
  const media = Object.assign(new EventTarget(), { matches: false });
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
  const fire = (delay) => {
    assert.equal(timers.size, 1);
    const [id, timer] = [...timers][0];
    assert.equal(timer.delay, delay);
    timers.delete(id);
    timer.callback();
  };
  return { media, page, timers, fire };
}

test("waits a fresh random 4–8s after each complete double twitch", (t) => {
  const b = browser(t);
  let random = 0;
  t.mock.method(Math, "random", () => random);
  let active;
  const stop = startMarlowTailTwitch((value) => {
    active = value;
  });
  for (const [delay, nextRandom] of [
    [4000, 0.5],
    [6000, 0.999999],
    [7999.996, 0],
  ]) {
    assert.equal(active, false);
    b.fire(delay);
    assert.equal(active, true);
    random = nextRandom;
    b.fire(marlowTwitchDuration);
    assert.equal(active, false);
  }
  stop();
  assert.equal(b.timers.size, 0);
});

for (const restriction of ["hidden", "reduced"]) {
  test(`${restriction} cancels both rest and active gesture; cleanup removes listeners`, (t) => {
    const b = browser(t);
    t.mock.method(Math, "random", () => 0);
    const target = restriction === "hidden" ? b.page : b.media;
    const property = restriction === "hidden" ? "hidden" : "matches";
    const event = restriction === "hidden" ? "visibilitychange" : "change";
    let active;
    const change = (value) => {
      target[property] = value;
      target.dispatchEvent(new Event(event));
    };
    change(true);
    const stop = startMarlowTailTwitch((value) => {
      active = value;
    });
    assert.equal(b.timers.size, 0);
    for (const phase of ["rest", "active"]) {
      change(false);
      if (phase === "active") b.fire(4000);
      change(true);
      assert.equal(active, false);
      assert.equal(b.timers.size, 0);
    }
    change(false);
    stop();
    change(false);
    b.page.dispatchEvent(new Event("visibilitychange"));
    b.media.dispatchEvent(new Event("change"));
    assert.equal(active, false);
    assert.equal(b.timers.size, 0);
  });
}
