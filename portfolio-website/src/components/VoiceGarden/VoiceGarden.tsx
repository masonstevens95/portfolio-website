import { useEffect, useRef, useState } from "react";
import { useSpeechRecognition } from "../../utils/hooks/useSpeechRecognition";
import { useAudioFrequency } from "../../utils/hooks/useAudioFrequency";
import { drawPlant } from "../../utils/drawPlant";
import { useUpdateCanvasFromFrequency } from "../../utils/hooks/useUpdateCanvasFromFrequency";
import { useInitializeCanvasBackground } from "../../utils/hooks/useInitializeCanvasBackground";
import { useAnimateGardenFromFrequency } from "../../utils/hooks/useAnimateGardenFromFrequency";
import { useUpdateGardenFromFrequency } from "../../utils/hooks/useUpdateGardenFromFrequency";

export type Plant = {
  x: number;
  y: number;
  size: number;
  type: "leaf" | "bush" | "flower";
  color: string;
  growth: number; // 0–1 (animated grow-in)
  dx?: number; // animation offset X
  dy?: number; // animation offset Y
};

interface Props {}

export const VoiceGarden = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { transcript, listening, startListening, stopListening } =
    useSpeechRecognition();

  const { frequencyData, freqRef } = useAudioFrequency(listening);

  useInitializeCanvasBackground(canvasRef);

  useUpdateGardenFromFrequency(canvasRef, frequencyData, freqRef);

  return (
    <div className="w-full h-screen relative bg-[var(--stock)] text-[var(--ink)] overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-[var(--stock)] p-4 max-w-sm">
        <p className="text-sm mb-2 text-[var(--ink)]">🎙 Voice Input:</p>
        <pre className="text-xs text-[var(--spruce)] whitespace-pre-wrap max-h-40 overflow-y-auto mb-3">
          {transcript || 'Say something, like "Draw a tree"'}
        </pre>

        <button
          onClick={listening ? stopListening : startListening}
          className={`px-4 py-1 text-sm font-medium transition-colors ${
            listening
              ? "bg-[var(--ink)] hover:opacity-80"
              : "bg-[var(--spruce)] hover:opacity-80"
          }`}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>

      {frequencyData && (
        <div className="absolute bottom-4 left-4 bg-[var(--stock)] p-3 text-xs text-[var(--spruce)] max-w-sm">
          <p className="mb-1 text-[var(--ink)] font-semibold">
            🎚 //todo only listen while recording Frequency Snapshot
          </p>
          <div className="overflow-x-auto whitespace-nowrap max-w-full">
            {Array.from(frequencyData)
              .slice(0, 32)
              .map((v, i) => (
                <span key={i} className="inline-block w-6 text-center">
                  {Math.round(v)}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
