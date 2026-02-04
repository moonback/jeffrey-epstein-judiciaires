/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class FileProcessingService {
    /**
     * Extract text from a PDF file
     */
    static async extractTextFromPDF(file: File, onProgress?: (msg: string) => void): Promise<string> {
        try {
            onProgress?.(`[PDF] Lecture du document : ${file.name}`);
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            onProgress?.(`[PDF] Détection de ${pdf.numPages} pages...`);

            for (let i = 1; i <= pdf.numPages; i++) {
                onProgress?.(`[PDF] Extraction Page ${i}/${pdf.numPages}`);
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');

                fullText += `[PIÈCE JOINTE - PAGE ${i}]\n${pageText}\n[FIN DE PAGE ${i}]\n\n`;
            }

            onProgress?.(`[PDF] Extraction terminée. ${fullText.length} caractères extraits.`);
            return fullText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Impossible de lire le fichier PDF. Vérifiez qu\'il ne soit pas protégé.');
        }
    }

    /**
     * Process an uploaded file and prepare it for analysis
     */
    static async processFile(file: File, onProgress?: (msg: string) => void): Promise<{ content: string; metadata: any }> {
        if (file.type === 'application/pdf') {
            const text = await this.extractTextFromPDF(file, onProgress);
            return {
                content: text,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    source: 'PDF_UPLOAD'
                }
            };
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
            onProgress?.(`[TXT] Lecture du fichier texte...`);
            const text = await file.text();
            return {
                content: text,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    source: 'TEXT_UPLOAD'
                }
            };
        } else {
            throw new Error(`Format non supporté: ${file.type}`);
        }
    }
}
