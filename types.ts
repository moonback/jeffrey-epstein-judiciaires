/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface InputData {
  id: string;
  query: string;
  targetUrl: string;
  timestamp: number;
  fileContent?: string;
}

export interface DocumentDetail {
  title: string;
  type: string;
  description: string;
  key_facts: string[];
  legal_implications: string;
  date: string;
}

export interface EntityDetail {
  nom: string;
  role: string;
  risk_level: number;
  influence: number;
}

export interface TransactionDetail {
  source: string;
  destination: string;
  montant: number;
  devise: string;
  date: string;
  description: string;
}

export interface FlightDetail {
  date: string;
  source: string; // Tail number or Aircraft
  depart: string;
  destination: string;
  passagers: string[];
  pilote?: string;
  description?: string;
}

export interface AssetDetail {
  nom: string;
  type: 'immobilier' | 'vehicule' | 'compte_bancaire' | 'societe' | 'autre';
  valeur_estimee?: number;
  devise?: string;
  localisation?: string;
  proprietaire_declare: string;
  description: string;
}

export interface PIIDetail {
  owner: string;
  type: 'email' | 'phone' | 'address' | 'passport' | 'ssn' | 'other';
  value: string;
  context?: string;
}

export interface DisclosureAnalysis {
  context_general: string;
  documents: DocumentDetail[];
  entites_cles: string[];
  entites_details?: EntityDetail[];
  transactions_financieres?: TransactionDetail[];
  actifs?: AssetDetail[];
  journaux_de_vol?: FlightDetail[];
  contexte_juridique: string;
  donnees_personnelles?: PIIDetail[];
}

export interface ProcessedResult {
  id: string;
  input: InputData;
  output: DisclosureAnalysis | null;
  logs: string[];
  sources: { title: string; uri: string }[];
  durationMs: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
  timestamp?: number;
}
