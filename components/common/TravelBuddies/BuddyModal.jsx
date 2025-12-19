import React, { useContext, useEffect, useState } from "react";
import {
    addPerson,
    editPerson,
    getPerson,
} from "../../../AxiosCalls/UserServices/peopleFormServices";
import { AppContext } from "../../../pages/_app";
import { Button, Col, Row } from "reactstrap";
import TravelBuddiesModal from "./TravelBuddiesModal";
import TravelBuddiesTBOModal from "./TravelBuddiesTBO.jsx";
import { Edit } from "@mui/icons-material";
import ToastMessage from "../../Notification/ToastMessage";
import InfoIcon from "@mui/icons-material/Info";

export default function BuddyModal({
    adultCount = 0,
    childCount = 0,
    handleTravelBuddies,
    adultDetails,
    childsDetails,
    childAges,
    provider = null,
    preBookData = null,
    providerlife = null,
    ticketsDetails,
    education = null,
    transportCount = null,
    selectPassengerType = 'all'
}) {
    console.log("budadddyyyyyyyy isss po", selectPassengerType);

    const { userId } = useContext(AppContext);
    const preBookingValidate = preBookData?.preBookValidations;
    const [travelBuddies, setTravelBuddies] = useState([]);
    const [selectedBuddies, setSelectedBuddies] = useState([]);
    const [passportForm, setPassportForm] = useState(false);
    const [tboBuddies, setTboBuddies] = useState([]);
    const adults = travelBuddies.filter((data) => data.PaxType === "1");
    const children = travelBuddies.filter((data) => data.PaxType === "2");
    const [adultCountSelected, setAdultCountSelected] = useState(0);
    const [childCountSelected, setChildCountSelected] = useState(0);
    const [buddiesCount, setBuddiesCount] = useState(0);
    const [totalSelectedCount, setTotalSelectedCount] = useState(0);

    useEffect(() => {
        console.log("adultDetails", adultDetails);
        setAdultCountSelected(adultDetails.length);
        setChildCountSelected(childsDetails.length);
    }, [adultDetails, childsDetails]);

    useEffect(() => {
        if (providerlife === "bridgify" || providerlife === "globaltix") {
            let totalCount = 0;
            if (providerlife === "bridgify" && transportCount != null) {
                console.log("data issssss tickers", adults);
                totalCount = transportCount; // Use transportCount if available
            } else if (providerlife === "bridgify") {
                totalCount = ticketsDetails?.tickets?.reduce((total, ticket) => {
                    return total + (ticket.quantity || 0);
                }, 0);
                console.log("data issssss tickers", ticketsDetails);
            } else if (providerlife === "globaltix") {
                console.log("budadddyyyyyyyy", adultCount + childCount);
                totalCount = adultCount + childCount; // Total pax count for globaltix
            }
            setBuddiesCount(totalCount);
            console.log("Total buddies count:", totalCount);
        }
    }, [providerlife, adultCount, childCount, ticketsDetails, transportCount]);

    const [selectedPassengerType, setSelectedPassengerType] = useState(selectPassengerType);
    const handlePassengerTypeChange = (event) => {
        console.log("Selected passenger type:", event.target.value);
        setSelectedPassengerType(event.target.value);
        setSelectedBuddies([]);
        setAdultCountSelected(0);
        setChildCountSelected(0);
    };

    const [travelPax, setTravelPax] = useState(false);
    const [buddyType, setBuddyType] = useState("");
    const handleOnAddTravelBuddy = () => {
        setTravelPax(!travelPax);
        setBuddyType("add");
    };

    const [balanceReqCount, setBalanceReqCount] = useState({
        adult: "",
        child: "",
    });

    const [currentState, setCurrentState] = useState("Add");
    const [selectedPaxData, setSelectedPaxData] = useState([]);

    useEffect(() => {
        if (adultCount > 1) {
            if (
                adultDetails[1] &&
                adultDetails[0]?.FirstName === adultDetails[1]?.FirstName &&
                adultDetails[0]?.LastName === adultDetails[1]?.LastName
            ) {
                setSelectedPassengerType("lead");
            }
        }
    }, [adultCount, adultDetails]);

    const getPersonData = () => {
        getPerson(userId).then((res) => {
            console.log("buddyessss", res);
            setTravelBuddies(res);
        });
    };

    const handleOnUpdateClick = (data) => {
        setCurrentState("Update");
        setSelectedPaxData(data);
        setTravelPax(!travelPax);
        setBuddyType("edit");
    };

    const handleSubmitBuddies = (value) => {
        console.log("value in handleSubmitBuddies", value);
        let updatedBuddies;
        value["Age"] = parseInt(value?.Age);

        if (selectedPassengerType === "lead") {
            if (selectedBuddies.length > 0) {
                const hasPaxType2 = selectedBuddies.some(
                    (buddy) => buddy.PaxType === "2"
                );

                if (hasPaxType2) {
                    updatedBuddies = selectedBuddies.map((buddy) => {
                        if (buddy.PaxType === "2" && buddy.id === value.id) {
                            return { ...value, PaxType: "2" };
                        } else if (buddy.id === value.id) {
                            return { ...value, PaxType: buddy.PaxType };
                        }
                        return buddy;
                    });
                } else {
                    const existingBuddy = selectedBuddies.find((b) => b.id === value.id);
                    if (existingBuddy) {
                        updatedBuddies = selectedBuddies.map((buddy) =>
                            buddy.id === value.id
                                ? { ...value, PaxType: buddy.PaxType }
                                : buddy
                        );
                    } else {
                        value["PaxType"] = "1";
                        updatedBuddies = [...selectedBuddies, value];
                    }
                }
            } else {
                updatedBuddies = selectedBuddies.map((res) => {
                    return res.id === value.id ? value : res;
                });
            }
        } else {
            updatedBuddies = selectedBuddies.map((res) => {
                return res.id === value.id ? value : res;
            });
        }
        console.log(updatedBuddies, "DataaaaaaaaaaaaaaaX");
        // return
        setSelectedBuddies(updatedBuddies);
        value["UserID"] = userId;
        if (currentState === "Add" || !travelPax) {
            addPerson(value).then((response) => {
                ToastMessage({
                    status: "success",
                    message: "Travel Buddy added successfully",
                });
                getPersonData();
            });
        } else {
            editPerson(value, value?.id).then((response) => {
                ToastMessage({
                    status: "success",
                    message: "Travel Buddy Updated Successfully",
                });
                getPersonData();
            });
        }
        setTravelPax(!travelPax);
    };

    const handleAddBuddies = () => {
        setTravelPax(false);
        if (currentState === "Update") {
            setCurrentState("Add");
        }
    };

    const handleAddBuddiesTBO = () => {
        setPassportForm(!passportForm);
    };

    // const handleValidateChildAges = () => {
    //     // Skip child age validation for bridgify and globaltix
    //     if(providerlife === "bridgify" || providerlife === "globaltix"){
    //         return true;
    //     }
    //     console.log("selectedBuddies in handleValidateChildAges", selectedBuddies)

    //     if(education === "education"){
    //         return children.length === 0 && ages.length === 0;
    //     } else {
    //         const children = selectedBuddies.filter(pax => pax.PaxType === "2");
    //         const ages = childAges ? Object.values(childAges).map(age => parseInt(age, 10)) : [];
    //         for (let i = 0; i < children.length; i++) {
    //             const childAge = children[i].Age;
    //             const ageIndex = ages.indexOf(childAge);
    //             if (ageIndex !== -1) {
    //                 ages.splice(ageIndex, 1);
    //                 children.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //         return children.length === 0 && ages.length === 0;
    //     }
    // }

    //     const handleValidateChildAges = () => {
    //     // Skip child age validation for bridgify and globaltix
    //     if(providerlife === "bridgify" || providerlife === "globaltix"){
    //         return true;
    //     }

    //     // First check if there are any children (PaxType === "2")
    //     const hasChildren = selectedBuddies.some(pax => pax.PaxType === "2");
    //     if (!hasChildren) {
    //         return true; // No children found, validation passes
    //     }

    //     if(education === "education"){
    //         return children.length === 0 && ages.length === 0;
    //     } else {
    //         const children = selectedBuddies.filter(pax => pax.PaxType === "2");
    //         const ages = childAges ? Object.values(childAges).map(age => parseInt(age, 10)) : [];
    //         for (let i = 0; i < children.length; i++) {
    //             const childAge = children[i].Age;
    //             const ageIndex = ages.indexOf(childAge);
    //             if (ageIndex !== -1) {
    //                 ages.splice(ageIndex, 1);
    //                 children.splice(i, 1);
    //                 i--;
    //             }
    //         }
    //         return children.length === 0 && ages.length === 0;
    //     }
    // }

    const handleValidateChildAges = () => {
        // Skip child age validation for bridgify and globaltix
        if (providerlife === "bridgify" || providerlife === "globaltix" || providerlife === "cebu") {
            return true;
        }

        // First check if there are any children (PaxType === "2")
        const hasChildren = selectedBuddies.some((pax) => pax.PaxType === "2");
        if (!hasChildren) {
            return true; // No children found, validation passes
        }

        if (education === "education") {
            return children.length === 0 && ages.length === 0;
        } else {
            const children = selectedBuddies.filter((pax) => pax.PaxType === "2");
            const ages = childAges
                ? Object.values(childAges).map((age) => parseInt(age, 10))
                : [];
            const originalAges = [...ages]; // Keep a copy for error message

            for (let i = 0; i < children.length; i++) {
                const childAge = children[i].Age;
                const ageIndex = ages.indexOf(childAge);
                if (ageIndex !== -1) {
                    ages.splice(ageIndex, 1);
                    children.splice(i, 1);
                    i--;
                }
            }

            const isValid = children.length === 0 && ages.length === 0;

            // If validation fails, store the required ages for error message
            if (!isValid) {
                window.requiredChildAges = originalAges;
            }

            return isValid;
        }
    };

    // const validateTBOTravelBuddies = (data) => {
    //     console.log("dataaaaaaa", data)
    //     if (handleValidateChildAges()) {
    //         ToastMessage({ status: "success", message: "Travel buddies selected successfully" });
    //         handleTravelBuddies(data);
    //         setPassportForm(false)
    //         console.log("finall dataaaaaaaaaaaa", data)
    //     } else {
    //         ToastMessage({ status: "warning", message: "Children ages are not matching." });
    //     }
    // }

    const validateTBOTravelBuddies = (data) => {
        console.log("dataaaaaaa", data);
        if (handleValidateChildAges()) {
            ToastMessage({
                status: "success",
                message: "Travel buddies selected successfully",
            });
            handleTravelBuddies(data, selectedPassengerType);
            setPassportForm(false);
            console.log("finall dataaaaaaaaaaaa", data);
        } else {
            const requiredAges = window.requiredChildAges
                ? window.requiredChildAges.join(", ")
                : "";
            const message = requiredAges
                ? `Children ages are not matching. Required child ages: ${requiredAges}`
                : "Children ages are not matching.";
            ToastMessage({ status: "warning", message });
        }
    };

    const handleOnPressSelectPackage = () => {
        // Special case for globaltix - only check total count matches

        if (providerlife === 'zetexa') {
            if (selectedBuddies.length > 0) {
                if (selectedBuddies[0].Email === null || selectedBuddies[0].Email === undefined || selectedBuddies[0].Email === "") {
                    console.log("Zetexa provider detected, skipping buddy selection validation.", selectedBuddies);
                    ToastMessage({
                        status: "warning",
                        message: `Please add the email ID field for the selected travel buddy`,
                    });
                    return true
                }
            }
        }

        console.log("typeeeeee pro", selectedBuddies);
        // return;
        if (providerlife === "globaltix") {
            if (totalSelectedCount === buddiesCount) {
                ToastMessage({
                    status: "success",
                    message: "Travel buddies selected successfully",
                });
                handleTravelBuddies(selectedBuddies, selectedPassengerType);
            } else {
                ToastMessage({
                    status: "error",
                    message: `Please select exactly ${buddiesCount} travel buddies. Currently selected: ${totalSelectedCount}`,
                });
            }
            return;
        }

        // Special case for bridgify with lead passenger
        if (providerlife === "bridgify" && selectedPassengerType === "lead") {
            if (totalSelectedCount === buddiesCount) {
                ToastMessage({
                    status: "success",
                    message: "Travel buddies selected successfully",
                });
                handleTravelBuddies(selectedBuddies, selectedPassengerType);
            } else {
                ToastMessage({
                    status: "error",
                    message: `Please select exactly ${buddiesCount} travel buddies. Currently selected: ${totalSelectedCount}`,
                });
            }
            return;
        }

        // Special case for bridgify with all passengers
        if (providerlife === "bridgify" && selectedPassengerType === "all") {
            if (totalSelectedCount === buddiesCount) {
                ToastMessage({
                    status: "success",
                    message: "Travel buddies selected successfully",
                });
                handleTravelBuddies(selectedBuddies, selectedPassengerType);
            } else {
                ToastMessage({
                    status: "error",
                    message: `Please select exactly ${buddiesCount} travel buddies. Currently selected: ${totalSelectedCount}`,
                });
            }
            return;
        }

        // Original logic for other providers
        if (adultFreeze && childFreeze) {
            if (provider == "hotelTbo") {
                if (
                    selectedPassengerType === "lead" &&
                    preBookingValidate?.SamePaxNameAllowed == false
                ) {
                    ToastMessage({
                        status: "warning",
                        message: "Cannot add lead pessanger for this booking",
                    });
                } else if (
                    selectedPassengerType === "lead" &&
                    preBookingValidate?.SamePaxNameAllowed == true
                ) {
                    handleTravelBuddies(selectedBuddies, selectedPassengerType);
                } else {
                    if (
                        preBookingValidate?.PanMandatory == true ||
                        preBookingValidate?.PassportMandatory == true
                    ) {
                        setTboBuddies(selectedBuddies);
                        setPassportForm(true);
                    } else if (
                        preBookingValidate?.PanMandatory == false &&
                        preBookingValidate?.PassportMandatory == false
                    ) {
                        // if (handleValidateChildAges()) {
                        //     ToastMessage({ status: "success", message: "Travel buddies selected successfully" });
                        //     handleTravelBuddies(selectedBuddies);
                        // } else {
                        //     ToastMessage({ status: "warning", message: "Children ages are not matching." });
                        // }
                        if (handleValidateChildAges()) {
                            ToastMessage({
                                status: "success",
                                message: "Travel buddies selected successfully",
                            });
                            handleTravelBuddies(selectedBuddies, selectedPassengerType);
                        } else {
                            const requiredAges = window.requiredChildAges
                                ? window.requiredChildAges.join(", ")
                                : "";
                            const message = requiredAges
                                ? `Children ages are not matching. Required child ages: ${requiredAges}`
                                : "Children ages are not matching. ";
                            ToastMessage({ status: "warning", message });
                        }
                    }
                }
                // ToastMessage({ status: "success", message: "TBO selected successfully" });
            } else {
                if (selectedPassengerType === "lead") {
                    ToastMessage({
                        status: "success",
                        message: "Travel buddies selected successfully",
                    });
                    handleTravelBuddies(selectedBuddies, selectedPassengerType);
                } else {
                    if (education === "education") {
                        ToastMessage({
                            status: "success",
                            message: "Travel buddies selected successfully",
                        });
                        handleTravelBuddies(selectedBuddies, selectedPassengerType);
                    } else {
                        if (handleValidateChildAges()) {
                            ToastMessage({
                                status: "success",
                                message: "Travel buddies selected successfully",
                            });
                            handleTravelBuddies(selectedBuddies, selectedPassengerType);
                        } else {
                            const requiredAges = window.requiredChildAges
                                ? window.requiredChildAges.join(", ")
                                : "";
                            const message = requiredAges
                                ? `Children ages are not matching. Required child ages: ${requiredAges}`
                                : "Children ages are not matching. ";
                            ToastMessage({ status: "warning", message });
                        }
                    }
                }
            }
        } else if (
            !adultFreeze &&
            !childFreeze &&
            selectedPassengerType === "all"
        ) {
            ToastMessage({
                status: "error",
                message: "Please choose your adults and children",
            });
        } else if (!adultFreeze) {
            if (selectedBuddies.length === 0) {
                ToastMessage({
                    status: "error",
                    message:
                        "No travel buddies selected. Please select the travel buddies",
                });
            } else {
                ToastMessage({
                    status: "error",
                    message:
                        "the number of adults selected does not match the expected count.",
                });
            }

        } else if (!childFreeze) {
            ToastMessage({
                status: "error",
                message:
                    "the number of children selected does not match the expected count.",
            });
        } else {
            ToastMessage({
                status: "error",
                message:
                    "the number of travel buddies does not match the total count of adults and children. Please ensure all details are correctly filled out.",
            });
        }
    };

    // const handleSelectCheck = (buddy) => {
    //     if (providerlife === "globaltix") {
    //         // For globaltix only, simply toggle the buddy in the selected list without any adult/child restrictions
    //         setSelectedBuddies((prevSelected) => {
    //             if (prevSelected.find(b => b.id === buddy.id)) {
    //                 return prevSelected.filter(b => b.id !== buddy.id);
    //             } else {
    //                 if (totalSelectedCount < buddiesCount) {
    //                     return [...prevSelected, buddy];
    //                 } else {
    //                     ToastMessage({ status: "warning", message: `Cannot select more than ${buddiesCount} travel buddies` });
    //                     return prevSelected;
    //                 }
    //             }
    //         });
    //     } else if (providerlife === "bridgify") {
    //         // Handle bridgify provider logic
    //         if (selectedPassengerType === "lead") {
    //             setSelectedBuddies((prevSelected) => {
    //                 if (prevSelected.find(b => b.id === buddy.id)) {
    //                     // Deselect all instances of this buddy
    //                     return prevSelected.filter(b => b.id !== buddy.id);
    //                 } else {
    //                     // Create multiple instances of the same buddy for bridgify count
    //                     let newSelected = [];
    //                     for (let i = 0; i < buddiesCount; i++) {
    //                         let buddyCopy = { ...buddy };
    //                         newSelected.push(buddyCopy);
    //                     }
    //                     return newSelected;
    //                 }
    //             });
    //         } else if (selectedPassengerType === "all") {
    //             // For bridgify, handle individual selection with total count check
    //             setSelectedBuddies((prevSelected) => {
    //                 if (prevSelected.find(b => b.id === buddy.id)) {
    //                     return prevSelected.filter(b => b.id !== buddy.id);
    //                 } else {
    //                     if (totalSelectedCount < buddiesCount) {
    //                         return [...prevSelected, buddy];
    //                     } else {
    //                         ToastMessage({ status: "warning", message: `Cannot select more than ${buddiesCount} travel buddies` });
    //                         return prevSelected;
    //                     }
    //                 }
    //             });
    //         }
    //     } else if (selectedPassengerType === "lead") {
    //         setSelectedBuddies((prevSelected) => {
    //             if (prevSelected.find(b => b.id === buddy.id)) {
    //                 setAdultCountSelected(0)
    //                 setChildCountSelected(0)
    //                 return prevSelected.filter(b => b.id !== buddy.id);
    //             } else {
    //                 let newSelected = [];

    //                 for (let i = 0; i < adultCount; i++) {
    //                     let adultBuddy = { ...buddy, "PaxType":"1" };
    //                     newSelected.push(adultBuddy);
    //                 }
    //                 for (let i = 0; i < childCount; i++) {
    //                     let childBuddy = { ...buddy, Age: childAges[`child${i}`],"PaxType":"2" };
    //                     console.log(childBuddy, "Buddy Age", [`child${i}`]);
    //                     newSelected.push(childBuddy);
    //                 }
    //                 setAdultCountSelected(adultCount)
    //                 setChildCountSelected(childCount)
    //                 return newSelected;
    //             }
    //         });
    //     } else if (selectedPassengerType === "all") {
    //         setSelectedBuddies((prevSelected) => {
    //             if (prevSelected.find(b => b.id === buddy.id)) {
    //                 console.log("buddy id", prevSelected)

    //                 if (buddy.PaxType === "1") {
    //                     setAdultCountSelected(adultCountSelected - 1)
    //                 }else{
    //                     setChildCountSelected(childCountSelected - 1)
    //                 }

    //                 return prevSelected.filter(b => b.id !== buddy.id);

    //             } else {
    //                 if (buddy.PaxType === "1") {
    //                     setAdultCountSelected(adultCountSelected + 1)
    //                 }else{
    //                     setChildCountSelected(childCountSelected + 1)
    //                 }
    //                 return [...prevSelected, buddy];
    //             }
    //         });
    //     }
    // };

    const handleChildLeadClick = () => {
        ToastMessage({
            status: "warning",
            message: "Child cannot be selected as the lead passenger"
        });
    };

    const handleSelectCheck = (buddy) => {
        if (providerlife === "globaltix") {
            // For globaltix only, simply toggle the buddy in the selected list without any adult/child restrictions
            setSelectedBuddies((prevSelected) => {
                const isCurrentlySelected = prevSelected.find((b) => b.id === buddy.id);

                if (isCurrentlySelected) {
                    // Update counts based on current selection before removing
                    if (buddy.PaxType === "1") {
                        setAdultCountSelected((prev) => prev - 1);
                    } else {
                        setChildCountSelected((prev) => prev - 1);
                    }

                    return prevSelected.filter((b) => b.id !== buddy.id);
                    //tresting
                } else {
                    // Check if we can add this buddy based on type and limits
                    const currentAdultCount = prevSelected.filter(
                        (b) => b.PaxType === "1"
                    ).length;
                    const currentChildCount = prevSelected.filter(
                        (b) => b.PaxType === "2"
                    ).length;

                    if (buddy.PaxType === "1" && currentAdultCount >= adultCount) {
                        ToastMessage({
                            status: "warning",
                            message: `Cannot select more than ${adultCount} adults`,
                        });
                        return prevSelected;
                    }

                    if (buddy.PaxType === "2" && currentChildCount >= childCount) {
                        ToastMessage({
                            status: "warning",
                            message: `Cannot select more than ${childCount} children`,
                        });
                        return prevSelected;
                    }

                    // Update counts based on what we're adding
                    if (buddy.PaxType === "1") {
                        setAdultCountSelected((prev) => prev + 1);
                    } else {
                        setChildCountSelected((prev) => prev + 1);
                    }

                    return [...prevSelected, buddy];
                }
            });
        } else if (providerlife === "bridgify") {
            // Handle bridgify provider logic with adult/child count validation
            if (selectedPassengerType === "lead") {
                setSelectedBuddies((prevSelected) => {
                    if (prevSelected.find((b) => b.id === buddy.id)) {
                        // Deselect all instances of this buddy
                        return prevSelected.filter((b) => b.id !== buddy.id);
                    } else {
                        // Create multiple instances based on adult and child counts
                        let newSelected = [];

                        // Add adults
                        for (let i = 0; i < adultCount; i++) {
                            let adultBuddy = { ...buddy, PaxType: "1" };
                            newSelected.push(adultBuddy);
                        }

                        // Add children with ages
                        for (let i = 0; i < childCount; i++) {
                            let childBuddy = {
                                ...buddy,
                                Age: childAges[`child${i}`],
                                PaxType: "2",
                            };
                            newSelected.push(childBuddy);
                        }
                        setAdultCountSelected(adultCount);
                        setChildCountSelected(childCount);
                        return newSelected;
                    }
                });
            } else if (selectedPassengerType === "all") {
                // For bridgify, handle individual selection with adult/child count validation
                setSelectedBuddies((prevSelected) => {
                    const isCurrentlySelected = prevSelected.find(
                        (b) => b.id === buddy.id
                    );

                    if (isCurrentlySelected) {
                        // Update counts based on current selection before removing
                        if (buddy.PaxType === "1") {
                            setAdultCountSelected((prev) => prev - 1);
                        } else {
                            setChildCountSelected((prev) => prev - 1);
                        }

                        return prevSelected.filter((b) => b.id !== buddy.id);
                    } else {
                        // Check if we can add this buddy based on type and limits
                        const currentAdultCount = prevSelected.filter(
                            (b) => b.PaxType === "1"
                        ).length;
                        const currentChildCount = prevSelected.filter(
                            (b) => b.PaxType === "2"
                        ).length;

                        if (buddy.PaxType === "1" && currentAdultCount >= adultCount) {
                            ToastMessage({
                                status: "warning",
                                message: `Cannot select more than ${adultCount} adults`,
                            });
                            return prevSelected;
                        }

                        if (buddy.PaxType === "2" && currentChildCount >= childCount) {
                            ToastMessage({
                                status: "warning",
                                message: `Cannot select more than ${childCount} children`,
                            });
                            return prevSelected;
                        }

                        // Update counts based on what we're adding
                        if (buddy.PaxType === "1") {
                            setAdultCountSelected((prev) => prev + 1);
                        } else {
                            setChildCountSelected((prev) => prev + 1);
                        }

                        return [...prevSelected, buddy];
                    }
                });
            }
        } else if (selectedPassengerType === "lead") {
            setSelectedBuddies((prevSelected) => {
                if (prevSelected.find((b) => b.id === buddy.id)) {
                    setAdultCountSelected(0);
                    setChildCountSelected(0);
                    return prevSelected.filter((b) => b.id !== buddy.id);
                } else {
                    let newSelected = [];

                    for (let i = 0; i < adultCount; i++) {
                        let adultBuddy = { ...buddy, PaxType: "1" };
                        newSelected.push(adultBuddy);
                    }
                    for (let i = 0; i < childCount; i++) {
                        let childBuddy = {
                            ...buddy,
                            Age: childAges[`child${i}`],
                            PaxType: "2",
                        };
                        console.log(childBuddy, "Buddy Age", [`child${i}`]);
                        newSelected.push(childBuddy);
                    }
                    setAdultCountSelected(adultCount);
                    setChildCountSelected(childCount);
                    return newSelected;
                }
            });
        } else if (selectedPassengerType === "all") {
            setSelectedBuddies((prevSelected) => {
                const isCurrentlySelected = prevSelected.find((b) => b.id === buddy.id);

                if (isCurrentlySelected) {
                    console.log("buddy id", prevSelected);

                    // Update counts based on current selection before removing
                    if (buddy.PaxType === "1") {
                        setAdultCountSelected((prev) => prev - 1);
                    } else {
                        setChildCountSelected((prev) => prev - 1);
                    }

                    return prevSelected.filter((b) => b.id !== buddy.id);
                } else {
                    // Update counts based on what we're adding
                    if (buddy.PaxType === "1") {
                        setAdultCountSelected((prev) => prev + 1);
                    } else {
                        setChildCountSelected((prev) => prev + 1);
                    }
                    return [...prevSelected, buddy];
                }
            });
        }
    };
    const [adultFreeze, setAdultFreeze] = useState(false);
    const [childFreeze, setChildFreeze] = useState(false);

    useEffect(() => {
        let adultCnt = 0;
        let childCnt = 0;
        selectedBuddies.map((value) => {
            if (value.PaxType === "1") {
                adultCnt += 1;
            } else if (value.PaxType === "2") {
                childCnt += 1;
            }
        });
        console.log("adultCnt", adultCnt, "childCnt", childCnt);
        console.log("adultCnt", selectedBuddies);

        // Update the total selected count for bridgify/globaltix
        setTotalSelectedCount(selectedBuddies.length);

        // Set freezes for all providers except globaltix
        if (providerlife !== "globaltix") {
            Number(adultCnt) === Number(adultCount)
                ? setAdultFreeze(true)
                : setAdultFreeze(false);
            Number(childCnt) === Number(childCount)
                ? setChildFreeze(true)
                : setChildFreeze(false);
        }
    }, [selectedBuddies, adultCount, childCount, providerlife]);

    useEffect(() => {
        let details = [...adultDetails, ...childsDetails];
        setSelectedBuddies(details);
    }, [adultDetails, childsDetails]);

    useEffect(() => {
        setBalanceReqCount({
            adult: adultCount - adults.length,
            child: childCount - children.length,
        });
    }, [travelBuddies]);

    useEffect(() => {
        getPersonData();
    }, [userId]);

    return (
        <div
            className="p-lg-0"
            style={{
                position: "sticky",
                position: "relative",
                height: "calc(100vh - 210px)",
                overflowX: "hidden",
                overflowY: "auto",
            }}
        >
            <TravelBuddiesModal
                isOpen={travelPax}
                toggle={handleAddBuddies}
                onSubmit={handleSubmitBuddies}
                dataSet={selectedPaxData}
                status={buddyType}
                type={education}
            />
            <TravelBuddiesTBOModal
                isOpen={passportForm}
                toggle={handleAddBuddiesTBO}
                provider={provider}
                buddiesData={tboBuddies}
                preBooking={preBookingValidate}
                submitBuddies={validateTBOTravelBuddies}
            />

            <Col sm="12" lg="12">
                {/* <div >
                 {
                    // Show empty state only for non-bridgify/globaltix providers
                    providerlife !== "bridgify" &&
                        providerlife !== "globaltix" &&
                        (adultCount > adults.length || childCount > children.length) ? (
                        <div className="col-sm-12 empty-cart-cls text-center d-flex align-items-center flex-column">
                            {adultCount > adults.length ||
                                (childCount > children.length && (
                                    <>
                                        <h6 style={{ fontWeight: "600" }}>
                                            Oops! No Travel Buddies
                                        </h6>
                                        <p className="my-1 mb-2">
                                            Add some travel buddies to manage your bookings quickly
                                        </p>
                                        <div className="d-flex align-items-center mx-auto gap-1 mb-3">
                                            <InfoIcon sx={{ fontSize: 13, marginBottom: "-2px" }} />
                                            <p className="m-0 p-0">
                                                {adultCount > adults.length &&
                                                    childCount > children.length
                                                    ? `${balanceReqCount.adult} adult and ${balanceReqCount.child} child is required`
                                                    : adultCount > adults.length
                                                        ? `${balanceReqCount.adult} Adult is required`
                                                        : childCount > children.length
                                                            ? `${balanceReqCount.child} Child is required`
                                                            : null}
                                            </p>
                                        </div>
                                    </>
                                ))}
                        </div>
                    ) : null
                }

                <div className="d-flex justify-content-center mb-3">
                    <div className="form-check form-check-inline">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="passengerSelection"
                            id="selectAllPassengers"
                            value="all"
                            onChange={handlePassengerTypeChange}
                            checked={selectedPassengerType === "all"}
                        />
                        <label className="form-check-label" htmlFor="selectAllPassengers">
                            Select All Passengers
                        </label>
                    </div>
                    {
                        // Show "Select Lead Passenger" option for bridgify as well
                        education === "education" ||
                        provider === "hotelTbobb" ||
                            providerlife === "globaltix" ? null : adultCount === 0 ? null : providerlife === 'zetexa'? null : (
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="passengerSelection"
                                        id="selectLeadPassenger"
                                        value="lead"
                                        onChange={handlePassengerTypeChange}
                                        checked={selectedPassengerType === "lead"}
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor="selectLeadPassenger"
                                    >
                                        Select Lead Passenger Only
                                    </label>
                                </div>
                            )
                    }
                </div>

                <Col className="d-flex flex-row align-items-end pt-2 ml-auto col-12 justify-content-around">
                    <Button
                        className="btn btn-sm btn-solid col-5"
                        onClick={handleOnAddTravelBuddy}
                    >
                        Add Buddies
                    </Button>
                    <Button
                        className="btn btn-sm btn-solid col-5"
                        onClick={handleOnPressSelectPackage}
                    >
                        Next
                    </Button>
                </Col>
            </div> */}
                <div style={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 100,
                    padding: "15px 10px 20px",

                    top: "-10px"

                }}>
                    {
                        // Show empty state only for non-bridgify/globaltix providers
                        providerlife !== "bridgify" &&
                            providerlife !== "globaltix" &&
                            (adultCount > adults.length || childCount > children.length) ? (
                            <div className="col-sm-12 empty-cart-cls text-center d-flex align-items-center flex-column" >
                                {adultCount > adults.length ||
                                    (childCount > children.length && (
                                        <>
                                            <h6 style={{ fontWeight: "600" }}>
                                                Oops! No Travel Buddies
                                            </h6>
                                            <p className="my-1 mb-2">
                                                Add some travel buddies to manage your bookings quickly
                                            </p>
                                            <div className="d-flex align-items-center mx-auto gap-1 mb-3">
                                                <InfoIcon sx={{ fontSize: 13, marginBottom: "-2px" }} />
                                                <p className="m-0 p-0">
                                                    {adultCount > adults.length &&
                                                        childCount > children.length
                                                        ? `${balanceReqCount.adult} adult and ${balanceReqCount.child} child is required`
                                                        : adultCount > adults.length
                                                            ? `${balanceReqCount.adult} Adult is required`
                                                            : childCount > children.length
                                                                ? `${balanceReqCount.child} Child is required`
                                                                : null}
                                                </p>
                                            </div>
                                        </>
                                    ))}
                            </div>
                        ) : null
                    }

                    <div className="mb-3">
                        <div className="form-check mb-3">
                            <input
                                className="form-check-input"
                                type="radio"
                                name="passengerSelection"
                                id="selectAllPassengers"
                                value="all"
                                onChange={handlePassengerTypeChange}
                                checked={selectedPassengerType === "all"}
                            />
                            <label
                                className="form-check-label"
                                htmlFor="selectAllPassengers"
                                style={{ fontSize: "15px", fontWeight: "600", marginLeft: "8px" }}
                            >
                                Select All Passengers
                            </label>
                        </div>
                        {
                            education === "education" ||
                                provider === "hotelTbobb" ||
                                providerlife === "globaltix" ? null : adultCount === 0 ? null : providerlife === 'zetexa' ? null : (
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="radio"
                                            name="passengerSelection"
                                            id="selectLeadPassenger"
                                            value="lead"
                                            onChange={handlePassengerTypeChange}
                                            checked={selectedPassengerType === "lead"}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="selectLeadPassenger"
                                            style={{ fontSize: "15px", fontWeight: "600", marginLeft: "8px" }}
                                        >
                                            Select Lead Passenger Only
                                        </label>
                                    </div>
                                )
                        }
                    </div>


                </div>

                {adults.length > 0 &&
                    (adultCount > 0 ||
                        providerlife === "bridgify" ||
                        providerlife === "globaltix") && (
                        <Row className="mb-3" style={{ marginTop: "20px" }}>
                            <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                                <h5 className="mb-0">ADULTS</h5>
                                {/* Show appropriate count display for bridgify */}
                                {providerlife === "bridgify" ? (
                                    <h5>
                                        {adultCountSelected}/{adultCount}
                                    </h5>
                                ) : (
                                    <h5>
                                        {adultCountSelected}/{adultCount}
                                    </h5>
                                )}
                            </div>
                            {adults.map((data) => (
                                <Col sm="12" lg={"12"} xs="12" className="py-2" key={data.id}>
                                    <div style={{ position: "relative", margin: "1%" }}>
                                        <button
                                            className="btn btn-sm btn-solid btn-small-button button-travelbuddies buddy-edit-button"
                                            onClick={() => handleOnUpdateClick(data)}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                right: 0,
                                                zIndex: 1,
                                            }}
                                        >
                                            <Edit />
                                        </button>
                                        <div className="media buddy-card">
                                            <div className="form-check" style={{ marginRight: 20 }}>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`selectPax-${data?.id}`}
                                                    checked={selectedBuddies.some(
                                                        (b) => b?.id === data?.id
                                                    )}
                                                    disabled={
                                                        providerlife === "globaltix"
                                                            ? data.Age === null ||
                                                            (totalSelectedCount >= buddiesCount &&
                                                                !selectedBuddies.some(
                                                                    (b) => b?.id === data?.id
                                                                ))
                                                            : providerlife === "bridgify"
                                                                ? data.Age === null ||
                                                                (adultFreeze &&
                                                                    !selectedBuddies.some(
                                                                        (b) => b?.id === data?.id
                                                                    ))
                                                                : data.Age === null ||
                                                                (adultFreeze &&
                                                                    !selectedBuddies.some(
                                                                        (b) => b?.id === data?.id
                                                                    ))
                                                    }
                                                    onChange={() => handleSelectCheck(data)}
                                                />
                                            </div>
                                            <div className="media-body">
                                                <br></br>
                                                <h6
                                                    className="buddy-card-text mb-1"
                                                    style={{ color: "black" }}
                                                >
                                                    {data?.Title} {data?.FirstName} {data?.MiddleName}{" "}
                                                    {data?.LastName}
                                                </h6>
                                                <p className="buddy-phone mb-1" style={{ fontSize: "12px", color: "gray" }}>
                                                    {data?.Phoneno}
                                                </p>
                                                {data.Age === null ? (
                                                    <span
                                                        onClick={() => handleOnUpdateClick(data)}
                                                        className="col-12 p-0 m-0"
                                                    >
                                                        Note : add age to select travel buddy
                                                    </span>
                                                ) : (
                                                    <p style={{ fontSize: "12px" }} className="mb-1">
                                                        Age : {data?.Age}
                                                    </p>
                                                )}
                                                {(providerlife === "bridgify" ||
                                                    providerlife === "globaltix") && (
                                                        <p className="mb-1" style={{ color: "Green" }}>
                                                            Adult
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    )}
                {
                    // (children.length > 0 && (childCount != 0 || providerlife === "bridgify" || providerlife === "globaltix") && selectedPassengerType === "all") &&
                    (children.length > 0 && (childCount != 0 || providerlife === "bridgify" || providerlife === "globaltix")) &&
                    children.length > 0 &&
                    childCount > 0 &&
                    (providerlife === "bridgify" ||
                        providerlife === "globaltix" ||
                        providerlife === "cebu" ||
                        providerlife === null) &&
                    // selectedPassengerType === "all" && (
                    <Row className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2" style={{ marginTop: "15px" }}>
                            <h5 className="mb-0">CHILDREN</h5>
                            {/* Show appropriate count display for bridgify */}
                            {providerlife === "bridgify" ? (
                                <span>
                                    {childCountSelected}/{childCount}
                                </span>
                            ) : (
                                <span>
                                    {childCountSelected}/{childCount}
                                </span>
                            )}
                        </div>
                        {children.map((data) => (
                            <Col sm="12" lg={"12"} xs="12" className="py-2" key={data.id}>
                                <div style={{ position: "relative", margin: "1%" }}>
                                    <button
                                        className="btn btn-sm btn-solid btn-small-button button-travelbuddies buddy-edit-button"
                                        onClick={() => handleOnUpdateClick(data)}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            zIndex: 1,
                                        }}
                                    >
                                        <Edit />
                                    </button>
                                    <div className="media buddy-card">
                                        <div className="form-check" style={{ marginRight: 20 }}>
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`selectPax-${data?.id}`}
                                                disabled={
                                                    // selectedPassengerType === "lead" || providerlife === "globaltix"
                                                    providerlife === "globaltix"
                                                        ? totalSelectedCount >= buddiesCount &&
                                                        !selectedBuddies.some((b) => b.id === data.id)
                                                        : providerlife === "bridgify"
                                                            ? childFreeze &&
                                                            !selectedBuddies.some((b) => b.id === data.id)
                                                            : childFreeze &&
                                                            !selectedBuddies.some((b) => b.id === data.id)
                                                }
                                                checked={selectedBuddies.some(
                                                    (b) => b.id === data.id
                                                )}
                                                onChange={() => {
                                                    if (selectedPassengerType === "lead") {
                                                        handleChildLeadClick();
                                                    } else {
                                                        handleSelectCheck(data);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="media-body">
                                            <h6
                                                className="buddy-card-text mb-1"
                                                style={{ color: "black" }}
                                            >
                                                {data?.Title} {data?.FirstName} {data?.MiddleName}{" "}
                                                {data?.LastName}
                                            </h6>
                                            <p className="buddy-phone mb-1" style={{ fontSize: "12px", color: "gray" }}>
                                                {data?.Phoneno}
                                            </p>
                                            <p className="mb-1">Age : {data?.Age}</p>
                                            {(providerlife === "bridgify" ||
                                                providerlife === "globaltix") && (
                                                    <p className="mb-1" style={{ color: "orange" }}>
                                                        Child
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                    // )
                }
            </Col>
            <Col className="d-flex flex-row align-items-end pt-2 ml-auto col-12 justify-content-around">
                <Button
                    className="btn btn-sm btn-solid col-5"
                    onClick={handleOnAddTravelBuddy}
                >
                    Add Buddies
                </Button>
                <Button
                    className="btn btn-sm btn-solid col-5"
                    onClick={handleOnPressSelectPackage}
                >
                    Next
                </Button>
            </Col>
        </div>
    );
}
