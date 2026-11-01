"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { startMarlowTailTwitch } from "./marlow-tail-twitch";
import { MarlowTailSprite, type MarlowTailPose } from "./marlow-tail";
import "./marlow-tail-preview.css";

const subscribe = () => () => {};
const getSnapshot = () =>
  process.env.NODE_ENV === "development" &&
  new URLSearchParams(window.location.search).get("marlow") === "on";
const getServerSnapshot = () => false;
const image = "/images/breeds/maine-coon.webp";

export default function MarlowTailPreview({
  children,
  motionEnabled,
}: {
  children: ReactNode;
  motionEnabled: boolean;
}) {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [pose, setPose] = useState<MarlowTailPose>("animate");
  const [twitchActive, setTwitchActive] = useState(false);
  useEffect(() => {
    if (!enabled || !motionEnabled || pose !== "twitch") return;
    return startMarlowTailTwitch(setTwitchActive);
  }, [enabled, motionEnabled, pose]);
  const controls = enabled ? document.getElementById("marlow-preview-controls") : null;
  if (!controls) return children;
  return (
    <>
      <MarlowTailSprite pose={pose} motionEnabled={motionEnabled} twitchActive={twitchActive} />
      {createPortal(
        <fieldset className="marlow-preview-controls" onClick={(event) => event.stopPropagation()}>
          <legend>マーロウの尻尾 · ローカルPoC</legend>
          <p aria-live="polite">
            {pose === "twitch"
              ? "B：3°の反応を2回（合計0.76秒）→ 元の位置で4〜8秒ランダム休止。"
              : "A：±2° · 往復2.8秒 ＋ 休止1.2秒。"}
            フロアのダンスは常時継続。
          </p>
          <div role="group" aria-label="尻尾の動き">
            {(
              [
                ["animate", "A：ゆったり揺れる"],
                ["twitch", "B：2回ピクピク"],
                ["rest", "元の位置"],
                ["left", "左端で確認"],
                ["right", "右端で確認"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={pose === value}
                onClick={() => setPose(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="marlow-preview-comparison">
            <figure>
              <img src={image} alt="マーロウの元画像" width="512" height="512" />
              <figcaption>元画像</figcaption>
            </figure>
            <figure>
              <MarlowTailSprite
                pose={pose}
                motionEnabled={motionEnabled}
                twitchActive={twitchActive}
              />
              <figcaption>尻尾のみの拡大確認（ダンスの合成はフロアで確認）</figcaption>
            </figure>
          </div>
          <p>
            動きOFF・端末の「動きを減らす」では静止。URLの ?marlow=on
            を外すと通常の尻尾ピクピクに戻ります。
          </p>
        </fieldset>,
        controls,
      )}
    </>
  );
}
