/*
  ProjectPageTemplate.tsx
*/

import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa6";

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const ProjectPageTemplate = ({ title, subtitle, children }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100 py-16 px-4 md:px-8">
      {/* Back to home button */}
      <div className="max-w-6xl mx-auto mb-8">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-sm font-medium"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Optional intro header */}
      {(title || subtitle) && (
        <div className="w-full mb-12 text-center px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-neutral-400">{subtitle}</p>
          )}
        </div>
      )}

      {/* Full-width container for content */}
      <div className="w-full flex flex-col gap-12">{children}</div>
    </div>
  );
};
