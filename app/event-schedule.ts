import configuredEvents from "../config/events.json";

type EventEntry = {
  event: string;
  year: number;
  start: string;
  end: string;
};

function parseJstDate(value: string, field: string) {
  const timestamp = Date.parse(value);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(value) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp + 9 * 60 * 60 * 1000).toISOString().slice(0, 19) !== value.slice(0, 19)
  ) {
    throw new Error(`${field}: use a valid JST date such as 2026-10-31T00:00:00+09:00`);
  }
  return timestamp;
}

export function parseEventSchedule(entries: readonly EventEntry[]) {
  const registered = new Set<string>();
  return entries.map(({ event, year, start, end }, index) => {
    const location = `config/events.json[${index}]`;
    if (
      typeof event !== "string" ||
      !/^[a-z][a-z0-9-]*$/.test(event) ||
      !Number.isInteger(year) ||
      year < 1000 ||
      year > 9999
    ) {
      throw new Error(`${location}: event must be a lowercase name and year a four-digit integer`);
    }
    const startTime = parseJstDate(start, `${location}.start`);
    const endTime = parseJstDate(end, `${location}.end`);
    if (!start.startsWith(`${year}-`) || startTime >= endTime) {
      throw new Error(`${location}: start must belong to year and end must be later than start`);
    }
    const key = `${event}:${year}`;
    if (registered.has(key)) throw new Error(`${location}: duplicate event/year ${key}`);
    registered.add(key);
    return { event, year, start: startTime, end: endTime };
  });
}

export const eventSchedule = parseEventSchedule(configuredEvents);
