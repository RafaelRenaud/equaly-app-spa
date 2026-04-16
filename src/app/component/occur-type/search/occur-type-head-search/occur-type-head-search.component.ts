import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, Subject, debounceTime, of, switchMap, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { OccurTypesResponse } from '../../../../core/model/occurType/occur-types-response.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurTypeService } from '../../../../core/service/occurType/occur-type.service';
import { SessionService } from '../../../../core/service/session/session.service';

@Component({
  selector: 'app-occur-type-head-search',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './occur-type-head-search.component.html',
  styleUrl: './occur-type-head-search.component.scss',
  standalone: true
})
export class OccurTypeHeadSearchComponent {
  @Input() placeholder: string = 'Tipo de Ocorrência';
  @Input() formTouched: boolean = false;
  @Output() occurTypeSelected = new EventEmitter<OccurTypeResponse | null>();
  @ViewChild('typeaheadInput') typeaheadInput!: ElementRef;

  selectedOccurType: OccurTypeResponse | null = null;
  searchText: string = '';
  invalidInput: boolean = false;
  isLoading: boolean = false;

  // Modal properties
  searchedOccurTypes: OccurTypeResponse[] = [];
  selectedFilter: string = 'name';
  searchValue: string = '';
  modalCurrentPage: number = 0;
  modalTotalPages: number = 0;
  modalPageSize: number = 5;
  hasSearched: boolean = false;

  private readonly searchByIdSubject = new Subject<string>();
  private readonly MIN_SEARCH_LENGTH = 3;
  private currentRequestId: number | null = null;

  constructor(
    private occurTypeService: OccurTypeService,
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService
  ) {
    this.setupSearchById();
  }

