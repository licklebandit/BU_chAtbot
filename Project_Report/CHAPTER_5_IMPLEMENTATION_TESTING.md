# CHAPTER 5: IMPLEMENTATION & TESTING

## 5.1 Introduction

This chapter provides a comprehensive account of the BUchatbot system implementation and testing processes. It begins by describing the development environment and tools used, followed by detailed explanations of the technologies selected and their rationale. The chapter then presents the system modules, their functionalities, and representative code samples demonstrating key implementations. Implementation challenges encountered during development are discussed along with the solutions applied. The second half of the chapter focuses on testing, covering unit testing, integration testing, system testing, and user acceptance testing. Test cases, procedures, results, and screenshots are provided to demonstrate thorough validation of system functionality and quality.

## 5.2 Implementation

### 5.2.1 Development Environment

The BUchatbot system was developed using the following environment and tools:

**Hardware Specifications:**
- Processor: Intel Core i5 or equivalent
- RAM: 8GB minimum (16GB recommended)
- Storage: 256GB SSD
- Display: 1920x1080 resolution

**Operating System:**
- Primary: Windows 10/11
- Compatible: macOS, Linux (Ubuntu 20.04+)

**Integrated Development Environment (IDE):**
- Visual Studio Code (VS Code) version 1.85+
- Extensions used:
  - ESLint for JavaScript linting
  - Prettier for code formatting
  - ES7+ React/Redux/React-Native snippets
  - MongoDB for VS Code
  - REST Client for API testing
  - GitLens for Git integration

**Version Control:**
- Git 2.40+
- GitHub for remote repository hosting
- Git workflow: Feature branching with main/develop branches

**Browser Developer Tools:**
- Chrome DevTools for debugging and performance analysis
- Firefox Developer Tools for cross-browser testing
- React Developer Tools extension

**Database Management:**
- MongoDB Compass for database visualization and querying
- MongoDB Atlas for cloud database (optional)
- Mongoose CLI for schema management

**API Testing:**
- Postman for API endpoint testing
- Thunder Client (VS Code extension) as alternative
- cURL for command-line testing

**Package Managers:**
- npm (Node Package Manager) v9.0+
- npx for running packages without global installation

**Terminal:**
- Windows: PowerShell, Git Bash
- Built-in VS Code terminal for convenience

### 5.2.2 Tools and Technologies

The technology stack was carefully selected based on project requirements, developer expertise, community support, and industry best practices.

#### Backend Technologies

**Node.js v18.0+ (Runtime Environment)**

*Rationale:*
- JavaScript runtime enabling server-side development in same language as frontend
- Non-blocking I/O model ideal for real-time applications
- Large ecosystem of packages via npm
- Excellent performance for I/O-intensive operations
- Strong community support and extensive documentation

*Key Features Used:*
- Event-driven architecture for handling concurrent requests
- Built-in modules: http, fs, path, crypto
- ES6+ module support (import/export)
- Environment variable management via process.env

**Express.js v4.19+ (Web Framework)**

*Rationale:*
- Minimalist, unopinionated framework providing flexibility
- Robust routing system for REST API development
- Middleware architecture for modular request processing
- Extensive middleware ecosystem (CORS, Helmet, body-parser)
- Widely adopted with proven reliability

*Key Features Used:*
- Application routing and route handlers
- Middleware chaining for authentication, validation, error handling
- Static file serving (future use)
- Integration with template engines (if needed)

**MongoDB v6.0+ (Database)**

*Rationale:*
- NoSQL document database with flexible schema
- JSON-like documents align with JavaScript objects
- Scalability through horizontal scaling (sharding)
- Powerful aggregation framework for analytics
- Rich querying capabilities
- Mongoose ODM simplifies interactions

*Key Features Used:*
- Collections: Users, Knowledge, Chats, Conversations, Settings
- Indexes for performance optimization
- Aggregation pipelines for analytics
- Text search for knowledge base queries
- Embedded documents for message storage

**Mongoose v8.0+ (ODM - Object Document Mapper)**

