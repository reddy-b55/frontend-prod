import moment from "moment";
import Head from "next/head";
import Slider from "react-slick";
import Select from "react-select";
import { parseISO } from "date-fns";
import { useRouter } from "next/router";
import DatePicker from "react-date-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useState, useEffect, useContext, use, useMemo } from "react";
import { Container, Row, Col, Media, Button } from "reactstrap";
import StoreIcon from '@mui/icons-material/Store';

import { AppContext } from "../../_app";
import { db } from "../../../firebase";
import { getSuppliedDetails } from "../../../AxiosCalls/GlobalAxiosServices/globalServices";

import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import LifeStylePricing from "../../../GlobalFunctions/Lifestylefunctions/LifeStylePricing";
import {
  getDistanceFromLatLon,
  gettimeDifference,
  generateSlug,
} from "../../../GlobalFunctions/OthersGlobalfunctions";

import {
  checkAvalibilityandRates,
  getLifestyleproductDetails,
} from "../../../AxiosCalls/LifestyleServices/lifestyleServices";
import { getProductReiews } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";

import ProductTab from "../common/product-tab";
import Service from "../common/service";
import NewProduct from "../common/newProduct";

import PaxIncrementorComponent from "../../../components/common/PaxIncrementor/PaxIncrementorComponent";
import ModalBase from "../../../components/common/Modals/ModalBase";
import LifestylesPricing from "../../../components/common/PackageContainer/PackageContainerLifestyles";
import BuddyModal from "../../../components/common/TravelBuddies/BuddyModal";
import ToastMessage from "../../../components/Notification/ToastMessage";
import CartContainer from "../../../components/CartContainer/CartContainer";
import CommonLayout from "../../../components/shop/common-layout";
import timeView from "../../../public/assets/images/sidebar-svg-files/icons8-clock.svg";
import getDiscountProductBaseByPrice from "../common/GetDiscountProductBaseByPrice";

import ProductSkeleton from "../../skeleton/productSkeleton";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Image from "next/image";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LifestyleCalendar from "../../../components/calender/LifestyleCalendar";
import CurrencyConverterOnlyRate from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRate";

export async function getServerSideProps(context) {
  const id = context.query.pID;
  const name = context.query.name;

  let response = [];
  await getLifestyleproductDetails(id).then((res) => {
    if (res === "Something went wrong !" || res === "(Internal Server Error)") {
      return {
        redirect: {
          destination: "/shop/education",
          permanent: false,
        },
      };
    } else {
      response = res;
    }
  });

  let reviews = [];
  await getProductReiews(3, id).then((res) => {
    if (res === "Something went wrong !" || res === "(Internal Server Error)") {
      reviews = [];
    } else {
      reviews = res;
    }
  });

  const productUrl = `https://www.aahaas.com/product-details/lifestyle/${name}?pID=${id}`;

  if (
    id === "" ||
    id === undefined ||
    id === null ||
    name === "" ||
    name === undefined ||
    name === null
  ) {
    return {
      redirect: {
        destination: "/shop/lifestyle",
        permanent: false,
      },
    };
  }

  const dataset = {
    productData: response,
    productReviews: reviews,
    productId: id,
    canonicalURL: productUrl,
  };

  return {
    props: {
      dataset,
    },
  };
}

