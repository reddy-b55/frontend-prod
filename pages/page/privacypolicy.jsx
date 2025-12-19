// import CommonLayout from "../../components/shop/common-layout";

// function privacypolicy() {
//     return (
//         <CommonLayout parent="Home" title='Privacy policy'>
//             <div className='container mx-auto border m-5 p-5 rounded-3'>

//                 <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>Privacy policy</h6>
//                 <p className="col-11 text-center mx-auto mb-3" style={{ fontSize: 12, lineHeight: '20px' }}>This Privacy Policy ("Policy") will help you understand how Aahaas ("us", "we", "our") uses and protects the data you provide to us when you visit and use Aahaas ("app", "service").We reserve the right to change this policy at any given time, of which you will be promptly updated. If you want to make sure that you are up to date with the latest changes, we advise you to frequently visit this page.</p>

//                 <div className='d-flex flex-wrap flex-column align-content-center align-items-start pt-5 col-11 container'>
//                     <h6 style={{ fontSize: 14 }}>What User Data We Collect?</h6>
//                     <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>When you visit the website, we may collect the following data your IP address, your contact information and email address other information such as interests and preferences, data profile regarding your online behavior on our website.</p>
//                     <h6 style={{ fontSize: 14 }}>Why We Collect Your Data?</h6>
//                     <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>We are collecting your data for several reasons to better understand your needs, to improve our services and products, to send you promotional emails containing the information we think you will find interesting, to contact you to fill out surveys and participate in other types of market research, to customize our website according to your online behavior and personal preferences.</p>
//                     <h6 style={{ fontSize: 14 }}>Safeguarding and Securing the Data</h6>
//                     <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Aahaas is committed to securing your data and keeping it confidential. Aahaas has done all in its power to prevent data theft, unauthorized access, and disclosure by implementing the latest technologies and software, which help us safeguard all the information we collect online.</p>
//                     <h6 style={{ fontSize: 14 }}>Our Cookie Policy</h6>
//                     <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Once you agree to allow our app to use cookies, you also agree to use the data it collects regarding your online behavior (analyze web traffic, web pages you spend the most time on, and websites you visit). The data we collect by using cookies is used to customize our app to your needs. After we use the data for statistical analysis, the data is completely removed from our systems. Please note that cookies don't allow us to gain control of your phone in any way. They are strictly used to monitor which pages you find useful and which you do not so that we can provide a better experience for you. If you want to disable cookies, you can do it by accessing the settings of your phone.</p>
//                 </div>

//             </div>
//         </CommonLayout>
//     )
// }

// export default privacypolicy



import CommonLayout from "../../components/shop/common-layout";

function privacypolicy() {
    return (
        <CommonLayout parent="Home" title='Privacy policy' showSearchIcon={false} showMenuIcon={false}>
            <div className='container mx-auto border m-5 p-5 rounded-3'>
                <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>Aahaas – Privacy Policy</h6>
                <p className="text-center mb-3" style={{ fontSize: 14, fontWeight: 'bold' }}>Effective Date: 8 June 2025</p>
                <p className="col-11 text-center mx-auto mb-4" style={{ fontSize: 12, lineHeight: '20px' }}>
                    Aahaas ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and share your personal information when you access our website, mobile application, or any of our services (collectively, the "Platform").
                    <br /><br />
                    By using Aahaas, you consent to the practices described in this Privacy Policy.
                </p>

                <div className='d-flex flex-wrap flex-column align-content-center align-items-start pt-4 col-11 container'>
                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>1. Information We Collect</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>We collect the following types of information:</p>
                    
                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>1.1 Information You Provide Directly</h6>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Name, email address, phone number, and profile photo (optional)</li>
                        <li>Billing address and payment details (processed via third-party gateway)</li>
                        <li>Travel preferences and saved itineraries</li>
                        <li>Messages or feedback sent via chat or support</li>
                    </ul>

                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>1.2 Information We Collect Automatically</h6>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Device information (e.g., mobile model, OS, browser)</li>
                        <li>IP address and geolocation (only for service personalization)</li>
                        <li>Session activity (pages viewed, time spent, buttons clicked)</li>
                        <li>Referral data (how you found us)</li>
                    </ul>

                    <h6 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: '10px' }}>1.3 Cookies and Similar Technologies</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        We use cookies and tracking technologies to enhance website functionality, remember user preferences, and analyze usage patterns. You can manage cookie settings through your browser preferences.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>2. How We Use Your Information</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>We use your information to:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Provide and personalize your experience on Aahaas</li>
                        <li>Process bookings and transactions</li>
                        <li>Offer relevant destination services and offers</li>
                        <li>Improve our products, content, and user support</li>
                        <li>Prevent fraud and ensure platform security</li>
                        <li>Send service-related messages (e.g., confirmations, reminders)</li>
                        <li>Notify you of updates, promotions, or changes to terms (with opt-out available)</li>
                    </ul>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px', fontWeight: 'bold' }}>
                        We do not sell or rent your personal information.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>3. Sharing Your Information</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>We may share your data with:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px', paddingLeft: '20px' }}>
                        <li><strong>Service Providers and Vendors:</strong> To fulfill bookings and deliver services you request</li>
                        <li><strong>Payment Processors:</strong> To complete secure financial transactions (we do not store full credit/debit card data)</li>
                        <li><strong>Technology Partners:</strong> Who assist with analytics, messaging, hosting, or app functionality</li>
                        <li><strong>Legal Authorities:</strong> When required to comply with laws, regulations, court orders, or to protect rights and safety</li>
                    </ul>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>4. Data Retention</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>We retain your personal data only as long as necessary to:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Provide services and support</li>
                        <li>Comply with legal and financial obligations</li>
                        <li>Improve user experience</li>
                    </ul>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Inactive accounts and associated data may be deleted or anonymized after 24 months of inactivity.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>5. Your Rights</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>Depending on your jurisdiction, you may have the right to:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '15px', paddingLeft: '20px' }}>
                        <li>Access a copy of your personal data</li>
                        <li>Correct or update inaccurate data</li>
                        <li>Delete your account and associated information</li>
                        <li>Withdraw consent (e.g., marketing messages)</li>
                        <li>Request data portability (EU residents)</li>
                    </ul>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        To exercise your rights, contact us at <strong>info@aahaas.com</strong>.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>6. Data Security</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>
                        We implement appropriate technical and organizational measures to protect your data from unauthorized access, disclosure, alteration, or destruction.
                    </p>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px' }}>Security features include:</p>
                    <ul style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px', paddingLeft: '20px' }}>
                        <li>Encrypted communication (HTTPS)</li>
                        <li>Role-based access control for internal users</li>
                        <li>Regular audits and server monitoring</li>
                        <li>No storage of credit/debit card numbers</li>
                    </ul>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>7. Children's Privacy</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        Aahaas is intended for users aged 18 and above. We do not knowingly collect data from children under 18. If we learn that personal information has been collected from a minor, we will delete it immediately.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>9. Changes to This Policy</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        We may update this Privacy Policy to reflect legal, technical, or business changes. The updated version will be posted with a new effective date. Continued use of Aahaas after changes indicates your acceptance.
                    </p>

                    <h6 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: '15px' }}>10. Contact Us</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>
                        If you have questions or concerns about this Privacy Policy or how your data is handled, please contact:<br />
                        <strong>Email: info@aahaas.com</strong>
                    </p>
                </div>
            </div>
        </CommonLayout>
    )
}

export default privacypolicy