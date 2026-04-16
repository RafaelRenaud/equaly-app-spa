/**
 * Interface for Edit Request filters (query parameters)
 */
export interface EditRequestFilters {
  subjectId?: number;
  subjectCode?: string;
  subjectType?: 'OCCUR' | 'RNC';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdUserId?: number;
  updatedUserId?: number;
  assignedUserId?: number;
}