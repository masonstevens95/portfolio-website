/*
  ProjectPageTemplate.tsx

  The shared broadside frame for every inner page. Themeing it once
  propagates to the projects index and all eleven project pages.
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";
import { DoubleRule, Rule } from "../components/broadside";

interface Props {
  title?: string;
  subtitle?: string;
  /** Where the sticky back button goes. Defaults to the home page. */
  backTo?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export const ProjectPageTemplate = ({
  title,
  subtitle,
  backTo = "/",
  backLabel = "Back to Home",
  children,
}: Props) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--stock)", color: "var(--ink)" }}
    >
      <div className="sticky top-0 z-50" style={{ background: "var(--stock)" }}>
        <div
          className="mx-auto px-4 sm:px-8 py-3"
          style={{ maxWidth: "var(--maxw)" }}
        >
          <button
            onClick={() => navigate(backTo)}
            className="label flex items-center gap-2 hover:underline"
          >
            <FaArrowLeft className="w-3 h-3" aria-hidden="true" />
            {backLabel}
          </button>
        </div>
        <Rule weight="heavy" />
      </div>

      <div
        className="mx-auto px-4 sm:px-8 pb-24"
        style={{ maxWidth: "var(--maxw)" }}
      >
        {(title || subtitle) && (
          <header className="pt-10 pb-6">
            <h1
              className="display m-0"
              style={{ fontSize: "clamp(36px, 8vw, 74px)" }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                className="label m-0 mt-3"
                style={{ fontSize: "12px", letterSpacing: "0.12em" }}
              >
                {subtitle}
              </p>
            )}
            <DoubleRule className="mt-5" />
          </header>
        )}

        <div className="w-full flex flex-col gap-10">{children}</div>
      </div>
    </div>
  );
};
