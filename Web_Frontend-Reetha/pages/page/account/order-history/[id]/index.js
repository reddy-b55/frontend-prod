import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Button, Badge, Form, FormGroup, Input, Label } from 'reactstrap';
import CommonLayout from '../../../../../components/shop/common-layout';
import Head from 'next/head';
import ErrorComponent from './error';
import ModalBase from "../../../../../components/common/Modals/ModalBase";
import ShareLiveLocation from "../orderOptions/ShareLiveLocation";
import ProductFeedBack from "../orderOptions/ProductFeedBack";
import SupportDoucmentUpload from "../orderOptions/SupportDocumentUpload";
import FlightInfo from '../flightOrderView';
import { AppContext } from '../../../../_app';
import CurrencyConverter from '../../../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import FeedbackIcon from '@mui/icons-material/Feedback';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PlaylistAddCheckCircleIcon from '@mui/icons-material/PlaylistAddCheckCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import HotelIcon from '@mui/icons-material/Hotel';
import SchoolIcon from '@mui/icons-material/School';
import getDiscountProductBaseByPrice from '../../../../product-details/common/GetDiscountProductBaseByPrice';
import TrackOrder from '../orderOptions/OrderTracking';
import CancelIcon from '@mui/icons-material/Cancel';
import UploadFile from '@mui/icons-material/UploadFile';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom Toast Component with better styling
const CustomToastContainer = () => (
  <ToastContainer
    position="top-right"
    autoClose={5000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="colored"
    toastClassName="custom-toast"
    progressClassName="custom-progress"
  />
);

const CancelOrderModal = ({ isOpen, toggle, orderData, onSubmit }) => {
  const [cancellationReasons, setCancellationReasons] = useState([
    "Change in travel plans or itinerary.",
    "Personal circumstances preventing travel or stay.",
    "Decision to stay elsewhere.",
    "Other"
  ]);
  
  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [selectedImage, setSelectedImage] = useState(null); // Changed to single image
  const [loading, setLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    reason: "",
    otherReason: "",
    remarks: ""
  });

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason);
    setErrors({...errors, reason: ""});
    if (reason !== "Other") {
      setOtherReason("");
    }
  };

  // Handle single image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const file = files[0];
      const image = {
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      };
      setSelectedImage(image);
    }
  };

  const removeImage = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    if (!selectedReason) {
      newErrors.reason = "Please select a reason";
    }
    
    if (selectedReason === "Other" && !otherReason.trim()) {
      newErrors.otherReason = "Please enter your reason";
    }
    
    if (!remarks.trim()) {
      newErrors.remarks = "Please add remarks";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      const finalReason = selectedReason === "Other" ? otherReason : selectedReason;
      
      formData.append("retcanreason", finalReason);
      formData.append("orderremarks", remarks);
      formData.append("orderid", orderData?.orderItem?.id);
      formData.append("mainid", orderData?.orderItem?.id);
      formData.append("type", "Cancel");
      formData.append("userid", orderData?.customerData?.customer_id);
      formData.append("role", "CUSTOMER");
      formData.append("cancelData", orderData?.product_data?.data?.product_title);
      
      if (selectedImage) {
        formData.append("formImage", selectedImage.file);
      }
      
      const response = await axios.post(
        "/create-new-order-cancellation",
        formData,
        {
          xsrfHeaderName: "X-XSRF-TOKEN",
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Cancellation response:", response.data);
      
      setLoading(false);

      if (response.data.status === 200) {
        toast.success("🎉 Cancellation Request Submitted! We'll process your request within 24 hours.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-success-toast'
        });
        toggle();
        if (onSubmit) onSubmit();
      } else if (response.data.status === 401) {
        toast.warning("⚠️ This order has already been cancelled.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-warning-toast'
        });
        toggle();
      } else if (response.data.status === 500) {
        toast.error("❌ Failed to cancel the order. Please try again.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-error-toast'
        });
      } else {
        toast.error("❌ " + (response.data.message || "Something went wrong. Please try again."), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-error-toast'
        });
      }
      
    } catch (error) {
      console.error("Cancellation error:", error);
      setLoading(false);
      toast.error("❌ Failed to submit cancellation request. Please try again or contact support.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-error-toast'
      });
    }
  };

  const resetForm = () => {
    setSelectedReason("");
    setOtherReason("");
    setRemarks("");
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
    setSelectedImage(null);
    setErrors({ reason: "", otherReason: "", remarks: "" });
  };

  const handleClose = () => {
    resetForm();
    toggle();
  };

  return (
    <ModalBase 
      isOpen={isOpen} 
      toggle={handleClose} 
      showtitle={true} 
      title="Cancel Your Order"
      size="lg"
    >
      <div className="cancel-order-modal">
        {/* Order Summary Header */}
        <div className="cancel-order-header">
          <h4>{orderData?.product_data?.data?.product_title}</h4>
          <div className="order-price">
            {CurrencyConverter(
              orderData?.orderItem?.currency,
              orderData?.orderItem?.total_amount,
              'USD'
            )}
          </div>
        </div>

        <hr className="divider" />

        {/* Reason for Cancellation */}
        <div className="form-section">
          <h5>Reason for Cancellation <span className="required-star">*</span></h5>
          <div className="reason-options">
            {cancellationReasons.map((reason, index) => (
              <div 
                key={index}
                className={`reason-option ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => handleReasonSelect(reason)}
              >
                <div className="reason-checkbox">
                  {selectedReason === reason && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
                <span>{reason}</span>
              </div>
            ))}
          </div>
          {errors.reason && <div className="error-message">{errors.reason}</div>}
        </div>

        {/* Other Reason Input */}
        {selectedReason === "Other" && (
          <div className="form-section">
            <h5>Other Reasons <span className="required-star">*</span></h5>
            <Input
              type="textarea"
              placeholder="Enter your reason"
              value={otherReason}
              onChange={(e) => {
                setOtherReason(e.target.value);
                setErrors({...errors, otherReason: ""});
              }}
              className="other-reason-input"
              rows="3"
            />
            {errors.otherReason && <div className="error-message">{errors.otherReason}</div>}
          </div>
        )}

        {/* Remarks */}
        <div className="form-section">
          <h5>Remarks <span className="required-star">*</span></h5>
          <Input
            type="textarea"
            placeholder="Add Your Remarks for Cancellation"
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              setErrors({...errors, remarks: ""});
            }}
            className="remarks-input"
            rows="4"
          />
          {errors.remarks && <div className="error-message">{errors.remarks}</div>}
        </div>

        {/* Upload Images - Single Image Only */}
        <div className="form-section">
          <h5>Upload Your Reference Image</h5>
          <div className="image-upload-section">
            {selectedImage ? (
              <div className="image-preview-container">
                <div className="image-preview">
                  <img src={selectedImage.preview} alt="Preview" />
                  <div className="image-info">
                    <span>{selectedImage.name}</span>
                    <Button 
                      color="link" 
                      className="remove-btn"
                      onClick={removeImage}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-images">No images selected</div>
            )}
            
            {!selectedImage && (
              <div className="upload-btn-wrapper">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Label for="image-upload" className="upload-btn">
                  <UploadFile fontSize="small" /> Upload Image
                </Label>
              </div>
            )}
            
            <div className="upload-note">
              Only 1 image allowed. Supported formats: JPG, PNG, GIF
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <Button 
            color="secondary" 
            onClick={handleClose}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Proceed to Cancellation'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .cancel-order-modal {
          padding: 20px;
        }
        
        .cancel-order-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .cancel-order-header h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        
        .order-price {
          font-size: 20px;
          font-weight: 700;
          color: #0d6efd;
        }
        
        .divider {
          border: none;
          border-top: 2px solid #e9ecef;
          margin: 25px 0;
        }
        
        .form-section {
          margin-bottom: 25px;
        }
        
        .form-section h5 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .required-star {
          color: #dc3545;
          margin-left: 4px;
        }
        
        .reason-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .reason-option {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reason-option:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
        }
        
        .reason-option.selected {
          background-color: #e7f1ff;
          border-color: #0d6efd;
        }
        
        .reason-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #adb5bd;
          border-radius: 4px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .reason-option.selected .reason-checkbox {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        .checkmark {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .reason-option span {
          font-size: 14px;
          color: #495057;
          flex: 1;
        }
        
        .other-reason-input,
        .remarks-input {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          resize: vertical;
        }
        
        .other-reason-input:focus,
        .remarks-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .image-upload-section {
          border: 2px dashed #dee2e6;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          background-color: #f8f9fa;
        }
        
        .no-images {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 20px;
        }
        
        .image-preview-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .image-preview {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
          background-color: white;
          max-width: 200px;
          width: 100%;
        }
        
        .image-preview img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        
        .image-info {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: center;
        }
        
        .image-info span {
          font-size: 12px;
          color: #495057;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 100%;
          text-align: center;
        }
        
        .remove-btn {
          padding: 0;
          font-size: 12px;
          color: #dc3545;
          text-decoration: none;
        }
        
        .remove-btn:hover {
          text-decoration: underline;
        }
        
        .upload-btn-wrapper {
          margin-bottom: 15px;
        }
        
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: #0d6efd;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        
        .upload-btn:hover {
          background-color: #0b5ed7;
          text-decoration: none;
        }
        
        .upload-note {
          font-size: 12px;
          color: #6c757d;
          margin-top: 10px;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        
        .cancel-btn {
          min-width: 100px;
        }
        
        .submit-btn {
          min-width: 180px;
          font-weight: 600;
        }
        
        @media (max-width: 576px) {
          .cancel-order-modal {
            padding: 15px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </ModalBase>
  );
};
// ============================
// REQUEST REFUND MODAL
// ============================
const RequestRefundModal = ({ isOpen, toggle, orderData, onSubmit }) => {
  // Define refund reasons by category (from mobile app reference)
  const reasonsByCategory = {
    EssentialsNonessentials: [
      'Product not as described.',
      'Damaged or defective items upon delivery.',
      'Incorrect item received.',
      'Late or non-delivery.',
      'Other'
    ],
    Lifestyle: [
      'Service not as described.',
      'Unsatisfactory service quality.',
      'Inability to use the service due to unforeseen circumstances.',
      'Other',
    ],
    Hotels: [
      'Cancellation due to unexpected events (illness, emergency).',
      'Hotel not meeting expected standards.',
      'Double booking or overbooking issues.',
      'Other',
    ],
    Flights: [
      'Flight cancellation by the airline.',
      'Change in travel plans due to unforeseen circumstances.',
      'Other',
    ],
    Education: [
      'Course cancellation by the education provider.',
      'Dissatisfaction with the course content or quality.',
      'Technical issues preventing access to educational materials.',
      'Other',
    ],
    Others: [ // Used when "Other" is selected
      'Change in travel plans.',
      'Travel restrictions or advisories.',
      'Personal emergency or illness preventing travel.',
      'Incorrect billing amount.',
      'Duplicate charges.',
      'Unauthorized transactions.',
    ],
  };

  // Determine category from main_category_id
  const getCategoryFromId = (id) => {
    switch(parseInt(id)) {
      case 1:
      case 2:
        return 'EssentialsNonessentials';
      case 3:
        return 'Lifestyle';
      case 4:
        return 'Hotels';
      case 5:
        return 'Education';
      case 6:
        return 'Flights';
      default:
        return 'Others';
    }
  };

  const currentCategory = getCategoryFromId(orderData?.product_data?.data?.main_category_id);
  const reasons = reasonsByCategory[currentCategory] || [];

  // State for form fields
  const [refundReasons, setRefundReasons] = useState({
    refundReason: "",
    refundOtherReason: "",
    remarks: ""
  });
  
  const [customerBankDetails, setCustomerBankDetails] = useState({
    bankName: "",
    branchName: "",
    bankAccountName: "",
    bankAccountNumber: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    refundReason: "",
    remarks: "",
    bankName: "",
    branchName: "",
    bankAccountNumber: "",
    bankAccountName: ""
  });

  // Check payment method for conditional bank fields
  const isOnlinePayment = orderData?.orderItem?.payment_method === "Online Payment";

  const handleReasonSelect = (reason) => {
    setRefundReasons({...refundReasons, refundReason: reason});
    setErrors({...errors, refundReason: ""});
  };

  const handleSubmit = async () => {
    const newErrors = {};
    
    // Validate required fields
    if (!refundReasons.refundReason) {
      newErrors.refundReason = "Please select a reason";
    }
    if (!refundReasons.remarks.trim()) {
      newErrors.remarks = "Please add remarks";
    }
    
    // Validate bank details if online payment
    if (isOnlinePayment) {
      if (!customerBankDetails.bankName.trim()) {
        newErrors.bankName = "Please select a bank name";
      }
      if (!customerBankDetails.branchName.trim()) {
        newErrors.branchName = "Please select a branch name";
      }
      if (!customerBankDetails.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = "Please enter account number";
      }
      if (!customerBankDetails.bankAccountName.trim()) {
        newErrors.bankAccountName = "Please enter account name";
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      const finalReason = refundReasons.refundReason === "Other" 
        ? (refundReasons.refundOtherReason || refundReasons.refundReason)
        : refundReasons.refundReason;
      
      // Prepare data matching mobile app structure
      const requestData = {
        customer_id: orderData?.customerData?.customer_id,
        checkout_id: orderData?.orderItem?.checkout_id,
        reason_for_refund: finalReason,
        other_reason: refundReasons.refundOtherReason,
        remarks: refundReasons.remarks,
        bank_name: customerBankDetails.bankName,
        branch_name: customerBankDetails.branchName,
        account_number: customerBankDetails.bankAccountNumber,
        account_name: customerBankDetails.bankAccountName
      };
      
      // Append all data to FormData
      Object.keys(requestData).forEach(key => {
        formData.append(key, requestData[key]);
      });
      
      const response = await axios.post(
        "/request_a_refund",
        formData,
        {
          xsrfHeaderName: "X-XSRF-TOKEN",
          withCredentials: true,
          headers: {
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      console.log("Refund request response:", response.data);
      
      setLoading(false);

      if (response.data.status === 200) {
        toast.success("🎉 Refund Request Submitted Successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-success-toast'
        });
        toggle();
        if (onSubmit) onSubmit();
      } else {
        toast.error("❌ " + (response.data.message || "Failed to submit refund request."), {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          className: 'custom-error-toast'
        });
      }
      
    } catch (error) {
      console.error("Refund request error:", error);
      setLoading(false);
      toast.error("❌ Failed to submit refund request. Please try again or contact support.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: 'custom-error-toast'
      });
    }
  };

  const resetForm = () => {
    setRefundReasons({
      refundReason: "",
      refundOtherReason: "",
      remarks: ""
    });
    setCustomerBankDetails({
      bankName: "",
      branchName: "",
      bankAccountName: "",
      bankAccountNumber: ""
    });
    setErrors({
      refundReason: "",
      remarks: "",
      bankName: "",
      branchName: "",
      bankAccountNumber: "",
      bankAccountName: ""
    });
  };

  const handleClose = () => {
    resetForm();
    toggle();
  };

  // Bank data (simplified - you might want to import from a JSON file)
  const bankData = [
    { id: 1, name: "Bank of America" },
    { id: 2, name: "Chase Bank" },
    { id: 3, name: "Wells Fargo" },
    // Add more banks as needed
  ];

  const bankBranches = {
    1: ["Manhattan Main", "Brooklyn Branch", "Queens Branch"],
    2: ["Downtown LA", "San Francisco Main", "San Diego Branch"],
    3: ["Chicago Downtown", "Chicago West", "Chicago North"],
  };

  return (
    <ModalBase 
      isOpen={isOpen} 
      toggle={handleClose} 
      showtitle={true} 
      title="Request a Refund"
      size="lg"
    >
      <div className="refund-request-modal">
        {/* Order Summary Header */}
        <div className="refund-header">
          <h4>{orderData?.product_data?.data?.product_title}</h4>
          <div className="order-price">
            {CurrencyConverter(
              orderData?.orderItem?.currency,
              orderData?.orderItem?.total_amount,
              'USD'
            )}
          </div>
        </div>

        <hr className="divider" />

        {/* Reason for Refund */}
        <div className="form-section">
          <h5>Reason for Refund <span className="required-star">*</span></h5>
          <div className="reason-options">
            {reasons.map((reason, index) => (
              <div 
                key={index}
                className={`reason-option ${refundReasons.refundReason === reason ? 'selected' : ''}`}
                onClick={() => handleReasonSelect(reason)}
              >
                <div className="reason-checkbox">
                  {refundReasons.refundReason === reason && (
                    <div className="checkmark">✓</div>
                  )}
                </div>
                <span>{reason}</span>
              </div>
            ))}
          </div>
          {errors.refundReason && <div className="error-message">{errors.refundReason}</div>}
        </div>

        {/* Other Reason Selection */}
        {refundReasons.refundReason === "Other" && (
          <div className="form-section">
            <h5>Select Specific Reason</h5>
            <Input
              type="select"
              value={refundReasons.refundOtherReason}
              onChange={(e) => setRefundReasons({...refundReasons, refundOtherReason: e.target.value})}
              className="other-reason-select"
            >
              <option value="">Select a reason</option>
              {reasonsByCategory["Others"].map((reason, index) => (
                <option key={index} value={reason}>{reason}</option>
              ))}
            </Input>
          </div>
        )}

        {/* Remarks */}
        <div className="form-section">
          <h5>Remarks <span className="required-star">*</span></h5>
          <Input
            type="textarea"
            placeholder="Add Your Remarks for Refund"
            value={refundReasons.remarks}
            onChange={(e) => {
              setRefundReasons({...refundReasons, remarks: e.target.value});
              setErrors({...errors, remarks: ""});
            }}
            className="remarks-input"
            rows="4"
          />
          {errors.remarks && <div className="error-message">{errors.remarks}</div>}
        </div>

        {/* Bank Details - Only for Online Payments */}
        {isOnlinePayment && (
          <div className="bank-details-section">
            <div className="form-section">
              <h5>Bank Details for Refund <span className="required-star">*</span></h5>
              <p className="bank-note">Please provide your bank details for processing the refund.</p>
            </div>

            <div className="form-section">
              <Label for="bankName">Bank Name</Label>
              <Input
                type="select"
                id="bankName"
                value={customerBankDetails.bankName}
                onChange={(e) => {
                  setCustomerBankDetails({...customerBankDetails, bankName: e.target.value});
                  setErrors({...errors, bankName: ""});
                }}
                className="bank-input"
              >
                <option value="">Select Bank</option>
                {bankData.map(bank => (
                  <option key={bank.id} value={bank.name}>{bank.name}</option>
                ))}
              </Input>
              {errors.bankName && <div className="error-message">{errors.bankName}</div>}
            </div>

            <div className="form-section">
              <Label for="branchName">Branch Name</Label>
              <Input
                type="select"
                id="branchName"
                value={customerBankDetails.branchName}
                onChange={(e) => {
                  setCustomerBankDetails({...customerBankDetails, branchName: e.target.value});
                  setErrors({...errors, branchName: ""});
                }}
                className="bank-input"
                disabled={!customerBankDetails.bankName}
              >
                <option value="">Select Branch</option>
                {customerBankDetails.bankName && 
                  bankBranches[bankData.find(b => b.name === customerBankDetails.bankName)?.id]?.map((branch, index) => (
                    <option key={index} value={branch}>{branch}</option>
                  ))
                }
              </Input>
              {errors.branchName && <div className="error-message">{errors.branchName}</div>}
            </div>

            <div className="form-section">
              <Label for="accountName">Account Holder Name</Label>
              <Input
                type="text"
                id="accountName"
                placeholder="Enter Account Holder Name"
                value={customerBankDetails.bankAccountName}
                onChange={(e) => {
                  setCustomerBankDetails({...customerBankDetails, bankAccountName: e.target.value});
                  setErrors({...errors, bankAccountName: ""});
                }}
                className="bank-input"
              />
              {errors.bankAccountName && <div className="error-message">{errors.bankAccountName}</div>}
            </div>

            <div className="form-section">
              <Label for="accountNumber">Account Number</Label>
              <Input
                type="text"
                id="accountNumber"
                placeholder="Enter Account Number"
                value={customerBankDetails.bankAccountNumber}
                onChange={(e) => {
                  setCustomerBankDetails({...customerBankDetails, bankAccountNumber: e.target.value});
                  setErrors({...errors, bankAccountNumber: ""});
                }}
                className="bank-input"
              />
              {errors.bankAccountNumber && <div className="error-message">{errors.bankAccountNumber}</div>}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <Button 
            color="secondary" 
            onClick={handleClose}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            color="primary" 
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Refund Request'}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .refund-request-modal {
          padding: 20px;
        }
        
        .refund-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .refund-header h4 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
        }
        
        .order-price {
          font-size: 20px;
          font-weight: 700;
          color: #0d6efd;
        }
        
        .divider {
          border: none;
          border-top: 2px solid #e9ecef;
          margin: 25px 0;
        }
        
        .form-section {
          margin-bottom: 25px;
        }
        
        .form-section h5 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
          display: flex;
          align-items: center;
        }
        
        .required-star {
          color: #dc3545;
          margin-left: 4px;
        }
        
        .reason-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .reason-option {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reason-option:hover {
          background-color: #f8f9fa;
          border-color: #adb5bd;
        }
        
        .reason-option.selected {
          background-color: #e7f1ff;
          border-color: #0d6efd;
        }
        
        .reason-checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #adb5bd;
          border-radius: 4px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .reason-option.selected .reason-checkbox {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        .checkmark {
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .reason-option span {
          font-size: 14px;
          color: #495057;
          flex: 1;
        }
        
        .other-reason-select,
        .remarks-input,
        .bank-input {
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 12px;
          font-size: 14px;
          resize: vertical;
        }
        
        .other-reason-select:focus,
        .remarks-input:focus,
        .bank-input:focus {
          border-color: #0d6efd;
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
        }
        
        .bank-details-section {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 25px;
        }
        
        .bank-note {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 20px;
        }
        
        .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
        }
        
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }
        
        .cancel-btn {
          min-width: 100px;
        }
        
        .submit-btn {
          min-width: 180px;
          font-weight: 600;
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        .submit-btn:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }
        
        @media (max-width: 576px) {
          .refund-request-modal {
            padding: 15px;
          }
          
          .modal-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
          }
        }
      `}</style>
    </ModalBase>
  );
};
const OrderDetails = () => {
  const router = useRouter();
  const { id, main_category_id } = router.query;
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderDetailsAll, setOrderDetailsAll] = useState(null);
  const [orderDetailsPrice, setOrderDetailsPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenFeedBack, setIsOpenFeedBack] = useState(false);
  const [isOpenDocumentUpload, setIsDocumentUpload] = useState(false);
  const [flightDetails, setFlightDetails] = useState(null);
  const { userStatus, baseCurrencyValue, baseLocation, baseUserId } = useContext(AppContext);
  const [discount, setDiscount] = useState({});
  const [orderTrackingModel, setOrderTrackingModel] = useState(false); 
  const [canCancelOrder, setCanCancelOrder] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelOrderModal, setCancelOrderModal] = useState(false);
  const [orderAlreadyCancelled, setOrderAlreadyCancelled] = useState(false);

  useEffect(() => {
    if (!id) return;

    if(main_category_id == 6) {
      setFlightDetails(JSON.parse(router.query.flightDetails));
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/get_order_details_by_id/${id}`);
        console.log("order details", response.data);
        setOrderDetailsAll(response?.data);
        setOrderDetails(response?.data);
        console.log("order 123 details price", response?.data?.product_data);
        console.log("order details price", JSON.parse(response?.data?.product_data?.data?.discountData || "{}"));
        setOrderDetailsPrice(response?.data?.product_data)
        setDiscount(JSON.parse(response?.data?.product_data?.data?.discountData || "{}"));
        
        // Check if order can be cancelled
        checkOrderCancellation(response.data);
      } catch (err) {
        console.log(err)
        setError("Failed to fetch order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);
const [refundModal, setRefundModal] = useState(false);

// Add this function to handle modal toggle:
const handleRefundModal = () => {
  setRefundModal(!refundModal);
};

// Add this function to handle successful refund submission:
const handleRefundSuccess = () => {
  // Refresh order details after successful refund request
  if (id) {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/get_order_details_by_id/${id}`);
        setOrderDetails(response?.data);
        // You might want to add specific logic here for refund requests
      } catch (err) {
        console.log(err);
      }
    };
    fetchOrderDetails();
  }
};
  // Function to check if order can be cancelled
  const checkOrderCancellation = (orderData) => {
    if (!orderData?.product_data?.data) return;

    const cancelByDays = orderData.product_data.data.cancelByDays;
    const serviceDate = orderData.product_data.data.service_date || 
                       orderData.product_data.data.course_inv_startdate || 
                       orderData.product_data.data.checkInDate;
    
    // Check if order is already cancelled
    const isOrderCancelled = orderData?.orderItem?.status === "Cancel" || 
                            orderData?.orderItem?.status === "Cancelled";
    
    if (isOrderCancelled) {
      setOrderAlreadyCancelled(true);
      setCanCancelOrder(false);
      setCancelMessage('This order has already been cancelled. we will be processing your request shortly to initiate the refund process. Thank you for your Understanding.');
      return;
    }
    
    if (!serviceDate || cancelByDays === undefined) {
      setCanCancelOrder(false);
      setCancelMessage('This order cannot be cancelled or refunded becuase the cancellation deadline has passed. Thank you for your understanding.');
      return;
    }

    // Calculate deadline date
    const serviceDateTime = new Date(serviceDate);
    const deadlineDate = new Date(serviceDateTime);
    deadlineDate.setDate(deadlineDate.getDate() - cancelByDays);
    
    const currentDate = new Date();
    
    // Check if current date is before deadline
    if (currentDate <= deadlineDate) {
      setCanCancelOrder(true);
      setCancelMessage('');
    } else {
      setCanCancelOrder(false);
      setCancelMessage('This order cannot be cancelled or refunded because the cancellation deadline has passed. Thank you for your understanding.');
    }
  };

  // Scroll prevention for all modals
  useEffect(() => {
    const isAnyModalOpen = isOpen || isOpenFeedBack || isOpenDocumentUpload || orderTrackingModel || cancelOrderModal;

    if (isAnyModalOpen) {
      // Store current scroll position and prevent scrolling
      const scrollY = window.scrollY;
      document.body.setAttribute('data-scroll-y', scrollY.toString());
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position and enable scrolling
      const scrollY = document.body.getAttribute('data-scroll-y');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY));
        document.body.removeAttribute('data-scroll-y');
      }
    }
  }, [isOpen, isOpenFeedBack, isOpenDocumentUpload, orderTrackingModel, cancelOrderModal]);

  const handleOrderTrackingModel = () => {
    setOrderTrackingModel(!orderTrackingModel);
  }

  const handleModelOpen = () => {
    setIsOpen(!isOpen);
  }

  const handleModelOpenFeedback = () => {
    setIsOpenFeedBack(!isOpenFeedBack);
  }

  const handleModelDocumentUpload = () => {
    setIsDocumentUpload(!isOpenDocumentUpload);
  }

  const handleCancelOrderModal = () => {
    setCancelOrderModal(!cancelOrderModal);
  }

  const handleCancelOrderSuccess = () => {
    // Refresh order details after successful cancellation
    if (id) {
      const fetchOrderDetails = async () => {
        try {
          const response = await axios.get(`/get_order_details_by_id/${id}`);
          setOrderDetails(response?.data);
          checkOrderCancellation(response.data);
        } catch (err) {
          console.log(err);
        }
      };
      fetchOrderDetails();
    }
  }

  const handleNavigateMap = (longitude, latitude) => {
    window.open(
      `https://www.google.com/maps/dir/${baseLocation.latitude}, ${baseLocation.longtitude} / ${latitude}, ${longitude}`,
      "_blank"
    );
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'cancel':
        return 'danger';
      case 'processing':
        return 'info';
      default:
        return 'primary';
    }
  };

  if (!router.isReady || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) return <ErrorComponent message={error} />;
  if (!orderDetails && main_category_id != 6) return <div className="error">Order not found</div>;

  return (
    <>
      <Head>
        <title>Aahaas - Order Details</title>
      </Head>

      <CommonLayout parent="order-history" title="Order Details">
        {/* Custom Toast Container */}
        <CustomToastContainer />
        
        <ShareLiveLocation isOpen={isOpen} toggle={()=>handleModelOpen()} orderObj={orderDetails} />
        <ProductFeedBack isOpen={isOpenFeedBack} toggle={()=>handleModelOpenFeedback()} orderObj={orderDetails} />
        <SupportDoucmentUpload isOpen={isOpenDocumentUpload} toggle={()=>handleModelDocumentUpload()} orderObj={orderDetails} />
        <ModalBase isOpen={orderTrackingModel} toggle={handleOrderTrackingModel} showtitle={true} title={'Order Tracking'} size="xl">
          <TrackOrder orderId={orderDetails?.orderItem?.id} orderData={orderDetails?.orderItem} currency={orderDetails?.orderItem?.currency} checkoutId={orderDetails?.orderItem?.checkout_id} />
        </ModalBase>
        
        {/* Cancel Order Modal */}
        <CancelOrderModal 
          isOpen={cancelOrderModal} 
          toggle={handleCancelOrderModal}
          orderData={orderDetails}
          onSubmit={handleCancelOrderSuccess}
        />
        <RequestRefundModal 
  isOpen={refundModal} 
  toggle={handleRefundModal}
  orderData={orderDetails}
  onSubmit={handleRefundSuccess}
/>

        <div className="back-button-container">
          <Button color="light" className="back-btn" onClick={() => router.back()}>
            <ArrowBackIcon fontSize="small" /> Back to Orders
          </Button>
        </div>

        <section className="order-details">
          <Container fluid>
            {/* Order Header */}
            <div className="order-header">
              <div className="order-id">
                <h2>Order #{orderDetails?.orderItem?.checkout_id}</h2>
              </div>
              <div className="order-date">
                <div><CalendarTodayIcon fontSize="small" /> {orderDetails?.relatedOrder?.checkout_date?.split(' ')[0]}</div>
                <div><AccessTimeIcon fontSize="small" /> {orderDetails?.relatedOrder?.checkout_date?.split(' ')[1]}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {main_category_id == 3 && (
                <Button color="primary" className="action-btn" onClick={() => handleModelOpen()}>
                  <ShareLocationIcon fontSize="small" /> Share live location
                </Button>
              )}
              <Button color="info" className="action-btn" onClick={() => handleModelOpenFeedback()}>
                <FeedbackIcon fontSize="small" /> Give feedback
              </Button>
              <Button color="light" className="action-btn" onClick={() => handleModelDocumentUpload()}>
                <UploadFileIcon fontSize="small" /> Upload support documents
              </Button>
              <Button color="warning" className="action-btn" onClick={() => handleOrderTrackingModel()}>
                <PlaylistAddCheckCircleIcon fontSize="small" /> Track Order
              </Button>
              
              {/* Cancel Order Button - Only show if cancellation is allowed AND order is not already cancelled */}
              {canCancelOrder && !orderAlreadyCancelled && (
                <Button color="danger" className="action-btn" onClick={handleCancelOrderModal}>
                  <CancelIcon fontSize="small" /> Cancel Order
                </Button>
              )}
            </div>

            {/* Cancel Message - Show when cancellation is not allowed OR order is already cancelled */}
            {(!canCancelOrder || orderAlreadyCancelled) && cancelMessage && (
              <div className="cancel-message-container">
                <div className="cancel-message">
                  <CancelIcon fontSize="small" className="cancel-icon" />
                  <span>{cancelMessage}</span>
                </div>
              </div>
            )}
<Button color="warning" className="action-btn" onClick={handleRefundModal}>
  <PlaylistAddCheckCircleIcon fontSize="small" /> Request Refund
</Button>

            {/* Main Content */}
            <Row className="order-content">
              {/* Left Section */}
              <Col lg={8} md={12}>
                {/* Product/Service Details */}
                <Card className="detail-card mb-4">
                  <div className="card-header">
                    <h3 style={{color:"white"}}>{main_category_id == 6 ? 'Flight Details' : 'Product/Service Details'}</h3>
                  </div>
                  <div className="card-body">
                    {main_category_id == 6 ? (
                      <FlightInfo orderData={flightDetails} />
                    ) : (
                      <div className="product-info">
                        {orderDetails?.product_data?.data?.product_image && (
                          <div className="product-image-container">
                            <img 
                              src={orderDetails.product_data.data.product_image} 
                              alt="Product" 
                              className="product-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="product-details">
                          <h4>{orderDetails?.product_data?.data?.product_title}</h4>
                          <p className="company-name">{orderDetails?.product_data?.data?.company_name}</p>
                          
                          {/* Display cancellation info */}
                          {orderDetails?.product_data?.data?.cancelByDays && (
                            <div className="cancellation-info">
                              <div className="cancellation-details">
                                <div className="cancellation-label">
                                  <CalendarTodayIcon fontSize="small" /> Cancellation Deadline:
                                </div>
                                <div className="cancellation-value">
                                  {(() => {
                                    const serviceDate = orderDetails?.product_data?.data?.service_date || 
                                                       orderDetails?.product_data?.data?.course_inv_startdate || 
                                                       orderDetails?.product_data?.data?.checkInDate;
                                    if (!serviceDate) return 'N/A';
                                    
                                    const serviceDateTime = new Date(serviceDate);
                                    const deadlineDate = new Date(serviceDateTime);
                                    deadlineDate.setDate(deadlineDate.getDate() - orderDetails.product_data.data.cancelByDays);
                                    
                                    return deadlineDate.toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    });
                                  })()}
                                </div>
                              </div>
                              <div className="cancellation-note">
                                <small>
                                  Cancellation allowed up to {orderDetails.product_data.data.cancelByDays} day(s) before the service date.
                                </small>
                              </div>
                            </div>
                          )}
                          
                          {main_category_id == 1 || main_category_id == 2 ? (
                            <div className="product-specifics">
                              <div><InventoryIcon fontSize="small" /> Quantity: {orderDetails?.product_data?.data?.quantity || 1}</div>
                              {orderDetails?.product_data?.variant_type1 && (
                                <div>Features: {orderDetails?.product_data?.variant_type1}</div>
                              )}
                            </div>
                          ) : main_category_id == 3 ? (
                            <div className="service-specifics">
                              <div><CalendarTodayIcon fontSize="small" /> Service Date: {orderDetails?.product_data?.data?.service_date}</div>
                              <div><AccessTimeIcon fontSize="small" /> Service Time: {orderDetails?.product_data?.data?.pickupTime}</div>
                              <div><PersonIcon fontSize="small" /> Adults: {orderDetails?.product_data?.data?.adultCount}, <ChildCareIcon fontSize="small" /> Children: {orderDetails?.product_data?.data?.childCount}</div>
                              <div 
                                className="location-link"
                                onClick={()=>handleNavigateMap(orderDetails?.product_data?.data?.longitude, orderDetails?.product_data?.data?.latitude)}
                              >
                                <LocationOnIcon fontSize="small" /> {orderDetails?.product_data?.data?.location}
                              </div>
                            </div>
                          ) : main_category_id == 4 ? (
                            <div className="hotel-specifics">
                              <div><CalendarTodayIcon fontSize="small" /> Check-in: {orderDetails?.product_data?.data?.checkInDate}</div>
                              <div><CalendarTodayIcon fontSize="small" /> Check-out: {orderDetails?.product_data?.data?.checkOutDate}</div>
                              <div><HotelIcon fontSize="small" /> Nights: {orderDetails?.product_data?.data?.NoOfNights}</div>
                              <div><PersonIcon fontSize="small" /> Adults: {orderDetails?.product_data?.data?.NoOfAdults}, <ChildCareIcon fontSize="small" /> Children: {orderDetails?.product_data?.data?.NoOfChild}</div>
                            </div>
                          ) : main_category_id == 5 ? (
                            <div className="education-specifics">
                              <div><CalendarTodayIcon fontSize="small" /> Start Date: {orderDetails?.product_data?.data?.course_inv_startdate}</div>
                              <div><CalendarTodayIcon fontSize="small" /> End Date: {orderDetails?.product_data?.data?.course_inv_enddate}</div>
                              <div><AccessTimeIcon fontSize="small" /> Start Time: {orderDetails?.product_data?.data?.course_startime}</div>
                              <div><SchoolIcon fontSize="small" /> Student Type: {orderDetails?.product_data?.data?.student_type}</div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Delivery Details - Only show for products */}
                {(main_category_id == 1 || main_category_id == 2) && (
                  <Card className="detail-card mb-4">
                    <div className="card-header">
                      <h3 style={{color:"white"}}>Delivery Information</h3>
                    </div>
                    <div className="card-body">
                      <div className="delivery-details">
                        <div className="detail-row">
                          <div className="detail-label"><LocationOnIcon fontSize="small" /> Address</div>
                          <div className="detail-value">{orderDetails?.orderItem?.delivery_address}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label"><CalendarTodayIcon fontSize="small" /> Delivery Date</div>
                          <div className="detail-value">{orderDetails?.orderItem?.delivery_date}</div>
                        </div>
                        <div className="detail-row">
                          <div className="detail-label"><LocalShippingIcon fontSize="small" /> Status</div>
                          <div className="detail-value">
                            <Badge color={getStatusColor(orderDetails?.orderItem?.delivery_status)}>
                              {orderDetails?.orderItem?.delivery_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </Col>

              {/* Right Section */}
              <Col lg={4} md={12}>
                {/* Order Summary */}
                <Card className="detail-card mb-4">
                  <div className="card-header">
                    <h3 style={{color:"white"}}>Order Summary</h3>
                  </div>
                  <div className="card-body">
                    <div className="summary-details">
                      <div className="detail-row">
                        <div className="detail-label">Order Total</div>
                        <div className="detail-value price">
                          {discount?.amount && discount?.amount !== "0.00" ? (
                            <>
                              { CurrencyConverter(orderDetailsPrice?.data?.currency,getDiscountProductBaseByPrice(
                                orderDetailsPrice?.data?.paid_amount === "0.00" 
                                  ? orderDetailsPrice?.data?.total_amount 
                                  : orderDetailsPrice?.data?.paid_amount,
                                discount,
                                orderDetailsPrice?.data?.currency
                              )["discountedAmount"], baseCurrencyValue)}
                            </>
                          ) : (
                            <>
                              {CurrencyConverter(
                                orderDetailsPrice?.data?.currency, 
                                orderDetailsPrice?.data?.paid_amount === "0.00" 
                                  ? orderDetailsPrice?.data?.total_amount 
                                  : orderDetailsPrice?.data?.paid_amount, 
                                baseCurrencyValue
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-label">Booking Status</div>
                        <div className="detail-value">
                          <Badge color={getStatusColor(orderDetails?.orderItem?.status)}>
                            {orderDetails?.orderItem?.status ===  "Cancel" ? "Cancelled" : orderDetails?.orderItem?.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Customer Information */}
                <Card className="detail-card">
                  <div className="card-header">
                    <h3 style={{color:"white"}}>Customer Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="customer-details">
                      <div className="detail-row customer-row">
                        <div className="detail-label"><PersonIcon fontSize="small" /> Name</div>
                        <div className="detail-value">{orderDetails?.customerData?.customer_fname}</div>
                      </div>
                      <div className="detail-row customer-row">
                        <div className="detail-label"><EmailIcon fontSize="small" /> Email</div>
                        <div className="detail-value">{orderDetails?.customerData?.customer_email}</div>
                      </div>
                      <div className="detail-row customer-row">
                        <div className="detail-label"><PhoneIcon fontSize="small" /> Phone</div>
                        <div className="detail-value">{orderDetails?.customerData?.contact_number}</div>
                      </div>
                      <div className="detail-row customer-row">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <Badge color={getStatusColor(orderDetails?.customerData?.customer_status)}>
                            {orderDetails?.customerData?.customer_status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
      </CommonLayout>

      <style jsx global>{`
        /* Custom Toast Styles */
        .custom-success-toast {
          background-color: #068925ff !important;
          color: #ffffffff !important;
          border: 1px solid #c3e6cb !important;
        }
        
        .custom-warning-toast {
          background-color: #fff3cd !important;
          color: #856404 !important;
          border: 1px solid #ffeaa7 !important;
        }
        
        .custom-error-toast {
          background-color: #f8d7da !important;
          color: #721c24 !important;
          border: 1px solid #f5c6cb !important;
        }
        
        .Toastify__toast-body {
          font-weight: 500 !important;
        }
      `}</style>

      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 60vh;
          font-size: 1.2rem;
          color: #333;
        }
        
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border-left-color: #007bff;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .order-details {
          padding: 30px 0;
          background-color: #f8f9fa;
        }

        .back-button-container {
          padding: 20px 30px 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
          border-radius: 4px;
          box-shadow: none;
          padding: 8px 16px;
          transition: all 0.2s ease;
        }

        .back-btn:hover {
          background-color: #e2e6ea;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 0 15px;
        }

        .order-id h2 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .status-badge {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 30px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .order-date {
          text-align: right;
          color: #6c757d;
          font-size: 14px;
        }

        .order-date div {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }

        .action-buttons {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          padding: 0 15px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          border-radius: 4px;
          padding: 8px 16px;
          transition: all 0.2s ease;
        }

        /* Cancel Message Container - WHITE BACKGROUND */
        .cancel-message-container {
          margin: 0 15px 24px;
        }

        .cancel-message {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #ffffff !important; /* WHITE BACKGROUND */
          color: #721c24 !important; /* DARK RED TEXT FOR VISIBILITY */
          border: 1px solid #f5c6cb;
          border-radius: 8px;
          padding: 16px 20px;
          font-size: 14px;
           font-weight: 600 !important; 
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .cancel-icon {
          color: #dc3545;
          flex-shrink: 0;
        }

        .detail-card {
          border: none;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
          background-color: #fff;
        }

        .card-header {
          background: linear-gradient(135deg, #ff4d4d);
          color: white;
          padding: 16px 20px;
          border-bottom: none;
        }

        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .card-body {
          padding: 24px;
        }

        /* Improved Product Info Section */
        .product-info {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .product-image-container {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background-color: #f8f9fa;
          padding: 8px;
        }

        .product-image {
          width: 100%;
          height: auto;
          max-height: 300px;
          object-fit: contain;
          border-radius: 8px;
          transition: transform 0.3s ease;
          cursor: pointer;
        }

        .product-image:hover {
          transform: scale(1.02);
        }

        .product-details {
          flex: 1;
        }

        .product-details h4 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
          color: #333;
          line-height: 1.4;
        }

        .company-name {
          color: #6c757d;
          font-size: 16px;
          margin-bottom: 20px;
          font-weight: 500;
        }

        /* Cancellation Info Styles */
        .cancellation-info {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
        }

        .cancellation-details {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .cancellation-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #495057;
        }

        .cancellation-value {
          font-weight: 600;
          color: #dc3545;
        }

        .cancellation-note {
          color: #6c757d;
          font-size: 13px;
          padding-left: 28px;
        }

        .product-specifics, 
        .service-specifics, 
        .hotel-specifics, 
        .education-specifics {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-top: 16px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #007bff;
        }

        .product-specifics div, 
        .service-specifics div, 
        .hotel-specifics div, 
        .education-specifics div {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: #495057;
          font-weight: 500;
          padding: 8px 0;
        }

        .location-link {
          color: #0d6efd !important;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s ease;
          padding: 8px 12px;
          border-radius: 6px;
          background-color: rgba(13, 110, 253, 0.1);
        }

        .location-link:hover {
          color: #0a58ca !important;
          background-color: rgba(13, 110, 253, 0.2);
          transform: translateX(4px);
        }

        /* Desktop layout - side by side */
        @media (min-width: 768px) {
          .product-info {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 32px;
            align-items: start;
          }

          .product-image-container {
            margin: 0;
          }

          .product-specifics, 
          .service-specifics, 
          .hotel-specifics, 
          .education-specifics {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* Large desktop - bigger image */
        @media (min-width: 1200px) {
          .product-info {
            grid-template-columns: 350px 1fr;
          }

          .product-image {
            max-height: 350px;
          }
        }

        .delivery-details, 
        .summary-details, 
        .customer-details {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }

        .detail-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .detail-label {
          font-size: 14px;
          color: #6c757d;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-value {
          font-size: 15px;
          font-weight: 500;
          color: #212529;
        }

        .detail-value.price {
          font-size: 18px;
          font-weight: 600;
          color: #0d6efd;
        }

        /* Customer Information specific styling */
        .customer-row {
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 8px !important;
          padding-bottom: 16px !important;
        }

        .customer-row .detail-label {
          margin-top: 0 !important;
          min-width: auto !important;
          font-weight: 600;
          color: #495057 !important;
        }

        .customer-row .detail-value {
          text-align: left !important;
          max-width: 100% !important;
          padding-left: 24px !important;
          word-break: break-word;
          overflow-wrap: break-word;
        }

        /* Mobile responsive */
        @media (max-width: 992px) {
          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .order-date {
            text-align: left;
          }
        }

        @media (max-width: 576px) {
          .product-image-container {
            max-width: 100%;
          }

          .product-details h4 {
            font-size: 18px;
          }

          .company-name {
            font-size: 14px;
          }

          .product-specifics div, 
          .service-specifics div, 
          .hotel-specifics div, 
          .education-specifics div {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default OrderDetails;