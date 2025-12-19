import CurrencyConverter from "../CurrencyConverter/CurrencyConverter";





const getEssentialProductDetails = (value, baseCurrencyValue) => {
    let result = [];
    return (
        <div>
            <p>{value.listing_title}</p>
            <p>{value.listing_description}</p>
            <p>
                {value.currency}
                {value.balance_amount}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.balance_amount, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.currency}
                {value.paid_amount}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.balance_amount, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.currency}
                {value.total_amount}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.balance_amount, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.quantity}
            </p>
            <p>
                {value.currency}
                {value.each_item_price}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.each_item_price, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.currency}
                {value.total_price}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.total_price, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.currency}
                {value.discount_price}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.discount_price, baseCurrencyValue)}
                </span>
            </p>
            <p>
                {value.bogof_item_name}
            </p>
            <p>
            {value.currency}
                {value.delivery_charge}
                <span>
                    Converted into your base currency {CurrencyConverter(value.currency, value.delivery_charge, baseCurrencyValue)}
                </span>
            </p>
            <p>{value.supplier_status}</p>
            <p>{value.delivery_status}</p>
            <p>{value.booking_status}</p>
            <p>{value.accounts_status}</p>
            <p>{value.delivery_date}</p>
            <p>{value.delivery_address}</p>
        </div>
    )

    // result.push("balance_amount", value.balance_amount)
    // result.push("paid_amount", value.paid_amount)
    // result.push("total_amount", value.total_amount)
    // result.push("quantity", value.quantity)
    // result.push("each_item_price", value.each_item_price)
    // result.push("total_price", value.total_price)
    // result.push("discount_price", value.discount_price)
    // result.push("bogof_item_name", value.bogof_item_name)
    // result.push("delivery_charge", value.delivery_charge)

    // return result;
}

export {  getEssentialProductDetails };