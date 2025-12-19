
function EducationPricing(dataSet, type) {
   
    var childPrice = 0.00
    var adultPrice = 0.00

    var childDiscountable = 0.00
    var adultDiscountable = 0.00

    var totalPrice = 0.00
    var totalPriceWithDiscount = 0.00


    var educationDiscount = dataSet['value']

    childPrice = dataSet['child_course_fee']
    totalPrice = dataSet['child_course_fee']

    adultPrice = dataSet['adult_course_fee']
    totalPrice = dataSet['adult_course_fee']


    if (dataSet['discount_type'] === "Amount") {
        totalPriceWithDiscount = totalPrice - dataSet['value']

        childDiscountable = childPrice - dataSet['value']
        adultDiscountable = dataSet['adult_course_fee'] - dataSet['value']
    }
    else if (dataSet['discount_type'] === "%") {
        totalPriceWithDiscount = totalPrice - (totalPrice * (dataSet['value'] / 100))

        childDiscountable = childPrice - (childPrice * (dataSet['value'] / 100))
        adultDiscountable = dataSet['adult_course_fee'] - (dataSet['adult_course_fee'] * (dataSet['value'] / 100))

    }
    else {
        totalPriceWithDiscount = totalPrice
        childDiscountable = childPrice
        adultDiscountable = dataSet['adult_course_fee']
    }


    var discountPrice = 0.00
    var discountChildAmount = 0.00
    var discountAdultAmount = 0.00

    discountPrice = dataSet['value']
    discountChildAmount = childPrice - childDiscountable
    discountAdultAmount = dataSet['adult_course_fee'] - adultDiscountable

    return ({
        totalPrice: totalPrice, totalWithDiscount: totalPriceWithDiscount, childPrice: childPrice,
        childDiscountable: childDiscountable, adultDiscountable: adultDiscountable, adultPrice: adultPrice,
        discount: discountPrice, adultDiscountAmount: discountAdultAmount, childDiscountAmount: discountChildAmount, discountType: dataSet['discount_type'], educationDiscount: educationDiscount
    })
}

export default EducationPricing;