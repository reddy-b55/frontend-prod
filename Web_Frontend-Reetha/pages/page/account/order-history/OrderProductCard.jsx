import React, { useEffect, useMemo, useState } from 'react';
import CurrencyConverter from '../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import FlightCard from './FlightCard';
import { useRouter } from "next/router";
import ModalBase from '../../../../components/common/Modals/ModalBase';

const ProductCard = ({ product, order, currency, index, isLast, totalProducts }) => {
  const router = useRouter();
  const [flightData, setFlightData] = useState();
  const [openModalLocation, setOpenModalLocation] = useState(false);

  const safeJsonParse = (jsonString, fallback = null) => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return fallback;
    }
  };

  const handleMoreInfo = () => {
    router.push(
      `order-history/${product.CID}?main_category_id=${product.main_category_id}`
    );
  };

  console.log("Product Card Data:", {
    product,
    CategoryType: product.CategoryType,
    allKeys: Object.keys(product)
  });

  const parsedHotelData = useMemo(() => {
    if (product?.HotelData && typeof product.HotelData === 'string') {
      try {
        return JSON.parse(product.HotelData);
      } catch (error) {
        console.error('Error parsing HotelData JSON:', error);
        return null;
      }
    }
    return product?.HotelData || null;
  }, [product?.HotelData]);

  // Parse product_data if it exists
  const parsedProductData = useMemo(() => {
    if (product?.product_data && typeof product.product_data === 'string') {
      try {
        return JSON.parse(product.product_data);
      } catch (error) {
        console.error('Error parsing product_data:', error);
        return null;
      }
    }
    return product?.product_data || null;
  }, [product?.product_data]);

  // Parse checkout_data if it exists
  const parsedCheckoutData = useMemo(() => {
    if (product?.checkout_data && typeof product.checkout_data === 'string') {
      try {
        return JSON.parse(product.checkout_data);
      } catch (error) {
        console.error('Error parsing checkout_data:', error);
        return null;
      }
    }
    return product?.checkout_data || null;
  }, [product?.checkout_data]);

  // Inline styles
  const styles = {
    productItem: {
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      border: '1px solid #eee',
      overflow: 'hidden',
      margin: '8px 0',
      backgroundColor: 'white',
    },
    productRow: {
      display: 'flex',
      padding: '12px',
      alignItems: 'center',
    },
    productImage: {
      width: '80px',
      height: '80px',
      objectFit: 'cover',
      borderRadius: '4px',
      marginRight: '15px',
    },
    productInfo: {
      flex: 1,
    },
    productTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#333',
      margin: '0 0 6px 0',
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      maxWidth: '250px',
    },
    productDetails: {
      fontSize: '14px',
      color: '#555',
      margin: '0 0 4px 0',
    },
    productPrice: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#333',
    },
    productActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 12px 12px 12px',
    },
    moreInfoButton: {
      backgroundColor: '#0f172a',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      border: 'none',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      marginLeft: 'auto',
    },
    progressBar: {
      height: '4px',
      backgroundColor: '#000',
      width: '100%',
      marginTop: '8px',
    },
    badge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      marginBottom: '8px',
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
    },
    categoryBadges: {
      Lifestyle: { backgroundColor: '#e0f2fe', color: '#0369a1' },
      Education: { backgroundColor: '#f0fdf4', color: '#166534' },
      Hotels: { backgroundColor: '#fef3c7', color: '#92400e' },
      Essential: { backgroundColor: '#ffedd5', color: '#9a3412' },
      "Non Essential": { backgroundColor: '#f3e8ff', color: '#6b21a8' },
    },
    orderBadges: {
      Approved: { backgroundColor: '#f87800ff', color: '#ffffffff' },
      Completed: { backgroundColor: '#00be39ff', color: '#ffffffff' },
      refund: { backgroundColor: '#01c0f0ff', color: '#ffffffff' },
      Cancel: { backgroundColor: '#f00101ff', color: '#ffffffff' },
    }
  };

  // Function to get appropriate badge style based on category
  const getBadgeStyle = (category) => {
    return styles.categoryBadges[category] || {};
  };

  const getBadgeOrderStyle = (category) => {
    return styles.orderBadges[category] || {};
  };

  // Function to get the appropriate product image
  const getProductImage = () => {
    if (product.CategoryType === "Lifestyle") {
      return product.LSImage?.split(",")?.[0] || product.ls_image?.split(",")?.[0] || `/placeholder-image.jpg`;
    } else if (product.CategoryType === "Education") {
      return product.image_path?.split(",")?.[0] || `/placeholder-image.jpg`;
    } else if (product.CategoryType === "Hotels") {
      return parsedHotelData?.hotelMainRequest?.hotelData?.images?.split(",")?.[0] || `/placeholder-image.jpg`;
    } else if (product.CategoryType === "Essential" || product.CategoryType === "Non Essential") {
      return product.product_images?.split(",")?.[0] || `/placeholder-image.jpg`;
    }
    return `/placeholder-image.jpg`;
  };
