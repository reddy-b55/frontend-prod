import moment from 'moment';
import Head from 'next/head';
import { useContext, useEffect, useState, useRef } from 'react';
import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
import { DateRange } from 'react-date-range';
import Select from 'react-select';
import CustomCalendar from '../../../components/calender/CustomCalendar';

import { LoadScript } from '@react-google-maps/api';
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import { History, Clock } from 'lucide-react';
import RecentSearchesModal from './RecentSearchesModal';
import { AppContext } from '../../_app';
import { getHotelDataUpdated, loadHotelsData } from '../../../AxiosCalls/HotelServices/hotelServices';

import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import PaxIncrementorComponent from '../../../components/common/PaxIncrementor/PaxIncrementorComponent';
import ModalBase from '../../../components/common/Modals/ModalBase';
import ToastMessage from '../../../components/Notification/ToastMessage';

import PostLoader from '../../skeleton/PostLoader';

import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/hotelBanner.jpg";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';

import 'react-calendar/dist/Calendar.css';
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';

import cookie from 'cookie';
import { useRouter } from 'next/router';
import ProductSlider from '../productImageSlider';
import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
import RoomAllocation from '../../../components/hotel/RoomAllocation';
import NewBanners from "../../layouts/NewBanners";


const HotelsMainPage = () => {
  const [locationDataSet, setLocationDataSet] = useState(null);
  const [locationDataSetReset, setLocationDataSetReset] = useState(null);
  const [paxRoomDetails, setPaxRoomDetails] = useState({
    "totalRooms": 1,
    "totalAdults": 1,
    "totalChildren": 0,
  })
  const [content, setContent] = useState([]);
  const router = useRouter();

  let checkinDate = new Date();
  let checkOutDate = new Date();
  checkOutDate.setDate(checkinDate.getDate() + 1);

  const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
  const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

  const { userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

  const adultChildMinMax = {
    minAdult: 50,
    maxAdult: 50,
    minChild: 50,
    maxChild: 50,
    adultAvl: true,
    childAvl: true
  }

  const roomCounts = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' }
  ];

  const roomCategory = [
    { value: 1, label: '1 Star' },
    { value: 2, label: '2 star' },
    { value: 3, label: '3 star' },
    { value: 4, label: '4 star' },
    { value: 5, label: '5 star' },
    // { value: 6, label: '6 star' },
    // { value: 7, label: '7 star' },
  ];

  const [loading, setLoading] = useState(true);
  const [hotelCategory, setHotelCategory] = useState(true);

  const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

  const [hotelMainDataset, setHotelMainDataset] = useState([]);
  const [filteredMainDataset, setFilteredMainDataset] = useState([]);
  const [filteredMainDatasetOld, setFilteredMainDatasetOld] = useState([]);

  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedCategory, setSelectedCategory] = useState([])
  const [filterCheckboxes, setFilterCheckboxes] = useState([]);
  const [filteringValue, setFilteringValue] = useState([]);

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [hotelLocations, setHotelLocations] = useState([]);
  const [googleLocation, setGoogleLocation] = useState("search");
  const [childAges, setChildAges] = useState([]);
  const [openAdultChildModal, setOpenAdultChildModal] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const dateFieldRef = useRef(null);
  const [locationfilterOpen, setlocationfilterOpen] = useState(true);
  const [allDiscountData, setAllDiscountData] = useState([])
  const [openRoomModel, setOpenRoomModel] = useState(false)

  const [hotelSearchCustomerData, setHotelSearchCustomerData] = useState({
    CheckInDate: nextWeekDate,
    CheckOutDate: nextWeekDateCheckout,
    NoOfNights: 1,
    NoOfRooms: 1,
    NoOfAdults: 1,
    NoOfChild: 0,
    City: baseLocation?.address_full,
    dataSet: JSON.stringify({ locationDataSet }),
    Country: baseLocation?.address_full,
    StarRate: 0,
    RoomRequest: [{
      indexValue: 0,
      roomType: "Single",
      NoOfAdults: 1,
      NoOfChild: 0,
      ChildAge: []
    }]
  });

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  // Add this useEffect for scroll handling
  useEffect(() => {
    const handleScroll = () => {
      // Close dropdowns when scrolling
      if (isLocationDropdownOpen) {
        setIsLocationDropdownOpen(false);
        setIsFocused(false);
      }
      if (openDate) {
        setOpenDate(false);
      }
    };

    // Use capture phase to catch scroll events early
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isLocationDropdownOpen, openDate]);

  console.log(hotelSearchCustomerData, "Customer Data issaxasdasdasd")
const [showRecentSearches, setShowRecentSearches] = useState(false);
const [searchSessions, setSearchSessions] = useState([]);

// Session Storage Helper Functions
const getSessionStorageKey = (userId) => {
  return `hotel_search_sessions_${userId}`;
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
    
    console.log("Retrieved hotel sessions for user:", userId, parsedSessions);
    return parsedSessions;
  } catch (error) {
    console.error("Error reading hotel sessions from storage:", error);
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
    
    console.log("Hotel sessions saved for user:", userId, sessions);
  } catch (error) {
    console.error("Error saving hotel sessions to storage:", error);
  }
};

