import { useEffect, useRef, useState } from "react";

export const useAudioFrequency = () => {
  const [frequencyData, setFrequencyData] = useState<Float32Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaStreamAudioSourceNode;

    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new AudioContext();
      analyser = audioCtx.createAnalyser();

      analyser.fftSize = 256; // resolution of frequency bins (128 samples)
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const update = () => {
        analyser.getFloatFrequencyData(dataArray);
        setFrequencyData(new Float32Array(dataArray)); // clone so it doesn't mutate
        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    };

    init();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      audioCtx?.close();
    };
  }, []);

  return frequencyData;
};
