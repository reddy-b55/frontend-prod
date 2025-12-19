import React, { useEffect, useState } from 'react';
import { Button, Input, Row, Col } from 'reactstrap';
import InfoIcon from '@mui/icons-material/Info';
import ToastMessage from '../../Notification/ToastMessage';

const PaxIncrementorComponentFlights = ({ adultCount, childCount, infantCount, addPaxPaxIncrement }) => {

    const [adultQuantity, setAdultQuantity] = useState('');
    const [childQuantity, setChildQuantity] = useState('');
    const [infantQuantity, setinfantQuantity] = useState('');

    const handleIncreasing = (type, countType) => {
        // if (type === "Adult") {
        //     const newAdultQuantity = countType === "Increase" ? adultQuantity + 1 : Math.max(adultQuantity - 1, 0);
        //     setAdultQuantity(newAdultQuantity);
        //     if (newAdultQuantity === 0 && childQuantity === 0) {
        //         setChildQuantity(1);
        //     }
        if (type === "Adult") {
            const newAdultQuantity = countType === "Increase"
                ? adultQuantity + 1
                : Math.max(adultQuantity - 1, 1); // Changed from 0 to 1 here
           
            setAdultQuantity(newAdultQuantity);
           
            // Since adult quantity will never be 0 now, you might want to reconsider this condition
            if (newAdultQuantity === 0 && childQuantity === 0) {
                setChildQuantity(1);
            }
        } else if (type === "Child") {
            const newChildQuantity = countType === "Increase" ? childQuantity + 1 : Math.max(childQuantity - 1, 0);
            if (adultQuantity === 0 && newChildQuantity === 0) {
                setChildQuantity(1);
            } else {
                setChildQuantity(newChildQuantity);
            }
        } else if (type === "Infant") {
            const newInfantQuantity = countType === "Increase" ? infantQuantity + 1 : Math.max(infantQuantity - 1, 0);
            if (adultQuantity === 0 && newInfantQuantity === 0) {
                setinfantQuantity(1);
            } else {
                setinfantQuantity(newInfantQuantity);
            }
        }
    };

    const addPax = () => {
        if ((adultQuantity + childQuantity) < 1) {
            ToastMessage({ status: "error", message: 'At least one adult must be selected.' })
        } else {
            addPaxPaxIncrement({ 'adult': adultQuantity, 'child': childQuantity, 'infant': infantQuantity });
        }
    };

    useEffect(() => {
        setAdultQuantity(adultCount);
        setChildQuantity(childCount);
        setinfantQuantity(infantCount);
    }, []);

    return (

        <div>

            <Row className="mt-4 col-12 d-flex flex-wrap align-items-center justify-content-center">
                <Col className='col-12'>
                    <h6 className='text-center'>Adult Count</h6>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Adult", "Decrease")}>-</Button>
                        <span className="px-2 mx-3 border-bottom">{adultQuantity}</span>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Adult", "Increase")}>+</Button>
                    </div>
                </Col>
                <Col className='col-5 mt-4 mb-2'>
                    <h6 className='text-center'>Child Count</h6>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Child", "Decrease")}>-</Button>
                        <span className="px-2 mx-3 border-bottom">{childQuantity}</span>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Child", "Increase")}>+</Button>
                    </div>
                </Col>
                <Col className='col-5 mt-4 mb-2'>
                    <h6 className='text-center'>Infant Count</h6>
                    <div className='d-flex align-items-center justify-content-center'>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Infant", "Decrease")}>-</Button>
                        <span className="px-2 mx-3 border-bottom">{infantQuantity}</span>
                        <Button className="btn btn-sm btn-solid" onClick={() => handleIncreasing("Infant", "Increase")}>+</Button>
                    </div>
                </Col>
            </Row>

            <Col className='d-flex flex-column align-items-center mt-4'>
                <Button type="button" className="btn btn-solid" onClick={() => addPax()}>Save and continue</Button>
            </Col>

        </div>

    );
};

export default PaxIncrementorComponentFlights;
