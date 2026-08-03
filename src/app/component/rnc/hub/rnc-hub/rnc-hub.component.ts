import { CommonModule, DatePipe } from '@angular/common';
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
import { RncFormStatusPipe } from '../../../../pipe/rnc-form-status.pipe';
import { OccurTypeHeadSearchComponent } from "../../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../../user/search/user-type-head-search/user-type-head-search.component";
import { RncFilters } from '../../../../core/model/rnc/rnc-filters.model';
import { RncFormFilters } from '../../../../core/model/rnc/rnc-form-filters.model';
import { RncStatusPipe } from '../../../../pipe/rnc-status.pipe';
import { SessionService } from '../../../../core/service/session/session.service';

type SearchType = 'RNC' | 'FORM';

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
    RncStatusPipe,
    RncFormStatusPipe
  ],
  standalone: true
})
export class RncHubComponent implements OnInit, AfterViewInit {

  @ViewChildren(UserTypeHeadSearchComponent) typeheadComponents!: QueryList<UserTypeHeadSearchComponent>;
  @ViewChild(OccurTypeHeadSearchComponent) occurTypeheadComponent!: OccurTypeHeadSearchComponent;
  @ViewChildren('dateInput') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  searchType: SearchType = 'RNC';

  // Resultados
  rncs: Rnc[] = [];
  forms: RncForm[] = [];

  restrictedView: boolean = false;

  // Seletores
  selectedInspector: UserResponse | null = null;
  selectedReporter: UserResponse | null = null;
  selectedOccurType: OccurTypeResponse | null = null;
  selectedOccurOpener: UserResponse | null = null;
  selectedOccurInspector: UserResponse | null = null;

  selectedInspectorDisplay: string = '';
  selectedReporterDisplay: string = '';
  selectedOccurTypeDisplay: string = '';
  selectedOccurOpenerDisplay: string = '';
  selectedOccurInspectorDisplay: string = '';

  // Paginação
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  collectionSize: number = 0;

  rncFilters: RncFilters = {
    rncCode: undefined,
    priority: undefined,
    hasFormAssigned: undefined,
    occurId: undefined,
    occurCode: undefined,
    occurOpenerId: undefined,
    occurInspectorId: undefined,
    startOccurredDate: undefined,
    endOccurredDate: undefined,
    creationStartDate: undefined,
    creationEndDate: undefined,
    updateStartDate: undefined,
    updateEndDate: undefined,
    closeStartDate: undefined,
    closeEndDate: undefined
  };

  formFilters: RncFormFilters = {
    rncId: undefined,
    rncCode: undefined,
    formCode: undefined,
    priority: undefined,
    content: undefined,
    validationDescription: undefined,
    implementationDescription: undefined,
    efficacyDescription: undefined,
    startFollowUpDate: undefined,
    endFollowUpDate: undefined,
    startValidationDate: undefined,
    endValidationDate: undefined,
    startImplementationDate: undefined,
    endImplementationDate: undefined,
    startEfficacyDate: undefined,
    endEfficacyDate: undefined,
    creationStartDate: undefined,
    creationEndDate: undefined,
    updateStartDate: undefined,
    updateEndDate: undefined,
    closeStartDate: undefined,
    closeEndDate: undefined
  };

  idFilter: string = '';

  selectedRncStatusMap: { [key: string]: boolean } = {
    OPENED: false,
    WORK_IN_PROGRESS: false,
    CLOSED: false
  };

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

  get rncCodeFilter(): string {
    return this.searchType === 'RNC' ? (this.rncFilters.rncCode || '') : (this.formFilters.rncCode || '');
  }

  set rncCodeFilter(value: string) {
    if (this.searchType === 'RNC') {
      this.rncFilters.rncCode = value || undefined;
    } else {
      this.formFilters.rncCode = value || undefined;
    }
  }

  get priorityFilter(): string {
    return this.searchType === 'RNC' ? (this.rncFilters.priority || '') : (this.formFilters.priority || '');
  }

