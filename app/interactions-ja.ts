import type { InteractionText } from "./interaction-text";

export const japaneseInteractionText = {
  sound: {
    buttons: {
      off: "SOUND OFF",
      loading: "LOADING…",
      playing: "SOUND ON",
      error: "SOUND RETRY",
    },
    actions: {
      off: "STAR POP EXPRESSを再生する",
      loading: "音楽の読み込みを中止",
      playing: "音楽をオフにする",
      error: "音楽を再試行する",
    },
    trackTitle: "STAR POP EXPRESS · イントロ＋ループ",
    errorTitle: "音楽を読み込めませんでした。もう一度クリックしてお試しください。",
    loadingStatus: "音楽を読み込んでいます",
    errorStatus: "音楽を読み込めませんでした。SOUNDボタンで再試行できます。",
  },
  motion: {
    pause: "アニメーションを止める",
    resume: "アニメーションを再生する",
  },
  navigation: {
    skipFloor: "ダンスフロアへスキップ",
    backToTop: "ページ上部へ戻る",
    backToFloor: "BACK TO THE FLOOR",
  },
  discovery: {
    floorHint: "猫もグッズも、タップしてみて",
    countLabel: "猫種",
    progressLabel: "出会った猫種",
    unseenButton: "まだ会っていない猫に会う",
    allFoundButton: "12猫種、みんなに会えた！",
    breedLabel: "{name}を知る",
    foundBreedLabel: "{name}を知る（発見済み）",
    factLabel: "{label}：猫の生態を知る",
    factHint: "猫の生態を知る",
    breedHint: "猫種別{rank}位 · タップで会いにいく",
    cardLabel: "猫種別{rank}位 {name}の紹介を開く",
  },
  quiz: {
    eyebrow: "CAT QUIZ",
    correct: "大正解、にゃんとすばらしい！",
    incorrect: "おしい！ ねこのひみつをひとつ発見。",
    reviewBreed: "この猫の紹介を見る",
    next: "次のクイズへ",
    results: "結果を見る",
    prompt: "ぴんときた答えを選んでね。",
    resultEyebrow: "YOU ARE A NEKO LOVER!",
    perfectResult: "立派な、ねこ博士。",
    otherResult: "ねこと、もっと仲よくなれたね。",
    resultMessage: ["正解しても、まちがえても。", "知るほど、ねこが好きになる。"],
    retry: "もう一度あそぶ",
  },
  detail: {
    close: "紹介を閉じる",
    confirm: "なるほど、にゃ！",
  },
} satisfies InteractionText;
