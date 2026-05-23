// utils/hooks/useAmbientSound.ts
import { useCallback, useEffect, useRef, useState } from "react";

export const useAmbientSound = (src: string, baseVolume = 0.1) => {
  const [paused, setPaused] = useState(false);
  const [audio] = useState(() => {
    const a = new Audio(src);
    a.volume = baseVolume;
    return a;
  });
  const baseVolumeRef = useRef(baseVolume);
  baseVolumeRef.current = baseVolume;

  useEffect(() => {
    audio.loop = true;

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
  }, [audio, paused]);

  // Single source of truth: `paused`. Toggling it lets the effect above
  // call play()/pause() — and play() inside the click handler runs in a
  // user-gesture context, so browsers that blocked autoplay will allow it.
  const toggleMute = () => setPaused((p) => !p);

  // Mutate the underlying audio volume directly. Intentionally bypasses
  // the effect above so we don't re-call play() on every scroll tick.
  // Wrapped in useCallback so consumer effects (e.g. Header's scroll-driven
  // setVolume call) get a stable identity and only re-fire on `scroll`.
  const setVolume = useCallback((multiplier: number) => {
    audio.volume = baseVolumeRef.current * multiplier;
  }, [audio]);

  return { toggleMute, paused, setVolume };
};
