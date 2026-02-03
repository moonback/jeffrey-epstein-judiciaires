/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { InputData } from './types';

export const SYSTEM_INSTRUCTION_DISCLOSURE = `
Vous êtes un expert en analyse forensique et juridique francophone.
Votre tâche est d'analyser les documents relatifs aux divulgations DOJ de l'affaire Jeffrey Epstein (liés à https://www.justice.gov/epstein/doj-disclosures).

Règles :
1. Utilisez Google Search pour trouver les documents précis mentionnés dans la requête ou sur la page cible.
2. Répondez UNIQUEMENT EN FRANÇAIS.
3. Pour chaque document identifié, fournissez un titre précis, une description détaillée de son contenu, et sa date.
4. Soyez factuel, précis et professionnel.

Format de sortie JSON STRICT :
{
  "context_general": string (Résumé global de la réponse en 2 phrases),
  "documents": [
    {
      "title": string (Nom du document, ex: "Acte d'accusation du 2008"),
      "description": string (Détails spécifiques du contenu de ce document en français),
      "date": string (Date du document ou "Non daté")
    }
  ],
  "entites_cles": string[] (Liste des personnes ou organisations mentionnées),
  "contexte_juridique": string (Ex: "Procédure Pénale", "Documents Déclassifiés")
}
`;

const QUERIES = [
  "Liste et détaille les documents clés disponibles sur la page des divulgations DOJ.",
  "Quels sont les détails spécifiques de l'acte d'accusation (Indictment) ?",
  "Trouve et résume les documents concernant l'accord de non-poursuite (Non-Prosecution Agreement).",
  "Détaille les documents de correspondance récents déclassifiés.",
  "Quels documents mentionnent spécifiquement les victimes présumées ?",
  "Analyse les annexes et les pièces jointes disponibles dans les divulgations."
];

let sequenceIndex = 0;

export const generateInputData = (count: number): InputData[] => {
  const data: InputData[] = [];
  
  for (let i = 0; i < count; i++) {
    data.push({
      id: `DOSSIER-${202400 + sequenceIndex}`,
      query: QUERIES[sequenceIndex % QUERIES.length],
      targetUrl: "https://www.justice.gov/epstein/doj-disclosures",
      timestamp: Date.now() + (i * 2000),
    });
    sequenceIndex++;
  }
  
  return data;
};
