import { Component } from "@angular/core";
import { SessionExpirationService } from "../../core/service/session/session-expiration.service";

@Component({
  selector: "app-session-expiration-modal",
  standalone: true,
  templateUrl: "./session-expiration-modal.component.html",
})
export class SessionExpirationModalComponent {
  constructor(protected sessionExpiration: SessionExpirationService) {}
}
