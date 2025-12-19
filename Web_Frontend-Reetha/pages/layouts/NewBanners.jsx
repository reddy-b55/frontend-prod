import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../components/NewHomeComponents/home.module.css';
import ModalBase from '../../components/common/Modals/ModalBase';
import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';
import { ca } from 'date-fns/locale';

const NewBanners = () => {
  const [currentBannerSlide, setCurrentBannerSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  // Banner slider functions
  const nextBannerSlide = (e) => {
    e?.stopPropagation(); // Prevent banner click when clicking navigation
    setCurrentBannerSlide((prev) => {
      const next = (prev + 1) % (banners.length || 1);
      console.log('Next slide:', next, 'Total slides:', banners.length);
      return next;
    });
  };

  const prevBannerSlide = (e) => {
    e?.stopPropagation(); // Prevent banner click when clicking navigation
    setCurrentBannerSlide((prev) => {
      const previous = (prev - 1 + (banners.length || 1)) % (banners.length || 1);
      console.log('Previous slide:', previous, 'Total slides:', banners.length);
      return previous;
    });
  };

  const goToBannerSlide = (index, e) => {
    e?.stopPropagation(); // Prevent banner click when clicking dots
    console.log('Going to slide:', index);
    setCurrentBannerSlide(index);
  };

  // Handle banner click
  const handleBannerClick = (banner) => {
    console.log('Banner clicked:', banner);
    console.log('Banner dataset:', banner.dataSet);
    console.log('Banner route:', banner.route);
    console.log('Banner details:', banner.details);
    
    // Set selected banner and open modal
    setSelectedBanner(banner);
    setIsModalOpen(true);
    
    // Parse the dataset to get the actual data
    try {
      const parsedData = JSON.parse(banner.dataSet);
      console.log('Parsed dataset:', parsedData);
    } catch (error) {
      console.error('Error parsing dataset:', error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  // Handle view details button click
  const handleViewDetails = (banner) => {
    console.log('View Details clicked for banner:', banner);
    console.log('Banner route:', banner.route);
    console.log('Banner dataset:', banner.dataSet);
    console.log('Banner details:', banner.details);
    
    // Parse the dataset to get the actual data
    try {
      const parsedData = JSON.parse(banner.dataSet);
      console.log('Parsed dataset for navigation:', parsedData);
      
      // Here you can add navigation logic based on the banner route
      // For example:
      // if (banner.route === 'FlightSearch') {
      //   router.push('/flights', { state: parsedData });
      // } else if (banner.route === 'LifestyleDetail') {
      //   router.push(`/lifestyle/${parsedData.id}`, { state: parsedData });
      // }
      
    } catch (error) {
      console.error('Error parsing dataset for navigation:', error);
    }
    
    // Close modal after handling the action
    handleModalClose();
  };



  // Fetch banners function
  const getBanners = async () => {
    try {
      // Uncomment this when you want to use actual API
      const response = await axios.get(`getBanners/homePageMeta/Web`);
      // setBanners(response.data.banners);
      
      // For now, using static data
      // console.log("banners response", response.data.banners);
      // setBanners(dataset.banners);
      setBanners(response.data.banners);
    } catch (error) {
      console.error("Error fetching banners", error);
      // Fallback to static data in case of error
      setBanners(dataset.banners);
    }
  };

  // Auto-slide effect for banner
  useEffect(() => {
    console.log('Current banner slide:', currentBannerSlide);
    getBanners();
  }, []);

  // Update banner slider when banners change
  useEffect(() => {
    if (banners.length > 0) {
      console.log('Banners loaded:', banners.length);
      // Reset slide to 0 if current slide is beyond the available banners
      if (currentBannerSlide >= banners.length) {
        setCurrentBannerSlide(0);
      }
    }
  }, [banners.length, currentBannerSlide]);

 const openInNewWindow = (pathname, query = {}) => {
    const queryString = new URLSearchParams(query).toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.open(url, '_blank');
  };

  // Auto-slide functionality
  useEffect(() => {
    if (banners.length > 0) {
      const interval = setInterval(() => {
        setCurrentBannerSlide((prev) => (prev + 1) % banners.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const managerProductNavigation = (banner) => {
    console.log('Navigating based on banner:', banner);
    // return
    const parsedData = JSON.parse(banner.dataSet);
    switch(banner.route) {
        case 'LifestyleDetail':
            openInNewWindow(`/product-details/lifestyle/${generateSlug(banner?.product_name)}`,
        {
          pID: parsedData?.id,
          viewStatus: 'checkavalibility'
        }
      );
      case 'FlightSearch':
        openInNewWindow(`/shop/newFlights`)
      break;
    //   case 'HotelDetails':

    }
  }

  return (
    <>
      <style jsx>{`
        .newBannerDots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        
        .newBannerDot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        
        .newBannerDot.active {
          background-color: #ffffff;
          transform: scale(1.2);
        }
        
        .newBannerDot:hover {
          background-color: rgba(255, 255, 255, 0.8);
        }
        
        /* Responsive dot sizes */
        @media (max-width: 768px) {
          .newBannerDot {
            width: 6px;
            height: 6px;
          }
          
          .newBannerDot.active {
            transform: scale(1.3);
          }
        }
      `}</style>

      <section className={styles.hero} onClick={()=>handleBannerClick(banners[currentBannerSlide])}>
        <div className={styles.heroSlider} style={{  overflow: 'hidden' }}>
          {/* Banner Image Slider */}
          <div className={styles.bannerSlider} >
            <div
              className={styles.bannerContainer}
              style={{
                transform: `translateX(-${currentBannerSlide * (100 / banners.length)}%)`,
                width: `${(banners.length || 1) * 100}%`
              }}
              
            >
              {/* Show loading or banners */}
              {banners.length > 0 ? (
                banners.map((banner, index) => (
                  <div
                    key={index}
                    className={styles.bannerSlide}
                    style={{ 
                      width: `${100 / banners.length}%`,
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={banner.image || banner.src}
                      alt={banner.details?.title || banner.alt || `Banner ${index + 1}`}
                      className={styles.bannerImage}
                      // style={{ borderRadius: '20px' }}
                    />
                  </div>
                ))
              ) : (
                <div
                  className={styles.bannerSlide}
                  style={{ 
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f0f0f0',
                    minHeight: '200px'
                  }}
                >
                  <p>Loading banners...</p>
                </div>
              )}
            </div>

            {/* Slider Navigation */}
            <button
              className={`${styles.sliderBtn} ${styles.prevBtn}`}
              onClick={prevBannerSlide}
              aria-label="Previous slide"
              disabled={banners.length === 0}
            >
              &#8249;
            </button>
            <button
              className={`${styles.sliderBtn} ${styles.nextBtn}`}
              onClick={nextBannerSlide}
              aria-label="Next slide"
              disabled={banners.length === 0}
            >
              &#8250;
            </button>

            {/* Slider Dots - Using internal CSS */}
            {banners.length > 0 && (
              <div className="newBannerDots">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`newBannerDot ${currentBannerSlide === index ? 'active' : ''}`}
                    onClick={(e) => goToBannerSlide(index, e)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Hero Content Overlay */}
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              {/* You can add any overlay content here */}
              {/* <div className={styles.heroBadge}>ONLY IN 4.04-10.04</div> */}
              {/* <h1 className={styles.heroTitle}>
                WEEKEN<br />SALE
              </h1> */}
              {/* <p className={styles.heroSubtitle}>-20% CUT FOR EVERYTHING*</p>
              <button className={styles.heroButton}>Get Yours now →</button> */}
            </div>
          </div>
        </div>

        {/* Banner Details Modal */}
        <ModalBase 
          isOpen={isModalOpen} 
          toggle={handleModalClose} 
          // title={selectedBanner?.details?.title || "Banner Details"} 
          size='md'
          extraMargin={false}
        >
          {selectedBanner && (
            <div style={{ textAlign: 'center'}}>
              <img
                src={selectedBanner.image || selectedBanner.src}
                alt={selectedBanner.details?.title || 'Banner'}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  height: 'auto',
                  // borderRadius: '8px',
                  marginBottom: '20px'
                }}
              />
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#333',fontWeight: '700' }}>
                  {selectedBanner.details?.title}
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666', marginBottom: '25px' }}>
                  {selectedBanner.details?.description}
                </p>
                
                {/* View Details Button */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button
                    onClick={() => managerProductNavigation(selectedBanner)}
                    style={{
                      backgroundColor: '#f35858ff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      minWidth: '150px'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ed4242'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f35858ff'}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModalBase>
      </section>
    </>
  );
};

export default NewBanners;