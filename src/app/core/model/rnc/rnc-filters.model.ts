// rnc-filters.model.ts
export interface RncFilters {
  rncCode?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: ('OPENED' | 'WORK_IN_PROGRESS' | 'CLOSED')[];
  inspectorId?: number;
  reporterId?: number;
  occurId?: number;
  occurCode?: string;
  occurTypeId?: number;
  occurOpenerId?: number;
  occurInspectorId?: number;
  startOccurredDate?: string;
  endOccurredDate?: string;
  creationStartDate?: string;
  creationEndDate?: string;
  updateStartDate?: string;
  updateEndDate?: string;
  closeStartDate?: string;
  closeEndDate?: string;
  hasFormAssigned?: boolean;
}