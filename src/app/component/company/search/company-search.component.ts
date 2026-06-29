import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";

@Component({
  selector: "app-company-search",
  imports: [FormsModule, NgbPaginationModule],
  templateUrl: "./company-search.component.html",
  styleUrl: "./company-search.component.scss",
  standalone: true,
})
export class CompanySearchComponent implements OnChanges {
  @Input() selectedCompanyValue: CompanyResponse | null = null;
  @Output() selectedCompany = new EventEmitter<CompanyResponse | null>();

  searchedCompanies: CompanyResponse[] = [];
  validCompanySelected: boolean = true;

  // Filtros do Modal
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Paginação
  currentPage = 1;
  totalPages = 0;
  pageSize = 5;
  collectionSize = 0;
  notFoundIndicator = false;

  @ViewChild("companySearchInputRef")
  companySearchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private companyService: CompanyService,
    private loadingService: LoadingService
  ) { }

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

  searchCompanies(): void {
    this.loadingService.show();
    if (this.selectedFilter === "id") {
      this.companyService
        .getCompany(
          Number(this.searchValue),
        )
        .subscribe({
          next: (response) => {
            this.searchedCompanies = Array.of(response);
            this.totalPages = 1;
            this.collectionSize = 1;
            this.loadingService.hide();
          },
          error: (err) => {
            this.searchedCompanies = [];
            this.totalPages = 0;
            this.collectionSize = 0;
            this.notFoundIndicator = true;
            this.loadingService.hide();
          }
        });
    } else {
      this.companyService
        .getCompanies(
          this.selectedFilter,
          this.searchValue,
          this.selectedStatus,
          this.currentPage - 1,
          this.pageSize
        )
        .subscribe((response) => {
          this.searchedCompanies = response.companies;
          this.totalPages = response.pageable.totalPages;
          this.collectionSize = response.pageable.totalElements || 0;
          this.notFoundIndicator = this.searchedCompanies.length === 0;
          this.loadingService.hide();
        });
    }
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 1;
    this.searchCompanies();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchCompanies();
  }

  selectCompanyFromModal(company: CompanyResponse): void {
    this.selectedCompany.emit(company);

    if (this.companySearchInputRef) {
      this.companySearchInputRef.nativeElement.value = `${company.id} - ${company.name}`;
    }

    this.validCompanySelected = true;
  }
}