import { CommonModule, DatePipe, SlicePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs';
import { Rnc } from '../../../core/model/rnc/rnc.model';
import { RncForm } from '../../../core/model/rnc/rnc-form.model';
import { RncFilters } from '../../../core/model/rnc/rnc-filters.model';
import { RncFormFilters } from '../../../core/model/rnc/rnc-form-filters.model';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { RncService } from '../../../core/service/rnc/rnc-service.service';
import { SessionService } from '../../../core/service/session/session.service';

@Component({
  selector: 'app-rnc-pending',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    NgbPaginationModule,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './pending.component.html',
  styleUrls: ['./pending.component.scss'],
  standalone: true
})
export class RncPendingComponent implements OnInit {

  // Roles
  public isRncReporter = false;
  public isQualityInspector = false;

  // Dados
  public rncs: Rnc[] = [];
  public forms: RncForm[] = [];

  // Paginação
  public page: number = 1;
  public pageSize: number = 10;
  public collectionSize: number = 0;

  // Aba ativa
  public activeTab: string = '';

  constructor(
    private sessionService: SessionService,
    private rncService: RncService,
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.isRncReporter = this.sessionService.hasRole('COMMON_RNC_REPORTER');
    this.isQualityInspector = this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');

    this.initializeActiveTab();
    this.loadPendencies();
  }

  private initializeActiveTab(): void {
    if (this.isRncReporter) {
      this.activeTab = 'formFilling';
    } else if (this.isQualityInspector) {
      this.activeTab = 'formValidation';
    }
  }

  changeTab(tab: string): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.page = 1;
    this.loadPendencies();
  }

  loadPendencies(): void {
    this.loadingService.show();

    const userId = Number(this.sessionService.getItem('userId'));

    if (this.isRncReporter) {
      switch (this.activeTab) {
        case 'formFilling':
          this.loadRncFormFilling(userId);
          break;
        case 'implementationFinalization':
          this.loadRncImplementationFinalization(userId);
          break;
      }
    } else if (this.isQualityInspector) {
      switch (this.activeTab) {
        case 'formValidation':
          this.loadRncFormValidation(userId);
          break;
        case 'efficacyAnalysis':
          this.loadRncEfficacyAnalysis(userId);
          break;
      }
    }
  }

  /**
   * Aba "Preenchimento de Formulário" - Repórter RNC
   * Busca RNCs onde reporterId = userId e status = OPENED
   */
  private loadRncFormFilling(userId: number): void {
    const filters: RncFilters = {
      reporterId: userId,
      status: ['OPENED']
    };

    this.rncService.getRncs(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.rncs = response.rncs;
          this.forms = [];
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.handleError('Erro ao buscar RNCs para preenchimento de formulário.');
        }
      });
  }

  /**
   * Aba "Finalização de Implementação" - Repórter RNC
   * Busca RNC Forms onde reporterId = userId e status = AWAITING_VALIDATION
   */
  private loadRncImplementationFinalization(userId: number): void {
    const filters: RncFormFilters = {
      reporterId: userId,
      status: ['AWAITING_IMPLEMENTATION']
    };

    this.rncService.getRncForms(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.forms = response.forms;
          this.rncs = [];
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.handleError('Erro ao buscar formulários para finalização de implementação.');
        }
      });
  }

  /**
   * Aba "Validação de Formulário" - Analista de Qualidade
   * Busca RNC Forms onde inspectorId = userId e status = AWAITING_VALIDATION
   */
  private loadRncFormValidation(userId: number): void {
    const filters: RncFormFilters = {
      inspectorId: userId,
      status: ['AWAITING_VALIDATION']
    };

    this.rncService.getRncForms(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.forms = response.forms;
          this.rncs = [];
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.handleError('Erro ao buscar formulários para validação.');
        }
      });
  }

  /**
   * Aba "Análise de Eficácia" - Analista de Qualidade
   * Busca RNC Forms onde inspectorId = userId e status = AWAITING_EFFICACY_ANALYSIS
   */
  private loadRncEfficacyAnalysis(userId: number): void {
    const filters: RncFormFilters = {
      inspectorId: userId,
      status: ['AWAITING_EFFICACY_ANALYSIS']
    };

    this.rncService.getRncForms(filters, this.page - 1, this.pageSize)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.forms = response.forms;
          this.rncs = [];
          this.collectionSize = response.pageable?.totalElements || 0;
        },
        error: (error) => {
          this.handleError('Erro ao buscar formulários para análise de eficácia.');
        }
      });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadPendencies();
  }

  private handleError(message: string): void {
    this.router.navigate([], {
      queryParams: {
        action: "ERROR",
        message: message
      }
    });
    this.loadingService.hide();
  }
}