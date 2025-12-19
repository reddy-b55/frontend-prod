
// import React, { useState, useEffect, useContext } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useRouter } from "next/router";
// import GooglePlacesAutocomplete, {
//   geocodeByPlaceId,
//   getLatLng,
// } from "react-google-places-autocomplete";
// import { AppContext } from "../../pages/_app";
// import {
//   Close,
//   ShareLocationOutlined,
//   AccessTime,
//   LocationOn,
// } from "@mui/icons-material";
// import styles from "./LocationModal.module.css";

// const LocationModal = ({ isOpen, onClose }) => {
//   const router = useRouter();
//   const {
//     baseLocation,
//     setBaseLocation,
//     userId,
//     groupApiCode,
//   } = useContext(AppContext);

//   const [locationHistory, setLocationHistory] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showRecentSearches, setShowRecentSearches] = useState(false);

//   // Handle location change
//   const handleOnGoogleLocationChange = (value) => {
//     geocodeByPlaceId(value["value"]["place_id"]).then((res) =>
//       getLatLng(res[0]).then((value) => {
//         const dataset = {
//           address_full: res[0].formatted_address,
//           latitude: value.lat,
//           longtitude: value.lng,
//           address_components: res[0].address_components,
//         };

//         const formated = JSON.stringify(dataset);
//         handleSaveLocationState(formated, res[0]);
//         localStorage.setItem("userLastLocation", formated);
//         Cookies.set("userLastLocation", formated, { path: "/" });
//         setBaseLocation(dataset);
//         onClose();
//         setSearchQuery("");
//         setShowRecentSearches(false);
//         window.location.reload();
//       })
//     );
//   };

//   // Save location to backend
//   const handleSaveLocationState = async (data, res) => {
//     try {
//       data = JSON.parse(data);
//       const final = JSON.stringify(data);
//       let dataSetD = {
//         ...data,
//         user_id: userId,
//         place_id: res.place_id,
//         address_full: data.address_full,
//         dataSet: final,
//         longitude: data?.longtitude,
//         locationDescription: data.address_full,
//       };
//       await axios.post("/search-history/location", dataSetD);
//     } catch (error) {
//       console.error("Error saving location:", error);
//     }
//   };

//   // Handle recent location click
//   const handleRecentLocationClick = (location, status) => {
//     setSearchQuery(location.description);

//     if (status === "base") {
//       const latlng = {
//         lat: parseFloat(location?.latitude),
//         lng: parseFloat(location?.longtitude),
//       };

//       const geoCode = new window.google.maps.Geocoder();
//       geoCode.geocode({ location: latlng }, (results, status) => {
//         if (status === "OK" && results[0]) {
//           const mockEvent = {
//             value: {
//               place_id: results?.[0]?.place_id,
//             },
//           };
//           handleOnGoogleLocationChange(mockEvent);
//         }
//       });
//       return;
//     }

//     const mockEvent = {
//       value: {
//         place_id: location.place_id,
//       },
//     };
//     handleOnGoogleLocationChange(mockEvent);
//   };

//   // Handle click outside modal
//   const handleBackdropClick = (e) => {
//     if (e.target === e.currentTarget) {
//       onClose();
//     }
//   };

//   useEffect(() => {
//     const fetchLocationHistory = async () => {
//       if (isOpen && userId) {
//         try {
//           const response = await axios.get("/search-history/location/2", {
//             params: { user_id: userId },
//           });
//           setLocationHistory(response.data.data);
//           if (response.data.data && response.data.data.length > 0) {
//             setShowRecentSearches(true);
//           }
//         } catch (error) {
//           console.error("Error fetching location history:", error);
//         }
//       }
//     };
//     fetchLocationHistory();
//   }, [isOpen, userId]);

//   // Handle escape key
//   useEffect(() => {
//     const handleEscape = (e) => {
//       if (e.key === 'Escape' && isOpen) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       document.removeEventListener('keydown', handleEscape);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, onClose]);

//   if (!isOpen) return null;

//   return (
//     <div 
//       className={`${styles.modal} ${isOpen ? styles.open : ''}`}
//       onClick={handleBackdropClick}
//     >
//       <div className={styles.modalContent}>
//         <div className={styles.modalHeader}>
//           <h3 className={styles.modalTitle}>Select your location</h3>
//           <button 
//             className={styles.closeButton}
//             onClick={onClose}
//             aria-label="Close modal"
//           >
//             <Close />
//           </button>
//         </div>

