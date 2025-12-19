import axios from 'axios';

export const sendOTP = async (phoneNumber,userid) => {
    try {
        let phone = `+${phoneNumber}`;
        console.log("phoneNumber", phone);
        const response = await axios.post('/verification/send-code', {
            type: 'contact_number',
            value: phone,
            userID : userid
        });
        console.log(response);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
};


export const verifyOTP = async (phoneNumber, otp,userid) => {
    try {
        let phone = `+${phoneNumber}`;
        const response = await axios.post('/verification/verify-code', {
            value: phone,
            type: 'contact_number',
            code: otp,
            userID : userid
         });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Invalid OTP');
    }
};
export const sendOTPEmail = async (email,userid) => {
    try {
        console.log("email", email);
        
        const response = await axios.post('/verification/send-code', {
            value: email,
            type: 'customer_email',
            userID : userid
        });
        console.log(response);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
};


export const verifyOTPEmail = async (email, otp,userid) => {
    try {
        console.log(otp, 'Dataaaaaa')
        const response = await axios.post('/verification/verify-code', {
            type: 'customer_email',
            value: email,
            code: otp,
            userID : userid
         });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Invalid OTP');
    }
};