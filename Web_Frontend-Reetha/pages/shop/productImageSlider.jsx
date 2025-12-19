import { useRef, useEffect } from 'react';
import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';
import { useRouter } from 'next/router';

export default function ProductSlider({ allDiscountData = [], type = null, meta = [] }) {
  const sliderRef = useRef(null);
  const router = useRouter();
  
  console.log("ProductSlider component mounted", allDiscountData, type, meta);
  
  useEffect(() => {
    console.log("ProductSlider component mounted", allDiscountData, type, meta);
    if (sliderRef.current) {
      // You can add any additional initialization here
    }
  }, []);

  const handleClick = (item) => {
    switch (type) {
      case "essential":
        console.log("Product clicked:", item);
        router.push({
          pathname: `/product-details/essential/${generateSlug(item?.product?.listing_title)}`,
          query: {
            pID: item?.product?.id
          }
        })
        break;
      case "nonessential":
        router.push({
          pathname: `/product-details/nonessential/${generateSlug(item?.product?.listing_title)}`,
          query: {
            pID: item?.product?.id
          }
        })
        break;
    }
  }

  // Filter unique discount tag lines
  const getUniqueDiscounts = (data) => {
    const seen = new Set();
    return data.filter(item => {
      const tagLine = item.discount?.discount_tag_line;
      if (!tagLine || seen.has(tagLine)) {
        return false;
      }
      seen.add(tagLine);
      return true;
    });
  };

  const uniqueDiscountData = getUniqueDiscounts(allDiscountData);

  const formatDiscount = (discount) => {
    if (!discount) return '';
    
    const { amount, discount_type, discount_tag_line } = discount;
    
    if (discount_type === 'precentage') {
      return ` ${discount_tag_line}`;
    } else if (discount_type === 'value') {
      return `$${amount} ${discount_tag_line}`;
    }
    
    return discount_tag_line || '';
  };

  // Check if we have any data to show
  const hasMetaData = meta && meta.length > 0;
  const hasDiscountData = uniqueDiscountData && uniqueDiscountData.length > 0;
  const shouldShowSection = hasMetaData || hasDiscountData;

  return (
    <div style={{width:"100%"}}>
      {/* Combined Special Offers Section */}
      {shouldShowSection && (
        <div 
          className="product-filter-content d-flex flex-column border-bottom pb-3"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}
        >
          <h5
            style={{
              margin: "0",
              fontWeight: "600",
              color: "#d9534f"
            }}
          >
            Special Offer
          </h5>
          
          <div style={{ position: "relative", width: "100%" }}>
            <div
              ref={sliderRef}
              className="slider-container"
              style={{ 
                display: "flex",
                flexDirection: "row",
                gap: "16px",
                overflowX: "auto",
                whiteSpace: "nowrap",
                paddingTop: "8px",
                paddingBottom: "16px",
                paddingLeft: "4px",
                paddingRight: "4px",
                scrollBehavior: "smooth",
                scrollbarWidth: "thin",
                scrollbarColor: "#dbdbdbff #f1f1f1"
              }}
            >
              <style>{`
                .slider-container::-webkit-scrollbar {
                  height: 8px;
                  display: block;
                }
                
                .slider-container::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 4px;
                }
                
                .slider-container::-webkit-scrollbar-thumb {
                  background: #888;
                  border-radius: 4px;
                }
                
                .slider-container::-webkit-scrollbar-thumb:hover {
                  background: #666;
                }
              `}</style>
              
              {/* Render Meta Data Items First */}
              {hasMetaData && meta.map((item, index) => (
                <div
                  key={`meta-${index}`}
                  style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "12px",
                    cursor: "pointer",
                    marginRight: "8px",
                    minWidth: "250px",
                    maxWidth: "300px",
                    backgroundColor: "#fff",
                    overflow: "hidden",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                  }}
                >
                  {/* Location Badge */}
                  {item.location && (
                    <div
                      style={{
                        backgroundColor: "#17a2b8",
                        color: "white",
                        fontSize: "11px",
                        fontWeight: "600",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        marginBottom: "10px",
                        textAlign: "center",
                        whiteSpace: "normal"
                      }}
                    >
                      {item.location}
                    </div>
                  )}
                  
                  {/* Service Title */}
                  {item.title && (
                    <div
                      style={{
                        backgroundColor: "#28a745",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                        padding: "6px 8px",
                        borderRadius: "4px",
                        marginBottom: "12px",
                        textAlign: "center",
                        whiteSpace: "normal"
                      }}
                    >
                      {item.title}
                    </div>
                  )}
                  
                  {/* Offer Content */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flex: 1
                    }}
                  >
                    {item.offer?.image && (
                      <img
                        src={item.offer.image}
                        alt={item.offer.title}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          marginRight: "12px",
                          flexShrink: 0
                        }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        whiteSpace: "normal",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: "3",
                        WebkitBoxOrient: "vertical",
                        maxWidth: item.offer?.image ? "calc(100% - 72px)" : "100%"
                      }}
                    >
                      {item.offer?.title}
                    </span>
                  </div>
                </div>
              ))}
              
              {/* Render Discount Data Items */}
              {hasDiscountData && uniqueDiscountData.map((item, index) => {
                const images = item.discount?.additional_data?.image?.split(",") || [];
                const title = item.discount?.additional_data?.title;
                const discountText = formatDiscount(item.discount);
                
                return (
                  <div
                    onClick={() => {handleClick(item)}}
                    key={`discount-${index}`}
                    style={{
                      display: "inline-flex",
                      flexDirection: "column",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                      padding: "10px",
                      cursor: "pointer",
                      marginRight: "8px",
                      minWidth: "250px",
                      maxWidth: "300px",
                      backgroundColor: "#fff",
                      overflow: "hidden"
                    }}
                  >
                    {/* Discount Badge */}
                    {discountText && (
                      <div
                        style={{
                          backgroundColor: "#d9534f",
                          color: "white",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          marginBottom: "10px",
                          textAlign: "center",
                          whiteSpace: "normal"
                        }}
                      >
                        {discountText}
                      </div>
                    )}
                    
                    {/* Product Content */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1
                      }}
                    >
                      {images[0] && (
                        <img
                          src={images[0]}
                          alt={title}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            marginRight: "12px",
                            flexShrink: 0
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                          whiteSpace: "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                          maxWidth: images[0] ? "calc(100% - 72px)" : "100%"
                        }}
                      >
                        {title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



// import { useRef, useEffect } from 'react';
// import { generateSlug } from '../../GlobalFunctions/OthersGlobalfunctions';
// import { useRouter } from 'next/router';

// export default function ProductSlider({ allDiscountData = [], type = null, meta = [] }) {
//   const sliderRef = useRef(null);
//   const router = useRouter();
  
//   console.log("ProductSlider component mounted", allDiscountData, type, meta);
  
//   useEffect(() => {
//     console.log("ProductSlider component mounted", allDiscountData, type, meta);
//     if (sliderRef.current) {
//       // You can add any additional initialization here
//     }
//   }, []);

//   const handleClick = (item) => {
//     switch (type) {
//       case "essential":
//         console.log("Product clicked:", item);
//         router.push({
//           pathname: `/product-details/essential/${generateSlug(item?.product?.listing_title)}`,
//           query: {
//             pID: item?.product?.id
//           }
//         })
//         break;
//       case "nonessential":
//         router.push({
//           pathname: `/product-details/nonessential/${generateSlug(item?.product?.listing_title)}`,
//           query: {
//             pID: item?.product?.id
//           }
//         })
//         break;
//     }
//   }

//   // Filter unique discount tag lines
//   const getUniqueDiscounts = (data) => {
//     const seen = new Set();
//     return data.filter(item => {
//       const tagLine = item.discount?.discount_tag_line;
//       if (!tagLine || seen.has(tagLine)) {
//         return false;
//       }
//       seen.add(tagLine);
//       return true;
//     });
//   };

//   const uniqueDiscountData = getUniqueDiscounts(allDiscountData);

//   const formatDiscount = (discount) => {
//     if (!discount) return '';
    
//     const { amount, discount_type, discount_tag_line } = discount;
    
//     if (discount_type === 'precentage') {
//       return ` ${discount_tag_line}`;
//     } else if (discount_type === 'value') {
//       return `$${amount} ${discount_tag_line}`;
//     }
    
//     return discount_tag_line || '';
//   };

//   // Check if we have any data to show
//   const hasMetaData = meta && meta.length > 0;
//   const hasDiscountData = uniqueDiscountData && uniqueDiscountData.length > 0;
//   const shouldShowSection = hasMetaData || hasDiscountData;

//   return (
//     <div>
//       {/* Combined Special Offers Section */}
//       {shouldShowSection && (
//         <div 
//           className="product-filter-content d-flex flex-column border-bottom pb-3"
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: "12px"
//           }}
//         >
//           <h5
//             style={{
//               margin: "0",
//               fontWeight: "600",
//               color: "#d9534f"
//             }}
//           >
//             Special Offer
//           </h5>
          
//           <div style={{ position: "relative", width: "100%" }}>
//             <div
//               ref={sliderRef}
//               className="slider-container"
//               style={{ 
//                 display: "flex",
//                 flexDirection: "row",
//                 gap: "16px",
//                 overflowX: "auto",
//                 whiteSpace: "nowrap",
//                 paddingTop: "8px",
//                 paddingBottom: "16px",
//                 paddingLeft: "4px",
//                 paddingRight: "4px",
//                 scrollBehavior: "smooth",
//                 scrollbarWidth: "thin",
//                 scrollbarColor: "#d9534f #f1f1f1"
//               }}
//             >
//               <style>{`
//                 .slider-container::-webkit-scrollbar {
//                   height: 8px;
//                   display: block;
//                 }
                
//                 .slider-container::-webkit-scrollbar-track {
//                   background: #f1f1f1;
//                   border-radius: 4px;
//                 }
                
//                 .slider-container::-webkit-scrollbar-thumb {
//                   background: #d9534f;
//                   border-radius: 4px;
//                 }
                
//                 .slider-container::-webkit-scrollbar-thumb:hover {
//                   background: #c9302c;
//                 }
//               `}</style>
              
//               {/* Render Meta Data Items First */}
//               {hasMetaData && meta.map((item, index) => (
//                 <div
//                   key={`meta-${index}`}
//                   style={{
//                     display: "inline-flex",
//                     flexDirection: "column",
//                     border: "1px solid #ddd",
//                     borderRadius: "8px",
//                     padding: "12px",
//                     cursor: "pointer",
//                     marginRight: "8px",
//                     minWidth: "250px",
//                     maxWidth: "300px",
//                     backgroundColor: "#fff",
//                     overflow: "hidden",
//                     boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
//                   }}
//                 >
//                   {/* Location Badge */}
//                   {item.location && (
//                     <div
//                       style={{
//                         backgroundColor: "#17a2b8",
//                         color: "white",
//                         fontSize: "11px",
//                         fontWeight: "600",
//                         padding: "4px 8px",
//                         borderRadius: "4px",
//                         marginBottom: "10px",
//                         textAlign: "center",
//                         whiteSpace: "normal"
//                       }}
//                     >
//                       {item.location}
//                     </div>
//                   )}
                  
//                   {/* Service Title */}
//                   {item.title && (
//                     <div
//                       style={{
//                         backgroundColor: "#28a745",
//                         color: "white",
//                         fontSize: "12px",
//                         fontWeight: "600",
//                         padding: "6px 8px",
//                         borderRadius: "4px",
//                         marginBottom: "12px",
//                         textAlign: "center",
//                         whiteSpace: "normal"
//                       }}
//                     >
//                       {item.title}
//                     </div>
//                   )}
                  
//                   {/* Offer Content */}
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       flex: 1
//                     }}
//                   >
//                     {item.offer?.image && (
//                       <img
//                         src={item.offer.image}
//                         alt={item.offer.title}
//                         style={{
//                           width: "60px",
//                           height: "60px",
//                           objectFit: "cover",
//                           borderRadius: "6px",
//                           marginRight: "12px",
//                           flexShrink: 0
//                         }}
//                       />
//                     )}
//                     <span
//                       style={{
//                         fontSize: "14px",
//                         fontWeight: "500",
//                         whiteSpace: "normal",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                         display: "-webkit-box",
//                         WebkitLineClamp: "3",
//                         WebkitBoxOrient: "vertical",
//                         maxWidth: item.offer?.image ? "calc(100% - 72px)" : "100%"
//                       }}
//                     >
//                       {item.offer?.title}
//                     </span>
//                   </div>
//                 </div>
//               ))}
              
//               {/* Render Discount Data Items */}
//               {hasDiscountData && uniqueDiscountData.map((item, index) => {
//                 const images = item.discount?.additional_data?.image?.split(",") || [];
//                 const title = item.discount?.additional_data?.title;
//                 const discountText = formatDiscount(item.discount);
                
//                 return (
//                   <div
//                     onClick={() => {handleClick(item)}}
//                     key={`discount-${index}`}
//                     style={{
//                       display: "inline-flex",
//                       flexDirection: "column",
//                       border: "1px solid #ccc",
//                       borderRadius: "8px",
//                       padding: "10px",
//                       cursor: "pointer",
//                       marginRight: "8px",
//                       minWidth: "250px",
//                       maxWidth: "300px",
//                       backgroundColor: "#fff",
//                       overflow: "hidden"
//                     }}
//                   >
//                     {/* Discount Badge */}
//                     {discountText && (
//                       <div
//                         style={{
//                           backgroundColor: "#d9534f",
//                           color: "white",
//                           fontSize: "12px",
//                           fontWeight: "600",
//                           padding: "6px 8px",
//                           borderRadius: "4px",
//                           marginBottom: "10px",
//                           textAlign: "center",
//                           whiteSpace: "normal"
//                         }}
//                       >
//                         {discountText}
//                       </div>
//                     )}
                    
//                     {/* Product Content */}
//                     <div
//                       style={{
//                         display: "flex",
//                         alignItems: "center",
//                         flex: 1
//                       }}
//                     >
//                       {images[0] && (
//                         <img
//                           src={images[0]}
//                           alt={title}
//                           style={{
//                             width: "60px",
//                             height: "60px",
//                             objectFit: "cover",
//                             borderRadius: "6px",
//                             marginRight: "12px",
//                             flexShrink: 0
//                           }}
//                         />
//                       )}
//                       <span
//                         style={{
//                           fontSize: "14px",
//                           fontWeight: "500",
//                           whiteSpace: "normal",
//                           overflow: "hidden",
//                           textOverflow: "ellipsis",
//                           display: "-webkit-box",
//                           WebkitLineClamp: "3",
//                           WebkitBoxOrient: "vertical",
//                           maxWidth: images[0] ? "calc(100% - 72px)" : "100%"
//                         }}
//                       >
//                         {title}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }