// utils/hooks/useAmbientSound.ts
import { useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const audio = new Audio(src);
    console.log("audio", audio);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const startAudio = () => {
      audio.play().catch((e) => {
        console.log("Autoplay blocked, ", e);
      });
      document.removeEventListener("click", startAudio);
    };

    if (paused) {
      audio.pause();
    } else {
      audio.play();

      document.addEventListener("click", startAudio);
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
