# 🚀 Quick Setup Guide - NydArt Advisor

## ⚡ Get Started in 5 Minutes

This guide will help you set up the entire NydArt Advisor project quickly.

## 📋 Prerequisites

- Node.js 18+ 
- Git
- MongoDB (local or Atlas)
- GitHub account with access to NydArt-Advisor organization

## 🎯 Quick Setup

### 1. Clone and Setup (Automated)

```bash
# Clone the main repository
git clone https://github.com/NydArt-Advisor/nydart-advisor-main.git
cd nydart-advisor-main

# Run automated setup (this will clone all services and install dependencies)
npm run setup
```

### 2. Configure Environment

```bash
# Setup environment files
npm run setup:env

# Edit each service's .env file with your credentials
# See individual service documentation for required variables
```

### 3. Start Development

```bash
# Start all services
npm run dev

# Access the application
# Frontend: http://localhost:3000
# Services: http://localhost:5001-5006
```

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

```bash
# Clone main repository
git clone https://github.com/NydArt-Advisor/nydart-advisor-main.git
cd nydart-advisor-main

# Clone each service
git clone https://github.com/NydArt-Advisor/front.git
git clone https://github.com/NydArt-Advisor/auth_service.git auth_service
git clone https://github.com/NydArt-Advisor/db_service.git db_service
git clone https://github.com/NydArt-Advisor/ai_service.git ai_service
git clone https://github.com/NydArt-Advisor/payment_service.git payment_service
git clone https://github.com/NydArt-Advisor/notification_service.git notification_service
git clone https://github.com/NydArt-Advisor/metrics_service.git metrics_service

# Install dependencies
npm install
npm run setup:deps

# Setup environment
npm run setup:env

# Start services
npm run dev
```

## 🧪 Verify Setup

```bash
# Run tests to verify everything is working
npm run test:all

# Check service health
curl http://localhost:5001/api/health  # Database service
curl http://localhost:5002/api/health  # Auth service
curl http://localhost:5000/api/health  # AI service
curl http://localhost:3004/api/health  # Payment service
curl http://localhost:4003/api/health  # Notification service
curl http://localhost:5005/api/health  # Metrics service
```

## 📚 Next Steps

1. **Read Documentation**: Check `README.md` and `docs/TECHNICAL_DOCUMENTATION.md`
2. **Configure Services**: Set up your API keys and database connections
3. **Run Tests**: Verify everything is working with `npm run test:all`
4. **Start Developing**: Choose a service to work on

## 🆘 Need Help?

- **Documentation**: `README.md` and `docs/` directory
- **Issues**: Use the bug management system: `npm run bug:create`
- **Tests**: Run `npm run test:all` to check for issues

## 🎯 Service Overview

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js React application |
| Database | 5001 | MongoDB data management |
| Auth | 5002 | JWT + OAuth authentication |
| AI | 5000 | OpenAI GPT-4 Vision integration |
| Payment | 3004 | Stripe + PayPal processing |
| Notification | 4003 | Email + SMS notifications |
| Metrics | 5005 | Prometheus monitoring |

## 🔄 Development Workflow

```bash
# Work on a specific service
cd auth_service
npm test          # Run tests
npm start         # Start service
# Make changes...
git add .
git commit -m "feat: add new feature"
git push origin main

# Run integration tests
cd ..
npm run test:integration
```

## 🐛 Bug Management

```bash
# Report a bug
npm run bug:create "Bug title" "Description" service severity category

# Analyze bugs
npm run bug:analyze BUG-ID

# Generate fixes
npm run bug:generate-fix BUG-ID
```

---

**You're all set! 🎉 Start exploring the codebase and building amazing features for NydArt Advisor.**
