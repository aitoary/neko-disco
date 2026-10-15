"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "./locale";
import { isSameTabSelection, languageHref, saveLocalePreference } from "./locale-navigation";

type LocaleNavigation = {
  hrefs: Record<Locale, string>;
  saveFailed: boolean;
  selectLanguage: (locale: Locale, event: MouseEvent<HTMLAnchorElement>) => void;
  completeNavigation: (locale: Locale) => void;
  focusDestination: () => void;
};

const LocaleNavigationContext = createContext<LocaleNavigation | null>(null);

function isVisibleControl(control: HTMLElement, checkOpacity: boolean) {
  if (
    !control.isConnected ||
    control.tabIndex < 0 ||
    control.matches(":disabled") ||
    control.closest('[inert], [aria-hidden="true"]') ||
    !control.checkVisibility({ checkOpacity, checkVisibilityCSS: true })
  )
    return false;
  const rect = control.getBoundingClientRect();
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.top >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.left >= 0 &&
    rect.right <= window.innerWidth
  );
}

function scheduleDestinationFocus() {
  const controller = new AbortController();
  const { signal } = controller;
  let previousFocus = document.activeElement;
  let frame = 0;
  let revision = 0;
  const cancel = () => {
    controller.abort();
    window.cancelAnimationFrame(frame);
  };
  const restore = (finish = false) => {
    const currentRevision = ++revision;
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => {
      if (signal.aborted) return;
      if (document.activeElement !== previousFocus) {
        cancel();
        return;
      }
      const controls = document.querySelectorAll<HTMLElement>(
        ".language-menu summary, main button, main a[href], main summary, main [tabindex]",
      );
      const control = Array.from(controls).find((element) => isVisibleControl(element, false));
      if (!control) {
        if (finish) cancel();
        return;
      }
      // Entry animations can start at opacity 0. Wait only for this control's finite
      // animations (including ancestors), not the site's continuous decorative motion.
      const animations = document.getAnimations().filter(({ effect }) => {
        return (
          effect instanceof KeyframeEffect &&
          effect.target instanceof Element &&
          effect.target.contains(control) &&
          Number.isFinite(effect.getComputedTiming().endTime)
        );
      });
      const focus = () => {
        if (signal.aborted || currentRevision !== revision) return;
        // Do not steal focus if the user has already moved to another control.
        if (document.activeElement === previousFocus && isVisibleControl(control, true)) {
          control.focus({ preventScroll: true });
          previousFocus = control;
        }
        if (finish) cancel();
      };
      if (animations.length === 0) focus();
      else void Promise.allSettled(animations.map((animation) => animation.finished)).then(focus);
    });
  };
  // History restoration can keep scrolling after the page commits. Re-select in
  // the final viewport without overriding its scroll position or a user's input.
  document.addEventListener("scrollend", () => restore(true), { once: true, signal });
  for (const event of ["pointerdown", "keydown", "wheel", "touchstart", "popstate"])
    window.addEventListener(event, cancel, { capture: true, passive: true, signal });
  restore();
  return cancel;
}

// This stays in the common Root; no audio or play state is owned here.
export function LocaleNavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [suffix, setSuffix] = useState({ search: "", hash: "" });
  const [saveFailed, setSaveFailed] = useState(false);
  const pending = useRef<{ locale: Locale; hash: string } | null>(null);
  const previousLocale = useRef<Locale | null>(null);
  const cancelFocus = useRef<(() => void) | null>(null);
  const focusDestination = useCallback(() => {
    cancelFocus.current?.();
    cancelFocus.current = scheduleDestinationFocus();
  }, []);

  useEffect(() => () => cancelFocus.current?.(), []);

  useEffect(() => {
    const refresh = () => setSuffix({ search: window.location.search, hash: window.location.hash });
    const historyMoved = () => {
      pending.current = null;
      refresh();
    };
    refresh();
    window.addEventListener("hashchange", refresh);
    window.addEventListener("popstate", historyMoved);
    return () => {
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("popstate", historyMoved);
    };
  }, [pathname]);

  const completeNavigation = useCallback(
    (locale: Locale) => {
      if (window.location.pathname !== `/${locale}`) return;
      const changed = previousLocale.current !== null && previousLocale.current !== locale;
      previousLocale.current = locale;
      const target = pending.current;
      if (!target || target.locale !== locale) {
        if (changed) focusDestination();
        return;
      }
      pending.current = null;
      let anchor = target.hash.slice(1);
      try {
        anchor = decodeURIComponent(anchor);
      } catch {
        // An invalid encoded fragment cannot name one of the site's fixed anchors.
      }
      const section = anchor ? document.getElementById(anchor) : null;
      if (section) section.scrollIntoView({ behavior: "instant", block: "start" });
      else window.scrollTo({ top: 0, behavior: "instant" });
      focusDestination();
    },
    [focusDestination],
  );

  function selectLanguage(locale: Locale, event: MouseEvent<HTMLAnchorElement>) {
    setSaveFailed(!saveLocalePreference(locale, document, window.location.protocol));
    const { search, hash, pathname: currentPath } = window.location;
    const href = languageHref(locale, search, hash);
    // Native new-tab operations use the current query/fragment even before an effect refresh.
    event.currentTarget.href = href;
    if (!isSameTabSelection(event)) return;
    event.preventDefault();
    if (currentPath === `/${locale}`) return;
    pending.current = { locale, hash };
    router.push(href, { scroll: false });
  }

  return (
    <LocaleNavigationContext
      value={{
        hrefs: {
          ja: languageHref("ja", suffix.search, suffix.hash),
          en: languageHref("en", suffix.search, suffix.hash),
        },
        saveFailed,
        selectLanguage,
        completeNavigation,
        focusDestination,
      }}
    >
      {children}
    </LocaleNavigationContext>
  );
}

export function useLocaleNavigation() {
  const navigation = use(LocaleNavigationContext);
  if (!navigation)
    throw new Error("useLocaleNavigation must be used within LocaleNavigationProvider");
  return navigation;
}