const createSessionId = () => {
  return `hotel_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const MAX_SESSIONS = 10;

// Save search session function
const saveSearchSession = (searchParams) => {
  if (!userId || userId === "AHS_Guest") {
    console.warn("No user ID available, cannot save session");
    return null;
  }

  const sessionId = createSessionId();
  const newSession = {
    id: sessionId,
    timestamp: Date.now(),
    searchParams: searchParams,
    summary: getSessionSummary(searchParams),
  };

  setSearchSessions((prevSessions) => {
    const updatedSessions = [
      newSession,
      ...prevSessions.filter(s => 
        !isSameSearch(s.searchParams, searchParams)
      ).slice(0, MAX_SESSIONS - 1),
    ];
    saveSessionToStorage(updatedSessions, userId);
    return updatedSessions;
  });

  return sessionId;
};

// Helper function to check if two searches are the same
const isSameSearch = (search1, search2) => {
  return (
    search1.City === search2.City &&
    search1.CheckInDate === search2.CheckInDate &&
    search1.CheckOutDate === search2.CheckOutDate &&
    search1.NoOfAdults === search2.NoOfAdults &&
    search1.NoOfChild === search2.NoOfChild &&
    search1.NoOfRooms === search2.NoOfRooms
  );
};

const getSessionSummary = (searchParams) => {
  const { City, CheckInDate, CheckOutDate, NoOfAdults, NoOfChild, NoOfRooms } = searchParams;
  
  const location = City || 'Unknown location';
  const guests = NoOfAdults + (NoOfChild || 0);
  const rooms = NoOfRooms || 1;
  
  return `${location} • ${guests} guest${guests !== 1 ? 's' : ''} • ${rooms} room${rooms !== 1 ? 's' : ''}`;
};

// Add this function to handle recent search selection
const handleRecentSearchSelect = (searchParams) => {
  console.log("Selected recent search:", searchParams);
  
  // Update the search form with selected recent search data
  setHotelSearchCustomerData(prev => ({
    ...prev,
    City: searchParams.City,
    CheckInDate: searchParams.CheckInDate,
    CheckOutDate: searchParams.CheckOutDate,
    NoOfAdults: searchParams.NoOfAdults || 1,
    NoOfChild: searchParams.NoOfChild || 0,
    NoOfRooms: searchParams.NoOfRooms || 1,
    dataSet: searchParams.dataSet || JSON.stringify({ locationDataSet })
  }));

  // Update pax room details
  setPaxRoomDetails({
    totalRooms: searchParams.NoOfRooms || 1,
    totalAdults: searchParams.NoOfAdults || 1,
    totalChildren: searchParams.NoOfChild || 0,
  });

  // Update Google location display
  setGoogleLocation(searchParams.City ? searchParams.City.slice(0, 25) + '...' : 'search');

  // Trigger search with the selected parameters
  setTimeout(() => {
    getHotelData({
      ...hotelSearchCustomerData,
      City: searchParams.City,
      CheckInDate: searchParams.CheckInDate,
      CheckOutDate: searchParams.CheckOutDate,
      NoOfAdults: searchParams.NoOfAdults || 1,
      NoOfChild: searchParams.NoOfChild || 0,
      NoOfRooms: searchParams.NoOfRooms || 1,
    });
  }, 100);
};

// Initialize sessions when component mounts
useEffect(() => {
  if (userId) {
    const storedSessions = getStoredSessions(userId);
    setSearchSessions(storedSessions);
  }
}, [userId]);
  const [date, setDate] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);
  let baseLocationData;

  useEffect(() => {
    baseLocationData = {
      latitude: '6.9271',
      longitude: '79.8612',
      locationDescription: 'Colombo, Sri lanka'
    };

    try {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie;
        if (cookies.includes('userLastLocation')) {
          const cookieValue = decodeURIComponent(
            cookies.split('; ').find(row => row.startsWith('userLastLocation='))?.split('=')[1] || ''
          );
          if (cookieValue) {
            const userLastLocation = JSON.parse(cookieValue);
            baseLocationData = {
              latitude: userLastLocation.latitude.toString(),
              longitude: userLastLocation.longtitude.toString(),
              locationDescription: userLastLocation.address_full,
              address_components: userLastLocation.address_components
            };
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse userLastLocation cookie:', error);
    }
    console.log("Base location data", baseLocationData);
    setLocationDataSet(baseLocationData);
    setLocationDataSetReset(baseLocationData)

    setHotelSearchCustomerData(prev => ({
      ...prev,
      City: baseLocationData.locationDescription,
      Country: baseLocationData.locationDescription,
      dataSet: JSON.stringify(baseLocationData)
    }));

    // setGoogleLocation(baseLocationData.locationDescription?.slice(0, 25).concat(' ...'));
  }, []);

  const [metaDiscountHotel, setMetaDiscountHotel] = useState([])

  useEffect(() => {
    if (locationDataSet) {
      const initialSearch = async () => {
        setLoading(true);
        try {
          const customerId = userId ?? "AHS_Guest";

          const searchParams = {
            ...hotelSearchCustomerData,
            Country: hotelSearchCustomerData.City,
            longitude: locationDataSet?.longitude,
            latitude: locationDataSet?.latitude,
            index: 1,
            length: 100,
          };
          console.log("Initial chamod", searchParams);
          const initialResult = await loadHotelsData(searchParams, customerId);
          console.log("Initial result", initialResult);
          const metaDiscount = initialResult?.hotelMetaDiscount || [];
          setMetaDiscountHotel(metaDiscount)
          const totalHotels = initialResult?.totalHotels || 0;
          const allHotels = [...(initialResult?.hoteldataset || [])];
          setContent(allHotels);
          updateData(allHotels);
          console.log(`Total hotels found`, initialResult);
          const response = await getHotelDataUpdateData(hotelSearchCustomerData, userId || "AHS_Guest");
          console.log("Final result with all hotels");
          if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
            setContent(response);
            updateData(response);
          } else {
            setContent([]);
            updateData([]);
          }
        } catch (error) {
          console.error("Error fetching hotel data:", error);
          setContent([]);
          updateData([]);
        } finally {
          setLoading(false);
        }
      };
      initialSearch();
    }
  }, [locationDataSet]);

  const getHotelDataUpdateData = async (data, userId) => {
    try {
      console.log("Searching hotel data for user:", data);

      const customerId = userId ?? "AHS_Guest";

      const searchParams = {
        ...data,
        Country: data.City,
        index: 1,
        length: 100,
      };

      const initialResult = await loadHotelsData(searchParams, customerId);

      const totalHotels = initialResult?.totalHotels || 0;
      const allHotels = [...(initialResult?.hoteldataset || [])];
      const max_request_count = initialResult?.max_request_count || 1;

      console.log(`Total hotels found: ${totalHotels}`);
      console.log(`Max request count: ${max_request_count}`);

      setContent(allHotels);
      updateData(allHotels);

      // Sequential loading for remaining batches (index 2 to max_request_count)
      if (max_request_count > 1) {
        for (let index = 2; index <= max_request_count; index++) {
          try {
            console.log(`Loading hotels for index: 234234234234`, index);
            const paginatedParams = {
              ...searchParams,
              index: index
            };
            const response = await loadHotelsData(paginatedParams, customerId);
            if (response?.hoteldataset?.length) {
              allHotels.push(...response.hoteldataset);
              // Update state after each batch
              setContent([...allHotels]); // Create new array reference
              updateData([...allHotels]);
              console.log(`✅ Loaded ${response.hoteldataset.length} hotels for index ${index}. Total so far: ${allHotels.length}`);
            } else {
              console.log(`⚠️ No hotels found for index ${index}`);
            }
            // Optional: Add a small delay between requests to prevent overwhelming the server
            // await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ Error loading hotels for index ${index}:`, error);
            // Continue with next index even if one fails
          }
        }
      }

      console.log(`✅ Total hotels fetched: ${allHotels.length}`);
      return allHotels;
    } catch (error) {
      console.error("❌ Error loading hotel data:", error);
      return [];
    }
  };

  // const handleMinMaxPrice = (e) => {
  //   setUserMinMaxPrice({
  //     ...userMinMaxPrice,
  //     [e.target.name]: e.target.value
  //   })
  // }
  const handleMinMaxPrice = (e) => {
    const { name, value } = e.target;

    // Convert the display value back to base currency for storage
    const baseValue = convertFromDisplayCurrency(value, baseCurrencyValue, tempCurrency);

    setUserMinMaxPrice({
      ...userMinMaxPrice,
      [name]: baseValue,
    });
  };

  const getHotelcityLocations = (response) => {
    let cityArr = [];
    response !== "Something went wrong !" &&
      response.map((value) => {
        try {
          let cityValue = value?.City?.toLowerCase()?.trim();
          if (cityValue == '' || cityValue == null || cityValue == undefined) {
          } else {
            if (!cityArr.includes(cityValue)) {
              cityArr.push(cityValue)
            }
          }
        } catch (error) {
          cityArr = []
        }
      })
    setHotelLocations(cityArr.toSorted())
  }

  const handleLocationchange = (value) => { handleOnChange(value, selectedLocations, setSelectedLocations, 'City') }
  const handleCategoryChange = (value) => {
    console.log('value12366', value, selectedCategory)
    handleOnChange(value, selectedCategory, setSelectedCategory, 'StarRating')
    setUserSearchQuery("")
  }
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
    const index = selectedItems.indexOf(value);
    let updatedSelectedItems;
    if (index === -1) {
      updatedSelectedItems = [value, ...selectedItems];
    } else {
      updatedSelectedItems = selectedItems.filter(item => item !== value);
    }
    setSelectedItems(updatedSelectedItems);
    const dataset = { value, type };
    let sampledataset;
    if (index === -1) {
      sampledataset = [...filterCheckboxes, dataset];
    } else {
      sampledataset = filterCheckboxes.filter(item => !(item.value === value && item.type === type));
    }
    let result = []
    sampledataset.map((value) => {
      if (!result.includes(value.type)) {
        result.push(value.type)
      }
    })
    setFilteringValue(result);
    removeDuplicates(sampledataset);
  }

  // price filter
  const [priceFilterOpen, setpriceFilterOpen] = useState(true);
  const [pricefilter, setpricefilter] = useState(false);

  const [tempCurrency, setTempCurrency] = useState(baseCurrencyValue?.base || 'USD');


  const [minprice, setminprice] = useState('');
  const [maxprice, setmaxprice] = useState('');

  const [pricerange, setpricerange] = useState([]);
  const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);

  const [userMinMaxPrice, setUserMinMaxPrice] = useState({
    min: minprice,
    max: maxprice
  })

  // sorting..
  const [priceSorting, setPriceSorting] = useState(true);

  const [sortingFilter, setSortingFilters] = useState({
    pricefilter: 'default',
    distanceFilter: 'default'
  });

  // 1. Fix the createPriceFilterButtons function
  const createPriceFilterButtons = async (dataset) => {
    if (dataset.length > 0) {
      // Ensure baseCurrencyValue is available
      if (!baseCurrencyValue || !baseCurrencyValue.base) {
        console.warn('Base currency not available yet');
        return;
      }

      let filtered = dataset.toSorted((a, b) => {
        return CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue) -
          CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue);
      });

      let result = createPriceSteps(
        Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0].Currency, filtered[0].TotalRate, baseCurrencyValue)),
        Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1].Currency, filtered[filtered.length - 1].TotalRate, baseCurrencyValue))
      );

      setminprice(result[0].start);
      setmaxprice(result[result.length - 1].end);
      setpricerange([result[0].start, result[result.length - 1].end]);

      console.log("Price filter buttons", result);
      setFilterByPriceButtons(result);
      setUserMinMaxPrice({
        min: result[0].start,
        max: result[result.length - 1].end
      });

      // Set tempCurrency immediately when creating price buttons
      setTempCurrency(baseCurrencyValue.base);
    } else {
      setFilterByPriceButtons([]);
    }
  };
  const handlePriceFilterChange = async (value) => {
    setminprice(value.start);
    setmaxprice(value.end);
    setpricefilter(true);
    setUserSearchQuery("")
    // Update user min/max price to match selected range
    setUserMinMaxPrice({
      min: value.start,
      max: value.end
    });
  };

  // const handleSearchPriceRange = () => {
  //   if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
  //     ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
  //   } else if (Number(userMinMaxPrice.min) < 0 || Number(userMinMaxPrice.max)  < 0) {
  //           ToastMessage({
  //               status: "warning",
  //               message: 'Price values cannot be negative.'
  //           });
  //           return;

  //       } else if (Number(userMinMaxPrice.min)  === 0 && Number(userMinMaxPrice.max)  === 0) {
  //           ToastMessage({
  //               status: "warning",
  //               message: 'Please enter a valid price range.'
  //           });
  //           return;
  //       } else {
  //     setminprice(userMinMaxPrice.min);
  //     setmaxprice(userMinMaxPrice.max);
  //        setpricefilter(true);
  //           setUserSearchQuery("");
  //   }
  // }

  const handleSearchPriceRange = () => {
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
      setUserSearchQuery("");
    } else {
      ToastMessage({
        status: "warning",
        message: 'Please enter valid numeric values for price range.'
      });
    }
  };

  const updateData = async (dataset) => {
    console.log("Dataset", dataset);
    setHotelMainDataset(dataset);
    setFilteredMainDataset(dataset);
    getHotelcityLocations(dataset);

    // Only create price filter buttons if we have baseCurrencyValue
    if (baseCurrencyValue && baseCurrencyValue.base) {
      await createPriceFilterButtons(dataset);
    }
  };

  useEffect(() => {
    if (baseCurrencyValue && baseCurrencyValue.base && hotelMainDataset.length > 0) {
      createPriceFilterButtons(hotelMainDataset);
    }
    // }, [baseCurrencyValue]);
  }, []);

  const [hotelMainLoading, setHotelMainLoading] = useState(false);

  const getHotelData = async (data) => {
    console.log("Hotel data isss", data)
 saveSearchSession(data);
    // Clear all filters before performing new search
    handleClearAllFilters();

    setLoading(true);
    setHotelMainLoading(true)
    const customerId = userId ?? "AHS_Guest";

    const searchParams = {
      ...hotelSearchCustomerData,
      Country: hotelSearchCustomerData.City,
      longitude: locationDataSet?.longitude,
      latitude: locationDataSet?.latitude,
      index: 1,
      length: 100,
    };

    const initialResult = await loadHotelsData(searchParams, customerId);

    const allHotels = [...(initialResult?.hoteldataset || [])];

    setContent(allHotels);
    updateData(allHotels);

    await getHotelDataUpdateData(data, userId || "AHS_Guest").then((response) => {
      if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
        updateData([]);
        setLoading(false);
        setHotelMainLoading(false)
      } else {
        updateData(response || []);
        setContent(response || []);
        setLoading(false);
        setHotelMainLoading(false)
      }
    })
  }

  // useEffect(()=>{
  //   getHotelData(hotelSearchCustomerData);
  // },[baseLocation?.address_full])

  const removeDuplicates = (arr) => {
    const unique = [];
    const items = new Set();
    arr.forEach(item => {
      const key = JSON.stringify(item);
      if (!items.has(key)) {
        items.add(key);
        unique.push(item);
      }
    });
    setFilterCheckboxes(unique);
  };

  const handleChange = (value) => {
    const query = value;
    setUserSearchQuery(query);
    let filtered = hotelMainDataset.filter((value) => {
      return value.HotelName.toLowerCase().trim().includes(query.toLowerCase().trim())
    })
    const filteredData = getFilteredProducts(filteringValue, filteringValue[0], filtered);
    setFilteredMainDataset(filteredData);
  };

  const handleHeaderSearch = (searchQuery) => {
    handleChange(searchQuery);
  };

  // const getFilteredProducts = (filters, dynamicValue, dataset) => {
  //   let filtered = [];

  //   if (filters.length === 0) {
  //     return getPricefilters(dataset);
  //   } else {
  //     // Use Set to track unique hotel codes to prevent duplicates
  //     const addedHotels = new Set();

  //     filterCheckboxes.forEach((filterItem) => {
  //       dataset.forEach((data) => {
  //         try {
  //           let shouldInclude = false;

  //           if (dynamicValue === 'City') {
  //             shouldInclude = data?.[dynamicValue]?.trim().toLowerCase() === filterItem.value.trim().toLowerCase();
  //           } else {
  //             shouldInclude = data?.[dynamicValue] == filterItem?.value;
  //           }

  //           // Only add if it matches the filter and hasn't been added yet
  //           if (shouldInclude && !addedHotels.has(data.HotelCode)) {
  //             filtered.push(data);
  //             addedHotels.add(data.HotelCode);
  //           }
  //         } catch (error) {
  //           console.error('Error in filtering:', error);
  //         }
  //       });
  //     });
  //   }

  //   let remainingFilters = filters.slice(1);
  //   return getFilteredProducts(remainingFilters, remainingFilters[0], filtered);
  // };
  const getFilteredProducts = (filters, dynamicValue, dataset) => {
    let filtered = [];

    if (filters.length === 0) {
      return getPricefilters(dataset);
    } else {
      // Use Set to track unique hotel codes to prevent duplicates
      const addedHotels = new Set();

      // Group filters by type for better processing
      const filtersByType = {};
      filterCheckboxes.forEach(filter => {
        if (!filtersByType[filter.type]) {
          filtersByType[filter.type] = [];
        }
        filtersByType[filter.type].push(filter.value);
      });

      // Apply filters
      dataset.forEach((data) => {
        let shouldInclude = false;

        // Check if data matches ALL filter types
        const matchesAllFilters = Object.keys(filtersByType).every(filterType => {
          const filterValues = filtersByType[filterType];

          if (filterType === 'City') {
            return filterValues.some(value =>
              data?.[filterType]?.trim().toLowerCase() === value.trim().toLowerCase()
            );
          } else {
            return filterValues.some(value => data?.[filterType] == value);
          }
        });

        if (matchesAllFilters && !addedHotels.has(data.HotelCode)) {
          filtered.push(data);
          addedHotels.add(data.HotelCode);
        }
      });
    }

    return getPricefilters(filtered);
  };


  const getPricefilters = (dataset) => {
    // Remove duplicates first using HotelCode as unique identifier
    const uniqueDataset = dataset.filter((item, index, self) =>
      index === self.findIndex(hotel => hotel.HotelCode === item.HotelCode)
    );

    // console.log(minprice, "Min price data");

    // Ensure we have valid price range
    if (minprice === '' || maxprice === '' || !baseCurrencyValue) {
      return uniqueDataset;
    }

    // Filter by price range
    let result = uniqueDataset.filter((value) => {
      let price = CurrencyConverterOnlyRateWithoutDecimal(value.Currency, value.TotalRate, baseCurrencyValue);
      return Number(CurrencyConverterOnlyRateWithoutDecimal(tempCurrency, minprice, baseCurrencyValue)) <= Number(price) && Number(price) <= Number(CurrencyConverterOnlyRateWithoutDecimal(tempCurrency, maxprice, baseCurrencyValue));
    });

    let sortedResult = [];

    if (sortingFilter.pricefilter === "default") {
      sortedResult = result;
    } else if (sortingFilter.pricefilter === "lowtohigh") {
      sortedResult = result.sort((a, b) => {
        const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
        const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
        return priceA - priceB;
      });
    } else if (sortingFilter.pricefilter === "hightolow") {
      sortedResult = result.sort((a, b) => {
        const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
        const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
        return priceB - priceA;
      });
    }

    return sortedResult;
  };

  const startFiltering = () => {
    const filteredData = getFilteredProducts(filteringValue, filteringValue[0], hotelMainDataset);
    setFilteredMainDataset(filteredData);
  };

  const handleValidateAdultChildCount = (value) => {
    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      NoOfAdults: value.adult,
      NoOfChild: value.child,
    })
    setChildAges(value.childAges);
  }
  // Add this useEffect to your main component (where you have openDate state)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openDate) return;

      if (dateFieldRef.current && !dateFieldRef.current.contains(event.target)) {
        setOpenDate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDate]);

 const handleOnGoogleLocationChange = (value) => {
  setIsFocused(false);
  setGoogleLocation(value['label'].slice(0, 25) + '...');
  
  geocodeByPlaceId(value['value']['place_id'])
    .then(results => {
      // Get the formatted address
      const formattedAddress = results[0]?.formatted_address || '';
      
      // Try to extract country information
      let country = '';
      let city = '';
      let countryFound = false;
      
      // Check address components for country
      for (const component of results[0].address_components) {
        if (component.types.includes("country")) {
          country = component.long_name;
          countryFound = true;
          break;
        }
        if (component.types.includes("administrative_area_level_1")) {
          // For large countries, use the state/province as city
          city = component.long_name;
        }
        if (component.types.includes("locality") && !city) {
          city = component.long_name;
        }
      }
      
      // If no country found but we have a formatted address, use that
      if (!countryFound && formattedAddress) {
        // Check if the address looks like a country (short, no commas, etc.)
        const addressParts = formattedAddress.split(',').map(part => part.trim());
        if (addressParts.length === 1 || addressParts.length === 2) {
          // Likely a country or major region
          country = addressParts[addressParts.length - 1];
        }
      }
      
      // Get latitude and longitude
      return getLatLng(results[0])
        .then(({ lat, lng }) => {
          return { lat, lng, country, city, formattedAddress, address_components: results[0].address_components };
        });
    })
    .then(({ lat, lng, country, city, formattedAddress, address_components }) => {
      // Determine what to display as the location
      let displayLocation = formattedAddress;
      
      // If we found a country, prioritize showing that
      if (country) {
        displayLocation = country;
      } else if (city) {
        displayLocation = city;
      }
      
      // Update the search customer data
      const locationData = {
        latitude: lat,
        longitude: lng,
        locationDescription: displayLocation,
        address_components: address_components,
        formatted_address: formattedAddress,
        country: country || '',
        city: city || ''
      };
      
      setHotelSearchCustomerData({
        ...hotelSearchCustomerData,
        City: displayLocation,
        Country: displayLocation,
        dataSet: JSON.stringify(locationData)
      });
      
      // Also update the google location display
      setGoogleLocation(displayLocation.slice(0, 25) + '...');
      
      // Optional: Show a toast message for country searches
      if (country && (country.toLowerCase().includes('india') || country.toLowerCase().includes('china'))) {
        ToastMessage({
          status: "info",
          message: `Searching hotels in ${country}`
        });
      }
    })
    .catch((error) => {
      console.error('Error processing location:', error);
      ToastMessage({
        status: "error",
        message: "Unable to process location. Please try again."
      });
    });
};

  const handleOnDatePicker = (value) => {
    console.log("Selected date range", value);
    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      CheckInDate: moment(value[0].startDate).format('DD/MM/YYYY'),
      CheckOutDate: moment(value[0].endDate).format('DD/MM/YYYY'),
    });
    setDate(value);
    // setOpenDate(!openDate);
  }

  // const handleRoomCount = (e) => {
  //   setHotelSearchCustomerData({
  //     ...hotelSearchCustomerData,
  //     NoOfRooms: e.value
  //   });
  // }

  // const handleStarRate = (e) => {
  //   setHotelSearchCustomerData({
  //     ...hotelSearchCustomerData,
  //     StarRate: e.value
  //   });
  // }

  // useEffect(() => {
  //   if (!loading && baseCurrencyValue) {
  //     startFiltering();
  //   }
  // }, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue]);
  useEffect(() => {
    if (!loading && baseCurrencyValue) {
      startFiltering();
    }
  }, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue, hotelMainDataset]); // Add hotelMainDataset to dependencies
  const resetAllFilters = () => {
    setSelectedCategory([]);
    setSelectedLocations([]);
    setFilterCheckboxes([]);
    setFilteringValue([]);
    setpricefilter(false);
    setUserSearchQuery("");
  };

  // useEffect(() => {
  //   var hotelSearchData = hotelSearchCustomerData;
  //   hotelSearchData["City"] = baseLocation?.address_full;
  // }, [baseLocation]);

  // useEffect(() => {
  //   setGoogleLocation(baseLocation?.address_full.slice(0, 25).concat(' ...'));
  // }, [baseLocation?.address_full])

  // const handleClearAllFilters = () => {
  //   setSelectedCategory([]);
  //   setSelectedLocations([]);
  //   setFilteredMainDataset(content);
  //   clearPriceFilter();
  // }
  const handleClearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedLocations([]);
    setFilterCheckboxes([]); // Add this line - it was missing
    setFilteringValue([]); // Add this line - it was missing
    setFilteredMainDataset(hotelMainDataset); // Use hotelMainDataset instead of content
    clearPriceFilter();
  }

  // const clearPriceFilter = () => {
  //   if (pricerange.length > 0) {
  //     setminprice(pricerange[0]);
  //     setmaxprice(pricerange[1]);
  //     setUserMinMaxPrice({
  //       min: pricerange[0],
  //       max: pricerange[1]
  //     });
  //   }
  //   setpricefilter(false);
  //   setFilteringValue([]);
  // };
  const clearPriceFilter = () => {
    if (pricerange.length > 0) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
      setUserMinMaxPrice({
        min: pricerange[0],
        max: pricerange[1]
      });
    }
    setpricefilter(false);
    // Remove these lines as they're now handled in handleClearAllFilters
    // setFilteringValue([]);
  };

  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [searchFilter, setSearchfilter] = useState(false);

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  }

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  }

  const toggleSubFilter = () => {
    setopenSideBarStatus(!openSideBarStatus);
  };

  const openSearchFilter = () => {
    setSearchfilter(true);
  }

  const closeSearchFilter = () => {
    setSearchfilter(false);
    handleChange('');
  }

  // const router = useRouter();
  const canonicalUrl = router.asPath;

  const options = [
    { value: 'default', label: 'Default' },
    { value: 'lowtohigh', label: 'Price Low to High' },
    { value: 'hightolow', label: 'Price High to Low' }
  ];

  const handleSelectChange = (selectedOption) => {
    setSortingFilters({ ...sortingFilter, pricefilter: selectedOption.value });
  };
  // Add this state for sorting dropdown
  const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false);
  // Update this useEffect for scroll handling
  useEffect(() => {
    const handleScroll = () => {
      // Close dropdowns when scrolling
      if (isLocationDropdownOpen) {
        setIsLocationDropdownOpen(false);
        setIsFocused(false);
      }
      if (openDate) {
        setOpenDate(false);
      }
      if (isSortingDropdownOpen) {
        setIsSortingDropdownOpen(false);
      }
    };

    // Use capture phase to catch scroll events early
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [isLocationDropdownOpen, openDate, isSortingDropdownOpen]); // Add isSortingDropdownOpen to dependencies
  useEffect(() => {

    const discountData = [];
    content.forEach(item => {
      if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
        discountData.push({
          discount: item.discount,
          product: item
        });
      }
    });

    // console.log("Discount data", discountData)

    setAllDiscountData(discountData);


    setLoading(false);
    updateData(content);
  }, [content]);

  // const handleClearHotelSearch = async () => {
  //   // console.log('reset data', baseLocation)
  //   const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
  //   const checkout = moment().add(8, 'days').format('DD/MM/YYYY');
  //   setSortingFilters({
  //     pricefilter: 'default',
  //     distanceFilter: 'default'
  //   })

  //   setHotelSearchCustomerData({
  //     CheckInDate: checkIn,
  //     CheckOutDate: checkout,
  //     NoOfNights: 1,
  //     NoOfRooms: 1,
  //     NoOfAdults: 1,
  //     NoOfChild: 0,
  //     City: baseLocation?.address_full,
  //     dataSet: JSON.stringify(locationDataSetReset),
  //     Country: baseLocation?.address_full,
  //     StarRate: 0,
  //     RoomRequest: [{
  //       indexValue: 0,
  //       roomType: "Single",
  //       NoOfAdults: 1,
  //       NoOfChild: 0,
  //       ChildAge: []
  //     }]
  //   });

  //   setPaxRoomDetails({
  //     "totalRooms": 1,
  //     "totalAdults": 1,
  //     "totalChildren": 0,
  //   })

  //   setLoading(true);

  //   const customerId = userId ?? "AHS_Guest";

  //   // const searchParams = {
  //   //     ...hotelSearchCustomerData,
  //   //     Country: hotelSearchCustomerData.City,
  //   //     offset: 0,
  //   //     length: 100,
  //   // };

  //   const searchParams = {
  //     CheckInDate: checkIn,
  //     CheckOutDate: checkout,
  //     NoOfNights: 1,
  //     NoOfRooms: 1,
  //     NoOfAdults: 1,
  //     NoOfChild: 0,
  //     City: baseLocation?.address_full,
  //     dataSet: JSON.stringify(locationDataSetReset),
  //     Country: baseLocation?.address_full,
  //     latitude: baseLocation?.latitude,
  //     longitude: baseLocation?.longitude,
  //     StarRate: 0,
  //     length: 100,
  //     RoomRequest: [{
  //       indexValue: 0,
  //       roomType: "Single",
  //       NoOfAdults: 1,
  //       NoOfChild: 0,
  //       ChildAge: []
  //     }]
  //   }

  //   handleClearAllFilters()
  //   console.log("Initial result1111", searchParams)
  //   const initialResult = await loadHotelsData(searchParams, customerId);
  //   // console.log("Initial result", initialResult)
  //   const allHotels = [...(initialResult?.hoteldataset || [])];
  //   setContent(allHotels);
  //   updateData(allHotels);
  //   setLoading(false);
  //   setGoogleLocation(baseLocation?.address_full)
  //   await getHotelDataUpdateData(searchParams, userId).then((response) => {
  //     if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
  //       updateData([]);
  //       setLoading(false);
  //     } else {
  //       updateData(response || []);
  //       setContent(response || []);
  //       setLoading(false);
  //     }
  //   })
  // }
  const handleClearHotelSearch = async () => {
    const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
    const checkout = moment().add(8, 'days').format('DD/MM/YYYY');
    setGoogleLocation('search')
    setSortingFilters({
      pricefilter: 'default',
      distanceFilter: 'default'
    });
    setSearchRoomData({})
    setHotelSearchCustomerData({
      CheckInDate: checkIn,
      CheckOutDate: checkout,
      NoOfNights: 1,
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      City: baseLocation?.address_full,
      dataSet: JSON.stringify(locationDataSetReset),
      Country: baseLocation?.address_full,
      StarRate: 0,
      RoomRequest: [{
        indexValue: 0,
        roomType: "Single",
        NoOfAdults: 1,
        NoOfChild: 0,
        ChildAge: []
      }]
    });

    setPaxRoomDetails({
      "totalRooms": 1,
      "totalAdults": 1,
      "totalChildren": 0,
    });

    // Use the new reset function
    resetAllFilters();

    setLoading(true);

    const customerId = userId ?? "AHS_Guest";
    const searchParams = {
      CheckInDate: checkIn,
      CheckOutDate: checkout,
      NoOfNights: 1,
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      City: baseLocation?.address_full,
      dataSet: JSON.stringify(locationDataSetReset),
      Country: baseLocation?.address_full,
      latitude: baseLocation?.latitude,
      longitude: baseLocation?.longitude,
      StarRate: 0,
      length: 100,
      RoomRequest: [{
        indexValue: 0,
        roomType: "Single",
        NoOfAdults: 1,
        NoOfChild: 0,
        ChildAge: []
      }]
    };

    console.log("Initial result1111", searchParams);
    const initialResult = await loadHotelsData(searchParams, customerId);
    const allHotels = [...(initialResult?.hoteldataset || [])];
    setContent(allHotels);
    updateData(allHotels);
    setLoading(false);
    // setGoogleLocation(baseLocation?.address_full);

    await getHotelDataUpdateData(searchParams, userId).then((response) => {
      if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
        updateData([]);
        setLoading(false);
      } else {
        updateData(response || []);
        setContent(response || []);
        setLoading(false);
      }
    });
    handleClearAllFilters()
  };
  const handleDateSelect = (dateRange) => {
    console.log("Selected date range", dateRange);

    if (dateRange && dateRange[0]) {
      const { startDate, endDate } = dateRange[0];

      if (startDate && endDate) {
        setDate(dateRange);

        setHotelSearchCustomerData(prev => ({
          ...prev,
          CheckInDate: moment(startDate).format('DD/MM/YYYY'),
          CheckOutDate: moment(endDate).format('DD/MM/YYYY'),
        }));
      }
    }
  };

  const customStyles = `
  .rdrYearPicker,
  .rdrMonthAndYearWrapper .rdrMonthAndYearPickers .rdrYearPicker {
    display: none !important;
  }
`;
  const [isFocused, setIsFocused] = useState(false);
  const [searchRoomData, setSearchRoomData] = useState({})

  const handleRoomAllocation = (data) => {
    console.log("Room allocation data", data);
    setSearchRoomData(data);
    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      NoOfAdults: data?.roomDetails?.adults || 1,
      NoOfChild: data?.roomDetails?.children,
    })
    setPaxRoomDetails({
      ...paxRoomDetails,
      "totalRooms": data?.totalRooms || 1,
      "totalAdults": data?.totalAdults || 1,
      "totalChildren": data?.totalChildren || 0,
    })
    // setChildAges(value.childAges);

    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      NoOfRooms: data?.roomCounts?.Single
    });

  }

  const handleTogle = () => {
    setOpenRoomModel(!openRoomModel);
  }

  const [screenWidth, setScreenWidth] = useState(0);

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

  const handleRemovePriceFilters = async () => {
    setminprice('');
    setmaxprice('');
    setpricefilter(false);

    setUserMinMaxPrice({
      min: '',
      max: ''
    });
  };


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
  return (
    <>

      <Head>
        <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
        <title>Aahaas - Hotels</title>
        <meta name="description" content="Discover a variety of hotels with Aahaas, whether you're looking for luxurious retreats or affordable stays. Our wide range of options ensures you can rest in comfort after a day of exploration. Book your perfect accommodation and start your journey in style." /> {/* Set meta description if needed */}
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
                  "name": "Hotels",
                  "item": "https://www.aahaas.com/hotels"
                }
              ]
            }),
          }}
        />
      </Head>

      <CommonLayout title="hotel" parent="home" showMenuIcon={true} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()} onSearch={handleHeaderSearch}>
        <section className="section-b-space ratio_asos">
          <div className="collection-wrapper">
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
            <Container>
              <Row>

                <Col
                  sm="3"
                  className="collection-filter yellow-scrollbar"
                  id="filter"
                  style={{
                    display: openSideBarStatus ? "block" : "none",  // Show/hide based on openSideBarStatus for all screen sizes
                    left: openSideBarStatus ? "0px" : "",
                    position: 'sticky',
                    top: '20px',
                    alignSelf: 'flex-start',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                  }}
                >

                  <div className="collection-filter-block px-lg-4 pe-5">

                    <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
                      <span className="filter-back">
                        <i className="fa fa-angle-left" ></i> back
                      </span>
                    </div>

                    {/* Modals - Always available now */}
                    <ModalBase isOpen={openAdultChildModal} title={'Select Number of Pax'} toggle={() => { setOpenAdultChildModal(false) }} size="lg">
                      <PaxIncrementorComponent
                        open={openAdultChildModal}
                        adultCount={parseInt(hotelSearchCustomerData.NoOfAdults)}
                        toggle={() => { setOpenAdultChildModal(false) }}
                        childCount={parseInt(hotelSearchCustomerData.NoOfChild)}
                        adultChildMinMax={adultChildMinMax}
                        //  childAgesDynamic={customerDetails.childAges}
                        addPaxPaxIncrement={handleValidateAdultChildCount} >
                      </PaxIncrementorComponent>
                    </ModalBase>

                    <ModalBase isOpen={openRoomModel} title={'Select Room And Pax Count'} toggle={() => { setOpenRoomModel(false) }} size="lg">
                      <RoomAllocation handleRoomAllocation={handleRoomAllocation} handleTogle={handleTogle} preData={searchRoomData} />
                    </ModalBase>

                    {/* <ModalBase isOpen={openDate} title={'Select Date'} toggle={() => { setOpenDate(!openDate) }} size="lg">
  <div style={{ width: '100%', height: '100%' }} className="d-flex justify-content-center align-items-center flex-column">
    <style>{customStyles}</style>
    <CustomCalendar handleDateSelect={handleDateSelect} selectedDate={date} />
  </div>
</ModalBase> */}
                  </div>

                  <div className="collection-filter-block px-lg-4 pe-5">
                    <div className="collection-collapse-block">
                      {/* Sort By Section */}
                      <div className="collection-collapse-block">
                        <h5 style={{ fontWeight: '500', fontSize: '15px' }} className="collapse-block-title-selected">
                          Sort By
                        </h5>
                        <Collapse isOpen={true}>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter">
                              <Select
                                value={options.find(option => option.value === sortingFilter.pricefilter)}
                                onChange={(selectedOption) => {
                                  handleSelectChange(selectedOption);
                                  setIsSortingDropdownOpen(false);
                                }}
                                options={options}
                                isSearchable={false}
                                className="basic-single"
                                classNamePrefix="select"
                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                // Add these props to control dropdown state
                                onMenuOpen={() => setIsSortingDropdownOpen(true)}
                                onMenuClose={() => setIsSortingDropdownOpen(false)}
                                menuIsOpen={isSortingDropdownOpen}
                                styles={{
                                  control: (provided) => ({
                                    ...provided,
                                    minHeight: '40px',
                                    fontSize: '14px',
                                    borderColor: '#ddd',
                                    boxShadow: 'none',
                                    width: '100%',
                                    '&:hover': {
                                      borderColor: '#004e64'
                                    }
                                  }),
                                  option: (provided) => ({
                                    ...provided,
                                    fontSize: '14px'
                                  }),
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  }),
                                  menuPortal: (provided) => ({
                                    ...provided,
                                    zIndex: 9999,
                                  })
                                }}
                              />
                            </div>
                          </div>
                        </Collapse>
                      </div>

                      <div className="collection-collapse-block">
                        <h5 style={{ fontWeight: '500' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
                        <Collapse isOpen={priceFilterOpen}>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter">
                              <ul className="category-list">
                                {
                                  filterByPriceButtons?.map((value, key) => (
                                    <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                      <Input
                                        checked={value.start === minprice && value.end === maxprice}
                                        onChange={() => handlePriceFilterChange(value)}
                                        name={value}
                                        id={value}
                                        type="radio"
                                        className="custom-control-input option-btns"
                                      />
                                      <h6 className="m-0 p-0" htmlFor={value} onClick={() => handlePriceFilterChange(value)}>
                                        {`${CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)} - ${CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}`}
                                      </h6>
                                    </div>
                                  ))
                                }
                              </ul>
                            </div>
                          </div>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter">
                              <div className="d-flex align-items-end align-content-stretch gap-3">
                                <div className="d-flex flex-column align-itmes-end col-4">
                                  <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ padding: '9px 10px', borderRadius: '5px' }}
                                    onInput={(e) => {
                                      if (e.target.value.length > 10) {
                                        e.target.value = e.target.value.slice(0, 10);
                                      }
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
                                    onChange={handleMinMaxPrice}
                                  />
                                </div>

                                <div className="d-flex flex-column align-itmes-end col-4">
                                  <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
                                  <input
                                    type="number"
                                    className="form-control"
                                    style={{ padding: '9px 10px', borderRadius: '5px' }}
                                    onInput={(e) => {
                                      if (e.target.value.length > 10) {
                                        e.target.value = e.target.value.slice(0, 10);
                                      }
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
                                    name="max"
                                    onChange={handleMinMaxPrice}
                                  />
                                </div>
                                <div className="ms-auto col-3">
                                  <button className="btn btn-sm btn-solid" style={{ padding: '7px 10px', borderRadius: '5px' }} onClick={handleSearchPriceRange}><SearchIcon /></button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Collapse>
                      </div>
                      <div className="collection-collapse-block open">
                        <h5 style={{ fontWeight: '500' }} className={hotelCategory ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setHotelCategory(!hotelCategory)}>Hotel category</h5>
                        <Collapse isOpen={hotelCategory}>
                          <div className="collection-collapse-block-content">
                            <div className="collection-brand-filter">
                              <ul className="category-list">
                                {
                                  roomCategory.map((value, index) => (
                                    value.label !== 'All stars' &&
                                    <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
                                      <Input checked={selectedCategory.includes(value.value)} onChange={() => { handleCategoryChange(value.value) }} name={value.value} id={value.value} type="checkbox" className="custom-control-input option-btns" />
                                      <h6 className="m-0 p-0" htmlFor={value.label} onClick={() => handleCategoryChange(value.value)}>{value.label}</h6>
                                    </div>
                                  ))
                                }
                              </ul>
                            </div>
                          </div>
                        </Collapse>
                      </div>



                    </div>
                  </div>
                </Col>

                <Col
                  className="collection-content"
                  sm='12'
                  md='12'
                  lg={openSideBarStatus ? "9" : "12"}
                  style={{
                    transition: "all 0.3s ease"
                  }}
                >
                  <div className="page-main-content">
                    <Row>
                      <Col sm="12">

                        {/* <div className="d-none d-lg-block d-md-block top-banner-wrapper">
                          <a href={null}>
                            <Media src={Menu2.src} className="img-fluid blur-up lazyload" alt="" />
                          </a>
                        </div> */}

                        <div className="collection-product-wrapper mt-0 mt-lg-2">



                          {/* Classy Hotel Search Container */}
                          <div className="classy-search-container mb-4">
                            <div className="search-card">

                              <div className="search-form">
                                <div className="search-row">
                                  {/* Filter Button */}
                                  <div className="filter-section">
                                    <button
                                      className="classy-filter-btn"
                                      onClick={toggleSubFilter}
                                      title="Filters & Sort"
                                    >
                                      <i className="fa fa-sliders" style={{ fontSize: '18px' }}></i>
                                      <span className="filter-text">Filters</span>
                                    </button>
                                  </div>

                                  {/* Search Fields */}
                                  <div className="search-fields">
                                    {/* Location Field */}
<div className="search-field location-field">
  <div className="field-header" style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
    <i className="fa fa-map-marker field-icon"></i>
    <label className="field-label">Destination</label>
    
    {/* Recent Searches Icon */}
    <button
      className="recent-searches-icon"
      onClick={() => setShowRecentSearches(true)}
      title="Recent Searches"
      style={{
        background: 'none',
        border: 'none',
        color: '#3b82f6',
        cursor: 'pointer',
        marginLeft: 'auto',
        padding: '4px',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.target.style.background = 'rgba(59, 130, 246, 0.1)';
        e.target.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.background = 'none';
        e.target.style.transform = 'scale(1)';
      }}
    >
      <History size={16} />
      {searchSessions.length > 0 && (
        <span style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          // background: '#ef4444',
          color: '#2861e3',
          borderRadius: '50%',
          width: '14px',
          height: '14px',
          fontSize: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          {searchSessions.length}
        </span>
      )}
    </button>
  </div>
  
  <div className="field-input-wrapper">
    <GooglePlacesAutocomplete
      apiKey={groupApiCode}
      selectProps={{
        value: googleLocation,
        placeholder: isFocused ? "" : googleLocation === 'search' ? 'Where do you want to stay?' : googleLocation,
        onChange: (e) => {
          handleOnGoogleLocationChange(e);
          setIsLocationDropdownOpen(false);
        },
        onFocus: () => {
          setIsFocused(true);
          setIsLocationDropdownOpen(true);
        },
        onBlur: () => {
          setIsFocused(false);
          setIsLocationDropdownOpen(false);
        },
        onMenuOpen: () => setIsLocationDropdownOpen(true),
        onMenuClose: () => setIsLocationDropdownOpen(false),
        menuIsOpen: isLocationDropdownOpen,
        menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
                                            styles: {
                                              control: (provided, state) => ({
                                                ...provided,
                                                border: 'none',
                                                boxShadow: 'none',
                                                backgroundColor: 'transparent',
                                                minHeight: '32px',
                                                fontSize: '15px',
                                                fontWeight: '500',
                                                cursor: 'text'
                                              }),
                                              placeholder: (provided) => ({
                                                ...provided,
                                                color: '#64748b',
                                                fontSize: '15px',
                                                fontWeight: '400'
                                              }),
                                              singleValue: (provided) => ({
                                                ...provided,
                                                color: '#1e293b',
                                                fontSize: '15px',
                                                fontWeight: '500'
                                              }),
                                              input: (provided) => ({
                                                ...provided,
                                                color: '#1e293b',
                                                fontSize: '15px'
                                              }),
                                              menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999,
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                                overflow: 'hidden'
                                              }),
                                              menuPortal: (provided) => ({
                                                ...provided,
                                                zIndex: 9999
                                              }),
                                              option: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f1f5f9' : 'white',
                                                color: state.isSelected ? 'white' : '#1e293b',
                                                fontSize: '14px',
                                                padding: '12px 16px',
                                                cursor: 'pointer'
                                              })
                                            }
                                          }}
                                        />
                                      </div>
                                    </div>
