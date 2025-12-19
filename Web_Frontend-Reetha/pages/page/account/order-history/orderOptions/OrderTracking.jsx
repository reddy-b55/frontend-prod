import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckIcon from '@mui/icons-material/Check';
import PhoneIcon from '@mui/icons-material/Phone';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import PaymentIcon from '@mui/icons-material/Payment';
import SyncIcon from '@mui/icons-material/Sync';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PendingTwoToneIcon from '@mui/icons-material/PendingTwoTone';

// Icon components (you can replace these with your preferred icon library)
const MaterialIcon = ({ name, size = 20, color = "#000", style = {} }) => (
  <span style={{ fontSize: size, color, ...style }}>
    {name === "shopping-cart" && "🛒"}
    {name === "cancel" && <CloseIcon />}
    {name === "account-balance-wallet" && <PaymentIcon />}
    {name === "sync" && <SyncIcon />}
    {name === "verified" && "✅"}
    {name === "done-all" && "✔️"}
    {name === "check-circle" && <CheckIcon />}
    {name === "radio-button-checked" && "●"}
    {name === "radio-button-unchecked" && <PendingTwoToneIcon />}
    {name === "access-time" && <AccessTimeIcon />}
    {name === "receipt" && <ReceiptLongIcon />}
    {name === "info-outline" && <HelpOutlineIcon/>}
    {name === "arrow-back" && "←"}
  </span>
);

const MaterialCommunityIcon = ({ name, size = 30, color = "#000" }) => (
  <span style={{ fontSize: size, color }}>
    {name === "whatsapp" && <PhoneIcon />}
  </span>
);

const colors = {
  PRIMARY: "#ff4d4d",
};

