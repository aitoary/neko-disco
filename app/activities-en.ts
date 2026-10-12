import type { PeriodId, PeriodText, QuizId, QuizText } from "./activity-definitions";

// Text only; times, breed references, and answer positions stay in activity-definitions.
export const englishPeriodText = {
  morning: {
    label: "Morning",
    headline: "Rise, shine, pounce.",
    text: "As daylight arrives, a cat's hunting instincts can kick in. Once you're up, try a little playtime with a toy.",
    mood: "PLAY TIME",
  },
  day: {
    label: "Daytime",
    headline: "Serious about snoozing.",
    text: "Stretch out for a nap in a quiet spot. Time to recharge for the next adventure.",
    mood: "NAP TIME",
  },
  evening: {
    label: "Evening",
    headline: "Here comes the golden hour.",
    text: "Cats tend to perk up around dusk. Chase, pounce, repeat: join in at your cat's pace.",
    mood: "GOLDEN HOUR",
  },
  night: {
    label: "Night",
    headline: "Night shift? Their call.",
    text: "Some cats are busy at night; others are sound asleep. Daily rhythms vary with age and life alongside humans.",
    mood: "MY OWN PACE",
  },
} satisfies Record<PeriodId, PeriodText>;

export const englishQuizText = {
  "ragdoll-eyes": {
    q: "Which fluffy breed is known for blue eyes?",
    choices: ["American Shorthair", "Ragdoll", "Russian Blue"],
    explain:
      "Ragdolls have blue eyes, semi-long coats, and large bodies. Their name refers to a soft rag doll.",
  },
  "minuet-roots": {
    q: "Which pairing is behind the Minuet?",
    choices: ["Persian-related cats × Munchkin", "Bengal × Russian Blue", "Maine Coon × Ragdoll"],
    explain:
      "Minuets were developed from Persian-related cats and Munchkins. A round face and big eyes are part of their charm.",
  },
  "bengal-rosettes": {
    q: "What do a Bengal's rosettes look like?",
    choices: ["Straight stripes", "Solid white", "Ring-like spots"],
    explain:
      "Rosettes are ring-like spots reminiscent of a leopard's markings. Some Bengals have marbled coats instead.",
  },
} satisfies Record<QuizId, QuizText>;
