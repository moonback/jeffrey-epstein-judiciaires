/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcessedResult } from '../types';

export class ExportService {
    /**
     * Export investigation to Markdown format
     */
    static exportToMarkdown(result: ProcessedResult): string {
        if (!result.output) return '';

        const { output, input, sources } = result;
        const date = new Date(result.timestamp || Date.now()).toLocaleDateString('fr-FR');

        let markdown = `# ${input.query}\n\n`;
        markdown += `**Date d'analyse**: ${date}\n`;
        markdown += `**Source**: ${input.targetUrl}\n`;
        markdown += `**Contexte juridique**: ${output.contexte_juridique || 'Non spécifié'}\n\n`;
        markdown += `---\n\n`;

        // Context
        markdown += `## Contexte Général\n\n`;
        markdown += `${output.context_general}\n\n`;

        // Documents
        markdown += `## Documents Analysés (${output.documents.length})\n\n`;
        output.documents.forEach((doc, idx) => {
            markdown += `### ${idx + 1}. ${doc.title}\n\n`;
            markdown += `**Type**: ${doc.type || 'Standard'}\n`;
            markdown += `**Date**: ${doc.date}\n\n`;
            markdown += `**Description**: ${doc.description}\n\n`;

            if (doc.key_facts && doc.key_facts.length > 0) {
                markdown += `**Points clés**:\n`;
                doc.key_facts.forEach(fact => {
                    markdown += `- ${fact}\n`;
                });
                markdown += `\n`;
            }

            if (doc.legal_implications) {
                markdown += `**Implications juridiques**: ${doc.legal_implications}\n\n`;
            }

            markdown += `---\n\n`;
        });

        // Entities
        if (output.entites_cles && output.entites_cles.length > 0) {
            markdown += `## Entités Clés (${output.entites_cles.length})\n\n`;
            output.entites_cles.forEach(entity => {
                markdown += `- ${entity}\n`;
            });
            markdown += `\n`;
        }

        // Sources
        if (sources && sources.length > 0) {
            markdown += `## Sources\n\n`;
            sources.forEach((source, idx) => {
                markdown += `${idx + 1}. [${source.title}](${source.uri})\n`;
            });
            markdown += `\n`;
        }

        markdown += `---\n\n`;
        markdown += `*Rapport généré par DOJ Forensic Analyser - ${new Date().toLocaleString('fr-FR')}*\n`;

        return markdown;
    }

    /**
     * Export investigation to CSV format
     */
    static exportToCSV(result: ProcessedResult): string {
        if (!result.output) return '';

        const { output } = result;
        let csv = 'Type,Titre,Date,Description,Implications Juridiques\n';

        output.documents.forEach(doc => {
            const type = (doc.type || 'Standard').replace(/,/g, ';');
            const title = doc.title.replace(/,/g, ';').replace(/"/g, '""');
            const date = doc.date.replace(/,/g, ';');
            const description = doc.description.replace(/,/g, ';').replace(/"/g, '""');
            const implications = (doc.legal_implications || '').replace(/,/g, ';').replace(/"/g, '""');

            csv += `"${type}","${title}","${date}","${description}","${implications}"\n`;
        });

        return csv;
    }

    /**
     * Export investigation to PDF-ready HTML
     */
    static exportToPDFHTML(result: ProcessedResult): string {
        if (!result.output) return '';

        const { output, input, sources } = result;
        const date = new Date(result.timestamp || Date.now()).toLocaleDateString('fr-FR');

        let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${input.query}</title>
    <style>
        @page {
            margin: 2cm;
            size: A4;
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #0F172A;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #B91C1C;
            font-size: 28px;
            border-bottom: 3px solid #B91C1C;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        h2 {
            color: #0F4C81;
            font-size: 22px;
            margin-top: 30px;
            border-left: 4px solid #0F4C81;
            padding-left: 15px;
        }
        h3 {
            color: #0F172A;
            font-size: 18px;
            margin-top: 20px;
        }
        .metadata {
            background: #F8FAFC;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #B5965D;
        }
        .metadata p {
            margin: 5px 0;
            font-size: 14px;
        }
        .document {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .key-facts {
            background: #FFFFF0;
            border-left: 3px solid #F0E68C;
            padding: 15px;
            margin: 15px 0;
        }
        .key-facts ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        .legal-implications {
            background: #EFF6FF;
            border-left: 3px solid #0F4C81;
            padding: 15px;
            margin: 15px 0;
        }
        .entities {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }
        .entity-tag {
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #E2E8F0;
            text-align: center;
            font-size: 12px;
            color: #64748B;
        }
        .sources {
            font-size: 13px;
        }
        .sources a {
            color: #0F4C81;
            text-decoration: none;
        }
        @media print {
            body {
                padding: 0;
            }
            .document {
                page-break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <h1>${input.query}</h1>
    
    <div class="metadata">
        <p><strong>Date d'analyse:</strong> ${date}</p>
        <p><strong>Source:</strong> ${input.targetUrl}</p>
        <p><strong>Contexte juridique:</strong> ${output.contexte_juridique || 'Non spécifié'}</p>
    </div>

    <h2>Contexte Général</h2>
    <p>${output.context_general}</p>

    <h2>Documents Analysés (${output.documents.length})</h2>
    ${output.documents.map((doc, idx) => `
        <div class="document">
            <h3>${idx + 1}. ${doc.title}</h3>
            <p><strong>Type:</strong> ${doc.type || 'Standard'} | <strong>Date:</strong> ${doc.date}</p>
            <p><em>"${doc.description}"</em></p>
            
            ${doc.key_facts && doc.key_facts.length > 0 ? `
                <div class="key-facts">
                    <strong>Points clés:</strong>
                    <ul>
                        ${doc.key_facts.map(fact => `<li>${fact}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${doc.legal_implications ? `
                <div class="legal-implications">
                    <strong>Implications juridiques:</strong> ${doc.legal_implications}
                </div>
            ` : ''}
        </div>
    `).join('')}

    ${output.entites_cles && output.entites_cles.length > 0 ? `
        <h2>Entités Clés (${output.entites_cles.length})</h2>
        <div class="entities">
            ${output.entites_cles.map(entity => `<span class="entity-tag">${entity}</span>`).join('')}
        </div>
    ` : ''}

    ${sources && sources.length > 0 ? `
        <h2>Sources</h2>
        <div class="sources">
            <ol>
                ${sources.map(source => `<li><a href="${source.uri}">${source.title}</a></li>`).join('')}
            </ol>
        </div>
    ` : ''}

    <div class="footer">
        <p>Rapport généré par DOJ Forensic Analyser</p>
        <p>${new Date().toLocaleString('fr-FR')}</p>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Download file helper
     */
    static downloadFile(content: string, filename: string, mimeType: string) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Export to Markdown and download
     */
    static downloadMarkdown(result: ProcessedResult) {
        const markdown = this.exportToMarkdown(result);
        const filename = `${result.input.query.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.md`;
        this.downloadFile(markdown, filename, 'text/markdown');
    }

    /**
     * Export to CSV and download
     */
    static downloadCSV(result: ProcessedResult) {
        const csv = this.exportToCSV(result);
        const filename = `${result.input.query.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
        this.downloadFile(csv, filename, 'text/csv');
    }

    /**
     * Export to PDF (Professional Forensic Report)
     */
    static async downloadPDF(result: ProcessedResult) {
        const { ReportingService } = await import('./reportingService');
        await ReportingService.generateInvestigationReport(result);
    }
}
