import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';

const LifestyleCalendar = ({ 
  availableDates = [], 
  value = null, 
  onChange = () => {}, 
  placeholderText = "Select a date...",
  className = "",
  minDateProp, // Renamed from minDate to avoid conflict
  bookByDays = 0 // Add this prop
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const pickerRef = useRef(null);

  // Convert availableDates strings to moment objects for easier comparison
  const availableMoments = availableDates.map(date => moment(date));
  
  // Get min and max dates from available dates - use different variable names
  const minAvailableDate = availableMoments.length > 0 ? moment.min(availableMoments) : moment();
  const maxAvailableDate = availableMoments.length > 0 ? moment.max(availableMoments) : moment();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false); // Close when page scrolls
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return moment(date).format('MM/DD/YYYY');
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return moment(date1).isSame(moment(date2), 'day');
  };

  const isDateAvailable = (date) => {
    // Check if date is in available dates AND meets book_by_days requirement
    const isInAvailableDates = availableMoments.some(availableDate => 
      moment(date).isSame(availableDate, 'day')
    );
    
    // Apply book_by_days restriction
    const minAllowedDate = moment().add(bookByDays, 'days').startOf('day');
    const meetsBookByDays = moment(date).isSameOrAfter(minAllowedDate, 'day');
    
    return isInAvailableDates && meetsBookByDays;
  };

  const getDaysInMonth = (monthMoment) => {
    const startOfMonth = monthMoment.clone().startOf('month');
    const startOfCalendar = startOfMonth.clone().startOf('week');
    
    const days = [];
    const currentDate = startOfCalendar.clone();
    
    // Generate 6 weeks (42 days) for consistent calendar layout
    for (let i = 0; i < 42; i++) {
      days.push(currentDate.clone());
      currentDate.add(1, 'day');
    }
    
    return days;
  };

  const handleDateClick = (date) => {
    if (isDateAvailable(date)) {
      onChange(date.toDate()); // Convert moment back to Date object for compatibility
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => prev.clone().add(direction, 'month'));
  };

  const canNavigateToPrevMonth = () => {
    const prevMonth = currentMonth.clone().subtract(1, 'month').endOf('month');
    return availableMoments.some(date => date.isSameOrBefore(prevMonth, 'day'));
  };

  const canNavigateToNextMonth = () => {
    const nextMonth = currentMonth.clone().add(1, 'month').startOf('month');
    return availableMoments.some(date => date.isSameOrAfter(nextMonth, 'day'));
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.format('MMMM YYYY');

  const inputStyles = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const calendarStyles = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    marginTop: '2px',
    width: "350px"
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #eee'
  };

  const navButtonStyles = {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#666'
  };

  const navButtonDisabledStyles = {
    ...navButtonStyles,
    color: '#ccc',
    cursor: 'not-allowed'
  };

  const navButtonHoverStyles = {
    backgroundColor: '#f5f5f5'
  };

  const monthTitleStyles = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333'
  };

  const weekdaysStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee'
  };

  const weekdayStyles = {
    padding: '8px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '600',
    color: '#666'
  };

  const daysGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)'
  };

  const dayStyles = {
    padding: '8px',
    textAlign: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    border: 'none',
    background: 'none',
    minHeight: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const getDateStyles = (dateMoment) => {
    const isCurrentMonth = dateMoment.isSame(currentMonth, 'month');
    const isSelected = value && moment(value).isSame(dateMoment, 'day');
    const isAvailable = isDateAvailable(dateMoment);
    const isToday = dateMoment.isSame(moment(), 'day');
    
    let styles = { ...dayStyles };
    
    if (!isCurrentMonth) {
      styles.color = '#ccc';
    } else if (isAvailable) {
      styles.color = '#333';
      styles.backgroundColor = 'transparent';
    } else {
      styles.color = '#ccc';
      styles.cursor = 'not-allowed';
    }
    
    if (isSelected) {
      styles.backgroundColor = '#007bff';
      styles.color = '#fff';
      styles.fontWeight = '600';
      styles.borderRadius = '4px';
    } else if (isToday && isCurrentMonth) {
      styles.border = '2px solid #007bff';
      styles.borderRadius = '4px';
    }
    
    return styles;
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }} ref={pickerRef}>
      <input
        type="text"
        value={value ? formatDate(value) : ''}
        placeholder={placeholderText}
        readOnly
        onClick={() => setIsOpen(!isOpen)}
        style={inputStyles}
        className={className}
      />
      
      {isOpen && (
        <div style={calendarStyles}>
          <div style={headerStyles}>
            <button
              style={canNavigateToPrevMonth() ? navButtonStyles : navButtonDisabledStyles}
              onClick={() => canNavigateToPrevMonth() && navigateMonth(-1)}
              onMouseEnter={(e) => {
                if (canNavigateToPrevMonth()) {
                  Object.assign(e.target.style, navButtonHoverStyles);
                }
              }}
              onMouseLeave={(e) => {
                if (canNavigateToPrevMonth()) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!canNavigateToPrevMonth()}
            >
              ❮
            </button>
            <div style={monthTitleStyles}>{monthYear}</div>
            <button
              style={canNavigateToNextMonth() ? navButtonStyles : navButtonDisabledStyles}
              onClick={() => canNavigateToNextMonth() && navigateMonth(1)}
              onMouseEnter={(e) => {
                if (canNavigateToNextMonth()) {
                  Object.assign(e.target.style, navButtonHoverStyles);
                }
              }}
              onMouseLeave={(e) => {
                if (canNavigateToNextMonth()) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              disabled={!canNavigateToNextMonth()}
            >
              ❯
            </button>
          </div>
          
          <div style={weekdaysStyles}>
            {moment.weekdaysShort().map(day => (
              <div key={day} style={weekdayStyles}>
                {day}
              </div>
            ))}
          </div>
          
          <div style={daysGridStyles}>
            {days.map((dateMoment, index) => (
              <button
                key={index}
                style={getDateStyles(dateMoment)}
                onClick={() => handleDateClick(dateMoment)}
                onMouseEnter={(e) => {
                  const isAvailable = isDateAvailable(dateMoment);
                  const isCurrentMonth = dateMoment.isSame(currentMonth, 'month');
                  const isSelected = value && moment(value).isSame(dateMoment, 'day');
                  
                  if (isAvailable && isCurrentMonth && !isSelected) {
                    e.target.style.backgroundColor = '#e9ecef';
                  }
                }}
                onMouseLeave={(e) => {
                  const isSelected = value && moment(value).isSame(dateMoment, 'day');
                  if (!isSelected) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
                disabled={!isDateAvailable(dateMoment)}
              >
                {dateMoment.date()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LifestyleCalendar;