import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { RncForm } from '../../../core/model/rnc/rnc-form.model';
import { RncFormFilters } from '../../../core/model/rnc/rnc-form-filters.model';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { RncService } from '../../../core/service/rnc/rnc-service.service';
import { SessionService } from '../../../core/service/session/session.service';

@Component({
  selector: 'app-rnc-fixes',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbPaginationModule,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './fixes.component.html',
  styleUrls: ['./fixes.component.scss'],
  standalone: true
})
export class RncFixesComponent implements OnInit {

  public forms: RncForm[] = [];

  public page: number = 1;
  public pageSize: number = 10;
  public collectionSize: number = 0;

  public activeTab: string = 'formRefill';

  constructor(
    private sessionService: SessionService,
    private rncService: RncService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadFixes();
  }

  changeTab(tab: string): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.page = 1;
    this.loadFixes();
  }

  loadFixes(): void {
    this.loadingService.show();

    const userId = Number(this.sessionService.getItem('userId'));

    let filters: RncFormFilters = {};

    switch (this.activeTab) {
      case 'formRefill':
        filters = {
          reporterId: userId,
          status: ['VALIDATION_EDITION']
        };
        break;
      case 'implementationRedo':
        filters = {
          reporterId: userId,
          status: ['IMPLEMENTATION_EDITION']
        };
        break;
    }

    this.rncService.getRncForms(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.forms = response.forms;
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao buscar correções de RNC, tente novamente mais tarde.`
            }
          });
        }
      });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadFixes();
  }
}