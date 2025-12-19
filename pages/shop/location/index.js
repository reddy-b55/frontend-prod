import { useState } from 'react';

export default function LocationLogger() {
  const [status, setStatus] = useState('Ready to get location');

  const getLocationAndLog = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      setStatus('Geolocation not supported');
      return;
    }

    setStatus('Getting location...');
    console.log('Requesting current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Log the complete position object
        console.log('Full position object:', position);
        
        // Log individual coordinates
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
        console.log('Accuracy:', position.coords.accuracy, 'meters');
        console.log('Altitude:', position.coords.altitude);
        console.log('Altitude Accuracy:', position.coords.altitudeAccuracy);
        console.log('Heading:', position.coords.heading);
        console.log('Speed:', position.coords.speed);
        console.log('Timestamp:', position.timestamp);
        console.log('Time:', new Date(position.timestamp).toLocaleString());
        
        // Log as a clean object
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          time: new Date(position.timestamp).toLocaleString()
        };
        
        console.table(locationData);
        console.log('Location data object:', locationData);
        
        setStatus('Location logged to console! Check developer tools.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        
        let errorMessage = 'Unknown error';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        
        console.error('Readable error:', errorMessage);
        setStatus(`Error: ${errorMessage}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Location Console Logger</h2>
      
      <button
        onClick={getLocationAndLog}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg mb-4 transition-colors"
      >
        Get Location & Log to Console
      </button>

      <div className="bg-gray-100 p-3 rounded text-sm">
        <strong>Status:</strong> {status}
      </div>

      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• Click the button to get your location</p>
        <p>• Open Developer Tools (F12) to see console logs</p>
        <p>• Your browser will ask for location permission</p>
      </div>
    </div>
  );
}