*Rationale:*
- Schema-based modeling for MongoDB documents
- Built-in validation and type casting
- Middleware (hooks) for pre/post operations
- Query building and population (joins)
- Connection management and pooling

*Key Features Used:*
- Schema definitions with validation rules
- Model methods and statics
- Virtual properties
- Pre-save hooks for password hashing
- Timestamps (createdAt, updatedAt)

**Socket.IO v4.8+ (Real-Time Communication)**

*Rationale:*
- Enables bidirectional, event-based communication
- Automatic reconnection handling
- Broadcasting to multiple clients
- Room-based messaging for admin notifications
- Fallback mechanisms for various transport methods

*Key Features Used:*
- Real-time conversation notifications to admin
- Dashboard metric updates
- Knowledge base update broadcasts
- Admin room for targeted messaging

**Google Gemini AI (@google/generative-ai v0.24+)**

*Rationale:*
- State-of-the-art large language model
- Powerful natural language understanding
- High-quality response generation
- Multimodal capabilities (future expansion)
- Competitive pricing and free tier

*Key Features Used:*
- Text generation with context
- Conversation understanding
- Instruction following
- Model configuration (temperature, top-k, top-p)

**bcrypt v6.0+ (Password Hashing)**

*Rationale:*
- Industry-standard password hashing algorithm
- Adjustable computational cost (salt rounds)
- Protection against brute-force attacks
- Well-tested and secure

*Key Features Used:*
- Password hashing with 10 salt rounds
- Comparison function for login validation

**jsonwebtoken v9.0+ (JWT Authentication)**

*Rationale:*
- Stateless authentication mechanism
- Self-contained tokens with claims
- Digital signature for verification
- Industry standard for API authentication

*Key Features Used:*
- Token generation with user ID and role
- Token verification middleware
- Configurable expiration times

**CORS v2.8+ (Cross-Origin Resource Sharing)**

*Rationale:*
- Enables controlled access from different origins
- Security against unauthorized cross-origin requests
- Configurable for specific domains and methods

*Key Features Used:*
- Whitelist of allowed origins
- Credentials support for authenticated requests
- HTTP methods configuration

**Helmet v8.1+ (Security Headers)**

*Rationale:*
- Protects against common web vulnerabilities
- Sets HTTP security headers
- Content Security Policy (CSP) configuration
- XSS, clickjacking, MIME sniffing protection

*Key Features Used:*
- Default security headers
- CSP for script execution control
- Cross-origin resource policy

**dotenv v16.6+ (Environment Variables)**

*Rationale:*
- Separates configuration from code
- Environment-specific settings
- Security for sensitive credentials
- Standard practice for Node.js applications

*Key Features Used:*
- Loading .env file variables
- Environment-based configuration
- Secure storage of API keys and database URIs

#### Frontend Technologies

**React v19.2+ (UI Library)**

*Rationale:*
- Component-based architecture for reusability
- Virtual DOM for efficient rendering
- Large ecosystem and community
- Declarative syntax for UI description
- Hooks for state and lifecycle management

*Key Features Used:*
- Functional components with hooks
- useState, useEffect, useContext hooks
- Component composition and props
- Conditional rendering
- Event handling

**React Router DOM v7.9+ (Routing)**

*Rationale:*
- Declarative routing for single-page applications
- Nested routes and layouts
- Programmatic navigation
- Route protection for authentication

*Key Features Used:*
- BrowserRouter for history management
- Route components for path matching
- Navigate component for redirects
- useNavigate hook for navigation

**Axios v1.13+ (HTTP Client)**

*Rationale:*
- Promise-based HTTP client
- Request/response interceptors
- Automatic JSON transformation
- Better error handling than fetch
- Request cancellation support

*Key Features Used:*
- GET, POST, PUT, DELETE requests
- Authorization header injection
- Response data extraction
- Error handling

**Socket.IO Client v4.8+ (Real-Time Client)**

*Rationale:*
- Client-side counterpart to Socket.IO server
- Event-based communication
- Automatic reconnection
- Consistent API with server

