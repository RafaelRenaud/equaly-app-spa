import { Pageable } from "../util/pageable.model";
import { UserResponse } from "./user-response.model";

export interface UsersResponse {
  users: UserResponse[],
  pageable: Pageable
}