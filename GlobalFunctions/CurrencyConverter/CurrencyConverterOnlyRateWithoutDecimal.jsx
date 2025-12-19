const CurrencyConverterOnlyRateWithoutDecimal = (conversionCurrency, amount, dataSet) => {
    console.log("CurrencyConverterOnlyRateWithoutDecimal called with:", conversionCurrency, amount, dataSet);
    if (dataSet?.['rates']) {
        var conversion = dataSet?.['rates'][conversionCurrency]
        let totalPrice = Number(amount / conversion?.[0]);
        return (totalPrice);
    } else {
        return 0.00
    }
}

export default CurrencyConverterOnlyRateWithoutDecimal;