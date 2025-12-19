import React, { useEffect, useContext, useState } from "react";
import CommonLayout from "../../../components/shop/common-layout";
import Head from "next/head";
import { fetchDiscountData } from "../../../AxiosCalls/offersService/getOffers";
import { AppContext } from "../../../pages/_app";
import { generateSlug } from "../../../GlobalFunctions/OthersGlobalfunctions";
import { useRouter } from "next/router";
import SwipeableOffersSection from "../../../components/common/SwipeableOffersSection";
import OfferPageCard from "../../../components/common/OfferPageCard";
import OfferPageMeta from "../../../components/common/OfferPageMeta";

function Offers() {
  const { userId } = useContext(AppContext);
  const [offersData, setOffersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchDiscountData(userId);
        console.log("Offers Data:", data);
        setOffersData(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  // const clickProductDetail = (offer) => {
  //   if (offer.category_id === 3) {
  //     router.push({
  //       pathname: `/product-details/lifestyle/${generateSlug(offer?.origin_data?.title)}`,
  //       query: {
  //         pID: offer?.origin_product_id
  //       }
  //     });
  //   } else if (offer.category_id === 1) {
  //     router.push({
  //       pathname: `/product-details/essential/${generateSlug(offer?.origin_data?.title)}`,
  //       query: {
  //           pID: offer?.origin_product_id
  //       }
  //     })
  //   } else if (offer.category_id === 2) {
  //     router.push({
  //       pathname: `/product-details/nonessential/${generateSlug(offer?.origin_data?.title)}`,
  //       query: {
  //           pID: offer?.origin_product_id
  //       }
  //     })
  //   } else if (offer.category_id === 5) {
  //     router.push({
  //       pathname: `/product-details/education/${generateSlug(offer?.origin_data?.title)}`,
  //       query: {
  //           pID: offer?.origin_product_id
  //       }
  //     })
  //   } else if (offer.category_id === 4) {

  //     console.log("offer",offer)
  //     console.log("offer.category_id",offer?.origin_data?.title)
  //     router.push({
  //       pathname: `/product-details/hotels/${generateSlug(offer?.origin_data?.title)}`,
  //       query: {
  //           pID: offer?.origin_product_id,
  //         provider: "hotelAhs",
  //         // adultCount: hotelSearchCustomerData?.NoOfAdults,
  //         // childCount: hotelSearchCustomerData?.NoOfChild,
  //         // checkIn: hotelSearchCustomerData?.CheckInDate,
  //         // checkOut: hotelSearchCustomerData?.CheckOutDate
  //       }
  //     })
  //   };
  // }

  const clickProductDetail = (offer) => {
  const baseUrl = window.location.origin;
  
  if (offer.category_id === 3) {
    const url = `${baseUrl}/product-details/lifestyle/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}`;
    window.open(url, '_blank');
  } else if (offer.category_id === 1) {
    const url = `${baseUrl}/product-details/essential/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}`;
    window.open(url, '_blank');
  } else if (offer.category_id === 2) {
    const url = `${baseUrl}/product-details/nonessential/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}`;
    window.open(url, '_blank');
  } else if (offer.category_id === 5) {
    const url = `${baseUrl}/product-details/education/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}`;
    window.open(url, '_blank');
  } else if (offer.category_id === 4) {
    console.log("offer", offer);
    console.log("offer.category_id", offer?.origin_data?.title);
    const url = `${baseUrl}/product-details/hotels/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}&provider=hotelAhs`;
    window.open(url, '_blank');
  }
};

  // Unique loading component with animated elements
  const UniqueSkeletonCard = () => (
    <div className="unique-offer-card skeleton-card">
      <div className="card-glow"></div>
      <div className="skeleton-image">
        <div className="skeleton-shimmer"></div>
      </div>
      <div className="unique-card-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  // Creative empty state component
  const CreativeEmptyState = () => (
    <div className="creative-empty-state">
      <div className="empty-animation">
        <div className="gift-box">
          <div className="gift-lid"></div>
          <div className="gift-body"></div>
          <div className="gift-ribbon-v"></div>
          <div className="gift-ribbon-h"></div>
        </div>
        <div className="floating-hearts">
          <span className="heart">💎</span>
          <span className="heart">✨</span>
          <span className="heart">🎁</span>
          <span className="heart">💫</span>
        </div>
      </div>
      <h3 className="empty-title">No Magical Offers Yet!</h3>
      <p className="empty-description">Our deal wizards are crafting something spectacular for you.</p>
      <div className="coming-soon-badge">Coming Soon</div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Exclusive Offers & Magical Deals</title>
      </Head>
      <CommonLayout parent="Home" title="Offers & Discount">
        <div className="unique-offers-container">
          

          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>

          {/* <div className="hero-section">
            <h1 className="hero-title">Exclusive Deals</h1>
            <p className="hero-subtitle">Discover extraordinary offers crafted just for you</p>
          </div> */}

          {/* New AutoCarousel Section */}

          {/* Interactive Offers Meta Section */}
          <div className="meta-offers-section">
            <OfferPageMeta />
          </div>

          {/* Enhanced Offer Cards Grid */}
          {/* <div className="enhanced-cards-section">
            <div className="section-header">
              <h2 className="section-title">Featured Deals</h2>
              <p className="section-subtitle">Discover our most popular offers with stunning visuals</p>
            </div>
            
            <div className="enhanced-cards-grid">
              {offersData.slice(0, 6).map((offer, index) => (
                <OfferPageCard
                  key={index}
                  offerData={offer}
                  isTwoColumn={true}
                  themeColors={{
                    primary: "#ed4242",
                    secondary: "#ffe6e7",
                    text: "#333",
                  }}
                />
              ))}
            </div>
          </div> */}

          {/* Vertical Cards Section */}
          {/* {offersData.length > 6 && (
            <div className="vertical-cards-section">
              <div className="section-header">
                <h2 className="section-title">More Amazing Offers</h2>
                <p className="section-subtitle">Don't miss these limited-time deals</p>
              </div>
              
              <div className="vertical-cards-grid">
                {offersData.slice(6, 12).map((offer, index) => (
                  <OfferPageCard
                    key={index + 6}
                    offerData={offer}
                    isVertical={true}
                    themeColors={{
                      primary: "#ed4242",
                      secondary: "#ffe6e7",
                      text: "#333",
                    }}
                  />
                ))}
              </div>
            </div>
          )} */}

          {/* Premium Large Cards Section */}
          {/* {offersData.length > 12 && (
            <div className="premium-cards-section">
              <div className="section-header">
                <h2 className="section-title">Premium Experiences</h2>
                <p className="section-subtitle">Exclusive luxury offers just for you</p>
              </div>
              
              <div className="premium-cards-grid">
                {offersData.slice(12, 16).map((offer, index) => (
                  <OfferPageCard
                    key={index + 12}
                    offerData={offer}
                    themeColors={{
                      primary: "#ed4242",
                      secondary: "#ffe6e7",
                      text: "#333",
                    }}
                  />
                ))}
              </div>
            </div>
          )} */}

          {/* {loading ? (
            <div className="offers-grid">
              {[...Array(6)].map((_, index) => (
                <UniqueSkeletonCard key={index} />
              ))}
            </div>
          ) : offersData.length > 0 ? (
            <div className="offers-grid">
              {offersData.map((offer, index) => (
                <div key={index} className="unique-offer-card">
                  <div className="unique-card-image">
                    <img 
                      src={offer.origin_data?.image?.split(',')[0] || "https://via.placeholder.com/300"} 
                      alt={offer.origin_data?.title || "Offer Image"} 
                    />
                    <div className="creative-badge">
                      Offer
                    </div>
                  </div>
                  <div className="unique-card-content">
                    <h5 className="creative-title">
                      {offer.origin_data?.title || "Special Offer"}
                    </h5>
                    <p className="product-description">
                      Limited time offer - Don't miss out on this amazing deal!
                    </p>
                    <div className="color-options">
                      <div className="color-dot orange"></div>
                      <div className="color-dot blue"></div>
                      <div className="color-dot yellow"></div>
                    </div>
                    <div className="price-section">
                      <div className="price">Special Price</div>
                      <button 
                        onClick={() => clickProductDetail(offer)} 
                        className="add-to-cart-btn"
                      >
                        View Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CreativeEmptyState />
          )} */}
        </div>
      </CommonLayout>
    </>
  );
}

export default Offers;