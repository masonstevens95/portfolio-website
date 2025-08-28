import React, { useEffect, useRef, useState } from "react";
import { exportCanvasAsPNG } from "../../utils/exportCanvasAsPng";
import { removeBackgroundFromFile } from "../../utils/removeBackground";
import { detectEdgesWithTF } from "../../utils/detectEdgesWithTF";
import { traceContour } from "../../utils/marchingSquares";
import {
  marchingSquares,
  pickLargestContour,
  simplifyPath,
} from "../../utils/contourUtils";
import { marchingSquaresLinked, toBinary } from "../../utils/outline";

// import cv from "opencv.js";

export const SingleLineDrawer = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const naturalSize = useRef({ w: 0, h: 0 });

  function fitCanvasToContainer() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !naturalSize.current.w) return;

    const { w, h } = naturalSize.current;
    const { width: cw, height: ch } = container.getBoundingClientRect();

    const scale = Math.min(cw / w, ch / h); // contain
    const cssW = Math.max(1, Math.floor(w * scale));
    const cssH = Math.max(1, Math.floor(h * scale));

    // Only CSS size (visual). Keeps aspect ratio, no distortion.
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
  }

  useEffect(() => {
    const ro = new ResizeObserver(() => fitCanvasToContainer());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const [message, setMessage] = useState("Drop an image here...");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [edgeThreshold, setEdgeThreshold] = useState(85);
  const [edgeThresholdChanged, setEdgeThresholdChanged] = useState(false);

  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(
    null
  );
  const [bgRemovedData, setBgRemovedData] = useState<ImageData | null>(null);

  const [outlinePath, setOutlinePath] = useState<
    { x: number; y: number }[] | null
  >(null);

  const MAX_FILE_SIZE_MB = 1;
  const MAX_DIMENSION = 2000;

  // --------- HANDLE DROPPED IMAGE ----------
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Loading image...");

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
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      let { width, height } = img;
      // resize if needed
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ar = width / height;
        if (width > height) {
          width = MAX_DIMENSION;
          height = Math.round(MAX_DIMENSION / ar);
        } else {
          height = MAX_DIMENSION;
          width = Math.round(MAX_DIMENSION * ar);
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      naturalSize.current = { w: width, h: height };
      fitCanvasToContainer(); // <- ensure it fits visibly

      const id = ctx.getImageData(0, 0, width, height);
      setOriginalImageData(id);
      setMessage("Image loaded. Click 'Remove Background'.");
      setStep(0);
      setLoading(false);
    };
    img.src = URL.createObjectURL(file);
  };

  // -------- BACKGROUND REMOVAL --------
  const removeBgStep = async () => {
    if (!originalImageData) return;
    setLoading(true);
    setMessage("Removing background...");

    const canvas = canvasRef.current!;
    const blob: Blob = await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject()), "image/png")
    );

    const cleanedImg = await removeBackgroundFromFile(blob);
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#fff"; // white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cleanedImg, 0, 0);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setBgRemovedData(id);
    setOriginalImageData(id);
    setMessage("Background removed. Click 'Detect Outline'.");
    setStep(1);
    setLoading(false);

    // setEdgeThresholdChanged(false);
  };

  // ---- Step: Detect + Extract Outline ----
  const detectOutline = async () => {
    if (!originalImageData) return;
    setMessage("Detecting outline...");
    setLoading(true);

    // 1) edges via TF (returns ImageData where edges are bright)
    const edgeImg = await detectEdgesWithTF(originalImageData, edgeThreshold); // tweak threshold if needed

    // 2) binarize (ensure crisp 0/1)
    const binary = toBinary(edgeImg, 128);

    // 3) marching squares + stitch to polylines
    const contours = marchingSquaresLinked(
      binary,
      edgeImg.width,
      edgeImg.height
    );

    if (!contours.length) {
      setLoading(false);
      setMessage("No contours found.");
      return;
    }

    // 4) pick largest + simplify
    const largest = pickLargestContour(contours);
    const simplified = simplifyPath(largest, 1);

    setOutlinePath(simplified);
    setStep(2.5);
    setLoading(false);
    setMessage("Outline detected. Click 'Animate Path'.");

    // preview
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.strokeStyle = "#ff5252";
      ctx.lineWidth = 1;
      ctx.beginPath();
      simplified.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
      );
      ctx.stroke();
    }
  };

  // ---- Step: Animate the outline ----
  const animateOutline = () => {
    if (!outlinePath) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
    setLoading(true);
    animatePath(ctx, outlinePath, 0, 1);
  };

  // -------- ANIMATE --------
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

  const resetImage = () => {
    setLoading(false);
    setMessage("Drop an image here...");
    setStep(0);
    setOriginalImageData(null);
    setBgRemovedData(null);
    setOutlinePath(null);

    // Clear the canvas pixels
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      canvas.width = 0; // optionally reset dimensions
      canvas.height = 0;
      canvas.style.width = "0px";
      canvas.style.height = "0px";
    }

    naturalSize.current = { w: 0, h: 0 };
  };

  useEffect(() => {
    if (step != 0) {
      setStep(1);
    }
  }, [edgeThreshold]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full h-[70vh] border border-dashed border-neutral-700 rounded-xl relative flex flex-col"
    >
      <div className="flex items-center gap-4 p-2 bg-neutral-800 text-neutral-200">
        <div>{message}</div>
        <div className="flex items-center gap-2 px-3">
          <label htmlFor="threshold" className="text-sm text-neutral-300">
            Threshold: {edgeThreshold}
          </label>
          <input
            id="threshold"
            type="range"
            min={0}
            max={255}
            value={edgeThreshold}
            onChange={(e) => setEdgeThreshold(Number(e.target.value))}
            className="w-32"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 p-2 bg-neutral-800 text-neutral-200">
        <button
          onClick={resetImage}
          disabled={!originalImageData}
          className="bg-sky-800 px-3 py-1 rounded disabled:bg-neutral-500"
        >
          Reset Image
        </button>
        <button
          onClick={removeBgStep}
          disabled={!originalImageData || step >= 1}
          className="bg-red-600 px-3 py-1 rounded disabled:bg-neutral-500"
        >
          Remove BG
        </button>
        <button
          onClick={detectOutline}
          disabled={step < 1 || step >= 2}
          className="bg-blue-600 px-3 py-1 rounded disabled:bg-neutral-500"
        >
          Detect Outline
        </button>
        <button
          onClick={animateOutline}
          disabled={outlinePath == null}
          className="bg-green-600 px-3 py-1 rounded disabled:bg-neutral-500"
        >
          Animate
        </button>
        <button
          onClick={() => exportCanvasAsPNG(canvasRef.current)}
          disabled={!originalImageData}
          className="bg-gray-700 px-3 py-1 rounded"
        >
          Export PNG
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center bg-black overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
          </div>
        )}
        <canvas ref={canvasRef} className="block" />
      </div>
    </div>
  );
};
