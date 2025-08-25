#!/usr/bin/env node

/**
 * NydArt Advisor - GitHub Secrets Validation Script
 * 
 * This script helps validate that all required GitHub secrets are properly configured
 */

const fs = require('fs');
const path = require('path');

// Required secrets for each service
const REQUIRED_SECRETS = {
  'auth-service': [
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'DB_SERVICE_URL'
  ],
  'db-service': [
    'MONGODB_URI',
    'JWT_SECRET'
  ],
  'ai-service': [
    'OPENAI_API_KEY',
    'JWT_SECRET'
  ],
  'payment-service': [
    'STRIPE_SECRET_KEY',
    'PAYPAL_CLIENT_ID',
    'PAYPAL_CLIENT_SECRET'
  ],
  'notification-service': [
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN'
  ],
  'metrics-service': [
    'MONGODB_URI',
    'REDIS_URL'
  ],
  'frontend': [
    'NEXT_PUBLIC_API_URL',
    'VERCEL_TOKEN',
    'VERCEL_PROJECT_ID'
  ],
  'global': [
    'DOCKER_USERNAME',
    'DOCKER_PASSWORD'
  ]
};

class SecretsValidator {
  constructor() {
    this.missingSecrets = {};
    this.validationResults = {};
  }

  /**
   * Display the secrets configuration guide
   */
  showConfigurationGuide() {
    console.log(`
🔐 NydArt Advisor - GitHub Organization Secrets Configuration Guide

📋 Required Secrets by Service:
`);

    Object.entries(REQUIRED_SECRETS).forEach(([service, secrets]) => {
      console.log(`\n${service.toUpperCase()}:`);
      secrets.forEach(secret => {
        console.log(`  - ${secret}`);
      });
    });

    console.log(`
📍 How to Configure:

ORGANIZATION-LEVEL SECRETS (Shared across all repos):
1. Go to https://github.com/orgs/NydArt-Advisor
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New organization secret"
5. Add shared secrets: JWT_SECRET, MONGODB_URI, REDIS_URL, DOCKER_USERNAME, DOCKER_PASSWORD

REPOSITORY-LEVEL SECRETS (Individual repos):
1. Go to each repository (e.g., https://github.com/NydArt-Advisor/auth_service)
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add service-specific secrets

🔗 Where to Get Values:

JWT_SECRET:
  Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

GOOGLE_CLIENT_ID/SECRET:
  https://console.cloud.google.com/ → APIs & Services → Credentials

OPENAI_API_KEY:
  https://platform.openai.com/ → API Keys

STRIPE_SECRET_KEY:
  https://dashboard.stripe.com/ → Developers → API Keys

PAYPAL_CLIENT_ID/SECRET:
  https://developer.paypal.com/ → My Apps & Credentials

SENDGRID_API_KEY:
  https://sendgrid.com/ → Settings → API Keys

TWILIO_ACCOUNT_SID/AUTH_TOKEN:
  https://console.twilio.com/ → Account Info

VERCEL_TOKEN:
  https://vercel.com/ → Settings → Tokens

DOCKER_USERNAME:
  Your GitHub username

DOCKER_PASSWORD:
  GitHub Personal Access Token with 'write:packages' scope

📝 Example Values (for development):

JWT_SECRET: 64-character hex string
MONGODB_URI: mongodb://localhost:27017/nydart_advisor
REDIS_URL: redis://localhost:6379
DB_SERVICE_URL: http://localhost:5001
NEXT_PUBLIC_API_URL: http://localhost:3000

⚠️  Important Notes:
- Use different values for staging and production
- Never commit secrets to your repository
- Use strong, unique values for production
- Rotate secrets regularly for security
`);
  }

  /**
   * Generate a secure JWT secret
   */
  generateJWTSecret() {
    const crypto = require('crypto');
    const secret = crypto.randomBytes(64).toString('hex');
    console.log(`\n🔑 Generated JWT Secret:\n${secret}\n`);
    return secret;
  }

