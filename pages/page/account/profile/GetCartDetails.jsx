import React, { useContext, useEffect, useState } from 'react'

import ModalBase from '../../../../components/common/Modals/ModalBase';
import ToastMessage from '../../../../components/Notification/ToastMessage';
import { handleSendReq } from '../../../../AxiosCalls/UserServices/Cartsharing';
import axios from "axios";

import Tooltip from '@mui/material/Tooltip';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { AppContext } from '../../../_app';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import CartDisplay from './CartDisplay ';

function GetCartDetails({ cartProducts, cartData, currentCart, cartsharing = false, sharedCarts = false, acceptedCarts = false, incomingReq = false, sentRequests = false, handleRejectCart, handleStopSharing, handleAcceptCart, removeCart, shareCart=false }) {

    const { baseUserId, userId } = useContext(AppContext);
    const [cartDetails, getCartDetails] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        let lifestyle = 0;
        let hotels = 0;
        let education = 0;
        let essential = 0;
        let nonessentials = 0;
        cartData.filter((value) => {
            if (value.cart_id === currentCart.cart_id) {
                if (value.main_category_id == 1) {
                    essential += 1
                } else if (value.main_category_id == 2) {
                    nonessentials += 1
                } else if (value.main_category_id == 3) {
                    lifestyle += 1
                } else if (value.main_category_id == 4) {
                    education + 1
                } else if (value.main_category_id == 5) {
                    hotels += 1
                }
            }
        })
        const dataset = `${lifestyle > 0 ? `Lifestyle x ${lifestyle} ` : ''} ${education > 0 ? `Education x ${education} ` : ''}${hotels > 0 ? `Hotels x ${hotels} ` : ''}${essential > 0 ? `Essential x ${essential} ` : ''} ${nonessentials > 0 ? `Non-Essential x ${nonessentials}` : ''}`.trim().replace(/\s+/g, ' ');
        getCartDetails(dataset)
    }, [cartData, currentCart]);

    const [shareingModal, setShareingModal] = useState({
        status: false,
        cartId: '',
        customerMailId: ''
    });

    const handleShareCart = (id) => {
        setShareingModal({
            status: true,
            cartId: id,
            customerMailId: ''
        })
    }

    const handleCloseModal = () => {
        setShareingModal({
            status: false,
            cartId: '',
            customerMailId: ''
        })
    }

    const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Trim and normalize the email
    const enteredEmail = shareingModal.customerMailId.trim().toLowerCase();
    const userEmail = baseUserId.user_email.trim().toLowerCase();
    
    if (enteredEmail === userEmail) {
        ToastMessage({ status: 'error', message: 'You cannot share your cart with yourself' });
        return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(enteredEmail)) {
        ToastMessage({ status: 'error', message: 'Please enter a valid email address' });
        return;
    }
    
    await handleSendReq(shareingModal.cartId, enteredEmail).then((response) => {
        if (response === '(Internal Server Error)') {
            ToastMessage({ status: 'error', message: 'Cannot share the cart. Please try again later.' });
        } else if (response === 'Something went wrong !') {
            ToastMessage({ status: 'error', message: 'Something went wrong. Please try again.' });
            handleCloseModal();
        } else if (response === 'failed') {
            ToastMessage({ status: 'error', message: 'Unable to find a user with the provided email.' });
        } else if (response === 'already_shared') {
            ToastMessage({ 
                status: 'warning', 
                message: 'This cart is already shared with this email address.' 
            });
            handleCloseModal();
        } else if (response === 'success') {
            ToastMessage({ 
                status: 'success', 
                message: 'Cart has been shared successfully.' 
            });
            handleCloseModal();
        } else {
            ToastMessage({ status: 'error', message: 'Something went wrong. Please try again.' });
            handleCloseModal();
        }
    });
}

    const [viewCartEdit, setViewCartEdit] = useState(false);
    const [cartEditData, setCartEditData] = useState([]);
    const [editCartName, setEditCartName] = useState('');
    const [handleCartDeleteModel, setHandleCartDeleteModel] = useState(false);
    const [deleteCart, setDeleteCart] = useState([]);
    const handleCartEdit = (cart) => {
        console.log("cart", currentCart)
        setCartEditData(cart)
        // setEditCartName(cart.cart_title);
         setEditCartName(cart.cart_title);
        setViewCartEdit(!viewCartEdit)
    }

    const handleCartDelete = (cart) => {
        console.log("cart", currentCart)
        DeleteCart(cart)
         setHandleCartDeleteModel(!handleCartDeleteModel)
        // setCartEditData(cart)
        // setViewCartEdit(!viewCartEdit)
    }

    const handleModel = (cart) => {
        setDeleteCart(cart)
        setHandleCartDeleteModel(!handleCartDeleteModel)
    }

    const cartDelete = (cartID) => {
        // console.log({ cart_id: cartID }, "Cart Data set value is");
     
        Alert.alert("Are you sure you want to delete cart?", "", [
          {
            text: "Yes",
            onPress: () => {
              axios.post("deleteCustomCart", { cart_id: cartID }).then((res) => {
                if (res.data.status === 200) {
                  getData();
                  showToast({
                    type: "success",
                    text1: "Cart Deleted Successfully",
                    // text2: 'Confirmation Email will Send to you within date'
                  });
     
                  Alert.alert(
                    "Cart Deleted",
                    "This cart has been deleted successfully",
                    [
                      {
                        text: "Ok",
                        onPress: () => { },
                        style: "cancel",
                      },
                      //   {text: 'OK', onPress: () => //console.log('OK Pressed')},
                    ]
                  );
                } else {
                  //console.log("Error");
                  itemAddErrorMessage();
                }
              });
            },
          },
          {
            text: "Cancel",
            onPress: () => { },
            style: "cancel",
          },
        ]);
     
        // let id = ToastAndroid.show('Cart Deleting in Progress', ToastAndroid.SHORT);
      };

      const DeleteCart = async (cartID) => {
        // console.log("cartEditData", cartID.cart_id)
        
        await  axios.post("deleteCustomCart", { cart_id: cartID.cart_id }).then((response) => {
 
            if (response.data.status == 200) {
                currentCart.cart_title = 'removed';
                removeCart(cartID.cart_id)
                ToastMessage({ status: 'success', message: 'Cart Deleted Successfully' })
            }
            else if (response.data.status == 404) {
                ToastMessage({ status: 'error', message:  "Can't delete the cart try again later" })
            }
            else if (response.data.status == 409) {
                ToastMessage({ status: 'warning', message:  "Can't delete the cart try again later"})
            }
        })
                
        
        // handleCloseCartEdit();
    }

    const handleCloseCartEdit = () => {
        setViewCartEdit(false)
        setEditCartName('') 
    }

   const handleEditCart = async (e) => {
    e.preventDefault();
    
    // Check if cart name is empty
    if (!editCartName.trim()) {
        ToastMessage({ status: 'warning', message: 'Please add the cart name to save' });
        return;
    }
    
    // Check if the name is the same as the original
    if (editCartName.trim() === cartEditData?.cart_title) {
        ToastMessage({ status: 'warning', message: 'Cart name is already taken. Please make changes.' });
        return;
    }
    
    await axios.post(`edit_cart_name/${cartEditData?.cart_id}`, { 
        "cart_title": editCartName, 
        "user_id": cartEditData?.customer_id 
    }).then(response => {
        if (response.data.status == 200) {
            handleCloseCartEdit();
            currentCart.cart_title = editCartName;
            setEditCartName('') 
            ToastMessage({ status: 'success', message: 'Cart Name Updated Successfully' })
        }
        else if (response.data.status == 404) {
            handleCloseCartEdit();
            setEditCartName('') 
            ToastMessage({ status: 'error', message: "Can't Update this Cart Name" })
        }
        else if (response.data.status == 409) {
            handleCloseCartEdit();
            setEditCartName('') 
            ToastMessage({ status: 'warning', message: "A cart with this name already exists. Please choose a different name." })
        }
    })
}

      const [shareModelCart, setShareModelCart] = useState(false);
      const [filteredCartProducts, setFilteredCartProducts] = useState([])

      const handleCartInfo = (currentCart) => {
        console.log("currentCart",  cartProducts)
        setShareModelCart(!shareModelCart);
        const cartId = currentCart.cart_id;
        const matchedProducts = cartProducts.filter(product => product?.cart_id === cartId);
        console.log("matchedProducts", matchedProducts)
        setFilteredCartProducts(matchedProducts)
      }

    return (
        <div className='d-flex justify-content-between flex-column ' >
            <div className='d-flex flex-wrap align-items-center gap-2'>
                {
                    cartsharing ?
                    currentCart.cart_title === "My Cart"? (null) :
                        <Tooltip title="Share this cart">
                           {
                            shareCart ? null : <ShareOutlinedIcon
                                style={{ padding: "1px", color: "red" }}
                                sx={{ cursor: 'pointer', fontSize: '16px' }}
                                onClick={() => handleShareCart(currentCart.cart_id)}
                            />
                           } 
                        </Tooltip> :
                        // <ShareOutlinedIcon style={{ padding: "1px", color: "red" }} sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => handleShareCart(currentCart.cart_id)} /> :
                        sharedCarts ?

                            <Tooltip title="Stop share">
                                <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleStopSharing(currentCart.shared_cart_id)} />
                            </Tooltip> :
                            acceptedCarts ?
                                <Tooltip title="Stop share">

                                    <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleStopSharing(currentCart.shared_cart_id)} />
                                </Tooltip> :
                                incomingReq ?
                                    <>
                                        <CheckCircleOutlineOutlinedIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'green' }} onClick={() => handleAcceptCart(currentCart.shared_cart_id)} />
                                        <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleRejectCart(currentCart.shared_cart_id)} />
                                    </> :
                                    sentRequests ?
                                        <Tooltip title="Click here to cancel the request">
                                            <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red', cursor: 'pointer' }} onClick={() => handleRejectCart(currentCart.shared_cart_id)} />
                                        </Tooltip>
                                        : null
                }
                <ShoppingCartIcon sx={{ fontSize: '16px' }} />
                {
                    !incomingReq ?  <InfoIcon  sx={{ cursor: 'pointer',fontSize: '16px' }} onClick={()=>{handleCartInfo(currentCart)}} /> : null
                }
               
                {
                    !sharedCarts && !acceptedCarts && !incomingReq && !sentRequests && currentCart.cart_title !== "My Cart" ?
                        shareCart ? null : <EditIcon sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => {handleCartEdit(currentCart)}} />
                        : null
                }
                 {
                    !sharedCarts && !acceptedCarts && !incomingReq && !sentRequests && currentCart.cart_title !== "My Cart" ?
                         shareCart ? null : <DeleteIcon sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => {handleModel(currentCart)}} />
                        : null
                }
                <h2
                    style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'capitalize',
                        maxWidth: '180px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                    className='m-0 p-0'
                    title={currentCart.cart_title}
                >
                    {currentCart.cart_title}
                </h2>
            </div>


            <h6 className='m-0 p-0' style={{ fontSize: "10px" }}>{cartDetails}</h6>
            {
                sharedCarts ?
                    <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'Cart has been shared with : ' + currentCart.shared_email}</h6>
                    : acceptedCarts ?
                        <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'This cart has been shared by : ' + currentCart.shared_email}</h6>
                        : incomingReq ?
                            <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'You have been invited by ' + currentCart.shared_email + ' for sharing the cart with you'}</h6>
                            : sentRequests ?
                                <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'You have been invited ' + currentCart.shared_email + ' for sharing the cart with you'}</h6>
                                : null
            }
            <ModalBase isOpen={shareingModal.status} toggle={handleCloseModal} title={'Share your cart'}>
                <form className='container d-flex flex-column align-items-center' onSubmit={handleSubmit}>
                    <input type="mail" placeholder='Enter your mail id' className='form-control py-3' value={shareingModal.customerMailId} onChange={(e) => setShareingModal({ ...shareingModal, customerMailId: e.target.value })} />
                    <button className='btn btn-sm btn-solid mt-3' onClick={handleSubmit}>Submit</button>
                </form>
            </ModalBase>
            <ModalBase isOpen={shareModelCart} toggle={handleCartInfo} title="Products" size='md'>
                <CartDisplay filteredCartProducts={filteredCartProducts}/>
            </ModalBase>
            
             <ModalBase isOpen={handleCartDeleteModel} toggle={()=>setHandleCartDeleteModel(false)} title={'Remove Profile Picture'}>
                            <div>
                                <h6 className='text-center'>Are you sure you want to delete this cart?</h6>
                                <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
                                    <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={() => handleCartDelete(deleteCart)}>Yes</button>
                                    <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={()=> handleModel(deleteCart)}>No</button>
                                </div>
                            </div>
                        </ModalBase>

          <ModalBase isOpen={viewCartEdit} toggle={handleCloseCartEdit} title={'Edit Cart'}>
    <form className='container d-flex flex-column align-items-center' onSubmit={handleEditCart}>
        <input 
            type="text" 
            placeholder="Enter cart name"
            className='form-control py-3' 
            value={editCartName} 
            onChange={(e) => setEditCartName(e.target.value)} 
        />
        <button className='btn btn-sm btn-solid mt-3' type="submit">Save</button>
    </form>
          </ModalBase>
        </div>
    )
}

