import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { OccurFilters } from '../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../core/model/occur/occur.model';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { OccurService } from '../../../core/service/occur/occur.service';
import { SessionService } from '../../../core/service/session/session.service';

@Component({
  selector: 'app-pending',
  imports: [RouterModule, CommonModule, FormsModule, NgbPaginationModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.scss',
  standalone: true
})
export class OccurPendingComponent implements OnInit {

  public isOpener = false;
  public isInspector = false;
  public isDaltonEnabled = false;

  public occurs: Occur[] = [];
  public page: number = 1;
  public totalPages: number = 0;
  public pageSize: number = 10;
  public collectionSize: number = 0;

  public activeTab: string = '';

  constructor(
    private sessionService: SessionService,
    private occurService: OccurService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.isOpener = this.sessionService.hasRole('COMMON_EVENT_OPENER');
    this.isInspector = this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');
    this.isDaltonEnabled = this.sessionService.getItem('isDaltonEnabled') === 'true';

    this.initializeActiveTab();
    this.loadPendencies();
  }

  initializeActiveTab(): void {
    if (this.isOpener) {
      if (this.isDaltonEnabled) {
        this.activeTab = 'chatbot';
      } else {
        this.activeTab = 'awaitingClose';
      }
    } else if (this.isInspector) {
      this.activeTab = 'awaitingInspection';
    }
  }

  onAssignedToMeChange(): void {
    this.page = 1;
    this.loadPendencies();
  }

  loadPendencies(): void {
    this.loadingService.show();

    let filters: OccurFilters = {};
    const userId = Number(this.sessionService.getItem('userId'));

    if (this.isOpener) {
      switch (this.activeTab) {
        case 'chatbot':
          filters = {
            status: ['DRAFT_OPENED'],
            complaintChannel: 'DALTON'
          };
          break;
        case 'whatsapp':
          filters = {
            status: ['DRAFT_OPENED'],
            complaintChannel: 'WHATSAPP'
          };
          break;
        case 'awaitingClose':
          filters = {
            status: ['AWAITING_CLOSE'],
            openerId: userId
          };
          break;
      }
    } else if (this.isInspector) {
      switch (this.activeTab) {
        case 'awaitingInspection':
          filters = {
            status: ['AWAITING_REPORT'],
            inspectorId: userId
          };
          break;
        case 'awaitingGeneralInspection':
          filters = {
            status: ['AWAITING_REPORT'],
            hasInspectorAssigned: false
          };
          break;
      }
    }

    this.occurService.getOccurs(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.occurs = response.occurs;
          this.totalPages = response.pageable?.totalPages || 0;
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Ocorreu um erro ao buscar as ocorrências pendentes, tente novamente mais tarde.`
            }
          });
        }
      });
  }

  changeTab(tab: string): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.page = 1;
    this.loadPendencies();
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPendencies();
  }
}