import React, { useState, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";

function InAppNotificationCard({ data, onUpdate, userId }) {
    const router = useRouter();
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [imageError, setImageError] = useState(false);
    const cardRef = useRef(null);
    const startX = useRef(0);

    const updateNotificationStatus = useCallback(() => {
        if (data?.notification_seen === "Unread") {
            axios.post(`add_notification_as_seen/${data?.id}`).then((response) => {
                if (response.data.status == 200 && onUpdate) {
                    onUpdate(); // Refresh the notifications list
                }
            }).catch((error) => {
                console.error("Failed to update notification status:", error);
            });
        }
    }, [data?.notification_seen, data?.id, onUpdate]);

    const deleteNotification = useCallback(() => {
        if (window.confirm("Are you sure you want to delete this notification?")) {
            axios
                .post("delete-notification-userwise", {
                    user_id: userId,
                    id: data?.id,
                })
                .then((response) => {
                    if (response.data.status === 200 && onUpdate) {
                        onUpdate();
                    }
                })
                .catch((error) => {
                    console.error("Failed to delete notification:", error);
                    setTranslateX(0);
                });
        } else {
            setTranslateX(0);
        }
    }, [userId, data?.id, onUpdate]);

    const handleMouseDown = (e) => {
        setIsDragging(true);
        startX.current = e.clientX;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        e.preventDefault();
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        startX.current = e.touches[0].clientX;
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX.current;
        setTranslateX(Math.min(0, deltaX)); // Only allow left swipe
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const deltaX = e.touches[0].clientX - startX.current;
        setTranslateX(Math.min(0, deltaX)); // Only allow left swipe
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // If swiped left more than 100 pixels, show delete confirmation
        if (translateX < -100) {
            deleteNotification();
        } else {
            // Reset position if not swiped far enough
            setTranslateX(0);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);

        // If swiped left more than 100 pixels, show delete confirmation
        if (translateX < -100) {
            deleteNotification();
        } else {
            // Reset position if not swiped far enough
            setTranslateX(0);
        }
    };

    const handleOnPressNotification = () => {

        updateNotificationStatus();

        let navigationPage = data?.notification_navigation_page;
        let navigationParams = data?.notification_navigation_params ? JSON.parse(data.notification_navigation_params) : null;

        // console.log(
        //     navigationPage,
        //     navigationParams,
        //     "Navigation parameters are the"
        // );
        console.log(
            data,
            "Navigation parameters are the"
        );
 const currentPath = router.pathname;
        switch (navigationPage) {
             case "Home":
            router.push(`/`);
            break;
        case "CartPageMeta":
        case "CustomerMainPage":
            // Check if we're already on the cart page
            if (currentPath.includes('cart-page')) {
                // Show loading and reload the page
                router.reload(); // This will reload the current page
            } else {
                router.push(`/page/account/cart-page`);
            }
            break;
        case "My Carts":
            if (currentPath.includes('profile') && router.query.page === 'my-carts') {
                router.reload();
            } else {
                router.push(`/page/account/profile?page=my-carts`);
            }
            break;
            case "CustomerMainPage":
                 router.push(`/page/account/cart-page`);
                break;
            case "OrderHistory":
                if (data?.notification_navigation_params) {
                    const navigationData = navigationParams;
                    router.push({
                        pathname: `/${data?.notification_navigation_stack}/${navigationPage}`,
                        query: navigationData,
                    });
                    router.push(`/page/account/profile?page=my-carts`);
                } else {
                    router.push(`/page/account/order-history`);
                }
                break;
            case "OrderMainView":
                 router.push(`/page/account/order-history`);
                break;
            case "OrderView":
                if (data?.notification_navigation_params) {
                    const navigationData = navigationParams;
                    router.push(`/page/account/order-history/${navigationData?.id}?main_category_id=${data?.category_id}`);
                } else {
                    null;
                }
                break;
        }
    };

    const formattedDate = useMemo(() => {
        return data?.push_at
            ? new Date(data.push_at).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            })
            : "";
    }, [data?.push_at]);

    const imageUrl = useMemo(() => {
        if (imageError) {
            return "/assets/images/aahaas_mono.png";
        }
        return data?.notification_image && data.notification_image.startsWith("http")
            ? data.notification_image.split(",")[0]
            : "/assets/images/aahaas_mono.png";
    }, [data?.notification_image, imageError]);

    const isExternalImage = useMemo(() => {
        return imageUrl.startsWith("http");
    }, [imageUrl]);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const notificationParameters = useMemo(() => {
        try {
            return typeof data?.notification_parameters === "string"
                ? JSON.parse(data.notification_parameters)
                : data?.notification_parameters || {};
        } catch (error) {
            console.error("Failed to parse notification parameters:", error);
            return {};
        }
    }, [data?.notification_parameters]);

    const isUnread = useMemo(() => {
        return data?.notification_seen === "Unread";
    }, [data?.notification_seen]);

    return (
        <div style={{
            position: "relative",
            overflow: "hidden"
        }}>
            <div
                ref={cardRef}
                style={{
                    zIndex: 1,
                    backgroundColor: "#fff",
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    willChange: isDragging ? 'transform' : 'auto'
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div
                    style={{
                        backgroundColor: isUnread ? "#f8f9ff" : "#fff",
                        marginLeft: "20px",
                        marginRight: "20px",
                        marginBottom: "0",
                        paddingTop: "12px",
                        paddingBottom: "12px",
                        cursor: "pointer",
                        borderLeft: isUnread ? "3px solid #1F96EE" : "3px solid transparent",
                        paddingLeft: "8px"
                    }}
                    onClick={handleOnPressNotification}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "flex-start"
                    }}>
                        <div style={{
                            width: "38px",
                            height: "38px",
                            marginRight: "12px",
                            position: "relative",
                            borderRadius: "25px",
                            backgroundColor: "#E5E5E5",
                            overflow: "hidden"
                        }}>
                            {isExternalImage ? (
                                <img
                                    src={imageUrl}
                                    alt="Notification"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "25px"
                                    }}
                                    onError={handleImageError}
                                />
                            ) : (
                                <img
                                    src={imageUrl}
                                    alt="Notification"
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                        borderRadius: "25px"
                                    }}
                                    onError={handleImageError}
                                />
                            )}
                        </div>

                        <div style={{
                            flex: 1,
                            paddingRight: "8px"
                        }}>
                            <div style={{
                                minHeight: "40px",
                                justifyContent: "center",
                                display: "flex",
                                flexDirection: "column"
                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center"
                                }}>
                                    <h4 style={{
                                        flex: 1,
                                        fontSize: "15px",
                                        fontWeight: isUnread ? "500" : "300",
                                        color: "#000",
                                        marginRight: "8px",
                                        margin: "0 0 4px 0",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                    }}>
                                        {data?.notification_title && data.notification_title.length > 32
                                            ? data.notification_title.substring(0, 32) + "..."
                                            : data?.notification_title}
                                    </h4>
                                    <p style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        lineHeight: "18px",
                                        marginBottom: "8px",
                                        marginRight: "55px",
                                        marginTop: "5px",
                                        margin: "5px 55px 8px 0",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}>
                                        {data?.notification_description}
                                    </p>
                                </div>
                                <div style={{
                                    position: "absolute",
                                    right: "20px",
                                    top: "62px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center"
                                }}>
                                    <span style={{
                                        fontSize: "12px",
                                        color: "#666",
                                        fontWeight: "400"
                                    }}>
                                        {formattedDate}
                                    </span>
                                    {isUnread && (
                                        <div style={{
                                            width: "7px",
                                            height: "7px",
                                            borderRadius: "3.5px",
                                            backgroundColor: "#FF3B30",
                                            marginTop: "15px",
                                            marginRight: "-25px"
                                        }} />
                                    )}
                                </div>
                            </div>

                            {data?.type === "MainOrderCard" && (
                                <div style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    marginTop: "4px"
                                }}>
                                    {notificationParameters?.date && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "#F0F0F0",
                                            paddingLeft: "8px",
                                            paddingRight: "8px",
                                            paddingTop: "4px",
                                            paddingBottom: "4px",
                                            borderRadius: "12px",
                                            marginRight: "6px",
                                            marginBottom: "4px"
                                        }}>
                                            <span style={{ marginRight: "4px", fontSize: "12px" }}>📅</span>
                                            <span style={{
                                                fontSize: "11px",
                                                color: "#666",
                                                fontWeight: "500"
                                            }}>
                                                {notificationParameters.date}
                                            </span>
                                        </div>
                                    )}

                                    {notificationParameters?.time && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "#F0F0F0",
                                            paddingLeft: "8px",
                                            paddingRight: "8px",
                                            paddingTop: "4px",
                                            paddingBottom: "4px",
                                            borderRadius: "12px",
                                            marginRight: "6px",
                                            marginBottom: "4px"
                                        }}>
                                            <span style={{ marginRight: "4px", fontSize: "12px" }}>⏰</span>
                                            <span style={{
                                                fontSize: "11px",
                                                color: "#666",
                                                fontWeight: "500"
                                            }}>
                                                {notificationParameters.time}
                                            </span>
                                        </div>
                                    )}

                                    {notificationParameters?.location && (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            backgroundColor: "#F0F0F0",
                                            paddingLeft: "8px",
                                            paddingRight: "8px",
                                            paddingTop: "4px",
                                            paddingBottom: "4px",
                                            borderRadius: "12px",
                                            marginRight: "6px",
                                            marginBottom: "4px"
                                        }}>
                                            <span style={{ marginRight: "4px", fontSize: "12px" }}>📍</span>
                                            <span style={{
                                                fontSize: "11px",
                                                color: "#666",
                                                fontWeight: "500"
                                            }}>
                                                {notificationParameters.location}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* <div style={{
        position: "absolute",
        right: "0",
        top: "0",
        bottom: "0",
        backgroundColor: "#FF3B30",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100px",
        flexDirection: "column",
        paddingLeft: "10px",
        paddingRight: "10px",
        marginLeft: "20px",
        marginRight: "20px"
      }}>
        <span style={{ fontSize: "24px", color: "#fff" }}>🗑️</span>
        <span style={{
          color: "#fff",
          fontSize: "12px",
          fontWeight: "500",
          marginTop: "4px"
        }}>
          Delete
        </span>
      </div> */}
        </div>
    );
}

export default InAppNotificationCard;