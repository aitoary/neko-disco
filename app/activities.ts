import { periodDefinitions, quizDefinitions, type Period, type Quiz } from "./activity-definitions";
import { japanesePeriodText, japaneseQuizText } from "./activities-ja";

export const periods: Period[] = periodDefinitions.map(({ id, ...definition }) => ({
  ...definition,
  ...japanesePeriodText[id],
}));

export const quizzes: Quiz[] = quizDefinitions.map(({ id, ...definition }) => ({
  ...definition,
  ...japaneseQuizText[id],
}));
