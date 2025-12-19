import axios from 'axios';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { Container, Media, Input } from "reactstrap";
import { Delete, Edit, Search } from '@mui/icons-material';

import { AppContext } from '../../../_app';

import { addPerson, editPerson, getPerson } from '../../../../AxiosCalls/UserServices/peopleFormServices';
import ModalBase from '../../../../components/common/Modals/ModalBase';
import ToastMessage from '../../../../components/Notification/ToastMessage';
import TravelBuddiesModal from '../../../../components/common/TravelBuddies/TravelBuddiesModal';

const TravelBuddies = () => {

    const { userId, userStatus, baseUserId } = useContext(AppContext);

    const [modalOpen, setModalOpen] = useState(false)
    const [deletingPerson, setDeletingPerson] = useState(false);

    const [currentState, setCurrentState] = useState("")
    const [selectedPaxData, setSelectedPaxData] = useState([]);

    const [adultDetails, setAdultDetails] = useState([]);
    const [childDetails, setChildDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredAdultDetails, setFilteredAdultDetails] = useState([]);
    const [filteredChildDetails, setFilteredChildDetails] = useState([]);

    const handleAddBuddies = (val) => {
        setModalOpen(!modalOpen)
        setSelectedPaxData([])
        setCurrentState("Add")
    }

    const handleSubmitBuddies = async (value) => {
        value["UserID"] = baseUserId.cxid
        if (currentState === "Add") {
            addPerson(value).then(async (response) => {
                ToastMessage({ status: "success", message: "Travel Buddy Added Successfully" })
                await getPersonData()
            })
        } else {
            editPerson(value, value?.id).then(async (response) => {
                ToastMessage({ status: "success", message: "Travel Buddy Updated Successfully" })
                await getPersonData()
            })
        }
    }

    const visualizeData = (response) => {
        let adultDetails = response.filter((value) => {
            return value.PaxType === "1"
        })
        let childDetails = response.filter((value) => {
            return value.PaxType === "2"
        })
        setAdultDetails(adultDetails);
        setChildDetails(childDetails);
        setFilteredAdultDetails(adultDetails);
        setFilteredChildDetails(childDetails);
    }

    const handleUpdateClick = (val) => {
        console.log("travel edit data", val)
        setModalOpen(!modalOpen)
        setCurrentState("edit")
        setSelectedPaxData(val)
    }

    const [deleteStatus, setDeleteStatus] = useState({
        status: false,
        value: ''
    })

    const handleDelete = async (value) => {
        setDeleteStatus({
            status: true,
            value: value.id
        })
    };

    const handleClear = () => {
        setDeleteStatus({
            status: false,
            value: ''
        })
        setDeletingPerson(false);
    }

    const deleteData = async () => {
        setDeletingPerson(true);
        await axios.get(`/delete_passenger_details_by_id/${deleteStatus.value}`).then(async (response) => {
            if (response.data.status === 200) {
                ToastMessage({ status: "success", message: "Travel Buddy Deleted" })
            } else {
                ToastMessage({ status: "error", message: "Error While Deleting Person" })
            }
            await getPersonData();
            handleClear()
        }).catch(error => {
            ToastMessage({ status: "error", message: "Network Error" })
        });
    }

    const getPersonData = async () => {
        await getPerson(baseUserId.cxid).then(res => {
            visualizeData(res)
        })
    }

    // const handleSearch = (e) => {
    //     const searchValue = e.target.value.toLowerCase();
    //     setSearchTerm(searchValue);
    //     console.log("adultDetails", adultDetails)
    //     if (searchValue.trim() === '') {
    //         setFilteredAdultDetails(adultDetails);
    //         setFilteredChildDetails(childDetails);
    //     } else {
    //         const filteredAdults = adultDetails.filter(person => 
    //             (person.FirstName?.toLowerCase().includes(searchValue) || 
    //              person.LastName?.toLowerCase().includes(searchValue) ||
    //              person.MiddleName?.toLowerCase().includes(searchValue) ||
    //              person.Title?.toLowerCase().includes(searchValue) ||
    //              person.Email?.toLowerCase().includes(searchValue))
    //         );

    //         const filteredChildren = childDetails.filter(person => 
    //             (person.FirstName?.toLowerCase().includes(searchValue) || 
    //              person.LastName?.toLowerCase().includes(searchValue) ||
    //              person.MiddleName?.toLowerCase().includes(searchValue) ||
    //              person.Title?.toLowerCase().includes(searchValue) ||
    //              person.Email?.toLowerCase().includes(searchValue))
    //         );

    //         setFilteredAdultDetails(filteredAdults);
    //         setFilteredChildDetails(filteredChildren);
    //     }
    // }
    const handleSearch = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue.trim() === '') {
            setFilteredAdultDetails(adultDetails);
            setFilteredChildDetails(childDetails);
        } else {
            // Split search terms by space to handle multiple words
            const searchTerms = searchValue.trim().split(/\s+/);

            const filteredAdults = adultDetails.filter(person => {
                return searchTerms.every(term =>
                (person.FirstName?.toLowerCase().includes(term) ||
                    person.LastName?.toLowerCase().includes(term) ||
                    person.MiddleName?.toLowerCase().includes(term) ||
                    person.Title?.toLowerCase().includes(term) ||
                    person.Email?.toLowerCase().includes(term))
                );
            });

            const filteredChildren = childDetails.filter(person => {
                return searchTerms.every(term =>
                (person.FirstName?.toLowerCase().includes(term) ||
                    person.LastName?.toLowerCase().includes(term) ||
                    person.MiddleName?.toLowerCase().includes(term) ||
                    person.Title?.toLowerCase().includes(term) ||
                    person.Email?.toLowerCase().includes(term))
                );
            });

            setFilteredAdultDetails(filteredAdults);
            setFilteredChildDetails(filteredChildren);
        }
    }

    useEffect(() => {
        getPersonData()
    }, [baseUserId.cxid]);

    const [handleDeleteAllModel, setHandleDeleteAllModel] = useState(false);

    const handleDeleteAll = () => {
        setHandleDeleteAllModel(!handleDeleteAllModel)
    }

    const handleDeleteAllAdult = async (userId, passengerType) => {
        try {
            const response = await axios.delete(`delete_passengers_by_category/${userId}/${passengerType}`);
            console.log('Delete response:', response.data);

            if (response.data.status === 200) {
                console.log(`Deleted ${passengerType} successfully:`, response.data.message);
                ToastMessage({ status: "success", message: `${passengerType} travel buddies deleted successfully` });
                handleDeleteAll();
                getPersonData();
            } else if(response.data.status === 404) {
                ToastMessage({ status: "error", message: response.data.message });
                // return response.data;
            } else {
                console.warn(`Delete ${passengerType} failed:`, response.data.message);
                ToastMessage({ status: "error", message: `Error while deleting ${passengerType}` });
                return response.data;
            }
        } catch (error) {
            console.error(`Error deleting ${passengerType} passengers:`, error);
        }
    }

        return (
            <>
                {
                    userStatus.userLoggesIn ?
                        <>
                            <TravelBuddiesModal isOpen={modalOpen} toggle={handleAddBuddies} onSubmit={handleSubmitBuddies} dataSet={selectedPaxData} status={currentState}></TravelBuddiesModal>
                            <section className="section-b-space blog-detail-page review-page my-lg-5"  style={{ minHeight: "90vh" }}>
                                <Container>
                                    {
                                        adultDetails.length === 0 && childDetails.length === 0 ?
                                            <div className="col-sm-12 empty-cart-cls mt-5 text-center">
                                                <h4 style={{ fontWeight: '600' }}>Oops! No Travel Buddies</h4>
                                                <h4 className='my-3 mb-4'>Add some travel buddies to manage your bookings quickly</h4>
                                                <button className="btn btn-sm btn-solid" type="submit" onClick={handleAddBuddies}>Add Travel Buddies</button>
                                            </div> :
                                            <>
                                                <div className="search-bar-container mb-3">
    <div className="search-input-wrapper d-flex align-items-center border p-2 rounded">
        <Search className="me-2" style={{ color: '#666' }} />
        <Input
            type="text"
            placeholder="Search travel buddies..."
            value={searchTerm}
            onChange={handleSearch}
            className="border-0 flex-grow-1"
            style={{ outline: 'none', boxShadow: 'none' }}
        />
        {searchTerm && (
            <button
                type="button"
                className="btn btn-link p-0 ms-2 d-flex align-items-center justify-content-center"
                onClick={() => {
                    setSearchTerm('')
                    handleSearch({ target: { value: '' } })
                }} // You'll need to add this function or update your existing one
                style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '16px',
                    color: '#ff0000ff',
                    textDecoration: 'none',
                    border: 'none',
                    background: 'none'
                }}
                title="Clear search"
            >
                ×
            </button>
        )}
    </div>
</div>
                                                <button className='btn btn-sm btn-solid mb-3' onClick={handleAddBuddies}>Add more</button>
                                                {!searchTerm && (
                                                    <button style={{ marginLeft: "2%" }} className='btn btn-sm btn-solid mb-3' onClick={handleDeleteAll}>Delete Travel Buddies</button>
                                                )}
                                            </>
                                    }

                                    {
                                        filteredAdultDetails.length > 0 &&
                                        <>
                                            <h6>{filteredAdultDetails.length === 1 ? 'Adult' : 'Adults'}</h6>
                                            <div className='d-flex flex-wrap justify-content-start justify-content-md-start gap-1'>
                                                {
                                                    filteredAdultDetails.map((data) => (
                                                        <div className="border d-flex align-items-center mb-3 px-lg-3 pe-lg-4 py-3 col-lg-4 col-md-6 col-12 pe-4 pe-lg-0 travel-buddies-container" key={data.id}>
                                                            <Media src={"/assets/images/travellerIcon.png"} alt="Generic placeholder image" className='m-0 p-0' style={{ width: 50, height: 50 }} />
                                                            <div className='px-lg-3 col-8'>
                                                                <h5 className='m-0 p-0 mb-2 ellipsis-1-lines' style={{ fontWeight: '500' }}>
                                                                    {/* {data?.Title}.  {data?.FirstName} {data?.MiddleName} {data?.LastName}
                                                                   {data?.Email?.substring(0, 20)}{data?.Email?.length > 20 ? '...' : ''} */}
                                                                    {((data?.Title || '') + ' ' + (data?.FirstName || '') + ' ' + (data?.MiddleName || '') + ' ' + (data?.LastName || '')).trim().substring(0, 20)}
                                                                </h5>
                                                                <p className='m-0 mb-2 p-0 ellipsis-1-lines' style={{ lineHeight: '18px' }}>{data?.Email}</p>
                                                            </div>
                                                            <li className='d-flex flex-row flex-lg-row gap-2 align-items-center justify-content-end ms-auto'>
                                                                <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleUpdateClick(data)} ><Edit style={{ fontSize: '18px' }} /></button>
                                                                <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleDelete(data)} ><Delete style={{ fontSize: '18px' }} /></button>
                                                            </li>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    }

                                    {
                                        filteredChildDetails.length > 0 &&
                                        <>
                                            <h6>{filteredChildDetails.length === 1 ? 'Child' : 'Children'}</h6>
                                            <div className='d-flex flex-wrap justify-content-start justify-content-md-start gap-1'>
                                                {
                                                    filteredChildDetails.map((data) => (
                                                        <div className="border d-flex align-items-center mb-3 px-lg-3 pe-lg-4 py-3 col-lg-4 col-md-6 col-12 pe-3 pe-lg-0 travel-buddies-container" key={data.id}>
                                                            <Media src={"/assets/images/childIcon.png"} alt="Generic placeholder image" className='m-0 p-0' style={{ width: 50, height: 50 }} />
                                                            <div className='px-lg-3 col-8'>
                                                                <h5 className='m-0 p-0 mb-2 ellipsis-1-lines' style={{ fontWeight: '500' }}>
                                                                    {/* {data?.Title}.  {data?.FirstName} {data?.MiddleName} {data?.LastName} */}
                                                                    {((data?.Title || '') + ' ' + (data?.FirstName || '') + ' ' + (data?.MiddleName || '') + ' ' + (data?.LastName || '')).trim().substring(0, 20)}
                                                                </h5>
                                                                <p className='m-0 mb-2 p-0 ellipsis-1-lines' style={{ lineHeight: '18px' }}>{data?.Email}</p>
                                                            </div>
                                                            <li className='d-flex flex-row flex-lg-row gap-2 align-items-center justify-content-end ms-auto'>
                                                                <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleUpdateClick(data)} ><Edit style={{ fontSize: '18px' }} /></button>
                                                                <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleDelete(data)} ><Delete style={{ fontSize: '18px' }} /></button>
                                                            </li>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </>
                                    }

                                    {
                                        adultDetails.length > 0 && childDetails.length > 0 &&
                                        filteredAdultDetails.length === 0 && filteredChildDetails.length === 0 &&
                                        <div className="text-center my-4">
                                            <h5>No travel buddies match your search for "{searchTerm}"</h5>
                                        </div>
                                    }

                                </Container>
                            </section>
                        </>
                        :
                        <div className='d-flex flex-column align-items-center justify-content-start p-5 my-5'>
                            <h2>Oops! something went wrong..</h2>
                            <h5>To continue, please log in to your account. This helps us provide a personalized experience and keep your information secure.</h5>
                            <Link href='/page/account/login-auth/' className='btn btn-solid btn-sm mt-4'>Login / Register</Link>
                        </div>

                }
                <ModalBase isOpen={deleteStatus.status} toggle={handleClear} title={'Delete travel buddies'}>
                    <div className='d-flex flex-column align-items-center'>
                        <h6 className='text-center'>Are you sure you want to delete the travel buddy?</h6>
                        <div className='d-flex align-items-center gap-3 mt-3'>
                            <button className='btn btn-sm btn-solid' onClick={deleteData}>{deletingPerson ? 'please wait' : "Yes"} </button>
                            <button className='btn btn-sm btn-solid' onClick={handleClear}>No</button>
                        </div>
                    </div>
                </ModalBase>

                <ModalBase isOpen={handleDeleteAllModel} toggle={handleDeleteAll} title={'Delete travel buddies'}>
                    <div className='d-flex flex-column align-items-center'>
                        <h6 className='text-center'>Are you sure to delete the all travel buddies ?</h6>
                        <div className='d-flex align-items-center gap-3 mt-3'>
                            <button className='btn btn-sm btn-solid' onClick={() => { handleDeleteAllAdult(userId, "adult") }}>Delete All Adults</button>
                            <button className='btn btn-sm btn-solid' onClick={() => { handleDeleteAllAdult(userId, "child") }}>Delete All Child</button>
                        </div>
                    </div>
                </ModalBase>
            </>
        )
    }

    export default TravelBuddies;

