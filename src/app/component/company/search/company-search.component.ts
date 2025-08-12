import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-company-search",
  imports: [FormsModule],
  templateUrl: "./company-search.component.html",
  styleUrl: "./company-search.component.scss",
  standalone: true,
})
export class CompanySearchComponent implements OnChanges {
  @Input() selectedCompanyValue: CompanyResponse | null = null; // novo
  @Output() selectedCompany = new EventEmitter<CompanyResponse | null>();

  searchedCompanies: CompanyResponse[] = [];
  private timeoutId: any;
  validCompanySelected: boolean = true;

  // Filtros do Modal
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  notFoundIndicator = false;

  @ViewChild("companySearchInputRef")
  companySearchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private companyService: CompanyService,
    private loadingService: LoadingService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedCompanyValue"] && this.selectedCompanyValue === null) {
      this.clearInput();
    }
  }

  clearInput() {
    if (this.companySearchInputRef) {
      this.companySearchInputRef.nativeElement.value = "";
    }
    this.validCompanySelected = true;
    this.searchedCompanies = [];
  }

  searchCompanies(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || "";

    this.selectedCompany.emit(null);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (value.trim() === "") {
      this.searchedCompanies = [];
      this.validCompanySelected = true;
      return;
    }

    if (value.length <= 1) {
      this.searchedCompanies = [];
      this.validCompanySelected = false;
      return;
    }

    const companyId = value.split(" - ")[0];
    const foundCompany = this.searchedCompanies.find(
      (c) => c.id.toString() === companyId
    );

    if (foundCompany) {
      this.selectedCompany.emit(foundCompany);
      this.validCompanySelected = true;
    } else {
      this.validCompanySelected = false;
    }

    this.timeoutId = setTimeout(() => {
      this.companyService
        .getCompanies("name", value, "ACTIVE", 0, 5)
        .subscribe({
          next: (response) => {
            this.searchedCompanies = response.companies;
          },
          error: () => {
            this.searchedCompanies = [];
          },
        });
    }, 1000);
  }

  internalSearchCompanies(): void {
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
        this.searchedCompanies = response.companies;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.searchedCompanies.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 0;
    this.internalSearchCompanies();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.internalSearchCompanies();
    }
  }

  selectCompanyFromModal(company: CompanyResponse): void {
    this.selectedCompany.emit(company);

    if (this.companySearchInputRef) {
      this.companySearchInputRef.nativeElement.value = `${company.id} - ${company.name}`;
    }

    this.validCompanySelected = true;
  }
}
