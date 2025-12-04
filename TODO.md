# TODO: Add Voice Assistant, Language Switching, Picture Upload, and Fix Asterisks

## 1. Fix Asterisks in Chatbot Responses
- [x] Modify backend/controllers/chatController.js to strip asterisks from AI responses
- [ ] Test that responses are clean text without markdown formatting

## 2. Add Picture Upload Feature
- [ ] Add image upload button to frontend/src/Chatbot.js input area
- [ ] Implement file selection and preview functionality
- [ ] Add backend support for image uploads (multer middleware)
- [ ] Modify backend/routes/chat.js to handle image uploads
- [ ] Integrate image analysis with Gemini AI for description/context
- [ ] Update backend/server.js if multer dependency is needed

## 3. Enhance Voice Assistant
- [ ] Verify existing useSpeechRecognition hook is fully integrated
- [ ] Ensure text-to-speech for assistant responses works properly
- [ ] Test voice input and output functionality

## 4. Verify Language Switching
- [ ] Confirm language switching works across all components
- [ ] Test translations in Chatbot.js and other UI elements

## 5. Testing and Final Verification
- [ ] Test all features in the browser
- [ ] Ensure responsive design works on mobile
- [ ] Verify backend handles image uploads securely
- [ ] Run frontend and backend to confirm everything works together
