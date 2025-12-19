import React, { useEffect } from "react";
import CommonLayout from "../../../components/shop/common-layout";
import Head from "next/head";
import Carousel from "react-bootstrap/Carousel";
import Image from "next/image";
 
function About_Us() {
    const [banners, setBanners] = React.useState([]);
    const [isImgLoading, setIsImgLoading] = React.useState(true);
  const scrollToTeam = () => {
    document.getElementById("team_id").scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsImgLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
 
  const getLatestBanners = () => {
    const imageContext = require.context(
      "../../../public/assets/images/Bannerimages/HomeBanners",
      false,
      /\.(png|jpe?g|svg)$/
    );
    const images = imageContext.keys().map(imageContext);
    setBanners(images);
  };
 
  useEffect(() => {
    getLatestBanners();
  }, []);
 
  return (
    <>
      <Head>
        <title>About Aahaas</title>
        <style>
          {`
            .carousel-control-prev-icon,
            .carousel-control-next-icon {
              // background-color: #ed4242;
              border-radius: 25%;
              padding: 15px;
            }
            .carousel-control-prev-icon{
              display:none;
            }
            .carousel-indicators button {
              // background-color: #ed4242 !important;
              width: 10px !important;
              height: 10px !important;
              border-radius: 50%;
              margin: 0 5px;
            }
           
            .carousel-indicators .active {
              // background-color: #ed4242 !important;
              opacity: 0.7;
            }
          `}
        </style>
      </Head>
 
      <CommonLayout parent="Home" title="About Us" showSearchIcon={false} showMenuIcon={false} location={false}>
      <h6 className='text-center border-bottom pb-4 mb-4' style={{ fontSize: '22px', marginTop: '2%' }}>About Us</h6>
        <section className="p-3 pb-5 mb-5 d-flex flex-column align-items-center">
          <Carousel indicators={false} interval={60000} style={{ zIndex: 1, width: "90%", height: "auto"}}>
            {banners?.map((imagePath, key) => (
              <Carousel.Item key={key}>
                <Image
                  src={imagePath.default || imagePath}
                  alt={`Promotional Banner-image ${key + 1}`}
                  style={{ objectFit: "cover", width: "100%", height: "auto" }}
                  className="responsive-image"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </section>
      </CommonLayout>
    </>
  );
}
 
export default About_Us;