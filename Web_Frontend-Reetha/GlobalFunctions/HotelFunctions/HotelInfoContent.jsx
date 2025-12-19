// import React, { useState } from 'react';

// const HotelInfoContent = ({moreInfo}) => {
//   console.log('moreInfo', moreInfo);
//   const [activeTab, setActiveTab] = useState('children');

//   // console.log('moreInfo', moreInfo);
  
//   const hotelData = moreInfo

//   // Format text functions
//   const formatCamelCase = (text) => {
//     return text.replace(/_/g, ' ')
//       .replace(/([a-z])([A-Z])/g, '$1 $2')
//       .replace(/\b\w/g, l => l.toUpperCase());
//   };

//   const formatInclusion = (inclusion) => {
//     return inclusion === "included" ? 
//       <span style={{ color: 'green' }}>Included</span> : 
//       <span style={{ color: 'red' }}>Not Included</span>;
//   };

//   // Tabs data
//   const tabs = [
//     { id: 'children', label: 'Children' },
//     { id: 'children_meal', label: 'Children Meals' },
//     { id: 'cot', label: 'Cot' },
//     { id: 'deposit', label: 'Deposit' },
//     { id: 'extra_bed', label: 'Extra Bed' },
//     { id: 'internet', label: 'Internet' },
//     { id: 'meal', label: 'Meals' },
//     { id: 'no_show', label: 'No Show Policy' },
//     { id: 'parking', label: 'Parking' },
//     { id: 'pets', label: 'Pets' },
//     { id: 'shuttle', label: 'Shuttle' },
//     { id: 'visa', label: 'Visa' }
//   ];

//   // Updated Warning Banner that strips HTML tags
//   const WarningBanner = () => {
//     // Function to strip HTML tags and return plain text
//     const stripHtmlTags = (html) => {
//       if (!html) return '';
      
//       // Create a temporary DOM element
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = html;
      
//       // Return the text content only
//       return tempDiv.textContent || tempDiv.innerText || '';
//     };
    
//     // Get warning text and strip any HTML tags
//     const warningText = stripHtmlTags(hotelData.metapolicy_extra_info);
    
//     return (
//       <div style={{
//         backgroundColor: '#ffebee', 
//         color: '#c62828', 
//         padding: '10px', 
//         borderRadius: '4px', 
//         marginBottom: '20px',
//         fontSize: '14px',
//         fontWeight: 'bold',
//         border: '1px solid #ef9a9a'
//       }}>
//         {warningText}
//       </div>
//     );
//   };

//   // Render tab content based on active tab
//   const renderTabContent = () => {
//     const content = hotelData.metapolicy_struct[activeTab];
    
//     if (!content || (Array.isArray(content) && content.length === 0)) {
//       return <p style={{ fontStyle: 'italic', color: '#666' }}>No information available</p>;
//     }
    
//     if (activeTab === 'children') {
//       return (
//         <div>
//           {content.map((item, index) => (
//             <div key={index} style={{
//               border: '1px solid #e0e0e0',
//               borderRadius: '4px',
//               padding: '12px',
//               marginBottom: '10px',
//               backgroundColor: '#fafafa'
//             }}>
//               <div style={{ marginBottom: '5px' }}><strong>Age Range:</strong> {item.age_start} - {item.age_end} years</div>
//               <div style={{ marginBottom: '5px' }}>
//                 <strong>Price:</strong> {item.price ? `${item.price} ${item.currency}` : 'Free'}
//               </div>
//               <div><strong>Extra Bed:</strong> {item.extra_bed === 'available' ? 'Available' : 'Not Available'}</div>
//             </div>
//           ))}
//         </div>
//       );
//     }
    
//     if (activeTab === 'children_meal') {
//       return (
//         <div>
//           {content.map((item, index) => (
//             <div key={index} style={{
//               border: '1px solid #e0e0e0',
//               borderRadius: '4px',
//               padding: '12px',
//               marginBottom: '10px',
//               backgroundColor: '#fafafa'
//             }}>
//               <div style={{ marginBottom: '5px' }}><strong>Age Range:</strong> {item.age_start} - {item.age_end} years</div>
//               <div style={{ marginBottom: '5px' }}><strong>Meal Type:</strong> {formatCamelCase(item.meal_type)}</div>
//               <div style={{ marginBottom: '5px' }}><strong>Inclusion:</strong> {formatInclusion(item.inclusion)}</div>
//               <div><strong>Price:</strong> {item.price} {item.currency}</div>
//             </div>
//           ))}
//         </div>
//       );
//     }
    
