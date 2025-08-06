// utils/hooks/useSpeechRecognition.ts
import { useEffect, useState, useRef } from "react";

export const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    console.log("recogniton");

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      const spokenText = lastResult[0].transcript.trim();
      console.log("recognition result", lastResult, spokenText);
      setTranscript((prev) => `${prev}\n${spokenText}`);
    };

    recognition.onerror = (event) => {
      console.error("SpeechRecognition error:", event.error);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      console.warn("SpeechRecognition not initialized yet.");
      return;
    }
    console.log("startListening called");
    recognitionRef.current?.start();
    setListening(true);
  };

  const stopListening = () => {
    console.log("stopListening called");
    recognitionRef.current?.stop();
    setListening(false);
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
  };
};
