import axios from "axios";

const deleteCartByid = async (data) => {
    let result = true
    await axios.post('delete-customer-cart-item', data, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        if (res.data.status === 200) {
            result = true;
        } else {
            result = false
        }
    }).catch((err) => {
        result = false;
    })
    return result;
}

const sendFeedback = async (dataSet) => {
    let result = []
    await axios.post("/send_feedback", dataSet).then((response) => {
        if (response.status === 200) {
            result = response;
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = "Internal server error !"
    })
}

const sendOverallFeedback = async (dataSet) => {
    let result = false;
    await axios.post('send_overall_feedback', dataSet).then((res) => {
        if (res.status === 200) {
            result = true
        }
    }).catch((err) => {
        result = false
    })
    return result;
}

export { deleteCartByid, sendFeedback, sendOverallFeedback };