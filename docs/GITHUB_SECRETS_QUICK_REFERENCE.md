# 🔐 GitHub Secrets - Quick Reference Card

## 📍 **Where to Configure**

### **🏢 Organization-Level Secrets (Shared):**
1. **Go to your organization**: `https://github.com/orgs/NydArt-Advisor`
2. **Click "Settings" tab** (top navigation)
3. **Click "Secrets and variables"** → **"Actions"** (left sidebar)
4. **Click "New organization secret"** button

### **🏠 Repository-Level Secrets (Individual):**
1. **Go to each repository** (e.g., `https://github.com/NydArt-Advisor/auth_service`)
2. **Click "Settings" tab** (top navigation)
3. **Click "Secrets and variables"** → **"Actions"** (left sidebar)
4. **Click "New repository secret"** button

## 📋 **Required Secrets List**

### **🏢 Organization-Level Secrets (Shared)**
```
JWT_SECRET                    # Used by auth, db, ai services
MONGODB_URI                   # Used by db, metrics services  
REDIS_URL                     # Used by metrics service
DOCKER_USERNAME               # Your GitHub username
DOCKER_PASSWORD               # GitHub Personal Access Token
```

### **🏠 Repository-Level Secrets (Individual)**

### **🔑 Authentication Service** (`auth_service` repo)
```
JWT_SECRET                    # Generate with: npm run secrets:generate-jwt
GOOGLE_CLIENT_ID             # From Google Cloud Console
GOOGLE_CLIENT_SECRET         # From Google Cloud Console
DB_SERVICE_URL               # http://localhost:5001 (dev)
```

### **🗄️ Database Service** (`db_service` repo)
```
# Uses organization-level secrets: MONGODB_URI, JWT_SECRET
# No additional secrets needed
```

### **🤖 AI Service** (`ai_service` repo)
```
OPENAI_API_KEY               # From OpenAI Platform
# Uses organization-level secret: JWT_SECRET
```

### **💳 Payment Service** (`payment_service` repo)
```
STRIPE_SECRET_KEY            # From Stripe Dashboard (starts with sk_)
PAYPAL_CLIENT_ID             # From PayPal Developer
PAYPAL_CLIENT_SECRET         # From PayPal Developer
```

### **📧 Notification Service** (`notification_service` repo)
```
SENDGRID_API_KEY             # From SendGrid Dashboard
TWILIO_ACCOUNT_SID           # From Twilio Console
TWILIO_AUTH_TOKEN            # From Twilio Console
```

### **📊 Metrics Service** (`metrics_service` repo)
```
# Uses organization-level secrets: MONGODB_URI, REDIS_URL
# No additional secrets needed
```

### **🌐 Frontend Service** (`front` repo)
```
NEXT_PUBLIC_API_URL          # http://localhost:3000 (dev)
VERCEL_TOKEN                 # From Vercel Dashboard
VERCEL_PROJECT_ID            # From Vercel Dashboard
```

### **🐳 Docker Registry** (Organization-level)
```
DOCKER_USERNAME              # Your GitHub username
DOCKER_PASSWORD              # GitHub Personal Access Token
```

## 🛠️ **Quick Setup Commands**

```bash
# Generate JWT Secret
npm run secrets:generate-jwt

# Show complete guide
npm run secrets:guide

# Show environment configs
npm run secrets:environments

# Show troubleshooting
npm run secrets:troubleshoot

# Run validation tests
npm run secrets:test
```

## 🔗 **Where to Get API Keys**

| Service | URL | Notes |
|---------|-----|-------|
| **Google OAuth** | https://console.cloud.google.com/ | APIs & Services → Credentials |
| **OpenAI** | https://platform.openai.com/ | API Keys section |
| **Stripe** | https://dashboard.stripe.com/ | Developers → API Keys |
| **PayPal** | https://developer.paypal.com/ | My Apps & Credentials |
| **SendGrid** | https://sendgrid.com/ | Settings → API Keys |
| **Twilio** | https://console.twilio.com/ | Account Info section |
| **Vercel** | https://vercel.com/ | Settings → Tokens |

## ⚠️ **Important Notes**

- ✅ **Secret names are case-sensitive**
- ✅ **Use different values for staging/production**
- ✅ **Never commit secrets to repository**
- ✅ **Rotate secrets regularly**
- ✅ **Use strong, unique values**

## 🚨 **Common Issues**

| Error | Solution |
|-------|----------|
| "Secret not found" | Check spelling, ensure added to correct repo |
| "Invalid API key" | Verify key is correct and account is active |
| "Connection refused" | Check service URLs and network connectivity |
| "Authentication failed" | Verify credentials and permissions |

## 📞 **Need Help?**

1. **Check GitHub Actions logs** for detailed error messages
2. **Run validation script**: `npm run secrets:test`
3. **Verify all secrets** are configured correctly
4. **Test API keys** manually before adding to secrets

---

**💡 Pro Tip**: Use the validation script to get step-by-step guidance:
```bash
npm run secrets:guide
```
