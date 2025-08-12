export interface OccurTypeCreateRequest {
  name: string;
  description: string;
  company: {
    id: number | null;
  }
}