import axios from 'axios';
import Head from 'next/head';
import Slider from 'react-slick';
import Select from 'react-select';
import moment from 'moment/moment';
import { useRouter } from 'next/router';
import DatePicker from 'react-date-picker';

import { addDoc, collection } from "firebase/firestore";
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Col, Container, Media, Row } from 'reactstrap';
import { AppContext } from "../../_app";
import { db } from "../../../firebase";
import { getEducationData, getPricingbytimeslot } from "../../../AxiosCalls/EducationServices/educationServices";
import { getProductReiews } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";

import CartContainer from "../../../components/CartContainer/CartContainer";
import ModalBase from "../../../components/common/Modals/ModalBase";
import ToastMessage from "../../../components/Notification/ToastMessage";
import CommonLayout from "../../../components/shop/common-layout";
import ProductSkeleton from "../../skeleton/productSkeleton";
import Service from "../common/service";
import ProductTab from "../common/product-tab";
import NewProduct from "../common/newProduct";
import { generateSlug, getDistanceFromLatLon } from "../../../GlobalFunctions/OthersGlobalfunctions";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import EducationPricing from "../../../GlobalFunctions/EducationFunctions/EducationPricing";
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import BuddyModal from '../../../components/common/TravelBuddies/BuddyModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LifestyleCalendar from '../../../components/calender/LifestyleCalendar';
import CustomCalendar from '../../../components/calender/CustomCalendar';
import EducationCalendar from '../../../components/calender/EducationCalendar';
// Add these imports at the top with your other imports
import StoreIcon from '@mui/icons-material/Store';
import { getSuppliedDetails } from "../../../AxiosCalls/GlobalAxiosServices/globalServices";

export async function getServerSideProps(context) {

    const id = context.query.pID;
    const name = context.query.name;

    let response = []
    await getEducationData(id).then((res) => {
        response = res
    });

    let reviews = []
    await getProductReiews(5, id).then((res) => {
        if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
            reviews = []
        } else {
            reviews = res
        }
    });

    const productUrl = `https://www.aahaas.com/product-details/education/${name}?pID=${id}`;

    const dataset = {
        productData: response,
        productReviews: reviews,
        productId: id,
        canonicalURL: productUrl
    }

    if (id === '' || id === undefined || id === null || name === '' || name === undefined || name === null || response?.educationListings?.length == 0 || response === 'Something went wrong !' || response === '(Internal Server Error)') {
        return {
            redirect: {
                destination: '/shop/lifestyle',
                permanent: false,
            },
        };
    }

    return {
        props: {
            dataset
        },
    };

}

