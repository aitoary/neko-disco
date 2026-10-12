import type { PeriodId, PeriodText, QuizId, QuizText } from "./activity-definitions";

export const japanesePeriodText = {
  morning: {
    label: "あさ",
    headline: "朝いちばんの、わくわく。",
    text: "空が明るくなるころ、猫のハンター気分もスイッチオン。起きたら少しだけ、おもちゃで遊ぼう。",
    mood: "PLAY TIME",
  },
  day: {
    label: "ひる",
    headline: "おひるねも、全力です。",
    text: "静かな場所で、のびのびお昼寝。次の冒険に備えて、しっかりエネルギーをためる時間。",
    mood: "NAP TIME",
  },
  evening: {
    label: "ゆうがた",
    headline: "そろそろ、ねこの時間。",
    text: "夕暮れは、猫が活発になりやすい時間帯。追いかけて、飛びついて。遊びのリズムに付き合ってみよう。",
    mood: "GOLDEN HOUR",
  },
  night: {
    label: "よる",
    headline: "夜ふかしも、マイペース。",
    text: "夜に活動する子も、ぐっすり眠る子も。人との暮らしや年齢に合わせて、生活のリズムは変わります。",
    mood: "MY OWN PACE",
  },
} satisfies Record<PeriodId, PeriodText>;

export const japaneseQuizText = {
  "ragdoll-eyes": {
    q: "青い目が特徴の、ふわふわな猫は？",
    choices: ["アメリカンショートヘア", "ラグドール", "ロシアンブルー"],
    explain:
      "ラグドールは青い目とセミロングの毛、大きな体が特徴。名前には「ぬいぐるみ」という意味があります。",
  },
  "minuet-roots": {
    q: "ミヌエットのルーツとなった組み合わせは？",
    choices: ["ペルシャ系 × マンチカン", "ベンガル × ロシアンブルー", "メインクーン × ラグドール"],
    explain:
      "ミヌエットは、ペルシャ系の猫とマンチカンをもとに生まれた猫種。丸い顔と大きな目もチャームポイント。",
  },
  "bengal-rosettes": {
    q: "ベンガルの「ロゼット」って、どんな模様？",
    choices: ["まっすぐなしま模様", "全身まっしろ", "輪のような斑点模様"],
    explain:
      "ロゼットは、ヒョウを思わせる輪のような斑点模様。ベンガルにはマーブル模様の子もいます。",
  },
} satisfies Record<QuizId, QuizText>;
