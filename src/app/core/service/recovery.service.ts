import { HttpClient, HttpHandler, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SendRecovery } from '../model/send-recovery.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class RecoveryService {
  private http = inject(HttpClient);
  private readonly endpoint = "/authentication/v2/recovery";

  sendRAC(data: SendRecovery): Observable<void> {

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post<void>(this.endpoint, JSON.stringify(data), {
      headers,
    });
    
  }
}
