import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { Row, Col, Container } from "reactstrap";
import ProductItems from "../product-box/ProductBox";
import moment from "moment";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { ArrowRight } from "lucide-react";

// Custom arrow components without using external icon libraries
const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`custom-next-arrow `}
      style={{
        ...style,
        display: "block",
        position: "absolute",
        right: "-50px", // Adjust to move outside product box
        top: "30%",
        transform: "translateY(-50%)",
        zIndex: 1,
        cursor: "pointer",
        borderRadius: "50%",
        width: "40px", // Adjust size
        height: "40px", // Adjust size
        textAlign: "center",
        lineHeight: "50px",
        fontSize: "40px", // Increase icon size
        fontWeight: "bold",
        color: "#D3D3D3", // Default gray color
        transition: "color 0.3s", // Smooth transition for hover effect
      }}
      onClick={onClick}
      // onMouseEnter={(e) => e.target.style.color = "#333"} // Darker on hover
      // onMouseLeave={(e) => e.target.style.color = "#D3D3D3"} // Back to gray
    >
      <ArrowForwardIosIcon fontSize="inherit" /> {/* Inherit size from parent */}
    </div>
  );
};

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`custom-prev-arrow `}
      style={{
        ...style,
        display: "block",
        position: "absolute",
        left: "-50px", // Adjust to move outside product box
        top: "30%",
        transform: "translateY(-50%)",
        zIndex: 1,
        cursor: "pointer",
        borderRadius: "50%",
        width: "40px", // Adjust size
        height: "40px", // Adjust size
        textAlign: "center",
        lineHeight: "50px",
        fontSize: "40px", // Increase icon size
        fontWeight: "bold",
        color: "#D3D3D3", // Default gray color
        transition: "color 0.3s", // Smooth transition for hover effect
      }}
      onClick={onClick}
      // onMouseEnter={(e) => e.target.style.color = "#333"} // Darker on hover
      // onMouseLeave={(e) => e.target.style.color = "#D3D3D3"} // Back to gray
    >
      <ArrowBackIosNewIcon fontSize="inherit" /> {/* Inherit size from parent */}
    </div>
  );
};


const TopCollection = ({ designClass, cartClass, productSlider, backImage, data }) => {
  const [productstype, setproductstype] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setproductstype(data.productsType)
    if (data.productsType === "lifestyle") {
      setProducts(data.lifestyleData)
    } else if (data.productsType === 'hotels') {
      setProducts(data.hotelData)
    } else if (data.productsType === "essential") {
      setProducts(data.essentialData);
    } else if (data.productsType === "nonessential") {
      setProducts(data.nonessentialData);
    } else if (data.productsType === "education") {
      setProducts(data.educationData);
    } else {
      setProducts([])
    }
  }, [data])

  const nextWeekDate = moment().add(7, 'days').format('YYYY-MM-DD');
  const nextWeekDateCheckout = moment().add(8, 'days').format('YYYY-MM-DD');

  const [hotelSearchCustomerData, setHotelSearchCustomerData] = useState({
    CheckInDate: nextWeekDate,
    CheckOutDate: nextWeekDateCheckout,
    NoOfNights: 1,
    NoOfRooms: 1,
    NoOfAdults: 1,
    NoOfChild: 0,
    City: "Colombo",
    Country: "LK",
    StarRate: 0,
    RoomRequest: [{
      indexValue: 0,
      roomType: "Single",
      NoOfAdults: 1,
      NoOfChild: 0,
      ChildAge: []
    }]
  });

  // Updated slider settings with arrows explicitly enabled
  // const sliderSettings = {
  //   ...productSlider,
  //   dots: true,
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 4,
  //   slidesToScroll: 1,
  //   arrows: true, // Explicitly enable arrows
  //   nextArrow: <NextArrow />,
  //   prevArrow: <PrevArrow />,
  //   responsive: [
  //     {
  //       breakpoint: 1024,
  //       settings: {
  //         slidesToShow: 3,
  //         slidesToScroll: 1
  //       }
  //     },
  //     {
  //       breakpoint: 768,
  //       settings: {
  //         slidesToShow: 2,
  //         slidesToScroll: 1
  //       }
  //     },
  //     {
  //       breakpoint: 480,
  //       settings: {
  //         slidesToShow: 1,
  //         slidesToScroll: 1
  //       }
  //     }
  //   ]
  // };
  const getSliderSettings = (productsLength) => {
  // Determine if we should show infinite scroll based on products count
  const shouldShowInfinite = productsLength > 4;
  
  // Adjust slidesToShow based on available products
  const slidesToShow = Math.min(4, productsLength);
  
  return {
    ...productSlider,
    dots: true,
    infinite: shouldShowInfinite, // Only infinite if we have more than 4 products
    speed: 500,
    slidesToShow: slidesToShow, // Dynamic slides to show
    slidesToScroll: 1,
    arrows: productsLength > 1, // Only show arrows if more than 1 product
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, productsLength),
          slidesToScroll: 1,
          infinite: productsLength > 3
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, productsLength),
          slidesToScroll: 1,
          infinite: productsLength > 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: productsLength > 1
        }
      }
    ]
  };
};