export default GetCartDetails



// import React, { useContext, useEffect, useState } from 'react'

// import ModalBase from '../../../../components/common/Modals/ModalBase';
// import ToastMessage from '../../../../components/Notification/ToastMessage';
// import { handleSendReq } from '../../../../AxiosCalls/UserServices/Cartsharing';
// import axios from "axios";

// import Tooltip from '@mui/material/Tooltip';
// import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
// import DoNotDisturbOutlinedIcon from '@mui/icons-material/DoNotDisturbOutlined';
// import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
// import { AppContext } from '../../../_app';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import CancelIcon from '@mui/icons-material/Cancel';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import InfoIcon from '@mui/icons-material/Info';
// import CartDisplay from './CartDisplay ';

// function GetCartDetails({ cartProducts, cartData, currentCart, cartsharing = false, sharedCarts = false, acceptedCarts = false, incomingReq = false, sentRequests = false, handleRejectCart, handleStopSharing, handleAcceptCart, removeCart }) {

//     const { baseUserId, userId } = useContext(AppContext);
//     const [cartDetails, getCartDetails] = useState('');
//     const [userEmail, setUserEmail] = useState('');

//     useEffect(() => {
//         let lifestyle = 0;
//         let hotels = 0;
//         let education = 0;
//         let essential = 0;
//         let nonessentials = 0;
//         cartData.filter((value) => {
//             if (value.cart_id === currentCart.cart_id) {
//                 if (value.main_category_id == 1) {
//                     essential += 1
//                 } else if (value.main_category_id == 2) {
//                     nonessentials += 1
//                 } else if (value.main_category_id == 3) {
//                     lifestyle += 1
//                 } else if (value.main_category_id == 4) {
//                     education + 1
//                 } else if (value.main_category_id == 5) {
//                     hotels += 1
//                 }
//             }
//         })
//         const dataset = `${lifestyle > 0 ? `Lifestyle x ${lifestyle} ` : ''} ${education > 0 ? `Education x ${education} ` : ''}${hotels > 0 ? `Hotels x ${hotels} ` : ''}${essential > 0 ? `Essential x ${essential} ` : ''} ${nonessentials > 0 ? `Non-Essential x ${nonessentials}` : ''}`.trim().replace(/\s+/g, ' ');
//         getCartDetails(dataset)
//     }, [cartData, currentCart]);

