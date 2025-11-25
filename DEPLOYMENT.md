# Deployment Guide

## ⚠️ CRITICAL: Database & Security Notes

### Current Architecture
This application currently uses **in-memory storage** (JavaScript Maps) for:
- User accounts and authentication
- User filtering criteria
- TED notices cache
- Notifications

**This means all data is lost when the server restarts!**

### Before Production Deployment

#### 1. Database Setup Required
You MUST implement persistent storage before production:

**Option A: PostgreSQL (Recommended)**
```bash
# Install PostgreSQL client
npm install pg

# Create tables for:
# - users (id, email, password_hash, created_at)
# - user_criteria (user_id, keywords, countries, cpv_codes, value_range)
# - notices (id, title, description, country, cpv_codes, etc.)
# - notifications (id, user_id, notice_id, sent, created_at)
```

**Option B: Use Supabase Database**
- Already have Supabase configured for auth
- Can use Supabase PostgreSQL for data storage
- Update models to use Supabase client instead of Maps

#### 2. Environment Variables Setup

**Backend (.env)**
```bash
# Copy example file
cp .env.example .env

# Edit .env with your actual values:
PORT=3000
SUPABASE_URL=your_actual_supabase_url
SUPABASE_ANON_KEY=your_actual_supabase_key
JWT_SECRET=generate_a_strong_random_secret_here
TED_API_KEY=your_ted_api_key
```

**Frontend (client/.env)**
```bash
cd client
cp .env.example .env

# Edit client/.env:
REACT_APP_API_URL=https://your-backend-domain.com/api
REACT_APP_SUPABASE_URL=your_actual_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_actual_supabase_key
```

#### 3. Security Checklist

- [ ] Remove all hardcoded credentials (DONE ✅)
- [ ] Set strong JWT_SECRET in production
- [ ] Implement password hashing (bcrypt) in auth-simple.js
- [ ] Add rate limiting (express-rate-limit)
- [ ] Enable HTTPS only in production
- [ ] Set up CORS properly for your domain
- [ ] Implement database persistence
- [ ] Set up proper logging (Winston, Pino)
- [ ] Add monitoring (Sentry, DataDog)

#### 4. Authentication Mode

Choose one authentication method:

**Simple Auth (Current - auth-simple.js)**
- JWT-based, in-memory storage
- Good for development/testing
- Requires database implementation for production

**Supabase Auth (auth.js)**
- Fully managed authentication
- Persistent user storage
- Change in src/app.js: `require('./routes/auth')` instead of `auth-simple`

## Deployment Steps

### Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set PORT=3000
heroku config:set JWT_SECRET=your-secret
heroku config:set TED_API_KEY=your-key
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_ANON_KEY=your-key

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Set environment variables in Railway dashboard
# Deploy
railway up
```

### Deploy to Render

1. Connect GitHub repo to Render
2. Create Web Service
3. Set environment variables in dashboard
4. Deploy automatically on push

### Deploy Frontend (Vercel/Netlify)

**Vercel:**
```bash
cd client
npm install -g vercel
vercel
```

**Netlify:**
```bash
cd client
npm run build
# Upload build/ folder to Netlify
```

## Post-Deployment

1. Test authentication endpoints
2. Test TED API integration
3. Verify cron job is running
4. Monitor error logs
5. Set up database backups
6. Configure email notifications (SendGrid, AWS SES)

## Database Migration Priority

Files that need database integration:
1. `src/routes/auth-simple.js` - User storage
2. `src/services/filterService.js` - User criteria & notifications
3. `src/services/tedService.js` - Notice caching
4. `src/models/User.js` - Add database methods
5. `src/models/Notice.js` - Add database methods

## Support

For issues, check:
- Application logs
- Database connection status
- Environment variables are set
- TED API key is valid
- Supabase project is active
