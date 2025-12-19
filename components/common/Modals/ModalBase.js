// import React from 'react';
// import { Button, Col, Modal, ModalBody, Row } from 'reactstrap';

// export default function ModalBase({ isOpen, toggle, children, title, showtitle = true, showtoggle = true, size = "md", extracss, showtoggleClose = true }) {
//     return (
//         <Modal isOpen={isOpen} toggle={toggle} className={"theme-modal modal-" + size} centered >
//             <ModalBody>
//                 <Row className="compare-modal">
//                     <Col lg="12">
//                         <div className={`modal-bg ${extracss}`}>
//                             {showtoggle && <Button type="button" className="btn-close" aria-label="Close" onClick={toggle}></Button>}
//                             <div className="offer-content">
//                                 {showtitle && <h5>{title}</h5>}
//                                 {children}
//                             </div>
//                             <div className='col-12 mt-5 d-flex justify-content-center'>
//                                 {(!showtoggle && showtoggleClose) && <button onClick={toggle} className='btn-solid btn-primary'>close</button>}
//                             </div>
//                         </div>
//                     </Col>
//                 </Row>
//             </ModalBody>
//         </Modal>
//     )
// };

import React, { useEffect } from 'react';
import { Button, Col, Modal, ModalBody, Row } from 'reactstrap';

export default function ModalBase({ 
    isOpen, 
    toggle, 
    children, 
    title, 
    showtitle = true, 
    showtoggle = true, 
    size = "md", 
    extracss, 
    showtoggleClose = true,
    extraMargin = true
}) {
    // Fix: Use isOpen in the dependency array to track modal state changes
    useEffect(() => {
        if (isOpen) {
            // Disable body scroll when modal opens
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable body scroll when modal closes
            // document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is restored
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]); // Add isOpen to dependency array

    return (
        <Modal isOpen={isOpen} toggle={toggle} className={"theme-modal modal-" + size} centered >
            <ModalBody>
                <Row className="compare-modal">
                    <Col lg="12">
                        <div className={`modal-bg ${extracss}`}>
                            {showtoggle && <Button type="button" className="btn-close" aria-label="Close" onClick={toggle}></Button>}
                            <div className="offer-content">
                                {showtitle && <h5>{title}</h5>}
                                {children}
                            </div>
                            {extraMargin &&
                              <div className='col-12 mt-5 d-flex justify-content-center'>
                                {(!showtoggle && showtoggleClose) && <button onClick={toggle} className='btn-solid btn-primary'>close</button>}
                            </div>
                            }
                          
                        </div>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
};

// Alternative approach: Enhanced version with scroll position preservation
// export function ModalBaseEnhanced({ 
//     isOpen, 
//     toggle, 
//     children, 
//     title, 
//     showtitle = true, 
//     showtoggle = true, 
//     size = "md", 
//     extracss, 
//     showtoggleClose = true 
// }) {
//     useEffect(() => {
//         if (isOpen) {
//             // Store current scroll position
//             const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
//             const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
            
//             // Disable scroll and fix position to prevent jumping
//             document.body.style.overflow = 'hidden';
//             document.body.style.position = 'fixed';
//             document.body.style.top = `-${scrollTop}px`;
//             document.body.style.left = `-${scrollLeft}px`;
//             document.body.style.width = '100%';
            
//             // Store scroll position in body dataset for retrieval
//             document.body.dataset.scrollTop = scrollTop;
//             document.body.dataset.scrollLeft = scrollLeft;
//         } else {
//             // Retrieve stored scroll position
//             const scrollTop = parseInt(document.body.dataset.scrollTop || '0');
//             const scrollLeft = parseInt(document.body.dataset.scrollLeft || '0');
            
//             // Re-enable scroll
//             document.body.style.overflow = '';
//             document.body.style.position = '';
//             document.body.style.top = '';
//             document.body.style.left = '';
//             document.body.style.width = '';
            
//             // Clean up dataset
//             delete document.body.dataset.scrollTop;
//             delete document.body.dataset.scrollLeft;
            
//             // Restore scroll position
//             window.scrollTo(scrollLeft, scrollTop);
//         }

//         // Cleanup function
//         return () => {
//             document.body.style.overflow = '';
//             document.body.style.position = '';
//             document.body.style.top = '';
//             document.body.style.left = '';
//             document.body.style.width = '';
//             delete document.body.dataset.scrollTop;
//             delete document.body.dataset.scrollLeft;
//         };
//     }, [isOpen]);

//     return (
//         <Modal isOpen={isOpen} toggle={toggle} className={"theme-modal modal-" + size} centered >
//             <ModalBody>
//                 <Row className="compare-modal">
//                     <Col lg="12">
//                         <div className={`modal-bg ${extracss}`}>
//                             {showtoggle && <Button type="button" className="btn-close" aria-label="Close" onClick={toggle}></Button>}
//                             <div className="offer-content">
//                                 {showtitle && <h5>{title}</h5>}
//                                 {children}
//                             </div>
//                             <div className='col-12 mt-5 d-flex justify-content-center'>
//                                 {(!showtoggle && showtoggleClose) && <button onClick={toggle} className='btn-solid btn-primary'>close</button>}
//                             </div>
//                         </div>
//                     </Col>
//                 </Row>
//             </ModalBody>
//         </Modal>
//     )
// };

// // Alternative approach: CSS class method
// export function ModalBaseCSS({ 
//     isOpen, 
//     toggle, 
//     children, 
//     title, 
//     showtitle = true, 
//     showtoggle = true, 
//     size = "md", 
//     extracss, 
//     showtoggleClose = true 
// }) {
//     useEffect(() => {
//         if (isOpen) {
//             document.body.classList.add('modal-open');
//         } else {
//             // document.body.classList.remove('modal-open');
//         }

//         return () => {
//             document.body.classList.remove('modal-open');
//         };
//     }, [isOpen]);

//     return (
//         <Modal isOpen={isOpen} toggle={toggle} className={"theme-modal modal-" + size} centered >
//             <ModalBody>
//                 <Row className="compare-modal">
//                     <Col lg="12">
//                         <div className={`modal-bg ${extracss}`}>
//                             {showtoggle && <Button type="button" className="btn-close" aria-label="Close" onClick={toggle}></Button>}
//                             <div className="offer-content">
//                                 {showtitle && <h5>{title}</h5>}
//                                 {children}
//                             </div>
//                             <div className='col-12 mt-5 d-flex justify-content-center'>
//                                 {(!showtoggle && showtoggleClose) && <button onClick={toggle} className='btn-solid btn-primary'>close</button>}
//                             </div>
//                         </div>
//                     </Col>
//                 </Row>
//             </ModalBody>
//         </Modal>
//     )
// };