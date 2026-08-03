import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgbCollapseModule } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "../../core/service/loading/loading.service";
import { LoginService } from "../../core/service/login/login.service";
import { SessionService } from "../../core/service/session/session.service";

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

  isMenuCollapsed = true;
  isOccurrencesCollapsed = true;
  isRncCollapsed = true;

  private readonly ROLES = {
    EQUALY_MASTER_ADMIN: 'EQUALY_MASTER_ADMIN',
    MASTER_ADMIN: 'MASTER_ADMIN',
    COMMON_ADMIN: 'COMMON_ADMIN',
    MASTER_EVENT_OPENER: 'MASTER_EVENT_OPENER',
    COMMON_EVENT_OPENER: 'COMMON_EVENT_OPENER',
    MASTER_QUALITY_INSPECTOR: 'MASTER_QUALITY_INSPECTOR',
    COMMON_QUALITY_INSPECTOR: 'COMMON_QUALITY_INSPECTOR',
    COMMON_RNC_REPORTER: 'COMMON_RNC_REPORTER'
  } as const;

  constructor(
    public sessionService: SessionService,
    private loginService: LoginService,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.companyLogo = this.sessionService.getItem("companyLogoUrl");
    this.userAvatar = this.sessionService.getItem("userAvatar");
    this.userDisplayName = this.sessionService.getItem("username");
    this.companyDisplayName = this.sessionService.getItem("companyDisplayName");
    this.departmentName = this.sessionService.getItem("departmentName");
  }

  public hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.sessionService.hasRole(role));
  }

  public isMasterAdmin(): boolean {
    return this.sessionService.hasRole(this.ROLES.EQUALY_MASTER_ADMIN);
  }

  public isAdmin(): boolean {
    return this.hasAnyRole([
      this.ROLES.EQUALY_MASTER_ADMIN,
      this.ROLES.MASTER_ADMIN,
      this.ROLES.COMMON_ADMIN
    ]);
  }

  public isEventOpener(): boolean {
    return this.hasAnyRole([
      this.ROLES.MASTER_EVENT_OPENER,
      this.ROLES.COMMON_EVENT_OPENER
    ]);
  }

  public isQualityInspector(): boolean {
    return this.hasAnyRole([
      this.ROLES.MASTER_QUALITY_INSPECTOR,
      this.ROLES.COMMON_QUALITY_INSPECTOR
    ]);
  }

  public isRncReporter(): boolean {
    return this.sessionService.hasRole(this.ROLES.COMMON_RNC_REPORTER);
  }

  public hasCommonEventOpenerOrInspectorAccess(): boolean {
    return this.sessionService.hasRole(this.ROLES.COMMON_EVENT_OPENER) ||
      this.sessionService.hasRole(this.ROLES.COMMON_QUALITY_INSPECTOR);
  }

  public hasCommonReporterOrInspectorAccess(): boolean {
    return this.sessionService.hasRole(this.ROLES.COMMON_RNC_REPORTER) ||
      this.sessionService.hasRole(this.ROLES.COMMON_QUALITY_INSPECTOR);
  }

  hasAdminAccess(): boolean {
    return this.isAdmin();
  }

  hasAdminOrManagerAccess(): boolean {
    return this.isAdmin();
  }

  hasEventOpenerAccess(): boolean {
    return this.isEventOpener();
  }

  hasQualityManagementAccess(): boolean {
    return this.isAdmin() || this.isQualityInspector();
  }

  hasQualityAccess(): boolean {
    return this.isQualityInspector() || this.isRncReporter();
  }

  hasOperationalAccess(): boolean {
    return this.isEventOpener() || this.isQualityInspector() || this.isRncReporter();
  }

  hasOccurOperationalAccess(): boolean {
    return this.isEventOpener() || this.isQualityInspector();
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

  toggleRnc(): void {
    this.isRncCollapsed = !this.isRncCollapsed;
  }
}