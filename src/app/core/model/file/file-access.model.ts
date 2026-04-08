export interface FileAccessRequest {
  hash: string;
}

export interface FileAccessResponse {
  url?: string;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
}