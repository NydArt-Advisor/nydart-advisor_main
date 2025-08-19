# NydArt Advisor - Test Execution Guide

## Overview

This guide explains how to execute the comprehensive test book for NydArt Advisor. The test book covers all services and the full application to detect operating anomalies and possible regressions.

## Quick Start

### 1. Prerequisites

Ensure you have the following installed:
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas)
- All service dependencies installed

### 2. Setup Test Environment

```bash
# Install dependencies for all services
cd auth_service && npm install
cd ../db_service && npm install
cd ../ai_service && npm install
cd ../payment_service && npm install
cd ../notification_service && npm install
cd ../metrics_service && npm install
cd ../front && npm install
cd ..

# Setup test data
npm run test:setup
```

### 3. Start All Services

```bash
# Start all services
npm run start:all

# Or start individually
cd auth_service && npm start &
cd ../db_service && npm start &
cd ../ai_service && npm start &
cd ../payment_service && npm start &
cd ../notification_service && npm start &
cd ../metrics_service && npm start &
cd ../front && npm start &
```

### 4. Run Comprehensive Tests

```bash
# Run all tests (recommended)
npm run test:book

# Or run specific test categories
npm run test:services      # Service-level tests only
npm run test:integration   # Integration tests only
npm run test:security      # Security tests only
npm run test:performance   # Performance tests only
npm run test:accessibility # Accessibility tests only
```

## Test Categories

### 1. Service-Level Tests

Tests individual microservices in isolation:

```bash
npm run test:services
```

**What it tests:**
- Authentication Service: User registration, login, OAuth, 2FA
- Database Service: CRUD operations, data validation
- AI Service: Image analysis, file processing
- Payment Service: Stripe/PayPal integration
- Notification Service: Email/SMS sending
- Metrics Service: Data collection, analytics
- Frontend Service: Page rendering, UI interactions

### 2. Integration Tests

Tests service-to-service communication:

```bash
npm run test:integration
```

**What it tests:**
- Auth ↔ Database communication
- Frontend ↔ Auth communication
- AI ↔ Database communication
- API health checks
- Service coordination

### 3. Security Tests

Tests security measures and vulnerability prevention:

```bash
npm run test:security
```

**What it tests:**
- SQL injection prevention
- XSS protection
- JWT token validation
- Input sanitization
- Authentication security

### 4. Performance Tests

Tests system performance under load:

```bash
npm run test:performance
```

**What it tests:**
- Response time validation
- Concurrent request handling
- Database performance
- Service limits

### 5. Accessibility Tests

Tests WCAG 2.1 AA compliance:

```bash
npm run test:accessibility
```

**What it tests:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- ARIA labels
- Skip navigation

## Test Execution Options

### Command Line Options

```bash
# Show help
npm run test:help

# Run specific test categories
node scripts/run-test-book.js --services-only
node scripts/run-test-book.js --integration-only
node scripts/run-test-book.js --security-only
node scripts/run-test-book.js --performance-only
node scripts/run-test-book.js --accessibility-only
```

### Test Data Management

```bash
# Setup test data
npm run test:setup

# Clean and setup test data
npm run test:setup:clean

# Force setup (ignore service availability)
npm run test:setup:force

# Clean test data
node scripts/clean-test-data.js

# Reset test database
node scripts/reset-test-db.js
```

## Test Results

### 1. Console Output

The test execution provides real-time feedback:

```
🚀 Starting NydArt Advisor Test Book Execution
============================================================
ℹ️ [2024-01-15T10:30:00.000Z] Checking service health...
✅ [2024-01-15T10:30:02.000Z] auth_service is ready!
✅ [2024-01-15T10:30:02.000Z] db_service is ready!
...
ℹ️ [2024-01-15T10:30:05.000Z] Starting service-level tests...
✅ [2024-01-15T10:30:10.000Z] auth_service tests completed successfully
...
```

### 2. Test Report

A detailed JSON report is generated at `logs/test-report.json`:

```json
{
  "testRun": {
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T10:35:00.000Z",
    "duration": "300 seconds"
  },
  "summary": {
    "total": 7,
    "passed": 6,
    "failed": 1,
    "skipped": 0
  },
  "services": {
    "auth_service": {
      "name": "auth_service",
      "exitCode": 0,
      "success": true,
      "timestamp": "2024-01-15T10:30:10.000Z"
    }
  },
  "successRate": 85
}
```

### 3. Summary Display

At the end of execution, a summary is displayed:

