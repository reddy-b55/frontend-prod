import React, { useContext, useEffect, useState } from 'react';
import { Button, Input, Row, Col, Form } from 'reactstrap';
import { AppContext } from '../../../pages/_app';
import PhoneInput from 'react-phone-input-2';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';
import ModalBase from '../Modals/ModalBase';
import 'react-phone-input-2/lib/style.css';
import { Tune } from '@mui/icons-material';

const TravelBuddiesModal = ({ isOpen, toggle, onSubmit, dataSet, status, type = null }) => {

    console.log("dataSet1111111111111", dataSet);
    const { userId } = useContext(AppContext);
    const [mobileIsValid, setMobileIsValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [phoneCountry, setPhoneCountry] = useState('lk');
    const [phoneInputKey, setPhoneInputKey] = useState(0);

    const [paxData, setPaxData] = useState({
        Title: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Phoneno: "",
        Email: "",
        PaxType: "",
        Age: "",
        PassportNo: "",
        PassportIssueDate: "",
        PassportExpDate: "",
        PAN: ""
    });

    // Function to detect country from phone number
    const detectCountryFromPhone = (phoneNumber) => {
        if (!phoneNumber) return 'lk';
        
        try {
            const parsed = parsePhoneNumber(phoneNumber);
            if (parsed && parsed.country) {
                return parsed.country.toLowerCase();
            }
        } catch (error) {
            console.log('Error parsing phone number:', error);
        }
        
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (cleanPhone.startsWith('94')) return 'lk';
        if (cleanPhone.startsWith('91')) return 'in';
        if (cleanPhone.startsWith('1')) return 'us';
        if (cleanPhone.startsWith('44')) return 'gb';
        if (cleanPhone.startsWith('61')) return 'au';
        
        return 'lk';
    };

    useEffect(() => {
        setErrors([]);
        if (status === "edit" && dataSet) {
            setPaxData(dataSet);
            
            if (dataSet.Phoneno) {
                const detectedCountry = detectCountryFromPhone(dataSet.Phoneno);
                setPhoneCountry(detectedCountry);
                
                try {
                    const isValid = isValidPhoneNumber(dataSet.Phoneno, detectedCountry.toUpperCase());
                    setMobileIsValid(isValid);
                } catch (error) {
                    setMobileIsValid(false);
                }
            }
            setPhoneInputKey(prev => prev + 1);
        } else if (status === 'Add') {
            setPaxData({
                Title: "",
                FirstName: "",
                MiddleName: "",
                LastName: "",
                Phoneno: "",
                Email: "",
                PaxType: "",
                Age: "",
                PassportNo: "",
                PassportIssueDate: "",
                PassportExpDate: "",
                PAN: ""
            });
            setPhoneCountry('lk');
            setPhoneInputKey(prev => prev + 1);
        }
    }, [isOpen, dataSet, status]);

    useEffect(() => {
        if (status === "add") {
            setPaxData({
                Title: "",
                FirstName: "",
                MiddleName: "",
                LastName: "",
                Phoneno: "",
                Email: "",
                PaxType: "",
                Age: "",
                PassportNo: "",
                PassportIssueDate: "",
                PassportExpDate: "",
                PAN: ""
            });
            setPhoneCountry('lk');
        }
    }, [status]);

    useEffect(() => {
        console.log("🔥 DATA RECEIVED IN EDIT:", dataSet);
    }, [dataSet]);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Function to clear specific error
    const clearError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const nameRegex = /^[A-Za-z ]+$/;
        const isAgeInvalidForAdult = paxData.PaxType === "1" && (paxData.Age < 13 || paxData.Age > 100);
        const isAgeInvalidForChild = paxData.PaxType === "2" && paxData.Age >= 13;

        if (!paxData.PaxType) {
            newErrors.PaxType = 'Please select the passenger type';
        } else {
            newErrors.PaxType = null;
        }

        if (!paxData.Title) {
            newErrors.Title = 'Please select a title';
        } else {
            newErrors.Title = null;
        }

        if (!paxData.FirstName) {
            newErrors.FirstName = 'Please enter your first name';
        } else if (!nameRegex.test(paxData.FirstName)) {
            newErrors.FirstName = 'First name should contain only letters and spaces';
        } else {
            newErrors.FirstName = null;
        }

        if (!paxData.LastName) {
            newErrors.LastName = 'Please enter your last name';
        } else if (!nameRegex.test(paxData.LastName)) {
            newErrors.LastName = 'Last name should contain only letters and spaces';
        } else {
            newErrors.LastName = null;
        }

        if (paxData.MiddleName && !nameRegex.test(paxData.MiddleName)) {
            newErrors.MiddleName = 'Middle name should contain only letters and spaces';
        } else {
            newErrors.MiddleName = null;
        }

        // Updated phone validation - only required for adults
        if (paxData.PaxType === "1") { // Adult
            if (!paxData.Phoneno) {
                newErrors.Phoneno = 'Please enter your phone number';
            } else if (!mobileIsValid) {
                newErrors.Phoneno = 'Please enter a valid phone number';
            } else {
                newErrors.Phoneno = null;
            }
        } else if (paxData.PaxType === "2") { // Child
            if (paxData.Phoneno && !mobileIsValid) {
                newErrors.Phoneno = 'Please enter a valid phone number';
            } else {
                newErrors.Phoneno = null;
            }
        }

        if (!paxData.Age) {
            newErrors.Age = 'Please enter age';
        } else if (isAgeInvalidForAdult) {
            newErrors.Age = 'Age must be greater than 12 and less than or equal to 100 for an adult';
        } else if (isAgeInvalidForChild) {
            newErrors.Age = 'Age must be less than 13 for a child';
        } else {
            newErrors.Age = null;
        }

        if (paxData.Email && !emailRegex.test(paxData.Email)) {
            newErrors.Email = 'Please enter a valid email';
        } else {
            newErrors.Email = null;
        }

        const nonNullErrors = Object.keys(newErrors).filter(key => newErrors[key] !== null);
        setErrors(newErrors);

        return nonNullErrors.length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPaxData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        clearError(name);
        
        // Real-time validation for specific fields
        if (name === 'FirstName' || name === 'LastName' || name === 'MiddleName') {
            const nameRegex = /^[A-Za-z ]+$/;
            if (value && nameRegex.test(value)) {
                clearError(name);
            }
        }
        
        if (name === 'Email') {
            if (!value || emailRegex.test(value)) {
                clearError(name);
            }
        }
        
        if (name === 'Age') {
            const age = parseInt(value);
            if (paxData.PaxType === "1" && age > 13 && age <= 100) {
                clearError(name);
            } else if (paxData.PaxType === "2" && age < 12 && age > 0) {
                clearError(name);
            }
        }
    };

    const handlePaxTypeChange = (title) => {
        setPaxData(prev => ({ ...prev, Title: title }));
        clearError('Title');
    };

    const handlePaxTypeSelection = (paxType) => {
        // Clear title when passenger type changes - let user select manually
        setPaxData(prev => ({ 
            ...prev, 
            PaxType: paxType,
            Title: "", // Clear title so user has to select manually
            // Also reset age if it doesn't match the new passenger type
            ...(paxType === "1" && prev.Age && prev.Age < 13 && { Age: "" }),
            ...(paxType === "2" && prev.Age && prev.Age >= 13 && { Age: "" })
        }));
        
        clearError('PaxType');
        clearError('Title');
        clearError('Age');
        clearError('Phoneno');
    };

    const handleSubmit = () => {
        const payload = { ...paxData, user_id: userId };
        if (validateForm()) {
            onSubmit(payload);
            toggle();
            setPaxData({
                Title: "",
                FirstName: "",
                MiddleName: "",
                LastName: "",
                Phoneno: "",
                Email: "",
                PaxType: "",
                Age: "",
                PassportNo: "",
                PassportIssueDate: "",
                PassportExpDate: "",
                PAN: ""
            });
            setPhoneCountry('lk');
            setPhoneInputKey(0);
        }
    };

    const handlePhoneInput = (value, country) => {
        const countryCode = country?.countryCode?.toUpperCase();
        setPhoneCountry(country.countryCode);
        setPaxData(prev => ({ ...prev, Phoneno: value }));
        
        const isValid = isValidPhoneNumber(value, countryCode);
        setMobileIsValid(isValid);
        
        // Clear phone error if validation passes
        if (isValid || (!value && paxData.PaxType === "2")) {
            clearError('Phoneno');
        }
    };

    useEffect(() => {
        if (dataSet?.id && dataSet?.Phoneno) {
            const detectedCountry = detectCountryFromPhone(dataSet.Phoneno);
            try {
                const isValid = isValidPhoneNumber(dataSet.Phoneno, detectedCountry.toUpperCase());
                setMobileIsValid(isValid);
            } catch (error) {
                setMobileIsValid(false);
            }
        }
    }, [dataSet]);

    return (
        <ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'Fill Booking Details'} className="theme-modal modal-md">
            <div className="modal-bg p-4 scrollBarDefault-design travel-buddies-mainpart">
                <div className="offer-content">
                    <Form>
                        <Row>
                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>Passenger Type <span className='required-asterik'>*</span> </label>
                                    <Col className='d-flex flex-row align-items-center gap-2'>
                                        <Button
                                            disabled={status === "edit" ? true : false}
                                            style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.PaxType === "1" ? '#ed4242' : '#fff', color: paxData.PaxType === "1" ? 'white' : 'black', fontWeight: '500' }}
                                            onClick={() => handlePaxTypeSelection("1")}
                                        >
                                            Adult
                                        </Button>
                                        <Button
                                            disabled={status === "edit" ? true : false}
                                            style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.PaxType === "2" ? '#ed4242' : '#fff', color: paxData.PaxType === "2" ? 'white' : 'black', fontWeight: '500' }}
                                            onClick={() => handlePaxTypeSelection("2")}
                                        >
                                            Child
                                        </Button>
                                    </Col>
                                    {errors.PaxType && <p className="text-danger">{errors.PaxType}</p>}
                                </div>
                            </Col>

                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>Title <span className='required-asterik'>*</span> </label>
                                    <Col className='d-flex flex-row align-items-center gap-2'>
                                        {(paxData.PaxType === '2') ? (
                                            <>
                                                <Button 
                                                    className={paxData.Title === "Master" ? "button-selected-value" : "button-static-value"} 
                                                    onClick={() => handlePaxTypeChange("Master")} 
                                                    style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Master" ? '#ed4242' : '#fff', color: paxData.Title === "Master" ? 'white' : 'black', fontWeight: '500' }}
                                                >
                                                    Master
                                                </Button>
                                                <Button 
                                                    className={paxData.Title === "Miss" ? "button-selected-value" : "button-static-value"} 
                                                    onClick={() => handlePaxTypeChange("Miss")} 
                                                    style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Miss" ? '#ed4242' : '#fff', color: paxData.Title === "Miss" ? 'white' : 'black', fontWeight: '500' }}
                                                >
                                                    Miss
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button 
                                                    onClick={() => handlePaxTypeChange("Mr")} 
                                                    style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Mr" ? '#ed4242' : '#fff', color: paxData.Title === "Mr" ? 'white' : 'black', fontWeight: '500' }}
                                                >
                                                    Mr
                                                </Button>
                                                <Button 
                                                    onClick={() => handlePaxTypeChange("Ms")} 
                                                    style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Ms" ? '#ed4242' : '#fff', color: paxData.Title === "Ms" ? 'white' : 'black', fontWeight: '500' }}
                                                >
                                                    Ms
                                                </Button>
                                                <Button 
                                                    onClick={() => handlePaxTypeChange("Mrs")} 
                                                    style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Mrs" ? '#ed4242' : '#fff', color: paxData.Title === "Mrs" ? 'white' : 'black', fontWeight: '500' }}
                                                >
                                                    Mrs
                                                </Button>
                                            </>
                                        )}
                                    </Col>
                                    {errors.Title && <p className="text-danger">{errors.Title}</p>}
                                </div>
                            </Col>
                        </Row>

                        {/* Name fields */}
                        <Row>
                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>First Name <span className='required-asterik'>*</span> </label>
                                    <Input type="text" name="FirstName" value={paxData.FirstName} onChange={handleInputChange} placeholder="Enter First Name" />
                                    {errors.FirstName && <p className="text-danger">{errors.FirstName}</p>}
                                </div>
                            </Col>
                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>Middle Name</label>
                                    <Input type="text" name="MiddleName" value={paxData.MiddleName} onChange={handleInputChange} placeholder="Enter Middle Name" />
                                    {errors.MiddleName && <p className="text-danger">{errors.MiddleName}</p>}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>Last Name <span className='required-asterik'>*</span> </label>
                                    <Input type="text" name="LastName" value={paxData.LastName} onChange={handleInputChange} placeholder="Enter Last Name" />
                                    {errors.LastName && <p className="text-danger">{errors.LastName}</p>}
                                </div>
                            </Col>
                            <Col lg="6" md="12" sm="12">
                                <div className='mb-3'>
                                    <label className='mb-1'>Age <span className='required-asterik'>*</span> </label>
                                    <Input type="number" name="Age" value={paxData.Age} onChange={handleInputChange} onInput={(e) => { e.target.value = e.target.value.replace(/[^0-9]/g, ''); }} min="1" max="100" placeholder="Enter Age" />
                                    {errors.Age && <p className="text-danger">{errors.Age}</p>}
                                </div>
                            </Col>
                        </Row>

                        {/* Email and Phone */}
                        <div className='mb-3'>
                            <label className='mb-1'>Email</label>
                            <Input type="email" name="Email" value={paxData.Email} onChange={handleInputChange} placeholder="Enter Email" />
                            {errors.Email && <p className="text-danger">{errors.Email}</p>}
                        </div>

                        <div className='mb-3'>
                            <label className='mb-1'>
                                Phone {paxData.PaxType === "1" && <span className='required-asterik'>*</span>}
                            </label>
                            <PhoneInput
                                key={`phone-input-${phoneInputKey}`}
                                country={phoneCountry}
                                value={paxData.Phoneno}
                                onChange={handlePhoneInput}
                                inputProps={{
                                    name: 'contact_number',
                                    required: paxData.PaxType === "1",
                                    id: 'phone-number',
                                    autoComplete: 'tel'
                                }}
                                enableSearch={true}
                                disableSearchIcon={false}
                            />
                            {errors.Phoneno && <p className="text-danger">{errors.Phoneno}</p>}
                        </div>

                        <div className='d-flex justify-content-center pt-2'>
                            <Button className="btn btn-sm btn-solid" onClick={handleSubmit}>
                                {paxData.id ? "Update Passenger" : "Add Passenger"}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </ModalBase>
    );
};

