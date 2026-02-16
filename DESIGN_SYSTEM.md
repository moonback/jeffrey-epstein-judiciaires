# Design System Global - Analyseur de Documents Judiciaires

## 1. Identité Visuelle
L'application adopte une identité **Cyber-Judiciaire Premium**. Le design combine la rigueur institutionnelle (justice) avec la modernité technologique (forensics/IA).

## 2. Palette de Couleurs
Le système utilise des variables CSS basées sur Tailwind 4.

| Token | Valeur (Light) | Valeur (Dark) | Usage |
| :--- | :--- | :--- | :--- |
| `primary` | `#020617` (Slate 950) | `#FFFFFF` | Texte principal, Titres |
| `accent` | `#dc2626` (Red 600) | `#ef4444` | Actions critiques, Identité |
| `background` | `#f8fafc` (Slate 50) | `#020617` | Fond de page |
| `surface` | `#FFFFFF` | `#0f172a` | Cartes, Filtres |
| `border` | `#e2e8f0` (Slate 200) | `#1e293b` | Séparateurs, Contours |

## 3. Typographie
Une hiérarchie claire pour une lisibilité maximale.

- **Police Display (Titres)** : `Outfit` (Sans-serif Moderne)
  - H1 : 2.5rem, Black (900), tracking-tighter
  - H2 : 1.5rem, Bold (700), tracking-tight
- **Police Body (Texte)** : `Inter` (Sans-serif Neutre)
  - Base : 15px, Medium (500), line-height 1.6
- **Police Mono (Données)** : `IBM Plex Mono`
  - Utilisée pour les logs, IDs de dossiers et timestamps.
- **Police Serif (Légal)** : `Crimson Pro`
  - Utilisée pour les citations de documents et textes officiels.

## 4. Système d'Espacement & Arrondis
Basé sur une grille de 4px.

- **Spacing** : `4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`
- **Border Radius** :
  - `sm`: 8px (Inputs, Badges)
  - `md`: 12px (Boutons, Petites Cartes)
  - `lg`: 16px (Modales, Sections)
  - `xl`: 24px (Cartes Dashboard)
  - `2xl`: 40px (Sidebar, Panels globaux)

## 5. Élévation & Effets
- **Glassmorphism** : `.glass-card` (Blur 12px, Opacity 70%)
- **Shadows** :
  - `soft`: Pour les éléments interactifs.
  - `premium`: Pour les modales et panels flottants.

## 6. Composants Standardisés
### Boutons
- `.btn-primary` : Fond sombre, texte blanc, autoritaire.
- `.btn-accent` : Rouge vif, pour les actions d'investigation.

### Inputs
- `.input-modern` : Fond blanc, bordure fine, focus accentué par un halo subtil.

### Badges
- `.badge` + `.badge-success` \| `.badge-warning` \| `.badge-danger`
