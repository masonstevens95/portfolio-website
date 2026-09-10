/*
  EmbeddedYardenPreview.tsx
*/

import { useState } from "react";
import { LoadingWaveform } from "../LoadingWaveform/LoadingWaveform";

export const EmbeddedYardenPreview = () => {
  const [loading, setLoading] = useState(true);

  return (
    <section className="w-full h-[70vh] my-12 relative overflow-hidden border border-[var(--ink)]">
      {/* Loader overlay */}
      {loading && <LoadingWaveform />}

      <iframe
        src="https://yarden.diy/"
        title="Yarden DIY App"
        className="w-full h-full"
        loading="lazy"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        onLoad={() => setLoading(false)}
      />
    </section>
  );
};
