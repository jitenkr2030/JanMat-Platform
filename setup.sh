#!/bin/bash

# JanMat Full Stack App Setup Script
# Production-Grade Mobile App for Public Opinion & Citizen Voice

echo "🇮🇳 JanMat Full Stack App Setup"
echo "==============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v16 or higher) first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env file. Please update with your MongoDB URI and JWT secret."
fi

echo "✅ Backend dependencies installed"
cd ..
echo ""

# Install mobile app dependencies
echo "📱 Installing mobile app dependencies..."
cd mobile-app
npm install
if [ $? -ne 0 ]; then
    echo "❌ Mobile app installation failed"
    exit 1
fi
echo "✅ Mobile app dependencies installed"
cd ..
echo ""

# Install admin dashboard dependencies
echo "💻 Installing admin dashboard dependencies..."
cd admin-dashboard
npm install
if [ $? -ne 0 ]; then
    echo "❌ Admin dashboard installation failed"
    exit 1
fi
echo "✅ Admin dashboard dependencies installed"
cd ..
echo ""

# Install root dependencies
echo "🔧 Installing root dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Root dependencies installation failed"
    exit 1
fi
echo "✅ Root dependencies installed"
echo ""

echo "🎉 JanMat setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update backend/.env with your MongoDB URI and JWT secret"
echo "2. Start the backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the admin dashboard (in a new terminal):"
echo "   cd admin-dashboard && npm start"
echo "   Then visit: http://localhost:3000"
echo "   Default login: admin / admin123"
echo ""
echo "4. Start the mobile app (in a new terminal):"
echo "   cd mobile-app && npm start"
echo ""
echo "🌐 Backend API: http://localhost:5000/api"
echo "🏥 Health Check: http://localhost:5000/health"
echo ""
echo "🔧 To seed the database with sample data:"
echo "   cd backend && npm run seed"
echo ""
echo "🇮🇳 JanMat - The Voice of the People!"
echo "Ready for production deployment!"