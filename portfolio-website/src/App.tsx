import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HomePage } from "./pages/HomePage";
import { YardenPage } from "./pages/projectPages/YardenPage";
import { GaribaldiPage } from "./pages/projectPages/GaribaldiPage";
import { VoiceGardenPage } from "./pages/projectPages/VoiceGardenPage";
import { VicSavePage } from "./pages/projectPages/VicSavePage";
import { HortibasePage } from "./pages/projectPages/HortibasePage";
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
