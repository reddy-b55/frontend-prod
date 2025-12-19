import React, { useContext, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plane,
  Clock,
  CreditCard,
  Tag,
  DollarSign,
  Receipt,
  Package,
  AlertTriangle,
  Route,
  Luggage,
} from "lucide-react";
import FlightCard from "./FlightCard";
import { revalidationResell, getFlightNameMeta } from "../../GlobalFunctions/flightsMetaFunction";
import CurrencyConverter from "../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { AppContext } from "../../pages/_app";
import Image from "next/image";
import qrCode from "../../public/assets/images/qr/logoNew.png";

const FlightMainMetaCard = ({ item, bookingPage = false, searchParams }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [revalError, setReValError] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedFlightTab, setSelectedFlightTab] = useState(0);
  const [selectedPaxTab, setSelectedPaxTab] = useState(0);
  const [selectedBaggagePaxTab, setSelectedBaggagePaxTab] = useState(0);
  const [showAppDownloadModal, setShowAppDownloadModal] = useState(false);
  const { userStatus, baseCurrencyValue, baseLocation, baseUserId } =
    useContext(AppContext);

  const formatCurrency = (amount, currency = "USD") => {
    return `${currency} ${amount?.toLocaleString()}`;
  };

  // Function to get airline logo URL
  const getAirlineLogo = (airlineCode) => {
    // You can replace this with your actual airline logo service
    return `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`;
  };

  // Function to get unique airline codes from flight data
  const getAirlineCodes = () => {
    const codes = new Set();
    item?.legs?.forEach(leg => {
      leg?.schedules?.forEach(schedule => {
        if (schedule?.carrier?.marketing) {
          codes.add(schedule.carrier.marketing);
        }
      });
    });
    return Array.from(codes);
  };

  // Function to get airline names
  const getAirlineNames = () => {
    const airlineNames = new Set();
    item?.legs?.forEach(leg => {
      leg?.schedules?.forEach(schedule => {
        if (schedule?.carrier?.marketing) {
          // Use the proper getFlightNameMeta function
          const airlineName = getFlightNameMeta(schedule.carrier.marketing) || schedule.carrier.marketing;
          airlineNames.add(airlineName);
        }
      });
    });
    return Array.from(airlineNames);
  };

  console.log("FlightMainMetaCard item:", item);

  const handleViewDetails = async () => {
    if (showDetails) {
      setShowDetails(false);
      return;
    }

    setLoading(true);

    // Mock revalidation call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const dataSet = {
        searchCriteria: JSON.stringify(searchParams),
        flightData: JSON.stringify(item),
        provider: item?.provider,
      };
      revalidationResell(dataSet).then((response) => {
        console.log("Revalidation response:", response);
        setDetailsData(response?.revalidationData);
        setReValError(false);
      });
    } catch (error) {
      setReValError(true);
    }

    setLoading(false);
    setShowDetails(true);
  };

  // Tab configuration with your brand colors
  const sectionTabs = [
    { id: 0, name: "Price Breakdown", icon: "dollar-sign", color: "#ed4242" },
    { id: 1, name: "Itinerary", icon: "route", color: "#F15F79" },
    { id: 2, name: "Taxes & Fees", icon: "receipt", color: "#B24592" },
    { id: 3, name: "Baggage", icon: "suitcase", color: "#ed4242" },
    { id: 4, name: "Fare Rules", icon: "exclamation-triangle", color: "#F15F79" }
  ];

  // Helper functions for tabs
  const formatRoute = (leg) => {
    if (!leg?.legDescription) return "Route";
    const { departureLocation, arrivalLocation } = leg.legDescription;
    return `${departureLocation} ✈ ${arrivalLocation}`;
  };

  const formatTabDate = (dateString) => {
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return {
      dayName: days[date.getDay()],
      day: date.getDate(),
      month: months[date.getMonth()],
    };
  };

  const getPassengerTypeName = (type, number) => {
    switch (type) {
      case 'ADT': return `Adult${number > 1 ? ` (${number})` : ''}`;
      case 'CNN': return `Child${number > 1 ? ` (${number})` : ''}`;
      case 'INF': return `Infant${number > 1 ? ` (${number})` : ''}`;
      case 'STU': return `Student${number > 1 ? ` (${number})` : ''}`;
      default: return type;
    }
  };

  const getDetailedBaggageInfo = (allowance) => {
    if (allowance?.weight && allowance?.unit) {
      return `${allowance.weight} ${allowance.unit} included`;
    }
    if (allowance?.pieceCount > 0) {
      return `${allowance.pieceCount} PCS`;
    }
    if (allowance?.description1) {
      const weightMatch = allowance.description1.match(/UP TO (\d+)\s*(POUNDS?|KILOGRAMS?)/i);
      if (weightMatch) {
        const weight = weightMatch[1];
        const unit = weightMatch[2].toLowerCase();
        return `Up to ${weight} ${unit} included`;
      }
      return allowance.description1.toLowerCase();
    }
    return "0KG";
  };

  const getSectorName = (segments) => {
    if (!segments || segments.length === 0) return 'Unknown Sector';
    
    // Get segment IDs and map them to actual flight legs
    const segmentIds = segments.map(seg => seg.id).sort();
    
    // Get the legs data from detailsData or item
    const legs = detailsData?.legs || item?.legs;
    if (!legs || legs.length === 0) return 'Unknown Sector';
    
    // Find the corresponding leg for these segments
    const matchingLeg = legs.find((leg, legIndex) => {
      // Check if this leg's segment indices match the baggage segments
      const legSegmentCount = leg.schedules ? leg.schedules.length : 0;
      const legStartIndex = legs.slice(0, legIndex).reduce((acc, prevLeg) => acc + (prevLeg.schedules ? prevLeg.schedules.length : 0), 0);
      const legEndIndex = legStartIndex + legSegmentCount - 1;
      
      // Check if any of the baggage segment IDs fall within this leg's range
      return segmentIds.some(segId => segId >= legStartIndex && segId <= legEndIndex);
    });
    
    if (matchingLeg && matchingLeg.legDescription) {
      const { departureLocation, arrivalLocation } = matchingLeg.legDescription;
      return `${departureLocation} - ${arrivalLocation}`;
    }
    
    // Fallback: try to extract from segment data or use segment numbers
    return `Segments ${segmentIds.map(id => id + 1).join(', ')}`;
  };

  const groupBaggageBySector = (baggageList) => {
    const sectorGroups = {};
    
    baggageList.forEach(baggage => {
      const sectorKey = getSectorName(baggage.segments);
      
      if (!sectorGroups[sectorKey]) {
        sectorGroups[sectorKey] = [];
      }
      sectorGroups[sectorKey].push(baggage);
    });
    
    return sectorGroups;
  };

  // Render section tab buttons
  const renderSectionTabButton = (tab, index) => {
    const isSelected = selectedTab === index;
    
    const getIconComponent = (iconName) => {
      switch (iconName) {
        case "dollar-sign": return DollarSign;
        case "route": return Route;
        case "receipt": return Receipt;
        case "suitcase": return Package;
        case "exclamation-triangle": return AlertTriangle;
        default: return DollarSign;
      }
    };
    
    const IconComponent = getIconComponent(tab.icon);

    return (
      <button
        key={index}
        style={{
          minWidth: '100px',
          padding: '8px 14px',
          margin: '0 4px',
          borderRadius: '12px',
          backgroundColor: isSelected ? tab.color : '#FFFFFF',
          border: `2px solid ${isSelected ? tab.color : '#F1F5F9'}`,
          textAlign: 'center',
          cursor: 'pointer',
          color: isSelected ? '#FFFFFF' : '#64748B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
          transition: 'all 0.3s ease',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: isSelected ? `0 4px 12px ${tab.color}40` : '0 2px 4px rgba(0,0,0,0.05)',
          transform: isSelected ? 'translateY(-2px)' : 'none'
        }}
        onClick={() => setSelectedTab(index)}
      >
        <IconComponent size={14} color={isSelected ? '#FFFFFF' : tab.color} />
        <span>{tab.name}</span>
      </button>
    );
  };

  // Render flight tab buttons for itinerary
  const renderFlightTabButton = (leg, index) => {
    const isSelected = selectedFlightTab === index;
    const tabDate = formatTabDate(leg.legDescription.departureDate);
    const route = formatRoute(leg);

    return (
      <button
        key={index}
        style={{
          flex: 1,
          padding: '10px 16px',
          margin: '0 4px',
          borderRadius: '10px',
          backgroundColor: isSelected ? '#ed4242' : '#FFFFFF',
          border: `2px solid ${isSelected ? '#ed4242' : '#F1F5F9'}`,
          textAlign: 'center',
          cursor: 'pointer',
          color: isSelected ? '#FFFFFF' : '#334155',
          transition: 'all 0.3s ease',
          fontSize: '13px',
          fontWeight: '600',
          boxShadow: isSelected ? '0 4px 12px rgba(237, 66, 66, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
        onClick={() => setSelectedFlightTab(index)}
      >
        <div style={{ marginBottom: '2px' }}>
          {route}
        </div>
        <div style={{
          fontSize: '9px',
          color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#64748B',
          fontWeight: '500'
        }}>
          {tabDate.dayName}, {tabDate.day} {tabDate.month}
        </div>
      </button>
    );
  };

  // Calculate layover time between segments
  const calculateLayoverTime = (currentSchedule, nextSchedule) => {
    if (!currentSchedule || !nextSchedule) return null;
    
    const arrivalDateTime = new Date(`${currentSchedule.arrival.arrivalDate}T${currentSchedule.arrival.time}`);
    const departureDateTime = new Date(`${nextSchedule.departure.departureDate}T${nextSchedule.departure.time}`);
    
    const layoverMinutes = Math.floor((departureDateTime - arrivalDateTime) / (1000 * 60));
    
    if (layoverMinutes <= 0) return null;
    
    const hours = Math.floor(layoverMinutes / 60);
    const minutes = layoverMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  // Render flight segments for itinerary
  const renderFlightSegments = (leg) => {
    return leg.schedules.map((schedule, index) => {
      const segmentData = {
        schedules: [schedule],
        legDescription: {
          ...leg.legDescription,
          totalDuration: schedule.elapsedTime,
        },
      };

      const nextSchedule = leg.schedules[index + 1];
      const layoverDuration = nextSchedule ? calculateLayoverTime(schedule, nextSchedule) : null;

      return (
        <div key={index}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 16px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #F1F5F9',
            borderRadius: '8px 8px 0 0'
          }}>
            <Plane size={14} color="#6366F1" />
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              marginLeft: '6px'
            }}>
              {getFlightNameMeta(schedule.carrier.marketing) || schedule.carrier.marketing} {schedule.carrier.marketingFlightNumber}
            </span>
          </div>

          <FlightCard
            data={segmentData}
            totalDuration={schedule.elapsedTime}
            detailPage={true}
            index={selectedTab}
          />

          {index < leg.schedules.length - 1 && layoverDuration && (
            <div style={{ padding: '6px 12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '6px',
                borderLeft: '3px solid #6366F1'
              }}>
                <Clock size={12} color="#64748B" />
                <span style={{
                  fontSize: '11px',
                  color: '#64748B',
                  fontWeight: '500',
                  marginLeft: '6px'
                }}>
                  Layover {layoverDuration} in {schedule?.arrival?.airport}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  // Content renderers for each tab
  const renderPricingBreakdown = () => {
    if (!detailsData?.pricing) return <div>No pricing data available</div>;
    
    const pricing = detailsData.pricing;
    
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        padding: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontSize: '13px', color: '#64748B' }}>Base Fare</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
            {CurrencyConverter(pricing.currency, pricing.actualBeforeDiscount - pricing.totalTaxAmount, baseCurrencyValue)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontSize: '13px', color: '#64748B' }}>Taxes & Fees</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
            {CurrencyConverter(pricing.currency, pricing.totalTaxAmount, baseCurrencyValue)}
          </span>
        </div>
        {pricing.discountApplicable && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <span style={{ fontSize: '13px', color: '#64748B' }}>Total Without Discount</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366F1' }}>
                {CurrencyConverter(pricing.currency, pricing.actualBeforeDiscount, baseCurrencyValue)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
              <span style={{ fontSize: '13px', color: '#ed4242' }}>Discount Amount</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ed4242' }}>
                -{CurrencyConverter(pricing.discountCurrency, pricing.discountAmount, baseCurrencyValue)}
              </span>
            </div>
          </>
        )}
        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '6px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Total Amount</span>
          <span style={{ fontSize: '16px', fontWeight: '700', color: '#ed4242' }}>
            {CurrencyConverter(pricing.currency, pricing.totalPrice, baseCurrencyValue)}
          </span>
        </div>
        
        {/* Bank Providers */}
        {detailsData.bankProviders?.length > 0 && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              {detailsData.bankProviders.map((bank, index) => (
                <div key={index} style={{ width: '60px', height: '30px', backgroundColor: '#FFFFFF', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={bank.iconUrl} alt={`${bank.name} logo`} style={{ maxWidth: '50px', maxHeight: '25px', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B' }}>
              {/* You will get this discount only if you pay by these cards */}
              {detailsData?.bankProviders?.[0]?.["infoLabel"]}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItinerary = () => {
    if (!detailsData?.legs) return <div>No flight data available</div>;
    
    const legs = detailsData.legs;
    const currentLeg = legs[selectedFlightTab];

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Flight Selection Tabs */}
        {legs.length > 1 && (
          <div style={{
            display: 'flex',
            padding: '8px 12px',
            backgroundColor: '#F8FAFC',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            {legs.map((leg, index) => renderFlightTabButton(leg, index))}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px', borderBottom: '1px solid #F1F5F9' }}>
          <Route size={16} color="#1976D2" />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1E293B', marginBottom: '2px' }}>
              {formatRoute(currentLeg)}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '500' }}>
              {currentLeg.schedules.length} {currentLeg.schedules.length === 1 ? "Flight" : "Flights"} • 
              {Math.floor(currentLeg.legDescription.totalDuration / 60)}h {currentLeg.legDescription.totalDuration % 60}m
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF' }}>
          {renderFlightSegments(currentLeg)}
        </div>
      </div>
    );
  };

  const renderTaxesBreakdown = () => {
    if (!detailsData?.taxes) return <div>No tax data available</div>;
    
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        padding: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {detailsData.taxes.map((tax, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0',
            borderBottom: index < detailsData.taxes.length - 1 ? '1px solid #F8FAFC' : 'none'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                {tax.code}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                {tax.description}
              </div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#ed4242' }}>
              {CurrencyConverter(tax.currency, tax.amount, baseCurrencyValue)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderBaggageInfo = () => {
    // Get baggage information from morePricingInfo if available
    const { morePricingInfo } = detailsData || {};
    
    let passengerBaggageData = [];
    
    if (morePricingInfo && morePricingInfo.fare && morePricingInfo.fare.passengerInfoList) {
      // Extract baggage info from passenger info list
      passengerBaggageData = morePricingInfo.fare.passengerInfoList.map((passenger, passengerIndex) => {
        const passengerInfo = passenger.passengerInfo;
        return {
          passengerType: passengerInfo.passengerType,
          passengerNumber: passengerInfo.passengerNumber,
          baggageInformation: passengerInfo.baggageInformation || []
        };
      });
    }

    if (passengerBaggageData.length === 0) {
      // Fallback to old structure if available
      if (detailsData?.baggageInformation && detailsData.baggageInformation.length > 0) {
        passengerBaggageData = [{
          passengerType: 'ADT',
          passengerNumber: 1,
          baggageInformation: detailsData.baggageInformation
        }];
      } else {
        return (
          <div style={{
            backgroundColor: '#FFFFFF',
            margin: '8px 12px',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic' }}>
              No baggage information available
            </span>
          </div>
        );
      }
    }

    // Get unique passenger types for tabs
    const passengerTypes = [...new Set(passengerBaggageData.map(p => p.passengerType))];
    const currentPassenger = passengerBaggageData.find(p => p.passengerType === passengerTypes[selectedBaggagePaxTab]);
    const sectorGroupedBaggage = currentPassenger ? groupBaggageBySector(currentPassenger.baggageInformation) : {};

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Passenger Type Tabs */}
        {passengerTypes.length > 1 && (
          <div style={{
            display: 'flex',
            padding: '8px',
            backgroundColor: '#F8FAFC',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            borderBottom: '1px solid #E2E8F0'
          }}>
            {passengerTypes.map((paxType, index) => {
              const isSelected = selectedBaggagePaxTab === index;
              const passenger = passengerBaggageData.find(p => p.passengerType === paxType);
              
              return (
                <button
                  key={index}
                  style={{
                    backgroundColor: isSelected ? '#ed4242' : '#FFFFFF',
                    border: `2px solid ${isSelected ? '#ed4242' : '#F1F5F9'}`,
                    color: isSelected ? '#FFFFFF' : '#334155',
                    fontSize: '11px',
                    fontWeight: '600',
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    margin: '0 3px',
                    flex: 1,
                    transition: 'all 0.3s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(237, 66, 66, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => setSelectedBaggagePaxTab(index)}
                >
                  {getPassengerTypeName(passenger.passengerType, passenger.passengerNumber)}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ padding: '8px 6px' }}>
          {Object.keys(sectorGroupedBaggage).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic' }}>
                No baggage information available for this passenger type
              </span>
            </div>
          ) : (
            Object.entries(sectorGroupedBaggage).map(([sectorName, baggageList], sectorIndex) => (
              <div key={sectorIndex} style={{ marginBottom: '12px' }}>
                {/* Sector Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  marginBottom: '6px',
                  borderLeft: '3px solid #6366F1'
                }}>
                  <Route size={12} color="#6366F1" style={{ marginRight: '6px' }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    {sectorName}
                  </span>
                </div>
                
                {/* Baggage items for this sector */}
                {baggageList.map((baggage, baggageIndex) => (
                  <div key={baggageIndex} style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 0',
                    borderBottom: baggageIndex < baggageList.length - 1 ? '1px solid #F8FAFC' : 'none'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      marginRight: '6px'
                    }}>
                      <Package size={14} color="#8B5CF6" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', lineHeight: '14px' }}>
                        {baggage.airlineCode} • {baggage.provisionType === "A" ? "Checked Baggage" : "Carry-on"}
                      </div>
                      <div style={{ fontSize: '10px', color: '#ed4242', marginTop: '0', lineHeight: '12px' }}>
                        {getDetailedBaggageInfo(baggage.allowance)}
                      </div>
                      {baggage.allowance.description2 && (
                        <div style={{ fontSize: '9px', color: '#64748B', marginTop: '0', lineHeight: '11px' }}>
                          {baggage.allowance.description2.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderFareRules = () => {
    const { morePricingInfo } = detailsData || {};

    if (!morePricingInfo || !morePricingInfo.fare || !morePricingInfo.fare.passengerInfoList) {
      // Fallback to old penaltiesInfo structure
      const penaltiesInfo = detailsData?.penaltiesInfo;
      
      if (!penaltiesInfo?.penalties) {
        return (
          <div style={{
            backgroundColor: '#FFFFFF',
            margin: '8px 12px',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}>
            <span style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic' }}>
              No fare rules information available
            </span>
          </div>
        );
      }

    const getPenaltyColor = (refundable, changeable) => {
      return (refundable || changeable) ? "#ed4242" : "#B24592";
    };      const getPenaltyStatus = (penalty) => {
        if (penalty.type === "Refund") {
          return penalty.refundable ? "Refundable" : "Non-Refundable";
        } else {
          return penalty.changeable ? "Changeable" : "Non-Changeable";
        }
      };

      const getPenaltyDescription = (penalty) => {
        const timing = penalty.applicability === "Before" ? "before departure" : "after departure";
        if (penalty.type === "Refund") {
          return `Ticket ${penalty.refundable ? "can be refunded" : "cannot be refunded"} ${timing}`;
        } else {
          return `Ticket ${penalty.changeable ? "can be changed" : "cannot be changed"} ${timing}`;
        }
      };

      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '8px 12px',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          {penaltiesInfo.penalties.map((penalty, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '8px 0',
              borderBottom: index < penaltiesInfo.penalties.length - 1 ? '1px solid #F8FAFC' : 'none'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: '8px',
                marginTop: '2px'
              }}>
                <AlertTriangle size={12} color={getPenaltyColor(penalty.refundable, penalty.changeable)} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                    {penalty.type}
                  </span>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '8px',
                    backgroundColor: (penalty.refundable || penalty.changeable) ? '#DCFCE7' : '#FEE2E2',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    color: (penalty.refundable || penalty.changeable) ? '#059669' : '#DC2626'
                  }}>
                    {getPenaltyStatus(penalty)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#475569', lineHeight: '16px', marginBottom: '4px' }}>
                  {getPenaltyDescription(penalty)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Clock size={10} color="#64748B" style={{ marginRight: '4px' }} />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {penalty.applicability === "Before" ? "Before departure" : "After departure"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    const passengerInfoList = morePricingInfo.fare.passengerInfoList;

    const getPenaltyColor = (refundable, changeable) => {
      if (refundable === true || changeable === true) {
        return "#ed4242";
      } else {
        return "#B24592";
      }
    };

    const getPenaltyStatus = (penalty) => {
      if (penalty.type === "Refund") {
        return penalty.refundable ? "Refundable" : "Non-Refundable";
      } else {
        return penalty.changeable ? "Changeable" : "Non-Changeable";
      }
    };

    const getPenaltyDescription = (penalty) => {
      const timing = penalty.applicability === "Before" ? "before departure" : "after departure";
      if (penalty.type === "Refund") {
        return `Ticket ${penalty.refundable ? "can be refunded" : "cannot be refunded"} ${timing}`;
      } else {
        return `Ticket ${penalty.changeable ? "can be changed" : "cannot be changed"} ${timing}`;
      }
    };

    const currentPassengerInfo = passengerInfoList[selectedPaxTab];
    const penalties = currentPassengerInfo?.passengerInfo?.penaltiesInfo?.penalties || [];

    if (!currentPassengerInfo || !currentPassengerInfo.passengerInfo) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '8px 12px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic' }}>
            No passenger information available
          </span>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Passenger Type Tabs */}
        <div style={{
          display: 'flex',
          padding: '8px',
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          borderBottom: '1px solid #E2E8F0'
        }}>
          {passengerInfoList.map((passenger, index) => {
            if (!passenger || !passenger.passengerInfo) return null;
            
            const isSelected = selectedPaxTab === index;
            const passengerType = passenger.passengerInfo.passengerType || 'Unknown';
            const passengerCount = passenger.passengerInfo.passengerNumber || 0;
            
            return (
              <button
                key={index}
                style={{
                  backgroundColor: isSelected ? '#F15F79' : '#FFFFFF',
                  border: `2px solid ${isSelected ? '#F15F79' : '#F1F5F9'}`,
                  color: isSelected ? '#FFFFFF' : '#334155',
                  fontSize: '11px',
                  fontWeight: '600',
                  textAlign: 'center',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  margin: '0 3px',
                  flex: 1,
                  transition: 'all 0.3s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(241, 95, 121, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onClick={() => setSelectedPaxTab(index)}
              >
                {getPassengerTypeName(passengerType)} ({passengerCount})
              </button>
            );
          }).filter(Boolean)}
        </div>

        <div style={{ padding: '8px 6px' }}>
          {penalties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748B', fontStyle: 'italic' }}>
                No penalties information available for this passenger type
              </span>
            </div>
          ) : (
            penalties.map((penalty, index) => {
              if (!penalty || typeof penalty !== 'object') return null;
              
              return (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '6px 0',
                  borderBottom: index < penalties.length - 1 ? '1px solid #F8FAFC' : 'none'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: '8px',
                    marginTop: '2px'
                  }}>
                    <AlertTriangle size={12} color={getPenaltyColor(penalty.refundable, penalty.changeable)} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>
                        {penalty.type || 'Unknown'}
                      </span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '8px',
                        backgroundColor: (penalty.refundable || penalty.changeable) ? '#DCFCE7' : '#FEE2E2',
                        fontSize: '10px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        color: (penalty.refundable || penalty.changeable) ? '#059669' : '#DC2626'
                      }}>
                        {getPenaltyStatus(penalty)}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: '16px', marginBottom: '4px' }}>
                      {getPenaltyDescription(penalty)}
                    </div>

                    {penalty.amount !== undefined && penalty.amount !== null && penalty.currency && (
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#059669', marginTop: '2px', marginBottom: '2px' }}>
                        Fee: {penalty.amount === 0 ? 'Free' : CurrencyConverter(penalty.currency, penalty.amount, baseCurrencyValue)}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Clock size={10} color="#64748B" style={{ marginRight: '4px' }} />
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {penalty.applicability === "Before" ? "Before departure" : "After departure"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)
          )}
        </div>
      </div>
    );
  };

  // Main tab content renderer
  const renderSelectedTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderPricingBreakdown();
      case 1:
        return renderItinerary();
      case 2:
        return renderTaxesBreakdown();
      case 3:
        return renderBaggageInfo();
      case 4:
        return renderFareRules();
      default:
        return renderPricingBreakdown();
    }
  };

  const renderDiscountTag = (pricing) => {
    // Discount tag is now rendered inside the airline header
    return null;
  };

  const renderPricingDetails = () => {
    const pricing = item?.pricing;

    if (revalError) {
      return (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "16px",
            margin: "16px 0",
            textAlign: "center",
          }}
        >
          <div
            style={{
              color: "#dc2626",
              fontSize: "16px",
              fontWeight: "600",
              marginBottom: "8px",
            }}
          >
            Flight Not Available
          </div>
          <div
            style={{
              color: "#7f1d1d",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            We're sorry, this flight is currently not available for booking.
          </div>
          <button
            onClick={handleViewDetails}
            style={{
              backgroundColor: "#dc2626",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          padding: "16px",
          margin: "16px 0",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              borderBottom: "1px solid #e2e8f0",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Base Fare:
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#ed4242" }}
            >
              {CurrencyConverter(
                pricing?.currency,
                pricing?.actualBeforeDiscount - pricing?.totalTaxAmount,
                baseCurrencyValue
              )}
              {/* {formatCurrency(
                pricing?.actualBeforeDiscount - pricing?.totalTaxAmount,
                pricing?.currency
              )} */}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: "8px",
              borderBottom: "1px solid #e2e8f0",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              Total Tax:
            </span>
            <span
              style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}
            >
              {CurrencyConverter(
                pricing?.currency,
                pricing?.totalTaxAmount,
                baseCurrencyValue
              )}
              {/* {formatCurrency(pricing?.totalTaxAmount, pricing?.currency)} */}
            </span>
          </div>

          {pricing?.discountApplicable && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#64748b" }}>
                  Total Without Discount:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#64748b",
                    textDecoration: "line-through",
                  }}
                >
                  {CurrencyConverter(
                    pricing?.currency,
                    pricing?.actualBeforeDiscount,
                    baseCurrencyValue
                  )}
                  {/* {formatCurrency(
                    pricing?.actualBeforeDiscount,
                    pricing?.currency
                  )} */}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontSize: "14px", color: "#059669" }}>
                  Discount Amount:
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#059669",
                  }}
                >
                  -
                  {/* {formatCurrency(
                    pricing?.discountAmount,
                    pricing?.discountCurrency
                  )} */}
                  {CurrencyConverter(
                    pricing?.discountCurrency,
                    pricing?.discountAmount,
                    baseCurrencyValue
                  )}
                </span>
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "8px",
            }}
          >
            <span
              style={{ fontSize: "16px", fontWeight: "600", color: "#1e293b" }}
            >
              Total Price:
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#059669",
              }}
            >
              {CurrencyConverter(
                pricing?.currency,
                pricing?.totalPrice,
                baseCurrencyValue
              )}
              {/* {formatCurrency(pricing?.totalPrice, pricing?.currency)} */}
            </span>
          </div>
        </div>

        {/* Baggage Information */}
        {detailsData?.baggageInformation && (
          <div style={{ marginBottom: "16px" }}>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Luggage size={16} />
              Baggage Allowance
            </div>

            {detailsData?.baggageLabelFare && (
              <div
                style={{
                  fontSize: "14px",
                  color: "#3b82f6",
                  marginBottom: "12px",
                  fontWeight: "500",
                }}
              >
                {detailsData.baggageLabelFare}
              </div>
            )}

            {detailsData.baggageInformation.map((baggage, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  padding: "12px",
                  marginBottom: "8px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {console.log(baggage, "Baggage InfoooooooX")}
                  <Plane size={14} style={{ color: "#ed4242" }} />
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#1e293b",
                    }}
                  >
                    {getSimpleRoute(index)}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      backgroundColor: "#ed4242",
                      color: "#ffffff",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      marginBottom: "4px",
                    }}
                  >
                  {baggage?.allowance?.unit === undefined  ? "Not included" : baggage.allowance.weight + " " + baggage?.allowance?.unit}  
                  {/* {baggage.allowance.weight} {baggage?.allowance?.unit} */}
                  </div>
                  {baggage.allowance.description1 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        maxWidth: "150px",
                        textAlign: "right",
                      }}
                    >
                      {baggage.allowance.description1}
                    </div>
                  )}
                </div>
                
              </div>
            ))}
            
          </div>
        )}
        {/* Bnk providers */}
        { detailsData?.bankProviders?.length > 0 ? (
                   <div className="text-center text-primary mt-3" style={{backgroundColor:'#fff', padding:"3%"}}>
   <div className="flex flex-row flex-nowrap overflow-x-auto justify-start items-center gap-4" style={{display:'flex',flexDirection:'row', justifyContent:'center'}}>

      {detailsData?.bankProviders.map((bank, index) => (
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
    </div><br></br>
    <h6>You will get this discount only if you pay by these cards</h6>
  </div>
        ):("")

        }


        <button
          onClick={handleProceedToBooking}
          disabled={loading}
          style={{
            width: "100%",
            backgroundColor: "#004e64",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "12px 24px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <CreditCard size={16} />
          Proceed to Booking
        </button>
      </div>
    );
  };

  const containerStyle = {
    position: "relative",
    background: "linear-gradient(135deg, #FFFFFF 0%, #FEFEFE 100%)",
    borderRadius: "16px",
    border: "1px solid #E5E7EB",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
  };

  const mainContentStyle = {
    padding: "20px",
  };

  const bottomRowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  };

  const priceContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  };

  const originalPriceStyle = {
    fontSize: "14px",
    color: "#64748b",
    textDecoration: "line-through",
    marginBottom: "2px",
  };

  const finalPriceStyle = {
    fontSize: "28px",
    fontWeight: "600",
    background: "linear-gradient(135deg, #ed4242 0%, #F15F79 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const detailsButtonStyle = {
    background: "linear-gradient(135deg, #ed4242 0%, #F15F79 100%)",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 24px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 4px 12px rgba(237, 66, 66, 0.3)",
    transition: "all 0.3s ease",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };

  const getSimpleRoute = (index) => {
    // Get route from actual flight data
    if (!item?.legs || item.legs.length === 0) {
      return index === 0 ? "Outbound" : "Return";
    }

    const leg = item.legs[index];
    if (!leg || !leg.schedules || leg.schedules.length === 0) {
      return index === 0 ? "Outbound" : "Return";
    }

    const firstSchedule = leg.schedules[0];
    const lastSchedule = leg.schedules[leg.schedules.length - 1];

    const origin =
      firstSchedule?.departure?.airport ||
      firstSchedule?.departure?.city ||
      "N/A";
    const destination =
      lastSchedule?.arrival?.airport || lastSchedule?.arrival?.city || "N/A";

    return `${origin} ✈ ${destination}`;
  };

  // Handle app download modal
  const handleBookNowClick = () => {
    setShowAppDownloadModal(true);
  };

// App Download Modal Component
const AppDownloadModal = () => {
  if (!showAppDownloadModal) return null;

  // Prevent background scrolling when modal is open
  React.useEffect(() => {
    // Save the current scroll position
    const scrollY = window.scrollY;
    
    // Add styles to prevent scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to restore scrolling when modal closes
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [showAppDownloadModal]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      // Prevent modal background from scrolling
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '0px 20px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        height: "calc(80vh)",
        maxHeight: '600px',
        // Allow scrolling inside modal if content overflows
        // overflowY: 'auto'
      }}>
        
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>
        
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '80px',
          height: '80px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '50%',
          zIndex: 1
        }}></div>

        {/* Header section */}
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '25px' }}>
          <br></br>
          
          <h3 style={{
            fontSize: '21px',
            fontWeight: '700',
            color: '#000',
            margin: '0 0 10px 0'
          }}>
            Book Instantly with Our App
          </h3>
        </div>

        {/* QR Code Section */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          marginBottom: '25px'
        }}>
          <div style={{
            background: '#fff',
            padding: '10px',
            borderRadius: '20px',
            height: '180px',
            display: 'inline-block'
          }}>
            <Image           
              src={qrCode}           
              alt="QR Code for App Download"           
              style={{             
                height: '160px',             
                width: 'auto'
              }}         
            />
          </div>
        </div>

        {/* CTA Text */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          zIndex: 2
        }}>
          <p style={{
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#FF2D39',
            margin: '0',
            fontWeight: '500'
          }}>
            Discover the world at your fingertips – download our travel app today and turn every trip into an unforgettable adventure!
          </p>
          
          <div style={{
            marginTop: '15px',
            fontSize: '13px',
            color: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>Available on</span>
            <span style={{
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              iOS & Android
            </span>
          </div>

          {/* App Store Links - Properly Aligned */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '10px',
            marginTop: '20px'
          }}>
            {/* Google Play Store */}
            <div>
              <a
                href="https://play.google.com/store/apps/details?id=com.aahaastech.aahaas"
                target="_blank"
                rel="noopener noreferrer"
                className="app-store-link"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                  alt="Get it on Google Play"
                  style={{
                    height: '60px',
                    width: 'auto',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </a>
            </div>

            {/* Apple App Store */}
            <div>
              <a
                href="https://apps.apple.com/lk/app/aahaas-lifestyle-travel-app/id6450589764"
                target="_blank"
                rel="noopener noreferrer"
                className="app-store-link"
                style={{ textDecoration: 'none' }}
              >
                <img
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="Download on the App Store"
                  style={{
                    height: '44px',
                    width: 'auto',
                    transition: 'transform 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </a>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={() => setShowAppDownloadModal(false)}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: '#64748B',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

  return (
    <div style={containerStyle}>
      {renderDiscountTag(item?.pricing)}

      <div style={mainContentStyle}>
        {/* Airline Header Section */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          padding: '12px 16px',
          backgroundColor: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {getAirlineCodes().slice(0, 3).map((code, index) => (
                <div key={code} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <img 
                    src={getAirlineLogo(code)}
                    alt={`${code} logo`}
                    style={{
                      width: '24px',
                      height: '24px',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div style={{
                    display: 'none',
                    width: '24px',
                    height: '24px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '600',
                    color: '#64748B',
                    backgroundColor: '#F1F5F9',
                    borderRadius: '4px'
                  }}>
                    {code}
                  </div>
                </div>
              ))}
              {getAirlineCodes().length > 3 && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#ed4242',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: '600'
                }}>
                  +{getAirlineCodes().length - 3}
                </div>
              )}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1E293B'
              }}>
                {getAirlineNames().length === 1 ? getAirlineNames()[0] : `${getAirlineNames().length} Airlines`}
              </div>
              {/* <div style={{
                fontSize: '12px',
                color: '#64748B'
              }}>
                {item?.legs?.length} {item?.legs?.length === 1 ? 'Segment' : 'Segments'}
              </div> */}
            </div>
          </div>
          
          {/* Discount Tag centered in header */}
          {item?.pricing?.discountApplicable && (
            <div style={{
              background: "linear-gradient(135deg, #ed4242 0%, #F15F79 100%)",
              color: "#ffffff",
              padding: "8px 20px",
              borderRadius: "25px",
              fontSize: "14px",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 6px 16px rgba(237, 66, 66, 0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              <Tag size={16} />
              Save {CurrencyConverter(item.pricing.discountCurrency, item.pricing.discountAmount, baseCurrencyValue)}
            </div>
          )}
        </div>

        {/* Flight Cards for each leg - always visible */}
        {item?.legs?.map((leg, index) => (
          <FlightCard
            key={index}
            data={leg}
            totalDuration={leg?.legDescription?.totalDuration}
          />
        ))}

        {/* Collapsible Details Section with Tab Interface */}
        {showDetails && detailsData && !revalError && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '300px',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
            borderRadius: '12px',
            overflow: 'hidden',
            marginTop: '20px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            {/* Section Tabs Container */}
            <div style={{
              display: 'flex',
              overflowX: 'auto',
              background: 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
              borderBottom: '2px solid #F1F5F9',
              padding: '12px 16px',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}>
              {sectionTabs.map((tab, index) => renderSectionTabButton(tab, index))}
            </div>

            {/* Main Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              paddingBottom: '16px'
            }}>
              {renderSelectedTabContent()}
            </div>

            {/* Book Now Section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              padding: '16px 20px',
              borderTop: '1px solid #E5E7EB'
            }}>
              <button
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #ed4242 0%, #F15F79 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  gap: '10px',
                  fontSize: '16px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onClick={handleBookNowClick}
              >
                <CreditCard size={18} />
                Book Now • {detailsData?.pricing ? CurrencyConverter(detailsData.pricing.currency, detailsData.pricing.totalPrice, baseCurrencyValue) : 'Loading...'}
              </button>
            </div>
          </div>
        )}

        {/* Error state when revalidation fails */}
        {showDetails && revalError && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "16px",
              margin: "16px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#dc2626",
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Flight Not Available
            </div>
            <div
              style={{
                color: "#7f1d1d",
                fontSize: "14px",
                marginBottom: "12px",
              }}
            >
              We're sorry, this flight is currently not available for booking.
            </div>
            <button
              onClick={handleViewDetails}
              style={{
                backgroundColor: "#dc2626",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!bookingPage && (
          <div style={bottomRowStyle}>
            <div style={priceContainerStyle}>
              {item?.pricing?.discountApplicable && (
                <div style={originalPriceStyle}>
                  {CurrencyConverter(
                    item?.pricing?.currency,
                    item?.pricing?.actualBeforeDiscount,
                    baseCurrencyValue
                  )}
                </div>
              )}
              <div style={finalPriceStyle}>
                {CurrencyConverter(
                  item?.pricing?.currency,
                  item?.pricing?.totalPrice,
                  baseCurrencyValue
                )}
              </div>
            </div>

            <button
              style={detailsButtonStyle}
              onClick={handleViewDetails}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid #ffffff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  Loading...
                </>
              ) : (
                <>
                  {showDetails ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {showDetails ? "Hide Details" : "View Details & Book"}
                </>
              )}
            </button>
          </div>
        )}

        {/* Collapsible Details Section - removed since replaced by tab interface */}

        {/* Modal removed - functionality moved to inline tab interface */}
      </div>

      {/* App Download Modal */}
      <AppDownloadModal />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          /* Custom scrollbar styles for tab interface */
          div::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
          }
        `}
      </style>
    </div>
  );
};

export default FlightMainMetaCard;
