// utils/image/floydSteinberg.ts

export const floydSteinbergDither = (
  imageData: ImageData,
  threshold = 128
): ImageData => {
  const { data, width, height } = imageData;
  const copy = new Uint8ClampedArray(data); // clone data to avoid mutation

  const getIndex = (x: number, y: number) => (y * width + x) * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y);
      const oldPixel = copy[idx]; // grayscale, assume R = G = B
      const newPixel = oldPixel > threshold ? 255 : 0;
      const error = oldPixel - newPixel;

      // Set new pixel value
      copy[idx] = copy[idx + 1] = copy[idx + 2] = newPixel;

      // Distribute error to neighboring pixels
      const distribute = (dx: number, dy: number, factor: number) => {
        const ni = getIndex(x + dx, y + dy);
        if (ni < 0 || ni >= copy.length) return;
        copy[ni] += error * factor;
        copy[ni + 1] += error * factor;
        copy[ni + 2] += error * factor;
      };

      distribute(1, 0, 7 / 16);
      distribute(-1, 1, 3 / 16);
      distribute(0, 1, 5 / 16);
      distribute(1, 1, 1 / 16);
    }
  }

  return new ImageData(copy, width, height);
};
