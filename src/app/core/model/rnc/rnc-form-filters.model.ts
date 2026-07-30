// rnc-form-filters.model.ts
export interface RncFormFilters {
  rncId?: number;
  rncCode?: string;
  formCode?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: string[];
  inspectorId?: number;
  reporterId?: number;
  content?: string;
  startFollowUpDate?: string;
  endFollowUpDate?: string;
  validationDescription?: string;
  startValidationDate?: string;
  endValidationDate?: string;
  implementationDescription?: string;
  startImplementationDate?: string;
  endImplementationDate?: string;
  efficacyDescription?: string;
  startEfficacyDate?: string;
  endEfficacyDate?: string;
  creationStartDate?: string;
  creationEndDate?: string;
  updateStartDate?: string;
  updateEndDate?: string;
  closeStartDate?: string;
  closeEndDate?: string;
}