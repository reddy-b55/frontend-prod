// Example: How to use AI Itinerary Modal in any component

import React, { useState, useContext } from 'react';
import AIItineraryModal from '../../components/AIItinerary/AIItineraryModal';
import { AppContext } from '../../pages/_app';

const ExampleComponent = () => {
  const { userId } = useContext(AppContext);
  const [showAIModal, setShowAIModal] = useState(false);

  return (
    <div>
      {/* Trigger button - can be anywhere in your component */}
      <button 
        onClick={() => setShowAIModal(true)}
        className="create-itinerary-btn"
      >
        ✨ Create AI Itinerary
      </button>

      {/* The modal component */}
      <AIItineraryModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        userId={userId}
      />

      <style jsx>{`
        .create-itinerary-btn {
          background: linear-gradient(135deg, #00d4aa, #00c199);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(0, 212, 170, 0.3);
        }

        .create-itinerary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 212, 170, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ExampleComponent;
