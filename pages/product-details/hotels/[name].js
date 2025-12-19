import moment from "moment";
import Head from "next/head";
import axios from "axios";
import Slider from "react-slick";

import Select from "react-select";
import { useRouter } from "next/router";
import DatePicker from "react-date-picker";
import React, { use, useContext, useEffect, useState } from "react";
import { Button, Col, Container, Media, Row } from "reactstrap";
import { db } from "../../../firebase";
import { addDoc, collection } from "firebase/firestore";

import { AppContext } from "../../_app";

import Service from "../common/service";
import ProductTab from "../common/product-tab";
import NewProduct from "../common/newProduct";
import HotelInfoContent from "../../../GlobalFunctions/HotelFunctions/HotelInfoContent";

import {
  getHotelPreBookingDetails,
  loadHotelDetailsById,
  loadHotelRatesById,
  loadHotelDataWithOutAahaas,
} from "../../../AxiosCalls/HotelServices/hotelServices";
import { getProductReiews } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";

import PaxIncrementorComponent from "../../../components/common/PaxIncrementor/PaxIncrementorComponent";
import ModalBase from "../../../components/common/Modals/ModalBase";
import RoomPackageSelector from "../../../components/common/PackageContainer/RoomPackageSelector";
import TBOHotelConditions from "../../../components/common/PackageContainer/TBOHotelConditions";
import BuddyModal from "../../../components/common/TravelBuddies/BuddyModal";
import CartContainer from "../../../components/CartContainer/CartContainer";
import getStar from "../../../components/common/product-box/getStar";
import ToastMessage from "../../../components/Notification/ToastMessage";
import HotelRoomAllocation from "../../../components/common/PaxIncrementor/HotelRoomAllocation/HotelRoomAllocation";
import CommonLayout from "../../../components/shop/common-layout";

import ProductSkeleton from "../../skeleton/productSkeleton";
import ProductFailedPage from "../../skeleton/ProductFailedPage";
import getDiscountProductBaseByPrice from "../common/GetDiscountProductBaseByPrice";

import { getDates } from "../../../GlobalFunctions/HotelFunctions/hotelFunctions";
import {
  generateSlug,
  getDistanceFromLatLon,
} from "../../../GlobalFunctions/OthersGlobalfunctions";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import automateRoomAllocation from "../../../GlobalFunctions/HotelFunctions/automateRoomAllocation";

import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import cookie from "cookie";
import InfoIcon from "@mui/icons-material/Info";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import CustomDatePicker from "../../../components/hotel/ClenderPicker";


export async function getServerSideProps(context) {
  const id = context.query.pID;
  const name = context.query.name;
  const provider = context.query.provider;
  const checkIn = context.query.checkIn;
  const checkOut = context.query.checkOut;
  const viewStatus = context.query.viewStatus;
  const NoOfRooms = context.query.NoOfRooms;
  const NoOfAdults = context.query.NoOfAdults;
  const NoOfChild = context.query.NoOfChild;
  console.log("product query data issss hotel code is", name, provider);

  const { req } = context;

  let baseLocation = {
    latitude: "6.9271",
    longtitude: "79.8612",
    address_full: "Colombo, Sri lanka",
  };

  var dataLocation = null;

  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    console.log("cookies are", cookies);
    try {
      baseLocation = JSON.parse(cookies.userLastLocation);

      const userLastLocation = JSON.parse(cookies.userLastLocation);

      dataLocation = userLastLocation;

      baseLocation = {
        latitude: userLastLocation.latitude.toString(),
        longitude: userLastLocation.longtitude.toString(),
        locationDescription: userLastLocation.address_full,
        address_components: userLastLocation.address_components,
      };

      console.log("baseLocation2 is", baseLocation);
    } catch (error) {
      // console.error('Failed to parse userLastLocation cookie:', error);
    }
  }

  // const provider = 'hotelAhs';
  // const provider = 'hotelTbo';

  let bookingDetailRequest = null;

  if (checkIn && checkOut) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    console.log("checkin date", checkOutDate, checkInDate);

    let date1 = checkInDate;
    let date2 = checkOutDate;

    let Difference_In_Time = date2.getTime() - date1.getTime();
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    const formattedCheckIn = moment(date1).format("DD/MM/YYYY");
    bookingDetailRequest = {
      CheckInDate: formattedCheckIn,
      NoOfNights: Number(Difference_In_Days) || 1,
      NoOfRooms: Number(NoOfRooms) || 1,
      NoOfAdults: Number(NoOfAdults) || 1,
      NoOfChild: Number(NoOfChild) || 0,
      Provider: provider,
      MealPlan:
        //  provider === "hotelTbo" ? "All" : provider === "hotelTboH" ? "All" : [],
        provider === "hotelTbo"
          ? "All"
          : provider === "hotelTboH"
            ? "All"
            : provider === "ratehawk"
              ? "All"
              : [],
      ChildAge: "",
      HotelID: id,
    };

    console.log("data is format ", bookingDetailRequest);
  } else {
    const currentDate = new Date();
    const samplecheckinDate = new Date();
    const samplecheckoutDate = new Date();

    samplecheckinDate.setDate(currentDate.getDate() + 5);
    samplecheckoutDate.setDate(currentDate.getDate() + 6);

    let date1 = samplecheckinDate;
    let date2 = samplecheckoutDate;

    let Difference_In_Time = date2.getTime() - date1.getTime();
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    const formattedCheckIn = moment(date1).format("DD/MM/YYYY");
    // const userLastLocationData = JSON.parse(cookies.userLastLocation);
    bookingDetailRequest = {
      CheckInDate: formattedCheckIn,
      NoOfNights: Difference_In_Days || "1",
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      Provider: "hotelAhs",
      MealPlan:
        provider === "hotelTbo"
          ? "All"
          : provider === "hotelTboH"
            ? "All"
            : provider === "ratehawk"
              ? "All"
              : [],
      ChildAge: "",
      HotelID: id,
      dataSet: JSON.stringify(dataLocation),
    };

    console.log("data is format ", bookingDetailRequest);
  }


  //   const currentDate = new Date();
  // const samplecheckinDate = new Date();
  // const samplecheckoutDate = new Date();

  // samplecheckinDate.setDate(currentDate.getDate() + 5);
  // samplecheckoutDate.setDate(currentDate.getDate() + 6);

  // let date1 = samplecheckinDate;
  // let date2 = samplecheckoutDate;

  // let Difference_In_Time = date2.getTime() - date1.getTime();
  // let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  // const formattedCheckIn = moment(date1).format("DD/MM/YYYY");

  // const bookingDetailRequest = {
  //   CheckInDate: formattedCheckIn,
  //   NoOfNights: Difference_In_Days || "1",
  //   NoOfRooms: 1,
  //   NoOfAdults: 1,
  //   NoOfChild: 0,
  //   Provider: provider,
  //   MealPlan:
  //     provider === "hotelTbo" ? "All" : provider === "hotelTboH" ? "All" : [],
  //   ChildAge: "",
  //   HotelID: id,
  // };

  // console.log("pass values",id, provider, bookingDetailRequest)
  let result = null;
  if (
    provider != "hotelTbo" ||
    provider != "hotelTboH" ||
    provider != "ratehawk"
  ) {

    result = await loadHotelDetailsById(
      id,
      "hotelAhs",
      "details",
      bookingDetailRequest
    );

    console.log("Result Value XXXXXXX", result);

    console.log("hotel datasetttt chamod", id);
  }

  let hotelTboDiscount = null;


  if (
    provider != "hotelTbo" ||
    provider != "hotelTboH" ||
    provider != "ratehawk"
  ) {

    hotelTboDiscount = await loadHotelDetailsById(
      id,
      provider,
      "details",
      bookingDetailRequest
    );
    console.log("hotel datasetttt tbo", hotelTboDiscount, name);
  } else {
  }

  // let result = await loadHotelDetailsById(id, provider, "details", bookingDetailRequest);
  // console.log("resultttttttttttt", name)
  const productUrl = `https://www.aahaas.com/product-details/hotels/${name}?pID=${id}`;

  let hotelDetails = await loadHotelDataWithOutAahaas(
    id,
    provider,
    dataLocation
  );

  const returnHotelData = () => {

    if (
      provider == "hotelTbo" ||
      provider == "hotelTboH" ||
      provider === "ratehawk"
    ) {
      const hotelData = hotelDetails;
      console.log("hotelDetails without aahaas chamod 243", hotelDetails);


      return {
        hotelData: {
          //  ...JSON.parse(context.query.product),
          hotelData,
          discountData: hotelTboDiscount?.discountData || [],
        },
      };
    } else {
      return result;
    }
  };

  const dataset = {
    result: returnHotelData(),
    bookingDetailRequest,
    productId: id,
    canonicalURL: productUrl,
    provider: provider || null,
    hotelData: hotelDetails.HotelCode != undefined ? hotelDetails : null,
  };

  console.log("hotelDetails without aahaas chamod 267", dataset);
  //  const dataset = {
  //   result: returnHotelData(),
  //   bookingDetailRequest,
  //   productId: id,
  //   canonicalURL: productUrl,
  //   provider: provider,
  //   hotelData: context.query.product
  //     ? JSON.parse(context.query.product)
  //     : null,
  // };

  // console.log("hotel datasetttt", JSON.parse(context?.query?.product));
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
        destination: "/shop/hotels",
        permanent: false,
      },
    };
  }

  console.log("dataset issssssss", dataset);


  return {
    props: { dataset },
  };
}

