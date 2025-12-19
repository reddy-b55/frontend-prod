import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React, { useState, useEffect, useContext, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { AppContext } from "../../pages/_app";
import { getCartDataLength, getNotificationLength } from "../../AxiosCalls/UserServices/userServices";
import getImageUrl from "../../AxiosCalls/getImageUrl";
import NotificationMainPage from "../Notification/Notification";

// Import CSS Module
import styles from "./Header.module.css";

// Material Icons
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
} from "@mui/icons-material";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

const HeaderOne = ({ 
  locationView = true, 
  topClass = "top-header", 
  logoName = "logo.png",
  onLocationClick // New prop for handling location click
}) => {
  const router = useRouter();
  const {
    baseCurrency,
    triggers,
    setTriggers,
    baseLocation,
    userStatus,
    userId,
    baseUserId,
  } = useContext(AppContext);

  // Refs for dropdowns
  const currencyRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationSideBarRef = useRef(null);

  // State
  const [cartDataLength, setCartDataLength] = useState(0);
  const [NotificationLength, setNotificationLength] = useState(0);
  const [activeLink, setActiveLink] = useState("");
  const [openSideBar, setOpenSideBar] = useState(false);
  const [openNotificationSideBar, setOpenNotificationSideBar] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigation links data
  const navLinks = [
    {
      id: "lifestyle",
      label: "Lifestyle",
      icon: "/assets/images/Icons/lifestyle.png",
      href: "/shop/lifestyle",
    },
    {
      id: "hotels",
      label: "Hotels",
      icon: "/assets/images/Icons/hotel.png",
      href: "/shop/hotels",
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
    },
    {
      id: "essential",
      label: "Essential",
      icon: "/assets/images/Icons/ess.png",
      href: "/shop/essential",
    },
    {
      id: "nonessential",
      label: "Non-Essential",
      icon: "/assets/images/Icons/noness.png",
      href: "/shop/nonessential",
    },
  ];

  const currencies = ["USD", "LKR", "SGD", "INR", "AED"];

  // Update currency
  const updateCurrency = (value) => {
    localStorage.setItem("baseCurrency", value);
    setTriggers({
      ...triggers,
      baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
    });
    setCurrencyDropdownOpen(false);
  };

  // Get cart data length
  const getCartLength = async () => {
    const response = await getCartDataLength(userId);
    setCartDataLength(response);
  };

  //get Notifications length
  const getNotificationsLength = async () => {
    const response = await getNotificationLength(userId);
    console.log('response.notification', response);
    setNotificationLength(response.count);
  }

  // Handle logout
  const handleLogOut = async () => {
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
    localStorage.removeItem("aahaas_selected_location");
    localStorage.removeItem("profileModalLastClosed");
  };

  // Handle redirects
  const handleRedirect = (value) => {
    const routes = {
      home: "/",
      help: "/page/helpcenter",
      login: "/page/account/login-auth",
      profile: { pathname: "/page/account/profile", query: { page: "myProfile-page" } },
      cart: "/page/account/cart-page",
      search: "/page/search",
      "order-history": "/page/account/order-history",
      offers: "/page/offers",
      chat: "/page/account/chats",
      my_carts: { pathname: "/page/account/profile", query: { page: "my-carts" } },
      travel_budies: { pathname: "/page/account/profile", query: { page: "travel-buddies" } },
    };

    if (routes[value]) {
      router.push(routes[value]);
    }
    setUserDropdownOpen(false);
    setOpenSideBar(false);
  };

  // Handle scroll effect
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setIsScrolled(scrollTop > 50);
  };

  // Click outside handler
  const handleClickOutside = (event) => {
    if (currencyRef.current && !currencyRef.current.contains(event.target)) {
      setCurrencyDropdownOpen(false);
    }
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setUserDropdownOpen(false);
    }
    if (notificationSideBarRef.current && !notificationSideBarRef.current.contains(event.target)) {
      setOpenNotificationSideBar(false);
    }
  };

  // Handle location click
  const handleLocationClick = () => {
    if (onLocationClick) {
      onLocationClick();
    }
  };

  // Effects
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

  const getActiveNavId = (urlPath) => {
    const routeMapping = {
      'lifestyle': 'lifestyle',
      'hotels': 'hotels',
      'newFlights': 'flights',
      'education': 'education',
      'essential': 'essential',
      'nonessential': 'nonessential',
    };
    
    return routeMapping[urlPath] || urlPath;
  };

  useEffect(() => {
    const url = window.location.href;
    if (url.includes("shop") || url.includes("product-details/")) {
      let link = url.toString().split("/")[4];
      const cleanLink = link.split("?")[0];
      const activeNavId = getActiveNavId(cleanLink);
      setActiveLink(activeNavId);
    }
  }, [router.asPath]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle body scroll when notification sidebar is open
  useEffect(() => {
    if (openNotificationSideBar) {
      // Store current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Disable body scroll with multiple methods for better compatibility
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-position', scrollTop);
    } else {
      // Get stored scroll position
      const scrollTop = document.body.getAttribute('data-scroll-position') || 0;
      
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo(0, parseInt(scrollTop));
      
      // Clean up data attribute
      document.body.removeAttribute('data-scroll-position');
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-scroll-position');
    };
  }, [openNotificationSideBar]);

  // Handle body scroll when mobile sidebar is open
  useEffect(() => {
    if (openSideBar) {
      // Store current scroll position
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Disable body scroll with multiple methods
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollTop}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-position-sidebar', scrollTop);
    } else {
      // Get stored scroll position
      const scrollTop = document.body.getAttribute('data-scroll-position-sidebar') || 0;
      
      // Re-enable body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo(0, parseInt(scrollTop));
      
      // Clean up data attribute
      document.body.removeAttribute('data-scroll-position-sidebar');
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      document.body.removeAttribute('data-scroll-position-sidebar');
    };
  }, [openSideBar]);

  // Render navigation links
  const renderNavLinks = () => {
    return navLinks.map((link) => (
      <Link
        key={link.id}
        href={link.href}
        className={`${styles.navLink} ${activeLink === link.id ? styles.active : ''}`}
      >
        <Image
          src={link.icon}
          alt={`${link.label} icon`}
          width={24}
          height={24}
          className={styles.navIcon}
        />
        <span style={{fontSize:'13px'}}>{link.label}</span>
      </Link>
    ));
  };

  // Render mobile navigation links
  const renderMobileNavLinks = () => {
    return navLinks.map((link) => (
      <Link
        key={link.id}
        href={link.href}
        className={`${styles.mobileNavLink} ${activeLink === link.id ? styles.active : ''}`}
      >
        <Image
          src={link.icon}
          alt={`${link.label} icon`}
          width={18}
          height={18}
          className={styles.mobileNavIcon}
        />
        <span>{link.label}</span>
      </Link>
    ));
  };

  // Render user dropdown
  const renderUserDropdown = () => {
    if (userStatus.userLoggesIn) {
      return (
        <>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("profile")}
          >
            <AccountCircleOutlined fontSize="small" />
            <span>{baseUserId.user_username.length > 15 
              ? `${baseUserId.user_username.slice(0, 15)}...` 
              : baseUserId.user_username}
            </span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("order-history")}
          >
            <HistoryOutlined fontSize="small" />
            <span>Order History</span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("my_carts")}
          >
            <ShoppingCart fontSize="small" />
            <span>My Carts</span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("offers")}
          >
            <Discount fontSize="small" />
            <span>Offers & Discount</span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("travel_budies")}
          >
            <Diversity3 fontSize="small" />
            <span>My Travel Buddies</span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("help")}
          >
            <HelpOutline fontSize="small" />
            <span>Help</span>
          </div>
          <div 
            className={styles.userMenuItem}
            onClick={() => handleRedirect("chat")}
          >
            <Comment fontSize="small" />
            <span>Chat</span>
          </div>
          <div 
            className={`${styles.userMenuItem} ${styles.logout}`}
            onClick={handleLogOut}
          >
            <Logout fontSize="small" />
            <span>Sign out</span>
          </div>
        </>
      );
    } else {
      return (
        <div 
          className={styles.userMenuItem}
          onClick={() => handleRedirect("login")}
        >
          <Login fontSize="small" />
          <span>Login / Register</span>
        </div>
      );
    }
  };

  return (
    <div className={`${styles.header} ${isScrolled ? styles.scrolled : ''} ${topClass}`}>
      {/* Desktop View */}
      <div className={styles.desktopContainer}>
        {/* Logo Section */}
        <div className={styles.logoSection} onClick={() => handleRedirect("home")}>
          <img
            src={`/assets/images/icon/${logoName}`}
            alt="logo"
            className={styles.logo}
          />
        </div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          {renderNavLinks()}
        </nav>

        {/* Actions Section */}
        <div className={styles.actionsSection}>
          {/* Location */}
          {locationView && (
            <div 
              className={`${styles.actionItem} ${styles.locationAction}`}
              onClick={handleLocationClick}
              title={baseLocation.address_full}
            >
              <MyLocation fontSize="small" />
              <span className={`${styles.locationText} ${styles.ellipsis}`}>
                {baseLocation.address_full.length > 20
                  ? `${baseLocation.address_full.slice(0, 20)}...`
                  : baseLocation.address_full}
              </span>
            </div>
          )}

          {/* Currency Selector */}
          <div className={styles.currencySelector} ref={currencyRef}>
            <button 
              className={styles.currencyButton}
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            >
              <CurrencyExchange fontSize="small" />
              <span>{baseCurrency}</span>
              <KeyboardArrowDown fontSize="small" />
            </button>
            <div className={`${styles.currencyDropdown} ${currencyDropdownOpen ? styles.open : ''}`}>
              {currencies.map((currency) => (
                <div
                  key={currency}
                  className={`${styles.currencyOption} ${baseCurrency === currency ? styles.active : ''}`}
                  onClick={() => updateCurrency(currency)}
                >
                  {currency}
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          {userStatus.userLoggesIn && (
            <button 
              className={styles.cartButton}
              onClick={() => handleRedirect("cart")}
              aria-label="Shopping cart"
            >
              <ShoppingCartOutlined fontSize="small" />
              {cartDataLength > 0 && (
                <span className={styles.cartBadge}>{cartDataLength}</span>
              )}
            </button>
          )}

           {userStatus.userLoggesIn && (
            <button 
              className={styles.cartButton}
              onClick={() => setOpenNotificationSideBar(true)}
              aria-label="Shopping cart"
            >
              <NotificationsNoneOutlinedIcon fontSize="small" />
              {NotificationLength > 0 && (
                <span className={styles.cartBadge}>{NotificationLength}</span>
              )}
            </button>
          )}

          {/* Search */}
          <button 
            className={styles.actionItem2}
            onClick={() => handleRedirect("search")}
            aria-label="Search"
          >
            <SearchOutlined fontSize="small" />
          </button>

          {/* User Menu */}
          <div className={styles.userMenu} ref={userMenuRef}>
            <button 
              className={styles.userButton}
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              onMouseOver={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-label="User menu"
            >
              <AccountCircle fontSize="small" />
              <Menu fontSize="small" />
            </button>
            <div className={`${styles.userDropdown} ${userDropdownOpen ? styles.open : ''}`}>
              {renderUserDropdown()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className={styles.mobileContainer}>
        <div className={styles.mobileHeader}>
          <button 
            className={styles.actionItem3}
            onClick={() => setOpenSideBar(true)}
            aria-label="Open menu"
          >
            <Menu fontSize="medium" />
          </button>
          
          <img
            src={`/assets/images/icon/${logoName}`}
            onClick={() => handleRedirect("home")}
            alt="logo"
            className={styles.logo}
            style={{ height: "36px" }}
          />

          <div className={styles.mobileActions}>
            {userStatus.userLoggesIn && (
              <button 
                className={styles.cartButton}
                onClick={() => handleRedirect("cart")}
                aria-label="Shopping cart"
              >
                <ShoppingCartOutlined fontSize="small" />
                {cartDataLength > 0 && (
                  <span className={styles.cartBadge}>{cartDataLength}</span>
                )}
              </button>
            )}


            
           {userStatus.userLoggesIn && (
            <button 
              className={styles.cartButton}
              onClick={() => setOpenNotificationSideBar(true)}
              aria-label="Shopping cart"
            >
              <NotificationsNoneOutlinedIcon fontSize="small" />
              {NotificationLength > 0 && (
                <span className={styles.cartBadge}>{NotificationLength}</span>
              )}
            </button>
          )}

            <button 
              className={styles.actionItem2}
              onClick={() => handleRedirect("search")}
              aria-label="Search"
            >
              <SearchOutlined fontSize="small" />
            </button>

            <div className={styles.currencySelector} ref={currencyRef}>
              <button 
                className={styles.currencyButton}
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8125rem" }}
              >
                {baseCurrency}
              </button>
              <div className={`${styles.currencyDropdown} ${currencyDropdownOpen ? styles.open : ''}`}>
                {currencies.map((currency) => (
                  <div
                    key={currency}
                    className={`${styles.currencyOption} ${baseCurrency === currency ? styles.active : ''}`}
                    onClick={() => updateCurrency(currency)}
                  >
                    {currency}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Location */}
        <div 
          className={styles.mobileLocation}
          onClick={handleLocationClick}
        >
          <ShareLocationOutlined fontSize="small" />
          <span className={styles.ellipsis}>
            {baseLocation.address_full}
          </span>
        </div>

        {/* Mobile Navigation */}
        <div className={styles.mobileNavigation}>
          {renderMobileNavLinks()}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`${styles.sidebar} ${openSideBar ? styles.open : ''}`}>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.modalTitle}>Menu</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setOpenSideBar(false)}
              aria-label="Close menu"
            >
              <Close />
            </button>
          </div>

          <div className={styles.sidebarProfile}>
            <LazyLoadImage
              src={
                userStatus.userLoggesIn && baseUserId.pro_pic
                  ? getImageUrl(baseUserId.pro_pic)
                  : "/assets/images/NavbarImages/defaultImage.png"
              }
              className={styles.profileImage}
              alt="Profile"
            />
            <h4 className={styles.profileName}>
              {userStatus.userLoggesIn ? baseUserId.user_username : "Guest"}
            </h4>
            <p className={styles.profileEmail}>
              {userStatus.userLoggesIn 
                ? baseUserId.user_email 
                : "Please login to display your email"}
            </p>
          </div>

          <nav className={styles.sidebarMenu}>
            <div 
              className={styles.sidebarMenuItem}
              onClick={() => handleRedirect("home")}
            >
              Home
            </div>
            
            {userStatus.userLoggesIn ? (
              <>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("profile")}
                >
                  Profile
                </div>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("my_carts")}
                >
                  My Carts
                </div>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("travel_budies")}
                >
                  Travel Buddies
                </div>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("help")}
                >
                  Help
                </div>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={handleLogOut}
                >
                  Logout
                </div>
              </>
            ) : (
              <>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("help")}
                >
                  Help
                </div>
                <div 
                  className={styles.sidebarMenuItem}
                  onClick={() => handleRedirect("login")}
                >
                  Login
                </div>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Notification Sidebar */}
      <div 
        className={`${styles.notificationSidebar} ${openNotificationSideBar ? styles.open : ''}`}
        ref={notificationSideBarRef} 
      >
        <div className={styles.notificationSidebarContent}>
          <div className={styles.notificationSidebarHeader}>
            <h3 className={styles.modalTitle}>Notifications</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setOpenNotificationSideBar(false)}
              aria-label="Close notifications"
            >
              <Close />
            </button>
          </div>
          <div className={styles.notificationSidebarBody} style={{ zIndex: 100 }}>
            <NotificationMainPage />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderOne;