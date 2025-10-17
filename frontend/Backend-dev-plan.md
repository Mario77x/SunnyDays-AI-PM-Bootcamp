# 1) Executive Summary
This document outlines the development plan for the "SunnyDays" weather recommendation engine backend. The backend will be a FastAPI application using MongoDB Atlas for data storage. It will replace the current frontend's mock data and local storage persistence with a robust, scalable, and production-ready backend service.

The plan honors the following constraints:
- **Backend**: FastAPI (Python 3.12), async
- **Database**: MongoDB Atlas with Motor and Pydantic v2
- **No Docker**: The application will be run directly on the host.
- **Testing**: Manual testing will be performed through the frontend.
- **Git**: A single `main` branch workflow will be used.

The development process is broken down into a dynamic number of sprints, ensuring that all frontend features are covered.

# 2) In-scope & Success Criteria
- **In-scope**:
  - User authentication (signup, login, logout).
  - CRUD operations for user activities.
  - Integration with the KNMI API to fetch weather data.
  - Integration with an LLM to provide weather-based activity recommendations.
  - A caching mechanism to minimize external API calls.

- **Success criteria**:
  - All frontend features are fully functional with the new backend.
  - Each sprint's deliverables pass manual UI testing.
  - Code is pushed to the `main` branch on GitHub after each successful sprint.

# 3) API Design
- **Conventions**:
  - **Base path**: `/api/v1`
  - **Error model**:
    ```json
    {
      "error": "Error message"
    }
    ```

- **Endpoints**:
  - **Authentication**:
    - `POST /api/v1/auth/signup` - Register a new user.
      - **Request**: `{ "name": "string", "email": "string", "password": "string" }`
      - **Response**: `{ "token": "string" }`
    - `POST /api/v1/auth/login` - Authenticate a user.
      - **Request**: `{ "email": "string", "password": "string" }`
      - **Response**: `{ "token": "string" }`
    - `POST /api/v1/auth/logout` - Invalidate a user's session.
      - **Request**: (No body)
      - **Response**: `{ "message": "Logged out" }`
    - `GET /api/v1/auth/me` - Get the current user's details.
      - **Request**: (No body)
      - **Response**: `{ "id": "string", "name": "string", "email": "string" }`

  - **Activities**:
    - `GET /api/v1/activities` - Get all activities for the current user.
      - **Response**: `[{ "id": "string", "title": "string", "date": "YYYY-MM-DD", "status": "string" }]`
    - `POST /api/v1/activities` - Create a new activity.
      - **Request**: `{ "title": "string", "date": "YYYY-MM-DD" }`
      - **Response**: `{ "id": "string", "title": "string", "date": "YYYY-MM-DD", "status": "string" }`
    - `PUT /api/v1/activities/{activity_id}` - Update an activity.
      - **Request**: `{ "title": "string", "date": "YYYY-MM-DD" }`
      - **Response**: `{ "id": "string", "title": "string", "date": "YYYY-MM-DD", "status": "string" }`
    - `DELETE /api/v1/activities/{activity_id}` - Delete an activity.
      - **Response**: `{ "message": "Activity deleted" }`

  - **Weather Advice**:
    - `POST /api/v1/weather-advice` - Get weather advice for an activity.
      - **Request**: `{ "date": "YYYY-MM-DD", "activity": "string" }`
      - **Response**: `{ "advice": "yes" | "no", "explanation": "string", "source": "cache" | "live" }`

# 4) Data Model (MongoDB Atlas)
- **Collections**:
  - **users**:
    - `_id`: ObjectId (Primary Key)
    - `name`: String, required
    - `email`: String, required, unique
    - `password`: String, required
    - `createdAt`: DateTime, default: `now()`
    - **Example**:
      ```json
      {
        "_id": "60c72b9f9b1d8c001f8e4d2a",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "password": "hashed_password",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
      ```
  - **activities**:
    - `_id`: ObjectId (Primary Key)
    - `userId`: ObjectId, required, ref: `users`
    - `title`: String, required
    - `date`: Date, required
    - `status`: String, required, enum: `['draft', 'future', 'past']`
    - `createdAt`: DateTime, default: `now()`
    - `updatedAt`: DateTime, default: `now()`
    - **Example**:
      ```json
      {
        "_id": "60c72b9f9b1d8c001f8e4d2b",
        "userId": "60c72b9f9b1d8c001f8e4d2a",
        "title": "Hiking in the Ardennes",
        "date": "2025-10-15T00:00:00.000Z",
        "status": "future",
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
      ```
  - **weather_advice**:
    - `_id`: ObjectId (Primary Key)
    - `request_date`: Date, required
    - `activity`: String, required
    - `weather_data_summary`: Object, required
    - `llm_advice`: String, required, enum: `['yes', 'no']`
    - `llm_explanation`: String, required
    - `createdAt`: DateTime, default: `now()`
    - **Example**:
      ```json
      {
        "_id": "60c72b9f9b1d8c001f8e4d2c",
        "request_date": "2025-10-15T00:00:00.000Z",
        "activity": "Hiking in the Ardennes",
        "weather_data_summary": { "temp": 15, "precipitation": 10 },
        "llm_advice": "yes",
        "llm_explanation": "The weather looks great for hiking!",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
      ```

# 5) Frontend Audit & Feature Map
- **`src/pages/Auth.tsx`**:
  - **Purpose**: User registration and login.
  - **Backend capability**: `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`.
  - **Models**: `users`.
- **`src/pages/Dashboard.tsx`**:
  - **Purpose**: Display, filter, and manage user activities.
  - **Backend capability**: `GET /api/v1/activities`, `DELETE /api/v1/activities/{activity_id}`.
  - **Models**: `activities`.
