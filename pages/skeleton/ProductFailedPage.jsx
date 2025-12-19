import { useRouter } from 'next/router';
import React, { useContext, useEffect, useRef } from 'react';

import { AppContext } from '../_app';
import { db } from '../../firebase';

import ToastMessage from '../../components/Notification/ToastMessage';

function ProductFailedPage() {
   
    const eyeRefEye2 = useRef(null);

    const router = useRouter();
    const { baseUserId, userStatus } = useContext(AppContext);

    const eyeRef = useRef(null);
    const eyeRefEye1 = useRef(null);
    
    const createNewChat = async () => {
        if (userStatus.userLoggesIn) {
            await addDoc(collection(db, "customer-chat-lists"), {
                status: 'Pending',
                createdAt: new Date(),
                supplierAdded: false,
                notifyAdmin: true,
                notifySupplier: false,
                notifyCustomer: false,
                customer_collection_id: Number(baseUserId.cxid),
                supplier_id: '',
                supplier_name: '',
                group_chat: '',
                customer_name: baseUserId.user_username,
                customer_mail_id: baseUserId.user_email,
                supplier_mail_id: '',
                supplier_added_date: '',
                comments: 'Technical support - chat has been created from product details page',
                chat_name: `Aahaas Conversation ( technical support )`,
                customer_id: Number(baseUserId.cxid),
                chat_related: 'Technical-support',
                chat_avatar: '',
                updatedAt: new Date()
            }).then((response) => {
                router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
            })
        } else {
            router.push("/page/account/login-auth");
            localStorage.setItem("lastPath", router.asPath)
            ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
        }
    }

    const helpCenter = () => {
        router.push("/page/helpcenter");
    }

    useEffect(() => {
        const handleMouseMove = (event) => {
            try {
                const e1 = eyeRefEye1.current;
                const e2 = eyeRefEye2.current;
                const x = e1.offsetLeft + e1.offsetWidth / 2;
                const y = e1.offsetTop + e1.offsetHeight / 2;
                const rad = Math.atan2(event.pageX - x, event.pageY - y);
                const rot = rad * (180 / Math.PI) * -1 + 180;
                e1.style.transform = `rotate(${rot}deg)`;
                e2.style.transform = `rotate(${rot}deg)`;
            } catch (error) {
                // console.error(error);
            }
        };
        document.body.addEventListener('mousemove', handleMouseMove);
        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className='p-4 mb-5 pro-failed-page-main-container' ref={eyeRef} style={{ cursor: 'pointer' }}>
            <div className='d-flex align-items-center gap-3'>
                <span class='error-num'>5</span>
                <div class='eye' ref={eyeRefEye1}></div>
                <div class='eye' ref={eyeRefEye2}></div>
            </div>
            <p>Something went wrong. We're <i>looking</i> to see what happened.</p>
            <div className='d-flex align-items-center gap-3'>
                <span className='span-link' onClick={helpCenter}>Help center</span>
                <span className='span-link' onClick={createNewChat}>Chat with us</span>
            </div>
        </div>
    )
}

export default ProductFailedPage;