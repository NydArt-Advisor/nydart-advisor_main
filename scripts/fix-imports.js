#!/usr/bin/env node

/**
 * Script to fix import path issues
 * Changes @/components/ui/ to @/components/UI/
 */

const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '../front/src');

function fixImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix import paths
        content = content.replace(/@\/components\/ui\//g, '@/components/UI/');
        
        // Only write if content changed
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed imports in: ${filePath}`);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    let fixedCount = 0;
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            fixedCount += processDirectory(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            if (fixImportsInFile(filePath)) {
                fixedCount++;
            }
        }
    }
    
    return fixedCount;
}

function main() {
    console.log('🔧 Fixing import paths...\n');
    
    const fixedCount = processDirectory(frontendDir);
    
    console.log(`\n✅ Fixed ${fixedCount} files`);
    console.log('🎉 All import paths should now be correct!');
}

if (require.main === module) {
    main();
}

module.exports = { fixImportsInFile, processDirectory };
