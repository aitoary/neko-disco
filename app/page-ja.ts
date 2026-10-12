import type { PageText } from "./page-text";

export const japanesePageText = {
  header: {
    homeLabel: "NEKO DISCO トップ",
    tagline: "夜のねこ研究所",
    menuLabel: "メインメニュー",
    floorLink: "フロアであそぶ",
    residentsLink: "12猫種に会う",
    quizLink: "ねこクイズ",
  },
  hero: {
    openingBubble: "にゃんと、開店。",
    danceBubble: "きみも踊る？",
    heading: ["踊る。ねむる。", "ときどき、ねこを知る。"],
    intro: ["ここは、ねこたちの夜のひみつ基地。", "気になるあの子に、ちょっとさわってみよう。"],
    floorButton: "フロアにあそびに行く",
  },
  floor: {
    sceneAlt:
      "中央のミラーボールが輝くディスコ。キャットタワーや段ボール、爪とぎが並ぶ部屋に、12猫種が集まっています。",
    stickerNote: "好きなペースで、どうぞ。",
    caption: "踊らなくても、寝ちゃっても。ねこだもの。",
  },
  marquee: "ねこって、なんかいい。",
  residents: {
    heading: ["みんな、ちがって。", "みんな、ねこ。"],
    intro: ["人気ランキングから集まった、12猫種。", "耳も、毛並みも、性格も。それぞれの魅力を。"],
    tapHint: "気になるねこをタップ",
    individualNote:
      "毛色・模様・体格・性格には個体差があります。イラストは、それぞれの猫種の一例を表現しています。",
  },
  ranking: {
    heading: "人気順に、12猫種をご紹介。",
    scope: "ミックスを除いた猫種別の順位を、1〜12位で表示しています。",
    sourceLabel: "出典：",
    publisher: "アイペット損害保険（現・第一アイペット）",
    title: "2026年版 人気飼育犬種・猫種・小動物ランキング",
    published: "2026年1月20日",
    period: "2025年1月1日〜12月31日",
    citation: "{publisher}「{title}」",
    publishedNote: "（{published}発表）",
    population:
      "集計：{period}に同社の保険へ加入し、契約が開始された猫。国内すべての飼育猫を対象とした順位ではありません。",
  },
  daily: {
    heading: ["時計よりも、", "ねこの気分。"],
    intro: [
      "ねこたちの一日は、",
      "遊びとお昼寝の、いいリズム。",
      "時間を動かして、のぞいてみよう。",
    ],
    note: "これは一例。リズムには個体差があります。",
    sliderLabel: "ねこの一日：朝、昼、夕方、夜",
  },
  quiz: {
    heading: ["きみの、", "ねこ理解度は？"],
    intro: ["フロアで会った猫たちを、", "3つのクイズでおさらい。"],
  },
  closing: {
    heading: ["好きなペースで。", "また、あそぼう。"],
    button: "もうひと踊りする",
  },
  footer: {
    tagline: "踊るのも、休むのも、ねこの自由。",
    safetyNote: "ここは空想のディスコ。ほんもののねこには、静かな居場所と新鮮なお水を。",
    sourceSummary: "ランキング・猫種・生態の参考資料",
    sourceIntro:
      "ランキングは{publisher}の2026年版を使用。猫種の紹介は同社の猫種別飼い方ガイドとCFAの資料、生態の説明はCats Protectionの公開資料を参考にしています。猫種ごとの紹介にも出典リンクがあります。",
    rankingLink: "2026年版 人気飼育猫種ランキング",
    breedLink: "第一アイペット — 猫種別飼い方ガイド",
    cfaLink: "CFA — 猫種ガイド",
    sourceTopics: [
      "夜の活動",
      "ボディランゲージ",
      "猫と遊び",
      "隠れる行動",
      "猫の眠り",
      "食事と水",
      "爪とぎ",
      "ひげの役割",
    ],
    fallbackTopic: "猫の行動",
  },
  detail: {
    breedRankLabel: "猫種別",
    mixedExcluded: "ミックスを除く",
    rankUnit: "位",
    appearance: "見た目の特徴",
    personality: "性格の傾向",
    individualNote: "性格や見た目には個体差があります。イラストは一例です。",
    breedSource: "猫種の参考：{sourceName}",
    factSource: "参考：Cats Protection",
  },
} satisfies PageText;
