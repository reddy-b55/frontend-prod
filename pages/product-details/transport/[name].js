import moment from "moment";
import Head from "next/head";
import Slider from "react-slick";
import Select from 'react-select';
import { parseISO } from "date-fns";
import { useRouter } from "next/router";
import DatePicker from 'react-date-picker';
import { addDoc, collection } from "firebase/firestore";
import React, { useState, useEffect, useContext, use } from "react";
import { Container, Row, Col, Media, Button } from "reactstrap";

import { AppContext } from "../../_app";
import { db } from "../../../firebase";

import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import LifeStylePricing from "../../../GlobalFunctions/Lifestylefunctions/LifeStylePricing";
import { getDistanceFromLatLon, gettimeDifference, generateSlug } from "../../../GlobalFunctions/OthersGlobalfunctions";

import { checkAvalibilityandRates, getLifestyleproductDetails } from "../../../AxiosCalls/LifestyleServices/lifestyleServices";
import { getProductReiews } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";

import ProductTab from "../common/product-tab";
import Service from "../common/service";
import NewProduct from "../common/newProduct";

import PaxIncrementorComponent from "../../../components/common/PaxIncrementor/PaxIncrementorComponent";
import ModalBase from "../../../components/common/Modals/ModalBase";
import LifestylesPricing from "../../../components/common/PackageContainer/PackageContainerLifestyles";
import BuddyModal from "../../../components/common/TravelBuddies/BuddyModal";
import ToastMessage from "../../../components/Notification/ToastMessage";
import CartContainer from "../../../components/CartContainer/CartContainer";
import CommonLayout from "../../../components/shop/common-layout";
import timeView from '../../../public/assets/images/sidebar-svg-files/icons8-clock.svg';
import getDiscountProductBaseByPrice from "../common/GetDiscountProductBaseByPrice"

import ProductSkeleton from "../../skeleton/productSkeleton";

import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Image from "next/image";

