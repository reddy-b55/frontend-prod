import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarPicker = ({ 
  ticket, 
  selectedDate, 
  onDateSelect, 
  onCancel, 
  availabilityData, 
  loadingAvailability,
  preSelectedDate 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState(selectedDate || preSelectedDate);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (preSelectedDate) {
      setCurrentMonth(new Date(preSelectedDate));
      setSelectedDateState(new Date(preSelectedDate));
    }
  }, [preSelectedDate]);

  const isDateInRange = (date) => {
    const startDate = new Date(ticket.booking_period.start_date);
    const endDate = new Date(ticket.booking_period.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date >= today && date >= startDate && date <= endDate;
  };

  const isDateAvailable = (date) => {
    const availability = availabilityData[ticket.sku_id];
    if (!availability) return false;
    
    const dateString = date.toISOString().split('T')[0];
    return Object.keys(availability).includes(dateString);
  };

  const getAvailableQuantityForDate = (date) => {
    const availability = availabilityData[ticket.sku_id];
    if (!availability) return 0;
    
    const dateString = date.toISOString().split('T')[0];
    const dateAvailability = availability[dateString];
    
    if (dateAvailability && dateAvailability.length > 0) {
      const ticketAvailability = dateAvailability.find(item => item.sku_id === ticket.sku_id);
      return ticketAvailability ? ticketAvailability.available_quantity : 0;
    }
    return 0;
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    while (days.length % 7 !== 0) {
      days.push(null);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDatePress = (date) => {
    if (date && isDateInRange(date) && isDateAvailable(date)) {
      setSelectedDateState(date);
    }
  };

  const handleConfirm = () => {
    if (selectedDateState) {
      const availableQuantity = getAvailableQuantityForDate(selectedDateState);
      onDateSelect(selectedDateState, availableQuantity);
    }
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const calendarDays = generateCalendarDays();
  const isLoading = loadingAvailability[ticket.sku_id];

  const calendarStyles = {
    calendarContainer: {
      backgroundColor: '#fff',
      fontFamily: 'Arial, sans-serif'
    },
    calendarHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2px',
      padding: '0 10px'
    },
    navButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    monthText: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0'
    },
    daysHeader: {
      display: 'flex',
      marginBottom: '10px'
    },
    dayHeaderText: {
      flex: '1',
      textAlign: 'center',
      fontSize: '14px',
      fontWeight: '600',
      color: '#7f8c8d',
      padding: '8px 0'
    },
    calendarGrid: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    calendarDay: {
      width: '12.28%',
      aspectRatio: '1',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
      margin: '3px',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent',
      minHeight: '40px'
    },
    disabledDay: {
      opacity: '0.2',
      cursor: 'default'
    },
    unavailableDay: {
      backgroundColor: '#ffebee',
      opacity: '0.7'
    },
    selectedDay: {
      backgroundColor: '#1976d2',
      color: '#fff'
    },
    todayDay: {
      backgroundColor: '#e3f2fd',
      border: '1px solid #2196f3'
    },
    calendarDayText: {
      fontSize: '16px',
      color: '#2c3e50'
    },
    disabledText: {
      color: '#bdc3c7'
    },
    unavailableText: {
      color: '#ff6b6b',
      fontWeight: '500'
    },
    selectedText: {
      color: '#fff',
      fontWeight: 'bold'
    },
    todayText: {
      color: '#2196f3',
      fontWeight: 'bold'
    },
    calendarLegend: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: '15px',
      paddingTop: '15px',
      borderTop: '1px solid #f0f0f0'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center'
    },
    legendDot: {
      width: '12px',
      height: '12px',
      borderRadius: '6px',
      marginRight: '6px'
    },
    legendDotAvailable: {
      backgroundColor: '#1976d2'
    },
    legendDotUnavailable: {
      backgroundColor: '#ff6b6b'
    },
    legendDotPast: {
      backgroundColor: '#ecf0f1'
    },
    legendText: {
      fontSize: '10px',
      color: '#7f8c8d'
    },
    calendarActions: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px',
      paddingTop: '15px',
      borderTop: '1px solid #e9ecef'
    },
    cancelButton: {
      flex: '1',
      padding: '12px',
      marginRight: '10px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#6c757d',
      fontWeight: '500'
    },
    confirmButton: {
      flex: '1',
      padding: '12px',
      marginLeft: '10px',
      backgroundColor: '#0d47a1',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '16px',
      color: '#fff',
      fontWeight: 'bold'
    },
    disabledConfirmButton: {
      backgroundColor: '#bdc3c7',
      cursor: 'not-allowed'
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 0'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #1976d2',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      marginTop: '12px',
      fontSize: '14px',
      color: '#7f8c8d',
      textAlign: 'center'
    }
  };

  return (
    <div style={calendarStyles.calendarContainer}>
      {/* Calendar Header */}
      <div style={calendarStyles.calendarHeader}>
        <button 
          onClick={() => navigateMonth(-1)} 
          style={calendarStyles.navButton}
        >
          <ChevronLeft size={24} color="#2c3e50" />
        </button>
        <h3 style={calendarStyles.monthText}>
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button 
          onClick={() => navigateMonth(1)} 
          style={calendarStyles.navButton}
        >
          <ChevronRight size={24} color="#2c3e50" />
        </button>
      </div>

      {/* Days Header */}
      <div style={calendarStyles.daysHeader}>
        {daysOfWeek.map((day) => (
          <div key={day} style={calendarStyles.dayHeaderText}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div style={calendarStyles.calendarGrid}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return (
              <div key={index} style={calendarStyles.calendarDay}>
              </div>
            );
          }

          const isInRange = isDateInRange(date);
          const isAvailable = isDateAvailable(date);
          const isSelectable = isInRange && isAvailable;
          const isSelected = selectedDateState && 
            formatDateKey(selectedDateState) === formatDateKey(date);
          const isToday = formatDateKey(date) === formatDateKey(new Date());

          let dayStyle = { ...calendarStyles.calendarDay };
          let textStyle = { ...calendarStyles.calendarDayText };

          if (!isSelectable) {
            dayStyle = { ...dayStyle, ...calendarStyles.disabledDay };
            textStyle = { ...textStyle, ...calendarStyles.disabledText };
          }
          if (isSelected) {
            dayStyle = { ...dayStyle, ...calendarStyles.selectedDay };
            textStyle = { ...textStyle, ...calendarStyles.selectedText };
          }
          if (isToday && !isSelected && isSelectable) {
            dayStyle = { ...dayStyle, ...calendarStyles.todayDay };
            textStyle = { ...textStyle, ...calendarStyles.todayText };
          }
          if (isInRange && !isAvailable) {
            dayStyle = { ...dayStyle, ...calendarStyles.unavailableDay };
            textStyle = { ...textStyle, ...calendarStyles.unavailableText };
          }

          return (
            <button
              key={index}
              style={dayStyle}
              onClick={() => handleDatePress(date)}
              disabled={!isSelectable}
            >
              <span style={textStyle}>
                {date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={calendarStyles.calendarLegend}>
        <div style={calendarStyles.legendItem}>
          <div style={{...calendarStyles.legendDot, ...calendarStyles.legendDotAvailable}}></div>
          <span style={calendarStyles.legendText}>Available</span>
        </div>
        <div style={calendarStyles.legendItem}>
          <div style={{...calendarStyles.legendDot, ...calendarStyles.legendDotUnavailable}}></div>
          <span style={calendarStyles.legendText}>Unavailable</span>
        </div>
        <div style={calendarStyles.legendItem}>
          <div style={{...calendarStyles.legendDot, ...calendarStyles.legendDotPast}}></div>
          <span style={calendarStyles.legendText}>Past dates</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={calendarStyles.calendarActions}>
        <button style={calendarStyles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button 
          style={{
            ...calendarStyles.confirmButton,
            ...(selectedDateState ? {} : calendarStyles.disabledConfirmButton)
          }}
          onClick={handleConfirm}
          disabled={!selectedDateState}
        >
          Confirm
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CalendarPicker;