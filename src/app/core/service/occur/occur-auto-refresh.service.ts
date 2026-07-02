import { Injectable, OnDestroy } from "@angular/core";
import { Observable, Subject, interval } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class OccurAutoRefreshService implements OnDestroy {
  private readonly REFRESH_INTERVAL_MS = 120000;
  private refreshSubject = new Subject<void>();
  private subscription: any;

  public refresh$: Observable<void> = this.refreshSubject.asObservable();

  private _isInteractionActive: boolean = false;
  private _isModalOpen: boolean = false;

  get isInteractionActive(): boolean {
    return this._isInteractionActive || this._isModalOpen;
  }

  setInteractionActive(active: boolean): void {
    this._isInteractionActive = active;
  }

  setModalOpen(open: boolean): void {
    this._isModalOpen = open;
  }

  constructor() {
    setTimeout(() => {
      this.refreshSubject.next();
      this.subscription = interval(this.REFRESH_INTERVAL_MS).subscribe(() => {
        if (!this.isInteractionActive) {
          this.refreshSubject.next();
        }
      });
    }, this.REFRESH_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}