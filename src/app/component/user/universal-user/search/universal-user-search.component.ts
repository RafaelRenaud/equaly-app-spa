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
import { UniversalUserResponse } from "../../../../core/model/user/universal-user.model";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { UniversalUserService } from "../../../../core/service/user/universal-user.service";

@Component({
  selector: "app-universal-user-search",
  imports: [FormsModule],
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
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;
  notFoundIndicator = false;

  @ViewChild("universalUserSearchInputRef")
  universalUserSearchInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private universalUserService: UniversalUserService,
    private loadingService: LoadingService
  ) {}

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

  searchUniversalUsers(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input?.value || "";

    this.selectedUniversalUser.emit(null);

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    if (value.trim() === "") {
      this.searchedUniversalUsers = [];
      this.validUniversalUserSelected = true;
      return;
    }

    if (value.length <= 1) {
      this.searchedUniversalUsers = [];
      this.validUniversalUserSelected = false;
      return;
    }

    const userId = value.split(" - ")[0];
    const foundUser = this.searchedUniversalUsers.find(
      (u) => u.id.toString() === userId
    );

    if (foundUser) {
      this.selectedUniversalUser.emit(foundUser);
      this.validUniversalUserSelected = true;
    } else {
      this.validUniversalUserSelected = false;
    }

    this.timeoutId = setTimeout(() => {
      this.universalUserService
        .getUsers("name", value, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.searchedUniversalUsers = response.universalUsers;
          },
          error: () => {
            this.searchedUniversalUsers = [];
          },
        });
    }, 1000);
  }

  internalSearchUniversalUsers(): void {
    this.loadingService.show();
    this.universalUserService
      .getUsers(
        this.selectedFilter,
        this.searchValue,
        this.currentPage,
        this.pageSize
      )
      .subscribe((response) => {
        this.searchedUniversalUsers = response.universalUsers;
        this.totalPages = response.pageable.totalPages;
        this.notFoundIndicator = this.searchedUniversalUsers.length === 0;
        this.loadingService.hide();
      });
  }

  clearFilters(): void {
    this.selectedFilter = "NONE";
    this.searchValue = "";
    this.currentPage = 0;
    this.internalSearchUniversalUsers();
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.internalSearchUniversalUsers();
    }
  }

  selectUniversalUserFromModal(universalUser: UniversalUserResponse): void {
    this.selectedUniversalUser.emit(universalUser);

    if (this.universalUserSearchInputRef) {
      this.universalUserSearchInputRef.nativeElement.value = `${universalUser.id} - ${universalUser.name}`;
    }

    this.validUniversalUserSelected = true;
  }
}
