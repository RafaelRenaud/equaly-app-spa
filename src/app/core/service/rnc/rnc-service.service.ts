// rnc.service.ts

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SessionService } from '../session/session.service';
import { RncsResponse } from '../../model/rnc/rncs-response.model';
import { Rnc } from '../../model/rnc/rnc.model';
import { UpdateRncRequest } from '../../model/rnc/update-rnc-request.model';
import { RncFormsResponse } from '../../model/rnc/rnc-forms-response.model';
import { RncForm } from '../../model/rnc/rnc-form.model';
import { CreateUpdateRncForm } from '../../model/rnc/rnc-form-create-update.model';
import { RncFormValidationRequest } from '../../model/rnc/rnc-form-validation-request.model';
import { RncFormImplementationRequest } from '../../model/rnc/rnc-form-implementation-request.model';
import { RncFormEfficacyRequest } from '../../model/rnc/rnc-form-efficacy-request.model';
import { RncFilters } from '../../model/rnc/rnc-filters.model';
import { RncFormFilters } from '../../model/rnc/rnc-form-filters.model';

@Injectable({
  providedIn: 'root'
})
export class RncService {

  private http = inject(HttpClient);
  private session = inject(SessionService);

  private readonly endpoint = `${environment.api.core}`;

  /**
   * GET /rncs
   * List RNCs with pagination and filters
   */
  getRncs(
    filters?: RncFilters,
    page: number = 0,
    size: number = 10
  ): Observable<RncsResponse> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rncs`;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<RncsResponse>(url, { headers, params });
  }

  /**
   * GET /rncs/{rnc_id}
   * Get RNC by ID
   */
  getRnc(rncId: number): Observable<Rnc> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rncs/${rncId}`;

    return this.http.get<Rnc>(url, { headers });
  }

  /**
   * PATCH /rncs/{rnc_id}
   * Update RNC by ID
   */
  updateRnc(rncId: number, data: UpdateRncRequest): Observable<Rnc> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rncs/${rncId}`;

    return this.http.patch<Rnc>(url, data, { headers });
  }

  /**
   * GET /rnc_forms
   * List RNC Forms with pagination and filters
   */
  getRncForms(
    filters?: RncFormFilters,
    page: number = 0,
    size: number = 10
  ): Observable<RncFormsResponse> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms`;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<RncFormsResponse>(url, { headers, params });
  }

  /**
   * GET /rnc_forms/{form_id}
   * Get RNC Form by ID
   */
  getRncForm(formId: number): Observable<RncForm> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms/${formId}`;

    return this.http.get<RncForm>(url, { headers });
  }

  /**
   * POST /rnc_forms
   * Create a RNC Form Draft or Send to Validation
   */
  createRncForm(data: CreateUpdateRncForm): Observable<any> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms`;

    return this.http.post<any>(url, data, { headers });
  }

  /**
   * PATCH /rnc_forms/{form_id}
   * Update a RNC Form Draft or Send to Validation
   */
  updateRncForm(formId: number, data: CreateUpdateRncForm): Observable<RncForm> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms/${formId}`;

    return this.http.patch<RncForm>(url, data, { headers });
  }

  /**
   * PATCH /rnc_forms/{form_id}/validations
   * Validate a RNC Form
   */
  validateRncForm(formId: number, data: RncFormValidationRequest): Observable<RncForm> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms/${formId}/validations`;

    return this.http.patch<RncForm>(url, data, { headers });
  }

  /**
   * PATCH /rnc_forms/{form_id}/implementations
   * Implement a RNC Form
   */
  implementRncForm(formId: number, data: RncFormImplementationRequest): Observable<RncForm> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms/${formId}/implementations`;

    return this.http.patch<RncForm>(url, data, { headers });
  }

  /**
   * PATCH /rnc_forms/{form_id}/efficacy
   * Analyse an Efficacy of a RNC Form
   */
  analyseRncForm(formId: number, data: RncFormEfficacyRequest): Observable<RncForm> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rnc_forms/${formId}/efficacy`;

    return this.http.patch<RncForm>(url, data, { headers });
  }

  /**
   * GET /rncs/{rnc_id}/documents
   * Generate RNC PDF File by ID (se existir no futuro)
   */
  generateRncPdf(rncId: number, sendEmail: boolean = false): Observable<any> {
    const headers = this.getDefaultHeaders();
    const url = `${this.endpoint}/rncs/${rncId}/documents`;

    const body = {
      emailIndicator: sendEmail
    };

    return this.http.post<any>(url, body, { headers });
  }


  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Application-Key': this.session.getItem('clientKey')!,
      'Authorization': this.session.getItem('Authorization')!
    });
  }
}