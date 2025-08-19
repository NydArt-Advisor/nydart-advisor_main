#!/usr/bin/env node

/**
 * NydArt Advisor - Bug Analysis and Fix Automation
 * 
 * This script provides automated bug analysis, fix generation, and validation
 * capabilities to support the bug correction plan.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const BugTracker = require('./bug-tracker');

// Analysis configuration
const CONFIG = {
    analysisTimeout: 30000, // 30 seconds
    maxRetries: 3,
    fixTemplates: 'fix-templates',
    analysisReports: 'analysis-reports',
    autoFixEnabled: false, // Set to true to enable automatic fixes
    backupBeforeFix: true
};

// Service-specific analysis rules
const ANALYSIS_RULES = {
    auth_service: {
        criticalPatterns: [
            /jwt.*invalid/i,
            /authentication.*failed/i,
            /password.*hash.*error/i,
            /oauth.*callback.*error/i
        ],
        highPatterns: [
            /login.*failed/i,
            /session.*expired/i,
            /token.*expired/i
        ],
        mediumPatterns: [
            /validation.*error/i,
            /input.*invalid/i
        ],
        autoFixRules: {
            'jwt-validation': {
                pattern: /jwt.*validation.*failed/i,
                fix: 'Implement proper JWT validation middleware',
                files: ['src/middleware/auth.js', 'src/services/jwtService.js'],
                risk: 'medium'
            },
            'password-hash': {
                pattern: /password.*hash.*error/i,
                fix: 'Update password hashing to use bcrypt with proper salt rounds',
                files: ['src/services/authService.js'],
                risk: 'high'
            }
        }
    },
    db_service: {
        criticalPatterns: [
            /database.*connection.*failed/i,
            /mongodb.*error/i,
            /query.*timeout/i
        ],
        highPatterns: [
            /index.*missing/i,
            /duplicate.*key/i,
            /validation.*failed/i
        ],
        mediumPatterns: [
            /slow.*query/i,
            /connection.*pool.*exhausted/i
        ],
        autoFixRules: {
            'missing-index': {
                pattern: /index.*missing/i,
                fix: 'Add database indexes for frequently queried fields',
                files: ['src/models/*.js'],
                risk: 'low'
            },
            'connection-timeout': {
                pattern: /connection.*timeout/i,
                fix: 'Implement connection pooling and retry logic',
                files: ['src/config/database.js'],
                risk: 'medium'
            }
        }
    },
    ai_service: {
        criticalPatterns: [
            /openai.*api.*error/i,
            /file.*upload.*failed/i,
            /memory.*leak/i
        ],
        highPatterns: [
            /image.*processing.*error/i,
            /model.*loading.*failed/i
        ],
        mediumPatterns: [
            /response.*timeout/i,
            /invalid.*file.*type/i
        ],
        autoFixRules: {
            'file-upload': {
                pattern: /file.*upload.*failed/i,
                fix: 'Implement proper file validation and error handling',
                files: ['src/middleware/upload.js', 'src/services/imageService.js'],
                risk: 'medium'
            },
            'api-timeout': {
                pattern: /openai.*timeout/i,
                fix: 'Add timeout handling and retry logic for API calls',
                files: ['src/services/aiService.js'],
                risk: 'low'
            }
        }
    },
    payment_service: {
        criticalPatterns: [
            /stripe.*webhook.*failed/i,
            /payment.*processing.*error/i,
            /security.*violation/i
        ],
        highPatterns: [
            /transaction.*failed/i,
            /webhook.*signature.*invalid/i
        ],
        mediumPatterns: [
            /currency.*conversion.*error/i,
            /refund.*failed/i
        ],
        autoFixRules: {
            'webhook-signature': {
                pattern: /webhook.*signature.*invalid/i,
                fix: 'Implement proper webhook signature verification',
                files: ['src/middleware/webhook.js'],
                risk: 'high'
            },
            'payment-validation': {
                pattern: /payment.*validation.*failed/i,
                fix: 'Add comprehensive payment validation',
                files: ['src/services/paymentService.js'],
                risk: 'medium'
            }
        }
    },
    notification_service: {
        criticalPatterns: [
            /email.*delivery.*failed/i,
            /sms.*sending.*error/i,
            /template.*not.*found/i
        ],
        highPatterns: [
            /rate.*limit.*exceeded/i,
            /invalid.*email.*address/i
        ],
        mediumPatterns: [
            /notification.*queue.*full/i,
            /template.*rendering.*error/i
        ],
        autoFixRules: {
            'email-validation': {
                pattern: /invalid.*email.*address/i,
                fix: 'Implement proper email validation',
                files: ['src/services/emailService.js'],
                risk: 'low'
            },
            'rate-limiting': {
                pattern: /rate.*limit.*exceeded/i,
                fix: 'Implement rate limiting and retry logic',
                files: ['src/middleware/rateLimit.js'],
                risk: 'medium'
            }
        }
    },
    metrics_service: {
        criticalPatterns: [
            /metrics.*collection.*failed/i,
            /prometheus.*error/i,
            /data.*corruption/i
        ],
        highPatterns: [
            /aggregation.*failed/i,
            /storage.*full/i
        ],
        mediumPatterns: [
            /query.*performance.*slow/i,
            /cache.*miss/i
        ],
        autoFixRules: {
            'storage-cleanup': {
                pattern: /storage.*full/i,
                fix: 'Implement automatic metrics cleanup and retention policies',
                files: ['src/services/metricsService.js'],
                risk: 'low'
            },
            'query-optimization': {
                pattern: /query.*performance.*slow/i,
                fix: 'Optimize database queries and add indexes',
                files: ['src/models/Metric.js'],
                risk: 'medium'
            }
        }
    },
    front: {
        criticalPatterns: [
            /react.*error/i,
            /javascript.*error/i,
            /accessibility.*violation/i
        ],
        highPatterns: [
            /component.*rendering.*failed/i,
            /api.*call.*failed/i
        ],
        mediumPatterns: [
            /performance.*issue/i,
            /responsive.*design.*broken/i
        ],
        autoFixRules: {
            'accessibility': {
                pattern: /accessibility.*violation/i,
                fix: 'Add missing ARIA labels and improve keyboard navigation',
                files: ['src/components/**/*.jsx'],
                risk: 'low'
            },
            'api-error-handling': {
                pattern: /api.*call.*failed/i,
                fix: 'Implement proper error handling for API calls',
                files: ['src/services/api.js'],
                risk: 'medium'
            }
        }
    }
};

