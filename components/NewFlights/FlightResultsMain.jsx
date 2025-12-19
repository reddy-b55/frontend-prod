import React, { useState, useEffect, use } from "react";
import {
  Search,
  Plane,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader,
} from "lucide-react";
import FlightMainMetaCard from "./FlightMainMetaCard";
import { flightSearchAvailability } from "../../GlobalFunctions/flightsMetaFunction";
import axios from "axios";
import flightsFiltering from "../../GlobalFunctions/flightsFilteringMeta";

// Mock FlightMainMetaCard component

// Mock data for testing
const mockFlightData = [
  {
    legs: [
      {
        schedules: [
          {
            departure: {
              airport: "DEL",
              city: "Delhi",
              time: "08:30:00Z",
              departureDate: "2024-07-15",
              terminal: "3",
            },
            arrival: {
              airport: "BOM",
              city: "Mumbai",
              time: "10:45:00Z",
              arrivalDate: "2024-07-15",
              terminal: "2",
            },
            carrier: {
              marketing: "AI",
              marketingFlightNumber: "131",
              operatingFlightNumber: "131",
            },
          },
        ],
        legDescription: {
          totalDuration: 135,
        },
      },
    ],
    pricing: {
      currency: "USD",
      totalPrice: 299,
      actualBeforeDiscount: 350,
      totalTaxAmount: 50,
      discountApplicable: true,
      discountAmount: 51,
      discountCurrency: "USD",
    },
    provider: "sabre",
    bankProviders: [],
  },
  {
    legs: [
      {
        schedules: [
          {
            departure: {
              airport: "DEL",
              city: "Delhi",
              time: "14:20:00Z",
              departureDate: "2024-07-15",
              terminal: "3",
            },
            arrival: {
              airport: "BOM",
              city: "Mumbai",
              time: "16:50:00Z",
              arrivalDate: "2024-07-15",
              terminal: "2",
            },
            carrier: {
              marketing: "6E",
              marketingFlightNumber: "345",
              operatingFlightNumber: "345",
            },
          },
        ],
        legDescription: {
          totalDuration: 150,
        },
      },
    ],
    pricing: {
      currency: "USD",
      totalPrice: 189,
      actualBeforeDiscount: 189,
      totalTaxAmount: 35,
      discountApplicable: false,
    },
    provider: "trvlNxt",
    bankProviders: [],
  },
  {
    legs: [
      {
        schedules: [
          {
            departure: {
              airport: "DEL",
              city: "Delhi",
              time: "18:15:00Z",
              departureDate: "2024-07-15",
              terminal: "3",
            },
            arrival: {
              airport: "BOM",
              city: "Mumbai",
              time: "20:30:00Z",
              arrivalDate: "2024-07-15",
              terminal: "1",
            },
            carrier: {
              marketing: "UK",
              marketingFlightNumber: "955",
              operatingFlightNumber: "955",
            },
          },
        ],
        legDescription: {
          totalDuration: 135,
        },
      },
    ],
    pricing: {
      currency: "USD",
      totalPrice: 225,
      actualBeforeDiscount: 225,
      totalTaxAmount: 40,
      discountApplicable: false,
    },
    provider: "sabre",
    bankProviders: [],
  },
];

