// rnc-wrapper.model.ts

import { CompanyWrapper, UserWrapper } from "../occur/occur.model";

export interface RncWrapper {
    id: number;
    code: string;
    company: CompanyWrapper;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPENED' | 'WORK_IN_PROGRESS' | 'CLOSED';
    hasFormAssigned: boolean;
    inspector: UserWrapper;
    reporter: UserWrapper;
}