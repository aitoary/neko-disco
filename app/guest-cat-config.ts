import type { Locale } from "./locale";

export type GuestCatState =
  | "hidden"
  | "running"
  | "stopped"
  | "dialog"
  | "closing"
  | "waitingToExit"
  | "exiting";
export type GuestCatEvent =
  | { type: "appear"; motionEnabled: boolean }
  | { type: "tap" }
  | { type: "finish" }
  | { type: "dismiss" }
  | { type: "dialogClosed" }
  | { type: "exit" };

export const guestCatConfig = {
  runImage: "/images/guest-cat/egyptian-mau-run.png",
  lookbackImage: "/images/guest-cat/egyptian-mau-lookback.png",
  crossingDurationMs: 4800,
  exitDelayMs: 1000,
  size: "clamp(76px, 15vw, 170px)",
  bottom: "10%",
  source: "https://cfa.org/breed/egyptian-mau/",
} as const;

export function guestCatReducer(state: GuestCatState, event: GuestCatEvent): GuestCatState {
  switch (event.type) {
    case "appear":
      return state === "hidden" ? (event.motionEnabled ? "running" : "stopped") : state;
    case "tap":
      return state === "running" ? "stopped" : state === "stopped" ? "dialog" : state;
    case "finish":
      return state === "running" || state === "exiting" ? "hidden" : state;
    case "dismiss":
      return state === "dialog" ? "closing" : state;
    case "dialogClosed":
      return state === "closing" ? "waitingToExit" : state;
    case "exit":
      return state === "waitingToExit" ? "exiting" : state;
  }
}

export const guestCatText = {
  ja: {
    name: "エジプシャンマウ",
    stop: "横切るエジプシャンマウを止める",
    open: "エジプシャンマウの説明を開く",
    intro:
      "エジプシャンマウは、自然なスポット模様が特徴の短毛種。しなやかな体と高い運動能力を持ち、活発に遊ぶことが大好きな猫です。",
    detail:
      "グリーンの瞳も印象的で、家族には愛情深い一方、知らない人には少し慎重な一面もあります。",
    source: "出典：CFA（The Cat Fanciers’ Association）",
    close: "説明を閉じる",
    confirm: "またね、にゃ！",
  },
  en: {
    name: "Egyptian Mau",
    stop: "Stop the Egyptian Mau crossing the floor",
    open: "Read about the Egyptian Mau",
    intro:
      "The Egyptian Mau is a shorthaired breed with a naturally spotted coat. With a graceful body and remarkable athletic ability, this active cat loves to play.",
    detail:
      "Their striking green eyes are another distinctive feature. Affectionate with family, they can be a little cautious around people they don't know.",
    source: "Source: CFA (The Cat Fanciers’ Association)",
    close: "Close details",
    confirm: "See you, meow!",
  },
} satisfies Record<Locale, Record<string, string>>;
