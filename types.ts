export interface Keyword {
  term: string;
  volume: string; // e.g. "Alto", "10k+", "Basso"
  difficulty: number; // 0-100
  currentRank: number; // Changed to number for trend analysis
  rankHistory: number[]; // Array of past ranks (e.g. last 6-12 months)
  potential?: 'Alto' | 'Medio' | 'Basso'; // New: Potential gain
}

export interface Competitor {
  name: string;
  url: string;
  overlapScore: number; // 0-100 stima sovrapposizione keyword
  commonKeywords: number; // Stima
}

export interface ActionItem {
  title: string;
  description: string;
  impact: 'Critico' | 'Alto' | 'Medio'; 
  effort: 'Alto' | 'Medio' | 'Basso';
  category: 'Content Gap' | 'Anchor Strategy' | 'Tech Health' | 'Authority';
}

export interface TrafficData {
  month: string;
  visits: number;
}

export interface AnchorData {
  type: 'Brand' | 'Exact Match' | 'Generic' | 'URL';
  percentage: number;
  example: string;
}

export interface SeoReport {
  url: string;
  summary: string; // Tecnico
  clientSummary: string; // Semplice per il cliente
  zoomAuthority: number; // 0-100 (ex Health Score)
  zoomTrust: number; // 0-100
  backlinksCount: number; 
  referringDomains: number; // New: Domini unici
  anchorProfile: AnchorData[]; // New: Distribuzione ancore
  trafficTrend: TrafficData[]; 
  topKeywords: Keyword[];
  opportunityKeywords: Keyword[]; // New: Pos 11-20 "Striking Distance"
  competitors: Competitor[];
  recommendations: ActionItem[];
  sources: Array<{ title: string; uri: string }>;
}

export enum AnalysisStage {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING', 
  THINKING = 'THINKING', 
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}