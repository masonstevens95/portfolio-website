import { useEffect, useRef } from "react";
import { useSpeechRecognition } from "../../utils/hooks/useSpeechRecognition";
import { useAudioFrequency } from "../../utils/hooks/useAudioFrequency";

interface Props {}

export const VoiceGarden = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { transcript, listening, startListening, stopListening } =
    useSpeechRecognition();

  const frequencyData = useAudioFrequency();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#34d399";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  return (
    <div className="w-full h-screen relative bg-neutral-900 text-white overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-4 max-w-sm">
        <p className="text-sm mb-2 text-neutral-300">🎙 Voice Input:</p>
        <pre className="text-xs text-green-300 whitespace-pre-wrap max-h-40 overflow-y-auto mb-3">
          {transcript || 'Say something, like "Draw a tree"'}
        </pre>

        <button
          onClick={listening ? stopListening : startListening}
          className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
            listening
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {listening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>

      {frequencyData && (
        <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-md text-xs text-green-300 max-w-sm">
          <p className="mb-1 text-white font-semibold">
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
