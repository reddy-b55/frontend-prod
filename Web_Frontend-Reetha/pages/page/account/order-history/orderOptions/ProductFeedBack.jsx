import { useState, useContext } from 'react';
import ModalBase from "../../../../../components/common/Modals/ModalBase";
import { Button, Input, Alert } from "reactstrap";
import { AppContext } from "../../../../_app";
import ToastMessage from '../../../../../components/Notification/ToastMessage';
import axios from 'axios';

export default function ProductFeedBack({ orderObj, isOpen, toggle }) {
    const { userId } = useContext(AppContext);
    // Unified state for product feedback
    const [productFeedback, setProductFeedback] = useState({
        rating_on_aahaas: 3,
        rating_on_supplier: 3,
        rating_on_product: 3,
        review_remarks: '',
    });

    // Error state for validation
    const [error, setError] = useState('');

    // Function to update state
    const updateFeedback = (key, value) => {
        setProductFeedback(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleYes = async () => {
        // Validation check
        if (
            !productFeedback.rating_on_aahaas || 
            !productFeedback.rating_on_supplier || 
            !productFeedback.rating_on_product || 
            !productFeedback.review_remarks.trim()
        ) {
            ToastMessage({ status: "warning", message: "fill the fields!" });
            return;
        }
        setError('');

        // console.log(productFeedback);
        var dataArray = productFeedback;
        dataArray['checkout_id'] = orderObj?.orderItem?.checkout_id
        dataArray['user_id'] = userId
        dataArray["product_id"] = orderObj?.product_data?.data?.product_id
        dataArray["category_id"] = orderObj?.product_data?.category

        // console.log("send object", dataArray)

        await axios.post('send_overall_feedback', dataArray, {
                        xsrfHeaderName: "X-XSRF-TOKEN",
                        withCredentials: true,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'multipart/form-data; ',
                        },
                    }).then(res => {
                        // setLoginProcess(75);
                        if (res.data.status == 200) {
                            ToastMessage({ status: "success", message: "Feedback sent Successfully!" });
                            toggle();

                            setProductFeedback({
                                rating_on_aahaas: 3,
                                rating_on_supplier: 3,
                                rating_on_product: 3,
                                review_remarks: '',
                            });
                            // if (!feedbackExist) {
                            //     ToastMessage({ status: "success", message: "Feedback Sent Successfully!" });
                            // }
                            // else {
                            //     ToastMessage({ status: "success", message: "Feedback Updated Successfully" });
                            // }
                        }
                        else {
                            toggle();
                            ToastMessage({ status: "warning", message: "something went wrong, please try again" });
                        }
                    }).catch(error => {
                        toggle();
                        ToastMessage({ status: "warning", message: "something went wrong" });
                    });
        toggle();
    };

    // Star component for reusability
    const StarRating = ({ rating, setRating, label }) => {
        return (
            <div className="mb-4">
                <h5 className="mb-3">{label}</h5>
                <div className="d-flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <div 
                            key={star} 
                            onClick={() => setRating(star)}
                            style={{ 
                                cursor: 'pointer',
                                fontSize: '2rem',
                                color: star <= rating ? '#ffc107' : '#e4e5e9',
                                marginRight: '5px'
                            }}
                        >
                            ★
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'Customer Feedback'}>
            <div className="py-3 px-2">
                <div className="d-flex flex-column align-items-center">
                    {/* Validation Error Message */}
                    {error && <Alert color="danger">{error}</Alert>}

                    {/* Aahaas Rating */}
                    <StarRating 
                        rating={productFeedback.rating_on_aahaas} 
                        setRating={(value) => updateFeedback('rating_on_aahaas', value)}
                        label="Rating on Aahaas"
                    />
                    
                    {/* Supplier Rating */}
                    <StarRating 
                        rating={productFeedback.rating_on_supplier} 
                        setRating={(value) => updateFeedback('rating_on_supplier', value)}
                        label="Rate on Supplier"
                    />
                    
                    {/* Product Rating */}
                    <StarRating 
                        rating={productFeedback.rating_on_product} 
                        setRating={(value) => updateFeedback('rating_on_product', value)}
                        label="Rate on Product"
                    />
                    
                    {/* Review Text Area */}
                    <div className="w-100 mb-4">
                        <h5 className="mb-3">Review this Product</h5>
                        <Input
                            type="textarea"
                            placeholder="Write a Review"
                            value={productFeedback.review_remarks}
                            onChange={(e) => updateFeedback('review_remarks', e.target.value)}
                            style={{ minHeight: '100px', resize: 'none' }}
                        />
                    </div>
                    
                    {/* Send Feedback Button */}
                    <Button
                        color="dark"
                        block
                        onClick={handleYes}
                        className="mt-3 mb-2"
                        style={{ borderRadius: '8px' }}
                    >
                        Send Feedback
                    </Button>
                </div>
            </div>
        </ModalBase>
    );
}
