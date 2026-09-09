/*
  WelcomeBlock

  The masthead. Replaces the old "Welcome to My Portfolio" H1, which said
  nothing the page did not already say.

  The overline names what the site is about. The motto is deliberately NOT
  the brand's — "The land belongs to all of us." belongs to the writing side
  of the brand and would have this page declare a position unrelated to its
  contents. This one is in the same register and true of the work below it.
*/

import { Masthead } from "../broadside";

export const WelcomeBlock = () => (
  <section id="WELCOME" className="scroll-mt-24">
    <Masthead
      overline="Software · Tools · Interfaces"
      wordmark="Mason Stevens"
      motto="“Build the thing, then show the work.”"
      estd="Winston-Salem, N.C. · No. 1"
    />
  </section>
);
