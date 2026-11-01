"use client";

import { useEffect, useId, useRef } from "react";

const closedEyes = "/images/breeds/british-shorthair-closing-eyes.png";
const closedDuration = 125;
const nextInterval = () => 4_000 + Math.random() * 4_000;

// Only this decorative overlay changes; the cat and the page do not rerender per blink.
export function startMauriceBlink(overlay: SVGSVGElement) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer: ReturnType<typeof setTimeout> | undefined;
  const open = () => {
    overlay.dataset.closed = "false";
  };
  const schedule = (delay: number) => {
    timer = setTimeout(() => {
      overlay.dataset.closed = "true";
      timer = setTimeout(() => {
        open();
        // Keep consecutive blink starts 4–8 seconds apart, including the closure.
        schedule(nextInterval() - closedDuration);
      }, closedDuration);
    }, delay);
  };
  const sync = () => {
    clearTimeout(timer);
    open();
    if (!document.hidden && !reducedMotion.matches) schedule(nextInterval());
  };
  reducedMotion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  sync();
  return () => {
    clearTimeout(timer);
    reducedMotion.removeEventListener("change", sync);
    document.removeEventListener("visibilitychange", sync);
    open();
  };
}

export function MauriceBlink({ motionEnabled }: { motionEnabled: boolean }) {
  const overlay = useRef<SVGSVGElement>(null);
  const id = useId();
  useEffect(() => {
    const target = overlay.current;
    if (!motionEnabled || !target) return;
    // SSR images may finish loading before React attaches SVG load handlers.
    // decode() also handles the already-cached case without missing that event.
    const image = new Image();
    let cancelled = false;
    let stop: (() => void) | undefined;
    image.src = closedEyes;
    image.decode().then(
      () => {
        if (!cancelled) stop = startMauriceBlink(target);
      },
      () => {
        // A missing/undecodable overlay leaves the original open eyes intact.
      },
    );
    return () => {
      cancelled = true;
      stop?.();
    };
  }, [motionEnabled]);

  return (
    <svg
      ref={overlay}
      className="maurice-blink"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      data-closed="false"
    >
      <defs>
        <radialGradient id={`${id}-feather`}>
          <stop offset="70%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </radialGradient>
        <mask id={`${id}-left`} maskUnits="userSpaceOnUse" x="179" y="156" width="56" height="54">
          <ellipse cx="207" cy="183" rx="28" ry="27" fill={`url(#${id}-feather)`} />
        </mask>
        <mask id={`${id}-right`} maskUnits="userSpaceOnUse" x="268" y="175" width="56" height="54">
          <ellipse cx="296" cy="202" rx="28" ry="27" fill={`url(#${id}-feather)`} />
        </mask>
      </defs>
      {/* Align each eye independently; never swap the full generated character. */}
      <image href={closedEyes} x="6.2" y="2.6" width="512" height="512" mask={`url(#${id}-left)`} />
      <image
        href={closedEyes}
        x="1.2"
        y="4.8"
        width="512"
        height="512"
        mask={`url(#${id}-right)`}
      />
    </svg>
  );
}
