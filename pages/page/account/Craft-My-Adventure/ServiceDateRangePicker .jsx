import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DateRangePicker = ({ 
  upcomingDates = [],
  onDateRangeSelect
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [isSelectingRange, setIsSelectingRange] = useState(false);

  // Set today as default selected date
  useEffect(() => {
    const today = new Date();
    setSelectedStartDate(today);
    setSelectedEndDate(today);
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    if (!date) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatDateForArray = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isUpcomingDate = (date) => {
    const dateStr = formatDateForArray(date);
    return upcomingDates.includes(dateStr);
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.toDateString() === date2.toDateString();
  };

  const isInSelectedRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const start = new Date(Math.min(selectedStartDate, selectedEndDate));
    const end = new Date(Math.max(selectedStartDate, selectedEndDate));
    return date >= start && date <= end;
  };

  const isRangeStart = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const start = new Date(Math.min(selectedStartDate, selectedEndDate));
    return isSameDay(date, start);
  };

  const isRangeEnd = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const end = new Date(Math.max(selectedStartDate, selectedEndDate));
    return isSameDay(date, end);
  };

  const handleDateClick = (date) => {
    if (!isSelectingRange) {
      setSelectedStartDate(date);
      setSelectedEndDate(date);
      setIsSelectingRange(true);
    } else {
      setSelectedEndDate(date);
      setIsSelectingRange(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        day: prevDate.getDate()
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        day
      });
    }

    return days;
  };

  const handleProceed = () => {
    if (selectedStartDate && selectedEndDate) {
      const start = new Date(Math.min(selectedStartDate, selectedEndDate));
      const end = new Date(Math.max(selectedStartDate, selectedEndDate));
      onDateRangeSelect(formatDateForArray(start), formatDateForArray(end));
      onDateRangeSelect(start, end)
      console.log('Selected range:', formatDateForArray(start), 'to', formatDateForArray(end));
    }
  };

  const days = getDaysInMonth();

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      maxWidth: '400px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '20px',
    //   boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <style>{`
        .calendar-container {
          background: #fff;
        }
        
        .calendar-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .calendar-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }
        
        .calendar-subtitle {
          font-size: 12px;
          color: #666;
          line-height: 1.4;
        }
        
        .month-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 20px 0;
        }
        
        .nav-button {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
        
        .nav-button:hover {
          background-color: #f5f5f5;
        }
        
        .month-year {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 4px;
        }
        
        .day-header {
          text-align: center;
          padding: 8px 4px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
        }
        
        .day-cell {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          position: relative;
          border: none;
          background: none;
        }
        
        .day-cell:hover {
          background-color: #f0f0f0;
        }
        
        .day-cell.other-month {
          color: #ccc;
        }
        
        .day-cell.upcoming {
          background-color: #ff9500;
          color: white;
        }
        
        .day-cell.upcoming:hover {
          background-color: #e6860a;
        }
        
        .day-cell.selected {
          background-color: #22c55e;
          color: white;
        }
        
        .day-cell.selected:hover {
          background-color: #16a34a;
        }
        
        .day-cell.in-range {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .day-cell.range-start,
        .day-cell.range-end {
          background-color: #22c55e;
          color: white;
        }
        
        .date-range-display {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          font-size: 14px;
          font-weight: 500;
        }
        
        .date-range-item {
          color: #1a1a1a;
        }
        
        .legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          font-size: 12px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        
        .legend-dot.upcoming {
          background-color: #ff9500;
        }
        
        .legend-dot.selected {
          background-color: #22c55e;
        }
        
        .proceed-button {
          width: 100%;
          background-color: #1a1a1a;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .proceed-button:hover {
          background-color: #333;
        }
      `}</style>
      
      <div className="calendar-container">
        <div className="calendar-header">
          {/* <div className="calendar-title">Please choose date range</div> */}
          <div className="calendar-subtitle">
            Choose a date range to generate the itinerary.
            Orange dates show your upcoming service dates.
          </div>
        </div>

        <div className="month-navigation">
          <button className="nav-button" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={20} />
          </button>
          <div className="month-year">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button className="nav-button" onClick={() => navigateMonth(1)}>
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="day-header">{day}</div>
          ))}
          
          {days.map((dayObj, index) => {
            const isUpcoming = isUpcomingDate(dayObj.date);
            const isSelected = isSameDay(dayObj.date, selectedStartDate) || isSameDay(dayObj.date, selectedEndDate);
            const inRange = isInSelectedRange(dayObj.date);
            const rangeStart = isRangeStart(dayObj.date);
            const rangeEnd = isRangeEnd(dayObj.date);
            
            let className = 'day-cell';
            if (!dayObj.isCurrentMonth) className += ' other-month';
            if (isUpcoming) className += ' upcoming';
            if (isSelected || rangeStart || rangeEnd) className += ' selected';
            else if (inRange) className += ' in-range';

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleDateClick(dayObj.date)}
              >
                {dayObj.day}
              </button>
            );
          })}
        </div>

        <div className="date-range-display">
          <div className="date-range-item">
            Start: {selectedStartDate ? formatDate(selectedStartDate) : 'Select date'}
          </div>
          <div className="date-range-item">
            End: {selectedEndDate ? formatDate(selectedEndDate) : 'Select date'}
          </div>
        </div>

        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot upcoming"></div>
            <span>Upcoming Service Dates</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot selected"></div>
            <span>Selected Dates</span>
          </div>
        </div>

        <button className="proceed-button" onClick={handleProceed}>
          Proceed to My Adventure Craft
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;