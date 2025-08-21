import { Pageable } from "../util/pageable.model";
import { Company } from "./login-company.model";

export interface LoginCompanySearchResponse{
    companies : Company[],
    pageable: Pageable
}