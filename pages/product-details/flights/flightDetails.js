// import { Col, Collapse, Container, Input, Media, Row } from 'reactstrap';
// import React, { useContext, useEffect, useState } from 'react';

// import Oneway from './flightsDetailsPage/oneway';
// import Twoway from './flightsDetailsPage/twoway';
// import Multiway from './flightsDetailsPage/multiway';

// import ModalBase from '../../../components/common/Modals/ModalBase';

// import redirectingbanner from '../../../public/assets/images/Bannerimages/redirectingbanner.jpg';
// import applelogo from '../../../public/assets/images/Bannerimages/AppleLogo.png';
// import playstorelogo from '../../../public/assets/images/Bannerimages/Playstore.png';

// import { AppContext } from '../../_app';

// import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
// import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';
// import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
// import { getFlightName } from '../../../GlobalFunctions/Flightfunctions/Flightfunctions';

// function FlightDetails({ dataSet, userSelectedTripMode, openSideBarStatus, closeSubFilter }) {

//     const stopsCount = [
//         { label: '1', value: 'Direct flight' },
//         { label: '2', value: 'One stop' },
//         { label: '3', value: 'Two stop' },
//         { label: '4', value: 'More than two stop' }
//     ];

//     const { baseCurrencyValue } = useContext(AppContext);

//     const [avalibleFlights, setAvalibleFlights] = useState([]);
//     const [avalibleFlightsFiltered, setAvalibleFlightsFiltered] = useState([]);
//     const [avalibleflightCodes, setAvalibleflightCodes] = useState([]);

//     const [stopFilter, setstopFilter] = useState(true);
//     const [airlinesFilter, setairlinesFilter] = useState(true);
//     const [priceFilterOpen, setpriceFilterOpen] = useState(true);

//     const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
//     const [tempCurrency, setTempCurrency] = useState('');

//     const [minprice, setminprice] = useState('');
//     const [maxprice, setmaxprice] = useState('');

//     const [pricerange, setpricerange] = useState([]);

//     const [knowMore, setKnowMore] = useState(false);
//     const [pricefilter, setpricefilter] = useState(false);

//     const [selectedAirlines, setSelectedAirlines] = useState([]);
//     const [selectedStopCounts, setSelectedStopCounts] = useState([]);

//     const hanldeStopCounts = (value) => {
//         setSelectedStopCounts((prev) => {
//             if (prev.includes(value)) {
//                 return prev.filter((item) => item != value);
//             } else {
//                 return [...prev, value];
//             }
//         });
//     };

//     const handleAirlines = (value) => {
//         setSelectedAirlines((prev) => {
//             if (prev.includes(value)) {
//                 return prev.filter((item) => item != value);
//             } else {
//                 return [...prev, value];
//             }
//         });
//     };

//     const filterAirlines = () => {
//         if (selectedAirlines.length === 0 && selectedStopCounts.length === 0 && !pricefilter) {
//             setAvalibleFlightsFiltered(avalibleFlights);
//         } else {
//             let filtered = avalibleFlights.filter((flight) => {
//                 const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.some((airline) => flight.flightCodes.includes(airline));
//                 const stopCountMatch = selectedStopCounts.length === 0 || selectedStopCounts.some((value) => Number(flight.scheduleData.length) === Number(value));
//                 let price = CurrencyConverterOnlyRateWithoutDecimal(flight?.totalFare?.currency, flight.totalFare.totalPrice, baseCurrencyValue);
//                 return airlineMatch && stopCountMatch && minprice <= price && price <= maxprice;
//             });
//             setAvalibleFlightsFiltered(filtered);
//         }
//     };

//     const handlePriceFilterChange = async (value) => {
//         setpricefilter(true);
//         setminprice(value.start);
//         setmaxprice(value.end);
//     };

//     const handleRedirectPlayStore = () => {
//         router.replace('https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share')
//     }

//     const handlleRedirectAppStore = () => {
//         router.replace('https://apps.apple.com/lk/app/aahaas/id6450589764')
//     }

//     const createPriceFilters = async () => {

