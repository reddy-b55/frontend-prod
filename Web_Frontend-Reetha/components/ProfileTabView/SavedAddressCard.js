import React from 'react';
import { Delete } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';

const SavedAddressCard = ({ value, handleDelete, handleEdit }) => {
       return (
        <div className='border rounded-0 p-3 m-0 mb-2 me-lg-3 border col-md-4 col-lg-12 me-md-3'>
            <div className='saved-address'>
                <EditIcon onClick={() => handleEdit(value, false)} className="btn-sm btn-danger d-none d-lg-block d-md-block" style={{ color: 'black', fontSize: 18 }} />
                <EditIcon onClick={() => handleEdit(value, true)} className="btn-sm btn-danger d-block d-lg-none d-md-none" style={{ color: 'black', fontSize: 18 }} />
                <Delete onClick={() => handleDelete(value.id)} className="btn-sm btn-danger" style={{ color: 'black', fontSize: 18 }} />
            </div>
            <h6 style={{ color: 'black', fontWeight: '600' }} className='m-0 p-0 w-100 text-start'>{value?.contact_name}</h6>
            <h6 style={{ color: 'black', fontSize: 12, lineBreak: 'anywhere', textAlign: 'left' }} className='ellipsis-1-lines m-0 p-0 w-100'>{value?.country} - {value?.address_full}</h6>
        </div>
    );
};

export default SavedAddressCard;
