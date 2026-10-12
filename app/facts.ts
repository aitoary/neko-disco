import { factDefinitions, type Fact } from "./fact-definitions";
import { japaneseFactText } from "./facts-ja";

export type { Fact } from "./fact-definitions";

export const facts: Fact[] = factDefinitions.map((definition) => ({
  ...definition,
  ...japaneseFactText[definition.id],
}));