export default TravelBuddiesModal;

// import React, { useContext, useEffect, useState } from 'react';
// import { Button, Input, Row, Col, Form } from 'reactstrap';
// import { AppContext } from '../../../pages/_app';
// import PhoneInput from 'react-phone-input-2';
// import { isValidPhoneNumber } from 'libphonenumber-js';
// import ModalBase from '../Modals/ModalBase';
// import 'react-phone-input-2/lib/style.css';
// import { Tune } from '@mui/icons-material';

// const TravelBuddiesModal = ({ isOpen, toggle, onSubmit, dataSet, status, type=null }) => {
//     const { userId } = useContext(AppContext);
//     const [mobileIsValid, setMobileIsValid] = useState(false);
//     const [errors, setErrors] = useState({});

//     const [paxData, setPaxData] = useState({
//         Title: "",
//         FirstName: "",
//         MiddleName: "",
//         LastName: "",
//         Phoneno: "",
//         Email: "",
//         PaxType: "",
//         Age: "",
//         PassportNo: "",
//         PassportIssueDate: "",
//         PassportExpDate: "",
//         PAN: ""
//     });

//     useEffect(() => {
//         setErrors([])
//         if(status === "edit" && dataSet){
//             setPaxData(dataSet)
//         }else if(status === 'add'){
//             setPaxData({
//                 Title: "",
//                 FirstName: "",
//                 MiddleName: "",
//                 LastName: "",
//                 Phoneno: "",
//                 Email: "",
//                 PaxType: "",
//                 Age: "",
//                 PassportNo: "",
//                 PassportIssueDate: "",
//                 PassportExpDate: "",
//                 PAN: ""
//             });
//         }
//     },[isOpen]);