<RecentSearchesModal
  isOpen={showRecentSearches}
  onClose={() => setShowRecentSearches(false)}
  onSelectSearch={handleRecentSearchSelect}
  userId={userId}
  searchSessions={searchSessions}
  onSessionsUpdate={setSearchSessions}
/>
                                    {/* Date Field */}
                                    <div ref={dateFieldRef} className="search-field date-field date-field-dropdown">
                                      <div
                                        className="field-header"
                                        onClick={() => {
                                          console.log("Date field clicked, current openDate:", openDate);
                                          setOpenDate(!openDate);
                                        }}
                                      >
                                        <i className="fa fa-calendar field-icon"></i>
                                        <label className="field-label">Dates</label>
                                      </div>
                                      <div
                                        className="field-value"
                                        onClick={() => {
                                          console.log("Date value clicked, current openDate:", openDate);
                                          setOpenDate(!openDate);
                                        }}
                                      >
                                        {hotelSearchCustomerData.CheckInDate} - {hotelSearchCustomerData.CheckOutDate}
                                      </div>

                                      {/* Dropdown Calendar */}
                                      {openDate && (
                                        <div className="calendar-dropdown-wrapper">
                                          {console.log("Calendar rendering")}
                                          <CustomCalendar
                                            handleDateSelect={handleDateSelect}
                                            selectedDate={date}
                                            onClose={() => {
                                              console.log("Calendar onClose called");
                                              setOpenDate(false);
                                            }}
                                            isDropdown={true}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    {/* Guests Field */}
                  
<div className="search-field guests-field" style={{ position: 'relative' }}>
  <div 
    className="field-header"
    onClick={() => setShowGuestSelector(!showGuestSelector)}
    style={{ cursor: 'pointer' }}
  >
    <i className="fa fa-users field-icon"></i>
    <label className="field-label">Guests & Rooms</label>
  </div>
  <div 
    className="field-value"
    onClick={() => setShowGuestSelector(!showGuestSelector)}
    style={{ cursor: 'pointer' }}
  >
    {paxRoomDetails.totalAdults} adult{paxRoomDetails.totalAdults !== 1 ? 's' : ''} · {paxRoomDetails.totalChildren} children · {paxRoomDetails.totalRooms} room{paxRoomDetails.totalRooms !== 1 ? 's' : ''}
  </div>
  
  {/* Guest Selector Dropdown */}
  {showGuestSelector && (
    <div 
      className="guest-selector-dropdown"
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        zIndex: 1000,
        marginTop: '8px'
      }}
    >
      <RoomAllocation 
        handleRoomAllocation={(data) => {
          handleRoomAllocation(data);
          setShowGuestSelector(false);
        }}
        handleTogle={() => setShowGuestSelector(false)}
        preData={searchRoomData}
        isInline={true}
      />
    </div>
  )}
