import moment from "moment";
import React, { useEffect, useState } from "react";
import ModalBase from "../../../components/common/Modals/ModalBase";

import mapview from '../../../public/assets/images/sidebar-svg-files/mapview.svg';
import Cancellation from '../../../public/assets/images/sidebar-svg-files/cancellation.svg';
import startcategory from '../../../public/assets/images/sidebar-svg-files/hotelcategory.svg';
import cashodelivery from '../../../public/assets/images/sidebar-svg-files/cashondelivery.svg';
import onlinepayment from '../../../public/assets/images/sidebar-svg-files/onlincepayment.svg';
import classschedule from '../../../public/assets/images/sidebar-svg-files/calendar.svg';
import lastCourseDate from '../../../public/assets/images/sidebar-svg-files/history.svg';
import grouptype from '../../../public/assets/images/sidebar-svg-files/link.svg';
import classmode from '../../../public/assets/images/sidebar-svg-files/webinar.svg';
import sessiontype from '../../../public/assets/images/sidebar-svg-files/management.svg';
import tripAdvisor from '../../../public/assets/images/sidebar-svg-files/tripAdvisor.svg';
import Discount from '../../../public/assets/images/sidebar-svg-files/discount.svg';
import reviews from '../../../public/assets/images/sidebar-svg-files/reviews.svg';
import serviceLocation from '../../../public/assets/images/sidebar-svg-files/serviceLocation.svg';
import brand from '../../../public/assets/images/sidebar-svg-files/brand.svg';
import supplier from '../../../public/assets/images/sidebar-svg-files/supplier-image.svg';
import addToCart from '../../../public/assets/images/sidebar-svg-files/add-to-cart.svg';

import GetDescription from "../../../GlobalFunctions/Others/GetDescription.";

import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ToastMessage from "../../../components/Notification/ToastMessage";

