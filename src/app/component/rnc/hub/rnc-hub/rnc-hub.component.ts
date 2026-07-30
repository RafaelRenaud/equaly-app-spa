import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { RncForm } from '../../../../core/model/rnc/rnc-form.model';
import { RncFormsResponse } from '../../../../core/model/rnc/rnc-forms-response.model';
import { Rnc } from '../../../../core/model/rnc/rnc.model';
import { RncsResponse } from '../../../../core/model/rnc/rncs-response.model';
import { UserResponse } from '../../../../core/model/user/user-response.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { RncService } from '../../../../core/service/rnc/rnc-service.service';
import { OccurTypeHeadSearchComponent } from "../../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../../user/search/user-type-head-search/user-type-head-search.component";
import { RncStatusPipe } from '../../../../pipe/rnc-status.pipe';
import { RncFormStatusPipe } from '../../../../pipe/rnc-form-status.pipe';

type SearchType = 'RNC' | 'FORM';

type RncFormFiltersType = {
  rncCode: string;
  formCode: string;
  priority: string;
  content: string;
  validationDescription: string;
  implementationDescription: string;
  efficacyDescription: string;
  startFollowUpDate: string;
  endFollowUpDate: string;
  startValidationDate: string;
  endValidationDate: string;
  startImplementationDate: string;
  endImplementationDate: string;
  startEfficacyDate: string;
  endEfficacyDate: string;
  creationStartDate: string;
  creationEndDate: string;
  updateStartDate: string;
  updateEndDate: string;
  closeStartDate: string;
  closeEndDate: string;
};

type RncFiltersType = {
  rncCode: string;
  priority: string;
  hasFormAssigned: string;
  startOccurredDate: string;
  endOccurredDate: string;
  creationStartDate: string;
  creationEndDate: string;
  updateStartDate: string;
  updateEndDate: string;
  closeStartDate: string;
  closeEndDate: string;
};

@Component({
  selector: 'rnc-hub',
  templateUrl: './rnc-hub.component.html',
  styleUrls: ['./rnc-hub.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    RouterModule,
    NgbAccordionModule,
    NgbPaginationModule,
    UserTypeHeadSearchComponent,
    OccurTypeHeadSearchComponent,
    RncFormStatusPipe
  ],
  standalone: true
})
export class RncHubComponent implements OnInit, AfterViewInit {

  @ViewChildren(UserTypeHeadSearchComponent) typeheadComponents!: QueryList<UserTypeHeadSearchComponent>;
  @ViewChild(OccurTypeHeadSearchComponent) occurTypeheadComponent!: OccurTypeHeadSearchComponent;
  @ViewChildren('dateInput') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  // Tipos de busca
  searchType: SearchType = 'RNC';

  // Resultados
  rncs: Rnc[] = [];
  forms: RncForm[] = [];

  // Seletores
  selectedInspector: UserResponse | null = null;
  selectedReporter: UserResponse | null = null;
  selectedOccurType: OccurTypeResponse | null = null;

  selectedInspectorDisplay: string = '';
  selectedReporterDisplay: string = '';
  selectedOccurTypeDisplay: string = '';

  // Paginação
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  collectionSize: number = 0;

  // Filtros RNC
  rncFilters: RncFiltersType = {
    rncCode: '',
    priority: '',
    hasFormAssigned: '',
    startOccurredDate: '',
    endOccurredDate: '',
    creationStartDate: '',
    creationEndDate: '',
    updateStartDate: '',
    updateEndDate: '',
    closeStartDate: '',
    closeEndDate: ''
  };

  // Filtros Formulário
  formFilters: RncFormFiltersType = {
    rncCode: '',
    formCode: '',
    priority: '',
    content: '',
    validationDescription: '',
    implementationDescription: '',
    efficacyDescription: '',
    startFollowUpDate: '',
    endFollowUpDate: '',
    startValidationDate: '',
    endValidationDate: '',
    startImplementationDate: '',
    endImplementationDate: '',
    startEfficacyDate: '',
    endEfficacyDate: '',
    creationStartDate: '',
    creationEndDate: '',
    updateStartDate: '',
    updateEndDate: '',
    closeStartDate: '',
    closeEndDate: ''
  };

  idFilter: string = '';

  // Status RNC
  selectedRncStatusMap: { [key: string]: boolean } = {
    OPENED: false,
    WORK_IN_PROGRESS: false,
    CLOSED: false
  };

  // Status Formulário
  selectedFormStatusMap: { [key: string]: boolean } = {
    DRAFT_OPENED: false,
    AWAITING_VALIDATION: false,
    VALIDATION_EDITION: false,
    AWAITING_IMPLEMENTATION: false,
    AWAITING_EFFICACY_ANALYSIS: false,
    IMPLEMENTATION_EDITION: false,
    CLOSED: false
  };

