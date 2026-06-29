import { isPlatformBrowser } from "@angular/common";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { Modal } from "bootstrap";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { SessionService } from "../../../core/service/session/session.service";
import { UserSystemPipe } from "../../../pipe/user-system-pipe";
import { CompanySearchComponent } from "../../company/search/company-search.component";

@Component({
  selector: "app-department-hub",
  imports: [CompanySearchComponent, RouterModule, FormsModule, UserSystemPipe, NgbPaginationModule],
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
  currentPage = 1;
  totalPages = 0;
  pageSize = 10;
  collectionSize = 0;

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
  ) { }

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
    if (this.selectedFilter === "id") {
      this.departmentService.getDepartment(+this.searchValue).subscribe({
        next: (response) => {
          this.departments = Array.of(response);
          this.totalPages = 1;
          this.collectionSize = 1;
          this.loadingService.hide();
        },
        error: (err) => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: err.status === 404 ? "WARNING" : "ERROR",
              message:
                err.status === 404
                  ? "Departamento não encontrado"
                  : "Erro ao buscar departamento, contate o time de suporte",
            },
          });
        },
      });
    } else {
      this.loadingService.show();
      this.departmentService
        .getDepartments(
          this.selectedFilter,
          this.searchValue,
          this.selectedCompany ? this.selectedCompany.id : null,
          this.selectedStatus,
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe({
          next: (response) => {
            this.departments = response.departments;
            this.totalPages = response.pageable.totalPages;
            this.collectionSize = response.pageable.totalElements || 0;
            this.notFoundIndicator = this.departments.length === 0;
            this.loadingService.hide();
          },
          error: () => {
            this.loadingService.hide();
            this.router.navigate(["/departments"], {
              queryParams: {
                action: "ERROR",
                message:
                  "Erro ao buscar departamentos, contate o time de suporte",
              },
            });
          },
        });
    }
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 1;
    this.selectedCompany = null;
    this.searchDepartments();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchDepartments();
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