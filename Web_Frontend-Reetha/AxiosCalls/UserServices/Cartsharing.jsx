import axios from "axios";

const getSharedCartsByMe = async (id) => {
    let result = [];
    await axios.get(`/get_self_sharing_carts/${id}/Shared`).then((response) => {
        if (response.status === 200 && response.data.status === "success") {
            result = response.data.data;
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getCartReq = async (id) => {
    let result = [];
    await axios.get(`/get_incoming_carts_by_user/${id}/Pending`).then((response) => {
        if (response.status === 200 && response.data.status === "success") {
            if (response.status === 200 && response.data.status === "success") {
                result = response.data.data;
            } else {
                result = "Something went wrong !"
            }
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getSentRequestsByme = async (id) => {
    let result = [];
    await axios.get(`/get_self_sharing_carts/${id}/Pending`).then((response) => {
        if (response.status === 200 && response.data.status === "success") {
            result = response.data.data;
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getAcceptedCarts = async (id) => {
    let result = [];
    await axios.get(`/get_incoming_carts_by_user/${id}/Shared`).then((response) => {
        if (response.status === 200 && response.data.status == "success") {
            result = response.data.data;
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const handleSendReq = async (id, mail) => {
    let result = [];
    const dataSet = {
        email: mail
    }
    
    await axios.post(`/share_cart/${id}`, dataSet).then((response) => {
        console.log("SHARE CART FULL RESPONSE:", response);

        if (response.status === 200 && response.data.status == "success") {
            result = "success";
        } else if (response.status === 200 && response.data.status == "fail") {
            // Check the specific error message
            const errorMessage = response.data.messege?.toLowerCase() || '';
            
            if (errorMessage.includes('already') || 
                errorMessage.includes('shered') || 
                errorMessage.includes('shared')) {
                result = "already_shared";
            } else if (errorMessage.includes('not found') || 
                      errorMessage.includes('user') || 
                      errorMessage.includes('email')) {
                result = "failed";
            } else {
                result = "failed";
            }
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    
    return result;
}
const handleAccept = async (value) => {
    try {
        await axios.post(`/accept_cart/${value}`).then(response => {
            if (response.status === 200 && response.data.status === "success") {
                return true;
            } return false;
        });
    } catch (error) {
        return false;
    }
};

const handleReject = async (value) => {
    let result = []
    try {
        await axios.post(`/cancel_self_cart_request/${value}`).then(response => {
            if (response.status === 200 && response.data.status === "success") {
                result = { 'status': 'sucess', "message": response.data.messege };
            } else {
                result = { 'status': 'error', "message": response.data.messege };
            };
        });
    } catch (error) {
        result = { 'status': 'error', "message": response.data.messege };
    }
    return result;
}

const handleStop = async (value) => {
    let result = []
    await axios.post(`/stop_self_shared_cart/${value}`).then((response) => {
        if (response.data.status == 'success') {
            result = response.data.status;
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

export { getSharedCartsByMe, getCartReq, getSentRequestsByme, getAcceptedCarts, handleSendReq, handleAccept, handleReject, handleStop };