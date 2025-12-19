import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';

const OfferPageCard = ({ 
  offerData, 
  onPress, 
  onShare, 
  isVertical = false, 
  isTwoColumn = false, 
  themeColors = { 
    primary: "#ed4242", 
    secondary: "#ffe6e7", 
    text: "#333", 
  },
}) => {
  const router = useRouter();
  const [dominantColor, setDominantColor] = useState(themeColors.primary);
  const [isHovered, setIsHovered] = useState(false);
  
  const darkColors = [
    // Blacks & Grays
    "#0a0a0a", "#1a1a1a", "#2a2a2a", "#1c1c1c", "#0d0d0d",
    // Dark Blues
    "#0f1419", "#1e2a3a", "#2d1b69", "#1a237e", "#0d47a1", "#1565c0", "#0277bd",
    // Dark Purples
    "#240046", "#3c096c", "#5a189a", "#7b1fa2", "#8e24aa", "#9c27b0", "#ad1457",
    // Dark Reds
    "#4a0e0e", "#8b0000", "#c62828", "#d32f2f", "#e53935", "#bf360c",
    // Dark Oranges
    "#3e2723", "#5d4037", "#6d4c41", "#8d6e63", "#bf360c", "#f4511e", "#ff5722",
    // Dark Greens
    "#1b5e20", "#2e7d32", "#388e3c", "#43a047", "#4caf50", "#66bb6a", "#0d4f3c",
    // Dark Teals
    "#004d40", "#00695c", "#00796b", "#00897b", "#26a69a", "#4db6ac", "#006064",
    // Dark Blues & Metal
    "#263238", "#37474f", "#455a64", "#546e7a", "#607d8b", "#78909c", "#212121"
  ];

  // Function to get random dark color for two-column layout
  const getRandomDarkColor = () => {
    const randomIndex = Math.floor(Math.random() * darkColors.length);
    return darkColors[randomIndex];
  };

  // Set initial color based on layout
  const twoColumnColor = useMemo(
    () => (isTwoColumn ? getRandomDarkColor() : null),
    [isTwoColumn, offerData?.id || Math.random()]
  );

  const nextWeekDate = moment().add(7, "days").format("DD/MM/YYYY");
  
  const imageUri = 
    offerData?.origin_data?.image?.split(",")[0] || 
    offerData?.additional_data?.image?.split(",")?.[0] ||
    "https://via.placeholder.com/300";

  // Helper function to add opacity to hex color
  const addOpacityToColor = (color, opacity) => {
    // Convert hex to rgba if needed
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  };

  // Extract color from image using canvas (web alternative to ColorThief)
  useEffect(() => {
    const extractImageColors = async () => {
      if (imageUri && !isTwoColumn) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              canvas.width = img.width;
              canvas.height = img.height;
              
              ctx.drawImage(img, 0, 0);
              
              // Sample pixels to get dominant color
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              let r = 0, g = 0, b = 0;
              const sampleSize = 1000; // Sample every nth pixel
              let count = 0;
              
              for (let i = 0; i < data.length; i += 4 * sampleSize) {
                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
              }
              
              r = Math.floor(r / count);
              g = Math.floor(g / count);
              b = Math.floor(b / count);
              
              // Make the color darker for better contrast
              r = Math.floor(r * 0.7);
              g = Math.floor(g * 0.7);
              b = Math.floor(b * 0.7);
              
              const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
              setDominantColor(hexColor);
            } catch (error) {
              console.log("Color extraction failed:", error);
              setDominantColor(themeColors.primary);
            }
          };
          
          img.onerror = () => {
            setDominantColor(themeColors.primary);
          };
          
          img.src = imageUri;
        } catch (error) {
          console.log("Color extraction failed:", error);
          setDominantColor(themeColors.primary);
        }
      }
    };

    extractImageColors();
  }, [imageUri, themeColors.primary, isTwoColumn]);

  const handleCardClick = () => {
    const baseUrl = window.location.origin;
    
    if (offerData?.category_id === 3) {
      const url = `${baseUrl}/product-details/lifestyle/${generateSlug(offerData?.origin_data?.title)}?pID=${offerData?.origin_product_id}`;
      window.open(url, '_blank');
    } else if (offerData?.category_id === 1) {
      const url = `${baseUrl}/product-details/essential/${generateSlug(offerData?.origin_data?.title)}?pID=${offerData?.origin_product_id}`;
      window.open(url, '_blank');
    } else if (offerData?.category_id === 2) {
      const url = `${baseUrl}/product-details/nonessential/${generateSlug(offerData?.origin_data?.title)}?pID=${offerData?.origin_product_id}`;
      window.open(url, '_blank');
    } else if (offerData?.category_id === 5) {
      const url = `${baseUrl}/product-details/education/${generateSlug(offerData?.origin_data?.title)}?pID=${offerData?.origin_product_id}`;
      window.open(url, '_blank');
    } else if (offerData?.category_id === 4) {
      const url = `${baseUrl}/product-details/hotels/${generateSlug(offerData?.origin_data?.title)}?pID=${offerData?.origin_product_id}&provider=hotelAhs`;
      window.open(url, '_blank');
    }
  };

  const discountEndDate = offerData?.discount_end_date;
  const currentDate = new Date();
  const endDate = new Date(discountEndDate);

  // Don't render expired offers
  if (endDate < currentDate) {
    return null;
  }

  const getDaysRemaining = () => {
    const timeDiff = endDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const daysRemaining = getDaysRemaining();
  const isUrgent = daysRemaining <= 3;

  // Get the base color for gradients
  const baseColor = isTwoColumn ? twoColumnColor : dominantColor;

  const getCategoryName = () => {
    switch (offerData?.category_id) {
      case 1: return "Essentials";
      case 2: return "Non Essentials";
      case 3: return "Lifestyle";
      case 4: return "Hotels";
      case 5: return "Education";
      default: return "Offer";
    }
  };

  return (
    <>
      <style jsx>{`
        .offer-card-container {
          width: ${isTwoColumn ? '100%' : isVertical ? '100%' : '250px'};
          height: ${isTwoColumn ? '180px' : isVertical ? '120px' : '400px'};
          border-radius: ${isTwoColumn ? '12px' : isVertical ? '16px' : '28px'};
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          background: white;
          transform: ${isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'};
        }

        .offer-card-container:hover {
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .image-container {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
        }

        .offer-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .offer-card-container:hover .offer-image {
          transform: scale(1.1);
        }

        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 3s infinite;
          transform: skewX(-20deg);
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .bottom-gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
        //   background: linear-gradient(
        //     transparent,
        //     ${addOpacityToColor(baseColor, 0.7)},
        //     ${addOpacityToColor(baseColor, 0.9)}
        //   );
          z-index: 1;
        }

        .gradient-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70%;
        //   background: linear-gradient(
        //     transparent,
        //     ${addOpacityToColor(baseColor, 0.7)},
        //     ${addOpacityToColor(baseColor, 0.9)}
        //   );
          display: flex;
          align-items: flex-end;
          z-index: 2;
        }

        .content-overlay {
          padding: ${isTwoColumn ? '8px' : isVertical ? '12px' : '24px'};
          padding-bottom: ${isTwoColumn ? '6px' : isVertical ? '8px' : '20px'};
          padding-top: ${isTwoColumn ? '20px' : isVertical ? '16px' : '40px'};
          width: 100%;
        }

        .urgency-container {
          position: absolute;
          top: ${isTwoColumn ? '-40px' : '-60px'};
          right: 0;
        }

        .urgency-badge {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          background: linear-gradient(135deg, #ff4757, #ff3838);
          border-radius: 20px;
          box-shadow: 0 4px 12px rgba(255, 71, 87, 0.4);
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .urgency-icon {
          color: white;
          font-size: 12px;
          margin-right: 4px;
        }

        .urgency-text {
          color: white;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .offer-title {
          font-size: ${isTwoColumn ? '14px' : isVertical ? '16px' : '20px'};
          font-weight: 800;
          color: white;
          margin-bottom: ${isTwoColumn ? '4px' : '8px'};
          line-height: ${isTwoColumn ? '16px' : isVertical ? '20px' : '28px'};
          letter-spacing: -0.5px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .details-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .location-container {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .location-icon {
          color: rgba(255, 255, 255, 0.9);
          font-size: ${isTwoColumn ? '12px' : '14px'};
          margin-right: 6px;
        }

        .location-text {
          color: rgba(255, 255, 255, 0.95);
          font-size: ${isTwoColumn ? '10px' : '13px'};
          font-weight: ${isTwoColumn ? '500' : '600'};
        }

        .category-badge-top-left {
          position: absolute;
          top: 10px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 12px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          z-index: 3;
        }

        .category-text {
          color: white;
          font-size: ${isTwoColumn ? '9px' : '11px'};
          font-weight: ${isTwoColumn ? '600' : '700'};
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .glass-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(1px);
          pointer-events: none;
        }

        /* Fire icon for urgency */
        .fire-icon::before {
          content: '🔥';
        }

        /* Clock icon */
        .clock-icon::before {
          content: '⏰';
        }
      `}</style>

      <div 
        className="offer-card-container"
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="image-container">
          <img 
            src={imageUri}
            alt={offerData?.origin_data?.title || "Offer Image"}
            className="offer-image"
            loading="lazy"
          />

          {/* Shimmer Effect */}
          <div className="shimmer-overlay" />

          {/* Bottom Gradient Overlay */}
          <div className="bottom-gradient-overlay" />

          {/* Enhanced Content Overlay */}
          <div className="gradient-overlay">
            <div className="content-overlay">
              {/* Urgency Indicator */}
              {isUrgent && (
                <div className="urgency-container">
                  <div className="urgency-badge">
                    <span className="urgency-icon fire-icon"></span>
                    <span className="urgency-text">
                      {daysRemaining === 1 ? "LAST DAY" : `${daysRemaining} DAYS LEFT`}
                    </span>
                  </div>
                </div>
              )}

              <h3 className="offer-title">
                {offerData?.origin_data?.title || "Amazing Offer"}
              </h3>

              <div className="details-container">
                <div className="location-container">
                  <span className="location-icon clock-icon"></span>
                  <span className="location-text">
                    Until {moment(offerData?.discount_end_date).format("MMM DD")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Badge - Top Left */}
          <div className="category-badge-top-left">
            <span className="category-text">
              {getCategoryName()}
            </span>
          </div>

          {/* Glass morphism overlay */}
          <div className="glass-overlay" />
        </div>
      </div>
    </>
  );
};

export default OfferPageCard;