const LifestyleProdcutView = ({
  dataset,
  pathId = dataset?.productId,
  canonicalURL = dataset?.canonicalURL,
}) => {
  const router = useRouter();
  const viewStatus = router.query.viewStatus;
  const preId = router.query?.preId;
  const adultcount = router.query.lifeStyle_adult_count;
  const childcount = router.query.lifestyle_children_count;
  const pickup_time = router.query.pickup_time;
  const childAges = router.query.lifestyle_children_ages;
  const childAgesArray = childAges ? childAges.split(",").map(Number) : [];

  console.log("router?.query?.viewStatus", dataset)
  const PID = dataset?.productId;
  const { userStatus, baseUserId, baseCurrencyValue, baseLocation } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [avalibilityLoading, setavalibilityLoading] = useState(false);
  const [packageStatus, setPackageStatus] = useState(false);
  const [travelBuddiesStatus, settravelBuddiesStatus] = useState(false);
  const [showCountBox, setshowCountBox] = useState(false);
  const [packageError, setPackageError] = useState(false);
  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [packageMoreDetails, setPackageMoreDetails] = useState(false);

  const [inventoryData, setInventoryData] = useState([]);
  const [lifeStyleInventory, setLifeStyleInventory] = useState([]);
  const [availableDiscount, setAvailableDiscount] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedLifestyleRates, setSelectedLifestyleRates] = useState([]);
  const [lifeStyleData, setLifeStyleData] = useState([]);
  const [pickupLocations, setPickupLocations] = useState([]);
  const [inventoryRates, setInventoryRates] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [minDate, setMinDate] = useState();
  const [packageData, setPackageData] = useState([]);
  const [cartData, setCartData] = useState([]);
  const [packageRate, setPackageRate] = useState([]);
  const [adultDetails, setAdultDetails] = useState([]);
  const [childsDetails, setChildDetails] = useState([]);
  const [packageDetails, setPackageDetails] = useState([]);
  const [discountClaimed, setDiscountClaimed] = useState(false);

  console.log(inventoryRates,"Inventory Ratesssssss ------------------------------------------")



  const categoryStar = [
    { value: 0, label: "" },
    { value: 1, label: "⭐" },
    { value: 2, label: "⭐⭐" },
    { value: 3, label: "⭐⭐⭐" },
    { value: 4, label: "⭐⭐⭐⭐" },
    { value: 5, label: "⭐⭐⭐⭐⭐" },
  ];

  const products = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    fade: true,
  };

  // const [nav2, setNav2] = useState(null);
  // const [slider1, setSlider1] = useState(null);
  // const [slider2, setSlider2] = useState(null);

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);
  const sessionData = JSON.parse(localStorage.getItem('selectedPax'));
  console.log("sessionData", sessionData);

  const [adultChildMinMax, setAdultChildMinMax] = useState({
    minAdult: "",
    maxAdult: "",
    minChild: "",
    maxChild: "",
    adultAvl: false,
    childAvl: false,
  });

  const [latitudelongtitude, setlatitudelongtitude] = useState({
    latitude: "",
    longitude: "",
  });

  const [handlePopupStatus, setHandlePopupStatus] = useState({
    avalibilityChecking: false,
    customerDetails: false,
    addToCart: false,
  });

  const [pricing, setPricing] = useState({
    child_rate: 0.0,
    adult_rate: 0.0,
    discount_availability: false,
    discount_type: "",
    discount_amount: "",
    discount_symbol: "",
    discountable_child_rate: 0.0,
    discountable_adult_rate: 0.0,
  });

    //hirusha
  const [paxLimitations, setPaxLimitation] = useState([]);
  const [maxChildAdultCounts, setMaxChildAdultCounts] = useState({
    AdultMax: 0,
    ChildMax: 0,
  });

  console.log(sessionData,"Session data value isxsxsxsxsxsxsxsxsx")

  const [customerData, setCustomerData] = useState({
    date: "",
    time: "",
    servicePoint: "",
    selectedDay: "",
    inventoryID: "",
    selectedRateID: "",
    selectedTimeSlot: "",
    betweenHours: "",
    adultCount: !sessionData ? 1 : sessionData?.adult != 0 ? sessionData?.adult : adultcount === undefined ? 1 : adultcount,
    childCount: !sessionData ? 0 : sessionData?.child != 0 ? sessionData?.child : childcount === undefined ? 0 : childcount,
    childAges: [],
    maxAdultOccupancy: "",
    maxChildOccupancy: "",
  });

  const [timeSlots, setTimeSlots] = useState("");

  const [cartStatus, setCartStatus] = useState({
    status: "new",
    preId: 1,
    cartId: null,
  });

  const [categories, setCategories] = useState({
    category1: "",
    category2: "",
    category3: "",
    latitude: "",
    longitude: "",
    vendor_id: "",
    vandorName: "",
    sliderCount: "",
  });

  const [allDates, setAllDates] = useState([]);
  const [availabilityDates, setAvailabilityDates] = useState([]);
  const [isSelectUnavailable, setIsSelectUnavailable] = useState(false);
  const [selectPassengerType, setSelectPassengerType] = useState('all');

  useEffect(() => {
    if(dataset){
      setAllDates(dataset?.productData?.inventoryDates || []);
      setAvailabilityDates(dataset?.productData?.lifeStylesData?.[0]?.closed_days || []);
    }
  },[]);

  const [discountsMetaVal, setDiscountMetaVal] = useState([]);

  const handleDiscountOnClaim = (id) => {
    if (id) {
      setDiscountClaimed(true);
    }
    setDiscountMetaVal(id);
  };

  const getPackageData = async () => {
    // Add validation for required fields
    if (!customerData.servicePoint) {
      ToastMessage({
        status: "warning",
        message: "Please select a location first",
      });
      return;
    }

    if (!customerData.date) {
      ToastMessage({
        status: "warning",
        message: "Please select a service date",
      });
      return;
    }

    if (!customerData.inventoryID) {
      ToastMessage({ status: "warning", message: "Please select a time slot" });
      return;
    }

    if (customerData.adultCount === 0 && customerData.childCount === 0) {
      ToastMessage({
        status: "warning",
        message: "Kindly choose at least one adult or child to get the package",
      });
      return;
    }

    setavalibilityLoading(true);

    const dataD = {
      rate_id: customerData.selectedRateID,
      adult_quantity: customerData.adultCount,
      child_quantity: customerData.childCount,
      child_age: customerData.childAges,
      selectedDate: customerData.date,
    };

    console.log("response lifestyle ratesss", dataD);

    try {
      let response = await checkAvalibilityandRates(dataD);
      console.log("response lifestyle ratesss", response);

      if (response.status === 401) {
        setPackageError(true);
        setPackageData(response.ratePackages);
        setHandlePopupStatus({
          avalibilityChecking: true,
          customerDetails: false,
          addToCart: false,
        });
      } else if (response.status === 200) {
        if (response.packageData.length === 1) {
          handlePackageRate(response.packageData[0]);
        } else {
          setPackageError(false);
          setPackageData(response.packageData);
          setHandlePopupStatus({
            avalibilityChecking: true,
            customerDetails: false,
            addToCart: false,
          });
        }
      } else if (
        response.status === 400 ||
        response === "(Internal Server Error)"
      ) {
        setPackageData([]);
        ToastMessage({
          status: "warning",
          message: "Packages not available for this product",
        });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      ToastMessage({
        status: "error",
        message: "Failed to check availability. Please try again.",
      });
    } finally {
      setavalibilityLoading(false);
    }
  };
  const handlePackageRate = (data) => {
    setPackageRate(data);
    setPackageStatus(true);
    if (userStatus.userLoggesIn) {
      // ToastMessage({ status: "success", message: "Package update successfully", autoClose: '1000' });
       const rate = data?.rate_type == "Package" ? data?.package_rate : data?.child_rate + data.adult_rate;

       if(rate > 0){
         setHandlePopupStatus({
        avalibilityChecking: false,
        customerDetails: true,
        addToCart: false,
      });
       }
     
    } else {
      router.push("/page/account/login-auth");
      localStorage.setItem("lastPath", router.asPath);
      ToastMessage({
        status: "warning",
        message:
          "You are logged in as a guest user. Please login to access the full system features",
      });
    }
  };

  const handleTravelBuddies = (value, type) => {
    let adults = value.filter((res) => {
      return res.PaxType == "1";
    });
    let childs = value.filter((res) => {
      return res.PaxType == "2";
    });

    setAdultDetails(adults);
    setChildDetails(childs);
    settravelBuddiesStatus(true);
    setSelectPassengerType(type)
    handleCloseAllPopup();
  };

  const handleValidateForm = () => {
    if (travelBuddiesStatus && packageStatus) {
      const bookingDetails = {
        life_style_id: pathId,
        lifestyle_rate_id: selectedLifestyleRates?.[0]?.lifestyle_rate_id,
        discount_id: availableDiscount?.discount_id,

        adults: customerData.adultCount,
        children: customerData.childCount,
        lifestyle_inventory_id: customerData.inventoryID,
        bookingDate: customerData.date,
      };

      var childNames = new Array();
      var childAges = new Array();
      var adultNames = new Array();

      for (let i = 0; i < bookingDetails.adults; i++) {
        adultNames.push(
          adultDetails[i]["FirstName"] + " " + adultDetails[i]["LastName"]
        );
      }
      for (let i = 0; i < bookingDetails.children; i++) {
        childNames.push(
          childsDetails[i]["FirstName"] + " " + childsDetails[i]["LastName"]
        );
        childAges.push(childsDetails[i]["Age"]);
      }

      // console.log("adultNames", adultNames, adultDetails)
      // console.log("childAges", childAges)
      // console.log("childNames", childNames, childsDetails)
      // return

      let discountMetaValueSet = null;
      if (discountClaimed == false) {
        if (discounts?.length > 0) {
          const filteredDiscounts = discounts.filter(
            (data) =>
              data?.origin_package_rate_id == packageRate?.package_id &&
              (data?.discount_type == "value" ||
                data?.discount_type == "precentage")
          );

          discountMetaValueSet =
            filteredDiscounts.length > 0
              ? JSON.stringify(filteredDiscounts?.[0])
              : null;
        }
      } else {
        discountMetaValueSet = discountsMetaVal?.id
          ? JSON.stringify(discountsMetaVal)
          : null;
      }

      const dataD = {
        lifestyle_id: bookingDetails.life_style_id,
        lifestyle_inventory_id: bookingDetails.lifestyle_inventory_id,
        lifestyle_rate_id: bookingDetails.lifestyle_rate_id,
        lifestyle_discount_id: bookingDetails.discount_id,
        lifestyle_adult_count: bookingDetails.adults,
        lifestyle_children_count: bookingDetails.children,
        lifestyle_children_ages:
          bookingDetails.children > 0 ? childAges.toString() : "",
        booking_date: bookingDetails.bookingDate,
        lifestyle_adult_details: adultNames.toString(),
        lifestyle_children_details: childNames.toString(),
        // lifestyle_children_ages: childAges.toString(),
        lifestyle_package_rate_id: packageRate.package_id,
        booking_status: "Pending",
        main_category_id: 3,
        cart_id: cartStatus.cartId,
        user_id: baseUserId.cxid,
        viewStatus: cartStatus.status,
        preId: cartStatus.preId,
        customer_location_latlon: "",
        customer_address: "",
        discount_meta_value_set: discountMetaValueSet,
        travel_buddy_adult_id: adultDetails
    .map(buddy => buddy.id)
    .join(','),
        travel_buddy_child_id:  childsDetails
    .map(buddy => buddy.id)
    .join(','),
      };

      // console.log("dataD", dataD, adultDetails, childsDetails);
      // return;
      if (userStatus.userLoggesIn) {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: false,
          addToCart: true,
        });
        setCartData(dataD);
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath);
        ToastMessage({
          status: "warning",
          message:
            "You are logged in as a guest user. Please login to access the full system features",
        });
      }
    } else {
      if (!packageStatus) {
        ToastMessage({
          status: "warning",
          message: "kindly choose the package",
        });
      }
      if (!travelBuddiesStatus) {
        ToastMessage({
          status: "warning",
          message: "kindly choose the travel buddies",
        });
      }
    }
  };

  // const handleValidateForm = () => {

  //     if (travelBuddiesStatus && packageStatus) {

  //       const bookingDetails = {

  //         life_style_id: pathId,
  //         lifestyle_rate_id: selectedLifestyleRates?.[0]?.lifestyle_rate_id,
  //         discount_id: availableDiscount?.discount_id,

  //         adults: customerData.adultCount,
  //         children: customerData.childCount,
  //         lifestyle_inventory_id: customerData.inventoryID,
  //         bookingDate: customerData.date,

  //       };

  //       var childNames = new Array();
  //       var childAges = new Array();
  //       var adultNames = new Array();

  //       for (let i = 0; i < bookingDetails.adults; i++) {
  //         adultNames.push(
  //           adultDetails["adult_fname" + i] + " " + adultDetails["adult_sname" + i]
  //         );
  //       }
  //       for (let i = 0; i < bookingDetails.children; i++) {
  //         childNames.push(
  //           childsDetails["child_fname" + i] + " " + childsDetails["child_sname" + i]
  //         );
  //         childAges.push(childsDetails["child_age" + i]);
  //       }

  //       let discountMetaValueSet = null;
  //       if (discountClaimed == false) {
  //         if (discounts?.length > 0) {
  //           const filteredDiscounts = discounts.filter(
  //             (data) =>
  //               data?.origin_package_rate_id == packageRate?.package_id &&
  //               (data?.discount_type == "value" ||
  //                 data?.discount_type == "precentage")
  //           );

  //           discountMetaValueSet =
  //             filteredDiscounts.length > 0
  //               ? JSON.stringify(filteredDiscounts?.[0])
  //               : null;
  //         }
  //       } else {
  //         discountMetaValueSet = discountsMetaVal?.id
  //           ? JSON.stringify(discountsMetaVal)
  //           : null;
  //       }

  //       const dataD = {
  //         lifestyle_id: bookingDetails.life_style_id,
  //         lifestyle_inventory_id: bookingDetails.lifestyle_inventory_id,
  //         lifestyle_rate_id: bookingDetails.lifestyle_rate_id,
  //         lifestyle_discount_id: bookingDetails.discount_id,
  //         lifestyle_adult_count: bookingDetails.adults,
  //         lifestyle_children_count: bookingDetails.children,
  //         booking_date: bookingDetails.bookingDate,
  //         lifestyle_adult_details: adultNames.toString(),
  //         lifestyle_children_details: childNames.toString(),
  //         lifestyle_children_ages: childAges.toString(),
  //         lifestyle_package_rate_id: packageRate.package_id,
  //         booking_status: "Pending",
  //         main_category_id: 3,
  //         cart_id: cartStatus.cartId,
  //         user_id: baseUserId.cxid,
  //         viewStatus: cartStatus.status,
  //         preId: cartStatus.preId,
  //         customer_location_latlon: '',
  //         customer_address: '',
  //         discount_meta_value_set: discountMetaValueSet
  //       };

  //       if (userStatus.userLoggesIn) {
  //         setHandlePopupStatus({
  //           avalibilityChecking: false,
  //           customerDetails: false,
  //           addToCart: true
  //         })
  //         setCartData(dataD)
  //       } else {
  //         router.push("/page/account/login-auth");
  //         localStorage.setItem("lastPath", router.asPath)
  //         ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
  //       }

  //     } else {
  //       if (!packageStatus) {
  //         ToastMessage({ status: "warning", message: "kindly choose the package" })
  //       }
  //       if (!travelBuddiesStatus) {
  //         ToastMessage({ status: "warning", message: "kindly choose the travel buddies" })
  //       }
  //     }

  //   };

  const handlePassData = (value) => {
    if (value === "await") {
      ToastMessage({
        status: "loading",
        message: "Product addig into a cart click here to undo",
        autoClose: 5000,
      });
      handleCloseAllPopup();
    } else {
      if (value == "existing") {
        ToastMessage({ status: "warning", message: "Product already in cart" });
        handleCloseAllPopup();
      } else if (value) {
        // router.push('/page/account/cart-page');
        router.push("/shop/lifestyle");
      } else {
        ToastMessage({
          status: "warning",
          message: "failed to add the product, please try again later..",
        });
        handleCloseAllPopup();
      }
    }
  };

  const handleTravelBuddiesModal = () => {
    setHandlePopupStatus({
      avalibilityChecking: false,
      customerDetails: true,
      addToCart: false,
    });
  };

  const handleCloseAllPopup = () => {
    setHandlePopupStatus({
      avalibilityChecking: false,
      customerDetails: false,
      addToCart: false,
    });
  };

