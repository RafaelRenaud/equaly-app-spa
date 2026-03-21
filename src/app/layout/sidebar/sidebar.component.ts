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
  isOccurrencesCollapsed = true;

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

  // Métodos auxiliares para verificação de permissões
  hasAdminAccess(): boolean {
    return this.sessionService.hasRole('EQUALY_MASTER_ADMIN') ||
           this.sessionService.hasRole('MASTER_ADMIN') ||
           this.sessionService.hasRole('COMMON_ADMIN');
  }

  hasAdminOrManagerAccess(): boolean {
    return this.sessionService.hasRole('EQUALY_MASTER_ADMIN') ||
           this.sessionService.hasRole('MASTER_ADMIN') ||
           this.sessionService.hasRole('COMMON_ADMIN');
  }

  hasQualityAccess(): boolean {
    return this.sessionService.hasRole('EQUALY_MASTER_ADMIN') ||
           this.sessionService.hasRole('MASTER_ADMIN') ||
           this.sessionService.hasRole('COMMON_ADMIN') ||
           this.sessionService.hasRole('MASTER_QUALITY_INSPECTOR') ||
           this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');
  }

  hasOperationalAccess(): boolean {
    return this.sessionService.hasRole('MASTER_EVENT_OPENER') ||
           this.sessionService.hasRole('COMMON_EVENT_OPENER') ||
           this.sessionService.hasRole('MASTER_QUALITY_INSPECTOR') ||
           this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');
  }

  hasEventOrInspectorAccess(): boolean {
    return this.sessionService.hasRole('COMMON_EVENT_OPENER') ||
           this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');
  }

  logout(event: Event): void {
    event.preventDefault();
    this.loadingService.show();
    this.loginService.logout().then(() => {
      setTimeout(() => this.loadingService.hide(), 500);
    });
  }

  toggleMenu(): void {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  closeMenu(): void {
    if (window.innerWidth < 992) {
      this.isMenuCollapsed = true;
    }
  }

  toggleOccurrences(): void {
    this.isOccurrencesCollapsed = !this.isOccurrencesCollapsed;
  }
}