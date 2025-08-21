import { Pageable } from "../util/pageable.model";
import { CompanyResponse } from "./company-response.model";

export interface CompaniesResponse {
  companies: CompanyResponse[]
  pageable: Pageable;
}