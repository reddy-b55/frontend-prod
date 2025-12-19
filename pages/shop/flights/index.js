import dayjs from 'dayjs';
import axios from 'axios';
import moment from 'moment';
import Head from 'next/head';
import Select from 'react-select';
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
import { db } from "../../../firebase";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import flight from '../../../public/assets/images/Icons/flight.png'

import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import NearMeIcon from '@mui/icons-material/NearMe';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import CancelIcon from "@mui/icons-material/Cancel";

import CommonLayout from '../../../components/shop/common-layout';
import ModalBase from "../../../components/common/Modals/ModalBase";
import PaxIncrementorComponentFlights from '../../../components/common/PaxIncrementor/PaxIncrementorComponentFlights';
import ToastMessage from '../../../components/Notification/ToastMessage';

import AirportCodes from "../../../public/data/AirportCodes.json";

import FlightDetails from '../../product-details/flights/flightDetails';
import { AppContext } from '../../_app';
import Banner from '../../layouts/Banner';
import FlightsBannerSlider from './FlightsBannerSlider ';

function FlightsMainPage() {

    const router = useRouter();
    const canonicalUrl = router.asPath;
    // const {userStatus, baseLocation } = useContext(AppContext);
    const { userStatus, baseCurrencyValue, baseLocation, baseUserId } = useContext(AppContext);
    const [chatCreating, setChatCreating] = useState(false);
    const closeIconRefDepature = useRef(null);
    const closeIconRefArrival = useRef(null);

    const handleMouseEnterDepature = () => {
        if (closeIconRefDepature.current) {
            closeIconRefDepature.current.style.display = "inline-block";
        }
    };

    const handleMouseLeaveDepature = () => {
        if (closeIconRefDepature.current) {
            closeIconRefDepature.current.style.display = "none";
        }
    };

    const handleMouseEnterArrival = () => {
        if (closeIconRefArrival.current) {
            closeIconRefArrival.current.style.display = "inline-block";
        }
    };

    const handleMouseLeaveArrival = () => {
        if (closeIconRefArrival.current) {
            closeIconRefArrival.current.style.display = "none";
        }
    };

    const tripOptions = [
        { value: 'oneway', label: 'One Way' },
        { value: 'roundtrip', label: 'Round Trip' },
        { value: 'multicity', label: 'Multi City' },
    ]

    const travelClassDetails = [
        { value: 'P', label: 'Premium First' },
        { value: 'F', label: 'First' },
        { value: 'J', label: 'Premium Business' },
        { value: 'C', label: 'Business' },
        { value: 'S', label: 'Premium Economy' },
        { value: 'Y', label: 'Economy' }
    ];

    const [userSelectedTripMode, setUserSelectedTripMode] = useState('oneway');
    const [userSelectedTripClass, setUserSelectedTripClass] = useState('Y');

    const [active_box, set_active_box] = useState(false);

    const [totalCount, setTotalCount] = useState("");
    const [seatCount, setSeatCount] = useState({
        passengerType: null,
        seat_count: '',
        paxTypeAndCount: null
    });

    const [passenger_detials, set_passenger_detials] = useState({
        adult: 1,
        child: 0,
        infants: 0,
        passenger_count: "",
        seat_count: 1,
        travelMode: { userSelectedTripClass },
        selected: false,
        directFlight: false,
    });

    const [travel_data, set_travel_data] = useState([
        {
            from_location: "",
            from_airport_choosed: false,
            from_airport_details: {},
            from_updated_airport_details: [],
            to_location: "",
            to_airport_choosed: false,
            to_airport_details: {},
            to_updated_airport_details: [],
            depature_date: dayjs().add(1, 'day'),
            arrival_date: dayjs().add(2, 'day')
        },
    ]);

    // const addcity = () => {
    //     set_travel_data([
    //         ...travel_data,
    //         {
    //             from_location: "",
    //             to_location: "",
    //             from_airport_choosed: false,
    //             to_airport_choosed: false,
    //             depature_date: dayjs().add(4, 'day'),
    //             arrival_date: dayjs().add(5, 'day'),
    //             from_airport_details: [],
    //             to_airport_details: [],
    //             from_updated_airport_details: [],
    //             to_updated_airport_details: [],
    //         },
    //     ]);
    // };
    const addcity = () => {
        if (userSelectedTripMode === 'multicity') {
            set_travel_data([
                ...travel_data,
                {
                    from_location: "",
                    to_location: "",
                    from_airport_choosed: false,
                    to_airport_choosed: false,
                    depature_date: null,
                    arrival_date: null,
                    from_airport_details: [],
                    to_airport_details: [],
                    from_updated_airport_details: [],
                    to_updated_airport_details: [],
                },
            ]);
        }
    };

    // const choose_city = (value, key, code) => {
    //     set_travel_data((prevData) => {
    //         const updatedData = prevData.map((item, index) => {
    //             if (index === key && code === 1) {
    //                 return {
    //                     ...item,
    //                     ["from_location"]: value.city_name,
    //                     ["from_airport_choosed"]: true,
    //                     ["from_updated_airport_details"]: [],
    //                     ["from_airport_details"]: value,
    //                 };
    //             }
    //             return item;
    //         });
    //         return updatedData;
    //     });
    //     set_travel_data((prevData) => {
    //         const updatedData = prevData.map((item, index) => {
    //             if (index === key && code === 2) {
    //                 return {
    //                     ...item,
    //                     ["to_location"]: value.city_name,
    //                     ["to_airport_choosed"]: true,
    //                     ["to_updated_airport_details"]: [],
    //                     ["to_airport_details"]: value,
    //                 };
    //             }
    //             return item;
    //         });
    //         return updatedData;
    //     });
    // };

    const choose_city = (value, key, code) => {
    // Get current travel data for this index
    const currentTravelData = travel_data[key];
    
    // Check if selecting same city for departure and arrival
    if (code === 1) { // Selecting departure city
        // Check if arrival city is already selected and is the same
        if (currentTravelData.to_airport_choosed && 
            currentTravelData.to_airport_details.iata_code === value.iata_code) {
            ToastMessage({ 
                status: 'error', 
                message: 'Departure and arrival cities cannot be the same. Please select different cities.' 
            });
            return;
        }
    } else if (code === 2) { // Selecting arrival city
        // Check if departure city is already selected and is the same
        if (currentTravelData.from_airport_choosed && 
            currentTravelData.from_airport_details.iata_code === value.iata_code) {
            ToastMessage({ 
                status: 'error', 
                message: 'Departure and arrival cities cannot be the same. Please select different cities.' 
            });
            return;
        }
    }

    // If validation passes, proceed with the original logic
    set_travel_data((prevData) => {
        const updatedData = prevData.map((item, index) => {
            if (index === key && code === 1) {
                return {
                    ...item,
                    ["from_location"]: value.city_name,
                    ["from_airport_choosed"]: true,
                    ["from_updated_airport_details"]: [],
                    ["from_airport_details"]: value,
                };
            }
            return item;
        });
        return updatedData;
    });
    
    set_travel_data((prevData) => {
        const updatedData = prevData.map((item, index) => {
            if (index === key && code === 2) {
                return {
                    ...item,
                    ["to_location"]: value.city_name,
                    ["to_airport_choosed"]: true,
                    ["to_updated_airport_details"]: [],
                    ["to_airport_details"]: value,
                };
            }
            return item;
        });
        return updatedData;
    });
};


    const [flightLoading, setFlightLoading] = useState(false);
    const [flightDetailsUpdated, setFlightDetailsUpdated] = useState(false);

    const [flightData, setFlightData] = useState([]);


    const [flightSearchDataSet, setFlightSearchDataSet] = useState([]);

    const updateDetails = async () => {


        setFlightLoading(true);
        setFlightDetailsUpdated(false);
        setFlightSearchDataSet(userSelectedTripMode);

        const passenger_type = [];

        console.log("passenger_detials", passenger_detials);

        for (let i = 0; i < passenger_detials.adult; i++) { passenger_type.push("ADT"); }
        for (let i = 0; i < passenger_detials.child; i++) { passenger_type.push("CNN"); }
        for (let i = 0; i < passenger_detials.infants; i++) { passenger_type.push("INF"); }

        const passengerDetailsLog = [
            { type: 'adult', count: passenger_detials?.adult },
            { type: 'child', count: passenger_detials?.child },
            { type: 'infants', count: passenger_detials?.infants }
        ];
        console.log('passenger_type', passenger_type);
        setSeatCount({
            ...seatCount,
            passengerType: passenger_type.toString(),
            paxTypeAndCount: passengerDetailsLog
        });

        if (userSelectedTripMode === 'oneway') {

            const dataset = {
                trip_type: "One Way",
                dep_date: travel_data[0].depature_date,
                from_location: travel_data[0].from_airport_details.iata_code,
                to_location: travel_data[0].to_airport_details.iata_code,
                passenger_type: passenger_type.toString(),
                passenger_count: totalCount.toString(),
                seat_count: passenger_detials.seat_count,
                childCount: passenger_detials.child,
                adultCount: passenger_detials.adult,
                infCount: passenger_detials.infants,
                cabin_code: userSelectedTripClass
            };

            getFlightDetails(dataset);

        } else if (userSelectedTripMode === 'roundtrip') {

            const depDate = travel_data[0].depature_date + "," + travel_data[0].arrival_date;

            const formattedDates = depDate.split(',').map(timestamp => {
                const date = new Date(parseInt(timestamp, 10));
                return date.toISOString().split('T')[0];
            }).join(',');

            const dataset = {
                trip_type: "Round Trip",
                dep_date: formattedDates,
                dep_date_origin: travel_data[0].depature_date,
                return_date: travel_data[0].arrival_date,
                from_location: travel_data[0].from_airport_details.iata_code + "," + travel_data[0].to_airport_details.iata_code,
                to_location: travel_data[0].to_airport_details.iata_code + "," + travel_data[0].from_airport_details.iata_code,
                passenger_count: totalCount,
                seat_count: passenger_detials.seat_count,
                passenger_type: passenger_type.toString(),
                adultCount: passenger_detials.adult,
                childCount: passenger_detials.child,
                infCount: passenger_detials.infants,
                cabin_code: userSelectedTripClass
            };

            getFlightDetails(dataset);

        } else if (userSelectedTripMode === 'multicity') {

            const from_location = [];
            const to_location = [];
            const departures = [];

            for (let index = 0; index < travel_data.length; index++) {
                from_location.push(travel_data[index].from_airport_details.iata_code);
                to_location.push(travel_data[index].to_airport_details.iata_code);
                departures.push(moment(travel_data[index].depature_date).format('YYYY-MM-DD'));
            }

            const dataset = {
                from_location: from_location.toString(),
                to_location: to_location.toString(),
                dep_date: departures.toString(),
                passenger_type: passenger_type.toString(),
                passenger_count: totalCount,
                seat_count: passenger_detials.seat_count,
                trip_type: "Multi City",
                cabin_code: userSelectedTripClass,
                adultCount: passenger_detials.adult,
                childCount: passenger_detials.child,
                infCount: passenger_detials.infants
            }

            getFlightDetails(dataset);

        }

    }

    const getFlightDetails = async (dataSet) => {
        console.log("datasetttttt", dataSet)
        const hasEmptyValue = (obj) => {
            return Object.entries(obj).some(
                ([key, value]) =>
                    value === null || value === undefined || value === ''
            );
        };

        if (hasEmptyValue(dataSet)) {
            setFlightLoading(false);
            ToastMessage({ status: 'error', message: 'Please fill in all required flight details.' });
            return;
        }


        await axios.post('check-availability_Sabre_Flight', dataSet, {
            xsrfHeaderName: "X-XSRF-TOKEN",
            withCredentials: true
        }).then(res => {
            if (res.data.status === 200) {
                // console.log(res.data, 'res.data');
                setFlightData(res.data)
                setFlightLoading(false);
                setFlightDetailsUpdated(true);
            } else {
                setFlightLoading(false);
                setFlightDetailsUpdated(false);
                ToastMessage({ status: 'error', message: 'Currently there are no flights are operating!' })
            }
        }).catch((err) => {
            setFlightLoading(false);
            ToastMessage({ status: 'error', message: 'Something went wrong ! and Please fill in all required flight details' })
        })
    }

    const handleOnChangeTripMode = (e) => {
        setUserSelectedTripMode(e.value);
        setFlightData([]);
        setFlightDetailsUpdated(false);

        // Reset travel_data when switching from multicity to oneway/roundtrip
        if (e.value !== 'multicity') {
            set_travel_data([{
                from_location: "",
                from_airport_choosed: false,
                from_airport_details: {},
                from_updated_airport_details: [],
                to_location: "",
                to_airport_choosed: false,
                to_airport_details: {},
                to_updated_airport_details: [],
                depature_date: dayjs().add(1, 'day'),
                arrival_date: dayjs().add(2, 'day')
            }]);
        }
    }
    const handleOnChangeTripClass = (e) => {
        setUserSelectedTripClass(e.value);
    }

    // const handleUpdateDate = (name, value, key) => {
    //     set_travel_data((prevData) => {
    //         const updatedData = prevData.map((item, index) => {
    //             if (index === key) {
    //                 if (name === 'depature_date') {
    //                     return {
    //                         ...item,
    //                         [name]: value,
    //                         arrival_date: dayjs(value).add(1, 'day')
    //                     };
    //                 } else {
    //                     return {
    //                         ...item,
    //                         [name]: value,
    //                     };
    //                 }
    //             }
    //             return item;
    //         });
    //         return updatedData;
    //     });
    // }

    const handleUpdateDate = (name, value, key) => {
        set_travel_data((prevData) => {
            const updatedData = [...prevData];

            // Update the current field
            updatedData[key] = {
                ...updatedData[key],
                [name]: value
            };

            // If updating departure date, ensure arrival is after
            if (name === 'depature_date' && value) {
                const currentArrival = updatedData[key].arrival_date;
                const minArrival = dayjs(value).add(1, 'day');

                // Use isAfter() instead of dayjs.max()
                updatedData[key].arrival_date = currentArrival && dayjs(currentArrival).isAfter(minArrival)
                    ? currentArrival
                    : minArrival;
            }

            // For both departure and arrival updates, enforce sequence rules
            if (value && (name === 'depature_date' || name === 'arrival_date')) {
                // 1. First ensure current city's arrival is after departure
                if (updatedData[key].depature_date && updatedData[key].arrival_date) {
                    if (dayjs(updatedData[key].arrival_date).isBefore(dayjs(updatedData[key].depature_date))) {
                        updatedData[key].arrival_date = dayjs(updatedData[key].depature_date).add(1, 'day');
                    }
                }

                // 2. Then enforce next city's departure is after this city's arrival
                if (key < updatedData.length - 1 && updatedData[key].arrival_date) {
                    const nextCity = updatedData[key + 1];
                    const minNextDeparture = dayjs(updatedData[key].arrival_date).add(1, 'day');

                    if (!nextCity.depature_date || dayjs(nextCity.depature_date).isBefore(minNextDeparture)) {
                        updatedData[key + 1].depature_date = minNextDeparture;
                        // Also update next city's arrival if needed
                        if (nextCity.arrival_date && dayjs(nextCity.arrival_date).isBefore(dayjs(updatedData[key + 1].depature_date))) {
                            updatedData[key + 1].arrival_date = dayjs(updatedData[key + 1].depature_date).add(1, 'day');
                        }
                    }
                }
            }

            return updatedData;
        });
    };


    const fetchAirportDetails = (key, value, code) => {
        const response = AirportCodes.airport_codes;
        let input = value.toLowerCase();
        response.map((data) => {
            if (data.city_name.toLowerCase().startsWith(input)) {
                set_travel_data((prevData) => {
                    const updatedData = prevData.map((item, index) => {
                        if (index === key && code === 1) {
                            return {
                                ...item,
                                ["from_updated_airport_details"]: [
                                    ...item.from_updated_airport_details,
                                    data,
                                ],
                            };
                        } else if (index === key && code === 2) {
                            return {
                                ...item,
                                ["to_updated_airport_details"]: [
                                    ...item.to_updated_airport_details,
                                    data,
                                ],
                            };
                        }
                        return item;
                    });
                    return updatedData;
                });
            }
        });
    };

    const handleUpdateValues = (e, key) => {

        const { name, value } = e.target;

        if (name === "from_location") {
            const data = [...travel_data];
            if (value.length > 2) {
                data[key].from_updated_airport_details = [];
                fetchAirportDetails(key, value, 1);
            } else {
                data[key].from_updated_airport_details = [];
                data[key].from_airport_choosed = false;
                set_travel_data(data);
            }
        } else if (name === "to_location") {
            const data = [...travel_data];
            if (value.length > 2) {
                data[key].to_updated_airport_details = [];
                fetchAirportDetails(key, value, 2);
            } else {
                data[key].to_updated_airport_details = [];
                data[key].to_airport_choosed = false;
                set_travel_data(data);
            }
        }

        set_travel_data((prevData) => {
            const updatedData = prevData.map((item, index) => {
                if (index === key) {
                    return {
                        ...item,
                        [name]: value,
                    };
                }
                return item;
            });
            return updatedData;
        });

    };

    const handleDeleteFlightLocation = (name, key) => {

        set_travel_data((prevData) => {
            const updatedData = prevData.map((item, index) => {
                if (Number(index) === Number(key)) {
                    if (name === 'from_location') {
                        return {
                            ...item,
                            from_location: "",
                            from_airport_choosed: false,
                            from_airport_details: {},
                            from_updated_airport_details: [],
                        };
                    } else {
                        return {
                            ...item,
                            to_location: "",
                            to_airport_choosed: false,
                            to_airport_details: {},
                            to_updated_airport_details: [],
                        };
                    }
                }
                return item;
            });
            return updatedData;
        })

    };

    const addPaxPaxIncrement = (values) => {
        let seatCount = Number(values.adult) + Number(values.child)
        set_passenger_detials({
            passenger_detials,
            adult: values.adult,
            child: values.child,
            infants: values.infant,
            seat_count: seatCount
        })
        set_active_box(false);
    }

    useEffect(() => {
        let count = Number(passenger_detials.adult) + Number(passenger_detials.child) + Number(passenger_detials.infants);
        let countSeat = Number(passenger_detials.adult) + Number(passenger_detials.child) + Number(passenger_detials.infants);
        setSeatCount({
            ...seatCount,
            seat_count: countSeat
        });
        setTotalCount(count);
    }, [passenger_detials.adult, passenger_detials.child, passenger_detials.infants]);


    const [currentLocation, setCurrenctLocation] = useState({
        latitude: '9.935646649605616',
        longitude: '78.13418272742632'
    });

    const getNearByAirpost = (latitude, longitude) => {
        let nearest = null;
        let minDistance = Infinity;
        AirportCodes.airport_codes.forEach(airport => {
            const distance = haversine(latitude, longitude, airport._geoloc.lat, airport._geoloc.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = airport;
            }
        });
        return nearest;
    }

    useEffect(() => {
        let currentNearestAirport = getNearByAirpost(currentLocation.latitude, currentLocation.longitude);
        let destinationNearestAirport = getNearByAirpost(baseLocation.latitude, baseLocation.longtitude);
        set_travel_data([
            {
                from_location: '',
                from_airport_choosed: true,
                from_airport_details: '',
                from_updated_airport_details: [],
                to_location: '',
                to_airport_choosed: true,
                to_airport_details: '',
                to_updated_airport_details: [],
                depature_date: null,
                arrival_date: null
            }
        ]);
        // set_travel_data([
        //     {
        //         from_location: currentNearestAirport.city_name,
        //         from_airport_choosed: true,
        //         from_airport_details: currentNearestAirport,
        //         from_updated_airport_details: [],
        //         to_location: destinationNearestAirport.city_name,
        //         to_airport_choosed: true,
        //         to_airport_details: destinationNearestAirport,
        //         to_updated_airport_details: [],
        //         depature_date: dayjs().add(4, 'day'),
        //         arrival_date: dayjs().add(5, 'day')
        //     }
        // ]);
    }, []);

    const haversine = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getCurrenctLocation = async () => {
        try {
            navigator.geolocation.getCurrentPosition((position) => {
                try {
                    geocodeByLatLng({ lat: position.coords.latitude, lng: position.coords.longitude }).then((results) => {
                        for (var i = 0; i < results[0].address_components.length; i++) {
                            setCurrenctLocation({
                                latitude: position.coords.latitude,
                                longtitude: position.coords.longitude,
                            });
                        }
                    }).catch((error) => {
                        // console.error(error)
                    })
                } catch (error) {
                    // console.error(error);
                }
            })
        } catch (error) {
            // console.error(error);
        }
    }

    useEffect(() => {
        getCurrenctLocation();
    }, []);


    const [openSideBarStatus, setopenSideBarStatus] = useState(false);

    const openSubFilter = () => {
        setopenSideBarStatus(true);
    };

    const closeSubFilter = () => {
        setopenSideBarStatus(false);
    };

    const checkExistingChat = async (userId) => {
        const chatRef = await collection(db, "customer-chat-lists");
        const q = query(
            chatRef,
            where("customer_collection_id", "==", userId),
            where("chat_name", "==", "Aahaas Flight Assistance")
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            handleChatInitiate();
        } else {
            setChatCreating(false);
            // router.push(`/page/account/chats?oID=${querySnapshot.docs[0].id}`);
            const chatUrl = `/page/account/chats?oID=${querySnapshot.docs[0].id}`;
            window.open(chatUrl, "_blank");
        }
    }

    const handleChatInitiate = async () => {
        setChatCreating(true);
        if (chatCreating) {
            ToastMessage({ status: "warning", message: "Already a chat has been initiated" })
        } else {
            if (userStatus.userLoggesIn) {
                await addDoc(collection(db, "customer-chat-lists"), {
                    status: 'Pending',
                    createdAt: new Date(),
                    supplierAdded: 'false',
                    notifyAdmin: 'true',
                    notifySupplier: 'false',
                    notifyCustomer: 'false',
                    supplier_name: '',
                    customer_name: baseUserId.user_username,
                    customer_mail_id: baseUserId.user_email,
                    supplier_mail_id: '',
                    // comments: { category: 4, product_id: hotelDetails?.hotelData?.id },
                    customer_id: baseUserId.cxid,
                    chat_related: 'Technical-support',
                    customer_collection_id: baseUserId.cxid,
                    chat_related_to: "Product",
                    supplier_mail_id: "aahaas@gmail.com",
                    group_chat: 'true',
                    supplier_added_date: Date.now(),
                    chat_related_id: null,
                    chat_category: '6',
                    chat_avatar: "https://gateway.aahaas.com/monogram.png",
                    supplier_id: '635',
                    chat_name: "Aahaas Flight Assistance",
                    comments: 'Product support - chat has been created from product details',
                    updatedAt: new Date()
                }).then((response) => {
                    setChatCreating(false);
                    // router.push(`/page/account/chats?oID=${response._key.path.segments[1]}`);
                    const chatUrl = `/page/account/chats?oID=${response._key.path.segments[1]}`;
                    window.open(chatUrl, "_blank");
                });
            } else {
                router.push("/page/account/login-auth");
                localStorage.setItem("lastPath", router.asPath)
                ToastMessage({ status: "warning", message: "You are logged in as a guest user. Please login to access the full system features" })
            }
        }
    }

    return (
        <>

            <Head>
                <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
                <title>Aahaas - Flights</title>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Home",
                                    "item": "https://www.aahaas.com/"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Non Essential PLP",
                                    "item": "https://www.aahaas.com/flights"
                                }
                            ]
                        }),
                    }}
                />
            </Head>

            <CommonLayout title="Flights" parent="home" showMenuIcon={flightDetailsUpdated} showSearchIcon={true} openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()}>


                {/* Add filghts banner here */}
                {/* <FlightsBannerSlider /> */}

                <div className="container py-4">



                    <div className="container d-flex flex-column align-items-center">

                        <div className='d-flex align-items-center align-items-stretch border rounded-3 p-1 px-2 mt-3 mb-4'>
                            <div className='tripDetails-head'>
                                <Select options={tripOptions} name="country" value={tripOptions.find(option => option.value === userSelectedTripMode)} onChange={handleOnChangeTripMode} className="react__Select rounded-0" />
                            </div>
                            <div className='tripDetails-count-head d-flex align-items-center me-3 ms-2' onClick={() => set_active_box(!active_box)}>
                                <PersonOutlineOutlinedIcon sx={{ fontSize: 16, marginRight: '5px' }} />
                                <p className='tripDetailsCount m-0 p-0'>{totalCount}</p>
                            </div>
                            <div className='tripDetails-head'>
                                <Select options={travelClassDetails} name="country" value={travelClassDetails.find(option => option.value === userSelectedTripClass)} onChange={handleOnChangeTripClass} className="react__Select rounded-0" />
                            </div>
                        </div>

                        <ModalBase isOpen={active_box} toggle={() => { set_active_box(false) }} title={"Choose passenger details"}>
                            <PaxIncrementorComponentFlights adultCount={passenger_detials.adult} childCount={passenger_detials.child} infantCount={passenger_detials.infants} addPaxPaxIncrement={addPaxPaxIncrement}></PaxIncrementorComponentFlights>
                        </ModalBase>

                        {
                            travel_data.map((line, key) => (

                                <div className="d-flex flex-column flex-md-row gap-4 " key={key}>

                                    <div className="tripLocationDetails-locationContainer d-flex flex-column">

                                        <div className='d-flex' onMouseEnter={handleMouseEnterDepature} onMouseLeave={handleMouseLeaveDepature}>
                                            <TextField id="outlined-multiline-flexible" label="Departure City (Select suggestion)" multiline maxRows={1} placeholder="From" name="from_location" onChange={(e) => handleUpdateValues(e, key)} value={travel_data[key].from_location} className="from_location_name" />
                                            <CloseIcon style={{ backgroundColor: "black" }} ref={closeIconRefDepature} className='flightLocation-closeBtn' onClick={() => handleDeleteFlightLocation('from_location', Number(key))} />
                                        </div>

                                        <span className="suggestion_city_details">
                                            {!travel_data[key].from_airport_choosed &&
                                                travel_data[key].from_updated_airport_details.map((airport, id) => (
                                                    <div key={id} onClick={() => choose_city(airport, key, 1)}>
                                                        <NearMeIcon className='suggestionCity-icon' />
                                                        <p>{airport.city_name} : {airport.iata_code} : {airport.country}</p>
                                                    </div>
                                                ))}
                                        </span>

                                    </div>

                                    <div className="tripLocationDetails-locationContainer d-flex flex-column">

                                        <div className='d-flex' onMouseEnter={handleMouseEnterArrival} onMouseLeave={handleMouseLeaveArrival}>
                                            <TextField id="outlined-multiline-flexible" label="Arrival City (Select suggestion)" multiline maxRows={1} placeholder="To" name="to_location" onChange={(e) => handleUpdateValues(e, key)} value={travel_data[key].to_location} className="to_location_name" />
                                            <CloseIcon ref={closeIconRefArrival} className='flightLocation-closeBtn' onClick={() => handleDeleteFlightLocation('to_location', Number(key))} style={{ backgroundColor: "black" }} />
                                        </div>

                                        <span className="suggestion_city_details">
                                            {!travel_data[key].to_airport_choosed &&
                                                travel_data[key].to_updated_airport_details.map((airport, id) => (
                                                    <div key={id} onClick={() => choose_city(airport, key, 2)}>
                                                        <NearMeIcon className='suggestionCity-icon' />
                                                        <p>{airport.city_name} : {airport.iata_code} : {airport.country}</p>
                                                    </div>
                                                ))}
                                        </span>

                                    </div>

                                    <div className='tripLocationDetails-dateContainer'>
                                        {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker label="Pick a date" value={travel_data?.[key]?.depature_date} onChange={(newValue) => handleUpdateDate('depature_date', newValue, key)} minDate={dayjs()} />
                                        </LocalizationProvider> */}
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Departure date"
                                                value={travel_data?.[key]?.depature_date}
                                                onChange={(newValue) => handleUpdateDate('depature_date', newValue, key)}
                                                minDate={
                                                    key === 0 ?
                                                        dayjs() : // First city can be any date from today
                                                        (travel_data[key - 1]?.arrival_date ?
                                                            dayjs(travel_data[key - 1].arrival_date).add(1, 'day') :
                                                            null)
                                                }
                                            />
                                        </LocalizationProvider>
                                    </div>

                                    <div className='tripLocationDetails-dateContainer'>
                                        {/* <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker label="Pick a date" value={travel_data?.[key]?.arrival_date} disabled={userSelectedTripMode === 'oneway' ||  userSelectedTripMode === 'multicity'? true : false} onChange={(newValue) => handleUpdateDate('arrival_date', newValue, key)} minDate={travel_data?.[key]?.depature_date || dayjs()} />
                                        </LocalizationProvider> */}

                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                label="Arrival date"
                                                value={travel_data?.[key]?.arrival_date}
                                                onChange={(newValue) => handleUpdateDate('arrival_date', newValue, key)}
                                                minDate={
                                                    travel_data?.[key]?.depature_date ?
                                                        dayjs(travel_data[key].depature_date).add(1, 'day') :
                                                        null
                                                }
                                                disabled={userSelectedTripMode === 'oneway' || userSelectedTripMode === 'multicity'}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                    {travel_data.length > 1 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <CancelIcon
                                                style={{
                                                    cursor: "pointer",
                                                    transition: "transform 0.2s ease, color 0.2s ease",
                                                }}
                                                onClick={() => set_travel_data((prevData) => prevData.filter((_, i) => i !== key))}
                                            />
                                        </div>
                                    )}
                                </div>

                            ))
                        }

                        <div className="mt-4 d-flex gap-3">
                            <button type="button" className={`btn btn-solid py-2 px-4 rounded-3 text-center ${userSelectedTripMode === 'multicity' ? 'd-block' : 'd-none'}`} name="btn__FlightSearch" id="btn__FlightSearch" onClick={addcity} >Add city</button>
                            <button className="btn btn-solid py-2 px-4 rounded-3 text-center" onClick={updateDetails}>
                                {flightLoading ? <><RefreshOutlinedIcon className='spinner' />Loading..</> : "Search Flights"}
                            </button>
                            <button className="btn btn-solid py-2 px-4 rounded-3 text-center" onClick={() => { checkExistingChat(baseUserId.cxid) }}>
                                {chatCreating ? 'Initiating a chat' : <ChatIcon className='chatIcon' />}
                            </button>
                        </div>

                    </div>

                    {
                        flightDetailsUpdated &&
                        <FlightDetails dataSet={flightData} userSelectedTripMode={flightSearchDataSet} userSearchData={travel_data} openSideBarStatus={openSideBarStatus} closeSubFilter={closeSubFilter} seatCount={seatCount} />
                    }

                </div>

            </CommonLayout>

        </>
    );
}

export default FlightsMainPage;