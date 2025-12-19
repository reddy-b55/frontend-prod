import axios from "axios";
import Helmet from "react-helmet";
import { useRouter } from "next/router";
import { createContext, useEffect, useRef, useState } from "react";
import { getCurrencyValues } from "../AxiosCalls/GlobalAxiosServices/globalServices";
import validateUser from "../GlobalFunctions/Authentications/ValidateUser";
import ThemeSettings from "./theme-setting/customizer/theme-settings";
import TapTop from "../components/common/widgets/Tap-Top";
import getHashedVal from "../AxiosCalls/UserServices/getHashedVal";
import DemographicGameScreen from "../components/Persona/PersonaQuestion";

import "../public/assets/scss/app.scss";
import "../styles/global.css";
import "regenerator-runtime/runtime";

export const AppContext = createContext(null);
export const ProductContext = createContext(null);

axios.defaults.baseURL = "https://dev-gateway.aahaas.com/api";
axios.defaults.data = "https://dev-gateway.aahaas.com/";
axios.defaults.headers.post["Content-Type"] = "application/json";
axios.defaults.headers.post["Accept"] = "application/json";
axios.defaults.withCredentials = true;

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const targetPath = "/serverDown";

  const [groupApiCode, setGroupApiCode] = useState("AIzaSyAJIZAqzQ12tjNY13kN3Flah4o-XNeeeDQ");
  const [baseLocation, setBaseLocation] = useState([]);
  const [userId, setUserId] = useState("AHS_Guest");
  const [userStatus, setUserStatus] = useState({ userID: "", userLoggesIn: false });
  const [baseUserId, setBaseUserId] = useState({ cxid: "", pro_pic: "", user_email: "", user_username: "" });
  const [userSearchFilters, setUserSearchFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userAuthenticationLoading, setUserAuthenticationLoading] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState("");
  const [baseCurrencyValue, setbaseCurrencyValue] = useState([]);

  // NEW STATE FOR DEMOGRAPHIC GAME
  const [showDemographicGame, setShowDemographicGame] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [checkingQuizStatus, setCheckingQuizStatus] = useState(true);

  const [triggers, setTriggers] = useState({
    userLoginTrigger: false,
    customerCartTrigger: false,
    baseCurrencyTrigger: false,
    userDesireLocation: false,
  });

// In MyApp.js - update checkIfUserNeedsQuiz function
const checkIfUserNeedsQuiz = async (userID) => {
  if (!userID || userID === "AHS_Guest") {
    return false;
  }

  try {
    if (typeof window !== 'undefined') {
      const quizStatus = localStorage.getItem(`demographicStatus_${userID}`);
      
      // If user SKIPPED, show quiz again
      if (quizStatus === 'skipped') {
        console.log(`User ${userID} skipped quiz previously, showing again`);
        return true;
      }
      
      // If user COMPLETED, don't show quiz
      if (quizStatus === 'completed') {
        console.log(`User ${userID} has already completed demographic quiz`);
        return false;
      }
    }

    // Call your existing API to check if user has completed the quiz
    const response = await axios.post("/personalization/demographic-game/start", {
      user_id: userID,
    });

    console.log("Quiz check response:", response.data);

    // If the API returns "already_completed", user doesn't need quiz
    if (response.data.status === "already_completed") {
      // Mark as completed in localStorage for future reference
      localStorage.setItem(`demographicStatus_${userID}`, 'completed');
      return false;
    }

    // If API returns session data, user needs to take quiz
    if (response.data.session_token) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking quiz status:", error);
    // If API fails, use localStorage as fallback
    if (typeof window !== 'undefined') {
      const quizStatus = localStorage.getItem(`demographicStatus_${userID}`);
      return !quizStatus || quizStatus === 'skipped';
    }
    return false;
  }
};

