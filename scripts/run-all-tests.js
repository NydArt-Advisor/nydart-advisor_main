#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Service configurations
const services = [
  {
    name: 'AI Service',
    path: 'ai_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[36m' // Cyan
  },
  {
    name: 'Auth Service',
    path: 'auth_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[32m' // Green
  },
  {
    name: 'Database Service',
    path: 'db_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[33m' // Yellow
  },
  {
    name: 'Payment Service',
    path: 'payment_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[35m' // Magenta
  },
  {
    name: 'Notification Service',
    path: 'notification_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[34m' // Blue
  },
  {
    name: 'Metrics Service',
    path: 'metrics_service',
    testCommand: 'npm run test:simple',
    color: '\x1b[31m' // Red
  },
  {
    name: 'Frontend (Next.js)',
    path: 'front',
    testCommand: 'npm run test:simple',
    color: '\x1b[37m' // White
  }
];

const resetColor = '\x1b[0m';
const bold = '\x1b[1m';

// Results tracking
const results = {
  passed: 0,
  failed: 0,
  total: services.length,
  details: []
};

function log(message, color = resetColor) {
  console.log(`${color}${message}${resetColor}`);
}

function logBold(message, color = resetColor) {
  console.log(`${color}${bold}${message}${resetColor}`);
}

function runServiceTests(service) {
  return new Promise((resolve) => {
    const servicePath = path.join(__dirname, '..', service.path);
    
    // Check if service directory exists
    if (!fs.existsSync(servicePath)) {
      log(`❌ ${service.name}: Directory not found`, service.color);
      results.failed++;
      results.details.push({
        name: service.name,
        status: 'FAILED',
        error: 'Directory not found'
      });
      resolve();
      return;
    }

    logBold(`\n🧪 Running ${service.name} Tests...`, service.color);
    log(`📁 Path: ${servicePath}`, service.color);
    log(`⚡ Command: ${service.testCommand}\n`, service.color);

    const testProcess = spawn(service.testCommand, [], {
      stdio: 'inherit',
      cwd: servicePath,
      shell: true
    });

    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${service.name}: All tests passed!`, service.color);
        results.passed++;
        results.details.push({
          name: service.name,
          status: 'PASSED'
        });
      } else {
        log(`❌ ${service.name}: Tests failed with code ${code}`, service.color);
        results.failed++;
        results.details.push({
          name: service.name,
          status: 'FAILED',
          code: code
        });
      }
      resolve();
    });

    testProcess.on('error', (error) => {
      log(`❌ ${service.name}: Failed to run tests - ${error.message}`, service.color);
      results.failed++;
      results.details.push({
        name: service.name,
        status: 'ERROR',
        error: error.message
      });
      resolve();
    });
  });
}

async function runAllTests() {
  logBold('\n🚀 NydArt Advisor - Master Test Runner', bold);
  log('='.repeat(50));
  log(`📊 Running tests for ${services.length} services...\n`);

  const startTime = Date.now();

  // Run tests sequentially to avoid conflicts
  for (const service of services) {
    await runServiceTests(service);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  logBold('\n📋 Test Summary', bold);
  log('='.repeat(50));
  log(`⏱️  Total Duration: ${duration}s`);
  log(`📊 Results: ${results.passed}/${results.total} services passed`);
  
  if (results.passed === results.total) {
    logBold(`\n🎉 All ${results.total} services passed!`, '\x1b[32m');
  } else {
    logBold(`\n⚠️  ${results.failed} service(s) failed`, '\x1b[31m');
  }

  // Print detailed results
  logBold('\n📝 Detailed Results:', bold);
  results.details.forEach(detail => {
    const color = detail.status === 'PASSED' ? '\x1b[32m' : '\x1b[31m';
    const icon = detail.status === 'PASSED' ? '✅' : '❌';
    log(`${icon} ${detail.name}: ${detail.status}`, color);
    if (detail.error) {
      log(`   Error: ${detail.error}`, '\x1b[33m');
    }
  });

  // Exit with appropriate code
  const exitCode = results.failed > 0 ? 1 : 0;
  if (exitCode === 0) {
    logBold('\n🎊 All tests completed successfully!', '\x1b[32m');
  } else {
    logBold('\n💥 Some tests failed. Please check the output above.', '\x1b[31m');
  }

  process.exit(exitCode);
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  logBold('\n📖 NydArt Advisor - Master Test Runner Help', bold);
  log('='.repeat(50));
  log('Usage: node scripts/run-all-tests.js [options]');
  log('');
  log('Options:');
  log('  --help, -h     Show this help message');
  log('  --parallel     Run tests in parallel (experimental)');
  log('  --service <name> Run tests for specific service only');
  log('');
  log('Services:');
  services.forEach(service => {
    log(`  - ${service.name}`);
  });
  log('');
  log('Examples:');
  log('  node scripts/run-all-tests.js');
  log('  node scripts/run-all-tests.js --service "AI Service"');
  log('  node scripts/run-all-tests.js --parallel');
  process.exit(0);
}

if (args.includes('--service')) {
  const serviceName = args[args.indexOf('--service') + 1];
  const service = services.find(s => s.name.toLowerCase().includes(serviceName.toLowerCase()));
  if (service) {
    logBold(`\n🎯 Running tests for ${service.name} only`, bold);
    runServiceTests(service).then(() => {
      logBold('\n✅ Single service test completed!', '\x1b[32m');
      process.exit(0);
    });
  } else {
    log(`❌ Service "${serviceName}" not found`, '\x1b[31m');
    log('Available services:', '\x1b[33m');
    services.forEach(s => log(`  - ${s.name}`));
    process.exit(1);
  }
} else {
  runAllTests();
}