```
============================================================
📊 TEST BOOK EXECUTION SUMMARY
============================================================

⏱️  Duration: 300 seconds
📈 Success Rate: 85%

📋 Test Results:
   Total Tests: 7
   ✅ Passed: 6
   ❌ Failed: 1
   ⏭️  Skipped: 0

🔧 Service Results:
   auth_service: ✅ PASSED
   db_service: ✅ PASSED
   ai_service: ❌ FAILED
   payment_service: ✅ PASSED
   notification_service: ✅ PASSED
   metrics_service: ✅ PASSED
   front: ✅ PASSED

📄 Detailed report saved to: logs/test-report.json
============================================================
```

## Troubleshooting

### Common Issues

#### 1. Services Not Starting

**Problem**: Services fail to start or are not healthy
```bash
# Check if ports are available
netstat -an | grep :5001
netstat -an | grep :5002
# ... etc

# Check service logs
tail -f logs/auth_service.log
tail -f logs/db_service.log
```

**Solution**: 
- Ensure MongoDB is running
- Check environment variables in `.env` files
- Verify all dependencies are installed

#### 2. Test Timeouts

**Problem**: Tests timeout after 5 minutes
```bash
# Increase timeout in scripts/run-test-book.js
const CONFIG = {
    testTimeout: 600000, // 10 minutes
    // ...
};
```

**Solution**:
- Check service performance
- Verify network connectivity
- Consider running tests individually

#### 3. Database Connection Issues

**Problem**: Database service cannot connect to MongoDB
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# Check connection string
echo $MONGODB_URI
```

**Solution**:
- Verify MongoDB is running
- Check connection string format
- Ensure network access

#### 4. Permission Issues

**Problem**: Cannot create test files or directories
```bash
# Check permissions
ls -la test-data/
ls -la logs/
```

**Solution**:
- Ensure write permissions
- Run as appropriate user
- Check disk space

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set debug environment variable
export DEBUG=test-book:*

# Run tests with debug output
npm run test:book
```

### Individual Service Testing

Test specific services in isolation:

```bash
# Test only auth service
cd auth_service && npm test

# Test only database service
cd db_service && npm test

# Test only AI service
cd ai_service && npm test
```

## Continuous Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Test Book Execution

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:5.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd auth_service && npm install
          cd ../db_service && npm install
          cd ../ai_service && npm install
          cd ../payment_service && npm install
          cd ../notification_service && npm install
          cd ../metrics_service && npm install
          cd ../front && npm install
          
      - name: Setup test data
        run: npm run test:setup:force
        
      - name: Start services
        run: npm run start:all &
        
      - name: Wait for services
        run: sleep 30
        
      - name: Run test book
        run: npm run test:book
        
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: logs/test-report.json
```

### Jenkins Pipeline

Add to `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm run test:setup:force'
            }
        }
        
        stage('Start Services') {
            steps {
                sh 'npm run start:all &'
                sh 'sleep 30'
            }
        }
        
        stage('Run Tests') {
            steps {
                sh 'npm run test:book'
            }
        }
        
        stage('Publish Results') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'logs',
                    reportFiles: 'test-report.json',
                    reportName: 'Test Results'
                ])
            }
        }
    }
    
    post {
        always {
            sh 'pkill -f "node.*server.js" || true'
        }
    }
}
```

## Best Practices

### 1. Test Execution Order

1. **Setup**: Prepare test environment and data
2. **Health Check**: Verify all services are running
3. **Unit Tests**: Test individual services
4. **Integration Tests**: Test service communication
5. **Security Tests**: Validate security measures
6. **Performance Tests**: Check system performance
7. **Accessibility Tests**: Verify accessibility compliance
8. **Cleanup**: Clean up test data

### 2. Test Data Management

- Use dedicated test databases
- Clean up test data after execution
- Use realistic but safe test data
- Avoid using production data

### 3. Environment Isolation

- Use separate test environments
- Isolate test networks
- Use test API keys and credentials
- Mock external services when appropriate

### 4. Monitoring and Alerting

- Monitor test execution times
- Set up alerts for test failures
- Track test coverage metrics
- Monitor resource usage during tests

### 5. Documentation

- Document test scenarios
- Maintain test data schemas
- Update test procedures
- Share test results with team

## Conclusion

The NydArt Advisor test book provides comprehensive testing coverage for all services and the full application. Regular execution of these tests ensures:

- ✅ **Quality Assurance**: All features work as expected
- ✅ **Regression Prevention**: Changes don't break existing functionality
- ✅ **Security Validation**: Security measures are effective
- ✅ **Performance Monitoring**: System meets performance requirements
- ✅ **Accessibility Compliance**: Application meets WCAG standards

Follow this guide to execute tests effectively and maintain high-quality standards for the NydArt Advisor application.
