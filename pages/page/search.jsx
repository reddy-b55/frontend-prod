import moment from 'moment';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import axios from 'axios';

import { useRouter } from 'next/router';
import { Container, Row, Col, Input } from 'reactstrap';
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import React, { useContext, useEffect, useRef, useState } from 'react';

import CommonLayout from '../../components/shop/common-layout';
import ProductItem from '../../components/common/product-box/ProductBox';
import ToastMessage from '../../components/Notification/ToastMessage';

import { AppContext } from '../_app';
import { handleMainSearchUpdated } from '../../AxiosCalls/GlobalAxiosServices/globalServices';
import { createNewChatWithAdmin, fetchAllUserHistory, getSerachHistrory } from '../../AxiosCalls/UserServices/userServices';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'regenerator-runtime/runtime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import ModalBase from '../../components/common/Modals/ModalBase';
import DragAndDropUploader from './DragAndDropUploader';
import TuneIcon from '@mui/icons-material/Tune';
import LifestyleChatbot from '../../components/common/widgets/LifestyleBot';

const Search = () => {

    const searchResultsRef = useRef(null);
    const showSuggestiongsRef = useRef(null);

    const router = useRouter();
    const { userId, baseUserId, userStatus } = useContext(AppContext);

    const [activeTab, setActiveTab] = useState('All');

    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [userSearchedQuery, setUserSearchedQuery] = useState('');

    const [recentSearch, setRecentSearch] = useState([]);
    const [searchsuggestions, setSearchsuggestions] = useState([]);

    const [showSuggestiongs, setShowSuggestions] = useState(true);
    const [showSearchSuggestiongs, showSearchShowSuggestions] = useState(false);

    const nextWeekDate = moment().add(7, 'days').format('YYYY-MM-DD');
    const nextWeekDateCheckout = moment().add(8, 'days').format('YYYY-MM-DD');
    const [isAdvanceSearchActive, setIsAdvanceSearchActive] = useState(false);
    const [isVoiceInput, setIsVoiceInput] = useState(false);
    const hotelSearchCustomerData = {
        CheckInDate: nextWeekDate,
        CheckOutDate: nextWeekDateCheckout,
        NoOfNights: 1,
        NoOfRooms: 1,
        NoOfAdults: 1,
        NoOfChild: 0,
        City: "Colombo",
        Country: "LK",
        StarRate: 0,
        RoomRequest: [{
            indexValue: 0,
            roomType: "Single",
            NoOfAdults: 1,
            NoOfChild: 0,
            ChildAge: []
        }]
    };

    const [searchStart, setSearchStart] = useState(false);
    const [searchdone, setsearchdone] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const [lifestyleSearchResults, setLifestyleSearchResults] = useState([]);
    const [educationSearchResults, setEducationSearchResults] = useState([]);
    const [hotelSearchResults, setHotelsSearchResults] = useState([]);
    const [essentialSearchResults, setEssentialResults] = useState([]);
    const [nonEssentialSearchResults, setNonEssentialSearchResults] = useState([]);

    // Advanced filter states
    const [metaFilterValues, setMetaFilterValues] = useState(null);
    const [isAdvancedFilter, setIsAdvancedFilter] = useState(false);
    const [isUsingMetaLocation, setIsUsingMetaLocation] = useState(false);

    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    // Function to handle advanced filter data for UI display
    const processAdvancedFilterDataForUI = (advancedFilterData) => {
        try {
            setMetaFilterValues(advancedFilterData);
            setIsAdvancedFilter(true);

            // Check if location data is available and valid for UI display
            const hasValidLocation = advancedFilterData?.location?.latitude &&
                advancedFilterData?.location?.longitude &&
                advancedFilterData?.location?.name !== "Unknown";
            setIsUsingMetaLocation(hasValidLocation);

            return true;
        } catch (error) {
            console.error("Error processing advanced filter data for UI:", error);
            return false;
        }
    };

    // Function to render AI Filter component
    const renderAIFilterComponent = () => {
        if (!metaFilterValues?.primaryKeywords?.length > 0) return null;

        return (
            <div
                style={{
                    backgroundColor: "#f3f9fdff",
                    padding: "10px",
                    margin: "10px",
                    borderRadius: "8px",
                    borderLeft: "4px solid #2196f3",
                }}
            >
                <h6 style={{ fontWeight: "bold", color: "#1976d2", marginBottom: "5px" }}>
                    AI Filter Active: {" "}
                    {metaFilterValues.primaryKeywords.slice(0, 3).join(", ")}
                    {metaFilterValues.primaryKeywords.length > 3 &&
                        ` +${metaFilterValues.primaryKeywords.length - 3} more`}
                </h6>
                {isUsingMetaLocation && metaFilterValues?.location?.latitude && (
                    <small style={{ color: "#1976d2", fontSize: "12px" }}>
                        Location: {metaFilterValues.location.name}
                    </small>
                )}
            </div>
        );
    };

    // Parallel search function for all categories
    const fetchAllProductsParallel = async (variable, type) => {
        setLifestyleSearchResults([]);
        setEducationSearchResults([]);
        setHotelsSearchResults([]);
        setEssentialResults([]);
        setNonEssentialSearchResults([]);

        var dataSetVal = null;

        if (type !== "Image") {
            // Check if variable is advanced filter data (object) or simple keyword (string)
            if (typeof variable === 'object' && variable !== null) {
                // Process UI state for advanced filter display
                processAdvancedFilterDataForUI(variable);
                // Pass the raw advanced filter data directly to backend
                dataSetVal = variable;
                console.log("Sending raw advanced filter data to backend:", dataSetVal);
            } else {
                // Reset advanced filter states for simple keyword search
                setIsAdvancedFilter(false);
                setMetaFilterValues(null);
                setIsUsingMetaLocation(false);
                // Use simple payload for regular keyword search
                dataSetVal = {
                    dataKeys: variable?.split(",")?.[0],
                };
                console.log("Sending simple keyword data to backend:", dataSetVal);
            }
        }

        setSearchStart(true);

        if (type === "Image") {
            const imageSearch = new FormData();
            imageSearch.append("image", variable);

            console.log("Using parallel image search for all categories");
            const categoryIds = [1, 2, 3, 4, 5]; // Essentials, Non-Essentials, Lifestyle, Hotels, Education

            try {
                const promises = categoryIds.map(categoryId =>
                    axios.post(`fetch_voice_keywords_by_image/${categoryId}`, imageSearch, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        withCredentials: true,
                    })
                );

                const results = await Promise.all(promises);

                results.forEach((result, index) => {
                    if (result.data.status === 200) {
                        const categoryId = categoryIds[index];
                        switch (categoryId) {
                            case 1:
                                setEssentialResults(result.data.search_data || []);
                                break;
                            case 2:
                                setNonEssentialSearchResults(result.data.search_data || []);
                                break;
                            case 3:
                                setLifestyleSearchResults(result.data.search_data || []);
                                break;
                            case 4:
                                setHotelsSearchResults(result.data.search_data || []);
                                break;
                            case 5:
                                setEducationSearchResults(result.data.search_data || []);
                                break;
                        }
                    }
                });

                setSearchStart(false);
                setDataLoaded(true);
                setsearchdone(true);
                console.log("Parallel image search completed successfully");
            } catch (error) {
                console.log("Error in parallel image search:", error);
                setSearchStart(false);
                ToastMessage({ status: "error", message: "Image search failed. Please try again." });
            }
        } else if (type === "Keyword" || type === "AdvanceKeyword") {
            console.log("Using parallel keyword search for all categories");
            const categoryIds = [1, 2, 3, 4, 5]; // Essentials, Non-Essentials, Lifestyle, Hotels, Education

            try {
                const promises = categoryIds.map(categoryId => {
                    console.log(`Making request to Che/${categoryId} with data:`, dataSetVal);
                    return axios.post(`Che/${categoryId}`, dataSetVal, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        withCredentials: true,
                    });
                });

                const results = await Promise.all(promises);

                results.forEach((result, index) => {
                    const categoryId = categoryIds[index];
                    console.log(`Response from Che/${categoryId}:`, {
                        status: result.data.status,
                        dataLength: result.data.search_data?.length || 0,
                        hasData: !!result.data.search_data,
                    });

                    if (result.data.status === 200) {
                        switch (categoryId) {
                            case 1:
                                setEssentialResults(result.data.search_data || []);
                                console.log(`Set essentials data: ${result.data.search_data?.length || 0} items`);
                                break;
                            case 2:
                                setNonEssentialSearchResults(result.data.search_data || []);
                                console.log(`Set non-essentials data: ${result.data.search_data?.length || 0} items`);
                                break;
                            case 3:
                                setLifestyleSearchResults(result.data.search_data || []);
                                console.log(`Set lifestyle data: ${result.data.search_data?.length || 0} items`);
                                break;
                            case 4:
                                setHotelsSearchResults(result.data.search_data || []);
                                console.log(`Set hotels data: ${result.data.search_data?.length || 0} items`);
                                break;
                            case 5:
                                setEducationSearchResults(result.data.search_data || []);
                                console.log(`Set education data: ${result.data.search_data?.length || 0} items`);
                                break;
                        }
                    }
                });

                setSearchStart(false);
                setDataLoaded(true);
                setsearchdone(true);
                console.log("Parallel keyword search completed successfully");
            } catch (error) {
                console.log("Error in parallel keyword search:", error);
                setSearchStart(false);
                ToastMessage({ status: "error", message: "Search failed. Please try again." });
            }
        }

        // Show search results and hide suggestions
        if (searchResultsRef.current) {
            searchResultsRef.current.style.display = 'block';
        }
        if (showSuggestiongsRef.current) {
            showSuggestiongsRef.current.style.display = 'none';
        }
    };

    const handleUserSearch = async (e, value) => {
        console.log("console", listening, transcript);
        if (e) {
            e.preventDefault();
        }

        if (listening) {
            console.log("console start", listening, transcript);
            SpeechRecognition.stopListening();
            console.log("console stop", listening, transcript);
            value = transcript;
            setIsVoiceInput(false); // Exit voice input mode after search
        }

        const cleanHTML = DOMPurify.sanitize(value);
        console.log("UserSearchQuery", value);
        const searchValue = isVoiceInput ? transcript : value;
        setUserSearchQuery(searchValue);
        setUserSearchedQuery(searchValue);

        router.replace(`/page/search?sID=${searchValue}`);

        // Validation checks
        if (searchValue === '' || !searchValue) {
            ToastMessage({ status: "warning", message: "Kindly enter your search keywords.." });
            setSearchStart(false);
            setsearchdone(false);
            setSmartFilterLoading(false);
            return;
        }

        if (cleanHTML === '') {
            ToastMessage({ status: "warning", message: "Keyword is misleading, try with other keywords.." });
            console.log('search in cleanHTML');
            setSearchStart(false);
            setSmartFilterLoading(false);
            return;
        }

        // Determine search type and process accordingly
        let searchType = "Keyword";
        let searchData = searchValue;

        // Check if this is an advanced filter search (object)
        if (typeof value === 'object' && value !== null) {
            searchType = "AdvanceKeyword";
            searchData = value;
        }

        try {
            // Use parallel search architecture
            await fetchAllProductsParallel(searchData, searchType);

            // Save search history if results found
            if (dataLoaded) {
                try {
                    if (userStatus.userLoggesIn) {
                        await getSerachHistrory(userId, cleanHTML);
                    } else {
                        // for updating global search - just using the loop hole
                        await getSerachHistrory(undefined, cleanHTML);
                    }
                } catch (error) {
                    console.log("Error saving search history:", error);
                }
            }
        } catch (error) {
            console.error("Error in user search:", error);
            ToastMessage({ status: "error", message: "Search failed. Please try again." });
        } finally {
            // Clear smart filter loading state when search completes
            setSmartFilterLoading(false);
        }
    };

    const handleOnSearchChange = async (e) => {
        const value = e.target.value;
        setUserSearchQuery(value);
        setIsVoiceInput(false); // When user types manually, exit voice input mode
        setShowSuggestions(true);

        if (showSuggestiongsRef.current) {
            showSuggestiongsRef.current.style.display = 'block';
        }

        if (value !== '') {
            let searchFiltered = recentSearch.filter((searchValue) => {
                if (searchValue != null || searchValue != undefined || searchValue != 'null' || searchValue != "undefined" || searchValue != "") {
                    return searchValue?.includes(value)
                }
            });
            setSearchsuggestions(searchFiltered.slice(0, 10));
        } else {
            setSearchsuggestions(recentSearch.slice(0, 10));
        }
    };

    function formatForSearch(array) {
        let finalOutput = [];
        array.map((value) => {
            if (value.search_ref === undefined || value.search_ref === null) {
                // 
            } else {
                try {
                    if (!finalOutput.includes(value.search_ref.trim().toLowerCase())) {
                        finalOutput.push(value.search_ref.trim().toLowerCase())
                    }
                } catch (error) {
                    // console.error(error, value);
                }
            }
        })
        return finalOutput;
    }

    const userFetchRecentSearch = async () => {

        // for getting global search - just using the loop hole
        let result = await fetchAllUserHistory(undefined, "");
        let allUserSearch = formatForSearch(result);

        if (userStatus.userLoggesIn) {
            let result = await fetchAllUserHistory(userId, "");
            let groupd = formatForSearch(result);
            let combined = [...groupd, ...allUserSearch];
            let final = formatForSearch(combined);
            setRecentSearch(final);
            setSearchsuggestions(final.slice(0, 10));
        } else {
            setRecentSearch(allUserSearch);
            setSearchsuggestions(allUserSearch.slice(0, 10));
        }

    }

    const handleKeyUp = (event) => {
        if (event.key === "Enter") {
            handleUserSearch(event, userSearchQuery)
        }
    };

    const handleClearSearch = () => {
        setUserSearchQuery('');
        setIsVoiceInput(false); // Also clear voice input mode
        setsearchdone(false);
        setSearchStart(false);
        setDataLoaded(false);
        setShowSuggestions(true);

        // Clear all search results
        setLifestyleSearchResults([]);
        setEducationSearchResults([]);
        setHotelsSearchResults([]);
        setEssentialResults([]);
        setNonEssentialSearchResults([]);

        // Reset advanced filter states
        setIsAdvancedFilter(false);
        setMetaFilterValues(null);
        setIsUsingMetaLocation(false);

        router.replace('/page/search');
        if (searchResultsRef.current) {
            searchResultsRef.current.style.display = 'none';
        }
        if (showSuggestiongsRef.current) {
            showSuggestiongsRef.current.style.display = 'block';
        }
    };
    const getInputValue = () => {
        if (isVoiceInput && listening) {
            return transcript;
        }
        return userSearchQuery;
    };
    const createNewChat = async () => {
        await createNewChatWithAdmin(baseUserId).then((response) => {
            if (response === "userlogin") {
                router.push("/page/account/login-auth");
            } else if (response.data.status === 201) {
                ToastMessage({ status: "success", message: "Conversation Created with Aahaas" })
                router.push({
                    pathname: '/page/account/chats',
                    query: response.data.chatData.customer_collection_id
                })
            } else {
                ToastMessage({ status: "success", message: "Error in Adding Chat" })
            }
        })
    }

    const requestMicrophoneAccess = (e) => {
        e.preventDefault(); // Prevent form submission
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Microphone access is not supported in this browser.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
            alert("Microphone access granted. Start speaking...");
            resetTranscript(); // Reset the transcript before starting
            setIsVoiceInput(true); // Set voice input mode
            SpeechRecognition.startListening({ continuous: true }); // Start listening
        }).catch((error) => {
            alert(`Error: ${error.message}`);
        });
    };

    const [imageSearchOpen, setImageSearchOpen] = useState(false);
    const [smartFilterLoading, setSmartFilterLoading] = useState(false);

    const handleImageSearchOpen = () => {
        setImageSearchOpen(true);
    }

    const handleImageSearchClose = () => {
        setImageSearchOpen(false);
    }

    const handleToggle = async (imageData) => {
        if (imageData && imageData !== null) {
            // Reset advanced filter states for image search
            setIsAdvancedFilter(false);
            setMetaFilterValues(null);
            setIsUsingMetaLocation(false);

            // Use parallel image search architecture
            await fetchAllProductsParallel(imageData, "Image");
        }
        handleImageSearchClose();
    };

    useEffect(() => {
        userFetchRecentSearch();
        if (router?.query?.sID === null || router?.query?.sID === undefined || router?.query?.sID === '') {
            router.replace(`/page/search`);
        } else {
            setUserSearchQuery(router?.query?.sID);
            handleUserSearch(null, router?.query?.sID)
        }
    }, [userId]);

    // Handle body scroll when loading overlay is shown
    useEffect(() => {
        if (smartFilterLoading) {
            // Store current scroll position
            const scrollY = window.scrollY;

            // Disable body scroll completely
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
        } else {
            // Get the scroll position from the body's top style
            const scrollY = document.body.style.top;

            // Re-enable body scroll
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';

            // Restore scroll position
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }

        // Cleanup function to restore scroll on unmount
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
        };
    }, [smartFilterLoading]);

    const handleChatbotFilterData = async (filterData, originalPrompt) => {
        console.log("Received chatbot filter data:", filterData, originalPrompt);
        setUserSearchQuery(originalPrompt);

        // Set loading state when smart filter generation starts
        setSmartFilterLoading(true);

        try {
            // Handle advanced search with filter data
            if (filterData && typeof filterData === 'object') {
                // Use the advanced search functionality
                await handleUserSearch(null, originalPrompt);
            } else if (originalPrompt) {
                // Fallback to regular search
                await handleUserSearch(null, originalPrompt);
            }
        } catch (error) {
            console.error("Error in chatbot filter search:", error);
            ToastMessage({ status: "error", message: "Search failed. Please try again." });
        } finally {
            // Clear loading state when search completes
            setSmartFilterLoading(false);
        }
    };

    // Function to handle advanced search from external components
    const handleAdvancedSearch = async (advancedFilterData) => {
        if (advancedFilterData && typeof advancedFilterData === 'object') {
            console.log("Handling advanced search with filter data:", advancedFilterData);
            await fetchAllProductsParallel(advancedFilterData, "AdvanceKeyword");
        }
    };

    return (
        <CommonLayout parent="home" title="search" showSearchIcon={false} showMenuIcon={false}>

            <ModalBase isOpen={imageSearchOpen} toggle={handleImageSearchClose} title={'Search any image with here'}>
                <DragAndDropUploader toggle={handleToggle} />
            </ModalBase>

            <section className="authentication-page section-b-space my-5" style={{ minHeight: '40vh' }}>
                <Container>
                    <section className="search-block">
                        <div className='container d-flex flex-column align-items-center col-6'>
                            {/* SIMPLIFIED SEARCH FORM - FIXED */}
                            <form
                                className="col-12 d-flex flex-wrap border rounded-3 align-items-stretch"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    setSmartFilterLoading(true);
                                    handleUserSearch(e, userSearchQuery);
                                }}
                            >
                                <div className='d-flex col-11 align-items-center ps-3' style={{ cursor: 'pointer' }}>
                                    <SearchIcon sx={{ fontSize: 20, cursor: 'pointer' }} />
                                    <input
                                        type="text"
                                        className='py-3 ps-2 border-0 w-100'
                                        style={{ outline: 'none', background: 'transparent' }}
                                        placeholder={listening ? 'Speak...' : 'Search products...'}
                                        onChange={(e) => handleOnSearchChange(e)}
                                        onKeyUp={handleKeyUp}
                                        value={getInputValue()} // Use the new function
                                        autoFocus
                                    />
                                    {userSearchQuery && (
                                        <div className='d-flex align-items-center gap-2 me-1'>
                                            <CloseIcon sx={{ fontSize: 20, cursor: 'pointer' }} onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearSearch();
                                            }} />
                                        </div>
                                    )}
                                </div>
                                <div className='col-1 d-flex align-items-center justify-content-center'>
                                    <button
                                        type="submit"
                                        className='border-0 bg-transparent'
                                        style={{ outline: 'none' }}
                                    >
                                        <ArrowCircleRightIcon sx={{ fontSize: 20, cursor: 'pointer', color: '#ed4242' }} />
                                    </button>
                                </div>
                            </form>

                            {/* SEARCH OPTIONS */}
                            <div className={`col-12 mt-2 gap-2 userSearch-advanced d-flex justify-content-center`}>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={handleImageSearchOpen}
                                >
                                    <ImageSearchIcon sx={{ fontSize: 16, marginRight: '5px' }} />
                                    Search with image
                                </button>
                                <button
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={requestMicrophoneAccess}
                                >
                                    <MicIcon sx={{ fontSize: 16, marginRight: '5px' }} />   
                                    Search with voice
                                </button>
                            </div>
                        </div>

                        <section className='search-block' ref={showSuggestiongsRef} style={{ display: 'block' }}>
                            <Container>
                                <Row>
                                    <Col lg="6" className="offset-lg-3">
                                        {
                                            searchsuggestions.length > 0 &&
                                            <div className='d-flex flex-row align-items-start justify-content-start flex-wrap gap-3 mt-3'>
                                                {
                                                    searchsuggestions.map((value, key) => (
                                                        <div
                                                            className='d-flex align-items-center justify-content-between cursor-pointer p-2 border rounded'
                                                            style={{ cursor: 'pointer' }}
                                                            key={key}
                                                            onClick={(e) => {
                                                                setSmartFilterLoading(true);
                                                                handleUserSearch(e, value);
                                                            }}
                                                        >
                                                            <TrendingUpIcon sx={{ fontSize: '18px', marginRight: '5px' }} />
                                                            <h6 className='m-0 p-0' style={{ fontSize: 12, textTransform: 'capitalize' }}>{value}</h6>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        }
                                    </Col>
                                </Row>
                            </Container>
                        </section>

                    </section>

                    {/* SEARCH RESULTS SECTION - REMAINS THE SAME */}
                    {/* SEARCH RESULTS SECTION - FIXED TAB PANELS */}
                    <section className="search-block mt-5" ref={searchResultsRef} style={{ display: 'none' }}>
                        {
                            searchStart ?
                                <div className="loader-wrapper" style={{ position: 'relative', height: 'auto', width: 'auto', marginTop: '200px' }}>
                                    <div className="loader"></div>
                                </div>
                                :

                                (lifestyleSearchResults?.length === 0 && educationSearchResults?.length === 0 && hotelSearchResults?.length === 0 && essentialSearchResults?.length === 0 && nonEssentialSearchResults?.length === 0) ?
                                    <div className='container my-5 d-flex flex-column align-items-center'>
                                        <h3>Oops! no results for {userSearchedQuery}</h3>
                                        <p>Double-check your spelling: Make sure all words are spelled correctly</p>
                                        <h5 className='m-0 p-0 mt-4' style={{ lineHeight: '10px', fontWeight: '600' }}>Need help ? </h5>
                                        <div className='d-flex gap-2 mt-3'>
                                            <Link href='/page/helpcenter'>Help center </Link>
                                            <span>Or</span>
                                            <span style={{ color: 'rgba(13, 110, 253)', cursor: 'pointer' }} onClick={createNewChat}>Contact us </span>
                                        </div>
                                    </div>
                                    :
                                    <section className="search-block">
                                        {/* Display AI Filter Component */}
                                        {isAdvancedFilter && renderAIFilterComponent()}

                                        <Tabs className="theme-tab" onSelect={(index) => {
                                            const tabs = ['all', 'lifestyle', 'education', 'hotels', 'essential', 'nonEssential'];
                                            const visibleTabs = [];

                                            if (lifestyleSearchResults?.length !== 0 || educationSearchResults?.length !== 0 || hotelSearchResults?.length !== 0 || essentialSearchResults?.length !== 0 || nonEssentialSearchResults?.length !== 0) {
                                                visibleTabs.push('all');
                                            }
                                            if (lifestyleSearchResults?.length !== 0) visibleTabs.push('lifestyle');
                                            if (educationSearchResults?.length !== 0) visibleTabs.push('education');
                                            if (hotelSearchResults?.length !== 0) visibleTabs.push('hotels');
                                            if (essentialSearchResults?.length !== 0) visibleTabs.push('essential');
                                            if (nonEssentialSearchResults?.length !== 0) visibleTabs.push('nonEssential');

                                            setActiveTab(visibleTabs[index]);
                                        }}>
                                            <TabList className="tabs tab-title">
                                                {
                                                    (lifestyleSearchResults?.length !== 0 || educationSearchResults?.length !== 0 || hotelSearchResults?.length !== 0 || essentialSearchResults?.length !== 0 || nonEssentialSearchResults?.length !== 0) &&
                                                    <Tab style={{ fontSize: '15px' }}>All</Tab>
                                                }
                                                {
                                                    lifestyleSearchResults?.length !== 0 &&
                                                    <Tab style={{ fontSize: '15px' }}>Lifestyle ({lifestyleSearchResults?.length})</Tab>
                                                }
                                                {
                                                    educationSearchResults?.length !== 0 &&
                                                    <Tab style={{ fontSize: '15px' }}>Education ({educationSearchResults?.length})</Tab>
                                                }
                                                {
                                                    hotelSearchResults?.length !== 0 &&
                                                    <Tab style={{ fontSize: '15px' }}>Hotels ({hotelSearchResults?.length})</Tab>
                                                }
                                                {
                                                    essentialSearchResults?.length !== 0 &&
                                                    <Tab style={{ fontSize: '15px' }}>Essential ({essentialSearchResults?.length})</Tab>
                                                }
                                                {
                                                    nonEssentialSearchResults?.length !== 0 &&
                                                    <Tab style={{ fontSize: '15px' }}>Non Essential ({nonEssentialSearchResults?.length})</Tab>
                                                }
                                            </TabList>

                                            {/* ALL TAB - Shows all categories */}
                                            {(lifestyleSearchResults?.length !== 0 || educationSearchResults?.length !== 0 || hotelSearchResults?.length !== 0 || essentialSearchResults?.length !== 0 || nonEssentialSearchResults?.length !== 0) && (
                                                <TabPanel>
                                                    <div>
                                                        {lifestyleSearchResults?.length !== 0 && (
                                                            <div>
                                                                <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Lifestyle products</h6>
                                                                <Row className="no-slider">
                                                                    {lifestyleSearchResults?.map((product, key) => (
                                                                        <ProductItem
                                                                            key={key}
                                                                            product={product}
                                                                            productImage={product?.image}
                                                                            productstype={'lifestyle'}
                                                                            title={product?.lifestyle_name}
                                                                            productcurrency={product?.currency}
                                                                            adultRate={product?.adult_rate}
                                                                            childRate={product?.child_rate}
                                                                            packageRate={product?.package_rate}
                                                                            description={product?.lifestyle_description}
                                                                            rating={4}
                                                                            addWishlist={() => contextWishlist.addToWish(product)}
                                                                            addCart={() => context.addToCart(product, quantity)}
                                                                            addCompare={() => comapreList.addToCompare(product)}
                                                                            cartClass={'cart-info cart-wrap'}
                                                                            backImage={true}
                                                                        />
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        )}

                                                        {educationSearchResults?.length !== 0 && (
                                                            <div>
                                                                <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Education products</h6>
                                                                <Row className="no-slider">
                                                                    {educationSearchResults?.map((product, key) => (
                                                                        <ProductItem
                                                                            key={key}
                                                                            product={product}
                                                                            productImage={product?.image_path.split(',')[0]}
                                                                            productstype={'education'}
                                                                            title={product?.course_name}
                                                                            productcurrency={product?.currency}
                                                                            adultRate={product?.adult_course_fee}
                                                                            childRate={product?.child_course_fee}
                                                                            description={product?.course_description}
                                                                            rating={4}
                                                                            addWishlist={() => contextWishlist.addToWish(product)}
                                                                            addCart={() => context.addToCart(product, quantity)}
                                                                            addCompare={() => comapreList.addToCompare(product)}
                                                                            cartClass={'cart-info cart-wrap'}
                                                                            backImage={true}
                                                                        />
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        )}

                                                        {hotelSearchResults?.length !== 0 && (
                                                            <div>
                                                                <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Hotel products</h6>
                                                                <Row className="no-slider">
                                                                    {hotelSearchResults?.map((product, key) => (
                                                                        <ProductItem
                                                                            key={key}
                                                                            product={product}
                                                                            hotelSearchCustomerData={hotelSearchCustomerData}
                                                                            hotelAddress={product?.HotelAddress}
                                                                            provider={product?.provider}
                                                                            productcurrency={product?.Currency}
                                                                            mrp={product?.TotalRate}
                                                                            hotelCode={product?.provider === "hotelTbo" ? product?.HotelId : product?.provider === "hotelTboH" ? product?.HotelId : product?.provider === "ratehawk" ? product?.HotelId : product?.HotelCode}
                                                                            productImage={product?.HotelPicture}
                                                                            productstype={'hotels'}
                                                                            title={product?.HotelName}
                                                                            description={product?.HotelDescription}
                                                                            rating={product?.HotelCategory}
                                                                            addWishlist={() => contextWishlist.addToWish(product)}
                                                                            addCart={() => context.addToCart(product, quantity)}
                                                                            addCompare={() => comapreList.addToCompare(product)}
                                                                            cartClass={'cart-info cart-wrap'}
                                                                            backImage={true}
                                                                        />
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        )}

                                                        {essentialSearchResults?.length !== 0 && (
                                                            <div>
                                                                <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Essential products</h6>
                                                                <Row className="no-slider">
                                                                    {essentialSearchResults?.map((product, key) => (
                                                                        <ProductItem
                                                                            key={key}
                                                                            product={product}
                                                                            productImage={product?.product_images.split(',')[0]}
                                                                            productstype={'essential'}
                                                                            title={product?.listing_title}
                                                                            productcurrency={product?.currency}
                                                                            mrp={product?.mrp}
                                                                            description={product?.listing_description}
                                                                            rating={4}
                                                                            addWishlist={() => contextWishlist.addToWish(product)}
                                                                            addCart={() => context.addToCart(product, quantity)}
                                                                            addCompare={() => comapreList.addToCompare(product)}
                                                                            cartClass={'cart-info cart-wrap'}
                                                                            backImage={true}
                                                                        />
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        )}

                                                        {nonEssentialSearchResults?.length !== 0 && (
                                                            <div>
                                                                <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Non Essential products</h6>
                                                                <Row className="no-slider">
                                                                    {nonEssentialSearchResults?.map((product, key) => (
                                                                        <ProductItem
                                                                            key={key}
                                                                            product={product}
                                                                            productImage={product?.product_images.split(',')[0]}
                                                                            productstype={'essential'}
                                                                            title={product?.listing_title}
                                                                            productcurrency={product?.currency}
                                                                            mrp={product?.mrp}
                                                                            description={product?.listing_description}
                                                                            rating={4}
                                                                            addWishlist={() => contextWishlist.addToWish(product)}
                                                                            addCart={() => context.addToCart(product, quantity)}
                                                                            addCompare={() => comapreList.addToCompare(product)}
                                                                            cartClass={'cart-info cart-wrap'}
                                                                            backImage={true}
                                                                        />
                                                                    ))}
                                                                </Row>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TabPanel>
                                            )}

                                            {/* LIFESTYLE TAB - Shows only lifestyle products */}
                                            {lifestyleSearchResults?.length !== 0 && (
                                                <TabPanel>
                                                    <Row className="no-slider">
                                                        <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Lifestyle products</h6>
                                                        {lifestyleSearchResults?.map((product, key) => (
                                                            <ProductItem
                                                                key={key}
                                                                product={product}
                                                                productImage={product?.image}
                                                                productstype={'lifestyle'}
                                                                title={product?.lifestyle_name}
                                                                productcurrency={product?.currency}
                                                                adultRate={product?.adult_rate}
                                                                childRate={product?.child_rate}
                                                                packageRate={product?.package_rate}
                                                                description={product?.lifestyle_description}
                                                                rating={4}
                                                                addWishlist={() => contextWishlist.addToWish(product)}
                                                                addCart={() => context.addToCart(product, quantity)}
                                                                addCompare={() => comapreList.addToCompare(product)}
                                                                cartClass={'cart-info cart-wrap'}
                                                                backImage={true}
                                                            />
                                                        ))}
                                                    </Row>
                                                </TabPanel>
                                            )}

                                            {/* EDUCATION TAB - Shows only education products */}
                                            {educationSearchResults?.length !== 0 && (
                                                <TabPanel>
                                                    <Row className="no-slider">
                                                        <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Education products</h6>
                                                        {educationSearchResults?.map((product, key) => (
                                                            <ProductItem
                                                                key={key}
                                                                product={product}
                                                                productImage={product?.image_path.split(',')[0]}
                                                                productstype={'education'}
                                                                title={product?.course_name}
                                                                productcurrency={product?.currency}
                                                                adultRate={product?.adult_course_fee}
                                                                childRate={product?.child_course_fee}
                                                                description={product?.course_description}
                                                                rating={4}
                                                                addWishlist={() => contextWishlist.addToWish(product)}
                                                                addCart={() => context.addToCart(product, quantity)}
                                                                addCompare={() => comapreList.addToCompare(product)}
                                                                cartClass={'cart-info cart-wrap'}
                                                                backImage={true}
                                                            />
                                                        ))}
                                                    </Row>
                                                </TabPanel>
                                            )}

                                            {/* HOTELS TAB - Shows only hotel products */}
                                            {hotelSearchResults?.length !== 0 && (
                                                <TabPanel>
                                                    <Row className="no-slider">
                                                        <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Hotel products</h6>
                                                        {hotelSearchResults?.map((product, key) => (
                                                            <ProductItem
                                                                key={key}
                                                                product={product}
                                                                hotelSearchCustomerData={hotelSearchCustomerData}
                                                                hotelAddress={product?.HotelAddress}
                                                                provider={product?.provider}
                                                                productcurrency={product?.Currency}
                                                                mrp={product?.TotalRate}
                                                                hotelCode={product?.provider === "hotelTbo" ? product?.HotelId : product?.provider === "hotelTboH" ? product?.HotelId : product?.provider === "ratehawk" ? product?.HotelId : product?.HotelCode}
                                                                productImage={product?.HotelPicture}
                                                                productstype={'hotels'}
                                                                title={product?.HotelName}
                                                                description={product?.HotelDescription}
                                                                rating={product?.HotelCategory}
                                                                addWishlist={() => contextWishlist.addToWish(product)}
                                                                addCart={() => context.addToCart(product, quantity)}
                                                                addCompare={() => comapreList.addToCompare(product)}
                                                                cartClass={'cart-info cart-wrap'}
                                                                backImage={true}
                                                            />
                                                        ))}
                                                    </Row>
                                                </TabPanel>
                                            )}

                                            {/* ESSENTIAL TAB - Shows only essential products */}
                                            {essentialSearchResults?.length !== 0 && (
                                                <TabPanel>
                                                    <Row className="no-slider">
                                                        <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Essential products</h6>
                                                        {essentialSearchResults?.map((product, key) => (
                                                            <ProductItem
                                                                key={key}
                                                                product={product}
                                                                productImage={product?.product_images.split(',')[0]}
                                                                productstype={'essential'}
                                                                title={product?.listing_title}
                                                                productcurrency={product?.currency}
                                                                mrp={product?.mrp}
                                                                description={product?.listing_description}
                                                                rating={4}
                                                                addWishlist={() => contextWishlist.addToWish(product)}
                                                                addCart={() => context.addToCart(product, quantity)}
                                                                addCompare={() => comapreList.addToCompare(product)}
                                                                cartClass={'cart-info cart-wrap'}
                                                                backImage={true}
                                                            />
                                                        ))}
                                                    </Row>
                                                </TabPanel>
                                            )}

                                            {/* NON ESSENTIAL TAB - Shows only non-essential products */}
                                            {nonEssentialSearchResults?.length !== 0 && (
                                                <TabPanel>
                                                    <Row className="no-slider">
                                                        <h6 className='p-3' style={{ fontWeight: '500', fontSize: '14px' }}>Non Essential products</h6>
                                                        {nonEssentialSearchResults?.map((product, key) => (
                                                            <ProductItem
                                                                key={key}
                                                                product={product}
                                                                productImage={product?.product_images.split(',')[0]}
                                                                productstype={'essential'}
                                                                title={product?.listing_title}
                                                                productcurrency={product?.currency}
                                                                mrp={product?.mrp}
                                                                description={product?.listing_description}
                                                                rating={4}
                                                                addWishlist={() => contextWishlist.addToWish(product)}
                                                                addCart={() => context.addToCart(product, quantity)}
                                                                addCompare={() => comapreList.addToCompare(product)}
                                                                cartClass={'cart-info cart-wrap'}
                                                                backImage={true}
                                                            />
                                                        ))}
                                                    </Row>
                                                </TabPanel>
                                            )}
                                        </Tabs>
                                    </section>
                        }
                    </section>

                </Container>
            </section>

            {/* ADVANCED SEARCH CHATBOT - OPTIONAL */}
            {isAdvanceSearchActive && (
                <LifestyleChatbot
                    handleUserFilterData={handleChatbotFilterData}
                    globalSearch={true}
                    isLoading={smartFilterLoading}
                />
            )}

            {/* Smart Filter Loading Overlay */}
            {smartFilterLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '2rem',
                        borderRadius: '10px',
                        textAlign: 'center',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <SearchIcon sx={{ fontSize: 40, color: '#ed4242', marginRight: '10px' }} />
                            <div className="loader"></div>
                        </div>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#666' }}>
                            Please wait while we process your search
                        </p>
                    </div>
                </div>
            )}

        </CommonLayout>
    )
}

export default Search;