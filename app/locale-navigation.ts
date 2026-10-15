import type { Locale } from "./locale";
import { createLocaleCookie, readLocaleCookie } from "./locale-cookie";

export function isLocale(value: string): value is Locale {
  return value === "ja" || value === "en";
}

export function languageHref(locale: Locale, search = "", hash = ""): string {
  if (!isLocale(locale)) throw new RangeError("Unsupported locale.");
  if (search && !search.startsWith("?")) throw new RangeError("Invalid query string.");
  if (hash && !hash.startsWith("#")) throw new RangeError("Invalid fragment.");
  return `/${locale}${search}${hash}`;
}

export function isSameTabSelection(event: {
  button: number;
  metaKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
}): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

// A successful assignment is not enough: confirm the preference that can be read back.
export function saveLocalePreference(
  locale: Locale,
  target: { cookie: string },
  protocol: string,
): boolean {
  try {
    target.cookie = createLocaleCookie(locale, protocol);
    return readLocaleCookie(target.cookie) === locale;
  } catch {
    return false;
  }
}
