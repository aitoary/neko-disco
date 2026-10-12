import type { Locale } from "./locale";

const localeCookieName = "neko_disco_locale";

// Read a Cookie header or document.cookie without decoding or defaulting the locale.
export function readLocaleCookie(cookies: string | null | undefined): Locale | undefined {
  if (!cookies) return undefined;

  let locale: Locale | undefined;
  for (const entry of cookies.split(";")) {
    const pair = entry.trim();
    const separator = pair.indexOf("=");
    const name = (separator === -1 ? pair : pair.slice(0, separator)).trim();
    if (name !== localeCookieName) continue;

    const value = separator === -1 ? "" : pair.slice(separator + 1);
    if (value !== "ja" && value !== "en") return undefined;
    // Never choose the first/last conflicting value; identical values are unambiguous.
    if (locale !== undefined && locale !== value) return undefined;
    locale = value;
  }
  return locale;
}

// Prepare only the assignment string. Manual writing and read-back belong to the later UI.
export function createLocaleCookie(locale: Locale, protocol: string): string {
  if (locale !== "ja" && locale !== "en") throw new RangeError("Unsupported locale.");
  if (protocol !== "http:" && protocol !== "https:") {
    throw new RangeError("Unsupported cookie protocol.");
  }

  const cookie = `${localeCookieName}=${locale}; Max-Age=15552000; Path=/; SameSite=Lax`;
  return protocol === "https:" ? `${cookie}; Secure` : cookie;
}
