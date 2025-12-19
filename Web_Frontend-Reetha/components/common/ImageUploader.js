// import PropTypes from 'prop-types';
// import { FormGroup, Input } from 'reactstrap';
// import React, { useEffect, useState } from 'react';

// import EditIcon from '@mui/icons-material/Edit';
// import CameraAltIcon from '@mui/icons-material/CameraAlt';

// const ImageUploader = ({ handleImageUpload, imageUrl }) => {

//     const [image, setImage] = useState('/assets/images/NavbarImages/defaultImage.png');

//     const styles = {
//         container: {
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//         },
//         previewImage: {
//             minWidth: '300px',
//             maxWidth: '300px',
//             minHeight: '300px',
//             maxHeight: '300px',
//             objectFit: 'cover',
//             borderRadius: '50%',
//         },
//         uploadButton: {
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: '10px 10px',
//             cursor: 'pointer',
//             marginTop: '10px',
//             fontSize: '11px'
//         },
//         hiddenInput: {
//             display: 'none',
//         },
//         icon: {
//             marginRight: '8px',
//         }
//     };

//     const handleImageChange = (e) => {
//         if (e.target.files && e.target.files[0]) {
//             setImage(URL.createObjectURL(e.target.files[0]));
//             handleImageUpload(e.target.files[0]);
//         }
//     };

//     useEffect(() => {
//         if (imageUrl) {
//             setImage(imageUrl);
//         }
//     }, [imageUrl])

//     return (
//         <div style={styles.container}>
//             <img htmlFor="imageUpload" style={styles.previewImage} src={image} className='profileImage'></img>
//             <label htmlFor="imageUpload" style={styles.uploadButton} className='d-block d-lg-none upload-image-button'><EditIcon /> </label>
//             <FormGroup>
//                 <div className='d-flex align-items-center gap-1 mt-4'>
//                     <label htmlFor="imageUpload" style={styles.uploadButton} className='btn btn-sm btn-solid d-none d-lg-block'>Upload Image</label>
//                 </div>
//                 <Input type="file" id="imageUpload" onChange={handleImageChange} accept="image/*" style={styles.hiddenInput} />
//             </FormGroup>
//         </div>
//     );
// };

// ImageUploader.propTypes = {
//     handleImageUpload: PropTypes.func.isRequired,
// };

// export default ImageUploader;


import PropTypes from 'prop-types';
import { FormGroup, Input } from 'reactstrap';
import React, { useEffect, useState } from 'react';
 
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
 
const ImageUploader = ({ handleImageUpload, imageUrl }) => {
    console.log('imageUrl', imageUrl);
    const [image, setImage] = useState('/assets/images/NavbarImages/defaultImage.png');
 
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        },
        previewImage: {
            minWidth: '200px',
            maxWidth: '200px',
            minHeight: '200px',
            maxHeight: '200px',
            objectFit: 'cover',
            borderRadius: '50%',
        },
        // previewImage: {
        //     minWidth: '300px',
        //     maxWidth: '300px',
        //     minHeight: '300px',
        //     maxHeight: '300px',
        //     objectFit: 'cover',
        //     borderRadius: '50%',
        // },
        uploadButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 10px',
            cursor: 'pointer',
            marginTop: '10px',
            fontSize: '11px'
        },
        hiddenInput: {
            display: 'none',
        },
        icon: {
            marginRight: '8px',
        }
    };
 
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(URL.createObjectURL(e.target.files[0]));
            handleImageUpload(e.target.files[0]);
        }
    };
 
    useEffect(() => {
        if (imageUrl) {
            setImage(imageUrl);
        }
    }, [imageUrl])
 
    return (
        <div className="image-uploader-container">
        <div className="image-wrapper">
            <img src={image} className="profileImage" alt="Profile" />
            <label htmlFor="imageUpload" className="upload-overlay">
                <EditIcon />
            </label>
        </div>
        <Input type="file" id="imageUpload" onChange={handleImageChange} accept="image/*" className="hidden-input d-none" />
 
        <style jsx>{`
            .image-uploader-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
            }
 
            .image-wrapper {
                position: relative;
                display: inline-block;
                width: 200px;
                height: 200px;
                border-radius: 50%;
                overflow: hidden;
            }
 
            .profileImage {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                border: 5px solid white;
            }
 
            .upload-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
                cursor: pointer;
                color: white;
                font-size: 24px;
            }
 
            .image-wrapper:hover .upload-overlay {
                opacity: 1;
            }
 
            .hidden-input {
                display: none;
            }
        `}</style>
    </div>
    );
};
 
ImageUploader.propTypes = {
    handleImageUpload: PropTypes.func.isRequired,
};
 
export default ImageUploader;