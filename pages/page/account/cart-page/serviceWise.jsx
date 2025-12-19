import React from "react";
import GetCards from "./getCards";
import Image from "next/image";
 
function ServiceWise({
  cartData,
  checkedCarts = [],
  showUtilities = false,
  setNoticeShown,
  setShowUtilities,
}) {
  const services = [
    "Lifestyle",
    "Hotels",
    "Education",
    "Essential",
    "Non Essential",
  ];
  const icons = [
    "/assets/images/Icons/lifestyle.png",
    "/assets/images/Icons/hotel.png",
    "/assets/images/Icons/education.png",
    "/assets/images/Icons/ess.png",
    "/assets/images/Icons/noness.png",
  ];
  const bgColor = [
    "#f5e8ff", // A touch more vibrant lavender
    "#d8ffd8", // A bit more saturated and brighter green
    // "#d0e8ff", // Slightly brighter and more vibrant blue
    "#ffe0f0", // A touch more vibrant pink
    "#f0ffd8", // Brighter and more vibrant yellow
    "#fff0d8", // Warmer and brighter beige
  ];
  const iconColors = ["#73518B", "#20762A", "#8E0F54", "#78813E", "#8E690F"];
  return (
    <div className="mt-3">
      {showUtilities && checkedCarts.length === 0 ? (
        <div className="d-flex align-items-center flex-column my-4 py-3">
          {/* <h6 className="m-0 p-0">Oops!</h6> */}
          <p className="m-0 p-0">
            Select carts for downloading summary / itinerary
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
        services.map((value, key) => {
          const filteredData = cartData.filter((item) => {
            return (
              item.maincat_type === value &&
               (checkedCarts.length > 0 ? checkedCarts.includes(item.cart_id) : true)
            );
          });
          if (filteredData.length === 0) return null;
          return (
            <div
              className="mb-5 daywise-mainContainer"
              key={key}
              style={{
                background:
                  "linear-gradient(90deg, " +
                  bgColor[key] +
                  " 0%, rgb(245, 245, 245) 100%)",
                boxShadow: "0px 0px 10px 1px rgba(0,0,0,0.2)",
              }}
            >
              <tr className="col-12 d-flex flex-column align-items-start gap-2 mt-3 mb-3">
                <h6
                  className="cart-wise-date"
                  style={{
                    fontSize: 18,
                    fontFamily: "Poppins",
                    backgroundColor: bgColor[key],
                    color: iconColors[key],
                    border: "1px solid #e0e0e0", // Add a subtle border
                    borderRadius: "8px", // Rounded corners for a softer look
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Floating effect
                    padding: "5px 15px", // Add some padding for better spacing
                    display: "inline-flex", // Align icon and text properly
                    alignItems: "center", // Center items vertically
                    transition: "box-shadow 0.3s ease", // Smooth hover effect
                  }}
                >
                  <Image
                    src={icons[key]}
                    alt="Non-Essential icon"
                    width={25}
                    height={25}
                    style={{ marginBottom: "5px", marginRight: "10px" }}
                  />
                  {value}
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
 
export default ServiceWise;