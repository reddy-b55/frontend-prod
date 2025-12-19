import React from 'react'
import GetDescription from '../../../GlobalFunctions/Others/GetDescription.';
import { Media } from 'reactstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';

function ProductInfoModal({ productImage, title, description, toggle, redirect, product, productstype }) {
    console.log("ProductInfoModal", productImage);
    return (
        <div className='m-3 d-flex flex-column flex-lg-row align-items-stretch gap-3 py-3 pe-3' style={{ borderRadius: '12px!important' }}>

            <div className="quick-view-img col-12 col-lg-5">
                {/* <Media src={`${productImage.split(',')[0]}`} alt="product pircture info" className="img-fluid m-auto rounded-1 proinfo-image" /> */}

                {
                    productstype === 'hotels' &&
                    <Media
                        src={
                            productImage.split(',')[0].length > 0
                                ? productImage.split(',')[0]
                                : 'https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png'
                        }
                        alt="product picture info"
                        className="img-fluid m-auto rounded-1 proinfo-image"
                    />
                }

                {
                    productstype === 'lifestyle' &&
                    // <Media
                    //     src={
                    //         productImage.split(',')[0].length > 0
                    //             ? productImage.split(',')[0]
                    //             : 'https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png'
                    //     }
                    //     alt="product picture info"
                    //     className="img-fluid m-auto rounded-1 proinfo-image"
                    // />
                     <LazyLoadImage 
                      onError={(error) => {
                        error.target.src = "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg";
                      }} 
                      src={productImage ? productImage : `https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg`} 
                      className={`img-fluid m-auto rounded-1 proinfo-image`} 
                      alt="product-image" 
                      loading="eager" 
                      style={{ 
                        width: 'auto', 
                        minWidth: '100%', 
                        maxWidth: '100%', 
                        minHeight: '300px', 
                        maxHeight: '300px', 
                        objectFit: 'cover', 
                        borderRadius: "12px" 
                      }} 
                    />
                }

                {
                    productstype !== 'transport' && productstype !== 'hotels' && productstype !== 'lifestyle' &&
                    <Media
                        src={
                            productImage.split(',')[0].length > 0
                                ? productImage.split(',')[0]
                                : 'https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png'
                        }
                        alt="product picture info"
                        className="img-fluid m-auto rounded-1 proinfo-image"
                    />
                }


            </div>

            <div className="product-right col-12 col-lg-7 d-flex flex-column px-3">

                <h5 className='ellipsis-2-lines' style={{ fontWeight: 700 }}>{title}</h5>

                <div className="border-product">
                    <h6 className="product-title" style={{ fontSize: 12 }}>product details</h6>
                    <p className='ellipsis-7-lines' style={{ fontSize: 11 }}>{GetDescription(description)}</p>
                </div>
                {/* {
                    product?.category_1 === 3 &&
                    <div className="border-product">
                        <h6 className="product-title" style={{ fontSize: 12 }}>Booking Deadline :   {new Date().toLocaleDateString()}</h6>
                        <h6 className="product-title" style={{ fontSize: 12 }}>Cancellation Deadline :  <p>Cancellation will be applied before {product?.cancellation_days} day(s) from your booking</p></h6>
                    </div>
                } */}

                <div className='d-flex align-items-center justify-content-center justify-content-lg-end gap-2 mt-auto'>
                    <button className='btn btn-sm btn-solid px-3 py-1' style={{ fontSize: 12 }} onClick={toggle}>Close</button>
                    <button className='btn btn-sm btn-solid px-3 py-1' style={{ fontSize: 12 }} onClick={redirect}>Know more</button>
                </div>
            </div>

        </div>
    )
}

export default ProductInfoModal