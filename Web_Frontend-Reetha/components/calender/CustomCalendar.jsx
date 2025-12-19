import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import moment from 'moment';

const customStyles = `
  .compact-calendar-container {
    background: white;
    border-radius: 12px;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 100%;
    margin: 0 auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    border: 1px solid #e5e7eb;
  }

  .calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .calendar-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .month-navigation {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-button {
    padding: 6px;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-button:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }

  .nav-button svg {
    width: 16px;
    height: 16px;
    color: #374151;
  }

  .calendar-grid-container {
    padding: 16px 20px;
  }

  .days-of-week {
    display: grid;
    grid-template-columns: repeat(14, 1fr);
    gap: 4px;
    margin-bottom: 12px;
    border-bottom: 1px solid #f3f4f6;
    padding-bottom: 8px;
  }

  .day-of-week {
    text-align: center;
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    padding: 4px 0;
  }

  .calendar-grid-combined {
    display: grid;
    grid-template-columns: repeat(14, 1fr);
    gap: 4px;
  }

  .calendar-day-compact {
    height: 32px;
    width: 32px;
    font-size: 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: none;
    color: #374151;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-weight: 400;
  }

  .calendar-day-compact:disabled {
    visibility: hidden;
    cursor: not-allowed;
  }

  .calendar-day-compact.disabled-past {
    visibility: visible;
    background-color: #f9fafb;
    color: #d1d5db;
    cursor: not-allowed;
  }

  .calendar-day-compact.disabled-past:hover {
    background-color: #f9fafb;
  }

  .calendar-day-compact:hover:not(:disabled) {
    background-color: #f3f4f6;
  }

  .calendar-day-compact.today {
    background-color: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #3b82f6;
  }

  .calendar-day-compact.in-range {
    background-color: #dbeafe;
    color: #1e40af;
  }

  .calendar-day-compact.check-in {
    background-color: #2563eb;
    color: white;
    font-weight: 600;
  }

  .calendar-day-compact.check-out {
    background-color: #2563eb;
    color: white;
    font-weight: 600;
  }

  .calendar-footer {
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    background-color: #f8fafc;
  }

  .selected-dates-compact {
    text-align: center;
  }

  .selected-dates-compact h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 8px;
  }

  .dates-display {
    font-size: 13px;
    color: #374151;
    line-height: 1.4;
  }

  .date-label {
    font-weight: 500;
    color: #4b5563;
  }

  .clear-button-compact {
    padding: 8px 16px;
    font-size: 12px;
    background-color: #1d4ed8;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 12px;
    font-weight: 500;
    width: 100%;
  }

  .clear-button-compact:hover {
    background-color: #1d4ed8;
  }

  .instructions-compact {
    margin-top: 12px;
    font-size: 11px;
    color: #6b7280;
    text-align: center;
    line-height: 1.4;
  }

  .warning-message-compact {
    margin-top: 8px;
    padding: 8px 12px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    color: #dc2626;
    font-size: 11px;
    text-align: center;
    font-weight: 500;
  }

  /* Date Field Styles */
  .date-field-dropdown {
    position: relative;
    cursor: pointer;
    overflow: visible !important;
  }

  .date-field {
    position: relative;
    overflow: visible !important;
    z-index: 20;
  }

  .calendar-dropdown-wrapper {
    position: absolute;
    top: 110%;
    left: 0;
    z-index: 99999 !important;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    animation: slideDown 0.2s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .calendar-dropdown-wrapper::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 20px;
    width: 16px;
    height: 16px;
    background: white;
    border-left: 1px solid #e5e7eb;
    border-top: 1px solid #e5e7eb;
    transform: rotate(45deg);
  }

  /* Search form styles */
  .search-card,
  .search-form,
  .search-row,
  .search-fields,
  .classy-search-container {
    overflow: visible !important;
    position: relative;
    z-index: 10;
  }

  .search-field {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.2s;
  }

  .search-field:hover {
    border-color: #9ca3af;
  }

  .field-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .field-icon {
    color: #6b7280;
    font-size: 14px;
  }

  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field-value {
    font-size: 14px;
    font-weight: 500;
    color: #1f2937;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 768px) {
    .days-of-week,
    .calendar-grid-combined {
      grid-template-columns: repeat(7, 1fr);
    }
    
    .calendar-day-compact {
      height: 28px;
      width: 28px;
      font-size: 11px;
    }

    .calendar-dropdown-wrapper {
      min-width: 350px;
      left: -50px;
    }

    .calendar-dropdown-wrapper::before {
      left: 70px;
    }
  }

  @media (max-width: 480px) {
    .calendar-dropdown-wrapper {
      min-width: 320px;
      left: -80px;
    }

    .calendar-dropdown-wrapper::before {
      left: 90px;
    }
  }
`;

