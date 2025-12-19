import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Minus, Plus, ArrowLeft, ArrowRight, Calendar, X, ChevronDown } from "lucide-react";
import axios from "axios";
import CalendarPicker from "./CalendarPicker";

// Mock colors object
const newColors = {
  primary1: "#2196f3",
  primary4: "#1976d2",
  primary5: "#0d47a1"
};



export default function TicketSelector({
  handleOnPressContinueData = () => {},
  handleClickBack = () => {},
  attractionTickets = { data: { tickets: [] } },
  loaders = false,
  setLoaders = () => {},
  selectedDate = null,
  formattedDate = ""
}) {
  console.log("TicketSelector Props:", attractionTickets)
  // Mock toast function
  const showToast = ({ type, text1, text2 }) => {
    alert(`${text1}: ${text2}`);
  };

  const ticketData = attractionTickets || [];

  const initializeTicketCounts = () => {
    const initialCounts = {};
    ticketData.forEach(ticket => {
      initialCounts[ticket.sku_id] = 0;
    });
    return initialCounts;
  };

  const [ticketCounts, setTicketCounts] = useState(() => 
    ticketData && ticketData.length > 0 ? initializeTicketCounts() : {}
  );

  const [selectedDates, setSelectedDates] = useState({});
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [currentTicketForDate, setCurrentTicketForDate] = useState(null);
  const [availabilityData, setAvailabilityData] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [availableQuantities, setAvailableQuantities] = useState({});

  useEffect(() => {
    if (selectedDate && ticketData.length > 0) {
      const initialSelectedDates = {};
      ticketData.forEach(ticket => {
        initialSelectedDates[ticket.sku_id] = new Date(selectedDate);
      });
      console.log("Initial selected dates:", initialSelectedDates);
      setSelectedDates(initialSelectedDates);
    }
  }, [selectedDate, ticketData]);

  const fetchTicketAvailability = async (skuId) => {
    console.log(`Fetching availability for SKU: ${skuId}`);
    try {
      setLoadingAvailability(prev => ({ ...prev, [skuId]: true }));
      setAvailabilityErrors(prev => ({ ...prev, [skuId]: null }));
      
      const ticket = ticketData.find(t => t.sku_id === skuId);
      console.log("Ticket found:", ticket);
      if (!ticket) return;
      
      const requestDate = selectedDate || ticket.booking_period.start_date;
      console.log(`Requesting availability for SKU`, requestDate , skuId);
      // Mock API call - replace with actual API
      const response = await axios.get(`/cebu/ticket/availabilities/${skuId}`, {
              params: {
                date: requestDate
              }
            });
            console.log(`Response for SKU`, response.data);
            if (response.data.success) {
              setAvailabilityData(prev => ({
                ...prev,
                [skuId]: response.data.data
              }));
              console.log(`Availability data for ${skuId}:`, response.data.data);
            } else {
              setAvailabilityErrors(prev => ({
                ...prev,
                [skuId]: response.data.message || "Failed to fetch availability"
              }));
            }
      
    } catch (error) {
      console.error(`Error fetching availability for ${skuId}:`, error);
      setAvailabilityErrors(prev => ({
        ...prev,
        [skuId]: "Network error occurred"
      }));
      
      setAvailabilityData(prev => ({
        ...prev,
        [skuId]: {}
      }));
      setLoadingAvailability(prev => ({ ...prev, [skuId]: false }));
    }
  };

  useEffect(() => {
    if (ticketData.length > 0) {
      ticketData.forEach(ticket => {
        fetchTicketAvailability(ticket.sku_id);
      });
    }
  }, [ticketData, selectedDate]);

  const getAvailableQuantityForTicketAndDate = (skuId, date) => {
    console.log(`Getting available quantity for SKU: ${skuId} on date: ${date}`);
    const availability = availabilityData[skuId];
       console.log('dataaaa is 123',availability)
    if (!availability) return 0;
    
    const dateString = date.toISOString().split('T')[0];
    const dateAvailability = availability[dateString];
    
    if (dateAvailability && dateAvailability.length > 0) {
      const ticketAvailability = dateAvailability.find(item => item.sku_id === skuId);
      console.log('dataaaa is 123',ticketAvailability ? ticketAvailability.available_quantity : 0)
      return ticketAvailability ? ticketAvailability.available_quantity : 0;
    }
    return 0;
  };

  const incrementCount = (skuId) => {
    const currentCount = ticketCounts[skuId] || 0;
    const ticket = ticketData.find((item) => item.sku_id === skuId);
    const selectedDateForTicket = selectedDates[skuId];
    
    if (!selectedDateForTicket) {
      showToast({
        type: "error",
        text1: "Date Required",
        text2: "Please select a date first"
      });
      return;
    }
    
    const availableQuantity = getAvailableQuantityForTicketAndDate(skuId, selectedDateForTicket);
    const maxCount = Math.min(ticket?.max_quantity || 50, availableQuantity);

    if (currentCount < maxCount) {
      setTicketCounts({
        ...ticketCounts,
        [skuId]: currentCount + 1,
      });
    } else {
      showToast({
        type: "error",
        text1: "Quantity Limit",
        text2: `Maximum available quantity is ${availableQuantity} for the selected date`
      });
    }
  };

  const decrementCount = (skuId) => {
    const currentCount = ticketCounts[skuId] || 0;

    if (currentCount > 0) {
      setTicketCounts({
        ...ticketCounts,
        [skuId]: currentCount - 1,
      });
    }
  };

  const toggleTicketSelection = (skuId) => {
    const currentCount = ticketCounts[skuId] || 0;
    const newCount = currentCount > 0 ? 0 : 1;
    
    const selectedDateForTicket = selectedDates[skuId];
    if (newCount > 0 && !selectedDateForTicket) {
      showToast({
        type: "error",
        text1: "Date Required",
        text2: "Please select a date first"
      });
      return;
    }
    
    if (newCount > 0) {
      const availableQuantity = getAvailableQuantityForTicketAndDate(skuId, selectedDateForTicket);
      if (availableQuantity < 1) {
        showToast({
          type: "error",
          text1: "Not Available",
          text2: "No tickets available for the selected date"
        });
        return;
      }
    }
    
    setTicketCounts((prevCounts) => ({
      ...prevCounts,
      [skuId]: newCount,
    }));

    if (newCount === 0) {
      setSelectedDates(prev => {
        const updated = { ...prev };
        delete updated[skuId];
        return updated;
      });
    }
  };

  const getTotalPrice = () => {
    console.log("Calculating total price with ticket counts:", ticketData);
    let total = 0;
    Object.keys(ticketCounts).forEach(skuId => {
      const count = ticketCounts[skuId] || 0;
      const ticket = ticketData.find(t => t.sku_id === skuId);
          console.log("Calculating total price with ticket counts:", ticket);
      if (ticket && count > 0) {
        // total += ticket.price * count;
        const selectedDateForTicket = selectedDates[skuId];
        let priceToUse = ticket.price;

        if (selectedDateForTicket) {
          const apiPrice = getApiPriceForTicketAndDate(
            skuId,
            selectedDateForTicket
          );
          if (apiPrice !== null) {
            priceToUse = apiPrice;
          }
        }

        total += priceToUse * count;
      }
    });

    console.log("Total price calculated:", total);
    return total;
  };

  const getTotalTickets = () => {
    return Object.values(ticketCounts).reduce((sum, count) => sum + (count || 0), 0);
  };

  const handleBack = () => {
    handleClickBack();
  };


    const getApiPriceForTicketAndDate = (skuId, date) => {
    const availability = availabilityData[skuId];
    if (!availability || !date) return null;

    const dateString = date.toISOString().split("T")[0];
    const dateAvailability = availability[dateString];

    if (dateAvailability && dateAvailability.length > 0) {
      const ticketAvailability = dateAvailability.find(
        (item) => item.sku_id === skuId
      );

      console.log('dataaaa is 123',ticketAvailability)
      return ticketAvailability ? ticketAvailability.price : null;
    }
    return null;
  };

  const handleOnPressContinue = async () => {
    const selectedTickets = Object.keys(ticketCounts).filter(skuId => (ticketCounts[skuId] || 0) > 0);
    
    if (selectedTickets.length === 0) {
      showToast({
        type: "error",
        text1: "Selection Required",
        text2: "Please select at least one ticket."
      });
      return;
    }

    const missingDates = selectedTickets.filter(skuId => !selectedDates[skuId]);
    
    if (missingDates.length > 0) {
      showToast({
        type: "error",
        text1: "Date Required",
        text2: "Please select dates for all tickets before continuing."
      });
      return;
    }

    const invalidQuantities = selectedTickets.filter(skuId => {
      const selectedDateForTicket = selectedDates[skuId];
      const currentCount = ticketCounts[skuId];
      const availableQuantity = getAvailableQuantityForTicketAndDate(skuId, selectedDateForTicket);
      
      return currentCount > availableQuantity;
    });

    if (invalidQuantities.length > 0) {
      showToast({
        type: "error",
        text1: "Quantity Error",
        text2: "Selected quantities exceed available quantities for some tickets."
      });
      return;
    }

    try {
      setLoaders?.(true);

      const tickets = selectedTickets.map((skuId) => ({
        sku_id: skuId,
        quantity: ticketCounts[skuId],
        booking_date: selectedDates[skuId] ? selectedDates[skuId].toISOString().split('T')[0] : null,
        booking_date_formatted: selectedDates[skuId] ? formatDate(selectedDates[skuId]) : null,
        available_quantity: getAvailableQuantityForTicketAndDate(skuId, selectedDates[skuId]),
        ticketDataSet: ticketData?.filter(
          (data) => data?.sku_id == skuId
        )?.[0],
      }));

      const ticketDataD = {
        tickets: tickets,
        total_amount: getTotalPrice(),
        total_tickets: getTotalTickets(),
        currency: ticketData[0]?.currency || "USD"
      };

      console.log(ticketDataD, "Final ticket data with validated availability");

      setLoaders?.(false);
      handleOnPressContinueData(ticketDataD, tickets);
      
    } catch (error) {
      setLoaders?.(false);
      console.error("Error processing tickets:", error);
      showToast({
        type: "error",
        text1: "Failed to process tickets. Please try again."
      });
    }
  };

  const openDateModal = (ticket) => {
    setCurrentTicketForDate(ticket);
    setDateModalVisible(true);
  };

  const selectDate = (date, availableQuantity) => {
    if (currentTicketForDate) {
      setSelectedDates({
        ...selectedDates,
        [currentTicketForDate.sku_id]: date,
      });
      
      setAvailableQuantities(prev => ({
        ...prev,
        [`${currentTicketForDate.sku_id}_${date.toISOString().split('T')[0]}`]: availableQuantity
      }));

      const currentCount = ticketCounts[currentTicketForDate.sku_id] || 0;
      if (currentCount > availableQuantity) {
        setTicketCounts(prev => ({
          ...prev,
          [currentTicketForDate.sku_id]: Math.min(currentCount, availableQuantity)
        }));
      }
    }
    setDateModalVisible(false);
    setCurrentTicketForDate(null);
  };

  const formatDate = (date) => {
    if (!date) return "Select Date";
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Mock ticket data if none provided
  const mockTicketData = attractionTickets

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        {/* <button className="backButton" onClick={handleBack}>
          <ArrowLeft size={24} color="#2c3e50" />
        </button> */}
        {/* <h1 className="title">Select Tickets</h1> */}
        <div className="placeholderView"></div>
      </div>

      {/* Tickets List */}
      <div className="ticketsContainer">
        {mockTicketData.map((ticket) => {
          const isSelected = (ticketCounts[ticket.sku_id] || 0) > 0;
          const selectedDateForTicket = selectedDates[ticket.sku_id];
          const availableQuantity = selectedDateForTicket ? 
            getAvailableQuantityForTicketAndDate(ticket.sku_id, selectedDateForTicket) : 0;
          
          return (
            <div key={ticket.sku_id} className="ticketItem">
              {/* Checkbox */}
              <button className="checkboxContainer" onClick={() => toggleTicketSelection(ticket.sku_id)}>
                <div className={`checkbox ${isSelected ? 'checkboxChecked' : ''}`}>
                  {isSelected && <Check size={18} color="#fff" />}
                </div>
              </button>

              <div className="ticketInfo">
                <h3 className="ticketName">{ticket.type}</h3>

                {isSelected && (
                  <button className="dateSelector" onClick={() => openDateModal(ticket)}>
                    <Calendar size={16} color={selectedDateForTicket ? newColors.primary5 : "#7f8c8d"} />
                    <span className={`dateSelectorText ${selectedDateForTicket ? 'selectedDateText' : ''}`}>
                      {selectedDateForTicket ? formatDate(selectedDateForTicket) : "Select a date"}
                    </span>
                    <ChevronDown size={16} color={selectedDateForTicket ? newColors.primary5 : "#7f8c8d"} />
                  </button>
                )}
              </div>

              {/* Counter */}
              <div className="counterContainer">
                <button 
                  className={`counterButton ${(ticketCounts[ticket.sku_id] || 0) === 0 ? 'disabledButton' : ''}`}
                  onClick={() => decrementCount(ticket.sku_id)} 
                  disabled={(ticketCounts[ticket.sku_id] || 0) === 0}
                >
                  <Minus size={18} color="#fff" />
                </button>

                <span className="counterValue">
                  {ticketCounts[ticket.sku_id] || 0}
                </span>

                <button 
                  className={`counterButton ${(!selectedDateForTicket || 
                   (ticketCounts[ticket.sku_id] || 0) >= availableQuantity ||
                   (ticketCounts[ticket.sku_id] || 0) >= (ticket.max_quantity || 50)
                  ) ? 'disabledButton' : ''}`}
                  onClick={() => incrementCount(ticket.sku_id)} 
                  disabled={!selectedDateForTicket || 
                           (ticketCounts[ticket.sku_id] || 0) >= availableQuantity ||
                           (ticketCounts[ticket.sku_id] || 0) >= (ticket.max_quantity || 50)}
                >
                  <Plus size={18} color="#fff" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Container */}
      <div className="summaryContainer">
        <button 
          className={`checkoutButton ${getTotalTickets() === 0 ? 'disabledCheckoutButton' : ''}`}
          disabled={getTotalTickets() === 0} 
          onClick={handleOnPressContinue}
        >
          <span className="checkoutButtonText">Continue to Booking</span>
          {loaders ? (
            <div className="buttonSpinner"></div>
          ) : (
            <ArrowRight size={20} color="#fff" className="checkoutIcon" />
          )}
        </button>
      </div>

      {/* Calendar Date Picker Modal */}
      {dateModalVisible && (
        <div className="modalOverlay">
          <div className="calendarModalContent">
            <div className="modalHeader">
              {/* <h2 className="modalTitle">Select Booking Date</h2> */}
              <button onClick={() => setDateModalVisible(false)} className="closeButton">
                <X size={24} color="#2c3e50" />
              </button>
            </div>
            
            {currentTicketForDate && (
              <CalendarPicker
                ticket={currentTicketForDate}
                selectedDate={selectedDates[currentTicketForDate.sku_id]}
                onDateSelect={selectDate}
                onCancel={() => setDateModalVisible(false)}
                availabilityData={availabilityData}
                loadingAvailability={loadingAvailability}
                preSelectedDate={selectedDate ? new Date(selectedDate) : null}
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .container {
          height: 100vh;
          background-color: #f5f8ff;
          padding: 16px;
          font-family: Arial, sans-serif;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .backButton {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          background-color: #fff;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .title {
          font-size: 20px;
          font-weight: bold;
          color: #2c3e50;
          text-align: center;
          margin: 0;
        }

        .placeholderView {
          width: 40px;
        }

        .ticketsContainer {
          flex: 1;
          overflow-y: auto;
          margin-bottom: 20px;
        }

        .ticketItem {
          display: flex;
          align-items: flex-start;
          background-color: #fff;
          border-radius: 25px;
          padding: 16px;
          margin-bottom: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .checkboxContainer {
          margin-right: 12px;
          margin-top: 2px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 2px solid #1976d2;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: transparent;
        }

        .checkboxChecked {
          background-color: #1976d2;
        }

        .ticketInfo {
          flex: 1;
          padding-right: 10px;
        }

        .ticketName {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin: 0 0 4px 0;
        }

        .ticketPrice {
          font-size: 15px;
          font-weight: bold;
          color: #2196f3;
          margin: 0 0 8px 0;
        }

        .dateSelector {
          display: flex;
          align-items: center;
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 6px 8px;
          border: 1px solid #e1e8ed;
          margin-top: 4px;
          cursor: pointer;
          width: 100%;
        }

        .dateSelectorText {
          flex: 1;
          margin-left: 6px;
          font-size: 12px;
          color: #2c3e50;
        }

        .selectedDateText {
          color: #0d47a1;
          font-weight: 500;
        }

        .counterContainer {
          display: flex;
          align-items: center;
          margin-top: 8px;
        }

        .counterButton {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background-color: #1976d2;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .disabledButton {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .counterValue {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          width: 40px;
          text-align: center;
        }

        .summaryContainer {
          background-color: #fff;
          border-radius: 12px;
          padding: 16px;
          margin-top: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .checkoutButton {
          background-color: #0d47a1;
          border-radius: 8px;
          padding: 14px;
          border: none;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .disabledCheckoutButton {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }

        .checkoutButtonText {
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          margin-right: 5px;
        }

        .checkoutIcon {
          margin-left: 5px;
        }

        .buttonSpinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ffffff40;
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 5px;
        }

        .modalOverlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .calendarModalContent {
          background-color: #fff;
          border-radius: 12px;
          padding: 20px;
          margin: 20px;
          width: 95%;
          max-width: 400px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }

        .modalTitle {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin: 0;
        }

        .closeButton {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
        }

        .loadingContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 0;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #1976d2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loadingText {
          margin-top: 12px;
          font-size: 14px;
          color: #7f8c8d;
          text-align: center;
        }

        .calendarContainer {
          background-color: #fff;
        }

        .calendarHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding: 0 10px;
        }

        .navButton {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
        }

        .monthText {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
          margin: 0;
        }

        .daysHeader {
          display: flex;
          margin-bottom: 10px;
        }

        .dayHeaderText {
          flex: 1;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          color: #7f8c8d;
          padding: 8px 0;
        }

        .calendarGrid {
          display: flex;
          flex-wrap: wrap;
        }

        .calendarDay {
          width: 14.28%;
          aspect-ratio: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          margin: 1px;
          cursor: pointer;
          border: none;
          background-color: transparent;
        }

        .disabledDay {
          opacity: 0.2;
          cursor: default;
        }

        .unavailableDay {
          background-color: #ffebee;
          opacity: 0.7;
        }

        .selectedDay {
          background-color: #1976d2;
        }

        .todayDay {
          background-color: #e3f2fd;
          border: 1px solid #2196f3;
        }

        .calendarDayText {
          font-size: 16px;
          color: #2c3e50;
        }

        .disabledText {
          color: #bdc3c7;
        }

        .unavailableText {
          color: #ff6b6b;
          font-weight: 500;
        }

        .selectedText {
          color: #fff;
          font-weight: bold;
        }

        .todayText {
          color: #2196f3;
          font-weight: bold;
        }

        .calendarLegend {
          display: flex;
          justify-content: space-around;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #f0f0f0;
        }

        .legendItem {
          display: flex;
          align-items: center;
        }

        .legendDot {
          width: 12px;
          height: 12px;
          border-radius: 6px;
          margin-right: 6px;
        }

        .legendDot.available {
          background-color: #1976d2;
        }

        .legendDot.unavailable {
          background-color: #ff6b6b;
        }

        .legendDot.past {
          background-color: #ecf0f1;
        }

        .legendText {
          font-size: 10px;
          color: #7f8c8d;
        }

        .calendarActions {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
        }

        .cancelButton {
          flex: 1;
          padding: 12px;
          margin-right: 10px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #6c757d;
          font-weight: 500;
        }

        .confirmButton {
          flex: 1;
          padding: 12px;
          margin-left: 10px;
          background-color: #0d47a1;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          color: #fff;
          font-weight: bold;
        }

        .disabledConfirmButton {
          background-color: #bdc3c7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}