# 🌿 NydArt Advisor - Branch Strategy Guide

## 📋 **Your Branch Structure**

Each service repository in your organization has three branches:

- **`main`** - Production releases
- **`dev`** - Development and staging  
- **`init`** - Initial setup/configuration

## 🔄 **CI/CD Branch Configuration**

### **GitHub Actions Workflow Updates**

For each service repository, update the `.github/workflows/[service]-ci-cd.yml` file:

```yaml
on:
  push:
    branches: [ main, dev ]
    paths: [ '**' ]  # Monitor all files in the repository
  pull_request:
    branches: [ main, dev ]
    paths: [ '**' ]
  release:
    types: [ published ]
```

### **Deployment Strategy**

| Branch | Environment | Actions |
|--------|-------------|---------|
| **`init`** | Setup | Initial configuration, no CI/CD |
| **`dev`** | Staging | Test, build, deploy to staging |
| **`main`** | Production | Test, build, deploy to production |

## 🚀 **Workflow for Each Branch**

### **`init` Branch**
- **Purpose**: Initial setup and configuration
- **CI/CD**: None (manual setup only)
- **Use Cases**: 
  - Initial project setup
  - Configuration files
  - Documentation setup

### **`dev` Branch**
- **Purpose**: Development and staging
- **CI/CD**: Full pipeline with staging deployment
- **Triggers**:
  - Push to `dev` branch
  - Pull requests to `dev` branch
- **Actions**:
  - ✅ Version management (patch updates)
  - ✅ Testing (unit, integration, security)
  - ✅ Security scanning (Trivy, CodeQL)
  - ✅ Docker build and push to staging registry
  - ✅ Deploy to staging environment

### **`main` Branch**
- **Purpose**: Production releases
- **CI/CD**: Full pipeline with production deployment
- **Triggers**:
  - Push to `main` branch
  - Pull requests to `main` branch
  - Release creation
- **Actions**:
  - ✅ Version management (minor/major updates)
  - ✅ Testing (comprehensive test suite)
  - ✅ Security scanning (enhanced)
  - ✅ Docker build and push to production registry
  - ✅ Deploy to production environment
  - ✅ Create release notes

## 📝 **Updated GitHub Actions Workflows**

### **For Each Service Repository**

Replace the existing workflow content with:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, dev ]
  pull_request:
    branches: [ main, dev ]
  release:
    types: [ published ]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: nydart-advisor/${{ github.event.repository.name }}

jobs:
  version:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Configure Git
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
      
      - name: Bump version
        run: |
          npm version patch --no-git-tag-version
          VERSION=$(node -p "require('./package.json').version")
          echo "VERSION=$VERSION" >> $GITHUB_ENV
      
      - name: Commit and push version
        run: |
          git add package.json
          git commit -m "chore: bump version to ${{ env.VERSION }}"
          git push

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run security audit
        run: npm audit --audit-level=moderate
      
      - name: Run tests
        run: npm run test:full
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: matrix.node-version == '18'

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/dev'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # Add your staging deployment commands here
          # Example: kubectl apply -f k8s/staging/
          # Example: docker-compose -f docker-compose.staging.yml up -d

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main' || github.event_name == 'release'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "Deploying to production environment..."
          # Add your production deployment commands here
          # Example: kubectl apply -f k8s/production/
          # Example: docker-compose -f docker-compose.production.yml up -d
      
      - name: Create release
        if: github.event_name == 'release'
        run: |
          echo "Creating release for version ${{ github.event.release.tag_name }}"
          # Add release creation steps here
```

## 🔧 **Environment-Specific Configuration**

### **Staging Environment (`dev` branch)**
```yaml
# .github/environments/staging.yml
name: staging
url: https://staging.nydart-advisor.com
```

### **Production Environment (`main` branch)**
```yaml
# .github/environments/production.yml
name: production
url: https://nydart-advisor.com
```

## 📊 **Branch Protection Rules**

### **Recommended Settings for Each Repository:**

#### **`main` Branch Protection:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators
- ✅ Restrict pushes that create files

#### **`dev` Branch Protection:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Allow force pushes (for development)

#### **`init` Branch:**
- ✅ No protection (for initial setup)

## 🚀 **Development Workflow**

### **1. Feature Development:**
```bash
# Create feature branch from dev
git checkout dev
git pull origin dev
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to dev branch
git push origin feature/new-feature
# Create PR to dev branch
```

### **2. Staging Deployment:**
```bash
# Merge to dev branch
git checkout dev
git merge feature/new-feature
git push origin dev
# Triggers staging deployment
```

### **3. Production Release:**
```bash
# Merge to main branch
git checkout main
git merge dev
git push origin main
# Triggers production deployment
```

## 📋 **Checklist for Each Repository**

- [ ] Update `.github/workflows/[service]-ci-cd.yml`
- [ ] Configure branch protection rules
- [ ] Set up environment secrets
- [ ] Test dev branch deployment
- [ ] Test main branch deployment
- [ ] Verify version management
- [ ] Check security scanning
- [ ] Validate Docker builds

## 🎯 **Next Steps**

1. **Update each repository's workflow** with the new branch configuration
2. **Set up branch protection rules** for main and dev branches
3. **Configure environment secrets** for staging and production
4. **Test the workflow** by pushing to dev branch
5. **Verify deployment** to staging environment
6. **Test production deployment** by pushing to main branch

This branch strategy provides a clean separation between development, staging, and production environments while maintaining proper CI/CD automation! 🚀