//     if (activeTab === 'no_show') {
//       return (
//         <div style={{
//           border: '1px solid #e0e0e0',
//           borderRadius: '4px',
//           padding: '12px',
//           backgroundColor: '#fafafa'
//         }}>
//           <div style={{ marginBottom: '5px' }}><strong>Availability:</strong> {content.availability === 'available' ? 'Available' : 'Not Available'}</div>
//           <div style={{ marginBottom: '5px' }}><strong>Time:</strong> {content.time}</div>
//           <div><strong>Day Period:</strong> {formatCamelCase(content.day_period)}</div>
//         </div>
//       );
//     }
    
//     if (activeTab === 'visa') {
//       return (
//         <div style={{
//           border: '1px solid #e0e0e0',
//           borderRadius: '4px',
//           padding: '12px',
//           backgroundColor: '#fafafa'
//         }}>
//           <div><strong>Visa Support:</strong> {content.visa_support === 'support_enable' ? 'Available' : content.visa_support}</div>
//         </div>
//       );
//     }
    
//     // Default for array items (deposit, internet, meal, parking, pets, shuttle)
//     return (
//       <div>
//         {Array.isArray(content) && content.map((item, index) => (
//           <div key={index} style={{
//             border: '1px solid #e0e0e0',
//             borderRadius: '4px',
//             padding: '12px',
//             marginBottom: '10px',
//             backgroundColor: '#fafafa'
//           }}>
//             {Object.entries(item).map(([key, value]) => (
//               <div key={key} style={{ marginBottom: '5px' }}>
//                 <strong>{formatCamelCase(key)}:</strong> {
//                   key === 'inclusion' ? formatInclusion(value) : 
//                   typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
//                   value === '' ? '-' : value
//                 }
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div>
//       <WarningBanner />
      
//       {/* Tabs */}
//       <div style={{
//         display: 'flex',
//         flexWrap: 'wrap',
//         gap: '5px',
//         marginBottom: '20px',
//         borderBottom: '1px solid #e0e0e0',
//         paddingBottom: '10px'
//       }}>
//         {tabs.map(tab => (
//           <button 
//             key={tab.id}
//             onClick={() => setActiveTab(tab.id)}
//             style={{
//               padding: '8px 12px',
//               borderRadius: '4px',
//               border: 'none',
//               backgroundColor: activeTab === tab.id ? '#1976d2' : '#e0e0e0',
//               color: activeTab === tab.id ? 'white' : '#333',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: activeTab === tab.id ? 'bold' : 'normal'
//             }}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>
      
//       {/* Content */}
//       <div>
//         <h3 style={{ 
//           marginTop: '0', 
//           marginBottom: '15px', 
//           fontSize: '18px',
//           color: '#333',
//           borderBottom: '2px solid #e0e0e0',
//           paddingBottom: '8px'
//         }}>
//           {formatCamelCase(activeTab)}
//         </h3>
//         {renderTabContent()}
//       </div>
//     </div>
//   );
// };

// export default HotelInfoContent;


import React, { useState } from 'react';

const HotelInfoContent = ({moreInfo}) => {
  console.log('moreInfo', moreInfo);
  const [activeTab, setActiveTab] = useState('children');

  // console.log('moreInfo', moreInfo);
  
  const hotelData = moreInfo

  // Early return if no data is available
  if (!hotelData || Object.keys(hotelData).length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{
          fontSize: '48px',
          color: '#bdbdbd',
          marginBottom: '16px'
        }}>
          ℹ️
        </div>
        <h3 style={{
          color: '#666',
          fontSize: '18px',
          marginBottom: '8px',
          fontWeight: 'normal'
        }}>
          No Hotel Information Available
        </h3>
        <p style={{
          color: '#888',
          fontSize: '14px',
          margin: '0'
        }}>
          Hotel policy and additional information is currently unavailable.
        </p>
      </div>
    );
  }

  // Format text functions
  const formatCamelCase = (text) => {
    return text.replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatInclusion = (inclusion) => {
    return inclusion === "included" ? 
      <span style={{ color: 'green' }}>Included</span> : 
      <span style={{ color: 'red' }}>Not Included</span>;
  };

  // Tabs data
  const tabs = [
    { id: 'children', label: 'Children' },
    { id: 'children_meal', label: 'Children Meals' },
    { id: 'cot', label: 'Cot' },
    { id: 'deposit', label: 'Deposit' },
    { id: 'extra_bed', label: 'Extra Bed' },
    { id: 'internet', label: 'Internet' },
    { id: 'meal', label: 'Meals' },
    { id: 'no_show', label: 'No Show Policy' },
    { id: 'parking', label: 'Parking' },
    { id: 'pets', label: 'Pets' },
    { id: 'shuttle', label: 'Shuttle' },
    { id: 'visa', label: 'Visa' }
  ];

  // Updated Warning Banner that strips HTML tags
  const WarningBanner = () => {
    // Function to strip HTML tags and return plain text
    const stripHtmlTags = (html) => {
      if (!html) return '';
      
      // Create a temporary DOM element
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // Return the text content only
      return tempDiv.textContent || tempDiv.innerText || '';
    };
    
    // Get warning text and strip any HTML tags
    const warningText = stripHtmlTags(hotelData.metapolicy_extra_info);
    
    // Only render banner if there's warning text
    if (!warningText) return null;
    
    return (
      <div style={{
        backgroundColor: '#ffebee', 
        color: '#c62828', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        border: '1px solid #ef9a9a'
      }}>
        {warningText}
      </div>
    );
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    // Check if metapolicy_struct exists
    if (!hotelData.metapolicy_struct) {
      return <p style={{ fontStyle: 'italic', color: '#666' }}>No policy information available</p>;
    }

    const content = hotelData.metapolicy_struct[activeTab];
    
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return <p style={{ fontStyle: 'italic', color: '#666' }}>No information available</p>;
    }
    
    if (activeTab === 'children') {
      return (
        <div>
          {content.map((item, index) => (
            <div key={index} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ marginBottom: '5px' }}><strong>Age Range:</strong> {item.age_start} - {item.age_end} years</div>
              <div style={{ marginBottom: '5px' }}>
                <strong>Price:</strong> {item.price ? `${item.price} ${item.currency}` : 'Free'}
              </div>
              <div><strong>Extra Bed:</strong> {item.extra_bed === 'available' ? 'Available' : 'Not Available'}</div>
            </div>
          ))}
        </div>
      );
    }
    
    if (activeTab === 'children_meal') {
      return (
        <div>
          {content.map((item, index) => (
            <div key={index} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '10px',
              backgroundColor: '#fafafa'
            }}>
              <div style={{ marginBottom: '5px' }}><strong>Age Range:</strong> {item.age_start} - {item.age_end} years</div>
              <div style={{ marginBottom: '5px' }}><strong>Meal Type:</strong> {formatCamelCase(item.meal_type)}</div>
              <div style={{ marginBottom: '5px' }}><strong>Inclusion:</strong> {formatInclusion(item.inclusion)}</div>
              <div><strong>Price:</strong> {item.price} {item.currency}</div>
            </div>
          ))}
        </div>
      );
    }
    
    if (activeTab === 'no_show') {
      return (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#fafafa'
        }}>
          <div style={{ marginBottom: '5px' }}><strong>Availability:</strong> {content.availability === 'available' ? 'Available' : 'Not Available'}</div>
          <div style={{ marginBottom: '5px' }}><strong>Time:</strong> {content.time}</div>
          <div><strong>Day Period:</strong> {formatCamelCase(content.day_period)}</div>
        </div>
      );
    }
    
    if (activeTab === 'visa') {
      return (
        <div style={{
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          padding: '12px',
          backgroundColor: '#fafafa'
        }}>
          <div><strong>Visa Support:</strong> {content.visa_support === 'support_enable' ? 'Available' : content.visa_support}</div>
        </div>
      );
    }
    
    // Default for array items (deposit, internet, meal, parking, pets, shuttle)
    return (
      <div>
        {Array.isArray(content) && content.map((item, index) => (
          <div key={index} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            padding: '12px',
            marginBottom: '10px',
            backgroundColor: '#fafafa'
          }}>
            {Object.entries(item).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '5px' }}>
                <strong>{formatCamelCase(key)}:</strong> {
                  key === 'inclusion' ? formatInclusion(value) : 
                  typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                  value === '' ? '-' : value
                }
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <WarningBanner />
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        marginBottom: '20px',
        borderBottom: '1px solid #e0e0e0',
        paddingBottom: '10px'
      }}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#1976d2' : '#e0e0e0',
              color: activeTab === tab.id ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div>
        <h3 style={{ 
          marginTop: '0', 
          marginBottom: '15px', 
          fontSize: '18px',
          color: '#333',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '8px'
        }}>
          {formatCamelCase(activeTab)}
        </h3>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default HotelInfoContent;