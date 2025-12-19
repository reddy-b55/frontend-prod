import Cookies from 'js-cookie';
import Select from 'react-select';
import { useRouter } from 'next/router';
import PhoneInput from 'react-phone-input-2';
import countryList from 'react-select-country-list';
import { addDoc, collection } from 'firebase/firestore';
import CloseIcon from '@mui/icons-material/Close';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { Container, Row, Form, Input, Col, Alert, Spinner, FormGroup, Label, Button } from 'reactstrap';

import { AppContext } from '../../../_app';
import getImageUrl from '../../../../AxiosCalls/getImageUrl';
import { getUserDetails, handleDeactivateProfile, updateCustomerDetails, updateCustomerDetailsImage } from '../../../../AxiosCalls/UserServices/userServices';

import ImageUploader from '../../../../components/common/ImageUploader';
import ToastMessage from '../../../../components/Notification/ToastMessage';

import ModalBase from '../../../../components/common/Modals/ModalBase';
import { db } from '../../../../firebase';
import { isValidPhoneNumber } from 'libphonenumber-js';

import 'react-phone-input-2/lib/style.css';
import PhoneVerificationModal from './PhoneVerificationModal';
import EmailVerification from './EmailVerification';
import axios from 'axios';

const ProfilePage = ({ handleMobileView }) => {

    const router = useRouter();
    const { userId, triggers, setTriggers, isNewUser } = useContext(AppContext); // Get isNewUser from context

    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [userImage, setUserImage] = useState([]);
    const [base64Image, setBase64Image] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    const [customerDetails, setCustomerDetails] = useState({
        customername: '',
        contact_number: '',
        customer_email: '',
        country: '',
        customerhomeaddress: '',
        pic: '',
        customerID: userId
    });

    const [selectedShippingAddress, setSelectedShippingAddress] = useState({
        value: "",
        label: "Select a Country"
    });

    const [handleDeactivateStatus, setHandleDeactivateStatus] = useState(false);
    const [handleDeactivateConfirmStatus, setHandleDeactivateConfirmStatus] = useState(false);

    const [deactivateType, setDeactivateType] = useState(null);
    const [originalData, setOriginalData] = useState({
        contact_number: '',
        customer_email: ''
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenEmail, setIsModalOpenEmail] = useState(false);
    const [isRemoveProfileModalOpen, setIsRemoveProfileModalOpen] = useState(false);

const detectUserCountry = async () => {
    setLocationLoading(true);
    try {
        // Simple IP-based detection
        const ipResponse = await fetch('https://ipapi.co/json/');
        const ipData = await ipResponse.json();
        
        console.log("IP data response:", ipData);
        
        if (ipData.country_name) {
            const countryName = ipData.country_name;
            
            // Find matching option
            const matchedOption = options.find(
                option => option.label.toLowerCase() === countryName.toLowerCase()
            );

            if (matchedOption) {
                console.log("Country detected:", countryName);
                console.log("Matched option:", matchedOption);
                
                // Update state
                setSelectedShippingAddress(matchedOption);
                setCustomerDetails(prev => ({
                    ...prev,
                    country: matchedOption.value,
                }));
                
                // Save to cookies
                Cookies.set('userCountry', matchedOption.value);
                
                // ToastMessage({ 
                //     status: "success", 
                //     message: `Detected country: ${countryName}` 
                // });
                
                return matchedOption;
            }
        }
        
        ToastMessage({ 
            status: "warning", 
            message: "Could not detect your location automatically" 
        });
    } catch (error) {
        console.error("Failed to detect location:", error);
        ToastMessage({ 
            status: "warning", 
            message: "Could not detect your location automatically" 
        });
    } finally {
        setLocationLoading(false);
    }
    return null;
};

const fetchUserData = async () => {
    setLoading(true);
    try {
        let result = await getUserDetails(userId);
        console.log("User result:", result);
        console.log("User nationality from DB:", result.customer_nationality);

        // Try to get location from localStorage/Cookies (saved by LocationModal)
        const savedLocation = localStorage.getItem("userLastLocation") || 
                             Cookies.get("userLastLocation");
        
        console.log("Saved location from localStorage/Cookies:", savedLocation);
        
        let detectedCountryValue = null;
        let detectedCountryOption = null;
        
        // Check if user has NO nationality in database OR if nationality is empty/dash
        const hasNoNationality = !result.customer_nationality || 
                                result.customer_nationality === "" || 
                                result.customer_nationality === "-";
        
        console.log("User has no nationality?", hasNoNationality);
        
        // If user has no nationality AND we have a saved location, extract country
        if (hasNoNationality && savedLocation) {
            try {
                const locationData = JSON.parse(savedLocation);
                console.log("Parsed location data:", locationData);
                
                if (locationData.address_components) {
                    // Find the country component
                    const countryComponent = locationData.address_components.find(
                        component => component.types.includes("country")
                    );
                    
                    if (countryComponent) {
                        const countryName = countryComponent.long_name;
                        const countryCode = countryComponent.short_name;
                        
                        console.log("Extracted country from saved location:", {
                            name: countryName,
                            code: countryCode
                        });
                        
                        // Find matching option
                        detectedCountryOption = options.find(
                            option => 
                                option.label.toLowerCase() === countryName.toLowerCase() ||
                                option.value.toLowerCase() === countryCode.toLowerCase()
                        );
                        
                        if (detectedCountryOption) {
                            detectedCountryValue = detectedCountryOption.value;
                            console.log("Matched country option:", detectedCountryOption);
                        }
                    }
                }
            } catch (error) {
                console.error("Error parsing saved location:", error);
            }
        }
        
        // If still no country detected and user has no nationality, try IP detection
        if (hasNoNationality && !detectedCountryOption) {
            console.log("No saved location found, trying IP detection...");
            
            try {
                const ipResponse = await fetch('https://ipapi.co/json/');
                const ipData = await ipResponse.json();
                
                if (ipData.country_name) {
                    const countryName = ipData.country_name;
                    console.log("IP detected country:", countryName);
                    
                    detectedCountryOption = options.find(
                        option => option.label.toLowerCase() === countryName.toLowerCase()
                    );
                    
                    if (detectedCountryOption) {
                        detectedCountryValue = detectedCountryOption.value;
                        console.log("IP matched country option:", detectedCountryOption);
                    }
                }
            } catch (ipError) {
                console.error("IP detection failed:", ipError);
            }
        }
        
        // Determine which country to use
        // Priority: Detected location > DB nationality > Nothing
        const finalCountry = detectedCountryValue || result.customer_nationality || "";
        
        console.log("Final country to set:", finalCountry);
        
        // Set customer details
        setCustomerDetails({
            customername: result.customer_fname,
            contact_number: result.contact_number,
            customer_email: result.customer_email,
            country: finalCountry,
            customerhomeaddress: result.customer_address,
            pic: getImageUrl(result.customer_profilepic),
            customerID: userId
        });

        // Store original values
        setOriginalData({
            contact_number: result.contact_number,
            customer_email: result.customer_email
        });

        // Determine which option to select in the dropdown
        let optionToSelect = null;
        
        if (detectedCountryOption) {
            // Use detected country
            optionToSelect = detectedCountryOption;
            console.log("Using detected country:", detectedCountryOption.label);
        } else if (result.customer_nationality && result.customer_nationality !== "-") {
            // Use existing nationality from DB (if not empty/dash)
            optionToSelect = options.find(option => option.value === result.customer_nationality);
            console.log("Using DB nationality:", result.customer_nationality);
        }
        
        if (optionToSelect) {
            console.log("Setting selectedShippingAddress to:", optionToSelect);
            setSelectedShippingAddress(optionToSelect);
        } else {
            console.log("No option found, keeping default");
            // Keep the default "Select a Country"
            setSelectedShippingAddress({
                value: "",
                label: "Select a Country"
            });
        }

        setPhoneNumber(result.contact_number);
        
        // Save detected country to cookies for persistence
        if (detectedCountryValue && hasNoNationality) {
            Cookies.set('userCountry', detectedCountryValue);
            console.log("Saved detected country to cookies:", detectedCountryValue);
        }
        
    } catch (error) {
        console.error("Error in fetchUserData:", error);
        ToastMessage({ status: "error", message: "Failed to load user data." })
    } finally {
        setLoading(false);
    }
};
useEffect(() => {
    // Auto-detect location on page load for users without nationality
    const checkAndDetectLocation = async () => {
        if (!loading && (!customerDetails.country || customerDetails.country === "-" || customerDetails.country === "")) {
            console.log("Auto-detecting location for user without nationality");
            await detectUserCountry();
        }
    };
    
    if (!loading) {
        checkAndDetectLocation();
    }
}, [loading, customerDetails.country]);
    const handleImageUpload  = async (e) => {
        const fileUploaded = e;
        console.log('fileUploaded', fileUploaded);
        setUserImage(fileUploaded);

        const formData = new FormData();
        formData.append('userImage', e);
        formData.append("customerID", userId);
        
        let result = await updateCustomerDetailsImage(formData);
        if (result.data.status === 200) {
            ToastMessage({ status: "success", message: "Profile Updated Successfully" });
            setTimeout(() => {
                setTriggers({
                    ...triggers,
                    userLoginTrigger: !triggers.userLoginTrigger,
                });
            }, 1000);
        } else if (result.data.status == 400) {
            for (const field in result.data.validation_error) {
                if (result.data.validation_error.hasOwnProperty(field)) {
                    const errors = result.data.validation_error[field];
                    errors.forEach(error => {
                        if (error == "The customername has already been taken.") {
                            ToastMessage({ status: "error", message: "First name has already been taken" });
                        } else {
                            ToastMessage({ status: "error", message: error });
                        }
                    });
                }
            }
        } else {
            ToastMessage({ status: "error", message: 'Failed to update profile.' });
        }
    };

    // Function to open the remove profile confirmation modal
    const handleOpenRemoveProfileModal = () => {
        console.log("Remove profile picture button clicked");
        setIsRemoveProfileModalOpen(true);
    };

    // Function to close the remove profile confirmation modal
    const handleCloseRemoveProfileModal = () => {
        setIsRemoveProfileModalOpen(false);
    };

    // New function to handle profile picture removal
    const handleRemoveProfilePicture = async () => {
        console.log("Remove profile picture confirmed");
        let result = null;
        const dataset = {
            user_id: userId,
        }
        await axios.post('remove_profile_picture', dataset).then(res => {
            result = res
            console.log('result', result);
            setUserImage([]);
            setCustomerDetails(prevState => ({ ...prevState, pic: '' }));
            setIsRemoveProfileModalOpen(false);
            ToastMessage({ status: "success", message: "Profile picture removed" });
            window.location.reload();
        }).catch((err) => {
            result = '(Internal Server Error)'
            ToastMessage({ status: "error", message: "Something went wrong" });
        })
    };

    const handlePhoneClick = () => {
        setIsModalOpen(true);
    };

    const handleVerifiedPhone = (newPhoneNumber) => {
        setPhoneNumber(newPhoneNumber);
        setCustomerDetails(prevState => ({
            ...prevState,
            contact_number: newPhoneNumber
        }));
        ToastMessage({
            status: "success",
            message: "Phone number updated successfully!"
        });
    };

    const handleEmailClick = () => {
        setIsModalOpenEmail(true);
    };

    const handleVerifiedEmail = (newEmail) => {
        setEmail(newEmail);
        setCustomerDetails(prevState => ({
            ...prevState,
            email: newEmail
        }));
        ToastMessage({
            status: "success",
            message: "Email number updated successfully!"
        });
    };

    const handlePhoneChange = (value, country) => {
        const countryCode = country?.countryCode.toUpperCase();
        const previousValueWasValid = isValidPhoneNumber(phoneNumber, countryCode);

        if (previousValueWasValid && value.length > phoneNumber.length) {
            return;
        }

        setPhoneNumber(value);
        setCustomerDetails(prevState => ({
            ...prevState,
            contact_number: value
        }));

        // Validate and set errors
        if (!isValidPhoneNumber(value, countryCode)) {
            setErrors(prevState => ({
                ...prevState,
                contact_number: 'Invalid Phone Number'
            }));
        } else {
            setErrors(prevState => ({
                ...prevState,
                contact_number: undefined
            }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCustomerDetails(prevState => ({ ...prevState, [name]: value }));
    };

    const isValueModified = (fieldName, currentValue) => {
        return originalData[fieldName] && originalData[fieldName] !== currentValue;
    };

    const validate = () => {
        const newErrors = {};
        if (!customerDetails.customername) newErrors.customername = 'First Name is required';
        if (!phoneNumber) newErrors.contact_number = 'Phone Number is required';
        if (!customerDetails.customer_email) newErrors.customer_email = 'Email is required';
        if (!customerDetails.country) newErrors.country = 'Country is required';
        if (!customerDetails.customerhomeaddress) newErrors.customerhomeaddress = 'Customer Home Address is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        console.log('fileUploaded', userImage)
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const formData = new FormData();
        for (const key in customerDetails) {
            formData.append(key, customerDetails[key]);
        }

        if (userImage.length !== 0) {
            console.log('fileUploaded', userImage)
            formData.append('fileUploaded', userImage);
        } else {
            formData.append('existingProfilePic', customerDetails.pic);
        }

        try {
            console.log('formData 123 chamod', formData);
            let result = await updateCustomerDetails(formData);
            console.log('result', result);
            if (result.data.status === 200) {
                ToastMessage({ status: "success", message: "Profile Updated Successfully" });
                setTimeout(() => {
                    setTriggers({
                        ...triggers,
                        userLoginTrigger: !triggers.userLoginTrigger,
                    });
                }, 1000);
            } else if (result.data.status == 400) {
                for (const field in result.data.validation_error) {
                    if (result.data.validation_error.hasOwnProperty(field)) {
                        const errors = result.data.validation_error[field];
                        errors.forEach(error => {
                            if (error == "The customername has already been taken.") {
                                ToastMessage({ status: "error", message: "First name has already been taken" });
                            } else {
                                ToastMessage({ status: "error", message: error });
                            }
                        });
                    }
                }
            }
        } catch (error) {
            ToastMessage({ status: "error", message: 'Failed to update profile.' });
        }
    };

    const styles = {
        input: {
            borderColor: '#dddddd',
            fontSize: '14px',
            padding: '17px 25px',
            marginBottom: '30px',
            height: 'inherit',
        },
        inputPhone: {
            width: '100%',
            borderRadius: 0,
            padding: '15px 25px',
            borderColor: '#dddddd',
            fontSize: '14px',
            marginBottom: '30px',
            height: 'inherit',
        },
        select: {
            borderColor: '#dddddd',
            fontSize: '12px',
            padding: '17px 25px',
            marginBottom: '30px',
            height: 'inherit',
        }
    };

    const options = useMemo(() => countryList().getData(), []);

    const handleChangeCountry = (option) => {
        setSelectedShippingAddress(option);
        if (option) {
            setCustomerDetails(prev => ({ ...prev, country: option.value }));
            Cookies.set('userCountry', option.value);
        }
    };

    // Manual location detection function
    const handleDetectLocation = async () => {
        await detectUserCountry();
    };

    const handleDeActivateType = (value) => {
        setHandleDeactivateStatus(false);
        setHandleDeactivateConfirmStatus(true);
        setDeactivateType(value)
    }

    const createNewChat = async () => {
        await addDoc(collection(db, "customer-chat-lists"), {
            status: 'Pending',
            createdAt: new Date(),
            supplierAdded: false,
            notifyAdmin: true,
            notifySupplier: false,
            notifyCustomer: false,
            customer_collection_id: Number(userId),
            supplier_id: '',
            supplier_name: '',
            group_chat: '',
            customer_name: customerDetails.customername,
            customer_mail_id: customerDetails.customer_email,
            supplier_mail_id: '',
            supplier_added_date: '',
            comments: 'Technical support - chat has been created from profile deactivation page',
            chat_name: `Aahaas Conversation ( technical support )`,
            customer_id: Number(userId),
            chat_related: 'Technical-support',
            chat_avatar: '',
            updatedAt: new Date()
        }).then(() => {
            router.push("/page/account/chats/");
        })
    }

    const handleLogOut = async () => {
        router.push('/page/account/login-auth');
        localStorage.removeItem('#__uid');
        Cookies.remove('hashedVal');
        setTriggers({
            userLoginTrigger: !triggers.userLoginTrigger,
            customerCartTrigger: !triggers.customerCartTrigger,
            baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
            userDesireLocation: !triggers.userDesireLocation,
        });
    }

    const handleDeActivate = async () => {
        const dataSet = {
            userId: userId,
            status: deactivateType,
        };
        await handleDeactivateProfile(dataSet).then(async (response) => {
            await handleLogOut();
        });
    }

    const handleHelpCenter = () => {
        router.push('/page/helpcenter');
    }

    const handleOpenDeactivateModal = (e) => {
        e.preventDefault();
        setHandleDeactivateStatus(true);
        setDeactivateType(null);
    }

    const handleCloseDeactivateModal = () => {
        setHandleDeactivateStatus(false);
        setHandleDeactivateConfirmStatus(false);
        setDeactivateType(null);
    }

    useEffect(() => {
        fetchUserData();
    }, [triggers.userLoginTrigger, isNewUser]);

    return (
        <section className="contact-page register-page section-b-space my-lg-5 p-0 profile-section">
            <Container>
                {
                    loading ?
                        <Row className="justify-content-center">
                            <Spinner style={{ width: '3rem', height: '3rem' }} />
                        </Row>
                        :
                        <Row className="justify-content-center">
                            <Col xs="8" sm="8" lg="8" md="8" className='offset-sm-1 offset-lg-0 offset-md-0 px-md-5 pe-md-0 pt-3'>
                                <div className="d-flex flex-column align-items-center w-100 mb-4">
                                    <div className="image-uploader-container position-relative mb-3">
                                        <ImageUploader 
                                            handleImageUpload={handleImageUpload} 
                                            imageUrl={customerDetails.pic !== 'https://dev-gateway.aahaas.com/-'? customerDetails.pic : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"} 
                                        />
                                    </div>
                                    
                                    {customerDetails.pic && customerDetails.pic !== 'https://dev-gateway.aahaas.com/-' && (
                                        <button 
                                            type="button"
                                            onClick={handleOpenRemoveProfileModal} 
                                            className="btn btn-outline-danger btn-sm"
                                            style={{
                                                fontSize: '12px',
                                                padding: '6px 12px',
                                                border: '1px solid #dc3545',
                                                backgroundColor: 'transparent',
                                                color: '#dc3545',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#dc3545';
                                                e.target.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#dc3545';
                                            }}
                                        >
                                            Remove Profile Picture
                                        </button>
                                    )}
                                </div>
                                <Form className="theme-form" onSubmit={handleSubmit}>
                                    <Row>
                                        <Col xs="12" sm="12" md="12" >
                                            <label className="form-label" for="first-name">First Name</label>
                                            <Input type="text" className="form-control " id="first-name" name="customername" placeholder="First Name" required value={customerDetails.customername} style={styles.input} onChange={handleChange} />
                                            {errors.customername && <Alert color="danger">{errors.customername}</Alert>}
                                        </Col>
                                        <Col xs="12" sm="12" md="6" lg="6">
                                            <label className="form-label" htmlFor="phone-number">
                                                Phone Number <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <div className='hotelRoomSelect'>
                                                <PhoneInput
                                                    country={'us'}
                                                    value={customerDetails.contact_number}
                                                    onChange={() => { }}
                                                    inputProps={{
                                                        name: 'contact_number',
                                                        required: true,
                                                        className: 'form-control',
                                                        id: 'phone-number',
                                                        style: styles.inputPhone,
                                                        onClick: handlePhoneClick,
                                                        readOnly: true
                                                    }}
                                                />
                                            </div>
                                            {errors.contact_number &&
                                                <span style={{ fontSize: 12, color: 'red' }}>
                                                    {errors.contact_number}
                                                </span>
                                            }
                                        </Col>

                                        <PhoneVerificationModal
                                            isOpen={isModalOpen}
                                            onClose={() => {
                                                setIsModalOpen(false)
                                                console.log(phoneNumber,'phoneNumber')
                                            }}
                                            onVerify={handleVerifiedPhone}
                                            phoneNumber={phoneNumber}
                                        />

                                        <Col xs="12" sm="12" md="6" lg="6" className='mt-4 mt-lg-0 mt-md-0'>
                                            <label className="form-label" htmlFor="email">Email</label>
                                            <Input
                                                type="email"
                                                className="form-control"
                                                id="email"
                                                name="customer_email"
                                                placeholder="Email"
                                                required
                                                value={customerDetails.customer_email}
                                                style={styles.input}
                                                onClick={handleEmailClick}
                                                readOnly
                                            />
                                            {errors.customer_email &&
                                                <Alert color="danger">{errors.customer_email}</Alert>
                                            }
                                            {!errors.customer_email && isValueModified('customer_email', customerDetails.customer_email) &&
                                                <span style={{ fontSize: 12, color: '#ff9800' }}>
                                                    Email has been modified from original
                                                </span>
                                            }
                                        </Col>
                                        <EmailVerification
                                            isOpen={isModalOpenEmail}
                                            onClose={() => setIsModalOpenEmail(false)}
                                            onVerify={handleVerifiedEmail}
                                            email={email}
                                        />
                                     <Col xs="12" sm="12" md="6" lg="6">
    <label className="form-label" htmlFor="nationality">
        Nationality
        {(!customerDetails.country || customerDetails.country === "-" || customerDetails.country === "") && (
            <button 
                type="button"
                onClick={() => {
                    handleDetectLocation();
                    // Force state update
                    setTriggers(prev => ({ ...prev, userLoginTrigger: !prev.userLoginTrigger }));
                }}
                disabled={locationLoading}
                className="btn btn-link p-0 ms-2"
                style={{ fontSize: '12px', textDecoration: 'none' }}
            >
                {locationLoading ? 'Detecting...' : 'Auto-detect my location'}
            </button>
        )}
    </label>
    <div className='hotelRoomSelect'>
        <Select 
            options={options} 
            name="country" 
            value={selectedShippingAddress} 
            onChange={handleChangeCountry} 
            className="react__Select border rounded-0" 
            styles={{ 
                control: (base) => ({ 
                    ...base, 
                    borderRadius: 0, 
                    border: 'none', 
                    boxShadow: 'none', 
                    '&:hover': { borderColor: 'rgb(221, 221, 221)' }, 
                    padding: '10px 15px', 
                    height: 'inherit', 
                    fontSize: '14px' 
                }) 
            }} 
        />
    </div>
    {errors.country && <Alert color="danger">{errors.country}</Alert>}
    {selectedShippingAddress.value && selectedShippingAddress.value !== "" && (
        <span style={{ fontSize: '12px', color: '#28a745' }}>
        </span>
    )}
</Col>
                                        <Col xs="12" sm="12" md="6" lg="6" className='mt-4 mt-lg-0 mt-md-0'>
                                            <label className="form-label" for="home-address">Customer Home Address</label>
                                            <Input type="text" className="form-control" id="home-address" name="customerhomeaddress" placeholder="Home Address" required value={customerDetails.customerhomeaddress} style={styles.input} onChange={handleChange} />
                                            {errors.customerhomeaddress && <Alert color="danger">{errors.customerhomeaddress}</Alert>}
                                        </Col>
                                        <Col className='d-block d-lg-none d-md-none'>
                                            <p onClick={() => handleMobileView()} className='6 mt-4 mt-lg-0 d-block border mb-5 p-2 py-3 text-center d-lg-none' style={{ fontSize: 13 }}>+ Add More Delivery Addresses</p>
                                        </Col>
                                        <Col xs="12" className='d-flex justify-content-end gap-2 mb-4'>
                                            <button className="btn btn-sm btn-solid m-0" type="submit">Update Profile</button>
                                            <button className="btn btn-sm btn-solid m-0" onClick={handleOpenDeactivateModal}>Deactivate profile</button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Col>
                        </Row>
                }
            </Container>
            <ModalBase isOpen={handleDeactivateStatus} toggle={handleCloseDeactivateModal} title={'Profile deactivation'} size='lg'>
                <div>
                    <h6 className='text-center'>We respect your decision, but if you have any questions or concerns, please feel free to ask. We're here to help !</h6>
                    <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleHelpCenter}>Help center ?</button>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={createNewChat}>Chat with us</button>
                    </div>
                    <div className='d-flex align-items-center justify-content-center gap-1 mt-4'>
                        <span className='p-0 m-0 py-1 mx-3 px-1 text-center border-bottom' onClick={() => handleDeActivateType('Temp')} style={{ fontSize: 12, cursor: 'pointer' }}>Deactivate my profile temporarily</span>
                        <span className='p-0 m-0 py-1 mx-3 px-1 text-center border-bottom' onClick={() => handleDeActivateType('Per')} style={{ fontSize: 12, cursor: 'pointer' }}>Deactivate my profile permanently</span>
                    </div>
                </div>
            </ModalBase>
            <ModalBase isOpen={isRemoveProfileModalOpen} toggle={handleCloseRemoveProfileModal} title={'Remove Profile Picture'}>
                <div>
                    <h6 className='text-center'>Are you sure you want to remove your profile picture?</h6>
                    <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleRemoveProfilePicture}>Yes</button>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleCloseRemoveProfileModal}>No</button>
                    </div>
                </div>
            </ModalBase>
            <ModalBase isOpen={handleDeactivateConfirmStatus} toggle={handleCloseDeactivateModal} title={'Profile deactivation'}>
                <div>
                    <h6 className='text-center'>Are you sure you want to deactivate your account? </h6>
                    <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleDeActivate}>Confirm</button>
                        <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleCloseDeactivateModal}>Cancel</button>
                    </div>
                </div>
            </ModalBase>
            <style jsx>{`
            .profile-section {
                padding: 20px !important;
                border-top: 1px solid #f1f1f1;
                background-color:rgb(246, 246, 246);
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                width: 100%;
                display: flex
                justify-content: center;
                align-items: center;
                margin: auto;
            }

            .white-border {
                border: 5px solid white !important;
            }

            .theme-form {
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
    
            .form-label {
                font-weight: 600;
                color: #333;
                margin-bottom: 8px;
            }
    
            .form-control {
                border-radius: 4px;
                border: 1px solid #ddd;
                padding: 10px;
                font-size: 14px;
            }
    
            .hotelRoomSelect {
                margin-bottom: 16px;
            }
    
            .react__Select {
                width: 100%;
            }
    
            .alert {
                margin-top: 8px;
            }
    
            .border-bottom {
                border-bottom: 1px solid #ddd;
            }
    
            .text-center {
                text-align: center;
            }
    
            .d-flex {
                display: flex;
            }
    
            .justify-content-center {
                justify-content: center;
            }
    
            .gap-3 {
                gap: 16px;
            }
    
            .gap-1 {
                gap: 8px;
            }
    
            .mt-4 {
                margin-top: 16px;
            }
    
            .my-3 {
                margin-top: 16px;
                margin-bottom: 16px;
            }
    
            .py-1 {
                padding-top: 4px;
                padding-bottom: 4px;
            }
    
            .px-3 {
                padding-left: 16px;
                padding-right: 16px;
            }
    
            .rounded-2 {
                border-radius: 4px;
            }
    
            .cursor-pointer {
                cursor: pointer;
            }

            .image-uploader-container {
                position: relative;
                display: inline-block;
                margin: 0 auto;
            }

            .remove-image-btn {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(255, 255, 255, 0.8);
                border: none;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                color: #ff0000;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                z-index: 10;
            }

            .remove-image-btn:hover {
                background: rgba(255, 255, 255, 1);
                color: #ff0000;
            }
        `}</style>
        </section>
    );
};

