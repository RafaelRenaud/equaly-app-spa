import { Audit } from "../audit/audit.model";

export interface UserResponse {
  id: number;
  universalUser: {
    id: number;
    name: string;
    document: string;
    documentType: string;
  };
  company: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  login: string;
  username: string;
  nickname: string;
  email: string;
  status: "ACTIVE" | "INACTIVE" | string;
  lastLoginAt: string; 
  avatarUri: string | null;
  audit: Audit;
}