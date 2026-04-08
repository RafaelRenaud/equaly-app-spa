import { Pageable } from "../util/pageable.model";
import { FileResponse } from "./file-response.model";

export interface FilesResponse {
  files: FileResponse[];
  pageable: Pageable;
}