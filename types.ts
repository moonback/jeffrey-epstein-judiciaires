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

export interface DisclosureAnalysis {
  context_general: string;
  documents: DocumentDetail[];
  entites_cles: string[];
  entites_details?: EntityDetail[];
  contexte_juridique: string;
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
