import axios from "axios";

const getAllOffers = async (value) => {
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

const fetchDiscountData = async (cusID) => {
    try {
        console.log("userId", cusID)
        const response = await axios.get(`getAllActiveDiscounts/${cusID}`);
        if (response.data.status === 200) {
            console.log(response.data.discountData)
            return response.data.discountData
        }
    } catch (error) {
        console.error("Error fetching discount data:", error);
        return [];
    }
    // setLoading(false)
};

export { getAllOffers, fetchDiscountData };