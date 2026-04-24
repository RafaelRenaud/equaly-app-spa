// occur-complement-viewer.component.ts
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { FileAccessResponse } from '../../../../../core/model/file/file-access.model';
import { FileResponse } from '../../../../../core/model/file/file-response.model';
import { FilesResponse } from '../../../../../core/model/file/files-response.model';
import { CloseOccur } from '../../../../../core/model/occur/occur-close-request.model';
import { ReportOccur } from '../../../../../core/model/occur/occur-report-request.model';
import { Occur } from '../../../../../core/model/occur/occur.model';
import { FileService } from '../../../../../core/service/file/file.service';
import { LoadingService } from '../../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../../core/service/occur/occur.service';
import { SessionService } from '../../../../../core/service/session/session.service';

interface EditRequest {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  description: string;
  requestedBy: string;
  requestedAt: string;
}

interface Activity {
  id: number;
  type: 'CREATE' | 'UPDATE' | 'ATTACHMENT' | 'COMMENT';
  action: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

interface DaltonRating {
  id: number;
  category: string;
  score: number;
  comment: string;
  evaluatedAt: string;
}

@Component({
  selector: 'app-occur-complement-viewer',
  imports: [CommonModule, NgbNavModule, DatePipe, FormsModule],
  templateUrl: './occur-complement-viewer.component.html',
  styleUrl: './occur-complement-viewer.component.scss',
  standalone: true
})
export class OccurComplementViewerComponent implements OnInit {

  @Input() occur: Occur | null = null;

  activeTab: string = 'attachments';

  existingFiles: FileResponse[] = [];
  editRequests: EditRequest[] = [];
  activities: Activity[] = [];
  ratings: DaltonRating[] = [];

  isDaltonEnabled: boolean = false;
  isOccurOpener: boolean = false;
  isOccurInspector: boolean = false;

  inspectionReport: string = '';
  generateNonConformity: boolean = false;
  closeInfo: string = '';

  constructor(
    private fileService: FileService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private occurService: OccurService,
    private modalService: NgbModal,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.isDaltonEnabled = this.sessionService.getItem("isDaltonEnabled") === 'true';
    this.isOccurOpener = Number(this.sessionService.getItem("userId")) === this.occur?.opener?.id;
    this.isOccurInspector = Number(this.sessionService.getItem("userId")) === this.occur?.inspector?.id;

    if (this.occur?.id) {
      this.loadAttachments();
      this.loadEditRequests();
      this.loadActivities();
      this.loadRatings();
    }
  }

  private loadAttachments(): void {
    if (!this.occur?.id) return;

    this.fileService.getFiles(this.occur.id.toString(), 'OCCUR', 0, 10).subscribe({
      next: (response: FilesResponse) => {
        if (response && response.files && Array.isArray(response.files)) {
          this.existingFiles = response.files;
        } else if (response && Array.isArray(response)) {
          this.existingFiles = response;
        } else {
          this.existingFiles = [];
        }
      },
      error: () => {
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao carregar arquivos da ocorrência.`
          }
        });
      }
    });
  }

  private loadEditRequests(): void {
    setTimeout(() => {
      this.editRequests = [];
    }, 500);
  }

  private loadActivities(): void {
    setTimeout(() => {
      this.activities = [];
    }, 500);
  }

  private loadRatings(): void {
    setTimeout(() => {
      this.ratings = [];
    }, 500);
  }

  viewFile(file: FileResponse): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    this.fileService.getFileAccess(file.id!, this.occur.id.toString(), 'OCCUR', file.hash!).subscribe({
      next: (response: FileAccessResponse) => {
        this.loadingService.hide();
        window.open(`${response.url}?${response.access_token}`, '_blank');
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao acessar o arquivo. Tente novamente.`
          }
        });
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openInspectModal(content: any): void {
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  confirmInspection(): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    const reportData: ReportOccur = {
      inspectorReport: this.inspectionReport,
      hasRNCOpened: this.generateNonConformity
    };

    this.occurService.reportOccurInspection(this.occur.id, reportData).subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/occurs'], {
          queryParams: {
            action: "SUCCESS",
            message: `Inspeção da ocorrência ` + this.occur?.code + ` realizada com sucesso!`
          }
        });
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao inspecionar ocorrência. Tente novamente.`
          }
        });
      }
    });
  }

  openCloseModal(content: any): void {
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  confirmClose(): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    const closeData: CloseOccur = {
      closeReason: this.closeInfo
    };

    this.occurService.closeOccur(this.occur.id, closeData).subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(['/occurs'], {
          queryParams: {
            action: "SUCCESS",
            message: `Ocorrência ` + this.occur?.code + ` encerrada com sucesso!`
          }
        });
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao encerrar ocorrência. Tente novamente.`
          }
        });
      }
    });
  }
}