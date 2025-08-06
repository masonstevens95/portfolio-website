export const drawPlant = (ctx: CanvasRenderingContext2D, plant) => {
  ctx.save();
  ctx.translate(plant.x, plant.y);
  ctx.scale(plant.growth, plant.growth);
  ctx.fillStyle = plant.color;

  switch (plant.type) {
    case "leaf":
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        plant.size,
        plant.size / 2,
        Math.PI / 4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      break;

    case "bush":
      ctx.beginPath();
      ctx.arc(0, 0, plant.size, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "flower":
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI) / 3;
        ctx.ellipse(
          Math.cos(angle) * plant.size * 0.6,
          Math.sin(angle) * plant.size * 0.6,
          plant.size / 2,
          plant.size / 2.5,
          angle,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      // center
      ctx.beginPath();
      ctx.fillStyle = "#fcd34d";
      ctx.arc(0, 0, plant.size / 3, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
};
