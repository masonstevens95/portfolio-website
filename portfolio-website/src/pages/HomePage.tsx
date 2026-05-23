/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";
import { useParallaxScroll } from "../utils/hooks/useParallaxScroll";

interface Props {}

export const HomePage = ({}: Props) => {
  const scroll = useParallaxScroll();
  return (
    <>
      <Header scroll={scroll} />
      <InfiniteScrollContainer scroll={scroll} />
    </>
  );
};
