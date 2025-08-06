import React, { useRef, useState } from "react";
import { floydSteinbergDither } from "../../utils/floydSteinbergDither";
import { findNearestNeighborPath } from "../../utils/findNearestNeighborPath";
import { exportCanvasAsPNG } from "../../utils/exportCanvasAsPng";

interface Props {}

export const SingleLineDrawer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [message, setMessage] = useState("Drop an image here...");
  const [loading, setLoading] = useState(false);

  const animatePath = (
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    index = 0
  ) => {
    if (index >= path.length - 1) {
      setLoading(false);
      setMessage("Done!");
      return;
    }

    const from = path[index];
    const to = path[index + 1];

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    requestAnimationFrame(() => animatePath(ctx, path, index + 1));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Loading...");

    try {
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        setMessage("Please drop an image file.");
        setLoading(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const original = ctx.getImageData(0, 0, img.width, img.height);

        // Convert to grayscale
        for (let i = 0; i < original.data.length; i += 4) {
          const avg =
            0.299 * original.data[i] +
            0.587 * original.data[i + 1] +
            0.114 * original.data[i + 2];
          original.data[i] = original.data[i + 1] = original.data[i + 2] = avg;
        }

        const dithered = floydSteinbergDither(original, 128);
        ctx.putImageData(dithered, 0, 0);
        setMessage("Dithering applied. Drawing...");
        setLoading(false);

        const path = findNearestNeighborPath(dithered);
        requestAnimationFrame(() => animatePath(ctx, path, 20));
      };

      img.src = URL.createObjectURL(file);
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
      setLoading(false);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-[70vh] border border-dashed border-neutral-700 rounded-xl relative"
    >
      {/* Header with message and export button */}
      <div className="absolute top-2 left-4 flex items-center gap-4 z-10">
        <div className="text-sm text-neutral-400 pointer-events-none">
          {message}
        </div>
        {/* <button
          onClick={() => exportCanvasAsPNG(canvasRef)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded shadow-md"
        >
          Export as PNG
        </button> */}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
        </div>
      )}

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
