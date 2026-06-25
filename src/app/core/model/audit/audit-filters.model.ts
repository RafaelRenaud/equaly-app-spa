export interface AuditFilters {
  auditType: 'OCCUR' | 'RNC';
  subjectId: number;
  subjectCode?: string;
  actionType?: 'CREATE' |  'READ' |  'UPDATE' |  'DELETE';
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}