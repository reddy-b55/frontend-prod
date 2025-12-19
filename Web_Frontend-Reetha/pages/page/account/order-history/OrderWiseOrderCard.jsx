// import React, { useEffect, useState } from 'react';
// import CurrencyConverter from '../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import axios from 'axios';
// import ProductCard from './OrderProductCard'; // Assuming this is the correct path to your ProductCard component

// const OrderWiseOrderCard = ({ order, currency }) => {
//   // Format date to match the receipt style
//   const [orderProducts, setOrderProducts] = React.useState([]);
//   const [loading, setLoading] = React.useState(false);
//   const [showDetails, setShowDetails] = React.useState(false);

//   const formatDate = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toISOString().replace('T', ' ').substring(0, 19);
//   };

//   // Get order ID with prefix
//   const orderId = order.OrderId ? `#ORD_${order.OrderId}` : '';
  
//   // No useEffect needed as the parsing logic is now in the ProductCard component
  
//   const showOrderProducts = async() => {
//     // Toggle the dropdown if we already have products
//     if (orderProducts.length > 0) {
//       setShowDetails(!showDetails);
//       return;
//     }
    
//     setLoading(true);
//     setShowDetails(true);
    
//     try {
//       console.log("Order products fetched successfully:", order);
//       const response = await axios.get(`getOrderDetailsByOrderID/${order.checkout_id}`);
//       if (response.data.status === 200) {
//         console.log("Order products fetched successfully:", response.data.dataSet);
//         setOrderProducts(response.data.dataSet);
//       }
//     } catch (error) {
//       console.error("Error fetching order products:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Inline styles
//   const styles = {
//     container: {
//       marginBottom: '16px'
//     },
//     orderCard: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       backgroundColor: 'white',
//       borderRadius: '8px',
//       boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
//       padding: '25px 20px',
//       margin: '0',
//       border: '1px solid #e0e0e0',
//       fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
//       borderBottomLeftRadius: showDetails ? '0' : '8px',
//       borderBottomRightRadius: showDetails ? '0' : '8px',
//     },
//     orderIdSection: {
//       display: 'flex',
//       flexDirection: 'column',
//       width: '20%',
//     },
//     orderId: {
//       fontSize: '16px',
//       fontWeight: '700',
//       color: '#333',
//       margin: '0',
//       padding: '0'
//     },
//     orderDate: {
//       fontSize: '13px',
//       color: '#777',
//       margin: '4px 0 0 0'
//     },
//     paymentColumn: {
//       display: 'flex',
//       flexDirection: 'column',
//       width: '20%',
//     },
//     paymentLabel: {
//       fontSize: '13px',
//       fontWeight: '600',
//       color: '#555',
//       margin: '0 0 4px 0'
//     },
//     paymentValue: {
//       fontSize: '14px',
//       color: '#333',
//       margin: '0'
//     },
//     totalAmount: {
//       fontWeight: '700'
//     },
//     iconContainer: {
//       display: 'flex',
//       justifyContent: 'flex-end',
//       width: '8%',
//     },
//     orderIcon: {
//       padding: '8px',
//       backgroundColor: '#f5f5f5',
//       borderRadius: '6px',
//       color: '#666',
//       cursor: 'pointer',
//     },
//     orderIconActive: {
//       backgroundColor: '#e0e0e0',
//     },
//     detailsContainer: {
//       borderBottomLeftRadius: '8px',
//       borderBottomRightRadius: '8px',
//       border: '1px solid #e0e0e0',
//       borderTop: 'none',
//       padding: '10px',
//       backgroundColor: 'white',
//       overflow: 'hidden',
//     },
//     loadingIndicator: {
//       padding: '15px',
//       textAlign: 'center',
//       color: '#666',
//       fontSize: '14px',
//     },
//     emptyStateMessage: {
//       padding: '15px', 
//       textAlign: 'center', 
//       fontSize: '14px'
//     }
//   };

