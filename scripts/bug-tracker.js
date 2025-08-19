#!/usr/bin/env node

/**
 * NydArt Advisor - Bug Tracking and Management System
 * 
 * This script provides comprehensive bug tracking, analysis, and management
 * capabilities to support the bug correction plan.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Bug tracking configuration
const CONFIG = {
    bugDatabase: 'bugs.json',
    bugHistory: 'bug-history.json',
    metricsFile: 'bug-metrics.json',
    reportsDir: 'bug-reports',
    maxBugs: 1000,
    autoCleanup: true
};

// Bug categories and severity levels
const BUG_CATEGORIES = {
    FUNCTIONAL: 'functional',
    SECURITY: 'security',
    PERFORMANCE: 'performance',
    ACCESSIBILITY: 'accessibility',
    INTEGRATION: 'integration',
    DATA: 'data'
};

const SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
};

// Bug lifecycle states
const BUG_STATES = {
    DETECTED: 'detected',
    ANALYZING: 'analyzing',
    FIXING: 'fixing',
    TESTING: 'testing',
    DEPLOYING: 'deploying',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};

// Bug tracking class
class BugTracker {
    constructor() {
        this.bugs = this.loadBugs();
        this.history = this.loadHistory();
        this.metrics = this.loadMetrics();
        this.ensureDirectories();
    }

    // File management
    ensureDirectories() {
        const dirs = [CONFIG.reportsDir];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    loadBugs() {
        try {
            if (fs.existsSync(CONFIG.bugDatabase)) {
                return JSON.parse(fs.readFileSync(CONFIG.bugDatabase, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading bugs:', error);
        }
        return [];
    }

    loadHistory() {
        try {
            if (fs.existsSync(CONFIG.bugHistory)) {
                return JSON.parse(fs.readFileSync(CONFIG.bugHistory, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading bug history:', error);
        }
        return [];
    }

    loadMetrics() {
        try {
            if (fs.existsSync(CONFIG.metricsFile)) {
                return JSON.parse(fs.readFileSync(CONFIG.metricsFile, 'utf8'));
            }
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
        return this.initializeMetrics();
    }

    initializeMetrics() {
        return {
            totalBugs: 0,
            criticalBugs: 0,
            highPriorityBugs: 0,
            mediumPriorityBugs: 0,
            lowPriorityBugs: 0,
            resolvedBugs: 0,
            averageResolutionTime: 0,
            bugTrend: [],
            serviceBreakdown: {},
            categoryBreakdown: {},
            lastUpdated: new Date().toISOString()
        };
    }

    saveBugs() {
        try {
            fs.writeFileSync(CONFIG.bugDatabase, JSON.stringify(this.bugs, null, 2));
        } catch (error) {
            console.error('Error saving bugs:', error);
        }
    }

    saveHistory() {
        try {
            fs.writeFileSync(CONFIG.bugHistory, JSON.stringify(this.history, null, 2));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    saveMetrics() {
        try {
            this.metrics.lastUpdated = new Date().toISOString();
            fs.writeFileSync(CONFIG.metricsFile, JSON.stringify(this.metrics, null, 2));
        } catch (error) {
            console.error('Error saving metrics:', error);
        }
    }

    // Bug management
    createBug(bugData) {
        const bug = {
            id: this.generateBugId(),
            title: bugData.title,
            description: bugData.description,
            service: bugData.service,
            component: bugData.component,
            severity: bugData.severity,
            category: bugData.category,
            state: BUG_STATES.DETECTED,
            detectedAt: new Date().toISOString(),
            detectedBy: bugData.detectedBy || 'automated-test',
            testCase: bugData.testCase,
            errorMessage: bugData.errorMessage,
            stackTrace: bugData.stackTrace,
            environment: bugData.environment,
            stepsToReproduce: bugData.stepsToReproduce,
            expectedBehavior: bugData.expectedBehavior,
            actualBehavior: bugData.actualBehavior,
            impact: bugData.impact,
            assignedTo: null,
            priority: this.calculatePriority(bugData.severity, bugData.category),
            tags: bugData.tags || [],
            attachments: bugData.attachments || [],
            comments: [],
            history: []
        };

        this.bugs.push(bug);
        this.addToHistory(bug, 'created');
        this.updateMetrics(bug, 'add');
        this.saveBugs();
        this.saveHistory();
        this.saveMetrics();

        return bug;
    }

    generateBugId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `BUG-${timestamp}-${random}`;
    }

    calculatePriority(severity, category) {
        const severityWeight = {
            [SEVERITY_LEVELS.CRITICAL]: 4,
            [SEVERITY_LEVELS.HIGH]: 3,
            [SEVERITY_LEVELS.MEDIUM]: 2,
            [SEVERITY_LEVELS.LOW]: 1
        };

        const categoryWeight = {
            [BUG_CATEGORIES.SECURITY]: 4,
            [BUG_CATEGORIES.FUNCTIONAL]: 3,
            [BUG_CATEGORIES.PERFORMANCE]: 2,
            [BUG_CATEGORIES.ACCESSIBILITY]: 1,
            [BUG_CATEGORIES.INTEGRATION]: 2,
            [BUG_CATEGORIES.DATA]: 3
        };

        return severityWeight[severity] * categoryWeight[category];
    }

    updateBug(bugId, updates) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const oldState = bug.state;
        const oldSeverity = bug.severity;

        // Update bug properties
        Object.assign(bug, updates);
        bug.lastUpdated = new Date().toISOString();

        // Add to history
        this.addToHistory(bug, 'updated', updates);

        // Update metrics if severity or state changed
        if (oldSeverity !== bug.severity) {
            this.updateMetrics(bug, 'severity_change', { oldSeverity });
        }

        if (oldState !== bug.state && bug.state === BUG_STATES.RESOLVED) {
            this.updateMetrics(bug, 'resolved');
        }

        this.saveBugs();
        this.saveHistory();
        this.saveMetrics();

        return bug;
    }

    addComment(bugId, comment) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const newComment = {
            id: this.generateCommentId(),
            author: comment.author,
            content: comment.content,
            timestamp: new Date().toISOString(),
            type: comment.type || 'general'
        };

        bug.comments.push(newComment);
        bug.lastUpdated = new Date().toISOString();

        this.addToHistory(bug, 'comment_added', { comment: newComment });
        this.saveBugs();
        this.saveHistory();

        return newComment;
    }

    generateCommentId() {
        return `COMMENT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Root cause analysis
    analyzeRootCause(bugId) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const analysis = {
            bugId: bug.id,
            timestamp: new Date().toISOString(),
            why1: null,
            why2: null,
            why3: null,
            why4: null,
            why5: null,
            rootCause: null,
            solutions: [],
            impact: this.analyzeImpact(bug),
            recommendations: []
        };

        // Perform 5 Whys analysis based on bug type
        switch (bug.category) {
            case BUG_CATEGORIES.SECURITY:
                analysis.why1 = "Security vulnerability detected";
                analysis.why2 = "Input validation failed";
                analysis.why3 = "Sanitization not implemented";
                analysis.why4 = "Security best practices not followed";
                analysis.why5 = "Lack of security training or code review";
                analysis.rootCause = "Insufficient security practices in development";
                break;

            case BUG_CATEGORIES.PERFORMANCE:
                analysis.why1 = "Performance degradation detected";
                analysis.why2 = "Inefficient algorithm or query";
                analysis.why3 = "No performance testing conducted";
                analysis.why4 = "Performance requirements not defined";
                analysis.why5 = "Performance not considered in design";
                analysis.rootCause = "Performance considerations not integrated into development process";
                break;

            case BUG_CATEGORIES.FUNCTIONAL:
                analysis.why1 = "Functionality not working as expected";
                analysis.why2 = "Logic error in implementation";
                analysis.why3 = "Requirements not properly understood";
                analysis.why4 = "Testing did not cover this scenario";
                analysis.why5 = "Insufficient requirements analysis";
                analysis.rootCause = "Gap between requirements and implementation";
                break;

            default:
                analysis.why1 = "Bug detected in system";
                analysis.why2 = "Error in code implementation";
                analysis.why3 = "Testing did not catch the issue";
                analysis.why4 = "Development process has gaps";
                analysis.why5 = "Quality assurance process needs improvement";
                analysis.rootCause = "Insufficient quality assurance processes";
        }

        // Generate solutions based on root cause
        analysis.solutions = this.generateSolutions(analysis.rootCause, bug.category);
        analysis.recommendations = this.generateRecommendations(analysis.rootCause);

        // Update bug with analysis
        bug.rootCauseAnalysis = analysis;
        bug.state = BUG_STATES.ANALYZING;

        this.saveBugs();
        return analysis;
    }

    analyzeImpact(bug) {
        const impact = {
            userImpact: {
                severity: bug.severity,
                description: this.getUserImpactDescription(bug),
                affectedUsers: this.estimateAffectedUsers(bug),
                duration: this.estimateDuration(bug)
            },
            businessImpact: {
                revenue: this.estimateRevenueImpact(bug),
                reputation: this.estimateReputationImpact(bug),
                compliance: this.estimateComplianceImpact(bug)
            },
            technicalImpact: {
                systemStability: this.estimateSystemImpact(bug),
                performance: this.estimatePerformanceImpact(bug),
                security: this.estimateSecurityImpact(bug)
            }
        };

        return impact;
    }

    getUserImpactDescription(bug) {
        switch (bug.category) {
            case BUG_CATEGORIES.SECURITY:
                return "Users may be vulnerable to security attacks";
            case BUG_CATEGORIES.PERFORMANCE:
                return "Users experience slow response times";
            case BUG_CATEGORIES.FUNCTIONAL:
                return "Users cannot complete expected tasks";
            case BUG_CATEGORIES.ACCESSIBILITY:
                return "Users with disabilities cannot access features";
            default:
                return "Users experience unexpected behavior";
        }
    }

    estimateAffectedUsers(bug) {
        // This would be based on actual usage data
        const severityMultiplier = {
            [SEVERITY_LEVELS.CRITICAL]: 1.0,
            [SEVERITY_LEVELS.HIGH]: 0.7,
            [SEVERITY_LEVELS.MEDIUM]: 0.4,
            [SEVERITY_LEVELS.LOW]: 0.1
        };

        return `~${Math.round(1000 * severityMultiplier[bug.severity])} users`;
    }

    estimateDuration(bug) {
        const severityDuration = {
            [SEVERITY_LEVELS.CRITICAL]: "Immediate",
            [SEVERITY_LEVELS.HIGH]: "Within 24 hours",
            [SEVERITY_LEVELS.MEDIUM]: "Within 1 week",
            [SEVERITY_LEVELS.LOW]: "Within 1 month"
        };

        return severityDuration[bug.severity];
    }

    estimateRevenueImpact(bug) {
        const severityImpact = {
            [SEVERITY_LEVELS.CRITICAL]: "High - Potential revenue loss",
            [SEVERITY_LEVELS.HIGH]: "Medium - Some revenue impact",
            [SEVERITY_LEVELS.MEDIUM]: "Low - Minimal revenue impact",
            [SEVERITY_LEVELS.LOW]: "Negligible - No revenue impact"
        };

        return severityImpact[bug.severity];
    }

    estimateReputationImpact(bug) {
        if (bug.category === BUG_CATEGORIES.SECURITY) {
            return "High - Security issues affect trust";
        }
        return "Medium - Affects user experience";
    }

    estimateComplianceImpact(bug) {
        if (bug.category === BUG_CATEGORIES.SECURITY) {
            return "High - May violate security regulations";
        }
        if (bug.category === BUG_CATEGORIES.ACCESSIBILITY) {
            return "Medium - May violate accessibility standards";
        }
        return "Low - No compliance issues";
    }

    estimateSystemImpact(bug) {
        if (bug.category === BUG_CATEGORIES.PERFORMANCE) {
            return "High - System performance degraded";
        }
        return "Medium - System stability affected";
    }

    estimatePerformanceImpact(bug) {
        if (bug.category === BUG_CATEGORIES.PERFORMANCE) {
            return "High - Significant performance degradation";
        }
        return "Low - Minimal performance impact";
    }

    estimateSecurityImpact(bug) {
        if (bug.category === BUG_CATEGORIES.SECURITY) {
            return "High - Security vulnerability present";
        }
        return "Low - No security implications";
    }

    generateSolutions(rootCause, category) {
        const solutions = [];

        switch (rootCause) {
            case "Insufficient security practices in development":
                solutions.push(
                    "Implement comprehensive input validation",
                    "Add security scanning to CI/CD pipeline",
                    "Conduct security training for developers",
                    "Implement code review checklist for security"
                );
                break;

            case "Performance considerations not integrated into development process":
                solutions.push(
                    "Add performance testing to development workflow",
                    "Implement performance monitoring",
                    "Optimize database queries",
                    "Add caching strategies"
                );
                break;

            case "Gap between requirements and implementation":
                solutions.push(
                    "Improve requirements gathering process",
                    "Add acceptance criteria to user stories",
                    "Implement behavior-driven development",
                    "Enhance testing coverage"
                );
                break;

            default:
                solutions.push(
                    "Improve quality assurance processes",
                    "Add automated testing",
                    "Implement code review practices",
                    "Enhance monitoring and alerting"
                );
        }

        return solutions;
    }

    generateRecommendations(rootCause) {
        const recommendations = [];

        recommendations.push(
            "Implement automated testing for this type of bug",
            "Add monitoring to detect similar issues early",
            "Update development guidelines to prevent recurrence",
            "Conduct team training on best practices"
        );

        return recommendations;
    }

    // Fix implementation
    implementFix(bugId, fixData) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const fix = {
            id: this.generateFixId(),
            description: fixData.description,
            implementation: fixData.implementation,
            filesChanged: fixData.filesChanged || [],
            testsAdded: fixData.testsAdded || [],
            riskAssessment: fixData.riskAssessment,
            rollbackPlan: fixData.rollbackPlan,
            implementedBy: fixData.implementedBy,
            implementedAt: new Date().toISOString(),
            status: 'implemented'
        };

        bug.fix = fix;
        bug.state = BUG_STATES.FIXING;
        bug.assignedTo = fixData.implementedBy;

        this.addToHistory(bug, 'fix_implemented', { fix });
        this.saveBugs();
        this.saveHistory();

        return fix;
    }

    generateFixId() {
        return `FIX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Testing and validation
    validateFix(bugId, validationData) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const validation = {
            id: this.generateValidationId(),
            testsRun: validationData.testsRun || [],
            results: validationData.results,
            performanceImpact: validationData.performanceImpact,
            securityImpact: validationData.securityImpact,
            regressionTests: validationData.regressionTests || [],
            validatedBy: validationData.validatedBy,
            validatedAt: new Date().toISOString(),
            status: validationData.passed ? 'passed' : 'failed'
        };

        bug.validation = validation;
        bug.state = validationData.passed ? BUG_STATES.TESTING : BUG_STATES.FIXING;

        this.addToHistory(bug, 'fix_validated', { validation });
        this.saveBugs();
        this.saveHistory();

        return validation;
    }

    generateValidationId() {
        return `VALIDATION-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Deployment
    deployFix(bugId, deploymentData) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const deployment = {
            id: this.generateDeploymentId(),
            environment: deploymentData.environment,
            deploymentStrategy: deploymentData.strategy,
            deployedBy: deploymentData.deployedBy,
            deployedAt: new Date().toISOString(),
            monitoring: deploymentData.monitoring || {},
            status: 'deployed'
        };

        bug.deployment = deployment;
        bug.state = BUG_STATES.DEPLOYING;

        this.addToHistory(bug, 'fix_deployed', { deployment });
        this.saveBugs();
        this.saveHistory();

        return deployment;
    }

    generateDeploymentId() {
        return `DEPLOY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Resolution
    resolveBug(bugId, resolutionData) {
        const bug = this.bugs.find(b => b.id === bugId);
        if (!bug) {
            throw new Error(`Bug ${bugId} not found`);
        }

        const resolution = {
            id: this.generateResolutionId(),
            resolutionType: resolutionData.type, // 'fixed', 'wont_fix', 'duplicate', 'not_reproducible'
            description: resolutionData.description,
            lessonsLearned: resolutionData.lessonsLearned || [],
            preventionMeasures: resolutionData.preventionMeasures || [],
            resolvedBy: resolutionData.resolvedBy,
            resolvedAt: new Date().toISOString()
        };

        bug.resolution = resolution;
        bug.state = BUG_STATES.RESOLVED;
        bug.resolvedAt = new Date().toISOString();

        this.addToHistory(bug, 'bug_resolved', { resolution });
        this.updateMetrics(bug, 'resolved');
        this.saveBugs();
        this.saveHistory();
        this.saveMetrics();

        return resolution;
    }

    generateResolutionId() {
        return `RESOLUTION-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // History tracking
    addToHistory(bug, action, details = {}) {
        const historyEntry = {
            id: this.generateHistoryId(),
            bugId: bug.id,
            action: action,
            details: details,
            timestamp: new Date().toISOString(),
            user: details.user || 'system'
        };

        this.history.push(historyEntry);
        bug.history.push(historyEntry);
    }

    generateHistoryId() {
        return `HISTORY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Metrics tracking
    updateMetrics(bug, action, additionalData = {}) {
        this.metrics.totalBugs = this.bugs.length;

        // Update severity counts
        this.metrics.criticalBugs = this.bugs.filter(b => b.severity === SEVERITY_LEVELS.CRITICAL).length;
        this.metrics.highPriorityBugs = this.bugs.filter(b => b.severity === SEVERITY_LEVELS.HIGH).length;
        this.metrics.mediumPriorityBugs = this.bugs.filter(b => b.severity === SEVERITY_LEVELS.MEDIUM).length;
        this.metrics.lowPriorityBugs = this.bugs.filter(b => b.severity === SEVERITY_LEVELS.LOW).length;

        // Update resolved count
        this.metrics.resolvedBugs = this.bugs.filter(b => b.state === BUG_STATES.RESOLVED).length;

        // Update service breakdown
        this.metrics.serviceBreakdown = {};
        this.bugs.forEach(b => {
            this.metrics.serviceBreakdown[b.service] = (this.metrics.serviceBreakdown[b.service] || 0) + 1;
        });

        // Update category breakdown
        this.metrics.categoryBreakdown = {};
        this.bugs.forEach(b => {
            this.metrics.categoryBreakdown[b.category] = (this.metrics.categoryBreakdown[b.category] || 0) + 1;
        });

        // Update average resolution time
        const resolvedBugs = this.bugs.filter(b => b.resolvedAt);
        if (resolvedBugs.length > 0) {
            const totalTime = resolvedBugs.reduce((sum, b) => {
                const detected = new Date(b.detectedAt);
                const resolved = new Date(b.resolvedAt);
                return sum + (resolved - detected);
            }, 0);
            this.metrics.averageResolutionTime = totalTime / resolvedBugs.length;
        }

        // Update bug trend
        const today = new Date().toISOString().split('T')[0];
        const existingTrend = this.metrics.bugTrend.find(t => t.date === today);
        if (existingTrend) {
            existingTrend.count++;
        } else {
            this.metrics.bugTrend.push({ date: today, count: 1 });
        }

        // Keep only last 30 days of trend data
        this.metrics.bugTrend = this.metrics.bugTrend.slice(-30);
    }

    // Reporting
    generateReport(reportType = 'summary') {
        const report = {
            generatedAt: new Date().toISOString(),
            type: reportType,
            summary: {
                totalBugs: this.metrics.totalBugs,
                criticalBugs: this.metrics.criticalBugs,
                highPriorityBugs: this.metrics.highPriorityBugs,
                resolvedBugs: this.metrics.resolvedBugs,
                resolutionRate: this.metrics.totalBugs > 0 ? 
                    (this.metrics.resolvedBugs / this.metrics.totalBugs * 100).toFixed(2) + '%' : '0%'
            },
            breakdown: {
                byService: this.metrics.serviceBreakdown,
                byCategory: this.metrics.categoryBreakdown,
                bySeverity: {
                    critical: this.metrics.criticalBugs,
                    high: this.metrics.highPriorityBugs,
                    medium: this.metrics.mediumPriorityBugs,
                    low: this.metrics.lowPriorityBugs
                }
            },
            trends: {
                bugTrend: this.metrics.bugTrend,
                averageResolutionTime: this.metrics.averageResolutionTime
            }
        };

        if (reportType === 'detailed') {
            report.bugs = this.bugs.map(b => ({
                id: b.id,
                title: b.title,
                service: b.service,
                severity: b.severity,
                category: b.category,
                state: b.state,
                detectedAt: b.detectedAt,
                resolvedAt: b.resolvedAt,
                priority: b.priority
            }));
        }

        return report;
    }

    saveReport(report, filename = null) {
        if (!filename) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `bug-report-${report.type}-${timestamp}.json`;
        }

        const filepath = path.join(CONFIG.reportsDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
        return filepath;
    }

    // Search and filtering
    searchBugs(criteria) {
        return this.bugs.filter(bug => {
            if (criteria.service && bug.service !== criteria.service) return false;
            if (criteria.severity && bug.severity !== criteria.severity) return false;
            if (criteria.category && bug.category !== criteria.category) return false;
            if (criteria.state && bug.state !== criteria.state) return false;
            if (criteria.assignedTo && bug.assignedTo !== criteria.assignedTo) return false;
            if (criteria.search) {
                const searchTerm = criteria.search.toLowerCase();
                const searchableText = `${bug.title} ${bug.description}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) return false;
            }
            return true;
        });
    }

    getBugsByPriority(limit = 10) {
        return this.bugs
            .filter(b => b.state !== BUG_STATES.RESOLVED && b.state !== BUG_STATES.CLOSED)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, limit);
    }

    getBugsByService(service) {
        return this.bugs.filter(b => b.service === service);
    }

    getBugsByCategory(category) {
        return this.bugs.filter(b => b.category === category);
    }

    // Cleanup
    cleanupOldBugs(daysOld = 365) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const oldBugs = this.bugs.filter(b => {
            const bugDate = new Date(b.detectedAt);
            return bugDate < cutoffDate && b.state === BUG_STATES.RESOLVED;
        });

        oldBugs.forEach(bug => {
            bug.state = BUG_STATES.CLOSED;
            this.addToHistory(bug, 'auto_closed', { reason: 'age' });
        });

        this.saveBugs();
        this.saveHistory();
        return oldBugs.length;
    }

    // Export and import
    exportBugs(format = 'json') {
        switch (format) {
            case 'json':
                return JSON.stringify(this.bugs, null, 2);
            case 'csv':
                return this.convertToCSV(this.bugs);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    convertToCSV(bugs) {
        const headers = ['id', 'title', 'service', 'severity', 'category', 'state', 'detectedAt', 'resolvedAt', 'priority'];
        const csv = [headers.join(',')];

        bugs.forEach(bug => {
            const row = headers.map(header => {
                const value = bug[header] || '';
                return `"${value}"`;
            });
            csv.push(row.join(','));
        });

        return csv.join('\n');
    }

    importBugs(data, format = 'json') {
        let bugs;
        switch (format) {
            case 'json':
                bugs = JSON.parse(data);
                break;
            case 'csv':
                bugs = this.parseCSV(data);
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        bugs.forEach(bugData => {
            if (!this.bugs.find(b => b.id === bugData.id)) {
                this.createBug(bugData);
            }
        });

        return bugs.length;
    }

    parseCSV(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        const bugs = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
            const bug = {};
            headers.forEach((header, index) => {
                bug[header] = values[index];
            });
            bugs.push(bug);
        }

        return bugs;
    }
}

// CLI interface
const main = () => {
    const tracker = new BugTracker();
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'create':
            const bugData = {
                title: args[1],
                description: args[2],
                service: args[3],
                severity: args[4],
                category: args[5]
            };
            const bug = tracker.createBug(bugData);
            console.log('Bug created:', bug.id);
            break;

        case 'list':
            const criteria = {};
            if (args[1]) criteria.service = args[1];
            if (args[2]) criteria.severity = args[2];
            const bugs = tracker.searchBugs(criteria);
            console.table(bugs.map(b => ({
                id: b.id,
                title: b.title,
                service: b.service,
                severity: b.severity,
                state: b.state
            })));
            break;

        case 'report':
            const reportType = args[1] || 'summary';
            const report = tracker.generateReport(reportType);
            const filename = tracker.saveReport(report);
            console.log('Report saved:', filename);
            break;

        case 'analyze':
            const bugId = args[1];
            const analysis = tracker.analyzeRootCause(bugId);
            console.log('Root cause analysis:', analysis);
            break;

        case 'resolve':
            const resolveBugId = args[1];
            const resolutionData = {
                type: args[2] || 'fixed',
                description: args[3] || 'Bug fixed',
                resolvedBy: args[4] || 'system'
            };
            const resolution = tracker.resolveBug(resolveBugId, resolutionData);
            console.log('Bug resolved:', resolution.id);
            break;

        case 'cleanup':
            const daysOld = parseInt(args[1]) || 365;
            const cleanedCount = tracker.cleanupOldBugs(daysOld);
            console.log(`Cleaned up ${cleanedCount} old bugs`);
            break;

        case 'export':
            const format = args[1] || 'json';
            const exportData = tracker.exportBugs(format);
            const exportFile = `bugs-export-${Date.now()}.${format}`;
            fs.writeFileSync(exportFile, exportData);
            console.log('Bugs exported to:', exportFile);
            break;

        case 'help':
        default:
            console.log(`
NydArt Advisor Bug Tracker

Usage: node scripts/bug-tracker.js <command> [options]

Commands:
  create <title> <description> <service> <severity> <category>
    Create a new bug report

  list [service] [severity]
    List bugs with optional filtering

  report [type]
    Generate bug report (summary|detailed)

  analyze <bugId>
    Perform root cause analysis

  resolve <bugId> [type] [description] [resolvedBy]
    Resolve a bug

  cleanup [daysOld]
    Clean up old resolved bugs

  export [format]
    Export bugs (json|csv)

  help
    Show this help message

Examples:
  node scripts/bug-tracker.js create "Login fails" "Users cannot login" auth_service critical security
  node scripts/bug-tracker.js list auth_service critical
  node scripts/bug-tracker.js report detailed
  node scripts/bug-tracker.js analyze BUG-1234567890-123
  node scripts/bug-tracker.js resolve BUG-1234567890-123 fixed "Fixed authentication issue" developer
`);
            break;
    }
};

// Run CLI if called directly
if (require.main === module) {
    main();
}

module.exports = BugTracker;