const CustomCalendar = ({ handleDateSelect, selectedDate = [], isDropdown = false, onClose }) => {
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextMonth, setNextMonth] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  });
  const [showWarning, setShowWarning] = useState(false);
  const calendarRef = useRef(null);

  // Initialize from props
  useEffect(() => {
    if (selectedDate && selectedDate.length > 0 && selectedDate[0]) {
      const dateRange = selectedDate[0];
      
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        
        setCheckInDate(startDate);
        setCheckOutDate(endDate);
        
        // Set calendar view to start date's month
        setCurrentMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
        const next = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
        setNextMonth(next);
      }
    } else {
      setCheckInDate(null);
      setCheckOutDate(null);
    }
  }, [selectedDate]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Adjust for Monday start (Mo, Tu, We, Th, Fr, Sa, Su)
    let adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    for (let i = 0; i < adjustedStart; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (!date) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return;

    setShowWarning(false);

    if (!checkInDate || (checkInDate && checkOutDate)) {
      // Start new selection with check-in
      setCheckInDate(date);
      setCheckOutDate(null);
    } else if (checkInDate && !checkOutDate) {
      // Select check-out date
      if (date <= checkInDate) {
        setShowWarning(true);
        return;
      }
      
      setCheckOutDate(date);
      
      // Call parent handler
      if (handleDateSelect) {
        handleDateSelect([{
          startDate: checkInDate,
          endDate: date,
          key: "selection"
        }]);
      }

      // Auto-close dropdown after selecting both dates
      if (isDropdown && onClose) {
        setTimeout(() => {
          onClose();
        }, 300);
      }
    }
  };

  const isDateInRange = (date) => {
    if (!date || !checkInDate || !checkOutDate) return false;
    return date > checkInDate && date < checkOutDate;
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonths = (direction) => {
    const newCurrentMonth = new Date(currentMonth);
    newCurrentMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newCurrentMonth);

    const newNextMonth = new Date(nextMonth);
    newNextMonth.setMonth(nextMonth.getMonth() + direction);
    setNextMonth(newNextMonth);
  };

  const clearSelection = () => {
    setCheckInDate(null);
    setCheckOutDate(null);
    setShowWarning(false);
    
    if (handleDateSelect) {
      handleDateSelect([{
        startDate: null,
        endDate: null,
        key: "selection"
      }]);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const currentMonthDays = getDaysInMonth(currentMonth);
  const nextMonthDays = getDaysInMonth(nextMonth);

  const calendarContent = (
    <div 
      className={`compact-calendar-container ${isDropdown ? 'dropdown-calendar' : ''}`}
      style={isDropdown ? { zIndex: 9999 } : {}}
    >
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-title">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()} - {months[nextMonth.getMonth()]} {nextMonth.getFullYear()}
        </div>
        <div className="month-navigation">
          <button onClick={() => navigateMonths(-1)} className="nav-button">
            <ChevronLeft />
          </button>
          <button onClick={() => navigateMonths(1)} className="nav-button">
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid-container">
        {/* Days of Week Header */}
        <div className="days-of-week">
          {/* First Month Days */}
          {daysOfWeek.map(day => (
            <div key={`first-${day}`} className="day-of-week">
              {day}
            </div>
          ))}
          {/* Second Month Days */}
          {daysOfWeek.map(day => (
            <div key={`second-${day}`} className="day-of-week">
              {day}
            </div>
          ))}
        </div>

        {/* Combined Calendar Grid */}
        <div className="calendar-grid-combined">
          {/* First Month Days */}
          {currentMonthDays.map((date, index) => {
            const isInRange = isDateInRange(date);
            const isCheckIn = date && checkInDate && date.getTime() === checkInDate.getTime();
            const isCheckOut = date && checkOutDate && date.getTime() === checkOutDate.getTime();
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isPast = isPastDate(date);
            
            let dayClasses = 'calendar-day-compact';
            if (isToday) dayClasses += ' today';
            if (isPast) dayClasses += ' disabled-past';
            if (isInRange && !isCheckIn && !isCheckOut && !isPast) dayClasses += ' in-range';
            if (isCheckIn && !isPast) dayClasses += ' check-in';
            if (isCheckOut && !isPast) dayClasses += ' check-out';
            
            return (
              <button
                key={`first-${index}`}
                onClick={() => handleDateClick(date)}
                disabled={!date || isPast}
                className={dayClasses}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}

          {/* Second Month Days */}
          {nextMonthDays.map((date, index) => {
            const isInRange = isDateInRange(date);
            const isCheckIn = date && checkInDate && date.getTime() === checkInDate.getTime();
            const isCheckOut = date && checkOutDate && date.getTime() === checkOutDate.getTime();
            const isToday = date && date.toDateString() === new Date().toDateString();
            const isPast = isPastDate(date);
            
            let dayClasses = 'calendar-day-compact';
            if (isToday) dayClasses += ' today';
            if (isPast) dayClasses += ' disabled-past';
            if (isInRange && !isCheckIn && !isCheckOut && !isPast) dayClasses += ' in-range';
            if (isCheckIn && !isPast) dayClasses += ' check-in';
            if (isCheckOut && !isPast) dayClasses += ' check-out';
            
            return (
              <button
                key={`second-${index}`}
                onClick={() => handleDateClick(date)}
                disabled={!date || isPast}
                className={dayClasses}
              >
                {date ? date.getDate() : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer with Selected Dates */}
      <div className="calendar-footer">
        {showWarning && (
          <div className="warning-message-compact">
            Check-out date must be after check-in date.
          </div>
        )}

        <div className="selected-dates-compact">
          <h4>Selected Dates</h4>
          <div className="dates-display">
            <span className="date-label">Check-in:</span> {checkInDate ? formatDate(checkInDate) : 'Not selected'}<br />
            <span className="date-label">Check-out:</span> {checkOutDate ? formatDate(checkOutDate) : 'Not selected'}
          </div>
          {(checkInDate || checkOutDate) && (
            <button onClick={clearSelection} className="clear-button-compact">
              Clear Dates
            </button>
          )}
        </div>

        {!isDropdown && (
          <div className="instructions-compact">
            Select your check-in and check-out dates. Check-out must be after check-in.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{customStyles}</style>
      {isDropdown ? (
        <div ref={calendarRef}>
          {calendarContent}
        </div>
      ) : (
        calendarContent
      )}
    </>
  );
};

// Date Field Component for use in search forms
export const DateField = ({ 
  hotelSearchCustomerData, 
  onDateSelect, 
  selectedDate = [],
  placeholder = "Select dates"
}) => {
  const [openDate, setOpenDate] = useState(false);
  const dateFieldRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!openDate) return;
      
      if (dateFieldRef.current && !dateFieldRef.current.contains(event.target)) {
        setOpenDate(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDate]);

  const handleDateSelect = (dateRange) => {
    console.log("Selected date range", dateRange);
    
    if (dateRange && dateRange[0]) {
      const { startDate, endDate } = dateRange[0];
      
      if (startDate && endDate) {
        if (onDateSelect) {
          onDateSelect(dateRange);
        }
        
        // If using hotelSearchCustomerData state
        if (hotelSearchCustomerData) {
          // You would update the state here through props
          console.log("Dates selected:", {
            CheckInDate: moment(startDate).format('DD/MM/YYYY'),
            CheckOutDate: moment(endDate).format('DD/MM/YYYY')
          });
        }
      }
    }
    
    setOpenDate(false);
  };

  const displayText = hotelSearchCustomerData?.CheckInDate && hotelSearchCustomerData?.CheckOutDate 
    ? `${hotelSearchCustomerData.CheckInDate} - ${hotelSearchCustomerData.CheckOutDate}`
    : placeholder;

  return (
    <div ref={dateFieldRef} className="search-field date-field date-field-dropdown">
      <div 
        className="field-header"
        onClick={() => setOpenDate(!openDate)}
      >
        <i className="fa fa-calendar field-icon"></i>
        <label className="field-label">Dates</label>
      </div>
      <div 
        className="field-value"
        onClick={() => setOpenDate(!openDate)}
      >
        {displayText}
      </div>
      
      {/* Dropdown Calendar */}
      {openDate && (
        <div className="calendar-dropdown-wrapper">
          <CustomCalendar 
            handleDateSelect={handleDateSelect} 
            selectedDate={selectedDate}
            onClose={() => setOpenDate(false)}
            isDropdown={true}
          />
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;