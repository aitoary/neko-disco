import type { Locale } from "./locale";

export type GuestCatState = "hidden" | "running" | "stopped" | "dialog";
export type GuestCatEvent =
  | { type: "appear"; motionEnabled: boolean }
  | { type: "tap" }
  | { type: "finish" }
  | { type: "dismiss" };

export const guestCatConfig = {
  runImage: "/images/guest-cat/egyptian-mau-run.png",
  lookbackImage: "/images/guest-cat/egyptian-mau-lookback.png",
  appearDelayMs: 2500,
  crossingDurationMs: 4800,
  size: "clamp(76px, 15vw, 170px)",
  bottom: "10%",
} as const;

export function guestCatReducer(state: GuestCatState, event: GuestCatEvent): GuestCatState {
  switch (event.type) {
    case "appear":
      return state === "hidden" ? (event.motionEnabled ? "running" : "stopped") : state;
    case "tap":
      return state === "running" ? "stopped" : state === "stopped" ? "dialog" : state;
    case "finish":
      return state === "running" ? "hidden" : state;
    case "dismiss":
      return state === "dialog" ? "hidden" : state;
  }
}

export const guestCatText = {
  ja: {
    name: "エジプシャンマウ",
    stop: "横切るエジプシャンマウを止める",
    open: "エジプシャンマウの説明を開く",
    badge: "フロアのお客さま",
    intro: "フロアを横切る、斑点模様のお客さま。呼び止めると、こちらを振り返ってくれました。",
    detail:
      "今夜はひと休みしに来たみたい。12匹のランキングや発見数には含まれない、フロアのゲストです。",
    close: "説明を閉じる",
    confirm: "またね、にゃ！",
  },
  en: {
    name: "Egyptian Mau",
    stop: "Stop the Egyptian Mau crossing the floor",
    open: "Meet the Egyptian Mau",
    badge: "A guest on the floor",
    intro:
      "A spotted guest dashes across the floor. Call them over, and they'll stop for a look back.",
    detail:
      "Just dropping in for a breather tonight. This guest isn't part of the 12-breed ranking or your discovery count.",
    close: "Close details",
    confirm: "See you, meow!",
  },
} satisfies Record<Locale, Record<string, string>>;
