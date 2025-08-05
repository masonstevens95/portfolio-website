import { ProjectPageTemplate } from "../ProjectPageTemplate";

export const GaribaldiPage = () => (
  <ProjectPageTemplate
    title="Garibaldi"
    subtitle="A modder-friendly save file visualizer and timeline explorer for Victoria 3"
  >
    <section className="w-full mx-auto px-4 text-neutral-300 space-y-6 text-lg leading-relaxed ">
      <h2 className="text-2xl font-bold text-neutral-100 mb-4">What It Is</h2>

      <p>
        <strong>Garibaldi</strong> is a work-in-progress web application
        designed to analyze and visualize save files from the grand strategy
        game <em>Victoria 3</em>, similar in spirit to{" "}
        <a
          href="https://www.skanderbeg.pm"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white"
        >
          Skanderbeg.pm
        </a>{" "}
        (for Europa Universalis IV).
      </p>

      <p>
        The goal is to make Victoria 3 data more approachable by allowing users
        to upload `.v3` files and browse through countries, populations,
        production data, and historical timelines through a rich, interactive
        UI.
      </p>

      <p>
        I'm building this primarily for players, roleplayers, and modders who
        want to explore or showcase save data without digging through raw files.
        Parsing and decoding Victoria 3's binary save format has been a core
        technical challenge — tackled with custom lexer logic written in
        TypeScript.
      </p>

      <p>
        You can follow the project and contribute on GitHub:
        <br />
        <a
          href="https://github.com/masonstevens95/Garibaldi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 underline hover:text-white"
        >
          github.com/masonstevens95/Garibaldi
        </a>
      </p>

      <div className="w-1/2 max-w-5xl mx-auto mt-8">
        <img
          src="/assets/garibaldi.jpg"
          alt="Garibaldi image"
          className="w-full h-auto rounded-xl shadow-md mb-6"
        />

        <p className="text-sm text-neutral-500">
          Fun fact: Garibaldi is named after Giuseppe Garibaldi — a key figure
          in the unification of Italy during the Victorian era. I thought it
          would be a cute shout out to the original Skanderbeg tool since
          Skanderbeg is a famous Albanian general in the timeline of Europa
          Universalis IV.
        </p>
      </div>
    </section>
  </ProjectPageTemplate>
);
