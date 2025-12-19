import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../../_app';

const PriceFilter = ({ products, onFilterChange }) => {
  const { baseCurrencyValue } = useContext(AppContext);
  const [availablePriceRanges, setAvailablePriceRanges] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

  // Define price ranges
  const priceRangeDefinitions = [
    { min: 0, max: 1000, label: "Under 1,000" },
    { min: 1000, max: 5000, label: "1,000 - 5,000" },
    { min: 5000, max: 10000, label: "5,000 - 10,000" },
    { min: 10000, max: 25000, label: "10,000 - 25,000" },
    { min: 25000, max: 50000, label: "25,000 - 50,000" },
    { min: 50000, max: Infinity, label: "Above 50,000" }
  ];

  // Extract price from product based on category
  const extractProductPrice = (product) => {
    let price = 0;
    let currency = baseCurrencyValue.code;
    
    try {
      if (product.main_category_id === 1 || product.main_category_id === 2) {
        // Essential/Non-Essential
        price = product.mrp * product.quantity;
        currency = product.esCurrency;
      } else if (product.main_category_id === 3) {
        // Lifestyle
        if (product.rate_type === "Package") {
          price = parseFloat(String(product.package_rate).replace(/,/g, ''));
        } else {
          let adultCost = product.lifestyle_adult_count > 0 
            ? product.adult_rate * product.lifestyle_adult_count : 0;
          let childCost = product.lifestyle_children_count > 0 
            ? product.child_rate * product.lifestyle_children_count : 0;
          price = parseFloat(adultCost) + parseFloat(childCost);
        }
        currency = product.lsCurrency;
      } else if (product.main_category_id === 4) {
        // Hotel
        const hotelDetails = typeof product.bookingdataset === 'string' 
          ? JSON.parse(product.bookingdataset) : product.bookingdataset;
        price = hotelDetails?.hotelRatesRequest?.Price?.PublishedPrice || 0;
        currency = hotelDetails?.hotelRatesRequest?.Price?.CurrencyCode;
      } else if (product.main_category_id === 5) {
        // Education
        price = product.student_type === "Adult" 
          ? product.adult_course_fee : product.child_course_fee;
        currency = product.eCurrency;
      }
    } catch (error) {
      console.error("Error extracting product price:", error);
    }
    
    return { price, currency };
  };

  // Generate price ranges based on products
  const generatePriceRanges = () => {
    const ranges = priceRangeDefinitions.map(range => ({
      ...range,
      count: 0
    }));
    
    products.forEach(product => {
      try {
        const { price, currency } = extractProductPrice(product);
        if (isNaN(price) || price === 0) return;
        
        // Find which range this product falls into
        const priceRange = ranges.find(
          range => price >= range.min && price < range.max
        );
        
        if (priceRange) {
          priceRange.count++;
        }
      } catch (error) {
        console.error("Error processing product for price range:", error);
      }
    });
    
    // Filter out ranges with no products
    return ranges.filter(range => range.count > 0);
  };
  
  useEffect(() => {
    if (products && products.length > 0) {
      const ranges = generatePriceRanges();
      setAvailablePriceRanges(ranges);
    }
  }, [products]);
  
  const handlePriceRangeChange = (range, isChecked) => {
    let newSelectedRanges;
    
    if (isChecked) {
      newSelectedRanges = [...selectedPriceRanges, range];
    } else {
      newSelectedRanges = selectedPriceRanges.filter(r => 
        !(r.min === range.min && r.max === range.max)
      );
    }
    
    setSelectedPriceRanges(newSelectedRanges);
    
    // Notify parent component
    if (onFilterChange) {
      onFilterChange({
        type: 'price',
        ranges: newSelectedRanges
      });
    }
  };
  
  // Don't render anything if no price ranges are available
  if (availablePriceRanges.length === 0) {
    return null;
  }
  
  return (
    <div className="price-filter-container">
      <h4 className="filter-heading">Price</h4>
      <div className="price-ranges">
        {availablePriceRanges.map((range, index) => (
          <div key={index} className="price-range-item">
            <input
              type="checkbox"
              id={`price-range-${index}`}
              checked={selectedPriceRanges.some(r => 
                r.min === range.min && r.max === range.max
              )}
              onChange={(e) => handlePriceRangeChange(range, e.target.checked)}
            />
            <label htmlFor={`price-range-${index}`} className="filter-label">
              {range.label} <span className="product-count">({range.count})</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceFilter;