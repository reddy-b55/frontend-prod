// import CartCurrencyConverter from "../../screens/CustomerCart/Functions/CartCurrencyConverter";
import { useContext } from "react";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter"; 
import CurrencyConverterOnlyRate from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRate"; 
import CurrencyConverterSummaryPage from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterSummaryPage"; 
import { AppContext } from "../../_app";

export default function getDiscountProductBaseByPrice(actualAmount, discountDataSet, currency, withCurrency = false) {

    // const { baseCurrencyValue } = useContext(AppContext)
    // console.log("Actual Amount:", actualAmount?.toFixed(2));

    actualAmount = parseFloat(actualAmount);
 
    if (discountDataSet) {
        const discount = discountDataSet;
        console.log("Discount iss iss", discount);
        console.log(currency, "Data set cart priceeeeeeeeee98765432")
 
        if (discount?.discount_type !== "value" && discount?.discount_type !== "precentage") {
            console.log("Invalid discount type. Returning actual amount.");
            return {
                actual: actualAmount?.toFixed(2),
                discountedAmount: actualAmount?.toFixed(2),
                discountRate: "0.00"
            };
        }
 
        let discountRate = parseFloat(discount.amount)
        console.log("Discount Rate is:", discountRate);
        let discountedAmount = actualAmount;
 
 
        if (discount?.discount_type === "value") {
            // console.log("Discount Type: Value", CurrencyConverter(discount?.currency, discountRate, currency));
            const discountValue = CurrencyConverter(discount?.currency || 'LKR', discountRate, currency);
            const numericValue = parseFloat(discountValue?.replace(/[^0-9.]/g, "")); // Removes non-numeric characters
            // discountedAmount = actualAmount - CurrencyConverter(discount?.currency, discountRate, currency);
            discountedAmount = actualAmount - numericValue;

            console.log("Discounted Amounttttt:",  numericValue, discountValue);

            // const rate = CurrencyConverterOnlyRate(discount?.currency, discountRate, currency);
            // const numericValueRate = parseFloat(rate.replace(/[^0-9.]/g, "")); // Removes non-numeric characters
            // discountRate = numericValueRate;

            const rate = CurrencyConverterOnlyRate(discount?.currency, discountRate, currency);
const rateString = String(rate || ""); // Convert to string, handle null/undefined
const numericValueRate = parseFloat(rateString.replace(/[^0-9.]/g, ""));
discountRate = numericValueRate;

            console.log("Discount Rate isssss:", discount?.currency, discountRate, currency);

        } else if (discount?.discount_type === "precentage") {
            discountedAmount = actualAmount - (actualAmount * discountRate) / 100;
            discountRate = (actualAmount * discountRate) / 100

            console.log("Discount Type: Percentage", discountedAmount, discountRate);

        }
        console.log("Acutal:", actualAmount)
        console.log("Discount Rate:", discountRate);
        console.log("Discounted Amount:", discountedAmount);
 
 
        if (withCurrency) {
            return {
                actual: currency?.base + " " + actualAmount?.toFixed(2),
                discountedAmount: currency?.base + " " + discountedAmount?.toFixed(2),
                discountRate: currency?.base + " " + discountRate?.toFixed(2)
            };
        }
        else {
            return {
                actual: actualAmount?.toFixed(2),
                discountedAmount: discountedAmount?.toFixed(2),
                discountRate: discountRate?.toFixed(2)
            };
        }
 
    }
    else {
        if (withCurrency) {
            return {
                actual: currency?.base + " " + actualAmount?.toFixed(2),
                discountedAmount: currency?.base + " " + actualAmount?.toFixed(2),
                discountRate: currency?.base + " " + "0.00"
            };
 
 
        }
        else {
            return {
                actual: actualAmount?.toFixed(2),
                discountedAmount: actualAmount?.toFixed(2),
                discountRate:discountRate?.toFixed(2)
            };
        }
 
    }
 
 
 
 
 
}