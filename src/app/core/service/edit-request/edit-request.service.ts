import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { SessionService } from "../session/session.service";
import { EditRequestFilters } from "../../model/edit-request/edit-request-filters.model";
import { EditRequestsResponse } from "../../model/edit-request/edit-requests-response.model";
import { Observable } from "rxjs";
import {
  EditRequest,
  EditRequestSubjectType,
} from "../../model/edit-request/edit-request.model";

@Injectable({
  providedIn: "root",
})
export class EditRequestService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.core}/edit-requests`;

  constructor(private session: SessionService) {}

  /**
   * GET /edit-requests
   * List Edit Requests with pagination and filters
   */
  getEditRequests(
    filters?: EditRequestFilters,
    page: number = 0,
    size: number = 10,
  ): Observable<EditRequestsResponse> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<EditRequestsResponse>(this.endpoint, {
      headers: this.getDefaultHeaders(),
      params,
    });
  }

  /**
   * POST /edit-requests
   * Create a new Edit Request
   */
  createEditRequest(
    editRequest: { justification: string },
    subjectId: number,
    subjectType: EditRequestSubjectType,
  ): Observable<{ id: number }> {
    const headers = this.getDefaultHeaders()
      .set("x-equaly-subject-type", subjectType)
      .set("x-equaly-subject-id", subjectId.toString());

    return this.http.post<{ id: number }>(this.endpoint, editRequest, {
      headers,
    });
  }

  /**
   * GET /edit-requests/{edit_request_id}
   * Get Edit Request By ID
   */
  getEditRequest(editRequestId: number): Observable<EditRequest> {
    const url = `${this.endpoint}/${editRequestId}`;
    return this.http.get<EditRequest>(url, {
      headers: this.getDefaultHeaders(),
    });
  }

  /**
   * PATCH /edit-requests/{edit_request_id}
   * Approve or Reject Edit Request By ID
   */
  updateEditRequest(
    editRequestId: string,
    action: "APPROVE" | "DENY",
    subjectType: "OCCUR" | "RNC",
    subjectId: number,
  ): Observable<void> {
    const headers = this.getDefaultHeaders()
      .set("x-equaly-subject-type", subjectType)
      .set("x-equaly-subject-id", subjectId.toString());

    const url = `${this.endpoint}/${editRequestId}`;
    const body = { action };

    return this.http.patch<void>(url, body, { headers });
  }

  /**
   * Utility method to get default headers
   */
  private getDefaultHeaders(): HttpHeaders {
    const clientKey = this.session.getItem("clientKey");
    const authorization = this.session.getItem("Authorization");

    if (!clientKey || !authorization) {
      console.warn(
        "Missing required session items: clientKey or Authorization",
      );
    }

    return new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": clientKey || "",
      Authorization: authorization || "",
    });
  }
}
