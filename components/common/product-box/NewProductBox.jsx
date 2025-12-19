import { useRouter } from "next/router";
import { Button, Col, Media, Modal, Row } from "reactstrap";
import React, { useContext, useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Cookies from 'js-cookie';
import { AppContext } from "../../../pages/_app";
import { Rating } from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { generateSlug } from "../../../GlobalFunctions/OthersGlobalfunctions";
import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
import ProductInfoModal from "./ProductInfoModal";

const ProductItem = ({ 
  product, 
  productImage, 
  title, 
  productcurrency, 
  provider, 
  hotelCode, 
  adultRate, 
  childRate, 
  rating, 
  description, 
  productstype, 
  mrp, 
  hotelSearchCustomerData, 
  hotelAddress, 
  packageRate, 
  related = false, 
  vendorRelated = false, 
  cart = null 
}) => {
  const router = useRouter();
  const { baseCurrencyValue } = useContext(AppContext);
  const [isHovered, setIsHovered] = useState(false);
  const [modal, setModal] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    try {
      const images = productImage?.split(',');
      setCurrentImage(images[0]);
    } catch (error) {
      console.error("Error setting product image:", error);
    }
  }, [productImage]);

  const toggle = () => setModal(!modal);

  const clickProductDetail = () => {
    if (productstype === 'lifestyle') {
      const productProvider = product?.provider;
      if (productProvider === "globaltix") {
        router.push({
          pathname: `/product-details/lifestyle/v3/${generateSlug(title)}`,
          query: {
            pID: product.lifestyle_id,
            viewStatus: 'checkavalibility',
            productImage: productImage,
          }
        });
      } else if (productProvider === "cebu") {
        router.push({
          pathname: `/product-details/lifestyle/v4/${generateSlug(title)}`,
          query: {
            pID: product.lifestyle_id,
            viewStatus: 'checkavalibility',
            productImage: productImage,
          }
        });
      } else if (productProvider !== "bridgify") {
        router.push({
          pathname: `/product-details/lifestyle/${generateSlug(title)}`,
          query: {
            pID: product.lifestyle_id,
            viewStatus: 'checkavalibility'
          }
        });
      } else {
        router.push({
          pathname: `/product-details/lifestyle/v2/${generateSlug(title)}`,
          query: {
            pID: product?.lifestyle_id
          }
        });
      }
    } else if (productstype === 'essential') {
      router.push({
        pathname: `/product-details/essential/${generateSlug(title)}`,
        query: {
          pID: product.id
        }
      });
    } else if (productstype === 'nonessential') {
      router.push({
        pathname: `/product-details/nonessential/${generateSlug(title)}`,
        query: {
          pID: product.id
        }
      });
    } else if (productstype === 'education') {
      router.push({
        pathname: `/product-details/education/${generateSlug(title)}`,
        query: {
          pID: product.education_id
        }
      });
    } else if (productstype === 'hotels') {
      Cookies.set('productData', JSON.stringify(product), { expires: 1 });
      router.push({
        pathname: `/product-details/hotels/${generateSlug(title)}`,
        query: {
          pID: hotelCode,
          provider: provider,
          bookbydays: product?.bookByDays,
        }
      });
    } else if (productstype === 'transport') {
      router.push({
        pathname: `/product-details/transport/${generateSlug(title)}`,
        query: {
          cart: JSON.stringify(cart),
          slug: generateSlug(title),
          selectedVehicle: JSON.stringify(product)
        }
      });
    }
  };

  const PriceDisplay = ({ price, label, strikeThrough = false, small = false }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      marginTop: small ? '4px' : '0'
    }}>
      <div style={{
        fontSize: small ? '16px' : '18px',
        fontWeight: '600',
        color: '#2a2a2a',
        textDecoration: strikeThrough ? 'line-through' : 'none',
        opacity: strikeThrough ? 0.7 : 1
      }}>
        {CurrencyConverter(productcurrency, price, baseCurrencyValue)}
      </div>
      {label && <div style={{
        fontSize: '12px',
        color: '#666666'
      }}>{label}</div>}
    </div>
  );

  const renderProductContent = () => {
    switch (productstype) {
      case 'lifestyle':
        return (
          <>
            {adultRate && (
              <PriceDisplay 
                price={adultRate} 
                label={Number(adultRate) === Number(childRate) ? "Adults & Children rate" : "Adult rate"} 
              />
            )}
            {childRate && Number(adultRate) !== Number(childRate) && (
              <PriceDisplay price={childRate} label="Child rate" />
            )}
            {packageRate && (
              <PriceDisplay price={packageRate} label="Package rate" />
            )}
          </>
        );
      case 'essential':
      case 'nonessential':
        return (
          <>
            {product.discount?.amount > 0 ? (
              <>
                <PriceDisplay 
                  price={getDiscountProductBaseByPrice(mrp, product.discount, productcurrency)["discountedAmount"]} 
                />
                <PriceDisplay 
                  price={getDiscountProductBaseByPrice(mrp, product.discount, productcurrency)["actual"]} 
                  strikeThrough={true} 
                  small={true}
                />
              </>
            ) : (
              <PriceDisplay price={mrp} />
            )}
            <div style={{ fontSize: '12px', color: '#666666', marginTop: '4px' }}>Per item</div>
          </>
        );
      case 'hotels':
        return (
          <>
            {mrp && !isNaN(Number(mrp)) && (
              product.discount?.amount > 0 ? (
                <>
                  <PriceDisplay 
                    price={getDiscountProductBaseByPrice(mrp, product.discount, productcurrency)["discountedAmount"]} 
                    label="Per night"
                  />
                  <PriceDisplay 
                    price={getDiscountProductBaseByPrice(mrp, product.discount, productcurrency)["actual"]} 
                    strikeThrough={true} 
                    small={true}
                  />
                </>
              ) : (
                <PriceDisplay price={mrp} label="Per night" />
              )
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <Rating 
                value={rating} 
                precision={0.5} 
                readOnly 
                size="small"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <span style={{ marginLeft: '4px', fontSize: '12px', color: '#666666' }}>
                {hotelAddress && hotelAddress.length > 25 ? `${hotelAddress.substring(0, 25)}...` : hotelAddress}
              </span>
            </div>
          </>
        );
      case 'transport':
        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666666' }}>
                {product?.passengeCount} Seats • AC • {product?.luggageCount} Luggages
              </div>
              {product?.description && (
                <div style={{ fontSize: '12px', color: '#888888', marginTop: '4px' }}>
                  {product.description}
                </div>
              )}
            </div>
            <Button 
              color="primary" 
              style={{ 
                fontSize: '12px', 
                padding: '6px 12px', 
                borderRadius: '4px',
                backgroundColor: '#3f51b5',
                border: 'none'
              }}
              onClick={() => clickProductDetail()}
            >
              View
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  if (related || vendorRelated) {
    return (
      <div 
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          ':hover': {
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
          }
        }}
        onClick={clickProductDetail}
      >
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          <LazyLoadImage
            src={currentImage || "/assets/images/placeholder-product.png"}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            effect="opacity"
          />
          {product.discount && (
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: '#ff4a4a',
              color: 'white',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              -{product.discount.amount}%
            </div>
          )}
        </div>
        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#333333',
            margin: '0 0 8px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '40px'
          }}>
            {title}
          </h3>
          {renderProductContent()}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        ':hover': {
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Product Image with Hover Effects */}
      <div 
        style={{
          position: 'relative',
          height: '240px',
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={clickProductDetail}
      >
        <LazyLoadImage
          src={currentImage || "/assets/images/placeholder-product.png"}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)'
          }}
          effect="opacity"
        />
        
        {/* Image Overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.3s ease'
          }}>
            <button 
              style={{
                backgroundColor: '#ffffff',
                color: '#333333',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <VisibilityOutlined style={{ fontSize: '16px' }} />
              Quick View
            </button>
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#666666',
            transition: 'all 0.2s ease',
            ':hover': {
              color: '#ff4a4a',
              transform: 'scale(1.1)'
            }
          }}
        >
          <FavoriteBorder style={{ fontSize: '16px' }} />
        </button>
        
        {/* Discount Badge */}
        {product.discount && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: '#ff4a4a',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            zIndex: 1
          }}>
            -{product.discount.amount}%
          </div>
        )}
      </div>

      {/* Product Details */}
      <div style={{ padding: '16px' }}>
        <h3 
          style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#333333',
            margin: '0 0 8px 0',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '48px',
            cursor: 'pointer'
          }}
          onClick={clickProductDetail}
        >
          {title}
        </h3>
        
        {renderProductContent()}
      </div>

      {/* Action Buttons */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        gap: '8px'
      }}>
        <button 
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#666666',
            transition: 'all 0.2s ease',
            ':hover': {
              backgroundColor: '#ffffff',
              color: '#007bff',
              transform: 'scale(1.1)'
            }
          }}
          onClick={toggle}
        >
          <InfoOutlined style={{ fontSize: '16px' }} />
        </button>
      </div>

      {/* Product Info Modal */}
      <Modal isOpen={modal} toggle={toggle} className="modal-lg quickview-modal" centered>
        <ProductInfoModal 
          productImage={productImage} 
          title={title} 
          description={description} 
          product={product} 
          toggle={toggle} 
          redirect={clickProductDetail} 
        />
      </Modal>
    </div>
  );
};

export default ProductItem;