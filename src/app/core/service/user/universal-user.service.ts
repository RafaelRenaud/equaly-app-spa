import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { Observable } from "rxjs";
import { UniversalUserResponse } from "../../model/user/universal-user.model";
import { UniversalUsersResponse } from "../../model/user/universal-users-response.model copy";

@Injectable({
  providedIn: "root",
})
export class UniversalUserService {
  private http = inject(HttpClient);
  private readonly endpoint = "/administration/v1/universal_users";

  constructor(private session: SessionService) {}

  getUser(id: string): Observable<UniversalUserResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<UniversalUserResponse>(
      this.endpoint.concat("/").concat(id),
      {
        headers,
      }
    );
  }

  getUsers(
    filterName: string,
    filterValue: string,
    page: number,
    size: number
  ): Observable<UniversalUsersResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    let params = new HttpParams();

    if (filterName !== "NONE") {
      params = params.set(filterName, filterValue);
    }

    if (page !== undefined) {
      params = params.set("page", page);
    }

    if (size !== undefined) {
      params = params.set("size", size);
    }

    return this.http.get<UniversalUsersResponse>(this.endpoint, {
      headers,
      params,
    });
  }
}
