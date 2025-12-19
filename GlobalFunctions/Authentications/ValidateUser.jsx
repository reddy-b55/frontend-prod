import axios from "axios";

const validateUser = async (userId, hashKey) => {

    let result = [];
    let dataSet = { user_id: userId, hashKey: hashKey }

    await axios.post("check-hashkey-user-availability", dataSet).then(async (response) => {
        if (response.data.status == 200) {
            await axios.get(`/authenicate-user-byid/${userId}`, { xsrfHeaderName: "X-CSRF-Token", withCredentials: true, }).then((response) => {
                result = response.data;
            }).catch((error) => {
                result = '(Internal Server Error)'
            })
        } else {
            result = false
        }
    }).catch((error) => {
        result = false
    })

    return result;

}


export default validateUser;