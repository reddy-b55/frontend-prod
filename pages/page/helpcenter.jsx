import { useRouter } from 'next/router';
import { useContext, useState } from 'react';

import { AppContext } from '../_app';
import CommonLayout from "../../components/shop/common-layout";
import ToastMessage from '../../components/Notification/ToastMessage';
import {db} from '../../firebase'
import { addDoc, collection } from 'firebase/firestore';


const helpcenter = () => {

    const faqData = [
        // Getting Started
        { 
            category: "🔍 Getting Started",
            question: "What is Aahaas?", 
            answer: "Aahaas is a personalized travel platform that lets you explore and book curated experiences, essential services, flights, and more — all tailored to your preferences." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Who can use Aahaas?", 
            answer: "Aahaas is available to users who are 18 years or older." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Is Aahaas available in my country?", 
            answer: "Aahaas is currently available in Sri Lanka, Singapore, and other select Southeast Asian destinations, with expansion underway." 
        },
        { 
            category: "🔍 Getting Started",
            question: "How do I sign up for Aahaas?", 
            answer: "Download the app, tap 'Sign In' to login using Google, Apple or any of the common convenient sign in options. You can also use 'Sign Up' to register using your email or mobile number." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Do I need to download the app to use Aahaas?", 
            answer: "Yes. Aahaas is a mobile-first platform. A desktop version is available with limited functionality." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Are bookings confirmed instantly?", 
            answer: "Most bookings are instantly confirmed after payment. However, some may require a brief verification due to overbooking, inventory limits, or vendor-side delays. In such cases, Aahaas will notify you and either confirm, offer alternatives, or process a refund." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Can I use Aahaas without creating an account?", 
            answer: "You can use Guest mode with limited functionalities. An account is required for booking, managing orders, and accessing personalized services." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Is Aahaas free to use?", 
            answer: "Yes. Browsing is free. You only pay when confirming a booking or purchase." 
        },
        { 
            category: "🔍 Getting Started",
            question: "How do I track my bookings?", 
            answer: "Go to the 'Order History' section in the app to view, track, and manage all your bookings." 
        },
        { 
            category: "🔍 Getting Started",
            question: "Is Aahaas available on iOS and Android?", 
            answer: "Yes. Aahaas is available on both the Apple App Store and Google Play." 
        },

        // Booking Services
        { 
            category: "✈️ Booking Services",
            question: "What services can I book through Aahaas?", 
            answer: "You can book services across six categories: Lifestyle (tours, dining, wellness, etc.), Education (cultural experiences, workshops), Hotels, Flights, Essentials (toiletries, basics), Non-Essentials (gifts, souvenirs)." 
        },
        { 
            category: "✈️ Booking Services",
            question: "How far in advance can I book?", 
            answer: "You can book anytime — days, weeks, or up to one year in advance, depending on the product and destination." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Can I book activities after I arrive?", 
            answer: "Yes. Many services allow same-day or next-day booking while you're at the destination." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Can I use Aahaas on a desktop?", 
            answer: "Yes. A desktop version is currently available with limited functionality. For the best experience, use the mobile app." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Can I book for friends or family?", 
            answer: "Yes. Use the 'Travel Buddies' feature to set up and manage travel profiles for companions and book on their behalf." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Are group bookings supported?", 
            answer: "Yes. Many products and services support group options. Prices are already specified. If further support is required, please contact customer support via chat." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Can I request custom or private tours?", 
            answer: "Yes. Some vendors support custom experiences. Use the chat icon on the product page or contact Aahaas support." 
        },
        { 
            category: "✈️ Booking Services",
            question: "Are ratings and reviews available?", 
            answer: "Yes. Products and service ratings are available for some of the products. As more customers use the products and services, more reviews will be added progressively." 
        },

        // Payments & Pricing
        { 
            category: "💳 Payments & Pricing",
            question: "What payment methods are accepted?", 
            answer: "Aahaas currently accepts credit and debit card payments only." 
        },
        { 
            category: "💳 Payments & Pricing",
            question: "Can I pay in my local currency?", 
            answer: "Yes. Payments can be made in LKR or USD, depending on your location and selection at checkout." 
        },
        { 
            category: "💳 Payments & Pricing",
            question: "Is it safe to make payments on Aahaas?", 
            answer: "Yes. Aahaas uses bank-grade encryption and secure third-party gateways. We do not store full card details." 
        },
        { 
            category: "💳 Payments & Pricing",
            question: "Are there promo codes or discounts?", 
            answer: "Yes. Keep an eye on app notifications and emails for special offers and discounts." 
        },
        { 
            category: "💳 Payments & Pricing",
            question: "Can I view my transaction history?", 
            answer: "Yes. All details are available in the Order History section of the app, including receipts and payment status." 
        },
        { 
            category: "💳 Payments & Pricing",
            question: "What happens if my payment fails?", 
            answer: "If your payment fails, you'll receive a prompt. Retry with another method or contact support for help." 
        },

        // Cancellations & Refunds
        { 
            category: "🔁 Cancellations & Refunds",
            question: "What is the refund policy?", 
            answer: "Each product has its own cancellation and refund policy based on the service and destination. You must review the policy before booking. If not clear, contact support via in-app chat. If no policy is mentioned, the service is considered non-refundable." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "How do I cancel a booking?", 
            answer: "Go to Order History, open the relevant booking, and cancel if you are within the allowed cancellation window. If not, the order is non-cancellable." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "How long do refunds take?", 
            answer: "Refunds are typically processed within 7–14 business days, depending on your bank and the vendor." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "What if the cancellation policy is unclear?", 
            answer: "If cancellation terms are unclear, contact support via chat before confirming your payment. If no policy is listed, the service is non-refundable." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "Can I change the date or time of a booking?", 
            answer: "In some cases, yes — depending on vendor policies and availability. Contact support for assistance." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "Can I cancel part of a multi-service or group booking?", 
            answer: "Partial cancellations may be allowed, but depend on the vendor's terms. Reach out to support to verify." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "What happens if the vendor cancels my service?", 
            answer: "You will be notified immediately and offered an alternate option or a full refund." 
        },
        { 
            category: "🔁 Cancellations & Refunds",
            question: "Who handles cancellations — Aahaas or the vendor?", 
            answer: "Aahaas facilitates cancellations, but the final terms are set by the vendor. We're here to assist you throughout the process." 
        },

        // App Features & Support
        { 
            category: "📲 App Features & Support",
            question: "How do I receive updates or reminders?", 
            answer: "You'll get real-time notifications via the app and email for all bookings, status updates, and recommendations." 
        },
        { 
            category: "📲 App Features & Support",
            question: "Can I share my itinerary with others?", 
            answer: "Yes. You can share your itinerary or planned experiences via the app using sharing options." 
        },
        { 
            category: "📲 App Features & Support",
            question: "Can I chat with a vendor before booking?", 
            answer: "Yes. If a vendor has enabled messaging, a chat icon will appear on the product page for direct inquiries." 
        },
        { 
            category: "📲 App Features & Support",
            question: "How do I contact Aahaas for help?", 
            answer: "You can reach us through the in-app chat or email at info@aahaas.com." 
        },
        { 
            category: "📲 App Features & Support",
            question: "What is cart sharing in Aahaas?", 
            answer: "Cart sharing allows you to collaborate with others while planning a trip. You can add experiences, services, or bookings to your cart and share it with friends or family — even across locations. Updates made to the shared cart are reflected in real time, so everyone sees the latest version and can suggest changes or proceed with bookings together." 
        },
        { 
            category: "📲 App Features & Support",
            question: "What is dynamic delivery?", 
            answer: "Dynamic delivery means that products and services are delivered based on your tour itinerary, preferred locations, and availability. For example, essentials can be delivered to your hotel on arrival, local experiences may be aligned with your travel flow, and timing for pickups or services will adjust based on your actual journey — making your experience seamless and personalized." 
        },
        { 
            category: "📲 App Features & Support",
            question: "How does the summary page help with the itinerary?", 
            answer: "The summary page gives you a clear, organized view of everything you've selected before confirming your booking. It helps you cross-check dates, times, participants, locations, and pricing. This ensures that your itinerary is accurate, complete, and aligned with your travel goals before proceeding to payment." 
        },
        { 
            category: "📲 App Features & Support",
            question: "Can I favorite or save services for later?", 
            answer: "You can add them to the cart for confirming later. However, the products and services may become unavailable as products get sold everyday." 
        }
    ];

    const router = useRouter();

    const { userId, baseUserId, userStatus } = useContext(AppContext);

    const [chatCreating, setChatCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const createNewChat = async () => {
        setChatCreating(true);
        if (chatCreating) {
            ToastMessage({ status: "warning", message: "Already a chat has been initiated" })
        } else {
            if (userStatus.userLoggesIn) {
                await addDoc(collection(db, "customer-chat-lists"), {
                    status: 'Pending',
                    createdAt: new Date(),
                    supplierAdded: 'false',
                    notifyAdmin: 'true',
                    notifySupplier: 'false',
                    notifyCustomer: 'false',
                    customer_collection_id: baseUserId.cxid,
                    supplier_id: '',
                    supplier_name: '',
                    group_chat: '',
                    customer_name: baseUserId.user_username,
                    customer_mail_id: baseUserId.user_email,
                    supplier_mail_id: '',
                    supplier_added_date: '',
                    comments: 'Technical support - chat has been created from help center page',
                    chat_name: `Aahaas Conversation ( technical support )`,
                    customer_id: baseUserId.cxid,
                    chat_related: 'Technical-support',
                    chat_avatar: '',
                    updatedAt: new Date()
                });
                router.push("/page/account/chats/");
            } else {
                router.push("/page/account/login-auth");
                localStorage.setItem("lastPath", router.asPath)
                ToastMessage({ status: "error", message: "You are logged in as a guest user. Please login to access the full system features" })
            }
        }
        setChatCreating(false);
    }


      const [chatCreating2, setChatCreating2] = useState(false);
    
        const handleAskMoreQuestions = async () => {
            setChatCreating2(true);
            if (chatCreating2) {
                ToastMessage({ status: "warning", message: "Already a chat has been initiated" })
            } else {
                if (userStatus.userLoggesIn) {
                    await addDoc(collection(db, "customer-chat-lists"), {
                        status: 'Pending',
                        createdAt: new Date(),
                        supplierAdded: 'false',
                        notifyAdmin: 'true',
                        notifySupplier: 'false',
                        notifyCustomer: 'false',
                        supplier_name: '',
                        customer_name: baseUserId.user_username,
                        customer_mail_id: baseUserId.user_email,
                        supplier_mail_id: '',
                        comments: 'General support - chat has been created from help center page',
                        customer_id: baseUserId.cxid,
                        chat_related: 'General-support',
                        customer_collection_id: baseUserId.cxid,
                        chat_related_to: "Product",
                        supplier_mail_id: "aahaas@gmail.com",
                        group_chat: 'true',
                        supplier_added_date: Date.now(),
                        customer_id: baseUserId.cxid,
                        chat_category: '5',
                        chat_avatar: '',
                        supplier_id: '',
                        chat_name: `Aahaas Conversation ( General support )`,
                        // comments: 'Product support - chat has been created from product details',
                        updatedAt: new Date()
                    }).then((response) => {
                        setChatCreating2(false);
                        // router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
                        const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
                        window.open(chatUrl, "_blank");
                    });
                } else {
                    router.push("/page/account/login-auth");
                    localStorage.setItem("lastPath", router.asPath)
                    ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
                }
            }
        }

    
    // Function to handle asking more questions
    // const handleAskMoreQuestions = () => {
    //     console.log("Ask more questions button clicked");
    // };

    // Get unique categories
    const categories = ['All', ...new Set(faqData.map(item => item.category))];

    // Filter FAQs based on search query and selected category
    const filteredFaqData = faqData.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <CommonLayout parent="Home" title='Help center' showSearchIcon={false} showMenuIcon={false}>
            <div className='container mx-auto border m-5 p-5 rounded-3'>

                <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px' }}>Aahaas – Frequently Asked Questions (FAQ)</h6>
                <p className="text-center mb-3" style={{ fontSize: 14, fontWeight: 'bold' }}>Effective: 8 June 2025</p>
                <p className="col-11 text-center mx-auto mb-4" style={{ fontSize: 12, lineHeight: '20px' }}>At Aahaas, your satisfaction is our priority. Whether you need help with your account, orders, shipping, or returns, our support team is here for you. Explore our FAQ section for quick answers or contact us directly for personalized assistance. We're dedicated to making your shopping experience seamless and enjoyable.</p>

                {/* Ask More Questions Button */}
                <div className="text-center mb-3">
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={handleAskMoreQuestions}
                        style={{ fontSize: '12px' }}
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            fill="currentColor" 
                            className="me-2" 
                            viewBox="0 0 16 16"
                        >
                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 10.97 10.97 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8.06 8.06 0 0 0 8 14c3.996 0 7-2.807 7-6 0-3.192-3.004-6-7-6S1 4.808 1 8c0 1.468.617 2.83 1.678 3.894zm-.493 3.905a21.682 21.682 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a9.68 9.68 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105z"/>
                        </svg>
                        {chatCreating2 ? "Initialing": "Ask More Questions"}
                    </button>
                </div>

                {/* Search Bar */}
               <div className="position-relative mb-3">
                    <input 
                        type="text" 
                        placeholder="Search FAQs" 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="form-control"
                        style={{ paddingRight: searchQuery ? '40px' : '12px' }}
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            className="btn position-absolute d-flex align-items-center justify-content-center"
                            onClick={() => setSearchQuery('')}
                            style={{
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '24px',
                                height: '24px',
                                padding: '0',
                                fontSize: '14px',
                                color: '#ff0000ff',
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '50%'
                            }}
                            title="Clear search"
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e9ecef'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                        >
                            ×
                        </button>
                    )}
                </div>
                {/* Category Filter */}
                <div className="mb-4">
                    <div className="d-flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={`btn btn-sm ${selectedCategory === category ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSelectedCategory(category)}
                                style={{ fontSize: '12px' }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ Items */}
                <div className='d-flex flex-wrap flex-column align-content-left align-items-start pt-3 col-11 container'>
                    {
                        filteredFaqData.map((value, key) => (
                            <div key={key} className="mb-3 w-100">
                                <div 
                                    className="d-flex justify-content-between align-items-center"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleFaq(key)}
                                >
                                    <h3 style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}>
                                        {value.question}
                                    </h3>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {openFaqIndex === key ? '−' : '+'}
                                    </span>
                                </div>
                                {openFaqIndex === key && (
                                    <div className="mt-2 pt-2 border-top">
                                        <p style={{ fontSize: 12, lineHeight: '20px', marginBottom: '10px', color: '#666' }}>
                                            {value.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>

                {/* No Results Message */}
                {filteredFaqData.length === 0 && (
                    <div className="text-center py-4">
                        <p style={{ fontSize: 14, color: '#666' }}>No FAQs found matching your search criteria.</p>
                    </div>
                )}

                {/* <div className="col-12 d-flex flex-column border-top align-items-center my-4 pt-4">
                    <p>Still stuck? Help is just a message away</p>
                    <button className="btn btn-sm btn-solid" onClick={() => createNewChat()}>Contact us</button>
                </div> */}

            </div>
        </CommonLayout>
    )
}

export default helpcenter;