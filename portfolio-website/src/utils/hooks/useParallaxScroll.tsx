import React from "react";

export const parallaxScrollToOffset = (scrollY: number): number => {
  return scrollY / 529.5;
};

export const useParallaxScroll = (): number => {
  const [scroll, setScroll] = React.useState(0);

  React.useEffect(() => {
    document
      .querySelector(".parallax")
      ?.addEventListener("scroll", function () {
        // @ts-ignore
        const { scrollTop } = this;
        setScroll(parallaxScrollToOffset(scrollTop));
      });
  }, []);

  return scroll;
};
