import axios from "axios";
import moment from "moment";
import Head from "next/head";
import Slider from "react-slick";
import Select from 'react-select';
import { useRouter } from "next/router";
import DatePicker from 'react-date-picker';
import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Media, Input, Button } from "reactstrap";
import { LoadScript } from "@react-google-maps/api";
import GooglePlacesAutocomplete, { geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';
import { addDoc, collection } from "firebase/firestore";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Store as StoreIcon } from "@mui/icons-material";
import ProductTab from "../common/product-tab";
import Service from "../common/service";
import NewProduct from "../common/newProduct";

import { AppContext } from "../../_app";
import { db } from "../../../firebase";
import { svgFreeShipping } from "../../../services/script";

import SavedAddressPage from "../../page/account/profile/saved-address-page";
import ProductSkeleton from "../../skeleton/productSkeleton";

import CartContainer from "../../../components/CartContainer/CartContainer";
import ModalBase from "../../../components/common/Modals/ModalBase";
import ToastMessage from "../../../components/Notification/ToastMessage";
import CommonLayout from "../../../components/shop/common-layout";

import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { EssentialDetailPricing } from "../../../GlobalFunctions/CurrencyConverter/cartCheckoutPricing";
import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";

import { getDetailsAboutProduct, getProductReiews, getvariations } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";
import { getShippingAddress } from "../../../AxiosCalls/UserServices/userServices";
import { getSuppliedDetails } from "../../../AxiosCalls/GlobalAxiosServices/globalServices";

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { generateSlug } from "../../../GlobalFunctions/OthersGlobalfunctions";
import getDiscountProductBaseByPrice from "../common/GetDiscountProductBaseByPrice"
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
export async function getServerSideProps(context) {

    const id = context.query.pID;
    const name = context.query.name;

    let response = [];
    await getDetailsAboutProduct(id).then((res) => {
        if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
            return {
                redirect: {
                    destination: '/shop/education',
                    permanent: false,
                },
            };
        } else {
            response = res
        }
    });

    let reviews = [];
    await getProductReiews(3, id).then((res) => {
        if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
            reviews = []
        } else {
            reviews = res
        }
    });

    let pro_variants = [];
    await getvariations(id).then((res) => {
        if (res === 'Something went wrong !' || res === '(Internal Server Error)') {
            pro_variants = []
        } else {
            pro_variants = res.data
        }
    })

    const productUrl = `https://www.aahaas.com/product-details/essential/${name}?pID=${id}`;

    if (id === '' || id === undefined || id === null || name === '' || name === undefined || name === null) {
        return {
            redirect: {
                destination: '/shop/essential',
                permanent: false,
            },
        };
    }

    const dataset = {
        productData: response,
        productReviews: reviews,
        variants: pro_variants,
        productId: id,
        canonicalURL: productUrl
    }

    return {
        props: { dataset },
    };

}


