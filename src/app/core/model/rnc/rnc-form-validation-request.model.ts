// rnc-form-validation-request.model.ts

export interface RncFormValidationRequest {
  status: 'APPROVED' | 'DENIED';
  description: string;
}