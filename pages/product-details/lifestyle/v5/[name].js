import moment from "moment";
import Head from "next/head";
import Slider from "react-slick";
import Select from "react-select";
import { parseISO } from "date-fns";
import { useRouter } from "next/router";
import DatePicker from "react-date-picker";
import { addDoc, collection } from "firebase/firestore";
import React, { useState, useEffect, useContext, use } from "react";
import { Container, Row, Col, Media, Button } from "reactstrap";

import { AppContext } from "../../../_app";
import { db } from "../../../../firebase";

import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import LifeStylePricing from "../../../../GlobalFunctions/Lifestylefunctions/LifeStylePricing";
import {
  getDistanceFromLatLon,
  gettimeDifference,
  generateSlug,
} from "../../../../GlobalFunctions/OthersGlobalfunctions";

import {
  getGlobalProductsDetails,
  getGlobalTixProductTickets,
  getGlobalTixTickets,
} from "../../../../AxiosCalls/LifestyleServices/globaltixService";


import ProductTab from "../../common/product-tab";
import Service from "../../common/service";
import NewProduct from "../../common/newProduct";

import PaxIncrementorComponent from "../../../../components/common/PaxIncrementor/PaxIncrementorComponent";
import ModalBase from "../../../../components/common/Modals/ModalBase";
import LifestylesPricing from "../../../../components/common/PackageContainer/PackageContainerLifestyles";
import BuddyModal from "../../../../components/common/TravelBuddies/BuddyModal";
import ToastMessage from "../../../../components/Notification/ToastMessage";
import CartContainer from "../../../../components/CartContainer/CartContainer";
import CommonLayout from "../../../../components/shop/common-layout";
import timeView from "../../../../public/assets/images/sidebar-svg-files/icons8-clock.svg";
import getDiscountProductBaseByPrice from "../../common/GetDiscountProductBaseByPrice";

import ProductSkeleton from "../../../skeleton/productSkeleton";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Image from "next/image";
// import TicketPicker from "./ModelTicketPicker";
import TicketSelector from "../../../../components/lifeStyle/cebu/TicketSelector";
import CurrencyConverterOnlyRate from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRate";
import CartCurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CartCurrencyConverter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PackageSelectorSim from "../../../../components/lifeStyle/zeteza/PackageSelectorSim";

