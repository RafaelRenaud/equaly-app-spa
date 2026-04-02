import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { UserResponse } from '../../../../core/model/user/user-response.model';
import { catchError, debounceTime, distinctUntilChanged, map, Observable, of, OperatorFunction, Subject, switchMap, tap } from 'rxjs';
import { UserService } from '../../../../core/service/user/user.service';
import { Router } from '@angular/router';
import { UsersResponse } from '../../../../core/model/user/users-response.model';

@Component({
  selector: 'app-user-type-head-search',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './user-type-head-search.component.html',
  styleUrl: './user-type-head-search.component.scss',
  standalone: true
})
export class UserTypeHeadSearchComponent {

  @Input() userRole: string[] = [];
  @Input() placeholder: string = 'Buscar Usuário';
  @Output() outputUserSelected = new EventEmitter<UserResponse | null>();
  @ViewChild('typeaheadInput') typeaheadInput!: ElementRef;

  selectedUser: UserResponse | null = null;
  private _searchText: string = '';

  // Getter e Setter para garantir que searchText seja sempre string
  get searchText(): string {
    return this._searchText;
  }

  set searchText(value: string | null | undefined) {
    this._searchText = value ?? '';
  }

  invalidInput: boolean = false;
  isLoading: boolean = false;

  private readonly searchByIdSubject = new Subject<string>();
  private readonly MIN_SEARCH_LENGTH = 3;

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.setupSearchById();
  }

  private setupSearchById(): void {
    this.searchByIdSubject
      .pipe(
        debounceTime(300),
        tap(() => this.setLoading(true)),
        switchMap((term) => {
          const trimmedTerm = this.safeTrim(term);
          return this.isNumeric(trimmedTerm)
            ? this.searchById(parseInt(trimmedTerm, 10))
            : this.setLoading(false);
        })
      )
      .subscribe();
  }

  private safeTrim(value: string | null | undefined): string {
    return (value ?? '').trim();
  }

  private setLoading(loading: boolean): Observable<null> {
    this.isLoading = loading;
    this.cdr.detectChanges();
    return of(null);
  }

  private searchById(id: number): Observable<UserResponse | null> {
    return this.userService.getUser(id.toString()).pipe(
      tap((response) => this.handleSearchByIdResponse(response)),
      catchError((error) => {
        this.isLoading = false;
        this.handleError('Erro ao buscar usuário por ID');
        this.resetSearchState();
        return of(null);
      })
    );
  }

  private handleSearchByIdResponse(response: UserResponse | null): void {
    if (response?.id) {
      // Valida se o usuário tem pelo menos uma das roles necessárias
      const hasRequiredRole = this.userRole.length === 0 ||
        (response.roles?.some(role => this.userRole.includes(role)) ?? false);

      if (!hasRequiredRole) {
        // Usuário não tem a role necessária
        this.resetSearchState(true);
        this.isLoading = false;
        return;
      }

      this.selectedUser = response;
      this.searchText = this.formatUser(response);
      this.invalidInput = false;
      this.outputUserSelected.emit(response);
    } else {
      this.resetSearchState(true);
    }
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private resetSearchState(invalid: boolean = false): void {
    this.selectedUser = null;
    this.searchText = '';
    this.invalidInput = invalid;
    this.outputUserSelected.emit(null);
    this.cdr.detectChanges();
  }

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement)?.value ?? '';

    if (this.selectedUser || this.invalidInput) {
      this.resetSearchState();
    }

    this.searchText = inputValue;
  }

  searchUsers: OperatorFunction<string, readonly UserResponse[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.setLoading(true)),
      switchMap((term) => {
        const trimmedTerm = this.safeTrim(term);

        if (this.isNumeric(trimmedTerm) || trimmedTerm.length < this.MIN_SEARCH_LENGTH) {
          return this.setLoading(false).pipe(map(() => []));
        }

        return this.userService.getUsers(
          'name',
          trimmedTerm,
          null,
          null,
          null,
          'ACTIVE',
          this.userRole,
          0,
          5
        ).pipe(
          map((response: UsersResponse) => response.users || []),
          tap(() => this.setLoading(false)),
          catchError((error) => {
            this.handleError('Erro ao buscar usuários');
            return this.setLoading(false).pipe(map(() => []));
          })
        );
      })
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
    const term = typeof this.searchText === 'string' ? this.searchText.trim() : '';

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
    const term = typeof this.searchText === 'string' ? this.searchText.trim() : '';

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

  private isNumeric(value: string): boolean {
    const safeValue = typeof value === 'string' ? value.trim() : '';
    return /^\d+$/.test(safeValue);
  }

  inputFormatter = (user: UserResponse | string): string => {
    if (typeof user === 'string') return user;
    if (user?.id) return this.formatUser(user);
    return this.searchText || '';
  };

  resultFormatter = (user: UserResponse): string =>
    user ? this.formatUser(user) : '';

  private formatUser(user: UserResponse): string {
    return user ? `${user.id} - ${user.username}` : '';
  }

  private handleError(message: string): void {
    this.router.navigate([], {
      queryParams: { action: 'ERROR', message },
      queryParamsHandling: 'merge',
    });
  }
}