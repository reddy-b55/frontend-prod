import { useRouter } from "next/router";
import { Button, Col, Media, Modal, Row } from "reactstrap";
import React, { useContext, useEffect, useState, useRef } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Cookies from 'js-cookie';
import { AppContext } from "../../../pages/_app";

import { Rating } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';

import getStar from "./getStar";
import ProductInfoModal from "./ProductInfoModal";

import cod from '../../../public/assets/images/Ess-NonessImages/cashondel.png';
import online from '../../../public/assets/images/Ess-NonessImages/payonline.png';

import CurrencyConverterOnlyRate from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRate";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { generateSlug } from "../../../GlobalFunctions/OthersGlobalfunctions";
import VehicleCard from "../../../components/common/product-box/VehicleCard";
import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
const PLACEHOLDER_IMAGES = {
  hotel: 'https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png',
  lifestyle: 'https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/images/friends-tourists-suitcases-travel-bags-arrive_1322553-60859.jpg',
  general: 'https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png',
  vehicle: '/assets/images/vehicle-placeholder.jpg',
};
const ProductItem = ({ product, productImage, cartClass, title, productcurrency, provider, hotelCode, adultRate, childRate, rating, description, productstype, mrp, hotelSearchCustomerData, hotelAddress, packageRate, related = false, vendorRelated = false, cart = null }) => {

  const router = useRouter();
  const { baseCurrencyValue } = useContext(AppContext)
  
  const [modal, setModal] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  const toggle = () => {
    setModal(!modal);
  };
  const [actualImages, setActualImages] = useState([]);

const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageTimeoutRef = useRef(null);
  const getPlaceholderImage = (type) => {
    switch(type) {
      case 'hotels': return PLACEHOLDER_IMAGES.hotel;
      case 'lifestyle': return PLACEHOLDER_IMAGES.lifestyle;
      case 'transport': return PLACEHOLDER_IMAGES.vehicle;
      default: return PLACEHOLDER_IMAGES.general;
    }
  };
 const handleImageLoad = () => {
    setIsImageLoaded(true);
    setImageError(false);
    if (imageTimeoutRef.current) {
      clearTimeout(imageTimeoutRef.current);
    }
  };
 const handleImageError = (e) => {
    console.log(`Image failed to load: ${e.target.src}`);
    setImageError(true);
    setIsImageLoaded(false);
    
    // Set fallback image
    const fallbackImage = getPlaceholderImage(productstype);
    if (e.target.src !== fallbackImage) {
      e.target.src = fallbackImage;
      e.target.onerror = null; // Prevent infinite loop
    }
  };
   const getProcessedImages = () => {
    if (!productImage) {
      return [getPlaceholderImage(productstype)];
    }

    try {
      // For lifestyle products that might have a single image string
      if (productstype === 'lifestyle' && typeof productImage === 'string' && !productImage.includes(',')) {
        return [productImage.trim()];
      }
      
      // For other products, split by comma if it's a comma-separated string
      if (typeof productImage === 'string') {
        const images = productImage.split(',')
          .map(img => img.trim())
          .filter(img => img !== '');
        
        // If no valid images, return placeholder
        if (images.length === 0) {
          return [getPlaceholderImage(productstype)];
        }
        
        // Ensure images have proper protocol
        return images.map(img => {
          if (img.startsWith('//')) {
            return `https:${img}`;
          }
          if (!img.startsWith('http')) {
            return `https://${img}`;
          }
          return img;
        });
      }
      
      return [getPlaceholderImage(productstype)];
    } catch (error) {
      console.error('Error processing images:', error);
      return [getPlaceholderImage(productstype)];
    }
  };
useEffect(() => {
  const processedImages = getProcessedImages();
  setActualImages(processedImages);
  
  // Always start with placeholder
  setCurrentImage(getPlaceholderImage(productstype));
  
  // Preload the actual image in the background
  if (processedImages.length > 0) {
    const img = new Image();
    img.src = processedImages[0];
    img.onload = () => {
      // When actual image loads, update currentImage
      setCurrentImage(processedImages[0]);
      setIsImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      console.log('Failed to load image:', processedImages[0]);
      setImageError(true);
      // Keep placeholder if image fails
      setCurrentImage(getPlaceholderImage(productstype));
    };
  }

  return () => {
    if (imageTimeoutRef.current) {
      clearTimeout(imageTimeoutRef.current);
    }
  };
}, [productImage, productstype]);
// Update the image animation useEffect
useEffect(() => {
  if (actualImages.length > 1 && isImageLoaded) {
    let i = 1;
    let intervalId = setInterval(() => {
      // Only update the current image, don't render nextImage
      setCurrentImage(actualImages[i]);
      i = (i + 1) % actualImages.length;
    }, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }
}, [actualImages, isImageLoaded]);
useEffect(() => {
  if (modal) {
    const currentScrollPosition = window.pageYOffset;
    setScrollPosition(currentScrollPosition);

    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden'; // just disable scroll
  } else {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    window.scrollTo(0, scrollPosition);
  }

  return () => {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  };
}, [modal]);


  // Separate handler for info button
  const handleInfoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!modal) {
      setScrollPosition(window.pageYOffset);
    }
    setModal(true);
  };

  let vehicle;


  const manageZetexaData = (product) => {
    // console.log(product, "Stored data in local storage", product?.provider_type);  
    if (product?.provider_type === 'zetexa') {
      localStorage.setItem('bigDataset', JSON.stringify(product));

      let stored = localStorage.getItem('bigDataset');
      // console.log(stored, "Stored data in local storage");  
    }
  }


    const openInNewWindow = (pathname, query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.open(url, '_blank');
  };