//     useEffect(() => {
//         if(status === "add"){
//             setPaxData({
//                 Title: "",
//                 FirstName: "",
//                 MiddleName: "",
//                 LastName: "",
//                 Phoneno: "",
//                 Email: "",
//                 PaxType: "",
//                 Age: "",
//                 PassportNo: "",
//                 PassportIssueDate: "",
//                 PassportExpDate: "",
//                 PAN: ""
//             });
//         }else{
//             null
//         }
//     },[status]);

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     // Function to clear specific error
//     const clearError = (fieldName) => {
//         if (errors[fieldName]) {
//             setErrors(prev => ({ ...prev, [fieldName]: null }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};
//         const nameRegex = /^[A-Za-z]+$/;
//         const isAgeInvalidForAdult = paxData.PaxType === "1" && (paxData.Age < 13 || paxData.Age > 100);
//         const isAgeInvalidForChild = paxData.PaxType === "2" && paxData.Age >= 13;

//         if (!paxData.PaxType) {
//             newErrors.PaxType = 'Please select the passenger type';
//         } else {
//             newErrors.PaxType = null;
//         }

//         if (!paxData.FirstName) {
//             newErrors.FirstName = 'Please enter your first name';
//         } else if (!nameRegex.test(paxData.FirstName)) {
//             newErrors.FirstName = 'First name should contain only letters';
//         } else {
//             newErrors.FirstName = null;
//         }