//         let result = createPriceSteps(Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[0], baseCurrencyValue)), Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[1], baseCurrencyValue)))
//         setFilterByPriceButtons(result);
//         setTempCurrency(baseCurrencyValue.base);

//         if (!pricefilter) {
//             setpricefilter(false);
//             setminprice(result[0].start);
//             setmaxprice(result[result.length - 1].end);
//         }

//         setpricerange([result[0].start, result[result.length - 1].end]);

//     }

//     const handleClearAllfilter = () => {
//         setSelectedAirlines([]);
//         setSelectedStopCounts([]);
//         setpricefilter(false);
//         setminprice(pricerange[0]);
//         setmaxprice(pricerange[1]);
//     }

//     useEffect(() => {
//         createPriceFilters();
//     }, [dataSet, baseCurrencyValue]);

//     useEffect(() => {
//         console.log("avalible flights", dataSet.data_set.length);
//         console.log("avalible flights", dataSet.data_set);
//         setAvalibleFlights(dataSet.data_set);
//         setAvalibleFlightsFiltered(dataSet.data_set);
//         setAvalibleflightCodes(dataSet.flightCodes);
//     }, [dataSet]);

//     useEffect(() => {
//         filterAirlines();
//     }, [selectedAirlines, selectedStopCounts, minprice, maxprice]);

//     return (
//         <section className="section-b-space ratio_asos mt-lg-5">
//             <div className="collection-wrapper">
//                 <Container>
//                     <Row>

//                         <Col sm="3" className="collection-filter" id="filter" style={{ left: openSideBarStatus ? "0px" : "" }}>

//                             <div className="collection-filter-block px-lg-4 pe-5" style={{ borderRadius: "12px" }}>

//                                 <div className="collection-mobile-back" onClick={closeSubFilter}>
//                                     <span className="filter-back"><i className="fa fa-angle-left" ></i>back</span>
//                                 </div>

//                                 <div className="collection-collapse-block">
//                                     <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={stopFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setstopFilter(!stopFilter)}>Stops</h5>
//                                     <Collapse isOpen={stopFilter}>
//                                         <div className="collection-collapse-block-content">
//                                             <div className="collection-brand-filter">
//                                                 <ul className="category-list">
//                                                     {
//                                                         stopsCount.map((value, key) => {
//                                                             let count = avalibleFlights.filter((flight) => { return Number(flight.scheduleData.length - 1) === Number(value.label) }).length
//                                                             return (
//                                                                 Number(count) > 0 &&
//                                                                 <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//                                                                     <Input type='checkbox' onChange={() => hanldeStopCounts(value.label)} checked={selectedStopCounts.includes(value.label)} className="custom-control-input option-btns" />
//                                                                     <h6 className="m-0 p-0">{value.value}</h6>
//                                                                 </div>
//                                                             )
//                                                         })
//                                                     }
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </Collapse>
//                                 </div>

//                                 <div className="collection-collapse-block">
//                                     <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={airlinesFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setairlinesFilter(!airlinesFilter)}>Airlines</h5>
//                                     <Collapse isOpen={airlinesFilter}>
//                                         <div className="collection-collapse-block-content">
//                                             <div className="collection-brand-filter">
//                                                 <ul className="category-list">
//                                                     {
//                                                         avalibleflightCodes.map((value, key) => (
//                                                             <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//                                                                 <Input type='checkbox' onChange={() => handleAirlines(value)} checked={selectedAirlines.includes(value)} className="custom-control-input option-btns" />
//                                                                 <h6 className="m-0 p-0">{getFlightName(value)}</h6>
//                                                             </div>
//                                                         ))
//                                                     }
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </Collapse>
//                                 </div>

