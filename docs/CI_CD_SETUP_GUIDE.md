# NydArt Advisor - CI/CD and Versioning Setup Guide

## Overview

This guide provides comprehensive instructions for setting up automated CI/CD pipelines with versioning for all NydArt Advisor microservices using GitHub Actions.

## 🏗️ Architecture

### Services and Ports
- **Frontend Service**: Port 3000 (Next.js)
- **Database Service**: Port 5001 (MongoDB API)
- **Auth Service**: Port 5002 (JWT + OAuth)
- **AI Service**: Port 5003 (OpenAI Integration)
- **Payment Service**: Port 5004 (Stripe/PayPal)
- **Notification Service**: Port 5005 (Email/SMS)
- **Metrics Service**: Port 5006 (Prometheus/Grafana)

### CI/CD Pipeline Structure
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Version       │    │   Testing       │    │   Security      │
│   Management    │───▶│   (Unit/Int)    │───▶│   Scanning      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Docker Build  │    │   Staging       │    │   Production    │
│   & Push        │───▶│   Deployment    │───▶│   Deployment    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/your-org/NydArt-Advisor.git
cd NydArt-Advisor

# Create and switch to develop branch
git checkout -b develop
git push -u origin develop
```

### 2. GitHub Secrets Configuration

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

#### Required Secrets

**Authentication & API Keys:**
```bash
# OpenAI API
OPENAI_API_KEY_TEST=sk-test-...
OPENAI_API_KEY_PROD=sk-prod-...

# Stripe Keys
STRIPE_TEST_KEY=sk_test_...
STRIPE_PROD_KEY=sk_live_...

# SendGrid
SENDGRID_TEST_KEY=SG.test...
SENDGRID_PROD_KEY=SG.prod...

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Database
MONGODB_URI_TEST=mongodb://localhost:27017/test
MONGODB_URI_PROD=mongodb://your-prod-db:27017/prod
```

**Deployment Secrets:**
```bash
# Vercel (Frontend)
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Environment URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Environment Setup

Create environment files for each service:

#### Auth Service (.env)
```bash
NODE_ENV=production
PORT=5002
JWT_SECRET=your-jwt-secret
MONGODB_URI=mongodb://db-service:27017/nydart
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CLIENT_URL=https://yourdomain.com
```

#### Database Service (.env)
```bash
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://mongodb:27017/nydart
```

#### AI Service (.env)
```bash
NODE_ENV=production
PORT=5003
OPENAI_API_KEY=your-openai-api-key
MONGODB_URI=mongodb://db-service:27017/nydart
```

## 📋 Workflow Configuration

### 1. Version Management

Each service has automatic version management:

```yaml
# Version generation logic
if [ "${{ github.event_name }}" = "release" ]; then
  VERSION="${{ github.event.release.tag_name }}"
else
  COMMIT_COUNT=$(git rev-list --count HEAD)
  VERSION="0.1.${COMMIT_COUNT}"
fi
```

### 2. Testing Strategy

**Unit Tests:**
- Individual function testing
- Component testing (Frontend)
- Service method testing
- Coverage minimum: 90%

**Integration Tests:**
- API endpoint testing
- Database integration
- Service communication
- External API integration

**Security Tests:**
- Trivy vulnerability scanning
- npm audit
- CodeQL analysis
- OWASP compliance checks

### 3. Build Process

**Multi-stage Docker builds:**
```dockerfile
# Stage 1: Dependencies
FROM node:18-alpine AS deps
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:18-alpine AS runner
COPY --from=builder /app/dist ./dist
USER nodejs
CMD ["node", "dist/server.js"]
```

## 🔄 Deployment Strategy

### 1. Staging Deployment

**Trigger:** Push to `develop` branch
**Environment:** Staging environment
**Purpose:** Pre-production testing

```yaml
deploy-staging:
  if: github.ref == 'refs/heads/develop'
  environment: staging
```

### 2. Production Deployment

**Trigger:** GitHub Release creation
**Environment:** Production environment
**Purpose:** Live deployment

```yaml
deploy-production:
  if: github.event_name == 'release'
  environment: production
```

### 3. Rollback Strategy

