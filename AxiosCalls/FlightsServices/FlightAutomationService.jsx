import axios from "axios";

/**
 * AI Flight Automation Service
 * Processes natural language flight requests and returns structured flight search data
 */

/**
 * Automate flight booking based on user's natural language prompt
 * @param {Object} params - Flight automation parameters
 * @param {string} params.prompt - User's natural language flight request
 * @param {string} params.userId - User ID
 * @param {string} params.currency - Preferred currency code (e.g., 'USD', 'LKR')
 * @param {boolean} params.fullyBooking - Whether this is for full booking (default: false)
 * @param {string} params.language - Language code (e.g., 'en-US', 'si-LK', 'ta-IN')
 * @returns {Promise<Object>} Search criteria for flight search
 */
export const automateFlightBooking = async ({ 
  prompt, 
  userId, 
  currency = 'USD', 
  fullyBooking = false, 
  language = 'en-US' 
}) => {
  try {
    const requestPayload = {
      prompt,
      userId,
      currency,
      fullyBooking,
      language,
    };

    console.log('Flight automation request:', requestPayload);

    const response = await axios.post('/flights/automate-booking', requestPayload, {
      xsrfHeaderName: "X-XSRF-TOKEN",
      withCredentials: true,
    });

    console.log('Flight automation response:', response.data);

    if (response.data && response.status === 200) {
      // Extract the search criteria from the response
      const searchCriteria = response.data.data || response.data.searchCriteria || response.data;
      
      return {
        success: true,
        data: searchCriteria,
        message: 'Flight search criteria generated successfully',
      };
    } else {
      return {
        success: false,
        data: null,
        message: response.data?.message || 'Failed to process flight request',
      };
    }
  } catch (error) {
    console.error('Error in automateFlightBooking:', error);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to process your request. Please try again.',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Validate flight prompt before sending to API
 * @param {string} prompt - User's flight request text
 * @returns {Object} Validation result with isValid flag and message
 */
export const validateFlightPrompt = (prompt) => {
  if (!prompt || !prompt.trim()) {
    return {
      isValid: false,
      message: 'Please provide flight details. Describe your flight requirements.',
    };
  }

  const trimmedPrompt = prompt.trim();

  // Minimum character validation
  if (trimmedPrompt.length < 10) {
    return {
      isValid: false,
      message: 'Please provide more details about your flight. Your input should be at least 10 characters long.',
    };
  }

  // Minimum word count validation (at least 3 words)
  const words = trimmedPrompt.split(/\s+/).filter(word => word.length > 0);
  if (words.length < 3) {
    return {
      isValid: false,
      message: 'Please describe your flight with at least 3 words. For example: "Flight to Singapore tomorrow" or "Colombo to Bangkok next week"',
    };
  }

  return {
    isValid: true,
    message: 'Valid flight request',
  };
};

/**
 * Get example flight prompts based on language
 * @param {string} languageCode - Language code (e.g., 'en-US', 'si-LK', 'ta-IN')
 * @returns {Array<string>} Array of example prompts
 */
export const getFlightPromptExamples = (languageCode = 'en-US') => {
  const examples = {
    'en-US': [
      'I need a flight from Colombo to Singapore. I want to travel on January 15th and return on January 25th. Please find me an economy class ticket.',
      'Round trip flight from Colombo to Bangkok, departing December 20th, returning December 28th, business class.',
      'One way flight to Dubai from Colombo, leaving tomorrow, 2 adults, economy.',
    ],
    'si-LK': [
      'Colombo සිට Singapore යන්න flight එකක් ඕනේ. January 15 යන්න එන්න January 25 හොඳයි. Economy class එකක් ඕනේ.',
      'Colombo සිට Bangkok යන්න round trip flight එකක්. December 20 යන්න, December 28 එන්න, business class.',
    ],
    'ta-IN': [
      'Colombo இலிருந்து Singapore க்கு flight வேண்டும். January 15 போக வேண்டும், January 25 திரும்ப வர வேண்டும். Economy class வேண்டும்.',
      'Colombo இலிருந்து Bangkok க்கு round trip flight. December 20 புறப்பட வேண்டும், December 28 திரும்ப வர வேண்டும், business class.',
    ],
  };

  return examples[languageCode] || examples['en-US'];
};

export default {
  automateFlightBooking,
  validateFlightPrompt,
  getFlightPromptExamples,
};
