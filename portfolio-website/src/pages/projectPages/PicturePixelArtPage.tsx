import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const PicturePixelArtPage = () => (
  <ProjectPageTemplate
    title="Picture to Pixel Art"
    subtitle="A microfrontend that turns photos into pixel art"
  >
    <section className="w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>

      <p>
        <strong>Picture to Pixel Art</strong> is a small image-processing
        web app — drag in a photo, get back a pixel-art rendering with
        adjustable palette, scale, and dithering.
      </p>

      <p>
        It's built as a standalone Vite app and composed into this
        portfolio at runtime via Module Federation, the same pattern
        used for the Calculators project. There are no tabs here; the
        single mount is the whole tool.
      </p>

      <p className="text-sm text-neutral-500">
        Live demo coming soon — the remote isn't deployed yet. Once the
        URL is in, this page will mount the live tool in place of this
        notice.
      </p>
    </section>
  </ProjectPageTemplate>
);
