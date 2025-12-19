import Link from "next/link";
import Image from "next/image";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { LoadScript } from "@react-google-maps/api";
import React, { useState, useEffect, useContext } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import GooglePlacesAutocomplete, {
  geocodeByPlaceId,
  getLatLng,
} from "react-google-places-autocomplete";

import { AppContext } from "../../pages/_app";
import ModalBase from "../common/Modals/ModalBase";
import { getCartDataLength } from "../../AxiosCalls/UserServices/userServices";

import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import DiscountIcon from "@mui/icons-material/Discount";
import CommentIcon from "@mui/icons-material/Comment";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import ShareLocationOutlinedIcon from "@mui/icons-material/ShareLocationOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";
import getImageUrl from "../../AxiosCalls/getImageUrl";
import { Menu } from "@mui/material";
import axios from "axios";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ToastMessage from "../Notification/ToastMessage";

const HeaderOne = ({ locationView = true }) => {
  const router = useRouter();

  const {
    baseCurrency,
    triggers,
    setTriggers,
    baseLocation,
    setBaseLocation,
    userStatus,
    userId,
    baseUserId,
    groupApiCode,
  } = useContext(AppContext);

  const [cartDataLength, setCartDataLength] = useState(0);
  const [activeLink, setActiveLink] = useState();

  const [openModalLocation, setOpenModalLocation] = useState(false);
  const [openSideBarStatus, setOpenSideBarStatus] = useState(false);
  const [baseCurrencyOpen, setBaseCurrencyOpen] = useState(false);
  const [googleLocation, setGoogleLocation] = useState("search");

  // const handleOnGoogleLocationChange = (value) => {

  //   geocodeByPlaceId(value["value"]["place_id"]).then((res) =>
  //     getLatLng(res[0]).then((value) => {
  //       const dataset = {
  //         address_full: res[0].formatted_address,
  //         latitude: value.lat,
  //         longtitude: value.lng,
  //         address_components: res[0].address_components,
  //       };
  //       // console.log("value palces ", res[0].address_components)
  //       // console.log("value palces ", dataset)
  //       const formated = JSON.stringify(dataset);
  //       localStorage.setItem("userLastLocation", formated);
  //       Cookies.set("userLastLocation", formated, { path: '/' });
  //       setBaseLocation(dataset);
  //       setOpenModalLocation(!openModalLocation);
  //     //  window.location.reload('/')
  //       window.location.href = '/';
  // //       const currentUrl = window.location.href;
  // // console.log("Current browser URL:", currentUrl);

  // // const chatUrl = `/`;
  // //         window.open(chatUrl, "_blank");

  //     })
  //   );
  // };

  // const handleOnGoogleLocationChange = (value) => {
  //   geocodeByPlaceId(value['value']['place_id'])
  //     .then((res) =>
  //       getLatLng(res[0])
  //         .then((latLng) => {
  //           const dataset = transformLocationData(res[0], latLng);
  //           const formated = JSON.stringify(dataset);
  //           localStorage.setItem('userLastLocation', formated);
  //           setBaseLocation(dataset);
  //           setOpenModalLocation(!openModalLocation);
  //           window.location.reload();
  //         })
  //     )
  //     .catch((error) => {
  //       console.error('Location selection error:', error);
  //     });
  // };
  // function transformLocationData(placeData, latLng) {
  //   try {
  //     // Validate input
  //     if (!placeData || !latLng) {
  //       throw new Error('Invalid input: Expected place data and latitude/longitude');
  //     }

  //     // Extract detailed address components
  //     const extractAddressComponents = (components) => {
  //       const addressDetails = {
  //         streetNumber: '',
  //         route: '',
  //         sublocality: '',
  //         locality: '',
  //         adminArea2: '',
  //         adminArea1: '',
  //         country: '',
  //         postalCode: ''
  //       };

  //       components.forEach(component => {
  //         const types = component.types;

  //         if (types.includes('street_number')) addressDetails.streetNumber = component.long_name;
  //         if (types.includes('route')) addressDetails.route = component.long_name;
  //         if (types.includes('sublocality_level_1')) addressDetails.sublocality = component.long_name;
  //         if (types.includes('locality')) addressDetails.locality = component.long_name;
  //         if (types.includes('administrative_area_level_2')) addressDetails.adminArea2 = component.long_name;
  //         if (types.includes('administrative_area_level_1')) addressDetails.adminArea1 = component.long_name;
  //         if (types.includes('country')) addressDetails.country = component.long_name;
  //         if (types.includes('postal_code')) addressDetails.postalCode = component.long_name;
  //       });

  //       return addressDetails;
  //     };

  //     // Generate a unique identifier
  //     const generateUniqueId = () => {
  //       return Date.now().toString(36) + Math.random().toString(36).substr(2);
  //     };

  //     // Construct the transformed location data
  //     return {
  //       id: generateUniqueId(),
  //       address_full: placeData.formatted_address,
  //       latitude: latLng.lat,
  //       longtitude: latLng.lng,
  //       place_id: placeData.place_id,
  //       address_components: extractAddressComponents(placeData.address_components),
  //       created_at: new Date().toISOString(),
  //       types: placeData.types
  //     };
  //   } catch (error) {
  //     console.error('Location data transformation error:', error);
  //     throw new Error(`Failed to transform location data: ${error.message}`);
  //   }
  // }

  const handleOnGoogleLocationChange = (value) => {
    //  console.log("Data saved to AsyncStorage", value);
    // handleSaveLocationState(value);
    geocodeByPlaceId(value["value"]["place_id"]).then((res) =>
      getLatLng(res[0]).then((value) => {
        const dataset = {
          address_full: res[0].formatted_address,
          latitude: value.lat,
          longtitude: value.lng,
          address_components: res[0].address_components,
        };

        const formated = JSON.stringify(dataset);
        handleSaveLocationState(formated, res[0]);
        // return;
        localStorage.setItem("userLastLocation", formated);
        Cookies.set("userLastLocation", formated, { path: "/" });
        setBaseLocation(dataset);
        setOpenModalLocation(!openModalLocation);

        // Clear search query when location is selected
        setSearchQuery("");
        setShowRecentSearches(false);
        window.location.reload();
        // window.location.href = "/";
      })
    );
  };

  const handleSaveLocationState = async (data, res) => {
    // if (selectedLocationData?.locationDescription) {
    //   setLocationData(selectedLocationData);
    //   const stringifiedData = JSON.stringify(selectedLocationData);

    try {
      // await AsyncStorage.setItem("selectedLocationData", stringifiedData);

      data = JSON.parse(data);

      const final = JSON.stringify(data);

      console.log(final, "DataaaaaaaaaaaaaaaaXXXXXXXXXXXx");

      let dataSetD = {
        ...data,
        user_id: userId,
        place_id: res.place_id,
        address_full: data.address_full,
        dataSet: final,
        longitude: data?.longtitude,
        locationDescription: data.address_full,
        // ...parsedData,
      };

      console.log(dataSetD, "Data Set DDDDDDDDDDDDxxS");

      // if (selectedLocationId === undefined || selectedLocationId === null) {
      const response = await axios.post("/search-history/location", dataSetD);

      console.log("Data sent successfully:", response.data);
      // }
    } catch (error) {
      console.error("Error saving location:", error);
    }
    // } else {
    //    ToastMessage({ status: "error", message: 'Please select a valid location before saving.' })
    // }
  };

  const handleRecentLocationClick = (location, status) => {
    setSearchQuery(location.description);

    if (status == "base") {
      const latlng = {
        lat: parseFloat(location?.latitude),
        lng: parseFloat(location?.longtitude),
      };

      const geoCode = new window.google.maps.Geocoder();

      geoCode.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
          const mockEvent = {
            value: {
              place_id: results?.[0]?.place_id,
            },
          };

          handleOnGoogleLocationChange(mockEvent);
        } else {
        }
      });
    }

    // Create a mock event object for the existing handler
    const mockEvent = {
      value: {
        place_id: location.place_id,
      },
    };

    handleOnGoogleLocationChange(mockEvent);
  };

  const updateCurrency = (value) => {
    localStorage.setItem("baseCurrency", value);
    setTriggers({
      ...triggers,
      baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
    });
    setBaseCurrencyOpen(false);
  };

  const getCartLength = async () => {
    const response = await getCartDataLength(userId);
    setCartDataLength(response);
  };

  const handleScroll = () => {
    let number =
      window.pageXOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    if (number >= 400) {
      if (window.innerWidth < 581)
        document?.getElementById("sticky")?.classList.remove("fixed");
      else {
        document?.getElementById("sticky")?.classList.add("fixed");
      }
      var closemyslide = document.getElementById("mySidenav");
      if (closemyslide) closemyslide.classList.remove("open-side");
    } else document?.getElementById("sticky")?.classList.remove("fixed");
  };

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
  };

  const handleOffers = async () => {
    router.push("/page/offers");
    localStorage.removeItem("#__uid");
    Cookies.remove("hashedVal");
    setTriggers({
      userLoginTrigger: !triggers.userLoginTrigger,
      customerCartTrigger: !triggers.customerCartTrigger,
      baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
      userDesireLocation: !triggers.userDesireLocation,
    });
  };

  const handleActiveTab = (value) => {
    router.replace({
      pathname: "/page/account/profile",
      query: { page: value },
    });
    setOpenSideBarStatus(false);
  };

  const handleRedirect = (value) => {
    if (value === "home") {
      router.push("/");
    } else if (value === "help") {
      router.push("/page/helpcenter");
    } else if (value === "login") {
      router.push("/page/account/login-auth");
    } else if (value === "profile") {
      router.push({
        pathname: "/page/account/profile",
        query: { page: "myProfile-page" },
      });
    } else if (value === "cart") {
      router.push("/page/account/cart-page");
    } else if (value === "search") {
      router.push("/page/search");
    } else if (value === "order-history") {
      router.push("/page/account/order-history");
    } else if (value === "offers") {
      router.push("/page/offers");
    } else if (value === "chat") {
      router.push("/page/account/chats");
    } else if (value === "my_carts") {
      router.push({
        pathname: "/page/account/profile",
        query: { page: "my-carts" },
      });
    } else if (value === "help") {
      router.push("/page/helpcenter");
    } else if (value === "travel_budies") {
      router.push({
        pathname: "/page/account/profile",
        query: { page: "travel-buddies" },
      });
    }
  };

  useEffect(() => {
    if (userStatus.userLoggesIn) {
      getCartLength();
    }
  }, [triggers]);

  useEffect(() => {
    const url = window.location.href;
    if (url.includes("shop") || url.includes("product-details/")) {
      let link = url.toString().split("/")[4];
      setActiveLink(link.split("?")[0]);
    }
  }, [window.location.href]);

  useEffect(() => {
    setTimeout(function () {
      document.querySelectorAll(".loader-wrapper").style = "display:none";
    }, 2000);
    if (router.asPath !== "/layouts/Christmas")
      window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const [showPlacesComponent, setShowPlacesComponent] = useState(false);

  useEffect(() => {
    // Set a timeout to show the component after 1 second
    const timer = setTimeout(() => {
      setShowPlacesComponent(true);
    }, 5000); // 1000ms = 1 second

    // Clean up the timer if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const [stateHandle, setStateHandle] = useState(false);

  const [locationHistory, setLocationHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // const handleToggle = ()=>{
  //   setOpenModalLocation(false)
  //   setStateHandle(true)
  // }

  const handleToggle = () => {
    setOpenModalLocation(false);
    setStateHandle(true);
    // Clear search states when modal closes
    setSearchQuery("");
    setShowRecentSearches(false);
  };

  useEffect(() => {
    const fetchLocationHistory = async () => {
      if (openModalLocation && userId) {
        try {
          const response = await axios.get("/search-history/location/2", {
            params: { user_id: userId },
          });
          console.log(response.data.data, "recent search history");
          setLocationHistory(response.data.data);
          // Show recent searches if we have data
          if (response.data.data && response.data.data.length > 0) {
            setShowRecentSearches(true);
          }
        } catch (error) {
          console.error("Error fetching location history:", error);
        }
      }
    };

    fetchLocationHistory();
  }, [openModalLocation, userId]);

  // const handlelocationModel = ()=>{
  //   setOpenModalLocation(!openModalLocation)
  //   // fetchLocationHistory();
  //   // setStateHandle(false)
  // }

  const handlelocationModel = () => {
    setOpenModalLocation(!openModalLocation);
    if (!openModalLocation) {
      // Reset states when opening
      setSearchQuery("");
      setShowRecentSearches(false);
    }
  };

  return (
    <header
      id="sticky"
      className="sticky"
      style={{ position: "relative", zIndex: 1000 }}
    >
      {/* ----------------------------------------------------------------------- laptop view ---------------------------------------------------------------------------- */}

      <div className="d-none d-lg-flex align-items-stretch px-4 py-2 justify-content-betweeen navbar-main-container w-100">
        <div
          className="d-flex align-items-center justify-content-left col-4"
          style={{ cursor: "pointer", gap: "20px" }}
          onClick={() => handleRedirect("home")}
        >
          <img
            src={`/assets/images/icon/logo.png`}
            alt="logo"
            style={{
              width: "140px",
              height: "auto",
              transform: "scale(0.9)",
              transformOrigin: "center",
            }}
          />

          {/* <div
          className="d-flex align-items-center justify-content-end col-4"
          style={{
            columnGap: "30px",
            transform: "scale(0.9)",
            transformOrigin: "center",
          }}
        >
         <li
            className="d-flex align-items-center onhover-div mobile-setting
          "
            style={{
              cursor: "pointer",
              paddingBottom: "1rem",
              paddingTop: "1rem",
            }}
          >
            <CurrencyExchangeIcon sx={{ fontSize: 20 }} />
            <p
              className="m-0 p-0 mx-2 me-0"
              style={{ fontSize: 14, fontWeight: "normal" }}
            >
              {baseCurrency}
            </p>
            <div className="show-div setting mt-2">
              <p
                onClick={() => updateCurrency("USD")}
                style={{ color: baseCurrency === "USD" ? "orange" : "black" }}
              >
                USD
              </p>
              <p
                onClick={() => updateCurrency("LKR")}
                style={{ color: baseCurrency === "LKR" ? "orange" : "black" }}
              >
                LKR
              </p>
              <p
                onClick={() => updateCurrency("SGD")}
                style={{ color: baseCurrency === "SGD" ? "orange" : "black" }}
              >
                SGD
              </p>
              <p
                onClick={() => updateCurrency("INR")}
                style={{ color: baseCurrency === "INR" ? "orange" : "black" }}
              >
                INR
              </p>
              <p
                onClick={() => updateCurrency("AED")}
                style={{ color: baseCurrency === "AED" ? "orange" : "black" }}
              >
                AED
              </p>
            </div>
          </li>
          </div>*/}
        </div>
        <div
          className="d-none d-xl-flex align-items-center justify-content-center main-page-navigator col-4"
          style={{
            columnGap: "26px",
            transform: "scale(0.9)",
            transformOrigin: "center",
          }}
        >
          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "lifestyle" ? "red" : "",
            }}
            href="/shop/lifestyle"
          >
            <div className="header-na">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/lifestyle.png"
                  alt="Lifestyle icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Lifestyle</div>
            </div>
          </Link>
          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "hotels" ? "red" : "",
            }}
            href="/shop/hotels"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/hotel.png"
                  alt="Hotel icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Hotels</div>
            </div>
          </Link>
          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "flights" ? "red" : "",
            }}
            href="/shop/newFlights"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/flight.png"
                  alt="Flights icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Flights</div>
            </div>
          </Link>
          {/* <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              whiteSpace: "nowrap",
              display: "inline-block",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "transport" ? "red" : "",
            }}
            href="/shop/transport"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/transport.png"
                  alt="Non-Essential icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Transport</div>
            </div>
          </Link> */}

          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "education" ? "red" : "",
            }}
            href="/shop/education"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/education.png"
                  alt="Education icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Education</div>
            </div>
          </Link>

          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "essential" ? "red" : "",
            }}
            href="/shop/essential"
          >
            <div className="header-nav">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/ess.png"
                  alt="Essential icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Essential</div>
            </div>
          </Link>

          <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              whiteSpace: "nowrap",
              display: "inline-block",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "nonessential" ? "red" : "",
            }}
            href="/shop/nonessential"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/noness.png"
                  alt="Non-Essential icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Non-Essential</div>
            </div>
          </Link>
        </div>

        <div
          className="d-flex align-items-center justify-content-end col-4"
          style={{
            columnGap: "30px",
            transform: "scale(0.9)",
            transformOrigin: "center",
          }}
        >
          {/* testinggggggggggggg */}
          {locationView && (
            <li
              className="d-flex align-items-center"
              style={{ cursor: "pointer", marginLeft: "2rem" }}
              onClick={() => (locationView ? handlelocationModel() : null)}
              title={baseLocation.address_full}
            >
              <MyLocationIcon sx={{ fontSize: 20 }} />
              <p className="m-0 p-0 mx-2 me-0" style={{ fontSize: 14 }}>
                {baseLocation.address_full.length > 15
                  ? `${baseLocation.address_full.slice(0, 15)} ...`
                  : baseLocation.address_full}
              </p>
            </li>
          )}

          <li
            className="d-flex align-items-center onhover-div mobile-setting
          "
            style={{
              cursor: "pointer",
              paddingBottom: "1rem",
              paddingTop: "1rem",
            }}
          >
            <CurrencyExchangeIcon sx={{ fontSize: 20 }} />
            <p
              className="m-0 p-0 mx-2 me-0"
              style={{ fontSize: 14, fontWeight: "normal" }}
            >
              {baseCurrency}
            </p>
            <div className="show-div setting mt-2">
              <p
                onClick={() => updateCurrency("USD")}
                style={{ color: baseCurrency === "USD" ? "orange" : "black" }}
              >
                USD
              </p>
              <p
                onClick={() => updateCurrency("LKR")}
                style={{ color: baseCurrency === "LKR" ? "orange" : "black" }}
              >
                LKR
              </p>
              <p
                onClick={() => updateCurrency("SGD")}
                style={{ color: baseCurrency === "SGD" ? "orange" : "black" }}
              >
                SGD
              </p>
              <p
                onClick={() => updateCurrency("INR")}
                style={{ color: baseCurrency === "INR" ? "orange" : "black" }}
              >
                INR
              </p>
              <p
                onClick={() => updateCurrency("AED")}
                style={{ color: baseCurrency === "AED" ? "orange" : "black" }}
              >
                AED
              </p>
            </div>
          </li>

          {userStatus.userLoggesIn && (
            <li
              className="onhover-div mobile-cart"
              onClick={() => handleRedirect("cart")}
              style={{ cursor: "pointer" }}
            >
              {cartDataLength != 0 && (
                <div className="cart-qty-cls">{cartDataLength}</div>
              )}
              <ShoppingCartOutlinedIcon />
            </li>
          )}

          <SearchOutlinedIcon
            onClick={() => handleRedirect("search")}
            style={{ cursor: "pointer" }}
          />

          <li
            className="d-flex align-items-center onhover-div mobile-setting position-relative"
            style={{
              border: "1px solid #adb5bd",
              padding: "0.3rem",
              borderRadius: "50px",
              backgroundColor: "#ed4242",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center gap-1"
              style={{ cursor: "pointer" }}
            >
              <AccountCircleIcon style={{ color: "white" }} />
              <MenuIcon style={{ color: "white", fontSize: "24px" }} />
            </div>

            <div
              className="show-div setting position-absolute"
              style={{
                top: "110%",
                right: "0",
                minWidth: "200px",
                zIndex: 1000,
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                zIndex: "9999!important",
              }}
            >
              {userStatus.userLoggesIn ? (
                <div className="d-flex flex-column align-items-start">
                  <p
                    onClick={() => handleRedirect("profile")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <AccountCircleOutlinedIcon />
                      <div>
                        {baseUserId.user_username.length > 10
                          ? `${baseUserId.user_username.slice(0, 10)} ...`
                          : baseUserId.user_username}
                      </div>
                    </div>
                  </p>

                  {/* <p onClick={() => handleRedirect('cart')} className="m-0 p-0 mx-2 me-0 py-2" style={{ fontSize: 14, cursor: 'pointer', transition: 'background-color 0.2s', zIndex: '10' }}>
                    <div className="d-flex justify-content-center align-items-center gap-2 mycart-main-container">
                      <ShoppingCartOutlinedIcon />
                      <div>My carts</div>
                      <p className="cart-length">{cartDataLength}</p>
                    </div>
                  </p> */}

                  <p
                    onClick={() => handleRedirect("order-history")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2 mycart-main-container">
                      <HistoryOutlinedIcon />
                      <div>Order History</div>
                    </div>
                  </p>

                  {/* <p onClick={() => handleRedirect("home")} className="m-0 p-0 mx-2 me-0 py-2" style={{ fontSize: 14, cursor: 'pointer', transition: 'background-color 0.2s', zIndex: '10' }}>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <DiscountIcon />
                      <div>Home</div>
                    </div>
                  </p> */}
                  <p
                    onClick={() => handleRedirect("my_carts")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <ShoppingCartIcon />
                      <div>My Carts</div>
                    </div>
                  </p>

                  <p
                    onClick={() => handleRedirect("offers")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <DiscountIcon />
                      <div>Offers & Discount</div>
                    </div>
                  </p>

                  <p
                    onClick={() => handleRedirect("travel_budies")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <Diversity3Icon />
                      <div>Travel Buddies</div>
                    </div>
                  </p>

                  <p
                    onClick={() => handleRedirect("help")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <HelpOutlineIcon />
                      <div>Help</div>
                    </div>
                  </p>

                  <p
                    onClick={() => handleRedirect("chat")}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <CommentIcon />
                      <div>Chat</div>
                    </div>
                  </p>
                  <p
                    onClick={handleLogOut}
                    className="m-0 p-0 mx-2 me-0 py-2"
                    style={{
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      zIndex: "10",
                    }}
                  >
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <LogoutIcon />
                      <div>Sign out</div>
                    </div>
                  </p>
                </div>
              ) : (
                <p
                  onClick={() => handleRedirect("login")}
                  className="m-0 p-0 mx-2 me-0 py-2"
                  style={{
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                    zIndex: "10",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f0f0f0")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div className="d-flex justify-content-center align-items-center gap-2">
                    <div style={{ marginLeft: "5px" }}>
                      <LoginIcon />
                    </div>
                    <div>Login / Register</div>
                  </div>
                </p>
              )}
            </div>
          </li>
        </div>
      </div>

      {/* ----------------------------------------------------------------------- mobile view ---------------------------------------------------------------------------- */}

      <div className="d-block d-lg-none">
        <div className="d-flex p-3 align-items-center justify-content-start gap-2">
          <MenuOutlinedIcon
            onClick={() => setOpenSideBarStatus(true)}
            sx={{ fontSize: "30px" }}
          />
          <img
            src={`/assets/images/icon/logo.png`}
            onClick={() => handleRedirect("home")}
            alt="logo"
            style={{
              width: "100px",
              height: "auto",
              marginLeft: userStatus.userLoggesIn ? "10px" : "0px",
            }}
          />

          <div className="ms-auto d-flex gap-3 align-items-center">
            {userStatus.userLoggesIn && (
              <li
                className="onhover-div mobile-cart"
                onClick={() => handleRedirect("cart")}
                style={{ cursor: "pointer" }}
              >
                {cartDataLength != 0 && (
                  <div className="cart-qty-cls">{cartDataLength}</div>
                )}
                <ShoppingCartOutlinedIcon />
              </li>
            )}

            <SearchOutlinedIcon
              onClick={() => handleRedirect("search")}
              className="search-btn-GlobalSearchBar"
            />

            <li
              className="d-flex align-items-center currency-changer-main-container"
              onClick={() => setBaseCurrencyOpen(!baseCurrencyOpen)}
            >
              <p className="m-0 p-0" style={{ fontSize: 13 }}>
                {baseCurrency}
              </p>
            </li>

            <div
              className={`${
                baseCurrencyOpen
                  ? "baseCurrency-pickerResponsive-open"
                  : "baseCurrency-pickerResponsive-close"
              } `}
            >
              <button
                className="currency-typesResponsive"
                onClick={() => updateCurrency("USD")}
                style={{ color: baseCurrency === "USD" ? "orange" : "black" }}
              >
                USD
              </button>
              <button
                className="currency-typesResponsive"
                onClick={() => updateCurrency("LKR")}
                style={{ color: baseCurrency === "LKR" ? "orange" : "black" }}
              >
                LKR
              </button>
              <button
                className="currency-typesResponsive"
                onClick={() => updateCurrency("SGD")}
                style={{ color: baseCurrency === "SGD" ? "orange" : "black" }}
              >
                SGD
              </button>
              <button
                className="currency-typesResponsive"
                onClick={() => updateCurrency("INR")}
                style={{ color: baseCurrency === "INR" ? "orange" : "black" }}
              >
                INR
              </button>
              <button
                className="currency-typesResponsive"
                onClick={() => updateCurrency("AED")}
                style={{ color: baseCurrency === "AED" ? "orange" : "black" }}
              >
                AED
              </button>
            </div>
          </div>
        </div>

        <div className="" onClick={() => setOpenModalLocation(true)}>
          <ShareLocationOutlinedIcon sx={{ fontSize: 20 }} />
          <p className="m-0 p-0 mx-2 ellipsis-1-lines">
            {baseLocation.address_full}
          </p>
        </div>

        <div className="d-flex gap-3 py-2 mobile-navbar">
          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor:
                activeLink === "lifestyle" ? "#eccffc" : "#fbf5ff",
            }}
            href="/shop/lifestyle"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/lifestyle.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Lifestyle
              </div>
            </div>
          </Link>
          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor:
                activeLink === "hotelAhs" || activeLink === "hotels"
                  ? "#cfffd1"
                  : "#f7fff9",
            }}
            href="/shop/hotels"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/hotel.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Hotels
              </div>
            </div>
          </Link>
          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor: activeLink === "flights" ? "#cad2fc" : "#f2f8ff",
            }}
            href="/shop/flights"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/flight.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Flights
              </div>
            </div>
          </Link>

          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor:
                activeLink === "education" ? "#ffcfe9" : "#fff7fc",
            }}
            href="/shop/education"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/education.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Education
              </div>
            </div>
          </Link>

          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor:
                activeLink === "essential" ? "#f7fccc" : "#fefffa",
            }}
            href="/shop/essential"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/ess.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Essential
              </div>
            </div>
          </Link>

          <Link
            className="nav-link"
            style={{
              marginBottom: "4px",
              paddingLeft: "10px",
              paddingRight: "10px",
              paddingTop: "5px",
              paddingBottom: "5px",
              borderRadius: "7px",
              textTransform: "capitalize",
              fontSize: 13,
              backgroundColor:
                activeLink === "nonessential" ? "#fff2cf" : "#fffcf5",
            }}
            href="/shop/nonessential"
          >
            <div className="d-flex align-items-center justify-content-center">
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/noness.png"
                  width={20}
                  height={20}
                />
              </div>
              <div className="d-flex align-items-center justify-content-center ms-1">
                Non-Essential
              </div>
            </div>
          </Link>
          {/* <Link
            className="nav-link"
            style={{
              padding: "5px",
              borderRadius: "25px",
              whiteSpace: "nowrap",
              display: "inline-block",
              textTransform: "capitalize",
              fontSize: 14,
              color: activeLink === "transport" ? "red" : "",
            }}
            href="/shop/transport"
          >
            <div>
              <div className="d-flex align-items-center justify-content-center">
                <Image
                  src="/assets/images/Icons/transport.png"
                  alt="Non-Essential icon"
                  width={30}
                  height={30}
                  style={{ marginBottom: "5px" }}
                />
              </div>
              <div>Transport</div>
            </div>
          </Link> */}
        </div>

        <div
          className={`mobile-sideBar-containerMain ${
            openSideBarStatus ? "open" : "close"
          } `}
        >
          <CloseOutlinedIcon
            onClick={() => setOpenSideBarStatus(false)}
            className="mobile-sidebar-closeButton"
          />

          {userStatus.userLoggesIn ? (
            <>
              <div className="d-flex flex-column align-items-center my-2 mt-5">
                <LazyLoadImage
                  src={
                    baseUserId.pro_pic
                      ? getImageUrl(baseUserId.pro_pic)
                      : "/assets/images/NavbarImages/defaultImage.png"
                  }
                  className="border"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
                <h6 className="mt-3" style={{ fontSize: 18 }}>
                  {baseUserId.user_username}
                </h6>
                <p style={{ fontSize: 10 }}>{baseUserId.user_email}</p>
              </div>
              <p
                style={{
                  borderBottom: "1px solid gray",
                  width: "85%",
                  margin: "0px auto",
                }}
              ></p>
              <div className="d-flex nav-bar-mobileContianer flex-column align-items-start mx-4 mt-4 gap-4">
                <li onClick={() => handleRedirect("home")}>Home</li>
                <li onClick={() => handleActiveTab("myProfile-page")}>
                  Profile
                </li>
                <li onClick={() => handleActiveTab("my-carts")}>My carts</li>
                <li onClick={() => handleActiveTab("travel-buddies")}>
                  Travel Buddies
                </li>
                {userStatus.userLoggesIn ? (
                  <li className="mt-auto" onClick={handleLogOut}>
                    Logout
                  </li>
                ) : (
                  <li
                    className="mt-auto"
                    onClick={() => handleRedirect("login")}
                  >
                    Sign-in
                  </li>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="d-flex flex-column align-items-center my-2 mt-5">
                <LazyLoadImage
                  src={"/assets/images/NavbarImages/defaultImage.png"}
                  className="border"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
                <h6 className="mt-3" style={{ fontSize: 18 }}>
                  Guest
                </h6>
                <p style={{ fontSize: 10 }}>
                  Please login to display your email
                </p>
              </div>
              <p
                style={{
                  borderBottom: "1px solid gray",
                  width: "85%",
                  margin: "0px auto",
                }}
              ></p>
              <div className="d-flex nav-bar-mobileContianer flex-column align-items-start mx-4 mt-4 gap-4">
                <li onClick={() => handleRedirect("home")}>Home</li>
                <li onClick={() => handleRedirect("help")}>Help</li>
                <li className="mt-auto" onClick={() => handleRedirect("login")}>
                  Login
                </li>
              </div>
            </>
          )}
        </div>
      </div>

      {/* -----------------------------------------------------------------------TabView Nav-Links---------------------------------------------------------------------------- */}

      <div
        className="d-none d-lg-flex d-xl-none align-items-center justify-content-center main-page-navigator"
        style={{
          columnGap: "30px",
          transform: "scale(0.9)",
          transformOrigin: "center",
        }}
      >
        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "lifestyle" ? "red" : "",
          }}
          href="/shop/lifestyle"
        >
          <div className="header-na">
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/lifestyle.png"
                alt="Lifestyle icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Lifestyle</div>
          </div>
        </Link>
        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            textTransform: "capitalize",
            fontSize: 14,
            color:
              activeLink === "hotelAhs" || activeLink === "hotels" ? "red" : "",
          }}
          href="/shop/hotels"
        >
          <div>
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/hotel.png"
                alt="Hotel icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Hotels</div>
          </div>
        </Link>
        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "flights" ? "red" : "",
          }}
          href="/shop/newFlights"
        >
          <div>
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/flight.png"
                alt="Flights icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Flights</div>
          </div>
        </Link>

        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "education" ? "red" : "",
          }}
          href="/shop/education"
        >
          <div>
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/education.png"
                alt="Education icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Education</div>
          </div>
        </Link>

        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "essential" ? "red" : "",
          }}
          href="/shop/essential"
        >
          <div className="header-nav">
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/ess.png"
                alt="Essential icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Essential</div>
          </div>
        </Link>

        <Link
          className="nav-link"
          style={{
            padding: "10px",
            borderRadius: "25px",
            whiteSpace: "nowrap",
            display: "inline-block",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "nonessential" ? "red" : "",
          }}
          href="/shop/nonessential"
        >
          <div>
            <div className="d-flex d-lg-flex d-xl-none align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/noness.png"
                alt="Non-Essential icon"
                width={30}
                height={30}
                style={{ marginBottom: "10px" }}
              />
            </div>
            <div>Non-Essential</div>
          </div>
        </Link>
        {/* <Link
          className="nav-link"
          style={{
            padding: "5px",
            borderRadius: "25px",
            whiteSpace: "nowrap",
            display: "inline-block",
            textTransform: "capitalize",
            fontSize: 14,
            color: activeLink === "transport" ? "red" : "",
          }}
          href="/shop/transport"
        >
          <div>
            <div className="d-flex align-items-center justify-content-center">
              <Image
                src="/assets/images/Icons/transport.png"
                alt="Non-Essential icon"
                width={30}
                height={30}
                style={{ marginBottom: "5px" }}
              />
            </div>
            <div>Transport</div>
          </div>
        </Link> */}
      </div>

      <ModalBase
        isOpen={openModalLocation}
        toggle={() => handleToggle()}
        title={"Select your location"}
      >
        <div className="px-3">
          <p className="m-0 p-0 text-center mb-4" style={{ fontSize: 12 }}>
            Select your desired location to see the available products
          </p>

          <div className="mb-3 custom-location-selection">
            <h6
              className="m-0 p-0 mb-2"
              style={{ fontSize: 14, fontWeight: 500, color: "black" }}
            >
              Custom Location
            </h6>

            <GooglePlacesAutocomplete
              apiKey={groupApiCode}
              onLoadFailed={(error) =>
                console.error("Could not inject Google script", error)
              }
              selectProps={{
                onChange: (e) => handleOnGoogleLocationChange(e),
                placeholder: searchQuery || googleLocation,
                inputValue: searchQuery,
                onInputChange: setSearchQuery,
                styles: {
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                  control: (provided) => ({
                    ...provided,
                    paddingRight: "30px",
                  }),
                  dropdownIndicator: () => ({
                    display: "none",
                  }),
                  indicatorSeparator: () => ({
                    display: "none",
                  }),
                },
              }}
            />
          </div>

          <div className="mb-3">
            <h6
              className="m-0 p-0 mb-2"
              style={{ fontSize: 14, fontWeight: 500, color: "black" }}
            >
              Current Selected Location
            </h6>

            {/* {console.log(baseLocation,"Base Location Isssss123123123123")} */}
            <div
              className="d-flex align-items-center gap-2"
              onClick={() => handleRecentLocationClick(baseLocation,"base")}
              style={{
                cursor: "pointer",
                transition: "background-color 0.2s",
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e9ecef";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
            >
              <ShareLocationOutlinedIcon />
              <p className="m-0 p-0" style={{ fontSize: 13 }}>
                {baseLocation.address_full || "No location selected"}
              </p>
            </div>
          </div>

          {/* Recent Search List */}
          {showRecentSearches && locationHistory.length > 0 && (
            <div className="mb-3">
              <h6
                className="m-0 p-0 mb-2"
                style={{ fontSize: 14, fontWeight: 500, color: "black" }}
              >
                Recent Searches
              </h6>
              <div
                className="d-flex flex-column gap-2"
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  paddingRight: "4px",
                }}
              >
                {locationHistory.slice(0, 20).map((location, index) => (
                  <div
                    key={location.id}
                    onClick={() => handleRecentLocationClick(location)}
                    className="d-flex align-items-center gap-3 p-2 rounded"
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e9ecef";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }}
                  >
                    <AccessTimeIcon
                      style={{
                        fontSize: 16,
                        color: "#6c757d",
                        flexShrink: 0,
                      }}
                    />
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <p
                        className="m-0 text-truncate"
                        style={{
                          fontSize: 14,
                          color: "#212529",
                          fontWeight: 500,
                        }}
                      >
                        {location.description}
                      </p>
                      {location.dataSet?.structured_formatting
                        ?.secondary_text && (
                        <p
                          className="m-0 text-truncate"
                          style={{
                            fontSize: 12,
                            color: "#6c757d",
                            marginTop: "2px",
                          }}
                        >
                          {
                            location.dataSet.structured_formatting
                              .secondary_text
                          }
                        </p>
                      )}
                    </div>
                    <LocationOnIcon
                      style={{
                        fontSize: 14,
                        color: "#6c757d",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ModalBase>
    </header>
  );
};

export default HeaderOne;