// import axios from 'axios';
// import Link from 'next/link';
// import React, { useContext, useEffect, useState } from 'react';
// import { Container, Media } from "reactstrap";
// import { Delete, Edit } from '@mui/icons-material';

// import { AppContext } from '../../../_app';

// import { addPerson, editPerson, getPerson } from '../../../../AxiosCalls/UserServices/peopleFormServices';
// import ModalBase from '../../../../components/common/Modals/ModalBase';
// import ToastMessage from '../../../../components/Notification/ToastMessage';
// import TravelBuddiesModal from '../../../../components/common/TravelBuddies/TravelBuddiesModal';

// const TravelBuddies = () => {

//     const { userStatus, baseUserId } = useContext(AppContext);

//     const [modalOpen, setModalOpen] = useState(false)
//     const [deletingPerson, setDeletingPerson] = useState(false);

//     const [currentState, setCurrentState] = useState("")
//     const [selectedPaxData, setSelectedPaxData] = useState([]);

//     const [adultDetails, setAdultDetails] = useState([]);
//     const [childDetails, setChildDetails] = useState([]);

//     const handleAddBuddies = (val) => {
//         setModalOpen(!modalOpen)
//         setSelectedPaxData([])
//         setCurrentState("Add")
//     }

//     const handleSubmitBuddies = async (value) => {
//         value["UserID"] = baseUserId.cxid
//         if (currentState === "Add") {
//             addPerson(value).then(async (response) => {
//                 ToastMessage({ status: "success", message: "Travel Buddy Saved Successfully" })
//                 await getPersonData()
//             })
//         } else {
//             editPerson(value, value?.id).then(async (response) => {
//                 ToastMessage({ status: "success", message: "Travel Buddy Updated Successfully" })
//                 await getPersonData()
//             })
//         }
//     }