//         <div className={styles.modalBody}>
//           <p style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#718096" }}>
//             Select your desired location to see the available products
//           </p>

//           <div className={styles.locationSection}>
//             <h4 className={styles.sectionTitle}>Custom Location</h4>
//             <GooglePlacesAutocomplete
//               apiKey={groupApiCode}
//               onLoadFailed={(error) =>
//                 console.error("Could not inject Google script", error)
//               }
//               selectProps={{
//                 onChange: (e) => handleOnGoogleLocationChange(e),
//                 placeholder: searchQuery || "Search for a location...",
//                 inputValue: searchQuery,
//                 onInputChange: setSearchQuery,
//                 styles: {
//                   container: (provided) => ({
//                     ...provided,
//                     width: "100%",
//                   }),
//                   control: (provided) => ({
//                     ...provided,
//                     padding: "0.25rem",
//                     border: "1px solid #e2e8f0",
//                     borderRadius: "8px",
//                     boxShadow: "none",
//                     "&:hover": {
//                       borderColor: "#4f46e5",
//                     },
//                   }),
//                   dropdownIndicator: () => ({
//                     display: "none",
//                   }),
//                   indicatorSeparator: () => ({
//                     display: "none",
//                   }),
//                 },
//               }}
//             />
//           </div>

//           <div className={styles.locationSection}>
//             <h4 className={styles.sectionTitle}>Current Selected Location</h4>
//             <div
//               className={styles.locationItem}
//               onClick={() => handleRecentLocationClick(baseLocation, "base")}
//             >
//               <ShareLocationOutlined fontSize="small" />
//               <span className={styles.locationText}>
//                 {baseLocation.address_full || "No location selected"}
//               </span>
//             </div>
//           </div>

//           {/* Recent Search List */}
//           {showRecentSearches && locationHistory.length > 0 && (
//             <div className={styles.locationSection}>
//               <h4 className={styles.sectionTitle}>Recent Searches</h4>
//               <div style={{ maxHeight: "300px", overflowY: "auto" }}>
//                 {locationHistory.slice(0, 20).map((location) => (
//                   <div
//                     key={location.id}
//                     onClick={() => handleRecentLocationClick(location)}
//                     className={styles.locationItem}
//                     style={{ marginBottom: "0.5rem" }}
//                   >
//                     <AccessTime fontSize="small" />
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                       <p className={`${styles.locationText} ${styles.ellipsis}`} style={{ fontWeight: 500, marginBottom: "0.125rem" }}>
//                         {location.description}
//                       </p>
//                       {location.dataSet?.structured_formatting?.secondary_text && (
//                         <p className={`${styles.locationText} ${styles.ellipsis}`} style={{ fontSize: "0.75rem", color: "#718096" }}>
//                           {location.dataSet.structured_formatting.secondary_text}
//                         </p>
//                       )}
//                     </div>
//                     <LocationOn fontSize="small" />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LocationModal;


