import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { CredentialsResponse } from "../../model/credential/credentials-response.model";
import { Observable } from "rxjs";
import { CredentialResponse } from "../../model/credential/credential-response.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class CredentialService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.administration}/credentials`;

  constructor(private session: SessionService) {}

  getCredentials(
    filterName: string,
    filterValue: string,
    status: string,
    companyId: string | null,
    page: number,
    size: number
  ): Observable<CredentialsResponse> {
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

    if (companyId !== null) {
      params = params.set("credentialCompanyId", companyId);
    }

    return this.http.get<CredentialsResponse>(this.endpoint, {
      headers,
      params,
    });
  }

  getCredential(id: number): Observable<CredentialResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<CredentialResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      {
        headers,
      }
    );
  }

  inactiveCredential(id: number): Observable<void> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.delete<void>(
      this.endpoint.concat("/").concat(id.toString()),
      {
        headers,
      }
    );
  }

  createCredential(
    companyId: number,
    type: string
  ): Observable<{ id: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ id: number }>(
      this.endpoint,
      JSON.stringify({
        companyId: companyId,
        type: type,
      }),
      {
        headers,
      }
    );
  }
}
