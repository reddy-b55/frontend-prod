import React from "react";
import styles from "./FlightCard.module.css";
import AirportCodes from "../../../../GlobalFunctions/Data/AirportCodes.json";
import moment from "moment";
import { useRouter } from "next/router";

const FlightCard = ({ O_id,order=null,flightValidData, flightsData, price, handleToggle }) => {
  // console.log("FlightCard Props:", order, flightValidData, flightsData, price);

const durationMinutes = flightsData.legsData.elapsedTime; // 75
const hours = Math.floor(durationMinutes / 60); // 1
const minutes = durationMinutes % 60; // 15

// console.log(`Flight duration: ${hours}h ${minutes}m`);
  function calculateDateCount(scheduleData) {
    if (!Array.isArray(scheduleData)) return 0;

    return scheduleData.reduce(
      (total, schedule) => total + (schedule.arrival?.dateAdjustment || 0),
      0
    );
  }

  const convertToActualTimeMeta = (passingDate) => {
    if (!passingDate) return "";
    return passingDate.substring(0, 5);
  };

  function getStopCount(stopCount) {
    if (stopCount === 0) return "Direct Flight";
    if (stopCount === 1) return "1 Stop";
    if (stopCount > 1) return `${stopCount} Stops`;
    return "No Stops";
  }

  function calculateTotalStopCount(flights) {
    if (!Array.isArray(flights)) return 0;
    return flights.reduce(
      (total, flight) => total + (flight.stopCount || 0),
      0
    );
  }

  const getFlyingTimeFromLegs = (elapsedTime) => {
    if (!elapsedTime) return "";

    const hours = Math.floor(elapsedTime / 60);
    const minutes = elapsedTime % 60;

    const hoursText = `${hours}h`;
    const minutesText = minutes > 0 ? `${minutes}min` : "";

    return `${hoursText} ${minutesText}`.trim();
  };

  const getAirportName = (code) => {
    if (!code) return "";
    return (
      AirportCodes.airport_codes?.find((flight) => flight?.iata_code === code)
        ?.name || ""
    );
  };

  // Safely access nested properties
  const lastScheduleIndex = flightsData?.scheduleData?.length - 1 || 0;
  const scheduleData = flightsData?.scheduleData || [];

  const departureCity = scheduleData[0]?.departure?.city || "";
  const departureTerminal = scheduleData[0]?.departure?.terminal || "";
  const arrivalCity = scheduleData[lastScheduleIndex]?.arrival?.city || "";
  const arrivalTerminal =
    scheduleData[lastScheduleIndex]?.arrival?.terminal || "";
  const arrivalTime = convertToActualTimeMeta(
    scheduleData[lastScheduleIndex]?.arrival?.time
  );
  const departureTime = convertToActualTimeMeta(
    scheduleData[0]?.departure?.time
  );
  const stopCount = getStopCount(calculateTotalStopCount(scheduleData));
  const duration = getFlyingTimeFromLegs(flightsData?.elapsedTime);
  console.log("FlightCard Props 12345", duration);
  const depDate =
    flightsData?.itenaryGroupData?.legDescriptions[0]?.departureDate || "";
  const arrDate = depDate
    ? moment(depDate, "YYYY-MM-DD")
        .add(calculateDateCount(scheduleData), "days")
        .format("YYYY-MM-DD")
    : "";
  const arrivalCityLoc = getAirportName(arrivalCity);
  const departureCityLoc = getAirportName(departureCity);
  const router = useRouter();


  const handleMoreInfo = () => {
    console.log("Flight ID isssss", order);
    handleToggle(order);
    // router.push(`/pages/page/account/order-history/${O_id}?main_category_id=6`);\
    // router.push(
    //   `order-history/${O_id}?main_category_id=${6}&flightDetails=${encodeURIComponent(
    //   JSON.stringify(order)
    //   )}`
    // );
  };

  const calculateDuration = (
    departureTime,
    arrivalTime,
    departureDate,
    arrivalDate
  ) => {
    // Handle missing data
    if (!departureTime || !arrivalTime || !departureDate || !arrivalDate)
      return "N/A";

    // Parse times (input format: "HH:mm:ss+ZZ:ZZ" -> extract "HH:mm")
    const depTime = departurTime.substring(0, 5);
    const arrTime = arrivalTime.substring(0, 5);

    const depDateTime = moment(
      `${departureDate} ${depTime}`,
      "YYYY-MM-DD HH:mm"
    );
    const arrDateTime = moment(`${arrivalDate} ${arrTime}`, "YYYY-MM-DD HH:mm");

    if (!depDateTime.isValid() || !arrDateTime.isValid()) return "Invalid time";

    const diffMinutes = arrDateTime.diff(depDateTime, "minutes");
    if (diffMinutes < 0) return "Invalid time range";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  function processFlightData(flightValidData, flightsData) {
    // Parse the flight data
    const flightValid = flightValidData;
    const flights = flightsData;

    // Extract relevant information
    const flightArray = [];

    // Assuming there are two flights, round trip: departure and return
    for (let i = 0; i < flights.itenaryGroupData.legDescriptions.length; i++) {
      const flight = flights.itenaryGroupData.legDescriptions[i];
      // const flightInfo = flights.dataFlight[0].pricingInformation[0];
      // console.log("-------------------", flightsData?.scheduleData[i][0]);
      const flightDetails = {
        departure_time: convertToActualTimeMeta(
          flightsData?.scheduleData[i][0]?.departure?.time
        ), // From legDescriptions
        // arrival_time: flight?.scheduleData[i]?.arrival?.time, // From legDescriptions
        arrival_time: convertToActualTimeMeta(
          flightsData?.scheduleData[i][0]?.arrival?.time
        ), // From legDescriptions
        departureCity: flight.departureLocation, // From legDescriptions
        arrivalCity: flight.arrivalLocation, // From legDescriptions
        departure_date: flight.departureDate, // From legDescriptions
        arrival_date: flight.arrivalLocation, // From legDescriptions
        airline_logo: flightsData?.scheduleData[i][0]?.carrier?.marketing, // From legDescriptions
        stops:
          flight.departureLocation !== flight.arrivalLocation
            ? "Direct"
            : "1 stop", // Logic for direct or number of stops
        arrival_date: flight.arrivalLocation, // Placeholder for arrival date
        departure_date: flight.departureDate, // Placeholder for departure date
        arrival_airport: getAirportName(flight.arrivalLocation), // Placeholder for airport
        departure_airport: getAirportName(flight.departureLocation), // Placeholder for airport
        duration: calculateDuration(
          flightsData?.scheduleData[i][0]?.departure?.time,
          flightsData?.scheduleData[i][0]?.arrival?.time,
          flight.departureDate,
          flight.arrivalDate
        ),
        is_last_list_item:
          i === flights.itenaryGroupData.legDescriptions.length - 1,
      };

      flightArray.push(flightDetails);
    }

    return flightArray;
  }
   {console.log("Fly Details", flightValidData)}
  if (flightValidData?.trip_type != "One Way") {
    const fly_details = processFlightData(flightValidData, flightsData);
    return (
      <div className={`card p-3 ${styles.card}`}>
       
        {fly_details.map((fly) => (
          <div
            key={fly.departure_airport + fly.arrival_airport}
            className="container-fluid p-0"
          >
            <div className="row g-3 w-100">
              {/* First Cell: Logo and Flight Code */}
              <div className="col-12 col-lg-2">
                <div className="d-flex flex-row flex-md-column align-items-center gap-3">
                  <div
                    className="border rounded d-flex align-items-center justify-content-center"
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#ed4242",
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center fw-bold"
                      style={{ backgroundColor: "#ed4242", color: "white" }}
                    >
                      {fly.airline_logo}
                    </div>
                  </div>
                  {/* <div className="fw-bold">{fly.airline_logo}</div> */}
                </div>
              </div>

              {/* Second Cell: Flight Info */}
              <div className="col-12 col-lg-8 d-flex flex-column justify-content-between">
                <div className="row g-2">
                  {/* Departure Info */}
                  <div className="col-4 col-lg-3">
                    <div className="d-flex flex-column">
                      <span className="fs-4 fw-semibold">
                        {fly.departure_time}
                      </span>
                      <small className="text-muted">{fly.departure_date}</small>
                      <span className="fw-medium">{fly.departure_airport}</span>
                      {/* <small className="text-muted">{departureTerminal}</small> */}
                      <small className="text-muted">
                        {fly.departure_airport}
                      </small>
                    </div>
                  </div>

                  {/* Duration Info */}
                  <div className="col-4 col-lg-6">
                    <div className="d-flex flex-column align-items-center h-100 justify-content-center">
                      <small className="text-primary">{fly.duration}</small>
                      <div className="position-relative my-2 w-100">
                        <hr className="position-absolute top-50 w-100 m-0" />
                        <div className="text-center">
                          <small
                            className="text-primary bg-white px-2 position-relative"
                            style={{ zIndex: 1 }}
                          >
                            {fly.stops}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrival Info */}
                  <div className="col-4 col-lg-3 d-flex justify-content-start">
                    <div className="d-flex flex-column">
                      <span className="fs-4 fw-semibold">
                        {fly.arrival_time}
                      </span>
                      <small className="text-muted">{fly.arrival_date}</small>
                      <span className="fw-medium">{fly.arrival_airport}</span>
                      {/* <small className="text-muted">{arrivalTerminal}</small> */}
                      <small className="text-muted">
                        {fly.arrival_airport}
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Third Cell: Price and Button */}
              <div
                className="col-12 col-lg-2"
                style={{ display: fly.is_last_list_item ? "block" : "none" }}
              >
                <div className="d-flex flex-row flex-md-column justify-content-between align-items-md-end h-100">
                  <span className="fs-5 fw-semibold">{price}</span>
                  <button onClick={() => handleMoreInfo()}className={styles.detailBtn}>More Info</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`card p-3 ${styles.card}`}>
      <div className="container-fluid p-0">
        <div className="row g-3 w-100">
          {/* First Cell: Logo and Flight Code */}
          <div className="col-12 col-lg-2">
            <div className="d-flex flex-row flex-md-column align-items-center gap-3">
              <div
                className="border rounded d-flex align-items-center justify-content-center"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: "#ed4242",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center fw-bold"
                  style={{ backgroundColor: "#ed4242", color: "white" }}
                >
                  {flightsData?.flightCodes?.[0] || ""}
                </div>
              </div>
              <div className="fw-bold">
                {flightsData?.flightCodes?.[0] || ""}
              </div>
            </div>
          </div>

          {/* Second Cell: Flight Info */}
          <div className="col-12 col-lg-8 d-flex flex-column justify-content-between">
            <div className="row g-2">
              {/* Departure Info */}
              <div className="col-4 col-lg-3">
                <div className="d-flex flex-column">
                  <span className="fs-4 fw-semibold">{departureTime}</span>
                  <small className="text-muted">{depDate}</small>
                  <span className="fw-medium">{departureCityLoc}</span>
                  <small className="text-muted">{departureCity}</small>
                    <small className="text-muted"> {departureTerminal ? `Terminal ${departureTerminal}` : `Terminal yes to be decided`}</small>

                </div>
              </div>

              {/* Duration Info */}
              <div className="col-4 col-lg-6">
                <div className="d-flex flex-column align-items-center h-100 justify-content-center">
                  <small className="text-primary">{duration}</small>
                  <div className="position-relative my-2 w-100">
                    <hr className="position-absolute top-50 w-100 m-0" />
                    <div className="text-center">
                      <small
                        className="text-primary bg-white px-2 position-relative"
                        style={{ zIndex: 1 }}
                      >
                        {flightsData?.scheduleData[0].stopCount > 0
                          ? flightsData?.scheduleData[0].stopCount + " stops"
                          : "Direct Flight"}
                      </small>
                        <small
                        className="text-primary bg-white px-2 position-relative"
                        style={{ zIndex: 1 }}
                      >
                       {hours}h {minutes}m`
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrival Info */}
              <div className="col-4 col-lg-3 d-flex justify-content-start">
                <div className="d-flex flex-column">
                  <span className="fs-4 fw-semibold">{arrivalTime}</span>
                  <small className="text-muted">{arrDate}</small>
                  <span className="fw-medium">{arrivalCityLoc}</span>
                  <small className="text-muted">{arrivalCity}</small>
                  <small className="text-muted"> {arrivalTerminal ? `Terminal ${arrivalTerminal}` : `Terminal yes to be decided`}</small>

                </div>
              </div>
            </div>
          </div>

          {/* Third Cell: Price and Button */}
          <div className="col-12 col-lg-2">
            <div className="d-flex flex-row flex-md-column justify-content-between align-items-md-end h-100">
              <span className="fs-5 fw-semibold">{price}</span>
              <button onClick={() => handleMoreInfo()} className={styles.detailBtn}>More Info</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;
