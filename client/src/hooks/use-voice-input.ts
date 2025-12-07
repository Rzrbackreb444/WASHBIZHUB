import { useState, useEffect, useCallback, useRef } from "react";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceInputError = 
  | "not-supported"
  | "permission-denied"
  | "no-speech"
  | "audio-capture"
  | "network"
  | "aborted"
  | "unknown";

interface UseVoiceInputOptions {
  onTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  onError?: (error: VoiceInputError, message: string) => void;
  language?: string;
  continuous?: boolean;
}

interface UseVoiceInputReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: VoiceInputError | null;
  errorMessage: string;
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onTranscript,
    onFinalTranscript,
    onError,
    language = "en-US",
    continuous = false,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<VoiceInputError | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const isSupported = typeof window !== "undefined" && 
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const getErrorType = useCallback((errorCode: string): VoiceInputError => {
    switch (errorCode) {
      case "not-allowed":
        return "permission-denied";
      case "no-speech":
        return "no-speech";
      case "audio-capture":
        return "audio-capture";
      case "network":
        return "network";
      case "aborted":
        return "aborted";
      default:
        return "unknown";
    }
  }, []);

  const getErrorMessage = useCallback((errorType: VoiceInputError): string => {
    switch (errorType) {
      case "not-supported":
        return "Voice input is not supported in this browser. Try Chrome, Safari, or Edge.";
      case "permission-denied":
        return "Microphone access was denied. Please allow microphone permissions and try again.";
      case "no-speech":
        return "No speech was detected. Please try speaking again.";
      case "audio-capture":
        return "No microphone was found. Please check your microphone connection.";
      case "network":
        return "Network error occurred. Please check your internet connection.";
      case "aborted":
        return "Voice input was cancelled.";
      default:
        return "An error occurred with voice input. Please try again.";
    }
  }, []);

  const initRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      isListeningRef.current = true;
      setError(null);
      setErrorMessage("");
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalText += transcriptText;
        } else {
          interimText += transcriptText;
        }
      }

      if (interimText) {
        setInterimTranscript(interimText);
        onTranscript?.(interimText);
      }

      if (finalText) {
        const normalizedText = normalizeErrorCodeSpelling(finalText);
        setTranscript((prev) => {
          const newTranscript = prev ? `${prev} ${normalizedText}` : normalizedText;
          return newTranscript.trim();
        });
        setInterimTranscript("");
        onFinalTranscript?.(normalizedText);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = getErrorType(event.error);
      const message = getErrorMessage(errorType);
      
      setError(errorType);
      setErrorMessage(message);
      setIsListening(false);
      isListeningRef.current = false;
      
      onError?.(errorType, message);
    };

    return recognition;
  }, [isSupported, continuous, language, onTranscript, onFinalTranscript, onError, getErrorType, getErrorMessage]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const errorType: VoiceInputError = "not-supported";
      const message = getErrorMessage(errorType);
      setError(errorType);
      setErrorMessage(message);
      onError?.(errorType, message);
      return;
    }

    if (isListeningRef.current) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      
      recognitionRef.current = initRecognition();
      recognitionRef.current?.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      const errorType: VoiceInputError = "unknown";
      const message = getErrorMessage(errorType);
      setError(errorType);
      setErrorMessage(message);
      onError?.(errorType, message);
    }
  }, [isSupported, initRecognition, getErrorMessage, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    setErrorMessage("");
  }, []);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
  };
}

function normalizeErrorCodeSpelling(text: string): string {
  let result = text;
  
  result = result.replace(/\bunderscore\b/gi, "_");
  result = result.replace(/\bdash\b/gi, "-");
  result = result.replace(/\bhyphen\b/gi, "-");
  result = result.replace(/\bspace\b/gi, " ");
  result = result.replace(/\bperiod\b/gi, ".");
  result = result.replace(/\bdot\b/gi, ".");
  
  result = result.replace(/\berror\s+/gi, "");
  result = result.replace(/\bcode\s+/gi, "");
  
  result = result.replace(/\bE\s*R\b/gi, "Er");
  result = result.replace(/\bD\s*L\b/gi, "dL");
  result = result.replace(/\bD\s*U\b/gi, "dU");
  result = result.replace(/\bN\s*F\b/gi, "nF");
  result = result.replace(/\bO\s*E\b/gi, "OE");
  result = result.replace(/\bL\s*E\b/gi, "LE");
  result = result.replace(/\bH\s*E\b/gi, "HE");
  result = result.replace(/\bA\s*F\b/gi, "AF");
  
  result = result.replace(/\bone\b/gi, "1");
  result = result.replace(/\btwo\b/gi, "2");
  result = result.replace(/\bthree\b/gi, "3");
  result = result.replace(/\bfour\b/gi, "4");
  result = result.replace(/\bfive\b/gi, "5");
  result = result.replace(/\bsix\b/gi, "6");
  result = result.replace(/\bseven\b/gi, "7");
  result = result.replace(/\beight\b/gi, "8");
  result = result.replace(/\bnine\b/gi, "9");
  result = result.replace(/\bzero\b/gi, "0");
  
  result = result.replace(/\s+/g, " ").trim();
  
  return result;
}
