import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { OccurFilters } from '../../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../../core/model/occur/occur.model';
import { OccursResponse } from '../../../../core/model/occur/occurs-response.model';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { OccurStatusPipe } from '../../../../pipe/occur-status-pipe.pipe';

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
    NgbAccordionModule],
  standalone: true
})
export class OccurHubComponent implements OnInit, AfterViewInit {

  occurs: Occur[] = [];

  // Paginação
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  // Filtros do formulário
  formFilters: {
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
  } = {
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

  private flatpickrInitialized: boolean = false;

  constructor(
    private occurService: OccurService,
    private loadingService: LoadingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.search();
  }

  ngAfterViewInit(): void {
    // Não inicializa flatpickr aqui, espera o accordion ser aberto
  }

  onDataAccordionShown(): void {
    if (!this.flatpickrInitialized) {
      this.initDatePickers();
      this.flatpickrInitialized = true;
    }
  }

  private initDatePickers(): void {
    const startOccurredDate = document.getElementById('startOccurredDate') as HTMLInputElement;
    if (startOccurredDate) {
      flatpickr(startOccurredDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.startOccurredDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const endOccurredDate = document.getElementById('endOccurredDate') as HTMLInputElement;
    if (endOccurredDate) {
      flatpickr(endOccurredDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.endOccurredDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const rateStartDate = document.getElementById('rateStartDate') as HTMLInputElement;
    if (rateStartDate) {
      flatpickr(rateStartDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.rateStartDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const rateEndDate = document.getElementById('rateEndDate') as HTMLInputElement;
    if (rateEndDate) {
      flatpickr(rateEndDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.rateEndDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const creationStartDate = document.getElementById('creationStartDate') as HTMLInputElement;
    if (creationStartDate) {
      flatpickr(creationStartDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.creationStartDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const creationEndDate = document.getElementById('creationEndDate') as HTMLInputElement;
    if (creationEndDate) {
      flatpickr(creationEndDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.creationEndDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const officializeStartDate = document.getElementById('officializeStartDate') as HTMLInputElement;
    if (officializeStartDate) {
      flatpickr(officializeStartDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.officializeStartDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const officializeEndDate = document.getElementById('officializeEndDate') as HTMLInputElement;
    if (officializeEndDate) {
      flatpickr(officializeEndDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.officializeEndDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const closeStartDate = document.getElementById('closeStartDate') as HTMLInputElement;
    if (closeStartDate) {
      flatpickr(closeStartDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.closeStartDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }

    const closeEndDate = document.getElementById('closeEndDate') as HTMLInputElement;
    if (closeEndDate) {
      flatpickr(closeEndDate, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        onChange: (dates) => {
          this.formFilters.closeEndDate = dates[0] ? this.formatDateToYMD(dates[0]) : '';
        }
      });
    }
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
      }
    });
  }

  private prepareFilters(): OccurFilters {
    const filtersToSend: OccurFilters = {};

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

    // Limpar os valores dos inputs de data
    const dateInputIds = [
      'startOccurredDate', 'endOccurredDate', 'rateStartDate', 'rateEndDate',
      'creationStartDate', 'creationEndDate', 'officializeStartDate', 'officializeEndDate',
      'closeStartDate', 'closeEndDate'
    ];

    dateInputIds.forEach(inputId => {
      const element = document.getElementById(inputId) as HTMLInputElement;
      if (element) {
        element.value = '';
      }
    });

    this.search();
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
      },
      error: (error) => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao buscar ocorrências, tente novamente mais tarde.`
          }
        });
        this.loadingService.hide();
      }
    });
  }
}