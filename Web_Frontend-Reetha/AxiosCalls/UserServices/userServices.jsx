import axios from "axios";
import moment from "moment";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { auth } from "../../firebase";
import ToastMessage from "../../components/Notification/ToastMessage";

const checkPasswordStrength = (inputPassword) => {
    let strength = 0;
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(inputPassword);
    const hasLowercase = /[a-z]/.test(inputPassword);
    const hasNumber = /\d/.test(inputPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(inputPassword);
    if (inputPassword.length >= minLength) {
        strength += 1;
        if (hasUppercase) {
            strength += 1;
        }
        if (hasLowercase) {
            strength += 1;
        }
        if (hasNumber) {
            strength += 1;
        }
        if (hasSpecialChar) {
            strength += 1;
        }
    }
    return strength;
};

const loginManual = async (dataset) => {
    let result = []
    const registerUser = {
        email: dataset.userName,
        password: dataset.passWord
    }
    await axios.post("login-user", registerUser, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true,
    }).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = error
    });
    return result;
};

const register = async (dataSet) => {
    let result = []
    const dataset = {
        username: dataSet.userName,
        email: dataSet.email,
        password: dataSet.passWord,
    };
    await axios.post('new-user-registration', dataset, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then(res => {
        result = res
        if (result.data.status == 400) {
            for (const field in result.data.validation_error) {
                if (result.data.validation_error.hasOwnProperty(field)) {
                    const errors = result.data.validation_error[field];
                    errors.forEach(error => {
                        ToastMessage({ status: "error", message: error })
                    });
                }
            }
        } else if (result.data.status == 200) {
            ToastMessage({ status: "success", message: 'Registration successful! Please check your email to verify your account.' })
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

// const googleLogin = async () => {
//     let result = [];
//     const provider = new GoogleAuthProvider();
//     try {
//         const res = await signInWithPopup(auth, provider);
//         var uEmail = res.user['email'];
//         var username = res.user['displayName'];
//         var phoneNumber = res.user['phoneNumber'];
//         var photoURL = res.user['photoURL'];
//         const dataset = {
//             cutomer_id: "",
//             username: username,
//             email: uEmail,
//             customer_email: uEmail,
//             contact_number: phoneNumber,
//             customer_fname: username,
//             customer_profilepice: photoURL,
//             user_type: "Google",
//             user_platform: "google.com"
//         }
//         await axios.post('google-login-user', dataset, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then((response) => {
//             result = response;
//         }).catch((error) => {
//             throw new Error(error)
//         })
//     } catch (error) {
//         result = '(Internal Server Error)'
//     }
//     return result;
// };


const googleLogin = async () => {
    // Initialize auth and provider
    const provider = new GoogleAuthProvider();

    try {
        // Sign in with popup and await the result
        const res = await signInWithPopup(auth, provider);

        // Safely access user data using optional chaining
        const userData = {
            customer_id: "",  // You might want to generate this or get from backend
            username: res.user?.displayName || '',
            email: res.user?.email || '',
            customer_email: res.user?.email || '',
            contact_number: res.user?.phoneNumber || '',
            customer_fname: res.user?.displayName || '',
            customer_profilepic: res.user?.photoURL || '',
            user_type: "Google",
            user_platform: "google.com"
        };

        // Make the API call
        try {
            const response = await axios.post('/google-login-user', userData, {
                xsrfHeaderName: "X-XSRF-TOKEN",
                withCredentials: true
            });

            // Handle successful login
            return response;

        } catch (apiError) {
            throw new Error(`API Error: ${apiError.message}`);
        }

    } catch (authError) {
        // Handle specific Firebase auth errors
        if (authError.code === 'auth/popup-closed-by-user') {
            return { error: 'Login cancelled by user' };
        }

        if (authError.code === 'auth/popup-blocked') {
            return { error: 'Please allow popups for this website' };
        }

        throw new Error(`Authentication Error: ${authError.message}`);
    }
};


const handleConfirmEmailSubmit = async (dataset) => {
    let result = []
    const formData = {
        userEmail: dataset
    }
    axios.defaults.withCredentials = true;
    await axios.post('forgot-password-mobile', formData, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then((response) => {
        result = response
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const resetPassword = async (verificationData) => {
    let result = [];
    const formData = {
        token: verificationData.verificationcode,
        userPassword: verificationData.reEnteredPassword,
        userConfirmPassword: verificationData.confirmrReEnterPassword
    }
    await axios.post('userreset', formData, {
        xsrfHeaderName: "X-XSRF-TOKEN",
        withCredentials: true
    }).then((response) => {
        result = response
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getCartData = async (userId) => {
    let result = []
    await axios.get(`/get-customer-cart-data/${userId}`).then((res) => {
        if (res.data.status === 200) {
            result = res.data
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    });
    return result;
}

const getCartDataLength = async (userId) => {
    let result = []
    await axios.get(`/get-customer-cart-data-length/${userId}`).then((response) => {
        result = response.data
    }).catch((error) => {
        result = '(Internal Server Error)'
    });
    return result;
}

const getNotificationLength = async (userId) => {
    let result = []
    await axios.get(`/getNotificationsByUserCount/${userId}`).then((response) => {
        result = response.data
    }).catch((error) => {
        result = '(Internal Server Error)'
    });
    return result;
}


const addNewShippingAddress = async (dataSet) => {
    let result = []
    await axios.post('customer-new-shipping-address', dataSet, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then((res) => {
        if (res.data.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
};

const updateShippingAddress = async (id, dataset) => {
    let result = [];
    await axios.post(`update-shipping-address/${id}`, dataset, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then((res) => {
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

const deleteShippingAddress = async (id) => {
    let result = false;
    await axios.post(`delete-shipping-data/${id}`, { xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true }).then((res) => {
        if (res.data.status === 200) {
            result = true;
        } else {
            result = false;
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    });
    return result
};

const getShippingAddress = async (id) => {
    let result = [];
    await axios.get(`/get-addresses-by-id/${id}`).then((res) => {
        if (res.status === 200) {
            result = res.data.addresses
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getUserDetails = async (userId) => {
    let result = []
    await axios.get(`/get-customer-data-byid/${userId}`).then((res) => {
        if (res.data.status === 200) {
            result = res.data.customer_data
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}


const updateCustomerDetails = async (dataSet) => {
    let result = []
    await axios.post('/update-customer-profile', dataSet, {
        xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data; ', },
    }).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result
}

const updateCustomerDetailsImage = async (dataSet) => {
    let result = []
    await axios.post('/update-customer-profileimage', dataSet, {
        xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data; ', },
    }).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = 'Something went wrong !'
        }
    }).catch((error) => {
        result = '(Internal Server Error)'
    })
    return result
}

const fetchAllUserHistory = async (userid, ip) => {
    let result = [];
    await axios.post('/get_user_search_history', { uid: userid, uip: ip }).then((res) => {
        if (res.data.status === 200) {
            result = res.data.data_response;
        } else {
            result = 'Something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getSerachHistrory = async (id, value) => {
    await axios.post("/create_user_search_history", {
        uid: id,
        uip: "",
        search_text: value,
    }).catch((error) => {
        // console.error(error);
    });
}

const createAdvByUserId = async (userId) => {
    let result = [];
    await axios.get(`get-itinerary-by-user-id/${userId}`).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const createAdvByUserPrefinedDates = async (userId, dataSet) => {
    let result = [];
    const dataPack = {
        "start_date": moment(dataSet.startDate).format('YYYY-MM-DD'),
        "end_date": moment(dataSet.endDate).format('YYYY-MM-DD')
    }
    await axios.post(`get-itinerary-by-order/${userId}`, dataPack).then((res) => {
        if (res.status === 200) {
            result = res
        } else {
            result = "Something went wrong !"
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getSupplierDetails = async (categoryId, productId) => {
    let result = [];
    await axios.get(`get_supplier_id_by_product/${categoryId}/${productId}`).then((response) => {
        if (response.data.status === 200) {
            result = response.data
        } else {
            result = 'something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const getUserChats = async (userId) => {
    let result = [];
    await axios.get(`chats/${userId}`).then((res) => {
        if (res.status === 200) {
            result = res.data
        } else {
            result = 'something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const createNewChat = async (dataSet) => {
    let result = [];
    await axios.post('/addchats', dataSet).then(async (res) => {
        if (res.status === 200) {
            result = res;
            if (res.status === 200 && res.data.status === 200) {
                await axios.get(`updateFirstStatus/${res.data.chatData.customer_collection_id}`).then((res) => {
                })
            }
        } else {
            result = 'something went wrong !'
        }
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
    return result;
}

const createNewChatWithAdmin = async (baseUserId) => {
    let response = [];
    let userChats = await getUserChats(baseUserId.cxid);
    const dataset = {
        customer_collection_id: baseUserId.cxid,
        supplier_id: '',
        supplier_name: '',
        group_chat: '',
        customer_name: baseUserId.user_username,
        status: "Started",
        chat_created_date: "",
        customer_mail_id: baseUserId.user_email,
        supplier_mail_id: '',
        supplier_added_date: '',
        comments: '',
        chat_name: `Aahaas Conversation ${userChats?.data?.length || 1}`,
        customer_id: baseUserId.cxid
    }
    response = await createNewChat(dataset)
    return response;
}

const handleDeactivateProfile = async (dataSet) => {
    let result = [];
    await axios.post(`/deactivate_account_by_id`, dataSet).then((response) => {
        result = response;
    }).catch((err) => {
        result = '(Internal Server Error)'
    })
}

export { updateCustomerDetailsImage, createNewChatWithAdmin, checkPasswordStrength, loginManual, register, googleLogin, handleConfirmEmailSubmit, updateShippingAddress, resetPassword, getCartData, getSerachHistrory, addNewShippingAddress, getShippingAddress, getUserDetails, updateCustomerDetails, getCartDataLength, createAdvByUserId, createAdvByUserPrefinedDates, getUserChats, getSupplierDetails, createNewChat, deleteShippingAddress, fetchAllUserHistory, handleDeactivateProfile, getNotificationLength }