//     const visualizeData = (response) => {
//         let adultDetails = response.filter((value) => {
//             return value.PaxType === "1"
//         })
//         let childDetails = response.filter((value) => {
//             return value.PaxType === "2"
//         })
//         setAdultDetails(adultDetails);
//         setChildDetails(childDetails);
//     }

//     const handleUpdateClick = (val) => {
//         console.log("travel edit data", val)
//         setModalOpen(!modalOpen)
//         setCurrentState("Update")
//         setSelectedPaxData(val)
//     }

//     const [deleteStatus, setDeleteStatus] = useState({
//         status: false,
//         value: ''
//     })

//     const handleDelete = async (value) => {
//         setDeleteStatus({
//             status: true,
//             value: value.id
//         })
//     };

//     const handleClear = () => {
//         setDeleteStatus({
//             status: false,
//             value: ''
//         })
//         setDeletingPerson(false);
//     }


//     const deleteData = async () => {
//         setDeletingPerson(true);
//         await axios.get(`/delete_passenger_details_by_id/${deleteStatus.value}`).then(async (response) => {
//             if (response.data.status === 200) {
//                 ToastMessage({ status: "success", message: "Travel buddy deleteed successfully" })
//             } else {
//                 ToastMessage({ status: "error", message: "Error While Deleting Person" })
//             }
//             await getPersonData();
//             handleClear()
//         }).catch(error => {
//             ToastMessage({ status: "error", message: "Network Error" })
//         });
//     }

