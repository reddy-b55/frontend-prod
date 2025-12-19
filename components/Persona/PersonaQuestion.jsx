import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../pages/_app";
// import { MainDataContext } from "../Context/MainDataContext";

// Mock newColors object
const newColors = {
  primary1: "#4299e1",
  primary5: "#3182ce",
};

// Hook to get window dimensions
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // Set initial size
      handleResize();

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
};

const DemographicGameScreen = ({ navigation, userToken, onComplete }) => {
  // Function to remove emojis from text

  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 768;
  const isSmallMobile = windowSize.width <= 480;


  const removeEmojis = (text) => {
    return text;
  };

  // Icon mapping function for travel-related icons (using Unicode symbols as fallback)
  const getIconName = (option) => {
    if (option.icon) {
      return option.icon;
    }

    // Fallback icon mapping based on option text/value (using Unicode symbols)
    const text = (option.text || option.value || "").toLowerCase();

    if (
      text.includes("adventure") ||
      text.includes("hiking") ||
      text.includes("mountain")
    )
      return "🏔️";
    if (
      text.includes("beach") ||
      text.includes("ocean") ||
      text.includes("sea")
    )
      return "🏖️";
    if (
      text.includes("city") ||
      text.includes("urban") ||
      text.includes("building")
    )
      return "🏙️";
    if (
      text.includes("food") ||
      text.includes("restaurant") ||
      text.includes("dining")
    )
      return "🍽️";
    if (
      text.includes("culture") ||
      text.includes("museum") ||
      text.includes("history")
    )
      return "🏛️";
    if (
      text.includes("nature") ||
      text.includes("park") ||
      text.includes("forest")
    )
      return "🌲";
    if (
      text.includes("luxury") ||
      text.includes("hotel") ||
      text.includes("spa")
    )
      return "🏨";
    if (
      text.includes("budget") ||
      text.includes("backpack") ||
      text.includes("hostel")
    )
      return "🎒";
    if (
      text.includes("family") ||
      text.includes("kids") ||
      text.includes("children")
    )
      return "👨‍👩‍👧‍👦";
    if (
      text.includes("solo") ||
      text.includes("alone") ||
      text.includes("individual")
    )
      return "🚶";
    if (
      text.includes("group") ||
      text.includes("friends") ||
      text.includes("together")
    )
      return "👥";
    if (
      text.includes("relax") ||
      text.includes("calm") ||
      text.includes("peaceful")
    )
      return "🧘";
    if (
      text.includes("active") ||
      text.includes("sport") ||
      text.includes("fitness")
    )
      return "🏃";
    if (
      text.includes("photo") ||
      text.includes("camera") ||
      text.includes("picture")
    )
      return "📸";
    if (
      text.includes("shopping") ||
      text.includes("market") ||
      text.includes("buy")
    )
      return "🛒";
    if (
      text.includes("nightlife") ||
      text.includes("party") ||
      text.includes("club")
    )
      return "🌙";
    if (
      text.includes("transport") ||
      text.includes("car") ||
      text.includes("drive")
    )
      return "🚗";
    if (
      text.includes("flight") ||
      text.includes("plane") ||
      text.includes("air")
    )
      return "✈️";
    if (text.includes("train") || text.includes("rail")) return "🚂";
    if (
      text.includes("boat") ||
      text.includes("cruise") ||
      text.includes("ship")
    )
      return "🚢";

    // Default travel icon
    return "🧭";
  };

  const [gameSession, setGameSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [progress, setProgress] = useState({
    current: 0,
    total: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Animation states
  const [questionVisible, setQuestionVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState([]);
  const [progressWidth, setProgressWidth] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(-1);
  const {userId} = useContext(AppContext);

  // const { mainUserData, setMainUserData } = useContext(MainDataContext);


  // Cancel token for axios requests
  const cancelTokenRef = useRef();

  useEffect(() => {
    startGame();
    animateHeader();

    // Cleanup function
    return () => {
      setIsMounted(false);
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Component unmounted");
      }
    };
  }, [userId]);

  const animateHeader = () => {
    setTimeout(() => {
      setHeaderVisible(true);
    }, 100);
  };

  const startGame = async () => {
    try {
      console.log(
        {
          user_id: userId,
        },
        "Demographic Start"
      );

      // Create cancel token
      cancelTokenRef.current = axios.CancelToken.source();

      const response = await axios.post(
        "/personalization/demographic-game/start",
        {
          user_id: userId,
        },
        { cancelToken: cancelTokenRef.current.token }
      );

      const data = response.data;

      if (data.status === "already_completed") {
        // alert(`Already Completed! ${data.message}`);
        onComplete();
        return;
      }

      if (isMounted) {
        setGameSession(data.session_token);
        setCurrentQuestion(data.first_question);
        setProgress({ current: 1, total: data.total_questions, percentage: 0 });
        setIsLoading(false);
        animateQuestionEntry();
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Start game request cancelled");
      } else {
        console.error("Error starting game:", error);
        if (isMounted) {
        //   alert("Failed to start the game. Please try again.");
        }
      }
    }
  };

  const animateQuestionEntry = () => {
    setQuestionVisible(false);
    setOptionsVisible([]);

    setTimeout(() => {
      setQuestionVisible(true);

      setTimeout(() => {
        const options = currentQuestion
          ? JSON.parse(currentQuestion.options)
          : [];
        const visibleOptions = [];

        options.forEach((_, index) => {
          setTimeout(() => {
            visibleOptions.push(index);
            setOptionsVisible([...visibleOptions]);
          }, index * 100);
        });
      }, 300);
    }, 100);
  };

  const animateFeedback = () => {
    setFeedbackVisible(true);

    setTimeout(() => {
      setFeedbackVisible(false);
    }, 2000);
  };

  const handleOptionSelect = async (option, optionIndex) => {
    if (selectedOption || !isMounted) return;

    setSelectedOption(option);
    setSelectedOptionIndex(optionIndex);
    setShowFeedback(true);
    animateFeedback();

    setTimeout(() => {
      if (isMounted) {
        submitAnswer(option);
      }
    }, 2000);
  };

  const submitAnswer = async (option) => {
    if (!isMounted) return;

    try {
      const startTime = Date.now();

      console.log(
        {
          user_id: userId,
          session_token: gameSession,
          question_id: currentQuestion.id,
          selected_option: option.value,
          time_taken: Math.floor((Date.now() - startTime) / 1000),
        },
        "Demographic Game Submit"
      );

      // Create new cancel token for this request
      const cancelToken = axios.CancelToken.source();
      cancelTokenRef.current = cancelToken;

      const response = await axios.post(
        "/personalization/demographic-game/submit-answer",
        {
          user_id: userId,
          session_token: gameSession,
          question_id: currentQuestion.id,
          selected_option: option.value,
          time_taken: Math.floor((Date.now() - startTime) / 1000),
        },
        { cancelToken: cancelToken.token }
      );

      const data = response.data;

      if (isMounted) {
        getNextQuestion();
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Submit answer request cancelled");
      } else {
        console.error("Error submitting answer:", error);
        if (isMounted) {
        //   alert("Failed to submit answer. Please try again.");
        }
      }
    }
  };

  const [questionCount, setQuestionCount] = useState(0);
  const [questionCurrent, setQuestionCurrent] = useState(0);

  const getNextQuestion = async () => {
    if (!isMounted) return;

    try {
      // Create new cancel token for this request
      const cancelToken = axios.CancelToken.source();
      cancelTokenRef.current = cancelToken;

      console.log(
        progress.current,
        "xxxAsdadadasxasadaeqweasadasdasd asdasdasdsad"
      );

      if (progress.current == progress.total) {
        axios.post("/personalization/demographic-game/next-question", {
          user_id: userId,
          session_token: gameSession,
        });
        showCompletionScreen();
      } else {
        const response = await axios.post(
          "/personalization/demographic-game/next-question",
          {
            user_id: userId,
            session_token: gameSession,
          },
          { cancelToken: cancelToken.token }
        );

        const data = response.data;
        setQuestionCurrent(data?.progress?.current);
        setQuestionCount(data?.progress?.total);

        console.log(
          data,
          "Asdasdasdasasdasd asd asdasdasdasdas asdasdasdasdsad"
        );

        if (data.status === "completed") {
          if (isMounted) {
            showCompletionScreen(data);
          }
          return;
        }

        if (isMounted) {
          setCurrentQuestion(data.question);
          setProgress(data.progress);
          setSelectedOption(null);
          setSelectedOptionIndex(-1);
          setShowFeedback(false);

          // Animate progress bar
          setTimeout(() => {
            setProgressWidth(data.progress.percentage);
          }, 100);

          animateQuestionEntry();
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Get next question request cancelled");
      } else {
        console.error("Error getting next question:", error);
      }
    }
  };
  const [showCompletionModal, setShowCompletionModal] = useState(false);

 const showCompletionScreen = (data) => {
  setShowCompletionModal(true);
  
  // Auto close modal after 3 seconds and call onComplete
  setTimeout(() => {
    setShowCompletionModal(false);
    setTimeout(() => {
      onComplete();
    }, 300); // Small delay for smooth transition
  }, 3000);

  
};

  const handleSkip = () => {
    onComplete();
  };

  const renderStoryChoice = () => {
    const options = JSON.parse(currentQuestion.options);

   return (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: isMobile ? "calc(100vh - 160px)" : "80vh", // Adjust for mobile
      zIndex: 100000,
      overflow: "hidden", // Prevent double scrollbars
    }}
  >
    <div
      style={{
        opacity: questionVisible ? 1 : 0,
        transform: `translateY(${questionVisible ? 0 : 30}px)`,
        transition: "all 0.5s ease-in-out",
        marginBottom: isMobile ? "12px" : "20px",
      }}
    >
      <div
        style={{
          fontSize: isMobile ? (isSmallMobile ? "16px" : "17px") : "18px",
          fontWeight: "600",
          color: "#2d3748",
          textAlign: "center",
          lineHeight: isMobile ? "22px" : "24px",
          letterSpacing: "0.1px",
          padding: isMobile ? "0 8px" : "0",
        }}
      >
        <h3> {removeEmojis(currentQuestion.text)} </h3>
      </div>
    </div>

    <div 
      style={{ 
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginTop: isMobile ? "8px" : "12px",
        padding: isMobile ? (isSmallMobile ? "8px" : "12px") : "18px",
        overflowY: "auto",
        maxHeight: "none", // Remove height restrictions
        minHeight: 0,
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
      }}
    >
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: options.length === 1 ? "1fr" : 
            (isMobile ? "1fr" : "repeat(2, 1fr)"), // Single column on mobile
          gap: isMobile ? "12px" : "16px",
          minHeight: "auto", // Remove fixed heights
          alignContent: "flex-start", // Always start from top
          width: "100%",
        }}
      >
        {options.map((option, index) => (
          <div
            key={`${currentQuestion.id}-${index}`}
            style={{
              minHeight: isMobile ? "80px" : "100px",
              transform: `scale(${
                selectedOptionIndex === index ? 1.02 : 1
              }) translateY(${optionsVisible.includes(index) ? 0 : 20}px)`,
              opacity: optionsVisible.includes(index) ? 1 : 0,
              transition: "all 0.3s ease-in-out",
            }}
          >
            <button
              style={{
                backgroundColor:
                  selectedOption?.value === option.value
                    ? "#ebf8ff"
                    : "#ffffff",
                borderRadius: isMobile ? "12px" : "16px",
                border:
                  selectedOption?.value === option.value
                    ? "2px solid #4299e1"
                    : "1px solid #e2e8f0",
                width: "100%",
                height: "100%",
                cursor: selectedOption !== null ? "default" : "pointer",
                opacity:
                  selectedOption !== null &&
                  selectedOption?.value !== option.value
                    ? 0.6
                    : 1,
                transition: "all 0.2s ease-in-out",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                padding: isMobile ? (isSmallMobile ? "12px" : "14px") : "16px",
                minHeight: isMobile ? "80px" : "100px",
              }}
              onClick={() => handleOptionSelect(option, index)}
              disabled={selectedOption !== null}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: isMobile ? (isSmallMobile ? "40px" : "44px") : "48px",
                    height: isMobile ? (isSmallMobile ? "40px" : "44px") : "48px",
                    borderRadius: isMobile ? (isSmallMobile ? "20px" : "22px") : "24px",
                    backgroundColor: "#f0f4f8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: isMobile ? "12px" : "16px",
                    fontSize: isMobile ? (isSmallMobile ? "20px" : "22px") : "24px",
                    flexShrink: 0,
                  }}
                >
                  {option.emoji ? option.emoji : getIconName(option)}
                </div>
                <div
                  style={{
                    flex: 1,
                    fontSize: isMobile ? (isSmallMobile ? "14px" : "15px") : "16px",
                    fontWeight: "500",
                    color:
                      selectedOption?.value === option.value
                        ? "#3182ce"
                        : "#4a5568",
                    lineHeight: isMobile ? "20px" : "22px",
                    letterSpacing: "0.1px",
                    textAlign: "left",
                  }}
                >
                  {option.text}
                </div>
                {selectedOption?.value === option.value && (
                  <div
                    style={{
                      marginLeft: "8px",
                      color: "#4299e1",
                      fontSize: isMobile ? "18px" : "22px",
                      flexShrink: 0,
                    }}
                  >
                    ✅
                  </div>
                )}
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);
  };

  const renderThisOrThat = () => {
    const options = JSON.parse(currentQuestion.options);

    return (
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? (isSmallMobile ? "8px" : "12px") : "16px",
          paddingBottom: isMobile ? "16px" : "24px",
        }}
      >
        <div
          style={{
            padding: isMobile ? "4px 4px 3px 4px" : "8px 8px 5px 8px",
            opacity: questionVisible ? 1 : 0,
            transform: `translateY(${questionVisible ? 0 : 30}px)`,
            transition: "all 0.5s ease-in-out",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? (isSmallMobile ? "16px" : "17px") : "18px",
              fontWeight: "600",
              color: "#2d3748",
              textAlign: "center",
              lineHeight: isMobile ? "22px" : "24px",
              letterSpacing: "0.1px",
            }}
          >
            {removeEmojis(currentQuestion.text)}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "stretch",
            marginTop: isMobile ? "12px" : "8px",
            gap: isMobile ? "12px" : "16px",
            height: isMobile ? "auto" : "400px",
          }}
        >
          {/* First Option */}
          <div
            style={{
              flex: 1,
              transform: `scale(${selectedOptionIndex === 0 ? 1.01 : 1})`,
              opacity: optionsVisible.includes(0) ? 1 : 0,
              transition: "all 0.3s ease-in-out",
              minHeight: isMobile ? "200px" : "auto",
            }}
          >
            <button
              style={{
                backgroundColor:
                  selectedOption?.value === options[0]?.value
                    ? "#ebf8ff"
                    : "#ffffff",
                borderRadius: isMobile ? "12px" : "16px",
                border:
                  selectedOption?.value === options[0]?.value
                    ? "2px solid #4299e1"
                    : "1px solid #e2e8f0",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: selectedOption !== null ? "default" : "pointer",
                opacity:
                  selectedOption !== null &&
                  selectedOption?.value !== options[0]?.value
                    ? 0.6
                    : 1,
                transition: "all 0.2s ease-in-out",
                flexDirection: "column",
                padding: isMobile ? (isSmallMobile ? "12px" : "14px") : "16px",
                minHeight: isMobile ? "200px" : "auto",
              }}
              onClick={() => handleOptionSelect(options[0], 0)}
              disabled={selectedOption !== null}
            >
              {options[0]?.image && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: isMobile ? "16px" : "20px",
                    overflow: "hidden",
                    marginBottom: isMobile ? "8px" : "12px",
                    backgroundColor: "transparent",
                    position: "relative",
                    flex: 1,
                    minHeight: isMobile ? "120px" : "auto",
                  }}
                >
                  <img
                    src={options[0].image}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: isMobile ? "16px" : "20px",
                      objectFit: "cover",
                    }}
                    alt={options[0]?.text}
                  />
                  {selectedOption?.value === options[0]?.value && (
                    <div
                      style={{
                        position: "absolute",
                        top: isMobile ? "8px" : "12px",
                        right: isMobile ? "8px" : "12px",
                        color: "#4299e1",
                        fontSize: isMobile ? "16px" : "18px",
                      }}
                    >
                      ✅
                    </div>
                  )}
                </div>
              )}
              <div
                style={{
                  fontSize: isMobile ? (isSmallMobile ? "14px" : "15px") : "15px",
                  fontWeight:
                    selectedOption?.value === options[0]?.value ? "700" : "600",
                  color:
                    selectedOption?.value === options[0]?.value
                      ? "#3182ce"
                      : "#4a5568",
                  textAlign: "center",
                  lineHeight: isMobile ? "18px" : "20px",
                  letterSpacing: "0.1px",
                }}
              >
                {options[0]?.text}
              </div>
            </button>
          </div>

          {/* VS - Middle Section */}
          {!isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#4299e1",
                  borderRadius: "20px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}
                >
                  VS
                </div>
              </div>
            </div>
          )}

          {/* VS - Mobile Version */}
          {isMobile && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "40px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#4299e1",
                  borderRadius: "20px",
                  width: "60px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontSize: "12px",
                    fontWeight: "700",
                    letterSpacing: "0.5px",
                  }}
                >
                  VS
                </div>
              </div>
            </div>
          )}

          {/* Second Option */}
          <div
            style={{
              flex: 1,
              transform: `scale(${selectedOptionIndex === 1 ? 1.01 : 1})`,
              opacity: optionsVisible.includes(1) ? 1 : 0,
              transition: "all 0.3s ease-in-out",
              minHeight: isMobile ? "200px" : "auto",
            }}
          >
            <button
              style={{
                backgroundColor:
                  selectedOption?.value === options[1]?.value
                    ? "#ebf8ff"
                    : "#ffffff",
                borderRadius: isMobile ? "12px" : "16px",
                border:
                  selectedOption?.value === options[1]?.value
                    ? "2px solid #4299e1"
                    : "1px solid #e2e8f0",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: selectedOption !== null ? "default" : "pointer",
                opacity:
                  selectedOption !== null &&
                  selectedOption?.value !== options[1]?.value
                    ? 0.6
                    : 1,
                transition: "all 0.2s ease-in-out",
                flexDirection: "column",
                padding: isMobile ? (isSmallMobile ? "12px" : "14px") : "16px",
                minHeight: isMobile ? "200px" : "auto",
              }}
              onClick={() => handleOptionSelect(options[1], 1)}
              disabled={selectedOption !== null}
            >
              {options[1]?.image && (
                <div
                  style={{
                    width: "100%",
                    borderRadius: isMobile ? "16px" : "20px",
                    overflow: "hidden",
                    marginBottom: isMobile ? "8px" : "12px",
                    backgroundColor: "transparent",
                    position: "relative",
                    flex: 1,
                    minHeight: isMobile ? "120px" : "auto",
                  }}
                >
                  <img
                    src={options[1].image}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: isMobile ? "16px" : "20px",
                      objectFit: "cover",
                    }}
                    alt={options[1]?.text}
                  />
                  {selectedOption?.value === options[1]?.value && (
                    <div
                      style={{
                        position: "absolute",
                        top: isMobile ? "8px" : "12px",
                        right: isMobile ? "8px" : "12px",
                        color: "#4299e1",
                        fontSize: isMobile ? "16px" : "18px",
                      }}
                    >
                      ✅
                    </div>
                  )}
                </div>
              )}
              <div
                style={{
                  fontSize: isMobile ? (isSmallMobile ? "14px" : "15px") : "15px",
                  fontWeight:
                    selectedOption?.value === options[1]?.value ? "700" : "600",
                  color:
                    selectedOption?.value === options[1]?.value
                      ? "#3182ce"
                      : "#4a5568",
                  textAlign: "center",
                  lineHeight: isMobile ? "18px" : "20px",
                  letterSpacing: "0.1px",
                }}
              >
                {options[1]?.text}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderImageChoice = () => {
    const options = JSON.parse(currentQuestion.options);

    return (
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isMobile ? (isSmallMobile ? "8px" : "12px") : "16px",
          paddingBottom: isMobile ? "16px" : "24px",
        }}
      >
        {/* Question */}
        <div
          style={{
            padding: isMobile ? "4px" : "8px",
            opacity: questionVisible ? 1 : 0,
            transform: `translateY(${questionVisible ? 0 : 30}px)`,
            transition: "all 0.5s ease-in-out",
            fontSize: isMobile ? (isSmallMobile ? "16px" : "17px") : "18px",
            fontWeight: "600",
            color: "#2d3748",
            textAlign: "center",
         
          }}
        >
          <h3> {removeEmojis(currentQuestion.text)} </h3>
        </div>

        {/* Options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? 
              (isSmallMobile ? "1fr" : "repeat(2, 1fr)") : 
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: isMobile ? (isSmallMobile ? "12px" : "14px") : "16px",
            marginTop: isMobile ? "12px" : "16px",
            height: isMobile ? "auto" : "calc(100% - 122px)",
          }}
        >
          {options.map((option, index) => {
            const isSelected = selectedOption?.value === option.value;

            return (
              <div
                key={`${currentQuestion.id}-${index}`}
                onClick={() => handleOptionSelect(option, index)}
                style={{
                  cursor: selectedOption ? "default" : "pointer",
                  position: "relative",
                  borderRadius: isMobile ? "12px" : "16px",
                  height: isMobile ? 
                    (isSmallMobile ? "280px" : "320px") : 
                    "340px",
                  overflow: "hidden",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(66, 153, 225, 0.4)"
                    : "0 2px 6px rgba(0,0,0,0.1)",
                  border: isSelected
                    ? "3px solid #4299e1"
                    : "1px solid #e2e8f0",
                  transform: `scale(${isSelected ? (isMobile ? 1.02 : 1.05) : 1})`,
                  transition: "all 0.3s ease",
                }}
              >
                {/* Image */}
                <img
                  src={option.image}
                  alt={option.text}
                  style={{
                    width: "100%",
                    height: isMobile ? 
                      (isSmallMobile ? "200px" : "230px") : 
                      "243px",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.3s ease",
                  }}
                />

                {/* Text Section */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    padding: isMobile ? (isSmallMobile ? "8px" : "10px") : "12px",
                    color: "#fff",
                    fontSize: isMobile ? (isSmallMobile ? "14px" : "15px") : "15px",
                    fontWeight: isSelected ? "700" : "500",
                    textAlign: "center",
                    marginTop: isMobile ? "8px" : "15px",
                    height: "100%",
                  }}
                >
                  <span style={{
                    fontSize: isMobile ? (isSmallMobile ? "16px" : "18px") : "20px", 
                    color: "black"
                  }}> 
                    {option.text}
                  </span>
                </div>

                {/* Checkmark Badge */}
                {isSelected && (
                  <div
                    style={{
                      position: "absolute",
                      top: isMobile ? "8px" : "12px",
                      right: isMobile ? "8px" : "12px",
                      background: "#4299e1",
                      color: "#fff",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "700",
                      width: isMobile ? "24px" : "28px",
                      height: isMobile ? "24px" : "28px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case "story_choice":
        return renderStoryChoice();
      case "this_or_that":
        return renderThisOrThat();
      case "image_choice":
        return renderImageChoice();
      default:
        return renderStoryChoice();
    }
  };

  if (isLoading) {
    
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
          flexDirection: "column",
          padding: isMobile ? (isSmallMobile ? "16px" : "20px") : "24px",
        }}
      >
        <div
          style={{
            width: isMobile ? (isSmallMobile ? "40px" : "45px") : "50px",
            height: isMobile ? (isSmallMobile ? "40px" : "45px") : "50px",
            borderRadius: isMobile ? (isSmallMobile ? "20px" : "22.5px") : "25px",
            backgroundColor: "#ebf8ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: isMobile ? "12px" : "16px",
            border: "2px solid #4299e1",
            fontSize: isMobile ? (isSmallMobile ? "24px" : "28px") : "32px",
          }}
        >
          ✈️
        </div>
        <div
          style={{
            fontSize: isMobile ? (isSmallMobile ? "14px" : "15px") : "16px",
            fontWeight: "600",
            color: "#2d3748",
            marginBottom: "4px",
            textAlign: "center",
            letterSpacing: "0.1px",
          }}
        >
          Preparing Your Journey...
        </div>
        <div
          style={{
            fontSize: isMobile ? (isSmallMobile ? "12px" : "13px") : "14px",
            color: "#718096",
            fontWeight: "400",
            textAlign: "center",
            letterSpacing: "0.1px",
          }}
        >
          Crafting your travel experience
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent body scroll
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #f0f4f8",
          opacity: headerVisible ? 1 : 0,
          transform: `translateY(${headerVisible ? 0 : -30}px)`,
          transition: "all 0.8s ease-in-out",
        }}
      >
        <div
          style={{
            paddingTop: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: isMobile ? "12px" : "16px",
              paddingRight: isMobile ? "12px" : "16px",
              paddingTop: "8px",
              paddingBottom: "8px",
              flexDirection: isSmallMobile ? "column" : "row",
              gap: isSmallMobile ? "12px" : "0",
            }}
          >
            <div
              style={{
                flex: isSmallMobile ? "none" : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "2px",
                  letterSpacing: "0.2px",
                }}
              >
                
                <img
                            src={`/assets/images/icon/logo.png`}
                            alt="logo"
                            width={isMobile ? 120 : 150}
                            height={isMobile ? 34 : 42}
                            // className={styles.logo}
                          />
              </div>
              <div
                style={{
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: "700",
                  color: "#2d3748",
                  marginBottom: "2px",
                  letterSpacing: "0.2px",
                }}
              >
                
                Travel Discovery
              </div>
              <div
                style={{
                  fontSize: isMobile ? "12px" : "13px",
                  color: "#718096",
                  fontWeight: "500",
                  letterSpacing: "0.1px",
                  textAlign: "center",
                }}
              >
                Uncover Your Perfect Adventure Style
              </div>
            </div>
