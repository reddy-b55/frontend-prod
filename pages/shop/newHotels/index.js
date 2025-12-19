import moment from 'moment';
import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
import { DateRange } from 'react-date-range';
import Select from 'react-select';
import CustomCalendar from '../../../components/calender/CustomCalendar';

import { LoadScript } from '@react-google-maps/api';
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

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

  const {userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

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
    { value: 5, label: '5 star' }
  ];

  const [loading, setLoading] = useState(true);
  const [hotelCategory, setHotelCategory] = useState(true);

  const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

  const [hotelMainDataset, setHotelMainDataset] = useState([]);
  const [filteredMainDataset, setFilteredMainDataset] = useState([]);

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
    dataSet: JSON.stringify({locationDataSet}),
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

  const [date, setDate] = useState([{
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  }]);
  let baseLocationData;
  useEffect(() => {
    // Initialize with default location
    baseLocationData = {
      latitude: '6.9271',
      longitude: '79.8612',
      locationDescription: 'Colombo, Sri lanka'
    };

    // Check if cookies exist in browser
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

    setLocationDataSet(baseLocationData);
    setLocationDataSetReset(baseLocationData)
    
    // Update hotel search data with the location
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
        // Load first set of hotels (index 1)
        const initialResult = await loadHotelsData(searchParams, customerId);
        console.log("Initial result", initialResult);
        const metaDiscount = initialResult?.hotelMetaDiscount || [];
        setMetaDiscountHotel(metaDiscount)
        const totalHotels = initialResult?.totalHotels || 0;
        const allHotels = [...(initialResult?.hoteldataset || [])];
        // Update state with first batch
        setContent(allHotels);
        updateData(allHotels);
        console.log(`Total hotels found`, initialResult);
        // Get updated hotel data with sequential loading
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
 
    // Load first batch (index 1)
    const initialResult = await loadHotelsData(searchParams, customerId);
 
    const totalHotels = initialResult?.totalHotels || 0;
    const allHotels = [...(initialResult?.hoteldataset || [])];
    const max_request_count = initialResult?.max_request_count || 1;
 
    console.log(`Total hotels found: ${totalHotels}`);
    console.log(`Max request count: ${max_request_count}`);
 
    // Update state with first batch
    setContent(allHotels);
    updateData(allHotels);
 
    // Sequential loading for remaining batches (index 2 to max_request_count)
    if (max_request_count > 1) {
      for (let index = 2; index <= max_request_count; index++) {
        try {
          console.log(`Loading hotels for index: 234234234234`,index);
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
  const handleCategoryChange = (value) => { handleOnChange(value, selectedCategory, setSelectedCategory, 'StarRating') }

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
  
  // Update user min/max price to match selected range
  setUserMinMaxPrice({
    min: value.start,
    max: value.end
  });
};

  const handleSearchPriceRange = () => {
    if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
      ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
    } else {
      setminprice(userMinMaxPrice.min);
      setmaxprice(userMinMaxPrice.max);
    }
  }

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
}, [baseCurrencyValue]);

  const getHotelData = async (data) => {
    console.log("Hotel data isss", data)
     setLoading(true);
     
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
         setLoading(false);
        // console.log(`Total hotels found`, initialResult);

        await  getHotelDataUpdateData(data, userId || "AHS_Guest").then((response) => {
      if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
        updateData([]);
        setLoading(false);
      } else {
        updateData(response || []);
        setContent(response || []);
        setLoading(false);
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

 const getFilteredProducts = (filters, dynamicValue, dataset) => {
  let filtered = [];
  
  if (filters.length === 0) {
    return getPricefilters(dataset);
  } else {
    // Use Set to track unique hotel codes to prevent duplicates
    const addedHotels = new Set();
    
    filterCheckboxes.forEach((filterItem) => {
      dataset.forEach((data) => {
        try {
          let shouldInclude = false;
          
          if (dynamicValue === 'City') {
            shouldInclude = data?.[dynamicValue]?.trim().toLowerCase() === filterItem.value.trim().toLowerCase();
          } else {
            shouldInclude = data?.[dynamicValue] == filterItem?.value;
          }
          
          // Only add if it matches the filter and hasn't been added yet
          if (shouldInclude && !addedHotels.has(data.HotelCode)) {
            filtered.push(data);
            addedHotels.add(data.HotelCode);
          }
        } catch (error) {
          console.error('Error in filtering:', error);
        }
      });
    });
  }
  
  let remainingFilters = filters.slice(1);
  return getFilteredProducts(remainingFilters, remainingFilters[0], filtered);
};


const getPricefilters = (dataset) => {
  // Remove duplicates first using HotelCode as unique identifier
  const uniqueDataset = dataset.filter((item, index, self) => 
    index === self.findIndex(hotel => hotel.HotelCode === item.HotelCode)
  );

  console.log(minprice, "Min price data");
  
  // Ensure we have valid price range
  if (minprice === '' || maxprice === '' || !baseCurrencyValue) {
    return uniqueDataset;
  }

  // Filter by price range
  let result = uniqueDataset.filter((value) => {
    let price = CurrencyConverterOnlyRateWithoutDecimal(value.Currency, value.TotalRate, baseCurrencyValue);
    return Number(minprice) <= Number(price) && Number(price) <= Number(maxprice);
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

  const handleOnGoogleLocationChange = (value) => {
    setIsFocused(false)
    setGoogleLocation(value['label'].slice(0, 25) + '...')
    geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
      geocodeByLatLng({ lat: lat, lng: lng }).then(results => {
        console.log("Google location data", results)
        for (var i = 0; i < results[0].address_components.length; i++) {
          for (var b = 0; b < results[0].address_components[i].types.length; b++) {
            if ((results[0].address_components[i].types.includes("locality") || results[0].address_components[i].types.includes("locality"))) {
              setHotelSearchCustomerData({
                ...hotelSearchCustomerData,
                City: results[0].address_components[i].short_name,
                Country: results[0].address_components[i].long_name,
                dataSet: JSON.stringify({
                  latitude: lat, longitude: lng,
                  locationDescription: results[0].address_components[i].long_name,
                  ...results[0],
                })
              })
              break;
            }
          }
        }
      }).catch((error) => {
        // console.error(error)
      }
      );
    }).catch((error) => {
      // console.error(error);
    })
  }

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

  const handleRoomCount = (e) => {
    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      NoOfRooms: e.value
    });
  }

  const handleStarRate = (e) => {
    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      StarRate: e.value
    });
  }

useEffect(() => {
  if (!loading && baseCurrencyValue) {
    startFiltering();
  }
}, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue]);

  // useEffect(() => {
  //   var hotelSearchData = hotelSearchCustomerData;
  //   hotelSearchData["City"] = baseLocation?.address_full;
  // }, [baseLocation]);

  // useEffect(() => {
  //   setGoogleLocation(baseLocation?.address_full.slice(0, 25).concat(' ...'));
  // }, [baseLocation?.address_full])

  const handleClearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedLocations([]);
    setFilteredMainDataset(hotelMainDataset);
    clearPriceFilter();
  }

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
  setFilteringValue([]);
};

  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [searchFilter, setSearchfilter] = useState(false);

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  }

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  }

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

  useEffect(() => {

    const discountData = [];
        content.forEach(item => {
            if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
            discountData.push({
               discount : item.discount,
               product : item
            });
            }
        });

    console.log("Discount data", discountData)

        setAllDiscountData(discountData);
        

    setLoading(false);
    updateData(content);
  }, [content]);

  const handleClearHotelSearch = async()=>{
    // console.log('reset data', baseLocation)
    const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
    const checkout = moment().add(8, 'days').format('DD/MM/YYYY');

     setHotelSearchCustomerData({
      CheckInDate: checkIn,
      CheckOutDate: checkout,
      NoOfNights: 1,
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      City: baseLocation?.address_full,
      dataSet: JSON.stringify({locationDataSetReset}),
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
    })

    setLoading(true);

    const customerId = userId ?? "AHS_Guest";

    // const searchParams = {
    //     ...hotelSearchCustomerData,
    //     Country: hotelSearchCustomerData.City,
    //     offset: 0,
    //     length: 100,
    // };

    const searchParams = {
      CheckInDate: checkIn,
      CheckOutDate: checkout,
      NoOfNights: 1,
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      City: baseLocation?.address_full,
      dataSet: JSON.stringify({locationDataSetReset}),
      Country: baseLocation?.address_full,
      latitude: baseLocation?.latitude,
      longitude: baseLocation?.longitude,
      StarRate: 0,
      offset: 0,
      length: 100,
      RoomRequest: [{
        indexValue: 0,
        roomType: "Single",
        NoOfAdults: 1,
        NoOfChild: 0,
        ChildAge: []
      }]
    }


    // console.log("Initial result1111",searchParams)
    const initialResult = await loadHotelsData(searchParams, customerId);
    // console.log("Initial result", initialResult)
    const allHotels = [...(initialResult?.hoteldataset || [])];
    setContent(allHotels);
    updateData(allHotels);
    setLoading(false);
    setGoogleLocation(baseLocation?.address_full)
    await  getHotelDataUpdateData(searchParams, userId).then((response) => {
      if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
        updateData([]);
        setLoading(false);
      } else {
        updateData(response || []);
        setContent(response || []);
        setLoading(false);
      }
    })
  }

  const handleDateSelect = (start, end) => {
  //   console.log("Selected date isssss 123", [{
  //   startDate: start.toISOString(),
  //   endDate: end.toISOString(),
  //   key: "selection"
  // }]);
  console.log("Selected date isssss", start, end);

     setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      CheckInDate: start === null ? moment().add(7, 'days').format('DD/MM/YYYY') : moment(start).format('DD/MM/YYYY'),
      CheckOutDate: end === null ? moment().add(8, 'days').format('DD/MM/YYYY') : moment(end).format('DD/MM/YYYY'),
    });
    setDate([{
    startDate: start === null? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : start.toISOString(),
    endDate: end === null? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() : end.toISOString(),
    key: "selection"
  }]);


  }

  const customStyles = `
  .rdrYearPicker,
  .rdrMonthAndYearWrapper .rdrMonthAndYearPickers .rdrYearPicker {
    display: none !important;
  }
`;
const [isFocused, setIsFocused] = useState(false);


