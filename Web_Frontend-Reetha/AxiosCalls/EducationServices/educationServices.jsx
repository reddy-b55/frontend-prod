import axios from "axios"
import EducationPricing from "../../GlobalFunctions/EducationFunctions/EducationPricing"

const getAllEducationProducts = async (mainId, category1, category2, category3, currentOffset, id, dataSorterKeys, latitude, longitude,vendor) => {
    let result = []
    const valueDataSet = {
        sortArray: dataSorterKeys?.toString() === 'default' ? '' : dataSorterKeys?.toString()
    }
    let location = latitude + ',' + longitude
    // await axios.post(`/get-all-educations/${mainId}/${category1}/${category2}/${category3}/${currentOffset}/${id}`, valueDataSet).then((response) => {
        await axios.post(`/get-all-educations_distance/${mainId}/${category1}/${category2}/${category3}/${currentOffset}/${location}/${vendor}`, valueDataSet).then((response) => {
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

const getEducationData = async (id) => {
    let result = []
    await axios.get(`/get-all-educations-by-id/${id}`).then(res => {
        if (res.data.status === 200) {
            result = res.data
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getPricingbytimeslot = async (inventory_id) => {
    let result = []
    await axios.get(`get-rate-by-inventory-id/${inventory_id}`).then(res => {
        if (res.data.status === 200) {
            result = EducationPricing(res.data.educationRate[0])
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const createNewClassRequest = async (dataSet) => {
    let result = false;
    await axios.post("create-new-class-request", dataSet).then(response => {
        if (response.status === 200 && response.data.status === 200) {
            result = true
        } else {
            result = false
        }
    }).catch(err => {
        result = false
    })
    return result;
}

export { getAllEducationProducts, getEducationData, getPricingbytimeslot, createNewClassRequest };