*Key Features Used:*
- Connection to backend server
- Event listeners for updates
- Emit events from client
- Room joining for admin clients

**Tailwind CSS v4.0+ (Styling Framework)**

*Rationale:*
- Utility-first CSS framework
- Rapid UI development
- Responsive design utilities
- Consistent design system
- Small production bundle with purging

*Key Features Used:*
- Utility classes for styling
- Responsive breakpoints
- Custom color configuration
- Flexbox and grid utilities
- Hover and focus states

**Framer Motion v12.0+ (Animation Library)**

*Rationale:*
- Production-ready animation library for React
- Simple API for complex animations
- Physics-based animations
- Gesture detection
- Optimized performance

*Key Features Used:*
- Component animations (fade in, slide)
- Scroll-triggered animations
- Stagger effects
- Exit animations

**React Hot Toast v2.6+ (Notifications)**

*Rationale:*
- Lightweight toast notification library
- Customizable appearance
- Promise-based notifications
- Positioning control
- Accessible notifications

*Key Features Used:*
- Success, error, info toasts
- Custom styling
- Auto-dismiss configuration
- Positioned notifications

**Lucide React v0.552+ (Icons)**

*Rationale:*
- Modern, consistent icon set
- React component format
- Customizable size and color
- Lightweight and tree-shakeable

*Key Features Used:*
- UI icons (menu, user, send, etc.)
- Feature icons for landing page
- Consistent styling across application

#### Development and Build Tools

**Create React App v5.0+ (Build Tool)**

*Rationale:*
- Zero-configuration React setup
- Webpack configuration abstraction
- Development server with hot reload
- Production build optimization
- Jest testing framework integration

*Key Features Used:*
- Development server (npm start)
- Production build (npm run build)
- ES6+ transpilation via Babel
- CSS and asset handling

**Nodemon v3.1+ (Development Server)**

*Rationale:*
- Automatic server restart on file changes
- Improved development workflow
- Configurable file watching
- Delay and ignore patterns

*Key Features Used:*
- Watching JavaScript files
- Automatic server restart
- Error handling and recovery

#### Deployment Tools (Future/Optional)

**Docker (Containerization)**
- Consistent deployment across environments
- Isolated dependencies
- Easy scaling

**Vercel/Netlify (Frontend Hosting)**
- Continuous deployment from Git
- CDN distribution
- HTTPS by default

**Heroku/Railway (Backend Hosting)**
- Easy Node.js deployment
- MongoDB add-on support
- Environment variable management

**MongoDB Atlas (Database Hosting)**
- Managed MongoDB service
- Automatic backups
- Monitoring and alerts

### 5.2.3 System Modules

The BUchatbot system is organized into logical modules, each responsible for specific functionality.

#### Module 1: Authentication Module

**Purpose:** Handle user registration, login, and authorization

**Components:**
- Auth Routes (`routes/auth.js`)
- User Model (`models/User.js`)
- Auth Middleware (`middleware/authMiddleware.js`)

**Functionality:**
- User registration with validation
- Password hashing using bcrypt
- User login with credential verification
- JWT token generation
- Token verification middleware
- Role-based access control

**Key Functions:**
```javascript
// Register new user
router.post('/register', async (req, res) => {
  // Hash password, create user, return token
});

// Login existing user
router.post('/login', async (req, res) => {
  // Verify credentials, generate token, return user data
});

// Verify JWT token
export const verifyUser = async (req, res, next) => {
  // Extract token, verify, attach user to request
};

// Verify admin role
export const verifyAdmin = async (req, res, next) => {
  // Check if user has admin role
};
```

**Data Flow:**
1. User submits registration/login form
2. Frontend sends credentials to backend
3. Backend validates and processes
4. Token generated and returned
5. Frontend stores token in localStorage
6. Token included in subsequent requests
7. Middleware verifies token and authorizes access

#### Module 2: Chat Module

**Purpose:** Process user queries and generate responses

