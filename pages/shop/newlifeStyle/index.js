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


// Import components from your old code
import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import PostLoader from "../../skeleton/PostLoader";
import ProductSlider from "../productImageSlider";
import ToastMessage from "../../../components/Notification/ToastMessage";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
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

export default function LifestyleProducts() {
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
    search : "",
    priceRance: [0, 0],
    location: [],
    subCategory: [],
    distance: 20,
  })
  const [selectedSortMethod, setSelectedSortMethod] = useState('default');
  const [googleLocation, setGoogleLocation] = useState('search');
  const [globalLocation, setGlobalLocation] = useState(null);
const [currentLocation, setCurrentLocation] = useState(null); 
const [userSelectedLocation, setUserSelectedLocation] = useState(null);
const [isUsingGlobalLocation, setIsUsingGlobalLocation] = useState(true); 

    const options = [
    { value: "default", label: "Default" },
    { value: "newArrival", label: "New Arrivals" },
    { value: "featured", label: "Featured" },
    { value: "priceLH", label: "Price Low to High" },
    { value: "priceHL", label: "Price High to Low" },
    { value: "distanceLH", label: "Distance Low to High" },
    { value: "distanceHL", label: "Distance High to Low" },
  ];

    // Provider status for tracking multiple data sources
    //   const initialProviderStatus = {
    //     provider1: { loading: false, completed: false, error: null },
    //     provider2: { loading: false, completed: false, error: null },
    //     // Add more providers as needed
    //   };

    const providers = ["bridgify", "aahaas"];

    const [providerStatus, setProviderStatus] = useState(providers);

    // Mock providers configuration - replace with your actual providers


    // Function to get parameters for providers


    console.log(baseLocation, "Base Location XXXXXXXXXXXXXXXXXXXXXXXX")
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

    const loadLifestyleProducts = async (locationToUse = null) => {
    try {
        // Setup loading state
        setLoading(true);
        setLoadingPhase(1);
        setLoadingProgress(10);
        setData([]);
        setFilteredData([]);
        setBackgroundLoading(true);
        setProviderStatus(providers);
        setError(null);

        // Use the provided location or current location
        const activeLocation = locationToUse || currentLocation || baseLocation;

        // Update progress
        setLoadingProgress(20);

        // Update getProviderParams to use the active location
        const getProviderParamsUpdated = (provider) => ({
            latitude: activeLocation?.latitude || 6.9271,
            longitude: activeLocation?.longtitude || 79.8612,
            limit: 60,
            provider: provider,
            radius: 50,
            isCountry: false,
            sortArray: null,
            dataSet: JSON.stringify(activeLocation)
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
          if (res.data.status == 200) {
            const subCategories = res.data.subCategories || [];
    
            const filteredCategories = subCategories
              .filter((category) => category.maincat_id == 3)
              .map((cat, index) => ({
                id: cat["id"],
                submaincat_type: cat["submaincat_type"],
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
        setFilteredData(data);
                    fetchLocations(data);
                    createPriceFilters(data);
        processDiscountData(data);
    }, [data]);

    // Load products on component mount
    useEffect(() => {
       if (baseLocation) {
        setGlobalLocation(baseLocation); // Store the original global location
        setCurrentLocation(baseLocation); // Set it as current location initially
        setIsUsingGlobalLocation(true);
    }
        // loadLifestyleProducts();
    }, [baseLocation]);

    useEffect(() => {
    if (currentLocation) {
        loadLifestyleProducts();
    }
}, [currentLocation]);

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
        setUserMinMaxPrice({
            ...userMinMaxPrice,
            [e.target.name]: e.target.value,
        });
    };

     const openSubFilter = () => {
    setopenSideBarStatus(true);
  }

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
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
    search : "",
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

    handleChange(''); // Clear search query
    setFilteredData(data); // Reset filtered data to original dataset
    // handleClearSubCategory();
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
                        onClick={loadLifestyleProducts}
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


    const handleOnCourseCategoryChange = (value, displayName) => {
    // Check if selectedSubCategory already has this value
    const isExist = selectedSubCategory?.[0] === value;

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
      
    }
  };

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
    const regex = /^\d+(\.\d+)?$/; // Allow decimal numbers

    if (regex.test(userMinMaxPrice.min) && regex.test(userMinMaxPrice.max)) {
      const minPrice = Number(userMinMaxPrice.min);
      const maxPrice = Number(userMinMaxPrice.max);

      if (minPrice > maxPrice) {
        ToastMessage({
          status: "warning",
          message: 'Please ensure that the minimum price is lower than the maximum price.'
        });
        return;
      }

      if (pricerange.length >= 2) {
        if (minPrice < pricerange[0] || maxPrice > pricerange[1]) {
          ToastMessage({
            status: "warning",
            message: `Price range should be between ${pricerange[0]} and ${pricerange[1]}.`
          });
          return;
        }
      }

      setminprice(minPrice);
      setmaxprice(maxPrice);
      setpricefilter(true); // Mark that price filter is active
       setSearchObject({
      ...searchObject,
        priceRance: [minPrice, maxPrice],
    })
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

  const manageUserSelectFilters = ()=>{

    const filtered = data.filter(product => {

    // 2. Price range filter - check default_rate
    if (searchObject.priceRance[0] >= product.default_rate || searchObject.priceRance[1]<= product.default_rate) {
      const productPrice = parseFloat(product.default_rate) || 0;
      
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

    // 4. Sub category filter - check category_2
    if (searchObject.subCategory.length > 0) {
      const productCategory = parseInt(product.category_2) || 0;
      const matchesSubCategory = searchObject.subCategory.some(selectedCategory => 
        productCategory === parseInt(selectedCategory)
      );
      if (!matchesSubCategory) {
        return false;
      }
    }

    // 5. Distance filter - check distance (convert to km and round)
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
  setFilteredData(filtered);
  console.log("Filtered products after user select filters:", filtered.length, filtered);
  }

  useEffect(() => {
    manageUserSelectFilters();
    console.log("Search object updated:", searchObject);
  }, [selectedSubCategory, minprice, maxprice, distance, searchObject]);


  const handleSelectChange = (selectedOption) => {
    setSelectedSortMethod(selectedOption.value);
  };

const handleSortChange = () => {
  console.log("Current sort method:", selectedSortMethod);
  console.log("Total products before sorting:", data.length);
  
  let sortedProducts = [...filteredData]; // Create a copy of the original data
  
  switch (selectedSortMethod) {
    case 'default':
      console.log("Applying default sorting - returning original order");
      // Return products in their original order
      sortedProducts = [...filteredData];
      break;
      
    case 'featured':
      console.log("Applying featured sorting - sorting by triggers count (high to low)");
      sortedProducts = sortedProducts.sort((a, b) => {
        const triggersA = parseInt(a.triggers) || 0;
        const triggersB = parseInt(b.triggers) || 0;
        console.log(`Comparing triggers: ${a.lifestyle_name} (${triggersA}) vs ${b.lifestyle_name} (${triggersB})`);
        return triggersB - triggersA; // High to low
      });
      console.log("Top 3 featured products:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        triggers: p.triggers
      })));
      break;
      
    case 'newArrival':
      console.log("Applying new arrival sorting - sorting by created_at (newest first)");
      sortedProducts = sortedProducts.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        console.log(`Comparing dates: ${a.lifestyle_name} (${a.created_at}) vs ${b.lifestyle_name} (${b.created_at})`);
        return dateB - dateA; // Newest first
      });
      console.log("Top 3 newest products:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        created_at: p.created_at
      })));
      break;
      
    case 'priceLH':
      console.log("Applying price sorting - Low to High (using default_rate)");
      sortedProducts = sortedProducts.sort((a, b) => {
        const priceA = parseFloat(a.default_rate) || 0;
        const priceB = parseFloat(b.default_rate) || 0;
        console.log(`Comparing default_rate prices: ${a.lifestyle_name} (${priceA}) vs ${b.lifestyle_name} (${priceB})`);
        return priceA - priceB; // Low to high
      });
      console.log("Top 3 cheapest products by default_rate:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        default_rate: p.default_rate,
        currency: p.currency
      })));
      break;
      
    case 'priceHL':
      console.log("Applying price sorting - High to Low (using default_rate)");
      sortedProducts = sortedProducts.sort((a, b) => {
        const priceA = parseFloat(a.default_rate) || 0;
        const priceB = parseFloat(b.default_rate) || 0;
        console.log(`Comparing default_rate prices: ${a.lifestyle_name} (${priceA}) vs ${b.lifestyle_name} (${priceB})`);
        return priceB - priceA; // High to low
      });
      console.log("Top 3 most expensive products by default_rate:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        default_rate: p.default_rate,
        currency: p.currency
      })));
      break;
      
    case 'distanceLH':
      console.log("Applying distance sorting - Low to High");
      sortedProducts = sortedProducts.sort((a, b) => {
        const distanceA = parseFloat(a.distance) || 0;
        const distanceB = parseFloat(b.distance) || 0;
        console.log(`Comparing distances: ${a.lifestyle_name} (${distanceA}km) vs ${b.lifestyle_name} (${distanceB}km)`);
        return distanceA - distanceB; // Low to high
      });
      console.log("Top 3 closest products:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        distance: p.distance
      })));
      break;
      
    case 'distanceHL':
      console.log("Applying distance sorting - High to Low");
      sortedProducts = sortedProducts.sort((a, b) => {
        const distanceA = parseFloat(a.distance) || 0;
        const distanceB = parseFloat(b.distance) || 0;
        console.log(`Comparing distances: ${a.lifestyle_name} (${distanceA}km) vs ${b.lifestyle_name} (${distanceB}km)`);
        return distanceB - distanceA; // High to low
      });
      console.log("Top 3 farthest products:", sortedProducts.slice(0, 3).map(p => ({
        name: p.lifestyle_name,
        distance: p.distance
      })));
      break;
      
    default:
      console.log("Unknown sort method, returning default order");
      sortedProducts = [...data];
      break;
  }
  
  console.log("Products after sorting:", sortedProducts.length);
  console.log("Sort method applied successfully:", selectedSortMethod);
  
  // Apply the sorting to your filtered data
  // You might want to apply filters after sorting or maintain both original and filtered data
  setFilteredData(sortedProducts); // Update filtered data with sorted products
  
  // If you want to maintain the current filters while sorting, you can do:
  // setFilteredData(prev => {
  //   // Apply the same sorting logic to the filtered data
  //   return applyCurrentFiltersToSortedData(sortedProducts);
  // });
};


  useEffect(() => {
    setLoading(true);
    handleSortChange();
    setLoading(false);
  },[selectedSortMethod]);

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
                        address_components: results[0].address_components
                    };

                    // Update states
                    setUserSelectedLocation(newLocation);
                    setCurrentLocation(newLocation);
                    setIsUsingGlobalLocation(false);

                    console.log("Selected new location:", newLocation);
                    
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
    
    setLoading(true);
    
    try {
        // Reset to global location
        setCurrentLocation(globalLocation);
        setUserSelectedLocation(null);
        setIsUsingGlobalLocation(true);
        setGoogleLocation('search');
        
        // Reload products with global location
        await loadLifestyleProducts(globalLocation);
        
        ToastMessage({
            status: "success",
            message: "Location reset to global location"
        });
    } catch (error) {
        console.error("Error clearing location:", error);
        ToastMessage({
            status: "error",
            message: "Failed to reset location"
        });
    } finally {
        setLoading(false);
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

  if(selectedSortMethod != 'default'){
    return uniqueItems
  }
  else{
  return uniqueItems.sort((a, b) => {
    const triggersA = a.triggers || 0;
    const triggersB = b.triggers || 0;
    return triggersB - triggersA;
  });
  }
 

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

            <CommonLayout
                title="Lifestyle"
                parent="home"
                showMenuIcon={true}
                showSearchIcon={false}
                openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}
            >
                <section className="section-b-space ratio_asos mt-lg-5">
                    <div className="collection-wrapper">
                        <Container>
                            <Row>
                                <Col
                                    sm="3"
                                    className="collection-filter"
                                    id="filter"
                                    style={{
                                        left: openSideBarStatus ? "0px" : "",
                                    }}
                                >

                                    <div
                                        className="collection-filter-block px-lg-4 pe-5"
                                        style={{ borderRadius: "12px" }}
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

                                        <div className="collection-collapse-block">
