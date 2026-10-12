export type Period = {
  time: string;
  label: string;
  headline: string;
  text: string;
  breed: number;
  mood: string;
};

export type PeriodText = Pick<Period, "label" | "headline" | "text" | "mood">;
type PeriodDefinition = Omit<Period, keyof PeriodText> & { id: string };

export type Quiz = {
  q: string;
  choices: [string, string, string];
  answer: 0 | 1 | 2;
  explain: string;
  breed: number;
};

export type QuizText = Pick<Quiz, "q" | "choices" | "explain">;
type QuizDefinition = Omit<Quiz, keyof QuizText> & { id: string };

// IDs join localized text only; the existing UI still uses the original array order.
export const periodDefinitions = [
  {
    id: "morning",
    time: "06:00",
    breed: 1,
  },
  {
    id: "day",
    time: "12:00",
    breed: 8,
  },
  {
    id: "evening",
    time: "18:00",
    breed: 11,
  },
  {
    id: "night",
    time: "00:00",
    breed: 6,
  },
] as const satisfies readonly PeriodDefinition[];

export const quizDefinitions = [
  {
    id: "ragdoll-eyes",
    answer: 1,
    breed: 2,
  },
  {
    id: "minuet-roots",
    answer: 0,
    breed: 3,
  },
  {
    id: "bengal-rosettes",
    answer: 2,
    breed: 11,
  },
] as const satisfies readonly QuizDefinition[];

export type PeriodId = (typeof periodDefinitions)[number]["id"];
export type QuizId = (typeof quizDefinitions)[number]["id"];
