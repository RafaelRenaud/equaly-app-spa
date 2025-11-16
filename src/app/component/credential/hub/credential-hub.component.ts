import { Component, Inject, PLATFORM_ID } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CredentialResponse } from "../../../core/model/credential/credential-response.model";
import { Modal } from "bootstrap";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { CredentialService } from "../../../core/service/credential/credential.service";
import { isPlatformBrowser } from "@angular/common";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { error } from "console";
import { UserSystemPipe } from "../../../pipe/user-system-pipe";

@Component({
  selector: "credential-hub",
  imports: [FormsModule, RouterModule, CompanySearchComponent, UserSystemPipe],
  templateUrl: "./credential-hub.component.html",
  styleUrl: "./credential-hub.component.scss",
  standalone: true,
})
export class CredentialHubComponent {
  notFoundIndicator = false;

  // Filtros
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Dados
  credentials: CredentialResponse[] = [];
  selectedCredential: CredentialResponse | null = null;

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  //Modal
  credentialToInactive: CredentialResponse | null = null;
  confirmModal!: Modal;
  isBrowser = false;

  selectedCompany: CompanyResponse | null = null;

  constructor(
    private credentialService: CredentialService,
    public loadingService: LoadingService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.searchCredentials();
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

  searchCredentials(): void {
    this.loadingService.show();
    
    if (this.selectedFilter === "id") {
      this.credentialService.getCredential(+this.searchValue).subscribe({
        next: (response) => {
          this.credentials = Array.of(response);
          this.totalPages = 1;
          this.loadingService.hide();
        },
        error: (err) => {
          this.loadingService.hide();
          this.router.navigate(["/credentials"], {
            queryParams: {
              action: err.status === 404 ? "WARNING" : "ERROR",
              message:
                err.status === 404
                  ? "Credencial não encontrada"
                  : "Erro ao buscar credencial, contate o time de suporte",
            },
          });
        },
      });
    } else {
      this.loadingService.show();
      this.credentialService
        .getCredentials(
          this.selectedFilter,
          this.searchValue,
          this.selectedStatus,
          this.selectedCompany ? this.selectedCompany.id.toString() : null,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (response) => {
            this.credentials = response.credentials;
            this.totalPages = response.pageable.totalPages;
            this.notFoundIndicator = this.credentials.length === 0;
            this.loadingService.hide();
          },
          error: () => {
            this.loadingService.hide();
            this.router.navigate(["/credentials"], {
              queryParams: {
                action: "ERROR",
                message:
                  "Erro ao buscar credenciais, contate o time de suporte",
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
    this.searchCredentials();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchCredentials();
    }
  }

  openConfirmModal(credential: CredentialResponse): void {
    this.credentialToInactive = credential;
    this.confirmModal.show();
  }

  confirmInactiveStatus(): void {
    if (!this.credentialToInactive) return;

    this.loadingService.show();
    this.credentialService
      .inactiveCredential(this.credentialToInactive.id)
      .subscribe({
        next: () => {
          this.confirmModal.hide();
          this.router.navigate(["/credentials"], {
            queryParams: {
              action: "SUCCESS",
              message: "Credencial inativada com sucesso",
            },
          });
          this.credentialToInactive = null;
          this.searchCredentials();
          this.loadingService.hide();
        },
        error: (error) => {
          this.confirmModal.hide();
          this.router.navigate(["/credentials"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao inativar credencial",
            },
          });
          this.credentialToInactive = null;
          this.searchCredentials();
          this.loadingService.hide();
        },
      });
  }

  selectCredentialView(credential: CredentialResponse) {
    this.selectedCredential = credential;
  }

  onSelectCompany(company: CompanyResponse | null): void {
    this.selectedCompany = company;
  }
}
