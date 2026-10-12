type TwoLines = [string, string];

// Copy only: line boundaries preserve the existing Japanese layout for later UI connection.
export type PageText = {
  header: {
    homeLabel: string;
    tagline: string;
    menuLabel: string;
    floorLink: string;
    residentsLink: string;
    quizLink: string;
  };
  hero: {
    openingBubble: string;
    danceBubble: string;
    heading: TwoLines;
    intro: TwoLines;
    floorButton: string;
  };
  floor: {
    sceneAlt: string;
    stickerNote: string;
    caption: string;
  };
  marquee: string;
  residents: {
    heading: TwoLines;
    intro: TwoLines;
    tapHint: string;
    individualNote: string;
  };
  ranking: {
    heading: string;
    scope: string;
    sourceLabel: string;
    publisher: string;
    title: string;
    published: string;
    period: string;
    citation: string;
    publishedNote: string;
    population: string;
  };
  daily: {
    heading: TwoLines;
    intro: [string, string, string];
    note: string;
    sliderLabel: string;
  };
  quiz: {
    heading: TwoLines;
    intro: TwoLines;
  };
  closing: {
    heading: TwoLines;
    button: string;
  };
  footer: {
    tagline: string;
    safetyNote: string;
    sourceSummary: string;
    sourceIntro: string;
    rankingLink: string;
    breedLink: string;
    cfaLink: string;
    sourceTopics: [string, string, string, string, string, string, string, string];
    fallbackTopic: string;
  };
  detail: {
    breedRankLabel: string;
    mixedExcluded: string;
    rankUnit: string;
    appearance: string;
    personality: string;
    individualNote: string;
    breedSource: string;
    factSource: string;
  };
};
