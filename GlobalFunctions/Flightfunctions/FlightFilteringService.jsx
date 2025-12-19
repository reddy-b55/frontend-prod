import React from "react";

export default function flightsFiltering(dataSet, sortOptions) {
    if (!Array.isArray(dataSet) || dataSet.length === 0) {
        console.log("Dataset is empty or not an array:", dataSet);
        return [];
    }

    const sortOption = sortOptions?.sortOption || "PRICE_ASC";
    const quickFilters = sortOptions?.quickFilters || [];
    const allowedAirlines = sortOptions?.airlines || []; // List of airlines to filter

    //   console.log("Sorting Option:", sortOptions);
    //   console.log(
    //     "Original Data Set Before Sorting:",
    //     JSON.stringify(dataSet, null, 2)
    //   );

    const isLateDeparture = (departureTime) => {
        const time = departureTime.split("+")[0];
        const [hours] = time.split(":").map((num) => parseInt(num, 10));
        return hours >= 22 || hours < 6;
    };

    // Helper function to compute total stop count
    const getTotalStopCount = (scheduleData) => {
        if (!scheduleData) return 0;
        // Flatten nested arrays if any
        const flattened = scheduleData.flatMap((item) =>
            Array.isArray(item) ? item : [item]
        );
        return flattened.reduce(
            (acc, schedule) => acc + (schedule?.stopCount ?? 0),
            0
        );
    };

    const applyFilters = (flights) => {
        return flights.filter((flight) => {
            const scheduleData = flight?.scheduleData;
            const firstSchedule = scheduleData?.[0];
            let departureTime;

            if (Array.isArray(firstSchedule)) {
                departureTime = firstSchedule?.[0]?.departure?.time;
            } else {
                departureTime = firstSchedule?.departure?.time;
            }

            const isLate = departureTime && isLateDeparture(departureTime);
            const isMorning =
                departureTime &&
                (() => {
                    const [hours] = departureTime
                        .split("+")[0]
                        .split(":")
                        .map((num) => parseInt(num, 10));
                    return hours >= 6 && hours < 12;
                })();

            const isRefundable =
                flight?.dataFlight?.pricingInformation?.[0]?.fare
                    ?.passengerInfoList?.[0]?.passengerInfo?.nonRefundable === false;
            const hasAllowedAirline = flight?.flightCodes?.some((code) =>
                allowedAirlines.includes(code)
            );
            const totalStops = getTotalStopCount(scheduleData);
            // console.log(totalStops, "Total Stop Count isss");
            return (
                (!quickFilters.includes("Late Departures") || isLate) &&
                (!quickFilters.includes("Morning Departures") || isMorning) &&
                (!quickFilters.includes("Refundable Fares") || isRefundable) &&
                (!quickFilters.includes("Non Stop") || totalStops === 0) &&
                (!quickFilters.includes("1 Stop") || totalStops === 1) &&
                (allowedAirlines.length === 0 || hasAllowedAirline)
            );
        });
    };

    const filteredData = applyFilters(dataSet);
    // console.log(
    //     "Filtered Data (With All Filters):",
    //     JSON.stringify(filteredData, null, 2)
    // );

    const getTotalElapsedTime = (legsData) => {
        if (!legsData) return Infinity;
        if (Array.isArray(legsData)) {
            return legsData.reduce(
                (total, leg) => total + (leg?.elapsedTime ?? 0),
                0
            );
        }
        return legsData.elapsedTime ?? Infinity;
    };

    const sortFlights = (option, flights) => {
        return [...flights].sort((a, b) => {
            const fareA = a?.totalFare?.totalPrice ?? 0;
            const fareB = b?.totalFare?.totalPrice ?? 0;
            const durationA = getTotalElapsedTime(a?.legsData);
            const durationB = getTotalElapsedTime(b?.legsData);

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