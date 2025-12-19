import React from "react";
import GetCards from "./getCards";
 
function Daywise({
  cartData,
  cartDates,
  checkedCarts = [],
  showUtilities = false,
  setNoticeShown,
  setShowUtilities,
}) {
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
      ) : (
        cartDates.map((value, key) => {
          const filteredData = cartData.filter(
            (item) =>
              item.order_preffered_date === value.order_preffered_date &&
              // FIXED: Always filter by checkedCarts when carts are selected
              (checkedCarts.length > 0 ? checkedCarts.includes(item.cart_id) : true)
          );
          if (filteredData.length === 0) return null;
          return (
            <div
              className="mb-5 daywise-mainContainer"
              key={key}
              style={{
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgb(195, 195, 195)",
              }}
            >
              <tr className="col-12 d-flex flex-column align-items-start gap-2 mt-3 mb-3">
                <h6
                  className="cart-wise-date"
                  style={{
                    fontWeight: "500",
                    backgroundColor: "var(--theme-deafult)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgb(167, 167, 167)",
                  }}
                >
                  {value.order_preffered_date}
                </h6>
              </tr>
              {filteredData.map((item, index) => (
                <GetCards
                  categorizeData={item}
                  index={index}
                  key={item.cart_id}
                />
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
 
export default Daywise;