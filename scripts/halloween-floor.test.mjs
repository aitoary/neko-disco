import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import ts from "typescript";

function moduleUrl(path, imports = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const configuredEvents = JSON.parse(
  readFileSync(new URL("../config/events.json", import.meta.url), "utf8"),
);
const scheduleUrl = moduleUrl("../app/event-schedule.ts", {
  "../config/events.json": `data:text/javascript,${encodeURIComponent(`export default ${JSON.stringify(configuredEvents)}`)}`,
});
// Loading the actual config also checks it; behavioral fixtures stay independent
// so next year's config additions do not require rewriting date assertions.
const { parseEventSchedule } = await import(scheduleUrl);
const halloween2026 = {
  event: "halloween",
  year: 2026,
  start: "2026-10-31T00:00:00+09:00",
  end: "2026-11-01T05:00:00+09:00",
};
const halloween2027 = {
  event: "halloween",
  year: 2027,
  start: "2027-10-31T00:00:00+09:00",
  end: "2027-11-01T05:00:00+09:00",
};
function periodModuleUrl(entries) {
  return moduleUrl("../app/halloween-floor-period.ts", {
    "./event-schedule": `data:text/javascript,${encodeURIComponent(`export const eventSchedule = ${JSON.stringify(parseEventSchedule(entries))}`)}`,
  });
}
function hookModuleUrl(periodUrl) {
  return moduleUrl("../app/use-halloween-floor.ts", {
    react: import.meta.resolve("react"),
    "./halloween-floor-period": periodUrl,
  });
}
const periodUrl = periodModuleUrl([halloween2026]);
const start = Date.parse(halloween2026.start);
const end = Date.parse(halloween2026.end);
const { isHalloweenFloor } = await import(periodUrl);
const { getHalloweenFloorSnapshot, subscribeToHalloweenFloor, useHalloweenFloor } = await import(
  hookModuleUrl(periodUrl)
);

function browserClock(t, initialTime) {
  const browser = Object.assign(new EventTarget(), { location: { search: "" } });
  const page = Object.assign(new EventTarget(), { hidden: false });
  for (const [name, value] of [
    ["window", browser],
    ["document", page],
  ]) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, { configurable: true, value });
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else delete globalThis[name];
    });
  }
  let now = initialTime;
  let nextId = 0;
  const timers = new Map();
  t.mock.method(Date, "now", () => now);
  t.mock.method(globalThis, "setTimeout", (callback, delay) => {
    const id = ++nextId;
    timers.set(id, { callback, delay });
    return id;
  });
  t.mock.method(globalThis, "clearTimeout", (id) => timers.delete(id));
  return {
    browser,
    page,
    timers,
    setTime: (value) => {
      now = value;
    },
  };
}

test("the one-off JST event includes its start and excludes 05:00 on November 1", () => {
  assert.equal(start, Date.parse("2026-10-30T15:00:00Z"));
  assert.equal(end, Date.parse("2026-10-31T20:00:00Z"));
  for (const [time, expected] of [
    [start - 1, false],
    [start, true],
    [Date.parse("2026-11-01T00:00:00+09:00"), true],
    [end - 1, true],
    [end, false],
    [Date.parse("2027-10-31T12:00:00+09:00"), false],
    [NaN, false],
  ])
    assert.equal(isHalloweenFloor(time), expected);
  assert.equal(isHalloweenFloor(Date.parse("2026-10-31T16:00:00-04:00")), false);
});

test("schedule config rejects invalid dates, ambiguous zones, wrong years and duplicate entries", () => {
  for (const patch of [
    { event: "" },
    { event: undefined },
    { year: 2026.5 },
    { year: 2027 },
    { start: "2026-10-31T00:00:00" },
    { start: "2026-10-30T15:00:00Z" },
    { start: "2026-02-30T00:00:00+09:00" },
    { start: "2026-10-31T24:00:00+09:00" },
    { end: halloween2026.start },
    { end: "2026-10-30T00:00:00+09:00" },
    { end: "invalid" },
  ]) {
    assert.throws(
      () => parseEventSchedule([{ ...halloween2026, ...patch }]),
      /config\/events.json/,
    );
  }
  assert.throws(() => parseEventSchedule([halloween2026, halloween2026]), /duplicate event\/year/);
  assert.doesNotThrow(() =>
    parseEventSchedule([
      {
        event: "new-year",
        year: 2026,
        start: "2026-12-31T23:00:00+09:00",
        end: "2027-01-01T05:00:00+09:00",
      },
    ]),
  );
});