// Update the minDate calculation in loadProductData function
const loadProductData = async () => {
  await removeExistingValues();
  setLoading(true);

  const response = dataset.productData;

  if (response.status === 200) {
    let lifeStyleInventoryRates = response.lifeStyleInventoryRates;
    console.log("Reetha:xxxxxxxxxxx",response);

    // FIXED: Calculate minDate based on book_by_days
    const bookByDays = lifeStyleInventoryRates[0]?.book_by_days || 0;
    let minDate;
    
    if (bookByDays > 0) {
      // If book_by_days is provided, calendar should start from today + book_by_days
      minDate = moment()
        .add(bookByDays, 'days')
        .format("YYYY-MM-DD");
    } else {
      // If no book_by_days or it's 0, start from today
      minDate = moment().format("YYYY-MM-DD");
    }
    
    setMinDate(minDate);

    console.log("Calendar settings:", {
      bookByDays,
      minDate,
      availableDates: response.inventoryDates
    });

    // Rest of your existing code...
    setPaxLimitation(response.availablePaxTypes);
    setPackageDetails(response.packages[0]);
    setLifeStyleData(response.lifeStylesData[0]);
    setPricing(response.lifeStyleRate[0]);
    setInventoryRates(lifeStyleInventoryRates);
    setDiscounts(response.discountPackage);

    let lifestyleinventory = response.lifeStyleInventory;
    setLifeStyleInventory(lifestyleinventory);

    let lifestyleavailableDates = response.inventoryDates.map((date) =>
      parseISO(date)
    );
    setAvailableDates(lifestyleavailableDates);

    const pickupLocations = response.servicePoints.map((value) => ({
      value: value.pickup_location,
      label: value.pickup_location,
    }));

    setPickupLocations(pickupLocations);

    let prod_dataset = response.lifeStylesData[0];

    setCategories({
      ...categories,
      category1: prod_dataset.category1,
      category2: prod_dataset.category2,
      category3: prod_dataset.category3,
      latitude: response.lifeStyleInventory[0]?.latitude,
      longitude: response.lifeStyleInventory[0]?.longitude,
      vendor_id: prod_dataset?.vendor_id,
      sliderCount: "4",
    });

    // product reviews
    setReviews(dataset.productReviews);
    setLoading(false);

    updateInitialValue(
      lifestyleavailableDates,
      lifestyleinventory,
      pickupLocations,
      lifeStyleInventoryRates
    );
  } else {
    router.replace("/shop/lifestyle");
  }
};

  // const updateInitialValue = async (availableDates, inventory, pickupLocations, lifeStyleInventoryRates) => {

  //   const today = moment().startOf('day');
  //   const enabledDates = availableDates.filter(value => moment(value).isSameOrAfter(today, 'day'));
  //   let updateStatus = router?.query?.viewStatus;
  //   console.log("updateStatus", updateStatus)

  //   if (enabledDates.length > 0) {
  //     let formattedDate = moment(enabledDates?.[0]).format("YYYY-MM-DD");
  //     if (updateStatus === 'update') {
  //       setCartStatus({
  //         status: 'update',
  //         preId: router?.query?.preId,
  //         cartId: router?.query?.selectedCart_id
  //       })
  //       try {
  //         await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, false, true, inventory, lifeStyleInventoryRates);
  //       }
  //       catch (error) {
  //         await handleOnDataChange(formattedDate, pickupLocations[0].value, false, true, inventory, lifeStyleInventoryRates);
  //       }
  //     } else if (updateStatus === 'checkavalibility') {
  //       try {
  //         await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, lifeStyleInventoryRates);
  //       } catch (error) {
  //         await handleOnDataChange(formattedDate, pickupLocations[0].value, false, true, inventory, lifeStyleInventoryRates);
  //       }
  //     } else {
  //       await handleOnDataChange(formattedDate, pickupLocations[0].value, false, true, inventory, lifeStyleInventoryRates);
  //     }
  //   }

  // }

  // const updateInitialValue = async (availableDates, inventory, pickupLocations, lifeStyleInventoryRates) => {
  //   // We still check for enabled dates, but don't automatically select them
  //   const today = moment().startOf('day');
  //   const enabledDates = availableDates.filter(value => moment(value).isSameOrAfter(today, 'day'));
  //   let updateStatus = router?.query?.viewStatus;
  //   console.log("updateStatus", updateStatus);

  //   // Only set the service location by default - not the date
  //   if (pickupLocations.length > 0) {
  //     setCustomerData({
  //       ...customerData,
  //       servicePoint: pickupLocations[0].value
  //     });
  //   }

  //   // Only set a date for special routing cases
  //   if (enabledDates.length > 0) {
  //     let formattedDate = moment(enabledDates?.[0]).format("YYYY-MM-DD");

  //     if (updateStatus === 'update') {
  //       setCartStatus({
  //         status: 'update',
  //         preId: router?.query?.preId,
  //         cartId: router?.query?.selectedCart_id
  //       });

  //       try {
  //         // For update, we do set the date from query
  //         await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, false, true, inventory, lifeStyleInventoryRates);
  //       } catch (error) {
  //         // Even in case of error, we don't want to set a default date
  //         // Just set the location
  //         console.error("Error handling update:", error);
  //       }
  //     } else if (updateStatus === 'checkavalibility') {
  //       try {
  //         // For checkavalibility, we do set the date from query
  //         await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, lifeStyleInventoryRates);
  //       } catch (error) {
  //         // Even in case of error, we don't want to set a default date
  //         // Just set the location
  //         console.error("Error handling checkavalibility:", error);
  //       }
  //     }
  //     // Note: No else case that automatically sets a date
  //   }
  // };

  const updateInitialValue = async (
  availableDates,
  inventory,
  pickupLocations,
  lifeStyleInventoryRates
) => {
  const today = moment().startOf("day");
  const bookByDays = lifeStyleInventoryRates[0]?.book_by_days || 0;
  
  // Filter available dates based on book_by_days
  const enabledDates = availableDates.filter((value) => {
    const availableDate = moment(value);
    const minAllowedDate = moment().add(bookByDays, 'days').startOf('day');
    return availableDate.isSameOrAfter(minAllowedDate, 'day');
  });

  let updateStatus = router?.query?.viewStatus || "checkavalibility";
  console.log("updateStatus", updateStatus);

  // Only handle special routing cases (update/checkavalibility)
  if (updateStatus === "update") {
    setCartStatus({
      status: "update",
      preId: router?.query?.preId,
      cartId: router?.query?.selectedCart_id,
    });

    try {
      await handleOnDataChange(
        router?.query?.service_date,
        router?.query?.service_location,
        false,
        true,
        inventory,
        lifeStyleInventoryRates
      );
    } catch (error) {
      console.error("Error handling update:", error);
    }
  } else if (updateStatus === "checkavalibility") {
    try {
      await handleOnDataChange(
        router?.query?.service_date,
        router?.query?.service_location,
        lifeStyleInventoryRates
      );
    } catch (error) {
      console.error("Error handling checkavalibility:", error);
    }
  }
};

  const handleServicePoint = async (e) => {
    setCustomerData({
      ...customerData,
      servicePoint: e.value,
    });
    setPackageRate([]);
    setPackageStatus(false);
    await handleOnDataChange(
      customerData.date,
      e.value,
      true,
      false,
      lifeStyleInventory,
      inventoryRates
    );
  };

  const handleSerciceTimeSlot = (e) => {
    console.log("time slot", gettimeDifference(e.label));
    setTimeSlots(gettimeDifference(e.label));
    setCustomerData({
      ...customerData,
      time: e.label,
      inventoryID: e.value,
    });
    setPackageRate([]);
    setPackageStatus(false);
  };

  // const handleOnDataChange = async (value, propsLocation, state = false, initialUpdate = false, inventory, lifeStyleInventoryRates) => {

  //   setPackageRate([])
  //   setPackageStatus(false);

  //   let location = propsLocation || pickupLocations[0].value;
  //   let result = moment(value).format("YYYY-MM-DD").toString();

  //   let inventoryData = [];
  //   if (initialUpdate) {
  //     inventoryData = inventory.filter((inventory) => {
  //       return inventory.inventory_date === result && inventory.pickup_location === location
  //     });
  //   } else {
  //     inventoryData = lifeStyleInventory.filter((inventory) => {
  //       return inventory.inventory_date === result && inventory.pickup_location === location
  //     });
  //   }

  //   if (inventoryData.length === 0) {
  //     ToastMessage({ status: "warning", message: `There is no time slots for your selected date ${result}` })
  //   } else {
  //     let inventoryDataSelect = []
  //     inventoryData.map((value) => {
  //       inventoryDataSelect.push({ label: value.pickup_time, value: value.lifestyle_inventory_id })
  //     })
  //     if (router?.query?.viewStatus === 'update') {

  //       console.log("router?.query?.viewStatus", router?.query?.viewStatus)
  //       try {
  //         if (state === true) {
  //           await getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //         } else {
  //           await getRatesAndDetails(router?.query?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //         }
  //       } catch (error) {
  //         await getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //       }
  //     }
  //     if (router?.query?.viewStatus === 'checkavalibility') {
  //       try {
  //         if (state === true) {
  //           await getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //         } else {
  //           await getRatesAndDetails(router?.query?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //         }
  //       } catch (error) {
  //         await getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //       }
  //     } else {
  //       await getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //     }
  //   }

  // };

  // based on timeslots we are fetching rates
 const handleOnDataChange = async (
  value,
  propsLocation,
  state = false,
  initialUpdate = false,
  inventory,
  lifeStyleInventoryRates
) => {
  // Don't proceed if date is not selected
  if (!value) {
    setInventoryData([]);
    return;
  }

  setPackageRate([]);
  setPackageStatus(false);

  let location = propsLocation || customerData.servicePoint;

  // Don't proceed if location is not selected
  if (!location) {
    ToastMessage({
      status: "warning",
      message: "Please select a location first",
    });
    return;
  }

  let result = moment(value).format("YYYY-MM-DD").toString();
  
  // VALIDATION: Check against book_by_days
  const bookByDays = lifeStyleInventoryRates[0]?.book_by_days || 0;
  const minAllowedDate = moment().add(bookByDays, 'days').startOf('day');
  const selectedDate = moment(value).startOf('day');
  
  if (selectedDate.isBefore(minAllowedDate)) {
    ToastMessage({
      status: "warning",
      message: `Booking is only allowed ${bookByDays} day(s) in advance. Please select a date after ${minAllowedDate.format('YYYY-MM-DD')}`
    });
    return;
  }

  if(result) {
    const dayName = moment(result).format('dddd');
    if(availabilityDates.includes(dayName)) {
      setIsSelectUnavailable(true);
    } else {
      setIsSelectUnavailable(false);
    }
  }

  console.log("value is 1233333", result);
  let inventoryData = [];
  if (initialUpdate) {
    inventoryData = inventory.filter((inventory) => {
      return (
        inventory.inventory_date === result &&
        inventory.pickup_location === location
      );
    });
  } else {
    inventoryData = lifeStyleInventory.filter((inventory) => {
      return (
        inventory.inventory_date === result &&
        inventory.pickup_location === location
      );
    });
  }

  if (inventoryData.length === 0) {
    ToastMessage({
      status: "warning",
      message: `There are no time slots available for your selected date ${result} at ${location}`,
    });
    setInventoryData([]);
  } else {
    let inventoryDataSelect = [];
    inventoryData.map((value) => {
      inventoryDataSelect.push({
        label: value.pickup_time,
        value: value.lifestyle_inventory_id,
      });
    });

    if (
      router?.query?.viewStatus === "update" ||
      router?.query?.viewStatus === "checkavalibility" ||
      router?.query?.viewStatus === undefined
    ) {
      try {
        let inventoryId =
          router?.query?.lifestyle_inventory_id ||
          inventoryData[0]?.lifestyle_inventory_id;
        await getRatesAndDetails(
          inventoryId,
          inventoryData,
          location,
          inventoryDataSelect,
          lifeStyleInventoryRates
        );
      } catch (error) {
        console.error("Error getting rates:", error);
      }
    }
  }
};

  const getRatesAndDetails = async (
    id,
    inventoryDataPara,
    location,
    inventoryDataSelect,
    lifeStyleInventoryRates
  ) => {
    const state = router?.query?.viewStatus;

    let inventoryDataSet = [];

    if (state === "update") {
      inventoryDataSet = inventoryDataPara;
    } else {
      inventoryDataSet = inventoryDataPara.filter((data) => {
        return Number(data.lifestyle_inventory_id) === Number(id);
      });
    }

    console.log(
      "inventoryDataSet is 1233333",
      inventoryDataSet,
      inventoryDataPara,
      id
    );
    setlatitudelongtitude({
      latitude: inventoryDataSet[0]?.latitude,
      longitude: inventoryDataSet[0]?.longitude,
    });

    if (inventoryDataSet.length > 0) {
      let rateID = inventoryDataSet[0]?.rate_id;
      let result = gettimeDifference(inventoryDataSet[0]?.pickup_time);
      console.log("result is 1233333", inventoryDataSelect);
      setInventoryData(inventoryDataSelect);

      let adultAvl = true;
      let childAvl = true;

      if (
        packageDetails?.min_adult_occupancy === 0 &&
        packageDetails?.max_adult_occupancy === 0
      ) {
        adultAvl = false;
      }

      if (
        packageDetails?.min_child_occupancy === 0 &&
        packageDetails?.max_child_occupancy === 0
      ) {
        childAvl = false;
      }

      setAdultChildMinMax({
        minAdult: 20,
        maxAdult: 20,
        minChild: 20,
        maxChild: 20,
        adultAvl: adultAvl,
        childAvl: childAvl,
      });

      console.log("adultAvllllllll", inventoryDataSet[0].inventory_date);

      setCustomerData({
        ...customerData,
        date: inventoryDataSet[0].inventory_date,
        selectedRateID: inventoryDataSet[0]?.rate_id,
        selectedTimeSlot: inventoryDataSet[0]?.pickup_time,
        betweenHours: result,
        inventoryID: inventoryDataSet[0]?.lifestyle_inventory_id,
        adultCount: adultcount != null ? adultcount : adultAvl ? 1 : 0,
        // adultCount: adultAvl ? 1 : 0,
        childCount:
          childcount != null ? childcount : !adultAvl && childAvl ? 1 : 0,
        servicePoint: location,
        childAges: !adultAvl && childAvl ? { child0: 1 } : [],
      });

      await getLifestyleRates(rateID, lifeStyleInventoryRates);
    }
  };
  useEffect(() => {
    // getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  }, []);

  const getLifestyleRates = async (rateID, lifeStyleInventoryRates) => {
    let rateData = lifeStyleInventoryRates.filter((rate) => {
      return "" + rate.lifestyle_rate_id === "" + rateID;
    });

    let discount = discounts.filter((discount) => {
      return "" + discount.rate_id === "" + rateID;
    });

    if (discount?.length > 0 && rateData?.length > 0) {
      var childRate = rateData?.[0]["child_rate"];
      var adultRate = rateData?.[0]["adult_rate"];
      var discountChild = 0.0;
      var discountAdult = 0.0;
      var discountType = discount?.[0]["discount_type"];
      var discountSymbol = "";
      if (discountType === "Amount") {
        discountChild = childRate - discount?.[0]["value"];
        discountAdult = adultRate - discount?.[0]["value"];
        discountSymbol = "$";
        setPricing({
          child_rate: childRate,
          adult_rate: adultRate,
          discount_availability: true,
          discount_type: "Amount",
          discount_amount: "",
          discount_symbol: "",
          discountable_child_rate: discountChild,
          discountable_adult_rate: discountAdult,
        });
      } else if (discountType === "%") {
        discountChild = childRate - childRate * (discount?.[0]["value"] / 100);
        discountAdult = adultRate - adultRate * (discount?.[0]["value"] / 100);
        discountSymbol = "%";
        setPricing({
          child_rate: childRate,
          adult_rate: adultRate,
          discount_availability: true,
          discount_type: "%",
          discount_amount: "",
          discount_symbol: "",
          discountable_child_rate: discountChild,
          discountable_adult_rate: discountAdult,
        });
      }
      setPricing(
        LifeStylePricing(
          rateData?.[0],
          discount?.[0],
          customerData.childCount,
          customerData.adultCount
        )
      );
    } else {
      setPricing({
        ...pricing,
        child_rate: rateData?.[0]?.["child_rate"],
        adult_rate: rateData?.[0]?.["adult_rate"],
        discountable_adult_rate: 0.0,
        discountable_child_rate: 0.0,
        discount_availability: false,
        discount_amount: "",
        discount_type: "",
        discount_symbol: "",
      });
    }

    setSelectedLifestyleRates(rateData);
    setAvailableDiscount(discount?.[0]);
  };

  const [chatCreating, setChatCreating] = useState(false);

  const handleChatInitiate = async () => {
    setChatCreating(true);
    if (chatCreating) {
      ToastMessage({
        status: "warning",
        message: "Already a chat has been initiated",
      });
    } else {
      if (userStatus.userLoggesIn) {
        await addDoc(collection(db, "customer-chat-lists"), {
          status: "Pending",
          createdAt: new Date(),
          supplierAdded: "false",
          notifyAdmin: "true",
          notifySupplier: "false",
          notifyCustomer: "false",
          supplier_name: "",
          customer_name: baseUserId.user_username,
          customer_mail_id: baseUserId.user_email,
          supplier_mail_id: "",
          customer_id: baseUserId.cxid,
          chat_related: "Technical-support",
          customer_collection_id: baseUserId.cxid,
          chat_related_to: "Product",
          supplier_mail_id: "aahaas@gmail.com",
          group_chat: "true",
          supplier_added_date: Date.now(),
          chat_category: lifeStyleData.category1,
          chat_related_id: 3,
          chat_avatar: lifeStyleData.image,
          supplier_id: lifeStyleData.vendor_id,
          chat_name: lifeStyleData.lifestyle_name,
          comments: { category: 3, product_id: lifeStyleData?.lifestyle_id },
          // comments: 'Product support - chat has been created from product details',
          updatedAt: new Date(),
        }).then((response) => {
          setChatCreating(false);
          // router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
          const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
          window.open(chatUrl, "_blank");
        });
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath);
        ToastMessage({
          status: "warning",
          message:
            "You are logged in as a guest user. Please login to access the full system features",
        });
      }
    }
  };

  const removeExistingValues = async () => {
    setLifeStyleData([]);
    setPricing([]);
    setPickupLocations([]);
    setLifeStyleInventory([]);
    setInventoryRates([]);
    setDiscounts([]);
    setAvailableDates([]);
    setInventoryData([]);
    setSelectedLifestyleRates([]);
    setAvailableDiscount([]);

    setPackageStatus(false);
    settravelBuddiesStatus(false);

    setCustomerData({
      date: "", // Keep empty
      selectedRateID: "",
      selectedTimeSlot: "",
      betweenHours: "",
      inventoryID: "",
      adultCount: !sessionData ? 1 :sessionData?.adult != 0 ? sessionData?.adult : adultcount === undefined ? 0 : adultcount,
      childCount: !sessionData ? 0 :sessionData?.child != 0 ? sessionData?.child : childcount === undefined ? 0 : childcount,
      maxAdultOccupancy: "",
      maxChildOccupancy: "",
      servicePoint: "", // Keep empty
      time: "", // Keep empty
    });

    setlatitudelongtitude({
      latitude: "",
      longitude: "",
    });

    setPricing({
      child_rate: "",
      adult_rate: "",
      discount_availability: true,
      discount_type: "",
      discount_amount: "",
      discount_symbol: "",
      discountable_child_rate: "",
      discountable_adult_rate: "",
    });
  };

  useEffect(()=>{
   
    if(sessionData){
      handleValidateAdultChildCount(sessionData);
    }
    console.log("session Dataaaaaaaaa", sessionData);
  },[])

  const handleValidateAdultChildCount = (value) => {
    console.log("value is 1233333", value.adult);
    setCustomerData({
      ...customerData,
      adultCount: value.adult,
      childCount: value.child,
      childAges: value.childAges,
    });
    setPackageRate([]);
    setAdultDetails([]);
    setChildDetails([]);
    setPackageStatus(false);
  };

  const handleNavigateMap = () => {
    // window.open(`https://www.google.com/maps/dir/${baseLocation.latitude}, ${baseLocation.longtitude} / ${latitudelongtitude?.latitude}, ${latitudelongtitude?.longitude}`, '_blank')
    window.open(
      `https://www.google.com/maps?q=${dataset?.productData?.lifeStyleInventory?.[0]?.latitude},${dataset?.productData?.lifeStyleInventory?.[0]?.longitude}`,
      "_blank"
    );
  };

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  };

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  };

  const handleMoreDetailsOpen = () => {
    setPackageMoreDetails(true);
  };

  const handleMoreDetailsClose = () => {
    setPackageMoreDetails(false);
  };

  const isAvailable = (date) => {
    return availableDates.some((availableDate) =>
      isSameDay(parseISO(date), availableDate)
    );
  };

  useEffect(() => {
    loadProductData();
  }, [dataset]);

  useEffect(() => {
    setNav2(slider2);
  }, [slider1, slider2]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [window.location.href]);

  useEffect(() => {
    setMaxChildAdultCounts(dataset.productData.maxAdultCountAndChildCount);
    console.log(maxChildAdultCounts);
  }, [dataset.productData]);

  useEffect(() => {
    if (customerData.date != "" && customerData.servicePoint != "") {
      const dataSet = {
        id: pathId,
        date: customerData.date,
        servicePoint: customerData.servicePoint,
      };

      // console.log(dataSet,"Inventory Get Data set issssssssssssss")

      axios.post("getLifestyleAvailableInventoryRates", dataSet).then((res) => {
        if (res.data.status == 200) {
          console.log(
            "Inventory Get Data set chamod",
            res.data.lifeStyleInventory
          );

          console.log(res.data,"Res data isssxsxsxsxsxsxsxsxsxsxs")

          setCustomerData({
            ...customerData,
            date: res.data.lifeStyleInventory?.[0]?.inventory_date,
            selectedRateID: res.data.lifeStyleInventory?.[0]?.rate_id,
            selectedTimeSlot: res.data.lifeStyleInventory?.[0]?.pickup_time,
            inventoryID:
              res.data.lifeStyleInventory?.[0]?.lifestyle_inventory_id,
          });

          let inventoryDataSelect = [];
          res?.data?.lifeStyleInventory.map((value) => {
            inventoryDataSelect.push({
              label: value.pickup_time,
              value: value.lifestyle_inventory_id,
            });
          });

          console.log("result is 1233333", inventoryDataSelect);
          setInventoryData(inventoryDataSelect);

          console.log(
            "Inventory Get Data set issssssssssssss",
            inventoryDataSelect?.[0]?.lifestyle_inventory_id
          );

          //  console.log("Inventory Get Data set issssssssssssss", inventoryDataSelect);
        }
      });
    }
  }, [customerData.servicePoint, customerData.date]);

  const getAvailableDiscountByPackageId = () => {
    var discountMetaValueSet = null;

    if (discountClaimed == false) {
      if (discounts?.length > 0) {
        const filteredDiscounts = discounts.filter(
          (data) => data?.origin_package_rate_id == packageRate?.package_id
        );

        discountMetaValueSet =
          filteredDiscounts.length > 0 ? filteredDiscounts?.[0] : null;
      }
    }
    console.log("discountMetaValueSet", discountMetaValueSet);
    return discountMetaValueSet;
  };

  useEffect(() => {
    if (slider1 && slider2) {
      setNav1(slider1);
      setNav2(slider2);
    }
  }, [slider1, slider2]);

  const maxAvailableDate = useMemo(() => {
    return availableDates.reduce((max, date) => {
      return new Date(date) > new Date(max) ? date : max;
    }, availableDates[0]);
  }, [availableDates]);

  const handleBack = (e) => {
  e.preventDefault();
  
  // Disable scroll restoration temporarily
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  
  // Go back
  window.history.back();
  
  // Reset scroll after a short delay
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 50);
};
const [cancellationDays, setCancellationDays] = useState(0);

