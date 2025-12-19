import React from "react";
import { Plane, Clock, MapPin } from "lucide-react";
import { getAirportName, getFlightNameMeta } from "../../GlobalFunctions/flightsMetaFunction";

// Mock functions - replace these with your actual implementations
// const getAirportName = (code) => {
//   const airports = {
//     'DEL': 'Indira Gandhi International',
//     'BOM': 'Chhatrapati Shivaji International',
//     'BLR': 'Kempegowda International',
//     'MAA': 'Chennai International',
//     'CCU': 'Netaji Subhas Chandra Bose International',
//     'HYD': 'Rajiv Gandhi International',
//     'AMD': 'Sardar Vallabhbhai Patel International',
//     'COK': 'Cochin International',
//     'GOI': 'Goa International',
//     'PNQ': 'Pune Airport',
//     'LHR': 'Heathrow',
//     'JFK': 'John F. Kennedy International',
//     'LAX': 'Los Angeles International',
//     'DXB': 'Dubai International',
//     'SIN': 'Singapore Changi',
//   };
//   return airports[code] || `${code} Airport`;
// };

// const getFlightNameMeta = (code) => {
//   const airlines = {
//     'AI': 'Air India',
//     '6E': 'IndiGo',
//     'UK': 'Vistara',
//     'SG': 'SpiceJet',
//     'G8': 'GoAir',
//     'I5': 'AirAsia India',
//     '9W': 'Jet Airways',
//     'EK': 'Emirates',
//     'QR': 'Qatar Airways',
//     'EY': 'Etihad Airways',
//   };
//   return airlines[code] || code;
// };

