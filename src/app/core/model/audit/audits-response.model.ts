export interface AuditResponse {
  id: string;
  type: 'OCCUR' | 'RNC';
  companyId: number;
  subjectId: number;
  subjectCode: string;
  actionType: 'CREATE' | 'UPDATE' | 'READ' | 'DELETE';
  additionalInformation: AdditionalInfo[];
  createdAt: string;
  createdBy: string;
}

export interface AdditionalInfo {
  key: string;
  value: string | number | any;
}

export interface AuditsResponse {
  audits: AuditResponse[];
  pageable: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}