// file-response.model.ts

// ========== ENUMS ==========
export enum SubjectType {
  OCCUR = 'OCCUR',
  RNC = 'RNC'
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

// ========== WRAPPER INTERFACES ==========
export interface CompanyWrapper {
  id?: number;
  name?: string;
  status?: CompanyStatus;
  logoUri?: string;
}

export interface SubjectWrapper {
  id?: number;
  code?: string;
  type?: SubjectType;
}

// ========== MAIN FILE RESPONSE INTERFACE ==========
export interface FileResponse {
  id?: number;
  company?: CompanyWrapper;
  subject?: SubjectWrapper;
  name?: string;
  size?: number;        // tamanho em bytes
  format?: string;      // extensão do arquivo (ex: 'png', 'jpg', 'pdf')
  type?: string;        // MIME type (ex: 'image/png', 'application/pdf')
  url?: string;
  hash?: string;        // MD5 ou outro hash do arquivo
  createdAt?: string;   // date-time format: 'YYYY-MM-DDTHH:mm:ssZ'
  createdBy?: string;
}