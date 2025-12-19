import { useState } from "react";
import CurrencyConverter from "../CurrencyConverter/CurrencyConverter";

const CalculateAllCost = (props, value) => {
    let totalCost = 0.00;

    let lifestyStyleCost = 0.00;
    let essentialTotalCost = 0.00;

    const [moreDetails, setMoreDetails] = useState([]);

    let newDetails = [];

    value.forEach((item) => {
        if (item.main_category_id === 3 && item.maincat_type === "Lifestyle") {
            let lifestyAdultCost = CurrencyConverter(item.lsCurrency, item.adult_rate, props.currency);
            let lifestyChildCost = CurrencyConverter(item.lsCurrency, item.child_rate, props.currency);
            lifestyStyleCost += Number(lifestyAdultCost) + Number(lifestyChildCost);
            let more = {
                name: item.lifestyle_name,
                shippingCost: 0.00
            }
            newDetails.push(more);
        } else if (item.main_category_id === 1 && item.maincat_type === "Essential") {
            let essentialCost = CurrencyConverter(item.esCurrency, item.mrp, props.currency);
            essentialTotalCost += Number(essentialCost);
            let more = {
                name: item.listing_title,
                shippingCost: CurrencyConverter(item.esCurrency, item.deliveryRate, props.currency)
            }
            newDetails.push(more);
        }
    });

    setMoreDetails(newDetails);

    totalCost = lifestyStyleCost + essentialTotalCost;

    return { totalCost, lifestyStyleCost, essentialTotalCost, moreDetails };
}

const showPricing = (productPrice, quantity, productData, currency) => {

    if (productData['discount_type_id'] === 'ps') {

        return (
            <div className="container container-pricing">
                <h6 className="priceOffer bogofStatus col-lg-12 mb-1"><strong className=""></strong>
                    <span className="promotion__TagProd mb-1">{parseInt(productData['discount_percentage'])}% off when you buy {productData['discount_min_order_qty']} or More</span>
                </h6>
                <h6 className="price h3 productPrice productPriceCart col-lg-12 mt-2">

                    {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty'] ?
                        // (productPrice.mrp - ((productPrice.mrp * (productData['discount_percentage'] / 100)))) * quantity
                        CurrencyConverter(productData.currency, ((productPrice.mrp - (productPrice.mrp * (productData['discount_percentage'] / 100))) * quantity), currency)
                        :

                        CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)

                    }

                </h6>
            </div>
        );
    }

    else if (productData['discount_type_id'] === 'fps') {


        return (
            <div className="container  container-pricing">
                <h6 className="priceOffer bogofStatus col-lg-12 mb-1"><strong className="price"></strong>
                    <span className="promotion__TagProdFPS mb-1">
                        {CurrencyConverter(productData.currency, parseInt(productData['discount_amount']), currency)} off each when you buy {productData['discount_min_order_qty']} or More
                    </span>
                </h6>
                <h6 className="price h3 productPrice productPriceCart mt-3 ml-3"> {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty'] ?

                    CurrencyConverter(productData.currency, ((productPrice.mrp - productData['discount_amount']) * quantity), currency)

                    :

                    CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)

                }

                </h6>
            </div>
        );
    }

    else if (productData['discount_type_id'] === 'bogof') {



        return (
            <div className="container  container-pricing">
                <h6 className="priceOffer bogofStatus col-lg-12"><strong className="price"></strong>
                    <span className="promotion__TagProdBOGOF mb-1">
                        Get {productData['offer_product_title']} Free When You Buy {productData['discount_min_order_qty']} or More
                    </span>
                </h6>
                <h6 className="price h3 productPrice productPriceCart col-lg-12 mt-3">{CurrencyConverter(productData.currency, productPrice.mrp * quantity, currency)}</h6>
                {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']
                    ?
                    <h6 className="priceOffer price bogofStatus ml-3"><i className="bi bi-gift-fill mr-3"></i>{productData['offer_product_title']}</h6>
                    :
                    null
                }
            </div>
        );
    }
    else {
        return (
            <span className="price h3 productPrice productPriceCart ml-3">

                {CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)}

            </span>
        );
    }


}

export { CalculateAllCost, showPricing };
