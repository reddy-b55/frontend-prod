
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { Button, Col, Collapse, Container, Input, Media, Row } from "reactstrap";
import axios from "axios";

import { AppContext } from "../../_app";
import { getLifesyleproducts } from "../../../AxiosCalls/LifestyleServices/lifestyleServices";
import Head from 'next/head';

import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import ToastMessage from "../../../components/Notification/ToastMessage";
import PostLoader from "../../skeleton/PostLoader";

import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import Select from 'react-select';

import cookie from 'cookie';
import { useRouter } from "next/router";
import Image from "next/image";
import ProductSlider from "../productImageSlider";

// Constants
const DEFAULT_LOCATION = {
  latitude: '6.9271',
  longitude: '79.8612',
  address_full: 'Colombo, Sri lanka'
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'newArrival', label: 'New Arrivals' },
  { value: 'featured', label: 'Featured' },
  { value: 'priceLH', label: 'Price Low to High' },
  { value: 'priceHL', label: 'Price High to Low' },
  { value: 'distanceLH', label: 'Distance Low to High' },
  { value: 'distanceHL', label: 'Distance High to Low' }
];

const DEFAULT_DISTANCE = 20;
const DEFAULT_OFFSET = 60;

export async function getServerSideProps(context) {
  const { req } = context;
  let cID = context.query.cID || DEFAULT_OFFSET;
  let sortCat = context.query.sortCat || '';

  let baseLocation = { ...DEFAULT_LOCATION };
  let baseLocation2 = { 
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    locationDescription: DEFAULT_LOCATION.address_full,
    address_components: null
  };

  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    try {
      const userLastLocation = JSON.parse(cookies.userLastLocation);
      baseLocation = userLastLocation;
      baseLocation2 = {
        latitude: userLastLocation.latitude.toString(),
        longitude: userLastLocation.longtitude.toString(),
        locationDescription: userLastLocation.address_full,
        address_components: userLastLocation.address_components
      };
    } catch (error) {
      console.error('Failed to parse userLastLocation cookie:', error);
    }
  }

  let response = [];
  try {
    const res = await getLifesyleproducts(0, 0, 0, baseLocation.latitude, baseLocation.longtitude, DEFAULT_DISTANCE, cID, 0, sortCat);
    response = res;
  } catch (error) {
    console.error('Failed to fetch lifestyle products:', error);
  }

  return {
    props: {
      content: response,
      location: baseLocation2
    },
  };
}

// Custom hook for price calculations
const usePriceCalculation = (baseCurrencyValue) => {
  return useCallback((item) => {
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
  }, []);
};

// Custom hook for API calls
const useLifestyleAPI = () => {
  const fetchLifestyleProducts = useCallback(async (params = {}) => {
    const {
      category1 = 0,
      category2 = 0,
      category3 = 0,
      latitude = DEFAULT_LOCATION.latitude,
      longitude = DEFAULT_LOCATION.longitude,
      distance = DEFAULT_DISTANCE,
      offset = DEFAULT_OFFSET,
      additional = 0,
      sortMethod = 'default'
    } = params;

    try {
      const response = await getLifesyleproducts(
        category1, category2, category3, 
        latitude, longitude, distance, 
        offset, additional, sortMethod
      );
      
      if (response === '(Internal Server Error)' || response === 'Something went wrong !') {
        return [];
      }
      return response || [];
    } catch (error) {
      console.error('API call failed:', error);
      return [];
    }
  }, []);

  return { fetchLifestyleProducts };
};

