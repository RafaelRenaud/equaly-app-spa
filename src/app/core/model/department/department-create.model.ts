export interface DepartmentCreateRequest {
  name: string;
  description: string;
  company: {
    id: number | null;
  }
}