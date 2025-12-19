import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const CustomDatePicker = ({
  value,
  onChange,
  disabled = false,
  minDate,
  maxDate,
  format = "dd-MM-yyyy",
  className = "",
  placeholder = "Select date",
  activeStartDate = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const pickerRef = useRef(null);
  const inputRef = useRef(null);

  // Prevent body scroll when calendar is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scrolling when component unmounts
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen]);

  // Rest of your existing code remains the same...
  const [hoveredElement, setHoveredElement] = useState(null);

  // Set initial calendar month based on activeStartDate or value
  useEffect(() => {
    if (activeStartDate) {
      setCurrentMonth(new Date(activeStartDate));
    } else if (value) {
      setCurrentMonth(new Date(value));
    }
  }, [activeStartDate, value]);

  // Update calendar month when modal opens and activeStartDate changes
  useEffect(() => {
    if (isOpen && activeStartDate) {
      setCurrentMonth(new Date(activeStartDate));
    }
  }, [isOpen, activeStartDate]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date according to the specified format
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    switch (format) {
      case 'dd-MM-yyyy':
        return `${day}-${month}-${year}`;
      case 'MM/dd/yyyy':
        return `${month}/${day}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      default:
        return `${day}-${month}-${year}`;
    }
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    if (disabled) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    if (isDateDisabled(date)) return;
    
    onChange(date);
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!value) return false;
    return date.toDateString() === new Date(value).toDateString();
  };

  const isCurrentMonth = (date) => {
    return date.getMonth() === currentMonth.getMonth();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Styles
  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    width: '100%'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: disabled ? '#f5f5f5' : 'white',
    outline: 'none',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const calendarOverlayStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  };

  const calendarModalStyle = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '0',
    minWidth: '320px',
    maxWidth: '400px',
    position: 'relative',
    animation: 'fadeIn 0.2s ease-out'
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  };

  const navButtonStyle = {
    background: 'none',
    border: 'none',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s'
  };

  const monthYearStyle = {
    fontWeight: '600',
    fontSize: '16px',
    color: '#111827'
  };

  const daysHeaderStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0',
    padding: '12px 20px 8px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb'
  };

  const dayHeaderStyle = {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    padding: '8px 4px'
  };

  const calendarGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '0',
    padding: '12px 20px 20px'
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '1px',
    right: '1px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px'
  };

  const getDateButtonStyle = (date) => {
    const disabled = isDateDisabled(date);
    const selected = isSelected(date);
    const today = isToday(date);
    const currentMonthDate = isCurrentMonth(date);

    let baseStyle = {
      width: '36px',
      height: '36px',
      fontSize: '14px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      fontWeight: 'normal',
      margin: '2px'
    };

    if (disabled) {
      return {
        ...baseStyle,
        color: '#d1d5db',
        backgroundColor: 'transparent'
      };
    }

    if (selected) {
      return {
        ...baseStyle,
        backgroundColor: '#3b82f6',
        color: 'white',
        fontWeight: '600'
      };
    }

    if (today) {
      return {
        ...baseStyle,
        backgroundColor: '#dbeafe',
        color: '#d81d1dff',
        fontWeight: '600'
      };
    }

    if (!currentMonthDate) {
      return {
        ...baseStyle,
        color: '#9ca3af',
        backgroundColor: 'transparent'
      };
    }

    return {
      ...baseStyle,
      color: '#374151',
      backgroundColor: 'transparent'
    };
  };

  // Add CSS keyframes for animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      body.no-scroll {
        overflow: hidden;
        position: fixed;
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={containerStyle} ref={pickerRef}>
      {/* Input Field */}
      <div
        ref={inputRef}
        style={inputStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? '#111827' : '#9ca3af' }}>
          {value ? formatDate(value) : placeholder}
        </span>
        <Calendar size={16} color={disabled ? '#9ca3af' : '#6b7280'} />
      </div>

      {/* Calendar Modal Overlay */}
      {isOpen && !disabled && (
        <div style={calendarOverlayStyle} onClick={() => setIsOpen(false)}>
          <div style={calendarModalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              style={{
                ...closeButtonStyle,
                backgroundColor: hoveredElement === 'close' ? '#f3f4f6' : 'transparent'
              }}
              onClick={() => setIsOpen(false)}
              onMouseEnter={() => setHoveredElement('close')}
              onMouseLeave={() => setHoveredElement(null)}
            >
              ×
            </button>

            {/* Header */}
            <div style={headerStyle}>
              <button
                style={{
                  ...navButtonStyle,
                  backgroundColor: hoveredElement === 'prev' ? '#e5e7eb' : 'transparent'
                }}
                onClick={() => navigateMonth(-1)}
                onMouseEnter={() => setHoveredElement('prev')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <ChevronLeft size={18} />
              </button>
              
              <span style={monthYearStyle}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              
              <button
                style={{
                  ...navButtonStyle,
                  backgroundColor: hoveredElement === 'next' ? '#e5e7eb' : 'transparent'
                }}
                onClick={() => navigateMonth(1)}
                onMouseEnter={() => setHoveredElement('next')}
                onMouseLeave={() => setHoveredElement(null)}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Days of week */}
            <div style={daysHeaderStyle}>
              {dayNames.map(day => (
                <div key={day} style={dayHeaderStyle}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div style={calendarGridStyle}>
              {generateCalendarDays().map((date, index) => {
                const dateKey = `date-${index}`;
                const isHovered = hoveredElement === dateKey;
                const buttonStyle = getDateButtonStyle(date);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    disabled={isDateDisabled(date)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: isHovered && !isDateDisabled(date) && !isSelected(date)
                        ? '#f3f4f6'
                        : buttonStyle.backgroundColor
                    }}
                    onMouseEnter={() => setHoveredElement(dateKey)}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;