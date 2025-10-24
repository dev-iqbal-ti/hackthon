// frontend/src/hooks/useSpeechSynthesis.js
// This uses browser's native Speech Synthesis API (works without backend)
import { useState, useEffect, useRef } from "react";

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef(null);

  useEffect(() => {
    // Check browser support
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Set default English voice
      const defaultVoice =
        availableVoices.find(
          (voice) => voice.lang.startsWith("en") && voice.default
        ) ||
        availableVoices.find((voice) => voice.lang.startsWith("en")) ||
        availableVoices[0];

      setSelectedVoice(defaultVoice);
    };

    loadVoices();

    // Some browsers load voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = (text, options = {}) => {
    if (!text || !isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set voice
    if (options.voice) {
      utterance.voice = options.voice;
    } else if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // Set properties
    utterance.rate = options.rate || 1; // Speed (0.1 to 10)
    utterance.pitch = options.pitch || 1; // Pitch (0 to 2)
    utterance.volume = options.volume || 1; // Volume (0 to 1)
    utterance.lang = options.lang || "en-US";

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      setIsPaused(false);
      if (options.onError) options.onError(event);
    };

    utterance.onpause = () => {
      setIsPaused(true);
      if (options.onPause) options.onPause();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      if (options.onResume) options.onResume();
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSpeaking && isPaused) {
      window.speechSynthesis.resume();
    }
  };

  const cancel = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    isSpeaking,
    isPaused,
    voices,
    selectedVoice,
    isSupported,
    speak,
    pause,
    resume,
    cancel,
    setSelectedVoice,
  };
};

// Example usage:
/*
const MyComponent = () => {
  const {
    isSpeaking,
    voices,
    selectedVoice,
    speak,
    pause,
    resume,
    cancel,
    setSelectedVoice
  } = useSpeechSynthesis();

  const handleSpeak = () => {
    speak('Hello, this is a test message', {
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      onStart: () => console.log('Started speaking'),
      onEnd: () => console.log('Finished speaking')
    });
  };

  return (
    <div>
      <select onChange={(e) => setSelectedVoice(voices[e.target.value])}>
        {voices.map((voice, index) => (
          <option key={index} value={index}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
      
      <button onClick={handleSpeak}>Speak</button>
      {isSpeaking && <button onClick={pause}>Pause</button>}
      {isSpeaking && <button onClick={cancel}>Stop</button>}
    </div>
  );
};
*/
