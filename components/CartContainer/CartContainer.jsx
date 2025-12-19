// import React, { useContext, useEffect, useRef, useState } from 'react'
// import { AppContext } from '../../pages/_app';
// import { addEducationProduct, addEssentialNonEssentialProduct, addHotelsProduct, addLifestyleProduct, createNewCart, deleteExistingCart, getCartDataDetails } from '../../AxiosCalls/UserServices/UserCartservices';
// import { Button, Col, Input, Label } from 'reactstrap';
// import { Delete, ShareRounded } from '@mui/icons-material';
// import ToastMessage from '../Notification/ToastMessage';

// function CartContainer(props) {
//     console.log("CartContainer props",props)
//     const { userId, triggers, setTriggers } = useContext(AppContext);

//     const [openDeleteCart, setOpenDeleteCart] = useState('');
//     const [duplicateCartNameError, setDuplicateCartNameError] = useState(false);
//     const [newCartName, setnewCartName] = useState('');
//     const [cartDetails, setcartDetails] = useState([]);
//     const [selectedID, setSelectedID] = useState('');

//     // const getCartDetails = async () => {
//     //     await getCartDataDetails(userId).then((result) => {
//     //         if (result === '(Internal Server Error)') {
//     //             ToastMessage({ status: "error", message: "Failed to load data.." })
//     //         } else if (result === 'Something went wrong !') {
//     //             ToastMessage({ status: "error", message: result })
//     //         } else {
//     //             setcartDetails(result.data.cartData);
//     //             let defaultCard = result.data.cartData.filter((value) => { return value.cart_title === "My Cart" });
//     //             if (props?.productData?.cart_id === null) {
//     //                 setSelectedID(defaultCard[0].cart_id);
//     //             } else {
//     //                 setSelectedID(props?.productData?.cart_id);
//     //             }
//     //         }
//     //     });
//     // }

//     // Update the getCartDetails function to properly select "My Cart" by default
// const getCartDetails = async () => {
//     await getCartDataDetails(userId).then((result) => {
//       if (result === '(Internal Server Error)') {
//         ToastMessage({ status: "error", message: "Failed to load data.." })
//       } else if (result === 'Something went wrong !') {
//         ToastMessage({ status: "error", message: result })
//       } else {
//         setcartDetails(result.data.cartData);
        
//         // Find "My Cart" in the returned cart data
//         const defaultCart = result.data.cartData.find(cart => 
//           cart.cart_title.toLowerCase() === "my cart"
//         );
        
//         // If we found "My Cart" and there's no specific cart_id in props, select "My Cart"
//         if (defaultCart && (!props.productData || !props.productData.cart_id)) {
//           setSelectedID(defaultCart.cart_id);
//         } 
//         // Otherwise if there's a cart_id in props, use that
//         else if (props.productData && props.productData.cart_id) {
//           setSelectedID(props.productData.cart_id);
//         }
//         // If there's no "My Cart" but there are carts, select the first one
//         else if (result.data.cartData.length > 0) {
//           setSelectedID(result.data.cartData[0].cart_id);
//         }
//       }
//     });
//   }

//     const handleAddnewCart = async () => {
//         setDuplicateCartNameError(false)
//         if (newCartName === '' || newCartName === undefined || newCartName === null || newCartName === "undefined" || newCartName === "null") {
//             ToastMessage({ status: "warning", message: "Please enter cart name and try again" })
//         } else {
//             const dataD = {
//                 customer_id: userId,
//                 cart_title: newCartName
//             }
//             let result = await createNewCart(dataD)
//             if (result.status === 200 && result.data.status === 200) {
//                 getCartDetails()
//                 setnewCartName('')
//                 ToastMessage({ status: "success", message: "New Cart Has Been Created" })
//             } else if (result.status === 200 && result.data.status === 400) {
//                 setDuplicateCartNameError(true)
//             }
//         }
//     }

//     const addEducationPro = async () => {
//         let result = await addEducationProduct(props.productData)
//         if (result === "Successfull") {
//             props.handlePassData(true)
//             ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Education Product Updated to the Cart" : "Education Added To The Cart Sucessfully" })
//             setTriggers({
//                 ...triggers,
//                 customerCartTrigger: !triggers.customerCartTrigger
//             })
//         }
//     }

