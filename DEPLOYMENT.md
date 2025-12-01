# JanMat Production Deployment Guide

## Quick Start Commands

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run seed
npm run dev
```

### Mobile App Setup
```bash
cd mobile-app
npm install
npm start
# Then run in separate terminal:
npm run android  # or npm run ios
```

### Admin Dashboard Setup
```bash
cd admin-dashboard
npm install
npm start
# Open http://localhost:3000
```

## Default Admin Login
- Username: `admin`
- Password: `admin123`

## API Endpoints
- Base URL: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

## Environment Variables
See `.env.example` files in each directory for required environment variables.

## Production Deployment
1. Set up MongoDB Atlas or self-hosted MongoDB
2. Configure environment variables for production
3. Deploy backend to cloud provider (Heroku/AWS/GCP)
4. Build and publish mobile app to app stores
5. Deploy admin dashboard to static hosting (Netlify/Vercel)

## Key Features Implemented
✅ Anonymous polling system
✅ Real-time vote updates
✅ Petition creation and signing
✅ Admin dashboard
✅ Mobile app with notifications
✅ Sentiment analysis
✅ Geographic insights
✅ Security and rate limiting

Ready for production deployment!