  set priorityFilter(value: string) {
    const typedValue = value as 'LOW' | 'MEDIUM' | 'HIGH' | undefined;
    if (this.searchType === 'RNC') {
      this.rncFilters.priority = value ? typedValue : undefined;
    } else {
      this.formFilters.priority = value ? typedValue : undefined;
    }
  }

  get rncOccurIdFilter(): string {
    return this.rncFilters.occurId?.toString() || '';
  }

  set rncOccurIdFilter(value: string) {
    this.rncFilters.occurId = value ? parseInt(value, 10) : undefined;
  }

  get rncOccurCodeFilter(): string {
    return this.rncFilters.occurCode || '';
  }

  set rncOccurCodeFilter(value: string) {
    this.rncFilters.occurCode = value || undefined;
  }

  get hasFormAssignedFilter(): string {
    if (this.rncFilters.hasFormAssigned === true) return 'true';
    if (this.rncFilters.hasFormAssigned === false) return 'false';
    return '';
  }

  set hasFormAssignedFilter(value: string) {
    if (value === 'true') {
      this.rncFilters.hasFormAssigned = true;
    } else if (value === 'false') {
      this.rncFilters.hasFormAssigned = false;
    } else {
      this.rncFilters.hasFormAssigned = undefined;
    }
  }

  get formRncIdFilter(): string {
    return this.formFilters.rncId?.toString() || '';
  }

  set formRncIdFilter(value: string) {
    this.formFilters.rncId = value ? parseInt(value, 10) : undefined;
  }

  private flatpickrInstances: any[] = [];

