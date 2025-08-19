# NydArt Advisor - AI-Powered Art Analysis Platform

## 🎨 Overview

NydArt Advisor is a comprehensive AI-powered art analysis platform that provides intelligent insights and recommendations for artists, collectors, and art enthusiasts. The platform consists of 7 microservices working together to deliver a seamless art analysis experience.

## 🏗️ Architecture

This project follows a microservices architecture with the following components:

### Core Services
- **Frontend Service** (`front/`) - Next.js 14 React application
- **Authentication Service** (`auth_service/`) - JWT-based authentication with OAuth
- **Database Service** (`db_service/`) - MongoDB data management
- **AI Service** (`ai_service/`) - OpenAI GPT-4 Vision API integration
- **Payment Service** (`payment_service/`) - Stripe and PayPal integration
- **Notification Service** (`notification_service/`) - Email and SMS notifications
- **Metrics Service** (`metrics_service/`) - Prometheus monitoring and analytics

### Supporting Infrastructure
- **Root Configuration** - Project-wide scripts, documentation, and configuration
- **Test Suite** - Comprehensive testing framework
- **Bug Management** - Automated bug detection and correction system
- **Documentation** - Complete technical documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Redis (optional, for caching)
- Git

### 1. Clone the Organization Repository
```bash
# Clone this main repository (contains all configuration and documentation)
git clone https://github.com/NydArt-Advisor/nydart-advisor_main.git
cd nydart-advisor-main
```

### 2. Clone Individual Service Repositories
```bash
# Clone each service into the main directory
git clone https://github.com/NydArt-Advisor/front.git
git clone https://github.com/NydArt-Advisor/auth_service.git 
git clone https://github.com/NydArt-Advisor/db_service.git 
git clone https://github.com/NydArt-Advisor/ai_service.git
git clone https://github.com/NydArt-Advisor/payment_service.git
git clone https://github.com/NydArt-Advisor/notification_service.git
git clone https://github.com/NydArt-Advisor/metrics_service.git 
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install dependencies for each service
npm run setup:deps
```

### 4. Configure Environment Variables
```bash
# Copy example environment files
npm run setup:env

# Configure each service's .env file with your credentials
# See individual service documentation for required variables
```

### 5. Start All Services
```bash
# Start all services in development mode
npm run dev

# Or start services individually
npm run start:auth
npm run start:db
npm run start:ai
npm run start:payment
npm run start:notification
npm run start:metrics
npm run start:front
```

## 📁 Project Structure

```
nydart-advisor-main/
├── front/                          # Frontend service (Next.js)
├── auth_service/                   # Authentication service
├── db_service/                     # Database service
├── ai_service/                     # AI analysis service
├── payment_service/                # Payment processing service
├── notification_service/           # Notification service
├── metrics_service/                # Metrics and monitoring service
├── scripts/                        # Project-wide scripts
│   ├── run-test-book.js           # Comprehensive test runner
│   ├── setup-test-data.js         # Test data setup
│   ├── bug-tracker.js             # Bug tracking system
│   ├── bug-analyzer.js            # Bug analysis and fixes
│   └── start-all.js               # Service startup script
├── docs/                          # Documentation
│   ├── TECHNICAL_DOCUMENTATION.md # Complete technical docs
│   ├── TEST_BOOK.md              # Test scenarios and results
│   ├── BUG_CORRECTION_PLAN.md    # Bug management strategy
│   └── BUG_CORRECTION_EXECUTION_GUIDE.md
├── package.json                   # Root package.json with scripts
├── README.md                      # This file
├── .env.example                   # Example environment variables
└── .gitignore                     # Git ignore rules
```

## 🧪 Testing

### Run All Tests
```bash
# Run comprehensive test suite
npm run test:all

# Run specific test categories
npm run test:services      # Service-level tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:performance   # Performance tests
npm run test:accessibility # Accessibility tests
```

### Test Setup
```bash
# Setup test data
npm run test:setup

# Clean test data
npm run test:setup:clean
```

## 🐛 Bug Management

### Bug Detection and Analysis
```bash
# Detect bugs from test results
npm run bug:detect test-results.json

# Analyze a specific bug
npm run bug:analyze BUG-1234567890-123

# Generate fix for a bug
npm run bug:generate-fix BUG-1234567890-123
```

### Bug Tracking
```bash
# Create a bug
npm run bug:create "Title" "Description" service severity category

# List bugs
npm run bug:list

# Generate bug report
npm run bug:report summary
```

## 📚 Documentation

