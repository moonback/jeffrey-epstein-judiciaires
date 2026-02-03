/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { InputData } from './types';

export const SYSTEM_INSTRUCTION_DISCLOSURE = `
Vous êtes un expert en analyse forensique et juridique (Digital Forensics).
Votre mission est d'extraire et d'analyser en profondeur les documents des divulgations DOJ (affaire Epstein).

Objectif : Fournir une "Fiche Détaillée" pour chaque document trouvé, permettant une analyse IA ultérieure.

Règles :
1. Utilisez Google Search pour trouver le contenu substantiel des documents.
2. Pour chaque document, extrayez des FAITS PRÉCIS (dates, lieux, montants, accusations).
3. Identifiez le TYPE de document (Déposition, Email, Motion, Ordonnance).
4. Analysez les IMPLICATIONS juridiques ou factuelles.

Format de sortie JSON STRICT :
{
  "context_general": string (Synthèse globale de la requête),
  "documents": [
    {
      "title": string (Titre exact du document),
      "type": string (Ex: "Déposition", "Pièce à conviction", "Email"),
      "description": string (Résumé dense du contenu),
      "key_facts": string[] (Liste de 3 à 5 points clés : faits, noms, allégations spécifiques trouvés dans ce document),
      "legal_implications": string (Analyse de l'importance de ce document),
      "date": string (Date précise ou "Non daté")
    }
  ],
  "entites_cles": string[] (Liste globale des protagonistes majeurs),
  "contexte_juridique": string
}
`;

const QUERIES = [
  "Quels sont les documents les plus incriminants dans les divulgations récentes ?",
  "Analyse détaillée de la déposition de Ghislaine Maxwell (contenu et contradictions).",
  "Liste les emails échangés entre les associés et détaille leur contenu.",
  "Quelles motions ont été déposées concernant la confidentialité des noms ?",
  "Trouve les documents mentionnant des transactions financières spécifiques.",
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