<div className="collection-collapse-block hotel-sidebar-filters-sub">
    <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
        Search by Location
        {!isUsingGlobalLocation && (
            <span className="badge badge-primary ms-2" style={{ fontSize: '10px' }}>
                Custom Location
            </span>
        )}
    </h5>
    
    <div className="location-input-container" style={{ position: 'relative' }}>
        <GooglePlacesAutocomplete
            apiKey={groupApiCode}
            selectProps={{
                value: googleLocation,
                placeholder: googleLocation === 'search' ? 'Search for a location...' : googleLocation,
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
                    zIndex: 2
                }}
                onClick={() => handleClearSearchData()}
                title="Clear location and use global location"
            >
                <CloseIcon sx={{ fontSize: '18px' }} />
            </div>
        )}
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
                                                                <div
                                                                    className="form-check custom-checkbox collection-filter-checkbox"
                                                                    key={key}
                                                                >
                                                                    <Input
                                                                        checked={
                                                                            value.start == minprice &&
                                                                            value.end == maxprice
                                                                        }
                                                                        onChange={() =>
                                                                            handlePriceFilterChange(value)
                                                                        }
                                                                        name={value}
                                                                        id={value}
                                                                        type="radio"
                                                                        className="custom-control-input option-btns"
                                                                    />
                                                                    {/* <h6 className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)}  - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6> */}
                                                                    <h6 className="m-0 p-0" htmlFor={value}>
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
                                                                    </h6>
                                                                </div>
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
                                                                    value={userMinMaxPrice.min}
                                                                    min={pricerange[0]}
                                                                    max={pricerange[1]}
                                                                    name="min"
                                                                    onChange={(e) => handleMinMaxPrice(e)}
                                                                />
                                                            </div>
                                                            <div className="d-flex flex-column align-itmes-end col-4">
                                                                <h6
                                                                    className="m-0 p-0"
                                                                    style={{ fontSize: "14px" }}
                                                                >
                                                                    Max price
                                                                    {/* Max price - {`${baseCurrency}`} */}
                                                                </h6>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    style={{
                                                                        padding: "9px 10px",
                                                                        borderRadius: "5px",
                                                                    }}
                                                                    placeholder="Max"
                                                                    value={userMinMaxPrice.max}
                                                                    max={pricerange[1]}
                                                                    min={pricerange[0]}
                                                                    name="max"
                                                                    onChange={(e) => handleMinMaxPrice(e)}
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

                                                                         <div className="collection-collapse-block">
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
                                                                <h6 className="m-0 p-0" htmlFor={course}>
                                                                    {course?.submaincat_type}
                                                                </h6>
                                                            </div>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>

                                   
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

                                     <div className="collection-collapse-block">
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
                                                    }}
                                                    value={distance}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value <= 2000) {
                                                            setDistance(value);
                                                            setSearchObject({
                                                                ...searchObject,
                                                                distance: value,
                                                            });
                                                        } else {
                                                            ToastMessage({
                                                                status: "warning",
                                                                message:
                                                                    "Distance should not exceed 2000 km.",
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

                               
                                </Col>
                                <Col className="collection-content" sm="12" md="12" lg="9">
                                    {/* Banner Section */}
                                    <div className="d-none d-lg-block d-md-block top-banner-wrapper">
                                        <a href={null}>
                                            <Image
                                                src={Menu2}
                                                placeholder="blur"
                                                alt="Lifestyle Banner"
                                                layout="responsive"
                                                height={500}
                                                width={2000}
                                                quality={25}
                                                priority
                                                loading="eager"
                                            />
                                        </a>
                                    </div>

                                    <div className="collection-product-wrapper mt-0 mt-lg-4">
                                        {/* Product Count Header */}
                                        <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
                                            <h5 className="p-0 m-0" style={{ fontSize: '18px', fontWeight: '600' }}>
                                                {loading ? (
                                                    "Loading Lifestyle Products..."
                                                ) : (
                                                    `Showing ${filteredData.length} Products`
                                                )}
                                            </h5>

                                            {/* Loading Progress Bar */}
                                            {backgroundLoading && (
                                                <div className="ms-auto col-12 col-lg-4">
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

                                            {
                                                !backgroundLoading && (
                                                     <><div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
                                                        <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
                                                        {userSearchQuery === '' ? <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
                                                    </div>
                                                    <div className="col-3 d-none d-lg-block" style={{ position: "relative", zIndex: 1050 }}>
                                                            <Select
                                                                styles={{
                                                                    menu: (provided) => ({
                                                                        ...provided,
                                                                        zIndex: 1100, // Ensures dropdown appears on top
                                                                        position: "absolute",
                                                                    }),
                                                                }}
                                                                options={options}
                                                                onChange={handleSelectChange} 
                                                                />
                                                        </div></>
                                                )
                                            }
                                        </div>

                                        {/* Discount Products Slider */}
                                        {allDiscountData.length > 0 && (
                                            <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3 mt-3">
                                                <ProductSlider allDiscountData={allDiscountData} type={"lifeStyles"} />
                                            </div>
                                        )}

                                           <ul className="product-filter-tags p-0 m-0 my-2">
                                                                    {
                                                                      pricefilter &&
                                                                      <li>
                                                                        {/* <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i></a> */}
                                                                        <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} </a>
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
                                                                            {/* <i
                                                                              className="fa fa-close"
                                                                              onClick={() =>
                                                                                handleOnCourseCategoryChange(
                                                                                  value,
                                                                                  subCategory?.submaincat_type
                                                                                )
                                                                              }
                                                                            ></i> */}
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
                                        <Row className="mt-4">
                                            {loading ? (
                                                renderLoadingSkeleton()
                                            ) : error ? (
                                                renderErrorState()
                                            ) : filteredData.length === 0 ? (
                                                renderEmptyState()
                                            ) : (
                                                uniqueLifestyles(filteredData).map((product, i) => (
                                                    <div className={grid} key={i}>
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
                        </Container>
                    </div>
                </section>
            </CommonLayout>
        </>
    );
}
//filter fix

// import React, { useState, useEffect, useContext } from "react";
// import {
//     Button,
//     Col,
//     Collapse,
//     Container,
//     Input,
//     Media,
//     Row,
// } from "reactstrap";
// import Head from 'next/head';
// import { useRouter } from "next/router";
// import Image from "next/image";


// // Import components from your old code
// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import PostLoader from "../../skeleton/PostLoader";
// import ProductSlider from "../productImageSlider";
// import ToastMessage from "../../../components/Notification/ToastMessage";
// import SearchIcon from "@mui/icons-material/Search";
// import CloseIcon from "@mui/icons-material/Close";
// import Select from "react-select";

// // Import your context and services
// import { AppContext } from "../../_app";
// // import { fetchLifestyleData } from "../../../services/lifestyleService"; // Assuming you have this service

// // Import banner image
// import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg";
// import { fetchLifestyleData } from "../../../AxiosCalls/LifestyleServices/newLifeStyleService";
// import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
// import axios from "axios";
// import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";
// import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
// import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// export default function LifestyleProducts() {
//     const router = useRouter();
//     const canonicalUrl = router.asPath;
//     const { baseLocation, baseCurrencyValue, baseCurrency, groupApiCode } = useContext(AppContext);

//     // State management
//     const [loading, setLoading] = useState(true);
//     const [backgroundLoading, setBackgroundLoading] = useState(false);
//     const [loadingPhase, setLoadingPhase] = useState(1);
//     const [loadingProgress, setLoadingProgress] = useState(0);
//     const [error, setError] = useState(null);

//     const [data, setData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [allDiscountData, setAllDiscountData] = useState([]);

//     const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

//     //filters
//     const [openSideBarStatus, setopenSideBarStatus] = useState(false);
//     const [priceFilterOpen, setpriceFilterOpen] = useState(true);
//     const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
//     const [userMinMaxPrice, setUserMinMaxPrice] = useState({
//         min: "",
//         max: "",
//     });
//     const [minprice, setminprice] = useState("");
//     const [maxprice, setmaxprice] = useState("");
//     const [pricerange, setpricerange] = useState([]);
//     const [pricefilter, setpricefilter] = useState(false);
//     const [locationfilterOpen, setlocationfilterOpen] = useState(true);
//     const [locations, setLocations] = useState([]);
//     const [courseSubFilter, setCourseSubFilter] = useState(true);
//     const [courseSubCategory, setCourseSubCategory] = useState([]);
//     const [distance, setDistance] = useState(20);
//     const [userSearchQuery, setUserSearchQuery] = useState('');
//     const [searchFilter, setSearchfilter] = useState(false);
//     const [selectedSubCategory, setSelectedSubCategory] = useState([]);
//     const [selectedLocation, setSelectedLocation] = useState([]);
//     const [tempCurrency, setTempCurrency] = useState('');
//     const [selectedPrice, setSelectedPrice] = useState([]);
//     const [filterCheckboxes, setFilterCheckboxes] = useState([]);
//     const [filteredLifeStyleData, setFilteredLifeStyleData] = useState([]);
//      const [backEndFilters, setBackEndFilters] = useState({
//     category1: null,
//     category2: null,
//     category3: null,
//     limit: 50,
//   });
//   const [searchObject, setSearchObject] = useState({
//     search : "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   })
//   const [selectedSortMethod, setSelectedSortMethod] = useState('default');
//   const [googleLocation, setGoogleLocation] = useState('search');
//   const [globalLocation, setGlobalLocation] = useState(null);
// const [currentLocation, setCurrentLocation] = useState(null); 
// const [userSelectedLocation, setUserSelectedLocation] = useState(null);
// const [isUsingGlobalLocation, setIsUsingGlobalLocation] = useState(true); 

//     const options = [
//     { value: "default", label: "Default" },
//     { value: "newArrival", label: "New Arrivals" },
//     { value: "featured", label: "Featured" },
//     { value: "priceLH", label: "Price Low to High" },
//     { value: "priceHL", label: "Price High to Low" },
//     { value: "distanceLH", label: "Distance Low to High" },
//     { value: "distanceHL", label: "Distance High to Low" },
//   ];

//     // Provider status for tracking multiple data sources
//     //   const initialProviderStatus = {
//     //     provider1: { loading: false, completed: false, error: null },
//     //     provider2: { loading: false, completed: false, error: null },
//     //     // Add more providers as needed
//     //   };

//     const providers = ["bridgify", "aahaas" , "globaltix"];
//     // const providers = ["globaltix"];

//     const [providerStatus, setProviderStatus] = useState(providers);

//     // Mock providers configuration - replace with your actual providers


//     // Function to get parameters for providers


//     console.log(baseLocation, "Base Location XXXXXXXXXXXXXXXXXXXXXXXX")
//     const getProviderParams = (provider) => ({
//         latitude: baseLocation?.latitude || 6.9271,
//         longitude: baseLocation?.longtitude || 79.8612,
//         limit: 60,
//         provider: provider,
//         radius: 50,
//         isCountry: false,
//         sortArray: null,
//         dataSet: JSON.stringify(baseLocation)

//     });

//     // const loadLifestyleProducts = async () => {
//     //     try {
//     //         // Setup loading state
//     //         setLoading(true);
//     //         setLoadingPhase(1);
//     //         setLoadingProgress(10);
//     //         setData([]);
//     //         setFilteredData([]);
//     //         setBackgroundLoading(true);
//     //         setProviderStatus(providers);
//     //         setError(null);

//     //         // Update progress
//     //         setLoadingProgress(20);

//     //         // Call the external service function to handle all data fetching
//     //         const result = await fetchLifestyleData({
//     //             providers,
//     //             getProviderParams,
//     //             updateLoadingProgress: (progress) => setLoadingProgress(progress),
//     //             updateLoadingPhase: (phase) => setLoadingPhase(phase),
//     //             updateProviderStatus: (updater) => setProviderStatus(updater),
//     //             addData: (newData) => setData((prev) => [...prev, ...newData]),
//     //         });

//     //         // Handle any errors from the fetch service
//     //         if (result.error) {
//     //             setError(result.error);
//     //             ToastMessage({
//     //                 status: "error",
//     //                 message: result.error
//     //             });
//     //         }
//     //         setLoadingProgress(90);
//     //         handleEducationCategory();
//     //         // fetchLocations(result.data);
//     //     } catch (err) {
//     //         setError(err.message || "An error occurred while loading lifestyle products");
//     //         console.error("Error loading lifestyle products:", err);
//     //         ToastMessage({
//     //             status: "error",
//     //             message: "Failed to load lifestyle products. Please try again."
//     //         });
//     //     } finally {
//     //         setLoading(false);
//     //         setTimeout(() => {
//     //             setLoadingProgress(100);
//     //             setTimeout(() => {
//     //                 setBackgroundLoading(false);
//     //             }, 3000);
//     //         }, 500);
//     //     }
//     // };

//     const  handleTryAgain = ()=>{
//        setSearchObject({
//     search : "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   })

//     setSelectedLocation([]);
//     setSelectedSubCategory([]);
//     setSelectedPrice([]);
//     setFilterCheckboxes([]);

//     // Reset price filter to full range
//     if (pricerange.length >= 2) {
//       setminprice(pricerange[0]);
//       setmaxprice(pricerange[1]);
//     } else {
//       setminprice('');
//       setmaxprice('');
//     }

//     setpricefilter(false);
//     setDistance(20); // Reset to default distance

//     setUserMinMaxPrice({
//       min: pricerange[0] || '',
//       max: pricerange[1] || ''
//     });
//     setSelectedSortMethod('default'); // Reset sort method to default
//     handleChange('');
//     loadLifestyleProducts(); // Reload products
//     }

//     const loadLifestyleProducts = async (locationToUse = null) => {
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

//         // Use the provided location or current location
//         const activeLocation = locationToUse || currentLocation || baseLocation;

//         // Update progress
//         setLoadingProgress(20);

//         // Update getProviderParams to use the active location
//         const getProviderParamsUpdated = (provider) => ({
//     dataSet: JSON.stringify({
//         locationDescription: activeLocation?.address_full || "Colombo, Sri Lanka",
//         latitude: activeLocation?.latitude || 6.9271,
//         longitude: activeLocation?.longtitude || 79.8612,
//         place_id: activeLocation?.place_id || "",
//         isCountry: activeLocation?.isCountry || false,
//         dataSet: JSON.stringify({
//             id: activeLocation?.id || null,
//             description: activeLocation?.address_full || "Colombo, Sri Lanka",
//             latitude: String(activeLocation?.latitude || 6.9271),
//             longitude: String(activeLocation?.longtitude || 79.8612),
//             place_id: activeLocation?.place_id || "",
//             data: "null",
//             created_at: activeLocation?.created_at || new Date().toISOString(),
//             dataSet: null,
//             address_components: activeLocation?.address_components || []
//         })
//     }),
//     isCountry: activeLocation?.isCountry || false,
//     latitude: String(activeLocation?.latitude || 6.9271),
//     longitude: String(activeLocation?.longtitude || 79.8612),
//     page: 1,
//     pageSize: 50,
//     provider: provider,
//     radius: "20",
//     sortArray: "",
//     vendorId: 0
// });

// // console.log("Active Location:", getProviderParamsUpdated);

//         // Call the external service function to handle all data fetching
//         const result = await fetchLifestyleData({
//             providers,
//             getProviderParams: getProviderParamsUpdated,
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
//      const handleEducationCategory = async () => {
//         axios.get(`/fetch-all-categories`).then((res) => {
//           if (res.data.status == 200) {
//             const subCategories = res.data.subCategories || [];
    
//             const filteredCategories = subCategories
//               .filter((category) => category.maincat_id == 3)
//               .map((cat, index) => ({
//                 id: cat["id"],
//                 submaincat_type: cat["submaincat_type"],
//               }));
//             setCourseSubCategory(filteredCategories);
//           }
//         });
//       };
    

//     // Process discount data
//     const processDiscountData = (products) => {
//         const discountData = [];
//         products.forEach(item => {
//             if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
//                 discountData.push({
//                     discount: item.discount,
//                     product: item
//                 });
//             }
//         });
//         setAllDiscountData(discountData);
//     };

//     // Update filtered data when main data changes
//     useEffect(() => {
//   if (data.length > 0) {
//     // Apply current sort to new data
//     const sortedData = applySortToData(data);
//     setFilteredData(sortedData);
//     fetchLocations(data);
//     createPriceFilters(data);
//     processDiscountData(data);
//   }
// }, [data]);

//     // Load products on component mount
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

//     // Render loading skeleton
//     const renderLoadingSkeleton = () => (
//         <div className="row mx-0 mt-4 margin-default">
//             {[...Array(8)].map((_, index) => (
//                 <div key={index} className="col-xl-3 col-lg-4 col-6">
//                     <PostLoader />
//                 </div>
//             ))}
//         </div>
//     );


//     //price filter functions


//     const handleMinMaxPrice = (e) => {
//         setUserMinMaxPrice({
//             ...userMinMaxPrice,
//             [e.target.name]: e.target.value,
//         });
//     };

//      const openSubFilter = () => {
//     setopenSideBarStatus(true);
//   }

//   const closeSubFilter = () => {
//     setopenSideBarStatus(false);
//   }

//   const openSearchFilter = () => {
//     setSearchfilter(true);
//   }

//   const fetchLocations = async (dataset) => {
//     let fetchedLocations = [];
//     dataset.forEach((value) => {
//       const city = value.lifestyle_city.toLowerCase().trim();
//       if (!fetchedLocations.includes(city)) {
//         fetchedLocations.push(city);
//       }
//     });
//     setLocations(fetchedLocations.sort()); // Sorting the locations after fetching
//   };

//     const createPriceFilters = async (dataset) => {
//       console.log("Processing dataset:", dataset);
//       console.log("Base currency value:", baseCurrencyValue);
  
//       // If dataset is empty, set empty filters and return
//       if (!dataset || dataset.length === 0) {
//         setFilterByPriceButtons([]);
//         setminprice(0);
//         setmaxprice(0);
//         setpricerange([0, 0]);
//         return;
//       }
  
//       // Get valid currencies, with fallback
//       const validCurrencies = Object.keys(baseCurrencyValue?.rates || {});
//       const baseCurrency = baseCurrencyValue?.base || 'USD';
  
//       // FIXED: Same price extraction logic as filtering
//       const getSafePrice = (item) => {
//         let price = 0;
  
//         // Check if both adult_rate and child_rate are "0.00", then use package_rate
//         if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
//           (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
//           item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
  
//           price = item.package_rate;
  
//         }
//         // Use adult_rate if it's not zero
//         else if (item.adult_rate != null && item.adult_rate !== undefined &&
//           item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {
  
//           price = item.adult_rate;
  
//         }
//         // Check for bridgify provider with default_rate
//         else if (item.provider === "bridgify" && item.default_rate != null &&
//           item.default_rate !== undefined && item.default_rate !== 0) {
  
//           price = item.default_rate;
  
//         }
//         // Fallback to package_rate
//         else if (item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
  
//           price = item.package_rate;
  
//         }
//         // Last resort - use default_rate
//         else if (item.default_rate != null && item.default_rate !== undefined && item.default_rate !== 0) {
  
//           price = item.default_rate;
  
//         }
  
//         // Convert string to number and ensure it's valid
//         const numPrice = Number(price);
//         return isNaN(numPrice) ? 0 : numPrice;
//       };
  
//       // Helper function to convert currency with better error handling
//       const convertCurrency = (currency, amount, baseCurrencyValue) => {
//         try {
//           // If currency is the same as base, return amount directly
//           if (currency === baseCurrency) {
//             return Number(amount) || 0;
//           }
  
//           // If currency is not in valid currencies list, treat as base currency
//           if (!validCurrencies.includes(currency)) {
//             console.warn(`Currency ${currency} not found in rates, treating as ${baseCurrency}`);
//             return Number(amount) || 0;
//           }
  
//           // Use your existing converter function
//           const converted = CurrencyConverterOnlyRateWithoutDecimal(currency, amount, baseCurrencyValue);
//           return Number(converted) || 0;
//         } catch (error) {
//           console.error('Currency conversion error:', error);
//           return Number(amount) || 0;
//         }
//       };
  
//       // Filter out items with zero prices and prepare for sorting
//       const itemsWithPrices = dataset
//         .map(item => {
//           const price = getSafePrice(item);
//           const currency = item.currency || baseCurrency;
//           const convertedPrice = convertCurrency(currency, price, baseCurrencyValue);
  
//           return {
//             ...item,
//             originalPrice: price,
//             convertedPrice: convertedPrice,
//             effectiveCurrency: currency
//           };
//         })
//         .filter(item => item.convertedPrice > 0); // Remove items with zero or invalid prices
  
//       console.log("Items with converted prices:", itemsWithPrices.slice(0, 3)); // Log first 3 for debugging
  
//       // If no valid items after filtering, set default values
//       if (!itemsWithPrices.length) {
//         console.warn("No items with valid prices found");
//         setFilterByPriceButtons([]);
//         setminprice(0);
//         setmaxprice(0);
//         setpricerange([0, 0]);
//         return;
//       }
  
//       // Sort by converted price
//       const sortedItems = itemsWithPrices.sort((a, b) => a.convertedPrice - b.convertedPrice);
  
//       // Get min and max prices
//       const minPrice = sortedItems[0].convertedPrice;
//       const maxPrice = sortedItems[sortedItems.length - 1].convertedPrice;
  
//       console.log("Price range:", { minPrice, maxPrice });
  
//       // Create price ranges
//       let result = createPriceSteps(minPrice, maxPrice);
  
//       // Handle edge case where min and max are the same
//       if (minPrice === maxPrice || result.length === 0) {
//         result = [{ start: minPrice, end: maxPrice || minPrice }];
//       }
  
//       // Set state values
//       const rangeStart = result[0].start;
//       const rangeEnd = result[result.length - 1].end;
  
//       setpricerange([rangeStart, rangeEnd]);
//       setFilterByPriceButtons(result);
//       setTempCurrency(baseCurrency);
  
//       setUserMinMaxPrice({
//         min: rangeStart,
//         max: rangeEnd
//       });
  
//       if (!pricefilter) {
//         setpricefilter(false);
//         setminprice(rangeStart);
//         setmaxprice(rangeEnd);
//       }
  
//       console.log("Final price filter setup:", {
//         priceRange: [rangeStart, rangeEnd],
//         filterButtons: result.length,
//         currency: baseCurrency
//       });
//     };

//     const handlePriceFilterChange = async (value) => {
//     console.log("Selected price range:", value);
//     setpricefilter(true);
//     setminprice(value.start);
//     setmaxprice(value.end);

//     // Update user input fields to match selected range
//     setUserMinMaxPrice({
//       min: value.start,
//       max: value.end
//     });
//     setSearchObject({
//       ...searchObject,
//         priceRance: [value.start, value.end],
//     })
//   };

//    const handleClearAllFilters = async () => {
//   setSearchObject({
//     search: "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   });

//   setSelectedLocation([]);
//   setSelectedSubCategory([]);
//   setSelectedPrice([]);
//   setFilterCheckboxes([]);

//   // Reset price filter to full range
//   if (pricerange.length >= 2) {
//     setminprice(pricerange[0]);
//     setmaxprice(pricerange[1]);
//   } else {
//     setminprice('');
//     setmaxprice('');
//   }

//   setpricefilter(false);
//   setDistance(20);

//   setUserMinMaxPrice({
//     min: pricerange[0] || '',
//     max: pricerange[1] || ''
//   });

//   handleChange('');
  
//   // Apply current sort to the original data instead of just setting it
//   const sortedData = applySortToData(data);
//   setFilteredData(sortedData);
// };


//     // Render empty state
//     const renderEmptyState = () => (
//         <Col xs="12">
//             <div className="my-5">
//                 <div className="col-sm-12 empty-cart-cls text-center">
//                     <img
//                         alt='No products available'
//                         src='/assets/images/ErrorImages/file.png'
//                         className="img-fluid mb-4 mx-auto"
//                     />
//                     <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
//                         Sorry, there are no lifestyle products available right now.
//                     </h4>
//                     <h4 style={{ fontSize: 15 }}>
//                         Please check back later or explore other options.
//                     </h4>
//                     <button
//                         className="btn btn-solid mt-3"
//                         onClick={handleTryAgain}
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         </Col>
//     );

//       const handleChange = async (query) => {
//     setUserSearchQuery(query);
//     try {
//       if (query === '' || query == undefined) {
//         setFilteredData(data);
//       } else {
//         if (data.length === 0) {
//           let searchLifeStyles = data.filter((lifeStyle) => {
//             if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
//               return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
//             }
//           });
//           setFilteredData(searchLifeStyles);
//         } else {
//           let searchLifeStyles = data.filter((lifeStyle) => {
//             if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
//               return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
//             }
//           });
//           setFilteredData(searchLifeStyles);
//         }
//       }
//     } catch (error) {
//       setData([])
//     }
//   }


//     const handleOnCourseCategoryChange = (value, displayName) => {
//     // Check if selectedSubCategory already has this value
//     const isExist = selectedSubCategory?.[0] === value;

//     // Always update the selectedSubCategory with the new value


//     // console.log(isExist, "Is Existing Data is");

//     if (!isExist) {
//       setSelectedSubCategory([value]);
//       // This is a new selection, so update filters
//       const dataset = { value, type: "sub_category", displayName };
//       console.log(dataset, "Dataset is");
//       const sampledataset = [dataset];
//       setFilterCheckboxes(sampledataset);

//       // console.log(value, "Data value is");

//       setBackEndFilters({
//         ...backEndFilters,
//         category1: value,
//       });

//       setSearchObject({
//         ...searchObject,
//         subCategory: [value],
//       });
//     //   fetchFilteredData(value);


//     } else {
//       // This is a de-selection, so clear filters
//       setFilterCheckboxes([]);
//       setSelectedSubCategory([]);
//       setBackEndFilters({
//         ...backEndFilters,
//         category1: 0,
//       });
      
//     }
//   };

//    const handleLocationChange = async (value) => {
//     const index = selectedLocation.indexOf(value)
//     let newLocations = [...selectedLocation]
//     if (index === -1) {
//       newLocations.unshift(value);
//     } else {
//       newLocations.splice(index, 1);
//     }
//     setSearchObject({
//       ...searchObject,
//       location: newLocations,
//     })
//     setSelectedLocation(newLocations);
//   }

//   const handleSearchPriceRange = () => {
//     const regex = /^\d+(\.\d+)?$/; // Allow decimal numbers

//     if (regex.test(userMinMaxPrice.min) && regex.test(userMinMaxPrice.max)) {
//       const minPrice = Number(userMinMaxPrice.min);
//       const maxPrice = Number(userMinMaxPrice.max);

//       if (minPrice > maxPrice) {
//         ToastMessage({
//           status: "warning",
//           message: 'Please ensure that the minimum price is lower than the maximum price.'
//         });
//         return;
//       }

//       if (pricerange.length >= 2) {
//         if (minPrice < pricerange[0] || maxPrice > pricerange[1]) {
//           ToastMessage({
//             status: "warning",
//             message: `Price range should be between ${pricerange[0]} and ${pricerange[1]}.`
//           });
//           return;
//         }
//       }

//       setminprice(minPrice);
//       setmaxprice(maxPrice);
//       setpricefilter(true); // Mark that price filter is active
//        setSearchObject({
//       ...searchObject,
//         priceRance: [minPrice, maxPrice],
//     })
//     } else {
//       ToastMessage({
//         status: "warning",
//         message: 'Please enter valid numeric values for price range.'
//       });
//     }
//   };

//     const closeSearchFilter = () => {
//     setSearchfilter(false);
//     handleChange('')
//   }
// const manageUserSelectFilters = () => {
//   // Start with the original data for filtering
//   const filtered = data.filter(product => {
//     // 1. Search filter
//     if (userSearchQuery && userSearchQuery.trim() !== '') {
//       if (!product.lifestyle_name.toLowerCase().includes(userSearchQuery.toLowerCase())) {
//         return false;
//       }
//     }

//     // 2. Price range filter
//     if (searchObject.priceRance[0] > 0 || searchObject.priceRance[1] > 0) {
//       // Use the same price extraction logic as createPriceFilters
//       const getSafePrice = (item) => {
//         let price = 0;
        
//         if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
//           (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
//           item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
//           price = item.package_rate;
//         } else if (item.adult_rate != null && item.adult_rate !== undefined &&
//           item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {
//           price = item.adult_rate;
//         } else if (item.provider === "bridgify" && item.default_rate != null &&
//           item.default_rate !== undefined && item.default_rate !== 0) {
//           price = item.default_rate;
//         } else if (item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
//           price = item.package_rate;
//         } else if (item.default_rate != null && item.default_rate !== undefined && item.default_rate !== 0) {
//           price = item.default_rate;
//         }
        
//         const numPrice = Number(price);
//         return isNaN(numPrice) ? 0 : numPrice;
//       };

//       const productPrice = getSafePrice(product);
      
//       // Convert price to base currency if needed
//       let convertedPrice = productPrice;
//       if (product.currency && product.currency !== tempCurrency) {
//         convertedPrice = CurrencyConverterOnlyRateWithoutDecimal(
//           product.currency, 
//           productPrice, 
//           baseCurrencyValue
//         );
//       }

//       const minPrice = searchObject.priceRance[0];
//       const maxPrice = searchObject.priceRance[1];

//       if (minPrice > 0 && convertedPrice < minPrice) {
//         return false;
//       }
//       if (maxPrice > 0 && convertedPrice > maxPrice) {
//         return false;
//       }
//     }

//     // 3. Sub category filter
//     if (searchObject.subCategory.length > 0) {
//       const productCategory = parseInt(product.category_2) || 0;
//       const matchesSubCategory = searchObject.subCategory.some(selectedCategory => 
//         productCategory === parseInt(selectedCategory)
//       );
//       if (!matchesSubCategory) {
//         return false;
//       }
//     }

//     // 4. Location filter
//     if (searchObject.location.length > 0) {
//       const productLocation = product.lifestyle_city?.toLowerCase().trim() || '';
//       const matchesLocation = searchObject.location.some(selectedLocation => 
//         productLocation === selectedLocation.toLowerCase().trim()
//       );
//       if (!matchesLocation) {
//         return false;
//       }
//     }

//     // 5. Distance filter
//     if (searchObject.distance && searchObject.distance !== 20) {
//       const productDistance = parseFloat(product.distance) || 0;
//       const roundedDistance = Math.round(productDistance);
//       const maxDistance = parseInt(searchObject.distance);
      
//       if (roundedDistance > maxDistance) {
//         return false;
//       }
//     }

//     return true;
//   });

//   // Apply the current sort method to the filtered data
//   const sortedAndFiltered = applySortToData(filtered);
  
//   setFilteredData(sortedAndFiltered);
//   console.log("Filtered and sorted products:", sortedAndFiltered.length);
// };

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


//   useEffect(() => {
//     manageUserSelectFilters();
//     console.log("Search object updated:", searchObject);
//   }, [selectedSubCategory, minprice, maxprice, distance, searchObject]);


//   const handleSelectChange = (selectedOption) => {
//     setSelectedSortMethod(selectedOption.value);
//   };

// const handleSortChange = () => {
//   console.log("Current sort method:", selectedSortMethod);
//   console.log("Total products before sorting:", filteredData.length);
  
//   // Apply sorting to the currently filtered data
//   const sortedData = applySortToData(filteredData);
  
//   console.log("Products after sorting:", sortedData.length);
//   console.log("Sort method applied successfully:", selectedSortMethod);

//   setFilteredData(sortedData);
// };


// useEffect(() => {
//   if (filteredData.length > 0) {
//     setLoading(true);
//     handleSortChange();
//     setLoading(false);
//   }
// }, [selectedSortMethod]);

//     // Render error state
//     const renderErrorState = () => (
//         <Col xs="12">
//             <div className="my-5">
//                 <div className="col-sm-12 empty-cart-cls text-center">
//                     <img
//                         alt='Error loading products'
//                         src='/assets/images/ErrorImages/error.png'
//                         className="img-fluid mb-4 mx-auto"
//                     />
//                     <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
//                         Oops! Something went wrong
//                     </h4>
//                     <h4 style={{ fontSize: 15 }}>
//                         {error || "Unable to load lifestyle products"}
//                     </h4>
//                     <button
//                         className="btn btn-solid mt-3"
//                         onClick={loadLifestyleProducts}
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         </Col>
//     );


//       const handleOnGoogleLocationChange = (value) => {
//     setGoogleLocation(value['label'].slice(0, 25) + '...');
    
//     geocodeByPlaceId(value['value']['place_id'])
//         .then(results => getLatLng(results[0]))
//         .then(({ lat, lng }) => {
//             geocodeByLatLng({ lat: lat, lng: lng })
//                 .then(async results => {
//                     const newLocation = {
//                         address_full: value['label'],
//                         latitude: lat,
//                         longtitude: lng,
//                         address_components: results[0].address_components
//                     };

//                     // Update states
//                     setUserSelectedLocation(newLocation);
//                     setCurrentLocation(newLocation);
//                     setIsUsingGlobalLocation(false);

//                     console.log("Selected new location:", newLocation);
                    
//                     // Reload products with new location
//                     loadLifestyleProducts(newLocation);
//                 })
//                 .catch((error) => {
//                     console.error("Geocoding error:", error);
//                     setLoading(false);
//                     ToastMessage({
//                         status: "error",
//                         message: "Failed to get location details"
//                     });
//                 });
//         })
//         .catch((error) => {
//             console.error("Place details error:", error);
//             setLoading(false);
//             ToastMessage({
//                 status: "error",
//                 message: "Failed to get place details"
//             });
//         });
// };


//        const handleClearSearchData = async () => {
//     console.log("Clearing location search, reverting to global location");
    
//     setLoading(true);
    
//     try {
//         // Reset to global location
//         setCurrentLocation(globalLocation);
//         setUserSelectedLocation(null);
//         setIsUsingGlobalLocation(true);
//         setGoogleLocation('search');
        
//         // Reload products with global location
//         await loadLifestyleProducts(globalLocation);
        
//         ToastMessage({
//             status: "success",
//             message: "Location reset to global location"
//         });
//     } catch (error) {
//         console.error("Error clearing location:", error);
//         ToastMessage({
//             status: "error",
//             message: "Failed to reset location"
//         });
//     } finally {
//         setLoading(false);
//     }
// };

// const uniqueLifestyles = (arrayData) => {
//   const uniqueMap = new Map();
 
//   if (!Array.isArray(arrayData) || arrayData.length === 0) {
//     return [];
//   }
 
//   const uniqueItems = arrayData.filter((item) => {
//     if (!item.lifestyle_id) {
//       return false;
//     }
   
//     const isDuplicate = uniqueMap.has(item.lifestyle_id);
   
//     if (!isDuplicate) {
//       uniqueMap.set(item.lifestyle_id, true);
//       return true;
//     }
   
//     return false;
//   }); 

//   // Don't apply additional sorting here since data is already sorted
//   // The sort order should be preserved from the filtered data
//   return uniqueItems;
// };

//     return (
//         <>
//             <Head>
//                 <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//                 <title>Aahaas - Lifestyle</title>
//                 <meta
//                     name="description"
//                     content="Experience the essence of travel with Aahaas' Lifestyle offerings, designed to enrich your journey. Discover a wide array of activities, from thrilling adventures to immersive cultural experiences, paired with exquisite dining and wellness options."
//                 />
//                 <script
//                     type="application/ld+json"
//                     dangerouslySetInnerHTML={{
//                         __html: JSON.stringify({
//                             "@context": "https://schema.org",
//                             "@type": "BreadcrumbList",
//                             "itemListElement": [
//                                 {
//                                     "@type": "ListItem",
//                                     "position": 1,
//                                     "name": "Home",
//                                     "item": "https://www.aahaas.com/"
//                                 },
//                                 {
//                                     "@type": "ListItem",
//                                     "position": 2,
//                                     "name": "Lifestyle",
//                                     "item": "https://www.aahaas.com/lifestyle"
//                                 }
//                             ]
//                         }),
//                     }}
//                 />
//             </Head>

//             <CommonLayout
//                 title="Lifestyle"
//                 parent="home"
//                 showMenuIcon={true}
//                 showSearchIcon={false}
//                 openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}
//             >
//                 <section className="section-b-space ratio_asos mt-lg-5">
//                     <div className="collection-wrapper">
//                         <Container>
//                             <Row>
//                                 <Col
//                                     sm="3"
//                                     className="collection-filter"
//                                     id="filter"
//                                     style={{
//                                         left: openSideBarStatus ? "0px" : "",
//                                     }}
//                                 >

//                                     <div
//                                         className="collection-filter-block px-lg-4 pe-5"
//                                         style={{ borderRadius: "12px" }}
//                                     >
//                                         <div
//                                             className="collection-mobile-back"
//                                             onClick={() => closeSubFilter()}
//                                         >
//                                             <span className="filter-back">
//                                                 <i className="fa fa-angle-left"></i>back
//                                             </span>
//                                         </div>

//                                         {/* <div style={{marginTop:"5px", }}>
//                                             <Button
//                                                 className="btn btn-solid"
//                                                 style={{ width: "100%", marginBottom: "10px", borderRadius: "7px", padding: "10px" }}
//                                                 onClick={() => handleFilter()}
                                            
//                                             >
//                                                 Apply Filters
//                                                 {openSideBarStatus ? "Close Filters" : "Apply Filters"}
//                                             </Button>
//                                         </div> */}

//                                         <div className="collection-collapse-block">
// <div className="collection-collapse-block hotel-sidebar-filters-sub">
//     <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
//         Search by Location
//         {!isUsingGlobalLocation && (
//             <span className="badge badge-primary ms-2" style={{ fontSize: '10px' }}>
//                 Custom Location
//             </span>
//         )}
//     </h5>
    
//     <div className="location-input-container" style={{ position: 'relative' }}>
//         <GooglePlacesAutocomplete
//             apiKey={groupApiCode}
//             selectProps={{
//                 value: googleLocation,
//                 placeholder: googleLocation === 'search' ? 'Search for a location...' : googleLocation,
//                 onChange: (e) => handleOnGoogleLocationChange(e),
//                 onClick: (e) => setGoogleLocation(''),
//                 styles: {
//                     container: (provided) => ({
//                         ...provided,
//                         width: '100%'
//                     }),
//                     control: (provided) => ({
//                         ...provided,
//                         paddingRight: '30px'
//                     }),
//                     dropdownIndicator: () => ({
//                         display: 'none'
//                     }),
//                     indicatorSeparator: () => ({
//                         display: 'none'
//                     })
//                 }
//             }}
//         />
//         {googleLocation !== 'search' && !isUsingGlobalLocation && (
//             <div
//                 style={{
//                     position: 'absolute',
//                     right: '10px',
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     cursor: 'pointer',
//                     zIndex: 2
//                 }}
//                 onClick={() => handleClearSearchData()}
//                 title="Clear location and use global location"
//             >
//                 <CloseIcon sx={{ fontSize: '18px' }} />
//             </div>
//         )}
//     </div>
// </div>

//                                             <h5
//                                                 style={{ fontWeight: "500", fontSize: "15px" }}
//                                                 className={
//                                                     priceFilterOpen
//                                                         ? "collapse-block-title-selected"
//                                                         : "collapse-block-title"
//                                                 }
//                                                 onClick={() => setpriceFilterOpen(!priceFilterOpen)}
//                                             >
//                                                 Price
//                                             </h5>
//                                             <Collapse isOpen={priceFilterOpen}>
//                                                 <div className="collection-collapse-block-content">
//                                                     <div className="collection-brand-filter">
//                                                         <ul className="category-list">
//                                                             {filterByPriceButtons?.map((value, key) => (
//                                                                 <div
//                                                                     className="form-check custom-checkbox collection-filter-checkbox"
//                                                                     key={key}
//                                                                 >
//                                                                     <Input
//                                                                         checked={
//                                                                             value.start == minprice &&
//                                                                             value.end == maxprice
//                                                                         }
//                                                                         onChange={() =>
//                                                                             handlePriceFilterChange(value)
//                                                                         }
//                                                                         name={value}
//                                                                         id={value}
//                                                                         type="radio"
//                                                                         className="custom-control-input option-btns"
//                                                                     />
//                                                                     {/* <h6 className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)}  - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6> */}
//                                                                     <h6 className="m-0 p-0" htmlFor={value}>
//                                                                         {!isNaN(value.start) && value.start != null
//                                                                             ? CurrencyConverter(
//                                                                                 tempCurrency,
//                                                                                 value.start,
//                                                                                 baseCurrencyValue
//                                                                             ).replace(/\.00$/, "")
//                                                                             : `${tempCurrency} 0`}{" "}
//                                                                         -
//                                                                         {!isNaN(value.end) && value.end != null
//                                                                             ? CurrencyConverter(
//                                                                                 tempCurrency,
//                                                                                 value.end,
//                                                                                 baseCurrencyValue
//                                                                             ).replace(/\.00$/, "")
//                                                                             : `${tempCurrency} 0`}
//                                                                     </h6>
//                                                                 </div>
//                                                             ))}
//                                                         </ul>
//                                                     </div>
//                                                 </div>
//                                                 <div className="collection-collapse-block-content">
//                                                     <div className="collection-brand-filter">
//                                                         <div className="d-flex align-items-end align-content-stretch gap-3">
//                                                             <div className="d-flex flex-column align-itmes-end col-4">
//                                                                 <h6
//                                                                     className="m-0 p-0"
//                                                                     style={{ fontSize: "14px" }}
//                                                                 >
//                                                                     Min price
//                                                                 </h6>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control"
//                                                                     style={{
//                                                                         padding: "9px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                     placeholder="Min"
//                                                                     value={userMinMaxPrice.min}
//                                                                     min={pricerange[0]}
//                                                                     max={pricerange[1]}
//                                                                     name="min"
//                                                                     onChange={(e) => handleMinMaxPrice(e)}
//                                                                 />
//                                                             </div>
//                                                             <div className="d-flex flex-column align-itmes-end col-4">
//                                                                 <h6
//                                                                     className="m-0 p-0"
//                                                                     style={{ fontSize: "14px" }}
//                                                                 >
//                                                                     Max price
//                                                                     {/* Max price - {`${baseCurrency}`} */}
//                                                                 </h6>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control"
//                                                                     style={{
//                                                                         padding: "9px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                     placeholder="Max"
//                                                                     value={userMinMaxPrice.max}
//                                                                     max={pricerange[1]}
//                                                                     min={pricerange[0]}
//                                                                     name="max"
//                                                                     onChange={(e) => handleMinMaxPrice(e)}
//                                                                 />
//                                                             </div>
//                                                             <div className="ms-auto col-3">
//                                                                 <button
//                                                                     className="btn btn-sm btn-solid"
//                                                                     style={{
//                                                                         padding: "7px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                   onClick={handleSearchPriceRange}
//                                                                 >
//                                                                     <SearchIcon />
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </Collapse>
//                                         </div>

//                                                                          <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className={
//                                                 courseSubFilter
//                                                     ? "collapse-block-title-selected"
//                                                     : "collapse-block-title"
//                                             }
//                                             onClick={() => setCourseSubFilter(!courseSubFilter)}
//                                         >
//                                             Sub Category
//                                         </h5>
//                                         <Collapse isOpen={courseSubFilter}>
//                                             <div className="collection-collapse-block-content">
//                                                 <div className="collection-brand-filter">
//                                                     <ul className="category-list">
//                                                         {courseSubCategory.map((course, key) => (
//                                                             <div
//                                                                 className="form-check custom-checkbox collection-filter-checkbox"
//                                                                 key={key}
//                                                             >
//                                                                 <Input
//                                                                     className="custom-control-input option-btns"
//                                                                     type="radio"
//                                                                     value={course?.id}
//                                                                     id={course?.id}
//                                                                     checked={selectedSubCategory.includes(
//                                                                         course?.id
//                                                                     )}
//                                                                     onChange={() => {
//                                                                         handleOnCourseCategoryChange(
//                                                                             course?.id,
//                                                                             course?.submaincat_type
//                                                                         );
//                                                                     }}
//                                                                     name="subCategory"
//                                                                 />
//                                                                 <h6 className="m-0 p-0" htmlFor={course}>
//                                                                     {course?.submaincat_type}
//                                                                 </h6>
//                                                             </div>
//                                                         ))}
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </Collapse>
//                                     </div>

                                   
//                                     {/* <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className={
//                                                 locationfilterOpen
//                                                     ? "collapse-block-title-selected"
//                                                     : "collapse-block-title"
//                                             }
//                                             onClick={() =>
//                                                 setlocationfilterOpen(!locationfilterOpen)
//                                             }
//                                         >
//                                             Location
//                                         </h5>
//                                         <Collapse isOpen={locationfilterOpen}>
//                                             <div className="collection-collapse-block-content">
//                                                 <div className="collection-brand-filter">
//                                                     <ul className="category-list">
//                                                         {locations
//                                                             ?.filter(
//                                                                 (value) => value && value.trim() !== ""
//                                                             )
//                                                             ?.map((value, index) => (
//                                                                 <div
//                                                                     className="form-check custom-checkbox collection-filter-checkbox"
//                                                                     key={index}
//                                                                 >
//                                                                     <Input
//                                                                         checked={selectedLocation.includes(value)}
//                                                                         onChange={() => {
//                                                                             handleLocationChange(value);
//                                                                         }}
//                                                                         name={value}
//                                                                         id={value}
//                                                                         type="checkbox"
//                                                                         className="custom-control-input option-btns"
//                                                                     />
//                                                                     <h6
//                                                                         className="m-0 p-0"
//                                                                         htmlFor={value}
//                                                                         style={{ textTransform: "capitalize" }}
//                                                                     >
//                                                                         {value}
//                                                                     </h6>
//                                                                 </div>
//                                                             ))}
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </Collapse>
//                                     </div> */}

//                                      <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className="collapse-block-title-hotel"
//                                         >
//                                             Search by distance (km)
//                                         </h5>
//                                         <div className="collection-collapse-block-content">
//                                             <div className="collection-brand-filter d-flex align-items-stretch">
//                                                 <input
//                                                     type="number"
//                                                     className="form-control"
//                                                     style={{
//                                                         borderTopLeftRadius: "5px",
//                                                         borderBottomLeftRadius: "5px",
//                                                     }}
//                                                     value={distance}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value;
//                                                         if (value <= 2000) {
//                                                             setDistance(value);
//                                                             setSearchObject({
//                                                                 ...searchObject,
//                                                                 distance: value,
//                                                             });
//                                                         } else {
//                                                             ToastMessage({
//                                                                 status: "warning",
//                                                                 message:
//                                                                     "Distance should not exceed 2000 km.",
//                                                             });
//                                                         }
//                                                     }}
//                                                 />
//                                                 {/* <button
//                                                     className="px-3 btn btn-sm btn-solid"
//                                                     style={{
//                                                         borderTopRightRadius: "5px",
//                                                         borderBottomRightRadius: "5px",
//                                                     }}
//                                                     onClick={() => handleSearchfilter()}
//                                                 >
//                                                     <SearchIcon />
//                                                 </button> */}
//                                             </div>
//                                         </div>
//                                     </div>


//                                     </div>

                               
//                                 </Col>
//                                 <Col className="collection-content" sm="12" md="12" lg="9">
//                                     {/* Banner Section */}
//                                     <div className="d-none d-lg-block d-md-block top-banner-wrapper">
//                                         <a href={null}>
//                                             <Image
//                                                 src={Menu2}
//                                                 placeholder="blur"
//                                                 alt="Lifestyle Banner"
//                                                 layout="responsive"
//                                                 height={500}
//                                                 width={2000}
//                                                 quality={25}
//                                                 priority
//                                                 loading="eager"
//                                             />
//                                         </a>
//                                     </div>

//                                     <div className="collection-product-wrapper mt-0 mt-lg-4">
//                                         {/* Product Count Header */}
//                                         <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
//                                             <h5 className="p-0 m-0" style={{ fontSize: '18px', fontWeight: '600' }}>
//                                                 {loading ? (
//                                                     "Loading Lifestyle Products..."
//                                                 ) : (
//                                                     `Showing ${filteredData.length} Products`
//                                                 )}
//                                             </h5>

//                                             {/* Loading Progress Bar */}
//                                             {backgroundLoading && (
//                                                 <div className="ms-auto col-12 col-lg-4">
//                                                     <div className="progress" style={{ height: '6px' }}>
//                                                         <div
//                                                             className="progress-bar bg-primary"
//                                                             role="progressbar"
//                                                             style={{ width: `${loadingProgress}%` }}
//                                                             aria-valuenow={loadingProgress}
//                                                             aria-valuemin="0"
//                                                             aria-valuemax="100"
//                                                         ></div>
//                                                     </div>
//                                                     <small className="text-muted">
//                                                         Phase {loadingPhase} - {loadingProgress}%
//                                                     </small>
//                                                 </div>
//                                             )}

//                                             {
//                                                 !backgroundLoading && (
//                                                      <><div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
//                                                         <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                                         {userSearchQuery === '' ? <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                                     </div>
//                                                     <div className="col-3 d-none d-lg-block" style={{ position: "relative", zIndex: 1050 }}>
//                                                             <Select
//                                                                 styles={{
//                                                                     menu: (provided) => ({
//                                                                         ...provided,
//                                                                         zIndex: 1100, // Ensures dropdown appears on top
//                                                                         position: "absolute",
//                                                                     }),
//                                                                 }}
//                                                                 options={options}
//                                                                 onChange={handleSelectChange} 
//                                                                 />
//                                                         </div></>
//                                                 )
//                                             }
//                                         </div>

//                                         {/* Discount Products Slider */}
//                                         {allDiscountData.length > 0 && (
//                                             <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3 mt-3">
//                                                 <ProductSlider allDiscountData={allDiscountData} type={"lifeStyles"} />
//                                             </div>
//                                         )}

//                                            <ul className="product-filter-tags p-0 m-0 my-2">
//                                                                     {
//                                                                       pricefilter &&
//                                                                       <li>
//                                                                         {/* <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i></a> */}
//                                                                         <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} </a>
//                                                                       </li>
//                                                                     }
//                                                                     {
//                                                                       selectedLocation.map((brand, i) => (
//                                                                         <li key={i}>
//                                                                           {/* <a href={null} className="filter_tag">{brand}<i className="fa fa-close" onClick={() => handleLocationChange(brand)}></i></a> */}
//                                                                           <a href={null} className="filter_tag">{brand}</a>
//                                                                         </li>
//                                                                       ))
//                                                                     }
//                                                                     {selectedSubCategory.map((value, i) => {
//                                                                       const subCategory = courseSubCategory.find(
//                                                                         (cat) => cat.id === value
//                                                                       );
//                                                                       return (
//                                                                         <li key={i}>
//                                                                           <a href={null} className="filter_tag">
//                                                                             {subCategory?.submaincat_type}
//                                                                             {/* <i
//                                                                               className="fa fa-close"
//                                                                               onClick={() =>
//                                                                                 handleOnCourseCategoryChange(
//                                                                                   value,
//                                                                                   subCategory?.submaincat_type
//                                                                                 )
//                                                                               }
//                                                                             ></i> */}
//                                                                           </a>
//                                                                         </li>
//                                                                       );
//                                                                     })}
//                                                                     {
//                                                                       (pricefilter || selectedLocation.length > 0 || selectedSubCategory.length > 0) &&
//                                                                       <li onClick={() => handleClearAllFilters()}>
//                                                                         <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                                                                       </li>
//                                                                     }
//                                                                   </ul>

//                                         {/* Products Grid */}
//                                         <Row className="mt-4">
//                                             {loading ? (
//                                                 renderLoadingSkeleton()
//                                             ) : error ? (
//                                                 renderErrorState()
//                                             ) : filteredData.length === 0 ? (
//                                                 renderEmptyState()
//                                             ) : (
//                                                 uniqueLifestyles(filteredData).map((product, i) => (
//                                                     <div className={grid} key={i}>
//                                                         <ProductItems
//                                                             product={product}
//                                                             productImage={product?.image}
//                                                             productstype={"lifestyle"}
//                                                             title={product?.lifestyle_name}
//                                                             productcurrency={product?.currency}
//                                                             adultRate={product?.adult_rate}
//                                                             packageRate={product?.package_rate}
//                                                             childRate={product?.child_rate}
//                                                             description={product?.lifestyle_description}
//                                                             rating={4}
//                                                             cartClass={"cart-info cart-wrap"}
//                                                             backImage={true}
//                                                         />
//                                                     </div>
//                                                 ))
//                                             )}
//                                         </Row>

//                                         {/* Provider Status (for debugging - can be removed in production) */}
//                                         {process.env.NODE_ENV === 'development' && (
//                                             <div className="mt-4">
//                                                 <details>
//                                                     <summary>Provider Status (Dev Only)</summary>
//                                                     <pre>{JSON.stringify(providerStatus, null, 2)}</pre>
//                                                 </details>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </Col>
//                             </Row>
//                         </Container>
//                     </div>
//                 </section>
//             </CommonLayout>
//         </>
//     );
// }



// import React, { useState, useEffect, useContext } from "react";
// import {
//     Button,
//     Col,
//     Collapse,
//     Container,
//     Input,
//     Media,
//     Row,
// } from "reactstrap";
// import Head from 'next/head';
// import { useRouter } from "next/router";
// import Image from "next/image";


// // Import components from your old code
// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import PostLoader from "../../skeleton/PostLoader";
// import ProductSlider from "../productImageSlider";
// import ToastMessage from "../../../components/Notification/ToastMessage";
// import SearchIcon from "@mui/icons-material/Search";
// import CloseIcon from "@mui/icons-material/Close";
// import Select from "react-select";

// // Import your context and services
// import { AppContext } from "../../_app";
// // import { fetchLifestyleData } from "../../../services/lifestyleService"; // Assuming you have this service

// // Import banner image
// import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg";
// import { fetchLifestyleData } from "../../../AxiosCalls/LifestyleServices/newLifeStyleService";
// import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
// import axios from "axios";
// import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";
// import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
// import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// export default function LifestyleProducts() {
//     const router = useRouter();
//     const canonicalUrl = router.asPath;
//     const { baseLocation, baseCurrencyValue, baseCurrency, groupApiCode } = useContext(AppContext);

//     // State management
//     const [loading, setLoading] = useState(true);
//     const [backgroundLoading, setBackgroundLoading] = useState(false);
//     const [loadingPhase, setLoadingPhase] = useState(1);
//     const [loadingProgress, setLoadingProgress] = useState(0);
//     const [error, setError] = useState(null);

//     const [data, setData] = useState([]);
//     const [filteredData, setFilteredData] = useState([]);
//     const [allDiscountData, setAllDiscountData] = useState([]);

//     const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

//     //filters
//     const [openSideBarStatus, setopenSideBarStatus] = useState(false);
//     const [priceFilterOpen, setpriceFilterOpen] = useState(true);
//     const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
//     const [userMinMaxPrice, setUserMinMaxPrice] = useState({
//         min: "",
//         max: "",
//     });
//     const [minprice, setminprice] = useState("");
//     const [maxprice, setmaxprice] = useState("");
//     const [pricerange, setpricerange] = useState([]);
//     const [pricefilter, setpricefilter] = useState(false);
//     const [locationfilterOpen, setlocationfilterOpen] = useState(true);
//     const [locations, setLocations] = useState([]);
//     const [courseSubFilter, setCourseSubFilter] = useState(true);
//     const [courseSubCategory, setCourseSubCategory] = useState([]);
//     const [distance, setDistance] = useState(20);
//     const [userSearchQuery, setUserSearchQuery] = useState('');
//     const [searchFilter, setSearchfilter] = useState(false);
//     const [selectedSubCategory, setSelectedSubCategory] = useState([]);
//     const [selectedLocation, setSelectedLocation] = useState([]);
//     const [tempCurrency, setTempCurrency] = useState('');
//     const [selectedPrice, setSelectedPrice] = useState([]);
//     const [filterCheckboxes, setFilterCheckboxes] = useState([]);
//     const [filteredLifeStyleData, setFilteredLifeStyleData] = useState([]);
//      const [backEndFilters, setBackEndFilters] = useState({
//     category1: null,
//     category2: null,
//     category3: null,
//     limit: 50,
//   });
//   const [searchObject, setSearchObject] = useState({
//     search : "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   })
//   const [selectedSortMethod, setSelectedSortMethod] = useState('default');
//   const [googleLocation, setGoogleLocation] = useState('search');
//   const [globalLocation, setGlobalLocation] = useState(null);
// const [currentLocation, setCurrentLocation] = useState(null); 
// const [userSelectedLocation, setUserSelectedLocation] = useState(null);
// const [isUsingGlobalLocation, setIsUsingGlobalLocation] = useState(true); 

//     const options = [
//     { value: "default", label: "Default" },
//     { value: "newArrival", label: "New Arrivals" },
//     { value: "featured", label: "Featured" },
//     { value: "priceLH", label: "Price Low to High" },
//     { value: "priceHL", label: "Price High to Low" },
//     { value: "distanceLH", label: "Distance Low to High" },
//     { value: "distanceHL", label: "Distance High to Low" },
//   ];

//     // Provider status for tracking multiple data sources
//     //   const initialProviderStatus = {
//     //     provider1: { loading: false, completed: false, error: null },
//     //     provider2: { loading: false, completed: false, error: null },
//     //     // Add more providers as needed
//     //   };

//     const providers = ["bridgify", "aahaas" , "globaltix"];
//     // const providers = ["globaltix"];

//     const [providerStatus, setProviderStatus] = useState(providers);

//     // Mock providers configuration - replace with your actual providers


//     // Function to get parameters for providers


//     console.log(baseLocation, "Base Location XXXXXXXXXXXXXXXXXXXXXXXX")
//     const getProviderParams = (provider) => ({
//         latitude: baseLocation?.latitude || 6.9271,
//         longitude: baseLocation?.longtitude || 79.8612,
//         limit: 60,
//         provider: provider,
//         radius: 50,
//         isCountry: false,
//         sortArray: null,
//         dataSet: JSON.stringify(baseLocation)

//     });

//     // const loadLifestyleProducts = async () => {
//     //     try {
//     //         // Setup loading state
//     //         setLoading(true);
//     //         setLoadingPhase(1);
//     //         setLoadingProgress(10);
//     //         setData([]);
//     //         setFilteredData([]);
//     //         setBackgroundLoading(true);
//     //         setProviderStatus(providers);
//     //         setError(null);

//     //         // Update progress
//     //         setLoadingProgress(20);

//     //         // Call the external service function to handle all data fetching
//     //         const result = await fetchLifestyleData({
//     //             providers,
//     //             getProviderParams,
//     //             updateLoadingProgress: (progress) => setLoadingProgress(progress),
//     //             updateLoadingPhase: (phase) => setLoadingPhase(phase),
//     //             updateProviderStatus: (updater) => setProviderStatus(updater),
//     //             addData: (newData) => setData((prev) => [...prev, ...newData]),
//     //         });

//     //         // Handle any errors from the fetch service
//     //         if (result.error) {
//     //             setError(result.error);
//     //             ToastMessage({
//     //                 status: "error",
//     //                 message: result.error
//     //             });
//     //         }
//     //         setLoadingProgress(90);
//     //         handleEducationCategory();
//     //         // fetchLocations(result.data);
//     //     } catch (err) {
//     //         setError(err.message || "An error occurred while loading lifestyle products");
//     //         console.error("Error loading lifestyle products:", err);
//     //         ToastMessage({
//     //             status: "error",
//     //             message: "Failed to load lifestyle products. Please try again."
//     //         });
//     //     } finally {
//     //         setLoading(false);
//     //         setTimeout(() => {
//     //             setLoadingProgress(100);
//     //             setTimeout(() => {
//     //                 setBackgroundLoading(false);
//     //             }, 3000);
//     //         }, 500);
//     //     }
//     // };

//     const  handleTryAgain = ()=>{
//        setSearchObject({
//     search : "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   })

//     setSelectedLocation([]);
//     setSelectedSubCategory([]);
//     setSelectedPrice([]);
//     setFilterCheckboxes([]);

//     // Reset price filter to full range
//     if (pricerange.length >= 2) {
//       setminprice(pricerange[0]);
//       setmaxprice(pricerange[1]);
//     } else {
//       setminprice('');
//       setmaxprice('');
//     }

//     setpricefilter(false);
//     setDistance(20); // Reset to default distance

//     setUserMinMaxPrice({
//       min: pricerange[0] || '',
//       max: pricerange[1] || ''
//     });
//     setSelectedSortMethod('default'); // Reset sort method to default
//     handleChange('');
//     loadLifestyleProducts(); // Reload products
//     }

//     const loadLifestyleProducts = async (locationToUse = null) => {
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

//         // Use the provided location or current location
//         const activeLocation = locationToUse || currentLocation || baseLocation;

//         // Update progress
//         setLoadingProgress(20);

//         // Update getProviderParams to use the active location
//         const getProviderParamsUpdated = (provider) => ({
//     dataSet: JSON.stringify({
//         locationDescription: activeLocation?.address_full || "Colombo, Sri Lanka",
//         latitude: activeLocation?.latitude || 6.9271,
//         longitude: activeLocation?.longtitude || 79.8612,
//         place_id: activeLocation?.place_id || "",
//         isCountry: activeLocation?.isCountry || false,
//         dataSet: JSON.stringify({
//             id: activeLocation?.id || null,
//             description: activeLocation?.address_full || "Colombo, Sri Lanka",
//             latitude: String(activeLocation?.latitude || 6.9271),
//             longitude: String(activeLocation?.longtitude || 79.8612),
//             place_id: activeLocation?.place_id || "",
//             data: "null",
//             created_at: activeLocation?.created_at || new Date().toISOString(),
//             dataSet: null,
//             address_components: activeLocation?.address_components || []
//         })
//     }),
//     isCountry: activeLocation?.isCountry || false,
//     latitude: String(activeLocation?.latitude || 6.9271),
//     longitude: String(activeLocation?.longtitude || 79.8612),
//     page: 1,
//     pageSize: 50,
//     provider: provider,
//     radius: "20",
//     sortArray: "",
//     vendorId: 0
// });

// // console.log("Active Location:", getProviderParamsUpdated);

//         // Call the external service function to handle all data fetching
//         const result = await fetchLifestyleData({
//             providers,
//             getProviderParams: getProviderParamsUpdated,
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
//      const handleEducationCategory = async () => {
//         axios.get(`/fetch-all-categories`).then((res) => {
//           if (res.data.status == 200) {
//             const subCategories = res.data.subCategories || [];
    
//             const filteredCategories = subCategories
//               .filter((category) => category.maincat_id == 3)
//               .map((cat, index) => ({
//                 id: cat["id"],
//                 submaincat_type: cat["submaincat_type"],
//               }));
//             setCourseSubCategory(filteredCategories);
//           }
//         });
//       };
    

//     // Process discount data
//     const processDiscountData = (products) => {
//         const discountData = [];
//         products.forEach(item => {
//             if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
//                 discountData.push({
//                     discount: item.discount,
//                     product: item
//                 });
//             }
//         });
//         setAllDiscountData(discountData);
//     };

//     // Update filtered data when main data changes
//     useEffect(() => {
//         setFilteredData(data);
//                     fetchLocations(data);
//                     createPriceFilters(data);
//         processDiscountData(data);
//     }, [data]);

//     // Load products on component mount
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

//     // Render loading skeleton
//     const renderLoadingSkeleton = () => (
//         <div className="row mx-0 mt-4 margin-default">
//             {[...Array(8)].map((_, index) => (
//                 <div key={index} className="col-xl-3 col-lg-4 col-6">
//                     <PostLoader />
//                 </div>
//             ))}
//         </div>
//     );


//     //price filter functions


//     const handleMinMaxPrice = (e) => {
//         setUserMinMaxPrice({
//             ...userMinMaxPrice,
//             [e.target.name]: e.target.value,
//         });
//     };

//      const openSubFilter = () => {
//     setopenSideBarStatus(true);
//   }

//   const closeSubFilter = () => {
//     setopenSideBarStatus(false);
//   }

//   const openSearchFilter = () => {
//     setSearchfilter(true);
//   }

//   const fetchLocations = async (dataset) => {
//     let fetchedLocations = [];
//     dataset.forEach((value) => {
//       const city = value.lifestyle_city.toLowerCase().trim();
//       if (!fetchedLocations.includes(city)) {
//         fetchedLocations.push(city);
//       }
//     });
//     setLocations(fetchedLocations.sort()); // Sorting the locations after fetching
//   };

//     const createPriceFilters = async (dataset) => {
//       console.log("Processing dataset:", dataset);
//       console.log("Base currency value:", baseCurrencyValue);
  
//       // If dataset is empty, set empty filters and return
//       if (!dataset || dataset.length === 0) {
//         setFilterByPriceButtons([]);
//         setminprice(0);
//         setmaxprice(0);
//         setpricerange([0, 0]);
//         return;
//       }
  
//       // Get valid currencies, with fallback
//       const validCurrencies = Object.keys(baseCurrencyValue?.rates || {});
//       const baseCurrency = baseCurrencyValue?.base || 'USD';
  
//       // FIXED: Same price extraction logic as filtering
//       const getSafePrice = (item) => {
//         let price = 0;
  
//         // Check if both adult_rate and child_rate are "0.00", then use package_rate
//         if ((item.adult_rate === "0.00" || item.adult_rate === 0 || item.adult_rate === "0") &&
//           (item.child_rate === "0.00" || item.child_rate === 0 || item.child_rate === "0") &&
//           item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
  
//           price = item.package_rate;
  
//         }
//         // Use adult_rate if it's not zero
//         else if (item.adult_rate != null && item.adult_rate !== undefined &&
//           item.adult_rate !== "0.00" && item.adult_rate !== 0 && item.adult_rate !== "0") {
  
//           price = item.adult_rate;
  
//         }
//         // Check for bridgify provider with default_rate
//         else if (item.provider === "bridgify" && item.default_rate != null &&
//           item.default_rate !== undefined && item.default_rate !== 0) {
  
//           price = item.default_rate;
  
//         }
//         // Fallback to package_rate
//         else if (item.package_rate != null && item.package_rate !== undefined && item.package_rate !== 0) {
  
//           price = item.package_rate;
  
//         }
//         // Last resort - use default_rate
//         else if (item.default_rate != null && item.default_rate !== undefined && item.default_rate !== 0) {
  
//           price = item.default_rate;
  
//         }
  
//         // Convert string to number and ensure it's valid
//         const numPrice = Number(price);
//         return isNaN(numPrice) ? 0 : numPrice;
//       };
  
//       // Helper function to convert currency with better error handling
//       const convertCurrency = (currency, amount, baseCurrencyValue) => {
//         try {
//           // If currency is the same as base, return amount directly
//           if (currency === baseCurrency) {
//             return Number(amount) || 0;
//           }
  
//           // If currency is not in valid currencies list, treat as base currency
//           if (!validCurrencies.includes(currency)) {
//             console.warn(`Currency ${currency} not found in rates, treating as ${baseCurrency}`);
//             return Number(amount) || 0;
//           }
  
//           // Use your existing converter function
//           const converted = CurrencyConverterOnlyRateWithoutDecimal(currency, amount, baseCurrencyValue);
//           return Number(converted) || 0;
//         } catch (error) {
//           console.error('Currency conversion error:', error);
//           return Number(amount) || 0;
//         }
//       };
  
//       // Filter out items with zero prices and prepare for sorting
//       const itemsWithPrices = dataset
//         .map(item => {
//           const price = getSafePrice(item);
//           const currency = item.currency || baseCurrency;
//           const convertedPrice = convertCurrency(currency, price, baseCurrencyValue);
  
//           return {
//             ...item,
//             originalPrice: price,
//             convertedPrice: convertedPrice,
//             effectiveCurrency: currency
//           };
//         })
//         .filter(item => item.convertedPrice > 0); // Remove items with zero or invalid prices
  
//       console.log("Items with converted prices:", itemsWithPrices.slice(0, 3)); // Log first 3 for debugging
  
//       // If no valid items after filtering, set default values
//       if (!itemsWithPrices.length) {
//         console.warn("No items with valid prices found");
//         setFilterByPriceButtons([]);
//         setminprice(0);
//         setmaxprice(0);
//         setpricerange([0, 0]);
//         return;
//       }
  
//       // Sort by converted price
//       const sortedItems = itemsWithPrices.sort((a, b) => a.convertedPrice - b.convertedPrice);
  
//       // Get min and max prices
//       const minPrice = sortedItems[0].convertedPrice;
//       const maxPrice = sortedItems[sortedItems.length - 1].convertedPrice;
  
//       console.log("Price range:", { minPrice, maxPrice });
  
//       // Create price ranges
//       let result = createPriceSteps(minPrice, maxPrice);
  
//       // Handle edge case where min and max are the same
//       if (minPrice === maxPrice || result.length === 0) {
//         result = [{ start: minPrice, end: maxPrice || minPrice }];
//       }
  
//       // Set state values
//       const rangeStart = result[0].start;
//       const rangeEnd = result[result.length - 1].end;
  
//       setpricerange([rangeStart, rangeEnd]);
//       setFilterByPriceButtons(result);
//       setTempCurrency(baseCurrency);
  
//       setUserMinMaxPrice({
//         min: rangeStart,
//         max: rangeEnd
//       });
  
//       if (!pricefilter) {
//         setpricefilter(false);
//         setminprice(rangeStart);
//         setmaxprice(rangeEnd);
//       }
  
//       console.log("Final price filter setup:", {
//         priceRange: [rangeStart, rangeEnd],
//         filterButtons: result.length,
//         currency: baseCurrency
//       });
//     };

//     const handlePriceFilterChange = async (value) => {
//     console.log("Selected price range:", value);
//     setpricefilter(true);
//     setminprice(value.start);
//     setmaxprice(value.end);

//     // Update user input fields to match selected range
//     setUserMinMaxPrice({
//       min: value.start,
//       max: value.end
//     });
//     setSearchObject({
//       ...searchObject,
//         priceRance: [value.start, value.end],
//     })
//   };

//     const handleClearAllFilters = async () => {

//   setSearchObject({
//     search : "",
//     priceRance: [0, 0],
//     location: [],
//     subCategory: [],
//     distance: 20,
//   })

//     setSelectedLocation([]);
//     setSelectedSubCategory([]);
//     setSelectedPrice([]);
//     setFilterCheckboxes([]);

//     // Reset price filter to full range
//     if (pricerange.length >= 2) {
//       setminprice(pricerange[0]);
//       setmaxprice(pricerange[1]);
//     } else {
//       setminprice('');
//       setmaxprice('');
//     }

//     setpricefilter(false);
//     setDistance(20); // Reset to default distance

//     setUserMinMaxPrice({
//       min: pricerange[0] || '',
//       max: pricerange[1] || ''
//     });

//     handleChange(''); // Clear search query
//     setFilteredData(data); // Reset filtered data to original dataset
//     // handleClearSubCategory();
//   };


//     // Render empty state
//     const renderEmptyState = () => (
//         <Col xs="12">
//             <div className="my-5">
//                 <div className="col-sm-12 empty-cart-cls text-center">
//                     <img
//                         alt='No products available'
//                         src='/assets/images/ErrorImages/file.png'
//                         className="img-fluid mb-4 mx-auto"
//                     />
//                     <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
//                         Sorry, there are no lifestyle products available right now.
//                     </h4>
//                     <h4 style={{ fontSize: 15 }}>
//                         Please check back later or explore other options.
//                     </h4>
//                     <button
//                         className="btn btn-solid mt-3"
//                         onClick={handleTryAgain}
//                     >
//                         Try Again
//                     </button>
//                 </div>
//             </div>
//         </Col>
//     );

//       const handleChange = async (query) => {
//     setUserSearchQuery(query);
//     try {
//       if (query === '' || query == undefined) {
//         setFilteredData(data);
//       } else {
//         if (data.length === 0) {
//           let searchLifeStyles = data.filter((lifeStyle) => {
//             if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
//               return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
//             }
//           });
//           setFilteredData(searchLifeStyles);
//         } else {
//           let searchLifeStyles = data.filter((lifeStyle) => {
//             if (lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())) {
//               return lifeStyle['lifestyle_name'].toLowerCase().includes(query.toLowerCase())
//             }
//           });
//           setFilteredData(searchLifeStyles);
//         }
//       }
//     } catch (error) {
//       setData([])
//     }
//   }


//     const handleOnCourseCategoryChange = (value, displayName) => {
//     // Check if selectedSubCategory already has this value
//     const isExist = selectedSubCategory?.[0] === value;

//     // Always update the selectedSubCategory with the new value


//     // console.log(isExist, "Is Existing Data is");

//     if (!isExist) {
//       setSelectedSubCategory([value]);
//       // This is a new selection, so update filters
//       const dataset = { value, type: "sub_category", displayName };
//       console.log(dataset, "Dataset is");
//       const sampledataset = [dataset];
//       setFilterCheckboxes(sampledataset);

//       // console.log(value, "Data value is");

//       setBackEndFilters({
//         ...backEndFilters,
//         category1: value,
//       });

//       setSearchObject({
//         ...searchObject,
//         subCategory: [value],
//       });
//     //   fetchFilteredData(value);


//     } else {
//       // This is a de-selection, so clear filters
//       setFilterCheckboxes([]);
//       setSelectedSubCategory([]);
//       setBackEndFilters({
//         ...backEndFilters,
//         category1: 0,
//       });
      
//     }
//   };

//    const handleLocationChange = async (value) => {
//     const index = selectedLocation.indexOf(value)
//     let newLocations = [...selectedLocation]
//     if (index === -1) {
//       newLocations.unshift(value);
//     } else {
//       newLocations.splice(index, 1);
//     }
//     setSearchObject({
//       ...searchObject,
//       location: newLocations,
//     })
//     setSelectedLocation(newLocations);
//   }

//   const handleSearchPriceRange = () => {
//     const regex = /^\d+(\.\d+)?$/; // Allow decimal numbers

//     if (regex.test(userMinMaxPrice.min) && regex.test(userMinMaxPrice.max)) {
//       const minPrice = Number(userMinMaxPrice.min);
//       const maxPrice = Number(userMinMaxPrice.max);

//       if (minPrice > maxPrice) {
//         ToastMessage({
//           status: "warning",
//           message: 'Please ensure that the minimum price is lower than the maximum price.'
//         });
//         return;
//       }

//       if (pricerange.length >= 2) {
//         if (minPrice < pricerange[0] || maxPrice > pricerange[1]) {
//           ToastMessage({
//             status: "warning",
//             message: `Price range should be between ${pricerange[0]} and ${pricerange[1]}.`
//           });
//           return;
//         }
//       }

//       setminprice(minPrice);
//       setmaxprice(maxPrice);
//       setpricefilter(true); // Mark that price filter is active
//        setSearchObject({
//       ...searchObject,
//         priceRance: [minPrice, maxPrice],
//     })
//     } else {
//       ToastMessage({
//         status: "warning",
//         message: 'Please enter valid numeric values for price range.'
//       });
//     }
//   };

//     const closeSearchFilter = () => {
//     setSearchfilter(false);
//     handleChange('')
//   }

//   const manageUserSelectFilters = ()=>{

//     const filtered = data.filter(product => {

//     // 2. Price range filter - check default_rate
//     if (searchObject.priceRance[0] >= product.default_rate || searchObject.priceRance[1]<= product.default_rate) {
//       const productPrice = parseFloat(product.default_rate) || 0;
      
//       // Convert price to base currency if needed
//       let convertedPrice = productPrice;
//       if (product.currency && product.currency !== tempCurrency) {
//         convertedPrice = CurrencyConverterOnlyRateWithoutDecimal(
//           product.currency, 
//           productPrice, 
//           baseCurrencyValue
//         );
//       }

//       const minPrice = searchObject.priceRance[0];
//       const maxPrice = searchObject.priceRance[1];

//       if (minPrice > 0 && convertedPrice < minPrice) {
//         return false;
//       }
//       if (maxPrice > 0 && convertedPrice > maxPrice) {
//         return false;
//       }
//     }

//     // 4. Sub category filter - check category_2
//     if (searchObject.subCategory.length > 0) {
//       const productCategory = parseInt(product.category_2) || 0;
//       const matchesSubCategory = searchObject.subCategory.some(selectedCategory => 
//         productCategory === parseInt(selectedCategory)
//       );
//       if (!matchesSubCategory) {
//         return false;
//       }
//     }

//     // 5. Distance filter - check distance (convert to km and round)
//     if (searchObject.distance && searchObject.distance !== 20) {
//       const productDistance = parseFloat(product.distance) || 0;
//       const roundedDistance = Math.round(productDistance);
//       const maxDistance = parseInt(searchObject.distance);
      
//       if (roundedDistance > maxDistance) {
//         return false;
//       }
//     }

//     return true;
//   });
//   setFilteredData(filtered);
//   console.log("Filtered products after user select filters:", filtered.length, filtered);
//   }

//   useEffect(() => {
//     manageUserSelectFilters();
//     console.log("Search object updated:", searchObject);
//   }, [selectedSubCategory, minprice, maxprice, distance, searchObject]);


//   const handleSelectChange = (selectedOption) => {
//     setSelectedSortMethod(selectedOption.value);
//   };

// const handleSortChange = () => {
//   console.log("Current sort method:", selectedSortMethod);
//   console.log("Total products before sorting:", data.length);
  
//   let sortedProducts = [...filteredData]; // Create a copy of the original data
  
//   switch (selectedSortMethod) {
//     case 'default':
//       console.log("Applying default sorting - returning original order");
//       // Return products in their original order
//       sortedProducts = [...filteredData];
//       break;
      
//     case 'featured':
//       console.log("Applying featured sorting - sorting by triggers count (high to low)");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const triggersA = parseInt(a.triggers) || 0;
//         const triggersB = parseInt(b.triggers) || 0;
//         console.log(`Comparing triggers: ${a.lifestyle_name} (${triggersA}) vs ${b.lifestyle_name} (${triggersB})`);
//         return triggersB - triggersA; // High to low
//       });
//       console.log("Top 3 featured products:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         triggers: p.triggers
//       })));
//       break;
      
//     case 'newArrival':
//       console.log("Applying new arrival sorting - sorting by created_at (newest first)");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const dateA = new Date(a.created_at || 0);
//         const dateB = new Date(b.created_at || 0);
//         console.log(`Comparing dates: ${a.lifestyle_name} (${a.created_at}) vs ${b.lifestyle_name} (${b.created_at})`);
//         return dateB - dateA; // Newest first
//       });
//       console.log("Top 3 newest products:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         created_at: p.created_at
//       })));
//       break;
      
//     case 'priceLH':
//       console.log("Applying price sorting - Low to High (using default_rate)");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const priceA = parseFloat(a.default_rate) || 0;
//         const priceB = parseFloat(b.default_rate) || 0;
//         console.log(`Comparing default_rate prices: ${a.lifestyle_name} (${priceA}) vs ${b.lifestyle_name} (${priceB})`);
//         return priceA - priceB; // Low to high
//       });
//       console.log("Top 3 cheapest products by default_rate:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         default_rate: p.default_rate,
//         currency: p.currency
//       })));
//       break;
      
//     case 'priceHL':
//       console.log("Applying price sorting - High to Low (using default_rate)");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const priceA = parseFloat(a.default_rate) || 0;
//         const priceB = parseFloat(b.default_rate) || 0;
//         console.log(`Comparing default_rate prices: ${a.lifestyle_name} (${priceA}) vs ${b.lifestyle_name} (${priceB})`);
//         return priceB - priceA; // High to low
//       });
//       console.log("Top 3 most expensive products by default_rate:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         default_rate: p.default_rate,
//         currency: p.currency
//       })));
//       break;
      
//     case 'distanceLH':
//       console.log("Applying distance sorting - Low to High");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const distanceA = parseFloat(a.distance) || 0;
//         const distanceB = parseFloat(b.distance) || 0;
//         console.log(`Comparing distances: ${a.lifestyle_name} (${distanceA}km) vs ${b.lifestyle_name} (${distanceB}km)`);
//         return distanceA - distanceB; // Low to high
//       });
//       console.log("Top 3 closest products:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         distance: p.distance
//       })));
//       break;
      
//     case 'distanceHL':
//       console.log("Applying distance sorting - High to Low");
//       sortedProducts = sortedProducts.sort((a, b) => {
//         const distanceA = parseFloat(a.distance) || 0;
//         const distanceB = parseFloat(b.distance) || 0;
//         console.log(`Comparing distances: ${a.lifestyle_name} (${distanceA}km) vs ${b.lifestyle_name} (${distanceB}km)`);
//         return distanceB - distanceA; // High to low
//       });
//       console.log("Top 3 farthest products:", sortedProducts.slice(0, 3).map(p => ({
//         name: p.lifestyle_name,
//         distance: p.distance
//       })));
//       break;
      
//     default:
//       console.log("Unknown sort method, returning default order");
//       sortedProducts = [...data];
//       break;
//   }
  
//   console.log("Products after sorting:", sortedProducts.length);
//   console.log("Sort method applied successfully:", selectedSortMethod);

//   setFilteredData(sortedProducts); // Update filtered data with sorted products
  
//   // If you want to maintain the current filters while sorting, you can do:
//   // setFilteredData(prev => {
//   //   // Apply the same sorting logic to the filtered data
//   //   return applyCurrentFiltersToSortedData(sortedProducts);
//   // });
// };


//   useEffect(() => {
//     setLoading(true);
//     handleSortChange();
//     setLoading(false);
//   },[selectedSortMethod]);

//     // Render error state
//     const renderErrorState = () => (
//         <Col xs="12">
//             <div className="my-5">
//                 <div className="col-sm-12 empty-cart-cls text-center">
//                     <img
//                         alt='Error loading products'
//                         src='/assets/images/ErrorImages/error.png'
//                         className="img-fluid mb-4 mx-auto"
//                     />
//                     <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
//                         Oops! Something went wrong
//                     </h4>
//                     <h4 style={{ fontSize: 15 }}>
//                         {error || "Unable to load lifestyle products"}
//                     </h4>
//                     <button
//                         className="btn btn-solid mt-3"
//                         onClick={loadLifestyleProducts}
//                     >
//                         Retry
//                     </button>
//                 </div>
//             </div>
//         </Col>
//     );


//       const handleOnGoogleLocationChange = (value) => {
//     setGoogleLocation(value['label'].slice(0, 25) + '...');
    
//     geocodeByPlaceId(value['value']['place_id'])
//         .then(results => getLatLng(results[0]))
//         .then(({ lat, lng }) => {
//             geocodeByLatLng({ lat: lat, lng: lng })
//                 .then(async results => {
//                     const newLocation = {
//                         address_full: value['label'],
//                         latitude: lat,
//                         longtitude: lng,
//                         address_components: results[0].address_components
//                     };

//                     // Update states
//                     setUserSelectedLocation(newLocation);
//                     setCurrentLocation(newLocation);
//                     setIsUsingGlobalLocation(false);

//                     console.log("Selected new location:", newLocation);
                    
//                     // Reload products with new location
//                     loadLifestyleProducts(newLocation);
//                 })
//                 .catch((error) => {
//                     console.error("Geocoding error:", error);
//                     setLoading(false);
//                     ToastMessage({
//                         status: "error",
//                         message: "Failed to get location details"
//                     });
//                 });
//         })
//         .catch((error) => {
//             console.error("Place details error:", error);
//             setLoading(false);
//             ToastMessage({
//                 status: "error",
//                 message: "Failed to get place details"
//             });
//         });
// };


//        const handleClearSearchData = async () => {
//     console.log("Clearing location search, reverting to global location");
    
//     setLoading(true);
    
//     try {
//         // Reset to global location
//         setCurrentLocation(globalLocation);
//         setUserSelectedLocation(null);
//         setIsUsingGlobalLocation(true);
//         setGoogleLocation('search');
        
//         // Reload products with global location
//         await loadLifestyleProducts(globalLocation);
        
//         ToastMessage({
//             status: "success",
//             message: "Location reset to global location"
//         });
//     } catch (error) {
//         console.error("Error clearing location:", error);
//         ToastMessage({
//             status: "error",
//             message: "Failed to reset location"
//         });
//     } finally {
//         setLoading(false);
//     }
// };

// const uniqueLifestyles = (arrayData) => {
//   const uniqueMap = new Map();
 
//   if (!Array.isArray(arrayData) || arrayData.length === 0) {
//     return [];
//   }
 
//   const uniqueItems = arrayData.filter((item) => {
//     if (!item.lifestyle_id) {
//       return false;
//     }
   
//     const isDuplicate = uniqueMap.has(item.lifestyle_id);
   
//     if (!isDuplicate) {
//       uniqueMap.set(item.lifestyle_id, true);
//       return true;
//     }
   
//     return false;
//   }); 

//   if(selectedSortMethod != 'default'){
//     return uniqueItems
//   }
//   else{
//   return uniqueItems.sort((a, b) => {
//     const triggersA = a.triggers || 0;
//     const triggersB = b.triggers || 0;
//     return triggersB - triggersA;
//   });
//   }
 

// };

//     return (
//         <>
//             <Head>
//                 <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//                 <title>Aahaas - Lifestyle</title>
//                 <meta
//                     name="description"
//                     content="Experience the essence of travel with Aahaas' Lifestyle offerings, designed to enrich your journey. Discover a wide array of activities, from thrilling adventures to immersive cultural experiences, paired with exquisite dining and wellness options."
//                 />
//                 <script
//                     type="application/ld+json"
//                     dangerouslySetInnerHTML={{
//                         __html: JSON.stringify({
//                             "@context": "https://schema.org",
//                             "@type": "BreadcrumbList",
//                             "itemListElement": [
//                                 {
//                                     "@type": "ListItem",
//                                     "position": 1,
//                                     "name": "Home",
//                                     "item": "https://www.aahaas.com/"
//                                 },
//                                 {
//                                     "@type": "ListItem",
//                                     "position": 2,
//                                     "name": "Lifestyle",
//                                     "item": "https://www.aahaas.com/lifestyle"
//                                 }
//                             ]
//                         }),
//                     }}
//                 />
//             </Head>

//             <CommonLayout
//                 title="Lifestyle"
//                 parent="home"
//                 showMenuIcon={true}
//                 showSearchIcon={false}
//                 openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}
//             >
//                 <section className="section-b-space ratio_asos mt-lg-5">
//                     <div className="collection-wrapper">
//                         <Container>
//                             <Row>
//                                 <Col
//                                     sm="3"
//                                     className="collection-filter"
//                                     id="filter"
//                                     style={{
//                                         left: openSideBarStatus ? "0px" : "",
//                                     }}
//                                 >

//                                     <div
//                                         className="collection-filter-block px-lg-4 pe-5"
//                                         style={{ borderRadius: "12px" }}
//                                     >
//                                         <div
//                                             className="collection-mobile-back"
//                                             onClick={() => closeSubFilter()}
//                                         >
//                                             <span className="filter-back">
//                                                 <i className="fa fa-angle-left"></i>back
//                                             </span>
//                                         </div>

//                                         {/* <div style={{marginTop:"5px", }}>
//                                             <Button
//                                                 className="btn btn-solid"
//                                                 style={{ width: "100%", marginBottom: "10px", borderRadius: "7px", padding: "10px" }}
//                                                 onClick={() => handleFilter()}
                                            
//                                             >
//                                                 Apply Filters
//                                                 {openSideBarStatus ? "Close Filters" : "Apply Filters"}
//                                             </Button>
//                                         </div> */}

//                                         <div className="collection-collapse-block">
// <div className="collection-collapse-block hotel-sidebar-filters-sub">
//     <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
//         Search by Location
//         {!isUsingGlobalLocation && (
//             <span className="badge badge-primary ms-2" style={{ fontSize: '10px' }}>
//                 Custom Location
//             </span>
//         )}
//     </h5>
    
//     <div className="location-input-container" style={{ position: 'relative' }}>
//         <GooglePlacesAutocomplete
//             apiKey={groupApiCode}
//             selectProps={{
//                 value: googleLocation,
//                 placeholder: googleLocation === 'search' ? 'Search for a location...' : googleLocation,
//                 onChange: (e) => handleOnGoogleLocationChange(e),
//                 onClick: (e) => setGoogleLocation(''),
//                 styles: {
//                     container: (provided) => ({
//                         ...provided,
//                         width: '100%'
//                     }),
//                     control: (provided) => ({
//                         ...provided,
//                         paddingRight: '30px'
//                     }),
//                     dropdownIndicator: () => ({
//                         display: 'none'
//                     }),
//                     indicatorSeparator: () => ({
//                         display: 'none'
//                     })
//                 }
//             }}
//         />
//         {googleLocation !== 'search' && !isUsingGlobalLocation && (
//             <div
//                 style={{
//                     position: 'absolute',
//                     right: '10px',
//                     top: '50%',
//                     transform: 'translateY(-50%)',
//                     cursor: 'pointer',
//                     zIndex: 2
//                 }}
//                 onClick={() => handleClearSearchData()}
//                 title="Clear location and use global location"
//             >
//                 <CloseIcon sx={{ fontSize: '18px' }} />
//             </div>
//         )}
//     </div>
// </div>

//                                             <h5
//                                                 style={{ fontWeight: "500", fontSize: "15px" }}
//                                                 className={
//                                                     priceFilterOpen
//                                                         ? "collapse-block-title-selected"
//                                                         : "collapse-block-title"
//                                                 }
//                                                 onClick={() => setpriceFilterOpen(!priceFilterOpen)}
//                                             >
//                                                 Price
//                                             </h5>
//                                             <Collapse isOpen={priceFilterOpen}>
//                                                 <div className="collection-collapse-block-content">
//                                                     <div className="collection-brand-filter">
//                                                         <ul className="category-list">
//                                                             {filterByPriceButtons?.map((value, key) => (
//                                                                 <div
//                                                                     className="form-check custom-checkbox collection-filter-checkbox"
//                                                                     key={key}
//                                                                 >
//                                                                     <Input
//                                                                         checked={
//                                                                             value.start == minprice &&
//                                                                             value.end == maxprice
//                                                                         }
//                                                                         onChange={() =>
//                                                                             handlePriceFilterChange(value)
//                                                                         }
//                                                                         name={value}
//                                                                         id={value}
//                                                                         type="radio"
//                                                                         className="custom-control-input option-btns"
//                                                                     />
//                                                                     {/* <h6 className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)}  - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6> */}
//                                                                     <h6 className="m-0 p-0" htmlFor={value}>
//                                                                         {!isNaN(value.start) && value.start != null
//                                                                             ? CurrencyConverter(
//                                                                                 tempCurrency,
//                                                                                 value.start,
//                                                                                 baseCurrencyValue
//                                                                             ).replace(/\.00$/, "")
//                                                                             : `${tempCurrency} 0`}{" "}
//                                                                         -
//                                                                         {!isNaN(value.end) && value.end != null
//                                                                             ? CurrencyConverter(
//                                                                                 tempCurrency,
//                                                                                 value.end,
//                                                                                 baseCurrencyValue
//                                                                             ).replace(/\.00$/, "")
//                                                                             : `${tempCurrency} 0`}
//                                                                     </h6>
//                                                                 </div>
//                                                             ))}
//                                                         </ul>
//                                                     </div>
//                                                 </div>
//                                                 <div className="collection-collapse-block-content">
//                                                     <div className="collection-brand-filter">
//                                                         <div className="d-flex align-items-end align-content-stretch gap-3">
//                                                             <div className="d-flex flex-column align-itmes-end col-4">
//                                                                 <h6
//                                                                     className="m-0 p-0"
//                                                                     style={{ fontSize: "14px" }}
//                                                                 >
//                                                                     Min price
//                                                                 </h6>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control"
//                                                                     style={{
//                                                                         padding: "9px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                     placeholder="Min"
//                                                                     value={userMinMaxPrice.min}
//                                                                     min={pricerange[0]}
//                                                                     max={pricerange[1]}
//                                                                     name="min"
//                                                                     onChange={(e) => handleMinMaxPrice(e)}
//                                                                 />
//                                                             </div>
//                                                             <div className="d-flex flex-column align-itmes-end col-4">
//                                                                 <h6
//                                                                     className="m-0 p-0"
//                                                                     style={{ fontSize: "14px" }}
//                                                                 >
//                                                                     Max price
//                                                                     {/* Max price - {`${baseCurrency}`} */}
//                                                                 </h6>
//                                                                 <input
//                                                                     type="number"
//                                                                     className="form-control"
//                                                                     style={{
//                                                                         padding: "9px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                     placeholder="Max"
//                                                                     value={userMinMaxPrice.max}
//                                                                     max={pricerange[1]}
//                                                                     min={pricerange[0]}
//                                                                     name="max"
//                                                                     onChange={(e) => handleMinMaxPrice(e)}
//                                                                 />
//                                                             </div>
//                                                             <div className="ms-auto col-3">
//                                                                 <button
//                                                                     className="btn btn-sm btn-solid"
//                                                                     style={{
//                                                                         padding: "7px 10px",
//                                                                         borderRadius: "5px",
//                                                                     }}
//                                                                   onClick={handleSearchPriceRange}
//                                                                 >
//                                                                     <SearchIcon />
//                                                                 </button>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </Collapse>
//                                         </div>

//                                                                          <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className={
//                                                 courseSubFilter
//                                                     ? "collapse-block-title-selected"
//                                                     : "collapse-block-title"
//                                             }
//                                             onClick={() => setCourseSubFilter(!courseSubFilter)}
//                                         >
//                                             Sub Category
//                                         </h5>
//                                         <Collapse isOpen={courseSubFilter}>
//                                             <div className="collection-collapse-block-content">
//                                                 <div className="collection-brand-filter">
//                                                     <ul className="category-list">
//                                                         {courseSubCategory.map((course, key) => (
//                                                             <div
//                                                                 className="form-check custom-checkbox collection-filter-checkbox"
//                                                                 key={key}
//                                                             >
//                                                                 <Input
//                                                                     className="custom-control-input option-btns"
//                                                                     type="radio"
//                                                                     value={course?.id}
//                                                                     id={course?.id}
//                                                                     checked={selectedSubCategory.includes(
//                                                                         course?.id
//                                                                     )}
//                                                                     onChange={() => {
//                                                                         handleOnCourseCategoryChange(
//                                                                             course?.id,
//                                                                             course?.submaincat_type
//                                                                         );
//                                                                     }}
//                                                                     name="subCategory"
//                                                                 />
//                                                                 <h6 className="m-0 p-0" htmlFor={course}>
//                                                                     {course?.submaincat_type}
//                                                                 </h6>
//                                                             </div>
//                                                         ))}
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </Collapse>
//                                     </div>

                                   
//                                     {/* <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className={
//                                                 locationfilterOpen
//                                                     ? "collapse-block-title-selected"
//                                                     : "collapse-block-title"
//                                             }
//                                             onClick={() =>
//                                                 setlocationfilterOpen(!locationfilterOpen)
//                                             }
//                                         >
//                                             Location
//                                         </h5>
//                                         <Collapse isOpen={locationfilterOpen}>
//                                             <div className="collection-collapse-block-content">
//                                                 <div className="collection-brand-filter">
//                                                     <ul className="category-list">
//                                                         {locations
//                                                             ?.filter(
//                                                                 (value) => value && value.trim() !== ""
//                                                             )
//                                                             ?.map((value, index) => (
//                                                                 <div
//                                                                     className="form-check custom-checkbox collection-filter-checkbox"
//                                                                     key={index}
//                                                                 >
//                                                                     <Input
//                                                                         checked={selectedLocation.includes(value)}
//                                                                         onChange={() => {
//                                                                             handleLocationChange(value);
//                                                                         }}
//                                                                         name={value}
//                                                                         id={value}
//                                                                         type="checkbox"
//                                                                         className="custom-control-input option-btns"
//                                                                     />
//                                                                     <h6
//                                                                         className="m-0 p-0"
//                                                                         htmlFor={value}
//                                                                         style={{ textTransform: "capitalize" }}
//                                                                     >
//                                                                         {value}
//                                                                     </h6>
//                                                                 </div>
//                                                             ))}
//                                                     </ul>
//                                                 </div>
//                                             </div>
//                                         </Collapse>
//                                     </div> */}

//                                      <div className="collection-collapse-block">
//                                         <h5
//                                             style={{ fontWeight: "500", fontSize: "15px" }}
//                                             className="collapse-block-title-hotel"
//                                         >
//                                             Search by distance (km)
//                                         </h5>
//                                         <div className="collection-collapse-block-content">
//                                             <div className="collection-brand-filter d-flex align-items-stretch">
//                                                 <input
//                                                     type="number"
//                                                     className="form-control"
//                                                     style={{
//                                                         borderTopLeftRadius: "5px",
//                                                         borderBottomLeftRadius: "5px",
//                                                     }}
//                                                     value={distance}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value;
//                                                         if (value <= 2000) {
//                                                             setDistance(value);
//                                                             setSearchObject({
//                                                                 ...searchObject,
//                                                                 distance: value,
//                                                             });
//                                                         } else {
//                                                             ToastMessage({
//                                                                 status: "warning",
//                                                                 message:
//                                                                     "Distance should not exceed 2000 km.",
//                                                             });
//                                                         }
//                                                     }}
//                                                 />
//                                                 {/* <button
//                                                     className="px-3 btn btn-sm btn-solid"
//                                                     style={{
//                                                         borderTopRightRadius: "5px",
//                                                         borderBottomRightRadius: "5px",
//                                                     }}
//                                                     onClick={() => handleSearchfilter()}
//                                                 >
//                                                     <SearchIcon />
//                                                 </button> */}
//                                             </div>
//                                         </div>
//                                     </div>


//                                     </div>

                               
//                                 </Col>
//                                 <Col className="collection-content" sm="12" md="12" lg="9">
//                                     {/* Banner Section */}
//                                     <div className="d-none d-lg-block d-md-block top-banner-wrapper">
//                                         <a href={null}>
//                                             <Image
//                                                 src={Menu2}
//                                                 placeholder="blur"
//                                                 alt="Lifestyle Banner"
//                                                 layout="responsive"
//                                                 height={500}
//                                                 width={2000}
//                                                 quality={25}
//                                                 priority
//                                                 loading="eager"
//                                             />
//                                         </a>
//                                     </div>

//                                     <div className="collection-product-wrapper mt-0 mt-lg-4">
//                                         {/* Product Count Header */}
//                                         <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
//                                             <h5 className="p-0 m-0" style={{ fontSize: '18px', fontWeight: '600' }}>
//                                                 {loading ? (
//                                                     "Loading Lifestyle Products..."
//                                                 ) : (
//                                                     `Showing ${filteredData.length} Products`
//                                                 )}
//                                             </h5>

//                                             {/* Loading Progress Bar */}
//                                             {backgroundLoading && (
//                                                 <div className="ms-auto col-12 col-lg-4">
//                                                     <div className="progress" style={{ height: '6px' }}>
//                                                         <div
//                                                             className="progress-bar bg-primary"
//                                                             role="progressbar"
//                                                             style={{ width: `${loadingProgress}%` }}
//                                                             aria-valuenow={loadingProgress}
//                                                             aria-valuemin="0"
//                                                             aria-valuemax="100"
//                                                         ></div>
//                                                     </div>
//                                                     <small className="text-muted">
//                                                         Phase {loadingPhase} - {loadingProgress}%
//                                                     </small>
//                                                 </div>
//                                             )}

//                                             {
//                                                 !backgroundLoading && (
//                                                      <><div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
//                                                         <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                                         {userSearchQuery === '' ? <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                                     </div>
//                                                     <div className="col-3 d-none d-lg-block" style={{ position: "relative", zIndex: 1050 }}>
//                                                             <Select
//                                                                 styles={{
//                                                                     menu: (provided) => ({
//                                                                         ...provided,
//                                                                         zIndex: 1100, // Ensures dropdown appears on top
//                                                                         position: "absolute",
//                                                                     }),
//                                                                 }}
//                                                                 options={options}
//                                                                 onChange={handleSelectChange} 
//                                                                 />
//                                                         </div></>
//                                                 )
//                                             }
//                                         </div>

//                                         {/* Discount Products Slider */}
//                                         {allDiscountData.length > 0 && (
//                                             <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3 mt-3">
//                                                 <ProductSlider allDiscountData={allDiscountData} type={"lifeStyles"} />
//                                             </div>
//                                         )}

//                                            <ul className="product-filter-tags p-0 m-0 my-2">
//                                                                     {
//                                                                       pricefilter &&
//                                                                       <li>
//                                                                         {/* <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i></a> */}
//                                                                         <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} </a>
//                                                                       </li>
//                                                                     }
//                                                                     {
//                                                                       selectedLocation.map((brand, i) => (
//                                                                         <li key={i}>
//                                                                           {/* <a href={null} className="filter_tag">{brand}<i className="fa fa-close" onClick={() => handleLocationChange(brand)}></i></a> */}
//                                                                           <a href={null} className="filter_tag">{brand}</a>
//                                                                         </li>
//                                                                       ))
//                                                                     }
//                                                                     {selectedSubCategory.map((value, i) => {
//                                                                       const subCategory = courseSubCategory.find(
//                                                                         (cat) => cat.id === value
//                                                                       );
//                                                                       return (
//                                                                         <li key={i}>
//                                                                           <a href={null} className="filter_tag">
//                                                                             {subCategory?.submaincat_type}
//                                                                             {/* <i
//                                                                               className="fa fa-close"
//                                                                               onClick={() =>
//                                                                                 handleOnCourseCategoryChange(
//                                                                                   value,
//                                                                                   subCategory?.submaincat_type
//                                                                                 )
//                                                                               }
//                                                                             ></i> */}
//                                                                           </a>
//                                                                         </li>
//                                                                       );
//                                                                     })}
//                                                                     {
//                                                                       (pricefilter || selectedLocation.length > 0 || selectedSubCategory.length > 0) &&
//                                                                       <li onClick={() => handleClearAllFilters()}>
//                                                                         <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                                                                       </li>
//                                                                     }
//                                                                   </ul>

//                                         {/* Products Grid */}
//                                         <Row className="mt-4">
//                                             {loading ? (
//                                                 renderLoadingSkeleton()
//                                             ) : error ? (
//                                                 renderErrorState()
//                                             ) : filteredData.length === 0 ? (
//                                                 renderEmptyState()
//                                             ) : (
//                                                 uniqueLifestyles(filteredData).map((product, i) => (
//                                                     <div className={grid} key={i}>
//                                                         <ProductItems
//                                                             product={product}
//                                                             productImage={product?.image}
//                                                             productstype={"lifestyle"}
//                                                             title={product?.lifestyle_name}
//                                                             productcurrency={product?.currency}
//                                                             adultRate={product?.adult_rate}
//                                                             packageRate={product?.package_rate}
//                                                             childRate={product?.child_rate}
//                                                             description={product?.lifestyle_description}
//                                                             rating={4}
//                                                             cartClass={"cart-info cart-wrap"}
//                                                             backImage={true}
//                                                         />
//                                                     </div>
//                                                 ))
//                                             )}
//                                         </Row>

//                                         {/* Provider Status (for debugging - can be removed in production) */}
//                                         {process.env.NODE_ENV === 'development' && (
//                                             <div className="mt-4">
//                                                 <details>
//                                                     <summary>Provider Status (Dev Only)</summary>
//                                                     <pre>{JSON.stringify(providerStatus, null, 2)}</pre>
//                                                 </details>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </Col>
//                             </Row>
//                         </Container>
//                     </div>
//                 </section>
//             </CommonLayout>
//         </>
//     );
// }

// new filter