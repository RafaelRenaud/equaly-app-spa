// rnc-audit.model.ts

export interface RncAudit {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  closedAt?: string;
  closedBy?: string;
}