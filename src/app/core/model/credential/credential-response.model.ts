
export interface CredentialResponse {
  id: number;
  company: {
    id: number;
    name: string;
  };
  value: string;
  type: "ADMINISTRATIVE" | "OPERATIONAL" | string;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt: string,
  createdBy: string,
  disabledAt: string | null;
  disabledBy: string | null;
}