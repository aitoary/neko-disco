"use client";

import { useEffect, useRef, useState } from "react";
import { PawPrint } from "lucide-react";

export function BackToFloor({ motionEnabled }: { motionEnabled: boolean }) {
  const [visible, setVisible] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const intro = document.querySelector(".hero-heading");
    const closingCta = document.querySelector<HTMLButtonElement>(".closing .primary-button");
    if (!intro || !closingCta) return;

    let frame: number | null = null;
    let wasVisible = false;
    const updateVisibility = () => {
      frame = null;
      const pastIntro = intro.getBoundingClientRect().bottom <= 0;
      // Check position even when a direct jump skips the CTA on a short viewport.
      // Hand over before the CTA reaches the fixed controls; stay hidden in the footer.
      const reachedClosing = closingCta.getBoundingClientRect().top <= window.innerHeight - 144;
      const nextVisible = pastIntro && !reachedClosing;
      if (nextVisible === wasVisible) return;

      if (!nextVisible && document.activeElement === button.current) {
        const target = reachedClosing
          ? closingCta
          : document.querySelector<HTMLAnchorElement>(".header .brand");
        target?.focus({ preventScroll: true });
      }
      wasVisible = nextVisible;
      setVisible(nextVisible);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = window.requestAnimationFrame(updateVisibility);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const returnToTop = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelector<HTMLAnchorElement>(".header .brand")?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: motionEnabled && !reducedMotion ? "smooth" : "instant" });
  };

  return (
    <button
      ref={button}
      type="button"
      className="fixed-capsule back-to-floor"
      data-visible={visible}
      aria-label="ページ上部へ戻る"
      aria-hidden={!visible}
      disabled={!visible}
      onClick={returnToTop}
    >
      BACK TO THE FLOOR{" "}
      <span className="back-to-floor-icon" aria-hidden="true">
        <PawPrint size={17} />
      </span>
    </button>
  );
}
