import type { SoundState } from "./disco-audio";

// Named placeholders supply catalog text and ranks when the UI is connected later.
export type InteractionText = {
  sound: {
    buttons: Record<SoundState, string>;
    actions: Record<SoundState, string>;
    trackTitle: string;
    errorTitle: string;
    loadingStatus: string;
    errorStatus: string;
  };
  motion: {
    pause: string;
    resume: string;
  };
  navigation: {
    skipFloor: string;
    backToTop: string;
    backToFloor: string;
  };
  discovery: {
    floorHint: string;
    countLabel: string;
    progressLabel: string;
    unseenButton: string;
    allFoundButton: string;
    breedLabel: string;
    foundBreedLabel: string;
    factLabel: string;
    factHint: string;
    breedHint: string;
    cardLabel: string;
  };
  quiz: {
    eyebrow: string;
    correct: string;
    incorrect: string;
    reviewBreed: string;
    next: string;
    results: string;
    prompt: string;
    resultEyebrow: string;
    perfectResult: string;
    otherResult: string;
    resultMessage: [string, string];
    retry: string;
  };
  detail: {
    close: string;
    confirm: string;
  };
};
