import React from "react";

export default function flightsFiltering(dataSet, sortOptions) {
    if (!Array.isArray(dataSet) || dataSet.length === 0) {
        console.log("Dataset is empty or not an array:", dataSet);
        return [];
    }

    const sortOption = sortOptions?.sortOption || "PRICE_ASC";
    const quickFilters = sortOptions?.quickFilters || [];
    const allowedAirlines = sortOptions?.airlines || [];

    const isLateDeparture = (departureTime) => {
        const time = departureTime.split("+")[0];
        const [hours] = time.split(":").map((num) => parseInt(num, 10));
        return hours >= 18 || hours < 24;
    };

    // Fixed function to compute total stop count
    const getTotalStopCount = (flight) => {
        if (!flight.legs) return 0;
        
        // For each leg, count stops as (number of schedules - 1) + sum of stopCount in each schedule
        return flight.legs.reduce((total, leg) => {
            const schedulesInLeg = leg.schedules || [];
            // If there are multiple schedules in a leg, that means (schedules.length - 1) intermediate stops
            const connectingStops = Math.max(0, schedulesInLeg.length - 1);
            
            // Plus any additional stops within individual schedules
            const additionalStops = schedulesInLeg.reduce((legTotal, schedule) => {
                return legTotal + (schedule.stopCount || 0);
            }, 0);
            
            return total + connectingStops + additionalStops;
        }, 0);
    };

    // Helper function to check if flight is non-stop (all legs have exactly 1 schedule with 0 stops)
    const isNonStop = (flight) => {
        if (!flight.legs) return false;
        
        return flight.legs.every(leg => {
            const schedules = leg.schedules || [];
            // Non-stop means exactly 1 schedule per leg with 0 stops
            return schedules.length === 1 && (schedules[0].stopCount || 0) === 0;
        });
    };

    // Helper function to get flight codes from your JSON structure
    const getFlightCodes = (flight) => {
        if (!flight.legs) return [];
        const codes = [];
        flight.legs.forEach(leg => {
            leg.schedules?.forEach(schedule => {
                if (schedule.carrier?.marketing) {
                    codes.push(schedule.carrier.marketing);
                }
            });
        });
        return codes;
    };

    // Helper function to get first departure time
    const getFirstDepartureTime = (flight) => {
        if (!flight.legs || !flight.legs[0] || !flight.legs[0].schedules || !flight.legs[0].schedules[0]) {
            return null;
        }
        return flight.legs[0].schedules[0].departure?.time;
    };

    const applyFilters = (flights) => {
        return flights.filter((flight) => {
            const departureTime = getFirstDepartureTime(flight);
            const isLate = departureTime && isLateDeparture(departureTime);
            
            const isMorning = departureTime && (() => {
                const [hours] = departureTime
                    .split("+")[0]
                    .split(":")
                    .map((num) => parseInt(num, 10));
                return hours >= 0 && hours < 10;
            })();

            // Check if refundable based on your JSON structure
            const isRefundable = flight?.morePricingInfo?.fare?.passengerInfoList?.[0]?.passengerInfo?.nonRefundable === false || flight?.morePricingInfo?.nonRefundable === false;

            // Get flight codes for this flight
            const flightCodes = getFlightCodes(flight);
            const hasAllowedAirline = flightCodes.some((code) =>
                allowedAirlines.includes(code)
            );

            const totalStops = getTotalStopCount(flight);
            const flightIsNonStop = isNonStop(flight);

            return (
                (!quickFilters.includes("Late Departures") || isLate) &&
                (!quickFilters.includes("Morning Departures") || isMorning) &&
                (!quickFilters.includes("Refundable Fares") || isRefundable) &&
                (!quickFilters.includes("Non Stop") || flightIsNonStop) &&
                (!quickFilters.includes("1 Stop") || totalStops === 1) &&
                (allowedAirlines.length === 0 || hasAllowedAirline)
            );
        });
    };

    const filteredData = applyFilters(dataSet);

    // Helper function to get total elapsed time from your JSON structure
    const getTotalElapsedTime = (flight) => {
        if (!flight.legs) return Infinity;
        return flight.legs.reduce((total, leg) => {
            return total + leg.schedules.reduce((legTotal, schedule) => {
                return legTotal + (schedule.elapsedTime || 0);
            }, 0);
        }, 0);
    };

    const sortFlights = (option, flights) => {
        return [...flights].sort((a, b) => {
            const fareA = a?.pricing?.totalPrice ?? 0;
            const fareB = b?.pricing?.totalPrice ?? 0;
            const durationA = getTotalElapsedTime(a);
            const durationB = getTotalElapsedTime(b);

            if (option === "PRICE_ASC") return fareA - fareB;
            if (option === "PRICE_DESC") return fareB - fareA;
            if (option === "DURATION_ASC") return durationA - durationB;
            if (option === "DURATION_DESC") return durationB - durationA;
            if (option === "BEST")
                return fareA !== fareB ? fareA - fareB : durationA - durationB;
            return 0;
        });
    };

    const sortedData = sortFlights(sortOption, filteredData);
    return sortedData;
}