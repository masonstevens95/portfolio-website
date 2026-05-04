interface Props {
  src: string;
}

export function IframeTab({ src }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-end mb-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-400 hover:text-white transition-colors"
        >
          Open in new tab ↗
        </a>
      </div>
      <iframe
        src={src}
        title="Calculators (live demo)"
        loading="lazy"
        className="w-full h-[calc(100vh-280px)] min-h-[500px] bg-neutral-950 border border-neutral-700 rounded-lg"
      />
    </div>
  );
}
