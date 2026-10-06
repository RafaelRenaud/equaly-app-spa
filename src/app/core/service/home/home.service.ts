import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { AnalyticsResponse } from "../../model/home-dashboard/home-dashboard.model";
import { SessionService } from "../session/session.service";

@Injectable({
  providedIn: "root",
})
export class HomeService {
  private http = inject(HttpClient);

  private readonly endpoint = `${environment.api.core}/analytics`;

  constructor(private sessionService: SessionService) { }

  private getDefaultHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      "X-Application-Key": this.sessionService.getItem("clientKey")!,
      Authorization: this.sessionService.getItem("Authorization")!,
    });
  }

  getAnalytics(): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(this.endpoint, {
      headers: this.getDefaultHeaders(),
    });
  }

  reloadAnalytics(): Observable<AnalyticsResponse> {
    const headers = this.getDefaultHeaders().set(
      "x-equaly-cache-invalidate",
      "true"
    );
    return this.http.get<AnalyticsResponse>(this.endpoint, { headers });
  }
}