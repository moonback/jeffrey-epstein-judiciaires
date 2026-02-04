/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SYSTEM_INSTRUCTION_DISCLOSURE } from "../constants";
import { InputData, DisclosureAnalysis } from "../types";
import { extractStructuredJson } from "./utils";

const getApiKey = () => {
    return localStorage.getItem('OPENROUTER_API_KEY') || import.meta.env.VITE_OPENROUTER_API_KEY || "";
};

const getModelId = () => {
    return localStorage.getItem('SELECTED_AI_MODEL') || "google/gemini-2.0-flash-exp:free";
};

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
    let attempt = 0;
    while (attempt <= retries) {
        try {
            return await fn();
        } catch (error: any) {
            if (attempt < retries && (error.status === 429 || error.status === 503)) {
                attempt++;
                const waitTime = initialDelay * Math.pow(2, attempt) + (Math.random() * 1000);
                console.warn(`⚠️ OpenRouter API Error. Retrying in ${Math.round(waitTime)}ms... (Attempt ${attempt}/${retries})`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

export const mergeDataWithFlash = async (input: InputData): Promise<{ json: DisclosureAnalysis | null, logs: string[], sources: { title: string; uri: string }[] }> => {
    try {
        const fileContext = input.fileContent ? `--- CONTENU DU DOCUMENT TÉLÉCHARGÉ ---\n${input.fileContent}\n--- FIN DU DOCUMENT ---\n` : '';

        const prompt = `
    DÉTAILS DE L'INVESTIGATION :
    SOURCE CIBLE: ${input.targetUrl}
    REQUÊTE DE RECHERCHE: "${input.query}"
    
    ${fileContext}
    
    INSTRUCTIONS CRITIQUES :
    1. Agissez comme un enquêteur forensique senior.
    2. Analysez les documents DOJ Epstein (ou le contenu fourni ci-dessus) pour extraire des preuves tangibles.
    3. Si une information est absente, indiquez "[NON MENTIONNÉ]" au lieu d'halluciner.
    4. Citez les numéros de pièces jointes ou de pages si visibles.
    5. Répondez exclusivement en JSON valide selon le schéma fourni.
    `;

        const response = await callWithRetry(async () => {
            const key = getApiKey();
            if (!key) throw { status: 401, message: "Clé API OpenRouter manquante. Veuillez la configurer dans les paramètres." };

            const keySource = localStorage.getItem('OPENROUTER_API_KEY') ? "LocalStorage" : "Environment Variable";
            console.log(`[Forensic Engine] Using API Key from: ${keySource}`);

            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${key}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/moonback/Analyseur-de-Documents-Judiciaires",
                    "X-Title": "DOJ Forensic Analyzer"
                },
                body: JSON.stringify({
                    model: getModelId(),
                    messages: [
                        { role: "system", content: SYSTEM_INSTRUCTION_DISCLOSURE },
                        { role: "user", content: prompt }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!res.ok) {
                const err = await res.json();
                const errorMessage = err.error?.message || "Unknown error";
                if (res.status === 401) {
                    throw {
                        status: 401,
                        message: `Authentification Échouée : ${errorMessage}. Vérifiez votre clé API dans les paramètres.`
                    };
                }
                throw { status: res.status, message: errorMessage };
            }

            return res.json();
        });

        const text = response.choices[0].message.content || "{}";
        const jsonResult = extractStructuredJson<DisclosureAnalysis>(text);

        return {
            json: jsonResult,
            logs: [
                `Moteur : OpenRouter (${getModelId()})`,
                `Status : Analyse structurelle terminée`,
                `Tokens : ${response.usage?.total_tokens || 'N/A'}`,
                `Vérification d'hallucination effectuée.`
            ],
            sources: [
                { title: "Justice.gov Epstein Disclosures", uri: "https://www.justice.gov/epstein/doj-disclosures" }
            ]
        };
    } catch (error: any) {
        console.error("Erreur OpenRouter:", error);
        return {
            json: null,
            logs: [`Erreur Critique : ${error.message || String(error)}`],
            sources: []
        };
    }
};

export const askAssistant = async (history: { role: string, text: string }[], message: string): Promise<string> => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getApiKey()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: getModelId(),
                messages: [
                    { role: "system", content: "Vous êtes un assistant juridique spécialisé dans les 'DOJ Epstein Disclosures'. Répondez en français de manière précise et factuelle." },
                    ...history.map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.text })),
                    { role: "user", content: message }
                ]
            })
        });

        if (!response.ok) throw new Error("Erreur assistant OpenRouter");
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        return "Désolé, je ne peux pas répondre pour le moment (Erreur OpenRouter).";
    }
};

export const detectContradictions = async (doc1: string, doc2: string): Promise<string> => {
    try {
        const response = await callWithRetry(async () => {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getApiKey()}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/moonback/Analyseur-de-Documents-Judiciaires",
                    "X-Title": "DOJ Forensic Analyzer"
                },
                body: JSON.stringify({
                    model: getModelId(),
                    messages: [
                        { role: "system", content: "Vous êtes un expert en analyse forensique et détection de fraude. Votre tâche est de comparer deux documents et de signaler toute contradiction, incohérence temporelle, divergence de témoignage ou anomalie factuelle. Répondez sous forme de rapport Markdown structuré." },
                        { role: "user", content: `DOCUMENT A:\n${doc1}\n\nDOCUMENT B:\n${doc2}\n\nAnalysez les conflits potentiels entre ces deux documents.` }
                    ]
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw { status: res.status, message: err.error?.message || "Unknown error" };
            }
            return res.json();
        });

        return response.choices[0].message.content;
    } catch (error: any) {
        console.error("Erreur lors de la détection de contradictions:", error);
        return "Erreur lors de l'analyse des contradictions. Veuillez réessayer.";
    }
};
