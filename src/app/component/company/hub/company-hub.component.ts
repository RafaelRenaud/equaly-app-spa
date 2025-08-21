import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Modal } from "bootstrap";
import { isPlatformBrowser } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
import { response } from "express";

@Component({
  selector: "company-hub",
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: "./company-hub.component.html",
  styleUrl: "./company-hub.component.scss",
})
export class CompanyHubComponent implements OnInit {
  notFoundIndicator = false;

  // Filtros
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Dados
  companies: CompanyResponse[] = [];
  selectedCompany: CompanyResponse | null = null;

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  //Modal
  companyToUpdate: CompanyResponse | null = null;
  statusToUpdate: "ACTIVE" | "INACTIVE" | null = null;
  confirmModal!: Modal;
  isBrowser = false;

  constructor(
    private companyService: CompanyService,
    public loadingService: LoadingService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchCompanies();
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

  searchCompanies(): void {
    this.loadingService.show();

    if (this.selectedFilter === "id") {
      this.companyService.getCompany(+this.searchValue).subscribe({
        next: (response) => {
          this.companies = Array.of(response);
          this.totalPages = 1;
          this.loadingService.hide();
        },
        error: (err) => {
          this.loadingService.hide();
          this.router.navigate(["/companies"], {
            queryParams: {
              action: err.status === 404 ? "WARNING" : "ERROR",
              message:
                err.status === 404
                  ? "Empresa não encontrada"
                  : "Erro ao buscar empresa, contate o time de suporte",
            },
          });
        },
      });
    } else {
      this.companyService
        .getCompanies(
          this.selectedFilter,
          this.searchValue,
          this.selectedStatus,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (response) => {
            this.companies = response.companies;
            this.totalPages = response.pageable.totalPages;
            this.notFoundIndicator = this.companies.length === 0;
            this.loadingService.hide();
          },
          error: (err) => {
            this.loadingService.hide();
            this.router.navigate(["/companies"], {
              queryParams: {
                action: "ERROR",
                message: "Erro ao buscar empresas, contate o time de suporte",
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
    this.currentPage = 0;
    this.searchCompanies();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchCompanies();
    }
  }

  openConfirmModal(
    company: CompanyResponse,
    status: "ACTIVE" | "INACTIVE"
  ): void {
    this.companyToUpdate = company;
    this.statusToUpdate = status;
    this.confirmModal.show();
  }

  confirmUpdateStatus(): void {
    if (!this.companyToUpdate || !this.statusToUpdate) return;

    this.loadingService.show();
    this.companyService
      .updateCompanyStatus(this.companyToUpdate.id, this.statusToUpdate)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.router.navigate(["/companies"], {
            queryParams: {
              action: "SUCCESS",
              message:
                this.statusToUpdate === "ACTIVE"
                  ? "Empresa reativada com sucesso"
                  : "Empresa inativada com sucesso",
            },
          });
          this.companyToUpdate = null;
          this.statusToUpdate = null;
          this.searchCompanies();
          this.loadingService.hide();
        },
        error: (error) => {
          this.confirmModal.hide();
          this.router.navigate(["/companies"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao inativar empresa",
            },
          });
          this.companyToUpdate = null;
          this.statusToUpdate = null;
          this.searchCompanies();
          this.loadingService.hide();
        },
      });
  }

  selectCompanyView(company: CompanyResponse) {
    this.selectedCompany = company;
  }
}
