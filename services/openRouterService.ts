/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { SYSTEM_INSTRUCTION_DISCLOSURE } from "../constants";
import { InputData, DisclosureAnalysis } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || "your_key_here";
const MODEL_ID = "google/gemini-2.5-flash-lite"; // Specific version of Grok 2

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
        const prompt = `
    SOURCE CIBLE: ${input.targetUrl}
    REQUÊTE: "${input.query}"
    
    Tâche : Agissez comme un enquêteur. Trouvez les détails spécifiques des documents demandés dans les divulgations Epstein du DOJ.
    Répondez en FRANÇAIS au format JSON selon les instructions système.
    `;

        const response = await callWithRetry(async () => {
            const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://github.com/moonback/Analyseur-de-Documents-Judiciaires",
                    "X-Title": "Analyseur de Documents Judiciaires"
                },
                body: JSON.stringify({
                    model: MODEL_ID,
                    messages: [
                        { role: "system", content: SYSTEM_INSTRUCTION_DISCLOSURE },
                        { role: "user", content: prompt }
                    ]
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw { status: res.status, message: err.error?.message || "Unknown error" };
            }

            return res.json();
        });

        const text = response.choices[0].message.content || "{}";
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonResult = JSON.parse(cleanedText);

        return {
            json: jsonResult,
            logs: [
                `Moteur : OpenRouter (${MODEL_ID})`,
                `Cible : justice.gov/epstein`,
                `Analyse en cours : "${input.query}"`,
                `Génération de l'analyse structurée.`
            ],
            sources: [
                { title: "Justice.gov Epstein Disclosures", uri: "https://www.justice.gov/epstein/doj-disclosures" }
            ]
        };
    } catch (error: any) {
        console.error("Erreur OpenRouter:", error);
        return {
            json: null,
            logs: [`Erreur : ${error.message || String(error)}`],
            sources: []
        };
    }
};

export const askAssistant = async (history: { role: string, text: string }[], message: string): Promise<string> => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_ID,
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
