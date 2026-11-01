"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { startAxelMotionLoop } from "./axel-motion-loop";
import "./axel-motion-preview.css";

const patterns = [
  { id: "loop", label: "ランダムループ" },
  { id: "sway", label: "ソワソワ" },
  { id: "hop", label: "ピョコン" },
] as const;
const strengths = [
  { value: 1, label: "現状" },
  { value: 1.5, label: "1.5倍" },
  { value: 2, label: "2倍" },
] as const;
const speeds = [
  { id: "normal", label: "通常" },
  { id: "fast", label: "速い" },
] as const;

const subscribe = () => () => {};
const getSnapshot = () =>
  process.env.NODE_ENV === "development" &&
  new URLSearchParams(window.location.search).get("axel") === "on";
const getServerSnapshot = () => false;

// Development-only, floor Bengal only. No frame timers or per-frame React renders.
export default function AxelMotionPreview({
  children,
  motionEnabled,
}: {
  children: ReactNode;
  motionEnabled: boolean;
}) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [pattern, setPattern] = useState<(typeof patterns)[number]["id"]>("loop");
  const [strength, setStrength] = useState<number>(2);
  const [speed, setSpeed] = useState<(typeof speeds)[number]["id"]>("normal");
  const [paused, setPaused] = useState(false);
  const [combineDance, setCombineDance] = useState(true);
  const layer = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!enabled || !motionEnabled || paused || pattern !== "loop" || !layer.current) return;
    return startAxelMotionLoop(layer.current);
  }, [enabled, motionEnabled, paused, pattern]);
  const controls = enabled ? document.getElementById("axel-preview-controls") : null;
  if (!controls) return children;

  const distance = (pattern === "sway" ? 1.5 : 3) * strength;
  const activeSeconds =
    pattern === "sway" ? (speed === "fast" ? 0.7 : 1) : speed === "fast" ? 0.4 : 0.6;
  const restSeconds = pattern === "sway" ? 3 : 4;

  return (
    <>
      {createPortal(
        <fieldset className="axel-preview-controls">
          <legend>アクセルの動き比較 · ローカル試作</legend>
          <div className="axel-preview-options" role="group" aria-label="動きの種類">
            <span>動き</span>
            {patterns.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={pattern === option.id}
                onClick={() => {
                  setPattern(option.id);
                  if (option.id === "loop") {
                    setStrength(2);
                    setSpeed("normal");
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="axel-preview-options" role="group" aria-label="動きの強さ">
            <span>強さ</span>
            {strengths.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={strength === option.value}
                disabled={pattern === "loop"}
                onClick={() => setStrength(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="axel-preview-options" role="group" aria-label="動作速度">
            <span>速度</span>
            {speeds.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={speed === option.id}
                disabled={pattern === "loop"}
                onClick={() => setSpeed(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="axel-preview-options">
            <button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>
              {paused ? "追加の動きを再開" : "追加の動きを停止"}
            </button>
            <label>
              <input
                type="checkbox"
                checked={combineDance}
                onChange={(event) => setCombineDance(event.target.checked)}
              />
              既存ダンスと重ねる
            </label>
          </div>
          <p aria-live="polite">
            {pattern === "loop" ? (
              "ソワソワ（±3%・1秒）を1〜3回連続 → 3秒休止 → ピョコン（高さ6%・0.6秒）を1回 → 4秒休止。回数は毎周抽選。"
            ) : (
              <>
                {pattern === "sway" ? `左右±${distance}%` : `高さ${distance}%`} · 動作
                {activeSeconds}秒 ＋休止{restSeconds}秒（周期{activeSeconds + restSeconds}秒）
              </>
            )}
            {paused ? " · 追加の動きは停止中" : ""}
          </p>
          <p>ページの動きOFF・端末の「動きを減らす」設定では停止します。</p>
        </fieldset>,
        controls,
      )}
      <span
        ref={layer}
        className="axel-motion-layer"
        data-pattern={paused ? "off" : pattern}
        data-speed={speed}
        data-combine-dance={combineDance}
        style={{ "--axel-distance": `${distance}%` } as CSSProperties}
      >
        {children}
      </span>
    </>
  );
}
