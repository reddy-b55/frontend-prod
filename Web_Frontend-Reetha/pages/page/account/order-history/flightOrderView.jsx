import React, { useState } from 'react';
import { Plane, Calendar, Clock, MapPin, Phone, Mail, DollarSign, Tag, User, Users, ArrowRight, Luggage, AlertCircle, Check } from 'lucide-react';

const EnhancedFlightInfo = ({orderData}) => {
  const [activeTab, setActiveTab] = useState('itinerary');
  
  // Sample order data - this would come from props in a real implementation


  // Return null if not a flight order
  if (orderData.main_category_id !== 6) {
    return null;
  }

  // Parse JSON strings
  const contactDetails = JSON.parse(orderData.contact_details || '{}');
  const flightCustomerSearch = JSON.parse(orderData.flightCustomerSearch || '{}');
  const flightValidData = JSON.parse(orderData.flightValidData || '{}');
  const flightsData = JSON.parse(orderData.flightsData || '{}');
  const flightAdult = JSON.parse(orderData.flightAdult || '[]');

  // Helper functions
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const time = timeStr.split('+')[0];
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${minutes} ${ampm}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCabinClass = (code) => {
    switch (code) {
      case 'Y': return 'Economy';
      case 'C': return 'Business';
      case 'F': return 'First Class';
      default: return 'Economy';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Flight Booking</h2>
          <div className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(orderData.booking_status)}`}>
            {orderData.booking_status || 'Pending'}
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-blue-100">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Booked on {formatDate(orderData.created_at || new Date())}</span>
        </div>
      </div>

      {/* Flight Summary */}
      <div className="p-6 bg-blue-50">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full">
              <Plane className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold mt-2">{flightCustomerSearch.from_location?.split(',')[0]}</div>
          </div>
          
          <div className="flex-1 mx-8 relative">
            <div className="h-1 bg-blue-300 my-2"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white p-2 rounded-full border-2 border-blue-500">
                <Plane className="w-6 h-6 text-blue-600 transform rotate-90" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold mt-2">{flightCustomerSearch.to_location?.split(',')[0]}</div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6 text-sm">
          <div className="text-center">
            <div className="text-gray-500">Departure</div>
            <div className="font-medium">{formatDate(flightCustomerSearch.dep_date?.split(',')[0])}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Return</div>
            <div className="font-medium">{formatDate(flightCustomerSearch.dep_date?.split(',')[1])}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Passengers</div>
            <div className="font-medium">{flightCustomerSearch.adultCount || 1} Adult(s)</div>
          </div>
          <div className="text-center">
            <div className="text-gray-500">Class</div>
            <div className="font-medium">{getCabinClass(flightCustomerSearch.cabin_code)}</div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button 
            className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'itinerary' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('itinerary')}
          >
            Flight Itinerary
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'fare' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('fare')}
          >
            Fare Details
          </button>
          <button 
            className={`px-6 py-4 font-medium text-sm focus:outline-none ${activeTab === 'passenger' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('passenger')}
          >
            Passenger Info
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div>
            {flightsData.scheduleData?.length > 0 && flightsData.scheduleData.map((leg, legIndex) => (
              <div key={`leg-${legIndex}`} className="mb-8 last:mb-0">
                <div className="flex items-center mb-3 gap-2">
                  <div className={`w-2 h-6 rounded-full ${legIndex === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
                  <h3 className="font-medium text-lg">
                    {legIndex === 0 ? 'Outbound Flight' : 'Return Flight'}
                  </h3>
                </div>
                
                <div className="text-xs text-gray-500 flex items-center mb-4">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(leg[0]?.departure?.departureDate)}
                  {flightsData.totalStopCount > 0 && (
                    <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">
                      {flightsData.totalStopCount} {flightsData.totalStopCount === 1 ? 'stop' : 'stops'}
                    </span>
                  )}
                </div>
                
                {leg.map((segment, segmentIndex) => (
                  <div key={`segment-${legIndex}-${segmentIndex}`} className="mb-4 last:mb-0">
                    <div className="bg-gray-50 rounded-t-lg border border-b-0 px-4 py-3 flex justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full border flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">AI</span>
                        </div>
                        <div>
                          <div className="font-medium">Air India {segment.carrier.marketingFlightNumber}</div>
                          <div className="text-xs text-gray-500">
                            {getCabinClass(flightValidData.cabin_code)} Class
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDuration(segment.elapsedTime)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Flight {segment.carrier.marketing}-{segment.carrier.marketingFlightNumber}
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-b-lg p-5 bg-white">
                      <div className="grid grid-cols-5 gap-3">
                        <div className="col-span-2">
                          <div className="text-3xl font-bold">{formatTime(segment.departure.time)}</div>
                          <div className="font-medium">{segment.departure.airport}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(segment.departure.departureDate)}
                          </div>
                          {segment.departure.terminal && (
                            <div className="text-xs bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                              Terminal {segment.departure.terminal}
                            </div>
                          )}
                        </div>
                        
                        <div className="col-span-1 flex justify-center items-center">
                          <div className="w-full flex flex-col items-center">
                            <div className="w-full h-0.5 bg-gray-300"></div>
                            <ArrowRight className="w-5 h-5 text-gray-400 my-1" />
                            <div className="text-xs text-gray-500">Direct</div>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <div className="text-3xl font-bold">{formatTime(segment.arrival.time)}</div>
                          <div className="font-medium">{segment.arrival.airport}</div>
                          <div className="text-xs text-gray-500">
                            {formatDate(segment.arrival.arrivalDate)}
                          </div>
                          {segment.arrival.terminal && (
                            <div className="text-xs bg-gray-100 inline-block px-2 py-0.5 rounded mt-1">
                              Terminal {segment.arrival.terminal}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {legIndex < flightsData.scheduleData.length - 1 && (
                  <div className="border-b border-dashed my-6"></div>
                )}
              </div>
            ))}
            
            {/* Baggage Information */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Luggage className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium">Baggage Information</h3>
              </div>
              
              <div className="text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span>Checked Baggage</span>
                  <span className="font-medium">30 KG per passenger</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Cabin Baggage</span>
                  <span className="font-medium">7 KG per passenger</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Fare Details Tab */}
        {activeTab === 'fare' && (
          <div>
            <div className="bg-white rounded-lg">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Total Price</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {flightsData.totalFare?.currency} {flightsData.totalFare?.totalPrice?.toLocaleString()}
                  </div>
                  {flightsData.totalFare?.discountAmount > 0 && (
                    <div className="text-xs text-gray-500 line-through">
                      Original: {flightsData.totalFare?.currency} {flightsData.totalFare?.actualBeforeDiscount?.toLocaleString()}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500">Booking Reference</div>
                  <div className="text-2xl font-bold">{orderData.flight_id || 'FLIGHT-' + orderData.id}</div>
                  <div className="text-xs text-blue-600 mt-1">Air India</div>
                </div>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-medium">Fare Breakdown</h3>
                </div>
                
                <div className="p-5">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Fare</span>
                      <span className="font-medium">
                        {flightsData.totalFare?.currency} {(flightsData.totalFare?.totalPrice - flightsData.totalFare?.totalTaxAmount).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span className="font-medium">
                        {flightsData.totalFare?.currency} {flightsData.totalFare?.totalTaxAmount?.toLocaleString()}
                      </span>
                    </div>
                    
                    {flightsData.totalFare?.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">
                          - {flightsData.totalFare?.currency} {flightsData.totalFare?.discountAmount?.toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t pt-3 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total Amount</span>
                        <span>
                          {flightsData.totalFare?.currency} {flightsData.totalFare?.totalPrice?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cancellation Policy */}
              {flightsData.penaltiesInfo?.penalties && (
                <div className="mt-6 border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h3 className="font-medium">Cancellation & Change Policy</h3>
                  </div>
                  
                  <div className="p-5">
                    <div className="space-y-4">
                      {flightsData.penaltiesInfo.penalties
                        .filter(p => p.type === 'Refund')
                        .map((penalty, index) => (
                          <div key={`refund-${index}`} className="flex gap-3">
                            <div className="text-red-500 mt-0.5">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">Cancellation {penalty.applicability} Departure</div>
                              <div className="text-sm text-gray-600">
                                Cancellation fee: {penalty.currency} {penalty.amount?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {flightsData.penaltiesInfo.penalties
                        .filter(p => p.type === 'Exchange')
                        .map((penalty, index) => (
                          <div key={`change-${index}`} className="flex gap-3">
                            <div className="text-yellow-500 mt-0.5">
                              <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">Flight Change {penalty.applicability} Departure</div>
                              <div className="text-sm text-gray-600">
                                Change fee: {penalty.currency} {penalty.amount?.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Passenger Info Tab */}
        {activeTab === 'passenger' && (
          <div>
            {/* Passengers */}
            {flightAdult.length > 0 && (
              <div className="border rounded-lg overflow-hidden mb-6">
                <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">Passenger Details</h3>
                  <div className="text-sm text-gray-500">{flightAdult.length} Passenger(s)</div>
                </div>
                
                <div className="divide-y">
                  {flightAdult.map((passenger, index) => (
                    <div key={`passenger-${index}`} className="p-5">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-lg">{passenger.title} {passenger.firstName} {passenger.lastName}</div>
                          <div className="text-sm text-gray-500">Adult • {index === 0 ? 'Primary' : 'Secondary'}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6 text-sm">
                        <div>
                          <div className="text-gray-500">Nationality</div>
                          <div className="font-medium">
                            {passenger.nationality?.flag} {passenger.nationality?.name}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Date of Birth</div>
                          <div className="font-medium">{formatDate(passenger.passportDOB)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Passport Number</div>
                          <div className="font-medium">{passenger.passportNo}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Passport Expiry</div>
                          <div className="font-medium">{formatDate(passenger.expiryDate)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-medium">Contact Information</h3>
              </div>
              
              <div className="p-5">
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="text-blue-500 mt-0.5">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Email Address</div>
                      <div className="font-medium">{contactDetails.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="text-blue-500 mt-0.5">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">Phone Number</div>
                      <div className="font-medium">{contactDetails.contact}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Important Info */}
            <div className="mt-6 bg-blue-50 p-5 rounded-lg">
              <div className="flex gap-3 mb-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-medium">Important Information</h4>
              </div>
              <ul className="text-sm space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>Please arrive at the airport at least 3 hours before departure for international flights.</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>Carry a printed copy of your e-ticket and valid photo ID for check-in.</div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full mt-2"></div>
                  <div>Check airline baggage policy for prohibited items and weight restrictions.</div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFlightInfo;