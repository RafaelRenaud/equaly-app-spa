import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { CompanyResponse } from "../../../core/model/company/company-response.model";

@Component({
  selector: "app-department-search",
  imports: [FormsModule],
  templateUrl: "./department-search.component.html",
  styleUrl: "./department-search.component.scss",
  standalone: true,
})
export class DepartmentSearchComponent {
  @Input() selectedDepartmentValue: DepartmentResponse | null = null;
  @Input() selectedCompany: CompanyResponse | null = null;
  @Output() selectedDepartment = new EventEmitter<DepartmentResponse | null>();

  searchedDepartments: DepartmentResponse[] = [];
  validDepartmentSelected: boolean = true;

  // Filtros do Modal
  selectedFilter = "NONE";
  searchValue = "";
  selectedStatus = "NONE";

  // Paginação
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  notFoundIndicator = false;

  @ViewChild("departmentSearchInputRef")
  departmentSearchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private departmentService: DepartmentService,
    private loadingService: LoadingService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["selectedDepartmentValue"] &&
      this.selectedDepartmentValue === null
    ) {
      this.clearInput();
    }
  }

  clearInput() {
    if (this.departmentSearchInputRef) {
      this.departmentSearchInputRef.nativeElement.value = "";
    }
    this.validDepartmentSelected = true;
    this.searchedDepartments = [];
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
        this.searchedDepartments = response.departments;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.searchedDepartments.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.selectedStatus = "NONE";
    this.currentPage = 0;
    this.searchDepartments();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.searchDepartments();
    }
  }

  selectDepartmentFromModal(department: DepartmentResponse): void {
    this.selectedDepartment.emit(department);

    if (this.departmentSearchInputRef) {
      this.departmentSearchInputRef.nativeElement.value = `${department.id} - ${department.name}`;
    }

    this.validDepartmentSelected = true;
  }
}
