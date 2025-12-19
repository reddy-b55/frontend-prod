import axios from "axios";
import ClearCookiesAndStorage from "./ClearCookiesAndStorage";

const AuthenticateUser = async (userID) => {
    let result = [];
    await axios.get(`/authenicate-user-byid/${userID}`, {
        xsrfHeaderName: "X-CSRF-Token", withCredentials: true,
    }).then((response) => {
        if (response.data.status === 200) {
            if (response.data.user_username === "") {
                ClearCookiesAndStorage();
            } else {
                result = response;
            }
        }
    }).catch((error) => {
        ClearCookiesAndStorage();
        result = '(Internal Server Error)'
    })
    return result;
}

export default AuthenticateUser