// components/HotelConditions/HotelConditions.jsx
import React, { useContext, useState } from 'react';
import styles from './HotelConditions.module.css';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import { AppContext } from '../../../pages/_app';

import moment from 'moment';


// Utility function for currency formatting
const formatCurrency = (amount, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);

// Page Component
export default function HotelConditionsPage({ preBookData, manageConditionDetail }) {

  console.log("preBookData", preBookData?.preBooking?.[0]?.Rooms?.[0]?.LastCancellationDeadline);


  const providerName = preBookData.hotelMainRequest.hotelData.provider;
  const { baseCurrencyValue } = useContext(AppContext)
  // console.log("preBookData provider", providerName);
  const hotelData = {
    roomName: 'Deluxe Room with City View',
    bedType: 'King Bed',
    occupancy: '2 Adults',
    mealPlan: 'Breakfast Included',
    baseRate: 150.00,
    taxes: 30.00,
    cancellationPolicies: [
      { period: 'Before 7 days', charge: 25, chargeType: 'percentage' },
      { period: 'Less than 7 days', charge: 100, chargeType: 'percentage' }
    ],
    lastCancellationDate: '2024-03-20',
    amenities: ['Free WiFi', 'Air Conditioning', 'Room Service', 'Minibar', 'Flat Screen TV', 'Private Bathroom']
  };

  const [activeSection, setActiveSection] = useState('pricing'); // Set 'pricing' as default open section

  // Toggle section expansion
  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  // Get cancellation policies - handle both single and multiple policies
  const getCancellationPolicies = () => {
    const policies = preBookData?.hotelRatesRequest?.CancellationPolicy || [];
    return policies.length > 0 ? policies : [];
  };

  const cancellationPolicies = getCancellationPolicies();
  const [lastCancelationDate, setLastCancelationDate] = useState(
    preBookData?.preBooking?.[0]?.Rooms?.[0]?.LastCancellationDeadline || 'N/A')

  return (
    <><div style={{
      position: "relative",
      height: "calc(100vh - 200px)",
      overflowX: "hidden",
      overflowY: "auto",
    }} className={styles.container}>
      <div className={styles.card}>
        <div className={styles.roomDetails}>
          <h3 className={styles.roomName}>{hotelData.roomName}</h3>

          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🛏️</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Room Type</span>
                <p className={styles.infoValue}>{preBookData?.hotelRatesRequest?.RoomTypeName?.[0] || '-'}</p>
              </div>
            </div>

            {/* <div className={styles.infoCard}>
      <div className={styles.infoIcon}>✓</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>Inclusions</span>
        <p className={styles.infoValue}>{preBookData?.hotelRatesRequest?.Inclusions?.[0] || '-'}</p>
        {preBookData?.hotelRatesRequest?.Inclusions?.length > 0 ? (
preBookData.hotelRatesRequest.Inclusions.map((item, index) => (
<p key={index} className={styles.infoValue}>
{item}
</p>
))
) : (
<p className={styles.infoValue}>-</p>
)}
      </div>
    </div> */}

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>✓</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Inclusions</span>
                {(() => {
                  // Get the meals value to filter out
                  const mealsValue = preBookData?.hotelRatesRequest?.Meals;

                  // Filter inclusions to exclude the meals value
                  const filteredInclusions = preBookData?.hotelRatesRequest?.Inclusions?.filter(
                    item => item !== mealsValue
                  ) || [];

                  // Render filtered inclusions
                  return filteredInclusions.length > 0 ? (
                    filteredInclusions.map((item, index) => (
                      <p key={index} className={styles.infoValue}>
                        {item}
                      </p>
                    ))
                  ) : (
                    <p className={styles.infoValue}>-</p>
                  );
                })()}
              </div>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🍽️</div>
              <div className={styles.infoContent}>
                <span className={styles.infoLabel}>Meal Type</span>
                <p className={styles.infoValue}>{preBookData?.preBooking?.[0]?.Rooms?.[0]?.MealType || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accordion Sections */}
        <div className={styles.accordionContainer}>
          {/* Cancellation Policy Section */}
          <div className={`${styles.accordionSection} ${activeSection === 'pricing' ? styles.active : ''}`}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleSection('pricing')}
            >
              <span className={styles.accordionTitle}>
                <span className={styles.accordionIcon}>📝</span>
                Cancellation Policy
              </span>
              <span className={styles.accordionArrow}>
                {activeSection === 'pricing' ? '▲' : '▼'}
              </span>
            </button>

            {activeSection === 'pricing' && (
              <div className={styles.accordionContent}>
                {cancellationPolicies.length > 0 ? (
                  cancellationPolicies.map((policy, index) => (
                    <div key={index} className={styles.policyCard} style={{ marginBottom: cancellationPolicies.length > 1 ? '16px' : '0' }}>
                      {cancellationPolicies.length > 1 && (
                        <div className={styles.policyHeader}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#333' }}>
                            {/* Policy {index + 1} */}
                          </h4>
                        </div>
                      )}

                      <div className={styles.policyItem}>
                        <div className={styles.policyDetail}>
                          {providerName === "ratehawk" ? (
                            <>
                              {/* {policy.start_at && ( */}
                              <>
                                <span className={styles.policyLabel}>From <a>
                                  {moment(policy.start_at || new Date()).format('DD-MM-YYYY')}, {moment(policy.start_at || new Date()).format('hh:mm A')}
                                </a></span>
                                <span className={styles.policyLabel}>{policy.end_at === null ? '' : 'To'} <a>
                                  {policy.end_at === null ? '' : ` ${moment(policy.end_at).format('DD-MM-YYYY')}, ${moment(policy.end_at).format('hh:mm A')}`}
                                </a></span>

                                <a className={styles.policyValue}>

                                </a>
                              </>
                              {/* )} */}

                              {/* {policy.end_at && (
                                  <>
                                    <span className={styles.policyLabel}>To</span>
                                    <span className={styles.policyValue}>
                                      {moment(policy.end_at).format('DD-MM-YYYY')}
                                    </span>
                                  </>
                                )} */}

                              {!policy.start_at === "0.00" && !policy.end_at === "0.00" && (
                                <>
                                  {/* <span className={styles.policyLabel}>Period</span> */}
                                  <span className={styles.policyValue}>Free Cancellation</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <span className={styles.policyLabel}>From</span>
                              <span className={styles.policyValue}>
                                {policy.start_at ? moment(policy.start_at).format('DD-MM-YYYY') : 'NA'}
                              </span>
                            </>
                          )}


                        </div>

                        {providerName === "ratehawk" ? (
                          <div className={styles.policyCharge}>
                            {policy?.amount_show != "0.00" ? (
                              <><span className={styles.chargeValue}>
                                {CurrencyConverter('USD', policy.amount_show, baseCurrencyValue)}
                              </span><span className={styles.chargeLabel}></span></>
                            ) : (
                              <span className={styles.chargeValue}>
                                Free Cancellation
                              </span>
                            )}




                          </div>
                        ) : (
                          <div className={styles.policyCharge}>
                            <span className={styles.chargeValue}>
                              {policy.CancellationCharge}%
                            </span>
                            <span className={styles.chargeLabel}>of total amount</span>
                          </div>
                        )}
                      </div>

                      {providerName !== "ratehawk" && policy.FromDate && (
                        <div className={styles.policyDeadline}>
                          <span className={styles.deadlineLabel}>Last cancellation deadline</span>
                          <span className={styles.deadlineValue}>
                            {policy.FromDate.split(" ")[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  ))




                ) : (
                  <div className={styles.policyCard}>
                    <div className={styles.policyItem}>
                      <span className={styles.policyValue}>No cancellation policy available</span>

                    </div>



                  </div>

                )}
                {preBookData?.preBooking?.[0]?.Rooms?.[0]?.LastCancellationDeadline && (
                  <div className={styles.policyCard2}>
                    <div className={styles.policyItem}>
                      <span style={{ color: 'orange' }} className={styles.policyLabel}>Last Cancellation Deadline</span>
                      <span className={styles.policyValue}>
                        {moment(preBookData?.preBooking?.[0]?.Rooms?.[0]?.LastCancellationDeadline, 'DD-MM-YYYY HH:mm:ss').format('DD-MM-YYYY')}, {moment(preBookData?.preBooking?.[0]?.Rooms?.[0]?.LastCancellationDeadline, 'DD-MM-YYYY HH:mm:ss').format('hh:mm A')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amenities Section - Only render if amenities exist */}
          {preBookData.preBooking?.[0]?.Rooms?.[0]?.Amenities && (
            <div className={`${styles.accordionSection} ${activeSection === 'amenities' ? styles.active : ''}`}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleSection('amenities')}
              >
                <span className={styles.accordionTitle}>
                  <span className={styles.accordionIcon}>✨</span>
                  Room Amenities
                </span>
                <span className={styles.accordionArrow}>
                  {activeSection === 'amenities' ? '▲' : '▼'}
                </span>
              </button>

              {activeSection === 'amenities' && (
                <div className={styles.accordionContent}>
                  <div className={styles.amenitiesGrid}>
                    {preBookData.preBooking[0].Rooms[0].Amenities.map((amenity, index) => (
                      <div key={index} className={styles.amenityTag}>
                        <span className={styles.amenityIcon}>✓</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Rate Condition Section */}
          <div className={`${styles.accordionSection} ${activeSection === 'cancellation' ? styles.active : ''}`}>
            <button
              className={styles.accordionHeader}
              onClick={() => toggleSection('cancellation')}
            >
              <span className={styles.accordionTitle}>
                <span className={styles.accordionIcon}>💰</span>
                Rate Condition
              </span>
              <span className={styles.accordionArrow}>
                {activeSection === 'cancellation' ? '▲' : '▼'}
              </span>
            </button>

            {activeSection === 'cancellation' && (
              <div className={styles.accordionContent}>
                <div className={styles.rateConditionsList}>
                  {preBookData.preBooking[0].RateConditions.map((policy, index) => (
                    <div key={index} className={styles.conditionItem}>
                      <span className={styles.conditionBullet}>•</span>
                      <span className={styles.conditionText}>{policy}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>


      </div>
      {/* <div style={{position:"sticky", bottom: "0", padding: "3px"}}>
        <button
          onClick={() => { manageConditionDetail(preBookData) }}
                className="btn btn-sm btn-solid"
        >
          Book Now
        </button> */}




    </div><div style={{ position: "sticky" }}>
        <div className="d-flex m-2 d-flex gap-2 justify-content-center col-12 mt-5">
          <button
            onClick={() => { manageConditionDetail(preBookData); } }
            className="btn btn-sm btn-solid"
          >
            Book Now
          </button>
        </div>
      </div></>
  );
}
