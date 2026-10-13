"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { SoundState } from "./disco-audio";
import { useDiscoAudio } from "./use-disco-audio";
import { useDiscoMotion } from "./use-disco-motion";

type StateSetter<T> = Dispatch<SetStateAction<T>>;

type DiscoSession = {
  state: {
    soundState: SoundState;
    motion: boolean;
    found: string[];
    period: number;
    question: number;
    answer: number | null;
    score: number;
    finished: boolean;
  };
  actions: {
    toggleSound: () => void;
    setMotion: StateSetter<boolean | null>;
    setFound: StateSetter<string[]>;
    setPeriod: StateSetter<number>;
    setQuestion: StateSetter<number>;
    setAnswer: StateSetter<number | null>;
    setScore: StateSetter<number>;
    setFinished: StateSetter<boolean>;
  };
};

const DiscoSessionContext = createContext<DiscoSession | null>(null);

function getCurrentJstPeriod() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? 0);
  const time = hour + minute / 60;
  if (time < 3 || time >= 21) return 3;
  if (time < 9) return 0;
  if (time < 15) return 1;
  return 2;
}

export function DiscoSessionProvider({ children }: { children: ReactNode }) {
  const { soundState, toggleSound } = useDiscoAudio();
  const { motion, setMotion } = useDiscoMotion();
  const [found, setFound] = useState<string[]>([]);
  const [period, setPeriod] = useState(getCurrentJstPeriod);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.motion = motion ? "on" : "off";
  }, [motion]);

  return (
    <DiscoSessionContext
      value={{
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
      }}
    >
      {children}
    </DiscoSessionContext>
  );
}

export function useDiscoSession() {
  const session = use(DiscoSessionContext);
  if (!session) throw new Error("useDiscoSession must be used within DiscoSessionProvider");
  return session;
}