const TransportDetails = () => {
    
    const router = useRouter();
    const { cart, slug, selectedVehicle } = router.query;
    const product = JSON.parse(cart);
    const vehicle = JSON.parse(selectedVehicle);
    const [openSideBarStatus, setopenSideBarStatus] = useState(false);
    const [loading, setLoading] = useState(false);
    const { userStatus, baseUserId, baseCurrencyValue, baseLocation } = useContext(AppContext);
    const [chatCreating, setChatCreating] = useState(false);
    const [travelBuddiesStatus, settravelBuddiesStatus] = useState(false);
     const [handlePopupStatus, setHandlePopupStatus] = useState({
        avalibilityChecking: false,
        customerDetails: false,
        addToCart: false,
      })
    const [adultDetails, setAdultDetails] = useState([]);
    const [childsDetails, setChildDetails] = useState([]);
    const [cartObject, setCartObject] = useState({});

    console.log("photo url" ,vehicle?.vehicle_with_price?.image)
    const canonicalURL = `https://www.aahaas.com/product-details/transport/${slug}`; 
    const pathId = product.search_id;

    useEffect(() => {
        // console.log("product & vehicle", product)
        // console.log("product & vehicle", vehicle)
        const updatedProduct = {
            ...product,
            vehicle_with_price: vehicle
          };
          console.log("updatedProduct", updatedProduct)
        setCartObject(product)
    }, []);

    const openSubFilter = () => {
        setopenSideBarStatus(true);
      }
      const closeSubFilter = () => {
        setopenSideBarStatus(false);
      }

      const handleTravelBuddiesModal = () => {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: true,
          addToCart: false,
        })
      }

      const handleTravelBuddies = (value) => {

        const ids = value.map(item => item.id).join(",");
        console.log("value",ids);

        let adults = value.filter((res) => { return res.PaxType == "1" })
        let childs = value.filter((res) => { return res.PaxType == "2" })
    
        
        setAdultDetails(adults);
        setChildDetails(childs);
        settravelBuddiesStatus(true);

        setCartObject({
            ...cartObject,
            travel_buddy_adult_ids: ids,
        });
        handleCloseAllPopup();
    
      }
      
      const handleCloseAllPopup = () => {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: false,
          addToCart: false,
        })
      }

      const handleAddToCart = () => {
        setHandlePopupStatus({
          avalibilityChecking: false,
          customerDetails: false,
          addToCart: true,
        })
      }
      

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
              chat_category: 7,
              chat_related_id: 7,
              chat_avatar: vehicle?.image,
              supplier_id: 7,
              chat_name: vehicle.vehicleName,
              comments: { category: 7, product: vehicle },
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
        console.log("value", value)
        // if (value === 'await') {
        //   ToastMessage({ status: "loading", message: 'Product addig into a cart click here to undo', autoClose: 5000 });
        //   handleCloseAllPopup();
        // } else {
        //   if (value == 'existing') {
        //     ToastMessage({ status: "warning", message: "Product already in cart" })
        //     handleCloseAllPopup();
        //   } else if (value) {
        //         // router.push('/page/account/cart-page');
        //         router.push('/shop/lifestyle');
        //   } else {
        //     ToastMessage({ status: "warning", message: "failed to add the product, please try again later.." })
        //     handleCloseAllPopup();
        //   }
        // }
      };
    

    return (
       <>
           <Head>
        <link rel="canonical" href={canonicalURL} as={canonicalURL} />
        <title>Aahaas - Transport | Unique Experiences with Aahaas in Sri Lanka</title>
        <meta name="description" content={`Discover transport and other fun activities in Sri Lanka! Explore recreational experiences, top tourist activities, and unforgettable adventures on Aahaas.`} />
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
                  "name": "Lifestyle",
                  "item": "https://www.aahaas.com/product-details/transport/"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Lifestyle",
                  "item": `https://www.aahaas.com/product-details/transport/${generateSlug(product?.vehicle_with_price?.vehicleName)}?pID=${pathId}`
                }
              ]
            }),
          }}
        />
      </Head>
       <CommonLayout parent="Home" title={'Transport'} subTitle={'product view'} openSubFilter={() => openSubFilter()} showSearchIcon={false} showMenuIcon={true}>
       <div className={`collection-wrapper p-sm-2 mt-lg-5 ${loading ? 'mb-5' : 'mb-0'}`}>
        <Container>
             <Row>
                {/* add  below code here */}

                     <Col lg="12" sm="12" xs="12">
                     <Container fluid={true} className="p-0">
                  {
                    loading ?
                      <ProductSkeleton skelotonType='productDetails' />
                      :
                      <Row className="p-0 m-0 product-view-mobile">

                        <Col lg="5" className="product-thumbnail p-0 m-0">
                          <Media src={`${vehicle?.image}`} alt='Recreational Activities in Sri Lanka' className="img-fluid product-main-image" style={{ width: "100%", height: '375px', objectFit: 'fit', borderRadius: "10px" }} loading="lazy" />
                        </Col>

                        <Col lg="7" className="rtl-text p-0 m-0 px-2 px-lg-4 pe-0">

                          <div className='product-right d-flex flex-wrap justify-content-between'>

                          <h1 className="col-12 text-start mb-1 product-name-main" style={{ textTransform: 'uppercase', fontWeight: '500' }}>{vehicle.vehicleName} </h1>
                            <p className='col-12 m-0 p-0 ellipsis-1-lines m-0 text-start mb-2' style={{ color: '#66b3ff', cursor: 'pointer', lineHeight: '20px', height: '20px' }}>{product?.km} kms to the destination</p>

                            <div className="col-12 m-0 product-variant-head product-variant-head-lifestyle mb-2">
                              {/* <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Choose your preferred location</h6>
                              <Select options={pickupLocations} value={pickupLocations.find(hotelRoomCategories => hotelRoomCategories.value === customerData.servicePoint)} onChange={handleServicePoint} /> */}
                            </div>

                            {/* <div className="col-6 m-0 product-variant-head mb-2" style={{ width: '48%' }}>
                              <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Choose your service date</h6>
                              <DatePicker value={customerData.date} filterDate={isAvailable} clearIcon={false} minDate={new Date(minDate)} maxDate={new Date(availableDates[availableDates.length - 1])} className='form-control py-2' onChange={(e) => handleOnDataChange(e, customerData.servicePoint, true, false, lifeStyleInventory, inventoryRates)} />
                            </div>

                            <div className="col-6 ml-auto product-variant-head mb-2" style={{ width: '48%' }}>
                              <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">Choose your time slot</h6>
                              <Select options={inventoryData} value={inventoryData.find(data => data.value === customerData.inventoryID)} onChange={handleSerciceTimeSlot} />
                            </div>

                            <div className="col-12">
                              <h6 style={{ fontSize: 11, color: "gray" }} className="m-0 ellipsis-1-lines text-start">{(maxChildAdultCounts?.AdultMax && maxChildAdultCounts.ChildMax) ? 'Adults & Children count' : maxChildAdultCounts.AdultMax ? 'Adult count' : maxChildAdultCounts.ChildMax ? 'Children count' : null}</h6>
                              <div className="form-control d-flex align-items-center mb-2 product-variant-head" style={{ padding: '10px 10px', fontSize: '14px' }} onClick={() => setshowCountBox(!showCountBox)}>
                                <p className="ml-2" style={{ color: 'black', fontSize: 14 }}>{maxChildAdultCounts?.AdultMax >0 > 0 && `${customerData.adultCount > 1 ? 'Adults : ' : 'Adult : '}` + customerData.adultCount}</p>
                                <p className="mx-1" style={{ color: 'black', fontSize: 14 }}>{" "}</p>
                                <p className="ml-2" style={{ color: 'black', fontSize: 14 }}>{maxChildAdultCounts?.ChildMax>0 > 0 && `${customerData.childCount > 1 ? 'Children : ' : 'Child : '}` + customerData.childCount}</p>
                                <KeyboardArrowDownIcon sx={{ marginLeft: 'auto', color: 'gray' }} />
                              </div>
                            </div> */}

                      
                                  <div className="d-flex flex-column m-0 p-0 align-items-end justify-content-center mt-3 col-12">

                                 


                                  
                                  <h3 className="m-0 p-0">{CurrencyConverter(vehicle?.unit, vehicle?.price,baseCurrencyValue)}</h3>
                       
                                    <div className="d-flex align-items-center">
                                      {/* <a onClick={getPackageData} className="btn-change-package mb-2" disabled={avalibilityLoading}>{avalibilityLoading ? 'Please wait' : 'Update Booking'}</a> */}
                                      {/* <span className="m-0 p-0 mb-2 mx-2">/</span> */}
                                      {/* <a onClick={handleMoreDetailsOpen} className="btn-change-package mb-2">Know more about packages</a> */}
                                      <a className="mb-2">price for 3</a>
                                    </div>
                                  </div>
                                  <div className='d-flex flex-row flex-wrap align-items-center col-12 gap-3 justify-content-center justify-content-lg-end'>
                                    <Button className="btn btn-sm btn-solid col-lg-5 col-12" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleTravelBuddiesModal}>{travelBuddiesStatus ? 'Edit travel buddies' : 'Add travel buddies'} </Button>
                                    {cartObject.travel_buddy_adult_ids != '' && <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }}  onClick={handleAddToCart} >Add To Cart</Button>}
                                    {/* <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleValidateForm}>{cartStatus.status === 'update' ? 'Update cart' : 'Add to cart'}</Button> */}
                                    <Button className="btn btn-sm btn-solid col-lg-3 col-5" style={{ fontSize: 12, padding: '10px 15px', borderRadius: '4px' }} onClick={handleChatInitiate}>{chatCreating ? 'Initiating a chat' : 'Chat now'}</Button>
                                  </div>
                             

                          </div>
                        </Col>

                    </Row>


                  }
                  
                  {
                    !loading && <ProductTab type='lifestyle'showDesc={true} name={vehicle.vehicleName} desc={vehicle.description} showReviews={false}  />
                 }
                </Container>
                     </Col>
             

             </Row>
        </Container>
       </div>

        <ModalBase isOpen={handlePopupStatus.customerDetails} toggle={handleCloseAllPopup} title="Choose Your Buddies" size='md'>
                 {/* <BuddyModal adultCount={customerData.adultCount} childCount={customerData.childCount} adultDetails={adultDetails} childsDetails={childsDetails} childAges={customerData.childAges} handleTravelBuddies={handleTravelBuddies}></BuddyModal> */}
                   <BuddyModal transportCount={vehicle.passengeCount} adultCount={vehicle.passengeCount} childCount={0} adultDetails={adultDetails} childsDetails={childsDetails} childAges={[]} handleTravelBuddies={handleTravelBuddies} providerlife={"bridgify"}></BuddyModal>
        </ModalBase>
        <ModalBase isOpen={handlePopupStatus.addToCart} toggle={handleCloseAllPopup} title="Select Your Cart" size='md'>
          <CartContainer handlePassData={handlePassData} productData={cartObject} cartCategory={"transport"} />
        </ModalBase>
       </CommonLayout>
       </>
    );
};