export async function getServerSideProps(context) {
  const id = context.query.pID;
  const name = context.query.name;
  let response = [];
  let reviews = [];
  const productUrl = `https://www.aahaas.com/product-details/lifestyle/v5/${name}?pID=${id}`;

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
  console.log("dataset isssssssssss", dataset);

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
  useEffect(() => {
    // Get data from localStorage
    const stored = localStorage.getItem("bigDataset");
    // console.log("Retrieved data from localStorage:", stored);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (dataset) {
          dataset.productData = data;
        }
        console.log("Retrieved data from localStorage:", data);
        // setRetrievedData(data);
        // localStorage.removeItem('bigDataset');
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    } else {
      console.log("No data found in localStorage");
    }
  }, []);

  console.log("Data set product is12333", dataset);
  const router = useRouter();
  const adultcount = router.query.lifeStyle_adult_count;
  const childcount = router.query.lifestyle_children_count;
  const image = dataset.productData.image;

  const viewStatus = router.query.viewStatus;
  const preId = router.query?.preId;

  // console.log("router?.query?.viewStatus", )
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

  const [ticketData, setTicketData] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    tickets: [],
    date: "",
    adultCount: selectedPackage?.selectedQuantity
      ? selectedPackage?.selectedQuantity
      : 1,
  });
  const [availabilityCheck, setAvailabilityCheck] = useState(false);

  //hirusha
  const [paxLimitations, setPaxLimitation] = useState([]);
  const [maxChildAdultCounts, setMaxChildAdultCounts] = useState({
    AdultMax: 0,
    ChildMax: 0,
  });

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

  const [nav2, setNav2] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);

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

  const [customerData, setCustomerData] = useState({
    date: "",
    time: "",
    servicePoint: "",
    selectedDay: "",
    inventoryID: "",
    selectedRateID: "",
    selectedTimeSlot: "",
    betweenHours: "",
    adultCount: adultcount === undefined ? 1 : adultcount,
    childCount: childcount === undefined ? 0 : childcount,
    childAges: [],
    maxAdultOccupancy: "",
    maxChildOccupancy: "",
    coverage: "",
    usage: "",
    duration: "",
  });

  //  const [customerDataSelected, setCustomerDataSelected] = useState({
  //   coverage: "",
  //   usage: "",
  //   duration: "",
  // });

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

  const [discountsMetaVal, setDiscountMetaVal] = useState([]);

  const handleDiscountOnClaim = (id) => {
    if (id) {
      setDiscountClaimed(true);
    }
    setDiscountMetaVal(id);
  };

  const handlePackageRate = (data) => {
    setPackageRate(data);
    setPackageStatus(true);
    if (userStatus.userLoggesIn) {
      // ToastMessage({ status: "success", message: "Package update successfully", autoClose: '1000' });
      setHandlePopupStatus({
        avalibilityChecking: false,
        customerDetails: true,
        addToCart: false,
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
  };

  const handleTravelBuddies = (value) => {
    let adults = value.filter((res) => {
      return res.PaxType == "1";
    });
    let childs = value.filter((res) => {
      return res.PaxType == "2";
    });

    setAdultDetails(adults);
    setChildDetails(childs);
    setCustomerData({
      ...customerData,
      adultCount: adults.length,
      childCount: childs.length,
    });
    settravelBuddiesStatus(true);
    handleCloseAllPopup();
  };

  const handleValidateForm = () => {
    if (travelBuddiesStatus) {
      const bookingDetails = {
        life_style_id: pathId,
        // lifestyle_rate_id: selectedLifestyleRates?.[0]?.lifestyle_rate_id,
        // discount_id: availableDiscount?.discount_id,

        adults: customerData.adultCount,
        children: customerData.childCount,
        // lifestyle_inventory_id: customerData.inventoryID,
        bookingDate: customerDetails.date,
      };

      var childNames = new Array();
      var childAges = new Array();
      var adultNames = new Array();
      console.log("dataD issss 1233333", adultDetails);

      for (let i = 0; i < bookingDetails.adults; i++) {
        adultNames.push(
          adultDetails[i]["FirstName"] + " " + adultDetails[i]["LastName"]
        );
      }
      // for (let i = 0; i < bookingDetails.children; i++) {
      //   childNames.push(
      //     childsDetails["child_fname" + i] + " " + childsDetails["child_sname" + i]
      //   );
      //   childAges.push(childsDetails["child_age" + i]);
      // }

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

      let dataD = {};

      if (viewStatus === "update") {
        dataD = {
          cart_id: router?.query?.selectedCart_id,
          pre_id: router?.query?.preId,
          customerData: adultDetails,
          product_id: dataset?.productId,
          selectedPackage: eSimSelected,
          generatedPackages: lifeStyleData,
          cart_item_uuid: null,
          customer_address: "",
          customer_location_latlon: "",
          pageState: "CartEdit",
          passengerData: adultDetails,
          product_id: bookingDetails.life_style_id,
          product_uuid: bookingDetails.life_style_id,
          provider: "zetexa",
          selectedDate: selectedDate,
          selectedTickets: selectedTickets || [],
          tickets: ticketDataPass || [],
          total_amount: getTotalPrice(),
          transaction_amount: getTotalPrice(),
          transaction_currency: "SGD",
          travel_buddy_adult_id: adultDetails
            .map((adult) => adult.id)
            .join(","),
          travel_buddy_child_id: "",
          user_id: baseUserId.cxid,
        };
      } else {

        console.log("dataD 12366 chmoaaaaaaaaaaaaaa");
        // dataD = {
        //   cart_id: cartStatus.cartId,
        //   cart_item_uuid: null,
        //   customer_address: "",
        //   customer_location_latlon: "",
        //   pageState: "fromDetail",
        //   passengerData: adultDetails,
        //   product_id: bookingDetails.life_style_id,
        //   product_uuid: bookingDetails.life_style_id,
        //   provider: "cebu",
        //   selectedDate: selectedDate,
        //   selectedTickets: selectedTickets || [],
        //   tickets: ticketDataPass || [],
        //   total_amount: getTotalPrice(),
        //   transaction_amount: getTotalPrice(),
        //   transaction_currency: "SGD",
        //   travel_buddy_adult_id: adultDetails
        //     .map((adult) => adult.id)
        //     .join(","),
        //   travel_buddy_child_id: "",
        //   user_id: baseUserId.cxid,
        // };

        dataD = {
          customerData: adultDetails,
          product_id: dataset?.productId,
          user_id: baseUserId.cxid,
          selectedPackage: eSimSelected,
          pageState: "newProduct",
          pre_id: '',
          cart_id: cartStatus.cartId,
          provider: "zetexa",
          generatedPackages: lifeStyleData,
        };

        console.log("dataD 12366 chmo", dataD);
      }

      if (userStatus.userLoggesIn) {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: false,
          addToCart: true,
        });
        console.log("dataD", dataD);
        // return
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

  const handlePassData = (value) => {
    console.log("value isssssssssssss 12333", value);
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

  const [formatData, setFormatData] = useState({})
  const [updateCartData, setUpdateCartData] = useState({})
  const loadProductData = async () => {
    await removeExistingValues();
    setLoading(true);
    const response = dataset.productData;
    console.log("dataset.productData",response);
   
    if (response?.id || response?.generatedPackages?.lifestyle_id) {
      let dataObject ;
      if(viewStatus === "update"){
        dataObject = {
        main_photo_url: response?.generatedPackages?.image,
        title: response?.generatedPackages?.lifestyle_name,
        description: response?.generatedPackages?.lifestyle_description,
        moreDetails: response?.generatedPackages?.dataSet,
        generatedPackages: response?.generatedPackages?.generatedPackage,
      };
      console.log("cartSelectedParams", dataObject);
      const cartSelectedParams = JSON.parse(response?.zetexa_cart_data || "{}");
      setUpdateCartData(cartSelectedParams)
      setCustomerData({
    ...customerData,
    coverage: cartSelectedParams?.selectedPackage?.coverage || "",
    usage: cartSelectedParams?.selectedPackage?.data || "",
    duration: cartSelectedParams?.selectedPackage?.validity || "",
});
    setESimSelected(cartSelectedParams?.selectedPackage || {});
    setPackageSelectionPageModal(true);
      
      setFormatData(dataObject);
      }else{
        dataObject = {
        main_photo_url: response?.image,
        title: response?.lifestyle_name,
        description: response?.lifestyle_description,
        moreDetails: response?.dataSet,
        generatedPackages: response?.generatedPackage,
      };
      }
       
      console.log("dataset.productData", dataObject);
      setFormatData(dataObject);
      setLoading(false);

      setLifeStyleData(response);
      setPricing(response);

    } else {
      console.log("Something went wrong while fetching the product details");
      // router.replace('/shop/lifestyle');
    }
  };

  const handleServicePoint = async (e) => {
    setCustomerData({
      ...customerData,
      pickup_location: e.value,
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
    setTimeSlots(gettimeDifference(e.label));
    setCustomerData({
      ...customerData,
      time: e.label,
      inventoryID: e.value,
    });
    setPackageRate([]);
    setPackageStatus(false);
  };

  const [selectedDate, setSelectedDate] = useState();
  const handleOnDataChange = async (value) => {
    let date = moment(value).format("YYYY-MM-DD").toString();
    setSelectedDate(date);

    let result = moment(value).format("YYYY-MM-DD").toString();
    console.log("result", result);
    setCustomerDetails({
      ...customerDetails,
      date: result,
    });

    setCustomerData({
      ...customerData,
      date: result,
    });
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
        console.log("lifeStyleData", lifeStyleData);
        // console.log(lifeStyleData,  "lifeStyleData")
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
          chat_category: 3,
          chat_related_id: 3,
          chat_avatar: lifeStyleData.image,
          supplier_id: null,
          chat_name: lifeStyleData.lifestyle_name,
          comments: { category: 3, product_id: lifeStyleData?.id },
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
    setInventoryData([]);
    setSelectedLifestyleRates([]);
    setAvailableDiscount([]);

    setPackageStatus(false);
    settravelBuddiesStatus(false);

    setCustomerData({
      date: "",
      selectedRateID: "",
      selectedTimeSlot: "",
      betweenHours: "",
      inventoryID: "",
      adultCount: 1,
      childCount: 0,
      maxAdultOccupancy: "",
      maxChildOccupancy: "",
      servicePoint: "",
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

  const handleValidateAdultChildCount = (value) => {
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
    window.open(
      `https://www.google.com/maps/dir/${baseLocation.latitude}, ${baseLocation.longtitude} / ${latitudelongtitude?.latitude}, ${latitudelongtitude?.longitude}`,
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

  const [showTicket, setShowTicket] = useState(false);
  const handleTicket = (value) => {
    console.log("value", value);
    handleTicketPickerClick(value);
    setShowTicket(true);
  };

  const handleTicketModel = () => {
    setShowTicket(!showTicket);
  };

  const handleTicketPicker = (value) => {
    console.log("value", value);
  };

  const handleTicketPickerClick = async (ticket) => {
    console.log("ticket", ticket);
    const result = await getGlobalTixProductTickets(ticket);
    console.log("result isssssssssss", result);
    if (result) {
      setTicketData(result);
    }
    console.log("TicketPicker result", result);
  };

  const [ticketCount, setTicketCount] = useState(0);

  const [selectedTicket, setSelectedTicket] = useState({
    adultCount: 0,
    childCount: 0,
    totalTickets: 0,
  });
  const [currentComponentState, setCurrentComponentState] = useState();
  const handleOnPressContinueData = (
    dataVal,
    totalTicketCount,
    dataSet,
    currentComponentState
  ) => {
    console.log(
      currentComponentState,
      "Data Value Issssssssssssssssssssssss",
      dataVal
    );
    setCurrentComponentState(currentComponentState);
    let adultCount = 0;
    let childCount = 0;
    let totalCount = 0;

    // Loop through tickets in dataVal
    dataVal.tickets.forEach((ticket) => {
      const ticketId = ticket.id;
      const quantity = ticket.quantity;
      totalCount += quantity;

      // Find matching ticket in ticketData
      let ticketType = null;
      ticketData.data.forEach((item) => {
        const foundTicket = item.ticketType.find((tt) => tt.id === ticketId);
        if (foundTicket) {
          ticketType = foundTicket.name;
        }
      });

      // Categorize based on ticket type
      if (ticketType === "CHILD") {
        childCount += quantity;
      } else {
        // All other types (ADULT or any other) count as adult
        adultCount += quantity;
      }
    });
    setSelectedTicket({
      adultCount: adultCount,
      childCount: childCount,
      totalTickets: totalCount,
    });

    setShowTicket(!showTicket);
    setCustomerDetails({
      ...customerDetails,
      tickets: dataVal,
      adultCount: dataVal[0]?.selectedQuantity,
    });

    // Calculate total tickets count
    const totalTicketsCount = dataVal.tickets.reduce((total, ticket) => {
      return total + ticket.quantity;
    }, 0);

    setTicketCount(totalTicketsCount);
    setSelectedPackage(dataVal);
  };

  const [totalAmount, setTotalAmount] = useState(0);
  const TotalAmountCalculator = (data) => {
    let totalAmount = CurrencyConverter(
      data?.currency,
      data?.totalAmount,
      baseCurrencyValue
    );
    setTotalAmount(totalAmount);
  };

  const handleCheckAvailability = () => {

    if (!customerData?.coverage || !customerData?.usage || !customerData?.duration) {
      ToastMessage({
        status: "warning",
        message: "Please select the required fields",
      });
      return;
    } else {
      console.log(customerDetails, "customerDetails", adultDetails);
      if (customerDetails?.adultCount === 1) {
        console.log("customerDetails", customerDetails);
        // setHandlePopupStatus({
        //   avalibilityChecking: false,
        //   customerDetails: true,
        //   addToCart: false,
        // });
        // setPackageSelectionPage(true);
        handleESimSelector();
      } else {
        handleTicket(lifeStyleData?.id);
        ToastMessage({
          status: "warning",
          message: "Please select the date and tickets",
        });
      }
    }


  };

  const [selectedTickets, setSelectedTickets] = useState([]);
  const [ticketSelectionPage, setTicketSelectionPage] = useState(false);
  const [ticketDataPass, setTicketDataPass] = useState([]);

  const handleTicketSelectionContinue = (ticketDataD, tickets) => {
    console.log("Selected tickets:", tickets);
    setSelectedTickets(tickets);
    setTicketSelectionPage(true);
    handleTicketModel();

    const transformedTickets = tickets.map((ticket) => ({
      booking_date: ticket.booking_date || null,
      price: ticket.ticketDataSet?.price || 0,
      quantity: ticket.quantity || 0,
      sku_id: ticket.sku_id || "",
      time: null,
    }));
    setTicketDataPass(transformedTickets);
    console.log("Transformed tickets:", transformedTickets);
  };

  const returnTotalAmount = () => {
    if (selectedTickets.length > 0) {
      const total = getTotalPrice();
      console.log("Total amount:", baseCurrencyValue);
      const currency =
        selectedTickets[0]?.ticketDataSet?.currency ||
        baseCurrencyValue?.base ||
        "USD";
      return CurrencyConverter(currency, total, baseCurrencyValue);
      return {
        total: total,
        currency: currency,
        merchant_price: total,
      };
    } else {
      return {
        total: 0,
        currency: currencyData?.currency || "USD",
        merchant_price: 0,
      };
    }
  };

  const getTotalPrice = () => {
    return selectedTickets.reduce((total, ticket) => {
      return total + (ticket.ticketDataSet?.price || 0) * ticket.quantity;
    }, 0);
  };

  const getTotalTickets = () => {
    return selectedTickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );
  };

  const handleUserSelection = (value, userSelection) => {
    console.log("User selection value:", value, userSelection);
    if(viewStatus === "update"){
      setPackageSelectionPageModal(false)
      setESimSelected([])

    }
    switch (userSelection) {
      case "coverage":
        setCustomerData(prevData => ({
          ...prevData,
          coverage: value.value
        }));
        break;
      case "usage":
        setCustomerData(prevData => ({
          ...prevData,
          usage: value.value
        }));
        break;
      case "validity":
        setCustomerData(prevData => ({
          ...prevData,
          duration: value.value
        }));
        break;
      default:
        console.error("Unknown user selection type:", userSelection);
        return;
    }
    // console.log("User selection:", value, userSelection);
    // console.log("Updated customerData:", customerData);
  };

  const [packageSelectionPage, setPackageSelectionPage] = useState(false);
  const [packageSelectionPageModal, setPackageSelectionPageModal] = useState(false);
  const [eSimPackages, setESimPackages] = useState([]);
  const [eSimSelected, setESimSelected] = useState([]);
  const handleSelectOptions = (data) => {
    console.log(data, "Handle Select Optionsssss");

    setESimSelected(data);
    setPackageSelectionPageModal(true)
    setPackageSelectionPage(false);
  };

  const handleESimSelector = () => {
    console.log("formatData", formatData);
    const filteredData = formatData?.moreDetails.filter((data) => {
      const matchesCoverage = customerData.coverage
        ? data?.coverage === customerData.coverage
        : true;
      const matchesDataUsage = customerData.dataUsage
        ? data?.data === customerData.dataUsage
        : true;
      const matchesValidity = customerData.validity
        ? data?.validity === customerData.validity
        : true;

      return matchesCoverage && matchesDataUsage && matchesValidity;
    });

    setESimPackages(filteredData);


    setPackageSelectionPage(true);
  }

  const handleClickBack = () => {
    setPackageSelectionPage(false);
  };

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


  const getFilteredValidityOptions = () => {
  if (!customerData.coverage || !customerData.usage || !dataset.productData.dataSet) {
    return [];  
  }

  const matchingPackages = dataset.productData.dataSet.filter(package1 => {
    const coverageMatch = package1.coverage === customerData.coverage;
    const usageMatch = package1.data === customerData.usage;
    return coverageMatch && usageMatch;
  });

  const validityOptions = [...new Set(matchingPackages.map(package1 => package1.validity))]
    .sort((a, b) => a - b)
    .map(validity => ({
      label: validity,
      value: validity
    }));

  return validityOptions;
};

  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalURL} as={canonicalURL} />
        <title>
          Aahaas - {dataset.productData?.title} | Unique Experiences with
          Aahaas in Sri Lanka
        </title>
        <meta
          name="description"
          content={`Discover ${dataset.productData?.title} and other fun activities in Sri Lanka! Explore recreational experiences, top tourist activities, and unforgettable adventures on Aahaas.`}
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
                  item: `https://www.aahaas.com/product-details/lifestyle/v4/${generateSlug(
                    dataset.productData?.title
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
          className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? "mb-5" : "mb-0"
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
                    <Service
                      serviceType="lifestyle"
                      discounts={discounts}
                      serviceDate={customerData.date}
                      cancellationDays={customerData.date}
                      bookingDeadline={inventoryRates?.[0]?.book_by_days}
                      // latitude={latitudelongtitude?.latitude}
                      // longitude={latitudelongtitude?.longitude}
                      // locationName={customerData?.servicePoint}
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
                        // "cancellationDays",
                        // "deadline",
                        // "mapView",
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
                      <Col lg="5" className="product-thumbnail p-0 m-0">
                        <Slider
                          {...products}
                          asNavFor={nav2}
                          ref={(slider) => setSlider1(slider)}
                          className="product-slick"
                        >
                          <div key={1} className="mx-3">
                            <Media
                              src={
                                image ||
                                `https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png`
                              }
                              alt="Recreational Activities in Sri Lanka"
                              className="img-fluid product-main-image"
                              style={{
                                width: "100%",
                                height:
                                  packageStatus &&
                                    lifeStyleData?.image?.split(",").length <= 1
                                    ? "430px"
                                    : "375px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                              loading="lazy"
                            />
                          </div>
                        </Slider>
                      </Col>

                      <Col
                        lg="7"
                        className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0"
                      >
                        <div className="product-right d-flex flex-wrap justify-content-between">
                          <h1
                            className="col-12 text-start mb-1 product-name-main"
                            style={{
                              textTransform: "uppercase",
                              fontWeight: "500",
                            }}
                          >
                            {lifeStyleData?.lifestyle_name}{" "}
                          </h1>
                          {/* <p className='col-12 m-0 p-0 ellipsis-1-lines m-0 text-start mb-2' style={{ color: '#66b3ff', cursor: 'pointer', lineHeight: '20px', height: '20px' }} onClick={handleNavigateMap}>{getDistanceFromLatLon(baseLocation?.latitude, baseLocation?.longtitude, latitudelongtitude?.latitude, latitudelongtitude?.longitude)} kms away from your currenct location -  {baseLocation?.address_full}</p> */}

                          <div
                            className="col-6 m-0 product-variant-head mb-2"
                            style={{ width: "48%" }}
                          >
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              Network Coverage Selection
                            </h6>
                            <Select
                              options={formatData?.generatedPackages?.coverage?.map(res => {
                                return {
                                  label: res,
                                  value: res,
                                };
                              })}
                              // value={
                              //   inventoryData.find(
                              //     (data) =>
                              //       data.value === customerData.inventoryID
                              //   ) || null
                              // }
                              // defaultValue={
                              //   viewStatus === "update"
                              //     ? inventoryData.find(
                              //         (data) => data.label === pickup_time
                              //       )
                              //     : null
                              // }
                              onChange={(e) => { handleUserSelection(e, "coverage") }}
                             placeholder={
                                viewStatus === "update"
                                  ? customerData?.coverage
                                  : null
                              }
                              // isDisabled={
                              //   !customerData.date || !customerData.servicePoint
                              // }
                              isClearable={false}
                            />
                          </div>

                          <div className="col-6">
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              Select Data Usage Preferences
                            </h6>
                            <Select
                              options={formatData?.generatedPackages?.dataUsage?.map(res => {
                                return {
                                  label: res,
                                  value: res,
                                };
                              })}
                              // value={
                              //   inventoryData.find(
                              //     (data) =>
                              //       data.value === customerData.inventoryID
                              //   ) || null
                              // }
                              // defaultValue={
                              //   viewStatus === "update"
                              //     ? "asdsd"
                              //     : null
                              // }
                              onChange={(e) => { handleUserSelection(e, "usage") }}
                              placeholder={
                                viewStatus === "update"
                                  ? customerData?.usage
                                  : null
                              }
                              // isDisabled={
                              //   !customerData.date || !customerData.servicePoint
                              // }
                              isClearable={false}
                            />
                          </div>

                          <div className="col-6">
                            <h6
                              style={{ fontSize: 11, color: "gray" }}
                              className="m-0 ellipsis-1-lines text-start"
                            >
                              Choose Your Duration
                            </h6>
                            <Select
                              // options={formatData?.generatedPackages?.validity?.map(res => {
                              //   return {
                              //     label: res,
                              //     value: res,
                              //   };
                              // })}
                              options={getFilteredValidityOptions()}
                              onChange={(e) => { handleUserSelection(e, "validity") }}
                              placeholder={
                                viewStatus === "update"
                                  ? customerData?.duration
                                  : null
                              }
                              isClearable={false}
                            />
                          </div>
                              <div className="col-12 m-0 p-0 d-flex" style={{ height:'110px'}}>

                        </div>
                           {
                            packageSelectionPageModal ? (
                              <>
                                <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">
                                  <h3 className="m-0 p-0">
                                    {CurrencyConverter(
                                      'USD',
                                      eSimSelected?.price,
                                      baseCurrencyValue
                                    )}
                                  </h3>

                                  {/* <div className="d-flex align-items-center">
                                    <a onClick={getPackageData} className="btn-change-package mb-2" disabled={avalibilityLoading}>{avalibilityLoading ? 'Please wait' : 'Update Booking'}</a>
                                    <span className="m-0 p-0 mb-2 mx-2">/</span>
                                    <a
                                      onClick={handleMoreDetailsOpen}
                                      className="btn-change-package mb-2"
                                    >
                                      Know more about packages
                                    </a>
                                  </div> */}
                                </div>
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

                                  {packageSelectionPage === true ?(  
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
                                  ):(
                                      <Button
                                    className="btn btn-sm btn-solid col-lg-3 col-5"
                                    style={{
                                      fontSize: 12,
                                      padding: "10px 15px",
                                      borderRadius: "4px",
                                    }}
                                    onClick={handleValidateForm}
                                  >
                                  Add to carttt
                                  </Button>
                                  )

                                  }
                                
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
                            ) : null
                          }
                        
                          {/* {customerData.coverage && customerData.usage && customerData.duration ? ( */}
                          {customerData.coverage && customerData.usage && customerData.duration ? (
                            <div  className="d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end" 
                            // style={{backgroundColor:'red'}}
                            >

                              {console.log("eSimSelected", eSimSelected)}
                            <div className="d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end">
                            {
                                
                                
                                eSimSelected?.package_id ?
                                  (<>
                                    <Button
                                      className="btn btn-sm btn-solid col-lg-5 col-12"
                                      style={{
                                        fontSize: 10,
                                        padding: "10px 15px",
                                        borderRadius: "4px",
                                      }}
                                      onClick={handleTravelBuddiesModal}
                                    >
                                      {travelBuddiesStatus
                                        ? "Edit travel buddies"
                                        : "Add travel buddies"}{" "}
                                    </Button>

                                 {packageSelectionPageModal === true && travelBuddiesStatus ?
                                (
                                  <><Button
                                              className="btn btn-sm btn-solid col-lg-3 col-12"
                                              style={{
                                                fontSize: 10,
                                                padding: "10px 15px",
                                                borderRadius: "4px",
                                              }}
                                              onClick={handleValidateForm}
                                            >
                                              {viewStatus === "update"
                                                ? "Update cart"
                                                : "Add to cart"}
                                            </Button><Button
                                              className="btn btn-sm btn-solid col-lg-3 col-5"
                                              style={{
                                                fontSize: 10,
                                                padding: "10px 15px",
                                                borderRadius: "4px",
                                              }}
                                              onClick={handleChatInitiate}
                                            >
                                                {chatCreating
                                                  ? "Initiating a chat"
                                                  : "Chat now"}
                                              </Button></>
                                ) : (
                                  <><Button
                                              className="btn btn-sm btn-solid col-lg-3 col-12"
                                              style={{
                                                fontSize: 10,
                                                padding: "10px 15px",
                                                borderRadius: "4px",
                                              }}
                                              onClick={() => {
                                                setHandlePopupStatus({
                                                  avalibilityChecking: false,
                                                  customerDetails: true,
                                                  addToCart: false,
                                                });
                                              } }
                                            >
                                              {viewStatus === "update"
                                                ? "Update cart"
                                                : "Add to cart"}
                                            </Button><Button
                                              className="btn btn-sm btn-solid col-lg-3 col-5"
                                              style={{
                                                fontSize: 10,
                                                padding: "10px 15px",
                                                borderRadius: "4px",
                                              }}
                                              onClick={handleChatInitiate}
                                            >
                                                {chatCreating
                                                  ? "Initiating a chat"
                                                  : "Chat now"}
                                              </Button></>
                                )

                              }

</>
                              ):(
                              <><Button
                                          className="btn btn-md btn-solid col-lg-4 col-12"
                                          style={{
                                            fontSize: 10,
                                            padding: "10px 15px",
                                            borderRadius: "4px",
                                          }}
                                          onClick={handleCheckAvailability}
                                        >
                                          Check availability
                                        </Button><Button
                                          className="btn btn-sm btn-solid col-lg-3 col-5"
                                          style={{
                                            fontSize: 10,
                                            padding: "10px 15px",
                                            borderRadius: "4px",
                                          }}
                                          onClick={handleChatInitiate}
                                        >
                                            {chatCreating
                                              ? "Initiating a chat"
                                              : "Chat now"}
                                          </Button></>
                              )
                              }
                               
                            </div>
                              

                             
                            </div>
                          ) : (
                            <div className="d-flex flex-row align-items-center col-12 gap-2 gap-lg-3 justify-content-end justify-content-lg-end mt-3 mt-lg-3">
                              <Button
                                className="btn btn-sm btn-solid col-lg-4 col-12"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={handleCheckAvailability}
                              >
                                Check avalibility
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
                            </div>
                            // null
                          )
                          }


                          

                     

                         
                        </div>
                      </Col>
                    </Row>
                  )}
                </Container>
                {!loading && (
                  <ProductTab
                    type="lifestyle"
                    provider="zetexa"
                    height={
                      lifeStyleData.images
                        ? "355px"
                        : packageStatus
                          ? "380px"
                          : "430px"
                    }
                    showDesc={true}
                    name={lifeStyleData.lifestyle_name}
                    desc={lifeStyleData.lifestyle_description}
                    showTermsndConditions={false}
                    showndConditions={lifeStyleData?.cancel_policy}
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
            childAgesDynamic={customerData.childAges}
            adultChildMinMax={adultChildMinMax}
            addPaxPaxIncrement={handleValidateAdultChildCount}
            paxLimitations={paxLimitations}
            maxChildAdultCounts={maxChildAdultCounts}
          ></PaxIncrementorComponent>
        </ModalBase>

        <ModalBase
          isOpen={packageSelectionPage}
          title={"Select Package"}
          toggle={() => {
            setPackageSelectionPage(false);
          }}
          size="lg"
        >
          <PackageSelectorSim
            handleOnPressContinueData={handleSelectOptions}
            handleClickBack={handleClickBack}
            esimPackages={eSimPackages || []}
            selectedParams ={{"coverage": customerData.coverage, "usage": customerData.usage, "duration": customerData.duration}}
          ></PackageSelectorSim>
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
            adultCount={1}
            childCount={0}
            adultDetails={adultDetails}
            childsDetails={childsDetails}
            childAges={customerData.childAges}
            handleTravelBuddies={handleTravelBuddies}
            providerlife={"zetexa"}
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
            provider={"zetexa"}
            preId={preId || null}
            pageState={viewStatus === "update" ? "CartEdit" : null}
          />
        </ModalBase>

        <ModalBase
          isOpen={showTicket}
          toggle={handleTicketModel}
          title="Select Ticket"
          size="lg"
        >
          <TicketSelector
            attractionTickets={lifeStyleData?.tickets}
            selectedDate={selectedDate}
            handleOnPressContinueData={handleTicketSelectionContinue}
          />
        </ModalBase>

        {/* <ModalBase isOpen={showTicket} toggle={handleTicketModel} title="Select Ticket" size='lg'>
          <TicketPicker attractionTickets={ticketData} handleOnPressContinueData={handleOnPressContinueData} initialSelectedState={currentComponentState} priceCalculator={TotalAmountCalculator} />
        </ModalBase> */}

        <ModalBase
          isOpen={packageMoreDetails}
          toggle={handleMoreDetailsClose}
          title={"More details about package"}
          size="x"
        >
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
