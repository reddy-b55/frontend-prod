// // Orders.jsx
// import React, { useContext, useEffect, useState } from "react";
// import { Button } from "react-bootstrap";
// import Spinner from "react-bootstrap/Spinner";
// import Image from "next/image";
// import styles from "./PendingOrders.module.css";
// import FlightCard from "./FlightCard";
// import ItemCard from "./ItemCard";
// import { AppContext } from "../../../_app";
// import { getOrderHistory } from "../../../../AxiosCalls/UserServices/UserCartservices";
// import ModalBase from "../../../../components/common/Modals/ModalBase";

// function Orders({ status = "all", key }) {
//   const { userId } = useContext(AppContext);
//   const [orders, setOrders] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedCategory, setSelectedCategory] = useState("all");
//   const [openModalLocation, setOpenModalLocation] = useState(false);

//   const [categorizedOrders, setCategorizedOrders] = useState({
//     all: [],
//     lifestyle: [],
//     flight: [],
//     hotel: [],
//     education: [],
//     essentials: [],
//     essNonEssentials: [],
//   });

//   const [flightData, setFlightData] = useState();

//   const handleToggle = (flightDataInput) => {
//     console.log("handleToggle called", flightDataInput);
  
//     if (flightDataInput?.flightContactDetails) {
//       const parsedFlightContactDetails = JSON.parse(flightDataInput.flightContactDetails);
//       const parsedFlightCustomerSearch = JSON.parse(flightDataInput.flightCustomerSearch);
//       const parsedFlightsData = JSON.parse(flightDataInput.flightsData);
//       const adultData = JSON.parse(flightDataInput.flightAdult);

//       let data = {
//         flightContactDetails: parsedFlightContactDetails,
//         flightCustomerSearch: parsedFlightCustomerSearch,
//         flightsData: parsedFlightsData,
//         flightAdult: adultData,
//       };
  
//       console.log("Parsed flightContactDetails", data);

  
//       setFlightData(data);
//     }
  
//     setOpenModalLocation(!openModalLocation);
//     // setStateHandle(true);
//   };
//    const handleClose = () => {
//     setOpenModalLocation(!openModalLocation);
//    }
  
//   // const handleToggle = (flightData)=>{
//   //   console.log("handleToggle called", flightData)
//   //   if(flightData?.flightContactDetails){
//   //     console.log("handleToggle called", JSON.parse(flightData?.flightContactDetails))
//   //     console.log("handleToggle called", JSON.parse(flightData?.flightCustomerSearch))
//   //     console.log("handleToggle called", JSON.parse(flightData?.flightsData))
//   //   }

//   //   setOpenModalLocation(!openModalLocation)
//   //   // setStateHandle(true)
//   // }

//   function getEndpoint(status) {
//     const endpoints = {
//       all: "All",
//       pending: "CustomerOrdered",
//       ongoing: "Approved",
//       cancelled: "Cancel",
//       completed: "Completed",
//     };
//     return endpoints[status] || "All Orders";
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!userId) return;

//       setLoading(true);
//       try {
//         const response = await getOrderHistory(userId, getEndpoint(status));
//         if (response?.data?.query_data1) {
//           // console.log("Orders fetched successfully:", response.data.query_data1);
//           setOrders(response.data.query_data1);

//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     setCategorizedOrders({
//       all: [],
//       lifestyle: [],
//       flight: [],
//       hotel: [],
//       education: [],
//       essentials: [],
//       essNonEssentials: [],
//     });

//     fetchData();
//   }, [userId, status, key]);

//   useEffect(() => {
//     if (!orders) return;

//     const newCategorizedOrders = {
//       all: orders,
//       lifestyle: [],
//       flight: [],
//       hotel: [],
//       education: [],
//       essentials: [],
//       essNonEssentials: [],
//     };

