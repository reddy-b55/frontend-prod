import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Col,
  Collapse,
  Container,
  Input,
  Media,
  Row,
} from "reactstrap";
import Head from 'next/head';
import { useRouter } from "next/router";
import Image from "next/image";


import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import PostLoader from "../../skeleton/PostLoader";
import ProductSlider from "../productImageSlider";
import ToastMessage from "../../../components/Notification/ToastMessage";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import FilterListIcon from "@mui/icons-material/FilterList";
import Select from "react-select";

// Import your context and services
import { AppContext } from "../../_app";
// import { fetchLifestyleData } from "../../../services/lifestyleService"; // Assuming you have this service

// Import banner image
import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg";
import { fetchLifestyleData } from "../../../AxiosCalls/LifestyleServices/newLifeStyleService";
import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
import axios from "axios";
import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import ProductSkeleton from "../../skeleton/productSkeleton";
import LifestyleChatbot from "../../../components/common/widgets/LifestyleBot";
import getDiscountProductBaseByPrice from "../../product-details/common/GetDiscountProductBaseByPrice";
// import LifestyleChatbot from "../../../components/common/widgets/lifestylechatbot";
// import LifestyleChatbot from "../../../components/common/widgets/LifestyleChatbot";
import filterCion from "../../../public/assets/images/newImages/filterIcon.png"
import TuneIcon from '@mui/icons-material/Tune';
import NewBanners from "../../layouts/NewBanners";

export default function LifestyleProducts({ searchQuery = '' }) {
  const router = useRouter();
  const canonicalUrl = router.asPath;
  const { baseLocation, baseCurrencyValue, baseCurrency, groupApiCode } = useContext(AppContext);

  // State management
  const [loading, setLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [allDiscountData, setAllDiscountData] = useState([]);

  const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

  //filters
  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [showFilterButton, setShowFilterButton] = useState(true); // New state for filter button visibility
  const [priceFilterOpen, setpriceFilterOpen] = useState(true);
  const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
  const [userMinMaxPrice, setUserMinMaxPrice] = useState({
    min: "",
    max: "",
  });
  const [minprice, setminprice] = useState("");
  const [maxprice, setmaxprice] = useState("");
  const [pricerange, setpricerange] = useState([]);
  const [pricefilter, setpricefilter] = useState(false);
  const [locationfilterOpen, setlocationfilterOpen] = useState(true);
  const [locations, setLocations] = useState([]);
  const [courseSubFilter, setCourseSubFilter] = useState(true);
  const [courseSubCategory, setCourseSubCategory] = useState([]);
  const [distance, setDistance] = useState(20);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchFilter, setSearchfilter] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [tempCurrency, setTempCurrency] = useState('');
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [filterCheckboxes, setFilterCheckboxes] = useState([]);
  const [filteredLifeStyleData, setFilteredLifeStyleData] = useState([]);
  const [backEndFilters, setBackEndFilters] = useState({
    category1: null,
    category2: null,
    category3: null,
    limit: 50,
  });
  const [searchObject, setSearchObject] = useState({
    search: "",
    priceRance: [0, 0],
    location: [],
    subCategory: [],
    distance: 20,
  })
  const [selectedSortMethod, setSelectedSortMethod] = useState('default');
  const [isSorting, setIsSorting] = useState(false);
  const [googleLocation, setGoogleLocation] = useState('search');
  const [globalLocation, setGlobalLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userSelectedLocation, setUserSelectedLocation] = useState(null);
  const [isUsingGlobalLocation, setIsUsingGlobalLocation] = useState(true);
  const [pendingChatbotFilters, setPendingChatbotFilters] = useState(null);
  const [activeChatbotFilters, setActiveChatbotFilters] = useState(null);

  const options = [
    { value: "default", label: "Featured" },
    { value: "newArrival", label: "New Arrivals" },
   { value: "freeProducts", label: " Free Products" },
    // { value: "featured", label: "Featured" },
    { value: "priceLH", label: "Price Low to High" },
    { value: "priceHL", label: "Price High to Low" },
    { value: "distanceLH", label: "Distance Low to High" },

    // { value: "distanceHL", label: "Distance High to Low" },
  ];

  // Provider status for tracking multiple data sources
  //   const initialProviderStatus = {
  //     provider1: { loading: false, completed: false, error: null },
  //     provider2: { loading: false, completed: false, error: null },
  //     // Add more providers as needed
  //   };

  // const providers = ["bridgify", "aahaas", "globaltix","cebu","zetexa"];
  const providers = ["aahaas","bridgify"];

  const [providerStatus, setProviderStatus] = useState(providers);

  // Mock providers configuration - replace with your actual providers


  // Function to get parameters for providers
  const LOCATION_STORAGE_KEY = 'aahaas_selected_location';
  const getProviderParams = (provider) => ({
    latitude: baseLocation?.latitude || 6.9271,
    longitude: baseLocation?.longtitude || 79.8612,
    limit: 60,
    provider: provider,
    radius: 50,
    isCountry: false,
    sortArray: null,
    dataSet: JSON.stringify(baseLocation)
  });


  useEffect(() => {
    console.log("Initializing location on page load...");
    const initializeLocation = () => {


      // Check for stored location first
      const storedLocation = getLocationFromStorage();

      if (storedLocation) {
        console.log('Found stored location, using it:', storedLocation);

        // Use stored location
        setUserSelectedLocation(storedLocation);
        setCurrentLocation(storedLocation);
        setIsUsingGlobalLocation(false);
        setGoogleLocation(storedLocation.address_full?.slice(0, 25) + '...' || 'Custom Location');

        // Load products with stored location immediately
        loadLifestyleProducts(storedLocation);
      } else {
        console.log('No stored location found, will use global location when available');

        // No stored location, use baseLocation when available
        if (baseLocation) {
          console.log('BaseLocation available, using it:', baseLocation);
          setGlobalLocation(baseLocation);
          setCurrentLocation(baseLocation);
          setIsUsingGlobalLocation(true);
          setGoogleLocation('search');

          // Load products with base location
          loadLifestyleProducts(baseLocation);
        }
      }
    };

    initializeLocation();
  }, []);

  // const loadLifestyleProducts = async () => {
  //     try {
  //         // Setup loading state
  //         setLoading(true);
  //         setLoadingPhase(1);
  //         setLoadingProgress(10);
  //         setData([]);
  //         setFilteredData([]);
  //         setBackgroundLoading(true);
  //         setProviderStatus(providers);
  //         setError(null);

  //         // Update progress
  //         setLoadingProgress(20);

  //         // Call the external service function to handle all data fetching
  //         const result = await fetchLifestyleData({
  //             providers,
  //             getProviderParams,
  //             updateLoadingProgress: (progress) => setLoadingProgress(progress),
  //             updateLoadingPhase: (phase) => setLoadingPhase(phase),
  //             updateProviderStatus: (updater) => setProviderStatus(updater),
  //             addData: (newData) => setData((prev) => [...prev, ...newData]),
  //         });

  //         // Handle any errors from the fetch service
  //         if (result.error) {
  //             setError(result.error);
  //             ToastMessage({
  //                 status: "error",
  //                 message: result.error
  //             });
  //         }
  //         setLoadingProgress(90);
  //         handleEducationCategory();
  //         // fetchLocations(result.data);
  //     } catch (err) {
  //         setError(err.message || "An error occurred while loading lifestyle products");
  //         console.error("Error loading lifestyle products:", err);
  //         ToastMessage({
  //             status: "error",
  //             message: "Failed to load lifestyle products. Please try again."
  //         });
  //     } finally {
  //         setLoading(false);
  //         setTimeout(() => {
  //             setLoadingProgress(100);
  //             setTimeout(() => {
  //                 setBackgroundLoading(false);
  //             }, 3000);
  //         }, 500);
  //     }
  // };

  const saveLocationToStorage = (locationData) => {
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(locationData));
      console.log('Location saved to localStorage');
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  };

  const getLocationFromStorage = () => {
    try {
      const locationData = localStorage.getItem(LOCATION_STORAGE_KEY);
      return locationData ? JSON.parse(locationData) : null;
    } catch (error) {
      console.error('Error getting location from localStorage:', error);
      return null;
    }
  };
  const clearLocationFromStorage = () => {
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      console.log('Location cleared from localStorage');
    } catch (error) {
      console.error('Error clearing location from localStorage:', error);
    }
  };


  const getRemainingStorageTime = () => {
    try {
      const expiryTime = localStorage.getItem(LOCATION_EXPIRY_KEY);
      if (!expiryTime) return 0;

      const remaining = parseInt(expiryTime) - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('Error getting remaining storage time:', error);
      return 0;
    }
  };

  const formatRemainingTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [remainingStorageTime, setRemainingStorageTime] = useState(0);

  useEffect(() => {
    // Only use baseLocation if we don't have a stored location
    const storedLocation = getLocationFromStorage();

    if (!storedLocation && baseLocation) {
      console.log('BaseLocation became available, using it:', baseLocation);

      setGlobalLocation(baseLocation);
      setCurrentLocation(baseLocation);
      setIsUsingGlobalLocation(true);
      setGoogleLocation('search');

      // Load products with base location
      loadLifestyleProducts(baseLocation);
    } else if (baseLocation) {
      // Just set global location for reference
      setGlobalLocation(baseLocation);
    }
  }, [baseLocation]);




  const handleTryAgain = () => {
    setSearchObject({
      search: "",
      priceRance: [0, 0],
      location: [],
      subCategory: [],
      distance: 20,
    })

    setSelectedLocation([]);
    setSelectedSubCategory([]);
    setSelectedPrice([]);
    setFilterCheckboxes([]);

    // Reset price filter to full range
    if (pricerange.length >= 2) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
    } else {
      setminprice('');
      setmaxprice('');
    }

    setpricefilter(false);
    setDistance(20); // Reset to default distance

    setUserMinMaxPrice({
      min: pricerange[0] || '',
      max: pricerange[1] || ''
    });
    setSelectedSortMethod('default'); // Reset sort method to default
    handleChange('');
    loadLifestyleProducts(); // Reload products
  }

  const loadLifestyleProducts = async (locationToUse = null) => {
    try {
      // Setup loading state
      setLoading(true);
      setBackgroundLoading(true);
      setLoadingPhase(1);
      setLoadingProgress(10);
      setData([]);
      setFilteredData([]);
      setBackgroundLoading(true);
      setProviderStatus(providers);
      setError(null);

      // Determine which location to use with better fallback logic
      let activeLocation = locationToUse || currentLocation || globalLocation || baseLocation;

      // If still no location, use default Colombo coordinates
      if (!activeLocation) {
        console.warn("No location available, using default Colombo coordinates");
        activeLocation = {
          address_full: "Colombo, Sri Lanka",
          latitude: 6.9271,
          longtitude: 79.8612,
          isCountry: false
        };
      }

      console.log("Loading products with location:", activeLocation);

      // Update progress
      setLoadingProgress(20);

      // Update getProviderParams to use the active location
      const getProviderParamsUpdated = (provider) => ({
        dataSet: JSON.stringify({
          locationDescription: activeLocation?.address_full || "Colombo, Sri Lanka",
          latitude: activeLocation?.latitude || 6.9271,
          longitude: activeLocation?.longtitude || 79.8612,
          place_id: activeLocation?.place_id || "",
          isCountry: activeLocation?.isCountry || false,
          dataSet: JSON.stringify({
            id: activeLocation?.id || null,
            description: activeLocation?.address_full || "Colombo, Sri Lanka",
            latitude: String(activeLocation?.latitude || 6.9271),
            longitude: String(activeLocation?.longtitude || 79.8612),
            place_id: activeLocation?.place_id || "",
            data: "null",
            created_at: activeLocation?.created_at || new Date().toISOString(),
            dataSet: null,
            address_components: activeLocation?.address_components || []
          })
        }),
        isCountry: activeLocation?.isCountry || false,
        latitude: String(activeLocation?.latitude || 6.9271),
        longitude: String(activeLocation?.longtitude || 79.8612),
        page: 1,
        pageSize: 50,
        provider: provider,
        radius: "20",
        sortArray: "",
        vendorId: 0
      });

      // Call the external service function to handle all data fetching
      const result = await fetchLifestyleData({
        providers,
        getProviderParams: getProviderParamsUpdated,
        updateLoadingProgress: (progress) => setLoadingProgress(progress),
        updateLoadingPhase: (phase) => setLoadingPhase(phase),
        updateProviderStatus: (updater) => setProviderStatus(updater),
        addData: (newData) => setData((prev) => [...prev, ...newData]),
      });
      console.log("Fetched lifestyle data:", result);
      // Handle any errors from the fetch service
      if (result.error) {
        setError(result.error);
        ToastMessage({
          status: "error",
          message: result.error
        });
      }
      setLoadingProgress(90);
      handleEducationCategory();
    } catch (err) {
      setError(err.message || "An error occurred while loading lifestyle products");
      console.error("Error loading lifestyle products:", err);
      ToastMessage({
        status: "error",
        message: "Failed to load lifestyle products. Please try again."
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingProgress(100);
        setTimeout(() => {
          setBackgroundLoading(false);
        }, 3000);
      }, 500);
    }
  };
  const handleEducationCategory = async () => {
    axios.get(`/fetch-all-categories`).then((res) => {
              console.log("Fetched subcategories:", res);
      if (res.data.status == 200) {
        const subCategories = res.data.subCategories || [];

        const filteredCategories = subCategories
          .filter((category) => category.maincat_id == 3)
          .map((cat, index) => ({
            id: cat["id"],
            submaincat_type: cat["submaincat_type"],
            image_url: cat["image_url"],
          }));
        setCourseSubCategory(filteredCategories);
      }
    });
  };


  // Process discount data
  const processDiscountData = (products) => {
    const discountData = [];
    products.forEach(item => {
      if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
        discountData.push({
          discount: item.discount,
          product: item
        });
      }
    });
    setAllDiscountData(discountData);
  };

