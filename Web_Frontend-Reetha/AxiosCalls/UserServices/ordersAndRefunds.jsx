import axios from "axios";

const getUserOrderDetails = async (id, val) => {
    let result = []
    await axios.get(`fetch-all-order-userwise/${id}/${val}`).then((response) => {
        if (response.data.status === 200) {
            result = response.data;
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result
}

export { getUserOrderDetails }