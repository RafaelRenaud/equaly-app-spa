import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { SessionExpirationService } from "../../core/service/session/session-expiration.service";
import { SidebarComponent } from "../sidebar/sidebar.component";

@Component({
  selector: "app-main-layout",
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: "./main-layout.component.html",
  styleUrls: ["./main-layout.component.scss"],
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  constructor(private sessionExpiration: SessionExpirationService) {}

  ngOnInit(): void {
    this.sessionExpiration.start();
  }

  ngOnDestroy(): void {
    this.sessionExpiration.stop();
  }
}
