// occur-main-viewer.component.ts

import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Occur } from "../../../../../core/model/occur/occur.model";
import { SessionService } from "../../../../../core/service/session/session.service";
import { OccurStatusPipe } from "../../../../../pipe/occur-status-pipe.pipe";
import { OccurService, } from "../../../../../core/service/occur/occur.service";
import { LoadingService } from "../../../../../core/service/loading/loading.service";
import { UserSystemPipe } from "../../../../../pipe/user-system-pipe";
import { DocumentResponse } from "../../../../../core/model/document/document-response.model";

@Component({
  selector: "app-occur-main-viewer",
  imports: [
    DatePipe,
    OccurStatusPipe,
    UserSystemPipe,
  ],
  templateUrl: "./occur-main-viewer.component.html",
  styleUrl: "./occur-main-viewer.component.scss",
  standalone: true,
})
export class OccurMainViewerComponent implements OnInit {
  @Input() occur: Occur | null = null;
  @Output() occurReloaded = new EventEmitter<Occur>();

  isOccurOpener: boolean = false;
  isInspector: boolean = false;
  isOpener: boolean = false;
  isOccurInspector: boolean = false;

  isExporting: boolean = false;
  isSendingEmail: boolean = false;
  isReloading: boolean = false;

  private occurService = inject(OccurService);
  private sessionService = inject(SessionService);
  private loadingService = inject(LoadingService);
  private router = inject(Router);

  ngOnInit(): void {
    this.isOccurOpener =
      Number(this.sessionService.getItem("userId")) === this.occur?.opener?.id;
    this.isInspector = this.sessionService.hasRole("COMMON_QUALITY_INSPECTOR");
    this.isOpener = this.sessionService.hasRole("COMMON_EVENT_OPENER");
    this.isOccurInspector =
      Number(this.sessionService.getItem("userId")) ===
      this.occur?.inspector?.id;
  }

  exportPdf(): void {
    if (!this.occur?.id || this.isExporting) return;

    this.isExporting = true;
    this.loadingService.show();

    this.occurService.generateOccurPdf(this.occur.id, false).subscribe({
      next: (response: DocumentResponse) => {
        this.openPdfInNewTab(response);
        this.isExporting = false;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Erro ao gerar PDF:', error);
        this.showAlert('ERROR', 'Erro ao gerar PDF. Tente novamente.');
        this.isExporting = false;
        this.loadingService.hide();
      }
    });
  }

  sendPdfByEmail(): void {
    if (!this.occur?.id || this.isSendingEmail) return;

    this.isSendingEmail = true;
    this.loadingService.show();

    this.occurService.generateOccurPdf(this.occur.id, true).subscribe({
      next: (response: DocumentResponse) => {
        this.isSendingEmail = false;
        this.loadingService.hide();
        this.showAlert('SUCCESS', 'PDF enviado por e-mail com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao enviar PDF por email:', error);
        this.showAlert('ERROR', 'Erro ao enviar PDF por e-mail. Tente novamente.');
        this.isSendingEmail = false;
        this.loadingService.hide();
      }
    });
  }

  reloadOccur(): void {
    if (!this.occur?.id || this.isReloading) return;

    this.isReloading = true;
    this.loadingService.show();

    this.occurService.getOccur(this.occur.id).subscribe({
      next: (occur: Occur) => {
        this.occur = occur;
        this.isReloading = false;
        this.loadingService.hide();

        this.ngOnInit();

        this.occurReloaded.emit(occur);

      },
      error: (error) => {
        console.error('Erro ao recarregar ocorrência:', error);
        this.isReloading = false;
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao recarregar ocorrência. Tente novamente.');
      }
    });
  }

  private openPdfInNewTab(response: DocumentResponse): void {
    const byteCharacters = atob(response.fileContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: response.fileType });

    const url = URL.createObjectURL(blob);
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