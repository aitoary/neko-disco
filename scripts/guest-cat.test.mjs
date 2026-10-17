import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/guest-cat-config.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const {
  guestCatReducer: next,
  guestCatConfig: config,
  guestCatText: text,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("the hidden guest runs, stops on the first tap and opens details only on the second", () => {
  let state = "hidden";
  assert.equal(next(state, { type: "tap" }), "hidden");
  state = next(state, { type: "appear", motionEnabled: true });
  assert.equal(state, "running");
  state = next(state, { type: "tap" });
  assert.equal(state, "stopped");
  assert.equal(next(state, { type: "finish" }), "stopped");
  state = next(state, { type: "tap" });
  assert.equal(state, "dialog");
  assert.equal(next(state, { type: "tap" }), "dialog");
  state = next(state, { type: "dismiss" });
  assert.equal(state, "closing");
  assert.equal(next(state, { type: "exit" }), "closing");
  state = next(state, { type: "dialogClosed" });
  assert.equal(state, "waitingToExit");
  state = next(state, { type: "exit" });
  assert.equal(state, "exiting");
  assert.equal(next(state, { type: "finish" }), "hidden");
});

test("only closing the guest dialog starts its exit, and exit interactions cannot interrupt it", () => {
  for (const state of ["hidden", "running", "stopped", "closing", "waitingToExit", "exiting"]) {
    assert.equal(next(state, { type: "dismiss" }), state);
  }
  for (const state of ["closing", "waitingToExit", "exiting"]) {
    assert.equal(next(state, { type: "tap" }), state);
    assert.equal(next(state, { type: "appear", motionEnabled: true }), state);
  }
  assert.equal(next("waitingToExit", { type: "finish" }), "waitingToExit");
  for (const state of ["hidden", "running", "stopped", "dialog", "closing", "exiting"]) {
    assert.equal(next(state, { type: "exit" }), state);
  }
  for (const state of ["hidden", "running", "stopped", "dialog", "waitingToExit", "exiting"]) {
    assert.equal(next(state, { type: "dialogClosed" }), state);
  }
  assert.equal(config.exitDelayMs, 1000);
});

test("a guest that crosses without a tap disappears instead of opening details", () => {
  assert.equal(next("running", { type: "finish" }), "hidden");
  assert.equal(next("running", { type: "dismiss" }), "running");
});

test("motion disabled starts with a stationary look-back guest, still able to open details", () => {
  const state = next("hidden", { type: "appear", motionEnabled: false });
  assert.equal(state, "stopped");
  assert.equal(next(state, { type: "tap" }), "dialog");
});

test("the PoC uses the two supplied PNGs and a slower four-to-five second crossing", () => {
  for (const path of [config.runImage, config.lookbackImage]) {
    const png = readFileSync(new URL(`../public${path}`, import.meta.url));
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 1254);
    assert.equal(png.readUInt32BE(20), 1254);
  }
  assert.ok(config.crossingDurationMs >= 4000 && config.crossingDurationMs <= 5000);
  for (const locale of ["ja", "en"]) {
    for (const value of Object.values(text[locale])) assert.ok(value.trim());
  }
});

test("the guest has no ranking, discovery-count or persistence ownership and uses the existing dialog", () => {
  const runner = readFileSync(new URL("../app/guest-cat-runner.tsx", import.meta.url), "utf8");
  const scheduler = readFileSync(
    new URL("../app/use-guest-cat-schedule.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    runner,
    /setFound|useDiscoSession|localStorage|sessionStorage|breedDefinitions/u,
  );
  assert.ok(runner.includes('from "@/components/ui/dialog"'));
  assert.ok(scheduler.includes("observer.disconnect();"));
  assert.ok(runner.includes("flight.current?.cancel();"));
});
