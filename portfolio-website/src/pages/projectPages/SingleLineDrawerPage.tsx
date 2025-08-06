import { SingleLineDrawer } from "../../components/SingleLineDrawer/SingleLineDrawer";
import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const SingleLineDrawerPage = () => (
  <ProjectPageTemplate
    title="SingleLineDrawer"
    subtitle="Experimental line-based image tracing using error diffusion and nearest-neighbor paths"
  >
    <section className="w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>

      <p>
        <strong>SingleLineDrawer</strong> is a creative image processing tool
        that converts images into single-line vector-style paths using:
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>
          🖼 Grayscale conversion & Floyd–Steinberg dithering for stylized
          contrast
        </li>
        <li>
          🧭 Nearest-neighbor pathfinding to "walk" the darkest points in the
          image
        </li>
        <li>
          ✏️ Animated stroke rendering that mimics continuous line drawing
        </li>
      </ul>

      <p>
        It's inspired by pen plotters, minimalist vector art, and tools like
        <em> StippleGen</em> and <em>SquiggleDraw</em>.{" "}
        <strong>
          Try dragging an image onto the canvas below to get started.
        </strong>
      </p>

      <div className="mt-12 border border-neutral-700 rounded-xl overflow-hidden">
        <SingleLineDrawer />
      </div>
    </section>
  </ProjectPageTemplate>
);
