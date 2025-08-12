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

@Component({
  selector: "app-department-search",
  imports: [FormsModule],
  templateUrl: "./department-search.component.html",
  styleUrl: "./department-search.component.scss",
  standalone: true,
})
export class DepartmentSearchComponent {
  @Input() selectedDepartmentValue: DepartmentResponse | null = null;
  @Output() selectedDepartment = new EventEmitter<DepartmentResponse | null>();

  searchedDepartments: DepartmentResponse[] = [];
  private timeoutId: any;
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

  searchDepartments(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || "";

    this.selectedDepartment.emit(null);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (value.trim() === "") {
      this.searchedDepartments = [];
      this.validDepartmentSelected = true;
      return;
    }

    if (value.length <= 1) {
      this.searchedDepartments = [];
      this.validDepartmentSelected = false;
      return;
    }

    const departmentId = value.split(" - ")[0];
    const foundDepartment = this.searchedDepartments.find(
      (c) => c.id.toString() === departmentId
    );

    if (foundDepartment) {
      this.selectedDepartment.emit(foundDepartment);
      this.validDepartmentSelected = true;
    } else {
      this.validDepartmentSelected = false;
    }

    this.timeoutId = setTimeout(() => {
      this.departmentService
        .getDepartments("name", value, null, "ACTIVE", 0, 5)
        .subscribe({
          next: (response) => {
            this.searchedDepartments = response.departments;
          },
          error: () => {
            this.searchedDepartments = [];
          },
        });
    }, 1000);
  }

  internalSearchDepartments(): void {
    this.loadingService.show();
    this.departmentService
      .getDepartments(
        this.selectedFilter,
        this.searchValue,
        null,
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
    this.internalSearchDepartments();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.internalSearchDepartments();
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
