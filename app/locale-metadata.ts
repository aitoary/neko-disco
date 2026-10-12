import type { Metadata } from "next";
import type { Locale } from "./locale";

const productionOrigin = "https://nekodisco.party";
const metadataText = {
  ja: {
    title: "NEKO DISCO｜猫とあそぶ、夜のひみつ基地",
    description:
      "人気ランキングから12猫種が集合。猫だらけのディスコで、イラストをタップして見た目や性格を知ろう。触ってあそべる、猫種と生態の図鑑。",
    openGraphLocale: "ja_JP",
  },
  en: {
    title: "NEKO DISCO | A secret after-dark hideout for cats",
    description:
      "Twelve cat breeds from a popularity ranking gather on the dance floor. Tap the illustrations to discover their looks, personalities, and cat-life facts.",
    openGraphLocale: "en_US",
  },
} satisfies Record<Locale, { title: string; description: string; openGraphLocale: string }>;

// Pure preparation only; connect this to the language routes when the complete UI is ready.
export function createLocaleMetadata(locale: Locale): Metadata {
  if (locale !== "ja" && locale !== "en") throw new RangeError("Unsupported locale.");

  const text = metadataText[locale];
  const canonical = `${productionOrigin}/${locale}`;
  return {
    title: text.title,
    description: text.description,
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    alternates: {
      canonical,
      languages: {
        ja: `${productionOrigin}/ja`,
        en: `${productionOrigin}/en`,
        "x-default": `${productionOrigin}/`,
      },
    },
    openGraph: {
      title: text.title,
      description: text.description,
      url: canonical,
      siteName: "NEKO DISCO",
      type: "website",
      locale: text.openGraphLocale,
      alternateLocale: [metadataText[locale === "ja" ? "en" : "ja"].openGraphLocale],
    },
  };
}
