// utils/hooks/useAmbientSound.ts
import { useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [paused, setPaused] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [audio, setAudio] = useState(new Audio(src));

  useEffect(() => {
    console.log("audio", audio);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    if (paused) {
      audio.pause();
    } else {
      audio.play().catch((e) => {
        console.log("Autoplay blocked, ", e);
      });
      if (!hasStarted) {
        document.addEventListener("click", startAudio);
      }

      setHasStarted(true);
    }
  }, [src, volume, paused]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setPaused(audioRef.current.muted);
    }
  };

  const startAudio = () => {
    audio.play().catch((e) => {
      console.log("Autoplay blocked, ", e);
    });
    document.removeEventListener("click", startAudio);
  };

  return { toggleMute, paused };
};
