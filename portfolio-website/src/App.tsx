import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { InfiniteScrollContainer } from "./components/InfiniteScrollContainer";
import { PageWrapper } from "./components/PageWrapper";

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
        <Route
          path="/"
          element={
            <>
              <Header />
              <InfiniteScrollContainer />
            </>
          }
        />
        <Route path="/projects/garden-planner" element={<GardenPlanner />} />
        <Route path="/projects/plant-library" element={<PlantLibrary />} />
        <Route path="/projects/water-tracker" element={<WaterTracker />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
