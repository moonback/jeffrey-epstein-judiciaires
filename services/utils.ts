/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Nettoie et extrait le JSON d'une réponse textuelle potentiellement polluée par du Markdown ou du texte libre.
 */
export function extractStructuredJson<T>(text: string): T | null {
    try {
        // 1. Tenter un parse direct (cas idéal)
        return JSON.parse(text) as T;
    } catch {
        try {
            // 2. Chercher le premier '{' et le dernier '}'
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
                return JSON.parse(jsonCandidate) as T;
            }
        } catch (e) {
            console.error("Extraction JSON échouée:", e);
        }
    }
    return null;
}

/**
 * Formate les logs de manière standardisée pour le terminal forensic.
 */
export function formatLog(message: string, type: 'info' | 'error' | 'warning' = 'info'): string {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = {
        info: '🔵 [INFO]',
        error: '🔴 [ERROR]',
        warning: '🟠 [WARN]'
    }[type];

    return `${prefix} ${timestamp} - ${message}`;
}