export default ProfilePage;

// import Cookies from 'js-cookie';
// import Select from 'react-select';
// import { useRouter } from 'next/router';
// import PhoneInput from 'react-phone-input-2';
// import countryList from 'react-select-country-list';
// import { addDoc, collection } from 'firebase/firestore';
// // import './ProfilePage.css';
// import React, { useContext, useState, useEffect, useMemo } from 'react';
// import { Container, Row, Form, Input, Col, Alert, Spinner, FormGroup, Label, Button } from 'reactstrap';

// import { AppContext } from '../../../_app';
// import getImageUrl from '../../../../AxiosCalls/getImageUrl';
// import { getUserDetails, handleDeactivateProfile, updateCustomerDetails } from '../../../../AxiosCalls/UserServices/userServices';

// import ImageUploader from '../../../../components/common/ImageUploader';
// import ToastMessage from '../../../../components/Notification/ToastMessage';

// import ModalBase from '../../../../components/common/Modals/ModalBase';
// import { db } from '../../../../firebase';
// // import { isValidPhoneNumber } from 'react-phone-number-input';
// import { isValidPhoneNumber } from 'libphonenumber-js';


// import 'react-phone-input-2/lib/style.css';
// import PhoneVerificationModal from './PhoneVerificationModal';
// import EmailVerification from './EmailVerification';