</div>
                                  </div>

                                  {/* Search Button */}
                                  <div className="search-button-section">
                                    <button
                                      className="classy-search-btn"
                                      onClick={() => getHotelData(hotelSearchCustomerData)}
                                    >
                                      <i className="fa fa-search"></i>
                                      <span className="search-btn-text">Search</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <ul className="product-filter-tags p-0 m-0 my-2">
                            {
                              pricefilter &&
                              <li>
                                <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close" onClick={() => handleRemovePriceFilters()}></i> </a>
                              </li>
                            }
                            {
                              selectedLocations.map((value, i) => (
                                <li key={i}>
                                  <a href={null} className="filter_tag">{value}<i className="fa fa-close" onClick={() => handleLocationchange(value)}></i>
                                  </a>
                                </li>
                              ))
                            }
                            {
                              selectedCategory.map((value, i) => (
                                <li key={i}>
                                  <a href={null} className="filter_tag">{value} star<i className="fa fa-close" onClick={() => handleCategoryChange(value)}></i>
                                  </a>
                                </li>
                              ))
                            }
                            {
                              (pricefilter || selectedLocations.length > 0 || selectedCategory.length > 0) &&
                              <li onClick={() => handleClearAllFilters()}>
                                <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
                              </li>
                            }
                          </ul>

                          <Row>
                            {
                              loading ?
                                <div className="row mx-0 mt-2 margin-default">
                                  <div className="col-xl-3 col-lg-4 col-6">
                                    <PostLoader />
                                  </div>
                                  <div className="col-xl-3 col-lg-4 col-6">
                                    <PostLoader />
                                  </div>
                                  <div className="col-xl-3 col-lg-4 col-6">
                                    <PostLoader />
                                  </div>
                                  <div className="col-xl-3 col-lg-4 col-6">
                                    <PostLoader />
                                  </div>
                                </div> :
                                !loading && !hotelMainLoading && filteredMainDataset?.length === 0 ?
                                  <Col xs="12">
                                    <div className="my-3">
                                      <div className="col-sm-12 empty-cart-cls text-center">
                                        <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-3 mx-auto" />
                                        <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">Sorry, there are no products available right now.</h4>
                                        <h4 style={{ fontSize: 15 }}>Please check back later or explore other options.</h4>
                                      </div>
                                    </div>
                                  </Col>
                                  :
                                  filteredMainDataset?.map((product, i) => (
                                    <div className={grid} key={i}>
                                      <ProductItems product={product} description={product?.HotelDescription} hotelCode={product?.HotelCode} latitude={product?.Latitude} longitude={product?.Longitude} hotelAddress={product?.HotelAddress} provider={product?.provider} productImage={product?.HotelPicture} productstype={'hotels'} title={product?.HotelName} productcurrency={product?.Currency} mrp={product?.TotalRate} rate={product?.SupplierPrice} rating={product?.StarRating} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} hotelSearchCustomerData={hotelSearchCustomerData} childAges={childAges} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} />
                                    </div>
                                  ))
                            }
                            {/* Recent Searches Modal */}

                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
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

  /* Classy Hotel Search Container */
  .classy-search-container {
    margin: 32px 0;
    animation: slideInFromTop 0.6s ease-out;
    width: 100%;
  }
  
  .search-card {
    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
    border: none;
    border-radius: 20px;
    box-shadow: 
      0 20px 40px -12px rgba(0, 0, 0, 0.06),
      0 8px 16px -6px rgba(0, 0, 0, 0.02);
    overflow: hidden;
    transition: all 0.4s ease;
    position: relative;
    width: 100%;
  }
  
  .search-card:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.08),
      0 10px 20px -6px rgba(0, 0, 0, 0.03);
  }
  
  .search-header {
    text-align: center;
    padding: 28px 32px 20px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(147, 51, 234, 0.02) 100%);
  }
  
  .search-title {
    font-size: 28px;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 8px 0;
    letter-spacing: -0.025em;
    background: linear-gradient(135deg, #1e293b 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .search-subtitle {
    font-size: 16px;
    color: #64748b;
    margin: 0;
    font-weight: 400;
    letter-spacing: 0.01em;
  }
  
  .search-form {
    // padding: 24px;
    display: flex;
    align-items: center;
    justify-content: stretch;
  }
  
  .search-row {
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: none;
    border-radius: 16px;
    padding: 8px;
    transition: all 0.3s ease;
    box-shadow: 
      0 8px 25px -5px rgba(0, 0, 0, 0.06),
      0 4px 10px -3px rgba(0, 0, 0, 0.03);
    width: 100%;
    flex: 1;
  }
  
  .search-row:hover {
    box-shadow: 
      0 12px 30px -5px rgba(0, 0, 0, 0.08),
      0 6px 15px -3px rgba(0, 0, 0, 0.04);
  }
  
  .filter-section {
    flex-shrink: 0;
  }
  
  .classy-filter-btn {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: none;
    border-radius: 12px;
    padding: 0 20px;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    height: 64px;
    min-width: 120px;
    position: relative;
    overflow: hidden;
  }
  
  .classy-filter-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  .classy-filter-btn:hover::before {
    left: 100%;
  }
  
  .classy-filter-btn:hover {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 8px 20px -5px rgba(59, 130, 246, 0.4);
  }
  
  .filter-text {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.025em;
  }
  
  .search-fields {
    flex: 1;
    display: flex;
    background: #fafbfc;
    border: none;
    border-radius: 12px;
    overflow: hidden;
    height: 64px;
  }
  
  .search-field {
    flex: 1;
    padding: 11px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 64px;
  }
  
  .search-field:not(:last-child) {
    border-right: 1px solid #e2e8f0;
  }
  
  .search-field:hover {
    background: white;
  }
  
  .search-field.location-field:hover {
    background: rgba(59, 130, 246, 0.03);
  }
  
  .field-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  
  .field-icon {
    color: #3b82f6;
    font-size: 16px;
    width: 16px;
    text-align: center;
  }
  
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }
  
  .field-input-wrapper {
    margin-top: -6px;
  }
  
  .field-value {
    font-size: 15px;
    font-weight: 500;
    color: #1e293b;
    line-height: 1.4;
    margin-top: 2px;
  }
  
  .search-button-section {
    flex-shrink: 0;
  }
  
  .classy-search-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    border-radius: 12px;
    padding: 0 24px;
    color: white;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 64px;
    min-width: 120px;
    font-size: 15px;
    letter-spacing: 0.025em;
    position: relative;
    overflow: hidden;
  }
  
  .classy-search-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  .classy-search-btn:hover::before {
    left: 100%;
  }
  
  .classy-search-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 
      0 12px 20px -5px rgba(59, 130, 246, 0.4),
      0 6px 10px -3px rgba(59, 130, 246, 0.2);
  }
  
  .search-btn-text {
    font-size: 15px;
    font-weight: 700;
  }
  
  /* Mobile Responsive */
  @media (max-width: 1199px) {
    .search-row {
      flex-direction: column;
      gap: 12px;
    }
    
    .search-fields {
      flex-direction: column;
    }
    
    .search-field:not(:last-child) {
      border-right: none;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .search-fields {
      height: auto;
    }
    
    .search-field {
      height: 56px;
      padding: 12px 16px;
    }
    
    .classy-filter-btn,
    .classy-search-btn {
      width: 100%;
      min-width: auto;
      height: 56px;
    }
  }
  
  @media (max-width: 768px) {
    .classy-search-container {
      margin: 20px 0;
    }
    
    .search-card {
      margin: 0 -15px;
      border-radius: 0;
      border-left: none;
      border-right: none;
    }
    
    .search-header {
      padding: 20px 24px 16px;
    }
    
    .search-title {
      font-size: 24px;
    }
    
    .search-subtitle {
      font-size: 14px;
    }
    
    .search-form {
      padding: 20px;
    }
    
    .search-row {
      padding: 6px;
      gap: 8px;
    }
    
    .search-field {
      padding: 12px 16px;
      height: 52px;
    }
    
    .search-fields {
      height: auto;
    }
    
    .classy-filter-btn,
    .classy-search-btn {
      height: 52px;
      padding: 0 20px;
    }
    
    .filter-text,
    .search-btn-text {
      font-size: 14px;
    }
    
    .field-value {
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    .search-header {
      padding: 16px 20px 12px;
    }
    
    .search-title {
      font-size: 20px;
    }
    
    .search-subtitle {
      font-size: 13px;
    }
    
    .search-form {
      padding: 12px 20px 20px;
    }
    
    .search-field {
      padding: 10px 14px;
      height: 48px;
    }
    
    .classy-filter-btn,
    .classy-search-btn {
      height: 48px;
      min-width: 100px;
    }
  }

  .hotel-sidebar-filters-sub {
    margin-bottom: 1.5rem;
  }
  .collapse-block-title-hotel {
    color: #333;
    margin-bottom: 1rem;
    font-size: 16px;
  }
  .location-input-wrapper {
    position: relative;
  }
  .location-input-wrapper .city-selection-message {
    animation: fadeIn 0.3s ease-in;
  }
  .conditional-sections {
    animation: slideInFromTop 0.4s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideInFromTop {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .date-selection-wrapper {
    margin-top: 0.5rem;
  }
  .hotel-sidebar-filters:hover {
    border-color: #007bff !important;
    // background-color: #f0f8ff !important;
  }
  .room-pax-info {
    font-size: 14px;
  }
  .action-buttons-wrapper {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
  }
  .btn-primary {
    background: linear-gradient(135deg, #fd3943ff 0%, #fd3943ff 100%);
    border: none;
    transition: all 0.3s ease;
  }
  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
  .btn-outline-primary {
    border-color: #fd3943ff;
    color: #fd3943ff;
    transition: all 0.3s ease;
  }
  .btn-outline-primary:hover {
    background-color: #fd3943ff;
    border-color: #fd3943ff;
    color: white;
  }
  .btn-outline-secondary {
    transition: all 0.3s ease;
  }
  .btn-outline-secondary:hover {
    transform: translateY(-1px);
  }
  @media (max-width: 768px) {
    .hotel-sidebar-filters {
      flex-direction: column !important;
      gap: 1rem;
    }
    .hotel-sidebar-filters .d-flex {
      flex-direction: column;
      text-align: center;
    }
  }
        .date-field-dropdown {
      position: relative;
      cursor: pointer;
    }
    .date-field {
  position: relative;
  overflow: visible !important;
  z-index: 20;
}

.calendar-dropdown-wrapper {
  position: absolute;
  top: 110%;
  left: 0;
  z-index: 99999 !important;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .calendar-dropdown-wrapper::before {
      content: '';
      position: absolute;
      top: -8px;
      left: 20px;
      width: 16px;
      height: 16px;
      background: white;
      border-left: 1px solid #e5e7eb;
      border-top: 1px solid #e5e7eb;
      transform: rotate(45deg);
    }
      .search-card,
.search-form,
.search-row,
.search-fields,
.classy-search-container {
  overflow: visible !important;
  position: relative;
  z-index: 10;
}
.recent-searches-icon {
  position: relative;
}

/* Add to your existing CSS */
.field-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-label {
  flex: 1;
}
  
        `}
          </style>
        </section>
      </CommonLayout>

    </>
  )
}

export default HotelsMainPage
