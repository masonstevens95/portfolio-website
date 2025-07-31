/*
  Header
*/

import { HeaderSelected, setHeaderSelected } from "../redux/slices/globalData";
import { useAppDispatch, useAppSelector } from "../utils/hooks/reduxHooks";

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

  const handleClick = (id: HeaderSelected) => {
    dispatch(setHeaderSelected(id));
    // optionally scroll to section
    document
      .getElementById(HeaderSelected[id])
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-black/60 backdrop-blur-sm px-8 py-4">
      <div className="flex justify-center items-center gap-6 text-neutral-100">
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
    </div>
  );
};
