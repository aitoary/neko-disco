// This is a one-off event: start inclusive, end exclusive, both fixed in JST.
export const halloweenFloorStart = Date.parse("2026-10-31T00:00:00+09:00");
export const halloweenFloorEnd = Date.parse("2026-11-01T05:00:00+09:00");

export function isHalloweenFloor(now: number) {
  return now >= halloweenFloorStart && now < halloweenFloorEnd;
}
