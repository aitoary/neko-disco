"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Check,
  Crown,
  Heart,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  PawPrint,
  RotateCcw,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import type { Period, Quiz } from "./activity-definitions";
import type { Fact } from "./fact-definitions";
import type { Breed } from "./breed-definitions";
import { resolveSelection, type SelectionKey } from "./selection";
import { useDiscoSession } from "./disco-session";
import type { PageText } from "./page-text";
import type { InteractionText } from "./interaction-text";
import { SceneTooltip, type SceneHint } from "./scene-tooltip";
import { SceneLighting } from "./scene-lighting";
import { BackToFloor } from "./back-to-floor";
import type { Locale } from "./locale";
import { LanguageMenu } from "./language-menu";
import type { LanguageMenuText } from "./language-menu-text";
import { useLocaleNavigation } from "./locale-navigation-provider";

const sceneProps = [
  { id: "night", x: 49, y: 11, w: 23, h: 23 },
  { id: "height", x: 24, y: 46, w: 13, h: 17 },
  { id: "box", x: 6, y: 61, w: 6, h: 8 },
  { id: "scratch", x: 89, y: 60, w: 8, h: 22 },
  { id: "water", x: 88, y: 35, w: 10, h: 15 },
];
function Cat({ image, className = "" }: { image: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`cat-sprite breed-sprite ${className}`}>
      <img src={image} alt="" loading="lazy" draggable="false" width="512" height="512" />
    </span>
  );
}
function BreedName({ name }: { name: string }) {
  return (
    <>
      {name
        .split(/(フォールド|ショートヘア|フォレストキャット)/)
        .filter(Boolean)
        .map((part, i) => (
          <span key={i}>{part}</span>
        ))}
    </>
  );
}
type DiscoPageProps = {
  locale: Locale;
  languageMenuText: LanguageMenuText;
  breeds: Breed[];
  facts: Fact[];
  periods: Period[];
  quizzes: Quiz[];
  pageText: PageText;
  interactionText: InteractionText;
  rankingUrl: string;
};

