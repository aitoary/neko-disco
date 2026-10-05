"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const getSnapshot = () => window.matchMedia(reducedMotionQuery).matches;
// Keep the existing server-rendered state consistent with the first hydration render.
const getServerSnapshot = () => false;

export function useDiscoMotion() {
  const [manualMotion, setMotion] = useState<boolean | null>(null);
  const subscribe = useCallback((onStoreChange: () => void) => {
    const media = window.matchMedia(reducedMotionQuery);
    const change = () => {
      // As before, a later OS preference change takes precedence over a manual choice.
      setMotion(null);
      onStoreChange();
    };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  const reducedMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { motion: manualMotion ?? !reducedMotion, setMotion };
}
