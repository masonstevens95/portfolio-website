export const exportCanvasAsPNG = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = "single-line-drawing.png";
  a.click();
};