//     const addLifestylePro = async () => {
//         // console.log("props.productData", props.productData)
//         let result = await addLifestyleProduct(props.productData)
//         if (result === "Successfull") {
//             props.handlePassData(true)
//             ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Lifestyle Product Updated to the Cart" : "Lifestyle Added To The Cart Sucessfully" })
//             setTriggers({
//                 ...triggers,
//                 customerCartTrigger: !triggers.customerCartTrigger
//             })
//         } else if (result === 'Product already added to cart') {
//             props.handlePassData('existing')
//         } else {
//             props.handlePassData(false)
//         }
//     }

//     const addHotelPro = async () => {
//         let result = await addHotelsProduct(props.productData);
//         if (result === "Successfull") {
//             props.handlePassData(true)
//             ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Hotel Product Updated to the Cart" : "Hotel Added To The Cart Sucessfully" })
//             setTriggers({
//                 ...triggers,
//                 customerCartTrigger: !triggers.customerCartTrigger
//             })
//         }else{
//             props.handlePassData(false)
//             ToastMessage({ status: "error", message: result })
//         }
//     }

//     const addEssentialPro = async () => {
//         let result = await addEssentialNonEssentialProduct(props.productData)
//         if (result === "Successfull") {
//             props.handlePassData(true)
//             ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? `${Number(props.productData.main_category_id) === 1 ? 'Essential' : 'Non-Essential'} Product Updated to the Cart` : `${Number(props.productData.main_category_id) === 1 ? 'Essential' : 'Non-Essential'} Added To The Cart Sucessfully` })
//             setTriggers({
//                 ...triggers,
//                 customerCartTrigger: !triggers.customerCartTrigger
//             })
//         } else if (result === "Updated") {
//             props.handlePassData('Updated')
//         } else {
//             props.handlePassData(false)
//         }
//     }

//     const [addingCartProcess, setAddingCartProcess] = useState(false);

//     const handleAddtoCart = async () => {
//         setAddingCartProcess(true);
//         if (props.cartCategory === "Education") {
//             props.productData.cart_id = selectedID;
//             props.productData.user_id = userId;
//             await addEducationPro(props.productData)
//         } else if (props.cartCategory === "Lifestyle") {
//                 props.productData.cart_id = selectedID;
//                 props.productData.user_id = userId;
//                 props.productData.preId = props?.preId;
//                 if(props.productData?.provider === "bridgify"){
//                 props.productData.pageState = props?.pageState;
//                 }else if(props?.provider === "globaltix"){
//                     // console.log("globaltix provider", props)
//                     props.productData.viewStatus = props?.pageState;
//                 }else{
//                  props.productData.viewStatus = props?.pageState;
//                 }
//             await addLifestylePro(props.productData)
//         } else if (props.cartCategory === "Essential") {
//             props.productData.cart_id = selectedID;
//             props.productData.user_id = userId;
//             await addEssentialPro(props.productData)
//         } else if (props.cartCategory === "Hotel") {
//             props.productData.cart_id = selectedID;
//             props.productData.user_id = userId;
//             // props.productData.preId = props?.preId;
//             // props.productData.cartStatus = props?.pageState;
//             await addHotelPro(props.productData)
//         }else if(props.cartCategory === "transport") {
//             props.productData.cart_id = selectedID;
//             props.productData.user_id = userId;
//             console.log("transport",props.productData)
//             ToastMessage({ status: "warning", message: "error occurred while adding cart" })
//         }
//         setAddingCartProcess(false);
//     }

//     const handleDeleteConfirm = async (value) => {
//         let result = await deleteExistingCart(value);
//         if (result === "Successfull") {
//             ToastMessage({ status: "success", message: "cart deleted successfully" })
//             setOpenDeleteCart('')
//             getCartDetails()
//         }
//     };

//     useEffect(() => {
//         getCartDetails();
//     }, [userId]);

//     return (
//         <div className='p-3 p-lg-0'>

//             <div className='d-flex align-items-center border m-0 p-0'>
//                 <Input type="text" style={{ padding: '9px 20px' }} onChange={(e) => setnewCartName(e.target.value)} value={newCartName} className='form-control border-0' placeholder='Ex: My cart' />
//                 <Button className="btn btn-solid border-0 col-5" onClick={handleAddnewCart}>Create Cart</Button>
//             </div>

//             {
//                 duplicateCartNameError &&
//                 <span style={{ fontSize: 14, color: 'red' }}>The cart you entered already exists</span>
//             }

