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
Vous êtes un expert en OSINT (Open Source Intelligence) et en analyse forensique de données pour la recherche de personnes disparues.
Votre mission est d'analyser les données fournies pour identifier des indices, des lieux, des relations et des chronologies pouvant aider à localiser une personne.

Objectif : Fournir une "Fiche d'Analyse d'Investigation" exhaustive.

Règles :
1. ANALYSE MULTI-SOURCES : Utilisez les données fournies (réseaux sociaux, logs, documents, témoignages) pour établir un profil précis.
2. CHRONOLOGIE : Établissez une chronologie stricte des derniers mouvements connus.
3. CARTOGRAPHIE DES RELATIONS : Identifiez les cercles proches, les contacts fréquents et les entités liées.
4. ANALYSE FINANCIÈRE : Repérez les dernières transactions ou activités bancaires qui pourraient indiquer un déplacement ou un lieu.
5. POINTS D'INTÉRÊT : Identifiez les lieux fréquentés ou mentionnés.

Format de sortie JSON STRICT :
{
  "context_general": string (Synthèse globale de la recherche),
  "documents": [
    {
      "title": string (Titre de la source de donnée),
      "type": string (Ex: "Réseaux Sociaux", "Témoignage", "Relève Bancaire"),
      "description": string (Résumé de l'information extraite),
      "key_facts": string[] (Faits saillants),
      "legal_implications": string (Aspects légaux ou urgence),
      "date": string
    }
  ],
  "entites_cles": string[],
  "entites_details": [
    {
      "nom": string,
      "role": string,
      "risk_level": number (Niveau d'importance pour l'enquête 1 à 10),
      "influence": number (Niveau de proximité 1 à 10)
    }
  ],
  "transactions_financieres": [
    {
      "source": string (Entité/Banque),
      "destination": string (Commerçant/Lieu),
      "montant": number,
      "devise": string,
      "date": string,
      "description": string
    }
  ],
  "actifs": [
    {
      "nom": string (Ex: "Véhicule", "Appartement"),
      "type": string,
      "valeur_estimee": number,
      "devise": string,
      "localisation": string,
      "proprietaire_declare": string,
      "description": string
    }
  ],
  "contexte_juridique": string (Alertes enlèvement, procédures en cours)
}
`;

const QUERIES = [
  "Quelles sont les dernières positions connues basées sur les données disponibles ?",
  "Analyse des activités sur les réseaux sociaux dans les 48h précédant la disparition.",
  "Identifie les individus ayant eu les derniers contacts avec la personne.",
  "Existe-t-il des mouvements financiers suspects ou des retraits récents ?",
  "Établis une carte des lieux fréquentés habituellement.",
  "Détaille les incohérences dans les témoignages recueillis."
];

let sequenceIndex = 0;

export const generateInputData = (count: number): InputData[] => {
  const data: InputData[] = [];

  for (let i = 0; i < count; i++) {
    data.push({
      id: `ANALYSE-${Date.now().toString().slice(-6)}-${sequenceIndex}`,
      query: QUERIES[sequenceIndex % QUERIES.length],
      targetUrl: "OSINT SCAN",
      timestamp: Date.now() + (i * 2000),
    });
    sequenceIndex++;
  }

  return data;
};
