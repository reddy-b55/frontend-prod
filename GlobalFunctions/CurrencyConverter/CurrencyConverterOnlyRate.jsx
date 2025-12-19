const CurrencyConverterOnlyRate = (conversionCurrency, amount, dataSet) => {
    if (dataSet?.['rates']) {
        var conversion = dataSet?.['rates'][conversionCurrency]

        if (!conversion) {
            return 0.00;
        }

        let totalPrice = Number(amount / conversion?.[0]);
        return (totalPrice).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    } else {
        return 0.00
    }
}

export default CurrencyConverterOnlyRate;