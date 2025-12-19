import { useEffect } from 'react';
import CommonLayout from '../../components/shop/common-layout';

const CodeOfConduct = () => {

    return (
        <CommonLayout parent="Home" title='Code of conduct'>

            <div className='container mx-auto border m-5 p-5 rounded-3'>

                <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>Aahaas Seller Code of Conduct</h6>
                <p className="col-11 text-center mx-auto mb-3" style={{ fontSize: 12, lineHeight: '20px' }}>At Aahaas, we are committed to fostering a fare, transparent, and respectful marketplace for both sellers and buyers. As a seller on our platform, we expect you to adhere to the following code of conduct:</p>

                <div className='d-flex flex-wrap flex-column align-content-center align-items-start pt-5 col-11 container'>

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Honesty and Integrity:</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Conduct your business with honesty and integrity at all times. Provide accurate information about your products, pricing, and shipping policies.</p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Transparency: </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Be transparent in your dealings with customers. Clearly communicate all relevant information about your products, including any terms and conditions, warranties, or return policies. </p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}> Respect for Customers: </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Treat all customers with respect and professionalism. Respond promptly to inquiries and address any concerns or issues they may have in a courteous manner.</p>
                    {/* </div> */}


                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Quality of Products:  </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>Ensure that the products you list on Aahaas meet high standards of quality and craftsmanship. Strive to deliver products that exceed customer expectations. </p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Compliance with Laws and Regulations: </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Abide by all applicable laws, regulations, and industry standards governing your business operations, including but not limited to product safety, labeling, and advertising regulations. </p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Protection of Intellectual Property:</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Respect the intellectual property rights of others. Do not list or sell counterfeit or unauthorized products on Aahaas. </p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Fare Pricing:</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Price your products fairly and competitively. Avoid engaging in price gouging or deceptive pricing practices.</p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Timely Fulfillment: </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>  Fulfill orders in a timely manner and provide accurate shipping information to customers. Communicate any delays or issues with order fulfillment promptly.</p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}>Data Protection and Privacy: </h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Protect the privacy and personal information of your customers in accordance with applicable data protection laws. Safeguard sensitive information and use it only for the purpose for which it was collected. </p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}> Feedback and Improvement:</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}>  Welcome feedback from customers and use it as an opportunity for continuous improvement. Strive to provide an exceptional shopping experience that encourages repeat business and positive reviews.</p>
                    {/* </div> */}

                    {/* <div className='mb-5 aboutProducts-main-head d-flex flex-column align-items-center text-center'> */}
                    <h6 style={{ fontSize: 14 }}> Compliance with Aahaas Policies:</h6>
                    <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '20px' }}> Familiarize yourself with and adhere to Aahaas's policies, terms of service, and community guidelines. Violations of these policies may result in disciplinary action, including suspension or termination of your seller account. </p>
                    {/* </div> */}

                </div>

            </div >
        </CommonLayout >
    )
}

export default CodeOfConduct