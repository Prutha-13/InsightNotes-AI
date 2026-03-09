"use client";

import { useState, useRef, useCallback } from "react";

interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isSupported: boolean;
  transcript: string;
  startRecording: () => void;
  stopRecording: () => void;
  clearTranscript: () => void;
}

export function useVoiceRecording(onTranscript: (text: string) => void): UseVoiceRecordingReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      const current = finalTranscript + interim;
      setTranscript(current);
      onTranscript(current);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript("");
    finalTranscript = "";
  }, [isSupported, onTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return { isRecording, isSupported, transcript, startRecording, stopRecording, clearTranscript };
}