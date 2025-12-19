import CommonLayout from "../../../components/shop/common-layout";

function termsandconditions() {
    return (
        <CommonLayout parent="Home" title='Terms and Conditions' showSearchIcon={false} showMenuIcon={false}>
            <div className='container mx-auto border m-5 p-5 rounded-3'>
                <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>Aahaas – Terms and Conditions</h6>
                <p className="text-center mb-3" style={{ fontSize: 14, fontWeight: 'bold' }}>Effective Date: 8 June 2025</p>
                <p className="col-11 text-center mx-auto mb-4" style={{ fontSize: 12, lineHeight: '20px' }}>
                    Welcome to Aahaas! These Terms and Conditions ("Terms") govern your access to and use of the Aahaas mobile application and website ("Platform"). By using our services, you agree to be bound by these Terms. If you do not agree, please discontinue use of the Platform.
                </p>

                <div className='d-flex flex-wrap flex-column align-content-center align-items-start pt-4 col-11 container'>
                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>1. Eligibility</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        You must be 18 years of age or older to use Aahaas. By accessing the Platform or using our services, you confirm that you meet this requirement and are legally capable of entering into binding agreements.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>2. Scope of Services</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>
                        Aahaas is a digital platform offering access to a wide range of travel-related products and services in the following categories:
                    </p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li><strong>Lifestyle:</strong> Dining, entertainment, wellness, shopping, tours, transport</li>
                        <li><strong>Education:</strong> Language classes, cultural workshops, local skills</li>
                        <li><strong>Hotels:</strong> Luxury, boutique, and specialty accommodations</li>
                        <li><strong>Flights:</strong> Domestic and international flight bookings</li>
                        <li><strong>Essentials:</strong> Toiletries, health services, travel necessities</li>
                        <li><strong>Non-Essentials:</strong> Souvenirs, gifts, luxury and leisure items</li>
                    </ul>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Unless otherwise stated, services are fulfilled by independent third-party vendors ("Vendors"). Aahaas acts as a facilitator.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>3. User Responsibilities</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>You agree to:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px', paddingLeft: '20px' }}>
                        <li>Provide accurate and updated information</li>
                        <li>Use the Platform only for lawful purposes</li>
                        <li>Maintain the confidentiality of your login credentials</li>
                        <li>Refrain from any form of fraud, misuse, or disruptive behavior</li>
                    </ul>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>4. Bookings, Cancellations & Refunds</h6>
                    
                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>4.1 Booking Confirmation & Cancellation Policy</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>
                        Bookings are confirmed only upon successful payment and receipt of a confirmation via email or in-app notification.
                    </p>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>
                        Each product or service includes a specific cancellation policy, shown at checkout. If the policy is unclear, customers are required to contact Aahaas via the in-app chat before confirming and making payment.
                    </p>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px' }}>
                        If no cancellation or refund policy is stated, the product or service is considered non-refundable and cannot be cancelled, changed, or rescheduled once confirmed.
                    </p>

                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>4.2 Refunds</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Refunds (where applicable) are subject to the cancellation terms set by the Vendor. Aahaas may assist in facilitating communication but is not responsible for the refund unless it is the direct provider of the service.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>5. Payments and Taxes</h6>
                    
                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>5.1 Payment Methods</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px' }}>
                        Aahaas currently accepts credit and debit card payments only, processed via secure third-party gateways.
                    </p>

                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>5.2 Supported Currencies</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px' }}>
                        Payments can be made in Sri Lankan Rupees (LKR) or United States Dollars (USD). Currency selection is available at checkout.
                    </p>

                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>5.3 Taxes</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        All displayed prices include applicable taxes as reported by the Vendor. If additional local taxes or surcharges apply (e.g. tourism taxes), they will be clearly stated and added to your invoice or communicated in advance.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>6. Pricing & Availability</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Prices and availability may change at any time. Aahaas reserves the right to cancel bookings affected by pricing or inventory errors and will issue a full refund where applicable.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>7. Intellectual Property</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        All content on the Platform (logos, media, designs, and written material) is the property of Aahaas or its licensors. Unauthorized use is strictly prohibited.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>8. Vendor Obligations</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>Vendors agree to:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Provide accurate service and pricing details</li>
                        <li>Fulfill all confirmed orders reliably</li>
                        <li>Comply with all applicable tax, legal, and service standards</li>
                    </ul>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Failure to comply may result in removal from the Platform.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>9. Service Limitations & Disclaimer</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Aahaas facilitates connections between users and Vendors but is not responsible for service issues caused by third parties. Unless explicitly stated, Aahaas does not guarantee any specific outcome, timeline, or result.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>10. Limitation of Liability</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        To the maximum extent permitted by law, Aahaas shall not be liable for any indirect, incidental, or consequential damages, including lost profits, data, or bookings.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>11. Termination of Use</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Aahaas reserves the right to suspend or terminate your account or access to the Platform at any time, without prior notice, if you violate these Terms or disrupt service operations.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>12. Governing Law and Jurisdiction</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        These Terms shall be governed by the laws of Singapore. Any disputes arising under or related to the Platform will be subject to the exclusive jurisdiction of the courts in Singapore.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>13. Modifications to Terms</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Aahaas may revise these Terms from time to time. Any changes will be posted on the Platform and will be effective immediately upon publication. Continued use of the Platform implies your acceptance of the updated Terms.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>14. Privacy</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Use of Aahaas is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>15. Contact Us</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        If you have any questions or need support, please contact us at:<br />
                        <strong>Email: info@aahaas.com</strong>
                    </p>
                </div>
            </div>
        </CommonLayout>
    )
}

export default termsandconditions