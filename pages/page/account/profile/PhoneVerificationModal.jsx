import React, { useContext, useState } from "react";
import { sendOTP, verifyOTP } from "../../../../AxiosCalls/apiService";
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Input } from "reactstrap";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { AppContext } from "../../../_app";

const PhoneVerificationModal = ({ isOpen, onClose, onVerify, phoneNumber }) => {
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' or 'otp'
    const [newPhoneNumber, setNewPhoneNumber] = useState(phoneNumber);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [verifiedPhoneNumber, setVerifiedPhoneNumber] = useState('');

    const { userId } = useContext(AppContext);

    const handleOnClose= ()=>{
        setNewPhoneNumber(phoneNumber)
        onClose()
    }

    const handleSendOTP = async () => {
        setIsLoading(true);
        try {
            // let userid = localStorage.getItem('#_uid')
            console.log(userId);
            await sendOTP(newPhoneNumber, userId);
            setStep('otp');
            setError('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setIsLoading(true);
        try {
           
            await verifyOTP(newPhoneNumber, otp,userId);
            setVerifiedPhoneNumber(newPhoneNumber); // Set the verified phone number
            onVerify(newPhoneNumber); // Pass the verified phone number to the parent component
            handleOnClose();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeNumber = () => {
        setStep('phone');  
        setOtp('');
        setError('');
    }

    return (
        <Modal isOpen={isOpen} toggle={handleOnClose} centered>
            <ModalHeader toggle={handleOnClose} style={{backgroundColor: "#ed4242"}}>
                {step === 'phone' ? 'Update Phone Number' : 'Enter OTP'}
            </ModalHeader>
            <ModalBody className="p-4">
                {error && <Alert color="danger">{error} </Alert>}

                {step === 'phone' ? (
                    <div>
                        <Label>Enter New Phone Number</Label>
                        <PhoneInput
                            country={'us'}
                            value={newPhoneNumber}
                            onChange={(value) => setNewPhoneNumber(value)}
                            inputProps={{
                                className: 'form-control',
                                required: true,
                            }}
                        />
                        <Button
                           
                            className="mt-3"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            style={{backgroundColor: "#ed4242", borderColor:"white"}}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Label>Enter 6-digit OTP sent to {newPhoneNumber}</Label>
                        <Input
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="form-control"
                            placeholder="Enter OTP"
                        />
                        <Button
                            // color="primary"
                            style={{backgroundColor: "#ed4242",borderColor:"white"}}
                            className="mt-3"
                            onClick={handleVerifyOTP}
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                         <Button
                            // color="primary"
                            style={{backgroundColor: "#ed4242",borderColor:"white"}}
                            className="mt-3"
                            onClick={handleChangeNumber}
                        >
                            change number
                        </Button>
                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default PhoneVerificationModal;