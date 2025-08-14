import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { OccurTypeResponse } from "../../../core/model/occurType/occur-type-response.model";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { Modal } from "bootstrap";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
import { SessionService } from "../../../core/service/session/session.service";
import { OccurTypeService } from "../../../core/service/occurType/occur-type.service";
import { isPlatformBrowser } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CompanySearchComponent } from "../../company/search/company-search.component";

@Component({
  selector: "app-occur-type-hub",
  imports: [FormsModule, RouterModule, CompanySearchComponent],
  templateUrl: "./occur-type-hub.component.html",
  styleUrl: "./occur-type-hub.component.scss",
  standalone: true,
})
export class OccurTypeHubComponent {
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
  occurTypes: OccurTypeResponse[] = [];
  selectedCompany: CompanyResponse | null = null;
  selectedOccurType: OccurTypeResponse | null = null;

  //Modal
  occurTypeToUpdate: OccurTypeResponse | null = null;
  statusToUpdate: "ACTIVE" | "INACTIVE" | null = null;
  confirmModal!: Modal;
  isBrowser = false;

  constructor(
    private loadingService: LoadingService,
    private router: Router,
    public sessionService: SessionService,
    private occurTypeService: OccurTypeService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchOccurTypes();
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

  searchOccurTypes(): void {
    this.loadingService.show();
    if (this.selectedFilter === "id") {
      this.occurTypeService.getOccurType(+this.searchValue).subscribe({
        next: (response) => {
          this.occurTypes = Array.of(response);
          this.totalPages = 1;
          this.loadingService.hide();
        },
        error: (err) => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: err.status === 404 ? "WARNING" : "ERROR",
              message:
                err.status === 404
                  ? "Tipo de Ocorrência não encontrada"
                  : "Erro ao buscar Tipo de Ocorrência, contate o time de suporte",
            },
          });
        },
      });
    } else {
      this.loadingService.show();
      this.occurTypeService
        .getOccurTypes(
          this.selectedFilter,
          this.searchValue,
          this.selectedCompany ? this.selectedCompany.id : null,
          this.selectedStatus,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (response) => {
            this.occurTypes = response.occurTypes;
            this.totalPages = response.pageable.totalPages;
            this.notFoundIndicator = this.occurTypes.length === 0;
            this.loadingService.hide();
          },
          error: () => {
            this.loadingService.hide();
            this.router.navigate(["/occur-types"], {
              queryParams: {
                action: "ERROR",
                message:
                  "Erro ao buscar Tipos de Ocorrências, contate o time de suporte",
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
    this.selectedCompany = null;
    this.searchOccurTypes();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchOccurTypes();
    }
  }

  openConfirmModal(
    occurType: OccurTypeResponse,
    status: "ACTIVE" | "INACTIVE"
  ): void {
    this.occurTypeToUpdate = occurType;
    this.statusToUpdate = status;
    this.confirmModal.show();
  }

  confirmUpdateStatus(): void {
    if (!this.occurTypeToUpdate || !this.statusToUpdate) return;

    this.loadingService.show();
    this.occurTypeService
      .updateOccurTypeStatus(this.occurTypeToUpdate.id, this.statusToUpdate)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "SUCCESS",
              message:
                this.statusToUpdate === "ACTIVE"
                  ? "Tipo de Ocorrência reativada com sucesso"
                  : "Tipo de Ocorrência inativa com sucesso",
            },
          });
          this.occurTypeToUpdate = null;
          this.statusToUpdate = null;
          this.searchOccurTypes();
          this.loadingService.hide();
        },
        error: (error) => {
          this.confirmModal.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao inativar tipo de ocorrência",
            },
          });
          this.occurTypeToUpdate = null;
          this.statusToUpdate = null;
          this.searchOccurTypes();
          this.loadingService.hide();
        },
      });
  }

  selectOccurTypeView(occurType: OccurTypeResponse) {
    this.selectedOccurType = occurType;
  }

  onSelectCompany(company: CompanyResponse | null): void {
    this.selectedCompany = company;
  }
}
