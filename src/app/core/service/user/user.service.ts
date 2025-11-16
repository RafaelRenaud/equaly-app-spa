import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { UserResponse } from "../../model/user/user-response.model";
import { RolesResponse } from "../../model/role/roles-response.model";
import { MainProfile } from "../../model/user/main-profile.model";
import { UsersResponse } from "../../model/user/users-response.model";
import { UserCreateRequest } from "../../model/user/user-create-request.model";
import { UserEditRequest } from "../../model/user/user-edit-request.model";
import { FormArray } from "@angular/forms";
import { RoleResponse } from "../../model/role/role-response.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.administration}/users`;

  constructor(private session: SessionService) {}

  roleNameMapping: Record<string, string> = {
    EQUALY_MASTER_ADMIN: "ADMINISTRADOR MASTER EQUALY",
    MASTER_ADMIN: "ADMINISTRADOR MASTER",
    COMMON_ADMIN: "ADMINISTRADOR",
    MASTER_EVENT_OPENER: "AGENTE DE EVENTOS MASTER",
    COMMON_EVENT_OPENER: "AGENTE DE EVENTOS",
    MASTER_QUALITY_INSPECTOR: "AGENTE DE QUALIDADE MASTER",
    COMMON_QUALITY_INSPECTOR: "AGENTE DE QUALIDADE",
    COMMON_RNC_REPORTER: "PREENCHEDOR DE RNC",
  };

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

  createUser(request: UserCreateRequest): Observable<{ id: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ id: number }>(
      this.endpoint,
      JSON.stringify(request),
      {
        headers,
      }
    );
  }

  createUserRole(id: number, roles: string[]): Observable<{ ids: number[] }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ ids: number[] }>(
      this.endpoint.concat("/").concat(id.toString()).concat("/roles"),
      JSON.stringify({
        roles: roles,
      }),
      {
        headers,
      }
    );
  }

  parseRoles(rolesResponse: RoleResponse[]): string[] {
    return rolesResponse.map(
      (role) => this.roleNameMapping[role.name] || role.name
    );
  }

  updateUser(id: number, request: UserEditRequest): Observable<UserResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<UserResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      JSON.stringify(request),
      {
        headers,
      }
    );
  }
}
