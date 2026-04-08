import { Pageable } from "../util/pageable.model";
import { Occur } from "./occur.model";

export interface OccursResponse {
  occurs: Occur[];
  pageable: Pageable;
}