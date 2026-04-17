import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { OccurFilters } from '../../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../../core/model/occur/occur.model';
import { OccursResponse } from '../../../../core/model/occur/occurs-response.model';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { UserResponse } from '../../../../core/model/user/user-response.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { SessionService } from '../../../../core/service/session/session.service';
import { OccurStatusPipe } from '../../../../pipe/occur-status-pipe.pipe';
import { OccurTypeHeadSearchComponent } from "../../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../../user/search/user-type-head-search/user-type-head-search.component";

// Definindo o tipo para os filtros de data
type FormFiltersType = {
  priority: string;
  hasInspectorAssigned: string;
  hasRNCOpened: string;
  hasComplainantAssigned: string;
  complaintType: string;
  complaintChannel: string;
  closeStatus: string;
  complaintOrderId: string;
  startOccurredDate: string;
  endOccurredDate: string;
  rateStartDate: string;
  rateEndDate: string;
  creationStartDate: string;
  creationEndDate: string;
  officializeStartDate: string;
  officializeEndDate: string;
  closeStartDate: string;
  closeEndDate: string;
  content: string;
  complainantInformation: string;
};

@Component({
  selector: 'occur-hub',
  templateUrl: './occur-hub.component.html',
  styleUrls: ['./occur-hub.component.scss'],
  imports: [CommonModule,
    FormsModule,
    SlicePipe,
    DatePipe,
    RouterModule,
    OccurStatusPipe,
    NgbAccordionModule, UserTypeHeadSearchComponent, OccurTypeHeadSearchComponent],
  standalone: true
})
export class OccurHubComponent implements OnInit, AfterViewInit {

  @ViewChildren(UserTypeHeadSearchComponent) typeheadComponents!: QueryList<UserTypeHeadSearchComponent>;
  @ViewChild(OccurTypeHeadSearchComponent) occurTypeheadComponent!: OccurTypeHeadSearchComponent;
  @ViewChildren('dateInput') dateInputs!: QueryList<ElementRef<HTMLInputElement>>;

  isOnlyOpener: boolean = false;

  occurs: Occur[] = [];
  selectedOpener: UserResponse | null = null;
  selectedInspector: UserResponse | null = null;
  selectedComplainant: UserResponse | null = null;
  selectedOccurType: OccurTypeResponse | null = null;

  selectedOpenerDisplay: string = '';
  selectedInspectorDisplay: string = '';
  selectedComplainantDisplay: string = '';
  selectedOccurTypeDisplay: string = '';

  // Paginação
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  // Filtros do formulário
  formFilters: FormFiltersType = {
    priority: '',
    hasInspectorAssigned: '',
    hasRNCOpened: '',
    hasComplainantAssigned: '',
    complaintType: '',
    complaintChannel: '',
    closeStatus: '',
    complaintOrderId: '',
    startOccurredDate: '',
    endOccurredDate: '',
    rateStartDate: '',
    rateEndDate: '',
    creationStartDate: '',
    creationEndDate: '',
    officializeStartDate: '',
    officializeEndDate: '',
    closeStartDate: '',
    closeEndDate: '',
    content: '',
    complainantInformation: ''
  };

  selectedStatusMap: { [key: string]: boolean } = {
    DRAFT_OPENED: false,
    PENDING_EDIT_APPROVAL: false,
    AWAITING_EDIT: false,
    AWAITING_REPORT: false,
    AWAITING_CLOSE: false,
    AWAITING_RATING: false,
    CLOSED: false
  };

  private flatpickrInstances: any[] = [];

  constructor(
    private occurService: OccurService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.sessionService.hasRole('COMMON_EVENT_OPENER') && this.sessionService.getRoles().length === 1) {
      this.isOnlyOpener = true;
    }