const HotelProductView = ({
  dataset,
  pathId = dataset?.productId,
  procategory = dataset?.provider,
  canonicalURL = dataset?.canonicalURL,
}) => {
  const router = useRouter();
  const viewStatus = router.query.viewStatus;
  const mealType = router.query.MealPlan;
  const roomType = router.query.roomType;
  console.log("router query", roomType);
  const preId = router.query?.preId;
  const childAges = router.query.ChildAge;
  const selectedCart_id = router.query.selectedCart_id;
  console.log("router query mealType", router.query);
  // console.log("router query mealType",Object.values(mealType));

  const PID = dataset?.productId;
  const [mealTBOPlan, setMealTBOPlan] = useState("");

  const { bookbydays } = router.query;
  const { checkIn } = router.query;
  const { checkOut } = router.query;



  const tboMealOptions = [
    { value: "All", label: "All" },
    { value: "With Meal", label: "With Meal" },
    { value: "Room Only", label: "Room Only" },
  ];
  const [discountClaimed, setDiscountClaimed] = useState(false);
  const { userStatus, baseCurrencyValue, baseLocation, baseUserId } =
    useContext(AppContext);
  const [discountValue, setDiscountValue] = useState(

    procategory === "hotelTboH" ||
      procategory === "hotelTbo" ||
      procategory === "ratehawk"

      ? dataset.result?.hotelData?.discountData || []
      : dataset.result?.discountData || []
  );

  const categoryStar = [
    { value: 0, label: "" },
    { value: 1, label: "⭐" },
    { value: 2, label: "⭐⭐" },
    { value: 3, label: "⭐⭐⭐" },
    { value: 4, label: "⭐⭐⭐⭐" },
    { value: 5, label: "⭐⭐⭐⭐⭐" },
  ];

  const [mealTypeCount, setMealTypeCount] = useState({
    BB: 0,
    HB: 0,
    FB: 0,
    RO: 0
  });

  const [paxLimitations, setPaxLimitation] = useState(["Adult", "Child"]);

  const [chatCreating, setChatCreating] = useState(false);

  const [handleRoomAllocationInfo, setHandleRoomAllocationInfo] =
    useState(false);

  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const [loading, setLoading] = useState(false);
  const [showCountBox, setshowCountBox] = useState(false);
  console.log("dataset is", childAges);
  const [customerDetails, setCustomerDetails] = useState({
    adultCount: router.query.adultCount || 1,
    childCount: router.query.childCount || 0,
    // childAges: router.query.childAges || 0,
    childAges: childAges ? childAges.split(",").map(Number) : [],
  });
  const [selectPassengerType, setSelectPassengerType] = useState('all');

  useEffect(() => {
    if (router.query.ChildAge) {
      const childAgesObj = Object.fromEntries(
        router.query.ChildAge
          .split(',')
          .map((age, index) => [`child${index}`, age.trim()])
      );

      setCustomerDetails((prevDetails) => ({
        ...prevDetails,
        childAges: childAgesObj,
      }));
    }
  }, [])

  const [adultChildMinMax, setAdultChildMinMax] = useState({
    minAdult: 50,
    maxAdult: 50,
    minChild: 50,
    maxChild: 50,
    adultAvl: true,
    childAvl: true,
  });

  const [reviews, setReviews] = useState([]);
  const [hotelRoomCategories, setHotelRoomCategories] = useState([]);
  const [selectedRoomCategories, setSelectedRoomCategories] = useState("");

  const [checkIncheckOut, setCheckInCheckOut] = useState({
    checkIn: "",
    checkOut: "",
    betweenDays: [],
  });

  const [cartData, setCartData] = useState([]);
  const [mealTypes, setMealTypes] = useState([]);

  const [dateMeal, setDateMeal] = useState(mealType ? mealType.split(",") : []);
  const [mealPlanModal, setMealPlanModal] = useState(false);

  const [aahaasHotelDetails, setAahaasHotelDetails] = useState([]);

  let date1 = new Date(checkIncheckOut.checkIn);
  let date2 = new Date(checkIncheckOut.checkOut);
  let Difference_In_Time = date2.getTime() - date1.getTime();
  let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

  const [moreDetails, setmoreDetails] = useState({
    Single: 1,
    Double: 0,
    Triple: 0,
    Quad: 0,
  });

  const [roomAllocationData, setRoomAllocationData] = useState([]);

  const [roomAllocationModal, setroomAllocationModal] = useState(false);
  const [conditionnModal, setConditionModal] = useState(false);
  const [roomAllocationModalStatus, setroomAllocationModalStatus] =
    useState(false);

  const [hotelsData, setHotelsData] = useState([]);
  const [bookingAvalibileDates, setBookinAvalibleDates] = useState({
    startdate: "",
    enddate: "",
  });

  const [hotelDetails, setHotelDetails] = useState([]);
  const [hotelDetailsLoading, setHotelDetailsLoading] = useState(true);

  const [serverIssue, setServerIssue] = useState(false);

  const bookingDetailRequest = {
    CheckInDate: moment(checkIncheckOut.checkIn).format("DD/MM/YYYY"),
    NoOfNights: Difference_In_Days,
    NoOfRooms:
      Number(moreDetails.Single) +
      Number(moreDetails.Double) +
      Number(moreDetails.Quad) +
      Number(moreDetails.Triple),
    NoOfAdults: customerDetails.adultCount,
    NoOfChild: customerDetails.childCount,
    Provider: procategory,
    MealPlan:
      procategory === "hotelTbo"
        ? mealTBOPlan
        : procategory === "hotelTboH"

          ? mealTBOPlan
          : procategory === "ratehawk"
            ? mealTBOPlan
            : dateMeal,
    // ChildAge:
    // customerDetails.childCount > 0
    ChildAge:
      customerDetails.childCount > 0 &&
        customerDetails.childAges &&
        Object.keys(customerDetails.childAges).length > 0
        ? Object.values(customerDetails.childAges).join(",")
        : "",
    // ChildAge:
    //   customerDetails.childCount > 0 &&
    //     customerDetails.childAges &&
    //     customerDetails.childAges.length > 0
    //     ? // ? customerDetails.childAges
    //     customerDetails.childAges.join(",")
    //     : // ? Object.values(customerDetails.childAges).toString()
    //     "",
    HotelID: pathId,
  };

  console.log("bookingDetailRequest is", customerDetails);

  const [hotelRoomPackageModal, setHotelRoomPackageModal] = useState(false);
  const [buddyModal, setBuddyModal] = useState(false);

  const [buddyData, setBuddyData] = useState([]);

  const [roomPackageTemp, setRoomPackageTemp] = useState([]);
  const [roomPackageStatus, setRoomPackageStatus] = useState(false);

  const [cartModal, setCartModal] = useState(false);

  const products = {
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrows: true,
    fade: true,
  };

  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const [slider1, setSlider1] = useState(null);
  const [slider2, setSlider2] = useState(null);
  const [minDateValidation, setMinDateValidation] = useState();


  const [moreInfoData, setMoreInfoData] = useState({});

  const roomLimits = {
    single: {
      maxAdults: 1,
      maxCWB: 1,
      maxCNB: 1,
      maxPax: 2,
    },
    double: {
      maxAdults: 2,
      maxCWB: 2,
      maxCNB: 2,
      maxPax: 3,
    },
    triple: {
      maxAdults: 3,
      maxCWB: 2,
      maxCNB: 2,
      maxPax: 4,
    },
    quad: {
      maxAdults: 4,
      maxCWB: 3,
      maxCNB: 3,
      maxPax: 5,
    },
  };

  useEffect(() => {
    const getHotelDetails = async () => {
      console.log("hotel details data is", procategory, pathId);
      let result;
      await axios
        .get(`/ratehawk/hotels/${pathId}/details`)
        .then((res) => {
          if (res.data.status === 200) {
            result = res.data;
            // console.log("hotel details data issss123", res.data.data)
            let data = {
              metapolicy_extra_info: res.data.data?.metapolicy_extra_info,
              metapolicy_struct: res.data.data?.metapolicy_struct,
            };

            setMoreInfoData(data);
          } else {
            result = "Something went wrong !";
            setMoreInfoData({});
          }
        })
        .catch((err) => {
          result = "(Internal Server Error)";
          setMoreInfoData({});
        });
    };

    if (procategory === "ratehawk") {
      console.log("hotel details data is", procategory, pathId);
      getHotelDetails();
    }
  }, []);

  const updateMealData = async (startdate, endDate, type) => {

    setDateMeal([]);
    // console.log("startdate", startdate, endDate, bookbydays);
    console.log("startdate 123", startdate, endDate);
    let sevenDaysAhead;
    if (bookbydays) {
      const currentDate = new Date();
      sevenDaysAhead = new Date(currentDate);
      sevenDaysAhead.setDate(currentDate.getDate() + Number(bookbydays));
      setMinDateValidation(sevenDaysAhead);
      console.log("Seven days ahead:", sevenDaysAhead);
    } else {
      setMinDateValidation(moment(new Date()).add(7, "days").toDate());
    }

    await getDates(
      bookbydays === Number(bookbydays) ? sevenDaysAhead : startdate,
      endDate
    ).then((result) => {
      setCheckInCheckOut({
        checkIn: moment(
          checkIn != null && type != "edit"
            ? new Date(checkIn)
            : bookbydays === Number(bookbydays)
              ? sevenDaysAhead
              : startdate
        ).format("YYYY-MM-DD"),
        checkOut: moment(
          checkOut != null && type != "edit" ? new Date(checkOut) : endDate
        ).format("YYYY-MM-DD"),
        betweenDays: result,
      });
      console.log(
        "result is meal pplan",
        moment(
          checkIn != null && type != "edit"
            ? new Date(checkIn)
            : bookbydays === Number(bookbydays)
              ? sevenDaysAhead
              : startdate
        ).format("YYYY-MM-DD")
      );

      // console.log("result is meal pplan", result);
      // console.log("result is meal pplan", moment(checkIn != null? new Date(checkIn) : bookbydays === Number(bookbydays) ? sevenDaysAhead :startdate).format("YYYY-MM-DD"));
      // console.log("result is meal pplan", moment(checkOut != null? new Date(checkOut) : endDate).format("YYYY-MM-DD"));

      //to auto select the meal plan

      // result.map(async (value) => {
      //   await handleMealSelect(mealTypes[0], value);
      // });
    });
  };

  useEffect(() => {
    if (slider1 && slider2) {
      setNav1(slider1);
      setNav2(slider2);
    }
  }, [slider1, slider2]);

  const clearForgotPasswordForm = () => {
    setForgotEmail("");
    setVerifyOTPforgot({
      verificationCode: "",
      passWord: "",
      confirmPassword: "",
    });
    setForgotEmailStatus({
      status: false,
      message: "",
      statusCode: "",
    });

    if (forgotPassVerifyEmail.current) {
      forgotPassVerifyEmail.current.style.borderColor = "";
    }
  };

  const clearMobileLoginForm = () => {
    setPhoneNumber("");
    setOtp(new Array(6).fill(""));
    setIsOtpSent(false);
    setCounter(60);
    clearInterval(timerRef.current);
  };

  const handleChatInitiate = async () => {
    setChatCreating(true);
    if (chatCreating) {
      ToastMessage({
        status: "warning",
        message: "Already a chat has been initiated",
      });
    } else {
      if (userStatus.userLoggesIn) {
        // console.log("start chat...", hotelDetails)
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
          comments: { category: 4, product_id: hotelDetails?.hotelData?.id },
          customer_id: baseUserId.cxid,
          chat_related: "Technical-support",
          customer_collection_id: baseUserId.cxid,
          chat_related_to: "Product",
          supplier_mail_id: "aahaas@gmail.com",
          group_chat: "true",
          supplier_added_date: Date.now(),
          chat_related_id: pathId,
          chat_category: "4",
          chat_avatar: hotelDetails?.hotelData?.images,
          supplier_id: "635",
          chat_name: hotelDetails?.hotelData?.hotelName,
          // comments: 'Product support - chat has been created from product details',
          updatedAt: new Date(),
        }).then((response) => {
          setChatCreating(false);
          // router.push(
          //   `/page/account/chats?oID=${response._key.path.segments[1]}`
          // );
          const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
          window.open(chatUrl, "_blank");
        });
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath);
        ({
          status: "warning",
          message:
            "You are logged in as a guest user. Please login to access the full system features",
        });
        ToastMessage;
      }
    }
  };

  const handleCheckinDate = async (value) => {
    console.log("checkin date value", value);
    setMealTypeCount({
      BB: 0,
      HB: 0,
      FB: 0,
      RO: 0
    })
    setDateMeal([]);
    const checkInDate = new Date(value);
    setCheckInCheckOut({
      ...checkIncheckOut,
      checkOut: null,
      checkIn: moment(checkInDate).format("YYYY-MM-DD"),
    });
    // let checkOutDate = new Date(checkInDate);
    // checkOutDate.setDate(checkOutDate.getDate() + 1);
    // await updateMealData(checkInDate, checkOutDate,"edit");
  };

  const handleCheckOutDate = async (value) => {

    setMealTypeCount({
      BB: 0,
      HB: 0,
      FB: 0,
      RO: 0
    })
    const checkOutDate = new Date(value);
    // await updateMealData(checkIncheckOut.checkIn, checkOutDate);
    await updateMealData(
      moment(checkIncheckOut.checkIn).toDate(),
      moment(checkOutDate).toDate(),
      "edit"
    );
  };

  // const handleValidateAdultChildCount = (value) => {
  //   let response = automateRoomAllocation(
  //     value?.adult,
  //     value?.child,
  //     moreDetails.Single,
  //     moreDetails.Double,
  //     moreDetails.Triple,
  //     moreDetails.Quad
  //   );
  //   setmoreDetails({
  //     Single: response.response.single,
  //     Double: response.response.double,
  //     Triple: response.response.triple,
  //     Quad: 0,
  //   });
  //   setRoomAllocationData(response.newAllocationArray);
  //   setCustomerDetails({
  //     adultCount: value?.adult,
  //     childCount: value?.child,
  //     childAges: value?.childAges,
  //   });
  //   setshowCountBox(false);
  //   setRoomPackageTemp([]);
  //   setRoomPackageStatus(false);
  //   setroomAllocationModal(false);
  //   setroomAllocationModalStatus(true);
  //   setBuddyData([]);
  // };
  const handleValidateAdultChildCount = (value) => {
    let roomAllocation = {
      Single: 0,
      Double: 0,
      Triple: 0,
      Quad: 0,
    };

    roomAllocation.Single = 0;
    roomAllocation.Double = 0;
    roomAllocation.Triple = 0;
    roomAllocation.Quad = 0;

    // Automatically set room types based on adult count
    const adultCount = value?.adult;
    if (adultCount === 1) {
      roomAllocation.Single = 1;
    } else if (adultCount === 2) {
      roomAllocation.Double = 1;
    } else if (adultCount === 3) {
      roomAllocation.Triple = 1;
    } else if (adultCount === 4) {
      roomAllocation.Quad = 1;
    } else if (adultCount > 4) {
      // For more than 4 adults, combine room types
      const quads = Math.floor(adultCount / 4);
      const remaining = adultCount % 4;
      roomAllocation.Quad = quads;
      if (remaining === 1) {
        roomAllocation.Single = 1;
      } else if (remaining === 2) {
        roomAllocation.Double = 1;
      } else if (remaining === 3) {
        roomAllocation.Triple = 1;
      }
    }
    
    // Reset room allocation data and status when pax count changes
    setRoomAllocationData([]);
    setroomAllocationModalStatus(false); // Set to false to trigger validation
    
    // Update moreDetails based on the new room allocation
    // setmoreDetails(roomAllocation);

    // if (
    //   moreDetails.Single > 0 ||
    //   moreDetails.Double > 0 ||
    //   moreDetails.Triple > 0 ||
    //   moreDetails.Quad > 0
    // ) {
    //   if (moreDetails.Single > 0) {
    //     roomAllocation.Single = moreDetails.Single
    //   }

    //   if (moreDetails.Double > 0) {
    //     roomAllocation.Double = moreDetails.Double
    //   }

    //   if (moreDetails.Triple > 0) {
    //     roomAllocation.Triple = moreDetails.Triple
    //   }

    //   if (moreDetails.Quad > 0) {
    //     roomAllocation.Quad = moreDetails.Quad
    //   }
    // }

    // let response = automateRoomAllocation(
    //   value?.adult,
    //   value?.child,
    //   roomAllocation.Single,
    //   roomAllocation.Double,
    //   roomAllocation.Triple,
    //   roomAllocation.Quad
    // );

    // setmoreDetails(roomAllocation);
    // console.log("roomAllocation", response.newAllocationArray);
    // setRoomAllocationData(response.newAllocationArray);
    console.log("childAgesObj is", customerDetails);
    setCustomerDetails({
      adultCount: value?.adult,
      childCount: value?.child,
      childAges: value?.childAges,
    });
    setshowCountBox(false);
    setRoomPackageTemp([]);
    setRoomPackageStatus(false);
    setroomAllocationModal(false);
    setroomAllocationModalStatus(true);
    setBuddyData([]);
  };

  const [selectedMealType, setSelectedMealType] = useState(viewStatus === "update" ? false : true);
  const [tempDateMeal, setTempDateMeal] = useState({});


  console.log(dateMeal, "Date Meal value data isxxxxxx")
  // const handleMealSelect = async (mealType, date) => {
  //   console.log("meal plannnnnnnnnnnnn", mealType, date);
  //   setDateMeal(
  //     procategory === "hotelTbo"
  //       ? mealTBOPlan
  //       : procategory === "hotelTboH"
  //         ? mealTBOPlan
  //         : procategory === "ratehawk"
  //           ? mealTBOPlan
  //           : (prevDateMeal) => ({ ...prevDateMeal, [date]: mealType })
  //     // :(prevDateMeal) => ({})

  //   );
  //   setRoomPackageTemp([]);
  //   setRoomPackageStatus(false);
  // };
  const handleMealSelect = async (mealType, date) => {
    console.log("meal plannnnnnnnnnnnn", mealType, date);

    if (procategory === "hotelTbo" || procategory === "hotelTboH" || procategory === "ratehawk") {
      // Store in temporary state for TBO hotels
      setTempDateMeal(mealTBOPlan);
    } else {
      // Update temporary state for regular hotels
      setTempDateMeal(prevTempDateMeal => {
        return { ...prevTempDateMeal, [date]: mealType };
      });
    }
    
    // Don't trigger room package updates until Save is clicked
  };

  const [selectRoomCategory, setSelectRoomCategory] = useState(roomType || "");
  const handleRoomCategories = (e) => {
    // console.log("handleRoomCategories",e.value)
    setSelectRoomCategory(e.value);
    setSelectedRoomCategories(e.value);
    setRoomPackageTemp([]);
    setRoomPackageStatus(false);
  };

  const handleMealPlan = (e) => {
    console.log("handleMealPlan", e);
    //     const [checkIncheckOut, setCheckInCheckOut] = useState({
    //   checkIn: "",
    //   checkOut: "",
    //   betweenDays: [],
    // });

    console.log("handleRoomCategories 123123123", e);
    setSelectedRoomCategories(e.value);
    setMealTBOPlan(e.value);
    setRoomPackageTemp([]);
    setRoomPackageStatus(false);
  };

  useEffect(() => {
    if (viewStatus === "update") {
      console.log("view status is update", mealType);
      setMealTBOPlan(tboMealOptions.find((data) => data.value === mealType));
      setSelectedRoomCategories(
        tboMealOptions.find((data) => data.value === mealType)
      );
    }
  }, []);

  const hotelRoomAllocationSuccess = (response, type) => {
    console.log(response, "Room allocation data is");
    setRoomAllocationData(response.roomAllocationArray);
    setmoreDetails({
      Single: response.dataset.single,
      Double: response.dataset.double,
      Triple: response.dataset.triple,
      Quad: response.dataset.quad,
    });
    setRoomPackageTemp([]);
    setRoomPackageStatus(false);
    if (type !== "auto") {
      setroomAllocationModal(false);
    }
    setroomAllocationModalStatus(true);
  };

  const [preBookData, setPrebookData] = useState({});
  const handleRoomSelect = (data) => {
    console.log(data, "Data values room is ");
    const provider = data?.Provider;

    if (
      provider === "hotelTbo" ||
      provider === "hotelTboH" ||
      provider === "ratehawk"
    ) {
      // console.log(data,"Data values room is ")


      const url =
        provider === "hotelTboH"
          ? `tboh/hotels/pre-book/${data?.RateIDs}`

          : provider === "ratehawk"
            ? `ratehawk/hotels/pre-book/${data?.RateIDs}`
            : `tbov2/hotels/pre-book/${data?.RateIDs}`;
      // provider === "hotelTboH"
      //   ? `tboh/hotels/pre-book/${data?.RateIDs}`
      //   : `tbov2/hotels/pre-book/${data?.RateIDs}`;


      console.log("url", url)
      axios.post(url).then((res) => {
        console.log(res?.data, "Response Data set values areeeeeeeee")
        if (res.data?.Status?.Code == 200) {
          const mainDataSet = {
            hotelMainRequest: hotelDetails,
            hotelRatesRequest: data,
            preBooking: res?.data?.HotelResult,
            preBookValidations: res?.data?.ValidationInfo,

            // ...bookingDetails
          };
          setPrebookData(mainDataSet);
          console.log(data, "Room allocation data is");

          setRoomPackageTemp(data);
          setHotelRoomPackageModal(false);
          setRoomPackageStatus(true);
          setConditionModal(true);
        } else if (res.data?.Status?.Code == 201) {
          ToastMessage({
            status: "warning",
            message: res.data?.Status?.Description,
          });
        } else {
          ToastMessage({
            status: "warning",
            message:
              "Something went wrong while processing your request. Please try again in a moment.",
          });
        }
        console.log(res.data, "Response Data values for hotels isssss");
      });
    } else {
      console.log(data, "Room allocation data is");
      setRoomPackageTemp(data);
      setHotelRoomPackageModal(false);
      setRoomPackageStatus(true);
      console.log(data, "Discount meta value set");

      discountValue?.map((item) => {
        if (item?.origin_rate_id == data?.RateIDs) {
          setDiscountMetaVal(item);
        }
      });

      //   setDiscountMetaVal(data?.discount_meta_value_set);

      if (userStatus.userLoggesIn) {
        setBuddyModal(!buddyModal);
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

  const handleTravelBuddyInTBO = () => {
    if (userStatus.userLoggesIn) {
      setConditionModal(false);
      setHotelRoomPackageModal(false);
      setBuddyModal(!buddyModal);
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

  const [adultDetails, setAdultDetails] = useState([]);
  const [childsDetails, setChildDetails] = useState([]);

  const handleTravelBuddies = (data, type) => {
    let adults = data.filter((res) => {
      return res.PaxType == "1";
    });
    let childs = data.filter((res) => {
      return res.PaxType == "2";
    });
    setSelectPassengerType(type)
    setAdultDetails(adults);
    setChildDetails(childs);

    setBuddyData(data);
    setHotelRoomPackageModal(false);
    setBuddyModal(false);
  };

  const handleBookHotel = () => {
    setCartModal(false);
    // router.push('/page/account/cart-page')
    router.push("/shop/hotels");
  };

  const transformArr = (data) => {
    let transformedArray = [];
    if (cartStatus.status === "CartUpdate") {
      transformedArray = data.map((item) => ({
        indexValue: item.indexValue || 0,
        roomType: item.roomType,
        adultCount: item.adultCount || 0,
        childCount: item.childCount || 0,
        childAges: item.childAges || [],
      }));
    } else {
      transformedArray = data.map((item, key) => ({
        indexValue: key,
        roomType: item.roomType,
        adultCount: item.adultCount,
        childCount: Number(item.childCount_CNB) + Number(item.childCount_CWB),
        childAges: [],
      }));
    }
    return transformedArray;
  };
  const handleCheckAvalibility = async () => {
    setLoading(true);
    console.log("Room allocation validation failed");
    // Add validation before proceeding
    if (!validateRoomAllocation()) {
      setLoading(false);
      return;
    }
    // Check if room allocation data is empty - this happens when user changes pax count
    if (roomAllocationData.length === 0) {
      ToastMessage({
        status: "warning",
        message: "Kindly allocate the rooms.",
      });
      try {
        document.getElementById("roomallocationbutton").style.borderColor = "red";
      } catch (error) {
        // console.error(error);
      }
      setLoading(false);
      return;
    }
    if (selectRoomCategory == "" && procategory !== "hotelTbo" && procategory !== "hotelTboH" && procategory !== "ratehawk") {
      ToastMessage({
        status: "warning",
        message: "Please select a room category.",
      });
      setLoading(false);
      return;

    }

    let customerRequest = null;
    const transformedArray = transformArr(roomAllocationData);


    if (
      procategory === "hotelTbo" ||
      procategory === "hotelTboH" ||
      procategory === "ratehawk"
    ) {

      console.log("Test XXXXX data")
      customerRequest = {
        mealAllocation:
          viewStatus === "update" ? mealType : selectedRoomCategories,
        room_category: "",
        check_in: checkIncheckOut.checkIn,
        check_out: checkIncheckOut.checkOut,
        customer_request: {
          ...bookingDetailRequest,
          MealPlan: selectedRoomCategories,
        },
        room_count: moreDetails,
        room_allocation: transformedArray,
      };

      console.log(customerRequest, "Customer Request isssss");
      console.log(bookingDetailRequest, "Customer Request isssss");
    } else {

      console.log("transformedArrayxxxxxx", dateMeal);
      customerRequest = {
        mealAllocation: dateMeal,
        room_category: selectedRoomCategories,
        check_in: checkIncheckOut.checkIn,
        check_out: checkIncheckOut.checkOut,
        customer_request: bookingDetailRequest,
        room_count: moreDetails,
        room_allocation: transformedArray,
      };
    }

    console.log(customerRequest, "Customer Request isssss");
    console.log(bookingDetailRequest, "Customer Request isssss");

    if (roomAllocationModalStatus) {
      console.log("Room allocation validation passed", pathId, customerRequest);
      // return
      await loadHotelRatesById(pathId, customerRequest)
        .then((value) => {
          if (
            value === "Something went wrong !" ||
            value === "(Internal Server Error)"
          ) {
            console.log("valueeee in something went wrong");
            ToastMessage({
              status: "warning",
              message: "This hotel is not available for selected criteria.",
            });
          } else if (value.status === 200) {
            console.log("sucess", value);
            const newHotelData = {
              pathId,
              provider: procategory,
              details: aahaasHotelDetails,
              rooms: value.HotelRoomsDetails,
            };
            setHotelRoomPackageModal(true);
            setHotelsData(newHotelData);
          } else if (value.status === 400) {
            console.log("valueeee in something went 400", value);
            ToastMessage({
              status: "warning",
              message: "This hotel is not available for selected criteria.",
            });
          } else if (value.status === 401) {
            console.log("valueeee in something went 401");
            ToastMessage({
              status: "warning",
              message: "This hotel is not available for selected criteria.",
            });
          } else {
            console.log("valueeee in something went");
            ToastMessage({
              status: "warning",
              message: "This hotel is not available for selected criteria.",
            });
          }
        })
        .catch((error) => {
          console.log("Error in loadHotelRatesById:", error);
          ToastMessage({
            status: "error",
            message: error.response?.data?.message || "An error occurred",
          });
        });

      try {
        document.getElementById("roomallocationbutton").style.borderColor =
          "lightgray";
      } catch (error) {
        // console.error(error);
      }
    } else {
      try {
        document.getElementById("roomallocationbutton").style.borderColor =
          "red";
      } catch (error) {
        // console.error(error);
      }
      ToastMessage({
        status: "warning",
        message: "Kindly allocate the rooms.",
      });
    }
    setLoading(false);
  };

  const handlePassData = () => {
        const transformedArray = transformArr(roomAllocationData);
    console.log("handlePassData", dateMeal, checkIncheckOut.checkOut, transformedArray);
      if (checkIncheckOut.checkIn === null && checkIncheckOut.checkIn ==="") {
        // procategory === "hotelAhs" && dateMeal.length === 0 || null
      ToastMessage({
          status: "warning",
          message: `Please select a check out date.`,
        });
        return false;
      }else if(procategory === "hotelAhs" && dateMeal.length === 0 || null){
        ToastMessage({
          status: "warning",
          message: `Please select a meal plan.`,
        });
        return false;
      }

    
    // return
    var hotelBlockingData = [];

    if (userStatus.userLoggesIn) {
      let customerRequest = {
        mealAllocation: dateMeal,
        room_category: selectedRoomCategories,
        check_in: checkIncheckOut.checkIn,
        check_out: checkIncheckOut.checkOut,
        customer_request: bookingDetailRequest,
        room_count: moreDetails,
        room_allocation: transformedArray,
      };
      let childAges = "";
      var travellerChilds = buddyData.filter((res) => res.PaxType === "2");
      if (customerDetails.childCount > 0) {
        const childAgesArr = Object.values(customerDetails.childAges);
        const childAgeBool = childAgesArr.every((age) =>
          travellerChilds?.some(
            (child) => child?.Age?.toString() === age.toString()
          )
        );

        if (!childAgeBool) {
          ToastMessage({
            status: "error",
            message: "Please recheck all children ages",
          });
          return false;
        }

        // Convert to string "10,8"
        childAges = childAgesArr.join(',');
        // console.log("childAges:", childAgesString); // e.g., "10,8"
      }

      console.log("customerDetails is", childAges);
      if (
        parseInt(customerDetails.adultCount) +
        parseInt(customerDetails.childCount) !=
        buddyData?.length
      ) {
        ToastMessage({
          status: "error",
          message: "Kindly select the travel buddies to add the product to the cart",
        });
      } else {
        // hotelBlockingData["ChildAge"] = childAges;
        hotelBlockingData["hotelMainRequest"] = aahaasHotelDetails;
        hotelBlockingData["paxDetails"] = buddyData;
        hotelBlockingData["discount_meta_value_set"] = discountsMetaVal?.id
          ? JSON.stringify(discountsMetaVal)
          : null;
        hotelBlockingData["customerDetails"] = customerRequest;
        hotelBlockingData["hotelRatesRequest"] = roomPackageTemp;

        if (
          procategory === "hotelTbo" ||
          procategory === "hotelTboH" ||
          procategory === "ratehawk"
        ) {

          hotelBlockingData["preBooking"] = preBookData.preBooking;
          hotelBlockingData["preBookValidations"] =
            preBookData.preBookValidations;

          if (viewStatus === "update") {
            hotelBlockingData["viewStatus"] = viewStatus;
            hotelBlockingData["ref_id"] = pathId;
            hotelBlockingData["cart_id"] = selectedCart_id;
          }
        } else {
          if (viewStatus === "update") {
            hotelBlockingData["viewStatus"] = viewStatus;
            hotelBlockingData["ref_id"] = pathId;
            hotelBlockingData["cart_id"] = selectedCart_id;
            console.log("selectedCart_id is", selectedCart_id, pathId, viewStatus);
          }
        }

        hotelBlockingData["cartStatus"] = cartStatus.status;
        // hotelBlockingData["discount_meta_value_set"] = null;
        console.log("hotelBlockingData isssssssssss", hotelBlockingData);
        // return
        hotelBlockingData = { ...hotelBlockingData, ...bookingDetailRequest };
        setCartData(hotelBlockingData);
        setCartModal(true);
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

  const handleMealPlanModal = () => {
    console.log("handleMealPlanModal");
    const { checkIn, checkOut } = checkIncheckOut;
    const isCheckInValid = moment(checkIn, "YYYY-MM-DD", true).isValid();
    const isCheckOutValid = moment(checkOut, "YYYY-MM-DD", true).isValid();
    const isCheckInBeforeCheckOut = moment(checkIn).isBefore(moment(checkOut));
    const isCheckInNotPast = moment(checkIn).isSameOrAfter(moment(), "day");
    if (!isCheckInValid) {
      ToastMessage({
        status: "warning",
        message: "Invalid check-in date format",
      });
    } else if (!isCheckOutValid) {
      ToastMessage({
        status: "warning",
        message: "plase select check-out date format",
      });
    } else if (!isCheckInBeforeCheckOut) {
      ToastMessage({
        status: "warning",
        message: "Check-in date must be before check-out date",
      });
    } else if (!isCheckInNotPast) {
      ToastMessage({
        status: "warning",
        message: "Check-in date cannot be in the past",
      });
    } else {
      // Initialize the temporary state with current selections when opening modal
      setTempDateMeal({...dateMeal});
      setMealPlanModal(true);
    }
  };

  const handleRoomAllocationOnClick = () => {
    const allZero = Object.values(moreDetails).every(
      (value) => value === 0 || value === "0" || !value
    );

    console.log("allZero", allZero);

    let totalRoomCountWithAllocation =
      moreDetails.Single * 1 +
      moreDetails.Double * 2 +
      moreDetails.Triple * 3 +
      moreDetails.Quad * 4;
    setroomAllocationModal(true);
    // if (allZero) {
    //   ToastMessage({
    //     status: "warning",
    //     message: "Please specify the number of rooms.",
    //   });
    // } else if (totalRoomCountWithAllocation < customerDetails.adultCount) {
    //   ToastMessage({
    //     status: "warning",
    //     message: "Room count is not matching with adult and childrens count.",
    //   });
    // } else {
    //   setroomAllocationModal(true);
    // }
  };

  const handleNavigateMap = () => {
    window.open(
      `https://www.google.com/maps/dir/${baseLocation.latitude}, ${baseLocation.longtitude} / ${hotelDetails?.hotelData?.latitude}, ${hotelDetails?.hotelData?.longitude}`,
      "_blank"
    );
  };

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

  const getHotelDetails = async () => {
    setHotelDetailsLoading(true);

    if (
      procategory === "hotelTbo" ||
      procategory === "hotelTboH" ||
      procategory === "ratehawk"
    ) {

      // if (dataset.result === '(Internal Server Error)') {
      //     setServerIssue(true);
      // } else {
      //     setServerIssue(false);
      // }
      setBookinAvalibleDates({
        startdate: new Date("2024-10-01"),
        enddate: new Date("2025-03-31"),
      });

      console.log(dataset, "Hotel Details data TBO is");

      var hotelData = dataset?.hotelData;

      const transformedData = {
        id: hotelData?.HotelCode,
        hotelCode: hotelData?.HotelCode || null,
        ahs_HotelId: 1,
        city_code: null,
        hotelName: hotelData?.HotelName || null,
        hotelDescription: hotelData?.HotelDescription || null,
        country: hotelData?.Country ? "LK" : null,
        countryCode: "LK",
        latitude: hotelData?.Latitude || null,
        longitude: hotelData?.Longitude || null,
        category: hotelData?.HotelCategory || null,
        boards: null,
        address: hotelData?.HotelAddress || null,
        postalCode: null,
        city: hotelData?.City || null,
        email: null,
        web: null,
        class: hotelData?.StarRating || null,
        tripAdvisor: null,
        facilities: null,
        images: hotelData?.HotelPicture || null,
        rating: null,
        provider: hotelData?.provider || null,
        microLocation: hotelData?.City || null,
        driverAcc: "No",
        liftStatus: "No",
        vehicleApproach: "No",
        published_price: null,
        accountStatus: null,
        updated_at: new Date().toISOString(),
        created_at: "2024-10-08 00:00:00",
      };
      console.log("transformedData", transformedData);
      setHotelDetails({ hotelData: transformedData });
      setAahaasHotelDetails({ status: 200, hotelData: transformedData });
    } else {
      let value = dataset.result;
      console.log("valueeee", value, dataset);
      if (generateSlug(value.hotelData?.hotelName) !== router.query.name) {
        window.location.assign(

          `/product-details/hotels/${generateSlug(

            value.hotelData?.hotelName
          )}?pID=${router.query.pID}`
        );
      } else {
        const hotelRoomCategories = value?.hotelRoomCategories?.map(
          (value) => ({
            value: value,
            label: value,
          })
        );
        setHotelRoomCategories(hotelRoomCategories);
        setSelectedRoomCategories(hotelRoomCategories?.[0]?.value);
        setMealTypes(value.hotelMeals);
        setAahaasHotelDetails(value);
        console.log("transformedData", value);

        setHotelDetails(value);
        setCategories({
          category1: "3",
          category2: 0,
          category3: 0,
          latitude: value?.hotelData?.latitude,
          longitude: value?.hotelData?.longitude,
          sliderCount: "5",
        });
        setBookinAvalibleDates({
          startdate: new Date(value.minBookingDate),
          enddate: new Date(value.maxBookingDate),
        });
        const reviews = await getProductReiews(4, pathId);
        if (reviews.status === 200) {
          setReviews(reviews);
        }
      }
    }
    setHotelDetailsLoading(false);
  };

  const handleTravelBuddiesModal = () => {
    setBuddyModal(true);
  };

  console.log(hotelDetails, "Hotel details data aahaas is");

  const updateInitialValue = async () => {
    if (router?.query?.viewStatus === "update") {
      let result = await getHotelPreBookingDetails(router.query.preId);

      if (
        result !== "Something went wrong !" &&
        result !== "(Internal Server Error)"
      ) {
        let bookingDataSet = JSON.parse(result.bookingdataset);

        setCartStatus({
          status: "CartUpdate",
          preId: result.prebooking_id,
          cartId: "",
        });
        console.log(
          "checkin date",
          bookingDataSet.customerDetails.check_in,
          bookingDataSet.customerDetails.check_out
        );
        await updateMealData(
          bookingDataSet.customerDetails.check_in,
          bookingDataSet.customerDetails.check_out
        );


        setSelectedRoomCategories(bookingDataSet.customerDetails.room_category);
        const counts = { BB: 0, HB: 0, FB: 0, RO: 0 };
        Object.values(bookingDataSet.customerDetails.mealAllocation).forEach(mealType => {
          if (counts[mealType] !== undefined) {
            counts[mealType]++;
          }
        });

        setMealTypeCount(counts);

        setDateMeal(bookingDataSet.customerDetails.mealAllocation);
        let childAgesObj = {};
        if (bookingDataSet.ChildAge) {
          childAgesObj = Object.fromEntries(
            bookingDataSet.ChildAge
              .split(',')
              .map((age, index) => [`child${index}`, age.trim()])
          );
        }
        setCustomerDetails({
          adultCount: bookingDataSet.NoOfAdults,
          childCount: bookingDataSet.NoOfChild,
          childAges: childAgesObj || {},
        });
        setmoreDetails({
          Single: bookingDataSet.customerDetails.room_count.Single,
          Double: bookingDataSet.customerDetails.room_count.Double,
          Triple: bookingDataSet.customerDetails.room_count.Triple,
          Quad: bookingDataSet.customerDetails.room_count.Quad,
        });
        

        const mappedRoomAllocation = bookingDataSet.customerDetails.room_allocation.map(room => ({
          roomType: room.roomType,
          index: room.indexValue + 1, // using existing indexValue + 1
          adultCount: room.adultCount,
          childCount_CNB: 0, // always 0 as specified
          childCount_CWB: room.childCount
        }));
        console.log("room allocation data is",
          mappedRoomAllocation)
        setRoomAllocationData(mappedRoomAllocation);
        setroomAllocationModalStatus(true);
        setRoomPackageTemp(bookingDataSet.hotelRatesRequest);
        setRoomPackageStatus(true);
        setBuddyData(bookingDataSet.paxDetails);
      }
    } else {
      let newStart = false;
      let newEnd = false;

      let date = moment(
        dataset.bookingDetailRequest.CheckInDate,
        "DD/MM/YYYY"
      ).toDate();

      let samplecheckinDate = new Date(date);
      let samplecheckoutDate = new Date(date);

      samplecheckinDate.setDate(samplecheckinDate.getDate() + 2);
      samplecheckoutDate.setDate(samplecheckoutDate.getDate() + 2);

      samplecheckoutDate.setDate(
        samplecheckinDate.getDate() +
        Number(dataset.bookingDetailRequest.NoOfNights)
      );

      let bookingStartDate = new Date(bookingAvalibileDates.startdate);
      let bookingEndDate = new Date(bookingAvalibileDates.enddate);
      bookingEndDate.setDate(
        bookingStartDate.getDate() +
        Number(dataset.bookingDetailRequest.NoOfNights)
      );

      if (newStart && newEnd) {
        ToastMessage({
          status: "warning",
          message: "Check in and check out date was changed",
        });
      } else if (newStart) {
        ToastMessage({
          status: "warning",
          message: "Check in date was changed",
        });
      } else if (newEnd) {
        ToastMessage({
          status: "warning",
          message: "Check out date was changed",
        });
      }
      console.log("checkin date", samplecheckinDate, samplecheckoutDate);
      await updateMealData(samplecheckinDate, samplecheckoutDate);
    }
  };

  const handleOnChangeRoom = (val, e) => {
    if (e.target.value > 10) {
      ToastMessage({
        status: "warning",
        message: "Maximum 10 rooms can be allocated",
      });
      return;
    } else {
      if (e.target.value >= 0) {
        setmoreDetails({ ...moreDetails, [val]: e.target.value });
      }
    }

    setRoomPackageTemp([]);
    setRoomPackageStatus(false);
    setRoomAllocationData([]);
    setRoomPackageTemp([]);
    setroomAllocationModalStatus(false);
  };

  const [openSideBarStatus, setopenSideBarStatus] = useState(false);
  const [packageMoreDetails, setPackageMoreDetails] = useState(false);

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

  useEffect(() => {
    if (!hotelDetailsLoading) {
      updateInitialValue();
    }
  }, [router, hotelDetailsLoading, mealTypes]);

  useEffect(() => {
    getHotelDetails();
  }, [dataset]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [window.location.href]);

  const [discountsMetaVal, setDiscountMetaVal] = useState([]);

  const handleDiscountOnClaim = (id) => {
    console.log("Discount id is", id);
    if (id) {
      setDiscountClaimed(true);
    }
    setDiscountMetaVal(id);
  };

  const getDiscountByRate = (dataVar) => {
    const discountVal = discountValue.filter((data) => {
      return data?.origin_rate_id == dataVar;
    });

    return discountVal?.[0];
  };

  const [modelInfoShow, setModelInfoShow] = useState(false);
  const handleMoreInfo = () => {
    setModelInfoShow(!modelInfoShow);

  };

  const validateRoomAllocation = () => {
    const totalAdults = parseInt(customerDetails.adultCount);
    const totalChildren = parseInt(customerDetails.childCount);
    const totalPax = totalAdults + totalChildren;

    // Calculate total capacity based on room allocation
    let totalMaxAdults = 0;
    let totalMaxPax = 0;
    let totalRooms = 0;

    // Calculate capacity for each room type
    Object.keys(moreDetails).forEach((roomType) => {
      const roomCount = parseInt(moreDetails[roomType]) || 0;
      if (roomCount > 0) {
        const roomTypeKey = roomType.toLowerCase();
        if (roomLimits[roomTypeKey]) {
          totalMaxAdults += roomLimits[roomTypeKey].maxAdults * roomCount;
          totalMaxPax += roomLimits[roomTypeKey].maxPax * roomCount;
          totalRooms += roomCount;
        }
      }
    });

    // Validation checks
    if (totalRooms === 0) {
      ToastMessage({
        status: "warning",
        message: "Please select at least one room.",
      });
      return false;
    }

    if (totalMaxAdults < totalAdults) {
      ToastMessage({
        status: "warning",
        message: `Selected rooms can accommodate maximum ${totalMaxAdults} adults, but you have ${totalAdults} adults.`,
      });
      return false;
    }

    if (totalMaxPax < totalPax) {
      ToastMessage({
        status: "warning",
        message: `Selected rooms can accommodate maximum ${totalMaxPax} guests, but you have ${totalPax} guests.`,
      });
      return false;
    }

    const minRequiredRooms = Math.ceil(totalAdults / 4); // Assuming max 4 adults per room (quad)
    if (totalRooms < minRequiredRooms) {
      ToastMessage({
        status: "warning",
        message: `You need at least ${minRequiredRooms} rooms for ${totalAdults} adults.`,
      });
      return false;
    }

    if (procategory === "hotelAhs" && dateMeal.length === 0 || null) {
      ToastMessage({
        status: "warning",
        message: `Please select a meal plan.`,
      });
      return false;
    }

    return true;
  };

  // const handleMasterMealSelect = (selectedMealType) => {
  //   console.log("Selected meal type:", selectedMealType);
  //   const updatedDateMeal = {};
  //   checkIncheckOut.betweenDays.forEach((date) => {
  //     updatedDateMeal[date] = selectedMealType;
  //   });
  //   setDateMeal(updatedDateMeal);
  // };

  const handleMasterMealSelect = (selectedMealType) => {
    console.log("Selected meal type:", selectedMealType);

    const updatedDateMeal = {};
    checkIncheckOut.betweenDays.forEach((date) => {
      updatedDateMeal[date] = selectedMealType;
    });

    // Only update the temporary state
    setTempDateMeal(updatedDateMeal);
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

  const [initialStartDate] = useState(() =>
    checkIncheckOut.checkIn ? moment(checkIncheckOut.checkIn).toDate() : null
  );
  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalURL} as={canonicalURL} />
        {/* Set the dynamic title here */}
        <title>

          Aahaas - {dataset.result.hotelData?.hotelName} - Book Your Stay with

          Aahaas | Luxury Stay/Location
        </title>
        {/* Set meta description if needed */}
        <meta
          name="description"

          content={`Stay at ${dataset.result.hotelData?.hotelName} one of the best hotels in  Sri Lanka. Enjoy luxury amenities, stunning views, and top-notch hospitality. Book your perfect stay with Aahaas today!`}

        />
        {/* PDP Page */}
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
                  name: "Hotels",
                  item: "https://www.aahaas.com/product-details/hotels/",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Hotels",
                  item: `https://www.aahaas.com/product-details/hotels/${generateSlug(

                    dataset.result.hotelData?.hotelName

                  )}?pID=${pathId}`,
                },
              ],
            }),
          }}
        />
      </Head>

      <CommonLayout
        parent="Home"
        title={"hotels"}
        subTitle={"product view"}
        subTitleParentLink={"/shop/hotels"}
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
        <div
          className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? "mb-5" : "mb-0"
            }`}
        >
          <Container>
            {serverIssue ? (
              <Row>
                <ProductFailedPage />
              </Row>
            ) : (
              <Row>
                <Col
                  sm={3}
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
                  {!serverIssue && hotelDetailsLoading ? (
                    <ProductSkeleton skelotonType="productDetails-left-moreDetails" />
                  ) : !serverIssue && !hotelDetailsLoading ? (
                    <>
                    {console.log(hotelDetails?.hotelData?.class, "reviews overall rate")}
                      <Service
                        latitude={hotelDetails?.hotelData?.latitude}
                        longitude={hotelDetails?.hotelData?.longitude}
                        locationName={hotelDetails?.hotelData?.address}
                        hotelCategory={getStar(
                          parseInt(hotelDetails?.hotelData?.class)
                        )}
                        tripAdvisorLink={hotelDetails?.hotelData?.tripAdvisor}
                        productReview={
                          categoryStar[reviews?.overall_rate?.[0]]?.label
                        }
                        productReviewCount={reviews?.overall_rate?.[1]}
                        showitem={(() => {
  const items = ["proDiscounts", "mapView", "tripAdvisor", "reviewStar"];
  if (hotelDetails?.hotelData?.class === undefined) {
    items.push("hotelCategory");
  }
  return items;
})()}
                        height="360px"
                        discounts={discountValue}
                        serviceType={"Hotel"}
                        handleDiscountOnClaim={handleDiscountOnClaim}
                        discountsMetaVal={discountsMetaVal}
                      />
                      <NewProduct
                        sliderCount={categories.sliderCount}
                        category1={"3"}
                        latitude={baseLocation?.latitude}
                        longitude={baseLocation?.longtitude}
                        vendor={0}
                        p_ID={PID}
                      />
                    </>
                  ) : null}
                </Col>

                <Col lg="9" sm="12" xs="12">
                  <Container fluid={true} className="p-0">
                    {!serverIssue && hotelDetailsLoading ? (
                      <ProductSkeleton skelotonType="productDetails-left-moreDetails" />
                    ) : !serverIssue && !hotelDetailsLoading ? (
                      <Row className="p-0 m-0 product-view-mobile">
                        <Col lg="5" className="product-thumbnail p-0 m-0">
                          {/* Main slider */}
                          <Slider
                            {...products}
                            asNavFor={nav2}
                            ref={(slider) => setSlider1(slider)}
                            className="product m-0 p-0"
                          >
                            {hotelDetails?.hotelData?.images?.split?.(",")
                              ?.length >= 1 ? (
                              hotelDetails?.hotelData?.images
                                ?.split?.(",")
                                ?.map((vari, index) => (
                                  <div key={index} className="mx-3 m-0 p-0">
                                    <Media
                                      alt={`${hotelDetails?.hotelData?.hotelName} - Spacious interiors and luxury exteriors of the best hotel in Sri Lanka with a beautiful view.`}
                                      src={`${vari}`}
                                      className="img-fluid product-main-image pe-4 m-0 p-0"
                                      style={{
                                        width: "98%",
                                        height: "430px",
                                        objectFit: "cover",
                                      }}
                                      loading="lazy"
                                    />
                                  </div>
                                ))
                            ) : (
                              <div className="mx-3 m-0 p-0">
                                <Media
                                  alt={`${hotelDetails?.hotelData?.hotelName} - Default placeholder image`}
                                  src="https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png"
                                  className="img-fluid product-main-image pe-4 m-0 p-0"
                                  style={{
                                    width: "98%",
                                    height: "430px",
                                    objectFit: "cover",
                                  }}
                                  loading="lazy"
                                />
                              </div>
                            )}
                          </Slider>

                          {/* Thumbnail slider */}
                          {hotelDetails?.hotelData?.images?.split?.(",")
                            .length > 1 && (
                              <div>
                                <Slider
                                  asNavFor={slider1}
                                  ref={(slider) => setSlider2(slider)}
                                  slidesToShow={5}
                                  swipeToSlide={true}
                                  focusOnSelect={true}
                                  className="mt-3"
                                  infinite={false}
                                >
                                  {hotelDetails?.hotelData?.images
                                    ?.split?.(",")
                                    ?.map((vari, index) => (
                                      <div key={index} className="px-1">
                                        <Media
                                          alt={`${hotelDetails?.hotelData?.hotelName
                                            } - Thumbnail ${index + 1}`}
                                          src={`${vari}`}
                                          className="img-fluid"
                                          style={{
                                            height: "80px",
                                            width: "100%",
                                            objectFit: "cover",
                                            cursor: "pointer",
                                          }}
                                          loading="lazy"
                                        />
                                      </div>
                                    ))}
                                </Slider>
                              </div>
                            )}
                        </Col>
                        <Col
                          lg="7"
                          className="rtl-text p-0 m-0 px-2 pe-0 px-lg-4 pe-lg-0"
                        >
                          <div
                            className="product-right d-flex flex-wrap justify-content-between"
                            style={{ height: "100%" }}
                          >
                            <h1
                              className="col-12  text-start mb-1 product-name-main"
                              style={{
                                // textTransform: "uppercase",
                                fontWeight: "500",
                              }}
                            >
                              {hotelDetails?.hotelData?.hotelName}
                            </h1>
                            <p
                              className="col-12 m-0 p-0 ellipsis-1-lines m-0 text-start"
                              // className="col-12 m-0 p-0 m-0 text-start"
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
                                hotelDetails?.hotelData?.latitude,
                                hotelDetails?.hotelData?.longitude
                              )}{" "}
                              kms away from your currenct location -{" "}
                              {hotelDetails?.hotelData?.address}
                            </p>

                            {procategory === "hotelAhs" &&
                              new Date(bookingAvalibileDates.enddate) <
                              new Date() && (
                                <p
                                  className="col-12 mb-2"
                                  style={{
                                    color: "red",
                                    textTransform: "capitalize",
                                  }}
                                >
                                  no avalibility for this hotels
                                </p>
                              )}

                            <div className="col-6 m-0" style={{ width: "48%" }}>
                              <h6
                                style={{ fontSize: 11, color: "gray" }}
                                className="m-0 ellipsis-1-lines text-start"
                              >
                                Check In
                              </h6>
                              <CustomDatePicker
                                className="form-control py-2"
                                clearIcon={false}
                                disabled={
                                  procategory === "hotelAhs"
                                    ? new Date(bookingAvalibileDates.enddate) <=
                                    new Date()
                                    : false
                                }
                                // disabled={
                                //   new Date(bookingAvalibileDates.enddate) >
                                //   new Date()
                                //     ? false
                                //     : true
                                // }
                                onChange={handleCheckinDate}
                                format="dd-MM-y"
                                minDate={procategory === "hotelAhs" ? minDateValidation : today}
                                // minDate={procategory === "hotelAhs"? minDateValidation : moment(new Date()).add(7, "days").toDate()}
                                // minDate={today}
                                value={checkIncheckOut.checkIn}
                                maxDate={
                                  procategory === "hotelAhs"
                                    ? new Date(bookingAvalibileDates.enddate)
                                    : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                                }
                              />
                            </div>

                            <div className="col-6 m-0" style={{ width: "48%" }}>
                              <h6
                                style={{ fontSize: 11, color: "gray" }}
                                className="m-0 ellipsis-1-lines text-start"
                              >
                                Check Out
                              </h6>
                             <CustomDatePicker
  disabled={
    procategory === "hotelAhs"
      ? new Date(bookingAvalibileDates.enddate) <= new Date()
      : false
  }
  className="form-control py-2"
  clearIcon={false}
  value={checkIncheckOut.checkOut}
  onChange={handleCheckOutDate}
  format="dd-MM-y"
  minDate={
    checkIncheckOut.checkIn
      ? moment(checkIncheckOut.checkIn).add(1, "day").toDate()
      : moment(minDateValidation).add(1, "day").toDate()
  }
  maxDate={
    procategory === "hotelAhs"
      ? new Date(bookingAvalibileDates.enddate)
      : moment().add(1, "year").toDate()
  }
  activeStartDate={
    checkIncheckOut.checkIn 
      ? moment(checkIncheckOut.checkIn).toDate() 
      : null
  }
/>
                              
                            </div>
                            {procategory === "hotelTbo" ? (
                              // <Select options={tboMealOptions} />
                              <div
                                className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                style={{ width: "48%" }}
                              >
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start"
                                >
                                  Choose your Meal plan
                                </h6>
                                <Select
                                  options={tboMealOptions}
                                  defaultValue={
                                    viewStatus === "update"
                                      ? tboMealOptions.find(
                                        (data) => data.value === mealType
                                      ) || null
                                      : null
                                  }
                                  // value={viewStatus === "update" ? tboMealOptions.find(data => data.value === mealType) || null : null}
                                  onChange={handleMealPlan}
                                />
                              </div>
                            ) : procategory === "hotelTboH" ? (
                              // <Select options={tboMealOptions} />
                              <div
                                className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                style={{ width: "48%" }}
                              >
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start"
                                >
                                  Choose your Meal plan
                                </h6>
                                <Select
                                  options={tboMealOptions}
                                  // value={tboMealOptions.find(data => data.value === mealType) || null}
                                  defaultValue={
                                    viewStatus === "update"
                                      ? tboMealOptions.find(
                                        (data) => data.value === mealType
                                      ) || null
                                      : null
                                  }
                                  onChange={handleMealPlan}
                                  placeholder="Select meal plan"
                                />
                              </div>
                            ) : procategory === "ratehawk" ? (
                              // <Select options={tboMealOptions} />
                              <div
                                className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                style={{ width: "48%" }}
                              >
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start"
                                >
                                  Choose your Meal plan
                                </h6>
                                <Select
                                  options={tboMealOptions}
                                  // value={tboMealOptions.find(data => data.value === mealType) || null}
                                  defaultValue={
                                    viewStatus === "update"
                                      ? tboMealOptions.find(
                                        (data) => data.value === mealType
                                      ) || null
                                      : null
                                  }
                                  onChange={handleMealPlan}
                                />
                              </div>
                            ) : procategory === "ratehawk" ? (
                              // <Select options={tboMealOptions} />
                              <div
                                className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                style={{ width: "48%" }}
                              >
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start"
                                >
                                  Choose your Meal plan
                                </h6>
                                <Select
                                  options={tboMealOptions}
                                  onChange={handleMealPlan}
                                />
                              </div>
                            ) : (
                              <>
                                <div
                                  className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                  style={{ width: "48%" }}
                                >
                                  <h6
                                    style={{ fontSize: 11, color: "gray" }}
                                    className="m-0 ellipsis-1-lines text-start"
                                  >
                                    Choose your room categories
                                  </h6>
                                  <Select
                                    options={hotelRoomCategories}
                                    onChange={handleRoomCategories}
                                    defaultValue={"Select Room Category"}
                                    // value={ selectedRoomCategories === ""? "Select Room Category": hotelRoomCategories.find(
                                    //   (hotelRoomCategories) =>
                                    //     hotelRoomCategories.value ===
                                    //     selectedRoomCategories
                                    // )}
                                    value={
                                      hotelRoomCategories.find(
                                        (data) =>
                                          data.value === selectRoomCategory
                                      ) || null
                                    }
                                  />
                                </div>

                                <div
                                  className="col-6 m-0 product-variant-head d-flex flex-column justify-content-start"
                                  style={{ width: "48%" }}
                                >
                                  <h6
                                    style={{ fontSize: 11, color: "gray" }}
                                    className="m-0 ellipsis-1-lines text-start"
                                  >
                                    Choose your Meal plan
                                  </h6>
                                  <div
                                    className="d-flex form-control"
                                    onClick={handleMealPlanModal}
                                    style={{
                                      fontSize: "12px",
                                      padding: "13px 10px",
                                    }}
                                  >
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        color: "black",
                                        marginRight: "10px",
                                      }}
                                    >
                                      {/* {dateMeal.length === 0 ? "Select Meal Plan" : [
                                        ...new Set(Object.values(dateMeal)),
                                      ].join(", ")} */}
                                      { }
                                      {/* {`BB: ${mealTypeCount.BB || 0}, HB: ${mealTypeCount.HB || 0}, FB: ${mealTypeCount.FB || 0}, RO: ${mealTypeCount.RO || 0}`} */}
                                      {(() => {
                                        const parts = [
                                          mealTypeCount.BB ? `BB: ${mealTypeCount.BB}` : null,
                                          mealTypeCount.HB ? `HB: ${mealTypeCount.HB}` : null,
                                          mealTypeCount.FB ? `FB: ${mealTypeCount.FB}` : null,
                                          mealTypeCount.RO ? `RO: ${mealTypeCount.RO}` : null,
                                        ].filter(Boolean);

                                        return parts.length > 0 ? parts.join(", ") : "Select Meal Plan";
                                      })()}
                                      {/* {selectedMealType
                                        ? "Select Meal Plan"
                                        : [
                                          ...new Set(Object.values(dateMeal)),
                                        ].join(", ")} */}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}
                            <div className="col-12 hotel-input-width m-0 col-lg-6">
                              <h6
                                style={{ fontSize: 11, color: "gray" }}
                                className="m-0 ellipsis-1-lines text-start"
                              >
                                Adults & Children
                              </h6>
                              <button
                                onClick={() => setshowCountBox(true)}
                                className="form-control pl-3"
                                style={{
                                  textAlign: "left",
                                  fontSize: "12px",
                                  padding: "10px",
                                }}
                              >
                                Adults x {customerDetails.adultCount}
                                {"  |  "}Children x {customerDetails.childCount}
                              </button>
                            </div>
                            <div className="col-12 m-0 d-flex justify-content-between flex-wrap">
  {["Single", "Double", "Triple", "Quad"].map((type) => (
    <div
      key={type}
      className="col-3 d-flex flex-column align-items-start mb-2"
      style={{ width: "23%" }}
    >
      <h6
        style={{ fontSize: 11, color: "gray" }}
        className="m-0 ellipsis-1-lines text-start"
      >
        {type}
        <span className="required-asterik">*</span>
      </h6>

      <div className="d-flex align-items-center mt-1">
        <button
          className="btn btn-light border"
          style={{
            width: "30px",
            height: "30px",
            lineHeight: "15px",
            fontSize: "18px",
            padding: "0",
          }}
          onClick={() =>
            handleOnChangeRoom(type, {
              target: { value: Math.max(0, moreDetails[type] - 1) },
            })
          }
        >
          –
        </button>

        <input
          className="form-control text-center mx-1"
          type="number"
          readOnly
          value={moreDetails[type]}
          style={{
            fontSize: "12px",
            width: "60px",
            height: "30px",
            padding: "0",
          }}
        />

        <button
          className="btn btn-light border"
          style={{
            width: "30px",
            height: "30px",
            lineHeight: "15px",
            fontSize: "18px",
            padding: "0",
          }}
          onClick={() =>
            handleOnChangeRoom(type, {
              target: { value: moreDetails[type] + 1 },
            })
          }
        >
          +
        </button>
      </div>
    </div>
  ))}
</div>

                            <div className="col-12 hotel-input-width m-0 col-lg-6">
                              <div className="d-flex m-0 p-0 justify-content-between">
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start"
                                >
                                  Room allocation
                                  <span className="required-asterik">*</span>
                                </h6>
                                <h6
                                  style={{ fontSize: 11, color: "gray" }}
                                  className="m-0 ellipsis-1-lines text-start px-2 pe-0"
                                  onClick={() =>
                                    setHandleRoomAllocationInfo(true)
                                  }
                                ></h6>
                              </div>
                              {roomAllocationData.length > 0 ? (
                                <button
                                  onClick={handleRoomAllocationOnClick}
                                  id="roomallocationbutton"
                                  className="form-control"
                                  style={{
                                    textAlign: "left",
                                    fontSize: "12px",
                                    padding: "10px",
                                    borderColor: "#63b075",
                                  }}
                                >
                                  Update Room Allocation
                                </button>
                              ) : (
                                <button
                                  onClick={handleRoomAllocationOnClick}
                                  id="roomallocationbutton"
                                  className="form-control"
                                  style={{
                                    textAlign: "left",
                                    fontSize: "12px",
                                    padding: "10px",
                                  }}
                                >
                                  Allocate Guests
                                </button>
                              )}
                            </div>
                            {procategory === "ratehawk" && (
                              <div className="col-12 m-0 d-flex justify-content-between">
                                <div
                                  className="col-12 d-flex flex-column align-items-start"
                                  style={{ width: "23%" }}
                                >
                                  <Button onClick={() => handleMoreInfo()}>View Info</Button>
                                </div>
                              </div>)}

                            {/* {procategory === "ratehawk" && (
                              <div className="col-12 m-0 d-flex justify-content-between">
                                <div
                                  className="col-12 d-flex flex-column align-items-start"
                                  style={{ width: "23%" }}
                                >
                                  <Button onClick={() => handleMoreInfo()}>
                                    View Info
                                  </Button>
                                </div>
                              </div>
                            )} */}

                            {roomPackageStatus ? (
                              <>
                                <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">
                                  {procategory === "hotelAhs" ? (
                                    <>
                                      {getDiscountByRate(
                                        roomPackageTemp?.RateIDs
                                      ) ? (
                                        <>
                                          <h4 className="m-0 p-0">
                                            {CurrencyConverter(
                                              roomPackageTemp.Price
                                                .CurrencyCode,
                                              getDiscountProductBaseByPrice(
                                                roomPackageTemp.Price
                                                  .PublishedPrice,
                                                getDiscountByRate(
                                                  roomPackageTemp?.RateIDs
                                                ),
                                                baseCurrencyValue
                                              )["discountedAmount"],
                                              baseCurrencyValue
                                            )}
                                          </h4>
                                          <h4
                                            style={{
                                              textDecoration: "line-through",
                                            }}
                                            className="m-0 p-0"
                                          >
                                            {CurrencyConverter(
                                              roomPackageTemp.Price
                                                .CurrencyCode,
                                              roomPackageTemp.Price
                                                .PublishedPrice,
                                              baseCurrencyValue
                                            )}
                                          </h4>
                                        </>
                                      ) : (
                                        <h4
                                          style={
                                            {
                                              // textDecoration: "line-through",
                                            }
                                          }
                                          className="m-0 p-0"
                                        >
                                          {CurrencyConverter(
                                            roomPackageTemp.Price.CurrencyCode,
                                            roomPackageTemp.Price
                                              .PublishedPrice,
                                            baseCurrencyValue
                                          )}
                                        </h4>
                                      )}

                                      {/* <h4
                                        style={{
                                          textDecoration: "line-through",
                                        }}
                                        className="m-0 p-0"
                                      >
                                        {CurrencyConverter(
                                          roomPackageTemp.Price.CurrencyCode,
                                          roomPackageTemp.Price.PublishedPrice,
                                          baseCurrencyValue
                                        )}
                                      </h4> */}
                                    </>
                                  ) : (
                                    <h4 className="m-0 p-0">
                                      {CurrencyConverter(
                                        roomPackageTemp.Price.CurrencyCode,
                                        roomPackageTemp.Price.PublishedPrice,
                                        baseCurrencyValue
                                      )}
                                    </h4>
                                  )}

                                  <div className="d-flex align-items-center">
                                    <a
                                      onClick={handleCheckAvalibility}
                                      className="btn-change-package m-0 mb-2 p-0"
                                    >
                                      Change Package
                                    </a>
                                    <span className="m-0 p-0 mb-2 mx-2">/</span>
                                    <a
                                      onClick={handleMoreDetailsOpen}
                                      className="btn-change-package mb-2"
                                    >
                                      Know more about packages
                                    </a>
                                  </div>
                                </div>

                                <div className="d-flex flex-row align-items-center col-12 gap-3 justify-content-end">
                                  <Button
                                    className="btn btn-sm btn-solid"
                                    style={{
                                      fontSize: 12,
                                      padding: "10px 15px",
                                      borderRadius: "4px",
                                    }}
                                    onClick={handleTravelBuddiesModal}
                                  >
                                    {buddyData.length > 0 ? 'Edit travel buddies' : 'Add travel buddies'}
                                  </Button>
                                 

                                  {cartStatus.status === "CartUpdate" ? (
                                    <Button
                                      className="btn btn-sm btn-solid"
                                      style={{
                                        fontSize: 12,
                                        padding: "10px 15px",
                                        borderRadius: "4px",
                                      }}
                                      onClick={handlePassData}
                                    >
                                      Update Cart
                                    </Button>
                                  ) : (
                                    <Button
                                      className="btn btn-sm btn-solid"
                                      style={{
                                        fontSize: 12,
                                        padding: "10px 15px",
                                        borderRadius: "4px",
                                      }}
                                      onClick={handlePassData}
                                    >
                                      Add to Cart
                                    </Button>
                                  )}
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
                              </>
                            ) : (
                              <Col className="d-flex flex-column align-items-end mt-auto">
                                <div
                                  className="d-flex gap-2"
                                  style={{ marginTop: "60px" }}
                                >
                                  <button
                                    className="btn btn-sm btn-solid"
                                    style={{
                                      fontSize: 12,
                                      padding: "10px 15px",
                                      borderRadius: "4px",
                                    }}
                                    // disabled={
                                    //   new Date(bookingAvalibileDates.enddate) >
                                    //   new Date()
                                    //     ? false
                                    //     : true
                                    // }
                                    disabled={
                                      procategory === "hotelAhs" &&
                                      new Date(bookingAvalibileDates.enddate) <=
                                      new Date()
                                    }
                                    onClick={handleCheckAvalibility}
                                  >
                                    {loading
                                      ? "Checking"
                                      : "Check availability"}
                                    {/* {console.log("loading 1233333", dateMeal)} */}
                                  </button>

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
                              </Col>
                            )}
                          </div>
                        </Col>
                      </Row>
                    ) : null}

                    {!serverIssue && !hotelDetailsLoading && (
                      <ProductTab
                        height="310px"
                        showDesc={true}
                        name={hotelDetails?.hotelData?.hotelName}
                        desc={hotelDetails?.hotelData?.hotelDescription}
                        showReviews={false}
                        reviews={reviews}
                      />
                    )}
                  </Container>
                </Col>
              </Row>
            )}
          </Container>
        </div>

        <ModalBase
          isOpen={modelInfoShow}
          toggle={() => setModelInfoShow(false)}
          title="More Information"
          size="md"
        >
          <HotelInfoContent moreInfo={moreInfoData} />
        </ModalBase>

        <ModalBase
          isOpen={handleRoomAllocationInfo}
          title={"Information about room allocation"}
          toggle={() => {
            setHandleRoomAllocationInfo(false);
          }}
          size="lg"
        >
          <div className="d-flex flex-column align-items-start justify-content-center">
            <h5 className="text-start">Single Room Allocation:</h5>
            <ol>
              <li>1 Adult: 1 Single Room</li>
              <li>1 Adult + 1 Child without Bed (CNB): 1 Single Room</li>
            </ol>
            <h5 className="text-start">Double Room Allocation:</h5>
            <ol>
              <li>1 Adult + 1 Child with Bed (CWB): 1 Double Room</li>
              <li>1 Adult + 2 Children with Bed (CWB): 1 Double Room</li>
              <li>1 Adult + 2 Children without Bed (CNB): 1 Double Room</li>
              <li>2 Adults + 1 Child with Bed (CWB): 1 Double Room</li>
              <li>2 Adults + 1 Child without Bed (CNB): 1 Double Room</li>
              <li>2 Adults: 1 Double Room</li>
            </ol>
            <h5 className="text-start">Triple Room Allocation:</h5>
            <ol>
              <li>2 Adults + 2 Children with Bed (CWB): 1 Triple Room</li>
              <li>3 Adults: 1 Triple Room</li>
              <li>3 Adults + 1 Child without Bed (CNB): 1 Triple Room</li>
            </ol>
          </div>
        </ModalBase>

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
            adultCount={parseInt(customerDetails.adultCount)}
            childCount={parseInt(customerDetails.childCount)}
            childAgesDynamic={customerDetails.childAges}
            adultChildMinMax={adultChildMinMax}
            addPaxPaxIncrement={handleValidateAdultChildCount}
            paxLimitations={paxLimitations}
          ></PaxIncrementorComponent>
        </ModalBase>

        {/* {shouldShowMealPlanModal() && ( */}
        <ModalBase
          isOpen={mealPlanModal}
          toggle={() => {
            setMealPlanModal(false)
            setSelectedMealType(false)
            setTempDateMeal({}) // Clear temp data when modal is closed without saving
          }}
          title={"Select your meal plan"}
          extraMargin={false}
        >
          <div className="d-flex flex-column align-items-center w-100"
          // style={{
          //       position: "relative",
          //       height: "calc(100vh - 200px)",
          //       overflowX: "hidden",
          //       overflowY: "auto",
          //   }}
          >
            {/* Master Selection Section */}
            {
              checkIncheckOut.betweenDays.length > 1 && (
                <div className="d-flex align-items-center justify-content-center py-3 col-12 border-bottom mb-3" >
                  <p className="m-0 p-0 col-4 font-weight-bold">
                    Click Here to select one meal plan for all dates:
                  </p>
                  <div className="d-flex align-items-center gap-3 col-4">
                    {mealTypes.map((value) => (
                      <div key={value} className="d-flex gap-1">
                        <input
                          type="radio"
                          name="masterMealSelection"
                          value={value}
                          onChange={() => handleMasterMealSelect(value)}
                        />
                        <label htmlFor="" className="mr-4">
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }


            {/* Individual Date Selection */}
            {checkIncheckOut.betweenDays.map((date, key) => (
              <div
                key={key}
                className="d-flex align-items-center justify-content-center py-3 col-12"
              >
                <p className="m-0 p-0 col-4">{date}</p>
                <div className="d-flex align-items-center gap-3 col-4">
                  {mealTypes.map((value) => (
                    <div key={value} className="d-flex gap-1">
                      <input
                        type="radio"
                        name={`meal-${date}`}
                        value={value}
                        checked={(tempDateMeal && tempDateMeal[date] === value) || 
                                (!tempDateMeal[date] && dateMeal[date] === value)}
                        onChange={() => handleMealSelect(value, date)}
                      />
                      <label htmlFor="" className="mr-4">
                        {value}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              className="btn btn-sm btn-solid"
              onClick={() => {
                // Validate if meal plan is selected
                const hasExistingMealPlan = Object.keys(dateMeal).length > 0;
                const hasTempMealPlan = Object.keys(tempDateMeal).length > 0;
                
                // Check if user has selected meal plans for all dates
                const totalDates = checkIncheckOut.betweenDays.length;
                const selectedMealDates = hasTempMealPlan ? Object.keys(tempDateMeal).length : Object.keys(dateMeal).length;
                
                if (!hasExistingMealPlan && !hasTempMealPlan) {
                  ToastMessage({
                    status: "warning",
                    message: "Please select a meal plan before saving."
                  });
                  return;
                }
                
                if (hasTempMealPlan && selectedMealDates < totalDates) {
                  ToastMessage({
                    status: "warning",
                    message: "Please select meal plans for all dates before saving."
                  });
                  return;
                }
                
                // Apply the temporary meal plan to the actual state
                if (Object.keys(tempDateMeal).length > 0) {
                  // Update the actual meal plan state with the temporary one
                  setDateMeal(tempDateMeal);
                  
                  // Count occurrences of each meal type for analytics
                  const counts = { BB: 0, HB: 0, FB: 0, RO: 0 };
                  Object.values(tempDateMeal).forEach(meal => {
                    if (counts[meal] !== undefined) {
                      counts[meal]++;
                    }
                  });
                  setMealTypeCount(counts);
                  
                  // Update room package settings as needed
                  setRoomPackageTemp([]);
                  setRoomPackageStatus(false);
                }
                
                // Close the modal after saving
                setMealPlanModal(false);
                setSelectedMealType(false);
                setTempDateMeal({});
              }}
            >
              Save meal plan
            </button>
          </div>
        </ModalBase>
        {/* )} */}

        <ModalBase
          isOpen={roomAllocationModal}
          title={"Room Allocation"}
          toggle={() => setroomAllocationModal(false)}
          size="lg"
        >
          <HotelRoomAllocation
            adultcount={customerDetails.adultCount}
            childcount={customerDetails.childCount}
            allocationData={moreDetails}
            handleSubmmitRoomAllocation={hotelRoomAllocationSuccess}
            roomAllocationData={roomAllocationData}
            dataPost={{
              pId: PID,
              checkInd: checkIncheckOut?.checkIn,
              provider: procategory,
            }}
          ></HotelRoomAllocation>
        </ModalBase>

        <ModalBase
          isOpen={conditionnModal}
          title={"Room Details"}
          toggle={() => setConditionModal(false)}
          size="lg"
        >
          <TBOHotelConditions
            preBookData={preBookData}
            manageConditionDetail={handleTravelBuddyInTBO}
          ></TBOHotelConditions>
        </ModalBase>

        <ModalBase
          isOpen={hotelRoomPackageModal}
          toggle={() => setHotelRoomPackageModal(false)}
          title={"Select Your Room Package"}
          size="lg"
        >
          <RoomPackageSelector
            dataSet={hotelsData?.rooms}
            currency={baseCurrencyValue}
            onRoomSelect={handleRoomSelect}
            discountValue={discountValue}
            discountClaimed={discountClaimed}
            providers={procategory}
          ></RoomPackageSelector>
        </ModalBase>

        <ModalBase
          isOpen={buddyModal}
          toggle={() => setBuddyModal(false)}
          title="Choose Your Buddies"
          size="md"
        >
          <BuddyModal
            adultCount={customerDetails.adultCount}
            childCount={customerDetails.childCount}
            childAges={customerDetails.childAges}
            adultDetails={adultDetails}
            childsDetails={childsDetails}
            handleTravelBuddies={handleTravelBuddies}
            provider={procategory}
            preBookData={preBookData}
            selectPassengerType={selectPassengerType}
          ></BuddyModal>
        </ModalBase>

        <ModalBase
          isOpen={cartModal}
          toggle={() => setCartModal(false)}
          title="Select Your Cart"
          size="md"
        >
          <CartContainer
            productData={cartData}
            cartCategory={"Hotel"}
            preId={preId || null}
            pageState={viewStatus === "update" ? "CartEdit" : null}
            handlePassData={handleBookHotel}
          />
        </ModalBase>

        <ModalBase
          isOpen={modelInfoShow}
          toggle={() => setModelInfoShow(false)}
          title="More Information"
          size="md"
        >
          <HotelInfoContent moreInfo={moreInfoData} />

        </ModalBase>

        <ModalBase
          isOpen={packageMoreDetails}
          toggle={handleMoreDetailsClose}
          title={"More details about package"}
          size="x"
        >
          <div>
            <h6>
              {console.log("roomPackageTemp", roomPackageTemp)}
              Room name :{" "}


              {roomPackageTemp?.Provider === ("hotelTboH" || "hotelTbo")
                ? roomPackageTemp?.RoomTypeName?.[0]
                : roomPackageTemp?.RoomTypeName}
            </h6>
            {roomPackageTemp?.Provider != "hotelTboH" ||
              "hotelTbo" ||
              ("ratehawk" && (
                <p>
                  Cancellation policy : {roomPackageTemp?.CancellationPolicy}
                </p>
              ))}
            {roomPackageTemp?.Provider != "hotelTboH" &&
              roomPackageTemp?.Provider != "hotelTbo" &&
              roomPackageTemp?.Provider != "ratehawk" && (
                <p>
                  Cancellation policy: {roomPackageTemp?.CancellationPolicy}
                </p>
              )}
            <p>
              Price -{" "}
              {roomPackageTemp?.Provider === "hotelTboH" ||
                "hotelTbo" ||
                "ratehawk"
                ? CurrencyConverter(
                  roomPackageTemp?.Price?.CurrencyCode,
                  roomPackageTemp?.Price?.PublishedPrice,
                  baseCurrencyValue
                )
                : CurrencyConverter(
                  roomPackageTemp?.Price?.CurrencyCode,
                  roomPackageTemp?.Price?.PublishedPrice,
                  baseCurrencyValue
                )}
            </p>
          </div>
        </ModalBase>
      </CommonLayout>
    </>
  );
};

export default HotelProductView;
