import axios from "axios";
import React, { useContext, useEffect, useRef, useState } from "react";
import Head from 'next/head';
import { Col, Collapse, Container, Input, Media, Row } from "reactstrap";

import { AppContext } from "../../_app";

import createPriceSteps from "../../../GlobalFunctions/HelperFunctions/createPriceSteps";
import CurrencyConverter from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverter";
import CurrencyConverterOnlyRateWithoutDecimal from "../../../GlobalFunctions/CurrencyConverter/CurrencyConverterOnlyRateWithoutDecimal";

import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import ToastMessage from "../../../components/Notification/ToastMessage";
import PostLoader from "../../skeleton/PostLoader";

import Essential from "../../../public/assets/images/Bannerimages/mainbanner/essentialBanner.jpg";
import NonEssential from "../../../public/assets/images/Bannerimages/mainbanner/nonEssentialBanner.jpg";

import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import { getProductDetailsEssentialNonEssential } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";
import Select from 'react-select';
import { useRouter } from "next/router";
import cookie from 'cookie';
import ProductSlider from "../productImageSlider";
import NewBanners from "../../layouts/NewBanners";


export async function getServerSideProps(context) {

    let response = [];
    let cID = context.query.cID || 60;
    let sortCat = context.query.sortCat;

    const { req } = context;

    let baseLocation = {
        latitude: '6.9271',
        longitude: '79.8612',
        locationDescription: 'Colombo, Sri lanka'
    };

    if (req.headers.cookie) {
        const cookies = cookie.parse(req.headers.cookie);
        try {
            //   baseLocation = JSON.parse(cookies.userLastLocation);
            const userLastLocation = JSON.parse(cookies.userLastLocation);

            baseLocation = {
                latitude: userLastLocation.latitude.toString(),
                longitude: userLastLocation.longtitude.toString(),
                locationDescription: userLastLocation.address_full,
                address_components: userLastLocation.address_components
            };
        } catch (error) {
            // console.error('Failed to parse userLastLocation cookie:', error);
        }
    }

    //   console.log("base location", baseLocation)

    await getProductDetailsEssentialNonEssential(1, 0, 0, 0, cID, 0, sortCat, baseLocation).then(async (res) => {
        if (res === '(Internal Server Error)' || res === "Something went wrong !") {
            response = [];
        } else {
            response = res.discount_data;
        }
    });

    // console.log("essentialsssssss",response)

    return {
        props: {
            content: response,
        },
    };

}

