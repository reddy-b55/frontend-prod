import { useState, useContext } from 'react';
import ModalBase from "../../../../../components/common/Modals/ModalBase";
import { Button, Input, Alert } from "reactstrap";
import { AppContext } from "../../../../_app";
import ToastMessage from '../../../../../components/Notification/ToastMessage';
import axios from 'axios';

export default function SupportDocumentUpload({ orderObj, isOpen, toggle }) {
    const { userId } = useContext(AppContext);
    console.log("obg", orderObj)
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        
        setError('');
        if (documents.length + selectedFiles.length > 5) {
            setError('You can upload a maximum of 5 documents.');
            return;
        }
        const invalidFiles = selectedFiles.filter(file => {
            const fileType = file.type;
            return !(fileType.includes('pdf') || fileType.includes('image'));
        });
        
        if (invalidFiles.length > 0) {
            setError('Only PDF or Image files are accepted.');
            return;
        }
        setDocuments([...documents, ...selectedFiles]);
    };
    
    const removeDocument = (index) => {
        const updatedDocuments = [...documents];
        updatedDocuments.splice(index, 1);
        setDocuments(updatedDocuments);
        
        if (error && updatedDocuments.length < 5) {
            setError('');
        }
    };
    
    const submitDocuments = async () => {
        if (documents.length === 0) {
            setError('Please upload at least one document.');
            return;
        }
        
        setIsLoading(true);
        
        try {
            const formData = new FormData();
            documents.forEach((doc, index) => {
                formData.append(`file${index}`, doc);
            });
            
            formData.append("fileLength_new", documents.length);
            formData.append("fileLength_old", 0);
            formData.append('orderId', orderObj?.orderItem?.checkout_id || '');
            formData.append('user_id', userId);


//             const formDataObject = Object.fromEntries(formData.entries());
// console.log("formData", formDataObject);
           
            const response = await axios.post(`order_more_info_data_save`, formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });
            console.log("response", response)
            if (response.data.status) {
                setSuccessMessage('Documents uploaded successfully!');
                ToastMessage({ status: "success", message: "Doucment submited successfully" });
                setDocuments([]);
                setSuccessMessage('')
                setTimeout(() => {
                    toggle();
                }, 2000);
            }
        } catch (error) {
            setError('Failed to upload documents. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'Upload Documents'}>
            <div className="py-3 px-2">
                <div className="d-flex flex-column align-items-center">
                    {/* Information text */}
                    <div className="text-center mb-4">
                        <h5>Please provide the necessary supporting documents for verification.</h5>
                        <p className="text-muted small">Please upload a valid document (PDF or Image)</p>
                        <p className="text-muted small">Maximum 5 documents allowed</p>
                    </div>
                    
                    {/* Error message */}
                    {error && (
                        <Alert color="danger" className="w-100 mb-3">
                            {error}
                        </Alert>
                    )}
                    
                    {/* Success message */}
                    {successMessage && (
                        <Alert color="success" className="w-100 mb-3">
                            {successMessage}
                        </Alert>
                    )}
                    
                    {/* Document list */}
                    {documents.length > 0 && (
                        <div className="w-100 mb-3">
                            <p className="fw-bold">Selected Documents ({documents.length}/5):</p>
                            <ul className="list-group">
                                {documents.map((doc, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span className="text-truncate" style={{ maxWidth: '70%' }}>{doc.name}</span>
                                        <Button 
                                            color="danger" 
                                            size="sm" 
                                            onClick={() => removeDocument(index)}
                                            disabled={isLoading}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {/* Upload button */}
                    <div className="w-100 mb-3">
                        <div className="d-grid">
                            <Button 
                                color="primary" 
                                className="position-relative"
                                disabled={documents.length >= 5 || isLoading}
                            >
                                <Input 
                                    type="file" 
                                    className="position-absolute top-0 left-0 opacity-0 w-100 h-100" 
                                    onChange={handleFileChange}
                                    multiple
                                    disabled={documents.length >= 5 || isLoading}
                                    accept=".pdf,image/*"
                                />
                                <i className="bi bi-upload me-2"></i>
                                Add Documents
                            </Button>
                        </div>
                    </div>
                    
                    {/* Submit button */}
                    <div className="w-100">
                        <div className="d-grid">
                            <Button 
                                color="success" 
                                onClick={submitDocuments}
                                disabled={documents.length === 0 || isLoading}
                            >
                                {isLoading ? 'Uploading...' : 'Submit Documents'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </ModalBase>
    );
}