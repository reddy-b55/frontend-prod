import moment from "moment";
import Head from "next/head";
import Slider from "react-slick";
import Select from 'react-select';
import { parseISO } from "date-fns";
import { useRouter } from "next/router";
import DatePicker from 'react-date-picker';
import { addDoc, collection } from "firebase/firestore";
import React, { useState, useEffect, useContext, use } from "react";
import { Container, Row, Col, Media, Button } from "reactstrap";

import { AppContext } from "../../../_app";
import { db } from "../../../../firebase";

import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import LifeStylePricing from "../../../../GlobalFunctions/Lifestylefunctions/LifeStylePricing";
import { getDistanceFromLatLon, gettimeDifference, generateSlug } from "../../../../GlobalFunctions/OthersGlobalfunctions";

import { checkAvalibilityandRates, getLifestyleproductDetails } from "../../../../AxiosCalls/LifestyleServices/lifestyleServices";
import { getGlobalProductsDetails, getGlobalTixProductTickets, getGlobalTixTickets } from "../../../../AxiosCalls/LifestyleServices/globaltixService";

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
import timeView from '../../../../public/assets/images/sidebar-svg-files/icons8-clock.svg';
import getDiscountProductBaseByPrice from "../../common/GetDiscountProductBaseByPrice"

import ProductSkeleton from "../../../skeleton/productSkeleton";

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Image from "next/image";
import TicketPicker from "./ModelTicketPicker";
import CurrencyConverterOnlyRate from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRate";
import CartCurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CartCurrencyConverter";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LazyLoadImage } from "react-lazy-load-image-component";

export async function getServerSideProps(context) {

  const id = context.query.pID;
  const name = context.query.name;

  let response = []
  await getGlobalProductsDetails(id).then((res) => {
    if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
      return {
        redirect: {
          destination: '/shop/lifestyle',
          permanent: false,
        },
      };
    } else {
      console.log("res is globalTixxxxxxxxxxx", res)
      response = res
    }
  });


  let reviews = []
  //   await getProductReiews(3, id).then((res) => {
  //     if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
  //       reviews = []
  //     } else {
  //       reviews = res
  //     }
  //   });

  const productUrl = `https://www.aahaas.com/product-details/lifestyle/v4${name}?pID=${id}`;

  if (id === '' || id === undefined || id === null || name === '' || name === undefined || name === null) {
    return {
      redirect: {
        destination: '/shop/lifestyle',
        permanent: false,
      },
    };
  }

  const dataset = {
    productData: response,
    productReviews: reviews,
    productId: id,
    canonicalURL: productUrl,
  }

  return {
    props: {
      dataset
    },
  };

}

