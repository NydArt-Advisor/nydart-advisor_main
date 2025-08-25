module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nouvelles fonctionnalités
        'fix',      // Corrections de bugs
        'docs',     // Documentation
        'style',    // Formatage, points-virgules manquants, etc.
        'refactor', // Refactoring du code
        'perf',     // Améliorations de performance
        'test',     // Ajout ou modification de tests
        'chore',    // Tâches de maintenance
        'security', // Améliorations de sécurité
        'accessibility', // Améliorations d'accessibilité
        'ci',       // Modifications des fichiers de CI/CD
        'build',    // Modifications du système de build
        'revert'    // Revert d'un commit précédent
      ]
    ],
    'type-case': [2, 'always', 'lower'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always']
  },
  parserPreset: {
    parserOpts: {
      issuePrefixes: ['#', 'GH-', 'FIXES-']
    }
  }
};
