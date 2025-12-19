import React, { use, useContext, useEffect, useState,useRef } from "react";
import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";
import Head from "next/head";
import axios from "axios";
import { AppContext } from "../../_app";
import {
  createNewClassRequest,
  getAllEducationProducts,
} from "../../../AxiosCalls/EducationServices/educationServices";

import ProductItems from "../../../components/common/product-box/ProductBox";
import ModalBase from "../../../components/common/Modals/ModalBase";
import CommonLayout from "../../../components/shop/common-layout";
import ToastMessage from "../../../components/Notification/ToastMessage";
import PostLoader from "../../skeleton/PostLoader";

import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";

import Menu2 from "../../../public/assets/images/Bannerimages/mainbanner/educationBanner.jpg";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";
import Select from "react-select";
import { useRouter } from "next/router";
import { Form } from "react-bootstrap";
import ProductSlider from "../productImageSlider";
import cookie from "cookie";
import NewBanners from "../../layouts/NewBanners";


export async function getServerSideProps(context) {
  let response = [];
  let cID = context.query.cID || 60;
  let sortCat = context.query.sortCat || "";

  const { req } = context;

  let baseLocation = {
    latitude: "6.9271",
    longitude: "79.8612",
    locationDescription: "Colombo, Sri lanka",
  };

  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    try {
      const userLastLocation = JSON.parse(cookies.userLastLocation);

      baseLocation = {
        latitude: userLastLocation.latitude.toString(),
        longitude: userLastLocation.longtitude.toString(),
        locationDescription: userLastLocation.address_full,
        address_components: userLastLocation.address_components,
      };

      console.log("baseLocation", baseLocation);
    } catch (error) {
      console.error("Failed to parse userLastLocation cookie:", error);
    }
  }

  await getAllEducationProducts(5,0,0,0,cID,0,sortCat,baseLocation?.latitude,baseLocation?.longitude,0).then(async (res) => {
    response = res.educationListings;
  });

  return {
    props: {
      content: response,
    },
  };
}

function EducationMainPage({ content }) {
  const router = useRouter();
  const canonicalUrl = router.asPath;

  const { baseCurrencyValue, userId, userSearchFilters, setUserSearchFilters, baseLocation } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [emptyclass, setemptyclass] = useState(false);
  const [setMoreProducts, setSetMoreProducts] = useState(false);
  const [requestclass, setrequestclass] = useState(false);
  const [priceFilterOpen, setpriceFilterOpen] = useState(true);
  const [groupfilter, setGroupfilter] = useState(true);
  const [pricefilter, setpricefilter] = useState(false);
  const [courseModeFilter, setCourseModeFilter] = useState(true);
  const [courseSubFilter, setCourseSubFilter] = useState(true);
  const [sessionFilter, setSessionFilter] = useState(true);

  const [grid, setGrid] = useState("col-lg-3 col-md-4 col-6 my-3");

  const [educationData, setEducationData] = useState([]);
  const [educationFilteredData, setEducationFilteredData] = useState([]);

  const [currentOffset, setcurrentOffset] = useState(60);
  const [tempCurrency, setTempCurrency] = useState();
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [sessionType, setSessionType] = useState([]);
  const [groupType, setGroupType] = useState([]);
  const [courseMode, setCourseMode] = useState([]);
  const [courseSubCategory, setCourseSubCategory] = useState([]);
  const [requestClassName, setrequestClassName] = useState("");

  const [filterCheckboxes, setFilterCheckboxes] = useState([]);
  const [selectedGroupTypes, setSelectedGroupTypes] = useState([]);
  const [selectedCourseModes, setSelectedCourseModes] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedSesssionTypes, setSelectedSesssionTypes] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState([]);
  const [filteringValue, setFilteringValue] = useState([]);

  const [minprice, setminprice] = useState("");
  const [maxprice, setmaxprice] = useState("");
  const [pricerange, setpricerange] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState([]);
  const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
  const [backEndFilters, setBackEndFilters] = useState({
    category1: null,
    category2: null,
    category3: null,
    limit: 50,
  });

  const [userMinMaxPrice, setUserMinMaxPrice] = useState({
    min: minprice,
    max: maxprice,
  });

  const options = [
    { value: "default", label: "Default" },
    { value: "featured", label: "Featured" },
    { value: "newArrival", label: "New Arrivals" },
    { value: "priceLH", label: "Price Low to High" },
    { value: "priceHL", label: "Price High to Low" },
  ];
