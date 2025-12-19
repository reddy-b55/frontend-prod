import React, { use, useContext, useEffect, useState } from 'react';
import { Nav, NavItem, NavLink } from "reactstrap";

import { AppContext } from '../../../_app';

import { getCartDataDetails, createNewCart } from '../../../../AxiosCalls/UserServices/UserCartservices';
import { getAcceptedCarts, getCartReq, getSentRequestsByme, getSharedCartsByMe, handleAccept, handleReject, handleStop } from '../../../../AxiosCalls/UserServices/Cartsharing';

import ToastMessage from '../../../../components/Notification/ToastMessage';
import ModalBase from '../../../../components/common/Modals/ModalBase';
import GetCartDetails from './GetCartDetails';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShareIcon from '@mui/icons-material/Share';
import { Button, Col, Input, Label } from 'reactstrap';
import { getCartData } from '../../../../AxiosCalls/UserServices/userServices';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

function MyCarts() {
    const { userId, triggers, setTriggers, baseUserId } = useContext(AppContext);

    const [activeTab, setActiveTab] = useState("1");

    const [customerCartData, setCustomerCartData] = useState([]);
    const [mySharedCarts, setMySharedCarts] = useState([]);
    const [acceptedCarts, setAcceptedCarts] = useState([]);
    const [incomingReq, setIncomingReq] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [newCartName, setnewCartName] = useState('');
    const [cartRegistrationModel, setCartRegistrationModel] = useState(false);
    const [duplicateCartNameError, setDuplicateCartNameError] = useState(false);

    // Add state for cart item counts
    const [cartItemCounts, setCartItemCounts] = useState({});

 const calculateCartItemCounts = (cartList) => {
    const counts = {};

    cartList.forEach(cart => {
        // If API gives count, use it
        if (cart.count !== undefined) {
            counts[cart.cart_id] = cart.count;
        } else {
            // fallback for normal carts
            const items = cartData.filter(item => item.cart_id === cart.cart_id);
            counts[cart.cart_id] = items.length;
        }
    });

    setCartItemCounts(counts);
};


    // Function to get item count for a specific cart
    const getCartItemCount = (cartId) => {
        return cartItemCounts[cartId] || 0;
    };

    const getMyCarts = async () => {
        let response = await getCartDataDetails(userId);
        console.log("My Cart Data", response);
        setCustomerCartData(response.data);
        // Calculate item counts when cart data is loaded
        if (response.data && response.data.cartData) {
            calculateCartItemCounts(response.data.cartData);
        }
    }

    const getSharedCarts = async () => {
        let response = await getSharedCartsByMe(userId);
        setMySharedCarts(response);
        calculateCartItemCounts(response);
    }

    const getAcceptedCars = async () => {
        let response = await getAcceptedCarts(userId);
        setAcceptedCarts(response);
        calculateCartItemCounts(response);
    }

    const getIncomingRequests = async () => {
  let response = await getCartReq(userId);
  console.log("🟢 Incoming Requests API Response:", response);

  setIncomingReq(response);
  calculateCartItemCounts(response);
};


    const getSentRequests = async () => {
        let response = await getSentRequestsByme(userId);
        setSentRequests(response);
        calculateCartItemCounts(response);
    }

    const [handleRejectionStatus, sethandleRejectionStatus] = useState({
        status: false,
        value: ''
    })

    const handleRejectCart = async (value) => {
        sethandleRejectionStatus({
            status: true,
            value: value
        })
    }

    const handleRejectCartCancel = async () => {
        sethandleRejectionStatus({
            status: false,
            value: ''
        })
        sethandlAcceptStatus({
            status: false,
            value: ''
        })
    }

    const handleRejectOkay = async () => {
        await handleReject(handleRejectionStatus.value).then(async () => {
            ToastMessage({ status: 'success', message: 'Cart reject successfully.' })
            await handleRejectCartCancel();
            await getCartDetails();
        })
    }

    const [handlAcceptStatus, sethandlAcceptStatus] = useState({
        status: false,
        value: ''
    })

    const handleAcceptCart = async (value) => {
        sethandlAcceptStatus({
            status: true,
            value: value
        })
    }

    const handleAcceptCancel = async () => {
        sethandlAcceptStatus({
            status: false,
            value: ''
        })
    }

    const handleAcceptCartOkay = async () => {
        await handleAccept(handlAcceptStatus.value);
        ToastMessage({ status: 'success', message: 'Cart accept successfully.' })
        await getCartDetails();
        await handleAcceptCancel();
    }

    const [stopSharingCartStatus, setStopSharingCartStatus] = useState({
        status: false,
        value: ''
    })

    const handleStopSharing = async (cartID) => {
        setStopSharingCartStatus({
            status: true,
            value: cartID
        })
    }

    const handleStopSharingCancel = async () => {
        setStopSharingCartStatus({
            status: false,
            value: ''
        })
    }

    const handleStopSharingCart = async () => {
        await handleStop(stopSharingCartStatus.value);
        ToastMessage({ status: 'success', message: 'Cart reject successfully.' })
        await getCartDetails();
        await handleStopSharingCancel();
    }

    const getCartDetails = async () => {
        if (activeTab.toString() === "1") {
            getMyCarts();
        } else if (activeTab.toString() === "2") {
            getSharedCarts();
        } else if (activeTab.toString() === "3") {
            getAcceptedCars();
        } else if (activeTab.toString() === "4") {
            getIncomingRequests();
        } else if (activeTab.toString() === "5") {
            getSentRequests();
        }
        setTriggers({
            ...triggers,
            customerCartTrigger: !triggers.customerCartTrigger
        });
    }

    const [cartData, setCartData] = useState([]);

    useEffect(() => {
        getCartDetails();
    }, [activeTab]);

    useEffect(() => {
        getUserCardDataDetails()
    }, [])

    const getUserCardDataDetails = async () => {
        await getCartData(userId).then((result) => {
            setCartData(result.cartData || []);
        });
    };

    // Update cart item counts when cartData changes
    useEffect(() => {
        if (activeTab.toString() === "1" && customerCartData.cartData) {
            calculateCartItemCounts(customerCartData.cartData);
        }
    }, [cartData, customerCartData]);

    const handleCartAdd = () => {
        setCartRegistrationModel(!cartRegistrationModel);
        setnewCartName('');
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
                setnewCartName('')
                getMyCarts()
                handleCartAdd()
                ToastMessage({ status: "success", message: "New Cart Has Been Created" })
            } else if (result.status === 200 && result.data.status === 400) {
                setDuplicateCartNameError(true)
            }
        }
    }

    const removeCart = (cartID) => {  
        const updatedCartData = customerCartData.cartData.filter(cart => cart.cart_id !== cartID);
        setCustomerCartData({ ...customerCartData, cartData: updatedCartData });
    }

    // Enhanced GetCartDetails component with item count display
    const EnhancedGetCartDetails = ({ cartData, currentCart, cartsharing, removeCart, cartProducts, shareCart, sharedCarts, handleStopSharing, handleRejectCart, acceptedCarts, incomingReq, handleAcceptCart, sentRequests }) => {
        const itemCount = getCartItemCount(currentCart.cart_id);
        
        return (
            <div className="w-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex flex-column">
                       
                        <small className="text-muted" style={{ fontSize: '12px' }}>
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </small>
                    </div>
                    {shareCart && (
                        <div 
                            style={{ 
                                cursor: 'pointer',
                                color: '#666',
                                borderRadius: '50%',
                                padding: '5px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <PeopleAltIcon style={{ fontSize: '18px' }} />
                        </div>
                    )}
                </div>
                <GetCartDetails 
                    cartData={cartData} 
                    currentCart={currentCart} 
                    cartsharing={cartsharing} 
                    removeCart={removeCart} 
                    cartProducts={cartProducts}
                    shareCart={shareCart}
                    sharedCarts={sharedCarts}
                    handleStopSharing={handleStopSharing}
                    handleRejectCart={handleRejectCart}
                    acceptedCarts={acceptedCarts}
                    incomingReq={incomingReq}
                    handleAcceptCart={handleAcceptCart}
                    sentRequests={sentRequests}
                />
            </div>
        );
    };

    return (
        <section className="tab-product m-0 mb-5 px-sm-0 container-fluid mx-auto">

            <Nav tabs className="nav-material d-flex justify-content-start border-bottom-0 gap-2 gap-md-4 mb-3 mb-lg-5 flex-wrap">

                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                    <NavLink style={{ fontSize: '13px', padding: '8px 12px' }} className={`${activeTab === "1" ? "active" : ""} text-nowrap`} onClick={() => setActiveTab("1")}>My carts</NavLink>
                </NavItem>

                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                    <NavLink style={{ fontSize: '13px', padding: '8px 12px' }} className={`${activeTab === "2" ? "active" : ""} text-nowrap`} onClick={() => setActiveTab("2")}>Shared carts</NavLink>
                </NavItem>

                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                    <NavLink style={{ fontSize: '13px', padding: '8px 12px' }} className={`${activeTab === "3" ? "active" : ""} text-nowrap`} onClick={() => setActiveTab("3")}>Accepted carts</NavLink>
                </NavItem>

                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                    <NavLink style={{ fontSize: '13px', padding: '8px 12px' }} className={`${activeTab === "4" ? "active" : ""} text-nowrap`} handleAcceptCart={handleAcceptCart} onClick={() => setActiveTab("4")}>Incoming requests</NavLink>
                </NavItem>

                <NavItem className="nav nav-tabs" id="myTab" role="tablist">
                    <NavLink style={{ fontSize: '13px', padding: '8px 12px' }} className={`${activeTab === "5" ? "active" : ""} text-nowrap`} onClick={() => setActiveTab("5")}>Sent requests</NavLink>
                </NavItem>

            </Nav>

            <div className='container-fluid d-flex flex-column flex-md-row flex-wrap justify-content-start align-items-stretch m-0 p-0 gap-3'>
                {activeTab === "1" && (
                    <div className="d-flex justify-content-end mb-3 w-100">
                        <button className="btn btn-solid border-0 d-flex align-items-center gap-2" onClick={() => {handleCartAdd()}}>
                            <AddShoppingCartIcon style={{ fontSize: '18px' }}/>
                            <span className="d-none d-sm-inline">Add Cart</span>
                        </button>
                    </div>
                )}
                {
                    activeTab === "1" ?
                        customerCartData.length === 0 ?
                            <div className='border p-3 rounded-3 w-100'>
                                <h6 className='m-0 p-0 text-center'>No carts is there kindly add product into cart</h6>
                            </div> :
                            customerCartData.cartData?.map((value, key) => (
                                value.cartHolder === baseUserId.cxid ?
                                <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                    <EnhancedGetCartDetails 
                                        cartData={customerCartData.cartData} 
                                        currentCart={value} 
                                        cartsharing={true} 
                                        removeCart={removeCart} 
                                        cartProducts={cartData} 
                                    />
                                </div>
                                : value.cartHolder !== baseUserId.cxid &&
                                <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px', backgroundColor: '#eeebebff', position: 'relative' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                    <EnhancedGetCartDetails 
                                        cartData={customerCartData.cartData} 
                                        currentCart={value} 
                                        cartsharing={true} 
                                        removeCart={removeCart} 
                                        cartProducts={cartData} 
                                        shareCart={true} 
                                    />
                                </div>
                            ))

                        : activeTab === "2" ?
                            mySharedCarts.length === 0 ?
                                <div className='border p-3 rounded-3 w-100'>
                                    <h6 className='m-0 p-0 text-center'>No carts being shared currently</h6>
                                </div> :
                                mySharedCarts.map((value, key) => (
                                    <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                        <EnhancedGetCartDetails 
                                            cartData={customerCartData.cartData} 
                                            currentCart={value} 
                                            sharedCarts={true} 
                                            handleStopSharing={handleStopSharing} 
                                            handleRejectCart={handleRejectCart} 
                                            cartProducts={cartData}
                                        />
                                    </div>
                                ))

                            : activeTab === "3" ?
                                acceptedCarts.length === 0 ?
                                    <div className='border p-3 rounded-3 w-100'>
                                        <h6 className='m-0 p-0 text-center'>No carts has been shared with you currently</h6>
                                    </div> :
                                    acceptedCarts.map((value, key) => (
                                        <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                            <EnhancedGetCartDetails 
                                                cartData={customerCartData.cartData} 
                                                currentCart={value} 
                                                acceptedCarts={true} 
                                                handleRejectCart={handleRejectCart} 
                                                handleStopSharing={handleStopSharing} 
                                                cartProducts={cartData} 
                                            />
                                        </div>
                                    ))

                                : activeTab === "4" ?
                                    incomingReq.length === 0 ?
                                        <div className='border p-3 rounded-3 w-100'>
                                            <h6 className='m-0 p-0 text-center'>No incoming requests currently</h6>
                                        </div> :
                                        incomingReq.map((value, key) => (
                                            <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                                <EnhancedGetCartDetails 
                                                    cartData={customerCartData.cartData} 
                                                    currentCart={value} 
                                                    incomingReq={true} 
                                                    handleAcceptCart={handleAcceptCart} 
                                                    handleRejectCart={handleRejectCart} 
                                                    cartProducts={cartData}
                                                />
                                            </div>
                                        ))

                                    : activeTab === "5" ?
                                        sentRequests.length === 0 ?
                                            <div className='border p-3 rounded-3 w-100'>
                                                <h6 className='m-0 p-0 text-center'>No sent requests currently</h6>
                                            </div> :
                                            sentRequests.map((value, key) => (
                                                <div style={{ width: '100%', maxWidth: '400px', margin: '0px 0px 15px 0px' }} className='border px-3 px-md-4 py-3 rounded-3' key={key}>
                                                    <EnhancedGetCartDetails 
                                                        cartData={customerCartData.cartData} 
                                                        currentCart={value} 
                                                        sentRequests={true} 
                                                        handleRejectCart={handleRejectCart} 
                                                        cartProducts={cartData}
                                                    />
                                                </div>
                                            ))
                                        : null
                }
            </div>

            {/* Your existing modals remain the same */}
            <ModalBase isOpen={handleRejectionStatus.status} toggle={handleRejectCartCancel} centered title={'Do you want to cancel this cart?'}>
                <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleRejectOkay()}>Yes</button>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleRejectCartCancel()}>No</button>
                </div>
            </ModalBase>

            <ModalBase isOpen={handlAcceptStatus.status} toggle={handleAcceptCancel} centered title={'Do you want to accept this cart?'}>
                <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleAcceptCartOkay()}>Yes</button>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleRejectCartCancel()}>No</button>
                </div>
            </ModalBase>

            <ModalBase isOpen={stopSharingCartStatus.status} toggle={handleStopSharingCancel} centered title={'Do you want to stop sharing this cart?'}>
                <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleStopSharingCart()}>Yes</button>
                    <button className='btn btn-sm btn-solid px-4' onClick={() => handleStopSharingCancel()}>No</button>
                </div>
            </ModalBase>

            <ModalBase isOpen={cartRegistrationModel} toggle={handleCartAdd} centered title={'Add new cart'}>
                <div className='d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3'>
                    <Input type="text" style={{ padding: '9px 20px' }} onChange={(e) => setnewCartName(e.target.value)} value={newCartName} className='form-control border-0' placeholder='Ex: My cart' />
                    <Button className="btn btn-solid border-0 col-12 col-sm-5" onClick={()=>handleAddnewCart()}>Add Cart</Button>
                </div>
                {
                    duplicateCartNameError &&
                    <span style={{ fontSize: 14, color: 'red' }}>The cart you entered already exists</span>
                }
            </ModalBase>

        </section>
    )
}

export default MyCarts;