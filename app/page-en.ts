import type { PageText } from "./page-text";

export const englishPageText = {
  header: {
    homeLabel: "NEKO DISCO home",
    tagline: "The after-dark cat lab",
    menuLabel: "Main menu",
    floorLink: "Play on the floor",
    residentsLink: "Meet 12 breeds",
    quizLink: "Cat quiz",
  },
  hero: {
    openingBubble: "Meow, we're open.",
    danceBubble: "Care for a dance?",
    heading: ["Dance. Nap.", "Get to know a cat."],
    intro: ["A secret after-dark hideout for cats.", "Tap a cat that catches your eye."],
    floorButton: "Head to the dance floor",
  },
  floor: {
    sceneAlt:
      "A disco with a glittering mirror ball at its center. Twelve cat breeds gather in a room with a cat tower, cardboard boxes, and scratching posts.",
    stickerNote: "At your own pace.",
    caption: "Dance. Doze. It's a cat's call.",
  },
  marquee: "Cats just make life better.",
  residents: {
    heading: ["All different.", "All cats."],
    intro: [
      "Twelve breeds from a popularity ranking.",
      "Ears, coats, characters: meet each one's charm.",
    ],
    tapHint: "Tap a cat you're curious about",
    individualNote:
      "Coat colors, patterns, builds, and personalities vary from cat to cat. Each illustration shows one example of the breed.",
  },
  ranking: {
    heading: "Meet 12 breeds in popularity order.",
    scope: "Ranks 1–12 exclude the survey's mixed-cat category.",
    sourceLabel: "Source:",
    publisher: "ipet Insurance Co., Ltd. (now Daiichi ipet Insurance Co., Ltd.)",
    title: "2026 Rankings of Popular Dog Breeds, Cat Breeds and Small Animals",
    published: "January 20, 2026",
    period: "January 1–December 31, 2025",
    citation: '{publisher} — "{title}"',
    publishedNote: "(Published {published})",
    population:
      "Sample: cats that enrolled in the company's insurance and whose contracts began during {period}. This is not a ranking of all pet cats in Japan.",
  },
  daily: {
    heading: ["Less clock.", "More cat."],
    intro: [
      "A cat's day has its own rhythm:",
      "a little play, a little nap.",
      "Move the time slider and take a peek.",
    ],
    note: "Just one example: every cat has their own rhythm.",
    sliderLabel: "A cat's day: morning, daytime, evening, night",
  },
  quiz: {
    heading: ["How well", "do you know cats?"],
    intro: ["Revisit the cats you met on the floor", "with three little questions."],
  },
  closing: {
    heading: ["At your own pace.", "Come play again."],
    button: "One more dance",
  },
  footer: {
    tagline: "Dance or rest: it's the cat's choice.",
    safetyNote: "This disco is make-believe. Real cats need a quiet place and fresh water.",
    sourceSummary: "Ranking, breed, and cat-life references",
    sourceIntro:
      "We use the 2026 ranking from {publisher}. Breed profiles draw on its breed-care guides and CFA materials. Cat-life facts draw on Cats Protection's public guidance. Each breed profile also links to its source.",
    rankingLink: "2026 Popular Cat Breed Rankings",
    breedLink: "Daiichi ipet — Cat breed-care guides",
    cfaLink: "CFA — Breed guides",
    sourceTopics: [
      "Night-time activity",
      "Body language",
      "Cats and play",
      "Hiding",
      "Cats and sleep",
      "Food and water",
      "Scratching",
      "Whiskers",
    ],
    fallbackTopic: "Cat behavior",
  },
  detail: {
    breedRankLabel: "Breed rank",
    mixedExcluded: "Survey's mixed-cat category excluded",
    rankUnit: "Rank",
    appearance: "Appearance",
    personality: "Personality tendencies",
    individualNote:
      "Looks and personalities vary from cat to cat. The illustration is one example.",
    breedSource: "Breed reference: {sourceName}",
    factSource: "Source: Cats Protection",
  },
} satisfies PageText;
