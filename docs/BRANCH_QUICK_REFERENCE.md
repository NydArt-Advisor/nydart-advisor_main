# 🌿 Branch Structure Quick Reference

## 📋 **Your Repository Branch Structure**

Each service in your NydArt-Advisor organization has:

```
main  ← Production releases
dev   ← Development & staging
init  ← Initial setup
```

## 🚀 **CI/CD Triggers by Branch**

| Branch | Triggers CI/CD | Environment | Actions |
|--------|---------------|-------------|---------|
| **`init`** | ❌ No | Setup | Manual configuration only |
| **`dev`** | ✅ Yes | Staging | Test → Build → Deploy to staging |
| **`main`** | ✅ Yes | Production | Test → Build → Deploy to production |

## 🔧 **GitHub Actions Workflow Updates**

For each repository, update `.github/workflows/[service]-ci-cd.yml`:

```yaml
on:
  push:
    branches: [ main, dev ]  # Changed from [ main, develop ]
  pull_request:
    branches: [ main, dev ]  # Changed from [ main, develop ]
  release:
    types: [ published ]
```

## 📊 **Branch Protection Rules**

### **`main` Branch (Production)**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Include administrators

### **`dev` Branch (Staging)**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Allow force pushes (for development)

### **`init` Branch (Setup)**
- ❌ No protection (for initial setup)

## 🎯 **Development Workflow**

```bash
# 1. Feature Development
git checkout dev
git pull origin dev
git checkout -b feature/new-feature
# Make changes...
git push origin feature/new-feature
# Create PR to dev

# 2. Staging Deployment
git checkout dev
git merge feature/new-feature
git push origin dev
# Triggers staging deployment

# 3. Production Release
git checkout main
git merge dev
git push origin main
# Triggers production deployment
```

## 📝 **Quick Commands**

```bash
# Check current branch
git branch

# Switch to dev branch
git checkout dev

# Switch to main branch
git checkout main

# Create feature branch
git checkout -b feature/name

# Push to specific branch
git push origin dev
git push origin main
```

## ⚠️ **Important Notes**

- **`dev` branch** = Your staging environment
- **`main` branch** = Your production environment
- **`init` branch** = Initial setup only
- **CI/CD runs** on `dev` and `main` branches only
- **Version management** happens on `main` branch pushes
- **Staging deployment** triggers on `dev` branch pushes
- **Production deployment** triggers on `main` branch pushes

## 🔄 **Environment Flow**

```
Feature Branch → dev Branch → main Branch
     ↓              ↓            ↓
   Testing    →  Staging   →  Production
```

This structure ensures clean separation between development, staging, and production environments! 🚀
