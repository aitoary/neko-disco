"use client";

import type { Locale } from "./locale";
import { GuestCatRunner } from "./guest-cat-runner";
import { useGuestCatSchedule } from "./use-guest-cat-schedule";

export function GuestCatEncounter({
  locale,
  motionEnabled,
  dialogOpen,
  onInteract,
}: {
  locale: Locale;
  motionEnabled: boolean;
  dialogOpen: boolean;
  onInteract: () => void;
}) {
  const { encounter, finishEncounter } = useGuestCatSchedule(motionEnabled, dialogOpen);
  return encounter ? (
    <GuestCatRunner
      key={encounter}
      locale={locale}
      motionEnabled={motionEnabled}
      onInteract={onInteract}
      onFinish={finishEncounter}
    />
  ) : null;
}
