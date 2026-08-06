import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RncAutoRefreshService {
  private refreshSubject = new Subject<void>();
  private interactionActive = false;
  private modalOpen = false;
  private refreshInterval: any = null;
  private readonly REFRESH_INTERVAL = 120000;

  refresh$ = this.refreshSubject.asObservable();

  constructor() {
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(() => {
      if (!this.interactionActive && !this.modalOpen) {
        this.refreshSubject.next();
      }
    }, this.REFRESH_INTERVAL);
  }

  setInteractionActive(active: boolean): void {
    this.interactionActive = active;
  }


  setModalOpen(open: boolean): void {
    this.modalOpen = open;
  }


  forceRefresh(): void {
    this.refreshSubject.next();
  }


  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }
}