//         if (!paxData.LastName) {
//             newErrors.LastName = 'Please enter your last name';
//         } else if (!nameRegex.test(paxData.LastName)) {
//             newErrors.LastName = 'Last name should contain only letters';
//         } else {
//             newErrors.LastName = null;
//         }

//         if (paxData.MiddleName && !nameRegex.test(paxData.MiddleName)) {
//             newErrors.MiddleName = 'Middle name should contain only letters';
//         } else {
//             newErrors.MiddleName = null;
//         }

//         // Updated phone validation - only required for adults
//         if (paxData.PaxType === "1") { // Adult
//             if (!paxData.Phoneno) {
//                 newErrors.Phoneno = 'Please enter your phone number';
//             } else if (!mobileIsValid) {
//                 newErrors.Phoneno = 'Please enter a valid phone number';
//             } else {
//                 newErrors.Phoneno = null;
//             }
//         } else if (paxData.PaxType === "2") { // Child
//             if (paxData.Phoneno && !mobileIsValid) {
//                 newErrors.Phoneno = 'Please enter a valid phone number';
//             } else {
//                 newErrors.Phoneno = null;
//             }
//         }

//         if (!paxData.Title) {
//             newErrors.Title = 'Please select a title';
//         } else {
//             newErrors.Title = null;
//         }

