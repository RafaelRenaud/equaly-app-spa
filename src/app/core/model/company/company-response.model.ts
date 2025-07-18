import { Audit } from "../audit/audit.model";
import { Pageable } from "../util/pageable.model";

export interface CompanyResponse {
  id: number;
  name: string;
  alias: string;
  tradingName: string;
  displayName: string;
  document: string;
  contact: string;
  status: "ACTIVE" | "INACTIVE" | string;
  logoUri: string | null;
  audit: Audit;
}