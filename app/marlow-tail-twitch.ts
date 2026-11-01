export const marlowTwitchDuration = 760;

// Schedule gestures, not frames. A complete double twitch precedes each random rest.
export function startMarlowTailTwitch(setActive: (active: boolean) => void) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = () => {
    clearTimeout(timer);
    setActive(false);
  };
  const schedule = () => {
    timer = setTimeout(
      () => {
        setActive(true);
        timer = setTimeout(() => {
          setActive(false);
          schedule();
        }, marlowTwitchDuration);
      },
      4_000 + Math.random() * 4_000,
    );
  };
  const sync = () => {
    reset();
    if (!document.hidden && !reducedMotion.matches) schedule();
  };
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
  return () => {
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    reset();
  };
}
