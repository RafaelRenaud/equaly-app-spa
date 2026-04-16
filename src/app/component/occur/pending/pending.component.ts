import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../core/service/session/session.service';
import { Occur } from '../../../core/model/occur/occur.model';
import { OccurService } from '../../../core/service/occur/occur.service';
import { Router, RouterModule } from '@angular/router';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { OccurFilters } from '../../../core/model/occur/occur-filters.model';

@Component({
  selector: 'app-pending',
  imports: [RouterModule, CommonModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.scss'
})
export class OccurPendingComponent implements OnInit {

  public isOpener = false;
  public isInspector = false;
  public isDaltonEnabled = false;

  public occurs: Occur[] = [];
  public page: number = 0;
  public totalPages: number = 0;
  public pageSize: number = 10;

  // Controle do tipo de pendência ativa
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
        this.activeTab = 'awaitingEdit';
      }
    } else if (this.isInspector) {
      this.activeTab = 'awaitingInspection';
    }
  }

  loadPendencies(): void {
    this.loadingService.show();

    let filters: OccurFilters = {};
    const userId = Number(this.sessionService.getItem('userId'));

    // Define os filtros baseado no perfil e tab ativa
    if (this.isOpener) {
      switch (this.activeTab) {
        case 'chatbot':
          filters = {
            status: ['DRAFT_OPENED'],
            complaintChannel: 'DALTON',
            openerId: userId
          };
          break;
        case 'whatsapp':
          filters = {
            status: ['DRAFT_OPENED'],
            complaintChannel: 'WHATSAPP',
            openerId: userId
          };
          break;
        case 'awaitingEdit':
          filters = {
            status: ['AWAITING_EDIT'],
            openerId: userId
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
        case 'awaitingEditApprove':
          filters = {
            status: ['PENDING_EDIT_APPROVAL'],
            inspectorId: userId
          };
          break;
      }
    }

    this.occurService.getOccurs(filters, this.page, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.occurs = response.occurs;
          this.totalPages = response.pageable?.totalPages || 0;
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
    this.page = 0;
    this.loadPendencies();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.page = page;
    this.loadPendencies();
  }
}