const FlightResultsMain = ({
  searchParamsData,
  onUpdateSearch,
  appliedFilters,
  triggerCount,
  handleFlightsCode,
  prePopulated,
}) => {
  const [flightData, setFlightData] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCheapest, setLoadingCheapest] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterData, setFilterData] = useState({});
  const [providerArray, setProviderArray] = useState(["sabre", "trvlNxt"]);
  const [flightCodes, setFlightCodes] = useState([]);

  const [searchParams, setSearchParams] = useState([]);

  console.log("=== FlightResultsMain Debug ===");
  console.log("searchParamsData:", searchParamsData);
  console.log("prePopulated:", prePopulated);
  console.log("prePopulated.selectedFlights:", prePopulated?.selectedFlights);
  console.log("Current flightData:", flightData);
  console.log("Current filteredFlights:", filteredFlights);
  console.log("===============================");

  // const flightSearchAvailability = async (params) => {
  //   await new Promise(resolve => setTimeout(resolve, 2000));
  //   return mockFlightData;
  // };

  useEffect(() => {
    // Only update searchParams if searchParamsData has meaningful data
    if (searchParamsData && searchParamsData.tripType) {
      console.log(
        "Setting searchParams from searchParamsData:",
        searchParamsData
      );
      setSearchParams(searchParamsData);
    }
  }, [searchParamsData]);

  useEffect(() => {
    // If prePopulated has meaningful data, set it directly to flight results
    if (prePopulated) {
      console.log("Processing prePopulated data:", prePopulated);

      if (
        prePopulated.selectedFlights &&
        Array.isArray(prePopulated.selectedFlights) &&
        prePopulated.selectedFlights.length > 0
      ) {
        console.log(
          "Setting flight data from prePopulated.selectedFlights:",
          prePopulated.selectedFlights
        );

        setFlightData(prePopulated.selectedFlights);
        setFilteredFlights(prePopulated.selectedFlights);
        setLoading(false); // Ensure loading is off

        // Extract flight codes
        const codes = extractFlightCodes(prePopulated.selectedFlights);
        setFlightCodes(codes);
        if (handleFlightsCode) {
          handleFlightsCode(codes);
        }
      } else {
        console.warn(
          "prePopulated exists but selectedFlights is empty or invalid:",
          prePopulated
        );
      }
    }
  }, [prePopulated]);

  useEffect(() => {
    // Clear data when triggerCount changes, but don't clear searchParams
    // Don't clear if we have prepopulated data
    if (prePopulated && prePopulated.selectedFlights && prePopulated.selectedFlights.length > 0) {
      console.log("triggerCount changed but keeping prepopulated data");
      return;
    }
    console.log("triggerCount changed, clearing flight data");
    setFlightData([]);
    setFilteredFlights([]);
  }, [triggerCount, prePopulated]);

  useEffect(() => {
    console.log("appliedFilters changed, filtering flights. flightData.length:", flightData.length);
    if (flightData && flightData.length > 0) {
      const filtered = flightsFiltering(flightData, appliedFilters);
      console.log("Filtered flights count:", filtered.length);
      setFilteredFlights(filtered);
    }
  }, [appliedFilters, flightData]);

  const fetchProviders = async () => {
    try {
      const response = await axios.get("/flights/get_providers");
      return response.data;
    } catch (error) {
      return ["sabre", "trvlNxt"];
    }
  };

  const extractFlightCodes = (flightData) => {
    const codes = new Set();
    flightData.forEach((flight) => {
      flight.legs?.forEach((leg) => {
        leg.schedules?.forEach((schedule) => {
          if (schedule.carrier?.marketing) {
            codes.add(schedule.carrier.marketing);
          }
        });
      });
    });
    return Array.from(codes);
  };

  const mergeFlightData = (existingData, newData) => {
    if (!existingData || existingData.length === 0) {
      return newData;
    }
    return [...existingData, ...newData];
  };

  // Parallel flight search with dynamic providers
  const performParallelSearch = async (searchParams, providers) => {
    setLoadingCheapest(true);
    let hasDisplayedFirstResults = false;
    let allFlightData = [];

    if (flightData?.length == 0 && loading == false) {
      setLoading(true);
    }

    try {
      const searchPromises = providers.map(async (provider) => {
        const paramsWithProvider = {
          ...searchParams,
          provider: provider,
        };

        try {
          const result = await flightSearchAvailability(paramsWithProvider);
          return { provider, data: result, success: true };
        } catch (error) {
          console.error(`Error fetching flights from ${provider}:`, error);
          return { provider, data: [], success: false };
        }
      });

      const results = await Promise.allSettled(searchPromises);

      for (const result of results) {
        if (result.status === "fulfilled" && result.value.success) {
          const { provider, data } = result.value;

          if (data && data.length > 0) {
            allFlightData = mergeFlightData(allFlightData, data);

            if (!hasDisplayedFirstResults) {
              setFlightData(allFlightData);
              setFilteredFlights(allFlightData);

              const codes = extractFlightCodes(allFlightData);
              handleFlightsCode(codes);
              setFlightCodes(codes);

              setLoading(false);
              hasDisplayedFirstResults = true;
            } else {
              setFlightData(allFlightData);
              setFilteredFlights(allFlightData);

              const codes = extractFlightCodes(allFlightData);
              handleFlightsCode(codes);
              setFlightCodes(codes);
            }
          }
        }
      }

      if (!hasDisplayedFirstResults) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in parallel search:", error);
      setLoading(false);
    } finally {
      setLoadingCheapest(false);
      setLoading(false);
    }
  };

  // Initialize search
  useEffect(() => {
    const initializeSearch = async () => {
      // Don't search if we have prepopulated data
      if (
        prePopulated &&
        prePopulated.selectedFlights &&
        prePopulated.selectedFlights.length > 0
      ) {
        console.log("Skipping search - using prepopulated AI data");
        return;
      }

      if (!searchParams || !searchParams.tripType) return;

      console.log("Initializing flight search with params:", searchParams);
      setLoading(true);

      try {
        const providers = await fetchProviders();
        setProviderArray(providers);
        await performParallelSearch(searchParams, providers);
      } catch (error) {
        console.error("Error initializing search:", error);
        setLoading(false);
      }
    };

    if (searchParams && searchParams.tripType) {
      initializeSearch();
    }
  }, [searchParams, prePopulated]);

  // Removed duplicate useEffect - filtering is now handled in appliedFilters useEffect above

  const handleFilterChange = (newFilters) => {
    setFilterData(newFilters);
  };

  const handleClearFilters = () => {
    setFilterData({});
  };

  const containerStyle = {
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8fafc",
    minHeight: "400px",
  };

  const resultsHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    padding: "20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  };

  const resultsTitleStyle = {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  };

  const resultsSubtitleStyle = {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  };

  const filterButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  };

  const cheapestLoaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#dbeafe",
    margin: "0 0 16px 0",
    borderRadius: "8px",
    borderLeft: "4px solid #3b82f6",
  };

  const loadingContainerStyle = {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  };

  const noResultsContainerStyle = {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  };

  const spinnerStyle = {
    display: "inline-block",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  };

  const retryButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "16px",
  };

  const floatingFilterButtonStyle = {
    position: "fixed",
    bottom: "30px",
    right: "20px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const renderEmptyState = () => (
    <div style={loading ? loadingContainerStyle : noResultsContainerStyle}>
      {loading ? (
        <>
          <div style={spinnerStyle}>
            <Loader size={48} />
          </div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1e293b",
              margin: "0 0 8px 0",
            }}
          >
            Searching for flights...
          </h3>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            We're checking multiple airlines for the best deals
          </p>
        </>
      ) : (
        <>
          <Plane size={64} style={{ color: "#94a3b8", marginBottom: "16px" }} />
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1e293b",
              margin: "0 0 8px 0",
            }}
          >
            No flights found
          </h3>
          <p
            style={{ fontSize: "14px", color: "#64748b", margin: "0 0 16px 0" }}
          >
            Try adjusting your search criteria or filters
          </p>
          {/* <button
            style={retryButtonStyle}
            onClick={() => onUpdateSearch && onUpdateSearch()}
          >
            <RefreshCw size={16} />
            Search Again
          </button> */}
        </>
      )}
    </div>
  );

  const CheapestOptionsLoader = () => (
    <div style={cheapestLoaderStyle}>
      <div style={spinnerStyle}>
        <Loader size={16} />
      </div>
      <span style={{ fontSize: "14px", color: "#1e40af", fontWeight: "500" }}>
        Loading Cheapest Options...
      </span>
    </div>
  );

  // if (!searchParams?.tripType) {
  //   return null;
  // }

  return (
    <>
      {/* {console.log(filteredFlights, "Flights filtereeeeeee")} */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={containerStyle}>
        {/* Results Header */}
        {/* <div style={resultsHeaderStyle}> */}
        {/* <div>
            <h2 style={resultsTitleStyle}>
              {filteredFlights.length} Flight
              {filteredFlights.length !== 1 ? "s" : ""} Found
            </h2>
            <p style={resultsSubtitleStyle}>
              Best prices from {providerArray.length} provider
              {providerArray.length !== 1 ? "s" : ""}
            </p>
          </div> */}

        {/* <div>
            <button
              style={filterButtonStyle}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
              {Object.keys(filterData).length > 0 && (
                <span
                  style={{
                    backgroundColor: "#ed4242",
                    color: "#ffffff",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginLeft: "8px",
                  }}
                >
                  {Object.keys(filterData).length}
                </span>
              )}
            </button>
          </div> */}
        {/* </div> */}

        {/* Cheapest Options Loader */}
        {/* {loadingCheapest && <CheapestOptionsLoader />} */}

        {/* Applied Filters */}
        {Object.keys(filterData).length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              marginBottom: "16px",
            }}
          >
            <span
              style={{ fontSize: "14px", color: "#64748b", fontWeight: "500" }}
            >
              Applied filters:
            </span>
            <button
              style={{
                padding: "4px 12px",
                backgroundColor: "#ed4242",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
              onClick={handleClearFilters}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Flight Results */}
        <div>
          {filteredFlights.length === 0 ? (
            renderEmptyState()
          ) : (
            <div>
              {filteredFlights.map((flight, index) => (
                <FlightMainMetaCard
                  key={`flight-${flight.id}-${flight.pricing.totalPrice}`}
                  item={flight}
                  index={index}
                  searchParams={searchParams}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Filter Button for Mobile */}
        {/* {flightData.length > 0 && (
          <button
            style={floatingFilterButtonStyle}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
          </button>
        )} */}
      </div>
    </>
  );
};

export default FlightResultsMain;
