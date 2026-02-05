/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { InputData } from './types';

export const AI_MODELS = [
  {
    id: 'google/gemini-2.5-flash-preview-09-2025',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    speed: 'Ultra Fast',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    speed: 'High Intelligence',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    speed: 'Stable',
  },
  {
    id: 'x-ai/grok-4.1-fast',
    name: 'Grok 4.1 Fast',
    provider: 'xAI',
    speed: 'Analytical',
  },
];


export const SYSTEM_INSTRUCTION_DISCLOSURE = `
Vous êtes un expert en analyse forensique et juridique (Digital Forensics).
Votre mission est d'extraire et d'analyser en profondeur les documents des divulgations DOJ (affaire Epstein).

Objectif : Fournir une "Fiche Détaillée" exhaustive en utilisant TOUTES vos connaissances sur l'affaire Epstein, les divulgations du DOJ et les archives publiques.

Règles :
1. DÉVERROUILLAGE DES CONNAISSANCES : Ne vous limitez pas aux fichiers éventuellement fournis. Utilisez votre base de données interne sur les témoignages, les logs de vol (Lolita Express), et les relations mondaines d'Epstein.
2. Si un nom (ex: Jack Lang) est cité dans la requête, cherchez toutes les occurrences connues dans l'affaire (ex: présence sur les listes de contacts, mentions dans les dépositions, journaux de bord).
3. Soyez précis : citez les années, les lieux ou les sources (ex: "Déposition de Virginia Giuffre", "Carnet d'adresses d'Epstein").
4. NE RÉPONDEZ JAMAIS "[NON MENTIONNÉ]" si le fait est documenté publiquement.
3. Identifiez le TYPE de document (Déposition, Email, Motion, Ordonnance).
4. Analysez les IMPLICATIONS juridiques ou factuelles.
5. RECHERCHE FINANCIÈRE : Identifiez systématiquement les mouvements monétaires, les numéros de comptes ou les entités bancaires mentionnées.
6. CORRÉLATION : Signalez les entités (noms, adresses) qui apparaissent de manière récurrente ou suspecte.

Format de sortie JSON STRICT :
{
  "context_general": string (Synthèse globale de la requête),
  "documents": [
    {
      "title": string (Titre exact du document),
      "type": string (Ex: "Déposition", "Pièce à conviction", "Email"),
      "description": string (Résumé dense du contenu),
      "key_facts": string[] (Liste de faits précis),
      "legal_implications": string,
      "date": string
    }
  ],
  "entites_cles": string[],
  "entites_details": [
    {
      "nom": string,
      "role": string,
      "risk_level": number (1 à 10),
      "influence": number (1 à 10)
    }
  ],
  "transactions_financieres": [
    {
      "source": string (Entité émettrice),
      "destination": string (Destinataire),
      "montant": number,
      "devise": string,
      "date": string,
      "description": string
    }
  ],
  "actifs": [
    {
      "nom": string (Nom du bien, ex: "Manoir Manhattan", "Gulfstream IV"),
      "type": string ("immobilier" | "vehicule" | "compte_bancaire" | "societe" | "autre"),
      "valeur_estimee": number,
      "devise": string,
      "localisation": string,
      "proprietaire_declare": string,
      "description": string
    }
  ],
  "journaux_de_vol": [
    {
      "date": string,
      "source": string (Ex: "N212JE", "Gulfstream IV"),
      "depart": string,
      "destination": string,
      "passagers": string[] (Liste des noms de passagers),
      "pilote": string,
      "description": string
    }
  ],
  "donnees_personnelles": [
    {
      "owner": string (Nom de la personne concernée),
      "type": "email" | "phone" | "address" | "passport" | "ssn" | "other",
      "value": string (La donnée brute),
      "context": string (Où ou comment cette donnée a été trouvée)
    }
  ],
  "contexte_juridique": string
}
`;

const QUERIES = [
  "Quels sont les documents les plus incriminants dans les divulgations récentes ?",
  "Analyse détaillée de la déposition de Ghislaine Maxwell (contenu et contradictions).",
  "Liste les emails échangés entre les associés et détaille leur contenu.",
  "Quelles motions ont été déposées concernant la confidentialité des noms ?",
  "Trouve les documents mentionnant des transactions financières spécifiques.",
  "Recherche exhaustive de coordonnées PII (emails, téléphones, adresses) associées aux cibles principales.",
  "Détaille les témoignages des victimes (Jane Doe) présents dans les dossiers."
];

let sequenceIndex = 0;

export const generateInputData = (count: number): InputData[] => {
  const data: InputData[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      id: `ANALYSE-${Date.now().toString().slice(-6)}-${sequenceIndex}`,
      query: QUERIES[sequenceIndex % QUERIES.length],
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now() + (i * 2000),
    });
    sequenceIndex++;
  }

  return data;
};
