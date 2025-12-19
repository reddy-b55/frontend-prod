// --index.js--
import Head from "next/head";
import React, { useContext, useEffect, useState } from "react";
import CommonLayout from "../../../../components/shop/common-layout";
import { Button, Col, Container, Row, Tab, Tabs } from "react-bootstrap";
import Orders from "./Orders";
import styles from "./OrderHistory.module.css";
import Modal from "react-bootstrap/Modal";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import { it } from "date-fns/locale";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { AppContext } from "../../../_app";
import moment from 'moment';
import OrderWise from "./OrderWise";
import ListAltIcon from '@mui/icons-material/ListAlt';
import { getOrderHistory } from "../../../../AxiosCalls/UserServices/UserCartservices";
import ServiceDateRangePicker from "../Craft-My-Adventure/ServiceDateRangePicker ";

function index() {
  const [key, setKey] = useState("all");
  const [key2, setKey2] = useState("order");
  const [itineraryStartDate, setItineraryStartDate] = useState(new Date());
  const [itineraryEndDate, setItineraryEndDate] = useState(new Date());
  const [show, setShow] = useState(false);

  const router = useRouter();
  const { userId } = useContext(AppContext);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [uniqueDates, setUniqueDates] = useState([]);
  useEffect(() => {
  const fetchData = async () => {
    if (!userId) return;
    try {
      const response = await getOrderHistory(userId, "All");
      if (response?.data?.query_data2) {
        console.log("Unique booking dates:", response?.data?.upcoming_service_dates);
        const uniqueDates = [...new Set(
          response.data.query_data2
            .map(order => {
              if (order.BookedDay) {
                return order.BookedDay.split(' ')[0];
              }
              return null;
            })
            .filter(date => date !== null) 
        )].sort();
        setUniqueDates(response?.data?.upcoming_service_dates);
        // setUniqueDates({...uniqueDates, pastServices: uniqueDates });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
    }
  };
  fetchData();
}, [userId, key]);
  // In your parent component, fix the data structure before passing to the date picker
// useEffect(() => {
//   const fetchData = async () => {
//     if (!userId) return;

//     setLoading(true);
//     try {
//       const response = await getOrderHistory(userId, "All");
//       if (response?.data?.query_data2) {
//         console.log("Orders fetched successfully:", response.data.query_data2);

//         // Extract unique dates and categorize them
//         const currentDate = new Date();
//         currentDate.setHours(0, 0, 0, 0);

//         const upcomingDates = [];
//         const pastDates = [];

//         const uniqueDateStrings = [...new Set(
//           response.data.query_data2
//             .map(order => {
//               if (order.BookedDay) {
//                 return order.BookedDay.split(' ')[0];
//               }
//               return null;
//             })
//             .filter(date => date !== null)
//         )];

//         // Categorize dates as upcoming or past
//         uniqueDateStrings.forEach(dateStr => {
//           const orderDate = new Date(dateStr);
//           orderDate.setHours(0, 0, 0, 0);
          
//           if (orderDate >= currentDate) {
//             upcomingDates.push(dateStr);
//           } else {
//             pastDates.push(dateStr);
//           }
//         });

//         // IMPORTANT: Set the data in the correct format
//         setUniqueDates({
//           upComingServices: upcomingDates.sort(), // Make sure this is an array
//           pastServices: pastDates.sort(), // Make sure this is an array
//         });

//         console.log("Properly formatted dates:", {
//           upComingServices: upcomingDates,
//           pastServices: pastDates
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchData();
// }, [userId, key]);

  const handleDateSelect = (date, type) => {
    if (type === "start") {
      if (itineraryEndDate === null || date <= itineraryEndDate) {
        setItineraryStartDate(date);
      } else {
        toast.error("Start date should be less than end date");
      }
    } else {
      if (itineraryStartDate === null || date >= itineraryStartDate) {
        setItineraryEndDate(date);
      } else {
        toast.error("End date should be greater than start date");
      }
    }
  };

  const handleItenaryCrete = (start,end) => {
    console.log("Selected start date:", start, end);
    if (start === null || end === null) {
      toast.error("Please select start and end date");
    } else {
      if (start > end) {
        toast.error("Start date should be less than end date");
      }
      else {
        router.push({
          pathname: "Craft-My-Adventure",
          query: {
            id: userId,
            start_date: moment(start).format("YYYY-MM-DD"),
            end_date: moment(end).format("YYYY-MM-DD"),
          },
        });
      }
    }
  };

  // Custom tab title component
  const CustomTabTitle = ({ title, active }) => (
    <span className={`${styles.tabButton} ${active ? styles.activeTab : ""}`}>
      {title}
    </span>
  );

    const handleDateRangeSelect = (dateRange) => {
    console.log("Selected date range:", dateRange);
    setSelectedDateRange(dateRange);
  };

  const handleProceed = (dateRange) => {
    console.log("Proceeding with date range:", dateRange);
    // setShowDatePicker(false);
    // Handle the selected date range - generate itinerary, etc.
  };

  return (
    <div>
      <Head>
        <title>Aahaas - Order History</title>
      </Head>

      <CommonLayout parent="Home" title="Order History">
        <section className="notification-section">
          <div className="d-flex justify-content-between align-items-center w-100">
            <Button variant="dark" onClick={handleShow} className="btn btn-sm btn-solid" style={{ marginLeft: "auto", marginRight: "1rem", marginTop: "2rem", marginRight: "5rem" }}>
              Craft My Adventure
            </Button>
          </div>
          <Container>

            <Tabs
              id="controlled-tab-example"
              activeKey={key2}
              onSelect={(k) => setKey2(k)}
            >
              {/* <Tab
                eventKey="order"
                title={<CustomTabTitle title="Order" active={key2 === "order"} />}
              >
                <Tabs
              id="controlled-tab-example"
              activeKey={key}
              onSelect={(k) => setKey(k)}
            >

              <Tab
                eventKey="all"
                title={<CustomTabTitle title="All" active={key === "all"} />}
              >
                <OrderWise status="pending" key={key} />
              </Tab>


            </Tabs>    
              </Tab> */}
              <Tab
                eventKey="order"
                title={<CustomTabTitle title={<ListAltIcon />} active={key2 === "product"} />}
              >
                <Tabs
                  id="controlled-tab-example"
                  activeKey={key}
                  onSelect={(k) => setKey(k)}
                >
                  {/* <Tab
                eventKey="all"
                title={<CustomTabTitle title="All" active={key === "all"} />}
              >
                <Orders status="pending" key={key} />
              </Tab> */}
                  <Tab
                    eventKey="all"
                    title={<CustomTabTitle title="All Orders" active={key === "all"} />}
                  >
                    <OrderWise status="pending" key={key} />
                  </Tab>
                  <Tab
                    eventKey="pending"
                    title={
                      <CustomTabTitle title="Pending" active={key === "pending"} />
                    }
                  >
                    <Orders status="pending" key={key} />
                  </Tab>
                  <Tab
                    eventKey="ongoing"
                    title={
                      <CustomTabTitle title="Ongoing" active={key === "ongoing"} />
                    }
                  >
                    <Orders status="ongoing" key={key} />
                  </Tab>
                  <Tab
                    eventKey="completed"
                    title={
                      <CustomTabTitle
                        title="Completed"
                        active={key === "completed"}
                      />
                    }
                  >
                    <Orders status="completed" key={key} />
                  </Tab>
                  <Tab
                    eventKey="cancelled"
                    title={
                      <CustomTabTitle
                        title="Cancelled"
                        active={key === "cancelled"}
                      />
                    }
                  >
                    <Orders status="cancelled" key={key} />
                  </Tab>
                </Tabs>
              </Tab>




            </Tabs>
          </Container>
        </section>
      </CommonLayout>
      <Modal
        show={show}
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Craft My Adventure</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* <Row>
            <Col>
              <label>Start Date</label>
            </Col>
            <Col>
              <label>End Date</label>
            </Col>
          </Row>
          <Row>
            <Col>
              <DatePicker
                className="form-control py-2"
                clearIcon={true}
                value={itineraryStartDate}
                onChange={(date) => handleDateSelect(date, "start")}
                format="yyyy-MM-dd"
              />
            </Col>
            <Col>
              <DatePicker
                className="form-control py-2"
                clearIcon={true}
                value={itineraryEndDate}
                onChange={(date) => handleDateSelect(date, "end")}
                format="yyyy-MM-dd"
              />
            </Col>
          </Row> */}
          <ServiceDateRangePicker
        upcomingDates={uniqueDates}
        // isOpen={show}
        // onClose={handleClose}
        onDateRangeSelect={handleItenaryCrete}
        // onProceed={handleItenaryCrete}
      />
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleClose}>
            Close
          </Button> */}
          {/* <Button variant="primary" onClick={handleItenaryCrete}>
            Proceed
          </Button> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default index;
