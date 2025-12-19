import Image from "next/image";
import Slider from "react-slick";
import React, { Fragment } from "react";

function Banner_blogs() {

  const Data = [
    { img: "/assets/images/blog-banners/banner1.jpg" },
    { img: "/assets/images/blog-banners/banner2.jpg" },
    { img: "/assets/images/blog-banners/banner3.jpg" }
  ];

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="blog-page-blog-container">
      <Fragment style={{ zIndex: 1 }}>
        <Slider {...settings}>
          {
            Data.map((data, key) => (
              <Image src={data.img} key={key} alt="Promotional Banner-images" width={1000} height={600} className="responsive-image" quality={100} priority />
            ))
          }
        </Slider>
      </Fragment>
    </div>
  );
}

export default Banner_blogs;
