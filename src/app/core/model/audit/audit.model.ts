export interface Audit {
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  disabledAt: string | null;
  disabledBy: string | null;
}