//         // if (!paxData.Age || isAgeInvalidForAdult || isAgeInvalidForChild) {
//         //     if (paxData.PaxType === "1") {
//         //         newErrors.Age = 'Age must be greater than 12 and less than or equal to 100 for an adult';
//         //     } else if (paxData.PaxType === "2") {
//         //         newErrors.Age = 'Age must be less than 13 for a child';
//         //     }
//         // } else {
//         //     newErrors.Age = null;
//         // }

//           if (!paxData.Age) {
//         // Age is required regardless of passenger type
//         newErrors.Age = 'Please enter age';
//     } else if (isAgeInvalidForAdult) {
//         newErrors.Age = 'Age must be greater than 12 and less than or equal to 100 for an adult';
//     } else if (isAgeInvalidForChild) {
//         newErrors.Age = 'Age must be less than 13 for a child';
//     } else {
//         newErrors.Age = null;
//     }

//         if (paxData.Email && !emailRegex.test(paxData.Email)) {
//             newErrors.Email = 'Please enter a valid email';
//         } else {
//             newErrors.Email = null;
//         }

//         const nonNullErrors = Object.keys(newErrors).filter(key => newErrors[key] !== null);
//         setErrors(newErrors);

//         return nonNullErrors.length === 0;
//     };

//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setPaxData(prev => ({ ...prev, [name]: value }));
        
//         // Clear error for this field when user starts typing
//         clearError(name);
        
//         // Real-time validation for specific fields
//         if (name === 'FirstName' || name === 'LastName' || name === 'MiddleName') {
//             const nameRegex = /^[A-Za-z]+$/;
//             if (value && nameRegex.test(value)) {
//                 clearError(name);
//             }
//         }
        
