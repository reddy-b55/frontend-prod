# AI Itinerary Service Documentation

## Overview
This service provides AI-powered itinerary generation functionality for the Aahaas travel platform. It includes voice recording, speech-to-text conversion, and AI-based itinerary creation.

## Features

### 1. **Voice Recording** 🎤
- Real-time voice recording using browser's MediaRecorder API
- Visual feedback with audio wave animation
- Recording timer display
- Microphone permission handling

### 2. **Speech-to-Text** 🗣️
- Converts recorded audio to text
- Supports multiple languages (backend dependent)
- Fallback to manual text input

### 3. **AI Itinerary Generation** 🤖
- Analyzes user preferences and requirements
- Generates personalized day-by-day itineraries
- Considers budget, interests, and location
- Loading animation during generation

### 4. **Itinerary Management** 💾
- Save generated itineraries
- View saved itineraries
- Share itineraries (future feature)

## Setup Instructions

### Prerequisites
- Node.js 14+ and npm/yarn
- Next.js project
- Backend API for AI processing (or use mock functions)

### Installation

1. **No additional packages needed!** The implementation uses native browser APIs.

2. **Environment Variables**
   Create a `.env.local` file in your project root:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
   ```

3. **Backend API Endpoints Required**
   Your backend should provide these endpoints:

   - `POST /api/speech-to-text` - Convert audio to text
     ```javascript
     // Request: FormData with 'audio' field (Blob)
     // Response: { transcript: string }
     ```

   - `POST /api/ai/generate-itinerary` - Generate itinerary
     ```javascript
     // Request: { prompt, userId, location, currency }
     // Response: { itinerary: Object }
     ```

   - `POST /api/itineraries/save` - Save itinerary
     ```javascript
     // Request: { userId, itinerary, createdAt }
     // Response: { id, success: boolean }
     ```

   - `GET /api/itineraries/user/:userId` - Get user's itineraries
     ```javascript
     // Response: { itineraries: Array }
     ```

## Usage

### Basic Implementation

The AI Itinerary feature is already integrated into your header component. Users can access it by clicking the "AI Itinerary" button.

### Switching from Mock to Real API

Currently, the system uses `generateMockItinerary()` for testing. To use your real AI API:

1. Open `header-two.js`
2. Find the `handleGenerateItinerary` function
3. Replace:
   ```javascript
   const itinerary = await generateMockItinerary(transcript);
   ```
   With:
   ```javascript
   const itinerary = await generateItinerary({
     prompt: transcript,
     userId: userId,
     location: baseLocation,
     currency: baseCurrency
   });
   ```

### Speech-to-Text Integration

The speech-to-text function is ready to use. Update `aiItineraryService.js`:

```javascript
export const speechToText = async (audioBlob) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');
  
  const response = await axios.post(`${API_BASE_URL}/api/speech-to-text`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data.transcript || '';
};
```

## Component Structure

```
header-two.js
├── State Management
│   ├── showAIPrompt - Modal visibility
│   ├── isRecording - Recording status
│   ├── recordingTime - Timer
│   ├── transcript - User input/transcription
│   ├── isGenerating - Loading state
│   ├── generatedItinerary - AI result
│   ├── mediaRecorder - Audio recorder instance
│   └── audioChunks - Recorded audio data
│
├── Functions
│   ├── handleAIItinerary() - Open modal
│   ├── startVoiceRecording() - Start recording
│   ├── stopVoiceRecording() - Stop recording
│   ├── processAudioToText() - Convert speech
│   ├── handleGenerateItinerary() - Generate plan
│   ├── handleSaveItinerary() - Save to database
│   └── closeAIPrompt() - Close and cleanup
│
└── UI Components
    ├── AI Button (Header)
    ├── Modal Overlay
    ├── Voice Recording Interface
    ├── Text Input Area
    ├── Loading Screen
    └── Itinerary Display
```

## API Response Formats

### Itinerary Object Structure
```javascript
{
  title: "Your Personalized Travel Itinerary",
  destination: "Bali",
  duration: 5,
  days: [
    {
      day: 1,
      title: "Arrival Day",
      activities: [
        "Check into hotel",
        "Explore local area",
        "Dinner at restaurant"
      ]
    },
    // More days...
  ],
  budget: "Moderate",
  recommendations: [
    "Tip 1",
    "Tip 2"
  ]
}
```

## Customization

### Styling
All styles are in the `<style jsx>` block in `header-two.js`. Key classes:
- `.ai-itinerary-button` - Main button
- `.ai-prompt-modal` - Modal container
- `.ai-loading-container` - Loading screen
- `.ai-itinerary-result` - Results display

### Recording Duration
Default max recording time: None (manual stop)
To add a limit:
```javascript
useEffect(() => {
  if (recordingTime >= 60) { // 60 seconds max
    stopVoiceRecording();
  }
}, [recordingTime]);
```

### Mock Data
Edit `generateMockItinerary()` in `aiItineraryService.js` to customize placeholder data.

## Browser Compatibility

### MediaRecorder API Support
- ✅ Chrome 47+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Edge 79+

### Microphone Access
- Requires HTTPS in production
- User must grant permission
- Falls back to text input if denied

## Troubleshooting

### Common Issues

**Issue: Microphone not working**
- Check browser permissions
- Ensure HTTPS (required in production)
- Verify microphone hardware

**Issue: Audio not transcribing**
- Check API endpoint configuration
- Verify audio format compatibility
- Check network requests in dev tools

**Issue: Itinerary not generating**
- Check console for errors
- Verify API endpoint is accessible
- Ensure backend is running

## Security Considerations

1. **API Keys**: Never expose AI API keys in frontend
2. **User Data**: Encrypt sensitive travel information
3. **Rate Limiting**: Implement backend rate limits
4. **Input Validation**: Sanitize user input before sending to AI

## Future Enhancements

- [ ] Multi-language support
- [ ] Image generation for destinations
- [ ] Real-time collaboration
- [ ] Export to PDF/Calendar
- [ ] Integration with booking systems
- [ ] Social sharing features

## Support

For issues or questions:
- Check this documentation first
- Review browser console errors
- Contact backend team for API issues
- Submit tickets for bugs

## Version History

- **v1.0.0** - Initial implementation with voice recording and AI generation
- Current features: Voice input, text input, mock AI, loading states

---

**Note**: This is a frontend implementation. Backend API development is required for full functionality.