// const ProfilePage = ({ handleMobileView }) => {

//     const router = useRouter();
//     const { userId, triggers, setTriggers } = useContext(AppContext);

//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [email, setEmail] = useState('');
//     const [errors, setErrors] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [userImage, setUserImage] = useState([]);
//     const [base64Image, setBase64Image] = useState('');

//     const [customerDetails, setCustomerDetails] = useState({
//         customername: '',
//         contact_number: '',
//         customer_email: '',
//         country: '',
//         customerhomeaddress: '',
//         pic: '',
//         customerID: userId
//     });

//     const [selectedShippingAddress, setSelectedShippingAddress] = useState({
//         value: "",
//         label: "Select a Country"
//     });

//     const [handleDeactivateStatus, setHandleDeactivateStatus] = useState(false);
//     const [handleDeactivateConfirmStatus, setHandleDeactivateConfirmStatus] = useState(false);

//     const [deactivateType, setDeactivateType] = useState(null);
//     const [originalData, setOriginalData] = useState({
//         contact_number: '',
//         customer_email: ''
//     });
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [isModalOpenEmail, setIsModalOpenEmail] = useState(false);

//     const fetchUserData = async () => {
//         setLoading(true);
//         try {
//             let result = await getUserDetails(userId);
//             console.log(result);

