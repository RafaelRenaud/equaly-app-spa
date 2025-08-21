import { Pageable } from "../util/pageable.model";
import { DepartmentResponse } from "./department-response.model";

export interface DepartmentsResponse {
  departments: DepartmentResponse[]
  pageable: Pageable;
}