//         if (name === 'Email') {
//             if (!value || emailRegex.test(value)) {
//                 clearError(name);
//             }
//         }
        
//         if (name === 'Age') {
//             const age = parseInt(value);
//             if (paxData.PaxType === "1" && age > 13 && age <= 100) {
//                 clearError(name);
//             } else if (paxData.PaxType === "2" && age < 12 && age > 0) {
//                 clearError(name);
//             }
//         }
//     };

//     const handlePaxTypeChange = (type) => {
//         setPaxData(prev => ({ ...prev, Title: type }));
//         clearError('Title'); // Clear title error when user selects a title
//     };

//     const handlePaxTypeSelection = (paxType) => {
//         setPaxData(prev => ({ ...prev, PaxType: paxType }));
//         clearError('PaxType'); // Clear passenger type error when user selects
        
//         // Also clear age error as validation rules change based on passenger type
//         clearError('Age');
        
//         // Clear phone error as requirements change based on passenger type
//         clearError('Phoneno');
//     };

//     const handleSubmit = () => {
//         const payload = { ...paxData, user_id: userId };
//         if (validateForm()) {
//             onSubmit(payload);
//             toggle();
//             setPaxData({
//                 Title: "",
//                 FirstName: "",
//                 MiddleName: "",
//                 LastName: "",
//                 Phoneno: "",
//                 Email: "",
//                 PaxType: "",
//                 Age: "",
//                 PassportNo: "",
//                 PassportIssueDate: "",
//                 PassportExpDate: "",
//                 PAN: ""
//             });
//         }
//     };

//     const handlePhoneInput = (value, country) => {
//         const countryCode = country?.countryCode?.toUpperCase();
//         setPaxData(prev => ({ ...prev, Phoneno: value }));
//         const isValid = isValidPhoneNumber(value, countryCode);
//         setMobileIsValid(isValid);
        
//         // Clear phone error if validation passes
//         if (isValid || (!value && paxData.PaxType === "2")) {
//             clearError('Phoneno');
//         }
//     };

//     useEffect(() => {
//         if (dataSet?.id) {
//             setMobileIsValid(true);
//         }
//         setPaxData(dataSet);
//     }, [dataSet]);

//     return (
//         <ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'Fill Booking Details'} className="theme-modal modal-md">
//             <div className="modal-bg p-4 scrollBarDefault-design travel-buddies-mainpart">
//                 <div className="offer-content">
//                     <Form>
//                         <Row>
//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>Passenger Type <span className='required-asterik'>*</span> </label>
//                                     <Col className='d-flex flex-row align-items-center gap-2'>
//                                         <Button
//                                             disabled={status === "edit" ? true : false}
//                                             style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.PaxType === "1" ? '#ed4242' : '#fff', color: paxData.PaxType === "1" ? 'white' : 'black', fontWeight: '500' }}
//                                             onClick={() => handlePaxTypeSelection("1")}
//                                         >
//                                             Adult
//                                         </Button>
//                                         <Button
//                                             disabled={status === "edit" ? true : false}
//                                             style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.PaxType === "2" ? '#ed4242' : '#fff', color: paxData.PaxType === "2" ? 'white' : 'black', fontWeight: '500' }}
//                                             onClick={() => handlePaxTypeSelection("2")}
//                                         >
//                                             Child
//                                         </Button>
//                                     </Col>
//                                     {errors.PaxType && <p className="text-danger">{errors.PaxType}</p>}
//                                 </div>
//                             </Col>