const handleRoomAllocation = (data) => {
  console.log("Room allocation data", data);

    setHotelSearchCustomerData({
      ...hotelSearchCustomerData,
      NoOfAdults: data?.roomDetails?.adults ||1,
      NoOfChild: data?.roomDetails?.children ,
    })
    setPaxRoomDetails({...paxRoomDetails,
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

      <CommonLayout title="hotel" parent="home" showMenuIcon={true} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}>
        <section className="section-b-space ratio_asos mt-lg-5">
          <div className="collection-wrapper">
            <Container>
              <Row>

                    <Col
             sm="3"
             className="collection-filter yellow-scrollbar"
             id="filter"
             style={{
                display: screenWidth < 1024 
    ? (openSideBarStatus ? "block" : "none")  // Mobile: show only when sidebar is open
    : "block",
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
                   <div className="collection-collapse-block">
  {/* Location Section */}
<div className="collection-collapse-block hotel-sidebar-filters-sub">
<h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
<i className="fa fa-map-marker me-2"></i>Location
</h5>
<div className="location-input-wrapper">
<GooglePlacesAutocomplete 
        apiKey={groupApiCode} 
        selectProps={{ 
          value: googleLocation,
          placeholder: isFocused ? "" : googleLocation === 'search' ? 'Search for a location...' : googleLocation,
          onChange: (e) => handleOnGoogleLocationChange(e), 
          onClick: (e) => {
            setIsFocused(true);
          },
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
          styles: {
            control: (provided) => ({
              ...provided,
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              boxShadow: 'none',
              '&:hover': {
                border: '1px solid #007bff'
              }
            }),
            placeholder: (provided) => ({
              ...provided,
              color: '#6c757d'
            })
          }
        }} 
      />
</div>
</div>
 
  {/* Check-In / Check-Out Section */}
<div className="collection-collapse-block hotel-sidebar-filters-sub">
<h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
<i className="fa fa-calendar me-2"></i>Check-In / Check-Out
</h5>
<div className="date-selection-wrapper">
<div className='hotel-sidebar-filters d-flex align-items-center justify-content-between p-3 border rounded' 
           style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }} 
           onClick={() => setOpenDate(!openDate)}>
<div className="d-flex align-items-center">
<div className="text-center me-3">
<small className="text-muted d-block">Check-in</small>
<small>{hotelSearchCustomerData.CheckInDate}</small>
</div>
<div className="mx-2">
<i className="fa fa-arrow-right text-primary"></i>
</div>
<div className="text-center">
<small className="text-muted d-block">Check-out</small>
<small>{hotelSearchCustomerData.CheckOutDate}</small>
</div>
</div>
{/* <i className="fa fa-chevron-down text-muted"></i> */}
</div>
</div>
</div>
 
  {/* Room and Pax Section */}
<div className="collection-collapse-block hotel-sidebar-filters-sub">
<h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
<i className="fa fa-users me-2"></i>Rooms & Guests
</h5>
<div className="room-pax-info mb-3">
<div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
<div>
<small className="text-muted d-block">Rooms</small>
<strong>{paxRoomDetails.totalRooms}</strong>
</div>
<div>
<small className="text-muted d-block">Adults</small>
<strong>{paxRoomDetails.totalAdults}</strong>
</div>
<div>
<small className="text-muted d-block">Children</small>
<strong>{paxRoomDetails.totalChildren}</strong>
</div>
</div>
</div>
<button 
      className='btn btn-outline-primary btn-sm w-100' 
      onClick={() => {setOpenRoomModel(true)}}
>
<i className="fa fa-edit me-2"></i>Edit Selection
</button>
</div>
 
  {/* Action Buttons */}
<div className="action-buttons-wrapper mt-4">
<button 
      className='btn btn-primary btn-sm w-100 mb-3' 
      onClick={() => getHotelData(hotelSearchCustomerData)}
      style={{ 
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        // borderRadius: '8px'
      }}
>
<i className="fa fa-search me-2"></i>Search Hotels
</button>
<button 
      className='btn btn-outline-secondary btn-sm w-100' 
      onClick={() => handleClearHotelSearch(hotelSearchCustomerData)}
      style={{ 
        padding: '10px 16px',
        fontSize: '14px',
        // borderRadius: '8px'
      }}
>
<i className="fa fa-refresh me-2"></i>Reset Search
</button>
</div>
</div>
                    
                    






                    

                  </div>

                  <div className="collection-filter-block px-lg-4 pe-5">

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
                      <RoomAllocation handleRoomAllocation={handleRoomAllocation} handleTogle={handleTogle} />
                    </ModalBase>


                    {/* <PaxIncrementorComponent
            open={showCountBox}
            toggle={() => setshowCountBox(false)}
            adultCount={parseInt(customerDetails.adultCount)}
            childCount={parseInt(customerDetails.childCount)}
            childAgesDynamic={customerDetails.childAges}
            adultChildMinMax={adultChildMinMax}
            addPaxPaxIncrement={handleValidateAdultChildCount}
            paxLimitations={paxLimitations}
          ></PaxIncrementorComponent> */}

                    <ModalBase isOpen={openDate} title={'Select Date '} toggle={() => { setOpenDate(!openDate)}} size="l">
                      <div style={{ width: '100%', height: '100%' }} className="d-flex justify-content-center align-items-center flex-column">
                    {/* <DateRange editableDateInputs={true} onChange={(item) => handleOnDatePicker([item.selection])} moveRangeOnFirstSelection={false} className="htl_dateRange" ranges={date} 
                    yearRange={[currentYear, currentYear + 10]} // Current year to 10 years ahead
                    minDate={new Date()}/> */}
                    <>
  <style>{customStyles}</style>

  {/* <DateRange 
    editableDateInputs={true} 
    onChange={(item) => handleOnDatePicker([item.selection])} 
    moveRangeOnFirstSelection={false} 
    className="htl_dateRange" 
    ranges={date} 
    minDate={new Date()} 
  /> */}
  <CustomCalendar  handleDateSelect={handleDateSelect} selectedDate={date}/>
  
</>

                      </div>
                       
                      {/* <PaxIncrementorComponent open={openAdultChildModal} adultCount={hotelSearchCustomerData.NoOfAdults} toggle={() => { setOpenAdultChildModal(false) }} childCount={hotelSearchCustomerData.NoOfChild} adultChildMinMax={adultChildMinMax} addPaxPaxIncrement={handleValidateAdultChildCount} ></PaxIncrementorComponent> */}
                    </ModalBase>

                    <div className="collection-collapse-block">

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
      <h6 className="m-0 p-0" htmlFor={value}>
        {baseCurrencyValue ? 
          `${CurrencyConverter(baseCurrencyValue.base, value.start, baseCurrencyValue)} - ${CurrencyConverter(baseCurrencyValue.base, value.end, baseCurrencyValue)}` :
          `${value.start} - ${value.end}`
        }
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
                                  <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Min" value={userMinMaxPrice.min} min={pricerange[0]} max={pricerange[1]} name="min" onChange={(e) => handleMinMaxPrice(e)} />
                                </div>
                                <div className="d-flex flex-column align-itmes-end col-4">
                                  <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
                                  <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Max" value={userMinMaxPrice.max} max={pricerange[1]} min={pricerange[0]} name="max" onChange={(e) => handleMinMaxPrice(e)} />
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
                                      <h6 className="m-0 p-0" htmlFor={value.label}>{value.label}</h6>
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

                <Col className="collection-content" sm='12' md='12' lg="9">
                  <div className="page-main-content">
                    <Row>
                      <Col sm="12">

                        <div className="d-none d-lg-block d-md-block top-banner-wrapper">
                          <a href={null}>
                            <Media src={Menu2.src} className="img-fluid blur-up lazyload" alt="" />
                          </a>
                        </div>

                        <div className="collection-product-wrapper mt-0 mt-lg-4">

                          <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">

                            <h5 className="p-0 m-0 d-none d-lg-block" style={{ fontSize: '15px', fontWeight: '500' }}>{!loading ? `Showing ${filteredMainDataset.length} Products` : "loading"}{" "}</h5>

                            {
                              searchFilter ?
                                <div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
                                  <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
                                  {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
                                </div>
                                :
                                <div className="collection-brand-filter align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 d-none d-lg-flex d-md-flex border" style={{ borderRadius: "10px!important" }}>
                                  <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
                                  {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
                                </div>
                            }


                            <div className="col-3 d-none d-lg-block">
                              <Select  styles={{
      menu: (provided) => ({
        ...provided,
        zIndex: 1100, // Ensures dropdown appears on top
        position: "absolute",
      }),
    }} options={options} onChange={handleSelectChange} />
                            </div>

                          </div>

                        {(allDiscountData.length > 0 || metaDiscountHotel.length > 0) && (
  <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
    <ProductSlider allDiscountData={allDiscountData} type={"hotel"} meta={metaDiscountHotel} />
  </div>
)}

                                                    

                          <ul className="product-filter-tags p-0 m-0 my-2">
                            {
                              pricefilter &&
                              <li>
                                <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa-regular fa-circle-xmark ml-2"></i> </a>
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
                                <div className="row mx-0 mt-4 margin-default mt-4">
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
                                !loading && filteredMainDataset?.length === 0 ?
                                  <Col xs="12">
                                    <div className="my-5">
                                      <div className="col-sm-12 empty-cart-cls text-center">
                                      <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-4 mx-auto" />
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
  .date-selection-wrapper {
    margin-top: 0.5rem;
  }
  .hotel-sidebar-filters:hover {
    border-color: #007bff !important;
    background-color: #f0f8ff !important;
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
  
        `}
      </style>
        </section>
      </CommonLayout>

    </>
  )
}

export default HotelsMainPage





// import moment from 'moment';
// import Head from 'next/head';
// import { useContext, useEffect, useState } from 'react';
// import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
// import { DateRange } from 'react-date-range';
// import Select from 'react-select';
// import CustomCalendar from '../../../components/calender/CustomCalendar';

// import { LoadScript } from '@react-google-maps/api';
// import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// import { AppContext } from '../../_app';
// import { getHotelDataUpdated, loadHotelsData } from '../../../AxiosCalls/HotelServices/hotelServices';

// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import PaxIncrementorComponent from '../../../components/common/PaxIncrementor/PaxIncrementorComponent';
// import ModalBase from '../../../components/common/Modals/ModalBase';
// import ToastMessage from '../../../components/Notification/ToastMessage';

// import PostLoader from '../../skeleton/PostLoader';

// import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/hotelBanner.jpg";

// import SearchIcon from '@mui/icons-material/Search';
// import CloseIcon from '@mui/icons-material/Close';

// import 'react-calendar/dist/Calendar.css';
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
// import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';

// import cookie from 'cookie';
// import { useRouter } from 'next/router';
// import ProductSlider from '../productImageSlider';
// import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
// import RoomAllocation from '../../../components/hotel/RoomAllocation';


// // export async function getServerSideProps(context) {

// //   const { req } = context;
// //   // console.log("context issss klo", req)

// //   let baseLocation = {
// //     latitude: '6.9271',
// //     longtitude: '79.8612',
// //     address_full: 'Colombo, Sri lanka'
// //   };

// //   if (req.headers.cookie) {
// //     const cookies = cookie.parse(req.headers.cookie);
// //     try {
// //       // baseLocation = JSON.parse(cookies.userLastLocation);
// //       const userLastLocation = JSON.parse(cookies.userLastLocation);

// //       baseLocation = {
// //         latitude: userLastLocation.latitude.toString(),
// //         longitude: userLastLocation.longtitude.toString(),
// //         locationDescription: userLastLocation.address_full,
// //         address_components: userLastLocation.address_components
// //       };
// //     } catch (error) {
// //       // console.error('Failed to parse userLastLocation cookie:', error);
// //     }
// //   }

// //   const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
// //   const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

// //   let hotelSearchCustomerData = {
// //     CheckInDate: nextWeekDate,
// //     CheckOutDate: nextWeekDateCheckout,
// //     NoOfNights: 1,
// //     NoOfRooms: 1,
// //     NoOfAdults: 1,
// //     NoOfChild: 0,
// //     // City: 'Colombo',
// //     // City: baseLocation?.address_full,
// //     City: baseLocation?.locationDescription,
// //     dataSet:JSON.stringify({baseLocation}),
// //     // Country: "LK",
// //     Country: baseLocation?.locationDescription,
// //     StarRate: 0,
// //     offset: 0,
// //     length: 100,
// //     RoomRequest: [{
// //       indexValue: 0,
// //       roomType: "Single",
// //       NoOfAdults: 1,
// //       NoOfChild: 0,
// //       ChildAge: []
// //     }]
// //   };

// //   console.log("Hotel search data", hotelSearchCustomerData)

// //   let response = [];

// //   await getHotelDataUpdated(hotelSearchCustomerData,624).then((res) => {
// //     response = res
// //   });



// //   return {
// //     props: {
// //       content: response|| [],
// //       locationDataSet: baseLocation
// //     },
// //   };

// // }

// const HotelsMainPage = () => {
//   const [locationDataSet, setLocationDataSet] = useState(null);
//   const [locationDataSetReset, setLocationDataSetReset] = useState(null);
// const [content, setContent] = useState([]);
//   const router = useRouter();

//   let checkinDate = new Date();;
//   let checkOutDate = new Date();
//   checkOutDate.setDate(checkinDate.getDate() + 1);

//   const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
//   const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

//   const {userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

//   const adultChildMinMax = {
//     minAdult: 50,
//     maxAdult: 50,
//     minChild: 50,
//     maxChild: 50,
//     adultAvl: true,
//     childAvl: true
//   }

//   const roomCounts = [
//     { value: 1, label: '1' },
//     { value: 2, label: '2' },
//     { value: 3, label: '3' },
//     { value: 4, label: '4' },
//     { value: 5, label: '5' },
//     { value: 6, label: '6' },
//     { value: 7, label: '7' },
//     { value: 8, label: '8' },
//     { value: 9, label: '9' },
//     { value: 10, label: '10' }
//   ];

//   const roomCategory = [
//     { value: 1, label: '1 Star' },
//     { value: 2, label: '2 star' },
//     { value: 3, label: '3 star' },
//     { value: 4, label: '4 star' },
//     { value: 5, label: '5 star' }
//   ];

//   const [loading, setLoading] = useState(true);
//   const [hotelCategory, setHotelCategory] = useState(true);

//   const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

//   const [hotelMainDataset, setHotelMainDataset] = useState([]);
//   const [filteredMainDataset, setFilteredMainDataset] = useState([]);

//   const [selectedLocations, setSelectedLocations] = useState([])
//   const [selectedCategory, setSelectedCategory] = useState([])
//   const [filterCheckboxes, setFilterCheckboxes] = useState([]);
//   const [filteringValue, setFilteringValue] = useState([]);

//   const [userSearchQuery, setUserSearchQuery] = useState("");
//   const [hotelLocations, setHotelLocations] = useState([]);
//   const [googleLocation, setGoogleLocation] = useState("search");
//   const [childAges, setChildAges] = useState([]);
//   const [openAdultChildModal, setOpenAdultChildModal] = useState(false);
//   const [openDate, setOpenDate] = useState(false);
//   const [locationfilterOpen, setlocationfilterOpen] = useState(true);
//   const [allDiscountData, setAllDiscountData] = useState([])
//   const [openRoomModel, setOpenRoomModel] = useState(false)

//   const [hotelSearchCustomerData, setHotelSearchCustomerData] = useState({
//     CheckInDate: nextWeekDate,
//     CheckOutDate: nextWeekDateCheckout,
//     NoOfNights: 1,
//     NoOfRooms: 1,
//     NoOfAdults: 1,
//     NoOfChild: 0,
//     City: baseLocation?.address_full,
//     dataSet: JSON.stringify({locationDataSet}),
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

//   const [date, setDate] = useState([{
//     startDate: new Date(),
//     endDate: new Date(),
//     key: "selection",
//   }]);
//   let baseLocationData;
//   useEffect(() => {
//     // Initialize with default location
//     baseLocationData = {
//       latitude: '6.9271',
//       longitude: '79.8612',
//       locationDescription: 'Colombo, Sri lanka'
//     };

//     // Check if cookies exist in browser
//     try {
//       if (typeof document !== 'undefined') {
//         const cookies = document.cookie;
//         if (cookies.includes('userLastLocation')) {
//           const cookieValue = decodeURIComponent(
//             cookies.split('; ').find(row => row.startsWith('userLastLocation='))?.split('=')[1] || ''
//           );
//           if (cookieValue) {
//             const userLastLocation = JSON.parse(cookieValue);
//             baseLocationData = {
//               latitude: userLastLocation.latitude.toString(),
//               longitude: userLastLocation.longtitude.toString(),
//               locationDescription: userLastLocation.address_full,
//               address_components: userLastLocation.address_components
//             };
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Failed to parse userLastLocation cookie:', error);
//     }

//     setLocationDataSet(baseLocationData);
//     setLocationDataSetReset(baseLocationData)
    
//     // Update hotel search data with the location
//     setHotelSearchCustomerData(prev => ({
//       ...prev,
//       City: baseLocationData.locationDescription,
//       Country: baseLocationData.locationDescription,
//       dataSet: JSON.stringify(baseLocationData)
//     }));
    
//     // setGoogleLocation(baseLocationData.locationDescription?.slice(0, 25).concat(' ...'));
//   }, []);

//   // useEffect(() => {

//   //   if (locationDataSet) {
//   //     const initialSearch = async () => {
//   //       setLoading(true);
          
//   //       try {
//   //         const customerId = userId ?? 624;

//   //         const searchParams = {
//   //             ...hotelSearchCustomerData,
//   //             Country: hotelSearchCustomerData.City,
//   //             longitude: locationDataSet?.longitude,
//   //             latitude: locationDataSet?.latitude,
//   //             offset: 0,
//   //             length: 100,
//   //             index:1
//   //         };
//   //         console.log("Initial chamod",searchParams)
//   //         const initialResult = await loadHotelsData(searchParams, customerId);
//   //         console.log("Initial result", initialResult)
//   //         const totalHotels = initialResult?.totalHotels || 0;
//   //         const allHotels = [...(initialResult?.hoteldataset || [])];
//   //         setContent(allHotels);
//   //         updateData(allHotels);

//   //         console.log(`Total hotels found`, initialResult);
          
//   //         setLoading(false);
//   //         const response = await getHotelDataUpdated(hotelSearchCustomerData, userId || 624);
//   //         console.log("Initial result1111")
//   //         if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
//   //           setContent(response);
//   //           updateData(response);
//   //         } else {
//   //           setContent([]);
//   //           updateData([]);
//   //         }
//   //       } catch (error) {
//   //         console.error("Error fetching hotel data:", error);
//   //         setContent([]);
//   //         updateData([]);
//   //       } finally {
//   //         setLoading(false);
//   //       }
//   //     };
      
//   //     initialSearch();
//   //   }
//   // }, [locationDataSet]);

//   const [metaDiscountHotel, setMetaDiscountHotel] = useState([])

//   useEffect(() => {
//   if (locationDataSet) {
//     const initialSearch = async () => {
//       setLoading(true);
//       try {
//         const customerId = userId ?? 624;
 
//         const searchParams = {
//             ...hotelSearchCustomerData,
//             Country: hotelSearchCustomerData.City,
//             longitude: locationDataSet?.longitude,
//             latitude: locationDataSet?.latitude,
//             index: 1,
//             length: 100,
//         };
//         console.log("Initial chamod", searchParams);
//         // Load first set of hotels (index 1)
//         const initialResult = await loadHotelsData(searchParams, customerId);
//         console.log("Initial result", initialResult);
//         const metaDiscount = initialResult?.hotelMetaDiscount || [];
//         setMetaDiscountHotel(metaDiscount)
//         const totalHotels = initialResult?.totalHotels || 0;
//         const allHotels = [...(initialResult?.hoteldataset || [])];
//         // Update state with first batch
//         setContent(allHotels);
//         updateData(allHotels);
//         console.log(`Total hotels found`, initialResult);
//         // Get updated hotel data with sequential loading
//         const response = await getHotelDataUpdateData(hotelSearchCustomerData, userId || 624);
//         console.log("Final result with all hotels");
//         if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
//           setContent(response);
//           updateData(response);
//         } else {
//           setContent([]);
//           updateData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching hotel data:", error);
//         setContent([]);
//         updateData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initialSearch();
//   }
// }, [locationDataSet]);
 
// const getHotelDataUpdateData = async (data, userId) => {
//   try {
//     console.log("Searching hotel data for user:", data);
 
//     const customerId = userId ?? 624;
 
//     const searchParams = {
//         ...data,
//         Country: data.City,
//         index: 1,
//         length: 100,
//     };
 
//     // Load first batch (index 1)
//     const initialResult = await loadHotelsData(searchParams, customerId);
 
//     const totalHotels = initialResult?.totalHotels || 0;
//     const allHotels = [...(initialResult?.hoteldataset || [])];
//     const max_request_count = initialResult?.max_request_count || 1;
 
//     console.log(`Total hotels found: ${totalHotels}`);
//     console.log(`Max request count: ${max_request_count}`);
 
//     // Update state with first batch
//     setContent(allHotels);
//     updateData(allHotels);
 
//     // Sequential loading for remaining batches (index 2 to max_request_count)
//     if (max_request_count > 1) {
//       for (let index = 2; index <= max_request_count; index++) {
//         try {
//           console.log(`Loading hotels for index: 234234234234`,index);
//           const paginatedParams = { 
//             ...searchParams, 
//             index: index
//           };
//           const response = await loadHotelsData(paginatedParams, customerId);
//           if (response?.hoteldataset?.length) {
//             allHotels.push(...response.hoteldataset);
//             // Update state after each batch
//             setContent([...allHotels]); // Create new array reference
//             updateData([...allHotels]);
//             console.log(`✅ Loaded ${response.hoteldataset.length} hotels for index ${index}. Total so far: ${allHotels.length}`);
//           } else {
//             console.log(`⚠️ No hotels found for index ${index}`);
//           }
//           // Optional: Add a small delay between requests to prevent overwhelming the server
//           // await new Promise(resolve => setTimeout(resolve, 100));
//         } catch (error) {
//           console.error(`❌ Error loading hotels for index ${index}:`, error);
//           // Continue with next index even if one fails
//         }
//       }
//     }
 
//     console.log(`✅ Total hotels fetched: ${allHotels.length}`);
//     return allHotels;
//   } catch (error) {
//     console.error("❌ Error loading hotel data:", error);
//     return [];
//   }
// };

//   const getHotelcityLocations = (response) => {
//     let cityArr = [];
//     response !== "Something went wrong !" &&
//       response.map((value) => {
//         try {
//           let cityValue = value?.City?.toLowerCase()?.trim();
//           if (cityValue == '' || cityValue == null || cityValue == undefined) {
//           } else {
//             if (!cityArr.includes(cityValue)) {
//               cityArr.push(cityValue)
//             }
//           }
//         } catch (error) {
//           cityArr = []
//         }
//       })
//     setHotelLocations(cityArr.toSorted())
//   }

//   const handleLocationchange = (value) => { handleOnChange(value, selectedLocations, setSelectedLocations, 'City') }
//   const handleCategoryChange = (value) => { handleOnChange(value, selectedCategory, setSelectedCategory, 'StarRating') }

//   const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
//     const index = selectedItems.indexOf(value);
//     let updatedSelectedItems;
//     if (index === -1) {
//       updatedSelectedItems = [value, ...selectedItems];
//     } else {
//       updatedSelectedItems = selectedItems.filter(item => item !== value);
//     }
//     setSelectedItems(updatedSelectedItems);
//     const dataset = { value, type };
//     let sampledataset;
//     if (index === -1) {
//       sampledataset = [...filterCheckboxes, dataset];
//     } else {
//       sampledataset = filterCheckboxes.filter(item => !(item.value === value && item.type === type));
//     }
//     let result = []
//     sampledataset.map((value) => {
//       if (!result.includes(value.type)) {
//         result.push(value.type)
//       }
//     })
//     setFilteringValue(result);
//     removeDuplicates(sampledataset);
//   }

//   // price filter
//   const [priceFilterOpen, setpriceFilterOpen] = useState(true);
//   const [pricefilter, setpricefilter] = useState(false);

//   const [tempCurrency, setTempCurrency] = useState(baseCurrencyValue?.base || 'USD');


//   const [minprice, setminprice] = useState('');
//   const [maxprice, setmaxprice] = useState('');

//   const [pricerange, setpricerange] = useState([]);
//   const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);

//   const [userMinMaxPrice, setUserMinMaxPrice] = useState({
//     min: minprice,
//     max: maxprice
//   })

//   // sorting..
//   const [priceSorting, setPriceSorting] = useState(true);

//   const [sortingFilter, setSortingFilters] = useState({
//     pricefilter: 'default',
//     distanceFilter: 'default'
//   });

//   // 1. Fix the createPriceFilterButtons function
// const createPriceFilterButtons = async (dataset) => {
//   if (dataset.length > 0) {
//     // Ensure baseCurrencyValue is available
//     if (!baseCurrencyValue || !baseCurrencyValue.base) {
//       console.warn('Base currency not available yet');
//       return;
//     }

//     let filtered = dataset.toSorted((a, b) => {
//       return CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue) - 
//              CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue);
//     });

//     let result = createPriceSteps(
//       Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0].Currency, filtered[0].TotalRate, baseCurrencyValue)), 
//       Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1].Currency, filtered[filtered.length - 1].TotalRate, baseCurrencyValue))
//     );

//     setminprice(result[0].start);
//     setmaxprice(result[result.length - 1].end);
//     setpricerange([result[0].start, result[result.length - 1].end]);
    
//     console.log("Price filter buttons", result);
//     setFilterByPriceButtons(result);
//     setUserMinMaxPrice({
//       min: result[0].start,
//       max: result[result.length - 1].end
//     });
    
//     // Set tempCurrency immediately when creating price buttons
//     setTempCurrency(baseCurrencyValue.base);
//   } else {
//     setFilterByPriceButtons([]);
//   }
// };
// const handlePriceFilterChange = async (value) => {
//   setminprice(value.start);
//   setmaxprice(value.end);
//   setpricefilter(true);
  
//   // Update user min/max price to match selected range
//   setUserMinMaxPrice({
//     min: value.start,
//     max: value.end
//   });
// };

//   const handleSearchPriceRange = () => {
//     if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
//       ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
//     } else {
//       setminprice(userMinMaxPrice.min);
//       setmaxprice(userMinMaxPrice.max);
//     }
//   }

// const updateData = async (dataset) => {
//   console.log("Dataset", dataset);
//   setHotelMainDataset(dataset);
//   setFilteredMainDataset(dataset);
//   getHotelcityLocations(dataset);
  
//   // Only create price filter buttons if we have baseCurrencyValue
//   if (baseCurrencyValue && baseCurrencyValue.base) {
//     await createPriceFilterButtons(dataset);
//   }
// };

// useEffect(() => {
//   if (baseCurrencyValue && baseCurrencyValue.base && hotelMainDataset.length > 0) {
//     createPriceFilterButtons(hotelMainDataset);
//   }
// }, [baseCurrencyValue]);
//   // const getHotelData = async (data) => {
//   //   console.log("Hotel data isss", data)
//   //   setLoading(true);

//   //   const customerId = userId ?? 624;

//   //   const searchParams = {
//   //       ...hotelSearchCustomerData,
//   //       Country: hotelSearchCustomerData.City,
//   //       longitude: locationDataSet?.longitude,
//   //       latitude: locationDataSet?.latitude,
//   //       offset: 0,
//   //       length: 100,
//   //   };
//   //   console.log("Initial result1111",searchParams)
//   //   const initialResult = await loadHotelsData(searchParams, customerId);
//   //   console.log("Initial result", initialResult)
//   //   const allHotels = [...(initialResult?.hoteldataset || [])];
//   //   setContent(allHotels);
//   //   updateData(allHotels);
//   //   setLoading(false);
    
//   //   await  getHotelDataUpdated(data, userId).then((response) => {
//   //     if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//   //       updateData([]);
//   //       setLoading(false);
//   //     } else {
//   //       updateData(response || []);
//   //       setContent(response || []);
//   //       setLoading(false);
//   //     }
//   //   })
//   // }

//   const getHotelData = async (data) => {
//     console.log("Hotel data isss", data)
//      setLoading(true);
     
//         const customerId = userId ?? 624;
 
//         const searchParams = {
//             ...hotelSearchCustomerData,
//             Country: hotelSearchCustomerData.City,
//             longitude: locationDataSet?.longitude,
//             latitude: locationDataSet?.latitude,
//             index: 1,
//             length: 100,
//         };

        
//         const initialResult = await loadHotelsData(searchParams, customerId);
      
//         const allHotels = [...(initialResult?.hoteldataset || [])];
       
//         setContent(allHotels);
//         updateData(allHotels);
//          setLoading(false);
//         // console.log(`Total hotels found`, initialResult);

//         await  getHotelDataUpdateData(data, userId || 624).then((response) => {
//       if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//         updateData([]);
//         setLoading(false);
//       } else {
//         updateData(response || []);
//         setContent(response || []);
//         setLoading(false);
//       }
//     })
//   }

//   // useEffect(()=>{
//   //   getHotelData(hotelSearchCustomerData);
//   // },[baseLocation?.address_full])

//   const removeDuplicates = (arr) => {
//     const unique = [];
//     const items = new Set();
//     arr.forEach(item => {
//       const key = JSON.stringify(item);
//       if (!items.has(key)) {
//         items.add(key);
//         unique.push(item);
//       }
//     });
//     setFilterCheckboxes(unique);
//   };

//   const handleChange = (value) => {
//     const query = value;
//     setUserSearchQuery(query);
//     let filtered = hotelMainDataset.filter((value) => {
//       return value.HotelName.toLowerCase().trim().includes(query.toLowerCase().trim())
//     })
//     const filteredData = getFilteredProducts(filteringValue, filteringValue[0], filtered);
//     setFilteredMainDataset(filteredData);
//   };

//  const getFilteredProducts = (filters, dynamicValue, dataset) => {
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


// const getPricefilters = (dataset) => {
//   // Remove duplicates first using HotelCode as unique identifier
//   const uniqueDataset = dataset.filter((item, index, self) => 
//     index === self.findIndex(hotel => hotel.HotelCode === item.HotelCode)
//   );

//   console.log(minprice, "Min price data");
  
//   // Ensure we have valid price range
//   if (minprice === '' || maxprice === '' || !baseCurrencyValue) {
//     return uniqueDataset;
//   }

//   // Filter by price range
//   let result = uniqueDataset.filter((value) => {
//     let price = CurrencyConverterOnlyRateWithoutDecimal(value.Currency, value.TotalRate, baseCurrencyValue);
//     return Number(minprice) <= Number(price) && Number(price) <= Number(maxprice);
//   });

//   let sortedResult = [];

//   if (sortingFilter.pricefilter === "default") {
//     sortedResult = result;
//   } else if (sortingFilter.pricefilter === "lowtohigh") {
//     sortedResult = result.sort((a, b) => {
//       const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//       const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//       return priceA - priceB;
//     });
//   } else if (sortingFilter.pricefilter === "hightolow") {
//     sortedResult = result.sort((a, b) => {
//       const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//       const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//       return priceB - priceA;
//     });
//   }

//   return sortedResult;
// };

//   const startFiltering = () => {
//     const filteredData = getFilteredProducts(filteringValue, filteringValue[0], hotelMainDataset);
//     setFilteredMainDataset(filteredData);
//   };

//   const handleValidateAdultChildCount = (value) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfAdults: value.adult,
//       NoOfChild: value.child,
//     })
//     setChildAges(value.childAges);
//   }

//   const handleOnGoogleLocationChange = (value) => {
//     setIsFocused(false)
//     setGoogleLocation(value['label'].slice(0, 25) + '...')
//     geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
//       geocodeByLatLng({ lat: lat, lng: lng }).then(results => {
//         console.log("Google location data", results)
//         for (var i = 0; i < results[0].address_components.length; i++) {
//           for (var b = 0; b < results[0].address_components[i].types.length; b++) {
//             if ((results[0].address_components[i].types.includes("locality") || results[0].address_components[i].types.includes("locality"))) {
//               setHotelSearchCustomerData({
//                 ...hotelSearchCustomerData,
//                 City: results[0].address_components[i].short_name,
//                 Country: results[0].address_components[i].long_name,
//                 dataSet: JSON.stringify({
//                   latitude: lat, longitude: lng,
//                   locationDescription: results[0].address_components[i].long_name,
//                   ...results[0],
//                 })
//               })
//               break;
//             }
//           }
//         }
//       }).catch((error) => {
//         // console.error(error)
//       }
//       );
//     }).catch((error) => {
//       // console.error(error);
//     })
//   }

//   const handleOnDatePicker = (value) => {
//     console.log("Selected date range", value);
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       CheckInDate: moment(value[0].startDate).format('DD/MM/YYYY'),
//       CheckOutDate: moment(value[0].endDate).format('DD/MM/YYYY'),
//     });
//     setDate(value);
//     // setOpenDate(!openDate);
//   }

//   const handleRoomCount = (e) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfRooms: e.value
//     });
//   }

//   const handleStarRate = (e) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       StarRate: e.value
//     });
//   }

// useEffect(() => {
//   if (!loading && baseCurrencyValue) {
//     startFiltering();
//   }
// }, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue]);

//   // useEffect(() => {
//   //   var hotelSearchData = hotelSearchCustomerData;
//   //   hotelSearchData["City"] = baseLocation?.address_full;
//   // }, [baseLocation]);

//   // useEffect(() => {
//   //   setGoogleLocation(baseLocation?.address_full.slice(0, 25).concat(' ...'));
//   // }, [baseLocation?.address_full])

//   const handleClearAllFilters = () => {
//     setSelectedCategory([]);
//     setSelectedLocations([]);
//     setFilteredMainDataset(hotelMainDataset);
//     clearPriceFilter();
//   }

//  const clearPriceFilter = () => {
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

// const safeCurrencyConverter = (currency, amount, baseCurrencyValue) => {
//   try {
//     if (!baseCurrencyValue || !currency || !amount) {
//       return amount || 0;
//     }
//     return CurrencyConverter(currency, amount, baseCurrencyValue);
//   } catch (error) {
//     console.error('Currency conversion error:', error);
//     return amount || 0;
//   }
// };

//   const [openSideBarStatus, setopenSideBarStatus] = useState(false);
//   const [searchFilter, setSearchfilter] = useState(false);

//   const openSubFilter = () => {
//     setopenSideBarStatus(true);
//   }

//   const closeSubFilter = () => {
//     setopenSideBarStatus(false);
//   }

//   const openSearchFilter = () => {
//     setSearchfilter(true);
//   }

//   const closeSearchFilter = () => {
//     setSearchfilter(false);
//     handleChange('');
//   }

//   // const router = useRouter();
//   const canonicalUrl = router.asPath;

//   const options = [
//     { value: 'default', label: 'Default' },
//     { value: 'lowtohigh', label: 'Price Low to High' },
//     { value: 'hightolow', label: 'Price High to Low' }
//   ];

//   const handleSelectChange = (selectedOption) => {
//     setSortingFilters({ ...sortingFilter, pricefilter: selectedOption.value });
//   };

//   useEffect(() => {

//     const discountData = [];
//         content.forEach(item => {
//             if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
//             discountData.push({
//                discount : item.discount,
//                product : item
//             });
//             }
//         });

//     console.log("Discount data", discountData)

//         setAllDiscountData(discountData);
        

//     setLoading(false);
//     updateData(content);
//   }, [content]);

//   const handleClearHotelSearch = async()=>{
//     // console.log('reset data', baseLocation)
//     const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
//     const checkout = moment().add(8, 'days').format('DD/MM/YYYY');

//      setHotelSearchCustomerData({
//       CheckInDate: checkIn,
//       CheckOutDate: checkout,
//       NoOfNights: 1,
//       NoOfRooms: 1,
//       NoOfAdults: 1,
//       NoOfChild: 0,
//       City: baseLocation?.address_full,
//       dataSet: JSON.stringify({locationDataSetReset}),
//       Country: baseLocation?.address_full,
//       StarRate: 0,
//       RoomRequest: [{
//         indexValue: 0,
//         roomType: "Single",
//         NoOfAdults: 1,
//         NoOfChild: 0,
//         ChildAge: []
//       }]
//     });

//     setLoading(true);

//     const customerId = userId ?? 624;

//     // const searchParams = {
//     //     ...hotelSearchCustomerData,
//     //     Country: hotelSearchCustomerData.City,
//     //     offset: 0,
//     //     length: 100,
//     // };

//     const searchParams = {
//       CheckInDate: checkIn,
//       CheckOutDate: checkout,
//       NoOfNights: 1,
//       NoOfRooms: 1,
//       NoOfAdults: 1,
//       NoOfChild: 0,
//       City: baseLocation?.address_full,
//       dataSet: JSON.stringify({locationDataSetReset}),
//       Country: baseLocation?.address_full,
//       latitude: baseLocation?.latitude,
//       longitude: baseLocation?.longitude,
//       StarRate: 0,
//       offset: 0,
//       length: 100,
//       RoomRequest: [{
//         indexValue: 0,
//         roomType: "Single",
//         NoOfAdults: 1,
//         NoOfChild: 0,
//         ChildAge: []
//       }]
//     }


//     // console.log("Initial result1111",searchParams)
//     const initialResult = await loadHotelsData(searchParams, customerId);
//     // console.log("Initial result", initialResult)
//     const allHotels = [...(initialResult?.hoteldataset || [])];
//     setContent(allHotels);
//     updateData(allHotels);
//     setLoading(false);
//     setGoogleLocation(baseLocation?.address_full)
//     await  getHotelDataUpdateData(searchParams, userId).then((response) => {
//       if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//         updateData([]);
//         setLoading(false);
//       } else {
//         updateData(response || []);
//         setContent(response || []);
//         setLoading(false);
//       }
//     })
//   }

//   const handleDateSelect = (start, end) => {
//   //   console.log("Selected date isssss 123", [{
//   //   startDate: start.toISOString(),
//   //   endDate: end.toISOString(),
//   //   key: "selection"
//   // }]);
//   console.log("Selected date isssss", start, end);

//      setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       CheckInDate: start === null ? moment().add(7, 'days').format('DD/MM/YYYY') : moment(start).format('DD/MM/YYYY'),
//       CheckOutDate: end === null ? moment().add(8, 'days').format('DD/MM/YYYY') : moment(end).format('DD/MM/YYYY'),
//     });
//     setDate([{
//     startDate: start === null? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : start.toISOString(),
//     endDate: end === null? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() : end.toISOString(),
//     key: "selection"
//   }]);


//   }

//   const customStyles = `
//   .rdrYearPicker,
//   .rdrMonthAndYearWrapper .rdrMonthAndYearPickers .rdrYearPicker {
//     display: none !important;
//   }
// `;
// const [isFocused, setIsFocused] = useState(false);

// const handleRoomAllocation = (data) => {
//   console.log("Room allocation data", data);

//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfAdults: data?.roomDetails?.adults ||1,
//       NoOfChild: data?.roomDetails?.children ,
//     })
//     // setChildAges(value.childAges);

//       setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfRooms: data?.roomCounts?.Single
//     });

// }

// const handleTogle = () => {
//     setOpenRoomModel(!openRoomModel);
// }


//   return (
//     <>

//       <Head>
//         <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//         <title>Aahaas - Hotels</title>
//         <meta name="description" content="Discover a variety of hotels with Aahaas, whether you're looking for luxurious retreats or affordable stays. Our wide range of options ensures you can rest in comfort after a day of exploration. Book your perfect accommodation and start your journey in style." /> {/* Set meta description if needed */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "BreadcrumbList",
//               "itemListElement": [
//                 {
//                   "@type": "ListItem",
//                   "position": 1,
//                   "name": "Home",
//                   "item": "https://www.aahaas.com/"
//                 },
//                 {
//                   "@type": "ListItem",
//                   "position": 2,
//                   "name": "Hotels",
//                   "item": "https://www.aahaas.com/hotels"
//                 }
//               ]
//             }),
//           }}
//         />
//       </Head>

//       <CommonLayout title="hotel" parent="home" showMenuIcon={true} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}>
//         <section className="section-b-space ratio_asos mt-lg-5">
//           <div className="collection-wrapper">
//             <Container>
//               <Row>

//                     <Col
//              sm="3"
//              className="collection-filter yellow-scrollbar"
//              id="filter"
//              style={{
//                left: openSideBarStatus ? "0px" : "",
//                position: 'sticky',
//                top: '20px',
//                alignSelf: 'flex-start',
//                maxHeight: '100vh',
//                overflowY: 'auto',
//              }}
//            >

//                   <div className="collection-filter-block px-lg-4 pe-5">

//                     <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
//                       <span className="filter-back">
//                         <i className="fa fa-angle-left" ></i> back
//                       </span>
//                     </div>
//                     <div className="collection-collapse-block">
//                       <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Location</h5>
//                         {/* <LoadScript googleMapsApiKey={groupApiCode} libraries={["places", "geometry"]} onLoadFailed={(error) => console.error("Could not inject Google script", error)}> */}
//                      <GooglePlacesAutocomplete 
//   apiKey={groupApiCode} 
//   selectProps={{ 
//     value: googleLocation,
//     // placeholder:  googleLocation === 'search' ? 'Search for a location...' : isFocused === true ? "" : googleLocation,
//     placeholder:  isFocused ? "" : googleLocation === 'search' ? 'Search for a location...' : googleLocation,
//     onChange: (e) => handleOnGoogleLocationChange(e), 
//     onClick: (e) => {
//       setIsFocused(true);
//     },
//     onFocus: () => setIsFocused(true),
//     onBlur: () => setIsFocused(false)
//   }} 
// />
//                         {/* </LoadScript> */}
//                       </div>
 
//                       <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Check-In / Check-Out</h5>
//                         <div className='hotel-sidebar-filters d-flex' onClick={() => setOpenDate(!openDate)}>
//                           <p>{hotelSearchCustomerData.CheckInDate}</p>
//                           <p>➜</p>
//                           <p>{hotelSearchCustomerData.CheckOutDate}</p>
//                         </div>
//                         {/* {
//                           openDate &&
//                           <DateRange editableDateInputs={true} onChange={(item) => handleOnDatePicker([item.selection])} moveRangeOnFirstSelection={false} className="htl_dateRange" ranges={date} minDate={new Date()} />
//                         } */}
//                       </div>
 
//                       <div className="collection-collapse-block">
//                         {/* <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Adults & Children</h5>
//                         <div className='hotel-sidebar-filters d-flex gap-2' onClick={() => setOpenAdultChildModal(!openAdultChildModal)}>
//                           <span>{hotelSearchCustomerData.NoOfAdults > 1 ? <>Adults x {hotelSearchCustomerData.NoOfAdults}</> : <>Adult x {hotelSearchCustomerData.NoOfAdults}</>}</span>
//                           <span>-</span>
//                           <span>{hotelSearchCustomerData.NoOfChild > 0 ? <>Children x {hotelSearchCustomerData.NoOfChild}</> : <>Child x {hotelSearchCustomerData.NoOfChild}</>}</span>
//                         </div> */}
//                         <button className='btn btn-sm btn-solid my-4' style={{width:"100%"}} onClick={() => {setOpenRoomModel(true)}}>Select Room and Pax</button>
//                       </div>
 
//                       {/* <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Rooms</h5>
//                         <Select options={roomCounts} onChange={handleRoomCount} value={roomCounts.find(data => data.value === hotelSearchCustomerData.NoOfRooms)} />
//                       </div> */}
 
//                       <button className='btn btn-sm btn-solid my-4' onClick={() => getHotelData(hotelSearchCustomerData)}>Search hotels</button>
//                       <button className='btn btn-sm btn-solid my-4' onClick={() => handleClearHotelSearch(hotelSearchCustomerData)}>Reset</button>
                      
 
//                     </div>
                    
                    






                    

//                   </div>

//                   <div className="collection-filter-block px-lg-4 pe-5">

//                     <ModalBase isOpen={openAdultChildModal} title={'Select Number of Pax'} toggle={() => { setOpenAdultChildModal(false) }} size="lg">
//                       <PaxIncrementorComponent
//                        open={openAdultChildModal} 
//                        adultCount={parseInt(hotelSearchCustomerData.NoOfAdults)} 
//                        toggle={() => { setOpenAdultChildModal(false) }} 
//                        childCount={parseInt(hotelSearchCustomerData.NoOfChild)} 
//                        adultChildMinMax={adultChildMinMax} 
//                       //  childAgesDynamic={customerDetails.childAges}
//                        addPaxPaxIncrement={handleValidateAdultChildCount} >
//                        </PaxIncrementorComponent>
//                     </ModalBase>

//                     <ModalBase isOpen={openRoomModel} title={'Select Room And Pax Count'} toggle={() => { setOpenRoomModel(false) }} size="lg">
//                       <RoomAllocation handleRoomAllocation={handleRoomAllocation} handleTogle={handleTogle} />
//                     </ModalBase>


//                     {/* <PaxIncrementorComponent
//             open={showCountBox}
//             toggle={() => setshowCountBox(false)}
//             adultCount={parseInt(customerDetails.adultCount)}
//             childCount={parseInt(customerDetails.childCount)}
//             childAgesDynamic={customerDetails.childAges}
//             adultChildMinMax={adultChildMinMax}
//             addPaxPaxIncrement={handleValidateAdultChildCount}
//             paxLimitations={paxLimitations}
//           ></PaxIncrementorComponent> */}

//                     <ModalBase isOpen={openDate} title={'Select Date '} toggle={() => { setOpenDate(!openDate)}} size="l">
//                       <div style={{ width: '100%', height: '100%' }} className="d-flex justify-content-center align-items-center flex-column">
//                     {/* <DateRange editableDateInputs={true} onChange={(item) => handleOnDatePicker([item.selection])} moveRangeOnFirstSelection={false} className="htl_dateRange" ranges={date} 
//                     yearRange={[currentYear, currentYear + 10]} // Current year to 10 years ahead
//                     minDate={new Date()}/> */}
//                     <>
//   <style>{customStyles}</style>

//   {/* <DateRange 
//     editableDateInputs={true} 
//     onChange={(item) => handleOnDatePicker([item.selection])} 
//     moveRangeOnFirstSelection={false} 
//     className="htl_dateRange" 
//     ranges={date} 
//     minDate={new Date()} 
//   /> */}
//   <CustomCalendar  handleDateSelect={handleDateSelect} selectedDate={date}/>
  
// </>

//                       </div>
                       
//                       {/* <PaxIncrementorComponent open={openAdultChildModal} adultCount={hotelSearchCustomerData.NoOfAdults} toggle={() => { setOpenAdultChildModal(false) }} childCount={hotelSearchCustomerData.NoOfChild} adultChildMinMax={adultChildMinMax} addPaxPaxIncrement={handleValidateAdultChildCount} ></PaxIncrementorComponent> */}
//                     </ModalBase>

//                     <div className="collection-collapse-block">

//                       <div className="collection-collapse-block">
//                         <h5 style={{ fontWeight: '500' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
//                         <Collapse isOpen={priceFilterOpen}>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <ul className="category-list">
//                               {
//   filterByPriceButtons?.map((value, key) => (
//     <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//       <Input 
//         checked={value.start === minprice && value.end === maxprice} 
//         onChange={() => handlePriceFilterChange(value)} 
//         name={value} 
//         id={value} 
//         type="radio" 
//         className="custom-control-input option-btns" 
//       />
//       <h6 className="m-0 p-0" htmlFor={value}>
//         {baseCurrencyValue ? 
//           `${CurrencyConverter(baseCurrencyValue.base, value.start, baseCurrencyValue)} - ${CurrencyConverter(baseCurrencyValue.base, value.end, baseCurrencyValue)}` :
//           `${value.start} - ${value.end}`
//         }
//       </h6>
//     </div>
//   ))
// }
//                               </ul>
//                             </div>
//                           </div>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <div className="d-flex align-items-end align-content-stretch gap-3">
//                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                   <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
//                                   <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Min" value={userMinMaxPrice.min} min={pricerange[0]} max={pricerange[1]} name="min" onChange={(e) => handleMinMaxPrice(e)} />
//                                 </div>
//                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                   <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
//                                   <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Max" value={userMinMaxPrice.max} max={pricerange[1]} min={pricerange[0]} name="max" onChange={(e) => handleMinMaxPrice(e)} />
//                                 </div>
//                                 <div className="ms-auto col-3">
//                                   <button className="btn btn-sm btn-solid" style={{ padding: '7px 10px', borderRadius: '5px' }} onClick={handleSearchPriceRange}><SearchIcon /></button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </Collapse>
//                       </div>
//                       <div className="collection-collapse-block open">
//                         <h5 style={{ fontWeight: '500' }} className={hotelCategory ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setHotelCategory(!hotelCategory)}>Hotel category</h5>
//                         <Collapse isOpen={hotelCategory}>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <ul className="category-list">
//                                 {
//                                   roomCategory.map((value, index) => (
//                                     value.label !== 'All stars' &&
//                                     <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
//                                       <Input checked={selectedCategory.includes(value.value)} onChange={() => { handleCategoryChange(value.value) }} name={value.value} id={value.value} type="checkbox" className="custom-control-input option-btns" />
//                                       <h6 className="m-0 p-0" htmlFor={value.label}>{value.label}</h6>
//                                     </div>
//                                   ))
//                                 }
//                               </ul>
//                             </div>
//                           </div>
//                         </Collapse>
//                       </div>

//                     </div>
//                   </div>
//                 </Col>

//                 <Col className="collection-content" sm='12' md='12' lg="9">
//                   <div className="page-main-content">
//                     <Row>
//                       <Col sm="12">

//                         <div className="d-none d-lg-block d-md-block top-banner-wrapper">
//                           <a href={null}>
//                             <Media src={Menu2.src} className="img-fluid blur-up lazyload" alt="" />
//                           </a>
//                         </div>

//                         <div className="collection-product-wrapper mt-0 mt-lg-4">

//                           <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">

//                             <h5 className="p-0 m-0 d-none d-lg-block" style={{ fontSize: '15px', fontWeight: '500' }}>{!loading ? `Showing ${filteredMainDataset.length} Products` : "loading"}{" "}</h5>

//                             {
//                               searchFilter ?
//                                 <div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
//                                   <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                   {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                 </div>
//                                 :
//                                 <div className="collection-brand-filter align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 d-none d-lg-flex d-md-flex border" style={{ borderRadius: "10px!important" }}>
//                                   <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                   {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                 </div>
//                             }


//                             <div className="col-3 d-none d-lg-block">
//                               <Select  styles={{
//       menu: (provided) => ({
//         ...provided,
//         zIndex: 1100, // Ensures dropdown appears on top
//         position: "absolute",
//       }),
//     }} options={options} onChange={handleSelectChange} />
//                             </div>

//                           </div>

//                         {(allDiscountData.length > 0 || metaDiscountHotel.length > 0) && (
//   <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
//     <ProductSlider allDiscountData={allDiscountData} type={"hotel"} meta={metaDiscountHotel} />
//   </div>
// )}

                                                    

//                           <ul className="product-filter-tags p-0 m-0 my-2">
//                             {
//                               pricefilter &&
//                               <li>
//                                 <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa-regular fa-circle-xmark ml-2"></i> </a>
//                               </li>
//                             }
//                             {
//                               selectedLocations.map((value, i) => (
//                                 <li key={i}>
//                                   <a href={null} className="filter_tag">{value}<i className="fa fa-close" onClick={() => handleLocationchange(value)}></i>
//                                   </a>
//                                 </li>
//                               ))
//                             }
//                             {
//                               selectedCategory.map((value, i) => (
//                                 <li key={i}>
//                                   <a href={null} className="filter_tag">{value} star<i className="fa fa-close" onClick={() => handleCategoryChange(value)}></i>
//                                   </a>
//                                 </li>
//                               ))
//                             }
//                             {
//                               (pricefilter || selectedLocations.length > 0 || selectedCategory.length > 0) &&
//                               <li onClick={() => handleClearAllFilters()}>
//                                 <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                               </li>
//                             }
//                           </ul>

//                           <Row>
//                             {
//                               loading ?
//                                 <div className="row mx-0 mt-4 margin-default mt-4">
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                 </div> :
//                                 !loading && filteredMainDataset?.length === 0 ?
//                                   <Col xs="12">
//                                     <div className="my-5">
//                                       <div className="col-sm-12 empty-cart-cls text-center">
//                                       <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-4 mx-auto" />
//                                         <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">Sorry, there are no products available right now.</h4>
//                                         <h4 style={{ fontSize: 15 }}>Please check back later or explore other options.</h4>
//                                       </div>
//                                     </div>
//                                   </Col>
//                                   :
//                                   filteredMainDataset?.map((product, i) => (
//                                     <div className={grid} key={i}>
//                                       <ProductItems product={product} description={product?.HotelDescription} hotelCode={product?.HotelCode} latitude={product?.Latitude} longitude={product?.Longitude} hotelAddress={product?.HotelAddress} provider={product?.provider} productImage={product?.HotelPicture} productstype={'hotels'} title={product?.HotelName} productcurrency={product?.Currency} mrp={product?.TotalRate} rate={product?.SupplierPrice} rating={product?.StarRating} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} hotelSearchCustomerData={hotelSearchCustomerData} childAges={childAges} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} />
//                                     </div>
//                                   ))
//                             }
//                           </Row>
//                         </div>
//                       </Col>
//                     </Row>
//                   </div>
//                 </Col>
//               </Row>
//             </Container>
//           </div>
//                                    <style>
//         {`
//           .yellow-scrollbar::-webkit-scrollbar {
//   width: 8px;
// }

// .yellow-scrollbar::-webkit-scrollbar-thumb {
//   background-color: #ededed;
//   border-radius: 10px;
// }

// .yellow-scrollbar::-webkit-scrollbar-track {
//   background-color: transparent;
// }

// .yellow-scrollbar {
//   scrollbar-width: thin;
//   scrollbar-color: #ededed transparent;
// }
//         `}
//       </style>
//         </section>
//       </CommonLayout>

//     </>
//   )
// }

// export default HotelsMainPage





// import moment from 'moment';
// import Head from 'next/head';
// import { useContext, useEffect, useState } from 'react';
// import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
// import { DateRange } from 'react-date-range';
// import Select from 'react-select';
// import CustomCalendar from '../../../components/calender/CustomCalendar';

// import { LoadScript } from '@react-google-maps/api';
// import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// import { AppContext } from '../../_app';
// import { getHotelDataUpdated, loadHotelsData } from '../../../AxiosCalls/HotelServices/hotelServices';

// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import PaxIncrementorComponent from '../../../components/common/PaxIncrementor/PaxIncrementorComponent';
// import ModalBase from '../../../components/common/Modals/ModalBase';
// import ToastMessage from '../../../components/Notification/ToastMessage';

// import PostLoader from '../../skeleton/PostLoader';

// import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/hotelBanner.jpg";

// import SearchIcon from '@mui/icons-material/Search';
// import CloseIcon from '@mui/icons-material/Close';

// import 'react-calendar/dist/Calendar.css';
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
// import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';

// import cookie from 'cookie';
// import { useRouter } from 'next/router';
// import ProductSlider from '../productImageSlider';
// import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
// import RoomAllocation from '../../../components/hotel/RoomAllocation';


// // export async function getServerSideProps(context) {

// //   const { req } = context;
// //   // console.log("context issss klo", req)

// //   let baseLocation = {
// //     latitude: '6.9271',
// //     longtitude: '79.8612',
// //     address_full: 'Colombo, Sri lanka'
// //   };

// //   if (req.headers.cookie) {
// //     const cookies = cookie.parse(req.headers.cookie);
// //     try {
// //       // baseLocation = JSON.parse(cookies.userLastLocation);
// //       const userLastLocation = JSON.parse(cookies.userLastLocation);

// //       baseLocation = {
// //         latitude: userLastLocation.latitude.toString(),
// //         longitude: userLastLocation.longtitude.toString(),
// //         locationDescription: userLastLocation.address_full,
// //         address_components: userLastLocation.address_components
// //       };
// //     } catch (error) {
// //       // console.error('Failed to parse userLastLocation cookie:', error);
// //     }
// //   }

// //   const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
// //   const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

// //   let hotelSearchCustomerData = {
// //     CheckInDate: nextWeekDate,
// //     CheckOutDate: nextWeekDateCheckout,
// //     NoOfNights: 1,
// //     NoOfRooms: 1,
// //     NoOfAdults: 1,
// //     NoOfChild: 0,
// //     // City: 'Colombo',
// //     // City: baseLocation?.address_full,
// //     City: baseLocation?.locationDescription,
// //     dataSet:JSON.stringify({baseLocation}),
// //     // Country: "LK",
// //     Country: baseLocation?.locationDescription,
// //     StarRate: 0,
// //     offset: 0,
// //     length: 100,
// //     RoomRequest: [{
// //       indexValue: 0,
// //       roomType: "Single",
// //       NoOfAdults: 1,
// //       NoOfChild: 0,
// //       ChildAge: []
// //     }]
// //   };

// //   console.log("Hotel search data", hotelSearchCustomerData)

// //   let response = [];

// //   await getHotelDataUpdated(hotelSearchCustomerData,624).then((res) => {
// //     response = res
// //   });



// //   return {
// //     props: {
// //       content: response|| [],
// //       locationDataSet: baseLocation
// //     },
// //   };

// // }

// const HotelsMainPage = () => {
//   const [locationDataSet, setLocationDataSet] = useState(null);
//   const [locationDataSetReset, setLocationDataSetReset] = useState(null);
// const [content, setContent] = useState([]);
//   const router = useRouter();

//   let checkinDate = new Date();;
//   let checkOutDate = new Date();
//   checkOutDate.setDate(checkinDate.getDate() + 1);

//   const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
//   const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

//   const {userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

//   const adultChildMinMax = {
//     minAdult: 50,
//     maxAdult: 50,
//     minChild: 50,
//     maxChild: 50,
//     adultAvl: true,
//     childAvl: true
//   }

//   const roomCounts = [
//     { value: 1, label: '1' },
//     { value: 2, label: '2' },
//     { value: 3, label: '3' },
//     { value: 4, label: '4' },
//     { value: 5, label: '5' },
//     { value: 6, label: '6' },
//     { value: 7, label: '7' },
//     { value: 8, label: '8' },
//     { value: 9, label: '9' },
//     { value: 10, label: '10' }
//   ];

//   const roomCategory = [
//     { value: 1, label: '1 Star' },
//     { value: 2, label: '2 star' },
//     { value: 3, label: '3 star' },
//     { value: 4, label: '4 star' },
//     { value: 5, label: '5 star' }
//   ];

//   const [loading, setLoading] = useState(true);
//   const [hotelCategory, setHotelCategory] = useState(true);

//   const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

//   const [hotelMainDataset, setHotelMainDataset] = useState([]);
//   const [filteredMainDataset, setFilteredMainDataset] = useState([]);

//   const [selectedLocations, setSelectedLocations] = useState([])
//   const [selectedCategory, setSelectedCategory] = useState([])
//   const [filterCheckboxes, setFilterCheckboxes] = useState([]);
//   const [filteringValue, setFilteringValue] = useState([]);

//   const [userSearchQuery, setUserSearchQuery] = useState("");
//   const [hotelLocations, setHotelLocations] = useState([]);
//   const [googleLocation, setGoogleLocation] = useState("search");
//   const [childAges, setChildAges] = useState([]);
//   const [openAdultChildModal, setOpenAdultChildModal] = useState(false);
//   const [openDate, setOpenDate] = useState(false);
//   const [locationfilterOpen, setlocationfilterOpen] = useState(true);
//   const [allDiscountData, setAllDiscountData] = useState([])
//   const [openRoomModel, setOpenRoomModel] = useState(false)

//   const [hotelSearchCustomerData, setHotelSearchCustomerData] = useState({
//     CheckInDate: nextWeekDate,
//     CheckOutDate: nextWeekDateCheckout,
//     NoOfNights: 1,
//     NoOfRooms: 1,
//     NoOfAdults: 1,
//     NoOfChild: 0,
//     City: baseLocation?.address_full,
//     dataSet: JSON.stringify({locationDataSet}),
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

//   const [date, setDate] = useState([{
//     startDate: new Date(),
//     endDate: new Date(),
//     key: "selection",
//   }]);
//   let baseLocationData;
//   useEffect(() => {
//     // Initialize with default location
//     baseLocationData = {
//       latitude: '6.9271',
//       longitude: '79.8612',
//       locationDescription: 'Colombo, Sri lanka'
//     };

//     // Check if cookies exist in browser
//     try {
//       if (typeof document !== 'undefined') {
//         const cookies = document.cookie;
//         if (cookies.includes('userLastLocation')) {
//           const cookieValue = decodeURIComponent(
//             cookies.split('; ').find(row => row.startsWith('userLastLocation='))?.split('=')[1] || ''
//           );
//           if (cookieValue) {
//             const userLastLocation = JSON.parse(cookieValue);
//             baseLocationData = {
//               latitude: userLastLocation.latitude.toString(),
//               longitude: userLastLocation.longtitude.toString(),
//               locationDescription: userLastLocation.address_full,
//               address_components: userLastLocation.address_components
//             };
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Failed to parse userLastLocation cookie:', error);
//     }

//     setLocationDataSet(baseLocationData);
//     setLocationDataSetReset(baseLocationData)
    
//     // Update hotel search data with the location
//     setHotelSearchCustomerData(prev => ({
//       ...prev,
//       City: baseLocationData.locationDescription,
//       Country: baseLocationData.locationDescription,
//       dataSet: JSON.stringify(baseLocationData)
//     }));
    
//     // setGoogleLocation(baseLocationData.locationDescription?.slice(0, 25).concat(' ...'));
//   }, []);

//   // useEffect(() => {

//   //   if (locationDataSet) {
//   //     const initialSearch = async () => {
//   //       setLoading(true);
          
//   //       try {
//   //         const customerId = userId ?? 624;

//   //         const searchParams = {
//   //             ...hotelSearchCustomerData,
//   //             Country: hotelSearchCustomerData.City,
//   //             longitude: locationDataSet?.longitude,
//   //             latitude: locationDataSet?.latitude,
//   //             offset: 0,
//   //             length: 100,
//   //             index:1
//   //         };
//   //         console.log("Initial chamod",searchParams)
//   //         const initialResult = await loadHotelsData(searchParams, customerId);
//   //         console.log("Initial result", initialResult)
//   //         const totalHotels = initialResult?.totalHotels || 0;
//   //         const allHotels = [...(initialResult?.hoteldataset || [])];
//   //         setContent(allHotels);
//   //         updateData(allHotels);

//   //         console.log(`Total hotels found`, initialResult);
          
//   //         setLoading(false);
//   //         const response = await getHotelDataUpdated(hotelSearchCustomerData, userId || 624);
//   //         console.log("Initial result1111")
//   //         if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
//   //           setContent(response);
//   //           updateData(response);
//   //         } else {
//   //           setContent([]);
//   //           updateData([]);
//   //         }
//   //       } catch (error) {
//   //         console.error("Error fetching hotel data:", error);
//   //         setContent([]);
//   //         updateData([]);
//   //       } finally {
//   //         setLoading(false);
//   //       }
//   //     };
      
//   //     initialSearch();
//   //   }
//   // }, [locationDataSet]);

//   const [metaDiscountHotel, setMetaDiscountHotel] = useState([])

//   useEffect(() => {
//   if (locationDataSet) {
//     const initialSearch = async () => {
//       setLoading(true);
//       try {
//         const customerId = userId ?? 624;
 
//         const searchParams = {
//             ...hotelSearchCustomerData,
//             Country: hotelSearchCustomerData.City,
//             longitude: locationDataSet?.longitude,
//             latitude: locationDataSet?.latitude,
//             index: 1,
//             length: 100,
//         };
//         console.log("Initial chamod", searchParams);
//         // Load first set of hotels (index 1)
//         const initialResult = await loadHotelsData(searchParams, customerId);
//         console.log("Initial result", initialResult);
//         const metaDiscount = initialResult?.hotelMetaDiscount || [];
//         setMetaDiscountHotel(metaDiscount)
//         const totalHotels = initialResult?.totalHotels || 0;
//         const allHotels = [...(initialResult?.hoteldataset || [])];
//         // Update state with first batch
//         setContent(allHotels);
//         updateData(allHotels);
//         console.log(`Total hotels found`, initialResult);
//         // Get updated hotel data with sequential loading
//         const response = await getHotelDataUpdateData(hotelSearchCustomerData, userId || 624);
//         console.log("Final result with all hotels");
//         if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
//           setContent(response);
//           updateData(response);
//         } else {
//           setContent([]);
//           updateData([]);
//         }
//       } catch (error) {
//         console.error("Error fetching hotel data:", error);
//         setContent([]);
//         updateData([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     initialSearch();
//   }
// }, [locationDataSet]);
 
// const getHotelDataUpdateData = async (data, userId) => {
//   try {
//     console.log("Searching hotel data for user:", data);
 
//     const customerId = userId ?? 624;
 
//     const searchParams = {
//         ...data,
//         Country: data.City,
//         index: 1,
//         length: 100,
//     };
 
//     // Load first batch (index 1)
//     const initialResult = await loadHotelsData(searchParams, customerId);
 
//     const totalHotels = initialResult?.totalHotels || 0;
//     const allHotels = [...(initialResult?.hoteldataset || [])];
//     const max_request_count = initialResult?.max_request_count || 1;
 
//     console.log(`Total hotels found: ${totalHotels}`);
//     console.log(`Max request count: ${max_request_count}`);
 
//     // Update state with first batch
//     setContent(allHotels);
//     updateData(allHotels);
 
//     // Sequential loading for remaining batches (index 2 to max_request_count)
//     if (max_request_count > 1) {
//       for (let index = 2; index <= max_request_count; index++) {
//         try {
//           console.log(`Loading hotels for index: 234234234234`,index);
//           const paginatedParams = { 
//             ...searchParams, 
//             index: index
//           };
//           const response = await loadHotelsData(paginatedParams, customerId);
//           if (response?.hoteldataset?.length) {
//             allHotels.push(...response.hoteldataset);
//             // Update state after each batch
//             setContent([...allHotels]); // Create new array reference
//             updateData([...allHotels]);
//             console.log(`✅ Loaded ${response.hoteldataset.length} hotels for index ${index}. Total so far: ${allHotels.length}`);
//           } else {
//             console.log(`⚠️ No hotels found for index ${index}`);
//           }
//           // Optional: Add a small delay between requests to prevent overwhelming the server
//           // await new Promise(resolve => setTimeout(resolve, 100));
//         } catch (error) {
//           console.error(`❌ Error loading hotels for index ${index}:`, error);
//           // Continue with next index even if one fails
//         }
//       }
//     }
 
//     console.log(`✅ Total hotels fetched: ${allHotels.length}`);
//     return allHotels;
//   } catch (error) {
//     console.error("❌ Error loading hotel data:", error);
//     return [];
//   }
// };

//   const getHotelcityLocations = (response) => {
//     let cityArr = [];
//     response !== "Something went wrong !" &&
//       response.map((value) => {
//         try {
//           let cityValue = value?.City?.toLowerCase()?.trim();
//           if (cityValue == '' || cityValue == null || cityValue == undefined) {
//           } else {
//             if (!cityArr.includes(cityValue)) {
//               cityArr.push(cityValue)
//             }
//           }
//         } catch (error) {
//           cityArr = []
//         }
//       })
//     setHotelLocations(cityArr.toSorted())
//   }

//   const handleLocationchange = (value) => { handleOnChange(value, selectedLocations, setSelectedLocations, 'City') }
//   const handleCategoryChange = (value) => { handleOnChange(value, selectedCategory, setSelectedCategory, 'StarRating') }

//   const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
//     const index = selectedItems.indexOf(value);
//     let updatedSelectedItems;
//     if (index === -1) {
//       updatedSelectedItems = [value, ...selectedItems];
//     } else {
//       updatedSelectedItems = selectedItems.filter(item => item !== value);
//     }
//     setSelectedItems(updatedSelectedItems);
//     const dataset = { value, type };
//     let sampledataset;
//     if (index === -1) {
//       sampledataset = [...filterCheckboxes, dataset];
//     } else {
//       sampledataset = filterCheckboxes.filter(item => !(item.value === value && item.type === type));
//     }
//     let result = []
//     sampledataset.map((value) => {
//       if (!result.includes(value.type)) {
//         result.push(value.type)
//       }
//     })
//     setFilteringValue(result);
//     removeDuplicates(sampledataset);
//   }

//   // price filter
//   const [priceFilterOpen, setpriceFilterOpen] = useState(true);
//   const [pricefilter, setpricefilter] = useState(false);

//   const [tempCurrency, setTempCurrency] = useState(baseCurrencyValue?.base || 'USD');


//   const [minprice, setminprice] = useState('');
//   const [maxprice, setmaxprice] = useState('');

//   const [pricerange, setpricerange] = useState([]);
//   const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);

//   const [userMinMaxPrice, setUserMinMaxPrice] = useState({
//     min: minprice,
//     max: maxprice
//   })

//   // sorting..
//   const [priceSorting, setPriceSorting] = useState(true);

//   const [sortingFilter, setSortingFilters] = useState({
//     pricefilter: 'default',
//     distanceFilter: 'default'
//   });

//   // 1. Fix the createPriceFilterButtons function
// const createPriceFilterButtons = async (dataset) => {
//   if (dataset.length > 0) {
//     // Ensure baseCurrencyValue is available
//     if (!baseCurrencyValue || !baseCurrencyValue.base) {
//       console.warn('Base currency not available yet');
//       return;
//     }

//     let filtered = dataset.toSorted((a, b) => {
//       return CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue) - 
//              CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue);
//     });

//     let result = createPriceSteps(
//       Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0].Currency, filtered[0].TotalRate, baseCurrencyValue)), 
//       Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1].Currency, filtered[filtered.length - 1].TotalRate, baseCurrencyValue))
//     );

//     setminprice(result[0].start);
//     setmaxprice(result[result.length - 1].end);
//     setpricerange([result[0].start, result[result.length - 1].end]);
    
//     console.log("Price filter buttons", result);
//     setFilterByPriceButtons(result);
//     setUserMinMaxPrice({
//       min: result[0].start,
//       max: result[result.length - 1].end
//     });
    
//     // Set tempCurrency immediately when creating price buttons
//     setTempCurrency(baseCurrencyValue.base);
//   } else {
//     setFilterByPriceButtons([]);
//   }
// };
// const handlePriceFilterChange = async (value) => {
//   setminprice(value.start);
//   setmaxprice(value.end);
//   setpricefilter(true);
  
//   // Update user min/max price to match selected range
//   setUserMinMaxPrice({
//     min: value.start,
//     max: value.end
//   });
// };

//   const handleSearchPriceRange = () => {
//     if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
//       ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
//     } else {
//       setminprice(userMinMaxPrice.min);
//       setmaxprice(userMinMaxPrice.max);
//     }
//   }

// const updateData = async (dataset) => {
//   console.log("Dataset", dataset);
//   setHotelMainDataset(dataset);
//   setFilteredMainDataset(dataset);
//   getHotelcityLocations(dataset);
  
//   // Only create price filter buttons if we have baseCurrencyValue
//   if (baseCurrencyValue && baseCurrencyValue.base) {
//     await createPriceFilterButtons(dataset);
//   }
// };

// useEffect(() => {
//   if (baseCurrencyValue && baseCurrencyValue.base && hotelMainDataset.length > 0) {
//     createPriceFilterButtons(hotelMainDataset);
//   }
// }, [baseCurrencyValue]);
//   // const getHotelData = async (data) => {
//   //   console.log("Hotel data isss", data)
//   //   setLoading(true);

//   //   const customerId = userId ?? 624;

//   //   const searchParams = {
//   //       ...hotelSearchCustomerData,
//   //       Country: hotelSearchCustomerData.City,
//   //       longitude: locationDataSet?.longitude,
//   //       latitude: locationDataSet?.latitude,
//   //       offset: 0,
//   //       length: 100,
//   //   };
//   //   console.log("Initial result1111",searchParams)
//   //   const initialResult = await loadHotelsData(searchParams, customerId);
//   //   console.log("Initial result", initialResult)
//   //   const allHotels = [...(initialResult?.hoteldataset || [])];
//   //   setContent(allHotels);
//   //   updateData(allHotels);
//   //   setLoading(false);
    
//   //   await  getHotelDataUpdated(data, userId).then((response) => {
//   //     if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//   //       updateData([]);
//   //       setLoading(false);
//   //     } else {
//   //       updateData(response || []);
//   //       setContent(response || []);
//   //       setLoading(false);
//   //     }
//   //   })
//   // }

//   const getHotelData = async (data) => {
//     console.log("Hotel data isss", data)
//      setLoading(true);
     
//         const customerId = userId ?? 624;
 
//         const searchParams = {
//             ...hotelSearchCustomerData,
//             Country: hotelSearchCustomerData.City,
//             longitude: locationDataSet?.longitude,
//             latitude: locationDataSet?.latitude,
//             index: 1,
//             length: 100,
//         };

        
//         const initialResult = await loadHotelsData(searchParams, customerId);
      
//         const allHotels = [...(initialResult?.hoteldataset || [])];
       
//         setContent(allHotels);
//         updateData(allHotels);
//          setLoading(false);
//         // console.log(`Total hotels found`, initialResult);

//         await  getHotelDataUpdateData(data, userId || 624).then((response) => {
//       if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//         updateData([]);
//         setLoading(false);
//       } else {
//         updateData(response || []);
//         setContent(response || []);
//         setLoading(false);
//       }
//     })
//   }

//   // useEffect(()=>{
//   //   getHotelData(hotelSearchCustomerData);
//   // },[baseLocation?.address_full])

//   const removeDuplicates = (arr) => {
//     const unique = [];
//     const items = new Set();
//     arr.forEach(item => {
//       const key = JSON.stringify(item);
//       if (!items.has(key)) {
//         items.add(key);
//         unique.push(item);
//       }
//     });
//     setFilterCheckboxes(unique);
//   };

//   const handleChange = (value) => {
//     const query = value;
//     setUserSearchQuery(query);
//     let filtered = hotelMainDataset.filter((value) => {
//       return value.HotelName.toLowerCase().trim().includes(query.toLowerCase().trim())
//     })
//     const filteredData = getFilteredProducts(filteringValue, filteringValue[0], filtered);
//     setFilteredMainDataset(filteredData);
//   };

//  const getFilteredProducts = (filters, dynamicValue, dataset) => {
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


// const getPricefilters = (dataset) => {
//   // Remove duplicates first using HotelCode as unique identifier
//   const uniqueDataset = dataset.filter((item, index, self) => 
//     index === self.findIndex(hotel => hotel.HotelCode === item.HotelCode)
//   );

//   console.log(minprice, "Min price data");
  
//   // Ensure we have valid price range
//   if (minprice === '' || maxprice === '' || !baseCurrencyValue) {
//     return uniqueDataset;
//   }

//   // Filter by price range
//   let result = uniqueDataset.filter((value) => {
//     let price = CurrencyConverterOnlyRateWithoutDecimal(value.Currency, value.TotalRate, baseCurrencyValue);
//     return Number(minprice) <= Number(price) && Number(price) <= Number(maxprice);
//   });

//   let sortedResult = [];

//   if (sortingFilter.pricefilter === "default") {
//     sortedResult = result;
//   } else if (sortingFilter.pricefilter === "lowtohigh") {
//     sortedResult = result.sort((a, b) => {
//       const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//       const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//       return priceA - priceB;
//     });
//   } else if (sortingFilter.pricefilter === "hightolow") {
//     sortedResult = result.sort((a, b) => {
//       const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//       const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//       return priceB - priceA;
//     });
//   }

//   return sortedResult;
// };

//   const startFiltering = () => {
//     const filteredData = getFilteredProducts(filteringValue, filteringValue[0], hotelMainDataset);
//     setFilteredMainDataset(filteredData);
//   };

//   const handleValidateAdultChildCount = (value) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfAdults: value.adult,
//       NoOfChild: value.child,
//     })
//     setChildAges(value.childAges);
//   }

//   const handleOnGoogleLocationChange = (value) => {
//     setIsFocused(false)
//     setGoogleLocation(value['label'].slice(0, 25) + '...')
//     geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
//       geocodeByLatLng({ lat: lat, lng: lng }).then(results => {
//         console.log("Google location data", results)
//         for (var i = 0; i < results[0].address_components.length; i++) {
//           for (var b = 0; b < results[0].address_components[i].types.length; b++) {
//             if ((results[0].address_components[i].types.includes("locality") || results[0].address_components[i].types.includes("locality"))) {
//               setHotelSearchCustomerData({
//                 ...hotelSearchCustomerData,
//                 City: results[0].address_components[i].short_name,
//                 Country: results[0].address_components[i].long_name,
//                 dataSet: JSON.stringify({
//                   latitude: lat, longitude: lng,
//                   locationDescription: results[0].address_components[i].long_name,
//                   ...results[0],
//                 })
//               })
//               break;
//             }
//           }
//         }
//       }).catch((error) => {
//         // console.error(error)
//       }
//       );
//     }).catch((error) => {
//       // console.error(error);
//     })
//   }

//   const handleOnDatePicker = (value) => {
//     console.log("Selected date range", value);
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       CheckInDate: moment(value[0].startDate).format('DD/MM/YYYY'),
//       CheckOutDate: moment(value[0].endDate).format('DD/MM/YYYY'),
//     });
//     setDate(value);
//     // setOpenDate(!openDate);
//   }

//   const handleRoomCount = (e) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfRooms: e.value
//     });
//   }

//   const handleStarRate = (e) => {
//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       StarRate: e.value
//     });
//   }

// useEffect(() => {
//   if (!loading && baseCurrencyValue) {
//     startFiltering();
//   }
// }, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue]);

//   // useEffect(() => {
//   //   var hotelSearchData = hotelSearchCustomerData;
//   //   hotelSearchData["City"] = baseLocation?.address_full;
//   // }, [baseLocation]);

//   // useEffect(() => {
//   //   setGoogleLocation(baseLocation?.address_full.slice(0, 25).concat(' ...'));
//   // }, [baseLocation?.address_full])

//   const handleClearAllFilters = () => {
//     setSelectedCategory([]);
//     setSelectedLocations([]);
//     setFilteredMainDataset(hotelMainDataset);
//     clearPriceFilter();
//   }

//  const clearPriceFilter = () => {
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

// const safeCurrencyConverter = (currency, amount, baseCurrencyValue) => {
//   try {
//     if (!baseCurrencyValue || !currency || !amount) {
//       return amount || 0;
//     }
//     return CurrencyConverter(currency, amount, baseCurrencyValue);
//   } catch (error) {
//     console.error('Currency conversion error:', error);
//     return amount || 0;
//   }
// };

//   const [openSideBarStatus, setopenSideBarStatus] = useState(false);
//   const [searchFilter, setSearchfilter] = useState(false);

//   const openSubFilter = () => {
//     setopenSideBarStatus(true);
//   }

//   const closeSubFilter = () => {
//     setopenSideBarStatus(false);
//   }

//   const openSearchFilter = () => {
//     setSearchfilter(true);
//   }

//   const closeSearchFilter = () => {
//     setSearchfilter(false);
//     handleChange('');
//   }

//   // const router = useRouter();
//   const canonicalUrl = router.asPath;

//   const options = [
//     { value: 'default', label: 'Default' },
//     { value: 'lowtohigh', label: 'Price Low to High' },
//     { value: 'hightolow', label: 'Price High to Low' }
//   ];

//   const handleSelectChange = (selectedOption) => {
//     setSortingFilters({ ...sortingFilter, pricefilter: selectedOption.value });
//   };

//   useEffect(() => {

//     const discountData = [];
//         content.forEach(item => {
//             if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
//             discountData.push({
//                discount : item.discount,
//                product : item
//             });
//             }
//         });

//     console.log("Discount data", discountData)

//         setAllDiscountData(discountData);
        

//     setLoading(false);
//     updateData(content);
//   }, [content]);

//   const handleClearHotelSearch = async()=>{
//     // console.log('reset data', baseLocation)
//     const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
//     const checkout = moment().add(8, 'days').format('DD/MM/YYYY');

//      setHotelSearchCustomerData({
//       CheckInDate: checkIn,
//       CheckOutDate: checkout,
//       NoOfNights: 1,
//       NoOfRooms: 1,
//       NoOfAdults: 1,
//       NoOfChild: 0,
//       City: baseLocation?.address_full,
//       dataSet: JSON.stringify({locationDataSetReset}),
//       Country: baseLocation?.address_full,
//       StarRate: 0,
//       RoomRequest: [{
//         indexValue: 0,
//         roomType: "Single",
//         NoOfAdults: 1,
//         NoOfChild: 0,
//         ChildAge: []
//       }]
//     });

//     setLoading(true);

//     const customerId = userId ?? 624;

//     // const searchParams = {
//     //     ...hotelSearchCustomerData,
//     //     Country: hotelSearchCustomerData.City,
//     //     offset: 0,
//     //     length: 100,
//     // };

//     const searchParams = {
//       CheckInDate: checkIn,
//       CheckOutDate: checkout,
//       NoOfNights: 1,
//       NoOfRooms: 1,
//       NoOfAdults: 1,
//       NoOfChild: 0,
//       City: baseLocation?.address_full,
//       dataSet: JSON.stringify({locationDataSetReset}),
//       Country: baseLocation?.address_full,
//       latitude: baseLocation?.latitude,
//       longitude: baseLocation?.longitude,
//       StarRate: 0,
//       offset: 0,
//       length: 100,
//       RoomRequest: [{
//         indexValue: 0,
//         roomType: "Single",
//         NoOfAdults: 1,
//         NoOfChild: 0,
//         ChildAge: []
//       }]
//     }


//     // console.log("Initial result1111",searchParams)
//     const initialResult = await loadHotelsData(searchParams, customerId);
//     // console.log("Initial result", initialResult)
//     const allHotels = [...(initialResult?.hoteldataset || [])];
//     setContent(allHotels);
//     updateData(allHotels);
//     setLoading(false);
//     setGoogleLocation(baseLocation?.address_full)
//     await  getHotelDataUpdateData(searchParams, userId).then((response) => {
//       if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//         updateData([]);
//         setLoading(false);
//       } else {
//         updateData(response || []);
//         setContent(response || []);
//         setLoading(false);
//       }
//     })
//   }

//   const handleDateSelect = (start, end) => {
//   //   console.log("Selected date isssss 123", [{
//   //   startDate: start.toISOString(),
//   //   endDate: end.toISOString(),
//   //   key: "selection"
//   // }]);
//   console.log("Selected date isssss", start, end);

//      setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       CheckInDate: start === null ? moment().add(7, 'days').format('DD/MM/YYYY') : moment(start).format('DD/MM/YYYY'),
//       CheckOutDate: end === null ? moment().add(8, 'days').format('DD/MM/YYYY') : moment(end).format('DD/MM/YYYY'),
//     });
//     setDate([{
//     startDate: start === null? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : start.toISOString(),
//     endDate: end === null? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() : end.toISOString(),
//     key: "selection"
//   }]);


//   }

//   const customStyles = `
//   .rdrYearPicker,
//   .rdrMonthAndYearWrapper .rdrMonthAndYearPickers .rdrYearPicker {
//     display: none !important;
//   }
// `;
// const [isFocused, setIsFocused] = useState(false);

// const handleRoomAllocation = (data) => {
//   console.log("Room allocation data", data);

//     setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfAdults: data?.roomDetails?.adults ||1,
//       NoOfChild: data?.roomDetails?.children ,
//     })
//     // setChildAges(value.childAges);

//       setHotelSearchCustomerData({
//       ...hotelSearchCustomerData,
//       NoOfRooms: data?.roomCounts?.Single
//     });

// }

// const handleTogle = () => {
//     setOpenRoomModel(!openRoomModel);
// }


//   return (
//     <>

//       <Head>
//         <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//         <title>Aahaas - Hotels</title>
//         <meta name="description" content="Discover a variety of hotels with Aahaas, whether you're looking for luxurious retreats or affordable stays. Our wide range of options ensures you can rest in comfort after a day of exploration. Book your perfect accommodation and start your journey in style." /> {/* Set meta description if needed */}
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "BreadcrumbList",
//               "itemListElement": [
//                 {
//                   "@type": "ListItem",
//                   "position": 1,
//                   "name": "Home",
//                   "item": "https://www.aahaas.com/"
//                 },
//                 {
//                   "@type": "ListItem",
//                   "position": 2,
//                   "name": "Hotels",
//                   "item": "https://www.aahaas.com/hotels"
//                 }
//               ]
//             }),
//           }}
//         />
//       </Head>

//       <CommonLayout title="hotel" parent="home" showMenuIcon={true} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}>
//         <section className="section-b-space ratio_asos mt-lg-5">
//           <div className="collection-wrapper">
//             <Container>
//               <Row>

//                     <Col
//              sm="3"
//              className="collection-filter yellow-scrollbar"
//              id="filter"
//              style={{
//                left: openSideBarStatus ? "0px" : "",
//                position: 'sticky',
//                top: '20px',
//                alignSelf: 'flex-start',
//                maxHeight: '100vh',
//                overflowY: 'auto',
//              }}
//            >

//                   <div className="collection-filter-block px-lg-4 pe-5">

//                     <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
//                       <span className="filter-back">
//                         <i className="fa fa-angle-left" ></i> back
//                       </span>
//                     </div>
//                     <div className="collection-collapse-block">
//                       <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Location</h5>
//                         {/* <LoadScript googleMapsApiKey={groupApiCode} libraries={["places", "geometry"]} onLoadFailed={(error) => console.error("Could not inject Google script", error)}> */}
//                      <GooglePlacesAutocomplete 
//   apiKey={groupApiCode} 
//   selectProps={{ 
//     value: googleLocation,
//     // placeholder:  googleLocation === 'search' ? 'Search for a location...' : isFocused === true ? "" : googleLocation,
//     placeholder:  isFocused ? "" : googleLocation === 'search' ? 'Search for a location...' : googleLocation,
//     onChange: (e) => handleOnGoogleLocationChange(e), 
//     onClick: (e) => {
//       setIsFocused(true);
//     },
//     onFocus: () => setIsFocused(true),
//     onBlur: () => setIsFocused(false)
//   }} 
// />
//                         {/* </LoadScript> */}
//                       </div>
 
//                       <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Check-In / Check-Out</h5>
//                         <div className='hotel-sidebar-filters d-flex' onClick={() => setOpenDate(!openDate)}>
//                           <p>{hotelSearchCustomerData.CheckInDate}</p>
//                           <p>➜</p>
//                           <p>{hotelSearchCustomerData.CheckOutDate}</p>
//                         </div>
//                         {/* {
//                           openDate &&
//                           <DateRange editableDateInputs={true} onChange={(item) => handleOnDatePicker([item.selection])} moveRangeOnFirstSelection={false} className="htl_dateRange" ranges={date} minDate={new Date()} />
//                         } */}
//                       </div>
 
//                       <div className="collection-collapse-block">
//                         {/* <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Adults & Children</h5>
//                         <div className='hotel-sidebar-filters d-flex gap-2' onClick={() => setOpenAdultChildModal(!openAdultChildModal)}>
//                           <span>{hotelSearchCustomerData.NoOfAdults > 1 ? <>Adults x {hotelSearchCustomerData.NoOfAdults}</> : <>Adult x {hotelSearchCustomerData.NoOfAdults}</>}</span>
//                           <span>-</span>
//                           <span>{hotelSearchCustomerData.NoOfChild > 0 ? <>Children x {hotelSearchCustomerData.NoOfChild}</> : <>Child x {hotelSearchCustomerData.NoOfChild}</>}</span>
//                         </div> */}
//                         <button className='btn btn-sm btn-solid my-4' style={{width:"100%"}} onClick={() => {setOpenRoomModel(true)}}>Select Room and Pax</button>
//                       </div>
 
//                       {/* <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                         <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Rooms</h5>
//                         <Select options={roomCounts} onChange={handleRoomCount} value={roomCounts.find(data => data.value === hotelSearchCustomerData.NoOfRooms)} />
//                       </div> */}
 
//                       <button className='btn btn-sm btn-solid my-4' onClick={() => getHotelData(hotelSearchCustomerData)}>Search hotels</button>
//                       <button className='btn btn-sm btn-solid my-4' onClick={() => handleClearHotelSearch(hotelSearchCustomerData)}>Reset</button>
                      
 
//                     </div>
                    
                    






                    

//                   </div>

//                   <div className="collection-filter-block px-lg-4 pe-5">

//                     <ModalBase isOpen={openAdultChildModal} title={'Select Number of Pax'} toggle={() => { setOpenAdultChildModal(false) }} size="lg">
//                       <PaxIncrementorComponent
//                        open={openAdultChildModal} 
//                        adultCount={parseInt(hotelSearchCustomerData.NoOfAdults)} 
//                        toggle={() => { setOpenAdultChildModal(false) }} 
//                        childCount={parseInt(hotelSearchCustomerData.NoOfChild)} 
//                        adultChildMinMax={adultChildMinMax} 
//                       //  childAgesDynamic={customerDetails.childAges}
//                        addPaxPaxIncrement={handleValidateAdultChildCount} >
//                        </PaxIncrementorComponent>
//                     </ModalBase>

//                     <ModalBase isOpen={openRoomModel} title={'Select Room And Pax Count'} toggle={() => { setOpenRoomModel(false) }} size="lg">
//                       <RoomAllocation handleRoomAllocation={handleRoomAllocation} handleTogle={handleTogle} />
//                     </ModalBase>


//                     {/* <PaxIncrementorComponent
//             open={showCountBox}
//             toggle={() => setshowCountBox(false)}
//             adultCount={parseInt(customerDetails.adultCount)}
//             childCount={parseInt(customerDetails.childCount)}
//             childAgesDynamic={customerDetails.childAges}
//             adultChildMinMax={adultChildMinMax}
//             addPaxPaxIncrement={handleValidateAdultChildCount}
//             paxLimitations={paxLimitations}
//           ></PaxIncrementorComponent> */}

//                     <ModalBase isOpen={openDate} title={'Select Date '} toggle={() => { setOpenDate(!openDate)}} size="l">
//                       <div style={{ width: '100%', height: '100%' }} className="d-flex justify-content-center align-items-center flex-column">
//                     {/* <DateRange editableDateInputs={true} onChange={(item) => handleOnDatePicker([item.selection])} moveRangeOnFirstSelection={false} className="htl_dateRange" ranges={date} 
//                     yearRange={[currentYear, currentYear + 10]} // Current year to 10 years ahead
//                     minDate={new Date()}/> */}
//                     <>
//   <style>{customStyles}</style>

//   {/* <DateRange 
//     editableDateInputs={true} 
//     onChange={(item) => handleOnDatePicker([item.selection])} 
//     moveRangeOnFirstSelection={false} 
//     className="htl_dateRange" 
//     ranges={date} 
//     minDate={new Date()} 
//   /> */}
//   <CustomCalendar  handleDateSelect={handleDateSelect} selectedDate={date}/>
  
// </>

//                       </div>
                       
//                       {/* <PaxIncrementorComponent open={openAdultChildModal} adultCount={hotelSearchCustomerData.NoOfAdults} toggle={() => { setOpenAdultChildModal(false) }} childCount={hotelSearchCustomerData.NoOfChild} adultChildMinMax={adultChildMinMax} addPaxPaxIncrement={handleValidateAdultChildCount} ></PaxIncrementorComponent> */}
//                     </ModalBase>

//                     <div className="collection-collapse-block">

//                       <div className="collection-collapse-block">
//                         <h5 style={{ fontWeight: '500' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
//                         <Collapse isOpen={priceFilterOpen}>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <ul className="category-list">
//                               {
//   filterByPriceButtons?.map((value, key) => (
//     <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//       <Input 
//         checked={value.start === minprice && value.end === maxprice} 
//         onChange={() => handlePriceFilterChange(value)} 
//         name={value} 
//         id={value} 
//         type="radio" 
//         className="custom-control-input option-btns" 
//       />
//       <h6 className="m-0 p-0" htmlFor={value}>
//         {baseCurrencyValue ? 
//           `${CurrencyConverter(baseCurrencyValue.base, value.start, baseCurrencyValue)} - ${CurrencyConverter(baseCurrencyValue.base, value.end, baseCurrencyValue)}` :
//           `${value.start} - ${value.end}`
//         }
//       </h6>
//     </div>
//   ))
// }
//                               </ul>
//                             </div>
//                           </div>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <div className="d-flex align-items-end align-content-stretch gap-3">
//                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                   <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
//                                   <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Min" value={userMinMaxPrice.min} min={pricerange[0]} max={pricerange[1]} name="min" onChange={(e) => handleMinMaxPrice(e)} />
//                                 </div>
//                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                   <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
//                                   <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Max" value={userMinMaxPrice.max} max={pricerange[1]} min={pricerange[0]} name="max" onChange={(e) => handleMinMaxPrice(e)} />
//                                 </div>
//                                 <div className="ms-auto col-3">
//                                   <button className="btn btn-sm btn-solid" style={{ padding: '7px 10px', borderRadius: '5px' }} onClick={handleSearchPriceRange}><SearchIcon /></button>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </Collapse>
//                       </div>
//                       <div className="collection-collapse-block open">
//                         <h5 style={{ fontWeight: '500' }} className={hotelCategory ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setHotelCategory(!hotelCategory)}>Hotel category</h5>
//                         <Collapse isOpen={hotelCategory}>
//                           <div className="collection-collapse-block-content">
//                             <div className="collection-brand-filter">
//                               <ul className="category-list">
//                                 {
//                                   roomCategory.map((value, index) => (
//                                     value.label !== 'All stars' &&
//                                     <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
//                                       <Input checked={selectedCategory.includes(value.value)} onChange={() => { handleCategoryChange(value.value) }} name={value.value} id={value.value} type="checkbox" className="custom-control-input option-btns" />
//                                       <h6 className="m-0 p-0" htmlFor={value.label}>{value.label}</h6>
//                                     </div>
//                                   ))
//                                 }
//                               </ul>
//                             </div>
//                           </div>
//                         </Collapse>
//                       </div>

//                     </div>
//                   </div>
//                 </Col>

//                 <Col className="collection-content" sm='12' md='12' lg="9">
//                   <div className="page-main-content">
//                     <Row>
//                       <Col sm="12">

//                         <div className="d-none d-lg-block d-md-block top-banner-wrapper">
//                           <a href={null}>
//                             <Media src={Menu2.src} className="img-fluid blur-up lazyload" alt="" />
//                           </a>
//                         </div>

//                         <div className="collection-product-wrapper mt-0 mt-lg-4">

//                           <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">

//                             <h5 className="p-0 m-0 d-none d-lg-block" style={{ fontSize: '15px', fontWeight: '500' }}>{!loading ? `Showing ${filteredMainDataset.length} Products` : "loading"}{" "}</h5>

//                             {
//                               searchFilter ?
//                                 <div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
//                                   <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                   {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                 </div>
//                                 :
//                                 <div className="collection-brand-filter align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 d-none d-lg-flex d-md-flex border" style={{ borderRadius: "10px!important" }}>
//                                   <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                   {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                 </div>
//                             }


//                             <div className="col-3 d-none d-lg-block">
//                               <Select  styles={{
//       menu: (provided) => ({
//         ...provided,
//         zIndex: 1100, // Ensures dropdown appears on top
//         position: "absolute",
//       }),
//     }} options={options} onChange={handleSelectChange} />
//                             </div>

//                           </div>

//                         {(allDiscountData.length > 0 || metaDiscountHotel.length > 0) && (
//   <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
//     <ProductSlider allDiscountData={allDiscountData} type={"hotel"} meta={metaDiscountHotel} />
//   </div>
// )}

                                                    

//                           <ul className="product-filter-tags p-0 m-0 my-2">
//                             {
//                               pricefilter &&
//                               <li>
//                                 <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa-regular fa-circle-xmark ml-2"></i> </a>
//                               </li>
//                             }
//                             {
//                               selectedLocations.map((value, i) => (
//                                 <li key={i}>
//                                   <a href={null} className="filter_tag">{value}<i className="fa fa-close" onClick={() => handleLocationchange(value)}></i>
//                                   </a>
//                                 </li>
//                               ))
//                             }
//                             {
//                               selectedCategory.map((value, i) => (
//                                 <li key={i}>
//                                   <a href={null} className="filter_tag">{value} star<i className="fa fa-close" onClick={() => handleCategoryChange(value)}></i>
//                                   </a>
//                                 </li>
//                               ))
//                             }
//                             {
//                               (pricefilter || selectedLocations.length > 0 || selectedCategory.length > 0) &&
//                               <li onClick={() => handleClearAllFilters()}>
//                                 <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                               </li>
//                             }
//                           </ul>

//                           <Row>
//                             {
//                               loading ?
//                                 <div className="row mx-0 mt-4 margin-default mt-4">
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                   <div className="col-xl-3 col-lg-4 col-6">
//                                     <PostLoader />
//                                   </div>
//                                 </div> :
//                                 !loading && filteredMainDataset?.length === 0 ?
//                                   <Col xs="12">
//                                     <div className="my-5">
//                                       <div className="col-sm-12 empty-cart-cls text-center">
//                                       <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-4 mx-auto" />
//                                         <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">Sorry, there are no products available right now.</h4>
//                                         <h4 style={{ fontSize: 15 }}>Please check back later or explore other options.</h4>
//                                       </div>
//                                     </div>
//                                   </Col>
//                                   :
//                                   filteredMainDataset?.map((product, i) => (
//                                     <div className={grid} key={i}>
//                                       <ProductItems product={product} description={product?.HotelDescription} hotelCode={product?.HotelCode} latitude={product?.Latitude} longitude={product?.Longitude} hotelAddress={product?.HotelAddress} provider={product?.provider} productImage={product?.HotelPicture} productstype={'hotels'} title={product?.HotelName} productcurrency={product?.Currency} mrp={product?.TotalRate} rate={product?.SupplierPrice} rating={product?.StarRating} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} hotelSearchCustomerData={hotelSearchCustomerData} childAges={childAges} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} />
//                                     </div>
//                                   ))
//                             }
//                           </Row>
//                         </div>
//                       </Col>
//                     </Row>
//                   </div>
//                 </Col>
//               </Row>
//             </Container>
//           </div>
//                                    <style>
//         {`
//           .yellow-scrollbar::-webkit-scrollbar {
//   width: 8px;
// }

// .yellow-scrollbar::-webkit-scrollbar-thumb {
//   background-color: #ededed;
//   border-radius: 10px;
// }

// .yellow-scrollbar::-webkit-scrollbar-track {
//   background-color: transparent;
// }

// .yellow-scrollbar {
//   scrollbar-width: thin;
//   scrollbar-color: #ededed transparent;
// }
//         `}
//       </style>
//         </section>
//       </CommonLayout>

//     </>
//   )
// }

// export default HotelsMainPage
// import moment from 'moment';
// import Head from 'next/head';
// import { useContext, useEffect, useState } from 'react';
// import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
// import { DateRange } from 'react-date-range';
// import Select from 'react-select';
// import CustomCalendar from '../../../components/calender/CustomCalendar';

// import { LoadScript } from '@react-google-maps/api';
// import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

// import { AppContext } from '../../_app';
// import { getHotelDataUpdated, loadHotelsData } from '../../../AxiosCalls/HotelServices/hotelServices';

// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import PaxIncrementorComponent from '../../../components/common/PaxIncrementor/PaxIncrementorComponent';
// import ModalBase from '../../../components/common/Modals/ModalBase';
// import ToastMessage from '../../../components/Notification/ToastMessage';

// import PostLoader from '../../skeleton/PostLoader';

// import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/hotelBanner.jpg";

// import SearchIcon from '@mui/icons-material/Search';
// import CloseIcon from '@mui/icons-material/Close';

// import 'react-calendar/dist/Calendar.css';
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
// import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';

// import cookie from 'cookie';
// import { useRouter } from 'next/router';
// import ProductSlider from '../productImageSlider';
// import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
// import RoomAllocation from '../../../components/hotel/RoomAllocation';

// const HotelsMainPage = () => {
//     const [locationDataSet, setLocationDataSet] = useState(null);
//     const [locationDataSetReset, setLocationDataSetReset] = useState(null);
//     const [paxRoomDetails, setPaxRoomDetails] = useState({
//         "totalRooms": 1,
//         "totalAdults": 1,
//         "totalChildren": 0,
//     })
//     const [content, setContent] = useState([]);
//     const router = useRouter();

//     let checkinDate = new Date();
//     let checkOutDate = new Date();
//     checkOutDate.setDate(checkinDate.getDate() + 1);

//     const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
//     const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

//     const { userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

//     const adultChildMinMax = {
//         minAdult: 50,
//         maxAdult: 50,
//         minChild: 50,
//         maxChild: 50,
//         adultAvl: true,
//         childAvl: true
//     }

//     const roomCounts = [
//         { value: 1, label: '1' },
//         { value: 2, label: '2' },
//         { value: 3, label: '3' },
//         { value: 4, label: '4' },
//         { value: 5, label: '5' },
//         { value: 6, label: '6' },
//         { value: 7, label: '7' },
//         { value: 8, label: '8' },
//         { value: 9, label: '9' },
//         { value: 10, label: '10' }
//     ];

//     const roomCategory = [
//         { value: 1, label: '1 Star' },
//         { value: 2, label: '2 star' },
//         { value: 3, label: '3 star' },
//         { value: 4, label: '4 star' },
//         { value: 5, label: '5 star' }
//     ];

//     const [loading, setLoading] = useState(true);
//     const [hotelCategory, setHotelCategory] = useState(true);

//     const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

//     const [hotelMainDataset, setHotelMainDataset] = useState([]);
//     const [filteredMainDataset, setFilteredMainDataset] = useState([]);

//     const [selectedLocations, setSelectedLocations] = useState([])
//     const [selectedCategory, setSelectedCategory] = useState([])
//     const [filterCheckboxes, setFilterCheckboxes] = useState([]);
//     const [filteringValue, setFilteringValue] = useState([]);

//     const [userSearchQuery, setUserSearchQuery] = useState("");
//     const [hotelLocations, setHotelLocations] = useState([]);
//     const [googleLocation, setGoogleLocation] = useState("search");
//     const [childAges, setChildAges] = useState([]);
//     const [openAdultChildModal, setOpenAdultChildModal] = useState(false);
//     const [openDate, setOpenDate] = useState(false);
//     const [locationfilterOpen, setlocationfilterOpen] = useState(true);
//     const [allDiscountData, setAllDiscountData] = useState([])
//     const [openRoomModel, setOpenRoomModel] = useState(false)

//     const [hotelSearchCustomerData, setHotelSearchCustomerData] = useState({
//         CheckInDate: nextWeekDate,
//         CheckOutDate: nextWeekDateCheckout,
//         NoOfNights: 1,
//         NoOfRooms: 1,
//         NoOfAdults: 1,
//         NoOfChild: 0,
//         City: baseLocation?.address_full,
//         dataSet: JSON.stringify({ locationDataSet }),
//         Country: baseLocation?.address_full,
//         StarRate: 0,
//         RoomRequest: [{
//             indexValue: 0,
//             roomType: "Single",
//             NoOfAdults: 1,
//             NoOfChild: 0,
//             ChildAge: []
//         }]
//     });

//     const [date, setDate] = useState([{
//         startDate: new Date(),
//         endDate: new Date(),
//         key: "selection",
//     }]);
//     let baseLocationData;
//     useEffect(() => {
//         // Initialize with default location
//         baseLocationData = {
//             latitude: '6.9271',
//             longitude: '79.8612',
//             locationDescription: 'Colombo, Sri lanka'
//         };

//         // Check if cookies exist in browser
//         try {
//             if (typeof document !== 'undefined') {
//                 const cookies = document.cookie;
//                 if (cookies.includes('userLastLocation')) {
//                     const cookieValue = decodeURIComponent(
//                         cookies.split('; ').find(row => row.startsWith('userLastLocation='))?.split('=')[1] || ''
//                     );
//                     if (cookieValue) {
//                         const userLastLocation = JSON.parse(cookieValue);
//                         baseLocationData = {
//                             latitude: userLastLocation.latitude.toString(),
//                             longitude: userLastLocation.longtitude.toString(),
//                             locationDescription: userLastLocation.address_full,
//                             address_components: userLastLocation.address_components
//                         };
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Failed to parse userLastLocation cookie:', error);
//         }

//         setLocationDataSet(baseLocationData);
//         setLocationDataSetReset(baseLocationData)

//         // Update hotel search data with the location
//         setHotelSearchCustomerData(prev => ({
//             ...prev,
//             City: baseLocationData.locationDescription,
//             Country: baseLocationData.locationDescription,
//             dataSet: JSON.stringify(baseLocationData)
//         }));

//     }, []);

//     const [metaDiscountHotel, setMetaDiscountHotel] = useState([])

//     useEffect(() => {
//         if (locationDataSet) {
//             const initialSearch = async () => {
//                 setLoading(true);
//                 try {
//                     const customerId = userId ?? 624;

//                     const searchParams = {
//                         ...hotelSearchCustomerData,
//                         Country: hotelSearchCustomerData.City,
//                         longitude: locationDataSet?.longitude,
//                         latitude: locationDataSet?.latitude,
//                         index: 1,
//                         length: 100,
//                     };
//                     console.log("Initial chamod", searchParams);
//                     // Load first set of hotels (index 1)
//                     const initialResult = await loadHotelsData(searchParams, customerId);
//                     console.log("Initial result", initialResult);
//                     const metaDiscount = initialResult?.hotelMetaDiscount || [];
//                     setMetaDiscountHotel(metaDiscount)
//                     const totalHotels = initialResult?.totalHotels || 0;
//                     const allHotels = [...(initialResult?.hoteldataset || [])];
//                     // Update state with first batch
//                     setContent(allHotels);
//                     updateData(allHotels);
//                     console.log(`Total hotels found`, initialResult);
//                     // Get updated hotel data with sequential loading
//                     const response = await getHotelDataUpdateData(hotelSearchCustomerData, userId || 624);
//                     console.log("Final result with all hotels");
//                     if (response && response !== 'Something went wrong !' && response !== '(Internal Server Error)') {
//                         setContent(response);
//                         updateData(response);
//                     } else {
//                         setContent([]);
//                         updateData([]);
//                     }
//                 } catch (error) {
//                     console.error("Error fetching hotel data:", error);
//                     setContent([]);
//                     updateData([]);
//                 } finally {
//                     setLoading(false);
//                 }
//             };
//             initialSearch();
//         }
//     }, [locationDataSet]);

//     const getHotelDataUpdateData = async (data, userId) => {
//         try {
//             console.log("Searching hotel data for user:", data);

//             const customerId = userId ?? 624;

//             const searchParams = {
//                 ...data,
//                 Country: data.City,
//                 index: 1,
//                 length: 100,
//             };

//             // Load first batch (index 1)
//             const initialResult = await loadHotelsData(searchParams, customerId);

//             const totalHotels = initialResult?.totalHotels || 0;
//             const allHotels = [...(initialResult?.hoteldataset || [])];
//             const max_request_count = initialResult?.max_request_count || 1;

//             console.log(`Total hotels found: ${totalHotels}`);
//             console.log(`Max request count: ${max_request_count}`);

//             // Update state with first batch
//             setContent(allHotels);
//             updateData(allHotels);

//             // Sequential loading for remaining batches (index 2 to max_request_count)
//             if (max_request_count > 1) {
//                 for (let index = 2; index <= max_request_count; index++) {
//                     try {
//                         console.log(`Loading hotels for index: 234234234234`, index);
//                         const paginatedParams = {
//                             ...searchParams,
//                             index: index
//                         };
//                         const response = await loadHotelsData(paginatedParams, customerId);
//                         if (response?.hoteldataset?.length) {
//                             allHotels.push(...response.hoteldataset);
//                             // Update state after each batch
//                             setContent([...allHotels]); // Create new array reference
//                             updateData([...allHotels]);
//                             console.log(`✅ Loaded ${response.hoteldataset.length} hotels for index ${index}. Total so far: ${allHotels.length}`);
//                         } else {
//                             console.log(`⚠️ No hotels found for index ${index}`);
//                         }
//                     } catch (error) {
//                         console.error(`❌ Error loading hotels for index ${index}:`, error);
//                         // Continue with next index even if one fails
//                     }
//                 }
//             }

//             console.log(`✅ Total hotels fetched: ${allHotels.length}`);
//             return allHotels;
//         } catch (error) {
//             console.error("❌ Error loading hotel data:", error);
//             return [];
//         }
//     };

//     const getHotelcityLocations = (response) => {
//         let cityArr = [];
//         response !== "Something went wrong !" &&
//             response.map((value) => {
//                 try {
//                     let cityValue = value?.City?.toLowerCase()?.trim();
//                     if (cityValue == '' || cityValue == null || cityValue == undefined) {
//                     } else {
//                         if (!cityArr.includes(cityValue)) {
//                             cityArr.push(cityValue)
//                         }
//                     }
//                 } catch (error) {
//                     cityArr = []
//                 }
//             })
//         setHotelLocations(cityArr.toSorted())
//     }

//     const handleLocationchange = (value) => { handleOnChange(value, selectedLocations, setSelectedLocations, 'City') }
//     const handleCategoryChange = (value) => { handleOnChange(value, selectedCategory, setSelectedCategory, 'StarRating') }

//     const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
//         console.log(value, selectedItems, setSelectedItems, type, "ratessssssssssssssssssssssss")
//         const index = selectedItems.indexOf(value);
//         let updatedSelectedItems;
//         if (index === -1) {
//             updatedSelectedItems = [value, ...selectedItems];
//         } else {
//             updatedSelectedItems = selectedItems.filter(item => item !== value);
//         }
//         setSelectedItems(updatedSelectedItems);
//         const dataset = { value, type };
//         let sampledataset;
//         if (index === -1) {
//             sampledataset = [...filterCheckboxes, dataset];
//         } else {
//             sampledataset = filterCheckboxes.filter(item => !(item.value === value && item.type === type));
//         }
//         let result = []
//         sampledataset.map((value) => {
//             if (!result.includes(value.type)) {
//                 result.push(value.type)
//             }
//         })
//         setFilteringValue(result);
//         removeDuplicates(sampledataset);
//     }

//     // price filter
//     const [priceFilterOpen, setpriceFilterOpen] = useState(true);
//     const [pricefilter, setpricefilter] = useState(false);

//     const [tempCurrency, setTempCurrency] = useState(baseCurrencyValue?.base || 'USD');


//     const [minprice, setminprice] = useState('');
//     const [maxprice, setmaxprice] = useState('');

//     const [pricerange, setpricerange] = useState([]);
//     const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);

//     const [userMinMaxPrice, setUserMinMaxPrice] = useState({
//         min: minprice,
//         max: maxprice
//     })

//     // sorting..
//     const [priceSorting, setPriceSorting] = useState(true);

//     const [sortingFilter, setSortingFilters] = useState({
//         pricefilter: 'default',
//         distanceFilter: 'default'
//     });

//     // 1. Fix the createPriceFilterButtons function
//     const createPriceFilterButtons = async (dataset) => {
//         if (dataset.length > 0) {
//             // Ensure baseCurrencyValue is available
//             if (!baseCurrencyValue || !baseCurrencyValue.base) {
//                 console.warn('Base currency not available yet');
//                 return;
//             }

//             let filtered = dataset.toSorted((a, b) => {
//                 return CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue) -
//                     CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue);
//             });

//             let result = createPriceSteps(
//                 Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0].Currency, filtered[0].TotalRate, baseCurrencyValue)),
//                 Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1].Currency, filtered[filtered.length - 1].TotalRate, baseCurrencyValue))
//             );

//             setminprice(result[0].start);
//             setmaxprice(result[result.length - 1].end);
//             setpricerange([result[0].start, result[result.length - 1].end]);

//             console.log("Price filter buttons", result);
//             setFilterByPriceButtons(result);
//             setUserMinMaxPrice({
//                 min: result[0].start,
//                 max: result[result.length - 1].end
//             });

//             // Set tempCurrency immediately when creating price buttons
//             setTempCurrency(baseCurrencyValue.base);
//         } else {
//             setFilterByPriceButtons([]);
//         }
//     };
//     const handlePriceFilterChange = async (value) => {
//         setminprice(value.start);
//         setmaxprice(value.end);
//         setpricefilter(true);

//         // Update user min/max price to match selected range
//         setUserMinMaxPrice({
//             min: value.start,
//             max: value.end
//         });
//     };

//     const handleSearchPriceRange = () => {
//         if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
//             ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
//         } else {
//             setminprice(userMinMaxPrice.min);
//             setmaxprice(userMinMaxPrice.max);
//         }
//     }

//     const updateData = async (dataset) => {
//         console.log("Dataset", dataset);
//         setHotelMainDataset(dataset);
//         setFilteredMainDataset(dataset);
//         getHotelcityLocations(dataset);

//         // Only create price filter buttons if we have baseCurrencyValue
//         if (baseCurrencyValue && baseCurrencyValue.base) {
//             await createPriceFilterButtons(dataset);
//         }
//     };

//     useEffect(() => {
//         if (baseCurrencyValue && baseCurrencyValue.base && hotelMainDataset.length > 0) {
//             createPriceFilterButtons(hotelMainDataset);
//         }
//     }, [baseCurrencyValue]);


//     const getHotelData = async (data) => {
//         console.log("Hotel data isss", data)
//         setLoading(true);

//         const customerId = userId ?? 624;

//         const searchParams = {
//             ...hotelSearchCustomerData,
//             Country: hotelSearchCustomerData.City,
//             longitude: locationDataSet?.longitude,
//             latitude: locationDataSet?.latitude,
//             index: 1,
//             length: 100,
//         };


//         const initialResult = await loadHotelsData(searchParams, customerId);

//         const allHotels = [...(initialResult?.hoteldataset || [])];

//         setContent(allHotels);
//         updateData(allHotels);
//         setLoading(false);


//         await getHotelDataUpdateData(data, userId || 624).then((response) => {
//             if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//                 updateData([]);
//                 setLoading(false);
//             } else {
//                 updateData(response || []);
//                 setContent(response || []);
//                 setLoading(false);
//             }
//         })
//     }

//     const removeDuplicates = (arr) => {
//         const unique = [];
//         const items = new Set();
//         arr.forEach(item => {
//             const key = JSON.stringify(item);
//             if (!items.has(key)) {
//                 items.add(key);
//                 unique.push(item);
//             }
//         });
//         setFilterCheckboxes(unique);
//     };

//     const handleChange = (value) => {
//         const query = value;
//         setUserSearchQuery(query);
//         let filtered = hotelMainDataset.filter((value) => {
//             return value.HotelName.toLowerCase().trim().includes(query.toLowerCase().trim())
//         })
//         const filteredData = getFilteredProducts(filteringValue, filteringValue[0], filtered);
//         setFilteredMainDataset(filteredData);
//     };

//     const getFilteredProducts = (filters, dynamicValue, dataset) => {
//         let filtered = [];

//         if (filters.length === 0) {
//             return getPricefilters(dataset);
//         } else {
//             // Use Set to track unique hotel codes to prevent duplicates
//             const addedHotels = new Set();

//             filterCheckboxes.forEach((filterItem) => {
//                 dataset.forEach((data) => {
//                     try {
//                         let shouldInclude = false;

//                         if (dynamicValue === 'City') {
//                             shouldInclude = data?.[dynamicValue]?.trim().toLowerCase() === filterItem.value.trim().toLowerCase();
//                         } else {
//                             shouldInclude = data?.[dynamicValue] == filterItem?.value;
//                         }

//                         // Only add if it matches the filter and hasn't been added yet
//                         if (shouldInclude && !addedHotels.has(data.HotelCode)) {
//                             filtered.push(data);
//                             addedHotels.add(data.HotelCode);
//                         }
//                     } catch (error) {
//                         console.error('Error in filtering:', error);
//                     }
//                 });
//             });
//         }

//         let remainingFilters = filters.slice(1);
//         return getFilteredProducts(remainingFilters, remainingFilters[0], filtered);
//     };


//     const getPricefilters = (dataset) => {
//         // Remove duplicates first using HotelCode as unique identifier
//         const uniqueDataset = dataset.filter((item, index, self) =>
//             index === self.findIndex(hotel => hotel.HotelCode === item.HotelCode)
//         );

//         console.log(minprice, "Min price data");

//         // Ensure we have valid price range
//         if (minprice === '' || maxprice === '' || !baseCurrencyValue) {
//             return uniqueDataset;
//         }

//         // Filter by price range
//         let result = uniqueDataset.filter((value) => {
//             let price = CurrencyConverterOnlyRateWithoutDecimal(value.Currency, value.TotalRate, baseCurrencyValue);
//             return Number(minprice) <= Number(price) && Number(price) <= Number(maxprice);
//         });

//         let sortedResult = [];

//         if (sortingFilter.pricefilter === "default") {
//             sortedResult = result;
//         } else if (sortingFilter.pricefilter === "lowtohigh") {
//             sortedResult = result.sort((a, b) => {
//                 const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//                 const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//                 return priceA - priceB;
//             });
//         } else if (sortingFilter.pricefilter === "hightolow") {
//             sortedResult = result.sort((a, b) => {
//                 const priceA = Number(CurrencyConverterOnlyRateWithoutDecimal(a.Currency, a.TotalRate, baseCurrencyValue));
//                 const priceB = Number(CurrencyConverterOnlyRateWithoutDecimal(b.Currency, b.TotalRate, baseCurrencyValue));
//                 return priceB - priceA;
//             });
//         }

//         return sortedResult;
//     };

//     const startFiltering = () => {
//         const filteredData = getFilteredProducts(filteringValue, filteringValue[0], hotelMainDataset);
//         setFilteredMainDataset(filteredData);
//     };

//     const handleValidateAdultChildCount = (value) => {
//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             NoOfAdults: value.adult,
//             NoOfChild: value.child,
//         })
//         setChildAges(value.childAges);
//     }

//     const handleOnGoogleLocationChange = (value) => {
//         setIsFocused(false)
//         setGoogleLocation(value['label'].slice(0, 25) + '...')
//         geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
//             geocodeByLatLng({ lat: lat, lng: lng }).then(results => {
//                 console.log("Google location data", results)
//                 for (var i = 0; i < results[0].address_components.length; i++) {
//                     for (var b = 0; b < results[0].address_components[i].types.length; b++) {
//                         if ((results[0].address_components[i].types.includes("locality") || results[0].address_components[i].types.includes("locality"))) {
//                             setHotelSearchCustomerData({
//                                 ...hotelSearchCustomerData,
//                                 City: results[0].address_components[i].short_name,
//                                 Country: results[0].address_components[i].long_name,
//                                 dataSet: JSON.stringify({
//                                     latitude: lat, longitude: lng,
//                                     locationDescription: results[0].address_components[i].long_name,
//                                     ...results[0],
//                                 })
//                             })
//                             break;
//                         }
//                     }
//                 }
//             }).catch((error) => {
//                 // console.error(error)
//             }
//             );
//         }).catch((error) => {
//             // console.error(error);
//         })
//     }

//     const handleOnDatePicker = (value) => {
//         console.log("Selected date range", value);
//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             CheckInDate: moment(value[0].startDate).format('DD/MM/YYYY'),
//             CheckOutDate: moment(value[0].endDate).format('DD/MM/YYYY'),
//         });
//         setDate(value);
//         // setOpenDate(!openDate);
//     }

//     const handleRoomCount = (e) => {
//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             NoOfRooms: e.value
//         });
//     }

//     const handleStarRate = (e) => {
//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             StarRate: e.value
//         });
//     }

//     useEffect(() => {
//         if (!loading && baseCurrencyValue) {
//             startFiltering();
//         }
//     }, [filterCheckboxes, minprice, maxprice, loading, sortingFilter.pricefilter, baseCurrencyValue]);

//     const handleClearAllFilters = () => {
//         setSelectedCategory([]);
//         setSelectedLocations([]);
//         setFilteredMainDataset(hotelMainDataset);
//         clearPriceFilter();
//     }

//     const clearPriceFilter = () => {
//         if (pricerange.length > 0) {
//             setminprice(pricerange[0]);
//             setmaxprice(pricerange[1]);
//             setUserMinMaxPrice({
//                 min: pricerange[0],
//                 max: pricerange[1]
//             });
//         }
//         setpricefilter(false);
//         setFilteringValue([]);
//     };

//     const [openSideBarStatus, setopenSideBarStatus] = useState(false);
//     const [searchFilter, setSearchfilter] = useState(false);

//     const openSubFilter = () => {
//         setopenSideBarStatus(true);
//     }

//     const closeSubFilter = () => {
//         setopenSideBarStatus(false);
//     }

//     const openSearchFilter = () => {
//         setSearchfilter(true);
//     }

//     const closeSearchFilter = () => {
//         setSearchfilter(false);
//         handleChange('');
//     }

//     const canonicalUrl = router.asPath;

//     const options = [
//         { value: 'default', label: 'Default' },
//         { value: 'lowtohigh', label: 'Price Low to High' },
//         { value: 'hightolow', label: 'Price High to Low' }
//     ];

//     const handleSelectChange = (selectedOption) => {
//         setSortingFilters({ ...sortingFilter, pricefilter: selectedOption.value });
//     };

//     useEffect(() => {

//         const discountData = [];
//         content.forEach(item => {
//             if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
//                 discountData.push({
//                     discount: item.discount,
//                     product: item
//                 });
//             }
//         });

//         console.log("Discount data", discountData)

//         setAllDiscountData(discountData);


//         setLoading(false);
//         updateData(content);
//     }, [content]);

//     const handleClearHotelSearch = async () => {
//         const checkIn = moment().add(7, 'days').format('DD/MM/YYYY');
//         const checkout = moment().add(8, 'days').format('DD/MM/YYYY');

//         setHotelSearchCustomerData({
//             CheckInDate: checkIn,
//             CheckOutDate: checkout,
//             NoOfNights: 1,
//             NoOfRooms: 1,
//             NoOfAdults: 1,
//             NoOfChild: 0,
//             City: baseLocation?.address_full,
//             dataSet: JSON.stringify({ locationDataSetReset }),
//             Country: baseLocation?.address_full,
//             StarRate: 0,
//             RoomRequest: [{
//                 indexValue: 0,
//                 roomType: "Single",
//                 NoOfAdults: 1,
//                 NoOfChild: 0,
//                 ChildAge: []
//             }]
//         });

//         setPaxRoomDetails({
//             "totalRooms": 1,
//             "totalAdults": 1,
//             "totalChildren": 0,
//         })

//         setLoading(true);

//         const customerId = userId ?? 624;

//         // const searchParams = {
//         //     ...hotelSearchCustomerData,
//         //     Country: hotelSearchCustomerData.City,
//         //     offset: 0,
//         //     length: 100,
//         // };

//         const searchParams = {
//             CheckInDate: checkIn,
//             CheckOutDate: checkout,
//             NoOfNights: 1,
//             NoOfRooms: 1,
//             NoOfAdults: 1,
//             NoOfChild: 0,
//             City: baseLocation?.address_full,
//             dataSet: JSON.stringify({ locationDataSetReset }),
//             Country: baseLocation?.address_full,
//             latitude: baseLocation?.latitude,
//             longitude: baseLocation?.longitude,
//             StarRate: 0,
//             offset: 0,
//             length: 100,
//             RoomRequest: [{
//                 indexValue: 0,
//                 roomType: "Single",
//                 NoOfAdults: 1,
//                 NoOfChild: 0,
//                 ChildAge: []
//             }]
//         }


//         // console.log("Initial result1111",searchParams)
//         const initialResult = await loadHotelsData(searchParams, customerId);
//         // console.log("Initial result", initialResult)
//         const allHotels = [...(initialResult?.hoteldataset || [])];
//         setContent(allHotels);
//         updateData(allHotels);
//         setLoading(false);
//         setGoogleLocation(baseLocation?.address_full)
//         await getHotelDataUpdateData(searchParams, userId).then((response) => {
//             if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
//                 updateData([]);
//                 setLoading(false);
//             } else {
//                 updateData(response || []);
//                 setContent(response || []);
//                 setLoading(false);
//             }
//         })
//     }

//     const handleDateSelect = (start, end) => {
//         console.log("Selected date isssss", start, end);

//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             CheckInDate: start === null ? moment().add(7, 'days').format('DD/MM/YYYY') : moment(start).format('DD/MM/YYYY'),
//             CheckOutDate: end === null ? moment().add(8, 'days').format('DD/MM/YYYY') : moment(end).format('DD/MM/YYYY'),
//         });
//         setDate([{
//             startDate: start === null ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : start.toISOString(),
//             endDate: end === null ? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString() : end.toISOString(),
//             key: "selection"
//         }]);


//     }

//     const customStyles = `
//   .rdrYearPicker,
//   .rdrMonthAndYearWrapper .rdrMonthAndYearPickers .rdrYearPicker {
//     display: none !important;
//   }
// `;
//     const [isFocused, setIsFocused] = useState(false);


//     const handleRoomAllocation = (data) => {
//         console.log("Room allocation data", data);

//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             NoOfAdults: data?.roomDetails?.adults || 1,
//             NoOfChild: data?.roomDetails?.children,
//         })
//         setPaxRoomDetails({
//             ...paxRoomDetails,
//             "totalRooms": data?.totalRooms || 1,
//             "totalAdults": data?.totalAdults || 1,
//             "totalChildren": data?.totalChildren || 0,
//         })
//         // setChildAges(value.childAges);

//         setHotelSearchCustomerData({
//             ...hotelSearchCustomerData,
//             NoOfRooms: data?.roomCounts?.Single
//         });

//     }

//     const handleTogle = () => {
//         setOpenRoomModel(!openRoomModel);
//     }

//     const [screenWidth, setScreenWidth] = useState(0);

//     useEffect(() => {
//         // Set initial width
//         setScreenWidth(window.innerWidth);

//         // Handle resize
//         const handleResize = () => {
//             setScreenWidth(window.innerWidth);
//         };

//         window.addEventListener('resize', handleResize);

//         // Cleanup
//         return () => window.removeEventListener('resize', handleResize);
//     }, []);
//     return (
//         <>

//             <Head>
//                 <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//                 <title>Aahaas - Hotels</title>
//                 <meta name="description" content="Discover a variety of hotels with Aahaas, whether you're looking for luxurious retreats or affordable stays. Our wide range of options ensures you can rest in comfort after a day of exploration. Book your perfect accommodation and start your journey in style." /> {/* Set meta description if needed */}
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
//                                     "name": "Hotels",
//                                     "item": "https://www.aahaas.com/hotels"
//                                 }
//                             ]
//                         }),
//                     }}
//                 />
//             </Head>

//             <CommonLayout title="hotel" parent="home" showMenuIcon={true} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}>
//                 <section className="section-b-space ratio_asos mt-lg-5">
//                     <div className="collection-wrapper">
//                         <Container>
//                             <Row>

//                                 <Col
//                                     sm="3"
//                                     className="collection-filter yellow-scrollbar"
//                                     id="filter"
//                                     style={{
//                                         display: screenWidth < 1024
//                                             ? (openSideBarStatus ? "block" : "none")  // Mobile: show only when sidebar is open
//                                             : "block",
//                                         left: openSideBarStatus ? "0px" : "",
//                                         position: 'sticky',
//                                         top: '20px',
//                                         alignSelf: 'flex-start',
//                                         maxHeight: '100vh',
//                                         overflowY: 'auto',
//                                     }}
//                                 >

//                                     <div className="collection-filter-block px-lg-4 pe-5">

//                                         <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
//                                             <span className="filter-back">
//                                                 <i className="fa fa-angle-left" ></i> back
//                                             </span>
//                                         </div>
//                                         <div className="collection-collapse-block">
//                                             {/* Location Section */}
//                                             <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                                                 <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
//                                                     <i className="fa fa-map-marker me-2"></i>Location
//                                                 </h5>
//                                                 <div className="location-input-wrapper">
//                                                     <GooglePlacesAutocomplete
//                                                         apiKey={groupApiCode}
//                                                         selectProps={{
//                                                             value: googleLocation,
//                                                             placeholder: isFocused ? "" : googleLocation === 'search' ? 'Search for a location...' : googleLocation,
//                                                             onChange: (e) => handleOnGoogleLocationChange(e),
//                                                             onClick: (e) => {
//                                                                 setIsFocused(true);
//                                                             },
//                                                             onFocus: () => setIsFocused(true),
//                                                             onBlur: () => setIsFocused(false),
//                                                             styles: {
//                                                                 control: (provided) => ({
//                                                                     ...provided,
//                                                                     borderRadius: '8px',
//                                                                     border: '1px solid #e0e0e0',
//                                                                     boxShadow: 'none',
//                                                                     '&:hover': {
//                                                                         border: '1px solid #007bff'
//                                                                     }
//                                                                 }),
//                                                                 placeholder: (provided) => ({
//                                                                     ...provided,
//                                                                     color: '#6c757d'
//                                                                 })
//                                                             }
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </div>

//                                             {/* Check-In / Check-Out Section */}
//                                             <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                                                 <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
//                                                     <i className="fa fa-calendar me-2"></i>Check-In / Check-Out
//                                                 </h5>
//                                                 <div className="date-selection-wrapper">
//                                                     <div className='hotel-sidebar-filters d-flex align-items-center justify-content-between p-3 border rounded'
//                                                         style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
//                                                         onClick={() => setOpenDate(!openDate)}>
//                                                         <div className="d-flex align-items-center">
//                                                             <div className="text-center me-3">
//                                                                 <small className="text-muted d-block">Check-in</small>
//                                                                 <small>{hotelSearchCustomerData.CheckInDate}</small>
//                                                             </div>
//                                                             <div className="mx-2">
//                                                                 <i className="fa fa-arrow-right text-primary"></i>
//                                                             </div>
//                                                             <div className="text-center">
//                                                                 <small className="text-muted d-block">Check-out</small>
//                                                                 <small>{hotelSearchCustomerData.CheckOutDate}</small>
//                                                             </div>
//                                                         </div>
//                                                         {/* <i className="fa fa-chevron-down text-muted"></i> */}
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Room and Pax Section */}
//                                             <div className="collection-collapse-block hotel-sidebar-filters-sub">
//                                                 <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">
//                                                     <i className="fa fa-users me-2"></i>Rooms & Guests
//                                                 </h5>
//                                                 <div className="room-pax-info mb-3">
//                                                     <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
//                                                         <div>
//                                                             <small className="text-muted d-block">Rooms</small>
//                                                             <strong>{paxRoomDetails.totalRooms}</strong>
//                                                         </div>
//                                                         <div>
//                                                             <small className="text-muted d-block">Adults</small>
//                                                             <strong>{paxRoomDetails.totalAdults}</strong>
//                                                         </div>
//                                                         <div>
//                                                             <small className="text-muted d-block">Children</small>
//                                                             <strong>{paxRoomDetails.totalChildren}</strong>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <button
//                                                     className='btn btn-outline-primary btn-sm w-100'
//                                                     onClick={() => { setOpenRoomModel(true) }}
//                                                 >
//                                                     <i className="fa fa-edit me-2"></i>Edit Selection
//                                                 </button>
//                                             </div>

//                                             {/* Action Buttons */}
//                                             <div className="action-buttons-wrapper mt-4">
//                                                 <button
//                                                     className='btn btn-primary btn-sm w-100 mb-3'
//                                                     onClick={() => getHotelData(hotelSearchCustomerData)}
//                                                     style={{
//                                                         padding: '12px 16px',
//                                                         fontSize: '14px',
//                                                         fontWeight: '500',
//                                                         // borderRadius: '8px'
//                                                     }}
//                                                 >
//                                                     <i className="fa fa-search me-2"></i>Search Hotels
//                                                 </button>
//                                                 <button
//                                                     className='btn btn-outline-secondary btn-sm w-100'
//                                                     onClick={() => handleClearHotelSearch(hotelSearchCustomerData)}
//                                                     style={{
//                                                         padding: '10px 16px',
//                                                         fontSize: '14px',
//                                                         // borderRadius: '8px'
//                                                     }}
//                                                 >
//                                                     <i className="fa fa-refresh me-2"></i>Reset Search
//                                                 </button>
//                                             </div>
//                                         </div>










//                                     </div>

//                                     <div className="collection-filter-block px-lg-4 pe-5">

//                                         <ModalBase isOpen={openAdultChildModal} title={'Select Number of Pax'} toggle={() => { setOpenAdultChildModal(false) }} size="lg">
//                                             <PaxIncrementorComponent
//                                                 open={openAdultChildModal}
//                                                 adultCount={parseInt(hotelSearchCustomerData.NoOfAdults)}
//                                                 toggle={() => { setOpenAdultChildModal(false) }}
//                                                 childCount={parseInt(hotelSearchCustomerData.NoOfChild)}
//                                                 adultChildMinMax={adultChildMinMax}
//                                                 //  childAgesDynamic={customerDetails.childAges}
//                                                 addPaxPaxIncrement={handleValidateAdultChildCount} >
//                                             </PaxIncrementorComponent>
//                                         </ModalBase>

//                                         <ModalBase isOpen={openRoomModel} title={'Select Room And Pax Count'} toggle={() => { setOpenRoomModel(false) }} size="lg">
//                                             <RoomAllocation handleRoomAllocation={handleRoomAllocation} handleTogle={handleTogle} />
//                                         </ModalBase>


//                                         <ModalBase isOpen={openDate} title={'Select Date '} toggle={() => { setOpenDate(!openDate) }} size="l">
//                                             <div style={{ width: '100%', height: '100%' }} className="d-flex justify-content-center align-items-center flex-column">

//                                                 <>
//                                                     <style>{customStyles}</style>
//                                                     <CustomCalendar handleDateSelect={handleDateSelect} selectedDate={date} />

//                                                 </>

//                                             </div>

//                                         </ModalBase>

//                                         <div className="collection-collapse-block">

//                                             <div className="collection-collapse-block">
//                                                 <h5 style={{ fontWeight: '500' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
//                                                 <Collapse isOpen={priceFilterOpen}>
//                                                     <div className="collection-collapse-block-content">
//                                                         <div className="collection-brand-filter">
//                                                             <ul className="category-list">
//                                                                 {
//                                                                     filterByPriceButtons?.map((value, key) => (
//                                                                         <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//                                                                             <Input
//                                                                                 checked={value.start === minprice && value.end === maxprice}
//                                                                                 onChange={() => handlePriceFilterChange(value)}
//                                                                                 name={value}
//                                                                                 id={value}
//                                                                                 type="radio"
//                                                                                 className="custom-control-input option-btns"
//                                                                             />
//                                                                             <h6 className="m-0 p-0" htmlFor={value}>
//                                                                                 {baseCurrencyValue ?
//                                                                                     `${CurrencyConverter(baseCurrencyValue.base, value.start, baseCurrencyValue)} - ${CurrencyConverter(baseCurrencyValue.base, value.end, baseCurrencyValue)}` :
//                                                                                     `${value.start} - ${value.end}`
//                                                                                 }
//                                                                             </h6>
//                                                                         </div>
//                                                                     ))
//                                                                 }
//                                                             </ul>
//                                                         </div>
//                                                     </div>
//                                                     <div className="collection-collapse-block-content">
//                                                         <div className="collection-brand-filter">
//                                                             <div className="d-flex align-items-end align-content-stretch gap-3">
//                                                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                                                     <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
//                                                                     <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Min" value={userMinMaxPrice.min} min={pricerange[0]} max={pricerange[1]} name="min" onChange={(e) => handleMinMaxPrice(e)} />
//                                                                 </div>
//                                                                 <div className="d-flex flex-column align-itmes-end col-4">
//                                                                     <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
//                                                                     <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} placeholder="Max" value={userMinMaxPrice.max} max={pricerange[1]} min={pricerange[0]} name="max" onChange={(e) => handleMinMaxPrice(e)} />
//                                                                 </div>
//                                                                 <div className="ms-auto col-3">
//                                                                     <button className="btn btn-sm btn-solid" style={{ padding: '7px 10px', borderRadius: '5px' }} onClick={handleSearchPriceRange}><SearchIcon /></button>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </Collapse>
//                                             </div>
//                                             <div className="collection-collapse-block open">
//                                                 <h5 style={{ fontWeight: '500' }} className={hotelCategory ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setHotelCategory(!hotelCategory)}>Hotel category</h5>
//                                                 <Collapse isOpen={hotelCategory}>
//                                                     <div className="collection-collapse-block-content">
//                                                         <div className="collection-brand-filter">
//                                                             <ul className="category-list">
//                                                                 {
//                                                                     roomCategory.map((value, index) => (
//                                                                         value.label !== 'All stars' &&
//                                                                         <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
//                                                                             <Input checked={selectedCategory.includes(value.value)} onChange={() => { handleCategoryChange(value.value) }} name={value.value} id={value.value} type="checkbox" className="custom-control-input option-btns" />
//                                                                             <h6 className="m-0 p-0" htmlFor={value.label}>{value.label}</h6>
//                                                                         </div>
//                                                                     ))
//                                                                 }
//                                                             </ul>
//                                                         </div>
//                                                     </div>
//                                                 </Collapse>
//                                             </div>

//                                         </div>
//                                     </div>
//                                 </Col>

//                                 <Col className="collection-content" sm='12' md='12' lg="9">
//                                     <div className="page-main-content">
//                                         <Row>
//                                             <Col sm="12">

//                                                 <div className="d-none d-lg-block d-md-block top-banner-wrapper">
//                                                     <a href={null}>
//                                                         <Media src={Menu2.src} className="img-fluid blur-up lazyload" alt="" />
//                                                     </a>
//                                                 </div>

//                                                 <div className="collection-product-wrapper mt-0 mt-lg-4">

//                                                     <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">

//                                                         <h5 className="p-0 m-0 d-none d-lg-block" style={{ fontSize: '15px', fontWeight: '500' }}>{!loading ? `Showing ${filteredMainDataset.length} Products` : "loading"}{" "}</h5>

//                                                         {
//                                                             searchFilter ?
//                                                                 <div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
//                                                                     <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                                                     {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                                                 </div>
//                                                                 :
//                                                                 <div className="collection-brand-filter align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 d-none d-lg-flex d-md-flex border" style={{ borderRadius: "10px!important" }}>
//                                                                     <input type="text" className="form-control border-0 py-2" value={userSearchQuery} placeholder='Search products..' onChange={(e) => handleChange(e.target.value)} />
//                                                                     {userSearchQuery === '' ? < SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> : <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />}
//                                                                 </div>
//                                                         }


//                                                         <div className="col-3 d-none d-lg-block">
//                                                             <Select styles={{
//                                                                 menu: (provided) => ({
//                                                                     ...provided,
//                                                                     zIndex: 1100, // Ensures dropdown appears on top
//                                                                     position: "absolute",
//                                                                 }),
//                                                             }} options={options} onChange={handleSelectChange} />
//                                                         </div>

//                                                     </div>

//                                                     {(allDiscountData.length > 0 || metaDiscountHotel.length > 0) && (
//                                                         <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
//                                                             <ProductSlider allDiscountData={allDiscountData} type={"hotel"} meta={metaDiscountHotel} />
//                                                         </div>
//                                                     )}



//                                                     <ul className="product-filter-tags p-0 m-0 my-2">
//                                                         {
//                                                             pricefilter &&
//                                                             <li>
//                                                                 <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa-regular fa-circle-xmark ml-2"></i> </a>
//                                                             </li>
//                                                         }
//                                                         {
//                                                             selectedLocations.map((value, i) => (
//                                                                 <li key={i}>
//                                                                     <a href={null} className="filter_tag">{value}<i className="fa fa-close" onClick={() => handleLocationchange(value)}></i>
//                                                                     </a>
//                                                                 </li>
//                                                             ))
//                                                         }
//                                                         {
//                                                             selectedCategory.map((value, i) => (
//                                                                 <li key={i}>
//                                                                     <a href={null} className="filter_tag">{value} star<i className="fa fa-close" onClick={() => handleCategoryChange(value)}></i>
//                                                                     </a>
//                                                                 </li>
//                                                             ))
//                                                         }
//                                                         {
//                                                             (pricefilter || selectedLocations.length > 0 || selectedCategory.length > 0) &&
//                                                             <li onClick={() => handleClearAllFilters()}>
//                                                                 <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                                                             </li>
//                                                         }
//                                                     </ul>

//                                                     <Row>
//                                                         {
//                                                             loading ?
//                                                                 <div className="row mx-0 mt-4 margin-default mt-4">
//                                                                     <div className="col-xl-3 col-lg-4 col-6">
//                                                                         <PostLoader />
//                                                                     </div>
//                                                                     <div className="col-xl-3 col-lg-4 col-6">
//                                                                         <PostLoader />
//                                                                     </div>
//                                                                     <div className="col-xl-3 col-lg-4 col-6">
//                                                                         <PostLoader />
//                                                                     </div>
//                                                                     <div className="col-xl-3 col-lg-4 col-6">
//                                                                         <PostLoader />
//                                                                     </div>
//                                                                 </div> :
//                                                                 !loading && filteredMainDataset?.length === 0 ?
//                                                                     <Col xs="12">
//                                                                         <div className="my-5">
//                                                                             <div className="col-sm-12 empty-cart-cls text-center">
//                                                                                 <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-4 mx-auto" />
//                                                                                 <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">Sorry, there are no products available right now.</h4>
//                                                                                 <h4 style={{ fontSize: 15 }}>Please check back later or explore other options.</h4>
//                                                                             </div>
//                                                                         </div>
//                                                                     </Col>
//                                                                     :
//                                                                     filteredMainDataset?.map((product, i) => (
//                                                                         <div className={grid} key={i}>
//                                                                             <ProductItems product={product} description={product?.HotelDescription} hotelCode={product?.HotelCode} latitude={product?.Latitude} longitude={product?.Longitude} hotelAddress={product?.HotelAddress} provider={product?.provider} productImage={product?.HotelPicture} productstype={'hotels'} title={product?.HotelName} productcurrency={product?.Currency} mrp={product?.TotalRate} rate={product?.SupplierPrice} rating={product?.StarRating} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} hotelSearchCustomerData={hotelSearchCustomerData} childAges={childAges} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} />
//                                                                         </div>
//                                                                     ))
//                                                         }
//                                                     </Row>
//                                                 </div>
//                                             </Col>
//                                         </Row>
//                                     </div>
//                                 </Col>
//                             </Row>
//                         </Container>
//                     </div>
//                     <style>
//                         {`
//           .yellow-scrollbar::-webkit-scrollbar {
//   width: 8px;
// }

// .yellow-scrollbar::-webkit-scrollbar-thumb {
//   background-color: #ededed;
//   border-radius: 10px;
// }

// .yellow-scrollbar::-webkit-scrollbar-track {
//   background-color: transparent;
// }

// .yellow-scrollbar {
//   scrollbar-width: thin;
//   scrollbar-color: #ededed transparent;
// }
//   .hotel-sidebar-filters-sub {
//     margin-bottom: 1.5rem;
//   }
//   .collapse-block-title-hotel {
//     color: #333;
//     margin-bottom: 1rem;
//     font-size: 16px;
//   }
//   .location-input-wrapper {
//     position: relative;
//   }
//   .date-selection-wrapper {
//     margin-top: 0.5rem;
//   }
//   .hotel-sidebar-filters:hover {
//     border-color: #007bff !important;
//     background-color: #f0f8ff !important;
//   }
//   .room-pax-info {
//     font-size: 14px;
//   }
//   .action-buttons-wrapper {
//     border-top: 1px solid #e9ecef;
//     padding-top: 1rem;
//   }
//   .btn-primary {
//     background: linear-gradient(135deg, #fd3943ff 0%, #fd3943ff 100%);
//     border: none;
//     transition: all 0.3s ease;
//   }
//   .btn-primary:hover {
//     transform: translateY(-1px);
//     box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
//   }
//   .btn-outline-primary {
//     border-color: #fd3943ff;
//     color: #fd3943ff;
//     transition: all 0.3s ease;
//   }
//   .btn-outline-primary:hover {
//     background-color: #fd3943ff;
//     border-color: #fd3943ff;
//     color: white;
//   }
//   .btn-outline-secondary {
//     transition: all 0.3s ease;
//   }
//   .btn-outline-secondary:hover {
//     transform: translateY(-1px);
//   }
//   @media (max-width: 768px) {
//     .hotel-sidebar-filters {
//       flex-direction: column !important;
//       gap: 1rem;
//     }
//     .hotel-sidebar-filters .d-flex {
//       flex-direction: column;
//       text-align: center;
//     }
//   }
  
//         `}
//                     </style>
//                 </section>
//             </CommonLayout>

//         </>
//     )
// }

// export default HotelsMainPage