//             <div className='gap-2 mt-4 scrollBarDefault-design pe-2' style={{ height: "36vh", overflowY: ' scroll' }}>
//                 {
//                     cartDetails.length > 0 ?
//                         cartDetails.map((value, key) => (
//                             <div className='mb-2' key={key}>
//                                 <Col className={`d-flex align-items-center justify-content-between btn  ${Number(value.cart_id) === Number(selectedID) ? 'btn-solid-static-cart' : 'btn-solid-notselected-cart'} `} onClick={() => setSelectedID(value.cart_id)} >
//                                     <Label className='mb-0 cart-name ellipsis-1-lines' style={{ color: Number(value.cart_id) === Number(selectedID) ? 'white' : '', textWrap: 'auto' }}>{value.cart_title}</Label>
//                                     {
//                                         value.cart_title.toLowerCase() != 'my cart' && value.cartHolder === userId ?
//                                             <button className="btn p-0 ms-auto" style={{ borderColor: Number(value.cart_id) === Number(selectedID) ? 'inherit' : 'transparent' }} onClick={(e) => { setOpenDeleteCart(key) }}>
//                                                 <Delete sx={{ fontSize: 20, borderColor: 'inherit', color: Number(value.cart_id) === Number(selectedID) ? 'red' : '#ed4242', padding: '0px' }} />
//                                             </button>
//                                             : value.cartHolder != userId ? <ShareRounded></ShareRounded>
//                                                 : <button className="btn p-0 ms-auto" style={{ borderColor: Number(value.cart_id) === Number(selectedID) ? 'inherit' : 'transparent', color: Number(value.cart_id) === Number(selectedID) ? 'white' : 'red' }} onClick={(e) => { setOpenDeleteCart(key) }}>
//                                                     {
//                                                         value.cart_title.toLowerCase() != 'my cart'
//                                                         && <Delete sx={{ fontSize: 20, padding: '0px', borderColor: 'inherit' }} />
//                                                     }
//                                                 </button>
//                                     }
//                                 </Col>
//                                 <div style={{ display: openDeleteCart === key ? 'flex' : 'none' }} className='justify-content-start align-items-center gap-2 mt-2 px-2'>
//                                     <h6 className='m-0'>Are you sure want to delete this cart?</h6>
//                                     <button className='btn btn-sm btn-solid ms-auto' style={{ fontSize: '12px', padding: '3px 8px' }} onClick={() => handleDeleteConfirm(value.cart_id)}>Yes</button>
//                                     <button className='btn btn-sm btn-solid' style={{ fontSize: '12px', padding: '3px 8px' }} onClick={() => setOpenDeleteCart('')}>No</button>
//                                 </div>
//                             </div>
//                         )) :
//                         <div className='container d-flex flex-column align-items-center mt-5'>
//                             <h6>Oops! Sorry</h6>
//                             <p>No carts are there please add new cart.</p>
//                         </div>
//                 }
//             </div>
//             {
//                 cartDetails.length > 0 &&
//                 <div className="text-center mt-5">
//                     <Button className="btn btn-sm btn-solid" onClick={handleAddtoCart}>
//                         {addingCartProcess ? 'Processing your request' : 'Add to selected cart'}
//                     </Button>
//                 </div>
//             }
//         </div >
//     )

// }

// export default CartContainer

import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../pages/_app';
import { addEducationProduct, addEssentialNonEssentialProduct, addHotelsProduct, addLifestyleProduct, createNewCart, deleteExistingCart, getCartDataDetails } from '../../AxiosCalls/UserServices/UserCartservices';
import { Button, Col, Input, Label } from 'reactstrap';
import {Edit, Delete, ShareRounded } from '@mui/icons-material';
import ToastMessage from '../Notification/ToastMessage';
import ModalBase from '../common/Modals/ModalBase'; // Add this import
import axios from "axios";

