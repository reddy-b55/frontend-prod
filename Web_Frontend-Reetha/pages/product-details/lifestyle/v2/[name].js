import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Media, Button } from "reactstrap";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CommonLayout from "../../../../components/shop/common-layout";
import CustomizableSelector from "../../../../components/LifestyleBridgify/CustomizableSelector";
import { AppContext } from "../../../_app";
import {
  getBridgifyAttractionDetails,
  getBridgifyRequiredFieldsArray,
  getBridgifyValdiationData,
  submitValidationBridgifyData,
} from "../../../../AxiosCalls/LifestyleServices/bridgifyServices";
import DatePicker from "react-date-picker";
import { isSameDay, parseISO } from "date-fns";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../../firebase";

import ToastMessage from "../../../../components/Notification/ToastMessage";
import CartContainer from "../../../../components/CartContainer/CartContainer";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import moment from "moment";
import TicketSelector from "../../../../components/LifestyleBridgify/TicketSelector";
import ModalBase from "../../../../components/common/Modals/ModalBase";
import PackageSelector from "../../../../components/LifestyleBridgify/PackageSelector";
import BuddyModal from "../../../../components/common/TravelBuddies/BuddyModal";
import { useRouter } from "next/router";
import ProductTab from "../../common/product-tab";
import Service from "../../common/service";
import ProductSkeleton from "../../../skeleton/productSkeleton";

import "react-datetime/css/react-datetime.css";

import Datetime from "react-datetime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import styles from "./LifestyleProdcutView.module.css";
import BookingQuestions from "../../../../components/LifestyleBridgify/BookingQuestions";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
export async function getServerSideProps(context) {
  const id = context.query.pID;
  const name = context.query.name;

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
    productData: null,
    productReviews: null,
    productId: id,
    canonicalURL: productUrl,
  };

  return {
    props: {
      dataset,
    },
  };
}