    this.search();
  }

  ngAfterViewInit(): void {
    // Observa mudanças nos inputs de data (quando o accordion é aberto/fechado)
    this.dateInputs.changes.subscribe(() => {
      this.initDatePickers();
    });
  }

  // Método para forçar detecção de mudanças quando os typeheads mudam de estado
  onTypeheadLoadingChange(): void {
    this.cdr.detectChanges();
  }

  onDataAccordionShown(): void {
    // O initDatePickers será chamado automaticamente pelo subscription do dateInputs.changes
    // Mas garantimos que os datepickers sejam inicializados se o subscription não disparar
    setTimeout(() => {
      this.initDatePickers();
    }, 0);
  }

  private initDatePickers(): void {
    // Destruir instâncias anteriores
    this.destroyDatePickers();

    // Mapeamento dos IDs dos inputs para as propriedades do formFilters
    const dateInputMapping: Record<string, keyof FormFiltersType> = {
      'startOccurredDate': 'startOccurredDate',
      'endOccurredDate': 'endOccurredDate',
      'rateStartDate': 'rateStartDate',
      'rateEndDate': 'rateEndDate',
      'creationStartDate': 'creationStartDate',
      'creationEndDate': 'creationEndDate',
      'officializeStartDate': 'officializeStartDate',
      'officializeEndDate': 'officializeEndDate',
      'closeStartDate': 'closeStartDate',
      'closeEndDate': 'closeEndDate'
    };

    // Inicializar flatpickr para cada input
    this.dateInputs.forEach(input => {
      const inputElement = input.nativeElement;
      const inputId = inputElement.id;
      const formFilterProperty = dateInputMapping[inputId];

      if (formFilterProperty) {
        const instance = flatpickr(inputElement, {
          locale: Portuguese,
          dateFormat: 'd/m/Y',
          allowInput: true,
          onChange: (dates) => {
            // Usando tipo assertion para resolver o erro do TypeScript
            (this.formFilters as any)[formFilterProperty] = dates[0] ? this.formatDateToYMD(dates[0]) : '';
          }
        });
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
    this.loadingService.show();
    this.currentPage = 0;

    const searchFilters = this.prepareFilters();

    this.occurService.getOccurs(searchFilters, this.currentPage, this.pageSize).subscribe({
      next: (response: OccursResponse) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao buscar ocorrências, tente novamente mais tarde.`
          }
        });
        this.occurs = [];
        this.totalPages = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  private prepareFilters(): OccurFilters {
    const filtersToSend: OccurFilters = {};

    if (this.selectedOpener) {
      filtersToSend.openerId = this.selectedOpener.id;
    }

    if (this.selectedInspector) {
      filtersToSend.inspectorId = this.selectedInspector.id;
    }

    if (this.selectedComplainant) {
      filtersToSend.complainantId = this.selectedComplainant.id;
    }

    if (this.selectedOccurType) {
      filtersToSend.occurTypeId = this.selectedOccurType.id;
    }

    if (this.formFilters.priority) {
      filtersToSend.priority = this.formFilters.priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (this.formFilters.complaintType) {
      filtersToSend.complaintType = this.formFilters.complaintType as 'INTERNAL' | 'EXTERNAL';
    }

    if (this.formFilters.complaintChannel) {
      filtersToSend.complaintChannel = this.formFilters.complaintChannel as 'EQUALY' | 'DALTON' | 'WHATSAPP';
    }

    if (this.formFilters.closeStatus) {
      filtersToSend.closeStatus = this.formFilters.closeStatus as 'CLOSED_WITH_RATING' | 'CLOSED_WITHOUT_RATING';
    }

    if (this.formFilters.complaintOrderId) {
      filtersToSend.complaintOrderId = this.formFilters.complaintOrderId;
    }

    if (this.formFilters.startOccurredDate) {
      filtersToSend.startOccurredDate = this.formFilters.startOccurredDate;
    }

    if (this.formFilters.endOccurredDate) {
      filtersToSend.endOccurredDate = this.formFilters.endOccurredDate;
    }

    if (this.formFilters.rateStartDate) {
      filtersToSend.rateStartDate = this.formFilters.rateStartDate;
    }

    if (this.formFilters.rateEndDate) {
      filtersToSend.rateEndDate = this.formFilters.rateEndDate;
    }

    if (this.formFilters.creationStartDate) {
      filtersToSend.creationStartDate = this.formFilters.creationStartDate;
    }

    if (this.formFilters.creationEndDate) {
      filtersToSend.creationEndDate = this.formFilters.creationEndDate;
    }

    if (this.formFilters.officializeStartDate) {
      filtersToSend.officializeStartDate = this.formFilters.officializeStartDate;
    }

    if (this.formFilters.officializeEndDate) {
      filtersToSend.officializeEndDate = this.formFilters.officializeEndDate;
    }

    if (this.formFilters.closeStartDate) {
      filtersToSend.closeStartDate = this.formFilters.closeStartDate;
    }

    if (this.formFilters.closeEndDate) {
      filtersToSend.closeEndDate = this.formFilters.closeEndDate;
    }

    if (this.formFilters.content) {
      filtersToSend.content = this.formFilters.content;
    }

    if (this.formFilters.complainantInformation) {
      filtersToSend.complainantInformation = this.formFilters.complainantInformation;
    }

    if (this.formFilters.hasInspectorAssigned === 'true') {
      filtersToSend.hasInspectorAssigned = true;
    } else if (this.formFilters.hasInspectorAssigned === 'false') {
      filtersToSend.hasInspectorAssigned = false;
    }

    if (this.formFilters.hasRNCOpened === 'true') {
      filtersToSend.hasRNCOpened = true;
    } else if (this.formFilters.hasRNCOpened === 'false') {
      filtersToSend.hasRNCOpened = false;
    }

    if (this.formFilters.hasComplainantAssigned === 'true') {
      filtersToSend.hasComplainantAssigned = true;
    } else if (this.formFilters.hasComplainantAssigned === 'false') {
      filtersToSend.hasComplainantAssigned = false;
    }

    const selectedStatuses = Object.keys(this.selectedStatusMap).filter(key => this.selectedStatusMap[key]);
    if (selectedStatuses.length > 0) {
      filtersToSend.status = selectedStatuses as OccurFilters['status'];
    }

    return filtersToSend;
  }

  clearFilters(): void {
    this.formFilters = {
      priority: '',
      hasInspectorAssigned: '',
      hasRNCOpened: '',
      hasComplainantAssigned: '',
      complaintType: '',
      complaintChannel: '',
      closeStatus: '',
      complaintOrderId: '',
      startOccurredDate: '',
      endOccurredDate: '',
      rateStartDate: '',
      rateEndDate: '',
      creationStartDate: '',
      creationEndDate: '',
      officializeStartDate: '',
      officializeEndDate: '',
      closeStartDate: '',
      closeEndDate: '',
      content: '',
      complainantInformation: ''
    };

    Object.keys(this.selectedStatusMap).forEach(key => {
      this.selectedStatusMap[key] = false;
    });

    this.selectedOpener = null;
    this.selectedInspector = null;
    this.selectedComplainant = null;
    this.selectedOccurType = null;

    this.selectedOpenerDisplay = '';
    this.selectedInspectorDisplay = '';
    this.selectedComplainantDisplay = '';
    this.selectedOccurTypeDisplay = '';

    // Limpar os inputs dos typeheads
    this.typeheadComponents.forEach(typehead => typehead.clear());
    this.occurTypeheadComponent.clear();

    // Limpar os valores dos inputs de data
    this.dateInputs.forEach(input => {
      if (input && input.nativeElement) {
        input.nativeElement.value = '';
      }
    });

    this.search();
    this.cdr.detectChanges();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) {
      return;
    }

    this.loadingService.show();
    this.currentPage = page;

    const searchFilters = this.prepareFilters();

    this.occurService.getOccurs(searchFilters, this.currentPage, this.pageSize).subscribe({
      next: (response: OccursResponse) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao buscar ocorrências, tente novamente mais tarde.`
          }
        });
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  onOpenerSelected(opener: UserResponse | null): void {
    if (opener) {
      this.selectedOpener = opener;
      this.selectedOpenerDisplay = `${opener.id} - ${opener.username}`;
    } else {
      this.selectedOpener = null;
      this.selectedOpenerDisplay = '';
    }
    this.cdr.detectChanges();
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

  onComplainantSelected(complainant: UserResponse | null): void {
    if (complainant) {
      this.selectedComplainant = complainant;
      this.selectedComplainantDisplay = `${complainant.id} - ${complainant.username}`;
    } else {
      this.selectedComplainant = null;
      this.selectedComplainantDisplay = '';
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
}