//   return (
//     <div style={styles.container}>
//       <div style={styles.orderCard}>
//         {/* Order ID and Date */}
//         <div style={styles.orderIdSection}>
//           <h2 style={styles.orderId}>{orderId}</h2>
//           <p style={styles.orderDate}>{formatDate(order.BookedDay)}</p>
//             {/* Discount Tag */}
//       {order.discount_amount !== '0.00' && order.discount_amount !== null && (
//         <div style={{
//           display: 'inline-flex',
//           alignItems: 'center',
//           backgroundColor: '#fff3e0',
//           border: '1px dashed #ff9800',
//           borderRadius: '4px',
//           padding: '3px 6px',
//           marginTop: '8px',
//           maxWidth: 'fit-content'
//         }}>
//           <svg 
//             style={{
//               marginRight: '4px',
//               width: '12px',
//               height: '12px',
//               fill: '#ff9800'
//             }} 
//             viewBox="0 0 24 24"
//           >
//             <path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.05-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
//           </svg>
//           <span style={{
//             color: '#e65100',
//             fontWeight: '600',
//             fontSize: '12px'
//           }}>
//             Discount: {CurrencyConverter(order.currency, order.discount_amount, currency)}
//           </span>
//         </div>
//       )}
      
//       {/* Balance Paid Tag */}
//       {order.BalancePaidAmount && order.BalancePaidAmount !== '0.00' && order.PayType && (
//         <div style={{
//           display: 'inline-flex',
//           alignItems: 'center',
//           backgroundColor: '#e8f5e9',
//           border: '1px dashed #4caf50',
//           borderRadius: '4px',
//           padding: '3px 6px',
//           marginTop: '8px',
//           maxWidth: 'fit-content',
//           marginLeft: order.discount_amount !== '0.00' ? '8px' : '0'
//         }}>
//           <svg 
//             style={{
//               marginRight: '4px',
//               width: '20px',
//               height: '20px',
//               fill: '#4caf50'
//             }} 
//             viewBox="0 0 24 24"
//           >
//             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.82 1.62 2.45 1.62 1.79 0 2.44-.8 2.44-1.56 0-.79-.65-1.29-2.33-1.61-2.31-.41-4.02-1.16-4.02-3.24 0-1.61 1.39-2.83 3.58-3.21V4h2.67v1.95c1.86.38 2.79 1.72 2.88 3.06H14.6c-.08-.9-.64-1.55-2.22-1.55-1.5 0-2.4.68-2.4 1.53 0 .73.6 1.2 2.19 1.51 2.69.46 4.23 1.22 4.23 3.31 0 1.75-1.42 2.93-2.99 3.28z"/>
//           </svg>
//           <span style={{
//             color: '#2e7d32',
//             fontWeight: '600',
//             fontSize: '12px'
//           }}>
//             Balance amount paid by {order.PayType === 'Online'? "Only payment" :order.PayType === 'Card'? 'card payment': null } {CurrencyConverter(order.BalanceCurrency || order.currency, order.BalancePaidAmount, currency)}
//           </span>
//         </div>
//       )}
      
//       {/* Balance Due Tag - New condition */}
//       {order.balance_amount && order.balance_amount !== '0.00' && order.BalancePaidAmount === null &&  (
//         <div style={{
//           display: 'inline-flex',
//           alignItems: 'center',
//           backgroundColor: '#f3e5f5',
//           border: '1px dashed #9c27b0',
//           borderRadius: '4px',
//           padding: '3px 6px',
//           marginTop: '8px',
//           maxWidth: 'fit-content',
//           marginLeft: (order.discount_amount !== '0.00' || (order.BalancePaidAmount && order.BalancePaidAmount !== '0.00')) ? '8px' : '0'
//         }}>
//           <svg 
//             style={{
//               marginRight: '4px',
//               width: '12px',
//               height: '12px',
//               fill: '#9c27b0'
//             }} 
//             viewBox="0 0 24 24"
//           >
//             <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z"/>
//           </svg>
//           <span style={{
//             color: '#6a1b9a',
//             fontWeight: '600',
//             fontSize: '12px'
//           }}>
//             Balance to Pay: {CurrencyConverter(order.currency, order.balance_amount, currency)}
//           </span>
//         </div>
//       )}
//         </div>
        
