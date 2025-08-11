import { Pageable } from "../util/pageable.model";
import { OccurTypeResponse } from "./occur-type-response.model";

export interface OccurTypesResponse {
  occurTypes: OccurTypeResponse[]
  pageable: Pageable;
}