import CartCurrencyConverter from "../CurrencyConverter/CartCurrencyConverter";
import CurrencyConverter from "../CurrencyConverter/CurrencyConverter";

const Showpricing = (productPrice, quantity, productData, currency) => {

    if (productData['discount_type_id']==='ps') {

        return (
            <span className="container">
                <span className="">{parseInt(productData['discount_percentage'])}% off when you buy {productData['discount_min_order_qty']} or More</span>
                <br />
                <span className="col-lg-12 ">
                    {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty'] ?
                        // (productPrice.mrp - ((productPrice.mrp * (productData['discount_percentage'] / 100)))) * quantity
                        CurrencyConverter(productData.currency, ((productPrice.mrp - (productPrice.mrp * (productData['discount_percentage'] / 100))) * quantity), currency)
                        :
                        CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)
                    }
                </span>
            </span>
        );
    }

    else if (productData['discount_type_id']==='fps') {
        return (
            <span className="container">
                <span className="">
                    {CurrencyConverter(productData.currency, parseInt(productData['discount_amount']), currency)} off each when you buy {productData['discount_min_order_qty']} or More
                </span>
                <br />
                <span className=""> {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty'] ?
                    CartCurrencyConverter(productData.currency, ((productPrice.mrp - productData['discount_amount']) * quantity), currency)
                    :
                    CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)
                }
                </span>
            </span>
        );
    }

    else if (productData['discount_type_id']==='bogof') {
        return (
            <span className="container">
                <span className="">
                    Get {productData['offer_product_title']} Free When You Buy {productData['discount_min_order_qty']} or More
                </span>
                <br />
                <span className="col-lg-12">{CurrencyConverter(productData.currency, productPrice.mrp * quantity, currency)}</span>
                {quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']
                    ?
                    <span className="priceOffer price bogofStatus"><i className="bi bi-gift-fill mr-3"></i>{productData['offer_product_title']}</span>
                    :
                    null
                }
            </span>
        );
    }
    else {
        return CurrencyConverter(productData.currency, (productPrice.mrp * quantity), currency)
    }

}

export default Showpricing;