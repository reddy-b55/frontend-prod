import { toast, Slide } from 'react-toastify';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

function ToastMessage({ status = "success", message = "", autoClose = 3000, stopProcess }) {

    const loadingmessage = <div onClick={() => stopProcess()} style={{ cursor: 'pointer' }}>Product adding to cart. Click here to undo.</div>

    status === 'success' ?
        toast.success(message, {
            icon: <CheckCircleIcon style={{ color: 'white' }} />,
            style: { backgroundColor: '#28a745', color: 'white' },
            autoClose: autoClose, transition: Slide, hideProgressBar: true
        }) : status === 'warning' ?
            toast.warning(message, {
                icon: <PriorityHighIcon style={{ color: 'white' }} />,
                style: { backgroundColor: '#ffc107', color: 'black' },
                autoClose: autoClose, transition: Slide, hideProgressBar: true
            }) : status === 'error' ?
                toast.error(message, {
                    icon: <PriorityHighIcon style={{ color: 'white' }} />,
                    style: { backgroundColor: '#dc3545', color: 'white' },
                    autoClose: autoClose, transition: Slide, hideProgressBar: true
                }) : status === 'loading' ?
                    toast.warning(loadingmessage, {
                        icon: <PriorityHighIcon style={{ color: 'white' }} />,
                        style: { backgroundColor: 'ffc107', color: 'black' },
                        autoClose: autoClose, transition: Slide, hideProgressBar: false
                    }) : null

}

export default ToastMessage;