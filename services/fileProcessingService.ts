/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

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
     * Extract text from an image using OCR
     */
    static async extractTextFromImage(file: File, onProgress?: (msg: string) => void): Promise<string> {
        try {
            onProgress?.(`[OCR] Initialisation du moteur Tesseract...`);
            const { data: { text } } = await Tesseract.recognize(
                file,
                'fra+eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            onProgress?.(`[OCR] Analyse : ${Math.round(m.progress * 100)}%`);
                        }
                    }
                }
            );
            onProgress?.(`[OCR] Décodage terminé.`);
            return `[DOCUMENT SCANNÉ - OCR]\n${text}\n[FIN DU DOCUMENT SCANNÉ]`;
        } catch (error) {
            console.error('OCR Error:', error);
            throw new Error('Échec du moteur OCR. Vérifiez que l\'image est lisible.');
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
        } else if (file.type.startsWith('image/')) {
            const text = await this.extractTextFromImage(file, onProgress);
            return {
                content: text,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    source: 'IMAGE_OCR'
                }
            };
        } else {
            throw new Error(`Format non supporté: ${file.type}. Veuillez utiliser PDF, IMAGE (JPG/PNG), TXT ou MD.`);
        }
    }
}
