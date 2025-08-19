# GitHub Organization Setup Guide

## 🏢 NydArt-Advisor Organization Structure

This guide explains how to set up the GitHub organization for the NydArt Advisor project and how future developers should work with the repositories.

## 📋 Organization Overview

The **NydArt-Advisor** organization contains the following repositories:

### 🎯 Main Repository
- **`nydart-advisor-main`** - This repository (contains all configuration, documentation, and scripts)

### 🔧 Service Repositories
- **`front`** - Frontend service (Next.js 14 React application)
- **`auth-service`** - Authentication service (JWT + OAuth)
- **`database-service`** - Database service (MongoDB management)
- **`ai-service`** - AI service (OpenAI GPT-4 Vision integration)
- **`payment-service`** - Payment service (Stripe + PayPal)
- **`notification-service`** - Notification service (Email + SMS)
- **`metrics-service`** - Metrics service (Prometheus monitoring)

## 🚀 For Future Developers

### Step 1: Get Access to the Organization

1. **Request Access**: Contact the organization owner to get added as a member
2. **Fork or Clone**: You can either fork repositories or clone them directly
3. **Set Up SSH Keys**: Ensure your SSH keys are configured for GitHub

### Step 2: Initial Setup

#### Option A: Automated Setup (Recommended)
```bash
# Clone the main repository
git clone https://github.com/NydArt-Advisor/nydart-advisor-main.git
cd nydart-advisor-main

# Run the automated setup script
npm run setup

# This will:
# - Clone all service repositories
# - Install dependencies
# - Set up environment files
# - Configure the development environment
```

#### Option B: Manual Setup
```bash
# Clone the main repository
git clone https://github.com/NydArt-Advisor/nydart-advisor-main.git
cd nydart-advisor-main

# Clone each service repository
git clone https://github.com/NydArt-Advisor/front.git
git clone https://github.com/NydArt-Advisor/auth-service.git auth_service
git clone https://github.com/NydArt-Advisor/database-service.git db_service
git clone https://github.com/NydArt-Advisor/ai-service.git ai_service
git clone https://github.com/NydArt-Advisor/payment-service.git payment_service
git clone https://github.com/NydArt-Advisor/notification-service.git notification_service
git clone https://github.com/NydArt-Advisor/metrics-service.git metrics_service

# Install dependencies
npm install
npm run setup:deps

# Set up environment files
npm run setup:env
```

### Step 3: Configure Environment Variables

1. **Copy Environment Files**:
   ```bash
   # Each service has its own .env.example file
   cp auth_service/env.example auth_service/.env
   cp db_service/env.example db_service/.env
   cp ai_service/env.example ai_service/.env
   cp payment_service/env.example payment_service/.env
   cp notification_service/env.example notification_service/.env
   cp metrics_service/env.example metrics_service/.env
   cp front/env.example front/.env
   ```

2. **Configure Each Service**:
   - **Auth Service**: Set up JWT secret, OAuth credentials, service URLs
   - **Database Service**: Configure MongoDB connection string
   - **AI Service**: Add OpenAI API key
   - **Payment Service**: Configure Stripe and PayPal credentials
   - **Notification Service**: Set up email and SMS providers
   - **Metrics Service**: Configure Prometheus settings
   - **Frontend**: Set up API endpoints and authentication

### Step 4: Start Development

```bash
# Start all services
npm run dev

# Or start individual services
npm run start:auth
npm run start:db
npm run start:ai
npm run start:payment
npm run start:notification
npm run start:metrics
npm run start:front
```

## 🔄 Development Workflow

### Working on Individual Services

1. **Choose a Service**: Each service is in its own directory
2. **Make Changes**: Work on the service code
3. **Test Changes**: Run tests for the specific service
4. **Commit Changes**: Commit to the service repository
5. **Push Changes**: Push to the service repository

### Example Workflow for Auth Service

```bash
# Navigate to auth service
cd auth_service

# Make your changes
# Edit files...

# Run tests
npm test

# Commit changes
git add .
git commit -m "Add new authentication feature"

# Push to repository
git push origin main
```

### Working on Multiple Services

If your changes affect multiple services:

1. **Start with the main repository**: Update documentation and scripts
2. **Update each affected service**: Make changes in each service directory
3. **Test integration**: Run integration tests
4. **Update documentation**: Ensure all documentation is current

## 📚 Documentation Structure

### Main Repository Documentation
- `README.md` - Quick start guide
- `docs/TECHNICAL_DOCUMENTATION.md` - Complete technical documentation
- `docs/TEST_BOOK.md` - Test scenarios and results
- `docs/BUG_CORRECTION_PLAN.md` - Bug management strategy
- `docs/BUG_CORRECTION_EXECUTION_GUIDE.md` - Bug management execution

### Service-Specific Documentation
Each service contains:
- `README.md` - Service overview and setup
- `TECHNICAL_DOCUMENTATION.md` - Detailed technical documentation
- `env.example` - Environment variable template
- `package.json` - Dependencies and scripts

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test categories
npm run test:services      # Service-level tests
npm run test:integration   # Integration tests
npm run test:security      # Security tests
npm run test:performance   # Performance tests
npm run test:accessibility # Accessibility tests

