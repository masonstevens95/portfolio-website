import { NavLink, Routes, Route } from "react-router-dom";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { RemoteTab } from "./calculators/RemoteTab";
import { calculatorTabs } from "./calculators/tabs";

export const CalculatorsPage = () => (
  <ProjectPageTemplate
    title="Calculators"
    subtitle="A standalone calculators app composed into this portfolio at runtime via Module Federation."
  >
    <nav
      aria-label="Calculator tabs"
      className="flex flex-wrap gap-2 border-b border-neutral-700 pb-2 max-w-6xl mx-auto w-full px-4"
    >
      {calculatorTabs.map((tab) => (
        <NavLink
          key={tab.slug || "overview"}
          to={tab.slug}
          end={tab.slug === ""}
          className={({ isActive }) =>
            `px-3 py-2 rounded-t text-sm transition-colors ${
              isActive
                ? "bg-neutral-800 text-white"
                : "text-neutral-400 hover:text-white"
            }`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>

    <div className="w-full max-w-6xl mx-auto px-4">
      <Routes>
        {calculatorTabs.map((tab) => (
          <Route
            key={tab.slug || "overview"}
            path={tab.slug || "/"}
            element={<RemoteTab importer={tab.importer} />}
          />
        ))}
      </Routes>
    </div>
  </ProjectPageTemplate>
);
