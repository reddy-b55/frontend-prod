import React, {useContext, useEffect, useState} from 'react';
import { getOrderHistory } from "../../../../AxiosCalls/UserServices/UserCartservices";
import { AppContext } from '../../../_app';
import { Container } from 'reactstrap';
import OrderWiseOrderCard from './OrderWiseOrderCard';
import { Spinner } from 'react-bootstrap';

const OrderWise = (status, key) => {

      const { userId, baseCurrencyValue } = useContext(AppContext);
      const [orders, setOrders] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
        const fetchData = async () => {
          if (!userId) return;
    
          setLoading(true);
          try {
            const response = await getOrderHistory(userId, "All");
            if (response?.data?.query_data2) {
              // console.log("Orders fetched successfully:", response.data);
              setOrders(response.data.query_data2);
            }
          } catch (error) {
            console.error("Error fetching orders:", error);
          } finally {
            setLoading(false);
          }
        };
        fetchData();
      }, [userId, status, key]);


    return (
        <Container fluid className="p-0">
            {/* {
                orders && orders.length > 0 ? (
                    <div className="row">
                        {orders.map((order, index) => (
                            <OrderWiseOrderCard key={index} order={order} currency={baseCurrencyValue} /> // Assuming OrderWiseOrderCard is a component that takes an order prop
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-5">
                        <h2>No Orders Found</h2>
                    </div>
                )
            } */}

            {
              loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}>
                  <Spinner animation="border" size="sm" />
                </div>
            ):(
              orders && orders.length > 0 ? (
                    <div className="row">
                        {orders.map((order, index) => (
                            <OrderWiseOrderCard key={index} order={order} currency={baseCurrencyValue} /> 
                        ))}
                    </div>
                ) : (
                    <div className="text-center mt-5">
                        <h2>No Orders Found</h2>
                    </div>
                )
            )
            }
        </Container>
    );
};

export default OrderWise;