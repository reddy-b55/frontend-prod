import CartCurrencyConverter from "./CartCurrencyConverter";

const uniqueDelivery = (array = [], keys = []) => {
    if (!keys.length || !array.length) return [];

    return array.reduce((list, item) => {
        const hasItem = list.find(listItem =>
            keys.every(key => listItem[key] === item[key])
        );
        if (!hasItem) list.push(item);
        return list;
    }, []);
};


function EssentialDetailPricing(productPrice, quantity, productData) {

    if (quantity == 0) {
        quantity = 1
    }

    if (productData?.discount_type_id == 'ps') {

        if (quantity >= productData?.['discount_min_order_qty'] && quantity <= productData?.['discount_max_order_qty']) {
            return {
                priceWithDiscount: ((productPrice.mrp - (productPrice.mrp * (productData?.['discount_percentage'] / 100))) * quantity),
                priceWithoutDiscount: productPrice.mrp * quantity,
                discountPrice: productData?.['discount_percentage'],
                eachItemPrice: productPrice.mrp,
                symbol: '%'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData?.['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }

    }
    else if (productData?.discount_type_id == 'fps') {


        if (quantity >= productData?.['discount_min_order_qty'] && quantity <= productData?.['discount_max_order_qty']) {
            return {
                priceWithDiscount: ((productPrice.mrp - productData?.['discount_amount']) * quantity),
                priceWithoutDiscount: productPrice.mrp * quantity,
                discountPrice: productData?.['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData?.['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }

    }
    else if (productData?.discount_type_id == 'bogof') {
        if (quantity >= productData?.['discount_min_order_qty'] && quantity <= productData?.['discount_max_order_qty']) {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData?.['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData?.['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
    }
    else {
        return {
            priceWithDiscount: Number(productPrice['mrp']) * quantity,
            priceWithoutDiscount: Number(productPrice['mrp']) * quantity,
            discountPrice: productData?.['discount_amount'],
            eachItemPrice: productPrice.mrp,
            symbol: 'LKR'
        }
    }
}

function essentialsPricing(dataSet, currency) {
    var discount = CartCurrencyConverter(dataSet?.['esCurrency'], EssentialDetailPricing(dataSet, dataSet['quantity'], dataSet)['discountPrice'], currency)
    var mrp = CartCurrencyConverter(dataSet?.['esCurrency'], EssentialDetailPricing(dataSet, dataSet['quantity'], dataSet)['priceWithDiscount'], currency)
    var eachPrice = CartCurrencyConverter(dataSet?.['esCurrency'], EssentialDetailPricing(dataSet, dataSet['quantity'], dataSet)['eachItemPrice'], currency)
    var amounts = CartCurrencyConverter(dataSet?.['esCurrency'], EssentialDetailPricing(dataSet, dataSet['quantity'], dataSet)['priceWithDiscount'], currency)
    var pre_id = dataSet['essential_pre_order_id'];
    var listing_id = dataSet['essential_listing_id'];
    var essentialDelivery = CartCurrencyConverter(dataSet?.['DeliveryCurrency'], dataSet['deliveryRate'], currency)
    var deliveryRateID = dataSet['deliveryRateID'];
    return ({
        discount: discount,
        totalAmount: amounts, mrpRate: mrp, eachItem: eachPrice, preid: pre_id, listingid: listing_id,
        delivery: essentialDelivery, qty: dataSet['quantity'], essrateid: dataSet['essentialsRateId'], essinvenid: dataSet['essential_inventory_id'], payid: dataSet['payment_options'],
        deliveryRateID: deliveryRateID,
        deliveryDate: dataSet['preffered_date'],
        disid: dataSet['discount_id']
    });
}



const cartCheckoutPricing = (dataSet, currency) => {
    var total = 0.00
    var discount = 0.00
    var delivery = 0.00


    var deliveryArray = new Array()


    var deliveryFinal = new Array()

    dataSet?.forEach(cartDt => {

        // if (cartDt.main_category_id == 3) {
        //     total = total + parseFloat(lifeStylePricing(cartDt, currency)['totalAmount'])
        //     discount = discount + parseFloat(lifeStylePricing(cartDt, currency)['discount'])
        // }

        // else if (cartDt.main_category_id == 4) {
        //     var hotelDataSet = JSON.parse(cartDt.bookingdataset)

        //     total = total + parseFloat(hotelsPricing(hotelDataSet, currency)['totalAmount'])
        //     discount = discount + parseFloat(hotelsPricing(hotelDataSet, currency)['discount'])
        // }

        // else if (cartDt.main_category_id == 5) {
        //     total = total + parseFloat(educationPricing(cartDt, currency)['totalAmount'])
        //     discount = discount + parseFloat(educationPricing(cartDt, currency)['discount'])
        // }

        if (cartDt.main_category_id == 1) {
            total = total + parseFloat(essentialsPricing(cartDt, currency)['mrpRate'])
            discount = discount + parseFloat(essentialsPricing(cartDt, currency)['discount'])

            deliveryArray.push(
                {
                    cartPreID: cartDt?.customer_cart_id,
                    deliveryDate: essentialsPricing(cartDt, currency)['deliveryDate'],
                    deliveryRateID: essentialsPricing(cartDt, currency)['deliveryRateID'],
                    deliveryCharge: parseFloat(essentialsPricing(cartDt, currency)['delivery']),
                }
            )
        }

        else if (cartDt.main_category_id == 2) {
            total = total + parseFloat(essentialsPricing(cartDt, currency)['mrpRate'])
            discount = discount + parseFloat(essentialsPricing(cartDt, currency)['discount'])
            deliveryArray.push(
                {
                    cartPreID: cartDt?.customer_cart_id,
                    deliveryDate: essentialsPricing(cartDt, currency)['deliveryDate'],
                    deliveryRateID: essentialsPricing(cartDt, currency)['deliveryRateID'],
                    deliveryCharge: parseFloat(essentialsPricing(cartDt, currency)['delivery']),
                }
            )
        }


    });


    deliveryFinal = uniqueDelivery(deliveryArray, ["deliveryRateID", "deliveryDate"])



    deliveryFinal.forEach(element => {
        delivery = delivery + element['deliveryCharge']
    });

    var finalTotal = total



    return ({ totalAmt: finalTotal, discountPrice: discount, totalCartPrice: finalTotal + delivery, delivery: delivery, deliveryArray: deliveryArray })
}

export { essentialsPricing, cartCheckoutPricing, EssentialDetailPricing };