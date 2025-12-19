const CartCurrencyConverter = (conversionCurrency, amount, dataSet) => {
    var totalPrice = 0.00;
    var conversion = dataSet?.['rates']?.[conversionCurrency]
    if (!conversion) {
        return 0.00;
    }
    totalPrice = Number(amount) / Number(conversion);
    return parseFloat(totalPrice)
}

export default CartCurrencyConverter;