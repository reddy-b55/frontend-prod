import { useRouter } from 'next/router';
import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import ModalBase from "../../../../../components/common/Modals/ModalBase";
import CommonLayout from './../../../../../components/shop/common-layout';
import { Alert, Button, Label, Modal, ModalBody, ModalHeader, Input } from "reactstrap";
import ToastMessage from '../../../../../components/Notification/ToastMessage';
import { AppContext } from "../../../../_app";

export default function ShareLiveLocation( {orderObj , isOpen, toggle}) {

     const { userId } = useContext(AppContext);

     const [latLon, setlatLon] = useState("")
     const [locationType, setLocationType] = useState('');
     const [showInstructions, setShowInstructions] = useState(false);

    const handleYes =  async () => {
        let lat = '6.927079';
        let lng = '79.861244';

        // navigator.geolocation.getCurrentPosition((position) => {
        //     console.log("Latitude is :", position.coords.latitude);
        //     console.log("Longitude is :", position.coords.longitude);
        //     lat = position?.coords?.latitude;
        //     lng = position?.coords?.longitude
        //     setlatLon(`${position.coords.latitude},${position.coords.longitude}`);
        //     getLocationDetils(position.coords.latitude, position.coords.longitude);
        //     setLocationType(e.value);
        // }, (error) => {
        //     if (error.code === error.PERMISSION_DENIED) {
        //         setShowInstructions(true);
        //         toggle()
        //     }
        // });

        if(lat && lng){
            const formData = {
                user_id: userId,
                orderId: orderObj?.orderItem?.checkout_id,
                latitude: lat,
                longitude: lng,
              };
              console.log("FormData:", formData);
              await axios
                .post(`/order_more_info_data_save`, formData)
                .then((response) => {
                  console.log("Data sent successfully:", response.data);
                  toggle()
                  if(response?.data?.status === 200){
                    ToastMessage({ status: "success", message: "share location successfully!" });
                  }
                 
                }).catch((err)=>{
                    console.log("err", err)
                    toggle()
                    ToastMessage({ status: "warning", message: "Sonme thing went wrong. Please try agin later!" });
                })
        }else{
            toggle()
            ToastMessage({ status: "warning", message: "Sonme thing went wrong. Please try agin later!" });
        }

        console.log("Yes clicked", userId,orderObj?.orderItem?.checkout_id );
    };

    const handleNo = () => {
        toggle()
    };

    const handlesetShowInstructions = () => {
        setShowInstructions(false);
    }

    return (
            <><ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'Confirmation'}>
            <div style={{ textAlign: "center" }}>
                <h6>Do you want to share your location?</h6>
                <div className="d-flex justify-content-center mt-3"></div>
                <Button color="primary" className="mr-2" onClick={() => handleYes()}>Yes</Button>
                <Button color="secondary" onClick={() => handleNo()}>No</Button>
            </div>
        </ModalBase>
        
        <ModalBase isOpen={showInstructions} toggle={handlesetShowInstructions} title="Allow Location Access" size='md'>
                <div className="d-flex flex-column align-items-center text-center">
                    <p style={{ lineHeight: '20px' }}>We need your location to calculate delivery options. Please allow location access in your browser.</p>
                    <p style={{ lineHeight: '20px' }}>Please click on the padlock icon next to the URL in your browser's address bar, then go to "Site settings" and enable "Location".</p>
                </div>
            </ModalBase></>
    );
}


