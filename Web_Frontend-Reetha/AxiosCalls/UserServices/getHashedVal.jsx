import Cookies from 'js-cookie';

const getHashedVal = () => {
    return Cookies.get('hashedVal')
};

export default getHashedVal;