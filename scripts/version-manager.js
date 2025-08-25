#!/usr/bin/env node

/**
 * NydArt Advisor - Version Management Script
 * 
 * This script manages versioning across all microservices
 * Usage: node scripts/version-manager.js [command] [options]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Service configuration
const SERVICES = [
  { name: 'auth-service', path: 'auth_service', port: 5002 },
  { name: 'db-service', path: 'db_service', port: 5001 },
  { name: 'ai-service', path: 'ai_service', port: 5003 },
  { name: 'payment-service', path: 'payment_service', port: 5004 },
  { name: 'notification-service', path: 'notification_service', port: 5005 },
  { name: 'metrics-service', path: 'metrics_service', port: 5006 },
  { name: 'frontend', path: 'front', port: 3000 }
];

// Version types
const VERSION_TYPES = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major'
};

class VersionManager {
  constructor() {
    this.currentVersions = {};
    this.loadCurrentVersions();
  }

  /**
   * Load current versions from all services
   */
  loadCurrentVersions() {
    SERVICES.forEach(service => {
      const packagePath = path.join(service.path, 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        this.currentVersions[service.name] = packageJson.version;
      }
    });
  }

  /**
   * Display current versions
   */
  showVersions() {
    console.log('\n📦 Current Service Versions:\n');
    console.log('┌─────────────────────┬─────────────┬─────────┐');
    console.log('│ Service             │ Version     │ Port    │');
    console.log('├─────────────────────┼─────────────┼─────────┤');
    
    SERVICES.forEach(service => {
      const version = this.currentVersions[service.name] || 'N/A';
      console.log(`│ ${service.name.padEnd(19)} │ ${version.padEnd(11)} │ ${service.port.toString().padEnd(7)} │`);
    });
    
    console.log('└─────────────────────┴─────────────┴─────────┘\n');
  }

  /**
   * Update version for a specific service
   */
  updateVersion(serviceName, versionType = VERSION_TYPES.PATCH) {
    const service = SERVICES.find(s => s.name === serviceName);
    if (!service) {
      console.error(`❌ Service '${serviceName}' not found`);
      return false;
    }

    const packagePath = path.join(service.path, 'package.json');
    if (!fs.existsSync(packagePath)) {
      console.error(`❌ Package.json not found for ${serviceName}`);
      return false;
    }

    try {
      console.log(`🔄 Updating ${serviceName} version...`);
      
      // Change to service directory
      process.chdir(service.path);
      
      // Run npm version command
      const command = `npm version ${versionType} --no-git-tag-version`;
      execSync(command, { stdio: 'inherit' });
      
      // Read updated version
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const newVersion = packageJson.version;
      
      console.log(`✅ ${serviceName} updated to version ${newVersion}`);
      
      // Return to root directory
      process.chdir('../..');
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to update ${serviceName}:`, error.message);
      process.chdir('../..');
      return false;
    }
  }

  /**
   * Show branch-specific versioning information
   */
  showBranchInfo() {
    console.log(`
🌿 Branch-Specific Versioning Strategy:

📋 Branch Structure:
  main  ← Production releases (automatic version bump)
  dev   ← Development & staging (manual version control)
  init  ← Initial setup (no versioning)

🔄 Version Management by Branch:

main Branch (Production):
  - Automatic version bump on push
  - Patch updates for regular releases
  - Minor/Major updates for releases
  - Triggers production deployment

dev Branch (Staging):
  - Manual version control
  - No automatic version bump
  - Used for testing and staging
  - Triggers staging deployment

init Branch (Setup):
  - No version management
  - Initial configuration only
  - No CI/CD triggers

📝 Usage Examples:

For Development:
  git checkout dev
  npm run version:update auth-service --type patch
  git add . && git commit -m "chore: bump version"
  git push origin dev

For Production:
  git checkout main
  git merge dev
  git push origin main
  # Automatic version bump and deployment
`);
  }

  /**
   * Update all services to the same version
   */
  updateAllVersions(versionType = VERSION_TYPES.PATCH) {
    console.log(`🔄 Updating all services to ${versionType} version...\n`);
    
    const results = SERVICES.map(service => ({
      service: service.name,
      success: this.updateVersion(service.name, versionType)
    }));

    console.log('\n📊 Update Results:\n');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.service}`);
    });

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Summary: ${successCount}/${totalCount} services updated successfully\n`);
    
    return successCount === totalCount;
  }

  /**
   * Set specific version for all services
   */
  setVersion(version) {
    console.log(`🔄 Setting all services to version ${version}...\n`);
    
    const results = SERVICES.map(service => {
      const servicePath = path.join(service.path, 'package.json');
      if (!fs.existsSync(servicePath)) {
        return { service: service.name, success: false };
      }

      try {
        const packageJson = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
        packageJson.version = version;
        fs.writeFileSync(servicePath, JSON.stringify(packageJson, null, 2));
        return { service: service.name, success: true };
      } catch (error) {
        console.error(`❌ Failed to update ${service.name}:`, error.message);
        return { service: service.name, success: false };
      }
    });

    console.log('\n📊 Set Version Results:\n');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.service}`);
    });

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n📈 Summary: ${successCount}/${totalCount} services updated to version ${version}\n`);
    
    return successCount === totalCount;
  }

  /**
   * Generate changelog
   */
  generateChangelog() {
    console.log('📝 Generating changelog...\n');
    
    try {
      // Get git log since last tag
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
      
      const changelog = `# Changelog

