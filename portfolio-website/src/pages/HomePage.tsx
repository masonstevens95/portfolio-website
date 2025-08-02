/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";
import { useAmbientSound } from "../utils/hooks/useAmbientSound";

interface Props {}

export const HomePage = ({}: Props) => {
  return (
    <>
      <Header />
      <InfiniteScrollContainer />
    </>
  );
};
