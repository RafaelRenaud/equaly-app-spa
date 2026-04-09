/**
 * Interface for Occurrence filters (query parameters)
 */
export interface OccurFilters {
  occurCode?: string;
  occurTypeId?: number;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status?: 'DRAFT_OPENED' | 'PENDING_EDIT_APPROVAL' | 'AWAITING_EDIT' | 'AWAITING_REPORT' | 'AWAITING_CLOSE' | 'AWAITING_RATING' | 'CLOSED';
  hasOpenerAssigned?: boolean;
  openerId?: number;
  hasInspectorAssigned?: boolean;
  inspectorId?: number;
  startOccurredDate?: string; // YYYY-MM-DD
  endOccurredDate?: string;   // YYYY-MM-DD
  content?: string;
  hasRNCOpened?: boolean;
  complaintOrderId?: string;
  complaintType?: 'INTERNAL' | 'EXTERNAL';
  complaintChannel?: 'EQUALY' | 'DALTON' | 'WHATSAPP';
  hasComplainantAssigned?: boolean;
  complainantId?: number;
  complainantInformation?: string;
  complaintRequest?: string;
  closeReason?: string;
  closeStatus?: 'CLOSED_WITH_RATING' | 'CLOSED_WITHOUT_RATING';
  rateScore?: number;
  rateStartDate?: string; // YYYY-MM-DD
  rateEndDate?: string;   // YYYY-MM-DD
  rateDescription?: string;
  creationStartDate?: string; // YYYY-MM-DD
  creationEndDate?: string;   // YYYY-MM-DD
  createdBy?: string;
  officializeStartDate?: string; // YYYY-MM-DD
  officializeEndDate?: string;   // YYYY-MM-DD
  officializedBy?: string;
  updateStartDate?: string; // YYYY-MM-DD
  updateEndDate?: string;   // YYYY-MM-DD
  updatedBy?: string;
  closeStartDate?: string; // YYYY-MM-DD
  closeEndDate?: string;   // YYYY-MM-DD
  closedBy?: string;
}