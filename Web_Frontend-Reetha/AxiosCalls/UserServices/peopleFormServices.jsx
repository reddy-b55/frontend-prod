import axios from "axios";

const addPerson = async (dataSet) => {
    var result = [];
    await axios.post("save_passenger_details", dataSet).then(response => {
        if (response.data.status == 200) {
            result = response?.data?.passenger
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result
}

const editPerson = async (dataSet, id) => {
    var result = [];
    await axios.post(`update_passenger_details/${id}`, dataSet).then(response => {
        if (response.data.status == 200) {
            result = response?.data?.passenger
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result
}

const getPerson = async (id) => {
    var result = [];
    await axios.get(`get_passenger_details_by_id/${id}`).then(response => {
        if (response.data.status == 200) {
            result = response.data.passengers
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result
}

export { addPerson, getPerson, editPerson }