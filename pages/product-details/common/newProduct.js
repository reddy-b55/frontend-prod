import React, { useContext, useEffect, useState } from "react";
import { getProductDetailsEssentialNonEssential } from "../../../AxiosCalls/EssentialNonEssentialServices/EssentialNonEssentialServices";
import { getLifesyleproducts, loadNearByLifestyles } from "../../../AxiosCalls/LifestyleServices/lifestyleServices";
import { getAllEducationProducts } from "../../../AxiosCalls/EducationServices/educationServices";
import ProductItem from "../../../components/common/product-box/ProductBox";
import { Row, Nav } from "reactstrap";
import { AppContext } from "../../_app";
import cookie from 'cookie';
import {getLifestyleProducts} from "../../../AxiosCalls/LifestyleServices/newLifeStyleService";

const NewProduct = ({ category1, vendor, latitude, longitude, p_ID }) => {
  const { baseLocation } = useContext(AppContext);
 console.log("baseLocation in new product", category1, vendor, latitude, longitude, p_ID)
   let baseLocations = {
      latitude: '6.9271',
        longitude: '79.8612',
        locationDescription: 'Colombo, Sri lanka',
        address_components: [
          { long_name: 'Colombo', short_name: 'Colombo', types: [Array] },
          { long_name: 'Colombo', short_name: 'Colombo', types: [Array] },
          { long_name: 'Western Province', short_name: 'WP', types: [Array] },
          { long_name: 'Sri Lanka', short_name: 'LK', types: [Array] }
        ]
      };
  
        // console.log("base location", baseLocation)

  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getProducts = async () => {
    try {
      let response = [];

      if (category1 == "1") {
        response = await getProductDetailsEssentialNonEssential(parseInt(category1), 0, 0, 0, 5, 0, '',baseLocation);
        if (response !== "(Internal Server Error)" && response !== "Something went wrong !") {
          setProductData(response?.discount_data || []);
          // console.log("Essential Products:", response?.discount_data || []);
        }
      }else if( category1 == "2"){
         response = await getProductDetailsEssentialNonEssential(parseInt(category1), 0, 0, 0, 5, 0, '',baseLocation);
        if (response !== "(Internal Server Error)" && response !== "Something went wrong !") {
          setProductData(response?.discount_data || []);
          // console.log("NonEssential Products:", response?.discount_data || []);
        }
      } else if (category1 == "3") {
        const resutl = await loadNearByLifestyles(latitude, longitude);
        // response = await getLifesyleproducts(category1, 0, 0, latitude, longitude, 23, 15, vendor, "");
        if (resutl !== "(Internal Server Error)" && resutl !== "Something went wrong !") {
          const limitedProducts = resutl.slice(0, 5); // Load only 5 products
          setProductData(limitedProducts);
          if (limitedProducts.length === 0) {
            const backupResponse = await getLifesyleproducts(0, 0, 0, baseLocation.latitude, baseLocation.longtitude, 23, 15, 0, "");
            setProductData(backupResponse.slice(0, 5));
          }
        }
//         setProductData([
//          {
//     "lifestyle_city": "Colombo",
//     "lifestyle_attraction_type": null,
//     "lifestyle_name": "Day Tour from Colombo to Kelaniya Raja Maha Viharaya",
//     "lifestyle_description": "<p>Experience a day tour from Colombo to the historic Kelaniya Raja Maha Viharaya, a significant Buddhist temple celebrated for its stunning architecture and rich cultural heritage. This package includes comfortable transport to and from the temple, ensuring a hassle-free journey. Please note that entrance fees and any other activity costs are not included. Enjoy the serene beauty of this sacred site while immersing yourself in the spiritual ambiance of the location.</p>",
//     "image": "https://aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/productImages/lifestyles/aV8gEvuNQ6D7M3qBfe0OagEohzwtTSsQBTtAqJbW.jpg",
//     "lifestyle_id": 6151,
//     "selling_points": "Day Tour,Colombo,Transfers,Kelaniya Raja Maha Viharaya",
//     "longitude": "79.8612",
//     "latitude": "6.9271",
//     "triggers": 1100,
//     "created_at": "2024-10-01 00:00:00",
//     "category_1": "3",
//     "category_2": "5",
//     "category_3": "18",
//     "category_4": null,
//     "vendor_id": "635",
//    "default_rate": 14375,
//     "currency": "USD",
//     "cancellation_days": "2",
//     "book_by_days": "2",
//     "booking_start_date": "2024-09-30 00:00:00",
//     "payment_policy": "2 Days prior to the service date full payment to be done",
//     "cancel_policy": "Cancellations must be made at least 2 days prior to the scheduled service date to avoid any charges.\nClients who do not show up for their scheduled service without prior notification will be charged the full amount for the service booked.",
//     "booking_end_date": "2025-12-31",
//     "adult_rate": 14375,
//     "child_rate": 14375,
//     "package_rate": 14375,
//     "provider": "aahaas",
//     "pickup_location": "",
//     "pickup_time": "",
//     "distance": 0.34861064010156395,
//     "discount": null
// },
//       {
//         "lifestyle_city": "Kandy",
//         "lifestyle_attraction_type": "N/A",
//         "lifestyle_name": "Kandy Escape – 3 Nights 4 Days INR 7,999",
//         "lifestyle_description": "<p>Testttt</p>",
//         "image": "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/productImages/lifestyles/rnx7VrLtCS9faBhR1zWgEyknQmAI9Xqa04cPWQFz.png",
//         "lifestyle_id": 12381,
//         "selling_points": "Kandy",
//         "longitude": "80.6337",
//         "latitude": "7.2906",
//         "triggers": 1000,
//         "created_at": "2025-07-03 05:07:47",
//         "category_1": "3",
//         "category_2": "46",
//         "category_3": null,
//         "category_4": null,
//         "vendor_id": "5",
//         "default_rate": 7999,
//         "currency": "INR",
//         "cancellation_days": "2",
//         "book_by_days": "1",
//         "booking_start_date": "2025-07-25",
//         "payment_policy": "Payment to be done while placing the order.",
//         "cancel_policy": "Test",
//         "booking_end_date": "2025-07-25",
//         "adult_rate": 7999,
//         "child_rate": 7999,
//         "package_rate": 7999,
//         "provider": "aahaas",
//         "pickup_location": "",
//         "pickup_time": "",
//         "distance": 94.33216907689203
//       },
//       {
//         "lifestyle_city": "Colombo",
//         "lifestyle_attraction_type": "N/A",
//         "lifestyle_name": "Colombo Escape – 3 Nights 4 Days INR 7,999",
//         "lifestyle_description": "<p>Testttt</p>",
//         "image": "https://s3-aahaas-prod-assets.s3.ap-southeast-1.amazonaws.com/productImages/lifestyles/roo3DLHuLvBxSGnNdCU1liFB0qMnUwhrC64uEKlQ.png",
//         "lifestyle_id": 12382,
//         "selling_points": "Colombo",
//         "longitude": "79.8612",
//         "latitude": "6.9271",
//         "triggers": 1000,
//         "created_at": "2025-07-03 05:08:39",
//         "category_1": "3",
//         "category_2": "46",
//         "category_3": null,
//         "category_4": null,
//         "vendor_id": "5",
//         "default_rate": 7999,
//         "currency": "INR",
//         "cancellation_days": "2",
//         "book_by_days": "1",
//         "booking_start_date": "2025-07-25",
//         "payment_policy": "Payment to be done while placing the order.",
//         "cancel_policy": "Test",
//         "booking_end_date": "2025-07-25",
//         "adult_rate": 7999,
//         "child_rate": 7999,
//         "package_rate": 7999,
//         "provider": "aahaas",
//         "pickup_location": "",
//         "pickup_time": "",
//         "distance": 0.005309560326675751
//       },{
//     "category_1": 3,
//     "category_2": 0,
//     "category_3": 0,
//     "category_4": 0,
//     "pricing_data": {
//         "currency": "USD",
//         "merchant_price": 62.78,
//         "retail_price": 90
//     },
//     "adult_rate": 108,
//     "child_rate": 108,
//     "package_rate": 108,
//     "lifestyle_city": "Mount Lavinia",
//     "lifestyle_attraction_type": null,
//     "lifestyle_name": "Forest Rock Climbing from Mount Lavinia",
//     "lifestyle_description": "Kotigahakanda Rock Climbing is an excursion that challenges the outdoor adventure enthusiast and adrenaline seeker alike. With the instructions and guidance of well-trained professionals, people of all ages can enjoy this excursion at an affordable price.",
//     "image": "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/0c/a2/f5.jpg",
//     "longitude": 79.864975,
//     "latitude": 6.838981,
//     "pickup_location": null,
//     "payment_policy": null,
//     "cancel_policy": "For a full refund, cancel at least 24 hours before the scheduled departure time.",
//     "lifestyle_rate_id": null,
//     "inventory_date": null,
//     "lifestyle_id": "5dce8602-09d3-47db-9037-1ae2cb9abaae",
//     "pickup_time": null,
//     "discount_limit": null,
//     "discount_type": null,
//     "offered_product": "",
//     "direct": null,
//     "value": 0,
//     "inventory_limit": "0.00",
//     "sale_start_date": null,
//     "sale_end_date": null,
//     "cancellation_days": 1,
//     "book_by_days": null,
//     "booking_start_date": "",
//     "booking_end_date": null,
//     "distance": 9.80466580231573,
//     "discount": null,
//     "free_cancellation": true,
//     "instant_booking": true,
//     "address": "",
//     "default_rate": 108,
//     "currency": "USD",
//     "vendor_id": 0,
//     "selling_points": "",
//     "provider": "bridgify",
//     "markup": 20
// },
//       {
//     "category_1": 3,
//     "category_2": 0,
//     "category_3": 0,
//     "category_4": 0,
//     "pricing_data": {
//         "currency": "USD",
//         "merchant_price": 370.25,
//         "retail_price": 392
//     },
//     "adult_rate": 470.4,
//     "child_rate": 470.4,
//     "package_rate": 470.4,
//     "lifestyle_city": "Colombo",
//     "lifestyle_attraction_type": null,
//     "lifestyle_name": "Explore Sri Lanka (self- arranged accommodation)",
//     "lifestyle_description": "On this 10 day tour, you will get the chance to help design your itinerary and reserve your accommodation to suit your needs. You will explore some of the country's most famous tourist places. This tour will bring you a variety of thrilling activities as well as fully submerse you in the local culture and expose you to the history of Sri Lanka.\n",
//     "image": "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/0b/33/56/9a.jpg",
//     "longitude": 79.84793,
//     "latitude": 6.934799,
//     "pickup_location": null,
//     "payment_policy": null,
//     "cancel_policy": "For a full refund, cancel at least 24 hours before the scheduled departure time.",
//     "lifestyle_rate_id": null,
//     "inventory_date": null,
//     "lifestyle_id": "3d739226-33fa-4f1b-915d-2e47085535cc",
//     "pickup_time": null,
//     "discount_limit": null,
//     "discount_type": null,
//     "offered_product": "",
//     "direct": null,
//     "value": 0,
//     "inventory_limit": "0.00",
//     "sale_start_date": null,
//     "sale_end_date": null,
//     "cancellation_days": 1,
//     "book_by_days": null,
//     "booking_start_date": "",
//     "booking_end_date": null,
//     "distance": 1.7018987220101525,
//     "discount": null,
//     "free_cancellation": true,
//     "instant_booking": true,
//     "address": "",
//     "default_rate": 470.4,
//     "currency": "USD",
//     "vendor_id": 0,
//     "selling_points": "",
//     "provider": "bridgify",
//     "markup": 20
// },
//       {
//     "category_1": 3,
//     "category_2": 0,
//     "category_3": 0,
//     "category_4": 0,
//     "pricing_data": {
//         "currency": "USD",
//         "merchant_price": 161.09,
//         "retail_price": 564
//     },
//     "adult_rate": 676.8,
//     "child_rate": 676.8,
//     "package_rate": 676.8,
//     "lifestyle_city": "Negombo",
//     "lifestyle_attraction_type": null,
//     "lifestyle_name": "Exploring Paradise (15 Days)",
//     "lifestyle_description": "Exploring Paradise- like the name suggests, is a journey of discovery that takes you on an unimaginably wonderful trip to some of Sri Lanka’s most treasured locations. Learn of Sri Lanka’s most sacred ancient cities and monuments- World Heritage sites that attract countless wanderers throughout the world. Travel through the picturesque hill country with its breathtaking views.",
//     "image": "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/09/9a/ab/78.jpg",
//     "longitude": 79.840355,
//     "latitude": 7.241216,
//     "pickup_location": null,
//     "payment_policy": null,
//     "cancel_policy": "All sales are final. No refund is available for cancellations.",
//     "lifestyle_rate_id": null,
//     "inventory_date": null,
//     "lifestyle_id": "d88905f2-95f8-4960-924f-e31fe558bc65",
//     "pickup_time": null,
//     "discount_limit": null,
//     "discount_type": null,
//     "offered_product": "",
//     "direct": null,
//     "value": 0,
//     "inventory_limit": "0.00",
//     "sale_start_date": null,
//     "sale_end_date": null,
//     "cancellation_days": 1,
//     "book_by_days": null,
//     "booking_start_date": "",
//     "booking_end_date": null,
//     "distance": 35.006447742260065,
//     "discount": null,
//     "free_cancellation": false,
//     "instant_booking": true,
//     "address": ", ",
//     "default_rate": 676.8,
//     "currency": "USD",
//     "vendor_id": 0,
//     "selling_points": "",
//     "provider": "bridgify",
//     "markup": 20
// }
// ])
        // response = await getLifestyleProducts

      } else if (category1 == "5") {
        response = await getAllEducationProducts(category1, 0, 0, 0, 5, 0, '',baseLocation.latitude, baseLocation.longtitude,0);
        if (response !== "(Internal Server Error)" && response !== "Something went wrong !") {
          setProductData(response?.educationListings || []);
        }
      } else if (category1 == "4") {
        response = await getLifesyleproducts(0, 0, 0, latitude, longitude, 23, 15, 0, "");
        if (response !== "(Internal Server Error)" && response !== "Something went wrong !") {
          setProductData(response);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [category1, vendor, latitude, longitude]);

  const renderProductItem = (product) => {
    switch (category1) {
      case "3":
        return (
          <ProductItem
            product={product}
            productImage={product?.image?.split(",")[0]}
            productstype={"lifestyle"}
            title={product.lifestyle_name}
            productcurrency={product.currency}
            adultRate={product.adult_rate}
            childRate={product.child_rate}
            description={product.lifestyle_description}
            rating={4}
            addWishlist={() => contextWishlist.addToWish(product)}
            addCart={() => context.addToCart(product, quantity)}
            addCompare={() => comapreList.addToCompare(product)}
            cartClass={"cart-info cart-wrap"}
            backImage={true}
            vendorRelated={true}
          />
        );
      case "5":
        return (
          <ProductItem
            product={product}
            productImage={product.image_path.split(",")[0]}
            productstype={"education"}
            title={product.course_name}
            productcurrency={product.currency}
            adultRate={product.adult_course_fee}
            childRate={product.child_course_fee}
            description={product.course_description}
            rating={4}
            addWishlist={() => contextWishlist.addToWish(product)}
            addCart={() => context.addToCart(product, quantity)}
            addCompare={() => comapreList.addToCompare(product)}
            cartClass={"cart-info cart-wrap"}
            backImage={true}
            vendorRelated={true}
          />
        );
      case "4":
        return (
          <ProductItem
            product={product}
            productImage={product?.image?.split(",")[0]}
            productstype={"lifestyle"}
            title={product.lifestyle_name}
            productcurrency={product.currency}
            adultRate={product.adult_rate}
            childRate={product.child_rate}
            description={product.lifestyle_description}
            rating={4}
            addWishlist={() => contextWishlist.addToWish(product)}
            addCart={() => context.addToCart(product, quantity)}
            addCompare={() => comapreList.addToCompare(product)}
            cartClass={"cart-info cart-wrap"}
            backImage={true}
            vendorRelated={true}
          />
        );
      case "1":
        return(
          <ProductItem
            product={product}
            productImage={product.product_images.split(",")[0]}
            productstype={"essential"}
            title={product.listing_title}
            productcurrency={product.currency}
            mrp={product.mrp}
            description={product.listing_description}
            rating={4}
            addWishlist={() => contextWishlist.addToWish(product)}
            addCart={() => context.addToCart(product, quantity)}
            addCompare={() => comapreList.addToCompare(product)}
            cartClass={"cart-info cart-wrap"}
            backImage={true}
            vendorRelated={true}
          />
        )
      case "2":
        return (
          <ProductItem
            product={product}
            productImage={product.product_images.split(",")[0]}
            productstype={"nonessential"}
            title={product.listing_title}
            productcurrency={product.currency}
            mrp={product.mrp}
            description={product.listing_description}
            rating={4}
            addWishlist={() => contextWishlist.addToWish(product)}
            addCart={() => context.addToCart(product, quantity)}
            addCompare={() => comapreList.addToCompare(product)}
            cartClass={"cart-info cart-wrap"}
            backImage={true}
            vendorRelated={true}
          />
        );
      default:
        return null;
    }
  };

  const PID = Number(p_ID);

  return (
    <section className="tab-product p-0 m-0 pt-3 pb-0 px-1" style={{ height: "fit-content" }}>
      <Row className="product-page-main m-0">
        <Nav tabs className="nav-material">
          {productData.length > 0 && <h5 style={{ fontSize: "15px" }}>Explore more</h5> }
        </Nav>
      </Row>

      {loading ? (
        "Loading..."
      ) : (
        <div className="mt-3">
          {productData
            .filter(
              (product) =>
                !(
                  product?.lifestyle_id === PID ||
                  product?.product_detail_id === PID ||
                  product?.education_id === PID
                )
            )
            .map((product, index) => (
              <div key={index} className="mb-3">
                {renderProductItem(product)}
              </div>
            ))}
        </div>
      )}
    </section>
  );
};

export default NewProduct;
