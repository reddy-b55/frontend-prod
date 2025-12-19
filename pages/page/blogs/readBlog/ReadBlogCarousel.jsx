import Slider from "react-slick";
import React, { Fragment } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

function ReadBlogCarousel({ images }) {

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true, 
    pauseOnHover: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="read-blog-page-blog-container">
      <Fragment style={{ zIndex: 1 }}>
        <Slider {...settings}>
          {
            images.map((data, key) => (
              <LazyLoadImage src={data} key={key} alt="Promotional Banner-images" quality={100} priority />
            ))
          }
        </Slider>
      </Fragment>
    </div>
  );

}

export default ReadBlogCarousel;