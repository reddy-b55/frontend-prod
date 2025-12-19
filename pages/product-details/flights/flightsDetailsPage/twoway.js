import React, { useContext, useState, useEffect } from "react";
import CurrencyConverter from "../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import {
  getCityName,
  getFlightName,
  getStopsCount,
  getTotalTime,
  getTotalTimeLayOver,
} from "../../../../GlobalFunctions/Flightfunctions/Flightfunctions";
import GetImage from "../../../../AxiosCalls/getImage";
import { AppContext } from "../../../_app";
import ConnectingAirportsIcon from "@mui/icons-material/ConnectingAirports";
import FlightIcon from "@mui/icons-material/Flight";
import {
  revalidatingm,
  handleRoundTripViewMore,
} from "../../../../AxiosCalls/FlightsServices/FlightServices";
import axios from "axios";

function Twoday({ flightData, handleKnowMoreOpen, userSearchData, seatCount }) {
  console.log("flight Data", flightData);

  const { baseCurrencyValue } = useContext(AppContext);
  const [expandeMore, setExpandeMore] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isData, setIsData] = useState(false);
  const [flightDataAddition, setFlightDataAddition] = useState([]);
  const [showData, setShowData] = useState(false);
  const [showPaxDetails, setShowPaxDetails] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pricesStepDown, setPricesStepDown] = useState([]);
  const [showDateChangeInfo, setShowDateChangeInfo] = useState(false);
  const [showRefundInfo, setShowRefundInfo] = useState(false);
  const [ticketInfoDate, setTicketInfoDate] = useState("");
  const [ticketInfoRefund, setTicketInfoRefund] = useState("");
  const [Penalties, setPenalties] = useState([]);

  // Handle click outside to close pax details
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPaxDetails && !event.target.closest('.pax-details-container')) {
        setShowPaxDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPaxDetails]);

  useEffect(() => {

    if (flightData?.dataFlight?.pricingInformation) {
      const penaltiesInfo =
        flightData.dataFlight.pricingInformation[0]?.fare?.passengerInfoList.map(
          (passenger) => ({
            passengerType: passenger?.passengerInfo?.passengerType || "Unknown", // Extract passenger type
            penalties: passenger?.passengerInfo?.penaltiesInfo || [], // Extract penalties
          })
        );
      setPenalties(penaltiesInfo || []);
    } else {
      console.error("dataFlight or pricingInformation is undefined");
      setPenalties([]);
    }

    if (isLoaded) {
      fetchData();
    }
  }, [isLoaded]);

  const [bagRef, setBagRef] = useState([]);

  const fetchTicketInfo = async (category) => {
    try {
      const response = await axios.get(`/ticket-info/${category}`);
      if (category === "Date Change") {
        setTicketInfoDate(response.data);
      }
      if (category === "Refund") {
        setTicketInfoRefund(response.data);
      }
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response ? error.response.data.message : error.message
      );
    }
  };

  const [baggageInfomationData, setBaggageInformationData] = useState([]);

  const fetchData = async () => {
    setIsData(true);
    try {
      // console.log("flightData useEffect");
      const res = await handleRoundTripViewMore(
        flightData,
        userSearchData,
        userSearchData,
        seatCount
      );
      if (res === "(Internal Server Error)") {
        setIsData(false);
        setFlightDataAddition(res);
        // console.log("Internal Server Error", res);
      } else {
        let totalPrice = CurrencyConverter(
          res?.itineraryGroups?.[0]?.itineraries?.[0]?.pricingInformation?.[0]
            ?.fare.totalFare.currency,
          res?.itineraryGroups?.[0]?.itineraries?.[0]?.pricingInformation?.[0]
            ?.fare.totalFare.totalPrice,
          baseCurrencyValue, true
        );

        let discount = CurrencyConverter("LKR", "5000", baseCurrencyValue);

        let reducedPrice = (
          parseFloat(totalPrice.replace(/[^0-9.-]+/g, "")) -
          parseFloat(discount.replace(/[^0-9.-]+/g, ""))
        ).toFixed(2);

        const finalFilter = extractFareSummary(res);
        setPricesStepDown(finalFilter);

        const extractedData = res?.pricingSource?.flatMap((pricingSource) =>
          pricingSource.flatMap((source) =>
            source.fare.passengerInfoList.map((passenger) => ({
              passengerType: passenger.passengerInfo.passengerType,
              baggageAllowance: passenger.passengerInfo.baggageInformation.map(
                (baggage) => baggage.allowance
              ),
            }))
          )
        );

        var result = extractedData.map((passenger) => {
          let refId = passenger.baggageAllowance[0].ref; // Get the first baggageAllowance ref
          let baggageDetails = res.baggageAllowanceDescs.find(
            (bag) => bag.id === refId
          ); // Find matching baggage details

          return {
            passengerType: passenger.passengerType,
            baggage: baggageDetails,
          };
        });

        setBaggageInformationData(result);

        console.log(result, "result data value is");

        // setBagRef[extractedData]
        console.log("extractedData", extractedData);
        console.log("extractedData1233", res);
        // console.log(getBaggageDetails(extractedData?.[0]?.passengerType,extractedData ), "getBaggageDetails")

        setTotalPrice(reducedPrice);
        setFlightDataAddition(res);
        console.log(
          flightDataAddition,
          "response data dataaaaaaa"
        );
        setIsData(false);
      }
    } catch (error) {
      setIsData(false);
      // console.log(error, "error");
    }
  };

  const returnBaggageData = baggageDetails => {
    if (baggageDetails) {
      if (baggageDetails.weight && baggageDetails.unit) {
        return `${baggageDetails.weight} ${baggageDetails.unit}`;
      } else if (baggageDetails.pieceCount > 0) {
        return `${baggageDetails.pieceCount} PIECE: ${baggageDetails.description1}`;
      } else {
        return "Not Included";
      }
    }
  }

  const getBaggageDetails = (passengerType, baggageAllowance) => {
    console.log("passengerType, baggageAllowance", baggageAllowance);
    if (!baggageAllowance?.length) return "Not Included";

    const firstBaggage = baggageAllowance[0];
    console.log("firstBaggage", firstBaggage);
    const baggageDetails = flightDataAddition.baggageAllowanceDescs?.find(
      (item) => item.id === firstBaggage.ref
    );

    console.log("baggageDetails", baggageDetails);

    if (baggageDetails) {
      if (baggageDetails.weight && baggageDetails.unit) {
        return `${baggageDetails.weight} ${baggageDetails.unit}`;
      } else if (baggageDetails.pieceCount > 0) {
        return `${baggageDetails.pieceCount} PIECE: ${baggageDetails.description1}`;
      } else {
        return "Not Included";
      }
    }

    return "Not Included";
  };

  const extractFareSummary = (fareDetail) => {
    const passengerData =
      fareDetail?.itineraryGroups?.[0]?.itineraries?.[0]
        ?.pricingInformation?.[0]?.fare?.passengerInfoList || [];

    let fareSummary = {
      adultCount: 0,
      childCount: 0,
      infantCount: 0,
      adultPrice: 0,
      childPrice: 0,
      infantPrice: 0,
      currency: fareDetail?.fare?.totalFare?.currency || "LKR",
      totalTax: fareDetail?.fare?.totalFare?.totalTaxAmount || 0,
      totalPrice: fareDetail?.fare?.totalFare?.totalPrice || 0,
    };

    passengerData.forEach(({ passengerInfo }) => {
      const { passengerType, passengerNumber, passengerTotalFare } =
        passengerInfo;

      if (passengerType === "ADT") {
        fareSummary.adultCount = passengerNumber;
        fareSummary.adultPrice =
          passengerTotalFare.equivalentAmount * passengerNumber;
      } else if (passengerType === "CNN") {
        fareSummary.childCount = passengerNumber;
        fareSummary.childPrice =
          passengerTotalFare.equivalentAmount * passengerNumber;
      } else if (passengerType === "INF") {
        fareSummary.infantCount = passengerNumber;
        fareSummary.infantPrice =
          passengerTotalFare.equivalentAmount * passengerNumber;
      }
    });

    return fareSummary;
  };

  return (
    <div className="border mb-3 mx-lg-0 mx-0 py-lg-3 px-lg-4 p-2 rounded-3">
      <div className="d-flex flex-column gap-2">

        {flightData.scheduleData.map((value, key) => (
          <div
            className="border px-3 py-2 rounded-3 d-flex align-items-stretch flex-wrap justify-content-between flex-wrap"
            key={key}
          >
            <div className="col-12 d-flex align-items-stretch justify-content-between mb-3 flex-wrap">
              <div className="col-12 col-lg-6 d-flex flex-column align-items-start">
                <div className="col-12 d-flex align-items-center">
                  <div className="my-auto">{GetImage(value)}</div>
                  <h6 className="m-0 p-0 ms-2" style={{ fontWeight: "600" }}>
                    {getFlightName(flightData.flightCodes[key])}
                  </h6>
                </div>

                <div className="col-12 d-flex align-items-start gap-1">
                  <h6
                    className="m-0"
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "gray",
                      fontSize: 13,
                    }}
                  >
                    {value[0].carrier.operating}
                  </h6>
                  <h6
                    className="m-0"
                    style={{
                      fontSize: 14,
                      fontWeight: 400,
                      color: "gray",
                      fontSize: 13,
                    }}
                  >
                    {value[0].carrier.operatingFlightNumber}
                  </h6>
                </div>
              </div>

              <div className="col-12 col-lg-6 d-flex flex-column align-items-end justify-content-between">
                <h6
                  className="m-0"
                  style={{
                    textTransform: "capitalize",
                    fontSize: 12,
                    fontWeight: 400,
                  }}
                >
                  {getCityName(
                    flightData.itenaryGroupData.legDescriptions[key]
                      .departureLocation
                  )}{" "}
                  -{" "}
                  {getCityName(
                    flightData.itenaryGroupData.legDescriptions[key]
                      .arrivalLocation
                  )}
                  ,{" "}
                  {
                    flightData.itenaryGroupData.legDescriptions[key]
                      .departureDate
                  }
                </h6>
                <h6
                  className="m-0"
                  style={{
                    textTransform: "capitalize",
                    fontSize: 12,
                    fontWeight: 400,
                  }}
                >
                  Total hours :{" "}
                  {getTotalTime(flightData.legsData[key].elapsedTime)}
                </h6>
              </div>
            </div>

            <div className="col-12 d-flex flex-wrap">
              <div className="d-flex flex-column align-items-start col-lg-3 col-12">
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 24, fontWeight: 600 }}
                >
                  {value[0]?.departure?.time.slice(0, 5)}
                </h6>
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  {value[0]?.departure?.airport}
                </h6>
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  {getCityName(value[0]?.departure?.airport)}
                </h6>
                <h6 className="m-0 p-0" style={{ fontSize: 13, fontWeight: 400 }}>
                  {value[0]?.departure?.terminal ? "Terminal " + value[0]?.departure?.terminal : null}
                </h6>
              </div>

              <div className="d-flex align-items-center flex-column align-items-center col-lg-6 col-12">
                <div className="d-flex align-items-center">
                  <div className="flight-animation-borderLeft"></div>
                  <div className="flight-animation d-flex align-items-center mx-2">
                    {value.map(
                      (x, y) =>
                        y + 1 !== value.length && (
                          <FlightIcon
                            sx={{ rotate: key == 0 ? "90deg" : "270deg" }}
                          />
                        )
                    )}
                  </div>
                  <div className="flight-animation-borderRight"></div>
                </div>

                <div className="d-flex align-items-center flex-column flex-lg-row flight-duraion-andStops">
                  {/* <h6 className="m-0 p-0"> */}
                  {/* Duration {getTotalTime(value[0].elapsedTime)} */}

                  {getTotalTimeLayOver(value)?.map((data) => {
                    return (
                      <h6>
                        layover {data?.duration} at {data?.airport}
                      </h6>
                    );
                  })}

                  {/* </h6> */}
                  <h6 className="m-0 p-0">{getStopsCount(value)}</h6>
                </div>
              </div>

              <div className="d-flex flex-column align-items-end col-lg-3 col-12">
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 24, fontWeight: 600 }}
                >
                  {value[0]?.arrival?.time.slice(0, 5)}
                </h6>
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  {value[value?.length - 1]?.arrival?.airport}
                </h6>
                <h6
                  className="m-0 p-0"
                  style={{ fontSize: 13, fontWeight: 400 }}
                >
                  {getCityName(value[value?.length - 1]?.arrival?.airport)}
                </h6>
                <h6 className="m-0 p-0" style={{ fontSize: 13, fontWeight: 400 }}>
                  {value[0]?.arrival?.terminal ? "Terminal " + value[0]?.arrival?.terminal : null}
                </h6>
              </div>
            </div>

            <div
              className={`mt-3 rounded-2 p-3 d-flex col-12 flex-column gap-3 d-${expandeMore ? "block" : "none"
                }`}
              style={{ backgroundColor: "#f2f2f2" }}
            >
              {value.map((flightData, key) => (
                <div
                  className="d-flex align-items-center flex-column col-12"
                  key={key}
                >
                  <div className="d-flex align-items-center justify-content-center flex-column flex-lg-row col-12 col-lg-12 flight-duraion-andStops">
                    <h6 className="m-0 p-0" style={{ fontWeight: 500 }}>
                      {flightData.departure.time} -{" "}
                      {getCityName(flightData.departure.airport)} (
                      {flightData.departure.airport})
                      {flightData.departure.terminal ? " Terminal " + flightData.departure.terminal : ""}
                    </h6>
                    <h6
                      className="m-0 p-0"
                      style={{ fontWeight: 300, color: "gray" }}
                    >
                      Travel time : {getTotalTime(flightData.elapsedTime)}
                    </h6>
                    <h6 className="m-0 p-0" style={{ fontWeight: 500 }}>
                      {flightData.arrival.time} -{" "}
                      {getCityName(flightData.arrival.airport)} (
                      {flightData.arrival.airport})
                      {flightData.arrival.terminal ? " Terminal " + flightData.arrival.terminal : ""}
                    </h6>
                  </div>

                  {flightData.length != key + 1 && (
                    <div className="d-flex align-items-center">
                      <div className="flight-animation-borderLeft"></div>
                      <div className="flight-animation d-flex align-items-center">
                        <ConnectingAirportsIcon />
                      </div>
                      <div className="flight-animation-borderRight"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="col-12 d-flex flex-wrap">
          <div className="col-lg-7 col-12 text-start ps-2 text-primary mt-3">
            {/* <span onClick={handleKnowMoreOpen} style={{ cursor: 'pointer', fontSize: 11, textTransform: 'uppercase' }}>Get mobile app to make a checkout !</span> */}
          </div>

          <div className="col-lg-5 col-12 px-3 py-2 d-flex flex-column align-items-end">
            <h5 className="m-0 p-0" style={{ fontWeight: 600, color: "color" }}>
              {CurrencyConverter(
                flightData?.totalFare?.currency,
                flightData?.totalFare?.totalPrice,
                baseCurrencyValue, true
              )}{" "}
              / pax {seatCount?.seat_count}
            </h5>
            {
              flightData?.totalFare?.actualBeforeDiscount != flightData?.totalFare?.totalPrice ? (
                <h6 className="m-0 p-0" style={{ textDecoration: "line-through" }}>
                  {CurrencyConverter(
                    flightData?.totalFare?.currency,
                    flightData?.totalFare?.actualBeforeDiscount,
                    baseCurrencyValue, true
                  )}
                </h6>) : null
            }
            <div className="pax-details-container" style={{ position: "relative", display: "inline-block" }}>
              <span
                onClick={() => setShowPaxDetails(!showPaxDetails)}
                style={{ color: "blue", cursor: "pointer", marginTop: "5px", display: "block" }}
              >
                {showPaxDetails ? "Hide Pax Details" : "Show Pax Details"}
              </span>
              {showPaxDetails && (
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "100%",
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "5px",
                    padding: "10px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    zIndex: 10,
                    whiteSpace: "nowrap",
                    marginRight: "10px",
                  }}
                >
                  <p>Adult: {seatCount.paxTypeAndCount[0]?.count}</p>
                  <p>Child: {seatCount.paxTypeAndCount[1]?.count}</p>
                  <p>Infants: {seatCount.paxTypeAndCount[2]?.count}</p>
                </div>
              )}
            </div>
            {showData === false ? (
              <span
                onClick={() => {
                  setExpandeMore(!expandeMore);
                  setIsLoaded(!isLoaded);
                  setShowData(true);
                }}
                style={{ color: "blue", cursor: "pointer" }}
              >
                See Details
              </span>
            ) : (
              <span
                onClick={() => {
                  setIsData(false);
                  setShowData(false);
                  setExpandeMore(!expandeMore);
                }}
                style={{ color: "blue", cursor: "pointer" }}
              >
                Hide Details
              </span>
            )}
          </div>
        </div>

        {isData ? (
          <div>Loading...</div>
        ) : flightDataAddition === "(Internal Server Error)" ? (
          showData && (
            <div
              style={{
                marginTop: "15px",
                backgroundColor: "#f1f2f6",
                padding: "10px",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#2f3542",
              }}
            >
              <span style={{ fontWeight: "bold", color: "red" }}>
                {" "}
                Flight data not available.This flight is not available for
                booking. Please check other flights.
              </span>
            </div>
          )
        ) : (
          showData && (
            <div
              style={{
                fontFamily: "Arial, sans-serif",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "20px",
                backgroundColor: "#f4f6f9",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "20px",
                  "@media (max-width: 768px)": {
                    gridTemplateColumns: "1fr",
                  },
                }}
              >
                {/* Baggage Policy Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    boxShadow: "0 3px 5px rgba(0,0,0,0.1)",
                    padding: "16px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                      borderBottom: "1px solid #f1f3f5",
                      paddingBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "8px",
                        fontSize: "20px",
                      }}
                    >
                      🧳
                    </div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "16px",
                        color: "#2c3e50",
                        fontWeight: "600",
                      }}
                    >
                      Baggage Policy
                    </h3>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {baggageInfomationData?.map((data, dataIdx) => (
                      <div
                        key={dataIdx}
                        style={{
                          // display: "flex",
                          // justifyContent: "space-between",
                          // alignItems: "center",
                          padding: "6px 0",
                          borderBottom: dataIdx < baggageInfomationData.length - 1 ? "1px solid #f1f3f5" : "none",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#495057",
                            fontWeight: "500",
                          }}
                        >
                          <h6 style={{ fontWeight: "600" }}>
                            {data?.passengerType === "ADT"
                              ? "Adult"
                              : data?.passengerType === "CNN"
                                ? "Child"
                                : "Infant"}
                          </h6>

                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#2c3e50",
                          }}
                        >
                          <span style={{ fontSize: '10px' }}>
                            {returnBaggageData(data?.baggage)}

                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Fare Details Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    padding: "20px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "15px",
                      borderBottom: "1px solid #f1f3f5",
                      paddingBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "10px",
                        fontSize: "24px",
                      }}
                    >
                      💰
                    </div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "18px",
                        color: "#2c3e50",
                      }}
                    >
                      Fare Details
                    </h3>
                  </div>
                  <div>
                    {pricesStepDown.adultCount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #f1f3f5",
                        }}
                      >
                        <span style={{ color: "#495057" }}>
                          Adult x {pricesStepDown.adultCount}
                        </span>
                        <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                          {CurrencyConverter(
                            pricesStepDown.currency,
                            pricesStepDown.adultPrice,
                            baseCurrencyValue, true
                          )}
                        </span>
                      </div>
                    )}
                    {pricesStepDown.childCount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #f1f3f5",
                        }}
                      >
                        <span style={{ color: "#495057" }}>
                          Child x {pricesStepDown.childCount}
                        </span>
                        <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                          {CurrencyConverter(
                            pricesStepDown.currency,
                            pricesStepDown.childPrice,
                            baseCurrencyValue, true
                          )}
                        </span>
                      </div>
                    )}
                    {pricesStepDown.infantCount > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #f1f3f5",
                        }}
                      >
                        <span style={{ color: "#495057" }}>
                          Infant x {pricesStepDown.infantCount}
                        </span>
                        <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                          {CurrencyConverter(
                            pricesStepDown.currency,
                            pricesStepDown.infantPrice,
                            baseCurrencyValue, true
                          )}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #f1f3f5",
                      }}
                    >
                      <span style={{ color: "#495057" }}>Tax & Fees</span>
                      <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {CurrencyConverter(
                          flightDataAddition?.itineraryGroups?.[0]
                            ?.itineraries?.[0]?.pricingInformation?.[0]?.fare
                            .totalFare.currency,
                          flightDataAddition?.itineraryGroups?.[0]
                            ?.itineraries?.[0]?.pricingInformation?.[0]?.fare
                            .totalFare.totalTaxAmount,
                          baseCurrencyValue, true
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #f1f3f5",
                      }}
                    >
                      <span style={{ color: "#495057" }}>Net Price</span>
                      <span style={{ fontWeight: "bold", color: "#2c3e50" }}>
                        {CurrencyConverter(
                          flightDataAddition?.itineraryGroups?.[0]
                            ?.itineraries?.[0]?.pricingInformation?.[0]?.fare
                            .totalFare.currency,
                          flightDataAddition?.itineraryGroups?.[0]
                            ?.itineraries?.[0]?.pricingInformation?.[0]?.fare
                            .totalFare.totalPrice,
                          baseCurrencyValue, true
                        )}
                      </span>
                    </div>
                    {/* <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid #f1f3f5",
                      }}
                    >
                      <span
                        style={{
                          color: "#495057",
                        }}
                      >
                        Discount
                      </span>
                      <span
                        style={{
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {CurrencyConverter(
                          flightDataAddition?.pricingSource?.[0]?.[0]?.fare
                            .totalFare.discountCurrency,
                          flightDataAddition?.pricingSource?.[0]?.[0]?.fare
                            .totalFare.discountAmount,
                          baseCurrencyValue, true
                        )}
                      </span>
                    </div> */}
                    {flightData?.totalFare?.discountAmount && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "10px",
                          paddingBottom: "10px",
                          borderBottom: "1px solid #f1f3f5",
                        }}
                      >
                        <span
                          style={{
                            color: "#495057",
                          }}
                        >
                          Discount
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "#2c3e50",
                          }}
                        >
                          {CurrencyConverter(
                            flightData.totalFare.discountCurrency,
                            flightData.
                              totalFare.discountAmount,
                            baseCurrencyValue,
                            true
                          )}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "15px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        Gross Price
                      </span>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: "bold",
                          color: "#2c3e50",
                        }}
                      >
                        {CurrencyConverter(
                          flightData.totalFare.currency,
                          flightData?.totalFare?.totalPrice,
                          baseCurrencyValue, true
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Date Change & Refund Policy Card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    padding: "20px",
                    border: "1px solid #e9ecef",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "15px",
                      borderBottom: "1px solid #f1f3f5",
                      paddingBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        marginRight: "10px",
                        fontSize: "24px",
                      }}
                    >
                      🔄
                    </div>
                    <h3
                      style={{
                        margin: "0",
                        fontSize: "18px",
                        color: "#2c3e50",
                      }}
                    >
                      Date Change & Refund Policy
                    </h3>
                  </div>
                  {Penalties.map(({ passengerType, penalties }) => (
                    <div key={passengerType}>
                      <h6
                        style={{
                          color: "#495057",
                          backgroundColor: "#f8f9fa",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          display: "inline-block",
                          // fontSize: "16px",
                          fontWeight: "600"
                        }}
                      >
                        {passengerType === "ADT" ? "Adult (Per Person)" : passengerType === "CNN" ? "Child (Per Person)" : "Infant (Per Person)"}
                      </h6>
                      <div>
                        <div style={{ color: "#495057", marginBottom: "5px", display: "flex", alignItems: "center", position: "relative" }}>
                          <span
                            onClick={() => {
                              fetchTicketInfo("Date Change");
                              setShowDateChangeInfo(!showDateChangeInfo)
                            }}
                            style={{ cursor: "pointer", marginRight: "5px", fontSize: "16px" }}
                          >
                            ℹ️
                          </span>
                          <span><b>Date Change</b></span>
                          {showDateChangeInfo && (
                            <div style={{
                              position: "absolute",
                              top: "25px",
                              left: "0",
                              backgroundColor: "#fff",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              padding: "10px",
                              zIndex: 10,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              width: "220px",
                            }}>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Description :</b> {ticketInfoDate?.desc}</p>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Unutilized :</b> {ticketInfoDate?.unutilized_info}</p>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Partially Utilized :</b> {ticketInfoDate?.partially_utilized_info}</p>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d" }}>
                          {/* <b>Unutilized</b> - {penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.changeable ? `${penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.amount} ${penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.currency}` : "Not Allowed"} */}
                          <b>Unutilized</b> - {penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.changeable
                            ? CurrencyConverter(
                              penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.currency,
                              penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "Before")?.amount,
                              baseCurrencyValue, true
                            )
                            : "Not Allowed"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                          {/* <b>Partially Utilized</b> - {penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.changeable ? `${penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.amount ?? "-"} ${penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.currency ?? ""}` : "Not Allowed"} */}
                          <b>Partially Utilized</b> - {penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.changeable
                            ? CurrencyConverter(
                              penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.currency,
                              penalties.penalties.find(p => p.type === "Exchange" && p.applicability === "After")?.amount,
                              baseCurrencyValue, true
                            )
                            : "Not Allowed"}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: "#495057", marginBottom: "5px", display: "flex", alignItems: "center", position: "relative" }}>
                          <span
                            onClick={() => {
                              fetchTicketInfo("Refund");
                              setShowRefundInfo(!showRefundInfo)
                            }}
                            style={{ cursor: "pointer", marginRight: "5px", fontSize: "16px" }}
                          >
                            ℹ️
                          </span>
                          <span><b>Refund</b></span>
                          {showRefundInfo && (
                            <div style={{
                              position: "absolute",
                              top: "25px",
                              left: "0",
                              backgroundColor: "#fff",
                              border: "1px solid #dee2e6",
                              borderRadius: "4px",
                              padding: "10px",
                              zIndex: 10,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                              width: "220px",
                            }}>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Description :</b> {ticketInfoRefund?.desc}</p>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Unutilized :</b> {ticketInfoRefund?.unutilized_info}</p>
                              <p style={{ margin: "0", fontSize: "11px" }}><b>Partially Utilized :</b> {ticketInfoRefund?.partially_utilized_info}</p>
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d" }}>
                          {/* <b>Unutilized</b> - {penalties.penalties.find(p => p.type === "Refund" && p.applicability === "Before")?.refundable ? `${penalties.penalties.find(p => p.type === "Refund" && p.applicability === "Before")?.amount} ${penalties.penalties.find(p => p.type === "Refund" && p.applicability === "Before")?.currency}` : "Not Allowed"} */}
                          <b>Unutilized</b> - {penalties?.penalties?.find(p => p?.type === "Refund" && p?.applicability === "Before")?.refundable
                            ? CurrencyConverter(
                              penalties?.penalties.find(p => p.type === "Refund" && p?.applicability === "Before")?.currency,
                              penalties?.penalties.find(p => p.type === "Refund" && p?.applicability === "Before")?.amount,
                              baseCurrencyValue, true
                            )
                            : "Not Allowed"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "5px" }}>
                          {/* <b>Partially Utilized</b> - {penalties.penalties.find(p => p.type === "Refund" && p.applicability === "After")?.refundable ? "Allowed" : "Not Allowed"} */}
                          <b>Partially Unutilized</b> - {penalties?.penalties?.find(p => p?.type === "Refund" && p?.applicability === "After")?.refundable
                            ? CurrencyConverter(
                              penalties?.penalties.find(p => p.type === "Refund" && p?.applicability === "After")?.currency,
                              penalties?.penalties.find(p => p.type === "Refund" && p?.applicability === "After")?.amount,
                              baseCurrencyValue, true
                            )
                            : "Not Allowed"}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: "15px", backgroundColor: "#f1f2f6", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "#2f3542" }}>
                    IN ADDITION, NO SHOW PENALTIES MAY APPLY
                  </div>

                </div>

              </div>
              {flightDataAddition?.bankProviders?.length > 0 && (
                <div className="text-center text-primary mt-3" style={{ backgroundColor: '#fff', padding: "3%" }}>
                  {flightDataAddition?.bankProviders?.some(bank => bank.name === "All") ? (
                    // Show only infoLabel if "All" is found
                    <div>
                      {flightDataAddition.bankProviders
                        .filter(bank => bank.name === "All")
                        .map((bank, index) => (
                          <h6 key={index}>{bank.infoLabel}</h6>
                        ))
                      }
                    </div>
                  ) : (
                    // Show images and default message if "All" is not found
                    <>
                      <div className="flex flex-row flex-nowrap overflow-x-auto justify-start items-center gap-4" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                        {flightDataAddition?.bankProviders.map((bank, index) => (
                          <div
                            key={index}
                            className="flex-shrink-0 w-20 h-12 bg-white rounded-md "
                          >
                            <img
                              src={bank.iconUrl}
                              alt={`${bank.name} logo`}
                              className="max-w-full max-h-full object-contain"
                              style={{ width: "80px", height: "40px" }}
                            />
                          </div>
                        ))}
                      </div>
                      <br />
                      <h6>You will get this discount only if you pay by these cards</h6>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        )}

        <div className="text-center text-primary mt-3">
          <span
            onClick={handleKnowMoreOpen}
            style={{
              cursor: "pointer",
              fontSize: 11,
              textTransform: "uppercase",
            }}
          >
            Get mobile app to make a checkout !
          </span>
        </div>
      </div>
    </div>
  );
}

export default Twoday;



// {flightData.scheduleData.map((value, key) => (
//   <div
//     className="border px-3 py-2 rounded-3 d-flex align-items-stretch flex-wrap justify-content-between flex-wrap"
//     key={key}
//   >
//     <div className="col-12 d-flex align-items-stretch justify-content-between mb-3 flex-wrap">
//       <div className="col-12 col-lg-6 d-flex flex-column align-items-start">
//         <div className="col-12 d-flex align-items-center">
//           <div className="my-auto">{GetImage(value)}</div>
//           <h6 className="m-0 p-0 ms-2" style={{ fontWeight: "600" }}>
//             {getFlightName(flightData.flightCodes[key])}
//           </h6>
//         </div>

//         <div className="col-12 d-flex align-items-start gap-1">
//           <h6
//             className="m-0"
//             style={{
//               fontSize: 14,
//               fontWeight: 400,
//               color: "gray",
//               fontSize: 13,
//             }}
//           >
//             {value[0].carrier.operating}
//           </h6>
//           <h6
//             className="m-0"
//             style={{
//               fontSize: 14,
//               fontWeight: 400,
//               color: "gray",
//               fontSize: 13,
//             }}
//           >
//             {value[0].carrier.operatingFlightNumber}
//           </h6>
//         </div>
//       </div>

//       <div className="col-12 col-lg-6 d-flex flex-column align-items-end justify-content-between">
//         <h6
//           className="m-0"
//           style={{
//             textTransform: "capitalize",
//             fontSize: 12,
//             fontWeight: 400,
//           }}
//         >
//           {getCityName(
//             flightData.itenaryGroupData.legDescriptions[key]
//               .departureLocation
//           )}{" "}
//           -{" "}
//           {getCityName(
//             flightData.itenaryGroupData.legDescriptions[key]
//               .arrivalLocation
//           )}
//           ,{" "}
//           {
//             flightData.itenaryGroupData.legDescriptions[key]
//               .departureDate
//           }
//         </h6>
//         <h6
//           className="m-0"
//           style={{
//             textTransform: "capitalize",
//             fontSize: 12,
//             fontWeight: 400,
//           }}
//         >
//           Total hours :{" "}
//           {getTotalTime(flightData.legsData[key].elapsedTime)}
//         </h6>
//       </div>
//     </div>

//     <div className="col-12 d-flex flex-wrap">
//       <div className="d-flex flex-column align-items-start col-lg-3 col-12">
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 24, fontWeight: 600 }}
//         >
//           {value[0]?.departure?.time.slice(0, 5)}
//         </h6>
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 13, fontWeight: 400 }}
//         >
//           {value[0]?.departure?.airport}
//         </h6>
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 13, fontWeight: 400 }}
//         >
//           {getCityName(value[0]?.departure?.airport)}
//         </h6>
//         <h6 className="m-0 p-0" style={{ fontSize: 13, fontWeight: 400 }}>
//         {value[0]?.departure?.terminal ? "Terminal " + value[0]?.departure?.terminal : null}
//     </h6>

