import { useRouter } from 'next/router';
import React, { use, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import CommonLayout from '../../../../../../components/shop/common-layout';
import Head from 'next/head';
import { AppContext } from '../../../../../_app';
import ProductCard from '../../OrderProductCard';
import { getOrderHistory } from '../../../../../../AxiosCalls/UserServices/UserCartservices';
import OrderWiseOrderCard from '../../OrderWiseOrderCard';
import { Button } from 'reactstrap';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


// Styles object
const styles = {
    detailsContainer: {
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0',
    },
    loadingIndicator: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666',
    },
    emptyStateMessage: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '16px',
        color: '#666',
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
    },
};

const OrderViewPage = () => {

    const router = useRouter();
    const { orderid } = router.query;
    const { baseCurrencyValue, userId } = useContext(AppContext);
    const [order, setOrder] = useState(null);
    const [orderProducts, setOrderProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);

    // Handle currency properly - extract symbol if it's an object
    const currency = baseCurrencyValue?.symbol || baseCurrencyValue || 'USD';

    useEffect(() => {
        if (orderid) {
            showOrderProducts();
            fetchData();
        }
    }, [orderid, userId]);

    const fetchData = async () => {
        if (!userId) return;
        try {
            const response = await getOrderHistory(userId, "All");
            if (response?.data?.query_data2) {
                console.log("Orders fetched successfully:", response.data.query_data2);
                const matchedOrder = response.data.query_data2.find(
                    (orderObj) => String(orderObj.OrderId) === String(orderid)
                );
                if (matchedOrder) {
                    console.log('match order', matchedOrder)
                    setOrders(matchedOrder);
                }
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const showOrderProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`getOrderDetailsByOrderID/${orderid}`);
            if (response.data.status === 200) {
                console.log("Order products fetched successfully:", response.data.dataSet);
                setOrderProducts(response.data.dataSet);

                // Set order information from the first product (they should all have same order info)
                if (response.data.dataSet && response.data.dataSet.length > 0) {
                    setOrder(response.data.dataSet[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching order products:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Aahaas - Order View</title>
            </Head>

            <CommonLayout parent="order-View" title="Order Details">
                
           
                    <Button color="light" className="back-btn" onClick={() => router.back()} style={{marginTop: '20px'}}>
                        <ArrowBackIcon fontSize="small" /> Back to Orders
                    </Button>
            

                <div style={styles.detailsContainer}>
                    <div className="row">
                        <OrderWiseOrderCard key={1} order={orders} currency={baseCurrencyValue} viewExpand={false} />
                    </div>
                    {loading ? (
                        <div style={styles.loadingIndicator}>Loading order products...</div>
                    ) : (
                        <>
                            {orderProducts.length > 0 ? (
                                orderProducts.map((product, index) => (
                                    <ProductCard
                                        key={index}
                                        product={product}
                                        order={order}
                                        currency={currency}
                                        index={index}
                                        isLast={index === orderProducts.length - 1}
                                        totalProducts={orderProducts.length}
                                    />
                                ))
                            ) : (
                                <div style={styles.emptyStateMessage}>
                                    No products found for this order.
                                </div>
                            )}
                        </>
                    )}
                </div>
            </CommonLayout>
        </>
    )
}

export default OrderViewPage;