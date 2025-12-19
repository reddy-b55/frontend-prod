import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Image } from "react-bootstrap";
import CommonLayout from "../../../../components/shop/common-layout";
import axios from "axios";
import styles from "../order-history/PendingOrders.module.css";
import Spinner from "react-bootstrap/Spinner";
import ToastMessage from "../../../../components/Notification/ToastMessage";
// import data from "../../../../public/assets/Data/itinery_data.json";
import itinery_data from "../../../../GlobalFunctions/Data/itinery_data.json";
import Day_card from "./Day_card";
import { Router, useRouter } from "next/router";
import ModalBase from "../../../../components/common/Modals/ModalBase";
import { AppContext } from "../../../_app";
import { getPerson } from "../../../../AxiosCalls/UserServices/peopleFormServices";
// import { downloadItenary } from "../../../../AxiosCalls/UserServices/Order-Hiatory-Services";
const productionApi = axios.create({
  baseURL: "https://gateway.aahaas.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const TravelItinerary = () => {
  const router = useRouter();
   const { userId } = useContext(AppContext);
  const { id, start_date, end_date } = router.query;
  const [activeTab, setActiveTab] = useState("long");
  const [itineraryData, setItineraryData] = useState([]);
  const [itineraryData2, setItineraryData2] = useState([]);
  const [itineraryDataPassengers, setItineraryDataPassengers] = useState([]);
  const [itineraryDownloadData, setItineraryDownloadData] = useState([]);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [allPassengers, setAllPassengers] = useState([]);

  // console.log("start_date==============", start_date);
  // console.log("end_date=============", end_date);
  const banners = [
    "assets/images/Bannerimages/mainbanner/educationBanner.jpg",
    "assets/images/Bannerimages/mainbanner/essentialBanner.jpg",
    "assets/images/Bannerimages/mainbanner/hotelBanner.jpg",
    "assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg",
    "assets/images/Bannerimages/mainbanner/nonEssentialBanner.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev < banners.length - 1 ? prev + 1 : 0));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

     useEffect(() => {
          getPersonData()
      }, [userId]);

        const getPersonData = async () => {
              await getPerson(userId).then(res => {
                console.log("res for pax", res)
                  setAllPassengers(res)
              })
          }


  const [iternaryType, setIterneryType] = useState('long')
  const [isLoading, setIsloading] = useState(false)
  const [hasReorderedActivities, setHasReorderedActivities] = useState(false)

  useEffect(() => {
    fetchLocalItinerary();
  }, [iternaryType]);

  const fetchLocalItinerary = async () => {
    try {
      // console.log(id, start_date, end_date)

      let endDate = new Date(end_date).toISOString().split('T')[0]; // "2025-03-04"
      let startDate = new Date(start_date).toISOString().split('T')[0]; // "2025-03-03"

      let dataCart = { "end_date": endDate, "start_date": startDate, "type": iternaryType }
    //   let dataCart = {
    //     "end_date": "2024-12-26",
    //     "start_date": "2024-11-31",
    //     "type": "short"
    // }

      console.log(dataCart, "iternery type")
      setIsloading(true)
      setHasReorderedActivities(false) // Reset reorder flag when fetching new data
      await axios
        .post(`generate-itinerary-by-order/${id}/long/view`, dataCart)
        .then((res) => {
          console.log("dtaaaaaaaaaaaaa", res.data);
            const { status, orderIDs, passengers, ...filteredData } = res.data;
            setItineraryDownloadData(filteredData);
            console.log("dtaaaaaaaaaaaaa issss", res.data.itineraryData);
            setItineraryDataPassengers(res.data.itineraryData);
            setAllPassengers(res.data.passengers);
          setItineraryData(res.data.itineraryData.itinerary);
          setItineraryData2(res.data.itineraryData.itinerary);
        })
        .catch((err) => {
          console.log("error", err.code);

          // If error response exists and status is 504, set empty array
          // if (err.response || err.code === "ERR_NETWORK" ) {
            setItineraryData([]);
          // }

        })
        .finally(() => {
          setIsloading(false);
        });
    } catch (error) {
      console.error("Error fetching local JSON:", error);
    }
  };

  const downloadItinerary = async () => {
    try {
      console.log("📥 Download started. hasReorderedActivities:", hasReorderedActivities);
      console.log("Download started.afsngerjkfsdwefwe123", itineraryData);
      
      let filteredItineraryForDownload;
      
      if (hasReorderedActivities) {
        console.log("📥 Using reordered data");
        filteredItineraryForDownload = getFilteredItineraryDataPassengers();
        console.log("📥 Result from getFilteredItineraryDataPassengers:", filteredItineraryForDownload);
        
        // If getFilteredItineraryDataPassengers didn't work, create manually
        if (!filteredItineraryForDownload || !filteredItineraryForDownload.itinerary) {
          console.log("📥 Creating reordered data manually...");
          filteredItineraryForDownload = {
            ...itineraryDataPassengers,
            itinerary: itineraryData.map(currentDay => {
              const originalDay = itineraryDataPassengers.itinerary?.find(d => d.itinerary_date === currentDay.itinerary_date);
              if (!originalDay) {
                console.log("📥 No original day found for:", currentDay.itinerary_date);
                return currentDay;
              }
              
              console.log("📥 Manually reordering day:", currentDay.itinerary_date);
              const reorderedData = currentDay.data.map(currentItem => {
                const originalItem = originalDay.data.find(origItem => 
                  origItem.cart_booking_id === currentItem.cart_booking_id
                );
                return originalItem || currentItem;
              });
              
              return {
                ...originalDay,
                data: reorderedData
              };
            })
          };
        }
      } else {
        console.log("📥 Using original data");
        filteredItineraryForDownload = itineraryDownloadData;
      }
      
      console.log("📥 Final filteredItineraryForDownload:", filteredItineraryForDownload);
      
      // Check if there have been any modifications to the itinerary (filters or reordering)
      const hasModifications = hasReorderedActivities || (JSON.stringify(filteredItineraryForDownload) !== JSON.stringify(itineraryDownloadData));
      
      if (hasModifications) {
        
        // Try to send updated data to backend for PDF generation
        try {
          const dataToSend = {
            itineraryData: filteredItineraryForDownload,
            start_date: start_date,
            end_date: end_date,
            type: iternaryType,
            order_id: id,
            hasCustomOrder: hasReorderedActivities
          };
          
          // console.log("📤 Sending to backend:", dataToSend);
          // console.log("📤 Sending to backend:", dataToSend.itineraryData?.itinerary);
          console.log("📤 Sending to backend:",  {"edited_data" : dataToSend.itineraryData?.itinerary});
          // return;
          const response = await axios.post(`web_carft_my_adventure/${id}/${iternaryType}/view?start_date=${start_date}&end_date=${end_date}`, {"edited_data" : dataToSend.itineraryData?.itinerary}, {
            responseType: 'blob'
          });
          
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `itinerary-${id}-custom.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          ToastMessage({ status: "success", message: "PDF Generated Successfully" });
          return;
        } catch (customError) {
          console.log("Custom PDF generation failed, falling back to original method:", customError);
          // ToastMessage({ status: "warning", message: "Using original order due to technical limitations" });
        }
      }
      
      // Fallback to original method
      console.log("data pass ",iternaryType)
      // return
      // window.open(
      //   axios.defaults.baseURL + `/web_carft_my_adventure/${id}/${iternaryType}/view?start_date=${start_date}&end_date=${end_date}&type=${iternaryType}`,
      //   "_blank"
      // );
          const response = await axios.post(`web_carft_my_adventure/${id}/${iternaryType}/view?start_date=${start_date}&end_date=${end_date}`, {"edited_data" :[]}, {
            responseType: 'blob'
          });
          
          // Create blob link to download
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `itinerary-${id}-custom.pdf`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          
          ToastMessage({ status: "success", message: "PDF Generated Successfully" });
      
    } catch (err) {
      console.error("Download error:", err);
      ToastMessage({ status: "warning", message: "Network error" });
    }
  };

  const [shareModel, setShareModel] = useState(false);
  const [shareModelCart, setShareModelCart] = useState(false);
  const [showFilterModel, setShowFilterModel] = useState(false);
  const [customerEmailId, setCustomerEmailId] = useState({
    email: "",
  });
  const [filters,setFilters] = useState({
    orderIDs: [],
    travelBuddyIDs: [],
  });
  const [selectedOrderIDs, setSelectedOrderIDs] = useState([]);
const [selectedTravelBuddyIDs, setSelectedTravelBuddyIDs] = useState([]);
  // Temporary selections for the modal (before applying)
  const [tempSelectedOrderIDs, setTempSelectedOrderIDs] = useState([]);
  const [tempSelectedTravelBuddyIDs, setTempSelectedTravelBuddyIDs] = useState([]);
  const [isLoadingShare, setIsLoadingShare] = useState(false);

  // Effect to handle body scroll locking when modals are open
  useEffect(() => {
    const anyModalOpen = shareModel || showFilterModel || shareModelCart;
    
    if (anyModalOpen) {
      // Get current scroll position
      const scrollY = window.scrollY;
      
      // Disable body scroll and fix position
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Get the scroll position from the fixed top value
      const scrollY = document.body.style.top;
      
      // Restore body scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to ensure scroll is restored if component unmounts
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [shareModel, showFilterModel, shareModelCart]);

  const handleModel = () => {
    setShareModel(!shareModel);
  }

  const handleSubmit = async (e) => {
          e.preventDefault();
          if(customerEmailId.email === "" || customerEmailId.email === undefined) {
            ToastMessage({ status: "warning", message: "Please enter your email id" })
            return
          }

          if(!customerEmailId.email.includes("@")) {
            ToastMessage({ status: "warning", message: "Please enter a valid email id" })
            return
          }
          setIsLoadingShare(true)

          let itType = "";
          let itParams = null;

          // if (selectedPassenger) {
          //   itType = "Personalized";
          //   itParams = selectedPassenger;
          // } else if (selectedOrderIDs.length > 0) {
          //   itType = "OrderWise";
          //   itParams = selectedOrderIDs;
          // } else {
          //   itType = "General";
          //   itParams = null;
          // }
          
          // Get filtered itinerary data that matches current display
          const filteredItineraryForSharing = getFilteredItineraryDataPassengers();
          
          console.log("📤 Sharing: Has reordered activities:", hasReorderedActivities);
          console.log("Original itineraryDataPassengers:", itineraryDataPassengers);
          console.log("Current filtered itineraryData:", itineraryData);
          console.log("Filtered data for sharing:", filteredItineraryForSharing);
          
          const dataPack = {
            email: customerEmailId.email,
            itineraryData: JSON.stringify(filteredItineraryForSharing),
            selectedPax: null,
            type: "General",
            itParams: null,
            userData: userId,
          };

          await axios
          .post(`share-itinerary-by-order/${iternaryType}`, dataPack)
          .then((response) => {
            if (response.data.status === 200) {
              ToastMessage({ status: "success", message: "Itinerary Shared Successfully!" })
              setIsLoadingShare(false)
              setCustomerEmailId({ email: "" })
              setShareModel(false)
            } else {
              ToastMessage({ status: "error", message: "Itinerary Sharing Failed!" })
              setIsLoadingShare(false)
            }
          })
          .catch((res) => {
            console.log("error", res)
            setIsLoadingShare(false)
            ToastMessage({ status: "error", message: "Itinerary Sharing Failed!" })
          });
      }

    const handleCartInfo = () => {
      setShareModelCart(!shareModelCart);
    }

    const handleFilterModel = () => {
      setShowFilterModel(!showFilterModel);
      // manageFilter(itineraryData);
       manageFilter(itineraryData2);
       // Initialize temp selections with current applied filters when opening modal
       if (!showFilterModel) {
         setTempSelectedOrderIDs([...selectedOrderIDs]);
         setTempSelectedTravelBuddyIDs([...selectedTravelBuddyIDs]);
       }
    }

    const manageFilter = (data) => {
      console.log("data", data)
      const orderIDs = new Set();
      const travelBuddyIDs = new Set();

      data.forEach((item) => {
       item.data.forEach((entry) => {
        console.log("entry", entry)
       const { orderID, travelBuddyCombination } = entry.service_data;
       if (orderID) {
        orderIDs.add(orderID);
       }
       if (Array.isArray(travelBuddyCombination)) {
        travelBuddyCombination.forEach(id => travelBuddyIDs.add(id))
       }
      });
    });
    setFilters({
      orderIDs: Array.from(orderIDs),
      travelBuddyIDs: Array.from(travelBuddyIDs),
    })

  console.log("Travel Buddy IDs:",{
    orderIDs: Array.from(orderIDs),
    travelBuddyIDs: Array.from(travelBuddyIDs),
  });
  console.log("Travel Buddy IDs:", Array.from(travelBuddyIDs));
    }

    
    const handleOrderIDToggle = (orderId) => {
      setTempSelectedOrderIDs(prev => 
        prev.includes(orderId) 
          ? prev.filter(id => id !== orderId) 
          : [...prev, orderId]
      );
    };

    const handleTravelBuddyToggle = (buddyId) => {
      setTempSelectedTravelBuddyIDs(prev => 
        prev.includes(buddyId) 
          ? prev.filter(id => id !== buddyId) 
          : [...prev, buddyId]
      );
    };

    // Functions for removing applied filters (for the Applied Filters section)
    const removeAppliedOrderFilter = (orderId) => {
      setSelectedOrderIDs(prev => prev.filter(id => id !== orderId));
      // Re-apply filters immediately after removing
      const newSelectedOrderIDs = selectedOrderIDs.filter(id => id !== orderId);
      applyFiltersDirectly(newSelectedOrderIDs, selectedTravelBuddyIDs);
    };

    const removeAppliedTravelBuddyFilter = (buddyId) => {
      setSelectedTravelBuddyIDs(prev => prev.filter(id => id !== buddyId));
      // Re-apply filters immediately after removing
      const newSelectedTravelBuddyIDs = selectedTravelBuddyIDs.filter(id => id !== buddyId);
      applyFiltersDirectly(selectedOrderIDs, newSelectedTravelBuddyIDs);
    };

    // Helper function to apply filters directly with given parameters
    const applyFiltersDirectly = (orderIDs, travelBuddyIDs) => {
      // If no filters are selected, restore original data
      if (orderIDs.length === 0 && travelBuddyIDs.length === 0) {
        setItineraryData(itineraryData2);
        return;
      }

      // Apply filter logic
      const filteredItineraryData = itineraryData2.map((item) => {
        const filteredData = item.data.filter((entry) => {
          const orderID = entry.service_data?.orderID;
          const entryTravelBuddyIDs = entry.service_data?.travelBuddyCombination || [];

          const isOrderIDMatched = orderIDs.length === 0 || orderIDs.includes(orderID);
          const isTravelBuddyMatched =
            travelBuddyIDs.length === 0 ||
            entryTravelBuddyIDs.some((id) => travelBuddyIDs.includes(id));

          return isOrderIDMatched && isTravelBuddyMatched;
        });

        return {
          ...item,
          data: filteredData,
        };
      }).filter((item) => item.data.length > 0);

      setItineraryData(filteredItineraryData);
    };

    // Function to sync itineraryDataPassengers with current filtered itineraryData
    const getFilteredItineraryDataPassengers = () => {
      console.log("🔍 getFilteredItineraryDataPassengers called");
      console.log("🔍 itineraryDataPassengers:", itineraryDataPassengers);
      console.log("🔍 current itineraryData:", itineraryData);
      
      if (!itineraryDataPassengers || !itineraryDataPassengers.itinerary) {
        console.log("🔍 No itineraryDataPassengers, returning:", itineraryDataPassengers);
        return itineraryDataPassengers;
      }

      // Filter the itinerary array to match current itineraryData
      const filteredItinerary = itineraryDataPassengers.itinerary.filter((dayItem) => {
        // Check if this date exists in current itineraryData
        return itineraryData.some((currentDayItem) => 
          currentDayItem.itinerary_date === dayItem.itinerary_date
        );
      }).map((dayItem) => {
        // Find matching day in current itineraryData
        const matchingDay = itineraryData.find((currentDayItem) => 
          currentDayItem.itinerary_date === dayItem.itinerary_date
        );

        if (!matchingDay) {
          console.log("🔍 No matching day found for:", dayItem.itinerary_date);
          return dayItem;
        }

        console.log("🔍 Processing day:", dayItem.itinerary_date);
        console.log("🔍 Current order from itineraryData:", matchingDay.data.map(d => d.service_data?.service_name));
        console.log("🔍 Original passenger data:", dayItem.data.map(d => d.service_data?.service_name));

        // Use the order from matchingDay and get corresponding data from dayItem
        const orderedData = matchingDay.data.map((currentDataItem) => {
          // Find the corresponding data item from the original passenger data
          const originalDataItem = dayItem.data.find((dataItem) => 
            currentDataItem.cart_booking_id === dataItem.cart_booking_id
          );
          console.log("🔍 Mapping item:", currentDataItem.service_data?.service_name, "->", originalDataItem ? "found" : "not found");
          // Return the original data item (with all passenger info) but in the new order
          return originalDataItem || currentDataItem;
        }).filter(Boolean); // Remove any undefined items

        console.log("🔍 Final ordered data:", orderedData.map(d => d.service_data?.service_name));

        return {
          ...dayItem,
          data: orderedData
        };
      }).filter((dayItem) => dayItem.data.length > 0); // Remove days with no data

      const result = {
        ...itineraryDataPassengers,
        itinerary: filteredItinerary
      };
      
      console.log("🔍 Final result:", result);
      return result;
    };

    const applyFilters = () => {
      console.log("Selected Order IDs:", tempSelectedOrderIDs);
      console.log("Selected Travel Buddy IDs:", tempSelectedTravelBuddyIDs);
    
      // Update the actual selected filters
      setSelectedOrderIDs([...tempSelectedOrderIDs]);
      setSelectedTravelBuddyIDs([...tempSelectedTravelBuddyIDs]);

      // If no filters are selected, restore original data
      if (tempSelectedOrderIDs.length === 0 && tempSelectedTravelBuddyIDs.length === 0) {
        setItineraryData(itineraryData2); // Restore from backup
        setShowFilterModel(false);
        return;
      }
    
      // Your existing filter logic
      const filteredItineraryData = itineraryData2.map((item) => { // Use itineraryData2 instead of itineraryData
        const filteredData = item.data.filter((entry) => {
          const orderID = entry.service_data?.orderID;
          const travelBuddyIDs = entry.service_data?.travelBuddyCombination || [];
    
          const isOrderIDMatched = tempSelectedOrderIDs.length === 0 || tempSelectedOrderIDs.includes(orderID);
          const isTravelBuddyMatched =
            tempSelectedTravelBuddyIDs.length === 0 ||
            travelBuddyIDs.some((id) => tempSelectedTravelBuddyIDs.includes(id));
    
          return isOrderIDMatched && isTravelBuddyMatched;
        });
    
        return {
          ...item,
          data: filteredData,
        };
      }).filter((item) => item.data.length > 0);
    
      console.log("Filtered Itinerary Data:", filteredItineraryData);
    
      setItineraryData(filteredItineraryData);
      setShowFilterModel(false);
    };
    
    // Add a clearFilters function
    const clearFilters = () => {
      setTempSelectedOrderIDs([]);
      setTempSelectedTravelBuddyIDs([]);
      setSelectedOrderIDs([]);
      setSelectedTravelBuddyIDs([]);
      setItineraryData(itineraryData2); // Restore original data from backup
      // setShowFilterModel(false);
    };

    // Handle day updates from reordering
    const handleDayUpdate = (updatedDay) => {
      console.log("🔄 handleDayUpdate called with:", updatedDay);
      console.log("🔄 Before update - itineraryData:", itineraryData);
      
      // Set flag that activities have been reordered
      setHasReorderedActivities(true);
      console.log("🔄 Set hasReorderedActivities to true");
      
      // Update itineraryData
      setItineraryData(prevData => {
        const newData = prevData.map(day => 
          day.itinerary_date === updatedDay.itinerary_date 
            ? updatedDay 
            : day
        );
        console.log("🔄 Updated itineraryData:", newData);
        return newData;
      });
      
      // Update itineraryData2 (backup data) as well
      setItineraryData2(prevData => 
        prevData.map(day => 
          day.itinerary_date === updatedDay.itinerary_date 
            ? updatedDay 
            : day
        )
      );
      
      // Update itineraryDataPassengers to maintain consistency for sharing/download
      setItineraryDataPassengers(prevData => {
        console.log("🔄 Before updating itineraryDataPassengers:", prevData);
        if (!prevData || !prevData.itinerary) return prevData;
        
        const updatedData = {
          ...prevData,
          itinerary: prevData.itinerary.map(dayItem => {
            if (dayItem.itinerary_date === updatedDay.itinerary_date) {
              console.log("🔄 Updating day:", updatedDay.itinerary_date);
              console.log("🔄 Original day data:", dayItem.data);
              console.log("🔄 New order from updatedDay:", updatedDay.data);
              
              // Reorder the data based on the new order from updatedDay
              const reorderedData = updatedDay.data.map(newOrderItem => {
                // Find the corresponding item in the original passenger data
                const originalItem = dayItem.data.find(originalDataItem => 
                  originalDataItem.cart_booking_id === newOrderItem.cart_booking_id
                );
                console.log("🔄 Mapping:", newOrderItem.cart_booking_id, "->", originalItem ? "found" : "not found");
                // Return the original item (with passenger data) but in new order
                return originalItem || newOrderItem;
              });
              
              console.log("🔄 Final reordered data:", reorderedData);
              
              return {
                ...dayItem,
                data: reorderedData
              };
            }
            return dayItem;
          })
        };
        
        console.log("🔄 Final updated itineraryDataPassengers:", updatedData);
        return updatedData;
      });

      // Update itineraryDownloadData to reflect changes in PDF download
      setItineraryDownloadData(prevData => {
        if (!prevData || !prevData.itineraryData || !prevData.itineraryData.itinerary) return prevData;
        
        return {
          ...prevData,
          itineraryData: {
            ...prevData.itineraryData,
            itinerary: prevData.itineraryData.itinerary.map(day => 
              day.itinerary_date === updatedDay.itinerary_date 
                ? updatedDay 
                : day
            )
          }
        };
      });
    };



  return (
    <div>
      <Head>
        <title>Craft My Adventure</title>
      </Head>
      <CommonLayout parent="Home" title="Order History" showSearchIcon={false} showMenuIcon={false}>
        {isLoading ? (
          <div className={styles.PO_loadingContainer}>
            <Spinner animation="border" variant="danger" />
          </div>
        ) : (
          <div className="travel-itinerary">
            {/* Hero Section */}
            <div
              className="hero-section position-relative"
              style={{
                backgroundImage: `url('/assets/images/blog-banners/banner1.jpg')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "50vh",
                minHeight: "400px",
              }}
            >
              {/* Overlay */}
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6))",
                }}
              ></div>

              {/* Navigation Buttons */}
              <div className="position-absolute top-0 w-100 d-flex justify-content-between p-3">
        
                <p></p>
                <div className="d-flex gap-2">
        
                   {itineraryData?.length > 0 && (
  <Button
    variant="dark"
    className="rounded-circle p-2"
    style={{ width: "45px", height: "45px" }}
    onClick={downloadItinerary}
  >
    <i class="fa fa-download" aria-hidden="true"></i>
  </Button>
)}

                  {itineraryData?.length > 0 && (
  <Button
    variant="dark"
    className="rounded-circle p-2"
    style={{ width: "45px", height: "45px" }}
    onClick={handleFilterModel}
  >
    <i class="fa fa-filter" aria-hidden="true"></i>
  </Button>
)}
                  {itineraryData?.length > 0 && (
  <Button
    variant="dark"
    className="rounded-circle p-2"
    style={{ width: "45px", height: "45px" }}
    onClick={handleModel}
  >
    <i class="fa fa-share" aria-hidden="true"></i>
  </Button>
)}
                </div>
              </div>

              {/* Hero Content */}
              <div className="position-absolute bottom-0 start-0 w-100 p-2 p-md-4 text-white">
                <h5 className="mb-1 text-white fs-6 fs-md-3">
                  Wanderlust Chronicles: Your Travel Itinerary
                </h5>
                <h1 className="mb-3 mb-md-4 text-white fs-3 fs-md-1" style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}>
                  Your Guide to an Unforgettable Trip
                </h1>

                {/* Itinerary Type Tabs */}
                <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
                  <Button
                    variant={activeTab === "long" ? "danger" : "light"}
                    className="rounded-3 flex-fill flex-sm-grow-0"
                    size="sm"
                    style={{
                      backgroundColor:
                        activeTab === "long" ? "#ed4242" : "transparent",
                      color: "white",
                      fontSize: "0.875rem",
                      padding: "0.5rem 1rem",
                      minWidth: "120px"
                    }}
                    onClick={() => {
                      setIterneryType('long')
                      setActiveTab("long")
                    }}
                  >
                    Long Itinerary
                  </Button>
                  <Button
                    variant={activeTab === "short" ? "danger" : "light"}
                    className="rounded-3 flex-fill flex-sm-grow-0"
                    size="sm"
                    style={{
                      backgroundColor:
                        activeTab === "short" ? "#ed4242" : "transparent",
                      color: "white",
                      fontSize: "0.875rem",
                      padding: "0.5rem 1rem",
                      minWidth: "120px"
                    }}
                    onClick={() => {
                      setIterneryType('short')
                      setActiveTab("short")
                    }}
                  >
                    Short Itinerary
                  </Button>
                </div>
              </div>
            </div>

            <Container fluid className="py-4">
              {/* Reorder Status Indicator */}
              {hasReorderedActivities && (
                <div className="mb-3 p-3 bg-info text-dark rounded d-flex align-items-center">
                  <i className="fa fa-info-circle me-2" aria-hidden="true"></i>
                  <div>
                    <strong>Custom Order Active:</strong> Your itinerary has been reordered. 
                    Downloads and shares will use your custom activity order.
                  </div>
                </div>
              )}
              
              {
            (selectedOrderIDs.length > 0 || selectedTravelBuddyIDs.length > 0) && (
  <div className="mb-3">
    <h5>Applied Filters:</h5>
    <div className="d-flex flex-wrap gap-2">
      {selectedOrderIDs.map((orderId) => (
        <div 
          key={orderId} 
          className="d-flex align-items-center"
          style={{ 
            backgroundColor: '#93c5fd', 
            color: '#1e40af', 
            paddingLeft: '0.75rem', 
            paddingRight: '0.75rem', 
            paddingTop: '0.25rem', 
            paddingBottom: '0.25rem', 
            borderRadius: '9999px', 
            fontSize: '0.875rem', 
          }}
        >
          AHS_ORD{orderId}

            <span 
                            className="ms-2" 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => removeAppliedOrderFilter(orderId)}
                          >
                            &times;
                          </span>
        </div>
      ))}
      {/* {selectedTravelBuddyIDs.map((buddyId) => {
        // Find the matching passenger to show their name
        const buddy = allPassengers.find(b => b.id === parseInt(buddyId));
        const firstName = buddy ? buddy.FirstName : '';
        
        return (
          <div 
            key={buddyId} 
            className="d-flex align-items-center"
            style={{ 
              backgroundColor: '#86efac', 
              color: '#166534', 
              paddingLeft: '0.75rem', 
              paddingRight: '0.75rem', 
              paddingTop: '0.25rem', 
              paddingBottom: '0.25rem', 
              borderRadius: '9999px', 
              fontSize: '0.875rem', 
            }}
          >
            {firstName || `ID: ${buddyId}`}
            <span 
              className="ms-2" 
              style={{ cursor: 'pointer' }} 
              onClick={() => removeAppliedTravelBuddyFilter(buddyId)}
            >
              &times;
            </span>
          </div>
        );
      })} */}
         {selectedTravelBuddyIDs.map((buddyId) => {
        // Find the matching object
        const buddy = allPassengers.find(b => b.id === parseInt(buddyId));
        const firstName = buddy ?  buddy.passenger_title+ '.' + buddy.passenger_first_name + ' ' + buddy.passenger_last_name : '';
        return (
          <div 
            key={buddyId} 
            style={{ 
              backgroundColor: tempSelectedTravelBuddyIDs.includes(buddyId) ? '#86efac' : '#dcfce7', 
              color: '#166534', 
              paddingLeft: '0.75rem', 
              paddingRight: '0.75rem', 
              paddingTop: '0.25rem', 
              paddingBottom: '0.25rem', 
              borderRadius: '9999px', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center',
              // cursor: 'pointer'
            }}
            onClick={() => handleTravelBuddyToggle(buddyId)}
          >
            {firstName || `ID: ${buddyId}`}
          </div>
        );
      })}
    </div>
  </div>
)
              }
              <Row>
                {itineraryData?.length > 0 ? (
                  itineraryData.map((day, index) => (
                    <Day_card 
                      key={index} 
                      day={day} 
                      iterneryType={iternaryType} 
                      onUpdateDay={handleDayUpdate}
                    />
                  ))
                ) : (
                  <div className="text-center w-100">
                    <h5 className="text-danger">No items found for your itinerary. Please try different dates.</h5>
                  </div>
                )}
              </Row>
            </Container>
          </div>)}

          <ModalBase isOpen={shareModel} toggle={handleModel} title="Share Itinerary" size='md'>
            <div className="text-center">
              <h5 className="mb-4">Share your itinerary with friends and family!</h5>
            <form className='container d-flex flex-column align-items-center' onSubmit={handleSubmit}>
                    <input type="mail" placeholder='Enter your mail id' className='form-control py-3' onChange={(e) => setCustomerEmailId({ email : e.target.value })} />
                    <button className='btn btn-sm btn-solid mt-3' onClick={handleSubmit}>{isLoadingShare ? 'Sending...' : "Share via Email"}</button>
                </form>
                   </div>
          </ModalBase>

          <ModalBase isOpen={showFilterModel} toggle={handleFilterModel} title="Itinerary filters" size='md'>
  <div style={{ padding: '1rem' }}>
    {filters.orderIDs && filters.orderIDs.length > 0 && (
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>Order Numbers</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {filters.orderIDs.map((orderId) => (
            <div 
              key={orderId} 
              style={{ 
                backgroundColor: tempSelectedOrderIDs.includes(orderId) ? '#93c5fd' : '#f6faffff', 
                color: '#1e40af', 
                paddingLeft: '0.75rem', 
                paddingRight: '0.75rem', 
                paddingTop: '0.25rem', 
                paddingBottom: '0.25rem', 
                borderRadius: '9999px', 
                fontSize: '0.875rem', 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer' 
              }}
              onClick={() => handleOrderIDToggle(orderId)}
            >
              <input 
                type="checkbox" 
                checked={tempSelectedOrderIDs.includes(orderId)} 
                onChange={() => {}} 
                style={{ marginRight: '0.5rem' }} 
              />
              AHS_ORD{orderId}
            </div>
            

          ))}
        </div>
      </div>
    )}
    
 {filters.travelBuddyIDs && filters.travelBuddyIDs.length > 0 && (
  <div style={{ marginBottom: '1rem' }}>
    <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem' }}>Travel Buddies</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {filters.travelBuddyIDs.map((buddyId) => {
        // Find the matching object
        const buddy = allPassengers.find(b => b.id === parseInt(buddyId));
        const firstName = buddy ?  buddy.passenger_title+ '.' + buddy.passenger_first_name + ' ' + buddy.passenger_last_name : '';
        return (
          <div 
            key={buddyId} 
            style={{ 
              backgroundColor: tempSelectedTravelBuddyIDs.includes(buddyId) ? '#86efac' : '#dcfce7', 
              color: '#166534', 
              paddingLeft: '0.75rem', 
              paddingRight: '0.75rem', 
              paddingTop: '0.25rem', 
              paddingBottom: '0.25rem', 
              borderRadius: '9999px', 
              fontSize: '0.875rem', 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleTravelBuddyToggle(buddyId)}
          >
            <input 
              type="checkbox" 
              checked={tempSelectedTravelBuddyIDs.includes(buddyId)} 
              onChange={() => {}} 
              style={{ marginRight: '0.5rem' }} 
            />
            {firstName || `ID: ${buddyId}`}
          </div>
        );
      })}
    </div>
  </div>
)}

    
    {(!filters.orderIDs || filters.orderIDs.length === 0) &&
      (!filters.travelBuddyIDs || filters.travelBuddyIDs.length === 0) && (
      <div style={{ color: '#6b7280', textAlign: 'center', paddingTop: '1rem', paddingBottom: '1rem' }}>
        No filters selected
      </div>
    )}

<div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
  <Button 
    variant="outline-secondary" 
    onClick={clearFilters}
  >
    Clear Filters
  </Button>
  
  {(filters.orderIDs?.length > 0 || filters.travelBuddyIDs?.length > 0) && (
    <Button 
      variant="danger" 
      onClick={applyFilters}
      style={{ backgroundColor: '#ed4242' }}
    >
      Apply Filters
    </Button>
  )}
</div>
    
    {/* Apply Filters Button */}
    {/* {(filters.orderIDs?.length > 0 || filters.travelBuddyIDs?.length > 0) && (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <Button 
          variant="danger" 
          onClick={applyFilters}
          style={{ backgroundColor: '#ed4242' }}
        >
          Apply Filters
        </Button>
      </div>
    )} */}
  </div>
</ModalBase>
      </CommonLayout>
    </div>
  );
};

export default TravelItinerary;





