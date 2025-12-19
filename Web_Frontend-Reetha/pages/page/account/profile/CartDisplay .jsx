import React from 'react';

const CartDisplay = ({ filteredCartProducts }) => {
  // Function to get appropriate product name based on product type

  console.log('filteredCartProducts', filteredCartProducts);
  const getProductName = (product) => {
    console.log('product', product);

    if (product.lifestyle_name) return product.lifestyle_name;
    if (product.listing_title) return product.listing_title;
    if (product.course_name) return product.course_name;
    if(product.maincat_type === "Hotels"){
        const bookingData = JSON.parse(product.bookingdataset);
        return bookingData.hotelMainRequest.hotelData.hotelName;
    }
    // Fallback for products with no name field
    return product.maincat_type + " Product";
  };
  
  // Function to get appropriate product image based on product type
  const getProductImage = (product) => {
    // For lifestyle products
    if (product.image) {
      return product.image.split(',')[0];
    }
    
    // For essential products
    if (product.productImage) {
      return product.productImage.split(',')[0];
    }
    
    // For education products
    if (product.image_path) {
      return product.image_path;
    }
    
    // Fallback for hotel products with booking data
    if (product.bookingdataset) {
      try {
        const parsedData = JSON.parse(product.bookingdataset);
        if (parsedData?.hotelMainRequest?.hotelData?.images) {
          return parsedData.hotelMainRequest.hotelData.images.split(',')[0];
        }
      } catch (e) {
        // Handle JSON parse error silently
      }
    }
    
    // Default placeholder
    return "https://via.placeholder.com/70x70?text=No+Image";
  };
  
  // Function to get the appropriate date
  const getProductDate = (product) => {
    return product.booking_date || product.order_preffered_date || product.preffered_date || "Date not specified";
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px 5px' }}>
      {filteredCartProducts.length > 0 ? (
        filteredCartProducts.map((product, index) => (
          <div 
            key={index} 
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '15px',
              padding: '10px',
              borderBottom: index < filteredCartProducts.length - 1 ? '1px solid #eee' : 'none'
            }}
          >
            <div style={{ marginRight: '15px' }}>
              <img
                src={getProductImage(product)}
                alt={getProductName(product)}
                style={{
                  width: '70px',
                  height: '70px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/70x70?text=No+Image";
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h6 
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '5px',
                  color: '#333'
                }}
              >
                {getProductName(product)}
              </h6>
              <div 
                style={{
                  fontSize: '13px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span 
                  style={{
                    backgroundColor: '#f0f0f0',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    marginRight: '8px'
                  }}
                >
                  {product.maincat_type}
                </span>
                <span>
                  {getProductDate(product)}
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div 
          style={{
            textAlign: 'center',
            padding: '30px 10px',
            color: '#666'
          }}
        >
          <p>No products found in this cart.</p>
        </div>
      )}
    </div>
  );
};

export default CartDisplay;