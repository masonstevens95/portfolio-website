// utils/hooks/useAmbientSound.ts
import { useEffect, useState } from "react";

export const useAmbientSound = (src: string, volume = 0.3) => {
  const [paused, setPaused] = useState(false);
  const [audio] = useState(() => new Audio(src));

  useEffect(() => {
    audio.loop = true;
    audio.volume = volume;

    if (paused) {
      audio.pause();
    } else {
      audio.play().catch((e) => {
        // Browser blocked autoplay (typical until the user interacts with
        // the page). Sync UI state so the toggle button is honest; a click
        // on the toggle counts as a user gesture and will then succeed.
        console.error("Autoplay blocked, ", e);
        setPaused(true);
      });
    }
  }, [audio, volume, paused]);

  // Single source of truth: `paused`. Toggling it lets the effect above
  // call play()/pause() — and play() inside the click handler runs in a
  // user-gesture context, so browsers that blocked autoplay will allow it.
  const toggleMute = () => setPaused((p) => !p);

  return { toggleMute, paused };
};
