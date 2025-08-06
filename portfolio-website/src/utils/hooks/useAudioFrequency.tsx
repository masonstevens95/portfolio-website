import { useEffect, useRef, useState } from "react";

export const useAudioFrequency = (listening: boolean) => {
  const [frequencyData, setFrequencyData] = useState<Float32Array | null>(null);
  const freqRef = useRef<Float32Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let analyser: AnalyserNode;
    let source: MediaStreamAudioSourceNode;

    const startAudio = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const analyserNode = audioCtx.createAnalyser();
      analyserNode.fftSize = 256;

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);

      const mediaSource = audioCtx.createMediaStreamSource(stream);
      mediaSource.connect(analyserNode);

      const update = () => {
        analyserNode.getFloatFrequencyData(dataArray);
        freqRef.current = new Float32Array(dataArray);
        setFrequencyData(freqRef.current);
        animationFrameRef.current = requestAnimationFrame(update);
      };

      audioCtxRef.current = audioCtx;
      streamRef.current = stream;
      analyser = analyserNode;
      source = mediaSource;

      update();
    };

    const stopAudio = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      audioCtxRef.current?.close();
      audioCtxRef.current = null;

      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;

      setFrequencyData(null);
      freqRef.current = null;
    };

    if (listening) {
      startAudio();
    } else {
      stopAudio();
    }

    return () => stopAudio();
  }, [listening]);

  return { frequencyData, freqRef };
};
