import axios from "axios";

const getCartDataDetails = async (id) => {
    let result = []
    await axios.get(`/get-carts/${id}`).then((response) => {
        if (response.status === 200 && response.data.status == 200) {
            result = response;
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const createNewCart = async (data) => {
    let result = [];
    await axios.post('create-new-cart', data).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const deleteExistingCart = async (cartID) => {
    let result = "";
    await axios.post('deleteCustomCart', { 'cart_id': cartID }).then((res) => {
        if (res.status === 200) {
            result = "Successfull"
        } else {
            result = "Something went wrong !"
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const addLifestyleProduct = async (data) => {
    let result = "Something went wrong !";
    await axios.post('add-new-life-styles-booking', data).then((res) => {
        if (res.status === 200 && res.data.status === 300) {
            result = "Product already added to cart"
        } else if (res.status === 200 && res.data.status === 200) {
            result = "Successfull"
        } else if (res.status === 200 && res.data === "") {
            result = "Successfull"
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const addEducationProduct = async (data) => {
    let result = "Something went wrong !";
    await axios.post('add-education-booking', data).then((res) => {
        if (res.status === 200 && res.data.status === 300) {
            result = "Product already added to cart"
        } else if (res.status === 200 && res.data.status === 200) {
            result = "Successfull"
        } else if (res.status === 200 && res.data === "") {
            result = "Successfull"
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const addHotelsProduct = async (data) => {
    let result = "Something went wrong !";
    const bookingData = {
        blockData: JSON.stringify(data),
    };
    await axios.post('add_hotel_to_cart', bookingData).then((res) => {
        console.log("Cart Containorrrrrrrrrrrrrrrrrrr", res)
        if(res.status === 200 && res.data.status === 422) {
            result = `Something went wrong ! + ${res.data.message}`
        } else if (res.status === 200 ) {
            result = "Successfull"
        } else {
            result = `Something went wrong ! + ${res.data.message}`
        }
    }).catch((err) => {
        console.log("Cart Containorrrrrrrrrrrrrrrrrrr", err)
        result = '(Internal Server Error)'
    })
    return result;
}

const addEssentialNonEssentialProduct = async (data) => {
    let result = "Something went wrong !";
    await axios.post('create-new-order', data).then((res) => {
        if (res.status === 200 && res.data.status === 200) {
            result = "Successfull"
        } else if (res.status === 200 && res.data.status === 250) {
            result = "Updated"
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getOrderHistory = (id, type) => {
    return axios.get(`fetch-all-order-userwise/${id}/${type}`)
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return '(Internal Server Error)';
        });
}

export { getCartDataDetails, createNewCart, deleteExistingCart, addLifestyleProduct, addEducationProduct, addHotelsProduct, addEssentialNonEssentialProduct, getOrderHistory }