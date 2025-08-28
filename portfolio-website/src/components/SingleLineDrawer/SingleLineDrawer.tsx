import React, { useRef, useState } from "react";
import { floydSteinbergDither } from "../../utils/floydSteinbergDither";
import { findNearestNeighborPath } from "../../utils/findNearestNeighborPath";
import { exportCanvasAsPNG } from "../../utils/exportCanvasAsPng";
import { removeBackgroundFromFile } from "../../utils/removeBackground";

interface Props {}

export const SingleLineDrawer = ({}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [message, setMessage] = useState("Drop an image here...");
  const [loading, setLoading] = useState(false);

  // Store image data for step-by-step processing
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null
  );
  const [grayscaleData, setGrayscaleData] = useState<ImageData | null>(null);
  const [ditheredData, setDitheredData] = useState<ImageData | null>(null);

  const [step, setStep] = useState(0); // 0 = no image, 1 = grayscale done, 2 = dithering done

  const [bgRemovedData, setBgRemovedData] = useState<ImageData | null>(null);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_DIMENSION = 2000;

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Loading image...");

    try {
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith("image/")) {
        setMessage("Please drop an image file.");
        setLoading(false);
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setMessage(`File too large. Max size is ${MAX_FILE_SIZE_MB} MB.`);
        setLoading(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const aspectRatio = width / height;
          if (width > height) {
            width = MAX_DIMENSION;
            height = Math.round(MAX_DIMENSION / aspectRatio);
          } else {
            height = MAX_DIMENSION;
            width = Math.round(MAX_DIMENSION * aspectRatio);
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        setOriginalImageData(imageData);
        setStep(0);
        setMessage("Image loaded. Click 'Convert to Grayscale'.");
        setLoading(false);
      };

      img.src = URL.createObjectURL(file);
    } catch (err) {
      console.error(err);
      setMessage("An error occurred.");
      setLoading(false);
    }
  };

  const removeBgStep = async () => {
    if (!originalImageData) return;

    setLoading(true);
    setMessage("Removing background...");

    // Convert current canvas data back into a Blob so we can feed it to imgly
    const canvas = canvasRef.current;
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas?.toBlob((b) => (b ? resolve(b) : reject()), "image/png")
    );

    const cleanedImg = await removeBackgroundFromFile(blob);

    // Draw result back to canvas
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      canvas.width = cleanedImg.width;
      canvas.height = cleanedImg.height;
      ctx.drawImage(cleanedImg, 0, 0);
      const id = ctx.getImageData(0, 0, cleanedImg.width, cleanedImg.height);
      setBgRemovedData(id);
      setOriginalImageData(id);
      setStep(0.75);
      setMessage("Background removed. Click 'Grayscale'.");
    }
    setLoading(false);
  };

  const convertToGrayscale = () => {
    if (!originalImageData) return;
    const gray = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      originalImageData.width,
      originalImageData.height
    );

    for (let i = 0; i < gray.data.length; i += 4) {
      const avg =
        0.299 * gray.data[i] +
        0.587 * gray.data[i + 1] +
        0.114 * gray.data[i + 2];
      gray.data[i] = gray.data[i + 1] = gray.data[i + 2] = avg;
    }

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.putImageData(gray, 0, 0);

    setGrayscaleData(gray);
    setStep(1);
    setMessage("Grayscale done. Click 'Apply Dithering'.");
  };

  const applyDithering = () => {
    if (!grayscaleData) return;
    const dithered = floydSteinbergDither(grayscaleData, 128);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.putImageData(dithered, 0, 0);

    setDitheredData(dithered);
    setStep(2);
    setMessage("Dithering done. Click 'Find Path & Animate'.");
  };

  const findPathAndAnimate = () => {
    if (!ditheredData) return;
    const path = findNearestNeighborPath(ditheredData);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setLoading(true);
    animatePath(ctx, path, 0, 50);
  };

  const animatePath = (
    ctx: CanvasRenderingContext2D,
    path: { x: number; y: number }[],
    index = 0,
    speed = 1
  ) => {
    if (index >= path.length - 1) {
      setLoading(false);
      setMessage("Done!");
      return;
    }

    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 1.5;

    for (let i = 0; i < speed && index + i < path.length - 1; i++) {
      const from = path[index + i];
      const to = path[index + i + 1];
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }

    requestAnimationFrame(() => animatePath(ctx, path, index + speed, speed));
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-[70vh] border border-dashed border-neutral-700 rounded-xl relative flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 p-2 bg-neutral-800 text-neutral-200">
        <div>{message}</div>
        <button
          onClick={removeBgStep}
          disabled={!originalImageData || step >= 0.5}
          className="px-3 py-1 rounded bg-red-600 disabled:bg-neutral-400"
        >
          Remove Background
        </button>
        <button
          onClick={convertToGrayscale}
          disabled={step < 0.5 || step >= 1}
          className="px-3 py-1 rounded bg-blue-600 disabled:bg-neutral-400"
        >
          Grayscale
        </button>

        <button
          onClick={applyDithering}
          disabled={step < 1 || step >= 2}
          className="px-3 py-1 rounded bg-purple-600 disabled:bg-neutral-400"
        >
          Dither
        </button>
        <button
          onClick={findPathAndAnimate}
          disabled={step < 2}
          className="px-3 py-1 rounded bg-green-600 disabled:bg-neutral-400"
        >
          Animate Path
        </button>
        <button
          onClick={() => exportCanvasAsPNG(canvasRef)}
          disabled={!originalImageData}
          className="px-3 py-1 rounded bg-gray-700"
        >
          Export PNG
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
