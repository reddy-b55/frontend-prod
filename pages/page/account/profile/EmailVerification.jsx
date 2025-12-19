import { useContext, useState } from "react";
import { sendOTP, sendOTPEmail, verifyOTP, verifyOTPEmail } from "../../../../AxiosCalls/apiService";
import { Alert, Button, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import PhoneInput from "react-phone-input-2";
import { ReportGmailerrorred } from "@mui/icons-material";
import { AppContext } from "../../../_app";

const EmailVerification = ({ isOpen, onClose, onVerify, email }) => {
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'phone' or 'otp'
    const [newEmail, setNewEmail] = useState(email);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { userId } = useContext(AppContext);

      const handleOnClose= ()=>{
        setNewEmail(email)
        onClose()
    }


    const handleSendOTP = async () => {
        // hirushafernando121@gmail.com
        setIsLoading(true);
        try {
            console.log("newEmail", newEmail);


            // API call to send OTP
            await sendOTPEmail(newEmail, userId);
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
            // API call to verify OTP
            await verifyOTPEmail(newEmail, otp, userId);
            onVerify(newEmail);
           handleOnClose();
            // window.location.reload();
        } catch (error) {
            setError('Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setStep('email');
        setOtp('');
        setError('');
    }

    return (
        <Modal isOpen={isOpen} toggle={handleOnClose} centered>
            <ModalHeader toggle={handleOnClose} className="text-white" style={{ backgroundColor: "#ed4242" }}>
                {step === 'email' ? 'Update Email Address' : 'Enter OTP'}
            </ModalHeader>
            <ModalBody className="p-4">
                {error && <Alert color="danger">{error}</Alert>}

                {step === 'email' ? (
                    <div>
                        <Label>Enter New Email</Label>
                        <Input
                            type="email"
                            className="form-control"
                            id="email"
                            name="customer_email"
                            placeholder="Email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />

                        {/* <PhoneInput
                            country={'us'}
                            value={newPhoneNumber}
                            onChange={(value) => setNewPhoneNumber(value)}
                            inputProps={{
                                className: 'form-control',
                                required: true
                            }}
                        /> */}
                        <Button
                            // color="primary"
                            className="mt-3"
                            onClick={handleSendOTP}
                            disabled={isLoading}
                            style={{ backgroundColor: "#ed4242", borderColor: "white" }}
                        >
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Label>Enter 6-digit OTP sent to {newEmail}</Label>
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
                            className="mt-3"
                            onClick={handleVerifyOTP}
                            style={{ backgroundColor: "#ed4242", borderColor: "white" }}
                            disabled={isLoading || otp.length !== 6}
                        >
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </Button>
                        <Button
                            // color="primary"
                            style={{ backgroundColor: "#ed4242", borderColor: "white" }}
                            className="mt-3"
                            onClick={handleChangeEmail}
                        >
                            change email
                        </Button>

                    </div>
                )}
            </ModalBody>
        </Modal>
    );
};

export default EmailVerification;