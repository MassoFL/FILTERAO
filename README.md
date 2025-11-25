# TED Notice Filtering App

A Node.js application that fetches notices from the TED (Tenders Electronic Daily) platform and filters them based on user-defined criteria.

## Features

- **User Management**: Users can register with specific filtering criteria
- **Automated Notice Fetching**: Hourly fetching of new TED notices
- **Smart Filtering**: Matches notices to users based on keywords, countries, CPV codes, and value ranges
- **Notification System**: Sends relevant notices to interested users

## Quick Start

### Backend

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the backend server**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Test the API**:
   ```bash
   curl http://localhost:3000/health
   ```

### Frontend

1. **Navigate to client folder**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the React app**:
   ```bash
   npm start
   ```

The frontend will open at http://localhost:3001

## API Endpoints

### Authentication (Supabase)
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/user` - Get current user info

### Users (Protected Routes)
- `POST /api/users/criteria` - Create/update user filtering criteria
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/criteria` - Update user criteria
- `GET /api/users/notifications` - Get user notifications

### Notices
- `GET /api/notices` - Get all notices
- `GET /api/notices/:id` - Get specific notice
- `POST /api/notices/fetch` - Manually trigger notice fetching

## Example Usage

### 1. Sign Up
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@example.com",
    "password": "securepassword123"
  }'
```

### 2. Sign In
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@example.com",
    "password": "securepassword123"
  }'
```

### 3. Set Up Filtering Criteria (requires auth token)
```bash
curl -X POST http://localhost:3000/api/users/criteria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "criteria": {
      "keywords": ["construction", "hospital"],
      "countries": ["FR", "DE"],
      "cpvCodes": ["45000000-7"],
      "valueRange": { "min": 100000, "max": 5000000 }
    }
  }'
```

### Fetch New Notices
```bash
curl -X POST http://localhost:3000/api/notices/fetch
```

## User Criteria Options

- **keywords**: Array of keywords to match in title/description
- **countries**: Array of country codes (e.g., ["FR", "DE", "IT"])
- **cpvCodes**: Array of CPV (Common Procurement Vocabulary) codes
- **valueRange**: Object with min/max estimated values
- **contractTypes**: Array of contract types ("Works", "Supplies", "Services")

## Authentication Flow

1. **Sign up/Sign in** using Supabase Auth
2. **Get access token** from the response
3. **Include token** in Authorization header: `Bearer YOUR_ACCESS_TOKEN`
4. **Set up criteria** and receive filtered notifications

## Development Notes

- **Authentication**: Integrated with Supabase Auth
- **Protected Routes**: All user operations require valid JWT tokens
- Currently uses mock data for TED API integration
- In-memory storage (replace with database for production)
- Notification system logs to console (integrate with email service)
- Scheduled to fetch notices every hour using node-cron

## Next Steps

1. Integrate with actual TED API
2. Add database persistence (PostgreSQL/MongoDB)
3. Implement email notifications
4. Add user authentication
5. Create web interface
6. Add more sophisticated matching algorithms