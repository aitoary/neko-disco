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

export const ranking = {
  title: "2026年版 人気飼育犬種・猫種・小動物ランキング",
  publisher: "アイペット損害保険（現・第一アイペット）",
  url: "https://www.ipet-ins.com/info/40566/",
  published: "2026年1月20日",
  period: "2025年1月1日〜12月31日",
};

// Display ranks exclude mixed-breed cats and run from 1 to 12.
// These correspond to ranks 2–13 in the original survey, in the same order.
export const breeds: Breed[] = [
  {
    id: "scottish-fold",
    name: "スコティッシュフォールド",
    english: "SCOTTISH FOLD",
    rank: 1,
    image: "/images/breeds/scottish-fold.webp",
    color: "pink",
    catchphrase: "音、あってる？",
    intro: "まるいお顔の、やさしいDJ。",
    trait: "まるい顔・折れ耳",
    appearance:
      "丸い顔と丸い目、前に折れた小さな耳が印象的。立ち耳の子もいて、毛の長さや色もさまざまです。",
    personality:
      "おだやかで、人のそばで過ごすことを好む傾向があります。好奇心もあって、家族のしていることをじっと見ていることも。",
    detail:
      "ルーツはスコットランドで見つかった猫。フォールドは「折りたたむ」という意味で、耳の形に由来します。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/38658/",
    sourceName: "第一アイペット",
    scene: { x: 49, y: 36, size: 18 },
  },
  {
    id: "munchkin",
    name: "マンチカン",
    english: "MUNCHKIN",
    rank: 2,
    image: "/images/breeds/munchkin.webp",
    color: "lime",
    catchphrase: "あそぼ、あそぼ。",
    intro: "ちいさな歩幅で、大きな好奇心。",
    trait: "短い脚・好奇心",
    appearance:
      "短い脚と低めのシルエットがよく知られていますが、脚の長い子もいます。短毛・長毛の両方があり、毛色も豊富。",
    personality:
      "人懐っこく、遊び好きな傾向のある猫。気になるものを見つけると、ちょこちょこと探検に出かけます。",
    detail:
      "短い脚でも、動きは意外とすばやいもの。その子の体に合った遊び方で、好奇心に付き合ってあげましょう。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17908/",
    sourceName: "第一アイペット",
    scene: { x: 34, y: 60, size: 18 },
  },
  {
    id: "ragdoll",
    name: "ラグドール",
    english: "RAGDOLL",
    rank: 3,
    image: "/images/breeds/ragdoll.webp",
    color: "cyan",
    catchphrase: "いっしょに、乾杯。",
    intro: "青い瞳の、ふわふわさん。",
    trait: "青い目・大きな体",
    appearance:
      "大きな体、やわらかなセミロングの毛、澄んだ青い目が特徴。顔や耳、尾などに色が入る毛色が見られます。",
    personality:
      "おだやかで愛情深く、人とゆったり過ごすのを好む傾向があります。抱っこの好みは、その子の気分を大切に。",
    detail:
      "英語の名前は「ぬいぐるみ」の意味。体はゆっくり成長し、十分に成熟するまで数年かかります。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17911/",
    sourceName: "第一アイペット",
    scene: { x: 80, y: 44, size: 16 },
  },
  {
    id: "minuet",
    name: "ミヌエット",
    english: "MINUET",
    rank: 4,
    image: "/images/breeds/minuet.webp",
    color: "lavender",
    catchphrase: "ちょっと、ごあいさつ。",
    intro: "まるくて、ふわっと、愛嬌たっぷり。",
    trait: "丸い目・ふんわり毛",
    appearance:
      "丸い頭と大きな目、小さめの耳がチャームポイント。短毛・長毛、短い脚・長い脚など、見た目にも幅があります。",
    personality:
      "おだやかさと遊び心をあわせ持ち、人と仲よくするのが好きな傾向があります。新しいものには興味津々。",
    detail:
      "ペルシャ系の猫とマンチカンをもとに生まれた猫種。以前は「ナポレオン」と呼ばれていました。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17921/",
    sourceName: "第一アイペット",
    scene: { x: 18, y: 59, size: 17 },
  },
  {
    id: "american-shorthair",
    name: "アメリカンショートヘア",
    english: "AMERICAN SHORTHAIR",
    rank: 5,
    image: "/images/breeds/american-shorthair.webp",
    color: "peach",
    catchphrase: "次は、この曲。",
    intro: "しましま模様の、遊び上手。",
    trait: "短い毛・がっしり体型",
    appearance:
      "筋肉のついた、がっしりした体と短い被毛が特徴。銀色に黒い渦巻き模様が有名ですが、ほかにも多くの毛色があります。",
    personality:
      "家族にはおだやかに接しつつ、ひとりで過ごす時間も楽しむ傾向があります。おもちゃを追いかける遊びも大好き。",
    detail:
      "祖先は船で北アメリカへ渡り、ネズミを捕る役目をしていた猫たち。たくましいハンターの歴史を持ちます。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17916/",
    sourceName: "第一アイペット",
    scene: { x: 47, y: 63, size: 18 },
  },
  {
    id: "siberian",
    name: "サイベリアン",
    english: "SIBERIAN",
    rank: 6,
    image: "/images/breeds/siberian.webp",
    color: "yellow",
    catchphrase: "まだまだ、踊れる。",
    intro: "ふわふわの奥に、たくましさ。",
    trait: "厚い被毛・力強い体",
    appearance:
      "ロシアにルーツを持つ、厚い毛に包まれた猫。丸みのあるしっかりした体つきで、冬には被毛がいっそう豊かになります。",
    personality:
      "おだやかで辛抱強い傾向がありますが、運動も得意。ふわふわした見た目の奥に、力強い動きを秘めています。",
    detail: "成長はゆっくり。毛の長さや密度は季節で変わり、寒い土地の暮らしに適応してきました。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17924/",
    sourceName: "第一アイペット",
    scene: { x: 63, y: 55, size: 17 },
  },
  {
    id: "british-shorthair",
    name: "ブリティッシュショートヘア",
    english: "BRITISH SHORTHAIR",
    rank: 7,
    image: "/images/breeds/british-shorthair.webp",
    color: "cyan",
    catchphrase: "ひとやすみ、しよ。",
    intro: "まあるいほっぺの、マイペースさん。",
    trait: "丸いほっぺ・密な短毛",
    appearance:
      "丸い顔とふっくらした頬、密に生えた短い毛が特徴。がっしりした体つきで、ブルーと呼ばれるグレーの毛色がよく知られています。",
    personality:
      "人に親しみを持ちながらも、抱っこよりそばで過ごすのを好む子も。ちょうどいい距離感で、家族に寄り添います。",
    detail:
      "落ち着いた見た目でも、遊びは好き。かつてネズミを捕って暮らした、ハンターとしての一面があります。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17914/",
    sourceName: "第一アイペット",
    scene: { x: 73, y: 70, size: 18 },
  },
  {
    id: "norwegian-forest",
    name: "ノルウェージャンフォレストキャット",
    english: "NORWEGIAN FOREST CAT",
    rank: 8,
    image: "/images/breeds/norwegian-forest.webp",
    color: "lime",
    catchphrase: "ここ、いい眺め。",
    intro: "北の森から、今夜のフロアへ。",
    trait: "三角形の顔・豊かな尾",
    appearance:
      "三角形の顔、まっすぐな鼻筋、ふさふさの長い尾が特徴。大きな体を、寒さに備えた豊かな毛が包みます。",
    personality:
      "フレンドリーで、人やほかの動物と関わるのを好む傾向があります。活発で、高い場所を楽しむ子も多い猫種です。",
    detail: "名前は「ノルウェーの森の猫」。北欧の厳しい自然の中で育まれた、たくましい猫です。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17912/",
    sourceName: "第一アイペット",
    scene: { x: 20, y: 24, size: 16 },
  },
  {
    id: "ragamuffin",
    name: "ラガマフィン",
    english: "RAGAMUFFIN",
    rank: 9,
    image: "/images/breeds/ragamuffin.webp",
    color: "pink",
    catchphrase: "となり、空いてるよ。",
    intro: "寄り添う時間が、いちばん好き。",
    trait: "豊かな毛・大きな瞳",
    appearance:
      "しっかりした大きな体と、やわらかく豊かな毛。表情豊かな大きな目と、ふっくらした口元が印象的で、毛色や模様も多彩です。",
    personality:
      "おっとりして人懐っこく、家族のそばでくつろぐのを好む傾向があります。遊ぶ時間も、寄り添う時間も楽しむ猫。",
    detail:
      "ラグドールとつながりのある猫種ですが、目の色や毛色のバリエーションに、それぞれの個性があります。",
    source: "https://cfa.org/breed/ragamuffin/",
    sourceName: "CFA（猫の登録団体）",
    scene: { x: 87, y: 82, size: 22 },
  },
  {
    id: "maine-coon",
    name: "メインクーン",
    english: "MAINE COON",
    rank: 10,
    image: "/images/breeds/maine-coon.webp",
    color: "peach",
    catchphrase: "大きく、のび〜っ。",
    intro: "大きな体の、やさしい仲間。",
    trait: "大きな耳・四角い口元",
    appearance:
      "長くたくましい体、大きな房毛のある耳、四角い口元が特徴。豊かな長毛と、長くふさふさした尾も目を引きます。",
    personality:
      "社交的で穏やかな傾向から「やさしい巨人」とも呼ばれます。家族とのやりとりや、おもちゃ遊びを楽しむ猫です。",
    detail:
      "アメリカ北東部にルーツを持つ大型の猫種。見た目の迫力に加え、小さなさえずりのような声でお話しすることも。",
    source: "https://cfa.org/breed/maine-coon-cat/",
    sourceName: "CFA（猫の登録団体）",
    scene: { x: 32, y: 82, size: 22 },
  },
  {
    id: "russian-blue",
    name: "ロシアンブルー",
    english: "RUSSIAN BLUE",
    rank: 11,
    image: "/images/breeds/russian-blue.webp",
    color: "lavender",
    catchphrase: "静かに、ノってます。",
    intro: "銀色の毛並みに、緑の瞳。",
    trait: "ブルーの短毛・緑の目",
    appearance:
      "銀色の光沢があるブルーの短毛と、鮮やかな緑の目。くさび形の顔に、脚の長い引き締まった体をしています。",
    personality:
      "大きな声で鳴くことが少なく、親しくなった家族に愛情を向ける傾向があります。仲よくなるときは、その子のペースで。",
    detail:
      "口元がほほ笑んでいるように見えるのも魅力。毛の先端が銀色なので、光を受けるとつややかに輝きます。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17913/",
    sourceName: "第一アイペット",
    scene: { x: 58, y: 81, size: 19 },
  },
  {
    id: "bengal",
    name: "ベンガル",
    english: "BENGAL",
    rank: 12,
    image: "/images/breeds/bengal.webp",
    color: "yellow",
    catchphrase: "このボール、いただき。",
    intro: "小さなヒョウ柄の、冒険家。",
    trait: "ヒョウ柄・しなやかな体",
    appearance:
      "ヒョウを思わせるスポット模様と、筋肉質でしなやかな体。斑点のほかにマーブル模様もあり、毛色にも違いがあります。",
    personality:
      "好奇心が強く、たっぷり遊ぶのが好きな傾向があります。人への愛情も深く、いっしょに動く時間を楽しみます。",
    detail:
      "斑点の中が輪のようになった模様は「ロゼット」。ワイルドな見た目と、遊び好きな一面をあわせ持つ猫です。",
    source: "https://www.ipet-ins.com/cat-insurance/breed/17917/",
    sourceName: "第一アイペット",
    scene: { x: 11, y: 81, size: 20 },
  },
];
