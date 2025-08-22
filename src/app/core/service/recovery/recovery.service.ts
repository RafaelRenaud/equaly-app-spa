import {
  HttpClient,
  HttpHeaders,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SendRecovery } from "../../model/recovery/send-recovery.model";
import { RecoveryData } from "../../model/recovery/recovery-data.model";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RecoveryService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.api.authentication}/recovery`;

  sendRAC(data: SendRecovery): Observable<void> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.post<void>(this.endpoint, JSON.stringify(data), {
      headers,
    });
  }

  accountRecovery(token: string, recoveryData: RecoveryData): Observable<void> {
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
    });

    return this.http.patch<void>(
      this.endpoint.concat("/").concat(token),
      JSON.stringify(recoveryData),
      {
        headers,
      }
    );
  }
}
