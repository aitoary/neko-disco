import Image from "next/image";
import { guestCatConfig, type GuestCatState } from "./guest-cat-config";

export function GuestCatSprite({
  state,
  motionEnabled,
  direction = "right",
}: {
  state: GuestCatState;
  motionEnabled: boolean;
  direction?: "left" | "right";
}) {
  const running = state === "running" || state === "exiting";
  return (
    <span
      className="guest-cat-sprite"
      aria-hidden="true"
      data-running={running && motionEnabled}
      data-direction={direction}
    >
      {/* Load both original PNGs eagerly so the first tap never waits for the other pose. */}
      {(["running", "stopped"] as const).map((pose) => (
        <Image
          key={pose}
          className="guest-cat-image"
          data-active={(running ? "running" : "stopped") === pose}
          src={pose === "running" ? guestCatConfig.runImage : guestCatConfig.lookbackImage}
          width={1254}
          height={1254}
          alt=""
          loading="eager"
          unoptimized
          draggable={false}
        />
      ))}
    </span>
  );
}
