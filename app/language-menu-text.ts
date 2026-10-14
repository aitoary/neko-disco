import type { Locale } from "./locale";

export type LanguageMenuText = {
  menuLabel: string;
  listLabel: string;
  names: Record<Locale, string>;
};

export const japaneseLanguageMenuText = {
  menuLabel: "言語を選ぶ（現在：{language}）",
  listLabel: "表示言語",
  names: { ja: "日本語", en: "English" },
} satisfies LanguageMenuText;

export const englishLanguageMenuText = {
  menuLabel: "Choose language (current: {language})",
  listLabel: "Display language",
  // Autonyms: 日本語 is an intentional Japanese exception in the English menu.
  names: { ja: "日本語", en: "English" },
} satisfies LanguageMenuText;
