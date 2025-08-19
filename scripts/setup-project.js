#!/usr/bin/env node

/**
 * NydArt Advisor - Project Setup Script
 * 
 * This script helps developers set up the entire NydArt Advisor project
 * by cloning all service repositories and configuring the development environment.
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// Configuration
const ORG_NAME = 'NydArt-Advisor';
const SERVICES = {
    front: 'front',
    auth_service: 'auth_service',
    db_service: 'db_service',
    ai_service: 'ai_service',
    payment_service: 'payment_service',
    notification_service: 'notification_service',
    metrics_service: 'metrics_service'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Utility functions
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const log = (message, type = 'info') => {
    const colors = {
        info: '\x1b[36m',    // Cyan
        success: '\x1b[32m', // Green
        warning: '\x1b[33m', // Yellow
        error: '\x1b[31m',   // Red
        reset: '\x1b[0m'     // Reset
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
};

const runCommand = (command, cwd = process.cwd()) => {
    return new Promise((resolve, reject) => {
        log(`Running: ${command}`, 'info');
        
        const child = spawn(command, [], {
            shell: true,
            cwd,
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
};

const checkPrerequisites = () => {
    log('Checking prerequisites...', 'info');
    
    try {
        // Check Node.js version
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        const nodeVersionNum = parseInt(nodeVersion.replace('v', '').split('.')[0]);
        
        if (nodeVersionNum < 18) {
            throw new Error(`Node.js 18+ required. Current version: ${nodeVersion}`);
        }
        log(`✓ Node.js ${nodeVersion}`, 'success');

        // Check npm
        const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
        log(`✓ npm ${npmVersion}`, 'success');

        // Check git
        const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
        log(`✓ ${gitVersion}`, 'success');

        return true;
    } catch (error) {
        log(`✗ Prerequisites check failed: ${error.message}`, 'error');
        return false;
    }
};

const cloneService = async (serviceName, repoName) => {
    const servicePath = path.join(process.cwd(), serviceName);
    
    if (fs.existsSync(servicePath)) {
        log(`Service ${serviceName} already exists. Skipping...`, 'warning');
        return;
    }

    try {
        const repoUrl = `https://github.com/${ORG_NAME}/${repoName}.git`;
        log(`Cloning ${serviceName}...`, 'info');
        
        await runCommand(`git clone ${repoUrl} ${serviceName}`);
        log(`✓ ${serviceName} cloned successfully`, 'success');
    } catch (error) {
        log(`✗ Failed to clone ${serviceName}: ${error.message}`, 'error');
        throw error;
    }
};

const installDependencies = async (serviceName) => {
    const servicePath = path.join(process.cwd(), serviceName);
    
    if (!fs.existsSync(servicePath)) {
        log(`Service ${serviceName} not found. Skipping dependency installation.`, 'warning');
        return;
    }

    try {
        log(`Installing dependencies for ${serviceName}...`, 'info');
        await runCommand('npm install', servicePath);
        log(`✓ Dependencies installed for ${serviceName}`, 'success');
    } catch (error) {
        log(`✗ Failed to install dependencies for ${serviceName}: ${error.message}`, 'error');
        throw error;
    }
};

const setupEnvironmentFiles = async () => {
    log('Setting up environment files...', 'info');
    
    for (const [serviceName, repoName] of Object.entries(SERVICES)) {
        const servicePath = path.join(process.cwd(), serviceName);
        
        if (!fs.existsSync(servicePath)) {
            continue;
        }

        const envExamplePath = path.join(servicePath, 'env.example');
        const envPath = path.join(servicePath, '.env');
        
        if (fs.existsSync(envExamplePath) && !fs.existsSync(envPath)) {
            try {
                fs.copyFileSync(envExamplePath, envPath);
                log(`✓ Created .env for ${serviceName}`, 'success');
            } catch (error) {
                log(`✗ Failed to create .env for ${serviceName}: ${error.message}`, 'error');
            }
        }
    }
};

const createRootEnvExample = () => {
    const rootEnvExample = `# NydArt Advisor - Root Environment Variables
# Copy this file to .env and configure as needed

# Development Configuration
NODE_ENV=development
PORT=3000

# Service URLs (for local development)
AUTH_SERVICE_URL=http://localhost:5002
DB_SERVICE_URL=http://localhost:5001
AI_SERVICE_URL=http://localhost:5003
PAYMENT_SERVICE_URL=http://localhost:5004
NOTIFICATION_SERVICE_URL=http://localhost:5005
METRICS_SERVICE_URL=http://localhost:5006

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/nydart_advisor

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Test Configuration
TEST_DATABASE_URI=mongodb://localhost:27017/nydart_advisor_test
TEST_TIMEOUT=30000

# Bug Management
BUG_TRACKING_ENABLED=true
AUTO_FIX_ENABLED=false
`;

    try {
        fs.writeFileSync('.env.example', rootEnvExample);
        log('✓ Created root .env.example', 'success');
    } catch (error) {
        log(`✗ Failed to create root .env.example: ${error.message}`, 'error');
    }
};

const updatePackageJson = () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        log('package.json not found. Creating...', 'info');
        
        const packageJson = {
            name: "nydart-advisor-main",
            version: "1.0.0",
            description: "NydArt Advisor - AI-Powered Art Analysis Platform",
            main: "index.js",
            scripts: {
                "dev": "node scripts/start-all.js",
                "start:all": "node scripts/start-all.js",
                "start:auth": "cd auth_service && npm start",
                "start:db": "cd db_service && npm start",
                "start:ai": "cd ai_service && npm start",
                "start:payment": "cd payment_service && npm start",
                "start:notification": "cd notification_service && npm start",
                "start:metrics": "cd metrics_service && npm start",
                "start:front": "cd front && npm run dev",
                "test": "node scripts/run-test-book.js",
                "test:all": "node scripts/run-test-book.js",
                "test:services": "node scripts/run-test-book.js --services-only",
                "test:integration": "node scripts/run-test-book.js --integration-only",
                "test:security": "node scripts/run-test-book.js --security-only",
                "test:performance": "node scripts/run-test-book.js --performance-only",
                "test:accessibility": "node scripts/run-test-book.js --accessibility-only",
                "test:setup": "node scripts/setup-test-data.js",
                "test:setup:clean": "node scripts/setup-test-data.js --clean",
                "bug:track": "node scripts/bug-tracker.js",
                "bug:analyze": "node scripts/bug-analyzer.js",
                "bug:create": "node scripts/bug-tracker.js create",
                "bug:list": "node scripts/bug-tracker.js list",
                "bug:report": "node scripts/bug-tracker.js report",
                "bug:resolve": "node scripts/bug-tracker.js resolve",
                "bug:export": "node scripts/bug-tracker.js export",
                "bug:cleanup": "node scripts/bug-tracker.js cleanup",
                "bug:generate-fix": "node scripts/bug-analyzer.js generate-fix",
                "bug:apply-fix": "node scripts/bug-analyzer.js apply-fix",
                "bug:validate": "node scripts/bug-analyzer.js validate",
                "bug:detect": "node scripts/bug-analyzer.js detect",
                "setup:deps": "node scripts/setup-project.js --install-deps",
                "setup:env": "node scripts/setup-project.js --setup-env"
            },
            keywords: ["art", "ai", "analysis", "microservices", "nodejs", "react"],
            author: "NydArt Advisor Team",
            license: "MIT",
            dependencies: {
                "axios": "^1.6.0",
                "dotenv": "^16.3.1"
            },
            devDependencies: {
                "nodemon": "^3.0.1"
            },
            engines: {
                "node": ">=18.0.0",
                "npm": ">=8.0.0"
            }
        };

        try {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            log('✓ Created package.json', 'success');
        } catch (error) {
            log(`✗ Failed to create package.json: ${error.message}`, 'error');
        }
    }
};

const createGitignore = () => {
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Test data
test-data/
bug-reports/
analysis-reports/
fix-templates/

# Backup files
backup/
*.backup

# Database files
*.db
*.sqlite
*.sqlite3

# Upload files
uploads/
temp/uploads/

# Build artifacts
build/
dist/
out/
`;

    try {
        fs.writeFileSync('.gitignore', gitignoreContent);
        log('✓ Created .gitignore', 'success');
    } catch (error) {
        log(`✗ Failed to create .gitignore: ${error.message}`, 'error');
    }
};

const createDocsDirectory = () => {
    const docsPath = path.join(process.cwd(), 'docs');
    
    if (!fs.existsSync(docsPath)) {
        try {
            fs.mkdirSync(docsPath, { recursive: true });
            log('✓ Created docs directory', 'success');
        } catch (error) {
            log(`✗ Failed to create docs directory: ${error.message}`, 'error');
        }
    }
};

const showNextSteps = () => {
    log('\n🎉 Setup completed successfully!', 'success');
    log('\n📋 Next Steps:', 'info');
    log('1. Configure environment variables:', 'info');
    log('   - Copy .env.example to .env in each service directory', 'info');
    log('   - Configure your API keys and database connections', 'info');
    log('\n2. Start the development environment:', 'info');
    log('   npm run dev', 'info');
    log('\n3. Run tests to verify setup:', 'info');
    log('   npm run test:all', 'info');
    log('\n4. Access the application:', 'info');
    log('   Frontend: http://localhost:3000', 'info');
    log('   Auth Service: http://localhost:5002', 'info');
    log('   Database Service: http://localhost:5001', 'info');
    log('   AI Service: http://localhost:5003', 'info');
    log('   Payment Service: http://localhost:5004', 'info');
    log('   Notification Service: http://localhost:5005', 'info');
    log('   Metrics Service: http://localhost:5006', 'info');
    log('\n📚 Documentation:', 'info');
    log('   - README.md: Quick start guide', 'info');
    log('   - docs/TECHNICAL_DOCUMENTATION.md: Complete technical documentation', 'info');
    log('   - docs/TEST_BOOK.md: Test scenarios and results', 'info');
    log('   - docs/BUG_CORRECTION_PLAN.md: Bug management strategy', 'info');
    log('\n🐛 Bug Management:', 'info');
    log('   - Use npm run bug:create to report bugs', 'info');
    log('   - Use npm run bug:analyze to analyze issues', 'info');
    log('   - Use npm run bug:generate-fix to generate fixes', 'info');
    log('\n🔧 Development:', 'info');
    log('   - Each service is in its own directory', 'info');
    log('   - Work on services individually', 'info');
    log('   - Use the provided test suites', 'info');
    log('   - Follow the established documentation', 'info');
};

const main = async () => {
    const args = process.argv.slice(2);
    
    log('🚀 NydArt Advisor - Project Setup', 'info');
    log('================================', 'info');

    try {
        // Check if running specific commands
        if (args.includes('--install-deps')) {
            log('Installing dependencies for all services...', 'info');
            for (const serviceName of Object.keys(SERVICES)) {
                await installDependencies(serviceName);
            }
            return;
        }

        if (args.includes('--setup-env')) {
            log('Setting up environment files...', 'info');
            await setupEnvironmentFiles();
            return;
        }

        // Full setup process
        log('Starting full project setup...', 'info');

        // Check prerequisites
        if (!checkPrerequisites()) {
            log('Please install the required prerequisites and try again.', 'error');
            process.exit(1);
        }

        // Ask for confirmation
        const confirm = await question('\nThis will clone all service repositories. Continue? (y/N): ');
        if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
            log('Setup cancelled.', 'warning');
            return;
        }

        // Clone services
        log('\n📥 Cloning service repositories...', 'info');
        for (const [serviceName, repoName] of Object.entries(SERVICES)) {
            await cloneService(serviceName, repoName);
        }

        // Install dependencies
        log('\n📦 Installing dependencies...', 'info');
        await runCommand('npm install'); // Root dependencies
        
        for (const serviceName of Object.keys(SERVICES)) {
            await installDependencies(serviceName);
        }

        // Setup environment files
        log('\n⚙️ Setting up environment files...', 'info');
        await setupEnvironmentFiles();
        createRootEnvExample();

        // Create project files
        log('\n📄 Creating project files...', 'info');
        updatePackageJson();
        createGitignore();
        createDocsDirectory();

        // Show next steps
        showNextSteps();

    } catch (error) {
        log(`\n✗ Setup failed: ${error.message}`, 'error');
        log('Please check the error and try again.', 'error');
        process.exit(1);
    } finally {
        rl.close();
    }
};

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    cloneService,
    installDependencies,
    setupEnvironmentFiles,
    checkPrerequisites
};
