import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { generateItinerary } from "../../AxiosCalls/AIServices/aiItineraryService";
import { automateFlightBooking, validateFlightPrompt } from "../../AxiosCalls/FlightsServices/FlightAutomationService";

const AIItineraryModal = ({ 
  isOpen, 
  onClose, 
  userId,
  source = "itinerary", // "itinerary" or "flights"
  onFlightSearchSuccess // Callback for flight search success
}) => {
  const router = useRouter();

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const [cartId, setCartId] = useState(null);
  const [cartName, setCartName] = useState("");
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationError, setValidationError] = useState("");
  const [recognition, setRecognition] = useState(null);

  // Loading messages for AI processing
  const LOADING_MESSAGES = [
    {
      icon: "🧠",
      text: "Understanding your travel needs...",
      color: "#6366F1",
      duration: 2000,
    },
    {
      icon: "🗺️",
      text: "Creating a nice journey for you...",
      color: "#10B981",
      duration: 2500,
    },
    {
      icon: "📅",
      text: "Mapping a proper schedule...",
      color: "#F59E0B",
      duration: 2500,
    },
    {
      icon: "📝",
      text: "We are creating your perfect itinerary...",
      color: "#EC4899",
      duration: 3000,
    },
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'en-US';

        recognitionInstance.onresult = (event) => {
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

          // Update the transcript with both interim and final results
          setTranscript(prev => {
            const base = prev.replace(/\[.*?\]/g, ''); // Remove any existing interim text
            return base + finalTranscript + (interimTranscript ? ` [${interimTranscript}]` : '');
          });
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access was denied. Please allow microphone access in your browser settings.');
          }
        };

        recognitionInstance.onend = () => {
          setIsRecording(false);
          setRecordingTime(0);
        };

        setRecognition(recognitionInstance);
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Handle body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Voice recording handlers
  const startVoiceRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      // Clear previous transcript and validation error
      setTranscript('');
      setValidationError('');
      
      // Start recognition
      recognition.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Add initial instruction text
      setTranscript('Listening.... [Say "stop" to finish]');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Could not start voice recording. Please check microphone permissions.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognition && isRecording) {
      try {
        recognition.stop();
        setIsRecording(false);
        setRecordingTime(0);
        
        // Clean up the transcript and check if user actually spoke
        setTranscript(prev => {
          let cleanedText = prev;
          
          if (prev.includes('[Say "stop" to finish]')) {
            cleanedText = prev.replace('[Say "stop" to finish]', '').replace('Listening... ', '');
          }
          if (prev.includes('Listening...')) {
            cleanedText = prev.replace('Listening...', '');
          }
          cleanedText = cleanedText.replace(/\[.*?\]/g, '').trim(); // Remove any interim text
          
          // Check if the cleaned text is empty or only contains "Listening"
          if (!cleanedText || cleanedText === '' || cleanedText.toLowerCase() === 'listening') {
            setValidationError('No speech detected. Please speak your travel requirements or type them below.');
            return '';
          }
          
          return cleanedText;
        });
      } catch (error) {
        console.error('Error stopping voice recording:', error);
      }
    }
  };

  // Generate itinerary handler
  const handleGenerateItinerary = async () => {
    // Validate input
    if (!transcript || transcript.trim() === '' || transcript.toLowerCase() === 'listening') {
      const message = source === "flights"
        ? 'Please describe your flight requirements using voice or by typing below.'
        : 'Please provide your travel requirements using voice input or by typing below.';
      setValidationError(message);
      return;
    }

    // Additional validation for flights
    if (source === "flights") {
      const validation = validateFlightPrompt(transcript);
      if (!validation.isValid) {
        setValidationError(validation.message);
        return;
      }
    }

    // Clear validation error if input is valid
    setValidationError('');

    // Start loading screen
    setShowLoadingScreen(true);
    setCurrentLoadingStep(0);
    setHasError(false);
    setErrorMessage("");

    // Cyclic loading messages
    let step = 0;
    const loadingInterval = setInterval(() => {
      step = (step + 1) % LOADING_MESSAGES.length;
      setCurrentLoadingStep(step);
    }, 2500);

    try {
      if (source === "flights") {
        // Handle flight automation
        console.log("Automating flight search for user:", {
          prompt: transcript,
          userId: userId?.cxid || '10914702',
          currency: 'USD', // You can make this dynamic based on user preferences
          fullyBooking: false,
          language: 'en-US', // You can make this dynamic based on user's language selection
        });
        
        const response = await automateFlightBooking({
          prompt: transcript,
          userId: userId?.cxid || '10914702',
          currency: 'USD', // You can make this dynamic based on user preferences
          fullyBooking: false,
          language: 'en-US', // You can make this dynamic based on user's language selection
        });

        clearInterval(loadingInterval);

        if (response.success && response.data) {
          console.log("Flight automation successful:", response.data);
          
          // Close the modal
          onClose();
          
          // Call the success callback with flight search data
          if (onFlightSearchSuccess) {
            onFlightSearchSuccess(response.data);
          }
        } else {
          throw new Error(response.message || "Failed to process flight request");
        }
      } else {
        // Handle regular itinerary generation
        console.log("Generating itinerary for user:", userId);
        
        const response = await generateItinerary(transcript, userId);
        
        console.log("API Response:", response);

        // Clear the loading interval
        clearInterval(loadingInterval);

        const receivedCartId = response?.cart_id;
        const receivedCartName = response?.cart_name;

        if (receivedCartId) {
          setCartId(receivedCartId);
          setCartName(receivedCartName || "Your Itinerary");
          
          // Show success message for 3 seconds then navigate
          setTimeout(() => {
            router.push({
              pathname: "/page/account/cart-page",
              query: {
                selectedCartId: receivedCartId,
                cartName: receivedCartName
              }
            });
          }, 3000);
        } else {
          throw new Error("No cart ID received from server");
        }
      }

    } catch (error) {
      console.error(source === "flights" ? 'Flight automation error:' : 'Itinerary generation error:', error);
      clearInterval(loadingInterval);
      setHasError(true);
      setErrorMessage(
        error.response?.data?.message || 
        error.message || 
        "Failed to generate itinerary. Please try again."
      );
    }
  };

  // Close modal handler
  const handleClose = () => {
    setTranscript("");
    setIsRecording(false);
    setRecordingTime(0);
    setHasError(false);
    setErrorMessage("");
    setValidationError("");
    setCartId(null);
    setCartName("");
    setCurrentLoadingStep(0);
    setShowLoadingScreen(false);
    
    // Stop recognition if active
    if (recognition && isRecording) {
      recognition.stop();
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="ai-prompt-overlay" onClick={handleClose}>
      <div className="ai-prompt-modal" onClick={(e) => e.stopPropagation()}>
        {showLoadingScreen ? (
          // Loading Screen with Cyclic Messages
          <div className="ai-loading-screen">
            {!hasError && !cartId ? (
              <>
                <div className="loading-icon-container">
                  <div className="loading-icon" style={{ color: LOADING_MESSAGES[currentLoadingStep].color }}>
                    {LOADING_MESSAGES[currentLoadingStep].icon}
                  </div>
                </div>
                <h3 className="loading-title">{LOADING_MESSAGES[currentLoadingStep].text}</h3>
                <div className="loading-progress-dots">
                  {LOADING_MESSAGES.map((_, index) => (
                    <span
                      key={index}
                      className={`progress-dot ${index === currentLoadingStep ? 'active' : ''}`}
                      style={{ backgroundColor: index === currentLoadingStep ? LOADING_MESSAGES[currentLoadingStep].color : '#e0e0e0' }}
                    ></span>
                  ))}
                </div>
              </>
            ) : hasError ? (
              // Error State
              <div className="error-state">
                <div className="error-icon">⚠️</div>
                <h3 className="error-title">Oops! Something went wrong</h3>
                <p className="error-message">{errorMessage}</p>
                <button className="retry-button" onClick={handleGenerateItinerary}>
                  🔄 Try Again
                </button>
                <button className="cancel-button" onClick={handleClose}>
                  Cancel
                </button>
              </div>
            ) : (
              // Success State
              <div className="success-state">
                <div className="success-icon">✅</div>
                <h3 className="success-title">Itinerary Created Successfully!</h3>
                <p className="success-message">Your personalized itinerary "{cartName}" is ready to explore.</p>
                <button className="view-itinerary-button" onClick={() => router.push({
                  pathname: "/page/account/cart-page",
                  query: { 
                    selectedCartId: cartId,
                    cartName: cartName 
                  }
                })}>
                  📋 See Itinerary
                </button>
              </div>
            )}
          </div>
        ) : (
          // Main Input Form
          <>
            <div className="ai-prompt-header">
              <h2 className="ai-prompt-title">Create Your Itinerary with AI</h2>
              <button
                className="ai-close-button"
                onClick={handleClose}
                aria-label="Close AI Prompt"
              >
                ✕
              </button>
            </div>
            <div className="ai-prompt-content">
              <p className="ai-prompt-description">
                Tell me about your travel plans, and I'll create a personalized itinerary for you!
              </p>
              <div className="ai-voice-controls">
                {!isRecording ? (
                  <button 
                    className="ai-voice-button"
                    onClick={startVoiceRecording}
                  >
                    🎤 Start Voice Input
                  </button>
                ) : (
                  <div className="ai-recording-container">
                    <button 
                      className="ai-voice-button recording"
                      onClick={stopVoiceRecording}
                    >
                      <span className="recording-dot"></span>
                      Stop Recording {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </button>
                    <div className="audio-wave">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <p className="ai-voice-hint">or type your requirements below</p>
              </div>
              <textarea
                className="ai-text-input"
                placeholder="Example: I want to visit Bali for 5 days with my family. We love beaches, cultural sites, and good food. Budget is moderate."
                rows="6"
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  // Clear validation error when user starts typing
                  if (validationError) {
                    setValidationError('');
                  }
                }}
              />
              {validationError && (
                <p className="ai-validation-error">
                  ⚠️ {validationError}
                </p>
              )}
              <div className="ai-prompt-actions">
                <button className="ai-cancel-button" onClick={handleClose}>
                  Cancel
                </button>
                <button 
                  className="ai-generate-button"
                  onClick={handleGenerateItinerary}
                  disabled={!transcript || transcript.trim() === ''}
                >
                  ✨ Generate Itinerary
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        /* AI Prompt Modal */
        .ai-prompt-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          backdrop-filter: blur(5px);
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .ai-prompt-modal {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .ai-prompt-header {
          background: white;
          color: #333;
          padding: 20px 24px;
          border-radius: 20px 20px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #f0f0f0;
        }

        .ai-prompt-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }

        .ai-close-button {
          background: #f5f5f5;
          border: none;
          color: #666;
          font-size: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .ai-close-button:hover {
          background: #e0e0e0;
          transform: rotate(90deg);
        }

        .ai-prompt-content {
          padding: 24px;
        }

        .ai-prompt-description {
          font-size: 16px;
          color: #555;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .ai-voice-controls {
          text-align: center;
          margin-bottom: 20px;
        }

        .ai-voice-button {
          background: white;
          border: 2px solid #e0e0e0;
          color: #333;
          padding: 14px 28px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .ai-voice-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          background: #f8f9fa;
          border-color: #ccc;
        }

        .ai-voice-hint {
          font-size: 14px;
          color: #999;
          margin-top: 10px;
          font-style: italic;
        }

        .ai-text-input {
          width: 100%;
          padding: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.3s;
          margin-bottom: 20px;
        }

        .ai-text-input:focus {
          outline: none;
          border-color: #00d4aa;
        }

        .ai-validation-error {
          color: #ff4444;
          font-size: 14px;
          margin-top: -15px;
          margin-bottom: 15px;
          padding: 8px 12px;
          background-color: #fff5f5;
          border-left: 3px solid #ff4444;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ai-prompt-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }

        .ai-cancel-button {
          background: #f5f5f5;
          border: none;
          color: #666;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-cancel-button:hover {
          background: #e0e0e0;
        }

        .ai-generate-button {
          background: #00d4aa;
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 212, 170, 0.3);
        }

        .ai-generate-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.4);
          background: #00c199;
        }

        .ai-generate-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* AI Recording Styles */
        .ai-recording-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .ai-voice-button.recording {
          background: #ff4757;
          color: white;
          border-color: #ff4757;
          animation: pulse-recording 1.5s ease-in-out infinite;
        }

        @keyframes pulse-recording {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(255, 71, 87, 0);
          }
        }

        .recording-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          margin-right: 8px;
          animation: blink 1s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .audio-wave {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 40px;
        }

        .audio-wave span {
          display: inline-block;
          width: 4px;
          background: #00d4aa;
          border-radius: 2px;
          animation: wave 1s ease-in-out infinite;
        }

        .audio-wave span:nth-child(1) { animation-delay: 0s; height: 20px; }
        .audio-wave span:nth-child(2) { animation-delay: 0.1s; height: 30px; }
        .audio-wave span:nth-child(3) { animation-delay: 0.2s; height: 40px; }
        .audio-wave span:nth-child(4) { animation-delay: 0.3s; height: 30px; }
        .audio-wave span:nth-child(5) { animation-delay: 0.4s; height: 20px; }

        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }

        /* AI Loading Screen */
        .ai-loading-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
          text-align: center;
          min-height: 400px;
        }

        .loading-icon-container {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 30px;
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .loading-icon {
          font-size: 80px;
          transition: color 0.5s ease;
        }

        .loading-title {
          font-size: 22px;
          color: #333;
          margin-bottom: 30px;
          font-weight: 600;
          animation: fadeInOut 2s ease-in-out infinite;
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }

        .loading-progress-dots {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .progress-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .progress-dot.active {
          width: 14px;
          height: 14px;
        }

        /* Error State */
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
        }

        .error-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .error-title {
          font-size: 22px;
          color: #ff4757;
          margin-bottom: 15px;
          font-weight: 600;
        }

        .error-message {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .retry-button {
          background: #00d4aa;
          border: none;
          color: white;
          padding: 14px 32px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 12px;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          background: #00c199;
        }

        .cancel-button {
          background: #f5f5f5;
          border: none;
          color: #666;
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button:hover {
          background: #e0e0e0;
        }

        /* Success State */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
        }

        .success-icon {
          font-size: 80px;
          margin-bottom: 20px;
          animation: successPop 0.6s ease-out;
        }

        @keyframes successPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .success-title {
          font-size: 24px;
          color: #00d4aa;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .success-message {
          font-size: 16px;
          color: #666;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .view-itinerary-button {
          background: #00d4aa;
          border: none;
          color: white;
          padding: 16px 36px;
          border-radius: 12px;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
        }

        .view-itinerary-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 212, 170, 0.4);
          background: #00c199;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .ai-prompt-modal {
            width: 95%;
            max-height: 95vh;
          }

          .ai-prompt-header {
            padding: 16px 20px;
          }

          .ai-prompt-title {
            font-size: 18px;
          }

          .ai-prompt-content {
            padding: 20px;
          }

          .ai-prompt-description {
            font-size: 14px;
          }

          .ai-voice-button {
            padding: 12px 24px;
            font-size: 14px;
          }

          .ai-text-input {
            font-size: 14px;
            padding: 12px;
          }

          .loading-icon {
            font-size: 60px;
          }

          .loading-title {
            font-size: 18px;
          }

          .error-icon,
          .success-icon {
            font-size: 60px;
          }

          .error-title,
          .success-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AIItineraryModal;
