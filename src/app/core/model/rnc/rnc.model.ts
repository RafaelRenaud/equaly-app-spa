import { OccurWrapper } from "../occur/occur-wrapper.model";
import { CompanyWrapper, UserWrapper } from "../occur/occur.model";
import { RncAudit } from "./rnc-audit.model";


export interface Rnc {
  id: number;
  code: string;
  company: CompanyWrapper;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPENED' | 'WORK_IN_PROGRESS' | 'CLOSED';
  hasFormAssigned: boolean;
  form: {
    id: number;
    code: string;
  };
  inspector: UserWrapper;
  reporter: UserWrapper;
  occur: OccurWrapper;
  audit: RncAudit;
}