// import React from 'react';
// import GetCards from './getCards';

// const CartWise = ({ customerMultiCarts, cartData, checkedCarts = [], showUtilities = false, setNoticeShown ,setShowUtilities}) => {
//     return (
//         <div className='mt-3'>
//             {
//                 showUtilities && checkedCarts.length === 0 ?
//                     <div className='d-flex align-items-center flex-column my-4 py-3'>
//                         <h6 className='m-0 p-0'>Opps!</h6>
//                         <p className='m-0 p-0'>Select cards for downloading summary / itenary</p>
//                         <div className='d-flex align-items-center gap-3'>
//                             <button onClick={() => setNoticeShown("show")} className='btn btn-solid rounded-2 mt-2' style={{ fontSize: 8, padding: '1px 10px' }}>Know more</button>
//                             <button onClick={() => setShowUtilities(false)} className='btn btn-solid rounded-2 mt-2' style={{ fontSize: 8, padding: '1px 10px' }}>Clear all</button>
//                         </div>
//                     </div> :
//                     customerMultiCarts?.map((multiCarts) => (
//                         (showUtilities ? checkedCarts.includes(multiCarts.cart_id) : true) &&
//                         <div className='mb-5 daywise-mainContainer'>
//                             <tr className='col-12 d-flex flex-column align-items-start gap-2 mt-3 mb-3'>
//                                 <h6 className='cart-wise-date' style={{ fontWeight: "500" }}>{multiCarts?.cart_title}</h6>
//                             </tr>
//                             {
//                                 cartData.filter(filteredCart => filteredCart.cart_id == multiCarts.cart_id).map((categorizeData, index) => (
//                                     <GetCards categorizeData={categorizeData} index={index} />
//                                 ))
//                             }
//                         </div>
//                     ))
//             }
//         </div>
//     )
// }

// export default CartWise

import React from "react";
import GetCards from "./getCards";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

const CartWise = ({
  customerMultiCarts,
  cartData,
  checkedCarts = [],
  showUtilities = false,
  setNoticeShown,
  setShowUtilities,
}) => {
  const bg_colors = [
    "#ffebee",
    "#e3f2fd",
    "#fff8e1",
    "#f3e5f5",
    "#e8f5e9",
    "#fff3e0",
    "#f5f5f5",
    "#e0f7fa",
  ];
  const darker_colors = [
    "#ed4242",
    "#476e7c",
    "#e6b800",
    "#9c27b0",
    "#2e7d32",
    "#f57c00",
    "#757575",
    "#00acc1",
  ];

  // Filter carts based on selection - ALWAYS respect checkedCarts
  const getFilteredCarts = () => {
    // If there are checked carts, ONLY show those carts
    if (checkedCarts.length > 0) {
      return customerMultiCarts.filter(cart => 
        checkedCarts.includes(cart.cart_id)
      );
    }
    
    // If no carts are checked AND showUtilities is true, show empty
    if (showUtilities && checkedCarts.length === 0) {
      return [];
    }
    
    // Default: show all carts (when no selection and showUtilities is false)
    return customerMultiCarts;
  };

  const filteredCarts = getFilteredCarts();

  return (
    <div className="mt-3">
      {showUtilities && checkedCarts.length === 0 ? (
        <div className="d-flex align-items-center flex-column my-4 py-3">
          <p className="m-0 p-0">
            Select cart for downloading summary / itinerary
          </p>
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => setNoticeShown("show")}
              className="btn btn-solid rounded-2 mt-2"
              style={{ fontSize: 8, padding: "1px 10px" }}
            >
              Know more
            </button>
            <button
              onClick={() => setShowUtilities(false)}
              className="btn btn-solid rounded-2 mt-2"
              style={{ fontSize: 8, padding: "1px 10px" }}
            >
              Clear all
            </button>
          </div>
        </div>
      ) : filteredCarts.length === 0 ? (
        // Show message when no carts match the filter
        <div className="d-flex align-items-center flex-column my-4 py-3">
          <p className="m-0 p-0">
            No carts available to display
          </p>
        </div>
      ) : (
        filteredCarts.map((multiCarts, key) => (
          <div
            className="mb-5 daywise-mainContainer"
            key={multiCarts.cart_id}
            style={{
              background:
                "linear-gradient(90deg, " +
                bg_colors[key % 8] +
                " 0%, rgb(245, 245, 245) 100%)",
              boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.2)",
            }}
          >
            <tr className="col-12 d-flex flex-column align-items-start gap-2 mt-3 mb-3">
              <h6
                className="cart-wise-date"
                style={{
                  fontWeight: "500",
                  backgroundColor: darker_colors[key % 8],
                  borderRadius: "10px",
                  fontSize: 14,
                  color: "white",
                  padding: "8px 16px",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                <ShoppingCartOutlinedIcon style={{ marginRight: "8px", fontSize: "18px" }} />
                {multiCarts?.cart_title}
              </h6>
            </tr>
            {cartData
              .filter((filteredCart) => filteredCart.cart_id === multiCarts.cart_id)
              .map((categorizeData, index) => (
                <GetCards 
                  key={`${categorizeData.cart_id}-${index}`}
                  categorizeData={categorizeData} 
                  index={index} 
                />
              ))}
          </div>
        ))
      )}
    </div>
  );
};

export default CartWise;