**Components:**
- Chat Routes (`routes/chat.js`)
- Query Processor (`utils/getChatResponse.js`)
- Knowledge Search (`utils/searchKnowledge.js`)
- Vector Store (`utils/vectorStore.js`)
- Chat Model (`models/Chat.js`)

**Functionality:**
- Receive and validate user queries
- Search knowledge base using semantic similarity
- Integrate with Google Gemini AI
- Implement RAG (Retrieval-Augmented Generation)
- Save conversation history
- Real-time updates via Socket.IO
- Support multiple response modes

**Key Functions:**
```javascript
// Main chat endpoint
router.post('/', authenticate, async (req, res) => {
  // Process query, search KB, generate response, save conversation
});

// Knowledge search with semantic similarity
export async function searchKnowledge(query, knowledge) {
  // Vector search, fallback to keyword matching
});

// Generate AI response with context
export async function getChatResponse(userQuestion, context) {
  // Call Gemini API with prompt and context
});
```

**RAG Implementation Flow:**
1. Receive user query
2. Search knowledge base for relevant context
3. If context found:
   - Combine context with query
   - Send to Gemini AI for refined response
4. If no context:
   - Either use LLM-only mode or return "don't know"
5. Save query and response to database
6. Emit real-time notification to admin
7. Return response to user

#### Module 3: Knowledge Management Module

**Purpose:** Admin CRUD operations for knowledge base

**Components:**
- Admin Routes (`routes/adminRouter.js`)
- Knowledge Model (`models/Knowledge.js`)
- Knowledge Controller (within admin routes)

**Functionality:**
- Create new knowledge entries
- Read/retrieve knowledge entries
- Update existing knowledge
- Delete knowledge entries
- Search and filter knowledge
- Categorize by type (knowledge/FAQ)
- Real-time updates to clients

**Key Functions:**
```javascript
// Get all knowledge entries
router.get('/knowledge', isAuthenticated, isAdmin, async (req, res) => {
  // Fetch and return knowledge articles
});

// Create knowledge entry
router.post('/knowledge', isAuthenticated, isAdmin, async (req, res) => {
  // Validate, create, emit update, return entry
});

// Update knowledge entry
router.put('/knowledge/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Find, update, emit update, return updated entry
});

// Delete knowledge entry
router.delete('/knowledge/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Find, delete, emit update, return confirmation
});
```

**Admin Interface Features:**
- Table view of all entries
- Search by title/content
- Filter by type
- Modal forms for add/edit
- Confirmation dialogs for delete
- Pagination for large datasets

#### Module 4: User Management Module

**Purpose:** Admin management of user accounts

**Components:**
- Admin Routes (`routes/adminRouter.js`)
- User Model (`models/User.js`)
- User Controller (within admin routes)

**Functionality:**
- View all registered users
- Create new user accounts
- Edit user information and roles
- Delete user accounts
- Filter users by role
- Real-time updates

**Key Functions:**
```javascript
// Get all users
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  // Fetch all users excluding passwords
});

// Create user
router.post('/users', isAuthenticated, isAdmin, async (req, res) => {
  // Hash password, create user, emit update
});

// Update user
router.put('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Update user data, emit update
});

// Delete user
router.delete('/users/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Delete user, emit update
});
```

#### Module 5: Analytics Module

**Purpose:** Generate insights and metrics from system usage

**Components:**
- Analytics Routes (`routes/analytics.js`)
- Analytics Controller (within routes)
- Chat, User, Knowledge Models for data aggregation

**Functionality:**
- Count total users, conversations, knowledge entries
- Calculate average response time
- Generate daily conversation volume charts
- Display recent activity feed
- Track query patterns
- Identify common topics

**Key Functions:**
```javascript
// Get summary statistics
router.get('/summary', async (req, res) => {
  // Aggregate counts from various collections
});

// Get chart data for last 7 days
router.get('/charts', async (req, res) => {
  // Aggregate daily conversation and user data
});

// Calculate average response time
const calculateResponseTime = async (conversationSample) => {
  // Analyze timestamps between user queries and bot responses
};
```