const Service = ({
  serviceType,
  classSchedule = [], cancellationDays, bookingDeadline, serviceDate, latitude, longitude, showitem, hotelCategory, locationName,
  productReview, productReviewCount, grptype, courseMode, serviceLocations, courseMedium, session, openingHours, lastCouurseDate,
  tripAdvisorLink, suppplierDetails,
  viewCount, startDate,
  height = "420px",
  discounts, handleDiscountOnClaim, discountsMetaVal
}) => {

  console.log("class timeeeee isssss",serviceDate)

  let bookingDeadlineDate = new Date(serviceDate);
  bookingDeadlineDate.setDate(bookingDeadlineDate.getDate() - bookingDeadline - 1);
  console.log("class timeeeee isssss",bookingDeadlineDate)
  let cancellationDate = new Date(serviceDate);
  cancellationDate.setDate(cancellationDate.getDate() - cancellationDays);

  const [moreDetailsModal, setMoreDetailsModel] = useState({
    status: false,
    title: '',
    content: ''
  });

  const handleOpenMoreDetails = (title, content) => {
    setMoreDetailsModel({
      status: true,
      title: title,
      content: content
    })
  }

  const handleCloseMoreDetails = () => {
    setMoreDetailsModel({
      status: false,
      title: '',
      content: ''
    })
  }
console.log("Service Date:", moment(serviceDate).format("DD-MM-YYYY"));
console.log("Cancellation Days:", cancellationDays);
console.log(
  "Cancellation Deadline:",
  moment(serviceDate).subtract(cancellationDays, "days").format("DD-MM-YYYY")
);
const calculatedCancellationDate = moment(serviceDate)
  .subtract(cancellationDays, "days")
  .format("DD-MM-YYYY");

  const handleUpdateOfferClaim = (value) => {
    console.log("value", value)
    ToastMessage({ status: "success", message: 'Offer Claimed successfully' })
    handleDiscountOnClaim(value);
    handleCloseMoreDetails();
  }

  const HandleCheck = () => {
    console.log("discounts", serviceType)
    discounts.map((value, key) => (
      console.log("valueee", value.discount_type)
    ))
    return (
      discounts.map((value, key) => (
        <div key={key}>
          {
            // (serviceType === 'lifestyle') || (serviceType === 'Hotel') || (serviceType === 'Education') || (serviceType === 'essentials' && Number(value?.discounted_category_id) === 1) || (serviceType === 'nonessentials' && Number(value?.discounted_category_id) === 2) ?
            (serviceType === 'lifestyle') || (serviceType === 'Hotel') || (serviceType === 'Education') || (serviceType === 'essentials' ) || (serviceType === 'nonessentials') ?
              <div className="border rounded-3 py-2 px-3 mb-3">
                <h6 className="text-start" style={{ textTransform: 'capitalize', fontWeight: '600' }}>{value?.discount_tag_line}</h6>
                <div className="d-flex align-items-start gap-1 offer-timeline py-2 px-3">
                  <EventRepeatIcon sx={{ fontSize: '18px' }} />
                  <p className="m-0 p-0 py-1 px-2">Valid until : <b className="ms-1">{value?.discount_end_date}</b></p>
                  <p className="m-0 p-0 ms-auto py-1 px-2 rounded-3">Limited time</p>
                </div>
                <div className="d-flex align-items-center m-0 p-0 my-3 offer-more-details py-2">
                  <div className="offer-more-details-label">
                    <LocalOfferIcon />
                  </div>
                  {
                    value?.discount_type === "value" ? (
                        <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                    <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                      <h6 className="m-0 p-0 text-start">{value?.elegibleLabel}</h6>
                    </div>
                  </div>
                    ):value?.discount_type === "precentage" ? (
                      <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                    <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                      <h6 className="m-0 </div>p-0 text-start">{value?.amount}% have off this Product</h6>
                    </div>
                  </div>
                    ): (
                      <div className="d-flex align-items-center m-0 p-0 offer-more-details-main ps-3">
                      {/* <img src={value?.additional_data?.image} style={{ width: '60px', height: '60px' }} className="m-0 p-0" /> */}
                      <img src={value?.additional_data?.image?.split(',')[0]} style={{ width: '60px', height: '60px' }} className="m-0 p-0"/>
                      <div className="d-flex flex-column align-items-start m-0 p-0 p-0 ps-3">
                        <h6 className="ellipsis-1-lines m-0 p-0 text-start">{value?.additional_data?.title}</h6>
                        <p className="ellipsis-2-lines m-0 p-0 text-start">{value?.additional_data?.desc}</p>
                      </div>
                    </div>
                    )
                  }
                
                </div>
                { value?.discount_type === "value"  || value?.discount_type === "precentage"? (
                  null
            ): (discountsMetaVal?.id ? (
              <button disabled className="btn col-12 btn-solid m-0 p-0 px-2 py-1 rounded-2" style={{ fontSize: 10, backgroundColor: '#ccc', cursor: 'not-allowed' }}>
                Offer Claimed
              </button>
              ) : (
              <button onClick={() => handleUpdateOfferClaim(value)} className="btn col-12 btn-solid m-0 p-0 px-2 py-1 rounded-2" style={{ fontSize: 10 }}>
                Click to claim <ArrowRightAltIcon />
              </button>
              ) )
          }
              </div> : null
          }
        </div>
      ))
    )
  }

  const Data = [

    // global service
    
    {
      name: 'proDiscounts',
      link: Discount,
      title: 'Exclusive offer',
      service: (
        <>
          {discounts?.length > 0 ? (
            <>
              Offer is available
              <button
                style={{
                  color: 'blue',
                  background: 'none',
                  border: 'none',
                  padding: '0',
                  cursor: 'pointer',
                  marginLeft: '5px',
                  fontSize: 10,
                  fontWeight: 600
                }}
                onClick={() => {
                  handleOpenMoreDetails(
                    'Exclusive offer',
                    <HandleCheck />
                  );
                }}
              >
                Click here to view.
              </button>
            </>
          ) : (
            <>No offers available</>
          )}
        </>
      )
    },
    

    {
      name: 'mapView',
      link: mapview,
      title: locationName,
      service: "Click here to get the location",
    },

    {
      name: 'reviewStar',
      link: reviews,
      title: 'Product reviews',
      service: productReviewCount === 0 ? 'No reviews yet' : productReviewCount === undefined ? 'No reviews yet' : `${productReview} by ${productReviewCount}`,
    },

    {
      name: 'cancellationDays',
      link: Cancellation,
      title: "Cancellation days",
      service: (
        <>
          {/* {`(${moment(cancellationDate).format('DD-MM-YYYY')}) ${cancellationDays} days before service date`} */}
          {`${cancellationDays} days before service date`}
          <button style={{ color: 'blue', background: 'none', border: 'none', padding: '0', cursor: 'pointer', marginLeft: '5px', fontSize: 10, fontWeight: 600 }} onClick={() => {
            handleOpenMoreDetails(
              'Product cancellation',
              // `As your service date is ${moment(serviceDate).format('DD-MM-YYYY')}, please note that if you wish to cancel the service, the cancellation policy will apply only if you cancel before ${moment(cancellationDate).format('DD-MM-YYYY')}. </br ></br > Thank you for your attention to this matter.`
             
              serviceType === "Education" || serviceType === "essentials" || serviceType === "nonessentials"
 ? `As your service date is ${moment(serviceDate).format('DD-MM-YYYY')}, please note that if you wish to cancel the service, the cancellation policy will apply only if you cancel before ${calculatedCancellationDate}.`
 : `As your service date is ${moment(serviceDate).format('DD-MM-YYYY')}, please note that if you wish to cancel the service, the cancellation policy will apply only if you cancel before ${calculatedCancellationDate}.`

            )
          }}>Learn more.</button>
        </>
      ),
    },

    // lifestyle service

    {
      name: 'deadline',
      link: sessiontype,
      // title: "Booking deadline",
      title: "Cancellation deadline",
      service:
        (
          <>
            {`(${moment(bookingDeadlineDate).format('DD-MM-YYYY')})`}
            {/* <button style={{ color: 'blue', background: 'none', border: 'none', padding: '0', cursor: 'pointer', marginLeft: '5px', fontSize: 10, fontWeight: 600 }} onClick={() => {
              handleOpenMoreDetails(
                'Booking deadline',
                `As your service date is ${moment(serviceDate).format('DD-MM-YYYY')}, we kindly request that you place your order by ${moment(bookingDeadlineDate).format('DD-MM-YYYY')} to help us avoid any out - of - stock issues. </br ></br > Thank you for your understanding and cooperation.`
              )
            }}>Learn more.</button> */}
          </>
        )
    },

    // {
    //   name: 'avalibleLocations',
    //   link: serviceLocation,
    //   title: "Our Service Locations",
    //   service: serviceLocations?.map(location => location.value).join(", "),
    // },

    // education details
    {
      name: 'classSchedule',
      link: classschedule,
      title: "Class schedule",
      service:
        (
          <>
            {`${classSchedule?.map(value => value.end_date).join(",")} `}
           {
            classSchedule.length > 0 && <button style={{ color: 'blue', background: 'none', border: 'none', padding: '0', cursor: 'pointer', marginLeft: '5px', fontSize: 10, fontWeight: 600 }} onClick={() => {
              handleOpenMoreDetails(
                'Class Schedule',
                <>
                  {
                    classSchedule.map((value, key) => (
                      <div className="form-control d-flex justify-content-between border" key={key}>
                        <p className="m-0 py-2 px-3">{key + 1}</p>
                        <p className="m-0 py-2 px-3">{value.start_date}</p>
                        <p className="m-0 py-2 px-3">{value.start_time}</p>
                        <p className="m-0 py-2 px-3">{value.end_time}</p>
                      </div>
                    ))
                  }
                </>
              )
            }}>
              
              Learn more.
              </button>
           } 
          </>
        )
    },

    {
      name: 'courseMode',
      link: classmode,
      title: "Class mode",
      service: (
        <>
          {`${courseMode === 'Live' ? courseMode : 'Face to face'} - ${session} `}
          {
            courseMode !== 'F2F' &&
            <button style={{ color: 'blue', background: 'none', border: 'none', padding: '0', cursor: 'pointer', marginLeft: '5px', fontSize: 10, fontWeight: 600 }} onClick={() => {
              handleOpenMoreDetails(
                'Course mode details',
                'This course will be conducted live, and you will receive a Zoom meeting link to join the session. You can attend the educational class online from the comfort of your own location, allowing you the flexibility to participate from anywhere. Please ensure you have a stable internet connection for the best experience. We look forward to your participation!'
              )
            }}>Learn more.</button>
          }
        </>
      )
    },

    {
      name: 'groupType',
      link: grouptype,
      title: 'Group type',
      service: grptype + " - " + courseMedium,
    },

    // {
    //   name: 'lastCourseDate',
    //   link: lastCourseDate,
    //   title: "Last course date",
    //   service: moment(lastCouurseDate).format('DD-MM-YYYY'),
    // },

    {
      name: 'openingHours',
      link: classschedule,
      title: "Opening hours",
      service: openingHours?.[0] + " - " + openingHours?.[1],
    },

    // hotels details

    {
      name: 'hotelCategory',
      link: startcategory,
      title: "Hotel category",
      service: hotelCategory,
    },

    // {
    //   name: 'tripAdvisor',
    //   link: tripAdvisor,
    //   title: "Trip Advisor",
    //   service: "View more for more details",
    // },


    // essential / non essential data

    {
      name: 'cashOnDelivery',
      link: cashodelivery,
      title: "Payment options",
      service: "Cash on delivery is available for this product",
    },

    {
      name: 'onlinePayment',
      link: onlinepayment,
      title: "Payment options",
      service: "Online payment is available for this product",
    },

    {
      name: 'brandDetails',
      link: brand,
      title: "Brand",
      service: suppplierDetails?.company_name,
    },

    // {
    //   name: 'createdTime',
    //   link: supplier,
    //   title: "Date added",
    //   service: `Date added since ${startDate} `,
    // },

    {
      name: 'triggerCount',
      link: addToCart,
      title: "About product",
      service: `${viewCount} peoples has been intrested on this product`,
    },

  ];

  const handleClick = (title) => {
    if (title === locationName) {
      window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank')
    } else if (title === 'Trip Advisor') {
      window.open(tripAdvisorLink, '_blank');
    }
  }

  return (

    <div className="collection-filter-block mb-3 sidebar-service py-2 px-4" style={{ height: height, borderRadius: '10px' }}>

      <div className="p-0">
      {
          Data.map((data, index) => (
            showitem.includes(data.name) && (
              data.name === 'tripAdvisor' && tripAdvisorLink === null ? null : (
                <div key={index} className='d-flex gap-3 align-items-center my-3' onClick={() => handleClick(data.title)} style={{ cursor: (data.name === 'mapView' || data.name === 'tripAdvisor') ? 'pointer' : 'default' }}>
                  <img alt="svg image service" src={data.link.src} style={{ height: '35px' }} />
                  <div className="d-flex flex-column gap-1">
                    <p className="m-0 p-0 ellipsis-1-lines"  title={data.title} style={{ fontWeight: '500', color: 'black', lineHeight: '16px', fontSize: '14px' }}>{data.title}</p>
                    <p className="m-0 p-0 ellipsis-2-lines" style={{ fontSize: "12px", lineHeight: '16px' }}>{data.service}</p>
                  </div>
                </div>
              )
            )
          ))
        }
        {/* {
          Data.map((data, index) => (
            showitem.includes(data.name) &&
            <div key={index} className='d-flex gap-3 align-items-center my-3' onClick={() => handleClick(data.title)} style={{ cursor: (data.name === 'mapView' || data.name === 'tripAdvisor') ? 'pointer' : 'default' }}>
              <img alt="svg image service" src={data.link.src} style={{ height: '35px' }} />
              <div className="d-flex flex-column gap-1">
                <p className="m-0 p-0 ellipsis-1-lines" style={{ fontWeight: '500', color: 'black', lineHeight: '16px', fontSize: '14px' }}>{data.title}</p>
                <p className="m-0 p-0 ellipsis-2-lines" style={{ fontSize: "12px", lineHeight: '16px' }}>{data.service}</p>
              </div>
            </div>
          ))
        } */}
      </div>

      <ModalBase title={moreDetailsModal.title} isOpen={moreDetailsModal.status} toggle={() => handleCloseMoreDetails()}>
        <h6 className="text-center">{moreDetailsModal.title === 'Class Schedule' ? moreDetailsModal.content : moreDetailsModal.title === "Exclusive offer" ? moreDetailsModal.content : GetDescription(moreDetailsModal.content)}</h6>
      </ModalBase>

    </div>

  );
};

export default Service;