//     const [shareingModal, setShareingModal] = useState({
//         status: false,
//         cartId: '',
//         customerMailId: ''
//     });

//     const handleShareCart = (id) => {
//         setShareingModal({
//             status: true,
//             cartId: id,
//             customerMailId: ''
//         })
//     }

//     const handleCloseModal = () => {
//         setShareingModal({
//             status: false,
//             cartId: '',
//             customerMailId: ''
//         })
//     }

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (shareingModal.customerMailId.toString() === baseUserId.user_email.toString()) {
//             ToastMessage({ status: 'error', message: 'You can not share your cart with yourself' })
//         } else {
//             await handleSendReq(shareingModal.cartId, shareingModal.customerMailId).then((response) => {
//                 if (response === '(Internal Server Error)') {
//                     ToastMessage({ status: 'error', message: 'Cannot able to share the cart please check the mail is valid and try again' });
//                 } else if (response === 'Something went wrong !') {
//                     ToastMessage({ status: 'error', message: 'Something went wrong !' });
//                     handleCloseModal();
//                 } else if (response == 'failed') {
//                     ToastMessage({ status: 'error', message: 'Unable to find a user with the provided email.' });
//                 } else if (response == 'success') {
//                     ToastMessage({ status: 'success', message: 'Cart has been shared successfully.' });
//                     handleCloseModal();
//                 } else {
//                     ToastMessage({ status: 'error', message: 'Something went wrong !' });
//                     handleCloseModal();
//                 }
//             });
//         }
//     }

//     const [viewCartEdit, setViewCartEdit] = useState(false);
//     const [cartEditData, setCartEditData] = useState([]);
//     const [editCartName, setEditCartName] = useState('');
//     const [handleCartDeleteModel, setHandleCartDeleteModel] = useState(false);
//     const [deleteCart, setDeleteCart] = useState([]);
//     const handleCartEdit = (cart) => {
//         console.log("cart", currentCart)
//         setCartEditData(cart)
//         // setEditCartName(cart.cart_title);
//         setViewCartEdit(!viewCartEdit)
//     }

//     const handleCartDelete = (cart) => {
//         console.log("cart", currentCart)
//         DeleteCart(cart)
//          setHandleCartDeleteModel(!handleCartDeleteModel)
//         // setCartEditData(cart)
//         // setViewCartEdit(!viewCartEdit)
//     }

//     const handleModel = (cart) => {
//         setDeleteCart(cart)
//         setHandleCartDeleteModel(!handleCartDeleteModel)
//     }

//     const cartDelete = (cartID) => {
//         // console.log({ cart_id: cartID }, "Cart Data set value is");
     
//         Alert.alert("Are you sure you want to delete cart?", "", [
//           {
//             text: "Yes",
//             onPress: () => {
//               axios.post("deleteCustomCart", { cart_id: cartID }).then((res) => {
//                 if (res.data.status === 200) {
//                   getData();
//                   showToast({
//                     type: "success",
//                     text1: "Cart Deleted Successfully",
//                     // text2: 'Confirmation Email will Send to you within date'
//                   });
     
//                   Alert.alert(
//                     "Cart Deleted",
//                     "This cart has been deleted successfully",
//                     [
//                       {
//                         text: "Ok",
//                         onPress: () => { },
//                         style: "cancel",
//                       },
//                       //   {text: 'OK', onPress: () => //console.log('OK Pressed')},
//                     ]
//                   );
//                 } else {
//                   //console.log("Error");
//                   itemAddErrorMessage();
//                 }
//               });
//             },
//           },
//           {
//             text: "Cancel",
//             onPress: () => { },
//             style: "cancel",
//           },
//         ]);
     
//         // let id = ToastAndroid.show('Cart Deleting in Progress', ToastAndroid.SHORT);
//       };

//       const DeleteCart = async (cartID) => {
//         // console.log("cartEditData", cartID.cart_id)
        
//         await  axios.post("deleteCustomCart", { cart_id: cartID.cart_id }).then((response) => {
 
//             if (response.data.status == 200) {
//                 currentCart.cart_title = 'removed';
//                 removeCart(cartID.cart_id)
//                 ToastMessage({ status: 'success', message: 'Cart Deleted Successfully' })
//             }
//             else if (response.data.status == 404) {
//                 ToastMessage({ status: 'error', message:  "Can't delete the cart try again later" })
//             }
//             else if (response.data.status == 409) {
//                 ToastMessage({ status: 'warning', message:  "Can't delete the cart try again later"})
//             }
//         })
                
        
//         // handleCloseCartEdit();
//     }

//     const handleCloseCartEdit = () => {
//         setViewCartEdit(false)
//         setEditCartName('') 
//     }

//     const handleEditCart = async (e) => {
//         // console.log("cartEditData", e, editCartName)
//         e.preventDefault();
        
//         if (!editCartName.trim()) {
//             ToastMessage({ status: 'warning', message: 'Cart name cannot be empty' });
//             return;
//         }
        
//         await axios.post(`edit_cart_name/${cartEditData?.cart_id}`, { "cart_title": editCartName, "user_id":cartEditData?.customer_id }).then(response => {
 
//             if (response.data.status == 200) {
 
//                 handleCloseCartEdit();
//                 currentCart.cart_title = editCartName;
//                 setEditCartName('') 
//                 ToastMessage({ status: 'success', message: 'Cart Name Updated Successfully' })
               
//             }
//             else if (response.data.status == 404) {
             
//                 handleCloseCartEdit();
//                 setEditCartName('') 
//                 ToastMessage({ status: 'error', message:  "Can't Update this Cart Name" })
 
//             }
//             else if (response.data.status == 409) {
 
//                 handleCloseCartEdit();
//                 setEditCartName('') 
//                 ToastMessage({ status: 'warning', message:  "A cart with this name already exists. Please choose a different name." })
 
//             }
//         })
//     }

//       const [shareModelCart, setShareModelCart] = useState(false);
//       const [filteredCartProducts, setFilteredCartProducts] = useState([])

//       const handleCartInfo = (currentCart) => {
//         console.log("currentCart",  cartProducts)
//         setShareModelCart(!shareModelCart);
//         const cartId = currentCart.cart_id;
//         const matchedProducts = cartProducts.filter(product => product?.cart_id === cartId);
//         console.log("matchedProducts", matchedProducts)
//         setFilteredCartProducts(matchedProducts)
//       }

//     return (
//         <div className='d-flex justify-content-between flex-column ' >
//             <div className='d-flex flex-wrap align-items-center gap-2'>
//                 {
//                     cartsharing ?
//                     currentCart.cart_title === "My Cart"? (null) :
//                         <Tooltip title="Share this cart">
//                             <ShareOutlinedIcon
//                                 style={{ padding: "1px", color: "red" }}
//                                 sx={{ cursor: 'pointer', fontSize: '16px' }}
//                                 onClick={() => handleShareCart(currentCart.cart_id)}
//                             />
//                         </Tooltip> :
//                         // <ShareOutlinedIcon style={{ padding: "1px", color: "red" }} sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => handleShareCart(currentCart.cart_id)} /> :
//                         sharedCarts ?

//                             <Tooltip title="Stop share">
//                                 <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleStopSharing(currentCart.shared_cart_id)} />
//                             </Tooltip> :
//                             acceptedCarts ?
//                                 <Tooltip title="Stop share">

//                                     <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleStopSharing(currentCart.shared_cart_id)} />
//                                 </Tooltip> :
//                                 incomingReq ?
//                                     <>
//                                         <CheckCircleOutlineOutlinedIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'green' }} onClick={() => handleAcceptCart(currentCart.shared_cart_id)} />
//                                         <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red' }} onClick={() => handleRejectCart(currentCart.shared_cart_id)} />
//                                     </> :
//                                     sentRequests ?
//                                         <Tooltip title="Click here to cancel the request">
//                                             <CancelIcon sx={{ cursor: 'pointer', fontSize: '16px', color: 'red', cursor: 'pointer' }} onClick={() => handleRejectCart(currentCart.shared_cart_id)} />
//                                         </Tooltip>
//                                         : null
//                 }
//                 <ShoppingCartIcon sx={{ fontSize: '16px' }} />
//                 {
//                     !incomingReq ?  <InfoIcon  sx={{ cursor: 'pointer',fontSize: '16px' }} onClick={()=>{handleCartInfo(currentCart)}} /> : null
//                 }
               
//                 {
//                     !sharedCarts && !acceptedCarts && !incomingReq && !sentRequests && currentCart.cart_title !== "My Cart" ?
//                         <EditIcon sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => {handleCartEdit(currentCart)}} />
//                         : null
//                 }
//                  {
//                     !sharedCarts && !acceptedCarts && !incomingReq && !sentRequests && currentCart.cart_title !== "My Cart" ?
//                         <DeleteIcon sx={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => {handleModel(currentCart)}} />
//                         : null
//                 }
//                 <h2 style={{ fontSize: '12px', fontWeight: '500' }} className='m-0 p-0'> {currentCart.cart_title}</h2>
//             </div>


//             <h6 className='m-0 p-0' style={{ fontSize: "10px" }}>{cartDetails}</h6>
//             {
//                 sharedCarts ?
//                     <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'Cart has been shared with : ' + currentCart.shared_email}</h6>
//                     : acceptedCarts ?
//                         <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'This cart has been shared by : ' + currentCart.shared_email}</h6>
//                         : incomingReq ?
//                             <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'You have invited by ' + currentCart.shared_email + ' for sharing the cart with you'}</h6>
//                             : sentRequests ?
//                                 <h6 className='m-0 p-0' style={{ fontSize: 12 }}>{'You have invited ' + currentCart.shared_email + ' for sharing the cart with you'}</h6>
//                                 : null
//             }
//             <ModalBase isOpen={shareingModal.status} toggle={handleCloseModal} title={'Share your cart'}>
//                 <form className='container d-flex flex-column align-items-center' onSubmit={handleSubmit}>
//                     <input type="mail" placeholder='Enter your mail id' className='form-control py-3' value={shareingModal.customerMailId} onChange={(e) => setShareingModal({ ...shareingModal, customerMailId: e.target.value })} />
//                     <button className='btn btn-sm btn-solid mt-3' onClick={handleSubmit}>Submit</button>
//                 </form>
//             </ModalBase>
//             <ModalBase isOpen={shareModelCart} toggle={handleCartInfo} title="Products" size='md'>
//                 <CartDisplay filteredCartProducts={filteredCartProducts}/>
//             </ModalBase>
            
//              <ModalBase isOpen={handleCartDeleteModel} toggle={()=>setHandleCartDeleteModel(false)} title={'Remove Profile Picture'}>
//                             <div>
//                                 <h6 className='text-center'>Are you sure you want to delete this cart?</h6>
//                                 <div className='d-flex align-items-center justify-content-center gap-3 my-3'>
//                                     <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={() => handleCartDelete(deleteCart)}>Yes</button>
//                                     <button className='btn btn-solid p-0 m-0 py-1 px-3 rounded-2' style={{ fontSize: 12 }} onClick={()=> handleModel(deleteCart)}>No</button>
//                                 </div>
//                             </div>
//                         </ModalBase>

//             <ModalBase isOpen={viewCartEdit} toggle={handleCloseCartEdit} title={'Edit Cart'}>
//     <form className='container d-flex flex-column align-items-center' onSubmit={handleEditCart}>
//         <input 
//             type="text" 
//             placeholder={cartEditData?.cart_title} 
//             className='form-control py-3' 
//             value={editCartName} 
//             onChange={(e) => setEditCartName(e.target.value)} 
//         />
//         <button className='btn btn-sm btn-solid mt-3' type="submit">Save</button>
//     </form>
// </ModalBase>
//         </div>
//     )
// }

// export default GetCartDetails
