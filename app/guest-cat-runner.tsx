"use client";

import { useEffect, useReducer, useRef, type CSSProperties } from "react";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Locale } from "./locale";
import { guestCatConfig, guestCatReducer, guestCatText } from "./guest-cat-config";
import { GuestCatSprite } from "./guest-cat-sprite";
import "./guest-cat.css";

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
  const text = guestCatText[locale];

  useEffect(() => {
    currentMotion.current = motionEnabled;
    if (state !== "running") return;
    if (!flight.current && track.current) {
      flight.current = track.current.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
        { duration: guestCatConfig.crossingDurationMs, easing: "linear", fill: "both" },
      );
      flight.current.onfinish = () => dispatch({ type: "finish" });
    }
    if (motionEnabled) flight.current?.play();
    else flight.current?.pause();
  }, [state, motionEnabled]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scene = track.current?.closest(".scene");
    if (!scene) return;
    // One encounter per mount, delayed until the floor is actually in view.
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      timer = setTimeout(
        () => dispatch({ type: "appear", motionEnabled: currentMotion.current }),
        guestCatConfig.appearDelayMs,
      );
    });
    observer.observe(scene);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
      flight.current?.cancel();
    };
  }, []);

  const activate = () => {
    // Pause synchronously in the input handler; retain the exact transform across the pose swap.
    flight.current?.pause();
    onInteract();
    dispatch({ type: "tap" });
  };
  const dismiss = () => dispatch({ type: "dismiss" });

  return (
    <>
      <div
        ref={track}
        className="guest-cat-track"
        data-state={state}
        hidden={state === "hidden"}
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
            // The guest disappears on close, so return to the floor rather than a hidden trigger.
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
