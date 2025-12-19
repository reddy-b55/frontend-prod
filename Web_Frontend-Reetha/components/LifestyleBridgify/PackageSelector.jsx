// import React, { useState } from 'react';
// import { Container, Row, Col, Card, Button } from 'react-bootstrap';

// export default function PackageSelector({ handleOnPressContinueData, handleClickBack, attractionTickets }) {
//     // Use the provided tour packages data
//     const packageData = attractionTickets || [];

//     // State to track selected package (store the full package object instead of just ID)
//     const [selectedPackageData, setSelectedPackageData] = useState(null);

//     const handleBack = () => {
//         handleClickBack();
//     };

//     const handleOnPressContinue = () => {
//         if (selectedPackageData) {
//             // Pass the complete package data to the parent component
//             handleOnPressContinueData(selectedPackageData);
//         }
//     };

//     const togglePackageSelection = (tourPackage) => {
//         // If this package is already selected (comparing by ID), keep it selected
//         // Otherwise, select this package and deselect others
//         setSelectedPackageData(
//             selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
//                 ? selectedPackageData
//                 : tourPackage
//         );
//     };

//     // Function to handle currency conversion (placeholder)
//     const CurrencyConverter = (currency, price) => {
//         return `${currency} ${price.toFixed(2)}`;
//     };

//     return (
//         <Container className="py-4">

//             <div className="package-list overflow-auto" style={{ maxHeight: '60vh' }}>
//                 {packageData.map((tourPackage) => (
//                     <Card
//                         key={tourPackage.option_id}
//                         className={`mb-3 shadow-sm border-0 rounded-4 ${selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
//                             ? 'border border-2 border-primary'
//                             : ''
//                             }`}
//                         onClick={() => togglePackageSelection(tourPackage)}
//                         style={{ cursor: 'pointer' }}
//                     >
//                         <Card.Body className="d-flex align-items-center">
//                             <div
//                                 className={`package-checkbox me-3 d-flex align-items-center justify-content-center ${selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
//                                     ? 'bg-primary'
//                                     : 'bg-white'
//                                     }`}
//                                 style={{
//                                     width: '24px',
//                                     height: '24px',
//                                     borderRadius: '4px',
//                                     border: '2px solid #0d6efd',
//                                 }}
//                             >
//                                 {selectedPackageData && selectedPackageData.option_id === tourPackage.option_id && (
//                                     <span className="text-white fw-bold" style={{ fontSize: '14px' }}>&#10003;</span>
//                                 )}
//                             </div>

//                             <div className="package-info flex-grow-1">
//                                 <h5 className="mb-1">{tourPackage.title}</h5>
//                                 {tourPackage.description && (
//                                     <p className="text-muted mb-1 small">{tourPackage.description}</p>
//                                 )}
//                                 <p className="mb-0 fw-bold text-primary">
//                                     {CurrencyConverter(tourPackage?.currency, tourPackage.retail_price)}
//                                 </p>
//                             </div>
//                         </Card.Body>
//                     </Card>
//                 ))}
//             </div>

//             <div className="mt-4">
//                 <Button
//                     variant="primary"
//                     className="w-100 py-3 d-flex align-items-center justify-content-center"
//                     disabled={!selectedPackageData}
//                     onClick={handleOnPressContinue}
//                 >
//                     <span className="me-2">Select Options</span>
//                     <span aria-hidden="true">&rarr;</span>
//                 </Button>
//             </div>
//         </Container>
//     );
// }

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

export default function PackageSelector({ handleOnPressContinueData, handleClickBack, attractionTickets }) {
    // Use the provided tour packages data
    const packageData = attractionTickets || [];

    // State to track selected package (store the full package object instead of just ID)
    const [selectedPackageData, setSelectedPackageData] = useState(null);

    const handleBack = () => {
        handleClickBack();
    };

    const handleOnPressContinue = () => {
        if (selectedPackageData) {
            // Pass the complete package data to the parent component
            handleOnPressContinueData(selectedPackageData);
        }
    };

    const togglePackageSelection = (tourPackage) => {
        // If this package is already selected (comparing by ID), keep it selected
        // Otherwise, select this package and deselect others
        console.log('Selected Package:', tourPackage.title);
        setSelectedPackageData(
            selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
                ? selectedPackageData
                : tourPackage
        );
    };

    // Function to handle currency conversion (placeholder)
    const CurrencyConverter = (currency, price) => {
        return `${currency} ${price.toFixed(2)}`;
    };

    function removeHtmlTags(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}


    return (
        <Container className="py-4">
            <div className="package-list overflow-auto" style={{ maxHeight: '60vh' }}>
                {packageData.map((tourPackage) => (
                    <Card
                        key={tourPackage.option_id}
                        className={`mb-3 shadow-sm border-0 rounded-4 ${
                            selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
                                ? 'border border-2 border-primary'
                                : ''
                        }`}
                        onClick={() => togglePackageSelection(tourPackage)}
                        style={{ cursor: 'pointer' }}
                    >
                        <Card.Body className="d-flex">
                            {/* Fixed-width container for the checkbox */}
                            <div className="checkbox-container" style={{ minWidth: '40px' }}>
                                <div
                                    className={`package-checkbox d-flex align-items-center justify-content-center ${
                                        selectedPackageData && selectedPackageData.option_id === tourPackage.option_id
                                            ? 'bg-primary'
                                            : 'bg-white'
                                    }`}
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '2px solid #0d6efd',
                                    }}
                                >
                                    {selectedPackageData && selectedPackageData.option_id === tourPackage.option_id && (
                                        <span className="text-white fw-bold" style={{ fontSize: '14px' }}>&#10003;</span>
                                    )}
                                </div>
                            </div>

                            {/* Content container that can grow and wrap */}
                            <div className="package-info flex-grow-1">
                                <h5 className="mb-1">{tourPackage.title}</h5>
                                {tourPackage.description && (
                                    <p className="text-muted mb-1 small">{removeHtmlTags(tourPackage.description)}</p>
                                )}
                                <p className="mb-0 fw-bold text-primary">
                                    {CurrencyConverter(tourPackage?.currency, tourPackage.retail_price)}
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            <div className="mt-4">
                <Button
                    variant="primary"
                    className="w-100 py-3 d-flex align-items-center justify-content-center"
                    disabled={!selectedPackageData}
                    onClick={handleOnPressContinue}
                >
                    <span className="me-2">Select Options</span>
                    <span aria-hidden="true">&rarr;</span>
                </Button>
            </div>
        </Container>
    );
}