import axios from "axios";

const getImageUrl = (url) => {
    if (!url) {
        return "";
    } else if (url.startsWith("http")) {
        return url;
    }
    return axios.defaults.data + url;
}

export default getImageUrl;