//     orders.forEach((order) => {
//       switch (order?.main_category_id) {
//         case 3:
//           newCategorizedOrders.lifestyle.push(order);
//           break;
//         case 5:
//           console.log("education Data", order?.main_category_id);
//           newCategorizedOrders.education.push(order);
//           break;
//         case 6:
//           newCategorizedOrders.flight.push(order);
//           break;
//         case 4:
//           newCategorizedOrders.hotel.push(order);
//           break;
//         case 2:
//           newCategorizedOrders.essNonEssentials.push(order);
//           break;
//         case 1:
//           newCategorizedOrders.essentials.push(order);
//           break;
//         default:
//         // console.log(`Unhandled category ID: ${order?.main_category_id}`);
//       }
//     });
//     setCategorizedOrders(newCategorizedOrders);
//   }, [orders]);
 
//   const categoryButtons = [
//     { id: "all", icon: "summary", label: "All Categories" },
//     { id: "lifestyle", icon: "lifestyle", label: "Life Style" },
//     { id: "flights", icon: "flight", label: "Flights" },
//     { id: "hotels", icon: "hotel", label: "Hotels" },
//     { id: "education", icon: "education", label: "Education" },
//     { id: "essentials", icon: "ess", label: "Essentials" },
//     { id: "nonessentials", icon: "noness", label: "Non-Essentials" },
//   ];

//   // Safe JSON parsing helper function
//   const safeJsonParse = (jsonString, fallback = null) => {
//     if (!jsonString) return fallback;
//     try {
//       return JSON.parse(jsonString);
//     } catch (error) {
//       console.error("Error parsing JSON:", error);
//       return fallback;
//     }
//   };

//   // useEffect(() => {
//   //   if(status === "all") {
//   //     console.log("All Orders", categorizedOrders.all);
//   //     console.log ("Hotel Orders", categorizedOrders.hotel);
//   //   }
//   // }, [categorizedOrders.hotel]);

//   const renderCategoryContent = () => {
//     switch (selectedCategory) {
//       case "all":
//         return categorizedOrders.all
//           .map((order, index) => {
//             if (order.main_category_id === 6) {
//               console.log("Flight Data", order);
//               const flightValidData = safeJsonParse(order.flightValidData);
//               const flightsData = safeJsonParse(order.flightsData);

//               if (!flightValidData || !flightsData) return null;

//               return (
//                 <FlightCard
//                   O_id={order.id}
//                   order={order}
//                   key={index}
//                   flightValidData={flightValidData}
//                   flightsData={flightsData}
//                   handleToggle={handleToggle}
//                 />
//               );
//             } else if (order.main_category_id === 3) {
//               // console.log("Life Data ALLLLLL");

//               // let image = null
//               // if(order?.LSImage){

//               //   image = order?.LSImage.split(",")?.[0]
//               //   console.log("Image isss dataaaaaaaa", image)
//               // }
//               // else{

//               // }

//               // console.log(order?.LSImage,"Image isss dataaaaaaaa")

//               return (
//                 <ItemCard
//                   key={index}
//                   O_id={order.id}
//                   image={order?.LSImage?.split(",")?.[0]}
//                   title={order.lifestyle_name}
//                   date={order.LifeStylePrefDate}
//                   qty={`Adults - ${
//                     order?.lifestyle_adult_count || 0
//                   } | Children - ${order?.lifestyle_children_count || 0}`}
//                   price={order.total_price}
//                   main_category_id={order.main_category_id}
//                 />
//               );
//             } else if (order.main_category_id === 4) {
//               // console.log("--------Hotel Data--------------", order.HotelData);
//               // const hotelData = safeJsonParse(order.HotelData);
//               // const hotelDataDiscount = JSON.parse(order?.HotelDiscount);
//               // console.log("hotet item set isssssssssssssssssssssss", hotelData.hotelMainRequest?.hotelData?.hotelName ," ---- ",hotelDataDiscount);
//               // console.log("--------Hotel Data--------------222222222", hotelData);
//               if (!hotelData) {
//                 return null;
//               }

