/**
 * AI Itinerary Service
 * Handles AI-related API calls for itinerary generation
 */

import axios from 'axios';

/**
 * Convert speech audio to text using Web Speech API or backend service
 * @param {Blob} audioBlob - Audio blob from recording
 * @returns {Promise<string>} - Transcribed text
 */
export const speechToText = async (audioBlob) => {
  try {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    // For now, return a placeholder message
    // In production, you would send audioBlob to your backend speech-to-text service
    console.log('Processing audio blob:', audioBlob.size, 'bytes');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return 'Please type your travel requirements or try voice input again';
  } catch (error) {
    console.error('Speech to text error:', error);
    throw error;
  }
};

/**
 * Generate AI itinerary by calling n8n webhook
 * @param {string} emailContent - User's travel requirements text
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Response with cart_id and cart_name
 */
export const generateItinerary = async (emailContent, userId) => {
  try {
    const response = await axios.post('/n8n/webhook/automate', {
      email_content: emailContent,
      user_id: userId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Generate itinerary error:', error);
    throw error;
  }
};
