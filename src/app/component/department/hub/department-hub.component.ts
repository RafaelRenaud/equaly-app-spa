import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
import { SessionService } from "../../../core/service/session/session.service";
import { FormsModule } from "@angular/forms";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { Modal } from "bootstrap";
import { DepartmentService } from "../../../core/service/department/department.service";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "app-department-hub",
  imports: [CompanySearchComponent, RouterModule, FormsModule],
  templateUrl: "./department-hub.component.html",
  styleUrl: "./department-hub.component.scss",
  standalone: true,
})
export class DepartmentHubComponent {
  // Filtros
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  // Dados
  notFoundIndicator = false;
  departments: DepartmentResponse[] = [];
  selectedCompany: CompanyResponse | null = null;
  selectedDepartment: DepartmentResponse | null = null;

  //Modal
  departmentToUpdate: DepartmentResponse | null = null;
  statusToUpdate: "ACTIVE" | "INACTIVE" | null = null;
  confirmModal!: Modal;
  isBrowser = false;

  constructor(
    private loadingService: LoadingService,
    private router: Router,
    public sessionService: SessionService,
    private departmentService: DepartmentService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchDepartments();
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

  searchDepartments(): void {
    this.loadingService.show();
    this.departmentService
      .getDepartments(
        this.selectedFilter,
        this.searchValue,
        this.selectedCompany ? this.selectedCompany.id : null,
        this.selectedStatus,
        this.currentPage,
        this.pageSize
      )
      .subscribe((response) => {
        this.departments = response.departments;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.departments.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 0;
    this.selectedCompany = null;
    this.searchDepartments();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchDepartments();
    }
  }

  openConfirmModal(
    department: DepartmentResponse,
    status: "ACTIVE" | "INACTIVE"
  ): void {
    this.departmentToUpdate = department;
    this.statusToUpdate = status;
    this.confirmModal.show();
  }

  confirmUpdateStatus(): void {
    if (!this.departmentToUpdate || !this.statusToUpdate) return;

    this.loadingService.show();
    this.departmentService
      .updateDepartmentStatus(this.departmentToUpdate.id, this.statusToUpdate)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "SUCCESS",
              message:
                this.statusToUpdate === "ACTIVE"
                  ? "Departamento reativado com sucesso"
                  : "Departamento inativo com sucesso",
            },
          });
          this.departmentToUpdate = null;
          this.statusToUpdate = null;
          this.searchDepartments();
          this.loadingService.hide();
        },
        error: (error) => {
          this.confirmModal.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao inativar departamento",
            },
          });
          this.departmentToUpdate = null;
          this.statusToUpdate = null;
          this.searchDepartments();
          this.loadingService.hide();
        },
      });
  }

  selectDepartmentView(department: DepartmentResponse) {
    this.selectedDepartment = department;
  }

  onSelectCompany(company: CompanyResponse | null): void {
    this.selectedCompany = company;
  }
}
