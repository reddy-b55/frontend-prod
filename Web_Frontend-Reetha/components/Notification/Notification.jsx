import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { getAllInAppNotifications } from "../../AxiosCalls/Notification/notificationService";
import { AppContext } from "../../pages/_app";
import InAppNotificationCard from "./NotificationCard";
import axios from "axios";

function NotificationMainPage() {
  const [categoryTitle, setCategoryTitle] = useState("All Categories");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedTab, setSelectedTab] = useState("All");
  const [notificationParams, setNavigationParams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const {
    baseCurrency,
    triggers,
    setTriggers,
    baseLocation,
    userStatus,
    userId,
    baseUserId,
  } = useContext(AppContext);
  // Mock context - replace with your actual context
  const mainUserData = userId; // Replace with: const { mainUserData } = useContext(MainDataContext);

  const [notificationCount, setNotificationCount] = useState(0);

  const handleSelectedCategory = (e) => {
    let catID = 0;
    setCategoryTitle(e);

    switch (e) {
      case "Hotels":
        catID = 4;
        break;
      case "Lifestyle":
        catID = 3;
        break;
      case "Essentials":
        catID = 1;
        break;
      case "Non Essentials":
        catID = 2;
        break;
      case "Education":
        catID = 5;
        break;
      default:
        catID = 0;
    }
    setSelectedCategory(catID);
  };

  const fetchNotifications = async () => {
    if (!refreshing) {
      setLoading(true);
    }
    try {
      const res = await getAllInAppNotifications(mainUserData);
      console.log(res, "RESSSSSSSSSSSSSSSSSSSSS")
      setNavigationParams(res?.[0] || []);
      setNotificationCount(res?.[1] || 0);
    } catch (error) {
      console.error(error);
      // Keep previous data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [mainUserData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const groupNotificationsByDate = (notifications) => {
    const grouped = notifications.reduce((groups, notification) => {
      const date = notification.push_at || notification.created_at;
      const momentDate = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let sectionTitle;
      if (momentDate.toDateString() === today.toDateString()) {
        sectionTitle = "Today";
      } else if (momentDate.toDateString() === yesterday.toDateString()) {
        sectionTitle = "Yesterday";
      } else {
        sectionTitle = momentDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }

      const existingGroup = groups.find(group => group.title === sectionTitle);

      if (existingGroup) {
        existingGroup.data.push(notification);
      } else {
        groups.push({
          title: sectionTitle,
          data: [notification],
          date: momentDate.toISOString().split('T')[0],
        });
      }

      return groups;
    }, []);

    return grouped.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getFilteredNotifications = () => {
    if (!notificationParams || notificationParams.length === 0) {
      return [];
    }

    let categoryFiltered = selectedCategory === 0
      ? notificationParams
      : notificationParams.filter(res => res.category_id === selectedCategory);

    switch (selectedTab) {
      case "Read":
        categoryFiltered = categoryFiltered.filter(
          notif => notif.notification_seen === "Read"
        );
        break;
      case "Unread":
        categoryFiltered = categoryFiltered.filter(
          notif => notif.notification_seen === "Unread"
        );
        break;
      default:
        break;
    }

    return groupNotificationsByDate(categoryFiltered);
  };

  const groupedNotifications = getFilteredNotifications();
  const hasNotifications = groupedNotifications.some(section => section.data.length > 0);

  const handleMarkAllAsRead = async () => {
    try {
      axios.post(`mark_all_notification_read/${mainUserData}`).then((response) => {
        fetchNotifications();
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteReadOnly = () => {
    axios.post(`delete_all_read_notifications/${mainUserData}`)
      .then((response) => {
        if (response.data.status === 200) {
          fetchNotifications();
        }
      });
  };

  const renderTabButton = (tabName) => {
    const isSelected = selectedTab === tabName;
    return (
      <button
        key={tabName}
        style={{
          paddingLeft: '20px',
          paddingRight: '20px',
          paddingTop: '12px',
          paddingBottom: '12px',
          backgroundColor: 'transparent',
          flex: 1,
          marginLeft: '5px',
          marginRight: '5px',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          fontSize: '15px',
          fontWeight: isSelected ? '600' : '500',
          color: isSelected ? '#1F96EE' : '#9B9B9B',
          textAlign: 'center'
        }}
        onClick={() => setSelectedTab(tabName)}
      >
        {tabName}
      </button>
    );
  };

  const renderEmptyState = () => (
    <div style={{
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingTop: '100px',
      paddingBottom: '100px',
      paddingLeft: '70px',
      paddingRight: '70px',
      textAlign: 'center'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        color: '#484848',
        textAlign: 'center',
        marginBottom: '4px',
        margin: 0
      }}>
        {selectedTab === "All"
          ? "Oops! No notifications yet"
          : `No ${selectedTab.toLowerCase()} notifications`}
      </h3>
      <p style={{
        fontSize: '14px',
        fontWeight: '400',
        color: '#9B9B9B',
        textAlign: 'center',
        lineHeight: '20px',
        margin: 0
      }}>
        {selectedTab === "All"
          ? "It seems that you've got a blank slate. We'll let you know when updates arrive!"
          : `You don't have any ${selectedTab.toLowerCase()} notifications at the moment.`}
      </p>
    </div>
  );

  const renderSectionHeader = (title) => (
    <div style={{
      backgroundColor: 'white',
      paddingTop: '8px',
      paddingBottom: '6px',
      paddingLeft: '15px',
      paddingRight: '15px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <h4 style={{
          fontWeight: '400',
          fontSize: '14px',
          color: title === "Today" ? '#1F96EE' : '#484848',
          margin: 0
        }}>
          {title}
        </h4>
        <div style={{
          flex: 1,
          height: '1px',
          backgroundColor: '#E5E5E5',
          marginLeft: '8px'
        }} />
      </div>
    </div>
  );

  const renderNotificationItem = (item, index) => (
    <div key={`${item.id}-${index}`} >
      <InAppNotificationCard data={item} onUpdate={fetchNotifications} userId={mainUserData} />
    </div>
  );

  return (
    <div style={{ backgroundColor: 'white', minHeight: '10vh',paddingBottom: '40px'}}>
      {/* App Bar */}
      {/* <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #E5E5E5',
        backgroundColor: 'white'
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#333' }}>
          Notifications
        </h1>
      </div> */}

      {/* Tab Container */}
      <div style={{
        backgroundColor: 'white',
        paddingLeft: '20px',
        paddingRight: '20px',
        paddingTop: '2px',
        paddingBottom: '5px'
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingLeft: '10px',
            paddingRight: '10px'
          }}>
            {renderTabButton("All")}
            {renderTabButton("Read")}
            {renderTabButton("Unread")}
          </div>
          <div style={{
            height: '1px',
            backgroundColor: '#E5EAEE',
            marginTop: '-1px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              left: `${["All", "Read", "Unread"].indexOf(selectedTab) * 33.33}%`,
              width: '33.33%',
              height: '3px',
              backgroundColor: '#1F96EE',
              borderRadius: '0'
            }} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasNotifications &&  (
        <div style={{
          display: 'flex',
          paddingLeft: '20px',
          paddingRight: '20px',
          justifyContent: 'flex-end',
          paddingBottom: '6px',
          paddingTop: '6px'
        }}>
          {selectedTab === "All" && notificationCount > 0 &&(
            <button
              onClick={handleMarkAllAsRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1F96EE',
                fontWeight: '500'
              }}
            >
              <span style={{ marginRight: '4px' }}>✓</span>
              Mark all as read
            </button>
          )}

          {selectedTab === "Unread" && notificationCount > 0 &&(
            <button
              onClick={handleMarkAllAsRead}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1F96EE',
                fontWeight: '500'
              }}
            >
              <span style={{ marginRight: '4px' }}>✓</span>
              Mark all as read
            </button>
          )}

          {selectedTab === "Read" && (
            <button
              onClick={deleteReadOnly}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#1F96EE',
                fontWeight: '500'
              }}
            >
              <span style={{ marginRight: '4px' }}>🗑</span>
              Delete all
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
        <div style={{ flex: 1 }}>
          {initialLoad && loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '30px',
              marginBottom: '30px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #1F96EE',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : !hasNotifications ? (
            renderEmptyState()
          ) : (
            <div style={{ paddingBottom: '20px', position: 'relative' }}>
              {refreshing && (
                <div style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f3f3',
                    borderTop: '2px solid #1F96EE',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                </div>
              )}
              {groupedNotifications.map((section, sectionIndex) => (
                <div key={`${section.date}-${sectionIndex}`}>
                  {renderSectionHeader(section.title)}
                  {section.data.map((item, itemIndex) =>
                    renderNotificationItem(item, itemIndex)
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NotificationMainPage;