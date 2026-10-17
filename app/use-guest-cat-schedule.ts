"use client";

import { useEffect, useState } from "react";
import {
  GuestCatScheduleStore,
  guestCatDate,
  guestCatStorageKey,
  parseGuestCatSchedule,
} from "./guest-cat-schedule";

export function useGuestCatSchedule(motionEnabled: boolean, dialogOpen: boolean) {
  const [encounter, setEncounter] = useState<string | null>(null);

  useEffect(() => {
    const scene = document.querySelector("#dance-floor .scene");
    if (!scene) return;
    let store: GuestCatScheduleStore;
    try {
      store = new GuestCatScheduleStore(window.localStorage);
    } catch {
      // Without persistent storage, a reload-safe daily limit cannot be guaranteed.
      return;
    }
    let disposed = false;
    let storageFailed = false;
    let inView = false;
    let startedAt: number | null = null;
    let startedDay = guestCatDate(new Date());
    let timer: ReturnType<typeof setTimeout> | undefined;
    let claiming = false;

    const canCount = () =>
      inView &&
      !document.hidden &&
      motionEnabled &&
      !dialogOpen &&
      encounter === null &&
      // Include the existing dialog's closing animation before resuming the clock.
      !document.querySelector('[data-slot="dialog-content"]');

    const saveElapsed = () => {
      const now = new Date();
      // Never carry yesterday's time into today's requirement, including after sleep.
      const elapsed =
        startedAt !== null && startedDay === guestCatDate(now) ? performance.now() - startedAt : 0;
      startedAt = null;
      return store.record(now, startedDay, elapsed);
    };

    const sync = () => {
      clearTimeout(timer);
      if (disposed || storageFailed) return;
      try {
        const schedule = saveElapsed();
        const now = new Date();
        const date = guestCatDate(now);
        const day = schedule.days.find((day) => day.date === date);
        if (day && !day.appeared && canCount()) {
          startedAt = performance.now();
          startedDay = date;
          if (day.viewedMs >= day.requiredMs && !claiming) {
            claiming = true;
            startedAt = null;
            const claim = () => {
              // A queued Web Lock may outlive the visible floor, dialog or local date.
              if (!disposed && canCount() && guestCatDate(new Date()) === date) {
                if (store.claim(new Date())) setEncounter(date);
              }
            };
            // Web Locks serialize simultaneous claims. The fallback still re-reads
            // storage immediately before claiming and observes other tabs' writes.
            const request = navigator.locks
              ? navigator.locks.request(guestCatStorageKey, claim)
              : Promise.resolve().then(claim);
            void request
              .catch(() => {
                storageFailed = true;
              })
              .finally(() => {
                claiming = false;
                sync();
              });
          }
        }
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const remaining =
          day && !day.appeared && canCount() && !claiming
            ? Math.max(1, day.requiredMs - day.viewedMs)
            : 60_000;
        timer = setTimeout(
          sync,
          Math.max(1, Math.min(day && !day.appeared ? 1000 : 60_000, remaining, +midnight - +now)),
        );
      } catch {
        storageFailed = true;
        startedAt = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        sync();
      },
      { threshold: [0, 0.5] },
    );
    const onStorage = (event: StorageEvent) => {
      if (event.key !== guestCatStorageKey && event.key !== null) return;
      const now = new Date();
      const updated = parseGuestCatSchedule(event.newValue, now);
      // Progress is merged on the next tick. Reacting to every progress write
      // would bounce writes between two simultaneously visible tabs.
      if (!updated || updated.days.some((day) => day.date === guestCatDate(now) && day.appeared)) {
        sync();
      }
    };
    const onPageHide = () => {
      clearTimeout(timer);
      if (!storageFailed) {
        try {
          saveElapsed();
        } catch {
          storageFailed = true;
        }
      }
    };
    observer.observe(scene);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", sync);
    sync();
    return () => {
      disposed = true;
      onPageHide();
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", sync);
    };
  }, [motionEnabled, dialogOpen, encounter]);

  return { encounter, finishEncounter: () => setEncounter(null) };
}
