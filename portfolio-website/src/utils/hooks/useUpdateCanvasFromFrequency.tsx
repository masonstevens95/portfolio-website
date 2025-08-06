import React, { useEffect, useState } from "react";
import type { Plant } from "../../components/VoiceGarden/VoiceGarden";

export const useUpdateCanvasFromFrequency = (
  plants,
  frequencyData,
  canvasRef,
  setPlants
) => {
  //const [x, setX] = useState(0);

  useEffect(() => {
    if (!frequencyData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reset canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw existing plants
    plants.forEach((plant) => {
      ctx.beginPath();
      ctx.fillStyle = plant.color;
      ctx.arc(plant.x, plant.y, plant.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 🧠 Get average bass and treble
    const bass = frequencyData.slice(0, 10); // low bins
    const treble = frequencyData.slice(40); // high bins

    const avg = (arr: Float32Array) =>
      arr.reduce((sum, v) => sum + v, 0) / arr.length;

    const avgBass = avg(bass);
    const avgTreble = avg(treble);

    // 🎯 Trigger rule: if bass is loud, add a plant
    const bassThreshold = -45;
    const trebleThreshold = -60;

    if (avgBass > bassThreshold) {
      const newPlant: Plant = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 10 + 10 + (avgBass + 100) / 2, // louder = bigger
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        type: "leaf",
        growth: 1,
      };

      setPlants((prev) => [...prev.slice(-100), newPlant]); // keep max 100
    }

    // 🎯 Trigger rule: if treble is high, cluster upward
    if (avgTreble > trebleThreshold) {
      setPlants((prev) =>
        prev.map((p) => (Math.random() < 0.3 ? { ...p, y: p.y - 2 } : p))
      );
    }

    // 🎯 If very quiet = fade out scene
    const totalEnergy = avg(frequencyData);
    if (totalEnergy < -90) {
      setPlants(
        (prev) =>
          prev
            .map((p) => ({ ...p, size: Math.max(0, p.size - 0.1) }))
            .filter((p) => p.size > 0.5) // remove if too small
      );
    }
  }, [frequencyData]);

  //return scroll;
};