//               return (
//                 <ItemCard
//                   key={index}
//                   O_id={order.id}
//                   main_category_id={order.main_category_id}
//                   image={
//                     hotelData.hotelMainRequest?.hotelData?.images?.split(
//                       ","
//                     )?.[0]
//                   }
//                   title={
//                     hotelData.hotelMainRequest?.hotelData?.hotelName ||
//                     "Hotel Booking"
//                   }
//                   date={hotelData?.CheckInDate || "N/A"}
//                   price={
//                     hotelData?.hotelRatesRequest?.Price?.CurrencyCode &&
//                     hotelData?.hotelRatesRequest?.Price?.PublishedPrice
//                       ? ` ${hotelData.hotelRatesRequest.Price.PublishedPrice}`
//                       : order.total_price || "N/A"
//                   }
//                   qty={`Adults - ${hotelData?.NoOfAdults || 0}, Children - ${
//                     hotelData?.NoOfChild || 0
//                   }, Nights - ${hotelData?.NoOfNights || 0}`}
//                   discount={hotelDataDiscount || [] }
//                 />
//               );
//             } else if (order.main_category_id === 5) {
//               console.log("Education isss  Data 123", order);

//               return (
//                 <ItemCard
//                   key={index}
//                   O_id={order.id}
//                   image={order.image_path?.split(",")?.[0]}
//                   title={order.course_name || "Education Course"}
//                   date={order.preffered_booking_date}
//                   qty={`1 (${order?.student_type || "Student"})`}
//                   price={order.total_price || "N/A"}
//                   main_category_id={order.main_category_id}
//                   currency = {order?.ItemCurrency}
//                   discount={order.course_name}
//                 />
//               );
//             } else if (order.main_category_id === 2) {
//               return (
//                 <ItemCard
//                   key={index}
//                   main_category_id={order.main_category_id}
//                   O_id={order.id}
//                   image={order.product_images?.split(",")?.[0]}
//                   title={order.listing_title || "Non-Essential Item"}
//                   date={
//                     order.LifeStylePrefDate
//                       ? `${order.LifeStylePrefDate} delivery`
//                       : null
//                   }
//                   price={order.total_price || "N/A"}
//                   qty={order.quantity || 1}
                
//                 />
//               );
//             } else if (order.main_category_id === 1) {
//               return (
//                 <ItemCard
//                   key={index}
//                   O_id={order.id}
//                   image={order.product_images?.split(",")?.[0]}
//                   title={order.listing_title || "Essential Item"}
//                   date={
//                     order.delivery_date
//                       ? `${order.delivery_date} delivery`
//                       : null
//                   }
//                   price={order.total_price || "N/A"}
//                   qty={order.quantity || 1}
//                   main_category_id={order.main_category_id}
//                 />
//               );
//             } else {
//               return null;
//             }
//           })
//           .filter(Boolean);

//       case "lifestyle":
//         // console.log("--------Life Data-------------- lifestyle");
//         return categorizedOrders.lifestyle.map((order, index) => (
//           <ItemCard
//             key={index}
//             O_id={order.id}
//             image={order.LSImage?.split(",")?.[0]}
//             title={order.lifestyle_name}
//             date={order.LifeStylePrefDate}
//             qty={`Adults - ${order?.lifestyle_adult_count || 0} | Children - ${
//               order?.lifestyle_children_count || 0
//             }`}
//             price={order.total_price}
//             main_category_id={order.main_category_id}
//           />
//         ));

//       case "flights":
//         return categorizedOrders.flight
//           .map((order, index) => {
//             console.log("Flight Data", order.id);
//             const flightValidData = safeJsonParse(order.flightValidData);
//             const flightsData = safeJsonParse(order.flightsData);

//             if (!flightValidData || !flightsData) return null;

//             return (
//               <FlightCard
//                 key={index}
//                 O_id={order.id}
//                 order={order}
//                 flightValidData={flightValidData}
//                 flightsData={flightsData}
//                 handleToggle={handleToggle}
//               />
//             );
//           })
//           .filter(Boolean);

//       case "hotels":
//         return categorizedOrders.hotel
//           .map((order, index) => {
//             const hotelData = safeJsonParse(order.HotelData);
//             const hotelDataDiscount = JSON.parse(order?.HotelDiscount);
//             console.log("Hotel Data issssssssss", order.HotelData);
//             // console.log("--------Hotel Data--------------", order.HotelData);
//             if (!hotelData) {
//               return null;
//             }