const LifestyleProdcutView = ({ dataset }) => {
  // State management
  console.log("Data set product is", dataset);
  const router = useRouter();
  const viewStatus = router.query.viewStatus;
  const preId = router.query?.preId;
  console.log(
    "Data set product is",
    viewStatus,
    preId,
    router?.query?.selectedCart_id
  );

  const [showCountBox, setShowCountBox] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [locationValue, setLocationValue] = useState("Colombo");
  const [timeValue, setTimeValue] = useState("10:00 AM");
  const [adultDetails, setAdultDetails] = useState([]);
  const [childsDetails, setChildDetails] = useState([]);
  const [loadingDes, setLoadingDes] = useState(true);
  const [chatCreating, setChatCreating] = useState(false);
  const [selectPassengerType, setSelectPassengerType] = useState('all');

  // Static dataa
  const productData = {
    name: "ADVENTURE HIKING EXPERIENCE",
    location: "Colombo",
    distance: "5.2",
    mainImage:
      "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop",
    description:
      "Embark on an unforgettable adventure hiking experience through the lush mountains of Sri Lanka. Perfect for nature lovers and outdoor enthusiasts.",
    price: "LKR 8,500",
    reviews: { rating: 4.7, count: 124 },
  };

  const locationOptions = [
    { value: "Colombo", label: "Colombo" },
    { value: "Kandy", label: "Kandy" },
    { value: "Galle", label: "Galle" },
    { value: "Negombo", label: "Negombo" },
  ];

  const timeOptions = [
    { value: "08:00 AM", label: "08:00 AM" },
    { value: "10:00 AM", label: "10:00 AM" },
    { value: "01:00 PM", label: "01:00 PM" },
    { value: "03:00 PM", label: "03:00 PM" },
  ];

  // Customer data
  const customerData = {
    adultCount: 2,
    childCount: 1,
  };

  // Handlers
  const handleModalView = () => {
    setShowModal(!showModal);
  };

  const handleNavigateMap = () => {
    // console.log("Navigate to map view");
  };

  const handleOnPressValue = () => {};

  // NEW: Field hierarchy function from React Native
  const getFieldHierarchy = () => {
    return [
      "dates",
      "pickups",
      "languages",
      "options",
      "timeslots",
      "tickets",
      "shipment-method",
      "customer-info",
    ];
  };

  // NEW: Field loading states from React Native
  const [fieldLoading, setFieldLoading] = useState({
    dates: false,
    timeslots: false,
    pickups: false,
    tickets: false,
    options: false,
    languages: false,
    "shipment-method": false,
    "customer-info": false,
  });

  // NEW: Error state from React Native
  const [errors, setErrors] = useState({});

  // NEW: Component loading state from React Native
  const [componentLoading, setComponentLoading] = useState(false);

  // NEW: Questions functionality from React Native
  const [questionsFilled, setQuestionsFilled] = useState(false);
  const [questionData, setQuestionData] = useState([]);

  // NEW: Add to cart loading state from React Native
  const [addToCartLoad, setAddToCartLoad] = useState(false);

  const [openedModal, setOpenedModal] = useState("");

  // NEW: Clear subsequent fields function from React Native
  const clearSubsequentFields = (editedField) => {
    const hierarchy = getFieldHierarchy();
    const editedIndex = hierarchy.indexOf(editedField);

    if (editedIndex === -1) return;

    const fieldsToClean = hierarchy.slice(editedIndex + 1);

    const clearedData = { ...customerAttractionData };

    fieldsToClean.forEach((field) => {
      if (field === "tickets") {
        clearedData[field] = [];
      } else {
        clearedData[field] = "";
      }
    });

    if (fieldsToClean.includes("timeslots")) {
      setAttractionTimeSlots([]);
    }
    if (fieldsToClean.includes("tickets")) {
      setTicketPrices([]);
    }
    if (fieldsToClean.includes("customer-info")) {
      setAttractionCustomerDetails([]);
    }
    if (fieldsToClean.includes("options")) {
      setSelectedPackage([]);
    }

    setCustomerAttractionData(clearedData);

    const newErrors = { ...errors };
    fieldsToClean.forEach((field) => {
      if (newErrors[field]) {
        delete newErrors[field];
      }
    });
    setErrors(newErrors);
  };
  const [validationStatus, setValidationStatus] = useState({
  isChecking: false,
  currentStep: 0
});
// Enhanced validation function
const validateAllFields = () => {
  const newErrors = {};
  const hierarchy = getFieldHierarchy();
  
  // Check each required field in hierarchy order
  hierarchy.forEach((field) => {
    if (!attractionData?.validations?.includes(field)) return;
    
    if (field === "tickets") {
      if (!customerAttractionData.tickets || customerAttractionData.tickets.length === 0) {
        newErrors[field] = "Please select at least one ticket.";
      }
    } else if (field === "dates") {
      if (!customerAttractionData.dates || customerAttractionData.dates.trim() === "") {
        newErrors[field] = "Please select a date.";
      }
    } else if (field === "timeslots") {
      if (!customerAttractionData.timeslots || customerAttractionData.timeslots.trim() === "") {
        newErrors[field] = "Please select a time slot.";
      }
    } else if (field === "pickups") {
      if (!customerAttractionData.pickups || customerAttractionData.pickups.trim() === "") {
        newErrors[field] = "Please select a pickup location.";
      }
    } else if (field === "languages") {
      if (!customerAttractionData.languages || customerAttractionData.languages.trim() === "") {
        newErrors[field] = "Please select a language.";
      }
    } else if (field === "options") {
      if (!customerAttractionData.options || customerAttractionData.options.trim() === "") {
        newErrors[field] = "Please select a package.";
      }
    }
    // Add more field validations as needed
  });
  
  return newErrors;
};

// Step-by-step validation function
const validateStepByStep = () => {
  const hierarchy = getFieldHierarchy();
  const newErrors = {};
  
  // Find the first missing required field
  const firstMissingField = hierarchy.find((field) => {
    if (!attractionData?.validations?.includes(field)) return false;
    
    if (field === "tickets") {
      return !customerAttractionData.tickets || customerAttractionData.tickets.length === 0;
    } else {
      return !customerAttractionData[field] || customerAttractionData[field].trim() === "";
    }
  });
  
  if (firstMissingField) {
    // Set error only for the first missing field
    if (firstMissingField === "tickets") {
      newErrors[firstMissingField] = "Please select at least one ticket.";
    } else {
      newErrors[firstMissingField] = `Please select ${firstMissingField.replace('-', ' ')}.`;
    }
    
    // Scroll to the first error field
    setTimeout(() => {
      const errorElement = document.querySelector(`[data-field="${firstMissingField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  
  return newErrors;
};
const handleCheckAvailability = () => {
  // Clear previous errors
  setErrors({});
  
  // Validate step by step
  const newErrors = validateStepByStep();
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    
    // Show toast message for the first error
    const firstErrorKey = Object.keys(newErrors)[0];
    const fieldName = firstErrorKey.replace('-', ' ');
    ToastMessage({
      status: "error",
      message: `Please complete ${fieldName} first`
    });
    
    return;
  }
  
  // If all validations pass, proceed with ticket selection
  handleOnPress("tickets");
};

  // NEW: Show clear warning function from React Native
  const showClearWarning = (fieldType) => {
    const hierarchy = getFieldHierarchy();
    const currentIndex = hierarchy.indexOf(fieldType);

    if (currentIndex === -1) return;

    const fieldsToBeCleared = hierarchy
      .slice(currentIndex + 1)
      .filter(
        (field) =>
          attractionData?.validations?.includes(field) &&
          customerAttractionData[field] &&
          customerAttractionData[field] !== "" &&
          (field !== "tickets" || customerAttractionData[field].length > 0)
      );

    if (fieldsToBeCleared.length > 0) {
      const fieldNames = fieldsToBeCleared.join(", ");
      ToastMessage({
        status: "warning",
        message: `Changing this will clear: ${fieldNames.toUpperCase()}`,
      });
    }
  };

  // UPDATED: Enhanced handleOnPress function from React Native
  const handleOnPress = (type) => {
    if (type == "tickets") {
      if (
        attractionTickets?.ticket_types?.length > 0 ||
        attractionTickets?.available_tickets
      ) {
        setOpenedModal(type);
      } else {
        const hierarchy = getFieldHierarchy();
        const ticketIndex = hierarchy.indexOf("tickets");
        const fieldsBeforeTickets = hierarchy.slice(0, ticketIndex);

        let errorMessages = {};

        fieldsBeforeTickets.forEach((field) => {
          if (!attractionData?.validations?.includes(field)) return;

          console.log(
            customerAttractionData,
            "Attraction Customer Data validation check"
          );

          if (
            !customerAttractionData?.[field] ||
            customerAttractionData?.[field]?.trim() === ""
          ) {
            errorMessages[field] = `The field "${field}" is required.`;
          }
        });

        if (Object.keys(errorMessages).length > 0) {
          setErrors(errorMessages);
          ToastMessage({
            status: "error",
            message: "Please complete required fields first",
          });
        } else {
          if (
            !attractionTickets ||
            Object.keys(attractionTickets).length === 0
          ) {
            if (attractionData?.cart_item_uuid) {
              // Set loading state for tickets
              setFieldLoading((prev) => ({ ...prev, tickets: true }));

              getBridgifyValdiationData(
                attractionData?.cart_item_uuid,
                "tickets"
              )
                .then((response) => {
                  console.log(response, "Fetched ticket data");
                  if (response?.data?.data) {
                    setAttractionTickets(response.data.data);
                    setOpenedModal(type);
                  } else {
                    ToastMessage({
                      status: "error",
                      message:
                        "No tickets available. Please try again or contact support",
                    });
                  }
                })
                .catch((error) => {
                  console.error("Error fetching tickets:", error);
                  ToastMessage({
                    status: "error",
                    message: "Error loading tickets. Please try again",
                  });
                })
                .finally(() => {
                  setFieldLoading((prev) => ({ ...prev, tickets: false }));
                });
                handleCheckAvailability();
            }
          } else {
            setOpenedModal(type);
          }
        }
      }
    } else {
      setOpenedModal(type);
    }
  };

  const { userStatus, baseUserId, baseCurrencyValue, baseLocation } =
    useContext(AppContext);

  const [attractionData, setAttractionData] = useState([]);
  const [attractionDates, setAttractionDates] = useState([]);
  const [attractionTimeSlots, setAttractionTimeSlots] = useState([]);
  const [attractionPickups, setAttractionPickups] = useState([]);
  const [attractionTickets, setAttractionTickets] = useState([]);

  const [attractionCustomerDetails, setAttractionCustomerDetails] = useState(
    []
  );

  const [attractionSeatMap, setAttractionSeatMap] = useState(false);
  const [attractionShippingMethods, setAttractionShippingMethods] = useState(
    []
  );
  const [attractionLangauges, setAttractionLanguages] = useState([]);
  const [attractionOptions, setAttractionOptions] = useState([]);
  const [attractionOptionalExtras, setAttractionOptionalExtras] = useState([]);

  const [customerAttractionData, setCustomerAttractionData] = useState({
    dates: "",
    pickups: "",
    tickets: "",
    timeslots: "",
    "customer-info": "",
    "shipment-method": "",
    languages: "",
    options: "",
    "optional-extras": "",
    "seats-map": "",
  });

  const [ticketPrices, setTicketPrices] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [existingCartData, setExistingCartData] = useState([]);
  const [customerCartData, setCustomerCartData] = useState([]);

  const validationArray = getBridgifyRequiredFieldsArray();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState("");

  const PID = dataset?.productId;

  // NEW: Page state management from React Native
  const [pageState, setPageState] = useState("");
  const [lifestylePreId, setLifestylePreId] = useState("");

  useEffect(() => {
    setPageState(router?.query?.pageState);
    setLifestylePreId(router?.query?.lifestyle_pre_id);
  }, [router?.query]);

  useEffect(() => {
    setLoading(true);
    setComponentLoading(true);

    // Initialize attraction data similar to React Native
    const bridgifyData = dataset;
    var attractionDetailsData = {
      attraction: {
        main_photo_url:
          dataset?.productData?.image ||
          "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg",
        english_title:
          dataset?.productData?.lifestyle_name || "ADVENTURE HIKING EXPERIENCE",
        description:
          dataset?.productData?.lifestyle_description ||
          "Embark on an unforgettable adventure hiking experience",
      },
    };

    setAttractionData(attractionDetailsData);

    getBridgifyAttractionDetails(baseUserId?.cxid || "AHS_Guest", PID)
      .then((res) => {
        setAttractionData(res?.data);
        setComponentLoading(false);
        setSortedValidations(res?.data?.validations);

        console.log(res, "Response Data isss attractionsssssssssssssssssssss");
        const dates = Object?.keys(res?.data?.avalability?.dates?.[0] || {});
        setAttractionDates(dates);
        setLoadingDes(false);
        setLoading(false);
      })
      .catch((res) => {
        setLoading(false);
        setComponentLoading(false);
      })
      .finally((res) => {
        setComponentLoading(false);
      });
  }, [baseUserId, PID]);

  const [timeSlots, setTimeSlots] = useState([]);

  const getTimeSlotsByDate = () => {
    return attractionData?.avalability?.dates?.[0][
      customerAttractionData?.date
    ];
  };

  const attractionDetails = attractionData?.attraction;

  const ticketsLabel = () => {
    var result = "";

    if (customerAttractionData?.tickets?.length > 0) {
      result = customerAttractionData?.tickets
        .map((item) => `${item.product_id} * ${item.quantity}`)
        .join(", ");
    }

    return result;
  };

  const getTicketQuantity = () => {
    let totalQuantity = 0;

    customerAttractionData?.tickets.forEach((ticket) => {
      totalQuantity += ticket.quantity;
    });

    return totalQuantity;
  };

  // NEW: Formatted passenger counts function from React Native
  function getFormattedPassengerCounts(data) {
    let adultCount = 0;
    let childCount = 0;
    let hasAdultChildSeparation = false;

    if (!data) {
      return {
        passengerTypes: [
          { Count: "0", Label: "Adult/Senior" },
          { Count: "0", Label: "Child/Infants" },
        ],
        hasAdultChildSeparation: false,
      };
    }

    data.forEach((ticket) => {
      const productId = ticket.product_id?.toLowerCase() || "";

      if (
        productId === "adult" ||
        productId === "senior" ||
        productId === "youth" ||
        productId === "child" ||
        productId === "infant"
      ) {
        hasAdultChildSeparation = true;
      }

      if (productId === "child" || productId === "infant") {
        childCount += ticket.quantity;
      } else if (
        productId === "adult" ||
        productId === "senior" ||
        productId === "youth"
      ) {
        adultCount += ticket.quantity;
      } else {
        adultCount += ticket.quantity;
      }
    });

    return {
      passengerTypes: [
        { Count: adultCount.toString(), Label: "Adult/Senior" },
        { Count: childCount.toString(), Label: "Child/Infants" },
      ],
      hasAdultChildSeparation: hasAdultChildSeparation,
    };
  }

  const [sortedValidations, setSortedValidations] = useState([]);

  // UPDATED: Simplified validation fetching similar to React Native
  useEffect(() => {
    const fetchValidationData = async () => {
      if (!attractionData?.validations) return;

      let updatedData = { ...customerAttractionData };

      // Get the first missing validation element
      const nextElement = attractionData.validations.find(
        (element) => !updatedData[element]
      );

      if (!nextElement) return;

      console.log(nextElement, "Element Data issssssssssssXXXXXXXXXYYY");

      try {
        const response = await getBridgifyValdiationData(
          attractionData?.cart_item_uuid,
          nextElement
        );

        console.log(response, "Response Data isssssXXXXXXXXXXXXXXXXXXXXXX");

        if (nextElement === "tickets")
          console.log(response, "Ticket response valueee isssssss");

        const data = response?.data?.data;

        if (!data) return;

        updatedData[nextElement] =
          data.available_dates ||
          data.available_timeslots ||
          data.available_tickets ||
          data.available_options ||
          data.available_languages ||
          data["seats-map"] ||
          data["shipment-method"] ||
          data["languages"] ||
          "";

        if (nextElement === "dates")
          setAttractionDates(data.available_dates || []);
        if (nextElement === "timeslots")
          setAttractionTimeSlots(data.available_timeslots || []);
        if (nextElement === "pickups")
          setAttractionPickups(data.available_pickups || []);
        if (nextElement === "tickets") setAttractionTickets(data || []);
        if (nextElement === "customer-info")
          setAttractionCustomerDetails(data || []);
        if (nextElement === "seats-map")
          setAttractionSeatMap(data?.seats_map || "");
        if (nextElement === "shipment-method")
          setAttractionShippingMethods(data?.available_shipment_methods || []);
        if (nextElement === "options") {
          setAttractionOptions(data?.options || []);
        }
        if (nextElement === "languages") {
          setAttractionLanguages(data?.available_languages || []);
        }
      } catch (error) {
        console.error(`Error fetching data for ${nextElement}:`, error);
      }
    };

    fetchValidationData();
  }, [attractionData, customerAttractionData]);

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
          chat_category: 3,
          chat_related_id: 3,
          chat_avatar: attractionData?.attraction?.main_photo_url,
          supplier_id: null,
          chat_name: attractionData?.attraction?.english_title,
          comments: {
            category: 3,
            product_id: dataset?.productId,
            provider: "bridgify",
            product: dataset,
          },
          updatedAt: new Date(),
        }).then((response) => {
          setChatCreating(false);
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

  const componentRenderValidation = (val) => {
    return attractionData?.validations?.includes(val);
  };

  const [loaders, setLoaders] = useState({
    tickets: false,
    "customer-info": false,
  });

  // UPDATED: Enhanced submitDataToBackend function from React Native
  const submitDataToBackend = async (type, data, index, tickets) => {
    console.log(
      type,
      data,
      index,
      tickets,
      "Ticket data index type value issss"
    );

    // Clear subsequent fields before submitting new data
    // if (
    //   customerAttractionData[type] &&
    //   customerAttractionData[type] !== "" &&
    //   (type !== "tickets" || customerAttractionData[type].length > 0)
    // ) {
    //   clearSubsequentFields(type);
    // }

    if (type == "dates") {
      var params = {
        selectedValue: data,
      };

      // Set loading state for timeslots when date is selected
      setFieldLoading((prev) => ({ ...prev, timeslots: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      ).then((response) => {
        console.log(
          { type: type, data: response.data },
          "Submit data value array isssss"
        );
        setCustomerAttractionData((prevData) => ({
          ...prevData,
          [type]: data,
          timeslots: "",
        }));

        if (attractionData?.validations?.includes("timeslots")) {
          getBridgifyValdiationData(attractionData?.cart_item_uuid, "timeslots")
            .then((response) => {
              const timeslotData = response?.data?.data;
              if (timeslotData) {
                setAttractionTimeSlots(timeslotData.available_timeslots || []);
              }
            })
            .catch((error) => {
              console.error("Error fetching timeslots for new date:", error);
            })
            .finally(() => {
              setFieldLoading((prev) => ({ ...prev, timeslots: false }));
            });
        } else {
          setFieldLoading((prev) => ({ ...prev, timeslots: false }));
        }
      });

      setQuestionsFilled(false);
    } else if (type == "timeslots") {
      var params = {
        selectedValue: data,
      };

      setFieldLoading((prev) => ({ ...prev, timeslots: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          console.log(
            { type: type, data: response.data },
            "Submit data value array isssss"
          );
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, timeslots: false }));
        });

      setQuestionsFilled(false);
    } else if (type == "pickups") {
      var params = {
        selectedValue: data,
      };

      setFieldLoading((prev) => ({ ...prev, pickups: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          console.log(
            { type: type, data: response.data },
            "Submit data value array isssss"
          );
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, pickups: false }));
        });

      setQuestionsFilled(false);
    } else if (type == "languages") {
      var params = {
        selectedValue: data,
      };

      setFieldLoading((prev) => ({ ...prev, languages: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, languages: false }));
        });

      setQuestionsFilled(false);
    } else if (type == "options") {
      var params = {
        selectedValue: data,
      };

      setFieldLoading((prev) => ({ ...prev, options: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          console.log(
            { type: type, data: response.data },
            "Submit data value array isssss"
          );
          setOpenedModal("");
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, options: false }));
        });

      setQuestionsFilled(false);
    } else if (type == "tickets") {
      var params = {
        selectedValue: data,
        ticketArr: tickets,
      };

      console.log(params, "Params selected isssssss");

      setLoaders((prevState) => ({
        ...prevState,
        tickets: true,
      }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      ).then((response) => {
        console.log(
          { type: type, data: response.data },
          "Submit data value array isssss"
        );

        setLoaders((prevState) => ({
          ...prevState,
          tickets: false,
        }));

        if (response?.data?.success === false) {
          const requestData = JSON.parse(response.config.data);
          const selectedValue = requestData.selectedValue || [];

          const hasChild = selectedValue.some(
            (ticket) => ticket.product_id?.toLowerCase() === "child"
          );
          const hasInfant = selectedValue.some(
            (ticket) => ticket.product_id?.toLowerCase() === "infant"
          );
          const hasAdult = selectedValue.some(
            (ticket) => ticket.product_id?.toLowerCase() === "adult"
          );

          let errorMessage =
            response?.data?.error ?? "Something went wrong. Please try again.";

          if (hasChild && hasInfant && !hasAdult) {
            errorMessage = `Child & Infant tickets cannot be booked without an accompanying Adult.`;
          } else if (hasChild && !hasAdult) {
            errorMessage = `Child ticket cannot be booked without an accompanying Adult.`;
          } else if (hasInfant && !hasAdult) {
            errorMessage = `Infant ticket cannot be booked without an accompanying Adult.`;
          }

          ToastMessage({
            status: "error",
            message: errorMessage,
          });
          return;
        }

        setOpenedModal("");

        console.log(response?.data, "Response Ticket Data issssss", tickets);

        if (index == 1) {
          setTicketPrices(tickets);
        } else {
          setTicketPrices(response?.data?.data?.ticket_prices);
        }

        setCustomerAttractionData((prevData) => ({
          ...prevData,
          [type]: data,
        }));
      });

      setQuestionsFilled(false);
    } else if (type == "shipment-method") {
      var params = {
        selectedValue: attractionShippingMethods[index]?.shipment_id,
      };

      setFieldLoading((prev) => ({ ...prev, "shipment-method": true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, "shipment-method": false }));
        });

      setQuestionsFilled(false);
    } else if (type == "customer-info") {
      console.log("customerinfo is calledeeee", data);
      var params = {
        selectedValue: data,
        required_booking_questions: questionData,
      };

      console.log(params, "Params data value is data isss12312312XXXXXXXXXX");

      setLoaders((prevState) => ({
        ...prevState,
        ["customer-info"]: true,
      }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      ).then((response) => {
        console.log(
          response,
          "Response Submitted data value isssssssss123123123"
        );
        setLoaders((prevState) => ({
          ...prevState,
          ["customer-info"]: false,
        }));

        if (response?.data?.success == false) {
          ToastMessage({ status: "error", message: response?.data?.error });
          return false;
        } else {
          let dataSet = {};
          if (viewStatus === "update") {
            dataSet = {
              cart_uuid: attractionData?.cart_uuid,
              transaction_amount: returnTotalAmount()?.merchant_price,
              transaction_currency: returnTotalAmount()?.currency,
              product_uuid: attractionData?.attraction?.uuid,
              customer_location_latlon: "",
              customer_address: "",
              pre_id: router?.query?.preId,
              user_id: baseUserId?.cxid,
              cart_id: router?.query?.selectedCart_id,
              cart_item_uuid: attractionData?.cart_item_uuid,
              provider: "bridgify",
              pageState: "CartEdit",
            };
          } else {
            dataSet = {
              cart_uuid: attractionData?.cart_uuid,
              product_uuid: attractionData?.attraction?.uuid,
              customer_location_latlon: "",
              customer_address: "",
              user_id: baseUserId?.cxid,
              cart_id: "",
              cart_item_uuid: attractionData?.cart_item_uuid,
              provider: "bridgify",
              page_state: "fromDetail",
              pre_id: lifestylePreId,
              pageState: pageState,
              transaction_amount: returnTotalAmount()?.merchant_price,
              transaction_currency: returnTotalAmount()?.currency,
           
            };
          }

          console.log(dataSet, "Data set value issssssssss----------XXXXXX");
          setExistingCartData(dataSet);
          setCustomerCartData(dataSet);
          setCartModal(true);
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        }
      });
    } else {
      var params = {
        selectedValue: data,
      };

      setFieldLoading((prev) => ({ ...prev, [type]: true }));

      await submitValidationBridgifyData(
        attractionData?.cart_item_uuid,
        type,
        params
      )
        .then((response) => {
          console.log(
            { type: type, data: response.data },
            "Submit data value array isssss"
          );
          setOpenedModal("");
          setCustomerAttractionData((prevData) => ({
            ...prevData,
            [type]: data,
          }));
        })
        .finally(() => {
          setFieldLoading((prev) => ({ ...prev, [type]: false }));
        });

      setQuestionsFilled(false);
    }
  };

  const generateArrayToSelectBox = (array) => {
    let arrayData = [{ value: null, label: "Select Option" }];
    array.forEach((element) => {
      arrayData.push({ value: element, label: element });
    });
    return arrayData;
  };

  const handleSelectValue = (key, data) => {
    submitDataToBackend(key, data);
  };

  const disDates = (current) => {
    const formattedDate = moment(current).format("YYYY-MM-DD");
    return attractionDates.includes(formattedDate);
  };

  // NEW: Enhanced RenderComponents function with React Native functionality
const RenderComponents = () => {
  if (componentLoading == true) {
    return (
      <div className="mx-3">
        <ProductSkeleton skelotonType="customizable-selector" />
      </div>
    );
  } else {
    if (sortedValidations) {
      return (
        <div className={styles["components-container"]}>
          {sortedValidations.map((element, index) => {
            switch (element) {
              case "pickups":
                return (
                  <div key={`pickup-${index}`} className="component-wrapper">
                    <CustomizableSelector
                      data={generateArrayToSelectBox(
                        attractionPickups.map(({ uuid, name }) => `${uuid}`)
                      )}
                      value={customerAttractionData?.pickups}
                      handleOnPress={handleOnPress}
                      handleSelect={(data) => handleSelectValue(element, data)}
                      label={"Service Location"}
                      placeHolder="Select a Location"
                      type="dropdown"
                      error={errors?.[element]}
                      fieldKey={element}
                      loading={fieldLoading.pickups}
                    />
                  </div>
                );

              case "dates":
                return (
                  <div key={`dates-${index}`} className="component-wrapper">
                    <CustomizableSelector
                      data={timeOptions}
                      value={timeValue}
                      handleOnPress={handleOnPress}
                      handleSelect={(data) => handleSelectValue(element, data)}
                      label={"Select a Date"}
                      placeHolder="Select Date"
                      type="date"
                      error={errors?.[element]}
                      fieldKey={element}
                      loading={fieldLoading.dates}
                      renderParent={() => (
                        <div>
                          <Datetime
                            value={customerAttractionData?.dates}
                            isValidDate={disDates}
                            clearIcon={false}
                            className={`form-control date_selector ${errors?.dates ? 'error-border' : ''}`}
                            onChange={(e) =>
                              submitDataToBackend(
                                "dates",
                                moment(e).format("YYYY-MM-DD").toString()
                              )
                            }
                          />
                        </div>
                      )}
                    />
                  </div>
                );

              case "timeslots":
                if (attractionTimeSlots?.length > 0) {
                  return (
                    <div key={`timeslots-${index}`} className="component-wrapper">
                      <CustomizableSelector
                        data={generateArrayToSelectBox(attractionTimeSlots)}
                        value={customerAttractionData?.timeslots}
                        handleOnPress={(data) => handleOnPress(data)}
                        handleSelect={(data) => handleSelectValue(element, data)}
                        label={"Select Timeslot"}
                        placeHolder="Select a Timeslot"
                        type="dropdown"
                        error={errors?.[element]}
                        fieldKey={element}
                        loading={fieldLoading.timeslots}
                      />
                    </div>
                  );
                }
                return null;

              case "tickets":
                return (
                  <div key={`tickets-${index}`} className="component-wrapper">
                    <CustomizableSelector
                      data={timeOptions}
                      value={timeValue}
                      handleOnPress={() => handleOnPress(element)}
                      handleSelect={(data) => handleSelectValue(element, data)}
                      label={"Select a Ticket"}
                      placeHolder={ticketsLabel() || "Select a Ticket"}
                      type="button"
                      error={errors?.[element]}
                      fieldKey={element}
                      loading={fieldLoading.tickets}
                    />
                  </div>
                );


                case "customer-info":
                  return null;

                case "shipment-method":
                  return (
                    <div
                      key={`shipment-${index}`}
                      className="component-wrapper"
                    >
                      <CustomizableSelector
                        data={timeOptions}
                        value={timeValue}
                        handleOnPress={handleOnPress}
                        handleSelect={(data) =>
                          handleSelectValue(element, data)
                        }
                        label={"Select a Shipment Method"}
                        placeHolder="Shipment Method"
                        type="button"
                        error={errors?.[element]}
                        loading={fieldLoading["shipment-method"]}
                      />
                    </div>
                  );

                case "languages":
                  return (
                    <div
                      key={`languages-${index}`}
                      className="component-wrapper"
                    >
                      <CustomizableSelector
                        data={generateArrayToSelectBox(attractionLangauges)}
                        value={customerAttractionData?.languages}
                        handleOnPress={handleOnPress}
                        handleSelect={(data) =>
                          handleSelectValue(element, data)
                        }
                        label={"Select a Language"}
                        placeHolder="Select a Language"
                        type="dropdown"
                        error={errors?.[element]}
                        loading={fieldLoading.languages}
                      />
                    </div>
                  );

                case "options":
                  return (
                    <div key={`options-${index}`} className="component-wrapper">
                      <CustomizableSelector
                        data={timeOptions}
                        value={timeValue}
                        handleOnPress={() => handleOnPress(element)}
                        handleSelect={(data) =>
                          handleSelectValue(element, data)
                        }
                        label={"Select Package"}
                        placeHolder={
                          selectedPackage?.title != null
                            ? selectedPackage?.title
                            : "Select a Package"
                        }
                        type="button"
                        error={errors?.[element]}
                        loading={fieldLoading.options}
                      />
                    </div>
                  );

                case "optional-extras":
                  return null;

                default:
                  return null;
              }
            })}
          </div>
        );
      }
    }
    return null;
  };

  // NEW: Enhanced handleOnPressContinue function from React Native
  const handleOnPressContinue = (data, dataVal) => {
    console.log(data, "Ticket Data Value 12312345");

    if (data?.tickets?.[0]?.ticketDataSet?.merchant_price) {
      var ticketvals = [];
      var totalRate = 0.0;

      data?.tickets?.map((dataVal) => {
        console.log(dataVal, "Data value isssssssssssssssssssss");

        var obj = {
          product_id: dataVal?.product_id,
          merchant_price: dataVal?.ticketDataSet?.merchant_price,
          retail_price: dataVal?.ticketDataSet?.retail_price,
          currency: dataVal?.ticketDataSet?.currency,
          supplier_discount: 0,
        };

        ticketvals?.push(obj);
        totalRate += dataVal?.ticketDataSet?.merchant_price;
      });

      var objVal = {
        product_id: "TOTAL",
        merchant_price: totalRate * data?.tickets?.[0]["quantity"],
        retail_price: totalRate * data?.tickets?.[0]["quantity"],
        currency: data?.tickets?.[0]?.ticketDataSet?.currency,
        supplier_discount: 0,
      };

      ticketvals.push(objVal);

      submitDataToBackend("tickets", data?.tickets, 1, ticketvals);
    } else {
      submitDataToBackend("tickets", data?.tickets, 0, []);
    }
  };

  const handleClickBack = () => {
    setOpenedModal("");
  };

  const returnTotalAmount = () => {
    console.log(ticketPrices, "Ticket Prices areeeeeeee");

    if (ticketPrices?.length > 0) {
      const total = ticketPrices.find((item) => item.product_id === "TOTAL");
      var totalAmount = total?.retail_price || 0;

      return {
        total: totalAmount,
        currency: total?.currency || "USD",
        merchant_price: total?.merchant_price,
      };
    } else {
      return { total: 0, currency: "USD", merchant_price: 0 };
    }
  };

  // NEW: Enhanced handleOnAddToCart function from React Native
  const handleOnAddToCart = async () => {
    let errorMessages = {};
    if (userStatus.userLoggesIn) {
       attractionData?.validations?.forEach((field) => {
      if (
        !(
          field === "pickups" ||
          field == "dates" ||
          field == "timeslots" ||
          field == "tickets" ||
          field == "shipment-method" ||
          field == "language" ||
          field == "options"
        )
      )
        return;

      if (field === "tickets") {
        if (
          !customerAttractionData.tickets ||
          customerAttractionData.tickets.length === 0
        ) {
          errorMessages[field] = "Please select at least one ticket.";
        }
        return;
      }

      console.log(customerAttractionData, "Attraction Customer Data issssss");

      if (
        !customerAttractionData?.[field] ||
        customerAttractionData?.[field]?.trim() === ""
      ) {
        errorMessages[field] = `The field "${field}" is required.`;
      }
    });

    setErrors(errorMessages);

    if (Object.keys(errorMessages).length > 0) {
      ToastMessage({
        status: "error",
        message: "Please complete required fields first",
      });
      return;
    }

    if (
      attractionData?.validations?.includes("customer-info") &&
      (!attractionCustomerDetails ||
        Object.keys(attractionCustomerDetails).length === 0)
    ) {
      try {
        setAddToCartLoad(true);

        const response = await getBridgifyValdiationData(
          attractionData?.cart_item_uuid,
          "customer-info"
        );

        if (response?.data?.data) {
          setAttractionCustomerDetails(response.data.data);
        }

        setAddToCartLoad(false);
      } catch (error) {
        console.error("Error fetching customer details:", error);
        setAddToCartLoad(false);
        ToastMessage({
          status: "error",
          message: "Error loading customer information. Please try again",
        });
        return;
      }
    }
    setOpenedModal("customer-info");
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

  const [showMore, setShowMore] = useState(false);

  // NEW: Enhanced handleAddCart function from React Native
  const handleAddCart = (dataSet) => {
    const totalQuantity = customerAttractionData?.tickets?.reduce(
      (sum, ticket) => sum + ticket?.quantity,
      0
    );

    if (totalQuantity !== dataSet?.length) {
      ToastMessage({
        status: "error",
        message: "Please ensure all travelers have been added correctly.",
      });
    } else {
      console.log(dataSet, "Data Set issssssssss bookingggggggg");
      submitDataToBackend("customer-info", dataSet);
    }
  };

  const [cartModal, setCartModal] = useState(false);
  const [moreDetailsModal, setMoreDetailsModal] = useState(false);

  const handleOnAddLifestyle = () => {
    setCartModal(false);
  };

  const [selectedPackage, setSelectedPackage] = useState([]);

  const handleSelectOptions = (data) => {
    console.log(data, "Data value is data issssssss");
    submitDataToBackend("options", data?.option_id);
    setSelectedPackage(data);
  };

  const isAvailable = (date) => {
    return attractionDates.some((availableDate) =>
      isSameDay(date, parseISO(availableDate))
    );
  };

  const [viewBuddies, setViewBuddies] = useState(false);
  const [viewBuddiesEdit, setViewBuddiesEdit] = useState(false);
  const [travelBuddiesStatus, settravelBuddiesStatus] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const handleTravelBuddies = () => {
    setViewBuddies(!viewBuddies);
  };

  // NEW: Enhanced handleAddToCart function from React Native
  const handleAddToCart = () => {
    console.log("attractionCustomerDetails", customerCartData);
    if (viewBuddiesEdit) {
      if (travelBuddiesStatus) {
        setCartModal(true);
      }
    } else {
      setViewBuddies(true);
    }
  };

  // NEW: Enhanced handleTravelBuddiesModel function from React Native
  const handleTravelBuddiesModel = (value, type) => {
    let adults = value.filter((res) => {
      return res.PaxType == "1";
    });
    let childs = value.filter((res) => {
      return res.PaxType == "2";
    });
    setViewBuddies(!viewBuddies);

    submitDataToBackend("customer-info", value);
    setAdultDetails(adults);
    setChildDetails(childs);
    setViewBuddiesEdit(true);
    setSelectPassengerType(type)
    settravelBuddiesStatus(true);
  };

  // NEW: Enhanced handleEditTravelBuddies function from React Native
  const handleEditTravelBuddies = () => {
    settravelBuddiesStatus(false);
    setViewBuddiesEdit(false);

    // Clear only the customer-info data, not dependent fields
    setCustomerAttractionData((prevData) => ({
      ...prevData,
      "customer-info": "",
    }));

    // Clear only cart data since customer info changed
    setExistingCartData([]);
    setCustomerCartData([]);

    // Open the buddies modal
    setViewBuddies(true);
  };

  // NEW: Enhanced shouldShowAddToCartButton function from React Native
  const shouldShowAddToCartButton = () => {
    return (
      customerAttractionData?.tickets?.length > 0 &&
      (ticketPrices?.length > 0 || travelBuddiesStatus)
      // (ticketPrices?.length > 0)
    );
  };

  const handlePassData = (value) => {
    if (value === "await") {
      ToastMessage({
        status: "loading",
        message: "Product adding into a cart click here to undo",
        autoClose: 5000,
      });
    } else {
      if (value == "existing") {
        ToastMessage({ status: "warning", message: "Product already in cart" });
      } else if (value) {
        router.push("/shop/lifestyle");
      } else {
        ToastMessage({
          status: "warning",
          message: "failed to add the product, please try again later..",
        });
      }
    }
  };

  // NEW: Functions to get child and adult count from React Native
  const getChildCount = (data) => {
    if (!data || !data.tickets || !Array.isArray(data.tickets)) {
      return 0;
    }

    return data.tickets.reduce((total, ticket) => {
      if (ticket.product_id === "CHILD" || ticket.product_id === "INFANT") {
        return total + (ticket.quantity || 0);
      }
      return total;
    }, 0);
  };

  const getAdultCount = (data) => {
    if (!data || !data.tickets || !Array.isArray(data.tickets)) {
      return 0;
    }

    return data.tickets.reduce((total, ticket) => {
      if (ticket.product_id !== "CHILD" && ticket.product_id !== "INFANT") {
        return total + (ticket.quantity || 0);
      }
      return total;
    }, 0);
  };

  // NEW: Validation message component from React Native
  const RenderValidationMessage = () => {
    if (componentLoading) {
      return null;
    }
    if (
      !attractionData?.validations ||
      attractionData.validations.length === 0
    ) {
      return (
        <div className="mx-3 my-3 p-4 bg-warning bg-opacity-10 border border-warning rounded">
          <div className="d-flex align-items-start">
            <div className="me-3">
              <CalendarMonthIcon />
            </div>
            <div>
              <h6 className="text-warning fw-bold mb-2">
                Currently Unavailable
              </h6>
              <p className="text-muted mb-0 small">
                This attraction is not available for booking at the moment.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // NEW: Questions functionality from React Native
  const handlePressContinue = (data) => {
    setQuestionsFilled(true);
    setQuestionData(data);
    console.log(data, "question data is data value iss");
  };

  const handleClickBackQuestions = () => {
    setOpenedModal("");
  };

  const handleBookingBack = () => {
    if (questionsFilled == true) {
      setQuestionsFilled(false);
    } else {
      setOpenedModal("");
    }
  };

  const handleBack = (e) => {
    e.preventDefault();

    // Disable scroll restoration temporarily
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    // Go back
    window.history.back();

    // Reset scroll after a short delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  return (
    <>
      <ModalBase
        isOpen={openedModal == "tickets"}
        title={"Select Your Ticket"}
        toggle={() => setOpenedModal("")}
        size="lg"
      >
        <TicketSelector
          handleOnPressContinueData={handleOnPressContinue}
          handleClickBack={handleClickBack}
          attractionTickets={attractionTickets}
          loaders={loaders?.tickets}
        ></TicketSelector>
      </ModalBase>

      <ModalBase
        isOpen={openedModal == "seats-map"}
        title={"View Seat Map"}
        toggle={() => setOpenedModal("")}
        size="lg"
      >
        <div className="container">
          <img src={attractionSeatMap} alt="Seat Map" className="img-fluid" />
        </div>
      </ModalBase>

      <ModalBase
        isOpen={openedModal == "options"}
        title={"Select Your Package"}
        toggle={() => setOpenedModal("")}
        size="lg"
      >
        <PackageSelector
          handleOnPressContinueData={handleSelectOptions}
          handleClickBack={handleClickBack}
          attractionTickets={attractionOptions}
        ></PackageSelector>
      </ModalBase>

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
              <button
                onClick={handleBack}
                style={{ border: "none", background: "none" }}
              >
                <ArrowBackIcon />
              </button>
            </li>
          </ol>
        </nav> */}
        <div className={`collection-wrapper p-sm-2 mt-lg-5 `}>
          <Container>
            <Row>
              <Col>
                {loading ? (
                  <ProductSkeleton skelotonType="productDetails-left-moreDetails" />
                ) : (
                  <>
                    <Service
                      serviceType="lifestyle"
                      latitude={attractionData?.attraction?.geolocation?.lat}
                      longitude={attractionData?.attraction?.geolocation?.lng}
                      showitem={[
                        "proDiscounts",
                        "mapView",
                        "reviewStar",
                        "avalibleLocations",
                      ]}
                      height="360px"
                    />
                  </>
                )}
              </Col>
              <Col lg="9" sm="12" xs="12">
                {loading ? (
                  <ProductSkeleton skelotonType="productDetails" />
                ) : (
                  <Container fluid={true} className="p-0">
                    <Row className="p-0 m-0 product-view-mobile">
                      {/* Product Image */}
                      {console.log(attractionData, "Attraction Data isssssss")}
                      <Col lg="5" className="product-thumbnail p-0 m-0">
                        <div className="mx-3">
                          {attractionData?.attraction?.main_photo_url || attractionData?.attraction?.additional_image_urls?.main_photo_url ? (
                            console.log(attractionData?.attraction?.additional_info?.additional_image_urls?.[0], "Image URL isssssss") ||
                            <Media
                              src={attractionData?.attraction?.additional_info?.additional_image_urls?.[0] || attractionData?.attraction?.main_photo_url }
                              alt="Adventure Hiking in Sri Lanka"
                              className="img-fluid product-main-image"
                              style={{
                                width: "100%",
                                height: "375px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg";
                              }}
                            />
                          ) : (
                            <Media
                              src={`https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg`}
                              alt="Adventure Hiking in Sri Lanka"
                              className="img-fluid product-main-image"
                              style={{
                                width: "100%",
                                height: "375px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                            />
                          )}
                        </div>
                      </Col>

                      {/* Product Details */}
                      <Col
                        lg="7"
                        className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0"
                      >
                        <div className="product-right d-flex flex-wrap justify-content-between">
                          {/* Product Name */}
                          <h1
                            className="col-12 text-start mb-1 product-name-main"
                            style={{
                             textTransform: 'capitalize',
                              fontWeight: "100",
                            }}
                          >
                            {attractionData?.attraction?.english_title}
                          </h1>

                          {/* Location */}
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
                            {/* Location info can be added here */}
                          </p>

                          {/* NEW: Validation message */}
                          <RenderValidationMessage />

                          {/* NEW: Enhanced components rendering */}
                          <RenderComponents />


                          <div style={{marginTop: "100px"}} className="col-12">

                          </div>

                          {/* Price and Action Buttons */}
                          {returnTotalAmount()?.total != 0 ? (
                            <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">
                              <h3 className="m-0 p-0">
                                {/* {`${
                                  returnTotalAmount()?.currency
                                } ${returnTotalAmount()?.total?.toFixed(2)}`} */}
                                {
                                  CurrencyConverter(returnTotalAmount()?.currency,returnTotalAmount()?.total?.toFixed(2),baseCurrencyValue)
                                }
                              </h3>
                              <a
                                className="btn-change-package mb-2"
                                style={{ color: "black" }}
                              >
                                Price for {ticketsLabel()}
                              </a>
                            </div>
                          ) : null}

                          {/* Bottom Action Buttons */}
                          <div className="d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end">
                            {travelBuddiesStatus && (
                              <Button
                                className="btn btn-sm btn-solid col-lg-5 col-12"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                onClick={() => {
                                  handleEditTravelBuddies();
                                }}
                              >
                                Edit travel buddies{" "}
                              </Button>
                            )}
                            {shouldShowAddToCartButton() && (
                              <Button
                                onClick={() => {
                                  handleOnAddToCart();
                                }}
                                className="btn btn-sm btn-solid col-lg-4 col-5"
                                style={{
                                  fontSize: 12,
                                  padding: "10px 15px",
                                  borderRadius: "4px",
                                }}
                                disabled={addToCartLoad}
                              >
                                {addToCartLoad
                                  ? "Loading..."
                                  : viewStatus === "update"
                                  ? "Update Cart"
                                  : travelBuddiesStatus
                                  ? "Add to cart"
                                  : "Add travel buddies"}
                              </Button>
                            )}
                       
                            {attractionData?.validations &&
                              attractionData.validations.length > 0 &&
                              customerAttractionData?.tickets?.length === 0 && (
                                <Button
                                  className="btn btn-sm btn-solid col-lg-5 col-5"
                                  style={{
                                    fontSize: 12,
                                    padding: "10px 15px",
                                    borderRadius: "4px",
                                  }}
                                  onClick={() => handleOnPress("tickets")}
                                >
                                  Check Availability
                                </Button>
                              )}
                            <Button
                              className="btn btn-sm btn-solid col-lg-3 col-5"
                              style={{
                                fontSize: 12,
                                padding: "10px 15px",
                                borderRadius: "4px",
                              }}
                              onClick={handleChatInitiate}
                            >
                              {chatCreating ? "Initiating a chat" : "Chat now"}
                            </Button>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Container>
                )}
              </Col>
            </Row>
          </Container>
                {console.log(attractionData, "Attraction Data issssssssss")}
          {!loadingDes && (
            <ProductTab
              type="lifestyle"
              latitude={attractionData?.attraction?.geolocation?.lat}
              longitude={attractionData?.attraction?.geolocation?.lng}
              showDesc={true}
              name={attractionData?.attraction?.english_title}
              desc={
                attractionData?.attraction?.additional_info
              }
              showReviews={false}
              reviews={attractionData?.attraction?.number_of_reviews}
              showCancellationpolicy={true}
              cancellationPolicy={
                attractionData?.attraction?.cancellation_policy
              }
              provider={"bridgify"}
            />
          )}

          {/* NEW: Enhanced Travel Buddies Modal */}
          <ModalBase
            isOpen={viewBuddies}
            toggle={handleTravelBuddies}
            title="Choose Your Buddies"
            size="md"
          >
            <BuddyModal
              providerlife="bridgify"
              ticketsDetails={customerAttractionData}
              adultCount={getAdultCount(customerAttractionData)}
              childCount={getChildCount(customerAttractionData)}
              adultDetails={adultDetails}
              childsDetails={childsDetails}
              childAges={[]}
              handleTravelBuddies={handleTravelBuddiesModel}
              selectPassengerType={selectPassengerType}
            />
          </ModalBase>

          {/* NEW: Enhanced Cart Modal */}
          <ModalBase
            isOpen={cartModal}
            toggle={handleOnAddLifestyle}
            title="Select Your Cart"
            size="md"
          >
            <CartContainer
              handlePassData={handlePassData}
              productData={customerCartData}
              cartCategory={"Lifestyle"}
              preId={preId || null}
              pageState={viewStatus === "update" ? "CartEdit" : null}
            />
          </ModalBase>

          {console.log(
            attractionCustomerDetails,
            openedModal,
            "Attractionnnnnnnnnn XXXXXXXXXX"
          )}

          {/* NEW: Customer Info Modal with Questions Support */}
          {openedModal === "customer-info" && (
            <ModalBase
              isOpen={true}
              toggle={() => setOpenedModal("")}
              title="Customer Information"
              size="md"
            >
              {attractionCustomerDetails?.required?.includes(
                "required_booking_questions"
              ) && questionsFilled === false ? (
                <div>
                  {/* Booking Questions Component - Replace with your actual BookingQuestions component */}
                  <BookingQuestions
                    attractionQuestions={
                      attractionCustomerDetails?.properties
                        ?.required_booking_questions
                    }
                    handleOnPressContinueData={(formData) => {
                      handlePressContinue(formData);
                      // Handle form submission
                    }}
                    handleClickBack={handleClickBackQuestions}
                    loaders={false}
                  />
                </div>
              ) : (
                <BuddyModal
                  providerlife="bridgify"
                  ticketsDetails={customerAttractionData}
                  adultCount={
                    getFormattedPassengerCounts(customerAttractionData?.tickets)
                      ?.hasAdultChildSeparation
                      ? getFormattedPassengerCounts(
                          customerAttractionData?.tickets
                        )?.passengerTypes[0]?.Count
                      : getTicketQuantity()
                  }
                  childCount={
                    getFormattedPassengerCounts(customerAttractionData?.tickets)
                      ?.passengerTypes[1]?.Count
                  }
                  adultDetails={adultDetails}
                  childsDetails={childsDetails}
                  childAges={[]}
                  handleTravelBuddies={handleAddCart}
                  goBack={() => handleBookingBack()}
                  noChildAdultSeperation={
                    !getFormattedPassengerCounts(
                      customerAttractionData?.tickets
                    )?.hasAdultChildSeparation
                  }
                  totalPax={getTicketQuantity()}
                  provider="bridgify"
                  loader={loaders?.["customer-info"]}
                />
              )}
            </ModalBase>
          )}

          {/* NEW: Description Section with Show More/Less */}
          {/* {!componentLoading && attractionData?.attraction?.description && (
            <div className="mx-3 mt-4 p-3 border rounded">
              <h6 className="fw-bold mb-3">Description</h6>
              <p
                className={`text-justify mb-2 ${
                  !showMore ? "text-truncate-lines-2" : ""
                }`}
              >
                {attractionData?.attraction?.description}
              </p>
              <button
                onClick={() => setShowMore(!showMore)}
                className="btn btn-link p-0 text-muted small"
              >
                {showMore ? "Read Less" : "Read More"}
              </button>
            </div>
          )} */}
        </div>
      </CommonLayout>

      <style jsx>{`
        .text-truncate-lines-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .component-wrapper {
          margin-bottom: 0.5rem;
        }

        .components-container {
          margin: 0 1rem;
          padding-bottom: 0;
        }

        .btn-change-package {
          font-size: 0.875rem;
          text-decoration: none;
          color: #6c757d;
        }

        .btn-change-package:hover {
          color: #495057;
          text-decoration: underline;
        }

        .product-name-main {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1c1c1c;
          text-transform: uppercase;
        }

        .error-border {
          border-color: #dc3545 !important;
        }

        .error-text {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .loading-overlay {
          position: relative;
        }

        .loading-overlay::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }

        @media (max-width: 768px) {
          .product-name-main {
            font-size: 1.25rem;
          }

          .components-container {
            margin: 0 0.5rem;
          }
        }
      `}</style>
    </>
  );
};

export default LifestyleProdcutView;