import React, { useState, useEffect, useContext, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import GooglePlacesAutocomplete, {
  geocodeByPlaceId,
  getLatLng,
  geocodeByLatLng
} from "react-google-places-autocomplete";
import { AppContext } from "../../pages/_app";
import {
  Close,
  ShareLocationOutlined,
  AccessTime,
  LocationOn,
} from "@mui/icons-material";
import styles from "./LocationModal.module.css";
import countryList from 'react-select-country-list';
import { set } from "nprogress";

const LocationModal = ({ isOpen, onClose }) => {
  const router = useRouter();
  const {
    baseLocation,
    setBaseLocation,
    userId,
    groupApiCode,
  } = useContext(AppContext);

  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const options = useMemo(() => countryList().getData(), []);
  const [fetchLocation, setFetchLocation] = useState({
    address_full: null,
    latitude: null,
    longtitude: null,
    address_components: []
  });
  const [isfetchLocation, setIsFetchLocation] = useState(false);



  const getLocation = async () => {


          navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('countryOptionnnnnnnnnnnnnnnnnnn', latitude, longitude)
    try {
      // getLocationDetils(6.9271, 79.8612);
      // const results = await geocodeByLatLng({ lat: 6.9271, lng: 79.8612 });
            // navigator.geolocation.getCurrentPosition(async (position) => {
      //     const { latitude, longitude } = position.coords;
      //     console.log('countryOptionnnnnnnnnnnnnnnnnnn', latitude, longitude)
      const results = await geocodeByLatLng({ lat: latitude, lng: longitude });

      console.log(results,"Results data is data")
      const addressComponents = results[0].address_components;
      const countryComponent = addressComponents.find(component => component.types.includes('country'));

      setFetchLocation({
        latitude: latitude,
        longtitude: longitude,
        address_components: addressComponents,
        address_full: results[0].formatted_address
      })
      console.log('countryOptionnnnnnnnnnnnnnnnnnn', {
        latitude: latitude,
        longtitude: longitude,
        address_components: addressComponents,
        address_full: results[0].formatted_address
      })
      // handleChangeCountry(countryOption);
      setIsFetchLocation(false);
    } catch (error) {
      console.error('Error fetching location details:', error);
      setIsFetchLocation(false);
    }
    });
  }
  useEffect(() => {
    if (navigator.geolocation) {
      console.log('countryOptionnnnnnnnnnnnnnnnnnn')
      setIsFetchLocation(true);
      // navigator.geolocation.getCurrentPosition(async (position) => {
      //     const { latitude, longitude } = position.coords;
      //     console.log('countryOptionnnnnnnnnnnnnnnnnnn', latitude, longitude)
      getLocation();
      // });
    }
  }, [isOpen]);

  const loadGoogleMapsAPI = () => {
    return new Promise((resolve, reject) => {
      if (typeof window.google !== "undefined" && window.google.maps) {
        // Google Maps API already loaded
        resolve(window.google);
        return;
      }

      // Check if the script is already added to avoid duplicate loads
      const existingScript = document.getElementById("google-maps-api");
      if (existingScript) {
        existingScript.onload = () => resolve(window.google);
        existingScript.onerror = (error) => reject(error);
        return;
      }

      // Create and append the script dynamically
      const script = document.createElement("script");
      script.id = "google-maps-api";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${groupApiCode}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => resolve(window.google);
      script.onerror = (error) => reject(error);

      document.head.appendChild(script);
    });
  };

  const getLocationDetils = async (latitude, longitude) => {
    console.log("Customer Custom Address")
    try {
      await loadGoogleMapsAPI().then(() => {
        const geocoder = new google.maps.Geocoder();
        const latLng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
        geocoder.geocode({ location: latLng }, (results, status) => {
          if (status === "OK" && results[0]) {
            const cityComponent = results[0].address_components.find(component =>
              component.types.includes("locality")
            );
            const city = cityComponent ? cityComponent.short_name : "Unknown City";
            console.log("Customer Custom Address", city);
            setFetchLocation({
              ...fetchLocation,
              address_full: results[0].formatted_address,
              latitude:latitude,
              longitude:longitude

            })
            console.log("Customer Custom Address alllllllllll122", fetchLocation);
          } else {
            // setCustomerCustomAddress('Something went wrong ...')
          }
        });
      });
    } catch (error) {
      setTimeout(() => {
        // console.error(error);
      }, 2000);
    }
  }

