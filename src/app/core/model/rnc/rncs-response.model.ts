
import { Pageable } from '../util/pageable.model';
import { Rnc } from './rnc.model';

export interface RncsResponse {
  rncs: Rnc[];
  pageable: Pageable;
}