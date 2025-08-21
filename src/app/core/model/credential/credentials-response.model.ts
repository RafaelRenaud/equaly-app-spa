import { Pageable } from "../util/pageable.model";
import { CredentialResponse } from "./credential-response.model";

export interface CredentialsResponse {
  credentials: CredentialResponse[]
  pageable: Pageable;
}