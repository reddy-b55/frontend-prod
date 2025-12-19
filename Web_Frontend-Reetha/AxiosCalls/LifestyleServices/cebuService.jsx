import axios from "axios";
import { ca } from "date-fns/locale";
import React from "react";
 
const getCebAttractionDetails = async (lifestyleId) => {
  let responseData = null;
 
//   console.log(
//     { lifestyle_id: lifestyleId },
//     `cebu/product/${lifestyleId}`,
//     "Detail Cebu API call"
//   );
 
  try {
    await axios.get(`cebu/product/${lifestyleId}`).then((response) => {
      responseData = response?.data;
    });
  } catch (error) {
    console.error("Error fetching attraction details:", error);
  }
 
  return responseData;
};


const getTicketAvailability = async (skuId, date) => {

    let responseData = null;
    console.log(skuId, date, "CHAMODDDDDDDDDDDDDDDDD")
try{
    await axios.get(`/cebu/ticket/availabilities/${skuId}`, {
        params: {
            date: date
        }}).then((response) => {
        responseData = response?.data;
    });


}catch(error) {
    console.error("Error fetching attraction details:", error);
    responseData = null;
}

return responseData;

}
 
export { getCebAttractionDetails, getTicketAvailability };