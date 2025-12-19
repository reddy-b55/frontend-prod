import React, { useState, useEffect, useRef, useContext } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Animated,
  Dimensions,
  AppState,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  BackHandler,
  Image,
  PermissionsAndroid,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import colors from "../../misc/colors";
import axios from "axios";
import { MainDataContext } from "../Context/MainDataContext";
import { CurrencyData } from "../Context/CurrencyContext";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

// Voice Recognition Import
let Voice;
try {
  Voice = require("@react-native-voice/voice").default;
  if (!Voice) {
    Voice = require("@react-native-voice/voice");
  }
} catch (error) {
  console.warn("Voice recognition not available:", error);
  Voice = null;
}

const { width, height } = Dimensions.get("window");

// API Configuration
const API_URL = "n8n/webhook/automate";

// Loading messages for AI processing
const LOADING_MESSAGES = [
  {
    icon: "brain",
    text: "Understanding your travel needs...",
    color: "#6366F1",
    duration: 2000,
  },
  {
    icon: "map-marker-path",
    text: "Creating a nice journey for you...",
    color: "#10B981",
    duration: 2500,
  },
  {
    icon: "calendar-clock",
    text: "Mapping a proper schedule...",
    color: "#F59E0B",
    duration: 2500,
  },
  {
    icon: "file-document-edit",
    text: "Creating the entire itinerary...",
    color: "#EC4899",
    duration: 3000,
  },
];

// Language configurations with iOS and Android compatible codes
const LANGUAGES = [
  {
    code: "en-US",
    iosCode: "en-US", // iOS supports en-US
    androidCode: "en-US",
    name: "English",
    displayName: "English (US)",
    icon: "translate",
    color: "#6366F1",
    greeting: "Speak in English",
    iosSupported: true,
  },
  {
    code: "si-LK",
    iosCode: "en-US", // Fallback to English for iOS (Sinhala not natively supported)
    androidCode: "si-LK",
    name: "Sinhala",
    displayName: "සිංහල",
    icon: "translate",
    color: "#EC4899",
    greeting: "සිංහලෙන් කථා කරන්න",
    iosSupported: false,
    iosFallbackMessage: "iOS doesn't support Sinhala speech recognition. Using English recognition - please speak in English or type in Sinhala below.",
  },
  {
    code: "ta-IN", // Changed from ta-LK to ta-IN for better iOS support
    iosCode: "ta-IN", // iOS supports Tamil (India)
    androidCode: "ta-IN",
    name: "Tamil",
    displayName: "தமிழ்",
    icon: "translate",
    color: "#F59E0B",
    greeting: "தமிழில் பேசுங்கள்",
    iosSupported: true,
  },
];