const EducationProductView = ({ dataset, pathId = dataset?.productId, canonicalURL = dataset?.canonicalURL }) => {
    // console.log("dataset", dataset?.productData?.discountPackage        )
    const PID = dataset?.productId;
    const router = useRouter();
    console.log("router.query", dataset)
    const [discountValue, setDiscountValue] = useState(dataset?.productData?.discountPackage);
    const categoryStar = [
        { value: 0, label: '' },
        { value: 1, label: '⭐' },
        { value: 2, label: '⭐⭐' },
        { value: 3, label: '⭐⭐⭐' },
        { value: 4, label: '⭐⭐⭐⭐' },
        { value: 5, label: '⭐⭐⭐⭐⭐' }
    ];

    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);
    const [slider1, setSlider1] = useState(null);
    const [slider2, setSlider2] = useState(null);

    const studentType = [
        { value: 'Adult', label: 'Adult' },
        { value: 'Children', label: 'Children' }
    ]

    const getStudentType = () => {
        if (educationData['adult_course_fee'] == 0.00) {
            return [{ value: 'Children', label: 'Children' }]
        }
        if (educationData['child_course_fee'] == 0.00) {
            return [{ value: 'Adult', label: 'Adult' }]
        }

        if (educationData['adult_course_fee'] > 0.00 && educationData['child_course_fee'] > 0.00) {
            return [{ value: 'Children', label: 'Children' }, { value: 'Adult', label: 'Adult' }]
        }
    }

    const { baseCurrencyValue, baseUserId, userStatus, baseLocation } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [educationData, setEducationData] = useState([]);
    const [pricing, setPricing] = useState([]);
    const [inventoryDates, setInventoryDates] = useState([]);
    const [inventoryDataSet, setInventoryDataSet] = useState([])
    const [timeSlot, setTimeSlot] = useState(router?.query?.viewStatus === 'update' ? [{ value: router?.query?.timeslot, label: router?.query?.label }] : []);
    const [cartData, setCartData] = useState([]);
    const [cartSectionOpen, setCartSectionOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [customerDataErr, setCustomerDataErr] = useState({
        date: '',
        student_age: '',
        student_age_limit: '',
        student_age_limit_child: '',
        student_age_limit_adult: '',
        student_name: '',
        lec_location: '',
        time: '',
        student_type: ""
    })
    const [customerData, setCustomerData] = useState({
        date: null,
        student_age: '',
        student_name: '',
        lec_location: 'Teacher location',
        time_id: '',
        time: '',
        student_type: ''
    })


    console.log(customerData, "Asdadadadadasdasdasdasd")


    const [displayTimeSlot, setDisplayTimeSlot] = useState("")

useEffect(() => {
    if (router?.query?.viewStatus === 'update') {
        console.log("isssss meee", router?.query?.timeslot)
        // Set initial data but don't trigger time slot reset
        setCustomerData({
            ...customerData,
            date: router?.query?.booking_date ? new Date(router?.query?.booking_date) : null,
            student_type: router?.query?.student_type || '',
            time: router?.query?.timeslot || '',
            time_id: router?.query?.timeslot || '',
        });

        setDisplayTimeSlot(router?.query?.label || "");
        console.log(router?.query, "Query data value")
        
        // Initially no time error since we have existing time slot
        setCustomerDataErr(prevState => ({
            ...prevState,
            time: false
        }));
    }
}, []);

    const handleChnageCustomerType = (e) => {

        setCustomerData({
            date: null,
            student_age: '',
            student_name: '',
            lec_location: 'Teacher location',
            time_id: '',
            time: '',
            student_type: ''
        })
        setAdultDetails([]);
        setChildDetails([]);
        setCustomerData({
            ...customerData,
            student_type: e.value
        })
        setCustomerDataErr(prevState => ({
            ...prevState,
            student_type: false
        }));
    }

    const handleOnDataChange = (e) => {
        const { name, value } = e.target;
        const isValid = /^[a-zA-Z ]*$/.test(value);
        if (value.trim() == "Teacher Location" && educationData['course_mode'] === "F2F") {
            setCustomerData({ ...customerData, [name]: value });
            setCustomerDataErr(prevState => ({
                ...prevState,
                [name]: false,
                student_age_limit: false,
                student_age_limit_adult: false
            }));
        } else if (name === 'student_age') {
            if (!isNaN(value) && value > 0) {
                setCustomerData({ ...customerData, [name]: value });
                setCustomerDataErr(prevState => ({
                    ...prevState,
                    [name]: false,
                    student_age_limit: false,
                    student_age_limit_adult: false
                }));
            }
        } else {
            if (isValid) {
                setCustomerData({ ...customerData, [name]: value });
                setCustomerDataErr(prevState => ({
                    ...prevState,
                    [name]: false,
                    student_age_limit: false,
                    student_age_limit_adult: false
                }));
            }
        }
    };

    const handleAddToCart = () => {
     
        const result = validate();
        if (result) {

            let TotalPrice = 0.00;
            let discountper = 0.00;

            if (customerData.student_type === "Adult") {
                TotalPrice = pricing['adultDiscountable'];
                discountper = pricing['adultDiscountAmount'];
            } else {
                TotalPrice = pricing['childDiscountable'];
                discountper = pricing['childDiscountAmount'];
            }
            console.log("TotalPrice", discountsMetaVal)
            const data = {
                education_id: pathId,
                discount_id: educationData['discountID'],
                rate_id: educationData['rateID'],
                currency: educationData['currency'],
                totalPrice: TotalPrice,
                discount_amount: discountper?.toFixed(2),
                status: "InCart",
                viewStatus: cartStatus.status,
                preId: cartStatus.preId,
                user_id: baseUserId.cxid,
                session_id: customerData.time,
                student_name: customerData.student_name,
                student_type: customerData.student_type,
                student_age: customerData.student_age,
                preffered_booking_date: moment(customerData.date).format("YYYY-MM-DD"),
                lec_location: customerData.lec_location,
                cart_id: cartStatus.cartId,
                discount_meta_value_set: discountsMetaVal?.id ? JSON.stringify(discountsMetaVal) : null
            }
            console.log("cart dataxxxxxxxx", data)  
            // return
            if (userStatus.userLoggesIn) {
                setCartData(data);
                setCartSectionOpen(true);
            } else {
                router.push("/page/account/login-auth");
                localStorage.setItem("lastPath", router.asPath);
                ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features." });
            }
        }
    }

   const validate = () => {
    setCustomerDataErr({
        date: false,
        student_age: false,
        student_age_limit: false,
        student_age_limit_child: false,
        student_age_limit_adult: false,
        student_name: false,
        lec_location: false,
        time: false,
        student_type: false
    });

    let isValid = true;

    if (!customerData.date) {
        setCustomerDataErr(prevState => ({ ...prevState, date: true }));
        isValid = false;
    }

    if (!customerData.time) {
        setCustomerDataErr(prevState => ({ ...prevState, time: true }));
        if (router?.query?.viewStatus === 'update') {
            ToastMessage({ 
                status: "warning", 
                message: "Please select a time slot for the new date" 
            });
        } else {
            ToastMessage({ 
                status: "warning", 
                message: "Please select a time slot" 
            });
        }
        isValid = false;
    }

    if (!customerData.student_type) {
        setCustomerDataErr(prevState => ({ ...prevState, student_type: true }));
        isValid = false;
    }

    if (!customerData.student_name) {
        setCustomerDataErr(prevState => ({ ...prevState, student_name: true }));
        isValid = false;
    }

    if (!customerData.student_age) {
        setCustomerDataErr(prevState => ({ ...prevState, student_age: true }));
        isValid = false;
    }

    if (educationData['course_mode'] === "F2F" && !customerData.lec_location) {
        setCustomerDataErr(prevState => ({ ...prevState, lec_location: true }));
        ToastMessage({ status: "warning", message: "Please choose service location" });
        isValid = false;
    }

    if (customerData.student_type === 'Children' && (customerData.student_age > 12 || customerData.student_age == 0)) {
        setCustomerDataErr(prevState => ({ ...prevState, student_age_limit: true }));
        isValid = false;
    }

    if (customerData.student_type === 'Adult' && (customerData.student_age <= 12 || customerData.student_age >= 100)) {
        setCustomerDataErr(prevState => ({ ...prevState, student_age_limit_adult: true }));
        isValid = false;
    }

    return isValid;
}

    const [categories, setCategories] = useState({
        category1: "",
        category2: "",
        category3: "",
        latitude: '',
        longitude: '',
        vendor_id: '',
        vandorName: '',
        sliderCount: ''
    })

    const loadEducationData = async () => {
    setLoading(true);
    setReviews(dataset.productReviews);
    if (dataset.productData.status === 200) {

        if (generateSlug(dataset.productData.educationListings[0].course_name) !== router.query.name) {
            window.location.assign(`/product-details/education/${generateSlug(dataset.productData.educationListings[0].course_name)}?pID=${router.query.pID}`)
        } else {
            setEducationData(dataset.productData.educationListings[0])
            setInventoryDates(dataset.productData.educationDates)
            setInventoryDataSet(dataset.productData.educationInventory)
            setPricing(EducationPricing(dataset.productData.educationListings[0]))
            let pro_dataSet = dataset.productData.educationListings[0]
            setCategories({
                category1: pro_dataSet.category1,
                category2: pro_dataSet.category2,
                category3: pro_dataSet.category3,
                latitude: "",
                longitude: "",
                vendor_id: pro_dataSet.vendor_id,
                sliderCount: '4'
            })
            setLoading(false);
            
            // Initialize time slots after data is loaded
            if (router?.query?.viewStatus === 'update' && router.query.booking_date) {
                setTimeout(() => {
                    updateInitialValue();
                }, 100);
            }
        }
    } else {
        setLoading(true)
    }
}


    const handlePassData = (value) => {
        if (value) {
            setCartSectionOpen(false)
            // router.push('/page/account/cart-page')
            router.push('/shop/education')
        } else {
            setCartSectionOpen(false)
        }
    }

   const handleChangeTimeSlots = async (dataset) => {
    if (dataset) {
        if (router?.query?.viewStatus === 'update') {
            setCustomerData({
                ...customerData,
                student_type: router.query.student_type,
                time: dataset.value,
                time_id: dataset.value,
            })
        } else {
            setCustomerData({
                ...customerData,
                time: dataset.value,
                time_id: dataset.value,
            })
        }

        // Update display time slot
        setDisplayTimeSlot(dataset.label);

        // Clear time error when user selects a time slot
        setCustomerDataErr(prevState => ({
            ...prevState,
            time: false
        }));

        const result = await getPricingbytimeslot(dataset.value);
        setPricing(result);
        return true;
    }
    return false;
}
    const [updateChangeDateUpdate, setUpdateChangeDateUpdate] = useState(false);
const handleOnDateChange = async (value) => {
    console.log("valuexxxx", value)
    
    // Check if date is actually changing (not initial load)
    const isDateChanged = customerData.date && 
                         moment(value).format("YYYY-MM-DD") !== moment(customerData.date).format("YYYY-MM-DD");
    
    // Reset time-related data ONLY when date actually changes
    if (isDateChanged) {
        setCustomerData({
            ...customerData,
            date: value,
            time: '', // Reset time
            time_id: '', // Reset time_id
        });

        setDisplayTimeSlot(""); // Reset display time slot

        // Set time error when date changes in update mode
        if (router?.query?.viewStatus === 'update') {
            setCustomerDataErr(prevState => ({
                ...prevState,
                time: true // Show error for time slot
            }));
        }
    } else {
        // If same date or initial load, just update the date
        setCustomerData({
            ...customerData,
            date: value
        });
    }

    setTimeSlot([]); // Clear available time slots
    setUpdateChangeDateUpdate(true);

    let selecetDate = moment(value).format("YYYY-MM-DD").toString();

    const availableTimeSlots = [];
    inventoryDataSet.map((dataSet) => {
        if (dataSet['course_inv_startdate'].toString() === selecetDate) {
            const newTimeSlot = dataSet['course_startime'].toString().slice(0, 5) + " - " + dataSet['course_endtime'].toString().slice(0, 5);
            const newDate = dataSet['course_inv_startdate'];

            // Check if this time slot already exists
            const isDuplicate = availableTimeSlots.some(slot =>
                slot.label === newTimeSlot && slot.date === newDate
            );

            if (!isDuplicate) {
                const data = {
                    value: dataSet['id'],
                    label: newTimeSlot,
                    date: newDate
                }
                availableTimeSlots.push(data);
            }
        }
    });

    if (availableTimeSlots.length > 0) {
        console.log("timeeeeeeeeee  ", availableTimeSlots)
        setTimeSlot(availableTimeSlots);
        setCustomerDataErr(prevState => ({
            ...prevState,
            date: false
        }));
        
        // Only auto-select if in update mode AND the previous time slot exists in new date AND date hasn't changed
        if (router?.query?.viewStatus === 'update' && !isDateChanged) {
            try {
                let selectedtimeslot = availableTimeSlots.find(data => {
                    return data.value == router.query.timeslot
                })

                console.log("Found timeslot:", selectedtimeslot);
                if (selectedtimeslot !== undefined) {
                    await handleChangeTimeSlots(selectedtimeslot);
                    // Clear time error if previous time slot exists
                    setCustomerDataErr(prevState => ({
                        ...prevState,
                        time: false
                    }));
                }
            } catch (error) {
                console.error("Error selecting timeslot:", error);
            }
        }
    } else {
        ToastMessage({ status: "warning", message: "No time slots are available for the selected date." })
        setTimeSlot([]);
        // Show time error when no time slots available
        if (router?.query?.viewStatus === 'update') {
            setCustomerDataErr(prevState => ({
                ...prevState,
                time: true
            }));
        }
    }
}

    const [cartStatus, setCartStatus] = useState({
        status: 'new',
        preId: 1,
        cartId: null
    })

    const updateInitialValue = async () => {
    const today = moment().startOf('day');
    const enabledDates = inventoryDates.filter(value => moment(value).isSameOrAfter(today, 'day'));

    if (enabledDates.length > 0) {
        if (router?.query?.viewStatus === 'update') {
            try {
                setCartStatus({
                    status: 'update',
                    preId: router.query.preId,
                    cartId: router?.query?.selectedCart_id
                })
                // Load the existing booking date without resetting time slot
                await handleOnDateChange(router.query.booking_date);
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        }
    }
}

    useEffect(() => {
        updateInitialValue()
    }, [loading]);

    useEffect(() => {
        loadEducationData();
    }, [pathId]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }, [window.location.href])

    const [chatCreating, setChatCreating] = useState(false);

    const handleChatInitiate = async () => {
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
                    supplier_name: '',
                    customer_name: baseUserId.user_username,
                    customer_mail_id: baseUserId.user_email,
                    supplier_mail_id: '',
                    comments: { category: 5, product_id: educationData?.edu_id },
                    customer_id: baseUserId.cxid,
                    chat_related: 'Technical-support',
                    customer_collection_id: baseUserId.cxid,
                    chat_related_to: "Product",
                    supplier_mail_id: "aahaas@gmail.com",
                    group_chat: 'true',
                    supplier_added_date: Date.now(),
                    chat_related_id: pathId,
                    chat_category: '5',
                    chat_avatar: educationData.image_path,
                    supplier_id: educationData.vendor_id,
                    chat_name: educationData.course_name,
                    // comments: 'Product support - chat has been created from product details',
                    updatedAt: new Date()
                }).then((response) => {
                    setChatCreating(false);
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

    const handleNavigateMap = () => {
        window.open(`https://www.google.com/maps?q=${educationData.latitude},${educationData.longtitude}`, '_blank')
    }

    const [classSchedule, setClassSchedule] = useState([])

    const getScheduleSlots = async () => {
        const data = {
            education_id: pathId,
            inventory_id: customerData.time_id,
        }
        await axios.post('get-time-slots-by-sessionid', data, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then(res => {
            if (res.data.status === 200) {
                setClassSchedule(res.data.classSchedule)
            }
        });

    }



    useEffect(() => {
        if (slider1 && slider2) {
            setNav1(slider1);
            setNav2(slider2);
        }
    }, [slider1, slider2]);

    useEffect(() => {
        getScheduleSlots()
    }, [customerData.time_id])

    // const products = {
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    //     dots: false,
    //     arrows: true,
    //     fade: true,
    // };
    const products = {
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        fade: true,
    };



    const sliderNav = {
        slidesToShow: educationData?.image_path?.split?.(',')?.length,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        adaptiveHeight: true,
        focusOnSelect: true,
    };

    // const [nav1, setNav1] = useState(null);
    // const [nav2, setNav2] = useState(null);
    // const [slider1, setSlider1] = useState(null);
    // const [slider2, setSlider2] = useState(null);

    useEffect(() => {
        setNav1(slider1);
        setNav2(slider2);
    }, [slider1, slider2]);

    const [openSideBarStatus, setopenSideBarStatus] = useState(false);

    const openSubFilter = () => {
        setopenSideBarStatus(true);
    };

    const closeSubFilter = () => {
        setopenSideBarStatus(false);
    };

    const [openTravelBuddy, setOpenTravelBuddy] = useState(false);

    const [adultDetails, setAdultDetails] = useState([]);
    const [childsDetails, setChildDetails] = useState([]);

    const handleOpenTravelBuddy = () => {
        if (userStatus.userLoggesIn) {
            setOpenTravelBuddy(true);
        } else {
            router.push("/page/account/login-auth");
            localStorage.setItem("lastPath", router.asPath);
            ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features." });
        }
    }

    const handleCloseTravelBuddy = () => {
        setOpenTravelBuddy(false);
    }

    const handleTravelBuddies = (value) => {

        setCustomerData({
            ...customerData,
            student_age: value[0].FirstName,
            student_name: value[0].Age,
        });
        setCustomerDataErr(prevState => ({
            ...prevState,
            student_age: false,
            student_age_limit: false,
            student_age_limit_child: false,
            student_age_limit_adult: false,
            student_name: false
        }));

        let adults = value.filter((res) => { return res.PaxType == "1" });
        let childs = value.filter((res) => { return res.PaxType == "2" });

        setAdultDetails(adults);
        setChildDetails(childs);

        setOpenTravelBuddy(false);
    }

    const [discountsMetaVal, setDiscountMetaVal] = useState([]);

    const handleDiscountOnClaim = (id) => {
        setDiscountMetaVal(id)
    }

    const selectedOption = useMemo(() => {
        if (router?.query?.viewStatus === 'update' && displayTimeSlot !== "") {
            const queryStartTime = router?.query?.timeslot?.toString();
            console.log("timeSlot111111111111", timeSlot.find(option => option.value === queryStartTime));
            if (timeSlot.find(option => option.value === queryStartTime)) {
                setCustomerData({
                    ...customerData,
                    time: timeSlot.find(option => option.value === queryStartTime),
                    time_id: timeSlot.find(option => option.value === queryStartTime),
                    // Remove date and lec_location auto-setting
                });
            }
            return timeSlot.find(option => option.value === queryStartTime);
        }

        return timeSlot.find(option => option.value === customerData.time);
    }, [router?.query?.viewStatus, router?.query?.timeslot, displayTimeSlot, timeSlot, customerData.time]);


    return (
        <>
            <Head>
                <link rel="canonical" as={canonicalURL} href={canonicalURL} />
                <title>Aahaas - {dataset.productData.educationListings[0].course_name} | Unique Experiences with Aahaas in Sri Lanka</title>
                <meta name="description" content={`Discover the best things to do in Sri Lanka! Explore ${dataset.productData.educationListings[0].course_name} along with top holiday activities and unique vacation experiences.`} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.aahaas.com/" },
                                { "@type": "ListItem", "position": 2, "name": "Education", "item": "https://www.aahaas.com/product-details/education/" },
                                { "@type": "ListItem", "position": 3, "name": "Education", "item": `https://www.aahaas.com/product-details/education/${generateSlug(dataset.productData.educationListings[0].course_name)}?pID=${pathId}` }
                            ]
                        }),
                    }}
                />
            </Head>

            <CommonLayout parent="Home" title={'education'} subTitle={'product view'} openSubFilter={() => openSubFilter()} showSearchIcon={false} showMenuIcon={true} location={false} subTitleParentLink={"/shop/education"}>
                {/* 
                <nav aria-label="Breadcrumb" style={{ marginTop: "10px" }}>
                    <ol>
                        <li><a href="javascript:history.back()"><ArrowBackIcon /></a></li>
                    </ol>z
                </nav> */}

                <div className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? 'mb-5' : 'mb-0'}`}>
                    <Container>
                        <Row>

                            <Col sm={3} className="collection-filter" id="filter" style={openSideBarStatus ? { left: "0px" } : {}}>

                                <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
                                    <span className="filter-back">
                                        <i className="fa fa-angle-left"></i> back
                                    </span>
                                </div>

                                {
                                    loading ?
                                        <ProductSkeleton skelotonType='productDetails-left-moreDetails' />
                                        :
                                        <>
                                            <Service serviceDate={customerData.date} bookingDeadline={customerData.date} cancellationDays={educationData?.DeadNoOfDays} latitude={educationData.latitude} longitude={educationData.longtitude} locationName={educationData.address} grptype={educationData.group_type} courseMode={educationData.course_mode} courseMedium={educationData.medium} session={educationData.sessions} classSchedule={classSchedule} openingHours={[educationData.opening_time, educationData.closing_time]} lastCouurseDate={educationData.course_inv_enddate} productReview={categoryStar[reviews?.overall_rate?.[0]]?.label} productReviewCount={reviews?.overall_rate?.[1]} height={(educationData.course_mode == 'F2F' && educationData.address != null) ? '465px' : '420px'} showitem={(educationData.course_mode == 'F2F' && educationData.address !== null) ? ['proDiscounts', 'cancellationDays', 'groupType', 'courseMode', 'openingHours', 'lastCourseDate', 'reviewStar', 'mapView'] : ['cancellationDays', 'courseMode', 'groupType', 'classSchedule', 'openingHours', 'lastCourseDate', 'reviewStar']} discounts={discountValue} serviceType={'Education'} handleDiscountOnClaim={handleDiscountOnClaim} discountsMetaVal={discountsMetaVal} />
                                            <NewProduct sliderCount={categories.sliderCount} category1={"5"} vendor={categories.vendor_id} vandorName={categories.vandorName} p_ID={PID} />
                                        </>
                                }
                            </Col>

                            <Col lg="9" sm="12" xs="12">

                                <Container fluid={true} className="p-0">
                                    {
                                        loading ?
                                            <ProductSkeleton skelotonType='productDetails' />
                                            :
                                            <Row className="p-0 m-0 product-view-mobile" style={{ height: 'auto' }}>

                                                {/* <Col lg="5" className="product-thumbnail p-0 m-0">
                                                    <Slider {...products} asNavFor={nav2} ref={(slider) => setSlider1(slider)} className="product-slick">
                                                        {educationData.image_path.split(',').map((vari, index) => (
                                                            <div key={index}>
                                                                <Media src={`${vari}`} alt={`${educationData?.course_name} - holiday activity in Sri Lanka`} className="img-fluid product-main-image px-4" style={{ width: "98%", height: '420px', objectFit: 'cover' }} loading="lazy" />
                                                            </div>
                                                        ))}
                                                    </Slider>
                                                    {educationData.image_path.split(',').length > 1 && (
                                                        <div className='d-flex overflow-hidden w-100 m-0 p-0 gap-2 justify-content-center mt-3'>
                                                            {educationData.image_path.split(',').length > 1 && educationData.image_path.split(',').map((vari, index) => (
                                                                <Media alt='product other images' src={`${vari}`} style={{ minHeight: '80px', maxHeight: '80px', minWidth: '80px', maxWidth: '80px', padding: "", objectFit: 'cover' }} loading="lazy" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </Col> */}

                                                <Col lg="5" className="product-thumbnail p-0 m-0">
                                                    {/* Main slider */}
                                                    <Slider
                                                        {...products}
                                                        asNavFor={nav2}
                                                        ref={(slider) => setSlider1(slider)}
                                                        className="product-slick"
                                                    >
                                                        {educationData.image_path.split(',').length >= 1 ? (
                                                            educationData.image_path.split(',').map((vari, index) => (
                                                                <div key={index}>
                                                                    <Media
                                                                        src={`${vari}`}
                                                                        alt={`${educationData?.course_name} - holiday activity in Sri Lanka`}
                                                                        className="img-fluid product-main-image px-4"
                                                                        style={{ width: "98%", height: '420px', objectFit: 'cover' }}
                                                                        loading="lazy"
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div>
                                                                <Media
                                                                    alt={`${educationData?.course_name} - Default placeholder image`}
                                                                    src="https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/education-placeholder.png"
                                                                    className="img-fluid product-main-image px-4"
                                                                    style={{ width: "98%", height: '420px', objectFit: 'cover' }}
                                                                    loading="lazy"
                                                                />
                                                            </div>
                                                        )}
                                                    </Slider>

                                                    {/* Thumbnail slider - only show if more than 1 image */}
                                                    {educationData.image_path.split(',').length > 1 && (
                                                        <div>
                                                            <Slider
                                                                asNavFor={nav1}
                                                                ref={(slider) => setSlider2(slider)}
                                                                slidesToShow={Math.min(5, educationData.image_path.split(',').length)}
                                                                swipeToSlide={true}
                                                                focusOnSelect={true}
                                                                className="mt-3"
                                                                infinite={false}
                                                                arrows={false}
                                                                dots={false}
                                                            >
                                                                {educationData.image_path.split(',').map((vari, index) => (
                                                                    <div key={index} className="px-1">
                                                                        <Media
                                                                            alt={`${educationData?.course_name} - Thumbnail ${index + 1}`}
                                                                            src={`${vari}`}
                                                                            className="img-fluid"
                                                                            style={{
                                                                                height: "80px",
                                                                                width: "100%",
                                                                                objectFit: "cover",
                                                                                cursor: "pointer",
                                                                                borderRadius: "4px"
                                                                            }}
                                                                            loading="lazy"
                                                                        />
                                                                    </div>
                                                                ))}
                                                            </Slider>
                                                        </div>
                                                    )}
                                                </Col>

                                                <Col lg="7" className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0">

                                                    <div className='product-right d-flex flex-wrap justify-content-between' style={{ height: '420px' }}>

                                                        <h1 className="col-12 text-start mb-1 product-name-main" style={{ textTransform: '', fontWeight: '500' }}>{educationData?.course_name}  {educationData && educationData.vendor_id && (
  <div 
    className="store-badge"
   style={{
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '10px',
    background: '#00d4aa',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  }}
    title="Aahaas Store Product"
    onClick={async () => {
      if (!educationData.vendor_id) {
        return ToastMessage({ status: "error", message: "Vendor information not available" });
      }

      // Get vendor details
      const vendorDetails = await getSuppliedDetails(educationData.vendor_id);
      
      console.log("Education Vendor Details:", vendorDetails);

      // Extract vendor name correctly
      const vendorName =
        vendorDetails.vendor_name ||
        vendorDetails.store_name ||
        vendorDetails.shop_name ||
        vendorDetails.company_name ||
        "Vendor";

      // Redirect to vendor products page with education tab
      router.push(
        `/vendor-products/${educationData.vendor_id}?vendorName=${encodeURIComponent(vendorName)}&category=education`
      );
    }}
  >
    <StoreIcon style={{ fontSize: 16, marginRight: 5 }} />
  </div>
)}</h1>
                                                       
                                                        {/* <h1 className="col-12 ellipsis-2-lines text-start mb-1 product-name-main" style={{ textTransform: 'uppercase', fontWeight: '500' }}>{educationData?.course_name} </h1> */}
                                                        {/* {educationData.course_mode !== 'Live' && <p className='col-12 m-0 p-0 ellipsis-1-lines m-0 text-start' style={{ color: '#66b3ff', cursor: 'pointer', lineHeight: '20px', height: '20px' }} onClick={handleNavigateMap}>{getDistanceFromLatLon(baseLocation?.latitude, baseLocation?.longtitude, educationData?.latitude, educationData?.longtitude)} kms away from your currenct location -  {educationData?.address}</p>} */}
                                                        
                                                        {educationData.course_mode !== 'Live' &&
                                                            <p className='col-12 m-0 p-0 ellipsis-1-lines m-0 text-start'
                                                                style={{ color: '#66b3ff', cursor: 'pointer', lineHeight: '20px', height: '20px' }}
                                                                onClick={handleNavigateMap}>
                                                                {(() => {
                                                                    const distance = getDistanceFromLatLon(baseLocation?.latitude, baseLocation?.longtitude, educationData?.latitude, educationData?.longtitude);
                                                                    return distance === 0.00 || distance === '0.00'
                                                                        ? `This product is near your location - ${educationData?.address}`
                                                                        : `${distance} kms away from your current location - ${educationData?.address}`;
                                                                })()}
                                                            </p>
                                                        }
                                                        <div className="col-6 m-0 product-variant-head" style={{ width: '48%' }}>
                                                            <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Choose your service date</h6>
                                                            {console.log("inventoryDates", inventoryDates)}
                                                            {/* <DatePicker
                                                                value={customerData.date}
                                                                clearIcon={false}
                                                                minDate={new Date()}
                                                                maxDate={new Date(inventoryDates[inventoryDates.length - 1])}
                                                                className='form-control py-2'
                                                                onChange={(e) => handleOnDateChange(e)}
                                                                placeholderText="Select date"
                                                                style={{ borderColor: customerDataErr.date ? 'red' : 'lightgray' }}
                                                            /> */}
                                                            <EducationCalendar
                                                                value={customerData.date}
                                                                onChange={(e) => handleOnDateChange(e)}
                                                                inventoryDates={inventoryDates}
                                                                minDate={new Date()}
                                                                maxDate={new Date(inventoryDates[inventoryDates.length - 1])}
                                                                placeholderText="Select a date"
                                                                className="form-control py-2"
                                                                style={{
                                                                    borderColor: customerData.date ? 'lightgray' : 'red',
                                                                    marginBottom: '16px'
                                                                }}
                                                            />
                                                            <span className='m-0 p-0 text-start ellipsis-1-lines' style={{ color: 'red', fontSize: 11, display: customerDataErr.date ? '' : 'none' }}>Please select a date</span>
                                                        </div>

                                                      <div className="col-6 m-0 product-variant-head" style={{ width: '48%' }}>
    <h6 style={{ fontSize: 11, color: "gray" }} className='m-0 ellipsis-1-lines text-start'>Time Slot</h6>

    <Select
        options={timeSlot}
        onChange={handleChangeTimeSlots}
        value={timeSlot.find(option => option.value === customerData.time) || null}
        placeholder={"Select time slot"}
        isClearable={false}
        isDisabled={timeSlot.length === 0}
        styles={{
            control: (base, state) => ({
                ...base,
                borderColor: customerDataErr.time ? 'red' : state.isFocused ? '#2684FF' : 'lightgray',
                backgroundColor: customerDataErr.time ? '#fff5f5' : 'white',
                boxShadow: customerDataErr.time ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px #2684FF' : 'none',
                '&:hover': {
                    borderColor: customerDataErr.time ? 'red' : state.isFocused ? '#2684FF' : 'lightgray'
                }
            })
        }}
    />
    <span className='m-0 p-0 text-start ellipsis-1-lines' style={{ 
        color: 'red', 
        fontSize: 11, 
        display: customerDataErr.time ? 'block' : 'none',
        marginTop: '4px'
    }}>
        {router?.query?.viewStatus === 'update' && customerData.date && !customerData.time 
            ? 'Please select a time slot for the new date' 
            : 'Kindly select the timeslot'
        }
    </span>
</div>

                                                        <div className="col-6 m-0 product-variant-head" style={{ width: '48%' }}>
                                                            <h6 style={{ fontSize: 11, color: "gray" }} className='m-0 ellipsis-1-lines text-start'>Student Type</h6>
                                                            <Select
                                                                options={getStudentType()}
                                                                onChange={handleChnageCustomerType}
                                                                value={studentType.find(data => data.value === customerData.student_type) || null}
                                                                placeholder="Select student type"
                                                                isClearable={false} // This removes the X icon
                                                                styles={{
                                                                    control: (base) => ({
                                                                        ...base,
                                                                        borderColor: customerDataErr.student_type ? 'red' : 'lightgray',
                                                                    })
                                                                }}
                                                            />
                                                            <span className='m-0 p-0 text-start ellipsis-1-lines' style={{ color: 'red', fontSize: 11, display: customerDataErr.student_type ? '' : 'none' }}>Please select student type</span>
                                                        </div>
                                                        {
                                                            educationData['course_mode'] === "F2F" &&
                                                            <div className="col-6 m-0 product-variant-head" style={{ width: '48%' }}>
                                                                <h6 style={{ fontSize: 11, color: "gray" }} className='m-0 ellipsis-1-lines text-start'>Location type</h6>
                                                                <select
                                                                    className='form-control'
                                                                    style={{ padding: '11px 10px', fontSize: "12px", borderColor: customerDataErr.lec_location ? 'red' : 'lightgray' }}
                                                                    name="lec_location"
                                                                    value={customerData.lec_location}
                                                                    defaultValue={educationData['location_type1'] || "Teacher location"}
                                                                    onChange={handleOnDataChange}
                                                                >
                                                                    <option value="" disabled>Select service location</option>
                                                                    {
                                                                        educationData['location_type1'] !== null &&
                                                                        educationData['location_type1'] !== undefined &&
                                                                        educationData['location_type1'] !== "null" &&
                                                                        <option value={educationData['location_type1'] || "Teacher location"}>{educationData['location_type1'] || 'Teacher location'}</option>
                                                                    }
                                                                    {
                                                                        educationData['location_type2'] !== null &&
                                                                        educationData['location_type2'] !== undefined &&
                                                                        educationData['location_type2'] !== "null" &&
                                                                        educationData['location_type2'] !== "null" &&
                                                                        educationData['location_type2'] !== '' &&
                                                                        <option value={educationData['location_type2']}>{educationData['location_type2']}</option>
                                                                    }
                                                                </select>
                                                                <span className='m-0 p-0 text-start ellipsis-1-lines' style={{ color: 'red', fontSize: 11, display: customerDataErr.lec_location ? '' : 'none' }}>Please select location type</span>
                                                            </div>
                                                        }
                                                       <div className="col-12 m-0 product-variant-head" >
    <h6 style={{ fontSize: 11, color: "gray" }} className='m-0 ellipsis-1-lines text-start'>Add / edit travel buddies</h6>
    <button 
        className={`btn border text-capitalize text-start add-travel-buddies-btn ${!customerData.student_type ? 'disabled' : ''}`} 
        onClick={customerData.student_type ? handleOpenTravelBuddy : undefined} 
        style={{ 
            fontSize: 12, 
            fontWeight: 'normal', 
            width: '95%',
            opacity: customerData.student_type ? 1 : 0.6,
            cursor: customerData.student_type ? 'pointer' : 'not-allowed'
        }} 
        disabled={!customerData.student_type}
    >
        {!customerData.student_type 
            ? 'Select student type to add travel buddy' 
            : customerData?.student_name 
                ? '1 travel buddy selected' 
                : 'Click here to add travel buddy'
        }
    </button>
    <span className='m-0 p-0 text-start ellipsis-1-lines' style={{ color: 'red', fontSize: 11, display: customerDataErr.student_name ? '' : 'none' }}>Kindly choose your travel buddy</span>
</div>

                                                        <div className="d-flex align-items-center justify-content-end ms-auto col-lg-12 col-6 mt-2">
                                                            {
                                                                educationData['adult_course_fee'] !== 0.00 && customerData.student_type === "Adult" ?
                                                                    educationData['discount_type'] === "Amount" ?
                                                                        <h4 className="d-flex flex-column align-items-end">
                                                                            <div className="d-flex align-items-center">
                                                                                <del>{CurrencyConverter(educationData?.currency, educationData?.adult_rate, baseCurrencyValue)}</del>
                                                                                <span>{educationData?.discount}% off</span>
                                                                            </div>
                                                                            <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['adultDiscountable'], baseCurrencyValue)}</h3>
                                                                        </h4>
                                                                        :
                                                                        educationData['discount_type'] === "%" ?
                                                                            <h4 className="d-flex flex-column align-items-end">
                                                                                <div className="d-flex align-items-center">
                                                                                    <del>{CurrencyConverter(educationData?.currency, educationData?.adult_rate, baseCurrencyValue)}</del>
                                                                                    <span>{educationData?.discount}% off</span>
                                                                                </div>
                                                                                <p className="text-muted ml-2 float-right text-right" style={{ fontSize: 10, lineHeight: '20px', fontWeight: '600' }}>({pricing['discount']?.slice(0, -3)})% off</p>
                                                                                <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['adultDiscountable'], baseCurrencyValue)}</h3>
                                                                            </h4>
                                                                            :
                                                                            <h4 className="d-flex flex-column align-items-end">
                                                                                <p className="text-muted ml-2 m-0 float-right text-right" style={{ fontSize: 10, lineHeight: '20px', fontWeight: '600' }}>Price For {1} Adult </p>
                                                                                <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['adultDiscountable'], baseCurrencyValue)}</h3>
                                                                            </h4>

                                                                    :
                                                                    educationData['child_course_fee'] !== 0.00 && customerData.student_type === "Children" ?
                                                                        educationData['discount_type'] === "Amount" ?
                                                                            <h4 className="d-flex flex-column align-items-end">
                                                                                <div className="d-flex align-items-center">
                                                                                    <del>{CurrencyConverter(educationData?.currency, educationData?.adult_rate, baseCurrencyValue)}</del>
                                                                                    <span>{educationData?.discount}% off</span>
                                                                                </div>
                                                                                <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['childDiscountable'], baseCurrencyValue)}</h3>
                                                                            </h4>
                                                                            :
                                                                            educationData['discount_type'] === "%" ?
                                                                                <h4 className="d-flex flex-column align-items-end">
                                                                                    <div className="d-flex align-items-center">
                                                                                        <del>{CurrencyConverter(educationData?.currency, educationData?.adult_rate, baseCurrencyValue)}</del>
                                                                                        <span>{educationData?.discount}% off</span>
                                                                                    </div>
                                                                                    <p className="text-muted ml-2 float-right text-right" style={{ fontSize: 10, lineHeight: '20px', fontWeight: '600' }}>({pricing['discount']?.slice(0, -3)})% off</p>
                                                                                    <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['childDiscountable'], baseCurrencyValue)}</h3>
                                                                                </h4>
                                                                                :
                                                                                <h4 className="d-flex flex-column align-items-end">
                                                                                    <p className="text-muted ml-2 m-0 float-right text-right" style={{ fontSize: 10, lineHeight: '20px', fontWeight: '600' }}>Price For {1} Children </p>
                                                                                    <h3 className='m-0 p-0'>{CurrencyConverter(educationData['currency'], pricing['childDiscountable'], baseCurrencyValue)}</h3>
                                                                                </h4>
                                                                        : null
                                                            }
                                                        </div>

                                                        <div className='d-flex flex-row align-items-center col-12 gap-3 justify-content-end'>
                                                            <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleAddToCart}>{cartStatus.status === 'update' ? 'Update cart' : 'Add to cart'}</Button>
                                                            <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                    }
                                </Container>
                                {
                                    !loading &&
                                    <ProductTab height='410px' extraCss='mt-4' showDesc={true} name={educationData.course_name} desc={educationData?.course_description} showReviews={true} reviews={reviews} showTermsndConditions={true} showndConditions={educationData?.terms_conditions} showCancellationpolicy={true} cancellationPolicy={educationData?.cancel_policy} type='education' />
                                }
                            </Col>
                        </Row>
                    </Container>
                </div>
                <ModalBase isOpen={openTravelBuddy} toggle={handleCloseTravelBuddy} title="Choose Your Buddies" size='md'>
                    <BuddyModal handleTravelBuddies={handleTravelBuddies} adultDetails={adultDetails} childsDetails={childsDetails} adultCount={customerData.student_type === 'Adult' ? '1' : '0'} childCount={customerData.student_type === 'Children' ? '1' : '0'} education={"education"}></BuddyModal>
                </ModalBase>

                <ModalBase isOpen={cartSectionOpen} toggle={() => setCartSectionOpen(!cartSectionOpen)} title="Select Your Cart" size='md'>
                    <CartContainer handlePassData={handlePassData} productData={cartData} activePopup={false} cartCategory={"Education"} />
                </ModalBase>
            </CommonLayout>
        </>
    )
}
export default EducationProductView;