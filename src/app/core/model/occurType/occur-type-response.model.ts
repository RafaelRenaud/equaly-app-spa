import { Audit } from "../audit/audit.model";

export interface OccurTypeResponse {
  id: number;
  company: {
    id: number;
    name: string;
  }
  name: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | string;
  audit: Audit;
}