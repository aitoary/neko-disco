import { notFound } from "next/navigation";
import DiscoPage from "../disco-page";
import { getDiscoPageData } from "../disco-page-data";
import { isLocale } from "../locale-navigation";
import { createLocaleMetadata } from "../locale-metadata";
import { japaneseLanguageMenuText, englishLanguageMenuText } from "../language-menu-text";

type LocalePageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return createLocaleMetadata(locale);
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <DiscoPage
      key={locale}
      {...getDiscoPageData(locale)}
      locale={locale}
      languageMenuText={locale === "ja" ? japaneseLanguageMenuText : englishLanguageMenuText}
    />
  );
}
