import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserResponse } from "../../model/user/user-response.model";
import { RolesResponse } from "../../model/role/roles-response.model";
import { MainProfile } from "../../model/user/main-profile.model";
import { UsersResponse } from "../../model/user/users-response.model";

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

  getUsers(
    filterName: string,
    filterValue: string,
    universalUserId: number | null,
    companyId: number | null,
    departmentId: number | null,
    status: string,
    page: number,
    size: number
  ): Observable<UsersResponse> {
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

    if (universalUserId !== null) {
      params = params.set("userUniversalId", universalUserId.toString());
    }

    if (companyId !== null) {
      params = params.set("userCompanyId", companyId.toString());
    }

    if (departmentId !== null) {
      params = params.set("userDepartmentId", departmentId.toString());
    }

    return this.http.get<UsersResponse>(this.endpoint, {
      headers,
      params,
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

  updateUserProfile(id: string, profileDto: MainProfile): Observable<void> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<void>(
      this.endpoint.concat("/").concat(id),
      JSON.stringify(profileDto),
      {
        headers,
      }
    );
  }

  updateUserAvatar(
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
      this.endpoint.concat("/").concat(id).concat("/avatar"),
      formData,
      {
        headers,
      }
    );
  }

  updateUserStatus(id: number, status: string): Observable<UserResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<UserResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      JSON.stringify({
        status: status,
      }),
      {
        headers,
      }
    );
  }
}
