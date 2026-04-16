// edit-request.model.ts

export type EditRequestSubjectType = 'OCCUR' | 'RNC';
export type EditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EditRequest {
    /** Edit Request ID */
    id?: string;
    
    /** Company ID */
    companyId?: number;
    
    /** Edit Request Subject Type */
    subjectType?: EditRequestSubjectType;
    
    /** Edit Request Subject ID */
    subjectId?: number;
    
    /** Edit Request Subject Code */
    subjectCode?: string;
    
    /** Edit Request Justification */
    justification?: string;
    
    /** Edit Request Status */
    status?: EditRequestStatus;
    
    /** Edit Request Creation Datetime */
    createdAt?: string;
    
    /** Edit Request Creation User */
    createdBy?: string;
    
    /** Edit Request Creation User ID */
    createdUserId?: number;
    
    /** Assigned User name */
    assignedTo?: string;
    
    /** Assigned User Id */
    assignedUserId?: number;
    
    /** Edit Request Update Datetime */
    updatedAt?: string;
    
    /** Edit Request Update User */
    updatedBy?: string;
    
    /** Edit Request Approve User ID */
    updatedUserId?: number;
}

// Constantes para os enums (útil para validações)
export const EditRequestSubjectTypeValues: EditRequestSubjectType[] = ['OCCUR', 'RNC'];
export const EditRequestStatusValues: EditRequestStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];