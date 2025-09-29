# SunnyDays Backend

A FastAPI-based weather recommendation engine backend for the SunnyDays application.

## Features

- FastAPI web framework with async support
- MongoDB Atlas integration with Motor
- JWT-based authentication
- CORS support for frontend integration
- Health check endpoint for monitoring

## Setup

### Prerequisites

- Python 3.12+
- MongoDB Atlas account and cluster

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create environment configuration:
```bash
cp .env.example .env
```

5. Edit `.env` file and add your MongoDB URI and other configuration values:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sunnydays?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### Running the Application

Start the development server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Main API: http://localhost:8000/api/v1
- Health check: http://localhost:8000/healthz
- API documentation: http://localhost:8000/docs

## API Endpoints

### Health Check
- `GET /healthz` - Health check with database connectivity test

### API Root
- `GET /api/v1` - API root endpoint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_ENV` | Application environment | `development` |
| `PORT` | Server port | `8000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time in seconds | `3600` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |

## Development

The application uses:
- FastAPI for the web framework
- Motor for async MongoDB operations
- Pydantic v2 for data validation
- Python-jose for JWT handling
- Passlib with Argon2 for password hashing

## Testing

Manual testing is performed through the frontend application. See the development plan for detailed test procedures.