### Technical Documentation
- [Complete Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md) - Comprehensive guide for all services
- [Test Book](docs/TEST_BOOK.md) - Test scenarios and expected results
- [Bug Correction Plan](docs/BUG_CORRECTION_PLAN.md) - Bug management strategy
- [Bug Correction Execution Guide](docs/BUG_CORRECTION_EXECUTION_GUIDE.md) - Step-by-step bug management

### Service-Specific Documentation
Each service contains its own detailed documentation:
- `auth_service/TECHNICAL_DOCUMENTATION.md`
- `db_service/TECHNICAL_DOCUMENTATION.md`
- `ai_service/TECHNICAL_DOCUMENTATION.md`
- `payment_service/TECHNICAL_DOCUMENTATION.md`
- `notification_service/TECHNICAL_DOCUMENTATION.md`
- `metrics_service/TECHNICAL_DOCUMENTATION.md`
- `front/TECHNICAL_DOCUMENTATION.md`

## 🔧 Development Workflow

### 1. Setup Development Environment
```bash
# Clone and setup as described above
# Ensure all services are running
npm run dev
```

### 2. Make Changes
- Work on individual services in their respective directories
- Follow service-specific development guidelines
- Use the provided test suites to validate changes

### 3. Test Changes
```bash
# Run tests for specific service
cd auth_service && npm test

# Run all tests
npm run test:all
```

### 4. Bug Management
```bash
# If bugs are found, use the bug management system
npm run bug:create "Bug title" "Description" service severity category
npm run bug:analyze BUG-ID
npm run bug:generate-fix BUG-ID
```

### 5. Documentation
- Update relevant documentation when making changes
- Follow the established documentation structure
- Include examples and usage instructions

## 🚀 Deployment

### Development Deployment
```bash
# Start all services locally
npm run dev
```

### Production Deployment
Each service has its own deployment configuration:
- **Frontend**: Vercel deployment
- **Backend Services**: Render.com deployment
- **Database**: MongoDB Atlas
- **Monitoring**: Prometheus + Grafana

See individual service documentation for detailed deployment instructions.

## 🤝 Contributing

### For New Developers

1. **Familiarize yourself with the architecture**
   - Read the [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
   - Understand the microservices pattern
   - Review the test book for expected behaviors

2. **Set up your development environment**
   - Follow the Quick Start guide above
   - Ensure all services are running correctly
   - Run the test suite to verify setup

3. **Choose your area of focus**
   - Each service is self-contained
   - Work on one service at a time
   - Use the bug management system for issues

4. **Follow development guidelines**
   - Write tests for new features
   - Update documentation
   - Use the bug tracking system
   - Follow the established code patterns

### Development Guidelines

- **Testing**: Write comprehensive tests for all new features
- **Documentation**: Update relevant documentation
- **Bug Management**: Use the automated bug tracking system
- **Code Quality**: Follow established patterns and conventions
- **Security**: Follow security best practices
- **Accessibility**: Ensure WCAG 2.1 AA compliance

## 📊 Monitoring and Analytics

### Metrics Dashboard
- Access metrics at: `http://localhost:5006`
- Monitor service health and performance
- Track user interactions and system usage

### Logs
- Each service maintains its own logs
- Check service directories for log files
- Use centralized logging for production

## 🔒 Security

### Security Features
- JWT-based authentication
- OAuth 2.0 integration
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Security headers

### Security Testing
```bash
# Run security tests
npm run test:security

# Check for vulnerabilities
npm audit
```

## 🌐 API Documentation

### Service Endpoints
Each service exposes RESTful APIs:
- **Auth Service**: `http://localhost:5002`
- **Database Service**: `http://localhost:5001`
- **AI Service**: `http://localhost:5003`
- **Payment Service**: `http://localhost:5004`
- **Notification Service**: `http://localhost:5005`
- **Metrics Service**: `http://localhost:5006`
- **Frontend**: `http://localhost:3000`

### API Documentation
See individual service documentation for detailed API specifications.

## 🆘 Support

### Getting Help
1. Check the [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md)
2. Review service-specific documentation
3. Use the bug management system for issues
4. Check the test book for expected behaviors

### Common Issues
- **Service won't start**: Check environment variables and dependencies
- **Tests failing**: Ensure all services are running and configured
- **API errors**: Verify service URLs and authentication
- **Database issues**: Check MongoDB connection and credentials

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 Vision API
- Stripe and PayPal for payment processing
- MongoDB for database services
- Next.js and React for frontend framework
- All contributors and maintainers

---

**For detailed information about each service, see the individual service documentation and the comprehensive [Technical Documentation](docs/TECHNICAL_DOCUMENTATION.md).**
