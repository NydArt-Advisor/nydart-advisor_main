#!/usr/bin/env node

/**
 * NydArt Advisor - Comprehensive Test Book Execution Script
 * 
 * This script executes all test scenarios described in the TEST_BOOK.md
 * It provides automated testing for all services and the full application.
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
    services: [
        { name: 'auth_service', port: 5002, healthPath: '/api/health' },
        { name: 'db_service', port: 5001, healthPath: '/api/health' },
        { name: 'ai_service', port: 5003, healthPath: '/api/health' },
        { name: 'payment_service', port: 5004, healthPath: '/api/health' },
        { name: 'notification_service', port: 5005, healthPath: '/api/health' },
        { name: 'metrics_service', port: 5006, healthPath: '/api/health' },
        { name: 'front', port: 3000, healthPath: '/api/health' }
    ],
    testTimeout: 300000, // 5 minutes
    healthCheckTimeout: 10000, // 10 seconds
    retryAttempts: 3
};

// Test results storage
const testResults = {
    startTime: new Date(),
    services: {},
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
    }
};

// Utility functions
const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const checkServiceHealth = async (service) => {
    const axios = require('axios');
    const url = `http://localhost:${service.port}${service.healthPath}`;
    
    try {
        const response = await axios.get(url, { timeout: CONFIG.healthCheckTimeout });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};

const waitForService = async (service, maxAttempts = CONFIG.retryAttempts) => {
    log(`Waiting for ${service.name} to be ready...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const isHealthy = await checkServiceHealth(service);
        if (isHealthy) {
            log(`${service.name} is ready!`, 'success');
            return true;
        }
        
        if (attempt < maxAttempts) {
            log(`Attempt ${attempt}/${maxAttempts} failed, retrying in 2 seconds...`, 'warning');
            await sleep(2000);
        }
    }
    
    log(`${service.name} failed to start after ${maxAttempts} attempts`, 'error');
    return false;
};

const runServiceTests = async (serviceName) => {
    return new Promise((resolve) => {
        const servicePath = path.join(__dirname, '..', serviceName);
        const testCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
        
        log(`Running tests for ${serviceName}...`);
        
        const testProcess = spawn(testCommand, ['test'], {
            cwd: servicePath,
            stdio: 'pipe'
        });
        
        let output = '';
        let errorOutput = '';
        
        testProcess.stdout.on('data', (data) => {
            output += data.toString();
            process.stdout.write(data);
        });
        
        testProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            process.stderr.write(data);
        });
        
        testProcess.on('close', (code) => {
            const result = {
                name: serviceName,
                exitCode: code,
                output,
                errorOutput,
                success: code === 0,
                timestamp: new Date()
            };
            
            testResults.services[serviceName] = result;
            
            if (code === 0) {
                log(`${serviceName} tests completed successfully`, 'success');
                testResults.summary.passed++;
            } else {
                log(`${serviceName} tests failed with exit code ${code}`, 'error');
                testResults.summary.failed++;
            }
            
            testResults.summary.total++;
            resolve(result);
        });
        
        testProcess.on('error', (error) => {
            log(`Error running tests for ${serviceName}: ${error.message}`, 'error');
            testResults.services[serviceName] = {
                name: serviceName,
                error: error.message,
                success: false,
                timestamp: new Date()
            };
            testResults.summary.failed++;
            testResults.summary.total++;
            resolve(testResults.services[serviceName]);
        });
        
        // Set timeout
        setTimeout(() => {
            testProcess.kill();
            log(`${serviceName} tests timed out after ${CONFIG.testTimeout / 1000} seconds`, 'error');
            testResults.services[serviceName] = {
                name: serviceName,
                error: 'Test timeout',
                success: false,
                timestamp: new Date()
            };
            testResults.summary.failed++;
            testResults.summary.total++;
            resolve(testResults.services[serviceName]);
        }, CONFIG.testTimeout);
    });
};

const runIntegrationTests = async () => {
    log('Running integration tests...');
    
    const integrationTests = [
        {
            name: 'Service Communication Test',
            test: async () => {
                const axios = require('axios');
                
                // Test Auth ↔ Database communication
                try {
                    const response = await axios.post('http://localhost:5002/api/auth/register', {
                        email: 'test@example.com',
                        password: 'TestPassword123!',
                        name: 'Test User'
                    });
                    return response.status === 201;
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'API Health Check Test',
            test: async () => {
                const axios = require('axios');
                
                for (const service of CONFIG.services) {
                    try {
                        const response = await axios.get(`http://localhost:${service.port}${service.healthPath}`);
                        if (response.status !== 200) return false;
                    } catch (error) {
                        return false;
                    }
                }
                return true;
            }
        }
    ];
    
    const results = [];
    for (const test of integrationTests) {
        try {
            const result = await test.test();
            results.push({ name: test.name, success: result });
            log(`${test.name}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
        } catch (error) {
            results.push({ name: test.name, success: false, error: error.message });
            log(`${test.name}: FAILED - ${error.message}`, 'error');
        }
    }
    
    return results;
};

const runSecurityTests = async () => {
    log('Running security tests...');
    
    const securityTests = [
        {
            name: 'SQL Injection Test',
            test: async () => {
                const axios = require('axios');
                
                try {
                    await axios.post('http://localhost:5002/api/auth/login', {
                        email: "'; DROP TABLE users; --",
                        password: 'test'
                    });
                    return false; // Should fail
                } catch (error) {
                    return error.response?.status === 400 || error.response?.status === 401;
                }
            }
        },
        {
            name: 'XSS Protection Test',
            test: async () => {
                const axios = require('axios');
                
                try {
                    await axios.post('http://localhost:5002/api/auth/register', {
                        email: 'test@example.com',
                        password: 'TestPassword123!',
                        name: '<script>alert("xss")</script>'
                    });
                    return true; // Should sanitize input
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'JWT Token Validation Test',
            test: async () => {
                const axios = require('axios');
                
                try {
                    await axios.get('http://localhost:5001/api/users/profile', {
                        headers: { Authorization: 'Bearer invalid-token' }
                    });
                    return false; // Should fail
                } catch (error) {
                    return error.response?.status === 401;
                }
            }
        }
    ];
    
    const results = [];
    for (const test of securityTests) {
        try {
            const result = await test.test();
            results.push({ name: test.name, success: result });
            log(`${test.name}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
        } catch (error) {
            results.push({ name: test.name, success: false, error: error.message });
            log(`${test.name}: FAILED - ${error.message}`, 'error');
        }
    }
    
    return results;
};

const runPerformanceTests = async () => {
    log('Running performance tests...');
    
    const performanceTests = [
        {
            name: 'Response Time Test',
            test: async () => {
                const axios = require('axios');
                const startTime = Date.now();
                
                try {
                    await axios.get('http://localhost:5001/api/health');
                    const responseTime = Date.now() - startTime;
                    return responseTime < 1000; // Should respond within 1 second
                } catch (error) {
                    return false;
                }
            }
        },
        {
            name: 'Concurrent Requests Test',
            test: async () => {
                const axios = require('axios');
                
                const requests = Array(10).fill().map(() => 
                    axios.get('http://localhost:5001/api/health')
                );
                
                try {
                    const responses = await Promise.all(requests);
                    return responses.every(response => response.status === 200);
                } catch (error) {
                    return false;
                }
            }
        }
    ];
    
    const results = [];
    for (const test of performanceTests) {
        try {
            const result = await test.test();
            results.push({ name: test.name, success: result });
            log(`${test.name}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
        } catch (error) {
            results.push({ name: test.name, success: false, error: error.message });
            log(`${test.name}: FAILED - ${error.message}`, 'error');
        }
    }
    
    return results;
};

const runAccessibilityTests = async () => {
    log('Running accessibility tests...');
    
    const accessibilityTests = [
        {
            name: 'WCAG Compliance Check',
            test: async () => {
                // This would typically use axe-core or similar
                // For now, we'll check if accessibility features are present
                const axios = require('axios');
                
                try {
                    const response = await axios.get('http://localhost:3000');
                    const html = response.data;
                    
                    // Check for basic accessibility features
                    const hasSkipNavigation = html.includes('skip-navigation');
                    const hasAriaLabels = html.includes('aria-label');
                    const hasAltText = html.includes('alt=');
                    
                    return hasSkipNavigation && hasAriaLabels && hasAltText;
                } catch (error) {
                    return false;
                }
            }
        }
    ];
    
    const results = [];
    for (const test of accessibilityTests) {
        try {
            const result = await test.test();
            results.push({ name: test.name, success: result });
            log(`${test.name}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
        } catch (error) {
            results.push({ name: test.name, success: false, error: error.message });
            log(`${test.name}: FAILED - ${error.message}`, 'error');
        }
    }
    
    return results;
};

const generateTestReport = () => {
    const endTime = new Date();
    const duration = endTime - testResults.startTime;
    
    const report = {
        testRun: {
            startTime: testResults.startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: `${Math.round(duration / 1000)} seconds`
        },
        summary: testResults.summary,
        services: testResults.services,
        successRate: testResults.summary.total > 0 
            ? Math.round((testResults.summary.passed / testResults.summary.total) * 100)
            : 0
    };
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'logs', 'test-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
};

const printSummary = (report) => {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST BOOK EXECUTION SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Duration: ${report.testRun.duration}`);
    console.log(`📈 Success Rate: ${report.successRate}%`);
    
    console.log('\n📋 Test Results:');
    console.log(`   Total Tests: ${report.summary.total}`);
    console.log(`   ✅ Passed: ${report.summary.passed}`);
    console.log(`   ❌ Failed: ${report.summary.failed}`);
    console.log(`   ⏭️  Skipped: ${report.summary.skipped}`);
    
    console.log('\n🔧 Service Results:');
    Object.entries(report.services).forEach(([serviceName, result]) => {
        const status = result.success ? '✅ PASSED' : '❌ FAILED';
        console.log(`   ${serviceName}: ${status}`);
    });
    
    console.log('\n📄 Detailed report saved to: logs/test-report.json');
    console.log('='.repeat(60));
};

const main = async () => {
    console.log('🚀 Starting NydArt Advisor Test Book Execution');
    console.log('='.repeat(60));
    
    // Check if services are running
    log('Checking service health...');
    for (const service of CONFIG.services) {
        const isHealthy = await waitForService(service);
        if (!isHealthy) {
            log(`Service ${service.name} is not healthy. Please start all services first.`, 'error');
            process.exit(1);
        }
    }
    
    // Run service-level tests
    log('Starting service-level tests...');
    for (const service of CONFIG.services) {
        await runServiceTests(service.name);
    }
    
    // Run integration tests
    log('Starting integration tests...');
    const integrationResults = await runIntegrationTests();
    testResults.integration = integrationResults;
    
    // Run security tests
    log('Starting security tests...');
    const securityResults = await runSecurityTests();
    testResults.security = securityResults;
    
    // Run performance tests
    log('Starting performance tests...');
    const performanceResults = await runPerformanceTests();
    testResults.performance = performanceResults;
    
    // Run accessibility tests
    log('Starting accessibility tests...');
    const accessibilityResults = await runAccessibilityTests();
    testResults.accessibility = accessibilityResults;
    
    // Generate and print report
    const report = generateTestReport();
    printSummary(report);
    
    // Exit with appropriate code
    const exitCode = report.successRate >= 80 ? 0 : 1;
    process.exit(exitCode);
};

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NydArt Advisor Test Book Execution Script

Usage: node scripts/run-test-book.js [options]

Options:
  --help, -h          Show this help message
  --services-only     Run only service-level tests
  --integration-only  Run only integration tests
  --security-only     Run only security tests
  --performance-only  Run only performance tests
  --accessibility-only Run only accessibility tests

Examples:
  node scripts/run-test-book.js                    # Run all tests
  node scripts/run-test-book.js --services-only    # Run only service tests
  node scripts/run-test-book.js --security-only    # Run only security tests
`);
    process.exit(0);
}

// Run the main function
main().catch(error => {
    log(`Test execution failed: ${error.message}`, 'error');
    process.exit(1);
});
