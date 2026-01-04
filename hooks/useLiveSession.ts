
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NATIVE BROWSER SPEECH IMPLEMENTATION
 * Removes dependency on Google Live API.
 * Uses:
 * 1. window.SpeechRecognition (Input)
 * 2. OpenRouter (Logic)
 * 3. window.speechSynthesis (Output)
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithAi } from '../services/ai';

export const useLiveSession = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0); 
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Volume Visualizer Logic
  const analyzeVolume = useCallback(() => {
    if (analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for(let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolume(Math.min(1, average / 50));
    }
    rafIdRef.current = requestAnimationFrame(analyzeVolume);
  }, []);

  const speakText = (text: string) => {
      setIsSpeaking(true);
      // Cancel any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
          setIsSpeaking(false);
          // Restart listening after speaking
          try {
              recognitionRef.current?.start();
          } catch(e) { /* ignore if already started */ }
      };

      utterance.onerror = () => {
          setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
  };

  const processInput = async (transcript: string) => {
      if (!transcript.trim()) return;
      
      try {
          // Stop listening while thinking
          recognitionRef.current?.stop();
          
          const response = await chatWithAi(
              [{ role: 'assistant', content: 'I am your voice assistant.', id: 'sys', timestamp: Date.now() }], 
              transcript,
              "You are a helpful medical voice assistant. Keep responses short, concise, and conversational (1-2 sentences)."
          );

          if (response.text) {
              speakText(response.text);
          }
      } catch (e) {
          console.error(e);
          speakText("I'm sorry, I'm having trouble connecting right now.");
      }
  };

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      // 1. Setup Audio Visualizer (Mic access)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      microphoneRef.current.connect(analyserRef.current);
      analyzeVolume();

      // 2. Setup Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
          throw new Error("Speech Recognition not supported in this browser.");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Stop after each sentence to process
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
          setIsConnected(true);
      };

      recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          console.log("Heard:", transcript);
          processInput(transcript);
      };

      recognition.onerror = (event: any) => {
          console.warn("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
              setError("Microphone access denied.");
              stopSession();
          }
      };

      recognition.onend = () => {
          // If we aren't speaking (AI response), restart listening
          if (!window.speechSynthesis.speaking && isConnected) {
              try {
                  recognition.start();
              } catch(e) { /* ignore */ }
          }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsConnected(true);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start audio session");
      stopSession();
    }
  }, [analyzeVolume]);

  const stopSession = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (recognitionRef.current) recognitionRef.current.stop();
    if (audioContextRef.current) audioContextRef.current.close();
    window.speechSynthesis.cancel();
    
    setIsConnected(false);
    setIsSpeaking(false);
    setVolume(0);
  }, []);

  return { isConnected, isSpeaking, volume, error, startSession, stopSession };
};
