import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { ProjectsIndexPage } from "./pages/ProjectsIndexPage";
import { YardenPage } from "./pages/projectPages/YardenPage";
import { GaribaldiPage } from "./pages/projectPages/GaribaldiPage";
import { CalculatorsPage } from "./pages/projectPages/CalculatorsPage";
import { VespucciPage } from "./pages/projectPages/VespucciPage";
import { GuadalcanalPage } from "./pages/projectPages/GuadalcanalPage";
import { PrReaderPage } from "./pages/projectPages/PrReaderPage";
import { VoiceGardenPage } from "./pages/projectPages/VoiceGardenPage";
import { VicSavePage } from "./pages/projectPages/VicSavePage";
import { HortibasePage } from "./pages/projectPages/HortibasePage";
import { SingleLineDrawerPage } from "./pages/projectPages/SingleLineDrawerPage";

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsIndexPage />} />
        <Route path="/projects/yarden-diy" element={<YardenPage />} />
        <Route path="/projects/garibaldi" element={<GaribaldiPage />} />
        <Route
          path="/projects/calculators/*"
          element={<CalculatorsPage />}
        />
        <Route path="/projects/vespucci" element={<VespucciPage />} />
        <Route path="/projects/guadalcanal" element={<GuadalcanalPage />} />
        <Route
          path="/projects/pr-reader-vscode"
          element={<PrReaderPage />}
        />
        <Route path="/projects/voice-garden" element={<VoiceGardenPage />} />
        <Route path="/projects/vicsave-compiler" element={<VicSavePage />} />
        <Route path="/projects/hortibase" element={<HortibasePage />} />
        <Route
          path="/projects/single-line-drawer"
          element={<SingleLineDrawerPage />}
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