// In LocationModal component, update the handleOnGoogleLocationChange function
const handleOnGoogleLocationChange = (value) => {
  localStorage.removeItem("aahaas_selected_location"); // Clear previous manual selection
  
  geocodeByPlaceId(value["value"]["place_id"]).then((res) =>
    getLatLng(res[0]).then((value) => {
      const dataset = {
        address_full: res[0].formatted_address,
        latitude: value.lat,
        longtitude: value.lng,
        address_components: res[0].address_components,
      };

      const formated = JSON.stringify(dataset);
      
      // Save to both manual selection and last location
      localStorage.setItem("aahaas_selected_location", formated);
      localStorage.setItem("userLastLocation", formated);
      Cookies.set("userLastLocation", formated, { path: "/" });
      
      handleSaveLocationState(formated, res[0]);
      setBaseLocation(dataset);
      onClose();
      setSearchQuery("");
      setShowRecentSearches(false);
      window.location.reload();
    })
  );
};
  // Save location to backend
  const handleSaveLocationState = async (data, res) => {
    try {
      data = JSON.parse(data);
      const final = JSON.stringify(data);
      let dataSetD = {
        ...data,
        user_id: userId,
        place_id: res.place_id,
        address_full: data.address_full,
        dataSet: final,
        longitude: data?.longtitude,
        locationDescription: data.address_full,
      };
      await axios.post("/search-history/location", dataSetD);
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  // Handle recent location click
  const handleRecentLocationClick = (location, status) => {
    setSearchQuery(location.description);
    console.log(fetchLocation, 'dataaaaaaaaaaaaaaaaaaa')
    // return
    if (status === "base") {
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
        }
      });
      return;
    }

    const mockEvent = {
      value: {
        place_id: location.place_id,
      },
    };
    handleOnGoogleLocationChange(mockEvent);
  };

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  useEffect(() => {
    const fetchLocationHistory = async () => {
      if (isOpen && userId) {
        setLoading(true);
        try {
          const response = await axios.get("/search-history/location/2", {
            params: { user_id: userId },
          });
          setLocationHistory(response.data.data);
          if (response.data.data && response.data.data.length > 0) {
            setShowRecentSearches(true);
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          console.error("Error fetching location history:", error);
        }
      } else {
        setLoading(false);
      }
    };
    fetchLocationHistory();
  }, [isOpen, userId]);

  // Handle escape key and prevent background scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      // Prevent background scroll
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent touch scrolling on mobile
      document.addEventListener('touchmove', preventScroll, { passive: false });
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
      document.removeEventListener('touchmove', preventScroll);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('touchmove', preventScroll);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Prevent scroll function
  const preventScroll = (e) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modal} ${isOpen ? styles.open : ''}`}
      onClick={handleBackdropClick}
      style={{
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none'
      }}
    >
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Select your location</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <Close />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "0.875rem", color: "#718096" }}>
            Select your desired location to see the available products
          </p>

          <div className={styles.locationSection}>
            <h4 className={styles.sectionTitle}>Custom Location</h4>
            <GooglePlacesAutocomplete
              apiKey={groupApiCode}
              onLoadFailed={(error) =>
                console.error("Could not inject Google script", error)
              }
              selectProps={{
                onChange: (e) => handleOnGoogleLocationChange(e),
                placeholder: searchQuery || "Search city",
                inputValue: searchQuery,
                onInputChange: setSearchQuery,
                styles: {
                  container: (provided) => ({
                    ...provided,
                    width: "100%",
                  }),
                  control: (provided) => ({
                    ...provided,
                    padding: "0.25rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#4f46e5",
                    },
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

          <div className={styles.locationSection}>
            <h4 className={styles.sectionTitle}>Current Location</h4>
            <div
              className={styles.locationItem2}
              onClick={() => handleRecentLocationClick(fetchLocation, "base")}
            >
              <ShareLocationOutlined fontSize="small" />
              <span className={styles.locationText}>
                {fetchLocation?.address_full || "No location selected"}
              </span>
            </div>
          </div>

          {/* <div className={styles.locationSection}>
            <h4 className={styles.sectionTitle}>Current Selected Location</h4>
            <div
              className={styles.locationItem}
              onClick={() => handleRecentLocationClick(baseLocation, "base")}
            >
              <ShareLocationOutlined fontSize="small" />
              <span className={styles.locationText}>
                {baseLocation?.address_full || "No location selected"}
              </span>
            </div>
          </div> */}

          {/* Recent Search List */}
          {showRecentSearches && locationHistory.length > 0 && (
            <div className={styles.locationSection}>
              <h4 className={styles.sectionTitle}>Recent Searches</h4>
              {
                loading ? (
                  <div style={{ textAlign: "center", padding: "1rem" }}>
                    <p style={{ color: "#718096" }}>Loading...</p>
                  </div>
                ) : (
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {locationHistory.slice(0, 20).map((location) => (
                      <div
                        key={location.id}
                        onClick={() => handleRecentLocationClick(location)}
                        className={styles.locationItem}
                        style={{ marginBottom: "0.5rem" }}
                      >
                        <AccessTime fontSize="small" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className={`${styles.locationText} ${styles.ellipsis}`} style={{ fontWeight: 500, marginBottom: "0.125rem" }}>
                            {location.description}
                          </p>
                          {location.dataSet?.structured_formatting?.secondary_text && (
                            <p className={`${styles.locationText} ${styles.ellipsis}`} style={{ fontSize: "0.75rem", color: "#718096" }}>
                              {location.dataSet.structured_formatting.secondary_text}
                            </p>
                          )}
                        </div>
                        <LocationOn fontSize="small" />
                      </div>
                    ))}
                  </div>
                )
              }

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;