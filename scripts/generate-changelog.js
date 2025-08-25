#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CHANGELOG_FILE = 'CHANGELOG.md';
const COMMIT_TYPES = {
  'feat': '🚀 Ajouté',
  'fix': '🔧 Corrigé',
  'security': '🔒 Sécurité',
  'perf': '📊 Performance',
  'accessibility': '♿ Accessibilité',
  'docs': '📝 Documentation',
  'style': '🎨 Style',
  'refactor': '♻️ Refactor',
  'test': '🧪 Tests',
  'chore': '🔧 Maintenance'
};

// Fonction pour obtenir les commits depuis la dernière version
function getCommitsSinceLastTag() {
  try {
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short`, { encoding: 'utf8' });
    return commits.split('\n').filter(commit => commit.trim());
  } catch (error) {
    // Si pas de tag, prendre tous les commits
    const commits = execSync('git log --pretty=format:"%H|%s|%an|%ad" --date=short', { encoding: 'utf8' });
    return commits.split('\n').filter(commit => commit.trim());
  }
}

// Fonction pour parser un commit
function parseCommit(commitLine) {
  const [hash, message, author, date] = commitLine.split('|');
  
  // Parser le message de commit conventionnel
  const conventionalCommitRegex = /^(\w+)(?:\(([\w\-]+)\))?:\s*(.+)$/;
  const match = message.match(conventionalCommitRegex);
  
  if (match) {
    const [, type, scope, description] = match;
    return {
      hash,
      type,
      scope,
      description,
      author,
      date,
      breaking: message.includes('BREAKING CHANGE:')
    };
  }
  
  return {
    hash,
    type: 'chore',
    scope: null,
    description: message,
    author,
    date,
    breaking: false
  };
}

// Fonction pour grouper les commits par type
function groupCommitsByType(commits) {
  const groups = {};
  
  commits.forEach(commit => {
    const type = commit.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(commit);
  });
  
  return groups;
}

// Fonction pour générer le contenu du changelog
function generateChangelogContent(version, date, commitGroups) {
  let content = `## [${version}] - ${date}\n\n`;
  
  // Ajouter les breaking changes en premier
  const breakingChanges = [];
  Object.values(commitGroups).flat().forEach(commit => {
    if (commit.breaking) {
      breakingChanges.push(commit);
    }
  });
  
  if (breakingChanges.length > 0) {
    content += '### ⚠️ Breaking Changes\n';
    breakingChanges.forEach(commit => {
      content += `- **${commit.scope || 'global'}**: ${commit.description}\n`;
    });
    content += '\n';
  }
  
  // Ajouter les commits par type
  Object.entries(commitGroups).forEach(([type, commits]) => {
    if (commits.length > 0) {
      const typeLabel = COMMIT_TYPES[type] || `🔧 ${type}`;
      content += `### ${typeLabel}\n`;
      
      commits.forEach(commit => {
        const scope = commit.scope ? `**${commit.scope}**: ` : '';
        content += `- ${scope}${commit.description}\n`;
      });
      
      content += '\n';
    }
  });
  
  return content;
}

// Fonction pour mettre à jour le fichier CHANGELOG.md
function updateChangelogFile(newContent) {
  let existingContent = '';
  
  if (fs.existsSync(CHANGELOG_FILE)) {
    existingContent = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  } else {
    existingContent = `# Changelog - NydArt Advisor

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

`;
  }
  
  // Insérer le nouveau contenu après l'en-tête
  const lines = existingContent.split('\n');
  const headerEndIndex = lines.findIndex(line => line.startsWith('## ['));
  
  if (headerEndIndex === -1) {
    // Pas de versions existantes, ajouter à la fin
    const newContent = existingContent + newContent;
    fs.writeFileSync(CHANGELOG_FILE, newContent);
  } else {
    // Insérer après l'en-tête
    const beforeVersions = lines.slice(0, headerEndIndex).join('\n');
    const afterVersions = lines.slice(headerEndIndex).join('\n');
    const newContent = beforeVersions + '\n\n' + newContent + afterVersions;
    fs.writeFileSync(CHANGELOG_FILE, newContent);
  }
}

// Fonction principale
function main() {
  const args = process.argv.slice(2);
  const version = args[0] || '1.2.1';
  const date = args[1] || new Date().toISOString().split('T')[0];
  
  console.log(`🚀 Génération du changelog pour la version ${version}...`);
  
  try {
    // Obtenir les commits
    const commitLines = getCommitsSinceLastTag();
    const commits = commitLines.map(parseCommit);
    
    if (commits.length === 0) {
      console.log('❌ Aucun commit trouvé pour générer le changelog');
      return;
    }
    
    // Grouper par type
    const commitGroups = groupCommitsByType(commits);
    
    // Générer le contenu
    const changelogContent = generateChangelogContent(version, date, commitGroups);
    
    // Mettre à jour le fichier
    updateChangelogFile(changelogContent);
    
    console.log('✅ Changelog généré avec succès !');
    console.log(`📊 ${commits.length} commits traités`);
    console.log(`📝 Fichier mis à jour : ${CHANGELOG_FILE}`);
    
    // Afficher un résumé
    console.log('\n📋 Résumé des modifications :');
    Object.entries(commitGroups).forEach(([type, commits]) => {
      const typeLabel = COMMIT_TYPES[type] || type;
      console.log(`  ${typeLabel}: ${commits.length} commits`);
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du changelog:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = {
  getCommitsSinceLastTag,
  parseCommit,
  groupCommitsByType,
  generateChangelogContent,
  updateChangelogFile
};
