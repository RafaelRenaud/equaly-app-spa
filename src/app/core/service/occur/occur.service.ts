// occur.service.ts

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CloseOccur } from '../../model/occur/occur-close-request.model';
import { CreatedOccurResponse } from '../../model/occur/occur-create-response.model';
import { CreateUpdateOccur } from '../../model/occur/occur-create-update.model';
import { OccurFilters } from '../../model/occur/occur-filters.model';
import { RateOccur } from '../../model/occur/occur-rate-request.model';
import { ReportOccur } from '../../model/occur/occur-report-request.model';
import { OccurRNCResponse } from '../../model/occur/occur-report-response.model';
import { Occur } from '../../model/occur/occur.model';
import { OccursResponse } from '../../model/occur/occurs-response.model';
import { SessionService } from '../session/session.service';

@Injectable({
  providedIn: 'root'
})
export class OccurService {

  private http = inject(HttpClient);

  private readonly endpoint = `${environment.api.core}/occurs`;

  constructor(private session: SessionService) { }

  /**
   * GET /occurs
   * List Occurrences with pagination and filters
   */
  getOccurs(
    filters?: OccurFilters,
    page: number = 0,
    size: number = 10
  ): Observable<OccursResponse> {
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

    return this.http.get<OccursResponse>(this.endpoint, {
      headers,
      params
    });
  }

  /**
   * POST /occurs
   * Create a Draft or Official Occurrence
   */
  createOccur(occur: CreateUpdateOccur): Observable<CreatedOccurResponse> {
    const headers = this.getDefaultHeaders();

    return this.http.post<CreatedOccurResponse>(
      this.endpoint,
      occur,
      { headers }
    );
  }

  /**
   * GET /occurs/{occur_id}
   * Get Occurrence By ID
   */
  getOccur(occurId: number): Observable<Occur> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}`;

    return this.http.get<Occur>(url, { headers });
  }

  /**
   * PATCH /occurs/{occur_id}
   * Update Draft or Officialize Occurrence Draft By ID
   */
  updateOccur(occurId: number, occur: CreateUpdateOccur): Observable<Occur> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}`;

    return this.http.patch<Occur>(url, occur, { headers });
  }

  /**
   * DELETE /occurs/{occur_id}
   * Delete Draft, Awaiting Edit or Awaiting Edit Occurrence By ID
   */
  deleteOccur(occurId: number): Observable<void> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}`;

    return this.http.delete<void>(url, { headers });
  }

  /**
   * POST /occurs/{occur_id}/report
   * Create an Occur Inspection Report
   */
  reportOccurInspection(occurId: number, report: ReportOccur): Observable<OccurRNCResponse> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}/report`;

    return this.http.post<OccurRNCResponse>(url, report, { headers });
  }

  /**
   * PATCH /occurs/{occur_id}/closure
   * Assign Close Reason and Close Status (if is anonymous)
   */
  closeOccur(occurId: number, closeData: CloseOccur): Observable<Occur> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}/closure`;

    return this.http.patch<Occur>(url, closeData, { headers });
  }

  /**
   * PATCH /occurs/{occur_id}/rating
   * Rate an Awaiting Rating Occur
   */
  rateOccur(occurId: number, rating: RateOccur): Observable<Occur> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/${occurId}/rating`;

    return this.http.patch<Occur>(url, rating, { headers });
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