function EssentialNonEssentialMainpage({ id = "essential", category = 1, content }) {

    const ref = useRef([]);
    const router = useRouter();
    const canonicalUrl = router.asPath;

    const { baseCurrencyValue, userSearchFilters, setUserSearchFilters, baseLocation } = useContext(AppContext);

    const [loading, setloading] = useState(true);
    const [setMoreProducts, setSetMoreProducts] = useState(false);

    const [pricefilter, setpricefilter] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [brandFilter, setBrandFilter] = useState(true);
    const [paymentFilters, setPaymentFilters] = useState(true);
    const [priceFilters, setPriceFilters] = useState(true);
    const [openSideBarStatus, setopenSideBarStatus] = useState(false);
    const [showFilterButton, setShowFilterButton] = useState(true); // New state for filter button visibility
    const [searchFilter, setSearchfilter] = useState(false);

    const [currentOffset, setcurrentOffset] = useState(60);

    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [minprice, setminprice] = useState('');
    const [maxprice, setmaxprice] = useState('');
    const [tempCurrency, setTempCurrency] = useState('');

    const [products, setProducts] = useState([]);
    const [productsFiltered, setProductsFiltered] = useState([]);

    const [pricerange, setpricerange] = useState([]);
    const [paymentVariants, setPaymentVariants] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [pricies, setPrices] = useState([]);

    const [brands, setBrands] = useState([]);
    const [filterCheckboxes, setFilterCheckboxes] = useState([]);
    const [filteringValue, setFilteringValue] = useState([]);
    const [selectedPaymentVariants, setSelectedPaymentVariants] = useState([]);
    const [selecteddProductsUnitVariants, setSelectedProductsUnitVariants] = useState([])
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [selectedPrice, setSelectedPrice] = useState([])
    const [selectedBrands, setselectedBrands] = useState([])
    const [allDiscountData, setAllDiscountData] = useState([])

    const [grid, setGrid] = useState('col-lg-3 col-md-4 col-6 my-3');

    const [userMinMaxPrice, setUserMinMaxPrice] = useState({
        min: minprice,
        max: maxprice
    });

    const options = [
        { value: 'default', label: 'Default' },
        { value: 'newArrival', label: 'New Arrivals' },
        { value: 'featured', label: 'Featured' },
        { value: 'priceLH', label: 'Price Low to High' },
        { value: 'priceHL', label: 'Price High to Low' }
    ];
    // Add this state for sorting dropdown (with your other state variables)
    const [isSortingDropdownOpen, setIsSortingDropdownOpen] = useState(false);
    // Add this useEffect for scroll handling (add it with your other useEffects)
    useEffect(() => {
        const handleScroll = () => {
            // Close sorting dropdown when scrolling
            if (isSortingDropdownOpen) {
                setIsSortingDropdownOpen(false);
            }
        };

        // Use capture phase to catch scroll events early
        document.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [isSortingDropdownOpen]);
    const [selectedSortMethod, setSelectedSortMethod] = useState('default');

    const handleSelectChange = (selectedOption) => {
        setSelectedSortMethod(selectedOption.value);

        setUserSearchQuery('');
        setFilteringValue([]);
        setFilterCheckboxes([]);
        setSelectedPaymentVariants([]);
        setSelectedProductsUnitVariants([]);
        setSelectedSubCategories([]);
        setSelectedPrice([]);
        setselectedBrands([]);

        // Reset price range properly
        const resetMinPrice = pricerange[0] || 0;
        const resetMaxPrice = pricerange[1] || 0;

        setUserMinMaxPrice({
            min: resetMinPrice,
            max: resetMaxPrice
        });
        setminprice(resetMinPrice);
        setmaxprice(resetMaxPrice);
        setpricefilter(false);

        // Close dropdown after selection
        setIsSortingDropdownOpen(false);
    };

    const updateData = async (data, type = "all") => {

        if (type === "all") {
            setProducts(data);
            setProductsFiltered(data);
            await getPricefilterButtons(data);
            await getBrands(data);
            await getPaymentOptions(data);
            setloading(false);
            setSetMoreProducts(false);
        } else {
            setProducts(data);
            setProductsFiltered(data);
            // await getPricefilterButtons(data);
            await getBrands(data);
            await getPaymentOptions(data);
            setloading(false);
            setSetMoreProducts(false);
        }


    }

    // const getDetails = async () => {
    //     try {
    //         await getProductDetailsEssentialNonEssential(category, 0, 0, 0, currentOffset, 0, selectedSortMethod).then(async (response) => {
    //             if (response.status === 200 && response.discount_data != []) {
    //                 await updateData(response.discount_data);
    //             } else {
    //                 await updateData([]);
    //             }
    //         }).catch(async (error) => {
    //             await updateData([]);
    //         })
    //     } catch (error) {
    //         await updateData([]);
    //     }
    // }

    const handleChange = async (value) => {
        setUserSearchQuery(value)
        let filtered = products.filter((product) => {
            return product.listing_title.toLowerCase().includes(value.toLowerCase())
        })
        const filteredData = getFilteredProducts(filteringValue, filteringValue[0], filtered);

        setProductsFiltered(filteredData)
    }

    const handleHeaderSearch = (searchQuery) => {
        handleChange(searchQuery);
    };

    const getPaymentOptions = async (response) => {
        let paymentOptions = [];
        response.map((value) => {
            let payVariants = value.payment_options.split(',');
            payVariants.map((value, key) => {
                if (value == 1 || value == 'Cash Payment') {
                    if (!paymentOptions.includes('1')) {
                        paymentOptions.push('1')
                    }
                } else if (value == 2 || value == 'Online Payment') {
                    if (!paymentOptions.includes('2')) {
                        paymentOptions.push('2')
                    }
                }
            })
        })
        setPaymentVariants(paymentOptions)
    }

    const getCategoryDetails = async () => {
        let firstLevelCategory = []
        await axios.get(`/fetch-all-categories`).then((res) => {
            res.data.subCategories.map((value) => {
                if (value.maincat_id == category) {
                    firstLevelCategory.push(value)
                }
            })
        })
        setSubCategories(firstLevelCategory)
    }

    // const getPricefilterButtons = async (response) => {
    //     if (response.length > 0) {
    //         let filtered = response
    //             .filter(item => !isNaN(CurrencyConverterOnlyRateWithoutDecimal(item.currency, item.mrp, baseCurrencyValue)))
    //             .toSorted((a, b) => {
    //                 const aValue = CurrencyConverterOnlyRateWithoutDecimal(a.currency, a.mrp, baseCurrencyValue);
    //                 const bValue = CurrencyConverterOnlyRateWithoutDecimal(b.currency, b.mrp, baseCurrencyValue);

    //                 // console.log(aValue, bValue, "A Value is passing as aad");
    //                 return aValue - bValue;
    //             });


    //         // console.log(filtered[filtered.length - 1],"Filtered Value issssss123123123")


    //         // un comment this
    //         let result = createPriceSteps(Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0]?.currency, filtered[0]?.mrp, baseCurrencyValue)), Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1]?.currency, filtered[filtered.length - 1]?.mrp, baseCurrencyValue)))


    //         // remove this
    //         // let result = createPriceSteps(Number(CurrencyConverterOnlyRateWithoutDecimal('USD', filtered[0].mrp, baseCurrencyValue)), Number(CurrencyConverterOnlyRateWithoutDecimal('USD', filtered[response.length - 1].mrp, baseCurrencyValue)))



    //         if (response.length === 1) {
    //             const ranges = [];
    //             // console.log('insie',result)

    //             ranges.push({ start: CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue), end: CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue) });
    //             setminprice(CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue))
    //             setmaxprice(CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue))
    //             setpricerange([CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue), CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue)])
    //         } else if (response.length > 1) {
    //             // console.log('outside',result)

    //             setminprice(result[0].start)
    //             setmaxprice(result[result.length - 1].end)
    //             setpricerange([result[0].start, result[result.length - 1].end])
    //             setPrices(result);
    //             setUserMinMaxPrice({
    //                 min: result[0].start,
    //                 max: result[result.length - 1].end
    //             })
    //         } else {
    //             setPrices([]);
    //         }
    //         setTempCurrency(baseCurrencyValue.base);
    //     } else {
    //         setPrices([]);
    //     }
    // }
    const getPricefilterButtons = async (response) => {
        if (response.length > 0) {
            let filtered = response
                .filter(item => !isNaN(CurrencyConverterOnlyRateWithoutDecimal(item.currency, item.mrp, baseCurrencyValue)))
                .toSorted((a, b) => {
                    const aValue = CurrencyConverterOnlyRateWithoutDecimal(a.currency, a.mrp, baseCurrencyValue);
                    const bValue = CurrencyConverterOnlyRateWithoutDecimal(b.currency, b.mrp, baseCurrencyValue);
                    return aValue - bValue;
                });

            let result = createPriceSteps(
                Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[0]?.currency, filtered[0]?.mrp, baseCurrencyValue)),
                Number(CurrencyConverterOnlyRateWithoutDecimal(filtered[filtered.length - 1]?.currency, filtered[filtered.length - 1]?.mrp, baseCurrencyValue))
            );

            if (response.length === 1) {
                const ranges = [];
                ranges.push({
                    start: CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue),
                    end: CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue)
                });

                const singlePrice = CurrencyConverterOnlyRateWithoutDecimal(response[0].currency, response[0].mrp, baseCurrencyValue);
                setminprice(singlePrice);
                setmaxprice(singlePrice);
                setpricerange([singlePrice, singlePrice]);
                setUserMinMaxPrice({
                    min: singlePrice,
                    max: singlePrice
                });
            } else if (response.length > 1) {
                setminprice(result[0].start);
                setmaxprice(result[result.length - 1].end);
                setpricerange([result[0].start, result[result.length - 1].end]);
                setPrices(result);
                setUserMinMaxPrice({
                    min: result[0].start,
                    max: result[result.length - 1].end
                });
            } else {
                setPrices([]);
            }

            // Set tempCurrency to base currency for consistency
            setTempCurrency(baseCurrencyValue?.base || 'USD');
        } else {
            setPrices([]);
        }
    };

    const getBrands = async (dataset) => {
        let filteredBrands = []
        dataset.map((value) => {
            if (value.brand_id != null) {
                if (!filteredBrands.includes(value.brand_id.toLowerCase().trim())) {
                    filteredBrands.push(value.brand_id.toLowerCase().trim())
                }
            }
        })
        setBrands(filteredBrands)
    }

    const handleBrandChange = (value) => {
        setUserSearchQuery('');
        handleOnChange(value, selectedBrands, setselectedBrands, 'brand_id')
    }
    const handlePaymentOnChange = (value) => { handleOnChange(value, selectedPaymentVariants, setSelectedPaymentVariants, 'payment_options') }
    const handleUnitVariantChange = (value) => { handleOnChange(value, selecteddProductsUnitVariants, setSelectedProductsUnitVariants, 'unit') }
    const handleCategoryChange = (value) => {
    setUserSearchQuery('');
    
    // Check if this category is already selected
    const isAlreadySelected = selectedSubCategories.includes(value);
    
    if (isAlreadySelected) {
        // If already selected, deselect it
        setSelectedSubCategories([]);
        
        // Remove from filter checkboxes
        const filteredCheckboxes = filterCheckboxes.filter(filter => filter.type !== 'category2');
        setFilterCheckboxes(filteredCheckboxes);
        
        // Update filtering value array
        let result = [];
        filteredCheckboxes.map((filter) => {
            if (!result.includes(filter.type)) {
                result.push(filter.type);
            }
        });
        setFilteringValue(result);
    } else {
        // If not selected, select only this one (single select)
        setSelectedSubCategories([value]);
        
        // Remove any existing category filters and add the new one
        const nonCategoryFilters = filterCheckboxes.filter(filter => filter.type !== 'category2');
        const dataset = { value, type: "category2" };
        const sampledataset = [...nonCategoryFilters, dataset];
        
        setFilterCheckboxes(sampledataset);
        
        // Update filtering value array
        let result = [];
        sampledataset.map((filter) => {
            if (!result.includes(filter.type)) {
                result.push(filter.type);
            }
        });
        setFilteringValue(result);
    }
    
 
};

    const handlePriceFilterChange = async (value) => {
        setUserSearchQuery('');
        setminprice(value.start)
        setmaxprice(value.end)
        setpricefilter(true);
        setUserMinMaxPrice({
            min: value.start,
            max: value.end,
        })
    };

    const handleOnChange = (value, selectedItems, setSelectedItems, type) => {
        const index = selectedItems.indexOf(value);
        let updatedSelectedItems;
        if (index === -1) {
            updatedSelectedItems = [value, ...selectedItems];
        } else {
            updatedSelectedItems = selectedItems.filter(item => item !== value);
        }
        setSelectedItems(updatedSelectedItems);
        const dataset = { value, type };
        let sampledataset;
        if (index === -1) {
            sampledataset = [...filterCheckboxes, dataset];
        } else {
            sampledataset = filterCheckboxes.filter(item => !(item.value === value && item.type === type));
        }
        let result = []
        sampledataset.map((value) => {
            if (!result.includes(value.type)) {
                result.push(value.type)
            }
        })
        setFilteringValue(result)
        removeDuplicates(sampledataset);
    }

    const removeDuplicates = (arr) => {
        const unique = [];
        const items = new Set();
        arr.forEach(item => {
            const key = JSON.stringify(item);
            if (!items.has(key)) {
                items.add(key);
                unique.push(item);
            }
        });
        setFilterCheckboxes(unique);
    };

    const getFilteredProducts = (filters, dynamicValue, dataset) => {
        let filtered = [];
        if (filters.length === 0) {
            filtered = dataset.filter((data) => {

                // uncomment this comment those lines
                let price = Number(CurrencyConverterOnlyRateWithoutDecimal(data.currency, data.mrp, baseCurrencyValue));

                // console.log(price,"Price Data issss 123123123r8adjasd asd")

                if (price > 0) {


                    // console.log(minprice,"DDD231231231231 Price Data issss 123123123r8adjasd asd123123123")
                    return Number(minprice) <= price && price <= Number(maxprice);
                }


                // remove this return
                // return data;
            });
            return filtered;
        } else {
            filterCheckboxes.map((value) => {
                dataset.map((data) => {
                    let typeOfValue = typeof (data[dynamicValue])
                    let price = Number(CurrencyConverterOnlyRateWithoutDecimal(data.currency, data.mrp, baseCurrencyValue));
                    try {
                        if (typeOfValue === 'string') {
                            if (dynamicValue === 'payment_options') {
                                if (data?.[dynamicValue]?.split(',').includes(value.value)) {
                                    if (Number(minprice) <= price && price <= Number(maxprice)) {
                                        if (!filtered.includes(data)) {
                                            filtered.push(data);
                                        }
                                    }
                                }
                            } else if (data?.[dynamicValue]?.toLowerCase()?.trim() == value?.value?.toLowerCase()?.trim()) {
                                if (Number(minprice) <= price && price <= Number(maxprice)) {
                                    filtered.push(data);
                                }
                            }
                        } else {
                            if (data?.[dynamicValue] == value?.value) {
                                if (Number(minprice) <= price && price <= Number(maxprice)) {
                                    filtered.push(data);
                                }
                            }
                        }
                    } catch (error) {
                        if (data?.[dynamicValue] == value?.value) {
                            if (Number(minprice) <= price && price <= Number(maxprice)) {
                                filtered.push(data);
                            }
                        }
                    }
                })
            })
        }
        let remainingFilters = filters.slice(1)
        return getFilteredProducts(remainingFilters, remainingFilters[0], filtered);
    };

   const handleClearAllFilters = () => {
    setUserSearchQuery('');
    setFilteringValue([]);
    setFilterCheckboxes([]);
    setSelectedPaymentVariants([]);
    setSelectedProductsUnitVariants([]);
    setSelectedSubCategories([]); // Clear subcategories
    setSelectedPrice([]);
    setselectedBrands([]);

    // Reset price range with currency conversion consideration
    const resetMinPrice = pricerange[0] || 0;
    const resetMaxPrice = pricerange[1] || 0;

    setUserMinMaxPrice({
        min: resetMinPrice,
        max: resetMaxPrice
    });
    setminprice(resetMinPrice);
    setmaxprice(resetMaxPrice);
    setpricefilter(false);
};

    const handleMinMaxPrice = (e) => {
        const { name, value } = e.target;

        // Convert the display value back to base currency for storage
        const baseValue = convertFromDisplayCurrency(value, baseCurrencyValue, tempCurrency);

        setUserMinMaxPrice({
            ...userMinMaxPrice,
            [name]: baseValue,
        });
    };

    // const handleSearchPriceRange = () => {
    //     setUserSearchQuery('');
    //     if (Number(userMinMaxPrice.min) > Number(userMinMaxPrice.max)) {
    //         ToastMessage({ status: "warning", message: 'Your min price is greated then max price' })
    //     } else if (Number(userMinMaxPrice.min) < 0 || Number(userMinMaxPrice.max) < 0) {
    //         ToastMessage({
    //             status: "warning",
    //             message: 'Price values cannot be negative.'
    //         });
    //         return;

    //     } else if (Number(userMinMaxPrice.min) === 0 &&  Number(userMinMaxPrice.max) === 0) {
    //         ToastMessage({
    //             status: "warning",
    //             message: 'Please enter a valid price range.'
    //         });
    //         return;
    //     } else {
    //         setminprice(userMinMaxPrice.min);
    //         setmaxprice(userMinMaxPrice.max);
    //         setpricefilter(true);
    //         setUserSearchQuery("");

    //     }
    // };
    // console.log(products)
    const handleSearchPriceRange = () => {
        const regex = /^\d+(\.\d+)?$/; // Allow decimal numbers

        if (regex.test(userMinMaxPrice.min) && regex.test(userMinMaxPrice.max)) {
            // Use display values directly (since input is in display currency)
            const minPriceDisplay = Number(userMinMaxPrice.min);
            const maxPriceDisplay = Number(userMinMaxPrice.max);

            // Convert to base currency for comparison with pricerange
            const minPriceBase = convertFromDisplayCurrency(minPriceDisplay, baseCurrencyValue, tempCurrency);
            const maxPriceBase = convertFromDisplayCurrency(maxPriceDisplay, baseCurrencyValue, tempCurrency);

            if (minPriceDisplay > maxPriceDisplay) {
                ToastMessage({
                    status: "warning",
                    message: 'Please ensure that the minimum price is lower than the maximum price.'
                });
                return;
            } else if (minPriceDisplay < 0 || maxPriceDisplay < 0) {
                ToastMessage({
                    status: "warning",
                    message: 'Price values cannot be negative.'
                });
                return;
            } else if (minPriceDisplay === 0 && maxPriceDisplay === 0) {
                ToastMessage({
                    status: "warning",
                    message: 'Please enter a valid price range.'
                });
                return;
            }

            // Check against price range in base currency
            if (pricerange.length >= 2) {
                const minRangeDisplay = convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency);
                const maxRangeDisplay = convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency);

                if (minPriceDisplay < minRangeDisplay || maxPriceDisplay > maxRangeDisplay) {
                    ToastMessage({
                        status: "warning",
                        message: `Price range should be between ${minRangeDisplay} and ${maxRangeDisplay}.`
                    });
                    return;
                }
            }

            // Use base currency values for internal state
            setUserSearchQuery('');
            setminprice(minPriceBase);
            setmaxprice(maxPriceBase);
            setpricefilter(true);
        } else {
            ToastMessage({
                status: "warning",
                message: 'Please enter valid numeric values for price range.'
            });
        }
    };
    const startFiltering = () => {
        const filteredData = getFilteredProducts(filteringValue, filteringValue[0], products);

        setProductsFiltered(filteredData);
    };

    const combineFilters = () => {
        return {
            selectedBrands, selectedPaymentVariants, selectedSubCategories, pricies,
            userSearchQuery: userSearchQuery,
            minprice: minprice,
            maxprice: maxprice
        };
    };

    const openSubFilter = () => {
        setopenSideBarStatus(true);
    }

    const closeSubFilter = () => {
        setopenSideBarStatus(false);
    }

    const toggleSubFilter = () => {
        setopenSideBarStatus(!openSideBarStatus);
    };

    const openSearchFilter = () => {
        setSearchfilter(true);
    }

    const closeSearchFilter = () => {
        setSearchfilter(false);
        handleChange('')
    }

    useEffect(() => {
        if (!loading) {
            const filtersArray = JSON.stringify(combineFilters());
            if (category === 1) {
                setUserSearchFilters({
                    ...userSearchFilters,
                    'essential': filtersArray
                });
            } else {
                setUserSearchFilters({
                    ...userSearchFilters,
                    'nonessential': filtersArray
                });
            }
        }
    }, [selectedBrands, selectedPaymentVariants, selecteddProductsUnitVariants, selectedSubCategories, category]);

    useEffect(() => {
        if (!loading) {
            getCategoryDetails();
            handleClearAllFilters();
        }
    }, [category, loading])

    useEffect(() => {
        if (!loading) {
            // setSelectedPrice([])
            getPricefilterButtons(products)
        }
    }, []);

    useEffect(() => {
        if (!loading) {
            startFiltering()
        }
    }, [filterCheckboxes, currentOffset, minprice, maxprice, products, loading]);

    useEffect(() => {
        if (selectedPrice.length === 0) {
            setminprice(pricerange[0])
            setmaxprice(pricerange[1])
            setpricefilter(false)
        } else {
            const min = Math.min(...selectedPrice.map(price => price.start));
            const max = Math.max(...selectedPrice.map(price => price.end));
            setminprice(min);
            setmaxprice(max);
            setpricefilter(true);
        }
    }, [selectedPrice]);

    // useEffect(() => {
    //     window.scrollTo({
    //         top: 0,
    //         behavior: "smooth",
    //     });
    // }, [window.location.href]);


    useEffect(() => {
        const discountData = [];
        content.forEach(item => {
            if (item.discount && !discountData.some(data => JSON.stringify(data) === JSON.stringify(item.discount))) {
                discountData.push({
                    discount: item.discount,
                    product: item
                });
            }
        });
        setAllDiscountData(discountData);
        updateData(content);
    }, [content]);

  // Add this ref to track scroll position (add it with your other useRef declarations)
