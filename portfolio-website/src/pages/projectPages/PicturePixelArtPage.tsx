import { EmbeddedIframe } from "../../components/EmbeddedIframe";
import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const PicturePixelArtPage = () => (
  <ProjectPageTemplate
    title="Picture to Pixel Art"
    subtitle="A microfrontend that turns photos into pixel art"
  >
    <EmbeddedIframe
      src="https://picture-to-pixel-art.vercel.app/"
      title="Picture to Pixel Art (live demo)"
    />
  </ProjectPageTemplate>
);
