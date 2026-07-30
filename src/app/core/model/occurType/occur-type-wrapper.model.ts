// occur-type-wrapper.model.ts

export interface OccurTypeWrapper {
  id: number;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}