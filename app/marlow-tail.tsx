"use client";

import { useEffect, useId, useState } from "react";
import { marlowTwitchDuration, startMarlowTailTwitch } from "./marlow-tail-twitch";
import "./marlow-tail.css";

const image = "/images/breeds/maine-coon.webp";
export type MarlowTailPose = "animate" | "twitch" | "rest" | "left" | "right";

// These paths are specific to the original 512px Marlow illustration.
// The foreground follows the flank and the resting hind paw, never a rectangle.
const body =
  "M0 0H353V285L310 291L320 304L335 315L320 320L339 332L325 332L335 346L330 359L338 369L332 389L347 395Q367 399 363 414Q361 430 341 431L300 438L270 512H0Z";
// Eight pixels of overlap are hidden behind the foreground around the pivot.
const tail =
  "M353 0H512V512H310L310 436L331 424L322 391L322 365L320 345L314 327L310 312L302 301L300 285H353Z";

export function MarlowTailSprite({
  pose,
  motionEnabled,
  twitchActive,
}: {
  pose: MarlowTailPose;
  motionEnabled: boolean;
  twitchActive: boolean;
}) {
  const id = useId();
  return (
    <svg
      className="marlow-tail-sprite"
      viewBox="0 0 512 512"
      aria-hidden="true"
      focusable="false"
      data-pose={motionEnabled ? pose : "rest"}
      data-twitch-active={twitchActive}
    >
      <defs>
        <clipPath id={`${id}-body`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${id}-tail`}>
          <path d={tail} />
        </clipPath>
      </defs>
      <g
        className="marlow-tail-rotate"
        style={pose === "twitch" ? { animationDuration: `${marlowTwitchDuration}ms` } : undefined}
      >
        <image href={image} width="512" height="512" clipPath={`url(#${id}-tail)`} />
      </g>
      <image href={image} width="512" height="512" clipPath={`url(#${id}-body)`} />
    </svg>
  );
}

// The existing cat-sprite parent keeps dancing throughout gestures and pauses.
export function MarlowTail({ motionEnabled }: { motionEnabled: boolean }) {
  const [twitchActive, setTwitchActive] = useState(false);
  useEffect(() => {
    if (!motionEnabled) return;
    return startMarlowTailTwitch(setTwitchActive);
  }, [motionEnabled]);
  return (
    <MarlowTailSprite pose="twitch" motionEnabled={motionEnabled} twitchActive={twitchActive} />
  );
}
