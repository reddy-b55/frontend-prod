// pages/vendor-products/[vendorId].js
import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col, Button, Badge, Collapse } from "reactstrap";
import Head from "next/head";
import { AppContext } from "../_app";
import CommonLayout from "../../components/shop/common-layout";
import ProductItem from "../../components/common/product-box/ProductBox";
import ProductSkeleton from "../skeleton/productSkeleton";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StoreIcon from '@mui/icons-material/Store';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import SchoolIcon from '@mui/icons-material/School';
import SpaIcon from '@mui/icons-material/Spa';
import TuneIcon from '@mui/icons-material/Tune';
import axios from "axios";
import { getProductDetailsEssentialNonEssential } from "../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";
import { getLifesyleproducts } from "../../AxiosCalls/LifestyleServices/newLifeStyleService";
import { getAllEducationProducts } from "../../AxiosCalls/EducationServices/educationServices";

// Function to get ALL vendor products
const getVendorAllProducts = async (vendorId) => {
    console.log("Fetching ALL products for vendor:", vendorId);

    try {
        // 1. Get vendor details
        const vendorResponse = await axios.get(`/get_vendor_by_id/${vendorId}`);
        console.log("Vendor response:", vendorResponse.data);

        const vendorData = vendorResponse.data?.vendorData || {};

        // Get vendor name from data
        const vendorName =
            vendorData.company_name ||
            vendorData.vendor_name ||
            (vendorData.first_name && vendorData.last_name ? `${vendorData.first_name} ${vendorData.last_name}` : 'Vendor');

        // Default location coordinates
        const defaultLatitude = 6.9271;
        const defaultLongitude = 79.8612;

        // Get location from cookies if available
        let latitude = defaultLatitude;
        let longitude = defaultLongitude;

        // 2. Get essential products (category 1)
        const essentialResponse = await getProductDetailsEssentialNonEssential(
            1, 0, 0, 0, 1000, vendorId, "", {
            locationDescription: "",
            latitude: "",
            longitude: "",
            dataSet: "{}"
        }
        );

        // 3. Get non-essential products (category 2)
        const nonEssentialResponse = await getProductDetailsEssentialNonEssential(
            2, 0, 0, 0, 1000, vendorId, "", {
            locationDescription: "",
            latitude: "",
            longitude: "",
            dataSet: "{}"
        }
        );

        // 4. Get education products - FIXED: Pass all required parameters
        let educationResponse = { educationListings: [] };
        try {
            educationResponse = await getAllEducationProducts(
                5,        // mainId
                0,        // category1
                0,        // category2
                0,        // category3
                1000,     // currentOffset
                0,        // id (usually 0 for all)
                "default", // dataSorterKeys
                latitude, // latitude
                longitude, // longitude
                vendorId  // vendor ID - THIS WAS MISSING!
            );
        } catch (error) {
            console.log("Education products error:", error);
        }

        // 5. Get lifestyle products using the new API
        let lifestyleProducts = [];
        try {
            // Prepare location data similar to the lifestyle page
            const locationData = {
                locationDescription: "",
                latitude: String(latitude),
                longitude: String(longitude),
                place_id: "",
                isCountry: false,
                dataSet: JSON.stringify({
                    id: null,
                    description: "",
                    latitude: String(latitude),
                    longitude: String(longitude),
                    place_id: "",
                    data: "null",
                    created_at: new Date().toISOString(),
                    dataSet: null,
                    address_components: []
                })
            };

            // Fetch lifestyle products for the vendor
            // We'll use both providers (aahaas and bridgify) to get all lifestyle products
            const providers = ["aahaas", "bridgify"];
            
            // Create an array to hold all lifestyle product promises
            const lifestylePromises = providers.map(async (provider) => {
                try {
                    // Prepare parameters similar to the lifestyle page
                    const params = {
                        dataSet: JSON.stringify(locationData),
                        isCountry: false,
                        latitude: String(latitude),
                        longitude: String(longitude),
                        page: 1,
                        pageSize: 1000, // Large page size to get all products
                        provider: provider,
                        radius: "50",
                        sortArray: "",
                        vendorId: vendorId  // Add vendor ID here
                    };

                    console.log(`Fetching ${provider} lifestyle products for vendor ${vendorId}:`, params);

                    // Call the lifestyle API directly
                    const response = await axios.get(`/lifestyles/${provider}`, { params });
                    
                    if (response.data?.status === 200) {
                        console.log(`Successfully fetched ${provider} lifestyle products:`, response.data?.data?.length || 0);
                        return response.data?.data || [];
                    } else {
                        console.log(`No ${provider} lifestyle products found for vendor ${vendorId}`);
                        return [];
                    }
                } catch (error) {
                    console.error(`Error fetching ${provider} lifestyle products:`, error);
                    return [];
                }
            });

            // Wait for all providers to complete
            const allLifestyleResults = await Promise.all(lifestylePromises);
            
            // Flatten all results into a single array
            lifestyleProducts = allLifestyleResults.flat();
            
            console.log("Total lifestyle products found:", lifestyleProducts.length);
            
            // Filter out any duplicate products based on lifestyle_id
            const uniqueProducts = [];
            const seenIds = new Set();
            
            lifestyleProducts.forEach(product => {
                const productId = product.lifestyle_id || product.id;
                if (productId && !seenIds.has(productId)) {
                    seenIds.add(productId);
                    uniqueProducts.push(product);
                }
            });
            
            lifestyleProducts = uniqueProducts;
            console.log("Unique lifestyle products after deduplication:", lifestyleProducts.length);
            
        } catch (error) {
            console.log("Lifestyle products error:", error);
            lifestyleProducts = [];
        }

        // Log counts for debugging
        console.log("Product counts:", {
            vendorName: vendorName,
            essential: essentialResponse?.discount_data?.length || 0,
            nonEssential: nonEssentialResponse?.discount_data?.length || 0,
            education: educationResponse?.educationListings?.length || 0,
            lifestyle: lifestyleProducts.length
        });

        // Log sample lifestyle products for debugging
        if (lifestyleProducts.length > 0) {
            console.log("Sample lifestyle products:", lifestyleProducts.slice(0, 3).map(p => ({
                id: p.lifestyle_id || p.id,
                name: p.lifestyle_name,
                vendor: p.vendor_id || p.vendorId,
                category: p.category_id || p.category
            })));
        }

        return {
            vendorData: vendorData,
            vendorName: vendorName,
            essentialProducts: essentialResponse?.discount_data || [],
            nonEssentialProducts: nonEssentialResponse?.discount_data || [],
            educationProducts: educationResponse?.educationListings || [],
            lifestyleProducts: lifestyleProducts // Use the new lifestyle products array
        };

    } catch (error) {
        console.error("Error in getVendorAllProducts:", error);
        return {
            vendorData: {},
            vendorName: 'Vendor',
            essentialProducts: [],
            nonEssentialProducts: [],
            educationProducts: [],
            lifestyleProducts: []
        };
    }
};