//     const getPersonData = async () => {
//         await getPerson(baseUserId.cxid).then(res => {
//             visualizeData(res)
//         })
//     }

//     useEffect(() => {
//         getPersonData()
//     }, [baseUserId.cxid]);

//     return (
//         <>
//             {
//                 userStatus.userLoggesIn ?
//                     <>
//                         <TravelBuddiesModal isOpen={modalOpen} toggle={handleAddBuddies} onSubmit={handleSubmitBuddies} dataSet={selectedPaxData}></TravelBuddiesModal>
//                         <section className="section-b-space blog-detail-page review-page my-lg-5">
//                             <Container>

//                                 {
//                                     adultDetails.length == 0 && childDetails.length == 0 ?
//                                         <div className="col-sm-12 empty-cart-cls mt-5 text-center">
//                                             <h4 style={{ fontWeight: '600' }}>Oops! No Travel Buddies</h4>
//                                             <h4 className='my-3 mb-4'>Add some travel buddies to manage your bookings fastly</h4>
//                                             <button className="btn btn-sm btn-solid" type="submit" onClick={handleAddBuddies}>Add Buddies</button>
//                                         </div> :
//                                         <button className='btn btn-sm btn-solid mb-3' onClick={handleAddBuddies}>Add more</button>
//                                 }

