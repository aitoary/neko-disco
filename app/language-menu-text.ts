import type { Locale } from "./locale";

export type LanguageMenuText = {
  menuLabel: string;
  listLabel: string;
  saveFailure: string;
  names: Record<Locale, string>;
};

export const japaneseLanguageMenuText = {
  menuLabel: "言語を選ぶ（現在：{language}）",
  listLabel: "表示言語",
  saveFailure: "言語を保存できませんでした。次回は選び直してください。",
  names: { ja: "日本語", en: "English" },
} satisfies LanguageMenuText;

export const englishLanguageMenuText = {
  menuLabel: "Choose language (current: {language})",
  listLabel: "Display language",
  saveFailure: "Your language preference wasn't saved. Please choose it again next time.",
  // Autonyms: 日本語 is an intentional Japanese exception in the English menu.
  names: { ja: "日本語", en: "English" },
} satisfies LanguageMenuText;
