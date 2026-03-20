import { Component, EventEmitter, Output, ChangeDetectorRef, ViewChild, ElementRef, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, OperatorFunction, debounceTime, switchMap, catchError, of, tap, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { OccurTypeService } from '../../../../core/service/occurType/occur-type.service';
import { SessionService } from '../../../../core/service/session/session.service';
import { OccurTypesResponse } from '../../../../core/model/occurType/occur-types-response.model';

@Component({
  selector: 'app-occur-type-head-search',
  imports: [NgbTypeahead, FormsModule],
  templateUrl: './occur-type-head-search.component.html',
  styleUrl: './occur-type-head-search.component.scss',
  standalone: true
})
export class OccurTypeHeadSearchComponent {

  @Input() placeholder: string = 'Tipo de Ocorrência';
  @Output() occurTypeSelected = new EventEmitter<OccurTypeResponse | null>();
  @ViewChild('typeaheadInput') typeaheadInput!: ElementRef;

  selectedOccurType: OccurTypeResponse | null = null;
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
    private occurTypeService: OccurTypeService,
    private sessionService: SessionService,
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

  private isNumeric(value: string): boolean {
    const safeValue = typeof value === 'string' ? value.trim() : '';
    return /^\d+$/.test(safeValue);
  }

  private searchById(id: number): Observable<OccurTypeResponse | null> {
    return this.occurTypeService.getOccurType(id).pipe(
      tap((response) => this.handleSearchByIdResponse(response)),
      catchError((error) => {
        this.handleError('Erro ao buscar tipo de ocorrência por ID');
        this.resetSearchState();
        return of(null);
      })
    );
  }

  private handleSearchByIdResponse(response: OccurTypeResponse | null): void {
    if (response?.id) {
      this.selectedOccurType = response;
      this.searchText = this.formatOccurType(response);
      this.invalidInput = false;
      this.occurTypeSelected.emit(response);
    } else {
      this.resetSearchState(true);
    }
    this.isLoading = false;
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
  }

  onEnterPressed(): void {
    const term = typeof this.searchText === 'string' ? this.searchText.trim() : '';
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
      tap(() => this.setLoading(true)),
      switchMap((term) => {
        const trimmedTerm = this.safeTrim(term);

        if (this.isNumeric(trimmedTerm) || trimmedTerm.length < this.MIN_SEARCH_LENGTH) {
          return this.setLoading(false).pipe(map(() => []));
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
          tap(() => this.setLoading(false)),
          catchError((error) => {
            this.handleError('Erro ao buscar tipos de ocorrência');
            return this.setLoading(false).pipe(map(() => []));
          })
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
    const term = typeof this.searchText === 'string' ? this.searchText.trim() : '';

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
}