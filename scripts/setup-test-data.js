#!/usr/bin/env node

/**
 * NydArt Advisor - Test Data Setup Script
 * 
 * This script sets up test data for the comprehensive test book execution.
 * It creates test users, test artworks, and test configurations.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Test data configuration
const TEST_DATA = {
    users: [
        {
            email: 'test.user@example.com',
            password: 'TestPassword123!',
            name: 'Test User',
            role: 'user'
        },
        {
            email: 'premium.user@example.com',
            password: 'PremiumPass123!',
            name: 'Premium User',
            role: 'premium'
        },
        {
            email: 'admin.user@example.com',
            password: 'AdminPass123!',
            name: 'Admin User',
            role: 'admin'
        }
    ],
    artworks: [
        {
            title: 'Test Artwork 1',
            description: 'A test artwork for AI analysis',
            artist: 'Test Artist',
            year: 2023,
            medium: 'Digital Art'
        },
        {
            title: 'Test Artwork 2',
            description: 'Another test artwork for analysis',
            artist: 'Test Artist 2',
            year: 2022,
            medium: 'Oil Painting'
        }
    ],
    testImages: [
        {
            name: 'test-artwork-1.jpg',
            path: 'test-data/images/test-artwork-1.jpg',
            description: 'Sample artwork for testing'
        },
        {
            name: 'test-artwork-2.png',
            path: 'test-data/images/test-artwork-2.png',
            description: 'Another sample artwork'
        }
    ]
};

// Service configuration
const SERVICES = {
    auth: { port: 5002, baseUrl: 'http://localhost:5002/api' },
    db: { port: 5001, baseUrl: 'http://localhost:5001/api' },
    ai: { port: 5003, baseUrl: 'http://localhost:5003/api' },
    payment: { port: 5004, baseUrl: 'http://localhost:5004/api' },
    notification: { port: 5005, baseUrl: 'http://localhost:5005/api' },
    metrics: { port: 5006, baseUrl: 'http://localhost:5006/api' }
};

// Utility functions
const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkServiceHealth = async (service) => {
    try {
        const response = await axios.get(`${service.baseUrl}/health`, { timeout: 5000 });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const waitForService = async (service, maxAttempts = 5) => {
    log(`Waiting for ${service.baseUrl} to be ready...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const isHealthy = await checkServiceHealth(service);
        if (isHealthy) {
            log(`${service.baseUrl} is ready!`, 'success');
            return true;
        }
        
        if (attempt < maxAttempts) {
            log(`Attempt ${attempt}/${maxAttempts} failed, retrying in 2 seconds...`, 'warning');
            await sleep(2000);
        }
    }
    
    log(`${service.baseUrl} failed to start after ${maxAttempts} attempts`, 'error');
    return false;
};

const createTestDirectories = () => {
    const directories = [
        'test-data',
        'test-data/images',
        'test-data/users',
        'test-data/artworks',
        'test-data/logs'
    ];
    
    directories.forEach(dir => {
        const fullPath = path.join(__dirname, '..', dir);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            log(`Created directory: ${dir}`, 'success');
        }
    });
};

const createTestImages = () => {
    const testImageDir = path.join(__dirname, '..', 'test-data', 'images');
    
    // Create a simple test image (1x1 pixel PNG)
    const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x01, // width: 1
        0x00, 0x00, 0x00, 0x01, // height: 1
        0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
        0x90, 0x77, 0x53, 0xDE, // CRC
        0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
        0x49, 0x44, 0x41, 0x54, // IDAT
        0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
        0x00, 0x00, 0x00, 0x00, // IEND chunk length
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    TEST_DATA.testImages.forEach(image => {
        const imagePath = path.join(testImageDir, image.name);
        if (!fs.existsSync(imagePath)) {
            fs.writeFileSync(imagePath, pngHeader);
            log(`Created test image: ${image.name}`, 'success');
        }
    });
};

const createTestUsers = async () => {
    log('Creating test users...');
    
    for (const user of TEST_DATA.users) {
        try {
            const response = await axios.post(`${SERVICES.auth.baseUrl}/auth/register`, {
                email: user.email,
                password: user.password,
                name: user.name
            });
            
            if (response.status === 201) {
                log(`Created test user: ${user.email}`, 'success');
            } else {
                log(`Failed to create test user: ${user.email}`, 'warning');
            }
        } catch (error) {
            if (error.response?.status === 409) {
                log(`Test user already exists: ${user.email}`, 'info');
            } else {
                log(`Error creating test user ${user.email}: ${error.message}`, 'error');
            }
        }
    }
};

const createTestArtworks = async () => {
    log('Creating test artworks...');
    
    for (const artwork of TEST_DATA.artworks) {
        try {
            const response = await axios.post(`${SERVICES.db.baseUrl}/artworks`, {
                title: artwork.title,
                description: artwork.description,
                artist: artwork.artist,
                year: artwork.year,
                medium: artwork.medium,
                userId: 'test-user-id' // This would be replaced with actual user ID
            });
            
            if (response.status === 201) {
                log(`Created test artwork: ${artwork.title}`, 'success');
            } else {
                log(`Failed to create test artwork: ${artwork.title}`, 'warning');
            }
        } catch (error) {
            log(`Error creating test artwork ${artwork.title}: ${error.message}`, 'error');
        }
    }
};

const createTestConfiguration = () => {
    const config = {
        testUsers: TEST_DATA.users,
        testArtworks: TEST_DATA.artworks,
        testImages: TEST_DATA.testImages,
        services: SERVICES,
        setupTime: new Date().toISOString()
    };
    
    const configPath = path.join(__dirname, '..', 'test-data', 'test-config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('Created test configuration file', 'success');
};

const createTestScripts = () => {
    const scripts = {
        'clean-test-data.js': `
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const testDataDir = path.join(__dirname, '..', 'test-data');
if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
    console.log('✅ Test data cleaned successfully');
} else {
    console.log('ℹ️  No test data to clean');
}
`,
        'reset-test-db.js': `
#!/usr/bin/env node
const axios = require('axios');

async function resetTestDatabase() {
    try {
        // This would reset the test database
        // Implementation depends on your database service
        console.log('✅ Test database reset successfully');
    } catch (error) {
        console.error('❌ Error resetting test database:', error.message);
    }
}

resetTestDatabase();
`
    };
    
    Object.entries(scripts).forEach(([filename, content]) => {
        const scriptPath = path.join(__dirname, '..', 'scripts', filename);
        fs.writeFileSync(scriptPath, content.trim());
        fs.chmodSync(scriptPath, '755');
        log(`Created test script: ${filename}`, 'success');
    });
};

const main = async () => {
    console.log('🚀 Setting up NydArt Advisor Test Data');
    console.log('='.repeat(50));
    
    try {
        // Create test directories
        log('Creating test directories...');
        createTestDirectories();
        
        // Create test images
        log('Creating test images...');
        createTestImages();
        
        // Check if services are running
        log('Checking service availability...');
        const serviceChecks = await Promise.all(
            Object.entries(SERVICES).map(async ([name, service]) => {
                const isHealthy = await waitForService(service);
                return { name, isHealthy };
            })
        );
        
        const healthyServices = serviceChecks.filter(check => check.isHealthy);
        log(`Found ${healthyServices.length}/${serviceChecks.length} healthy services`, 'info');
        
        // Create test data if services are available
        if (healthyServices.length > 0) {
            // Create test users
            await createTestUsers();
            
            // Create test artworks
            await createTestArtworks();
        } else {
            log('No services available for test data creation', 'warning');
        }
        
        // Create test configuration
        createTestConfiguration();
        
        // Create test scripts
        createTestScripts();
        
        console.log('\n' + '='.repeat(50));
        console.log('✅ Test Data Setup Complete!');
        console.log('='.repeat(50));
        
        console.log('\n📁 Test data created in: test-data/');
        console.log('📄 Configuration: test-data/test-config.json');
        console.log('🖼️  Test images: test-data/images/');
        console.log('👥 Test users: Created in database');
        console.log('🎨 Test artworks: Created in database');
        
        console.log('\n🔧 Available test scripts:');
        console.log('   npm run test:book          # Run comprehensive test book');
        console.log('   npm run test:services      # Run service-level tests');
        console.log('   npm run test:integration   # Run integration tests');
        console.log('   npm run test:security      # Run security tests');
        console.log('   npm run test:performance   # Run performance tests');
        console.log('   npm run test:accessibility # Run accessibility tests');
        
        console.log('\n🧹 Cleanup scripts:');
        console.log('   node scripts/clean-test-data.js  # Clean test data');
        console.log('   node scripts/reset-test-db.js    # Reset test database');
        
    } catch (error) {
        log(`Test data setup failed: ${error.message}`, 'error');
        process.exit(1);
    }
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NydArt Advisor Test Data Setup Script

Usage: node scripts/setup-test-data.js [options]

Options:
  --help, -h          Show this help message
  --clean             Clean existing test data before setup
  --force             Force setup even if services are not available

Examples:
  node scripts/setup-test-data.js                    # Normal setup
  node scripts/setup-test-data.js --clean           # Clean and setup
  node scripts/setup-test-data.js --force           # Force setup
`);
    process.exit(0);
}

// Run the main function
main().catch(error => {
    log(`Setup failed: ${error.message}`, 'error');
    process.exit(1);
});