//                                 <div className="collection-collapse-block">
//                                     <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
//                                     <Collapse isOpen={priceFilterOpen}>
//                                         <div className="collection-collapse-block-content">
//                                             <div className="collection-brand-filter">
//                                                 <ul className="category-list">
//                                                     {
//                                                         filterByPriceButtons?.map((value, key) => (
//                                                             <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
//                                                                 <Input checked={value.start == minprice && value.end == maxprice} onChange={() => handlePriceFilterChange(value)} name={value} id={value} type="radio" className="custom-control-input option-btns" />
//                                                                 <h6 className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)}  - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6>
//                                                             </div>
//                                                         ))
//                                                     }
//                                                 </ul>
//                                             </div>
//                                         </div>
//                                     </Collapse>
//                                 </div>

//                             </div>

//                         </Col>

//                         <div className='col-12 col-lg-9' style={{ minHeight: "100vh" }}>

//                             <ul className="product-filter-tags p-0 m-0 mb-2">
//                                 {
//                                     pricefilter &&
//                                     <li>
//                                         <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close"></i></a>
//                                     </li>
//                                 }
//                                 {
//                                     selectedStopCounts.map((value, i) => (
//                                         <li key={i} onClick={() => hanldeStopCounts(value)}>
//                                             <a href={null} className="filter_tag">{stopsCount.find((val) => value === val.label)?.value}<i className="fa fa-close"></i></a>
//                                         </li>
//                                     ))
//                                 }
//                                 {
//                                     selectedAirlines.map((value, i) => (
//                                         <li key={i} onClick={() => handleAirlines(value)}>
//                                             <a href={null} className="filter_tag">{getFlightName(value)}<i className="fa fa-close"></i></a>
//                                         </li>
//                                     ))
//                                 }
//                                 {
//                                     (pricefilter || selectedAirlines.length > 0 || selectedStopCounts.length > 0) &&
//                                     <li onClick={handleClearAllfilter}>
//                                         <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
//                                     </li>
//                                 }
//                             </ul>

//                             {
//                                 userSelectedTripMode === "oneway" ?
//                                     avalibleFlightsFiltered.map((value, key) => (
//                                         <div className='' key={key}>
//                                             <Oneway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} />
//                                         </div>
//                                     ))
//                                     : userSelectedTripMode === 'roundtrip' ?
//                                         avalibleFlightsFiltered.map((value, key) => (
//                                             <div className='' key={key}>
//                                                 <Twoway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} />
//                                             </div>
//                                         ))
//                                         : userSelectedTripMode === 'multicity' ?
//                                             avalibleFlightsFiltered.map((value, key) => (
//                                                 <div className='' key={key}>
//                                                     <Multiway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} />
//                                                 </div>
//                                             ))
//                                             : null
//                             }

//                         </div>

//                         <ModalBase isOpen={knowMore} size="md mt-3 p-0" extracss="pb-0" toggle={() => setKnowMore(false)} >
//                             <div className="d-flex flex-column align-items-center">
//                                 <h3 style={{ fontSize: 26, marginBottom: '0px' }}>Discover Aahaas on the Go!</h3>
//                                 <h6 style={{ fontSize: 16, textAlign: 'center', color: 'black', marginBottom: "10px", marginTop: '-5px' }}>Experience Seamless Service at Your Fingertips.</h6>
//                                 <Media src={redirectingbanner.src} style={{ width: "auto", height: '50vh', marginTop: '20px', objectFit: 'cover' }} />
//                                 <div className="d-flex flex-column col-11 mx-auto">
//                                     <h6 style={{ fontSize: 19, textAlign: 'center', textTransform: 'uppercase', color: 'black', lineHeight: "20px", marginBottom: '6px', fontWeight: "bold" }}>Download our mobile app now!</h6>
//                                     <p className="text-center mx-auto" style={{ fontSize: 9, lineHeight: "12px" }}>Enjoy the full Aahaas experience wherever you are. Our mobile app is designed to make your journey smoother and more personalized. Don't miss out download the Aahaas app today and take your experience to the next level.</p>
//                                 </div>
//                                 <div className="d-flex align-items-center gap-2 mt-3">
//                                     <Media src={applelogo.src} style={{ width: '180px' }} onClick={handlleRedirectAppStore} />
//                                     <Media src={playstorelogo.src} style={{ width: '180px' }} onClick={handleRedirectPlayStore} />
//                                 </div>
//                             </div>
//                         </ModalBase>