# Run tests for specific service
cd auth_service && npm test
```

### Test Data Setup

```bash
# Setup test data
npm run test:setup

# Clean test data
npm run test:setup:clean
```

## 🐛 Bug Management

### Reporting Bugs

```bash
# Create a bug report
npm run bug:create "Bug title" "Description" service severity category

# Examples:
npm run bug:create "Login fails" "Users cannot login" auth_service critical security
npm run bug:create "Slow API response" "API taking >5 seconds" ai_service high performance
```

### Bug Analysis and Fixes

```bash
# Analyze a bug
npm run bug:analyze BUG-1234567890-123

# Generate fix
npm run bug:generate-fix BUG-1234567890-123

# Apply fix (if auto-fix is enabled)
npm run bug:apply-fix BUG-1234567890-123
```

## 🔧 Available Scripts

### Development Scripts
```bash
npm run dev                    # Start all services
npm run start:auth            # Start auth service
npm run start:db              # Start database service
npm run start:ai              # Start AI service
npm run start:payment         # Start payment service
npm run start:notification    # Start notification service
npm run start:metrics         # Start metrics service
npm run start:front           # Start frontend service
```

### Testing Scripts
```bash
npm run test:all              # Run all tests
npm run test:services         # Service-level tests
npm run test:integration      # Integration tests
npm run test:security         # Security tests
npm run test:performance      # Performance tests
npm run test:accessibility    # Accessibility tests
npm run test:setup            # Setup test data
```

### Bug Management Scripts
```bash
npm run bug:create            # Create bug report
npm run bug:list              # List bugs
npm run bug:analyze           # Analyze bug
npm run bug:generate-fix      # Generate fix
npm run bug:apply-fix         # Apply fix
npm run bug:report            # Generate report
```

### Setup Scripts
```bash
npm run setup                 # Full project setup
npm run setup:deps            # Install dependencies
npm run setup:env             # Setup environment files
```

## 🌐 Service Endpoints

When all services are running:

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:5002
- **Database Service**: http://localhost:5001
- **AI Service**: http://localhost:5003
- **Payment Service**: http://localhost:5004
- **Notification Service**: http://localhost:5005
- **Metrics Service**: http://localhost:5006

## 📊 Monitoring and Analytics

### Metrics Dashboard
- Access: http://localhost:5006
- Monitor service health and performance
- Track user interactions and system usage

### Logs
- Each service maintains its own logs
- Check service directories for log files
- Use centralized logging for production

## 🔒 Security Considerations

### Development Security
- Never commit `.env` files
- Use environment variables for sensitive data
- Follow security best practices
- Run security tests regularly

### Production Security
- Use secure deployment practices
- Implement proper authentication
- Monitor for security vulnerabilities
- Regular security audits

## 🤝 Contributing Guidelines

### Code Standards
- Follow established patterns and conventions
- Write comprehensive tests
- Update documentation
- Use the bug management system

### Pull Request Process
1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Submit pull request
6. Address review comments
7. Merge when approved

### Commit Messages
Use conventional commit format:
```
feat: add new authentication feature
fix: resolve login timeout issue
docs: update API documentation
test: add integration tests for payment service
```

## 🆘 Getting Help

### Documentation
1. Start with the main `README.md`
2. Check service-specific documentation
3. Review the technical documentation
4. Consult the test book for expected behaviors

### Common Issues
- **Service won't start**: Check environment variables and dependencies
- **Tests failing**: Ensure all services are running and configured
- **API errors**: Verify service URLs and authentication
- **Database issues**: Check MongoDB connection and credentials

### Support Channels
- GitHub Issues: Report bugs and request features
- Documentation: Check the comprehensive documentation
- Team Communication: Use established communication channels

## 📈 Project Evolution

### Adding New Services
1. Create new repository in the organization
2. Follow established service patterns
3. Update main repository documentation
4. Add service to setup scripts
5. Update integration tests

### Updating Existing Services
1. Follow the established development workflow
2. Update service documentation
3. Run comprehensive tests
4. Update main repository if needed

### Deprecating Services
1. Plan migration strategy
2. Update documentation
3. Remove from setup scripts
4. Archive repository if necessary

## 🎯 Best Practices

### Development
- Work on one service at a time
- Use the provided test suites
- Follow established patterns
- Update documentation

### Testing
- Write tests for all new features
- Run tests before committing
- Use the comprehensive test suite
- Test integration between services

### Documentation
- Keep documentation current
- Include examples and usage
- Document API changes
- Update setup instructions

### Security
- Follow security best practices
- Use environment variables
- Regular security testing
- Monitor for vulnerabilities

---

**This organization structure provides a scalable, maintainable approach to developing the NydArt Advisor platform. Each service is self-contained while maintaining clear integration points and comprehensive documentation.**
