# DOJ PDF Explorer - Documentation

## Vue d'ensemble

Le composant **DOJ PDF Explorer** permet d'explorer et de visualiser les fichiers PDF des 12 Data Sets des divulgations DOJ Epstein disponibles sur justice.gov.

## Fonctionnalités

### 1. Vérification d'Âge
- **Modal de vérification automatique** lors du premier accès
- Conformité avec les directives DOJ pour le contenu sensible
- Accès requis : 18 ans ou plus

### 2. Navigation des Data Sets
- **12 Data Sets disponibles** (DS1 à DS12)
- Vue en grille responsive (3 colonnes sur desktop, adaptatif sur mobile)
- Recherche en temps réel par nom ou description

### 3. Accès aux Documents
- Bouton **"Voir les Fichiers"** - Ouvre la page de listing DOJ dans un nouvel onglet
- Bouton **"Ouvrir dans un nouvel onglet"** - Accès direct alternatif
- Liens directs vers justice.gov pour chaque Data Set

## Structure des Data Sets

| ID | Nom | Description | URL |
|---|---|---|---|
| DS1 | Data Set 1 | Premiers documents divulgués | `/data-set-1-files` |
| DS2 | Data Set 2 | Deuxième série de documents | `/data-set-2-files` |
| DS3 | Data Set 3 | Troisième série de documents | `/data-set-3-files` |
| DS4 | Data Set 4 | Quatrième série de documents | `/data-set-4-files` |
| DS5 | Data Set 5 | Cinquième série de documents | `/data-set-5-files` |
| DS6 | Data Set 6 | Sixième série de documents | `/data-set-6-files` |
| DS7 | Data Set 7 | Septième série de documents | `/data-set-7-files` |
| DS8 | Data Set 8 | Huitième série de documents | `/data-set-8-files` |
| DS9 | Data Set 9 | Neuvième série de documents | `/data-set-9-files` |
| DS10 | Data Set 10 | Dixième série de documents | `/data-set-10-files` |
| DS11 | Data Set 11 | Onzième série de documents | `/data-set-11-files` |
| DS12 | Data Set 12 | Douzième série de documents | `/data-set-12-files` |

## Utilisation

### Accès au composant
1. Cliquez sur **"DOJ Explorer"** dans le menu de navigation latéral
2. Acceptez la vérification d'âge si demandée
3. Naviguez dans les Data Sets disponibles

### Recherche
- Utilisez la barre de recherche en haut pour filtrer les Data Sets
- La recherche fonctionne sur le nom et la description

### Consultation des PDFs
- Cliquez sur **"Voir les Fichiers"** pour accéder à la liste complète des PDFs
- Les documents s'ouvrent dans justice.gov (source officielle)
- Tous les PDFs restent sur le site officiel du Département de la Justice

## Intégration

Le composant est intégré dans l'application principale :

```typescript
// components/DOJPdfExplorer.tsx
export const DOJPdfExplorer: React.FC = () => {
  // Gestion de la vérification d'âge
  const [ageVerified, setAgeVerified] = useState(false);
  
  // Affichage des Data Sets
  // Navigation et recherche
}
```

### Routes
- **ViewType** : `'dojexplorer'`
- **Icône Sidebar** : `FolderOpen`
- **Couleur** : Rouge (`text-[#B91C1C]`)

## Design

### Palette de couleurs
- **Fond principal** : `#F8FAFC` (Slate 50)
- **Accent primaire** : `#B91C1C` (Rouge DOJ)
- **Texte** : `#0F172A` (Slate 900)
- **Bordures** : `#E2E8F0` (Slate 200)

### Composants visuels
- **Cards** : Fond blanc avec ombres subtiles
- **Boutons primaires** : Rouge avec effet hover
- **Boutons secondaires** : Gris avec effet hover
- **Status badges** : Point vert pulsant pour "Accessible"

## Sécurité et Conformité

- ✅ Vérification d'âge obligatoire (18+)
- ✅ Liens directs vers justice.gov (source officielle)
- ✅ Aucune copie locale des PDFs
- ✅ Respect des directives DOJ
- ✅ Connexion sécurisée (HTTPS)

## État du composant

### Gestion d'état local
```typescript
const [selectedDataSet, setSelectedDataSet] = useState<DataSet | null>(null);
const [isLoading, setIsLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [viewingPdf, setViewingPdf] = useState<PDFFile | null>(null);
const [expandedDataSets, setExpandedDataSets] = useState<Set<string>>(new Set());
const [ageVerified, setAgeVerified] = useState(false);
```

## Évolutions futures possibles

1. **Cache des métadonnées** : Stockage local des informations sur les PDFs
2. **Aperçu PDF** : Intégration d'un visualiseur PDF dans le modal
3. **Annotations** : Possibilité d'annoter les documents
4. **Favoris** : Marquer des documents importants
5. **Téléchargement groupé** : Télécharger plusieurs PDFs à la fois
6. **Analyse IA** : Intégration avec le système d'analyse existant
7. **Historique de consultation** : Tracker les documents consultés

---

**Note** : Ce composant respecte strictement les directives du Département de la Justice américain concernant l'accès aux documents sensibles relatifs aux affaires judiciaires.