  constructor(
    private rncService: RncService,
    private loadingService: LoadingService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.restrictedView = !this.sessionService.hasRole('MASTER_QUALITY_INSPECTOR');
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

    const dateInputMapping: Record<string, { type: 'RNC' | 'FORM', property: string }> = {
      'rncStartOccurredDate': { type: 'RNC', property: 'startOccurredDate' },
      'rncEndOccurredDate': { type: 'RNC', property: 'endOccurredDate' },
      'rncCreationStartDate': { type: 'RNC', property: 'creationStartDate' },
      'rncCreationEndDate': { type: 'RNC', property: 'creationEndDate' },
      'rncUpdateStartDate': { type: 'RNC', property: 'updateStartDate' },
      'rncUpdateEndDate': { type: 'RNC', property: 'updateEndDate' },
      'rncCloseStartDate': { type: 'RNC', property: 'closeStartDate' },
      'rncCloseEndDate': { type: 'RNC', property: 'closeEndDate' },
      'formCreationStartDate': { type: 'FORM', property: 'creationStartDate' },
      'formCreationEndDate': { type: 'FORM', property: 'creationEndDate' },
      'formUpdateStartDate': { type: 'FORM', property: 'updateStartDate' },
      'formUpdateEndDate': { type: 'FORM', property: 'updateEndDate' },
      'formCloseStartDate': { type: 'FORM', property: 'closeStartDate' },
      'formCloseEndDate': { type: 'FORM', property: 'closeEndDate' },
      'startFollowUpDate': { type: 'FORM', property: 'startFollowUpDate' },
      'endFollowUpDate': { type: 'FORM', property: 'endFollowUpDate' },
      'startValidationDate': { type: 'FORM', property: 'startValidationDate' },
      'endValidationDate': { type: 'FORM', property: 'endValidationDate' },
      'startImplementationDate': { type: 'FORM', property: 'startImplementationDate' },
      'endImplementationDate': { type: 'FORM', property: 'endImplementationDate' },
      'startEfficacyDate': { type: 'FORM', property: 'startEfficacyDate' },
      'endEfficacyDate': { type: 'FORM', property: 'endEfficacyDate' }
    };

    this.dateInputs.forEach(input => {
      const inputElement = input.nativeElement;
      const inputId = inputElement.id;
      const mapping = dateInputMapping[inputId];

      if (mapping) {
        const filterObj = mapping.type === 'RNC' ? this.rncFilters : this.formFilters;
        const currentValue = (filterObj as any)[mapping.property] || '';

        const instance = flatpickr(inputElement, {
          locale: Portuguese,
          dateFormat: 'd/m/Y',
          allowInput: true,
          onChange: (dates) => {
            const value = dates[0] ? this.formatDateToYMD(dates[0]) : undefined;
            (filterObj as any)[mapping.property] = value;
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
        this.handleError('Erro ao buscar RNCs, tente novamente mais tarde.');
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
        this.handleError('Erro ao buscar formulários, tente novamente mais tarde.');
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

    if (this.rncFilters.rncCode) filters.rncCode = this.rncFilters.rncCode;
    if (this.rncFilters.priority) filters.priority = this.rncFilters.priority;
    if (this.selectedInspector) filters.inspectorId = this.selectedInspector.id;
    if (this.selectedReporter) filters.reporterId = this.selectedReporter.id;
    if (this.selectedOccurType) filters.occurTypeId = this.selectedOccurType.id;
    if (this.rncFilters.occurId) filters.occurId = this.rncFilters.occurId;
    if (this.rncFilters.occurCode) filters.occurCode = this.rncFilters.occurCode;
    if (this.selectedOccurOpener) filters.occurOpenerId = this.selectedOccurOpener.id;
    if (this.selectedOccurInspector) filters.occurInspectorId = this.selectedOccurInspector.id;
    if (this.rncFilters.hasFormAssigned !== undefined) {
      filters.hasFormAssigned = this.rncFilters.hasFormAssigned;
    }

    // Datas RNC
    const rncDateFields = [
      'startOccurredDate', 'endOccurredDate',
      'creationStartDate', 'creationEndDate',
      'updateStartDate', 'updateEndDate',
      'closeStartDate', 'closeEndDate'
    ];

    rncDateFields.forEach(field => {
      if ((this.rncFilters as any)[field]) {
        filters[field] = (this.rncFilters as any)[field];
      }
    });

    // Status RNC
    const selectedStatuses = Object.keys(this.selectedRncStatusMap)
      .filter(key => this.selectedRncStatusMap[key]) as ('OPENED' | 'WORK_IN_PROGRESS' | 'CLOSED')[];
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }

    return filters;
  }


  private prepareFormFilters(): any {
    const filters: any = {};

    if (this.formFilters.rncId) filters.rncId = this.formFilters.rncId;
    if (this.formFilters.rncCode) filters.rncCode = this.formFilters.rncCode;
    if (this.formFilters.formCode) filters.formCode = this.formFilters.formCode;
    if (this.formFilters.priority) filters.priority = this.formFilters.priority;
    if (this.selectedInspector) filters.inspectorId = this.selectedInspector.id;
    if (this.selectedReporter) filters.reporterId = this.selectedReporter.id;
    if (this.formFilters.content) filters.content = this.formFilters.content;
    if (this.formFilters.validationDescription) filters.validationDescription = this.formFilters.validationDescription;
    if (this.formFilters.implementationDescription) filters.implementationDescription = this.formFilters.implementationDescription;
    if (this.formFilters.efficacyDescription) filters.efficacyDescription = this.formFilters.efficacyDescription;
    const formDateFields = [
      'startFollowUpDate', 'endFollowUpDate',
      'startValidationDate', 'endValidationDate',
      'startImplementationDate', 'endImplementationDate',
      'startEfficacyDate', 'endEfficacyDate',
      'creationStartDate', 'creationEndDate',
      'updateStartDate', 'updateEndDate',
      'closeStartDate', 'closeEndDate'
    ];

    formDateFields.forEach(field => {
      if ((this.formFilters as any)[field]) {
        filters[field] = (this.formFilters as any)[field];
      }
    });

    const selectedStatuses = Object.keys(this.selectedFormStatusMap)
      .filter(key => this.selectedFormStatusMap[key]);
    if (selectedStatuses.length > 0) {
      filters.status = selectedStatuses;
    }

    return filters;
  }

  searchById(): void {
    if (!this.idFilter || this.idFilter.trim() === '') {
      this.search();
      return;
    }

    this.loadingService.show();

    if (this.searchType === 'RNC') {
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
          this.handleError(`RNC com ID ${this.idFilter} não encontrada.`);
          this.rncs = [];
          this.forms = [];
          this.totalPages = 0;
          this.collectionSize = 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
      });
    } else {
      this.rncService.getRncForm(Number(this.idFilter)).subscribe({
        next: (form: RncForm) => {
          this.forms = [form];
          this.rncs = [];
          this.totalPages = 1;
          this.totalElements = 1;
          this.collectionSize = 1;
          this.currentPage = 1;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.handleError(`Formulário com ID ${this.idFilter} não encontrado.`);
          this.rncs = [];
          this.forms = [];
          this.totalPages = 0;
          this.collectionSize = 0;
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
      });
    }
  }

  clearFilters(): void {
    // Reset RNC filters
    this.rncFilters = {
      rncCode: undefined,
      priority: undefined,
      hasFormAssigned: undefined,
      occurId: undefined,
      occurCode: undefined,
      occurOpenerId: undefined,
      occurInspectorId: undefined,
      startOccurredDate: undefined,
      endOccurredDate: undefined,
      creationStartDate: undefined,
      creationEndDate: undefined,
      updateStartDate: undefined,
      updateEndDate: undefined,
      closeStartDate: undefined,
      closeEndDate: undefined
    };

    // Reset Form filters
    this.formFilters = {
      rncId: undefined,
      rncCode: undefined,
      formCode: undefined,
      priority: undefined,
      content: undefined,
      validationDescription: undefined,
      implementationDescription: undefined,
      efficacyDescription: undefined,
      startFollowUpDate: undefined,
      endFollowUpDate: undefined,
      startValidationDate: undefined,
      endValidationDate: undefined,
      startImplementationDate: undefined,
      endImplementationDate: undefined,
      startEfficacyDate: undefined,
      endEfficacyDate: undefined,
      creationStartDate: undefined,
      creationEndDate: undefined,
      updateStartDate: undefined,
      updateEndDate: undefined,
      closeStartDate: undefined,
      closeEndDate: undefined
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
    this.selectedOccurOpener = null;
    this.selectedOccurInspector = null;

    this.selectedInspectorDisplay = '';
    this.selectedReporterDisplay = '';
    this.selectedOccurTypeDisplay = '';
    this.selectedOccurOpenerDisplay = '';
    this.selectedOccurInspectorDisplay = '';
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

  onOccurOpenerSelected(opener: UserResponse | null): void {
    if (opener) {
      this.selectedOccurOpener = opener;
      this.selectedOccurOpenerDisplay = `${opener.id} - ${opener.username}`;
    } else {
      this.selectedOccurOpener = null;
      this.selectedOccurOpenerDisplay = '';
    }
    this.cdr.detectChanges();
  }

  onOccurInspectorSelected(inspector: UserResponse | null): void {
    if (inspector) {
      this.selectedOccurInspector = inspector;
      this.selectedOccurInspectorDisplay = `${inspector.id} - ${inspector.username}`;
    } else {
      this.selectedOccurInspector = null;
      this.selectedOccurInspectorDisplay = '';
    }
    this.cdr.detectChanges();
  }

  changeSearchType(type: SearchType): void {
    this.searchType = type;
    this.currentPage = 1;
    this.search();
  }

  getProblemDisplay(form: RncForm): string {
    if (!form.analysis?.problem) {
      return '-';
    }
    const problem = form.analysis.problem;
    return problem.length > 40 ? problem.substring(0, 40) + '...' : problem;
  }

  private handleError(message: string): void {
    this.router.navigate([], {
      queryParams: {
        action: "ERROR",
        message: message
      }
    });
  }
}