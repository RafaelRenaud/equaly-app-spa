// rnc-main-viewer.component.ts

import { CommonModule, DatePipe } from "@angular/common";
import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { Occur } from "../../../../core/model/occur/occur.model";
import { RncForm } from "../../../../core/model/rnc/rnc-form.model";
import { Rnc } from "../../../../core/model/rnc/rnc.model";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { OccurService } from "../../../../core/service/occur/occur.service";
import { RncService } from "../../../../core/service/rnc/rnc-service.service";
import { DefaultValuePipe } from "../../../../pipe/default-value.pipe";
import { RncCauseCategoryPipe } from "../../../../pipe/rnc-form-cause-category.pipe";
import { RncCauseTypePipe } from "../../../../pipe/rnc-form-cause-type.pipe";
import { RncFormStatusPipe } from "../../../../pipe/rnc-form-status.pipe";
import { OccurMainViewerComponent } from "../../../occur/view/main-viewer/occur-main-viewer/occur-main-viewer.component";
import { SessionService } from "../../../../core/service/session/session.service";
import { RncStatusPipe } from "../../../../pipe/rnc-status.pipe";

@Component({
  selector: "app-rnc-main-viewer",
  imports: [
    DatePipe,
    OccurMainViewerComponent,
    RncStatusPipe,
    RncFormStatusPipe,
    RncCauseCategoryPipe,
    RncCauseTypePipe,
    DefaultValuePipe,
  ],
  templateUrl: "./rnc-main-viewer.component.html",
  styleUrl: "./rnc-main-viewer.component.scss",
  standalone: true,
})
export class RncMainViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() rnc: Rnc | null = null;
  @Input() rncForm: RncForm | null = null;
  @Input() occur: Occur | null = null;
  @Output() rncReloaded = new EventEmitter<Rnc>();

  @ViewChild('occurCollapse') occurCollapse!: ElementRef;

  isReloading: boolean = false;
  isExporting: boolean = false;
  isSendingEmail: boolean = false;
  occurLoaded: boolean = false;
  formLoaded: boolean = false;
  isLoadingForm: boolean = false;

  isRncReporter: boolean = false;
  isRncInspector: boolean = false;

  private rncService = inject(RncService);
  private occurService = inject(OccurService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  private collapseListener: (() => void) | null = null;

  constructor(
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.isRncReporter = this.rnc?.reporter?.id === Number(this.sessionService.getItem('userId')) && this.sessionService.hasRole('COMMON_RNC_REPORTER');
    this.isRncInspector = this.rnc?.inspector?.id === Number(this.sessionService.getItem('userId')) && this.sessionService.hasRole('COMMON_QUALITY_INSPECTOR');

    if (this.occur) {
      this.occurLoaded = true;
    }

    if (this.rncForm) {
      this.formLoaded = true;
    }

    if (this.rnc?.hasFormAssigned && this.rnc?.form?.id && !this.rncForm) {
      this.loadRncFormById(this.rnc.form.id);
    }
  }

  ngAfterViewInit(): void {
    const collapseElement = this.occurCollapse?.nativeElement;
    if (collapseElement) {
      if (this.collapseListener) {
        collapseElement.removeEventListener('show.bs.collapse', this.collapseListener);
      }

      this.collapseListener = () => {
        this.loadOccurOnDemand();
      };

      collapseElement.addEventListener('show.bs.collapse', this.collapseListener);
    }
  }

  ngOnDestroy(): void {
    const collapseElement = this.occurCollapse?.nativeElement;
    if (collapseElement && this.collapseListener) {
      collapseElement.removeEventListener('show.bs.collapse', this.collapseListener);
      this.collapseListener = null;
    }
  }

  private loadOccurOnDemand(): void {
    if (this.occurLoaded || this.occur) {
      return;
    }

    if (!this.rnc?.occur?.id) {
      return;
    }

    this.loadingService.show();

    this.occurService.getOccur(this.rnc.occur.id).subscribe({
      next: (occur) => {
        this.occur = occur;
        this.occurLoaded = true;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar ocorrência:', error);
        this.loadingService.hide();
      }
    });
  }

  private loadRncFormById(formId: number): void {
    if (this.isLoadingForm) {
      return;
    }

    if (!formId) {
      return;
    }

    this.isLoadingForm = true;
    this.loadingService.show();

    this.rncService.getRncForm(formId).subscribe({
      next: (rncForm) => {
        this.rncForm = rncForm;
        this.formLoaded = true;
        this.isLoadingForm = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao carregar formulário da RNC:', error);
        this.isLoadingForm = false;
        this.loadingService.hide();
      }
    });
  }

  reloadRnc(): void {
    if (!this.rnc?.id || this.isReloading) return;

    this.isReloading = true;
    this.loadingService.show();

    this.rncService.getRnc(this.rnc.id).subscribe({
      next: (rnc: Rnc) => {
        this.rnc = rnc;
        this.isReloading = false;
        this.loadingService.hide();

        if (rnc.hasFormAssigned && rnc?.form?.id) {
          this.formLoaded = false;
          this.rncForm = null;
          this.loadRncFormById(rnc.form.id);
        } else {
          this.rncForm = null;
          this.formLoaded = true;
        }

        this.rncReloaded.emit(rnc);
      },
      error: (error) => {
        console.error('Erro ao recarregar RNC:', error);
        this.isReloading = false;
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao recarregar RNC. Tente novamente.');
      }
    });
  }

  // ==================== MÉTODOS PARA VERIFICAR SEÇÕES DO FORMULÁRIO ====================

  /**
   * Verifica se a validação tem dados válidos
   */
  hasValidValidation(): boolean {
    if (!this.rncForm?.validation) return false;
    const v = this.rncForm.validation;
    return !!(v.description || v.validatedAt || v.validatedBy);
  }

  /**
   * Verifica se a implementação tem dados válidos
   */
  hasValidImplementation(): boolean {
    if (!this.rncForm?.implementation) return false;
    const i = this.rncForm.implementation;
    return !!(i.description || i.implementedAt || i.implementedBy);
  }

  /**
   * Verifica se a eficácia tem dados válidos
   */
  hasValidEfficacy(): boolean {
    if (!this.rncForm?.efficacy) return false;
    const e = this.rncForm.efficacy;
    return !!(e.description || e.analysedAt || e.analysedBy);
  }

  // ==================== MÉTODOS DE PDF E ALERTAS ====================

  exportPdf(): void {
    if (!this.rnc?.id || this.isExporting) return;

    this.isExporting = true;
    this.loadingService.show();

    this.rncService.generateRncPdf(this.rnc.id).subscribe({
      next: (response) => {
        this.isExporting = false;
        this.loadingService.hide();
        this.openPdfInNewTab(response);
      },
      error: (error) => {
        console.error('Erro ao exportar PDF:', error);
        this.isExporting = false;
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao gerar PDF. Tente novamente.');
      }
    });
  }

  sendPdfByEmail(): void {
    if (!this.rnc?.id || this.isSendingEmail) return;

    this.isSendingEmail = true;
    this.loadingService.show();

    this.rncService.generateRncPdf(this.rnc.id, true).subscribe({
      next: () => {
        this.isSendingEmail = false;
        this.loadingService.hide();
        this.showAlert('SUCCESS', 'PDF enviado por e-mail com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao enviar PDF por e-mail:', error);
        this.isSendingEmail = false;
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao enviar PDF por e-mail. Tente novamente.');
      }
    });
  }

  private openPdfInNewTab(response: any): void {
    const byteCharacters = atob(response.fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: response.fileType });

    const file = new File([blob], response.fileName, { type: response.fileType });
    const url = URL.createObjectURL(file);

    window.open(url, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
  }

  getFollowUpStatus(followUpDate: string): 'pending' | 'approaching' | 'overdue' | 'none' {
    if (!followUpDate) return 'none';

    const followUp = new Date(followUpDate);
    const today = new Date();
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(today.getDate() - 15);

    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (followUp < today) {
      return 'overdue';
    }

    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    if (followUp <= fifteenDaysFromNow) {
      return 'approaching';
    }

    return 'pending';
  }

  private showAlert(
    type: "SUCCESS" | "WARNING" | "ERROR",
    message: string,
  ): void {
    this.router.navigate([], {
      queryParams: {
        action: type,
        message
      }
    });
  }
}