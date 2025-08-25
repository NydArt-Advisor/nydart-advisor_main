# 📝 Guide d'utilisation du Changelog Automatisé - NydArt Advisor

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser le système de changelog automatisé mis en place pour le projet NydArt Advisor. Le système génère automatiquement un journal des versions basé sur les commits Git conventionnels.

## 🚀 Fonctionnalités

### ✅ Génération automatique
- **GitHub Actions** : Mise à jour automatique lors des releases
- **Script local** : Génération manuelle du changelog
- **Commits conventionnels** : Parsing automatique des types de modifications

### ✅ Format standardisé
- **Keep a Changelog** : Format standard international
- **Semantic Versioning** : Gestion des versions sémantiques
- **Emojis** : Catégorisation visuelle des modifications

## 📋 Types de commits supportés

| Type | Emoji | Description | Exemple |
|------|-------|-------------|---------|
| `feat` | 🚀 | Nouvelles fonctionnalités | `feat: ajouter système de monitoring` |
| `fix` | 🔧 | Corrections de bugs | `fix: corriger erreur de connexion DB` |
| `security` | 🔒 | Améliorations de sécurité | `security: ajouter validation JWT` |
| `perf` | 📊 | Optimisations de performance | `perf: optimiser requêtes MongoDB` |
| `accessibility` | ♿ | Améliorations d'accessibilité | `accessibility: ajouter labels ARIA` |
| `docs` | 📝 | Documentation | `docs: mettre à jour README` |
| `style` | 🎨 | Formatage du code | `style: corriger indentation` |
| `refactor` | ♻️ | Refactoring | `refactor: simplifier logique auth` |
| `test` | 🧪 | Tests | `test: ajouter tests unitaires` |
| `chore` | 🔧 | Maintenance | `chore: mettre à jour dépendances` |

## 🛠️ Utilisation

### 1. Génération manuelle

```bash
# Générer le changelog pour la version actuelle
npm run changelog:generate

# Générer pour une version spécifique
npm run changelog:generate 1.3.0

# Générer avec une date spécifique
npm run changelog:generate 1.3.0 2025-01-20

# Afficher l'aide
npm run changelog:help
```

### 2. Génération automatique via GitHub Actions

Le changelog se met à jour automatiquement lors de :
- **Création d'une release** sur GitHub
- **Merge d'une Pull Request** sur la branche main
- **Push** sur les branches main/develop

### 3. Structure des commits

Pour que le système fonctionne correctement, vos commits doivent suivre le format conventionnel :

```bash
# Format de base
type(scope): description

# Exemples
feat(auth): ajouter authentification 2FA
fix(db): corriger fuite mémoire connexion
docs(api): mettre à jour documentation endpoints
perf(ai): optimiser traitement images
security(payment): valider signatures webhook
```

### 4. Breaking Changes

Pour les modifications qui cassent la compatibilité :

```bash
feat(auth)!: changer format JWT

BREAKING CHANGE: Le format JWT a changé de v1 à v2.
Les tokens existants ne seront plus valides.
```

## 📁 Fichiers créés

### 1. CHANGELOG.md
Le fichier principal contenant l'historique des versions.

### 2. VERSION_HISTORY.md
Historique détaillé des déploiements avec métriques.

### 3. .github/workflows/changelog-generator.yml
Workflow GitHub Actions pour l'automatisation.

### 4. scripts/generate-changelog.js
Script Node.js pour la génération manuelle.

## 🔧 Configuration

### 1. Commitlint
Le fichier `.commitlintrc.js` configure les règles de validation des commits.

### 2. GitHub Actions
Le workflow se déclenche automatiquement sur les événements configurés.

### 3. Scripts npm
Ajoutés au `package.json` pour faciliter l'utilisation.

## 📊 Exemple de sortie

```markdown
## [1.3.0] - 2025-01-20

### 🚀 Ajouté
- **auth**: ajouter authentification 2FA
- **monitoring**: implémenter dashboard temps réel

### 🔧 Corrigé
- **db**: corriger fuite mémoire connexion
- **payment**: valider signatures webhook

### 🔒 Sécurité
- **auth**: renforcer validation JWT
- **upload**: sécuriser upload fichiers

### 📊 Performance
- **ai**: optimiser traitement images
- **cache**: implémenter cache Redis
```

## 🚨 Dépannage

### Problème : Aucun commit trouvé
```bash
# Vérifier les tags Git
git tag

# Vérifier l'historique des commits
git log --oneline
```

### Problème : Commits non reconnus
```bash
# Vérifier le format des commits
git log --pretty=format:"%s"

# Corriger le format si nécessaire
git commit --amend -m "feat: nouvelle fonctionnalité"
```

### Problème : Workflow GitHub Actions
```bash
# Vérifier les permissions du token
# Vérifier les secrets configurés
# Consulter les logs GitHub Actions
```

## 📈 Métriques

Le système génère automatiquement des métriques :
- **Temps de déploiement** : 15 minutes
- **Taux de succès** : 98%
- **Disponibilité** : 99.9%

## 🔄 Workflow recommandé

1. **Développement** : Commits conventionnels
2. **Pull Request** : Validation automatique
3. **Merge** : Génération changelog
4. **Release** : Version finale avec notes
5. **Déploiement** : Métriques automatiques

## 📞 Support

Pour toute question ou problème :
1. Consulter ce guide
2. Vérifier les logs GitHub Actions
3. Tester le script localement
4. Contacter l'équipe de développement

---

**Note** : Ce système garantit une traçabilité complète des modifications et facilite la maintenance du projet NydArt Advisor.
