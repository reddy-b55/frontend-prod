import React, { useState, useMemo } from "react";
import { Modal, Button } from "reactstrap";
import styles from "./BookingQuestions.module.css";
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function BookingQuestions({
  attractionQuestions,
  handleOnPressContinueData,
  handleClickBack,
  loaders,
}) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const properties = attractionQuestions?.properties || {};
  const required = attractionQuestions?.required || [];

  // Helper function to get all required fields recursively
  const getAllRequiredFields = (obj, path = [], requiredFields = []) => {
    if (!obj || typeof obj !== 'object') return requiredFields;
    
    // Check if this object has required fields
    if (obj.required && Array.isArray(obj.required)) {
      obj.required.forEach(field => {
        requiredFields.push([...path, field].join('.'));
      });
    }
    
    // Recursively check properties
    if (obj.properties) {
      Object.entries(obj.properties).forEach(([key, value]) => {
        getAllRequiredFields(value, [...path, key], requiredFields);
      });
    }
    
    return requiredFields;
  };

  const allRequiredFields = useMemo(() => {
    const topLevelRequired = required.map(field => field);
    const nestedRequired = getAllRequiredFields(properties);
    return [...topLevelRequired, ...nestedRequired];
  }, [properties, required]);

  const isFieldRequired = (fieldPath) => {
    const pathString = Array.isArray(fieldPath) ? fieldPath.join('.') : fieldPath;
    const fieldKey = Array.isArray(fieldPath) ? fieldPath[fieldPath.length - 1] : fieldPath;
    
    return allRequiredFields.includes(pathString) || 
           allRequiredFields.includes(fieldKey) ||
           required.includes(fieldKey);
  };

  // Time format validation and formatting functions
  const isTimeField = (fieldSchema, fieldKey) => {
    return fieldSchema.format === 'time' || 
           fieldKey.toLowerCase().includes('time') ||
           fieldSchema.pattern === '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$';
  };

  const validateTimeFormat = (value) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(value);
  };

  const formatTimeInput = (text) => {
    // Remove non-numeric characters except colon
    let cleaned = text.replace(/[^\d:]/g, '');
    
    // Add colon automatically after 2 digits
    if (cleaned.length === 2 && !cleaned.includes(':')) {
      cleaned = cleaned + ':';
    }
    
    // Limit to HH:MM format (5 characters max)
    if (cleaned.length > 5) {
      cleaned = cleaned.substring(0, 5);
    }
    
    return cleaned;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Helper function to check if nested object has any meaningful value
    const checkNestedObjectHasValue = (objectSchema, objectValue) => {
      if (!objectSchema?.properties || !objectValue) return false;
      
      // Skip validation for enum objects
      if (objectSchema.enum || (objectSchema.oneOf && objectSchema.oneOf.some(option => option.enum))) {
        return !!objectValue; // Just check if something is selected
      }
      
      // For object fields like transfer_arrival_mode, check if user made a selection
      const selectedKeys = Object.keys(objectValue);
      if (selectedKeys.length > 0) {
        // Check if the selected option has any required nested fields that are filled
        const selectedKey = selectedKeys[0];
        const selectedOptionSchema = objectSchema.properties[selectedKey];
        const selectedOptionValue = objectValue[selectedKey];
        
        // If the selected option has no required fields, just having it selected is enough
        if (!selectedOptionSchema?.required || selectedOptionSchema.required.length === 0) {
          return true;
        }
        
        // If it has required fields, check if they're filled
        return selectedOptionSchema.required.some(reqField => {
          const fieldValue = selectedOptionValue?.[reqField];
          const nestedFieldSchema = selectedOptionSchema.properties?.[reqField];
          
          // Special validation for time fields
          if (isTimeField(nestedFieldSchema, reqField)) {
            return fieldValue && validateTimeFormat(fieldValue);
          }
          
          return fieldValue && (typeof fieldValue !== "string" || fieldValue.trim());
        });
      }
      
      return false;
    };
    
    // Validate top-level required fields
    required.forEach(fieldKey => {
      const fieldSchema = properties[fieldKey];
      const fieldValue = formData[fieldKey];
      
      // For enum fields, just check if a selection was made
      if (fieldSchema?.enum || (fieldSchema?.oneOf && fieldSchema.oneOf.some(option => option.enum))) {
        if (!fieldValue) {
          newErrors[fieldKey] = `${fieldSchema?.title || fieldKey} is required`;
        }
        return;
      }
      
      // For object types (non-enum), check if user has made any selection
      if (fieldSchema?.type === 'object' && fieldSchema.properties && !fieldSchema.enum) {
        const hasAnyNestedValue = checkNestedObjectHasValue(fieldSchema, fieldValue);
        if (!hasAnyNestedValue) {
          newErrors[fieldKey] = `${fieldSchema?.title || fieldKey} selection is required`;
        } else {
          // If object has a selection, validate its nested required fields
          const selectedKeys = Object.keys(fieldValue || {});
          if (selectedKeys.length > 0) {
            const selectedKey = selectedKeys[0];
            const selectedOptionSchema = fieldSchema.properties[selectedKey];
            const selectedOptionValue = fieldValue[selectedKey];
            
            if (selectedOptionSchema?.required) {
              selectedOptionSchema.required.forEach(nestedField => {
                const nestedValue = selectedOptionValue?.[nestedField];
                const nestedFieldPath = `${fieldKey}.${selectedKey}.${nestedField}`;
                const nestedFieldSchema = selectedOptionSchema.properties?.[nestedField];
                
                // Special validation for time fields
                if (isTimeField(nestedFieldSchema, nestedField)) {
                  if (!nestedValue || !nestedValue.trim()) {
                    newErrors[nestedFieldPath] = `${nestedFieldSchema?.title || nestedField} is required`;
                  } else if (!validateTimeFormat(nestedValue)) {
                    newErrors[nestedFieldPath] = 'Please enter time in HH:MM format (e.g., 14:30)';
                  }
                } else {
                  if (!nestedValue || (typeof nestedValue === "string" && !nestedValue.trim())) {
                    newErrors[nestedFieldPath] = `${nestedFieldSchema?.title || nestedField} is required`;
                  }
                }
              });
            }
          }
        }
      } else {
        // For non-object types, check the value directly
        if (isTimeField(fieldSchema, fieldKey)) {
          if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
            newErrors[fieldKey] = `${fieldSchema?.title || fieldKey} is required`;
          } else if (!validateTimeFormat(fieldValue)) {
            newErrors[fieldKey] = 'Please enter time in HH:MM format (e.g., 14:30)';
          }
        } else {
          if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
            newErrors[fieldKey] = `${fieldSchema?.title || fieldKey} is required`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to get nested property
  const getNestedProperty = (obj, path) => {
    if (!obj || !path || path.length === 0) return obj;
    return path.reduce((current, key) => current?.[key], obj);
  };

  // Helper function to set nested property
  const setNestedProperty = (obj, path, value) => {
    if (!path || path.length === 0) return obj;
    
    const newObj = { ...obj };
    let current = newObj;
    
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) {
        current[path[i]] = {};
      } else {
        current[path[i]] = { ...current[path[i]] };
      }
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    return newObj;
  };

  const handleFieldChange = (fieldPath, value) => {
    const pathArray = Array.isArray(fieldPath) ? fieldPath : [fieldPath];
    setFormData((prev) => setNestedProperty(prev, pathArray, value));
    
    const fullPath = pathArray.join('.');
    if (errors[fullPath]) {
      setErrors((prev) => ({ ...prev, [fullPath]: null }));
    }

    // Also clear parent object error if this is a nested field
    if (pathArray.length > 1) {
      const parentPath = pathArray.slice(0, -1).join('.');
      if (errors[parentPath]) {
        setErrors((prev) => ({ ...prev, [parentPath]: null }));
      }
    }
  };

  const handleTimeChange = (fieldPath, text) => {
    const formattedTime = formatTimeInput(text);
    handleFieldChange(fieldPath, formattedTime);
  };

  const handleContinue = () => {
    if (!validateForm()) {
      alert("Please fill in all required fields correctly");
      return;
    }
    handleOnPressContinueData(formData);
  };

  // MODIFIED: Dynamic option filtering - now filters out hotels with comma-ending addresses
  const getFilteredOptions = (fieldSchema) => {
    let options = [];
    
    // Handle different enum structures
    if (fieldSchema?.enum) {
      options = fieldSchema.enum;
    } else if (fieldSchema?.oneOf) {
      // Find the first oneOf that has enum
      const enumOption = fieldSchema.oneOf.find(option => option.enum);
      if (enumOption) {
        options = enumOption.enum;
      }
    }
    
    if (!options || options.length === 0) return [];
    
    // MODIFICATION: Filter out hotels with addresses ending in comma
    const filteredByComma = options.filter(item => {
      // Handle simple string enum
      if (typeof item === 'string') {
        return !item.endsWith(',');
      }
      
      // Handle complex object enum - check if address ends with comma
      if (typeof item === 'object' && item.address) {
        return !item.address.trim().endsWith(',');
      }
      
      // If no address property or other cases, include the item
      return true;
    });
    
    // Apply search filter on the comma-filtered results
    if (!searchQuery.trim()) return filteredByComma;
    
    return filteredByComma.filter((item) => {
      const searchTerm = searchQuery.toLowerCase();
      
      // Handle simple string enum
      if (typeof item === 'string') {
        return item.toLowerCase().includes(searchTerm);
      }
      
      // Handle complex object enum
      const nameMatch = item.name?.toLowerCase().includes(searchTerm);
      const addressMatch = item.address?.toLowerCase().includes(searchTerm);
      return nameMatch || addressMatch;
    });
  };

  const handleModalOpen = (fieldKey) => {
    setShowModal(fieldKey);
    setSearchQuery("");
  };

  const handleModalClose = () => {
    setShowModal(null);
    setSearchQuery("");
  };

  // Dynamic field type detection
  const getFieldType = (fieldSchema) => {
    // Priority 1: If it has enum, it's always a select field regardless of type
    if (fieldSchema.enum || (fieldSchema.oneOf && fieldSchema.oneOf.some(option => option.enum))) {
      return 'select';
    }
    // Priority 2: Check for other types
    if (fieldSchema.type === 'string') {
      return 'text';
    }
    if (fieldSchema.type === 'object' && fieldSchema.properties && !fieldSchema.enum) {
      return 'object';
    }
    return 'text'; // default
  };

  const renderTextField = (fieldPath, fieldSchema) => {
    const fieldKey = Array.isArray(fieldPath) ? fieldPath[fieldPath.length - 1] : fieldPath;
    const fullPath = Array.isArray(fieldPath) ? fieldPath.join('.') : fieldPath;
    const isRequired = isFieldRequired(fieldPath);
    const fieldValue = Array.isArray(fieldPath) 
      ? getNestedProperty(formData, fieldPath) 
      : formData[fieldPath];
    
    const isTime = isTimeField(fieldSchema, fieldKey);

    return (
      <div key={fullPath} className={styles.fieldContainer}>
        <label className={styles.fieldLabel}>
          {fieldSchema.title || fieldKey}
          {isRequired && <span className={styles.requiredMark}> *</span>}
          {isTime && (
            <span className={styles.formatHint}> (HH:MM format)</span>
          )}
        </label>
        
        {isTime && (
          <div className={styles.formatExampleContainer}>
            <i className="fas fa-clock" style={{ color: '#7f8c8d', fontSize: '14px' }}></i>
            <span className={styles.formatExample}>
              Example: 14:30 for 2:30 PM or 09:15 for 9:15 AM
            </span>
          </div>
        )}
        
        <textarea
          className={`${styles.textInput} ${errors[fullPath] ? styles.inputError : ''} ${isTime ? styles.timeInput : ''}`}
          value={fieldValue || ""}
          onChange={(e) => {
            const value = e.target.value;
            if (isTime) {
              handleTimeChange(fieldPath, value);
            } else {
              handleFieldChange(fieldPath, value);
            }
          }}
          placeholder={isTime ? "HH:MM" : `Enter ${fieldSchema.title || fieldKey}`}
          rows={isTime || fieldSchema.format === 'date-time' ? 1 : 3}
          maxLength={isTime ? 5 : undefined}
          style={isTime ? { resize: 'none', overflow: 'hidden' } : {}}
        />
        
        {errors[fullPath] && (
          <div className={styles.errorText}>{errors[fullPath]}</div>
        )}
      </div>
    );
  };

  const renderSelectField = (fieldPath, fieldSchema) => {
    const fieldKey = Array.isArray(fieldPath) ? fieldPath[fieldPath.length - 1] : fieldPath;
    const fullPath = Array.isArray(fieldPath) ? fieldPath.join('.') : fieldPath;
    const isRequired = isFieldRequired(fieldPath);
    const filteredOptions = getFilteredOptions(fieldSchema);
    const selectedValue = Array.isArray(fieldPath) 
      ? getNestedProperty(formData, fieldPath) 
      : formData[fieldPath];

    // Check for custom option capability
    const hasCustomOption = fieldSchema.oneOf?.length > 1 || 
                            fieldSchema.allowCustom || 
                            fieldSchema.additionalProperties;

                            const removeHtmlTagsRegex = (htmlString) => {
    return htmlString.replace(/<[^>]*>/g, '');
  };

    return (
      <div key={fullPath} className={styles.fieldContainer}>
        <label className={styles.fieldLabel}>
          {fieldSchema.title || fieldKey}
          {isRequired && <span className={styles.requiredMark}> *</span>}
        </label>
        <button
          type="button"
          className={`${styles.selectButton} ${errors[fullPath] ? styles.inputError : ''}`}
          onClick={() => handleModalOpen(fullPath)}
        >
          <div className={styles.selectContent}>
            {selectedValue ? (
              <div>
                {typeof selectedValue === 'object' ? (
                  <>
                    <div className={styles.selectedText}>{selectedValue.name}</div>
                    {selectedValue.address && (
                      <div className={styles.selectedSubtext}>
                        {selectedValue.address}
                      </div>
                    )}
                  </>
                ) : (
                  <div className={styles.selectedText}>{selectedValue}</div>
                )}
              </div>
            ) : (
              <div className={styles.selectPlaceholder}>
                Select {fieldSchema.title || fieldKey}
              </div>
            )}
          </div>
          {/* <i className="fas fa-chevron-right" style={{ color: '#007bff' }}></i> */}
          {/* <FiberManualRecordIcon /> */}
        </button>
        {errors[fullPath] && (
          <div className={styles.errorText}>{errors[fullPath]}</div>
        )}

        {/* Custom input for FREETEXT option */}
        {selectedValue?.id === "FREETEXT" && (
          <div className={styles.customInputContainer}>
            <label className={styles.fieldLabel}>
              Enter Custom {fieldSchema.title}
            </label>
            <textarea
              className={`${styles.textInput} ${
                !selectedValue.address?.trim() &&
                errors[fullPath] ? styles.inputError : ''
              }`}
              value={selectedValue.address || ""}
              onChange={(e) => {
                const updatedValue = { ...selectedValue, address: e.target.value };
                handleFieldChange(fieldPath, updatedValue);
              }}
              placeholder={`Enter custom ${fieldSchema.title?.toLowerCase()}`}
              rows={2}
            />
          </div>
        )}

        {/* Modal for selection */}
        <Modal
          isOpen={showModal === fullPath}
          toggle={handleModalClose}
          size="lg"
          className={styles.modal}
        >
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>
                Select {fieldSchema.title}
              </h5>
              <button
                type="button"
                className={styles.closeButton}
                onClick={handleModalClose}
              >
                {/* <i className="fas fa-times"></i> */}
              </button>
            </div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchInputContainer}>
                {/* <i className={`fas fa-search ${styles.searchIcon}`}></i> */}
                <input
                  type="text"
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${fieldSchema.title?.toLowerCase() || 'options'}...`}
                  autoCorrect="off"
                />
                {searchQuery.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={styles.clearButton}
                  >
                    {/* <i className="fas fa-times"></i> */}
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className={styles.modalBody}>
              {filteredOptions.length > 0 ? (
                <div className={styles.modalList}>
                  {filteredOptions.map((item, index) => (
                    <button
                      key={typeof item === 'object' 
                        ? (item.id ? item.id.toString() : index.toString())
                        : item.toString()}
                      type="button"
                      className={styles.optionItem}
                      onClick={() => {
                        handleFieldChange(fieldPath, item);
                        handleModalClose();
                      }}
                    >
                      <div className={styles.optionInfo}>
                        {typeof item === 'object' ? (
                          <>
                            <div className={styles.optionName}>{item.name}</div>
                            {item.address && item.id !== "FREETEXT" && (
                              <div className={styles.optionAddress}>{removeHtmlTagsRegex(item.address)}</div>
                            )}
                            {item.id === "FREETEXT" && (
                              <div className={styles.optionAddress}>{removeHtmlTagsRegex(item.address)}</div>
                            )}
                          </>
                        ) : (
                          <div className={styles.optionName}>{item}</div>
                        )}
                      </div>
                      {/* <i className="fas fa-chevron-right"></i> */}
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.noResultsContainer}>
                  {/* <i className="fas fa-search-minus" style={{ fontSize: '48px', color: '#bdc3c7' }}></i> */}
                  <div className={styles.noResultsTitle}>No results found</div>
                  <div className={styles.noResultsText}>
                    Try adjusting your search terms or browse all options below
                  </div>
                </div>
              )}

              {hasCustomOption && (
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.customOptionButton}
                    onClick={() => {
                      handleFieldChange(fieldPath, {
                        id: "FREETEXT",
                        name: `I don't see my ${fieldSchema.title?.toLowerCase()}.`,
                        address: "",
                      });
                      handleModalClose();
                    }}
                  >
                    <div className={styles.optionInfo}>
                      <div className={styles.customOptionName}>
                        I don't see my {fieldSchema.title?.toLowerCase()}.
                      </div>
                      <div className={styles.customOptionDescription}>
                        Enter custom option
                      </div>
                    </div>
                    {/* <i className="fas fa-plus" style={{ color: '#007AFF' }}></i> */}
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // Dynamic nested field rendering
  const renderNestedFields = (schema, path = []) => {
    if (!schema || !schema.properties) return null;

    return Object.entries(schema.properties).map(([fieldKey, fieldSchema]) => {
      const fieldPath = [...path, fieldKey];
      return renderField(fieldPath, fieldSchema);
    });
  };

  // Dynamic field rendering based on type
  const renderField = (fieldPath, fieldSchema) => {
    const fieldType = getFieldType(fieldSchema);
    const fullPath = Array.isArray(fieldPath) ? fieldPath.join('.') : fieldPath;
    
    switch (fieldType) {
      case 'select':
        return renderSelectField(fieldPath, fieldSchema);
      case 'object':
        // For object types, we need to render a selection interface first
        return renderObjectField(fieldPath, fieldSchema);
      case 'text':
      default:
        return renderTextField(fieldPath, fieldSchema);
    }
  };

  // New function to handle object fields (like transfer_arrival_mode)
  const renderObjectField = (fieldPath, fieldSchema) => {
    const fieldKey = Array.isArray(fieldPath) ? fieldPath[fieldPath.length - 1] : fieldPath;
    const fullPath = Array.isArray(fieldPath) ? fieldPath.join('.') : fieldPath;
    const isRequired = isFieldRequired(fieldPath);
    const currentValue = Array.isArray(fieldPath) 
      ? getNestedProperty(formData, fieldPath) 
      : formData[fieldPath];

    // Get available options from object properties
    const objectOptions = fieldSchema.properties ? Object.keys(fieldSchema.properties) : [];
    const selectedOption = currentValue ? Object.keys(currentValue)[0] : null;

    return (
      <div key={fullPath} className={styles.fieldContainer}>
        <label className={styles.fieldLabel}>
          {fieldSchema.title || fieldKey}
          {isRequired && <span className={styles.requiredMark}> *</span>}
        </label>
        
        {/* Selection buttons for object options */}
        <div className={styles.objectOptionsContainer}>
          {objectOptions.map((optionKey) => {
            const optionSchema = fieldSchema.properties[optionKey];
            const isSelected = selectedOption === optionKey;
            
            return (
              <button
                key={optionKey}
                type="button"
                className={`${styles.objectOptionButton} ${
                  isSelected ? styles.objectOptionButtonSelected : ''
                } ${errors[fullPath] && !isSelected ? styles.inputError : ''}`}
                onClick={() => {
                  // Clear previous selection and set new one
                  const newValue = { [optionKey]: {} };
                  handleFieldChange(fieldPath, newValue);
                }}
              >
                <div className={styles.objectOptionContent}>
                  {/* <i className={`fas ${isSelected ? 'fa-dot-circle' : 'fa-circle'} ${styles.radioIcon}`}></i> */}
                  <span className={`${styles.objectOptionText} ${
                    isSelected ? styles.objectOptionTextSelected : ''
                  }`}>
                    {optionSchema?.title || optionKey.replace(/^[A-Z_]+_/, '').replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {errors[fullPath] && (
          <div className={styles.errorText}>{errors[fullPath]}</div>
        )}

        {/* Render nested fields for selected option */}
        {selectedOption && fieldSchema.properties[selectedOption] && (
          <div className={styles.nestedFieldsContainer}>
            <div className={styles.nestedSectionTitle}>
              {fieldSchema.properties[selectedOption]?.title || selectedOption} Details
            </div>
            {renderNestedFields(fieldSchema.properties[selectedOption], [...(Array.isArray(fieldPath) ? fieldPath : [fieldPath]), selectedOption])}
          </div>
        )}
      </div>
    );
  };

  const hasFields = Object.keys(properties).length > 0;

  return (
    <div className={styles.container}>
      {hasFields ? (
        <div className={styles.scrollContainer}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Please provide the following information
            </h3>
            <p className={styles.sectionDescription}>
              All fields marked with * are required
            </p>
            
            {/* Dynamically render all fields */}
            {Object.entries(properties).map(([fieldKey, fieldSchema]) => {
              return renderField(fieldKey, fieldSchema);
            })}
          </div>

          {/* Info Section */}
          <div className={styles.infoSection}>
            <div className={styles.infoHeader}>
              {/* <i className="fas fa-info-circle" style={{ color: '#007bff' }}></i> */}
              <h4 className={styles.infoTitle}>Information</h4>
            </div>
            <p className={styles.infoText}>
              • Please ensure all information is accurate
            </p>
            <p className={styles.infoText}>
              • Required fields must be completed to continue
            </p>
            <p className={styles.infoText}>
              • For time fields, use 24-hour format (HH:MM)
            </p>
            <p className={styles.infoText}>
              • You can review and modify this information before final booking
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.noFieldsContainer}>
          {/* <i className="fas fa-check-circle" style={{ fontSize: '64px', color: '#007bff' }}></i> */}
          <h3 className={styles.noFieldsTitle}>
            No Additional Information Needed
          </h3>
          <p className={styles.noFieldsText}>
            You can proceed directly to the next step.
          </p>
        </div>
      )}

      {/* Continue Button */}
      <div className={styles.buttonContainer}>
        <Button
          className={`${styles.continueButton} ${
            Object.keys(errors).length > 0 ? styles.disabledButton : ''
          }`}
          onClick={handleContinue}
          disabled={loaders || Object.keys(errors).length > 0}
        >
          <span className={styles.continueButtonText}>Continue</span>
          {loaders ? (
            <div className={styles.loader}>
              {/* <i className="fas fa-spinner fa-spin"></i> */}
            </div>
          ) : (
            // <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
            null
          )}
        </Button>
      </div>
    </div>
  );
}