**Metrics Tracked:**
- Total users (all time)
- Total conversations (all time)
- Conversations last 7 days (daily breakdown)
- Active users today
- Knowledge entries count
- FAQ count
- Average response time
- Recent activity (last 10 actions)

#### Module 6: Conversation Management Module

**Purpose:** Admin viewing and management of user conversations

**Components:**
- Conversation Routes (`routes/conversations.js`)
- Chat Model (`models/Chat.js`)
- Conversation Model (`models/Conversation.js`)

**Functionality:**
- List all conversations with metadata
- View full conversation details
- Delete conversations
- Mark conversations as read/unread
- Search conversations
- Real-time new conversation notifications

**Key Functions:**
```javascript
// Get all conversations
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  // Fetch conversations with user info
});

// Get conversation by ID
router.get('/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Fetch specific conversation with messages
});

// Delete conversation
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  // Delete conversation, emit update
});
```

#### Module 7: Settings Module (Optional)

**Purpose:** System configuration management

**Components:**
- Settings Routes (`routes/settings.js`)
- Settings Model (`models/Settings.js`)

**Functionality:**
- Retrieve system settings
- Update configuration values
- RAG mode configuration
- Welcome message customization
- Feature toggles

**Key Functions:**
```javascript
// Get all settings
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  // Fetch settings
});

// Update setting
router.put('/:key', isAuthenticated, isAdmin, async (req, res) => {
  // Update specific setting value
});
```

### 5.2.4 Code Implementation Samples

#### Sample 1: User Registration (Backend)

```javascript
// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// POST /auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error during registration' 
    });
  }
});

export default router;
```

#### Sample 2: Query Processing with RAG (Backend)

```javascript
// routes/chat.js
import express from 'express';
import { searchKnowledge } from '../utils/searchKnowledge.js';
import { getChatResponse } from '../utils/getChatResponse.js';
import Chat from '../models/Chat.js';
import Knowledge from '../models/Knowledge.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { q } = req.body;

  if (!q || q.trim() === '') {
    return res.status(400).json({ 
      answer: 'Please ask a valid question.' 
    });
  }

  try {
    // 1. Load knowledge from database
    const dbKnowledge = await Knowledge.find().lean();
    const knowledgeBase = dbKnowledge.map(item => ({
      keyword: item.question || '',
      answer: item.answer || '',
      question: item.question || '',
      ...item
    }));

    // 2. Search knowledge base
    let context = await searchKnowledge(q, knowledgeBase);
    console.log(`Context: ${context ? 'FOUND' : 'NOT FOUND'}`);

    // 3. Get RAG mode from environment
    const RAG_MODE = (process.env.RAG_MODE || 'refine').toLowerCase();
    let answer = '';

    if (RAG_MODE === 'llm-only') {
      // Always use LLM
      const { text } = await getChatResponse(q, '');
      answer = text;
    } else if (context && context.trim()) {
      // Knowledge base hit
      if (RAG_MODE === 'kb-only') {
        answer = context;
      } else {
        // Refine with LLM
        const { text } = await getChatResponse(q, context);
        answer = text || context;
      }
    } else {
      // No knowledge found - use LLM or fallback
      const { text } = await getChatResponse(q, '');
      answer = text || "I don't have information about that. Please contact support.";
    }

    // 4. Save conversation if user is authenticated
    if (req.user) {
      let chat = await Chat.findOne({ userId: req.user._id });
      if (!chat) {
        chat = new Chat({ userId: req.user._id, messages: [] });
      }

      chat.messages.push({ role: 'user', text: q });
      chat.messages.push({ role: 'assistant', text: answer });
      chat.isUnread = true;
      await chat.save();

      // Emit real-time update
      const io = req.app.get('io');
      if (io) {
        io.emit('new_conversation', {
          id: chat._id,
          user_name: req.user.name || req.user.email,
          snippet: q,
          createdAt: new Date()
        });
      }
    }

    res.json({ answer });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      answer: 'Sorry, I encountered an error processing your request.' 
    });
  }
});

export default router;
```