const sliderSettings = getSliderSettings(products.length);

  return (
    <section className={designClass} style={{ height: 'auto' }}>
      <Container>
        <Row>
          <Col>
            {/* Add custom-slider class, remove no-arrow class */}
            <Slider {...sliderSettings} className="product-m custom-slider">
              {
                productstype === 'lifestyle' ?
                  products?.map((product, i) => (
                    <div key={i}>
                      <ProductItems product={product} productImage={product?.image} productstype={productstype} title={product?.lifestyle_name} productcurrency={product?.currency} adultRate={product?.adult_rate} childRate={product?.child_rate} packageRate={product?.package_rate} description={product?.lifestyle_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={cartClass} backImage={backImage} />
                    </div>
                  )) : (productstype === 'essential' || productstype === 'nonessential') ?
                    products?.map((product, i) => (
                      <div key={i}>
                        <ProductItems product={product} productImage={product?.product_images?.split(',')[0]} productstype={productstype} title={product?.listing_title} productcurrency={product?.currency} mrp={product?.mrp} description={product?.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={cartClass} backImage={backImage} />
                      </div>
                    )) : productstype === 'hotels' && products?.length > 0 ?
                      products?.map((product, i) => (
                        <div key={i}>
                          <ProductItems product={product} hotelSearchCustomerData={hotelSearchCustomerData} hotelAddress={product?.HotelAddress} provider={product?.provider} productcurrency={product?.Currency} mrp={product?.TotalRate} hotelCode={product?.HotelCode} productImage={product?.HotelPicture} productstype={productstype} title={product?.HotelName} description={product?.HotelDescription} rating={product?.HotelCategory} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={cartClass} backImage={backImage} />
                        </div>
                      )) : productstype === 'education' ?
                        products?.map((product, i) => (
                          <div key={i}>
                            <ProductItems product={product} productImage={product?.image_path?.split(',')[0]} productstype={productstype} title={product?.course_name} productcurrency={product?.currency} adultRate={product?.adult_course_fee} childRate={product?.child_course_fee} description={product?.course_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={cartClass} backImage={backImage} />
                          </div>
                        )) : null
              }
            </Slider>
          </Col>
        </Row>
      </Container>

      {/* Add this CSS to make sure arrows are visible */}
      <style jsx>{`
        .custom-slider .custom-next-arrow,
        .custom-slider .custom-prev-arrow {
          display: block !important;
        }
        
        .custom-slider .slick-prev,
        .custom-slider .slick-next {
          z-index: 1;
        }
        
        /* Override any no-arrow styles */
        .custom-slider.slick-slider {
          position: relative;
        }
      `}</style>
    </section>
  );
};

export default TopCollection;