  get isIdFilterFilled(): boolean {
    return !!this.idFilter && this.idFilter.trim() !== '';
  }

  private flatpickrInstances: any[] = [];

  constructor(
    private rncService: RncService,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.search();
  }

  ngAfterViewInit(): void {
    this.dateInputs.changes.subscribe(() => {
      this.initDatePickers();
    });
  }

  onTypeheadLoadingChange(): void {
    this.cdr.detectChanges();
  }

  onDataAccordionShown(): void {
    setTimeout(() => {
      this.initDatePickers();
    }, 0);
  }

  private initDatePickers(): void {
    this.destroyDatePickers();

    const dateInputMapping: Record<string, keyof RncFiltersType | keyof RncFormFiltersType> = {
      // RNC dates
      'startOccurredDate': 'startOccurredDate',
      'endOccurredDate': 'endOccurredDate',
      'rncCreationStartDate': 'creationStartDate',
      'rncCreationEndDate': 'creationEndDate',
      'rncUpdateStartDate': 'updateStartDate',
      'rncUpdateEndDate': 'updateEndDate',
      'rncCloseStartDate': 'closeStartDate',
      'rncCloseEndDate': 'closeEndDate',
      // Form dates
      'formCreationStartDate': 'creationStartDate',
      'formCreationEndDate': 'creationEndDate',
      'formUpdateStartDate': 'updateStartDate',
      'formUpdateEndDate': 'updateEndDate',
      'formCloseStartDate': 'closeStartDate',
      'formCloseEndDate': 'closeEndDate',
      'startFollowUpDate': 'startFollowUpDate',
      'endFollowUpDate': 'endFollowUpDate',
      'startValidationDate': 'startValidationDate',
      'endValidationDate': 'endValidationDate',
      'startImplementationDate': 'startImplementationDate',
      'endImplementationDate': 'endImplementationDate',
      'startEfficacyDate': 'startEfficacyDate',
      'endEfficacyDate': 'endEfficacyDate'
    };

    this.dateInputs.forEach(input => {
      const inputElement = input.nativeElement;
      const inputId = inputElement.id;
      const formFilterProperty = dateInputMapping[inputId];

      if (formFilterProperty) {
        const currentValue = this.searchType === 'RNC'
          ? (this.rncFilters as any)[formFilterProperty]
          : (this.formFilters as any)[formFilterProperty];

        const instance = flatpickr(inputElement, {
          locale: Portuguese,
          dateFormat: 'd/m/Y',
          allowInput: true,
          onChange: (dates) => {
            const value = dates[0] ? this.formatDateToYMD(dates[0]) : '';
            if (this.searchType === 'RNC') {
              (this.rncFilters as any)[formFilterProperty] = value;
            } else {
              (this.formFilters as any)[formFilterProperty] = value;
            }
          }
        });

        if (currentValue) {
          const [year, month, day] = currentValue.split('-');
          inputElement.value = `${day}/${month}/${year}`;
          instance.setDate(new Date(Number(year), Number(month) - 1, Number(day)), false);
        }

        this.flatpickrInstances.push(instance);
      }
    });
  }

  private destroyDatePickers(): void {
    this.flatpickrInstances.forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    this.flatpickrInstances = [];
  }

