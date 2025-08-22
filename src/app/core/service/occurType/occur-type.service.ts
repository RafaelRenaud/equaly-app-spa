import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { SessionService } from "../session/session.service";
import { Observable } from "rxjs";
import { OccurTypesResponse } from "../../model/occurType/occur-types-response.model";
import { OccurTypeResponse } from "../../model/occurType/occur-type-response.model";
import { OccurTypeCreateRequest } from "../../model/occurType/occur-type-create.model";
import { OccurTypeEditRequest } from "../../model/occurType/occur-type-edit.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class OccurTypeService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.administration}/occur_types`;

  constructor(private session: SessionService) {}

  getOccurTypes(
    filterName: string,
    filterValue: string,
    companyId: number | null,
    status: string,
    page: number,
    size: number
  ): Observable<OccurTypesResponse> {
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
      params = params.set("occurTypeCompanyId", companyId.toString());
    }

    return this.http.get<OccurTypesResponse>(this.endpoint, {
      headers,
      params,
    });
  }

  getOccurType(id: number): Observable<OccurTypeResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.get<OccurTypeResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      {
        headers,
      }
    );
  }

  updateOccurTypeStatus(
    id: number,
    status: string
  ): Observable<OccurTypeResponse> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.patch<OccurTypeResponse>(
      this.endpoint.concat("/").concat(id.toString()),
      JSON.stringify({
        status: status,
      }),
      {
        headers,
      }
    );
  }

  createOccurType(occurType: OccurTypeCreateRequest): Observable<{ id: number }> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.session.getItem("clientKey")!,
      Authorization: this.session.getItem("Authorization")!,
    });

    return this.http.post<{ id: number }>(
      this.endpoint,
      JSON.stringify(occurType),
      {
        headers,
      }
    );
  }

  updateOccurType(id: string, company: OccurTypeEditRequest): Observable<void> {
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
