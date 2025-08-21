import { Pageable } from "../util/pageable.model";
import { UniversalUserResponse } from "./universal-user.model";

export interface UniversalUsersResponse {
  universalUsers: UniversalUserResponse[],
  pageable: Pageable
}