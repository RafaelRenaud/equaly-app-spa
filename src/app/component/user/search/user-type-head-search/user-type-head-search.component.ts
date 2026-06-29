import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal, NgbPaginationModule, NgbTypeahead } from "@ng-bootstrap/ng-bootstrap";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  OperatorFunction,
  Subject,
  switchMap,
  tap,
} from "rxjs";
import { UserResponse } from "../../../../core/model/user/user-response.model";
import { UsersResponse } from "../../../../core/model/user/users-response.model";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { UserService } from "../../../../core/service/user/user.service";

@Component({
  selector: "app-user-type-head-search",
  imports: [NgbTypeahead, FormsModule, NgbPaginationModule],
  templateUrl: "./user-type-head-search.component.html",
  styleUrl: "./user-type-head-search.component.scss",
  standalone: true,
})
export class UserTypeHeadSearchComponent {
  @Input() modalId: string = "userSearchModal";
  @Input() userRole: string[] = [];
  @Input() placeholder: string = "Buscar Usuário";
  @Output() outputUserSelected = new EventEmitter<UserResponse | null>();
  @Output() loadingStateChanged = new EventEmitter<boolean>();
  @ViewChild("typeaheadInput") typeaheadInput!: ElementRef;
  @ViewChild("userSearchModal") userSearchModal!: TemplateRef<any>;

  selectedUser: UserResponse | null = null;
  searchText: string = "";
  invalidInput: boolean = false;
  isLoading: boolean = false;

  // Modal properties
  searchedUsers: UserResponse[] = [];
  selectedFilter: string = "name";
  searchValue: string = "";
  modalCurrentPage: number = 1;
  modalTotalPages: number = 0;
  modalPageSize: number = 5;
  modalCollectionSize: number = 0;
  hasSearched: boolean = false;

