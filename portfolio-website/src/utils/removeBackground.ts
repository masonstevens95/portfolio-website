// utils/removeBackground.ts
import { removeBackground } from "@imgly/background-removal";

/**
 * Removes background from a File/Blob and returns a new HTMLImageElement.
 */
export async function removeBackgroundFromFile(
  file: File | Blob
): Promise<HTMLImageElement> {
  // Library accepts a Blob directly
  const resultBlob = await removeBackground(file);

  // convert the PNG blob into <img> so we can draw it back onto <canvas>
  const resultImg = await new Promise<HTMLImageElement>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = URL.createObjectURL(resultBlob);
  });

  return resultImg;
}
