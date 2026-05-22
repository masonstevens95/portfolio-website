import { ParallaxLayer } from "@react-spring/parallax";
import { Chrono } from "react-chrono";

interface Props {
  offset: number;
  speed: number;
  factor: number;
}

const goalsTimeline = [
  {
    title: "🌱 Spatial Tools",
    cardTitle: "Design for Nature",
    cardSubtitle: "2024–present",
    cardDetailedText:
      "Building intelligent, interactive tools for gardens and outdoor environments.",
  },
  {
    title: "🧠 AI-Assisted Design",
    cardTitle: "Climate-Aware Systems",
    cardSubtitle: "Future Focus",
    cardDetailedText:
      "Leveraging AI/ML to create more sustainable, climate-conscious design processes.",
  },
  {
    title: "🛠 Visual Interfaces",
    cardTitle: "Accessible Design",
    cardDetailedText:
      "Developing intuitive, visual tools for non-technical users to engage with spatial data.",
  },
  {
    title: "🤝 Collaboration",
    cardTitle: "Mission-Driven Projects",
    cardDetailedText:
      "Joining forces with others working at the intersection of environment and tech.",
  },
];

export const ProfessionalGoalsBlock = ({ offset, speed, factor }: Props) => {
  return (
    <ParallaxLayer
      aria-description="Professional goals and aspirations section"
      offset={offset}
      speed={speed}
      factor={factor}
    >
      <div className="w-full h-full flex items-center justify-center px-6">
        <div className="max-w-6xl w-full bg-[var(--orchard-bark)]/45 backdrop-blur-md border border-[var(--orchard-honey)]/15 rounded-xl p-6 shadow-xl">
          <h1 className="text-4xl text-center font-bold text-[var(--orchard-cream)] mb-8">
            Where I'm Headed
          </h1>
          <Chrono
            items={goalsTimeline}
            mode="HORIZONTAL"
            timelinePointShape="diamond"
            theme={{
              primary: "#d8a850", // orchard-honey
              secondary: "#1f2a1f", // orchard-bark
              cardBgColor: "#3a4a2c", // orchard-moss
              cardForeColor: "#e8d8a8", // orchard-cream
            }}
            cardHeight={400}
            slideShow={false}
            disableToolbar={true}
          />
        </div>
      </div>
    </ParallaxLayer>
  );
};