//                                 {
//                                     adultDetails.length > 0 &&
//                                     <>
//                                         <h6>{adultDetails.length == "1" ? 'Adult' : 'Adults'}</h6>
//                                         <div className='d-flex flex-wrap justify-content-start justify-content-md-start gap-1'>
//                                             {
//                                                 adultDetails.map((data) => (
//                                                     <div className="border d-flex align-items-center mb-3 px-lg-3 pe-lg-4 py-3 col-lg-4 col-md-6 col-12 pe-4 pe-lg-0 travel-buddies-container">
//                                                         <Media src={"/assets/images/travellerIcon.png"} alt="Generic placeholder image" className='m-0 p-0' style={{ width: 50, height: 50 }} />
//                                                         <div className='px-lg-3 col-8'>
//                                                             <h5 className='m-0 p-0 mb-2 ellipsis-1-lines' style={{ fontWeight: '500' }}>{data?.Title}.  {data?.FirstName} {data?.MiddleName} {data?.LastName}</h5>
//                                                             <p className='m-0 mb-2 p-0 ellipsis-1-lines' style={{ lineHeight: '18px' }}>{data?.Email}</p>
//                                                         </div>
//                                                         <li className='d-flex flex-row flex-lg-row gap-2 align-items-center justify-content-end ms-auto'>
//                                                             <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleUpdateClick(data)} ><Edit style={{ fontSize: '18px' }} /></button>
//                                                             <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleDelete(data)} ><Delete style={{ fontSize: '18px' }} /></button>
//                                                         </li>
//                                                     </div>
//                                                 ))
//                                             }
//                                         </div>
//                                     </>
//                                 }

