import { useState, useContext } from 'react';
import ModalBase from "../../../../components/common/Modals/ModalBase";
import { Button, Input, Alert } from "reactstrap";
import { AppContext } from "../../../_app";
import ToastMessage from '../../../../components/Notification/ToastMessage';
import axios from 'axios';

export default function ViewMoreInfo({ orderObj, isOpen, toggle }) {
    const { userId } = useContext(AppContext);
    console.log("obg", orderObj)


   

    return (
        <ModalBase isOpen={isOpen} toggle={toggle} showtitle={true} title={'More Info'}>
            <div className="py-3 px-2">
                <div className="d-flex flex-column align-items-center">
                  
                </div>
            </div>
        </ModalBase>
    );
}