const scrollPositionRef = useRef(0);

// Replace your current scroll useEffect with this:
useEffect(() => {
  const handleScroll = () => {
    // Save current scroll position
    scrollPositionRef.current = window.scrollY;
    
    let check = (window.scrollY / 60) / (currentOffset / 60);
    if (check > 80) {
      setcurrentOffset(currentOffset + 60);
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [currentOffset]);

// Add this useEffect to restore scroll position after products load
useEffect(() => {
  if (!loading && products.length > 0) {
    // Restore scroll position after a brief delay to ensure DOM is updated
    setTimeout(() => {
      window.scrollTo(0, scrollPositionRef.current);
    }, 100);
  }
}, [products, loading]);

    useEffect(() => {
        // setloading(true);
        // router.replace(
        //     `/shop/essential?cID=${currentOffset}&sortCat=${selectedSortMethod}`,
        //     undefined,
        //     { scroll: false }
        //   );
        loadMoreProducts();
    }, [selectedSortMethod, currentOffset]);

    //  useEffect(() => {
    //     router.replace(
    //       `/shop/education?cID=${currentOffset}&sortCat=${selectedSortMethod}`,
    //       undefined,
    //       { scroll: false }
    //     );
    //     // getAllEducationProducts(5, 0, 0, 0, currentOffset, 0, selectedSortMethod).then(
    //     //   (res) => {
    //     //     setEducationData(res.educationListings);
    //     //     setEducationFilteredData(res.educationListings);
    //     //   }
    //     // );
    //   }, [currentOffset, selectedSortMethod]);


    const loadMoreProducts = async () => {
        try {
            let response = [];
            await getProductDetailsEssentialNonEssential(1, 0, 0, 0, currentOffset, 0, selectedSortMethod, baseLocation).then((res) => {
                if (res === '(Internal Server Error)' || res === "Something went wrong !") {
                    response = [];
                    setSetMoreProducts(false);
                } else {
                    response = res.discount_data;

                    setSetMoreProducts(false);
                    updateData(res.discount_data, "update");
                }
            });

        } catch (error) {
            setSetMoreProducts(false);
        }
    }

    const convertFromDisplayCurrency = (amount, baseCurrencyValue, tempCurrency) => {
        try {
            if (amount === '' || amount === null || amount === undefined || isNaN(amount)) return '';

            const numAmount = Number(amount);
            // Allow 0 as a valid value
            if (numAmount === 0) return 0;

            // If tempCurrency is the same as base currency, no conversion needed
            if (tempCurrency === baseCurrencyValue?.base) {
                return numAmount;
            }

            // Get the rate for the display currency
            const rate = baseCurrencyValue?.rates?.[tempCurrency];
            if (!rate) return numAmount;

            // Convert back to base currency (divide by rate)
            return (numAmount / rate);
        } catch (error) {
            console.error('Reverse currency conversion error:', error);
            return amount;
        }
    };

    const convertToDisplayCurrency = (amount, baseCurrencyValue, tempCurrency) => {
        try {
            if (amount === '' || amount === null || amount === undefined || isNaN(amount)) return '';

            // Allow 0 as a valid value
            const result = CurrencyConverterOnlyRateWithoutDecimal(tempCurrency, amount, baseCurrencyValue);
            return result !== undefined && result !== null ? result : amount;
        } catch (error) {
            console.error('Display currency conversion error:', error);
            return amount;
        }
    };


    // Add these with your other state variables
const [isSubcategoriesSticky, setIsSubcategoriesSticky] = useState(false);
const [screenWidth, setScreenWidth] = useState(0);

    // Add this useEffect for sticky subcategories
useEffect(() => {
  // Set initial width
  setScreenWidth(window.innerWidth);

  // Handle resize
  const handleResize = () => {
    setScreenWidth(window.innerWidth);
  };

  window.addEventListener('resize', handleResize);

  // Sticky subcategories scroll handler
  const handleScroll = () => {
    const productFilterElement = document.querySelector('.product-filter-content');
    const subcategoriesElement = document.querySelector('.subcategories-horizontal-wrapper');
    
    if (productFilterElement && subcategoriesElement) {
      const filterRect = productFilterElement.getBoundingClientRect();
      
      // Make subcategories sticky when product-filter-content reaches the top of viewport
      if (filterRect.top <= 80 && !isSubcategoriesSticky) {
        setIsSubcategoriesSticky(true);
      } else if (filterRect.top > 80 && isSubcategoriesSticky) {
        setIsSubcategoriesSticky(false);
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  
  // Cleanup
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
}, [isSubcategoriesSticky]);



    return (
        <>

            <Head>
                <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
                <title>Aahaas - Essential</title>
                <meta name="description" content="At Aahaas, we understand that every journey requires the right essentials to keep you comfortable and safe. Our collection includes everything from toiletries and personal care items to health services and emergency supplies." /> {/* Set meta description if needed */}
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
                                    "name": "Essential",
                                    "item": "https://www.aahaas.com/essential"
                                }
                            ]
                        }),
                    }}
                />
            </Head>

            <CommonLayout title={id == 'nonessential' ? 'non essential' : 'essential'} parent="home" openSubFilter={() => openSubFilter()} openSearchFilter={() => openSearchFilter()} onSearch={handleHeaderSearch}>
                <section className="section-b-space ratio_asos">
                    <div className="collection-wrapper">
                        {/* Full Width Banner */}
                        <div className="top-banner-wrapper">
                    {/* <a href={null}>
                      <img
                        src="/assets/images/Bannerimages/mainbanner/lifestyleBanner.jpg"
                        alt="Lifestyle Banner"
                        style={{
                          width: "100%",
                          height: "300px",
                          // objectFit: "cover",
                          // display: "block"
                        }}
                      />
                    </a> */}
                     <NewBanners/>
                  </div>
                        <Container>
                            <Row>
                                <Col
                                    sm="3"
                                    className="collection-filter yellow-scrollbar"
                                    id="filter"
                                    style={{
                                        display: openSideBarStatus ? "block" : "none",
                                        left: openSideBarStatus ? "0px" : "",
                                        position: 'sticky',
                                        top: '20px',
                                        alignSelf: 'flex-start',
                                        maxHeight: '100vh',
                                        overflowY: 'auto',
                                    }}
                                >
                                    <div className="collection-filter-block px-lg-4 pe-5" style={{ borderRadius: '10px' }}>
                                        <div className="collection-mobile-back" onClick={() => closeSubFilter()}>
                                            <span className="filter-back">
                                                <i className="fa fa-angle-left" ></i> back
                                            </span>
                                        </div>
                                        {/* Sort By Section */}
                                        <div className="collection-collapse-block">
                                            <h5
                                                style={{ fontWeight: "500", fontSize: '15px' }}
                                                className="collapse-block-title-selected"
                                            >
                                                Sort By
                                            </h5>
                                            <div className="collection-collapse-block-content">
                                                <div className="collection-brand-filter">
                                                    <Select
                                                        value={options.find(option => option.value === selectedSortMethod)}
                                                        onChange={(selectedOption) => {
                                                            handleSelectChange(selectedOption);
                                                            setIsSortingDropdownOpen(false);
                                                        }}
                                                        options={options}
                                                        isSearchable={false}
                                                        className="basic-single"
                                                        classNamePrefix="select"
                                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                        // Add these props to control dropdown state
                                                        onMenuOpen={() => setIsSortingDropdownOpen(true)}
                                                        onMenuClose={() => setIsSortingDropdownOpen(false)}
                                                        menuIsOpen={isSortingDropdownOpen}
                                                        styles={{
                                                            control: (provided) => ({
                                                                ...provided,
                                                                minHeight: '40px',
                                                                fontSize: '14px',
                                                                borderColor: '#ddd',
                                                                boxShadow: 'none',
                                                                width: '100%',
                                                                '&:hover': {
                                                                    borderColor: '#004e64'
                                                                }
                                                            }),
                                                            option: (provided) => ({
                                                                ...provided,
                                                                fontSize: '14px'
                                                            }),
                                                            menu: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9999,
                                                            }),
                                                            menuPortal: (provided) => ({
                                                                ...provided,
                                                                zIndex: 9999,
                                                            })
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="collection-collapse-block">
                                            <div className="collection-collapse-block">
                                                <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={priceFilters ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setPriceFilters(!priceFilters)}>Price</h5>
                                                <Collapse isOpen={priceFilters}>
                                                    <div className="collection-collapse-block-content">
                                                        <div className="collection-brand-filter">
                                                            {
                                                                pricies.length !== 0 &&
                                                                pricies.map((value, index) => (
                                                                    <div key={index} className="form-check custom-checkbox collection-filter-checkbox">
                                                                        <Input checked={value.start == minprice && value.end == maxprice} onChange={() => handlePriceFilterChange(value)} type="radio" className="custom-control-input option-btns" id={value} name={value} />
                                                                        <h6 onClick={() => handlePriceFilterChange(value)} className="m-0 p-0" htmlFor={value}>{CurrencyConverter(tempCurrency, value.start, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, value.end, baseCurrencyValue)}</h6>
                                                                    </div>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="collection-collapse-block-content">
                                                        <div className="collection-brand-filter">
                                                            <div className="d-flex align-items-end align-content-stretch gap-3">
                                                                {/* <div className="d-flex flex-column align-itmes-end col-4">
                                                                    <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
                                                                    <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} onInput={(e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }} placeholder="Min" value={userMinMaxPrice.min} min={pricerange[0]} max={pricerange[1]} name="min" onChange={(e) => handleMinMaxPrice(e)} />
                                                                </div>
                                                                <div className="d-flex flex-column align-itmes-end col-4">
                                                                    <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
                                                                    <input type="number" className="form-control" style={{ padding: '9px 10px', borderRadius: '5px' }} onInput={(e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10);
    }
  }} placeholder="Max" value={userMinMaxPrice.max} max={pricerange[1]} min={pricerange[0]} name="max" onChange={(e) => handleMinMaxPrice(e)} />
                                                                </div> */}
                                                                <div className="d-flex flex-column align-itmes-end col-4">
                                                                    <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Min price</h6>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        style={{ padding: '9px 10px', borderRadius: '5px' }}
                                                                        onInput={(e) => {
                                                                            if (e.target.value.length > 10) {
                                                                                e.target.value = e.target.value.slice(0, 10);
                                                                            }
                                                                        }}
                                                                        placeholder="Min"
                                                                        value={
                                                                            userMinMaxPrice.min !== '' && userMinMaxPrice.min !== null && userMinMaxPrice.min !== undefined ?
                                                                                convertToDisplayCurrency(userMinMaxPrice.min, baseCurrencyValue, tempCurrency) :
                                                                                ''
                                                                        }
                                                                        min={
                                                                            pricerange[0] !== undefined && pricerange[0] !== null ?
                                                                                convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency) :
                                                                                0
                                                                        }
                                                                        max={
                                                                            pricerange[1] !== undefined && pricerange[1] !== null ?
                                                                                convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency) :
                                                                                0
                                                                        }
                                                                        name="min"
                                                                        onChange={handleMinMaxPrice}
                                                                    />
                                                                </div>
                                                                <div className="d-flex flex-column align-itmes-end col-4">
                                                                    <h6 className="m-0 p-0" style={{ fontSize: '14px' }}>Max price</h6>
                                                                    <input
                                                                        type="number"
                                                                        className="form-control"
                                                                        style={{ padding: '9px 10px', borderRadius: '5px' }}
                                                                        onInput={(e) => {
                                                                            if (e.target.value.length > 10) {
                                                                                e.target.value = e.target.value.slice(0, 10);
                                                                            }
                                                                        }}
                                                                        placeholder="Max"
                                                                        value={
                                                                            userMinMaxPrice.max !== '' && userMinMaxPrice.max !== null && userMinMaxPrice.max !== undefined ?
                                                                                convertToDisplayCurrency(userMinMaxPrice.max, baseCurrencyValue, tempCurrency) :
                                                                                ''
                                                                        }
                                                                        max={
                                                                            pricerange[1] !== undefined && pricerange[1] !== null ?
                                                                                convertToDisplayCurrency(pricerange[1], baseCurrencyValue, tempCurrency) :
                                                                                0
                                                                        }
                                                                        min={
                                                                            pricerange[0] !== undefined && pricerange[0] !== null ?
                                                                                convertToDisplayCurrency(pricerange[0], baseCurrencyValue, tempCurrency) :
                                                                                0
                                                                        }
                                                                        name="max"
                                                                        onChange={handleMinMaxPrice}
                                                                    />
                                                                </div>
                                                                <div className="ms-auto col-3">
                                                                    <button className="btn btn-sm btn-solid" style={{ padding: '7px 10px', borderRadius: '5px' }} onClick={handleSearchPriceRange}><SearchIcon /></button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </div>
                                            {/* <div className="collection-collapse-block">
                                                <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={isCategoryOpen ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>Category</h5>
                                                <Collapse isOpen={isCategoryOpen}>
                                                    <div className="collection-collapse-block-content">
                                                        <div className="collection-brand-filter">
                                                            <ul className="category-list">
                                                                {
                                                                    subCategories.map((value, index) =>
                                                                        <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
                                                                            <Input checked={selectedSubCategories.includes(value.id)} onChange={() => { handleCategoryChange(value.id) }} type="checkbox" className="custom-control-input option-btns" id={value.submaincat_type} />
                                                                            <h6 onClick={() => handleCategoryChange(value.id)} className="m-0 p-0" htmlFor={value.submaincat_type}>{value.submaincat_type}</h6>
                                                                        </div>
                                                                    )
                                                                }

                                                            </ul>
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </div> */}
                                            {/* {brands?.length > 0 && <div className="collection-collapse-block">
                                                <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={brandFilter ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setBrandFilter(!brandFilter)}>brand</h5>
                                                <Collapse isOpen={brandFilter}>
                                                    <div className="collection-collapse-block-content">
                                                        <div className="collection-brand-filter">
                                                            {
                                                                brands.map((value, index) =>
                                                                    <div className="form-check custom-checkbox collection-filter-checkbox" key={index} >
                                                                        <Input checked={selectedBrands.includes(value)} onChange={() => { handleBrandChange(value) }} type="checkbox" className="custom-control-input option-btns" id={value} />
                                                                        <h6 onClick={() => handleBrandChange(value)} className="m-0 p-0 ellipsis-1-lines" style={{ textTransform: 'capitalize' }} htmlFor={value}>{value}</h6>
                                                                    </div>
                                                                )
                                                            }
                                                        </div>
                                                    </div>
                                                </Collapse>
                                            </div>} */}
                                            {
                                                paymentVariants.length > 0 &&
                                                <div className="collection-collapse-block">
                                                    <h5 style={{ fontWeight: '500', fontSize: '15px' }} className={paymentFilters ? "collapse-block-title-selected" : "collapse-block-title"} onClick={() => setPaymentFilters(!paymentFilters)}>Payment options</h5>
                                                    <Collapse isOpen={paymentFilters}>
                                                        <div className="collection-collapse-block-content">
                                                            <div className="collection-brand-filter">
                                                                {
                                                                    paymentVariants.map((value, key) => (
                                                                        <div key={key} className="form-check custom-checkbox collection-filter-checkbox">
                                                                            <Input type="checkbox" ref={(element) => { ref.current[value] = element }} value={value} id={value} className="custom-control-input option-btns" checked={selectedPaymentVariants.includes(value)} onChange={() => { handlePaymentOnChange(value) }} name={value} />
                                                                            <h6 onClick={() => handlePaymentOnChange(value)} className="m-0 p-0" htmlFor={value}>{value == 1 ? 'Cash On Delivery' : value == 2 ? 'Online Transfer' : null}</h6>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </Collapse>
                                                </div>
                                            }


                                        </div>
                                    </div>
                                </Col>

                                <Col
                                    className="collection-content"
                                    sm='12'
                                    md='12'
                                    lg={openSideBarStatus ? "9" : "12"}
                                    style={{
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <div className="page-main-content">
                                        <Row>
                                            <Col sm="12">
                                                <div className="collection-product-wrapper mt-0 mt-lg-2" style={{ paddingLeft: openSideBarStatus ? '10px' : '20px' }}>
  <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row border-bottom pb-2 gap-2">
                                                        <div style={{ marginTop: '7px' }}>
      <button
        className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
        onClick={toggleSubFilter}
        style={{
          borderRadius: "8px",
          padding: "8px 16px",
          height: "40px",
          fontSize: "14px",
          fontWeight: "500",
          border: "1px solid #004e64",
          backgroundColor: "#004e64",
          color: "white",
          transition: "all 0.3s ease",
          minWidth: "50px",
          flexShrink: 0,
        }}
      >
        <TuneIcon sx={{ fontSize: '22px', color: 'white' }} />
      </button>
    </div>
    {!loading && subCategories.length > 0 && (
  <div 
    className={`subcategories-horizontal-wrapper w-100 ${isSubcategoriesSticky ? 'sticky-subcategories' : ''}`}
    style={{
      ...(isSubcategoriesSticky && {
        position: 'fixed',
        top: '138px',
        left: '0',
        right: '0',
        zIndex: 10,
        backgroundColor: 'white',
        padding: '0px 20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e0e0e0',
        margin: '0 10px',
      })
    }}
  >
    <div 
      className="subcategories-horizontal d-flex gap-2 align-items-center"
      style={{
        overflowX: 'auto',
        flexWrap: 'nowrap',
        scrollbarWidth: 'thin',
        scrollbarColor: '#e0e0e0 transparent',
        margin: '7px 0',
        paddingBottom: '8px',
      }}
    >
      {/* Filter Button - Always visible in sticky mode */}
      {isSubcategoriesSticky && (
        <button
          className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2"
          onClick={toggleSubFilter}
          style={{
            borderRadius: "8px",
            padding: "8px 12px",
            height: "40px",
            fontSize: "14px",
            fontWeight: "500",
            border: "1px solid #004e64",
            backgroundColor: "#004e64",
            color: "white",
            transition: "all 0.3s ease",
            minWidth: "50px",
            flexShrink: 0,
            marginRight: "8px"
          }}
        >
          <TuneIcon sx={{ fontSize: '20px', color: 'white' }} />
        </button>
      )}
      
      <button
        className={`subcategory-chip ${selectedSubCategories.length === 0 ? 'active' : ''}`}
        onClick={() => {
        //   window.scrollTo({
        //     top: 0,
        //     behavior: 'smooth'
        //   });
          setSelectedSubCategories([]);
          // Remove category filters
          const filteredCheckboxes = filterCheckboxes.filter(filter => filter.type !== 'category2');
          setFilterCheckboxes(filteredCheckboxes);
          
          let result = [];
          filteredCheckboxes.map((filter) => {
            if (!result.includes(filter.type)) {
              result.push(filter.type);
            }
          });
          setFilteringValue(result);
        }}
        style={{
          background: selectedSubCategories.length === 0 ? '#004e64' : 'transparent',
          color: selectedSubCategories.length === 0 ? 'white' : '#004e64',
          border: '1px solid #004e64',
          borderRadius: '20px',
          padding: '8px 16px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0
        }}
      >
        <span style={{ fontSize: '16px' }}>🏷️</span>
        All Categories
      </button>
      {subCategories.map((category, index) => (
        <button
          key={category.id}
          className={`subcategory-chip ${selectedSubCategories.includes(category.id) ? 'active' : ''}`}
          onClick={() => {
            handleCategoryChange(category.id);
          }}
          style={{
            background: selectedSubCategories.includes(category.id) ? '#004e64' : 'transparent',
            color: selectedSubCategories.includes(category.id) ? 'white' : '#004e64',
            border: '1px solid #004e64',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}
          onMouseOver={(e) => {
            if (!selectedSubCategories.includes(category.id)) {
              e.target.style.background = '#f8f9fa';
            }
          }}
          onMouseOut={(e) => {
            if (!selectedSubCategories.includes(category.id)) {
              e.target.style.background = 'transparent';
            }
          }}
        >
          {category.submaincat_type}
        </button>
      ))}
    </div>
  </div>
)}
    {/* Spacer div to prevent content jump when sticky is active */}
    {isSubcategoriesSticky && !loading && subCategories.length > 0 && (
      <div style={{ height: '80px', width: '100%' }}></div>
    )}

                                                        {/* <h5 className="p-0 m-0 d-none d-lg-block ms-auto" style={{ fontSize: '15px', fontWeight: '500', marginTop: "10px" }}>
                                                            {!loading ? `Showing ${productsFiltered.length} Products` : "loading"}
                                                        </h5> */}
                                                    </div>

                                                    {/* Search Section */}
                                                    {searchFilter && (
                                                        <div className="d-flex align-items-center gap-3 my-3">
                                                            <div
                                                                className="collection-brand-filter d-flex align-items-stretch col-12 col-lg-4 col-md-6 border"
                                                                style={{ borderRadius: "10px!important" }}
                                                            >
                                                                <input
                                                                    type="text"
                                                                    className="form-control border-0 py-2"
                                                                    value={userSearchQuery}
                                                                    placeholder="Search products.."
                                                                    onChange={(e) => handleChange(e.target.value)}
                                                                />
                                                                {userSearchQuery === '' ?
                                                                    <SearchIcon sx={{ margin: 'auto 10px auto 0px' }} /> :
                                                                    <CloseIcon onClick={() => closeSearchFilter()} sx={{ margin: 'auto 10px auto 0px' }} />
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                    {allDiscountData.length > 0 && <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row align-items-center border-bottom pb-3 gap-3">
                                                        <ProductSlider allDiscountData={allDiscountData} type={'essential'} />
                                                    </div>}
                                                    <ul className="product-filter-tags p-0 m-0 my-2">
                                                        {
                                                            selectedBrands.map((brand, i) => (
                                                                <li key={i}>
                                                                    <a href={null} className="filter_tag">{brand}<i className="fa fa-close" onClick={() => handleBrandChange(brand)}></i>
                                                                    </a>
                                                                </li>
                                                            ))
                                                        }
                                                        {
    selectedSubCategories.map((category, i) => (
        <li key={i}>
            {
                subCategories.map((value) => (
                    category == value.id &&
                    <a href={null} className="filter_tag" > 
                        {value.submaincat_type} 
                        <i className="fa fa-close" onClick={() => handleCategoryChange(category)}></i>
                    </a>
                ))
            }
        </li>
    ))
}
                                                        {
                                                            selecteddProductsUnitVariants.map((value, i) => (
                                                                <li key={i}>
                                                                    <a href={null} className="filter_tag">{value}<i className="fa fa-close" onClick={() => handleUnitVariantChange(value)}></i></a>
                                                                </li>
                                                            ))
                                                        }
                                                        {
                                                            selectedPaymentVariants.map((payment, key) => (
                                                                <li key={key}>
                                                                    <a href={null} className="filter_tag">{payment == 1 ? 'Cash On Delivery' : payment == 2 ? 'Online Transfer' : null}<i className="fa fa-close" onClick={() => handlePaymentOnChange(payment)}></i>
                                                                    </a>
                                                                </li>
                                                            ))
                                                        }
                                                        {
                                                            pricefilter &&
                                                            <li>
                                                                <a href={null} className="filter_tag">
                                                                    {CurrencyConverter(tempCurrency, minprice, baseCurrencyValue)} - {CurrencyConverter(tempCurrency, maxprice, baseCurrencyValue)}
                                                                    <i className="fa fa-close" onClick={() => setSelectedPrice([])}></i>
                                                                </a>
                                                            </li>
                                                        }
                                                        {
                                                            (pricefilter || selectedBrands.length > 0 || selectedSubCategories.length > 0 || selecteddProductsUnitVariants.length > 0 || selectedPaymentVariants.length > 0) &&
                                                            <li onClick={() => handleClearAllFilters()}>
                                                                <a href={null} className="filter_tag" style={{ borderColor: 'red', color: 'red' }}>Clear all<i className="fa fa-close"></i></a>
                                                            </li>
                                                        }
                                                    </ul>
                                                    <Row>
                                                        {
                                                            loading ?
                                                                <div className="row mx-0 mt-2 margin-default">
                                                                    <div className="col-xl-3 col-lg-4 col-6">
                                                                        <PostLoader />
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-4 col-6">
                                                                        <PostLoader />
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-4 col-6">
                                                                        <PostLoader />
                                                                    </div>
                                                                    <div className="col-xl-3 col-lg-4 col-6">
                                                                        <PostLoader />
                                                                    </div>
                                                                </div> :
                                                                !loading && productsFiltered.length === 0 ?
                                                                    <Col xs="12">
                                                                        <div className="my-3">
                                                                            <div className="col-sm-12 empty-cart-cls text-center">
                                                                                <img alt='category wise banner' src='/assets/images/ErrorImages/file.png' className="img-fluid mb-3 mx-auto" />
                                                                                <h4 style={{ fontSize: 22, fontWeight: '600' }} className="px-5">Sorry, there are no products available right now.</h4>
                                                                                <h4 style={{ fontSize: 15 }}>Please check back later or explore other options.</h4>
                                                                                {/* <div className="d-flex gap-2 mt-3 align-content-center justify-content-center">
                                                                                {
                                                                                    userSearchQuery !== '' &&
                                                                                    <Link href=''>Get more help ?</Link>
                                                                                }
                                                                                {
                                                                                    userSearchQuery !== '' &&
                                                                                    userId !== 'AHS_Guest' &&
                                                                                    <span>Or</span>
                                                                                }
                                                                                {
                                                                                    userId !== 'AHS_Guest' &&
                                                                                    <Link href=''>Chat with us ?</Link>
                                                                                }
                                                                                {
                                                                                    userSearchQuery === '' &&
                                                                                    <div className="d-flex flex-column align-items-center gap-2">
                                                                                        <h4 style={{ fontSize: 12, color: 'gray' }} className="m-0 p-0">There is no products avalible in {baseLocation?.address_full}</h4>
                                                                                    </div>
                                                                                }
                                                                            </div> */}
                                                                            </div>
                                                                        </div>
                                                                    </Col>
                                                                    : productsFiltered.map((product, i) => (
                                                                        <div className={grid} key={i}>
                                                                            <ProductItems product={product} related={false} productImage={product?.product_images} productstype={id} title={product?.listing_title} productcurrency={product?.currency} mrp={product?.mrp} description={product?.listing_description} rating={4} addWishlist={() => contextWishlist.addToWish(product)} addCart={() => context.addToCart(product, quantity)} addCompare={() => comapreList.addToCompare(product)} cartClass={'cart-info cart-wrap'} backImage={true} />
                                                                        </div>
                                                                    ))
                                                        }
                                                        {
                                                            setMoreProducts &&

                                                            <div className="loader-wrapper-shop" style={{ zIndex: -1 }}>
                                                                <div className="loader">
                                                                </div>
                                                            </div>
                                                        }
                                                    </Row>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <style>
                        {`
          .yellow-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.yellow-scrollbar::-webkit-scrollbar-thumb {
  background-color: #ededed;
  border-radius: 10px;
}

.yellow-scrollbar::-webkit-scrollbar-track {
  background-color: transparent;
}

.yellow-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #ededed transparent;
}
        `}
                    </style>
                </section>
            </CommonLayout>
        </>
    )
}

export default EssentialNonEssentialMainpage