//             return (
//               <ItemCard
//                 key={index}
//                 O_id={order.id}
//                 image={
//                   hotelData.hotelMainRequest?.hotelData?.images?.split(",")?.[0]
//                 }
//                 title={
//                   hotelData.hotelMainRequest?.hotelData?.hotelName ||
//                   "Hotel Booking"
//                 }
//                 date={hotelData?.CheckInDate || "N/A"}
//                 price={
//                   hotelData?.hotelRatesRequest?.Price?.CurrencyCode &&
//                   hotelData?.hotelRatesRequest?.Price?.PublishedPrice
//                     // ? `${hotelData.hotelRatesRequest.Price.CurrencyCode} ${hotelData.hotelRatesRequest.Price.PublishedPrice}`
//                     ?  `${hotelData.hotelRatesRequest.Price.PublishedPrice}`
//                     : order.total_price || "N/A"
//                 }
//                 main_category_id={order.main_category_id}
//                 qty={`Adults - ${hotelData?.NoOfAdults || 0}, Children - ${
//                   hotelData?.NoOfChild || 0
//                 }, Nights - ${hotelData?.NoOfNights || 0}`}
//                 discount={hotelDataDiscount || [] }
//               />
//             );
//           })
//           .filter(Boolean);

//       case "education":
//         return categorizedOrders.education.map((order, index) => (
//           <ItemCard
//             key={index}
//             O_id={order.id}
//             image={order.image_path?.split(",")?.[0]}
//             title={order.course_name || "Education Course"}
//             date={order.preffered_booking_date}
//             qty={`1 (${order?.student_type || "Student"})`}
//             price={order.total_price || "N/A"}
//             main_category_id={order.main_category_id}
//           />
//         ));

//       case "essentials":
//         return categorizedOrders.essentials.map((order, index) => (
//           <ItemCard
//             key={index}
//             O_id={order.id}
//             image={order.product_images?.split(",")?.[0]}
//             title={order.listing_title || "Essential Item"}
//             date={
//               order.delivery_date ? `${order.delivery_date} delivery` : null
//             }
//             price={order.total_price || "N/A"}
//             qty={order.quantity || 1}
//             main_category_id={order.main_category_id}
//           />
//         ));

//       case "nonessentials":
//         return categorizedOrders.essNonEssentials.map((order, index) => (
//           <ItemCard
//             key={index}
//             O_id={order.id}
//             image={order.product_images?.split(",")?.[0]}
//             title={order.listing_title || "Non-Essential Item"}
//             date={
//               order.LifeStylePrefDate
//                 ? `${order.LifeStylePrefDate} delivery`
//                 : null
//             }
//             price={order.total_price || "N/A"}
//             qty={order.quantity || 1}
//             main_category_id={order.main_category_id}
//           />
//         ));

//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className={styles.PO_loadingContainer}>
//         <Spinner animation="border" variant="danger" />
//       </div>
//     );
//   }

//   return (
//     <div className={styles.PO_container}>
//       <div className={styles.PO_buttonContainer}>
//         {categoryButtons.map(({ id, icon, label }) => (
//           <Button
//             key={id}
//             className={styles.PO_categoryButton}
//             onClick={() => setSelectedCategory(id)}
//             style={
//               selectedCategory === id ? { backgroundColor: "#fff8dc" } : {}
//             }
//           >
//             <Image
//               src={`/assets/images/Icons/${icon}.png`}
//               alt={label}
//               width={20}
//               height={20}
//             />
//             {label}
//           </Button>
//         ))}
//       </div>
//       <div className={styles.PO_cardContainer}>{renderCategoryContent()}</div>

//       <ModalBase isOpen={openModalLocation} toggle={() => setOpenModalLocation(false)} title={"Passenger Details"}>
//       <div className="px-3">
//         {/* Passenger Details Section */}
//         <div style={{ 
//           padding: '16px', 
//           borderBottom: '1px solid #e0e0e0',
//           marginBottom: '16px'
//         }}>
//           <h3 style={{ 
//             fontSize: '18px', 
//             fontWeight: '600', 
//             marginBottom: '16px',
//             color: '#333'
//           }}>Passenger Information</h3>
          
