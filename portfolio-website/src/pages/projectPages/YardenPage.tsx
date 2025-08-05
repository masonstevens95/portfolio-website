import { EmbeddedYardenKickstarter } from "../../components/projectEmbeds/EmbeddedYardenKickstarter";
import { EmbeddedYardenPreview } from "../../components/projectEmbeds/EmbeddedYardenPreview";
import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const YardenPage = () => {
  return (
    <ProjectPageTemplate
      title="Yarden.diy"
      subtitle="A web-based garden layout planner for nurseries and backyard designers"
    >
      <section className="w-full w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed">
        <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>
        <p>
          Yarden lets users design and share their own garden layouts using an
          intuitive drag-and-drop interface. The tool uses plant metadata to
          simulate growth, spacing, and care requirements over time.
        </p>

        <p>
          I launched a Kickstarter campaign to fund development. While it didn’t
          meet the goal, the experience taught me invaluable lessons about
          positioning, marketing, and audience engagement.
        </p>

        <p>
          Since then, I’ve pivoted Yarden into a product focused on nurseries
          and commercial clients. Below you can explore the original Kickstarter
          and the current live prototype.
        </p>
      </section>

      {/* Fullscreen responsive embedded live preview */}
      <div className="w-full mt-16">
        <h3 className="text-center text-2xl text-neutral-100 font-semibold mb-4">
          🪴 Live Preview
        </h3>
        <EmbeddedYardenPreview />
      </div>

      {/* Kickstarter embed */}
      <div className="w-full mt-16">
        <h3 className="text-center text-2xl text-neutral-100 font-semibold mb-4">
          📣 Kickstarter Campaign
        </h3>
        <EmbeddedYardenKickstarter />
      </div>
    </ProjectPageTemplate>
  );
};
