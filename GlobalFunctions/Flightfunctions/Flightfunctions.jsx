import moment from "moment";

import AirportCodes from '../Data/AirportCodes.json'
import AirplaneCodes from '../Data/AirplaneCodes.json'

const convertToActualTime = (passingDate) => {
    var time = passingDate?.substring(0, 5)
    return time;
}

const elapsedTime = (length, key, value) => {
    if (length > 0 && key !== length - 1) {
        const betweentime = getTimeDifference(value?.[key]?.arrival?.time.slice(0, 8), value?.[key + 1]?.departure?.time.slice(0, 8))
        return `elapsedTime  ,${betweentime}`
    }
}

const convertToTime = (data) => {
    var minutesCount = 0;
    minutesCount = data;
    var Hours = Math.floor(minutesCount / 60)
    var minutes = minutesCount % 60
    if (Hours > 1) {
        if (minutes !== 0) {
            return Hours + "h " + minutes + "m";
        } else {
            return Hours + " Hours";
        }
    } else {
        if (minutes !== 0) {
            return Hours + "h " + minutes + "m";
        } else {
            return Hours + " Hour";
        }
    }
}

const getTimeDifference = (time1, time2) => {
    var startTime = moment(time1, 'hh:mm:ss')
    var endTime = moment(time2, 'hh:mm:ss')
    var duration = moment.duration(endTime.diff(startTime))
    var hours = parseInt(duration.asHours());
    return hours
}

const getArrivalDate = (departureDate, dataSet) => {
    var dateAdjusments = 0;
    dataSet?.legsData?.schedules?.forEach(data => {
        if (data.departureDateAdjustment) {
            dateAdjusments = 1
        } else {
            dateAdjusments = 0;
        }
    });
    return moment(departureDate).add(dateAdjusments, 'days').format("dddd, MMMM Do YYYY")
}

const getArrivalDateMethod = (departureDate, dataSet) => {
    var dateAdjusments = [];
    dataSet?.legsData?.schedules?.forEach(data => {
        if (data.departureDateAdjustment) {
            dateAdjusments.push(moment(departureDate).add(1, 'days').format("YYYY-MM-DD"))
        }
        else {
            dateAdjusments.push(moment(departureDate).format("YYYY-MM-DD"));
        }
    });
    return dateAdjusments
}

const getArrivalDateMulti = (departureDate, dataSet) => {
    var dateAdjusments = 0;
    dataSet?.schedules?.forEach(data => {
        if (data.departureDateAdjustment) {
            dateAdjusments = 1
        } else {
            dateAdjusments = 0;
        }
    });
    return moment(departureDate).add(dateAdjusments, 'days').format("dddd, MMMM Do YYYY")
}

const getbetweenStops = (data, stopsCount) => {
    const inBettweenStops = [];
    data.map((value, key) => {
        if (key === 0 || key === data.length - 1) {
            inBettweenStops.push(getCityName(value.arrival.city))
        }
    })
    if (data.length === 1) {
        return <p>Direct flight</p>
    } else if (data.length === 2) {
        return <p>one stop via ({getCityName(data[0].arrival.city)})</p>
    } else {
        return stopsCount ? <p> {inBettweenStops.slice(0, inBettweenStops.length - 1).join(' and ')}</p> : <p>{inBettweenStops.length} Stops via {inBettweenStops.join(' and ')}</p>
    }
}

const getCityName = (code) => {
    const loadData = AirportCodes.airport_codes;
    const countryByCountryCode = loadData?.filter(countryCode => {
        return countryCode.iata_code === code
    })
    return countryByCountryCode[0]?.['city_name']
}

const getCountryName = (code) => {
    const loadData = AirportCodes.airport_codes;
    const countryByCountryCode = loadData?.filter(countryCode => {
        return countryCode.iata_code === code
    })
    return countryByCountryCode[0]?.['country']
}

const getBaseFareDetails = (fareData) => {
    let baseFareDetails = 0;
    let baseCurrency = "";
    let totTax = 0;
    let fareDet = 0.00;
    totTax = totTax + fareData['fare']['totalFare'].totalTaxAmount
    baseFareDetails = baseFareDetails + fareData['fare']['totalFare'].equivalentAmount
    baseCurrency = fareData['fare']['totalFare'].currency
    fareDet = fareData['fare']['totalFare'].currency + " " + fareData['fare']['totalFare'].equivalentAmount
    return ({ baseFare: baseFareDetails, totalTax: totTax, finalTotal: baseFareDetails + totTax, currency: baseCurrency, fareDet: fareDet })
}