// In ProductItem.js, update the isProductFree function to check provider:
const isProductFree = (product, productstype) => {
  if (!product) return false;
  
  // Check if product is from Aahaas provider
  const isAahaasProvider = product.provider === "aahaas";
  if (!isAahaasProvider) return false;
  
  const getSafePrice = (item, type) => {
    if (!item) return 0;
    
    const safeNumber = (value) => {
      if (value === null || value === undefined) return 0;
      const num = Number(value);
      return isNaN(num) ? 0 : num;
    };
    
    const isValidPrice = (value) => {
      const num = safeNumber(value);
      return num > 0;
    };
    
    // Different price fields for different product types
    switch (type) {
      case 'hotels':
        // Hotels use mrp or TotalRate
        if (isValidPrice(item.mrp)) {
          return safeNumber(item.mrp);
        }
        if (isValidPrice(item.TotalRate)) {
          return safeNumber(item.TotalRate);
        }
        if (isValidPrice(item.SupplierPrice)) {
          return safeNumber(item.SupplierPrice);
        }
        break;
        
      case 'lifestyle':
        // Lifestyle products use adult_rate, package_rate, etc.
        if (item.provider === "bridgify" && isValidPrice(item.default_rate)) {
          return safeNumber(item.default_rate);
        }
        if (isValidPrice(item.adult_rate)) {
          return safeNumber(item.adult_rate);
        }
        if (isValidPrice(item.package_rate)) {
          return safeNumber(item.package_rate);
        }
        if (isValidPrice(item.default_rate)) {
          return safeNumber(item.default_rate);
        }
        if (isValidPrice(item.child_rate)) {
          return safeNumber(item.child_rate);
        }
        break;
        
      case 'essential':
      case 'nonessential':
        // Essential/Non-essential use mrp
        if (isValidPrice(item.mrp)) {
          return safeNumber(item.mrp);
        }
        break;
        
      case 'education':
        // Education uses adult_rate, child_rate
        if (isValidPrice(item.adult_rate)) {
          return safeNumber(item.adult_rate);
        }
        if (isValidPrice(item.child_rate)) {
          return safeNumber(item.child_rate);
        }
        break;
        
      case 'transport':
        // Transport uses price
        if (isValidPrice(item.price)) {
          return safeNumber(item.price);
        }
        break;
        
      default:
        // Default fallback - check common price fields
        if (isValidPrice(item.mrp)) {
          return safeNumber(item.mrp);
        }
        if (isValidPrice(item.price)) {
          return safeNumber(item.price);
        }
        if (isValidPrice(item.TotalRate)) {
          return safeNumber(item.TotalRate);
        }
        break;
    }

    return 0;
  };

  const price = getSafePrice(product, productstype);
  return price === 0;
};
  // const clickProductDetail = () => {
  //   if (productstype === 'lifestyle') {
  //     var productProvider = product?.provider
  //     if (productProvider === "globaltix") {
  //       router.push({
  //         pathname: `/product-details/lifestyle/v3/${generateSlug(title)}`,
  //         query: {
  //           pID: product.lifestyle_id,
  //           viewStatus: 'checkavalibility',
  //           productImage: productImage,
  //         }
  //       });
  //     } else if (productProvider === "zetexa") {
        
  //       manageZetexaData(product);
  //       router.push({
  //         pathname: `/product-details/lifestyle/v5/${generateSlug(title)}`,
  //         query: {
  //           pID: product.id,
  //           viewStatus: 'checkavalibility'
  //         }
  //       });
  //     } else if (productProvider === "cebu") {
  //       router.push({
  //         pathname: `/product-details/lifestyle/v4/${generateSlug(title)}`,
  //         query: {
  //           pID: product.lifestyle_id,
  //           viewStatus: 'checkavalibility',
  //            productImage: productImage,
  //         }
  //       });
  //     } else if (productProvider != "bridgify") {
  //       console.log(productProvider, "Product data value is")
  //       router.push({
  //         pathname: `/product-details/lifestyle/${generateSlug(title)}`,
  //         query: {
  //           pID: product.lifestyle_id,
  //           viewStatus: 'checkavalibility'
  //         }
  //       });
  //     } else {
  //       console.log(product, "Product data value is")
  //       router.push({
  //         pathname: `/product-details/lifestyle/v2/${generateSlug(title)}`,
  //         query: {
  //           pID: product?.lifestyle_id
  //         }
  //       });
  //     }

  //   } else if (productstype === 'essential') {
  //     router.push({
  //       pathname: `/product-details/essential/${generateSlug(title)}`,
  //       query: {
  //         pID: product.id
  //       }
  //     })
  //   } else if (productstype === 'nonessential') {
  //     router.push({
  //       pathname: `/product-details/nonessential/${generateSlug(title)}`,
  //       query: {
  //         pID: product.id
  //       }
  //     })
  //   } else if (productstype === 'education') {
  //     router.push({
  //       pathname: `/product-details/education/${generateSlug(title)}`,
  //       query: {
  //         pID: product.education_id
  //       }
  //     })
  //   } else if (productstype === 'hotels') {
  //     console.log(hotelCode, provider, product?.bookByDays, "Product data value is")
  //     Cookies.set('productData', JSON.stringify(product), { expires: 1 });
  //     router.push({
  //       pathname: `/product-details/hotels/${generateSlug(title)}`,
  //       query: {
  //         pID: hotelCode,
  //         provider: provider,
  //         bookbydays: product?.bookByDays,
  //         // product: JSON.stringify(product),

  //         // adultCount: hotelSearchCustomerData?.NoOfAdults,
  //         // childCount: hotelSearchCustomerData?.NoOfChild,
  //         // checkIn: hotelSearchCustomerData?.CheckInDate,
  //         // checkOut: hotelSearchCustomerData?.CheckOutDate
  //       }
  //     })
  //   } else if (productstype === 'transport') {

  //     // console.log("product pass obj",  {
  //     //   cart: JSON.stringify(cart),
  //     //   slug: generateSlug(title),
  //     //   selectedVehicle: JSON.stringify(vehicle)
  //     // })
  //     router.push({
  //       pathname: `/product-details/transport/${generateSlug(title)}`,
  //       query: {
  //         cart: JSON.stringify(cart),
  //         slug: generateSlug(title),
  //         selectedVehicle: JSON.stringify(vehicle)
  //       }
  //     })
  //   };
  // }

  const clickProductDetail = () => {
  const openInNewWindow = (pathname, query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.open(url, '_blank');
  };

  if (productstype === 'lifestyle') {
    var productProvider = product?.provider
    // console.log(product?.provider, "Product data value is")

    if (productProvider === "globaltix") {
      // console.log({
      //     pID: product.lifestyle_id,
      //     viewStatus: 'checkavalibility'
      //   }, "Product data value is")
      openInNewWindow(
        `/product-details/lifestyle/v3/${generateSlug(title)}`,
        {
          pID: product.lifestyle_id,
          viewStatus: 'checkavalibility',
          productImage: productImage,
        }
      );
    } else if (productProvider === "zetexa") {
      
      manageZetexaData(product);
      // return
      openInNewWindow(
        `/product-details/lifestyle/v5/${generateSlug(title)}`,
        {
          pID: product.id,
          viewStatus: 'checkavalibility'
        }
      );
    } else if (productProvider === "cebu") {
      console.log(product, "Product data value is")
      openInNewWindow(
        `/product-details/lifestyle/v4/${generateSlug(title)}`,
        {
          pID: product.lifestyle_id,
          viewStatus: 'checkavalibility',
          productImage: productImage,
        }

      );
    } else if (productProvider != "bridgify") {
      console.log(productProvider, "Product data value is")
      openInNewWindow(
        `/product-details/lifestyle/${generateSlug(title)}`,
        {
          pID: product.lifestyle_id,
          viewStatus: 'checkavalibility'
        }
      );
    } else {
      console.log(product, "Product data value is")
      openInNewWindow(
        `/product-details/lifestyle/v2/${generateSlug(title)}`,
        {
          pID: product?.lifestyle_id

        }
      );
    }

  } else if (productstype === 'essential') {
    openInNewWindow(
      `/product-details/essential/${generateSlug(title)}`,
      {
        pID: product.id
      }
    );
  } else if (productstype === 'nonessential') {
    openInNewWindow(
      `/product-details/nonessential/${generateSlug(title)}`,
      {
        pID: product.id
      }
    );
  } else if (productstype === 'education') {
    openInNewWindow(
      `/product-details/education/${generateSlug(title)}`,
      {
        pID: product.education_id
      }
    );
  } else if (productstype === 'hotels') {
    console.log(hotelCode, provider, product?.bookByDays, "Product data value is")
    Cookies.set('productData', JSON.stringify(product), { expires: 1 });
    openInNewWindow(
      `/product-details/hotels/${generateSlug(title)}`,
      {
        pID: hotelCode,
        provider: provider,
        bookbydays: product?.bookByDays,
        // product: JSON.stringify(product),

        // adultCount: hotelSearchCustomerData?.NoOfAdults,
        // childCount: hotelSearchCustomerData?.NoOfChild,
        // checkIn: hotelSearchCustomerData?.CheckInDate,
        // checkOut: hotelSearchCustomerData?.CheckOutDate
      }
    );
  } else if (productstype === 'transport') {

    // console.log("product pass obj",  {
    //   cart: JSON.stringify(cart),
    //   slug: generateSlug(title),
    //   selectedVehicle: JSON.stringify(vehicle)
    // })
    openInNewWindow(
      `/product-details/transport/${generateSlug(title)}`,
      {
        cart: JSON.stringify(cart),
        slug: generateSlug(title),
        selectedVehicle: JSON.stringify(vehicle)
      }
    );
  }
}
  const handleTransportVehicleProduct = (product) => {
    vehicle = product
    clickProductDetail();
    console.log("Transport vehicle product clicked", vehicle);
  }

  const titleStyle = {
    lineHeight: '20px',
    minHeight: '40px',
    maxHeight: '45px',
    fontSize: '13px',
    fontWeight: '600',
    width:'80%'
  };

   const descriptionStyle = {
    lineHeight: '18px',
    minHeight: '35px',
    maxHeight: '40px',
    fontSize: '11px',
    fontWeight: '400',
    width:'80%',
  };

  const getPaymentMethods = () => {
    let options = product.payment_options.split(',');
    return (
      <div className="d-flex gap-2 mb-2">
        {
          options.map((value, key) => (
            value == 1 ?
              <Media src={cod.src} alt="cash on delivery image" key={key} style={{ width: '40px', height: '20px' }} /> :
              value == 2 ?
                <Media src={online.src} alt="online payment image" key={key} style={{ width: '40px', height: '20px' }} /> : null
          ))
        }
      </div>
    )
  }

  const handleAddToCart = () => {
    if (typeof addToCart === 'function') {
      addToCart(product);
    }
  };
