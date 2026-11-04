/*
  PlanDetailPage — /plans/:slug

  Order (decided in the plan, 2026-11-04):
    1. Title and short description
    2. Buy block (price plus tax, format, Buy) beside the lead plate on
       desktop, directly under the title on mobile
    3. Remaining plates
    4. ARTICLE I What's included, ARTICLE II Materials (the cut list)

  The cut list is the brand's bill-of-materials table at screen weight:
  hairline rules, tabular figures. It is the thing that makes this read as
  a plan sheet rather than a product tile.

  Unlisted plans still render here so past buyers' links keep working; they
  are only hidden from the index.
*/

import { Link, useParams } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { PlateCaption, PlateImage, SectionHead, toRoman } from "../../components/broadside";
import { findPlanBySlug, type Plan } from "../../data/plans";
import { isBuyableHere } from "./clientMode";
import { BuyBlock } from "./BuyBlock";

const Plate = ({ plate, numeral }: { plate: Plan["plates"][number]; numeral: string }) => (
  <figure className="m-0">
    <PlateCaption plate={numeral}>{plate.caption}</PlateCaption>
    <div className="w-full aspect-[4/3] overflow-hidden ink-frame">
      <PlateImage src={plate.src} title={plate.alt} />
    </div>
  </figure>
);

const CUT_LIST_COLUMNS = ["Qty", "Length", "Part", "Notes"];

const CutList = ({ rows, title }: { rows: Plan["cutList"]; title: string }) => (
  <div
    role="region"
    aria-label={`${title} cut list`}
    tabIndex={0}
    className="w-full overflow-x-auto ink-frame"
  >
    <table className="w-full border-collapse" style={{ minWidth: "520px", fontSize: "14px" }}>
      <thead>
        <tr className="label text-left">
          {CUT_LIST_COLUMNS.map((col) => (
            <th key={col} scope="col" className="px-3 py-2 font-normal border-b border-[var(--ink)]">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.part}-${row.length}`} className="border-b border-[var(--ink)] last:border-b-0">
            <td className="px-3 py-2 data">{row.qty}</td>
            <td className="px-3 py-2 data">{row.length}</td>
            <td className="px-3 py-2">{row.part}</td>
            <td className="px-3 py-2" style={{ opacity: 0.75 }}>{row.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const PlanDetailPage = () => {
  const { slug = "" } = useParams();
  const plan = findPlanBySlug(slug);

  if (!plan) {
    return (
      <ProjectPageTemplate title="No such plan" backTo="/plans" backLabel="All Plans">
        <p className="m-0 copy">
          There&rsquo;s no plan at this address.{" "}
          <Link to="/plans" className="underline">
            See all plans
          </Link>
          .
        </p>
      </ProjectPageTemplate>
    );
  }

  const buyable = isBuyableHere(plan);
  const [lead, ...rest] = plan.plates;

  return (
    <ProjectPageTemplate title={plan.title} subtitle="Build plan" backTo="/plans" backLabel="All Plans">
      <p className="m-0 copy" style={{ fontSize: "17px", lineHeight: 1.55, maxWidth: "62ch" }}>
        {plan.summary}
      </p>

      {/* Buy block comes first in the DOM so it sits under the title on
          mobile; on desktop the grid puts the lead plate on the left. */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 items-start">
        <div className="md:order-2">
          <BuyBlock plan={plan} buyable={buyable} />
        </div>
        {lead && (
          <div className="md:order-1">
            <Plate plate={lead} numeral="I" />
          </div>
        )}
      </div>

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rest.map((plate, i) => (
            <Plate key={plate.caption} plate={plate} numeral={toRoman(i + 2)} />
          ))}
        </div>
      )}

      <section>
        <SectionHead article="I" title="What's included" />
        <p className="m-0 mb-4 copy" style={{ maxWidth: "62ch" }}>
          {plan.description}
        </p>
        <ul className="m-0 pl-5 copy" style={{ listStyle: "square" }}>
          {plan.included.map((item) => (
            <li key={item} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHead article="II" title="Materials" />
        <CutList rows={plan.cutList} title={plan.title} />
      </section>
    </ProjectPageTemplate>
  );
};
