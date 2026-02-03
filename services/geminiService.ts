/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION_DISCLOSURE } from "../constants";
import { InputData, DisclosureAnalysis } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("Clé API manquante");
  return new GoogleGenAI({ apiKey });
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic Retry Wrapper for API calls
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error: any) {
      // Detect Rate Limit (429) or Resource Exhausted errors
      // The API might return the error code in different properties depending on the context
      const isRateLimit = 
        error?.status === 429 || 
        error?.code === 429 || 
        error?.status === 'RESOURCE_EXHAUSTED' ||
        (error?.message && (
          error.message.includes('429') || 
          error.message.includes('quota') || 
          error.message.includes('RESOURCE_EXHAUSTED')
        ));

      if (isRateLimit && attempt < retries) {
        attempt++;
        // Calculate wait time: Initial * 2^attempt + random jitter
        const waitTime = initialDelay * Math.pow(2, attempt) + (Math.random() * 1000);
        console.warn(`⚠️ Gemini API Quota Exceeded. Retrying in ${Math.round(waitTime)}ms... (Attempt ${attempt}/${retries})`);
        await delay(waitTime);
      } else {
        // If it's not a rate limit error, or we ran out of retries, throw it
        throw error;
      }
    }
  }
  throw new Error("Max retries exceeded");
}

export const mergeDataWithFlash = async (input: InputData): Promise<{ json: DisclosureAnalysis | null, logs: string[], sources: { title: string; uri: string }[] }> => {
  try {
    const ai = getClient();
    
    const prompt = `
    SOURCE CIBLE: ${input.targetUrl}
    REQUÊTE: "${input.query}"
    
    Tâche : Utilisez Google Search pour trouver les détails spécifiques des documents demandés. Répondez en FRANÇAIS au format JSON.
    `;

    // Wrap the API call with retry logic
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_DISCLOSURE,
        temperature: 0.1,
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    }));

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

export const askAssistant = async (history: {role: string, text: string}[], message: string): Promise<string> => {
  const ai = getClient();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Vous êtes un assistant juridique spécialisé dans les 'DOJ Epstein Disclosures'.
      Votre mission est de répondre aux questions de l'utilisateur en cherchant les informations DIRECTEMENT dans les fichiers PDF hébergés sur justice.gov/epstein/doj-disclosures.
      
      Règles :
      1. Utilisez TOUJOURS Google Search pour vérifier vos dires.
      2. Si vous trouvez une info, citez le nom du document (ex: "Déposition de X, page Y").
      3. Soyez précis, factuel et neutre.
      4. Répondez en français.`,
      tools: [{ googleSearch: {} }]
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  // Wrap the chat message call with retry logic
  const result = await callWithRetry<GenerateContentResponse>(() => chat.sendMessage({ message: `Recherche spécifiquement sur le site site:justice.gov/epstein/doj-disclosures pour : ${message}` }));
  return result.text || "Je n'ai pas pu trouver d'information précise à ce sujet.";
};
