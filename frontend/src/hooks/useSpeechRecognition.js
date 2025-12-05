// hooks/useSpeechRecognition.js
import { useState, useEffect, useRef, useCallback } from 'react';

const useSpeechRecognition = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const isStartingRef = useRef(false);
  const finalTranscriptRef = useRef('');

  // Check browser support
  const isSpeechRecognitionSupported = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }, []);

  // Create a new recognition instance
  const createRecognitionInstance = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    try {
      const recognition = new SpeechRecognition();
      
      // Configuration
      recognition.continuous = false;  // Changed to false - stop after each phrase
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      return recognition;
    } catch (err) {
      console.error('Failed to create SpeechRecognition:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check support
    const supported = isSpeechRecognitionSupported();
    console.log('Speech recognition supported:', supported);
    
    if (!supported) {
      setError('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    // Don't initialize immediately, wait for startListening
    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, [isSpeechRecognitionSupported]);

  const startListening = useCallback(async (lang = 'en-US') => {
    console.log('=== START LISTENING ===');
    
    // Prevent multiple starts
    if (isStartingRef.current || isListening) {
      console.log('Already starting or listening');
      return;
    }
    
    isStartingRef.current = true;
    setError(null);
    finalTranscriptRef.current = ''; // Reset final transcript
    
    try {
      // Check support
      if (!isSpeechRecognitionSupported()) {
        throw new Error('Speech recognition not supported. Please use Chrome or Edge.');
      }

      // Check microphone permission
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log('Microphone permission granted');
        } catch (err) {
          throw new Error('Microphone access denied. Please allow microphone permission.');
        }
      }

      // Create new recognition instance
      const recognition = createRecognitionInstance();
      if (!recognition) {
        throw new Error('Failed to initialize speech recognition.');
      }
      
      // Configure language
      recognition.lang = lang;
      
      // Set up event handlers
      recognition.onstart = () => {
        console.log('Speech recognition STARTED');
        setIsListening(true);
        setError(null);
        isStartingRef.current = false;
        finalTranscriptRef.current = ''; // Clear on start
      };
      
      recognition.onresult = (event) => {
        console.log('Speech recognition got results:', event.results.length);
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            // This is a final result
            finalTranscript += transcript + ' ';
          } else {
            // This is an interim result
            interimTranscript += transcript;
          }
        }
        
        // Update the final transcript with new final results
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
          console.log('Final transcript updated:', finalTranscriptRef.current);
        }
        
        // Only send the combined final transcript (not interim results)
        if (finalTranscriptRef.current.trim() && onResult) {
          onResult(finalTranscriptRef.current.trim());
        }
        
        // You could optionally also send interim results for real-time feedback
        // But only for display purposes, not for accumulating text
        // Example: onInterimResult? (interimTranscript)
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition ERROR:', event.error);
        isStartingRef.current = false;
        
        // Handle specific errors
        if (event.error === 'aborted') {
          // This is normal when stopping
          console.log('Recognition aborted (normal when stopping)');
        } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setError('Microphone permission denied. Please allow access.');
        } else if (event.error === 'no-speech') {
          console.log('No speech detected');
        } else {
          setError(`Speech recognition error: ${event.error}`);
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ENDED');
        setIsListening(false);
        isStartingRef.current = false;
        
        // Don't auto-restart - let user start again manually
        // This prevents the repetition issue
      };
      
      // Store the instance
      recognitionRef.current = recognition;
      
      // Start recognition
      console.log('Starting recognition...');
      recognition.start();
      
    } catch (err) {
      console.error('Failed to start listening:', err);
      setError(err.message);
      setIsListening(false);
      isStartingRef.current = false;
    }
  }, [isSpeechRecognitionSupported, createRecognitionInstance, isListening, onResult]);

  const stopListening = useCallback(() => {
    console.log('=== STOP LISTENING ===');
    
    isStartingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        console.log('Recognition stopped');
        
        // Send any remaining final transcript
        if (finalTranscriptRef.current.trim() && onResult) {
          onResult(finalTranscriptRef.current.trim());
        }
        
        // Clear the final transcript
        finalTranscriptRef.current = '';
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    }
  }, [onResult]);

  const speak = useCallback((text, lang = 'en-US') => {
    if ('speechSynthesis' in window && text) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);
  
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { 
    isListening, 
    isSpeaking,
    error,
    startListening, 
    stopListening, 
    speak,
    stopSpeaking,
    isSupported: isSpeechRecognitionSupported()
  };
};

export default useSpeechRecognition;