const getFlightCodes = (data) => {
    const flightCodeArray = new Array();
    data?.forEach(schedule => {
        const index = flightCodeArray.indexOf(schedule.carrier.marketing + " " + schedule.carrier.marketingFlightNumber);
        if (index === -1) {
            flightCodeArray.push(schedule.carrier.marketing + " " + schedule.carrier.marketingFlightNumber);
        }
    });
    return (
        <label className="mt-2">{flightCodeArray.toString()}</label>
    )
}

const getFlightName = (data) => {
    let airportName = '';
    try {
        airportName = AirplaneCodes.filter(flight => flight.AirlineCode === data)[0]['AirlineName']
    } catch (error) {
        airportName = data
    }
    return airportName;
}

const getMultiCityTime = (data) => {
    var minutesCount = 0;
    var totalTime = 0;
    data.forEach(element => {
        totalTime = totalTime + element.elapsedTime
    });
    minutesCount = totalTime;
    var Hours = Math.floor(minutesCount / 60)
    var minutes = minutesCount % 60
    if (minutes !== 0) {
        return Hours + "h " + minutes + "m";
    } else {
        if (minutes === 1) {
            return Hours + " Hour";
        } else {
            return Hours + " Hours";
        }
    }
}

const getMulticityTotalStops = (data) => {
    var flightCount = 0;
    // console.log("dataaaaaa",data)
    data.forEach(element => {
        flightCount = flightCount + element.stopCount
    });
    if (flightCount > 0) {
        if (flightCount > 1) {
            return "(" + flightCount + " Stops)";
        }
        else {
            return "(" + flightCount + " Stop)";
        }
    }
}

const getTotalTimeTBO = (date1, date2) => {
    const difference = new Date(date2) - new Date(date1);
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}hrs ${minutes}mins`;
}

const getTotalTime = (data) => {
    var Hours = Math.floor(data / 60)
    var minutes = data % 60
    if (minutes !== 0) {
        return Hours + "hrs " + minutes + "mins";
    }
    else {
        if (minutes === 1) {
            return Hours + " Hour";
        }
        else {
            return Hours + " Hours";
        }
    }
}

const getTotalTimeLayOver = (data) =>{
  

        // console.log("Transits",data);
        if (data.length < 2) return null;
     
        let transits = [];
     
        for (let i = 0; i < data.length - 1; i++) {
          const currentArrival = data[i]?.arrival;
          const nextDeparture = data[i + 1]?.departure;
          
          if (!currentArrival || !nextDeparture) continue;
     
          // console.log("Raw Arrival Time:", currentArrival.time);
          // console.log("Raw Departure Time:", nextDeparture.time);
     
          // Convert to moment with correct parsing
          let arrivalTime2 = moment(currentArrival.time, "HH:mm:ssZ").utc();
          let departureTime2 = moment(nextDeparture.time, "HH:mm:ssZ").utc();
     
          // Handle overnight layovers
          if (departureTime2.isBefore(arrivalTime2)) {
            departureTime2.add(1, "day");
          }
     
          // Calculate layover duration
          const layoverDuration = moment.duration(
            departureTime2.diff(arrivalTime2)
          );
          const layoverHours = Math.floor(layoverDuration.asHours());
          const layoverMinutes = layoverDuration.minutes();
        //   console.log("Transits layoverHours", layoverHours , layoverMinutes);
          //getAirportName(flightArrDepData[0]?.departure?.city)
          transits.push({
            airport: getCityName(currentArrival.airport),
            duration: `${layoverHours}h ${layoverMinutes}m`,
          });
        }
        // console.log("Transits final", transits);
     
        return transits;
    }



const getStopsCount = (data) => {
    let flightCount = Number(data.length) - 1;
    if (flightCount > 0) {
        if (flightCount > 1) {
            return "" + flightCount + " Stops";
        } else {
            return "" + flightCount + " Stop";
        }
    } else {
        return "Direct flight"
    }
}

export { getFlightName, getbetweenStops, getStopsCount, getTotalTime,getTotalTimeLayOver, getTotalTimeTBO, getMulticityTotalStops, getMultiCityTime, getFlightCodes, getBaseFareDetails, getCountryName, getArrivalDateMulti, getArrivalDateMethod, getArrivalDate, convertToTime, elapsedTime, getTimeDifference, convertToActualTime, getCityName }