useEffect(() => {
  if (product.CategoryType === "Lifestyle" || product.CategoryType === "Education") {
    console.log("Lifestyle/Education Product Details:", {
      adult_count: product.adult_count,
      child_count: product.child_count,
      qty: product.qty,
      quantity: product.quantity,
      fullProduct: product
    });
  }
}, [product]);

  // Function to get the appropriate product title
  const getProductTitle = () => {
    if (product.CategoryType === "Lifestyle") {
      return product.lifestyle_name || product.ls_name || "Product";
    } else if (product.CategoryType === "Education") {
      return product.course_name || "Education Course";
    } else if (product.CategoryType === "Hotels") {
      return parsedHotelData?.hotelMainRequest?.hotelData?.hotelName || "Hotel";
    } else if (product.CategoryType === "Essential" || product.CategoryType === "Non Essential") {
      return product.listing_title || "Essential Item";
    }
    return "Product";
  };

// Function to get the appropriate product details - UPDATED
const getProductDetails = () => {
  console.log("Getting product details for:", {
    CategoryType: product.CategoryType,
    productKeys: Object.keys(product),
    lifestyle_adult_count: product.lifestyle_adult_count,
    lifestyle_children_count: product.lifestyle_children_count,
    adult_course_fee: product.adult_course_fee,
    child_course_fee: product.child_course_fee
  });

  // For Hotels category
  if (product.CategoryType === "Hotels") {
    return `Adults - ${parsedHotelData?.NoOfAdults || 0}, Children - ${
      parsedHotelData?.NoOfChild || 0
    }, Nights - ${parsedHotelData?.NoOfNights || 0}`;
  }
  
  // For Lifestyle OR Education categories (both use lifestyle_ prefixed fields)
  else if (product.CategoryType === "Lifestyle" || product.CategoryType === "Education") {
    console.log(`${product.CategoryType} product check:`, {
      lifestyle_adult_count: product.lifestyle_adult_count,
      lifestyle_children_count: product.lifestyle_children_count,
      adult_course_fee: product.adult_course_fee,
      child_course_fee: product.child_course_fee
    });

    // For both Lifestyle and Education, check lifestyle_ prefixed fields first
    let adultCount = product.lifestyle_adult_count || product.lifestyle_adultCount || 
                    product.lifestyle_adults || product.lifestyle_no_of_adults || 0;
    let childCount = product.lifestyle_children_count || product.lifestyle_childCount || 
                    product.lifestyle_children || product.lifestyle_no_of_children || 0;
    
    // For Education specifically, also check if adult_course_fee indicates adults
    if (product.CategoryType === "Education" && (!adultCount && !childCount)) {
      // If adult_course_fee has a value > 0, assume there's at least 1 adult
      if (product.adult_course_fee && parseFloat(product.adult_course_fee) > 0) {
        adultCount = 1;
      }
      // If child_course_fee has a value > 0, assume there's at least 1 child
      if (product.child_course_fee && parseFloat(product.child_course_fee) > 0) {
        childCount = 1;
      }
    }
    
    // Try generic fields if lifestyle-specific not found
    if (!adultCount && !childCount) {
      adultCount = product.adult_count || product.adultCount || product.ADULT_COUNT || 
                  product.adults || product.no_of_adults || 0;
      childCount = product.child_count || product.childCount || product.CHILD_COUNT || 
                  product.children || product.no_of_childs || 0;
    }
    
    // Check parsed data
    if (parsedProductData) {
      adultCount = adultCount || parsedProductData.adult_count || parsedProductData.adults || 
                  parsedProductData.lifestyle_adult_count || 0;
      childCount = childCount || parsedProductData.child_count || parsedProductData.children || 
                  parsedProductData.lifestyle_children_count || 0;
    }
    
    if (parsedCheckoutData) {
      adultCount = adultCount || parsedCheckoutData.adult_count || parsedCheckoutData.adults || 
                  parsedCheckoutData.lifestyle_adult_count || 0;
      childCount = childCount || parsedCheckoutData.child_count || parsedCheckoutData.children || 
                  parsedCheckoutData.lifestyle_children_count || 0;
    }
    
    console.log(`${product.CategoryType} final counts:`, { adultCount, childCount });
    
    // If we have adult/child counts, show them
    if (adultCount > 0 || childCount > 0) {
      return `Adults - ${adultCount}${childCount > 0 ? `, Children - ${childCount}` : ''}`;
    }
    
    // For Education, check student_name field
    if (product.CategoryType === "Education" && product.student_name) {
      return `Student: ${product.student_name}`;
    }
    
    // Fallback to quantity
    const quantity = product.quantity || product.qty || product.QTY || 1;
    return `Qty: ${quantity}`;
  }
  
  // For Essential/Non Essential categories
  else if (product.CategoryType === "Essential" || product.CategoryType === "Non Essential") {
    // Check direct fields
    let adultCount = product.adult_count || product.adultCount || product.adults || 0;
    let childCount = product.child_count || product.childCount || product.children || 0;
    
    // Check parsed data
    if (parsedProductData) {
      adultCount = adultCount || parsedProductData.adult_count || parsedProductData.adults || 0;
      childCount = childCount || parsedProductData.child_count || parsedProductData.children || 0;
    }
    
    if (parsedCheckoutData) {
      adultCount = adultCount || parsedCheckoutData.adult_count || parsedCheckoutData.adults || 0;
      childCount = childCount || parsedCheckoutData.child_count || parsedCheckoutData.children || 0;
    }
    
    // If we have adult/child counts, show them
    if (adultCount > 0 || childCount > 0) {
      return `Adults - ${adultCount}${childCount > 0 ? `, Children - ${childCount}` : ''}`;
    }
    
    // Fallback to quantity
    const quantity = product.quantity || product.qty || product.QTY || 1;
    return `Qty: ${quantity}`;
  }
  
  // Default fallback
  else {
    const quantity = product.quantity || product.qty || product.QTY || 1;
    return `Qty: ${quantity}`;
  }
};
  const flightValidData = safeJsonParse(product.flightValidData);
  const flightsData = safeJsonParse(product.flightsData);

  const handleToggle = (flightDataInput) => {
    console.log("handleToggle called", flightDataInput);
  
    if (flightDataInput?.flightContactDetails) {
      const parsedFlightContactDetails = JSON.parse(flightDataInput.flightContactDetails);
      const parsedFlightCustomerSearch = JSON.parse(flightDataInput.flightCustomerSearch);
      const parsedFlightsData = JSON.parse(flightDataInput.flightsData);
      const adultData = JSON.parse(flightDataInput.flightAdult);

      let data = {
        flightContactDetails: parsedFlightContactDetails,
        flightCustomerSearch: parsedFlightCustomerSearch,
        flightsData: parsedFlightsData,
        flightAdult: adultData,
      };
  
      console.log("Parsed flightContactDetails", data);
      setFlightData(data);
    }
  
    setOpenModalLocation(!openModalLocation);
  };

  return (
    <>
      <div style={styles.productItem}>
        {product?.flight_id ? (
          <>
            <FlightCard
              key={1}
              O_id={order.id}
              order={product}
              flightValidData={flightValidData}
              flightsData={flightsData}
              handleToggle={handleToggle} />
          </>
        ) : (
          <div style={styles.productRow}>
            <img
              src={getProductImage()}
              alt={getProductTitle()}
              style={styles.productImage} />
            <div style={styles.productInfo}>
              <div>
                <span
                  style={{
                    ...styles.badge,
                    ...getBadgeStyle(product.CategoryType),
                  }}
                >
                  {product.CategoryType || "Product"}
                </span>

                <span
                  style={{
                    ...styles.badge,
                    ...getBadgeOrderStyle(product.refund_count === 0 ? product.status : "refund"),
                  }}
                >
                  {product.status === "Approved" ? "Ongoing" : product.refund_count === 0 ? product.status : 'refund' || "Status Not Specified"}
                </span>
              </div>
              <h3 style={styles.productTitle}>{getProductTitle()}</h3>
              <p style={styles.productDetails}>{getProductDetails()}</p>
              <p style={styles.productDetails}>
                {product.delivery_date
                  ? `Delivery: ${product.delivery_date}`
                  : product.date
                    ? `Date: ${product.date}`
                    : ""}
              </p>

              <div style={styles.productPrice}>
                {order.discount_amount && product?.LSDiscount != null && parseFloat(order.discount_amount) > 0 ? (
                  <div>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500', 
                      color: '#888',
                      textDecoration: 'line-through',
                      marginRight: '8px'
                    }}>
                      {CurrencyConverter(
                        order.currency,
                        order.total_amount,
                        currency
                      )}
                    </span>
                    
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#333'
                    }}>
                      {CurrencyConverter(
                        order.currency,
                        (parseFloat(order.total_amount) - parseFloat(order.discount_amount)).toString(),
                        currency
                      )}
                    </span>
                  </div>
                ) : (
                  <span>
                    {CurrencyConverter(
                      order.currency,
                      product.total_price || product.amount,
                      currency
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div style={styles.productActions}>
          {product.main_category_id === 6 ? null : (
            <button
              onClick={handleMoreInfo}
              style={styles.moreInfoButton}
            >
              More Info
            </button>
          )}
        </div>

        {isLast && <div style={styles.progressBar}></div>}
      </div>
      
      <ModalBase isOpen={openModalLocation} toggle={() => setOpenModalLocation(false)} title={"Passenger Details"}>
        <div className="px-3">
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#333'
            }}>Passenger Information</h3>

            {flightData?.flightAdult?.map((passenger, index) => (
              <div key={index} style={{
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '600' }}>Passenger {index + 1}</span>
                  <span style={{
                    backgroundColor: '#e6f7ff',
                    color: '#0077cc',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>Adult</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Name:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.title} {passenger?.firstName} {passenger?.lastName}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Gender:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.gender}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Date of Birth:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.passportDOB}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Nationality:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.nationality?.flag} {passenger?.nationality?.name}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Passport No:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.passportNo}</p>
                  </div>

                  <div>
                    <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Passport Expiry:</p>
                    <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.expiryDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#333'
            }}>Contact Details</h3>

            <div style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Email: {flightData?.flightContactDetails?.email}</p>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Contact Number: {flightData?.flightContactDetails?.contact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBase>
    </>
  );
};

export default ProductCard;