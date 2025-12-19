import axios from "axios";
import Slider from "react-slick";
import React, { Fragment, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from "@mui/material";
import banner1 from "../../public/assets/images/Bannerimages/mainbanner/pageBanner.jpg";
import Link from "next/link";
import styles from "./Banner.module.css";

const Banner = ({ flightPage }) => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
    prevArrow: <CustomPrevArrow />,
    nextArrow: <CustomNextArrow />,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    dotsClass: `slick-dots ${styles.customDots}`,
  };

  const [banners, setBanners] = useState(null);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Check screen width and update state
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsImgLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getLatestBanners = async () => {
    await axios.get("getBanners/homePage").then((response) => {
      setBanners(response.data.banners);
    });
  };

  useEffect(() => {
    getLatestBanners();
  }, []);

  const getButtonStyles = () => {
    const isSmallMobile = screenWidth <= 480;
    const isMediumMobile = screenWidth <= 768 && screenWidth > 480;
    const isMobile = screenWidth <= 768;
    
    return {
      position: "absolute",
      bottom: isMobile ? "20px" : "25px",
      left: "50%",
      transform: "translateX(-50%)",
      padding: isSmallMobile ? "12px 24px" : isMediumMobile ? "14px 32px" : "16px 48px",
      backgroundColor: "#fff",
      color: "#333",
      border: "none",
      borderRadius: "50px",
      fontSize: isSmallMobile ? "14px" : isMediumMobile ? "16px" : "18px",
      fontWeight: "600",
      cursor: "pointer",
      zIndex: 999,
      minWidth: isSmallMobile ? "140px" : isMediumMobile ? "180px" : "220px",
      minHeight: isSmallMobile ? "44px" : isMediumMobile ? "48px" : "52px",
      transition: "all 0.3s ease-in-out",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
    };
  };

  const getSpanStyles = () => {
    const isSmallMobile = screenWidth <= 480;
    const isMediumMobile = screenWidth <= 768 && screenWidth > 480;
    
    return {
      fontSize: isSmallMobile ? "14px" : isMediumMobile ? "16px" : "18px",
      whiteSpace: "nowrap",
      display: "block",
      position: "relative",
      zIndex: 2,
      fontWeight: "600",
    };
  };

  return (
    <div className={styles.bannerContainer}>
      {isImgLoading && (
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}></div>
        </div>
      )}

      <Link className="nav-link" href="/shop/lifestyle">
        {flightPage && (
          <button
            className={styles.bookNowBtn}
            style={getButtonStyles()}
            onClick={() => console.log("Book Now clicked")}
          >
            <span style={getSpanStyles()}>Book Now</span>
          </button>
        )}
      </Link>

      {!isImgLoading && (
        <div className={styles.sliderWrapper}>
          <Slider {...settings}>
            {banners?.map((data, key) => (
              <div key={key} className={styles.slideContainer}>
                <LazyLoadImage
                  src={data}
                  alt="Promotional Banner-images"
                  width={"100%"}
                  height="600px"
                  style={{ objectFit: "cover", display: "block" }}
                  className={styles.responsiveImage}
                />
                <div className={styles.imageOverlay} />
              </div>
            ))}
          </Slider>
        </div>
      )}
    </div>
  );
};

// Custom Previous Arrow Component
const CustomPrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.prevArrow}`}
      style={style}
      onClick={onClick}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="15,18 9,12 15,6"></polyline>
      </svg>
    </div>
  );
};

// Custom Next Arrow Component
const CustomNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} ${styles.customArrow} ${styles.nextArrow}`}
      style={style}
      onClick={onClick}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <polyline points="9,18 15,12 9,6"></polyline>
      </svg>
    </div>
  );
};

export default Banner;