**Automatic Rollback:**
- Health check failures
- Performance degradation
- Error rate thresholds

**Manual Rollback:**
```bash
# Rollback to previous version
kubectl rollout undo deployment/service-name
```

## 📊 Monitoring and Observability

### 1. Health Checks

Each service includes health check endpoints:

```javascript
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Service Name',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version
  });
});
```

### 2. Metrics Collection

**Prometheus Metrics:**
- Request/response times
- Error rates
- Resource utilization
- Business metrics

**Grafana Dashboards:**
- Service performance
- Error tracking
- User activity
- System health

## 🔧 Local Development

### 1. Running Services Locally

```bash
# Install dependencies for all services
npm run install:all

# Start all services
npm run dev:all

# Start individual service
cd auth_service && npm run dev
```

### 2. Testing Locally

```bash
# Run all tests
npm run test:all

# Run tests for specific service
cd auth_service && npm run test

# Run with coverage
npm run test:coverage
```

### 3. Docker Development

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f service-name
```

## 🚨 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check Node.js version compatibility
node --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**2. Docker Build Issues**
```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t service-name .
```

**3. Test Failures**
```bash
# Check environment variables
echo $NODE_ENV

# Run tests with verbose output
npm run test -- --verbose

# Check database connectivity
npm run test:db-connection
```

### Debug Commands

```bash
# Check service health
curl http://localhost:5001/api/health

# View service logs
docker logs container-name

# Check resource usage
docker stats

# Monitor network connectivity
docker network ls
docker network inspect bridge
```

## 📈 Performance Optimization

### 1. Build Optimization

**Docker Layer Caching:**
```dockerfile
# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

**Multi-platform Builds:**
```yaml
platforms: linux/amd64,linux/arm64
```

### 2. Runtime Optimization

**Resource Limits:**
```yaml
resources:
  limits:
    memory: 512Mi
    cpu: 500m
  requests:
    memory: 256Mi
    cpu: 250m
```

**Health Check Optimization:**
```yaml
healthcheck:
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 5s
```

## 🔐 Security Best Practices

### 1. Secret Management

**Never commit secrets:**
```bash
# Add to .gitignore
.env
*.key
secrets/
```

**Use GitHub Secrets:**
```yaml
env:
  API_KEY: ${{ secrets.API_KEY }}
```

### 2. Container Security

**Non-root user:**
```dockerfile
RUN adduser --system --uid 1001 nodejs
USER nodejs
```

**Security scanning:**
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
```

## 📝 Release Process

### 1. Creating a Release

```bash
# Create release branch
git checkout -b release/v1.2.0

# Update version
npm version patch

# Create pull request
git push origin release/v1.2.0

# Create GitHub release
# This triggers production deployment
```

### 2. Release Checklist

- [ ] All tests passing
- [ ] Security scan clean
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Performance benchmarks met
- [ ] Rollback plan ready

### 3. Post-Release Monitoring

- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all services healthy
- [ ] Monitor user feedback
- [ ] Check business metrics

## 🎯 Best Practices

### 1. Code Quality

- Maintain 90%+ test coverage
- Use TypeScript for type safety
- Follow ESLint rules
- Regular dependency updates
- Security vulnerability scanning

### 2. Deployment

- Blue-green deployments
- Canary releases for critical changes
- Automated rollback on failures
- Environment parity
- Infrastructure as code

### 3. Monitoring

- Real-time alerting
- Performance dashboards
- Error tracking
- User experience monitoring
- Business metrics tracking

## 📞 Support

For issues or questions:

1. **GitHub Issues:** Create an issue in the repository
2. **Documentation:** Check service-specific README files
3. **Team Chat:** Use your team's communication platform
4. **Emergency:** Contact the on-call engineer

## 🔄 Continuous Improvement

### Regular Reviews

- **Weekly:** Performance metrics review
- **Monthly:** Security audit review
- **Quarterly:** Architecture review
- **Annually:** Technology stack review

### Feedback Loop

- User feedback collection
- Performance monitoring
- Error analysis
- Team retrospectives
- Process improvements

---

**Last Updated:** 2024-01-15
**Version:** 2.1.0
**Maintainer:** NydArt Advisor Development Team
