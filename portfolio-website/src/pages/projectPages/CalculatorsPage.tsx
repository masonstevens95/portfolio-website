import { NavLink, Navigate, Routes, Route } from "react-router-dom";
import { EmbeddedIframe } from "../../components/EmbeddedIframe";
import { ProjectPageTemplate } from "../ProjectPageTemplate";
import { RemoteTab } from "./calculators/RemoteTab";
import { calculatorTabs } from "./calculators/tabs";

const BASE_PATH = "/projects/calculators";
const defaultTabSlug = calculatorTabs[0].slug;

export const CalculatorsPage = () => (
  <ProjectPageTemplate
    title="Calculators"
    subtitle="A standalone calculators app composed into this portfolio at runtime via Module Federation."
  >
    <div className="w-full flex flex-col">
      <nav
        aria-label="Calculator tabs"
        className="flex flex-wrap gap-2 border-b border-[var(--ink)] pb-2 max-w-6xl mx-auto w-full px-4"
      >
        {calculatorTabs.map((tab) => (
          <NavLink
            key={tab.slug}
            to={`${BASE_PATH}/${tab.slug}`}
            className={({ isActive }) =>
              `px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-[var(--ink)] text-[var(--stock)]"
                  : "text-[var(--ink)] hover:text-[var(--spruce)]"
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="w-full max-w-6xl mx-auto px-4 pt-6">
        <Routes>
          <Route
            index
            element={<Navigate to={`${BASE_PATH}/${defaultTabSlug}`} replace />}
          />
          {calculatorTabs.map((tab) => (
            <Route
              key={tab.slug}
              path={tab.slug}
              element={
                tab.kind === "iframe" ? (
                  <EmbeddedIframe
                    src={tab.src}
                    title="Calculators (live demo)"
                  />
                ) : (
                  <RemoteTab importer={tab.importer} />
                )
              }
            />
          ))}
        </Routes>
      </div>
    </div>
  </ProjectPageTemplate>
);