//                                 {
//                                     childDetails.length > 0 &&
//                                     <>
//                                         <h6>{childDetails.length == "1" ? 'Child' : 'Children'}</h6>
//                                         <div className='d-flex flex-wrap justify-content-start justify-content-md-start gap-1'>
//                                             {
//                                                 childDetails.map((data) => (
//                                                     <div className="border d-flex align-items-center mb-3 px-lg-3 pe-lg-4 py-3 col-lg-4 col-md-6 col-12 pe-3 pe-lg-0 travel-buddies-container">
//                                                         <Media src={"/assets/images/travellerIcon.png"} alt="Generic placeholder image" className='m-0 p-0' style={{ width: 50, height: 50 }} />
//                                                         <div className='px-lg-3 col-8'>
//                                                             <h5 className='m-0 p-0 mb-2 ellipsis-1-lines' style={{ fontWeight: '500' }}>{data?.Title}.  {data?.FirstName} {data?.MiddleName} {data?.LastName}</h5>
//                                                             <p className='m-0 mb-2 p-0 ellipsis-1-lines' style={{ lineHeight: '18px' }}>{data?.Email}</p>
//                                                         </div>
//                                                         <li className='d-flex flex-row flex-lg-row gap-2 align-items-center justify-content-end ms-auto'>
//                                                             <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleUpdateClick(data)} ><Edit style={{ fontSize: '18px' }} /></button>
//                                                             <button className="btn btn-sm btn-solid btn-small-button rounded-2" onClick={() => handleDelete(data)} ><Delete style={{ fontSize: '18px' }} /></button>
//                                                         </li>
//                                                     </div>
//                                                 ))
//                                             }
//                                         </div>
//                                     </>
//                                 }


//                             </Container>
//                         </section>
//                     </>
//                     :
//                     <div className='d-flex flex-column align-items-center justify-content-start p-5 my-5'>
//                         <h2>Oops! something went wrong..</h2>
//                         <h5>To continue, please log in to your account. This helps us provide a personalized experience and keep your information secure.</h5>
//                         <Link href='/page/account/login-auth/' className='btn btn-solid btn-sm mt-4'>Login / Register</Link>
//                     </div>

//             }
//             <ModalBase isOpen={deleteStatus.status} toggle={handleClear} title={'Delete travel buddies'}>
//                 <div className='d-flex flex-column align-items-center'>
//                     <h6 className='text-center'>Are you sure to delete the travel buddy ?</h6>
//                     <div className='d-flex align-items-center gap-3 mt-3'>
//                         <button className='btn btn-sm btn-solid' onClick={deleteData}>{deletingPerson ? 'please wait' : "Yes"} </button>
//                         <button className='btn btn-sm btn-solid' onClick={handleClear}>No</button>
//                     </div>
//                 </div>
//             </ModalBase>
//         </>
//     )
// }

// export default TravelBuddies;