import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { 
  History, 
  X, 
  MapPin, 
  Calendar, 
  Users,
  Trash2
} from "lucide-react";
import moment from 'moment';
import styles from './RecentSearchesModal.module.css';

const RecentSearchesModal = ({ 
  isOpen, 
  onClose, 
  onSelectSearch,
  userId,
  searchSessions,
  onSessionsUpdate
}) => {
  const [loading, setLoading] = useState(false);

  // Session Storage Helper Functions
  const getSessionStorageKey = (userId) => {
    return `hotel_search_sessions_${userId}`;
  };

  const saveSessionToStorage = (sessions, userId) => {
    try {
      if (!userId) {
        console.warn("No user ID available, cannot save sessions");
        return;
      }
      
      const storageKey = getSessionStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(sessions));
    } catch (error) {
      console.error("Error saving hotel sessions to storage:", error);
    }
  };

  const formatSessionDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const formatDateRange = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'Dates not set';
    
    try {
      const checkInDate = moment(checkIn, 'DD/MM/YYYY');
      const checkOutDate = moment(checkOut, 'DD/MM/YYYY');
      
      if (checkInDate.isValid() && checkOutDate.isValid()) {
        const nights = checkOutDate.diff(checkInDate, 'days');
        return `${checkInDate.format('MMM DD')} - ${checkOutDate.format('MMM DD')} · ${nights} night${nights !== 1 ? 's' : ''}`;
      }
      return `${checkIn} - ${checkOut}`;
    } catch (error) {
      return `${checkIn} - ${checkOut}`;
    }
  };

  // Clear all recent searches
  const handleClearAll = () => {
    if (!userId) {
      console.warn("No user ID available, cannot clear history");
      return;
    }

    const updatedSessions = [];
    saveSessionToStorage(updatedSessions, userId);
    onSessionsUpdate(updatedSessions);
  };

  // Delete single session
  const handleDeleteSession = (sessionId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (!userId) {
      console.warn("No user ID available, cannot delete session");
      return;
    }
    
    const updatedSessions = searchSessions.filter(session => session.id !== sessionId);
    saveSessionToStorage(updatedSessions, userId);
    onSessionsUpdate(updatedSessions);
  };

  // Handle search selection
  const handleSearchSelect = (session) => {
    console.log("Loading hotel session:", session);
    onSelectSearch(session.searchParams);
    onClose();
  };

  // Show login prompt if no user is logged in
  if (!userId) {
    return (
      <Modal isOpen={isOpen} toggle={onClose} className={styles.recentSearchesModal} centered>
        <ModalHeader toggle={onClose} className={styles.modalHeader}>
          <div className={styles.headerContent}>
            <History className={styles.headerIcon} />
            <span>Recent Hotel Searches</span>
          </div>
        </ModalHeader>
        <ModalBody className={styles.modalBody}>
          <div className={styles.emptyState}>
            <Users size={48} color="#9ca3af" />
            <div className={styles.emptySessionTitle}>Login Required</div>
            <div className={styles.emptySessionText}>
              Please log in to view and manage your hotel search history.
            </div>
          </div>
        </ModalBody>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} toggle={onClose} className={styles.recentSearchesModal} centered size="md">
      <ModalHeader toggle={onClose} className={styles.modalHeader}>
        <div className={styles.headerContent}>
          <History className={styles.headerIcon} />
          <span>Recent Hotel Searches</span>
        </div>
        {searchSessions.length > 0 && (
          <button 
            className={styles.clearAllBtn}
            onClick={handleClearAll}
            title="Clear all recent searches"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
        )}
      </ModalHeader>

      <ModalBody className={styles.modalBody}>
        {searchSessions.length === 0 ? (
          <div className={styles.emptyState}>
            <History size={48} color="#9ca3af" />
            <div className={styles.emptySessionTitle}>No recent searches</div>
            <div className={styles.emptySessionText}>
              Your hotel search history will appear here after you've searched for hotels.
            </div>
          </div>
        ) : (
          <div className={styles.sessionList}>
            {searchSessions.map((session) => (
              <div key={session.id} className={styles.sessionItem}>
                <div
                  className={styles.sessionItemContent}
                  onClick={() => handleSearchSelect(session)}
                >
                  <div className={styles.sessionItemHeader}>
                    <div className={styles.sessionSummary}>
                      {session.summary}
                    </div>
                    <div className={styles.sessionTime}>
                      {formatSessionDate(session.timestamp)}
                    </div>
                  </div>

                  <div className={styles.sessionDetails}>
                    <div className={styles.sessionDetailItem}>
                      <MapPin size={14} className={styles.detailIcon} />
                      <span className={styles.sessionDetailValue}>
                        {session.searchParams.City || 'Unknown location'}
                      </span>
                    </div>

                    {session.searchParams.CheckInDate && session.searchParams.CheckOutDate && (
                      <div className={styles.sessionDetailItem}>
                        <Calendar size={14} className={styles.detailIcon} />
                        <span className={styles.sessionDetailValue}>
                          {formatDateRange(session.searchParams.CheckInDate, session.searchParams.CheckOutDate)}
                        </span>
                      </div>
                    )}

                    <div className={styles.sessionDetailItem}>
                      <Users size={14} className={styles.detailIcon} />
                      <span className={styles.sessionDetailValue}>
                        {session.searchParams.NoOfAdults || 1} adult{session.searchParams.NoOfAdults !== 1 ? 's' : ''}
                        {session.searchParams.NoOfChild ? `, ${session.searchParams.NoOfChild} children` : ''}
                        {session.searchParams.NoOfRooms ? `, ${session.searchParams.NoOfRooms} room${session.searchParams.NoOfRooms !== 1 ? 's' : ''}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className={styles.deleteSessionButton}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
    </Modal>
  );
};

export default RecentSearchesModal;