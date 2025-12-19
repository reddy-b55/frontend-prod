import React, { useContext, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plane, Clock, DollarSign, Receipt, Package, AlertTriangle, CreditCard, ArrowRight, Route } from "lucide-react";
import CurrencyConverter from "../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import { AppContext } from "../../pages/_app";
import ModalBase from "../common/Modals/ModalBase";
import qrCode from "../../public/assets/images/qr/logoNew.png"
import { Container, Row, Col } from "reactstrap";
import Image from "next/image";
// Mock data for demonstration
const mockFlightData = {
  revalidationData: {
    legs: [
      {
        legDescription: {
          departureLocation: "NYC",
          arrivalLocation: "LAX",
          departureDate: "2025-07-15T10:30:00Z",
          totalDuration: 360
        },
        schedules: [
          {
            carrier: {
              marketing: "AA",
              marketingFlightNumber: "1234"
            },
            elapsedTime: 360,
            arrival: {
              airport: "LAX"
            }
          }
        ]
      },
      {
        legDescription: {
          departureLocation: "LAX",
          arrivalLocation: "NYC",
          departureDate: "2025-07-20T14:15:00Z",
          totalDuration: 330
        },
        schedules: [
          {
            carrier: {
              marketing: "AA",
              marketingFlightNumber: "5678"
            },
            elapsedTime: 330,
            arrival: {
              airport: "NYC"
            }
          }
        ]
      }
    ],
    pricing: {
      currency: "USD",
      totalPrice: 650,
      actualBeforeDiscount: 750,
      totalTaxAmount: 120,
      discountApplicable: true,
      discountAmount: 100,
      discountCurrency: "USD"
    },
    taxes: [
      {
        code: "US",
        description: "U.S. Transportation Tax",
        currency: "USD",
        amount: 45
      },
      {
        code: "ZP",
        description: "U.S. Flight Segment Tax",
        currency: "USD",
        amount: 35
      },
      {
        code: "AY",
        description: "U.S. Passenger Facility Charge",
        currency: "USD",
        amount: 40
      }
    ],
    baggageInformation: [
      {
        allowance: {
          weight: 23,
          unit: "KG",
          description1: "UP TO 23 KILOGRAMS",
          pieceCount: 1
        },
        segments: [{ id: 0 }],
        airlineCode: "AA",
        provisionType: "A"
      }
    ],
    penaltiesInfo: {
      penalties: [
        {
          type: "Refund",
          refundable: false,
          applicability: "Before"
        },
        {
          type: "Change",
          changeable: true,
          applicability: "Before"
        }
      ]
    },
    bankProviders: []
  }
};

