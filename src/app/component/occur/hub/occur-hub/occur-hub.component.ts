import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { OccurFilters } from '../../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../../core/model/occur/occur.model';
import { OccursResponse } from '../../../../core/model/occur/occurs-response.model';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { UserResponse } from '../../../../core/model/user/user-response.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { SessionService } from '../../../../core/service/session/session.service';
import { OccurStatusPipe } from '../../../../pipe/occur-status-pipe.pipe';
import { OccurTypeHeadSearchComponent } from '../../../occur-type/search/occur-type-head-search/occur-type-head-search.component';
import { UserTypeHeadSearchComponent } from '../../../user/search/user-type-head-search/user-type-head-search.component';

type FormFiltersType = {
  occurCode: string;
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
  imports: [
    CommonModule,
    FormsModule,
    SlicePipe,
    DatePipe,
    RouterModule,
    OccurStatusPipe,
    NgbAccordionModule,
    NgbPaginationModule,
    UserTypeHeadSearchComponent,
    OccurTypeHeadSearchComponent
  ],
  standalone: true
})
export class OccurHubComponent implements OnInit {

  @ViewChildren(UserTypeHeadSearchComponent)
  typeheadComponents!: QueryList<UserTypeHeadSearchComponent>;

  @ViewChild(OccurTypeHeadSearchComponent)
  occurTypeheadComponent!: OccurTypeHeadSearchComponent;

  isOnlyOpener: boolean = false;
  isOnlyInspector: boolean = false;

  occurs: Occur[] = [];
  selectedOpener: UserResponse | null = null;
  selectedInspector: UserResponse | null = null;
  selectedComplainant: UserResponse | null = null;
  selectedOccurType: OccurTypeResponse | null = null;

  selectedOpenerDisplay: string = '';
  selectedInspectorDisplay: string = '';
  selectedComplainantDisplay: string = '';
  selectedOccurTypeDisplay: string = '';

  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  collectionSize: number = 0;

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
    complainantInformation: '',
    occurCode: ''
  };

  idFilter: string = '';

  get isIdFilterFilled(): boolean {
    return !!this.idFilter && this.idFilter.trim() !== '';
  }

  selectedStatusMap: { [key: string]: boolean } = {
    DRAFT_OPENED: false,
    AWAITING_REPORT: false,
    AWAITING_CLOSE: false,
    AWAITING_RATING: false,
    CLOSED: false
  };

  constructor(
    private occurService: OccurService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.isOnlyOpener =
      this.sessionService.hasRole('COMMON_EVENT_OPENER') &&
      this.sessionService.getRoles().length === 1;

    this.isOnlyInspector =
      this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR') &&
      this.sessionService.getRoles().length === 1;

    this.search();
  }

  onTypeheadLoadingChange(): void {
    this.cdr.detectChanges();
  }

  onDataAccordionShown(): void { }

  search(): void {
    if (this.idFilter && this.idFilter.trim() !== '') {
      this.searchById();
      return;
    }

    this.loadingService.show();
    this.currentPage = 1;

    const searchFilters = this.prepareFilters();

    this.occurService.getOccurs(
      searchFilters,
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (response: OccursResponse) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.collectionSize = response.pageable.totalElements || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate([], {
          queryParams: {
            action: 'ERROR',
            message: 'Erro ao buscar ocorrências, tente novamente mais tarde.'
          }
        });
        this.occurs = [];
        this.totalPages = 0;
        this.collectionSize = 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  private prepareFilters(): OccurFilters {
    const filtersToSend: OccurFilters = {};

    if (this.formFilters.occurCode) {
      filtersToSend.occurCode = this.formFilters.occurCode;
    }

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
      filtersToSend.priority =
        this.formFilters.priority as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (this.formFilters.complaintType) {
      filtersToSend.complaintType =
        this.formFilters.complaintType as 'INTERNAL' | 'EXTERNAL';
    }

    if (this.formFilters.complaintChannel) {
      filtersToSend.complaintChannel =
        this.formFilters.complaintChannel as 'EQUALY' | 'DALTON' | 'WHATSAPP';
    }

    if (this.formFilters.closeStatus) {
      filtersToSend.closeStatus =
        this.formFilters.closeStatus as 'CLOSED_WITH_RATING' | 'CLOSED_WITHOUT_RATING';
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
      filtersToSend.complainantInformation =
        this.formFilters.complainantInformation;
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

    const selectedStatuses = Object.keys(this.selectedStatusMap)
      .filter(key => this.selectedStatusMap[key]);

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
      complainantInformation: '',
      occurCode: ''
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
    this.idFilter = '';
    this.currentPage = 1;

    this.typeheadComponents.forEach(typehead => typehead.clear());
    this.occurTypeheadComponent.clear();

    this.search();
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadingService.show();

    const searchFilters = this.prepareFilters();

    this.occurService.getOccurs(
      searchFilters,
      this.currentPage - 1,
      this.pageSize
    ).subscribe({
      next: (response: OccursResponse) => {
        this.occurs = response.occurs;
        this.totalPages = response.pageable.totalPages;
        this.totalElements = response.pageable.totalElements;
        this.collectionSize = response.pageable.totalElements || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate([], {
          queryParams: {
            action: 'ERROR',
            message: 'Erro ao buscar ocorrências, tente novamente mais tarde.'
          }
        });
        this.loadingService.hide();
        this.cdr.detectChanges();
      }
    });
  }

  searchById(): void {
    if (!this.idFilter) {
      this.search();
      return;
    }

    this.loadingService.show();

    this.occurService.getOccur(Number(this.idFilter)).subscribe({
      next: (occur: Occur) => {
        this.occurs = [occur];
        this.totalPages = 1;
        this.totalElements = 1;
        this.collectionSize = 1;
        this.currentPage = 1;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate([], {
          queryParams: {
            action: 'ERROR',
            message: `Ocorrência com ID ${this.idFilter} não encontrada.`
          }
        });
        this.occurs = [];
        this.totalPages = 0;
        this.collectionSize = 0;
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
      this.selectedComplainantDisplay =
        `${complainant.id} - ${complainant.username}`;
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