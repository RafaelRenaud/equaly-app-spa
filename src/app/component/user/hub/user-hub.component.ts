import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import { UsersResponse } from "../../../core/model/user/users-response.model";
import { UserResponse } from "../../../core/model/user/user-response.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { UniversalUserResponse } from "../../../core/model/user/universal-user.model";
import { UserService } from "../../../core/service/user/user.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import { Collapse, Modal } from "bootstrap";
import { FormsModule } from "@angular/forms";
import { SessionService } from "../../../core/service/session/session.service";
import { RecoveryService } from "../../../core/service/recovery/recovery.service";
import { CompanyService } from "../../../core/service/company/company.service";
import { map, switchMap } from "rxjs";
import { DepartmentSearchComponent } from "../../department/search/department-search.component";
import { UniversalUserSearchComponent } from "../universal-user/search/universal-user-search.component";

@Component({
  selector: "app-user-hub",
  imports: [
    CompanySearchComponent,
    RouterModule,
    FormsModule,
    DepartmentSearchComponent,
    UniversalUserSearchComponent,
  ],
  templateUrl: "./user-hub.component.html",
  styleUrl: "./user-hub.component.scss",
})
export class UserHubComponent {
  // Filtros
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Dados
  users: UserResponse[] = [];
  selectedUser: UserResponse | null = null;
  notFoundIndicator = false;

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  selectedCompany: CompanyResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;
  selectedUniversalUser: UniversalUserResponse | null = null;

  //Modal
  userToUpdate: UserResponse | null = null;
  statusToUpdate: "ACTIVE" | "INACTIVE" | null = null;
  confirmModal!: Modal;
  isBrowser = false;

  constructor(
    private userService: UserService,
    private recoveryService: RecoveryService,
    public loadingService: LoadingService,
    public sessionService: SessionService,
    public companyService: CompanyService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchUsers();
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      import("bootstrap").then(({ Modal }) => {
        const modalElement = document.getElementById("confirmStatusModal");
        if (modalElement) {
          this.confirmModal = new Modal(modalElement);
        }
      });
    }
  }

  searchUsers(): void {
    this.loadingService.show();
    this.userService
      .getUsers(
        this.selectedFilter,
        this.searchValue,
        this.selectedUniversalUser ? this.selectedUniversalUser.id : null,
        this.selectedCompany ? this.selectedCompany.id : null,
        this.selectedDepartment ? this.selectedDepartment.id : null,
        this.selectedStatus,
        this.currentPage,
        this.pageSize
      )
      .subscribe((response) => {
        this.users = response.users;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.users.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 0;
    this.selectedCompany = null;
    this.selectedDepartment = null;
    this.selectedUniversalUser = null;
    this.searchUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchUsers();
    }
  }

  openConfirmModal(user: UserResponse, status: "ACTIVE" | "INACTIVE"): void {
    this.userToUpdate = user;
    this.statusToUpdate = status;
    this.confirmModal.show();
  }

  confirmUpdateStatus(): void {
    if (!this.userToUpdate || !this.statusToUpdate) return;

    this.loadingService.show();
    this.userService
      .updateUserStatus(this.userToUpdate.id, this.statusToUpdate)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.router.navigate(["/users"], {
            queryParams: {
              action: "SUCCESS",
              message:
                this.statusToUpdate === "ACTIVE"
                  ? "Usuário reativado com sucesso"
                  : "Usuário inativo com sucesso",
            },
          });
          this.userToUpdate = null;
          this.statusToUpdate = null;
          this.searchUsers();
          this.loadingService.hide();
        },
        error: (error) => {
          this.confirmModal.hide();
          this.router.navigate(["/users"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao inativar usuário",
            },
          });
          this.userToUpdate = null;
          this.statusToUpdate = null;
          this.searchUsers();
          this.loadingService.hide();
        },
      });
  }

  onSelectUserToRecovery(user: UserResponse) {
    this.selectedUser = user;
  }

  confirmRecovery(): void {
    if (!this.selectedUser) return;

    this.loadingService.show();

    this.companyService
      .getCompany(this.selectedUser.id)
      .pipe(
        map((company: CompanyResponse) => company.alias),
        switchMap((alias: string) =>
          this.recoveryService.sendRAC({
            companyAlias: "equaly",
            login: this.selectedUser!.login,
          })
        )
      )
      .subscribe({
        next: () => {
          this.router.navigate(["/users"], {
            queryParams: {
              action: "SUCCESS",
              message: "Código de Recuperação enviado com Sucesso",
            },
          });
          this.userToUpdate = null;
          this.statusToUpdate = null;
          this.searchUsers();
          this.loadingService.hide();
        },
        error: (error) => {
          this.router.navigate(["/users"], {
            queryParams: {
              action: "ERROR",
              message:
                "Erro ao enviado o código de Recuperação, tente novamente mais tarde.",
            },
          });
          this.userToUpdate = null;
          this.statusToUpdate = null;
          this.searchUsers();
          this.loadingService.hide();
        },
      });
  }

  selectUserView(user: UserResponse) {
    this.selectedUser = user;
  }

  onSelectCompany(company: CompanyResponse | null): void {
    this.selectedCompany = company;
  }

  onSelectDepartment(department: DepartmentResponse | null): void {
    this.selectedDepartment = department;
  }

  onSelectUniversalUser(universalUser: UniversalUserResponse | null): void {
    this.selectedUniversalUser = universalUser;
  }
}