export default function DiscoPage({
  locale,
  languageMenuText,
  breeds,
  facts,
  periods,
  quizzes,
  pageText,
  interactionText,
  rankingUrl,
}: DiscoPageProps) {
  const { hrefs, saveFailed, selectLanguage, completeNavigation, focusDestination } =
    useLocaleNavigation();
  const {
    state: { soundState, motion, found, period, question, answer, score, finished },
    actions: {
      toggleSound,
      setMotion,
      setFound,
      setPeriod,
      setQuestion,
      setAnswer,
      setScore,
      setFinished,
    },
  } = useDiscoSession();
  const sound = soundState === "playing" || soundState === "loading";
  const [sceneHint, setSceneHint] = useState<SceneHint | null>(null);
  const [selection, setSelection] = useState<SelectionKey | null>(null);
  const resolvedSelection = resolveSelection(selection, breeds, facts);
  const selected = resolvedSelection?.item ?? null;
  const selectedBreedIndex = resolvedSelection?.kind === "breed" ? resolvedSelection.index : null;
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    completeNavigation(locale);
  }, [locale, completeNavigation]);
  useEffect(() => {
    console.log("HELLO NEKO DISKO!");
  }, []);
  useEffect(() => {
    return () => {
      if (burstTimer.current) clearTimeout(burstTimer.current);
    };
  }, []);
  const discover = (fact: Breed | Fact, e?: React.MouseEvent<HTMLElement>) => {
    setSceneHint(null);
    lastTrigger.current = (e?.currentTarget as HTMLElement) ?? null;
    if ("name" in fact) setFound((prev) => (prev.includes(fact.id) ? prev : [...prev, fact.id]));
    if (e && motion) {
      const r = e.currentTarget.getBoundingClientRect();
      setBurst({
        x: e.clientX || r.x + r.width / 2,
        y: e.clientY || r.y + r.height / 2,
        id: Date.now(),
      });
      if (burstTimer.current) clearTimeout(burstTimer.current);
      burstTimer.current = setTimeout(() => setBurst(null), 900);
    }
    setSelection("name" in fact ? { kind: "breed", id: fact.id } : { kind: "fact", id: fact.id });
  };
  const sceneHintEvents = (id: string, label: string, detail: string) => {
    const show = (e: React.MouseEvent<HTMLButtonElement> | React.FocusEvent<HTMLButtonElement>) =>
      setSceneHint({ id, label, detail, anchor: e.currentTarget });
    const hide = () => setSceneHint((previous) => (previous?.id === id ? null : previous));
    return {
      onMouseEnter: show,
      onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
        if (document.activeElement !== e.currentTarget) hide();
      },
      onFocus: show,
      onBlur: (e: React.FocusEvent<HTMLButtonElement>) => {
        if (!e.currentTarget.matches(":hover")) hide();
      },
      "aria-describedby": sceneHint?.id === id && !selected ? "scene-tooltip" : undefined,
    };
  };
  const answerQuiz = (i: number) => {
    if (answer !== null) return;
    setAnswer(i);
    if (i === quizzes[question].answer) setScore((s) => s + 1);
  };
  const goFloor = () =>
    document
      .getElementById("dance-floor")
      ?.scrollIntoView({ behavior: motion ? "smooth" : "instant", block: "start" });
  const p = periods[period];
  return (
    <main id="top" lang={locale} className={`site ${motion ? "" : "still"}`}>
      <a className="skip-link" href="#dance-floor">
        {interactionText.navigation.skipFloor}
      </a>
      <div className="disco-reflections" aria-hidden="true">
        {Array.from({ length: 30 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--x": `${(i * 37 + 9) % 100}%`,
                "--y": `${(i * 23 + 7) % 100}%`,
                "--delay": `${-i * 0.83}s`,
                "--r": `${i * 31}deg`,
                "--tone": ["#ffa6e6", "#d5ff62", "#8be9ee"][i % 3],
              } as CSSProperties
            }
          />
        ))}
      </div>
      <header className="header language-menu-header">
        <a href="#top" className="brand" aria-label={pageText.header.homeLabel}>
          <PawPrint size={25} fill="currentColor" />
          <span>
            NEKO<span className="brand-light">DISCO</span>
            <small>{pageText.header.tagline}</small>
          </span>
        </a>
        <nav aria-label={pageText.header.menuLabel}>
          <a href="#dance-floor">{pageText.header.floorLink}</a>
          <a href="#residents">{pageText.header.residentsLink}</a>
          <a href="#quiz">{pageText.header.quizLink}</a>
        </nav>
        <div className="header-controls">
          <LanguageMenu
            locale={locale}
            hrefs={hrefs}
            text={languageMenuText}
            onSelect={selectLanguage}
          />
          <button
            className={`control sound ${sound ? "active" : ""}`}
            aria-pressed={sound}
            aria-busy={soundState === "loading"}
            aria-label={interactionText.sound.actions[soundState]}
            title={
              soundState === "error"
                ? interactionText.sound.errorTitle
                : interactionText.sound.trackTitle
            }
            onClick={toggleSound}
          >
            {sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{interactionText.sound.buttons[soundState]}</span>
          </button>
          <span className="sr-only" role="status">
            {soundState === "loading"
              ? interactionText.sound.loadingStatus
              : soundState === "error"
                ? interactionText.sound.errorStatus
                : ""}
          </span>
          <button
            className="control motion"
            aria-pressed={!motion}
            aria-label={motion ? interactionText.motion.pause : interactionText.motion.resume}
            onClick={() => setMotion(!motion)}
          >
            {motion ? <Pause size={16} /> : <Play size={16} />}
          </button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-heading">
          <p className="eyebrow">
            <span /> ALL CATS WELCOME. ALL NIGHT LONG.
          </p>
          <button
            className="hero-cat hero-cat-left"
            aria-label={interactionText.discovery.breedLabel.replace(
              "{name}",
              () => breeds[0].name,
            )}
            onClick={(e) => discover(breeds[0], e)}
          >
            <Cat image={breeds[0].image} />
            <span className="tiny-bubble">{pageText.hero.openingBubble}</span>
          </button>
          <h1 id="hero-title">
            NEKO <span>DISCO</span>
            <i aria-hidden="true">✳</i>
          </h1>
          <button
            className="hero-cat hero-cat-right"
            aria-label={interactionText.discovery.breedLabel.replace(
              "{name}",
              () => breeds[1].name,
            )}
            onClick={(e) => discover(breeds[1], e)}
          >
            <Cat image={breeds[1].image} />
            <span className="tiny-bubble">{pageText.hero.danceBubble}</span>
          </button>
          <div className="hero-subline">
            <h2>
              {pageText.hero.heading[0]}
              <br className="mobile-break" />
              {pageText.hero.heading[1]}
            </h2>
            <p>
              {pageText.hero.intro[0]}
              <br />
              {pageText.hero.intro[1]}
            </p>
            <button className="primary-button" onClick={goFloor}>
              <PawPrint size={19} /> {pageText.hero.floorButton}
            </button>
          </div>
        </div>
        <div id="dance-floor" className="floor-section">
          <div className="floor-topline">
            <span>
              <i className="live-dot" /> THE DANCE FLOOR
            </span>
            <span className="floor-hint">
              <MousePointer2 size={14} /> {interactionText.discovery.floorHint}
            </span>
            <span className="floor-count">
              <Sparkles size={15} /> <b>{found.length.toString().padStart(2, "0")}</b> / 12{" "}
              {interactionText.discovery.countLabel}
            </span>
          </div>
          <div className="scene">
            <img
              className="scene-image"
              src="/images/disco-room.webp"
              alt={pageText.floor.sceneAlt}
              loading="lazy"
              width="1536"
              height="1024"
            />
            <SceneLighting />
            {sceneProps.map((s) => {
              const f = facts.find((f) => f.id === s.id)!;
              return (
                <button
                  key={s.id}
                  className={`hotspot prop-hotspot spot-${s.id}`}
                  style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%`, height: `${s.h}%` }}
                  aria-label={interactionText.discovery.factLabel.replace("{label}", () => f.label)}
                  {...sceneHintEvents(`prop-${s.id}`, f.label, interactionText.discovery.factHint)}
                  onClick={(e) => discover(f, e)}
                >
                  <span className="prop-mark">
                    <Sparkles size={13} />
                  </span>
                </button>
              );
            })}
            {breeds.map((breed, i) => (
              <button
                key={breed.id}
                data-breed={breed.id}
                className={`hotspot scene-cat ${found.includes(breed.id) ? "discovered" : ""}`}
                style={
                  {
                    left: `${breed.scene.x}%`,
                    top: `${breed.scene.y}%`,
                    width: `${breed.scene.size}%`,
                    zIndex: Math.round(breed.scene.y),
                    "--i": i,
                  } as CSSProperties
                }
                aria-label={(found.includes(breed.id)
                  ? interactionText.discovery.foundBreedLabel
                  : interactionText.discovery.breedLabel
                ).replace("{name}", () => breed.name)}
                {...sceneHintEvents(
                  `breed-${breed.id}`,
                  breed.name,
                  interactionText.discovery.breedHint.replace("{rank}", () => String(breed.rank)),
                )}
                onClick={(e) => discover(breed, e)}
              >
                <Cat image={breed.image} />
                <span className="hotspot-mark">
                  {found.includes(breed.id) ? <Check size={14} /> : <Plus size={15} />}
                </span>
              </button>
            ))}
            <div className="floor-sticker" aria-hidden="true">
              NO RULES.
              <br />
              JUST <b>MEOW.</b>
              <span>{pageText.floor.stickerNote}</span>
            </div>
          </div>
          <div className="floor-bottom">
            <span>{pageText.floor.caption}</span>
            <button
              onClick={(e) => discover(breeds.find((f) => !found.includes(f.id)) ?? breeds[0], e)}
            >
              {found.length === 12
                ? interactionText.discovery.allFoundButton
                : interactionText.discovery.unseenButton}{" "}
              <Sparkles size={15} />
            </button>
          </div>
        </div>
      </section>
      <div className="marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              EAT. SLEEP. MEOW. REPEAT. <PawPrint /> {pageText.marquee}{" "}
              <span className="star">✳</span>{" "}
            </span>
          ))}
        </div>
      </div>

      <section id="residents" className="residents section-wrap">
        <div className="section-head">
          <div>
            <p className="eyebrow">12 BREEDS. 12 PERSONALITIES. / 01</p>
            <h2>
              {pageText.residents.heading[0]}
              <br />
              <span>{pageText.residents.heading[1]}</span>
            </h2>
          </div>
          <p>
            {pageText.residents.intro[0]}
            <br />
            {pageText.residents.intro[1]}
            <br />
            <span className="little-note">
              <MousePointer2 size={15} /> {pageText.residents.tapHint}
            </span>
          </p>
        </div>
        <div className="ranking-note">
          <span className="ranking-badge">2026 RANKING</span>
          <div>
            <p>
              <b>{pageText.ranking.heading}</b> {pageText.ranking.scope}
            </p>
            <p>
              {pageText.ranking.sourceLabel}
              <a href={rankingUrl} target="_blank" rel="noreferrer">
                {pageText.ranking.citation
                  .replace("{publisher}", () => pageText.ranking.publisher)
                  .replace("{title}", () => pageText.ranking.title)}
              </a>
              {pageText.ranking.publishedNote.replace(
                "{published}",
                () => pageText.ranking.published,
              )}
            </p>
            <p>{pageText.ranking.population.replace("{period}", () => pageText.ranking.period)}</p>
          </div>
        </div>
        <div className="resident-grid">
          {breeds.map((breed) => (
            <button
              className={`resident-card breed-card bg-${breed.color}${breed.rank === 1 ? " featured-breed" : ""}`}
              key={breed.id}
              data-breed-card={breed.id}
              onClick={(e) => discover(breed, e)}
              aria-label={interactionText.discovery.cardLabel
                .replace("{rank}", () => String(breed.rank))
                .replace("{name}", () => breed.name)}
            >
              <div className="card-top">
                <span className="card-rank">
                  {breed.rank <= 3 && (
                    <Crown
                      className={`rank-crown rank-crown-${breed.rank}`}
                      size={30}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />
                  )}
                  <span className="rank-caption">No.</span>
                  <b>{breed.rank}</b>
                </span>
                <span className="card-icon">
                  {found.includes(breed.id) ? <Check size={18} /> : <Plus size={18} />}
                </span>
              </div>
              <div className="cat-stage">
                <span className="cat-catchphrase">{breed.catchphrase}</span>
                <Cat image={breed.image} />
                {breed.rank === 1 && (
                  <span className="winner-sparkles" aria-hidden="true">
                    <Sparkles size={23} />
                    <Sparkles size={17} />
                  </span>
                )}
              </div>
              <span className="breed-english">{breed.english}</span>
              <h3>
                <BreedName name={breed.name} />
              </h3>
              <p>{breed.intro}</p>
              <div className="card-bottom">
                <span>{breed.trait}</span>
                <span className="round-open">
                  <Plus size={19} />
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="breed-note">{pageText.residents.individualNote}</p>
      </section>

      <section id="cat-time" className="cat-time section-wrap">
        <div className="time-copy">
          <p className="eyebrow">A DAY IN CAT TIME / 02</p>
          <h2>
            {pageText.daily.heading[0]}
            <br />
            <span>{pageText.daily.heading[1]}</span>
          </h2>
          <p>
            {pageText.daily.intro[0]}
            <br />
            {pageText.daily.intro[1]}
            <br />
            {pageText.daily.intro[2]}
          </p>
          <small>{pageText.daily.note}</small>
        </div>
        <div className={`time-panel time-${period}`}>
          <div className="time-display">
            <span>{p.mood}</span>
            <b>{p.time}</b>
            <span className="time-spark">✳</span>
          </div>
          <div className="time-scene">
            <button
              key={period}
              onClick={(e) => discover(breeds[p.breed], e)}
              aria-label={interactionText.discovery.breedLabel.replace(
                "{name}",
                () => breeds[p.breed].name,
              )}
            >
              <Cat image={breeds[p.breed].image} />
              <span className="time-breed-name">{breeds[p.breed].name}</span>
            </button>
            <div key={p.headline} className="time-description">
              <h3>{p.headline}</h3>
              <p>{p.text}</p>
            </div>
          </div>
          <Slider
            className="time-slider"
            value={[period]}
            min={0}
            max={3}
            step={1}
            onValueChange={(v) => setPeriod(v[0])}
            aria-label={pageText.daily.sliderLabel}
          />
          <div className="time-labels">
            {periods.map((t, i) => (
              <button
                className={i === period ? "selected" : ""}
                key={t.time}
                aria-pressed={i === period}
                onClick={() => setPeriod(i)}
              >
                {t.time}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="quiz" className="quiz-section section-wrap">
        <div className="quiz-intro">
          <span className="quiz-stamp">
            NEKO
            <br />
            LOVER
            <br />
            <Heart size={25} fill="currentColor" />
          </span>
          <p className="eyebrow">ONE LAST THING / 03</p>
          <h2>
            {pageText.quiz.heading[0]}
            <br />
            {pageText.quiz.heading[1]}
          </h2>
          <p>
            {pageText.quiz.intro[0]}
            <br />
            {pageText.quiz.intro[1]}
          </p>
          <Cat image={breeds[2].image} />
        </div>
        <div className="quiz-card">
          {!finished ? (
            <>
              <div className="quiz-progress">
                <span>{interactionText.quiz.eyebrow}</span>
                <div>
                  {quizzes.map((_, i) => (
                    <span className={i <= question ? "done" : ""} key={i} />
                  ))}
                </div>
                <b>0{question + 1} / 03</b>
              </div>
              <h3>{quizzes[question].q}</h3>
              <div className="quiz-options">
                {quizzes[question].choices.map((c, i) => (
                  <button
                    key={`${question}-${i}`}
                    disabled={answer !== null}
                    className={
                      answer !== null
                        ? i === quizzes[question].answer
                          ? "correct"
                          : i === answer
                            ? "incorrect"
                            : "dim"
                        : ""
                    }
                    onClick={() => answerQuiz(i)}
                  >
                    <span>{String.fromCharCode(65 + i)}</span>
                    {c}
                    {answer !== null && i === quizzes[question].answer && <Check size={22} />}
                  </button>
                ))}
              </div>
              {answer !== null ? (
                <div className="quiz-feedback" role="status">
                  <strong>
                    {answer === quizzes[question].answer
                      ? interactionText.quiz.correct
                      : interactionText.quiz.incorrect}
                  </strong>
                  <p>{quizzes[question].explain}</p>
                  <button
                    className="quiz-review"
                    onClick={(e) => discover(breeds[quizzes[question].breed], e)}
                  >
                    {interactionText.quiz.reviewBreed}
                  </button>
                  <button
                    className="dark-button"
                    onClick={() => {
                      if (question === 2) setFinished(true);
                      else {
                        setQuestion(question + 1);
                        setAnswer(null);
                      }
                    }}
                  >
                    {question === 2 ? interactionText.quiz.results : interactionText.quiz.next}
                  </button>
                </div>
              ) : (
                <p className="quiz-prompt">{interactionText.quiz.prompt}</p>
              )}
            </>
          ) : (
            <div className="quiz-result" role="status">
              <Sparkles size={38} />
              <p>{interactionText.quiz.resultEyebrow}</p>
              <h3>
                {score}
                <small> / 3</small>
              </h3>
              <h4>
                {score === 3
                  ? interactionText.quiz.perfectResult
                  : interactionText.quiz.otherResult}
              </h4>
              <p>
                {interactionText.quiz.resultMessage[0]}
                <br />
                {interactionText.quiz.resultMessage[1]}
              </p>
              <button
                className="dark-button"
                onClick={() => {
                  setFinished(false);
                  setQuestion(0);
                  setAnswer(null);
                  setScore(0);
                }}
              >
                <RotateCcw size={17} /> {interactionText.quiz.retry}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="closing">
        <p className="eyebrow">THANKS FOR HANGING OUT.</p>
        <h2>
          {pageText.closing.heading[0]}
          <br />
          {pageText.closing.heading[1]}
        </h2>
        <button onClick={goFloor} className="primary-button">
          <PawPrint size={19} /> {pageText.closing.button}
        </button>
        <div className="closing-cats">
          {[8, 6, 1, 0, 2, 9].map((n) => {
            const f = breeds[n];
            return (
              <button
                key={n}
                aria-label={interactionText.discovery.breedLabel.replace("{name}", () => f.name)}
                onClick={(e) => discover(f, e)}
              >
                <Cat image={f.image} />
              </button>
            );
          })}
        </div>
      </section>
      <footer>
        <div className="footer-top">
          <a className="brand" href="#top">
            <PawPrint size={24} />
            <span>
              NEKO DISCO<small>{pageText.header.tagline}</small>
            </span>
          </a>
          <span>{pageText.footer.tagline}</span>
        </div>
        <div className="footer-bottom">
          <p>{pageText.footer.safetyNote}</p>
          <span>© 2026 NEKO DISCO</span>
        </div>
        <details className="sources">
          <summary>{pageText.footer.sourceSummary}</summary>
          <p>
            {pageText.footer.sourceIntro.replace("{publisher}", () => pageText.ranking.publisher)}
          </p>
          <div>
            <a href={rankingUrl} target="_blank" rel="noreferrer">
              {pageText.footer.rankingLink}
            </a>
            <a
              href="https://www.ipet-ins.com/cat-insurance/breed/"
              target="_blank"
              rel="noreferrer"
            >
              {pageText.footer.breedLink}
            </a>
            <a href="https://cfa.org/breeds/" target="_blank" rel="noreferrer">
              {pageText.footer.cfaLink}
            </a>
            {Array.from(new Set(facts.map((f) => f.source))).map((url, i) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                Cats Protection — {pageText.footer.sourceTopics[i] ?? pageText.footer.fallbackTopic}
              </a>
            ))}
          </div>
        </details>
      </footer>
      <aside className="fixed-capsule discovery-pill" aria-live="polite">
        <PawPrint size={17} />
        <span>{interactionText.discovery.progressLabel}</span>
        <b>
          {found.length}
          <small> / 12</small>
        </b>
        {found.length === 12 && <Sparkles size={18} />}
      </aside>
      <BackToFloor motionEnabled={motion} text={interactionText.navigation} />
      {saveFailed ? (
        <p className="language-save-notice" role="status">
          {languageMenuText.saveFailure}
        </p>
      ) : null}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelection(null);
        }}
      >
        <DialogContent
          className={`fact-dialog bg-${selected?.color ?? "pink"}`}
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
            else if (window.location.pathname !== `/${locale}`) focusDestination();
          }}
        >
          {selected && (
            <>
              <button
                className="dialog-close"
                aria-label={interactionText.detail.close}
                onClick={() => setSelection(null)}
              >
                <X size={21} />
              </button>
              {"name" in selected ? (
                <>
                  <div className="fact-visual breed-visual">
                    <span className="fact-number">
                      2026 RANKING
                      <br />
                      <small>
                        {pageText.detail.breedRankLabel}
                        <span className="rank-context">{pageText.detail.mixedExcluded}</span>
                      </small>
                      <b>
                        {String(selected.rank).padStart(2, "0")}
                        <small>{pageText.detail.rankUnit}</small>
                      </b>
                    </span>
                    {selectedBreedIndex !== null && (
                      <Cat image={breeds[selectedBreedIndex].image} />
                    )}
                    <span className="fact-sound">{selected.catchphrase}</span>
                  </div>
                  <div className="fact-copy breed-copy">
                    <p className="eyebrow">{selected.english}</p>
                    <DialogTitle className="fact-title">
                      <BreedName name={selected.name} />
                    </DialogTitle>
                    <DialogDescription className="fact-body">{selected.intro}</DialogDescription>
                    <dl className="breed-details">
                      <div>
                        <dt>{pageText.detail.appearance}</dt>
                        <dd>{selected.appearance}</dd>
                      </div>
                      <div>
                        <dt>{pageText.detail.personality}</dt>
                        <dd>{selected.personality}</dd>
                      </div>
                    </dl>
                    <p className="fact-tip">
                      <PawPrint size={20} />
                      <span>{selected.detail}</span>
                    </p>
                    <p className="individual-note">{pageText.detail.individualNote}</p>
                    <div className="fact-actions">
                      <a href={selected.source} target="_blank" rel="noreferrer">
                        {pageText.detail.breedSource.replace(
                          "{sourceName}",
                          () => selected.sourceName,
                        )}
                      </a>
                      <button className="dark-button" onClick={() => setSelection(null)}>
                        {interactionText.detail.confirm} <Check size={16} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="fact-visual prop-visual">
                    <Sparkles size={70} />
                    <span className="fact-sound">{selected.sound}</span>
                  </div>
                  <div className="fact-copy">
                    <p className="eyebrow">CAT LIFE / {selected.label}</p>
                    <DialogTitle className="fact-title">{selected.title}</DialogTitle>
                    <DialogDescription className="fact-body">{selected.body}</DialogDescription>
                    <p className="fact-tip">
                      <PawPrint size={20} />
                      <span>{selected.tip}</span>
                    </p>
                    <div className="fact-actions">
                      <a href={selected.source} target="_blank" rel="noreferrer">
                        {pageText.detail.factSource}
                      </a>
                      <button className="dark-button" onClick={() => setSelection(null)}>
                        {interactionText.detail.confirm} <Check size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      {burst && (
        <div
          key={burst.id}
          className="burst"
          aria-hidden="true"
          style={{ left: burst.x, top: burst.y }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              style={
                {
                  "--angle": `${i * 40}deg`,
                  "--color": ["#e6ff6b", "#ff9cd6", "#8bedeb"][i % 3],
                } as CSSProperties
              }
            >
              {i % 2 ? "✦" : "♥"}
            </span>
          ))}
        </div>
      )}
      <SceneTooltip hint={selected ? null : sceneHint} />
    </main>
  );
}
