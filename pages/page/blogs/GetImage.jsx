import Slider from "react-slick";
import React, { Fragment } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

function GetImage({ productImage }) {

    var settings = {
        dots: false,
        infinite: true,
        fade: true,
        speed: Math.random() * 2000 + 6000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        pauseOnHover: true,
        autoplaySpeed: 3000,
    };

    return (
        <div className='blog-main-container'>
            <Fragment style={{ zIndex: 1 }}>
                <Slider {...settings}>
                    {
                        productImage?.split(',').map((data, key) => (
                            <LazyLoadImage src={data} key={key} alt="Promotional Banner-images" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                        ))
                    }
                </Slider>
            </Fragment>
        </div>

    )
}

export default GetImage