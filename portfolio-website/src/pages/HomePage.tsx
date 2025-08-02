/*
HomePage
*/

import { Header } from "../components/home/Header";
import { InfiniteScrollContainer } from "../components/home/InfiniteScrollContainer";

interface Props {}

export const HomePage = ({}: Props) => {
  return (
    <>
      <Header />
      <InfiniteScrollContainer />
    </>
  );
};