export default TransportDetails;





    // <Col sm="3" className="collection-filter" id="filter" style={openSideBarStatus ? { left: "0px" } : {}}>
    //                 <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
    //               <span className="filter-back">
    //                 <i className="fa fa-angle-left" ></i> back
    //               </span>
    //             </div>
    //             {
    //               loading ?
    //                 <ProductSkeleton skelotonType='productDetails-left-moreDetails' />
    //                 :
    //                 <>
    //                   {/* <Service serviceType='lifestyle' discounts={discounts} serviceDate={customerData.date} cancellationDays={inventoryRates?.[0]?.cancellation_days} bookingDeadline={inventoryRates[0].book_by_days} latitude={latitudelongtitude?.latitude} longitude={latitudelongtitude?.longitude} locationName={customerData?.servicePoint} productReview={categoryStar[reviews?.overall_rate?.[0]]?.label} productReviewCount={reviews?.overall_rate?.[1]} serviceLocations={pickupLocations} showitem={['proDiscounts', 'cancellationDays', 'deadline', 'mapView', 'reviewStar', 'avalibleLocations']} height="360px" handleDiscountOnClaim={handleDiscountOnClaim} /> */}
    //                   {/* <Service
    //                     serviceType="lifestyle"
    //                     discounts={discounts}
    //                     serviceDate={customerData.date}
    //                     cancellationDays={inventoryRates?.[0]?.cancellation_days}
    //                     bookingDeadline={inventoryRates?.[0]?.book_by_days}
    //                     latitude={latitudelongtitude?.latitude}
    //                     longitude={latitudelongtitude?.longitude}
    //                     locationName={customerData?.servicePoint}
    //                     productReview={
    //                       reviews?.overall_rate?.[0]
    //                         ? categoryStar[
    //                           reviews?.overall_rate?.[0] % 1 >= 0.5
    //                             ? Math.ceil(reviews?.overall_rate?.[0])
    //                             : Math.floor(reviews?.overall_rate?.[0])
    //                         ]?.label
    //                         : null
    //                     }
    //                     productReviewCount={reviews?.overall_rate?.[1]}
    //                     serviceLocations={pickupLocations}
    //                     showitem={[
    //                       "proDiscounts",
    //                       "cancellationDays",
    //                       // "deadline",
    //                       "mapView",
    //                       "reviewStar",
    //                       "avalibleLocations",
    //                     ]}
    //                     height="360px"
    //                     handleDiscountOnClaim={handleDiscountOnClaim}
    //                     discountsMetaVal={discountsMetaVal}
    //                   /> */}
    //                 </>
    //             }
    //                 </Col>