
export type CellType = 'raw' | 'formula' | 'ai' | 'reference' | 'api';

export interface Cell {
  id: string; // "A1", "B5"
  rawValue: string;
  computedValue: any;
  type: CellType;
  metadata?: {
    source?: string;
    explanation?: string;
    error?: string;
    isProcessing?: boolean;
    lastUpdated?: number;
  };
}

export interface Table {
  id: string;
  name: string;
  primaryKey: string;
  columns: { name: string; type: string; foreignKey?: string }[];
}

export interface SpreadsheetState {
  id: string;
  name: string;
  cells: Record<string, Cell>;
  tables: Table[];
  history: ChangeRecord[];
  activeCell: string | null;
  selection: string[];
}

export interface ChangeRecord {
  id: string;
  timestamp: number;
  author: string;
  description: string;
  diff: Record<string, Cell>;
}

export interface AIAction {
  type: 'UPDATE_CELLS' | 'CREATE_TABLE' | 'VISUALIZE' | 'EXPLAIN';
  payload: any;
  reasoning: string;
}

export enum AppView {
  GRID = 'GRID',
  DATABASE = 'DATABASE',
  DASHBOARD = 'DASHBOARD',
  AUTOMATION = 'AUTOMATION'
}
