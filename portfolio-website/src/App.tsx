import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/home/Header";
import { InfiniteScrollContainer } from "./components/home/InfiniteScrollContainer";
import { PageWrapper } from "./components/PageWrapper";
import { HomePage } from "./pages/HomePage";
import { YardenPage } from "./pages/YardenPage";
import { GaribaldiPage } from "./pages/GaribaldiPage";
import { VoiceGardenPage } from "./pages/VoiceGardenPage";
import { VicSavePage } from "./pages/VicSavePage";
import { HortibasePage } from "./pages/HortibasePage";

const GardenPlanner = () => (
  <PageWrapper>
    <div className="p-10 text-white">Garden Planner Page</div>
  </PageWrapper>
);
const PlantLibrary = () => (
  <PageWrapper>
    <div className="p-10 text-white">Plant Library Page</div>
  </PageWrapper>
);
const WaterTracker = () => (
  <PageWrapper>
    <div className="p-10 text-white">Water Tracker Page</div>
  </PageWrapper>
);

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/yarden-diy" element={<YardenPage />} />
        <Route path="/projects/garibaldi" element={<GaribaldiPage />} />
        <Route path="/projects/voice-garden" element={<VoiceGardenPage />} />
        <Route path="/projects/vicsave-compiler" element={<VicSavePage />} />
        <Route path="/projects/hortibase" element={<HortibasePage />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