//             setCustomerDetails({
//                 ...customerDetails,
//                 customername: result.customer_fname,
//                 contact_number: result.contact_number,
//                 customer_email: result.customer_email,
//                 country: result.customer_nationality,
//                 customerhomeaddress: result.customer_address,
//                 pic: getImageUrl(result.customer_profilepic),
//             });
//             console.log('customerDetails', customerDetails);
 
//             // Store original values
//             setOriginalData({
//                 contact_number: result.contact_number,
//                 customer_email: result.customer_email
//             });
//             // const optionToSelect = options.find(option => option.label === result.customer_nationality)
//             const optionToSelect = options.find(option => option.value === result.customer_nationality);
//             setSelectedShippingAddress(optionToSelect)
//             setPhoneNumber(result.contact_number);
//         } catch (error) {
//             ToastMessage({ status: "error", message: "Failed to load user data." })
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleImageUpload = (e) => {
//         const fileUploaded = e;
//         setUserImage(fileUploaded);
//     };

//     const renameFile = (file, newName) => {
//         return new File([file], newName, { type: file.type });
//     };

//     // const handlePhoneChange = (value) => {
//     //     setPhoneNumber(value);
//     //     setCustomerDetails(prevState => ({ ...prevState, contact_number: value }));
//     // };

//     // Modify handlePhoneChange to check for changes
//     const handlePhoneClick = () => {
//         setIsModalOpen(true);
//     };

//     const handleVerifiedPhone = (newPhoneNumber) => {
//         setPhoneNumber(newPhoneNumber);
//         setCustomerDetails(prevState => ({
//             ...prevState,
//             contact_number: newPhoneNumber
//         }));
//         ToastMessage({
//             status: "success",
//             message: "Phone number updated successfully!"
//         });
//     };
//     const handleEmailClick = () => {
//         setIsModalOpenEmail(true);
//     };

//     const handleVerifiedEmail = (newEmail) => {
//         setEmail(newEmail);
//         setCustomerDetails(prevState => ({
//             ...prevState,
//             email: newEmail
//         }));
//         ToastMessage({
//             status: "success",
//             message: "Email number updated successfully!"
//         });
//     };
//     const handlePhoneChange = (value, country) => {
//         const countryCode = country?.countryCode.toUpperCase();
//         const previousValueWasValid = isValidPhoneNumber(phoneNumber, countryCode);

//         if (previousValueWasValid && value.length > phoneNumber.length) {
//             return;
//         }

//         setPhoneNumber(value);
//         setCustomerDetails(prevState => ({
//             ...prevState,
//             contact_number: value
//         }));

//         // Validate and set errors
//         if (!isValidPhoneNumber(value, countryCode)) {
//             setErrors(prevState => ({
//                 ...prevState,
//                 contact_number: 'Invalid Phone Number'
//             }));
//         } else {
//             setErrors(prevState => ({
//                 ...prevState,
//                 contact_number: undefined
//             }));
//         }
//     };

//     // Modify handleChange to check for changes
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setCustomerDetails(prevState => ({ ...prevState, [name]: value }));
//     };

//     // Add function to check if value is modified
//     const isValueModified = (fieldName, currentValue) => {
//         return originalData[fieldName] && originalData[fieldName] !== currentValue;
//     };



//     const validate = () => {
//         const newErrors = {};
//         if (!customerDetails.customername) newErrors.customername = 'First Name is required';
//         if (!phoneNumber) newErrors.contact_number = 'Phone Number is required';
//         if (!customerDetails.customer_email) newErrors.customer_email = 'Email is required';
//         if (!customerDetails.country) newErrors.country = 'Country is required';
//         if (!customerDetails.customerhomeaddress) newErrors.customerhomeaddress = 'Customer Home Address is required';
//         return newErrors;
//     };

//     const handleSubmit = async (e) => {

//         e.preventDefault();
//         const validationErrors = validate();

//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }

//         const formData = new FormData();
//         for (const key in customerDetails) {
//             formData.append(key, customerDetails[key]);
//         }

//         if (userImage.length !== 0) {
//             formData.append('userImage', userImage);
//         } else {
//             formData.append('existingProfilePic', customerDetails.pic);
//         }

//         try {
//             let result = await updateCustomerDetails(formData);
          
//             if (result.data.status === 200) {
//                 ToastMessage({ status: "success", message: "Profile Updated Successfully" });
//                 setTimeout(() => {
//                     setTriggers({
//                         ...triggers,
//                         userLoginTrigger: !triggers.userLoginTrigger,
//                     });
//                 }, 1000);
//                 // ToastMessage({ status: "success", message: "Profile Updated Successfully" });
//             } else if (result.data.status == 400) {
//                 for (const field in result.data.validation_error) {
//                     if (result.data.validation_error.hasOwnProperty(field)) {
//                         const errors = result.data.validation_error[field];
//                         errors.forEach(error => {
//                             if (error == "The customername has already been taken.") {
//                                 ToastMessage({ status: "error", message: "First name has already been taken" });
//                             } else {
//                                 ToastMessage({ status: "error", message: error });
//                             }
//                         });
//                     }
//                 }
//             }
//         } catch (error) {
//             ToastMessage({ status: "error", message: 'Failed to update profile.' });
//         }

//     };

//     const styles = {
//         input: {
//             borderColor: '#dddddd',
//             fontSize: '14px',
//             padding: '17px 25px',
//             marginBottom: '30px',
//             height: 'inherit',
//         },
//         inputPhone: {
//             width: '100%',
//             borderRadius: 0,
//             padding: '15px 25px',
//             borderColor: '#dddddd',
//             fontSize: '14px',
//             marginBottom: '30px',
//             height: 'inherit',
//         },
//         select: {
//             borderColor: '#dddddd',
//             fontSize: '12px',
//             padding: '17px 25px',
//             marginBottom: '30px',
//             height: 'inherit',
//         }
//     };

//     const options = useMemo(() => countryList().getData(), []);


//     const handleChangeCountry = (option) => {
//         setSelectedShippingAddress(option);
//         if (option) {
//             setCustomerDetails(prevState => ({ ...prevState, country: option.value }));
//         }
//         // setCustomerDetails(prevState => ({ ...prevState, country: option?.value }));
//     };

//     const handleDeActivateType = (value) => {
//         setHandleDeactivateStatus(false);
//         setHandleDeactivateConfirmStatus(true);
//         setDeactivateType(value)
//     }

//     const createNewChat = async () => {
//         await addDoc(collection(db, "customer-chat-lists"), {
//             status: 'Pending',
//             createdAt: new Date(),
//             supplierAdded: false,
//             notifyAdmin: true,
//             notifySupplier: false,
//             notifyCustomer: false,
//             customer_collection_id: Number(userId),
//             supplier_id: '',
//             supplier_name: '',
//             group_chat: '',
//             customer_name: customerDetails.customername,
//             customer_mail_id: customerDetails.customer_email,
//             supplier_mail_id: '',
//             supplier_added_date: '',
//             comments: 'Technical support - chat has been created from profile deactivation page',
//             chat_name: `Aahaas Conversation ( technical support )`,
//             customer_id: Number(userId),
//             chat_related: 'Technical-support',
//             chat_avatar: '',
//             updatedAt: new Date()
//         }).then(() => {
//             router.push("/page/account/chats/");
//         })
//     }

//     const handleLogOut = async () => {
//         router.push('/page/account/login-auth');
//         localStorage.removeItem('#__uid');
//         Cookies.remove('hashedVal');
//         setTriggers({
//             userLoginTrigger: !triggers.userLoginTrigger,
//             customerCartTrigger: !triggers.customerCartTrigger,
//             baseCurrencyTrigger: !triggers.baseCurrencyTrigger,
//             userDesireLocation: !triggers.userDesireLocation,
//         });
//     }

//     const handleDeActivate = async () => {
//         const dataSet = {
//             userId: userId,
//             status: deactivateType,
//         };
//         await handleDeactivateProfile(dataSet).then(async (response) => {
//             await handleLogOut();
//         });
//     }

//     const handleHelpCenter = () => {
//         router.push('/page/helpcenter');
//     }

//     const handleOpenDeactivateModal = (e) => {
//         e.preventDefault();
//         setHandleDeactivateStatus(true);
//         setDeactivateType(null);
//     }

//     const handleCloseDeactivateModal = () => {
//         setHandleDeactivateStatus(false);
//         setHandleDeactivateConfirmStatus(false);
//         setDeactivateType(null);
//     }

//     useEffect(() => {
//         fetchUserData();
//     }, [triggers.userLoginTrigger]);

//     return (
//         <section className="contact-page register-page section-b-space my-lg-5 p-0 profile-section">
//             <Container>
//                 {
//                     loading ?
//                         <Row className="justify-content-center">
//                             <Spinner style={{ width: '3rem', height: '3rem' }} />
//                         </Row>
//                         :
//                         <Row className="justify-content-center">
//                             <Col xs="8" sm="8" lg="8" md="8" className='offset-sm-1 offset-lg-0 offset-md-0 px-md-5 pe-md-0 pt-3'>
//                                 <ImageUploader handleImageUpload={handleImageUpload} imageUrl={customerDetails.pic} />
//                                 <Form className="theme-form" onSubmit={handleSubmit}>
//                                     <Row>
//                                         <Col xs="12" sm="12" md="12" >
//                                             <label className="form-label" for="first-name">First Name</label>
//                                             <Input type="text" className="form-control " id="first-name" name="customername" placeholder="First Name" required value={customerDetails.customername} style={styles.input} onChange={handleChange} />
//                                             {errors.customername && <Alert color="danger">{errors.customername}</Alert>}
//                                         </Col>
//                                         <Col xs="12" sm="12" md="6" lg="6">
//                                             <label className="form-label" htmlFor="phone-number">
//                                                 Phone Number <span style={{ color: 'red' }}>*</span>
//                                             </label>
//                                             <div className='hotelRoomSelect'>
//                                                 <PhoneInput
//                                                     country={'us'}
//                                                     value={customerDetails.contact_number}
//                                                     onChange={() => { }} // Disabled direct changes
//                                                     inputProps={{
//                                                         name: 'contact_number',
//                                                         required: true,
//                                                         className: 'form-control',
//                                                         id: 'phone-number',
//                                                         style: styles.inputPhone,
//                                                         onClick: handlePhoneClick,
//                                                         readOnly: true
//                                                     }}
//                                                 />
//                                             </div>
//                                             {errors.contact_number &&
//                                                 <span style={{ fontSize: 12, color: 'red' }}>
//                                                     {errors.contact_number}
//                                                 </span>
//                                             }
//                                         </Col>
//                                         {/* <PhoneVerificationModal
//                                             isOpen={isModalOpen}
//                                             onClose={() => setIsModalOpen(false)}
//                                             onVerify={(phoneNumber) => {
//                                                 console.log('Verified phone:', phoneNumber);
//                                                 // Handle successful verification
//                                             }}
//                                         /> */}

//                                         <PhoneVerificationModal
//                                             isOpen={isModalOpen}
//                                             onClose={() => setIsModalOpen(false)}
//                                             onVerify={handleVerifiedPhone}
//                                             phoneNumber={phoneNumber}
//                                         />

                                     

//                                         <Col xs="12" sm="12" md="6" lg="6" className='mt-4 mt-lg-0 mt-md-0'>
//                                             <label className="form-label" htmlFor="email">Email</label>
//                                             <Input
//                                                 type="email"
//                                                 className="form-control"
//                                                 id="email"
//                                                 name="customer_email"
//                                                 placeholder="Email"
//                                                 required
//                                                 value={customerDetails.customer_email}
//                                                 style={styles.input}
//                                                 onClick={handleEmailClick}
//                                                 readOnly
//                                             />
//                                             {errors.customer_email &&
//                                                 <Alert color="danger">{errors.customer_email}</Alert>
//                                             }
//                                             {!errors.customer_email && isValueModified('customer_email', customerDetails.customer_email) &&
//                                                 <span style={{ fontSize: 12, color: '#ff9800' }}>
//                                                     Email has been modified from original
//                                                 </span>
//                                             }
//                                         </Col>
//                                         <EmailVerification
//                                             isOpen={isModalOpenEmail}
//                                             onClose={() => setIsModalOpenEmail(false)}
//                                             onVerify={handleVerifiedEmail}
//                                             email={email}
//                                         />
//                                         {/* <Col xs="12" sm="12" md="6" lg="6" className='mt-4 mt-lg-0 mt-md-0'>
//                                             <label className="form-label" for="email">Email</label>
//                                             <Input type="email" className="form-control" id="email" name="customer_email" placeholder="Email" required value={customerDetails.customer_email} style={styles.input} onChange={handleChange} />
//                                             {errors.customer_email && <Alert color="danger">{errors.customer_email}</Alert>}
//                                         </Col> */}
//                                         <Col xs="12" sm="12" md="6" lg="6">
//                                             <label className="form-label" for="nationality">Nationality</label>
//                                             <div className='hotelRoomSelect'>
//                                                 <Select options={options} name="country" value={selectedShippingAddress} defaultValue={selectedShippingAddress} onChange={handleChangeCountry} className="react__Select border rounded-0" styles={{ control: (base) => ({ ...base, borderRadius: 0, border: 'none', boxShadow: 'none', '&:hover': { borderColor: 'rgb(221, 221, 221)' }, padding: '10px 15px', height: 'inherit', fontSize: '14px' }) }} />
//                                             </div>
//                                             {errors.country && <Alert color="danger">{errors.country}</Alert>}
//                                         </Col>
//                                         <Col xs="12" sm="12" md="6" lg="6" className='mt-4 mt-lg-0 mt-md-0'>
//                                             <label className="form-label" for="home-address">Customer Home Address</label>
//                                             <Input type="text" className="form-control" id="home-address" name="customerhomeaddress" placeholder="Home Address" required value={customerDetails.customerhomeaddress} style={styles.input} onChange={handleChange} />
//                                             {errors.customerhomeaddress && <Alert color="danger">{errors.customerhomeaddress}</Alert>}
//                                         </Col>
//                                         <Col className='d-block d-lg-none d-md-none'>
//                                             <p onClick={() => handleMobileView()} className='6 mt-4 mt-lg-0 d-block border mb-5 p-2 py-3 text-center d-lg-none' style={{ fontSize: 13 }}>+ Add More Delivery Addresses</p>
//                                         </Col>
//                                         <Col xs="12" className='d-flex justify-content-end gap-2 mb-4'>
//                                             <button className="btn btn-sm btn-solid m-0" type="submit">Update Profile</button>
//                                             <button className="btn btn-sm btn-solid m-0" onClick={handleOpenDeactivateModal}>Deactivate profile</button>
//                                         </Col>
//                                     </Row>
//                                 </Form>
//                             </Col>
//                         </Row>
//                 }
//             </Container>
//             <ModalBase isOpen={handleDeactivateStatus} toggle={handleCloseDeactivateModal} title={'Profile deactivation'} size='lg'>
//                 <div>
//                     <h6 className='text-center'>We respect your decision, but if you have any questions or concerns, please feel free to ask. We're here to help !</h6>
//                     <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
//                         <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleHelpCenter}>Help center ?</button>
//                         <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={createNewChat}>Chat with us</button>
//                     </div>
//                     <div className='d-flex align-items-center justify-content-center gap-1 mt-4'>
//                         <span className='p-0 m-0 py-1 mx-3 px-1 text-center border-bottom' onClick={() => handleDeActivateType('Temp')} style={{ fontSize: 12, cursor: 'pointer' }}>Deactivate my profile temporarily</span>
//                         <span className='p-0 m-0 py-1 mx-3 px-1 text-center border-bottom' onClick={() => handleDeActivateType('Per')} style={{ fontSize: 12, cursor: 'pointer' }}>Deactivate my profile permanently</span>
//                     </div>
//                 </div>
//             </ModalBase>
//             <ModalBase isOpen={handleDeactivateConfirmStatus} toggle={handleCloseDeactivateModal} title={'Profile deactivation'}>
//                 <div>
//                     <h6 className='text-center'>Are you sure you want to deactivate your account? </h6>
//                     <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
//                         <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleDeActivate}>Confirm</button>
//                         <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={handleCloseDeactivateModal}>Cancel</button>
//                     </div>
//                 </div>
//             </ModalBase>
//             <style jsx>{`
//             .profile-section {
//                 padding: 20px !important;
//                 border-top: 1px solid #f1f1f1;
//                 background-color:rgb(246, 246, 246);
//                 border-radius: 8px;
//                 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//                 width: 100%;
//                 display: flex
//                 justify-content: center;
//                 align-items: center;
//                 margin: auto;
//             }

//             .white-border {
//                 border: 5px solid white !important;
//             }

//             .theme-form {
//                 background-color: #ffffff;
//                 padding: 20px;
//                 border-radius: 8px;
//                 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
//             }
    
//             .form-label {
//                 font-weight: 600;
//                 color: #333;
//                 margin-bottom: 8px;
//             }
    
//             .form-control {
//                 border-radius: 4px;
//                 border: 1px solid #ddd;
//                 padding: 10px;
//                 font-size: 14px;
//             }
    
//             .hotelRoomSelect {
//                 margin-bottom: 16px;
//             }
    
//             .react__Select {
//                 width: 100%;
//             }
    
//             .alert {
//                 margin-top: 8px;
//             }
    
//             .border-bottom {
//                 border-bottom: 1px solid #ddd;
//             }
    
//             .text-center {
//                 text-align: center;
//             }
    
//             .d-flex {
//                 display: flex;
//             }
    
//             .justify-content-center {
//                 justify-content: center;
//             }
    
//             .gap-3 {
//                 gap: 16px;
//             }
    
//             .gap-1 {
//                 gap: 8px;
//             }
    
//             .mt-4 {
//                 margin-top: 16px;
//             }
    
//             .my-3 {
//                 margin-top: 16px;
//                 margin-bottom: 16px;
//             }
    
//             .py-1 {
//                 padding-top: 4px;
//                 padding-bottom: 4px;
//             }
    
//             .px-3 {
//                 padding-left: 16px;
//                 padding-right: 16px;
//             }
    
//             .rounded-2 {
//                 border-radius: 4px;
//             }
    
//             .cursor-pointer {
//                 cursor: pointer;
//             }
//         `}</style>
//         </section>
      

//     );
// };

// export default ProfilePage;