//           {flightData?.flightAdult.map((passenger, index) => (
//             <div key={index} style={{ 
//               backgroundColor: '#f9f9f9', 
//               borderRadius: '8px', 
//               padding: '16px',
//               marginBottom: '16px',
//               boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//             }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                 <span style={{ fontWeight: '600' }}>Passenger {index + 1}</span>
//                 <span style={{ 
//                   backgroundColor: '#e6f7ff', 
//                   color: '#0077cc', 
//                   padding: '2px 8px', 
//                   borderRadius: '4px',
//                   fontSize: '14px'
//                 }}>Adult</span>
//               </div>
              
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Name:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.title} {passenger?.firstName} {passenger?.lastName}</p>
//                 </div>
                
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Gender:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.gender}</p>
//                 </div>
                
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Date of Birth:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.passportDOB}</p>
//                 </div>
                
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Nationality:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.nationality?.flag} {passenger?.nationality?.name}</p>
//                 </div>
                
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Passport No:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.passportNo}</p>
//                 </div>
                
//                 <div>
//                   <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Passport Expiry:</p>
//                   <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.expiryDate}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
        
//         {/* Contact Details Section */}
//         <div style={{ padding: '16px' }}>
//           <h3 style={{ 
//             fontSize: '18px', 
//             fontWeight: '600', 
//             marginBottom: '16px',
//             color: '#333'
//           }}>Contact Details</h3>
          
//           <div style={{ 
//             backgroundColor: '#f9f9f9', 
//             borderRadius: '8px', 
//             padding: '16px',
//             marginBottom: '16px',
//             boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
//           }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//               <div>
//                 <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Email: {flightData?.flightContactDetails.email}</p>
//                 <p></p>
//                 <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Contact Number: {flightData?.flightContactDetails.contact}</p>
//               </div>
              
       
//             </div>
//           </div>
//         </div>
        
//         {/* Action Buttons */}
      
//       </div>
//     </ModalBase>
//     </div>
//   );
// }

// export default Orders;