//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>Title <span className='required-asterik'>*</span> </label>
//                                     <Col className='d-flex flex-row align-items-center gap-2'>
//                                         {(paxData.PaxType === '2') ? (
//                                             <>
//                                                 <Button className={paxData.Title === "Master" ? "button-selected-value" : "button-static-value"} onClick={() => handlePaxTypeChange("Master")} style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Master" ? '#ed4242' : '#fff', color: paxData.Title === "Master" ? 'white' : 'black', fontWeight: '500' }}>Master</Button>
//                                                 <Button className={paxData.Title === "Miss" ? "button-selected-value" : "button-static-value"} onClick={() => handlePaxTypeChange("Miss")} style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Miss" ? '#ed4242' : '#fff', color: paxData.Title === "Miss" ? 'white' : 'black', fontWeight: '500' }}>Miss</Button>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <Button onClick={() => handlePaxTypeChange("Mr")} style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Mr" ? '#ed4242' : '#fff', color: paxData.Title === "Mr" ? 'white' : 'black', fontWeight: '500' }}>Mr</Button>
//                                                 <Button onClick={() => handlePaxTypeChange("Ms")} style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Ms" ? '#ed4242' : '#fff', color: paxData.Title === "Ms" ? 'white' : 'black', fontWeight: '500' }}>Ms</Button>
//                                                 <Button onClick={() => handlePaxTypeChange("Mrs")} style={{ border: '1px solid #ed4242', fontSize: '12px', backgroundColor: paxData.Title === "Mrs" ? '#ed4242' : '#fff', color: paxData.Title === "Mrs" ? 'white' : 'black', fontWeight: '500' }}>Mrs</Button>
//                                             </>
//                                         )}
//                                     </Col>
//                                     {errors.Title && <p className="text-danger">{errors.Title}</p>}
//                                 </div>
//                             </Col>
//                         </Row>

//                         {/* Name fields */}
//                         <Row>
//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>First Name <span className='required-asterik'>*</span> </label>
//                                     <Input type="text" name="FirstName" value={paxData.FirstName} onChange={handleInputChange} placeholder="Enter First Name" />
//                                     {errors.FirstName && <p className="text-danger">{errors.FirstName}</p>}
//                                 </div>
//                             </Col>
//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>Middle Name</label>
//                                     <Input type="text" name="MiddleName" value={paxData.MiddleName} onChange={handleInputChange} placeholder="Enter Middle Name" />
//                                     {errors.MiddleName && <p className="text-danger">{errors.MiddleName}</p>}
//                                 </div>
//                             </Col>
//                         </Row>
//                         <Row>
//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>Last Name <span className='required-asterik'>*</span> </label>
//                                     <Input type="text" name="LastName" value={paxData.LastName} onChange={handleInputChange} placeholder="Enter Last Name" />
//                                     {errors.LastName && <p className="text-danger">{errors.LastName}</p>}
//                                 </div>
//                             </Col>
//                             <Col lg="6" md="12" sm="12">
//                                 <div className='mb-3'>
//                                     <label className='mb-1'>Age <span className='required-asterik'>*</span> </label>
//                                     <Input type="number" name="Age" value={paxData.Age} onChange={handleInputChange}onInput={(e) => {e.target.value = e.target.value.replace(/[^0-9]/g, '');
//                                     }} min="1" max="100" placeholder="Enter Age" />
//                                     {/* <Input type="number" name="Age" value={paxData.Age} onChange={handleInputChange} min="1" max="100" placeholder="Enter Age" /> */}
//                                     {errors.Age && <p className="text-danger">{errors.Age}</p>}
//                                 </div>
//                             </Col>
//                         </Row>

//                         {/* Email and Phone */}
//                         <div className='mb-3'>
//                             <label className='mb-1'>Email</label>
//                             <Input type="email" name="Email" value={paxData.Email} onChange={handleInputChange} placeholder="Enter Email" />
//                             {errors.Email && <p className="text-danger">{errors.Email}</p>}
//                         </div>

//                         <div className='mb-3'>
//                             <label className='mb-1'>
//                                 Phone {paxData.PaxType === "1" && <span className='required-asterik'>*</span>}
//                             </label>
//                             <PhoneInput 
//                                 country={'lk'} 
//                                 value={paxData.Phoneno} 
//                                 onChange={handlePhoneInput} 
//                                 inputProps={{ 
//                                     name: 'contact_number', 
//                                     required: paxData.PaxType === "1", // Only required for adults
//                                     id: 'phone-number' 
//                                 }} 
//                             />
//                             {errors.Phoneno && <p className="text-danger">{errors.Phoneno}</p>}
//                         </div>

//                         <div className='d-flex justify-content-center pt-2'>
//                             <Button className="btn btn-sm btn-solid" onClick={handleSubmit}>
//                                 {paxData.id ? "Update Passenger" : "Add Passenger"}
//                             </Button>
//                         </div>
//                     </Form>
//                 </div>
//             </div>
//         </ModalBase>
//     );
// };

// export default TravelBuddiesModal;

