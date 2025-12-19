import React, { useState, useEffect } from 'react';

const EducationCalendar = ({ 
 value, 
  onChange, 
  minDate = new Date(), 
  maxDate, 
  inventoryDates = [], 
  className = '',
  placeholderText = "Select date",
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Convert inventory dates to a Set for faster lookup using YYYY-MM-DD format
  const inventoryDateSet = new Set(inventoryDates);
  console.log("inventoryDateSet", value);
  const formatDate = (date) => {
    if (!date) return '';
    
    // Handle both Date objects and date strings
    let dateObj;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return '';
    }
    
    // Check if the resulting date is valid
    if (isNaN(dateObj.getTime())) return '';
    console.log("formatted date", dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }));
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to convert date to YYYY-MM-DD format
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateDisabled = (date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    
    // Disable if before minDate
    if (minDate && date < minDate) return true;
    
    // Disable if after maxDate
    if (maxDate && date > maxDate) return true;
    
    // Disable if NOT in inventory dates (only enable dates that exist in inventoryDates)
    if (inventoryDates.length > 0 && !inventoryDateSet.has(dateStr)) return true;
    
    return false;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Input Field */}
      <input
        type="text"
        className={className}
        value={value ? formatDate(value) : ''}
        placeholder={placeholderText}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        style={{
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'pointer',
          fontSize: '14px',
          ...style
        }}
      />

      {/* Calendar Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          marginTop: '2px'
        }}>
          {/* Calendar Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px',
            borderBottom: '1px solid #eee',
            backgroundColor: '#f8f9fa'
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              ‹
            </button>
            <div style={{
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              {currentMonth.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              ›
            </button>
          </div>

          {/* Week Days Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            backgroundColor: '#f8f9fa',
            padding: '8px'
          }}>
            {weekDays.map(day => (
              <div
                key={day}
                style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#666',
                  padding: '4px'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            padding: '8px'
          }}>
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} style={{ padding: '8px' }}></div>;
              }

              const isDisabled = isDateDisabled(date);
              
              // Helper function to safely get date string
              const getDateString = (dateInput) => {
                if (!dateInput) return null;
                if (dateInput instanceof Date) {
                  return dateInput.toDateString();
                } else if (typeof dateInput === 'string') {
                  return new Date(dateInput).toDateString();
                }
                return null;
              };
              
              const isSelected = value && getDateString(value) === date.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  disabled={isDisabled}
                  style={{
                    padding: '8px',
                    border: 'none',
                    backgroundColor: isSelected ? '#007bff' : 
                                   isToday ? '#e3f2fd' : 
                                   'transparent',
                    color: isSelected ? 'white' : 
                           isDisabled ? '#ccc' : 
                           isToday ? '#007bff' : 
                           '#333',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: isSelected || isToday ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                    ':hover': !isDisabled ? {
                      backgroundColor: isSelected ? '#0056b3' : '#f0f0f0'
                    } : {}
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.target.style.backgroundColor = '#f0f0f0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !isSelected) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Close button */}
          <div style={{
            padding: '8px',
            borderTop: '1px solid #eee',
            textAlign: 'right'
          }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: '4px 12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close calendar when clicking outside */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default EducationCalendar;