// Update filtered data when main data changes
useEffect(() => {
  if (data.length > 0 && !loading) { 
    // Check if we have pending chatbot filters to apply
    if (pendingChatbotFilters) {
      console.log("Applying pending chatbot filters to new data, data length:", data.length);
      console.log("Pending filters:", pendingChatbotFilters);
      
      setTimeout(() => {
        applyChatbotFiltersToData(pendingChatbotFilters.filterData, pendingChatbotFilters.originalPrompt);
        setPendingChatbotFilters(null); 
      }, 200);
    } else {
      const sortedData = applySortToData(data);
      setFilteredData(sortedData);
    }
    
    fetchLocations(data);
    createPriceFilters(data);
    processDiscountData(data);
    
    // Set loading to false only after all data processing is complete
    setLoading(false);
    setBackgroundLoading(false);
  }
}, [data, loading]);
  // Load products on component mount
  //     useEffect(() => {
  //        if (baseLocation) {
  //         setGlobalLocation(baseLocation); // Store the original global location
  //         setCurrentLocation(baseLocation); // Set it as current location initially
  //         setIsUsingGlobalLocation(true);
  //     }
  //         // loadLifestyleProducts();
  //     }, [baseLocation]);

  //     useEffect(() => {
  //     if (currentLocation) {
  //         loadLifestyleProducts();
  //     }
  // }, [currentLocation]);

  useEffect(() => {
    // Only use baseLocation if we don't have a stored location and no current location is set
    const storedLocation = getLocationFromStorage();

    if (!storedLocation && !currentLocation && baseLocation) {
      console.log('BaseLocation became available, using it:', baseLocation);

      setGlobalLocation(baseLocation);
      setCurrentLocation(baseLocation);
      setIsUsingGlobalLocation(true);
      setGoogleLocation('search');

      // Load products with base location
      loadLifestyleProducts(baseLocation);
    } else if (!storedLocation && baseLocation) {
      // Just set global location for reference, but don't change current location
      setGlobalLocation(baseLocation);
    }
  }, [baseLocation]);

  // Handle search query from parent component (home page)
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== '') {
      console.log('Received search query from parent:', searchQuery);
      handleChange(searchQuery);
    } else if (searchQuery === '') {
      // When search is cleared, reload original products
      console.log('Search query cleared from parent, reloading original products');
      handleClearSearchData();
    }
  }, [searchQuery]);

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="row mx-0 mt-4 margin-default">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="col-xl-3 col-lg-4 col-6">
          <PostLoader />
        </div>
      ))}
    </div>
  );


  //price filter functions


  const handleMinMaxPrice = (e) => {
    const { name, value } = e.target;

    // Convert the display value back to base currency for storage
    const baseValue = convertFromDisplayCurrency(value, baseCurrencyValue, tempCurrency);

    setUserMinMaxPrice({
      ...userMinMaxPrice,
      [name]: baseValue,
    });
  };

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  }

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  }

  const toggleSubFilter = () => {
    setopenSideBarStatus(!openSideBarStatus);
  }

  const openSearchFilter = () => {
    setSearchfilter(true);
  }

  const fetchLocations = async (dataset) => {
    let fetchedLocations = [];
    dataset.forEach((value) => {
      const city = value.lifestyle_city.toLowerCase().trim();
      if (!fetchedLocations.includes(city)) {
        fetchedLocations.push(city);
      }
    });
    setLocations(fetchedLocations.sort()); // Sorting the locations after fetching
  };

  const createPriceFilters = async (dataset) => {
    console.log("Processing dataset:", dataset);
    console.log("Base currency value:", baseCurrencyValue);

    // If dataset is empty, set empty filters and return
    if (!dataset || dataset.length === 0) {
      setFilterByPriceButtons([]);
      setminprice(0);
      setmaxprice(0);
      setpricerange([0, 0]);
      return;
    }

    // Get valid currencies, with fallback
    const validCurrencies = Object.keys(baseCurrencyValue?.rates || {});
    const baseCurrency = baseCurrencyValue?.base || 'USD';

    // FIXED: Same price extraction logic as filtering
    const getSafePrice = (item) => {
      let price = 0;

      // Check if both adult_rate and child_rate are "0.00", then use package_rate
      if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
        (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
        item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {

        price = item.package_rate;

      }
      // Use adult_rate if it's not zero
      else if (item.adult_rate != null && item.adult_rate !== undefined &&
        item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {

        price = item.adult_rate;

      }
      // Check for bridgify provider with default_rate
      else if (item.provider === "bridgify" && item.default_rate != null &&
        item.default_rate !== undefined && item.default_rate !== 0) {

        price = item.default_rate;

      }
      // Fallback to package_rate
      else if (item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {

        price = item.package_rate;

      }
      // Last resort - use default_rate
      else if (item.default_rate != null && item.default_rate !== undefined && item.default_rate !== 0) {

        price = item.default_rate;

      }

      // Convert string to number and ensure it's valid
      const numPrice = Number(price);
      return isNaN(numPrice) ? 0 : numPrice;
    };

    // Helper function to convert currency with better error handling
    const convertCurrency = (currency, amount, baseCurrencyValue) => {
      try {
        // If currency is the same as base, return amount directly
        if (currency === baseCurrency) {
          return Number(amount) || 0;
        }

        // If currency is not in valid currencies list, treat as base currency
        if (!validCurrencies.includes(currency)) {
          console.warn(`Currency ${currency} not found in rates, treating as ${baseCurrency}`);
          return Number(amount) || 0;
        }

        // Use your existing converter function
        const converted = CurrencyConverterOnlyRateWithoutDecimal(currency, amount, baseCurrencyValue);
        return Number(converted) || 0;
      } catch (error) {
        console.error('Currency conversion error:', error);
        return Number(amount) || 0;
      }
    };

    // Filter out items with zero prices and prepare for sorting
    const itemsWithPrices = dataset
      .map(item => {
        const price = getSafePrice(item);
        const currency = item.currency || baseCurrency;
        const convertedPrice = convertCurrency(currency, price, baseCurrencyValue);

        return {
          ...item,
          originalPrice: price,
          convertedPrice: convertedPrice,
          effectiveCurrency: currency
        };
      })
      .filter(item => item.convertedPrice > 0); // Remove items with zero or invalid prices

    console.log("Items with converted prices:", itemsWithPrices.slice(0, 3)); // Log first 3 for debugging

    // If no valid items after filtering, set default values
    if (!itemsWithPrices.length) {
      console.warn("No items with valid prices found");
      setFilterByPriceButtons([]);
      setminprice(0);
      setmaxprice(0);
      setpricerange([0, 0]);
      return;
    }

    // Sort by converted price
    const sortedItems = itemsWithPrices.sort((a, b) => a.convertedPrice - b.convertedPrice);

    // Get min and max prices
    const minPrice = sortedItems[0].convertedPrice;
    const maxPrice = sortedItems[sortedItems.length - 1].convertedPrice;

    console.log("Price range:", { minPrice, maxPrice });

    // Create price ranges
    let result = createPriceSteps(minPrice, maxPrice);

    // Handle edge case where min and max are the same
    if (minPrice === maxPrice || result.length === 0) {
      result = [{ start: minPrice, end: maxPrice || minPrice }];
    }

    // Set state values
    const rangeStart = result[0].start;
    const rangeEnd = result[result.length - 1].end;

    setpricerange([rangeStart, rangeEnd]);
    setFilterByPriceButtons(result);
    setTempCurrency(baseCurrency);

    setUserMinMaxPrice({
      min: rangeStart,
      max: rangeEnd
    });

    if (!pricefilter) {
      setpricefilter(false);
      setminprice(rangeStart);
      setmaxprice(rangeEnd);
    }

    console.log("Final price filter setup:", {
      priceRange: [rangeStart, rangeEnd],
      filterButtons: result.length,
      currency: baseCurrency
    });
  };

  const handlePriceFilterChange = async (value) => {
    console.log("Selected price range:", value);
    setpricefilter(true);
    setminprice(value.start);
    setmaxprice(value.end);
    setUserSearchQuery('');

    // Update user input fields to match selected range
    setUserMinMaxPrice({
      min: value.start,
      max: value.end
    });
    setSearchObject({
      ...searchObject,
      priceRance: [value.start, value.end],
    })
  };

  const handleClearAllFilters = async () => {
    setSearchObject({
      search: "",
      priceRance: [0, 0],
      location: [],
      subCategory: [],
      distance: 20,
    });

    setSelectedLocation([]);
    setSelectedSubCategory([]);
    setSelectedPrice([]);
    setFilterCheckboxes([]);

    // Reset price filter to full range
    if (pricerange.length >= 2) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
    } else {
      setminprice('');
      setmaxprice('');
    }

    setpricefilter(false);
    setDistance(20);

    setUserMinMaxPrice({
      min: pricerange[0] || '',
      max: pricerange[1] || ''
    });

    handleChange('');

    // Clear active chatbot filters
    
    // setActiveChatbotFilters(null);

    // Apply current sort to the original data instead of just setting it
    if(!activeChatbotFilters){
         const sortedData = applySortToData(data);
    setFilteredData(sortedData);
    }
 
  };

const [clearAIFiltersTrigger, setClearAIFiltersTrigger] = useState(false);

const handleClearChatbotFilters = () => {
  setActiveChatbotFilters(null);
  handleClearSearchData();
  const sortedData = applySortToData(data);
  setFilteredData(sortedData);

  // 🔥 Trigger clear for chatbot
  setClearAIFiltersTrigger(prev => !prev);

  ToastMessage({
    status: "info",
    message: "AI filters cleared"
  });
};


  // Render empty state
  const renderEmptyState = () => (
    <Col xs="12">
      <div className="my-5">
        <div className="col-sm-12 empty-cart-cls text-center">
          <img
            alt='No products available'
            src='/assets/images/ErrorImages/file.png'
            className="img-fluid mb-4 mx-auto"
          />
          <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
            Sorry, there are no lifestyle products available right now.
          </h4>
          <h4 style={{ fontSize: 15 }}>
            Please check back later or explore other options.
          </h4>
          <button
            className="btn btn-solid mt-3"
            onClick={handleTryAgain}
          >
            Try Again
          </button>
        </div>
      </div>
    </Col>
  );

  const handleChange = async (query) => {
    setUserSearchQuery(query);
    try {
      if (query === '' || query == undefined) {
        setFilteredData(data);
      } else {
        if (data.length === 0) {
          let searchLifeStyles = data.filter((lifeStyle) => {
            if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
              return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
            }
          });
          setFilteredData(searchLifeStyles);
        } else {
          let searchLifeStyles = data.filter((lifeStyle) => {
            if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
              return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
            }
          });
          setFilteredData(searchLifeStyles);
        }
      }
    } catch (error) {
      setData([])
    }
  }

  const handleHeaderSearch = (searchQuery) => {
    handleChange(searchQuery);
  };


  const handleOnCourseCategoryChange = (value, displayName) => {
    setUserSearchQuery('');

    // Check if selectedSubCategory already has this value
    const isExist = selectedSubCategory?.[0] === value;
    console.log(isExist, selectedSubCategory, value, displayName, "Is Existing Data is");
    // Always update the selectedSubCategory with the new value


    // console.log(isExist, "Is Existing Data is");

    if (!isExist) {
      setSelectedSubCategory([value]);
      // This is a new selection, so update filters
      const dataset = { value, type: "sub_category", displayName };
      console.log(dataset, "Dataset is");
      const sampledataset = [dataset];
      setFilterCheckboxes(sampledataset);

      // console.log(value, "Data value is");

      setBackEndFilters({
        ...backEndFilters,
        category1: value,
      });

      setSearchObject({
        ...searchObject,
        subCategory: [value],
      });
      //   fetchFilteredData(value);


    } else {
      // This is a de-selection, so clear filters
      setFilterCheckboxes([]);
      setSelectedSubCategory([]);
      setBackEndFilters({
        ...backEndFilters,
        category1: 0,
      });

      setSearchObject({
        ...searchObject,
        subCategory: [],
      });
    }

    // Scroll to top when category changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleOnPriceChange = () => {
    setSearchObject({
      ...searchObject,
      priceRance: [0, 0],
    });
    setSelectedPrice([]);
    setpricefilter(false);
    if (pricerange.length >= 2) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
    } else {
      setminprice('');
      setmaxprice('');
    }

    setpricefilter(false);
    // setFilterByPriceButtons([])
  }

  const handleLocationChange = async (value) => {
    const index = selectedLocation.indexOf(value)
    let newLocations = [...selectedLocation]
    if (index === -1) {
      newLocations.unshift(value);
    } else {
      newLocations.splice(index, 1);
    }
    setSearchObject({
      ...searchObject,
      location: newLocations,
    })
    setSelectedLocation(newLocations);
  }

  const handleSearchPriceRange = () => {
    setUserSearchQuery('');

    const regex = /^\d+(\.\d+)?$/; // Allow decimal numbers

    if (regex.test(userMinMaxPrice.min) && regex.test(userMinMaxPrice.max)) {
      // Use display values directly (since input is in display currency)
      const minPriceDisplay = Number(userMinMaxPrice.min);
      const maxPriceDisplay = Number(userMinMaxPrice.max);

      // Convert to base currency for comparison with pricerange
      const minPriceBase = convertFromDisplayCurrency(minPriceDisplay, baseCurrencyValue, tempCurrency);
      const maxPriceBase = convertFromDisplayCurrency(maxPriceDisplay, baseCurrencyValue, tempCurrency);

      if (minPriceDisplay > maxPriceDisplay) {
        ToastMessage({
          status: "warning",
          message: 'Please ensure that the minimum price is lower than the maximum price.'
        });
        return;
      } else if (minPriceDisplay < 0 || maxPriceDisplay < 0) {
        ToastMessage({
          status: "warning",
          message: 'Price values cannot be negative.'
        });
        return;
      } else if (minPriceDisplay === 0 && maxPriceDisplay === 0) {
        ToastMessage({
          status: "warning",
          message: 'Please enter a valid price range.'
        });
        return;
      }

      // Check against price range in base currency
      if (pricerange.length >= 2) {
        const minRangeDisplay = convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency);
        const maxRangeDisplay = convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency);

        if (minPriceDisplay < minRangeDisplay || maxPriceDisplay > maxRangeDisplay) {
          ToastMessage({
            status: "warning",
            message: `Price range should be between ${minRangeDisplay} and ${maxRangeDisplay}.`
          });
          return;
        }
      }

      // Use base currency values for internal state
      setminprice(minPriceBase);
      setmaxprice(maxPriceBase);
      setpricefilter(true);
      setSearchObject({
        ...searchObject,
        priceRance: [minPriceBase, maxPriceBase],
      });
    } else {
      ToastMessage({
        status: "warning",
        message: 'Please enter valid numeric values for price range.'
      });
    }
  };
  const closeSearchFilter = () => {
    setSearchfilter(false);
    handleChange('')
  }
  const manageUserSelectFilters = () => {
    // Start with the original data for filtering
    const filtered = data.filter(product => {
      // 1. Search filter
      if (userSearchQuery && userSearchQuery.trim() !== '') {
        if (!product.lifestyle_name.toLowerCase().includes(userSearchQuery.toLowerCase())) {
          return false;
        }
      }

      // 2. Price range filter
      if (searchObject.priceRance[0] > 0 || searchObject.priceRance[1] > 0) {
        // Use the same price extraction logic as createPriceFilters
        const getSafePrice = (item) => {
          let price = 0;

          if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
            (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
            item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
            price = item.package_rate;
          } else if (item.adult_rate != null && item.adult_rate !== undefined &&
            item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {
            price = item.adult_rate;
          } else if (item.provider === "bridgify" && item.default_rate != null &&
            item.default_rate !== undefined && item.default_rate !== 0) {
            price = item.default_rate;
          } else if (item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
            price = item.package_rate;
          } else if (item.default_rate != null && item.default_rate !== undefined && item.default_rate !== 0) {
            price = item.default_rate;
          }

          const numPrice = Number(price);
          return isNaN(numPrice) ? 0 : numPrice;
        };

        const productPrice = getSafePrice(product);

        // Convert price to base currency if needed
        let convertedPrice = productPrice;
        if (product.currency && product.currency !== tempCurrency) {
          convertedPrice = CurrencyConverterOnlyRateWithoutDecimal(
            product.currency,
            productPrice,
            baseCurrencyValue
          );
        }

        const minPrice = searchObject.priceRance[0];
        const maxPrice = searchObject.priceRance[1];

        if (minPrice > 0 && convertedPrice < minPrice) {
          return false;
        }
        if (maxPrice > 0 && convertedPrice > maxPrice) {
          return false;
        }
      }

      // 3. Sub category filter
      if (searchObject.subCategory.length > 0) {
        const productCategory = parseInt(product.category_2) || 0;
        const matchesSubCategory = searchObject.subCategory.some(selectedCategory =>
          productCategory === parseInt(selectedCategory)
        );
        if (!matchesSubCategory) {
          return false;
        }
      }

      // 4. Location filter
      if (searchObject.location.length > 0) {
        const productLocation = product.lifestyle_city?.toLowerCase().trim() || '';
        const matchesLocation = searchObject.location.some(selectedLocation =>
          productLocation === selectedLocation.toLowerCase().trim()
        );
        if (!matchesLocation) {
          return false;
        }
      }

      // 5. Distance filter
      if (searchObject.distance && searchObject.distance !== 20) {
        const productDistance = parseFloat(product.distance) || 0;
        const roundedDistance = Math.round(productDistance);
        const maxDistance = parseInt(searchObject.distance);

        if (roundedDistance > maxDistance) {
          return false;
        }
      }

      return true;
    });

    // Apply the current sort method to the filtered data
    const sortedAndFiltered = applySortToData(filtered);

    setFilteredData(sortedAndFiltered);
    console.log("Filtered and sorted products:", sortedAndFiltered.length);
  };

  // const applySortToData = (dataToSort) => {
  //   if (!dataToSort || dataToSort.length === 0) return [];

  //   let sortedData = [...dataToSort]; // Create a copy

  //   switch (selectedSortMethod) {
  //     case 'default':
  //       // For default, sort by triggers (featured first)
  //       sortedData = sortedData.sort((a, b) => {
  //         const triggersA = parseInt(a.triggers) || 0;
  //         const triggersB = parseInt(b.triggers) || 0;
  //         return triggersB - triggersA;
  //       });
  //       break;

  //     case 'featured':
  //       sortedData = sortedData.sort((a, b) => {
  //         const triggersA = parseInt(a.triggers) || 0;
  //         const triggersB = parseInt(b.triggers) || 0;
  //         return triggersB - triggersA;
  //       });
  //       break;

  //     case 'newArrival':
  //       sortedData = sortedData.sort((a, b) => {
  //         const dateA = new Date(a.created_at || 0);
  //         const dateB = new Date(b.created_at || 0);
  //         return dateB - dateA;
  //       });
  //       break;

  //     case 'priceLH':
  //       sortedData = sortedData.sort((a, b) => {
  //         const priceA = parseFloat(a.default_rate) || 0;
  //         const priceB = parseFloat(b.default_rate) || 0;
  //         return priceA - priceB;
  //       });
  //       break;

  //     case 'priceHL':
  //       sortedData = sortedData.sort((a, b) => {
  //         const priceA = parseFloat(a.default_rate) || 0;
  //         const priceB = parseFloat(b.default_rate) || 0;
  //         return priceB - priceA;
  //       });
  //       break;

  //     case 'distanceLH':
  //       sortedData = sortedData.sort((a, b) => {
  //         const distanceA = parseFloat(a.distance) || 0;
  //         const distanceB = parseFloat(b.distance) || 0;
  //         return distanceA - distanceB;
  //       });
  //       break;

  //     case 'distanceHL':
  //       sortedData = sortedData.sort((a, b) => {
  //         const distanceA = parseFloat(a.distance) || 0;
  //         const distanceB = parseFloat(b.distance) || 0;
  //         return distanceB - distanceA;
  //       });
  //       break;

  //     default:
  //       // Keep original order for unknown sort methods
  //       break;
  //   }

  //   return sortedData;
  // };
// In LifestyleProducts.js, update the applySortToData function:

// In LifestyleProducts.js, update the applySortToData function:

const applySortToData = (dataToSort, sortMethod) => {
  if (!dataToSort || dataToSort.length === 0) return [];
  
  // Use selectedSortMethod if no sortMethod is provided
  const effectiveSortMethod = sortMethod || selectedSortMethod;

  let sortedData = [...dataToSort]; // Create a copy

  // Optimized helper function to get the actual price 
  const getSafePrice = (item) => {
    if (!item) return 0;
    
    // Helper function to safely convert to number and check validity
    const safeNumber = (value) => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    // Helper function to check if a price is valid (not zero or empty)
    const isValidPrice = (value) => {
      const num = safeNumber(value);
      return num > 0;
    };
    
    // Priority order: adult_rate -> package_rate -> default_rate -> child_rate
    // For bridgify, prioritize default_rate
    if (item.provider === "bridgify" && isValidPrice(item.default_rate)) {
      return safeNumber(item.default_rate);
    }
    
    if (isValidPrice(item.adult_rate)) {
      return safeNumber(item.adult_rate);
    }
    
    if (isValidPrice(item.package_rate)) {
      return safeNumber(item.package_rate);
    }
    
    if (isValidPrice(item.default_rate)) {
      return safeNumber(item.default_rate);
    }
    
    if (isValidPrice(item.child_rate)) {
      return safeNumber(item.child_rate);
    }

    return 0;
  };

  // Helper function to check if product is free AND from Aahaas
  const isProductFree = (product) => {
    if (!product) return false;
    
    // Check if product is from Aahaas provider
    const isAahaasProvider = product.provider === "aahaas";
    if (!isAahaasProvider) return false;
    
    const price = getSafePrice(product);
    return price === 0;
  };

  // Add convertCurrency function here inside applySortToData
  const convertCurrency = (currency, amount) => {
    try {
      // Ensure amount is a valid number
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return 0;
      }

      // If no currency provided, use base currency
      if (!currency) {
        currency = baseCurrencyValue?.base || 'USD';
      }

      // If currency is the same as base, return amount directly
      if (currency === baseCurrencyValue?.base) {
        return numAmount;
      }

      // Check if we have valid base currency data
      if (!baseCurrencyValue || !baseCurrencyValue.rates) {
        return numAmount; // Fallback to original amount
      }

      // Get valid currencies
      const validCurrencies = Object.keys(baseCurrencyValue.rates);
      
      // If currency is not in valid currencies list, treat as base currency
      if (!validCurrencies.includes(currency)) {
        return numAmount;
      }

      // Use the existing converter function
      const converted = CurrencyConverterOnlyRateWithoutDecimal(currency, numAmount, baseCurrencyValue);
      const convertedNum = Number(converted);
      
      return isNaN(convertedNum) ? numAmount : convertedNum;
    } catch (error) {
      console.error("Currency conversion error:", error);
      return Number(amount) || 0;
    }
  };

  switch (effectiveSortMethod) {
    case 'default':
    case 'featured':
      // For default and featured, sort by triggers (featured first)
      sortedData = sortedData.sort((a, b) => {
        const triggersA = parseInt(a.triggers) || 0;
        const triggersB = parseInt(b.triggers) || 0;
        return triggersB - triggersA;
      });
      break;

    case 'newArrival':
      sortedData = sortedData.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });
      break;

    case 'freeProducts':
      // Filter and show only free products from Aahaas
      sortedData = sortedData.filter(item => isProductFree(item));
      
      // Then sort free products by triggers (featured free products first)
      sortedData = sortedData.sort((a, b) => {
        const triggersA = parseInt(a.triggers) || 0;
        const triggersB = parseInt(b.triggers) || 0;
        return triggersB - triggersA;
      });
      break;

    case 'priceLH':
      // Sort all products by price (low to high), free products will naturally come first
      sortedData = sortedData.sort((a, b) => {
        // Check if both are free
        const isAFree = isProductFree(a);
        const isBFree = isProductFree(b);
        
        // Both free: sort by triggers
        if (isAFree && isBFree) {
          const triggersA = parseInt(a.triggers) || 0;
          const triggersB = parseInt(b.triggers) || 0;
          return triggersB - triggersA;
        }
        
        // Only A is free: A comes first
        if (isAFree) return -1;
        
        // Only B is free: B comes first
        if (isBFree) return 1;
        
        // Neither is free: sort by price
        const priceA = getSafePrice(a);
        const priceB = getSafePrice(b);
        
        const convertedPriceA = convertCurrency(a.currency || baseCurrencyValue?.base, priceA);
        const convertedPriceB = convertCurrency(b.currency || baseCurrencyValue?.base, priceB);
        
        const finalPriceA = isNaN(convertedPriceA) ? 0 : convertedPriceA;
        const finalPriceB = isNaN(convertedPriceB) ? 0 : convertedPriceB;
        
        return finalPriceA - finalPriceB;
      });
      break;

    case 'priceHL':
      // Sort all products by price (high to low), free products will come last
      sortedData = sortedData.sort((a, b) => {
        // Check if both are free
        const isAFree = isProductFree(a);
        const isBFree = isProductFree(b);
        
        // Both free: sort by triggers
        if (isAFree && isBFree) {
          const triggersA = parseInt(a.triggers) || 0;
          const triggersB = parseInt(b.triggers) || 0;
          return triggersB - triggersA;
        }
        
        // Only A is free: A comes last
        if (isAFree) return 1;
        
        // Only B is free: B comes last
        if (isBFree) return -1;
        
        // Neither is free: sort by price (high to low)
        const priceA = getSafePrice(a);
        const priceB = getSafePrice(b);
        
        const convertedPriceA = convertCurrency(a.currency || baseCurrencyValue?.base, priceA);
        const convertedPriceB = convertCurrency(b.currency || baseCurrencyValue?.base, priceB);
        
        const finalPriceA = isNaN(convertedPriceA) ? 0 : convertedPriceA;
        const finalPriceB = isNaN(convertedPriceB) ? 0 : convertedPriceB;
        
        return finalPriceB - finalPriceA; // High to Low
      });
      break;

    case 'distanceLH':
      sortedData = sortedData.sort((a, b) => {
        // Free products first, then by distance
        const isAFree = isProductFree(a);
        const isBFree = isProductFree(b);
        
        if (isAFree && !isBFree) return -1;
        if (!isAFree && isBFree) return 1;
        if (isAFree && isBFree) {
          const triggersA = parseInt(a.triggers) || 0;
          const triggersB = parseInt(b.triggers) || 0;
          return triggersB - triggersA;
        }
        
        const distanceA = parseFloat(a.distance) || 0;
        const distanceB = parseFloat(b.distance) || 0;
        return distanceA - distanceB;
      });
      break;

    case 'distanceHL':
      sortedData = sortedData.sort((a, b) => {
        // Free products first, then by distance (high to low)
        const isAFree = isProductFree(a);
        const isBFree = isProductFree(b);
        
        if (isAFree && !isBFree) return -1;
        if (!isAFree && isBFree) return 1;
        if (isAFree && isBFree) {
          const triggersA = parseInt(a.triggers) || 0;
          const triggersB = parseInt(b.triggers) || 0;
          return triggersB - triggersA;
        }
        
        const distanceA = parseFloat(a.distance) || 0;
        const distanceB = parseFloat(b.distance) || 0;
        return distanceB - distanceA;
      });
      break;

    default:
      // Keep original order for unknown sort methods
      break;
  }

  return sortedData;
};


