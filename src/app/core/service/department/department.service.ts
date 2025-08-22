import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { DepartmentsResponse } from "../../model/department/departments-response.model";
import { DepartmentResponse } from "../../model/department/department-response.model";
import { DepartmentCreateRequest } from "../../model/department/department-create.model";
import { DepartmentEditRequest } from "../../model/department/department-edit.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class DepartmentService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.administration}/departments`;

  constructor(private session: SessionService) {}

  getDepartments(
    filterName: string,
    filterValue: string,
    companyId: number | null,
    status: string,
    page: number,
    size: number
  ): Observable<DepartmentsResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    let params = new HttpParams();

    if (filterName !== "NONE") {
      params = params.set(filterName, filterValue);
    }

    if (status !== "NONE") {
      params = params.set("status", status);
    }

    if (page !== undefined) {
      params = params.set("page", page);
    }

    if (size !== undefined) {
      params = params.set("size", size);
    }

    if( companyId !== null) {
      params = params.set("departmentCompanyId", companyId.toString());
    }

    return this.http.get<DepartmentsResponse>(this.endpoint, {
      headers,
      params,
    });
  }

  getDepartment(id: number): Observable<DepartmentResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<DepartmentResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      {
        headers,
      }
    );
  }

  updateDepartmentStatus(
    id: number,
    status: string
  ): Observable<DepartmentResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<DepartmentResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      JSON.stringify({
        status: status,
      }),
      {
        headers,
      }
    );
  }

  createDepartment(
    department: DepartmentCreateRequest
  ): Observable<{ id: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ id: number }>(
      this.endpoint,
      JSON.stringify(department),
      {
        headers,
      }
    );
  }

  updateDepartment(
    id: string,
    company: DepartmentEditRequest
  ): Observable<void> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<void>(
      this.endpoint.concat("/").concat(id),
      JSON.stringify(company),
      {
        headers,
      }
    );
  }
}
