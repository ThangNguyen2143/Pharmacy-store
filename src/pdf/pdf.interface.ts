import { UserOptions } from 'jspdf-autotable';

export interface index {
  Index: string;
  Page: number;
}

export interface TableOptions extends UserOptions {
  ignoreFields?: string[];
  tableName: string;
  addToIndex?: boolean;
}