  @Input() set initialId(value: number | null) {
    if (value && value !== this.currentRequestId) {
      this.currentRequestId = value;
      this.selectedOccurType = null;
      this.searchText = '';
      this.invalidInput = false;
      this.isLoading = true;
      this.cdr.detectChanges();

      this.occurTypeService.getOccurType(value).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.id) {
            this.selectedOccurType = response;
            this.searchText = this.formatOccurType(response);
            this.invalidInput = false;
            this.occurTypeSelected.emit(response);
          } else {
            this.resetSearchState(true);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao buscar tipo de ocorrência:', error);
          this.isLoading = false;
          this.resetSearchState(true);
          this.handleError('Erro ao buscar tipo de ocorrência por ID');
          this.cdr.detectChanges();
        }
      });
    }
  }

  private setupSearchById(): void {
    this.searchByIdSubject
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap((term) => {
          const trimmedTerm = this.safeTrim(term);
          if (this.isNumeric(trimmedTerm)) {
            return this.occurTypeService.getOccurType(parseInt(trimmedTerm, 10)).pipe(
              tap((response) => this.handleSearchByIdResponse(response)),
              map(() => null)
            );
          }
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  private safeTrim(value: string | null | undefined): string {
    return (value ?? '').trim();
  }

  private isNumeric(value: string): boolean {
    return /^\d+$/.test(value.trim());
  }

  private handleSearchByIdResponse(response: OccurTypeResponse | null): void {
    this.isLoading = false;
    if (response?.id) {
      this.selectedOccurType = response;
      this.searchText = this.formatOccurType(response);
      this.invalidInput = false;
      this.occurTypeSelected.emit(response);
    } else {
      this.resetSearchState(true);
    }
    this.cdr.detectChanges();
  }

  private resetSearchState(invalid: boolean = false): void {
    this.selectedOccurType = null;
    this.searchText = '';
    this.invalidInput = invalid;
    this.occurTypeSelected.emit(null);
    this.cdr.detectChanges();
  }

  onInputChange(event: Event): void {
    const inputValue = (event.target as HTMLInputElement)?.value ?? '';

    if (this.selectedOccurType || this.invalidInput) {
      this.resetSearchState();
    }

    this.searchText = inputValue;

    if (!inputValue || inputValue.trim() === '') {
      this.resetSearchState();
    }
  }

  onEnterPressed(): void {
    const term = this.searchText.trim();
    if (!term) return;

    if (this.isNumeric(term)) {
      this.searchByIdSubject.next(term);
    } else if (term.length >= this.MIN_SEARCH_LENGTH && !this.selectedOccurType) {
      this.invalidInput = true;
      this.cdr.detectChanges();
    } else if (term.length < this.MIN_SEARCH_LENGTH) {
      this.invalidInput = true;
      this.cdr.detectChanges();
    }
  }

  searchOccurTypes: OperatorFunction<string, readonly OccurTypeResponse[]> = (
    text$: Observable<string>
  ) =>
    text$.pipe(
      debounceTime(300),
      tap(() => this.isLoading = true),
      switchMap((term) => {
        const trimmedTerm = this.safeTrim(term);

        if (this.isNumeric(trimmedTerm) || trimmedTerm.length < this.MIN_SEARCH_LENGTH) {
          this.isLoading = false;
          return of([]);
        }

        return this.occurTypeService.getOccurTypes(
          'name',
          trimmedTerm,
          Number(this.sessionService.getItem('companyId')),
          'ACTIVE',
          0,
          5
        ).pipe(
          map((response: OccurTypesResponse) => response.occurTypes || []),
          tap(() => this.isLoading = false),
          map((types) => types)
        );
      })
    );

  onSelectItem(event: any): void {
    const selected = event?.item;
    if (selected) {
      this.selectedOccurType = selected;
      this.searchText = this.formatOccurType(selected);
      this.invalidInput = false;
      this.occurTypeSelected.emit(selected);
      this.cdr.detectChanges();
    }
  }

  onInputBlur(): void {
    const term = this.searchText.trim();

    if (!this.selectedOccurType && term) {
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

  inputFormatter = (occurType: OccurTypeResponse | string): string => {
    if (typeof occurType === 'string') return occurType;
    if (occurType?.id) return this.formatOccurType(occurType);
    return this.searchText || '';
  };

  resultFormatter = (occurType: OccurTypeResponse): string =>
    occurType ? this.formatOccurType(occurType) : '';

  private formatOccurType(occurType: OccurTypeResponse): string {
    return occurType ? `${occurType.id} - ${occurType.name}` : '';
  }

  private handleError(message: string): void {
    this.router.navigate([], {
      queryParams: { action: 'ERROR', message },
      queryParamsHandling: 'merge',
    });
  }

  // ==================== MÉTODOS DO MODAL ====================

  openModal(): void {
    this.modalCurrentPage = 0;
    setTimeout(() => this.searchOccurTypesModal(), 100);
  }

  searchOccurTypesModal(): void {
    this.loadingService.show();
    this.hasSearched = true;

    const companyId = Number(this.sessionService.getItem('companyId'));
    const searchTerm = this.searchValue?.trim() || '';

    this.occurTypeService.getOccurTypes(
      this.selectedFilter,
      searchTerm,
      companyId,
      'ACTIVE',
      this.modalCurrentPage,
      this.modalPageSize
    ).subscribe({
      next: (response: OccurTypesResponse) => {
        this.searchedOccurTypes = response.occurTypes || [];
        this.modalTotalPages = response.pageable?.totalPages || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar tipos de ocorrência:', error);
        this.handleError('Erro ao buscar tipos de ocorrência');
        this.searchedOccurTypes = [];
        this.modalTotalPages = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  selectOccurTypeFromModal(occurType: OccurTypeResponse): void {
    this.selectedOccurType = occurType;
    this.searchText = this.formatOccurType(occurType);
    this.invalidInput = false;
    this.occurTypeSelected.emit(occurType);
    this.cdr.detectChanges();

    const modalElement = document.getElementById('occurTypeSearchModal');
    if (modalElement) {
      const modal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
      modal?.hide();
    }
  }

  clearModalFilters(): void {
    this.selectedFilter = 'name';
    this.searchValue = '';
    this.modalCurrentPage = 0;
    this.searchedOccurTypes = [];
    this.hasSearched = false;
    this.modalTotalPages = 0;
    this.cdr.detectChanges();
  }

  goToModalPage(page: number): void {
    if (page < 0 || page >= this.modalTotalPages) return;
    this.modalCurrentPage = page;
    this.searchOccurTypesModal();
  }

  getModalPagesArray(): number[] {
    return Array(this.modalTotalPages).fill(0).map((_, i) => i);
  }
}