const FlightCard = ({ data, totalDuration, detailPage = false }) => {
  const { schedules } = data;

  // Helper functions
  const formatElapsedTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.slice(0, 5);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  // Calculate layover details for multi-segment flights
  const calculateLayoverDetails = () => {
    if (schedules.length <= 1) return [];

    return schedules.slice(0, -1).map((flight, index) => {
      const nextFlight = schedules[index + 1];
      
      // Simple layover calculation
      const arrivalTime = new Date(`${flight.arrival.arrivalDate}T${flight.arrival.time}`);
      const departureTime = new Date(`${nextFlight.departure.departureDate}T${nextFlight.departure.time}`);
      const layoverMinutes = (departureTime - arrivalTime) / (1000 * 60);
      
      const layoverHours = Math.floor(layoverMinutes / 60);
      const remainingMinutes = Math.floor(layoverMinutes % 60);

      return {
        airport: `${getAirportName(flight.arrival.airport)}`,
        duration: `${layoverHours}h ${remainingMinutes}m`,
        airportCode: flight.arrival.airport,
        cityName: flight.arrival.city,
        terminal: flight.arrival.terminal || "",
      };
    });
  };

  const firstFlight = schedules[0];
  const lastFlight = schedules[schedules.length - 1];
  const transitDetails = calculateLayoverDetails();

  const getMarketingNumbers = () => {
    return schedules.map((flight) => 
      `${flight.carrier.marketing} ${flight.carrier.marketingFlightNumber}`
    ).join(" | ");
  };

  const dataSet = {
    flightNumber: getMarketingNumbers(),
    departureCity: firstFlight.departure.airport,
    departureTerminal: firstFlight.departure.terminal || "",
    arrivalCity: lastFlight.arrival.airport,
    arrivalTerminal: lastFlight.arrival.terminal || "",
    arrivalTime: formatTime(lastFlight.arrival.time),
    departureTime: formatTime(firstFlight.departure.time),
    stopCount: schedules.length > 1 ? `${schedules.length - 1} Stop${schedules.length > 2 ? 's' : ''}` : "Non Stop",
    duration: formatElapsedTime(totalDuration),
    depDate: formatDate(firstFlight.departure.departureDate),
    arrDate: formatDate(lastFlight.arrival.arrivalDate),
    arrivalCityLoc: getAirportName(lastFlight.arrival.airport),
    departureCityLoc: getAirportName(firstFlight.departure.airport),
    transitDetails: transitDetails,
  };

  const airlineData = [...new Set(schedules.map((s) => s.carrier.marketing))].map((code) => ({
    carrier: {
      marketing: code,
      operatingFlightNumber: schedules.find((s) => s.carrier.marketing === code).carrier.operatingFlightNumber,
    },
    name: getFlightNameMeta(code),
  }));

  // Improved compact styles
  const containerStyle = {
    backgroundColor: '#ffffff',
    padding: detailPage ? '16px' : '12px',
    marginBottom: detailPage ? '0' : '6px',
    borderRadius: detailPage ? '0' : '12px',
    border: detailPage ? 'none' : '1px solid #e2e8f0',
    boxShadow: detailPage ? 'none' : '0 1px 3px rgba(0,0,0,0.1)',
  };

  const timelineRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: detailPage ? '12px' : '8px',
    gap: '12px',
  };

  const terminalColumnStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: '85px',
    flex: '0 0 auto',
  };

  const terminalColumnRightStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: '85px',
    flex: '0 0 auto',
  };

  const timeTextStyle = {
    fontSize: detailPage ? '18px' : '18px',
    fontWeight: '700',
    color: '#ed4242',
    marginBottom: '1px',
    lineHeight: '1.2',
  };

  const dateTextStyle = {
    fontSize: '10px',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '3px',
  };

  const cityTextStyle = {
    fontSize: detailPage ? '15px' : '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '1px',
    lineHeight: '1.2',
  };

  const airportTextStyle = {
    fontSize: '9px',
    color: '#64748b',
    marginBottom: '4px',
    lineHeight: '1.3',
    textAlign: 'left',
    maxWidth: '85px',
  };

  const airportTextRightStyle = {
    fontSize: '9px',
    color: '#64748b',
    marginBottom: '4px',
    lineHeight: '1.3',
    textAlign: 'right',
    maxWidth: '85px',
  };

  const terminalBadgeStyle = {
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '8px',
    color: '#64748b',
    fontWeight: '600',
  };

  const flightTrackerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: '100px',
  };

  const durationStyle = {
    fontSize: '11px',
    color: '#ed4242',
    fontWeight: '600',
    marginBottom: '6px',
  };

  const flightLineStyle = {
    width: '100%',
    height: '2px',
    backgroundColor: '#cbd5e1',
    position: 'relative',
    marginBottom: '6px',
  };

  const planeIconStyle = {
    position: 'absolute',
    top: '-8px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#ffffff',
    color: '#ed4242',
    padding: '2px',
    borderRadius: '50%',
  };

  const flightInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: detailPage ? '12px' : '6px',
    borderTop: detailPage ? '1px solid #f1f5f9' : 'none',
  };

  const airlinesContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const airlineRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const airlineLogoStyle = {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const airlineNameStyle = {
    fontSize: '10px',
    color: '#ed4242',
    fontWeight: '500',
  };

  const flightNumberStyle = {
    fontSize: detailPage ? '12px' : '10px',
    color: '#64748b',
    fontWeight: '600',
  };

  const stopsBadgeStyle = {
    fontSize: '10px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: dataSet.stopCount === "Non Stop" ? '#059669' : '#ed4242',
    padding: '3px 8px',
    borderRadius: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const layoverChipStyle = {
    fontSize: '8px',
    color: '#ed4242',
    backgroundColor: '#fef2f2',
    padding: '2px 6px',
    borderRadius: '6px',
    marginTop: '3px',
    fontWeight: '500',
  };

  // Render layover information
  const renderLayovers = () => {
    if (!transitDetails || transitDetails.length === 0) return null;

    return (
      <div style={{ marginTop: '4px', textAlign: 'center' }}>
        {transitDetails.map((transit, index) => (
          <div key={index} style={layoverChipStyle}>
            {transit.duration} in {transit.airportCode}
          </div>
        ))}
      </div>
    );
  };

  if (detailPage) {
    return (
      <div style={containerStyle}>
        <div style={timelineRowStyle}>
          <div style={terminalColumnStyle}>
            <div style={timeTextStyle}>{dataSet.departureTime}</div>
            <div style={dateTextStyle}>{dataSet.depDate}</div>
            <div style={cityTextStyle}>{dataSet.departureCity}</div>
            <div style={airportTextStyle}>{dataSet.departureCityLoc}</div>
            {dataSet.departureTerminal && (
              <div style={terminalBadgeStyle}>
                T{dataSet.departureTerminal}
              </div>
            )}
          </div>

          <div style={flightTrackerStyle}>
            <div style={durationStyle}>{dataSet.duration}</div>
            <div style={flightLineStyle}>
              <Plane size={14} style={planeIconStyle} />
            </div>
            <div style={stopsBadgeStyle}>{dataSet.stopCount}</div>
            {renderLayovers()}
          </div>

          <div style={terminalColumnRightStyle}>
            <div style={timeTextStyle}>{dataSet.arrivalTime}</div>
            <div style={dateTextStyle}>{dataSet.arrDate}</div>
            <div style={cityTextStyle}>{dataSet.arrivalCity}</div>
            <div style={airportTextRightStyle}>{dataSet.arrivalCityLoc}</div>
            {dataSet.arrivalTerminal && (
              <div style={terminalBadgeStyle}>
                T{dataSet.arrivalTerminal}
              </div>
            )}
          </div>
        </div>

        <div style={flightInfoStyle}>
          <div style={airlinesContainerStyle}>
            {airlineData.map((airline, index) => (
              <div key={index} style={airlineRowStyle}>
                <div style={airlineLogoStyle}>
                  <Plane size={10} style={{ color: '#ed4242' }} />
                </div>
                <span style={airlineNameStyle}>{airline.name}</span>
              </div>
            ))}
          </div>
          <div style={flightNumberStyle}>{dataSet.flightNumber}</div>
        </div>
      </div>
    );
  }

  // Compact layout for list view
  return (
    <div style={containerStyle}>
      <div style={timelineRowStyle}>
        <div style={terminalColumnStyle}>
          <div style={timeTextStyle}>{dataSet.departureTime}</div>
          <div style={dateTextStyle}>{dataSet.depDate}</div>
          <div style={cityTextStyle}>{dataSet.departureCity}</div>
          <div style={airportTextStyle}>{dataSet.departureCityLoc}</div>
          {dataSet.departureTerminal && (
            <div style={terminalBadgeStyle}>
              T{dataSet.departureTerminal}
            </div>
          )}
        </div>

        <div style={flightTrackerStyle}>
          <div style={durationStyle}>{dataSet.duration}</div>
          <div style={flightLineStyle}>
            <Plane size={14} style={planeIconStyle} />
          </div>
          <div style={stopsBadgeStyle}>{dataSet.stopCount}</div>
          {renderLayovers()}
        </div>

        <div style={terminalColumnRightStyle}>
          <div style={timeTextStyle}>{dataSet.arrivalTime}</div>
          <div style={dateTextStyle}>{dataSet.arrDate}</div>
          <div style={cityTextStyle}>{dataSet.arrivalCity}</div>
          <div style={airportTextRightStyle}>{dataSet.arrivalCityLoc}</div>
          {dataSet.arrivalTerminal && (
            <div style={terminalBadgeStyle}>
              T{dataSet.arrivalTerminal}
            </div>
          )}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '6px',
      }}>
        <div style={airlinesContainerStyle}>
          {airlineData.map((airline, index) => (
            <div key={index} style={airlineRowStyle}>
              <div style={airlineLogoStyle}>
                <Plane size={10} style={{ color: '#ed4242' }} />
              </div>
              <span style={airlineNameStyle}>{airline.name}</span>
            </div>
          ))}
        </div>
        <div style={flightNumberStyle}>{dataSet.flightNumber}</div>
      </div>
    </div>
  );
};


export default FlightCard