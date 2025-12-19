import CartCurrencyConverter from "../CurrencyConverter/CartCurrencyConverter"

async function LifeStylePricing(dataSet, currency) {

    let adultTotal = Number(dataSet['lifestyle_adult_count'])
    let childTotal = Number(dataSet['lifestyle_children_count'])

    let packageTotal = Number(dataSet['discountable_package_rate'])

    let childTotalWithoutDiscounts = Number(dataSet['child_rate']) * Number(dataSet['lifestyle_children_count'])
    let adultTotalWithoutDiscount = Number(dataSet['adult_rate']) * Number(dataSet['lifestyle_adult_count'])
    let packageTotalWithoutDiscount = Number(dataSet['package_rate'])

    let originPrice = 0.00
    let discountAmount = 0.00
    let grandTotal = 0.00

    if (dataSet.rate_type === "Package") {
        originPrice = CartCurrencyConverter(dataSet['lsCurrency'], (packageTotalWithoutDiscount), currency)
        discountAmount = CartCurrencyConverter(dataSet['lsCurrency'], ((packageTotalWithoutDiscount) - (packageTotal)), currency)
        grandTotal = CartCurrencyConverter(dataSet['lsCurrency'], packageTotal, currency)
    }
    else {
        originPrice = CartCurrencyConverter(dataSet['lsCurrency'], (childTotalWithoutDiscounts + adultTotalWithoutDiscount), currency)
        discountAmount = CartCurrencyConverter(dataSet['lsCurrency'], ((childTotalWithoutDiscounts + adultTotalWithoutDiscount) - (childTotal + adultTotal)), currency)
        grandTotal = CartCurrencyConverter(dataSet['lsCurrency'], (childTotal + adultTotal), currency)
    }


    let life_id = dataSet['lifestyle_booking_id'];

    let adultrate = CartCurrencyConverter(dataSet['lsCurrency'], dataSet['adult_rate'], currency);
    let childrate = CartCurrencyConverter(dataSet['lsCurrency'], dataSet['child_rate'], currency);
    let packageRate = CartCurrencyConverter(dataSet['lsCurrency'], dataSet['package_rate'], currency)

    return { discount: discountAmount, originPrice: originPrice, totalAmount: grandTotal, base: currency.base, lifestyleid: life_id, adult: adultrate, child: childrate, package: packageRate, childTotalWithDiscount: childTotal, adultTotalWithDiscount: adultTotal, packageTotalWithDiscount: packageTotal, }

}

export default LifeStylePricing;