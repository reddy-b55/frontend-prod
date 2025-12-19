import React, { useContext } from 'react';
import { Button, Row, Col } from 'reactstrap';
import StarIcon from '@mui/icons-material/Star';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LuggageIcon from '@mui/icons-material/Luggage';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import { AppContext } from '../../../pages/_app';

const VehicleRow = ({ product, addToCart }) => {
     const { baseCurrencyValue } = useContext(AppContext)
    const {
        vehicleName,
        imageUrl,
        price,
        originalPrice,
        discountPercentage,
        ratings,
        seats,
        hasAC,
        bags,
        taxesAndCharges,
        description,
        currency
    } = product;

    const handleAddToCart = () => {
        if (typeof addToCart === 'function') {
            addToCart(product);
        }
    };

    return (
        <div className="vehicle-row">
            <Row className="align-items-center">
                {/* Left side - Vehicle image with fuel type badge */}
                <Col xs={12} md={3} className="mb-3 mb-md-0">
                    <div className="vehicle-image-container">
                        <img 
                            src={imageUrl || '/assets/images/vehicle-placeholder.jpg'} 
                            alt={vehicleName} 
                            className="vehicle-image"
                        />
                        {/* <div className="fuel-badge">
                            {fuelType}
                        </div> */}
                    </div>
                </Col>
                
                {/* Middle - Vehicle details */}
                <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <div className="vehicle-details">
                        <div className="d-flex align-items-center mb-2">
                            <h4 className="vehicle-name mb-0">{vehicleName}</h4>
                            {/* {ratings && (
                                <div className="rating-badge ms-2">
                                    <StarIcon fontSize="small" /> {ratings}
                                </div>
                            )}
                            <div className="ms-2 text-muted">or similar</div> */}
                        </div>
                        
                        <div className="vehicle-features mb-3">
                            <span className="feature">
                                {seats} Seats
                            </span>
                            <span className="feature-separator">•</span>
                            <span className="feature">
                                {hasAC ? 'AC' : 'Non-AC'}
                            </span>
                            <span className="feature-separator">•</span>
                            <span className="feature">
                                {bags} Bag{bags !== 1 ? 's' : ''}
                            </span>
                        </div>
                        
                        {description && (
                            <div className="roof-carrier">
                                <span className="roof-star">✨</span> {description}
                            </div>
                        )}
                        
                        {/* <div className="mt-3 d-flex">
                            <button className="btn-link inclusions">
                                Inclusions and Exclusions <i className="fa fa-chevron-down"></i>
                            </button>
                            <span className="mx-2"></span>
                            <button className="btn-link cancellation">
                                Cancellation Policy <i className="fa fa-chevron-down"></i>
                            </button>
                        </div> */}
                    </div>
                </Col>
                
                {/* Right side - Price and action button */}
                <Col xs={12} md={3}>
                    <div className="price-action text-md-end">
                        {/* {discountPercentage > 0 && (
                            <div className="discount-tag text-end">
                                {discountPercentage}% off
                            </div>
                        )} */}
                        
                        {/* {originalPrice && originalPrice > price && (
                            <div className="original-price">
                                ₹{originalPrice}
                            </div>
                        )} */}
                        
                        <div className="current-price">
                            {CurrencyConverter(currency,price, baseCurrencyValue)}
                        </div>
                        
                        {taxesAndCharges && (
                            <div className="taxes-note">
                                 (Taxes & Charges)
                            </div>
                        )}
                        
                        <Button 
                            color="primary" 
                            className="btn btn-sm btn-solid" style={{ fontSize: 12, padding: '5px 10px', borderRadius: '4px' }}
                            onClick={handleAddToCart}
                        >
                           Add To Cart
                        </Button>
                    </div>
                </Col>
            </Row>
            
            <style jsx>{`
                .vehicle-row {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    padding: 20px;
                    margin-bottom: 20px;
                    transition: box-shadow 0.3s;
                }
                
                .vehicle-row:hover {
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                
                .vehicle-image-container {
                    position: relative;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .vehicle-image {
                    width: 100%;
                    height: auto;
                    object-fit: contain;
                    display: block;
                }
                
                .fuel-badge {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: #009688;
                    color: white;
                    text-align: center;
                    padding: 5px;
                    font-weight: 500;
                }
                
                .vehicle-name {
                    font-size: 20px;
                    font-weight: 600;
                }
                
                .rating-badge {
                    background-color: #388e3c;
                    color: white;
                    display: flex;
                    align-items: center;
                    padding: 0 8px;
                    border-radius: 4px;
                    font-size: 14px;
                    height: 24px;
                }
                
                .vehicle-features {
                    display: flex;
                    align-items: center;
                    font-size: 16px;
                }
                
                .feature {
                    display: flex;
                    align-items: center;
                }
                
                .feature-separator {
                    margin: 0 10px;
                    color: #aaa;
                }
                
                .roof-carrier {
                    font-size: 14px;
                    color: #333;
                    padding: 8px 0;
                }
                
                .roof-star {
                    color: #f1c40f;
                    margin-right: 4px;
                }
                
                .btn-link {
                    background: none;
                    border: none;
                    padding: 0;
                    color: #3498db;
                    text-decoration: none;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .btn-link:hover {
                    text-decoration: underline;
                }
                
                .discount-tag {
                    color: #e74c3c;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .original-price {
                    text-decoration: line-through;
                    color: #777;
                    font-size: 16px;
                }
                
                .current-price {
                    font-size: 24px;
                    font-weight: 700;
                    color: #000;
                }
                
                .taxes-note {
                    font-size: 12px;
                    color: #777;
                }
                
                .select-btn {
                    width: 100%;
                    font-weight: 500;
                }
                
                @media (max-width: 767px) {
                    .price-action {
                        text-align: left;
                        margin-top: 15px;
                    }
                    
                    .discount-tag {
                        text-align: left;
                    }
                }
            `}</style>
        </div>
    );
};

export default VehicleRow;