test("only explicitly configured Halloween years run, independent of entry order or other events", async () => {
  const christmas = {
    event: "christmas",
    year: 2026,
    start: "2026-12-24T00:00:00+09:00",
    end: "2026-12-26T00:00:00+09:00",
  };
  const periods = await import(periodModuleUrl([halloween2027, christmas, halloween2026]));
  const nextStart = Date.parse(halloween2027.start);
  const nextEnd = Date.parse(halloween2027.end);
  assert.equal(periods.isHalloweenFloor(end), false);
  assert.equal(periods.isHalloweenFloor(Date.parse(christmas.start)), false);
  assert.equal(periods.nextHalloweenFloorBoundary(end), nextStart);
  assert.equal(periods.isHalloweenFloor(nextStart - 1), false);
  assert.equal(periods.isHalloweenFloor(nextStart), true);
  assert.equal(periods.isHalloweenFloor(nextEnd - 1), true);
  assert.equal(periods.isHalloweenFloor(nextEnd), false);
  assert.equal(periods.nextHalloweenFloorBoundary(nextEnd), undefined);
  assert.equal(periods.isHalloweenFloor(Date.parse("2028-10-31T12:00:00+09:00")), false);
  const empty = await import(periodModuleUrl([]));
  assert.equal(empty.isHalloweenFloor(start), false);
  assert.equal(empty.nextHalloweenFloorBoundary(start), undefined);
});

test("a tab spanning two configured years schedules the next start after the first event ends", async (t) => {
  const clock = browserClock(t, end);
  const nextStart = Date.parse(halloween2027.start);
  const hook = await import(hookModuleUrl(periodModuleUrl([halloween2026, halloween2027])));
  const snapshots = [];
  const unsubscribe = hook.subscribeToHalloweenFloor(() =>
    snapshots.push(hook.getHalloweenFloorSnapshot()),
  );
  assert.equal([...clock.timers.values()][0].delay, 60_000);
  clock.setTime(nextStart - 1);
  clock.browser.dispatchEvent(new Event("pageshow"));
  assert.equal([...clock.timers.values()][0].delay, 1);
  clock.setTime(nextStart);
  [...clock.timers.values()][0].callback();
  assert.deepEqual(snapshots, [false, false, true]);
  unsubscribe();
  assert.equal(clock.timers.size, 0);
});

test("preview on/off works only in development; production always follows the clock", (t) => {
  const clock = browserClock(t, start - 1);
  const original = process.env.NODE_ENV;
  t.after(() => {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  });
  for (const environment of ["development", "production", "test"]) {
    process.env.NODE_ENV = environment;
    clock.browser.location.search = "?halloween=on";
    assert.equal(getHalloweenFloorSnapshot(), environment === "development");
    clock.setTime(start);
    clock.browser.location.search = "?halloween=off";
    assert.equal(getHalloweenFloorSnapshot(), environment !== "development");
    clock.browser.location.search = "?halloween=unknown";
    assert.equal(getHalloweenFloorSnapshot(), true);
    clock.setTime(start - 1);
  }
});

test("the server snapshot stays ordinary without browser globals, even during the event", (t) => {
  t.mock.method(Date, "now", () => start);
  function Floor() {
    return createElement("div", { "data-halloween": useHalloweenFloor() ? "true" : undefined });
  }
  assert.equal(renderToString(createElement(Floor)), "<div></div>");
});

test("timers wake at boundaries and never wait longer than a minute", (t) => {
  const clock = browserClock(t, start - 1);
  const snapshots = [];
  const unsubscribe = subscribeToHalloweenFloor(() => snapshots.push(isHalloweenFloor(Date.now())));
  assert.equal([...clock.timers.values()][0].delay, 1);
  const atStart = [...clock.timers.values()][0].callback;
  clock.setTime(start);
  atStart();
  assert.equal([...clock.timers.values()][0].delay, 60_000);
  clock.setTime(end - 1);
  clock.browser.dispatchEvent(new Event("focus"));
  assert.equal([...clock.timers.values()][0].delay, 1);
  const atEnd = [...clock.timers.values()][0].callback;
  clock.setTime(end);
  atEnd();
  assert.deepEqual(snapshots, [false, true, true, false]);
  assert.equal(clock.timers.size, 0);
  unsubscribe();
});

test("hidden tabs stop timers and refresh on visibility, history restore and focus", (t) => {
  const clock = browserClock(t, start);
  let notifications = 0;
  const unsubscribe = subscribeToHalloweenFloor(() => notifications++);
  clock.page.hidden = true;
  clock.page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(clock.timers.size, 0);
  clock.setTime(end);
  clock.page.hidden = false;
  clock.page.dispatchEvent(new Event("visibilitychange"));
  assert.equal(isHalloweenFloor(Date.now()), false);
  assert.equal(clock.timers.size, 0);
  clock.browser.dispatchEvent(new Event("pageshow"));
  clock.browser.dispatchEvent(new Event("focus"));
  assert.equal(notifications, 5);
  unsubscribe();
  clock.page.dispatchEvent(new Event("visibilitychange"));
  clock.browser.dispatchEvent(new Event("pageshow"));
  clock.browser.dispatchEvent(new Event("focus"));
  assert.equal(notifications, 5);
  assert.equal(clock.timers.size, 0);
});
