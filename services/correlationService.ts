import { storageService } from './storageService';
import { ProcessedResult, DocumentLink, DiscoveryResult } from '../types';

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
    private static normalize(name: any): string {
        if (!name) return "";
        const targetName = typeof name === 'string' ? name : ((name as any).nom || (name as any).name || String(name));
        return targetName.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, " ")
            .split(/\s+/)
            .filter((w: string) => w.length > 2)
            .sort()
            .join("");
    }

    static async discoverLinks(doc1: ProcessedResult, doc2: ProcessedResult): Promise<DiscoveryResult> {
        const links: DocumentLink[] = [];

        if (!doc1.output || !doc2.output) return { doc1Id: doc1.id, doc2Id: doc2.id, links: [], totalStrength: 0 };

        // 1. Entity Matching
        const entities1 = new Map((doc1.output.entites_cles || []).map(e => [this.normalize(e), e]));
        const entities2 = new Map((doc2.output.entites_cles || []).map(e => [this.normalize(e), e]));

        entities1.forEach((original, key) => {
            if (entities2.has(key)) {
                links.push({
                    type: 'entity',
                    label: `Entité commune : ${original}`,
                    description: `Cette personne ou organisation apparaît dans les deux documents.`,
                    strength: 8,
                    relatedData: { name: original }
                });
            }
        });

        // 2. PII Correlation
        const pii1 = doc1.output.donnees_personnelles || [];
        const pii2 = doc2.output.donnees_personnelles || [];

        pii1.forEach(p1 => {
            pii2.forEach(p2 => {
                if (p1.value.toLowerCase() === p2.value.toLowerCase() && p1.type === p2.type) {
                    links.push({
                        type: 'pii',
                        label: `Donnée partagée : ${p1.type}`,
                        description: `Le même ${p1.type} (${p1.value}) a été identifié pour ${p1.owner} et ${p2.owner}.`,
                        strength: 10,
                        relatedData: { type: p1.type, value: p1.value }
                    });
                }
            });
        });

        // 3. Financial Links
        const trans1 = doc1.output.transactions_financieres || [];
        const trans2 = doc2.output.transactions_financieres || [];

        trans1.forEach(t1 => {
            trans2.forEach(t2 => {
                const src1 = this.normalize(t1.source);
                const dst1 = this.normalize(t1.destination);
                const src2 = this.normalize(t2.source);
                const dst2 = this.normalize(t2.destination);

                if (src1 === src2 || dst1 === dst2 || src1 === dst2 || dst1 === src2) {
                    const shared = src1 === src2 || src1 === dst2 ? t1.source : t1.destination;
                    links.push({
                        type: 'transaction',
                        label: `Hub financier commun : ${shared}`,
                        description: `Les deux dossiers mentionnent des flux financiers impliquant ${shared}.`,
                        strength: 7,
                        relatedData: { sharedEntity: shared }
                    });
                }
            });
        });

        // 4. Flight Pattern Correlation
        const flights1 = doc1.output.journaux_de_vol || [];
        const flights2 = doc2.output.journaux_de_vol || [];

        flights1.forEach(f1 => {
            flights2.forEach(f2 => {
                if (f1.source === f2.source && f1.source !== 'Unknown') {
                    links.push({
                        type: 'flight',
                        label: `Aéronef commun : ${f1.source}`,
                        description: `Le même appareil est impliqué dans des déplacements mentionnés dans les deux archives.`,
                        strength: 6,
                        relatedData: { aircraft: f1.source }
                    });
                }
            });
        });

        // 5. Thematic Correlation (Smarter with Stopwords)
        const stopWords = new Set(['dans', 'avec', 'pour', 'plus', 'cette', 'fait', 'etre', 'mais', 'nous', 'vous', 'leur', 'aussi', 'tout', 'dont', 'faire', 'about', 'would', 'their', 'there', 'those', 'these', 'where', 'which', 'after', 'before', 'between', 'during', 'through', 'under', 'while']);
        const words1 = new Set((doc1.output.context_general || "").toLowerCase().split(/\W+/).filter(w => w.length > 4 && !stopWords.has(w)));
        const words2 = new Set((doc2.output.context_general || "").toLowerCase().split(/\W+/).filter(w => w.length > 4 && !stopWords.has(w)));

        const commonThemes: string[] = [];
        words1.forEach(w => {
            if (words2.has(w)) commonThemes.push(w);
        });

        if (commonThemes.length >= 3) {
            links.push({
                type: 'semantic',
                label: `Convergence Thématique`,
                description: `Les deux dossiers partagent des concepts clés tels que : ${commonThemes.slice(0, 4).join(', ')}.`,
                strength: Math.min(12, 4 + commonThemes.length),
                relatedData: { themes: commonThemes }
            });
        }

        const totalStrength = links.reduce((acc, curr) => acc + curr.strength, 0);
        return {
            doc1Id: doc1.id,
            doc2Id: doc2.id,
            links: links.sort((a, b) => b.strength - a.strength).slice(0, 15),
            totalStrength: Math.min(100, Math.round(totalStrength))
        };
    }

    static async findDiscoveryLinks(targetId: string): Promise<DiscoveryResult[]> {
        const results = await storageService.getAllResults();
        const target = results.find(r => r.id === targetId);
        if (!target || !target.output) return [];

        const otherDocs = results.filter(r => r.id !== targetId && r.output && r.status === 'completed');

        const discoveryPromises = otherDocs.map(res => this.discoverLinks(target, res));
        const allDiscoveries = await Promise.all(discoveryPromises);

        return allDiscoveries
            .filter(d => d.links.length > 0)
            .sort((a, b) => b.totalStrength - a.totalStrength);
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

                const entName = typeof ent === 'string' ? ent : ((ent as any).nom || (ent as any).name || "Inconnu");

                const existing = entityMap.get(key) || {
                    originalName: entName,
                    investigations: new Set(),
                    themes: new Set(),
                    totalRisk: 0,
                    sent: 0,
                    received: 0,
                    piiFound: new Set()
                };

                existing.investigations.add(res.id);
                const detail = details.find(d => d.nom === entName);
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
