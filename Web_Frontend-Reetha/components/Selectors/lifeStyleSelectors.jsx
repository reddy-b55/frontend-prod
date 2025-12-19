import React, { useState } from "react";



// Generalized component that can be customized
const CustomizableSelector = ({ 
  icon, 
  label, 
  value, 
  options = [], 
  onChange, 
  type = "default" 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const selectOption = (option) => {
    onChange(option);
    setIsDropdownOpen(false);
  };
  
  // Render the appropriate icon based on type
  const renderIcon = () => {
    switch (type) {
      case "time":
        return (
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V12L16 14" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="2"/>
            </svg>
          </div>
        );
      case "ticket":
        return (
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 9H20M4 15H20M8 3V21M16 3V21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      case "location":
        return (
          <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 21C16 17 20 13.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 13.4183 8 17 12 21Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        );
      default:
        return icon || null;
    }
  };
  
  return (
<div className="relative w-40">
  {/* Selector Box */}
  <div 
    className="bg-white rounded-md p-2 shadow-md flex items-center justify-between cursor-pointer border border-gray-300"
    onClick={toggleDropdown}
  >
    {/* Icon & Label */}
    <div className="flex items-center">
      {/* Icon */}
      <div className="mr-2">{renderIcon()}</div>

      {/* Label & Value */}
      <div>
        <p className="text-xs text-gray-600">{label}</p>
        <p className="text-sm font-bold">{value}</p>
      </div>
    </div>

    {/* Dropdown Arrow */}
    <div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>

  {/* Dropdown Menu */}
  {isDropdownOpen && (
    <div className="absolute left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-10 border border-gray-300">
      {options.map((option, index) => (
        <div 
          key={index}
          className={`py-2 px-4 hover:bg-gray-100 cursor-pointer ${option === value ? 'text-blue-500 font-medium' : ''}`}
          onClick={() => selectOption(option)}
        >
          {option}
        </div>
      ))}
    </div>
  )}
</div>

  );
};



export default CustomizableSelector;