/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";
import { useAmbientSound } from "../utils/hooks/useAmbientSound";

interface Props {}

export const HomePage = ({}: Props) => {
  const { toggleMute, paused } = useAmbientSound("/assets/ambient.mp3", 0.2);

  return (
    <>
      <Header toggleMute={toggleMute} paused={paused} />
      <InfiniteScrollContainer />
    </>
  );
};
