/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessedResult, DocumentDetail, InputData } from '../types';
import { FileProcessingService } from './fileProcessingService';
import { storageService } from './storageService';
import { mergeDataWithFlash } from './openRouterService';

export interface DOJImportOptions {
    analyzeWithAI: boolean;
    onProgress?: (message: string) => void;
    onError?: (error: string) => void;
}

export interface DOJMetadata {
    original_url: string;
    doj_filename: string;
    import_date: string;
    file_size_bytes: number;
}

export class DOJImportService {
    /**
     * Download a PDF from a URL and convert to File object
     * Uses CORS proxy to bypass browser restrictions
     */
    static async downloadPDF(url: string, onProgress?: (msg: string) => void): Promise<{ file: File; metadata: DOJMetadata }> {
        try {
            onProgress?.('[DOJ] Téléchargement du document...');

            // CORS proxies to try in order
            const corsProxies = [
                'https://corsproxy.io/?',
                'https://api.allorigins.win/raw?url=',
                '' // Direct attempt (will likely fail but worth trying)
            ];

            let response: Response | null = null;
            let lastError: Error | null = null;

            // Try each CORS proxy
            for (const proxy of corsProxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(url);
                    onProgress?.(`[DOJ] Tentative de téléchargement${proxy ? ' via proxy' : ' direct'}...`);

                    response = await fetch(proxy ? proxyUrl : url, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/pdf',
                        },
                    });

                    if (response.ok) {
                        onProgress?.('[DOJ] Connexion établie, téléchargement en cours...');
                        break; // Success, exit loop
                    }
                } catch (err) {
                    lastError = err instanceof Error ? err : new Error('Unknown error');
                    console.warn(`Failed with ${proxy || 'direct'} method:`, err);
                    continue; // Try next proxy
                }
            }

            if (!response || !response.ok) {
                throw new Error(`Tous les proxies ont échoué. CORS bloqué. Erreur: ${lastError?.message || 'Impossible de télécharger'}`);
            }

            const blob = await response.blob();

            // Extract filename from URL
            const urlParts = url.split('/');
            let filename = urlParts[urlParts.length - 1] || 'doj-document.pdf';

            // Decode URL-encoded filename
            filename = decodeURIComponent(filename);

            // Ensure it's a PDF
            if (!filename.toLowerCase().endsWith('.pdf')) {
                filename += '.pdf';
            }

            const file = new File([blob], filename, { type: 'application/pdf' });

            const metadata: DOJMetadata = {
                original_url: url,
                doj_filename: filename,
                import_date: new Date().toISOString(),
                file_size_bytes: blob.size
            };

            onProgress?.(`[DOJ] Document téléchargé: ${filename} (${(blob.size / 1024).toFixed(1)} KB)`);

            return { file, metadata };
        } catch (error) {
            console.error('Error downloading DOJ PDF:', error);
            throw new Error(`Impossible de télécharger le PDF via CORS proxy. Le site justice.gov bloque les téléchargements directs depuis le navigateur. Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Import a DOJ PDF document into the Evidence Gallery
     */
    static async importDOJDocument(url: string, options: DOJImportOptions): Promise<ProcessedResult> {
        const { analyzeWithAI = false, onProgress, onError } = options;
        const startTime = Date.now();
        const logs: string[] = [];

        try {
            // Step 1: Download PDF
            onProgress?.('[DOJ] Démarrage de l\'importation...');
            logs.push('Importation depuis DOJ Epstein Library');

            const { file, metadata } = await this.downloadPDF(url, (msg) => {
                logs.push(msg);
                onProgress?.(msg);
            });

            // Step 2: Extract text from PDF
            onProgress?.('[DOJ] Extraction du texte du PDF...');
            const { content } = await FileProcessingService.processFile(file, (msg) => {
                logs.push(msg);
                onProgress?.(msg);
            });

            // Step 3: Optionally analyze with AI
            let aiAnalysis = null;
            if (analyzeWithAI) {
                onProgress?.('[DOJ] Analyse IA en cours...');
                logs.push('[AI] Envoi du contenu à l\'analyseur forensique...');

                try {
                    const inputData: InputData = {
                        id: `doj-ai-${Date.now()}`,
                        query: `Analyse forensique: ${metadata.doj_filename}`,
                        targetUrl: metadata.original_url,
                        timestamp: Date.now(),
                        fileContent: content
                    };

                    const { json, logs: aiLogs } = await mergeDataWithFlash(inputData);
                    aiAnalysis = json;
                    logs.push(...aiLogs);
                    onProgress?.('[DOJ] Analyse IA terminée');
                } catch (aiError) {
                    logs.push(`[AI] Erreur d'analyse: ${aiError instanceof Error ? aiError.message : 'Erreur inconnue'}`);
                    console.warn('AI analysis failed, continuing without it:', aiError);
                }
            }

            // Step 4: Create ProcessedResult structure
            const result: ProcessedResult = {
                id: `doj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                status: 'completed',
                input: {
                    id: `doj-input-${Date.now()}`,
                    query: `Import DOJ: ${metadata.doj_filename}`,
                    targetUrl: metadata.original_url,
                    timestamp: Date.now(),
                    fileContent: content.slice(0, 5000) // Store preview
                },
                output: aiAnalysis || {
                    context_general: `Document importé depuis DOJ Epstein Library: ${metadata.doj_filename}`,
                    documents: [
                        {
                            title: metadata.doj_filename,
                            type: 'DOJ_DISCLOSURE',
                            description: `Document officiel du Département de la Justice (DOJ) importé le ${new Date(metadata.import_date).toLocaleDateString('fr-FR')}. Taille: ${(metadata.file_size_bytes / 1024).toFixed(1)} KB.`,
                            key_facts: [
                                `Source: ${metadata.original_url}`,
                                `Importé depuis: DOJ Epstein Library`,
                                `Date d'import: ${new Date(metadata.import_date).toLocaleString('fr-FR')}`
                            ],
                            legal_implications: 'Document officiel soumis à redactions pour protéger les victimes et informations sensibles.',
                            date: new Date(metadata.import_date).toISOString().split('T')[0]
                        }
                    ],
                    entites_cles: [],
                    contexte_juridique: 'Divulgation DOJ - Affaire Epstein Files Transparency Act'
                },
                logs,
                sources: [
                    {
                        title: `DOJ: ${metadata.doj_filename}`,
                        uri: metadata.original_url
                    }
                ],
                durationMs: Date.now() - startTime
            };

            // Step 5: Save to storage
            onProgress?.('[DOJ] Sauvegarde dans la base de données...');
            await storageService.saveResult(result);
            logs.push('[Storage] Document enregistré avec succès');

            onProgress?.('[DOJ] ✅ Importation terminée avec succès!');

            return result;

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'importation';
            logs.push(`[ERROR] ${errorMsg}`);
            onError?.(errorMsg);

            throw error;
        }
    }

    /**
     * Validate if a URL is a valid DOJ PDF URL
     */
    static isValidDOJUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return (
                (urlObj.hostname === 'www.justice.gov' || urlObj.hostname === 'justice.gov') &&
                url.toLowerCase().endsWith('.pdf')
            );
        } catch {
            return false;
        }
    }
}
