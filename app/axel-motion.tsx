"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { startAxelMotionLoop } from "./axel-motion-loop";
import "./axel-motion.css";

// The outer layer owns the gesture; the child's cat-sprite keeps its dance.
export function AxelMotion({
  children,
  motionEnabled,
}: {
  children: ReactNode;
  motionEnabled: boolean;
}) {
  const layer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!motionEnabled || !layer.current) return;
    return startAxelMotionLoop(layer.current);
  }, [motionEnabled]);

  return (
    <span
      ref={layer}
      className="axel-motion-layer"
      data-pattern={motionEnabled ? "loop" : "off"}
      data-loop-phase="idle"
    >
      {children}
    </span>
  );
}
