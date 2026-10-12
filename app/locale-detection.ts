import type { Locale } from "./locale";
import { readLocaleCookie } from "./locale-cookie";

// Approved basic language ranges and HTTP qvalues (0..1, at most three decimal digits).
const languagePreference =
  /^(ja|en)(?:-[a-z0-9]{1,8})*(?:[ \t]*;[ \t]*q=(0(?:\.\d{0,3})?|1(?:\.0{0,3})?))?$/i;

// Pure entry-page preparation only. Explicit language URLs must not use auto-detection.
export function detectLocale(
  cookieHeader: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  const storedLocale = readLocaleCookie(cookieHeader);
  if (storedLocale !== undefined) return storedLocale;

  let locale: Locale = "ja";
  let highestQuality = 0;
  for (const entry of (acceptLanguage ?? "").split(",")) {
    const match = languagePreference.exec(entry.trim());
    if (!match) continue;

    const quality = Number(match[2] ?? "1");
    // q=0 never wins; equal values keep the earlier header entry.
    if (quality > highestQuality) {
      highestQuality = quality;
      locale = match[1].toLowerCase() === "en" ? "en" : "ja";
    }
  }
  return locale;
}
