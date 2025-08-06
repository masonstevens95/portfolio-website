export const convertToGoFigureFormat = (
  path: { x: number; y: number }[],
  id = 1
) => {
  const startTime = 0;
  const deltaTime = 0.01; // adjust as needed

  const points = path.map((pt, index) => ({
    x: pt.x,
    y: pt.y,
    time: parseFloat((startTime + index * deltaTime).toFixed(4)),
  }));

  return {
    id,
    points,
    drawVectors: {
      calculated: [], // fill if you plan to apply Fourier transforms
    },
    dateCreated: new Date().toISOString(),
  };
};