const LifestyleProdcutView = ({ dataset, pathId = dataset?.productId, canonicalURL = dataset?.canonicalURL }) => {

  const router = useRouter();
  const adultcount = router.query.lifeStyle_adult_count;
  const childcount = router.query.lifestyle_children_count;
  const image = router.query?.productImage;


    const viewStatus = router.query.viewStatus;
    const preId = router.query?.preId;
    console.log("Data set product is", viewStatus, preId)

  // console.log("router?.query?.viewStatus", )
  const PID = dataset?.productId;
  const { userStatus, baseUserId, baseCurrencyValue, baseLocation } = useContext(AppContext);

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
    adultCount: selectedPackage?.selectedQuantity ? selectedPackage?.selectedQuantity : 1,
  });
  const [availabilityCheck, setAvailabilityCheck] = useState(false);


  //hirusha
  const [paxLimitations, setPaxLimitation] = useState([])
  const [maxChildAdultCounts, setMaxChildAdultCounts] = useState({
    AdultMax: 0,
    ChildMax: 0,
  });

  const categoryStar = [
    { value: 0, label: '' },
    { value: 1, label: '⭐' },
    { value: 2, label: '⭐⭐' },
    { value: 3, label: '⭐⭐⭐' },
    { value: 4, label: '⭐⭐⭐⭐' },
    { value: 5, label: '⭐⭐⭐⭐⭐' }
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
    minAdult: '',
    maxAdult: '',
    minChild: '',
    maxChild: '',
    adultAvl: false,
    childAvl: false
  });

  const [latitudelongtitude, setlatitudelongtitude] = useState({
    latitude: '',
    longitude: ''
  })

  const [handlePopupStatus, setHandlePopupStatus] = useState({
    avalibilityChecking: false,
    customerDetails: false,
    addToCart: false,
  })

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
    date: '',
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
    maxAdultOccupancy: '',
    maxChildOccupancy: '',
  });

  const [timeSlots, setTimeSlots] = useState('');

  const [cartStatus, setCartStatus] = useState({
    status: 'new',
    preId: 1,
    cartId: null
  });

  const [categories, setCategories] = useState({
    category1: "",
    category2: "",
    category3: "",
    latitude: '',
    longitude: '',
    vendor_id: '',
    vandorName: '',
    sliderCount: ''
  });

  const [discountsMetaVal, setDiscountMetaVal] = useState([]);

  const handleDiscountOnClaim = (id) => {
    if (id) {
      setDiscountClaimed(true)
    }
    setDiscountMetaVal(id)
  }

  const handlePackageRate = (data) => {
    setPackageRate(data);
    setPackageStatus(true);
    if (userStatus.userLoggesIn) {
      // ToastMessage({ status: "success", message: "Package update successfully", autoClose: '1000' });
      setHandlePopupStatus({
        avalibilityChecking: false,
        customerDetails: true,
        addToCart: false,
      })
    } else {
      router.push("/page/account/login-auth");
      localStorage.setItem("lastPath", router.asPath)
      ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
    }
  };

  const handleTravelBuddies = (value) => {

    let adults = value.filter((res) => { return res.PaxType == "1" })
    let childs = value.filter((res) => { return res.PaxType == "2" })


    setAdultDetails(adults);
    setChildDetails(childs);
    setCustomerData({
      ...customerData,
      adultCount: adults.length,
      childCount: childs.length,
    })
    settravelBuddiesStatus(true);
    handleCloseAllPopup();

  }

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
      console.log("dataD issss 1233333", adultDetails)

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

      // let dataD = {
      //   product_id: bookingDetails.life_style_id,
      //   customerData: adultDetails,
      //   user_id: baseUserId.cxid,
      //   cart_id: cartStatus.cartId,
      //   provider: "globaltix",
      //   tickets: customerDetails?.tickets.tickets || [],
      //   preferredDate: bookingDetails.bookingDate
      // }
       let dataD = {}

    
      if(viewStatus === 'update') {
        dataD = {
        product_id: bookingDetails.life_style_id,
        customerData: adultDetails,
        user_id: baseUserId.cxid,
        cart_id: router?.query?.selectedCart_id,
        pre_id: router?.query?.preId,
        provider: "globaltix",
        pageState: "CartEdit",
        tickets: customerDetails?.tickets.tickets || [],
        preferredDate: bookingDetails.bookingDate
      }
      }else{
        dataD = {
        product_id: bookingDetails.life_style_id,
        customerData: adultDetails,
        user_id: baseUserId.cxid,
        cart_id: cartStatus.cartId,
        provider: "globaltix",
        tickets: customerDetails?.tickets.tickets || [],
        preferredDate: bookingDetails.bookingDate
      }
      }

      
      if (userStatus.userLoggesIn) {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: false,
          addToCart: true
        })
        console.log("dataD", dataD)
        setCartData(dataD)
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath)
        ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
      }

    } else {
      if (!packageStatus) {
        ToastMessage({ status: "warning", message: "kindly choose the package" })
      }
      if (!travelBuddiesStatus) {
        ToastMessage({ status: "warning", message: "kindly choose the travel buddies" })
      }
    }

  };

  const handlePassData = (value) => {
    console.log("value isssssssssssss 12333", value)
    if (value === 'await') {
      ToastMessage({ status: "loading", message: 'Product addig into a cart click here to undo', autoClose: 5000 });
      handleCloseAllPopup();
    } else {
      if (value == 'existing') {
        ToastMessage({ status: "warning", message: "Product already in cart" })
        handleCloseAllPopup();
      } else if (value) {
        // router.push('/page/account/cart-page');
        router.push('/shop/lifestyle');
      } else {
        ToastMessage({ status: "warning", message: "failed to add the product, please try again later.." })
        handleCloseAllPopup();
      }
    }
  };

  const handleTravelBuddiesModal = () => {
    setHandlePopupStatus({
      avalibilityChecking: false,
      customerDetails: true,
      addToCart: false,
    })
  }

  const handleCloseAllPopup = () => {
    setHandlePopupStatus({
      avalibilityChecking: false,
      customerDetails: false,
      addToCart: false,
    })
  }


  const loadProductData = async () => {

    await removeExistingValues();
    setLoading(true);

    const response = dataset.productData;

    if (response.success === true) {

      let lifeStyleInventoryRates = response?.lifeStyleInventoryRates;

      if (generateSlug(response.data.name) !== router.query.name) {
        window.location.assign(`/product-details/lifestyle/${generateSlug(response.data.name)}?pID=${router.query.pID}`)
      }

      //   let date = moment().add(lifeStyleInventoryRates[0].book_by_days, 'days').format('YYYY-MM-DD');
      //   setMinDate(date);

      //hirusha
      //   setPaxLimitation(response.availablePaxTypes)

      //   setPackageDetails(response.packages[0])

      setLifeStyleData(response.data)
      setPricing(response.data)

      setInventoryRates(lifeStyleInventoryRates)
      setDiscounts(response?.discountPackage)

      let lifestyleinventory = response.lifeStyleInventory;
      setLifeStyleInventory(lifestyleinventory);

      //   let lifestyleavailableDates = response.inventoryDates.map(date => parseISO(date));
      //   setAvailableDates(lifestyleavailableDates);

      //   const pickupLocations = response.servicePoints.map((value) => ({
      //     value: value.pickup_location,
      //     label: value.pickup_location
      //   }));

      //   setPickupLocations(pickupLocations);

      let prod_dataset = response.data

      setCategories({
        ...categories,
        category1: prod_dataset?.category1,
        category2: prod_dataset?.category2,
        category3: prod_dataset?.category3,
        latitude: response.data?.latitude,
        longitude: response.data?.longitude,
        vendor_id: prod_dataset?.vendor_id,
        sliderCount: '4'
      });

      setlatitudelongtitude({
        latitude: response.data?.latitude,
        longitude: response.data?.longitude
      })

      // product reviews
      setReviews(dataset.productReviews);
      setLoading(false);

      //   updateInitialValue(lifestyleavailableDates, lifestyleinventory, pickupLocations, lifeStyleInventoryRates);

    } else {
      console.log("Something went wrong while fetching the product details");
      router.replace('/shop/lifestyle');
    }


  }

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

  //   const updateInitialValue = async (availableDates, inventory, pickupLocations, lifeStyleInventoryRates) => {
  //     // We still check for enabled dates, but don't automatically select them
  //     const today = moment().startOf('day');
  //     const enabledDates = availableDates.filter(value => moment(value).isSameOrAfter(today, 'day'));
  //     let updateStatus = router?.query?.viewStatus;
  //     console.log("updateStatus", updateStatus);

  //     // Only set the service location by default - not the date
  //     if (pickupLocations.length > 0) {
  //       setCustomerData({
  //         ...customerData,
  //         servicePoint: pickupLocations[0].value
  //       });
  //     }

  //     // Only set a date for special routing cases
  //     if (enabledDates.length > 0) {
  //       let formattedDate = moment(enabledDates?.[0]).format("YYYY-MM-DD");

  //       if (updateStatus === 'update') {
  //         setCartStatus({
  //           status: 'update',
  //           preId: router?.query?.preId,
  //           cartId: router?.query?.selectedCart_id
  //         });

  //         try {
  //           // For update, we do set the date from query
  //           await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, false, true, inventory, lifeStyleInventoryRates);
  //         } catch (error) {
  //           // Even in case of error, we don't want to set a default date
  //           // Just set the location
  //           console.error("Error handling update:", error);
  //         }
  //       } else if (updateStatus === 'checkavalibility') {
  //         try {
  //           // For checkavalibility, we do set the date from query
  //           await handleOnDataChange(router?.query?.service_date, router?.query?.service_location, lifeStyleInventoryRates);
  //         } catch (error) {
  //           // Even in case of error, we don't want to set a default date
  //           // Just set the location
  //           console.error("Error handling checkavalibility:", error);
  //         }
  //       }
  //       // Note: No else case that automatically sets a date
  //     }
  //   };


  const handleServicePoint = async (e) => {
    setCustomerData({
      ...customerData,
      pickup_location: e.value
    })
    setPackageRate([])
    setPackageStatus(false);
    await handleOnDataChange(customerData.date, e.value, true, false, lifeStyleInventory, inventoryRates)
  }

  const handleSerciceTimeSlot = (e) => {
    console.log("time slot", gettimeDifference(e.label))
    setTimeSlots(gettimeDifference(e.label));
    setCustomerData({
      ...customerData,
      time: e.label,
      inventoryID: e.value
    })
    setPackageRate([])
    setPackageStatus(false);
  }

  const handleOnDataChange = async (value) => {

    let result = moment(value).format("YYYY-MM-DD").toString();
    console.log("result", result)
    setCustomerDetails({
      ...customerDetails,
      date: result,
    })


      setCustomerData({
    ...customerData,
    date: result,
  });

  };

  // based on timeslots we are fetching rates 
  //   const getRatesAndDetails = async (id, inventoryDataPara, location, inventoryDataSelect, lifeStyleInventoryRates) => {

  //     let inventoryDataSet = inventoryDataPara.filter((data) => {
  //       return Number(data.lifestyle_inventory_id) === Number(id);
  //     });

  //     setlatitudelongtitude({
  //       latitude: inventoryDataSet[0]?.latitude,
  //       longitude: inventoryDataSet[0]?.longitude
  //     })

  //     if (inventoryDataSet.length > 0) {

  //       let rateID = inventoryDataSet[0]?.rate_id;
  //       let result = gettimeDifference(inventoryDataSet[0]?.pickup_time);

  //       setInventoryData(inventoryDataSelect);

  //       let adultAvl = true;
  //       let childAvl = true;

  //       if (packageDetails?.min_adult_occupancy === 0 && packageDetails?.max_adult_occupancy === 0) {
  //         adultAvl = false;
  //       }

  //       if (packageDetails?.min_child_occupancy === 0 && packageDetails?.max_child_occupancy === 0) {
  //         childAvl = false;
  //       }

  //       setAdultChildMinMax({ 
  //         minAdult: 20,
  //         maxAdult: 20,
  //         minChild: 20,
  //         maxChild: 20,
  //         adultAvl: adultAvl,
  //         childAvl: childAvl
  //       });

  //       setCustomerData({
  //         ...customerData,
  //         date: inventoryDataSet[0].inventory_date,
  //         selectedRateID: inventoryDataSet[0]?.rate_id,
  //         selectedTimeSlot: inventoryDataSet[0]?.pickup_time,
  //         betweenHours: result,
  //         inventoryID: inventoryDataSet[0]?.lifestyle_inventory_id,
  //         adultCount: adultcount != null ? adultcount : adultAvl ? 1 : 0,
  //         // adultCount: adultAvl ? 1 : 0,
  //         childCount: childcount != null ? childcount :(!adultAvl && childAvl) ? 1 : 0,
  //         servicePoint: location,
  //         childAges: (!adultAvl && childAvl) ? { child0: 1 } : []
  //       });

  //       await getLifestyleRates(rateID, lifeStyleInventoryRates)

  //     }
  //   };
  //   useEffect(() => { 
  //     // getRatesAndDetails(inventoryData[0]?.lifestyle_inventory_id, inventoryData, location, inventoryDataSelect, lifeStyleInventoryRates)
  //   },[])

  //   const getLifestyleRates = async (rateID, lifeStyleInventoryRates) => {

  //     let rateData = lifeStyleInventoryRates.filter((rate) => {
  //       return "" + rate.lifestyle_rate_id === "" + rateID;
  //     });

  //     let discount = discounts.filter((discount) => {
  //       return "" + discount.rate_id === "" + rateID;
  //     });

  //     if (discount?.length > 0 && rateData?.length > 0) {
  //       var childRate = rateData?.[0]["child_rate"];
  //       var adultRate = rateData?.[0]["adult_rate"];
  //       var discountChild = 0.0;
  //       var discountAdult = 0.0;
  //       var discountType = discount?.[0]["discount_type"];
  //       var discountSymbol = "";
  //       if (discountType === "Amount") {
  //         discountChild = childRate - discount?.[0]["value"];
  //         discountAdult = adultRate - discount?.[0]["value"];
  //         discountSymbol = "$";
  //         setPricing({
  //           child_rate: childRate,
  //           adult_rate: adultRate,
  //           discount_availability: true,
  //           discount_type: "Amount",
  //           discount_amount: "",
  //           discount_symbol: "",
  //           discountable_child_rate: discountChild,
  //           discountable_adult_rate: discountAdult,
  //         });
  //       } else if (discountType === "%") {
  //         discountChild = childRate - childRate * (discount?.[0]["value"] / 100);
  //         discountAdult = adultRate - adultRate * (discount?.[0]["value"] / 100);
  //         discountSymbol = "%";
  //         setPricing({
  //           child_rate: childRate,
  //           adult_rate: adultRate,
  //           discount_availability: true,
  //           discount_type: "%",
  //           discount_amount: "",
  //           discount_symbol: "",
  //           discountable_child_rate: discountChild,
  //           discountable_adult_rate: discountAdult,
  //         });
  //       }
  //       setPricing(LifeStylePricing(rateData?.[0], discount?.[0], customerData.childCount, customerData.adultCount))
  //     } else {
  //       setPricing({
  //         ...pricing,
  //         child_rate: rateData?.[0]?.["child_rate"],
  //         adult_rate: rateData?.[0]?.["adult_rate"],
  //         discountable_adult_rate: 0.0,
  //         discountable_child_rate: 0.0,
  //         discount_availability: false,
  //         discount_amount: "",
  //         discount_type: "",
  //         discount_symbol: "",
  //       });
  //     }

  //     setSelectedLifestyleRates(rateData);
  //     setAvailableDiscount(discount?.[0]);

  //   }

  const [chatCreating, setChatCreating] = useState(false);

  const handleChatInitiate = async () => {
    setChatCreating(true);
    if (chatCreating) {
      ToastMessage({ status: "warning", message: "Already a chat has been initiated" })
    } else {
      if (userStatus.userLoggesIn) {
        // console.log(lifeStyleData,  "lifeStyleData")
        await addDoc(collection(db, "customer-chat-lists"), {
          status: 'Pending',
          createdAt: new Date(),
          supplierAdded: 'false',
          notifyAdmin: 'true',
          notifySupplier: 'false',
          notifyCustomer: 'false',
          supplier_name: '',
          customer_name: baseUserId.user_username,
          customer_mail_id: baseUserId.user_email,
          supplier_mail_id: '',
          customer_id: baseUserId.cxid,
          chat_related: 'Technical-support',
          customer_collection_id: baseUserId.cxid,
          chat_related_to: "Product",
          supplier_mail_id: "aahaas@gmail.com",
          group_chat: 'true',
          supplier_added_date: Date.now(),
          chat_category: 3,
          chat_related_id: 3,
          chat_avatar: lifeStyleData.images[0],
          supplier_id: null,
          chat_name: lifeStyleData.name,
          comments: { category: 3, product_id: lifeStyleData?.id },
          // comments: 'Product support - chat has been created from product details',
          updatedAt: new Date()
        }).then((response) => {
          setChatCreating(false);
          // router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
          const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
          window.open(chatUrl, "_blank");
        });
      } else {
        router.push("/page/account/login-auth");
        localStorage.setItem("lastPath", router.asPath)
        ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
      }
    }
  }

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
      date: '',
      selectedRateID: '',
      selectedTimeSlot: '',
      betweenHours: '',
      inventoryID: '',
      adultCount: 1,
      childCount: 0,
      maxAdultOccupancy: '',
      maxChildOccupancy: '',
      servicePoint: ''
    })

    setlatitudelongtitude({
      latitude: '',
      longitude: ''
    })

    setPricing({
      child_rate: '',
      adult_rate: '',
      discount_availability: true,
      discount_type: "",
      discount_amount: "",
      discount_symbol: "",
      discountable_child_rate: '',
      discountable_adult_rate: '',
    });

  }

  const handleValidateAdultChildCount = (value) => {
    setCustomerData({
      ...customerData,
      adultCount: value.adult,
      childCount: value.child,
      childAges: value.childAges
    });
    setPackageRate([]);
    setAdultDetails([]);
    setChildDetails([]);
    setPackageStatus(false);
  }

  const handleNavigateMap = () => {
    window.open(`https://www.google.com/maps/dir/${baseLocation.latitude}, ${baseLocation.longtitude} / ${latitudelongtitude?.latitude}, ${latitudelongtitude?.longitude}`, '_blank')
  }

  const openSubFilter = () => {
    setopenSideBarStatus(true);
  }

  const closeSubFilter = () => {
    setopenSideBarStatus(false);
  }

  const handleMoreDetailsOpen = () => {
    setPackageMoreDetails(true);
  }

  const handleMoreDetailsClose = () => {
    setPackageMoreDetails(false);
  }

  const isAvailable = (date) => { return availableDates.some(availableDate => isSameDay(parseISO(date), availableDate)); };

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
    setMaxChildAdultCounts(dataset.productData.maxAdultCountAndChildCount)
    console.log(maxChildAdultCounts);

  }, [dataset.productData])

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
    console.log("value", value)
    handleTicketPickerClick(value);
    setShowTicket(true)

  }

  const handleTicketModel = () => {
    setShowTicket(!showTicket)
  }

  const handleTicketPicker = (value) => {
    console.log("value", value)
  }

  const handleTicketPickerClick = async (ticket) => {
    console.log("ticket", ticket)
    const result = await getGlobalTixProductTickets(ticket);
    console.log("result isssssssssss", result)
    if (result) {
      setTicketData(result);

    }
    console.log("TicketPicker result", result);
  }

  const [ticketCount, setTicketCount] = useState(0);

  const [selectedTicket, setSelectedTicket] = useState({
    adultCount: 0,
    childCount: 0,
    totalTickets: 0,
  })
  const [currentComponentState, setCurrentComponentState] = useState()
  const handleOnPressContinueData = (dataVal, totalTicketCount, dataSet, currentComponentState) => {
    console.log(currentComponentState, "Data Value Issssssssssssssssssssssss", dataVal)
    setCurrentComponentState(currentComponentState)
    let adultCount = 0;
    let childCount = 0;
    let totalCount = 0;

    // Loop through tickets in dataVal
    dataVal.tickets.forEach(ticket => {
      const ticketId = ticket.id;
      const quantity = ticket.quantity;
      totalCount += quantity;

      // Find matching ticket in ticketData
      let ticketType = null;
      ticketData.data.forEach(item => {
        const foundTicket = item.ticketType.find(tt => tt.id === ticketId);
        if (foundTicket) {
          ticketType = foundTicket.name;
        }
      });

      // Categorize based on ticket type
      if (ticketType === 'CHILD') {
        childCount += quantity;
      } else {
        // All other types (ADULT or any other) count as adult
        adultCount += quantity;
      }
    });
    setSelectedTicket({
      adultCount: adultCount,
      childCount: childCount,
      totalTickets: totalCount
    })

    setShowTicket(!showTicket)
    setCustomerDetails({
      ...customerDetails,
      tickets: dataVal,
      adultCount: dataVal[0]?.selectedQuantity
    })

    // Calculate total tickets count
    const totalTicketsCount = dataVal.tickets.reduce((total, ticket) => {
      return total + ticket.quantity;
    }, 0);

    setTicketCount(totalTicketsCount);
    setSelectedPackage(dataVal)
  }


  const [totalAmount, setTotalAmount] = useState(0);
  const TotalAmountCalculator = (data) => {
    let totalAmount = CurrencyConverter(data?.currency, data?.totalAmount, baseCurrencyValue);
    setTotalAmount(totalAmount);
  }


  const handleCheckAvailability = () => {
    console.log(customerDetails, "customerDetails")
    if (customerDetails?.tickets?.tickets?.length > 0 && customerDetails?.date !== '') {
      setHandlePopupStatus({
        avalibilityChecking: false,
        customerDetails: true,
        addToCart: false,
      })

    } else {
      handleTicket(lifeStyleData?.id)
      ToastMessage({ status: "warning", message: "Please select the date and tickets" })
    }
  }

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

  return (
    <>

      <Head>
        <link rel="canonical" href={canonicalURL} as={canonicalURL} />
        <title>Aahaas - {dataset.productData.data.name} | Unique Experiences with Aahaas in Sri Lanka</title>
        <meta name="description" content={`Discover ${dataset.productData.data.name} and other fun activities in Sri Lanka! Explore recreational experiences, top tourist activities, and unforgettable adventures on Aahaas.`} />
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
                  "item": "https://www.aahaas.com/product-details/lifestyle/"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Lifestyle",
                  "item": `https://www.aahaas.com/product-details/lifestyle/${generateSlug(dataset.productData.data.name)}?pID=${pathId}`
                }
              ]
            }),
          }}
        />
      </Head>



      <CommonLayout parent="Home" title={'lifestyle'} subTitle={'product view'} openSubFilter={() => openSubFilter()} showSearchIcon={false} showMenuIcon={true} location={false}>
        
                 {/* <nav aria-label="Breadcrumb" style={{ marginTop: "10px" }}>   
  <ol>     
    <li>
      <button onClick={handleBack} style={{ border: 'none', background: 'none' }}>
        <ArrowBackIcon/>
      </button>
    </li>   
  </ol> 
</nav> */}
        <div className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? 'mb-5' : 'mb-0'}`}>
          <Container>
            <Row>
              <Col sm="3" className="collection-filter" id="filter" style={openSideBarStatus ? { left: "0px" } : {}}>
                <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
                  <span className="filter-back">
                    <i className="fa fa-angle-left" ></i> back
                  </span>
                </div>
                {
                  loading ?
                    <ProductSkeleton skelotonType='productDetails-left-moreDetails' />
                    :
                    <>
                      <Service
                        serviceType="lifestyle"
                        discounts={discounts}
                        serviceDate={customerData.date}
                        cancellationDays={customerData.date}
                        bookingDeadline={inventoryRates?.[0]?.book_by_days}
                        latitude={latitudelongtitude?.latitude}
                        longitude={latitudelongtitude?.longitude}
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

                      <NewProduct sliderCount={categories.sliderCount} category1={"3"} vendor={categories.vendor_id} vandorName={categories.vandorName} latitude={latitudelongtitude?.latitude} longitude={latitudelongtitude?.longitude} p_ID={PID} />
                    </>
                }
              </Col>
              <Col lg="9" sm="12" xs="12">
                <Container fluid={true} className="p-0">
                  {
                    loading ?
                      <ProductSkeleton skelotonType='productDetails' />
                      :
                      <Row className="p-0 m-0 product-view-mobile">

                        <Col lg="5" className="product-thumbnail p-0 m-0">
                           <LazyLoadImage 
                      onError={(error) => {
                        error.target.src = "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg";
                      }} 
                      src={image ? image : `https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg`} 
                      className={`img-fluid m-auto rounded-1 proinfo-image`} 
                      alt="product-image" 
                      loading="eager" 
                      style={{ 
                        width: 'auto', 
                        minWidth: '100%', 
                        maxWidth: '100%', 
                        minHeight: '300px', 
                        maxHeight: '300px', 
                        objectFit: 'cover', 
                        borderRadius: "12px" 
                      }} 
                    />
                        </Col>

                          {/* <Col lg="5" className="product-thumbnail p-0 m-0">
                          <Slider {...products} asNavFor={nav2} ref={(slider) => setSlider1(slider)} className="product-slick">
                            <div key={1} className="mx-3">
                              <Media src={image || `https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png`} alt='Recreational Activities in Sri Lanka' className="img-fluid product-main-image" style={{ width: "100%", height: (packageStatus && lifeStyleData?.image?.split(',').length <= 1) ? '430px' : '375px', objectFit: 'cover', borderRadius: "10px" }} loading="lazy" />
                            </div>
                          </Slider>
                        </Col> */}

                        <Col lg="7" className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0">

                          <div className='product-right d-flex flex-wrap justify-content-between'>

                            <h1 className="col-12 text-start mb-1 product-name-main" style={{ textTransform: 'uppercase', fontWeight: '500' }}>{lifeStyleData.name} </h1>
                            <p className='col-12 m-0 p-0 ellipsis-1-lines m-0 text-start mb-2' style={{ color: '#66b3ff', cursor: 'pointer', lineHeight: '20px', height: '20px' }} onClick={handleNavigateMap}>{getDistanceFromLatLon(baseLocation?.latitude, baseLocation?.longtitude, latitudelongtitude?.latitude, latitudelongtitude?.longitude)} kms away from your currenct location -  {baseLocation?.address_full}</p>

                         
                            <div className="col-12 m-0 product-variant-head mb-2" style={{ width: '48%' }}>
                              <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Choose your service date</h6>
                              <DatePicker
                                value={customerDetails.date}
                                minDate={new Date()}
                                filterDate={isAvailable}
                                clearIcon={false}
                                className='form-control py-2'
                                onChange={(e) => handleOnDataChange(e)}
                              />
                            </div>
                               <div className="col-12">
                              <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Select Ticket</h6>
                              <div className="form-control d-flex align-items-center mb-2 product-variant-head" style={{ padding: '10px 10px', fontSize: '14px' }} onClick={() => handleTicket(lifeStyleData?.id)}>
                                {selectedPackage?.tickets?.length > 0 ? `Selected ${selectedTicket?.totalTickets} tickets` : "Select Ticket"}

                                <KeyboardArrowDownIcon sx={{ marginLeft: 'auto', color: 'gray' }} />
                              </div>
                            </div>

                            {
                              timeSlots && timeSlots !== '' &&
                              <div className="col-3 m-0 product-variant-head mb-2" style={{
                                backgroundColor: "#c8c8c8",
                                borderRadius: "10px",
                                paddingLeft: "10px", paddingTop: "10px"
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '10px' }}>
                                  <Image src={timeView} alt="Essential icon" width={30} height={30} style={{ marginBottom: "10px" }} />
                                  <div style={{ marginBottom: '10px' }}>
                                    <h6 style={{ fontSize: 11, color: "black" }} className="m-0 ellipsis-1-lines text-start">Duration</h6>
                                    <p className="m-0 p-0" style={{ fontSize: 10, color: 'black' }}>{timeSlots}</p>
                                  </div>
                                </div>
                              </div>

                            }

                            {
                              customerDetails?.tickets.tickets?.length > 0 && customerDetails?.date !== '' ?
                                <><div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">
                                  <h3 className="m-0 p-0">  {totalAmount}</h3>
                                  <h6> {selectedPackage[0]?.selectedQuantity !== undefined ? selectedPackage?.map((pkg) => `${pkg.name} (Qty: ${pkg.selectedQuantity})`).join(", ") : `Select Ticket  ${ticketCount} `}</h6>
                                </div>
                                  <div className='d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end'>
                                    <Button className="btn btn-sm btn-solid col-lg-5 col-12" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleTravelBuddiesModal}>{travelBuddiesStatus ? 'Edit travel buddies' : 'Add travel buddies'} </Button>
                                    {travelBuddiesStatus && <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleValidateForm}>{viewStatus === 'update' ? 'Update cart' : 'Add to cart'}</Button>}
                                    <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                  </div>
                                </>

                                : <div className='d-flex flex-row align-items-center col-12 gap-2 gap-lg-3 justify-content-end justify-content-lg-end mt-3 mt-lg-3'>
                                  {/* <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={getPackageData} disabled={avalibilityLoading}>{avalibilityLoading ? 'Please wait' : cartStatus.status === 'update' ? 'Re Check avalibility' : 'Check avalibility'}</Button> */}
                                  <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleCheckAvailability} >Check avalibility</Button>
                                  <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                </div>
                            }

                            {
                              packageStatus ?
                                <>
                                  <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">

                                    {getAvailableDiscountByPackageId()?.discount_type == "value" || getAvailableDiscountByPackageId()?.discount_type == "precentage" ? (
                                      <><h3 className="m-0 p-0">
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
                                        )}</h3>
                                        <h6 style={{ textDecoration: "line-through" }} className="m-0 p-0">
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
                                          )}</h6></>
                                    ) : (
                                      <h3 className="m-0 p-0">{CurrencyConverter(lifeStyleData.currency, packageRate?.rate_type == "Package" ? packageRate?.package_rate : (packageRate?.child_rate) + (packageRate.adult_rate), baseCurrencyValue)}</h3>

                                    )}




                                    <div className="d-flex align-items-center">
                                      {/* <a onClick={getPackageData} className="btn-change-package mb-2" disabled={avalibilityLoading}>{avalibilityLoading ? 'Please wait' : 'Update Booking'}</a> */}
                                      {/* <span className="m-0 p-0 mb-2 mx-2">/</span> */}
                                      <a onClick={handleMoreDetailsOpen} className="btn-change-package mb-2">Know more about packages</a>
                                    </div>
                                  </div>
                                  <div className='d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end'>
                                    <Button className="btn btn-sm btn-solid col-lg-5 col-12" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleTravelBuddiesModal}>{travelBuddiesStatus ? 'Edit travel buddies' : 'Add travel buddies'} </Button>
                                    <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleValidateForm}>{cartStatus.status === 'update' ? 'Update cart' : 'Add to cart'}</Button>
                                    <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                  </div>
                                </>
                                : null
                              // <div className='d-flex flex-row align-items-center col-12 gap-2 gap-lg-3 justify-content-end justify-content-lg-end mt-3 mt-lg-3'>
                              //   {/* <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={getPackageData} disabled={avalibilityLoading}>{avalibilityLoading ? 'Please wait' : cartStatus.status === 'update' ? 'Re Check avalibility' : 'Check avalibility'}</Button> */}
                              //   <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleCheckAvailability} >Check avalibility</Button>
                              //   <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                              // </div>
                            }

                          </div>
                        </Col>
                      </Row>
                  }
                </Container>
                {
                  !loading &&
                  <ProductTab
                    type='lifestyle'
                    height={lifeStyleData.image.split(',').length > 1 ? '355px' : packageStatus ? '380px' : '430px'}
                    latitude={latitudelongtitude?.latitude} longitude={latitudelongtitude?.longitude}
                    showDesc={true} name={lifeStyleData.name} desc={lifeStyleData.description} showReviews={true} reviews={reviews} showTermsndConditions={true} showndConditions={lifeStyleData?.termsAndConditions} showCancellationpolicy={true} cancellationPolicy={lifeStyleData.cancel_policy} showPaymentPolicy={true} paymentPolicy={lifeStyleData.payment_policy} />
                }
              </Col>
            </Row>
          </Container>
        </div>

        <ModalBase isOpen={showCountBox} title={'Select Number of Pax'} toggle={() => { setshowCountBox(false) }} size="lg">
          <PaxIncrementorComponent open={showCountBox} toggle={() => setshowCountBox(false)} adultCount={customerData.adultCount} childCount={customerData.childCount} childAgesDynamic={customerData.childAges} adultChildMinMax={adultChildMinMax} addPaxPaxIncrement={handleValidateAdultChildCount} paxLimitations={paxLimitations} maxChildAdultCounts={maxChildAdultCounts} ></PaxIncrementorComponent>
        </ModalBase>

        <ModalBase isOpen={handlePopupStatus.avalibilityChecking} title={'Package details'} toggle={handleCloseAllPopup} size="lg">
          <LifestylesPricing packageData={packageData} packageError={packageError} packageStatus={packageStatus} packageRate={packageRate} currency={baseCurrencyValue} adultCount={customerData.adultCount} childCount={customerData.childCount} handlePackageRate={handlePackageRate} discounts={discounts} discountClaimed={discountClaimed} ></LifestylesPricing>
        </ModalBase>

        <ModalBase isOpen={handlePopupStatus.customerDetails} toggle={handleCloseAllPopup} title="Choose Your Buddies" size='md'>
          <BuddyModal adultCount={1} childCount={0} adultDetails={adultDetails} childsDetails={childsDetails} childAges={customerData.childAges} handleTravelBuddies={handleTravelBuddies} providerlife={"globaltix"}></BuddyModal>
        </ModalBase>

        <ModalBase isOpen={handlePopupStatus.addToCart} toggle={handleCloseAllPopup} title="Select Your Cart" size='md'>
          <CartContainer handlePassData={handlePassData} productData={cartData} cartCategory={"Lifestyle"} provider={"globaltix"} preId={preId || null} pageState={viewStatus === 'update'? "CartEdit" : null} />
        </ModalBase>

        <ModalBase isOpen={showTicket} toggle={handleTicketModel} title="Select Ticket" size='lg'>
          <TicketPicker attractionTickets={ticketData} handleOnPressContinueData={handleOnPressContinueData} initialSelectedState={currentComponentState} priceCalculator={TotalAmountCalculator} />
        </ModalBase>

        <ModalBase isOpen={packageMoreDetails} toggle={handleMoreDetailsClose} title={'More details about package'} size="x">
          <div>
            <h6>Name of the package: {packageRate?.package_name || "Not provided"}</h6>
            <p>Description of the package: {packageRate?.description ? packageRate.description : "Not provided"}</p>
            <p>Package rate type: {packageRate?.rate_type || "Not provided"}</p>

            {packageRate?.package_rate ? (
              <p>Price for this package: {CurrencyConverter(packageRate.currency, packageRate.package_rate, baseCurrencyValue)}</p>
            ) : (
              <>
                <p>Per person (Adult) price for this package: {CurrencyConverter(packageRate.currency, packageRate?.adult_rate, baseCurrencyValue)}</p>
                <p>Per person (Child) price for this package: {CurrencyConverter(packageRate.currency, packageRate?.child_rate, baseCurrencyValue)}</p>
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