  private formatDateToYMD(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  search(): void {
    if (this.idFilter && this.idFilter.trim() !== '') {
      this.searchById();
      return;
    }

    this.loadingService.show();
    this.currentPage = 1;

    if (this.searchType === 'RNC') {
      this.searchRncs();
    } else {
      this.searchForms();
    }
  }

  private searchRncs(): void {
    const filters = this.prepareRncFilters();

    this.rncService.getRncs(filters, this.currentPage - 1, this.pageSize).subscribe({
      next: (response: RncsResponse) => {
        this.rncs = response.rncs;
        this.forms = [];
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.collectionSize = response.pageable.totalElements || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao buscar RNCs, tente novamente mais tarde.`
          }
        });
        this.rncs = [];
        this.totalPages = 0;
        this.collectionSize = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  private searchForms(): void {
    const filters = this.prepareFormFilters();

    this.rncService.getRncForms(filters, this.currentPage - 1, this.pageSize).subscribe({
      next: (response: RncFormsResponse) => {
        this.forms = response.forms;
        this.rncs = [];
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.collectionSize = response.pageable.totalElements || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao buscar formulários, tente novamente mais tarde.`
          }
        });
        this.forms = [];
        this.totalPages = 0;
        this.collectionSize = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  private prepareRncFilters(): any {
    const filters: any = {};

    if (this.rncFilters.rncCode) {
      filters.rncCode = this.rncFilters.rncCode;
    }

    if (this.selectedInspector) {
      filters.inspectorId = this.selectedInspector.id;
    }

    if (this.selectedReporter) {
      filters.reporterId = this.selectedReporter.id;
    }

    if (this.selectedOccurType) {
      filters.occurTypeId = this.selectedOccurType.id;
    }

    if (this.rncFilters.priority) {
      filters.priority = this.rncFilters.priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (this.rncFilters.hasFormAssigned === 'true') {
      filters.hasFormAssigned = true;
    } else if (this.rncFilters.hasFormAssigned === 'false') {
      filters.hasFormAssigned = false;
    }

    // Datas
    if (this.rncFilters.startOccurredDate) {
      filters.startOccurredDate = this.rncFilters.startOccurredDate;
    }
    if (this.rncFilters.endOccurredDate) {
      filters.endOccurredDate = this.rncFilters.endOccurredDate;
    }
    if (this.rncFilters.creationStartDate) {
      filters.creationStartDate = this.rncFilters.creationStartDate;
    }
    if (this.rncFilters.creationEndDate) {
      filters.creationEndDate = this.rncFilters.creationEndDate;
    }
    if (this.rncFilters.updateStartDate) {
      filters.updateStartDate = this.rncFilters.updateStartDate;
    }
    if (this.rncFilters.updateEndDate) {
      filters.updateEndDate = this.rncFilters.updateEndDate;
    }
    if (this.rncFilters.closeStartDate) {
      filters.closeStartDate = this.rncFilters.closeStartDate;
    }
    if (this.rncFilters.closeEndDate) {
      filters.closeEndDate = this.rncFilters.closeEndDate;
    }

    // Status
    const selectedStatuses = Object.keys(this.selectedRncStatusMap).filter(key => this.selectedRncStatusMap[key]);
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }

    return filters;
  }

  private prepareFormFilters(): any {
    const filters: any = {};

    if (this.formFilters.rncCode) {
      filters.rncCode = this.formFilters.rncCode;
    }

    if (this.formFilters.formCode) {
      filters.formCode = this.formFilters.formCode;
    }

    if (this.selectedInspector) {
      filters.inspectorId = this.selectedInspector.id;
    }

    if (this.selectedReporter) {
      filters.reporterId = this.selectedReporter.id;
    }

    if (this.formFilters.priority) {
      filters.priority = this.formFilters.priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (this.formFilters.content) {
      filters.content = this.formFilters.content;
    }

    if (this.formFilters.validationDescription) {
      filters.validationDescription = this.formFilters.validationDescription;
    }

    if (this.formFilters.implementationDescription) {
      filters.implementationDescription = this.formFilters.implementationDescription;
    }

    if (this.formFilters.efficacyDescription) {
      filters.efficacyDescription = this.formFilters.efficacyDescription;
    }

    // Datas
    const dateFields = [
      'startFollowUpDate', 'endFollowUpDate',
      'startValidationDate', 'endValidationDate',
      'startImplementationDate', 'endImplementationDate',
      'startEfficacyDate', 'endEfficacyDate',
      'creationStartDate', 'creationEndDate',
      'updateStartDate', 'updateEndDate',
      'closeStartDate', 'closeEndDate'
    ];

    dateFields.forEach(field => {
      if ((this.formFilters as any)[field]) {
        filters[field] = (this.formFilters as any)[field];
      }
    });

    // Status
    const selectedStatuses = Object.keys(this.selectedFormStatusMap).filter(key => this.selectedFormStatusMap[key]);
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }

    return filters;
  }

  searchById(): void {
    if (!this.idFilter) {
      this.search();
      return;
    }

    this.loadingService.show();
    this.rncService.getRnc(Number(this.idFilter)).subscribe({
      next: (rnc: Rnc) => {
        this.rncs = [rnc];
        this.forms = [];
        this.totalPages = 1;
        this.totalElements = 1;
        this.collectionSize = 1;
        this.currentPage = 1;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `RNC com ID ${this.idFilter} não encontrada.`
          }
        });
        this.rncs = [];
        this.forms = [];
        this.totalPages = 0;
        this.collectionSize = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  clearFilters(): void {
    // Reset RNC filters
    this.rncFilters = {
      rncCode: '',
      priority: '',
      hasFormAssigned: '',
      startOccurredDate: '',
      endOccurredDate: '',
      creationStartDate: '',
      creationEndDate: '',
      updateStartDate: '',
      updateEndDate: '',
      closeStartDate: '',
      closeEndDate: ''
    };

    // Reset Form filters
    this.formFilters = {
      rncCode: '',
      formCode: '',
      priority: '',
      content: '',
      validationDescription: '',
      implementationDescription: '',
      efficacyDescription: '',
      startFollowUpDate: '',
      endFollowUpDate: '',
      startValidationDate: '',
      endValidationDate: '',
      startImplementationDate: '',
      endImplementationDate: '',
      startEfficacyDate: '',
      endEfficacyDate: '',
      creationStartDate: '',
      creationEndDate: '',
      updateStartDate: '',
      updateEndDate: '',
      closeStartDate: '',
      closeEndDate: ''
    };

    Object.keys(this.selectedRncStatusMap).forEach(key => {
      this.selectedRncStatusMap[key] = false;
    });

    Object.keys(this.selectedFormStatusMap).forEach(key => {
      this.selectedFormStatusMap[key] = false;
    });

    this.selectedInspector = null;
    this.selectedReporter = null;
    this.selectedOccurType = null;

    this.selectedInspectorDisplay = '';
    this.selectedReporterDisplay = '';
    this.selectedOccurTypeDisplay = '';
    this.idFilter = '';
    this.currentPage = 1;
    this.searchType = 'RNC';

    this.typeheadComponents.forEach(typehead => typehead.clear());
    if (this.occurTypeheadComponent) {
      this.occurTypeheadComponent.clear();
    }

    this.dateInputs.forEach(input => {
      if (input && input.nativeElement) {
        input.nativeElement.value = '';
      }
    });

    this.search();
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadingService.show();

    if (this.searchType === 'RNC') {
      const filters = this.prepareRncFilters();
      this.rncService.getRncs(filters, this.currentPage - 1, this.pageSize).subscribe({
        next: (response: RncsResponse) => {
          this.rncs = response.rncs;
          this.totalPages = response.pageable.totalPages;
          this.totalElements = response.pageable.totalElements;
          this.collectionSize = response.pageable.totalElements || 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
      });
    } else {
      const filters = this.prepareFormFilters();
      this.rncService.getRncForms(filters, this.currentPage - 1, this.pageSize).subscribe({
        next: (response: RncFormsResponse) => {
          this.forms = response.forms;
          this.totalPages = response.pageable.totalPages;
          this.totalElements = response.pageable.totalElements;
          this.collectionSize = response.pageable.totalElements || 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
      });
    }
  }

  onInspectorSelected(inspector: UserResponse | null): void {
    if (inspector) {
      this.selectedInspector = inspector;
      this.selectedInspectorDisplay = `${inspector.id} - ${inspector.username}`;
    } else {
      this.selectedInspector = null;
      this.selectedInspectorDisplay = '';
    }
    this.cdr.detectChanges();
  }

  onReporterSelected(reporter: UserResponse | null): void {
    if (reporter) {
      this.selectedReporter = reporter;
      this.selectedReporterDisplay = `${reporter.id} - ${reporter.username}`;
    } else {
      this.selectedReporter = null;
      this.selectedReporterDisplay = '';
    }
    this.cdr.detectChanges();
  }

  onOccurTypeSelected(occurType: OccurTypeResponse | null): void {
    if (occurType) {
      this.selectedOccurType = occurType;
      this.selectedOccurTypeDisplay = `${occurType.id} - ${occurType.name}`;
    } else {
      this.selectedOccurType = null;
      this.selectedOccurTypeDisplay = '';
    }
    this.cdr.detectChanges();
  }

  changeSearchType(type: SearchType): void {
    this.searchType = type;
    this.currentPage = 1;
    this.search();
  }

  get rncCodeFilter(): string {
    return this.searchType === 'RNC' ? this.rncFilters.rncCode : this.formFilters.rncCode;
  }

  set rncCodeFilter(value: string) {
    if (this.searchType === 'RNC') {
      this.rncFilters.rncCode = value;
    } else {
      this.formFilters.rncCode = value;
    }
  }

  get priorityFilter(): string {
    return this.searchType === 'RNC' ? this.rncFilters.priority : this.formFilters.priority;
  }

  set priorityFilter(value: string) {
    if (this.searchType === 'RNC') {
      this.rncFilters.priority = value;
    } else {
      this.formFilters.priority = value;
    }
  }

  getProblemDisplay(form: RncForm): string {
    if (!form.analysis?.problem) {
      return '-';
    }
    const problem = form.analysis.problem;
    return problem.length > 40 ? problem.substring(0, 40) + '...' : problem;
  }
}