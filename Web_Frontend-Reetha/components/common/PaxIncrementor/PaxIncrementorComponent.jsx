

import React, { useEffect, useState } from 'react';
import { Button, Input, Row, Col } from 'reactstrap';
import InfoIcon from '@mui/icons-material/Info';
import ToastMessage from '../../Notification/ToastMessage';

const PaxIncrementorComponent = ({ changeAges,addPaxPaxIncrement, open, adultCount, childCount, childAgesDynamic = {}, toggle, adultChildMinMax, paxLimitations, maxChildAdultCounts, type=null }) => {

    const [modal, setModal] = useState(open);
    const [adultQuantity, setAdultQuantity] = useState('');
    const [childQuantity, setChildQuantity] = useState('');
    const [childAges, setChildAges] = useState([]);
    const [isAdult, setIsAdult] = useState(false);
    const [isChild, setIsChild] = useState(false);
    const [isAdultAndChild, setIsAdultAndChild] = useState(false);

    console.log("Max Child Adult Counts", childAgesDynamic);

    const handleIncreasing = (type, countType) => {
        if (type === "Adult") {
            // Only decrease adult count if either:
            // 1. Adult count will still be > 0 after decrease, or
            // 2. Child count is > 0 (so we'll have at least one person)
            if (countType === "Decrease" && (adultQuantity > 1 || childQuantity > 0)) {
                setAdultQuantity(Math.max(adultQuantity - 1, 0));
            } 
            // For increasing, check against max limit if it exists
            else if (countType === "Increase") {
                const newAdultQuantity = maxChildAdultCounts?.AdultMax 
                    ? Math.min(parseInt(adultQuantity) + 1, maxChildAdultCounts.AdultMax) 
                    : parseInt(adultQuantity) + 1;
                
                setAdultQuantity(newAdultQuantity);
            }
        } else if (type === "Child") {
            if (countType === "Decrease") {
                // Only decrease child count if either:
                // 1. Child count will still be > 0 after decrease, or
                // 2. Adult count is > 0 (so we'll have at least one person)
                if (childQuantity > 1 || adultQuantity > 0) {
                    const newChildQuantity = Math.max(childQuantity - 1, 0);
                    setChildQuantity(newChildQuantity);
                    // Update child ages array to remove the last child
                    if (newChildQuantity < childAges.length) {
                        setChildAges(childAges.slice(0, newChildQuantity));
                    }
                }
            } else if (countType === "Increase") {
                // For increasing, check against max limit if it exists
                const newChildQuantity = maxChildAdultCounts?.ChildMax 
                    ? Math.min(parseInt(childQuantity) + 1, maxChildAdultCounts.ChildMax) 
                    : parseInt(childQuantity) + 1;
                setChildQuantity(newChildQuantity);
                
                // Add a default age of 1 for the new child
                if (newChildQuantity > childAges.length) {
                    setChildAges([...childAges, 1]);
                }
            }
        }
    };

    // New function to handle direct input of quantity
    const handleDirectInputChange = (type, value) => {
        // Convert to integer, default to 0 if invalid
        let numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 0) {
            numValue = 0;
        }
        
        if (type === "Adult") {
            // Check if we're going over max limit
            const finalValue = maxChildAdultCounts?.AdultMax 
                ? Math.min(numValue, maxChildAdultCounts.AdultMax)
                : numValue;
            
            // Make sure we have at least one person total
            if (finalValue === 0 && childQuantity === 0) {
                // If both would be zero, set adult to 1
                setAdultQuantity(1);
            } else {
                setAdultQuantity(finalValue);
            }
        } else if (type === "Child") {
            // Check if we're going over max limit
            const finalValue = maxChildAdultCounts?.ChildMax 
                ? Math.min(numValue, maxChildAdultCounts.ChildMax)
                : numValue;
            
            setChildQuantity(finalValue);
            
            // Update child ages array
            if (finalValue > childAges.length) {
                // Add default ages of 1 for new children
                const newAges = [...childAges];
                for (let i = childAges.length; i < finalValue; i++) {
                    newAges.push(1);
                }
                setChildAges(newAges);
            } else if (finalValue < childAges.length) {
                // Remove extra ages
                setChildAges(childAges.slice(0, finalValue));
            }
            
            // Make sure we have at least one person total
            if (finalValue === 0 && adultQuantity === 0) {
                setAdultQuantity(1);
            }
        }
    };

    const handleAgeChange = (index, age) => {
        const updatedAges = [...childAges];
        let validAge = parseInt(age);
        validAge = isNaN(validAge) || validAge < 0 ? 0 : validAge > 12 ? 12 : validAge;
        updatedAges[index] = age;
        setChildAges(updatedAges);


        // changeAges(updatedAges)
        // handleAgeChange()
    };

    const addPax = () => {
        const finalChildAges = {};
        const ageErrors = [];

        if ((adultQuantity + childQuantity) < 1) {
            ToastMessage({ status: "error", message: 'At least one person must be selected.' });
            return;
        }

        // Only check maximum limits if maxChildAdultCounts exists
        if (maxChildAdultCounts?.AdultMax && adultQuantity > maxChildAdultCounts.AdultMax) {
            ToastMessage({ status: "error", message: `Maximum ${maxChildAdultCounts.AdultMax} adults allowed.` });
            return;
        }

        if (maxChildAdultCounts?.ChildMax && childQuantity > maxChildAdultCounts.ChildMax) {
            ToastMessage({ status: "error", message: `Maximum ${maxChildAdultCounts.ChildMax} children allowed.` });
            return;
        }

        if (childQuantity > 0 && childAges.length !== childQuantity) {
            ToastMessage({ status: "error", message: 'Please enter the correct ages for all children.' });
            return;
        }

        childAges.forEach((age, index) => {
            if (age === undefined || age === null || age === "" || age === "0" || age <= 0) {
                ageErrors.push("Please fill all the child ages correctly");
            } else if (age > 12) {
                ageErrors.push("All child ages should be less than or equal to 12");
            } else {
                finalChildAges[`child${index}`] = age;
            }
        });

        if (ageErrors.length > 0) {
            ageErrors.forEach(error => {
                ToastMessage({ status: "error", message: error });
            });
            return;
        }

        if(type === "lifestyle") {
                const selectedPax = { 'adult': adultQuantity, 'child': childQuantity, 'childAges': finalChildAges }
                localStorage.setItem('selectedPax', JSON.stringify(selectedPax));
                console.log("session Dataaaaaaaaa", selectedPax);
        }
        addPaxPaxIncrement({ 'adult': adultQuantity, 'child': childQuantity, 'childAges': finalChildAges });
        toggle();
    };

    useEffect(() => {
        setModal(open);
    }, [open]);

    useEffect(() => {
        // Ensure at least one person when initializing
        const initialAdultCount = adultCount || 0;
        const initialChildCount = childCount || 0;
        
        // If both are 0, set adult to 1 by default
        if (initialAdultCount === 0 && initialChildCount === 0) {
            setAdultQuantity(1);
        } else {
            setAdultQuantity(initialAdultCount);
        }
        
        setChildQuantity(initialChildCount);
        
        // Initialize child ages from childAgesDynamic
        if (childAgesDynamic && Object.keys(childAgesDynamic).length > 0) {
            // Convert the childAgesDynamic object to an array of ages
            const agesArray = [];
            const sortedKeys = Object.keys(childAgesDynamic).sort(); // Sort to maintain order (child0, child1, etc.)
            
            sortedKeys.forEach(key => {
                const age = parseInt(childAgesDynamic[key]);
                agesArray.push(isNaN(age) ? 1 : age); // Default to 1 if invalid age
            });
            
            setChildAges(agesArray);
        } else if (initialChildCount > 0) {
            // If no childAgesDynamic but there are children, initialize with default age of 1
            setChildAges(Array(initialChildCount).fill(1));
        } else {
            setChildAges([]);
        }

        if (paxLimitations) {
            if (paxLimitations.includes("Adult") && paxLimitations.includes("Child")) {
                setIsAdultAndChild(true);
            } else if (paxLimitations.includes("Adult")) {
                setIsAdult(true);
            } else if (paxLimitations.includes("Child")) {
                setIsChild(true);
            } else {
                setIsAdultAndChild(false);
                setIsAdult(false);
                setIsChild(false);
            }
        }
    }, [adultCount, childCount, paxLimitations]);

    // Function to render the counter with direct input field for a given type
    const renderCounter = (type, count, isDisabled, showNA = false) => {
        const maxCount = type === "Adult" ? maxChildAdultCounts?.AdultMax : maxChildAdultCounts?.ChildMax;
        const isAtMax = maxCount ? count >= maxCount : false;
        
        // For decreasing buttons, check if we'd have no one selected
        const isDecreaseDisabled = type === "Adult" 
            ? (count <= 1 && childQuantity === 0) || (isAdult && count <= 1)
            : (count <= 1 && adultQuantity === 0) || (isChild && count <= 1) || count <= 0;
            
        return (
            <Col xs="12" md="6" className='mb-3'>
                <h6 className='text-center'>
                    {type} Count {showNA ? "(NA)" : maxCount ? `(Max: ${maxCount})` : ''}
                </h6>
                <div className='d-flex align-items-center justify-content-center'>
                    <Button
                        className="btn btn-sm btn-solid"
                        disabled={isDecreaseDisabled}
                        onClick={() => handleIncreasing(type, "Decrease")}
                    >
                        -
                    </Button>
                    
                    {/* Direct input field */}
                    <Input
                        type="number"
                        className="mx-2 text-center"
                        style={{ width: "60px" }}
                        value={count}
                        disabled={isDisabled}
                        onChange={(e) => handleDirectInputChange(type, e.target.value)}
                        min={0}
                        max={maxCount || 999}
                    />
                    
                    <Button
                        className="btn btn-sm btn-solid"
                        disabled={isDisabled || isAtMax}
                        onClick={() => handleIncreasing(type, "Increase")}
                    >
                        +
                    </Button>
                </div>
            </Col>
        );
    };

    return (
        <div>
            {!adultChildMinMax.adultAvl && (
                <p className='text-center'>
                    <InfoIcon sx={{ marginRight: '3px', marginBottom: '2px', fontSize: '16px' }} />
                    This product is not available for adults
                </p>
            )}

            {!adultChildMinMax.childAvl && (
                <p className='text-center'>
                    <InfoIcon sx={{ marginRight: '3px', marginBottom: '2px', fontSize: '16px' }} />
                    This product is not available for children
                </p>
            )}

            <Row className="mb-4 col-12 px-5">
                {isAdultAndChild && (
                    <>
                        {renderCounter("Adult", adultQuantity, false)}
                        {renderCounter("Child", childQuantity, false)}
                    </>
                )}

                {isAdult && !isAdultAndChild && (
                    <>
                        {renderCounter("Adult", adultQuantity, false)}
                        {renderCounter("Child", childQuantity, true, true)}
                    </>
                )}

                {isChild && !isAdultAndChild && (
                    <>
                        {renderCounter("Adult", adultQuantity, true, true)}
                        {renderCounter("Child", childQuantity, false)}
                    </>
                )}
                
                {!isAdultAndChild && !isAdult && !isChild && (
                    <>
                        {renderCounter("Adult", adultQuantity, false)}
                        {renderCounter("Child", childQuantity, false)}
                    </>
                )}
            </Row>

            {childQuantity > 0 && (
                <div className="py-3">
                    <h5>Child Ages</h5>
                    <Row className="mb-2">
                        {/* {childAges.map((age, index) => (
                            <Col xs="12" md="6" lg="4" className='mb-3' key={index}>
                                <label>Child {index + 1}</label>
                                <Input
                                    type="number"
                                    value={age}
                                    onChange={(e) => handleAgeChange(index, e.target.value)}
                                    min="1"
                                    max="12"
                                />
                            </Col>
                        ))} */}
                        {childAges.map((age, index) => (
                            <Col xs="12" md="6" lg="4" className='mb-3' key={index}>
                                <label>Child {index + 1}</label>
                                <Input
                                    type="number"
                                    value={age}
                                    onChange={(e) => handleAgeChange(index, e.target.value)}
                                    min="1"
                                    max="12"
                                />
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            <Col className='d-flex flex-column align-items-center pt-2'>
                <Button type="button" className="btn btn-solid" onClick={() => addPax()}>
                    Add Pax
                </Button>
            </Col>
        </div>
    );
};

export default PaxIncrementorComponent;

