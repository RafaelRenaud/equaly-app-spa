import { Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Modal } from "bootstrap";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "company-app-hub",
  standalone: true,
  imports: [FormsModule],
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
    this.companyService
      .getCompanies(
        this.selectedFilter,
        this.searchValue,
        this.selectedStatus,
        this.currentPage,
        this.pageSize
      )
      .subscribe((response) => {
        this.companies = response.companies;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.companies.length === 0;
        this.loadingService.hide();
      });
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
      .subscribe(() => {
        this.confirmModal.hide();
        this.searchCompanies();
        this.companyToUpdate = null;
        this.statusToUpdate = null;
        this.loadingService.hide();
      });
  }

  selectCompanyView(company: CompanyResponse){
    this.selectedCompany = company;
  }
}