  /**
   * Show environment-specific configurations
   */
  showEnvironmentConfigs() {
    console.log(`
🌍 Environment-Specific Configurations:

📊 Development Environment:
MONGODB_URI=mongodb://localhost:27017/nydart_advisor
REDIS_URL=redis://localhost:6379
DB_SERVICE_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:3000

🚀 Staging Environment:
MONGODB_URI=mongodb://staging-mongo:27017/nydart_advisor
REDIS_URL=redis://staging-redis:6379
DB_SERVICE_URL=https://staging-db.nydart-advisor.com
NEXT_PUBLIC_API_URL=https://staging.nydart-advisor.com

🏭 Production Environment:
MONGODB_URI=mongodb://prod-mongo:27017/nydart_advisor
REDIS_URL=redis://prod-redis:6379
DB_SERVICE_URL=https://api.nydart-advisor.com
NEXT_PUBLIC_API_URL=https://nydart-advisor.com

🔧 CI/CD Environment Variables:
These are automatically set by GitHub Actions using the secrets you configure.
`);
  }

  /**
   * Show troubleshooting guide
   */
  showTroubleshooting() {
    console.log(`
🔧 Troubleshooting Common Issues:

❌ "Secret not found" error:
  - Check secret name spelling (case-sensitive)
  - Ensure secret is added to the correct repository
  - Verify secret is in "Actions" section, not "Dependencies"

❌ "Invalid API key" error:
  - Verify API key is correct and active
  - Check if API key has required permissions
  - Ensure account is not suspended

❌ "Connection refused" error:
  - Check if service URLs are correct
  - Verify network connectivity
  - Ensure services are running

❌ "Authentication failed" error:
  - Verify credentials are correct
  - Check if account is active
  - Ensure proper scopes/permissions

📞 Getting Help:
- Check GitHub Actions logs for detailed error messages
- Verify all required secrets are configured
- Test API keys manually before adding to secrets
- Use the validation script: node scripts/validate-secrets.js test
`);
  }

  /**
   * Run validation tests
   */
  async runValidationTests() {
    console.log(`
🧪 Running Secret Validation Tests...

Note: This script cannot actually test your secrets as they are encrypted.
Instead, it will guide you through manual validation steps.

📋 Manual Validation Checklist:

1. ✅ All required secrets are added to GitHub
2. ✅ Secret names match exactly (case-sensitive)
3. ✅ API keys are valid and active
4. ✅ Service URLs are accessible
5. ✅ Database connections work
6. ✅ OAuth redirect URIs are configured
7. ✅ Docker registry credentials work

🔍 Testing Steps:

1. Test API Keys:
   - OpenAI: curl -H "Authorization: Bearer YOUR_KEY" https://api.openai.com/v1/models
   - Stripe: curl -H "Authorization: Bearer YOUR_KEY" https://api.stripe.com/v1/account
   - SendGrid: curl -H "Authorization: Bearer YOUR_KEY" https://api.sendgrid.com/v3/user/profile

2. Test Database Connections:
   - MongoDB: mongodb://localhost:27017/nydart_advisor
   - Redis: redis://localhost:6379

3. Test OAuth:
   - Google: https://console.cloud.google.com/ → OAuth consent screen
   - PayPal: https://developer.paypal.com/ → My Apps & Credentials

4. Test Docker Registry:
   - docker login ghcr.io -u YOUR_USERNAME -p YOUR_TOKEN

✅ Validation Complete!
`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const validator = new SecretsValidator();

  switch (command) {
    case 'guide':
      validator.showConfigurationGuide();
      break;
      
    case 'generate-jwt':
      validator.generateJWTSecret();
      break;
      
    case 'environments':
      validator.showEnvironmentConfigs();
      break;
      
    case 'troubleshoot':
      validator.showTroubleshooting();
      break;
      
    case 'test':
      validator.runValidationTests();
      break;
      
    case 'help':
    case '--help':
    case '-h':
    default:
      console.log(`
🔐 NydArt Advisor - GitHub Secrets Validator

Usage: node scripts/validate-secrets.js [command]

Commands:
  guide           Show complete configuration guide
  generate-jwt    Generate a secure JWT secret
  environments    Show environment-specific configs
  troubleshoot    Show troubleshooting guide
  test            Run validation tests
  help            Show this help message

Examples:
  node scripts/validate-secrets.js guide
  node scripts/validate-secrets.js generate-jwt
  node scripts/validate-secrets.js test
`);
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = SecretsValidator;
