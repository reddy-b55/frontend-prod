import React, { useState, useEffect } from 'react';
import { Input, FormGroup, Label, Button } from 'reactstrap';
import ModalBase from '../Modals/ModalBase';
import ToastMessage from '../../Notification/ToastMessage';

import 'react-phone-input-2/lib/style.css';

const TravelBuddiesTBOModal = ({ isOpen, toggle, provider, buddiesData: initialBuddiesData = [], preBooking, submitBuddies }) => {
    const [buddiesData, setBuddiesData] = useState([]);

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            setBuddiesData(
                initialBuddiesData.map(buddy => ({
                    ...buddy,
                    PAN: buddy.PAN || '', // Ensure PAN exists
                    PassportNo: buddy.PassportNo || '' // Ensure PassportNo exists
                }))
            );
        }
    }, [isOpen]);

    // Handle input change for PAN and Passport
    const handleInputChange = (index, field, value) => {
        setBuddiesData(prevData =>
            prevData.map((buddy, i) =>
                i === index ? { ...buddy, [field]: value } : buddy
            )
        );
    };

    // Validation function to check if required fields are filled
    const isDataValid = () => {
        return !buddiesData.some(buddy => 
            (preBooking.PanMandatory && !buddy.PAN.trim()) || 
            (preBooking.PassportMandatory && !buddy.PassportNo.trim())
        );
    };

    // Handle Update More Info Button
    const handleUpdate = () => {
        if (!isDataValid()) {
            ToastMessage({ status: "warning", message: "Please fill all required fields before submitting." });
            return;
        }

        console.log("Updated Buddies Data:", JSON.stringify(buddiesData, null, 2));
        ToastMessage({ status: "success", message: "Details updated successfully!" });

        if (submitBuddies) {
            submitBuddies(buddiesData); // Callback function to submit data
        }
    };

    // Handle Modal Close Validation
    const handleToggle = () => {
        if (!isDataValid()) {
            ToastMessage({ status: "warning", message: "Please fill all required fields before closing." });
        } else {
            toggle();
        }
    };

    return (
        <ModalBase isOpen={isOpen} toggle={handleToggle} showtitle={true} title={'More details'} className="theme-modal modal-md">
            <div className="modal-bg p-4 scrollBarDefault-design travel-buddies-mainpart">
                <div className="offer-content">
                    {buddiesData.length > 0 ? (
                        buddiesData.map((buddy, index) => (
                            <div key={buddy.id || index} className="mb-3">
                                <h5>{buddy.Title} {buddy.FirstName} {buddy.LastName}</h5>
                                {preBooking.PanMandatory && (
                                    <FormGroup>
                                        <Label for={`pan-${index}`}>PAN Number</Label>
                                        <Input
                                            type="text"
                                            id={`pan-${index}`}
                                            placeholder="Enter PAN Number/ ex : AAAPA1234A"
                                            value={buddy.PAN}
                                            onChange={(e) => handleInputChange(index, "PAN", e.target.value)}
                                        />
                                    </FormGroup>
                                )}
                                {preBooking.PassportMandatory && (
                                    <FormGroup>
                                        <Label for={`passport-${index}`}>Passport Number</Label>
                                        <Input
                                            type="text"
                                            id={`passport-${index}`}
                                            placeholder="Enter Passport Number"
                                            value={buddy.PassportNo}
                                            onChange={(e) => handleInputChange(index, "PassportNo", e.target.value)}
                                        />
                                    </FormGroup>
                                )}
                            </div>
                        ))
                    ) : (
                        <p>No travel buddies available.</p>
                    )}
                </div>
                {/* Update More Info Button */}
                <div className="text-center mt-3">
                    <Button color="primary" onClick={handleUpdate}>Update More Info</Button>
                </div>
            </div>
        </ModalBase>
    );
};

export default TravelBuddiesTBOModal;


