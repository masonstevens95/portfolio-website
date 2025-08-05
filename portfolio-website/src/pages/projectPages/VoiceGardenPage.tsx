import { VoiceGarden } from "../../components/VoiceGarden/VoiceGarden";
import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const VoiceGardenPage = () => (
  <ProjectPageTemplate
    title="Voice Garden"
    subtitle="An experimental audio-reactive garden layout generator using voice and sound frequencies"
  >
    <section className="w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed">
      <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>

      <p>
        <strong>Voice Garden</strong> is an experimental creative tool that
        interprets
        <em> voice commands </em> and <em>ambient sound waves</em> to generate
        spatial garden layouts. The goal is to explore an alternative, playful
        form of design input — using rhythm, tone, and language to drive visual
        structure.
      </p>

      <p>
        Under the hood, it uses the <strong>Web Audio API</strong> to capture
        microphone input and perform real-time{" "}
        <strong>Fourier Transforms</strong>. Frequency and amplitude data are
        mapped to layout decisions like plant type, size, density, and position.
      </p>

      <p>
        Spoken commands like “add a path” or “place a tree” are parsed using the
        <strong> Web Speech API</strong>, then executed as design actions. The
        result is a living garden interface shaped by sound, rhythm, and intent.
      </p>

      <p>
        Still in its early stages, the project is meant to explore creative
        accessibility and playful environmental design through input modalities
        other than the mouse.
      </p>

      {/* <div className="w-full max-w-3xl mx-auto mt-8">
        <img
          src="/assets/voice-garden.jpg"
          alt="Voice Garden concept image"
          className="w-full h-auto rounded-xl shadow-md mb-6"
        />

        <p className="text-sm text-neutral-500">
          Visualization mockup — plants clustered by bass, flowers aligned with
          higher frequencies, and layout punctuation created through spoken
          commands.
        </p>
      </div> */}

      <VoiceGarden />
    </section>
  </ProjectPageTemplate>
);
