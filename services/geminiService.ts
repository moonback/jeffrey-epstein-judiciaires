/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_DISCLOSURE } from "../constants";
import { InputData, DisclosureAnalysis } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Clé API manquante");
  return new GoogleGenAI({ apiKey });
};

export const mergeDataWithFlash = async (input: InputData): Promise<{ json: DisclosureAnalysis | null, logs: string[], sources: { title: string; uri: string }[] }> => {
  try {
    const ai = getClient();
    
    const prompt = `
    SOURCE CIBLE: ${input.targetUrl}
    REQUÊTE: "${input.query}"
    
    Tâche : Utilisez Google Search pour trouver les détails spécifiques des documents demandés. Répondez en FRANÇAIS au format JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DISCLOSURE,
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });

    // Extraction du texte
    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extraction des sources
    const sources: { title: string; uri: string }[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || 'Source',
            uri: chunk.web.uri || '#'
          });
        }
      });
    }

    return {
      json: JSON.parse(jsonStr),
      logs: [
        `Cible : justice.gov/epstein`,
        `Exécution de la requête : "${input.query}"`,
        `Synthèse de ${sources.length} sources...`,
        `Génération de l'analyse structurée en français.`
      ],
      sources
    };
  } catch (error) {
    console.error("Erreur Gemini:", error);
    return {
      json: null,
      logs: [`Erreur : ${error instanceof Error ? error.message : String(error)}`],
      sources: []
    };
  }
};
