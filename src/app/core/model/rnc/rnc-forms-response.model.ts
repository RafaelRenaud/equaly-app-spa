// rnc-forms-response.model.ts

import { Pageable } from '../util/pageable.model';
import { RncForm } from './rnc-form.model';

export interface RncFormsResponse {
  forms: RncForm[];
  pageable: Pageable;
}