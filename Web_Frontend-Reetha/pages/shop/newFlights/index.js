import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useContext,
} from "react";
import {
  ArrowUpDown,
  Calendar,
  Users,
  Plane,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Search,
  MapPin,
  Info,
  AlertCircle,
  Minus,
  Filter,
  SlidersHorizontal,
  Check,
  Clock,
  History,
  Sparkles,
} from "lucide-react";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import ChatIcon from "@mui/icons-material/Chat";
import styles from "./FlightSearch.module.css";
import CommonLayout from "../../../components/shop/common-layout";
import FlightResultsMain from "../../../components/NewFlights/FlightResultsMain";
import AirportCodes from "../../../GlobalFunctions/Data/AirportCodes.json";
import AirplaneCodes from "../../../GlobalFunctions/Data/AirplaneCodes.json";
import AIItineraryModal from "../../../components/AIItinerary/AIItineraryModal";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ToastMessage from "../../../components/Notification/ToastMessage";
import ModalBase from "../../../components/common/Modals/ModalBase";
import { getFlightNameMeta } from "../../../GlobalFunctions/flightsMetaFunction";
import AppliedFiltersPortal from "../../../components/NewFlights/FlightsAppliedFilters/FlightsAppliedFilters";
import { AppContext } from "../../_app";
import { db } from "../../../firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import FlightsBannerSlider from "../flights/FlightsBannerSlider "

// Mock airport data - replace with your actual data
const mockAirportData = AirportCodes?.airport_codes;

const classes = ["Economy", "Premium Economy", "Business", "First"];

// Session Storage Helper Functions
const SESSION_STORAGE_KEY = "flight_search_sessions";
const MAX_SESSIONS = 5;

const getSessionStorageKey = (userId) => {
  return `flight_search_sessions_${userId}`;
};

const getStoredSessions = (userId) => {
  try {
    if (!userId) {
      console.log("No user ID provided, returning empty sessions");
      return [];
    }
    
    const storageKey = getSessionStorageKey(userId);
    const sessions = localStorage.getItem(storageKey);
    const parsedSessions = sessions ? JSON.parse(sessions) : [];
    
    console.log("Retrieved sessions for user:", userId, parsedSessions);
    return parsedSessions;
  } catch (error) {
    console.error("Error reading sessions from storage:", error);
    return [];
  }
};

const saveSessionToStorage = (sessions, userId) => {
  try {
    if (!userId) {
      console.warn("No user ID provided, cannot save sessions");
      return;
    }
    
    const storageKey = getSessionStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(sessions));
    
    console.log("Sessions saved for user:", userId, sessions);
  } catch (error) {
    console.error("Error saving sessions to storage:", error);
  }
};

const createSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
const formatSessionDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
};

const getSessionSummary = (searchParams) => {
  const { routes, tripType, passengersClass } = searchParams;
  const totalPassengers =
    passengersClass.passengers.adults +
    passengersClass.passengers.children +
    passengersClass.passengers.infants +
    passengersClass.passengers.students;

  if (tripType === "roundTrip" && routes.length >= 2) {
    return `${routes[0].from} ⇄ ${routes[0].to} • ${totalPassengers} pax`;
  } else if (tripType === "multiCity") {
    return `Multi-city • ${routes.length} flights • ${totalPassengers} pax`;
  } else {
    return `${routes[0].from} → ${routes[0].to} • ${totalPassengers} pax`;
  }
};

