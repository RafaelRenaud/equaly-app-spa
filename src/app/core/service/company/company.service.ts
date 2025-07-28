import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { Observable } from "rxjs";
import { CompaniesResponse } from "../../model/company/companies-response.model";
import { CompanyResponse } from "../../model/company/company-response.model";
import { CompanyCreateRequest } from "../../model/company/company-create.model";

@Injectable({
  providedIn: "root",
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly endpoint = "/administration/v1/companies";

  constructor(private session: SessionService) {}

  getCompanies(
    filterName: string,
    filterValue: string,
    status: string,
    page: number,
    size: number
  ): Observable<CompaniesResponse> {
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

    return this.http.get<CompaniesResponse>(this.endpoint, {
      headers,
      params,
    });
  }

  getCompany(id: number): Observable<CompanyResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<CompanyResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      {
        headers,
      }
    );
  }

  updateCompanyStatus(id: number, status: string): Observable<CompanyResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<CompanyResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      JSON.stringify({
        status: status,
      }),
      {
        headers,
      }
    );
  }

  createCompany(company: CompanyCreateRequest): Observable<{ id: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ id: number }>(
      this.endpoint,
      JSON.stringify(company),
      {
        headers,
      }
    );
  }

  updateCompanyLogo(
    id: string,
    blob: Blob,
    blobName: string
  ): Observable<{ uri: string }> {
    const headers = new HttpHeaders({
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    const formData = new FormData();
    formData.append("file", blob, blobName);

    return this.http.post<{ uri: string }>(
      this.endpoint.concat("/").concat(id).concat("/logo"),
      formData,
      {
        headers,
      }
    );
  }
}