<button
  style={{
    backgroundColor: newColors.primary5,
    paddingLeft: isMobile ? "16px" : "12px",
    paddingRight: isMobile ? "16px" : "12px",
    paddingTop: isMobile ? "8px" : "6px",
    paddingBottom: isMobile ? "8px" : "6px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    minWidth: isSmallMobile ? "120px" : "auto",
  }}
  onClick={() => onComplete(true)}  // Pass true to indicate skipped
>
  <div
    style={{
      color: "#ffffff",
      fontSize: isMobile ? "14px" : "13px",
      fontWeight: "600",
      letterSpacing: "0.1px",
    }}
  >
    Skip
  </div>
</button>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div
        style={{
          backgroundColor: "#ffffff",
          paddingLeft: isMobile ? "12px" : "16px",
          paddingRight: isMobile ? "12px" : "16px",
          paddingTop: "6px",
          paddingBottom: "6px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "600",
                color: "#2d3748",
                letterSpacing: "0.2px",
              }}
            >
              Journey Progress
            </div>
            <div
              style={{
                fontSize: isMobile ? "13px" : "14px",
                fontWeight: "700",
                color: newColors.primary1,
                letterSpacing: "0.3px",
              }}
            >
              {progress.current} of {progress.total}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                flex: 1,
                height: isMobile ? "8px" : "10px",
                backgroundColor: "#e2e8f0",
                borderRadius: "8px",
                overflow: "hidden",
                marginRight: isMobile ? "8px" : "12px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  backgroundColor: newColors.primary1,
                  borderRadius: "8px",
                  width: `${progressWidth}%`,
                  transition: "width 0.6s ease-in-out",
                }}
              />
            </div>
            <div
              style={{
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: "600",
                color: newColors.primary1,
                minWidth: isMobile ? "30px" : "35px",
              }}
            >
              {Math.round(progress.percentage)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          padding: isMobile ? 
            (isSmallMobile ? "12px" : "20px") : 
            "70px",
          overflow: isMobile ? "auto" : "visible",
          minHeight: 0, // Important for flex scrolling
          height: isMobile ? "calc(100vh - 120px)" : "auto",
          WebkitOverflowScrolling: isMobile ? "touch" : "auto",
        }}
      >
        {renderQuestion()}
      </div>

      {showCompletionModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 200000,
      opacity: showCompletionModal ? 1 : 0,
      transition: "all 0.3s ease-in-out",
      padding: isMobile ? "20px" : "0",
    }}
  >
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: isMobile ? "16px" : "20px",
        padding: isMobile ? 
          (isSmallMobile ? "30px 20px" : "35px 25px") : 
          "40px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: isMobile ? "90%" : "350px",
        width: isMobile ? "100%" : "90%",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        transform: showCompletionModal ? "scale(1)" : "scale(0.8)",
        transition: "all 0.3s ease-in-out",
      }}
    >
      {/* Success Icon */}
      <div
        style={{
          width: isMobile ? 
            (isSmallMobile ? "60px" : "70px") : 
            "80px",
          height: isMobile ? 
            (isSmallMobile ? "60px" : "70px") : 
            "80px",
          borderRadius: isMobile ? 
            (isSmallMobile ? "30px" : "35px") : 
            "40px",
          backgroundColor: "#f0fff4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: isMobile ? "20px" : "24px",
          border: "3px solid #68d391",
          fontSize: isMobile ? 
            (isSmallMobile ? "30px" : "35px") : 
            "40px",
        }}
      >
        ✅
      </div>

      {/* Success Message */}
      <div
        style={{
          fontSize: isMobile ? 
            (isSmallMobile ? "20px" : "22px") : 
            "24px",
          fontWeight: "700",
          color: "#2d3748",
          marginBottom: isMobile ? "10px" : "12px",
          letterSpacing: "0.2px",
        }}
      >
        Successfully Completed!
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: isMobile ? 
            (isSmallMobile ? "14px" : "15px") : 
            "16px",
          color: "#718096",
          fontWeight: "500",
          lineHeight: isMobile ? "20px" : "22px",
          letterSpacing: "0.1px",
          marginBottom: isMobile ? "16px" : "20px",
        }}
      >
        Your travel discovery journey is complete. We're now crafting your perfect adventure recommendations!
      </div>

      {/* Travel Icon */}
      <div
        style={{
          fontSize: isMobile ? 
            (isSmallMobile ? "24px" : "28px") : 
            "32px",
          marginTop: "8px",
        }}
      >
        ✈️
      </div>

    </div>
  </div>
)}

      {/* Feedback */}
      {showFeedback && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: isMobile ? "16px" : "20px",
            right: isMobile ? "16px" : "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100001,
            opacity: feedbackVisible ? 1 : 0,
            transform: `translateY(${feedbackVisible ? 0 : 50}px) scale(${
              feedbackVisible ? 1 : 0.8
            })`,
            transition: "all 0.3s ease-in-out",
          }}
        >
          <div
            style={{
              backgroundColor: "#f0fff4",
              borderRadius: isMobile ? "10px" : "12px",
              padding: isMobile ? 
                (isSmallMobile ? "12px" : "14px") : 
                "16px",
              display: "flex",
              alignItems: "center",
              border: "1px solid #68d391",
              minWidth: isMobile ? "160px" : "200px",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                color: "#38a169",
                fontSize: isMobile ? 
                  (isSmallMobile ? "20px" : "22px") : 
                  "24px",
                marginRight: "8px",
              }}
            >
              ✅
            </div>
            <div>
              <div
                style={{
                  fontSize: isMobile ? 
                    (isSmallMobile ? "14px" : "15px") : 
                    "16px",
                  fontWeight: "700",
                  color: "#38a169",
                  marginBottom: "4px",
                  letterSpacing: "0.2px",
                }}
              >
                Perfect Selection!
              </div>
              <div
                style={{
                  fontSize: isMobile ? 
                    (isSmallMobile ? "11px" : "12px") : 
                    "13px",
                  fontWeight: "500",
                  color: "#2d3748",
                  letterSpacing: "0.1px",
                }}
              >
                Your travel style is taking shape
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemographicGameScreen;