//         {/* Total Amount */}
//         <div style={styles.paymentColumn}>
//           <p style={styles.paymentLabel}>Total Amount</p>
//           <p style={{...styles.paymentValue, ...styles.totalAmount}}>{CurrencyConverter(order.currency, order.total_amount, currency)}</p>
//         </div>
        
//         {/* Payment Mode */}
//         <div style={styles.paymentColumn}>
//           <p style={styles.paymentLabel}>Payment Mode</p>
//           <p style={styles.paymentValue}>{order.pay_category || "Online Transfer"}</p>
//         </div>
        
//         {/* Payment Type */}
//         <div style={styles.paymentColumn}>
//           <p style={styles.paymentLabel}>Payment Type</p>
//           <p style={styles.paymentValue}>{order.payment_type === "FullPayment" ? "Full" : order.payment_type}</p>
//         </div>
        
//         {/* Icon */}
//         <div style={styles.iconContainer}>
//           <div 
//             onClick={showOrderProducts} 
//             style={{
//               ...styles.orderIcon,
//               ...(showDetails ? styles.orderIconActive : {})
//             }}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
//                     stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </div>
//         </div>
//       </div>
      
//       {/* Products Dropdown */}
//       {showDetails && (
//         <div style={styles.detailsContainer}>
//           {loading ? (
//             <div style={styles.loadingIndicator}>Loading order products...</div>
//           ) : (
//             <>
//               {orderProducts.length > 0 ? (
//                 orderProducts.map((product, index) => (
//                   <ProductCard 
//                     key={index}
//                     product={product}
//                     order={order}
//                     currency={currency}
//                     index={index}
//                     isLast={index === orderProducts.length - 1}
//                     totalProducts={orderProducts.length}
//                   />
//                 ))
//               ) : (
//                 <div style={styles.emptyStateMessage}>
//                   No products found for this order.
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderWiseOrderCard;



import React, { useEffect, useState } from 'react';
import CurrencyConverter from '../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import axios from 'axios';
import ProductCard from './OrderProductCard'; // Assuming this is the correct path to your ProductCard component
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/router';

