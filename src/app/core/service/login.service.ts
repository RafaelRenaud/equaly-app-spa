import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest } from "../model/login-request.model";
import { Observable } from "rxjs";
import { LoginResponse } from "../model/login-response.model";
import { LoginCompanySearchRequest } from "../model/login-company-search-request.model";
import { LoginCompanySearchResponse } from "../model/login-company-search-response.model";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private http = inject(HttpClient);
  private readonly authEndpoint = "/authentication/v2/oauth/token";

  login(data: LoginRequest, loginType: string): Observable<LoginResponse> {
    let body;

    if (loginType === "COMPANY_LOGIN") {
      body = new HttpParams()
        .set("password", data.password)
        .set("companyId", data.companyId)
        .set("document", data.document);
    } else {
      body = new HttpParams()
        .set("login", data.login)
        .set("password", data.password);
    }

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });

    return this.http.post<LoginResponse>(this.authEndpoint, body.toString(), {
      headers,
    });
  }

  searchCompanies(
    data: LoginCompanySearchRequest,
    page: number
  ): Observable<LoginCompanySearchResponse> {
    const customerDocument = data.customerDocument;
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.get<LoginCompanySearchResponse>(
      `/authentication/v2/user/${customerDocument}/companies?page=${page}&size=10`,
      {
        headers,
      }
    );
  }
}
