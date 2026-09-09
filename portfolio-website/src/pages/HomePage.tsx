/*
  HomePage

  A single scrolling broadside: masthead, then numbered articles separated by
  double rules. Ordinary document flow — no fixed canvas, no parallax layers,
  no absolutely-positioned stack. A broadside is a page you read top to
  bottom.
*/

import { Header } from "../components/home/Header";
import { WelcomeBlock } from "../components/home/WelcomeBlock";
import { AboutMeBlock } from "../components/home/AboutMeBlock";
import { FeaturedWorkBlock } from "../components/home/FeaturedWorkBlock";
import { ContactBlock } from "../components/home/ContactBlock";
import { DoubleRule } from "../components/broadside";

export const HomePage = () => (
  <>
    <Header />
    <main
      className="mx-auto px-4 sm:px-8 pb-24"
      style={{ maxWidth: "var(--maxw)" }}
    >
      <WelcomeBlock />
      <DoubleRule className="mt-2" />

      <AboutMeBlock />
      <DoubleRule className="mt-[52px]" />

      <FeaturedWorkBlock />
      <DoubleRule className="mt-[52px]" />

      <ContactBlock />
      <DoubleRule className="mt-[52px]" />
    </main>
  </>
);