const EssentialProductView = ({ dataset, pathId = dataset?.productId, canonicalURL = dataset?.canonicalURL }) => {
    console.log("Essential Product View", dataset)
    const router = useRouter();
    const PID = dataset?.productId;
    const categoryStar = [
        { value: 0, label: '' },
        { value: 1, label: '⭐' },
        { value: 2, label: '⭐⭐' },
        { value: 3, label: '⭐⭐⭐' },
        { value: 4, label: '⭐⭐⭐⭐' },
        { value: 5, label: '⭐⭐⭐⭐⭐' }
    ];

    const { baseCurrencyValue, userStatus, baseUserId, groupApiCode } = useContext(AppContext);

    const [category, setcategory] = useState('')
    const [googleLocation, setGoogleLocation] = useState('Enter your location...')
    const [showInstructions, setShowInstructions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [locationType, setLocationType] = useState('');
    const [locationTypeId, setLocationTypeId] = useState('');
    const [customerCustomAddress, setCustomerCustomAddress] = useState("");
    const [latLon, setlatLon] = useState("")
    const [selectedPaymentMethod, setselectedPaymentMethod] = useState('')

    const [productData, setProductData] = useState([]);
    const [discounts, setDiscounts] = useState([]);

    const [pictures, setPictures] = useState([]);

    const [variantData, setVariantData] = useState([])
    const [variationData, setVariationData] = useState([])
    const [variations, setVariationsType] = useState([])

    const [productPrice, setProductPrice] = useState({
        mrp: 0.00,
        inventory_id: '',
        rate_id: ''
    })

    const [selectedVariants, setSelectedVariants] = useState({
        variant1: null,
        variant2: null,
        variant3: null,
        variant4: null,
        variant5: null
    })

    const [shippingAddresses, setShippingAddresses] = useState([]);



    const [orderData, setOrderData] = useState({
        preferred_delivery_Date: moment(router.query.prefereedDate).format('YYYY-MM-DD') || new Date().toISOString().split('T')[0],
        city: '',
        address: '',
        address_type: ''
    })

    const [deliveryData, setDeliveryData] = useState({
        status: '',
        currency: 'LKR',
        deliverCharge: '0.00',
        deliveryRateID: ''
    })

    const [cartData, setCartData] = useState([]);
    const [showCartSection, setShowCartSection] = useState(false);
    const [productId, setProductId] = useState(pathId);

    const [quantity, setQuantity] = useState(1);

    const [maxminiQuantity, setmaxminiQuantity] = useState({
        min: '',
        max: '',
        error: false,
        errorContent: ''
    })

    const [canDelivery, setCanDelivery] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [suppplierDetails, setSuppplierDetails] = useState([]);

    const [categories, setCategories] = useState({
        category1: "",
        category2: "",
        category3: "",
        latitude: '',
        longitude: '',
        vendor_id: '',
        vandorName: '',
        sliderCount: ''
    });

    const [discountsMetaVal, setDiscountMetaVal] = useState([]);

    const handleDiscountOnClaim = (id) => {
        setDiscountMetaVal(id)
    }

    const getprodviewdataByid = async () => {

        setLoading(true);

        let result = dataset.productData;

        if (result) {

            if (generateSlug(result.discount_data[0].listing_title) !== router.query.name) {
                window.location.assign(`/product-details/essential/${generateSlug(result.discount_data[0].listing_title)}?pID=${router.query.pID}`)
            } else {

                let variants = dataset.variants;
                let supplierDetails = await getSuppliedDetails(result.discount_data[0].seller_id);

                setSuppplierDetails(supplierDetails);
                setReviews(dataset.productReviews);

                if (result.status === 200) {
                    const nextWeekDate = moment().add(result.discount_data[0].time_to_delivery, 'days').format('YYYY-MM-DD');
                    setProductData(result.discount_data[0]);
                    setDiscounts(result.discountPackage);
                    console.log()
                    setuserSelectedDate(null);
                    let paymentoptions = result.discount_data[0].payment_options.split(',')
                    setselectedPaymentMethod(paymentoptions[0]);
                    setPictures(result.pic_1[0].toString());
                }

                setVariantData(variants.variant)
                setVariationData(variants.variations)

                setProductPrice({
                    ...productPrice,
                    mrp: variants.variations[0]['mrp'],
                    inventory_id: variants.variations[0]['inventory_id'],
                    rate_id: variants.variations[0]['rate_id']
                })

                const pro_dataSet = dataset.productData.discount_data[0];

                setCategories({
                    ...categories,
                    category1: pro_dataSet.category1,
                    category2: pro_dataSet.category2,
                    category3: pro_dataSet.category3,
                    vendor_id: pro_dataSet.seller_id,
                    sliderCount: '4'
                })

                var x = 0;
                var variationData = []

                for (var i = 1; i <= 5; i++) {
                    if (variants.variations[0]['variation_type' + i]) {

                        x++;

                        var variationType = `variation_type${x}`;

                        variationData.push(variants.variations[0][variationType])
                    }
                }

                setVariationsType(variationData)
                let existingdata = router.query;
                let newSelectedVariants = { ...selectedVariants };
                // variants.variant.forEach((value, key) => {
                //     let no = Number(key) + 1;
                //     let variantNo = "variant" + no;
                //     let variant_type = "variant_type" + no;
                //     if (value[0][variant_type] !== null) {
                //         if (existingdata[variant_type] == undefined) {
                //             newSelectedVariants[variantNo] = value[0][variant_type];
                //         } else {
                //             newSelectedVariants[variantNo] = existingdata[variant_type];
                //         }
                //     }
                // });

                variants.variant.forEach((value, key) => {
                    let no = Number(key) + 1;
                    let variantNo = "variant" + no;
                    let variant_type = "variant_type" + no;

                    // Check if the array is not empty and has at least one element
                    if (value.length > 0 && value[0][variant_type] !== null) {
                        if (existingdata[variant_type] == undefined) {
                            newSelectedVariants[variantNo] = value[0][variant_type];
                        } else {
                            newSelectedVariants[variantNo] = existingdata[variant_type];
                        }
                    }
                });
                setSelectedVariants(newSelectedVariants);

                setLoading(false);

            }

        } else {
            router.replace('/shop/essential')
        }

    }

    const handleIncrement = () => {
        if (quantity < maxminiQuantity.max) {
            setQuantity(Number(quantity) + 1)
            setmaxminiQuantity({
                ...maxminiQuantity,
                error: false
            })
        } else {
            setmaxminiQuantity({
                ...maxminiQuantity,
                error: true,
                errorContent: maxminiQuantity.min === maxminiQuantity.max ? `You can purchase only one ${maxminiQuantity.min} per order` : `Maximum quantiay per order is ${maxminiQuantity.max}`
            })
        }
    }

    const handleDecrement = () => {
        if (quantity > maxminiQuantity.min) {
            setQuantity(Number(quantity) - 1)
            setmaxminiQuantity({
                ...maxminiQuantity,
                error: false
            })
        } else {
            setmaxminiQuantity({
                ...maxminiQuantity,
                error: true,
                errorContent: maxminiQuantity.min === maxminiQuantity.max ? `You can purchase only one ${maxminiQuantity.min} per order` : `Minimum quantiay per order is ${maxminiQuantity.min}`
            })
        }
    }

    const handleOnChange = (name, value) => {
        setSelectedVariants({
            ...selectedVariants,
            [name]: value
        })
    }

    const handleAddToCartMain = () => {
        if (isSelectData === false) {
            ToastMessage({ status: "warning", message: "Please choose your Date" })
        } else if (locationType === "") {
            ToastMessage({ status: "warning", message: "Please choose your delivery location" })
        } else if (!deliveryData.status) {
            if (locationType == "Saved location") {
                ToastMessage({ status: "error", message: "Please select your address" })
            } else if (locationType == "Custom location") {
                ToastMessage({ status: "error", message: "Please enter your address" })
            } else {
                ToastMessage({ status: "error", message: "Delivery cost is calculating" })
            }
        } else if (!canDelivery) {
            ToastMessage({ status: "error", message: "Delivery is not available in your location" })
        } else {
            let discountAmount = 0.00
            let bobItem = "";
            let mrp = productPrice.mrp * quantity
            if (quantity >= productData['discount_min_order_qty'] && quantity <= productData['discount_max_order_qty']) {
                if (productData['discount_type_id'] === 'fps') {
                    discountAmount = productData['discount_amount']
                } else if (productData['discount_type_id'] === 'ps') {
                    discountAmount = (productPrice.mrp * quantity) * (productData['discount_percentage'] / 100)
                } else {
                    bobItem = productData['offer_product_title']
                }
            } else {
                discountAmount = 0.00
            }
            const dataD = {
                main_category_id: productData['category1'],
                listing_id: pathId,
                essential_inventory_id: productPrice.inventory_id,
                address: customerCustomAddress,
                city: latLon,
                customer_id: baseUserId.cxid,
                rate_id: productPrice.rate_id,
                preffered_date: orderData.preferred_delivery_Date,
                quantity: quantity,
                status: 'Pending',
                viewStatus: cartStatus.status,
                preId: cartStatus.preId,
                addressType: locationType,
                delivery_location_id: locationType == "Saved location" ? selectedLocationId : null,
                deliverycharge: deliveryData.deliverCharge,
                discountMrp: EssentialDetailPricing(productPrice, quantity, productData)['priceWithDiscount'] + deliveryData.deliverCharge,
                netAmount: EssentialDetailPricing(productPrice, quantity, productData)['priceWithDiscount'],
                finalPrice: (mrp * quantity) - discountAmount,
                paymentType: productData['payment_options'],
                currency: productData['currency'],
                eachitem: CurrencyConverter(productData['currency'], parseFloat(productPrice?.mrp), baseCurrencyValue)?.slice(4),
                user_id: baseUserId.cxid,
                deliveryRateID: deliveryData.deliveryRateID,
                paymentMethod: selectedPaymentMethod,
                cart_id: cartStatus.cartId,
                discount_meta_value_set: discountsMetaVal?.id ? JSON.stringify(discountsMetaVal) : null
            }
            if (userStatus.userLoggesIn) {
                setShowCartSection(true);
                setCartData(dataD);
            } else {
                router.push("/page/account/login-auth");
                localStorage.setItem("lastPath", router.asPath)
                ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features." })
            }
        }
    }

    const addressTypes = [
        { value: 'Current location', label: 'Current location', },
        { value: 'Custom location', label: 'Custom location', }
    ]

    const addressTypesLoggedin = [
        { value: 'Current location', label: 'Current location', },
        { value: 'Saved location', label: 'Saved location', },
        { value: 'Custom location', label: 'Custom location', }
    ]

    const handleSelectAddressType = (e) => {
        setSelectedSavedLocation('');
        setCustomerCustomAddress('');
        setLocationTypeId('');
        setSelectedLocationId('');
        if (e.value === 'Current location') {
            navigator.geolocation.getCurrentPosition((position) => {
                setlatLon(`${position.coords.latitude},${position.coords.longitude}`);
                getLocationDetils(position.coords.latitude, position.coords.longitude);
                setStartCalculatingPrice(true);
                setLocationType(e.value);
            }, (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setShowInstructions(true);
                }
            });
        } else {
            setLocationType(e.value);
            setCanDelivery(false);
            setDeliveryData({
                status: '',
                currency: 'LKR',
                deliverCharge: '0.00',
                deliveryRateID: ''
            })
            setStartCalculatingPrice(false);
        }
    }


    const handlesetShowInstructions = () => {
        setShowInstructions(false);
    }

    const [selectedSavedLocation, setSelectedSavedLocation] = useState('')
    const [selectedLocationId, setSelectedLocationId] = useState('')

    const handleChooseSavedLocation = (e) => {
        console.log("handleChooseSavedLocation e", e)
        setSelectedLocationId(e.id)
        setLocationTypeId(e.id)
        let value = e.value.split(',')
        setCustomerCustomAddress(e.label);
        setSelectedSavedLocation(e.key);
        getLocationDetils(value[0], value[1]);
    }

    const handleOnGoogleLocationChange = (value) => {
        setGoogleLocation(value['label'])
        geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
            getLocationDetils(lat, lng);
        }).catch((error) => {
            // console.error(error);
        })
    }


    const loadGoogleMapsAPI = () => {
        return new Promise((resolve, reject) => {
            if (typeof window.google !== "undefined" && window.google.maps) {
                // Google Maps API already loaded
                resolve(window.google);
                return;
            }

            // Check if the script is already added to avoid duplicate loads
            const existingScript = document.getElementById("google-maps-api");
            if (existingScript) {
                existingScript.onload = () => resolve(window.google);
                existingScript.onerror = (error) => reject(error);
                return;
            }

            // Create and append the script dynamically
            const script = document.createElement("script");
            script.id = "google-maps-api";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${groupApiCode}&libraries=places`;
            script.async = true;
            script.defer = true;

            script.onload = () => resolve(window.google);
            script.onerror = (error) => reject(error);

            document.head.appendChild(script);
        });
    };

    const getLocationDetils = async (latitude, longitude) => {
        try {
            await loadGoogleMapsAPI().then(() => {
                const geocoder = new google.maps.Geocoder();
                const latLng = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
                geocoder.geocode({ location: latLng }, (results, status) => {
                    if (status === "OK" && results[0]) {
                        const cityComponent = results[0].address_components.find(component =>
                            component.types.includes("locality")
                        );
                        const city = cityComponent ? cityComponent.short_name : "Unknown City";
                        setlatLon(latitude + "," + longitude);
                        setOrderData({ ...orderData, address: city });
                        getTotalDistance(latitude + "," + longitude, city, productData);
                        setCustomerCustomAddress(results[0]['formatted_address']);
                    } else {
                        setCustomerCustomAddress('Something went wrong ...')
                    }
                });
            });
        } catch (error) {
            setTimeout(() => {
                // console.error(error);
            }, 2000);
        }
    }

    const [startCalculatingPrice, setStartCalculatingPrice] = useState(false);

    const getTotalDistance = async (latLonMain, city, product) => {
        setStartCalculatingPrice(true);
        const data = {
            latLonMain: product['latlon'],
            latLonSecondary: latLonMain,
            cityName: city,
            date: orderData['preferred_delivery_Date']
        }
        await axios.post('getDeliveryDetails', data, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then((response) => {
            if (response.data.status === 200) {
                setDeliveryData({ ...deliveryData, status: response.data.status, message: response.data.message, currency: response.data.currency, deliverCharge: response.data.deliveryCharge, deliveryRateID: response.data.deliveryRateID })
                setCanDelivery(true);
            } else if (response.data.status === 400) {
                setDeliveryData({ ...deliveryData, status: response.data.status, message: response.data.message, currency: response.data.currency, deliverCharge: response.data.deliveryCharge, deliveryRateID: response.data.deliveryRateID })
                setCanDelivery(false);
            } else {
                setDeliveryData({ ...deliveryData, status: '500', message: 'something went wrong !', currency: '', deliverCharge: '', deliveryRateID: '' })
                setCanDelivery(false);
            }
        }).catch((error) => {
            setCanDelivery(false);
            setStartCalculatingPrice(false);
        }).finally(() => {
            setStartCalculatingPrice(false);
        });
    }

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
                    customer_id: baseUserId.cxid,
                    chat_related: 'Technical-support',
                    customer_collection_id: baseUserId.cxid,
                    chat_related_to: "Product",
                    supplier_mail_id: "aahaas@gmail.com",
                    group_chat: 'true',
                    supplier_added_date: Date.now(),
                    chat_related_id: pathId,
                    chat_related_id: productId,
                    chat_category: category,
                    chat_avatar: productData.product_images,
                    supplier_id: productData.seller_id,
                    chat_name: productData.listing_title,
                    comments: { category: 1, product_id: productData?.id },
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


    const handlePassData = (value) => {
        setShowCartSection(false)
        if (value) {
            // router.push('/page/account/cart-page')
            router.push('/shop/essential')
        }
    }

    const DeliveryComponent = () => {
        if (startCalculatingPrice) {
            return (
                <div className="collection-filter-block mb-0 p-2 rounded-0 border">
                    <div className="product-service p-0">
                        <div className='media border-0 m-0 p-0 d-flex align-items-center px-0 px-lg-2 gap-0 gap-lg-2'>
                            <div dangerouslySetInnerHTML={{ __html: svgFreeShipping }} />
                            <div className="media-body d-flex flex-column align-items-start">
                                <h4 className="text-start" style={{ fontWeight: 500, fontSize: 14 }}>Hold On !</h4>
                                <h4 className="text-start" style={{ fontWeight: 500, fontSize: 12 }}>We are calculating your delivery amount</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else if (canDelivery) {
            return (
                <div className="collection-filter-block mb-0 p-2 rounded-0 border">
                    <div className="product-service p-0">
                        <div className='media border-0 m-0 p-0 d-flex align-items-center px-0 px-lg-2 gap-0 gap-lg-2'>
                            <div dangerouslySetInnerHTML={{ __html: svgFreeShipping }} />
                            <div className="media-body">
                                <h4 style={{ color: 'black', fontWeight: 500, fontSize: 14, maxWidth: '350px' }} title={customerCustomAddress} className="adddress_full_p">{customerCustomAddress}</h4>
                                <div className="d-flex align-items-center gap-1 mt-1">
                                    <h4 className="m-0 p-0" style={{ fontWeight: 500, fontSize: 12 }}>{CurrencyConverter(deliveryData.currency, deliveryData.deliverCharge, baseCurrencyValue)}</h4>
                                    <span className="m-0 p-0" style={{ color: 'gray', fontSize: 12 }}>( Delivery Charge )</span>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            if (deliveryData.status == 400) {
                return (
                    <div className="collection-filter-block mb-0 p-2 rounded-0 border">
                        <div className="product-service p-0">
                            <div className='media border-0 m-0 p-0 d-flex align-items-center px-0 px-lg-2 gap-0 gap-lg-2'>
                                <div dangerouslySetInnerHTML={{ __html: svgFreeShipping }} />
                                <div className="media-body">
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 14 }}>Oops...</h4>
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 12, color: 'red' }}>This Product Cannot Be Delivered to Your Address</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else if (deliveryData.status == 300) {
                return (
                    <div className="collection-filter-block mb-0 p-2 rounded-0 border">
                        <div className="product-service p-0">
                            <div className='media border-0 m-0 p-0 d-flex align-items-center px-0 px-lg-2 gap-0 gap-lg-2'>
                                <div dangerouslySetInnerHTML={{ __html: svgFreeShipping }} />
                                <div className="media-body">
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 14 }}>Oops...</h4>
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 12 }}>{deliveryData?.message}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            } else if (deliveryData.status == 500) {
                return (
                    <div className="collection-filter-block mb-0 p-2 rounded-0 border">
                        <div className="product-service p-0">
                            <div className='media border-0 m-0 p-0 d-flex align-items-center px-0 px-lg-2 gap-0 gap-lg-2'>
                                <div dangerouslySetInnerHTML={{ __html: svgFreeShipping }} />
                                <div className="media-body">
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 14 }}>Oops...</h4>
                                    <h4 className="text-start" style={{ fontWeight: 500, fontSize: 12 }}>Something went wrong with product !</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    }

    const [userSelectedDate, setuserSelectedDate] = useState('');
    const [showItem, setShoeItem] = useState([]);
    const [isSelectData, setIsSelectData] = useState(false);
    const onChangeDate = (value) => {
        setuserSelectedDate(value)
        setIsSelectData(true)
        setOrderData({ ...orderData, preferred_delivery_Date: moment(value).format('YYYY-MM-DD') })
    }

    const closeSidebar = () => {
        closeSubFilter()
    };

    const products = {
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: false,
        arrows: true,
        fade: true,
    };

    const sliderNav = {
        slidesToShow: pictures?.split?.(',')?.length,
        slidesToScroll: 1,
        arrows: false,
        dots: false,
        adaptiveHeight: true,
        focusOnSelect: true,
    };

    const [nav1, setNav1] = useState(null);
    const [nav2, setNav2] = useState(null);
    const [slider1, setSlider1] = useState(null);
    const [slider2, setSlider2] = useState(null);

    const [cartStatus, setCartStatus] = useState({
        status: 'new',
        preId: 1,
        cartId: null
    })

    // const updateInitialValue = () => {
    //     if (router?.query?.viewStatus === 'update') {
    //         setCartStatus({
    //             status: 'update',
    //             preId: router?.query?.preId,
    //             cartId: router?.query?.selectedCart_id
    //         })
    //         let routerlatlng = router?.query?.locationLatLng.split(',')
    //         if (router?.query?.locationtype === 'Current location') {
    //             try {
    //                 navigator.geolocation.getCurrentPosition((position) => {
    //                     getLocationDetils(position.coords.latitude, position.coords.longitude);
    //                     // setStartCalculatingPrice(true);
    //                 });
    //             } catch (error) {
    //                 // setStartCalculatingPrice(false);
    //             }
    //         } else if (router?.query?.locationtype === "Saved location") {
    //             let lat2 = Number(routerlatlng[0]).toFixed(2);
    //             let long1 = Number(routerlatlng[1]).toFixed(2);
    //             let value = shippingAddresses.filter((data) => {
    //                 let latlong = data.value.split(',');
    //                 let lat1 = Number(latlong[0]).toFixed(2);
    //                 let long2 = Number(latlong[1]).toFixed(2);
    //                 if (Math.round(lat1) === Math.round(lat2) && Math.round(long1) === Math.round(long2)) {
    //                     return data;
    //                 }
    //             });
    //             if (value.length > 0) {
    //                 handleChooseSavedLocation(value[0]);
    //                 getLocationDetils(long1, lat2);
    //             }
    //         } else if (router?.query?.locationtype === 'Custom location') {
    //             setGoogleLocation(router?.query?.address);
    //             getLocationDetils(Number(routerlatlng[0]), Number(routerlatlng[1]));
    //         }
    //         setQuantity(router?.query?.quantity)
    //         setLocationType(router?.query?.locationtype)
    //     }
    // }

    const updateInitialValue = () => {
        if (router?.query?.viewStatus === 'update') {
            setCartStatus({
                status: 'update',
                preId: router?.query?.preId,
                cartId: router?.query?.selectedCart_id
            })

            // Handle prefereedDate from URL
            if (router?.query?.prefereedDate) {
                setuserSelectedDate(router.query.prefereedDate);
                setOrderData({
                    ...orderData,
                    preferred_delivery_Date: router.query.prefereedDate
                });
            }


            // setSelectedLocationId()

            let routerlatlng = router?.query?.locationLatLng.split(',')
            if (router?.query?.locationtype === 'Current location') {
                try {
                    navigator.geolocation.getCurrentPosition((position) => {
                        getLocationDetils(position.coords.latitude, position.coords.longitude);
                        // setStartCalculatingPrice(true);
                    });
                } catch (error) {
                    // setStartCalculatingPrice(false);
                }
            } else if (router?.query?.locationtype === "Saved location") {
                let lat2 = Number(routerlatlng[0]).toFixed(2);
                let long1 = Number(routerlatlng[1]).toFixed(2);
                let value = shippingAddresses.filter((data) => {
                    let latlong = data.value.split(',');
                    let lat1 = Number(latlong[0]).toFixed(2);
                    let long2 = Number(latlong[1]).toFixed(2);
                    if (Math.round(lat1) === Math.round(lat2) && Math.round(long1) === Math.round(long2)) {
                        return data;
                    }
                });
                if (value.length > 0) {
                    handleChooseSavedLocation(value[0]);
                    getLocationDetils(long1, lat2);
                }
                getLocationDetils(Number(routerlatlng[0]), Number(routerlatlng[1]));
            } else if (router?.query?.locationtype === 'Custom location') {
                setGoogleLocation(router?.query?.address);
                getLocationDetils(Number(routerlatlng[0]), Number(routerlatlng[1]));
            }
            setQuantity(router?.query?.quantity)
            setLocationType(router?.query?.locationtype)
            setLocationTypeId(parseInt(router?.query?.delivery_location_id))
            if (shippingAddresses.length > 0 && router?.query?.delivery_location_id) {
                let selectedAddress = shippingAddresses.find(address => address.id === parseInt(router?.query?.delivery_location_id));
                setSelectedLocationId(selectedAddress.id)
                let value = selectedAddress.value.split(',')
                setCustomerCustomAddress(selectedAddress.label);
                setSelectedSavedLocation(selectedAddress.key);
                getLocationDetils(value[0], value[1]);
            }
        }
    }

    const [savedAddressModal, setSavedAddressModal] = useState(false)

    const handleSaveAddress = async () => {

        setSavedAddressModal(!savedAddressModal)
        setDeliveryData({...deliveryData,status : ''})
        setLocationTypeId('')
        setCanDelivery(false);
        setLocationType('')
         setSelectedLocationId('')
        // let value = e.value.split(',');
        setCustomerCustomAddress('');
        setSelectedSavedLocation('');
        getLocationDetils(null, null);
        await getUserShippingAddress()

    }

    const getUserShippingAddress = async () => {
        if (userStatus.userLoggesIn) {
            let shippingAdd = []
            await getShippingAddress(baseUserId.cxid).then((response) => {
                response.map((value) => {
                    if (value.latitude == '' || value.longtitude == '') {

                    } else {
                        shippingAdd.push({
                            key: shippingAdd.length,
                            label: value.address_full + " ( " + value.contact_name + " ) ",
                            value: value.latitude + "," + value.longtitude,
                            id: value.id
                        })
                    }
                })
            })
            console.log("Shipping Addresses:", shippingAdd);
            setShippingAddresses(shippingAdd)
        }
    }

    const getPaymentOptions = () => {
        let values = productData.payment_options.split(',')
        return (
            values.map((value, key) => (
                value == 1 ?
                    <div className="d-flex align-items-center gap-2" style={{ marginRight: '20px' }}>
                        <input type="radio" checked={selectedPaymentMethod == 1 ? true : false} onChange={() => setselectedPaymentMethod(1)} />
                        <img key={key} src={`/assets/images/Ess-NonessImages/cashondel.png`} style={{ width: "40px", height: "auto" }} className='mr-2' />
                    </div>
                    :
                    value == 'Cash Payment' ?
                        <div className="d-flex align-items-center gap-2" style={{ marginRight: '20px' }}>
                            <input type="radio" checked={selectedPaymentMethod == 1 ? true : false} onChange={() => setselectedPaymentMethod(1)} />
                            <img key={key} src={`/assets/images/Ess-NonessImages/cashondel.png`} style={{ width: "40px", height: "auto" }} className='mr-2' />
                        </div>
                        :
                        value == 2 ?
                            <div className="d-flex align-items-center gap-2" style={{ marginRight: '20px' }}>
                                <input type="radio" checked={selectedPaymentMethod == 2 ? true : false} onChange={() => setselectedPaymentMethod(2)} />
                                <img key={key} src={`/assets/images/Ess-NonessImages/payonline.png`} style={{ width: "40px", height: "auto" }} className='mr-2' />
                            </div>
                            :
                            value == 'Online Payment' ?
                                <div className="d-flex align-items-center gap-2" style={{ marginRight: '20px' }}>
                                    <input type="radio" checked={selectedPaymentMethod == 2 ? true : false} onChange={() => setselectedPaymentMethod(2)} />
                                    <img key={key} style={{ width: "40px", height: "auto" }} src={`/assets/images/Ess-NonessImages/payonline.png`} className='mr-2' />
                                </div>
                                : null
            ))
        )
    }

    useEffect(() => {
        if (router.query?.viewStatus === "update" && isSelectData === false && new Date(router.query?.prefereedDate)) {
            setIsSelectData(true)
        }
        if (!loading) {
            updateInitialValue()
        }
    // }, [router, productData, shippingAddresses])
    }, [router, productData])

    useEffect(() => {
        getprodviewdataByid();
    }, [dataset]);

    useEffect(() => {
        var price = variationData.filter((variant) => {
            return variant.variant_type1 === selectedVariants['variant1'] && variant.variant_type2 === selectedVariants['variant2'] && variant.variant_type3 === selectedVariants['variant3'] && variant.variant_type4 === selectedVariants['variant4'] && variant.variant_type5 === selectedVariants['variant5']
        })
        if (price.length >= 1) {
            setProductPrice({ ...productPrice, mrp: price[0]['mrp'], inventory_id: price[0]['inventory_id'] })
            setmaxminiQuantity({
                error: false,
                min: price[0].min_order_qty,
                max: price[0].max_order_qty
            })
            console.log("Price updated based on selected variants:", price[0]);
        }
    }, [selectedVariants]);

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    }, [window.location.href]);

    useEffect(() => {
        getUserShippingAddress()
    }, [baseUserId.cxid])

    useEffect(() => {
        setNav1(slider1);
        setNav2(slider2);
    }, [slider1, slider2]);

    useEffect(() => {
        let showitems = ['proDiscounts', 'paymentOptions', 'cancellationDays', 'activeEndDate', 'timeToDelivery', 'reviewStar', 'brandDetails', 'createdTime', 'triggerCount']
        if (productData.payment_options?.split(',').includes('1') || productData.payment_options?.split(',').includes('Cash Payment')) {
            showitems.push('cashOnDelivery')
        }
        if (productData.payment_options?.split(',').includes('2') || productData.payment_options?.split(',').includes('Online Payment')) {
            showitems.push('onlinePayment')
        }
        setShoeItem(showitems)
    }, [reviews, productData]);

    const [openSideBarStatus, setopenSideBarStatus] = useState(false);

    const openSubFilter = () => {
        setopenSideBarStatus(true);
    }

    const closeSubFilter = () => {
        setopenSideBarStatus(false);
    }

    const handleBack = (e) => {
        e.preventDefault();

        // Disable scroll restoration temporarily
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Go back
        window.history.back();

        // Reset scroll after a short delay
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 50);
    };

    return (
        <>

            <Head>
                <link rel="canonical" href={canonicalURL} as={canonicalURL} />
                <title>Aahaas - {dataset.productData.discount_data[0].listing_title} | Quality Essential Goods with Aahaas</title>
                <meta name="description" content={`Discover ${dataset.productData.discount_data[0].listing_description} at Aahaas. Experience high-quality essential commodities designed for your daily needs. Shop now for convenience and reliability, ensuring you have everything you need for a seamless lifestyle.`} />
                {/* PDP Page */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Home",
                                    "item": "https://www.aahaas.com/"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Essentials",
                                    "item": "https://www.aahaas.com/product-details/essential/"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": "Essentials",
                                    "item": `https://www.aahaas.com/product-details/essential/${generateSlug(dataset.productData.discount_data[0].listing_title)}?pID=${pathId}`
                                }
                            ]
                        }),
                    }}
                />
            </Head>

            <CommonLayout parent="Home" title={'essential'} subTitle={'product view'} openSubFilter={() => openSubFilter()} showSearchIcon={false} showMenuIcon={true} location={false} subTitleParentLink={"/shop/essential"}>

                {/* <nav aria-label="Breadcrumb" style={{ marginTop: "10px" }}>   
  <ol>     
    <li>
      <button onClick={handleBack} style={{ border: 'none', background: 'none' }}>
        <ArrowBackIcon/>
      </button>
    </li>   
  </ol> 
</nav> */}
                <div className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? 'mb-5' : 'mb-0'}`}>
                    <Container>
                        <Row>
                            <Col sm={3} className="collection-filter" id="filter" style={openSideBarStatus ? { left: "0px" } : {}}>

                                <div className="collection-mobile-back" onClick={() => closeSidebar()}>
                                    <span className="filter-back">
                                        <i className="fa fa-angle-left" ></i> back
                                    </span>
                                </div>
                                {
                                    loading ?
                                        <ProductSkeleton skelotonType='productDetails-left-moreDetails' />
                                        :
                                        <>
                                            {console.log("class timeeeee isssss", productData.cancellationDay, "productData", productData)}
                                            <Service serviceType='essentials' discounts={discounts} cancellationDays={productData.cancellationDay} serviceDate={userSelectedDate} productReview={categoryStar[reviews?.overall_rate?.[0]]?.label} productReviewCount={reviews?.overall_rate?.[1]} suppplierDetails={suppplierDetails} viewCount={productData.triggers} addedDate={productData.created_at} startDate={productData.active_start_date} endDate={productData.active_end_date} showitem={showItem} height="510px" handleDiscountOnClaim={handleDiscountOnClaim} discountsMetaVal={discountsMetaVal} />
                                            <NewProduct sliderCount={categories.sliderCount} category1={"1"} vendor={categories.vendor_id} vandorName={categories.vandorName} p_ID={PID} />
                                        </>
                                }
                            </Col>
                            <Col lg="9" sm="12" xs="12">
                                <Container fluid={true} className="p-0">
                                    {
                                        loading ?
                                            <ProductSkeleton skelotonType='productDetails' />
                                            :
                                            <Row className="p-0 m-0 product-view-mobile" style={{ minHeight: '465px', maxHeight: "auto" }}>

                                                <Col lg="5" className="product-thumbnail p-0 m-0">
                                                    <Slider {...products} asNavFor={nav2} ref={(slider) => setSlider1(slider)} className="product-slick">
                                                        {pictures.split(',').map((vari, index) => (
                                                            <div key={index}>
                                                                <Media src={`${vari}`} alt='product  images' className="img-fluid product-main-image px-4" style={{ width: "98%", height: "465px", objectFit: 'cover' }} loading="lazy" />
                                                            </div>
                                                        ))}
                                                    </Slider>
                                                    {/* <div className='d-flex overflow-hidden w-100 m-0 p-0 gap-2 justify-content-center mt-lg-3'>
                                                        {pictures.split(',').length > 1 && pictures.split(',').map((vari, index) => (
                                                            <Media key={index} alt='product other images' src={`${vari}`} style={{ minHeight: '80px', maxHeight: '80px', minWidth: '80px', maxWidth: '80px', objectFit: 'cover' }} loading="lazy" />
                                                        ))}
                                                    </div> */}
                                                    {pictures.split(',').length > 1 && (
                                                        <div>
                                                            <Slider
                                                                asNavFor={slider1}
                                                                ref={(slider) => setSlider2(slider)}
                                                                slidesToShow={5}
                                                                swipeToSlide={true}
                                                                focusOnSelect={true}
                                                                className="mt-3"
                                                                infinite={false}
                                                            >
                                                                {pictures.split(',')
                                                                    ?.map((vari, index) => (
                                                                        <div key={index} className="px-1">
                                                                            <Media
                                                                                alt={`${dataset.productData.discount_data[0].listing_title
                                                                                    } - Thumbnail ${index + 1}`}
                                                                                src={`${vari}`}
                                                                                className="img-fluid"
                                                                                style={{
                                                                                    height: "80px",
                                                                                    width: "100%",
                                                                                    objectFit: "cover",
                                                                                    cursor: "pointer",
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

                                                    <div className='product-right d-flex flex-wrap justify-content-between' style={{ height: 'auto' }}>

                                                        <h1 className="col-12 text-start mb-1 product-name-main" style={{ textTransform: 'uppercase', fontWeight: '500' }}>{productData.listing_title} {productData && productData.seller_id && (
       // In EssentialProductView component, update the store icon onClick handler:

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
    if (!productData.seller_id) {
      return ToastMessage({ status: "error", message: "Vendor information not available" });
    }

    // 1. Fetch vendor details
    const vendorDetails = await getSuppliedDetails(productData.seller_id);

    console.log("Vendor Details:", vendorDetails);

    // 2. Extract vendor name
    const vendorName =
      vendorDetails.vendor_name ||
      vendorDetails.store_name ||
      vendorDetails.shop_name ||
      vendorDetails.company_name ||
      "Vendor";

    // 3. Redirect with category parameter
    router.push(
      `/vendor-products/${productData.seller_id}?vendorName=${encodeURIComponent(vendorName)}&category=essential`
    );
  }}
>
  <StoreIcon style={{ fontSize: 16, marginRight: 5 }} />
</div>
      )}</h1>
    
                                                        <div className="col-12 mb-2">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start" >Quantity</h6>
                                                                {maxminiQuantity.error && <span className="instock-cls">{maxminiQuantity.errorContent}</span>}
                                                            </div>
                                                            <div className="qty-box">
                                                                <div className="input-group d-flex align-items-center justify-content-start" style={{ width: 'fit-content' }}>
                                                                    <button type="button" className="quantity-left-minus border" onClick={handleDecrement} data-type="minus" data-field=""><i className="fa fa-angle-left"></i></button>
                                                                    <Input type="text" name="quantity" value={quantity} disabled style={{ backgroundColor: 'transparent', padding: '7.5px 0px' }} />
                                                                    <button type="button" className="quantity-right-plus border" onClick={handleIncrement} data-type="plus" data-field=""><i className="fa fa-angle-right"></i></button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {
                                                            variations.map((variation, index) => (
                                                                <div className="col-12 mb-2">
                                                                    <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start" >Choose your {variation}</h6>
                                                                    <div className="d-flex flex-wrap">
                                                                        {
                                                                            variantData[index].map((vari, i) => (
                                                                                <button key={i} onClick={() => handleOnChange(`variant${index + 1}`, vari[`variant_type${index + 1}`])} className={vari[`variant_type${index + 1}`] === selectedVariants[`variant${index + 1}`] ? 'button-selected-value variant-button' : 'button-static-value variant-button'} style={{ color: vari[`variant_type${index + 1}`] === selectedVariants[`variant${index + 1}`] ? 'white' : 'red' }}>{vari[`variant_type${index + 1}`]}</button>
                                                                            ))
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }

                                                        <div className="col-6 product-variant-head " style={{ width: '48%' }}>
                                                            <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start" >Preferred date</h6>
                                                            <DatePicker minDate={new Date(new Date().setDate(new Date().getDate() + Number(productData.time_to_delivery)))} onChange={onChangeDate} maxDate={new Date(productData.active_end_date)} value={router.query?.viewStatus === "update" && isSelectData === false ? new Date(router.query?.prefereedDate) : isSelectData ? userSelectedDate : null} clearIcon={false} className='form-control py-2' />
                                                        </div>

                                                        <div className="col-6 product-variant-head " style={{ width: '48%' }}>
                                                            <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start" >Delivery point</h6>

                                                            {
                                                                userStatus.userLoggesIn ?
                                                                    <Select options={addressTypesLoggedin} value={locationType ? addressTypesLoggedin.find(data => data.label === locationType) : null} onChange={handleSelectAddressType} /> :
                                                                    <Select options={addressTypes} value={locationType ? addressTypes.find(data => data.label === locationType) : null} onChange={handleSelectAddressType} />
                                                            }
                                                        </div>

                                                        {
                                                            locationType == "Saved location" &&
                                                            <div className="product-variant-head mt-2 col-12">
                                                                <div className="d-flex align-items-center m-0 gap-3">
                                                                    <h6 className="m-0 ellipsis-1-lines text-start" style={{ fontSize: 11, color: "gray" }}>Select an address</h6>
                                                                    <h6 className="m-0 ellipsis-1-lines text-end ms-auto" style={{ fontSize: 11, color: "gray" }} onClick={() => setSavedAddressModal(true)}>+ Add / Edit shipping Address</h6>
                                                                </div>
                                                                {console.log("locationTypeId isssss", locationTypeId, shippingAddresses)}
                                                                <Select options={shippingAddresses} onChange={handleChooseSavedLocation} getOptionLabel={(option) => option.label}

                                                                    getOptionValue={(option) => option.key} value={locationTypeId ? shippingAddresses.find(data => data.id === locationTypeId) : null} className="react__Select" />
                                                            </div>
                                                        }

                                                        {
                                                            locationType === "Custom location" &&
                                                            <div className="product-variant-head mt-2 col-12">
                                                                <h6 className="m-0 ellipsis-1-lines text-start" style={{ fontSize: 11, color: "gray" }}>Select an address</h6>
                                                                {/* <LoadScript
                                                                    googleMapsApiKey={groupApiCode}
                                                                    libraries={["places", "geometry"]}
                                                                    onLoadFailed={(error) => console.error("Could not inject Google script", error)}
                                                                > */}
                                                                <GooglePlacesAutocomplete apiKey={groupApiCode} onLoadFailed={(error) => (console.error("Could not inject Google script", error))} selectProps={{ value: googleLocation, placeholder: googleLocation, onChange: (e) => handleOnGoogleLocationChange(e) }} />
                                                                {/* </LoadScript> */}
                                                            </div>
                                                        }

                                                        <div className="my-2 mb-3 col-12">
                                                            <DeliveryComponent />
                                                        </div>

                                                        <div className="">
                                                            <h6 className="m-0 mb-1 ellipsis-1-lines " style={{ fontSize: 11, color: "gray" }}>Select your prefered payment method</h6>
                                                            <div className='d-flex align-items-center gap-2'>
                                                                {!loading && getPaymentOptions()}
                                                            </div>
                                                        </div>

                                                        <div className='col-12'>
                                                            <div className="d-flex align-items-center justify-content-end ms-auto gap-3 col-lg-6 col-6">
                                                                <h4 className="d-flex flex-column align-items-end">
                                                                    <p className="text-muted ml-2 float-right text-right" style={{ fontSize: 10, lineHeight: '20px', fontWeight: '600' }}>Price </p>
                                                                    {/* <h3 className="m-0 p-0">
                                                                        {CurrencyConverter(baseCurrencyValue.base, Number(CurrencyConverterOnlyRateWithoutDecimal(productData.currency, productPrice.mrp, baseCurrencyValue)) + Number(CurrencyConverterOnlyRateWithoutDecimal(deliveryData.currency, deliveryData.deliverCharge, baseCurrencyValue)), baseCurrencyValue)}
                                                                        {getDiscountProductBaseByPrice(CurrencyConverter(baseCurrencyValue.base, Number(CurrencyConverterOnlyRateWithoutDecimal(productData.currency, productPrice.mrp, baseCurrencyValue)) + Number(CurrencyConverterOnlyRateWithoutDecimal(deliveryData.currency, deliveryData.deliverCharge, baseCurrencyValue)), baseCurrencyValue),discounts?.[0],productData.currency, false )}
                                                                    </h3> */}
                                                                     <h5 className="m-0 p-0">
                                                                        <LocalShippingIcon style={{ fontSize: 16, marginRight: 5 }} />
                                                                        {
                                                                            (() => {
                                                                                const productAmount = Number(CurrencyConverterOnlyRateWithoutDecimal(productData.currency, productPrice.mrp, baseCurrencyValue));
                                                                                const deliveryAmount = Number(CurrencyConverterOnlyRateWithoutDecimal(deliveryData.currency, deliveryData.deliverCharge, baseCurrencyValue));

                                                                                const safeProductAmount = isNaN(productAmount) ? 0 : productAmount * quantity;
                                                                                const safeDeliveryAmount = isNaN(deliveryAmount) ? 0 : deliveryAmount;

                                                                                const totalAmount = safeDeliveryAmount;

                                                                                return CurrencyConverter(baseCurrencyValue.base, totalAmount, baseCurrencyValue);
                                                                            })()
                                                                        }
                                                                    </h5>
                                                                    <h3 className="m-0 p-0">
                                                                        {
                                                                            (() => {
                                                                                const productAmount = Number(CurrencyConverterOnlyRateWithoutDecimal(productData.currency, productPrice.mrp, baseCurrencyValue));
                                                                                const deliveryAmount = Number(CurrencyConverterOnlyRateWithoutDecimal(deliveryData.currency, deliveryData.deliverCharge, baseCurrencyValue));

                                                                                const safeProductAmount = isNaN(productAmount) ? 0 : productAmount * quantity;
                                                                                const safeDeliveryAmount = isNaN(deliveryAmount) ? 0 : deliveryAmount;

                                                                                const totalAmount = safeProductAmount;

                                                                                return CurrencyConverter(baseCurrencyValue.base, totalAmount, baseCurrencyValue);
                                                                            })()
                                                                        }
                                                                    </h3>

                                                                    <h3 className="m-0 p-0">
                                                                    </h3>
                                                                </h4>
                                                            </div>
                                                            <div className='d-flex flex-row align-items-center col-12 gap-3 justify-content-end'>
                                                                <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleAddToCartMain}>{cartStatus.status === 'update' ? 'Update cart' : 'Add to cart'}</Button>
                                                                <Button className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                                            </div>
                                                        </div>


                                                    </div>

                                                </Col>
                                            </Row>
                                    }
                                </Container>

                                {
                                    !loading &&
                                    <ProductTab height='410px' showDesc={true} name={productData.listing_title} desc={productData.listing_description} showProductDetails={true} productDetails={productData.sub_description} showReviews={true} reviews={reviews} showDeliveryPolicy={true} deliveryPolicy={productData.delivery_policy} showTermsndConditions={true} showndConditions={productData.terms_conditions} />
                                }

                            </Col>
                        </Row>
                    </Container>
                </div>

                <ModalBase isOpen={savedAddressModal} toggle={handleSaveAddress} title="Add Shipping Addresses" size='xl'>
                    <SavedAddressPage essentialsPage={true} handleSaveAddress={handleSaveAddress} productView={true} ></SavedAddressPage>
                </ModalBase>

                <ModalBase isOpen={showInstructions} toggle={handlesetShowInstructions} title="Allow Location Access" size='md'>
                    <div className="d-flex flex-column align-items-center text-center">
                        <p style={{ lineHeight: '20px' }}>We need your location to calculate delivery options. Please allow location access in your browser.</p>
                        <p style={{ lineHeight: '20px' }}>Please click on the padlock icon next to the URL in your browser's address bar, then go to "Site settings" and enable "Location".</p>
                    </div>
                </ModalBase>

                <ModalBase isOpen={showCartSection} toggle={() => setShowCartSection(!showCartSection)} title="Select Your Cart" size='md'>
                    <CartContainer handlePassData={handlePassData} productData={cartData} activePopup={true} cartCategory={"Essential"} />
                </ModalBase>

            </CommonLayout>
        </>
    );
};

export default EssentialProductView;