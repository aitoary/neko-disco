import DiscoPage from "./disco-page";
import { periods, quizzes } from "./activities";
import { facts } from "./facts";
import { breeds, ranking } from "./breeds";
import { japanesePageText as pageText } from "./page-ja";
import { japaneseInteractionText as interactionText } from "./interactions-ja";

export default function Home() {
  return (
    <DiscoPage
      breeds={breeds}
      facts={facts}
      periods={periods}
      quizzes={quizzes}
      pageText={pageText}
      interactionText={interactionText}
      rankingUrl={ranking.url}
    />
  );
}
