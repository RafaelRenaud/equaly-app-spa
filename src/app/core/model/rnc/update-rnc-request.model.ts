export interface UpdateRncRequest {
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  reporter?: {
    id: number;
  };
}