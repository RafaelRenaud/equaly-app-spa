import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest } from "../../model/login/login-request.model";
import { Observable } from "rxjs";
import { LoginResponse } from "../../model/login/login-response.model";
import { LoginCompanySearchRequest } from "../../model/login/login-company-search-request.model";
import { LoginCompanySearchResponse } from "../../model/login/login-company-search-response.model";
import { Router } from "@angular/router";
import { SessionService } from "../session/session.service";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class LoginService {
  private http = inject(HttpClient);
  private readonly authEndpoint = `${environment.api.authentication}/oauth/token`;
  private readonly companyEndpoint = `${environment.api.authentication}`;

  constructor(private router: Router, public sessionService: SessionService) {}

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
      this.companyEndpoint.concat(`/${customerDocument}/companies?page=${page}&size=10`),
      {
        headers,
      }
    );
  }

  logout(): Promise<boolean> {
    sessionStorage.clear();
    return this.router.navigateByUrl("/login", { replaceUrl: true });
  }

  refresh(): Observable<LoginResponse> {
    let body = new HttpParams().set(
      "refresh_token",
      this.sessionService.getItem("refreshToken")!
    );

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Application-Key": this.sessionService.getItem("clientKey")!,
      Authorization: this.sessionService.getItem("Authorization")!,
    });

    return this.http.post<LoginResponse>(
      this.authEndpoint.concat("/refresh"),
      body.toString(),
      {
        headers,
      }
    );
  }
}
