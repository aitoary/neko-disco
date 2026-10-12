import type { BreedId, BreedText } from "./breed-definitions";

// Text only; shared images, ranks, and source URLs remain in breed-definitions.
export const englishBreedText = {
  "scottish-fold": {
    name: "Scottish Fold",
    catchphrase: "Sound good?",
    intro: "A round-faced DJ with a gentle groove.",
    trait: "Round face, folded ears",
    appearance:
      "Round faces, round eyes, and small ears that fold forward are familiar features. Some cats have straight ears, and coats come in different lengths and colors.",
    personality:
      "Scottish Folds tend to be calm and enjoy being near their people. Their curious side may show up as a quiet interest in whatever the family is doing.",
    detail:
      "The breed traces its roots to a cat found in Scotland. The name's 'fold' refers to the shape of the ears.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  munchkin: {
    name: "Munchkin",
    catchphrase: "Playtime? Playtime!",
    intro: "Little steps. Big curiosity.",
    trait: "Short legs, curious nature",
    appearance:
      "Known for short legs and a low silhouette, Munchkins can also have longer legs. Both short and long coats come in a wide range of colors.",
    personality:
      "Munchkins tend to be friendly and playful. Something interesting nearby can be all it takes to send them off exploring.",
    detail:
      "Short legs can still move surprisingly fast. Choose play that suits your cat's body and gives that curiosity room to roam.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  ragdoll: {
    name: "Ragdoll",
    catchphrase: "Cheers, human!",
    intro: "Blue eyes. Big fluff.",
    trait: "Blue eyes, large build",
    appearance:
      "Ragdolls have large bodies, soft semi-long coats, and clear blue eyes. Their coat patterns include color on the face, ears, and tail.",
    personality:
      "Ragdolls tend to be calm and affectionate, and often enjoy relaxed time with their people. Being picked up? Let your cat decide.",
    detail:
      "The name refers to a soft rag doll. These cats grow slowly and can take several years to reach full maturity.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  minuet: {
    name: "Minuet",
    catchphrase: "Just popping by to say hi.",
    intro: "Round, fluffy, full of charm.",
    trait: "Round eyes, fluffy coat",
    appearance:
      "A round head, big eyes, and small ears give Minuets their distinctive look. Coats can be short or long, and legs can be short or long too.",
    personality:
      "Minuets tend to mix a calm nature with a playful streak. Many enjoy human company and take a lively interest in new things.",
    detail:
      "The breed was developed from Persian-related cats and Munchkins. It was previously known as the Napoleon.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  "american-shorthair": {
    name: "American Shorthair",
    catchphrase: "This track's up next.",
    intro: "Sporting stripes. Ready to play.",
    trait: "Short coat, sturdy build",
    appearance:
      "American Shorthairs have sturdy, muscular bodies and short coats. Black swirls on silver are a familiar look, but many other coat colors exist.",
    personality:
      "They tend to be gentle with family while also enjoying time on their own. Chasing a toy is often a favorite way to play.",
    detail:
      "Their ancestors traveled by ship to North America and worked as mouse catchers. This breed has a long history of capable hunters.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  siberian: {
    name: "Siberian",
    catchphrase: "Still got a few moves!",
    intro: "All that fluff. All that strength.",
    trait: "Thick coat, powerful build",
    appearance:
      "With roots in Russia, Siberians have sturdy, rounded bodies wrapped in thick fur. Their coats grow especially full in winter.",
    personality:
      "Siberians tend to be calm and patient, with an athletic side too. Beneath that fluffy look is a cat capable of powerful movement.",
    detail:
      "They mature slowly. Coat length and thickness change with the seasons, reflecting the breed's adaptation to life in a cold climate.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  "british-shorthair": {
    name: "British Shorthair",
    catchphrase: "Time for a little break.",
    intro: "Round cheeks. A rhythm of their own.",
    trait: "Round cheeks, dense short coat",
    appearance:
      "Round faces, full cheeks, and dense short coats sit on a sturdy frame. The gray coat known as 'blue' is especially familiar.",
    personality:
      "Friendly with their people, some prefer sitting nearby to being picked up. They can be close companions while keeping a little personal space.",
    detail:
      "That composed look can hide a fondness for play. Their ancestors caught mice, and a hunter's playful streak remains.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  "norwegian-forest": {
    name: "Norwegian Forest Cat",
    catchphrase: "Nice view from here.",
    intro: "From northern forests to tonight's floor.",
    trait: "Triangular face, bushy tail",
    appearance:
      "A triangular face, straight nose profile, and long bushy tail are distinctive features. A full coat protects the large body against the cold.",
    personality:
      "These cats tend to be friendly and enjoy company, both human and animal. Many are active and like spending time in high places.",
    detail:
      "The name says it: a forest cat from Norway. This sturdy breed developed in the harsh natural conditions of northern Europe.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  ragamuffin: {
    name: "Ragamuffin",
    catchphrase: "Saved you a spot.",
    intro: "Together time is the best time.",
    trait: "Full coat, big eyes",
    appearance:
      "A large, solid body wears a soft, full coat. Big expressive eyes and a rounded muzzle add to the look, with many coat colors and patterns to be found.",
    personality:
      "Ragamuffins tend to be easygoing and friendly, often enjoying a rest beside their family. Many appreciate both playtime and quiet company.",
    detail:
      "The breed shares a history with the Ragdoll, but has its own range of eye and coat colors.",
    sourceName: "CFA (cat registry)",
  },
  "maine-coon": {
    name: "Maine Coon",
    catchphrase: "Biiig stretch.",
    intro: "Big cat. Gentle company.",
    trait: "Large ears, square muzzle",
    appearance:
      "Maine Coons have long, strong bodies, large tufted ears, and square muzzles. Full, long coats and long bushy tails complete the look.",
    personality:
      "Often called 'gentle giants,' Maine Coons tend to be sociable and calm. Many enjoy interacting with family and playing with toys.",
    detail:
      "This large breed has roots in the northeastern United States. Despite their imposing size, some chat in little birdlike chirps.",
    sourceName: "CFA (cat registry)",
  },
  "russian-blue": {
    name: "Russian Blue",
    catchphrase: "Quietly feeling the groove.",
    intro: "Silver shimmer. Green eyes.",
    trait: "Short blue coat, green eyes",
    appearance:
      "Short blue fur has a silvery sheen, set off by vivid green eyes. A wedge-shaped face and long legs complement a lean body.",
    personality:
      "Russian Blues tend to be quiet and affectionate with people they know well. Let each cat set the pace as you get to know one another.",
    detail:
      "Their mouths can look as though they are smiling. Silvery hair tips catch the light and give the coat its distinctive shine.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
  bengal: {
    name: "Bengal",
    catchphrase: "That ball? Mine.",
    intro: "A little adventurer in leopard spots.",
    trait: "Leopard-like pattern, agile build",
    appearance:
      "Leopard-like spots cover a muscular, supple body. Bengals can also have marbled patterns, and their coats come in different colors.",
    personality:
      "Bengals tend to be curious and keen on plenty of play. Many are affectionate with their people and enjoy being active together.",
    detail:
      "Ring-like markings within the spotted pattern are called rosettes. This breed combines a wild-looking coat with a playful side.",
    sourceName: "Daiichi ipet Insurance Co., Ltd.",
  },
} satisfies Record<BreedId, BreedText>;
