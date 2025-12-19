import CommonLayout from "../../components/shop/common-layout";

const howtobuy = () => {

    return (
        <CommonLayout parent="Home" title='How to buy'>
            <div className='container mx-auto border m-5 p-5 rounded-3'>

                <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>How To Buy</h6>

                <div className='d-flex flex-wrap flex-column align-content-center align-items-start pt-5 col-11 container'>
                    <h4 style={{ fontSize: 14 }}>Step : 1 Browse the Website:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Visit the Aahaas website or Mobile app and browse through the wide range of products available.</p>

                    <h4 style={{ fontSize: 14 }}>Step : 2 Select Your Items:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Once you find the items you wish to purchase, click on them to view more details such as price, size, color, etc.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 3 Add to Cart:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> After selecting your desired items, click on the "Add to Cart" button. You can continue shopping or proceed to checkout.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 4 Review Your Cart:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Once you're ready to checkout, review the items in your cart to ensure everything is correct. You can also adjust quantities or remove items if needed.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 5 Proceed to Checkout:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Click on the "Checkout" button to proceed with your purchase..</p>


                    <h4 style={{ fontSize: 14 }}>Step : 6 Provide Shipping Information:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Enter your shipping address and any other required information accurately.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 7 Select Payment Method:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Choose your preferred payment method from options such as Credit/Debit Card, Net Banking, or Cash on Delivery (if available).</p>


                    <h4 style={{ fontSize: 14 }}>Step : 8 Place Your Order:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Review your order summary including shipping details and total cost. Once everything looks good, confirm your order by clicking on the "Place Order" button.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 9 Payment:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> If you chose a payment method requiring immediate payment, you will be directed to a secure payment gateway to complete the transaction. Follow the instructions to make the payment.</p>


                    <h4 style={{ fontSize: 14 }}>Step : 10 Confirmation:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>After successful payment, you will receive an order confirmation email with details of your purchase and estimated delivery time.</p>

                    <h4 style={{ fontSize: 14 }}>Step : 11 Track Your Order:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>You can track the status of your order by logging into your Aahaas account or using any tracking information provided in the confirmation email.</p>

                    <h4 style={{ fontSize: 14 }}>Step : 12 Receive Your Order:</h4>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Once your order is processed and shipped, you will receive your items at the shipping address provided during checkout.</p>
                </div>

            </div>

        </CommonLayout>

    )
}

export default howtobuy