#### Sample 3: Semantic Knowledge Search (Backend)

```javascript
// utils/searchKnowledge.js
import { searchSimilar } from './vectorStore.js';

export async function searchKnowledge(query, knowledge = []) {
  // Normalize text for matching
  const normalize = (s) => 
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const queryLower = normalize(query);

  // 1. Try vector search first
  try {
    const topResults = await searchSimilar(query, 3);
    if (topResults && topResults.length > 0) {
      return topResults.map(r => r.chunk).join('\n\n');
    }
  } catch (err) {
    console.warn('Vector search failed:', err.message);
  }

  // 2. Fallback to keyword matching
  if (knowledge && knowledge.length > 0) {
    const scored = knowledge.map(item => {
      const keyword = normalize(item.keyword || item.question || '');
      const answer = normalize(item.answer || '');
      const combined = `${keyword} ${answer}`.trim();

      // Exact substring match
      const exactMatch = combined.includes(queryLower) ? 5 : 0;

      // Word overlap
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      const matchCount = queryWords.filter(w => combined.includes(w)).length;

      return { item, score: exactMatch + matchCount };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    // Return top 3 matches if score > 0
    const topMatches = scored.filter(s => s.score > 0).slice(0, 3);
    if (topMatches.length > 0) {
      return topMatches.map(m => {
        const title = m.item.keyword || m.item.question || 'Information';
        const content = m.item.answer || '';
        return `${title}: ${content}`;
      }).join('\n\n');
    }
  }

  return ''; // No context found
}
```

#### Sample 4: Gemini AI Integration (Backend)

```javascript
// utils/getChatResponse.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getChatResponse(userQuestion, context = "") {
  if (!process.env.GEMINI_API_KEY) {
    return { text: "Backend service error: API Key is missing." };
  }

  try {
    const RAG_MODE = (process.env.RAG_MODE || "refine").toLowerCase();

    // System instruction
    let systemInstruction = `You are BUchatbot, Bugema University's friendly AI assistant. 
Answer the user's question politely, concisely, and accurately.

IMPORTANT GUIDELINES:
- If Context is provided about Bugema University topics, use it to produce a concise, accurate answer
- For university-related questions without specific context, provide helpful general guidance
- For questions not related to Bugema University, respond politely but gently redirect to university topics
- Always maintain a friendly, professional tone representing Bugema University
- Do not fabricate university-specific facts; if you don't know something, say so`;

    // Build user prompt
    const userPrompt = `
Context:
---
${context.trim() || "No specific context was found."}
---

Question: ${userQuestion.trim()}

Please generate a complete and helpful answer to the user's question.`;

    // Try multiple models if needed
    const candidateModels = [
      process.env.GEMINI_MODEL || "gemini-2.5-flash",
      "gemini-1.5-flash",
      "gemini-pro"
    ];

    for (const modelName of candidateModels) {
      try {
        const model = ai.getGenerativeModel({ model: modelName });
        const combinedPrompt = `${systemInstruction}\n\n${userPrompt}`;

        const response = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: combinedPrompt }] }]
        });

        // Extract text from response
        let responseText = response?.text || 
                          response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          return { text: responseText.trim() };
        }
      } catch (err) {
        console.warn(`Model ${modelName} failed:`, err.message);
        continue;
      }
    }

    // If all models fail, return context or error
    if (context && context.trim()) {
      return { text: context };
    }
    return { text: "I don't have that information. Please contact support." };

  } catch (error) {
    console.error('Gemini API error:', error);
    if (context && context.trim()) {
      return { text: context };
    }
    return { 
      text: "I encountered an error. Please try again later." 
    };
  }
}
```

#### Sample 5: Chat Interface Component (Frontend)

```javascript
// frontend/src/Chatbot.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:8000/chat',
        { q: userMessage },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: response.data.answer }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to get response. Please try again.');
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          text: 'Sorry, I encountered an error. Please try again.' 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">BUchatbot</h1>
        <p className="text-sm">Your Bugema University Assistant</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-2xl ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === '