"use client";

import { useSyncExternalStore } from "react";
import { isHalloweenFloor, nextHalloweenFloorBoundary } from "./halloween-floor-period";

export function getHalloweenFloorSnapshot() {
  // Local visual QA only. Production always uses the configured event periods.
  if (process.env.NODE_ENV === "development") {
    const preview = new URLSearchParams(window.location.search).get("halloween");
    if (preview === "on") return true;
    if (preview === "off") return false;
  }
  return isHalloweenFloor(Date.now());
}

export function subscribeToHalloweenFloor(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const sync = () => {
    clearTimeout(timer);
    onChange();
    if (document.hidden) return;

    const now = Date.now();
    const boundary = nextHalloweenFloorBoundary(now);
    if (boundary !== undefined) {
      // Recheck the wall clock, while waking exactly at nearby event boundaries.
      timer = setTimeout(sync, Math.min(60_000, boundary - now));
    }
  };

  document.addEventListener("visibilitychange", sync);
  window.addEventListener("pageshow", sync);
  window.addEventListener("focus", sync);
  sync();
  return () => {
    clearTimeout(timer);
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("pageshow", sync);
    window.removeEventListener("focus", sync);
  };
}

// The server and first hydration render both show the ordinary floor.
const getServerSnapshot = () => false;

export function useHalloweenFloor() {
  return useSyncExternalStore(
    subscribeToHalloweenFloor,
    getHalloweenFloorSnapshot,
    getServerSnapshot,
  );
}
