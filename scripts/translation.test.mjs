import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

// Supply data-module imports with the existing compiler and Node test runner.
function typeScriptModuleUrl(path, imports = {}) {
  let { outputText } = ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  for (const [specifier, url] of Object.entries(imports)) {
    outputText = outputText.replaceAll(JSON.stringify(specifier), JSON.stringify(url));
  }
  return `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
}

const dataModuleUrls = Object.fromEntries(
  [
    "breed-definitions",
    "breeds-ja",
    "breeds-en",
    "fact-definitions",
    "facts-ja",
    "facts-en",
    "activity-definitions",
    "activities-ja",
    "activities-en",
    "interactions-ja",
    "interactions-en",
    "page-ja",
    "page-en",
    "language-menu-text",
  ].map((name) => [`./${name}`, typeScriptModuleUrl(`../app/${name}.ts`)]),
);
for (const name of ["breeds", "facts", "activities"]) {
  dataModuleUrls[`./${name}`] = typeScriptModuleUrl(`../app/${name}.ts`, dataModuleUrls);
}

const [
  { breedDefinitions },
  { englishBreedText },
  { factDefinitions },
  { englishFactText },
  { japaneseFactText },
  { periodDefinitions, quizDefinitions },
  { englishPeriodText, englishQuizText },
  { japanesePeriodText },
  { japaneseInteractionText },
  { englishInteractionText },
  { japanesePageText },
  { englishPageText },
  { breeds, ranking },
  { facts },
  { periods, quizzes },
  { getDiscoPageData },
  { japaneseLanguageMenuText, englishLanguageMenuText },
] = await Promise.all([
  import(dataModuleUrls["./breed-definitions"]),
  import(dataModuleUrls["./breeds-en"]),
  import(dataModuleUrls["./fact-definitions"]),
  import(dataModuleUrls["./facts-en"]),
  import(dataModuleUrls["./facts-ja"]),
  import(dataModuleUrls["./activity-definitions"]),
  import(dataModuleUrls["./activities-en"]),
  import(dataModuleUrls["./activities-ja"]),
  import(dataModuleUrls["./interactions-ja"]),
  import(dataModuleUrls["./interactions-en"]),
  import(dataModuleUrls["./page-ja"]),
  import(dataModuleUrls["./page-en"]),
  import(dataModuleUrls["./breeds"]),
  import(dataModuleUrls["./facts"]),
  import(dataModuleUrls["./activities"]),
  import(typeScriptModuleUrl("../app/disco-page-data.ts", dataModuleUrls)),
  import(dataModuleUrls["./language-menu-text"]),
]);

test("language menu dictionaries have matching nonblank fields and a current-language placeholder", () => {
  const japanese = interactionEntries(japaneseLanguageMenuText);
  const english = interactionEntries(englishLanguageMenuText);
  assert.deepEqual(
    japanese.map(([path]) => path),
    english.map(([path]) => path),
  );
  for (const dictionary of [japaneseLanguageMenuText, englishLanguageMenuText]) {
    for (const [path, value] of interactionEntries(dictionary)) {
      assert.ok(value.trim().length > 0, `${path} must not be blank`);
    }
    assert.equal((dictionary.menuLabel.match(/\{language\}/gu) ?? []).length, 1);
    assert.deepEqual(dictionary.names, { ja: "日本語", en: "English" });
  }
});

test("English language menu copy keeps Japanese only in the Japanese autonym", () => {
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [path, value] of interactionEntries(englishLanguageMenuText)) {
    if (path === "names.ja") continue; // Managed intentional Japanese exception.
    assert.doesNotMatch(value, japanese, path);
  }
});

test("Japanese page data exactly matches the existing catalogs and dictionaries", () => {
  assert.deepEqual(getDiscoPageData("ja"), {
    breeds,
    facts,
    periods,
    quizzes,
    pageText: japanesePageText,
    interactionText: japaneseInteractionText,
    rankingUrl: ranking.url,
  });
});

test("English page data retains every shared catalog field and uses the English text", () => {
  const english = getDiscoPageData("en");
  for (const [items, baseline, text, sharedFields] of [
    [
      english.breeds,
      breeds,
      englishBreedText,
      ["id", "english", "rank", "image", "color", "source", "scene"],
    ],
    [english.facts, facts, englishFactText, ["id", "sprite", "color", "source"]],
  ]) {
    assert.deepEqual(
      items.map((item) => item.id),
      baseline.map((item) => item.id),
    );
    for (const [index, item] of items.entries()) {
      assert.deepEqual(Object.keys(item).sort(), Object.keys(baseline[index]).sort());
      for (const field of sharedFields) {
        assert.deepEqual(item[field], baseline[index][field], `${item.id}.${field}`);
      }
      for (const [field, value] of Object.entries(text[item.id])) {
        assert.deepEqual(item[field], value, `${item.id}.${field}`);
      }
    }
  }
  assert.deepEqual(english.pageText, englishPageText);
  assert.deepEqual(english.interactionText, englishInteractionText);
  assert.equal(english.rankingUrl, ranking.url);
  assert.deepEqual(Object.keys(english).sort(), Object.keys(getDiscoPageData("ja")).sort());
});

test("English activities retain time, catalog references, and correct answer positions", () => {
  const english = getDiscoPageData("en");
  assert.equal(english.periods.length, periods.length);
  for (const [index, period] of english.periods.entries()) {
    assert.deepEqual(Object.keys(period).sort(), Object.keys(periods[index]).sort());
    assert.equal(period.time, periods[index].time);
    assert.equal(period.breed, periods[index].breed);
    for (const [field, value] of Object.entries(englishPeriodText[periodDefinitions[index].id])) {
      assert.deepEqual(period[field], value, `period ${index}.${field}`);
    }
  }
  assert.equal(english.quizzes.length, quizzes.length);
  for (const [index, quiz] of english.quizzes.entries()) {
    assert.deepEqual(Object.keys(quiz).sort(), Object.keys(quizzes[index]).sort());
    assert.equal(quiz.answer, quizzes[index].answer);
    assert.equal(quiz.breed, quizzes[index].breed);
    for (const [field, value] of Object.entries(englishQuizText[quizDefinitions[index].id])) {
      assert.deepEqual(quiz[field], value, `quiz ${index}.${field}`);
    }
  }
  assert.deepEqual(
    english.quizzes.map((quiz) => english.breeds[quiz.breed].id),
    ["ragdoll", "minuet", "bengal"],
  );
});

test("unsupported page locales do not silently fall back to Japanese", () => {
  assert.throws(() => getDiscoPageData("fr"), RangeError);
});

test("English breed text covers exactly the 12 stable catalog IDs", () => {
  assert.equal(Object.keys(englishBreedText).length, 12);
  assert.deepEqual(
    Object.keys(englishBreedText).sort(),
    breedDefinitions.map((breed) => breed.id).sort(),
  );
});

test("English breed entries contain every text field and cannot override shared facts", () => {
  const fields = [
    "name",
    "catchphrase",
    "intro",
    "trait",
    "appearance",
    "personality",
    "detail",
    "sourceName",
  ].sort();
  for (const [id, text] of Object.entries(englishBreedText)) {
    assert.deepEqual(Object.keys(text).sort(), fields, id);
    for (const field of fields) {
      assert.equal(typeof text[field], "string", `${id}.${field}`);
      assert.ok(text[field].trim().length > 0, `${id}.${field} must not be blank`);
    }
  }
});

test("English breed names and attribution match their shared catalog entries", () => {
  // The existing publishers' English name/acronym, with the CFA explanation translated.
  const sourceNames = new Map([
    ["www.ipet-ins.com", "Daiichi ipet Insurance Co., Ltd."],
    ["cfa.org", "CFA (cat registry)"],
  ]);
  for (const breed of breedDefinitions) {
    const text = englishBreedText[breed.id];
    assert.equal(text.name.toUpperCase(), breed.english, `${breed.id}.name`);
    const sourceName = sourceNames.get(new URL(breed.source).hostname);
    assert.ok(sourceName, `${breed.id} needs an explicit English source name`);
    assert.equal(text.sourceName, sourceName, `${breed.id}.sourceName`);
  }
});

test("English breed text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in this catalog, including publisher names.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [id, text] of Object.entries(englishBreedText)) {
    for (const [field, value] of Object.entries(text)) {
      assert.doesNotMatch(value, japanese, `${id}.${field}`);
    }
  }
});

test("English fact text covers exactly the 12 stable catalog IDs", () => {
  assert.equal(Object.keys(englishFactText).length, 12);
  assert.deepEqual(
    Object.keys(englishFactText).sort(),
    factDefinitions.map((fact) => fact.id).sort(),
  );
});

test("English fact entries contain every text field and cannot override shared data", () => {
  const fields = ["label", "tag", "title", "body", "tip", "sound"].sort();
  for (const [id, text] of Object.entries(englishFactText)) {
    assert.deepEqual(Object.keys(text).sort(), fields, id);
    for (const field of fields) {
      assert.equal(typeof text[field], "string", `${id}.${field}`);
      assert.ok(text[field].trim().length > 0, `${id}.${field} must not be blank`);
    }
  }
});

test("English facts retain the existing English tags and scene exclamations", () => {
  for (const { id } of factDefinitions) {
    assert.equal(englishFactText[id].tag, japaneseFactText[id].tag, `${id}.tag`);
    assert.equal(englishFactText[id].sound, japaneseFactText[id].sound, `${id}.sound`);
  }
});

test("English fact text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in this catalog.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [id, text] of Object.entries(englishFactText)) {
    for (const [field, value] of Object.entries(text)) {
      assert.doesNotMatch(value, japanese, `${id}.${field}`);
    }
  }
});

test("English activity text covers exactly the 4 period and 3 quiz IDs", () => {
  for (const [definitions, text, count] of [
    [periodDefinitions, englishPeriodText, 4],
    [quizDefinitions, englishQuizText, 3],
  ]) {
    assert.equal(Object.keys(text).length, count);
    assert.deepEqual(Object.keys(text).sort(), definitions.map((item) => item.id).sort());
  }
});

test("English activity entries contain complete text only, including all quiz choices", () => {
  for (const [text, fields] of [
    [englishPeriodText, ["label", "headline", "text", "mood"]],
    [englishQuizText, ["q", "choices", "explain"]],
  ]) {
    for (const [id, item] of Object.entries(text)) {
      assert.deepEqual(Object.keys(item).sort(), [...fields].sort(), id);
      for (const field of fields) {
        const value = item[field];
        if (field === "choices") {
          assert.ok(Array.isArray(value), `${id}.${field}`);
          assert.equal(value.length, 3, `${id}.${field}`);
        } else {
          assert.equal(typeof value, "string", `${id}.${field}`);
        }
        for (const entry of Array.isArray(value) ? value : [value]) {
          assert.equal(typeof entry, "string", `${id}.${field}`);
          assert.ok(entry.trim().length > 0, `${id}.${field} must not be blank`);
        }
      }
    }
  }
});

test("English periods retain the existing English mood labels", () => {
  for (const { id } of periodDefinitions) {
    assert.equal(englishPeriodText[id].mood, japanesePeriodText[id].mood, id);
  }
});

test("English quiz choices retain the Japanese order, correct answer, and breed association", () => {
  // Reviewed translations in the original choice order; Japanese wording is pinned by activity.test.
  const expected = {
    "ragdoll-eyes": {
      breedId: "ragdoll",
      answer: 1,
      choices: [
        englishBreedText["american-shorthair"].name,
        englishBreedText.ragdoll.name,
        englishBreedText["russian-blue"].name,
      ],
    },
    "minuet-roots": {
      breedId: "minuet",
      answer: 0,
      choices: [
        `Persian-related cats × ${englishBreedText.munchkin.name}`,
        `${englishBreedText.bengal.name} × ${englishBreedText["russian-blue"].name}`,
        `${englishBreedText["maine-coon"].name} × ${englishBreedText.ragdoll.name}`,
      ],
    },
    "bengal-rosettes": {
      breedId: "bengal",
      answer: 2,
      choices: ["Straight stripes", "Solid white", "Ring-like spots"],
    },
  };
  for (const { id, answer, breed } of quizDefinitions) {
    assert.deepEqual(englishQuizText[id].choices, expected[id].choices, `${id}.choices`);
    assert.equal(answer, expected[id].answer, `${id}.answer`);
    assert.equal(breedDefinitions[breed].id, expected[id].breedId, `${id}.breed`);
  }
});

test("English activity text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in either activity catalog.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const text of [englishPeriodText, englishQuizText]) {
    for (const [id, item] of Object.entries(text)) {
      for (const [field, value] of Object.entries(item)) {
        for (const entry of Array.isArray(value) ? value : [value]) {
          assert.doesNotMatch(entry, japanese, `${id}.${field}`);
        }
      }
    }
  }
});

function interactionEntries(text, prefix = "") {
  return Object.entries(text).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return value !== null && typeof value === "object"
      ? interactionEntries(value, path)
      : [[path, value]];
  });
}

test("interaction dictionaries have exactly matching fields and nonblank text", () => {
  const japanese = interactionEntries(japaneseInteractionText);
  const english = interactionEntries(englishInteractionText);
  assert.deepEqual(english.map(([path]) => path).sort(), japanese.map(([path]) => path).sort());
  for (const entries of [japanese, english]) {
    for (const [path, value] of entries) {
      assert.equal(typeof value, "string", path);
      assert.ok(value.trim().length > 0, `${path} must not be blank`);
    }
  }
});

test("interaction name and rank placeholders match in both languages", () => {
  const expected = {
    "discovery.breedLabel": ["name"],
    "discovery.foundBreedLabel": ["name"],
    "discovery.factLabel": ["label"],
    "discovery.breedHint": ["rank"],
    "discovery.cardLabel": ["name", "rank"],
  };
  for (const text of [japaneseInteractionText, englishInteractionText]) {
    for (const [path, value] of interactionEntries(text)) {
      const parameters = [...value.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
      assert.deepEqual(parameters, expected[path] ?? [], path);
    }
  }
});

test("Japanese interaction text retains the main wording and state labels", () => {
  // Pin the copy from main 3453038 before connecting the interaction dictionary.
  assert.deepEqual(japaneseInteractionText, {
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
  });
});

test("the server page passes Japanese interaction copy to the client page and back-to-floor", () => {
  const page = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
  const clientPage = readFileSync(new URL("../app/disco-page.tsx", import.meta.url), "utf8");
  const backToFloor = readFileSync(new URL("../app/back-to-floor.tsx", import.meta.url), "utf8");
  assert.deepEqual(getDiscoPageData("ja").interactionText, japaneseInteractionText);
  assert.doesNotMatch(page, /from ["']\.\/interactions-en["']/u);
  assert.doesNotMatch(clientPage, /from ["']\.\/interactions-(?:ja|en)["']/u);
  assert.doesNotMatch(backToFloor, /from ["']\.\/interactions-(?:ja|en)["']/u);
  assert.ok(clientPage.includes("text={interactionText.navigation}"));
  for (const [path] of interactionEntries(japaneseInteractionText)) {
    if (path === "navigation.backToTop" || path === "navigation.backToFloor") {
      assert.ok(
        backToFloor.includes(`text.${path.split(".")[1]}`),
        `${path} must reach the button`,
      );
      continue;
    }
    // Sound labels use the existing state directly; message line indices remain explicit.
    const reference = path
      .replace(/^(sound\.(?:buttons|actions))\.[^.]+$/u, "$1[soundState]")
      .replace(/\.(\d+)$/u, "[$1]");
    assert.ok(
      clientPage.includes(`interactionText.${reference}`),
      `${path} must be connected to the page`,
    );
  }
});

test("interaction dictionaries retain the existing English performance labels", () => {
  assert.deepEqual(englishInteractionText.sound.buttons, japaneseInteractionText.sound.buttons);
  assert.equal(
    englishInteractionText.navigation.backToFloor,
    japaneseInteractionText.navigation.backToFloor,
  );
  assert.equal(englishInteractionText.quiz.eyebrow, japaneseInteractionText.quiz.eyebrow);
  assert.equal(
    englishInteractionText.quiz.resultEyebrow,
    japaneseInteractionText.quiz.resultEyebrow,
  );
});

test("English interaction text contains no unintended Japanese", () => {
  // No intentional Japanese exceptions in this dictionary.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [path, value] of interactionEntries(englishInteractionText)) {
    assert.doesNotMatch(value, japanese, path);
  }
});

test("page dictionaries have exactly matching fields, line counts, and nonblank text", () => {
  const japanese = interactionEntries(japanesePageText);
  const english = interactionEntries(englishPageText);
  assert.deepEqual(english.map(([path]) => path).sort(), japanese.map(([path]) => path).sort());
  for (const entries of [japanese, english]) {
    for (const [path, value] of entries) {
      assert.equal(typeof value, "string", path);
      assert.ok(value.trim().length > 0, `${path} must not be blank`);
    }
  }
});

test("page attribution and survey placeholders match in both languages", () => {
  const expected = {
    "ranking.citation": ["publisher", "title"],
    "ranking.publishedNote": ["published"],
    "ranking.population": ["period"],
    "footer.sourceIntro": ["publisher"],
    "detail.breedSource": ["sourceName"],
  };
  for (const text of [japanesePageText, englishPageText]) {
    for (const [path, value] of interactionEntries(text)) {
      const parameters = [...value.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1]).sort();
      assert.deepEqual(parameters, expected[path] ?? [], path);
    }
  }
});

test("Japanese page text retains the main wording and explicit line boundaries", () => {
  // Pin the copy from main 78f1f80 before replacing JSX literals with dictionary references.
  assert.deepEqual(japanesePageText, {
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
  });
});

test("the server page passes Japanese copy and the client references every page dictionary field", () => {
  const source = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
  const clientPage = readFileSync(new URL("../app/disco-page.tsx", import.meta.url), "utf8");
  assert.deepEqual(getDiscoPageData("ja").pageText, japanesePageText);
  assert.doesNotMatch(source, /from ["']\.\/page-en["']/);
  assert.doesNotMatch(clientPage, /from ["']\.\/page-(?:ja|en)["']/u);
  for (const [path] of interactionEntries(japanesePageText)) {
    // Source topics are indexed by the existing source URL order; other line indices are explicit.
    const reference = path.startsWith("footer.sourceTopics.")
      ? "footer.sourceTopics[i]"
      : path.replace(/\.(\d+)$/u, "[$1]");
    assert.ok(
      clientPage.includes(`pageText.${reference}`),
      `${path} must be connected to the page`,
    );
  }
});

test("the server entry supplies data to the shared client view without moving session ownership", () => {
  const page = readFileSync(new URL("../app/[locale]/page.tsx", import.meta.url), "utf8");
  const clientPage = readFileSync(new URL("../app/disco-page.tsx", import.meta.url), "utf8");
  const layout = readFileSync(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /["']use client["']/u);
  assert.ok(page.includes('import DiscoPage from "../disco-page";'));
  assert.ok(page.includes('import { getDiscoPageData } from "../disco-page-data";'));
  assert.ok(page.includes("{...getDiscoPageData(locale)}"));
  assert.ok(page.includes("if (!isLocale(locale)) notFound();"));
  assert.ok(page.includes("locale={locale}"));
  assert.match(clientPage, /^"use client";/u);
  assert.doesNotMatch(clientPage, /from ["']\.\/disco-page-data["']/u);
  assert.doesNotMatch(clientPage, /from ["']\.\/(?:breeds|facts|activities)(?:-(?:ja|en))?["']/u);
  assert.ok(clientPage.includes("= useDiscoSession();"));
  assert.doesNotMatch(page + clientPage, /DiscoSessionProvider/u);
  assert.ok(layout.includes("<DiscoSessionProvider>{children}</DiscoSessionProvider>"));
});

test("English ranking retains the publication date, period, population, and mixed-category exclusion", () => {
  assert.equal(englishPageText.ranking.published, "January 20, 2026");
  assert.equal(englishPageText.ranking.period, "January 1–December 31, 2025");
  assert.match(englishPageText.ranking.scope, /1–12.*survey's mixed-cat category/);
  assert.match(englishPageText.ranking.population, /insurance.*contracts began during \{period\}/);
  assert.match(englishPageText.ranking.population, /not a ranking of all pet cats in Japan/);
  assert.ok(englishPageText.ranking.publisher.includes(englishBreedText.ragdoll.sourceName));
});

test("footer reference captions correspond to the existing unique source URL order", () => {
  const captions = new Map([
    [
      "https://www.cats.org.uk/help-and-advice/home-and-environment/cats-at-night",
      "Night-time activity",
    ],
    ["https://www.cats.org.uk/help-and-advice/cat-behaviour/cat-body-language", "Body language"],
    ["https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-play", "Cats and play"],
    ["https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-hiding", "Hiding"],
    ["https://www.cats.org.uk/help-and-advice/cat-behaviour/cats-and-sleep", "Cats and sleep"],
    ["https://www.cats.org.uk/help-and-advice/diet/feeding", "Food and water"],
    ["https://www.cats.org.uk/help-and-advice/cat-behaviour/scratching", "Scratching"],
    ["https://www.cats.org.uk/cats-blog/why-do-cats-have-whiskers", "Whiskers"],
  ]);
  const sources = [...new Set(factDefinitions.map((fact) => fact.source))];
  assert.equal(sources.length, 8);
  assert.ok(sources.every((source) => captions.has(source)));
  assert.deepEqual(
    englishPageText.footer.sourceTopics,
    sources.map((source) => captions.get(source)),
  );
});

test("English page text contains no unintended Japanese", () => {
  // The citation title is translated too; there are no intentional Japanese exceptions.
  const japanese = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script=Han}]/u;
  for (const [path, value] of interactionEntries(englishPageText)) {
    assert.doesNotMatch(value, japanese, path);
  }
});
