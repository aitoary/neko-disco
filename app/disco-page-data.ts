import type { ComponentProps } from "react";
import type DiscoPage from "./disco-page";
import type { Locale } from "./locale";
import { breeds, ranking } from "./breeds";
import { facts } from "./facts";
import { periods, quizzes } from "./activities";
import { breedDefinitions } from "./breed-definitions";
import { factDefinitions } from "./fact-definitions";
import { periodDefinitions, quizDefinitions } from "./activity-definitions";
import { englishBreedText } from "./breeds-en";
import { englishFactText } from "./facts-en";
import { englishPeriodText, englishQuizText } from "./activities-en";
import { japanesePageText } from "./page-ja";
import { englishPageText } from "./page-en";
import { japaneseInteractionText } from "./interactions-ja";
import { englishInteractionText } from "./interactions-en";

// Called by the server entry; only the selected language is passed to the client view.
export function getDiscoPageData(
  locale: Locale,
): Omit<ComponentProps<typeof DiscoPage>, "locale" | "languageMenuText"> {
  switch (locale) {
    case "ja":
      return {
        breeds,
        facts,
        periods,
        quizzes,
        pageText: japanesePageText,
        interactionText: japaneseInteractionText,
        rankingUrl: ranking.url,
      };
    case "en":
      return {
        breeds: breedDefinitions.map((definition) => ({
          ...definition,
          ...englishBreedText[definition.id],
        })),
        facts: factDefinitions.map((definition) => ({
          ...definition,
          ...englishFactText[definition.id],
        })),
        periods: periodDefinitions.map(({ id, ...definition }) => ({
          ...definition,
          ...englishPeriodText[id],
        })),
        quizzes: quizDefinitions.map(({ id, ...definition }) => ({
          ...definition,
          ...englishQuizText[id],
        })),
        pageText: englishPageText,
        interactionText: englishInteractionText,
        rankingUrl: ranking.url,
      };
    default:
      throw new RangeError("Unsupported locale");
  }
}
