// utils/hooks/useAmbientSound.ts
import { useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [audio, setAudio] = useState(new Audio(src));

  useEffect(() => {
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    if (paused) {
      audio.pause();
    } else {
      audio.play().catch((e) => {
        // Browser blocked autoplay (typical until the user interacts with
        // the page). Sync UI state to "muted" so the toggle button is honest;
        // a click on the toggle counts as a user gesture and will succeed.
        console.error("Autoplay blocked, ", e);
        setPaused(true);
      });
    }
  }, [src, volume, paused]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setPaused(audioRef.current.muted);
    }
  };

  return { toggleMute, paused };
};
