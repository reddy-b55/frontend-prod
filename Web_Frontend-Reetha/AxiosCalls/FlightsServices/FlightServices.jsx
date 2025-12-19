import axios from "axios";
import { getArrivalDateMethod } from "../../GlobalFunctions/Flightfunctions/Flightfunctions";

const getFlightsDataSabare = async (dataSet) => {
    let result = []
    await axios.post('check-availability_Sabre_Flight', dataSet, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        if (res.data.status === 200) {
            result = res.data
        } else if (res.data.status === 404) {
            result = res.data
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const revalidating = async (value, customerSearchdata, travelData, seatCount) => {
    // console.log("value", value)
    // console.log("customerSearchdata", seatCount)
    let result;

    var depDateTime = new Array();
    var departure = new Array();
    var arrival = new Array();
    var flightCode = new Array();
    var flightNumber = new Array();
    var finalFlightCodes = new Array();
    var finalFlightNumbers = new Array();

    value?.scheduleData?.forEach(scheduleData => {
        depDateTime.push(travelData.dep_date)
        departure.push(scheduleData['departure']['airport'])
        arrival.push(scheduleData['arrival']['airport'])
        flightCode.push(scheduleData['carrier']['marketing'])
        flightNumber.push(scheduleData['carrier']['marketingFlightNumber'])
    });

    var uniqueArrCodes = [...new Set(flightCode.map((codes) => codes))]
    var uniqueArrNumbers = [...new Set(flightNumber.map((numbers) => numbers))]

    if (uniqueArrCodes.length === 1 && uniqueArrNumbers.length === 1) {
        finalFlightCodes = flightCode[0];
        finalFlightNumbers = flightNumber[0];
    } else {
        finalFlightCodes = flightCode.toString();
        finalFlightNumbers = flightNumber.toString();
    }
    console.log("finalFlightCodes", seatCount.passengerType)
    const dataSet = {
        trip_type: 'One Way',
        flightId: value?.id,
        refKey: value?.refKey,
        // maindep_datetime_one: customerSearchdata.dep_date,
        maindep_datetime_one: value.itenaryGroupData.legDescriptions[0].departureDate,
        departure_datetime: value.itenaryGroupData.legDescriptions[0].departureDate,
        arrival_datetime:value.itenaryGroupData.legDescriptions[0].departureDate,
        origin_location: departure.toString(),
        dest_location: arrival.toString(),
        // passenger_type: value.dataFlight.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.passengerType,
        passenger_type: seatCount.passengerType,
        seat_count: seatCount.seat_count,
        flight_code: finalFlightCodes,
        flight_number: finalFlightNumbers,
        main_origin_location: departure[0],
        main_dest_location: arrival[arrival.length - 1],
        cabin_code : value.dataFlight.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.fareComponents[0].segments[0].segment.cabinCode,
        flightData: JSON.stringify(value)
    }


    // console.log("dataSet flights", dataSet)

    await axios.post('revalidating_Sabre_Flight', dataSet, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        if (res.data.status === 200) {
            // console.log(res.data.data_set.groupedItineraryResponse, "res.data.data_set.groupedItineraryResponse")
            result = res.data.data_set.groupedItineraryResponse
        } else {
            result = '(Internal Server Error)'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    });
    return result;
}

const handleRoundTripViewMore = async (value, customerSearchdata, travelData, seatCount) => {

    // console.log("value", value)
    // console.log("customerSearchdata", seatCount)
    let result;

    var depDateTime = new Array()
    var arrDateTime = new Array()
    var departure = new Array()
    var arrival = new Array()
    var flightCode = new Array()
    var flightNumber = new Array()
    var finalDates = new Array()
    var finalFinalCodes = new Array()
    var finalFlightNumbers = new Array()
    var mainDepLocation = new Array()
    var mainArrLocation = new Array()
    var locationIndexes = new Array()

    if (customerSearchdata.dep_date !== '') {
       
        var scheduleData = travelData?.scheduleData
        // console.log("travelData", travelData)
        finalDates.push(customerSearchdata.dep_date_origin)
        finalDates.push(customerSearchdata.return_date)
        scheduleData?.forEach((schedule, index) => {
            mainDepLocation.push(scheduleData[index][0]['departure']['airport'])
            mainArrLocation.push(scheduleData[index][scheduleData[index].length - 1]['arrival']['airport'])
            schedule?.forEach(subSchedule => {
                depDateTime.push(finalDates[index])
                arrDateTime.push(finalDates[index])
                departure.push(subSchedule['departure']['airport'])
                arrival.push(subSchedule['arrival']['airport'])
                flightCode.push(subSchedule['carrier']['marketing'])
                flightNumber.push(subSchedule['carrier']['marketingFlightNumber'])
                locationIndexes.push(index);
            });
        });
    }

    var uniqueArrCodes = [...new Set(flightCode.map((codes) => codes))]
    var uniqueArrNumbers = [...new Set(flightNumber.map((numbers) => numbers))]

    if (uniqueArrCodes.length === 1 && uniqueArrNumbers.length === 1) {
        finalFinalCodes = flightCode[0];
        finalFlightNumbers = flightNumber[0];
    } else {
        finalFinalCodes = flightCode.toString();
        finalFlightNumbers = flightNumber.toString();
    }

    // console.log("finalFinalCodes", depDateTime)

    const dataSet = {
        trip_type: 'Round Trip',
        departure_datetime: value.itenaryGroupData.legDescriptions[0].departureDate,
        arrival_datetime: value.itenaryGroupData.legDescriptions[1].departureDate,
        // locationIndexes: locationIndexes.toString(),
        // origin_location: departure.toString(),
        // dest_location: arrival.toString(),
        // passenger_type: customerSearchdata.passenger_type,
        passenger_type: seatCount.passengerType,
        // seat_count: customerSearchdata.seat_count,
        seat_count: seatCount.seat_count,
        // flight_code: finalFinalCodes,
        // flight_number: finalFlightNumbers,
        // mainDepLocation: mainDepLocation.toString(),
        // mainArrLocation: mainArrLocation.toString(),
        cabin_code : value.dataFlight.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.fareComponents[0].segments[0].segment.cabinCode,
        flightData: JSON.stringify(value),
        // passenger_type: value.dataFlight.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.passengerType,
    }

    // const dataSet = {
    //     "trip_type": "Round Trip",
    //     "departure_datetime": "2025-04-25,2025-04-25,2025-05-09,2025-05-09",
    //     "arrival_datetime": "2025-04-25,2025-04-25,2025-05-09,2025-05-09",
    //     // "locationIndexes": "0,0,1,1",
    //     // "origin_location": "CMB,AUH,XNB,AUH",
    //     // "dest_location": "AUH,XNB,AUH,CMB",
    //     "passenger_type": "ADT",
    //     "seat_count": 1,
    //     // "flight_code": "EY,EY,EY,EY",
    //     // "flight_number": "395,5418,5429,392",
    //     // "mainDepLocation": "CMB,XNB",
    //     // "mainArrLocation": "XNB,CMB",
    //     "cabin_code": "C",
    //     "flightData": "{\"id\":5,\"flightCodes\":[\"EY\",\"EY\",\"EY\",\"EY\"],\"totalFare\":{\"totalPrice\":286198,\"totalTaxAmount\":29098,\"currency\":\"LKR\",\"baseFareAmount\":855,\"baseFareCurrency\":\"USD\",\"constructionAmount\":855,\"constructionCurrency\":\"NUC\",\"equivalentAmount\":257100,\"equivalentCurrency\":\"LKR\"},\"itenaryGroupData\":{\"legDescriptions\":[{\"departureDate\":\"2025-04-25\",\"departureLocation\":\"CMB\",\"arrivalLocation\":\"XNB\"},{\"departureDate\":\"2025-05-09\",\"departureLocation\":\"XNB\",\"arrivalLocation\":\"CMB\"}]},\"dataFlight\":{\"id\":5,\"pricingSource\":\"ADVJR1\",\"legs\":[{\"ref\":24},{\"ref\":16}],\"pricingInformation\":[{\"pricingSubsource\":\"HPIS\",\"fare\":{\"validatingCarrierCode\":\"EY\",\"vita\":true,\"eTicketable\":true,\"lastTicketDate\":\"2025-04-15\",\"lastTicketTime\":\"23:59\",\"governingCarriers\":\"EY EY\",\"passengerInfoList\":[{\"passengerInfo\":{\"passengerType\":\"ADT\",\"passengerNumber\":1,\"nonRefundable\":true,\"fareComponents\":[{\"ref\":9,\"beginAirport\":\"CMB\",\"endAirport\":\"XNB\",\"segments\":[{\"segment\":{\"bookingCode\":\"Z\",\"cabinCode\":\"C\",\"mealCode\":\"M\",\"seatsAvailable\":7}},{\"segment\":{\"bookingCode\":\"Z\",\"cabinCode\":\"C\",\"mealCode\":\"N\",\"seatsAvailable\":7,\"availabilityBreak\":true}}]},{\"ref\":2,\"beginAirport\":\"XNB\",\"endAirport\":\"CMB\",\"segments\":[{\"segment\":{\"bookingCode\":\"Z\",\"cabinCode\":\"C\",\"mealCode\":\"N\",\"seatsAvailable\":3}},{\"segment\":{\"bookingCode\":\"Z\",\"cabinCode\":\"C\",\"mealCode\":\"M\",\"seatsAvailable\":3,\"availabilityBreak\":true}}]}],\"taxes\":[{\"ref\":14},{\"ref\":9},{\"ref\":1},{\"ref\":7},{\"ref\":2},{\"ref\":21}],\"taxSummaries\":[{\"ref\":9},{\"ref\":5},{\"ref\":14},{\"ref\":1},{\"ref\":4}],\"currencyConversion\":{\"from\":\"USD\",\"to\":\"LKR\",\"exchangeRateUsed\":300.6864},\"passengerTotalFare\":{\"totalFare\":286198,\"totalTaxAmount\":29098,\"currency\":\"LKR\",\"baseFareAmount\":855,\"baseFareCurrency\":\"USD\",\"equivalentAmount\":257100,\"equivalentCurrency\":\"LKR\",\"constructionAmount\":855,\"constructionCurrency\":\"NUC\",\"exchangeRateOne\":1},\"baggageInformation\":[{\"provisionType\":\"A\",\"airlineCode\":\"EY\",\"segments\":[{\"id\":0},{\"id\":1}],\"allowance\":{\"ref\":3}},{\"provisionType\":\"A\",\"airlineCode\":\"EY\",\"segments\":[{\"id\":2},{\"id\":3}],\"allowance\":{\"ref\":3}}],\"penaltiesInfo\":{\"penalties\":[{\"type\":\"Refund\",\"applicability\":\"Before\",\"refundable\":false},{\"type\":\"Refund\",\"applicability\":\"After\",\"refundable\":false},{\"type\":\"Exchange\",\"applicability\":\"Before\",\"changeable\":true,\"conditionsApply\":true,\"amount\":144400,\"currency\":\"LKR\"},{\"type\":\"Exchange\",\"applicability\":\"After\",\"changeable\":true,\"conditionsApply\":true,\"amount\":144400,\"currency\":\"LKR\"}]}}}],\"totalFare\":{\"totalPrice\":286198,\"totalTaxAmount\":29098,\"currency\":\"LKR\",\"baseFareAmount\":855,\"baseFareCurrency\":\"USD\",\"constructionAmount\":855,\"constructionCurrency\":\"NUC\",\"equivalentAmount\":257100,\"equivalentCurrency\":\"LKR\"}}}],\"diversitySwapper\":{\"weighedPrice\":763535.379}},\"legsData\":[{\"id\":24,\"elapsedTime\":470,\"schedules\":[{\"ref\":21},{\"ref\":7}]},{\"id\":16,\"elapsedTime\":510,\"schedules\":[{\"ref\":33},{\"ref\":35,\"departureDateAdjustment\":1}]}],\"legsRef\":[24,16],\"scheduleRef\":[[21,7],[33,35]],\"scheduleData\":[[{\"id\":21,\"frequency\":\"*****F*\",\"stopCount\":0,\"eTicketable\":true,\"totalMilesFlown\":2064,\"elapsedTime\":270,\"departure\":{\"airport\":\"CMB\",\"city\":\"CMB\",\"country\":\"LK\",\"time\":\"04:05:00+05:30\"},\"arrival\":{\"airport\":\"AUH\",\"city\":\"AUH\",\"country\":\"AE\",\"time\":\"07:05:00+04:00\",\"terminal\":\"A\"},\"carrier\":{\"marketing\":\"EY\",\"marketingFlightNumber\":395,\"operating\":\"EY\",\"operatingFlightNumber\":395,\"equipment\":{\"code\":\"32A\",\"typeForFirstLeg\":\"N\",\"typeForLastLeg\":\"N\"}}},{\"id\":7,\"trafficRestriction\":\"O\",\"frequency\":\"SMTWTFS\",\"stopCount\":0,\"eTicketable\":true,\"totalMilesFlown\":95,\"elapsedTime\":120,\"departure\":{\"airport\":\"AUH\",\"city\":\"AUH\",\"country\":\"AE\",\"time\":\"08:25:00+04:00\",\"terminal\":\"A\"},\"arrival\":{\"airport\":\"XNB\",\"city\":\"DXB\",\"country\":\"AE\",\"time\":\"10:25:00+04:00\"},\"carrier\":{\"marketing\":\"EY\",\"marketingFlightNumber\":5418,\"operating\":\"EY\",\"operatingFlightNumber\":5418,\"equipment\":{\"code\":\"BUS\",\"typeForFirstLeg\":\"N\",\"typeForLastLeg\":\"N\"}}}],[{\"id\":33,\"trafficRestriction\":\"O\",\"frequency\":\"SMTWTFS\",\"stopCount\":0,\"eTicketable\":true,\"totalMilesFlown\":95,\"elapsedTime\":120,\"departure\":{\"airport\":\"XNB\",\"city\":\"DXB\",\"country\":\"AE\",\"time\":\"22:30:00+04:00\"},\"arrival\":{\"airport\":\"AUH\",\"city\":\"AUH\",\"country\":\"AE\",\"time\":\"00:30:00+04:00\",\"terminal\":\"A\",\"dateAdjustment\":1},\"carrier\":{\"marketing\":\"EY\",\"marketingFlightNumber\":5429,\"operating\":\"EY\",\"operatingFlightNumber\":5429,\"equipment\":{\"code\":\"BUS\",\"typeForFirstLeg\":\"N\",\"typeForLastLeg\":\"N\"}}},{\"id\":35,\"frequency\":\"******S\",\"stopCount\":0,\"eTicketable\":true,\"totalMilesFlown\":2064,\"elapsedTime\":280,\"departure\":{\"airport\":\"AUH\",\"city\":\"AUH\",\"country\":\"AE\",\"time\":\"02:20:00+04:00\",\"terminal\":\"A\"},\"arrival\":{\"airport\":\"CMB\",\"city\":\"CMB\",\"country\":\"LK\",\"time\":\"08:30:00+05:30\"},\"carrier\":{\"marketing\":\"EY\",\"marketingFlightNumber\":392,\"operating\":\"EY\",\"operatingFlightNumber\":392,\"equipment\":{\"code\":\"320\",\"typeForFirstLeg\":\"N\",\"typeForLastLeg\":\"N\"}}}]]}"
    // }

    // console.log("customerSearchdata", dataSet)

    axios.defaults.withCredentials = true;

    if (dataSet) {
        await axios.post('revalidating_Sabre_Flight_RT_MC', dataSet, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then(res => {
            if (res.data.status === 200) {
                result = res.data.data_set.groupedItineraryResponse
                // console.log("result", result)
            } else {
                result = []
                result = '(Internal Server Error)'
            }
        }).catch((error) => {
            result = '(Internal Server Error)'
        });
    }

    return result
}

const validating = async (value, customerSearchdata, travelData, seatCount) => {

    // console.log("value", value?.itenaryGroupData?.legDescriptions?.[0]?.departureDate)
    // console.log("value", value?.itenaryGroupData?.legDescriptions?.[1]?.departureDate)
    // console.log("value", seatCount?.passengerType)
    // console.log("value", seatCount?.seat_count)
    // console.log("value",value?.dataFlight?.pricingInformation?.[0]?.fare?.passengerInfoList?.[0]?.passengerInfo?.fareComponents?.[0]?.segments?.[0]?.segment?.cabinCode)
    // console.log("customerSearchdata", customerSearchdata)
    // console.log("travelData", travelData)
    // console.log("seatCount", seatCount)
   

  

    const dataSet = {
        trip_type: 'Multi City',
        departure_datetime: value?.itenaryGroupData?.legDescriptions?.[0]?.departureDate,
        arrival_datetime: value?.itenaryGroupData?.legDescriptions?.[1]?.departureDate === undefined ? value?.itenaryGroupData?.legDescriptions?.[0]?.departureDate : value?.itenaryGroupData?.legDescriptions?.[1]?.departureDate,
        // locationIndexes: locationIndexes.toString(),
        // origin_location: departure.toString(),
        // dest_location: arrival.toString(),
        passenger_type: seatCount?.passengerType,
        // seat_count: customerSearchdata.seat_count,
        seat_count: seatCount?.seat_count,
        // flight_code: finalFinalCodes,
        // flight_number: finalFlightNumbers,
        // mainDepLocation: mainDepLocation.toString(),
        // mainArrLocation: mainArrLocation.toString(),
        cabin_code : value?.dataFlight?.pricingInformation?.[0]?.fare?.passengerInfoList?.[0]?.passengerInfo?.fareComponents?.[0]?.segments?.[0]?.segment?.cabinCode,
        flightData: JSON.stringify(value),
        // passenger_type: value.dataFlight.pricingInformation[0].fare.passengerInfoList[0].passengerInfo.passengerType,
    }

    // console.log("value", dataSet)
    // console.log("value", value)
    let result = [];
    axios.defaults.withCredentials = true;

    if (dataSet) {
        await axios.post('revalidating_Sabre_Flight_RT_MC', dataSet, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then(res => {
            if (res.data.status === 200) {
                result = res.data.data_set.groupedItineraryResponse
                // console.log("result", result)
            } else {
                result = '(Internal Server Error)'
            }
        }).catch((error) => {
            // console.log("result", error)
            result = '(Internal Server Error)'
        });
    }

    return result;

}

export { handleRoundTripViewMore, validating, revalidating, getFlightsDataSabare }