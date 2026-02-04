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
    static async extractTextFromPDF(file: File): Promise<string> {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(' ');
                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
            }

            return fullText;
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            throw new Error('Impossible de lire le fichier PDF. Veuillez vérifier qu\'il n\'est pas corrompu ou protégé par mot de passe.');
        }
    }

    /**
     * Process an uploaded file and prepare it for analysis
     */
    static async processFile(file: File): Promise<{ content: string; metadata: any }> {
        if (file.type === 'application/pdf') {
            const text = await this.extractTextFromPDF(file);
            return {
                content: text,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                }
            };
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
            const text = await file.text();
            return {
                content: text,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                }
            };
        } else {
            throw new Error(`Format de fichier non supporté: ${file.type}. Veuillez utiliser PDF, TXT ou MD.`);
        }
    }
}