// Async sorting function to prevent UI freezing
const performAsyncSort = (dataToSort, sortMethod) => {
  return new Promise((resolve) => {
    const CHUNK_SIZE = 100; // Process in chunks of 100 items
    
    if (!dataToSort || dataToSort.length === 0) {
      resolve([]);
      return;
    }

    // For small datasets, use regular sorting
    if (dataToSort.length <= CHUNK_SIZE) {
      const result = applySortToData(dataToSort, sortMethod);
      resolve(result);
      return;
    }

    // For large datasets, use web worker-like chunked processing
    let sortedData = [...dataToSort];
    
    const processChunk = (index = 0) => {
      const start = index;
      const end = Math.min(start + CHUNK_SIZE, sortedData.length);
      
      // Process this chunk
      if (start < sortedData.length) {
        // Use setTimeout to yield control back to the browser
        setTimeout(() => {
          if (index === 0) {
            // On first chunk, apply full sorting
            sortedData = applySortToData(sortedData, sortMethod);
            resolve(sortedData);
          } else {
            processChunk(end);
          }
        }, 0);
      } else {
        resolve(sortedData);
      }
    };
    
    processChunk();
  });
};

  useEffect(() => {
    manageUserSelectFilters();
    console.log("Search object updated:", searchObject);
  }, [selectedSubCategory, minprice, maxprice, distance, searchObject, backEndFilters]);


