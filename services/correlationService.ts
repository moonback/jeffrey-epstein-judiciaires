/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { storageService } from './storageService';
import { ProcessedResult } from '../types';

export interface Correlation {
    entity: string;
    occurrences: number;
    relatedInvestigations: string[];
    sharedThematics: string[];
    riskScore: number;
    financialHub?: boolean;
    totalAmountSent?: number;
    totalAmountReceived?: number;
}

export class CorrelationService {
    static async getCrossSessionCorrelations(): Promise<Correlation[]> {
        const results = await storageService.getAllResults();
        const entityMap = new Map<string, {
            investigations: Set<string>,
            themes: Set<string>,
            totalRisk: number,
            sent: number,
            received: number
        }>();

        results.forEach(res => {
            const entities = res.output?.entites_cles || [];
            const details = res.output?.entites_details || [];
            const transactions = res.output?.transactions_financieres || [];

            entities.forEach(ent => {
                const existing = entityMap.get(ent) || { investigations: new Set(), themes: new Set(), totalRisk: 0, sent: 0, received: 0 };
                existing.investigations.add(res.id); // Use ID instead of query for uniqueness

                const detail = details.find(d => d.nom === ent);
                existing.totalRisk += detail ? detail.risk_level : 3;

                // Sync financial data if present
                transactions.forEach(t => {
                    if (t.source === ent) existing.sent += t.montant;
                    if (t.destination === ent) existing.received += t.montant;
                });

                entityMap.set(ent, existing);
            });
        });

        const correlations: Correlation[] = [];
        entityMap.forEach((data, entity) => {
            if (data.investigations.size > 1 || data.sent > 0 || data.received > 0) {
                correlations.push({
                    entity,
                    occurrences: data.investigations.size,
                    relatedInvestigations: Array.from(data.investigations),
                    sharedThematics: [],
                    riskScore: Math.min(10, Math.round(data.totalRisk / data.investigations.size + (data.investigations.size * 0.5))),
                    financialHub: data.sent > 100000 || data.received > 100000,
                    totalAmountSent: data.sent,
                    totalAmountReceived: data.received
                });
            }
        });

        return correlations.sort((a, b) => {
            if (b.occurrences !== a.occurrences) return b.occurrences - a.occurrences;
            return (b.totalAmountSent! + b.totalAmountReceived!) - (a.totalAmountSent! + a.totalAmountReceived!);
        });
    }
}
