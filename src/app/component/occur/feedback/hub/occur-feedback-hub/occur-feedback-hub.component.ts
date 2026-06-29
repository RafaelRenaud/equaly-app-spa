import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { OccurFilters } from '../../../../../core/model/occur/occur-filters.model';
import { Occur } from '../../../../../core/model/occur/occur.model';
import { LoadingService } from '../../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../../core/service/occur/occur.service';
import { SessionService } from '../../../../../core/service/session/session.service';

@Component({
  selector: 'app-occur-feedback-hub',
  imports: [CommonModule, RouterModule, NgbPaginationModule],
  templateUrl: './occur-feedback-hub.component.html',
  styleUrl: './occur-feedback-hub.component.scss',
  standalone: true
})
export class OccurFeedbackHubComponent implements OnInit {

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
    this.activeTab = 'awaitingRate';
    this.loadPendencies();
  }

  loadPendencies(): void {
    this.loadingService.show();

    let filters: OccurFilters = {};
    const userId = Number(this.sessionService.getItem('userId'));

    switch (this.activeTab) {
      case 'awaitingRate':
        filters = {
          status: ['AWAITING_RATING'],
          openerId: userId
        };
        break;
      case 'closedWithRating':
        filters = {
          status: ['CLOSED'],
          closeStatus: 'CLOSED_WITH_RATING',
          openerId: userId
        };
        break;
      case 'closedWithoutRating':
        filters = {
          status: ['CLOSED'],
          closeStatus: 'CLOSED_WITHOUT_RATING',
          openerId: userId
        };
        break;
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
