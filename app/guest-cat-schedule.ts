export const guestCatStorageKey = "neko-disco:guest-cat:v1";

export type GuestCatDay = {
  date: string;
  requiredMs: number;
  viewedMs: number;
  appeared: boolean;
};
export type GuestCatSchedule = {
  weekStart: string;
  days: GuestCatDay[];
};

export function guestCatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function weekDates(now: Date): string[] {
  // Calendar arithmetic preserves local weekdays across DST, year and month boundaries.
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return guestCatDate(date);
  });
}

export function createGuestCatSchedule(now: Date, random = Math.random): GuestCatSchedule {
  const dates = weekDates(now);
  const weekStart = dates[0];
  const count = random() < 0.5 ? 2 : 3;
  // A partial Fisher–Yates shuffle selects distinct, equally likely weekdays.
  for (let index = 0; index < count; index++) {
    const selected = index + Math.floor(random() * (7 - index));
    [dates[index], dates[selected]] = [dates[selected], dates[index]];
  }
  return {
    weekStart,
    days: dates
      .slice(0, count)
      .sort()
      .map((date) => ({
        date,
        requiredMs: 15_000 + Math.floor(random() * 15_001),
        viewedMs: 0,
        appeared: false,
      })),
  };
}

export function parseGuestCatSchedule(raw: string | null, now: Date): GuestCatSchedule | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw);
    const dates = weekDates(now);
    if (
      value?.weekStart !== dates[0] ||
      !Array.isArray(value.days) ||
      (value.days.length !== 2 && value.days.length !== 3) ||
      new Set(value.days.map((day: GuestCatDay) => day?.date)).size !== value.days.length ||
      !value.days.every(
        (day: GuestCatDay) =>
          day &&
          dates.includes(day.date) &&
          Number.isInteger(day.requiredMs) &&
          day.requiredMs >= 15_000 &&
          day.requiredMs <= 30_000 &&
          Number.isFinite(day.viewedMs) &&
          day.viewedMs >= 0 &&
          day.viewedMs <= day.requiredMs &&
          typeof day.appeared === "boolean",
      )
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

export function recordGuestCatViewing(
  schedule: GuestCatSchedule,
  date: string,
  elapsedMs: number,
): GuestCatSchedule {
  if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return schedule;
  return {
    ...schedule,
    days: schedule.days.map((day) =>
      day.date === date && !day.appeared
        ? { ...day, viewedMs: Math.min(day.requiredMs, day.viewedMs + elapsedMs) }
        : day,
    ),
  };
}

export function claimGuestCatAppearance(
  schedule: GuestCatSchedule,
  date: string,
): GuestCatSchedule | null {
  const day = schedule.days.find((day) => day.date === date);
  if (!day || day.appeared || day.viewedMs < day.requiredMs) return null;
  return {
    ...schedule,
    days: schedule.days.map((day) => (day.date === date ? { ...day, appeared: true } : day)),
  };
}

// Re-read before every update so another tab's progress or appearance is preserved.
export class GuestCatScheduleStore {
  constructor(
    private storage: Pick<Storage, "getItem" | "setItem">,
    private random = Math.random,
  ) {}

  load(now: Date): GuestCatSchedule {
    const saved = parseGuestCatSchedule(this.storage.getItem(guestCatStorageKey), now);
    if (saved) return saved;
    const schedule = createGuestCatSchedule(now, this.random);
    this.save(schedule);
    return schedule;
  }

  record(now: Date, date: string, elapsedMs: number): GuestCatSchedule {
    const schedule = this.load(now);
    const day = schedule.days.find((day) => day.date === date);
    if (!day || day.appeared || elapsedMs <= 0) return schedule;
    const updated = recordGuestCatViewing(schedule, date, elapsedMs);
    this.save(updated);
    return updated;
  }

  claim(now: Date): boolean {
    const claimed = claimGuestCatAppearance(this.load(now), guestCatDate(now));
    if (!claimed) return false;
    // Persist before rendering: missing a tap or reloading still consumes this visit.
    this.save(claimed);
    return true;
  }

  private save(schedule: GuestCatSchedule) {
    this.storage.setItem(guestCatStorageKey, JSON.stringify(schedule));
  }
}