//                     </Row>
//                 </Container>
//             </div>
//         </section>
//     )
// }

// export default FlightDetails

import { Col, Collapse, Container, Input, Media, Row } from 'reactstrap';
import React, { useContext, useEffect, useState } from 'react';

import Oneway from './flightsDetailsPage/oneway';
import Twoway from './flightsDetailsPage/twoway';
import Multiway from './flightsDetailsPage/multiway';

import ModalBase from '../../../components/common/Modals/ModalBase';

import redirectingbanner from '../../../public/assets/images/Bannerimages/redirectingbanner.jpg';
import applelogo from '../../../public/assets/images/Bannerimages/AppleLogo.png';
import playstorelogo from '../../../public/assets/images/Bannerimages/Playstore.png';

import { AppContext } from '../../_app';

import CurrencyConverterOnlyRateWithoutDecimal from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal';
import createPriceSteps from '../../../GlobalFunctions/HelperFunctions/createPriceSteps';
import createDynamicPriceSteps from '../../../GlobalFunctions/HelperFunctions/newPriceSteps';
import CurrencyConverter from '../../../GlobalFunctions/CurrencyConverter/CurrencyConverter';
import { getFlightName } from '../../../GlobalFunctions/Flightfunctions/Flightfunctions';

function FlightDetails({ dataSet, userSelectedTripMode, openSideBarStatus, closeSubFilter, userSearchData, seatCount }) {

    const stopsCount = [
        { label: '1', value: 'Direct flight' },
        { label: '2', value: 'One stop' },
        // { label: '3', value: 'Two stop' },
        // { label: '4', value: 'More than two stop' }
    ];

    const quickFilterOptions = [
        { name: 'Refundable Fares'},
        { name: 'Late Departures' },
        { name: 'Morning Departures' }
      ];

      const sortOptions = [
        { id: 'PRICE_ASC', name: 'Price: Low to High', description: 'Cheapest flights shown first' },
        { id: 'PRICE_DESC', name: 'Price: High to Low', description: 'Premium flights shown first' },
        { id: 'DURATION_ASC', name: 'Duration: Shortest', description: 'Quickest flights shown first' },
        { id: 'DURATION_DESC', name: 'Duration: Longest', description: 'Longest Travel Time' }
      ];

    const { baseCurrencyValue } = useContext(AppContext);

    const [avalibleFlights, setAvalibleFlights] = useState([]);
    const [avalibleFlightsFiltered, setAvalibleFlightsFiltered] = useState([]);
    const [avalibleflightCodes, setAvalibleflightCodes] = useState([]);

    const [stopFilter, setstopFilter] = useState(true);
    const [airlinesFilter, setairlinesFilter] = useState(true);
    const [priceFilterOpen, setpriceFilterOpen] = useState(true);

    const [filterByPriceButtons, setFilterByPriceButtons] = useState([]);
    const [tempCurrency, setTempCurrency] = useState('');

    const [minprice, setminprice] = useState('');
    const [maxprice, setmaxprice] = useState('');

    const [pricerange, setpricerange] = useState([]);

    const [knowMore, setKnowMore] = useState(false);
    const [pricefilter, setpricefilter] = useState(false);

    const [selectedAirlines, setSelectedAirlines] = useState([]);
    const [selectedQuickFilters, setSelectedQuickFilters] = useState([]);
    const [selectedStopCounts, setSelectedStopCounts] = useState([]);

    const hanldeStopCounts = (value) => {
        setSelectedStopCounts((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item != value);
            } else {
                return [...prev, value];
            }
        });
    };



    const handleAirlines = (value) => {
        setSelectedAirlines((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item != value);
            } else {
                return [...prev, value];
            }
        });
    };

    const handleQuickFilters = (value) => {
        setSelectedQuickFilters((prev) => {
            if (prev.includes(value)) {
                return prev.filter((item) => item != value);
            } else {
                return [...prev, value];
            }
        });
    };

    // const filterAirlines = () => {
    //     if (selectedAirlines.length === 0 && selectedStopCounts.length === 0 && !pricefilter) {
    //         setAvalibleFlightsFiltered(avalibleFlights);
    //     } else {
    //         let filtered = avalibleFlights.filter((flight) => {
    //             const airlineMatch = selectedAirlines.length === 0 || selectedAirlines.some((airline) => flight.flightCodes.includes(airline));
    //             const stopCountMatch = selectedStopCounts.length === 0 || selectedStopCounts.some((value) => Number(flight.scheduleData.length) === Number(value));
    //             let price = CurrencyConverterOnlyRateWithoutDecimal(flight?.totalFare?.currency, flight.totalFare.totalPrice, baseCurrencyValue);
    //             return airlineMatch && stopCountMatch && minprice <= price && price <= maxprice;
    //         });
    //         setAvalibleFlightsFiltered(filtered);
    //     }
    // };

    // const filterAirlines = () => {
    //     if (selectedAirlines.length === 0 && selectedStopCounts.length === 0 && !pricefilter) {
    //       setAvalibleFlightsFiltered(avalibleFlights);
    //     } else {
    //     console.log("flight",avalibleFlights.length);
    //       let filtered = avalibleFlights.filter((flight) => {
    //         console.log("flight",flight);
           
    //         // Calculate stops based on scheduleData array length minus 1
    //         let totalStops = 0;
    //         flight.scheduleData.forEach(leg => {
    //           // Each leg's stop count is leg.length - 1
    //           totalStops += leg.length - 1;
    //         });
     
    //         // Map to your filter values (0=Direct, 1=One stop, etc.)
    //         const stopCountValue = totalStops.toString();
    //         console.log("stopCountValue",stopCountValue);
    //         console.log("totalStops",totalStops);
           
     
    //         const airlineMatch = selectedAirlines.length === 0 ||
    //                            selectedAirlines.some(airline => flight.flightCodes.includes(airline));
     
    //         const stopCountMatch = selectedStopCounts.length === 0 ||
    //                              selectedStopCounts.includes(stopCountValue);
     
    //         let price = CurrencyConverterOnlyRateWithoutDecimal(
    //           flight?.totalFare?.currency,
    //           flight.totalFare.totalPrice,
    //           baseCurrencyValue
    //         );
     
    //         return airlineMatch && stopCountMatch &&
    //                price >= minprice && price <= maxprice;
    //       });
    //       setAvalibleFlightsFiltered(filtered);
    //     }
    //   };

    const filterAirlines = () => {
        if (selectedAirlines.length === 0 && selectedStopCounts.length === 0 && !pricefilter) {
          setAvalibleFlightsFiltered(avalibleFlights);
        } else {
          let filtered = avalibleFlights.filter((flight) => {
            // Calculate stops based on scheduleData
            let totalStops = 0;
            
            if(userSelectedTripMode === "oneway"){
              totalStops = flight.scheduleData.length - 1;
            } else {
              flight.scheduleData.forEach(leg => {
                totalStops += leg.length - 1;
              });
            }
           
            const airlineMatch = selectedAirlines.length === 0 ||
                                 selectedAirlines.some(airline => flight.flightCodes.includes(airline));
           
            // Fix: Match selected stop count labels to actual stop counts
            const stopCountMatch = selectedStopCounts.length === 0 ||
                                 selectedStopCounts.some(label => {
                                   // Convert label to actual stop count (subtract 1)
                                   const actualStopCount = parseInt(label) - 1;
                                   return actualStopCount === totalStops;
                                 });
           
            let price = CurrencyConverterOnlyRateWithoutDecimal(
              flight?.totalFare?.currency,
              flight.totalFare.totalPrice,
              baseCurrencyValue
            );
           
            return airlineMatch && stopCountMatch &&
                   price >= minprice && price <= maxprice;
          });
          setAvalibleFlightsFiltered(filtered);
        }
      };

    const handlePriceFilterChange = async (value) => {
        setpricefilter(true);
        setminprice(value.start);
        setmaxprice(value.end);
    };

    const handleRedirectPlayStore = () => {
        router.replace('https://play.google.com/store/apps/details?id=com.aahaastech.aahaas&pcampaignid=web_share')
    }

    const handlleRedirectAppStore = () => {
        router.replace('https://apps.apple.com/lk/app/aahaas/id6450589764')
    }

    

    // const createPriceFilters = async () => {

    //     let result = createPriceSteps(Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[0], baseCurrencyValue)), Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[1], baseCurrencyValue)))
    //     console.log("resultttttttt", result);
    //     setFilterByPriceButtons(result);
    //     setTempCurrency(baseCurrencyValue.base);

    //     if (!pricefilter) {
    //         setpricefilter(false);
    //         setminprice(result[0].start);
    //         setmaxprice(result[result.length - 1].end);
    //     }

    //     setpricerange([result[0].start, result[result.length - 1].end]);

    // }

    const createPriceFilters = async () => {
        // console.log("Price ranges:", dataSet);
        // console.log("Price ranges:", dataSet.pricing[0]);

        const minPrice = Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[0], baseCurrencyValue));
        const maxPrice = Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', dataSet.pricing[1], baseCurrencyValue));
        
        // console.log("Price ranges:", minPrice, maxPrice);
        // Collect prices from your products
        const productPrices = dataSet.data_set.map((product, index) => ({
            id: product.id,
            price: Number(CurrencyConverterOnlyRateWithoutDecimal('LKR', product?.totalFare?.totalPrice, baseCurrencyValue))
        }));

        // Use the new function that ensures products in each range
        let result = createDynamicPriceSteps(minPrice, maxPrice, productPrices);
        
        setFilterByPriceButtons(result);
        setTempCurrency(baseCurrencyValue.base);
        
        if (!pricefilter) {
            setpricefilter(false);
            setminprice(result[0].start);
            setmaxprice(result[result.length - 1].end);
        }

        
        setpricerange([result[0].start, result[result.length - 1].end]);
    }
    

    const handleClearAllfilter = () => {
        setSelectedAirlines([]);
        setSelectedStopCounts([]);
        setpricefilter(false);
        setminprice(pricerange[0]);
        setmaxprice(pricerange[1]);
    }

    useEffect(() => {
        createPriceFilters();
    }, [dataSet, baseCurrencyValue]);

    useEffect(() => {
        setAvalibleFlights(dataSet.data_set);
        setAvalibleFlightsFiltered(dataSet.data_set);
        setAvalibleflightCodes(dataSet.flightCodes);
    }, [dataSet]);

    useEffect(() => {
        filterAirlines();
    }, [selectedAirlines, selectedStopCounts, minprice, maxprice]);

    return (
        <section className="section-b-space ratio_asos mt-lg-5">
            <div className="collection-wrapper">
                <Container>
                    <Row>

                        <Col sm="3" className="collection-filter" id="filter" style={{ left: openSideBarStatus ? "0px" : "" }}>

                            <div className="collection-filter-block px-lg-4 pe-5" style={{ borderRadius: "12px" }}>

                                <div className="collection-mobile-back" onClick={closeSubFilter}>
                                    <span className="filter-back"><i className="fa fa-angle-left" ></i>back</span>
                                </div>

                                <div className="collection-collapse-block">
                                    <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={stopFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setstopFilter(!stopFilter)}>Stops</h5>
                                    <Collapse isOpen={stopFilter}>
                                        <div className="collection-collapse-block-content">
                                            <div className="collection-brand-filter">
                                                <ul className="category-list">
                                                    {
                                                        // stopsCount.map((value, key) => {
                                                        //     let count = avalibleFlights.filter((flight) => { return Number(flight.scheduleData.length) === Number(value.label) }).length
                                                        //     console.log("count of one way stops", count, value)
                                                        //     return (
                                                        //         Number(count) > 0 &&
                                                        //         <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                                        //             <Input type='checkbox' onChange={() => hanldeStopCounts(value.label)} checked={selectedStopCounts.includes(value.label)} className="custom-control-input option-btns" />
                                                        //             <h6 className="m-0 p-0">{value.value}</h6>
                                                        //         </div>
                                                        //     )
                                                        // })
                                                        stopsCount.map((value, key) => {
                                                            const stopCountFilter = parseInt(value.label) - 1; // Convert to actual stop count
                                                            // console.log(avalibleFlights,"Total Stops Value issssssssssssssssss")
                                                            // let count = avalibleFlights.filter((flight) => {
                                                            //     let totalStops = 0;
                                                            //     console.log("flight not", userSelectedTripMode);
                                                            //     if(userSelectedTripMode === "oneway"){
                                                            //         totalStops += flight.scheduleData.length - 1;
                                                            //     }
                                                            //     else if(userSelectedTripMode === "roundtrip"){
                                                            //         console.log("flight isssssss",flight.scheduleData);
                                                            //         totalStops += flight.scheduleData.length - 1;
                                                            //     }
                                                            //     else{
                                                            //         flight.scheduleData.forEach(leg => {
                                                            //             totalStops += leg.length - 1;
                                                            //             // console.log(leg,"Total Stops Value issssssssssssssssss")
                                                                      
                                                            //         });
                                                            //     }
                                                               

                                                               
                                                            //     return totalStops === stopCountFilter;
                                                            // }).length;
                                                            return (
                                                             
                                                                <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                                                    <Input
                                                                        type='checkbox'
                                                                        onChange={() => hanldeStopCounts(value.label)}
                                                                        checked={selectedStopCounts.includes(value.label)}
                                                                        className="custom-control-input option-btns"
                                                                    />
                                                                    <h6 onClick={() => hanldeStopCounts(value.label)} className="m-0 p-0">{value.value}</h6>
                                                                </div>
                                                            )
                                                        })
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                <div className="collection-collapse-block">
                                    <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={airlinesFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setairlinesFilter(!airlinesFilter)}>Airlines</h5>
                                    <Collapse isOpen={airlinesFilter}>
                                        <div className="collection-collapse-block-content">
                                            <div className="collection-brand-filter">
                                                <ul className="category-list">
                                                    {
                                                        avalibleflightCodes.map((value, key) => (
                                                            <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                                                <Input type='checkbox' onChange={() => handleAirlines(value)} checked={selectedAirlines.includes(value)} className="custom-control-input option-btns" />
                                                                <h6 onClick={() => handleAirlines(value)} className="m-0 p-0">{getFlightName(value)}</h6>
                                                            </div>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div>

                                {/* <div className="collection-collapse-block">
                                    <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={airlinesFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setairlinesFilter(!airlinesFilter)}>Quick Filters</h5>
                                    <Collapse isOpen={airlinesFilter}>
                                        <div className="collection-collapse-block-content">
                                            <div className="collection-brand-filter">
                                            <ul className="category-list">
                                                    {
                                                        quickFilterOptions.map((value, key) => (
                                                            <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                                                <Input checked={value.name} onChange={() => handlePriceFilterChange(value)} name={value} id={value} type="radio" className="custom-control-input option-btns" />
                                                                <h6 className="m-0 p-0">{value.name}</h6>
                                                            </div>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </Collapse>
                                </div> */}
                                {
                                    filterByPriceButtons.length === 0 ? (null):(
                                        <div className="collection-collapse-block">
                                        <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={priceFilterOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setpriceFilterOpen(!priceFilterOpen)}>Price</h5>
                                        <Collapse isOpen={priceFilterOpen}>
                                            <div className="collection-collapse-block-content">
                                                <div className="collection-brand-filter">
                                                    <ul className="category-list">
                                                        {
                                                            filterByPriceButtons?.map((value, key) => (
                                                                <div className="form-check custom-checkbox collection-filter-checkbox" key={key}>
                                                                    <Input checked={value.start == minprice && value.end == maxprice} onChange={() => handlePriceFilterChange(value)} name={value} id={value} type="radio" className="custom-control-input option-btns" />
                                                                    <h6 onClick={() => handlePriceFilterChange(value)} className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)}  - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6>
                                                                </div>
                                                            ))
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </Collapse>
                                    </div>
                                    )
                                }
                               

                            </div>

                        </Col>

                        <div className='col-12 col-lg-9' style={{ minHeight: "100vh" }}>

                            <ul className="product-filter-tags p-0 m-0 mb-2">
                                {
                                    pricefilter &&
                                    <li onClick={() => {
                                        setpricefilter(false);
        setminprice(pricerange[0]);
        setmaxprice(pricerange[1]);
                                    }}>
                                        <a href={null} className="filter_tag">{CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)} <i className="fa fa-close"></i></a>
                                    </li>
                                }
                                {
                                    selectedStopCounts.map((value, i) => (
                                        <li key={i} onClick={() => hanldeStopCounts(value)}>
                                            <a href={null} className="filter_tag">{stopsCount.find((val) => value === val.label)?.value}<i className="fa fa-close"></i></a>
                                        </li>
                                    ))
                                }
                                {
                                    selectedAirlines.map((value, i) => (
                                        <li key={i} onClick={() => handleAirlines(value)}>
                                            <a href={null} className="filter_tag">{getFlightName(value)}<i className="fa fa-close"></i></a>
                                        </li>
                                    ))
                                }
                                {
                                    (pricefilter || selectedAirlines.length > 0 || selectedStopCounts.length > 0) &&
                                    <li onClick={handleClearAllfilter}>
                                        <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
                                    </li>
                                }
                            </ul>

                            {
                                userSelectedTripMode === "oneway" ?
                                    avalibleFlightsFiltered.map((value, key) => (
                                        <div className='' key={key}>
                                            <Oneway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} userSearchData={userSearchData} seatCount={seatCount} />
                                        </div>
                                    ))
                                    : userSelectedTripMode === 'roundtrip' ?
                                        avalibleFlightsFiltered.map((value, key) => (
                                            <div className='' key={key}>
                                                <Twoway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} userSearchData={userSearchData} seatCount={seatCount}/>
                                            </div>
                                        ))
                                        : userSelectedTripMode === 'multicity' ?
                                            avalibleFlightsFiltered.map((value, key) => (
                                                <div className='' key={key}>
                                                    <Multiway flightData={value} handleKnowMoreOpen={() => setKnowMore(true)} userSearchData={userSearchData} seatCount={seatCount}/>
                                                </div>
                                            ))
                                            : null
                            }

                        </div>

                        <ModalBase isOpen={knowMore} size="md mt-3 p-0" extracss="pb-0" toggle={() => setKnowMore(false)} >
                            <div className="d-flex flex-column align-items-center">
                                <h3 style={{ fontSize: 26, marginBottom: '0px' }}>Discover Aahaas on the Go!</h3>
                                <h6 style={{ fontSize: 16, textAlign: 'center', color: 'black', marginBottom: "10px", marginTop: '-5px' }}>Experience Seamless Service at Your Fingertips.</h6>
                                <Media src={redirectingbanner.src} style={{ width: "auto", height: '50vh', marginTop: '20px', objectFit: 'cover' }} />
                                <div className="d-flex flex-column col-11 mx-auto">
                                    <h6 style={{ fontSize: 19, textAlign: 'center', textTransform: 'uppercase', color: 'black', lineHeight: "20px", marginBottom: '6px', fontWeight: "bold" }}>Download our mobile app now!</h6>
                                    <p className="text-center mx-auto" style={{ fontSize: 9, lineHeight: "12px" }}>Enjoy the full Aahaas experience wherever you are. Our mobile app is designed to make your journey smoother and more personalized. Don't miss out download the Aahaas app today and take your experience to the next level.</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 mt-3">
                                    <Media src={applelogo.src} style={{ width: '180px' }} onClick={handlleRedirectAppStore} />
                                    <Media src={playstorelogo.src} style={{ width: '180px' }} onClick={handleRedirectPlayStore} />
                                </div>
                            </div>
                        </ModalBase>

                    </Row>
                </Container>
            </div>
        </section>
    )
}

export default FlightDetails