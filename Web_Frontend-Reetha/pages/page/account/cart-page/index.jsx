import Link from "next/link";
import axios from "axios";
import Head from "next/head";
import React, { useState, useContext, useEffect } from "react";
import { Col, Media, Nav, TabContent, NavItem, NavLink } from "reactstrap";

import { AppContext } from "../../../_app";
import {
  getCartData,
  getCartDataLength,
} from "../../../../AxiosCalls/UserServices/userServices";

import { getCurrencyInCountryFormat } from "../../../../GlobalFunctions/OthersGlobalfunctions";
import CurrencyConverterSummaryPage from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverterSummaryPage";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";

import redirectingbanner from "../../../../public/assets/images/Bannerimages/loginScreen.png";
import applelogo from "../../../../public/assets/images/Bannerimages/AppleLogo.png";
import playstorelogo from "../../../../public/assets/images/Bannerimages/Playstore.png";

import Daywise from "./daywise";
import ServiceWise from "./serviceWise";
import CartWise from "./cartWise";

import CommonLayout from "../../../../components/shop/common-layout";
import ModalBase from "../../../../components/common/Modals/ModalBase";

import DownloadIcon from "@mui/icons-material/Download";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ToastMessage from "../../../../components/Notification/ToastMessage";
import getDiscountProductBaseByPrice from "../../../product-details/common/GetDiscountProductBaseByPrice";

const CartPage = () => {
  const { baseCurrency, triggers, userId, userStatus, baseCurrencyValue } =
    useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [redirectingpopup, setredirectingpopup] = useState(false);

  const [cartData, setCartData] = useState([]);
  const [cartCategories, setCartCategories] = useState([]);
  const [cartDates, setCartDates] = useState([]);
  const [customerMultiCarts, setCustomerMultiCarts] = useState([]);

  const [activeTab, setActiveTab] = useState("1");
  const [cartDataLength, setCartDataLength] = useState(0);

  const [summaryCost, setSummaryCost] = useState({
    netTotal: 0.0,
    shipping: 0.0,
    discount: 0.0,
    grandtotal: 0.0,
  });

  const [discountData, setDiscountData] = useState([]);
  const [showUtilities, setShowUtilities] = useState(false);
  const [checkedCarts, setCheckedCarts] = useState([]);
  const [summaryScreenPopup, setSummaryScreenPopup] = useState(false);
  const [shippingCharges, setShippingCharges] = useState("0");
  const [cartItemCounts, setCartItemCounts] = useState({});
  // NEW: Store individual cart summaries
const [cartSummaries, setCartSummaries] = useState({});
const [selectedCartSummary, setSelectedCartSummary] = useState(null);
// NEW: Calculate individual cart summaries
const calculateIndividualCartSummaries = (cartData) => {
  const summaries = {};
  
  customerMultiCarts.forEach(cart => {
    const cartItems = cartData.filter(item => item.cart_id === cart.cart_id);
    const cartSummary = calculateCartCost(cartItems);
    summaries[cart.cart_id] = {
      ...cartSummary,
      cartTitle: cart.cart_title,
      itemCount: cartItems.length
    };
  });
  
  setCartSummaries(summaries);
};

// NEW: Calculate cost for a specific cart
const calculateCartCost = (cartItems) => {
  let totalCost = 0.0;
  let lifestyStyleCost = 0.0;
  let essentialTotalCost = 0.0;
  let educationTotalCost = 0.0;
  let hotelsTotalCost = 0.0;
  let shippingCost = 0.0;
  let discountCost = 0.0;
  let deliveryDates = [];

  cartItems.forEach((item) => {
    if (item.main_category_id === 3 && item.maincat_type === "Lifestyle") {
      let lifestyAdultCost = 0.0;
      let lifestyChildCost = 0.0;
      let packageCost = 0.0;

      if (item.rate_type === "Package") {
        packageCost = safeCurrencyConverter(
          item.lsCurrency,
          convertToNumber(item.package_rate),
          baseCurrencyValue
        );
      } else {
        const adultRate = convertToNumber(item.adult_rate) * convertToNumber(item.lifestyle_adult_count);
        const childRate = convertToNumber(item.child_rate) * convertToNumber(item.nonFocChildCountLs || 0);

        if (adultRate > 0) {
          lifestyAdultCost = safeCurrencyConverter(item.lsCurrency, adultRate, baseCurrencyValue);
        }
        if (childRate > 0) {
          lifestyChildCost = safeCurrencyConverter(item.lsCurrency, childRate, baseCurrencyValue);
        }
      }

      const currentItemCost = lifestyAdultCost + lifestyChildCost + packageCost;
      lifestyStyleCost += currentItemCost;

      if (item.lsDiscountMeta) {
        try {
          const discountMeta = JSON.parse(item.lsDiscountMeta);
          if (item.lifestyle_id === discountMeta.origin_product_id) {
            const itemDiscount = getDiscountProductBaseByPrice(
              currentItemCost,
              discountMeta,
              item.lsCurrency
            )["discountRate"];
            discountCost += parseFloat(itemDiscount || 0);
          }
        } catch (error) {
          console.log("error in discount calculation", error);
        }
      }
    } else if (
      (item.main_category_id === 1 && item.maincat_type === "Essential") ||
      (item.main_category_id === 2 && item.maincat_type === "Non Essential")
    ) {
      let essentialCost = safeCurrencyConverter(
        item.esCurrency,
        convertToNumber(item.mrp) * convertToNumber(item.quantity),
        baseCurrencyValue
      );
      let shipping = safeCurrencyConverter(
        item.DeliveryCurrency,
        convertToNumber(item.deliveryRate),
        baseCurrencyValue
      );

      if (!deliveryDates.includes(item.order_preffered_date)) {
        deliveryDates.push(item.order_preffered_date);
        shippingCost += shipping;
      }

      essentialTotalCost += essentialCost;
    } else if (item.main_category_id === 5 && item.maincat_type === "Education") {
      let educationAdultCost = safeCurrencyConverter(
        item.eCurrency,
        convertToNumber(item.adult_course_fee),
        baseCurrencyValue
      );
      let educationChildCost = safeCurrencyConverter(
        item.eCurrency,
        convertToNumber(item.child_course_fee),
        baseCurrencyValue
      );

      if (item.student_type === "Adult") {
        educationTotalCost += educationAdultCost;
      } else {
        educationTotalCost += educationChildCost;
      }
    } else if (item.main_category_id === 4 && item.maincat_type === "Hotels") {
      try {
        let reformatted = JSON.parse(item.bookingdataset);
        let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);

        let hotelsCost = 0.0;

        if (reformattedDiscount?.amount) {
          const discountResult = getDiscountProductBaseByPrice(
            convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),
            reformattedDiscount,
            reformatted?.hotelRatesRequest?.Price?.CurrencyCode
          );
          const discountAmountInBaseCurrency = safeCurrencyConverter(
            reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
            convertToNumber(discountResult["discountRate"]),
            baseCurrencyValue
          );
          discountCost += discountAmountInBaseCurrency;
        }

        hotelsCost = safeCurrencyConverter(
          reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
          convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),
          baseCurrencyValue
        );
        hotelsTotalCost += hotelsCost;
      } catch (error) {
        console.error("Error parsing hotel booking data:", error);
      }
    }
  });

  totalCost = lifestyStyleCost + educationTotalCost + essentialTotalCost + hotelsTotalCost;

  return {
    netTotal: totalCost,
    shipping: shippingCost,
    discount: discountCost || 0.0,
    grandtotal: totalCost - discountCost + shippingCost,
  };
};

