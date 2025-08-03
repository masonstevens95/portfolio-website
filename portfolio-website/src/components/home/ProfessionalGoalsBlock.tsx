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
        <div className="max-w-6xl w-full bg-black/30 backdrop-blur-md rounded-xl p-6 shadow-xl">
          <h1 className="text-4xl text-center font-bold text-neutral-100 mb-8">
            Where I'm Headed
          </h1>
          <Chrono
            items={goalsTimeline}
            mode="HORIZONTAL"
            timelinePointShape="diamond"
            theme={{
              primary: "#3b82f6", // Tailwind blue-500
              secondary: "#111827", // Tailwind gray-900
              cardBgColor: "#1f2937", // Tailwind gray-800
              cardForeColor: "#f9fafb", // Tailwind gray-50
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