function CartContainer(props) {
    console.log("CartContainer propsxxxxxxxxxx",props)
    const { userId, triggers, setTriggers } = useContext(AppContext);

    const [openDeleteCart, setOpenDeleteCart] = useState('');
    const [duplicateCartNameError, setDuplicateCartNameError] = useState(false);
    const [newCartName, setnewCartName] = useState('');
    const [cartDetails, setcartDetails] = useState([]);
    const [selectedID, setSelectedID] = useState('');
    const [loadingCartDetails, setLoadingCartDetails] = useState(true);
    const [searchText, setSearchText] = useState('');
    
    // NEW: State for edit cart modal
    const [editCartModal, setEditCartModal] = useState(false);
    const [editingCart, setEditingCart] = useState(null);
    const [editCartName, setEditCartName] = useState('');

    // NEW: Function to handle edit cart
    const handleEditCart = (cart) => {
        setEditingCart(cart);
        setEditCartName(cart.cart_title);
        setEditCartModal(true);
    };

    // NEW: Function to close edit modal
    const handleCloseEditModal = () => {
        setEditCartModal(false);
        setEditingCart(null);
        setEditCartName('');
    };

    // NEW: Function to save edited cart
    const handleSaveEditCart = async (e) => {
        e.preventDefault();
        
        // Check if cart name is empty
        if (!editCartName.trim()) {
            ToastMessage({ status: 'warning', message: 'Please add the cart name to save' });
            return;
        }
        
        // Check if the name is the same as the original
        if (editCartName.trim() === editingCart?.cart_title) {
            ToastMessage({ status: 'warning', message: 'Cart name is already taken. Please make changes.' });
            return;
        }
        
       try {
    const response = await axios.post(
        `edit_cart_name/${editingCart?.cart_id}`,
        {
            cart_title: editCartName,
            user_id: editingCart?.customer_id
        }
    );

    const result = response.data;

    if (result.status == 200) {
        handleCloseEditModal();
        const updatedCartDetails = cartDetails.map(cart =>
            cart.cart_id === editingCart.cart_id
                ? { ...cart, cart_title: editCartName }
                : cart
        );
        setcartDetails(updatedCartDetails);

        ToastMessage({ status: 'success', message: 'Cart Name Updated Successfully' });
    }
    else if (result.status == 409) {
        handleCloseEditModal();
        ToastMessage({ status: 'warning', message: "This cart name already exists" });
    } 
    else {
        handleCloseEditModal();
        ToastMessage({ status: 'error', message: "Can't update this cart name" });
    }

} catch (error) {
    console.log(error);
    ToastMessage({ status: 'error', message: "Something went wrong while updating cart" });
}

    };

    // Update the getCartDetails function to properly select "My Cart" by default
    const getCartDetails = async () => {
        setLoadingCartDetails(true);
        await getCartDataDetails(userId).then((result) => {
            if (result === '(Internal Server Error)') {
                ToastMessage({ status: "error", message: "Failed to load data.." })
            } else if (result === 'Something went wrong !') {
                ToastMessage({ status: "error", message: result })
            } else {
                setcartDetails(result.data.cartData);
                
                // Find "My Cart" in the returned cart data
                const defaultCart = result.data.cartData.find(cart => 
                    cart.cart_title.toLowerCase() === "my cart"
                );
                
                // If we found "My Cart" and there's no specific cart_id in props, select "My Cart"
                if (defaultCart && (!props.productData || !props.productData.cart_id)) {
                    setSelectedID(defaultCart.cart_id);
                } 
                // Otherwise if there's a cart_id in props, use that
                else if (props.productData && props.productData.cart_id) {
                    setSelectedID(props.productData.cart_id);
                }
                // If there's no "My Cart" but there are carts, select the first one
                else if (result.data.cartData.length > 0) {
                    setSelectedID(result.data.cartData[0].cart_id);
                }
            }
            setLoadingCartDetails(false);
        }).catch(() => {
            setLoadingCartDetails(false);
        });
    }

    const handleAddnewCart = async () => {
        setDuplicateCartNameError(false)
        if (newCartName === '' || newCartName === undefined || newCartName === null || newCartName === "undefined" || newCartName === "null") {
            ToastMessage({ status: "warning", message: "Please enter cart name and try again" })
        } else {
            const dataD = {
                customer_id: userId,
                cart_title: newCartName
            }
            let result = await createNewCart(dataD)
            if (result.status === 200 && result.data.status === 200) {
                getCartDetails()
                setnewCartName('')
                ToastMessage({ status: "success", message: "New Cart Has Been Created" })
            } else if (result.status === 200 && result.data.status === 400) {
                setDuplicateCartNameError(true)
            }
        }
    }

    const addEducationPro = async () => {
        let result = await addEducationProduct(props.productData)
        if (result === "Successfull") {
            props.handlePassData(true)
            ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Education products has been updated to the cart successfully" : "Education product has been added to the cart successfully" })
            setTriggers({
                ...triggers,
                customerCartTrigger: !triggers.customerCartTrigger
            })
        }
    }

    const addLifestylePro = async () => {
        let result = await addLifestyleProduct(props.productData)
        if (result === "Successfull") {
            props.handlePassData(true)
            ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Lifestyle Product has been updated to the cart successfully" : "Lifestyle product has been added to the cart successfully" })
            setTriggers({
                ...triggers,
                customerCartTrigger: !triggers.customerCartTrigger
            })
        } else if (result === 'Product already added to cart') {
            props.handlePassData('existing')
        } else {
            props.handlePassData(false)
        }
    }

    const addHotelPro = async () => {
        console.log(props?.productData,"Product Data value is XXXXXXXXX")
        let result = await addHotelsProduct(props.productData);
        if (result === "Successfull") {
            props.handlePassData(true)
            ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? "Hotel Product has been updated to the cart successfully" : "Hotel product has been added to the cart successfully" })
            setTriggers({
                ...triggers,
                customerCartTrigger: !triggers.customerCartTrigger
            })
        }else{
            props.handlePassData(false)
            ToastMessage({ status: "error", message: result })
        }
    }

    const addEssentialPro = async () => {
        let result = await addEssentialNonEssentialProduct(props.productData)
        if (result === "Successfull") {
            props.handlePassData(true)
            ToastMessage({ status: "success", message: props.productData.viewStatus === 'update' ? `${Number(props.productData.main_category_id) === 1 ? 'Essential' : 'Non-Essential'} Product has been updated to the cart successfully` : `${Number(props.productData.main_category_id) === 1 ? 'Essential' : 'Non-Essential'} product has been added to the cart successfully` })
            setTriggers({
                ...triggers,
                customerCartTrigger: !triggers.customerCartTrigger
            })
        } else if (result === "Updated") {
            props.handlePassData('Updated')
        } else {
            props.handlePassData(false)
        }
    }

    const [addingCartProcess, setAddingCartProcess] = useState(false);

    const handleAddtoCart = async () => {
        setAddingCartProcess(true);
        if (props.cartCategory === "Education") {
            props.productData.cart_id = selectedID;
            props.productData.user_id = userId;
            await addEducationPro(props.productData)
        } else if (props.cartCategory === "Lifestyle") {
            props.productData.cart_id = selectedID;
            props.productData.user_id = userId;
            props.productData.preId = props?.preId;
            if(props.productData?.provider === "bridgify"){
                props.productData.pageState = props?.pageState;
            }else if(props?.provider === "globaltix"){
                props.productData.viewStatus = props?.pageState;
            }
            await addLifestylePro(props.productData)
        } else if (props.cartCategory === "Essential") {
            props.productData.cart_id = selectedID;
            props.productData.user_id = userId;
            await addEssentialPro(props.productData)
        } else if (props.cartCategory === "Hotel") {
            props.productData.cart_id = selectedID;
            props.productData.user_id = userId;
            await addHotelPro(props.productData)
        }else if(props.cartCategory === "transport") {
            props.productData.cart_id = selectedID;
            props.productData.user_id = userId;
            console.log("transport",props.productData)
            ToastMessage({ status: "warning", message: "error occurred while adding cart" })
        }
        setAddingCartProcess(false);
    }

    const handleDeleteConfirm = async (value) => {
        let result = await deleteExistingCart(value);
        if (result === "Successfull") {
            ToastMessage({ status: "success", message: "cart deleted successfully" })
            setOpenDeleteCart('')
            getCartDetails()
        }
    };

    useEffect(() => {
        getCartDetails();
    }, [userId]);

    return (
        <div className='p-3 p-lg-0'>
            {/* Search Bar */}
            <div className='d-flex align-items-center border m-0 p-0 mb-3'>
                <Input 
                    type="text"
                    placeholder="Search cart..."
                    className='form-control border-0'
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ padding: "9px 20px" }}
                />
                {searchText && (
                    <Button 
                        className="btn btn-light border-0"
                        onClick={() => setSearchText('')}
                    >
                        X
                    </Button>
                )}
            </div>

            {/* Create New Cart */}
            <div className='d-flex align-items-center border m-0 p-0'>
                <Input 
                    type="text" 
                    style={{ padding: '9px 20px' }} 
                    onChange={(e) => setnewCartName(e.target.value)} 
                    value={newCartName} 
                    className='form-control border-0' 
                    placeholder='Ex: My cart' 
                />
                <Button className="btn btn-solid border-0 col-5" onClick={handleAddnewCart}>Create Cart</Button>
            </div>

            {duplicateCartNameError && (
                <span style={{ fontSize: 14, color: 'red' }}>The cart you entered already exists</span>
            )}

            {/* Cart List */}
            <div className='gap-2 mt-4 scrollBarDefault-design pe-2' style={{ height: "36vh", overflowY: 'scroll' }}>
                {loadingCartDetails ? (
                    <div className='d-flex justify-content-center align-items-center' style={{ height: '200px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    cartDetails.length > 0 ?
                    cartDetails
                        .filter(cart => 
                            cart.cart_title.toLowerCase().includes(searchText.toLowerCase())
                        )
                        .map((value, key) => (
                            <div className='mb-2' key={key}>
                                <Col className={`d-flex align-items-center justify-content-between btn  ${Number(value.cart_id) === Number(selectedID) ? 'btn-solid-static-cart' : 'btn-solid-notselected-cart'} `} onClick={() => setSelectedID(value.cart_id)} >
                                    <Label className='mb-0 cart-name ellipsis-1-lines' style={{ color: Number(value.cart_id) === Number(selectedID) ? 'white' : '', textWrap: 'auto' }}>
                                        {value.cart_title}
                                    </Label>
                                    {
                                        // If MY CART → no edit/delete
                                        value.cart_title.toLowerCase() === 'my cart' ? null :

                                        // If shared cart → only Share icon
                                        value.cartHolder != userId ? (
                                            <ShareRounded />
                                        ) : (
                                            // If own cart → show EDIT + DELETE
                                            <div className="d-flex align-items-center gap-2 ms-auto">
                                                {/* EDIT ICON */}
                                                <button 
                                                    className="btn p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditCart(value);
                                                    }}
                                                >
                                                    <Edit sx={{ fontSize: 20, color: Number(value.cart_id) === Number(selectedID) ? 'white' : '#ed4242' }} />
                                                </button>

                                                {/* DELETE ICON */}
                                                <button 
                                                    className="btn p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDeleteCart(key);
                                                    }}
                                                >
                                                    <Delete sx={{ fontSize: 20, color: Number(value.cart_id) === Number(selectedID) ? 'white' : '#ed4242' }} />
                                                </button>
                                            </div>
                                        )
                                    }
                                </Col>
                                <div style={{ display: openDeleteCart === key ? 'flex' : 'none' }} className='justify-content-start align-items-center gap-2 mt-2 px-2'>
                                    <h6 className='m-0'>Are you sure want to delete this cart?</h6>
                                    <button className='btn btn-sm btn-solid ms-auto' style={{ fontSize: '12px', padding: '3px 8px' }} onClick={() => handleDeleteConfirm(value.cart_id)}>Yes</button>
                                    <button className='btn btn-sm btn-solid' style={{ fontSize: '12px', padding: '3px 8px' }} onClick={() => setOpenDeleteCart('')}>No</button>
                                </div>
                            </div>
                        )) :
                        <div className='container d-flex flex-column align-items-center mt-5'>
                            <h6>Oops! Sorry</h6>
                            <p>No carts are there please add new cart.</p>
                        </div>
                )}
            </div>

            {/* Add to Cart Button */}
            {cartDetails.length > 0 && !loadingCartDetails && (
                <div className="text-center mt-5">
                    <Button className="btn btn-sm btn-solid" onClick={handleAddtoCart}>
                        {addingCartProcess ? 'Processing your request' : 'Add to selected cart'}
                    </Button>
                </div>
            )}

            {/* EDIT CART MODAL */}
            <ModalBase isOpen={editCartModal} toggle={handleCloseEditModal} title={'Edit Cart'}>
                <form className='container d-flex flex-column align-items-center' onSubmit={handleSaveEditCart}>
                    <input 
                        type="text" 
                        placeholder="Enter cart name"
                        className='form-control py-3' 
                        value={editCartName} 
                        onChange={(e) => setEditCartName(e.target.value)} 
                    />
                    <div className="d-flex gap-2 mt-3">
                        <button className='btn btn-sm btn-solid' type="submit">Save</button>
                        <button className='btn btn-sm btn-outline-secondary' type="button" onClick={handleCloseEditModal}>Cancel</button>
                    </div>
                </form>
            </ModalBase>
        </div>
    )
}

export default CartContainer