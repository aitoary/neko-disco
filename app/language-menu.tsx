"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import type { Locale } from "./locale";
import type { LanguageMenuText } from "./language-menu-text";
import "./language-menu.css";

type LanguageMenuProps = {
  locale: Locale;
  hrefs: Record<Locale, string>;
  text: LanguageMenuText;
  onSelect?: (locale: Locale, event: MouseEvent<HTMLAnchorElement>) => void;
};

function closeMenu(menu: HTMLDetailsElement | null, returnFocus = false) {
  if (!menu) return;
  menu.open = false;
  if (returnFocus) menu.querySelector("summary")?.focus({ preventScroll: true });
}

// The header opts into the responsive placement with the language-menu-header class.
export function LanguageMenu({ locale, hrefs, text, onSelect }: LanguageMenuProps) {
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function outsidePointer(event: PointerEvent) {
      const menu = menuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        closeMenu(menu);
      }
    }
    document.addEventListener("pointerdown", outsidePointer);
    return () => document.removeEventListener("pointerdown", outsidePointer);
  }, []);

  useEffect(() => {
    const menu = menuRef.current;
    if (menu?.open) closeMenu(menu, menu.contains(document.activeElement));
  }, [locale]);

  function select(option: Locale, event: MouseEvent<HTMLAnchorElement>) {
    onSelect?.(option, event);
    closeMenu(menuRef.current, true);
  }

  return (
    <details
      className="language-menu"
      ref={menuRef}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.currentTarget.open) {
          event.preventDefault();
          event.stopPropagation();
          closeMenu(menuRef.current, true);
        }
      }}
      onBlur={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          !event.currentTarget.contains(event.relatedTarget)
        ) {
          closeMenu(menuRef.current);
        }
      }}
    >
      <summary aria-label={text.menuLabel.replace("{language}", text.names[locale])}>
        <span aria-hidden="true">{locale.toUpperCase()}</span>
        <ChevronDown size={12} aria-hidden="true" />
      </summary>
      <nav className="language-menu-options" aria-label={text.listLabel}>
        {(["ja", "en"] as const).map((option) => (
          <Link
            key={option}
            href={hrefs[option]}
            lang={option}
            aria-current={option === locale ? "page" : undefined}
            prefetch={false}
            onClick={(event) => {
              if (event.button === 0) select(option, event);
            }}
            onAuxClick={(event) => {
              if (event.button === 1) select(option, event);
            }}
          >
            <span>{text.names[option]}</span>
            {option === locale ? <Check size={14} aria-hidden="true" /> : null}
          </Link>
        ))}
      </nav>
    </details>
  );
}
