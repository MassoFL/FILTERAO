# TED Notice Filter - Frontend

React frontend for the TED Notice Filter application.

## Features

- 🔐 User authentication (Supabase)
- 📊 Dashboard with statistics
- 🎯 Filter criteria management
- 📋 Browse TED notices
- 🔔 Notifications for matching tenders

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at http://localhost:3001

## Pages

- **Login/Signup** - User authentication
- **Dashboard** - Overview of notices and stats
- **My Criteria** - Set filtering preferences (keywords, countries, CPV codes, value range)
- **Notices** - Browse and search TED notices

## Environment Variables

Create a `.env.local` file:

```
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

## Tech Stack

- React 19
- React Router v6
- Axios
- Supabase Auth
- CSS3
