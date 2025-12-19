import axios from "axios";

// import AirplaneCodes from "../../../Data/AirplaneCodes.json";
// import AirportCodes from "../../../Data/AirportCodes.json";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import AirplaneCodes from "../GlobalFunctions/Data/AirplaneCodes.json"
import AirportCodes from "../GlobalFunctions/Data/AirportCodes.json"

const flightSearchAvailability = async (req) => {
  var data = [];


  console.log(req, "Req Data issss Check AvailXXXXX");
  await axios.post("flights/check-availability", req).then((res) => {
    if (res.data.status === 200) {
      // console.log("Flight data set is123456", res.data?.itinerary?.itinerary?.itineraries);
      data = res.data?.itinerary?.itineraries;
    } else {
      data = [];
    }
  });

  return data;
};

const getAirportName = (data) => {
  return AirportCodes.airport_codes?.filter(
    (flight) => flight?.iata_code == data
  )?.[0]?.["name"];
};

const getFlightNameMeta = (data) => {
  return AirplaneCodes?.filter((flight) => flight?.AirlineCode == data)?.[0]?.[
    "AlternativeBusinessName"
  ];
};

const saveDataFlights = async (key, data) => {
  try {
    const keyData = key?.toString();
    const dataJson = JSON.stringify(data);
    await AsyncStorage.setItem(keyData, dataJson);
    console.log("Data saved to AsyncStorage");
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

const loadDataFlightsAsync = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key?.toString());

    if (data !== null) {
      return data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error loading data:", error);
    return [];
  }
};

const revalidationResell = async (data) => {
  try {
    console.log(data, "Data value isssssssssssssYY");
    const response = await axios.post("flights/revalidationResell", data);

    console.log(response?.data, "Response Data XXXXXXXXXX");
    return response?.data;
  } catch (error) {
    console.error("Error fetching flight details: 123123123");
    return [];
  }
};

export {
  flightSearchAvailability,
  getFlightNameMeta,
  getAirportName,
  saveDataFlights,
  loadDataFlightsAsync,
  revalidationResell,
};
