/*
  PlansIndexPage — /plans

  The plans catalog as a numbered list of plates, mirroring the projects
  index. Numbering is legitimate: it is the catalog's real order.

  Per the brand ("sell the plans in the system"), this is a sheet index,
  not a product grid: plate thumbnail, caption, title, price or Coming soon.
*/

import { Link } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { PlateCaption, PlateImage, Rule, toRoman } from "../../components/broadside";
import { formatPrice, listedPlans } from "../../data/plans";
import { isBuyableHere } from "./clientMode";
import { ComingSoonNote } from "./ComingSoonNote";

// The catalog and build mode are both fixed at build time.
const ENTRIES = listedPlans().map((plan) => ({ plan, buyable: isBuyableHere(plan) }));
const ANY_BUYABLE = ENTRIES.some((e) => e.buyable);

export const PlansIndexPage = () => (
    <ProjectPageTemplate
      title="Plans"
      subtitle="Build plans, drawn in SketchUp, for the projects in the videos"
    >
      {!ANY_BUYABLE && <ComingSoonNote />}

      <section className="w-full" aria-label="Plan index">
        <ul className="list-none p-0 m-0 ink-frame">
          {ENTRIES.map(({ plan, buyable }, index) => {
            const lead = plan.plates[0];

            return (
              <li key={plan.slug}>
                {index > 0 && <Rule weight="thin" />}
                <Link
                  to={`/plans/${plan.slug}`}
                  className="flex gap-5 items-start p-4 no-underline group"
                  style={{ color: "var(--ink)" }}
                >
                  <div className="w-28 h-28 shrink-0 overflow-hidden ink-frame">
                    <PlateImage src={lead?.src} title={plan.title} fallbackSize="40px" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <PlateCaption plate={toRoman(index + 1)}>{plan.format}</PlateCaption>
                    <h2
                      className="display m-0 mb-1"
                      style={{ fontSize: "clamp(18px, 2.4vw, 24px)" }}
                    >
                      {plan.title}
                    </h2>
                    <p className="m-0 mb-2" style={{ fontSize: "14px", lineHeight: 1.5 }}>
                      {plan.summary}
                    </p>
                    <span className="label group-hover:underline">
                      {buyable ? `${formatPrice(plan.price)} plus tax` : "Coming soon"} &rarr;
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </ProjectPageTemplate>
);