const FlightSearch = () => {
  const [tripType, setTripType] = useState("oneWay");
  const router = useRouter();
  const [routes, setRoutes] = useState([
    { from: "", fromCode: "", to: "", toCode: "", departDate: "" },
  ]);
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    students: 0,
  });

  // Session management states
  const [searchSessions, setSearchSessions] = useState([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

// Initialize sessions from storage - USER SPECIFIC
 // Add dependency on user ID

  const getAirlineNameByCode = (data) => {
    return AirplaneCodes?.filter(
      (flight) => flight?.AirlineCode == data
    )?.[0]?.["AlternativeBusinessName"];
  };
  const [travelClass, setTravelClass] = useState("Economy");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState({
    type: "depart",
    routeIndex: 0,
  });
  const [showPassengers, setShowPassengers] = useState(false);
  const [showAirportSelector, setShowAirportSelector] = useState(false);
  const [airportSelectorTarget, setAirportSelectorTarget] = useState({
    field: "from",
    routeIndex: 0,
  });
  
  // New states for inline dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeCalendarDropdown, setActiveCalendarDropdown] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchText, setSearchText] = useState("");
  const [showStudentInfo, setShowStudentInfo] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasValidated, setHasValidated] = useState(false);

  // New states for filtering functionality
  const [appliedFilters, setAppliedFilters] = useState({
    quickFilters: [],
    airlines: [],
    layoverAirports: [],
    sortOption: "BEST",
  });

  // State for airline search in sidebar
  const [airlineSearch, setAirlineSearch] = useState("");

  const [flightSearchData, setFlightSearchData] = useState([]);


    const [flightSearchDataPrePopulate, setFlightSearchDataPrePopulate] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { userStatus, baseCurrencyValue, baseLocation, baseUserId } =
    useContext(AppContext);

  // Add state for sticky search summary
  const [showStickySearchSummary, setShowStickySearchSummary] = useState(false);
  const searchFormRef = useRef(null);

  // AI Itinerary Modal state
  const [showAIModal, setShowAIModal] = useState(false);

  // Cache airport data
  const airportCodes = useMemo(() => mockAirportData || [], []);

  // Check if student mode is active
  const isStudentMode = passengers.students > 0;
useEffect(() => {
  if (baseUserId?.cxid) {
    console.log("Initializing sessions for user:", baseUserId.cxid);
    const storedSessions = getStoredSessions(baseUserId.cxid);
    setSearchSessions(storedSessions);
  } else {
    console.log("No user ID available, clearing sessions");
    setSearchSessions([]);
  }
}, [baseUserId?.cxid]);
  // Count total applied filters
  const totalFiltersApplied = useMemo(() => {
    return (
      appliedFilters.quickFilters.length +
      appliedFilters.airlines.length +
      appliedFilters.layoverAirports.length +
      (appliedFilters.sortOption !== "BEST" ? 1 : 0)
    );
  }, [appliedFilters]);

  // Fix modal flickering with debounced search
  const searchTimeoutRef = useRef(null);
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchText]);

  // Add scroll detection for sticky search summary
  useEffect(() => {
    const handleScroll = () => {
      if (!hasSearched) {
        return;
      }
      
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 600; // Show after scrolling 300px
      
      setShowStickySearchSummary(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasSearched]);

const saveSearchSession = useCallback((searchParams) => {
  if (!baseUserId?.cxid) {
    console.warn("No user ID available, cannot save session");
    return null;
  }

  const sessionId = createSessionId();
  const newSession = {
    id: sessionId,
    timestamp: Date.now(),
    searchParams: searchParams,
    summary: getSessionSummary(searchParams),
    tripType: searchParams.tripType,
    routes: searchParams.routes,
    passengers: searchParams.passengersClass.passengers,
    travelClass: searchParams.passengersClass.travelClass,
  };

  setSearchSessions((prevSessions) => {
    const updatedSessions = [
      newSession,
      ...prevSessions.slice(0, MAX_SESSIONS - 1),
    ];
    saveSessionToStorage(updatedSessions, baseUserId.cxid);
    return updatedSessions;
  });

  setCurrentSessionId(sessionId);
  return sessionId;
}, [baseUserId?.cxid]);

const loadSearchSession = useCallback((session) => {
  const { searchParams } = session;
  console.log("Loading search session data:", searchParams);

  // Set trip type
  setTripType(searchParams.tripType);

  // Reset search results
  setHasSearched(false);

  if (searchParams.tripType === "roundTrip") {
    // For round trip
    const newRoutes = [
      {
        from: `${searchParams.routes[0].from}`,
        fromCode: searchParams.routes[0].fromCode || searchParams.routes[0].from,
        to: `${searchParams.routes[0].to}`,
        toCode: searchParams.routes[0].toCode || searchParams.routes[0].to,
        departDate: searchParams.routes[0].date || "",
      },
    ];
    
    setRoutes(newRoutes);

    // Set return date if available
    if (searchParams.routes.length >= 2) {
      setReturnDate(searchParams.routes[1].date || "");
    } else {
      setReturnDate("");
    }
  } else {
    // For one-way and multi-city
    const newRoutes = searchParams.routes.map((route) => ({
      from: `${route.from}`,
      fromCode: route.fromCode || route.from,
      to: `${route.to}`,
      toCode: route.toCode || route.to,
      departDate: route.date || "",
    }));

    setRoutes(newRoutes);
    setReturnDate("");
  }

  // Set passengers
  setPassengers(searchParams.passengersClass.passengers);

  // Set travel class
  setTravelClass(searchParams.passengersClass.travelClass);

  // Update input values to reflect the loaded data
  const newInputValues = {};
  searchParams.routes.forEach((route, index) => {
    const fromKey = `from_${index}`;
    const toKey = `to_${index}`;
    
    newInputValues[fromKey] = `${route.from}`;
    newInputValues[toKey] = `${route.to}`;
  });
  
  setInputValues(prev => ({ ...prev, ...newInputValues }));

  setShowSessionHistory(false);

  // Show success message
  ToastMessage({
    status: "success",
    message: "Search session loaded successfully",
  });
}, []);
const clearSearchHistory = useCallback(() => {
  if (!baseUserId?.cxid) {
    console.warn("No user ID available, cannot clear history");
    return;
  }

  setSearchSessions([]);
  saveSessionToStorage([], baseUserId.cxid);
  ToastMessage({
    status: "success",
    message: "Search history cleared",
  });
}, [baseUserId?.cxid]);

const deleteSearchSession = useCallback((sessionId) => {
  if (!baseUserId?.cxid) {
    console.warn("No user ID available, cannot delete session");
    return;
  }

  setSearchSessions((prevSessions) => {
    const updatedSessions = prevSessions.filter(
      (session) => session.id !== sessionId
    );
    saveSessionToStorage(updatedSessions, baseUserId.cxid);
    return updatedSessions;
  });
}, [baseUserId?.cxid]);
  useEffect(() => {
    // Only lock scroll for modals (not for inline dropdowns)
    const isModalOpen = showSessionHistory || showStudentInfo;

    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [showSessionHistory, showStudentInfo]);
const getRouteContainerStyle = (routeIndex) => {
  const baseStyle = {};
  
  // For multi-city trips, ensure proper stacking with higher z-index for earlier routes
  if (tripType === "multiCity") {
    return {
      ...baseStyle,
      position: 'relative',
      zIndex: 1000 - routeIndex, // Higher z-index for earlier routes
      backgroundColor: '#ffffff',
      marginBottom: '16px', // Add spacing between routes
      borderRadius: '8px',
      boxShadow: routeIndex > 0 ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
    };
  }
  
  return baseStyle;
};

const getFieldGroupStyle = (isActive, routeIndex) => {
  const baseStyle = {
    position: 'relative'
  };
  
  if (isActive) {
    return {
      ...baseStyle,
      zIndex: 10000 + routeIndex, // Very high z-index for active dropdowns
    };
  }
  
  return baseStyle;
};
const SessionHistoryModal = () => {
  const handleDeleteSession = (sessionId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!baseUserId?.cxid) {
      ToastMessage({
        status: "warning",
        message: "Please log in to manage search history"
      });
      return;
    }
    
    const updatedSessions = searchSessions.filter(session => session.id !== sessionId);
    setSearchSessions(updatedSessions);
    saveSessionToStorage(updatedSessions, baseUserId.cxid);
  };
// Add this to your FlightSearch component

  const handleLoadSession = (session) => {
    console.log("Loading session:", session);
    loadSearchSession(session);
    setShowSessionHistory(false);
  };

  const handleClearHistory = (event) => {
    if (event) {
      event.stopPropagation();
    }
    
    if (!baseUserId?.cxid) {
      ToastMessage({
        status: "warning",
        message: "Please log in to manage search history"
      });
      return;
    }
    
    setSearchSessions([]);
    saveSessionToStorage([], baseUserId.cxid);
    ToastMessage({
      status: "success",
      message: "Search history cleared",
    });
  };

  // Show login prompt if no user is logged in
  if (!baseUserId?.cxid) {
    return (
      <ModalBase
        isOpen={showSessionHistory}
        toggle={() => setShowSessionHistory(false)}
        title="Recent Searches"
        size="md"
      >
        <div className={styles.sessionHistoryContainer}>
          <div className={styles.emptySessionHistory}>
            <Users size={48} color="#9ca3af" />
            <div className={styles.emptySessionTitle}>Login Required</div>
            <div className={styles.emptySessionText}>
              Please log in to view and manage your search history.
            </div>
            <button
              className={styles.loginButton}
              onClick={() => router.push("/page/account/login-auth")}
            >
              Login Now
            </button>
          </div>
        </div>
      </ModalBase>
    );
  }

  if (!showSessionHistory) return null;

  return (
    <ModalBase
      isOpen={showSessionHistory}
      toggle={() => setShowSessionHistory(false)}
      title="Recent Searches"
      size="md"
    >
      <div className={styles.sessionHistoryContainer}>
        {searchSessions.length === 0 ? (
          <div className={styles.emptySessionHistory}>
            <History size={48} color="#9ca3af" />
            <div className={styles.emptySessionTitle}>No recent searches</div>
            <div className={styles.emptySessionText}>
              Your search history will appear here after you've searched for flights.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.sessionHistoryHeader}>
              <div className={styles.sessionHistoryTitle}>
                Recent Searches
              </div>
              <button
                onClick={handleClearHistory}
                className={styles.clearHistoryButton}
              >
                Clear All
              </button>
            </div>

            <div className={styles.sessionList}>
              {searchSessions.map((session) => (
                <div key={session.id} className={styles.sessionItem}>
                  <div
                    className={styles.sessionItemContent}
                    onClick={() => handleLoadSession(session)}
                  >
                    <div className={styles.sessionItemHeader}>
                      <div className={styles.sessionSummary}>
                        {session.summary}
                      </div>
                      <div className={styles.sessionTime}>
                        {formatSessionDate(session.timestamp)}
                      </div>
                    </div>

                    <div className={styles.sessionDetails}>
                      <div className={styles.sessionDetailItem}>
                        <span className={styles.sessionDetailLabel}>
                          Trip:
                        </span>
                        <span className={styles.sessionDetailValue}>
                          {session.tripType === "oneWay"
                            ? "One Way"
                            : session.tripType === "roundTrip"
                              ? "Round Trip"
                              : "Multi City"}
                        </span>
                      </div>

                      <div className={styles.sessionDetailItem}>
                        <span className={styles.sessionDetailLabel}>
                          Class:
                        </span>
                        <span className={styles.sessionDetailValue}>
                          {session.travelClass}
                        </span>
                      </div>

                      {session.routes[0]?.date && (
                        <div className={styles.sessionDetailItem}>
                          <span className={styles.sessionDetailLabel}>
                            Date:
                          </span>
                          <span className={styles.sessionDetailValue}>
                            {new Date(
                              session.routes[0].date
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className={styles.deleteSessionButton}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </ModalBase>
  );
};
  // Validation functions
  const validatePassengers = () => {
    const validationErrors = {};

    const totalPassengers =
      passengers.adults +
      passengers.children +
      passengers.infants +
      passengers.students;
    if (totalPassengers === 0) {
      validationErrors.general = "At least one passenger is required";
    }

    if (totalPassengers > 9) {
      validationErrors.general = "Maximum 9 passengers allowed per booking";
    }

    if (isStudentMode) {
      if (passengers.students > 9) {
        validationErrors.students = "Maximum 9 students allowed per booking";
      }
      return validationErrors;
    }

    if (passengers.infants > passengers.adults) {
      validationErrors.infants =
        "Number of infants cannot exceed number of adults";
    }

    if (passengers.infants > 0 && passengers.adults === 0) {
      validationErrors.adults =
        "At least one adult is required when booking for infants";
    }

    if (passengers.children > 8) {
      validationErrors.children = "Maximum 8 children allowed per booking";
    }

    if (passengers.students > 9) {
      validationErrors.students = "Maximum 9 students allowed per booking";
    }

    return validationErrors;
  };

  // Clear specific error
  const clearError = (errorType) => {
    if (errors[errorType]) {
      const newErrors = { ...errors };
      delete newErrors[errorType];
      setErrors(newErrors);
    }
  };

  // Optimized airport filtering with debounced search
  const filteredAirports = useMemo(() => {
    // Show airports when any airport dropdown is active
    const isAirportDropdownActive = activeDropdown && (activeDropdown.includes('from_') || activeDropdown.includes('to_'));
    
    if (!isAirportDropdownActive) return [];
    if (!airportCodes || airportCodes.length === 0) return [];

    // Always show some airports when dropdown is active
    if (debouncedSearchText.trim() === "") {
      return airportCodes.slice(0, 20); // Show first 20 airports
    }

    const searchTerm = debouncedSearchText.toLowerCase().trim();
    const filtered = [];

    for (let i = 0; i < airportCodes.length && filtered.length < 50; i++) {
      const airport = airportCodes[i];
      if (!airport.city_name || !airport.iata_code || !airport.name) continue;
      
      const cityName = airport.city_name.toLowerCase();
      const iataCode = airport.iata_code.toLowerCase();
      const airportName = airport.name.toLowerCase();

      if (
        iataCode.startsWith(searchTerm) ||
        cityName.includes(searchTerm) ||
        airportName.includes(searchTerm)
      ) {
        filtered.push(airport);
      }
    }

    return filtered;
  }, [debouncedSearchText, airportCodes, activeDropdown]);

  // Handle passenger count changes
  const updatePassengerCount = (type, increment) => {
    setPassengers((prevPassengers) => {
      const newPassengers = { ...prevPassengers };

      if (type === "students") {
        if (increment && newPassengers.students < 9) {
          newPassengers.students += 1;
          if (newPassengers.students === 1) {
            newPassengers.adults = 0;
            newPassengers.children = 0;
            newPassengers.infants = 0;
            setErrors({});
          }
          clearError("students");
        } else if (!increment && newPassengers.students > 0) {
          newPassengers.students -= 1;
          if (newPassengers.students === 0) {
            newPassengers.adults = 1;
          }
          clearError("students");
        }
        clearError("general");
        return newPassengers;
      }

      if (isStudentMode && type !== "students") {
        return prevPassengers;
      }

      if (increment) {
        if (type === "adults" && newPassengers.adults < 9) {
          newPassengers.adults += 1;
          clearError("infants");
          clearError("adults");
        } else if (type === "children" && newPassengers.children < 8) {
          newPassengers.children += 1;
          clearError("children");
        } else if (
          type === "infants" &&
          newPassengers.infants < newPassengers.adults &&
          newPassengers.infants < 9
        ) {
          newPassengers.infants += 1;
          clearError("infants");
        }
      } else {
        if (type === "adults" && newPassengers.adults > 0) {
          if (newPassengers.adults - 1 >= newPassengers.infants) {
            newPassengers.adults -= 1;
          }
        } else if (type === "children" && newPassengers.children > 0) {
          newPassengers.children -= 1;
        } else if (type === "infants" && newPassengers.infants > 0) {
          newPassengers.infants -= 1;
          clearError("infants");
        }
      }

      if (type) {
        clearError("general");
      }

      return newPassengers;
    });
  };

  // Check if decrement button should be disabled
  const isDecrementDisabled = (type) => {
    if (isStudentMode && type !== "students") {
      return true;
    }

    switch (type) {
      case "adults":
        return passengers[type] <= 0 || passengers[type] <= passengers.infants;
      case "children":
      case "infants":
      case "students":
        return passengers[type] <= 0;
      default:
        return true;
    }
  };

  // Check if increment button should be disabled
  const isIncrementDisabled = (type) => {
    if (isStudentMode && type !== "students") {
      return true;
    }

    const totalPassengers =
      passengers.adults +
      passengers.children +
      passengers.infants +
      passengers.students;

    switch (type) {
      case "adults":
        return passengers[type] >= 9 || totalPassengers >= 9;
      case "children":
        return passengers[type] >= 8 || totalPassengers >= 9;
      case "students":
        return passengers[type] >= 9 || totalPassengers >= 9;
      case "infants":
        return (
          passengers[type] >= passengers.adults ||
          passengers[type] >= 9 ||
          totalPassengers >= 9
        );
      default:
        return true;
    }
  };

  // Calendar functionality
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDateSelect = (date) => {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    if (calendarTarget.type === "depart") {
      const newRoutes = [...routes];
      newRoutes[calendarTarget.routeIndex].departDate = dateString;
      setRoutes(newRoutes);
    } else {
      setReturnDate(dateString);
    }
    setActiveCalendarDropdown(null);
    
    // Reset search results when user selects a date
    setHasSearched(false);
  };

  const openCalendar = (type, routeIndex = 0) => {
    setCalendarTarget({ type, routeIndex });
    const dropdownKey = `${type}_${routeIndex}`;
    setActiveCalendarDropdown(dropdownKey);
    // Close any other active dropdowns
    setActiveDropdown(null);
  };

  const openAirportSelector = useCallback((field, routeIndex) => {
    setAirportSelectorTarget({ field, routeIndex });
    setSearchText(""); // Clear search when opening
    setDebouncedSearchText(""); // Also clear debounced search
    setShowAirportSelector(true);
  }, []);

  const handleAirportSelect = useCallback(
    (airport) => {
      const newRoutes = [...routes];
      const { field, routeIndex } = airportSelectorTarget;

      if (field === "from") {
        newRoutes[
          routeIndex
        ].from = `${airport.city_name}, ${airport.iata_code}`;
        newRoutes[routeIndex].fromCode = airport.iata_code;
      } else {
        newRoutes[routeIndex].to = `${airport.city_name}, ${airport.iata_code}`;
        newRoutes[routeIndex].toCode = airport.iata_code;
      }

      setRoutes(newRoutes);
      setShowAirportSelector(false);
      setSearchText("");
      setDebouncedSearchText("");
      
      // Reset search results when user selects an airport
      setHasSearched(false);
    },
    [routes, airportSelectorTarget]
  );

  const swapLocations = (routeIndex) => {
    const newRoutes = [...routes];
    
    // Store the original values before swapping
    const originalFrom = newRoutes[routeIndex].from;
    const originalFromCode = newRoutes[routeIndex].fromCode;
    const originalTo = newRoutes[routeIndex].to;
    const originalToCode = newRoutes[routeIndex].toCode;

    // Swap the route values
    newRoutes[routeIndex].from = originalTo;
    newRoutes[routeIndex].fromCode = originalToCode;
    newRoutes[routeIndex].to = originalFrom;
    newRoutes[routeIndex].toCode = originalFromCode;

    setRoutes(newRoutes);

    // Also swap the input values to reflect the change in the UI
    setInputValues(prev => {
      const newInputValues = { ...prev };
      const fromKey = `from_${routeIndex}`;
      const toKey = `to_${routeIndex}`;
      
      // Get current input values or use original route values as fallback
      const currentFromValue = newInputValues[fromKey] || originalFrom || '';
      const currentToValue = newInputValues[toKey] || originalTo || '';
      
      // Swap the input values
      newInputValues[fromKey] = currentToValue;
      newInputValues[toKey] = currentFromValue;
      
      return newInputValues;
    });

    // Reset search results when user swaps locations
    setHasSearched(false);
    setTriggerCount(triggerCount + 1);
  };

  const addRoute = () => {
    if (routes.length < 6) {
      const newRouteIndex = routes.length;
      
      setRoutes([
        ...routes,
        { from: "", fromCode: "", to: "", toCode: "", departDate: "" },
      ]);
      
      // Clear input values for the new route to ensure no old data appears
      setInputValues(prev => {
        const newValues = { ...prev };
        delete newValues[`from_${newRouteIndex}`];
        delete newValues[`to_${newRouteIndex}`];
        return newValues;
      });
    }

    // Reset search results when adding a route
    setHasSearched(false);
    setTriggerCount(triggerCount + 1);
  };

  const removeRoute = (routeIndex) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((_, index) => index !== routeIndex));
      
      // Clean up input values - remove values for indices >= routeIndex
      // and shift down values for higher indices
      setInputValues(prev => {
        const newValues = {};
        Object.keys(prev).forEach(key => {
          const match = key.match(/^(from|to)_(\d+)$/);
          if (match) {
            const field = match[1];
            const index = parseInt(match[2]);
            
            if (index < routeIndex) {
              // Keep values for indices before the removed route
              newValues[key] = prev[key];
            } else if (index > routeIndex) {
              // Shift down values for indices after the removed route
              newValues[`${field}_${index - 1}`] = prev[key];
            }
            // Skip the removed index
          } else {
            // Keep non-route related keys
            newValues[key] = prev[key];
          }
        });
        return newValues;
      });
    }

    // Reset search results when removing a route
    setHasSearched(false);
    setTriggerCount(triggerCount + 1);
  };

  // New handler functions for inline dropdowns
  const handleInputFocus = (type, routeIndex) => {
    setActiveDropdown(`${type}_${routeIndex}`);
    
    // Initialize input value if not set
    const key = `${type}_${routeIndex}`;
    if (!inputValues[key]) {
      setInputValues(prev => ({
        ...prev,
        [key]: type === 'from' ? routes[routeIndex]?.from || '' : routes[routeIndex]?.to || ''
      }));
    }
  };

  const handlePassengerFocus = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowPassengers(true);
  };

  const handleInputChange = (value, type, routeIndex) => {
    const key = `${type}_${routeIndex}`;
    setInputValues(prev => ({
      ...prev,
      [key]: value
    }));
    setSearchText(value);
    
    // Reset search results when user changes location
    setHasSearched(false);
    
    // If input is cleared, also clear the corresponding route data
    if (!value.trim()) {
      const newRoutes = [...routes];
      if (type === "from") {
        newRoutes[routeIndex].from = '';
        newRoutes[routeIndex].fromCode = '';
      } else {
        newRoutes[routeIndex].to = '';
        newRoutes[routeIndex].toCode = '';
      }
      setRoutes(newRoutes);
    }
  };

  const handleAirportSelectInline = (airport, type, routeIndex) => {
    const newRoutes = [...routes];
    const airportDisplayName = `${airport.city_name}, ${airport.iata_code}`;
    
    if (type === "from") {
      newRoutes[routeIndex].from = airportDisplayName;
      newRoutes[routeIndex].fromCode = airport.iata_code;
    } else {
      newRoutes[routeIndex].to = airportDisplayName;
      newRoutes[routeIndex].toCode = airport.iata_code;
    }

    setRoutes(newRoutes);
    setActiveDropdown(null);
    setInputValues(prev => ({
      ...prev,
      [`${type}_${routeIndex}`]: airportDisplayName
    }));
    setSearchText("");
    setDebouncedSearchText("");
    
    // Reset search results when user selects an airport
    setHasSearched(false);
  };

  const handleClickOutside = (e) => {
    // Don't close if clicking on dropdown container, input, or any child elements
    const isDropdownClick = e.target.closest('.dropdown-container') || 
                           e.target.closest('.dropdown-input') ||
                           e.target.closest(`.${styles.inlineAirportDropdown}`) ||
                           e.target.closest(`.${styles.inlineCalendarDropdown}`) ||
                           e.target.closest('.calendar-dropdown') ||
                           e.target.closest(`.${styles.dateButton}`) ||
                           e.target.classList.contains('dropdown-container') ||
                           e.target.classList.contains('dropdown-input') ||
                           e.target.classList.contains('calendar-dropdown') ||
                           e.target.classList.contains(styles.inlineAirportDropdown) ||
                           e.target.classList.contains(styles.inlineCalendarDropdown) ||
                           e.target.classList.contains(styles.dateButton);
    
    if (!isDropdownClick) {
      setActiveDropdown(null);
      setActiveCalendarDropdown(null);
    }
  };

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Sync input values with route values
  useEffect(() => {
    const newInputValues = {};
    routes.forEach((route, index) => {
      // Only sync if the route has actual airport data (both name and code)
      // Don't override manually cleared inputs
      const fromKey = `from_${index}`;
      const toKey = `to_${index}`;
      
      if (route.from && route.fromCode && !inputValues[fromKey]) {
        newInputValues[fromKey] = route.from;
      }
      if (route.to && route.toCode && !inputValues[toKey]) {
        newInputValues[toKey] = route.to;
      }
    });
    
    // Only update if we have new values to set
    if (Object.keys(newInputValues).length > 0) {
      setInputValues(prev => ({ ...prev, ...newInputValues }));
    }
  }, [routes]);

  // Prevent background scrolling when passenger modal is open
  useEffect(() => {
    if (showPassengers) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup function to remove class when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showPassengers]);

  const getPassengerText = () => {
    const total =
      passengers.adults +
      passengers.children +
      passengers.infants +
      passengers.students;

    if (isStudentMode) {
      return `${passengers.students} Student${passengers.students > 1 ? "s" : ""
        }`;
    }

    let text = `${passengers.adults} Adult${passengers.adults > 1 ? "s" : ""}`;
    if (passengers.children > 0) {
      text += `, ${passengers.children} Child${passengers.children > 1 ? "ren" : ""
        }`;
    }
    if (passengers.infants > 0) {
      text += `, ${passengers.infants} Infant${passengers.infants > 1 ? "s" : ""
        }`;
    }

    return text;
  };

  const [triggerCount, setTriggerCount] = useState(0);

  const handleTripTypeChange = (type) => {
    setTripType(type);
    setTriggerCount(triggerCount + 1);

    setHasSearched(false)
    if (type === "oneWay") {
      setRoutes([routes[0]]);
      setReturnDate("");
    } else if (type === "roundTrip") {
      setRoutes([routes[0]]);
    } else if (type === "multiCity" && routes.length === 1) {
      setRoutes([
        routes[0],
        { from: "", fromCode: "", to: "", toCode: "", departDate: "" },
      ]);
    }
  };

  const handlePassengerSave = () => {
    setHasValidated(true);
    const validationErrors = validatePassengers();

    if (Object.keys(validationErrors).length === 0) {
      setShowPassengers(false);
      setHasValidated(false);
      setErrors({});
    } else {
      setErrors(validationErrors);
    }

    setTriggerCount(triggerCount + 1);
  };

  const getFieldRowClass = () => {
    const baseClass = styles.fieldRow;
    if (tripType === "oneWay") {
      return `${baseClass} ${styles.fieldRowOneWay}`;
    } else if (tripType === "roundTrip") {
      return `${baseClass} ${styles.fieldRowRoundTrip}`;
    } else {
      return `${baseClass} ${styles.fieldRowMultiCity}`;
    }
  };

  const getPassengerTypeLabel = (type) => {
    const labels = {
      adults: "Adults",
      children: "Children (2-11 years)",
      infants: "Infants (Under 2 years)",
      students: "Students",
    };
    return labels[type] || "";
  };

  const getPassengerTypeDescription = (type) => {
    const descriptions = {
      adults: "Age 12+",
      children: "Age 2-11",
      infants: "Under 2, on lap",
      students: "With valid student ID",
    };
    return descriptions[type] || "";
  };

  const renderErrorMessage = (errorKey) => {
    if (!errors[errorKey]) return null;

    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={14} color="#FF385C" />
        <span className={styles.errorText}>{errors[errorKey]}</span>
      </div>
    );
  };

  const getButtonStyle = (type) => {
    const hasError = errors[type] || errors.general;
    const isDisabled = isStudentMode && type !== "students";
    return [
      styles.counterButton,
      hasError && styles.errorButton,
      isDisabled && styles.disabledStudentModeButton,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getPassengerRowStyle = (type) => {
    const isDisabled = isStudentMode && type !== "students";
    return [styles.passengerTypeRow, isDisabled && styles.disabledPassengerRow]
      .filter(Boolean)
      .join(" ");
  };

  const getPassengerLabelStyle = (type) => {
    const isDisabled = isStudentMode && type !== "students";
    return [
      styles.passengerTypeLabel,
      isDisabled && styles.disabledPassengerLabel,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getPassengerDescriptionStyle = (type) => {
    const isDisabled = isStudentMode && type !== "students";
    return [
      styles.passengerTypeDescription,
      isDisabled && styles.disabledPassengerDescription,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // Airport Selector Component
  const AirportSelector = React.memo(
    ({ onSelectAirport, onClose, fieldType, searchText, onSearchChange }) => {
      return (
        <div className={styles.airportModalLarge}>
          <div className={styles.airportHeader}>
            <button onClick={onClose} className={styles.backButton}>
              <ChevronLeft size={20} color="#ed4242" />
            </button>
            <h3 className={styles.airportModalTitle}>
              Select {fieldType === "from" ? "Departure" : "Arrival"} Airport
            </h3>
          </div>

          <div className={styles.searchContainer}>
            <Search size={20} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search cities or airports..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            {searchText && (
              <button
                onClick={() => onSearchChange("")}
                className={styles.clearButton}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className={styles.airportList}>
            {filteredAirports.length === 0 && debouncedSearchText ? (
              <div className={styles.noResults}>
                No airports found matching "{debouncedSearchText}"
              </div>
            ) : (
              filteredAirports.map((airport) => (
                <div
                  key={`${airport.iata_code}-${airport.city_name}`}
                  onClick={() => onSelectAirport(airport)}
                  className={styles.airportItem}
                >
                  <div className={styles.airportItemLeft}>
                    <MapPin size={20} color="#ed4242" />
                    <div className={styles.airportCode}>
                      {airport.iata_code}
                    </div>
                  </div>
                  <div className={styles.airportItemRight}>
                    <div className={styles.airportCity}>
                      {airport.city_name}
                    </div>
                    <div className={styles.airportName}>{airport.name}</div>
                    <div className={styles.airportCountry}>
                      {airport.country}
                    </div>
                  </div>
                </div>
              ))
            )}
            {filteredAirports.length === 100 && debouncedSearchText && (
              <div className={styles.moreResults}>
                Showing first 100 results. Type more to refine search.
              </div>
            )}
          </div>
        </div>
      );
    }
  );

  const handleSearchChange = useCallback((value) => {
    setSearchText(value);
  }, []);

  // Inline Airport Dropdown Component
  const InlineAirportDropdown = React.memo(({ type, routeIndex, isVisible }) => {
    if (!isVisible) return null;

    return (
      <>
        {/* Overlay background */}
        <div className={styles.dropdownOverlay} />
        <div className={styles.inlineAirportDropdown}>
          {filteredAirports.length === 0 && debouncedSearchText ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              No airports found matching "{debouncedSearchText}"
            </div>
          ) : filteredAirports.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280' }}>
              Loading airports...
            </div>
          ) : (
            filteredAirports.slice(0, 10).map((airport) => (
              <div
                key={`${airport.iata_code}-${airport.city_name}`}
                onClick={() => handleAirportSelectInline(airport, type, routeIndex)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  flex: 1
                }}>
                  <div style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#004e64',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    minWidth: '40px',
                    textAlign: 'center',
                    backgroundColor: '#f0f9ff'
                  }}>
                    {airport.iata_code}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      {airport.city_name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {airport.name}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {filteredAirports.length > 10 && (
            <div style={{ 
              padding: '12px 16px', 
              textAlign: 'center', 
              color: '#6b7280',
              fontSize: '12px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb'
            }}>
              Showing top 10 results. Type more to refine search.
            </div>
          )}
        </div>
      </>
    );
  });

  // Inline Calendar Dropdown Component
  const InlineCalendarDropdown = React.memo(({ type, routeIndex, isVisible }) => {
    if (!isVisible) return null;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getDaysInMonth = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const firstDayWeekday = firstDayOfMonth.getDay();
      const daysInMonth = lastDayOfMonth.getDate();

      const days = [];
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayWeekday; i++) {
        days.push(null);
      }
      
      // Add all days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(new Date(year, month, day));
      }
      
      return days;
    };

    const handleDateClick = (date) => {
      if (!date) return;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      if (calendarTarget.type === "depart") {
        const newRoutes = [...routes];
        newRoutes[calendarTarget.routeIndex].departDate = dateString;
        setRoutes(newRoutes);
      } else {
        setReturnDate(dateString);
      }
      setActiveCalendarDropdown(null);
      
      // Reset search results when user selects a date
      setHasSearched(false);
    };

    const getSelectedDate = () => {
      if (calendarTarget.type === "depart") {
        return routes[calendarTarget.routeIndex]?.departDate;
      } else {
        return returnDate;
      }
    };

    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    return (
      <>
        <div className={styles.dropdownOverlay} />
        <div className={`${styles.inlineCalendarDropdown} calendar-dropdown`}>
          {/* Calendar Header */}
          <div className={styles.calendarHeader}>
            <button
              onClick={prevMonth}
              className={styles.calendarNavButton}
            >
              <ChevronLeft size={18} color="#374151" />
            </button>
            <h3 className={styles.calendarTitle}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className={styles.calendarNavButton}
            >
              <ChevronRight size={18} color="#374151" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={styles.calendarGrid}>
            {/* Day Headers */}
            {dayNames.map((day) => (
              <div key={day} className={styles.calendarDayHeader}>
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {getDaysInMonth(currentMonth).map((date, index) => {
              if (!date) {
                return (
                  <div key={index} className={styles.calendarEmptyDay} />
                );
              }

              // Allow bookings up to 1 year from today
              const cutoffDate = new Date();
              cutoffDate.setFullYear(cutoffDate.getFullYear() + 1);
              cutoffDate.setHours(23, 59, 59, 999); // End of day
              const isAfterCutoff = date > cutoffDate;

              let minDate = today;
              if (calendarTarget.type === "return" && routes[0]?.departDate) {
                const departureDate = new Date(routes[0].departDate);
                departureDate.setHours(0, 0, 0, 0);
                minDate = departureDate;
              }

              const isBeforeMinDate = date < minDate;
              const isDisabled = isBeforeMinDate || isAfterCutoff;
              const isToday = date.getTime() === today.getTime();

              const selectedDateString = getSelectedDate();
              const isSelected = selectedDateString &&
                new Date(selectedDateString).toDateString() === date.toDateString();

              let dayClass = styles.calendarDay;
              if (isSelected) dayClass += ` ${styles.calendarDaySelected}`;
              if (isToday && !isSelected) dayClass += ` ${styles.calendarDayToday}`;
              if (isDisabled) dayClass += ` ${styles.calendarDayDisabled}`;

              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && handleDateClick(date)}
                  disabled={isDisabled}
                  className={dayClass}
                >
                  <span className={styles.calendarDayNumber}>
                    {date.getDate()}
                  </span>
                  {isToday && !isSelected && (
                    <span className={styles.calendarTodayIndicator}>•</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className={styles.calendarFooter}>
            <div className={styles.calendarLegend}>
              <div className={styles.calendarLegendItem}>
                <div className={`${styles.calendarLegendDot} ${styles.calendarLegendDotToday}`}></div>
                <span>Today</span>
              </div>
              <div className={styles.calendarLegendItem}>
                <div className={`${styles.calendarLegendDot} ${styles.calendarLegendDotSelected}`}></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  });

  const handleSearch = () => {
    setAppliedFilters({
      quickFilters: [],
      airlines: [],
      layoverAirports: [],
      sortOption: "BEST",
    });
    const validation = validateFlightSearch();

    if (!validation.isValid) {
      // Show the first validation message as a warning toast
      ToastMessage({
        status: "warning",
        message: validation.messages[0],
      });
      return;
    }
    let searchRoutes = routes.map((route) => ({
      from: route.fromCode,
      fromCode: route.fromCode,
      to: route.toCode,
      toCode: route.toCode,
      date: route.departDate,
    }));

    if (tripType === "roundTrip" && returnDate && routes[0]) {
      searchRoutes.push({
        from: routes[0].toCode,
        fromCode: routes[0].toCode,
        to: routes[0].fromCode,
        toCode: routes[0].fromCode,
        date: returnDate,
      });
    }

    const searchParams = {
      tripType,
      routes: searchRoutes,
      dateRange: {
        start: routes[0]?.departDate || null,
        end: tripType === "roundTrip" ? returnDate : null,
      },
      passengersClass: {
        passengers: {
          adults: passengers.adults,
          children: passengers.children,
          infants: passengers.infants,
          students: passengers.students,
        },
        travelClass,
      },
      provider: "sabre",
    };

    // Save the search session
    const sessionId = saveSearchSession(searchParams);

    setFlightSearchData(searchParams);
    setHasSearched(true);

    // Show success message
    // ToastMessage({
    //   status: "success",
    //   message: "Search saved to history",
    // });
  };

  // Handle AI flight search success
  const handleAIFlightSearchSuccess = (searchCriteria) => {
    console.log("AI Flight Search Data received:", searchCriteria);
    
    // Validate the AI data structure
    if (!searchCriteria) {
      ToastMessage({
        status: "error",
        message: "Invalid AI response. Please try again.",
      });
      return;
    }

    // Check if we have selectedFlights (AI direct results) or search criteria
    if (searchCriteria.selectedFlights && Array.isArray(searchCriteria.selectedFlights)) {
      // AI returned direct flight results - use them directly
      console.log("AI returned direct flight results:", searchCriteria.selectedFlights);
      
      setFlightSearchDataPrePopulate(searchCriteria);
      setHasSearched(true);
      
      ToastMessage({
        status: "success",
        message: `AI found ${searchCriteria.selectedFlights.length} flight(s)! Displaying results...`,
      });
    } else if (searchCriteria.tripType && searchCriteria.routes) {
      // AI returned search criteria - trigger normal search
      console.log("AI returned search criteria, triggering search:", searchCriteria);
      
      // Transform AI search criteria to match our search params format
      const searchParams = {
        tripType: searchCriteria.tripType,
        routes: searchCriteria.routes.map(route => ({
          from: route.from || route.fromCode,
          fromCode: route.fromCode || route.from,
          to: route.to || route.toCode,
          toCode: route.toCode || route.to,
          date: route.date,
        })),
        dateRange: {
          start: searchCriteria.routes[0]?.date || null,
          end: searchCriteria.tripType === 'roundTrip' && searchCriteria.routes[1] 
            ? searchCriteria.routes[1].date 
            : null,
        },
        passengersClass: searchCriteria.passengersClass || {
          passengers: {
            adults: 1,
            children: 0,
            infants: 0,
            students: 0,
          },
          travelClass: 'Economy',
        },
        provider: searchCriteria.provider || 'sabre',
      };

      setFlightSearchData(searchParams);
      setHasSearched(true);
      
      ToastMessage({
        status: "success",
        message: "AI understood your request! Searching for flights...",
      });
    } else {
      // Unknown format
      console.error("Unknown AI response format:", searchCriteria);
      ToastMessage({
        status: "error",
        message: "Could not process AI response. Please try manual search.",
      });
    }
  };

  const [chatCreating, setChatCreating] = useState(false);

  const checkExistingChat = async (userId) => {
    const chatRef = await collection(db, "customer-chat-lists");
    const q = query(
      chatRef,
      where("customer_collection_id", "==", userId),
      where("chat_name", "==", "Aahaas Flight Assistance")
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      handleChatInitiate();
    } else {
      setChatCreating(false);
      // router.push(`/page/account/chats?oID=${querySnapshot.docs[0].id}`);
      const chatUrl = `/page/account/chats?oID=${querySnapshot.docs[0].id}`;
      window.open(chatUrl, "_blank");
    }
  };

  const handleChatInitiate = async () => {
    setChatCreating(true);
    if (chatCreating) {
      ToastMessage({
        status: "warning",
        message: "Already a chat has been initiated",
      });
    } else {
      if (userStatus.userLoggesIn) {
        await addDoc(collection(db, "customer-chat-lists"), {
          status: "Pending",
          createdAt: new Date(),
          supplierAdded: "false",
          notifyAdmin: "true",
          notifySupplier: "false",
          notifyCustomer: "false",
          supplier_name: "",
          customer_name: baseUserId.user_username,
          customer_mail_id: baseUserId.user_email,
          supplier_mail_id: "",
          // comments: { category: 4, product_id: hotelDetails?.hotelData?.id },
          customer_id: baseUserId.cxid,
          chat_related: "Technical-support",
          customer_collection_id: baseUserId.cxid,
          chat_related_to: "Product",
          supplier_mail_id: "aahaas@gmail.com",
          group_chat: "true",
          supplier_added_date: Date.now(),
          chat_related_id: null,
          chat_category: "6",
          chat_avatar: "https://gateway.aahaas.com/monogram.png",
          supplier_id: "635",
          chat_name: "Aahaas Flight Assistance",
          comments:
            "Product support - chat has been created from product details",
          updatedAt: new Date(),
        }).then((response) => {
          setChatCreating(false);
          // router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
          const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
          window.open(chatUrl, "_blank");
        });
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath);
        ToastMessage({
          status: "warning",
          message:
            "You are logged in as a guest user. Please login to access the full system features",
        });
      }
    }
  };
  // State for flight codes
  const [flightCodes, setFlightCodes] = useState([]);

  const handleFlightsCode = (codeData) => {
    setFlightCodes(codeData);
  };

  // Optional: Add visual indicators for required fields
  const getFieldStyle = (hasValue, hasError = false) => {
    let baseStyle = styles.input;

    if (hasError) {
      baseStyle += ` ${styles.inputError}`;
    } else if (!hasValue) {
      baseStyle += ` ${styles.inputRequired}`;
    }

    return baseStyle;
  };

  const validateFlightSearch = () => {
    let isValid = true;
    const validationMessages = [];

    // Validate each route
    routes.forEach((route, index) => {
      const routeNumber = routes.length > 1 ? ` for Flight ${index + 1}` : "";

      // Check departure location
      if (!route.from || !route.fromCode) {
        validationMessages.push(
          `Please select departure location${routeNumber}`
        );
        isValid = false;
      }

      // Check arrival location
      if (!route.to || !route.toCode) {
        validationMessages.push(`Please select arrival location${routeNumber}`);
        isValid = false;
      }

      // Check departure date
      if (!route.departDate) {
        validationMessages.push(`Please select departure date${routeNumber}`);
        isValid = false;
      }

      // Check if departure and arrival are the same
      if (route.fromCode && route.toCode && route.fromCode === route.toCode) {
        validationMessages.push(
          `Departure and arrival locations cannot be the same${routeNumber}`
        );
        isValid = false;
      }
    });

    // Validate return date for round trip
    if (tripType === "roundTrip" && !returnDate) {
      validationMessages.push("Please select return date");
      isValid = false;
    }

    // Validate return date is after departure date
    if (tripType === "roundTrip" && returnDate && routes[0]?.departDate) {
      const departureDate = new Date(routes[0].departDate);
      const returnDateObj = new Date(returnDate);

      if (returnDateObj <= departureDate) {
        validationMessages.push("Return date must be after departure date");
        isValid = false;
      }
    }

    // Validate passenger count
    const totalPassengers =
      passengers.adults +
      passengers.children +
      passengers.infants +
      passengers.students;
    if (totalPassengers === 0) {
      validationMessages.push("Please select at least one passenger");
      isValid = false;
    }

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    routes.forEach((route, index) => {
      if (route.departDate) {
        const departureDate = new Date(route.departDate);
        departureDate.setHours(0, 0, 0, 0);

        if (departureDate < today) {
          const routeNumber =
            routes.length > 1 ? ` for Flight ${index + 1}` : "";
          validationMessages.push(
            `Departure date cannot be in the past${routeNumber}`
          );
          isValid = false;
        }
      }
    });

    if (tripType === "roundTrip" && returnDate) {
      const returnDateObj = new Date(returnDate);
      returnDateObj.setHours(0, 0, 0, 0);

      if (returnDateObj < today) {
        validationMessages.push("Return date cannot be in the past");
        isValid = false;
      }
    }

    return { isValid, messages: validationMessages };
  };

  const handleRemoveFilter = (filterType, filterValue) => {
    setAppliedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (filterType === "quickFilters") {
        newFilters.quickFilters = newFilters.quickFilters.filter(
          (filter) => filter !== filterValue
        );
      } else if (filterType === "airlines") {
        newFilters.airlines = newFilters.airlines.filter(
          (airline) => airline !== filterValue
        );
      } else if (filterType === "layoverAirports") {
        newFilters.layoverAirports = newFilters.layoverAirports.filter(
          (airport) => airport !== filterValue
        );
      }

      return newFilters;
    });
  };

  const handleClearAllFilters = () => {
    setAppliedFilters({
      quickFilters: [],
      airlines: [],
      layoverAirports: [],
      sortOption: "BEST",
    });
  };

  const handleRemoveSortOption = () => {
    setAppliedFilters((prevFilters) => ({
      ...prevFilters,
      sortOption: "BEST",
    }));
  };

  const getSelectedDate = () => {
    if (calendarTarget.type === "depart") {
      return routes[calendarTarget.routeIndex]?.departDate;
    } else {
      return returnDate;
    }
  };
  return (
    <CommonLayout
      title="Flights"
      parent="home"
      showMenuIcon={hasSearched}
      showSearchIcon={true}
    >
      <div className={styles.container}>
        {/* Flight Search Form Section */}
        <div className={styles.searchSection}>
          {/* Top Hero Image */}
          <div className={styles.heroImageContainer}>
            <img 
              src="/assets/images/jumbo-jet-flying-sky.jpg"
              alt="Flight Search Background"
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
          </div>
          
          {/* Search Form */}
          <div className={styles.form} ref={searchFormRef}>
            {/* Header with Radio Buttons and Session History - Moved inside form */}
            <div className={styles.header}>
              <div className={styles.tripTypeContainer}>
                <div className={styles.radioGroup}>
                  <div className={styles.radioContainer}>
                    <input
                      type="radio"
                      id="oneWay"
                      name="tripType"
                      checked={tripType === "oneWay"}
                      onChange={() => handleTripTypeChange("oneWay")}
                      className={styles.radio}
                    />
                    <label htmlFor="oneWay" className={styles.radioLabel}>
                      One Way
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <input
                      type="radio"
                      id="roundTrip"
                      name="tripType"
                      checked={tripType === "roundTrip"}
                      onChange={() => handleTripTypeChange("roundTrip")}
                      className={styles.radio}
                    />
                    <label htmlFor="roundTrip" className={styles.radioLabel}>
                      Round Trip
                    </label>
                  </div>
                  <div className={styles.radioContainer}>
                    <input
                      type="radio"
                      id="multiCity"
                      name="tripType"
                      checked={tripType === "multiCity"}
                      onChange={() => handleTripTypeChange("multiCity")}
                      className={styles.radio}
                    />
                    <label htmlFor="multiCity" className={styles.radioLabel}>
                      Multi City
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  {/* Session History Button */}
                  <button
                    className={styles.sessionHistoryButton}
                    onClick={() => setShowSessionHistory(true)}
                    title="View recent searches"
                  >
                    <History size={20} color="#ed4242" />
                    {searchSessions.length > 0 && (
                      <span className={styles.sessionBadge}>
                        {searchSessions.length}
                      </span>
                    )}
                  </button>

                  <button
                    className={styles.floatingFilterButton2}
                    onClick={() => checkExistingChat(baseUserId.cxid)}
                  >
                    <ChatIcon sx={{ color: "white" }} />
                  </button>
                </div>
              </div>
            </div>

            {routes.map((route, routeIndex) => (
  <div
    key={routeIndex}
    className={`${styles.routeContainer} ${tripType === "multiCity" ? styles.routeContainerMultiCity : ""}`}
    style={getRouteContainerStyle(routeIndex)}
  >
    {tripType === "multiCity" && routeIndex > 0 && (
      <div className={styles.routeHeader}>
        <h4 className={styles.routeTitle}>Flight {routeIndex + 1}</h4>
        <button
          onClick={() => removeRoute(routeIndex)}
          className={styles.removeButton}
        >
          <X size={12} />
        </button>
      </div>
    )}

                  <div className={getFieldRowClass()}>
      {/* From Field */}
      <div 
        className={`${styles.fieldGroup} ${activeDropdown === `from_${routeIndex}` ? styles.fieldGroupActive : ''}`}
        style={getFieldGroupStyle(activeDropdown === `from_${routeIndex}`, routeIndex)}
      >
                    <label className={styles.label}>From</label>
                    <input
                      type="text"
                      value={inputValues[`from_${routeIndex}`] || route.from || ''}
                      onChange={(e) => handleInputChange(e.target.value, 'from', routeIndex)}
                      onFocus={() => handleInputFocus('from', routeIndex)}
                      placeholder="Select Departure Location"
                      className={`${styles.input} dropdown-input`}
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'text'
                      }}
                    />
                    <InlineAirportDropdown 
                      type="from" 
                      routeIndex={routeIndex} 
                      isVisible={activeDropdown === `from_${routeIndex}`}
                    />
                  </div>

                  {/* Swap Button */}
                  <div className={styles.swapButtonContainer}>
                    <button
                      onClick={() => swapLocations(routeIndex)}
                      className={styles.swapButton}
                    >
                      <CompareArrowsIcon size={16} color="#6b7280" />
                    </button>
                  </div>

                  {/* To */}
                 <div 
        className={`${styles.fieldGroup} ${activeDropdown === `to_${routeIndex}` ? styles.fieldGroupActive : ''}`}
        style={getFieldGroupStyle(activeDropdown === `to_${routeIndex}`, routeIndex)} // Add this line
      >
                    <label className={styles.label}>To</label>
                    <input
                      type="text"
                      value={inputValues[`to_${routeIndex}`] || route.to || ''}
                      onChange={(e) => handleInputChange(e.target.value, 'to', routeIndex)}
                      onFocus={() => handleInputFocus('to', routeIndex)}
                      placeholder="Select Arrival Location"
                      className={`${styles.input} dropdown-input`}
                      style={{
                        fontSize: '14px',
                        color: '#374151',
                        cursor: 'text'
                      }}
                    />
                    <InlineAirportDropdown 
                      type="to" 
                      routeIndex={routeIndex} 
                      isVisible={activeDropdown === `to_${routeIndex}`}
                    />
                  </div>

                  {/* Departure Date */}
                  <div 
        className={styles.fieldGroup} 
        style={getFieldGroupStyle(activeCalendarDropdown === `depart_${routeIndex}`, routeIndex)} // Add this line
      >
                    <label className={styles.label}>Departure Date</label>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openCalendar("depart", routeIndex);
                      }}
                      className={styles.dateButton}
                    >
                      {route.departDate ? (
                        <>
                          <div className={styles.dateValue}>
                            {formatDate(route.departDate)}
                          </div>
                          <div className={styles.dateDay}>
                            {formatFullDate(route.departDate).split(",")[0]}
                          </div>
                        </>
                      ) : (
                        <div className={styles.datePlaceholder}>Select Date</div>
                      )}
                    </button>
           
                    <InlineCalendarDropdown 
                      type="depart" 
                      routeIndex={routeIndex} 
                      isVisible={activeCalendarDropdown === `depart_${routeIndex}`}
                    />
                  </div>

                  {/* Return Date (only for round trip and first route) */}
                  {tripType === "roundTrip" && routeIndex === 0 && (
                    <div className={styles.fieldGroup} style={{ position: 'relative' }}>
                      <label className={styles.label}>Return Date</label>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openCalendar("return");
                        }}
                        className={styles.dateButton}
                      >
                        {returnDate ? (
                          <>
                            <div className={styles.dateValue}>
                              {formatDate(returnDate)}
                            </div>
                            <div className={styles.dateDay}>
                              {formatFullDate(returnDate).split(",")[0]}
                            </div>
                          </>
                        ) : (
                          <div className={styles.datePlaceholder}>
                            Select Date
                          </div>
                        )}
                      </button>
                      <InlineCalendarDropdown 
                        type="return" 
                        routeIndex={0} 
                        isVisible={activeCalendarDropdown === `return_0`}
                      />
                    </div>
                  )}

                  {/* Passengers (only for non-multi-city trips and first route) */}
                  {tripType !== "multiCity" && routeIndex === 0 && (
                    <div className={styles.fieldGroup} style={{ position: 'relative' }}>
                      <label className={styles.label}>Travellers & Class</label>
                      <button
                        onClick={(e) => handlePassengerFocus(e)}
                        className={styles.passengerButton}
                        style={{
                          justifyContent: 'space-between',
                          textAlign: 'left'
                        }}
                      >
                        <div className={styles.passengerButtonContent}>
                          <div className={styles.passengerTextMain}>
                            {getPassengerText()}
                          </div>
                          <div className={styles.classTextMain}>{travelClass}</div>
                        </div>
                        <ChevronDown size={16} color="#6b7280" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Global Passengers for Multi City */}
            {tripType === "multiCity" && (
              <div className={styles.globalPassengersContainer}>
                <div className={styles.fieldGroup} style={{ position: 'relative' }}>
                  <label className={styles.label}>Travellers & Class (All Flights)</label>
                  <button
                    onClick={(e) => handlePassengerFocus(e)}
                    className={styles.passengerButton}
                    style={{
                      justifyContent: 'space-between',
                      textAlign: 'left'
                    }}
                  >
                    <div className={styles.passengerButtonContent}>
                      <div className={styles.passengerTextMain}>
                        {getPassengerText()}
                      </div>
                      <div className={styles.classTextMain}>{travelClass}</div>
                    </div>
                    <ChevronDown size={16} color="#6b7280" />
                  </button>
                </div>
              </div>
            )}

            {/* Add Flight Button for Multi City */}
            {tripType === "multiCity" && routes.length < 6 && (
              <button onClick={addRoute} className={styles.addFlightButton}>
                <Plus size={16} />
                Add another flight
              </button>
            )}

            {/* Search Buttons Container */}
            <div className={styles.searchButtonsContainer}>
              {/* Regular Search Button */}
              <button
                className={styles.searchButton}
                onClick={() => {
                  handleSearch();
                }}
              >
                <Plane size={20} />
                Search Flights
              </button>

              {/* AI Search Button */}
              <button
                className={styles.aiSearchButton}
                onClick={() => setShowAIModal(true)}
                title="Let AI create your travel itinerary"
              >
                <Sparkles size={20} />
                Search with AI
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area with Sidebar Layout */}
        {hasSearched && (
          <div className={styles.mainLayoutContainer}>
            {/* Left Sidebar - Sort & Filters */}
            <div className={styles.sidebarFiltersSection}>
              <div className={styles.filtersHeader}>
                <h2 className={styles.filtersTitle}>
                  <SlidersHorizontal size={20} color="#ffffff" />
                  Sort & Filters
                </h2>
              </div>

              <div className={styles.filtersContent}>
                {/* Sort Section */}
             
<div className={styles.filterGroup}>
  <h3 className={styles.filterGroupTitle}>Sort By</h3>
  <div className={styles.filterOptions}>
    {[
      { id: "BEST", name: "Best", description: "Recommended for you" },
      { id: "PRICE_ASC", name: "Price: Low to High", description: "Cheapest flights first" },
      { id: "PRICE_DESC", name: "Price: High to Low", description: "Premium flights first" },
      { id: "DURATION_ASC", name: "Duration: Shortest", description: "Quickest flights first" },
      { id: "DURATION_DESC", name: "Duration: Longest", description: "Longest flights first" } // Add this line
    ].map((option) => (
      <div
        key={option.id}
        className={styles.filterOption}
        onClick={() => {
          setAppliedFilters(prev => ({
            ...prev,
            sortOption: option.id
          }));
        }}
      >
        <div className={`${styles.filterCheckbox} ${appliedFilters.sortOption === option.id ? styles.checked : ''}`} />
        <div className={styles.filterLabel}>
          <div>{option.name}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
            {option.description}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

                {/* Quick Filters Section */}
                <div className={styles.filterGroup}>
                  <h3 className={styles.filterGroupTitle}>Quick Filters</h3>
                  <div className={styles.filterOptions}>
                    {[
                      { name: "Non Stop", icon: "flight" },
                      { name: "Refundable Fares", icon: "monetization-on" },
                      { name: "Late Departures", icon: "nights-stay" },
                      { name: "1 Stop", icon: "flight-land" },
                      { name: "Morning Departures", icon: "wb-sunny" }
                    ].map((filter, index) => (
                      <div
                        key={index}
                        className={styles.filterOption}
                        onClick={() => {
                          const newFilters = appliedFilters.quickFilters.includes(filter.name)
                            ? appliedFilters.quickFilters.filter(f => f !== filter.name)
                            : [...appliedFilters.quickFilters, filter.name];
                          setAppliedFilters(prev => ({
                            ...prev,
                            quickFilters: newFilters
                          }));
                        }}
                      >
                        <div className={`${styles.filterCheckbox} ${appliedFilters.quickFilters.includes(filter.name) ? styles.checked : ''}`} />
                        <span className={styles.filterLabel}>{filter.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Airlines Filter Section */}
                {flightCodes.length > 0 && (
                  <div className={styles.filterGroup}>
                    <h3 className={styles.filterGroupTitle}>Airlines</h3>
                    
                    {/* Airline Search Box */}
                    <div className={styles.airlineSearchContainer} style={{ margin: "10px 0" }}>
                      <Search size={16} color="#9ca3af" />
                      <input
                        type="text"
                        placeholder="Search airlines..."
                        value={airlineSearch}
                        onChange={(e) => setAirlineSearch(e.target.value)}
                        className={styles.airlineSearchInput} style={{width:'100%'}}
                      />
                      {airlineSearch && (
                        <button
                          onClick={() => setAirlineSearch("")}
                          className={styles.clearButton}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Airlines List - Scrollable */}
                    <div className={styles.filterOptions} style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {(() => {
                        const uniqueAirlines = [...new Set(flightCodes)];
                        const filteredAirlines = airlineSearch.trim()
                          ? uniqueAirlines.filter(code => 
                              getFlightNameMeta(code).toLowerCase().includes(airlineSearch.toLowerCase()) ||
                              code.toLowerCase().includes(airlineSearch.toLowerCase())
                            )
                          : uniqueAirlines;

                        return filteredAirlines.length === 0 ? (
                          <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
                            {airlineSearch ? `No airlines found matching "${airlineSearch}"` : "No airlines available"}
                          </div>
                        ) : (
                          filteredAirlines.map((code) => (
                            <div
                              key={code}
                              className={styles.filterOption}
                              onClick={() => {
                                const newAirlines = appliedFilters.airlines.includes(code)
                                  ? appliedFilters.airlines.filter(a => a !== code)
                                  : [...appliedFilters.airlines, code];
                                setAppliedFilters(prev => ({
                                  ...prev,
                                  airlines: newAirlines
                                }));
                              }}
                            >
                              <div className={`${styles.filterCheckbox} ${appliedFilters.airlines.includes(code) ? styles.checked : ''}`} />
                              <span className={styles.filterLabel}>
                                {getFlightNameMeta(code)}
                              </span>
                            </div>
                          ))
                        );
                      })()}
                    </div>

                    {/* Selected Airlines Count */}
                    {appliedFilters.airlines.length > 0 && (
                      <div style={{
                        marginTop: "10px",
                        fontSize: "12px",
                        color: "#ed4242",
                        fontWeight: "500",
                        textAlign: "center"
                      }}>
                        {appliedFilters.airlines.length} airline{appliedFilters.airlines.length > 1 ? "s" : ""} selected
                      </div>
                    )}
                  </div>
                )}

                {/* Clear All Filters Button */}
                <div className={styles.filterGroup}>
                  <button 
                    className={styles.clearAllFiltersButton}
                    onClick={handleClearAllFilters}
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className={styles.mainContentSection}>
              {/* Applied Filters Banner */}
              <AppliedFiltersPortal
                filters={appliedFilters}
                sortOption={appliedFilters.sortOption}
                onRemoveFilter={handleRemoveFilter}
                onClearAllFilters={handleClearAllFilters}
                onRemoveSortOption={handleRemoveSortOption}
              />

              {/* Flight Results */}
              <div className={styles.resultsSection}>
                <div className={styles.resultsHeader}>
                  <h2 className={styles.resultsTitle}>Flight Results</h2>
                </div>
                <div className={styles.resultsContent}>
                  <FlightResultsMain
                    searchParamsData={flightSearchData}
                    appliedFilters={appliedFilters}
                    triggerCount={triggerCount}
                    handleFlightsCode={handleFlightsCode}
                    prePopulated={flightSearchDataPrePopulate}

                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Section for when no search has been made */}
        {/* {hasSearched && (
          <div className={styles.noSearchResults}>
            <FlightResultsMain
              searchParamsData={flightSearchData}
              appliedFilters={appliedFilters}
              triggerCount={triggerCount}
              handleFlightsCode={handleFlightsCode}
            />
          </div>
        )} */}

        {/* Airport Selector Modal */}
        {showAirportSelector && (
          <div
            className={styles.overlay}
            onClick={() => setShowAirportSelector(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <AirportSelector
                onSelectAirport={handleAirportSelect}
                onClose={() => setShowAirportSelector(false)}
                fieldType={airportSelectorTarget.field}
                searchText={searchText}
                onSearchChange={handleSearchChange}
              />
            </div>
          </div>
        )}

        {/* Calendar Modal */}

      {showCalendar && (
  <div
    className={styles.overlay}
    onClick={() => setShowCalendar(false)}
  >
    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
      <h3 className={styles.modalTitle}>
        {calendarTarget.type === "depart" ? "Select Departure Date" : "Select Return Date"}
      </h3>
      
      {/* Show selected departure date when choosing return date */}
      {calendarTarget.type === "return" && routes[0]?.departDate && (
        <div className={styles.departureDateInfo}>
          <div className={styles.departureLabel}>Your Departure:</div>
          <div className={styles.departureDateValue}>
            {formatFullDate(routes[0].departDate)}
          </div>
        </div>
      )}

      <div className={styles.calendarHeader}>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() - 1
              )
            )
          }
          className={styles.navButton}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: "16px", fontWeight: "600" }}>
          {monthNames[currentMonth.getMonth()]}{" "}
          {currentMonth.getFullYear()}
        </span>
        <button
          onClick={() =>
            setCurrentMonth(
              new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth() + 1
              )
            )
          }
          className={styles.navButton}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {dayNames.map((day) => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {getDaysInMonth(currentMonth).map((date, index) => {
          if (!date) {
            return <div key={index}></div>;
          }

          const isToday = date.getTime() === today.getTime();

          // Create the cutoff date: July 8, 2026
          const cutoffDate = new Date(2026, 6, 8);
          const isAfterCutoff = date > cutoffDate;

          // Determine minimum date based on calendar target
          let minDate = today;

          if (calendarTarget.type === "return" && routes[0]?.departDate) {
            // For return date, minimum date is the departure date + 1 day
            const departureDate = new Date(routes[0].departDate);
            departureDate.setHours(0, 0, 0, 0);
            minDate = new Date(departureDate);
            minDate.setDate(minDate.getDate() + 1); // Return date must be at least 1 day after departure
          } else if (calendarTarget.type === "depart") {
            // For departure date, minimum date is today
            minDate = today;
          }

          // Check if date is before minimum allowed date
          const isBeforeMinDate = date < minDate;

          // Disable if date is before minimum date OR after July 8, 2026
          const isDisabled = isBeforeMinDate || isAfterCutoff;

          // Check if this date is currently selected
          const selectedDateString = getSelectedDate();
          const isSelected =
            selectedDateString &&
            new Date(selectedDateString).toDateString() ===
            date.toDateString();

          // Check if this is the departure date (for highlighting in return calendar)
          const isDepartureDate = 
            calendarTarget.type === "return" && 
            routes[0]?.departDate && 
            new Date(routes[0].departDate).toDateString() === date.toDateString();

          return (
            <button
              key={index}
              onClick={() => !isDisabled && handleDateSelect(date)}
              disabled={isDisabled}
              className={`${styles.dayButton} 
                ${isSelected ? styles.dayButtonSelected : ""}
                ${isDisabled ? styles.dayButtonDisabled : ""}
                ${isDepartureDate ? styles.departureDateHighlight : ""}
                ${isToday ? styles.todayHighlight : ""}`}
            >
              {date.getDate()}
              {isDepartureDate && (
                <div className={styles.departureBadge}>Depart</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend for Return Date */}
      {calendarTarget.type === "return" && (
        <div className={styles.calendarLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.departureDot}`}></div>
            <span className={styles.legendText}>Departure Date</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.todayDot}`}></div>
            <span className={styles.legendText}>Today</span>
          </div>
        </div>
      )}

      {calendarTarget.type === "return" && routes[0]?.departDate && (
        <div className={styles.dateHelpText}>
          Return date must be after {formatDate(routes[0].departDate)}
        </div>
      )}

      <button
        onClick={() => setShowCalendar(false)}
        className={styles.closeButton}
      >
        Close
      </button>
    </div>
  </div>
)}
        {/* Enhanced Passengers Modal */}
        {showPassengers && (
          <div
            className={styles.overlay}
            onClick={() => setShowPassengers(false)}
          >
            <div
              className={styles.passengerModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.passengerModalHeader}>
                <button
                  onClick={() => setShowPassengers(false)}
                  className={styles.backButton}
                >
                  <ChevronLeft size={24} color="#ed4242" />
                </button>
                <h3 className={styles.modalTitle}>Passengers & Class</h3>
              </div>

              <div className={styles.passengerModalContent}>
                {/* Cabin Class Selection */}
                <div className={styles.sectionTitle}>Cabin Class</div>
                <div className={styles.classSelectionContainer}>
                  {classes.map((classOption) => (
                    <button
                      key={classOption}
                      className={`${styles.classOption} ${travelClass === classOption
                        ? styles.selectedClassOption
                        : ""
                        }`}
                      onClick={() => setTravelClass(classOption)}
                    >
                      {classOption}
                    </button>
                  ))}
                </div>

                {/* Passengers Section */}
                <div
                  className={styles.sectionTitle}
                  style={{ marginTop: "24px" }}
                >
                  Passengers
                </div>

                {/* Student mode indicator */}
                {isStudentMode && (
                  <div className={styles.studentModeIndicator}>
                    <Users size={16} color="#ed4242" />
                    <span className={styles.studentModeText}>
                      Student booking mode - Other passenger types are disabled
                    </span>
                  </div>
                )}

                {/* General error message */}
                {renderErrorMessage("general")}

                {/* Passenger Types */}
                {["adults", "children", "infants", "students"].map((type) => (
                  <div key={type}>
                    <div className={getPassengerRowStyle(type)}>
                      <div className={styles.passengerLabelContainer}>
                        <div className={styles.passengerLabelInfo}>
                          <div className={getPassengerLabelStyle(type)}>
                            {getPassengerTypeLabel(type)}
                          </div>
                          <div className={getPassengerDescriptionStyle(type)}>
                            {getPassengerTypeDescription(type)}
                          </div>
                        </div>
                        {type === "students" && (
                          <button
                            onClick={() => setShowStudentInfo(true)}
                            className={styles.infoButton}
                          >
                            <Info size={20} color="#ed4242" />
                          </button>
                        )}
                      </div>
                      <div className={styles.passengerCounterContainer}>
                        <button
                          className={`${getButtonStyle(type)} ${isDecrementDisabled(type)
                            ? styles.disabledButton
                            : ""
                            }`}
                          onClick={() => updatePassengerCount(type, false)}
                          disabled={isDecrementDisabled(type)}
                        >
                          <Minus size={20} color="#ed4242" />
                        </button>

                        <span
                          className={`${styles.passengerCount} ${isStudentMode && type !== "students"
                            ? styles.disabledPassengerCount
                            : ""
                            }`}
                        >
                          {passengers[type]}
                        </span>

                        <button
                          className={`${getButtonStyle(type)} ${isIncrementDisabled(type)
                            ? styles.disabledButton
                            : ""
                            }`}
                          onClick={() => updatePassengerCount(type, true)}
                          disabled={isIncrementDisabled(type)}
                        >
                          <Plus size={20} color="#ed4242" />
                        </button>
                      </div>
                    </div>

                    {/* Individual error messages */}
                    {renderErrorMessage(type)}
                  </div>
                ))}

                {/* Validation Info */}
                <div className={styles.validationInfo}>
                  {!isStudentMode && (
                    <>
                      <div className={styles.validationInfoText}>
                        • Infants must be accompanied by an adult
                      </div>
                      <div className={styles.validationInfoText}>
                        • Maximum 9 passengers per booking
                      </div>
                    </>
                  )}
                  {isStudentMode && (
                    <div className={styles.validationInfoText}>
                      • Student bookings: Maximum 9 students per booking
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.passengerModalFooter}>
                <button
                  className={`${styles.applyButton} ${Object.keys(errors).length > 0 && hasValidated
                    ? styles.applyButtonDisabled
                    : ""
                    }`}
                  onClick={handlePassengerSave}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Info Modal */}
        {showStudentInfo && (
          <div
            className={styles.overlay}
            onClick={() => setShowStudentInfo(false)}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.studentInfoHeader}>
                <h3 className={styles.modalTitle}>
                  Student Travel Information
                </h3>
                <button
                  onClick={() => setShowStudentInfo(false)}
                  className={styles.modalCloseButton}
                >
                  <X size={24} color="#ed4242" />
                </button>
              </div>

              <div className={styles.studentInfoBody}>
                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Users size={20} color="#ed4242" />
                  </div>
                  <div className={styles.infoText}>
                    Get special student offers and discounts on selected flights
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <div className={styles.infoIcon}>
                    <Calendar size={20} color="#ed4242" />
                  </div>
                  <div className={styles.infoText}>
                    Valid student ID and visa details may be required for
                    verification
                  </div>
                </div>

                <div className={styles.noteContainer}>
                  <div className={styles.noteText}>
                    Note: Student fares are subject to availability and airline
                    policies. Additional documentation may be requested during
                    booking or check-in.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session History Modal */}
        <SessionHistoryModal />

        {/* AI Itinerary Modal */}
        <AIItineraryModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          userId={baseUserId}
          source="flights"
          onFlightSearchSuccess={handleAIFlightSearchSuccess}
        />
      </div>
    </CommonLayout>
  );
};

export default FlightSearch;
