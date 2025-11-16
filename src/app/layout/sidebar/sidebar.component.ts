import { Component } from "@angular/core";
import { SessionService } from "../../core/service/session/session.service";
import { RouterModule } from "@angular/router";
import { LoginService } from "../../core/service/login/login.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-sidebar",
  standalone: true,
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  imports: [RouterModule, NgbCollapseModule],
})
export class SidebarComponent {
  companyLogo: string | null = null;
  userAvatar: string | null = null;
  userDisplayName: string | null = null;
  companyDisplayName: string | null = null;
  departmentName: string | null = null;

  isMenuCollapsed = true; // controla collapse mobile

  constructor(
    public sessionService: SessionService,
    private loginService: LoginService,
    private loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.companyLogo = this.sessionService.getItem("companyLogoUrl");
    this.userAvatar = this.sessionService.getItem("userAvatar");
    this.userDisplayName = this.sessionService.getItem("username");
    this.companyDisplayName = this.sessionService.getItem("companyDisplayName");
    this.departmentName = this.sessionService.getItem("departmentName");
  }

  logout(event: Event): void {
    event.preventDefault();
    this.loadingService.show();
    this.loginService.logout().then(() => {
      setTimeout(() => this.loadingService.hide(), 500);
    });
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu() {
    this.isMenuCollapsed = true;
  }
}
