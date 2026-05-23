/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";
import { useParallaxScroll } from "../utils/hooks/useParallaxScroll";

export const HomePage = () => {
  const scroll = useParallaxScroll();
  return (
    <>
      <Header scroll={scroll} />
      <InfiniteScrollContainer scroll={scroll} />
    </>
  );
};