// Mock components
const FlightCardMeta = ({ data, totalDuration, detailPage }) => (
  <div style={{
    padding: '12px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    margin: '8px 0'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
          {data.schedules[0].carrier.marketing} {data.schedules[0].carrier.marketingFlightNumber}
        </div>
        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Duration (Layover): {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
        </div>
      </div>
      <Plane size={16} color="#6366F1" />
    </div>
  </div>
);

const BankProvidersRowMeta = ({ details }) => (
  <div style={{
    marginTop: '12px',
    padding: '8px',
    backgroundColor: '#F1F5F9',
    borderRadius: '6px',
    fontSize: '12px',
    color: '#64748B'
  }}>
    Payment options available
  </div>
);

const FlightHeader = ({ tripData }) => (
  <div style={{
    padding: '16px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  }}>
    <Route size={20} color="#6366F1" />
    <div style={{ fontSize: '18px', fontWeight: '600', color: '#1E293B' }}>
      Flight Details
    </div>
  </div>
);

const FlightsDetailsPageMeta = ({
  bookingPage = false,
  bookingData,
  handleBack,
}) => {

  const [downloadMessage, setDownloadMessage] = useState(false);
  const { baseCurrencyValue } = useContext(AppContext);
  console.log("Booking Data", bookingData);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedFlightTab, setSelectedFlightTab] = useState(0);
  const [expandedSection, setExpandedSection] = useState(null);
  const [flightData, setFlightData] = useState(bookingData);

  useEffect(() => {
    if (bookingPage) {
      setFlightData({revalidationData:bookingData});
    } else {
      setFlightData({revalidationData:bookingData});
    }
  }, [bookingData, bookingPage]);

  console.log(flightData,"Fligt Data isssssX")

  if (!flightData?.revalidationData?.legs) {
    return (
      <div style={{
        padding: '50px',
        textAlign: 'center',
        fontSize: '16px',
        color: '#EA4335'
      }}>
        No flight data available
      </div>
    );
  }

  const { legs, pricing, taxes, baggageInformation, penaltiesInfo } = flightData.revalidationData;

  const formatRoute = (leg) => {
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

  // Tab configuration
  const sectionTabs = [
    { id: 0, name: "Price Breakdown", icon: DollarSign, color: "#059669" },
    { id: 1, name: "Itinerary", icon: Route, color: "#1976D2" },
    { id: 2, name: "Taxes & Fees", icon: Receipt, color: "#3B82F6" },
    { id: 3, name: "Baggage", icon: Package, color: "#8B5CF6" },
    { id: 4, name: "Fare Rules", icon: AlertTriangle, color: "#F59E0B" }
  ];

  // Render section tab buttons
  const renderSectionTabButton = (tab, index) => {
    const isSelected = selectedTab === index;
    const IconComponent = tab.icon;

    return (
      <button
        key={index}
        style={{
          minWidth: '100px',
          padding: '10px 12px',
          margin: '0 4px',
          borderRadius: '8px',
          backgroundColor: isSelected ? tab.color : '#F8FAFC',
          border: `1px solid ${isSelected ? tab.color : '#E2E8F0'}`,
          textAlign: 'center',
          cursor: 'pointer',
          color: isSelected ? '#FFFFFF' : '#334155',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          transition: 'all 0.2s ease',
          fontSize: '11px',
          fontWeight: '600'
        }}
        onClick={() => setSelectedTab(index)}
        onMouseOver={(e) => {
          if (!isSelected) {
            e.target.style.backgroundColor = '#F1F5F9';
            e.target.style.borderColor = '#CBD5E0';
          }
        }}
        onMouseOut={(e) => {
          if (!isSelected) {
            e.target.style.backgroundColor = '#F8FAFC';
            e.target.style.borderColor = '#E2E8F0';
          }
        }}
      >
        <IconComponent size={12} color={isSelected ? '#FFFFFF' : '#64748B'} />
        <span>
          {tab.name}
        </span>
      </button>
    );
  };

  // Render flight tab buttons for itinerary section
  const renderFlightTabButton = (leg, index) => {
    const isSelected = selectedFlightTab === index;
    const tabDate = formatTabDate(leg.legDescription.departureDate);
    const route = formatRoute(leg);

    return (
      <button
        key={index}
        style={{
          flex: 1,
          padding: '8px 12px',
          margin: '0 4px',
          borderRadius: '6px',
          backgroundColor: isSelected ? '#059669' : '#FFFFFF',
          border: `1px solid ${isSelected ? '#059669' : '#E2E8F0'}`,
          textAlign: 'center',
          cursor: 'pointer',
          color: isSelected ? '#FFFFFF' : '#334155',
          transition: 'all 0.2s ease',
          fontSize: '12px'
        }}
        onClick={() => setSelectedFlightTab(index)}
        onMouseOver={(e) => {
          if (!isSelected) {
            e.target.style.backgroundColor = '#F8FAFC';
            e.target.style.borderColor = '#CBD5E0';
          }
        }}
        onMouseOut={(e) => {
          if (!isSelected) {
            e.target.style.backgroundColor = '#FFFFFF';
            e.target.style.borderColor = '#E2E8F0';
          }
        }}
      >
        <div style={{
          fontWeight: '600',
          marginBottom: '2px'
        }}>
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

  const getPenaltyIcon = (type) => {
    return type === "Refund" ? "undo" : "exchange-alt";
  };

  const getPenaltyColor = (refundable, changeable) => {
    return (refundable || changeable) ? "#059669" : "#DC2626";
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

  const getBaggageWeight = (allowance) => {
    if (allowance?.weight && allowance?.unit) {
      return `${allowance.weight}${allowance.unit}`;
    }
    if (allowance?.pieceCount > 0) {
      return `${allowance.pieceCount} PCS`;
    }
    return "0KG";
  };

  const getDetailedBaggageInfo = (allowance) => {
    if (allowance?.weight && allowance?.unit) {
      return `${allowance.weight} ${allowance.unit} included`;
    }
    if (allowance?.pieceCount > 0) {
      return `${allowance.pieceCount} PCS`;
    }
    return "0KG";
  };

  // Content renderers for each tab
  const renderPricingBreakdownDirect = () => (
    <div style={{
      backgroundColor: '#FFFFFF',
      margin: '8px 12px',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0'
      }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>Base Fare</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
          {CurrencyConverter(pricing.currency, pricing.actualBeforeDiscount - pricing.totalTaxAmount, baseCurrencyValue)}
        </span>
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0'
      }}>
        <span style={{ fontSize: '13px', color: '#64748B' }}>Taxes & Fees</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
          {CurrencyConverter(pricing.currency, pricing.totalTaxAmount, baseCurrencyValue)}
        </span>
      </div>
      {pricing.discountApplicable && (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0'
          }}>
            <span style={{ fontSize: '13px', color: '#64748B' }}>Total Without Discount</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366F1' }}>
              {CurrencyConverter(pricing.currency, pricing.actualBeforeDiscount, baseCurrencyValue)}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '6px 0'
          }}>
            <span style={{ fontSize: '13px', color: '#2bbd4a' }}>Discount Amount</span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#2bbd4a' }}>
              -{CurrencyConverter(pricing.discountCurrency, pricing.discountAmount, baseCurrencyValue)}
            </span>
          </div>
        </>
      )}
      <div style={{
        height: '1px',
        backgroundColor: '#E2E8F0',
        margin: '6px 0'
      }} />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 0'
      }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Total Amount</span>
        <span style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
          {CurrencyConverter(pricing.currency, pricing.totalPrice, baseCurrencyValue)}
        </span>
      </div>
      
      {/* Bank Providers */}
      {flightData.revalidationData?.bankProviders?.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {flightData.revalidationData.bankProviders.map((bank, index) => (
              <div key={index} style={{
                width: '60px',
                height: '30px',
                backgroundColor: '#FFFFFF',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={bank.iconUrl}
                  alt={`${bank.name} logo`}
                  style={{
                    maxWidth: '50px',
                    maxHeight: '25px',
                    objectFit: 'contain'
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748B'
          }}>
            You will get this discount only if you pay by these cards
          </div>
        </div>
      )}
    </div>
  );

  const renderTaxesBreakdownDirect = () => (
    <div style={{
      backgroundColor: '#FFFFFF',
      margin: '8px 12px',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    }}>
      {taxes.map((tax, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: index < taxes.length - 1 ? '1px solid #F8FAFC' : 'none'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155'
            }}>
              {tax.code}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#64748B',
              marginTop: '2px'
            }}>
              {tax.description}
            </div>
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#059669'
          }}>
            {CurrencyConverter(tax.currency, tax.amount, baseCurrencyValue)}
          </span>
        </div>
      ))}
    </div>
  );

  const renderBaggageInfoDirect = () => {
    if (!baggageInformation || baggageInformation.length === 0) {
      return (
        <div style={{
          backgroundColor: '#FFFFFF',
          margin: '8px 12px',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#64748B',
            fontStyle: 'italic'
          }}>
            No baggage information available
          </span>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {baggageInformation.map((baggage, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: index < baggageInformation.length - 1 ? '1px solid #F8FAFC' : 'none'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              marginRight: '12px'
            }}>
              <Package size={16} color="#8B5CF6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#334155',
                marginBottom: '2px'
              }}>
                Segment {baggage.segments[0].id + 1} • {baggage.airlineCode}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#059669',
                marginBottom: '2px'
              }}>
                {getDetailedBaggageInfo(baggage.allowance)}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#64748B'
              }}>
                {baggage.provisionType === "A" ? "Checked Baggage" : "Carry-on"}
              </div>
              {baggage.allowance.description2 && (
                <div style={{
                  fontSize: '10px',
                  color: '#64748B',
                  marginTop: '2px'
                }}>
                  {baggage.allowance.description2.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPenaltiesInfoDirect = () => {
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
          <span style={{
            fontSize: '14px',
            color: '#64748B',
            fontStyle: 'italic'
          }}>
            No fare rules information available
          </span>
        </div>
      );
    }

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {penaltiesInfo.penalties.map((penalty, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            padding: '12px 0',
            borderBottom: index < penaltiesInfo.penalties.length - 1 ? '1px solid #F8FAFC' : 'none'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: '12px',
              marginTop: '2px'
            }}>
              <AlertTriangle size={12} color={getPenaltyColor(penalty.refundable, penalty.changeable)} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1E293B'
                }}>
                  {penalty.type}
                </span>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: (penalty.refundable || penalty.changeable) ? '#DCFCE7' : '#FEE2E2',
                  fontSize: '10px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  color: (penalty.refundable || penalty.changeable) ? '#059669' : '#DC2626'
                }}>
                  {getPenaltyStatus(penalty)}
                </span>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#475569',
                lineHeight: '16px',
                marginBottom: '6px'
              }}>
                {getPenaltyDescription(penalty)}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <Clock size={10} color="#64748B" style={{ marginRight: '4px' }} />
                <span style={{
                  fontSize: '11px',
                  color: '#64748B'
                }}>
                  {penalty.applicability === "Before" ? "Before departure" : "After departure"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderItineraryDirect = () => {
    const currentLeg = legs[selectedFlightTab];

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        margin: '8px 12px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Flight Selection Tabs for Itinerary */}
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
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #F1F5F9'
        }}>
          <Route size={16} color="#1976D2" />
          <div style={{ marginLeft: '10px', flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1E293B',
              marginBottom: '2px'
            }}>
              {formatRoute(currentLeg)}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#64748B',
              fontWeight: '500'
            }}>
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

  // Main tab content renderer
  const renderSelectedTabContent = () => {
    switch (selectedTab) {
      case 0:
        return renderPricingBreakdownDirect();
      case 1:
        return renderItineraryDirect();
      case 2:
        return renderTaxesBreakdownDirect();
      case 3:
        return renderBaggageInfoDirect();
      case 4:
        return renderPenaltiesInfoDirect();
      default:
        return renderPricingBreakdownDirect();
    }
  };

  const renderTabButton = (leg, index) => {
    const isSelected = selectedTab === index;
    const tabDate = formatTabDate(leg.legDescription.departureDate);
    const route = formatRoute(leg);

    return (
      <button
        key={index}
        style={{
          flex: 1,
          padding: '10px 12px',
          margin: '0 4px',
          borderRadius: '8px',
          backgroundColor: isSelected ? '#6366F1' : '#F8FAFC',
          border: `1px solid ${isSelected ? '#6366F1' : '#E2E8F0'}`,
          textAlign: 'center',
          cursor: 'pointer',
          color: isSelected ? '#FFFFFF' : '#334155'
        }}
        onClick={() => setSelectedTab(index)}
      >
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          marginBottom: '2px'
        }}>
          {route}
        </div>
        <div style={{
          fontSize: '10px',
          color: isSelected ? 'rgba(255, 255, 255, 0.8)' : '#64748B',
          fontWeight: '500'
        }}>
          {tabDate.dayName}, {tabDate.day} {tabDate.month}
        </div>
      </button>
    );
  };

  const renderFlightSegments = (leg) => {
    return leg.schedules.map((schedule, index) => {
      const segmentData = {
        schedules: [schedule],
        legDescription: {
          ...leg.legDescription,
          totalDuration: schedule.elapsedTime,
        },
      };

      return (
        <div key={index}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#FAFBFC'
          }}>
            <Plane size={14} color="#6366F1" />
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#334155',
              marginLeft: '6px'
            }}>
              {schedule.carrier.marketing} {schedule.carrier.marketingFlightNumber}
            </span>
          </div>

          <FlightCardMeta
            data={segmentData}
            totalDuration={schedule.elapsedTime}
            detailPage={true}
          />

          {index < leg.schedules.length - 1 && (
            <div style={{
              padding: '6px 12px'
            }}>
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
                  Layover in {schedule?.arrival?.airport}
                </span>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  const currentLeg = legs[selectedFlightTab];

  const handleBookNow = () => {
    console.log("Booking flight...");
    setDownloadMessage(true);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: "calc(100vh - 200px)",
      backgroundColor: '#FAFBFC'
    }}>
      {!bookingPage && <FlightHeader tripData={null} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Section Tabs Container */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '8px 12px',
          gap: '4px',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1'
        }}>
          {sectionTabs.map((tab, index) => renderSectionTabButton(tab, index))}
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '16px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1'
        }}>
          {renderSelectedTabContent()}
        </div>

        {/* Compact Book Now Section */}
        {!bookingPage && (
          <div style={{
            backgroundColor: '#FFFFFF',
            padding: '12px',
            borderTop: '1px solid #E2E8F0'
          }}>
            <button
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 16px',
                backgroundColor: '#059669',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onClick={handleBookNow}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#047857';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              <CreditCard size={16} />
              <span style={{
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Book Now • {CurrencyConverter(pricing.currency, pricing.totalPrice, baseCurrencyValue)}
              </span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Add CSS for webkit scrollbars */}
      <style jsx>{`
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
      `}</style>


        
      <ModalBase   
  isOpen={downloadMessage}   
  toggle={() => setDownloadMessage(false)}   
  // title={"Download Our App"} 
  size="md"
>   
  <div style={{ 
    textAlign: 'center', 
    padding: '0px 20px',
    // background: 'linear-gradient(135deg, #948c8cff 0%, #e65c0dff 100%)',
    borderRadius: '16px',
    position: 'relative',
    overflow: 'hidden',
    height: "calc(104vh - 200px)",
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
        fontSize: '24px',
        fontWeight: '700',
        color: '#000',
        margin: '0 0 10px 0',
        // textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        Book Instantly with Our App
      </h3>
      
      <p style={{
        fontSize: '16px',
        color: 'rgba(255, 255, 255, 0.9)',
        margin: '0 0 30px 0',
        lineHeight: '1.5',
        fontWeight: '400'
      }}>
        {/* Get exclusive deals and seamless booking experience */}
      </p>
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
        display: 'inline-block',
        // boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        // border: '3px solid rgba(255, 255, 255, 0.8)',
        // transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}>
        <Image           
          src={qrCode}           
          alt="QR Code for App Download"           
          style={{             
            height: '160px',             
            width: 'auto',
            // display: 'block'
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
  </div> 
</ModalBase>

    </div>
  );
};

export default FlightsDetailsPageMeta;