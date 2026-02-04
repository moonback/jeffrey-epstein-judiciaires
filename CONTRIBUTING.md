# 🤝 Contribuer au projet DOJ Forensic

Merci de l'intérêt que vous portez à **DOJ Forensic** ! Vos contributions aident à rendre les outils d'investigation plus accessibles et transparents.

---

## 📜 Code de Conduite

En participant à ce projet, vous vous engagez à agir de manière éthique, professionnelle et respectueuse. L'objectif est la recherche de la vérité basée sur des données publiques et vérifiables.

---

## 🚀 Comment contribuer ?

### 1. Signaler des bugs
- Vérifiez d'abord si le bug a déjà été signalé dans les **Issues**.
- Si non, ouvrez une nouvelle issue en fournissant :
  - Le comportement attendu vs constaté.
  - La console log (si applicable).
  - Les étapes pour reproduire.

### 2. Proposer des fonctionnalités
- Marquez vos suggestions avec le tag `enhancement`.
- Expliquez l'utilité forensique de la fonctionnalité proposée.

### 3. Pull Requests (PR)
1. **Forkez** le dépôt.
2. Créez votre branche : `git checkout -b feature/nom-de-la-feature`.
3. Configurez votre environnement (`npm install`, `.env`).
4. **Commitez** vos changements avec des messages explicites.
5. **Testez** via `npm run dev`.
6. Soumettez votre PR vers la branche `main`.

---

## 🛠️ Standards de Développement

- **TypeScript** : Typage strict obligatoire (pas de `any`). Réutiliser les interfaces de `types.ts`.
- **UI/UX** : Respectez l'esthétique "Premium Dark Mode". Utilisez les utilitaires Tailwind définis.
- **Logique** : La logique d'API et de stockage doit rester dans `services/`. Les composants traitent uniquement l'affichage.
- **Commits** : Préférez les commits conventionnels (ex: `feat: add ocr support`, `fix: graph rendering bug`).

---

## ⚖️ Considérations Éthiques

Cet outil traite des documents sensibles et publics. Les contributeurs doivent s'assurer de ne pas introduire de biais ou d'outils permettant la manipulation malveillante des données extraites.

---

*Des questions ? Ouvrez une discussion ou contactez les mainteneurs. Bonne investigation !* 🕵️‍♀️
