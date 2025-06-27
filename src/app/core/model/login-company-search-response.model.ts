import { Company } from "./login-company.model";
import { Pageable } from "./pageable.model";

export interface LoginCompanySearchResponse{
    companies : Company[],
    pageable: Pageable
}