//       </div>

//       <div className="d-flex align-items-center flex-column align-items-center col-lg-6 col-12">
//         <div className="d-flex align-items-center">
//           <div className="flight-animation-borderLeft"></div>
//           <div className="flight-animation d-flex align-items-center mx-2">
//             {value.map(
//               (x, y) =>
//                 y + 1 !== value.length && (
//                   <FlightIcon
//                     sx={{ rotate: key == 0 ? "90deg" : "270deg" }}
//                   />
//                 )
//             )}
//           </div>
//           <div className="flight-animation-borderRight"></div>
//         </div>

//         <div className="d-flex align-items-center flex-column flex-lg-row flight-duraion-andStops">
//           {/* <h6 className="m-0 p-0"> */}
//           {/* Duration {getTotalTime(value[0].elapsedTime)} */}

//           {getTotalTimeLayOver(value)?.map((data) => {
//             return (
//               <h6>
//                 layover {data?.duration} at {data?.airport}
//               </h6>
//             );
//           })}

//           {/* </h6> */}
//           <h6 className="m-0 p-0">{getStopsCount(value)}</h6>
//         </div>
//       </div>

//       <div className="d-flex flex-column align-items-end col-lg-3 col-12">
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 24, fontWeight: 600 }}
//         >
//           {value[0]?.arrival?.time.slice(0, 5)}
//         </h6>
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 13, fontWeight: 400 }}
//         >
//           {value[value?.length - 1]?.arrival?.airport}
//         </h6>
//         <h6
//           className="m-0 p-0"
//           style={{ fontSize: 13, fontWeight: 400 }}
//         >
//           {getCityName(value[value?.length - 1]?.arrival?.airport)}
//         </h6>
//         <h6 className="m-0 p-0" style={{ fontSize: 13, fontWeight: 400 }}>
//      {value?.[key]?.arrival?.terminal === null ? null : "Terminal " + value?.[key]?.arrival?.terminal}
//     </h6>
//       </div>
//     </div>

