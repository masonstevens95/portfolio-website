// utils/hooks/useAmbientSound.ts
import { useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    const startAudio = () => {
      audio.play().catch(() => {
        console.log("Autoplay blocked");
      });
      document.removeEventListener("click", startAudio);
    };

    document.addEventListener("click", startAudio);

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src, volume, paused]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setPaused(audioRef.current.muted);
    }
  };

  return { toggleMute, paused };
};
