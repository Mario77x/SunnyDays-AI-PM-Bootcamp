# SunnyDays - Weather Recommendation Engine

A full-stack application that helps users plan outdoor activities based on weather conditions, built with React TypeScript frontend and FastAPI Python backend.

## 🏗️ Project Structure

```
SunnyDays/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/           # FastAPI Python backend
    ├── *.py files
    ├── requirements.txt
    └── .env
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.12+
- MongoDB Atlas account (connection string provided)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend will start on `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` or `http://localhost:5138`

## 🧪 Testing the Application

### Full Application Test
1. Open your browser to the frontend URL (e.g., `http://localhost:5138`)
2. Click "Registreer hier" to create a new account
3. Fill in the registration form and submit
4. Log in with your credentials
5. Create a new activity from the dashboard
6. Test the weather advice feature during activity creation

### API Testing
You can test the backend API directly:

```bash
# Health check
curl http://localhost:8000/healthz

# Weather advice health
curl http://localhost:8000/api/v1/weather-advice/health

# Create user and get token
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "testpass123"}'

# Test weather advice (replace TOKEN with actual token)
curl -X POST "http://localhost:8000/api/v1/weather-advice" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"date": "2025-10-15T10:00:00Z", "activity": "hiking"}'
```

## 🔑 API Keys Configuration

The application currently uses mock data for weather and LLM services. To enable live integrations:

### KNMI Weather API
1. Get an API key from [KNMI Open Data](https://developer.dataplatform.knmi.nl/)
2. Update `backend/.env`:
   ```env
   KNMI_API_KEY=your-actual-knmi-api-key
   ```

### LLM Service (OpenAI)
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Update `backend/.env`:
   ```env
   LLM_API_KEY=your-actual-openai-api-key
   ```

### Current Fallback Systems
- **KNMI Service**: Uses realistic mock weather data with seasonal variations
- **LLM Service**: Uses rule-based recommendations that categorize activities (outdoor, water, winter, indoor) and provide weather-appropriate advice

## 📋 Features Implemented

### Backend (FastAPI)
- ✅ **Sprint S0**: Environment setup and database connectivity
- ✅ **Sprint S1**: User authentication (signup, login, JWT)
- ✅ **Sprint S2**: Activity CRUD operations
- ✅ **Sprint S3**: Weather advice integration with caching

### Frontend (React TypeScript)
- ✅ Multi-language support (Dutch/English)
- ✅ Responsive design with mobile support
- ✅ Authentication system
- ✅ Activity management
- ✅ Weather advice integration
- ✅ Toast notifications and error handling

## 🗄️ Database

The application uses MongoDB Atlas with the following collections:
- `users` - User accounts and authentication
- `activities` - User activities with weather assessments
- `weather_advice` - Cached weather recommendations (6-hour TTL)

## 🔧 Development

### Backend Development
- FastAPI with async/await
- MongoDB with Motor (async driver)
- JWT authentication with Argon2 password hashing
- Comprehensive error handling and logging
- API documentation available at `http://localhost:8000/docs`

### Frontend Development
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- React Router for navigation
- Context API for state management

## 📝 GitHub Repository Status

All code has been pushed to GitHub: **https://github.com/Mario77x/SunnyDays-AI-PM-Bootcamp**

**Main Branch** (`main`): Complete frontend React TypeScript application
- Initial commit: Complete React application (103 files, 21,515+ lines)
- Setup documentation and project structure
- Merge commit with remote changes

**Backend Branch** (`backend-main`): FastAPI Python backend
- Initial commit: Sprint S0 - Environment Setup
- Sprint S3 commit: Weather Advice Integration (11 files, 1,330+ lines)
- All backend components and API endpoints

**Repository Structure:**
```
GitHub Repository (main branch): Frontend + Documentation
GitHub Repository (backend-main branch): Backend API
Local Development: Both frontend/ and backend/ directories
```

## 🚀 Next Steps

1. **Add API Keys**: Configure KNMI and OpenAI API keys for live data
2. **Deploy**: Consider deployment to services like Vercel (frontend) and Railway/Render (backend)
3. **Testing**: Comprehensive testing with real weather data
4. **Features**: Additional features like notifications, social sharing, etc.

## 🐛 Troubleshooting

### CORS Issues
If you encounter CORS errors, ensure the backend `.env` file includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:5173,http://localhost:5138
```

### Database Connection
The MongoDB connection string is already configured. If you see connection errors, check your internet connection.

### Port Conflicts
If ports are in use, the applications will automatically try alternative ports. Check the terminal output for the actual URLs.