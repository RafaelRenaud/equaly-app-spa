// occur-wrapper.model.ts;

import { OccurTypeWrapper, UserWrapper } from "./occur.model";

export interface OccurWrapper {
    id: number;
    code: string;
    status: 'DRAFT_OPENED' | 'AWAITING_REPORT' | 'AWAITING_CLOSE' | 'AWAITING_RATING' | 'CLOSED';
    occurType: OccurTypeWrapper;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    opener: UserWrapper;
    inspector: UserWrapper;
    occurredDate: string;
}