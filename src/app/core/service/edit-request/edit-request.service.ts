import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { SessionService } from '../session/session.service';
import { EditRequestFilters } from '../../model/edit-request/edit-request-filters.model';
import { EditRequestsResponse } from '../../model/edit-request/edit-requests-response.model';
import { Observable } from 'rxjs';
import { EditRequest, EditRequestSubjectType } from '../../model/edit-request/edit-request.model';
import { UserResponse } from '../../model/user/user-response.model';

@Injectable({
  providedIn: 'root'
})
export class EditRequestService {

  private http = inject(HttpClient);

  private readonly endpoint = `${environment.api.core}/edit-requests`;

  constructor(private session: SessionService) { }

  /**
   * GET /edit-requests
   * List Edit Requests with pagination and filters
   */
  getEditRequests(
    filters?: EditRequestFilters,
    page: number = 0,
    size: number = 10
  ): Observable<EditRequestsResponse> {
    const headers = this.getDefaultHeaders();

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Adicionar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<EditRequestsResponse>(this.endpoint, {
      headers,
      params
    });
  }

  /**
   * POST /edit-requests
   * Create a new Edit Request
   */
  createEditRequest(editRequest: { justification: string }, subjectId: number, subjectType: EditRequestSubjectType): Observable<{ id: number }> {
    const headers = this.getDefaultHeaders();
    headers.append('x-equaly-subject-type', subjectType);
    headers.append('x-equaly-subject-id', subjectId.toString());

    return this.http.post<{ id: number }>(
      this.endpoint,
      editRequest,
      { headers }
    );
  }

  /**
   * GET /edit-requests/{edit_request_id}
   * Get Edit Request By ID
   */
  getEditRequest(editRequestId: number): Observable<EditRequest> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${editRequestId}`;

    return this.http.get<EditRequest>(url, { headers });
  }

  /**
   * PATCH /edit-requests/{edit_request_id}
   * Approve or Reject Edit Request By ID
   */
  updateEditRequest(
    editRequestId: number,
    action: 'APPROVE' | 'REJECTED',
    subjectType: 'OCCUR' | 'RNC',
    subjectId: number
  ): Observable<void> {
    const headers = this.getDefaultHeaders();
    headers.append('x-equaly-subject-type', subjectType);
    headers.append('x-equaly-subject-id', subjectId.toString());

    const url = `${this.endpoint}/${editRequestId}`;

    const body = { action };

    return this.http.patch<void>(url, body, { headers });
  }

  /**
   * Utility method to get default headers
   */
  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Application-Key': this.session.getItem('clientKey')!,
      'Authorization': this.session.getItem('Authorization')!
    });
  }
}