const AIVoicePrompt = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get parameters from route
  const source = route.params?.source || null;
  const cartId = route.params?.cartId || null;
  const cartName = route.params?.cartName || null;
  const returnToCart = route.params?.returnToCart || false;

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [speechStarted, setSpeechStarted] = useState(false);
  const [recognizedText, setRecognizedText] = useState("");
  const [partialText, setPartialText] = useState("");
  const [voiceError, setVoiceError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  // Language and UI states
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [listeningDuration, setListeningDuration] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [voiceInitialized, setVoiceInitialized] = useState(false);

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Scroll and input refs
  const scrollViewRef = useRef(null);
  const inputSectionRef = useRef(null);
  const [inputSectionY, setInputSectionY] = useState(0);

  // Passport upload states (only for flights)
  const [passportImages, setPassportImages] = useState([]);
  const [uploadingPassport, setUploadingPassport] = useState(false);
  const [passengers, setPassengers] = useState([{ id: 1, passports: [] }]);

  // Initialize animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideUpAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    if (Voice) {
      initializeVoice();
    }

    return () => {
      cleanup();
    };
  }, []);

  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (isListening || speechStarted) {
          stopListening();
        }
        // Return false to allow default back behavior
        return false;
      }
    );

    return () => backHandler.remove();
  }, [isListening, speechStarted]);

  // Reset processing state when screen comes back into focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset processing flag when returning to this screen
      setIsProcessing(false);
      
      // Clean up any lingering voice recognition
      return () => {
        if (Voice && (isListening || speechStarted)) {
          Voice.stop().catch(() => {});
          Voice.cancel().catch(() => {});
        }
      };
    }, [])
  );

  // Re-initialize voice when component becomes active again
  useEffect(() => {
    if (Voice && !isListening && !speechStarted) {
      // Re-initialize voice listeners when idle
      const timer = setTimeout(() => {
        initializeVoice();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [appState]);

  // Listening animations
  useEffect(() => {
    if (isListening) {
      // Pulse animation for mic button
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Wave animations
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(waveAnim1, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim1, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(500),
            Animated.timing(waveAnim2, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim2, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(waveAnim3, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(waveAnim3, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim1.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
      glowAnim.setValue(0);
    }
  }, [isListening]);

  // Timer for listening duration
  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setListeningDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setListeningDuration(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  // Auto-stop after 30 seconds
  useEffect(() => {
    if (listeningDuration >= 30 && isListening) {
      stopListening();
    }
  }, [listeningDuration, isListening]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/active/) && nextAppState === "background") {
        if (isListening || speechStarted) {
          try {
            await Voice.stop();
            await Voice.cancel();
            setIsListening(false);
            setSpeechStarted(false);
          } catch (error) {
            console.log("Error stopping voice before background:", error);
          }
        }
      }
      setAppState(nextAppState);
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [appState, isListening, speechStarted]);

  const setupVoiceListeners = () => {
    if (!Voice) return;
    
    try {
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechPartialResults = onSpeechPartialResults;
    } catch (error) {
      console.log("Error setting up voice listeners:", error);
    }
  };

  const initializeVoice = async () => {
    if (!Voice) return;

    try {
      // First, clean up any existing voice instance
      try {
        await Voice.destroy();
      } catch (e) {
        // Ignore errors during destroy
      }

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Set up fresh listeners
      setupVoiceListeners();
      setVoiceInitialized(true);
    } catch (error) {
      console.log("Voice initialization error:", error);
      setVoiceInitialized(false);
    }
  };

  const cleanup = async () => {
    if (Voice && (isListening || speechStarted)) {
      try {
        await Voice.stop();
        await Voice.cancel();
        await Voice.destroy();
      } catch (error) {
        console.log("Voice cleanup error:", error);
      }
    }
    setVoiceInitialized(false);
  };

  // Handle back navigation
  const handleBackNavigation = () => {
    if (returnToCart) {
      // Navigate back to Cart page specifically
      navigation.navigate("Cart");
    } else {
      // Default back behavior
      navigation.goBack();
    }
  };

  const onSpeechStart = () => {
    setIsListening(true);
    setSpeechStarted(true);
    setVoiceError(null);
  };

  const onSpeechEnd = () => {
    setIsListening(false);
    setSpeechStarted(false);
    // Removed automatic processing
  };

  const onSpeechResults = (e) => {
    // Prevent updating state if we're already processing/navigating
    if (isProcessing) {
      return;
    }
    
    const results = e.value || [];
    if (results.length > 0) {
      const recognizedTextResult = results[0];
      console.log(`Speech recognized in ${selectedLanguage.name}:`, recognizedTextResult);
      setRecognizedText(recognizedTextResult);
      // Update the text input with recognized text
      setUserPrompt(recognizedTextResult);
    }
  };

  const onSpeechError = (e) => {
    console.log("Speech error:", e);
    console.log("Current language:", selectedLanguage.code, selectedLanguage.name);
    
    // Don't show errors for common cases - just reset silently
    setIsListening(false);
    setSpeechStarted(false);
    setIsProcessing(false);
    
    // Check for language not supported error
    if (e.error?.code === "language-not-supported" || e.error?.code === "9") {
      let languageErrorMessage;
      
      if (Platform.OS === 'ios') {
        // iOS-specific language error messages
        if (selectedLanguage.code === "si-LK") {
          languageErrorMessage = "iOS doesn't support Sinhala voice recognition. Please use English voice or type in Sinhala below.";
        } else if (selectedLanguage.code.startsWith("ta-")) {
          languageErrorMessage = "Please ensure Tamil is enabled in iPhone Settings > General > Keyboard > Keyboards. Or use English voice / type in Tamil below.";
        } else {
          languageErrorMessage = `${selectedLanguage.name} might not be supported on your iOS device. Please try English or type your request.`;
        }
      } else {
        // Android-specific messages
        languageErrorMessage = selectedLanguage.code === "si-LK"
          ? "Sinhala voice recognition might not be fully supported on your device. Please try typing or switch to English."
          : selectedLanguage.code.startsWith("ta-")
          ? "Tamil voice recognition might not be fully supported on your device. Please try typing or switch to English."
          : "This language might not be supported on your device. Please try English.";
      }
      
      setVoiceError(languageErrorMessage);
    } else if (e.error?.code === "audio" || e.error?.code === "client") {
      setVoiceError("Please allow microphone access");
    } else if (
      e.error?.code === "network_timeout" ||
      e.error?.code === "network"
    ) {
      setVoiceError("Please check your internet connection");
    } else if (
      e.error?.code === "no-speech" ||
      e.error?.code === "7" ||
      e.error?.code === 7 ||
      e.error === "7" ||
      e.error === 7
    ) {
      // No speech detected - show helpful message
      const noSpeechMessage = selectedLanguage.code === "si-LK"
        ? "කරුණාකර සිංහලෙන් කථා කරන්න හෝ ටයිප් කරන්න"
        : selectedLanguage.code.startsWith("ta-")
        ? "தயவுசெய்து தமிழில் பேசுங்கள் அல்லது தட்டச்சு செய்யுங்கள்"
        : "Please speak something to create your dream itinerary. Tell me about your travel plans!";
      setVoiceError(noSpeechMessage);
    }
    // For other errors, don't show anything - let user try again
    
    // Reinitialize voice for next use
    setTimeout(() => {
      initializeVoice();
    }, 500);
  };

  const onSpeechPartialResults = (e) => {
    // Prevent updating state if we're already processing/navigating
    if (isProcessing) {
      return;
    }
    
    if (e.value && e.value.length > 0) {
      setPartialText(e.value[0]);
    }
  };

  const startListening = async () => {
    if (!Voice) {
      setVoiceError("Voice feature is not available");
      return;
    }

    try {
      // Reset states
      setRecognizedText("");
      setPartialText("");
      setVoiceError(null);
      setIsProcessing(false);
      setListeningDuration(0);

      // Stop any ongoing recognition
      if (isListening || speechStarted) {
        await Voice.stop();
        await Voice.cancel();
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Reinitialize voice to ensure listeners are properly set
      await initializeVoice();
      
      // Additional delay to ensure everything is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Get platform-specific language code
      const languageCode = Platform.OS === 'ios' 
        ? selectedLanguage.iosCode 
        : (selectedLanguage.androidCode || selectedLanguage.code);

      // Check iOS language support and show warning if needed
      if (Platform.OS === 'ios' && !selectedLanguage.iosSupported && selectedLanguage.iosFallbackMessage) {
        setVoiceError(selectedLanguage.iosFallbackMessage);
        // Still proceed with fallback language
      }

      // Start recognition with platform-specific language
      console.log(`Starting voice recognition on ${Platform.OS} with language: ${languageCode} (${selectedLanguage.name})`);
      console.log(`Selected language details:`, {
        name: selectedLanguage.name,
        code: selectedLanguage.code,
        iosCode: selectedLanguage.iosCode,
        androidCode: selectedLanguage.androidCode,
        iosSupported: selectedLanguage.iosSupported
      });

      await Voice.start(languageCode);
      setSpeechStarted(true);
      setIsListening(true);
    } catch (error) {
      console.error("Start listening error:", error);
      console.error("Language attempted:", selectedLanguage.code);
      console.error("Platform:", Platform.OS);
      
      // Provide platform-specific error message
      const errorMessage = Platform.OS === 'ios' && !selectedLanguage.iosSupported
        ? `iOS doesn't support ${selectedLanguage.name} speech recognition. Please use English or type your request.`
        : "Please try again";
      
      setVoiceError(errorMessage);
      setIsListening(false);
      setSpeechStarted(false);
      
      // Try to reinitialize for next attempt
      await initializeVoice();
    }
  };

  const stopListening = async () => {
    if (!Voice) return;

    try {
      await Voice.stop();
      setSpeechStarted(false);
      setIsListening(false);
      
      // Reinitialize for next use
      setTimeout(() => {
        initializeVoice();
      }, 300);
    } catch (error) {
      console.error("Stop listening error:", error);
      setSpeechStarted(false);
      setIsListening(false);
      
      // Try to reinitialize anyway
      setTimeout(() => {
        initializeVoice();
      }, 300);
    }
  };

  const { mainUserData, setMainUserData } = useContext(MainDataContext);
  const { currencyData } = useContext(CurrencyData);
  const cusID = mainUserData?.id;

  // Function to scroll to the input section
  const scrollToInput = () => {
    if (scrollViewRef.current && inputSectionY > 0) {
      scrollViewRef.current.scrollTo({
        y: inputSectionY - 20, // Add some padding above the input
        animated: true,
      });
    }
  };

  // Passport upload functions
  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera to capture passport photos.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const addPassenger = () => {
    const newPassenger = {
      id: passengers.length + 1,
      passports: []
    };
    setPassengers([...passengers, newPassenger]);
  };

  const removePassenger = (passengerId) => {
    if (passengers.length === 1) {
      const message = selectedLanguage.code === "si-LK"
        ? "අවම වශයෙන් එක් මගියෙකු අවශ්‍යයි"
        : selectedLanguage.code === "ta-IN"
        ? "குறைந்தது ஒரு பயணி தேவை"
        : "At least one passenger is required";
      Alert.alert("", message);
      return;
    }
    setPassengers(passengers.filter(p => p.id !== passengerId));
  };

  const selectPassportImage = (passengerId) => {
    const passenger = passengers.find(p => p.id === passengerId);
    if (passenger && passenger.passports.length >= 2) {
      const title = selectedLanguage.code === "si-LK"
        ? "සීමාව ළඟා විය"
        : selectedLanguage.code === "ta-IN"
        ? "வரம்பை அடைந்தது"
        : "Limit Reached";
      const message = selectedLanguage.code === "si-LK"
        ? "මෙම මගියා සඳහා passport පිටු 2ක් දැනටමත් උඩුගත කර ඇත."
        : selectedLanguage.code === "ta-IN"
        ? "இந்த பயணிக்கு ஏற்கனவே 2 பாஸ்போர்ட் பக்கங்கள் பதிவேற்றப்பட்டுள்ளன."
        : "Already uploaded 2 passport pages for this passenger.";
      Alert.alert(title, message);
      return;
    }

    const alertTitle = selectedLanguage.code === "si-LK"
      ? "Passport උඩුගත කරන්න"
      : selectedLanguage.code === "ta-IN"
      ? "பாஸ்போர்ட் பதிவேற்றவும்"
      : "Upload Passport";
    const alertMessage = selectedLanguage.code === "si-LK"
      ? "ඔබේ passport උඩුගත කිරීමට විකල්පයක් තෝරන්න"
      : selectedLanguage.code === "ta-IN"
      ? "உங்கள் பாஸ்போர்ட்டை பதிவேற்ற ஒரு விருப்பத்தை தேர்வு செய்யவும்"
      : "Choose an option to upload your passport";
    const takePhotoText = selectedLanguage.code === "si-LK"
      ? "ඡායාරූපයක් ගන්න"
      : selectedLanguage.code === "ta-IN"
      ? "புகைப்படம் எடுக்கவும்"
      : "Take Photo";
    const chooseGalleryText = selectedLanguage.code === "si-LK"
      ? "Gallery එකෙන් තෝරන්න"
      : selectedLanguage.code === "ta-IN"
      ? "கேலரியில் இருந்து தேர்வு செய்யவும்"
      : "Choose from Gallery";
    const cancelText = selectedLanguage.code === "si-LK"
      ? "අවලංගු කරන්න"
      : selectedLanguage.code === "ta-IN"
      ? "ரத்து செய்"
      : "Cancel";

    Alert.alert(
      alertTitle,
      alertMessage,
      [
        {
          text: takePhotoText,
          onPress: async () => {
            const hasPermission = await requestCameraPermission();
            if (Platform.OS === "android" && !hasPermission) {
              const deniedTitle = selectedLanguage.code === "si-LK"
                ? "අවසරය ප්‍රතික්ෂේප විය"
                : selectedLanguage.code === "ta-IN"
                ? "அனுமதி மறுக்கப்பட்டது"
                : "Permission Denied";
              const deniedMessage = selectedLanguage.code === "si-LK"
                ? "ඡායාරූප ගැනීමට Camera ප්‍රවේශය අවශ්‍යයි."
                : selectedLanguage.code === "ta-IN"
                ? "புகைப்படம் எடுக்க கேமரா அணுகல் தேவை."
                : "Camera access is required to take photos.";
              Alert.alert(deniedTitle, deniedMessage);
              return;
            }
            const options = {
              mediaType: "photo",
              quality: 0.8,
              maxWidth: 1920,
              maxHeight: 1920,
            };

            launchCamera(options, (response) => {
              handlePassportImageResponse(response, passengerId);
            });
          },
        },
        {
          text: chooseGalleryText,
          onPress: () => {
            const options = {
              mediaType: "photo",
              quality: 0.8,
              maxWidth: 1920,
              maxHeight: 1920,
            };

            launchImageLibrary(options, (response) => {
              handlePassportImageResponse(response, passengerId);
            });
          },
        },
        {
          text: cancelText,
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handlePassportImageResponse = (response, passengerId) => {
    if (response.didCancel) {
      console.log("User cancelled image picker");
      return;
    }

    if (response.errorCode) {
      console.error("Error: ", response.errorMessage);
      const errorTitle = selectedLanguage.code === "si-LK"
        ? "දෝෂයක්"
        : selectedLanguage.code === "ta-IN"
        ? "பிழை"
        : "Error";
      const errorMessage = selectedLanguage.code === "si-LK"
        ? "ඡායාරූපය තෝරාගැනීමට අසමර්ථ විය"
        : selectedLanguage.code === "ta-IN"
        ? "படத்தை தேர்ந்தெடுக்க முடியவில்லை"
        : "Failed to select image";
      Alert.alert(errorTitle, errorMessage);
      return;
    }

    const asset = response.assets[0];
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    if (!asset.fileSize) {
      const unableTitle = selectedLanguage.code === "si-LK"
        ? "සකසන්න නොහැකිය"
        : selectedLanguage.code === "ta-IN"
        ? "செயலாக்க முடியவில்லை"
        : "Unable to Process";
      const unableMessage = selectedLanguage.code === "si-LK"
        ? "ඡායාරූප ප්‍රමාණය තීරණය කළ නොහැක. කරුණාකර වෙනත් ඡායාරූපයක් උත්සාහ කරන්න."
        : selectedLanguage.code === "ta-IN"
        ? "படத்தின் அளவை தீர்மானிக்க முடியவில்லை. தயவுசெய்து வேறு படத்தை முயற்சிக்கவும்."
        : "Cannot determine image size. Please try a different image.";
      Alert.alert(unableTitle, unableMessage);
      return;
    }

    if (asset.fileSize > MAX_FILE_SIZE) {
      const fileSizeMB = (asset.fileSize / (1024 * 1024)).toFixed(2);
      const tooLargeTitle = selectedLanguage.code === "si-LK"
        ? "ඡායාරූපය ඉතා විශාලයි"
        : selectedLanguage.code === "ta-IN"
        ? "படம் மிகப் பெரியது"
        : "Image Too Large";
      const tooLargeMessage = selectedLanguage.code === "si-LK"
        ? `මෙම ඡායාරූපය ${fileSizeMB}MB වේ. කරුණාකර 5MB ට අඩු ඡායාරූපයක් තෝරන්න.`
        : selectedLanguage.code === "ta-IN"
        ? `இந்த படம் ${fileSizeMB}MB உள்ளது. தயவுசெய்து 5MB க்கும் குறைவான படத்தை தேர்வு செய்யவும்.`
        : `This image is ${fileSizeMB}MB. Please choose an image smaller than 5MB.`;
      Alert.alert(tooLargeTitle, tooLargeMessage);
      return;
    }

    // Add passport to specific passenger
    setPassengers(prevPassengers => 
      prevPassengers.map(p => 
        p.id === passengerId 
          ? { ...p, passports: [...p.passports, asset] }
          : p
      )
    );
  };

  const removePassportImage = (passengerId, imageIndex) => {
    setPassengers(prevPassengers =>
      prevPassengers.map(p =>
        p.id === passengerId
          ? { ...p, passports: p.passports.filter((_, i) => i !== imageIndex) }
          : p
      )
    );
  };

  const processVoiceCommand = async () => {
    const finalText = userPrompt.trim();
    
    if (!finalText) {
      setVoiceError("Please speak something to create your itinerary. Describe your dream destination, activities, or travel preferences!");
      return;
    }

    // Validate minimum character count
    if (finalText.length < 10) {
      const minCharMessage = source === "flights" 
        ? "Please provide more details about your flight. Your input should be at least 10 characters long."
        : "Please provide more details about your travel plans. Your input should be at least 10 characters long.";
      setVoiceError(minCharMessage);
      return;
    }

    // Validate minimum word count (at least 3 words)
    const words = finalText.split(/\s+/).filter(word => word.length > 0);
    if (words.length < 3) {
      const minWordMessage = source === "flights"
        ? "Please describe your flight with at least 3 words. For example: 'Flight to Singapore tomorrow' or 'Colombo to Bangkok next week'"
        : "Please describe your travel plans with at least 3 words. For example: 'Beach vacation in Sri Lanka' or 'City tour of Singapore'";
      setVoiceError(minWordMessage);
      return;
    }

    // Stop any active voice recognition before processing
    if (Voice && (isListening || speechStarted)) {
      try {
        await Voice.stop();
        await Voice.cancel();
        setIsListening(false);
        setSpeechStarted(false);
      } catch (error) {
        console.log("Error stopping voice before navigation:", error);
      }
    }

    // If coming from flights page, call the flight automation API
    if (source === "flights") {
      setIsProcessing(true);
      
      // Prepare passport data if available
      const hasPassports = passengers.some(p => p.passports.length > 0);
      const passportData = hasPassports ? {
        hasPassport: true,
        passengerCount: passengers.length,
        passengers: passengers.map(p => ({
          passengerId: p.id,
          passportCount: p.passports.length,
          passports: p.passports.map(img => ({
            uri: img.uri,
            fileName: img.fileName,
            type: img.type,
          }))
        }))
      } : null;

      console.log({
          prompt: finalText,
          userId: cusID || '10914702',
          currency: currencyData?.base || 'USD',
          fullyBooking: false,
          language: selectedLanguage.code,
          passport: passportData
        },"Loggggg dataataaaaaaa")
      try {
        // Call the backend API for flight automation
        const requestPayload = {
          prompt: finalText,
          userId: cusID || '10914702',
          currency: currencyData?.base || 'USD',
          fullyBooking: false,
          language: selectedLanguage.code,
        };

        // Add passport data if available
        if (passportData) {
          requestPayload.passport = passportData;
        }

        const response = await axios.post('/flights/automate-booking', requestPayload);

        console.log("Flight automation API response:", response.data);
        
        setIsProcessing(false);

        // Check if the response is successful
        if (response.data && response.status === 200) {
          // Extract the search criteria from the response
          const searchCriteria = response.data.data || response.data.searchCriteria || response.data;
          
          // Attach passport data to search criteria for later use
          if (passportData) {
            searchCriteria.passportData = passportData;
          }
          
          console.log("Navigating to FlightsMainMeta with data:", searchCriteria);
          
          // Navigate to FlightsMainMeta with the search criteria
          navigation.navigate("FlightsMainMeta", searchCriteria);
        } else {
          setVoiceError("Failed to process your flight request. Please try again.");
        }
      } catch (error) {
        setIsProcessing(false);
        console.error("Error calling flight automation API:", error);
        setVoiceError(error.response?.data?.message || "Failed to process your request. Please try again.");
      }
    } else if (source === "cartEdit") {
      // Set processing flag before navigation to prevent voice updates
      setIsProcessing(true);
      
      // If coming from cart edit, pass cart_id to the itinerary loading screen
      navigation.navigate("ItineraryLoadingScreen", {
        recognizedText: finalText,
        userId: cusID,
        cartId: cartId,
        cartName: cartName,
        isEditing: true,
      });
    } else {
      // Set processing flag before navigation to prevent voice updates
      setIsProcessing(true);
      
      // Navigate to regular loading screen for general itinerary
      navigation.navigate("ItineraryLoadingScreen", {
        recognizedText: finalText,
        userId: cusID,
      });
    }
  };

  const changeLanguage = async (language) => {
    if (isListening) {
      await stopListening();
    }
    setSelectedLanguage(language);
    setRecognizedText("");
    setPartialText("");
    setVoiceError(null);
    setShowLanguageSelector(false);
    
    // Reinitialize voice with new language
    setTimeout(() => {
      initializeVoice();
    }, 200);
  };

  // Get example text based on language and source
  const getExampleText = () => {
    if (source === "flights") {
      // Flight search examples
      if (selectedLanguage.code === "si-LK") {
        return "Colombo සිට Singapore යන්න flight එකක් ඕනේ. January 15 යන්න එන්න January 25 හොඳයි. Economy class එකක් ඕනේ.";
      } else if (selectedLanguage.code === "ta-IN") {
        return "Colombo இலிருந்து Singapore க்கு flight வேண்டும். January 15 போக வேண்டும், January 25 திரும்ப வர வேண்டும். Economy class வேண்டும்.";
      } else {
        return "I need a flight from Colombo to Singapore. I want to travel on January 15th and return on January 25th. Please find me an economy class ticket.";
      }
    } else {
      // Itinerary/tour examples
      if (selectedLanguage.code === "si-LK") {
        return "Singapore එකට holiday package එකක් ඕනේ. Universal Studios සහ Gardens by the Bay බලන්න ඕනේ. Colombo සිට Singapore යන්න flight එකක් දෙන්න. January 15 සිට 25 දක්වා travel කරන්න plan කරනවා. හොඳ itinerary එකක් හදන්න.";
      } else if (selectedLanguage.code === "ta-IN") {
        return "Singapore க்கு holiday package வேண்டும். Universal Studios மற்றும் Gardens by the Bay பார்க்க வேண்டும். Colombo இலிருந்து Singapore க்கு flight கொடுங்கள். January 15 முதல் 25 வரை travel செய்ய plan செய்கிறேன். நல்ல itinerary உருவாக்குங்கள்.";
      } else {
        return "I need a holiday package in Singapore. I want to visit Universal Studios and Gardens by the Bay. Give me a flight from Colombo to Singapore. I'm planning to travel from January 15th to 25th. Please create me a proper itinerary.";
      }
    }
  };

  // Get tip subtext based on source
  const getTipSubtext = () => {
    if (source === "flights") {
      if (selectedLanguage.code === "si-LK") {
        return "💡 ඇතුළත් කරන්න: departure city, destination, travel dates, class type";
      } else if (selectedLanguage.code === "ta-IN") {
        return "💡 சேர்க்க வேண்டியவை: departure city, destination, travel dates, class type";
      } else {
        return "💡 Include: departure city, destination, travel dates, class type for best results";
      }
    } else {
      if (selectedLanguage.code === "si-LK") {
        return "💡 ඇතුළත් කරන්න: destination, activities, dates, departure city";
      } else if (selectedLanguage.code === "ta-IN") {
        return "💡 சேர்க்க வேண்டியவை: destination, activities, dates, departure city";
      } else {
        return "💡 Include: destination, activities, dates, departure city for best results";
      }
    }
  };

  const renderLanguageSelector = () => (
    <View style={styles.languageSelectorContainer}>
      <Text style={styles.languageSelectorTitle}>
        {selectedLanguage.code === "si-LK"
          ? "භාෂාව තෝරන්න"
          : selectedLanguage.code === "ta-IN"
          ? "மொழியை தேர்ந்தெடுக்கவும்"
          : "Select Language"}
      </Text>
      <View style={styles.languageGrid}>
        {LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.languageCard,
              selectedLanguage.code === lang.code && {
                borderColor: lang.color,
                borderWidth: 3,
                backgroundColor: `${lang.color}10`,
              },
            ]}
            onPress={() => changeLanguage(lang)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.languageIconWrapper,
                { backgroundColor: lang.color },
              ]}
            >
              <MaterialCommunityIcons
                name={lang.icon}
                size={24}
                color="white"
              />
            </View>
            <Text style={styles.languageDisplayName}>{lang.displayName}</Text>
            <Text style={styles.languageName}>{lang.name}</Text>
            {selectedLanguage.code === lang.code && (
              <View style={styles.selectedBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={18}
                  color={lang.color}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMicrophoneButton = () => {
    const buttonColor = isListening
      ? "#FF4757"
      : voiceError
      ? "#95A5A6"
      : selectedLanguage.color;

    return (
      <View style={styles.microphoneWrapper}>
        {/* Animated waves */}
        {isListening && (
          <>
            <Animated.View
              style={[
                styles.wave,
                {
                  backgroundColor: selectedLanguage.color,
                  opacity: waveAnim1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0],
                  }),
                  transform: [
                    {
                      scale: waveAnim1.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.8],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                {
                  backgroundColor: selectedLanguage.color,
                  opacity: waveAnim2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 0],
                  }),
                  transform: [
                    {
                      scale: waveAnim2.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.wave,
                {
                  backgroundColor: selectedLanguage.color,
                  opacity: waveAnim3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.2, 0],
                  }),
                  transform: [
                    {
                      scale: waveAnim3.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.2],
                      }),
                    },
                  ],
                },
              ]}
            />
          </>
        )}

        {/* Glow effect */}
        {isListening && (
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: selectedLanguage.color,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.4],
                }),
              },
            ]}
          />
        )}

        {/* Main button */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <TouchableOpacity
            onPress={isListening ? stopListening : startListening}
            disabled={!Voice || isProcessing}
            activeOpacity={0.85}
            style={[
              styles.micButton,
              {
                backgroundColor: buttonColor,
                shadowColor: buttonColor,
              },
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator size="large" color="white" />
            ) : (
              <MaterialCommunityIcons
                name={isListening ? "stop-circle-outline" : "microphone"}
                size={48}
                color="white"
              />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const getStatusDisplay = () => {
    if (isProcessing) {
      return {
        icon: "cog",
        color: selectedLanguage.color,
        title: "Processing...",
        subtitle: "Analyzing your input",
        bgColor: `${selectedLanguage.color}15`,
      };
    }

    if (voiceError) {
      return {
        icon: "alert-circle-outline",
        color: "#F59E0B",
        title: "Oops!",
        subtitle: voiceError,
        bgColor: "#FEF3C7",
      };
    }

    if (isListening) {
      const languageHint = selectedLanguage.code === "si-LK" 
        ? "සිංහලෙන් කථා කරන්න" 
        : selectedLanguage.code === "ta-LK"
        ? "தமிழில் பேசுங்கள்"
        : "Speak in English";
      
      const defaultSubtitle = source === "flights"
        ? `${languageHint} - Tell me your departure city, destination, and travel dates`
        : source === "cartEdit"
        ? `${languageHint} - Tell me what changes you'd like to make to your itinerary`
        : `${languageHint} - Tell me about your dream trip`;
      
      return {
        icon: "waveform",
        color: selectedLanguage.color,
        title: "Listening...",
        subtitle: partialText || defaultSubtitle,
        bgColor: `${selectedLanguage.color}15`,
      };
    }

    if (recognizedText) {
      return {
        icon: "check-circle",
        color: "#10B981",
        title: "Got it!",
        subtitle: recognizedText,
        bgColor: "#D1FAE5",
      };
    }

    const defaultTitle = source === "flights" 
      ? "Ready to Find Your Flight"
      : source === "cartEdit"
      ? "Ready to Edit Your Itinerary"
      : "Ready to Create Your Itinerary";
    
    const defaultSubtitle = source === "flights"
      ? (selectedLanguage.code === "si-LK"
        ? "මයික්‍රෝෆෝනය එබීමෙන් ඔබේ පිටත්වීමේ නගරය, ගමනාන්තය සහ ගමන් දින කියන්න"
        : selectedLanguage.code === "ta-LK"
        ? "மைக்ரோஃபோனைத் தட்டி உங்கள் புறப்படும் நகரம், இலக்கு மற்றும் பயண தேதிகளை சொல்லுங்கள்"
        : "Tap the mic and tell me your departure city, destination, and travel dates")
      : source === "cartEdit"
      ? (selectedLanguage.code === "si-LK"
        ? "මයික්‍රෝෆෝනය එබීමෙන් ඔබට අවශ්‍ය වෙනස්කම් කියන්න"
        : selectedLanguage.code === "ta-LK"
        ? "மைக்ரோஃபோனைத் தட்டி நீங்கள் செய்ய விரும்பும் மாற்றங்களை சொல்லுங்கள்"
        : "Tap the mic and tell me what changes you'd like to make")
      : (selectedLanguage.code === "si-LK"
        ? "මයික්‍රෝෆෝනය එබීමෙන් සිංහලෙන් ඔබේ සිහින ගමන් මාර්ගය ගැන කියන්න"
        : selectedLanguage.code === "ta-LK"
        ? "மைக்ரோஃபோனைத் தட்டி தமிழில் உங்கள் கனவு பயணத்தைப் பற்றி சொல்லுங்கள்"
        : "Tap the mic and tell me about your dream destination, travel dates, activities, or preferences");

    return {
      icon: "microphone-outline",
      color: "#6B7280",
      title: defaultTitle,
      subtitle: defaultSubtitle,
      bgColor: "#F8F9FA",
    };
  };

  const statusDisplay = getStatusDisplay();

  if (!Voice) {
    return (
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <MaterialCommunityIcons
            name="microphone-off"
            size={80}
            color="#95A5A6"
          />
          <Text style={styles.unavailableTitle}>
            Voice Recognition Unavailable
          </Text>
          <Text style={styles.unavailableText}>
            Voice recognition is not supported on this device or platform.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackNavigation}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={source === "flights" ? styles.headerCompact : styles.header}>
            <TouchableOpacity
              style={styles.backIcon}
              onPress={handleBackNavigation}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#1A1A2E"
              />
            </TouchableOpacity>

            {source === "flights" ? (
              // Compact header for flights
              <View style={styles.headerContentCompact}>
                <View style={styles.flightHeaderRow}>
                  <MaterialCommunityIcons
                    name="airplane"
                    size={28}
                    color={selectedLanguage.color}
                  />
                  <Text style={styles.headerTitleCompact}>
                    {selectedLanguage.code === "si-LK" 
                      ? "AI Flight සෙවුම" 
                      : selectedLanguage.code === "ta-IN"
                      ? "AI விமான தேடல்"
                      : "AI Flight Search"}
                  </Text>
                </View>
              </View>
            ) : (
              // Full header for itinerary/cart
              <View style={styles.headerContent}>
                <View style={styles.headerIconWrapper}>
                  <MaterialCommunityIcons
                    name={source === "cartEdit" ? "cart-outline" : "map-marker-path"}
                    size={32}
                    color={selectedLanguage.color}
                  />
                </View>
                <Text style={styles.headerTitle}>
                  {source === "cartEdit"
                    ? (selectedLanguage.code === "si-LK"
                      ? "ඔබේ Itinerary සංස්කරණය කරන්න"
                      : selectedLanguage.code === "ta-IN"
                      ? "உங்கள் பயண திட்டத்தை திருத்துங்கள்"
                      : "Edit Your Itinerary")
                    : (selectedLanguage.code === "si-LK"
                      ? "AI Itinerary නිර්මාණකරු"
                      : selectedLanguage.code === "ta-IN"
                      ? "AI பயண திட்ட உருவாக்கி"
                      : "AI Itinerary Creator")}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {source === "cartEdit"
                    ? (selectedLanguage.code === "si-LK"
                      ? `"${cartName}" වෙනස් කරන්න - ඔබට අවශ්‍ය වෙනස්කම් කියන්න`
                      : selectedLanguage.code === "ta-IN"
                      ? `"${cartName}" மாற்றவும் - நீங்கள் விரும்பும் மாற்றங்களைச் சொல்லுங்கள்`
                      : `Modify "${cartName}" by telling me what changes you'd like to make`)
                    : (selectedLanguage.code === "si-LK"
                      ? "ඔබේ සිහින ගමන විස්තර කරන්න, AI සැලසුම සකසනු ලබයි"
                      : selectedLanguage.code === "ta-IN"
                      ? "உங்கள் கனவு பயணத்தை விவரிக்கவும், AI திட்டமிடும்"
                      : "Describe your dream trip and let AI plan everything")}
                </Text>
              </View>
            )}
          </View>

          {/* Language Selector Button */}
          <TouchableOpacity
            style={[
              styles.currentLanguageButton,
              { borderColor: selectedLanguage.color },
            ]}
            onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="translate"
              size={18}
              color={selectedLanguage.color}
            />
            <Text style={styles.currentLanguageText}>
              {selectedLanguage.displayName}
            </Text>
            <MaterialCommunityIcons
              name={showLanguageSelector ? "chevron-up" : "chevron-down"}
              size={18}
              color={selectedLanguage.color}
            />
          </TouchableOpacity>

          {/* Language Selector */}
          {showLanguageSelector && renderLanguageSelector()}

          {/* Language Reminder Banner */}
          {(selectedLanguage.code === "si-LK" || selectedLanguage.code === "ta-LK") && !isListening && (
            <View style={[styles.languageReminderBanner, { backgroundColor: `${selectedLanguage.color}15`, borderColor: selectedLanguage.color }]}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color={selectedLanguage.color}
              />
              <Text style={[styles.languageReminderText, { color: selectedLanguage.color }]}>
                {selectedLanguage.code === "si-LK"
                  ? "කරුණාකර සිංහලෙන් කථා කරන්න. ඉංග්‍රීසි කථා කළහොත් ඉංග්‍රීසි අකුරු වලින් පෙන්වනු ඇත."
                  : "தயவுசெய்து தமிழில் பேசுங்கள். ஆங்கிலத்தில் பேசினால் ஆங்கில எழுத்துக்களில் காட்டப்படும்."}
              </Text>
            </View>
          )}

          {/* Microphone Section */}
          <View style={styles.microphoneSection}>
            {renderMicrophoneButton()}

            {isListening && (
              <View style={styles.timerContainer}>
                <MaterialCommunityIcons
                  name="timer-outline"
                  size={14}
                  color="#666"
                />
                <Text style={styles.timerText}>
                  {30 - listeningDuration}s remaining
                </Text>
              </View>
            )}
          </View>

          {/* Status Card - Compact for flights */}
          {source === "flights" ? (
            // Minimal status for flights - only show when needed
            (isListening || voiceError || isProcessing || recognizedText) && (
              <View
                style={[
                  styles.statusCardCompact,
                  { backgroundColor: statusDisplay.bgColor },
                ]}
              >
                <MaterialCommunityIcons
                  name={statusDisplay.icon}
                  size={20}
                  color={statusDisplay.color}
                />
                <Text
                  style={[
                    styles.statusTextCompact,
                    recognizedText && styles.recognizedText,
                  ]}
                  numberOfLines={2}
                >
                  {statusDisplay.subtitle}
                </Text>
              </View>
            )
          ) : (
            // Full status card for itinerary
            <View
              style={[
                styles.statusCard,
                { backgroundColor: statusDisplay.bgColor },
              ]}
            >
              <View
                style={[styles.statusIconWrapper, { backgroundColor: "white" }]}
              >
                <MaterialCommunityIcons
                  name={statusDisplay.icon}
                  size={28}
                  color={statusDisplay.color}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>{statusDisplay.title}</Text>
                <Text
                  style={[
                    styles.statusSubtitle,
                    recognizedText && styles.recognizedText,
                  ]}
                  numberOfLines={3}
                >
                  {statusDisplay.subtitle}
                </Text>
              </View>
            </View>
          )}

          {/* Passport Upload Section - Only for Flights */}
          {source === "flights" && (
            <View style={styles.passportSection}>
              <View style={styles.passportHeader}>
                <MaterialCommunityIcons
                  name="passport"
                  size={20}
                  color={selectedLanguage.color}
                />
                <Text style={styles.passportTitle}>
                  {selectedLanguage.code === "si-LK"
                    ? "Passport විස්තර (අත්‍යවශ්‍ය නොවේ)"
                    : selectedLanguage.code === "ta-IN"
                    ? "பாஸ்போர்ட் விவரங்கள் (விருப்பமானது)"
                    : "Passport Details (Optional)"}
                </Text>
              </View>
              <Text style={styles.passportSubtitle}>
                {selectedLanguage.code === "si-LK"
                  ? "ජාත්‍යන්තර ගුවන් බුකින් වේගවත් කිරීමට passport උඩුගත කරන්න"
                  : selectedLanguage.code === "ta-IN"
                  ? "விரைவான சர்வதேச விமான பதிவுக்கு பாஸ்போர்ட் பதிவேற்றவும்"
                  : "Upload passports for faster international flight booking"}
              </Text>

              {/* Passengers List */}
              {passengers.map((passenger, passengerIndex) => (
                <View key={passenger.id} style={styles.passengerContainer}>
                  <View style={styles.passengerHeader}>
                    <Text style={styles.passengerTitle}>
                      {selectedLanguage.code === "si-LK"
                        ? `මගී ${passengerIndex + 1}`
                        : selectedLanguage.code === "ta-IN"
                        ? `பயணி ${passengerIndex + 1}`
                        : `Passenger ${passengerIndex + 1}`}
                    </Text>
                    {passengers.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removePassenger(passenger.id)}
                        style={styles.removePassengerButton}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={20}
                          color="#DC2626"
                        />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Passport Images for this passenger */}
                  {passenger.passports.length > 0 && (
                    <View style={styles.passportThumbnailsContainer}>
                      {passenger.passports.map((img, imgIndex) => (
                        <View key={imgIndex} style={styles.passportThumbnailItem}>
                          <Image
                            source={{ uri: img.uri }}
                            style={styles.passportThumbnail}
                          />
                          <TouchableOpacity
                            onPress={() => removePassportImage(passenger.id, imgIndex)}
                            style={styles.removeThumbnailButton}
                          >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={16}
                              color="#DC2626"
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Add Passport Button for this passenger */}
                  {passenger.passports.length < 2 && (
                    <TouchableOpacity
                      style={[
                        styles.addPassportButtonCompact,
                        { borderColor: selectedLanguage.color },
                      ]}
                      onPress={() => selectPassportImage(passenger.id)}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="plus"
                        size={16}
                        color={selectedLanguage.color}
                      />
                      <Text
                        style={[
                          styles.addPassportTextCompact,
                          { color: selectedLanguage.color },
                        ]}
                      >
                        {passenger.passports.length === 0
                          ? (selectedLanguage.code === "si-LK"
                            ? "Passport එක් කරන්න"
                            : selectedLanguage.code === "ta-IN"
                            ? "பாஸ்போர்ட் சேர்க்கவும்"
                            : "Add Passport")
                          : (selectedLanguage.code === "si-LK"
                            ? "+ තවත්"
                            : selectedLanguage.code === "ta-IN"
                            ? "+ மேலும்"
                            : "+ Add More")}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}

              {/* Add Another Passenger Button */}
              <TouchableOpacity
                style={[
                  styles.addPassengerButton,
                  { borderColor: selectedLanguage.color },
                ]}
                onPress={addPassenger}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="account-plus-outline"
                  size={18}
                  color={selectedLanguage.color}
                />
                <Text
                  style={[
                    styles.addPassengerText,
                    { color: selectedLanguage.color },
                  ]}
                >
                  {selectedLanguage.code === "si-LK"
                    ? "තවත් මගියෙකු එක් කරන්න"
                    : selectedLanguage.code === "ta-IN"
                    ? "மற்றொரு பயணியை சேர்க்கவும்"
                    : "Add Another Passenger"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.passportNote}>
                {selectedLanguage.code === "si-LK"
                  ? "💡 එක් එක් මගියා සඳහා passport පිටු 2ක් දක්වා උඩුගත කළ හැකිය"
                  : selectedLanguage.code === "ta-IN"
                  ? "💡 ஒவ்வொரு பயணிக்கும் 2 பாஸ்போர்ட் பக்கங்கள் வரை பதிவேற்றலாம்"
                  : "💡 Upload up to 2 passport pages per passenger"}
              </Text>
            </View>
          )}

          {/* Text Input Section */}
          <View 
            ref={inputSectionRef} 
            style={styles.inputSection}
            onLayout={(event) => {
              const { y } = event.nativeEvent.layout;
              setInputSectionY(y);
            }}
          >
            <TouchableOpacity onPress={scrollToInput} activeOpacity={0.7}>
              <Text style={styles.inputLabel}>
                {source === "flights" ? "Flight Details" : "Your Travel Plans"}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder={
                source === "flights" 
                  ? "e.g., Flight from Colombo to Singapore, Jan 15 to Jan 25, Economy class"
                  : "Type or speak your travel plans here..."
              }
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={userPrompt}
              onChangeText={setUserPrompt}
              textAlignVertical="top"
              onFocus={scrollToInput}
            />
            
            {/* Helpful Tip Section */}
            <View style={styles.tipContainer}>
              <View style={styles.tipHeader}>
                <MaterialCommunityIcons
                  name="lightbulb-on-outline"
                  size={18}
                  color="#F59E0B"
                />
                <Text style={styles.tipTitle}>
                  {selectedLanguage.code === "si-LK"
                    ? "උපදෙස්: හොඳම ප්‍රතිඵල ලබා ගන්නේ කෙසේද"
                    : selectedLanguage.code === "ta-IN"
                    ? "உதவிக்குறிப்பு: சிறந்த முடிவுகளை எப்படி பெறுவது"
                    : "Tip: How to get the best results"}
                </Text>
              </View>
              <Text style={styles.tipText}>
                "{getExampleText()}"
              </Text>
              <Text style={styles.tipSubtext}>
                {getTipSubtext()}
              </Text>
            </View>
          </View>

          {/* Create/Search Button */}
          {userPrompt.trim() && (
            <TouchableOpacity
              style={[
                styles.createButton,
                { backgroundColor: selectedLanguage.color },
              ]}
              onPress={processVoiceCommand}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={source === "flights" ? "airplane-search" : "map-marker-path"}
                size={22}
                color="white"
              />
              <Text style={styles.createButtonText}>
                {source === "flights" ? "Search Flights" : "Create My Itinerary"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Error Retry Button */}
          {voiceError && !isListening && (
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: selectedLanguage.color }]}
              onPress={startListening}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>
                {selectedLanguage.code === "si-LK"
                  ? "නැවත උත්සාහ කරන්න"
                  : selectedLanguage.code === "ta-IN"
                  ? "மீண்டும் முயற்சிக்கவும்"
                  : "Try Again"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Tips Section */}
          {/* {!isListening && !recognizedText && !voiceError && (
            <View style={styles.tipsSection}>
              <Text style={styles.tipsTitle}>💡 Tips for Best Results</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={selectedLanguage.color}
                  />
                  <Text style={styles.tipText}>Speak clearly and naturally</Text>
                </View>
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={selectedLanguage.color}
                  />
                  <Text style={styles.tipText}>
                    Find a quiet place for better accuracy
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={selectedLanguage.color}
                  />
                  <Text style={styles.tipText}>You have 30 seconds to speak</Text>
                </View>
                <View style={styles.tipItem}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={selectedLanguage.color}
                  />
                  <Text style={styles.tipText}>
                    Works with native and non-native accents
                  </Text>
                </View>
              </View>
            </View>
          )} */}

          {/* Feature Highlights - Hide for flights to save space */}
          {source !== "flights" && (
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <View
                  style={[styles.featureIcon, { backgroundColor: "#6366F115" }]}
                >
                  <MaterialCommunityIcons
                    name="translate"
                    size={22}
                    color="#6366F1"
                  />
                </View>
                <Text style={styles.featureText}>
                  {selectedLanguage.code === "si-LK"
                    ? "බහු භාෂා"
                    : selectedLanguage.code === "ta-IN"
                    ? "பல மொழி"
                    : "Multi-Language"}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[styles.featureIcon, { backgroundColor: "#EC489915" }]}
                >
                  <MaterialCommunityIcons
                    name="account-voice"
                    size={22}
                    color="#EC4899"
                  />
                </View>
                <Text style={styles.featureText}>
                  {selectedLanguage.code === "si-LK"
                    ? "උච්චාරණ හිතකාමී"
                    : selectedLanguage.code === "ta-IN"
                    ? "உச்சரிப்பு நட்பு"
                    : "Accent Friendly"}
                </Text>
              </View>
              <View style={styles.featureItem}>
                <View
                  style={[styles.featureIcon, { backgroundColor: "#F59E0B15" }]}
                >
                  <MaterialCommunityIcons
                    name="robot"
                    size={22}
                    color="#F59E0B"
                  />
                </View>
                <Text style={styles.featureText}>
                  {selectedLanguage.code === "si-LK"
                    ? "AI බලගතු"
                    : selectedLanguage.code === "ta-IN"
                    ? "AI ஆற்றல்"
                    : "AI Powered"}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    position: "relative",
  },
  headerCompact: {
    paddingTop: 40,
    paddingBottom: 8,
    position: "relative",
  },
  backIcon: {
    position: "absolute",
    left: 0,
    top: 40,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: "center",
    paddingTop: 40,
  },
  headerContentCompact: {
    alignItems: "center",
    paddingTop: 40,
  },
  flightHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A1A2E",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerTitleCompact: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A2E",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  currentLanguageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 8,
  },
  currentLanguageText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    flex: 1,
    textAlign: "center",
  },
  languageSelectorContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  languageSelectorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 12,
    textAlign: "center",
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  languageCard: {
    width: (width - 72) / 3,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  languageIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  languageDisplayName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 2,
  },
  languageName: {
    fontSize: 11,
    color: "#6B7280",
  },
  selectedBadge: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  languageReminderBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1.5,
    gap: 10,
  },
  languageReminderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  microphoneSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  microphoneWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    marginBottom: 12,
  },
  wave: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  glow: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  micButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  statusCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
  },
  statusCardCompact: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  statusIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statusTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A2E",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  statusTextCompact: {
    flex: 1,
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  recognizedText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    fontStyle: "italic",
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  featuresSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
  },
  featureItem: {
    alignItems: "center",
    gap: 6,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
  unavailableContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  unavailableTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A2E",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  unavailableText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  backButton: {
    backgroundColor: colors.PRIMARY,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "white",
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A2E",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: "#1A1A2E",
    minHeight: 120,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  tipContainer: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  tipContainerCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    gap: 6,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
  },
  tipText: {
    fontSize: 12,
    color: "#78350F",
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: 8,
  },
  tipTextCompact: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },
  tipSubtext: {
    fontSize: 11,
    color: "#A16207",
    fontWeight: "500",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 16,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.3,
  },
  passportSection: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  passportHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  passportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A2E",
  },
  passportSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 16,
  },
  passengerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  passengerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  passengerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A2E",
  },
  removePassengerButton: {
    padding: 2,
  },
  passportThumbnailsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  passportThumbnailItem: {
    position: "relative",
  },
  passportThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  removeThumbnailButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addPassportButtonCompact: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: "dashed",
    gap: 6,
    backgroundColor: "#FAFAFA",
  },
  addPassportTextCompact: {
    fontSize: 13,
    fontWeight: "600",
  },
  addPassengerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    gap: 6,
    backgroundColor: "white",
    marginTop: 4,
  },
  addPassengerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  passportNote: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default AIVoicePrompt;
