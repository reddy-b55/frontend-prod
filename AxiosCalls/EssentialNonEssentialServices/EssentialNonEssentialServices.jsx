import axios from "axios"

const getProductDetailsEssentialNonEssential = async (id, mainIdVal, subIdVal, subSubIDVal, currentOffset, vendorId, dataSorterKeys, baseLocation) => {

    const locationBase =  JSON.stringify(baseLocation)
    let result = []
    // const valueDataSet = {
    //     sortArray: dataSorterKeys?.toString() === 'default' ? '' : dataSorterKeys?.toString(),
    //     locationData: JSON.stringify(baseLocation)
    // }

    const preData = {
        locationDescription:baseLocation?.locationDescription,
        latitude:baseLocation?.latitude,
        longitude:baseLocation?.longitude,
        dataSet:locationBase
    }

    const valueDataSet = {
        sortArray: dataSorterKeys?.toString() === 'default' ? '' : dataSorterKeys?.toString(),
        locationData: JSON.stringify(preData)
    }

    
    // console.log("location stringgify",`/get-list-data-with-discount/${id}/${mainIdVal}/${subIdVal}/${subSubIDVal}/${currentOffset}/${vendorId}`,  valueDataSet)
    await axios.post(`/get-list-data-with-discount/${id}/${mainIdVal}/${subIdVal}/${subSubIDVal}/${currentOffset}/${vendorId}`, valueDataSet).then((response) => {
        if (response.status === 200) {
            result = response.data
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    });
    return result;
}

const getRelatedProductDetailsEssNonEss = async (mainIdVal, subIdVal, subSubIDVal, currencyOffset) => {
    let result = []

    await axios.get(`/get-list-data-with-discount-related/${mainIdVal}/${subIdVal}/${subSubIDVal}/${0}/${currencyOffset}`).then((response) => {
        if (response.status === 200) {
            result = response
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const preUserOrderDetails = async (userID) => {
    let result = []
    await axios.get(`/get-pre-defined-orders/${userID}`).then((response) => {
        if (response.status === 200) {
            result = response
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getDetailsAboutProduct = async (newID) => {
    let result = []
    await axios.get(`/get-prodviewdata-byid/${newID}`).then((response) => {
        if (response.status === 200) {
            result = response.data
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getvariations = async (id) => {
    let result = [];
    await axios.get(`/get-variations-byid/${id}`).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getProductReiews = async (id, cat_id) => {
    let result = []
    await axios.get(`/get_feedbacks/${id}/${cat_id}`).then((response) => {
        if (response.status === 200) {
            result = response.data
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getProductDeliveryDetails = async (latLonMain, city, productLatlon, preferred_delivery_Date) => {
    let result = [];
    const dataSet = {
        latLonMain: productLatlon,
        latLonSecondary: latLonMain,
        cityName: city,
        date: preferred_delivery_Date
    }
    await axios.post('getDeliveryDetails', dataSet).then((response) => {
        if (response.status === 200) {
            result = response
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

export { getProductDetailsEssentialNonEssential, preUserOrderDetails, getProductReiews, getDetailsAboutProduct, getvariations, getRelatedProductDetailsEssNonEss, getProductDeliveryDetails };