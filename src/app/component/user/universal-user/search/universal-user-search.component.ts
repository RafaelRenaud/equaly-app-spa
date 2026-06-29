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
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { UniversalUserResponse } from "../../../../core/model/user/universal-user.model";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { UniversalUserService } from "../../../../core/service/user/universal-user.service";

@Component({
  selector: "app-universal-user-search",
  imports: [FormsModule, NgbPaginationModule],
  templateUrl: "./universal-user-search.component.html",
  styleUrl: "./universal-user-search.component.scss",
  standalone: true,
})
export class UniversalUserSearchComponent {
  @Input() selectedUniversalUserValue: UniversalUserResponse | null = null;
  @Output() selectedUniversalUser =
    new EventEmitter<UniversalUserResponse | null>();

  searchedUniversalUsers: UniversalUserResponse[] = [];
  private timeoutId: any;
  validUniversalUserSelected: boolean = true;

  // Filtros do Modal
  selectedFilter = "NONE";
  searchValue = "";

  // Paginação
  currentPage = 1;
  totalPages = 0;
  pageSize = 5;
  collectionSize = 0;
  notFoundIndicator = false;

  @ViewChild("universalUserSearchInputRef")
  universalUserSearchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private universalUserService: UniversalUserService,
    private loadingService: LoadingService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes["selectedUniversalUserValue"] &&
      this.selectedUniversalUserValue === null
    ) {
      this.clearInput();
    }
  }

  clearInput() {
    if (this.universalUserSearchInputRef) {
      this.universalUserSearchInputRef.nativeElement.value = "";
    }
    this.validUniversalUserSelected = true;
    this.searchedUniversalUsers = [];
  }

  searchUniversalUsers(): void {
    this.loadingService.show();
    this.universalUserService
      .getUsers(
        this.selectedFilter,
        this.searchValue,
        this.currentPage - 1,
        this.pageSize
      )
      .subscribe((response) => {
        this.searchedUniversalUsers = response.universalUsers;
        this.totalPages = response.pageable.totalPages;
        this.collectionSize = response.pageable.totalElements || 0;
        this.notFoundIndicator = this.searchedUniversalUsers.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.currentPage = 1;
    this.searchUniversalUsers();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchUniversalUsers();
  }

  selectUniversalUserFromModal(universalUser: UniversalUserResponse): void {
    this.selectedUniversalUser.emit(universalUser);

    if (this.universalUserSearchInputRef) {
      this.universalUserSearchInputRef.nativeElement.value = `${universalUser.id} - ${universalUser.name}`;
    }

    this.validUniversalUserSelected = true;
  }
}