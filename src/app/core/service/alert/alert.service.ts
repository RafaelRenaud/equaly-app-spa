import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type AlertType = "SUCCESS" | "ERROR" | "WARNING";

export interface AlertPayload {
  type: AlertType;
  message?: string;
}

@Injectable({
  providedIn: "root",
})
export class AlertService {
  private alert$ = new BehaviorSubject<AlertPayload | null>(null);

  show(type: AlertType, message?: string) {
    this.alert$.next({ type, message });
    setTimeout(() => this.alert$.next(null), 5000);
  }

  getAlert() {
    return this.alert$.asObservable();
  }
}
