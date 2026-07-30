// rnc-form-efficacy-request.model.ts

export interface RncFormEfficacyRequest {
    status: 'APPROVED' | 'DENIED';
    description: string;
    efficacy?: {
        deniedStatus: 'VALIDATION_EDITION' | 'IMPLEMENTATION_EDITION';
    };
}