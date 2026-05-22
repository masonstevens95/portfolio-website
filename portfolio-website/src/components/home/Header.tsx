/*
  Header
*/

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeaderSelected,
  setHeaderSelected,
} from "../../redux/slices/globalData";
import { useAppDispatch, useAppSelector } from "../../utils/hooks/reduxHooks";
import { useAmbientSound } from "../../utils/hooks/useAmbientSound";

interface Props {}

const HEADER_LABELS = [
  { id: HeaderSelected.WELCOME, label: "Welcome" },
  { id: HeaderSelected.ABOUT_ME, label: "About Me" },
  { id: HeaderSelected.FEATURED_WORK, label: "Featured Work" },
  // { id: HeaderSelected.PROFESSIONAL_GOALS, label: "Professional Goals" },
  { id: HeaderSelected.CONTACT, label: "Contact" },
];

const AUDIO_HINT_KEY = "orchard-audio-hint-dismissed-v3";

export const Header = ({}: Props) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  const { toggleMute, paused } = useAmbientSound(
    "/assets/crickets.wav",
    0.1
  );

  const [hintDismissed, setHintDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(AUDIO_HINT_KEY) === "1";
  });

  // Show the hint until the user clicks the audio button, regardless of
  // whether autoplay succeeded. The arrow is a generic affordance pointing
  // at the toggle — "this button does something" — not specifically a
  // "click to play" cue. Dismissal is persisted across reloads.
  const showHint = !hintDismissed;

  const handleAudioClick = () => {
    if (!hintDismissed) {
      setHintDismissed(true);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(AUDIO_HINT_KEY, "1");
      }
    }
    toggleMute();
  };

  const handleClick = (id: HeaderSelected) => {
    const element = document.getElementById(HeaderSelected[id]);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }

    if (selected !== id) {
      dispatch(setHeaderSelected(id));
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[var(--orchard-bark)]/65 backdrop-blur-sm border-b border-[var(--orchard-honey)]/15 px-8 py-4">
      <div className="relative max-w-7xl mx-auto flex items-center justify-center text-[var(--orchard-cream)]">
        {/* Centered nav */}
        <div className="flex gap-6">
          {HEADER_LABELS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`transition-colors duration-300 text-base md:text-lg ${
                selected === item.id
                  ? "text-[var(--orchard-cream)] font-bold underline underline-offset-4 decoration-[var(--orchard-honey)]"
                  : "text-[var(--orchard-cream)]/60 hover:text-[var(--orchard-cream)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Audio toggle in the top-right corner */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-2 flex items-center gap-2">
          <AnimatePresence>
            {showHint && (
              <motion.span
                key="audio-hint-arrow"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8, transition: { duration: 0.25 } }}
                transition={{ duration: 0.4 }}
                aria-hidden="true"
                className="text-[var(--orchard-honey)] text-3xl md:text-4xl font-bold leading-none pointer-events-none select-none drop-shadow-[0_0_8px_rgba(216,168,80,0.5)]"
              >
                <motion.span
                  animate={{ x: [0, 10, 0] }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="inline-block"
                >
                  →
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={handleAudioClick}
            className="text-[var(--orchard-cream)] hover:text-[var(--orchard-honey)] text-xl"
            title="Toggle ambient audio"
          >
            {paused ? "🔇" : "🦗"}
          </button>
        </div>
      </div>
    </div>
  );
};
