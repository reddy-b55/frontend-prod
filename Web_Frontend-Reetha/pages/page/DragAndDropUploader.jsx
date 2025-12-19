import axios from "axios";
import React, { useEffect, useState } from "react";
import ToastMessage from '../../components/Notification/ToastMessage';

const DragAndDropUploader = ({ toggle }) => {

    const [image, setImage] = useState(null);
    const [error, setError] = useState("");

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setImage(URL.createObjectURL(event.target.files[0]));
    };

    const handleFileSelect = (event) => {
        setImage(URL.createObjectURL(event.target.files[0]));
    };

    const handleSearch = async () => {
        const imageSearch = new FormData();
        console.log("image", image);
        if(image == null){
           ToastMessage({ status: "warning", message: "Please select an image first." });
            return;
        }
        imageSearch.append("image", image);
        await axios.post('fetch_voice_keywords_by_image/All', imageSearch,
            {
              xsrfHeaderName: "X-XSRF-TOKEN", withCredentials: true, headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data; ', },
            }
        ).then((response) => {
            console.log("response image search",response);
            if (response.data.status == 200) {
                const dataset = {
                    essData: response?.data?.essData,
                    nessData: response?.data?.nessData,
                    lsData: response?.data?.lsData,
                    hotelsData: response?.data?.hotelsData,
                    eduData: response?.data?.eduData
                }
                toggle(dataset);
            } else {
                toggle(null);
                ToastMessage({ status: "success", message: "Try with other images.." });
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    return (
        <div className="d-flex flex-column align-items-center">
            <div onDragOver={handleDragOver} onDrop={handleDrop} style={{ border: "2px dashed #ccc", borderRadius: "10px", width: "350px", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", margin: "20px auto", backgroundColor: "#f9f9f9", padding: '20px' }}            >
                {image ? (
                    <img src={image} alt="Preview" style={{ maxWidth: "100%", maxHeight: "100%", margin: 'auto' }} />
                ) : (
                    <p>Drag and drop an image here, or click to upload</p>
                )}
            </div>
            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: "block", margin: "0 auto" }} />
            {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
            <button className="btn btn-solid mx-auto py-1 px-3 mt-3" onClick={handleSearch} style={{ fontSize: 12 }}>Search</button>
        </div>
    );

};

export default DragAndDropUploader;
