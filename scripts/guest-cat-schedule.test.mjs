import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../app/guest-cat-schedule.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
const {
  GuestCatScheduleStore,
  createGuestCatSchedule,
  parseGuestCatSchedule,
  recordGuestCatViewing,
  claimGuestCatAppearance,
  guestCatDate,
  guestCatStorageKey,
} = await import(moduleUrl);
const monday = new Date(2026, 9, 12, 12);
const tuesday = new Date(2026, 9, 13, 12);
const wednesday = new Date(2026, 9, 14, 12);
const nextMonday = new Date(2026, 9, 19, 0);

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("each weekly draw selects two or three distinct local dates with 15–30 second requirements", () => {
  for (const value of [0, 0.49, 0.5, 0.99, 0.999999999]) {
    const schedule = createGuestCatSchedule(monday, () => value);
    assert.equal(schedule.weekStart, "2026-10-12");
    assert.equal(schedule.days.length, value < 0.5 ? 2 : 3);
    assert.equal(new Set(schedule.days.map((day) => day.date)).size, schedule.days.length);
    for (const day of schedule.days) {
      assert.ok(day.date >= "2026-10-12" && day.date <= "2026-10-18");
      assert.ok(day.requiredMs >= 15_000 && day.requiredMs <= 30_000);
      assert.equal(day.viewedMs, 0);
      assert.equal(day.appeared, false);
    }
  }
});

test("weekdays and required times both use their own random draws", () => {
  const draws = [0.9, 0.999, 0, 0.5, 0, 0.5, 0.999999];
  const schedule = createGuestCatSchedule(monday, () => draws.shift());
  assert.deepEqual(
    schedule.days.map(({ date, requiredMs }) => [date, requiredMs]),
    [
      ["2026-10-13", 15_000],
      ["2026-10-16", 22_500],
      ["2026-10-18", 30_000],
    ],
  );
  assert.equal(draws.length, 0);
});

test("reloads and another day in the same week retain every draw without consulting randomness", () => {
  const storage = memoryStorage();
  const first = new GuestCatScheduleStore(storage, () => 0).load(monday);
  const reloaded = new GuestCatScheduleStore(storage, () => {
    assert.fail("A saved week must not be redrawn");
  });
  assert.deepEqual(reloaded.load(monday), first);
  assert.deepEqual(reloaded.load(wednesday), first);
  assert.deepEqual(reloaded.load(new Date(2026, 9, 18, 23, 59, 59)), first);
});

test("partial viewing resumes on revisit and only reaching the saved threshold permits a claim", () => {
  const storage = memoryStorage();
  let store = new GuestCatScheduleStore(storage, () => 0);
  assert.equal(store.claim(monday), false);
  store.record(monday, "2026-10-12", 6000);
  assert.equal(store.claim(monday), false);
  store = new GuestCatScheduleStore(storage, () => assert.fail("No redraw on revisit"));
  assert.equal(store.load(monday).days[0].viewedMs, 6000);
  assert.equal(store.record(monday, "2026-10-12", 8999).days[0].viewedMs, 14_999);
  assert.equal(store.claim(monday), false);
  store.record(monday, "2026-10-12", 1);
  assert.equal(store.claim(monday), true);
  assert.equal(JSON.parse(storage.getItem(guestCatStorageKey)).days[0].appeared, true);
  assert.equal(new GuestCatScheduleStore(storage).claim(monday), false);
});

test("unselected days never appear, and yesterday's progress does not satisfy today's requirement", () => {
  const store = new GuestCatScheduleStore(memoryStorage(), () => 0);
  store.record(monday, "2026-10-12", 30_000);
  assert.equal(store.claim(tuesday), false);
  assert.equal(store.load(tuesday).days[1].viewedMs, 0);
  store.record(tuesday, "2026-10-13", 15_000);
  assert.equal(store.claim(tuesday), true);
  const saved = store.load(wednesday);
  assert.deepEqual(store.record(wednesday, "2026-10-14", 90_000), saved);
  assert.equal(store.claim(wednesday), false);
});

test("a new local Monday replaces last week's schedule, progress and daily claims", () => {
  const storage = memoryStorage();
  const store = new GuestCatScheduleStore(storage, () => 0);
  store.record(monday, "2026-10-12", 15_000);
  assert.equal(store.claim(monday), true);
  assert.deepEqual(
    store.load(nextMonday),
    createGuestCatSchedule(nextMonday, () => 0),
  );
  assert.equal(store.claim(nextMonday), false);
});

