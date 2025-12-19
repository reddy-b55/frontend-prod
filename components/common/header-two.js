import { ca, ro } from "date-fns/locale";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { AppContext } from "../../pages/_app";
import {
  getCartDataLength,
  getNotificationLength,
} from "../../AxiosCalls/UserServices/userServices";
import NotificationMainPage from "../Notification/Notification";
import AIItineraryModal from "../AIItinerary/AIItineraryModal";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { geocodeByLatLng } from "react-google-places-autocomplete";

import {
  ShoppingCartOutlined,
  AccountCircle,
  Menu,
  Login,
  Logout,
  HelpOutline,
  Diversity3,
  Discount,
  Comment,
  HistoryOutlined,
  AccountCircleOutlined,
  ShareLocationOutlined,
  SearchOutlined,
  Close,
  CurrencyExchange,
  MyLocation,
  ShoppingCart,
  KeyboardArrowDown,
  Home as HomeIcon,
  Share
} from "@mui/icons-material";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import LocationModal from "./LocationModal";
import axios from "axios";

const EnhancedShoesHeader = ({
  locationView = true,
  onLocationClick,
  onCurrencyChange,
  onLogout,
  onRedirect,
  onSearch,
  screen,
  catIcon = true,
  location = true,
}) => {
  // State management
  const {
    baseCurrency,
    triggers,
    setTriggers,
    baseLocation,
    userStatus,
    userId,
    baseUserId,
    setBaseLocation, // Make sure this is available in your context
  } = useContext(AppContext);
  const [cartDataLength, setCartDataLength] = useState(0);
  const [NotificationLength, setNotificationLength] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideTopHeader, setHideTopHeader] = useState(false);
  const [openSideBar, setOpenSideBar] = useState(false);
  const [openNotificationSideBar, setOpenNotificationSideBar] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(false);
  const [isLogoLoading, setIsLogoLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const router = useRouter();
  // Refs for dropdowns
  const currencyRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationSideBarRef = useRef(null);

  // Navigation links
  const navLinks = [
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: "/assets/images/Icons/lifestyle.png",
      href: "/shop/lifestyle",
      href2: "/product-details/lifestyle",
    },
    {
      id: "hotels",
      label: "Hotels",
      icon: "/assets/images/Icons/hotel.png",
      href: "/shop/hotels",
      href2: "/product-details/hotel",
    },
    {
      id: "flights",
      label: "Flights",
      icon: "/assets/images/Icons/flight.png",
      href: "/shop/newFlights",
    },
    {
      id: "education",
      label: "Education",
      icon: "/assets/images/Icons/education.png",
      href: "/shop/education",
      href2: "/product-details/education",
    },
    {
      id: "essential",
      label: "Essential",
      icon: "/assets/images/Icons/ess.png",
      href: "/shop/essential",
      href2: "/product-details/essential",
    },
    {
      id: "nonessential",
      label: "Non-Essential",
      icon: "/assets/images/Icons/noness.png",
      href: "/shop/nonessential",
      href2: "/product-details/nonessential",
    },
  ];
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Use your existing geocoding logic from LocationModal
            const results = await geocodeByLatLng({ lat: latitude, lng: longitude });
            const locationData = {
              address_full: results[0].formatted_address,
              latitude: latitude,
              longtitude: longitude,
              address_components: results[0].address_components,
            };
            resolve(locationData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  };
  useEffect(() => {
    const setCurrentLocationOnLogin = async () => {
      if (userStatus.userLoggesIn && userId) {
        // Check if user already has a saved location
        const savedLocation = localStorage.getItem('aahaas_selected_location');

        if (!savedLocation) {
          // No saved location, get current location
          try {
            console.log('User logged in, fetching current location...');
            const currentLocation = await getCurrentLocation();

            // Set the location in context and localStorage
            setBaseLocation(currentLocation);
            localStorage.setItem('aahaas_selected_location', JSON.stringify(currentLocation));
            localStorage.setItem('userLastLocation', JSON.stringify(currentLocation));
            Cookies.set('userLastLocation', JSON.stringify(currentLocation), { path: '/' });

            console.log('Current location set for user:', currentLocation.address_full);

            // Trigger refresh to update components
            setTriggers(prev => ({
              ...prev,
              userDesireLocation: !prev.userDesireLocation
            }));

          } catch (error) {
            console.error('Error setting current location:', error);
          }
        } else {
          console.log('User has existing location, using saved location');
        }
      }
    };

    setCurrentLocationOnLogin();
  }, [userStatus.userLoggesIn, userId]);
  // Set active link based on current route
  useEffect(() => {
    const found = navLinks.find(
      (link) =>
        router.pathname.startsWith(link.href) ||
        router.pathname.startsWith(link.href2)
    );
    if (found) {
      setActiveLink(found.id);
    } else {
      setActiveLink("");
    }
  }, [router.pathname]);

  const currencies = ["USD", "LKR", "SGD", "INR", "AED", "MYR"];

  // Add this function with your other event handlers
  const handleShareApp = () => {
    const shareData = {
      title: 'Aahaas - In-Destination Super App',
      text: '🚀 Discover amazing travel experiences with Aahaas! ✈️ Book hotels, flights, lifestyle activities, education, essentials and more. Join me now!',
      url: window.location.origin,
    };

    // Web Share API for mobile
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Successful share'))
        .catch((error) => {
          console.log('Error sharing:', error);
          showShareOptions(shareData);
        });
    } else {
      // Show custom share options for desktop
      showShareOptions(shareData);
    }

    setUserDropdownOpen(false);
  };

  const showShareOptions = (shareData) => {
    // Create a custom share modal or use browser prompt
    const shareMessage = `${shareData.text}\n\n${shareData.url}`;

    // Copy to clipboard as primary action
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage).then(() => {
        // Use your ToastMessage component here
        alert('✅ App link copied to clipboard! Share it with your friends via WhatsApp, Facebook, or any messaging app.');
      }).catch(() => {
        // Fallback
        prompt('📱 Share Aahaas with friends!\n\nCopy this message:', shareMessage);
      });
    } else {
      // Final fallback
      prompt('📱 Share Aahaas with friends!\n\nCopy this message:', shareMessage);
    }
  };

  // Fallback share function for desktop
  const fallbackShare = (url) => {
    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      // Show success message (you can use your ToastMessage here)
      alert('Link copied to clipboard! Share it with your friends.');
    }).catch(() => {
      // Fallback if clipboard fails
      prompt('Copy this link to share:', url);
    });
  };

  // Event handlers
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsScrolled(scrollTop > 50);
    setHideTopHeader(scrollTop > 100);

    if (currencyDropdownOpen) {
      setCurrencyDropdownOpen(false);
    }

    if (userDropdownOpen) {
      setUserDropdownOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (currencyRef.current && !currencyRef.current.contains(event.target)) {
      // setCurrencyDropdownOpen(false);
    }
    // if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
    //   setUserDropdownOpen(false);
    // }
    if (
      notificationSideBarRef.current &&
      !notificationSideBarRef.current.contains(event.target)
    ) {
      setOpenNotificationSideBar(false);
    }
  };

  const handleRedirect = (value) => {
    const routes = {
      home: "/",
      help: "/page/helpcenter",
      login: "/page/account/login-auth",
      profile: {
        pathname: "/page/account/profile",
        query: { page: "myProfile-page" },
      },
      cart: "/page/account/cart-page",
      search: "/page/search",
      "order-history": "/page/account/order-history",
      offers: "/page/offers",
      chat: "/page/account/chats",
      my_carts: {
        pathname: "/page/account/profile",
        query: { page: "my-carts" },
      },
      travel_budies: {
        pathname: "/page/account/profile",
        query: { page: "travel-buddies" },
      },
    };

    if (routes[value]) {
      if (value === "home") {
        setIsLogoLoading(true);
      }

      router.push(routes[value]).then(() => {
        if (value === "home") {
          setTimeout(() => {
            setIsLogoLoading(false);
          }, 500);
        }
      }).catch(() => {
        if (value === "home") {
          setIsLogoLoading(false);
        }
      });
    } else {
      console.log("Route not found for value:", value);
    }
    setUserDropdownOpen(false);
    setOpenSideBar(false);
  };

  const updateCurrency = (value) => {
    try {
      localStorage.setItem("baseCurrency", value);
      setTriggers({
        ...triggers,
        baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
      });
      setCurrencyDropdownOpen(false);
    } catch (err) { }
  };


  const handleCategoryClick = (category) => {
    router.push(category);
  };

  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      return;
    }

    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/page/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // AI Itinerary handlers
  const handleAIItinerary = () => {
    setShowAIPrompt(true);
  };

  useEffect(() => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  }, [searchQuery]);

  // Effects
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currencyDropdownOpen, userDropdownOpen]);
// Add this function to handle location changes
const handleLocationSelect = (locationData) => {
  // Save to localStorage and context
  localStorage.setItem('aahaas_selected_location', JSON.stringify(locationData));
  localStorage.setItem('userLastLocation', JSON.stringify(locationData));
  Cookies.set('userLastLocation', JSON.stringify(locationData), { path: '/' });
  
  // Update context
  setBaseLocation(locationData);
  
  // Trigger refresh to update components
  setTriggers(prev => ({
    ...prev,
    userDesireLocation: !prev.userDesireLocation
  }));
};