- **`src/pages/ActivityCreate.tsx`**:
  - **Purpose**: Create a new activity.
  - **Backend capability**: `POST /api/v1/activities`, `POST /api/v1/weather-advice`.
  - **Models**: `activities`, `weather_advice`.
- **`src/pages/ActivityEdit.tsx`**:
  - **Purpose**: Edit an existing activity.
  - **Backend capability**: `PUT /api/v1/activities/{activity_id}`, `POST /api/v1/weather-advice`.
  - **Models**: `activities`, `weather_advice`.

# 6) Configuration & ENV Vars (core only)
- `APP_ENV`: `development`
- `PORT`: `8000`
- `MONGODB_URI`: (To be provided by the user)
- `JWT_SECRET`: (A long, random string)
- `JWT_EXPIRES_IN`: `3600` (1 hour)
- `CORS_ORIGINS`: (Frontend URL, e.g., `http://localhost:5173`)
- `KNMI_API_KEY`: (KNMI API key)
- `LLM_API_KEY`: (LLM provider API key)

# 7) Background Work
- No background tasks are required for the initial implementation.

# 8) Integrations
- **KNMI API**: To fetch weather data. Requires `KNMI_API_KEY`.
- **LLM Provider API**: To get activity recommendations. Requires `LLM_API_KEY`.

# 9) Testing Strategy (Manual via Frontend)
- **Policy**: All backend features will be validated by interacting with the frontend UI.
- **Per-sprint Manual Test Checklist (Frontend)**: Each sprint will include a checklist of UI steps to verify the implemented features.
- **User Test Prompt**: A short, clear prompt will be provided for each sprint to guide a human tester.
- **Post-sprint**: If all tests pass, the code will be committed and pushed to the `main` branch on GitHub.

# 10) Dynamic Sprint Plan & Backlog (S0…Sn)
- **S0 - Environment Setup & Frontend Connection**
  - **Objectives**:
    - Create a basic FastAPI application with `/api/v1` and `/healthz` endpoints.
    - Ask the user for the `MONGODB_URI` and configure it.
    - Implement `/healthz` to check database connectivity.
    - Enable CORS for the frontend origin.
    - Initialize Git and push the initial commit to GitHub.
  - **Definition of Done**:
    - The backend runs locally, and `/healthz` returns a successful response.
    - The repository exists on GitHub with the `main` branch.
  - **Manual Test Checklist (Frontend)**:
    - Start the backend.
    - Access `http://localhost:8000/healthz` in a browser and verify the response.
  - **User Test Prompt**:
    - "Please run the backend and confirm that you can access the `/healthz` endpoint and it shows a successful database connection."
  - **Post-sprint**:
    - Commit and push to `main`.

- **S1 - Basic Auth (signup, login, logout)**
  - **Objectives**:
    - Implement user signup, login, and logout functionality.
    - Protect the activities endpoints.
  - **Endpoints**:
    - `POST /api/v1/auth/signup`
    - `POST /api/v1/auth/login`
    - `POST /api/v1/auth/logout`
    - `GET /api/v1/auth/me`
  - **Tasks**:
    - Create the `users` collection.
    - Hash passwords using Argon2.
    - Issue JWTs on login.
    - Create middleware to protect routes.
  - **Definition of Done**:
    - Users can sign up, log in, and log out through the frontend.
    - Unauthorized users cannot access protected routes.
  - **Manual Test Checklist (Frontend)**:
    - Create a new user account.
    - Log in with the new account.
    - Access the dashboard.
    - Log out.
    - Try to access the dashboard again (should be redirected to the login page).
  - **User Test Prompt**:
    - "Please test the user authentication flow: sign up, log in, view the dashboard, log out, and verify that you can no longer access the dashboard."
  - **Post-sprint**:
    - Commit and push to `main`.

- **S2 - Activity Management (CRUD)**
  - **Objectives**:
    - Implement CRUD operations for activities.
  - **Endpoints**:
    - `GET /api/v1/activities`
    - `POST /api/v1/activities`
    - `PUT /api/v1/activities/{activity_id}`
    - `DELETE /api/v1/activities/{activity_id}`
  - **Tasks**:
    - Create the `activities` collection.
    - Implement the API endpoints for activity management.
    - Connect the frontend to the new endpoints.
  - **Definition of Done**:
    - Users can create, view, update, and delete activities from the frontend.
  - **Manual Test Checklist (Frontend)**:
    - Create a new activity.
    - Verify that the activity appears on the dashboard.
    - Edit the activity.
    - Verify that the changes are saved.
    - Delete the activity.
    - Verify that the activity is removed from the dashboard.
  - **User Test Prompt**:
    - "Please test the activity management features: create, edit, and delete an activity, and ensure that the changes are reflected on the dashboard."
  - **Post-sprint**:
    - Commit and push to `main`.

- **S3 - Weather Advice Integration**
  - **Objectives**:
    - Integrate with the KNMI and LLM APIs.
    - Implement the weather advice endpoint with caching.
  - **Endpoints**:
    - `POST /api/v1/weather-advice`
  - **Tasks**:
    - Create the `weather_advice` collection.
    - Implement the `knmiService` to fetch weather data.
    - Implement the `llmService` to get recommendations.
    - Implement the `cacheService` to cache results.
    - Connect the frontend to the weather advice endpoint.
  - **Definition of Done**:
    - Users can get weather advice for their activities.
    - Caching is working as expected.
  - **Manual Test Checklist (Frontend)**:
    - Create an activity and get weather advice.
    - Verify that the advice is displayed.
    - Get advice for the same activity again and verify that the `source` is "cache".
  - **User Test Prompt**:
    - "Please test the weather advice feature. Create an activity, get advice, and then get advice for the same activity again to verify that the caching is working."
  - **Post-sprint**:
    - Commit and push to `main`.