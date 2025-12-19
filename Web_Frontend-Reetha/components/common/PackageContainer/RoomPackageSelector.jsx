import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";
import { AppContext } from "../../../pages/_app";

const RoomPackageSelector = ({
  currency,
  onRoomSelect,
  dataSet,
  discountValue,
  discountClaimed,
  providers,
}) => {
  const [roomData, setRoomData] = useState([]);
  const [isSelectRoom, setIsSelectRoom] = useState(false);
  const provider = dataSet[0]?.Provider;
    const { userStatus, baseCurrencyValue, baseLocation, baseUserId } = useContext(AppContext);
  // console.log("datasett discout", discountValue);
  // console.log("datasett rate", dataSet);
  useEffect(() => {
    console.log("dataSet chamod 12333", dataSet);
    setRoomData(dataSet);
  }, [dataSet]);

  const handleSelectRoom = (roomData) => {
    setIsSelectRoom(true);
    onRoomSelect(roomData);
    setIsSelectRoom(false);
  };

  const packageRate = {
    fontSize: "20px",
    color: "#222222",
    fontWeight: "700",
    marginBottom: "0px",
  };

  // console.log("roomData", roomData);

  const getDiscountByRate = (dataVar) => {

      const discountVal = discountValue.filter((data) => {
        return data?.origin_rate_id == dataVar;
      });

      return discountVal?.[0];
  };

  return (
    <Container className="mt-4 lifestyle-packages">
      <Row>
        {roomData.map((room, index) => (
          <Col md="12" key={index} className="mb-4">
            <Card style={{ backgroundColor: "white", borderRadius: 0 }}>
              {provider === "hotelTbo" || provider === "hotelTboH" ? (
                <CardBody>
                  <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
                    {room?.RoomTypeName}
                  </h5>
                  <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
                    Inclusions : {room?.Inclusions[0]}
                  </h5>
                  <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
                    {room?.CancellationPolicy?.FromDate}
                  </h6>
                  {
                    room?.Price?.AahaasFare ===  room.Price.PublishedPrice ? (
                       <h4 style={packageRate}>
                    {
                    CurrencyConverter(
                      room.Price.CurrencyCode,
                      room.Price.PublishedPrice,
                      currency
                    )}
                  </h4>
                    ):(
                          <><h4 style={{packageRate}}>
                          {CurrencyConverter(
                            room.Price.CurrencyCode,
                            room.Price.AahaasFare,
                            currency
                          )}
                        </h4><h4 style={{packageRate, textDecoration: "line-through"}}>
                            {CurrencyConverter(
                              room.Price.CurrencyCode,
                              room.Price.PublishedPrice,
                              currency
                            )}
                          </h4></>


                    )
                  }
                 

                  <span className="text-muted" style={{ fontSize: "10px" }}>
                    Published Price
                  </span>
                  <Col className="d-flex flex-column align-items-end">
                    <Button
                      className="btn btn-sm btn-solid"
                      onClick={() => handleSelectRoom(room)}
                    >
                      Select Room
                    </Button>
                  </Col>
                </CardBody>
              ) : provider === "ratehawk"? (
                <CardBody>
  <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
    {room?.RoomTypeName}
  </h5>
  <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
    Inclusions: {room?.Inclusions?.join(", ")}
  </h5>
  <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
    {room?.CancellationPolicy?.FromDate}
  </h6>
  
  {/* Room Attributes Section */}
  <div style={{
    backgroundColor: "#dff1fd",
    padding: "10px 15px",
    borderRadius: "5px",
    marginBottom: "15px",
    fontSize: "13px",
    color: "#555"
  }}>
    <h6 style={{
      margin: "0 0 8px 0",
      fontWeight: "600",
      color: "#444",
      fontSize: "14px"
    }}>
      Room Attributes
    </h6>
    
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Class:</span> {room?.RoomAttributes?.class}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Room Type:</span> {room?.RoomAttributes?.quality === 0 ? "Unspecified" : room?.RoomAttributes?.quality}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Bathroom:</span> {room?.RoomAttributes?.bathroom === 2 ? "Private" : "Shared"}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Family Friendly:</span> {room?.RoomAttributes?.family === 0 ? "No" : "Yes"}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Club Access:</span> {room?.RoomAttributes?.club === 0 ? "No" : "Yes"}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Bedrooms:</span> {room?.RoomAttributes?.bedrooms}
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <span style={{ color: "#777", fontSize: "10px" }}>•</span>
        <span style={{ fontWeight: "500" }}>Balcony:</span> {room?.RoomAttributes?.balcony === 0 ? "No" : "Yes"}
      </div>
    </div>
  </div>

  {/* Fees Section - New Addition */}
  {
    room?.Taxes?.NonIncludedTaxes && room?.Taxes?.NonIncludedTaxes.length > 0 ? (
        <div style={{

    backgroundColor: "#e6f4ff",
    borderRadius: "6px",
    marginBottom: "15px",
    overflow: "hidden",
    border: "1px solid #d1e9ff"
  }}>
    <div style={{ 
      padding: "10px 15px", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      borderBottom: "1px solid #d1e9ff",
      backgroundColor: "#d1e9ff"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "8px", 
        fontSize: "14px", 
        fontWeight: "500", 
        color: "#0072c6" 
      }}>
        <i className="fa fa-credit-card" style={{ fontSize: "14px" }}></i>
        <span>Non Included Tax Breakdown</span>
      </div>
      {/* <i className="fa fa-chevron-up" style={{ fontSize: "12px", color: "#0072c6" }}></i> */}
    </div>
    
    <div style={{ padding: "12px 15px", backgroundColor: "#fff" }}>
      {/* <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        borderBottom: "1px solid #eee",
        padding: "8px 0",
        fontWeight: "600",
        fontSize: "13px" 
      }}>
        <span>TOTAL ADDITIONAL FEES</span>
        <span>HNL {room?.Price?.TotalTax?.toFixed(2)}</span>
      </div> */}
      
      {room?.Taxes?.NonIncludedTaxes?.map((tax, index) => (
        <div key={index} style={{ 
          display: "flex", 
          justifyContent: "space-between",
          padding: "8px 0",
          fontSize: "12px",
          color: "#666",
          borderBottom: index < room?.Taxes?.NonIncludedTaxes?.length - 1 ? "1px solid #f5f5f5" : "none"
        }}>
          <span style={{ textTransform: "uppercase" }}>
            {tax.name.replace(/_/g, " ")}
          </span>
          <span>{tax.currency_code} {tax.amount.toFixed(2)}</span>

          {/* <span>{CurrencyConverter(tax.currency_code, tax.amount.toFixed(2),baseCurrencyValue)}</span> */}

        </div>
      ))}
      
      {/* <div style={{ 
        fontSize: "11px", 
        color: "#888", 
        marginTop: "10px", 
        fontStyle: "italic" 
      }}>
        * These fees will be collected by the property during your stay
      </div> */}
    </div>
  </div>

    ):(null)
  }


  
  <h4 style={packageRate}>
    {CurrencyConverter(
      room.Price.CurrencyCode,
      room.Price.PublishedPrice,
      currency
    )}
  </h4>
  {
     provider === "ratehawk" && (<h6>including taxes and charges</h6>)
  }
  {/* <span className="text-muted" style={{ fontSize: "13px" }}>

    Non Included Tax {CurrencyConverter(
      room.Price.CurrencyCode,
      room.Price.TotalTax,
      currency
    )}

  </span> */}

 
  <Col className="d-flex flex-column align-items-end">
    <Button
      className="btn btn-sm btn-solid"
      onClick={() => handleSelectRoom(room)}
    >
      {isSelectRoom ? 'Selecting':'Select Room'}
    </Button>
  </Col>
</CardBody>
//               <CardBody>
//   <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
//     {room?.RoomTypeName}
//   </h5>
//   <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
//     Inclusions: {room?.Inclusions?.join(", ")}
//   </h5>
//   <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
//     {room?.CancellationPolicy?.FromDate}
//   </h6>
  
//   {/* Room Attributes Section */}
//   <div style={{ 
//     backgroundColor: "#dff1fd", 
//     padding: "10px 15px", 
//     borderRadius: "5px", 
//     marginBottom: "15px",
//     fontSize: "13px",
//     color: "#555"
//   }}>
//     <h6 style={{ 
//       margin: "0 0 8px 0", 
//       fontWeight: "600", 
//       color: "#444",
//       fontSize: "14px"
//     }}>
//       Room Attributes
//     </h6>
    
//     <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Class:</span> {room?.RoomAttributes?.class}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Room Type:</span> {room?.RoomAttributes?.quality === 0 ? "Unspecified" : room?.RoomAttributes?.quality}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Bathroom:</span> {room?.RoomAttributes?.bathroom === 2 ? "Private" : "Shared"}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Family Friendly:</span> {room?.RoomAttributes?.family === 0 ? "No" : "Yes"}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Club Access:</span> {room?.RoomAttributes?.club === 0 ? "No" : "Yes"}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Bedrooms:</span> {room?.RoomAttributes?.bedrooms}
//       </div>
      
//       <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//         <span style={{ color: "#777", fontSize: "10px" }}>•</span>
//         <span style={{ fontWeight: "500" }}>Balcony:</span> {room?.RoomAttributes?.balcony === 0 ? "No" : "Yes"}
//       </div>
//     </div>
//   </div>
  
//   <h4 style={packageRate}>
//     {CurrencyConverter(
//                       room.Price.CurrencyCode,
//                       room.Price.TotalTax,
//                       currency
//                     )}
//   </h4>
//   <span className="text-muted" style={{ fontSize: "10px" }}>
//     Published Price
//   </span>
//   <Col className="d-flex flex-column align-items-end">
//     <Button
//       className="btn btn-sm btn-solid"
//       onClick={() => handleSelectRoom(room)}
//     >
//       Select Room
//     </Button>
//   </Col>
// </CardBody>
              ):(
                <CardBody>
                  <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
                    {room.RoomTypeName}
                  </h5>
                  <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
                    {room.CancellationPolicy}
                  </h6>
                  {/* <h4 style={packageRate}>{CurrencyConverter(room.Price.CurrencyCode, room.Price.PublishedPrice, currency)}</h4> */}

                  {providers === "hotelAhs" ? (
                    <>
                      {getDiscountByRate(room?.RateIDs) ? (
                        <><h4 style={packageRate}>
                            {CurrencyConverter(
                              room.Price.CurrencyCode,
                              getDiscountProductBaseByPrice(
                                room.Price.PublishedPrice,
                                getDiscountByRate(room?.RateIDs),
                                currency
                              )["discountedAmount"],
                              currency
                            )}
                          </h4><h4 style={{ textDecoration: "line-through" }} className="m-0 p-0">
                              {CurrencyConverter(
                                room.Price.CurrencyCode,
                                room.Price.PublishedPrice,
                                currency
                              )}
                            </h4></>
                      ) : 
                      <h4 style={{ }} className="m-0 p-0">
                      {CurrencyConverter(
                        room.Price.CurrencyCode,
                        room.Price.PublishedPrice,
                        currency
                      )}
                    </h4>}

                 
                    </>
                  ) : (
                    <h4 style={packageRate}>
                      {CurrencyConverter(
                        room.Price.CurrencyCode,
                        room.Price.PublishedPrice,
                        currency
                      )}
                    </h4>
                  )}

                  {/* <h4 style={packageRate}>{CurrencyConverter(room.Price.CurrencyCode, room.Price.PublishedPrice, currency)}</h4> */}

                  <span className="text-muted" style={{ fontSize: "10px" }}>
                    Published Price
                  </span>
                  <Col className="d-flex flex-column align-items-end">
                    <Button
                      className="btn btn-sm btn-solid"
                      onClick={() => handleSelectRoom(room)}
                    >
                      Select Room
                    </Button>
                  </Col>
                </CardBody>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default RoomPackageSelector;

// import React, { useState, useEffect } from "react";
// import { Container, Row, Col, Card, CardBody, Button } from "reactstrap";
// import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
// import getDiscountProductBaseByPrice from "../../../pages/product-details/common/GetDiscountProductBaseByPrice";

// const RoomPackageSelector = ({
//   currency,
//   onRoomSelect,
//   dataSet,
//   discountValue,
//   discountClaimed,
//   providers,
// }) => {
//   const [roomData, setRoomData] = useState([]);
//   const provider = dataSet[0]?.Provider;
//   // console.log("datasett discout", discountValue);
//   // console.log("datasett rate", dataSet);
//   useEffect(() => {
//     setRoomData(dataSet);
//   }, [dataSet]);

//   const handleSelectRoom = (roomData) => {
//     onRoomSelect(roomData);
//   };

//   const packageRate = {
//     fontSize: "18px",
//     color: "#222222",
//     fontWeight: "700",
//     marginBottom: "0px",
//   };

//   // console.log("roomData", roomData);

//   const getDiscountByRate = (dataVar) => {

//       const discountVal = discountValue.filter((data) => {
//         return data?.origin_rate_id == dataVar;
//       });

//       return discountVal?.[0];
//   };

//   return (
//     <Container className="mt-4 lifestyle-packages">
//       <Row>
//         {roomData.map((room, index) => (
//           <Col md="12" key={index} className="mb-4">
//             <Card style={{ backgroundColor: "white", borderRadius: 0 }}>
//               {provider === "hotelTbo" || provider === "hotelTboH" ? (
//                 <CardBody>
//                   <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
//                     {room?.RoomTypeName}
//                   </h5>
//                   <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
//                     Inclusions : {room?.Inclusions[0]}
//                   </h5>
//                   <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
//                     {room?.CancellationPolicy?.FromDate}
//                   </h6>
//                   <h4 style={packageRate}>
//                     {CurrencyConverter(
//                       room.Price.CurrencyCode,
//                       room.Price.PublishedPrice,
//                       currency
//                     )}
//                   </h4>

//                   <span className="text-muted" style={{ fontSize: "10px" }}>
//                     Published Price
//                   </span>
//                   <Col className="d-flex flex-column align-items-end">
//                     <Button
//                       className="btn btn-sm btn-solid"
//                       onClick={() => handleSelectRoom(room)}
//                     >
//                       Select Room
//                     </Button>
//                   </Col>
//                 </CardBody>
//               ) : (
//                 <CardBody>
//                   <h5 className="m-0 p-0 mb-0" style={{ textAlign: "left" }}>
//                     {room.RoomTypeName}
//                   </h5>
//                   <h6 className="m-0 p-0 mb-4" style={{ lineHeight: "20px" }}>
//                     {room.CancellationPolicy}
//                   </h6>
//                   {/* <h4 style={packageRate}>{CurrencyConverter(room.Price.CurrencyCode, room.Price.PublishedPrice, currency)}</h4> */}

//                   {providers === "hotelAhs" ? (
//                     <>
//                       {getDiscountByRate(room?.RateIDs) ? (
//                         <><h4 style={packageRate}>
//                             {CurrencyConverter(
//                               room.Price.CurrencyCode,
//                               getDiscountProductBaseByPrice(
//                                 room.Price.PublishedPrice,
//                                 getDiscountByRate(room?.RateIDs),
//                                 currency
//                               )["discountedAmount"],
//                               currency
//                             )}
//                           </h4><h4 style={{ textDecoration: "line-through" }} className="m-0 p-0">
//                               {CurrencyConverter(
//                                 room.Price.CurrencyCode,
//                                 room.Price.PublishedPrice,
//                                 currency
//                               )}
//                             </h4></>
//                       ) : 
//                       <h4 style={{ }} className="m-0 p-0">
//                       {CurrencyConverter(
//                         room.Price.CurrencyCode,
//                         room.Price.PublishedPrice,
//                         currency
//                       )}
//                     </h4>}

                 
//                     </>
//                   ) : (
//                     <h4 style={packageRate}>
//                       {CurrencyConverter(
//                         room.Price.CurrencyCode,
//                         room.Price.PublishedPrice,
//                         currency
//                       )}
//                     </h4>
//                   )}

//                   {/* <h4 style={packageRate}>{CurrencyConverter(room.Price.CurrencyCode, room.Price.PublishedPrice, currency)}</h4> */}

//                   <span className="text-muted" style={{ fontSize: "10px" }}>
//                     Published Price
//                   </span>
//                   <Col className="d-flex flex-column align-items-end">
//                     <Button
//                       className="btn btn-sm btn-solid"
//                       onClick={() => handleSelectRoom(room)}
//                     >
//                       Select Room
//                     </Button>
//                   </Col>
//                 </CardBody>
//               )}
//             </Card>
//           </Col>
//         ))}
//       </Row>
//     </Container>
//   );
// };

// export default RoomPackageSelector;
