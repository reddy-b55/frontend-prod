// import axios from "axios";
// import Slider from "react-slick";
// import React, { Fragment, useEffect, useState } from "react";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import { Skeleton } from "@mui/material";
// // import banner1 from "../../public/assets/images/Bannerimages/mainbanner/pageBanner.jpg";
// import Link from "next/link";
// import  banner1 from "../../../public/assets/images/flightsBanners/web banner website copy.jpg";
// import  banner2 from "../../../public/assets/images/flightsBanners/web banner 2 website copy.jpg";
// import  banner3 from "../../../public/assets/images/flightsBanners/web banner 3 website copy.jpg";


// const Banner = ( 
//   {flightPage}
//  ) => {
//   var settings = {
//     dots: true,
//     infinite: true,
//     speed: 3000,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 5000,
//   };

//   const [banners, setBanners] = useState(null);
//   const [isImgLoading, setIsImgLoading] = useState(true);

   
   
//     useEffect(() => {
//         console.log("Flight Banner Component Mounted", 
//             [
//           { default: banner1 },
//           { default: banner2 },
//           { default: banner3 }
//         ]
//         );
//         setBanners([
//           { default: banner1 },
//           { default: banner2 },
//           { default: banner3 }
//         ]);
//     }, []);


//   //toggle after 2 seconds
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsImgLoading(false);
//     }, 1500);
//     return () => clearTimeout(timer);
//   }, []);

// //   const getLatestBanners = async () => {
// //     await axios.get("getBanners/homePage").then((response) => {
// //       setBanners(response.data.banners);
// //     });
// //   };

// //   useEffect(() => {
// //     getLatestBanners();
// //   }, []);

//   return (
//     <div style={{ zIndex: 1, position: "relative" }}>
//   {isImgLoading && (
//     <div
//       className="loader-wrapper"
//       style={{
//         position: "relative",
//         marginTop: "50px",
//       }}
//       height={750}
//       width={1000}
//     >
//       <div className="loader"></div>
//     </div>
//   )}
//     <Link
//             className="nav-link"
//            href="/shop/flights"
//           >

//   </Link>
//   {!isImgLoading && (

//          <Slider {...settings}>
//       {banners?.map((data, key) => (
//         <div key={key} style={{ position: "relative", display: "block" }}>
//           <LazyLoadImage
//             src={data.default.src}
//             alt={`Promotional Banner-image ${key + 1}`}
//             width={"100%"}
//             height={"500px"}
//             style={{ objectFit: "cover", display: "block" }}
//             className="responsive-image"
//           />
//         </div>
//       ))}
//     </Slider>
 
//   )}
// </div>
//   );
// };

// export default Banner;

import axios from "axios";
import Slider from "react-slick";
import React, { Fragment, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { Skeleton } from "@mui/material";
// import banner1 from "../../public/assets/images/Bannerimages/mainbanner/pageBanner.jpg";
import Link from "next/link";
import banner1 from "../../../public/assets/images/flightsBanners/web banner website 1 resize.jpg";
import banner2 from "../../../public/assets/images/flightsBanners/web banner website 2 resize.jpg";
import banner3 from "../../../public/assets/images/flightsBanners/web banner website 3 resize.jpg";

const Banner = ({ flightPage }) => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true, // Enable navigation arrows
    prevArrow: <SamplePrevArrow />,
    nextArrow: <SampleNextArrow />,
  };

  const [banners, setBanners] = useState(null);
  const [isImgLoading, setIsImgLoading] = useState(false);

  useEffect(() => {
    console.log("Flight Banner Component Mounted", [
      { default: banner1 },
      { default: banner2 },
      { default: banner3 },
    ]);
    setBanners([
      // { default: banner1 },
      { default: banner2 },
      // { default: banner3 },
    ]);
  }, []);

  //toggle after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsImgLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  //   const getLatestBanners = async () => {
  //     await axios.get("getBanners/homePage").then((response) => {
  //       setBanners(response.data.banners);
  //     });
  //   };

  //   useEffect(() => {
  //     getLatestBanners();
  //   }, []);

  return (
    <div style={{ zIndex: 1, position: "relative" }}>
      {isImgLoading && (
        <div
          className="loader-wrapper"
          style={{
            position: "relative",
            marginTop: "50px",
          }}
          height={750}
          width={1000}
        >
          <div className="loader"></div>
        </div>
      )}
      <Link className="nav-link" href="/shop/flights"></Link>
      {!isImgLoading && (
        <Slider {...settings}>
          {banners?.map((data, key) => (
            <div key={key} style={{ position: "relative", display: "block" }}>
              <LazyLoadImage
                src={data.default.src}
                alt={`Promotional Banner-image ${key + 1}`}
                width={"100%"}
                height={"300px"}
                style={{ objectFit: "cover", display: "block" }}
                className="responsive-image"
              />
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

// Custom Previous Arrow Component
const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        // background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        left: "25px",
        zIndex: 2,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}
    >
      <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
      </span>
    </div>
  );
};

// Custom Next Arrow Component
const SampleNextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        // background: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        width: "50px",
        height: "50px",
        right: "25px",
        zIndex: 2,
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      onClick={onClick}
    >
      <span style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
      </span>
    </div>
  );
};

export default Banner;
