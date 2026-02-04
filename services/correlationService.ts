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
}

export class CorrelationService {
    static async getCrossSessionCorrelations(): Promise<Correlation[]> {
        const results = await storageService.getAllResults();
        const entityMap = new Map<string, { investigations: Set<string>, themes: Set<string>, totalRisk: number }>();

        results.forEach(res => {
            const entities = res.output?.entites_cles || [];
            const details = res.output?.entites_details || [];
            const themes = res.output?.context_general?.split(' ') || [];

            entities.forEach(ent => {
                const existing = entityMap.get(ent) || { investigations: new Set(), themes: new Set(), totalRisk: 0 };
                existing.investigations.add(res.input.query);

                // Find risk level for this entity in this result
                const detail = details.find(d => d.nom === ent);
                if (detail) {
                    existing.totalRisk += detail.risk_level;
                } else {
                    existing.totalRisk += 3; // Default
                }

                entityMap.set(ent, existing);
            });
        });

        const correlations: Correlation[] = [];
        entityMap.forEach((data, entity) => {
            if (data.investigations.size > 1) { // Only if found in multiple investigations
                correlations.push({
                    entity,
                    occurrences: data.investigations.size,
                    relatedInvestigations: Array.from(data.investigations),
                    sharedThematics: [], // Simplified for now
                    riskScore: Math.min(10, Math.round(data.totalRisk / data.investigations.size + (data.investigations.size * 0.5)))
                });
            }
        });

        return correlations.sort((a, b) => b.occurrences - a.occurrences);
    }
}