// Update the useEffect for location management
useEffect(() => {
  const manageUserLocation = async () => {
    if (userStatus.userLoggesIn && userId) {
      // Check if user has a manually selected location
      const savedLocation = localStorage.getItem('aahaas_selected_location');
      const userLastLocation = localStorage.getItem('userLastLocation');
      
      if (savedLocation) {
        // User has manually selected a location, use it
        try {
          const locationData = JSON.parse(savedLocation);
          setBaseLocation(locationData);
          console.log('Using saved location:', locationData.address_full);
        } catch (error) {
          console.error('Error parsing saved location:', error);
          // Fallback to current location if saved location is invalid
          await setCurrentLocation();
        }
      } else if (!userLastLocation) {
        // No saved location, get current location (first time login)
        await setCurrentLocation();
      }
      // If userLastLocation exists but no aahaas_selected_location, 
      // it means user hasn't manually changed location, so we keep using the last location
    }
  };

  manageUserLocation();
}, [userStatus.userLoggesIn, userId]);

// Helper function to set current location
const setCurrentLocation = async () => {
  try {
    console.log('Setting current location for user...');
    const currentLocation = await getCurrentLocation();
    
    // Set the location in context and localStorage
    setBaseLocation(currentLocation);
    localStorage.setItem('aahaas_selected_location', JSON.stringify(currentLocation));
    localStorage.setItem('userLastLocation', JSON.stringify(currentLocation));
    Cookies.set('userLastLocation', JSON.stringify(currentLocation), { path: '/' });

    console.log('Current location set for user:', currentLocation.address_full);

    // Trigger refresh to update components
    setTriggers(prev => ({
      ...prev,
      userDesireLocation: !prev.userDesireLocation
    }));
  } catch (error) {
    console.error('Error setting current location:', error);
  }
};

