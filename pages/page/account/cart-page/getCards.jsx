import { useMemo } from "react";
import { Media } from "reactstrap";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import moment from "moment";
import { AppContext } from "../../../_app";

import ModalBase from "../../../../components/common/Modals/ModalBase";
import ToastMessage from "../../../../components/Notification/ToastMessage";

import { deleteCartByid } from "../../../../AxiosCalls/UserServices/CheckoutServices";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import getDiscountProductBaseByPrice from "../../../product-details/common/GetDiscountProductBaseByPrice";

const getCards = ({ categorizeData, index, editOptions = true }) => {

    const router = useRouter();
    const { baseCurrencyValue, triggers, setTriggers } = useContext(AppContext);

    const [productDeleteOpenModal, setProductDeleteOpenModal] = useState(false);
    const [hotelDetails, setHotelDetails] = useState([])

    const [deleteData, setDeleteData] = useState({
        productid: '',
        cartid: '',
        categoryid: '',
        name: '',
    });


    console.log("categorizeData", categorizeData)

    // if(categorizeData.main_category_id === 5){
    //     console.log("categorizeData", categorizeData,"Category data is set 123")
    // }


    const discountData = () => {
        if (!categorizeData || !categorizeData.main_category_id) return null;

        let discountMeta = null;

        if (categorizeData.main_category_id === 1 || categorizeData.main_category_id === 2) {
            discountMeta = categorizeData.essDiscountMeta;
        } else if (categorizeData.main_category_id === 3) {
            discountMeta = categorizeData.lsDiscountMeta;
        } else if (categorizeData.main_category_id === 4) {
            discountMeta = hotelDetails?.discount_meta_value_set;
        } else if (categorizeData.main_category_id === 5) {
            discountMeta = categorizeData?.eduDisountMeta;
        }
        // console.log("discountMeta", discountMeta)
        return discountMeta ? JSON.parse(discountMeta) : null;
    };

    // const discountData = useMemo(() => JSON?.parse((categorizeData.main_category_id === 1 || categorizeData.main_category_id === 2) ? categorizeData.essDiscountMeta : categorizeData.main_category_id === 3 ? categorizeData.lsDiscountMeta : categorizeData.main_category_id === 4 ? hotelDetails?.discount_meta_value_set : null), [hotelDetails,categorizeData]);
    // console.log("discountData", discountData())
    const handleDelete = async (productid, cartid, categoryid, productname) => {
        setDeleteData({
            productid: productid,
            cartid: cartid,
            categoryid: categoryid,
            name: productname,
        });
        setProductDeleteOpenModal(true);
    }

    const handldeRemoveDetails = () => {
        setDeleteData({
            productid: '',
            cartid: '',
            categoryid: '',
            name: '',
        })
        setProductDeleteOpenModal(false)
    }

    const handleDeleteConfirm = async () => {
        const dataD = {
            customer_cart_id: deleteData.cartid,
            main_category_id: deleteData.categoryid,
            related_id: Number(deleteData.productid),
            productData: categorizeData
        }
        let result = await deleteCartByid(dataD);
        if (result) {
            setTriggers({
                ...triggers,
                customerCartTrigger: !triggers.customerCartTrigger,
            })
            handldeRemoveDetails()
            ToastMessage({ status: "success", message: "Product deleted successfully." })
        }
    }

    function generateSlug(title) {
        let slug = title.toLowerCase();
        slug = slug.replace(/\bby\b/g, '');
        slug = slug.replace(/[()\/]/g, '');
        slug = slug.replace(/\s+/g, '-');
        slug = slug.replace(/[^\w-]+/g, '');
        slug = slug.replace(/-+/g, '-');
        return slug;
    }

    const handleEdit = (url, value, category) => {


        // console.log("value chamodddddd", value)
        if (category === "lifestyle") {

            if (value?.provider === 'zetexa') {
                // console.log("value chamodddddd", value)
                localStorage.setItem('bigDataset', JSON.stringify(value));
            }
            // console.log("value chamodddddd", {
            //     pID: value.lifestyle_id,
            //     viewStatus: 'update',
            //     preId: value.lifestyle_pre_id,
            //     service_date: value.inventory_date,
            //     service_location: value.pickup_location,
            //     selectedCart_id: value.cart_id,
            //     lifestyle_inventory_id: value.lifestyle_inventory_id,
            //     lifeStyle_adult_count: value.lifestyle_adult_count,
            //     lifestyle_children_ages: value?.lifestyle_children_ages || "",
            //     // lifestyle_children_count: value.lifestyle_children_count,
            //     lifestyle_children_count: value.lifestyle_children_count === 0 ? (value.focChildCountLs === 0 ? value.lifestyle_children_count : value.focChildCountLs) : value.lifestyle_children_count,
            //     pickup_time: value.pickup_time,
            //     productImage: value.image?.split(',')[0] || '',
            // })

            // console.log("value chamodddddd", value)
            // return;
            router.push({
                pathname: url,
                query: {
                    pID: value.lifestyle_id,
                    viewStatus: 'update',
                    preId: value.lifestyle_pre_id,
                    service_date: value.inventory_date,
                    service_location: value.pickup_location,
                    selectedCart_id: value.cart_id,
                    lifestyle_inventory_id: value.lifestyle_inventory_id,
                    lifeStyle_adult_count: value.lifestyle_adult_count,
                    lifestyle_children_ages: value?.lifestyle_children_ages || "",
                    lifestyle_children_count: value.lifestyle_children_count === 0 ? (value.focChildCountLs === 0 ? value.lifestyle_children_count : value.focChildCountLs) : value.lifestyle_children_count,
                    pickup_time: value.pickup_time,
                    productImage: value.image?.split(',')[0] || '',
                }
            })
        } else if (category === "education") {

            // console.log("value chamodddddd",{
            //         pID: value.edu_id || value.education_id,
            //         viewStatus: 'update',
            //         preId: value.education_pre_id,
            //         session_id: value.session_id,
            //         booking_date: value.preffered_booking_date,
            //         student_name: value.student_name,
            //         student_type: value.student_type,
            //         student_age: value.student_age,
            //         selectedCart_id: value.cart_id,
            //         timeslot: value.session_id,
            //         course_startime: `${value.course_startime}-${value.closing_time}`,
            //         label: `${value.opening_time.slice(0, 5)} - ${value.closing_time.slice(0, 5)}`
            //     })
            // console.log("value chamodddddd",value)
            // return
            router.push({
                pathname: url,
                query: {
                    pID: value.edu_id || value.education_id,
                    viewStatus: 'update',
                    preId: value.education_pre_id,
                    session_id: value.session_id,
                    booking_date: value.preffered_booking_date,
                    student_name: value.student_name,
                    student_type: value.student_type,
                    student_age: value.student_age,
                    selectedCart_id: value.cart_id,
                    timeslot: value.session_id,
                    course_startime: `${value.course_startime}-${value.closing_time}`,
                    label: `${value.opening_time.slice(0, 5)} - ${value.closing_time.slice(0, 5)}`
                }
            })
        } else if (category === 'hotel') {
            let formatted = JSON.parse(value.bookingdataset);
            // console.log("formatted", formatted)
            // console.log("formatted", formatted.hotelRatesRequest?.RoomTypeName)
            // console.log("formatted hotel", {
            //     pID: value.hotel_id,
            //     provider: formatted?.Provider,
            //     "checkIn": moment(formatted.customerDetails.check_in).format("YYYY-MM-DD"),
            //     "checkOut": moment(formatted.customerDetails.check_out).format("YYYY-MM-DD"),
            //     "NoOfNights": '',
            //     "NoOfRooms": formatted.NoOfRooms,
            //     "NoOfAdults": formatted.NoOfAdults || 1,
            //     "NoOfChild": formatted.NoOfChild || 0,
            //     "Provider": formatted.Provider || '',
            //     "MealPlan": ["hotelTbo", 'hotelTboH', "ratehawk", "hotelAhs"].includes(formatted?.customerDetails?.customer_request?.Provider) ? formatted?.customerDetails?.customer_request?.MealPlan : [],
            //     "ChildAge": formatted.ChildAge || '',
            //     "HotelID": value.hotel_id,
            //     "roomType": formatted?.hotelRatesRequest?.RoomTypeName,
            //     viewStatus: 'update',
            //     preId: value.hotels_pre_id,
            //     selectedCart_id: value.cart_id,
            // })
            // return
            router.push({
                pathname: `/product-details/hotels/${generateSlug(formatted.hotelMainRequest.hotelData.hotelName)}`,
                query: {
                    pID: value.hotel_id,
                    provider: formatted?.Provider,
                    "checkIn": moment(formatted.customerDetails.check_in).format("YYYY-MM-DD"),
                    "checkOut": moment(formatted.customerDetails.check_out).format("YYYY-MM-DD"),
                    "NoOfNights": '',
                    "NoOfRooms": formatted.NoOfRooms,
                    "NoOfAdults": formatted.NoOfAdults || 1,
                    "NoOfChild": formatted.NoOfChild || 0,
                    "Provider": formatted.Provider || '',
                    "MealPlan": ["hotelTbo", 'hotelTboH', "ratehawk", "hotelAhs"].includes(formatted?.customerDetails?.customer_request?.Provider) ? formatted?.customerDetails?.customer_request?.MealPlan : [],
                    "ChildAge": formatted.ChildAge || '',
                    "HotelID": value.hotel_id,
                    "roomType": formatted?.hotelRatesRequest?.RoomTypeName,
                    viewStatus: 'update',
                    preId: value.hotels_pre_id,
                    selectedCart_id: value.cart_id,
                }
            })
        } else if (category === 'essential' || category === 'nonessential') {

            console.log("value chamodddddd", {
                pID: value.essential_listing_id,
                viewStatus: "update",
                preId: value.essential_pre_order_id,
                locationtype: value.addressType,
                address: value.address,
                locationLatLng: value.city,
                quantity: value.quantity,
                prefereedDate: value.order_preffered_date,
                variant_type1: value.variant_type1,
                variant_type2: value.variant_type2,
                variant_type3: value.variant_type3,
                variant_type4: value.variant_type4,
                variant_type5: value.variant_type5,
                selectedCart_id: value.cart_id,
                delivery_location_id: value.delivery_location_id,
                otherDetails: value
            })
            console.log("value chamodddddd", value)
            // return;
            router.push({
                pathname: url,
                query: {
                    pID: value.essential_listing_id,
                    viewStatus: "update",
                    preId: value.essential_pre_order_id,
                    locationtype: value.addressType,
                    address: value.address,
                    locationLatLng: value.city,
                    quantity: value.quantity,
                    prefereedDate: value.order_preffered_date,
                    variant_type1: value.variant_type1,
                    variant_type2: value.variant_type2,
                    variant_type3: value.variant_type3,
                    variant_type4: value.variant_type4,
                    variant_type5: value.variant_type5,
                    selectedCart_id: value.cart_id,
                    delivery_location_id: value.delivery_location_id,
                    otherDetails: value
                }
            })
        }
    }

    const cleanAndConvertToNumber = (str) => {
        try {
            return parseFloat(str.replace(/,/g, ''));
        } catch (error) {
            return str;
        }
    };

    const getLifestyleRate = (item) => {
        console.log("getLifestyleRate item", item);
        let discountObj = null
        if (item?.lsDiscountMeta) {
            item?.lsDiscountMeta && (discountObj = JSON.parse(item?.lsDiscountMeta))
        }

        let lifestyStyleCost = 0.00;

        let lifestyAdultCost = 0.00;
        let lifestyChildCost = 0.00;
        let packageCost = 0.00;

        if (item.rate_type === "Package") {
            packageCost = item.package_rate
        } else {
            if (item.lifestyle_adult_count > 0) {
                lifestyAdultCost = (item.adult_rate * item.lifestyle_adult_count)
            }
            if (item.lifestyle_children_count > 0) {
                lifestyChildCost = (item.child_rate * item.nonFocChildCountLs || 0)
            }
        }

        let number1 = cleanAndConvertToNumber(lifestyAdultCost);
        let number2 = cleanAndConvertToNumber(lifestyChildCost);
        let number3 = cleanAndConvertToNumber(packageCost);
        lifestyStyleCost += number1 + number2 + number3;

        if (discountObj) {
            return CurrencyConverter(item.lsCurrency, getDiscountProductBaseByPrice(lifestyStyleCost, discountObj, baseCurrencyValue)["discountedAmount"], baseCurrencyValue);
        } else {
            return CurrencyConverter(item.lsCurrency, lifestyStyleCost, baseCurrencyValue);
        }
    }

    const getLifestyleRateDiscount = (item) => {
        console.log("getLifestyleRate item", item);
        let discountObj = null
        if (item?.lsDiscountMeta) {
            item?.lsDiscountMeta && (discountObj = JSON.parse(item?.lsDiscountMeta))
        }

        let lifestyStyleCost = 0.00;

        let lifestyAdultCost = 0.00;
        let lifestyChildCost = 0.00;
        let packageCost = 0.00;

        if (item.rate_type === "Package") {
            packageCost = item.package_rate
        } else {
            if (item.lifestyle_adult_count > 0) {
                lifestyAdultCost = (item.adult_rate * item.lifestyle_adult_count)
            }
            if (item.lifestyle_children_count > 0) {
                lifestyChildCost = (item.child_rate * item.nonFocChildCountLs || 0)
            }
        }

        let number1 = cleanAndConvertToNumber(lifestyAdultCost);
        let number2 = cleanAndConvertToNumber(lifestyChildCost);
        let number3 = cleanAndConvertToNumber(packageCost);
        lifestyStyleCost += number1 + number2 + number3;
        if (discountObj) {
            return CurrencyConverter(item.lsCurrency, getDiscountProductBaseByPrice(lifestyStyleCost, discountObj, baseCurrencyValue)["actual"], baseCurrencyValue);
        } else {
            return CurrencyConverter(item.lsCurrency, lifestyStyleCost, baseCurrencyValue);
        }



    }

    useEffect(() => {
        if (categorizeData?.main_category_id == 4) {
            setHotelDetails(JSON.parse(categorizeData?.bookingdataset))

            // console.log(JSON.parse(categorizeData?.bookingdataset),"Booking Details Set issss")
        }
    }, [categorizeData]);

    return (
        <>

            <tbody onClick={() => console.log((categorizeData))}>

                <ModalBase isOpen={productDeleteOpenModal} title={'Delete product'} toggle={handldeRemoveDetails}>
                    <div className="d-flex flex-column align-items-center">
                        <h6>Are you sure want to delete the product</h6>
                        <p className="text-center">( {deleteData.name} )</p>
                        <div className="d-flex gap-3 mt-4">
                            <button className="btn btn-sm btn-solid" onClick={handleDeleteConfirm}>Confirm</button>
                            <button className="btn btn-sm btn-solid" onClick={handldeRemoveDetails}>Cancel</button>
                        </div>
                    </div>
                </ModalBase>

                {
                    categorizeData?.main_category_id == 1 ?
                        <>
                            {/* Desktop/Tablet View */}
                            <tr className="col-12 m-0 p-0 d-none d-md-table-row" key={`desktop-${index}`}>
                                <td className="col-2 mx-3 m-0 p-0"><Media src={categorizeData?.productImage?.split(',')[0]} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', margin: '10px 0px' }} className="mx-auto" /></td>
                                <td className="col-3 m-0 p-0 px-3">
                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.listing_title}</span>
                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>Delivery in {categorizeData?.order_preffered_date} at {categorizeData?.address}</span>
                                </td>
                                <td className="col-2 m-0 p-0 px-3">
                                    <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}</h6>
                                    <p className="m-0 p-0">Total</p>
                                </td>
                                <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>Qty  x {categorizeData?.quantity}</td>
                                <td className="col-2 m-0 p-0 mt-4 pt-2" style={{ display: editOptions ? 'd-flex' : 'none' }}>
                                    <button className="btn px-1" onClick={() => handleEdit(`/product-details/essential/${generateSlug(categorizeData?.listing_title)}`, categorizeData, 'essential')}><EditIcon /></button>
                                    <button className="btn px-1" onClick={() => handleDelete(categorizeData?.listing_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.listing_title)}><DeleteIcon /></button>
                                </td>
                            </tr>

                            {/* Mobile View */}
                            <tr className="d-md-none" key={`mobile-${index}`}>
                                <td colSpan="5" className="p-0">
                                    <div className="card border-0 border-bottom rounded-0 mb-3">
                                        <div className="card-body p-3">
                                            <div className="row align-items-center">
                                                <div className="col-4">
                                                    <Media
                                                        src={categorizeData?.productImage?.split(',')[0]}
                                                        style={{
                                                            width: '80px',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px'
                                                        }}
                                                        className="w-100"
                                                    />
                                                </div>
                                                <div className="col-8">
                                                    <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                                        {categorizeData?.listing_title}
                                                    </h6>
                                                    <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                        Delivery: {categorizeData?.order_preffered_date}
                                                    </p>
                                                    <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                        {categorizeData?.address}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col-6">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="text-muted" style={{ fontSize: '12px' }}>Qty: {categorizeData?.quantity}</span>
                                                        <h6 className="mb-0 fw-bold text-dark">
                                                            {CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}
                                                        </h6>
                                                    </div>
                                                </div>
                                                <div className="col-6" style={{ display: editOptions ? 'block' : 'none' }}>
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <button
                                                            className="btn btn-sm btn-outline-primary p-2"
                                                            onClick={() => handleEdit(`/product-details/essential/${generateSlug(categorizeData?.listing_title)}`, categorizeData, 'essential')}
                                                            style={{ minWidth: '40px', height: '40px' }}
                                                        >
                                                            <EditIcon style={{ fontSize: '16px' }} />
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger p-2"
                                                            onClick={() => handleDelete(categorizeData?.listing_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.listing_title)}
                                                            style={{ minWidth: '40px', height: '40px' }}
                                                        >
                                                            <DeleteIcon style={{ fontSize: '16px' }} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </>
                        : categorizeData?.main_category_id == 2 ?
                            <>
                                {/* Desktop/Tablet View */}
                                <tr className="col-12 m-0 p-0 d-none d-md-table-row" key={`desktop-${index}`}>
                                    <td className="col-2 mx-3 m-0 p-0"><Media src={categorizeData?.productImage?.split(',')[0]} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', margin: '10px 0px' }} className="mx-auto" /></td>
                                    <td className="col-3 m-0 p-0 px-3">
                                        <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.listing_title}</span>
                                        <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>Delivery in {categorizeData?.order_preffered_date} at {categorizeData?.address}</span>
                                    </td>
                                    <td className="col-2 m-0 p-0 px-3">
                                        <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}</h6>
                                        <p className="m-0 p-0">Total</p>
                                    </td>
                                    <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>Qty  x {categorizeData?.quantity}</td>
                                    <td className="col-2 m-0 p-0 mt-4 pt-2" style={{ display: editOptions ? 'd-flex' : 'none' }}>
                                        <button className="btn px-1" onClick={() => handleEdit(`/product-details/nonessential/${generateSlug(categorizeData?.listing_title)}`, categorizeData, 'nonessential')}><EditIcon /></button>
                                        <button className="btn px-1" onClick={() => handleDelete(categorizeData?.listing_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.listing_title)}><DeleteIcon /></button>
                                    </td>
                                </tr>

                                {/* Mobile View */}
                                <tr className="d-md-none" key={`mobile-${index}`}>
                                    <td colSpan="5" className="p-0">
                                        <div className="card border-0 border-bottom rounded-0 mb-3">
                                            <div className="card-body p-3">
                                                <div className="row align-items-center">
                                                    <div className="col-4">
                                                        <Media
                                                            src={categorizeData?.productImage?.split(',')[0]}
                                                            style={{
                                                                width: '80px',
                                                                height: '80px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px'
                                                            }}
                                                            className="w-100"
                                                        />
                                                    </div>
                                                    <div className="col-8">
                                                        <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                                            {categorizeData?.listing_title}
                                                        </h6>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                            Delivery: {categorizeData?.order_preffered_date}
                                                        </p>
                                                        <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                            {categorizeData?.address}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-6">
                                                        <div className="d-flex justify-content-between align-items-center">
                                                            <span className="text-muted" style={{ fontSize: '12px' }}>Qty: {categorizeData?.quantity}</span>
                                                            <h6 className="mb-0 fw-bold text-dark">
                                                                {CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}
                                                            </h6>
                                                        </div>
                                                    </div>
                                                    <div className="col-6" style={{ display: editOptions ? 'block' : 'none' }}>
                                                        <div className="d-flex justify-content-end gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline-primary p-2"
                                                                onClick={() => handleEdit(`/product-details/nonessential/${generateSlug(categorizeData?.listing_title)}`, categorizeData, 'nonessential')}
                                                                style={{ minWidth: '40px', height: '40px' }}
                                                            >
                                                                <EditIcon style={{ fontSize: '16px' }} />
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger p-2"
                                                                onClick={() => handleDelete(categorizeData?.listing_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.listing_title)}
                                                                style={{ minWidth: '40px', height: '40px' }}
                                                            >
                                                                <DeleteIcon style={{ fontSize: '16px' }} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </>
                            : categorizeData?.main_category_id == 3 ?
                                <>
                                    {/* Desktop/Tablet View */}
                                    <tr className="col-12 m-0 p-0 d-none d-md-table-row" key={`desktop-${index}`}>
                                        <td className="col-2 mx-3 m-0 p-0"><Media src={categorizeData?.image?.split(',')[0]} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', margin: '10px 0px' }} className="mx-auto" /></td>
                                        {
                                            categorizeData?.provider === "bridgify" ? (
                                                (<td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.lifestyle_name}</span>
                                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>service on {categorizeData?.booking_date}
                                                        {/* at {categorizeData?.pickup_location} from {categorizeData?.pickup_time?.split?.('-')?.[0]} to {categorizeData?.pickup_time?.split?.('-')?.[1]} */}
                                                    </span>
                                                </td>)
                                            ) : categorizeData?.provider === "globaltix" ? (
                                                (<td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.lifestyle_name}</span>
                                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>service on {categorizeData?.booking_date}
                                                    </span>
                                                </td>)
                                            ) : categorizeData?.provider === "cebu" ? (
                                                (<td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.lifestyle_name}</span>
                                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>service on {categorizeData?.booking_date}
                                                    </span>
                                                </td>)
                                            ) : categorizeData?.provider === "zetexa" ? (
                                                (<td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.lifestyle_name}</span>

                                                </td>)
                                            ) :

                                                (<td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.lifestyle_name}</span>
                                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>service on {categorizeData?.inventory_date} at {categorizeData?.pickup_location} from {categorizeData?.pickup_time?.split?.('-')?.[0]} to {categorizeData?.pickup_time?.split?.('-')?.[1]}</span>
                                                </td>)
                                        }
                                        <td className="col-2 m-0 p-0 px-3">
                                            <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{getLifestyleRate(categorizeData)}</h6>
                                            {
                                                categorizeData?.lsDiscountMeta &&
                                                <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '400', textDecorationLine: 'line-through' }}>{getLifestyleRateDiscount(categorizeData)}</h6>
                                            }
                                            <p className="m-0 p-0">{'Total'}</p>
                                        </td>

                                        {
                                            categorizeData?.provider === "bridgify" ? (
                                                <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                    Ticket(s) : {categorizeData?.ticketCount}
                                                </td>
                                            ) :
                                                categorizeData?.provider === "globaltix" ? (
                                                    <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                        Ticket(s) : {categorizeData?.ticketCount}
                                                    </td>
                                                ) : categorizeData?.provider === "cebu" ? (
                                                    <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                        Ticket(s) : {categorizeData?.ticketCount}
                                                    </td>
                                                ) :
                                                    categorizeData?.provider === "zetexa" ? (
                                                        <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                            Quantity {categorizeData?.ticketCount}
                                                        </td>
                                                    ) :
                                                        (
                                                            <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                                {
                                                                    categorizeData?.lifestyle_adult_count > 0 && categorizeData?.lifestyle_adult_count === 1 ? <>Adult x {categorizeData?.lifestyle_adult_count}</> :
                                                                        categorizeData?.lifestyle_adult_count > 0 && <>Adults x {categorizeData?.lifestyle_adult_count}</>
                                                                }
                                                                <br />
                                                                {
                                                                    categorizeData?.lifestyle_children_count > 0 && categorizeData?.lifestyle_children_count === 1 ? <>Child x {categorizeData?.lifestyle_children_count}</> :
                                                                        categorizeData?.lifestyle_children_count > 0 && <>Children x {categorizeData?.lifestyle_children_count}</>
                                                                }
                                                            </td>
                                                        )
                                        }

                                        <td
                                            className="col-2 m-0 p-0 mt-4 pt-2"
                                            style={{ display: editOptions ? "flex" : "none" }}
                                        >
                                            <button
                                                className="btn px-1"
                                                onClick={() =>
                                                    handleEdit(
                                                        categorizeData?.provider === "bridgify"
                                                            ? `/product-details/lifestyle/v2/${generateSlug(categorizeData?.lifestyle_name)}`
                                                            :
                                                            categorizeData?.provider === "globaltix"
                                                                ? `/product-details/lifestyle/v3/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                : categorizeData?.provider === "zetexa"
                                                                    ? `/product-details/lifestyle/v5/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                    : categorizeData?.provider === "cebu"
                                                                        ? `/product-details/lifestyle/v4/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                        : `/product-details/lifestyle/${generateSlug(categorizeData?.lifestyle_name)}`,
                                                        categorizeData,
                                                        "lifestyle"
                                                    )
                                                }
                                            >
                                                <EditIcon />
                                            </button>

                                            <button
                                                className="btn px-1"
                                                onClick={() =>
                                                    handleDelete(
                                                        categorizeData?.lifestyle_pre_id,
                                                        categorizeData?.customer_cart_id,
                                                        categorizeData?.main_category_id,
                                                        categorizeData?.lifestyle_name
                                                    )
                                                }
                                            >
                                                <DeleteIcon />
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Mobile View */}
                                    <tr className="d-md-none" key={`mobile-${index}`}>
                                        <td colSpan="5" className="p-0">
                                            <div className="card border-0 border-bottom rounded-0 mb-3">
                                                <div className="card-body p-3">
                                                    <div className="row align-items-center">
                                                        <div className="col-4">
                                                            <Media
                                                                src={categorizeData?.image?.split(',')[0]}
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    objectFit: 'cover',
                                                                    borderRadius: '8px'
                                                                }}
                                                                className="w-100"
                                                            />
                                                        </div>
                                                        <div className="col-8">
                                                            <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                                                {categorizeData?.lifestyle_name}
                                                            </h6>
                                                            {categorizeData?.provider === "bridgify" || categorizeData?.provider === "globaltix" || categorizeData?.provider === "cebu" ? (
                                                                <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                                    Service: {categorizeData?.booking_date}
                                                                </p>
                                                            ) : categorizeData?.provider === "zetexa" ? (
                                                                <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                                    Lifestyle Experience
                                                                </p>
                                                            ) : (
                                                                <>
                                                                    <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                                        Service: {categorizeData?.inventory_date}
                                                                    </p>
                                                                    <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                        {categorizeData?.pickup_location}
                                                                    </p>
                                                                    <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                        {categorizeData?.pickup_time?.split?.('-')?.[0]} - {categorizeData?.pickup_time?.split?.('-')?.[1]}
                                                                    </p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="row mt-3">
                                                        <div className="col-6">
                                                            <div className="mb-2">
                                                                {categorizeData?.provider === "bridgify" || categorizeData?.provider === "globaltix" || categorizeData?.provider === "cebu" ? (
                                                                    <span className="text-muted" style={{ fontSize: '12px' }}>Tickets: {categorizeData?.ticketCount}</span>
                                                                ) : categorizeData?.provider === "zetexa" ? (
                                                                    <span className="text-muted" style={{ fontSize: '12px' }}>Qty: {categorizeData?.ticketCount}</span>
                                                                ) : (
                                                                    <div>
                                                                        {categorizeData?.lifestyle_adult_count > 0 && (
                                                                            <span className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                                                Adult{categorizeData?.lifestyle_adult_count > 1 ? 's' : ''}: {categorizeData?.lifestyle_adult_count}
                                                                            </span>
                                                                        )}
                                                                        {categorizeData?.lifestyle_children_count > 0 && (
                                                                            <span className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                                                Child{categorizeData?.lifestyle_children_count > 1 ? 'ren' : ''}: {categorizeData?.lifestyle_children_count}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h6 className="mb-0 fw-bold text-dark">
                                                                    {getLifestyleRate(categorizeData)}
                                                                </h6>
                                                                {categorizeData?.lsDiscountMeta && (
                                                                    <span className="text-muted text-decoration-line-through" style={{ fontSize: '12px' }}>
                                                                        {getLifestyleRateDiscount(categorizeData)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-6" style={{ display: editOptions ? 'block' : 'none' }}>
                                                            <div className="d-flex justify-content-end gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-outline-primary p-2"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            categorizeData?.provider === "bridgify"
                                                                                ? `/product-details/lifestyle/v2/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                                :
                                                                                categorizeData?.provider === "globaltix"
                                                                                    ? `/product-details/lifestyle/v3/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                                    : categorizeData?.provider === "zetexa"
                                                                                        ? `/product-details/lifestyle/v5/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                                        : categorizeData?.provider === "cebu"
                                                                                            ? `/product-details/lifestyle/v4/${generateSlug(categorizeData?.lifestyle_name)}`
                                                                                            : `/product-details/lifestyle/${generateSlug(categorizeData?.lifestyle_name)}`,
                                                                            categorizeData,
                                                                            "lifestyle"
                                                                        )
                                                                    }
                                                                    style={{ minWidth: '40px', height: '40px' }}
                                                                >
                                                                    <EditIcon style={{ fontSize: '16px' }} />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger p-2"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            categorizeData?.lifestyle_pre_id,
                                                                            categorizeData?.customer_cart_id,
                                                                            categorizeData?.main_category_id,
                                                                            categorizeData?.lifestyle_name
                                                                        )
                                                                    }
                                                                    style={{ minWidth: '40px', height: '40px' }}
                                                                >
                                                                    <DeleteIcon style={{ fontSize: '16px' }} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </>
                                : categorizeData?.main_category_id == 5 ?
                                    <>
                                        {/* Desktop/Tablet View */}
                                        <tr className="col-12 m-0 p-0 d-none d-md-table-row" key={`desktop-${index}`}>
                                            <td className="col-2 mx-3 m-0 p-0"><Media src={categorizeData?.image_path?.split(',')[0]} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', margin: '10px 0px' }} className="mx-auto" /></td>
                                            <td className="col-3 m-0 p-0 px-3">
                                                <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{categorizeData?.course_name}</span>
                                                <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>
                                                    service on {categorizeData?.preffered_booking_date} start at {categorizeData?.course_startime?.toString()?.slice(0, 5)}
                                                </span>
                                            </td>
                                            <td className="col-2 m-0 p-0 px-3">
                                                <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{categorizeData?.student_type === "Adult" ? CurrencyConverter(categorizeData?.eCurrency, categorizeData?.adult_course_fee, baseCurrencyValue) : CurrencyConverter(categorizeData?.eCurrency, categorizeData?.child_course_fee, baseCurrencyValue)}</h6>
                                                <p className="m-0 p-0">{'Total'}</p>
                                            </td>
                                            <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>{categorizeData?.student_type} x 1</td>
                                            <td className="col-2 m-0 p-0 mt-4 pt-2" style={{ display: editOptions ? 'd-flex' : 'none' }}>
                                                <button className="btn px-1" onClick={() => handleEdit(`/product-details/education/${generateSlug(categorizeData.course_name)}`, categorizeData, 'education')}><EditIcon /></button>
                                                <button className="btn px-1" onClick={() => handleDelete(categorizeData?.education_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.course_name)}><DeleteIcon /></button>
                                            </td>
                                        </tr>

                                        {/* Mobile View */}
                                        <tr className="d-md-none" key={`mobile-${index}`}>
                                            <td colSpan="5" className="p-0">
                                                <div className="card border-0 border-bottom rounded-0 mb-3">
                                                    <div className="card-body p-3">
                                                        <div className="row align-items-center">
                                                            <div className="col-4">
                                                                <Media
                                                                    src={categorizeData?.image_path?.split(',')[0]}
                                                                    style={{
                                                                        width: '80px',
                                                                        height: '80px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '8px'
                                                                    }}
                                                                    className="w-100"
                                                                />
                                                            </div>
                                                            <div className="col-8">
                                                                <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                                                    {categorizeData?.course_name}
                                                                </h6>
                                                                <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                                    Service: {categorizeData?.preffered_booking_date}
                                                                </p>
                                                                <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                    Start: {categorizeData?.course_startime?.toString()?.slice(0, 5)}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="row mt-3">
                                                            <div className="col-6">
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <span className="text-muted" style={{ fontSize: '12px' }}>{categorizeData?.student_type}</span>
                                                                    <h6 className="mb-0 fw-bold text-dark">
                                                                        {categorizeData?.student_type === "Adult" ?
                                                                            CurrencyConverter(categorizeData?.eCurrency, categorizeData?.adult_course_fee, baseCurrencyValue) :
                                                                            CurrencyConverter(categorizeData?.eCurrency, categorizeData?.child_course_fee, baseCurrencyValue)
                                                                        }
                                                                    </h6>
                                                                </div>
                                                            </div>
                                                            <div className="col-6" style={{ display: editOptions ? 'block' : 'none' }}>
                                                                <div className="d-flex justify-content-end gap-2">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary p-2"
                                                                        onClick={() => handleEdit(`/product-details/education/${generateSlug(categorizeData.course_name)}`, categorizeData, 'education')}
                                                                        style={{ minWidth: '40px', height: '40px' }}
                                                                    >
                                                                        <EditIcon style={{ fontSize: '16px' }} />
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger p-2"
                                                                        onClick={() => handleDelete(categorizeData?.education_pre_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, categorizeData?.course_name)}
                                                                        style={{ minWidth: '40px', height: '40px' }}
                                                                    >
                                                                        <DeleteIcon style={{ fontSize: '16px' }} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    </>
                                    : categorizeData?.main_category_id == 4 ?
                                        <>
                                            {/* Desktop/Tablet View */}
                                            <tr className="col-12 m-0 p-0 d-none d-md-table-row" key={`desktop-${index}`}>
                                                <td className="col-2 mx-3 m-0 p-0"><Media alt="product image cart section" src={
                                                    hotelDetails?.hotelMainRequest?.hotelData?.images?.split(',')[0] ||
                                                    'https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png'
                                                } style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '10px', margin: '10px 0px' }} className="mx-auto" /></td>
                                                <td className="col-3 m-0 p-0 px-3">
                                                    <span className="ellipsis-1-lines mb-1" style={{ fontSize: 14 }}>{hotelDetails?.hotelMainRequest?.hotelData?.hotelName}</span>
                                                    <span className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>Service from {hotelDetails?.customerDetails?.check_in} to {hotelDetails?.customerDetails?.check_out} in {hotelDetails?.hotelMainRequest?.hotelData?.address}</span>
                                                </td>
                                                {/* <td className="col-2 m-0 p-0 px-3">
                                                    {
                                                        const discount = JSON.parse(categorizeData?.hotelDiscountMeta);
                                                        discount &&
                                                        <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, getDiscountProductBaseByPrice(hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, discount, baseCurrencyValue)["discountedAmount"], baseCurrencyValue)}</h6>
                                                    }
                                                        <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, baseCurrencyValue)}</h6>


                                                    <p className="m-0 p-0">{'Total'}</p>
                                                </td> */}
                                                <td className="col-2 m-0 p-0 px-3">
                                                    {(() => {
                                                        try {
                                                            const discount = categorizeData?.hotelDiscountMeta
                                                                ? JSON.parse(categorizeData.hotelDiscountMeta)
                                                                : null;
                                                            console.log("123333discount", discount);
                                                            if (discount.id) {
                                                                return (
                                                                    <><h6
                                                                        className="m-0 p-0"
                                                                        style={{ color: "black", fontWeight: "500", }}
                                                                    >
                                                                        {CurrencyConverter(
                                                                            hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode,
                                                                            getDiscountProductBaseByPrice(
                                                                                hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice,
                                                                                discount,
                                                                                baseCurrencyValue
                                                                            )["discountedAmount"],
                                                                            baseCurrencyValue
                                                                        )}
                                                                    </h6><h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500', textDecoration: 'line-through' }}>{CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, baseCurrencyValue)}</h6></>

                                                                );
                                                            }else{
                                                                return (
                                                      <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, baseCurrencyValue)}</h6>

                                                                )
                                                            }
                                                            return null;
                                                        } catch (err) {
                                                            console.error("Invalid JSON in hotelDiscountMeta", err);
                                                            return null;
                                                        }
                                                    })()}
                                                    <p className="m-0 p-0">Total</p>
                                                </td>

                                                {console.log("hotelDetails hotel 123", categorizeData, hotelDetails)}
                                                <td className="col-2 m-0 p-0 px-3" style={{ fontSize: 14 }}>
                                                    {
                                                        hotelDetails?.NoOfAdults > 0 && hotelDetails?.NoOfAdults === 1 ? <>Adult x {hotelDetails?.NoOfAdults}</> :
                                                            hotelDetails?.NoOfAdults > 0 && <>Adults x {hotelDetails?.NoOfAdults}</>
                                                    }
                                                    <br />
                                                    {
                                                        hotelDetails?.NoOfChild > 0 && hotelDetails?.NoOfChild === 1 ? <>Child x {hotelDetails?.NoOfChild}</> :
                                                            hotelDetails?.NoOfChild > 0 && <>Children x {hotelDetails?.NoOfChild}</>
                                                    }
                                                </td>
                                                <td className="col-2 m-0 p-0 mt-4 pt-2" style={{ display: editOptions ? 'd-flex' : 'none' }}>
                                                    <button className="btn px-1" onClick={() => handleEdit('', categorizeData, 'hotel')}><EditIcon /></button>
                                                    <button className="btn px-1" onClick={() => handleDelete(categorizeData?.prebooking_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, hotelDetails?.hotelMainRequest?.hotelData?.hotelName)}><DeleteIcon /></button>
                                                </td>
                                            </tr>

                                            {/* Mobile View */}
                                            <tr className="d-md-none" key={`mobile-${index}`}>
                                                <td colSpan="5" className="p-0">
                                                    <div className="card border-0 border-bottom rounded-0 mb-3">
                                                        <div className="card-body p-3">
                                                            <div className="row align-items-center">
                                                                <div className="col-4">
                                                                    <Media
                                                                        alt="product image cart section"
                                                                        src={
                                                                            hotelDetails?.hotelMainRequest?.hotelData?.images?.split(',')[0] ||
                                                                            'https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png'
                                                                        }
                                                                        style={{
                                                                            width: '80px',
                                                                            height: '80px',
                                                                            objectFit: 'cover',
                                                                            borderRadius: '8px'
                                                                        }}
                                                                        className="w-100"
                                                                    />
                                                                </div>
                                                                <div className="col-8">
                                                                    <h6 className="mb-1 fw-bold" style={{ fontSize: '14px' }}>
                                                                        {hotelDetails?.hotelMainRequest?.hotelData?.hotelName}
                                                                    </h6>
                                                                    <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                                                        {hotelDetails?.customerDetails?.check_in} - {hotelDetails?.customerDetails?.check_out}
                                                                    </p>
                                                                    <p className="mb-1 text-muted" style={{ fontSize: '11px' }}>
                                                                        {hotelDetails?.hotelMainRequest?.hotelData?.address}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="row mt-3">
                                                                <div className="col-6">
                                                                    <div className="mb-2">
                                                                        {hotelDetails?.NoOfAdults > 0 && (
                                                                            <span className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                                                Adult{hotelDetails?.NoOfAdults > 1 ? 's' : ''}: {hotelDetails?.NoOfAdults}
                                                                            </span>
                                                                        )}
                                                                        {hotelDetails?.NoOfChild > 0 && (
                                                                            <span className="text-muted d-block" style={{ fontSize: '12px' }}>
                                                                                Child{hotelDetails?.NoOfChild > 1 ? 'ren' : ''}: {hotelDetails?.NoOfChild}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <h6 className="mb-0 fw-bold text-dark">
                                                                        {CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, baseCurrencyValue)}
                                                                    </h6>
                                                                </div>
                                                                <div className="col-6" style={{ display: editOptions ? 'block' : 'none' }}>
                                                                    <div className="d-flex justify-content-end gap-2">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary p-2"
                                                                            onClick={() => handleEdit('', categorizeData, 'hotel')}
                                                                            style={{ minWidth: '40px', height: '40px' }}
                                                                        >
                                                                            <EditIcon style={{ fontSize: '16px' }} />
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger p-2"
                                                                            onClick={() => handleDelete(categorizeData?.prebooking_id, categorizeData?.customer_cart_id, categorizeData?.main_category_id, hotelDetails?.hotelMainRequest?.hotelData?.hotelName)}
                                                                            style={{ minWidth: '40px', height: '40px' }}
                                                                        >
                                                                            <DeleteIcon style={{ fontSize: '16px' }} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        </>
                                        : null
                }

            </tbody>

            {
                discountData() !== null &&
                <div className="rounded-3 py-2 px-3 mb-3 border mx-4 mt-2">

                    <h6 className="text-start" style={{ textTransform: 'capitalize', fontWeight: '600' }}>{discountData().discount_tag_line}</h6>

                    <div className="d-flex align-items-start gap-1 offer-timeline py-2 px-3">
                        <EventRepeatIcon sx={{ fontSize: '18px', marginTop: '7px' }} />
                        <p className="m-0 p-0 py-1 px-2">Valid until : <b className="ms-1">{discountData().discount_end_date}</b></p>
                        <p className="m-0 p-0 ms-auto py-1 px-3 rounded-3">Limited time</p>
                    </div>

                    <div className="d-flex align-items-center m-0 p-0 my-3 offer-more-details py-2">
                        <div className="offer-more-details-label">
                            <LocalOfferIcon />
                        </div>
                        {
                            discountData()?.discount_type === "value" ? (
                                <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                                    <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                                        <h6 className="m-0 p-0 text-start">{discountData()?.elegibleLabel}</h6>
                                    </div>
                                </div>
                            ) : discountData()?.discount_type === "precentage" ? (
                                <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                                    <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                                        <h6 className="m-0 p-0 text-start">{discountData()?.amount}% have off this Product</h6>
                                    </div>
                                </div>
                            ) : (
                                <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                                    <img src={discountData()?.additional_data?.image?.split(',')[0]} style={{ width: '60px', height: '60px' }} className="m-0 p-0" />
                                    <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                                        <h6 className="ellipsis-1-lines m-0 p-0 text-start">{discountData()?.additional_data?.title}</h6>
                                        <p className="ellipsis-2-lines m-0 p-0 text-start">{discountData()?.additional_data?.desc}</p>
                                    </div>
                                </div>
                            )
                        }
                    </div>

                    {discountData()?.discount_type === "bogof" && <p className="m-0 p-0">You will get this product for free</p>}

                </div>
            }
            {/* {
                discountData !== null &&
                <div className="rounded-3 py-2 px-3 mb-3 border mx-4 mt-2">

                    <h6 className="text-start" style={{ textTransform: 'capitalize', fontWeight: '600' }}>{discountData.discount_tag_line}</h6>

                    <div className="d-flex align-items-start gap-1 offer-timeline py-2 px-3">
                        <EventRepeatIcon sx={{ fontSize: '18px', marginTop: '7px' }} />
                        <p className="m-0 p-0 py-1 px-2">Valid until : <b className="ms-1">{discountData.discount_end_date}</b></p>
                        <p className="m-0 p-0 ms-auto py-1 px-3 rounded-3">Limited time</p>
                    </div>

                    <div className="d-flex align-items-center m-0 p-0 my-3 offer-more-details py-2">
                        <div className="offer-more-details-label">
                            <LocalOfferIcon />
                        </div>
                        <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                            <img src={discountData?.additional_data?.image} style={{ width: '60px', height: '60px' }} className="m-0 p-0" />
                            <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                                <h6 className="ellipsis-1-lines m-0 p-0 text-start">{discountData.additional_data?.title}</h6>
                                <p className="ellipsis-2-lines m-0 p-0 text-start">{discountData.additional_data?.desc}</p>
                            </div>
                        </div>
                    </div>

                    {discountData?.discount_type === "bogof" && <p className="m-0 p-0">You will get this product for free</p>}

                </div>
            } */}

        </>
    )
}


export default getCards;