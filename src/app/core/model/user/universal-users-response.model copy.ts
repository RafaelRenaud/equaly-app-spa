import { Audit } from "../audit/audit.model";
import { Pageable } from "../util/pageable.model";
import { UniversalUserResponse } from "./universal-user.model";
import { UserResponse } from "./user-response.model";

export interface UniversalUsersResponse {
  universalUsers: UniversalUserResponse[],
  pageable: Pageable
}