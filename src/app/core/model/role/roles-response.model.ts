import { Pageable } from "../util/pageable.model";
import { RoleResponse } from "./role-response.model";

export interface RolesResponse {
  roles: RoleResponse[];
  pageable: Pageable;
}