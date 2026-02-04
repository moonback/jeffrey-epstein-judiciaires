/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { ProcessedResult } from '../types';

export class ReportingService {
    /**
     * Generate a professional forensic PDF report for a single investigation
     */
    static async generateInvestigationReport(result: ProcessedResult): Promise<void> {
        if (!result.output) return;

        const doc = new jsPDF() as any;
        const pageWidth = doc.internal.pageSize.getWidth();
        const timestamp = new Date().toLocaleString('fr-FR');

        // 1. Header Design (Forensic Style)
        doc.setFillColor(15, 23, 42); // slate-900
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('DOJ FORENSIC ANALYZER', 20, 20);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('LABORATOIRE D\'ANALYSE NUMÉRIQUE - PROTOCOLE 8.4', 20, 30);

        doc.setTextColor(185, 28, 28); // red-700
        doc.setFontSize(14);
        doc.text('CLASSIFIED', pageWidth - 50, 20);

        // 2. Metadata Section
        let y = 55;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Dossier #' + result.id, 20, y);
        y += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date d'analyse : ${timestamp}`, 20, y);
        y += 6;
        doc.text(`Source : ${result.input.targetUrl}`, 20, y);
        y += 15;

        // 3. Query Section
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(15, y, pageWidth - 30, 25, 'F');
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.rect(15, y, pageWidth - 30, 25, 'D');

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(11);
        const splitQuery = doc.splitTextToSize(`"${result.input.query}"`, pageWidth - 40);
        doc.text(splitQuery, 20, y + 15);
        y += 35;

        // 4. Executive Summary
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('SYNTHÈSE GÉNÉRALE', 20, y);
        y += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const splitSummary = doc.splitTextToSize(result.output.context_general, pageWidth - 40);
        doc.text(splitSummary, 20, y);
        y += splitSummary.length * 7 + 10;

        // 5. Entities (Table)
        if (result.output.entites_details && result.output.entites_details.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.text('ENTITÉS ET PERSONNES D\'INTÉRÊT', 20, y);
            y += 5;

            doc.autoTable({
                startY: y,
                head: [['Nom', 'Rôle', 'Risque', 'Influence']],
                body: result.output.entites_details.map(e => [
                    e.nom,
                    e.role,
                    `${e.risk_level}/10`,
                    `${e.influence}/10`
                ]),
                theme: 'striped',
                headStyles: { fillColor: [15, 23, 42] },
                margin: { left: 20, right: 20 }
            });
            y = (doc as any).lastAutoTable.finalY + 15;
        }

        // 5b. Financial Transactions (Table)
        if (result.output.transactions_financieres && result.output.transactions_financieres.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.text('FLUX FINANCIERS ET MOUVEMENTS MONÉTAIRES', 20, y);
            y += 5;

            doc.autoTable({
                startY: y,
                head: [['Source', 'Destination', 'Montant', 'Date', 'Description']],
                body: result.output.transactions_financieres.map(t => [
                    t.source,
                    t.destination,
                    `${t.montant} ${t.devise}`,
                    t.date,
                    t.description
                ]),
                theme: 'grid',
                headStyles: { fillColor: [185, 28, 28] }, // Red for finance
                columnStyles: {
                    4: { cellWidth: 60 } // Description column wider
                },
                margin: { left: 20, right: 20 }
            });
            y = (doc as any).lastAutoTable.finalY + 15;
        }

        // 6. Documents List
        if (result.output.documents && result.output.documents.length > 0) {
            if (y > 220) { doc.addPage(); y = 20; }

            doc.setFont('helvetica', 'bold');
            doc.text('PIÈCES À CONVICTION & DOCUMENTS CLÉS', 20, y);
            y += 10;

            result.output.documents.forEach((docItem, idx) => {
                const docHeight = 40; // Approx
                if (y + docHeight > 270) { doc.addPage(); y = 20; }

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`${idx + 1}. ${docItem.title}`, 20, y);
                y += 6;
                doc.setFontSize(10);
                doc.setFont('helvetica', 'italic');
                doc.text(`Type: ${docItem.type} | Date: ${docItem.date}`, 20, y);
                y += 8;
                doc.setFont('helvetica', 'normal');
                const splitDesc = doc.splitTextToSize(docItem.description, pageWidth - 40);
                doc.text(splitDesc, 20, y);
                y += splitDesc.length * 5 + 8;
            });
        }

        // Footer for all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Rapport DOJ Forensic #${result.id} - Page ${i} sur ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
        }

        doc.save(`Rapport_Forensic_${result.id}.pdf`);
    }
}
