
//new file

import React, { useEffect, useState, useContext, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../components/NewHomeComponents/home.module.css';
import axios from "axios";
import moment from "moment/moment";
import cookie from 'cookie';
import { AppContext } from '../pages/_app';
import EnhancedShoesHeader from '../components/common/header-two';
import LocationModal from '../components/common/LocationModal';
import Footer from './layouts/NewMasterFooter';
import { getLifesyleproducts, getFeaturedLifestyleProducts } from '../AxiosCalls/LifestyleServices/lifestyleServices';
import { getAllEducationProducts } from '../AxiosCalls/EducationServices/educationServices';
import { getHotelDataUpdated } from '../AxiosCalls/HotelServices/hotelServices';
import { getProductDetailsEssentialNonEssential } from '../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices';
import { getUserDetails } from '../AxiosCalls/UserServices/userServices';
import FeaturedProducts from '../components/NewHomeComponents/FeaturedProducts';
import BestSellerProducts from '../components/NewHomeComponents/BestSellerProducts';
import DemographicGameScreen from '../components/Persona/PersonaQuestion';
import NewBanners from './layouts/NewBanners';
import lifestyle from '../public/assets/images/newImages/lifestyle2.jpg';
import hotelImage from '../public/assets/images/newImages/hotel.jpg';
import educationImage from '../public/assets/images/newImages/education.jpg';
import essentialImage from '../public/assets/images/newImages/essensials.png';
import flight from '../public/assets/images/newImages/flight.jpg';
import mobileImageOne from '../public/assets/images/newImages/web _promo_potrait.jpg';
import mobileImageTwo from '../public/assets/images/newImages/web_promo_landscape_two.jpg';
import LifestyleProductsComponent from './shop/lifestyle/lifestyleComponent';

// Promotional grid background images
import aiPersonalizationImage from '../public/assets/images/newImages/ai.jpg';
import deliveryImage from '../public/assets/images/newImages/widerange.jpg';
import cartSharingImage from '../public/assets/images/newImages/cartsharing.jpg';
import promoImage from '../public/assets/images/newImages/lastminutes.jpg'
import MasterFooter from './layouts/MasterFooter';

axios.defaults.baseURL = "https://dev-gateway.aahaas.com/api";
axios.defaults.data = 'https://dev-gateway.aahaas.com/';

// axios.defaults.baseURL = "https://gateway.aahaas.com/api"; 
// axios.defaults.data = 'https://gateway.aahaas.com/';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

const useGeolocation = (setHotelSearchCustomerData, hotelSearchCustomerData) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }


    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        console.log('Current position:', latitude, longitude);

        try {
          // Use Google Maps Geocoding API (similar to handleOnGoogleLocationChange)
          // You'll need to replace YOUR_API_KEY with your actual Google Maps API key
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAJIZAqzQ12tjNY13kN3Flah4o-XNeeeDQ`
          );

          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const result = data.results[0];

            // Extract city and country similar to handleOnGoogleLocationChange logic
            let city = '';
            let country = '';

            for (let i = 0; i < result.address_components.length; i++) {
              const component = result.address_components[i];

              if (component.types.includes("locality") ||
                component.types.includes("administrative_area_level_2") ||
                component.types.includes("administrative_area_level_3")) {
                city = component.short_name;
                break;
              }
            }

            // Get country
            for (let i = 0; i < result.address_components.length; i++) {
              const component = result.address_components[i];
              if (component.types.includes("country")) {
                country = component.long_name;
                break;
              }
            }

            const locationData = {
              latitude,
              longitude,
              address_full: result.formatted_address,
              result: result
            };

            setLocation(locationData);

            // Update hotelSearchCustomerData in the same format as handleOnGoogleLocationChange
            setHotelSearchCustomerData({
              ...hotelSearchCustomerData,
              City: city,
              Country: country,
              dataSet: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                locationDescription: result.formatted_address,
                ...result,
              })
            });

            // Save to cookie for persistence
            document.cookie = `userLastLocation=${JSON.stringify(locationData)}; path=/; max-age=86400`;
          }
        } catch (geocodeError) {
          console.error('Geocoding error:', geocodeError);

          // Fallback: use BigDataCloud API (your original approach)
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();

            const locationData = {
              latitude,
              longitude,
              address_full: data.city ? `${data.city}, ${data.countryName}` : 'Current Location',
              address_components: data
            };

            setLocation(locationData);

            // Update hotelSearchCustomerData with available data
            setHotelSearchCustomerData({
              ...hotelSearchCustomerData,
              City: data.city || '',
              Country: data.countryName || '',
              dataSet: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                locationDescription: data.city ? `${data.city}, ${data.countryName}` : 'Current Location',
                bigDataCloudResult: data,
              })
            });

            document.cookie = `userLastLocation=${JSON.stringify(locationData)}; path=/; max-age=86400`;
          } catch (fallbackError) {
            console.error('Fallback geocoding error:', fallbackError);

            // Last resort: just use coordinates
            const locationData = {
              latitude,
              longitude,
              address_full: 'Current Location'
            };

            setLocation(locationData);
            setHotelSearchCustomerData({
              ...hotelSearchCustomerData,
              City: '',
              Country: '',
              dataSet: JSON.stringify({
                latitude: latitude,
                longitude: longitude,
                locationDescription: 'Current Location',
              })
            });
          }
        }

        setLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Cache for 1 minute
      }
    );
  }, [setHotelSearchCustomerData, hotelSearchCustomerData]);

  return { location, error, loading };
};

export async function getServerSideProps(context) {
  const { req } = context;
  console.log("cotext 1233333 ", req.headers.cookie);
  // Default location (Colombo, Sri Lanka)
  let baseLocation = {
    latitude: '6.9271',
    longtitude: '79.8612',
    address_full: 'Colombo, Sri Lanka'
  };

  let baseLocation2 = {
    latitude: '6.9271',
    longtitude: '79.8612',
    address_full: 'Colombo, Sri Lanka'
  };

  // Check if user has saved location in cookies
  if (req.headers.cookie) {
    const cookies = cookie.parse(req.headers.cookie);
    try {
      if (cookies.userLastLocation) {
        baseLocation = JSON.parse(cookies.userLastLocation);
        const userLastLocation = JSON.parse(cookies.userLastLocation);
        baseLocation2 = {
          latitude: userLastLocation.latitude.toString(),
          longitude: userLastLocation.longtitude.toString(),
          locationDescription: userLastLocation.address_full,
          address_components: userLastLocation.address_components
        };
        console.log("baseLocation 123333 ", baseLocation);
      }
    } catch (error) {
      console.error('Failed to parse userLastLocation cookie:', error);
    }
  }
  console.log("baseLocation ", baseLocation);

  const data = {
    "lifestyleHeading": "Lifestyle Adventures",
    "lifestyleParagraph": "Experience the essence of travel with Aahaas' Lifestyle offerings, designed to enrich your journey. Discover a wide array of activities, from thrilling adventures to immersive cultural experiences, paired with exquisite dining and wellness options.",
    "educationHeading": "Learn and Explore!",
    "educationParagraph": "At Aahaas, our Education category empowers travelers to learn while exploring. Engage in a variety of educational activities, from guided tours of historical sites to interactive workshops that ignite your curiosity.",
    "essentialsHeading": "Travel Essentials",
    "essentialsParagraph": "At Aahaas, we understand that every journey requires the right essentials to keep you comfortable and safe. Our collection includes everything from toiletries and personal care items to health services and emergency supplies.",
    "nonEssentialsHeading": "Exclusive Non-essential Finds",
    "nonEssentialsParagraph": "Explore our range of non-essential items, designed to add comfort, style, and convenience to your everyday life. Perfect for treating yourself or finding that special gift, these products enhance your lifestyle without being a necessity.",
    "hotelsHeading": "Discover Perfect Getaways",
    "hotelsParagraph": "Discover a variety of hotels with Aahaas, whether you're looking for luxurious retreats or affordable stays. Our wide range of options ensures you can rest in comfort after a day of exploration. Book your perfect accommodation and start your journey in style.",
    "featuredHeding": "Featured products",
    "featuredParagraph": "Don't miss out on these limited-time offerings! Our featured products bring the perfect blend of functionality and style, available for a short period to add a special touch to your travels.",
  }

  const footerContent = {
    title: 'Are you really holidaying on your holiday ?',
    paragraph: 'At Aahaas, every trip is uniquely yours. Easily customize flights, hotels, and activities with just a few taps, and update plans anytime. No stress, just the perfect holiday for you and your loved ones. Ready for your next adventure? Let Aahaas handle the rest !',
    note: 'Uniquely Yours !',
    officeAddress: 'One Galle Face Tower, 2208, 1A Centre Road, Colombo 002, Sri Lanka',
    contactNo: 'Call Us: +94 11 235 2400',
    mailAddress: 'info@aahaas.com'
  }

  let products = {
    lifestyle: {
      lifestyleData: [],
      productsType: 'lifestyle',
      lifestyleDataStatus: true,
    },
    featuredLifestyle: {
      lifestyleData: [],
      productsType: 'lifestyle',
      lifestyleDataStatus: true,
    },
    hotels: {
      hotelData: [],
      productsType: 'hotels',
      hotelDataStatus: true,
    },
    education: {
      educationData: [],
      productsType: 'education',
      dataStatus: true,
    },
    essential: {
      essentialData: [],
      productsType: 'essential',
      dataStatus: true,
    },
    nonEssential: {
      nonessentialData: [],
      productsType: 'nonessential',
      dataStatus: true,
    },
  };

  let featuredProducts = {
    lifestyle: {
      lifestyleData: [],
      productsType: 'lifestyle',
      lifestyleDataStatus: true,
    },
    featuredLifestyle: {
      lifestyleData: [],
      productsType: 'lifestyle',
      lifestyleDataStatus: true,
    },
    hotels: {
      hotelData: [],
      productsType: 'hotels',
      hotelDataStatus: true,
    },
    education: {
      educationData: [],
      productsType: 'education',
      dataStatus: true,
    },
    essential: {
      essentialData: [],
      productsType: 'essential',
      dataStatus: true,
    },
    nonEssential: {
      nonessentialData: [],
      productsType: 'nonessential',
      dataStatus: true,
    },
  };

  try {
    const nextWeekDate = moment().add(7, 'days').format('DD/MM/YYYY');
    const nextWeekDateCheckout = moment().add(8, 'days').format('DD/MM/YYYY');

    let hotelSearchCustomerData = {
      CheckInDate: nextWeekDate,
      CheckOutDate: nextWeekDateCheckout,
      NoOfNights: 1,
      NoOfRooms: 1,
      NoOfAdults: 1,
      NoOfChild: 0,
      City: baseLocation?.address_full,
      City: baseLocation?.address_full,
      offset: 0,
      length: 20,
      dataSet: JSON.stringify(baseLocation2),
      StarRate: 0,
      RoomRequest: [{
        indexValue: 0,
        roomType: "Single",
        NoOfAdults: 1,
        NoOfChild: 0,
        ChildAge: []
      }]
    };



    // Fetch all products with current location
    // const lifestyleResponse = await getLifesyleproducts(0, 0, 0, baseLocation.latitude, baseLocation.longtitude, 23, 15, 0, '');
    // console.log("lifestyleResponse chamoddddddddddddddd ", lifestyleResponse);
    // if (lifestyleResponse === '(Internal Server Error)' || lifestyleResponse === 'Something went wrong !') {
    //   products.lifestyle.lifestyleData = [];
    //   featuredProducts.lifestyle.lifestyleData = [];
    // } else {
    //   products.lifestyle.lifestyleData = lifestyleResponse;
    //   // featuredProducts.lifestyle.lifestyleData = lifestyleResponse;
    // }

    console.log("baseLocation2", baseLocation2);
    const dataSet2 = {
      latitude: baseLocation2.latitude,
      longitude: baseLocation2.longitude,
      radius: 22,
      isCountry: false,
      sortArray: "",
      dataSet: JSON.stringify(baseLocation2),
      // provider: provider,
      page: 1,
      pageSize: 50,
      userId: 624,
      personalized: null,
    };
    // console.log("LifestyleResponse 9999", dataSet2);
    const lifestyleResponse = await getFeaturedLifestyleProducts(dataSet2);
    console.log("LifestyleResponse 9999", lifestyleResponse);
    products.lifestyle.lifestyleData = lifestyleResponse;
    if (lifestyleResponse === '(Internal Server Error)' || lifestyleResponse === 'Something went wrong !') {
      products.lifestyle.lifestyleData = [];
    } else {
      console.log("LifestyleResponse 8888", lifestyleResponse.length);
      // products.lifestyle.lifestyleData = lifestyleResponse;
      featuredProducts.lifestyle.lifestyleData = lifestyleResponse;
      // featuredProducts.featuredLifestyle.lifestyleData = lifestyleResponse;
    }

    const educationResponse = await getAllEducationProducts(5, 0, 0, 0, 15, 0, '', baseLocation.latitude, baseLocation.longtitude,0);
    if (educationResponse === '(Internal Server Error)' || educationResponse === 'Something went wrong !') {
      products.education.educationData = [];
      featuredProducts.education.educationData = [];
    } else {
      products.education.educationData = educationResponse?.educationListings;
      featuredProducts.education.educationData = educationResponse?.educationListings;
    }

    const hotelResponse = await getHotelDataUpdated(hotelSearchCustomerData, 0);
    if (hotelResponse === '(Internal Server Error)' || hotelResponse === 'Something went wrong !') {
      products.hotels.hotelData = [];
      featuredProducts.hotels.hotelData = [];
    } else {
      products.hotels.hotelData = hotelResponse;
      featuredProducts.hotels.hotelData = hotelResponse;
    }

    const essentialResponse = await getProductDetailsEssentialNonEssential(1, 0, 0, 0, 15, 0, '', baseLocation2);
    if (essentialResponse === '(Internal Server Error)' || essentialResponse === 'Something went wrong !') {
      products.essential.essentialData = [];
      featuredProducts.essential.essentialData = [];
    } else {
      products.essential.essentialData = essentialResponse?.discount_data;
      featuredProducts.essential.essentialData = essentialResponse?.discount_data;
    }

    const nonEssentialResponse = await getProductDetailsEssentialNonEssential(2, 0, 0, 0, 15, 0, '', baseLocation2);
    if (nonEssentialResponse === '(Internal Server Error)' || nonEssentialResponse === 'Something went wrong !') {
      products.nonEssential.nonessentialData = [];
      featuredProducts.nonEssential.nonessentialData = [];
    } else {
      products.nonEssential.nonessentialData = nonEssentialResponse?.discount_data;
      featuredProducts.nonEssential.nonessentialData = nonEssentialResponse?.discount_data;
    }

    const dataSet = {
      latitude: baseLocation2.latitude,
      longitude: baseLocation2.longtitude,
      radius: 22,
      isCountry: false,
      sortArray: "",
      dataSet: JSON.stringify(baseLocation),
      // provider: provider,
      page: 0,
      pageSize: 50,
      userId: 624,
      personalized: "staticPersona",
    };

    const FeaturedLifestyleResponse = await getFeaturedLifestyleProducts(dataSet);
    // console.log("FeaturedLifestyleResponse 33333", FeaturedLifestyleResponse);
    // if (FeaturedLifestyleResponse === '(Internal Server Error)' || FeaturedLifestyleResponse === 'Something went wrong !') {
    //   products.featuredLifestyle.lifestyleData = [];
    //   featuredProducts.featuredLifestyle.lifestyleData = [];
    // } else {
    //   featuredProducts.lifestyle.lifestyleData = FeaturedLifestyleResponse;
    //   featuredProducts.featuredLifestyle.lifestyleData = FeaturedLifestyleResponse;
    // }

  } catch (error) {
    console.error('Error fetching product data:', error);
  }

  return {
    props: {
      footerContent: footerContent,
      contentData: data,
      productData: products,
      featuredProductsData: featuredProducts,
      initialLocation: baseLocation, // Pass initial location to component
    },
  };
}


const ShoesMarket = ({ contentData, productData, featuredProductsData, footerContent, initialLocation }) => {
  const { userId, baseLocation } = useContext(AppContext);
  const router = useRouter();
  const iframeRef = useRef(null)

  console.log("productData 123 ", productData);
  console.log("featuredProductsData 123", featuredProductsData);

  const [activeFeaturedCategory, setActiveFeaturedCategory] = useState('lifestyle');
  const [activeBestSellerCategory, setActiveBestSellerCategory] = useState('lifestyle');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [profileDataIncomplete, setProfileDataIncomplete] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [homePageSearchQuery, setHomePageSearchQuery] = useState('');
  
  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  // Handle search from header
  const handleHeaderSearch = (searchQuery) => {
    console.log("Home page search query:", searchQuery);
    setHomePageSearchQuery(searchQuery);
  };

  // Category mapping
  const categories = [
    { key: 'lifestyle', label: 'Lifestyle', data: 'lifestyleData' },
    { key: 'hotels', label: 'Hotels', data: 'hotelData' },
    { key: 'education', label: 'Education', data: 'educationData' },
    { key: 'essential', label: 'Essential', data: 'essentialData' },
    { key: 'nonEssential', label: 'Non-Essential', data: 'nonessentialData' }
  ];


  // Get featured products for active category
  const getFeaturedProducts = () => {
    const categoryData = featuredProductsData[activeFeaturedCategory];
    if (!categoryData) return [];

    const dataKey = categories.find(cat => cat.key === activeFeaturedCategory)?.data;
    return categoryData[dataKey] || [];
  };

  // Get best seller products for active category
  const getBestSellerProducts = () => {
    const categoryData = productData[activeBestSellerCategory];
    if (!categoryData) return [];

    const dataKey = categories.find(cat => cat.key === activeBestSellerCategory)?.data;
    return categoryData[dataKey] || [];
  };

  // Format product data for display
  const formatProductForDisplay = (product, category) => {
    console.log("Formatting product for display:", product, category);
    switch (category) {
      case 'lifestyle':
        console.log("lifestyle product ", product);
        return {
          id: product.id,
          name: product.lifestyle_name,
          price: parseFloat(product.default_rate || product.adult_rate || 0),
          originalPrice: null,
          discount: product.discount,
          image: product.image?.split(',')[0] || product.image,
          currency: product.currency,
          product: product,
          productstype: 'lifestyle',
        };
      case 'hotels':
        return {
          id: product.ResultIndex,
          name: product.HotelName,
          price: parseFloat(product.TotalRate),
          originalPrice: null,
          discount: product.discount,
          image: product.HotelPicture?.split(',')[0] || '/api/placeholder/300/300',
          currency: product.Currency,
          product: product,
          productstype: 'hotels',
        };
      case 'education':
        return {
          id: product.education_id,
          name: product.course_name,
          price: parseFloat(product.adult_course_fee),
          originalPrice: parseFloat(product.actual_adult_course_fee),
          discount: product.discount,
          image: product.image_path?.split(',')[0] || product.image_path,
          currency: product.currency,
          product: product,
          productstype: 'education',
        };
      case 'essential':
        return {
          id: product.id,
          name: product.listing_title,
          price: parseFloat(product.selling_rate),
          originalPrice: parseFloat(product.mrp),
          discount: product.discount,
          image: product.product_images?.split(',')[0],
          currency: product.currency,
          product: product,
          productstype: 'essential',
        };
      case 'nonEssential':
        return {
          id: product.id,
          name: product.listing_title,
          price: parseFloat(product.selling_rate),
          originalPrice: parseFloat(product.mrp),
          discount: product.discount,
          image: product.product_images?.split(',')[0],
          currency: product.currency,
          product: product,
          productstype: 'nonEssential',
        };
      default:
        return product;
    }
  };

  const featuredProducts = getFeaturedProducts().map(product =>
    formatProductForDisplay(product, activeFeaturedCategory)
  ).slice(1, 6); // Limit to 4 products

  const bestSellerProducts = getBestSellerProducts().map(product =>
    formatProductForDisplay(product, activeBestSellerCategory)
  ).slice(1, 100); // Limit to 100 products

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(featuredProducts.length / 4));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(featuredProducts.length / 4)) % Math.ceil(featuredProducts.length / 4));
  };

  // Navigation handlers for category cards
  const handleCategoryClick = (category) => {
    switch (category) {
      case 'lifestyle':
        router.push('/shop/lifestyle');
        break;
      case 'education':
        router.push('/shop/education');
        break;
      case 'essential':
        router.push('/shop/essential');
        break;
      case 'flights':
        router.push('/shop/newFlights');
        break;
      case 'hotels':
        router.push('/shop/hotels');
        break;
      default:
        break;
    }
  };

  // User profile and persona functions
  const handleUserData = async () => {
    try {
      const userDetails = await getUserDetails(userId);

      if (!userDetails || userDetails.customer_id === "AHS_Guest") {
        return false;
      } else {
        const isNationalityEmpty = !userDetails.customer_nationality ||
          userDetails.customer_nationality === "-" ||
          userDetails.customer_nationality.trim() === "";

        const isAddressEmpty = !userDetails.customer_address ||
          userDetails.customer_address === "-" ||
          userDetails.customer_address.trim() === "";

        return isNationalityEmpty || isAddressEmpty;
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return false;
    }
  };

  const shouldShowModal = () => {
    const lastClosedTime = localStorage.getItem('profileModalLastClosed');

    if (!lastClosedTime) {
      return true; // Show modal if never closed before
    }

    const lastClosedTimestamp = parseInt(lastClosedTime);
    const currentTime = Date.now();
    const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

    return (currentTime - lastClosedTimestamp) >= sixHoursInMs;
  };

  const checkUserPersona = async () => {
    try {
      const response = await axios.post(
        "/personalization/demographic-game/checkUser",
        {
          user_id: userId,
        }
      );

      if (response.data.status === "success") {
        setModalVisible(response.data.showPersona);
      } else {
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error checking user persona:", error);
      setModalVisible(true); // Continue even if error
    }
  };

  const handleUserIncompleteProfile = () => {
    localStorage.setItem('profileModalLastClosed', Date.now().toString());
    setProfileDataIncomplete(false);
    window.location.href = 'page/account/profile?page=myProfile-page';
  };

  const handleModalClose = () => {
    localStorage.setItem('profileModalLastClosed', Date.now().toString());
    setProfileDataIncomplete(false);
  };

  const handleComplete = () => {
    setModalVisible(!modalVisible);
  };

  // Check user profile and persona on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (userId && userId !== 'AHS_Guest') {
        const isProfileIncomplete = await handleUserData();

        // Only show modal if profile is incomplete AND 6 hours have passed since last close
        if (isProfileIncomplete && shouldShowModal()) {
          setProfileDataIncomplete(true);
        }

        console.log("Profile Data Incomplete:", isProfileIncomplete);
        console.log("Should Show Modal:", shouldShowModal());

        // Check persona
        checkUserPersona();
      }
    };

    fetchData();
  }, [userId]);

useEffect(() => {
  if (profileDataIncomplete && userId) {
    // Save scroll position
    const scrollY = window.scrollY;

    // Lock scrolling completely (body + html)
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';

    // Prevent touch and wheel scroll
    const preventScroll = (e) => e.preventDefault();
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      // Restore
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';

      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }
}, [profileDataIncomplete, userId]);

  // Prevent scroll when persona modal is open
  // useEffect(() => {
  //   if (modalVisible) {
  //     // Store current scroll position
  //     const scrollY = window.scrollY;

  //     // Prevent scrolling
  //     document.body.style.position = 'fixed';
  //     document.body.style.top = `-${scrollY}px`;
  //     document.body.style.width = '100%';
  //     document.documentElement.style.overflow = 'hidden';

  //     return () => {
  //       // Restore scroll when modal closes
  //       document.body.style.position = '';
  //       document.body.style.top = '';
  //       document.body.style.width = '';
  //       document.documentElement.style.overflow = '';

  //       // Restore scroll position
  //       window.scrollTo(0, scrollY);
  //     };
  //   }
  // }, [modalVisible]);

  const [counts, setCounts] = useState({});
  useEffect(() => {
    getCounts();
  }, []);

  const getCounts = async () => {
    try {
      const response = await axios.get(
        "/getDetailCount",
      );

      console.log("getCounts response ", response);

      if (response.data.status === "success") {
        setCounts(response.data);
      } else {
        setCounts({
          "user_count": 12818,
          "vendor_count": 1588,
          "country_count": 76
        });
      }
    } catch (error) {
      console.error("Error checking user persona:", error);
    }
  };

  const [iframeShowing, setIframeShowing] = useState(true)


  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data?.type) {
        if (event.data.type === "openLink") {
          setIframeShowing(false)
          // window.location.href = event.data.url
        } else {
          window.location.href = event.data.url
        }
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  return (
    <div className={styles.shoesMarket}>
      <div style={{ top: 0, width: '100%', zIndex: 1000 }}>
        <EnhancedShoesHeader
          onLocationClick={openLocationModal}
          onSearch={handleHeaderSearch}
          screen={"Home"}
        />
      </div>

      {/* Search Bar Section */}
      

      {/* Hero Section - Using NewBanners Component */}
      {/* <NewBanners /> */}

      {/* Categories Grid */}
      {/* <section style={{ paddingTop: '40px' }}>
        <div className={styles.container}>
          <div className={styles.categoryCards}>
            <div
              className={`${styles.categoryCard} ${styles.women}`}
              onClick={() => handleCategoryClick('lifestyle')}
              style={{
                height: '566px',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
                cursor: 'pointer'
              }}
            >
              <div className={styles.categoryContent} style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${lifestyle.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }}></div>
                <h2 style={{
                  margin: 0,
                  color: "white",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative',
                  padding: '0 1rem',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>LIFESTYLE</h2>
              </div>
            </div>
            <div
              className={`${styles.categoryCard} ${styles.women}`}
              onClick={() => handleCategoryClick('education')}
              style={{
                height: '273px',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
                cursor: 'pointer'
              }}
            >
              <div className={styles.categoryContent} style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${educationImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }}></div>
                <h2 style={{
                  margin: 0,
                  color: "white",
                  fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative',
                  padding: '0 1rem',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>EDUCATION</h2>
              </div>
            </div>
            <div
              className={`${styles.categoryCard} ${styles.babies}`}
              onClick={() => handleCategoryClick('essential')}
              style={{
                height: '273px',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
                cursor: 'pointer'
              }}
            >
              <div className={styles.categoryContent} style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${essentialImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }}></div>
                <h2 style={{
                  margin: 0,
                  color: "white",
                  fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative',
                  padding: '0 1rem',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>ESSENTIALS</h2>
              </div>
            </div>
            <div
              className={`${styles.categoryCard} ${styles.men}`}
              onClick={() => handleCategoryClick('flights')}
              style={{
                height: '277px',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
                cursor: 'pointer'
              }}
            >
              <div className={styles.categoryContent} style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${flight.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }}></div>
                <h2 style={{
                  margin: 0,
                  color: "white",
                  fontSize: 'clamp(1.2rem, 3.5vw, 2rem)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative',
                  padding: '0 1rem',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>FLIGHTS</h2>
              </div>
            </div>
            <div
              className={`${styles.categoryCard} ${styles.kids}`}
              onClick={() => handleCategoryClick('hotels')}
              style={{
                height: '566px',
                position: 'relative',
                overflow: 'hidden',
                padding: 0,
                margin: 0,
                cursor: 'pointer'
              }}
            >
              <div className={styles.categoryContent} style={{
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${hotelImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                margin: 0,
                padding: 0
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  zIndex: 1
                }}></div>
                <h2 style={{
                  margin: 0,
                  color: "white",
                  fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                  fontWeight: 'bold',
                  zIndex: 2,
                  position: 'relative',
                  padding: '0 1rem',
                  wordBreak: 'break-word',
                  textAlign: 'center',
                  lineHeight: '1.2'
                }}>HOTELS</h2>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Featured Products */}
      {/* <FeaturedProducts
        categories={categories}
        activeFeaturedCategory={activeFeaturedCategory}
        setActiveFeaturedCategory={setActiveFeaturedCategory}
        featuredProducts={featuredProducts}
        productData={productData}
      /> */}

      {/* <section>
        <div className={styles.container2}>
          <div className={styles.mobileDownloadBanner}>
            <div className={styles.mobileDownloadContent}>
              <h6 className={styles.mobileDownloadText}>
                Download our app today! Don't miss out on our offers.
              </h6>
            </div>

          </div>
          <div className={styles.mobileDownloadCards}>
            <div className={styles.mobileCard} style={{
              position: 'relative',
              overflow: 'hidden'
            }}>
              <img
                src={mobileImageOne.src || mobileImageOne}
                alt="Mobile Promo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
              <div className={styles.mobileCardPrice} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}>

              </div>
            </div>

            <div className={styles.mobileCard} style={{
              position: 'relative',
              overflow: 'hidden',
              borderLeft: '5px solid #ffffffff'
            }}>
              <img
                src={mobileImageTwo.src || mobileImageTwo}
                alt="Mobile Promo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
              />
              <div className={styles.mobileCardPrice} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2
              }}>

              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Bestsellers */}
      {/* <BestSellerProducts
        categories={categories}
        activeBestSellerCategory={activeBestSellerCategory}
        setActiveBestSellerCategory={setActiveBestSellerCategory}
        bestSellerProducts={bestSellerProducts}
        productData={productData}
      /> */}
      <LifestyleProductsComponent searchQuery={homePageSearchQuery} />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
      />
      <section className={styles.container}>
        <div>
          <div className={styles.promotionalGrid}>
            {/* Large Women's Section - spans 2 rows */}
            <div
              className={`${styles.promoCard} ${styles.womenCard}`}
              style={{
                backgroundImage: `url(${aiPersonalizationImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* <div className={styles.promoContent}>
                <h4 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  AI base Personalization
                </h4>
              </div> */}
            </div>

            {/* YouTube Banner */}
            <div
              className={`${styles.promoCard} ${styles.youtubeCard}`}
              style={{
                backgroundImage: `url(${deliveryImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* <div className={styles.promoContent}>
                <h4 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                  Preferred Delivery
                </h4>
              </div> */}
            </div>

            {/* Track Shoes */}
            <div
              className={`${styles.promoCard} ${styles.trackCard}`}
              style={{
                backgroundImage: `url(${promoImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* <h4 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                Special Promotions
              </h4> */}
            </div>

            <div
              className={`${styles.promoCard} ${styles.nikeCard}`}
              style={{
                backgroundImage: `url(${cartSharingImage.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* <h4 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                Cart sharing
              </h4> */}
            </div>

          </div>
        </div>
      </section>

      <section className={styles.container4}>
        <div>
          <div className={styles.statsRow} >
            <div className={styles.statBox}>
              {/* <h2 className={styles.statNumber}>16K+</h2> */}
              <h2 className={styles.statNumber}>{counts?.user_count ? counts.user_count.toLocaleString() : 0}</h2>
              <h6 className={styles.statLabel}>Customers</h6>
            </div>
            <div className={styles.statBox}>
              <h2 className={styles.statNumber}>5M+</h2>
              <p className={styles.statLabel}>Products</p>
            </div>
            
            <div className={styles.statBox}>
              {/* <h2 className={styles.statNumber}>76</h2> */}
              <h2 className={styles.statNumber}>{counts?.country_count ? counts.country_count.toLocaleString() : 0}</h2>
              <p className={styles.statLabel}>Destination</p>
            </div>

            <div className={styles.statBox} >
              <h2 className={styles.statNumber}>
                1<span style={{ fontSize: '0.6em', verticalAlign: 'super' }}>st</span>
              </h2>
              <p className={styles.statLabel}>Super App</p>
            </div>
          </div>
        </div>
      </section>

      {/* <section>
          <MasterFooter
        footerClass={`footer-light pt-5`}
        belowSection={"section-b-space mt-4 pb-3 light-layout"}
        logoName={"logo.png"}
        footerContent={footerContent}
      />
      </section> */}

      {/* Persona Modal */}
      {/* {modalVisible ? (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: '10000', backgroundColor: 'white', zIndex: 200000 }}>
          <DemographicGameScreen onComplete={handleComplete} />
        </div>
      ) : (
        null
      )} */}

      {/* Profile Completion Modal */}
      {profileDataIncomplete && userId && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'pointer'
          }} onClick={handleModalClose} />

          <div style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            position: 'relative',
            zIndex: 10
          }}>

            <button
              onClick={handleModalClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '16px',
                color: '#666',
                zIndex: 20,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.2)';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                e.target.style.color = '#666';
              }}
            >
              ✕
            </button>


            <div style={{
              padding: '20px 20px 12px 20px',
              textAlign: 'center',
              backgroundColor: '#f8f9ff',
              zIndex: -1
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: '#ed4242',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: '0 auto 8px auto',
                boxShadow: '0 2px 4px rgba(237, 66, 66, 0.3)'
              }}>
                <span style={{
                  fontSize: '20px',
                  color: 'white'
                }}>👤</span>
              </div>

              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1a1a1a',
                textAlign: 'center',
                marginBottom: '4px',
                margin: '0 0 4px 0'
              }}>
                Complete Your Profile
              </h2>

              <p style={{
                fontSize: '15px',
                color: '#666',
                textAlign: 'center',
                lineHeight: '20px',
                margin: 0
              }}>
                Help us personalize your experience
              </p>
            </div>


            <div style={{
              padding: '16px 20px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#444',
                lineHeight: '20px',
                textAlign: 'center',
                margin: 0
              }}>
                We're missing a few details to give you the best experience possible.
              </p>
            </div>


            <div style={{
              padding: '4px 20px 20px 20px'
            }}>
              <button style={{
                width: '100%',
                backgroundColor: '#ed4242',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(237, 66, 66, 0.3)',
                transition: 'all 0.2s ease'
              }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#d63939';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#ed4242';
                  e.target.style.transform = 'translateY(0)';
                }}
                onClick={handleUserIncompleteProfile}>
                Complete Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* {iframeShowing ?
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            margin: 0,
            padding: 0,
            zIndex: 9999,
          }}
        >
          <iframe
            ref={iframeRef}
            src="https://live.aahaas.com/"
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title="Aahaas Live"
            style={{
              border: "none",
              display: "block",
              margin: 0,
              padding: 0,
            }}
          />
        </div>
        :
        null

      } */}
    </div>


  );
};

export default ShoesMarket;
