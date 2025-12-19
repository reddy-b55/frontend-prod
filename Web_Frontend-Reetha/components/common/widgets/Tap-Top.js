import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../../pages/_app";

import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";

import { useRouter } from "next/router";

const TapTop = () => {
  const router = useRouter();
  const [goingUp, setGoingUp] = useState(false);
  const { userStatus ,showDemographicGame } = useContext(AppContext);

  const chatButtonRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [isChatBoxOpen, setIsChatBoxOpen] = useState(false);
  const [showScrollTooltip, setShowScrollTooltip] = useState(false);
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);

  const tapToTop = () => {
    window.scrollTo({
      behavior: "smooth",
      top: 0,
    });
  };

  const handleChatRoute = () => {
    router.push("/page/account/chats");
  };

  const handleHelpRoute = () => {
    router.push("/page/helpcenter");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setGoingUp(currentScrollY > 500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatButtonRef.current &&
        !chatButtonRef.current.contains(event.target) &&
        chatBoxRef.current &&
        !chatBoxRef.current.contains(event.target)
      ) {
        setIsChatBoxOpen(false);
      }
    }

    if (isChatBoxOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isChatBoxOpen]);
if (showDemographicGame) {
    return null;
  }
  return (
    <>
      {/* Scroll to Top Button - Just added title attribute for tooltip */}
      <div
        className="tap-top top-cls"
        style={{ display: goingUp ? "block" : "none" }}
        onClick={tapToTop}
        title="Scroll to Top"
      >
        <KeyboardArrowUpOutlinedIcon />
      </div>

      {/* Help Desk Button - Just added title attribute for tooltip */}
      <div
        className="chat-top top-cls"
        style={{
          display: "block",
          bottom: goingUp 
            ? window.innerWidth <= 768 
              ? "120px"
              : window.innerWidth <= 1024 
                ? "70px"
                : "70px"
            : window.innerWidth <= 768 
              ? "15px"
              : window.innerWidth >= 1024 
                ? "18px"
                : "10px",
        }}
        onClick={() => setIsChatBoxOpen(!isChatBoxOpen)}
        ref={chatButtonRef}
        title="Help Desk"
      >
        <HeadsetMicOutlinedIcon />
      </div>

      {isChatBoxOpen && (
        <div
          className="chat-box"
          ref={chatBoxRef}
          style={{
            position: "fixed",
            bottom: window.innerWidth <= 768 
              ? "60px"
              : window.innerWidth <= 1024 
                ? "70px"
                : "80px",
            right: window.innerWidth <= 768 
              ? "75px"
              : window.innerWidth <= 1024 
                ? "85px"
                : "85px",
            width: window.innerWidth <= 768 
              ? "140px"
              : "150px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e0e0e0",
            padding: "15px",
            zIndex: 1100,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <button
            onClick={handleChatRoute}
            className="btn btn-solid border-0"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Chat
          </button>

          <button
            onClick={() => {
              handleHelpRoute();
            }}
            className="btn btn-solid border-0"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "background-color 0.2s ease",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help
          </button>
        </div>
      )}
    </>
  );
};

export default TapTop;