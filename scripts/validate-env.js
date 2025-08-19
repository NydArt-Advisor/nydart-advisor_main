#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates all required environment variables for deployment
 */

const fs = require('fs');
const path = require('path');

// Define required environment variables for each service
const serviceEnvVars = {
    'ai_service': {
        required: ['OPENAI_API_KEY', 'JWT_SECRET', 'BDD_SERVICE_URL'],
        optional: ['PORT', 'NODE_ENV', 'AUTH_SERVICE_URL', 'NOTIFICATION_SERVICE_URL']
    },
    'auth_service': {
        required: ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_SERVICE_URL'],
        optional: ['PORT', 'NODE_ENV', 'PAYMENT_SERVICE_URL', 'NOTIFICATION_SERVICE_URL', 'CLIENT_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET']
    },
    'db_service': {
        required: ['MONGODB_URI', 'JWT_SECRET'],
        optional: ['PORT', 'NODE_ENV', 'AUTH_SERVICE_URL', 'NOTIFICATION_SERVICE_URL']
    },
    'payment_service': {
        required: ['JWT_SECRET', 'STRIPE_SECRET_KEY'],
        optional: ['PORT', 'NODE_ENV', 'AUTH_SERVICE_URL', 'BDD_SERVICE_URL', 'FRONTEND_URL', 'PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET']
    },
    'notification_service': {
        required: ['JWT_SECRET'],
        optional: ['PORT', 'NODE_ENV', 'DB_SERVICE_URL', 'AUTH_SERVICE_URL', 'FRONTEND_URL', 'SENDGRID_API_KEY', 'TWILIO_ACCOUNT_SID']
    },
    'metrics_service': {
        required: ['JWT_SECRET'],
        optional: ['PORT', 'NODE_ENV', 'AUTH_SERVICE_URL', 'FRONTEND_URL', 'REDIS_URL']
    },
    'front': {
        required: [],
        optional: ['NEXT_PUBLIC_AUTH_SERVICE_URL', 'NEXT_PUBLIC_AI_SERVICE_URL', 'NEXT_PUBLIC_DB_SERVICE_URL', 'NEXT_PUBLIC_PAYMENT_SERVICE_URL', 'NEXT_PUBLIC_METRICS_SERVICE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET']
    }
};

// Common environment variables
const commonEnvVars = {
    required: ['JWT_SECRET', 'NODE_ENV'],
    optional: ['MONGODB_URI']
};

function validateServiceEnvVars(serviceName, envVars) {
    const missing = [];
    const warnings = [];
    
    // Check required variables
    for (const varName of envVars.required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    
    // Check optional variables and warn if missing
    for (const varName of envVars.optional) {
        if (!process.env[varName]) {
            warnings.push(varName);
        }
    }
    
    return { missing, warnings };
}

function validateCommonEnvVars() {
    const missing = [];
    const warnings = [];
    
    // Check common required variables
    for (const varName of commonEnvVars.required) {
        if (!process.env[varName]) {
            missing.push(varName);
        }
    }
    
    // Check common optional variables
    for (const varName of commonEnvVars.optional) {
        if (!process.env[varName]) {
            warnings.push(varName);
        }
    }
    
    return { missing, warnings };
}

function checkServiceUrls() {
    const serviceUrls = [
        'AUTH_SERVICE_URL',
        'DB_SERVICE_URL', 
        'BDD_SERVICE_URL',
        'AI_SERVICE_URL',
        'PAYMENT_SERVICE_URL',
        'NOTIFICATION_SERVICE_URL',
        'METRICS_SERVICE_URL',
        'FRONTEND_URL',
        'CLIENT_URL'
    ];
    
    const invalidUrls = [];
    
    for (const urlVar of serviceUrls) {
        const url = process.env[urlVar];
        if (url && url.includes('localhost')) {
            invalidUrls.push(`${urlVar}=${url}`);
        }
    }
    
    return invalidUrls;
}

function main() {
    console.log('🔍 Validating Environment Variables for Deployment...\n');
    
    let hasErrors = false;
    let hasWarnings = false;
    
    // Validate common environment variables
    const commonValidation = validateCommonEnvVars();
    if (commonValidation.missing.length > 0) {
        console.log('❌ Missing Common Required Environment Variables:');
        commonValidation.missing.forEach(varName => {
            console.log(`   - ${varName}`);
        });
        hasErrors = true;
    }
    
    if (commonValidation.warnings.length > 0) {
        console.log('⚠️  Missing Common Optional Environment Variables:');
        commonValidation.warnings.forEach(varName => {
            console.log(`   - ${varName}`);
        });
        hasWarnings = true;
    }
    
    // Validate service-specific environment variables
    for (const [serviceName, envVars] of Object.entries(serviceEnvVars)) {
        const validation = validateServiceEnvVars(serviceName, envVars);
        
        if (validation.missing.length > 0) {
            console.log(`\n❌ ${serviceName} - Missing Required Environment Variables:`);
            validation.missing.forEach(varName => {
                console.log(`   - ${varName}`);
            });
            hasErrors = true;
        }
        
        if (validation.warnings.length > 0) {
            console.log(`\n⚠️  ${serviceName} - Missing Optional Environment Variables:`);
            validation.warnings.forEach(varName => {
                console.log(`   - ${varName}`);
            });
            hasWarnings = true;
        }
    }
    
    // Check for localhost URLs in production
    const invalidUrls = checkServiceUrls();
    if (invalidUrls.length > 0) {
        console.log('\n🚨 Warning: Found localhost URLs (not suitable for production):');
        invalidUrls.forEach(url => {
            console.log(`   - ${url}`);
        });
        hasWarnings = true;
    }
    
    // Check JWT secrets
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.includes('your-super-secret')) {
        console.log('\n🚨 Warning: JWT_SECRET appears to be using default value');
        hasWarnings = true;
    }
    
    if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.includes('your-super-secret')) {
        console.log('\n🚨 Warning: JWT_REFRESH_SECRET appears to be using default value');
        hasWarnings = true;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    if (hasErrors) {
        console.log('❌ Validation Failed: Missing required environment variables');
        process.exit(1);
    } else if (hasWarnings) {
        console.log('⚠️  Validation Passed with Warnings: Some optional variables are missing');
        console.log('💡 Consider setting the missing optional variables for full functionality');
    } else {
        console.log('✅ Validation Passed: All environment variables are properly configured');
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Ensure all services are running');
    console.log('2. Test health check endpoints');
    console.log('3. Verify inter-service communication');
    console.log('4. Test authentication flow');
    console.log('5. Test payment integration');
    console.log('6. Test notification system');
}

// Run validation
if (require.main === module) {
    main();
}

module.exports = {
    validateServiceEnvVars,
    validateCommonEnvVars,
    checkServiceUrls
};