// In header-two.js - update handleLogOut function
const handleLogOut = async () => {
  // Clear only the manual selection, keep last location for future reference
  localStorage.removeItem('aahaas_selected_location');
  // Don't remove userLastLocation so we can use it if user logs back in without changing location
  
  // ❌ REMOVE THIS LINE: Don't clear demographic completion status on logout
  // if (userId && userId !== "AHS_Guest") {
  //   localStorage.removeItem(`demographicCompleted_${userId}`);
  // }
  
  router.push("/page/account/login-auth");
  localStorage.removeItem("#__uid");
  Cookies.remove("hashedVal");
  setTriggers({
    userLoginTrigger: !triggers.userLoginTrigger,
    customerCartTrigger: !triggers.customerCartTrigger,
    baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
    userDesireLocation: !triggers.userDesireLocation,
  });
  setUserDropdownOpen(false);
  localStorage.removeItem("profileModalLastClosed");
};
  useEffect(() => {
    if (userStatus.userLoggesIn) {
      getCartLength();
    }
  }, [triggers]);

  useEffect(() => {
    getNotificationsLength();
    const interval = setInterval(() => {
      getNotificationsLength();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle body scroll when notification sidebar is open
  useEffect(() => {
    if (openNotificationSideBar) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.setAttribute("data-scroll-position", scrollTop);
    } else {
      const scrollTop = document.body.getAttribute("data-scroll-position") || 0;
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.scrollTo(0, parseInt(scrollTop));
      document.body.removeAttribute("data-scroll-position");
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.removeAttribute("data-scroll-position");
    };
  }, [openNotificationSideBar]);

  // Handle body scroll when mobile sidebar is open
  useEffect(() => {
    if (openSideBar) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = "100%";
      document.documentElement.style.overflow = "hidden";
      document.body.setAttribute("data-scroll-position-sidebar", scrollTop);
    } else {
      const scrollTop = document.body.getAttribute("data-scroll-position-sidebar") || 0;
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      window.scrollTo(0, parseInt(scrollTop));
      document.body.removeAttribute("data-scroll-position-sidebar");
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.documentElement.style.overflow = "";
      document.body.removeAttribute("data-scroll-position-sidebar");
    };
  }, [openSideBar]);

  const getCartLength = async () => {
    const response = await getCartDataLength(userId);
    setCartDataLength(response);
  };

  const getNotificationsLength = async () => {
    const response = await getNotificationLength(userId);
    console.log("response.notification", response);
    setNotificationLength(response.count);
  };

// Add this function to open location modal
const handleLocationModalOpen = () => {
  setOpenLocationModal(true);
};

// Update the location click handler
const handleLocationClick = () => {
  if (onLocationClick) {
    onLocationClick();
  } else {
    handleLocationModalOpen(); // Open modal when location is clicked
  }
};

  return (
    <React.Fragment>
      <div className={`header ${isScrolled ? "scrolled" : ""}`}>
        {/* Top Section - Promotional Banner */}
        <div className={`top-banner ${hideTopHeader ? "sticky" : ""}`}>
          <div className="container">
            <div className="banner-content">
              <div className="banner-item">
                <span className="banner-icon">📍 </span>
                <span className="banner-text">
                  <strong>In-Destination Super App</strong>
                </span>
              </div>
              <div className="banner-item">
                <span className="banner-icon">⚡</span>
                <span className="banner-text">
                  <strong>Instant Bookings & Delivery</strong>
                </span>
              </div>
              <div className="banner-item">
                <span className="banner-icon">✨</span>
                <span className="banner-text">
                  <strong>Personalized Experiences</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section - Main Header */}
        <div className={`main-header ${hideTopHeader ? "sticky" : ""}`}>
          <div className="container">
            <div className="header-content">
              {/* Logo Section */}
              <div className="logo" onClick={() => handleRedirect("home")}>
                {isLogoLoading ? (
                  <div className="logo-loading">
                    <div className="logo-spinner"></div>
                  </div>
                ) : (
                  <img
                    src={`/assets/images/icon/logo.png`}
                    alt="logo"
                    style={{ width: "190px", height: "auto" }}
                  />
                )}
              </div>

              {/* Desktop Search Bar */}
              <div>
                <div>
                  <div className="desktop-search">
                    <input
                      type="text"
                      placeholder="Search Aahaas..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    {searchQuery && (
                      <button
                        className="search-clear-button"
                        onClick={() => {
                          setSearchQuery("");
                          if (onSearch) {
                            onSearch("");
                          }
                        }}
                      >
                        <Close />
                      </button>
                    )}
                    <button className="search-button" onClick={handleSearch}>
                      <SearchOutlined />
                    </button>
                  </div>
                </div>
                <div style={{ maxWidth: "100%" }}>
                  {/* Categories with Icons */}
                  <div className="categories-section">
                    <nav className="category-nav">
                      {navLinks.map((link) => (
                        <a
                          key={link.id}
                          href={link.href}
                          className={`category-link ${activeLink === link.id ? "active" : ""
                            }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleRedirect(link.href);
                            handleCategoryClick(link.href);
                          }}
                        >
                          {/* Category Icon */}
                          <div className="category-icon">
                            <img
                              src={link.icon}
                              alt={link.label}
                              className="category-icon-img"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <span className="category-icon-fallback" style={{ display: 'none' }}>
                              {link.label.charAt(0)}
                            </span>
                          </div>
                          <span className="category-label">{link.label}</span>
                        </a>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>

              <div className="search-categories-row">{/* Search Bar */}</div>
              {/* Header Actions */}
              <div className="header-actions">
                {/* AI Itinerary Button - Hidden for AHS_Guest */}
                {userId && userId !== "AHS_Guest" && (
                  <button
                    className="ai-itinerary-button"
                    onClick={handleAIItinerary}
                    title="Create my Itinerary using AI"
                  >
               
                    <span className="ai-button-text">AI Itinerary</span>
                  </button>
                )}

{locationView && (
  <div
    className="location-action"
    onClick={handleLocationClick} // Use the new handler
    title={baseLocation?.address_full || "Select location"}
  >
    <span className="location-icon">📍</span>
    <div className="location-text-container">
      <div className="location-city">
        {(() => {
          if (!baseLocation?.address_full) return 'Select location';
          const addressParts = baseLocation.address_full.split(',');
          const city = addressParts[0]?.trim();
          return city.length > 20 ? `${city.slice(0, 20)}...` : city;
        })()}
      </div>
      {baseLocation?.address_full && (
        <div className="location-details">
          {(() => {
            const addressParts = baseLocation.address_full.split(',');
            const details = addressParts.slice(1).join(',').trim();
            return details.length > 25 ? `${details.slice(0, 25)}...` : details;
          })()}
        </div>
      )}
    </div>
  </div>
)}

                {/* Currency Selector */}
                <div className="currency-selector" ref={currencyRef}>
                  <button
                    className="currency-button"
                    onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  >
                    <span style={{ fontSize: "14px" }}>{baseCurrency}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {currencyDropdownOpen && (
                    <div className="currency-dropdown">
                      {currencies.map((currency) => (
                        <div
                          key={currency}
                          className={`currency-option ${baseCurrency === currency ? "active" : ""
                            }`}
                          onClick={() => updateCurrency(currency)}
                        >
                          {currency}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart */}
                {userStatus.userLoggesIn && catIcon && (
                  <div className="cart" onClick={() => handleRedirect("cart")}>
                    <span className="cart-icon">
                      <ShoppingCartIcon fontSize="small" />
                    </span>
                    {cartDataLength > 0 && (
                      <span className="cart-badge">{cartDataLength}</span>
                    )}
                  </div>
                )}

                {/* Notifications */}
                {userStatus.userLoggesIn && (
                  <div
                    className="cart"
                    onClick={() => setOpenNotificationSideBar(true)}
                  >
                    <span className="cart-icon">
                      <NotificationsActiveIcon fontSize="small" />
                    </span>
                    {NotificationLength > 0 && (
                      <span className="cart-badge">{NotificationLength}</span>
                    )}
                  </div>
                )}

                {/* User Menu */}
                <div className="user-menu" ref={userMenuRef}>
                  <button
                    className="user-button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                   {baseUserId?.pro_pic &&
  baseUserId.pro_pic !== "" &&
  baseUserId.pro_pic !== "null" &&
  baseUserId.pro_pic !== "undefined" &&
  baseUserId.pro_pic !== "-" ? (
  // Add console.log here
  <>
    {console.log("User pro_pic value:", baseUserId.pro_pic)}
    <img
      src={baseUserId.pro_pic}
      alt="User"
      style={{
        width: "38px",
        height: "38px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  </>
) : (
  // Also log when no image is available
  <>
    {console.log("User has no valid pro_pic:", baseUserId?.pro_pic)}
    <AccountCircleIcon fontSize="large" />
  </>
)}

                  </button>
                  {userDropdownOpen && (
                    <div className="user-dropdown">
                      {userStatus.userLoggesIn ? (
                        <>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("profile")}
                          >
                            <span className="menu-item-icon">👤</span>
                            <span>
                              {baseUserId.user_username.length > 15
                                ? `${baseUserId.user_username.slice(0, 15)}...`
                                : baseUserId.user_username}
                            </span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("order-history")}
                          >
                            <HistoryOutlined fontSize="small" />
                            <span>Order History</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("my_carts")}
                          >
                            <ShoppingCart fontSize="small" />
                            <span>My Carts</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("offers")}
                          >
                            <Discount fontSize="small" />
                            <span>Offers & Discount</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("search")}
                          >
                            <SearchOutlined fontSize="small" />
                            <span>Search</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("travel_budies")}
                          >
                            <Diversity3 fontSize="small" />
                            <span>Travel Buddies</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("help")}
                          >
                            <HelpOutline fontSize="small" />
                            <span>Help</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleRedirect("chat")}
                          >
                            <Comment fontSize="small" />
                            <span>Chat</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={() => handleShareApp()}
                          >
                            <Share fontSize="small" />
                            <span>Share App with Friends</span>
                          </div>
                          <div
                            className="user-menu-item"
                            onClick={handleLogOut}
                          >
                            <Logout fontSize="small" />
                            <span>Logout</span>
                          </div>
                        </>
                      ) : (
                        <div
                          className="user-menu-item"
                          onClick={() => handleRedirect("login")}
                        >
                          <span className="menu-item-icon">🔑</span>
                          <span>Login / Register</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <button
            className="mobile-menu-close"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <div className="mobile-menu-content">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className="mobile-menu-link"
              onClick={(e) => {
                e.preventDefault();
                handleRedirect(link.href);
                handleCategoryClick(link.href);
                setIsMobileMenuOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      {/* Location Modal */}
      {openLocationModal && (
        <LocationModal
          isOpen={openLocationModal}
          onClose={() => setOpenLocationModal(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}

      {/* Notification Sidebar */}
      {openNotificationSideBar && (
        <div
          className={`notification-sidebar ${openNotificationSideBar ? "open" : ""
            }`}
          ref={notificationSideBarRef}
        >
          <div className="notification-sidebar-content">
            <div className="notification-sidebar-header">
              <h3 className="modal-title">Notifications</h3>
              <button
                className="close-button"
                onClick={() => setOpenNotificationSideBar(false)}
                aria-label="Close notifications"
              >
                ✕
              </button>
            </div>
            <div className="notification-sidebar-body">
              <NotificationMainPage fontSize="large" />
            </div>
          </div>
        </div>
      )}

      {/* AI Itinerary Modal */}
      <AIItineraryModal
        isOpen={showAIPrompt}
        onClose={() => setShowAIPrompt(false)}
        userId={userId}
      />

      <style jsx>{`
        /* Header Base Styles */
        .header {
          position: relative;
          z-index: 100;
          width: 100%;
        }

        /* Top Banner */
        .top-banner {
          background: linear-gradient(45deg, #ec9513ff, #e91515ff);
          color: white;
          padding: 8px 0;
          font-size: 14px;
          text-align: center;
        }

        .banner-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 40px;
          flex-wrap: wrap;
        }

        .banner-item {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 200px;
          justify-content: center;
        }

        .banner-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .banner-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
          text-align: left;
        }

        /* Sticky Header Behavior */
        .top-banner {
          display: block;
          transition: all 0.3s ease;
        }

        .top-banner.sticky {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 101;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          animation: slideDown 0.3s ease-out;
        }

        /* Main Header Sticky */
        .main-header {
          background-color: #000000ff;
          color: white;
          padding: 12px 0 0 0;
          transition: all 0.3s ease;
          position: relative;
          z-index: 90;
        }

        .main-header.sticky {
          position: fixed;
          top: 40px; /* Position below the sticky top banner */
          left: 0;
          right: 0;
          z-index: 100;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Add top margin to body when both sections are sticky */
        .top-banner.sticky ~ .main-header.sticky + * {
          margin-top: 160px; /* Height of both banner + main header */
        }
        
        .main-header.sticky + * {
          margin-top: 120px;
        }

        .banner-text strong {
          font-weight: 600;
        }

        .banner-text small {
          font-size: 12px;
          opacity: 0.9;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .logo {
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 190px;
          height: 60px;
        }

        .logo-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #00d4aa;
          border-radius: 50%;
          animation: logoSpin 1s linear infinite;
        }

        @keyframes logoSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .desktop-search {
          flex: 1;
          max-width: 750px;
          display: flex;
          margin: 0 20px;
          position: relative;
        }

        .search-input {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 25px 0 0 25px;
          outline: none;
          font-size: 14px;
          background: white;
        }

        .search-button {
          background: #00d4aa;
          border: none;
          padding: 10px 16px;
          border-radius: 0 25px 25px 0;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .search-clear-button {
          background: transparent;
          border: none;
          padding: 8px;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
        }

        .search-clear-button:hover {
          color: #333;
          background: rgba(0, 0, 0, 0.05);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* AI Itinerary Button */
        .ai-itinerary-button {
          background: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          color: #333;
          padding: 10px 1px;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          animation: fadeInSlide 0.4s ease-out;
        }

        .ai-itinerary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          background: #f8f9fa;
        }

        .ai-icon {
          font-size: 18px;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .ai-button-text {
          white-space: nowrap;
        }

        .location-action {
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 6px;
          transition: background 0.3s;
          max-width: 300px;
        }

        .location-action:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .location-text-container {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }

        .location-city {
          font-size: 14px;
          color: #ffffff;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }

        .location-details {
          font-size: 11px;
          color: #ccc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }

        .location-text {
          font-size: 16px;
          color: #ccc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .currency-selector {
          position: relative;
        }

        .currency-button {
          background: none;
          border: 1px solid #555;
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          transition: all 0.3s;
        }

        .currency-button:hover {
          border-color: #00d4aa;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.3s;
        }

        .currency-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          min-width: 80px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 100000;
          margin-top: 5px;
        }

        .currency-option {
          padding: 8px 12px;
          color: #333;
          cursor: pointer;
          transition: background 0.2s;
        }

        .currency-option:hover {
          background: #f5f5f5;
        }

        .currency-option.active {
          background: #00d4aa;
          color: white;
        }

        .cart {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 8px 12px;
          border-radius: 4px;
          transition: background 0.3s;
          position: relative;
        }

        .cart:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .cart-badge {
          position: absolute;
          top: 0;
          right: 2px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px;
          border-radius: 4px;
          transition: background 0.3s;
        }

        .user-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          min-width: 200px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          margin-top: 5px;
          overflow: hidden;
        }

        .user-menu-item {
          padding: 12px 16px;
          color: #333;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #f0f0f0;
        }

        .user-menu-item:last-child {
          border-bottom: none;
        }

        .user-menu-item:hover {
          background: #f5f5f5;
        }

        /* Bottom Section */
        .bottom-section {
          background: #f8f9fa;
          padding: 12px 0;
          border-top: 1px solid #e9ecef;
        }

        .search-categories-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .search-section {
          flex: 1;
          max-width: 400px;
          display: flex;
        }

        .category-search-input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 25px 0 0 25px;
          outline: none;
          font-size: 14px;
        }

        .category-search-button {
          background: #007bff;
          border: none;
          padding: 10px 16px;
          border-radius: 0 25px 25px 0;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .categories-section {
          flex: 1;
          display: flex;
          justify-content: center;
          margin-top: 5px;
        }

        .category-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          max-width: 800px;
        }

        .category-link {
          color: #ffffffff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 15px;
          transition: all 0.3s;
          position: relative;
          white-space: nowrap;
          min-width: fit-content;
        }

        .category-link:hover,
        .category-link.active {
          color: #27f0bdff;
          // background: rgba(0, 123, 255, 0.1);
          transform: translateY(-1px);
        }

        /* Mobile Menu */
        .mobile-menu {
          position: fixed;
          top: 0;
          left: -100%;
          width: 280px;
          height: 100vh;
          background: white;
          box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          z-index: 1001;
          overflow-y: auto;
        }

        .mobile-menu.open {
          left: 0;
        }

        .mobile-menu-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
        }

        .mobile-menu-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 5px;
        }

        .mobile-menu-content {
          padding: 20px 0;
        }

        .mobile-menu-link {
          display: block;
          padding: 15px 20px;
          color: #333;
          text-decoration: none;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.2s;
        }

        .mobile-menu-link:hover {
          background: #f5f5f5;
        }

        /* Mobile Bottom Bar */
        .mobile-bottom-bar {
          display: none;
          justify-content: space-around;
          align-items: center;
          background: white;
          padding: 8px 0;
          border-top: 1px solid #e9ecef;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          cursor: pointer;
          color: #666;
          font-size: 12px;
          position: relative;
        }

        .mobile-nav-item:hover {
          color: #007bff;
        }

        .mobile-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4757;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        }

        /* Notification Sidebar */
        .notification-sidebar {
          position: fixed;
          top: 0;
          right: -400px;
          width: 400px;
          height: 100vh;
          background: white;
          box-shadow: -2px 0 15px rgba(0, 0, 0, 0.1);
          transition: right 0.3s ease;
          z-index: 10000;
          overflow: hidden;
        }

        .notification-sidebar.open {
          right: 0;
        }

        .notification-sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .notification-sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
          flex-shrink: 0;
        }

        .notification-sidebar-header .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .notification-sidebar-header .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 5px;
          border-radius: 4px;
          transition: background 0.2s;
        }

        .notification-sidebar-header .close-button:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .notification-sidebar-body {
          flex: 1;
          padding: 0;
          overflow-y: auto;
          max-height: calc(100vh - 80px);
        }

        /* Overlay for notification sidebar */
        .notification-sidebar::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 400px;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          z-index: -1;
        }

        .notification-sidebar.open::before {
          opacity: 1;
          visibility: visible;
        }

        /* Container */
        .container {
          // max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        /* Responsive Styles */
        @media (min-width: 1200px) {
          .category-nav {
            gap: 8px;
            justify-content: space-between;
            width: 100%;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            // scrollbar-width: none;
            // -ms-overflow-style: none;
          }

          // .category-nav::-webkit-scrollbar {
          //   display: none;
          // }

          .category-link {
            font-size: 14px;
            padding: 8px 16px;
          }
        }

        @media (max-width: 1199px) and (min-width: 992px) {
          .category-nav {
            gap: 12px;
          }

          .category-link {
            font-size: 14px;
            padding: 6px 12px;
          }
        }

        /* Specific styles for 1024x1366 tablets and similar devices */
        @media (min-width: 1020px) and (max-width: 1080px) and (min-height: 1360px),
               (min-width: 1024px) and (max-width: 1024px) {
          .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: nowrap;
          }

          .logo {
            flex-shrink: 0;
          }

          .logo img {
            width: 140px !important;
            height: auto;
          }

          .logo-loading {
            width: 140px;
            height: 50px;
          }

          .logo-spinner {
            width: 30px;
            height: 30px;
            border-width: 2px;
          }

          .desktop-search {
            flex: 1;
            max-width: 350px;
            margin: 0 10px;
            display: flex;
          }

          .search-input {
            font-size: 13px;
            padding: 8px 14px;
          }

          .search-button {
            padding: 8px 14px;
          }

          .categories-section {
            display: flex;
            justify-content: center;
            margin-top: 8px;
            width: 100%;
          }

          .category-nav {
            display: flex;
            gap: 12px;
            align-items: center;
            justify-content: center;
            flex-wrap: nowrap;
          }

          .category-link {
            font-size: 12px;
            padding: 6px 10px;
            border-radius: 6px;
            transition: all 0.3s;
            white-space: nowrap;
          }

          .header-actions {
            display: flex !important;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
            visibility: visible !important;
          }

          .location-action {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 6px 8px;
            max-width: 160px;
          }

          .location-text {
            font-size: 13px;
          }

          .currency-selector {
            display: block !important;
            visibility: visible !important;
          }

          .currency-button {
            padding: 6px 10px;
            font-size: 12px;
            display: flex;
            align-items: center;
          }

          .cart {
            padding: 6px;
            border-radius: 6px;
            transition: background 0.3s;
            display: flex !important;
            visibility: visible !important;
          }

          .cart:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .cart-icon {
            font-size: 18px;
          }

          .user-menu {
            display: block !important;
            visibility: visible !important;
          }

          .user-button {
            padding: 4px;
            display: flex;
            align-items: center;
          }

          .user-icon {
            font-size: 22px;
          }

          /* Ensure all header action elements are visible */
          .header-actions > * {
            display: flex !important;
            visibility: visible !important;
          }

          /* AI Button responsive for 1024px tablets */
          .ai-itinerary-button {
            padding: 6px 10px;
            font-size: 11px;
            border-radius: 15px;
          }

          .ai-icon {
            font-size: 14px;
          }

          .ai-button-text {
            display: inline;
          }
        }

        @media (max-width: 991px) and (min-width: 769px) {
          .search-categories-row {
            flex-direction: column;
            gap: 12px;
          }

          .category-nav {
            gap: 10px;
          }

          .category-link {
            font-size: 13px;
            padding: 5px 10px;
          }
        }

        /* Comprehensive Tablet Styles - 768px to 1024px */
        @media (max-width: 1024px) and (min-width: 768px) {
          .container {
            padding: 0 16px;
          }

          .main-header {
            padding: 12px 0;
          }

          .header-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          /* Top row: Logo and Header Actions */
          .header-content > .logo,
          .header-content > .header-actions {
            order: 1;
          }

          .header-content {
            position: relative;
          }

          .logo {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 10;
          }

          .logo img {
            width: 160px !important;
            height: auto;
          }

          .logo-loading {
            width: 160px;
            height: 55px;
          }

          .logo-spinner {
            width: 35px;
            height: 35px;
            border-width: 3px;
          }

          .header-actions {
            position: absolute;
            right: 0;
            top: 0;
            display: flex !important;
            align-items: center;
            gap: 12px;
            visibility: visible !important;
          }

          /* Middle row: Search bar */
          .header-content > div:nth-child(2) {
            order: 2;
            margin-top: 50px;
            width: 100%;
          }

          .desktop-search {
            max-width: 100%;
            margin: 0 auto;
            width: 80%;
            display: flex;
          }

          .search-input {
            font-size: 14px;
            padding: 10px 16px;
            flex: 1;
          }

          .search-button {
            padding: 10px 16px;
          }

          /* Bottom row: Categories */
          .categories-section {
            margin-top: 8px;
            width: 100%;
            display: flex;
            justify-content: center;
          }

          .category-nav {
            display: flex;
            gap: 15px;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
          }

          .category-link {
            font-size: 13px;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.3s;
            white-space: nowrap;
            flex-shrink: 0;
          }

          /* Header Actions Styling for Tablets */
          .location-action {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 8px 10px;
            max-width: 220px;
            border-radius: 6px;
            transition: background 0.3s;
          }

          .location-action:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .location-text-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.1;
          }

          .location-city {
            font-size: 12px;
            color: #ffffff;
            font-weight: 600;
            max-width: 160px;
          }

          .location-details {
            font-size: 10px;
            color: #ccc;
            max-width: 160px;
          }

          .location-text {
            font-size: 12px;
          }

          .location-icon {
            font-size: 16px;
          }

          .currency-selector {
            display: block !important;
            visibility: visible !important;
          }

          .currency-button {
            padding: 8px 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
            border-radius: 6px;
            transition: background 0.3s;
          }

          .currency-button:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .cart {
            padding: 8px;
            border-radius: 6px;
            transition: background 0.3s;
            display: flex !important;
            visibility: visible !important;
            position: relative;
          }

          .cart:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .cart-icon {
            font-size: 20px;
          }

          .cart-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
          }

          .user-menu {
            display: block !important;
            visibility: visible !important;
          }

          .user-button {
            padding: 6px;
            display: flex;
            align-items: center;
            border-radius: 6px;
            transition: background 0.3s;
          }

          .user-button:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .user-icon {
            font-size: 24px;
          }

          /* Ensure all header action elements are visible */
          .header-actions > * {
            display: flex !important;
            visibility: visible !important;
          }

          /* AI Button responsive for tablets */
          .ai-itinerary-button {
            padding: 8px 14px;
            font-size: 13px;
            border-radius: 18px;
          }

          .ai-icon {
            font-size: 16px;
          }

          .ai-button-text {
            display: inline;
          }

          /* Dropdown positioning for tablets */
          .currency-dropdown {
            top: 100%;
            right: 0;
            margin-top: 8px;
            min-width: 100px;
          }

          .user-dropdown {
            top: 100%;
            right: 0;
            margin-top: 8px;
            min-width: 200px;
          }
        }

        @media (max-width: 768px) {
          .top-banner {
            padding: 8px 0;
            font-size: 12px;
          }

          .banner-content {
            gap: 8px;
            justify-content: space-around;
            flex-wrap: nowrap;
          }

          .banner-item {
            flex-direction: column;
            text-align: center;
            gap: 3px;
            min-width: auto;
            flex: 1;
            max-width: none;
          }

          .banner-icon {
            font-size: 16px;
          }

          .banner-text {
            text-align: center;
          }

          .banner-text strong {
            font-size: 11px;
            font-weight: 600;
          }

          .banner-text small {
            font-size: 9px;
            opacity: 0.9;
          }

          .main-header {
            padding: 10px 0;
          }

          .header-content {
            display: flex;
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
            position: relative;
          }

          /* Mobile: Logo centered at top */
          .logo {
            order: 1;
            text-align: center;
            width: 100%;
            display: flex;
            justify-content: center;
            margin-bottom: 8px;
          }

          .logo img {
            width: 140px !important;
            height: auto;
          }

          .logo-loading {
            width: 140px;
            height: 50px;
          }

          .logo-spinner {
            width: 30px;
            height: 30px;
            border-width: 2px;
          }

          /* Mobile: Search bar full width */
          .header-content > div:nth-child(2) {
            order: 2;
            width: 100%;
          }

          .desktop-search {
            max-width: 100%;
            margin: 0;
            width: 100%;
            display: flex;
          }

          .search-input {
            font-size: 14px;
            padding: 10px 14px;
            flex: 1;
            border-radius: 25px 0 0 25px;
          }

          .search-button {
            padding: 10px 14px;
            border-radius: 0 25px 25px 0;
          }

          /* Mobile: Header actions row */
          .header-actions {
            order: 3;
            display: flex !important;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
            width: 100%;
            gap: 8px;
            margin-top: 8px;
            visibility: visible !important;
          }

          .location-action {
            display: flex !important;
            align-items: center;
            padding: 8px 10px;
            max-width: 170px;
            flex-shrink: 1;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            visibility: visible !important;
          }

          .location-text-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.1;
          }

          .location-city {
            font-size: 10px;
            color: #ffffff;
            font-weight: 600;
            max-width: 130px;
          }

          .location-details {
            font-size: 9px;
            color: #ccc;
            max-width: 130px;
          }

          .location-text {
            font-size: 11px;
            line-height: 1.2;
          }

          .location-icon {
            font-size: 14px;
            margin-right: 4px;
          }

          .currency-selector {
            display: flex !important;
            visibility: visible !important;
          }

          .currency-button {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .cart {
            display: flex !important;
            padding: 8px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            position: relative;
            visibility: visible !important;
          }

          .cart-icon {
            font-size: 18px;
          }

          .cart-badge {
            position: absolute;
            top: -2px;
            right: -2px;
            background: #ff4757;
            color: white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
          }

          .user-menu {
            display: flex !important;
            visibility: visible !important;
          }

          .user-button {
            padding: 6px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
          }

          .user-icon {
            font-size: 20px;
          }

          /* Mobile: Categories section */
          .categories-section {
            order: 4;
            margin-top: 8px;
            width: 100%;
          }

          .category-nav {
            display: flex;
            gap: 8px;
            justify-content: space-between;
            width: 100%;
            flex-wrap: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 4px 0;
          }

          .category-nav::-webkit-scrollbar {
            display: none;
          }

          .category-link {
            font-size: 12px;
            padding: 6px 12px;
            border-radius: 12px;
            flex-shrink: 0;
            white-space: nowrap;
            min-width: fit-content;
          }

          /* Ensure all elements are visible on mobile */
          .header-actions > * {
            display: flex !important;
            visibility: visible !important;
          }

          /* AI Button responsive for mobile */
          .ai-itinerary-button {
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 16px;
            gap: 6px;
          }

          .ai-icon {
            font-size: 16px;
          }

          .ai-button-text {
            display: inline;
          }

          /* AI Modal responsive */
          .ai-prompt-modal {
            width: 95%;
            max-height: 85vh;
          }

          .ai-prompt-title {
            font-size: 18px;
          }

          .ai-prompt-content {
            padding: 20px;
          }

          .ai-text-input {
            font-size: 14px;
            padding: 14px;
          }

          /* Mobile dropdown positioning */
          .currency-dropdown {
            position: fixed;
            top: auto;
            bottom: 60px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            max-height: 200px;
            overflow-y: auto;
          }

          .user-dropdown {
            position: fixed;
            top: auto;
            bottom: 60px;
            right: 10px;
            width: 250px;
            max-height: 300px;
            overflow-y: auto;
          }

          /* Mobile notification sidebar */
          .notification-sidebar {
            width: 100%;
            right: -100%;
          }

          .notification-sidebar.open {
            right: 0;
          }

          .notification-sidebar::before {
            right: 100%;
          }

          .mobile-bottom-bar {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .container {
            padding: 0 10px;
          }

          .top-banner {
            padding: 6px 0;
            font-size: 11px;
          }

          .banner-content {
            gap: 4px;
            flex-direction: row;
            justify-content: space-around;
            flex-wrap: nowrap;
          }

          .banner-item {
            min-width: auto;
            max-width: none;
            gap: 2px;
            flex: 1;
          }

          .banner-icon {
            font-size: 14px;
          }

          .banner-text strong {
            font-size: 10px;
            font-weight: 600;
          }

          .banner-text small {
            font-size: 8px;
            opacity: 0.95;
          }

          .main-header {
            padding: 8px 0;
          }

          .header-content {
            gap: 8px;
          }

          .logo {
            margin-bottom: 6px;
          }

          .logo img {
            width: 120px !important;
          }

          .logo-loading {
            width: 120px;
            height: 40px;
          }

          .logo-spinner {
            width: 25px;
            height: 25px;
            border-width: 2px;
          }

          .desktop-search {
            width: 100%;
          }

          .search-input {
            font-size: 13px;
            padding: 8px 12px;
          }

          .search-button {
            padding: 8px 12px;
          }

          .header-actions {
            gap: 4px;
            padding: 0;
            justify-content: space-around;
          }

          .location-action {
            padding: 6px 8px;
            max-width: 130px;
            font-size: 10px;
          }

          .location-text-container {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 1.0;
          }

          .location-city {
            font-size: 9px;
            color: #ffffff;
            font-weight: 600;
            max-width: 110px;
          }

          .location-details {
            font-size: 8px;
            color: #ccc;
            max-width: 110px;
          }

          .location-text {
            font-size: 10px;
            line-height: 1.1;
          }

          .location-icon {
            font-size: 12px;
          }

          .currency-button {
            padding: 6px 8px;
            font-size: 11px;
          }

          .cart {
            padding: 6px;
          }

          .cart-icon {
            font-size: 16px;
          }

          .cart-badge {
            width: 14px;
            height: 14px;
            font-size: 8px;
          }

          .user-button {
            padding: 6px;
          }

          .user-icon {
            font-size: 18px;
          }

          .category-nav {
            gap: 4px;
            flex-wrap: nowrap;
            padding: 2px 0;
            justify-content: flex-start;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .category-nav::-webkit-scrollbar {
            display: none;
          }

          .category-link {
            font-size: 11px;
            padding: 5px 8px;
            flex-shrink: 0;
            white-space: nowrap;
          }

          /* Smaller dropdowns for small screens */
          .currency-dropdown {
            width: 150px;
          }

          .user-dropdown {
            width: 200px;
            right: 5px;
          }

          /* Mobile notification sidebar for small screens */
          .notification-sidebar {
            width: 100%;
          }

          .notification-sidebar-header .modal-title {
            font-size: 16px;
          }

          .notification-sidebar-header .close-button {
            font-size: 20px;
          }

          /* AI Button for very small screens */
          .ai-itinerary-button {
            padding: 6px 10px;
            font-size: 11px;
            gap: 4px;
          }

          .ai-icon {
            font-size: 14px;
          }

          .ai-button-text {
            display: none; /* Hide text on very small screens */
          }

          /* AI Modal for very small screens */
          .ai-prompt-modal {
            width: 98%;
            max-height: 80vh;
          }

          .ai-prompt-title {
            font-size: 16px;
          }

          .ai-prompt-content {
            padding: 16px;
          }

          .ai-prompt-description {
            font-size: 14px;
          }

          .ai-voice-button {
            padding: 12px 20px;
            font-size: 14px;
          }

          .ai-text-input {
            font-size: 13px;
            padding: 12px;
          }
        }

        /* Mobile: Main header behavior */
        @media (max-width: 1024px) {
          .main-header.sticky {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
          }

          .top-banner.sticky ~ .main-header.sticky + * {
            margin-top: 160px;
          }
          
          .main-header.sticky + * {
            margin-top: 120px;
          }
        }

        @media (max-width: 768px) {
          .top-banner.sticky ~ .main-header.sticky + * {
            margin-top: 180px;
          }
          
          .main-header.sticky + * {
            margin-top: 140px;
          }
        }

        @media (max-width: 480px) {
          .top-banner.sticky ~ .main-header.sticky + * {
            margin-top: 170px;
          }
          
          .main-header.sticky + * {
            margin-top: 130px;
          }
        }
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }

          /* Add padding to body when header is sticky on mobile */
          .header.scrolled ~ * {
            padding-top: 160px;
          }
            /* Mobile dropdown positioning - FIXED */
@media (max-width: 768px) {
  .currency-dropdown {
    position: fixed !important;
    bottom: 70px !important; /* Increased from 60px to position it higher */
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 200px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100002 !important; /* Increased z-index */
    margin-top: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  /* Also update user dropdown for consistency */
  .user-dropdown {
    position: fixed !important;
    top: auto !important;
    bottom: 70px !important;
    right: 10px !important;
    width: 250px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 100002 !important;
    margin-top: 0;
  }
}

/* For very small screens */
@media (max-width: 480px) {
  .currency-dropdown {
    top:29%;
    width: 180px;
    max-height: 180px;
  }

  .user-dropdown {
    top:30%;
    width: 220px;
    max-height: 280px;
  }
}
        

          .category-link {
    display: flex;
    flex-direction: row; /* Change from column to row */
    align-items: center;
    gap: 8px; /* Space between icon and text */
    color: #ffffffff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 8px 12px;
    border-radius: 15px;
    transition: all 0.3s;
    position: relative;
    white-space: nowrap;
    min-width: fit-content;
  }

  .category-icon {
    width: 20px; /* Slightly smaller for inline display */
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    padding: 3px; /* Reduced padding */
    flex-shrink: 0; /* Prevent icon from shrinking */
  }

  .category-icon-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0) invert(1); /* Makes white icons */
  }

  .category-icon-fallback {
    font-size: 10px; /* Smaller fallback text */
    font-weight: bold;
    color: white;
  }

  .category-label {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .category-link:hover,
  .category-link.active {
    color: #27f0bdff;
    background: rgba(39, 240, 189, 0.1);
    transform: translateY(-1px);
  }

  .category-link:hover .category-icon,
  .category-link.active .category-icon {
    background: rgba(39, 240, 189, 0.2);
  }

  .category-link:hover .category-icon-img,
  .category-link.active .category-icon-img {
    filter: brightness(0) saturate(100%) invert(67%) sepia(61%) saturate(487%) hue-rotate(123deg) brightness(95%) contrast(94%);
  }

  /* Responsive adjustments for side-by-side layout */
  @media (max-width: 768px) {
    .category-link {
      padding: 6px 10px;
      gap: 6px;
    }

    .category-icon {
      width: 18px;
      height: 18px;
    }

    .category-label {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    .category-link {
      padding: 4px 8px;
      gap: 4px;
    }

    .category-icon {
      width: 16px;
      height: 16px;
    }

    .category-label {
      font-size: 11px;
    }
  }

  /* For very small screens, you might want to hide labels and show only icons */
  @media (max-width: 360px) {
    .category-link {
      flex-direction: column;
      gap: 2px;
      padding: 4px 6px;
    }

    .category-label {
      font-size: 9px;
    }

    .category-icon {
      width: 14px;
      height: 14px;
    }
  }
      `}</style>
    </React.Fragment>
  );
};

export default EnhancedShoesHeader;