export async function getServerSideProps(context) {
    const { vendorId } = context.params;
    const vendorNameFromQuery = context.query.vendorName || '';

    console.log("Server side props - vendorId:", vendorId);

    let vendorProducts = {};

    try {
        vendorProducts = await getVendorAllProducts(vendorId);
        console.log("All vendor products fetched:", {
            vendorName: vendorProducts.vendorName,
            essentialCount: vendorProducts.essentialProducts?.length,
            nonEssentialCount: vendorProducts.nonEssentialProducts?.length,
            educationCount: vendorProducts.educationProducts?.length,
            lifestyleCount: vendorProducts.lifestyleProducts?.length
        });

    } catch (error) {
        console.error("Error in getServerSideProps:", error);
        vendorProducts = {
            vendorData: {},
            vendorName: vendorNameFromQuery || 'Vendor',
            essentialProducts: [],
            nonEssentialProducts: [],
            educationProducts: [],
            lifestyleProducts: []
        };
    }

    return {
        props: {
            vendorId,
            vendorProducts,
        },
    };
}

const VendorProductsPage = ({ vendorId, vendorProducts }) => {
    const router = useRouter();
    const { baseCurrencyValue } = useContext(AppContext);
    const { category, tab } = router.query; // Get both category and tab from query

    // Refs for DOM elements
    const subcategoriesWrapperRef = useRef(null);
    const spacerRef = useRef(null);
    
    // Define valid tab IDs
    const validTabs = ['lifestyle', 'education', 'essential', 'nonEssential'];

    // Set activeTab: priority: tab param -> category param -> default 'lifestyle'
    const [activeTab, setActiveTab] = useState(
        validTabs.includes(tab) ? tab :
            validTabs.includes(category) ? category :
                'lifestyle'
    );

    // Also update the useEffect to handle query parameter changes
    useEffect(() => {
        if (router.isReady) {
            const { category: queryCategory, tab: queryTab } = router.query;

            // Priority: tab parameter overrides category parameter
            if (validTabs.includes(queryTab)) {
                setActiveTab(queryTab);
                setSelectedSubCategories([]); // Reset subcategories when tab changes
            } else if (validTabs.includes(queryCategory)) {
                setActiveTab(queryCategory);
                setSelectedSubCategories([]); // Reset subcategories when tab changes
            }
        }
    }, [router.isReady, router.query]);

    // Update your handleBack function to preserve the tab
    const handleBack = () => {
        // You can go back to the product or to the essential page
        if (activeTab === 'essential') {
            router.push('/shop/essential');
        } else if (activeTab === 'nonEssential') {
            router.push('/shop/nonessential');
        } else if (activeTab === 'lifestyle') {
            router.push('/shop/lifestyle');
        } else if (activeTab === 'education') {
            router.push('/shop/education');
        } else {
            router.back();
        }
    };
    
    const [loading, setLoading] = useState(true);
    const [vendorInfo, setVendorInfo] = useState({});
    const [vendorName, setVendorName] = useState('');
    const [allProducts, setAllProducts] = useState({
        essential: [],
        nonEssential: [],
        education: [],
        lifestyle: []
    });

    // Subcategories state
    const [subCategories, setSubCategories] = useState([]);
    const [selectedSubCategories, setSelectedSubCategories] = useState([]);
    const [openSideBarStatus, setOpenSideBarStatus] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    
    // State for subcategories height (for spacer)
    const [subcategoriesHeight, setSubcategoriesHeight] = useState(50);

    // Define categories in the exact order from image
    const mainCategories = [
        { id: 'lifestyle', label: 'Lifestyle', icon: <SpaIcon />, color: '#9c27b0' },
        { id: 'education', label: 'Education', icon: <SchoolIcon />, color: '#2196f3' },
        { id: 'essential', label: 'Essentials', icon: <LocalShippingIcon />, color: '#28a745' },
        { id: 'nonEssential', label: 'Non Essentials', icon: <ShoppingBagIcon />, color: '#6c757d' }
    ];

    const allCategories = ['Adventure', 'Tours', 'Transport'];

    // Function to fetch subcategories
    const getCategoryDetails = async (categoryId) => {
        try {
            const response = await axios.get(`/fetch-all-categories`);
            let firstLevelCategory = [];

            if (response.data && response.data.subCategories) {
                // Map category IDs based on your system
                const categoryMap = {
                    'lifestyle': 3,  // Lifestyle category ID
                    'education': 5,   // Education category ID
                    'essential': 1,   // Essential category ID
                    'nonEssential': 2 // Non-essential category ID
                };

                const actualCategoryId = categoryMap[categoryId] || categoryId;

                response.data.subCategories.forEach((value) => {
                    if (value.maincat_id == actualCategoryId) {
                        firstLevelCategory.push(value);
                    }
                });
            }

            setSubCategories(firstLevelCategory);
            console.log(`Fetched ${firstLevelCategory.length} subcategories for ${categoryId}:`, firstLevelCategory);
        } catch (error) {
            console.error("Error fetching subcategories:", error);
            setSubCategories([]);
        }
    };

    useEffect(() => {
        console.log("Component mounted with props:", {
            vendorId,
            vendorProducts
        });

        if (vendorProducts) {
            setVendorInfo(vendorProducts.vendorData || {});
            setVendorName(vendorProducts.vendorName || 'Vendor');
            setAllProducts({
                essential: vendorProducts.essentialProducts || [],
                nonEssential: vendorProducts.nonEssentialProducts || [],
                education: vendorProducts.educationProducts || [],
                lifestyle: vendorProducts.lifestyleProducts || []
            });
            setLoading(false);

            // Debug: Log sample products
            if (vendorProducts.essentialProducts?.length > 0) {
                console.log("First essential product:", vendorProducts.essentialProducts[0]);
                console.log("First essential product keys:", Object.keys(vendorProducts.essentialProducts[0]));
            }
            if (vendorProducts.lifestyleProducts?.length > 0) {
                console.log("First lifestyle product:", vendorProducts.lifestyleProducts[0]);
            }
        }
    }, [vendorProducts]);

    // Fetch subcategories when tab changes
    useEffect(() => {
        if (!loading) {
            getCategoryDetails(activeTab);
        }
    }, [activeTab, loading]);

    // Calculate subcategories height when they change
    useEffect(() => {
        if (subcategoriesWrapperRef.current) {
            const height = subcategoriesWrapperRef.current.offsetHeight;
            setSubcategoriesHeight(height);
        }
    }, [subCategories]);

    const getActiveProducts = () => {
        switch (activeTab) {
            case 'lifestyle':
                return allProducts.lifestyle;
            case 'education':
                return allProducts.education;
            case 'essential':
                return allProducts.essential;
            case 'nonEssential':
                return allProducts.nonEssential;
            default:
                return [];
        }
    };

    const getProductCount = (category) => {
        switch (category) {
            case 'lifestyle': return allProducts.lifestyle.length;
            case 'education': return allProducts.education.length;
            case 'essential': return allProducts.essential.length;
            case 'nonEssential': return allProducts.nonEssential.length;
            default: return 0;
        }
    };

    // Handle subcategory change
    const handleCategoryChange = (categoryId) => {
        console.log("Category changed:", categoryId);

        // Check if this category is already selected
        const isAlreadySelected = selectedSubCategories.includes(categoryId);

        if (isAlreadySelected) {
            // If already selected, deselect it
            setSelectedSubCategories([]);
        } else {
            // If not selected, select only this one (single select)
            setSelectedSubCategories([categoryId]);
        }
    };

    // Filter products based on selected subcategory - UPDATED FOR LIFESTYLE
    const getFilteredProducts = () => {
        const activeProducts = getActiveProducts();

        if (selectedSubCategories.length === 0 || subCategories.length === 0) {
            return activeProducts;
        }

        const selectedCategoryId = selectedSubCategories[0];
        const selectedSubCategory = subCategories.find(cat => cat.id == selectedCategoryId);

        console.log("Filtering products for category:", {
            activeTab,
            selectedCategoryId,
            selectedSubCategoryName: selectedSubCategory?.submaincat_type,
            totalProducts: activeProducts.length
        });

        // Filter products by subcategory based on product type
        return activeProducts.filter(product => {
            // For lifestyle products - FIXED TO MATCH LIFESTYLE PAGE LOGIC
            if (activeTab === 'lifestyle') {
                // Check category_2 field (this is what the lifestyle page uses)
                const productCategory2 = product.category_2;
                
                console.log("Lifestyle product category check:", {
                    productTitle: product.lifestyle_name || product.title,
                    productId: product.lifestyle_id || product.id,
                    category_2: productCategory2,
                    selectedCategoryId,
                    match: productCategory2 == selectedCategoryId
                });

                // Check category_2 field (primary check based on lifestyle page)
                if (productCategory2 && productCategory2 == selectedCategoryId) {
                    console.log(`✅ Lifestyle match found in category_2:`, productCategory2, "==", selectedCategoryId, "for:", product.lifestyle_name);
                    return true;
                }

                // Also check other possible category fields as fallback
                const lifestyleCategoryFields = [
                    'category_id',
                    'sub_category_id',
                    'category',
                    'sub_category',
                    'category1',
                    'category2',
                    'category3',
                    'submaincat_id'
                ];

                for (const field of lifestyleCategoryFields) {
                    if (product[field] && product[field] == selectedCategoryId) {
                        console.log(`✅ Lifestyle match found in field "${field}":`, product[field], "==", selectedCategoryId, "for:", product.lifestyle_name);
                        return true;
                    }
                }

                // Also check by subcategory name if available
                if (selectedSubCategory) {
                    const subCategoryName = selectedSubCategory.submaincat_type.toLowerCase();

                    // Check if product has a matching category name
                    const nameFields = ['category_name', 'sub_category_name', 'category_type', 'submaincat_type'];
                    for (const field of nameFields) {
                        if (product[field] && product[field].toLowerCase().includes(subCategoryName)) {
                            console.log(`✅ Lifestyle name match found in field "${field}":`, product[field], "includes", subCategoryName);
                            return true;
                        }
                    }
                }

                return false;
            }
            // For education products
            else if (activeTab === 'education') {
                // Check ALL possible category fields for education
                const educationCategoryFields = [
                    'category_id',
                    'sub_category_id',
                    'category1',
                    'category2',
                    'category3',
                    'sub_category',
                    'category',
                    'main_category',
                    'submaincat_id',
                    'education_category_id'
                ];

                for (const field of educationCategoryFields) {
                    if (product[field] && product[field] == selectedCategoryId) {
                        return true;
                    }
                }

                // Also check by subcategory name if available
                if (selectedSubCategory) {
                    const subCategoryName = selectedSubCategory.submaincat_type.toLowerCase();
                    const nameFields = ['category_name', 'sub_category_name', 'category_type', 'submaincat_type'];
                    for (const field of nameFields) {
                        if (product[field] && product[field].toLowerCase().includes(subCategoryName)) {
                            return true;
                        }
                    }
                }

                return false;
            }
            // For essential/non-essential products
            else if (activeTab === 'essential' || activeTab === 'nonEssential') {
                const possibleCategoryFields = [
                    'category_id',
                    'sub_category_id',
                    'subcategory_id',
                    'category2',
                    'subcategory',
                    'category',
                    'main_category',
                    'submaincat_id'
                ];

                // Check all possible category fields
                for (const field of possibleCategoryFields) {
                    if (product[field] && product[field] == selectedCategoryId) {
                        return true;
                    }
                }

                // Also check if the subcategory name matches
                if (product.subcategory_name || product.sub_category_name) {
                    const subCatName = product.subcategory_name || product.sub_category_name;
                    if (selectedSubCategory && subCatName.toLowerCase().includes(selectedSubCategory.submaincat_type.toLowerCase())) {
                        return true;
                    }
                }

                return false;
            }
            return false;
        });
    };

    const getDisplayProducts = () => {
        return getFilteredProducts();
    };

    // Helper function to extract data for ProductItem based on category
    const getProductData = (product, category) => {
        const baseData = {
            product: product,
            currency: baseCurrencyValue,
            productstype: category === 'nonEssential' ? 'nonessential' : category
        };

        // For ALL products, try multiple field names for title
        const possibleTitleFields = [
            'title',
            'name',
            'product_name',
            'lifestyle_name',  // For lifestyle
            'course_name',     // For education
            'listing_title',   // For hotels
            'hotelName',       // For hotels
            'vehicleName'      // For transport
        ];

        const possibleDescriptionFields = [
            'description',
            'short_description',
            'lifestyle_description',  // For lifestyle
            'course_description',     // For education
            'listing_description',    // For hotels
            'hotelAddress'            // For hotels
        ];

        // Find title from possible fields
        for (const field of possibleTitleFields) {
            if (product[field] && product[field].toString().trim() !== '') {
                baseData.title = product[field];
                break;
            }
        }

        // Find description from possible fields
        for (const field of possibleDescriptionFields) {
            if (product[field] && product[field].toString().trim() !== '') {
                baseData.description = product[field];
                break;
            }
        }

        // Fallback if no title found
        if (!baseData.title) {
            baseData.title = 'Untitled Product';
        }

        // Fallback if no description found
        if (!baseData.description) {
            baseData.description = 'No description available';
        }

        // Get image based on product type - check ALL possible fields
        let productImage = '';

        // Try all possible image fields
        const possibleImageFields = {
            'lifestyle': [
                'image',                    // Most common for new lifestyle API
                'product_images',
                'product_image',
                'images',
                'main_image',
                'cover_image'
            ],
            'education': [
                'image_path',
                'course_image',
                'product_images',
                'image',
                'product_image'
            ],
            'essential': [
                'product_images',
                'image',
                'product_image',
                'images'  // Added images field
            ],
            'nonEssential': [
                'product_images',
                'image',
                'product_image',
                'images'  // Added images field
            ]
        };

        // Get the right field list based on category
        const imageFields = possibleImageFields[category] || possibleImageFields['essential'];

        for (const field of imageFields) {
            if (product[field] && product[field].toString().trim() !== '') {
                productImage = product[field];
                console.log(`Found image in field "${field}" for ${category}:`, productImage);
                break;
            }
        }

        // For lifestyle products
        if (category === 'lifestyle') {
            baseData.productImage = productImage;
            
            // For lifestyle, check multiple possible rate fields
            baseData.adultRate = product.adult_rate || product.default_rate || product.adultRate || 0;
            baseData.childRate = product.child_rate || product.childRate || 0;
            baseData.packageRate = product.package_rate || product.packageRate || 0;
            baseData.productcurrency = product.currency || 'USD';
            baseData.rating = product.rating || 0;
            
            // Add provider information if available
            if (product.provider) {
                baseData.provider = product.provider;
            }
        }
        else if (category === 'education') {
            // EDUCATION PRODUCTS
            baseData.productImage = productImage;
            baseData.adultRate = product.adult_course_fee || product.adult_fee || product.adult_rate || 0;
            baseData.childRate = product.child_course_fee || product.child_fee || product.child_rate || 0;
            baseData.productcurrency = product.currency || 'USD';
            baseData.rating = product.rating || product.average_rating || 0;
        }
        else if (category === 'essential' || category === 'nonEssential') {
            // For essential/non-essential products
            baseData.productImage = productImage;
            baseData.mrp = product.mrp || product.price || 0;
            baseData.productcurrency = product.currency || 'USD';
            baseData.rating = product.rating || 0;

            // Also pass provider for payment methods
            if (product.provider) {
                baseData.provider = product.provider;
            }
        }

        // Log for debugging - MORE DETAILED
        console.log(`${category} product data:`, {
            title: baseData.title,
            description: baseData.description?.substring(0, 50) + '...',
            image: baseData.productImage,
            adultRate: baseData.adultRate,
            childRate: baseData.childRate,
            mrp: baseData.mrp,
            currency: baseData.productcurrency,
            // Log all keys from product for debugging
            productKeys: Object.keys(product)
        });

        return baseData;
    };

    // Toggle sidebar
    const toggleSubFilter = () => {
        setOpenSideBarStatus(!openSideBarStatus);
    };

    // Determine if vendor is verified
    const isVerifiedVendor = vendorInfo.status === 'active' || vendorInfo.email_verified_at || vendorInfo.br_number;

    if (loading) {
        return (
            <CommonLayout parent="Home" title="Vendor Store" subTitle={vendorName}>
                <div className="collection-wrapper p-sm-2">
                    <Container>
                        <Row>
                            {[...Array(8)].map((_, index) => (
                                <Col xl="3" lg="4" sm="6" key={index}>
                                    <ProductSkeleton skelotonType='productBox' />
                                </Col>
                            ))}
                        </Row>
                    </Container>
                </div>
            </CommonLayout>
        );
    }

    return (
        <>
            <Head>
                <title>Aahaas - {vendorName} | More Products</title>
                <meta name="description" content={`Browse all products from ${vendorName} on Aahaas.`} />
            </Head>

            <CommonLayout parent="Home" title="Vendor Store" subTitle={`More Products by ${vendorName}`}>
                <div className="collection-wrapper p-sm-2">
                    <Container>
                        {/* Header Section */}
                        <div className="mb-4">
                            <div className="d-flex align-items-center mb-2">
                                <Button
                                    onClick={handleBack}
                                    className="btn btn-sm btn-outline-secondary me-3"
                                >
                                    <ArrowBackIcon />
                                </Button>
                                <div>
                                    <h1 className="m-0" style={{ fontSize: '1.8rem', fontWeight: '600' }}>
                                        More Products By {vendorName} Supplier
                                    </h1>
                                    <div className="d-flex align-items-center mt-1">
                                        {isVerifiedVendor && (
                                            <Badge
                                                color="success"
                                                className="me-2"
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '3px 8px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                <StoreIcon style={{ fontSize: 14, marginRight: 4 }} />
                                                Verified Vendor
                                            </Badge>
                                        )}
                                        <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                            Browse all products from this supplier
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Categories Tabs */}
                        <div className="mb-4">
                            <div className="d-flex flex-wrap gap-3 mb-3">
                                {mainCategories.map((category) => (
                                    <Button
                                        key={category.id}
                                        color={activeTab === category.id ? "primary" : "light"}
                                        className={`d-flex align-items-center px-4 py-3 rounded-pill ${activeTab === category.id ? 'shadow-sm' : ''}`}
                                        onClick={() => {
                                            setActiveTab(category.id);
                                            setSelectedSubCategories([]);
                                        }}
                                        style={{
                                            border: activeTab === category.id ? 'none' : '1px solid #dee2e6',
                                            backgroundColor: activeTab === category.id ? '#007bff' : 'white',
                                            color: activeTab === category.id ? 'white' : '#495057',
                                            minWidth: '140px',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <span style={{
                                            color: activeTab === category.id ? 'white' : category.color,
                                            marginRight: '8px'
                                        }}>
                                            {category.icon}
                                        </span>
                                        <span style={{ fontWeight: '500' }}>
                                            {category.label}
                                        </span>
                                        <Badge
                                            color={activeTab === category.id ? "light" : "secondary"}
                                            className="ms-2"
                                            style={{
                                                color: activeTab === category.id ? '#007bff' : 'white',
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                        </Badge>
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar Filter */}
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
                                    <div className="collection-mobile-back" onClick={toggleSubFilter}>
                                        <span className="filter-back">
                                            <i className="fa fa-angle-left"></i> back
                                        </span>
                                    </div>
                                </div>
                            </Col>

                            <Col
                                className="collection-content"
                                sm='12'
                                md='12'
                                lg={openSideBarStatus ? "9" : "12"}
                                style={{ transition: "all 0.3s ease" }}
                            >
                                <div className="page-main-content">
                                    <Row>
                                        <Col sm="12">
                                            <div className="collection-product-wrapper mt-0 mt-lg-2" style={{ paddingLeft: openSideBarStatus ? '10px' : '20px' }}>
                                                {/* Filter Button and Subcategories */}
                                                <div className="product-filter-content d-flex flex-column flex-lg-row flex-md-row border-bottom pb-2 gap-2">
                                                    {/* Subcategories Section */}
                                                    {!loading && subCategories.length > 0 && (
                                                        <>
                                                            <div
                                                                ref={subcategoriesWrapperRef}
                                                                className="subcategories-horizontal-wrapper w-100 sticky-subcategories"
                                                                style={{
                                                                    position: 'sticky',
                                                                    top: '70px', // Adjust based on your header height (70px is typical)
                                                                    zIndex: 100,
                                                                    backgroundColor: 'white',
                                                                    padding: '10px 0',
                                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                                                    borderBottom: '1px solid #e0e0e0',
                                                                    margin: '0',
                                                                    width: '100%',
                                                                    boxSizing: 'border-box'
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
                                                                    {/* All Categories Button */}
                                                                    <button
                                                                        className={`subcategory-chip ${selectedSubCategories.length === 0 ? 'active' : ''}`}
                                                                        onClick={() => setSelectedSubCategories([])}
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

                                                                    {/* Subcategory Buttons */}
                                                                    {subCategories.map((category, index) => (
                                                                        <button
                                                                            key={category.id}
                                                                            className={`subcategory-chip ${selectedSubCategories.includes(category.id) ? 'active' : ''}`}
                                                                            onClick={() => handleCategoryChange(category.id)}
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
                                                                        >
                                                                            {category.submaincat_type}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Spacer for sticky subcategories */}
                                                            <div 
                                                                ref={spacerRef} 
                                                                style={{ 
                                                                    height: `${subcategoriesHeight}px`, 
                                                                    width: '100%',
                                                                    display: 'block'
                                                                }}
                                                            ></div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Divider */}
                                                <hr className="my-4" />

                                                {/* Products Grid */}
                                                {getDisplayProducts().length > 0 ? (
                                                    <Row>
                                                        {getDisplayProducts().map((product, index) => {
                                                            const productData = getProductData(product, activeTab);

                                                            return (
                                                                <Col xl="3" lg="4" sm="6" key={index} className="mb-4">
                                                                    <ProductItem
                                                                        {...productData}
                                                                    />
                                                                </Col>
                                                            );
                                                        })}
                                                    </Row>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <div className="mb-4">
                                                            <StoreIcon style={{ fontSize: 64, color: '#dee2e6' }} />
                                                        </div>
                                                        <h4 className="mb-3" style={{ color: '#6c757d' }}>
                                                            No {mainCategories.find(cat => cat.id === activeTab)?.label?.toLowerCase()} products found
                                                            {selectedSubCategories.length > 0 && (
                                                                <span className="text-muted">
                                                                    {' '}in {subCategories.find(cat => cat.id === selectedSubCategories[0])?.submaincat_type}
                                                                </span>
                                                            )}
                                                        </h4>
                                                        <p className="text-muted mb-4" style={{ fontSize: '1rem' }}>
                                                            This supplier doesn't have any {mainCategories.find(cat => cat.id === activeTab)?.label?.toLowerCase()} products listed yet.
                                                        </p>

                                                        <div className="mt-4">
                                                            <Button
                                                                color="outline-secondary"
                                                                className="px-4 py-2"
                                                                onClick={handleBack}
                                                                style={{ fontSize: '0.9rem' }}
                                                            >
                                                                <ArrowBackIcon className="me-2" style={{ fontSize: 18 }} />
                                                                Back to Product
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Debug Info */}
                                                {process.env.NODE_ENV === 'development' && (
                                                    <div className="mt-4 p-3 border rounded bg-light">
                                                        <h6>Debug Information:</h6>
                                                        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                                                            {JSON.stringify({
                                                                vendorId,
                                                                vendorName,
                                                                activeTab,
                                                                subCategoriesCount: subCategories.length,
                                                                selectedSubCategories,
                                                                filteredProductsCount: getDisplayProducts().length,
                                                                totalProductsCount: getActiveProducts().length,
                                                                productCounts: {
                                                                    lifestyle: allProducts.lifestyle.length,
                                                                    education: allProducts.education.length,
                                                                    essential: allProducts.essential.length,
                                                                    nonEssential: allProducts.nonEssential.length
                                                                },
                                                                isVerifiedVendor,
                                                                sampleProduct: getDisplayProducts()[0] ? {
                                                                    id: getDisplayProducts()[0].id,
                                                                    title: getDisplayProducts()[0].title || getDisplayProducts()[0].listing_title,
                                                                    imageFields: {
                                                                        product_images: getDisplayProducts()[0].product_images,
                                                                        image: getDisplayProducts()[0].image,
                                                                        product_image: getDisplayProducts()[0].product_image
                                                                    }
                                                                } : 'No products'
                                                            }, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

 <style jsx>{`
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
                    
                    .sticky-subcategories {
                        animation: fadeInDown 0.3s ease-in-out;
                    }
                    
                    @keyframes fadeInDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .subcategory-chip:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    }
                `}</style>
            </CommonLayout>
        </>
    );
};

export default VendorProductsPage;