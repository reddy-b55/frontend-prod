import axios from "axios";
import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import CommonLayout from "../../../components/shop/common-layout";
import ProductItems from "../../../components/common/product-box/ProductBox";
import ToastMessage from "../../../components/Notification/ToastMessage";
import PostLoader from "../../skeleton/PostLoader";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import { useRouter } from "next/router";
import ModalBase from "../../../components/common/Modals/ModalBase";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import VehicleCard from "../../../components/common/product-box/VehicleCard";
import { Currency } from "lucide-react";
import BuddyModal from "../../../components/common/TravelBuddies/BuddyModal";
import CartContainer from "../../../components/CartContainer/CartContainer";
import { AppContext } from "../../_app";

const TransportMainPage = ({ id = "transport", category = 7 }) => {
  const router = useRouter();
  const canonicalUrl = router.asPath;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelPickupAndDrop, setModelPickupAndDrop] = useState(false);
  const [grid, setGrid] = useState("col-lg-3 col-md-4 col-6 my-3");
  const [openTravelBuddy, setOpenTravelBuddy] = useState(false);
  const [adultDetails, setAdultDetails] = useState([]);
  const [childsDetails, setChildDetails] = useState([]);
  const [cartModal, setCartModal] = useState(false)

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [transportType, setTransportType] = useState("oneway");
  const [travelDate, setTravelDate] = useState(new Date());
  const [travelTime, setTravelTime] = useState("10:00");
  const [passengerCount, setPassengerCount] = useState(1);
  const [hourCount, setHourCount] = useState(1);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [selectedPickup, setSelectedPickup] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [selectTravelBuddiesIds, setSelectTravelBuddiesIds] = useState([]);
  const [cartObj, setCartObj]= useState({})
  
   const {userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedPickup) {
      ToastMessage({
        status: "warning",
        message: "Please select a pickup location",
      });
      return;
    }

    if (transportType === "oneway" && !selectedDrop) {
      ToastMessage({
        status: "warning",
        message: "Please select a drop location",
      });
      return;
    }

    const formData = {
      sourceLat: selectedPickup?.lat,
      sourceLng: selectedPickup?.lng,
      destinationLat: selectedDrop?.lat,
      destinationLng: selectedDrop?.lng,
      sourcePlaceName: selectedPickup?.name,
      destinationPlaceName: selectedDrop?.name,
      type: transportType,
      date: travelDate.toISOString().split("T")[0],
      time: travelTime,
      passenger: passengerCount,
      hour: transportType === "hourly" ? hourCount : null, // Add hour field for hourly type
    };

    console.log("Form submitted:", formData);
    handleVehicleLoading(formData);
    setModelPickupAndDrop(false);
  };

  const incrementPassengers = () => {
    setPassengerCount((prev) => prev + 1);
  };

  const decrementPassengers = () => {
    if (passengerCount > 1) {
      setPassengerCount((prev) => prev - 1);
    }
  };

  // Add handlers for hour count
  const incrementHours = () => {
    setHourCount((prev) => prev + 1);
  };

  const decrementHours = () => {
    if (hourCount > 1) {
      setHourCount((prev) => prev - 1);
    }
  };

  const handleOnAddLifestyle = () => {
    setCartModal(false)
  }

  const getLocation = async (placeName, locationType) => {
    if (!placeName || placeName.trim() === "") {
      ToastMessage({
        status: "warning",
        message: "Please enter a location to search",
      });
      return;
    }
    try {
      const response = await axios.get(
        `/drivado/search_location?placeName=${placeName}`
      );
      if (response.data && response.data.success === true) {
        console.log("Location data:", response.data.data);

        // Update suggestions based on location type
        if (locationType === "pickup") {
          setPickupSuggestions(response.data.data);
        } else {
          setDropSuggestions(response.data.data);
        }

        ToastMessage({ status: "success", message: "Locations found" });
      } else {
        ToastMessage({ status: "warning", message: "No locations found" });

        // Clear suggestions if no results
        if (locationType === "pickup") {
          setPickupSuggestions([]);
        } else {
          setDropSuggestions([]);
        }
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      ToastMessage({ status: "error", message: "Something went wrong" });

      // Clear suggestions on error
      if (locationType === "pickup") {
        setPickupSuggestions([]);
      } else {
        setDropSuggestions([]);
      }
    }
  };

  const handleVehicleLoading = async (reqObj) => {
    setLoading(true);
    console.log("Vehicle loading request", reqObj);
    let url;
    try {
      if (reqObj.type === "oneway") {
        url = `?type=oneway&sourceLat=${reqObj.sourceLat}&sourceLng=${reqObj.sourceLng}&destinationLat=${reqObj.destinationLat}&destinationLng=${reqObj.destinationLng}&sourcePlaceName=${reqObj.sourcePlaceName}&destinationPlaceName=${reqObj.destinationPlaceName}&date=${reqObj.date}&time=${reqObj.time}&passenger=${reqObj.passenger}`;
        if (
          !reqObj.sourceLat ||
          !reqObj.sourceLng ||
          !reqObj.sourcePlaceName ||
          !reqObj.destinationLat ||
          !reqObj.destinationLng ||
          !reqObj.destinationPlaceName ||
          !reqObj.date ||
          !reqObj.time ||
          !reqObj.passenger
        ) {
          ToastMessage({
            status: "warning",
            message: "Missing some required values",
          });
        }
      } else if (reqObj.type === "hourly") {
        url = `?type=hourly&sourceLat=${reqObj.sourceLat}&sourceLng=${reqObj.sourceLng}&sourcePlaceName=${reqObj.sourcePlaceName}&date=${reqObj.date}&time=${reqObj.time}&passenger=${reqObj.passenger}&hour=${reqObj.hour}`;
        if (
          !reqObj.sourceLat ||
          !reqObj.sourceLng ||
          !reqObj.sourcePlaceName ||
          !reqObj.date ||
          !reqObj.time ||
          !reqObj.passenger ||
          !reqObj.hour
        ) {
          ToastMessage({
            status: "warning",
            message: "Missing some required values",
          });
        }
      }

      await axios
        .post(`/drivado/transport_details${url}`)
        .then((res) => {
          console.log(
            "Vehicle loading response:",
            res
          );
          if (res.data.success === true) {
            ToastMessage({
              status: "success",
              message: "Vehicle loading successful",
            });
            const objectPassCart = {
              type: transportType,
              cart_id: null,
              user_id : userId,
              vehicle_with_price : {},
              travel_buddy_adult_ids: "",
              search_id :res.data.data.search_id,
              km:res.data.data.km,
              duration: res.data.data.duration,
              destination: selectedDrop,
              source: selectedPickup,
              hour: transportType === "hourly" ? hourCount : null, // Add hour to cart object for hourly type
            };
            setCartObj(objectPassCart)

            console.log('Vehicle loading response:',objectPassCart)
            setProducts(res.data.data.vehicleWithPriceArray);
          } else {
            setProducts([]);
          }
        })
        .catch((err) => {
          console.error("Error in vehicle loading:", err.message);
        });

      console.log("Vehicle loading request:", reqObj);
    } catch (e) {
      console.error("Error in handleVehicleLoading:", e.message);
      ToastMessage({ status: "error", message: e.message });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location, locationType) => {
    if (locationType === "pickup") {
      setPickup(location.name);
      setSelectedPickup(location);
      setPickupSuggestions([]);
    } else {
      setDrop(location.name);
      setSelectedDrop(location);
      setDropSuggestions([]);
    }

    console.log(`Selected ${locationType} location:`, location);
  };

  const handleAddToCart = (product) => {
    let cartItem = {};
    if(selectTravelBuddiesIds.length > 0){
        setCartModal(true)
    }else{
    setOpenTravelBuddy(true)
    }
    console.log("Product added to cart:", product);
  };

  
  const handleCloseTravelBuddy = () => {
    setOpenTravelBuddy(false);
}

const handleTravelBuddies = (value) => {
    console.log("Selected travel buddies:", value);

    value.forEach((buddy) => {
        setSelectTravelBuddiesIds((prev) => [...prev, buddy.id]);
    });

    let adults = value.filter((res) => { return res.PaxType == "1" });
    let childs = value.filter((res) => { return res.PaxType == "2" });
    setAdultDetails(adults);
    setChildDetails(childs);

    setOpenTravelBuddy(false);

}

const handleTransportTypeChange = (type) => {
  // Only reset data if the transport type is actually changing
  if (type !== transportType) {
    // Set the new transport type
    setTransportType(type);
    
    // Reset all form data
    setPickup("");
    setDrop("");
    setSelectedPickup(null);
    setSelectedDrop(null);
    setPickupSuggestions([]);
    setDropSuggestions([]);
    setTravelDate(new Date());
    setTravelTime("10:00");
    setPassengerCount(1);
    setHourCount(1);
    
    // Reset any product-related state as well
    setProducts([]);
    setCartObj({});
  }
};

const SimpleTimePicker = ({ value, onChange, className, id }) => {
  return (
    <input
      type="time"
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} booking-input`}
      required
    />
  );
};


  return (
    <>
      <Head>
        <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
        <title>Aahaas - Transport</title>
        <meta name="description" content="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://www.aahaas.com/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Non-Essential",
                  item: "https://www.aahaas.com/tranport/",
                },
              ],
            }),
          }}
        />
      </Head>
      <CommonLayout title={id} parent="home">
        <section className="section-b-space ratio_asos mt-lg-5">
          <div className="collection-wrapper">
            <Container fluid={true}>
             <Row>
  <Col md="12">
    <div className="transport-booking-bar">
      <h4 className="booking-title">Book Your Ride</h4>
      
      <div className="booking-tabs">
        <div 
          className={`booking-tab ${transportType === "oneway" ? "active" : ""}`}
          onClick={() => handleTransportTypeChange("oneway")}
        >
          <span className="tab-icon">🚗</span>
          <span>One-Way</span>
        </div>
        <div 
          className={`booking-tab ${transportType === "hourly" ? "active" : ""}`}
          onClick={() => handleTransportTypeChange("hourly")}
        >
          <span className="tab-icon">🕒</span>
          <span>Hourly Rental</span>
        </div>
      </div>
      
      <div className="booking-container">
        <div className="booking-option">
          <label>
            <span className="label-icon">📍</span>
            PICK-UP LOCATION
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              className="booking-input"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              onClick={() => setPickupSuggestions([])}
            />
            <button 
              className="location-search-btn"
              onClick={() => getLocation(pickup, "pickup")}
            >
              <SearchIcon />
            </button>
          </div>
          
          {pickupSuggestions.length > 0 && (
            <div className="location-suggestions">
              <ul className="suggestions-list">
                {pickupSuggestions.map((location) => (
                  <li
                    key={location._id}
                    onClick={() => handleLocationSelect(location, "pickup")}
                  >
                    {location.name}, {location.cityName}, {location.country}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {transportType === "oneway" && (
          <div className="booking-option">
            <label>
              <span className="label-icon">🏁</span>
              DROP-OFF LOCATION
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="booking-input"
                placeholder="Enter drop location"
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                onClick={() => setDropSuggestions([])}
              />
              <button 
                className="location-search-btn"
                onClick={() => getLocation(drop, "drop")}
              >
                <SearchIcon />
              </button>
            </div>
            
            {dropSuggestions.length > 0 && (
              <div className="location-suggestions">
                <ul className="suggestions-list">
                  {dropSuggestions.map((location) => (
                    <li
                      key={location._id}
                      onClick={() => handleLocationSelect(location, "drop")}
                    >
                      {location.name}, {location.cityName}, {location.country}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="booking-option">
          <label>
            <span className="label-icon">📅</span>
            PICK-UP DATE
          </label>
          <DatePicker
            id="travelDate"
            onChange={setTravelDate}
            value={travelDate}
            minDate={new Date()}
            format="EEE, dd MMM yyyy"
            required
            clearIcon={null}
            className="booking-date-picker"
          />
        </div>
        
         {transportType === "oneway" && (<div className="booking-option">
          <label>
            <span className="label-icon">⏰</span>
            PICK-UP TIME
          </label>
          {/* <TimePicker
            id="travelTime"
            onChange={setTravelTime}
            value={travelTime}
            className="booking-time-picker"
            clearIcon={null}
            required
            format="h:mm a"
          /> */}
           <SimpleTimePicker
            id="travelTime"
            value={travelTime}
            onChange={setTravelTime}
            className="booking-time-picker"
          />
        </div>)}
        
        {transportType === "hourly" && (
          <div className="booking-option hour-option">
            <label>
              <span className="label-icon">⌛</span>
              RENTAL HOURS
            </label>
            <div className="passenger-control">
              <button
                type="button"
                className="passenger-btn decrement"
                onClick={decrementHours}
                disabled={hourCount <= 1}
              >
                <RemoveIcon fontSize="small" />
              </button>
              <div className="passenger-count">
                {hourCount}
              </div>
              <button
                type="button"
                className="passenger-btn increment"
                onClick={incrementHours}
              >
                <AddIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}
        
        <div className="booking-option passenger-option">
          <label>
            <span className="label-icon">👥</span>
            PASSENGERS
          </label>
          <div className="passenger-control">
            <button
              type="button"
              className="passenger-btn decrement"
              onClick={decrementPassengers}
              disabled={passengerCount <= 1}
            >
              <RemoveIcon fontSize="small" />
            </button>
            <div className="passenger-count">
              {passengerCount}
            </div>
            <button
              type="button"
              className="passenger-btn increment"
              onClick={incrementPassengers}
            >
              <AddIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="booking-footer">
        <Button
          color="primary"
          className="search-btn"
          onClick={handleSubmit}
        >
          SEARCH VEHICLES
        </Button>
      </div>
    </div>
    
   
  </Col>
</Row>
              <Row>
                {loading ? (
                  <div className="row mx-0 mt-4 margin-default mt-4">
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
                  </div>
                ) : loading === false && products.length == 0 ? (
                  <Col xs="12">
                    <div className="my-5">
                      <div className="col-sm-12 empty-cart-cls text-center">
                        <img
                          alt="category wise banner"
                          src="/assets/images/ErrorImages/file.png"
                          className="img-fluid mb-4 mx-auto"
                        />
                        <h4
                          style={{ fontSize: 22, fontWeight: "600" }}
                          className="px-5"
                        >
                          Sorry, there are no products available right now.
                        </h4>
                        <h4 style={{ fontSize: 15 }}>
                          Please check back later or explore other options.
                        </h4>
                      </div>
                    </div>
                  </Col>
                ) : (
                  products.map((product, i) => (
                    <>
                      <Col xs="12" key={i}>
                           <ProductItems
                                product={product}
                                productImage={product.image}
                                description={product?.description}
                                productstype={"transport"}
                                title={product?.vehicleName}
                                productcurrency={product?.unit}
                                rating={4}
                                addWishlist={() =>
                                  contextWishlist.addToWish(product)
                                }
                                addCart={() =>
                                  handleAddToCart(product, passengerCount)
                                }
                                cartClass={"cart-info cart-wrap"}
                                backImage={false}
                                cart = {cartObj}
                           />
                      </Col>
                    </>
                  ))
                )}
              </Row>
            </Container>
          </div>
        </section>
      </CommonLayout>

      <ModalBase
        isOpen={modelPickupAndDrop}
        title={"Select Pickup and Drop location"}
        toggle={() => {
          setModelPickupAndDrop(false);
        }}
        size="l"
      >
        <Form onSubmit={handleSubmit}>
          {/* Transport Type Selection */}
          <FormGroup tag="fieldset" className="mb-4">
            <h4>Transport Type</h4>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="transportType"
                  value="oneway"
                  checked={transportType === "oneway"}
                  onChange={(e) => setTransportType(e.target.value)}
                />{" "}
                One Way
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label check>
                <Input
                  type="radio"
                  name="transportType"
                  value="hourly"
                  checked={transportType === "hourly"}
                  onChange={(e) => setTransportType(e.target.value)}
                />{" "}
                Hourly
              </Label>
            </FormGroup>
          </FormGroup>

          {/* Pickup Location - With search icon and suggestions */}
          <FormGroup>
            <Label for="pickupLocation">Pickup Location</Label>
            <div className="input-group">
              <Input
                type="text"
                name="pickupLocation"
                id="pickupLocation"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
              />
              <div className="input-group-append">
                <Button
                  color="secondary"
                  onClick={() => getLocation(pickup, "pickup")}
                >
                  <SearchIcon />
                </Button>
              </div>
            </div>

            {/* Pickup Suggestions Dropdown */}
            {pickupSuggestions.length > 0 && (
              <div className="location-suggestions">
                <ul className="list-group mt-2">
                  {pickupSuggestions.map((location) => (
                    <li
                      key={location._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleLocationSelect(location, "pickup")}
                    >
                      {location.name}, {location.cityName}, {location.country}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </FormGroup>

          {/* Drop Location - Only shown for oneway, with search icon and suggestions */}
          {transportType === "oneway" && (
            <FormGroup>
              <Label for="dropLocation">Drop Location</Label>
              <div className="input-group">
                <Input
                  type="text"
                  name="dropLocation"
                  id="dropLocation"
                  placeholder="Enter drop location"
                  value={drop}
                  onChange={(e) => setDrop(e.target.value)}
                  required
                />
                <div className="input-group-append">
                  <Button
                    color="secondary"
                    onClick={() => getLocation(drop, "drop")}
                  >
                    <SearchIcon />
                  </Button>
                </div>
              </div>

              {/* Drop Suggestions Dropdown */}
              {dropSuggestions.length > 0 && (
                <div className="location-suggestions">
                  <ul className="list-group mt-2">
                    {dropSuggestions.map((location) => (
                      <li
                        key={location._id}
                        className="list-group-item list-group-item-action"
                        onClick={() => handleLocationSelect(location, "drop")}
                      >
                        {location.name}, {location.cityName}, {location.country}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </FormGroup>
          )}
          {/* Date and Time Selection */}
          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="travelDate">Travel Date</Label>
                <div className="datepicker-container">
                  <DatePicker
                    id="travelDate"
                    onChange={setTravelDate}
                    value={travelDate}
                    minDate={new Date()}
                    format="MMMM d, yyyy"
                    required
                    clearIcon={null}
                  />
                </div>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label for="travelTime">Travel Time</Label>
                        <SimpleTimePicker
            id="travelTime"
            value={travelTime}
            onChange={setTravelTime}
            className="booking-time-picker"
          /> 

              </FormGroup>
            </Col>
          </Row>

          {/* Hours input for hourly rental */}
          {transportType === "hourly" && (
            <FormGroup className="mb-4">
              <Label for="hourCount">Rental Hours</Label>
              <div className="d-flex align-items-center">
                <Button
                  type="button"
                  color="light"
                  className="mr-3"
                  onClick={decrementHours}
                  disabled={hourCount <= 1}
                >
                  <RemoveIcon />
                </Button>
                <div className="hour-count px-4 py-2 border rounded">
                  {hourCount}
                </div>
                <Button
                  type="button"
                  color="light"
                  className="ml-3"
                  onClick={incrementHours}
                >
                  <AddIcon />
                </Button>
              </div>
            </FormGroup>
          )}

          {/* Passenger Count */}
          <FormGroup className="mb-4">
            <Label for="passengerCount">Passengers</Label>
            <div className="d-flex align-items-center">
              <Button
                type="button"
                color="light"
                className="mr-3"
                onClick={decrementPassengers}
              >
                <RemoveIcon />
              </Button>
              <div className="passenger-count px-4 py-2 border rounded">
                {passengerCount}
              </div>
              <Button
                type="button"
                color="light"
                className="ml-3"
                onClick={incrementPassengers}
              >
                <AddIcon />
              </Button>
            </div>
          </FormGroup>

          <Button color="primary" type="submit" className="mt-3">
            Submit
          </Button>
        </Form>
      </ModalBase>

        <ModalBase isOpen={openTravelBuddy} toggle={handleCloseTravelBuddy} title="Choose Your Buddies" size='md'>
                          <BuddyModal handleTravelBuddies={handleTravelBuddies} adultDetails={adultDetails} childsDetails={childsDetails} 
                          adultCount={passengerCount} 
                          childCount={0}
                          providerlife={"globaltix"}
                           >

                          </BuddyModal>
        </ModalBase>
      
        <ModalBase isOpen={cartModal} toggle={handleOnAddLifestyle} title="Select Your Cart" size='md'>
          <CartContainer cartCategory={"Lifestyle"} />
        </ModalBase>

      
   
      <style jsx>{`
     .transport-booking-bar {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 40px;
}

.booking-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 25px;
  text-align: center;
}

.booking-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 15px;
}

.booking-tab {
  display: flex;
  align-items: center;
  padding: 12px 25px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  background-color: #f8f9fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.booking-tab.active {
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 10px rgba(0, 123, 255, 0.25);
}

.tab-icon {
  margin-right: 10px;
  font-size: 18px;
}

.booking-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.booking-option {
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  margin-bottom: 30px; /* Added extra margin to make room for suggestions */
  z-index: 10; /* Added z-index to ensure proper stacking */
}

/* Higher z-index for the option being actively used */
.booking-option:focus-within {
  z-index: 20;
}

label {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.label-icon {
  margin-right: 8px;
  font-size: 16px;
}

.input-wrapper {
  position: relative;
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.booking-input,
.react-date-picker__wrapper,
.react-time-picker__wrapper {
  height: 50px;
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd !important;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  background-color: white;
}

/* Target DatePicker component */
.booking-date-picker,
.booking-time-picker {
  width: 100%;
  height: 50px;
}

.booking-date-picker .react-date-picker__wrapper,
.booking-time-picker .react-time-picker__wrapper {
  height: 50px;
  padding: 0 15px;
  border: 1px solid #ddd !important;
  border-radius: 8px;
}

/* Make it the same height as other inputs */
.booking-date-picker,
.booking-time-picker,
.booking-input,
.passenger-control {
  height: 50px;
}

.booking-input:focus,
.react-date-picker__wrapper:focus-within,
.react-time-picker__wrapper:focus-within {
  border-color: #007bff !important;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
  outline: none;
}

.location-search-btn {
  position: absolute;
  right: 12px;
  background: transparent;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* This is the key change - position the suggestions in a fixed position below the input */
.location-suggestions {
  position: absolute;
  width: 100%;
  max-height: 240px;
  overflow-y: auto;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  z-index: 1000;
  top: 100%; /* Position below the input */
  left: 0;
  margin-top: 5px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestions-list li {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background-color 0.2s;
}

.suggestions-list li:hover {
  background-color: #f8f9fa;
}

.passenger-control {
  display: flex;
  align-items: center;
  height: 50px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
}

.passenger-btn {
  background: #f8f9fa;
  border: none;
  width: 40px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.passenger-btn:hover {
  background: #e9ecef;
}

.passenger-btn.decrement {
  border-right: 1px solid #ddd;
}

.passenger-btn.increment {
  border-left: 1px solid #ddd;
}

.passenger-count {
  flex: 1;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.booking-footer {
  display: flex;
  justify-content: center;
}

.search-btn {
  background-color: #007bff;
  color: white;
  font-weight: 600;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  padding: 12px 40px;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 200px;
}

.search-btn:hover {
  background-color: #0069d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

@media (max-width: 992px) {
  .booking-container {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .booking-container {
    grid-template-columns: 1fr;
  }
  
  .booking-tabs {
    flex-wrap: wrap;
  }
  
  .booking-option {
    margin-bottom: 40px; /* Increased margin for mobile to ensure enough space */
  }
}
    `}</style>

    </>
  );
};

export default TransportMainPage;

// import axios from "axios";
// import Head from "next/head";
// import React, { useContext, useEffect, useState } from "react";
// import CommonLayout from "../../../components/shop/common-layout";
// import ProductItems from "../../../components/common/product-box/ProductBox";
// import ToastMessage from "../../../components/Notification/ToastMessage";
// import PostLoader from "../../skeleton/PostLoader";
// import {
//   Container,
//   Row,
//   Col,
//   Form,
//   FormGroup,
//   Label,
//   Input,
//   Button,
// } from "reactstrap";
// import { useRouter } from "next/router";
// import ModalBase from "../../../components/common/Modals/ModalBase";
// import SearchIcon from '@mui/icons-material/Search';
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import DatePicker from "react-date-picker";
// import "react-date-picker/dist/DatePicker.css";
// import "react-calendar/dist/Calendar.css";
// import TimePicker from "react-time-picker";
// import "react-time-picker/dist/TimePicker.css";
// import "react-clock/dist/Clock.css";
// import VehicleCard from "../../../components/common/product-box/VehicleCard";
// import { Currency } from "lucide-react";
// import BuddyModal from "../../../components/common/TravelBuddies/BuddyModal";
// import CartContainer from "../../../components/CartContainer/CartContainer";
// import { AppContext } from "../../_app";

// const TransportMainPage = ({ id = "transport", category = 7 }) => {
//   const router = useRouter();
//   const canonicalUrl = router.asPath;
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modelPickupAndDrop, setModelPickupAndDrop] = useState(false);
//   const [grid, setGrid] = useState("col-lg-3 col-md-4 col-6 my-3");
//   const [openTravelBuddy, setOpenTravelBuddy] = useState(false);
//   const [adultDetails, setAdultDetails] = useState([]);
//   const [childsDetails, setChildDetails] = useState([]);
//   const [cartModal, setCartModal] = useState(false)

//   const [pickup, setPickup] = useState("");
//   const [drop, setDrop] = useState("");
//   const [transportType, setTransportType] = useState("oneway");
//   const [travelDate, setTravelDate] = useState(new Date());
//   const [travelTime, setTravelTime] = useState("10:00");
//   const [passengerCount, setPassengerCount] = useState(1);

//   const [pickupSuggestions, setPickupSuggestions] = useState([]);
//   const [dropSuggestions, setDropSuggestions] = useState([]);
//   const [selectedPickup, setSelectedPickup] = useState(null);
//   const [selectedDrop, setSelectedDrop] = useState(null);
//   const [selectTravelBuddiesIds, setSelectTravelBuddiesIds] = useState([]);
//   const [cartObj, setCartObj]= useState({})
  
//    const {userId, baseLocation, baseCurrencyValue, groupApiCode } = useContext(AppContext);

//   // useEffect(() => {
//   //   handlePickupAndDrop();
//   // }, []);

//   // const handlePickupAndDrop = () => {
//   //   setModelPickupAndDrop(true);
//   // };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!selectedPickup) {
//       ToastMessage({
//         status: "warning",
//         message: "Please select a pickup location",
//       });
//       return;
//     }

//     if (transportType === "oneway" && !selectedDrop) {
//       ToastMessage({
//         status: "warning",
//         message: "Please select a drop location",
//       });
//       return;
//     }

//     const formData = {
//       // pickup: selectedPickup,
//       sourceLat: selectedPickup?.lat,
//       sourceLng: selectedPickup?.lng,
//       destinationLat: selectedDrop?.lat,
//       destinationLng: selectedDrop?.lng,
//       sourcePlaceName: selectedPickup?.name,
//       destinationPlaceName: selectedDrop?.name,
//       // drop: transportType === "oneway" ? selectedDrop : null,
//       type: transportType,
//       date: travelDate.toISOString().split("T")[0],
//       time: travelTime,
//       passenger: passengerCount,
//     };

//     console.log("Form submitted:", formData);
//     handleVehicleLoading(formData);
//     setModelPickupAndDrop(false);
//   };

//   const incrementPassengers = () => {
//     setPassengerCount((prev) => prev + 1);
//   };

//   const decrementPassengers = () => {
//     if (passengerCount > 1) {
//       setPassengerCount((prev) => prev - 1);
//     }
//   };

//   const handleOnAddLifestyle = () => {
//     setCartModal(false)
//   }

//   const getLocation = async (placeName, locationType) => {
//     if (!placeName || placeName.trim() === "") {
//       ToastMessage({
//         status: "warning",
//         message: "Please enter a location to search",
//       });
//       return;
//     }
//     try {
//       const response = await axios.get(
//         `/drivado/search_location?placeName=${placeName}`
//       );
//       if (response.data && response.data.success === true) {
//         console.log("Location data:", response.data.data);

//         // Update suggestions based on location type
//         if (locationType === "pickup") {
//           setPickupSuggestions(response.data.data);
//         } else {
//           setDropSuggestions(response.data.data);
//         }

//         ToastMessage({ status: "success", message: "Locations found" });
//       } else {
//         ToastMessage({ status: "warning", message: "No locations found" });

//         // Clear suggestions if no results
//         if (locationType === "pickup") {
//           setPickupSuggestions([]);
//         } else {
//           setDropSuggestions([]);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching location data:", error);
//       ToastMessage({ status: "error", message: "Something went wrong" });

//       // Clear suggestions on error
//       if (locationType === "pickup") {
//         setPickupSuggestions([]);
//       } else {
//         setDropSuggestions([]);
//       }
//     }
//   };

//   const handleVehicleLoading = async (reqObj) => {
//     setLoading(true);
//     console.log("Vehicle loading request", reqObj);
//     let url;
//     try {
//       if (reqObj.type === "oneway") {
//         url = `?type=oneway&sourceLat=${reqObj.sourceLat}&sourceLng=${reqObj.sourceLng}&destinationLat=${reqObj.destinationLat}&destinationLng=${reqObj.destinationLng}&sourcePlaceName=${reqObj.sourcePlaceName}&destinationPlaceName=${reqObj.destinationPlaceName}&date=${reqObj.date}&time=${reqObj.time}&passenger=${reqObj.passenger}`;
//         if (
//           !reqObj.sourceLat ||
//           !reqObj.sourceLng ||
//           !reqObj.sourcePlaceName ||
//           !reqObj.destinationLat ||
//           !reqObj.destinationLng ||
//           !reqObj.destinationPlaceName ||
//           !reqObj.date ||
//           !reqObj.time ||
//           !reqObj.passenger
//         ) {
//           ToastMessage({
//             status: "warning",
//             message: "Missing some required values",
//           });
//         }
//       } else if (reqObj.type === "hourly") {
//         url = `?type=hourly&sourceLat=${reqObj.sourceLat}&sourceLng=${reqObj.sourceLng}&sourcePlaceName=${reqObj.sourcePlaceName}&date=${reqObj.date}&time=${reqObj.time}&passenger=${reqObj.passenger}`;
//         if (
//           !reqObj.sourceLat ||
//           !reqObj.sourceLng ||
//           !reqObj.sourcePlaceName ||
//           !reqObj.date ||
//           !reqObj.time ||
//           !reqObj.passenger
//         ) {
//           ToastMessage({
//             status: "warning",
//             message: "Missing some required values",
//           });
//         }
//       }

//       await axios
//         .post(`/drivado/transport_details${url}`)
//         .then((res) => {
//           console.log(
//             "Vehicle loading response:",
//             res
//           );
//           if (res.data.success === true) {
//             ToastMessage({
//               status: "success",
//               message: "Vehicle loading successful",
//             });
//             const objectPassCart = {
//               type: transportType,
//               cart_id: null,
//               user_id : userId,
//               vehicle_with_price : {},
//               travel_buddy_adult_ids: "",
//               search_id :res.data.data.search_id,
//               km:res.data.data.km,
//               duration: res.data.data.duration,
//               destination: selectedDrop,
//               source: selectedPickup,
//             };
//             setCartObj(objectPassCart)

//             console.log('Vehicle loading response:',objectPassCart)
//             setProducts(res.data.data.vehicleWithPriceArray);
//           } else {
//             setProducts([]);
//           }
//         })
//         .catch((err) => {
//           console.error("Error in vehicle loading:", err.message);
//         });

//       console.log("Vehicle loading request:", reqObj);
//     } catch (e) {
//       console.error("Error in handleVehicleLoading:", e.message);
//       ToastMessage({ status: "error", message: e.message });
//       setLoading(false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLocationSelect = (location, locationType) => {
//     if (locationType === "pickup") {
//       setPickup(location.name);
//       setSelectedPickup(location);
//       setPickupSuggestions([]);
//     } else {
//       setDrop(location.name);
//       setSelectedDrop(location);
//       setDropSuggestions([]);
//     }

//     console.log(`Selected ${locationType} location:`, location);
//   };

//   const handleAddToCart = (product) => {
//     let cartItem = {};
//     if(selectTravelBuddiesIds.length > 0){
//         setCartModal(true)
//     }else{
//     setOpenTravelBuddy(true)
//     }
//     console.log("Product added to cart:", product);
//   };

  
//   const handleCloseTravelBuddy = () => {
//     setOpenTravelBuddy(false);
// }

// const handleTravelBuddies = (value) => {
//     console.log("Selected travel buddies:", value);

//     value.forEach((buddy) => {
//         setSelectTravelBuddiesIds((prev) => [...prev, buddy.id]);
//     });

//     let adults = value.filter((res) => { return res.PaxType == "1" });
//     let childs = value.filter((res) => { return res.PaxType == "2" });
//     setAdultDetails(adults);
//     setChildDetails(childs);

//     setOpenTravelBuddy(false);

// }

//   return (
//     <>
//       <Head>
//         <link rel="canonical" href={canonicalUrl} as={canonicalUrl} />
//         <title>Aahaas - Transport</title>
//         <meta name="description" content="" />
//         <script
//           type="application/ld+json"
//           dangerouslySetInnerHTML={{
//             __html: JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "BreadcrumbList",
//               itemListElement: [
//                 {
//                   "@type": "ListItem",
//                   position: 1,
//                   name: "Home",
//                   item: "https://www.aahaas.com/",
//                 },
//                 {
//                   "@type": "ListItem",
//                   position: 2,
//                   name: "Non-Essential",
//                   item: "https://www.aahaas.com/tranport/",
//                 },
//               ],
//             }),
//           }}
//         />
//       </Head>
//       <CommonLayout title={id} parent="home">
//         <section className="section-b-space ratio_asos mt-lg-5">
//           <div className="collection-wrapper">
//             <Container fluid={true}>
//              <Row>
//   <Col md="12">
//     <div className="transport-booking-bar">
//       <h4 className="booking-title">Book Your Ride</h4>
      
//       <div className="booking-tabs">
//         <div 
//           className={`booking-tab ${transportType === "oneway" ? "active" : ""}`}
//           onClick={() => setTransportType("oneway")}
//         >
//           <span className="tab-icon">🚗</span>
//           <span>One-Way</span>
//         </div>
//         <div 
//           className={`booking-tab ${transportType === "hourly" ? "active" : ""}`}
//           onClick={() => setTransportType("hourly")}
//         >
//           <span className="tab-icon">🕒</span>
//           <span>Hourly Rental</span>
//         </div>
//       </div>
      
//       <div className="booking-container">
//         <div className="booking-option">
//           <label>
//             <span className="label-icon">📍</span>
//             PICK-UP LOCATION
//           </label>
//           <div className="input-wrapper">
//             <input
//               type="text"
//               className="booking-input"
//               placeholder="Enter pickup location"
//               value={pickup}
//               onChange={(e) => setPickup(e.target.value)}
//               onClick={() => setPickupSuggestions([])}
//             />
//             <button 
//               className="location-search-btn"
//               onClick={() => getLocation(pickup, "pickup")}
//             >
//               <SearchIcon />
//             </button>
//           </div>
          
//           {pickupSuggestions.length > 0 && (
//             <div className="location-suggestions">
//               <ul className="suggestions-list">
//                 {pickupSuggestions.map((location) => (
//                   <li
//                     key={location._id}
//                     onClick={() => handleLocationSelect(location, "pickup")}
//                   >
//                     {location.name}, {location.cityName}, {location.country}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
        
//         {transportType === "oneway" && (
//           <div className="booking-option">
//             <label>
//               <span className="label-icon">🏁</span>
//               DROP-OFF LOCATION
//             </label>
//             <div className="input-wrapper">
//               <input
//                 type="text"
//                 className="booking-input"
//                 placeholder="Enter drop location"
//                 value={drop}
//                 onChange={(e) => setDrop(e.target.value)}
//                 onClick={() => setDropSuggestions([])}
//               />
//               <button 
//                 className="location-search-btn"
//                 onClick={() => getLocation(drop, "drop")}
//               >
//                 <SearchIcon />
//               </button>
//             </div>
            
//             {dropSuggestions.length > 0 && (
//               <div className="location-suggestions">
//                 <ul className="suggestions-list">
//                   {dropSuggestions.map((location) => (
//                     <li
//                       key={location._id}
//                       onClick={() => handleLocationSelect(location, "drop")}
//                     >
//                       {location.name}, {location.cityName}, {location.country}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         )}
        
//         <div className="booking-option">
//           <label>
//             <span className="label-icon">📅</span>
//             PICK-UP DATE
//           </label>
//           <DatePicker
//             id="travelDate"
//             onChange={setTravelDate}
//             value={travelDate}
//             minDate={new Date()}
//             format="EEE, dd MMM yyyy"
//             required
//             clearIcon={null}
//             className="booking-date-picker"
//           />
//         </div>
        
//         <div className="booking-option">
//           <label>
//             <span className="label-icon">⏰</span>
//             PICK-UP TIME
//           </label>
//           <TimePicker
//             id="travelTime"
//             onChange={setTravelTime}
//             value={travelTime}
//             className="booking-time-picker"
//             clearIcon={null}
//             required
//             format="h:mm a"
//           />
//         </div>
        
//         <div className="booking-option passenger-option">
//           <label>
//             <span className="label-icon">👥</span>
//             PASSENGERS
//           </label>
//           <div className="passenger-control">
//             <button
//               type="button"
//               className="passenger-btn decrement"
//               onClick={decrementPassengers}
//               disabled={passengerCount <= 1}
//             >
//               <RemoveIcon fontSize="small" />
//             </button>
//             <div className="passenger-count">
//               {passengerCount}
//             </div>
//             <button
//               type="button"
//               className="passenger-btn increment"
//               onClick={incrementPassengers}
//             >
//               <AddIcon fontSize="small" />
//             </button>
//           </div>
//         </div>
//       </div>
      
//       <div className="booking-footer">
//         <Button
//           color="primary"
//           className="search-btn"
//           onClick={handleSubmit}
//         >
//           SEARCH VEHICLES
//         </Button>
//       </div>
//     </div>
    
   
//   </Col>
// </Row>
//               {/* <Row>
//                 <Col md="12">
//                   <div className="card mb-4">
//                     <div className="card-body">
//                       <h4 className="mb-3">Transport Service</h4>
//                       <p>
//                         Choose your pickup and drop locations to book our
//                         transport service.
//                       </p>
//                       <Button
//                         color="primary"
//                         onClick={handlePickupAndDrop}
//                         className="btn btn-sm btn-solid"
//                         style={{
//                           fontSize: 12,
//                           padding: "5px 10px",
//                           borderRadius: "4px",
//                         }}
//                       >
//                         Select Pickup & Drop Locations
//                       </Button>
//                     </div>
//                   </div>
//                 </Col>
//               </Row> */}
//               <Row>
//                 {loading ? (
//                   <div className="row mx-0 mt-4 margin-default mt-4">
//                     <div className="col-xl-3 col-lg-4 col-6">
//                       <PostLoader />
//                     </div>
//                     <div className="col-xl-3 col-lg-4 col-6">
//                       <PostLoader />
//                     </div>
//                     <div className="col-xl-3 col-lg-4 col-6">
//                       <PostLoader />
//                     </div>
//                     <div className="col-xl-3 col-lg-4 col-6">
//                       <PostLoader />
//                     </div>
//                   </div>
//                 ) : loading === false && products.length == 0 ? (
//                   <Col xs="12">
//                     <div className="my-5">
//                       <div className="col-sm-12 empty-cart-cls text-center">
//                         <img
//                           alt="category wise banner"
//                           src="/assets/images/ErrorImages/file.png"
//                           className="img-fluid mb-4 mx-auto"
//                         />
//                         <h4
//                           style={{ fontSize: 22, fontWeight: "600" }}
//                           className="px-5"
//                         >
//                           Sorry, there are no products available right now.
//                         </h4>
//                         <h4 style={{ fontSize: 15 }}>
//                           Please check back later or explore other options.
//                         </h4>
//                       </div>
//                     </div>
//                   </Col>
//                 ) : (
//                   // null
//                   products.map((product, i) => (
//                     <>
//                       <Col xs="12" key={i}>
//                         {/* <VehicleCard
//                           product={{
//                             vehicleName: product.vehicleName || "Vehicle",
//                             imageUrl:
//                               product.image ||
//                               "/assets/images/vehicle-placeholder.jpg",
//                             price: product?.price || 0,
//                             originalPrice: product.originalPrice,
//                             discountPercentage: product.discountPercentage || 6,
//                             ratings: product.rating || 4.3,
//                             seats: product?.passengeCount || 4,
//                             hasAC: product.isAC || true,
//                             bags: product?.luggageCount || 1,
//                             taxesAndCharges: product.taxesAndCharges || 1037,
//                             description: product?.description,
//                             currency: product?.unit || "USD",
//                           }}
//                           addToCart={() => handleAddToCart(product)}
//                         /> */}
//                            <ProductItems
//                                                              product={product}
//                                                              productImage={product.image}
//                                                              description={product?.description}
//                                                              productstype={"transport"}
//                                                              title={product?.vehicleName}
//                                                              productcurrency={product?.unit}
//                                                              rating={4}
//                                                              addWishlist={() =>
//                                                                contextWishlist.addToWish(product)
//                                                              }
//                                                              addCart={() =>
//                                                               handleAddToCart(product, passengerCount)
//                                                              }
//                                                             //  addCompare={() =>
//                                                             //    comapreList.addToCompare(product)
//                                                             //  }
//                                                              cartClass={"cart-info cart-wrap"}
//                                                              backImage={false}
//                                                              cart = {cartObj}
//                                                            />
//                       </Col>
//                     </>
//                   ))
//                 )}
//               </Row>
//             </Container>
//           </div>
//         </section>
//       </CommonLayout>

//       <ModalBase
//         isOpen={modelPickupAndDrop}
//         title={"Select Pickup and Drop location"}
//         toggle={() => {
//           setModelPickupAndDrop(false);
//         }}
//         size="l"
//       >
//         <Form onSubmit={handleSubmit}>
//           {/* Transport Type Selection */}
//           <FormGroup tag="fieldset" className="mb-4">
//             <h4>Transport Type</h4>
//             <FormGroup check>
//               <Label check>
//                 <Input
//                   type="radio"
//                   name="transportType"
//                   value="oneway"
//                   checked={transportType === "oneway"}
//                   onChange={(e) => setTransportType(e.target.value)}
//                 />{" "}
//                 One Way
//               </Label>
//             </FormGroup>
//             <FormGroup check>
//               <Label check>
//                 <Input
//                   type="radio"
//                   name="transportType"
//                   value="hourly"
//                   checked={transportType === "hourly"}
//                   onChange={(e) => setTransportType(e.target.value)}
//                 />{" "}
//                 Hourly
//               </Label>
//             </FormGroup>
//           </FormGroup>

//           {/* Pickup Location - With search icon and suggestions */}
//           <FormGroup>
//             <Label for="pickupLocation">Pickup Location</Label>
//             <div className="input-group">
//               <Input
//                 type="text"
//                 name="pickupLocation"
//                 id="pickupLocation"
//                 placeholder="Enter pickup location"
//                 value={pickup}
//                 onChange={(e) => setPickup(e.target.value)}
//                 required
//               />
//               <div className="input-group-append">
//                 <Button
//                   color="secondary"
//                   onClick={() => getLocation(pickup, "pickup")}
//                 >
//                   <SearchIcon />
//                 </Button>
//               </div>
//             </div>

//             {/* Pickup Suggestions Dropdown */}
//             {pickupSuggestions.length > 0 && (
//               <div className="location-suggestions">
//                 <ul className="list-group mt-2">
//                   {pickupSuggestions.map((location) => (
//                     <li
//                       key={location._id}
//                       className="list-group-item list-group-item-action"
//                       onClick={() => handleLocationSelect(location, "pickup")}
//                     >
//                       {location.name}, {location.cityName}, {location.country}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </FormGroup>

//           {/* Drop Location - Only shown for oneway, with search icon and suggestions */}
//           {transportType === "oneway" && (
//             <FormGroup>
//               <Label for="dropLocation">Drop Location</Label>
//               <div className="input-group">
//                 <Input
//                   type="text"
//                   name="dropLocation"
//                   id="dropLocation"
//                   placeholder="Enter drop location"
//                   value={drop}
//                   onChange={(e) => setDrop(e.target.value)}
//                   required
//                 />
//                 <div className="input-group-append">
//                   <Button
//                     color="secondary"
//                     onClick={() => getLocation(drop, "drop")}
//                   >
//                     <SearchIcon />
//                   </Button>
//                 </div>
//               </div>

//               {/* Drop Suggestions Dropdown */}
//               {dropSuggestions.length > 0 && (
//                 <div className="location-suggestions">
//                   <ul className="list-group mt-2">
//                     {dropSuggestions.map((location) => (
//                       <li
//                         key={location._id}
//                         className="list-group-item list-group-item-action"
//                         onClick={() => handleLocationSelect(location, "drop")}
//                       >
//                         {location.name}, {location.cityName}, {location.country}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}
//             </FormGroup>
//           )}
//           {/* Date and Time Selection */}
//           <Row>
//             <Col md={6}>
//               <FormGroup>
//                 <Label for="travelDate">Travel Date</Label>
//                 <div className="datepicker-container">
//                   <DatePicker
//                     id="travelDate"
//                     onChange={setTravelDate}
//                     value={travelDate}
//                     minDate={new Date()}
//                     format="MMMM d, yyyy"
//                     required
//                     clearIcon={null}
//                   />
//                 </div>
//               </FormGroup>
//             </Col>
//             <Col md={6}>
//               <FormGroup>
//                 <Label for="travelTime">Travel Time</Label>
//                 <TimePicker
//                   id="travelTime"
//                   onChange={setTravelTime}
//                   value={travelTime}
//                   className="form-control"
//                   clearIcon={null}
//                   required
//                 />
//               </FormGroup>
//             </Col>
//           </Row>

//           {/* Passenger Count */}
//           <FormGroup className="mb-4">
//             <Label for="passengerCount">Passengers</Label>
//             <div className="d-flex align-items-center">
//               <Button
//                 type="button"
//                 color="light"
//                 className="mr-3"
//                 onClick={decrementPassengers}
//               >
//                 <RemoveIcon />
//               </Button>
//               <div className="passenger-count px-4 py-2 border rounded">
//                 {passengerCount}
//               </div>
//               <Button
//                 type="button"
//                 color="light"
//                 className="ml-3"
//                 onClick={incrementPassengers}
//               >
//                 <AddIcon />
//               </Button>
//             </div>
//           </FormGroup>

//           <Button color="primary" type="submit" className="mt-3">
//             Submit
//           </Button>
//         </Form>
//       </ModalBase>

//         <ModalBase isOpen={openTravelBuddy} toggle={handleCloseTravelBuddy} title="Choose Your Buddies" size='md'>
//                           <BuddyModal handleTravelBuddies={handleTravelBuddies} adultDetails={adultDetails} childsDetails={childsDetails} 
//                           adultCount={passengerCount} 
//                           childCount={0}
//                           providerlife={"globaltix"}
//                         //   childCount={customerData.student_type === 'Children' ? '1' : '0'}
//                            >

//                           </BuddyModal>
//         </ModalBase>
      
//         <ModalBase isOpen={cartModal} toggle={handleOnAddLifestyle} title="Select Your Cart" size='md'>
//           <CartContainer cartCategory={"Lifestyle"} />
//         </ModalBase>

      
   
//     <style jsx>{`
//       .transport-booking-bar {
//         background: linear-gradient(to right, #ffffff, #f8f9fa);
//         border-radius: 12px;
//         box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
//         padding: 24px;
//         margin-bottom: 40px;
//         transition: all 0.3s ease;
//       }
      
//       .booking-title {
//         font-size: 24px;
//         font-weight: 700;
//         color: #333;
//         margin-bottom: 20px;
//         text-align: center;
//       }
      
//       .booking-tabs {
//         display: flex;
//         justify-content: center;
//         margin-bottom: 24px;
//         border-bottom: 1px solid #e9ecef;
//         padding-bottom: 12px;
//       }
      
//       .booking-tab {
//         display: flex;
//         align-items: center;
//         padding: 10px 20px;
//         margin: 0 8px;
//         border-radius: 50px;
//         cursor: pointer;
//         transition: all 0.2s ease;
//         font-weight: 600;
//         color: #6c757d;
//         background-color: #f8f9fa;
//       }
      
//       .tab-icon {
//         margin-right: 8px;
//         font-size: 16px;
//       }
      
//       .booking-tab.active {
//         background-color: #007bff;
//         color: white;
//       }
      
//       .booking-container {
//         display: flex;
//         flex-wrap: wrap;
//         gap: 20px;
//         margin-bottom: 24px;
//       }
      
//       .booking-option {
//         flex: 1 1 240px;
//         position: relative;
//       }
      
//       .input-wrapper {
//         position: relative;
//       }
      
//       label {
//         display: flex;
//         align-items: center;
//         font-size: 12px;
//         font-weight: 600;
//         color: #6c757d;
//         margin-bottom: 8px;
//         text-transform: uppercase;
//       }
      
//       .label-icon {
//         margin-right: 8px;
//         font-size: 14px;
//       }
      
//       .booking-input,
//       .booking-date-picker,
//       .booking-time-picker {
//         width: 100%;
//         height: 48px;
//         padding: 8px 16px;
//         border: 1px solid #ced4da;
//         border-radius: 8px;
//         font-size: 15px;
//         transition: all 0.2s;
//         background-color: white;
//       }
      
//       .booking-input:focus {
//         border-color: #007bff;
//         box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.15);
//         outline: none;
//       }
      
//       .react-date-picker__wrapper,
//       .react-time-picker__wrapper {
//         border: 1px solid #ced4da !important;
//         border-radius: 8px;
//         height: 48px;
//         padding: 0 12px;
//       }
      
//       .location-search-btn {
//         position: absolute;
//         right: 8px;
//         top: 12px;
//         background: transparent;
//         border: none;
//         color: #007bff;
//         cursor: pointer;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         padding: 4px;
//       }
      
//       .location-suggestions {
//         position: absolute;
//         width: 100%;
//         max-height: 240px;
//         overflow-y: auto;
//         background-color: white;
//         border: 1px solid #e9ecef;
//         border-radius: 8px;
//         z-index: 1000;
//         margin-top: 4px;
//         box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//       }
      
//       .suggestions-list {
//         list-style: none;
//         padding: 0;
//         margin: 0;
//       }
      
//       .suggestions-list li {
//         padding: 12px 16px;
//         cursor: pointer;
//         border-bottom: 1px solid #f8f9fa;
//         transition: background-color 0.2s;
//       }
      
//       .suggestions-list li:hover {
//         background-color: #f8f9fa;
//       }
      
//       .suggestions-list li:last-child {
//         border-bottom: none;
//       }
      
//       .passenger-option {
//         flex: 0 0 200px;
//       }
      
//       .passenger-control {
//         display: flex;
//         align-items: center;
//         justify-content: space-between;
//         height: 48px;
//         border: 1px solid #ced4da;
//         border-radius: 8px;
//         overflow: hidden;
//         background-color: white;
//       }
      
//       .passenger-btn {
//         background: #f8f9fa;
//         border: none;
//         width: 48px;
//         height: 100%;
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         cursor: pointer;
//         transition: all 0.2s;
//       }
      
//       .passenger-btn:hover {
//         background: #e9ecef;
//       }
      
//       .passenger-btn:active {
//         background: #dee2e6;
//       }
      
//       .passenger-btn.decrement {
//         border-right: 1px solid #ced4da;
//       }
      
//       .passenger-btn.increment {
//         border-left: 1px solid #ced4da;
//       }
      
//       .passenger-btn:disabled {
//         opacity: 0.5;
//         cursor: not-allowed;
//       }
      
//       .passenger-count {
//         flex: 1;
//         text-align: center;
//         font-weight: 600;
//         font-size: 16px;
//       }
      
//       .booking-footer {
//         display: flex;
//         justify-content: center;
//       }
      
//       .search-btn {
//         background-color: #007bff;
//         color: white;
//         font-weight: 600;
//         font-size: 16px;
//         border: none;
//         border-radius: 8px;
//         padding: 12px 36px;
//         cursor: pointer;
//         transition: all 0.3s;
//         text-transform: uppercase;
//         letter-spacing: 1px;
//         min-width: 240px;
//       }
      
//       .search-btn:hover {
//         background-color: #0069d9;
//         transform: translateY(-2px);
//         box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
//       }
      
//       .search-btn:active {
//         transform: translateY(0);
//       }
      
//       @media (max-width: 992px) {
//         .booking-container {
//           flex-direction: column;
//           gap: 16px;
//         }
        
//         .booking-option {
//           width: 100%;
//           flex: none;
//         }
        
//         .passenger-option {
//           width: 100%;
//           flex: none;
//         }
//       }
      
//       @media (max-width: 768px) {
//         .booking-tabs {
//           flex-direction: row;
//           flex-wrap: wrap;
//           justify-content: center;
//         }
        
//         .booking-tab {
//           margin: 4px;
//         }
        
//         .search-btn {
//           width: 100%;
//         }
//       }
//     `}</style>

//     </>
//   );
// };

// export default TransportMainPage;
