import axios from 'axios'
import React from 'react'

const getBridgifyAttractionDetails = async (id, dataId) => {

    var responseData = null




    console.log(`bridgify/attractions/${dataId}/details`, id, "Detail Bridgify sasdasdasdasdasdasd")
    await axios.get(`bridgify/attractions/${dataId}/details`, {
        params: { user_id: id }
    }).then(response => {
        responseData = response?.data;

        console.log("response data set is", responseData)
    });

    return responseData
}



const getBridgifyValdiationData = async (cart_item_id, data) => {
   
    var responseData = null

    await axios.get(`bridgify/attractions/cart/item/${cart_item_id}/${data}`).then(response => {
        responseData = response
    })

    return responseData
}


// const submitValidationBridgifyData = async (cart_item_id, data, params) => {
//     console.log("dataaaaa buddyyyy", data, params)
//     var responseData = null

//     await axios.post(`bridgify/attractions/cart/item/${cart_item_id}/${data}`, params).then(response => {
//         responseData = response
//     })

//     console.log(`bridgify/attractions/cart/item/${cart_item_id}/${data}`)

//     return responseData

// }

const submitValidationBridgifyData = async (cart_item_id, data, params) => {
    console.log("dataaaaa buddyyyy", data, params);

    // Ensure params and selectedValue exist
    if (params?.selectedValue && Array.isArray(params.selectedValue)) {
        params.selectedValue = params.selectedValue.map(item => ({
            ...item,
            Phoneno: item.Phoneno && typeof item.Phoneno === "string" && !item.Phoneno.startsWith("+") 
                ? `+${item.Phoneno}` 
                : item.Phoneno
        }));
    }

    console.log("Updated params:", params);

    var responseData = null;

    try {
        const response = await axios.post(`bridgify/attractions/cart/item/${cart_item_id}/${data}`, params);
        responseData = response;
    } catch (error) {
        console.error("Axios request error:", error);
    }

    console.log(`bridgify/attractions/cart/item/${cart_item_id}/${data}`);

    return responseData;
};




const getBridgifyRequiredFieldsArray = () => {
    const fieldsArray = [
        "pickups",
        "seats-map",
        "dates",
        "timeslots",
        "tickets",
        "customer-info",
        "shipment-method",
        "language",
        "options",
        "optional-extras"
    ]

    return fieldsArray
}

export { getBridgifyAttractionDetails, getBridgifyValdiationData, getBridgifyRequiredFieldsArray, submitValidationBridgifyData }
