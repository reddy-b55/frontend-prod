import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Collapse } from 'reactstrap';

import { LoadScript } from "@react-google-maps/api";
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

import { isValidPhoneNumber } from 'libphonenumber-js';

import { AppContext } from '../../../_app';
import { addNewShippingAddress, deleteShippingAddress, getShippingAddress, updateShippingAddress } from '../../../../AxiosCalls/UserServices/userServices';
import SavedAddressCard from '../../../../components/ProfileTabView/SavedAddressCard';
import ModalBase from '../../../../components/common/Modals/ModalBase';
import ToastMessage from '../../../../components/Notification/ToastMessage';
import Newaddress from './new-address';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ArrowBigLeft, ArrowBigRight, ArrowBigRightDash, ArrowLeft, Plus } from 'lucide-react';
import { ArrowBack } from '@mui/icons-material';
import { red } from '@mui/material/colors';

const SavedAddressPage = ({ activeTab,essentialsPage = false, handleSaveAddress, productView, handleGoBack }) => {

    const { userId } = useContext(AppContext);
    const [userShippingAdd, setUserShippingAdd] = useState([]);
    const [openNewShippingAddress, setOpenNewShippingAddress] = useState(false);
    const [googleLocation, setGoogleLocation] = useState('Select a location..');
    const [isMobileValid, setMobileIsValid] = useState(true);

    const [shippingFormData, setShippingFormData] = useState({
        contact_name: '',
        mobile_number: '',
        country: '',
        latitude: '',
        longitude: '',
        address_full: '',
        user_id: userId,
        houseNumber: '',
        subStreet: ''
    });

    const fetchUserData = async () => {
        const shippingAdd = await getShippingAddress(userId);
        setUserShippingAdd(shippingAdd);
    };


    useEffect(() => {
       setShippingFormData({
                    contact_name: '',
                    mobile_number: '',
                    country: '',
                    latitude: '',
                    longitude: '',
                    address_full: '',
                    user_id: userId,
                    houseNumber: '',
                    subStreet: ''
                });
    }, [activeTab])
    
    const handleFormChange = (e) => {
        setShippingFormData({ ...shippingFormData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!isMobileValid) {
            ToastMessage({ status: "error", message: "Please Enter Valid Phone Number." });
            return;
        }

        if(shippingFormData?.latitude === "" || shippingFormData?.longitude === "" || shippingFormData?.address_full === "") {
            // console.log("shippingFormData", shippingFormData)
            ToastMessage({ status: "error", message: "Please fill all mandatory data" });
            return;
        }

        if (validate()) {
            let result = [];
            if (editStatus) {
                result = await updateShippingAddress(updatingid, shippingFormData);
            } else {
                result = await addNewShippingAddress(shippingFormData);
            }
            if (result.status === 200 && result.data.status === 200) {
                setShippingFormData({
                    contact_name: '',
                    mobile_number: '',
                    country: '',
                    latitude: '',
                    longitude: '',
                    address_full: '',
                    user_id: userId,
                    houseNumber: '',
                    subStreet: ''
                });
                if (editStatus) {
                    ToastMessage({ status: "success", message: "Your Address updated Successfully" });
                } else {
                    ToastMessage({ status: "success", message: "Your Address Saved Successfully" });
                }
                setGoogleLocation('Select a location..');
                setOpenNewShippingAddress(false);
                setHandleNewAddress(false);
                if (productView) {
                    handleSaveAddress();
                }
                await fetchUserData();
            }
            setEditStatus(false);
        }

    };

    const [deleteStatus, setDeleteStatus] = useState({
        status: false,
        value: ''
    })

    const handleDelete = async (value) => {
        setDeleteStatus({
            status: true,
            value: value
        })
         setShippingFormData({
                    contact_name: '',
                    mobile_number: '',
                    country: '',
                    latitude: '',
                    longitude: '',
                    address_full: '',
                    user_id: userId,
                    houseNumber: '',
                    subStreet: ''
                });
        
    };

    const handleClear = () => {
        setDeleteStatus({
            status: false,
            value: ''
        })
    }

    const deleteShippingAdd = async () => {
        const result = await deleteShippingAddress(deleteStatus.value);
        if (result) {
            ToastMessage({ status: "success", message: "Shipping address deleted successfully." });
            await fetchUserData();
            setDeleteStatus({
                status: false,
                value: ''
            })
        }
    }

    const [editStatus, setEditStatus] = useState(false);
    const [updatingid, setupdatingid] = useState('')


    const validate = () => {
        // Regular expression to check if the contact_name contains any numbers
        const containsNumbers = /\d/;

        // Check if contact_name contains numbers
        if (containsNumbers.test(shippingFormData.contact_name)) {
            ToastMessage({ status: "error", message: "Contact name should not include numbers" });
            return false;
        }

        // Check if any of the mandatory fields are empty
        if (!shippingFormData.contact_name || !shippingFormData?.mobile_number || !shippingFormData?.country ) {
            ToastMessage({ status: "error", message: "Please fill all mandatory data" });
            return false;
        }

        return true;
    };

    const [tempCountry, settempCountry] = useState('')



    const handleOnGoogleLocationChangeAdd = (value,dataVal) => {

        setGoogleLocation(value?.label);
        console.log("dataaaa", value)
        // console.log("place Id", value?.value?.place_id)

        geocodeByPlaceId(value?.value?.place_id).then(results=>{

            getLatLng(results?.[0]).then(({lat,lng})=>{
                const addressFull = results?.[0]?.address_components?.find(component => 
                    component?.types?.includes("locality")
                )?.long_name;

                const countryFull = results?.[0]?.address_components?.find(component => 
                    component?.types?.includes("country")
                )?.long_name;
          


                setShippingFormData({
                                            ...shippingFormData,
                                            latitude: lat,
                                            longitude: lng,
                                            address_full: addressFull || "",
                                            country: countryFull || ""
                                        });
            })
        }) .catch(error => {
            console.error("Error fetching geocode data:", error);
        });




        // geocodeByPlaceId(value['value']['place_id']).then(results => getLatLng(results[0])).then(({ lat, lng }) => {
        //     console.log(results, "Value")
        //     geocodeByLatLng({ lat, lng }).then(results => {
        //         for (let i = 0; i < results[0].address_components.length; i++) {
        //             for (let b = 0; b < results[0].address_components[i].types.length; b++) {
        //                 if ((results[0].address_components[i].types.includes("locality") || results[0].address_components[i].types.includes("locality"))) {
        //        console.log(lat, lng, "Value")

        //                     setShippingFormData({
        //                         ...shippingFormData,
        //                         latitude: lat,
        //                         longitude: lng,
        //                         address_full: results[0].address_components[i].short_name,
        //                         country: results[results.length - 1].formatted_address
        //                     });
        //                     settempCountry(results[results.length - 1].formatted_address)
        //                     break;
        //                 }
        //             }
        //         }
        //     }).catch((error) => {
        //         // console.error(error)
        //     }
        //     );
        // });
    };

    const styles = {
        formLabel: {
            fontSize: '14px',
            margin: "0px",
            fontWeight: '500',
        },
        input: {
            borderColor: '#dddddd',
            fontSize: '14px',
            padding: '17px 25px',
            marginBottom: '15px',
            height: 'inherit',
        },
        inputPhone: {
            width: '100%',
            borderRadius: 0,
            padding: '14px 25px',
            borderColor: '#dddddd',
            fontSize: '14px',
            marginBottom: '15px',
            height: 'inherit',
        },
        select: {
            borderColor: '#dddddd',
            fontSize: '14px',
            padding: '17px 25px',
            marginBottom: '15px',
            height: 'inherit',
        },
        googlePlacesWrapper: {
            borderRadius: '0.25rem',
            borderColor: '#ced4da',
            boxShadow: 'none',
        },
        savedAddressCard: {
            border: '1px solid #dee2e6',
            borderRadius: '0.25rem',
            padding: '1rem',
            marginBottom: '1rem',
        },
        noAddress: {
            textAlign: 'center',
            marginTop: 43
        },
    };

    const mobileNumberOnChange = (value, country) => {
        setShippingFormData({ ...shippingFormData, mobile_number: value });
        let countryCode = country?.countryCode.toUpperCase()
        setMobileIsValid(isValidPhoneNumber(value, countryCode));
    };

    const handleChangeCountry = (option) => {
        if (option.label == tempCountry) {
            setShippingFormData({
                ...shippingFormData,
                country: option.label
            })
        } else {
            setGoogleLocation('Select a location..')
            setShippingFormData({
                ...shippingFormData,
                latitude: '',
                longitude: '',
                address_full: '',
                country: option.label
            })
        }
    };

    const [handleNewAddress, setHandleNewAddress] = useState(false);

    const handleAddNewAddress = () => {
        setHandleNewAddress(true);
        setEditStatus(false);
    }

    const handleEdit = (value, status) => {
        setupdatingid(value.id)
        setEditStatus(true);
        setShippingFormData({
            contact_name: value.contact_name,
            mobile_number: value.mobile_number,
            country: value.country,
            latitude: value.latitude,
            longitude: value.longtitude,
            address_full: value.address_full,
            user_id: userId,
            houseNumber: value.houseNumber,
            subStreet: value.subStreet
        })
        setGoogleLocation(value.address_full);
        if (status) {
            setHandleNewAddress(true);
        }
    }

    useEffect(() => {
        fetchUserData();
    }, []);
    const [isCollapsed, setIsCollapsed] = useState(true); // State to manage collapse

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };


    return (
        <section className="my-lg-5 p-0 profile-section" style={{ height: essentialsPage ? '70vh' : 'auto' }}>
            <Container className='p-0 m-0'>
                <Row className='m-0 p-0 p-lg-2 saved-address-page'>
                    {/* Saved Addresses Sidebar */}
                    <Col xs="12" sm="12" md="4" lg="4" className={`my-0 saved-address-sidebar ${isCollapsed ? 'd-none' : ''}`}>
                        <div className='d-flex align-items-center justify-content-start'>
                            <span className='cursor-pointer' onClick={handleGoBack}>
                                <ArrowBackIcon className='d-block d-lg-none' sx={{ background: 'red', padding: '1px', width: '25px', height: '25px', borderRadius: '50%', color: 'white' }} />
                            </span>
                            <h5 className='mb-2 text-start mx-4'>Saved Addresses</h5>
                            <span className='ms-auto cursor-pointer' onClick={() => handleAddNewAddress()}>
                                <AddIcon className='d-block d-lg-none' sx={{ background: 'red', padding: '1px', width: '25px', height: '25px', borderRadius: '50%', color: 'white' }} />
                            </span>
                        </div>

                        <div className='pe-lg-3 mt-2 mt-lg-3 mb-md-3' style={{ display: openNewShippingAddress ? 'none' : '' }}>
                            {userShippingAdd.length === 0 ? (
                                <div className='d-flex flex-column align-items-center justify-content-center py-5'>
                                    <p className='mb-3'>No saved addresses. Add a new address</p>
                                </div>
                            ) : (
                                userShippingAdd.map((value, index) => (
                                    <SavedAddressCard key={index} index={index} value={value} handleDelete={handleDelete} handleEdit={handleEdit} />
                                ))
                            )}
                        </div>
                    </Col>

                    {/* Toggle Button */}
                    <Col xs="1" className="p-0 m-0 d-flex align-items-center justify-content-center">
                        <div
                            className="collapse-toggle-btn d-flex align-items-center"
                            onClick={toggleCollapse}
                            style={{
                                width: isCollapsed ? "0px" : "60px", // Adjusted width for better visibility
                                height: "100%",
                                cursor: "pointer",
                                backgroundColor: isCollapsed ?"#ff4d4f":"#f6f6f6",
                                // borderColor: "#ff4d4f",
                                color: "red",
                                transition: "all 0.3s ease-in-out",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: isCollapsed ? "center" : "flex-end", // Center when collapsed, align to end when expanded
                                padding: isCollapsed ? "0" : "0 10px", // Add padding when expanded
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isCollapsed ? (
                                <div>
                                    <ArrowBigLeft size={40} style={{ color: "red" }} />
                                    <span style={{ color: "red", fontWeight: "bold", fontSize: "14px" }}>
                                        Address
                                    </span>
                                </div>
                            ) : (
                                <ArrowBigRight size={40} style={{ color: "red" }} />
                            )}
                        </div>
                        {/* <div
                            className="collapse-toggle-btn d-flex align-items-center justify-content-center"
                            onClick={toggleCollapse}
                            style={{
                                width: isCollapsed ? '0px' : '2px', // Adjust width when expanded
                                height: '100%',
                                cursor: 'pointer',
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                color: 'white',
                                transition: 'all 0.3s ease-in-out',
                                alignItems: "center",
                                // padding: "0 10px", // Add padding for better spacing
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isCollapsed ? (
                                <div>

                                    <ArrowBigLeft size={40} style={{ color: "red" }} />
                                    <span
                                        style={{
                                            color: "red",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            marginLeft: "auto", // Align text to the right of the arrow
                                        }}
                                    >
                                        Address
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <ArrowBigRight
                                        size={40}
                                        style={{ color: "red", marginLeft: "10px" }}
                                    />
                                </>
                            )}
                        </div> */}
                    </Col>

                    {/* <Col xs="1" className="p-0 m-0 d-flex align-items-center justify-content-center">
                        <div
                            className="collapse-toggle-btn d-flex align-items-center justify-content-between"
                            onClick={toggleCollapse}
                            style={{
                                width: isCollapsed ? "0px" : "0px", // Expand width when open
                                height: "100%",
                                cursor: "pointer",
                                backgroundColor: "#ff4d4f",
                                borderColor: "#ff4d4f",
                                color: "white",
                                transition: "all 0.3s ease-in-out",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 10px", // Add padding for better spacing
                                whiteSpace: "nowrap",
                            }}
                        >
                            {isCollapsed ? (
                                <div>

                                    <ArrowBigLeft size={40} style={{ color: "white" }} />
                                    <span
                                        style={{
                                            color: "white",
                                            fontWeight: "bold",
                                            fontSize: "14px",
                                            marginLeft: "auto", // Align text to the right of the arrow
                                        }}
                                    >
                                        Address
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <ArrowBigRight
                                        size={40}
                                        style={{ color: "white", marginLeft: "10px" }}
                                    />
                                </>
                            )}
                        </div>
                    </Col> */}
                    {/* 
                    <Col xs="1" className="p-0 m-0 d-flex align-items-center justify-content-center">
                        <div
                            className="collapse-toggle-btn d-flex align-items-center justify-content-center"
                            onClick={toggleCollapse}
                            style={{
                                width: isCollapsed ? '5px' : '2px', // Adjust width when expanded
                                height: '100%',
                                cursor: 'pointer',
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f',
                                color: 'white',
                                transition: 'all 0.3s ease-in-out',
                                display: 'flex',
                                alignItems: 'center',
                                padding: isCollapsed ? '0' : '0 10px', // Padding for expanded state
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {isCollapsed ? (
                                <div>

                                    <ArrowBigLeft size={40} style={{ color: "red" }} />
                                    <span style={{ color: "white", fontWeight: "bold", marginRight: "10px" }}>
                                        Address
                                    </span>
                                </div>
                            ) : (
                                <>
                                    <ArrowBigRight size={40} style={{ color: "red" }} />
                                </>
                            )}
                        </div>
                    </Col> */}


                    {/* New Address Form */}
                    <Col xs="12" sm="12" md="12" lg={isCollapsed ? '12' : '6'} className='p-0 m-0'>
                        <Newaddress
                            editStatus={editStatus}
                            googleLocation={googleLocation}
                            handleChangeCountry={handleChangeCountry}
                            isMobileValid={isMobileValid}
                            mobileNumberOnChange={mobileNumberOnChange}
                            styles={styles}
                            handleOnGoogleLocationChangeAdd={handleOnGoogleLocationChangeAdd}
                            handleFormSubmit={handleFormSubmit}
                            handleFormChange={handleFormChange}
                            shippingFormData={shippingFormData}
                            activeTab={activeTab}
                        />
                    </Col>
                </Row>
            </Container>

            {/* Modals */}
            <ModalBase isOpen={deleteStatus.status} toggle={handleClear} extracss={'testing'} title={'Delete shipping address'}>
                <div className='d-flex flex-column align-items-center'>
                    <h6 className='text-center'>Are you sure you want to delete this shipping address?</h6>
                    <div className='d-flex align-items-center gap-3 mt-3'>
                        <button className='btn btn-sm btn-solid' onClick={deleteShippingAdd}>Yes</button>
                        <button className='btn btn-sm btn-solid' onClick={handleClear}>No</button>
                    </div>
                </div>
            </ModalBase>

            <ModalBase isOpen={handleNewAddress} toggle={() => setHandleNewAddress(false)} title={editStatus ? 'Update address' : 'Add new address'}>
                <Newaddress
                    editStatus={editStatus}
                    googleLocation={googleLocation}
                    handleChangeCountry={handleChangeCountry}
                    isMobileValid={isMobileValid}
                    mobileNumberOnChange={mobileNumberOnChange}
                    styles={styles}
                    handleOnGoogleLocationChangeAdd={handleOnGoogleLocationChangeAdd}
                    handleFormSubmit={handleFormSubmit}
                    handleFormChange={handleFormChange}
                    shippingFormData={shippingFormData}
                />
            </ModalBase>

            <style jsx>{`
                .profile-section {
                    padding: 20px !important;
                    border-top: 1px solid #f1f1f1;
                    background-color: #F6F6F6;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .collapse-toggle-btn {
                    transition: background-color 0.3s ease;
                }
                .collapse-toggle-btn:hover {
                    background-color: #ddd;
                }
                .saved-address-sidebar {
                    background-color: #fff;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </section>
        //         <section className="my-lg-5 p-0 profile-section" style={{ height: essentialsPage ? '55vh' : 'auto' }}>

        //             <Container className='p-0 m-0'>
        //                 <Row className='m-0 p-0 p-lg-2 saved-address-page'>

        //                     <Col xs="12" sm="12" md="12" lg="8" className='d-none p-0 m-0 d-lg-block d-md-block'>
        //                         <Newaddress editStatus={editStatus} googleLocation={googleLocation} handleChangeCountry={handleChangeCountry} isMobileValid={isMobileValid} mobileNumberOnChange={mobileNumberOnChange} styles={styles} handleOnGoogleLocationChangeAdd={handleOnGoogleLocationChangeAdd} handleFormSubmit={handleFormSubmit} handleFormChange={handleFormChange} shippingFormData={shippingFormData} />
        //                     </Col>

        //                     <Col xs="12" sm="12" md="4" lg="4" className='my-0 saved-address-sidebar'>

        //                         <div className='d-flex align-items-cenetr justify-content-start'>
        //                             <span className='' onClick={handleGoBack}>
        //                                 <ArrowBackIcon className='d-block d-lg-none' sx={{ background: 'red', padding: '1px', width: '25px', height: '25px', borderRadius: '50%', color: 'white' }} />
        //                             </span>
        //                             <h5 className='mb-2 text-start mx-4'>Saved Addresses</h5>
        //                             <span className='ms-auto' onClick={() => handleAddNewAddress()}>
        //                                 <AddIcon className='d-block d-lg-none' sx={{ background: 'red', padding: '1px', width: '25px', height: '25px', borderRadius: '50%', color: 'white' }} />
        //                             </span>
        //                         </div>

        //                         <div className='pe-lg-3 mt-2 mt-lg-3 mb-md-3' style={{ display: openNewShippingAddress ? 'none' : '' }}>
        //                             {
        //                                 userShippingAdd.length === 0 ?
        //                                     <div className='d-flex flex-column align-items-center justify-content-center py-5'>
        //                                         <p className='mb-3'>No saved addresses. Add a new address</p>
        //                                     </div>
        //                                     :
        //                                     userShippingAdd.map((value, index) => (
        //                                         <SavedAddressCard key={index} index={index} value={value} handleDelete={handleDelete} handleEdit={handleEdit} />
        //                                     ))
        //                             }
        //                         </div>
        //                     </Col>

        //                 </Row>
        //             </Container>

        //             <ModalBase isOpen={deleteStatus.status} toggle={handleClear} extracss={'testing'} title={'Delete shipping address'}>
        //                 <div className='d-flex flex-column align-items-center'>
        //                     <h6 className='text-center'>Are you want to delete this shipping address</h6>
        //                     <div className='d-flex align-items-center gap-3 mt-3'>
        //                         <button className='btn btn-sm btn-solid' onClick={deleteShippingAdd}>Yes</button>
        //                         <button className='btn btn-sm btn-solid' onClick={handleClear}>No</button>
        //                     </div>
        //                 </div>
        //             </ModalBase>

        //             <ModalBase isOpen={handleNewAddress} toggle={() => setHandleNewAddress(false)} title={editStatus ? 'Update address' : 'Add new address'}>
        //                 <Newaddress editStatus={editStatus} googleLocation={googleLocation} handleChangeCountry={handleChangeCountry} isMobileValid={isMobileValid} mobileNumberOnChange={mobileNumberOnChange} styles={styles} handleOnGoogleLocationChangeAdd={handleOnGoogleLocationChangeAdd} handleFormSubmit={handleFormSubmit} handleFormChange={handleFormChange} shippingFormData={shippingFormData} />
        //             </ModalBase>

        //             <style jsx>{`
        //             .profile-section {
        //                 padding: 20px !important;
        //                 border-top: 1px solid #f1f1f1;
        //                 background-color:rgb(246, 246, 246);
        //                 border-radius: 8px;
        //                 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        //             }
        // `}</style>

        //         </section>
    );
};

export default SavedAddressPage;