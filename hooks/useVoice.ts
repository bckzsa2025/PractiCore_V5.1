
import { useState, useEffect, useCallback, useRef } from 'react';

export const useVoice = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [playbackState, setPlaybackState] = useState<'playing' | 'paused' | 'stopped'>('stopped');
  const [currentText, setCurrentText] = useState('');
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getFemaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Try to find a natural sounding female voice
    return voices.find(v => 
      (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Microsoft Zira')) && 
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));
  };

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setPlaybackState('stopped');
  }, []);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setPlaybackState('paused');
  }, []);

  const resume = useCallback(() => {
    if (playbackState === 'paused') {
      window.speechSynthesis.resume();
      setPlaybackState('playing');
    }
  }, [playbackState]);

  const speak = useCallback((text: string) => {
    if (isMuted || !text) return;

    stop();
    setCurrentText(text);

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getFemaleVoice();
    if (voice) utterance.voice = voice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher for a friendly female tone

    utterance.onstart = () => setPlaybackState('playing');
    utterance.onend = () => setPlaybackState('stopped');
    utterance.onerror = () => setPlaybackState('stopped');

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isMuted, stop]);

  const restart = useCallback(() => {
    if (currentText) {
      speak(currentText);
    }
  }, [currentText, speak]);

  // Handle voice list loading (sometimes async)
  useEffect(() => {
    window.speechSynthesis.getVoices();
    const handleVoicesChanged = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    restart,
    isMuted,
    setIsMuted,
    playbackState
  };
};
