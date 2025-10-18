# SmartStay AI

An AI-powered hotel booking platform with two modes:
- Normal Mode: Traditional hotel search, list, details, and comparison, enhanced with AI summaries.
- AI Mode: Conversational travel planner using Google Gemini, with interactive hotel cards and travel plan suggestions.

Stack
- Frontend: Vite + React + Tailwind CSS
- Backend: Node.js + Express (proxies LiteAPI and calls Gemini API)
- AI: Google Gemini API
- Hotels: LiteAPI (via backend proxy)
- State: React Hooks / Context
- Storage: sessionStorage / localStorage

Prerequisites
- Node.js 18+
- API Keys:
  - Google Gemini API key
  - LiteAPI key and base URL

Environment Variables
Create `server/.env` with:

- PORT=5000
- CLIENT_ORIGIN=http://localhost:5173
- GEMINI_API_KEY=YOUR_GEMINI_API_KEY
- GEMINI_MODEL=gemini-1.5-flash
- LITEAPI_BASE_URL=https://YOUR_LITEAPI_BASE_URL
- LITEAPI_KEY=YOUR_LITEAPI_KEY
- LITEAPI_TIMEOUT_MS=20000

Note: If your LiteAPI uses a custom auth header, adjust `liteapiController.js` accordingly or add `LITEAPI_AUTH_HEADER_NAME` and `LITEAPI_AUTH_SCHEME` (bearer|apikey) per the comments in code.

Folder Structure
smartstay-ai/
├── client/                     # Vite + React frontend
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── index.css
│       ├── main.jsx
│       ├── App.jsx
│       ├── context/ModeContext.jsx
│       ├── components/
│       │   ├── ModeToggle.jsx
│       │   ├── SearchBar.jsx
│       │   ├── HotelCard.jsx
│       │   ├── HotelComparison.jsx
│       │   └── ChatAssistant.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── HotelList.jsx
│       │   ├── HotelDetails.jsx
│       │   └── AIMode.jsx
│       └── lib/api.js
├── server/                     # Node.js + Express backend
│   ├── package.json
│   ├── index.js
│   ├── .env.example
│   ├── routes/
│   │   ├── geminiRoutes.js
│   │   └── liteapiRoutes.js
│   └── controllers/
│       ├── geminiController.js
│       └── liteapiController.js
└── README.md

Quick Start (Windows cmd.exe)
1) Install dependencies
- Client
  - cd client
  - npm install
- Server
  - cd ..\server
  - npm install

2) Configure environment
- Copy `server/.env.example` to `server/.env` and fill values.

3) Run
- Backend
  - In `server/`:
    - node index.js
- Frontend
  - In `client/`:
    - npm run dev

The app will be at http://localhost:5173 and backend at http://localhost:5000.

Notes
- No database used. Session/local storage remembers mode and recent search filters.
- Backend proxies LiteAPI to keep keys secret and handle CORS.
- If LiteAPI error shapes differ, adjust controllers based on your Postman collection.
- For production, set strict CORS (`CLIENT_ORIGIN`) and secure env handling.
