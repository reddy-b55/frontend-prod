import React, { useState } from 'react';

const HotelInfoContent = ({moreInfo}) => {
  const [activeTab, setActiveTab] = useState('children');

  // console.log('moreInfo', moreInfo);
  
  const hotelData = moreInfo

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


// import React, { useState } from 'react';

// const HotelInfoContent = ({moreInfo}) => {
//   const [activeTab, setActiveTab] = useState('children');

//   console.log('moreInfo', moreInfo);
  
//   const hotelData = moreInfo

//   //   "metapolicy_extra_info": "The given hotel is a fiction and should not be booked. If you book this hotel the further accommodation shall not be provided.",
//   //   "metapolicy_struct": {
//   //     "add_fee": [],
//   //     "check_in_check_out": [],
//   //     "children": [
//   //       {
//   //         "age_end": 3,
//   //         "age_start": 0,
//   //         "currency": "CHF",
//   //         "extra_bed": "available",
//   //         "price": "500"
//   //       },
//   //       {
//   //         "age_end": 9,
//   //         "age_start": 4,
//   //         "currency": "ALL",
//   //         "extra_bed": "available",
//   //         "price": "700"
//   //       },
//   //       {
//   //         "age_end": 12,
//   //         "age_start": 10,
//   //         "currency": "",
//   //         "extra_bed": "available",
//   //         "price": "0"
//   //       }
//   //     ],
//   //     "children_meal": [
//   //       {
//   //         "age_end": 5,
//   //         "age_start": 0,
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "meal_type": "breakfast",
//   //         "price": "200"
//   //       },
//   //       {
//   //         "age_end": 12,
//   //         "age_start": 6,
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "meal_type": "breakfast",
//   //         "price": "400"
//   //       }
//   //     ],
//   //     "cot": [
//   //       {
//   //         "amount": 1,
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "price": "0",
//   //         "price_unit": "per_room_per_night"
//   //       }
//   //     ],
//   //     "deposit": [
//   //       {
//   //         "availability": "available",
//   //         "currency": "HNL",
//   //         "deposit_type": "unspecified",
//   //         "payment_type": "cash",
//   //         "price": "123",
//   //         "price_unit": "per_room_per_stay",
//   //         "pricing_method": "fixed"
//   //       },
//   //       {
//   //         "availability": "available",
//   //         "currency": "",
//   //         "deposit_type": "breakage",
//   //         "payment_type": "unspecified",
//   //         "price": "20",
//   //         "price_unit": "per_guest_per_stay",
//   //         "pricing_method": "percent"
//   //       },
//   //       {
//   //         "availability": "available",
//   //         "currency": "BAM",
//   //         "deposit_type": "keys",
//   //         "payment_type": "unspecified",
//   //         "price": "10",
//   //         "price_unit": "per_room_per_stay",
//   //         "pricing_method": "fixed"
//   //       },
//   //       {
//   //         "availability": "available",
//   //         "currency": "TWD",
//   //         "deposit_type": "pet",
//   //         "payment_type": "unspecified",
//   //         "price": "5",
//   //         "price_unit": "per_room_per_night",
//   //         "pricing_method": "fixed"
//   //       }
//   //     ],
//   //     "extra_bed": [
//   //       {
//   //         "amount": 1,
//   //         "currency": "ALL",
//   //         "inclusion": "not_included",
//   //         "price": "100",
//   //         "price_unit": "per_guest_per_night"
//   //       }
//   //     ],
//   //     "internet": [
//   //       {
//   //         "currency": "",
//   //         "inclusion": "included",
//   //         "internet_type": "unspecified",
//   //         "price": "0",
//   //         "price_unit": "unspecified",
//   //         "work_area": "hotel"
//   //       },
//   //       {
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "internet_type": "unspecified",
//   //         "price": "1",
//   //         "price_unit": "per_hour",
//   //         "work_area": "room"
//   //       }
//   //     ],
//   //     "meal": [
//   //       {
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "meal_type": "breakfast",
//   //         "price": "300"
//   //       },
//   //       {
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "meal_type": "lunch",
//   //         "price": "500"
//   //       }
//   //     ],
//   //     "no_show": {
//   //       "availability": "available",
//   //       "day_period": "after_midday",
//   //       "time": "09:00:00"
//   //     },
//   //     "parking": [
//   //       {
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "price": "100",
//   //         "price_unit": "per_car_per_night",
//   //         "territory_type": "unspecified"
//   //       }
//   //     ],
//   //     "pets": [
//   //       {
//   //         "currency": "USD",
//   //         "inclusion": "not_included",
//   //         "pets_type": "unspecified",
//   //         "price": "560",
//   //         "price_unit": "per_room_per_stay"
//   //       }
//   //     ],
//   //     "shuttle": [
//   //       {
//   //         "currency": "EUR",
//   //         "destination_type": "train",
//   //         "inclusion": "not_included",
//   //         "price": "100",
//   //         "shuttle_type": "one_way"
//   //       },
//   //       {
//   //         "currency": "EUR",
//   //         "destination_type": "airport",
//   //         "inclusion": "not_included",
//   //         "price": "200",
//   //         "shuttle_type": "one_way"
//   //       },
//   //       {
//   //         "currency": "",
//   //         "destination_type": "airport_train",
//   //         "inclusion": "included",
//   //         "price": "0",
//   //         "shuttle_type": "unspecified"
//   //       }
//   //     ],
//   //     "visa": {
//   //       "visa_support": "support_enable"
//   //     }
//   //   }
//   // };

//   // Format text functions
//   const formatCamelCase = (text) => {
//     console.log('text', text);
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

//   // Warning banner
//   const WarningBanner = () => (
//     <div style={{
//       backgroundColor: '#ffebee', 
//       color: '#c62828', 
//       padding: '10px', 
//       borderRadius: '4px', 
//       marginBottom: '20px',
//       fontSize: '14px',
//       fontWeight: 'bold',
//       border: '1px solid #ef9a9a'
//     }}>
//       {formatCamelCase(hotelData.metapolicy_extra_info)}
//     </div>
//   );

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

// // This is how you would use this component inside the ModalBase
// const ModalExample = () => {
//   const [modelInfoShow, setModelInfoShow] = useState(false);
  
//   return (
//     <div>
//       <button onClick={() => setModelInfoShow(true)}>Show Hotel Info</button>
      
//       {/* This is your ModalBase component */}
//       {modelInfoShow && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           zIndex: 1000
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             borderRadius: '8px',
//             width: '90%',
//             maxWidth: '800px',
//             maxHeight: '90vh',
//             overflow: 'auto',
//             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
//           }}>
//             <div style={{
//               padding: '15px 20px',
//               borderBottom: '1px solid #e0e0e0',
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center'
//             }}>
//               <h2 style={{ margin: 0, fontSize: '20px' }}>More Information</h2>
//               <button 
//                 onClick={() => setModelInfoShow(false)}
//                 style={{
//                   border: 'none',
//                   background: 'none',
//                   fontSize: '24px',
//                   cursor: 'pointer',
//                   color: '#777'
//                 }}
//               >
//                 ×
//               </button>
//             </div>
//             <div style={{ padding: '20px' }}>
//               <HotelInfoContent />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Export the component that you want to be used inside your ModalBase
// export default HotelInfoContent;