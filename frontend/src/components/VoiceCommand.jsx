import React, { useState, useRef } from 'react';
import './VoiceCommand.css';

const VoiceCommand = ({ onVoiceCommand, isLoading, feedback, clearFeedback }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startVoiceRecording = () => {
    // Clear previous feedback
    clearFeedback();
    setTranscript('');
    
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Create speech recognition instance
    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;

    // Configuration
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // Event handlers
    recognition.onstart = () => {
      setIsRecording(true);
      setTranscript('Listening...');
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results while speaking
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Process final result when done speaking
      if (finalTranscript) {
        setTranscript(finalTranscript);
        recognition.stop();
        
        // Send the voice command to be processed
        if (onVoiceCommand) {
          onVoiceCommand(finalTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setTranscript('Microphone access denied. Please allow microphone permissions.');
          break;
        case 'network':
          setTranscript('Network error occurred. Please check your connection.');
          break;
        case 'no-speech':
          setTranscript('No speech detected. Please try again.');
          break;
        case 'audio-capture':
          setTranscript('No microphone found. Please check your microphone.');
          break;
        default:
          setTranscript('Error occurred with speech recognition. Please try again.');
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (!transcript || transcript === 'Listening...') {
        setTranscript('No speech detected. Click the microphone to try again.');
      }
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setTranscript('Error starting voice recognition. Please try again.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceButtonClick = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  return (
    <div className="voice-command">
      <div className="recording-section">
        <button
          className={`voice-button ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceButtonClick}
          disabled={isLoading}
        >
          {isRecording ? '🛑 Stop Listening' : '🎤 Start Voice Command'}
        </button>
        
        <div className="recording-instructions">
          <p><strong>Voice Command Tips:</strong></p>
          <ul>
            <li>Speak clearly and naturally</li>
            <li>Try: "Add milk and eggs"</li>
            <li>Try: "I need 2 apples"</li>
            <li>Try: "Remove bread from my list"</li>
            <li>Works best in Chrome/Edge</li>
          </ul>
        </div>
      </div>

      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> "{transcript}"
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="spinner"></div>
          Processing your voice command...
        </div>
      )}

      {feedback && (
        <div className={`feedback ${feedback.includes('error') ? 'error' : ''}`}>
          {feedback}
          <button className="close-feedback" onClick={clearFeedback}>×</button>
        </div>
      )}
    </div>
  );
};

export default VoiceCommand;