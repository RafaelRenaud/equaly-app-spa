import { Pageable } from "../util/pageable.model";
import { EditRequest } from "./edit-request.model";

export interface EditRequestsResponse {
  editRequests: EditRequest[];
  pageable: Pageable;
}