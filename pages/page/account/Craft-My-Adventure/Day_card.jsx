import React, { useState, useEffect, useRef } from "react";
import { Card, Col, Image, Row, Button } from "react-bootstrap";
import ModalBase from "../../../../components/common/Modals/ModalBase";

function Day_card({ day, iterneryType, onUpdateDay }) {
  // State to track expanded description for each activity by index
  const [expandedActivities, setExpandedActivities] = useState({});
  
  // State for reordering modal
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [tempActivities, setTempActivities] = useState([]);
  
  // State for drag and drop
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverItem, setDraggedOverItem] = useState(null);
  
  // Internal state to manage the current day data
  const [currentDayData, setCurrentDayData] = useState(day);

  const toggleDescription = (activityIndex) => {
    setExpandedActivities(prev => ({
      ...prev,
      [activityIndex]: !prev[activityIndex]
    }));
  };

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentDayData(day);
  }, [day]);

  // Prevent scroll when reorder modal is open
  useEffect(() => {
    if (showReorderModal) {
      // Store current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      
      // Prevent touch events on mobile
      const preventTouchMove = (e) => e.preventDefault();
      
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      
      return () => {
        // Restore scrolling when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';
        
        // Remove event listeners
        document.removeEventListener('touchmove', preventTouchMove);
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [showReorderModal]);

  const handleReorderClick = () => {
    setTempActivities([...currentDayData.data]);
    setShowReorderModal(true);
  };

  // Custom Drag and Drop Functions - FIXED
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
    
    // Use the current target (the div being dragged) for drag image
    e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDraggedOverItem(index);
  };

  const handleDragLeave = (e) => {
    setDraggedOverItem(null);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    
    if (draggedItem !== null && draggedItem !== index) {
      const newActivities = [...tempActivities];
      const draggedItemContent = newActivities[draggedItem];
      
      // Remove the dragged item
      newActivities.splice(draggedItem, 1);
      // Insert it at the new position
      newActivities.splice(index, 0, draggedItemContent);
      
      setTempActivities(newActivities);
    }
    
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const handleDragEnd = (e) => {
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const saveReorder = () => {
    // Update the day data with new order
    const updatedDay = {
      ...currentDayData,
      data: tempActivities
    };
    
    // Update internal state
    setCurrentDayData(updatedDay);
    
    // Call parent function to update the day if provided
    if (onUpdateDay) {
      onUpdateDay(updatedDay);
    }
    
    // Reset expanded activities state since indices have changed
    setExpandedActivities({});
    setShowReorderModal(false);
    
    // Reset drag states
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const cancelReorder = () => {
    setTempActivities([]);
    setShowReorderModal(false);
    
    // Reset drag states
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  function removeHtmlTagsRegex(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  return (
    <>
      <Col xs={12} className="mb-4 rounded" key={currentDayData.itinerary_date}>
        <div className="day-card">
          {/* Day Header */}
          <div
            className="day-header text-white fw-bold p-3 d-flex justify-content-between align-items-center"
            style={{
              backgroundColor: "#ed4242",
              color: "#ffffffff",
              borderTopLeftRadius: "0.5rem",
              borderTopRightRadius: "0.5rem",
            }}
          >
            <div>
              <h4 className="mb-0" style={{ color: "#fafafaff", fontWeight: "bold" }}>
                Day {currentDayData.itinerary_date}
              </h4>
              <div style={{ color: "#e919cdff" }}>{currentDayData.date}</div>
            </div>
            
            {/* Reorder button - only show if more than 1 activity */}
            {currentDayData.data && currentDayData.data.length > 1 && (
              <Button
                variant="outline-light"
                size="sm"
                onClick={handleReorderClick}
                className="d-flex align-items-center gap-2"
              >
                <i className="fa fa-sort" aria-hidden="true"></i>
                Reorder
              </Button>
            )}
          </div>

          {/* Day Activities */}
          <Card className="border-0 shadow-sm">
            {currentDayData.data?.map((activity, index) => {
              const isExpanded = expandedActivities[index] || false;
              
              return (
                <div key={index} className="activity p-3">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="activity-title fw-bold mb-0" style={{ color: "#ed4242" }}>
                      {activity.service_data?.service_name}
                    </h5>
                  </div>

                  <Row>
                    {iterneryType === "long" ? (
                      <Col xs={12} md={4} className="mb-3">
                        {/* Activity Image */}
                        <Image
                          src={activity.service_data?.service_image}
                          alt={activity.service_data?.service_name}
                          fluid
                          className="rounded"
                          loading="lazy"
                          style={{
                            height: "200px",
                            width: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </Col>
                    ) : null}

                    <Col xs={12} md={8}>
                      {/* Time Pill */}
                      <div className="d-inline-block bg-dark text-white py-2 px-3 rounded-pill mb-3 gap-2">
                        <i className="fa fa-clock-o me-2" aria-hidden="true"></i>
                        {activity.service_data?.service_time}
                      </div>

                      {/* Location */}
                      <div className="mb-3">
                        <i className="fa fa-map-marker me-2" aria-hidden="true"></i>
                        Service Location: {activity.service_data?.service_location}
                      </div>

                      {/* Description */}
                      <p 
                        className="mb-2"
                        style={{
                          display: isExpanded ? "block" : "-webkit-box",
                          WebkitLineClamp: isExpanded ? "unset" : "3",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {removeHtmlTagsRegex(activity?.activity_description)}
                      </p>
                      
                      {/* Only show Read More/Less if text is long enough to be truncated */}
                      {activity.activity_description.length > 110 && (
                        <a 
                          className="text-primary" 
                          onClick={() => toggleDescription(index)} 
                          style={{ cursor: "pointer" }}
                        >
                          {isExpanded ? "Read Less" : "Read More"}
                        </a>
                      )}
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Card>
        </div>
      </Col>
      
      <ModalBase 
        isOpen={showReorderModal} 
        toggle={cancelReorder} 
        title="Reorder Itinerary" 
        size='lg'
        style={{
          // fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}
      >
        <div style={{
          padding: '20px 0',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {/* Instructions - Updated to match image */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            borderLeft: '4px solid #ed4242',
            fontSize: '14px',
            color: '#495057',
            lineHeight: '1.5'
          }}>
            <i className="fa fa-info-circle" style={{ marginRight: '8px', color: '#ed4242' }}></i>
            Drag and drop activities to reorder. Click and hold the handle (<span style={{fontSize: '16px', verticalAlign: 'middle'}}>≡</span>) to drag.
          </div>

          {tempActivities.map((activity, index) => (
            <div
              key={index}
              className="draggable-item"
              draggable="true"
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                margin: '8px 0',
                backgroundColor: draggedItem === index ? '#f8f9fa' : 
                                draggedOverItem === index ? '#fff8f8' : '#ffffffff',
                borderRadius: '8px',
                border: draggedItem === index ? '2px dashed #ed4242' : 
                       draggedOverItem === index ? '2px solid #ed4242' : '1px solid #e0e0e0',
                boxShadow: draggedItem === index ? '0 4px 12px rgba(237, 66, 66, 0.15)' : 
                           draggedOverItem === index ? '0 2px 8px rgba(237, 66, 66, 0.1)' : '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'all 0.2s ease',
                position: 'relative',
                cursor: 'grab',
                opacity: draggedItem === index ? '0.6' : '1',
                transform: draggedOverItem === index ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Drag Handle - Updated to match image */}
              <div 
                style={{
                  marginRight: '16px',
                  color: '#6c757d',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'grab',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ed4242';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6c757d';
                }}
              >
                ≡
              </div>

              {/* Activity Details */}
              <div style={{
                flex: 1,
                minWidth: 0
              }}>
                <h6 style={{
                  margin: '0 0 8px 0',
                  color: '#ed4242',
                  fontSize: '16px',
                  fontWeight: '600',
                  lineHeight: '1.3'
                }}>
                  {activity.service_data?.service_name}
                </h6>
                
                {/* Activity Info - Two column layout */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  fontSize: '14px',
                  color: '#6c757d'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: '200px'
                  }}>
                    <i className="fa fa-clock-o" style={{
                      marginRight: '8px',
                      width: '14px',
                      color: '#ed4242',
                      textAlign: 'center'
                    }}></i>
                    <span>{activity.service_data?.service_time || 'Time not specified'}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flex: 1,
                    minWidth: '250px'
                  }}>
                    <i className="fa fa-map-marker" style={{
                      marginRight: '8px',
                      width: '14px',
                      color: '#ed4242',
                      textAlign: 'center',
                      marginTop: '2px'
                    }}></i>
                    <span style={{ wordWrap: 'break-word', lineHeight: '1.4' }}>
                      {activity.service_data?.service_location || 'Location not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Updated spacing and styling */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef',
          marginTop: '20px'
        }}>
          <Button 
            variant="outline-secondary" 
            onClick={cancelReorder}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '14px',
              border: '1px solid #6c757d',
              backgroundColor: 'transparent',
              color: '#6c757d',
              transition: 'all 0.2s ease',
              minWidth: '100px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#6c757d15';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="primary" 
            onClick={saveReorder}
            style={{
              padding: '10px 24px',
              backgroundColor: '#ed4242',
              borderColor: '#ed4242',
              borderRadius: '6px',
              fontWeight: '500',
              fontSize: '14px',
              border: 'none',
              transition: 'all 0.2s ease',
              minWidth: '120px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#d93838';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(237, 66, 66, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ed4242';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Save Order
          </Button>
        </div>
      </ModalBase>
    </>
  );
}

export default Day_card;

// import React, { useState } from "react";
// import { Card, Col, Image, Row } from "react-bootstrap";

// function Day_card({ day, iterneryType }) {
//   console.log("chamod craft", day);
//   // State to track expanded description for each activity by index
//   const [expandedActivities, setExpandedActivities] = useState({});

//   const toggleDescription = (activityIndex) => {
//     setExpandedActivities(prev => ({
//       ...prev,
//       [activityIndex]: !prev[activityIndex]
//     }));
//   };


//   function removeHtmlTagsRegex(html) {
//     return html.replace(/<[^>]*>/g, '');
// }

//   return (
//     <Col xs={12} className="mb-4 rounded" key={day.itinerary_date}>
//       <div className="day-card">
//         {/* Day Header */}
//         <div
//           className="day-header text-white fw-bold p-3"
//           style={{
//             backgroundColor: "#ed4242",
//             color: "#ffffffff",
//             borderTopLeftRadius: "0.5rem",
//             borderTopRightRadius: "0.5rem",
//           }}
//         >
//           <h4 className="mb-0" style={{ color: "#fafafaff", fontWeight: "bold" }}>
//             Day {day.itinerary_date}
//           </h4>
//           <div style={{ color: "#e919cdff" }}>{day.date}</div>
//         </div>

//         {/* Day Activities */}
//         <Card className="border-0 shadow-sm">
//           {day.data?.map((activity, index) => {
//             const isExpanded = expandedActivities[index] || false;
            
//             return (
//               <div key={index} className="activity p-3">
//                 <h5 className="activity-title fw-bold mb-3" style={{ color: "#ed4242" }}>
//                   {activity.service_data?.service_name}
//                 </h5>

//                 <Row>
//                   {iterneryType === "long" ? (
//                     <Col xs={12} md={4} className="mb-3">
//                       {/* Activity Image */}
//                       <Image
//                         src={activity.service_data?.service_image}
//                         alt={activity.service_data?.service_name}
//                         fluid
//                         className="rounded"
//                         loading="lazy"
//                         style={{
//                           height: "200px",
//                           width: "100%",
//                           objectFit: "cover",
//                         }}
//                       />
//                     </Col>
//                   ) : null}

//                   <Col xs={12} md={8}>
//                     {/* Time Pill */}
//                     <div className="d-inline-block bg-dark text-white py-2 px-3 rounded-pill mb-3 gap-2">
//                       <i className="fa fa-clock-o me-2" aria-hidden="true"></i>
//                       {activity.service_data?.service_time}
//                     </div>

//                     {/* Location */}
//                     <div className="mb-3">
//                       <i className="fa fa-map-marker me-2" aria-hidden="true"></i>
//                       Service Location: {activity.service_data?.service_location}
//                     </div>

//                     {/* Description */}
//                     <p 
//                       className="mb-2"
//                       style={{
//                         display: isExpanded ? "block" : "-webkit-box",
//                         WebkitLineClamp: isExpanded ? "unset" : "3",
//                         WebkitBoxOrient: "vertical",
//                         overflow: "hidden",
//                         textOverflow: "ellipsis",
//                       }}
//                     >
//                       {/* {activity?.activity_description} */}
//                       {removeHtmlTagsRegex(activity?.activity_description)}
//                     </p>
                    
//                     {/* Only show Read More/Less if text is long enough to be truncated */}
//                     {activity.activity_description.length > 110 && (
//                       <a 
//                         className="text-primary" 
//                         onClick={() => toggleDescription(index)} 
//                         style={{ cursor: "pointer" }}
//                       >
//                         {isExpanded ? "Read Less" : "Read More"}
//                       </a>
//                     )}
//                   </Col>
//                 </Row>
//               </div>
//             );
//           })}
//         </Card>
//       </div>
//     </Col>
//   );
// }

// export default Day_card;