//     <div
//       className={`mt-3 rounded-2 p-3 d-flex col-12 flex-column gap-3 d-${
//         expandeMore ? "block" : "none"
//       }`}
//       style={{ backgroundColor: "#f2f2f2" }}
//     >
//       {value.map((flightData, key) => (
//         <div
//           className="d-flex align-items-center flex-column col-12"
//           key={key}
//         >
//           <div className="d-flex align-items-center justify-content-center flex-column flex-lg-row col-12 col-lg-12 flight-duraion-andStops">
//             <h6 className="m-0 p-0" style={{ fontWeight: 500 }}>
//               {flightData.departure.time} -{" "}
//               {getCityName(flightData.departure.airport)} (
//               {flightData.departure.airport})
//             </h6>
//             <h6
//               className="m-0 p-0"
//               style={{ fontWeight: 300, color: "gray" }}
//             >
//               Travel time : {getTotalTime(flightData.elapsedTime)}
//             </h6>
//             <h6 className="m-0 p-0" style={{ fontWeight: 500 }}>
//               {flightData.arrival.time} -{" "}
//               {getCityName(flightData.arrival.airport)} (
//               {flightData.arrival.airport})
//             </h6>
//           </div>

//           {flightData.length != key + 1 && (
//             <div className="d-flex align-items-center">
//               <div className="flight-animation-borderLeft"></div>
//               <div className="flight-animation d-flex align-items-center">
//                 <ConnectingAirportsIcon />
//               </div>
//               <div className="flight-animation-borderRight"></div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// ))}