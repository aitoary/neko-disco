// CSS owns each movement; this controller only schedules the pauses between them.
export function startAxelMotionLoop(layer: HTMLElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const reset = () => {
    clearTimeout(timer);
    layer.dataset.loopPhase = "idle";
    delete layer.dataset.swayCount;
  };
  const startSway = () => {
    layer.dataset.swayCount = String(1 + Math.floor(Math.random() * 3));
    layer.dataset.loopPhase = "sway";
  };
  const sync = () => {
    reset();
    if (!document.hidden && !reducedMotion.matches) startSway();
  };
  const onEnd = (event: AnimationEvent) => {
    if (event.target !== layer || document.hidden || reducedMotion.matches) return;
    if (layer.dataset.loopPhase === "sway" && event.animationName === "axel-preview-loop-sway") {
      layer.dataset.loopPhase = "rest";
      timer = setTimeout(() => {
        layer.dataset.loopPhase = "hop";
      }, 3_000);
    } else if (
      layer.dataset.loopPhase === "hop" &&
      event.animationName === "axel-preview-loop-hop"
    ) {
      layer.dataset.loopPhase = "rest";
      timer = setTimeout(startSway, 4_000);
    }
  };
  layer.addEventListener("animationend", onEnd);
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
  return () => {
    layer.removeEventListener("animationend", onEnd);
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    reset();
  };
}
