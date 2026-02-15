# Guide de Modernisation Responsive & Mobile-First

Ce document détaille les modifications effectuées et les bonnes pratiques implémentées pour rendre l'application 100% responsive.

## 1. Modifications Effectuées

### A. Navigation & Layout (`Sidebar.tsx`, `App.tsx`)
- **Mobile (< 1024px)** :
  - Transformation de la Sidebar en **Drawer (Off-canvas)**.
  - Ajout d'un bouton **Menu (Hamburger)** dans le header mobile.
  - La Sidebar est fixée (`fixed`) avec un `z-index` élevé (50).
  - Ajout d'un **Overlay** semi-transparent (`backdrop-blur`) pour fermer le menu au clic extérieur.
  - Animation fluide de glissement (`translate-x`).
  - Fermeture automatique du menu lors de la navigation.
- **Desktop (>= 1024px)** :
  - Conservation du mode `sticky`.
  - Gestion de l'état "réduit" (Compact Mode) via `w-64` -> `w-16`.
  - Suppression des styles globaux qui nuisaient à la lisibilité (`font-size: 80%`).

### B. Accessibilité & Typographie (`index.css`)
- **Suppression du scaling global** : Retrait de `html { font-size: 80%; }`. Le texte utilise désormais la taille par défaut du navigateur (généralement 16px), ce qui est crucial pour :
  - La lisibilité sur mobile.
  - Le respect des préférences utilisateur.
  - L'accessibilité (WCAG).
- **Utilisation des classes Tailwind** : La gestion de la taille se fait via `text-sm`, `text-xs`, etc., permettant une adaptation contextuelle plutôt que globale.

## 2. Recommandations Structurelles

### Layout
1.  **Flex vs Grid** :
    - Utilisez `flex-col` sur mobile pour empiler les éléments naturellement.
    - Basculez sur `grid` ou `flex-row` uniquement à partir du breakpoint `lg` (1024px).
    - Exemple : `flex flex-col lg:grid lg:grid-cols-12`.

2.  **Gestion des Panneaux Secondaires (Queue, Logs)** :
    - Sur mobile, les colonnes secondaires (ex: "Neural Queue") sont masquées (`hidden`) pour privilégier le contenu principal.
    - **Evolution suggérée** : Transformer ces panneaux en onglets ou en modales accessibles via des boutons d'action flottants (FAB) sur mobile.

3.  **Scroll Containers** :
    - Assurez-vous que chaque zone de contenu (`flex-1`) possède `overflow-y-auto` et `min-h-0` pour éviter que la page entière ne scrolle (ce qui cache la barre d'URL sur mobile).
    - C'est déjà implémenté dans `App.tsx` (`flex-1 flex flex-col min-w-0 h-screen overflow-hidden`).

### Composants
1.  **Cartes & Listes** :
    - Sur mobile : Utilisez toute la largeur disponible (`w-full`).
    - Évitez les largeurs fixes (`w-[400px]`), préférez `max-w-md` ou `w-full`.
2.  **Tableaux** :
    - Transformez les rangées de tableaux en **Cartes** (Card View) sur mobile pour éviter le scroll horizontal.
    - Ou utilisez `overflow-x-auto` sur le conteneur du tableau.
3.  **Zones Tactiles** :
    - Tous les éléments interactifs (boutons, liens) doivent avoir une taille minimale de **44x44px** (ou un padding suffisant).
    - Exemple Tailwind : `min-h-[44px]`, `p-3`.

## 3. Checklist de Validation Responsive

### Smartphone (Portrait - 320px à 480px)
- [x] Le menu hamburger ouvre-t-il la sidebar ?
- [x] La sidebar se ferme-t-elle au clic sur un lien ou sur l'overlay ?
- [x] Le texte est-il lisible sans zoomer (16px base) ?
- [x] Aucun défilement horizontal involontaire ?
- [x] Les boutons sont-ils facilement cliquables au pouce ?

### Tablette (Portrait/Landscape - 640px à 1024px)
- [x] La disposition s'adapte-t-elle sans casser le layout ?
- [x] L'espace est-il optimisé (pas de marges géantes) ?

### Desktop (1024px+)
- [x] La sidebar est-elle visible et sticky ?
- [x] La grille principale (Lab View) s'affiche-t-elle correctement (Queue + Main) ?
- [x] La navigation est-elle fluide ?

## 4. Exemple de Classe Tailwind Responsive

Voici un pattern commun pour une carte responsive :

```tsx
<div className="
  flex flex-col               // Mobile : Stack vertical
  md:flex-row                 // Tablette+ : Alignement horizontal
  items-start md:items-center // Alignement adapté
  gap-4 p-4
  w-full
  bg-white rounded-xl shadow-sm
">
  <div className="w-12 h-12 bg-red-100 rounded-full shrink-0" />
  
  <div className="flex-1 min-w-0"> // min-w-0 pour text-truncate
    <h3 className="text-lg font-bold truncate">Titre</h3>
    <p className="text-sm text-gray-500">Description...</p>
  </div>
  
  <button className="
    w-full md:w-auto          // Mobile : Bouton pleine largeur
    px-4 py-2                 // Touch target confortable
    bg-blue-600 text-white rounded-lg
  ">
    Action
  </button>
</div>
```