// Update markDemographicCompleted function
// Update markDemographicCompleted function
const markDemographicCompleted = (userID, completed = true, skipped = false) => {
  if (typeof window !== 'undefined') {
    if (skipped) {
      localStorage.setItem(`demographicStatus_${userID}`, 'skipped');
      console.log(`User ${userID} marked as SKIPPED quiz`);
    } else if (completed) {
      localStorage.setItem(`demographicStatus_${userID}`, 'completed');
      console.log(`User ${userID} marked as COMPLETED quiz`);
    } else {
      localStorage.removeItem(`demographicStatus_${userID}`);
      console.log(`User ${userID} quiz status cleared`);
    }
  }
  setShowDemographicGame(false);
  setIsNewUser(false);
};

// Also update the onComplete function passed to DemographicGameScreen:
const handleDemographicComplete = (skipped = false) => {
  if (userId !== "AHS_Guest") {
    markDemographicCompleted(userId, true, skipped);
  }
};
  // Function to mark user as completed demographic
 

  const getUserLostLocation = (userDesireLocation) => {
    if (
      userDesireLocation === null ||
      userDesireLocation === undefined ||
      userDesireLocation === "undefined"
    ) {
      const dataset = {
        latitude: "6.9271",
        longtitude: "79.8612",
        address_full: "Colombo, Sri lanka",
        address_components: [
          {
            long_name: "Colombo",
            short_name: "Colombo",
            types: ["locality", "political"],
          },
          {
            long_name: "Colombo",
            short_name: "Colombo",
            types: ["administrative_area_level_2", "political"],
          },
          {
            long_name: "Western Province",
            short_name: "WP",
            types: ["administrative_area_level_1", "political"],
          },
          {
            long_name: "Sri Lanka",
            short_name: "LK",
            types: ["country", "political"],
          },
        ],
      };

      let formatted = JSON.stringify(dataset);
      localStorage?.setItem("userLastLocation", formatted);
      setBaseLocation(dataset);
    } else if (
      userDesireLocation !== null &&
      userDesireLocation !== undefined
    ) {
      let formatted = JSON.parse(userDesireLocation);
      setBaseLocation(formatted);
    }
  };

  const updateBaseCurrencyValue = async (value) => {
    let serverResponse = [];
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === isNaN
    ) {
      setBaseCurrency("USD");
      localStorage.setItem("baseCurrency", "USD");
      serverResponse = await getCurrencyValues("USD");
    } else {
      setBaseCurrency(value);
      serverResponse = await getCurrencyValues(value);
    }
    if (serverResponse === "(Internal Server Error)") {
      if (router.pathname != targetPath) {
        // router.push("/serverDown");
      }
      setIsLoading(false);
    } else {
      setbaseCurrencyValue(serverResponse);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          if (error.response.status === 504) {
            console.error("504 Gateway Timeout occurred");
          }
        } else if (error.request) {
          console.error("No response received from server");
        } else {
          console.error("Error setting up request", error.message);
        }

        return Promise.reject(error);
      }
    );
  }, []);

  const iframeRef = useRef(null)

  useEffect(() => {
    setUserAuthenticationLoading(true);
    setCheckingQuizStatus(true);
        const userID = localStorage?.getItem("#__uid");
    const hashKey = getHashedVal();

    // const userID = "601"; // Old user who completed quiz
    // const hashKey = "$2y$10$ZVwwbznUpMRyQyMt1PyySOyo.VLSH3Mi.Q15RNJHQ43mCcbEwsbFu";

    //    const userID = "10914766";
    // const hashKey = "$2y$10$1kq6f6bdW6z5i5xcPL5WtecxCGFtrEJJpS8i8fPk1bK955lcSS6p2";


    // For testing new user, use this instead:
    // const userID = "10914774"; 
    // const hashKey = "$2y$10$Th.rj/bnFaB485rDnVqJkuxX09tsOXRzkukL1AthyWvC3lUO.oAAe"; 

    if (
      userID === null ||
      userID === "" ||
      userID === undefined ||
      hashKey === null ||
      hashKey === "" ||
      hashKey === undefined
    ) {
      setUserId("AHS_Guest");
      setUserStatus({
        userID: "",
        userLoggesIn: false,
      });
      setBaseUserId({
        cxid: "",
        pro_pic: "",
        user_email: "",
        user_username: "",
      });
      localStorage.removeItem("#__uid");
      setUserAuthenticationLoading(false);
      setCheckingQuizStatus(false);
    } else {
      validateUser(userID, hashKey).then(async (res) => {
        if (res?.status === 200) {
          setUserId(userID);
          setUserStatus({ userID: userID, userLoggesIn: true });
          setUserStatus({ userID: userID, userLoggesIn: true });
          setBaseUserId({
            cxid: res.cxid,
            pro_pic: res.pro_pic,
            user_email: res.user_email,
            user_username: res.user_username,
          });
          
          // CHECK IF USER NEEDS QUIZ
          const needsQuiz = await checkIfUserNeedsQuiz(userID);
          console.log(`User ${userID} needs quiz:`, needsQuiz);
          setIsNewUser(needsQuiz);
          setShowDemographicGame(needsQuiz);
          
          setUserAuthenticationLoading(false);
          setCheckingQuizStatus(false);
        } else {
          setUserId("AHS_Guest");
          setUserStatus({ userID: "", userLoggesIn: false });
          setBaseUserId({ cxid: "", pro_pic: "", user_email: "", user_username: "" });
          setUserStatus({ userID: "", userLoggesIn: false });
          setBaseUserId({ cxid: "", pro_pic: "", user_email: "", user_username: "" });
          localStorage.removeItem("#__uid");
          setUserAuthenticationLoading(false);
          setCheckingQuizStatus(false);
        }
      }).catch(error => {
        console.error("Authentication error:", error);
        setUserId("AHS_Guest");
        setUserStatus({ userID: "", userLoggesIn: false });
        setBaseUserId({ cxid: "", pro_pic: "", user_email: "", user_username: "" });
        localStorage.removeItem("#__uid");
        setUserAuthenticationLoading(false);
        setCheckingQuizStatus(false);
      });
    }
  }, [triggers.userLoginTrigger]);
  useEffect(() => {
    let baseCurrency = localStorage.getItem("baseCurrency");
    updateBaseCurrencyValue(baseCurrency);
  }, [triggers.baseCurrencyTrigger]);

  useEffect(() => {
    const userDesireLocation = localStorage?.getItem("userLastLocation");
    getUserLostLocation(userDesireLocation);
  }, [triggers.userDesireLocation]);

  useEffect(() => {
    const userLastLocation = baseLocation;
    document.cookie = `userLastLocation=${JSON.stringify(
      userLastLocation
    )}; path=/;`;
  }, [triggers.userDesireLocation, baseLocation]);



  return (
    <>
      {!userAuthenticationLoading && !isLoading && !checkingQuizStatus ? (
        <>
          <Helmet>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <title>Aahaas</title>
            <link rel="icon" href="/assets/images/icon/favicon.png" />
          </Helmet>
          
          <AppContext.Provider
            value={{
              isLoading,
              setIsLoading,
              baseCurrencyValue,
              setbaseCurrencyValue,
              baseCurrency,
              setBaseCurrency,
              triggers,
              setTriggers,
              userId,
              setUserId,
              baseUserId,
              setBaseUserId,
              userStatus,
              setUserStatus,
              baseLocation,
              setBaseLocation,
              userSearchFilters,
              setUserSearchFilters,
              groupApiCode,
              setGroupApiCode,
              isNewUser,
              setIsNewUser,
              showDemographicGame,
              setShowDemographicGame,
            }}
          >
            {showDemographicGame ? (
              <DemographicGameScreen 
                onComplete={handleDemographicComplete}
              />
            ) : (
              <Component {...pageProps} />
            )}
            <ThemeSettings />
            <TapTop />
          </AppContext.Provider>
        </>
      ) : (
        <div className="loader-wrapper">
          <div className="loader"></div>
        </div>
      )}
    </>
  );
}