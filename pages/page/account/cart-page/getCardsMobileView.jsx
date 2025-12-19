import { Media } from "reactstrap";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

import { AppContext } from "../../../_app";
import { deleteCartByid } from "../../../../AxiosCalls/UserServices/CheckoutServices";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import ToastMessage from "../../../../components/Notification/ToastMessage";

// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';

function GetCardsMobileView({ categorizeData }) {

    const router = useRouter();
    const { baseCurrencyValue, triggers, setTriggers } = useContext(AppContext);

    const [productDeleteOpenModal, setProductDeleteOpenModal] = useState(false);
    const [hotelDetails, setHotelDetails] = useState([])

    const [deleteData, setDeleteData] = useState({
        productid: '',
        cartid: '',
        categoryid: '',
        name: '',
    })

    const handleDelete = async (productid, cartid, categoryid, productname) => {
        setDeleteData({
            productid: productid,
            cartid: cartid,
            categoryid: categoryid,
            name: productname,
        })
        setProductDeleteOpenModal(true)
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
            related_id: deleteData.productid
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

    const handleEdit = (url, value, category) => {
        if (category === "lifestyle") {
            router.push({
                pathname: url,
                query: {
                    viewStatus: 'update',
                    preId: value.lifestyle_pre_id,
                    service_date: value.inventory_date,
                    service_location: value.pickup_location,
                    selectedCart_id: value.cart_id,
                    lifestyle_inventory_id: value.lifestyle_inventory_id
                }
            })
        } else if (category === "education") {
            router.push({
                pathname: url,
                query: {
                    viewStatus: 'update',
                    preId: value.education_pre_id,
                    session_id: value.session_id,
                    booking_date: value.preffered_booking_date,
                    student_name: value.student_name,
                    student_type: value.student_type,
                    student_age: value.student_age,
                    selectedCart_id: value.cart_id,
                    timeslot: value.id
                }
            })
        } else if (category === 'hotel') {
            router.push({
                pathname: `/product-details/${value.provider}/${value.hotel_id}`,
                query: {
                    viewStatus: 'update',
                    preId: value.hotels_pre_id,
                }
            })
        } else if (category === 'essential' || category === 'nonessential') {
            router.push({
                pathname: url,
                query: {
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
                    otherDetails: value
                }
            })
        }
    }

    useEffect(() => {
        if (categorizeData.main_category_id == 4) {
            setHotelDetails(JSON.parse(categorizeData.bookingdataset))
        }
    }, [categorizeData]);

    const cleanAndConvertToNumber = (str) => {
        try {
            return parseFloat(str.replace(/,/g, ''));
        } catch (error) {
            return str;
        }
    };

    const getLifestyleRate = (item) => {

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
                lifestyChildCost = (item.child_rate * item.lifestyle_children_count)
            }
        }

        let number1 = cleanAndConvertToNumber(lifestyAdultCost);
        let number2 = cleanAndConvertToNumber(lifestyChildCost);
        let number3 = cleanAndConvertToNumber(packageCost);
        lifestyStyleCost += number1 + number2 + number3;

        return CurrencyConverter(item.lsCurrency, lifestyStyleCost, baseCurrencyValue);

    }


    return (
        <>
            {
                categorizeData?.main_category_id == 1 ?
                    <div className="col-12 m-0 p-0 d-flex align-items-center gap-2 mb-3">
                        <Media className="cart-page-product-image-mobileView" src={categorizeData?.productImage?.split(',')[0]} />
                        <div className="d-flex flex-column align-items-start flex-wrap justify-conetent-center">
                            <p className="ellipsis-1-lines m-0 p-0 w-100" style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{categorizeData?.listing_title}</p>
                            <p className="ellipsis-2-lines m-0 p-0 w-100" style={{ fontSize: 10, color: 'gray' }}>Delivery in {categorizeData?.order_preffered_date} at {categorizeData?.address}</p>
                            <div className="d-flex gap-2 m-0 p-0 align-items-center col-12">
                                <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}</h6>
                                <p className="m-0 p-0">Per quantity</p>
                            </div>
                        </div>
                        <div className="texting">Qty  x {categorizeData?.quantity}</div>
                    </div>
                    :
                    categorizeData?.main_category_id == 2 ?
                        <div className="col-12 m-0 p-0 d-flex align-items-center gap-2 mb-3">
                            <Media className="cart-page-product-image-mobileView" src={categorizeData?.productImage?.split(',')[0]} />
                            <div className="d-flex flex-column align-items-start flex-wrap justify-conetent-center">
                                <p className="ellipsis-1-lines m-0 p-0 w-100" style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{categorizeData?.listing_title}</p>
                                <p className="ellipsis-2-lines m-0 p-0 w-100" style={{ fontSize: 10, color: 'gray' }}>Delivery in {categorizeData?.order_preffered_date} at {categorizeData?.address}</p>
                                <div className="d-flex gap-2 m-0 p-0 align-items-center col-12">
                                    <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(categorizeData?.esCurrency, (categorizeData?.mrp * categorizeData?.quantity), baseCurrencyValue)}</h6>
                                    <p className="m-0 p-0">Per quantity</p>
                                </div>
                            </div>
                            <div className="texting">Qty x {categorizeData?.quantity}</div>
                        </div>
                        :
                        categorizeData?.main_category_id == 3 ?
                            <div className="col-12 m-0 p-0 d-flex align-items-center gap-2 mb-3">
                                <Media className="cart-page-product-image-mobileView" src={categorizeData?.image} />
                                <div className="d-flex flex-column align-items-start flex-wrap justify-conetent-center">
                                    <p className="ellipsis-1-lines m-0 p-0 w-100" style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{categorizeData?.lifestyle_name}</p>
                                    <p className="ellipsis-2-lines" style={{ fontSize: 10, color: 'gray' }}>service on {categorizeData?.inventory_date} at {categorizeData?.pickup_location} from {categorizeData?.pickup_time?.split?.('-')?.[0]} to {categorizeData?.pickup_time?.split?.('-')?.[1]}</p>
                                    <div className="d-flex gap-2 m-0 p-0 align-items-center col-12">
                                        <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{getLifestyleRate(categorizeData)}</h6>
                                        <p className="m-0 p-0">{categorizeData?.rate_type}</p>
                                    </div>
                                </div>
                                <div className="texting">
                                    {
                                        categorizeData?.lifestyle_adult_count > 0 && categorizeData?.lifestyle_adult_count === 1 ? <>Adult x {categorizeData?.lifestyle_adult_count}</> :
                                            categorizeData?.lifestyle_adult_count > 0 && <>Adults x {categorizeData?.lifestyle_adult_count}</>
                                    }
                                    {
                                        categorizeData?.lifestyle_children_count > 0 && categorizeData?.lifestyle_children_count === 1 ? <>Child x {categorizeData?.lifestyle_children_count}</> :
                                            categorizeData?.lifestyle_children_count > 0 && <>Children x {categorizeData?.lifestyle_children_count}</>
                                    }
                                </div>
                            </div > :
                            categorizeData?.main_category_id == 5 ?
                                <div className="col-12 m-0 p-0 d-flex align-items-center gap-2 mb-3">
                                    <Media className="cart-page-product-image-mobileView" src={categorizeData?.image_path} />
                                    <div className="d-flex flex-column align-items-start flex-wrap justify-conetent-center">
                                        <p className="ellipsis-1-lines m-0 p-0 w-100" style={{ fontSize: 14, fontWeight: '600', color: 'black' }}>{categorizeData?.course_name}</p>
                                        <p className="ellipsis-2-lines m-0 p-0 w-100" style={{ fontSize: 10, color: 'gray' }}>
                                            service on {categorizeData?.preffered_booking_date} start at {categorizeData?.course_startime?.toString()?.slice(0, 5)}
                                        </p>
                                        <div className="d-flex gap-2 m-0 p-0 align-items-center col-12">
                                            <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{categorizeData?.student_type === "Adult" ? CurrencyConverter(categorizeData?.eCurrency, categorizeData?.adult_course_fee, baseCurrencyValue) : CurrencyConverter(categorizeData?.eCurrency, categorizeData?.child_course_fee, baseCurrencyValue)}</h6>
                                            <p className="m-0 p-0">Per person</p>
                                        </div>
                                    </div>
                                    <div className="texting">{categorizeData?.student_type} x 1</div>
                                </div> :
                                categorizeData?.main_category_id == 4 ?
                                    <div className="col-12 m-0 p-0 d-flex align-items-center gap-2 mb-3">
                                        <Media className="cart-page-product-image-mobileView" alt="product image cart section" src={hotelDetails?.hotelMainRequest?.hotelData?.images?.split(',')[0]} />
                                        <div className="d-flex flex-column align-items-start flex-wrap justify-conetent-center">
                                            <p className="ellipsis-1-lines m-0 p-0 w-100" style={{ fontSize: 14, fontWeight: '600', color: 'black', textAlign: 'start' }}>{hotelDetails?.hotelMainRequest?.hotelData?.hotelName}</p>
                                            <p className="ellipsis-2-lines m-0 p-0 w-100" style={{ fontSize: 10, color: 'gray' }}>Service from {hotelDetails?.customerDetails?.check_in} to {hotelDetails?.customerDetails?.check_out} in {hotelDetails?.hotelMainRequest?.hotelData?.address}</p>
                                            <div className="d-flex gap-2 m-0 p-0 align-items-center col-12">
                                                <h6 className="m-0 p-0" style={{ color: 'black', fontWeight: '500' }}>{CurrencyConverter(hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode, hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice, baseCurrencyValue)}</h6>
                                                <p className="m-0 p-0">Price</p>
                                            </div>
                                        </div>
                                        <div className="texting">
                                            {
                                                hotelDetails.NoOfAdults > 0 && hotelDetails.NoOfAdults === 1 ? <>Adult x {hotelDetails.NoOfAdults}</> :
                                                    hotelDetails.NoOfAdults > 0 && <>Adults x {hotelDetails.NoOfAdults}</>
                                            }
                                            {
                                                hotelDetails.NoOfChild > 0 && hotelDetails.NoOfChild === 1 ? <>Child x {hotelDetails.NoOfChild}</> :
                                                    hotelDetails.NoOfChild > 0 && <>Children x {hotelDetails.NoOfChild}</>
                                            }
                                        </div>
                                    </div> : null
            }
        </>
    )
}


export default GetCardsMobileView;