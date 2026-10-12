export type Breed = {
  id: string;
  name: string;
  english: string;
  rank: number;
  image: string;
  color: "pink" | "lime" | "cyan" | "lavender" | "peach" | "yellow";
  catchphrase: string;
  intro: string;
  appearance: string;
  personality: string;
  detail: string;
  trait: string;
  source: string;
  sourceName: string;
  scene: { x: number; y: number; size: number };
};

export type BreedText = Pick<
  Breed,
  | "name"
  | "catchphrase"
  | "intro"
  | "trait"
  | "appearance"
  | "personality"
  | "detail"
  | "sourceName"
>;

type BreedDefinition = Omit<Breed, keyof BreedText>;

// Keep the original catalog order: scene, time, and quiz references use its indexes.
export const breedDefinitions = [
  {
    id: "scottish-fold",
    english: "SCOTTISH FOLD",
    rank: 1,
    image: "/images/breeds/scottish-fold.webp",
    color: "pink",
    source: "https://www.ipet-ins.com/cat-insurance/breed/38658/",
    scene: {
      x: 49,
      y: 36,
      size: 18,
    },
  },
  {
    id: "munchkin",
    english: "MUNCHKIN",
    rank: 2,
    image: "/images/breeds/munchkin.webp",
    color: "lime",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17908/",
    scene: {
      x: 34,
      y: 60,
      size: 18,
    },
  },
  {
    id: "ragdoll",
    english: "RAGDOLL",
    rank: 3,
    image: "/images/breeds/ragdoll.webp",
    color: "cyan",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17911/",
    scene: {
      x: 80,
      y: 44,
      size: 16,
    },
  },
  {
    id: "minuet",
    english: "MINUET",
    rank: 4,
    image: "/images/breeds/minuet.webp",
    color: "lavender",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17921/",
    scene: {
      x: 18,
      y: 59,
      size: 17,
    },
  },
  {
    id: "american-shorthair",
    english: "AMERICAN SHORTHAIR",
    rank: 5,
    image: "/images/breeds/american-shorthair.webp",
    color: "peach",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17916/",
    scene: {
      x: 47,
      y: 63,
      size: 18,
    },
  },
  {
    id: "siberian",
    english: "SIBERIAN",
    rank: 6,
    image: "/images/breeds/siberian.webp",
    color: "yellow",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17924/",
    scene: {
      x: 63,
      y: 55,
      size: 17,
    },
  },
  {
    id: "british-shorthair",
    english: "BRITISH SHORTHAIR",
    rank: 7,
    image: "/images/breeds/british-shorthair.webp",
    color: "cyan",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17914/",
    scene: {
      x: 73,
      y: 70,
      size: 18,
    },
  },
  {
    id: "norwegian-forest",
    english: "NORWEGIAN FOREST CAT",
    rank: 8,
    image: "/images/breeds/norwegian-forest.webp",
    color: "lime",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17912/",
    scene: {
      x: 20,
      y: 24,
      size: 16,
    },
  },
  {
    id: "ragamuffin",
    english: "RAGAMUFFIN",
    rank: 9,
    image: "/images/breeds/ragamuffin.webp",
    color: "pink",
    source: "https://cfa.org/breed/ragamuffin/",
    scene: {
      x: 87,
      y: 82,
      size: 22,
    },
  },
  {
    id: "maine-coon",
    english: "MAINE COON",
    rank: 10,
    image: "/images/breeds/maine-coon.webp",
    color: "peach",
    source: "https://cfa.org/breed/maine-coon-cat/",
    scene: {
      x: 32,
      y: 82,
      size: 22,
    },
  },
  {
    id: "russian-blue",
    english: "RUSSIAN BLUE",
    rank: 11,
    image: "/images/breeds/russian-blue.webp",
    color: "lavender",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17913/",
    scene: {
      x: 58,
      y: 81,
      size: 19,
    },
  },
  {
    id: "bengal",
    english: "BENGAL",
    rank: 12,
    image: "/images/breeds/bengal.webp",
    color: "yellow",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17917/",
    scene: {
      x: 11,
      y: 81,
      size: 20,
    },
  },
] as const satisfies readonly BreedDefinition[];

export type BreedId = (typeof breedDefinitions)[number]["id"];
