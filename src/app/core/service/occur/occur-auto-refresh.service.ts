import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, interval } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OccurAutoRefreshService implements OnDestroy {
  private readonly REFRESH_INTERVAL_MS = 120000; // 2 minutes
  private refreshSubject = new Subject<void>();
  private subscription: any;

  public refresh$: Observable<void> = this.refreshSubject.asObservable();

  constructor() {
    setTimeout(() => {
      this.refreshSubject.next();
      this.subscription = interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
        this.refreshSubject.next();
      });
    }, this.REFRESH_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}