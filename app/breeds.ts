import { breedDefinitions, type Breed } from "./breed-definitions";
import { japaneseBreedText } from "./breeds-ja";

export type { Breed } from "./breed-definitions";

export const ranking = {
  title: "2026年版 人気飼育犬種・猫種・小動物ランキング",
  publisher: "アイペット損害保険（現・第一アイペット）",
  url: "https://www.ipet-ins.com/info/40566/",
  published: "2026年1月20日",
  period: "2025年1月1日〜12月31日",
};

// Display ranks exclude mixed-breed cats and run from 1 to 12.
// These correspond to ranks 2–13 in the original survey, in the same order.
export const breeds: Breed[] = breedDefinitions.map((definition) => ({
  ...definition,
  ...japaneseBreedText[definition.id],
}));
