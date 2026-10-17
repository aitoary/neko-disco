"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "./locale";
import { guestCatConfig, guestCatReducer, guestCatText } from "./guest-cat-config";
import { GuestCatSprite } from "./guest-cat-sprite";
import "./guest-cat.css";

function pauseAtCurrentTime(animation: Animation) {
  const currentTime = animation.currentTime;
  animation.pause();
  // pause() settles on the next frame; pin the hold time before changing the pose.
  animation.currentTime = currentTime;
}

export function GuestCatRunner({
  locale,
  motionEnabled,
  onInteract,
}: {
  locale: Locale;
  motionEnabled: boolean;
  onInteract: () => void;
}) {
  const [state, dispatch] = useReducer(guestCatReducer, "hidden");
  const track = useRef<HTMLDivElement>(null);
  const flight = useRef<Animation | null>(null);
  const currentMotion = useRef(motionEnabled);
  const exitWaitRemaining = useRef<number>(guestCatConfig.exitDelayMs);
  const text = guestCatText[locale];

  useEffect(() => {
    currentMotion.current = motionEnabled;
    if (state === "hidden") {
      flight.current?.cancel();
      flight.current = null;
      return;
    }
    if (!flight.current && track.current) {
      flight.current = track.current.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
        { duration: guestCatConfig.crossingDurationMs, easing: "linear", fill: "both" },
      );
      // Motion-off encounters start at the track's existing stationary midpoint.
      flight.current.currentTime = state === "running" ? 0 : guestCatConfig.crossingDurationMs / 2;
      flight.current.onfinish = () => dispatch({ type: "finish" });
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    let waitStartedAt: number | undefined;
    const pauseWait = () => {
      clearTimeout(timer);
      if (waitStartedAt !== undefined) {
        exitWaitRemaining.current = Math.max(
          0,
          exitWaitRemaining.current - (performance.now() - waitStartedAt),
        );
        waitStartedAt = undefined;
      }
    };
    const syncMotion = () => {
      pauseWait();
      const enabled = motionEnabled && !document.hidden;
      const moving = enabled && (state === "running" || state === "exiting");
      // Reuse the paused crossing: its remaining time already matches the remaining distance.
      for (const animation of track.current?.getAnimations({ subtree: true }) ?? []) {
        if (moving) animation.play();
        else pauseAtCurrentTime(animation);
      }
      if (state === "waitingToExit" && enabled) {
        waitStartedAt = performance.now();
        timer = setTimeout(() => dispatch({ type: "exit" }), exitWaitRemaining.current);
      }
    };
    syncMotion();
    document.addEventListener("visibilitychange", syncMotion);
    return () => {
      pauseWait();
      document.removeEventListener("visibilitychange", syncMotion);
    };
  }, [state, motionEnabled]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scene = document.querySelector("#dance-floor .scene");
    if (!scene) return;
    let inView = false;
    let remaining: number = guestCatConfig.appearDelayMs;
    let startedAt: number | undefined;
    const pauseAppearance = () => {
      clearTimeout(timer);
      if (startedAt !== undefined) {
        remaining = Math.max(0, remaining - (performance.now() - startedAt));
        startedAt = undefined;
      }
    };
    const scheduleAppearance = () => {
      pauseAppearance();
      if (!inView || document.hidden) return;
      startedAt = performance.now();
      timer = setTimeout(() => {
        document.removeEventListener("visibilitychange", scheduleAppearance);
        dispatch({ type: "appear", motionEnabled: currentMotion.current });
      }, remaining);
    };
    // One encounter per mount, delayed until the floor is actually in view.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      inView = true;
      scheduleAppearance();
    });
    document.addEventListener("visibilitychange", scheduleAppearance);
    observer.observe(scene);
    return () => {
      observer.disconnect();
      pauseAppearance();
      document.removeEventListener("visibilitychange", scheduleAppearance);
      flight.current?.cancel();
      flight.current = null;
    };
  }, []);

  const activate = () => {
    if (state !== "running" && state !== "stopped") return;
    // Pause synchronously in the input handler; retain the exact transform across the pose swap.
    if (flight.current) pauseAtCurrentTime(flight.current);
    onInteract();
    dispatch({ type: "tap" });
  };
  const dismiss = () => dispatch({ type: "dismiss" });

  if (state === "hidden") return null;

  return (
    <>
      <div
        ref={track}
        className="guest-cat-track"
        data-state={state}
        style={
          {
            "--guest-cat-size": guestCatConfig.size,
            "--guest-cat-bottom": guestCatConfig.bottom,
          } as CSSProperties
        }
      >
        <button
          type="button"
          className="guest-cat-button"
          aria-label={state === "running" ? text.stop : text.open}
          disabled={state === "closing" || state === "waitingToExit" || state === "exiting"}
          onClick={activate}
        >
          <GuestCatSprite state={state} motionEnabled={motionEnabled} />
        </button>
      </div>
      <Dialog open={state === "dialog"} onOpenChange={(open) => !open && dismiss()}>
        <DialogContent
          className="fact-dialog bg-lime guest-cat-dialog"
          showCloseButton={false}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            // Radix calls this after the closing animation has unmounted the dialog.
            dispatch({ type: "dialogClosed" });
            // The guest is leaving, so return focus to the floor.
            track.current?.closest<HTMLElement>("#dance-floor")?.focus({ preventScroll: true });
          }}
        >
          <button type="button" className="dialog-close" aria-label={text.close} onClick={dismiss}>
            <X size={21} />
          </button>
          <div className="fact-visual">
            <GuestCatSprite state="stopped" motionEnabled={false} />
          </div>
          <div className="fact-copy">
            <p className="eyebrow">GUEST CAT · {text.badge}</p>
            <DialogTitle className="fact-title">{text.name}</DialogTitle>
            <DialogDescription className="fact-body">{text.intro}</DialogDescription>
            <p className="guest-cat-detail">{text.detail}</p>
            <div className="fact-actions">
              <button type="button" className="dark-button" onClick={dismiss}>
                {text.confirm} <Check size={16} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
