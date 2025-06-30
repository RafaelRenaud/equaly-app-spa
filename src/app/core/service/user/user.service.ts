import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserResponse } from "../../model/user/user-response.model";
import { RolesResponse } from "../../model/role/roles-response.model";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private http = inject(HttpClient);
  private readonly endpoint = "/administration/v1/users";

  constructor(private session: SessionService) {}

  getUser(id: string): Observable<UserResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<UserResponse>(this.endpoint.concat("/").concat(id), {
      headers,
    });
  }

  getUserRoles(id: string): Observable<RolesResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<RolesResponse>(
      this.endpoint.concat("/").concat(id).concat("/roles"),
      {
        headers,
      }
    );
  }
}