test("interleaved tabs preserve saved progress and recheck a prior claim before appearing", () => {
  const storage = memoryStorage();
  const a = new GuestCatScheduleStore(storage, () => 0);
  const b = new GuestCatScheduleStore(storage, () => assert.fail("Share the existing draw"));
  a.load(monday);
  b.load(monday);
  a.record(monday, "2026-10-12", 7000);
  assert.equal(b.record(monday, "2026-10-12", 8000).days[0].viewedMs, 15_000);
  assert.equal(a.claim(monday), true);
  assert.equal(b.claim(monday), false);
  assert.equal(b.record(monday, "2026-10-12", 1000).days[0].appeared, true);
});

test("elapsed viewing is clamped, immutable, and cannot reverse a consumed encounter", () => {
  const schedule = createGuestCatSchedule(monday, () => 0);
  assert.equal(recordGuestCatViewing(schedule, "2026-10-12", -1), schedule);
  assert.equal(recordGuestCatViewing(schedule, "2026-10-12", NaN), schedule);
  const ready = recordGuestCatViewing(schedule, "2026-10-12", 99_000);
  assert.equal(schedule.days[0].viewedMs, 0);
  assert.equal(ready.days[0].viewedMs, 15_000);
  const claimed = claimGuestCatAppearance(ready, "2026-10-12");
  assert.equal(ready.days[0].appeared, false);
  assert.equal(claimGuestCatAppearance(claimed, "2026-10-12"), null);
  assert.deepEqual(recordGuestCatViewing(claimed, "2026-10-12", 1000), claimed);
});

test("corrupt or out-of-week storage is rejected; valid storage is retained", () => {
  const valid = createGuestCatSchedule(monday, () => 0);
  assert.deepEqual(parseGuestCatSchedule(JSON.stringify(valid), monday), valid);
  for (const raw of [
    null,
    "{",
    "null",
    "[]",
    "{}",
    JSON.stringify({ ...valid, days: [valid.days[0], valid.days[0]] }),
    JSON.stringify({ ...valid, days: [{ ...valid.days[0], requiredMs: 1 }, valid.days[1]] }),
    JSON.stringify({ ...valid, days: [{ ...valid.days[0], viewedMs: -1 }, valid.days[1]] }),
    JSON.stringify({ ...valid, days: [{ ...valid.days[0], appeared: "true" }, valid.days[1]] }),
  ]) {
    assert.equal(parseGuestCatSchedule(raw, monday), null, raw);
  }
  assert.equal(parseGuestCatSchedule(JSON.stringify(valid), nextMonday), null);
});

test("a failed persistence write never authorizes an appearance", () => {
  const storage = memoryStorage();
  const store = new GuestCatScheduleStore(storage, () => 0);
  store.record(monday, "2026-10-12", 15_000);
  storage.setItem = () => {
    throw new Error("Storage unavailable");
  };
  assert.throws(() => store.claim(monday), /Storage unavailable/);
  assert.equal(JSON.parse(storage.getItem(guestCatStorageKey)).days[0].appeared, false);
});

test("local date and Monday boundaries are correct in Tokyo and across New York DST and New Year", () => {
  for (const [timezone, instant, date, weekStart] of [
    ["Asia/Tokyo", "2026-10-18T15:00:00Z", "2026-10-19", "2026-10-19"],
    ["America/New_York", "2026-10-18T15:00:00Z", "2026-10-18", "2026-10-12"],
    ["America/New_York", "2026-03-08T07:01:00Z", "2026-03-08", "2026-03-02"],
    ["America/New_York", "2026-11-01T06:01:00Z", "2026-11-01", "2026-10-26"],
    ["Asia/Tokyo", "2026-12-31T15:00:00Z", "2027-01-01", "2026-12-28"],
  ]) {
    const result = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
      import { guestCatDate, createGuestCatSchedule } from ${JSON.stringify(moduleUrl)};
      const now = new Date(${JSON.stringify(instant)});
      console.log(JSON.stringify([guestCatDate(now), createGuestCatSchedule(now, () => 0).weekStart]));
    `,
      ],
      { env: { ...process.env, TZ: timezone }, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), [date, weekStart], timezone);
  }
  assert.equal(guestCatDate(monday), "2026-10-12");
});
