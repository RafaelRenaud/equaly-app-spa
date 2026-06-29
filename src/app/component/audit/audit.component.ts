// audit.component.ts
import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { NgbPaginationModule } from "@ng-bootstrap/ng-bootstrap";
import { Subscription } from "rxjs";
import { AuditResponse, AuditsResponse } from "../../core/model/audit/audits-response.model";
import { AuditServiceService } from "../../core/service/audit/audit.service";
import { LoadingService } from "../../core/service/loading/loading.service";
import { AuditActionTypePipePipe } from "../../pipe/audit-action-type-pipe.pipe";
import { OccurStatusPipe } from "../../pipe/occur-status-pipe.pipe";
import { UserSystemPipe } from "../../pipe/user-system-pipe";

@Component({
  selector: "app-audit",
  imports: [CommonModule, FormsModule, NgbPaginationModule, UserSystemPipe, AuditActionTypePipePipe],
  templateUrl: "./audit.component.html",
  standalone: true
})
export class AuditComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) subjectId!: number;
  @Input({ required: true }) subjectType!: 'OCCUR' | 'RNC';
  @Input() subjectCode?: string;
  @Input() pageSize: number = 10;

  audits: AuditResponse[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  page: number = 1;
  Math = Math;

  private subscription?: Subscription;

  private readonly keyMapping: { [key: string]: string } = {
    'status': 'Estado',
    'channel': 'Canal',
    'fileId': 'ID do Arquivo',
    'fileName': 'Nome do Arquivo',
    'fileType': 'Tipo de Arquivo',
    'inspector': 'Inspetor de Qualidade',
    'inspectorReport': 'Relatório da Inspeção',
    'hasRNCOpened': 'RNC Aberta',
    'closeReason': 'Informações de Encerramento',
    'closeStatus': 'Status de Encerramento',
    'occurType': 'Tipo de Ocorrência',
    'occurTitle': 'Título da Ocorrência',
    'occuredDate': 'Data da Ocorrência',
    'rateComment': 'Comentário da Avaliação',
    'rateScore': 'Pontuação da Avaliação'
  };

  constructor(
    private auditService: AuditServiceService,
    private loadingService: LoadingService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['subjectId'] || changes['subjectType']) && this.subjectId) {
      this.loadAudits();
    }
  }

  loadAudits(): void {
    if (!this.subjectId) return;

    this.loadingService.show();

    this.subscription?.unsubscribe();
    this.subscription = this.auditService
      .getAudits(
        { auditType: this.subjectType, subjectId: this.subjectId },
        this.page - 1,
        this.pageSize
      )
      .subscribe({
        next: (response: AuditsResponse) => {
          this.audits = response.audits || [];
          this.totalElements = response.pageable?.totalElements || 0;
          this.totalPages = response.pageable?.totalPages || 0;
          this.loadingService.hide();
        },
        error: () => {
          this.audits = [];
          this.totalElements = 0;
          this.totalPages = 0;
          this.loadingService.hide();
        }
      });
  }

  loadPage(): void {
    this.loadAudits();
  }

  getLabel(key: string): string {
    return this.keyMapping[key] || this.formatKeyToLabel(key);
  }

  private formatKeyToLabel(key: string): string {
    return key
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  formatValue(key: string, value: any): string {
    if (value === null || value === undefined) return 'Não informado';

    // Converter string 'true'/'false' para boolean
    if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
      const boolValue = value.toLowerCase() === 'true';
      return boolValue ? 'Sim' : 'Não';
    }

    // Formatar datas
    if (key === 'occuredDate' && value) {
      return new Date(value).toLocaleString('pt-BR');
    }

    // Formatar canal
    if (key === 'channel' && value) {
      return UserSystemPipe.prototype.transform(value);
    }

    // Formatar status (ocorrência)
    if (key === 'status' && value && this.subjectType === 'OCCUR') {
      return new OccurStatusPipe().transform(value);
    }

    if (key === 'closeStatus' && value === 'CLOSED_WITH_RATING') {
      return 'Encerrada com Avaliação';
    } else if (key === 'closeStatus' && value === 'CLOSED_WITHOUT_RATING') {
      return 'Encerrada sem Avaliação';
    } else if (key === 'closeStatus' && value === 'NOT_INFORMED') {
      return 'Não Informado';
    }

    // Formatar status (RNC) - você pode criar um pipe similar para RNC
    if (key === 'status' && value && this.subjectType === 'RNC') {
      // TODO: Criar pipe para status de RNC
      return value;
    }

    // Booleanos
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    //Default
    if (value === 'NOT_INFORMED') {
      return 'Não informado';
    }

    return String(value);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}