function TrackOrder({orderId, orderData, currency, checkoutId}) {
  const router = useRouter();

  console.log("Order Data in Tracking Component123333:", orderData);
//   const { orderId, orderData, currency, checkoutId } = router.query || {};
  
  // Parse orderData if it's a string
  const parsedOrderData = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;

  const [loading, setLoading] = useState(true);
  const [trackingSteps, setTrackingSteps] = useState([]);

  const handleWhatsApp = () => {
    const phoneNumber = "+94711744227";

    const orderIdText =
      parsedOrderData?.OrderId || parsedOrderData?.checkout_id || orderId || "N/A";
    const message = `Hi! I'm having trouble with order #${orderIdText}. There seems to be a booking error. Can you please help me? Thanks!`;

    const encodedMessage = encodeURIComponent(message);

    const universalURL = `https://wa.me/${phoneNumber.replace(
      "+",
      ""
    )}?text=${encodedMessage}`;

    window.open(universalURL, '_blank');
  };

  const getDynamicTrackingSteps = (status, deliveryStatus, serviceDate) => {
    const today = moment();
    const serviceMoment = serviceDate ? moment(serviceDate) : null;
    const isServiceCompleted = serviceMoment ? serviceMoment.isBefore(today, 'day') || serviceMoment.isSame(today, 'day') : false;
    const isDelivered = deliveryStatus === "delivered" || deliveryStatus === "Delivered";
    
    const baseSteps = [
      {
        id: 1,
        title: "Order Placed",
        description: "Your order has been successfully placed",
        status: "completed",
        icon: "shopping-cart",
      },
    ];

    if (status === "Cancel") {
      return [
        ...baseSteps,
        {
          id: 2,
          title: "Cancelled",
          description: "Your order has been cancelled",
          status: "cancelled",
          icon: "cancel",
        },
      ];
    } else if (status === "Refund") {
      return [
        ...baseSteps,
        {
          id: 2,
          title: "Refunded",
          description: "Your order has been refunded",
          status: "cancelled",
          icon: "account-balance-wallet",
        },
      ];
    } else if (status === "Completed" && (isServiceCompleted || isDelivered)) {
      return [
        ...baseSteps,
        {
          id: 2,
          title: "Ongoing",
          description: "Your order was being processed",
          status: "completed",
          icon: "sync",
        },
        {
          id: 3,
          title: "Reconfirmed",
          description: "Your booking has been reconfirmed",
          status: "completed",
          icon: "verified",
        },
        {
          id: 4,
          title: "Completed",
          description: "Your service has been successfully completed",
          status: "completed",
          icon: "done-all",
        },
      ];
    } else {
      const steps = [
        ...baseSteps,
        {
          id: 2,
          title: "Ongoing",
          description: "Your order is currently being processed",
          status: "current",
          icon: "sync",
        },
      ];

      if (deliveryStatus === "Pending" || status === "Completed") {
        steps[1].status = "completed";
        steps.push({
          id: 3,
          title: "Reconfirmed",
          description: "Your booking has been reconfirmed",
          status: "completed",
          icon: "verified",
        });
        
        if (isServiceCompleted || isDelivered) {
          steps.push({
            id: 4,
            title: "Completed",
            description: "Your service has been completed",
            status: "completed",
            icon: "done-all",
          });
        } else {
          steps.push({
            id: 4,
            title: "Completed",
            description: serviceMoment ?
              `Your service is scheduled for ${serviceMoment.format("MMM DD, YYYY")}` :
              "Your experience will be completed soon",
            status: "current",
            icon: "done-all",
          });
        }
      } else if (deliveryStatus === null || deliveryStatus === undefined) {
        steps.push({
          id: 3,
          title: "Reconfirmed",
          description: "Waiting for booking reconfirmation",
          status: "pending",
          icon: "verified",
        });
        steps.push({
          id: 4,
          title: "Completed",
          description: serviceMoment ?
            `Scheduled for ${serviceMoment.format("MMM DD, YYYY")}` :
            "Your experience will be completed soon",
          status: "pending",
          icon: "done-all",
        });
      } else {
        steps[1].status = "completed";
        steps.push({
          id: 3,
          title: "Reconfirmed",
          description: "Waiting for booking reconfirmation",
          status: "current",
          icon: "verified",
        });
        steps.push({
          id: 4,
          title: "Completed",
          description: serviceMoment ?
            `Scheduled for ${serviceMoment.format("MMM DD, YYYY")}` :
            "Your experience will be completed soon",
          status: "pending",
          icon: "done-all",
        });
      }

      return steps;
    }
  };

  useEffect(() => {
    if (parsedOrderData?.status) {
      setTrackingSteps(
        getDynamicTrackingSteps(
          parsedOrderData.status,
          parsedOrderData.delivery_status,
          parsedOrderData.delivery_date || parsedOrderData.service_date
        )
      );
    }

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  }, [parsedOrderData]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "current":
        return "#FF9800";
      case "cancelled":
        return "#f44336";
      case "pending":
        return "#E0E0E0";
      default:
        return "#E0E0E0";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "check-circle";
      case "current":
        return "radio-button-checked";
      case "pending":
        return "radio-button-unchecked";
      default:
        return "radio-button-unchecked";
    }
  };

  const renderTrackingStep = (step, index) => {
    const isLast = index === trackingSteps.length - 1;
    const statusColor = getStatusColor(step.status);

    return (
      <div key={step.id} style={{
        display: 'flex',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginRight: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: statusColor
          }}>
            <MaterialIcon
              name={step.status === "current" ? "access-time" : getStatusIcon(step.status)}
              size={20}
              color="white"
            />
          </div>
          {!isLast && (
            <div style={{
              width: '2px',
              height: '30px',
              marginTop: '4px',
              backgroundColor: step.status === "completed" ? "#4CAF50" : "#E0E0E0"
            }} />
          )}
        </div>

        <div style={{
          flex: 1,
          paddingTop: '4px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              flex: 1,
              margin: 0
            }}>
              {step.title}
            </h3>
            {step.status === "current" && (
              <span style={{
                backgroundColor: '#FF9800',
                padding: '2px 8px',
                borderRadius: '12px',
                color: 'white',
                fontSize: '10px',
                fontWeight: '600'
              }}>
                Current
              </span>
            )}
          </div>
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '4px',
            margin: 0
          }}>
            {step.description}
          </p>
          {step.date && (
            <p style={{
              fontSize: '12px',
              color: '#999',
              margin: 0
            }}>
              {step.date}
            </p>
          )}
        </div>
      </div>
    );
  };

  const getStatusDisplayInfo = (status) => {
    switch (status) {
      case "Approved":
        return { text: "Ongoing", color: "#FF9800" };
      case "Completed":
        return { text: "Completed", color: "#4CAF50" };
      case "Cancel":
        return { text: "Cancelled", color: "#f44336" };
      case "Refund":
        return { text: "Refunded", color: "#6eaaff" };
      case "CustomerOrdered":
        return { text: "Processing", color: "#2196F3" };
      case "ManualConfirmed":
        return { text: "Confirmed", color: "#4CAF50" };
      case "Pending":
        return { text: "Pending", color: "#FF9800" };
      default:
        return { text: status || "Processing", color: "#FF9800" };
    }
  };

  const renderOrderSummary = () => {
    const statusInfo = getStatusDisplayInfo(parsedOrderData?.status);

    return (
      <div style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderTop: `3px solid ${colors.PRIMARY}`,
        height: 'fit-content'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <MaterialIcon name="receipt" size={24} color={colors.PRIMARY} />
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginLeft: '8px',
            margin: 0
          }}>
           &nbsp; Order Summary
          </h2>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '500'
          }}>
            Order ID:
          </span>
          <span style={{
            fontSize: '14px',
            color: '#333',
            fontWeight: '600'
          }}>
            {parsedOrderData?.OrderId || parsedOrderData?.checkout_id || orderId}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 0',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '500'
          }}>
            Status:
          </span>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: statusInfo.color
          }}>
            {statusInfo.text}
          </span>
        </div>

        {parsedOrderData?.delivery_date && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: '500'
            }}>
              Service Date:
            </span>
            <span style={{
              fontSize: '14px',
              color: '#333',
              fontWeight: '600'
            }}>
              {moment(parsedOrderData.delivery_date).format("MMM DD, YYYY")}
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderInfoContainer = () => (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderTop: `3px solid ${colors.PRIMARY}`
    }}>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          {/* <MaterialIcon name="info-outline" size={22} color={colors.PRIMARY} /> */}
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginLeft: '8px',
            margin: 0
          }}>
            Need Help?
          </h3>
        </div>
        <p style={{
          fontSize: '14px',
          color: '#666',
          lineHeight: '22px',
          marginBottom: '12px'
        }}>
          Tracking information is updated in real-time. If you have any questions about your order or need assistance, our support team is here to help you.
        </p>
        
        <div style={{
          marginTop: 0
        }}>
          <button
            onClick={handleWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.PRIMARY,
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              width: '100%',
              boxShadow: `0 2px 4px rgba(33, 150, 243, 0.2)`
            }}
          >
            <MaterialCommunityIcon name="whatsapp" size={20} color="white" />
            <span style={{ marginLeft: '8px' }}>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
          height: "calc(85vh - 200px)",
        backgroundColor: '#f5f7fa'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.PRIMARY}`,
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} /> 
        <p style={{
          marginTop: '16px',
          fontSize: '16px',
          color: '#666'
        }}>
          Loading tracking information...
        </p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
    //   minHeight: '100vh',
      backgroundColor: '#ffffffff',
     height: "calc(85vh - 200px)",
    overflowX: "hidden",
    // overflowY: "auto",
    }}>
      {/* Main Content Row - Two Columns */}
      <div style={{
        display: 'flex',
        gap: '16px',
        margin: '16px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        {/* Left Column - Order Summary & Need Help */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Order Summary */}
          {renderOrderSummary()}
          
          {/* Need Help Section */}
          {renderInfoContainer()}
        </div>

        {/* Right Column - Order Progress */}
        <div style={{
          flex: '2',
          minWidth: '400px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderTop: `3px solid ${colors.PRIMARY}`,
            height: 'fit-content'
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '20px'
            }}>
              Order Progress
            </h2>
            {trackingSteps.map((step, index) => renderTrackingStep(step, index))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackOrder;