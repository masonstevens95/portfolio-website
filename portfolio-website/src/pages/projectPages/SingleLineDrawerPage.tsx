import { SingleLineDrawer } from "../../components/SingleLineDrawer/SingleLineDrawer";
import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const SingleLineDrawerPage = () => (
  <ProjectPageTemplate
    title="SingleLineDrawer"
    subtitle="Experimental tool for background removal, edge detection, and animated outline drawing"
  >
    <section className="w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>

      <p>
        <strong>SingleLineDrawer</strong> is a creative image processing tool
        that transforms photos into continuous line-style sketches by combining
        modern computer vision with generative art techniques:
      </p>

      <ul className="list-disc list-inside space-y-2">
        <li>🧹 Background removal to isolate the subject</li>
        <li>
          📐 Edge detection with TensorFlow + marching squares contour tracing
        </li>
        <li>✏️ Animated outline rendering that mimics hand-drawn line art</li>
        <li>
          🎚 Adjustable edge sensitivity (threshold slider) for fine-tuned
          results
        </li>
      </ul>

      <p>
        It’s inspired by pen plotters, continuous line art, and generative
        design tools.{" "}
        <strong>
          Drag and drop an image onto the canvas below to experiment with your
          own sketches.
        </strong>
      </p>

      <div className="mt-12 border border-neutral-700 rounded-xl overflow-hidden">
        <SingleLineDrawer />
      </div>
    </section>
  </ProjectPageTemplate>
);