// 2. Update the useEffect that fetches rates when date/location changes
useEffect(() => {
  if (customerData.date != "" && customerData.servicePoint != "") {
    const dataSet = {
      id: pathId,
      date: customerData.date,
      servicePoint: customerData.servicePoint,
    };

    axios.post("getLifestyleAvailableInventoryRates", dataSet).then((res) => {
      if (res.data.status == 200) {
        console.log("Inventory Get Data set chamod", res.data.lifeStyleInventory);

        // SET CANCELLATION DAYS FROM THE RESPONSE
        if (res.data.lifeStyleRate && res.data.lifeStyleRate.length > 0) {
          setCancellationDays(res.data.lifeStyleRate[0]?.cancellation_days || 0);
        }

        setCustomerData({
          ...customerData,
          date: res.data.lifeStyleInventory?.[0]?.inventory_date,
          selectedRateID: res.data.lifeStyleInventory?.[0]?.rate_id,
          selectedTimeSlot: res.data.lifeStyleInventory?.[0]?.pickup_time,
          inventoryID: res.data.lifeStyleInventory?.[0]?.lifestyle_inventory_id,
        });

        let inventoryDataSelect = [];
        res?.data?.lifeStyleInventory.map((value) => {
          inventoryDataSelect.push({
            label: value.pickup_time,
            value: value.lifestyle_inventory_id,
          });
        });

        setInventoryData(inventoryDataSelect);
      }
    });
  }
}, [customerData.servicePoint, customerData.date]);


  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalURL} as={canonicalURL} />
        <title>
          Aahaas - {dataset.productData.lifeStylesData[0].lifestyle_name} |
          Unique Experiences with Aahaas in Sri Lanka
        </title>
        <meta
          name="description"
          content={`Discover ${dataset.productData.lifeStylesData[0].lifestyle_name} and other fun activities in Sri Lanka! Explore recreational experiences, top tourist activities, and unforgettable adventures on Aahaas.`}
        />
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
                  name: "Lifestyle",
                  item: "https://www.aahaas.com/product-details/lifestyle/",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Lifestyle",
                  item: `https://www.aahaas.com/product-details/lifestyle/${generateSlug(
                    dataset.productData.lifeStylesData[0].lifestyle_name
                  )}?pID=${pathId}`,
                },
              ],
            }),
          }}
        />
      </Head>

      <CommonLayout
        parent="Home"
        title={"lifestyle"}
        subTitle={"product view"}
        subTitleParentLink={"/shop/lifestyle"}
        openSubFilter={() => openSubFilter()}
        showSearchIcon={false}
        showMenuIcon={true}
        location={false}
      >
             {/* <nav aria-label="Breadcrumb" style={{ marginTop: "10px" }}>   
  <ol>     
    <li>
      <button onClick={handleBack} style={{ border: 'none', background: 'none' }}>
        <ArrowBackIcon/>
      </button>
    </li>   
  </ol> 
</nav> */}
        <div
          className={`collection-wrapper p-sm-2 mt-lg-5 ${
            loading ? "mb-5" : "mb-0"
          }`}
        >
          <Container>
            <Row>
              <Col
                sm="3"
                className="collection-filter"
                id="filter"
                style={openSideBarStatus ? { left: "0px" } : {}}
              >
                <div
                  className="collection-mobile-back"
                  onClick={() => closeSubFilter()}
                >
                  <span className="filter-back">
                    <i className="fa fa-angle-left"></i> back
                  </span>
                </div>
                {loading ? (
                  <ProductSkeleton skelotonType="productDetails-left-moreDetails" />
                ) : (
                  <>
                    {/* <Service serviceType='lifestyle' discounts={discounts} serviceDate={customerData.date} cancellationDays={inventoryRates?.[0]?.cancellation_days} bookingDeadline={inventoryRates[0].book_by_days} latitude={latitudelongtitude?.latitude} longitude={latitudelongtitude?.longitude} locationName={customerData?.servicePoint} productReview={categoryStar[reviews?.overall_rate?.[0]]?.label} productReviewCount={reviews?.overall_rate?.[1]} serviceLocations={pickupLocations} showitem={['proDiscounts', 'cancellationDays', 'deadline', 'mapView', 'reviewStar', 'avalibleLocations']} height="360px" handleDiscountOnClaim={handleDiscountOnClaim} /> */}
                    <Service
                      serviceType="lifestyle"
                      discounts={discounts}
                      serviceDate={customerData.date}
                      cancellationDays={cancellationDays}
                      bookingDeadline={inventoryRates?.[0]?.book_by_days}
                      latitude={
                        dataset?.productData?.lifeStyleInventory?.[0]?.latitude
                      }
                      longitude={
                        dataset?.productData?.lifeStyleInventory?.[0]?.longitude
                      }
                      locationName={customerData?.servicePoint}
                      productReview={
                        reviews?.overall_rate?.[0]
                          ? categoryStar[
                              reviews?.overall_rate?.[0] % 1 >= 0.5
                                ? Math.ceil(reviews?.overall_rate?.[0])
                                : Math.floor(reviews?.overall_rate?.[0])
                            ]?.label
                          : null
                      }
                      productReviewCount={reviews?.overall_rate?.[1]}
                      serviceLocations={pickupLocations}
                      showitem={[
                        "proDiscounts",
                        "cancellationDays",
                        // "deadline",
                        "mapView",
                        "reviewStar",
                        "avalibleLocations",
                      ]}
                      height="360px"
                      handleDiscountOnClaim={handleDiscountOnClaim}
                      discountsMetaVal={discountsMetaVal}
                    />

                    <NewProduct
                      sliderCount={categories.sliderCount}
                      category1={"3"}
                      vendor={categories.vendor_id}
                      vandorName={categories.vandorName}
                      latitude={latitudelongtitude?.latitude}
                      longitude={latitudelongtitude?.longitude}
                      p_ID={PID}
                    />
                  </>
                )}
              </Col>
              <Col lg="9" sm="12" xs="12">
                <Container fluid={true} className="p-0">
                  {loading ? (
                    <ProductSkeleton skelotonType="productDetails" />
                  ) : (
                    <Row className="p-0 m-0 product-view-mobile">
                      {/* <Col lg="5" className="product-thumbnail p-0 m-0">
                          <Slider {...products} asNavFor={nav2} ref={(slider) => setSlider1(slider)} className="product-slick">
                            {lifeStyleData?.image?.split(',').map((vari, index) => (
                              <div key={index} className="mx-3">
                                <Media src={`${vari}`} alt='Recreational Activities in Sri Lanka' className="img-fluid product-main-image" style={{ width: "100%", height: (packageStatus && lifeStyleData?.image?.split(',').length <= 1) ? '430px' : '375px', objectFit: 'cover', borderRadius: "10px" }} loading="lazy" />
                              </div>
                            ))}
                          </Slider>
                          <div className='d-flex overflow-hidden w-100 m-0 p-0 gap-2 justify-content-center mt-lg-3'>
                            {lifeStyleData?.image?.split(',').length > 1 && lifeStyleData?.image?.split(',').map((vari, index) => (
                              <Media alt='Recreational Activities in Sri Lanka' key={index} src={`${vari}`} style={{ minHeight: '80px', maxHeight: '80px', minWidth: '80px', maxWidth: '80px', objectFit: 'cover', borderRadius: "10px" }} loading="lazy" />
                            ))}
                          </div>
                        </Col> */}
                      <Col lg="5" className="product-thumbnail p-0 m-0">
                        {/* Main slider */}
                        <Slider
                          {...products}
                          asNavFor={nav2}
                          ref={(slider) => setSlider1(slider)}
                          className="product-slick"
                        >
                          { lifeStyleData?.image?.split(",")?.length >= 1 ? lifeStyleData?.image
                            ?.split(",")
                            .map((vari, index) => (
                              <div key={index} className="mx-3">
                                <Media
                                  src={`${vari}`}
                                  alt="Recreational Activities in Sri Lanka"
                                  className="img-fluid product-main-image"
                                  style={{
                                    width: "100%",
                                    height:
                                      packageStatus &&
                                      lifeStyleData?.image?.split(",").length <=
                                        1
                                        ? "430px"
                                        : "375px",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            ))
                          : <div className="mx-3 m-0 p-0">
                                <Media
                                  alt={`${hotelDetails?.hotelData?.hotelName} - Default placeholder image`}
                                  src="https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png"
                                  className="img-fluid product-main-image pe-4 m-0 p-0"
                                  style={{
                                    width: "98%",
                                    height: "430px",
                                    objectFit: "cover",
                                  }}
                                  loading="lazy"
                                />
                              </div>
                          }
                        </Slider>

                        {/* Thumbnail slider - only show if more than one image */}
                        {lifeStyleData?.image?.split(",").length > 1 && (
                          <Slider
                            asNavFor={nav1}
                            ref={(slider) => setSlider2(slider)}
                            slidesToShow={Math.min(
                              5,
                              lifeStyleData?.image?.split(",").length
                            )}
                            swipeToSlide={true}
                            focusOnSelect={true}
                            className="mt-3"
                            infinite={false}
                            arrows={false}
                            responsive={[
                              {
                                breakpoint: 768,
                                settings: {
                                  slidesToShow: Math.min(
                                    4,
                                    lifeStyleData?.image?.split(",").length
                                  ),
                                },
                              },
                              {
                                breakpoint: 480,
                                settings: {
                                  slidesToShow: Math.min(
                                    3,
                                    lifeStyleData?.image?.split(",").length
                                  ),
                                },
                              },
                            ]}
                          >
                            {lifeStyleData?.image
                              ?.split(",")
                              .map((vari, index) => (
                                <div key={index} className="px-1">
                                  <Media
                                    alt={`Recreational Activities Thumbnail ${
                                      index + 1
                                    }`}
                                    src={`${vari}`}
                                    className="img-fluid"
                                    style={{
                                      height: "80px",
                                      width: "100%",
                                      objectFit: "cover",
                                      cursor: "pointer",
                                      borderRadius: "8px",
                                      border: "2px solid transparent",
                                      transition: "border-color 0.3s ease",
                                    }}
                                    loading="lazy"
                                  />
                                </div>
                              ))}
                          </Slider>
                        )}
                      </Col>

                      <Col
                        lg="7"
                        className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0"
                      >
                        <div className="product-right d-flex flex-wrap justify-content-between">
                          <h1
                            className="col-12 text-start mb-1 product-name-main"
                            style={{
                              // textTransform: "uppercase",
                              fontWeight: "500",
                            }}
                          >
                            {lifeStyleData.lifestyle_name}{" "}
                            {lifeStyleData && lifeStyleData.vendor_id && (
    <div 
      className="store-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '10px',
        background: '#00d4aa',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s'
      }}
      title="View Store Products"
      onClick={async () => {
        if (!lifeStyleData.vendor_id) {
          return ToastMessage({ status: "error", message: "Vendor information not available" });
        }

        // Get vendor details
        const vendorDetails = await getSuppliedDetails(lifeStyleData.vendor_id);
        
        console.log("Vendor Details:", vendorDetails);

        // Extract vendor name correctly
        const vendorName =
          vendorDetails.vendor_name ||
          vendorDetails.store_name ||
          vendorDetails.shop_name ||
          vendorDetails.company_name ||
          "Vendor";

        // Redirect to vendor products page with lifestyle tab
        router.push(
          `/vendor-products/${lifeStyleData.vendor_id}?vendorName=${encodeURIComponent(vendorName)}&category=lifestyle`
        );
      }}
    >
      <StoreIcon style={{ fontSize: 16, marginRight: 5 }} />
    </div>
  )}
                          </h1>
                         
                          <p
                            className="col-12 m-0 p-0 ellipsis-1-lines m-0 text-start mb-2"
                            style={{
                              color: "#66b3ff",
                              cursor: "pointer",
                              lineHeight: "20px",
                              height: "20px",
                            }}
                            onClick={handleNavigateMap}
                          >
                            {getDistanceFromLatLon(
                              baseLocation?.latitude,
                              baseLocation?.longtitude,
                              dataset?.productData?.lifeStyleInventory?.[0]
                                ?.longitude,
                              dataset?.productData?.lifeStyleInventory?.[0]
                                ?.longitude
                            )}{" "}
                            kms away from your current location -{" "}
                            {customerData?.servicePoint}
                          </p>

                          <div className="col-12 m-0 product-variant-head product-variant-head-lifestyle mb-2">
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              Choose your preferred location
                            </h6>
                            <Select
                              options={pickupLocations}
                              value={
                                pickupLocations.find(
                                  (location) =>
                                    location.value === customerData.servicePoint
                                ) || null
                              }
                              onChange={handleServicePoint}
                              placeholder="Select a location..."
                              isClearable={false}
                            />
                          </div>

                         <div className="col-6 m-0 product-variant-head mb-2" style={{ width: "48%" }}>
  <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">
    Choose your service date
  </h6>
  

  
<LifestyleCalendar
  value={customerData.date || null}
  filterDate={(date) => {
    const availableDate = moment(date);
    const bookByDays = inventoryRates[0]?.book_by_days || 0;
    const minAllowedDate = moment().add(bookByDays, 'days').startOf('day');
    
    // Only show dates that are both available and meet the book_by_days requirement
    return availableDate.isSameOrAfter(minAllowedDate) && 
           availableDates.some(availableDate => 
             isSameDay(parseISO(date), availableDate)
           );
  }}
  clearIcon={false}
  minDate={new Date(minDate)}
  availableDates={availableDates}
  maxDate={new Date(maxAvailableDate)}
  className="form-control py-2"
  onChange={(e) =>
    handleOnDataChange(
      e,
      customerData.servicePoint,
      true,
      false,
      lifeStyleInventory,
      inventoryRates
    )
  }
  placeholderText="Select a date..."
  bookByDays={inventoryRates[0]?.book_by_days || 0} // Pass book_by_days to calendar
/>
</div>

                          <div
                            className="col-6 ml-auto product-variant-head mb-2"
                            style={{ width: "48%" }}
                          >
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              Choose your time slot
                            </h6>
                            <Select
                              options={inventoryData}
                              value={
                                inventoryData.find(
                                  (data) =>
                                    data.value === customerData.inventoryID
                                ) || null
                              }
                              defaultValue={
                                viewStatus === "update"
                                  ? inventoryData.find(
                                      (data) => data.label === pickup_time
                                    )
                                  : null
                              }
                              onChange={handleSerciceTimeSlot}
                              placeholder="Select a time slot..."
                              isDisabled={
                                !customerData.date || !customerData.servicePoint
                              }
                              isClearable={false}
                            />
                          </div>

                          <div className="col-12">
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              {maxChildAdultCounts?.AdultMax &&
                              maxChildAdultCounts.ChildMax
                                ? "Adults & Children count"
                                : maxChildAdultCounts.AdultMax
                                ? "Adult count"
                                : maxChildAdultCounts.ChildMax
                                ? "Children count"
                                : null}
                            </h6>
                            <div
                              className="form-control d-flex align-items-center mb-2 product-variant-head"
                              style={{ padding: "10px 10px", fontSize: "14px" }}
                              onClick={() => setshowCountBox(!showCountBox)}
                            >
                              <p
                                className="ml-2"
                                style={{ color: "black", fontSize: 14 }}
                              >
                                {console.log("maxChildAdultCounts", customerData.adultCount)}
                                {maxChildAdultCounts?.AdultMax > 0 &&
                                  `${
                                    customerData.adultCount > 1
                                      ? "Adults : "
                                      : "Adult : "
                                  }` + customerData.adultCount}
                              </p>
                              <p
                                className="mx-1"
                                style={{ color: "black", fontSize: 14 }}
                              >
                                {" "}
                              </p>
                              <p
                                className="ml-2"
                                style={{ color: "black", fontSize: 14 }}
                              >
                                {maxChildAdultCounts?.ChildMax > 0 &&
                                  `${
                                    customerData.childCount > 1
                                      ? "Children : "
                                      : "Child : "
                                  }` + customerData.childCount}
                              </p>
                              <KeyboardArrowDownIcon
                                sx={{ marginLeft: "auto", color: "gray" }}
                              />
                            </div>
                          </div>

                          {timeSlots && timeSlots !== "" && (
                            <div
                              className="col-3 m-0 product-variant-head mb-2"
                              style={{
                                backgroundColor: "#c8c8c8",
                                borderRadius: "10px",
                                paddingLeft: "10px",
                                paddingTop: "10px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-start",
                                  gap: "10px",
                                }}
                              >
                                <Image
                                  src={timeView}
                                  alt="Essential icon"
                                  width={30}
                                  height={30}
                                  style={{ marginBottom: "10px" }}
                                />
                                <div style={{ marginBottom: "10px" }}>
                                  <h6
                                    style={{ fontSize: 11, color: "black" }}
                                    className="m-0 ellipsis-1-lines text-start"
                                  >
                                    Duration
                                  </h6>
                                  <p
                                    className="m-0 p-0"
                                    style={{ fontSize: 10, color: "black" }}
                                  >
                                    {timeSlots}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {packageStatus ? (
                            <>
                              <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">
                                {getAvailableDiscountByPackageId()
                                  ?.discount_type == "value" ||
                                getAvailableDiscountByPackageId()
                                  ?.discount_type == "precentage" ? (
                                  <>
                                    <h3 className="m-0 p-0">
                                      {CurrencyConverter(
                                        packageRate?.currency,
                                        packageRate?.rate_type == "Package"
                                          ? getDiscountProductBaseByPrice(
                                              packageRate?.package_rate,
                                              getAvailableDiscountByPackageId(),
                                              baseCurrencyValue
                                            )["discountedAmount"]
                                          : getDiscountProductBaseByPrice(
                                              packageRate?.child_rate +
                                                packageRate.adult_rate,
                                              getAvailableDiscountByPackageId(),
                                              baseCurrencyValue
                                            )["discountedAmount"],
                                        baseCurrencyValue
                                      )}
                                    </h3>
                                    <h6
                                      style={{ textDecoration: "line-through" }}
                                      className="m-0 p-0"
                                    >
                                      {CurrencyConverter(
                                        packageRate?.currency,
                                        packageRate?.rate_type == "Package"
                                          ? getDiscountProductBaseByPrice(
                                              packageRate?.package_rate,
                                              getAvailableDiscountByPackageId(),
                                              baseCurrencyValue
                                            )["actual"]
                                          : getDiscountProductBaseByPrice(
                                              packageRate?.child_rate +
                                                packageRate.adult_rate,
                                              getAvailableDiscountByPackageId(),
                                              baseCurrencyValue
                                            )["actual"],
                                        baseCurrencyValue
                                      )}
                                    </h6>
                                  </>
                                ) : (
                                  <h3 className="m-0 p-0">
                                    {CurrencyConverter(
                                      lifeStyleData.currency,
                                      packageRate?.rate_type == "Package"
                                        ? packageRate?.package_rate
                                        : packageRate?.child_rate +
                                            packageRate.adult_rate,
                                      baseCurrencyValue
                                    )}
                                  </h3>
                                  
                                )}

                                <div className="d-flex align-items-center">
                                  <a className="mb-2">
                                    price for{" "}
                                    {maxChildAdultCounts?.AdultMax > 0 > 0 &&
                                      `${
                                        customerData.adultCount > 1
                                          ? "Adults : "
                                          : "Adult : "
                                      }` + customerData.adultCount}{" "}
                                    {maxChildAdultCounts?.ChildMax > 0 > 0 &&
                                      `${
                                        customerData.childCount > 1
                                          ? "Children : "
                                          : "Child : "
                                      }` + customerData.childCount}
                                  </a>
                                </div>
                              </div>
                         {/* Conditional rendering based on rate */}
{(() => {
  const rate = packageRate?.rate_type == "Package"
    ? packageRate?.package_rate
    : packageRate?.child_rate + packageRate.adult_rate;
  
  return (
    <div className="d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end">
      {rate > 0 ? (
        <>
          {/* Display the converted rate */}
          {/* <div className="rate-display">
            {CurrencyConverterOnlyRate(
              lifeStyleData.currency,
              rate,
              lifeStyleData
            )}
          </div> */}
          
          <Button
            className="btn btn-sm btn-solid col-lg-5 col-12"
            style={{
              fontSize: 12,
              padding: "10px 15px",
              borderRadius: "4px",
            }}
            onClick={handleTravelBuddiesModal}
          >
            {travelBuddiesStatus
              ? "Edit travel buddies"
              : "Add travel buddies"}{" "}
          </Button>
          
          <Button
            className="btn btn-sm btn-solid col-lg-3 col-5"
            style={{
              fontSize: 12,
              padding: "10px 15px",
              borderRadius: "4px",
            }}
            onClick={handleValidateForm}
          >
            {cartStatus.status === "update"
              ? "Update cart"
              : "Add to cart"}
          </Button>
          
          <Button
            className="btn btn-sm btn-solid col-lg-3 col-5"
            style={{
              fontSize: 12,
              padding: "10px 15px",
              borderRadius: "4px",
            }}
            onClick={handleChatInitiate}
          >
            {chatCreating
              ? "Initiating a chat"
              : "Chat now"}
          </Button>
        </>
      ) : (
        /* Travel Restriction Message when rate is 0 */
        <div 
          className="travel-restriction-message col-12 text-center p-3"
          style={{
            backgroundColor: "#f8f4e6",
            borderRadius: "8px",
            border: "1px solid #e6d7b3"
          }}
        >
          <h6 style={{ color: "#8B4513", marginBottom: "10px", fontWeight: "600" }}>
            Travel Restriction
          </h6>
          <p style={{ color: "#8B4513", margin: 0, fontSize: "14px" }}>
            Infant can't travel without accompanying adult or child passenger
          </p>
        </div>
      )}
    </div>
  );
})()}
                              {/* <div className="d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end">
                                <Button
                                  className="btn btn-sm btn-solid col-lg-5 col-12"
                                  style={{
                                    fontSize: 12,
                                    padding: "10px 15px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={handleTravelBuddiesModal}
                                >
                                  {travelBuddiesStatus
                                    ? "Edit travel buddies"
                                    : "Add travel buddies"}{" "}
                                </Button>
                                <Button
                                  className="btn btn-sm btn-solid col-lg-3 col-5"
                                  style={{
                                    fontSize: 12,
                                    padding: "10px 15px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={handleValidateForm}
                                >
                                  {cartStatus.status === "update"
                                    ? "Update cart"
                                    : "Add to cart"}
                                </Button>
                                <Button
                                  className="btn btn-sm btn-solid col-lg-3 col-5"
                                  style={{
                                    fontSize: 12,
                                    padding: "10px 15px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={handleChatInitiate}
                                >
                                  {chatCreating
                                    ? "Initiating a chat"
                                    : "Chat now"}
                                </Button>
                              </div> */}
                            </>
                          ) : (
                            <div className="d-flex flex-row align-items-center col-12 gap-2 gap-lg-3 justify-content-end justify-content-lg-end mt-3 mt-lg-3">
                              
                              {
                                isSelectUnavailable ? (
                                   <Button
                                className="btn btn-sm btn-solid"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={getPackageData}
                                disabled={true}
                              >
                                Sorry we are cloased on this day
                              </Button>
                                ):(
                                   <Button
                                className="btn btn-sm btn-solid"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={getPackageData}
                                disabled={avalibilityLoading}
                              >
                                {avalibilityLoading
                                  ? "Please wait"
                                  : cartStatus.status === "update"
                                  ? "Re Check avalibility"
                                  : "Check avalibility"}
                              </Button>
                                )

                              }

                              {/* <Button
                                className="btn btn-sm btn-solid"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={getPackageData}
                                disabled={avalibilityLoading}
                              >
                                {avalibilityLoading
                                  ? "Please wait"
                                  : cartStatus.status === "update"
                                  ? "Re Check avalibility"
                                  : "Check avalibility"}
                              </Button> */}
                              <Button
                                className="btn btn-sm btn-solid"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={handleChatInitiate}
                              >
                                {chatCreating
                                  ? "Initiating a chat"
                                  : "Chat now"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  )}
                </Container>
                {!loading && (
                  <ProductTab
                    type="lifestyle"
                    height={
                      lifeStyleData.image.split(",").length > 1
                        ? "355px"
                        : packageStatus
                        ? "380px"
                        : "430px"
                    }
                    latitude={latitudelongtitude?.latitude}
                    longitude={latitudelongtitude?.longitude}
                    showDesc={true}
                    name={lifeStyleData.lifestyle_name}
                    desc={lifeStyleData.lifestyle_description}
                    showReviews={true}
                    reviews={reviews}
                    showTermsndConditions={true}
                    showndConditions={lifeStyleData?.general_tnc}
                    showCancellationpolicy={true}
                    cancellationPolicy={lifeStyleData.cancel_policy}
                    showPaymentPolicy={true}
                    paymentPolicy={lifeStyleData.payment_policy}
                  />
                )}
              </Col>
            </Row>
          </Container>
        </div>

        <ModalBase
          isOpen={showCountBox}
          title={"Select Number of Pax"}
          toggle={() => {
            setshowCountBox(false);
          }}
          size="lg"
        >
          <PaxIncrementorComponent
            open={showCountBox}
            toggle={() => setshowCountBox(false)}
            adultCount={customerData.adultCount}
            childCount={customerData.childCount}
            childAgesDynamic={
              customerData.childAges?.child0 ? customerData.childAges : childAgesArray
            }
            adultChildMinMax={adultChildMinMax}
            addPaxPaxIncrement={handleValidateAdultChildCount}
            paxLimitations={paxLimitations}
            maxChildAdultCounts={maxChildAdultCounts}
            type = {"lifestyle"}
            // changeAges={(data) => setCustomerData({...customerData, childAges: [parseInt(data)]})}
          ></PaxIncrementorComponent>
        </ModalBase>

        <ModalBase
          isOpen={handlePopupStatus.avalibilityChecking}
          title={"Package details"}
          toggle={handleCloseAllPopup}
          size="lg"
        >
          <LifestylesPricing
            packageData={packageData}
            packageError={packageError}
            packageStatus={packageStatus}
            packageRate={packageRate}
            currency={baseCurrencyValue}
            adultCount={customerData.adultCount}
            childCount={customerData.childCount}
            handlePackageRate={handlePackageRate}
            discounts={discounts}
            discountClaimed={discountClaimed}
          ></LifestylesPricing>
        </ModalBase>

        <ModalBase
          isOpen={handlePopupStatus.customerDetails}
          toggle={handleCloseAllPopup}
          title="Choose Your Buddies"
          size="md"
        >
          <BuddyModal
            adultCount={customerData.adultCount}
            childCount={customerData.childCount}
            adultDetails={adultDetails}
            childsDetails={childsDetails}
            childAges={ customerData.childAges?.child0 ? customerData.childAges : childAgesArray}
            handleTravelBuddies={handleTravelBuddies}
            selectPassengerType={selectPassengerType}
          ></BuddyModal>
        </ModalBase>

        <ModalBase
          isOpen={handlePopupStatus.addToCart}
          toggle={handleCloseAllPopup}
          title="Select Your Cart"
          size="md"
        >
          <CartContainer
            handlePassData={handlePassData}
            productData={cartData}
            cartCategory={"Lifestyle"}
            preId={preId || null}
            pageState={viewStatus || null}
          />
        </ModalBase>

        <ModalBase
          isOpen={packageMoreDetails}
          toggle={handleMoreDetailsClose}
          title={"More details about package"}
          size="x"
        >
          {/* <div>
            <h6>Name of the package : {packageRate.package_name}</h6>
            <p> Name of the package : {packageRate?.description === null ? "Not provide" : packageRate?.description}</p>
            <p>Package rate type - {packageRate.rate_type}</p>
            <p>Price for this package - {CurrencyConverter(packageRate.currency, packageRate.package_rate, baseCurrencyValue)}</p>
            <p>Per person price for this package - {CurrencyConverter(packageRate.currency, packageRate.per_person_rate, baseCurrencyValue)}</p>
            <p>Package type :  {packageRate.package_type}</p>
          </div> */}
          <div>
            <h6>
              Name of the package: {packageRate?.package_name || "Not provided"}
            </h6>
            <p>
              Description of the package:{" "}
              {packageRate?.description
                ? packageRate.description
                : "Not provided"}
            </p>
            <p>Package rate type: {packageRate?.rate_type || "Not provided"}</p>

            {packageRate?.package_rate ? (
              <p>
                Price for this package:{" "}
                {CurrencyConverter(
                  packageRate.currency,
                  packageRate.package_rate,
                  baseCurrencyValue
                )}
              </p>
            ) : (
              <>
                <p>
                  Per person (Adult) price for this package:{" "}
                  {CurrencyConverter(
                    packageRate.currency,
                    packageRate?.adult_rate,
                    baseCurrencyValue
                  )}
                </p>
                <p>
                  Per person (Child) price for this package:{" "}
                  {CurrencyConverter(
                    packageRate.currency,
                    packageRate?.child_rate,
                    baseCurrencyValue
                  )}
                </p>
              </>
            )}

            <p>Package type: {packageRate?.package_type || "Not provided"}</p>
          </div>
        </ModalBase>
      </CommonLayout>
    </>
  );
};

export default LifestyleProdcutView;