// Orders.jsx
import React, { useContext, useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import Spinner from "react-bootstrap/Spinner";
import Image from "next/image";
import styles from "./PendingOrders.module.css";
import FlightCard from "./FlightCard";
import ItemCard from "./ItemCard";
import { AppContext } from "../../../_app";
import { getOrderHistory } from "../../../../AxiosCalls/UserServices/UserCartservices";
import ModalBase from "../../../../components/common/Modals/ModalBase";

function Orders({ status = "all", key }) {
  const { userId } = useContext(AppContext);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openModalLocation, setOpenModalLocation] = useState(false);

  const [categorizedOrders, setCategorizedOrders] = useState({
    all: [],
    lifestyle: [],
    flight: [],
    hotel: [],
    education: [],
    essentials: [],
    essNonEssentials: [],
  });

  const [flightData, setFlightData] = useState();

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
    // setStateHandle(true);
  };
   const handleClose = () => {
    setOpenModalLocation(!openModalLocation);
   }

  function getEndpoint(status) {
    const endpoints = {
      all: "All",
      pending: "CustomerOrdered",
      ongoing: "Approved",
      cancelled: "Cancel",
      completed: "Completed",
    };
    return endpoints[status] || "All Orders";
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        const response = await getOrderHistory(userId, getEndpoint(status));
        if (response?.data?.query_data1) {
          setOrders(response.data.query_data1);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    setCategorizedOrders({
      all: [],
      lifestyle: [],
      flight: [],
      hotel: [],
      education: [],
      essentials: [],
      essNonEssentials: [],
    });

    fetchData();
  }, [userId, status, key]);

  useEffect(() => {
    if (!orders) return;

    const newCategorizedOrders = {
      all: orders,
      lifestyle: [],
      flight: [],
      hotel: [],
      education: [],
      essentials: [],
      essNonEssentials: [],
    };

    orders.forEach((order) => {
      switch (order?.main_category_id) {
        case 3:
          newCategorizedOrders.lifestyle.push(order);
          break;
        case 5:
          console.log("education Data", order?.main_category_id);
          newCategorizedOrders.education.push(order);
          break;
        case 6:
          newCategorizedOrders.flight.push(order);
          break;
        case 4:
          newCategorizedOrders.hotel.push(order);
          break;
        case 2:
          newCategorizedOrders.essNonEssentials.push(order);
          break;
        case 1:
          newCategorizedOrders.essentials.push(order);
          break;
        default:
        // console.log(`Unhandled category ID: ${order?.main_category_id}`);
      }
    });
    setCategorizedOrders(newCategorizedOrders);
  }, [orders]);
 
  const categoryButtons = [
    { id: "all", icon: "summary", label: "All Categories" },
    { id: "lifestyle", icon: "lifestyle", label: "Life Style" },
    { id: "flights", icon: "flight", label: "Flights" },
    { id: "hotels", icon: "hotel", label: "Hotels" },
    { id: "education", icon: "education", label: "Education" },
    { id: "essentials", icon: "ess", label: "Essentials" },
    { id: "nonessentials", icon: "noness", label: "Non-Essentials" },
  ];

  // Safe JSON parsing helper function
  const safeJsonParse = (jsonString, fallback = null) => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return fallback;
    }
  };

  // Helper function to get category display name
  const getCategoryDisplayName = (categoryId) => {
    const categoryMap = {
      all: "All Categories",
      lifestyle: "Lifestyle",
      flights: "Flights",
      hotels: "Hotels",  
      education: "Education",
      essentials: "Essentials",
      nonessentials: "Non-Essentials"
    };
    return categoryMap[categoryId] || categoryId;
  };

  // Helper function to render "No Orders" message
  const renderNoOrdersMessage = (category) => (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      color: '#666',
      fontSize: '16px'
    }}>
      <h4 style={{ marginBottom: '8px', color: '#999' }}>No Orders Found</h4>
    </div>
  );

  const renderCategoryContent = () => {
    const currentOrders = categorizedOrders[selectedCategory === 'flights' ? 'flight' : selectedCategory === 'hotels' ? 'hotel' : selectedCategory === 'nonessentials' ? 'essNonEssentials' : selectedCategory];
    
    // Check if current category has no orders
    if (!currentOrders || currentOrders.length === 0) {
      return renderNoOrdersMessage(selectedCategory);
    }

    switch (selectedCategory) {
      case "all":
        const allOrdersContent = categorizedOrders.all
          .map((order, index) => {
            if (order.main_category_id === 6) {
              console.log("Flight Data", order);
              const flightValidData = safeJsonParse(order.flightValidData);
              const flightsData = safeJsonParse(order.flightsData);

              if (!flightValidData || !flightsData) return null;

              return (
                <FlightCard
                  O_id={order.id}
                  order={order}
                  key={index}
                  flightValidData={flightValidData}
                  flightsData={flightsData}
                  handleToggle={handleToggle}
                />
              );
            } else if (order.main_category_id === 3) {
              return (
                <ItemCard
                  key={index}
                  O_id={order.id}
                  image={order?.LSImage?.split(",")?.[0]}
                  title={order.lifestyle_name}
                  date={order.LifeStylePrefDate}
                  qty={`Adults - ${
                    order?.lifestyle_adult_count || 0
                  } | Children - ${order?.lifestyle_children_count || 0}`}
                  price={order.total_price}
                  main_category_id={order.main_category_id}
                />
              );
            } else if (order.main_category_id === 4) {
              const hotelData = safeJsonParse(order.HotelData);
              const hotelDataDiscount = JSON.parse(order?.HotelDiscount);
              
              if (!hotelData) {
                return null;
              }

              return (
                <ItemCard
                  key={index}
                  O_id={order.id}
                  main_category_id={order.main_category_id}
                  image={
                    hotelData.hotelMainRequest?.hotelData?.images?.split(
                      ","
                    )?.[0]
                  }
                  title={
                    hotelData.hotelMainRequest?.hotelData?.hotelName ||
                    "Hotel Booking"
                  }
                  date={hotelData?.CheckInDate || "N/A"}
                  price={
                    hotelData?.hotelRatesRequest?.Price?.CurrencyCode &&
                    hotelData?.hotelRatesRequest?.Price?.PublishedPrice
                      ? ` ${hotelData.hotelRatesRequest.Price.PublishedPrice}`
                      : order.total_price || "N/A"
                  }
                  qty={`Adults - ${hotelData?.NoOfAdults || 0}, Children - ${
                    hotelData?.NoOfChild || 0
                  }, Nights - ${hotelData?.NoOfNights || 0}`}
                  discount={hotelDataDiscount || [] }
                />
              );
            } else if (order.main_category_id === 5) {
              console.log("Education isss  Data 123", order);

              return (
                <ItemCard
                  key={index}
                  O_id={order.id}
                  image={order.image_path?.split(",")?.[0]}
                  title={order.course_name || "Education Course"}
                  date={order.preffered_booking_date}
                  qty={`1 (${order?.student_type || "Student"})`}
                  price={order.total_price || "N/A"}
                  main_category_id={order.main_category_id}
                  currency = {order?.ItemCurrency}
                  discount={order.course_name}
                />
              );
            } else if (order.main_category_id === 2) {
              return (
                <ItemCard
                  key={index}
                  main_category_id={order.main_category_id}
                  O_id={order.id}
                  image={order.product_images?.split(",")?.[0]}
                  title={order.listing_title || "Non-Essential Item"}
                  date={
                    order.LifeStylePrefDate
                      ? `${order.LifeStylePrefDate} delivery`
                      : null
                  }
                  price={order.total_price || "N/A"}
                  qty={order.quantity || 1}
                />
              );
            } else if (order.main_category_id === 1) {
              return (
                <ItemCard
                  key={index}
                  O_id={order.id}
                  image={order.product_images?.split(",")?.[0]}
                  title={order.listing_title || "Essential Item"}
                  date={
                    order.delivery_date
                      ? `${order.delivery_date} delivery`
                      : null
                  }
                  price={order.total_price || "N/A"}
                  qty={order.quantity || 1}
                  main_category_id={order.main_category_id}
                />
              );
            } else {
              return null;
            }
          })
          .filter(Boolean);

        return allOrdersContent.length > 0 ? allOrdersContent : renderNoOrdersMessage('all');

      case "lifestyle":
        return categorizedOrders.lifestyle.map((order, index) => (
          <ItemCard
            key={index}
            O_id={order.id}
            image={order.LSImage?.split(",")?.[0]}
            title={order.lifestyle_name}
            date={order.LifeStylePrefDate}
            qty={`Adults - ${order?.lifestyle_adult_count || 0} | Children - ${
              order?.lifestyle_children_count || 0
            }`}
            price={order.total_price}
            main_category_id={order.main_category_id}
          />
        ));

      case "flights":
        return categorizedOrders.flight
          .map((order, index) => {
            console.log("Flight Data", order.id);
            const flightValidData = safeJsonParse(order.flightValidData);
            const flightsData = safeJsonParse(order.flightsData);

            if (!flightValidData || !flightsData) return null;

            return (
              <FlightCard
                key={index}
                O_id={order.id}
                order={order}
                flightValidData={flightValidData}
                flightsData={flightsData}
                handleToggle={handleToggle}
              />
            );
          })
          .filter(Boolean);

      case "hotels":
        return categorizedOrders.hotel
          .map((order, index) => {
            const hotelData = safeJsonParse(order.HotelData);
            const hotelDataDiscount = JSON.parse(order?.HotelDiscount);
            console.log("Hotel Data issssssssss", order.HotelData);
            
            if (!hotelData) {
              return null;
            }

            return (
              <ItemCard
                key={index}
                O_id={order.id}
                image={
                  hotelData.hotelMainRequest?.hotelData?.images?.split(",")?.[0]
                }
                title={
                  hotelData.hotelMainRequest?.hotelData?.hotelName ||
                  "Hotel Booking"
                }
                date={hotelData?.CheckInDate || "N/A"}
                price={
                  hotelData?.hotelRatesRequest?.Price?.CurrencyCode &&
                  hotelData?.hotelRatesRequest?.Price?.PublishedPrice
                    ? `${hotelData.hotelRatesRequest.Price.PublishedPrice}`
                    : order.total_price || "N/A"
                }
                main_category_id={order.main_category_id}
                qty={`Adults - ${hotelData?.NoOfAdults || 0}, Children - ${
                  hotelData?.NoOfChild || 0
                }, Nights - ${hotelData?.NoOfNights || 0}`}
                discount={hotelDataDiscount || [] }
              />
            );
          })
          .filter(Boolean);

      case "education":
        return categorizedOrders.education.map((order, index) => (
          <ItemCard
            key={index}
            O_id={order.id}
            image={order.image_path?.split(",")?.[0]}
            title={order.course_name || "Education Course"}
            date={order.preffered_booking_date}
            qty={`1 (${order?.student_type || "Student"})`}
            price={order.total_price || "N/A"}
            main_category_id={order.main_category_id}
          />
        ));

      case "essentials":
        return categorizedOrders.essentials.map((order, index) => (
          <ItemCard
            key={index}
            O_id={order.id}
            image={order.product_images?.split(",")?.[0]}
            title={order.listing_title || "Essential Item"}
            date={
              order.delivery_date ? `${order.delivery_date} delivery` : null
            }
            price={order.total_price || "N/A"}
            qty={order.quantity || 1}
            main_category_id={order.main_category_id}
          />
        ));

      case "nonessentials":
        return categorizedOrders.essNonEssentials.map((order, index) => (
          <ItemCard
            key={index}
            O_id={order.id}
            image={order.product_images?.split(",")?.[0]}
            title={order.listing_title || "Non-Essential Item"}
            date={
              order.LifeStylePrefDate
                ? `${order.LifeStylePrefDate} delivery`
                : null
            }
            price={order.total_price || "N/A"}
            qty={order.quantity || 1}
            main_category_id={order.main_category_id}
          />
        ));

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.PO_loadingContainer}>
        <Spinner animation="border" variant="danger" />
      </div>
    );
  }

  // Show "No Orders" message if no orders at all
  if (!orders || orders.length === 0) {
    return (
      <div className={styles.PO_container}>
        <div className={styles.PO_buttonContainer}>
          {categoryButtons.map(({ id, icon, label }) => (
            <Button
              key={id}
              className={styles.PO_categoryButton}
              onClick={() => setSelectedCategory(id)}
              style={
                selectedCategory === id ? { backgroundColor: "#fff8dc" } : {}
              }
            >
              <Image
                src={`/assets/images/Icons/${icon}.png`}
                alt={label}
                width={20}
                height={20}
              />
              {label}
            </Button>
          ))}
        </div>
        <div className={styles.PO_cardContainer}>
          {renderNoOrdersMessage('all')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.PO_container}>
      <div className={styles.PO_buttonContainer}>
        {categoryButtons.map(({ id, icon, label }) => (
          <Button
            key={id}
            className={styles.PO_categoryButton}
            onClick={() => setSelectedCategory(id)}
            style={
              selectedCategory === id ? { backgroundColor: "#fff8dc" } : {}
            }
          >
            <Image
              src={`/assets/images/Icons/${icon}.png`}
              alt={label}
              width={20}
              height={20}
            />
            {label}
          </Button>
        ))}
      </div>
      <div className={styles.PO_cardContainer}>{renderCategoryContent()}</div>

      <ModalBase isOpen={openModalLocation} toggle={() => setOpenModalLocation(false)} title={"Passenger Details"}>
      <div className="px-3">
        {/* Passenger Details Section */}
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
          
          {flightData?.flightAdult.map((passenger, index) => (
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
                
                {/* <div>
                  <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Nationality2222:</p>
                  <p style={{ fontSize: '16px', margin: '0' }}>{passenger?.nationality?.flag} {passenger?.nationality?.name}</p>
                </div> */}
                
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
        
        {/* Contact Details Section */}
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
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Email: {flightData?.flightContactDetails.email}</p>
                <p></p>
                <p style={{ fontSize: '14px', color: '#666', margin: '4px 0' }}>Contact Number: {flightData?.flightContactDetails.contact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalBase>
    </div>
  );
}

export default Orders;
