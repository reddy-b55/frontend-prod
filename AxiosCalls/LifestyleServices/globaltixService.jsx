import axios from 'axios'
import React from 'react'

const getGlobalProductsDetails = async (id) => {

    var responseData = null
    // console.log(`bridgify/attractions/${dataId}/details`, id, "Detail Bridgify sasdasdasdasdasdasd")
    await axios.get(`globaltix/product/${id}`, {
        params: { user_id: id }
    }).then(response => {
        responseData = response?.data;

        console.log("response data set is", responseData)
    });

    return responseData
    
}

const getGlobalTixProductTickets = async (id) => {
    var responseData = [];
 
    try {
        const response = await axios.get(`/globaltix/product/${id}/tickets`);
        if (response?.data?.success == true) {
            responseData = response.data;
        }
 
    } catch (error) {
        console.error("Failed to fetch product tickets:", error);
        responseData = [];
    }
 
    return responseData
}


const getGlobalTixTickets = async (dataVal) => {
    var responseData = [];

    try {
        const response = await axios.post(`/globaltix/product/tickets/${dataVal}/availability`);
        console.log(response, "Response Data issssssssssssssssss332211")

        if (response?.data?.data?.length > 0) {
            responseData = response.data?.data;
        }

    } catch (error) {
        console.error("Failed to fetch product tickets:", error);
        responseData = [];
    }

    return responseData
}

export {getGlobalProductsDetails, getGlobalTixProductTickets, getGlobalTixTickets} 