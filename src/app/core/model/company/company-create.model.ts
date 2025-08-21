export interface CompanyCreateRequest {
  name: string;
  alias: string;
  tradingName: string;
  displayName: string;
  document: string; // CNPJ
  contact: string; // E-mail
}
