import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID, signal } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { finalize } from "rxjs";
import { SessionExpirationModalComponent } from "../../../layout/session-expiration/session-expiration-modal.component";
import { LoadingService } from "../loading/loading.service";
import { LoginService } from "../login/login.service";
import { SessionService } from "./session.service";

const WARNING_WINDOW_MS = 10 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

@Injectable({
  providedIn: "root",
})
export class SessionExpirationService {
  readonly minutesLeft = signal(0);
  readonly restarting = signal(false);

  private readonly isBrowser: boolean;
  private timer?: ReturnType<typeof setTimeout>;
  private modalRef?: NgbModalRef;

  constructor(
    private sessionService: SessionService,
    private loginService: LoginService,
    private loadingService: LoadingService,
    private modalService: NgbModal,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  start(): void {
    if (this.isBrowser) {
      this.evaluate();
    }
  }

  stop(): void {
    clearTimeout(this.timer);
    this.closeWarning();
  }

  restart(): void {
    this.restarting.set(true);
    this.loadingService.show();

    this.loginService
      .refresh()
      .pipe(
        finalize(() => {
          this.restarting.set(false);
          this.loadingService.hide();
        })
      )
      .subscribe({
        next: (response) => {
          this.sessionService.saveSessionData(
            response.token_type,
            response.access_token,
            response.refresh_token
          );
          this.evaluate();
        },
        error: () => this.expire(),
      });
  }

  private evaluate(): void {
    clearTimeout(this.timer);

    const remaining = this.sessionService.getAccessTokenRemainingMs();

    if (remaining === null || remaining <= 0) {
      this.expire();
      return;
    }

    if (remaining > WARNING_WINDOW_MS) {
      this.closeWarning();
      this.schedule(remaining - WARNING_WINDOW_MS);
      return;
    }

    const minutes = Math.ceil(remaining / MINUTE_MS);
    this.minutesLeft.set(minutes);
    this.openWarning();
    this.schedule(remaining - (minutes - 1) * MINUTE_MS);
  }

  private schedule(delay: number): void {
    this.timer = setTimeout(() => this.evaluate(), delay);
  }

  private expire(): void {
    this.stop();
    this.loginService.logout();
  }

  private openWarning(): void {
    if (this.modalRef) {
      return;
    }

    this.modalRef = this.modalService.open(SessionExpirationModalComponent, {
      centered: true,
      backdrop: "static",
      keyboard: false,
    });
  }

  private closeWarning(): void {
    this.modalRef?.close();
    this.modalRef = undefined;
  }
}
