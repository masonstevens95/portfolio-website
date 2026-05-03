import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { YardenPage } from "./pages/projectPages/YardenPage";
import { GaribaldiPage } from "./pages/projectPages/GaribaldiPage";
import { CalculatorsPage } from "./pages/projectPages/CalculatorsPage";
import { VoiceGardenPage } from "./pages/projectPages/VoiceGardenPage";
import { VicSavePage } from "./pages/projectPages/VicSavePage";
import { HortibasePage } from "./pages/projectPages/HortibasePage";
import { SingleLineDrawerPage } from "./pages/projectPages/SingleLineDrawerPage";

const CALCULATORS_BASE = "/projects/calculators";

function App() {
  const location = useLocation();
  // Keep CalculatorsPage mounted across tab switches under its base path
  // so React.lazy/Suspense state isn't reset on every tab click.
  const routeKey = location.pathname.startsWith(CALCULATORS_BASE)
    ? CALCULATORS_BASE
    : location.pathname;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects/yarden-diy" element={<YardenPage />} />
        <Route path="/projects/garibaldi" element={<GaribaldiPage />} />
        <Route
          path="/projects/calculators/*"
          element={<CalculatorsPage />}
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