## [${this.getNextVersion()}] - ${new Date().toISOString().split('T')[0]}

### Changes
${commits.split('\n').filter(line => line.trim()).map(commit => `- ${commit}`).join('\n')}

### Services Updated
${SERVICES.map(service => `- ${service.name} (${service.port})`).join('\n')}

---
Generated by NydArt Advisor Version Manager
`;

      fs.writeFileSync('CHANGELOG.md', changelog);
      console.log('✅ Changelog generated: CHANGELOG.md\n');
      
    } catch (error) {
      console.error('❌ Failed to generate changelog:', error.message);
    }
  }

  /**
   * Get next version based on current version
   */
  getNextVersion() {
    const currentVersion = this.currentVersions[SERVICES[0].name] || '0.1.0';
    const parts = currentVersion.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }

  /**
   * Validate version format
   */
  validateVersion(version) {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  }

  /**
   * Show help
   */
  showHelp() {
    console.log(`
🚀 NydArt Advisor - Version Manager

Usage: node scripts/version-manager.js [command] [options]

Commands:
  show                    Show current versions of all services
  update [service]        Update version for specific service (default: patch)
  update-all              Update all services to next patch version
  set <version>           Set specific version for all services
  changelog               Generate changelog from git commits
  branches                Show branch-specific versioning strategy
  help                    Show this help message

Options:
  --type <type>           Version type: patch, minor, major (default: patch)
  --version <version>     Specific version to set

Examples:
  node scripts/version-manager.js show
  node scripts/version-manager.js update auth-service --type minor
  node scripts/version-manager.js update-all --type patch
  node scripts/version-manager.js set 1.2.3
  node scripts/version-manager.js changelog

Services:
${SERVICES.map(service => `  ${service.name.padEnd(20)} (Port: ${service.port})`).join('\n')}
`);
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new VersionManager();

  switch (command) {
    case 'show':
      manager.showVersions();
      break;
      
    case 'update':
      const serviceName = args[1];
      const updateType = args.find(arg => arg === '--type') ? 
        args[args.indexOf('--type') + 1] : VERSION_TYPES.PATCH;
      
      if (!serviceName) {
        console.error('❌ Service name required for update command');
        process.exit(1);
      }
      
      manager.updateVersion(serviceName, updateType);
      break;
      
    case 'update-all':
      const allUpdateType = args.find(arg => arg === '--type') ? 
        args[args.indexOf('--type') + 1] : VERSION_TYPES.PATCH;
      
      manager.updateAllVersions(allUpdateType);
      break;
      
    case 'set':
      const version = args[1];
      if (!version) {
        console.error('❌ Version required for set command');
        process.exit(1);
      }
      
      if (!manager.validateVersion(version)) {
        console.error('❌ Invalid version format. Use semantic versioning (e.g., 1.2.3)');
        process.exit(1);
      }
      
      manager.setVersion(version);
      break;
      
    case 'changelog':
      manager.generateChangelog();
      break;
      
    case 'branches':
      manager.showBranchInfo();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      manager.showHelp();
      break;
      
    default:
      console.error('❌ Unknown command. Use "help" for usage information.');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = VersionManager;
