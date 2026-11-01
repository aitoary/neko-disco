import { eventSchedule } from "./event-schedule";

const periods = eventSchedule.filter(({ event, enabled }) => event === "halloween" && enabled);
const boundaries = periods.flatMap(({ start, end }) => [start, end]).sort((a, b) => a - b);

export function isHalloweenFloor(now: number) {
  return periods.some(({ start, end }) => now >= start && now < end);
}

export function nextHalloweenFloorBoundary(now: number) {
  return boundaries.find((boundary) => boundary > now);
}
