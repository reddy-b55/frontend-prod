import axios from 'axios';


// const getBridgifyAttractionDetails = async (id, dataId) => {
//     console.log("addddddddddddddddd", id, dataId)
//     var responseData = null
//     await axios.get(`bridgify/attractions/ffff0f10-2c20-491b-ace4-27f4423cc765/details`, {
//         params: { user_id: 644 }
//     }).then(response => {
//         responseData = response?.data;
//     });
 
//     return responseData
// }

const getBridgifyAttractionDetails = async (id, dataId) => {
    console.log("bridgefy dataaaaa pass", id, dataId)
    let result = [];
    var responseData = null
    await axios.get(`bridgify/attractions/ffff0f10-2c20-491b-ace4-27f4423cc765/details`, {
        params: { user_id: '644' }
    }).then(res => {
        if (res.status === 200) {
            result = res.data
            console.log("bridgefy dataaaaa pass valuess", res.data)
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        console.log("bridgefy dataaaaa pass", err)
        result = '(Internal Server Error)'
    });
    return result;
}

export { getBridgifyAttractionDetails };