// Bug analysis class
class BugAnalyzer {
    constructor() {
        this.tracker = new BugTracker();
        this.ensureDirectories();
        this.loadFixTemplates();
    }

    ensureDirectories() {
        const dirs = [CONFIG.fixTemplates, CONFIG.analysisReports];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    loadFixTemplates() {
        this.fixTemplates = {};
        const templatesDir = CONFIG.fixTemplates;
        
        if (fs.existsSync(templatesDir)) {
            const files = fs.readdirSync(templatesDir);
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    const templateName = path.basename(file, '.json');
                    const templatePath = path.join(templatesDir, file);
                    try {
                        this.fixTemplates[templateName] = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
                    } catch (error) {
                        console.error(`Error loading template ${templateName}:`, error);
                    }
                }
            });
        }
    }

    // Automated bug detection from test results
    async detectBugsFromTestResults(testResults) {
        const detectedBugs = [];

        for (const result of testResults) {
            if (result.status === 'failed') {
                const bug = await this.analyzeTestFailure(result);
                if (bug) {
                    detectedBugs.push(bug);
                }
            }
        }

        return detectedBugs;
    }

    async analyzeTestFailure(testResult) {
        const { service, testName, error, output } = testResult;
        
        // Analyze error patterns
        const severity = this.determineSeverity(error, service);
        const category = this.determineCategory(error, service);
        const patterns = this.findMatchingPatterns(error, service);

        if (severity && category) {
            const bugData = {
                title: `Test failure: ${testName}`,
                description: this.generateBugDescription(testResult, patterns),
                service: service,
                component: this.extractComponent(testName),
                severity: severity,
                category: category,
                detectedBy: 'automated-test',
                testCase: testName,
                errorMessage: error,
                stackTrace: output,
                environment: 'test',
                stepsToReproduce: this.generateStepsToReproduce(testResult),
                expectedBehavior: this.extractExpectedBehavior(testResult),
                actualBehavior: error,
                impact: this.assessImpact(severity, category, service),
                tags: patterns.map(p => p.name)
            };

            return this.tracker.createBug(bugData);
        }

        return null;
    }

    determineSeverity(error, service) {
        const rules = ANALYSIS_RULES[service];
        if (!rules) return 'medium';

        // Check critical patterns first
        for (const pattern of rules.criticalPatterns) {
            if (pattern.test(error)) {
                return 'critical';
            }
        }

        // Check high patterns
        for (const pattern of rules.highPatterns) {
            if (pattern.test(error)) {
                return 'high';
            }
        }

        // Check medium patterns
        for (const pattern of rules.mediumPatterns) {
            if (pattern.test(error)) {
                return 'medium';
            }
        }

        return 'low';
    }

    determineCategory(error, service) {
        const errorLower = error.toLowerCase();
        
        if (errorLower.includes('security') || errorLower.includes('authentication') || errorLower.includes('authorization')) {
            return 'security';
        }
        if (errorLower.includes('performance') || errorLower.includes('timeout') || errorLower.includes('slow')) {
            return 'performance';
        }
        if (errorLower.includes('accessibility') || errorLower.includes('aria') || errorLower.includes('screen reader')) {
            return 'accessibility';
        }
        if (errorLower.includes('database') || errorLower.includes('connection') || errorLower.includes('query')) {
            return 'data';
        }
        if (errorLower.includes('api') || errorLower.includes('integration') || errorLower.includes('service')) {
            return 'integration';
        }
        
        return 'functional';
    }

    findMatchingPatterns(error, service) {
        const rules = ANALYSIS_RULES[service];
        if (!rules) return [];

        const patterns = [];
        
        // Check auto-fix rules
        Object.entries(rules.autoFixRules || {}).forEach(([name, rule]) => {
            if (rule.pattern.test(error)) {
                patterns.push({
                    name: name,
                    type: 'auto-fix',
                    rule: rule
                });
            }
        });

        return patterns;
    }

    generateBugDescription(testResult, patterns) {
        const { service, testName, error } = testResult;
        
        let description = `Test "${testName}" in ${service} service failed with error: ${error}`;
        
        if (patterns.length > 0) {
            description += `\n\nDetected patterns: ${patterns.map(p => p.name).join(', ')}`;
            
            const autoFixPatterns = patterns.filter(p => p.type === 'auto-fix');
            if (autoFixPatterns.length > 0) {
                description += `\n\nPotential auto-fix available for: ${autoFixPatterns.map(p => p.name).join(', ')}`;
            }
        }

        return description;
    }

    extractComponent(testName) {
        // Extract component name from test name
        const parts = testName.split(' ');
        if (parts.length > 1) {
            return parts[1]; // Usually the second part contains component/service name
        }
        return 'unknown';
    }

    generateStepsToReproduce(testResult) {
        return [
            `Run the test: ${testResult.testName}`,
            `Execute: npm test in ${testResult.service} directory`,
            `Observe the failure with error: ${testResult.error}`
        ];
    }

    extractExpectedBehavior(testResult) {
        // Try to extract expected behavior from test name or output
        const testName = testResult.testName.toLowerCase();
        
        if (testName.includes('should')) {
            return testName.replace('should', 'Expected to').replace(/_/g, ' ');
        }
        
        return 'Test should pass without errors';
    }

    assessImpact(severity, category, service) {
        const impact = {
            userImpact: {
                severity: severity,
                description: this.getUserImpactDescription(category),
                affectedUsers: this.estimateAffectedUsers(severity),
                duration: this.estimateDuration(severity)
            },
            businessImpact: {
                revenue: this.estimateRevenueImpact(severity, category),
                reputation: this.estimateReputationImpact(category),
                compliance: this.estimateComplianceImpact(category)
            },
            technicalImpact: {
                systemStability: this.estimateSystemImpact(severity, category),
                performance: this.estimatePerformanceImpact(category),
                security: this.estimateSecurityImpact(category)
            }
        };

        return impact;
    }

    getUserImpactDescription(category) {
        const descriptions = {
            security: 'Users may be vulnerable to security attacks',
            performance: 'Users experience slow response times',
            functional: 'Users cannot complete expected tasks',
            accessibility: 'Users with disabilities cannot access features',
            data: 'Data integrity or availability issues',
            integration: 'Service communication failures'
        };
        return descriptions[category] || 'Users experience unexpected behavior';
    }

    estimateAffectedUsers(severity) {
        const multipliers = {
            critical: 1.0,
            high: 0.7,
            medium: 0.4,
            low: 0.1
        };
        return `~${Math.round(1000 * multipliers[severity])} users`;
    }

    estimateDuration(severity) {
        const durations = {
            critical: 'Immediate',
            high: 'Within 24 hours',
            medium: 'Within 1 week',
            low: 'Within 1 month'
        };
        return durations[severity];
    }

    estimateRevenueImpact(severity, category) {
        if (category === 'security' || severity === 'critical') {
            return 'High - Potential revenue loss';
        }
        if (severity === 'high') {
            return 'Medium - Some revenue impact';
        }
        return 'Low - Minimal revenue impact';
    }

    estimateReputationImpact(category) {
        if (category === 'security') {
            return 'High - Security issues affect trust';
        }
        return 'Medium - Affects user experience';
    }

    estimateComplianceImpact(category) {
        if (category === 'security') {
            return 'High - May violate security regulations';
        }
        if (category === 'accessibility') {
            return 'Medium - May violate accessibility standards';
        }
        return 'Low - No compliance issues';
    }

    estimateSystemImpact(severity, category) {
        if (category === 'performance' || severity === 'critical') {
            return 'High - System performance degraded';
        }
        return 'Medium - System stability affected';
    }

    estimatePerformanceImpact(category) {
        if (category === 'performance') {
            return 'High - Significant performance degradation';
        }
        return 'Low - Minimal performance impact';
    }

    estimateSecurityImpact(category) {
        if (category === 'security') {
            return 'High - Security vulnerability present';
        }
        return 'Low - No security implications';
    }

    // Automated fix generation
    async generateFix(bugId) {
        const bug = this.tracker.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const patterns = this.findMatchingPatterns(bug.errorMessage, bug.service);
        const autoFixPatterns = patterns.filter(p => p.type === 'auto-fix');

        if (autoFixPatterns.length === 0) {
            return {
                canAutoFix: false,
                reason: 'No automatic fix patterns matched',
                manualSteps: this.generateManualFixSteps(bug)
            };
        }

        const fixes = [];
        for (const pattern of autoFixPatterns) {
            const fix = await this.generatePatternFix(bug, pattern);
            if (fix) {
                fixes.push(fix);
            }
        }

        return {
            canAutoFix: true,
            fixes: fixes,
            riskAssessment: this.assessFixRisk(fixes),
            rollbackPlan: this.generateRollbackPlan(fixes)
        };
    }

    async generatePatternFix(bug, pattern) {
        const rule = pattern.rule;
        const template = this.fixTemplates[pattern.name];

        if (!template) {
            return {
                type: 'manual',
                description: rule.fix,
                files: rule.files,
                risk: rule.risk,
                implementation: this.generateManualImplementation(rule)
            };
        }

        return {
            type: 'automated',
            description: rule.fix,
            files: rule.files,
            risk: rule.risk,
            implementation: template.implementation,
            validation: template.validation
        };
    }

    generateManualFixSteps(bug) {
        const steps = [
            'Analyze the root cause of the bug',
            'Identify the affected code components',
            'Implement the necessary fixes',
            'Add appropriate tests to prevent regression',
            'Validate the fix in a test environment',
            'Deploy the fix to production'
        ];

        // Add service-specific steps
        switch (bug.service) {
            case 'auth_service':
                steps.splice(2, 0, 'Review authentication flow and security implications');
                break;
            case 'db_service':
                steps.splice(2, 0, 'Check database schema and query optimization');
                break;
            case 'ai_service':
                steps.splice(2, 0, 'Verify AI model integration and API calls');
                break;
            case 'payment_service':
                steps.splice(2, 0, 'Ensure payment security and compliance');
                break;
        }

        return steps;
    }

    generateManualImplementation(rule) {
        return {
            description: rule.fix,
            codeChanges: this.generateCodeChanges(rule),
            testChanges: this.generateTestChanges(rule),
            configurationChanges: this.generateConfigChanges(rule)
        };
    }

    generateCodeChanges(rule) {
        // Generate example code changes based on the rule
        const changes = [];
        
        if (rule.files.includes('src/middleware/auth.js')) {
            changes.push({
                file: 'src/middleware/auth.js',
                description: 'Add JWT validation middleware',
                code: `
const jwt = require('jsonwebtoken');

const validateJWT = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { validateJWT };
`
            });
        }

        return changes;
    }

    generateTestChanges(rule) {
        return [
            {
                description: 'Add unit tests for the fix',
                testFile: 'test/unit/fix.test.js',
                testCode: `
describe('Fix Implementation', () => {
    it('should handle the error case properly', () => {
        // Test implementation
    });
});
`
            }
        ];
    }

    generateConfigChanges(rule) {
        return [
            {
                description: 'Update configuration if needed',
                configFile: '.env',
                changes: [
                    'Add required environment variables',
                    'Update timeout values if needed'
                ]
            }
        ];
    }

    assessFixRisk(fixes) {
        const risks = fixes.map(fix => fix.risk);
        const riskLevels = { low: 1, medium: 2, high: 3 };
        
        const maxRisk = Math.max(...risks.map(r => riskLevels[r]));
        
        return {
            overallRisk: Object.keys(riskLevels).find(key => riskLevels[key] === maxRisk),
            details: fixes.map(fix => ({
                description: fix.description,
                risk: fix.risk,
                mitigation: this.getRiskMitigation(fix.risk)
            }))
        };
    }

    getRiskMitigation(risk) {
        const mitigations = {
            low: 'Low risk - can be applied directly',
            medium: 'Medium risk - test thoroughly before deployment',
            high: 'High risk - requires careful review and testing'
        };
        return mitigations[risk] || 'Unknown risk level';
    }

    generateRollbackPlan(fixes) {
        return {
            description: 'Rollback plan for applied fixes',
            steps: [
                'Stop the affected service',
                'Restore from backup if available',
                'Revert code changes',
                'Restart the service',
                'Verify system stability'
            ],
            backupLocation: 'Backup files stored in backup/ directory',
            rollbackScript: 'scripts/rollback-fix.js'
        };
    }

    // Automated fix application
    async applyFix(bugId, fixData) {
        if (!CONFIG.autoFixEnabled) {
            throw new Error('Auto-fix is disabled. Set CONFIG.autoFixEnabled = true to enable.');
        }

        const bug = this.tracker.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        // Create backup
        if (CONFIG.backupBeforeFix) {
            await this.createBackup(bug.service);
        }

        // Apply the fix
        const fixResult = await this.applyFixImplementation(fixData);
        
        // Update bug tracker
        const fix = this.tracker.implementFix(bugId, {
            description: fixData.description,
            implementation: fixData.implementation,
            filesChanged: fixData.filesChanged || [],
            testsAdded: fixData.testsAdded || [],
            riskAssessment: fixData.riskAssessment,
            rollbackPlan: fixData.rollbackPlan,
            implementedBy: 'automated-fix'
        });

        return {
            fix: fix,
            result: fixResult,
            backup: CONFIG.backupBeforeFix ? `backup/${bug.service}-${Date.now()}` : null
        };
    }

    async createBackup(service) {
        const backupDir = `backup/${service}-${Date.now()}`;
        fs.mkdirSync(backupDir, { recursive: true });

        // Copy service files
        if (fs.existsSync(service)) {
            this.copyDirectory(service, backupDir);
        }

        return backupDir;
    }

    copyDirectory(src, dest) {
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }

        const files = fs.readdirSync(src);
        files.forEach(file => {
            const srcPath = path.join(src, file);
            const destPath = path.join(dest, file);
            
            if (fs.statSync(srcPath).isDirectory()) {
                this.copyDirectory(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
            }
        });
    }

    async applyFixImplementation(fixData) {
        const results = [];

        for (const fix of fixData.fixes) {
            if (fix.type === 'automated') {
                const result = await this.applyAutomatedFix(fix);
                results.push(result);
            } else {
                const result = await this.applyManualFix(fix);
                results.push(result);
            }
        }

        return results;
    }

    async applyAutomatedFix(fix) {
        // Apply automated code changes
        const changes = fix.implementation.changes || [];
        const results = [];

        for (const change of changes) {
            try {
                await this.applyCodeChange(change);
                results.push({
                    type: 'code_change',
                    file: change.file,
                    status: 'success'
                });
            } catch (error) {
                results.push({
                    type: 'code_change',
                    file: change.file,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return {
            fix: fix.description,
            results: results,
            status: results.every(r => r.status === 'success') ? 'success' : 'partial'
        };
    }

    async applyManualFix(fix) {
        // Generate manual fix instructions
        return {
            fix: fix.description,
            type: 'manual',
            instructions: fix.implementation,
            status: 'pending_manual_implementation'
        };
    }

    async applyCodeChange(change) {
        const { file, code, description } = change;
        
        // Validate file exists
        if (!fs.existsSync(file)) {
            throw new Error(`File ${file} does not exist`);
        }

        // Apply the code change
        if (code) {
            fs.writeFileSync(file, code);
        }

        return { file, status: 'applied' };
    }

    // Validation and testing
    async validateFix(bugId) {
        const bug = this.tracker.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const validationResults = [];

        // Run tests
        const testResults = await this.runTests(bug.service);
        validationResults.push({
            type: 'tests',
            results: testResults,
            passed: testResults.every(r => r.status === 'passed')
        });

        // Check for regressions
        const regressionResults = await this.checkForRegressions(bug.service);
        validationResults.push({
            type: 'regression',
            results: regressionResults,
            passed: regressionResults.length === 0
        });

        // Performance impact
        const performanceResults = await this.assessPerformanceImpact(bug.service);
        validationResults.push({
            type: 'performance',
            results: performanceResults,
            passed: performanceResults.impact === 'minimal'
        });

        const overallPassed = validationResults.every(r => r.passed);

        // Update bug tracker
        const validation = this.tracker.validateFix(bugId, {
            testsRun: testResults,
            results: validationResults,
            performanceImpact: performanceResults,
            regressionTests: regressionResults,
            validatedBy: 'automated-validation',
            passed: overallPassed
        });

        return {
            validation: validation,
            results: validationResults,
            overallPassed: overallPassed
        };
    }

    async runTests(service) {
        try {
            // Run npm test in service directory
            const { spawn } = require('child_process');
            
            return new Promise((resolve) => {
                const testProcess = spawn('npm', ['test'], {
                    cwd: service,
                    stdio: 'pipe'
                });

                let output = '';
                testProcess.stdout.on('data', (data) => {
                    output += data.toString();
                });

                testProcess.stderr.on('data', (data) => {
                    output += data.toString();
                });

                testProcess.on('close', (code) => {
                    resolve({
                        status: code === 0 ? 'passed' : 'failed',
                        output: output,
                        exitCode: code
                    });
                });
            });
        } catch (error) {
            return {
                status: 'error',
                output: error.message,
                exitCode: -1
            };
        }
    }

    async checkForRegressions(service) {
        // Check for new bugs introduced by the fix
        const regressions = [];
        
        // This would typically involve running a broader test suite
        // or comparing against known good baselines
        
        return regressions;
    }

    async assessPerformanceImpact(service) {
        // Assess performance impact of the fix
        return {
            impact: 'minimal', // minimal, moderate, significant
            details: 'Performance impact assessment would be implemented here'
        };
    }

    // Reporting
    generateAnalysisReport(bugId) {
        const bug = this.tracker.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const report = {
            bugId: bug.id,
            title: bug.title,
            service: bug.service,
            severity: bug.severity,
            category: bug.category,
            detectedAt: bug.detectedAt,
            analysis: {
                rootCause: bug.rootCauseAnalysis,
                impact: bug.impact,
                patterns: this.findMatchingPatterns(bug.errorMessage, bug.service)
            },
            fix: {
                available: bug.fix ? true : false,
                details: bug.fix,
                autoFixPossible: this.canAutoFix(bug),
                riskAssessment: bug.fix?.riskAssessment
            },
            validation: {
                status: bug.validation?.status,
                results: bug.validation?.results
            },
            recommendations: this.generateRecommendations(bug)
        };

        return report;
    }

    canAutoFix(bug) {
        const patterns = this.findMatchingPatterns(bug.errorMessage, bug.service);
        return patterns.some(p => p.type === 'auto-fix');
    }

    generateRecommendations(bug) {
        const recommendations = [];

        // Add general recommendations
        recommendations.push(
            'Implement automated testing for this type of bug',
            'Add monitoring to detect similar issues early',
            'Update development guidelines to prevent recurrence'
        );

        // Add service-specific recommendations
        switch (bug.service) {
            case 'auth_service':
                recommendations.push(
                    'Implement comprehensive security testing',
                    'Add authentication flow monitoring',
                    'Regular security audits'
                );
                break;
            case 'db_service':
                recommendations.push(
                    'Database performance monitoring',
                    'Regular index optimization',
                    'Connection pool monitoring'
                );
                break;
            case 'ai_service':
                recommendations.push(
                    'AI model performance monitoring',
                    'API rate limiting and error handling',
                    'File upload validation'
                );
                break;
        }

        return recommendations;
    }

    saveAnalysisReport(report, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `bug-analysis-${report.bugId}-${timestamp}.json`;
        }

        const filepath = path.join(CONFIG.analysisReports, filename);
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
        return filepath;
    }
}

// CLI interface
const main = async () => {
    const analyzer = new BugAnalyzer();
    const args = process.argv.slice(2);
    const command = args[0];

    try {
        switch (command) {
            case 'analyze':
                const bugId = args[1];
                const analysis = await analyzer.tracker.analyzeRootCause(bugId);
                console.log('Root cause analysis completed:', analysis);
                break;

            case 'generate-fix':
                const fixBugId = args[1];
                const fixData = await analyzer.generateFix(fixBugId);
                console.log('Fix generated:', fixData);
                break;

            case 'apply-fix':
                const applyBugId = args[1];
                const applyResult = await analyzer.applyFix(applyBugId);
                console.log('Fix applied:', applyResult);
                break;

            case 'validate':
                const validateBugId = args[1];
                const validation = await analyzer.validateFix(validateBugId);
                console.log('Fix validation:', validation);
                break;

            case 'report':
                const reportBugId = args[1];
                const report = analyzer.generateAnalysisReport(reportBugId);
                const reportFile = analyzer.saveAnalysisReport(report);
                console.log('Analysis report saved:', reportFile);
                break;

            case 'detect':
                const testResultsFile = args[1];
                const testResults = JSON.parse(fs.readFileSync(testResultsFile, 'utf8'));
                const detectedBugs = await analyzer.detectBugsFromTestResults(testResults);
                console.log(`Detected ${detectedBugs.length} bugs from test results`);
                break;

            case 'help':
            default:
                console.log(`
NydArt Advisor Bug Analyzer

Usage: node scripts/bug-analyzer.js <command> [options]

Commands:
  analyze <bugId>
    Perform root cause analysis on a bug

  generate-fix <bugId>
    Generate fix for a bug

  apply-fix <bugId>
    Apply automated fix (if enabled)

  validate <bugId>
    Validate a fix

  report <bugId>
    Generate analysis report

  detect <testResultsFile>
    Detect bugs from test results

  help
    Show this help message

Examples:
  node scripts/bug-analyzer.js analyze BUG-1234567890-123
  node scripts/bug-analyzer.js generate-fix BUG-1234567890-123
  node scripts/bug-analyzer.js report BUG-1234567890-123
`);
                break;
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Run CLI if called directly
if (require.main === module) {
    main();
}

module.exports = BugAnalyzer;
