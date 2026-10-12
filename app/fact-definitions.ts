export type Fact = {
  id: string;
  label: string;
  tag: string;
  title: string;
  body: string;
  tip: string;
  sprite: number;
  color: string;
  source: string;
  sound: string;
};

export type FactText = Pick<Fact, "label" | "tag" | "title" | "body" | "tip" | "sound">;

type FactDefinition = Omit<Fact, keyof FactText>;

// Keep the original catalog order, including the footer source-link order.
export const factDefinitions = [
  {
    id: "night",
    sprite: 1,
    color: "pink",
    source: "https://www.cats.org.uk/help-and-advice/home-and-environment/cats-at-night",
  },
  {
    id: "ears",
    sprite: 0,
    color: "lime",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cat-body-language",
  },
  {
    id: "hunt",
    sprite: 1,
    color: "cyan",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-play",
  },
  {
    id: "box",
    sprite: 2,
    color: "peach",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-hiding",
  },
  {
    id: "sleep",
    sprite: 3,
    color: "lavender",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-sleep",
  },
  {
    id: "water",
    sprite: 4,
    color: "cyan",
    source: "https://www.cats.org.uk/help-and-advice/diet/feeding",
  },
  {
    id: "scratch",
    sprite: 5,
    color: "lime",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/scratching",
  },
  {
    id: "whisker",
    sprite: 4,
    color: "pink",
    source: "https://www.cats.org.uk/cats-blog/why-do-cats-have-whiskers",
  },
  {
    id: "tail",
    sprite: 1,
    color: "peach",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cat-body-language",
  },
  {
    id: "height",
    sprite: 2,
    color: "lavender",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-sleep",
  },
  {
    id: "toy",
    sprite: 0,
    color: "pink",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-play",
  },
  {
    id: "hide",
    sprite: 3,
    color: "lime",
    source: "https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-hiding",
  },
] as const satisfies readonly FactDefinition[];

export type FactId = (typeof factDefinitions)[number]["id"];
