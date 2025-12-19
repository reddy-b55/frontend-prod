import React from 'react'

export default function CustomizableSelector({ 
  data, 
  handleOnPress, 
  value, 
  label, 
  type, 
  renderParent, 
  handleSelect, 
  placeHolder, 
  error,  // Add error prop
  fieldKey // Add fieldKey for identification
}) {
  return (
    <div 
      className="col-12 ml-auto product-variant-head mb-3" 
      style={{ width: "100%", fontSize: "10px" }}
      data-field={fieldKey} // Add data attribute for scrolling
    >
      <div className="selector-container">
        <label className="selector-label">{label}</label>

        {type === "dropdown" ? (
          <div>
            <select
              className={`form-select ${error ? 'error-border' : ''}`}
              value={value}
              onChange={(e) => handleSelect(e.target.value)}
            >
              {data.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {error && <div className="error-text">{error}</div>}
          </div>
        ) : type === "date" ? (
          <div>
            {renderParent && renderParent()}
            {error && <div className="error-text">{error}</div>}
          </div>
        ) : (
          <div>
            <div 
              className={`form-select ${error ? 'error-border' : ''}`}
              style={{ 
                cursor: "pointer", 
                padding: "0.375rem 2rem 0.375rem 0.75rem", 
                border: "1px solid #ced4da", 
                borderRadius: "0.25rem", 
                backgroundColor: "#fff" 
              }} 
              onClick={() => handleOnPress(value)}
            >
              {placeHolder}
            </div>
            {error && <div className="error-text">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}