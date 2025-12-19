import React, { useState, useRef, useEffect } from 'react';
import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';

const SwipeableOffersSection = ({ offersData, onOfferClick, loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [cardWidth, setCardWidth] = useState(300);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  // Calculate how many cards to show based on screen width
  const getCardsToShow = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1200) return 4;
      if (width >= 768) return 3;
      if (width >= 480) return 2;
      return 1;
    }
    return 4;
  };

  const [cardsToShow, setCardsToShow] = useState(getCardsToShow());

  useEffect(() => {
    const handleResize = () => {
      setCardsToShow(getCardsToShow());
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        setCardWidth(cardRect.width + 16); // Include gap
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, offersData.length - cardsToShow);

  const goToPrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  // Touch/Mouse handlers
  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    const threshold = cardWidth * 0.3;
    
    if (translateX > threshold && currentIndex > 0) {
      goToPrevious();
    } else if (translateX < -threshold && currentIndex < maxIndex) {
      goToNext();
    }
    
    setTranslateX(0);
  };

  // Mouse events
  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Add global mouse events
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, startX]);

  const handleOfferClick = (offer) => {
    if (isDragging) return; // Prevent click during drag
    
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
      const url = `${baseUrl}/product-details/hotels/${generateSlug(offer?.origin_data?.title)}?pID=${offer?.origin_product_id}&provider=hotelAhs`;
      window.open(url, '_blank');
    }
  };

  // Loading skeleton component
  const SkeletonCard = () => (
    <div className="offer-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="offer-card-content">
        <div className="skeleton-line skeleton-title"></div>
        <div className="skeleton-line skeleton-text"></div>
        <div className="skeleton-button"></div>
      </div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="offers-empty-state">
      <div className="empty-icon">🎁</div>
      <h3>No Offers Available</h3>
      <p>Check back soon for exciting deals!</p>
    </div>
  );

  if (loading) {
    return (
      <div className="swipeable-offers-section">
        <style jsx>{`
          .swipeable-offers-section {
            padding: 24px 16px;
            background: #f8f9fa;
            border-radius: 12px;
            margin: 16px 0;
          }

          .offers-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .offers-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #2c3e50;
            margin: 0;
          }

          .offers-carousel-container {
            position: relative;
            overflow: hidden;
          }

          .offers-track {
            display: flex;
            gap: 16px;
            transition: transform 0.3s ease;
          }

          .offer-card {
            flex-shrink: 0;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            width: calc((100% - 48px) / 4);
          }

          .skeleton-card {
            animation: pulse 1.5s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          .skeleton-image {
            height: 180px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }

          .offer-card-content {
            padding: 16px;
          }

          .skeleton-line {
            height: 12px;
            background: #e0e0e0;
            border-radius: 6px;
            margin-bottom: 8px;
          }

          .skeleton-title {
            height: 16px;
            width: 80%;
          }

          .skeleton-text {
            width: 60%;
          }

          .skeleton-button {
            height: 32px;
            width: 100px;
            margin-top: 12px;
          }

          @media (max-width: 1200px) {
            .offer-card {
              width: calc((100% - 32px) / 3);
            }
          }

          @media (max-width: 768px) {
            .offer-card {
              width: calc((100% - 16px) / 2);
            }
          }

          @media (max-width: 480px) {
            .offer-card {
              width: 100%;
            }
          }
        `}</style>

        <div className="offers-header">
          <h2 className="offers-title">Special Offers</h2>
        </div>

        <div className="offers-carousel-container">
          <div className="offers-track">
            {[...Array(4)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!offersData || offersData.length === 0) {
    return (
      <div className="swipeable-offers-section">
        <style jsx>{`
          .swipeable-offers-section {
            padding: 24px 16px;
            background: #f8f9fa;
            border-radius: 12px;
            margin: 16px 0;
          }

          .offers-empty-state {
            text-align: center;
            padding: 40px 20px;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 16px;
          }

          .offers-empty-state h3 {
            color: #2c3e50;
            margin-bottom: 8px;
          }

          .offers-empty-state p {
            color: #7f8c8d;
          }
        `}</style>

        <div className="offers-header">
          <h2 className="offers-title">Special Offers</h2>
        </div>

        <EmptyState />
      </div>
    );
  }

  return (
    <div className="swipeable-offers-section">
      <style jsx>{`
        .swipeable-offers-section {
          padding: 24px 16px;
          background: #f8f9fa;
          border-radius: 12px;
          margin: 16px 0;
          user-select: none;
        }

        .offers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .offers-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c3e50;
          margin: 0;
        }

        .nav-buttons {
          display: flex;
          gap: 8px;
        }

        .nav-button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: #ffffff;
          color: #2c3e50;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .nav-button:hover:not(:disabled) {
          background: #ed4242;
          color: white;
          transform: scale(1.05);
        }

        .nav-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .offers-carousel-container {
          position: relative;
          overflow: hidden;
          touch-action: pan-y;
        }

        .offers-track {
          display: flex;
          gap: 16px;
          transition: transform ${isDragging ? '0s' : '0.3s'} ease;
          transform: translateX(calc(-${currentIndex} * (${cardWidth}px) + ${isDragging ? translateX : 0}px));
        }

        .offer-card {
          flex-shrink: 0;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          width: calc((100% - 48px) / 4);
        }

        .offer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .offer-card-image {
          position: relative;
          height: 180px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .offer-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .offer-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ff4757;
          color: white;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          border-radius: 4px;
          z-index: 2;
        }

        .offer-card-content {
          padding: 16px;
        }

        .offer-title {
          font-size: 1rem;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .offer-description {
          font-size: 0.85rem;
          color: #7f8c8d;
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .offer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .view-deal-btn {
          background: #ed4242;
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-deal-btn:hover {
          background: #d63031;
        }

        .dots-indicator {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 20px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ddd;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dot.active {
          background: #ed4242;
        }

        @media (max-width: 1200px) {
          .offer-card {
            width: calc((100% - 32px) / 3);
          }
          
          .nav-buttons {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .offer-card {
            width: calc((100% - 16px) / 2);
          }
          
          .offers-title {
            font-size: 1.3rem;
          }
          
          .offer-card-image {
            height: 150px;
          }
        }

        @media (max-width: 480px) {
          .swipeable-offers-section {
            padding: 16px 8px;
            margin: 8px 0;
          }
          
          .offer-card {
            width: calc(100% - 32px);
            margin: 0 16px;
          }
          
          .offers-title {
            font-size: 1.2rem;
          }
          
          .offer-card-image {
            height: 140px;
          }
          
          .offer-card-content {
            padding: 12px;
          }
        }
      `}</style>

      <div className="offers-header">
        {/* <h2 className="offers-title">Special Offers</h2> */}
        {offersData.length > cardsToShow && (
          <div className="nav-buttons">
            <button 
              className="nav-button"
              onClick={goToPrevious}
              disabled={currentIndex === 0}
            >
              ‹
            </button>
            <button 
              className="nav-button"
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <div className="offers-carousel-container">
        <div 
          ref={containerRef}
          className="offers-track"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {offersData.map((offer, index) => (
            <div 
              key={index} 
              ref={index === 0 ? cardRef : null}
              className="offer-card"
              onClick={() => handleOfferClick(offer)}
            >
              <div className="offer-card-image">
                <img 
                  src={offer.origin_data?.image?.split(',')[0] || "https://via.placeholder.com/300"} 
                  alt={offer.origin_data?.title || "Offer Image"}
                  draggable={false}
                />
                <div className="offer-badge">Offer</div>
              </div>
              <div className="offer-card-content">
                <h5 className="offer-title">
                  {offer.origin_data?.title || "Special Offer"}
                </h5>
                <p className="offer-description">
                  Limited time offer - Don't miss out on this amazing deal!
                </p>
                <div className="offer-footer">
                  <button className="view-deal-btn">
                    View Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {offersData.length > cardsToShow && (
        <div className="dots-indicator">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <div
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SwipeableOffersSection;