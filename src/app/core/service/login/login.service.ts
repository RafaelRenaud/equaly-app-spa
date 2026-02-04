import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest } from "../../model/login/login-request.model";
import { Observable, lastValueFrom } from "rxjs";
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

  constructor(private router: Router, public sessionService: SessionService) { }

  login(data: LoginRequest, loginType: string): Observable<LoginResponse> {
    let body;

    if (loginType === "COMPANY_LOGIN") {
      body = new HttpParams()
        .set("password", data.password)
        .set("companyId", data.companyId)
        .set("document", data.document);
    } else {
      if (this.isEmail(data.login)) {
        data.email = data.login;
        body = new HttpParams()
          .set("email", data.email)
          .set("password", data.password);
      } else {
        body = new HttpParams()
          .set("login", data.login)
          .set("password", data.password);
      }
    }

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });

    return this.http.post<LoginResponse>(this.authEndpoint, body.toString(), {
      headers,
    });
  }

  searchCompanies(
    customerDocument: string | null,
    companyAlias: string | null,
    companyDocument: string | null,
    status: string | null,
    page: number | null,
    size: number | null
  ): Observable<LoginCompanySearchResponse> {
    let httpParams = new HttpParams();
    if (customerDocument) {
      httpParams = httpParams.set("userId", customerDocument);
    }
    if (companyAlias) {
      httpParams = httpParams.set("alias", companyAlias);
    }
    if (companyDocument) {
      httpParams = httpParams.set("document", companyDocument);
    }
    if (status) {
      httpParams = httpParams.set("status", status);
    }
    if (page) {
      httpParams = httpParams.set("page", page.toString());
    }
    if (size) {
      httpParams = httpParams.set("size", size.toString());
    }
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.get<LoginCompanySearchResponse>(
      this.companyEndpoint.concat(
        `/companies`
      ),
      {
        headers,
        params: httpParams,
      }
    );
  }

  logout(): Promise<boolean> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.sessionService.getItem("clientKey")!,
      "Authorization": this.sessionService.getItem("Authorization")!,
    });
    return lastValueFrom(this.http.delete(this.authEndpoint.concat("/logout"), { headers })).then(() => {
      sessionStorage.clear();
      return this.router.navigateByUrl("/login", { replaceUrl: true });
    });
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

  private isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
