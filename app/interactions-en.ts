import type { InteractionText } from "./interaction-text";

export const englishInteractionText = {
  sound: {
    buttons: {
      off: "SOUND OFF",
      loading: "LOADING…",
      playing: "SOUND ON",
      error: "SOUND RETRY",
    },
    actions: {
      off: "Play STAR POP EXPRESS",
      loading: "Cancel music loading",
      playing: "Turn music off",
      error: "Retry music",
    },
    trackTitle: "STAR POP EXPRESS · Intro + loop",
    errorTitle: "Couldn't load the music. Click again to try.",
    loadingStatus: "Loading music.",
    errorStatus: "Couldn't load the music. Use the SOUND button to try again.",
  },
  motion: {
    pause: "Pause animations",
    resume: "Play animations",
  },
  navigation: {
    skipFloor: "Skip to the dance floor",
    backToTop: "Back to top",
    backToFloor: "BACK TO THE FLOOR",
  },
  discovery: {
    floorHint: "Tap a cat or a prop.",
    countLabel: "breeds",
    progressLabel: "Breeds met",
    unseenButton: "Meet a cat you haven't met",
    allFoundButton: "You've met all 12 breeds!",
    breedLabel: "Meet {name}",
    foundBreedLabel: "Meet {name} (already met)",
    factLabel: "{label}: learn about cat life",
    factHint: "Learn about cat life",
    breedHint: "Breed rank {rank} · Tap to meet",
    cardLabel: "Open {name}'s profile · Breed rank {rank}",
  },
  quiz: {
    eyebrow: "CAT QUIZ",
    correct: "Purrfect! You nailed it.",
    incorrect: "Not quite! One more cat secret discovered.",
    reviewBreed: "View this cat's profile",
    next: "Next question",
    results: "See results",
    prompt: "Pick the answer that feels right.",
    resultEyebrow: "YOU ARE A NEKO LOVER!",
    perfectResult: "You're a true cat expert.",
    otherResult: "A little closer to cats.",
    resultMessage: ["Right or wrong,", "every answer brings you closer to cats."],
    retry: "Play again",
  },
  detail: {
    close: "Close details",
    confirm: "Got it, meow!",
  },
} satisfies InteractionText;
