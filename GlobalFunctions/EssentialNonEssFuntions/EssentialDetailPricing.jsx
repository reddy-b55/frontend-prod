function EssentialDetailPricing(productPrice, quantity, productData, currency) {

    if (productData.discount_type_id === 'ps') {
        if (quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']) {
            return {
                priceWithDiscount: ((productPrice.mrp - (productPrice.mrp * (productData['discount_percentage'] / 100))) * quantity),
                priceWithoutDiscount: productPrice.mrp * quantity,
                discountPrice: productData['discount_percentage'],
                eachItemPrice: (productPrice.mrp - (productPrice.mrp * (productData['discount_percentage'] / 100))),
                symbol: '%'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }

    }
    else if (productData.discount_type_id === 'fps') {

        if (quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']) {
            return {
                priceWithDiscount: ((productPrice.mrp - productData['discount_amount']) * quantity),
                priceWithoutDiscount: productPrice.mrp * quantity,
                discountPrice: productData['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }

    }
    else if (productData.discount_type_id === 'bogof') {
        if (quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']) {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
        else {
            return {
                priceWithDiscount: productPrice['mrp'] * quantity,
                priceWithoutDiscount: productPrice['mrp'] * quantity,
                discountPrice: productData['discount_amount'],
                eachItemPrice: productPrice.mrp,
                symbol: 'LKR'
            }
        }
    }
    else {
        return {
            priceWithDiscount: productPrice['mrp'] * quantity,
            priceWithoutDiscount: productPrice['mrp'] * quantity,
            discountPrice: productData['discount_amount'],
            eachItemPrice: productPrice.mrp,
            symbol: 'LKR'
        }
    }
}



export default EssentialDetailPricing;