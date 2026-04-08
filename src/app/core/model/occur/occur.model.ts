// occur.model.ts

// ========== ENUMS ==========
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum OccurStatus {
  DRAFT_OPENED = 'DRAFT_OPENED',
  PENDING_EDIT_APPROVAL = 'PENDING_EDIT_APPROVAL',
  AWAITING_EDIT = 'AWAITING_EDIT',
  AWAITING_REPORT = 'AWAITING_REPORT',
  AWAITING_CLOSE = 'AWAITING_CLOSE',
  AWAITING_RATING = 'AWAITING_RATING',
  CLOSED = 'CLOSED'
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum OccurTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum ComplaintChannel {
  DALTON = 'DALTON',
  EQUALY = 'EQUALY',
  WHATSAPP = 'WHATSAPP'
}

export enum ComplaintType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL'
}

export enum CloseStatus {
  CLOSED_WITH_RATING = 'CLOSED_WITH_RATING',
  CLOSED_WITHOUT_RATING = 'CLOSED_WITHOUT_RATING'
}

// ========== WRAPPER INTERFACES ==========
export interface CompanyWrapper {
  id?: number;
  name?: string;
  status?: CompanyStatus;
  logoUri?: string;
}

export interface OccurTypeWrapper {
  id?: number;
  name?: string;
  description?: string;
  status?: OccurTypeStatus;
}

export interface UniversalUserWrapper {
  id?: number;
  name?: string;
}

export interface UserWrapper {
  id?: number;
  username?: string;
  email?: string;
  universalUser?: UniversalUserWrapper;
  status?: UserStatus;
}

// ========== ADDRESS & COMPLAINT RELATED ==========
export interface Address {
  street?: string;      // max 128
  number?: string;      // max 8
  district?: string;    // max 64
  complement?: string;  // max 128
  city?: string;        // max 128
  uf?: string;          // max 2
  zipCode?: string;     // max 8
}

export interface ComplaintRequest {
  description?: string; // max 256
  complement?: string;  // max 128
}

export interface Complainant {
  id?: number;
  name?: string;        // max 128
  phone?: string;       // max 16
  email?: string;       // max 128, formato email
  address?: Address;
}

export interface Complaint {
  channel?: ComplaintChannel;
  orderId?: string;
  type?: ComplaintType;
  isAnonymous: boolean;
  complainant?: Complainant;
  request?: ComplaintRequest;
}

// ========== RATE ==========
export interface Rate {
  score?: number;       // float
  comment?: string;
  sentAt?: string;      // date-time
}

// ========== AUDIT ==========
export interface OccurAudit {
  createdAt?: string;      // date-time
  createdBy?: string;
  officializedAt?: string; // date-time
  officializedBy?: string;
  updatedAt?: string;      // date-time
  updatedBy?: string;
  closedAt?: string;       // date-time
  closedBy?: string;
}

// ========== MAIN OCCUR ENTITY ==========
export interface Occur {
  id?: number;
  code?: string;
  company?: CompanyWrapper;
  occurType?: OccurTypeWrapper;
  priority?: Priority;
  status?: OccurStatus;
  opener?: UserWrapper;
  inspector?: UserWrapper;
  occurredDate?: string;    // formato: 'YYYY-MM-DD'
  invoiceNotes?: string[];
  title?: string;
  description?: string;
  complement?: string;
  complaint?: Complaint;
  inspectorReport?: string;
  hasRNCOpened?: boolean;
  hasOpenerAssigned?: boolean;
  hasInspectorAssigned?: boolean;
  hasComplainantAssigned?: boolean;
  closeReason?: string;
  closeStatus?: CloseStatus;
  rate?: Rate;
  audit?: OccurAudit;
}