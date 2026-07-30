// rnc-main-viewer.component.ts

import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { OccurMainViewerComponent } from "../../../occur/view/main-viewer/occur-main-viewer/occur-main-viewer.component";
import { RncService } from "../../../../core/service/rnc/rnc-service.service";
import { SessionService } from "../../../../core/service/session/session.service";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { OccurService } from "../../../../core/service/occur/occur.service";
import { RncForm } from "../../../../core/model/rnc/rnc-form.model";
import { Rnc } from "../../../../core/model/rnc/rnc.model";
import { Occur } from "../../../../core/model/occur/occur.model";
import { RncFormStatusPipe } from "../../../../pipe/rnc-form-status.pipe";
import { RncCauseCategoryPipe } from "../../../../pipe/rnc-form-cause-category.pipe";
import { RncCauseTypePipe } from "../../../../pipe/rnc-form-cause-type.pipe";

@Component({
  selector: "app-rnc-main-viewer",
  imports: [
    DatePipe,
    OccurMainViewerComponent,
    RncFormStatusPipe,
    RncCauseCategoryPipe,
    RncCauseTypePipe
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

  private rncService = inject(RncService);
  private occurService = inject(OccurService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  private collapseListener: (() => void) | null = null;

  ngOnInit(): void {
    // Se já tem ocorrência via Input, marca como carregada
    if (this.occur) {
      this.occurLoaded = true;
    }

    // Se já tem formulário via Input, marca como carregado
    if (this.rncForm) {
      this.formLoaded = true;
    }

    // Se tem formulário associado mas não foi passado via Input, carrega sob demanda
    if (this.rnc?.hasFormAssigned && !this.rncForm) {
      this.loadRncForm();
    }
  }

  ngAfterViewInit(): void {
    // Detecta quando o accordion é aberto
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

  /**
   * Carrega a ocorrência sob demanda quando o accordion é aberto
   * Só carrega uma vez
   */
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

  /**
   * Carrega o formulário da RNC via query param rncId
   * GET /rnc_forms?rncId={rncId}
   */
  private loadRncForm(): void {
    if (this.formLoaded || this.isLoadingForm) {
      return;
    }

    if (!this.rnc?.id) {
      return;
    }

    this.isLoadingForm = true;
    this.loadingService.show();

    const filters = { rncId: this.rnc.id };

    this.rncService.getRncForms(filters, 0, 1).subscribe({
      next: (response) => {
        this.isLoadingForm = false;
        this.loadingService.hide();

        if (response.forms && response.forms.length > 0) {
          this.rncForm = response.forms[0];
          this.formLoaded = true;
        } else {
          // Se não encontrou formulário, mantém como null
          this.formLoaded = true;
        }
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

        // ✅ Se tiver formulário associado e não estiver carregado, carrega
        if (rnc.hasFormAssigned && !this.rncForm) {
          this.loadRncForm();
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

  exportPdf(): void {
    if (!this.rnc?.id || this.isExporting) return;

    this.isExporting = true;
    this.loadingService.show();

    setTimeout(() => {
      this.isExporting = false;
      this.loadingService.hide();
      this.showAlert('WARNING', 'Funcionalidade de PDF para RNC em desenvolvimento.');
    }, 1000);
  }

  sendPdfByEmail(): void {
    if (!this.rnc?.id || this.isSendingEmail) return;

    this.isSendingEmail = true;
    this.loadingService.show();

    setTimeout(() => {
      this.isSendingEmail = false;
      this.loadingService.hide();
      this.showAlert('WARNING', 'Funcionalidade de envio por e-mail para RNC em desenvolvimento.');
    }, 1000);
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