// Add this state for sorting dropdown (with your other state variables)
const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false);
// Add this useEffect for scroll handling (add it with your other useEffects)
useEffect(() => {
  const handleScroll = () => {
    // Close sorting dropdown when scrolling
    if (isSortingDropdownOpen) {
      setIsSortingDropdownOpen(false);
    }
  };

  // Use capture phase to catch scroll events early
  document.addEventListener('scroll', handleScroll, true);
  
  return () => {
    document.removeEventListener('scroll', handleScroll, true);
  };
}, [isSortingDropdownOpen]);
  const [selectedSortMethod, setSelectedSortMethod] = useState("default");
  const [allDiscountData, setAllDiscountData] = useState([]);

  const handleSelectChange = (selectedOption) => {
    // Set the sorting method first
    setSelectedSortMethod(selectedOption.value);

    // Clear search query and filters (similar to essential page)
    setUserSearchQuery('');
    setFilteringValue([]);
    setFilterCheckboxes([]);
    setSelectedCurriculum([]);
    setSelectedSesssionTypes([]);
    setSelectedCourseModes([]);
    setSelectedGroupTypes([]);
    setSelectedSubCategory([]);
    setSelectedPrice([]);
    
    // Reset price range properly
    if (filterByPriceButtons.length > 0) {
      const resetMinPrice = filterByPriceButtons[0]?.start || 0;
      const resetMaxPrice = filterByPriceButtons[filterByPriceButtons.length - 1]?.end || 0;
      
      setUserMinMaxPrice({
        min: resetMinPrice,
        max: resetMaxPrice
      });
      setminprice(resetMinPrice);
      setmaxprice(resetMaxPrice);
    }
    
    setpricefilter(false);
    setLoading(true);

    // Apply sorting to current data
    const sortedData = applySorting(educationData, selectedOption.value);
    sortedData.then((sorted) => {
      setEducationFilteredData(sorted);
      setLoading(false);
    });
  };

  const updateData = async (data) => {
    // Apply sorting to the data before setting it (similar to essential page approach)
    const sortedData = await applySorting(data, selectedSortMethod);
    
    setEducationData(sortedData);
    setEducationFilteredData(sortedData);
    await getCourseModes(sortedData);
    await createPriceFilterButtons(sortedData);
    setLoading(false);
    setSetMoreProducts(false);
  };

  useEffect(() => {
    handleEducationCategory();
  }, []);

  const handleEducationCategory = async () => {
    axios.get(`/fetch-all-categories`).then((res) => {
      if (res.data.status == 200) {
        const subCategories = res.data.subCategories || [];

        const filteredCategories = subCategories
          .filter((category) => category.maincat_id == 5)
          .map((cat, index) => ({
            id: cat["id"],
            submaincat_type: cat["submaincat_type"],
          }));
        setCourseSubCategory(filteredCategories);
        console.log("Filtered Categories:", filteredCategories);
      }
    });
  };

  const submitRequestedClass = async () => {
    console.log("requestClassName", requestClassName);
    if (requestClassName == "") {
      setemptyclass(true);
    } else {
      const dataSet = {
        description: requestClassName,
        userid: userId,
      };
      await createNewClassRequest(dataSet).then((response) => {
        setrequestclass(false);
        setemptyclass(false);
        setrequestClassName("");
        if (response) {
          ToastMessage({
            status: "success",
            message: "Class request has been sent successfully",
          });
        } else {
          ToastMessage({
            status: "warning",
            message: "Failed to create a new request",
          });
        }
      });
    }
  };

  // const createPriceFilterButtons = async (dataset) => {
  //   if (dataset.length > 0) {
  //     let filtered = dataset.toSorted((a, b) => {
  //       return (
  //         CurrencyConverterOnlyRateWithoutDecimal(
  //           a.currency,
  //           a.adult_course_fee,
  //           baseCurrencyValue
  //         ) -
  //         CurrencyConverterOnlyRateWithoutDecimal(
  //           b.currency,
  //           b.adult_course_fee,
  //           baseCurrencyValue
  //         )
  //       );
  //     });
  //     let result = createPriceSteps(
  //       Number(
  //         CurrencyConverterOnlyRateWithoutDecimal(
  //           filtered[0].currency,
  //           filtered[0].adult_course_fee,
  //           baseCurrencyValue
  //         )
  //       ),
  //       Number(
  //         CurrencyConverterOnlyRateWithoutDecimal(
  //           filtered[filtered.length - 1].currency,
  //           filtered[filtered.length - 1].adult_course_fee,
  //           baseCurrencyValue
  //         )
  //       )
  //     );
  //     setminprice(result[0].start);
  //     setmaxprice(result[result.length - 1].end);
  //     setpricerange([result[0].start, result[result.length - 1].end]);
  //     setFilterByPriceButtons(result);
  //     setUserMinMaxPrice({
  //       min: result[0].start,
  //       max: result[result.length - 1].end,
  //     });
  //     setTempCurrency(baseCurrencyValue.base);
  //   } else {
  //     setFilterByPriceButtons([]);
  //   }
  // };

  const createPriceFilterButtons = async (dataset) => {
  if (dataset.length > 0) {
    let filtered = dataset.toSorted((a, b) => {
      return (
        CurrencyConverterOnlyRateWithoutDecimal(
          a.currency,
          a.adult_course_fee,
          baseCurrencyValue
        ) -
        CurrencyConverterOnlyRateWithoutDecimal(
          b.currency,
          b.adult_course_fee,
          baseCurrencyValue
        )
      );
    });
    
    let result = createPriceSteps(
      Number(
        CurrencyConverterOnlyRateWithoutDecimal(
          filtered[0].currency,
          filtered[0].adult_course_fee,
          baseCurrencyValue
        )
      ),
      Number(
        CurrencyConverterOnlyRateWithoutDecimal(
          filtered[filtered.length - 1].currency,
          filtered[filtered.length - 1].adult_course_fee,
          baseCurrencyValue
        )
      )
    );
    
    setminprice(result[0].start);
    setmaxprice(result[result.length - 1].end);
    setpricerange([result[0].start, result[result.length - 1].end]);
    setFilterByPriceButtons(result);
    
    // Set tempCurrency to base currency for consistency
    setTempCurrency(baseCurrencyValue?.base || 'USD');
    
    setUserMinMaxPrice({
      min: result[0].start,
      max: result[result.length - 1].end,
    });
  } else {
    setFilterByPriceButtons([]);
  }
};

  const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
    const index = selectedItems.indexOf(value);
    let updatedSelectedItems;
    if (index === -1) {
      updatedSelectedItems = [value, ...selectedItems];
    } else {
      updatedSelectedItems = selectedItems.filter((item) => item !== value);
    }
    setSelectedItems(updatedSelectedItems);
    const dataset = { value, type };
    let sampledataset;
    if (index === -1) {
      sampledataset = [...filterCheckboxes, dataset];
    } else {
      sampledataset = filterCheckboxes.filter(
        (item) => !(item.value === value && item.type === type)
      );
    }
    let result = [];
    sampledataset.map((value) => {
      if (!result.includes(value.type)) {
        result.push(value.type);
      }
    });
    setFilteringValue(result);
    removeDuplicates(sampledataset);
  };

  const removeDuplicates = (arr) => {
    const unique = [];
    const items = new Set();
    arr.forEach((item) => {
      const key = JSON.stringify(item);
      if (!items.has(key)) {
        items.add(key);
        unique.push(item);
      }
    });
    setFilterCheckboxes(unique);
  };

  const handleOnGroupTypeChange = (value) => {
    handleOnChange(
      value,
      selectedGroupTypes,
      setSelectedGroupTypes,
      "group_type"
    );
  };

  const handleOnCourseModeChange = (value) => {
    handleOnChange(
      value,
      selectedCourseModes,
      setSelectedCourseModes,
      "course_mode"
    );
  };

  const handleOnCourseCategoryChange = (value, displayName) => {
  setUserSearchQuery('');

  // Check if selectedSubCategory already has this value
  const isExist = selectedSubCategory?.[0] === value;

  if (!isExist) {
    console.log("Selected value:", value, displayName);
    setSelectedSubCategory([value]);
    
    // Instead of replacing all filters, preserve existing non-subcategory filters
    const nonSubCategoryFilters = filterCheckboxes.filter(filter => filter.type !== "sub_category");
    const dataset = { value, type: "sub_category", displayName };
    const sampledataset = [...nonSubCategoryFilters, dataset];
    
    setFilterCheckboxes(sampledataset);
    
    // Update filtering value array
    let result = [];
    sampledataset.map((value) => {
      if (!result.includes(value.type)) {
        result.push(value.type);
      }
    });
    setFilteringValue(result);

    setBackEndFilters({
      ...backEndFilters,
      category1: value,
    });

    // Remove loading state from here - let the useEffect handle the filtering
    fetchFilteredData(value);
  } else {
    // Remove subcategory filter but keep other filters
    const filteredCheckboxes = filterCheckboxes.filter(filter => filter.type !== "sub_category");
    setFilterCheckboxes(filteredCheckboxes);
    setSelectedSubCategory([]);
    
    // Update filtering value array
    let result = [];
    filteredCheckboxes.map((value) => {
      if (!result.includes(value.type)) {
        result.push(value.type);
      }
    });
    setFilteringValue(result);
    
    setBackEndFilters({
      ...backEndFilters,
      category1: 0,
    });

    // Remove loading state from here
    fetchFilteredData(0);
  }
};

  const handleOnSessionTypeChange = (value) => {
    handleOnChange(
      value,
      selectedSesssionTypes,
      setSelectedSesssionTypes,
      "sessions"
    );
  };

  const handlePriceFilterChange = async (value) => {
    setUserSearchQuery("");
    setminprice(value.start);
    setmaxprice(value.end);
    setpricefilter(true);

    setUserMinMaxPrice({
      min: value.start,
      max: value.end,
    })

  };

  const getCourseModes = async (dataSet) => {
    console.log("dataSet ", dataSet);
    let sessions = [];
    let courseModes = [];
    let groupTypes = [];
    dataSet.map((value) => {
      
      if (value.group_type != "") {
        if (!groupTypes.includes(value.group_type)) {
          groupTypes.push(value.group_type);
        }
      }
      if (value.course_mode != "") {
        if (
          value.course_mode !== "Face to Face" &&
          !courseModes.includes(value.course_mode)
        ) {
          courseModes.push(value.course_mode);
        }
      }
      if (value.sessions != "") {
        if (!sessions.includes(value.sessions)) {
          sessions.push(value.sessions);
        }
      }
    });
    // setSessionType([...sessions]);
    setSessionType([
    "Single",
    "Multiple"
]);
    // console.log("sessionType", courseModes);
    setCourseMode(courseModes);
//     setCourseMode([
//     "Live",
//     "F2F",
//     "PreR",
//     "Online"
// ]);
    // setGroupType(groupTypes);
    setGroupType([
    "Individual",
    "Group"
]);
  };

  const getFilteredProducts = async (filters, dynamicValue, dataset) => {
    let filtered = [...dataset];
    
    // If no filter types are selected, just apply price filter
    if (filters.length === 0) {
      filtered = dataset.filter((data) => {
        let price = Number(
          CurrencyConverterOnlyRateWithoutDecimal(
            data.currency,
            data.adult_course_fee,
            baseCurrencyValue
          )
        );
        return Number(minprice) <= price && price <= Number(maxprice);
      });
      
      // Apply sorting to filtered results
      const sortedFiltered = await applySorting(filtered, selectedSortMethod);
      return sortedFiltered;
    }
    
    // Group filters by type for easier processing
    const filtersByType = {};
    filterCheckboxes.forEach((filter) => {
      if (!filtersByType[filter.type]) {
        filtersByType[filter.type] = [];
      }
      filtersByType[filter.type].push(filter.value);
    });
    
    // Apply each filter type
    Object.keys(filtersByType).forEach((filterType) => {
      const values = filtersByType[filterType];
      filtered = filtered.filter((data) => {
        // Skip subcategory filtering here since it's handled at API level
        if (filterType === 'sub_category') {
          return true;
        }
        
        try {
          const dataValue = data[filterType];
          if (typeof dataValue === 'string') {
            return values.some(value => 
              dataValue.toLowerCase().trim() === value.toLowerCase().trim()
            );
          } else {
            return values.some(value => dataValue == value);
          }
        } catch (error) {
          return values.some(value => data[filterType] == value);
        }
      });
    });
    
    // Apply price filter
    filtered = filtered.filter((data) => {
      let price = Number(
        CurrencyConverterOnlyRateWithoutDecimal(
          data.currency,
          data.adult_course_fee,
          baseCurrencyValue
        )
      );
      return Number(minprice) <= price && price <= Number(maxprice);
    });
    
    // Apply sorting to final filtered results
    const sortedFiltered = await applySorting(filtered, selectedSortMethod);
    return sortedFiltered;
  };

  const handleChange = async (value) => {
    const query = value;
    setUserSearchQuery(query);
    const searchEducationData = educationData.filter((educationData) => {
      return educationData["course_name"]
        .toLowerCase()
        .trim()
        .replace(/ /g, "")
        .includes(query.toLowerCase().trim().replace(/ /g, ""));
    });
    
    // Apply sorting to search results
    const sortedSearchData = await applySorting(searchEducationData, selectedSortMethod);
    setEducationFilteredData(sortedSearchData);
  };

  const handleHeaderSearch = (searchQuery) => {
    handleChange(searchQuery);
  };

  const startFiltering = async () => {
    const filteredData = await getFilteredProducts(
      filteringValue,
      filteringValue[0],
      educationData
    );
    setEducationFilteredData(filteredData);
  };

  const handleClearAllFilters = async () => {
    // Clear all filter states
    setSelectedCurriculum([]);
    setSelectedSesssionTypes([]);
    setSelectedCourseModes([]);
    setSelectedGroupTypes([]);
    setSelectedSubCategory([]);

    // Clear other filter states
    setFilteringValue([]);
    setSelectedPrice([]);
    setpricefilter(false);
    setFilterCheckboxes([]);
    setUserSearchQuery('');

    // Clear the backend filters
    const clearedFilters = {
      category1: null,
      category2: null,
      category3: null,
      limit: 60,
    };
    setBackEndFilters(clearedFilters);

    // Reset price range with current filter buttons
    if (filterByPriceButtons.length > 0) {
      const resetMinPrice = filterByPriceButtons[0]?.start || 0;
      const resetMaxPrice = filterByPriceButtons[filterByPriceButtons.length - 1]?.end || 0;
      
      setUserMinMaxPrice({
        min: resetMinPrice,
        max: resetMaxPrice
      });
      setminprice(resetMinPrice);
      setmaxprice(resetMaxPrice);
    }

    // Set loading state
    setLoading(true);

    try {
      // Use the getAllEducationProducts function to maintain consistency with loadMoreProducts
      await getAllEducationProducts(5, 0, 0, 0, currentOffset, 0, selectedSortMethod, baseLocation?.latitude || 6.9271, baseLocation?.longitude || 79.8612,0).then(async (res) => {
        if (res === '(Internal Server Error)' || res === "Something went wrong !") {
          // Set empty arrays as fallback
          setEducationData([]);
          setEducationFilteredData([]);
          setSessionType([]);
          setCourseMode([]);
          setGroupType([]);
          setFilterByPriceButtons([]);
        } else {
          // Ensure we always have an array
          let educationListings = res?.educationListings || [];

          // Apply client-side sorting to ensure consistency with selected sort method
          educationListings = await applySorting(educationListings, selectedSortMethod);

          setEducationData(educationListings);
          setEducationFilteredData(educationListings);

          // Update other dependent data
          if (educationListings.length > 0) {
            await getCourseModes(educationListings);
            await createPriceFilterButtons(educationListings);
          } else {
            // Clear dependent data if no products
            setSessionType([]);
            setCourseMode([]);
            setGroupType([]);
            setFilterByPriceButtons([]);
          }
        }
      });
    } catch (error) {
      console.error("Error clearing filters:", error);
      // Set empty arrays as fallback
      setEducationData([]);
      setEducationFilteredData([]);
      setSessionType([]);
      setCourseMode([]);
      setGroupType([]);
      setFilterByPriceButtons([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to apply client-side sorting (similar to essential page approach)
  const applySorting = async (data, sortMethod) => {
    if (!data || data.length === 0) return data;

    let sortedData = [...data];

    switch (sortMethod) {
      case 'priceLH':
        sortedData.sort((a, b) => {
          const aPrice = CurrencyConverterOnlyRateWithoutDecimal(
            a.currency,
            a.adult_course_fee,
            baseCurrencyValue
          );
          const bPrice = CurrencyConverterOnlyRateWithoutDecimal(
            b.currency,
            b.adult_course_fee,
            baseCurrencyValue
          );
          return aPrice - bPrice;
        });
        break;
      case 'priceHL':
        sortedData.sort((a, b) => {
          const aPrice = CurrencyConverterOnlyRateWithoutDecimal(
            a.currency,
            a.adult_course_fee,
            baseCurrencyValue
          );
          const bPrice = CurrencyConverterOnlyRateWithoutDecimal(
            b.currency,
            b.adult_course_fee,
            baseCurrencyValue
          );
          return bPrice - aPrice;
        });
        break;
      case 'newArrival':
        sortedData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'featured':
        // Assuming featured items have a featured flag or higher priority
        sortedData.sort((a, b) => (b.featured || 0) - (a.featured || 0));
        break;
      case 'default':
      default:
        // Keep original order for default
        break;
    }

    return sortedData;
  };

  const handleMinMaxPrice = (e) => {
    const { name, value } = e.target;

    // Convert the display value back to base currency for storage
    const baseValue = convertFromDisplayCurrency(value, baseCurrencyValue, tempCurrency);

    setUserMinMaxPrice({
      ...userMinMaxPrice,
      [name]: baseValue,
    });
  };

  const handleSearchPriceRange = () => {

    if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
     console.log("Both min and max prices are zero.");
      ToastMessage({
        status: "warning",
        message: "Your min price is greated then max price",
      });
    } else if( Number(userMinMaxPrice.min) < 0 || Number(userMinMaxPrice.max) < 0) {
        ToastMessage({
          status: "warning",
          message: 'Price values cannot be negative.'
        });
        return;

      }else if (Number(userMinMaxPrice.min) === 0 && Number(userMinMaxPrice.max) === 0) {
        ToastMessage({
          status: "warning",
          message: 'Please enter a valid price range.'
        });
        console.log("Both min and max prices are zero.");
        return;
      }
      else {
      setUserSearchQuery("");
      setminprice(userMinMaxPrice.min);
      setmaxprice(userMinMaxPrice.max);
      setpricefilter(true); 
    }
  };

  const combineFilters = () => {
    return {
      selectedSubCategory,
      selectedGroupTypes,
      selectedCourseModes,
      selectedSesssionTypes,
      selectedCurriculum,
      pricefilter,
      userSearchQuery: userSearchQuery,
      minprice: minprice,
      maxprice: maxprice,
    };
  };

  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [showFilterButton, setShowFilterButton] = useState(true); // New state for filter button visibility
  const [searchFilter, setSearchfilter] = useState(false);

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  };

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  };

  const toggleSubFilter = () => {
    setopenSideBarStatus(!openSideBarStatus);
  };

  const openSearchFilter = () => {
    setSearchfilter(true);
  };

  const closeSearchFilter = () => {
    setSearchfilter(false);
    handleChange("");
  };

 const fetchFilteredData = async (directCategory1) => {
  // Remove setLoading(true) from here
  const latitude = baseLocation?.latitude || (localStorage?.getItem("userLastLocation")
    ? JSON.parse(localStorage?.getItem("userLastLocation")).latitude
    : 6.9271);
  const longitude = baseLocation?.longitude || (localStorage?.getItem("userLastLocation")
    ? JSON.parse(localStorage?.getItem("userLastLocation")).longtitude
    : 79.8612);

  // Use the passed category1 value if provided, otherwise use the one from state
  const category1Value = directCategory1 !== undefined ? directCategory1 : backEndFilters.category1;

  await getAllEducationProducts(5, category1Value || 0, backEndFilters.category2 || 0, backEndFilters.category3 || 0, backEndFilters.limit || 60, 0, selectedSortMethod, latitude, longitude,0)
    .then(async (res) => {
      if (res === '(Internal Server Error)' || res === "Something went wrong !") {
        // Initialize with empty array on error
        setEducationData([]);
        setEducationFilteredData([]);
      } else {
        // Initialize with empty array if the response data is undefined
        let listings = res?.educationListings || [];
        
        // Apply client-side sorting to ensure consistency
        listings = await applySorting(listings, selectedSortMethod);
        
        setEducationData(listings);
        
        // If there are other filters active (excluding subcategory), apply them
        const nonSubCategoryFilters = filterCheckboxes.filter(filter => filter.type !== "sub_category");
        if (nonSubCategoryFilters.length > 0) {
          const filteredData = await getFilteredProducts(
            filteringValue,
            filteringValue[0],
            listings
          );
          setEducationFilteredData(filteredData);
        } else {
          setEducationFilteredData(listings);
        }
        
        console.log("fetchFilteredData", listings);
      }
      // Remove setLoading(false) from here
    })
    .catch((error) => {
      console.log("fetchFilteredData", error);
      // Initialize with empty array on error
      // Remove setLoading(false) from here
      setEducationData([]);
      setEducationFilteredData([]);
    });
};

  useEffect(() => {
    const filtersArray = JSON.stringify(combineFilters());
    setUserSearchFilters({
      ...userSearchFilters,
      education: filtersArray,
    });
  }, [
    selectedGroupTypes,
    selectedCourseModes,
    selectedSesssionTypes,
    selectedCurriculum,
    selectedSubCategory,
    selectedSortMethod, // Add sorting to dependencies
  ]);

  useEffect(() => {
    startFiltering();
  }, [filterCheckboxes, minprice, maxprice]);

  useEffect(() => {
    createPriceFilterButtons(educationData);
  }, []);

  useEffect(() => {
    if (selectedPrice.length === 0) {
      setminprice(pricerange[0]);
      setmaxprice(pricerange[1]);
      setpricefilter(false);
    } else {
      const min = Math.min(...selectedPrice.map((price) => price.start));
      const max = Math.max(...selectedPrice.map((price) => price.end));
      setminprice(min);
      setmaxprice(max);
      setpricefilter(true);
    }
  }, [selectedPrice]);

  useEffect(() => {
    // window.scrollTo({
    //   top: 0,
    //   behavior: "smooth",
    // });
  }, [window.location.href]);

  useEffect(() => {
    const discountData = [];
    content.forEach((item) => {
      if (
        item.discount &&
        !discountData.some(
          (data) => JSON.stringify(data) === JSON.stringify(item.discount)
        )
      ) {
        discountData.push(item.discount);
      }
    });
    setAllDiscountData(discountData);

    updateData(content);
  }, [content]);

 // Add this ref to track scroll position (add it with your other useRef declarations)
const scrollPositionRef = useRef(0);

// Replace your current scroll useEffect with this:
useEffect(() => {
  const handleScroll = () => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    let check = window.scrollY / 60 / (currentOffset / 60);
    if (check > 80) {
      setcurrentOffset(currentOffset + 60);
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [currentOffset]);

// Add this useEffect to restore scroll position after products load
useEffect(() => {
  if (!loading && educationData.length > 0) {
    // Restore scroll position after a brief delay to ensure DOM is updated
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 100);
  }
}, [educationData, loading]);

  const loadMoreProducts = async () => {
    try {
      setLoading(true);
      let response = [];
      
      // Get location data with priority: baseLocation > localStorage > default
      const latitude = baseLocation?.latitude || (localStorage?.getItem("userLastLocation")
        ? JSON.parse(localStorage?.getItem("userLastLocation")).latitude
        : 6.9271);
      const longitude = baseLocation?.longitude || (localStorage?.getItem("userLastLocation")
        ? JSON.parse(localStorage?.getItem("userLastLocation")).longtitude
        : 79.8612);

      await getAllEducationProducts(5, 0, 0, 0, currentOffset, 0, selectedSortMethod, latitude, longitude,0).then(async (res) => {
        if (res === '(Internal Server Error)' || res === "Something went wrong !") {
          response = [];
          setSetMoreProducts(false);
          setEducationData([]);
          setEducationFilteredData([]);
        } else {
          response = res.educationListings;
          setSetMoreProducts(false);
          await updateData(res.educationListings);
        }
      });

    } catch (error) {
      console.error("Error loading more products:", error);
      setSetMoreProducts(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only load more products after initial content is loaded and when offset or sorting changes
    // Skip if it's the initial load (currentOffset = 60 and no data)
    // if (currentOffset > 60 || (educationData.length > 0 && !loading)) {
      loadMoreProducts();
    // }
  }, [currentOffset, selectedSortMethod]);

  const handleOnChangeRequestClass = (e) => {
    // e.preventDefault();
    setrequestClassName(e.target.value);
  };

  const handlePriceFilterRemove = () => {
        setpricefilter(false);
  }


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
  // Add these with your other state variables
const [isSubcategoriesSticky, setIsSubcategoriesSticky] = useState(false);
const [screenWidth, setScreenWidth] = useState(0);

 // Add this useEffect for sticky subcategories
useEffect(() => {
  // Set initial width
  setScreenWidth(window.innerWidth);

  // Handle resize
  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  window.addEventListener('resize', handleResize);

  // Sticky subcategories scroll handler
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
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
}, [isSubcategoriesSticky]);

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
        <title>Aahaas - Education</title>
        <meta
          name="description"
          content="At Aahaas, our Education category empowers travelers to learn while exploring. Engage in a variety of educational activities, from guided tours of historical sites to interactive workshops that ignite your curiosity."
        />{" "}
        {/* Set meta description if needed */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.aahaas.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "education",
                  item: "https://www.aahaas.com/education",
                },
              ],
            }),
          }}
        />
      </Head>

      <CommonLayout
        title="education"
        parent="home"
        openSubFilter={() => openSubFilter()}
        openSearchFilter={() => openSearchFilter()}
        onSearch={handleHeaderSearch}
      >
        <section className="section-b-space ratio_asos ">
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
                    display: openSideBarStatus ? "block" : "none",
                    left: openSideBarStatus ? "0px" : "",
                    position: 'sticky',
                    top: '20px',
                    alignSelf: 'flex-start',
                    maxHeight: '100vh',
                    overflowY: 'auto',
                  }}
                >
                  <div
                    className="collection-filter-block px-lg-4 pe-5"
                    style={{ borderRadius: "10px" }}
                  >
                    <div
                      className="collection-mobile-back"
                      onClick={() => closeSubFilter()}
                    >
                      <span className="filter-back">
                        <i className="fa fa-angle-left"></i>back
                      </span>
                    </div>

                      {/* Sort By Section */}
                    <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500" }}
                        className="collapse-block-title-selected"
                      >
                        Sort By
                      </h5>
                      <div className="collection-collapse-block-content">
                        <div className="collection-brand-filter">
                          <Select
                            value={options.find(option => option.value === selectedSortMethod)}
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
                    </div>

                    <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500" }}
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
                                      value.start === minprice &&
                                      value.end === maxprice
                                    }
                                    onChange={() =>
                                      handlePriceFilterChange(value)
                                    }
                                    name={value}
                                    id={value}
                                    type="radio"
                                    className="custom-control-input option-btns"
                                  />
                                  <h6 className="m-0 p-0" htmlFor={value} onClick={() => handlePriceFilterChange(value)}>
                                    {CurrencyConverter(
                                      tempCurrency ||
                                      baseCurrencyValue?.base ||
                                      "USD", // Fallback values
                                      value.start || 0, // Fallback to 0 if value.start is undefined
                                      baseCurrencyValue
                                    )}{" "}
                                    -{" "}
                                    {CurrencyConverter(
                                      tempCurrency ||
                                      baseCurrencyValue?.base ||
                                      "USD", // Fallback values
                                      value.end || 0, // Fallback to 0 if value.end is undefined
                                      baseCurrencyValue
                                    )}
                                  </h6>
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <div className="d-flex align-items-end align-content-stretch gap-3">
                              {/* <div className="d-flex flex-column align-itmes-end col-4">
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
                                  onInput={(e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }}
                                  onChange={(e) => handleMinMaxPrice(e)}
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
                                  value={userMinMaxPrice.max}
                                  max={pricerange[1]}
                                  min={pricerange[0]}
                                  name="max"
                                  onInput={(e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }}
                                  onChange={(e) => handleMinMaxPrice(e)}
                                />
                              </div> */}
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
      pricerange[1] ?
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
    name="max"
    onInput={(e) => {
      if (e.target.value.length > 10) {
        e.target.value = e.target.value.slice(0, 10);
      }
    }}
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
                    <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500" }}
                        className={
                          groupfilter
                            ? "collapse-block-title-selected"
                            : "collapse-block-title"
                        }
                        onClick={() => setGroupfilter(!groupfilter)}
                      >
                        Groups
                      </h5>
                      <Collapse isOpen={groupfilter}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {groupType.map((group, key) => (
                                <div
                                  className="form-check custom-checkbox collection-filter-checkbox"
                                  key={key}
                                >
                                  <Input
                                    className="custom-control-input option-btns"
                                    type="checkbox"
                                    value={group}
                                    id={group}
                                    checked={selectedGroupTypes.includes(group)}
                                    onChange={() =>
                                      handleOnGroupTypeChange(group)
                                    }
                                    name={group}
                                  />
                                  <h6 className="m-0 p-0" htmlFor={group} onClick={() => handleOnGroupTypeChange(group)}>
                                    {group === "" || group === undefined
                                      ? "Something went wrong !"
                                      : group}{" "}
                                  </h6>
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                    <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500" }}
                        className={
                          courseModeFilter
                            ? "collapse-block-title-selected"
                            : "collapse-block-title"
                        }
                        onClick={() => setCourseModeFilter(!courseModeFilter)}
                      >
                        Course Mode
                      </h5>
                      <Collapse isOpen={courseModeFilter}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {courseMode.map((course, key) => (
                                <div
                                  className="form-check custom-checkbox collection-filter-checkbox"
                                  key={key}
                                >
                                  <Input
                                    className="custom-control-input option-btns"
                                    type="checkbox"
                                    value={course}
                                    id={course}
                                    checked={selectedCourseModes.includes(
                                      course
                                    )}
                                    onChange={() => {
                                      handleOnCourseModeChange(course);
                                    }}
                                    name={course}
                                  />
                                  <h6 className="m-0 p-0" htmlFor={course} onClick={() => handleOnCourseModeChange(course)}>
                                    {course === "PreR"
                                      ? "Pre Recorded"
                                      : course === "Live"
                                        ? "Live Classes"
                                        : course === "Online"
                                          ? "Online Classes"
                                          : course === "F2F" || "Face to Face"
                                            ? "In Person"
                                            : null}
                                    {/* {course === "PreR"
                                      ? "Pre Recorded"
                                      : course === "Live"
                                      ? "Live Classes"
                                      : course === "Online"
                                      ? "Online Classes"
                                      : course === "F2F" || "Face to Face"
                                      ? "In Person"
                                      : null} */}
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
                        style={{ fontWeight: "500" }}
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
                    <div className="collection-collapse-block">
                      <h5
                        style={{ fontWeight: "500" }}
                        className={
                          sessionFilter
                            ? "collapse-block-title-selected"
                            : "collapse-block-title"
                        }
                        onClick={() => setSessionFilter(!sessionFilter)}
                      >
                        Session Type
                      </h5>
                      <Collapse isOpen={sessionFilter}>
                        <div className="collection-collapse-block-content">
                          <div className="collection-brand-filter">
                            <ul className="category-list">
                              {sessionType.map((session, key) => (
                                <div
                                  className="form-check custom-checkbox collection-filter-checkbox"
                                  key={key}
                                >
                                  <Input
                                    className="custom-control-input option-btns"
                                    type="checkbox"
                                    value={session}
                                    id={session}
                                    checked={selectedSesssionTypes.includes(
                                      session
                                    )}
                                    onChange={() => {
                                      handleOnSessionTypeChange(session);
                                    }}
                                    name={session}
                                  />
                                  <h6 className="m-0 p-0" htmlFor={session} onClick={() => handleOnSessionTypeChange(session)}>
                                    {session}
                                  </h6>
                                </div>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </Collapse>
                    </div>
                    
                  
                    
                    <div className="collection-collapse-block">
                    </div>
                  </div>
                  {userId !== "AHS_Guest" && (
                    <div className="collection-collapse-block open ">
                      <div className="collection-collapse-block-content ">
                        <div
                          className="collection-brand-filter d-flex align-items-stretch"
                          onClick={() => {
                            setrequestclass(true)
                            setemptyclass(false)
                          }}
                        >
                          <button className="form-control py-2">
                            <h6
                              className="my-auto"
                              style={{ textTransform: "capitalize" }}
                            >
                              Request a new class
                            </h6>
                          </button>
                          <button className="btn btn-sm btn-solid">
                            <AddCircleIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                  <div className="page-main-content">
                    {/* Full Width Banner */}
                 

                    <Row>
                      <Col sm="12">
                        <div className="collection-product-wrapper mt-0 mt-lg-1" style={{paddingLeft: openSideBarStatus ? '10px' : '20px' }}>
  <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row border-bottom pb-2 gap-2">
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
          flexShrink: 0,
        }}
      >
        <TuneIcon sx={{ fontSize: '22px', color: 'white' }} />
      </button>
    </div>
    {!loading && courseSubCategory.length > 0 && (
      <div 
        className={`subcategories-horizontal-wrapper w-100 ${isSubcategoriesSticky ? 'sticky-subcategories' : ''}`}
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
              // window.scrollTo({
              //   top: 0,
              //   behavior: 'smooth'
              // });
              setSelectedSubCategory([]);
              setBackEndFilters({
                ...backEndFilters,
                category1: 0,
              });
              fetchFilteredData(0);
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
              {course.submaincat_type}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* Spacer div to prevent content jump when sticky is active */}
    {isSubcategoriesSticky && !loading && courseSubCategory.length > 0 && (
      <div style={{ height: '80px', width: '100%' }}></div>
    )}

                            <h5
                              className="p-0 m-0 d-none d-lg-block ms-auto"
                              style={{ fontSize: "15px", fontWeight: "500", marginTop: "10px" }}
                            >
                              {/* {!loading
                                ? `Showing  ${educationFilteredData?.length} Products`
                                : "loading"}{" "} */}
                            </h5>
                          </div>

                          {/* Search Section */}
                          {searchFilter && (
                            <div className="d-flex align-items-center gap-3 my-3">
                              <div
                                className="collection-brand-filter d-flex align-items-stretch col-12 col-lg-4 col-md-6 border"
                                style={{ borderRadius: "10px!important" }}
                              >
                                <input
                                  type="text"
                                  className="form-control border-0 py-2"
                                  value={userSearchQuery}
                                  placeholder="Search products.."
                                  onChange={(e) => handleChange(e.target.value)}
                                />
                                {userSearchQuery === "" ? (
                                  <SearchIcon
                                    sx={{ margin: "auto 10px auto 0px" }}
                                  />
                                ) : (
                                  <CloseIcon
                                    onClick={() => closeSearchFilter()}
                                    sx={{ margin: "auto 10px auto 0px" }}
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {allDiscountData.length > 0 && (
                            <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
                              <ProductSlider
                                allDiscountData={allDiscountData}
                              />
                            </div>
                          )}

                          <ul className="product-filter-tags p-0 m-0 my-2">
                            {pricefilter && (
                              <li>
                                <a
                                  href={null}
                                  className="filter_tag"
                                  onClick={() => setSelectedPrice([])}
                                >
                                  {CurrencyConverter(
                                    tempCurrency,
                                    minprice,
                                    baseCurrencyValue
                                  )}{" "}
                                  -{" "}
                                  {CurrencyConverter(
                                    tempCurrency,
                                    maxprice,
                                    baseCurrencyValue
                                  )}{" "}
                                  {/* <i className="fa-regular fa-circle-xmark ml-2"></i>{" "} */}
                                   <i
                                    className="fa fa-close"
                                    onClick={() =>
                                      handlePriceFilterRemove()
                                    }
                                  ></i>
                                </a>
                              </li>
                            )}
                            {selectedGroupTypes.map((value, i) => (
                              <li key={i}>
                                <a href={null} className="filter_tag">
                                  {value}
                                  <i
                                    className="fa fa-close"
                                    onClick={() =>
                                      handleOnGroupTypeChange(value)
                                    }
                                  ></i>
                                </a>
                              </li>
                            ))}
                            {selectedCourseModes.map((value, i) => (
                              <li key={i}>
                                <a href={null} className="filter_tag">
                                  {/* {value === "F2F" ? "In Person" : value} */}
                                    {value === "PreR"
                                      ? "Pre Recorded"
                                      : value === "Live"
                                        ? "Live Classes"
                                        : value === "Online"
                                          ? "Online Classes"
                                          : value === "F2F" || "Face to Face"
                                            ? "In Person"
                                            : null}
                                  <i
                                    className="fa fa-close"
                                    onClick={() =>
                                      handleOnCourseModeChange(value)
                                    }
                                  ></i>
                                </a>
                              </li>
                            ))}
                            {selectedSesssionTypes.map((value, i) => (
                              <li key={i}>
                                <a href={null} className="filter_tag">
                                  {value}
                                  <i
                                    className="fa fa-close"
                                    onClick={() =>
                                      handleOnSessionTypeChange(value)
                                    }
                                  ></i>
                                </a>
                              </li>
                            ))}
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
                            {(pricefilter ||
                              selectedGroupTypes.length > 0 ||
                              selectedCourseModes.length > 0 ||
                              selectedSesssionTypes.length > 0 ||
                              selectedCurriculum.length > 0 ||
                              selectedSubCategory.length > 0) && (
                                <li onClick={() => handleClearAllFilters()}>
                                  <a
                                    href={null}
                                    className="filter_tag"
                                    style={{ borderColor: "red", color: "red" }}
                                  >
                                    Clear all<i className="fa fa-close"></i>
                                  </a>
                                </li>
                              )}
                          </ul>
                          <Row>
                            {loading ? (
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
                              </div>
                            ) : !loading &&
                              (!educationFilteredData ||
                                educationFilteredData.length === 0) ? (
                              <Col xs="12">
                                <div className="my-3">
                                  <div className="col-sm-12 empty-cart-cls text-center">
                                    <img
                                      alt="category wise banner"
                                      src="/assets/images/ErrorImages/file.png"
                                      className="img-fluid mb-3 mx-auto"
                                    />
                                    <h4
                                      style={{
                                        fontSize: 22,
                                        fontWeight: "600",
                                      }}
                                      className="px-5"
                                    >
                                      Sorry, there are no products available
                                      right now.
                                    </h4>
                                    <h4 style={{ fontSize: 15 }}>
                                      Please check back later or explore other
                                      options.
                                    </h4>
                                  </div>
                                </div>
                              </Col>
                            ) : (
                              // Add defensive check here
                              (educationFilteredData || []).map(
                                (product, i) => (
                                  <div className={grid} key={i}>
                                    <ProductItems
                                      product={product}
                                      productImage={product?.image_path}
                                      description={product?.course_description}
                                      productstype={"education"}
                                      title={product?.course_name}
                                      productcurrency={product?.currency}
                                      adultRate={product?.adult_course_fee}
                                      childRate={product.child_course_fee}
                                      rating={4}
                                      addWishlist={() =>
                                        contextWishlist.addToWish(product)
                                      }
                                      addCart={() =>
                                        context.addToCart(product, quantity)
                                      }
                                      addCompare={() =>
                                        comapreList.addToCompare(product)
                                      }
                                      cartClass={"cart-info cart-wrap"}
                                      backImage={true}
                                    />
                                  </div>
                                )
                              )
                            )}

                            {setMoreProducts && (
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
        <ModalBase
          isOpen={requestclass}
          toggle={() => {
            setrequestclass(false)
            setrequestClassName("")
          }}
          title={"Request a new class"}
        >
          <div className="d-flex flex-column align-items-center">
            <textarea
              rows={5}
              cols={45}
              placeholder="Enter your desire class description"
              // value={}
              onChange={(e) => {
                setemptyclass(false)
                handleOnChangeRequestClass(e)}}
              className="p-2"
            ></textarea>
            {emptyclass && (
              <span className="col-11 px-4" style={{ color: "red" }}>
                kindly enter your class description
              </span>
            )}
            <button
              className="btn btn-sm btn-solid mt-4"
              onClick={() => {
                setrequestClassName("")
                submitRequestedClass()
              }}
            >
              Submit
            </button>
          </div>
        </ModalBase>
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

  /* Responsive adjustments for sticky subcategories */
  @media (max-width: 768px) {
    .sticky-subcategories {
      padding: 10px 15px !important;
      top: 60px !important;
    }
  }
        `}
        </style>
      </CommonLayout>
    </>
  );
}

export default EducationMainPage;
