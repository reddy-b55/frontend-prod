import React, { useEffect, useMemo, useState, useContext } from 'react';
import { Row, Form, Input, Label, Col, Button } from 'reactstrap';

import { LoadScript } from "@react-google-maps/api";
import GooglePlacesAutocomplete, { geocodeByLatLng, geocodeByPlaceId, getLatLng } from 'react-google-places-autocomplete';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import countryList from 'react-select-country-list';
import Select from 'react-select';
import { AppContext } from "../../../_app";

function newaddress({ activeTab,isMobileValid, googleLocation, handleFormSubmit, handleFormChange, shippingFormData, styles, handleOnGoogleLocationChangeAdd, mobileNumberOnChange, handleChangeCountry, editStatus = false }) {

    const { groupApiCode } = useContext(AppContext);

    const apiUrl = groupApiCode;
    const options = useMemo(() => countryList().getData(), []);

    const [shippingFormDataUpdated, setshippingFormData] = useState([]);
    
    useEffect(() => {
        // console.log("shippiing data iss dataaaaaaaa testtttt12123s",shippingFormDataUpdated)
        setshippingFormData([])
    }, [activeTab]);
    

    useEffect(() => {
        console.log("shippiing data iss", shippingFormData)
        setshippingFormData(shippingFormData);
    }, [shippingFormData]);

    const [editStatusUpdated, seteditStatus] = useState(false);

    useEffect(() => {
        seteditStatus(editStatus)
    }, [editStatus])

    // useEffect(() => {
    //     if (navigator.geolocation) {
    //         navigator.geolocation.getCurrentPosition(async (position) => {
    //             const { latitude, longitude } = position.coords;
    //             console.log('countryOptionnnnnnnnnnnnnnnnnnn', latitude, longitude)
    //             try {
    //                 const results = await geocodeByLatLng({ lat: latitude, lng: longitude });
    //                 const addressComponents = results[0].address_components;
    //                 const countryComponent = addressComponents.find(component => component.types.includes('country'));
    //                 const countryName = countryComponent.long_name;
    //                 const countryOption = options.find(option => option.label === countryName);
    //                 console.log('countryOptionnnnnnnnnnnnnnnnnnn', countryOption)
    //                 handleChangeCountry(countryOption);
    //             } catch (error) {
    //                 console.error('Error fetching location details:', error);
    //             }
    //         });
    //     }
    // // }, [options, handleChangeCountry]);
    // }, [options]);

    

    return (
        <div className='m-0 p-0 add-new-update-address-main' style={{height: '60vh'}}>
            <h5 className='mb-4 text-start m-0 p-0 d-none d-lg-block'>New Shipping Addresses</h5>
            <Form className="theme-form m-0 p-0" onSubmit={handleFormSubmit}>
                <Row className='m-0 p-0'>
                    <Col className='mb-lg-2 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" for="contactname" style={styles.formLabel}>Contact Name <Label style={{ color: 'red' }}>*</Label></Label>
                        <Input type="text" className="form-control" name="contact_name" value={shippingFormDataUpdated.contact_name} onChange={handleFormChange} placeholder="Contact Name" style={styles.input} />
                    </Col>
                    <Col className='mb-lg-2 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" style={styles.formLabel}>Mobile Number <Label style={{ color: 'red' }}>*</Label></Label>
                        <PhoneInput 
                            country={'lk'} 
                            name='mobile_number' 
                            className='w-100' 
                            value={shippingFormDataUpdated.mobile_number} 
                            onChange={mobileNumberOnChange} 
                            enableSearch={true}
                            countryCodeEditable={true}
                            inputProps={{ 
                                name: 'contact_number', 
                                required: true, 
                                className: 'form-control', 
                                id: 'phone-number', 
                                style: styles.inputPhone
                            }} 
                        />
                        {!isMobileValid && <span style={{ fontSize: 12, color: 'red' }}>Invalid Mobile Number</span>}
                    </Col>
                    <Col className='mb-lg-4 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" style={styles.formLabel}>Search for your location <Label style={{ color: 'red' }}>*</Label></Label>
                        <div className='product-variant-head'>
                            {/* <LoadScript
                                googleMapsApiKey={groupApiCode}
                                libraries={["places", "geometry"]}
                                onLoadFailed={(error) => console.error("Could not inject Google script", error)}
                            > */}
                                <GooglePlacesAutocomplete
                                    apiKey={groupApiCode}
                                    GooglePlacesDetailsQuery={{ fields: "geometry" }}
                                    
                                    onLoadFailed={(error) => console.error("Could not inject Google script", error)}
                                    selectProps={{
                                        value: googleLocation.slice(0, 45) + ' ...',
                                        placeholder: googleLocation.slice(0, 45) + ' ...',
                                        onChange: handleOnGoogleLocationChangeAdd,
                                        styles: { control: (base) => ({ ...base, borderRadius: 0, padding: '8px 10px', height: 'inherit', fontFamily: '-apple', fontSize: '14px' }) }
                                    }}
                                    
                                />
                            {/* </LoadScript> */}
                        </div>
                    </Col>
                    <Col className='mb-lg-4 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" style={styles.formLabel}>Select Country <Label style={{ color: 'red' }}>*</Label></Label>
                        <Select options={options} name="country" value={options.find(data => data.label == shippingFormDataUpdated.country)} onChange={handleChangeCountry} className="react__Select" styles={{ control: (base) => ({ ...base, borderRadius: 0, padding: '8px 15px', height: 'inherit', fontSize: '14px' }), }} />
                    </Col>
                    <Col className='mb-lg-2 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" for="houseNumber" style={styles.formLabel}>House Number</Label>
                        <Input type="text" className="form-control mt-1" name="houseNumber" value={shippingFormDataUpdated.houseNumber} onChange={handleFormChange} placeholder="House Number" style={styles.input} />
                    </Col>
                    <Col className='mb-lg-2 mb-md-3' xs="12" md="6" sm="12">
                        <Label className="form-label" for="subStreet" style={styles.formLabel}>Street Name</Label>
                        <Input type="text" className="form-control mt-1" name="subStreet" value={shippingFormDataUpdated.subStreet} onChange={handleFormChange} placeholder="Street Name" style={styles.input} />
                    </Col>

                </Row>
                <Button type="submit" className="btn btn-sm mx-4 mx-lg-0 mb-4 mb-lg-0 mb-mf-0 btn-solid">{editStatusUpdated ? 'Update shipping address' : "Save Shipping Address"}</Button>
            </Form>
        </div>
    )
}

export default newaddress;