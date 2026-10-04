"use client";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SceneHint = {
  id: string;
  anchor: HTMLButtonElement;
  label: string;
  detail: string;
};

export function SceneTooltip({ hint }: { hint: SceneHint | null }) {
  const layer = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!hint || !layer.current) return;
    const update = () => {
      const anchor = hint.anchor.getBoundingClientRect();
      const bubble = layer.current!.getBoundingClientRect();
      if (anchor.bottom < 0 || anchor.top > window.innerHeight) {
        setPosition(null);
        return;
      }
      const margin = 8;
      const clamp = (value: number, max: number) => Math.max(margin, Math.min(value, max));
      const left = clamp(
        anchor.left + anchor.width / 2 - bubble.width / 2,
        window.innerWidth - bubble.width - margin,
      );
      const above = anchor.top - bubble.height;
      const top = clamp(
        above >= margin ? above : anchor.bottom,
        window.innerHeight - bubble.height - margin,
      );
      setPosition((previous) =>
        previous?.left === left && previous?.top === top ? previous : { left, top },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(hint.anchor);
    observer.observe(layer.current);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [hint]);

  if (!hint) return null;
  // Outside the scene's isolated stacking context and rounded clipping region.
  return createPortal(
    <div
      ref={layer}
      className="scene-tooltip-layer"
      style={position ?? { left: -9999, top: 0, visibility: "hidden" }}
    >
      <div id="scene-tooltip" className="scene-tooltip" role="tooltip">
        {hint.label}
        <span>{hint.detail}</span>
      </div>
    </div>,
    document.body,
  );
}