// NEW: Calculate combined summary for multiple carts
const calculateCombinedCartSummary = (cartIds) => {
  let combinedNetTotal = 0;
  let combinedShipping = 0;
  let combinedDiscount = 0;
  let combinedGrandTotal = 0;
  let totalItems = 0;
  const cartTitles = [];

  cartIds.forEach(cartId => {
    const summary = cartSummaries[cartId];
    if (summary) {
      combinedNetTotal += summary.netTotal;
      combinedShipping += summary.shipping;
      combinedDiscount += summary.discount;
      combinedGrandTotal += summary.grandtotal;
      totalItems += summary.itemCount;
      cartTitles.push(summary.cartTitle);
    }
  });

  return {
    netTotal: combinedNetTotal,
    shipping: combinedShipping,
    discount: combinedDiscount,
    grandtotal: combinedGrandTotal,
    cartTitle: cartTitles.join(', '),
    itemCount: totalItems,
    isCombined: true
  };
};
  const calculateCartItemCounts = () => {
    const counts = {};
    
    customerMultiCarts.forEach(cart => {
      // Count items in this specific cart
      const itemsInCart = cartData.filter(item => item.cart_id === cart.cart_id);
      counts[cart.cart_id] = itemsInCart.length;
    });
    
    setCartItemCounts(counts);
  };
 useEffect(() => {
    if (cartData.length > 0 && customerMultiCarts.length > 0) {
      calculateCartItemCounts();
    }
  }, [cartData, customerMultiCarts]);
  const handleSelectAll = () => {
    const allCartIds = filteredCustomerMultiCarts.map(cart => cart.cart_id);
    setCheckedCarts(allCartIds);
  };

  // Select None functionality
  const handleSelectNone = () => {
    setCheckedCarts([]);
  };

   const isAllSelected = () => {
    return filteredCustomerMultiCarts.length > 0 && 
           checkedCarts.length === filteredCustomerMultiCarts.length;
  };

  // Check if some carts are selected
  const isSomeSelected = () => {
    return checkedCarts.length > 0 && checkedCarts.length < filteredCustomerMultiCarts.length;
  };

   const getTotalItemsCount = () => {
    return Object.values(cartItemCounts).reduce((total, count) => total + count, 0);
  };
  const getSelectedItemsCount = () => {
    return checkedCarts.reduce((total, cartId) => {
      return total + (cartItemCounts[cartId] || 0);
    }, 0);
  };
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomerMultiCarts, setFilteredCustomerMultiCarts] = useState([]);

  // notice status variable -> nsta
  let noticeStatus = localStorage.getItem("#nsta");
  const [noticeShown, setNoticeShown] = useState("hide");

  const bg_colors = [
    "#ffebee",
    "#e3f2fd",
    "#fff8e1",
    "#f3e5f5",
    "#e8f5e9",
    "#fff3e0",
    "#f5f5f5",
    "#e0f7fa",
  ];
  const darker_colors = [
    "#ed4242", // Dark red (given)
    "#476e7c", // Dark blue (given)
    "#e6b800", // Dark yellow
    "#9c27b0", // Dark purple
    "#2e7d32", // Dark green
    "#f57c00", // Dark orange
    "#757575", // Dark gray
    "#00acc1", // Dark cyan
  ];

  const getUserCardDataDetails = async () => {
  setLoading(true);
  await getCartData(userId).then((result) => {
    const cartDataResult = result.cartData || [];
    const customerCarts = result.customerMultiCarts || [];
    
    setCartData(cartDataResult);
    setCartCategories(result.cartCategories || []);
    setCartDates(result.cartDates || []);
    setCustomerMultiCarts(customerCarts);
    
    // Calculate individual cart summaries
    if (cartDataResult.length > 0 && customerCarts.length > 0) {
      calculateIndividualCartSummaries(cartDataResult);
    }
  });
  await getCartDataLength(userId).then((response) => {
    setCartDataLength(response);
  });
  setLoading(false);
};


  // FIXED: Improved convertToNumber function with better error handling
  const convertToNumber = (value) => {
    // Handle null, undefined, or empty values
    if (value == null || value === "" || value === "NaN") {
      return 0;
    }

    // If it's already a number and not NaN
    if (typeof value === "number" && !isNaN(value)) {
      return value;
    }

    // If it's a string, clean it up
    if (typeof value === "string") {
      // Remove single quotes, commas, and any non-numeric characters except decimal points
      const cleanedValue = value.replace(/[',\s]/g, "");
      const parsed = parseFloat(cleanedValue);
      return isNaN(parsed) ? 0 : parsed;
    }

    // Fallback: try to convert to number
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  };

  // FIXED: Legacy function for backward compatibility
  const cleanAndConvertToNumber = (str) => {
    return convertToNumber(str);
  };

  // FIXED: Safe currency conversion wrapper
  const safeCurrencyConverter = (fromCurrency, amount, baseCurrencyValue) => {
    try {
      const result = CurrencyConverterSummaryPage(
        fromCurrency,
        amount,
        baseCurrencyValue
      );
      return convertToNumber(result);
    } catch (error) {
      console.error("Currency conversion error:", error);
      return 0;
    }
  };

  const CalculateAllCost = (value) => {
    console.log("value car load", value);
    let totalCost = 0.0;

    let lifestyStyleCost = 0.0;
    let essentialTotalCost = 0.0;
    let educationTotalCost = 0.0;
    let hotelsTotalCost = 0.0;

    let shippingCost = 0.0;
    let discountCost = 0.0;
    let newDetails = [];
    let deliveryDates = [];

    value.forEach((item) => {
      if (item.main_category_id === 3 && item.maincat_type === "Lifestyle") {
        // console.log("lifestyle item", item);
        let lifestyAdultCost = 0.0;
        let lifestyChildCost = 0.0;
        let packageCost = 0.0;

        if (item.rate_type === "Package") {
          packageCost = safeCurrencyConverter(
            item.lsCurrency,
            convertToNumber(item.package_rate), // Handle null or undefined package_rate
            baseCurrencyValue
          );
        } else {
          const adultRate =
            convertToNumber(item.adult_rate) *
            convertToNumber(item.lifestyle_adult_count);
          const childRate =
            convertToNumber(item.child_rate) *
            convertToNumber(item.nonFocChildCountLs || 0);

          if (adultRate > 0) {
            lifestyAdultCost = safeCurrencyConverter(
              item.lsCurrency,
              adultRate,
              baseCurrencyValue
            );
          }
          if (childRate > 0) {
            lifestyChildCost = safeCurrencyConverter(
              item.lsCurrency,
              childRate,
              baseCurrencyValue
            );
          }
        }

        // Calculate individual item cost for discount calculation
        const currentItemCost = lifestyAdultCost + lifestyChildCost + packageCost;
        lifestyStyleCost += currentItemCost;

        // Calculate discount for this specific item
        if (item.lsDiscountMeta) {
          try {
            const discountMeta = JSON.parse(item.lsDiscountMeta);

            if (item.lifestyle_id === discountMeta.origin_product_id) {
              console.log("lifestyle item discount calculation for:", item.lifestyle_name);
              try {
                const itemDiscount = getDiscountProductBaseByPrice(
                  currentItemCost,
                  discountMeta,
                  item.lsCurrency
                )["discountRate"];
                
                discountCost += parseFloat(itemDiscount || 0);
                console.log("Individual item discount:", itemDiscount);
                console.log("Current total discountCost:", discountCost);
              } catch (error) {
                console.log("error in discount calculation", error);
              }
            }
          } catch (error) {
            console.log("error parsing discount meta", error);
          }
        }
        // console.log("lifestyStyleCost", lifestyStyleCost);
      } else if (
        (item.main_category_id === 1 && item.maincat_type === "Essential") ||
        (item.main_category_id === 2 && item.maincat_type === "Non Essential")
      ) {
        let essentialCost = safeCurrencyConverter(
          item.esCurrency,
          convertToNumber(item.mrp) * convertToNumber(item.quantity),
          baseCurrencyValue
        );
        let shipping = safeCurrencyConverter(
          item.DeliveryCurrency,
          convertToNumber(item.deliveryRate),
          baseCurrencyValue
        );

        if (!deliveryDates.includes(item.order_preffered_date)) {
          deliveryDates.push(item.order_preffered_date);
          let more = {
            name: item.listing_title,
            shippingCost: item.deliveryRate,
            currency: item.esCurrency,
          };
          shippingCost += shipping;
          newDetails.push(more);
        }

        essentialTotalCost += essentialCost;
      } else if (
        item.main_category_id === 5 &&
        item.maincat_type === "Education"
      ) {
        let educationAdultCost = safeCurrencyConverter(
          item.eCurrency,
          convertToNumber(item.adult_course_fee),
          baseCurrencyValue
        );
        let educationChildCost = safeCurrencyConverter(
          item.eCurrency,
          convertToNumber(item.child_course_fee),
          baseCurrencyValue
        );

        if (item.student_type === "Adult") {
          educationTotalCost += educationAdultCost;
        } else {
          educationTotalCost += educationChildCost;
        }
      } else if (
        item.main_category_id === 4 &&
        item.maincat_type === "Hotels"
      ) {
        // try {
        //   let reformatted = JSON.parse(item.bookingdataset);
        //   let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
        //   console.log(reformattedDiscount, "reformattedDiscount");
        //   console.log(reformatted, "reformatted");

        //   let hotelsCost = 0.00

        //   if( reformattedDiscount?.amount) {

        //    const discountFroProducts = getDiscountProductBaseByPrice(convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),reformattedDiscount,reformatted?.hotelRatesRequest?.Price?.CurrencyCode)["discountRate"]
        //    discountCost += Number(discountFroProducts)
        //    console.log(discountCost, "hotelDiscount discountCost");
        //   }
        //     hotelsCost = safeCurrencyConverter(
        //     reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
        //     convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),
        //     baseCurrencyValue
        //   );

        //   console.log(hotelsCost, "hotelCost issss chmodified");

        //   hotelsTotalCost += hotelsCost;
        // } catch (error) {
        //   console.error("Error parsing hotel booking data:", error);
        // }

        // Fixed hotel discount calculation with proper currency conversion
        try {
          let reformatted = JSON.parse(item.bookingdataset);
          let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
          // console.log(reformattedDiscount, "reformattedDiscount");
          // console.log(reformatted, "reformatted");

          let hotelsCost = 0.0;

          if (reformattedDiscount?.amount) {
            // Get the discount amount in the original hotel currency
            const discountResult = getDiscountProductBaseByPrice(
              convertToNumber(
                reformatted?.hotelRatesRequest?.Price?.PublishedPrice
              ),
              reformattedDiscount,
              reformatted?.hotelRatesRequest?.Price?.CurrencyCode
            );

            const discountAmountInOriginalCurrency =
              discountResult["discountRate"];

            // Convert the discount amount to base currency
            const discountAmountInBaseCurrency = safeCurrencyConverter(
              reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
              convertToNumber(discountAmountInOriginalCurrency),
              baseCurrencyValue
            );

            // Add the converted discount amount to total discount
            discountCost += discountAmountInBaseCurrency;
            // console.log(
            //   discountAmountInBaseCurrency,
            //   "hotelDiscount in base currency"
            // );
            // console.log(discountCost, "total discountCost");
          }

          // Convert hotel cost to base currency
          hotelsCost = safeCurrencyConverter(
            reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
            convertToNumber(
              reformatted?.hotelRatesRequest?.Price?.PublishedPrice
            ),
            baseCurrencyValue
          );

          // console.log(hotelsCost, "hotelCost in base currency");

          hotelsTotalCost += hotelsCost;
        } catch (error) {
          console.error("Error parsing hotel booking data:", error);
        }
      }
    });

    totalCost =
      lifestyStyleCost +
      educationTotalCost +
      essentialTotalCost +
      hotelsTotalCost;

    setSummaryCost({
      netTotal: totalCost,
      shipping: shippingCost,
      discount: discountCost || 0.0,
      // grandtotal: totalCost - discountCost + shippingCost
      grandtotal: totalCost - discountCost + shippingCost,
    });
  };

  // Helper function to calculate total discount including price-based discount
  const getTotalDiscountAmount = () => {
    const productDiscounts = summaryCost.discount || 0;
    
    if (!discountData || Object.keys(discountData).length === 0) {
      return productDiscounts;
    }

    const priceBasedDiscount = getPriceBasedDiscountAmount(
      summaryCost.netTotal,
      baseCurrencyValue,
      discountData
    )?.discountAmount || 0;

    return productDiscounts + priceBasedDiscount;
  };

  // Helper function to calculate final grand total with all discounts
  const getFinalGrandTotal = () => {
    const totalDiscount = getTotalDiscountAmount();
    return Math.max(0, summaryCost.netTotal + summaryCost.shipping - totalDiscount);
  };

  // FIXED: Updated useEffect with better error handling
  useEffect(() => {
    const grandTotal = convertToNumber(summaryCost?.grandtotal);
    if (grandTotal > 0) {
      fetchDiscount(grandTotal);
    }
    // console.log("summaryCost.grandtotal", grandTotal);
  }, [summaryCost]);

  // FIXED: Updated fetchDiscount function with better error handling
  const fetchDiscount = async (grandTotal) => {
    try {
      const safeGrandTotal = convertToNumber(grandTotal);

      const data = {
        grand_total: safeGrandTotal,
        currency: baseCurrencyValue?.base || "USD",
        userId: userId,
      };

      // console.log(data, "Grand Total value issss");
      setDiscountData({});

      const response = await axios.post(
        "get-price-based-discounts-to-cart/10",
        data
      );

      console.log(response, "Grand Total value issss 123444");

      if (response.data.status === 200) {
        setDiscountData(response.data.cartAvailableDiscount?.[0] || {});
        console.log(response.data.cartAvailableDiscount?.[0], "discountData");
      }
    } catch (err) {
      console.error("Error fetching discount:", err);
      setDiscountData({});
    } finally {
      // setDiscountPricingLoading(false);
    }
  };

  // FIXED: Improved getPriceBasedDiscountAmount function
  const getPriceBasedDiscountAmount = (
    totalAmount,
    currencyData,
    discountData
  ) => {
    // console.log(
    //   totalAmount,
    //   currencyData,
    //   discountData,
    //   "discountAmount234234234qwwe"
    // );

    // Handle case where discount data is invalid or user not eligible
    if (
      !discountData ||
      Object.keys(discountData).length === 0 ||
      discountData?.discountEligibility === false
    ) {
      const safeTotalAmount = convertToNumber(totalAmount);
      return {
        discountAmount: 0,
        finalAmount: safeTotalAmount,
        totalAmount: safeTotalAmount,
      };
    }

    const {
      amount_type = "fixed",
      price_currency = "USD",
      discounted_amount = "0",
    } = discountData;

    let discountAmount = 0;
    const safeTotalAmount = convertToNumber(totalAmount);

    console.log(
      discounted_amount,
      price_currency,
      amount_type,
      "discounted_amount"
    );

    if (amount_type === "percentage") {
      const percentageValue = convertToNumber(discounted_amount);
      discountAmount = (safeTotalAmount * percentageValue) / 100;
    } else {
      // For fixed amount, convert to base currency
      discountAmount = safeCurrencyConverter(
        discountData?.price_currency,
        convertToNumber(discountData?.discounted_amount),
        baseCurrencyValue
      );
    }

    // Ensure discount doesn't exceed total amount
    discountAmount = Math.min(discountAmount, safeTotalAmount);

    const finalAmount = Math.max(0, safeTotalAmount - discountAmount);

    console.log("discountAmount221131", finalAmount);

    return {
      discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
      finalAmount: isNaN(finalAmount) ? safeTotalAmount : finalAmount,
      totalAmount: safeTotalAmount,
    };
  };

  // FIXED: Updated getDynamicDiscountMessage function with better error handling
  const getDynamicDiscountMessage = (
    currentTotal,
    discountData,
    baseCurrencyValue
  ) => {
    if (!discountData || Object.keys(discountData).length === 0) {
      return null;
    }

    const {
      condition_start_value,
      condition_end_value,
      discounted_amount,
      price_currency,
      condition_currency,
      discountEligibility,
      amount_type = "fixed",
    } = discountData;

    // Safely convert condition values to base currency
    let minSpendInBaseCurrency = 0;
    let maxSpendInBaseCurrency = null;

    try {
      minSpendInBaseCurrency = safeCurrencyConverter(
        condition_currency,
        convertToNumber(condition_start_value),
        baseCurrencyValue
      );

      if (condition_end_value) {
        maxSpendInBaseCurrency = safeCurrencyConverter(
          condition_currency,
          convertToNumber(condition_end_value),
          baseCurrencyValue
        );
      }
    } catch (error) {
      console.error("Currency conversion error:", error);
      return null;
    }

    // Clean and convert current total to number for comparison
    const cleanCurrentTotal = convertToNumber(currentTotal);
    const cleanMinSpend = convertToNumber(minSpendInBaseCurrency);

    // Function to format discount display based on amount_type
    const formatDiscountDisplay = () => {
      if (amount_type === "percentage") {
        const percentage = convertToNumber(discounted_amount);
        return `${percentage}% off`;
      } else {
        // For fixed amount, convert to base currency
        const discountAmountInBaseCurrency = safeCurrencyConverter(
          price_currency,
          convertToNumber(discounted_amount),
          baseCurrencyValue
        );

        return `${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
          baseCurrencyValue.base,
          discountAmountInBaseCurrency.toFixed(2)
        )} off`;
      }
    };

    // Check if user has already qualified for discount
    if (cleanCurrentTotal >= cleanMinSpend) {
      if (maxSpendInBaseCurrency) {
        const cleanMaxSpend = convertToNumber(maxSpendInBaseCurrency);

        // Check if within range
        if (cleanCurrentTotal <= cleanMaxSpend) {
          return {
            type: "qualified",
            message: `🎉 You got ${formatDiscountDisplay()}!`,
            isEligible: true,
          };
        } else {
          return null;
        }
      } else {
        return {
          type: "qualified",
          message: `🎉 You got ${formatDiscountDisplay()}!`,
          isEligible: true,
        };
      }
    } else {
      // Calculate how much more they need to spend
      const amountToSpend = cleanMinSpend - cleanCurrentTotal;
      return {
        type: "need_more",
        message: `Spend ${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
          baseCurrencyValue.base,
          Math.max(0, amountToSpend).toFixed(2)
        )} more and grab ${formatDiscountDisplay()}`,
        isEligible: false,
        amountNeeded: Math.max(0, amountToSpend),
      };
    }
  };

  // FIXED: Safe currency formatting helper
  const safeCurrencyFormat = (currency, amount) => {
    const safeAmount = convertToNumber(amount);
    if (safeAmount === 0 || isNaN(safeAmount)) {
      return "0.00";
    }
    return getCurrencyInCountryFormat(currency, safeAmount.toFixed(2));
  };

  const handlePopup = () => {
    setredirectingpopup(true);
  };

  const handleRedirectPlayStore = () => {
    window.open(
      `https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share`,
      "_blank"
    );
  };

  const handlleRedirectAppStore = () => {
    window.open(`https://apps.apple.com/lk/app/aahaas/id6450589764`, "_blank");
  };

  useEffect(() => {
    //   setCheckedCarts([]);
    // setSummaryCost({
    //      netTotal: 0.0,
    //   shipping: 0.0,
    //   discount: 0.0,
    //   grandtotal: 0.0,
    // })
    // setCheckedCarts([]);
    // setShowUtilities(!showUtilities)
    getUserCardDataDetails();
  }, [triggers, baseCurrencyValue]);
  // }, [triggers, baseCurrencyValue]);

  const handleSetNoticeHide = () => {
    setNoticeShown("hide");
    localStorage.setItem("#nsta", "hide");
  };

  const handleCheckCarts = (cart) => {
    setCheckedCarts((prevCheckedCarts) => {
      if (prevCheckedCarts.includes(cart.cart_id)) {
        return prevCheckedCarts.filter(
          (checkedCart) => checkedCart !== cart.cart_id
        );
      }
      return [...prevCheckedCarts, cart.cart_id];
    });
  };

  // Search functionality
   const handleSearchCarts = (searchValue) => {
    setSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setFilteredCustomerMultiCarts(customerMultiCarts);
    } else {
      const filtered = customerMultiCarts.filter((cart) =>
        cart.cart_title.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredCustomerMultiCarts(filtered);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setFilteredCustomerMultiCarts(customerMultiCarts);
  };

  const handleSummaryScreenPopup = () => {
    if (checkedCarts.length === 0) {
      ToastMessage({
        status: "error",
        message:
          "Kindly choose at least one cart to generate summary or itinerary",
      });
    } else {
      setSummaryScreenPopup(true);
    }
  };

const handleDownloadSummary = async (data) => {
  // Use selectedCartSummary for shipping and discount
  const postData = `currency=${baseCurrency}&shipping=${convertToNumber(
    selectedCartSummary?.shipping || summaryCost?.shipping || 0
  ).toFixed(2)}&`;
  
  const cartIds = [];
  checkedCarts.map((value, key) => {
    cartIds.push(`cartIds[${key}]=${value}`);
  });

  const discountAmount = selectedCartSummary?.discount || summaryCost?.discount || 0;
  let final = cartIds.join("&");
  const safeDiscountAmount = convertToNumber(discountAmount);
  const safeShippingCharges = convertToNumber(shippingCharges);

  let summaryLink = postData
    .concat(final)
    .concat(`&price_discount=${safeDiscountAmount}&shipping_charges=${safeShippingCharges}`);
  setSummaryScreenPopup(false);

  if (data === "summary") {
    window.open(axios.defaults.baseURL + `/cart-summary/pdf?${summaryLink}`, "_blank");
  } else if (data === "shortItenary") {
    window.open(axios.defaults.baseURL + `/cart-itinerary/short/pdf?${final}`, "_blank");
  } else if (data === "longItenary") {
    window.open(axios.defaults.baseURL + `/cart-itinerary/long/pdf?${final}`, "_blank");
  }
};

useEffect(() => {
  setShippingCharges(convertToNumber(
    selectedCartSummary?.shipping || summaryCost?.shipping || 0
  ).toFixed(2));
}, [selectedCartSummary, summaryCost]);

useEffect(() => {
  setShippingCharges(convertToNumber(selectedCartSummary?.shipping || 0).toFixed(2));
}, [selectedCartSummary]);
  // FIXED: Update summary when cart selection changes
useEffect(() => {
  console.log("Cart selection changed:", checkedCarts);
  
  if (checkedCarts.length === 0) {
    setSelectedCartSummary(null);
    setSummaryCost({
      netTotal: 0.0,
      shipping: 0.0,
      discount: 0.0,
      grandtotal: 0.0,
    });
    return;
  }

  // Calculate summary for selected carts
  let filteredCartData = cartData.filter((item) => 
    checkedCarts.includes(item.cart_id)
  );
  
  console.log("Filtered cart data:", filteredCartData);
  
  if (filteredCartData.length === 0) {
    setSelectedCartSummary(null);
    return;
  }

  // Use the existing CalculateAllCost function for main summary
  CalculateAllCost(filteredCartData);
  
  // Also calculate selectedCartSummary for order details
  const calculatedSummary = calculateCartCost(filteredCartData);
  
  // Add additional info
  const enhancedSummary = {
    ...calculatedSummary,
    cartTitle: checkedCarts.length === 1 
      ? customerMultiCarts.find(cart => cart.cart_id === checkedCarts[0])?.cart_title 
      : `${checkedCarts.length} carts selected`,
    itemCount: filteredCartData.length,
    isCombined: checkedCarts.length > 1
  };

  console.log("Enhanced summary:", enhancedSummary);
  setSelectedCartSummary(enhancedSummary);
  
}, [checkedCarts, cartData, customerMultiCarts]);

  // Update filtered carts when customerMultiCarts changes
  useEffect(() => {
    setFilteredCustomerMultiCarts(customerMultiCarts);
  }, [customerMultiCarts]);

   return (
    <>
      <Head>
        <title>Aahaas - Carts</title>
      </Head>

      <CommonLayout
        parent="home"
        title="cart"
        showMenuIcon={false}
        showSearchIcon={false}
        catIcon={false}
      >
        {userStatus.userLoggesIn ? (
          <div className="container">
            {loading ? (
              <section className="tab-product m-0 my-lg-5 px-5">
                <div className="d-flex flex-column align-items-center text-center">
                  <h5 className="text-center">Fetching your products. Please wait !</h5>
                </div>
              </section>
            ) : cartDataLength == 0 ? (
              <section className="tab-product m-0 my-5 px-5">
                <div className="d-flex flex-column align-items-center">
                  <h5>Your Cart is Empty ...</h5>
                  <h5>Explore more shortlist some items.</h5>
                </div>
              </section>
            ) : (
              <section className="tab-product m-0 mb-5 px-lg-5 px-sm-0">
                <Col sm="12" lg="12" md="12">
                  <Nav tabs className="nav-material testing d-flex align-items-center justify-content-start mb-3">
                    <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                      <NavLink
                        style={{ fontSize: "15px" }}
                        className={activeTab === "1" ? "active" : ""}
                        onClick={() => setActiveTab("1")}
                      >
                        Day wise
                      </NavLink>
                    </NavItem>
                    
                    <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                      <NavLink
                        style={{ fontSize: "15px" }}
                        className={activeTab === "2" ? "active" : ""}
                        onClick={() => setActiveTab("2")}
                      >
                        Service wise
                      </NavLink>
                    </NavItem>
                    
                    <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                      <NavLink
                        style={{ fontSize: "15px" }}
                        className={activeTab === "3" ? "active" : ""}
                        onClick={() => setActiveTab("3")}
                      >
                        Cart wise
                      </NavLink>
                    </NavItem>
                    
                    <div className={`cart-notice-${noticeShown}`}>
                      <div className="d-flex flex-column">
                        <h6>itinerary / summary document generation</h6>
                        <p>
                          Discover our AI-powered itinerary generation service—designed to make your journey effortless and
                          personalized. Simply select the key details you want included, and our system will craft a stylish and
                          tailored summary for your upcoming trip. Let us turn your service date into a seamless travel experience!
                        </p>
                        <button
                          onClick={handleSetNoticeHide}
                          className="btn btn-solid py-1 px-2 rounded-3 col-4 mx-auto"
                        >
                          Got it !
                        </button>
                      </div>
                    </div>
                  </Nav>

                  {/* Cart Summary Header */}
                  
                    <div className="cart-summary-header p-3 " >
                      <div className="row align-items-center">
                        <div className="col-md-6">
                          
                          <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                            Total {customerMultiCarts.length} carts available
                            
                          </p>
                        </div>
                       
                      </div>
                    </div>
                  

                  {/* Search bar section */}
                  <div className="col-12 mb-4">
                    <div className="search-cart-container position-relative">
                      <SearchIcon 
                        className="search-icon position-absolute" 
                        style={{ 
                          left: '15px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          color: '#6c757d',
                          zIndex: 10
                        }} 
                      />
                      <input
                        type="text"
                        className="form-control ps-5 pe-5"
                        placeholder="Search carts..."
                        value={searchTerm}
                        onChange={(e) => handleSearchCarts(e.target.value)}
                        style={{
                          borderRadius: '25px',
                          border: '2px solid #e9ecef',
                          padding: '12px 50px 12px 50px',
                          fontSize: '16px',
                          transition: 'all 0.3s ease',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                      {searchTerm && (
                        <CloseIcon
                          className="clear-search-icon position-absolute"
                          onClick={clearSearch}
                          style={{
                            right: '15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6c757d',
                            cursor: 'pointer',
                            zIndex: 10,
                            fontSize: '20px'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Search Results Section */}
                  {searchTerm && (
                    <div className="col-12 mb-4">
                      <div className="search-results-container">
                        <h6 className="mb-3">
                          Search Results for "{searchTerm}" ({filteredCustomerMultiCarts.length} found)
                        </h6>
                        {filteredCustomerMultiCarts.length > 0 ? (
                          <div className="row">
                            {filteredCustomerMultiCarts.map((cart, index) => (
                              <div key={index} className="col-md-4 col-sm-6 mb-3">
                                <div
                                  className="cart-search-result-item p-3 rounded"
                                  onClick={() => handleCheckCarts(cart)}
                                  style={{
                                    backgroundColor: bg_colors[index % 8],
                                    color: darker_colors[index % 8],
                                    border: checkedCarts.includes(cart.cart_id) 
                                      ? `3px solid ${darker_colors[index % 8]}` 
                                      : "2px solid transparent",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease"
                                  }}
                                >
                                  <div className="d-flex align-items-center">
                                    <input
                                      type="checkbox"
                                      className="form-check-input me-2"
                                      checked={checkedCarts.includes(cart.cart_id)}
                                      readOnly
                                    />
                                    <div className="d-flex flex-column">
                                      <label 
                                        className="form-check-label m-0 p-0 fw-bold" 
                                        style={{ textTransform: 'capitalize' }}
                                      >
                                        {cart.cart_title}
                                      </label>
                                      <small 
                                        className="text-muted"
                                        style={{ fontSize: '12px', marginTop: '2px' }}
                                      >
                                        {cartItemCounts[cart.cart_id] || 0} items
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-muted mb-0">No carts found matching "{searchTerm}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Download button section - Show when carts are selected */}
                  {checkedCarts.length > 0 && (
                    <div className="col-12 mb-4">
                      <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }}>
                        <div>
                          <h6 className="mb-1 text-primary">
                            <DownloadIcon sx={{ fontSize: "18px", marginRight: "8px" }} />
                            {checkedCarts.length} cart(s) selected • {getSelectedItemsCount()} items
                          </h6>
                          <p className="mb-0 text-muted" style={{ fontSize: "14px" }}>
                            Ready to download summary or itinerary
                          </p>
                        </div>
                       
                      </div>
                    </div>
                  )}

                  {/* Mobile Utilities Toggle Button */}
                  <div className="d-md-none mb-3">
                    <button
                      className="btn btn-outline-primary w-100"
                      style={{
                        backgroundColor: showUtilities ? "rgba(13, 110, 253, 0.1)" : "",
                        borderColor: showUtilities ? "#0d6efd" : "#6c757d",
                        color: showUtilities ? "#0d6efd" : "#6c757d"
                      }}
                      onClick={() => setShowUtilities(!showUtilities)}
                    >
                      <AutoFixHighOutlinedIcon
                        sx={{ padding: "1px", fontSize: "18px", marginRight: "8px" }}
                      />
                      {showUtilities ? 'Hide' : 'Show'} Cart Selection & Download
                    </button>
                  </div>

                  <TabContent activeTab={activeTab} className="nav-material">
                    <section className="col-12 row mt-4 m-0 p-0">
                      {showUtilities && (
                        <div className="col-12 mb-4">
                          <div className="search-cart-container position-relative">
                            <SearchIcon 
                              className="search-icon position-absolute" 
                              style={{ 
                                left: '15px', 
                                top: '50%', 
                                transform: 'translateY(-50%)', 
                                color: '#6c757d',
                                zIndex: 10
                              }} 
                            />
                            <input
                              type="text"
                              className="form-control ps-5 pe-5"
                              placeholder="Search carts..."
                              value={searchTerm}
                              onChange={(e) => handleSearchCarts(e.target.value)}
                              style={{
                                borderRadius: '25px',
                                border: '2px solid #e9ecef',
                                padding: '12px 50px 12px 50px',
                                fontSize: '16px',
                                transition: 'all 0.3s ease',
                                backgroundColor: '#f8f9fa'
                              }}
                            />
                            {searchTerm && (
                              <CloseIcon
                                className="clear-search-icon position-absolute"
                                onClick={clearSearch}
                                style={{
                                  right: '15px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  color: '#6c757d',
                                  cursor: 'pointer',
                                  zIndex: 10,
                                  fontSize: '20px'
                                }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                   
                      <div className={`col-lg-${checkedCarts?.length > 0 ? 8 : 12} col-sm-12`}>
                        <div
                          className="cartWise-carts-container mb-5 d-flex align-items-center"
                          style={{
                            gap: "10px",
                            flexWrap: "nowrap",
                            display: checkedCarts.length > 0 ? "flex" : "none",
                          }}
                        >
                          <div
                            className="summary-download-button d-flex align-items-center"
                            style={{
                              cursor: "pointer",
                              backgroundColor: checkedCarts.length === 0 ? "lightgray" : "",
                              padding: "8px 12px",
                              borderRadius: "4px",
                              marginRight: "10px",
                              height: "fit-content",
                              alignSelf: "center",
                            }}
                            onClick={() => handleSummaryScreenPopup()}
                          >
                            <DownloadIcon />
                            <label className="mx-2" style={{ cursor: "pointer", margin: 0 }}>Download</label>
                          </div>

                          {/* Bulk Selection Controls */}
                          <div className="d-flex align-items-center gap-2 me-3">
                            <button
                              className="btn btn-outline-primary btn-sm py-1 px-2"
                              onClick={handleSelectAll}
                              disabled={isAllSelected()}
                              style={{ fontSize: '12px' }}
                            >
                              Select All
                            </button>
                            <button
                              className="btn btn-outline-secondary btn-sm py-1 px-2"
                              onClick={handleSelectNone}
                              disabled={checkedCarts.length === 0}
                              style={{ fontSize: '12px' }}
                            >
                              None
                            </button>
                          </div>

                          <div
                            className="cart-details-summary d-flex align-items-center"
                            style={{
                              display: "flex",
                              overflowX: "auto",
                              overflowY: "hidden",
                              whiteSpace: "nowrap",
                              gap: "10px",
                              paddingBottom: "5px",
                              scrollbarWidth: "thin",
                              scrollbarColor: "#ccc transparent",
                              alignItems: "center",
                            }}
                          >
                            {filteredCustomerMultiCarts.map((cart, index) => (
                              <div
                                key={index}
                                className="d-flex align-items-center"
                                onClick={() => handleCheckCarts(cart)}
                                style={{
                                  backgroundColor: bg_colors[index % 8],
                                  color: darker_colors[index % 8],
                                  padding: "8px 12px",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  flexShrink: 0,
                                  minWidth: "140px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={checkedCarts.includes(cart.cart_id)}
                                  style={{ margin: 0, marginRight: "8px" }}
                                />
                                  <label
                                    className="form-check-label m-0 p-0"
                                    style={{ 
                                      textTransform: "capitalize", 
                                      cursor: "pointer", 
                                      margin: 0,
                                      fontSize: "14px",
                                      fontWeight: "500"
                                    }}
                                  >
                                    {cart.cart_title}
                                  </label>
                                  
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Rest of your table content */}
                        <table className="col-12 m-0 p-0">
                          <thead className="cart-page-heading">
                            {activeTab === "1" ? (
                              <Daywise
                                handlePopup={handlePopup}
                                showUtilities={showUtilities}
                                setShowUtilities={setShowUtilities}
                                setNoticeShown={setNoticeShown}
                                cartData={cartData}
                                checkedCarts={checkedCarts}
                                activeTab={activeTab}
                                cartDates={cartDates}
                                customerMultiCarts={customerMultiCarts}
                                summaryCost={summaryCost}
                                mobileView={false}
                              />
                            ) : activeTab === "2" ? (
                              <ServiceWise
                                handlePopup={handlePopup}
                                showUtilities={showUtilities}
                                setShowUtilities={setShowUtilities}
                                setNoticeShown={setNoticeShown}
                                cartData={cartData}
                                checkedCarts={checkedCarts}
                                activeTab={activeTab}
                                cartCategories={cartCategories}
                                customerMultiCarts={customerMultiCarts}
                                summaryCost={summaryCost}
                                mobileView={false}
                              />
                            ) : activeTab === "3" ? (
                              <CartWise
                                customerMultiCarts={customerMultiCarts}
                                showUtilities={showUtilities}
                                setShowUtilities={setShowUtilities}
                                setNoticeShown={setNoticeShown}
                                cartData={cartData}
                                checkedCarts={checkedCarts}
                                cartCategories={cartCategories}
                              />
                            ) : null}
                          </thead>
                          {/* Mobile view headers */}
                        </table>
                      </div>

{/* Order Details Section */}
{checkedCarts?.length > 0 && (
  <div className="col-lg-4 col-sm-12 p-lg-5 mt-5 my-lg-0" style={{ backgroundColor: "#f9f9f9", height: "fit-content" }}>
    <div className="py-4">
      <table className="col-12 m-0">
        <thead>
          <tr>
            <th
              className="p-4 pb-0 pl-0"
              style={{
                borderTopLeftRadius: "8px",
                borderTopRightRadius: "8px",
                backgroundColor: "#476e7c",
                color: "white",
              }}
            >
              <h4 className="fs-3 fw-bold">
                Order Details
              </h4>
              <small style={{ fontSize: "12px", opacity: 0.8 }}>
                {selectedCartSummary?.cartTitle || `${checkedCarts.length} cart(s) selected`}
              </small>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <ul className="sub-total p-4 pt-3">
                <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between">
                  Total Price{" "}
                  <span className="count">
                    {CurrencyConverter(
                      baseCurrencyValue.base,
                      selectedCartSummary?.netTotal || summaryCost.netTotal || 0,
                      baseCurrencyValue
                    )}{" "}
                  </span>
                </h5>

                <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between">
                  Shipping Charges
                  <span className="count">
                    {baseCurrencyValue.base}{" "}
                    {safeCurrencyFormat(baseCurrencyValue.base, selectedCartSummary?.shipping || summaryCost.shipping || 0)}{" "}
                  </span>
                </h5>

                {/* FIXED: Improved Discount Display */}
                {(getTotalDiscountAmount() > 0) && (
                  <>
                    {/* Product-based discounts */}
                    {(selectedCartSummary?.discount || summaryCost.discount || 0) > 0 && (
                      <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between">
                        Product Discount{" "}
                        <span className="count text-success">
                          -{baseCurrencyValue.base}{" "}
                          {safeCurrencyFormat(baseCurrencyValue.base, selectedCartSummary?.discount || summaryCost.discount || 0)}{" "}
                        </span>
                      </h5>
                    )}

                    {/* Price-based discounts */}
                    {/* {discountData && Object.keys(discountData).length > 0 && discountData.discountEligibility && (
                      <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between">
                        Price Discount ({discountData.discounted_amount}
                        {discountData.amount_type === 'percentage' ? '%' : ''}){" "}
                        <span className="count text-success">
                          -{baseCurrencyValue.base}{" "}
                          {safeCurrencyFormat(baseCurrencyValue.base, discountData.discountedAmount || 0)}{" "}
                        </span>
                      </h5>
                    )} */}

                    {/* Total Discount */}
                    <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between border-bottom pb-3">
                      Total Discount{" "}
                      <span className="count text-success">
                        -{baseCurrencyValue.base}{" "}
                        {safeCurrencyFormat(baseCurrencyValue.base, getTotalDiscountAmount())}{" "}
                      </span>
                    </h5>
                  </>
                )}

                <h5 style={{ fontSize: 15 }} className="d-flex justify-content-between border-bottom pb-3">
                  Grand Total{" "}
                  <span className="count">
                    {baseCurrencyValue.base}{" "}
                    {safeCurrencyFormat(baseCurrencyValue.base, getFinalGrandTotal())}{" "}
                  </span>
                </h5>

                {/* Discount Message */}
               {/* Discount Message */}
{discountData &&
  Object.keys(discountData).length > 0 &&
  getDynamicDiscountMessage(
    selectedCartSummary?.netTotal || summaryCost.netTotal || 0,
    discountData,
    baseCurrencyValue
  )?.message && (
    <div
      className="mt-2 p-2 rounded"
      style={{
        backgroundColor: discountData.discountEligibility
          ? "#d4edda"
          : "#fff3cd",
        border: `1px solid ${
          discountData.discountEligibility ? "#c3e6cb" : "#ffeaa7"
        }`,
        fontSize: "12px",
      }}
    >
      {
        getDynamicDiscountMessage(
          selectedCartSummary?.netTotal || summaryCost.netTotal || 0,
          discountData,
          baseCurrencyValue
        ).message
      }
    </div>
  )}


                <div className="text-center mt-3">
                  <small className="text-muted">
                    {getSelectedItemsCount()} items in {checkedCarts.length} cart(s)
                  </small>
                </div>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
)}

                      <div className="d-flex align-items-center justify-content-between mt-5 col-12 flex-wrap gap-3">
                        <Link href="/" className="btn btn-sm btn-solid">
                          Continue shopping
                        </Link>
                        <button onClick={handlePopup} className="btn btn-sm btn-solid">
                          Order now
                        </button>
                      </div>
                    </section>
                  </TabContent>
                </Col>
              </section>
            )}
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center p-5 my-5">
            <h2>Oops! something went wrong..</h2>
            <h5>
              To continue, please log in to your account. This helps us provide
              a personalized experience and keep your information secure.
            </h5>
            <Link
              href="/page/account/login-auth/"
              className="btn btn-solid btn-sm mt-4"
            >
              Login / Register
            </Link>
          </div>
        )}

        <ModalBase
          isOpen={redirectingpopup}
          size="md mt-3 p-0"
          extracss="pb-0"
          toggle={() => setredirectingpopup(false)}
        >
          <div className="d-flex flex-column align-items-center">
            <h3 style={{ fontSize: 24, marginBottom: "0px" }}>
              Discover Aahaas on the Go!
            </h3>
            <h6
              style={{
                fontSize: 12,
                textAlign: "center",
                color: "black",
                marginBottom: "10px",
                marginTop: "-5px",
              }}
            >
              Experience Seamless Service at Your Fingertips.
            </h6>
            <Media
              src={redirectingbanner.src}
              style={{
                width: "auto",
                height: "40vh",
                marginTop: "20px",
                objectFit: "cover",
              }}
            />
            <div className="d-flex flex-column col-11 mx-auto">
              <h3
                style={{
                  fontSize: 16,
                  textAlign: "center",
                  textTransform: "uppercase",
                  color: "black",
                  lineHeight: "20px",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}
              >
                Secure Checkout : Try Our App
              </h3>
              <p
                className="text-center mx-auto"
                style={{ fontSize: 10, lineHeight: "12px" }}
              >
                Enjoy the full Aahaas experience wherever you are. Our mobile
                app is designed to make your journey smoother and more
                personalized.To provide you with a more secure and seamless
                experience, we request you to complete your checkout on our
                mobile app. Our app offers advanced security features and is
                optimized for fast, reliable transactions. Please download the
                app to proceed with your purchase.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2 mt-3">
              <Media
                src={applelogo.src}
                alt="app store logo"
                style={{ width: "180px" }}
                onClick={handlleRedirectAppStore}
              />
              <Media
                src={playstorelogo.src}
                alt="play store logo"
                style={{ width: "180px" }}
                onClick={handleRedirectPlayStore}
              />
            </div>
          </div>
        </ModalBase>

        <ModalBase
          title={"Choose what summary / itinerary details you want ?"}
          isOpen={summaryScreenPopup}
          toggle={() => setSummaryScreenPopup(false)}
        >
          <div className="d-flex align-items-center flex-wrap justify-content-center">
            <button
              className="btn btn-solid py-1 px-2 mb-2 col-11"
              style={{ fontSize: 10 }}
              onClick={() => handleDownloadSummary("summary")}
            >
              Download summary
            </button>
            <button
              className="btn btn-solid py-1 px-2 mx-2 col"
              style={{ fontSize: 10 }}
              onClick={() => handleDownloadSummary("shortItenary")}
            >
              Download short itinerary
            </button>
            <button
              className="btn btn-solid py-1 px-2 mx-2 col"
              style={{ fontSize: 10 }}
              onClick={() => handleDownloadSummary("longItenary")}
            >
              Download long itinerary
            </button>
          </div>
        </ModalBase>
      </CommonLayout>
    </>
  );
};

export default CartPage;

// import Link from "next/link";
// import axios from "axios";
// import Head from "next/head";
// import React, { useState, useContext, useEffect } from "react";
// import { Col, Media, Nav, TabContent, NavItem, NavLink } from "reactstrap";

// import { AppContext } from "../../../_app";
// import {
//   getCartData,
//   getCartDataLength,
// } from "../../../../AxiosCalls/UserServices/userServices";

// import { getCurrencyInCountryFormat } from "../../../../GlobalFunctions/OthersGlobalfunctions";
// import CurrencyConverterSummaryPage from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverterSummaryPage";
// import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";

// import redirectingbanner from "../../../../public/assets/images/Bannerimages/loginScreen.png";
// import applelogo from "../../../../public/assets/images/Bannerimages/AppleLogo.png";
// import playstorelogo from "../../../../public/assets/images/Bannerimages/Playstore.png";

// import Daywise from "./daywise";
// import ServiceWise from "./serviceWise";
// import CartWise from "./cartWise";

// import CommonLayout from "../../../../components/shop/common-layout";
// import ModalBase from "../../../../components/common/Modals/ModalBase";

// import DownloadIcon from "@mui/icons-material/Download";
// import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
// import ToastMessage from "../../../../components/Notification/ToastMessage";
// import getDiscountProductBaseByPrice from "../../../product-details/common/GetDiscountProductBaseByPrice";

// const CartPage = () => {
//   const { baseCurrency, triggers, userId, userStatus, baseCurrencyValue } =
//     useContext(AppContext);

//   const [loading, setLoading] = useState(true);
//   const [redirectingpopup, setredirectingpopup] = useState(false);

//   const [cartData, setCartData] = useState([]);
//   const [cartCategories, setCartCategories] = useState([]);
//   const [cartDates, setCartDates] = useState([]);
//   const [customerMultiCarts, setCustomerMultiCarts] = useState([]);

//   const [activeTab, setActiveTab] = useState("1");
//   const [cartDataLength, setCartDataLength] = useState(0);

//   const [summaryCost, setSummaryCost] = useState({
//     netTotal: 0.0,
//     shipping: 0.0,
//     discount: 0.0,
//     grandtotal: 0.0,
//   });

//   const [discountData, setDiscountData] = useState([]);
//   const [showUtilities, setShowUtilities] = useState(false);
//   const [checkedCarts, setCheckedCarts] = useState([]);
//   const [summaryScreenPopup, setSummaryScreenPopup] = useState(false);
//   const [shippingCharges, setShippingCharges] = useState("0");

//   // notice status variable -> nsta
//   let noticeStatus = localStorage.getItem("#nsta");
//   const [noticeShown, setNoticeShown] = useState("hide");

//   const bg_colors = [
//     "#ffebee",
//     "#e3f2fd",
//     "#fff8e1",
//     "#f3e5f5",
//     "#e8f5e9",
//     "#fff3e0",
//     "#f5f5f5",
//     "#e0f7fa",
//   ];
//   const darker_colors = [
//     "#ed4242", // Dark red (given)
//     "#476e7c", // Dark blue (given)
//     "#e6b800", // Dark yellow
//     "#9c27b0", // Dark purple
//     "#2e7d32", // Dark green
//     "#f57c00", // Dark orange
//     "#757575", // Dark gray
//     "#00acc1", // Dark cyan
//   ];

//   const getUserCardDataDetails = async () => {
//     setLoading(true);
//     await getCartData(userId).then((result) => {
//       setCartData(result.cartData || []);
//       setCartCategories(result.cartCategories || []);
//       setCartDates(result.cartDates || []);
//       setCustomerMultiCarts(result.customerMultiCarts || []);

//       console.log(result.cartData, userId, "cartData sssss");
//       // CalculateAllCost(result.cartData || []);
//       // CalculateAllCost(
//       //   result.cartData.filter((item) => {
//       //     return checkedCarts.includes(item.cart_id);
//       //   }) || []
//       // );

//       //new
//       CalculateAllCost(
//         checkedCarts?.length > 0
//           ? result.cartData?.filter((item) =>
//               checkedCarts.includes(item.cart_id)
//             ) || []
//           : result.cartData || []
//       );
//     });
//     await getCartDataLength(userId).then((response) => {
//       setCartDataLength(response);
//     });
//     setLoading(false);
//   };

//   // FIXED: Improved convertToNumber function with better error handling
//   const convertToNumber = (value) => {
//     // Handle null, undefined, or empty values
//     if (value == null || value === "" || value === "NaN") {
//       return 0;
//     }

//     // If it's already a number and not NaN
//     if (typeof value === "number" && !isNaN(value)) {
//       return value;
//     }

//     // If it's a string, clean it up
//     if (typeof value === "string") {
//       // Remove single quotes, commas, and any non-numeric characters except decimal points
//       const cleanedValue = value.replace(/[',\s]/g, "");
//       const parsed = parseFloat(cleanedValue);
//       return isNaN(parsed) ? 0 : parsed;
//     }

//     // Fallback: try to convert to number
//     const parsed = Number(value);
//     return isNaN(parsed) ? 0 : parsed;
//   };

//   // FIXED: Legacy function for backward compatibility
//   const cleanAndConvertToNumber = (str) => {
//     return convertToNumber(str);
//   };

//   // FIXED: Safe currency conversion wrapper
//   const safeCurrencyConverter = (fromCurrency, amount, baseCurrencyValue) => {
//     try {
//       const result = CurrencyConverterSummaryPage(
//         fromCurrency,
//         amount,
//         baseCurrencyValue
//       );
//       return convertToNumber(result);
//     } catch (error) {
//       console.error("Currency conversion error:", error);
//       return 0;
//     }
//   };

//   const CalculateAllCost = (value) => {
//     console.log("value car load", value);
//     let totalCost = 0.0;

//     let lifestyStyleCost = 0.0;
//     let essentialTotalCost = 0.0;
//     let educationTotalCost = 0.0;
//     let hotelsTotalCost = 0.0;

//     let shippingCost = 0.0;
//     let discountCost = 0.0;
//     let newDetails = [];
//     let deliveryDates = [];

//     value.forEach((item) => {
//       if (item.main_category_id === 3 && item.maincat_type === "Lifestyle") {
//         // console.log("lifestyle item", item);
//         let lifestyAdultCost = 0.0;
//         let lifestyChildCost = 0.0;
//         let packageCost = 0.0;

//         if (item.rate_type === "Package") {
//           packageCost = safeCurrencyConverter(
//             item.lsCurrency,
//             convertToNumber(item.package_rate), // Handle null or undefined package_rate
//             baseCurrencyValue
//           );
//         } else {
//           const adultRate =
//             convertToNumber(item.adult_rate) *
//             convertToNumber(item.lifestyle_adult_count);
//           const childRate =
//             convertToNumber(item.child_rate) *
//             convertToNumber(item.nonFocChildCountLs || 0);

//           if (adultRate > 0) {
//             lifestyAdultCost = safeCurrencyConverter(
//               item.lsCurrency,
//               adultRate,
//               baseCurrencyValue
//             );
//           }
//           if (childRate > 0) {
//             lifestyChildCost = safeCurrencyConverter(
//               item.lsCurrency,
//               childRate,
//               baseCurrencyValue
//             );
//           }
//         }

//         lifestyStyleCost += lifestyAdultCost + lifestyChildCost + packageCost;

//         let discount = 0.0;
//         let discountSet = value.filter((cart) => {
//           if (cart.lsDiscountMeta) {
//             try {
//               const discountMeta = JSON.parse(cart.lsDiscountMeta);

//               if (cart.lifestyle_id === discountMeta.origin_product_id) {
//                 console.log("lifestyle item11111111111", discount);
//                 try {
//                   discount = getDiscountProductBaseByPrice(
//                     lifestyAdultCost + lifestyChildCost + packageCost,
//                     discountMeta,
//                     cart.lsCurrency
//                   )["discountRate"];
//                 } catch (error) {
//                   console.log("error in discount", error);
//                 }

//                 console.log("lifestyle item11111111111", discount);
//                 console.log("Discount Type: Percentage", discount);
//               }
//               return;
//             } catch (error) {
//               return false;
//             }
//           }
//           return false;
//         });
//         discountCost += parseFloat(discount);
//         console.log("discountSet 1233333", discountCost);
//         // console.log("lifestyStyleCost", lifestyStyleCost);
//       } else if (
//         (item.main_category_id === 1 && item.maincat_type === "Essential") ||
//         (item.main_category_id === 2 && item.maincat_type === "Non Essential")
//       ) {
//         let essentialCost = safeCurrencyConverter(
//           item.esCurrency,
//           convertToNumber(item.mrp) * convertToNumber(item.quantity),
//           baseCurrencyValue
//         );
//         let shipping = safeCurrencyConverter(
//           item.DeliveryCurrency,
//           convertToNumber(item.deliveryRate),
//           baseCurrencyValue
//         );

//         if (!deliveryDates.includes(item.order_preffered_date)) {
//           deliveryDates.push(item.order_preffered_date);
//           let more = {
//             name: item.listing_title,
//             shippingCost: item.deliveryRate,
//             currency: item.esCurrency,
//           };
//           shippingCost += shipping;
//           newDetails.push(more);
//         }

//         essentialTotalCost += essentialCost;
//       } else if (
//         item.main_category_id === 5 &&
//         item.maincat_type === "Education"
//       ) {
//         let educationAdultCost = safeCurrencyConverter(
//           item.eCurrency,
//           convertToNumber(item.adult_course_fee),
//           baseCurrencyValue
//         );
//         let educationChildCost = safeCurrencyConverter(
//           item.eCurrency,
//           convertToNumber(item.child_course_fee),
//           baseCurrencyValue
//         );

//         if (item.student_type === "Adult") {
//           educationTotalCost += educationAdultCost;
//         } else {
//           educationTotalCost += educationChildCost;
//         }
//       } else if (
//         item.main_category_id === 4 &&
//         item.maincat_type === "Hotels"
//       ) {
//         // try {
//         //   let reformatted = JSON.parse(item.bookingdataset);
//         //   let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
//         //   console.log(reformattedDiscount, "reformattedDiscount");
//         //   console.log(reformatted, "reformatted");

//         //   let hotelsCost = 0.00

//         //   if( reformattedDiscount?.amount) {

//         //    const discountFroProducts = getDiscountProductBaseByPrice(convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),reformattedDiscount,reformatted?.hotelRatesRequest?.Price?.CurrencyCode)["discountRate"]
//         //    discountCost += Number(discountFroProducts)
//         //    console.log(discountCost, "hotelDiscount discountCost");
//         //   }
//         //     hotelsCost = safeCurrencyConverter(
//         //     reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//         //     convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),
//         //     baseCurrencyValue
//         //   );

//         //   console.log(hotelsCost, "hotelCost issss chmodified");

//         //   hotelsTotalCost += hotelsCost;
//         // } catch (error) {
//         //   console.error("Error parsing hotel booking data:", error);
//         // }

//         // Fixed hotel discount calculation with proper currency conversion
//         try {
//           let reformatted = JSON.parse(item.bookingdataset);
//           let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
//           // console.log(reformattedDiscount, "reformattedDiscount");
//           // console.log(reformatted, "reformatted");

//           let hotelsCost = 0.0;

//           if (reformattedDiscount?.amount) {
//             // Get the discount amount in the original hotel currency
//             const discountResult = getDiscountProductBaseByPrice(
//               convertToNumber(
//                 reformatted?.hotelRatesRequest?.Price?.PublishedPrice
//               ),
//               reformattedDiscount,
//               reformatted?.hotelRatesRequest?.Price?.CurrencyCode
//             );

//             const discountAmountInOriginalCurrency =
//               discountResult["discountRate"];

//             // Convert the discount amount to base currency
//             const discountAmountInBaseCurrency = safeCurrencyConverter(
//               reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//               convertToNumber(discountAmountInOriginalCurrency),
//               baseCurrencyValue
//             );

//             // Add the converted discount amount to total discount
//             discountCost += discountAmountInBaseCurrency;
//             // console.log(
//             //   discountAmountInBaseCurrency,
//             //   "hotelDiscount in base currency"
//             // );
//             // console.log(discountCost, "total discountCost");
//           }

//           // Convert hotel cost to base currency
//           hotelsCost = safeCurrencyConverter(
//             reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//             convertToNumber(
//               reformatted?.hotelRatesRequest?.Price?.PublishedPrice
//             ),
//             baseCurrencyValue
//           );

//           // console.log(hotelsCost, "hotelCost in base currency");

//           hotelsTotalCost += hotelsCost;
//         } catch (error) {
//           console.error("Error parsing hotel booking data:", error);
//         }
//       }
//     });

//     totalCost =
//       lifestyStyleCost +
//       educationTotalCost +
//       essentialTotalCost +
//       hotelsTotalCost;

//     setSummaryCost({
//       netTotal: totalCost,
//       shipping: shippingCost,
//       discount: discountCost || 0.0,
//       // grandtotal: totalCost - discountCost + shippingCost
//       grandtotal: totalCost - discountCost + shippingCost,
//     });
//   };

//   // FIXED: Updated useEffect with better error handling
//   useEffect(() => {
//     const grandTotal = convertToNumber(summaryCost?.grandtotal);
//     if (grandTotal > 0) {
//       fetchDiscount(grandTotal);
//     }
//     // console.log("summaryCost.grandtotal", grandTotal);
//   }, [summaryCost]);

//   // FIXED: Updated fetchDiscount function with better error handling
//   const fetchDiscount = async (grandTotal) => {
//     try {
//       const safeGrandTotal = convertToNumber(grandTotal);

//       const data = {
//         grand_total: safeGrandTotal,
//         currency: baseCurrencyValue?.base || "USD",
//         userId: userId,
//       };

//       // console.log(data, "Grand Total value issss");
//       setDiscountData({});

//       const response = await axios.post(
//         "get-price-based-discounts-to-cart/10",
//         data
//       );

//       console.log(response, "Grand Total value issss 123444");

//       if (response.data.status === 200) {
//         setDiscountData(response.data.cartAvailableDiscount?.[0] || {});
//         console.log(response.data.cartAvailableDiscount?.[0], "discountData");
//       }
//     } catch (err) {
//       console.error("Error fetching discount:", err);
//       setDiscountData({});
//     } finally {
//       // setDiscountPricingLoading(false);
//     }
//   };

//   // FIXED: Improved getPriceBasedDiscountAmount function
//   const getPriceBasedDiscountAmount = (
//     totalAmount,
//     currencyData,
//     discountData
//   ) => {
//     // console.log(
//     //   totalAmount,
//     //   currencyData,
//     //   discountData,
//     //   "discountAmount234234234qwwe"
//     // );

//     // Handle case where discount data is invalid or user not eligible
//     if (
//       !discountData ||
//       Object.keys(discountData).length === 0 ||
//       discountData?.discountEligibility === false
//     ) {
//       const safeTotalAmount = convertToNumber(totalAmount);
//       return {
//         discountAmount: 0,
//         finalAmount: safeTotalAmount,
//         totalAmount: safeTotalAmount,
//       };
//     }

//     const {
//       amount_type = "fixed",
//       price_currency = "USD",
//       discounted_amount = "0",
//     } = discountData;

//     let discountAmount = 0;
//     const safeTotalAmount = convertToNumber(totalAmount);

//     console.log(
//       discounted_amount,
//       price_currency,
//       amount_type,
//       "discounted_amount"
//     );

//     if (amount_type === "percentage") {
//       const percentageValue = convertToNumber(discounted_amount);
//       discountAmount = (safeTotalAmount * percentageValue) / 100;
//     } else {
//       // For fixed amount, convert to base currency
//       discountAmount = safeCurrencyConverter(
//         discountData?.price_currency,
//         convertToNumber(discountData?.discounted_amount),
//         baseCurrencyValue
//       );
//     }

//     // Ensure discount doesn't exceed total amount
//     discountAmount = Math.min(discountAmount, safeTotalAmount);

//     const finalAmount = Math.max(0, safeTotalAmount - discountAmount);

//     console.log("discountAmount221131", finalAmount);

//     return {
//       discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
//       finalAmount: isNaN(finalAmount) ? safeTotalAmount : finalAmount,
//       totalAmount: safeTotalAmount,
//     };
//   };

//   // FIXED: Updated getDynamicDiscountMessage function with better error handling
//   const getDynamicDiscountMessage = (
//     currentTotal,
//     discountData,
//     baseCurrencyValue
//   ) => {
//     if (!discountData || Object.keys(discountData).length === 0) {
//       return null;
//     }

//     const {
//       condition_start_value,
//       condition_end_value,
//       discounted_amount,
//       price_currency,
//       condition_currency,
//       discountEligibility,
//       amount_type = "fixed",
//     } = discountData;

//     // Safely convert condition values to base currency
//     let minSpendInBaseCurrency = 0;
//     let maxSpendInBaseCurrency = null;

//     try {
//       minSpendInBaseCurrency = safeCurrencyConverter(
//         condition_currency,
//         convertToNumber(condition_start_value),
//         baseCurrencyValue
//       );

//       if (condition_end_value) {
//         maxSpendInBaseCurrency = safeCurrencyConverter(
//           condition_currency,
//           convertToNumber(condition_end_value),
//           baseCurrencyValue
//         );
//       }
//     } catch (error) {
//       console.error("Currency conversion error:", error);
//       return null;
//     }

//     // Clean and convert current total to number for comparison
//     const cleanCurrentTotal = convertToNumber(currentTotal);
//     const cleanMinSpend = convertToNumber(minSpendInBaseCurrency);

//     // Function to format discount display based on amount_type
//     const formatDiscountDisplay = () => {
//       if (amount_type === "percentage") {
//         const percentage = convertToNumber(discounted_amount);
//         return `${percentage}% off`;
//       } else {
//         // For fixed amount, convert to base currency
//         const discountAmountInBaseCurrency = safeCurrencyConverter(
//           price_currency,
//           convertToNumber(discounted_amount),
//           baseCurrencyValue
//         );

//         return `${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
//           baseCurrencyValue.base,
//           discountAmountInBaseCurrency.toFixed(2)
//         )} off`;
//       }
//     };

//     // Check if user has already qualified for discount
//     if (cleanCurrentTotal >= cleanMinSpend) {
//       if (maxSpendInBaseCurrency) {
//         const cleanMaxSpend = convertToNumber(maxSpendInBaseCurrency);

//         // Check if within range
//         if (cleanCurrentTotal <= cleanMaxSpend) {
//           return {
//             type: "qualified",
//             message: `🎉 You got ${formatDiscountDisplay()}!`,
//             isEligible: true,
//           };
//         } else {
//           return {
//             type: "exceeded",
//             message: `You've exceeded the maximum spend limit for this discount.`,
//             isEligible: false,
//           };
//         }
//       } else {
//         return {
//           type: "qualified",
//           message: `🎉 You got ${formatDiscountDisplay()}!`,
//           isEligible: true,
//         };
//       }
//     } else {
//       // Calculate how much more they need to spend
//       const amountToSpend = cleanMinSpend - cleanCurrentTotal;
//       return {
//         type: "need_more",
//         message: `Spend ${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
//           baseCurrencyValue.base,
//           Math.max(0, amountToSpend).toFixed(2)
//         )} more and grab ${formatDiscountDisplay()}`,
//         isEligible: false,
//         amountNeeded: Math.max(0, amountToSpend),
//       };
//     }
//   };

//   // FIXED: Safe currency formatting helper
//   const safeCurrencyFormat = (currency, amount) => {
//     const safeAmount = convertToNumber(amount);
//     if (safeAmount === 0 || isNaN(safeAmount)) {
//       return "0.00";
//     }
//     return getCurrencyInCountryFormat(currency, safeAmount.toFixed(2));
//   };

//   const handlePopup = () => {
//     setredirectingpopup(true);
//   };

//   const handleRedirectPlayStore = () => {
//     window.open(
//       `https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share`,
//       "_blank"
//     );
//   };

//   const handlleRedirectAppStore = () => {
//     window.open(`https://apps.apple.com/lk/app/aahaas/id6450589764`, "_blank");
//   };

//   useEffect(() => {
//     //   setCheckedCarts([]);
//     // setSummaryCost({
//     //      netTotal: 0.0,
//     //   shipping: 0.0,
//     //   discount: 0.0,
//     //   grandtotal: 0.0,
//     // })
//     // setCheckedCarts([]);
//     // setShowUtilities(!showUtilities)
//     getUserCardDataDetails();
//   }, [triggers, baseCurrencyValue]);
//   // }, [triggers, baseCurrencyValue]);

//   const handleSetNoticeHide = () => {
//     setNoticeShown("hide");
//     localStorage.setItem("#nsta", "hide");
//   };

//   const handleCheckCarts = (cart) => {
//     setCheckedCarts((prevCheckedCarts) => {
//       if (prevCheckedCarts.includes(cart.cart_id)) {
//         return prevCheckedCarts.filter(
//           (checkedCart) => checkedCart !== cart.cart_id
//         );
//       }
//       return [...prevCheckedCarts, cart.cart_id];
//     });
//   };

//   const handleSummaryScreenPopup = () => {
//     if (checkedCarts.length === 0) {
//       ToastMessage({
//         status: "error",
//         message:
//           "Kindly choose at least one cart to generate summary or itinerary",
//       });
//     } else {
//       setSummaryScreenPopup(true);
//     }
//   };

//   const handleDownloadSummary = async (data) => {
//     console.log("handleDownloadSummary", data);
//     const postData = `currency=${baseCurrency}&shipping=${convertToNumber(
//       summaryCost.shipping
//     ).toFixed(2)}&`;
//     const cartIds = [];
//     checkedCarts.map((value, key) => {
//       cartIds.push(`cartIds[${key}]=${value}`);
//     });

//     const discountAmount =
//       getPriceBasedDiscountAmount(
//         safeCurrencyFormat(baseCurrencyValue.base, summaryCost.grandtotal),
//         baseCurrencyValue,
//         discountData
//       )?.discountAmount + summaryCost.discount || 0;

//     console.log("discountAmount", discountAmount);

//     let final = cartIds.join("&");
//     // Ensure discountAmount and shippingCharges are valid numbers, default to 0 if null/NaN
//     const safeDiscountAmount = convertToNumber(discountAmount);
//     const safeShippingCharges = convertToNumber(shippingCharges);

//     let summaryLink = postData
//       .concat(final)
//       .concat(
//         `&price_discount=${safeDiscountAmount}&shipping_charges=${safeShippingCharges}`
//       );
//     setSummaryScreenPopup(false);

//     console.log(shippingCharges, "cartIds isssssssssss", discountAmount);
//     console.log(summaryLink, "summaryLink");

//     if (data === "summary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-summary/pdf?${summaryLink}`,
//         "_blank"
//       );
//     } else if (data === "shortItenary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-itinerary/short/pdf?${final}`,
//         "_blank"
//       );
//     } else if (data === "longItenary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-itinerary/long/pdf?${final}`,
//         "_blank"
//       );
//     }
//   };

//   useEffect(() => {
//     setShippingCharges(convertToNumber(summaryCost.shipping).toFixed(2));
//   }, [summaryCost.shipping]);

//   useEffect(() => {
//     console.log(checkedCarts, baseCurrencyValue, "111111 Carttttt 12312312312");
//     if (checkedCarts.length === 0) {
//       setSummaryCost({
//         netTotal: 0.0,
//         shipping: 0.0,
//         discount: 0.0,
//         grandtotal: 0.0,
//       });
//       // console.log("Calculate All Costttttxx");
//       CalculateAllCost([]);
//     } else {
//       if (!showUtilities) {
//         CalculateAllCost(cartData);
//       } else {
//         let filtered = cartData.filter((item) => {
//           return checkedCarts.includes(item.cart_id);
//         });
//         CalculateAllCost(filtered);
//       }
//     }
//   }, [checkedCarts, showUtilities, baseCurrencyValue, triggers]);

//   return (
//     <>
//       <Head>
//         <title>Aahaas - Carts</title>
//       </Head>

//       <CommonLayout
//         parent="home"
//         title="cart"
//         showMenuIcon={false}
//         showSearchIcon={false}
//       >
//         {userStatus.userLoggesIn ? (
//           <div className="container">
//             {loading ? (
//               <section className="tab-product m-0 my-lg-5 px-5">
//                 <div className="d-flex flex-column align-items-center">
//                   <h5>Fetching your products ...</h5>
//                   <h5>Please wait !</h5>
//                 </div>
//               </section>
//             ) : cartDataLength == 0 ? (
//               <section className="tab-product m-0 my-5 px-5">
//                 <div className="d-flex flex-column align-items-center">
//                   <h5>Your Cart is Empty ...</h5>
//                   <h5>Explore more shortlist some items.</h5>
//                 </div>
//               </section>
//             ) : (
//               <section className="tab-product m-0 mb-5 px-lg-5 px-sm-0">
//                 <Col sm="12" lg="12" md="12">
//                   <Nav
//                     tabs
//                     className="nav-material testing d-flex align-items-center justify-content-start mb-3"
//                   >
//                     <NavItem
//                       className="nav nav-tabs utilities-tab mx-2 me-2 rounded-5"
//                       style={{
//                         backgroundColor: showUtilities
//                           ? "rgba(211, 211, 211, 0.3)"
//                           : "",
//                       }}
//                       id="myTab"
//                       role="tablist"
//                       onClick={() => setShowUtilities(!showUtilities)}
//                     >
//                       <AutoFixHighOutlinedIcon
//                         sx={{ padding: "1px", fontSize: "18px" }}
//                       />
//                       Download Summary and Itinerary
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "1" ? "active" : ""}
//                         onClick={() => setActiveTab("1")}
//                       >
//                         Day wise
//                       </NavLink>
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "2" ? "active" : ""}
//                         onClick={() => setActiveTab("2")}
//                       >
//                         Service wise
//                       </NavLink>
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "3" ? "active" : ""}
//                         onClick={() => setActiveTab("3")}
//                       >
//                         Cart wise
//                       </NavLink>
//                     </NavItem>
//                     <div className={`cart-notice-${noticeShown}`}>
//                       <div className="d-flex flex-column">
//                         <h6>itinerary / summary document generation</h6>
//                         <p>
//                           Discover our AI-powered itinerary generation
//                           service—designed to make your journey effortless and
//                           personalized. Simply select the key details you want
//                           included, and our system will craft a stylish and
//                           tailored summary for your upcoming trip. Let us turn
//                           your service date into a seamless travel experience!
//                         </p>
//                         <button
//                           onClick={handleSetNoticeHide}
//                           className="btn btn-solid py-1 px-2 rounded-3 col-4 mx-auto"
//                         >
//                           Got it !
//                         </button>
//                       </div>
//                     </div>
//                   </Nav>

//                   {/* Mobile Utilities Toggle Button */}
//                   <div className="d-md-none mb-3">
//                     <button
//                       className="btn btn-outline-primary w-100"
//                       style={{
//                         backgroundColor: showUtilities ? "rgba(13, 110, 253, 0.1)" : "",
//                         borderColor: showUtilities ? "#0d6efd" : "#6c757d",
//                         color: showUtilities ? "#0d6efd" : "#6c757d"
//                       }}
//                       onClick={() => setShowUtilities(!showUtilities)}
//                     >
//                       <AutoFixHighOutlinedIcon
//                         sx={{ padding: "1px", fontSize: "18px", marginRight: "8px" }}
//                       />
//                       {showUtilities ? 'Hide' : 'Show'} Cart Selection & Download
//                     </button>
//                   </div>

//                   <TabContent activeTab={activeTab} className="nav-material">
//                     <section className="col-12 row mt-4 m-0 p-0">
//                       <div className={`col-lg-${checkedCarts?.length > 0 ? 8 : 12} col-sm-12`}>
//                         <div
//                           className={`cartWise-carts-container mb-5  d-${
//                             showUtilities ? "" : "none"
//                           } `}
//                         >
//                           <div
//                             className="summary-download-button"
//                             style={{
//                               cursor: "pointer",
//                               backgroundColor:
//                                 checkedCarts.length === 0 ? "lightgray" : "",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => handleSummaryScreenPopup()}
//                           >
//                             <DownloadIcon />
//                             <label className="mx-2">Download</label>
//                           </div>
//                           <div
//                             className="cart-details-summary"
//                             style={{
//                               display: "flex",
//                               overflowX: "auto",
//                               overflowY: "hidden",
//                               whiteSpace: "nowrap",
//                               gap: "10px",
//                               paddingBottom: "5px",
//                               scrollbarWidth: "thin", // For Firefox
//                               scrollbarColor: "#ccc transparent", // For Firefox
//                             }}
//                           >
//                             {customerMultiCarts.map((cart, index) => (
//                               <div
//                                 key={index}
//                                 className="d-flex align-items-center"
//                                 onClick={() => handleCheckCarts(cart)}
//                                 style={{
//                                   backgroundColor: bg_colors[index % 8],
//                                   color: darker_colors[index % 8],
//                                 }}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   className="form-check-input"
//                                   checked={checkedCarts.includes(cart.cart_id)}
//                                 />
//                                 <label
//                                   className="form-check-label m-0 mx-2 p-0"
//                                   style={{ textTransform: "capitalize" }}
//                                 >
//                                   {cart.cart_title}
//                                 </label>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         <table className="col-12 m-0 p-0">
//                           <thead className="cart-page-heading">
//                             {activeTab === "1" ? (
//                               <Daywise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartDates={cartDates}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={false}
//                               />
//                             ) : activeTab === "2" ? (
//                               <ServiceWise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartCategories={cartCategories}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={false}
//                               />
//                             ) : activeTab === "3" ? (
//                               <CartWise
//                                 customerMultiCarts={customerMultiCarts}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 cartCategories={cartCategories}
//                               />
//                             ) : null}
//                           </thead>
//                           <thead className="cart-page-heading-mobile-view">
//                             {/* Mobile Cart Selection Utilities */}
//                             <tr className={`d-md-none ${showUtilities ? '' : 'd-none'}`}>
//                               <td colSpan="5" className="p-3">
//                                 <div className="cart-selection-mobile">
//                                   <div
//                                     className="summary-download-button mb-3"
//                                     style={{
//                                       cursor: "pointer",
//                                       backgroundColor:
//                                         checkedCarts.length === 0 ? "lightgray" : "",
//                                       padding: "12px",
//                                       borderRadius: "8px",
//                                       textAlign: "center",
//                                       border: "1px solid #ddd"
//                                     }}
//                                     onClick={() => handleSummaryScreenPopup()}
//                                   >
//                                     <DownloadIcon />
//                                     <label className="mx-2">Download</label>
//                                   </div>
                                  
//                                   <div className="mobile-cart-selection">
//                                     <h6 className="mb-3">Select Carts:</h6>
//                                     <div className="cart-selection-grid">
//                                       {customerMultiCarts.map((cart, index) => (
//                                         <div
//                                           key={index}
//                                           className="cart-selection-item mb-2 p-2 rounded"
//                                           onClick={() => handleCheckCarts(cart)}
//                                           style={{
//                                             backgroundColor: bg_colors[index % 8],
//                                             color: darker_colors[index % 8],
//                                             border: checkedCarts.includes(cart.cart_id) 
//                                               ? `2px solid ${darker_colors[index % 8]}` 
//                                               : "1px solid transparent",
//                                             cursor: "pointer"
//                                           }}
//                                         >
//                                           <div className="d-flex align-items-center">
//                                             <input
//                                               type="checkbox"
//                                               className="form-check-input me-2"
//                                               checked={checkedCarts.includes(cart.cart_id)}
//                                               readOnly
//                                             />
//                                             <label 
//                                               className="form-check-label m-0 p-0" 
//                                               style={{ textTransform: 'capitalize', fontSize: '14px' }}
//                                             >
//                                               {cart.cart_title}
//                                             </label>
//                                           </div>
//                                         </div>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
                            
//                             {activeTab === "1" ? (
//                               <Daywise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartDates={cartDates}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={true}
//                               />
//                             ) : activeTab === "2" ? (
//                               <ServiceWise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartCategories={cartCategories}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={true}
//                               />
//                             ) : activeTab === "3" ? (
//                               <CartWise
//                                 customerMultiCarts={customerMultiCarts}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 cartCategories={cartCategories}
//                                 mobileView={true}
//                               />
//                             ) : null}
//                           </thead>
//                         </table>
//                       </div>

//                       {/* FIXED ORDER DETAILS SECTION */}

//                       {checkedCarts?.length>0?
//                          <div
//                         className="col-lg-4 col-sm-12 p-lg-5 mt-5 my-lg-0"
//                         style={{
//                           backgroundColor: "#f9f9f9",
//                           height: "fit-content",
//                         }}
//                       >
//                         <div className="py-4">
//                           <table className="col-12 m-0">
//                             <thead>
//                               <tr>
//                                 <th
//                                   className="p-4 pb-0 pl-0"
//                                   style={{
//                                     borderTopLeftRadius: "8px",
//                                     borderTopRightRadius: "8px",
//                                     backgroundColor: "#476e7c",
//                                     color: "white",
//                                   }}
//                                 >
//                                   <h4 className="fs-3 fw-bold">
//                                     Order details
//                                   </h4>
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               <tr>
//                                 <td>
//                                   <ul className="sub-total p-4 pt-3">
//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between"
//                                     >
//                                       Total Price{" "}
//                                       <span className="count">
//                                         {/* {baseCurrencyValue.base}{" "} */}
//                                         {CurrencyConverter(
//                                           baseCurrencyValue.base,
//                                           summaryCost.netTotal,
//                                           baseCurrencyValue
//                                         )}{" "}
//                                       </span>
//                                     </h5>

//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between"
//                                     >
//                                       Shipping Charges
//                                       <span className="count">
//                                         {baseCurrencyValue.base}{" "}
//                                         {safeCurrencyFormat(
//                                           baseCurrencyValue.base,
//                                           summaryCost.shipping
//                                         )}{" "}
//                                       </span>
//                                     </h5>
//                                     <hr />

//                                     {/* Only show discount section if Net Total is greater than 0 */}
//                                     {((discountData?.condition_currency &&
//                                       summaryCost.netTotal > 0) ||
//                                       summaryCost.discount > 0) && (
//                                       <>
//                                         {/* <h5
//                                           style={{ fontSize: 15 }}
//                                           className="d-flex justify-content-between border-bottom pb-3"
//                                         >
//                                           Net Total{" "}
//                                           <span className="count">
//                                             {baseCurrencyValue.base}{" "}
//                                             {(() => {
//                                               const result = getPriceBasedDiscountAmount(
//                                                 safeCurrencyFormat(
//                                                   baseCurrencyValue.base,
//                                                   summaryCost.grandtotal
//                                                 ),
//                                                 baseCurrencyValue,
//                                                 discountData
//                                               );
//                                               return safeCurrencyFormat(baseCurrencyValue.base, result?.totalAmount || 0);
//                                             })()}{" "}
//                                           </span>
//                                         </h5> */}

//                                         {/* Only show discount row if user qualifies */}
//                                         {(() => {
//                                           // If there's a stored discount amount from cart calculations
//                                           if (summaryCost.discount > 0) {
//                                             return (
//                                               <h5
//                                                 style={{ fontSize: 15 }}
//                                                 className="d-flex justify-content-between border-bottom pb-3"
//                                               >
//                                                 Discount{" "}
//                                                 <span className="count">
//                                                   -{baseCurrencyValue.base}{" "}
//                                                   {safeCurrencyFormat(
//                                                     baseCurrencyValue.base,
//                                                     summaryCost.discount
//                                                   )}{" "}
//                                                 </span>
//                                               </h5>
//                                             );
//                                           }

//                                           // Check for dynamic discount message from API
//                                           const discountMessage =
//                                             getDynamicDiscountMessage(
//                                               summaryCost.netTotal,
//                                               discountData,
//                                               baseCurrencyValue
//                                             );

//                                           if (
//                                             discountMessage?.type ===
//                                             "qualified"
//                                           ) {
//                                             const discountAmount =
//                                               getPriceBasedDiscountAmount(
//                                                 safeCurrencyFormat(
//                                                   baseCurrencyValue.base,
//                                                   summaryCost.grandtotal
//                                                 ),
//                                                 baseCurrencyValue,
//                                                 discountData
//                                               )?.discountAmount || 0;

//                                             return (
//                                               <h5
//                                                 style={{ fontSize: 15 }}
//                                                 className="d-flex justify-content-between border-bottom pb-3"
//                                               >
//                                                 Discount{" "}
//                                                 <span className="count">
//                                                   -{baseCurrencyValue.base}{" "}
//                                                   {safeCurrencyFormat(
//                                                     baseCurrencyValue.base,
//                                                     discountAmount
//                                                   )}{" "}
//                                                 </span>
//                                               </h5>
//                                             );
//                                           }
//                                           return null;
//                                         })()}
//                                       </>
//                                     )}

//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between border-bottom pb-3"
//                                     >
//                                       Grand Total{" "}
//                                       <span className="count">
//                                         {baseCurrencyValue.base}{" "}
//                                         {/* Use conditional logic to determine whether to apply discount */}
//                                         {(() => {
//                                           if (summaryCost.netTotal <= 0) {
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               summaryCost.grandtotal
//                                             );
//                                           }

//                                           const discountMessage =
//                                             getDynamicDiscountMessage(
//                                               summaryCost.netTotal,
//                                               discountData,
//                                               baseCurrencyValue
//                                             );

//                                           if (
//                                             discountMessage?.type ===
//                                             "qualified"
//                                           ) {
//                                             const result =
//                                               getPriceBasedDiscountAmount(
//                                                 safeCurrencyFormat(
//                                                   baseCurrencyValue.base,
//                                                   summaryCost.grandtotal
//                                                 ),
//                                                 baseCurrencyValue,
//                                                 discountData
//                                               );
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               result?.finalAmount || 0
//                                             );
//                                           } else {
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               summaryCost.grandtotal
//                                             );
//                                           }
//                                         })()}{" "}
//                                       </span>
//                                     </h5>

//                                     {/* Dynamic discount messaging */}
//                                     {(() => {
//                                       if (summaryCost.netTotal <= 0)
//                                         return null;

//                                       const discountMessage =
//                                         getDynamicDiscountMessage(
//                                           summaryCost.netTotal,
//                                           discountData,
//                                           baseCurrencyValue
//                                         );

//                                       if (!discountMessage) return null;

//                                       return (
//                                         <h5
//                                           style={{ fontSize: 15 }}
//                                           className="d-flex justify-content-between"
//                                         >
//                                           <div>
//                                             <span
//                                               style={{
//                                                 color:
//                                                   discountMessage.type ===
//                                                   "qualified"
//                                                     ? "#28a745"
//                                                     : "#ff6b35",
//                                                 display: "inline-flex",
//                                                 alignItems: "center",
//                                                 padding: "4px 8px",
//                                                 backgroundColor:
//                                                   discountMessage.type ===
//                                                   "qualified"
//                                                     ? "#e9f7ed"
//                                                     : "#fff3e0",
//                                                 borderRadius: "4px",
//                                                 fontSize: "0.775rem",
//                                                 fontWeight: "500",
//                                                 marginBottom: "8px",
//                                               }}
//                                             >
//                                               {discountMessage.type ===
//                                               "qualified" ? (
//                                                 <svg
//                                                   style={{
//                                                     marginRight: "6px",
//                                                     width: "20px",
//                                                     height: "20px",
//                                                     fill: "currentColor",
//                                                   }}
//                                                   viewBox="0 0 24 24"
//                                                 >
//                                                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
//                                                 </svg>
//                                               ) : (
//                                                 <svg
//                                                   style={{
//                                                     marginRight: "6px",
//                                                     width: "20px",
//                                                     height: "20px",
//                                                     fill: "currentColor",
//                                                   }}
//                                                   viewBox="0 0 24 24"
//                                                 >
//                                                   <path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.05-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
//                                                 </svg>
//                                               )}
//                                               {discountMessage.message}
//                                             </span>
//                                           </div>
//                                         </h5>
//                                       );
//                                     })()}
//                                   </ul>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>
//                       :
//                       null
                    
//                     }
                   

//                       <div className="d-flex align-items-center justify-content-between mt-5 col-12 flex-wrap gap-3">
//                         <Link href="/" className="btn btn-sm btn-solid">
//                           Continue shopping
//                         </Link>
//                         <button
//                           onClick={handlePopup}
//                           className="btn btn-sm btn-solid"
//                         >
//                           Order now
//                         </button>
//                       </div>
//                     </section>
//                   </TabContent>
//                 </Col>
//               </section>
//             )}
//           </div>
//         ) : (
//           <div className="d-flex flex-column align-items-center justify-content-center p-5 my-5">
//             <h2>Oops! something went wrong..</h2>
//             <h5>
//               To continue, please log in to your account. This helps us provide
//               a personalized experience and keep your information secure.
//             </h5>
//             <Link
//               href="/page/account/login-auth/"
//               className="btn btn-solid btn-sm mt-4"
//             >
//               Login / Register
//             </Link>
//           </div>
//         )}

//         <ModalBase
//           isOpen={redirectingpopup}
//           size="md mt-3 p-0"
//           extracss="pb-0"
//           toggle={() => setredirectingpopup(false)}
//         >
//           <div className="d-flex flex-column align-items-center">
//             <h3 style={{ fontSize: 24, marginBottom: "0px" }}>
//               Discover Aahaas on the Go!
//             </h3>
//             <h6
//               style={{
//                 fontSize: 12,
//                 textAlign: "center",
//                 color: "black",
//                 marginBottom: "10px",
//                 marginTop: "-5px",
//               }}
//             >
//               Experience Seamless Service at Your Fingertips.
//             </h6>
//             <Media
//               src={redirectingbanner.src}
//               style={{
//                 width: "auto",
//                 height: "40vh",
//                 marginTop: "20px",
//                 objectFit: "cover",
//               }}
//             />
//             <div className="d-flex flex-column col-11 mx-auto">
//               <h3
//                 style={{
//                   fontSize: 16,
//                   textAlign: "center",
//                   textTransform: "uppercase",
//                   color: "black",
//                   lineHeight: "20px",
//                   marginBottom: "6px",
//                   fontWeight: "bold",
//                 }}
//               >
//                 Secure Checkout : Try Our App
//               </h3>
//               <p
//                 className="text-center mx-auto"
//                 style={{ fontSize: 10, lineHeight: "12px" }}
//               >
//                 Enjoy the full Aahaas experience wherever you are. Our mobile
//                 app is designed to make your journey smoother and more
//                 personalized.To provide you with a more secure and seamless
//                 experience, we request you to complete your checkout on our
//                 mobile app. Our app offers advanced security features and is
//                 optimized for fast, reliable transactions. Please download the
//                 app to proceed with your purchase.
//               </p>
//             </div>
//             <div className="d-flex align-items-center gap-2 mt-3">
//               <Media
//                 src={applelogo.src}
//                 alt="app store logo"
//                 style={{ width: "180px" }}
//                 onClick={handlleRedirectAppStore}
//               />
//               <Media
//                 src={playstorelogo.src}
//                 alt="play store logo"
//                 style={{ width: "180px" }}
//                 onClick={handleRedirectPlayStore}
//               />
//             </div>
//           </div>
//         </ModalBase>

//         <ModalBase
//           title={"Choose what summary / itinerary details you want ?"}
//           isOpen={summaryScreenPopup}
//           toggle={() => setSummaryScreenPopup(false)}
//         >
//           <div className="d-flex align-items-center flex-wrap justify-content-center">
//             <button
//               className="btn btn-solid py-1 px-2 mb-2 col-11"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("summary")}
//             >
//               Download summary
//             </button>
//             <button
//               className="btn btn-solid py-1 px-2 mx-2 col"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("shortItenary")}
//             >
//               Download short itinerary
//             </button>
//             <button
//               className="btn btn-solid py-1 px-2 mx-2 col"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("longItenary")}
//             >
//               Download long itinerary
//             </button>
//           </div>
//         </ModalBase>
//       </CommonLayout>
//     </>
//   );
// };

// export default CartPage;

// import Link from "next/link";
// import axios from "axios";
// import Head from "next/head";
// import React, { useState, useContext, useEffect } from "react";
// import { Col, Media, Nav, TabContent, NavItem, NavLink } from "reactstrap";

// import { AppContext } from "../../../_app";
// import {
//   getCartData,
//   getCartDataLength,
// } from "../../../../AxiosCalls/UserServices/userServices";

// import { getCurrencyInCountryFormat } from "../../../../GlobalFunctions/OthersGlobalfunctions";
// import CurrencyConverterSummaryPage from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverterSummaryPage";
// import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";

// import redirectingbanner from "../../../../public/assets/images/Bannerimages/loginScreen.png";
// import applelogo from "../../../../public/assets/images/Bannerimages/AppleLogo.png";
// import playstorelogo from "../../../../public/assets/images/Bannerimages/Playstore.png";

// import Daywise from "./daywise";
// import ServiceWise from "./serviceWise";
// import CartWise from "./cartWise";

// import CommonLayout from "../../../../components/shop/common-layout";
// import ModalBase from "../../../../components/common/Modals/ModalBase";

// import DownloadIcon from "@mui/icons-material/Download";
// import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
// import ToastMessage from "../../../../components/Notification/ToastMessage";
// import getDiscountProductBaseByPrice from "../../../product-details/common/GetDiscountProductBaseByPrice";

// const CartPage = () => {
//   const { baseCurrency, triggers, userId, userStatus, baseCurrencyValue } =
//     useContext(AppContext);

//   const [loading, setLoading] = useState(true);
//   const [redirectingpopup, setredirectingpopup] = useState(false);

//   const [cartData, setCartData] = useState([]);
//   const [cartCategories, setCartCategories] = useState([]);
//   const [cartDates, setCartDates] = useState([]);
//   const [customerMultiCarts, setCustomerMultiCarts] = useState([]);

//   const [activeTab, setActiveTab] = useState("1");
//   const [cartDataLength, setCartDataLength] = useState(0);

//   const [summaryCost, setSummaryCost] = useState({
//     netTotal: 0.0,
//     shipping: 0.0,
//     discount: 0.0,
//     grandtotal: 0.0,
//   });

//   const [discountData, setDiscountData] = useState([]);
//   const [showUtilities, setShowUtilities] = useState(false);
//   const [checkedCarts, setCheckedCarts] = useState([]);
//   const [summaryScreenPopup, setSummaryScreenPopup] = useState(false);
//   const [shippingCharges, setShippingCharges] = useState("0");

//   // notice status variable -> nsta
//   let noticeStatus = localStorage.getItem("#nsta");
//   const [noticeShown, setNoticeShown] = useState("hide");

//   const bg_colors = [
//     "#ffebee",
//     "#e3f2fd",
//     "#fff8e1",
//     "#f3e5f5",
//     "#e8f5e9",
//     "#fff3e0",
//     "#f5f5f5",
//     "#e0f7fa",
//   ];
//   const darker_colors = [
//     "#ed4242", // Dark red (given)
//     "#476e7c", // Dark blue (given)
//     "#e6b800", // Dark yellow
//     "#9c27b0", // Dark purple
//     "#2e7d32", // Dark green
//     "#f57c00", // Dark orange
//     "#757575", // Dark gray
//     "#00acc1", // Dark cyan
//   ];

//   const getUserCardDataDetails = async () => {
//     setLoading(true);
//     await getCartData(userId).then((result) => {

//       setCartData(result.cartData || []);
//       setCartCategories(result.cartCategories || []);
//       setCartDates(result.cartDates || []);
//       setCustomerMultiCarts(result.customerMultiCarts || []);

//       console.log(result.cartData, userId, "cartData sssss");
//       // CalculateAllCost(result.cartData || []);
//       // CalculateAllCost(
//       //   result.cartData.filter((item) => {
//       //     return checkedCarts.includes(item.cart_id);
//       //   }) || []
//       // );

//       //new
//       CalculateAllCost(
//       checkedCarts?.length > 0
//         ? result.cartData?.filter((item) => checkedCarts.includes(item.cart_id)) || []
//         : result.cartData || []
//     );
//     });
//     await getCartDataLength(userId).then((response) => {
//       setCartDataLength(response);
//     });
//     setLoading(false);
//   };

//   // FIXED: Improved convertToNumber function with better error handling
//   const convertToNumber = (value) => {
//     // Handle null, undefined, or empty values
//     if (value == null || value === "" || value === "NaN") {
//       return 0;
//     }

//     // If it's already a number and not NaN
//     if (typeof value === "number" && !isNaN(value)) {
//       return value;
//     }

//     // If it's a string, clean it up
//     if (typeof value === "string") {
//       // Remove single quotes, commas, and any non-numeric characters except decimal points
//       const cleanedValue = value.replace(/[',\s]/g, "");
//       const parsed = parseFloat(cleanedValue);
//       return isNaN(parsed) ? 0 : parsed;
//     }

//     // Fallback: try to convert to number
//     const parsed = Number(value);
//     return isNaN(parsed) ? 0 : parsed;
//   };

//   // FIXED: Legacy function for backward compatibility
//   const cleanAndConvertToNumber = (str) => {
//     return convertToNumber(str);
//   };

//   // FIXED: Safe currency conversion wrapper
//   const safeCurrencyConverter = (fromCurrency, amount, baseCurrencyValue) => {
//     try {
//       const result = CurrencyConverterSummaryPage(
//         fromCurrency,
//         amount,
//         baseCurrencyValue
//       );
//       return convertToNumber(result);
//     } catch (error) {
//       console.error("Currency conversion error:", error);
//       return 0;
//     }
//   };

//   const CalculateAllCost = (value) => {
//     console.log("value car load", value);
//     let totalCost = 0.0;

//     let lifestyStyleCost = 0.0;
//     let essentialTotalCost = 0.0;
//     let educationTotalCost = 0.0;
//     let hotelsTotalCost = 0.0;

//     let shippingCost = 0.0;
//     let discountCost = 0.0;
//     let newDetails = [];
//     let deliveryDates = [];

//     value.forEach((item) => {
//       if (item.main_category_id === 3 && item.maincat_type === "Lifestyle") {
//         // console.log("lifestyle item", item);
//         let lifestyAdultCost = 0.0;
//         let lifestyChildCost = 0.0;
//         let packageCost = 0.0;

//         if (item.rate_type === "Package") {
//           packageCost = safeCurrencyConverter(
//             item.lsCurrency,
//             convertToNumber(item.package_rate), // Handle null or undefined package_rate
//             baseCurrencyValue
//           );
//         } else {
//           const adultRate =
//             convertToNumber(item.adult_rate) *
//             convertToNumber(item.lifestyle_adult_count);
//           const childRate =
//             convertToNumber(item.child_rate) *
//             convertToNumber(item.nonFocChildCountLs || 0);

//           if (adultRate > 0) {
//             lifestyAdultCost = safeCurrencyConverter(
//               item.lsCurrency,
//               adultRate,
//               baseCurrencyValue
//             );
//           }
//           if (childRate > 0) {
//             lifestyChildCost = safeCurrencyConverter(
//               item.lsCurrency,
//               childRate,
//               baseCurrencyValue
//             );
//           }
//         }

//         lifestyStyleCost += lifestyAdultCost + lifestyChildCost + packageCost;

//          let discount =0.0;
//           let discountSet = value.filter((cart) => {
//       if (cart.lsDiscountMeta) {
//         try {
//           const discountMeta = JSON.parse(cart.lsDiscountMeta);

//           if(cart.lifestyle_id === discountMeta.origin_product_id){
//             console.log("lifestyle item11111111111", discount);
//             try{

//         discount = getDiscountProductBaseByPrice(lifestyAdultCost + lifestyChildCost + packageCost,discountMeta,cart.lsCurrency)["discountRate"];
//             }
//             catch(error){
//               console.log("error in discount", error);
//             }

//             console.log("lifestyle item11111111111", discount);
//               console.log("Discount Type: Percentage", discount);
//           }
//           return ;
//         } catch (error) {
//           return false;
//         }
//       }
//       return false;
//     });
//     discountCost += parseFloat(discount);
//         console.log("discountSet 1233333", discountCost);
//         // console.log("lifestyStyleCost", lifestyStyleCost);
//       } else if (
//         (item.main_category_id === 1 && item.maincat_type === "Essential") ||
//         (item.main_category_id === 2 && item.maincat_type === "Non Essential")
//       ) {
//         let essentialCost = safeCurrencyConverter(
//           item.esCurrency,
//           convertToNumber(item.mrp) * convertToNumber(item.quantity),
//           baseCurrencyValue
//         );
//         let shipping = safeCurrencyConverter(
//           item.DeliveryCurrency,
//           convertToNumber(item.deliveryRate),
//           baseCurrencyValue
//         );

//         if (!deliveryDates.includes(item.order_preffered_date)) {
//           deliveryDates.push(item.order_preffered_date);
//           let more = {
//             name: item.listing_title,
//             shippingCost: item.deliveryRate,
//             currency: item.esCurrency,
//           };
//           shippingCost += shipping;
//           newDetails.push(more);
//         }

//         essentialTotalCost += essentialCost;
//       } else if (
//         item.main_category_id === 5 &&
//         item.maincat_type === "Education"
//       ) {
//         let educationAdultCost = safeCurrencyConverter(
//           item.eCurrency,
//           convertToNumber(item.adult_course_fee),
//           baseCurrencyValue
//         );
//         let educationChildCost = safeCurrencyConverter(
//           item.eCurrency,
//           convertToNumber(item.child_course_fee),
//           baseCurrencyValue
//         );

//         if (item.student_type === "Adult") {
//           educationTotalCost += educationAdultCost;
//         } else {
//           educationTotalCost += educationChildCost;
//         }
//       } else if (
//         item.main_category_id === 4 &&
//         item.maincat_type === "Hotels"
//       ) {
//         // try {
//         //   let reformatted = JSON.parse(item.bookingdataset);
//         //   let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
//         //   console.log(reformattedDiscount, "reformattedDiscount");
//         //   console.log(reformatted, "reformatted");

//         //   let hotelsCost = 0.00

//         //   if( reformattedDiscount?.amount) {

//         //    const discountFroProducts = getDiscountProductBaseByPrice(convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),reformattedDiscount,reformatted?.hotelRatesRequest?.Price?.CurrencyCode)["discountRate"]
//         //    discountCost += Number(discountFroProducts)
//         //    console.log(discountCost, "hotelDiscount discountCost");
//         //   }
//         //     hotelsCost = safeCurrencyConverter(
//         //     reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//         //     convertToNumber(reformatted?.hotelRatesRequest?.Price?.PublishedPrice),
//         //     baseCurrencyValue
//         //   );

//         //   console.log(hotelsCost, "hotelCost issss chmodified");

//         //   hotelsTotalCost += hotelsCost;
//         // } catch (error) {
//         //   console.error("Error parsing hotel booking data:", error);
//         // }

//         // Fixed hotel discount calculation with proper currency conversion
//         try {
//           let reformatted = JSON.parse(item.bookingdataset);
//           let reformattedDiscount = JSON.parse(item?.hotelDiscountMeta);
//           // console.log(reformattedDiscount, "reformattedDiscount");
//           // console.log(reformatted, "reformatted");

//           let hotelsCost = 0.0;

//           if (reformattedDiscount?.amount) {
//             // Get the discount amount in the original hotel currency
//             const discountResult = getDiscountProductBaseByPrice(
//               convertToNumber(
//                 reformatted?.hotelRatesRequest?.Price?.PublishedPrice
//               ),
//               reformattedDiscount,
//               reformatted?.hotelRatesRequest?.Price?.CurrencyCode
//             );

//             const discountAmountInOriginalCurrency =
//               discountResult["discountRate"];

//             // Convert the discount amount to base currency
//             const discountAmountInBaseCurrency = safeCurrencyConverter(
//               reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//               convertToNumber(discountAmountInOriginalCurrency),
//               baseCurrencyValue
//             );

//             // Add the converted discount amount to total discount
//             discountCost += discountAmountInBaseCurrency;
//             // console.log(
//             //   discountAmountInBaseCurrency,
//             //   "hotelDiscount in base currency"
//             // );
//             // console.log(discountCost, "total discountCost");
//           }

//           // Convert hotel cost to base currency
//           hotelsCost = safeCurrencyConverter(
//             reformatted?.hotelRatesRequest?.Price?.CurrencyCode,
//             convertToNumber(
//               reformatted?.hotelRatesRequest?.Price?.PublishedPrice
//             ),
//             baseCurrencyValue
//           );

//           // console.log(hotelsCost, "hotelCost in base currency");

//           hotelsTotalCost += hotelsCost;
//         } catch (error) {
//           console.error("Error parsing hotel booking data:", error);
//         }
//       }
//     });

//     totalCost =
//       lifestyStyleCost +
//       educationTotalCost +
//       essentialTotalCost +
//       hotelsTotalCost;

//     setSummaryCost({
//       netTotal: totalCost,
//       shipping: shippingCost,
//       discount: discountCost || 0.0,
//       // grandtotal: totalCost - discountCost + shippingCost
//       grandtotal: totalCost - discountCost + shippingCost,
//     });
//   };

//   // FIXED: Updated useEffect with better error handling
//   useEffect(() => {
//     const grandTotal = convertToNumber(summaryCost?.grandtotal);
//     if (grandTotal > 0) {
//       fetchDiscount(grandTotal);
//     }
//     // console.log("summaryCost.grandtotal", grandTotal);
//   }, [summaryCost]);

//   // FIXED: Updated fetchDiscount function with better error handling
//   const fetchDiscount = async (grandTotal) => {
//     try {
//       const safeGrandTotal = convertToNumber(grandTotal);

//       const data = {
//         grand_total: safeGrandTotal,
//         currency: baseCurrencyValue?.base || "USD",
//         userId: userId,
//       };

//       // console.log(data, "Grand Total value issss");
//       setDiscountData({});

//       const response = await axios.post(
//         "get-price-based-discounts-to-cart/10",
//         data
//       );

//       console.log(response, "Grand Total value issss 123444");

//       if (response.data.status === 200) {
//         setDiscountData(response.data.cartAvailableDiscount?.[0] || {});
//         console.log(response.data.cartAvailableDiscount?.[0], "discountData");
//       }
//     } catch (err) {
//       console.error("Error fetching discount:", err);
//       setDiscountData({});
//     } finally {
//       // setDiscountPricingLoading(false);
//     }
//   };

//   // FIXED: Improved getPriceBasedDiscountAmount function
//   const getPriceBasedDiscountAmount = (
//     totalAmount,
//     currencyData,
//     discountData
//   ) => {
//     // console.log(
//     //   totalAmount,
//     //   currencyData,
//     //   discountData,
//     //   "discountAmount234234234qwwe"
//     // );

//     // Handle case where discount data is invalid or user not eligible
//     if (
//       !discountData ||
//       Object.keys(discountData).length === 0 ||
//       discountData?.discountEligibility === false
//     ) {
//       const safeTotalAmount = convertToNumber(totalAmount);
//       return {
//         discountAmount: 0,
//         finalAmount: safeTotalAmount,
//         totalAmount: safeTotalAmount,
//       };
//     }

//     const {
//       amount_type = "fixed",
//       price_currency = "USD",
//       discounted_amount = "0",
//     } = discountData;

//     let discountAmount = 0;
//     const safeTotalAmount = convertToNumber(totalAmount);

//     console.log(
//       discounted_amount,
//       price_currency,
//       amount_type,
//       "discounted_amount"
//     );

//     if (amount_type === "percentage") {
//       const percentageValue = convertToNumber(discounted_amount);
//       discountAmount = (safeTotalAmount * percentageValue) / 100;
//     } else {
//       // For fixed amount, convert to base currency
//       discountAmount = safeCurrencyConverter(
//         discountData?.price_currency,
//         convertToNumber(discountData?.discounted_amount),
//         baseCurrencyValue
//       );
//     }

//     // Ensure discount doesn't exceed total amount
//     discountAmount = Math.min(discountAmount, safeTotalAmount);

//     const finalAmount = Math.max(0, safeTotalAmount - discountAmount);

//     console.log("discountAmount221131", finalAmount);

//     return {
//       discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
//       finalAmount: isNaN(finalAmount) ? safeTotalAmount : finalAmount,
//       totalAmount: safeTotalAmount,
//     };
//   };

//   // FIXED: Updated getDynamicDiscountMessage function with better error handling
//   const getDynamicDiscountMessage = (
//     currentTotal,
//     discountData,
//     baseCurrencyValue
//   ) => {
//     if (!discountData || Object.keys(discountData).length === 0) {
//       return null;
//     }

//     const {
//       condition_start_value,
//       condition_end_value,
//       discounted_amount,
//       price_currency,
//       condition_currency,
//       discountEligibility,
//       amount_type = "fixed",
//     } = discountData;

//     // Safely convert condition values to base currency
//     let minSpendInBaseCurrency = 0;
//     let maxSpendInBaseCurrency = null;

//     try {
//       minSpendInBaseCurrency = safeCurrencyConverter(
//         condition_currency,
//         convertToNumber(condition_start_value),
//         baseCurrencyValue
//       );

//       if (condition_end_value) {
//         maxSpendInBaseCurrency = safeCurrencyConverter(
//           condition_currency,
//           convertToNumber(condition_end_value),
//           baseCurrencyValue
//         );
//       }
//     } catch (error) {
//       console.error("Currency conversion error:", error);
//       return null;
//     }

//     // Clean and convert current total to number for comparison
//     const cleanCurrentTotal = convertToNumber(currentTotal);
//     const cleanMinSpend = convertToNumber(minSpendInBaseCurrency);

//     // Function to format discount display based on amount_type
//     const formatDiscountDisplay = () => {
//       if (amount_type === "percentage") {
//         const percentage = convertToNumber(discounted_amount);
//         return `${percentage}% off`;
//       } else {
//         // For fixed amount, convert to base currency
//         const discountAmountInBaseCurrency = safeCurrencyConverter(
//           price_currency,
//           convertToNumber(discounted_amount),
//           baseCurrencyValue
//         );

//         return `${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
//           baseCurrencyValue.base,
//           discountAmountInBaseCurrency.toFixed(2)
//         )} off`;
//       }
//     };

//     // Check if user has already qualified for discount
//     if (cleanCurrentTotal >= cleanMinSpend) {
//       if (maxSpendInBaseCurrency) {
//         const cleanMaxSpend = convertToNumber(maxSpendInBaseCurrency);

//         // Check if within range
//         if (cleanCurrentTotal <= cleanMaxSpend) {
//           return {
//             type: "qualified",
//             message: `🎉 You got ${formatDiscountDisplay()}!`,
//             isEligible: true,
//           };
//         } else {
//           return {
//             type: "exceeded",
//             message: `You've exceeded the maximum spend limit for this discount.`,
//             isEligible: false,
//           };
//         }
//       } else {
//         return {
//           type: "qualified",
//           message: `🎉 You got ${formatDiscountDisplay()}!`,
//           isEligible: true,
//         };
//       }
//     } else {
//       // Calculate how much more they need to spend
//       const amountToSpend = cleanMinSpend - cleanCurrentTotal;
//       return {
//         type: "need_more",
//         message: `Spend ${baseCurrencyValue.base} ${getCurrencyInCountryFormat(
//           baseCurrencyValue.base,
//           Math.max(0, amountToSpend).toFixed(2)
//         )} more and grab ${formatDiscountDisplay()}`,
//         isEligible: false,
//         amountNeeded: Math.max(0, amountToSpend),
//       };
//     }
//   };

//   // FIXED: Safe currency formatting helper
//   const safeCurrencyFormat = (currency, amount) => {
//     const safeAmount = convertToNumber(amount);
//     if (safeAmount === 0 || isNaN(safeAmount)) {
//       return "0.00";
//     }
//     return getCurrencyInCountryFormat(currency, safeAmount.toFixed(2));
//   };

//   const handlePopup = () => {
//     setredirectingpopup(true);
//   };

//   const handleRedirectPlayStore = () => {
//     window.open(
//       `https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share`,
//       "_blank"
//     );
//   };

//   const handlleRedirectAppStore = () => {
//     window.open(`https://apps.apple.com/lk/app/aahaas/id6450589764`, "_blank");
//   };

//   useEffect(() => {
//     //   setCheckedCarts([]);
//     // setSummaryCost({
//     //      netTotal: 0.0,
//     //   shipping: 0.0,
//     //   discount: 0.0,
//     //   grandtotal: 0.0,
//     // })
//     // setCheckedCarts([]);
//     // setShowUtilities(!showUtilities)
//     getUserCardDataDetails();
//   }, [triggers, baseCurrencyValue]);
//   // }, [triggers, baseCurrencyValue]);

//   const handleSetNoticeHide = () => {
//     setNoticeShown("hide");
//     localStorage.setItem("#nsta", "hide");
//   };

//   const handleCheckCarts = (cart) => {
//     setCheckedCarts((prevCheckedCarts) => {
//       if (prevCheckedCarts.includes(cart.cart_id)) {
//         return prevCheckedCarts.filter(
//           (checkedCart) => checkedCart !== cart.cart_id
//         );
//       }
//       return [...prevCheckedCarts, cart.cart_id];
//     });
//   };

//   const handleSummaryScreenPopup = () => {
//     if (checkedCarts.length === 0) {
//       ToastMessage({
//         status: "error",
//         message:
//           "Kindly choose at least one cart to generate summary or itinerary",
//       });
//     } else {
//       setSummaryScreenPopup(true);
//     }
//   };

//   const handleDownloadSummary = async (data) => {
//     console.log("handleDownloadSummary", data);
//     const postData = `currency=${baseCurrency}&shipping=${convertToNumber(
//       summaryCost.shipping
//     ).toFixed(2)}&`;
//     const cartIds = [];
//     checkedCarts.map((value, key) => {
//       cartIds.push(`cartIds[${key}]=${value}`);
//     });

//     const discountAmount =
//       getPriceBasedDiscountAmount(
//         safeCurrencyFormat(baseCurrencyValue.base, summaryCost.grandtotal),
//         baseCurrencyValue,
//         discountData
//       )?.discountAmount + summaryCost.discount || 0;

//       console.log("discountAmount", discountAmount);

//     let final = cartIds.join("&");
//     // Ensure discountAmount and shippingCharges are valid numbers, default to 0 if null/NaN
//     const safeDiscountAmount = convertToNumber(discountAmount);
//     const safeShippingCharges = convertToNumber(shippingCharges);

//     let summaryLink = postData
//       .concat(final)
//       .concat(
//         `&price_discount=${safeDiscountAmount}&shipping_charges=${safeShippingCharges}`
//       );
//     setSummaryScreenPopup(false);

//     console.log(shippingCharges, "cartIds isssssssssss", discountAmount);
//     console.log(summaryLink, "summaryLink");

//     if (data === "summary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-summary/pdf?${summaryLink}`,
//         "_blank"
//       );
//     } else if (data === "shortItenary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-itinerary/short/pdf?${final}`,
//         "_blank"
//       );
//     } else if (data === "longItenary") {
//       window.open(
//         axios.defaults.baseURL + `/cart-itinerary/long/pdf?${final}`,
//         "_blank"
//       );
//     }
//   };

//   useEffect(() => {
//     setShippingCharges(convertToNumber(summaryCost.shipping).toFixed(2));
//   }, [summaryCost.shipping]);

//   useEffect(() => {
//     if (!showUtilities) {
//       CalculateAllCost(cartData);
//     } else {
//       let filtered = cartData.filter((item) => {
//         return checkedCarts.includes(item.cart_id);
//       });
//       CalculateAllCost(filtered);
//     }
//   }, [checkedCarts, showUtilities, baseCurrencyValue, triggers]);

//   return (
//     <>
//       <Head>
//         <title>Aahaas - Carts</title>
//       </Head>

//       <CommonLayout
//         parent="home"
//         title="cart"
//         showMenuIcon={false}
//         showSearchIcon={false}
//       >
//         {userStatus.userLoggesIn ? (
//           <div className="container">
//             {loading ? (
//               <section className="tab-product m-0 my-lg-5 px-5">
//                 <div className="d-flex flex-column align-items-center">
//                   <h5>Fetching your products ...</h5>
//                   <h5>Please wait !</h5>
//                 </div>
//               </section>
//             ) : cartDataLength == 0 ? (
//               <section className="tab-product m-0 my-5 px-5">
//                 <div className="d-flex flex-column align-items-center">
//                   <h5>Your Cart is Empty ...</h5>
//                   <h5>Explore more shortlist some items.</h5>
//                 </div>
//               </section>
//             ) : (
//               <section className="tab-product m-0 mb-5 px-lg-5 px-sm-0">
//                 <Col sm="12" lg="12" md="12">
//                   <Nav
//                     tabs
//                     className="nav-material testing d-flex align-items-center justify-content-start mb-3"
//                   >
//                     <NavItem
//                       className="nav nav-tabs utilities-tab mx-2 me-2 rounded-5"
//                       style={{
//                         backgroundColor: showUtilities
//                           ? "rgba(211, 211, 211, 0.3)"
//                           : "",
//                       }}
//                       id="myTab"
//                       role="tablist"
//                       onClick={() => setShowUtilities(!showUtilities)}
//                     >
//                       <AutoFixHighOutlinedIcon
//                         sx={{ padding: "1px", fontSize: "18px" }}
//                       />
//                       Download Summary and Itinerary
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "1" ? "active" : ""}
//                         onClick={() => setActiveTab("1")}
//                       >
//                         Day wise
//                       </NavLink>
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "2" ? "active" : ""}
//                         onClick={() => setActiveTab("2")}
//                       >
//                         Service wise
//                       </NavLink>
//                     </NavItem>
//                     <NavItem className="nav nav-tabs" id="myTab" role="tablist">
//                       <NavLink
//                         style={{ fontSize: "15px" }}
//                         className={activeTab === "3" ? "active" : ""}
//                         onClick={() => setActiveTab("3")}
//                       >
//                         Cart wise
//                       </NavLink>
//                     </NavItem>
//                     <div className={`cart-notice-${noticeShown}`}>
//                       <div className="d-flex flex-column">
//                         <h6>itinerary / summary document generation</h6>
//                         <p>
//                           Discover our AI-powered itinerary generation
//                           service—designed to make your journey effortless and
//                           personalized. Simply select the key details you want
//                           included, and our system will craft a stylish and
//                           tailored summary for your upcoming trip. Let us turn
//                           your service date into a seamless travel experience!
//                         </p>
//                         <button
//                           onClick={handleSetNoticeHide}
//                           className="btn btn-solid py-1 px-2 rounded-3 col-4 mx-auto"
//                         >
//                           Got it !
//                         </button>
//                       </div>
//                     </div>
//                   </Nav>

//                   <TabContent activeTab={activeTab} className="nav-material">
//                     <section className="col-12 row mt-4 m-0 p-0">
//                       <div className="col-lg-8 col-sm-12">
//                         <div
//                           className={`cartWise-carts-container mb-5  d-${
//                             showUtilities ? "" : "none"
//                           } `}
//                         >
//                           <div
//                             className="summary-download-button"
//                             style={{
//                               cursor: "pointer",
//                               backgroundColor:
//                                 checkedCarts.length === 0 ? "lightgray" : "",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => handleSummaryScreenPopup()}
//                           >
//                             <DownloadIcon />
//                             <label className="mx-2">Download</label>
//                           </div>
//                           <div
//                             className="cart-details-summary"
//                             style={{
//                               display: "flex",
//                               overflowX: "auto",
//                               overflowY: "hidden",
//                               whiteSpace: "nowrap",
//                               gap: "10px",
//                               paddingBottom: "5px",
//                               scrollbarWidth: "thin", // For Firefox
//                               scrollbarColor: "#ccc transparent", // For Firefox
//                             }}
//                           >
//                             {customerMultiCarts.map((cart, index) => (
//                               <div
//                                 key={index}
//                                 className="d-flex align-items-center"
//                                 onClick={() => handleCheckCarts(cart)}
//                                 style={{
//                                   backgroundColor: bg_colors[index % 8],
//                                   color: darker_colors[index % 8],
//                                 }}
//                               >
//                                 <input
//                                   type="checkbox"
//                                   className="form-check-input"
//                                   checked={checkedCarts.includes(cart.cart_id)}
//                                 />
//                                 <label className="form-check-label m-0 mx-2 p-0" style={{ textTransform: 'capitalize' }}  >
//                                   {cart.cart_title}
//                                 </label>
//                               </div>
//                             ))}
//                           </div>
//                         </div>

//                         <table className="col-12 m-0 p-0">
//                           <thead className="cart-page-heading">
//                             {activeTab === "1" ? (
//                               <Daywise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartDates={cartDates}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={false}
//                               />
//                             ) : activeTab === "2" ? (
//                               <ServiceWise
//                                 handlePopup={handlePopup}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 activeTab={activeTab}
//                                 cartCategories={cartCategories}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={false}
//                               />
//                             ) : activeTab === "3" ? (
//                               <CartWise
//                                 customerMultiCarts={customerMultiCarts}
//                                 showUtilities={showUtilities}
//                                 setShowUtilities={setShowUtilities}
//                                 setNoticeShown={setNoticeShown}
//                                 cartData={cartData}
//                                 checkedCarts={checkedCarts}
//                                 cartCategories={cartCategories}
//                               />
//                             ) : null}
//                           </thead>
//                           <thead className="cart-page-heading-mobile-view">
//                             {activeTab === "1" ? (
//                               <Daywise
//                                 handlePopup={handlePopup}
//                                 cartData={cartData}
//                                 activeTab={activeTab}
//                                 cartDates={cartDates}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={true}
//                               />
//                             ) : (
//                               <ServiceWise
//                                 handlePopup={handlePopup}
//                                 cartData={cartData}
//                                 activeTab={activeTab}
//                                 cartCategories={cartCategories}
//                                 customerMultiCarts={customerMultiCarts}
//                                 summaryCost={summaryCost}
//                                 mobileView={true}
//                               />
//                             )}
//                           </thead>
//                         </table>
//                       </div>

//                       {/* FIXED ORDER DETAILS SECTION */}
//                       <div
//                         className="col-lg-4 col-sm-12 p-lg-5 mt-5 my-lg-0"
//                         style={{
//                           backgroundColor: "#f9f9f9",
//                           height: "fit-content",
//                         }}
//                       >
//                         <div className="py-4">
//                           <table className="col-12 m-0">
//                             <thead>
//                               <tr>
//                                 <th
//                                   className="p-4 pb-0 pl-0"
//                                   style={{
//                                     borderTopLeftRadius: "8px",
//                                     borderTopRightRadius: "8px",
//                                     backgroundColor: "#476e7c",
//                                     color: "white",
//                                   }}
//                                 >
//                                   <h4 className="fs-3 fw-bold">
//                                     Order details
//                                   </h4>
//                                 </th>
//                               </tr>
//                             </thead>
//                             <tbody>
//                               <tr>
//                                 <td>
//                                   <ul className="sub-total p-4 pt-3">
//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between"
//                                     >
//                                       Total Price{" "}
//                                       <span className="count">
//                                         {/* {baseCurrencyValue.base}{" "} */}
//                                         {CurrencyConverter(
//                                           baseCurrencyValue.base,
//                                           summaryCost.netTotal,
//                                           baseCurrencyValue
//                                         )}{" "}
//                                       </span>
//                                     </h5>

//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between"
//                                     >
//                                       Shipping Charges
//                                       <span className="count">
//                                         {baseCurrencyValue.base}{" "}
//                                         {safeCurrencyFormat(
//                                           baseCurrencyValue.base,
//                                           summaryCost.shipping
//                                         )}{" "}
//                                       </span>
//                                     </h5>
//                                     <hr />

//                                     {/* Only show discount section if Net Total is greater than 0 */}
//                                     {(discountData?.condition_currency &&
//                                       summaryCost.netTotal > 0) ||
//                                       (summaryCost.discount > 0 && (
//                                         <>
//                                           {/* <h5
//                                           style={{ fontSize: 15 }}
//                                           className="d-flex justify-content-between border-bottom pb-3"
//                                         >
//                                           Net Total{" "}
//                                           <span className="count">
//                                             {baseCurrencyValue.base}{" "}
//                                             {(() => {
//                                               const result = getPriceBasedDiscountAmount(
//                                                 safeCurrencyFormat(
//                                                   baseCurrencyValue.base,
//                                                   summaryCost.grandtotal
//                                                 ),
//                                                 baseCurrencyValue,
//                                                 discountData
//                                               );
//                                               return safeCurrencyFormat(baseCurrencyValue.base, result?.totalAmount || 0);
//                                             })()}{" "}
//                                           </span>
//                                         </h5> */}

//                                           {/* Only show discount row if user qualifies */}
//                                           {(() => {
//                                             const discountMessage =
//                                               getDynamicDiscountMessage(
//                                                 summaryCost.netTotal,
//                                                 discountData,
//                                                 baseCurrencyValue
//                                               );

//                                             if (
//                                               discountMessage?.type ===
//                                                 "qualified" ||
//                                               summaryCost.discount > 0
//                                             ) {
//                                               const discountAmount =
//                                                 getPriceBasedDiscountAmount(
//                                                   safeCurrencyFormat(
//                                                     baseCurrencyValue.base,
//                                                     summaryCost.grandtotal
//                                                   ),
//                                                   baseCurrencyValue,
//                                                   discountData
//                                                 )?.discountAmount || 0;

//                                               return (
//                                                 <h5
//                                                   style={{ fontSize: 15 }}
//                                                   className="d-flex justify-content-between border-bottom pb-3"
//                                                 >
//                                                   Discount{" "}
//                                                   <span className="count">
//                                                     -{baseCurrencyValue.base}{" "}
//                                                     {safeCurrencyFormat(
//                                                       baseCurrencyValue.base,
//                                                       discountAmount +
//                                                         summaryCost.discount
//                                                     )}{" "}
//                                                   </span>
//                                                 </h5>
//                                               );
//                                             }
//                                             return null;
//                                           })()}
//                                         </>
//                                       ))}

//                                     <h5
//                                       style={{ fontSize: 15 }}
//                                       className="d-flex justify-content-between border-bottom pb-3"
//                                     >
//                                       Grand Total{" "}
//                                       <span className="count">
//                                         {baseCurrencyValue.base}{" "}
//                                         {/* Use conditional logic to determine whether to apply discount */}
//                                         {(() => {
//                                           if (summaryCost.netTotal <= 0) {
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               summaryCost.grandtotal
//                                             );
//                                           }

//                                           const discountMessage =
//                                             getDynamicDiscountMessage(
//                                               summaryCost.netTotal,
//                                               discountData,
//                                               baseCurrencyValue
//                                             );

//                                           if (
//                                             discountMessage?.type ===
//                                             "qualified"
//                                           ) {
//                                             const result =
//                                               getPriceBasedDiscountAmount(
//                                                 safeCurrencyFormat(
//                                                   baseCurrencyValue.base,
//                                                   summaryCost.grandtotal
//                                                 ),
//                                                 baseCurrencyValue,
//                                                 discountData
//                                               );
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               result?.finalAmount || 0
//                                             );
//                                           } else {
//                                             return safeCurrencyFormat(
//                                               baseCurrencyValue.base,
//                                               summaryCost.grandtotal
//                                             );
//                                           }
//                                         })()}{" "}
//                                       </span>
//                                     </h5>

//                                     {/* Dynamic discount messaging */}
//                                     {(() => {
//                                       if (summaryCost.netTotal <= 0)
//                                         return null;

//                                       const discountMessage =
//                                         getDynamicDiscountMessage(
//                                           summaryCost.netTotal,
//                                           discountData,
//                                           baseCurrencyValue
//                                         );

//                                       if (!discountMessage) return null;

//                                       return (
//                                         <h5
//                                           style={{ fontSize: 15 }}
//                                           className="d-flex justify-content-between"
//                                         >
//                                           <div>
//                                             <span
//                                               style={{
//                                                 color:
//                                                   discountMessage.type ===
//                                                   "qualified"
//                                                     ? "#28a745"
//                                                     : "#ff6b35",
//                                                 display: "inline-flex",
//                                                 alignItems: "center",
//                                                 padding: "4px 8px",
//                                                 backgroundColor:
//                                                   discountMessage.type ===
//                                                   "qualified"
//                                                     ? "#e9f7ed"
//                                                     : "#fff3e0",
//                                                 borderRadius: "4px",
//                                                 fontSize: "0.775rem",
//                                                 fontWeight: "500",
//                                                 marginBottom: "8px",
//                                               }}
//                                             >
//                                               {discountMessage.type ===
//                                               "qualified" ? (
//                                                 <svg
//                                                   style={{
//                                                     marginRight: "6px",
//                                                     width: "20px",
//                                                     height: "20px",
//                                                     fill: "currentColor",
//                                                   }}
//                                                   viewBox="0 0 24 24"
//                                                 >
//                                                   <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
//                                                 </svg>
//                                               ) : (
//                                                 <svg
//                                                   style={{
//                                                     marginRight: "6px",
//                                                     width: "20px",
//                                                     height: "20px",
//                                                     fill: "currentColor",
//                                                   }}
//                                                   viewBox="0 0 24 24"
//                                                 >
//                                                   <path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.05-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
//                                                 </svg>
//                                               )}
//                                               {discountMessage.message}
//                                             </span>
//                                           </div>
//                                         </h5>
//                                       );
//                                     })()}
//                                   </ul>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </div>
//                       </div>

//                       <div className="d-flex align-items-center justify-content-between mt-5 col-12 flex-wrap gap-3">
//                         <Link href="/" className="btn btn-sm btn-solid">
//                           Continue shopping
//                         </Link>
//                         <button
//                           onClick={handlePopup}
//                           className="btn btn-sm btn-solid"
//                         >
//                           Order now
//                         </button>
//                       </div>
//                     </section>
//                   </TabContent>
//                 </Col>
//               </section>
//             )}
//           </div>
//         ) : (
//           <div className="d-flex flex-column align-items-center justify-content-center p-5 my-5">
//             <h2>Oops! something went wrong..</h2>
//             <h5>
//               To continue, please log in to your account. This helps us provide
//               a personalized experience and keep your information secure.
//             </h5>
//             <Link
//               href="/page/account/login-auth/"
//               className="btn btn-solid btn-sm mt-4"
//             >
//               Login / Register
//             </Link>
//           </div>
//         )}

//         <ModalBase
//           isOpen={redirectingpopup}
//           size="md mt-3 p-0"
//           extracss="pb-0"
//           toggle={() => setredirectingpopup(false)}
//         >
//           <div className="d-flex flex-column align-items-center">
//             <h3 style={{ fontSize: 24, marginBottom: "0px" }}>
//               Discover Aahaas on the Go!
//             </h3>
//             <h6
//               style={{
//                 fontSize: 12,
//                 textAlign: "center",
//                 color: "black",
//                 marginBottom: "10px",
//                 marginTop: "-5px",
//               }}
//             >
//               Experience Seamless Service at Your Fingertips.
//             </h6>
//             <Media
//               src={redirectingbanner.src}
//               style={{
//                 width: "auto",
//                 height: "40vh",
//                 marginTop: "20px",
//                 objectFit: "cover",
//               }}
//             />
//             <div className="d-flex flex-column col-11 mx-auto">
//               <h3
//                 style={{
//                   fontSize: 16,
//                   textAlign: "center",
//                   textTransform: "uppercase",
//                   color: "black",
//                   lineHeight: "20px",
//                   marginBottom: "6px",
//                   fontWeight: "bold",
//                 }}
//               >
//                 Secure Checkout : Try Our App
//               </h3>
//               <p
//                 className="text-center mx-auto"
//                 style={{ fontSize: 10, lineHeight: "12px" }}
//               >
//                 Enjoy the full Aahaas experience wherever you are. Our mobile
//                 app is designed to make your journey smoother and more
//                 personalized.To provide you with a more secure and seamless
//                 experience, we request you to complete your checkout on our
//                 mobile app. Our app offers advanced security features and is
//                 optimized for fast, reliable transactions. Please download the
//                 app to proceed with your purchase.
//               </p>
//             </div>
//             <div className="d-flex align-items-center gap-2 mt-3">
//               <Media
//                 src={applelogo.src}
//                 alt="app store logo"
//                 style={{ width: "180px" }}
//                 onClick={handlleRedirectAppStore}
//               />
//               <Media
//                 src={playstorelogo.src}
//                 alt="play store logo"
//                 style={{ width: "180px" }}
//                 onClick={handleRedirectPlayStore}
//               />
//             </div>
//           </div>
//         </ModalBase>

//         <ModalBase
//           title={"Choose what summary / itinerary details you want ?"}
//           isOpen={summaryScreenPopup}
//           toggle={() => setSummaryScreenPopup(false)}
//         >
//           <div className="d-flex align-items-center flex-wrap justify-content-center">
//             <button
//               className="btn btn-solid py-1 px-2 mb-2 col-11"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("summary")}
//             >
//               Download summary
//             </button>
//             <button
//               className="btn btn-solid py-1 px-2 mx-2 col"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("shortItenary")}
//             >
//               Download short itinerary
//             </button>
//             <button
//               className="btn btn-solid py-1 px-2 mx-2 col"
//               style={{ fontSize: 10 }}
//               onClick={() => handleDownloadSummary("longItenary")}
//             >
//               Download long itinerary
//             </button>
//           </div>
//         </ModalBase>
//       </CommonLayout>
//     </>
//   );
// };

// export default CartPage;

