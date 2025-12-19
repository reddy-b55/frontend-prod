const CurrencyConverterSummaryPage = (conversionCurrency, amount, dataSet) => {
    var totalPrice = 0.00;
    if (dataSet?.['rates']) {
        var conversion = dataSet?.['rates'][conversionCurrency]
        totalPrice = Number(amount / conversion?.[0]);
        return totalPrice.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        return 0.00
    }
}

export default CurrencyConverterSummaryPage;