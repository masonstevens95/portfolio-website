/*
  Header
*/

import {
  HeaderSelected,
  setHeaderSelected,
} from "../../redux/slices/globalData";
import { useAppDispatch, useAppSelector } from "../../utils/hooks/reduxHooks";
import { useAmbientSound } from "../../utils/hooks/useAmbientSound";

interface Props {}

const HEADER_LABELS = [
  { id: HeaderSelected.WELCOME, label: "Welcome" },
  { id: HeaderSelected.FEATURED_WORK, label: "Featured Work" },
  { id: HeaderSelected.ABOUT_ME, label: "About Me" },
  { id: HeaderSelected.PROFESSIONAL_GOALS, label: "Professional Goals" },
  { id: HeaderSelected.CONTACT, label: "Contact" },
];

export const Header = ({}: Props) => {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(
    (state) => state.globalDataSlice.headerSelected
  );

  const { toggleMute, paused } = useAmbientSound(
    "/assets/space-arp-f-chords.wav",
    0.1
  );

  const handleClick = (id: HeaderSelected) => {
    console.log("clicked");
    // Always scroll
    const element = document.getElementById(HeaderSelected[id]);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start", // Align element's top with container's top
        inline: "nearest", // Not relevant here but avoids lateral jump
      });
    }
    // Only dispatch if selection has changed
    if (selected !== id) {
      dispatch(setHeaderSelected(id));
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-sm px-8 py-4">
      <div className="flex justify-between items-center text-neutral-100 max-w-7xl mx-auto">
        <div className="flex gap-6">
          {HEADER_LABELS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id)}
              className={`transition-colors duration-300 text-base md:text-lg ${
                selected === item.id
                  ? "text-white font-bold underline underline-offset-4"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button onClick={toggleMute}>{paused ? "🔇" : "🔊"}</button>
      </div>
    </div>
  );
};