const OrderWiseOrderCard = ({ order, currency, viewExpand=true }) => {
  // Format date to match the receipt style
  const [orderProducts, setOrderProducts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showDetails, setShowDetails] = React.useState(false);
  const router = useRouter();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  // Get order ID with prefix
  const orderId = order.OrderId ? `#ORD_${order.OrderId}` : '';
  
  // Calculate discounted total amount
  const calculateDiscountedTotal = () => {
    const totalAmount = parseFloat(order.total_amount) || 0;
    const discountAmount = parseFloat(order.discount_amount) || 0;
    
    // If there's a discount, show the reduced amount
    if (discountAmount > 0) {
      return totalAmount - discountAmount;
    }
    
    return totalAmount;
  };

  // Check if order has discount
  const hasDiscount = order.discount_amount && order.discount_amount !== '0.00' && parseFloat(order.discount_amount) > 0;
  
  // No useEffect needed as the parsing logic is now in the ProductCard component
  
  const showOrderProducts = async() => {
    // Toggle the dropdown if we already have products
    if (orderProducts.length > 0) {
      setShowDetails(!showDetails);
      return;
    }
    
    setLoading(true);
    setShowDetails(true);
    
    try {
      console.log("Order products fetched successfully:", order);
      const response = await axios.get(`getOrderDetailsByOrderID/${order.checkout_id}`);
      if (response.data.status === 200) {
        console.log("Order products fetched successfully:", response.data.dataSet);
        setOrderProducts(response.data.dataSet);
      }
    } catch (error) {
      console.error("Error fetching order products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderView = () => {
     router.push(
      `order-history/orderview/${order.checkout_id}`
    );
  }

  // Inline styles
  const styles = {
    container: {
      marginBottom: '16px'
    },
    orderCard: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '25px 20px',
      margin: '0',
      border: '1px solid #e0e0e0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      borderBottomLeftRadius: showDetails ? '0' : '8px',
      borderBottomRightRadius: showDetails ? '0' : '8px',
    },
    orderIdSection: {
      display: 'flex',
      flexDirection: 'column',
      width: '20%',
    },
    orderId: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#333',
      margin: '0',
      padding: '0'
    },
    orderDate: {
      fontSize: '13px',
      color: '#777',
      margin: '4px 0 0 0'
    },
    paymentColumn: {
      display: 'flex',
      flexDirection: 'column',
      width: '20%',
    },
    paymentLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#555',
      margin: '0 0 4px 0'
    },
    paymentValue: {
      fontSize: '14px',
      color: '#333',
      margin: '0'
    },
    totalAmount: {
      fontWeight: '700'
    },
    originalAmount: {
      fontSize: '12px',
      color: '#999',
      textDecoration: 'line-through',
      margin: '2px 0 0 0'
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '8%',
    },
    orderIcon: {
      padding: '8px',
      backgroundColor: '#f5f5f5',
      borderRadius: '6px',
      color: '#666',
      cursor: 'pointer',
    },
    orderIconActive: {
      backgroundColor: '#e0e0e0',
    },
    detailsContainer: {
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
      border: '1px solid #e0e0e0',
      borderTop: 'none',
      padding: '10px',
      backgroundColor: 'white',
      overflow: 'hidden',
    },
    loadingIndicator: {
      padding: '15px',
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
    },
    emptyStateMessage: {
      padding: '15px', 
      textAlign: 'center', 
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.orderCard}>
        {/* Order ID and Date */}
        <div style={styles.orderIdSection}>
          <h2 style={styles.orderId}>{orderId}</h2>
          <p style={styles.orderDate}>{formatDate(order.BookedDay)}</p>
            {/* Discount Tag */}
      {order.discount_amount !== '0.00' && order.discount_amount !== null && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#fff3e0',
          border: '1px dashed #ff9800',
          borderRadius: '4px',
          padding: '3px 6px',
          marginTop: '8px',
          maxWidth: 'fit-content'
        }}>
          <svg 
            style={{
              marginRight: '4px',
              width: '12px',
              height: '12px',
              fill: '#ff9800'
            }} 
            viewBox="0 0 24 24"
          >
            <path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41s-.23-1.05-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
          </svg>
          <span style={{
            color: '#e65100',
            fontWeight: '600',
            fontSize: '12px'
          }}>
            Discount: {CurrencyConverter(order.currency, order.discount_amount, currency)}
          </span>
        </div>
      )}
      
      {/* Balance Paid Tag */}
      {order.BalancePaidAmount && order.BalancePaidAmount !== '0.00' && order.PayType && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#e8f5e9',
          border: '1px dashed #4caf50',
          borderRadius: '4px',
          padding: '3px 6px',
          marginTop: '8px',
          maxWidth: 'fit-content',
          marginLeft: order.discount_amount !== '0.00' ? '8px' : '0'
        }}>
          <svg 
            style={{
              marginRight: '4px',
              width: '20px',
              height: '20px',
              fill: '#4caf50'
            }} 
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1.93.82 1.62 2.45 1.62 1.79 0 2.44-.8 2.44-1.56 0-.79-.65-1.29-2.33-1.61-2.31-.41-4.02-1.16-4.02-3.24 0-1.61 1.39-2.83 3.58-3.21V4h2.67v1.95c1.86.38 2.79 1.72 2.88 3.06H14.6c-.08-.9-.64-1.55-2.22-1.55-1.5 0-2.4.68-2.4 1.53 0 .73.6 1.2 2.19 1.51 2.69.46 4.23 1.22 4.23 3.31 0 1.75-1.42 2.93-2.99 3.28z"/>
          </svg>
          <span style={{
            color: '#2e7d32',
            fontWeight: '600',
            fontSize: '12px'
          }}>
            Balance amount paid by {order.PayType === 'Online'? "Online Transfer" :order.PayType === 'Card'? 'card payment': null } {CurrencyConverter(order.BalanceCurrency || order.currency, order.BalancePaidAmount, currency)}
          </span>
        </div>
      )}
      
      {/* Balance Due Tag - New condition */}
      {order.balance_amount && order.balance_amount !== '0.00' && order.BalancePaidAmount === null &&  (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#f3e5f5',
          border: '1px dashed #9c27b0',
          borderRadius: '4px',
          padding: '3px 6px',
          marginTop: '8px',
          maxWidth: 'fit-content',
          marginLeft: (order.discount_amount !== '0.00' || (order.BalancePaidAmount && order.BalancePaidAmount !== '0.00')) ? '8px' : '0'
        }}>
          <svg 
            style={{
              marginRight: '4px',
              width: '12px',
              height: '12px',
              fill: '#9c27b0'
            }} 
            viewBox="0 0 24 24"
          >
            <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4V6h16v12z"/>
          </svg>
          <span style={{
            color: '#6a1b9a',
            fontWeight: '600',
            fontSize: '12px'
          }}>
            Balance to Pay: {CurrencyConverter(order.currency, order.balance_amount, currency)}
          </span>
        </div>
      )}
        </div>
        
        {/* Total Amount - Updated to show discounted amount */}
        <div style={styles.paymentColumn}>
          <p style={styles.paymentLabel}>Paid Amount</p>
          <div>
            <p style={{...styles.paymentValue, ...styles.totalAmount}}>
              {CurrencyConverter(order.currency, calculateDiscountedTotal().toString(), currency)}
            </p>
            {/* Show original amount with strikethrough if there's a discount */}
            {/* {hasDiscount && (
              <p style={styles.originalAmount}>
                {CurrencyConverter(order.currency, order.total_amount, currency)}
              </p>
            )} */}
          </div>
        </div>
        
        {/* Payment Mode */}
        <div style={styles.paymentColumn}>
          <p style={styles.paymentLabel}>Payment Mode</p>
          <p style={styles.paymentValue}>{order.pay_category || "Online Transfer"}</p>
        </div>
        
        {/* Payment Type */}
        <div style={styles.paymentColumn}>
          <p style={styles.paymentLabel}>Payment Type</p>
          <p style={styles.paymentValue}>{order.payment_type === "FullPayment" ? "Full" : order.payment_type}</p>
        </div>
        
        {/* Icon */}
        {
        viewExpand && 
          <div style={{...styles.iconContainer, gap: '8px'}}>
          <div 
            onClick={showOrderProducts} 
            style={{
              ...styles.orderIcon,
              ...(showDetails ? styles.orderIconActive : {})
            }}
          >
            <ExpandMoreIcon />
          </div>
          {/* <div 
            onClick={handleOrderView} 
            style={{
              ...styles.orderIcon,
            }}
          >
            <VisibilityIcon />
          </div> */}
        </div>
        }
      
        
      </div>
      
      {/* Products Dropdown */}
      {showDetails && (
        <div style={styles.detailsContainer}>
          {loading ? (
            <div style={styles.loadingIndicator}>Loading order products...</div>
          ) : (
            <>
              {orderProducts.length > 0 ? (
                orderProducts.map((product, index) => (
                  <ProductCard 
                    key={index}
                    product={product}
                    order={order}
                    currency={currency}
                    index={index}
                    isLast={index === orderProducts.length - 1}
                    totalProducts={orderProducts.length}
                  />
                ))
              ) : (
                <div style={styles.emptyStateMessage}>
                  No products found for this order.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderWiseOrderCard;