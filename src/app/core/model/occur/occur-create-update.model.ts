export interface CreateUpdateOccur {
  occurType: OccurType;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'DRAFT_OPENED' | 'AWAITING_REPORT';
  inspector?: Inspector;
  occurredDate?: string;
  invoiceNotes?: string[];
  title?: string;
  description?: string;
  complement?: string;
  complaint?: CreateUpdateComplaint;
}

export interface OccurType {
  id: number;
}

export interface Inspector {
  id?: number;
}

export interface CreateUpdateComplaint {
  orderId?: string;
  type?: 'INTERNAL' | 'EXTERNAL';
  isAnonymous: boolean;
  complainant?: Complainant;
  request?: ComplaintRequest;
}

export interface Complainant {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: Address;
}

export interface ComplaintRequest {
  description?: string;
  complement?: string;
}

export interface Address {
  street?: string;
  number?: string;
  district?: string;
  complement?: string;
  city?: string;
  uf?: string;
  zipCode?: string;
}