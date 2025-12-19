import React, { useState, useEffect } from 'react';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import ToastMessage from '../Notification/ToastMessage';

const RoomAllocation = ({ handleRoomAllocation, handleTogle, preData = {}, isInline = false }) => {
  const styles = {
    container: {
      width: '320px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e5e7eb',
      backgroundColor: '#f8fafc'
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '8px'
    },
    headerSubtitle: {
      fontSize: '14px',
      color: '#6b7280'
    },
    content: {
      padding: '20px'
    },
    guestSection: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '16px'
    },
    counterRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    counterLabel: {
      display: 'flex',
      flexDirection: 'column'
    },
    mainLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '4px'
    },
    subLabel: {
      fontSize: '12px',
      color: '#6b7280'
    },
    counterContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    counterButton: {
      width: '32px',
      height: '32px',
      borderRadius: '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: '500',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#1d4ed8',
      transition: 'background-color 0.2s ease'
    },
    counterButtonDisabled: {
      backgroundColor: '#d1d5db',
      cursor: 'not-allowed'
    },
    counterValue: {
      width: '40px',
      textAlign: 'center',
      fontWeight: '600',
      fontSize: '16px',
      color: '#1f2937'
    },
    petsSection: {
      padding: '16px',
      backgroundColor: '#f3f4f6',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    petsTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px'
    },
    petsDescription: {
      fontSize: '12px',
      color: '#6b7280',
      lineHeight: '1.4',
      marginBottom: '8px'
    },
    petsLink: {
      fontSize: '12px',
      color: '#1d4ed8',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb'
    },
    doneButton: {
      flex: 1,
      backgroundColor: '#1d4ed8',
      padding: '12px 20px',
      color: 'white',
      fontSize: '16px',
      border: 'none',
      fontWeight: '600',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    resetButton: {
      flex: 1,
      backgroundColor: '#6b7280',
      padding: '12px 20px',
      color: 'white',
      fontSize: '16px',
      border: 'none',
      fontWeight: '500',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    }
  };

  // Simple state management - no complex room types
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    rooms: 1
  });

  // Initialize with preData
  useEffect(() => {
    if (preData && Object.keys(preData).length > 0) {
      if (preData.totalAdults || preData.totalChildren || preData.totalRooms) {
        setGuests({
          adults: preData.totalAdults || 1,
          children: preData.totalChildren || 0,
          rooms: preData.totalRooms || 1
        });
      }
    }
  }, [preData]);

  const updateGuestCount = (type, increment) => {
    setGuests(prev => {
      const newValue = Math.max(0, prev[type] + increment);
      
      // Basic validation
      if (type === 'adults') {
        // Ensure at least 1 adult per room
        const minAdults = prev.rooms;
        return { ...prev, adults: Math.max(minAdults, newValue) };
      } else if (type === 'rooms') {
        // Ensure rooms don't exceed adults
        const maxRooms = prev.adults;
        const newRooms = Math.max(1, Math.min(maxRooms, newValue));
        return { ...prev, rooms: newRooms };
      } else {
        return { ...prev, [type]: newValue };
      }
    });
  };

  const isDecrementDisabled = (type) => {
    if (type === 'adults') return guests.adults <= guests.rooms; // At least 1 adult per room
    if (type === 'rooms') return guests.rooms <= 1; // At least 1 room
    if (type === 'children') return guests.children <= 0;
    return false;
  };

  const isIncrementDisabled = (type) => {
    if (type === 'adults') return guests.adults >= 10; // Reasonable limit
    if (type === 'rooms') return guests.rooms >= 10 || guests.rooms >= guests.adults;
    if (type === 'children') return guests.children >= 10; // Reasonable limit
    return false;
  };

  const handleSave = () => {
    const allocationData = {
      totalRooms: guests.rooms,
      totalAdults: guests.adults,
      totalChildren: guests.children,
      roomDetails: [{
        type: 'Standard',
        adults: guests.adults,
        children: guests.children
      }]
    };
    
    handleRoomAllocation(allocationData);
    
    if (isInline) {
      ToastMessage({ status: "success", message: "Guest selection updated successfully!" });
    } else {
      handleTogle();
    }
  };

  const handleReset = () => {
    setGuests({
      adults: 1,
      children: 0,
      rooms: 1
    });
    ToastMessage({ status: "success", message: "Guest selection has been reset!" });
  };

  const CounterButton = ({ onPress, disabled, children, type = 'increment' }) => {
    const buttonStyle = {
      ...styles.counterButton,
      ...(disabled ? styles.counterButtonDisabled : {})
    };

    return (
      <button
        onClick={onPress}
        disabled={disabled}
        style={buttonStyle}
        onMouseOver={(e) => !disabled && (e.target.style.backgroundColor = type === 'increment' ? '#1e40af' : '#1e40af')}
        onMouseOut={(e) => !disabled && (e.target.style.backgroundColor = '#1d4ed8')}
      >
        {children}
      </button>
    );
  };

  const CounterRow = ({ label, subLabel, value, type }) => (
    <div style={styles.counterRow}>
      <div style={styles.counterLabel}>
        <span style={styles.mainLabel}>{label}</span>
        {subLabel && <span style={styles.subLabel}>{subLabel}</span>}
      </div>
      <div style={styles.counterContainer}>
        <CounterButton
          onPress={() => updateGuestCount(type, -1)}
          disabled={isDecrementDisabled(type)}
          type="decrement"
        >
          <RemoveIcon style={{ fontSize: '16px' }} />
        </CounterButton>
        <span style={styles.counterValue}>{value}</span>
        <CounterButton
          onPress={() => updateGuestCount(type, 1)}
          disabled={isIncrementDisabled(type)}
          type="increment"
        >
          <AddIcon style={{ fontSize: '16px' }} />
        </CounterButton>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>Guests & Rooms</div>
        <div style={styles.headerSubtitle}>
          {guests.adults} adult{guests.adults !== 1 ? 's' : ''} · {guests.children} children · {guests.rooms} room{guests.rooms !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Adults Section */}
        <div style={styles.guestSection}>
          <div style={styles.sectionTitle}>Guests</div>
          <CounterRow
            label="Adults"
            subLabel="Ages 13 or above"
            value={guests.adults}
            type="adults"
          />
          <CounterRow
            label="Children"
            subLabel="Ages 0-12"
            value={guests.children}
            type="children"
          />
        </div>

        {/* Rooms Section */}
        <div style={styles.guestSection}>
          <div style={styles.sectionTitle}>Rooms</div>
          <CounterRow
            label="Rooms"
            value={guests.rooms}
            type="rooms"
          />
        </div>


        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button
            onClick={handleSave}
            style={styles.doneButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e40af'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          >
            Done
          </button>
          <button
            onClick={handleReset}
            style={styles.resetButton}
            onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#6b7280'}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomAllocation;



// import React, { useState, useEffect } from 'react';
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
// import RemoveIcon from '@mui/icons-material/Remove';
// import AddIcon from '@mui/icons-material/Add';
// import ToastMessage from '../Notification/ToastMessage';

// const RoomAllocation = ({handleRoomAllocation , handleTogle, preData={}}) => {
//   const styles = {
//     container: {
//       maxWidth: '100%',
//       margin: '0 auto',
//       backgroundColor: 'white',
//       height: "calc(100vh - 200px)",
//       display: 'flex',
//       flexDirection: 'column'
//     },
//     headerContainer: {
//       display: 'flex',
//       alignItems: 'center',
//       padding: '16px',
//       borderBottom: '1px solid #e5e7eb'
//     },
//     backButton: {
//       width: '24px',
//       height: '24px',
//       color: '#6b7280'
//     },
//     title: {
//       marginLeft: '8px',
//       fontSize: '18px',
//       fontWeight: '500',
//       color: '#111827'
//     },
//     scrollableContent: {
//       flex: 1,
//       overflowY: 'auto',
//       padding: '16px',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: '16px'
//     },
//     sectionContainer: {
//       backgroundColor: '#f3f4f6',
//       padding: '16px',
//       borderRadius: '8px',
//       borderBottom: '1px solid #e5e7eb'
//     },
//     sectionTitle: {
//       fontWeight: '600',
//       color: '#1f2937',
//       marginBottom: '8px'
//     },
//     sectionSubtitle: {
//       fontSize: '14px',
//       color: '#6b7280',
//       marginBottom: '16px'
//     },
//     roomGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(4, 1fr)',
//       gap: '8px'
//     },
//     roomTypeContainer: {
//       textAlign: 'center'
//     },
//     roomTypeLabel: {
//       fontSize: '14px',
//       fontWeight: '500',
//       color: '#374151',
//       marginBottom: '4px'
//     },
//     counterContainer: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       gap: '8px'
//     },
//     counterButton: {
//       width: '32px',
//       height: '32px',
//       borderRadius: '6px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       color: 'white',
//       fontWeight: '500',
//       border: 'none',
//       cursor: 'pointer'
//     },
//     counterButtonEnabled: {
//       backgroundColor: '#f83b45ff'
//     },
//     counterButtonDisabled: {
//       backgroundColor: '#d6d6d6ff',
//       cursor: 'not-allowed'
//     },
//     counterButtonHover: {
//       backgroundColor: '#334155'
//     },
//     counterButtonActive: {
//       backgroundColor: '#1e293b'
//     },
//     counterValue: {
//       width: '32px',
//       textAlign: 'center',
//       fontWeight: '500'
//     },
//     roomConfigContainer: {
//       backgroundColor: '#f3f4f6',
//       padding: '16px',
//       borderRadius: '8px'
//     },
//     roomConfigTitle: {
//       fontWeight: '600',
//       color: '#1f2937',
//       marginBottom: '12px'
//     },
//     guestRow: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       marginBottom: '12px'
//     },
//     guestRowLast: {
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between'
//     },
//     guestLabel: {
//       color: '#374151',
//       fontWeight: '500'
//     },
//     guestCounterContainer: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px'
//     },
//     saveButtonContainer: {
//       display: 'flex',
//       justifyContent: 'center',
//       flexDirection: 'column',
//       marginTop:' 16px',
//     },
//     saveButton: {
//       width: '100%',
//     },
//     saveButtonHover: {
//       backgroundColor: '#0f766e'
//     },
//     saveButtonActive: {
//       backgroundColor: '#134e4a'
//     },
//     summaryContainer: {
//       padding: '16px',
//       backgroundColor: '#dbeafe',
//       borderTop: '1px solid #e5e7eb'
//     },
//     summaryTitle: {
//       fontWeight: '500',
//       marginBottom: '8px'
//     },
//     summaryContent: {
//       fontSize: '14px',
//       color: '#6b7280',
//       display: 'flex',
//       flexDirection: 'row',
//       gap: '4px'
//     },
//     debugContainer: {
//       padding: '16px',
//       backgroundColor: '#f9fafb',
//       borderTop: '1px solid #e5e7eb'
//     },
//     debugTitle: {
//       fontWeight: '500',
//       marginBottom: '8px'
//     },
//     debugContent: {
//       fontSize: '14px',
//       color: '#6b7280'
//     },
//     limitText: {
//       fontSize: '12px',
//       color: '#6b7280',
//       textAlign: 'center',
//       marginTop: '4px'
//     },
//     occupancyInfo: {
//       fontSize: '12px',
//       color: '#6b7280',
//       textAlign: 'center',
//       marginTop: '8px'
//     }
//   };

//   // Updated room limits with correct maxPax values
//   const roomLimits = {
//     Single: {
//       name: "Single",
//       maxAdults: 1,
//       maxCWB: 1,
//       maxCNB: 1,
//       maxPax: 2,
//     },
//     Double: {
//       name: "Double",
//       maxAdults: 2,
//       maxCWB: 2,
//       maxCNB: 2,
//       maxPax: 3, // Fixed: was 4, now 3
//     },
//     Triple: {
//       name: "Triple",
//       maxAdults: 3,
//       maxCWB: 2,
//       maxCNB: 2,
//       maxPax: 4,
//     },
//     Quad: {
//       name: "Quad",
//       maxAdults: 4,
//       maxCWB: 3,
//       maxCNB: 3,
//       maxPax: 5,
//     },
//   };

//   // Maximum rooms allowed per category
//   const MAX_ROOMS_PER_CATEGORY = 10;

//   const [roomCounts, setRoomCounts] = useState({
//     Single: 0,
//     Double: 0,
//     Triple: 0,
//     Quad: 0
//   });

//   const [rooms, setRooms] = useState([]);

//   // Toast state management
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [toastType, setToastType] = useState('error');

//   // Initialize component with preData
//   useEffect(() => {
//     if (preData && Object.keys(preData).length > 0) {
//       // Set room counts from preData
//       if (preData.roomCounts) {
//         setRoomCounts(preData.roomCounts);
//       }

//       // Set room details from preData
//       if (preData.roomDetails && Array.isArray(preData.roomDetails)) {
//         const initialRooms = preData.roomDetails.map((roomDetail, index) => ({
//           id: Date.now() + index, // Generate unique IDs
//           type: roomDetail.type,
//           adults: roomDetail.adults || 0,
//           children: roomDetail.children || 0
//         }));
//         setRooms(initialRooms);
//       }
//     }
//   }, [preData]);

//   const showToastMessage = (message, type = 'error') => {
//     setToastMessage(message);
//     setToastType(type);
//     setShowToast(true);
    
//     // Auto hide toast after 3 seconds
//     setTimeout(() => {
//       setShowToast(false);
//     }, 3000);
//   };

//   const updateRoomCount = (roomType, increment) => {
//     setRoomCounts(prev => {
//       const currentCount = prev[roomType];
//       let newCount;
      
//       if (increment > 0) {
//         // When incrementing, check the limit
//         newCount = Math.min(currentCount + increment, MAX_ROOMS_PER_CATEGORY);
//       } else {
//         // When decrementing, ensure it doesn't go below 0
//         newCount = Math.max(0, currentCount + increment);
//       }
      
//       const oldCount = prev[roomType];
      
//       if (newCount > oldCount) {
//         // Add new room
//         const newRoom = {
//           id: Date.now() + Math.random(),
//           type: roomType,
//           adults: 0,
//           children: 0
//         };
//         setRooms(prevRooms => [...prevRooms, newRoom]);
//       } else if (newCount < oldCount) {
//         // Remove last room of this type
//         setRooms(prevRooms => {
//           const roomsOfType = prevRooms.filter(room => room.type === roomType);
//           const lastRoom = roomsOfType[roomsOfType.length - 1];
//           return prevRooms.filter(room => room.id !== lastRoom.id);
//         });
//       }
      
//       return { ...prev, [roomType]: newCount };
//     });
//   };

//   // Updated function with proper validation for maxPax
//   const updateRoomGuests = (roomId, guestType, increment) => {
//     setRooms(prevRooms => 
//       prevRooms.map(room => {
//         if (room.id === roomId) {
//           const limits = roomLimits[room.type];
//           const newValue = Math.max(0, room[guestType] + increment);
          
//           // Calculate current total occupancy
//           const currentAdults = guestType === 'adults' ? newValue : room.adults;
//           const currentChildren = guestType === 'children' ? newValue : room.children;
//           const totalOccupancy = currentAdults + currentChildren;
          
//           // Validate against individual limits and total occupancy
//           if (guestType === 'adults') {
//             // Check maxAdults and total maxPax
//             const validAdults = Math.min(newValue, limits.maxAdults);
//             const finalAdults = totalOccupancy > limits.maxPax ? 
//               Math.max(0, limits.maxPax - room.children) : validAdults;
            
//             return {
//               ...room,
//               adults: Math.max(0, finalAdults)
//             };
//           } else {
//             // Check maxCWB and total maxPax
//             const validChildren = Math.min(newValue, limits.maxCWB);
//             const finalChildren = totalOccupancy > limits.maxPax ? 
//               Math.max(0, limits.maxPax - room.adults) : validChildren;
            
//             return {
//               ...room,
//               children: Math.max(0, finalChildren)
//             };
//           }
//         }
//         return room;
//       })
//     );
//   };

//   const getTotalAssignedAdults = () => {
//     return rooms.reduce((total, room) => total + room.adults, 0);
//   };

//   const getTotalAssignedChildren = () => {
//     return rooms.reduce((total, room) => total + room.children, 0);
//   };

//   // Helper function to check if increment button should be disabled
//   const isIncrementDisabled = (roomType) => {
//     return roomCounts[roomType] >= MAX_ROOMS_PER_CATEGORY;
//   };

//   // Helper function to check if guest increment should be disabled
//   const isGuestIncrementDisabled = (room, guestType) => {
//     const limits = roomLimits[room.type];
//     const currentTotal = room.adults + room.children;
    
//     if (guestType === 'adults') {
//       return room.adults >= limits.maxAdults || currentTotal >= limits.maxPax;
//     } else {
//       return room.children >= limits.maxCWB || currentTotal >= limits.maxPax;
//     }
//   };

//   const handleSave = () => {
//     // Check if there are any rooms selected
//     if (rooms.length === 0) {
//       // showToastMessage('Please select at least one room before saving.', 'warning');
//        ToastMessage({ status: "warning", message: "Please select at least one room before saving." })
//       return;
//     }

//     // Check if any room has no guests assigned
//     const emptyRooms = rooms.filter(room => room.adults === 0 && room.children === 0);
    
//     if (emptyRooms.length > 0) {
//       const roomNames = emptyRooms.map(room => {
//         const roomIndex = rooms.filter(r => r.type === room.type).indexOf(room) + 1;
//         return `${room.type} Room ${roomIndex}`;
//       }).join(', ');
      
//       // showToastMessage(
//       //   `Please assign at least one guest to the following room(s): ${roomNames}`, 
//       //   'warning'
//       // );
//       ToastMessage({ status: "warning", message:`Please assign at least one guest to the following room(s): ${roomNames}`})
//       return;
//     }

//     // If validation passes, proceed with save
//     const allocationData = {
//       roomCounts: roomCounts,
//       totalRooms: rooms.length,
//       totalAdults: getTotalAssignedAdults(),
//       totalChildren: getTotalAssignedChildren(),
//       roomDetails: rooms.map(room => ({
//         type: room.type,
//         adults: room.adults,
//         children: room.children
//       }))
//     };
    
//     handleRoomAllocation(allocationData);
//     // showToastMessage('Room allocation saved successfully!', 'success');
    
//     // Small delay before closing to show success message
//     setTimeout(() => {
//       handleTogle();
//     }, 1000);
//   };

//   const CounterButton = ({ onPress, disabled, children }) => {
//     const [isHovered, setIsHovered] = useState(false);
//     const [isActive, setIsActive] = useState(false);

//     const buttonStyle = {
//       ...styles.counterButton,
//       ...(disabled ? styles.counterButtonDisabled : styles.counterButtonEnabled),
//       ...(isHovered && !disabled ? styles.counterButtonHover : {}),
//       ...(isActive && !disabled ? styles.counterButtonActive : {})
//     };

//     return (
//       <button
//         onClick={onPress}
//         disabled={disabled}
//         style={buttonStyle}
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//         onMouseDown={() => setIsActive(true)}
//         onMouseUp={() => setIsActive(false)}
//       >
//         {children}
//       </button>
//     );
//   };

//   return (
//     <div style={styles.container}>
//       {/* Toast Message */}
//       {showToast && (
//         <ToastMessage 
//           message={toastMessage}
//           type={toastType}
//           onClose={() => setShowToast(false)}
//         />
//       )}

//       {/* Fixed Room Details Section */}
//       <div style={styles.sectionContainer}>
//         <p style={styles.sectionSubtitle}>Select Room(s) to Select Adult/Children Count</p>
        
//         {/* Room Type Selector */}
//         <div style={styles.roomGrid}>
//           {Object.keys(roomLimits).map(roomType => (
//             <div key={roomType} style={styles.roomTypeContainer}>
//               <div style={styles.roomTypeLabel}>{roomType}</div>
//               <div style={styles.counterContainer}>
//                 <CounterButton
//                   onPress={() => updateRoomCount(roomType, -1)}
//                   disabled={roomCounts[roomType] === 0}
//                 >
//                   <RemoveIcon style={{ fontSize: '16px' }} />
//                 </CounterButton>
//                 <span style={styles.counterValue}>{roomCounts[roomType]}</span>
//                 <CounterButton
//                   onPress={() => updateRoomCount(roomType, 1)}
//                   disabled={isIncrementDisabled(roomType)}
//                 >
//                   <AddIcon style={{ fontSize: '16px' }} />
//                 </CounterButton>
//               </div>
//               {/* Show occupancy limits */}
//               <div style={styles.limitText}>
//                 {/* Max {roomLimits[roomType].maxPax} guests */}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Scrollable Content for Individual Room Configurations */}
//       <div style={styles.scrollableContent}>
//         {/* Individual Room Configurations */}
//         {rooms.map((room, index) => {
//           const limits = roomLimits[room.type];
//           const currentTotal = room.adults + room.children;
          
//           return (
//             <div key={room.id} style={styles.roomConfigContainer}>
//               <h3 style={styles.roomConfigTitle}>
//                 {room.type} Room {rooms.filter(r => r.type === room.type).indexOf(room) + 1}
//               </h3>
              
//               {/* Show current occupancy */}
//               <div style={styles.occupancyInfo}>
//                 {/* Occupancy: {currentTotal}/{limits.maxPax} guests  */}
//                 {/* (Max Adults: {limits.maxAdults}, Max Children: {limits.maxCWB}) */}
//               </div>
              
//               {/* Adult Count */}
//               <div style={styles.guestRow}>
//                 <span style={styles.guestLabel}>Adult Count</span>
//                 <div style={styles.guestCounterContainer}>
//                   <CounterButton
//                     onPress={() => updateRoomGuests(room.id, 'adults', -1)}
//                     disabled={room.adults <= 0}
//                   >
//                     <RemoveIcon style={{ fontSize: '16px' }} />
//                   </CounterButton>
//                   <span style={styles.counterValue}>{room.adults}</span>
//                   <CounterButton
//                     onPress={() => updateRoomGuests(room.id, 'adults', 1)}
//                     disabled={isGuestIncrementDisabled(room, 'adults')}
//                   >
//                     <AddIcon style={{ fontSize: '16px' }} />
//                   </CounterButton>
//                 </div>
//               </div>

//               {/* Child Count */}
//               <div style={styles.guestRowLast}>
//                 <span style={styles.guestLabel}>Child Count</span>
//                 <div style={styles.guestCounterContainer}>
//                   <CounterButton
//                     onPress={() => updateRoomGuests(room.id, 'children', -1)}
//                     disabled={room.children <= 0}
//                   >
//                     <RemoveIcon style={{ fontSize: '16px' }} />
//                   </CounterButton>
//                   <span style={styles.counterValue}>{room.children}</span>
//                   <CounterButton
//                     onPress={() => updateRoomGuests(room.id, 'children', 1)}
//                     disabled={isGuestIncrementDisabled(room, 'children')}
//                   >
//                     <AddIcon style={{ fontSize: '16px' }} />
//                   </CounterButton>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Fixed Save Button at Bottom */}
//       <div style={{ ...styles.saveButtonContainer, position: 'sticky', bottom: 0 }}>
//         <button
//           onClick={handleSave}
//           style={{width:'100%',backgroundColor:'#ed4242',padding:'12px',color:'white', fontSize:'16px', border: 'none', fontWeight:'500'}}
//         >
//           SAVE ROOM ALLOCATION
//         </button>
//         <div style={{textAlign: 'center', marginTop: '10px'}}>
//           {rooms.length > 0 && (
//             <>
//               <span style={{padding:"5px"}}>Total Rooms: {rooms.length}</span>
//               <span style={{padding:"5px"}}>Total Adults: {getTotalAssignedAdults()}</span>
//               <span style={{padding:"5px"}}>Total Children: {getTotalAssignedChildren()}</span>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomAllocation;