const handleSelectChange = async (selectedOption) => {
  // Set loading state immediately
  setIsSorting(true);
  setSelectedSortMethod(selectedOption.value);
  
  // If switching from freeProducts to other sort methods, ensure we're working with full dataset
  if (selectedOption.value !== 'freeProducts') {
    // Make sure we're using the full dataset, not just free products
    const dataToSort = data; // Use original full dataset
    setFilteredData(applySortToData(dataToSort, selectedOption.value));
  } else {
    // For freeProducts, apply the filter and sort
    const sortedData = await performAsyncSort(data, selectedOption.value); // Use original data, not filteredData
    setFilteredData(sortedData);
  }
  
  setIsSorting(false);
};
  const handleSortChange = async () => {
    if (isSorting) return; // Prevent multiple simultaneous sorts
    
    setIsSorting(true);
    console.log("Current sort method:", selectedSortMethod);
    console.log("Total products before sorting:", filteredData.length);

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      try {
        // Apply sorting to the currently filtered data
        const sortedData = applySortToData(filteredData);

        console.log("Products after sorting:", sortedData.length);
        console.log("Sort method applied successfully:", selectedSortMethod);

        setFilteredData(sortedData);
      } catch (error) {
        console.error("Error during sorting:", error);
      } finally {
        setIsSorting(false);
      }
    }, 10); // Small delay to allow UI to update
  };


  useEffect(() => {
    // Only apply sorting if we have data and we're not currently sorting
    if (filteredData && filteredData.length > 0 && !isSorting) {
      handleAsyncSortChange();
    }
  }, [selectedSortMethod]);

  const handleAsyncSortChange = async () => {
    if (isSorting) return; // Prevent multiple simultaneous sorts
    
    setIsSorting(true);
    
    try {
      const sortedData = await performAsyncSort(filteredData, selectedSortMethod);
      setFilteredData(sortedData);
    } catch (error) {
      console.error("Error during async sorting:", error);
    } finally {
      setIsSorting(false);
    }
  };

  // Render error state
  const renderErrorState = () => (
    <Col xs="12">
      <div className="my-5">
        <div className="col-sm-12 empty-cart-cls text-center">
          <img
            alt='Error loading products'
            src='/assets/images/ErrorImages/error.png'
            className="img-fluid mb-4 mx-auto"
          />
          <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
            Oops! Something went wrong
          </h4>
          <h4 style={{ fontSize: 15 }}>
            {error || "Unable to load lifestyle products"}
          </h4>
          <button
            className="btn btn-solid mt-3"
            onClick={loadLifestyleProducts}
          >
            Retry
          </button>
        </div>
      </div>
    </Col>
  );


  const handleOnGoogleLocationChange = (value) => {
    setGoogleLocation(value['label'].slice(0, 25) + '...');

    geocodeByPlaceId(value['value']['place_id'])
      .then(results => getLatLng(results[0]))
      .then(({ lat, lng }) => {
        geocodeByLatLng({ lat: lat, lng: lng })
          .then(async results => {
            const newLocation = {
              address_full: value['label'],
              latitude: lat,
              longtitude: lng,
              address_components: results[0].address_components,
              savedAt: new Date().toISOString()
            };

            // Save to localStorage (no expiry)
            saveLocationToStorage(newLocation);

            // Update states
            setUserSelectedLocation(newLocation);
            setCurrentLocation(newLocation);
            setIsUsingGlobalLocation(false);

            console.log("Selected and saved new location:", newLocation);

            // Reload products with new location
            loadLifestyleProducts(newLocation);
          })
          .catch((error) => {
            console.error("Geocoding error:", error);
            setLoading(false);
            ToastMessage({
              status: "error",
              message: "Failed to get location details"
            });
          });
      })
      .catch((error) => {
        console.error("Place details error:", error);
        setLoading(false);
        ToastMessage({
          status: "error",
          message: "Failed to get place details"
        });
      });
  };


  const handleClearSearchData = async () => {
    console.log("Clearing location search, reverting to global location");

    // Clear from localStorage
    clearLocationFromStorage();

    // Use globalLocation if available, otherwise use baseLocation
    const fallbackLocation = globalLocation || baseLocation;

    if (fallbackLocation) {
      console.log("Reverting to fallback location:", fallbackLocation);

      // Reset to global/base location
      setCurrentLocation(fallbackLocation);
      setUserSelectedLocation(null);
      setIsUsingGlobalLocation(true);
      setGoogleLocation('search');

      // Reload products with fallback location
      await loadLifestyleProducts(fallbackLocation);

      // ToastMessage({
      //   status: "success",
      //   message: "Location reset to global location"
      // });
    } else {
      console.error("No fallback location available");
      ToastMessage({
        status: "error",
        message: "No default location available"
      });
    }
  };

  const uniqueLifestyles = (arrayData) => {
    const uniqueMap = new Map();

    if (!Array.isArray(arrayData) || arrayData.length === 0) {
      return [];
    }

    const uniqueItems = arrayData.filter((item) => {
      if (!item.lifestyle_id) {
        return false;
      }

      const isDuplicate = uniqueMap.has(item.lifestyle_id);

      if (!isDuplicate) {
        uniqueMap.set(item.lifestyle_id, true);
        return true;
      }

      return false;
    });

    // Don't apply additional sorting here since data is already sorted
    // The sort order should be preserved from the filtered data
    return uniqueItems;
  };


  const [screenWidth, setScreenWidth] = useState(0);
  const [isSubcategoriesSticky, setIsSubcategoriesSticky] = useState(false);

  useEffect(() => {
    // Set initial width
    setScreenWidth(window.innerWidth);

    // Handle resize
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sticky subcategories scroll handler - triggers when reaching product-filter-content level
  useEffect(() => {
    const handleScroll = () => {
      const productFilterElement = document.querySelector('.product-filter-content');
      const subcategoriesElement = document.querySelector('.subcategories-horizontal-wrapper');
      
      if (productFilterElement && subcategoriesElement) {
        const filterRect = productFilterElement.getBoundingClientRect();
        
        // Make subcategories sticky when product-filter-content reaches the top of viewport
        if (filterRect.top <= 80 && !isSubcategoriesSticky) {
          setIsSubcategoriesSticky(true);
        } else if (filterRect.top > 80 && isSubcategoriesSticky) {
          setIsSubcategoriesSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSubcategoriesSticky]);

  const convertFromDisplayCurrency = (amount, baseCurrencyValue, tempCurrency) => {
    try {
      if (amount === '' || amount === null || amount === undefined || isNaN(amount)) return '';

      const numAmount = Number(amount);
      // Allow 0 as a valid value
      if (numAmount === 0) return 0;

      // If tempCurrency is the same as base currency, no conversion needed
      if (tempCurrency === baseCurrencyValue?.base) {
        return numAmount;
      }

      // Get the rate for the display currency
      const rate = baseCurrencyValue?.rates?.[tempCurrency];
      if (!rate) return numAmount;

      // Convert back to base currency (divide by rate)
      return (numAmount / rate);
    } catch (error) {
      console.error('Reverse currency conversion error:', error);
      return amount;
    }
  };

  const convertToDisplayCurrency = (amount, baseCurrencyValue, tempCurrency) => {
    try {
      if (amount === '' || amount === null || amount === undefined || isNaN(amount)) return '';

      // Allow 0 as a valid value
      const result = CurrencyConverterOnlyRateWithoutDecimal(tempCurrency, amount, baseCurrencyValue);
      return result !== undefined && result !== null ? result : amount;
    } catch (error) {
      console.error('Display currency conversion error:', error);
      return amount;
    }
  };

  // Helper function to apply chatbot filters to existing data
  const applyChatbotFiltersToData = (filterData, originalPrompt) => {
    console.log("Applying chatbot filters to data:", filterData, originalPrompt);
    console.log("Current data state length:", data.length);
    console.log("Loading state:", loading);
    
    // If still loading or data is empty, we can't apply filters
    if (loading) {
      console.warn("Cannot apply chatbot filters: still loading");
      return;
    }
    
    if (!data || data.length === 0) {
      console.warn("Cannot apply chatbot filters: data is empty");
      ToastMessage({
        status: "warning",
        message: "No products available to filter"
      });
      return;
    }
    
    try {
      // Helper function to get clean search text from lifestyle item
      const getCleanSearchText = (item) => {
        const searchableFields = [
          item.lifestyle_name || '',
          item.lifestyle_description || '',
          item.lifestyle_city || '',
          item.category_name || '',
          item.submaincat_type || ''
        ];
        return searchableFields.join(' ').toLowerCase().trim();
      };

      // Helper function to check for exact word matching
      const hasExactWordMatch = (text, keyword) => {
        const words = text.split(/\s+/);
        return words.some(word => word.includes(keyword));
      };

      // Apply chatbot filters to the data - create a fresh copy
      let filteredResults = JSON.parse(JSON.stringify(data)); // Deep copy to avoid reference issues
      console.log("Starting with filteredResults length:", filteredResults.length);

      // Apply keyword filtering if primaryKeywords exist
      if (filterData?.primaryKeywords && filterData.primaryKeywords.length > 0) {
        console.log("Applying keyword filter with keywords:", filterData.primaryKeywords);
        const beforeKeywordFilter = filteredResults.length;
        
        filteredResults = filteredResults.filter((item) => {
          const searchText = getCleanSearchText(item);
          
          // Check if item matches primary keywords with exact word matching
          return filterData.primaryKeywords.some((keyword) => {
            const cleanKeyword = keyword.toLowerCase().trim();
            return hasExactWordMatch(searchText, cleanKeyword);
          });
        });
        
        console.log(`Keyword filter: ${beforeKeywordFilter} -> ${filteredResults.length} products`);
      }

      // Apply price range filtering if priceRange exists
      if (filterData?.priceRange && filterData.priceRange !== 'Any') {
        console.log("Applying price filter with range:", filterData.priceRange);
        const beforePriceFilter = filteredResults.length;
        
        const priceRange = filterData.priceRange;
        let minPrice = 0;
        let maxPrice = Infinity;

        // Parse price range string (e.g., "0-100", "200+", "0-50")
        if (priceRange.includes('-')) {
          const [min, max] = priceRange.split('-').map(p => parseFloat(p) || 0);
          minPrice = min;
          maxPrice = max;
        } else if (priceRange.includes('+')) {
          minPrice = parseFloat(priceRange.replace('+', '')) || 0;
          maxPrice = Infinity;
        }

        if (minPrice > 0 || maxPrice < Infinity) {
          filteredResults = filteredResults.filter((item) => {
            // Use the same price extraction logic as existing filters
            const getSafePrice = (item) => {
              let price = 0;
              if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
                  (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
                  item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
                price = item.package_rate;
              } else if (item.adult_rate != null && item.adult_rate !== undefined &&
                         item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {
                price = item.adult_rate;
              } else if (item.provider === "bridgify" && item.default_rate != null &&
                         item.default_rate !== undefined && item.default_rate !== 0) {
                price = item.default_rate;
              } else if (item.child_rate != null && item.child_rate !== undefined &&
                         item.child_rate !== "0.00" && item.child_rate !== 0 && item.child_rate !== "0") {
                price = item.child_rate;
              }
              return Number(price) || 0;
            };

            const productPrice = getSafePrice(item);
            
            // Convert price to base currency if needed
            let convertedPrice = productPrice;
            if (item.currency && item.currency !== baseCurrencyValue?.base) {
              convertedPrice = CurrencyConverterOnlyRateWithoutDecimal(
                item.currency,
                productPrice,
                baseCurrencyValue
              );
            }

            return convertedPrice >= minPrice && convertedPrice <= maxPrice;
          });
        }
        
        console.log(`Price filter: ${beforePriceFilter} -> ${filteredResults.length} products`);
      }

      // Apply category filtering if category exists
      if (filterData?.category && filterData.category !== 'Any') {
        console.log("Applying category filter:", filterData.category);
        const beforeCategoryFilter = filteredResults.length;
        
        const categoryKeyword = filterData.category.toLowerCase();
        filteredResults = filteredResults.filter((item) => {
          const categoryText = getCleanSearchText(item);
          return categoryText.includes(categoryKeyword);
        });
        
        console.log(`Category filter: ${beforeCategoryFilter} -> ${filteredResults.length} products`);
      }

      // Apply features filtering if features exist
      if (filterData?.features && Array.isArray(filterData.features) && filterData.features.length > 0) {
        console.log("Applying features filter:", filterData.features);
        const beforeFeaturesFilter = filteredResults.length;
        
        filteredResults = filteredResults.filter((item) => {
          const itemText = getCleanSearchText(item);
          return filterData.features.some(feature => 
            itemText.includes(feature.toLowerCase())
          );
        });
        
        console.log(`Features filter: ${beforeFeaturesFilter} -> ${filteredResults.length} products`);
      }

      // Apply current sort method to the filtered results
      const sortedResults = applySortToData(filteredResults);
      
      // Update the filtered data
      setFilteredData(sortedResults);

      // Set active chatbot filters for display panel
      setActiveChatbotFilters({
        filterData,
        originalPrompt,
        resultCount: filteredResults.length,
        totalCount: data.length,
        appliedAt: new Date().toISOString()
      });

      console.log(`Chatbot filter applied to loaded data: ${filteredResults.length} products found from ${data.length} total products`);
      
    } catch (error) {
      console.error("Error applying chatbot filters to data:", error);
      ToastMessage({
        status: "error",
        message: "Failed to apply AI filters. Please try again."
      });
    }
  };

  const handleChatbotFilterData = async (filterData, originalPrompt) => {
    console.log("Received chatbot filter data:", filterData, originalPrompt);
    
    try {
      // Reset current filters before applying chatbot filters
      setSearchObject({
        search: "",
        priceRance: [0, 0],
        location: [],
        subCategory: [],
        distance: 20,
      });
      setSelectedLocation([]);
      setSelectedSubCategory([]);
      setSelectedPrice([]);
      setFilterCheckboxes([]);
      setpricefilter(false);
      setUserSearchQuery('');

      // Check if location needs to be updated and reload products
      let shouldReloadProducts = false;
      let newLocationContext = null;

      // Update location context if provided in filter data
      if (filterData?.location && typeof filterData.location === 'object' && 
          filterData.location.latitude && filterData.location.longitude) {
        newLocationContext = {
          address_full: filterData.location.name || filterData.location.address_full || 'AI Selected Location',
          latitude: parseFloat(filterData.location.latitude),
          longtitude: parseFloat(filterData.location.longitude), // Note: keeping original typo for consistency
          address_components: filterData.location.address_components || [],
          savedAt: new Date().toISOString(),
          source: 'chatbot'
        };

        // Check if this is a different location than current
        const currentLat = currentLocation?.latitude;
        const currentLng = currentLocation?.longtitude;
        const newLat = newLocationContext.latitude;
        const newLng = newLocationContext.longtitude;

        // Only reload if coordinates are significantly different (more than ~100m difference)
        if (!currentLat || !currentLng || 
            Math.abs(currentLat - newLat) > 0.001 || 
            Math.abs(currentLng - newLng) > 0.001) {
          shouldReloadProducts = true;
        }

        // Update location states
        setUserSelectedLocation(newLocationContext);
        setCurrentLocation(newLocationContext);
        setIsUsingGlobalLocation(false);
        setGoogleLocation(filterData.location.name?.slice(0, 25) + '...' || 'AI Location');

        // Save to localStorage
        saveLocationToStorage(newLocationContext);
        
        console.log("Updated location context from chatbot:", newLocationContext);
        console.log("Should reload products:", shouldReloadProducts);
      }

      // If location changed significantly, reload products with new location
      if (shouldReloadProducts && newLocationContext) {
        console.log("Reloading products with new location from chatbot");
        
        // Show loading message
        ToastMessage({
          status: "info",
          message: `Loading products for new location: ${newLocationContext.address_full}`
        });

        // Set pending filters to be applied after new data loads
        console.log("Setting pending chatbot filters:", { filterData, originalPrompt });
        setPendingChatbotFilters({ 
          filterData: JSON.parse(JSON.stringify(filterData)), // Deep copy to avoid reference issues
          originalPrompt 
        });
        
        // Reload products with new location
        await loadLifestyleProducts(newLocationContext);
        
        console.log("Products reloading with new location, filters will be applied after data loads");
        
        return; // Exit early since new data will be loaded and filtered automatically
      }

      // If no location change, apply filters to existing data immediately
      applyChatbotFiltersToData(filterData, originalPrompt);
      
    } catch (error) {
      console.error("Error applying chatbot filters:", error);
      ToastMessage({
        status: "error",
        message: "Failed to apply AI filters. Please try again."
      });
    }
  }

  // Render AI Filter Panel
  const renderAIFilterPanel = () => {
    if (!activeChatbotFilters) return null;

    const { filterData, originalPrompt, resultCount, totalCount } = activeChatbotFilters;

    return (
      <div 
        style={{
          backgroundColor: "#f8f9ff",
          border: "1px solid #e1e8ff",
          borderRadius: "12px",
          padding: "16px",
          margin: "16px 0",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <div 
              style={{
                backgroundColor: "#4f46e5",
                borderRadius: "8px",
                padding: "8px",
                marginRight: "12px"
              }}
            >
              <span style={{ color: "white", fontSize: "14px", fontWeight: "600" }}>AI</span>
            </div>
            <div>
              <h6 style={{ margin: 0, fontWeight: "600", color: "#374151" }}>
                AI Filters Applied
              </h6>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                Showing {resultCount} of {totalCount} products
              </p>
            </div>
          </div>
          <button
            onClick={handleClearChatbotFilters}
            style={{
              background: "none",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              padding: "6px 12px",
              cursor: "pointer",
              fontSize: "12px",
              color: "#6b7280"
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.borderColor = "#9ca3af";
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            Clear AI Filters
          </button>
        </div>
        
        <div style={{ marginTop: "12px" }}>
          {/* Keywords */}
          {filterData?.primaryKeywords && filterData.primaryKeywords.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "13px", color: "#374151" }}>Keywords: </strong>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {filterData.primaryKeywords.slice(0, 3).join(", ")}
                {filterData.primaryKeywords.length > 3 && 
                  ` +${filterData.primaryKeywords.length - 3} more`}
              </span>
            </div>
          )}
          
          {/* Location */}
          {filterData?.location?.name && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "13px", color: "#374151" }}>Location: </strong>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {filterData.location.name}
              </span>
            </div>
          )}
          
          {/* Price Range */}
          {filterData?.priceRange && filterData.priceRange !== 'Any' && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "13px", color: "#374151" }}>Price Range: </strong>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {filterData.priceRange}
              </span>
            </div>
          )}
          
          {/* Category */}
          {filterData?.category && filterData.category !== 'Any' && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "13px", color: "#374151" }}>Category: </strong>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {filterData.category}
              </span>
            </div>
          )}
          
          {/* Features */}
          {filterData?.features && filterData.features.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "13px", color: "#374151" }}>Features: </strong>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {filterData.features.join(", ")}
              </span>
            </div>
          )}
          
          {/* Original Prompt */}
          {originalPrompt && (
            <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
              "{originalPrompt.length > 80 ? originalPrompt.substring(0, 80) + "..." : originalPrompt}"
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
        <title>Aahaas - Lifestyle</title>
        <meta
          name="description"
          content="Experience the essence of travel with Aahaas' Lifestyle offerings, designed to enrich your journey. Discover a wide array of activities, from thrilling adventures to immersive cultural experiences, paired with exquisite dining and wellness options."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://www.aahaas.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Lifestyle",
                  "item": "https://www.aahaas.com/lifestyle"
                }
              ]
            }),
          }}
        />
      </Head>

      {/* <CommonLayout
        title="Lifestyle"
        parent="home"
        showMenuIcon={true}
        showSearchIcon={false}
        openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}
      > */}
        {console.log(openSideBarStatus, "Open Side Bar Status is XXXX")}
         <div className="top-banner-wrapper">
                    {/* <a href={null}>
                      <img
                        src="/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg"
                        alt="Lifestyle Banner"
                        style={{
                          width: "100%",
                          height: "300px",
                          // objectFit: "cover",
                          // display: "block"
                        }}
                      />
                    </a> */}
                  <NewBanners/>

                  </div>
        <section className="section-b-space ratio_asos ">
           
          <div className="collection-wrapper">
           
            <Container>
              

              <Row>
                <Col
                  sm="3"
                  className="collection-filter yellow-scrollbar"
                  id="filter"
                  style={{
                    display: openSideBarStatus ? "block" : "none", // Show/hide based on openSideBarStatus for both mobile and desktop
                    left: openSideBarStatus ? "0px" : "",
                    position: 'sticky',
                    top: '20px',
                    alignSelf: 'flex-start',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                  }}
                >

                  {
                    backgroundLoading ? (
                      <ProductSkeleton skelotonType="productDetails-left-moreDetails mt-4" />
                    ) : (
                      <div
                        className="collection-filter-block px-lg-4 pe-5 mt-4"
                        style={{ 
                          borderRadius: "12px",
                          position: "relative",
                          zIndex: 10
                        }}
                      >
                        <div
                          className="collection-mobile-back"
                          onClick={() => closeSubFilter()}
                        >
                          <span className="filter-back">
                            <i className="fa fa-angle-left"></i>back
                          </span>
                        </div>

                        {/* <div style={{marginTop:"5px", }}>
                                            <Button
                                                className="btn btn-solid"
                                                style={{ width: "100%", marginBottom: "10px", borderRadius: "7px", padding: "10px" }}
                                                onClick={() => handleFilter()}
                                            
                                            >
                                                Apply Filters
                                                {openSideBarStatus ? "Close Filters" : "Apply Filters"}
                                            </Button>
                                        </div> */}

                        <div className="collection-collapse-block "  >
                          <div className="collection-collapse-block hotel-sidebar-filters-sub">
                            <h5 style={{ fontWeight: '500', marginTop: '20px' }} className="collapse-block-title-hotel">
                              Search by Location
                              {!isUsingGlobalLocation && (
                                <span className="badge badge-primary ms-2" style={{ fontSize: '10px' }}>
                                  Custom Location
                                </span>
                              )}
                            </h5>

                            <div className="location-input-container" style={{ position: 'relative', marginTop: '10px' }}>
                              <GooglePlacesAutocomplete
                                apiKey={groupApiCode}
                                selectProps={{
                                  value: googleLocation,
                                  placeholder: googleLocation === 'search' ? 'Search City...' : googleLocation,
                                  onChange: (e) => handleOnGoogleLocationChange(e),
                                  onClick: (e) => setGoogleLocation(''),
                                  styles: {
                                    container: (provided) => ({
                                      ...provided,
                                      width: '100%'
                                    }),
                                    control: (provided) => ({
                                      ...provided,
                                      paddingRight: '30px'
                                    }),
                                    dropdownIndicator: () => ({
                                      display: 'none'
                                    }),
                                    indicatorSeparator: () => ({
                                      display: 'none'
                                    })
                                  }
                                }}
                              />
                              {googleLocation !== 'search' && !isUsingGlobalLocation && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    background: '#fff',
                                    borderRadius: '50%',
                                    padding: '2px'
                                  }}
                                  onClick={() => handleClearSearchData()}
                                  title="Clear location and use global location"
                                >
                                  <CloseIcon sx={{ fontSize: '18px', color: '#dc3545' }} />
                                </div>
                              )}
                            </div>

                            {/* Show location info */}
                            {!isUsingGlobalLocation ? (
                              <div className="mt-2">
                                <small className="text-info">
                                  📍 Using custom location
                                </small>
                              </div>
                            ) : (
                              <div className="mt-2">
                                <small className="text-success">
                                  🌐 Using global location: {baseLocation?.address_full || 'Default location'}
                                </small>
                              </div>
                            )}
                          </div>

                           <h5
                            style={{ fontWeight: "500", fontSize: "15px",marginTop: '10px' }}
                            className="collapse-block-title-hotel"
                          >
                            Sort By
                          </h5>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter">
                              <div className="sort-options-container">
                                {options.map((option, index) => (
                                  <div key={option.value} className="sort-option-item">
                                    <label 
                                      className="sort-option-label"
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        borderRadius: '6px',
                                        transition: 'all 0.2s ease',
                                        backgroundColor: selectedSortMethod === option.value ? '#f0fdf4' : 'transparent',
                                        border: selectedSortMethod === option.value ? '1px solid #10cfffff' : '1px solid transparent',
                                        marginBottom: '6px'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (selectedSortMethod !== option.value) {
                                          e.target.style.backgroundColor = '#f9fafb';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (selectedSortMethod !== option.value) {
                                          e.target.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name="sortMethod"
                                        value={option.value}
                                        checked={selectedSortMethod === option.value}
                                        onChange={() => handleSelectChange(option)}
                                        disabled={isSorting}
                                        style={{
                                          width: '16px',
                                          height: '16px',
                                          marginRight: '10px',
                                          accentColor: '#0091d4ff',
                                          cursor: isSorting ? 'not-allowed' : 'pointer',
                                          opacity: isSorting ? 0.6 : 1
                                        }}
                                      />
                                      <span 
                                        style={{
                                          fontSize: '14px',
                                          color: selectedSortMethod === option.value ? '#065f46' : '#374151',
                                          fontWeight: selectedSortMethod === option.value ? '500' : '400',
                                          userSelect: 'none',
                                          opacity: isSorting ? 0.6 : 1
                                        }}
                                      >
                                        {option.label}
                                        {isSorting && selectedSortMethod === option.value && (
                                          <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6b7280' }}>
                                            <span className="sorting-spinner">⟳</span> Sorting...
                                          </span>
                                        )}
                                      </span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <h5
                            style={{ fontWeight: "500", fontSize: "15px" }}
                            className={
                              priceFilterOpen
                                ? "collapse-block-title-selected"
                                : "collapse-block-title"
                            }
                            onClick={() => setpriceFilterOpen(!priceFilterOpen)}
                          >
                            Price
                          </h5>
                          <Collapse isOpen={priceFilterOpen}>
                            <div className="collection-collapse-block-content">
                              <div className="collection-brand-filter">
                                <ul className="category-list">
                                  {filterByPriceButtons?.map((value, key) => (
                                    <li
                                      key={key}
                                      style={{ 
                                        listStyle: 'none', 
                                        marginBottom: '12px',
                                        padding: '0'
                                      }}
                                    >
                                      <div className="d-flex align-items-center">
                                        <input
                                          type="radio"
                                          name="priceRange"
                                          id={`price_${key}`}
                                          checked={
                                            value.start == minprice &&
                                            value.end == maxprice
                                          }
                                          onChange={() =>
                                            handlePriceFilterChange(value)
                                          }
                                          style={{
                                            width: '18px',
                                            height: '18px',
                                            marginRight: '10px',
                                            cursor: 'pointer',
                                            accentColor: '#007bff'
                                          }}
                                        />
                                        <label 
                                          htmlFor={`price_${key}`}
                                          onClick={() => handlePriceFilterChange(value)}
                                          style={{ 
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '400',
                                            margin: '0',
                                            color: '#333',
                                            flex: 1
                                          }}
                                        >
                                          {!isNaN(value.start) && value.start != null
                                            ? CurrencyConverter(
                                              tempCurrency,
                                              value.start,
                                              baseCurrencyValue
                                            ).replace(/\.00$/, "")
                                            : `${tempCurrency} 0`}{" "}
                                          -
                                          {!isNaN(value.end) && value.end != null
                                            ? CurrencyConverter(
                                              tempCurrency,
                                              value.end,
                                              baseCurrencyValue
                                            ).replace(/\.00$/, "")
                                            : `${tempCurrency} 0`}
                                        </label>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <div className="collection-collapse-block-content">
                              <div className="collection-brand-filter">
                                <div className="d-flex align-items-end align-content-stretch gap-3">
                                  <div className="d-flex flex-column align-itmes-end col-4">
                                    <h6
                                      className="m-0 p-0"
                                      style={{ fontSize: "14px" }}
                                    >
                                      Min price
                                    </h6>
                                    <input
                                      type="number"
                                      className="form-control"
                                      style={{
                                        padding: "9px 10px",
                                        borderRadius: "5px",
                                      }}
                                      placeholder="Min"
                                      value={
                                        userMinMaxPrice.min !== '' && userMinMaxPrice.min !== null && userMinMaxPrice.min !== undefined ?
                                          convertToDisplayCurrency(userMinMaxPrice.min, baseCurrencyValue, tempCurrency) :
                                          ''
                                      }
                                      min={
                                        pricerange[0] !== undefined && pricerange[0] !== null ?
                                          convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency) :
                                          0
                                      }
                                      max={
                                        pricerange[1] !== undefined && pricerange[1] !== null ?
                                          convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency) :
                                          0
                                      }
                                      name="min"
                                      onInput={(e) => {
                                        if (e.target.value.length > 10) {
                                          e.target.value = e.target.value.slice(0, 10);
                                        }
                                      }}
                                      onChange={handleMinMaxPrice}
                                    />
                                  </div>
                                  <div className="d-flex flex-column align-itmes-end col-4">
                                    <h6
                                      className="m-0 p-0"
                                      style={{ fontSize: "14px" }}
                                    >
                                      Max price
                                    </h6>
                                    <input
                                      type="number"
                                      className="form-control"
                                      style={{
                                        padding: "9px 10px",
                                        borderRadius: "5px",
                                      }}
                                      placeholder="Max"
                                      value={
                                        userMinMaxPrice.max !== '' && userMinMaxPrice.max !== null && userMinMaxPrice.max !== undefined ?
                                          convertToDisplayCurrency(userMinMaxPrice.max, baseCurrencyValue, tempCurrency) :
                                          ''
                                      }
                                      max={
                                        pricerange[1] !== undefined && pricerange[1] !== null ?
                                          convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency) :
                                          0
                                      }
                                      min={
                                        pricerange[0] !== undefined && pricerange[0] !== null ?
                                          convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency) :
                                          0
                                      }
                                      onInput={(e) => {
                                        if (e.target.value.length > 10) {
                                          e.target.value = e.target.value.slice(0, 10);
                                        }
                                      }}
                                      name="max"
                                      onChange={handleMinMaxPrice}
                                    />
                                  </div>
                                  <div className="ms-auto col-3">
                                    <button
                                      className="btn btn-sm btn-solid"
                                      style={{
                                        padding: "7px 10px",
                                        borderRadius: "5px",
                                      }}
                                      onClick={handleSearchPriceRange}
                                    >
                                      <SearchIcon />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Collapse>
                        </div>

                        {/* <div className="collection-collapse-block">
                          <h5
                            style={{ fontWeight: "500", fontSize: "15px" }}
                            className={
                              courseSubFilter
                                ? "collapse-block-title-selected"
                                : "collapse-block-title"
                            }
                            onClick={() => setCourseSubFilter(!courseSubFilter)}
                          >
                            Sub Category
                          </h5>
                          <Collapse isOpen={courseSubFilter}>
                            <div className="collection-collapse-block-content">
                              <div className="collection-brand-filter">
                                <ul className="category-list">
                                  {courseSubCategory.map((course, key) => (
                                    <div
                                      className="form-check custom-checkbox collection-filter-checkbox"
                                      key={key}
                                    >
                                      <Input
                                        className="custom-control-input option-btns"
                                        type="radio"
                                        value={course?.id}
                                        id={course?.id}
                                        checked={selectedSubCategory.includes(
                                          course?.id
                                        )}
                                        onChange={() => {
                                          handleOnCourseCategoryChange(
                                            course?.id,
                                            course?.submaincat_type
                                          );
                                        }}
                                        name="subCategory"
                                      />
                                      <h6 className="m-0 p-0" htmlFor={course} onClick={() => {
                                        handleOnCourseCategoryChange(
                                          course?.id,
                                          course?.submaincat_type
                                        );
                                      }}>
                                        {course?.submaincat_type}
                                      </h6>
                                    </div>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Collapse>
                        </div> */}


                        {/* <div className="collection-collapse-block">
                                        <h5
                                            style={{ fontWeight: "500", fontSize: "15px" }}
                                            className={
                                                locationfilterOpen
                                                    ? "collapse-block-title-selected"
                                                    : "collapse-block-title"
                                            }
                                            onClick={() =>
                                                setlocationfilterOpen(!locationfilterOpen)
                                            }
                                        >
                                            Location
                                        </h5>
                                        <Collapse isOpen={locationfilterOpen}>
                                            <div className="collection-collapse-block-content">
                                                <div className="collection-brand-filter">
                                                    <ul className="category-list">
                                                        {locations
                                                            ?.filter(
                                                                (value) => value && value.trim() !== ""
                                                            )
                                                            ?.map((value, index) => (
                                                                <div
                                                                    className="form-check custom-checkbox collection-filter-checkbox"
                                                                    key={index}
                                                                >
                                                                    <Input
                                                                        checked={selectedLocation.includes(value)}
                                                                        onChange={() => {
                                                                            handleLocationChange(value);
                                                                        }}
                                                                        name={value}
                                                                        id={value}
                                                                        type="checkbox"
                                                                        className="custom-control-input option-btns"
                                                                    />
                                                                    <h6
                                                                        className="m-0 p-0"
                                                                        htmlFor={value}
                                                                        style={{ textTransform: "capitalize" }}
                                                                    >
                                                                        {value}
                                                                    </h6>
                                                                </div>
                                                            ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div> */}

                        <div className="collection-collapse-block" style={{paddingTop:"10px"}}>
                          <h5
                            style={{ fontWeight: "500", fontSize: "15px" }}
                            className="collapse-block-title-hotel"
                          >
                            Search by distance (km)
                          </h5>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter d-flex align-items-stretch">
                              <input
                                type="number"
                                className="form-control"
                                style={{
                                  borderTopLeftRadius: "5px",
                                  borderBottomLeftRadius: "5px",
                                  padding: "9px 10px",
                                }}
                                value={distance}
                                min="1"
                                onChange={(e) => {
                                  const value = Math.max(1, parseInt(e.target.value) || 1); // Force minimum of 1

                                  if (value > 2000) {
                                    ToastMessage({
                                      status: "warning",
                                      message: "Distance should not exceed 2000 km.",
                                    });
                                  } else {
                                    setDistance(value);
                                    setSearchObject({
                                      ...searchObject,
                                      distance: value,
                                    });
                                  }
                                }}
                              />
                              {/* <button
                                                    className="px-3 btn btn-sm btn-solid"
                                                    style={{
                                                        borderTopRightRadius: "5px",
                                                        borderBottomRightRadius: "5px",
                                                    }}
                                                    onClick={() => handleSearchfilter()}
                                                >
                                                    <SearchIcon />
                                                </button> */}
                            </div>
                          </div>
                        </div>

                    


                      </div>
                    )
                  }



                </Col>
                <Col 
                  className="collection-content" 
                  sm="12" 
                  md="12" 
                  lg={openSideBarStatus ? "9" : "12"}
                  style={{
                    transition: "all 0.3s ease"
                  }}
                >
        
                 

                  <div className="collection-product-wrapper mt-0 mt-lg-4" style={{paddingLeft: openSideBarStatus ? '10px' : '40px' }}>
                    {renderAIFilterPanel()}
                    <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row border-bottom pb-3 gap-3">
                     <div style={{marginTop: '7px'}}>
                       <button
                        className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                        onClick={toggleSubFilter}
                        style={{
                          borderRadius: "8px",
                          padding: "8px 16px",
                          height: "40px",
                          fontSize: "14px",
                          fontWeight: "500",
                          border: "1px solid #004e64",
                          backgroundColor: "#004e64",
                          color: "white",
                          transition: "all 0.3s ease",
                          minWidth: "50px",
                          width: window.innerWidth <= 768 ? "50px" : "auto",
                          flexShrink: 0,
                        }}
                      >
                        <TuneIcon sx={{ fontSize: '22px', color: 'white' }} />
                        {/* {window.innerWidth > 768 && (
                          <span>{openSideBarStatus ? "Hide Filters" : "Show Filters"}</span>
                        )} */}
                      </button>
                     </div>
                
                      
                    {/* </div> */}
                        
                      {backgroundLoading && (
                        <div className="ms-auto col-12 col-lg-4 mt-3">
                          <div className="progress" style={{ height: '6px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${loadingProgress}%` }}
                              aria-valuenow={loadingProgress}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small className="text-muted">
                            Phase {loadingPhase} - {loadingProgress}%
                          </small>
                        </div>
                      )}

                      {/* Horizontal Subcategories Section */}
                      {!backgroundLoading && courseSubCategory.length > 0 && (
                        <div 
                          className={`subcategories-horizontal-wrapper w-100  ${isSubcategoriesSticky ? 'sticky-subcategories' : ''}`}
                          style={{
                            ...(isSubcategoriesSticky && {
                              position: 'fixed',
                              top: '138px',
                              left: '0',
                              right: '0',
                              zIndex: 10,
                              backgroundColor: 'white',
                              padding: '0px 20px',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                              borderBottom: '1px solid #e0e0e0',
                              margin: '0 10px',
                            })
                          }}
                        >
                          <div 
                            className="subcategories-horizontal d-flex gap-2 align-items-center"
                            style={{
                              overflowX: 'auto',
                              flexWrap: 'nowrap',
                              scrollbarWidth: 'thin',
                              scrollbarColor: '#e0e0e0 transparent',
                              margin: '7px 0',
                              paddingBottom: '8px',
                            }}
                          >
                            {/* Filter Button - Always visible in sticky mode */}
                            {isSubcategoriesSticky && (
                              <button
                                className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
                                onClick={toggleSubFilter}
                                style={{
                                  borderRadius: "8px",
                                  padding: "8px 12px",
                                  height: "40px",
                                  fontSize: "14px",
                                  fontWeight: "500",
                                  border: "1px solid #004e64",
                                  backgroundColor: "#004e64",
                                  color: "white",
                                  transition: "all 0.3s ease",
                                  minWidth: "50px",
                                  flexShrink: 0,
                                  marginRight: "8px"
                                }}
                              >
                                <TuneIcon sx={{ fontSize: '20px', color: 'white' }} />
                              </button>
                            )}
                            
                            <button
                              className={`subcategory-chip ${selectedSubCategory.length === 0 ? 'active' : ''}`}
                              onClick={() => {
                                   window.scrollTo({
                                  top: 0,
                                  behavior: 'smooth'
                                });
                                setSelectedSubCategory([]);
                                setSearchObject({
                                  ...searchObject,
                                  subCategory: [],
                                });
                                // Scroll to top when All Categories is clicked
                             
                              }}
                              style={{
                                background: selectedSubCategory.length === 0 ? '#004e64' : 'transparent',
                                color: selectedSubCategory.length === 0 ? 'white' : '#004e64',
                                border: '1px solid #004e64',
                                borderRadius: '20px',
                                padding: '8px 16px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                              }}
                            >
                              <span style={{ fontSize: '16px' }}>🏷️</span>
                              All Categories
                            </button>
                            {courseSubCategory.map((course, index) => (
                              <button
                                key={course.id}
                                className={`subcategory-chip ${selectedSubCategory.includes(course.id) ? 'active' : ''}`}
                                onClick={() => {
                                  handleOnCourseCategoryChange(course.id, course.submaincat_type);
                                }}
                                style={{
                                  background: selectedSubCategory.includes(course.id) ? '#004e64' : 'transparent',
                                  color: selectedSubCategory.includes(course.id) ? 'white' : '#004e64',
                                  border: '1px solid "#004e64"',
                                  borderRadius: '20px',
                                  padding: '8px 16px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  whiteSpace: 'nowrap',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  flexShrink: 0
                                }}
                                onMouseOver={(e) => {
                                  if (!selectedSubCategory.includes(course.id)) {
                                    e.target.style.background = '#f8f9fa';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!selectedSubCategory.includes(course.id)) {
                                    e.target.style.background = 'transparent';
                                  }
                                }}
                              >
                                {course.image_url && (
                                  <img
                                    src={course.image_url}
                                    alt={course.submaincat_type}
                                    style={{
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: selectedSubCategory.includes(course.id) ? '1px solid white' : '1px solid #e0e0e0'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                {course.submaincat_type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spacer div to prevent content jump when sticky is active */}
                      {isSubcategoriesSticky && !backgroundLoading && courseSubCategory.length > 0 && (
                        <div style={{ height: '80px', width: '100%' }}></div>
                      )}

                    </div>

                    {/* Discount Products Slider */}
                    {/* {allDiscountData.length > 0 && (
                      <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3 mt-3">
                        <ProductSlider allDiscountData={allDiscountData} type={"lifeStyles"} />
                      </div>
                    )} */}

                    <ul className="product-filter-tags p-0 m-0 my-2">
                      {
                        pricefilter &&
                        <li>
                          {/* <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i></a> */}
                          <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => { handleOnPriceChange() }}></i> </a>
                        </li>
                      }
                      {
                        selectedLocation.map((brand, i) => (
                          <li key={i}>
                            {/* <a href={null} className="filter_tag">{brand}<i className="fa fa-close" onClick={() => handleLocationChange(brand)}></i></a> */}
                            <a href={null} className="filter_tag">{brand}</a>
                          </li>
                        ))
                      }
                      {selectedSubCategory.map((value, i) => {
                        const subCategory = courseSubCategory.find(
                          (cat) => cat.id === value
                        );
                        return (
                          <li key={i}>
                            <a href={null} className="filter_tag">
                              {subCategory?.submaincat_type}
                              <i
                                className="fa fa-close"
                                onClick={() =>
                                  handleOnCourseCategoryChange(
                                    value,
                                    subCategory?.submaincat_type
                                  )
                                }
                              ></i>
                            </a>
                          </li>
                        );
                      })}
                      {
                        (pricefilter || selectedLocation.length > 0 || selectedSubCategory.length > 0) &&
                        <li onClick={() => handleClearAllFilters()}>
                          <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
                        </li>
                      }
                    </ul>

                    {/* Products Grid */}
                    <Row className="mt-4 g-3" style={{ paddingLeft: '0px' }}>
                     {loading || backgroundLoading ? (
  renderLoadingSkeleton()
) : error ? (
  renderErrorState()
) : (!loading && !backgroundLoading && filteredData.length === 0) ? (
  renderEmptyState()
) : (
  uniqueLifestyles(filteredData).map((product, i) => (
    <div className="col-lg-3 col-md-4 col-6" key={i}>
      <div style={{ padding: '8px' }}>
        <ProductItems
          product={product}
          productImage={product?.image}
          productstype={"lifestyle"}
          title={product?.lifestyle_name}
          productcurrency={product?.currency}
          adultRate={product?.adult_rate}
          packageRate={product?.package_rate}
          childRate={product?.child_rate}
          description={product?.lifestyle_description}
          rating={4}
          cartClass={"cart-info cart-wrap"}
          backImage={true}
        />
      </div>
    </div>
  ))
)}
                    </Row>

                    {/* Provider Status (for debugging - can be removed in production) */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-4">
                        <details>
                          <summary>Provider Status (Dev Only)</summary>
                          <pre>{JSON.stringify(providerStatus, null, 2)}</pre>
                        </details>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            <LifestyleChatbot
  handleUserFilterData={handleChatbotFilterData}
  globalSearch={false}
  clearTrigger={clearAIFiltersTrigger} // ✅ pass this
/>

            </Container>
          </div>

          <style>
            {`
          .yellow-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.yellow-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ededed;
  border-radius: 10px;
}

.yellow-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.yellow-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ededed transparent;
}

.sticky-subcategories {
  animation: slideInFromTop 0.3s ease-out;
}

@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive adjustments for sticky subcategories */
@media (max-width: 768px) {
  .sticky-subcategories {
    padding: 10px 15px !important;
    top: 60px !important;
  }
}

/* Horizontal scrollbar styling for subcategories */
.subcategories-horizontal::-webkit-scrollbar {
  height: 6px;
}

.subcategories-horizontal::-webkit-scrollbar-thumb {
  background-color: #e0e0e0;
  border-radius: 10px;
}

.subcategories-horizontal::-webkit-scrollbar-track {
  background-color: transparent;
}

.subcategories-horizontal {
  scrollbar-width: thin;
  scrollbar-color: #e0e0e0 transparent;
}
        `}
          </style>

        </section>

      {/* </CommonLayout> */}
    </>
  );
}