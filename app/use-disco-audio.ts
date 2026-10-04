"use client";
import { useEffect, useRef, useState } from "react";
import { DiscoAudioPlayer, type SoundState } from "./disco-audio";

export function useDiscoAudio() {
  const player = useRef<DiscoAudioPlayer | null>(null);
  const [soundState, setSoundState] = useState<SoundState>("off");
  useEffect(
    () => () => {
      player.current?.dispose();
      player.current = null;
    },
    [],
  );

  const toggleSound = () => {
    player.current ??= new DiscoAudioPlayer(setSoundState);
    void player.current.toggle();
  };
  return { soundState, toggleSound };
}
