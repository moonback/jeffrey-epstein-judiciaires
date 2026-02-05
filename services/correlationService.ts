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
    private static normalize(name: string): string {
        return name.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, " ")
            .split(/\s+/)
            .filter(w => w.length > 2)
            .sort()
            .join("");
    }

    static async getCrossSessionCorrelations(): Promise<Correlation[]> {
        const results = await storageService.getAllResults();
        const entityMap = new Map<string, {
            originalName: string,
            investigations: Set<string>,
            themes: Set<string>,
            totalRisk: number,
            sent: number,
            received: number,
            piiFound: Set<string>
        }>();

        results.forEach(res => {
            const entities = res.output?.entites_cles || [];
            const details = res.output?.entites_details || [];
            const transactions = res.output?.transactions_financieres || [];
            const pii = res.output?.donnees_personnelles || [];

            // 1. Process explicit entities
            entities.forEach(ent => {
                const key = this.normalize(ent);
                if (!key) return;

                const existing = entityMap.get(key) || {
                    originalName: ent,
                    investigations: new Set(),
                    themes: new Set(),
                    totalRisk: 0,
                    sent: 0,
                    received: 0,
                    piiFound: new Set()
                };

                existing.investigations.add(res.id);
                const detail = details.find(d => d.nom === ent);
                existing.totalRisk += detail ? detail.risk_level : 3;

                // Grab mentions in PII
                pii.forEach(p => {
                    if (this.normalize(p.owner) === key) {
                        existing.piiFound.add(`${p.type}:${p.value}`);
                    }
                });

                // Grab financial info
                transactions.forEach(t => {
                    const srcKey = this.normalize(t.source);
                    const dstKey = this.normalize(t.destination);
                    if (srcKey === key) existing.sent += t.montant;
                    if (dstKey === key) existing.received += t.montant;
                    if (srcKey === key || dstKey === key) {
                        if (t.description) existing.themes.add(t.description.split(' ').slice(0, 3).join(' '));
                    }
                });

                entityMap.set(key, existing);
            });

            // 2. Double check PII Owners who might not be in entities_cles
            pii.forEach(p => {
                const key = this.normalize(p.owner);
                if (!key || entityMap.has(key)) return;

                entityMap.set(key, {
                    originalName: p.owner,
                    investigations: new Set([res.id]),
                    themes: new Set(['Identifié via PII']),
                    totalRisk: 5,
                    sent: 0,
                    received: 0,
                    piiFound: new Set([`${p.type}:${p.value}`])
                });
            });
        });

        const correlations: Correlation[] = [];
        entityMap.forEach((data, key) => {
            // Keep significant correlations: multiple investigations OR financial OR pii found
            if (data.investigations.size > 1 || data.sent > 0 || data.piiFound.size > 0) {
                const avgRisk = data.totalRisk / data.investigations.size;
                const piiBonus = data.piiFound.size * 1.5;
                const freqBonus = data.investigations.size * 0.8;

                correlations.push({
                    entity: data.originalName,
                    occurrences: data.investigations.size,
                    relatedInvestigations: Array.from(data.investigations),
                    sharedThematics: Array.from(data.themes).slice(0, 5),
                    riskScore: Math.min(10, Math.round(avgRisk + piiBonus + freqBonus)),
                    financialHub: data.sent > 100000 || data.received > 100000,
                    totalAmountSent: data.sent,
                    totalAmountReceived: data.received,
                    piiCount: data.piiFound.size
                } as any);
            }
        });

        return correlations.sort((a, b) => b.riskScore - a.riskScore);
    }
}