const LifeStyleMainPage = ({ content, location }) => {
  const router = useRouter();
  const canonicalUrl = router.asPath;
  const { baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);
  const { fetchLifestyleProducts } = useLifestyleAPI();
  const calculatePrice = usePriceCalculation(baseCurrencyValue);

  // UI State
  const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');
  const [loading, setLoading] = useState(true);
  const [moreproduct, setSetMoreProducts] = useState(false);
  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [searchFilter, setSearchfilter] = useState(false);

  // Filter States
  const [priceFilterOpen, setpriceFilterOpen] = useState(true);
  const [locationfilterOpen, setlocationfilterOpen] = useState(true);
  const [courseSubFilter, setCourseSubFilter] = useState(true);
  const [pricefilter, setpricefilter] = useState(false);

  // Data States
  const [lifeStyleData, setLifeStyleData] = useState([]);
  const [filteredLifeStyleData, setFilteredLifeStyleData] = useState([]);
  const [courseSubCategory, setCourseSubCategory] = useState([]);
  const [allDiscountData, setAllDiscountData] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);

  // Filter Values
  const [distance, setDistance] = useState(DEFAULT_DISTANCE);
  const [currentOffset, setcurrentOffset] = useState(DEFAULT_OFFSET);
  const [selectedSortMethod, setSelectedSortMethod] = useState('default');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [tempCurrency, setTempCurrency] = useState('');
  const [minprice, setminprice] = useState('');
  const [maxprice, setmaxprice] = useState('');
  const [pricerange, setpricerange] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [filterCheckboxes, setFilterCheckboxes] = useState([]);
  const [googleLocation, setGoogleLocation] = useState('search');
  const [userMinMaxPrice, setUserMinMaxPrice] = useState({ min: '', max: '' });

  // Centralized data fetching function
  const fetchData = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const fetchParams = {
        latitude: baseLocation.latitude,
        longitude: baseLocation.longtitude,
        distance: distance,
        offset: currentOffset,
        sortMethod: selectedSortMethod,
        ...params
      };

      const response = await fetchLifestyleProducts(fetchParams);
      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [baseLocation, distance, currentOffset, selectedSortMethod, fetchLifestyleProducts]);

  // Update data and related states
  const updateData = useCallback(async (data) => {
    setLifeStyleData(data);
    setFilteredLifeStyleData(data);
    
    // Extract locations
    const fetchedLocations = [...new Set(
      data.map(item => item.lifestyle_city.toLowerCase().trim())
        .filter(city => city)
    )].sort();
    setLocations(fetchedLocations);

    // Extract discount data
    const discountData = data
      .filter(item => item.discount)
      .reduce((acc, item) => {
        const exists = acc.some(data => JSON.stringify(data.discount) === JSON.stringify(item.discount));
        if (!exists) {
          acc.push({ discount: item.discount, product: item });
        }
        return acc;
      }, []);
    setAllDiscountData(discountData);

    if (!pricefilter) {
      await createPriceFilters(data);
    }
  }, [pricefilter]);

  // Create price filters
  const createPriceFilters = useCallback(async (dataset) => {
    if (!dataset || dataset.length === 0) {
      setFilterByPriceButtons([]);
      setminprice(0);
      setmaxprice(0);
      setpricerange([0, 0]);
      return;
    }

    const validCurrencies = Object.keys(baseCurrencyValue?.rates || {});
    const baseCurrency = baseCurrencyValue?.base || 'USD';

    const convertCurrency = (currency, amount) => {
      try {
        if (currency === baseCurrency) return Number(amount) || 0;
        if (!validCurrencies.includes(currency)) return Number(amount) || 0;
        return Number(CurrencyConverterOnlyRateWithoutDecimal(currency, amount, baseCurrencyValue)) || 0;
      } catch (error) {
        return Number(amount) || 0;
      }
    };

    const itemsWithPrices = dataset
      .map(item => {
        const price = calculatePrice(item);
        const currency = item.currency || baseCurrency;
        const convertedPrice = convertCurrency(currency, price);
        return { ...item, originalPrice: price, convertedPrice, effectiveCurrency: currency };
      })
      .filter(item => item.convertedPrice > 0);

    if (!itemsWithPrices.length) {
      setFilterByPriceButtons([]);
      setminprice(0);
      setmaxprice(0);
      setpricerange([0, 0]);
      return;
    }

    const sortedItems = itemsWithPrices.sort((a, b) => a.convertedPrice - b.convertedPrice);
    const minPrice = sortedItems[0].convertedPrice;
    const maxPrice = sortedItems[sortedItems.length - 1].convertedPrice;

    let result = createPriceSteps(minPrice, maxPrice);
    if (minPrice === maxPrice || result.length === 0) {
      result = [{ start: minPrice, end: maxPrice || minPrice }];
    }

    const rangeStart = result[0].start;
    const rangeEnd = result[result.length - 1].end;

    setpricerange([rangeStart, rangeEnd]);
    setFilterByPriceButtons(result);
    setTempCurrency(baseCurrency);
    setUserMinMaxPrice({ min: rangeStart, max: rangeEnd });

    if (!pricefilter) {
      setminprice(rangeStart);
      setmaxprice(rangeEnd);
    }
  }, [baseCurrencyValue, calculatePrice, pricefilter]);

  // Main data fetching effect
  useEffect(() => {
    const loadData = async () => {
      let data = [];
      
      if (content === "(Internal Server Error)") {
        data = [];
      } else {
        data = content;
      }
      
      await updateData(data);
      setLoading(false);
    };

    loadData();
  }, [content, updateData]);

  // Refetch data when dependencies change
  useEffect(() => {
    const refetchData = async () => {
      const data = await fetchData();
      router.replace(
        `/shop/newlifeStyle?cID=${currentOffset}&sortCat=${selectedSortMethod}`,
        undefined,
        { scroll: false }
      );
      await updateData(data);
    };

    if (content) { // Only refetch if initial content is loaded
      refetchData();
    }
  }, [selectedSortMethod, currentOffset]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/fetch-all-categories');
        if (res.data.status === 200) {
          const subCategories = res.data.subCategories || [];
          const filteredCategories = subCategories
          console.log("filteredCategories", filteredCategories)
            .filter(category => category.maincat_id === 3)
            .map(cat => ({
              id: cat.id,
              submaincat_type: cat.submaincat_type,
            }));
          setCourseSubCategory(filteredCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Filter products based on current filters
  const getFilteredProducts = useCallback(() => {
    const filtered = lifeStyleData.filter(value => {
      const price = Number(CurrencyConverterOnlyRateWithoutDecimal(
        value.currency,
        calculatePrice(value),
        baseCurrencyValue
      )) || 0;

      // Sub-category filter
      const passesSubCategory = selectedSubCategory.length === 0 || 
        selectedSubCategory.some(subCategory => subCategory == value.category_2);

      // Location filter
      const passesLocation = selectedLocation.length === 0 || 
        selectedLocation.some(location => 
          location.toLowerCase().trim() === value.lifestyle_city.toLowerCase().trim()
        );

      // Price filter
      let passesPrice = true;
      if (minprice !== '' && maxprice !== '' && minprice >= 0 && maxprice >= 0) {
        const minPriceNum = Number(minprice);
        const maxPriceNum = Number(maxprice);
        if (minPriceNum <= maxPriceNum) {
          passesPrice = price >= minPriceNum && price <= maxPriceNum;
        } else {
          passesPrice = false;
        }
      }

      return passesSubCategory && passesLocation && passesPrice;
    });

    setFilteredLifeStyleData(filtered);
  }, [lifeStyleData, selectedSubCategory, selectedLocation, minprice, maxprice, calculatePrice, baseCurrencyValue]);

  // Apply filters when dependencies change
  useEffect(() => {
    getFilteredProducts();
  }, [getFilteredProducts]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setUserSearchQuery(query);
    if (!query) {
      getFilteredProducts();
    } else {
      const searchResults = filteredLifeStyleData.filter(lifestyle =>
        lifestyle.lifestyle_name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLifeStyleData(searchResults);
    }
  }, [filteredLifeStyleData, getFilteredProducts]);

  // Event handlers
  const handleSelectChange = (selectedOption) => {
    setSelectedSortMethod(selectedOption.value);
  };

  const handlePriceFilterChange = (value) => {
    setpricefilter(true);
    setminprice(value.start);
    setmaxprice(value.end);
    setUserMinMaxPrice({ min: value.start, max: value.end });
  };

  const handleLocationChange = (value) => {
    const index = selectedLocation.indexOf(value);
    const newLocations = [...selectedLocation];
    if (index === -1) {
      newLocations.unshift(value);
    } else {
      newLocations.splice(index, 1);
    }
    setSelectedLocation(newLocations);
  };

  const handleClearAllFilters = () => {
    setSelectedLocation([]);
    setSelectedSubCategory([]);
    setSelectedPrice([]);
    setFilterCheckboxes([]);
    
    if (pricerange.length >= 2) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
    } else {
      setminprice('');
      setmaxprice('');
    }
    
    setpricefilter(false);
    setDistance(DEFAULT_DISTANCE);
    setUserMinMaxPrice({
      min: pricerange[0] || '',
      max: pricerange[1] || ''
    });
    
    handleSearch('');
  };

  const handleSearchPriceRange = () => {
    const regex = /^\d+(\.\d+)?$/;
    
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
      setpricefilter(true);
    } else {
      ToastMessage({
        status: "warning",
        message: 'Please enter valid numeric values for price range.'
      });
    }
  };

  const handleMinMaxPrice = (e) => {
    setUserMinMaxPrice({
      ...userMinMaxPrice,
      [e.target.name]: e.target.value
    });
  };

  const handleSearchfilter = async () => {
    const data = await fetchData({ distance });
    await updateData(data);
  };

  const handleOnGoogleLocationChange = async (value) => {
    setLoading(true);
    setGoogleLocation(value.label.slice(0, 25) + '...');
    
    try {
      const results = await geocodeByPlaceId(value.value.place_id);
      const { lat, lng } = await getLatLng(results[0]);
      const geocodeResults = await geocodeByLatLng({ lat, lng });
      
      const baseLocation2 = {
        address_full: value.label,
        latitude: lat,
        longitude: lng,
        address_components: geocodeResults[0].address_components
      };

      const data = await fetchLifestyleProducts({
        latitude: baseLocation2.latitude,
        longitude: baseLocation2.longitude,
        distance: 23,
        offset: DEFAULT_OFFSET,
        sortMethod: 'default'
      });
      
      await updateData(data);
    } catch (error) {
      console.error('Location change error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearchData = async () => {
    setLoading(true);
    try {
      const data = await fetchLifestyleProducts({
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
        distance: 23,
        offset: DEFAULT_OFFSET,
        sortMethod: 'default'
      });
      
      await updateData(data);
      setGoogleLocation('search');
    } catch (error) {
      console.error('Clear search error:', error);
      await updateData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnCourseCategoryChange = async (value, displayName) => {
    const isExist = selectedSubCategory?.[0] === value;
    
    if (!isExist) {
      setSelectedSubCategory([value]);
      setFilterCheckboxes([{ value, type: "sub_category", displayName }]);
      
      const data = await fetchData({ category1: value });
      await updateData(data);
    } else {
      setFilterCheckboxes([]);
      setSelectedSubCategory([]);
      
      const data = await fetchData({ category1: 0 });
      await updateData(data);
    }
  };



  

  // Scroll handling for infinite loading
//   useEffect(() => {
//     const handleScroll = () => {
//       const check = (window.scrollY / 60) / (currentOffset / 60);
//       if (check > 80) {
//         setcurrentOffset(prev => prev + 60);
//         setSetMoreProducts(true);
//       }
//     };
    
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [currentOffset]);

  // Clear selected price effect
  useEffect(() => {
    if (selectedPrice.length === 0) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
      setpricefilter(false);
    } else {
      const min = Math.min(...selectedPrice.map(price => price.start));
      const max = Math.max(...selectedPrice.map(price => price.end));
      setminprice(min);
      setmaxprice(max);
      setpricefilter(true);
    }
  }, [selectedPrice, pricerange]);

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <title>Aahaas - Lifestyle</title>
        <meta name="description" content="Experience the essence of travel with Aahaas' Lifestyle offerings, designed to enrich your journey. Discover a wide array of activities, from thrilling adventures to immersive cultural experiences, paired with exquisite dining and wellness options." />
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
        showSearchIcon={true} 
        openSubFilter={() => setopenSideBarStatus(true)} 
        openSearchFilter={() => setSearchfilter(true)}
      >
        <section className="section-b-space ratio_asos mt-lg-5">
          <div className="collection-wrapper">
            <Container>
              <Row>
                <Col sm="3" className="collection-filter" id="filter" style={{ 
                  left: openSideBarStatus ? "0px" : "",
                  position: 'sticky',
                }}>
                  <div className="collection-filter-block px-lg-4 pe-5" style={{ borderRadius: "12px" }}>
                    <div className="collection-mobile-back" onClick={() => setopenSideBarStatus(false)}>
                      <span className="filter-back"><i className="fa fa-angle-left"></i>back</span>
                    </div>

                    <div className="collection-collapse-block">
                      <div className="collection-collapse-block hotel-sidebar-filters-sub">
                        <h5 style={{ fontWeight: '500' }} className="collapse-block-title-hotel">Search by Location</h5>
                        <div className="location-input-container" style={{ position: 'relative' }}>
                          <GooglePlacesAutocomplete
                            apiKey={groupApiCode}
                            selectProps={{
                              value: googleLocation,
                              placeholder: googleLocation,
                              onChange: handleOnGoogleLocationChange,
                              onClick: () => setGoogleLocation(''),
                              styles: {
                                container: (provided) => ({ ...provided, width: '100%' }),
                                control: (provided) => ({ ...provided, paddingRight: '30px' }),
                                dropdownIndicator: () => ({ display: 'none' }),
                                indicatorSeparator: () => ({ display: 'none' })
                              }
                            }}
                          />
                          {googleLocation !== 'search' && (
                            <div 
                              style={{ 
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                cursor: 'pointer',
                                zIndex: 2
                              }}
                              onClick={handleClearSearchData}
                            >
                              <CloseIcon sx={{ fontSize: '18px' }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price Filter */}
                    {/* <div className="collection-collapse-block">
                      <h5 
                        style={{ fontWeight: '500', fontSize: '15px' }} 
                        className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} 
                        onClick={() => setpriceFilterOpen(!priceFilterOpen)}
                      >
                        Price
                      </h5>
                      <Collapse isOpen={priceFilterOpen}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {filterByPriceButtons?.map((value, key) => (
                                <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                  <Input 
                                    checked={value.start == minprice && value.end == maxprice} 
                                    onChange={() => handlePriceFilterChange(value)} 
                                    name={value} 
                                    id={value} 
                                    type="radio" 
                                    className="custom-control-input option-btns" 
                                  />
                                  <h6 className="m-0 p-0" htmlFor={value}>
                                    {!isNaN(value.start) && value.start != null
                                      ? CurrencyConverter(tempCurrency, value.start, baseCurrencyValue).replace(/\.00$/, '')
                                      : `${tempCurrency} 0`
                                    } - 
                                    {!isNaN(value.end) && value.end != null
                                      ? CurrencyConverter(tempCurrency, value.end, baseCurrencyValue).replace(/\.00$/, '')
                                      : `${tempCurrency} 0`
                                    }
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
                                <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  style={{ padding: '9px 10px', borderRadius: '5px' }} 
                                  placeholder="Min" 
                                  value={userMinMaxPrice.min} 
                                  min={pricerange[0]} 
                                  max={pricerange[1]} 
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
                                  placeholder="Max" 
                                  value={userMinMaxPrice.max} 
                                  max={pricerange[1]} 
                                  min={pricerange[0]} 
                                  name="max" 
                                  onChange={handleMinMaxPrice} 
                                />
                              </div>
                              <div className="ms-auto col-3">
                                <button 
                                  className="btn btn-sm btn-solid" 
                                  style={{ padding: '7px 10px', borderRadius: '5px' }} 
                                  onClick={handleSearchPriceRange}
                                >
                                  <SearchIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Collapse>
                    </div> */}

                    {/* Location Filter */}
                    {/* <div className="collection-collapse-block">
                      <h5 
                        style={{ fontWeight: '500', fontSize: '15px' }} 
                        className={locationfilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} 
                        onClick={() => setlocationfilterOpen(!locationfilterOpen)}
                      >
                        Location
                      </h5>
                      <Collapse isOpen={locationfilterOpen}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {locations?.filter(value => value && value.trim() !== '')?.map((value, index) => (
                                <div className="form-check custom-checkbox collection-filter-checkbox" key={index}>
                                  <Input 
                                    checked={selectedLocation.includes(value)} 
                                    onChange={() => handleLocationChange(value)} 
                                    name={value} 
                                    id={value} 
                                    type="checkbox" 
                                    className="custom-control-input option-btns" 
                                  />
                                  <h6 className="m-0 p-0" htmlFor={value} style={{ textTransform: 'capitalize' }}>
                                    {value}
                                  </h6>
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </div> */}

                    {/* Sub Category Filter */}
                    {/* <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500", fontSize: '15px' }}
                        className={courseSubFilter ? "collapse-block-title-selected" : "collapse-block-title"}
                        onClick={() => setCourseSubFilter(!courseSubFilter)}
                      >
                        Sub Category
                      </h5>
                      <Collapse isOpen={courseSubFilter}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {courseSubCategory.map((course, key) => (
                                <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                  <Input
                                    className="custom-control-input option-btns"
                                    type="radio"
                                    value={course?.id}
                                    id={course?.id}
                                    checked={selectedSubCategory.includes(course?.id)}
                                    onChange={() => handleOnCourseCategoryChange(course?.id, course?.submaincat_type)}
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
                    </div> */}

                    {/* Distance Filter */}
                    {/* <div className="collection-collapse-block">
                      <h5 style={{ fontWeight: '500', fontSize: '15px' }} className="collapse-block-title-hotel">
                        Search by distance (km)
                      </h5>
                      <div className="collection-collapse-block-content">
                        <div className="collection-brand-filter d-flex align-items-stretch">
                          <input 
                            type="number" 
                            className="form-control" 
                            style={{ borderTopLeftRadius: '5px', borderBottomLeftRadius: '5px' }} 
                            value={distance}    
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value <= 2000) {
                                setDistance(value);
                              } else {
                                ToastMessage({ status: "warning", message: 'Distance should not exceed 2000 km.' });
                              }
                            }}  
                          />
                          <button 
                            className="px-3 btn btn-sm btn-solid" 
                            style={{ borderTopRightRadius: '5px', borderBottomRightRadius: '5px' }} 
                            onClick={handleSearchfilter}
                          >
                            <SearchIcon />
                          </button>
                        </div>
                      </div>
                    </div> */}
                  </div>
                </Col>

                <Col className="collection-content" sm='12' md='12' lg="9">
                  <div className="page-main-content">
                    <Row>
                      <Col sm="12">
                        <div className="d-none d-lg-block d-md-block top-banner-wrapper">
                          <a href={null}>
                            <Image 
                              src={Menu2} 
                              placeholder="blur" 
                              alt="Banner-images" 
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
                          <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
                            <h5 className="p-0 m-0 d-none d-lg-block" style={{ fontSize: '15px', fontWeight: '500' }}>
                              {!loading ? `Showing ${filteredLifeStyleData.length} Products` : "loading"}
                            </h5>

                            {searchFilter ? (
                              <div className="collection-brand-filter d-flex align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 border" style={{ borderRadius: "10px!important" }}>
                                <input 
                                  type="text" 
                                  className="form-control border-0 py-2" 
                                  value={userSearchQuery} 
                                  placeholder='Search products..' 
                                  onChange={(e) => handleSearch(e.target.value)} 
                                />
                                {userSearchQuery === '' ? (
                                  <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} />
                                ) : (
                                  <CloseIcon onClick={() => setSearchfilter(false)} sx={{ margin: 'auto 10px auto 0px' }} />
                                )}
                              </div>
                            ) : (
                              <div className="collection-brand-filter align-items-stretch ms-auto col-12 col-lg-4 col-md-6 d-flex align-items-center m-0 p-0 d-none d-lg-flex d-md-flex border" style={{ borderRadius: "10px!important" }}>
                                <input 
                                  type="text" 
                                  className="form-control border-0 py-2" 
                                  value={userSearchQuery} 
                                  placeholder='Search products..' 
                                  onChange={(e) => handleSearch(e.target.value)} 
                                />
                                {userSearchQuery === '' ? (
                                  <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} />
                                ) : (
                                  <CloseIcon onClick={() => setSearchfilter(false)} sx={{ margin: 'auto 10px auto 0px' }} />
                                )}
                              </div>
                            )}

                            <div className="col-3 d-none d-lg-block" style={{ position: "relative", zIndex: 1050 }}>
                              <Select
                                styles={{
                                  menu: (provided) => ({
                                    ...provided,
                                    zIndex: 1100,
                                    position: "absolute",
                                  }),
                                }}
                                options={SORT_OPTIONS}
                                onChange={handleSelectChange}
                                value={SORT_OPTIONS.find(option => option.value === selectedSortMethod)}
                              />
                            </div>
                          </div>

                          {/* {allDiscountData.length > 0 && (
                            <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
                              <ProductSlider allDiscountData={allDiscountData} type={"lifeStyles"} /> 
                            </div>
                          )} */}

                          <ul className="product-filter-tags p-0 m-0 my-2">
                            {pricefilter && (
                              <li>
                                <a href={null} className="filter_tag">
                                  {CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} 
                                  <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i>
                                </a>
                              </li>
                            )}
                            {selectedLocation.map((brand, i) => (
                              <li key={i}>
                                <a href={null} className="filter_tag">
                                  {brand}
                                  <i className="fa fa-close" onClick={() => handleLocationChange(brand)}></i>
                                </a>
                              </li>
                            ))}
                            {selectedSubCategory.map((value, i) => {
                              const subCategory = courseSubCategory.find(cat => cat.id === value);
                              return (
                                <li key={i}>
                                  <a href={null} className="filter_tag">
                                    {subCategory?.submaincat_type}
                                    <i
                                      className="fa fa-close"
                                      onClick={() => handleOnCourseCategoryChange(value, subCategory?.submaincat_type)}
                                    ></i>
                                  </a>
                                </li>
                              );
                            })}
                            {(pricefilter || selectedLocation.length > 0 || selectedSubCategory.length > 0) && (
                              <li onClick={handleClearAllFilters}>
                                <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>
                                  Clear all<i className="fa fa-close"></i>
                                </a>
                              </li>
                            )}
                          </ul>

                          <Row>
                            {loading ? (
                              <div className="row mx-0 mt-4 margin-default mt-4">
                                {[...Array(4)].map((_, index) => (
                                  <div className="col-xl-3 col-lg-4 col-6" key={index}>
                                    <PostLoader />
                                  </div>
                                ))}
                              </div>
                            ) : !loading && filteredLifeStyleData.length === 0 ? (
                              <Col xs="12">
                                <div className="my-5">
                                  <div className="col-sm-12 empty-cart-cls text-center">
                                    <img 
                                      alt='category wise banner' 
                                      src='/assets/images/ErrorImages/file.png' 
                                      className="img-fluid mb-4 mx-auto" 
                                    />
                                    <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">
                                      Sorry, there are no products available right now.
                                    </h4>
                                    <h4 style={{ fontSize: 15 }}>
                                      Please check back later or explore other options.
                                    </h4>
                                  </div>
                                </div>
                              </Col>
                            ) : (
                              filteredLifeStyleData.map((product, i) => (
                                <div className={grid} key={i}>
                                  <ProductItems 
                                    product={product} 
                                    productImage={product?.image} 
                                    productstype={'lifestyle'} 
                                    title={product?.lifestyle_name} 
                                    productcurrency={product?.currency} 
                                    adultRate={product?.adult_rate} 
                                    packageRate={product?.package_rate} 
                                    childRate={product?.child_rate} 
                                    description={product?.lifestyle_description} 
                                    rating={4} 
                                    cartClass={'cart-info cart-wrap'} 
                                    backImage={true} 
                                  />
                                </div>
                              ))
                            )}

                            {moreproduct && (
                              <div className="loader-wrapper-shop">
                                <div className="loader"></div>
                              </div>
                            )}
                          </Row>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </section>
      </CommonLayout>
    </>
  );
};

export default LifeStyleMainPage;