const [currentImage, setCurrentImage] = useState(getPlaceholderImage(productstype));
const [nextImage, setNextImage] = useState(getPlaceholderImage(productstype));
  const [direction, setDirection] = useState("right");


  useEffect(() => {
     let images;
    try {
      if(productstype === 'lifestyle'){
        images = productImage;
        console.log("product images", images, title);
        setCurrentImage(images);
      }else{
        images = productImage?.split(',');
        setCurrentImage(images[0]);
      }
      // const images = productImage?.split(',');
      // console.log("product images", images[0], title);
      // setCurrentImage(images[0]);
      setNextImage(images[1]);
      let i = 1;
      let intervalId;
      // if (images.length > 1) {
      //   intervalId = setInterval(() => {
      //     setTimeout(() => {
      //       setDirection(i % 2 === 0 ? "right" : "left");
      //       setCurrentImage(images[i]);
      //       setNextImage(images[(i + 1) % images.length]);
      //       i = (i + 1) % images.length;
      //     }, 500);
      //   }, 5000);
      // } else {
      //   setDirection('')
      //   setCurrentImage(images[0]);
      //   setCurrentImage(images[0]);
      // }
      return () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    } catch (error) {
      // console.error(error);
    }
  }, [productImage]);

  function removeHTMLTags(str) {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, '');
}

  if (related === true) {

    return (

      <>
        <Col xl="2" md="4" sm="6" key={0}>
          <div className="product-box px-2 pb-3" onClick={clickProductDetail}>
            <div className="img-wrapper">
              <div className="front">
                <LazyLoadImage src={productImage || `https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png`} style={{ minHeight: "230px", maxHeight: "230px", width: '100%', objectFit: 'cover' }} className="img-fluid blur-up lazyload bg-img" alt="product-image" loading="eager" />
              </div>
              <div className={`${cartClass} product-card-cart-container`}>
                <button title="View Product" onClick={clickProductDetail}>
                  <i className="fa fa-eye"></i>
                </button>
                <button title="Product Info" onClick={toggle}>
                  <i className="fa fa-info"></i>
                </button>
              </div>
            </div>
            <div style={{}} className="product-detail pt-2 product-detail-small-card p-0">
              {
                productstype === 'lifestyle' ?
                  <div>
                    <h6 className="mb-1 ellipsis-2-lines" style={titleStyle}>{title}</h6>
                    {
                      adultRate != null &&
                      CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00 &&
                      <>
                        <h4>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "11px" }}>Adult rate</span>
                      </>
                    }
                    {
                      childRate != null &&
                      Number(adultRate) !== Number(childRate) &&
                      CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00 &&
                      <>
                        <h4 className="mt-2">{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "12px" }}>Child rate</span>
                      </>
                    }
                    {
                      packageRate != null &&
                      CurrencyConverterOnlyRate(productcurrency, packageRate, baseCurrencyValue) != 0.00 &&
                      <>
                        <h4 className="mt-2">{CurrencyConverter(productcurrency, packageRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "12px" }}>package rate</span>
                      </>
                    }
                  </div> :
                  (productstype === 'essential' || productstype === 'nonessential') ?
                    <div>
                      <h6 className="mb-2 ellipsis-2-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                      <h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Per item</span>
                    </div>
                    :
                    productstype === 'education' ?
                      <div>
                        <h6 className="mb-2 ellipsis-2-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                        {adultRate != 0.00 && <h4>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>}
                        {childRate != 0.00 && <span className="text-muted" style={{ fontSize: "11px" }}>Adult rate</span>}
                        {childRate != 0.00 && <h4>{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>}
                        {childRate != 0.00 && <span className="text-muted" style={{ fontSize: "11px" }}>Child rate</span>}
                      </div>
                      : productstype === 'hotels' ?
                        <div>
                          <h6 className="mb-2 ellipsis-1-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                          <h1 className="mt-2 ellipsis-2-lines" style={{ fontSize: "11px", lineHeight: '17px', maxHeight: '40px', minHeight: "40px", color: 'gray' }}>{hotelAddress}</h1>
                          <Rating name="hover-feedback" value={rating} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                        </div>
                        : productstype === 'transport' ?
                          <div>
                            <h6 className="mb-2 ellipsis-2-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                          </div>
                          : null

              }
            </div>
          </div>
        </Col>

        <Modal isOpen={modal} toggle={toggle} className="modal-lg quickview-modal" centered>
          <ProductInfoModal productImage={productImage} title={title} description={description} product={product} toggle={toggle} redirect={clickProductDetail} />
        </Modal>

      </>

    )
  } else if (vendorRelated == true) {
    return (
      <div className="product-box" onClick={clickProductDetail}>

        <div className="d-flex align-items-center gap-1">
          <LazyLoadImage src={productImage || `https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/hotel-placeholder.png`} style={{ minHeight: "80px", maxHeight: "80px", minWidth: '80px', maxWidth: '80px', objectFit: 'cover', borderRadius: '5px' }} className="img-fluid blur-up lazyload bg-img m-0 p-0" alt="product-image" loading="eager" />
          <div className="product-detail product-detail-small-card">
            {
              productstype === 'lifestyle' ?
                <div>
                  <h6 className="mb-1 ellipsis-2-lines" style={titleStyle}>{title}</h6>
                  <div className="d-flex gap-3">
                    {
                      adultRate != null && CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00 &&
                      <div className="d-flex flex-column">
                        <h4>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "11px" }}>Adult rate</span>
                      </div>
                    }
                    {
                      childRate != null && Number(adultRate) !== Number(childRate) && CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00 &&
                      <div className="d-flex flex-column">
                        <h4 className="">{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "12px" }}>Child rate</span>
                      </div>
                    }
                    {
                      packageRate != null && CurrencyConverterOnlyRate(productcurrency, packageRate, baseCurrencyValue) != 0.00 &&
                      <div className="d-flex flex-column">
                        <h4 className="">{CurrencyConverter(productcurrency, packageRate, baseCurrencyValue)}</h4>
                        <span className="text-muted" style={{ fontSize: "12px" }}>package rate</span>
                      </div>
                    }
                  </div>
                </div> :
                (productstype === 'essential' || productstype === 'nonessential') ?
                  <div>
                    <h6 className="mb-2 ellipsis-2-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                    <h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4>
                    <span className="text-muted" style={{ fontSize: "11px" }}>Per item</span>
                  </div>
                  :
                  productstype === 'education' ?
                    <div>
                      <h6 className="mb-2 ellipsis-2-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                      {adultRate != 0.00 && <h4>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>}
                      {childRate != 0.00 && <span className="text-muted" style={{ fontSize: "11px" }}>Adult rate</span>}
                      {childRate != 0.00 && <h4>{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>}
                      {childRate != 0.00 && <span className="text-muted" style={{ fontSize: "11px" }}>Child rate</span>}
                    </div>
                    : productstype === 'hotels' ?
                      <div>
                        <h6 className="mb-2 ellipsis-1-lines" style={{ fontSize: "14px", lineHeight: "20px", minHeight: '40px', maxHeight: '45px' }}>{title}</h6>
                        <h1 className="mt-2 ellipsis-2-lines" style={{ fontSize: "11px", lineHeight: '17px', maxHeight: '40px', minHeight: "40px", color: 'gray' }}>{hotelAddress}</h1>
                        <Rating name="hover-feedback" value={rating} emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />} />
                        <h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4>
                      </div>
                      : null
            }
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="product-box product-wrap mb-4">

        <div className="img-wrapper">
        {/* {product.discount ? console.log('product.discount',product.discount):null} */}
          <div className={`lable-block-horizontal d-${product.discount ? 'block' : 'none'}`} style={{
            position: 'absolute',
            top: '0px',
            left: '0',
            right: '0',
            width: '100%',
            zIndex: 100,
            // padding: '0 10px'
          }}>
            <span className="lable-horizontal" style={{
              display: 'block',
              width: '100%',
              backgroundColor: '#ff4757',
              color: 'white',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '600',
              textAlign: 'center',
              borderRadius: '6px',
              boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {product.discount?.discount_tag_line || '25% Discount'}
            </span>
          </div>
{isProductFree(product, productstype) && (
  <div style={{
    position: 'absolute',
    top: product.discount ? '45px' : '10px', // Adjust position based on discount badge
    right: '10px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    zIndex: 3,
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  }}>
    <span style={{ 
      fontSize: '10px', 
      background: 'rgba(255, 255, 255, 0.2)', 
      borderRadius: '50%', 
      width: '16px', 
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>✓</span>
    Exclusively Free
  </div>
)}
{productstype === 'hotels' &&
  <div className="image-container" style={{ borderRadius: "12px", position: 'relative' }}>
    {actualImages.length === 1 ? (
      <div style={{ position: 'relative' }}>
        {/* Default/placeholder image - always shown */}
        <LazyLoadImage 
          src={getPlaceholderImage('hotels')} 
          alt={`${title || 'Hotel'} placeholder`}
          loading="eager"
          className="product-image placeholder"
          style={{ 
            width: '100%', 
            minHeight: '300px', 
            maxHeight: '300px', 
            objectFit: 'cover', 
            borderRadius: "12px",
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
        {/* Actual image - loads on top */}
        <LazyLoadImage 
          src={currentImage} 
          alt={`${title || 'Hotel'} image`}
          loading="eager"
          className="product-image actual"
          onLoad={() => setIsImageLoaded(true)}
          onError={handleImageError}
          style={{ 
            width: '100%', 
            minHeight: '300px', 
            maxHeight: '300px', 
            objectFit: 'cover', 
            borderRadius: "12px",
            position: 'relative',
            zIndex: 2,
            opacity: isImageLoaded && !imageError ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onClick={clickProductDetail}
        />
      </div>
    ) : (
      <div style={{ position: 'relative' }}>
        {/* For multiple images, only show the current image */}
        <LazyLoadImage 
          src={getPlaceholderImage('hotels')} 
          alt={`${title || 'Hotel'} placeholder`}
          loading="eager"
          className="product-image placeholder"
          style={{ 
            width: '100%', 
            minHeight: '300px', 
            maxHeight: '300px', 
            objectFit: 'cover', 
            borderRadius: "12px",
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1
          }}
        />
        {/* Actual current image */}
        <LazyLoadImage 
          src={currentImage} 
          alt={`${title || 'Hotel'} image`}
          loading="eager"
          className="product-image actual"
          onLoad={() => setIsImageLoaded(true)}
          onError={handleImageError}
          style={{ 
            width: '100%', 
            minHeight: '300px', 
            maxHeight: '300px', 
            objectFit: 'cover', 
            borderRadius: "12px",
            position: 'relative',
            zIndex: 2,
            opacity: isImageLoaded && !imageError ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          onClick={clickProductDetail}
        />
      </div>
    )}
  </div>
}

{productstype === 'lifestyle' &&
  <div className="image-container" style={{ borderRadius: "12px", position: 'relative' }}>
    <div style={{ position: 'relative' }}>
      {/* Default/placeholder image - always shown */}
      <LazyLoadImage 
        src={getPlaceholderImage('lifestyle')} 
        alt={`${title || 'Activity'} placeholder`}
        loading="eager"
        className="product-image placeholder"
        style={{ 
          width: '100%', 
          minHeight: '300px', 
          maxHeight: '300px', 
          objectFit: 'cover', 
          borderRadius: "12px",
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      {/* Actual image - loads on top */}
      <LazyLoadImage 
        src={actualImages[0] || getPlaceholderImage('lifestyle')} 
        alt={`${title || 'Activity'} image`}
        loading="eager"
        className="product-image actual"
        onLoad={() => setIsImageLoaded(true)}
        onError={handleImageError}
        style={{ 
          width: '100%', 
          minHeight: '300px', 
          maxHeight: '300px', 
          objectFit: 'cover', 
          borderRadius: "12px",
          position: 'relative',
          zIndex: 2,
          opacity: isImageLoaded && !imageError ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
        onClick={clickProductDetail}
      />
    </div>
  </div>
}

          {productstype !== 'transport' && productstype !== 'hotels' && productstype !== 'lifestyle' &&
            <div className="image-container" style={{ borderRadius: "12px" }}>
              {
                productImage?.split(',').length === 1 ?
                  <LazyLoadImage src={currentImage === ''? `https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/ItineraryCover/placeholder-2.png` : currentImage} className={`product-image animating-${direction} current-image`} alt="product-image" loading="eager" onClick={clickProductDetail} style={{ width: 'auto', minWidth: '100%', maxWidth: '100%', minHeight: '300px', maxHeight: '300px', objectFit: 'cover', borderRadius: "12px" }} />
                  :
                  <>
                    <LazyLoadImage src={currentImage} className={`product-image animating-${direction} current-image`} alt="product-image" loading="eager" onClick={clickProductDetail} style={{ width: 'auto', minWidth: '100%', maxWidth: '100%', minHeight: '300px', maxHeight: '300px', objectFit: 'cover', borderRadius: "12px" }} />
                    <LazyLoadImage src={nextImage} className={`img-fluid animating-${direction} next-image`} alt="product-image" loading="eager" style={{ width: 'auto', minWidth: '100%', maxWidth: '100%', minHeight: '360px', maxHeight: '360px', objectFit: 'cover', borderRadius: "12px" }} />
                  </>
              }
            </div>
          }

           


           <div className={`${cartClass} product-card-cart-container`} style={{ marginRight: '5px', marginBottom: '5px', borderRadius: '25px', height: '40px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "rgba(255,255,255,0.8)" }}>
      {/* This line is already fixed - using handleInfoClick */}
      <button title="Product Info" onClick={handleInfoClick}>
        <i className="fa fa-info"></i>
      </button>
    </div>

        </div>
        <div className='product-detail'>
          {
            productstype === 'lifestyle' ?
            
              <div>
                <h4 className="my-1 ellipsis-2-lines" style={titleStyle} onClick={clickProductDetail}>{title}</h4>
                <h6 className=" ellipsis-2-lines" style={{...descriptionStyle, marginTop: '2px'}} onClick={clickProductDetail}>{removeHTMLTags(description)}</h6>
                 

                {/* Adult and Child rates in single line */}
                {(adultRate != null && CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00) ||
                 (childRate != null && Number(adultRate) !== Number(childRate) && CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00) ? (
                  <div style={{ marginTop: '8px' }}>
                    <div className="d-flex gap-3 align-items-start">
                      {/* Adult Rate */}
                      {adultRate != null && CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00 && (
                        <div className="d-flex flex-column">
                          {product.discount?.amount > 0 && product.discount?.amount !== null && product.discount?.amount !== undefined ? (
                            <>
                              <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, getDiscountProductBaseByPrice(
                                        adultRate,
                                        product.discount,
                                        baseCurrencyValue
                                      )["discountedAmount"], baseCurrencyValue)}</h4> 
                              <h5 style={{ textDecoration: "line-through", marginBottom: '2px' }}>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h5>
                            </>
                          ) : (
                            <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>
                          )}
                          <span className="text-muted" style={{ fontSize: "10px", textTransform: 'capitalize' }}>
                            {Number(adultRate) === Number(childRate) ? "Adults & Children rate" : "Adult rate"}
                          </span>
                        </div>
                      )}

                      {/* Child Rate */}
                      {childRate != null && Number(adultRate) !== Number(childRate) && CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00 && (
                        <div className="d-flex flex-column">
                          {product.discount?.amount > 0 && product.discount?.amount !== null && product.discount?.amount !== undefined ? (
                            <>
                              <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, getDiscountProductBaseByPrice(
                                        childRate,
                                        product.discount,
                                        productcurrency
                                      )["discountedAmount"], baseCurrencyValue)}</h4> 
                              <h5 style={{ textDecoration: "line-through", marginBottom: '2px' }}>{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h5>
                            </>
                          ) : (
                            <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>
                          )}
                          <span className="text-muted" style={{ fontSize: "10px", textTransform: 'capitalize' }}>Child rate</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Package Rate */}
                {packageRate != null && CurrencyConverterOnlyRate(productcurrency, packageRate, baseCurrencyValue) != 0.00 && (
                  <div style={{ marginTop: '8px' }}>
                    <h4 className="mt-2">{CurrencyConverter(productcurrency, packageRate, baseCurrencyValue)}</h4>
                    <span className="text-muted" style={{ fontSize: "10px", textTransform: 'capitalize' }}>package rate</span>
                  </div>
                )}
              </div> :
              (productstype === 'essential' || productstype === 'nonessential') ?
                <div>
                  <h6 className="my-1 ellipsis-2-lines" style={titleStyle}>{title}</h6>
                  <h6 className=" ellipsis-2-lines" style={{...descriptionStyle, marginTop: '2px'}} onClick={clickProductDetail}>{removeHTMLTags(description)}</h6>
                  <>{getPaymentMethods()}</>
                  <h4 style={{ marginTop: '8px' }}>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Per item</span>
                </div>
                :
                productstype === 'education' ?
                  <div>
                    <h6 className="my-1 ellipsis-2-lines" style={titleStyle}>{title}</h6>
                    <h6 className="ellipsis-2-lines" style={{...descriptionStyle, marginTop: '2px'}} onClick={clickProductDetail}>{removeHTMLTags(description)}</h6>
                    
                    {/* Adult and Child rates in single line for education */}
                    {(CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00) ||
                     (Number(adultRate) !== Number(childRate) && CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00) ? (
                      <div style={{ marginTop: '8px' }}>
                        <div className="d-flex gap-3 align-items-start">
                          {/* Adult Rate */}
                          {CurrencyConverterOnlyRate(productcurrency, adultRate, baseCurrencyValue) != 0.00 && (
                            <div className="d-flex flex-column">
                              <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, adultRate, baseCurrencyValue)}</h4>
                              <span className="text-muted" style={{ fontSize: "10px" }}>
                                {Number(adultRate) === Number(childRate) ? "Adults & Children rate" : "Adult rate"}
                              </span>
                            </div>
                          )}

                          {/* Child Rate */}
                          {Number(adultRate) !== Number(childRate) && CurrencyConverterOnlyRate(productcurrency, childRate, baseCurrencyValue) != 0.00 && (
                            <div className="d-flex flex-column">
                              <h4 style={{ marginBottom: '2px' }}>{CurrencyConverter(productcurrency, childRate, baseCurrencyValue)}</h4>
                              <span className="text-muted" style={{ fontSize: "10px" }}>Child rate</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  : productstype === 'hotels' ?
                    <div>
                      {/* <div className="product-extras-label">{provider}</div> */}
                      <h6 className="my-1 ellipsis-2-lines" style={titleStyle}>{title}</h6>
                      <h6 className=" ellipsis-2-lines" style={{...descriptionStyle, marginTop: '2px'}} onClick={clickProductDetail}>{removeHTMLTags(description)}</h6>
                      <div style={{ marginTop: '8px' }}>
                        {/* <h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4> */}
                        {
                          (mrp === undefined || mrp === null || isNaN(Number(mrp)))
                            // ? <h4>{baseCurrencyValue.base} 0.00</h4>
                            ? <h4></h4>
                            // : <><h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4><span className="text-muted" style={{ fontSize: "10px" }}>Per night</span></>
                            : <>
                              {
                                product.discount?.amount > 0 && product.discount?.amount !== null && product.discount?.amount !== undefined ?
                                  <><h4>{CurrencyConverter(productcurrency, getDiscountProductBaseByPrice(
                                    mrp,
                                    product.discount,
                                    productcurrency
                                  )["discountedAmount"], baseCurrencyValue)}</h4><h5 style={{ textDecoration: "line-through" }}>{CurrencyConverter(productcurrency, getDiscountProductBaseByPrice(
                                    mrp,
                                    product.discount,
                                    productcurrency
                                  )["actual"], baseCurrencyValue)}</h5><span className="text-muted" style={{ fontSize: "10px" }}>Per night</span></>

                                  :
                                  <><h4>{CurrencyConverter(productcurrency, mrp, baseCurrencyValue)}</h4><span className="text-muted" style={{ fontSize: "10px" }}>Per night</span></>
                              }


                            </>
                        }

                      </div>
                      <div>{getStar(rating)}</div>
                    </div>
                    :
                    productstype === 'transport' ?

                      <div className="vehicle-row">
                        <Row className="align-items-center">
                          {/* Left side - Vehicle image with fuel type badge */}
                          <Col xs={12} md={3} className="mb-3 mb-md-0">
                            <div className="vehicle-image-container">
                              <img
                                src={product.image || '/assets/images/vehicle-placeholder.jpg'}
                                alt={product.vehicleName}
                                className="vehicle-image"
                              />
                            </div>
                          </Col>

                          {/* Middle - Vehicle details */}
                          <Col xs={12} md={6} className="mb-3 mb-md-0">
                            <div className="vehicle-details">
                              <div className="d-flex align-items-center mb-2">
                                <h4 className="vehicle-name mb-0">{product.vehicleName}</h4>

                              </div>

                              <div className="vehicle-features mb-3">
                                <span className="feature">
                                  {product?.passengeCount} Seats
                                </span>
                                <span className="feature-separator">•</span>
                                <span className="feature">
                                  {'AC'}
                                </span>
                                <span className="feature-separator">•</span>
                                <span className="feature">
                                  {product?.luggageCount} {" "}
                                </span>
                                <span className="feature">
                                  {'.  Luggages'}
                                </span>
                              </div>

                              {product?.description && (
                                <div className="roof-carrier">
                                  <span className="roof-star">✨</span> {product?.description}
                                </div>
                              )}
                            </div>
                          </Col>

                          {/* Right side - Price and action button */}
                          <Col xs={12} md={3}>
                            <div className="price-action text-md-end">


                              <div className="current-price">
                                {CurrencyConverter(product?.unit, product?.price, baseCurrencyValue)}
                              </div>

                              {true && (
                                <div className="taxes-note">
                                  (Taxes & Charges)
                                </div>
                              )}

                              <Button
                                color="primary"
                                // disabled={true}
                                className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '5px 10px', borderRadius: '4px' }}
                                onClick={() => handleTransportVehicleProduct(product)}
                              >
                                View
                              </Button>
                            </div>
                          </Col>
                        </Row>

                        <style jsx>{`
                        .vehicle-row {
                            background: #fff;
                            border-radius: 10px;
                            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                            padding: 20px;
                            margin-bottom: 20px;
                            transition: box-shadow 0.3s;
                        }
                        
                        .vehicle-row:hover {
                            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                        }
                        
                        .vehicle-image-container {
                            position: relative;
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        
                        .vehicle-image {
                            width: 100%;
                            height: auto;
                            object-fit: contain;
                            display: block;
                        }
                        
                        .fuel-badge {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            background-color: #009688;
                            color: white;
                            text-align: center;
                            padding: 5px;
                            font-weight: 500;
                        }
                        
                        .vehicle-name {
                            font-size: 20px;
                            font-weight: 600;
                        }
                        
                        .rating-badge {
                            background-color: #388e3c;
                            color: white;
                            display: flex;
                            align-items: center;
                            padding: 0 8px;
                            border-radius: 4px;
                            font-size: 14px;
                            height: 24px;
                        }
                        
                        .vehicle-features {
                            display: flex;
                            align-items: center;
                            font-size: 16px;
                        }
                        
                        .feature {
                            display: flex;
                            align-items: center;
                        }
                        
                        .feature-separator {
                            margin: 0 10px;
                            color: #aaa;
                        }
                        
                        .roof-carrier {
                            font-size: 14px;
                            color: #333;
                            padding: 8px 0;
                        }
                        
                        .roof-star {
                            color: #f1c40f;
                            margin-right: 4px;
                        }
                        
                        .btn-link {
                            background: none;
                            border: none;
                            padding: 0;
                            color: #3498db;
                            text-decoration: none;
                            cursor: pointer;
                            font-size: 14px;
                        }
                        
                        .btn-link:hover {
                            text-decoration: underline;
                        }
                        
                        .discount-tag {
                            color: #e74c3c;
                            font-size: 14px;
                            font-weight: 500;
                        }
                        
                        .original-price {
                            text-decoration: line-through;
                            color: #777;
                            font-size: 16px;
                        }
                        
                        .current-price {
                            font-size: 24px;
                            font-weight: 700;
                            color: #000;
                        }
                        
                        .taxes-note {
                            font-size: 12px;
                            color: #777;
                        }
                        
                        .select-btn {
                            width: 100%;
                            font-weight: 500;
                        }
                        
                        @media (max-width: 767px) {
                            .price-action {
                                text-align: left;
                                margin-top: 15px;
                            }
                            
                            .discount-tag {
                                text-align: left;
                            }
                        }
                    `}</style>
                      </div>
                      :
                      null
          }
        </div>

        <Modal isOpen={modal} toggle={toggle} className="modal-lg quickview-modal" centered>
          <ProductInfoModal productImage={productImage} title={title} description={description} product={product} toggle={toggle} redirect={clickProductDetail} productstype={productstype}  />
        </Modal>

      </div>
    )

  }


}

export default ProductItem;