  private readonly searchByIdSubject = new Subject<string>();
  private readonly MIN_SEARCH_LENGTH = 3;
  private currentRequestId: number | null = null;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
    private modalService: NgbModal,
  ) {
    this.setupSearchById();
  }

  @Input() set initialId(value: number | null) {
    if (value && value !== this.currentRequestId) {
      this.currentRequestId = value;
      this.selectedUser = null;
      this.searchText = "";
      this.invalidInput = false;
      this.isLoading = true;
      this.loadingStateChanged.emit(true);
      this.cdr.detectChanges();

      this.userService.getUser(value.toString()).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.loadingStateChanged.emit(false);

          if (response?.id) {
            const hasRequiredRole =
              this.userRole.length === 0 ||
              (response.roles?.some((role) => this.userRole.includes(role)) ??
                false);

            if (!hasRequiredRole) {
              this.resetSearchState(true);
              this.handleError("Usuário não possui a role necessária");
              this.cdr.detectChanges();
              return;
            }

            this.selectedUser = response;
            this.searchText = this.formatUser(response);
            this.invalidInput = false;
            this.outputUserSelected.emit(response);
          } else {
            this.resetSearchState(true);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Erro ao buscar usuário:", error);
          this.isLoading = false;
          this.loadingStateChanged.emit(false);
          this.resetSearchState(true);
          this.handleError("Erro ao buscar usuário por ID");
          this.cdr.detectChanges();
        },
      });
    }
  }

  private setupSearchById(): void {
    this.searchByIdSubject
      .pipe(
        debounceTime(300),
        tap(() => {
          this.isLoading = true;
          this.loadingStateChanged.emit(true);
          this.cdr.detectChanges();
        }),
        switchMap((term) => {
          const trimmedTerm = this.safeTrim(term);
          if (this.isNumeric(trimmedTerm)) {
            return this.userService
              .getUser(parseInt(trimmedTerm, 10).toString())
              .pipe(
                tap((response) => this.handleSearchByIdResponse(response)),
                map(() => null),
              );
          }
          this.isLoading = false;
          this.loadingStateChanged.emit(false);
          this.cdr.detectChanges();
          return of(null);
        }),
      )
      .subscribe();
  }

  private safeTrim(value: string | null | undefined): string {
    return (value ?? "").trim();
  }

  private isNumeric(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  private handleSearchByIdResponse(response: UserResponse | null): void {
    this.isLoading = false;
    this.loadingStateChanged.emit(false);

    if (response?.id) {
      const hasRequiredRole =
        this.userRole.length === 0 ||
        (response.roles?.some((role) => this.userRole.includes(role)) ?? false);

      if (!hasRequiredRole) {
        this.resetSearchState(true);
        this.handleError("Usuário não possui a role necessária");
        this.cdr.detectChanges();
        return;
      }

      this.selectedUser = response;
      this.searchText = this.formatUser(response);
      this.invalidInput = false;
      this.outputUserSelected.emit(response);
    } else {
      this.resetSearchState(true);
    }
    this.cdr.detectChanges();
  }

  private resetSearchState(invalid: boolean = false): void {
    this.selectedUser = null;
    this.searchText = "";
    this.invalidInput = invalid;
    this.outputUserSelected.emit(null);
    this.cdr.detectChanges();
  }

  searchUsers: OperatorFunction<string, readonly UserResponse[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isLoading = true;
        this.loadingStateChanged.emit(true);
        this.cdr.detectChanges();
      }),
      switchMap((term) => {
        const trimmedTerm = this.safeTrim(term);

        if (
          this.isNumeric(trimmedTerm) ||
          trimmedTerm.length < this.MIN_SEARCH_LENGTH
        ) {
          this.isLoading = false;
          this.loadingStateChanged.emit(false);
          this.cdr.detectChanges();
          return of([]);
        }

        return this.userService
          .getUsers(
            "name",
            trimmedTerm,
            null,
            null,
            null,
            "ACTIVE",
            this.userRole,
            0,
            5,
          )
          .pipe(
            map((response: UsersResponse) => response.users || []),
            tap(() => {
              this.isLoading = false;
              this.loadingStateChanged.emit(false);
              this.cdr.detectChanges();
            }),
            catchError((error) => {
              this.handleError("Erro ao buscar usuários");
              this.isLoading = false;
              this.loadingStateChanged.emit(false);
              this.cdr.detectChanges();
              return of([]);
            }),
          );
      }),
    );

  onSelectItem(event: any): void {
    const selected = event?.item;
    if (selected) {
      this.selectedUser = selected;
      this.searchText = this.formatUser(selected);
      this.invalidInput = false;
      this.outputUserSelected.emit(selected);
      this.cdr.detectChanges();
    }
  }

  onInputBlur(): void {
    const term =
      typeof this.searchText === "string" ? this.searchText.trim() : "";

    if (!this.selectedUser && term) {
      if (this.isNumeric(term)) {
        this.searchByIdSubject.next(term);
      } else {
        this.invalidInput = true;
        this.cdr.detectChanges();
      }
    } else if (!term) {
      this.invalidInput = false;
      this.cdr.detectChanges();
    }
  }

  onEnterPressed(): void {
    const term =
      typeof this.searchText === "string" ? this.searchText.trim() : "";
    if (!term) return;

    if (this.isNumeric(term)) {
      this.searchByIdSubject.next(term);
    } else if (term.length >= this.MIN_SEARCH_LENGTH && !this.selectedUser) {
      this.invalidInput = true;
      this.cdr.detectChanges();
    } else if (term.length < this.MIN_SEARCH_LENGTH) {
      this.invalidInput = true;
      this.cdr.detectChanges();
    }
  }

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement)?.value ?? "";

    if (this.selectedUser || this.invalidInput) {
      this.resetSearchState();
    }

    this.searchText = inputValue;

    if (!inputValue || inputValue.trim() === "") {
      this.resetSearchState();
    }
  }

  inputFormatter = (user: UserResponse | string): string => {
    if (typeof user === "string") return user;
    if (user?.id) return this.formatUser(user);
    return this.searchText || "";
  };

  resultFormatter = (user: UserResponse): string =>
    user ? this.formatUser(user) : "";

  private formatUser(user: UserResponse): string {
    return user ? `${user.id} - ${user.username}` : "";
  }

  private handleError(message: string): void {
    this.router.navigate([], {
      queryParams: { action: "ERROR", message },
      queryParamsHandling: "merge",
    });
  }

  // ==================== MÉTODOS DO MODAL ====================

  openUserSearchModal(): void {
    this.modalCurrentPage = 1;
    this.searchValue = "";
    this.selectedFilter = "name";
    this.searchedUsers = [];
    this.hasSearched = false;

    const modalRef = this.modalService.open(this.userSearchModal, {
      size: "lg",
      centered: true,
      backdrop: "static",
    });

    setTimeout(() => {
      this.searchUsersModal();
    }, 100);
  }

  searchUsersModal(): void {
    this.loadingService.show();
    this.hasSearched = true;

    const searchTerm = this.searchValue?.trim() || "";

    this.userService
      .getUsers(
        this.selectedFilter,
        searchTerm,
        null,
        null,
        null,
        "ACTIVE",
        this.userRole,
        this.modalCurrentPage - 1,
        this.modalPageSize,
      )
      .subscribe({
        next: (response: UsersResponse) => {
          this.searchedUsers = response.users || [];
          this.modalTotalPages = response.pageable?.totalPages || 0;
          this.modalCollectionSize = response.pageable?.totalElements || 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error("Erro ao buscar usuários:", error);
          this.handleError("Erro ao buscar usuários");
          this.searchedUsers = [];
          this.modalTotalPages = 0;
          this.modalCollectionSize = 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
      });
  }

  selectUserFromModal(user: UserResponse, modalRef: any): void {
    const hasRequiredRole =
      this.userRole.length === 0 ||
      (user.roles?.some((role) => this.userRole.includes(role)) ?? false);

    if (!hasRequiredRole) {
      this.handleError("Usuário não possui a role necessária");
      return;
    }

    this.selectedUser = user;
    this.searchText = this.formatUser(user);
    this.invalidInput = false;
    this.outputUserSelected.emit(user);
    this.cdr.detectChanges();

    modalRef.close();
  }

  clearModalFilters(): void {
    this.selectedFilter = "name";
    this.searchValue = "";
    this.modalCurrentPage = 1;
    this.searchedUsers = [];
    this.hasSearched = false;
    this.modalTotalPages = 0;
    this.modalCollectionSize = 0;
    this.cdr.detectChanges();
    this.searchUsersModal();
  }

  onModalPageChange(page: number): void {
    this.modalCurrentPage = page;
    this.searchUsersModal();
  }

  clear(): void {
    this.selectedUser = null;
    this.searchText = "";
    this.invalidInput = false;
    this.isLoading = false;
    this.loadingStateChanged.emit(false);
    this.outputUserSelected.emit(null);
    this.cdr.detectChanges();
  }
}