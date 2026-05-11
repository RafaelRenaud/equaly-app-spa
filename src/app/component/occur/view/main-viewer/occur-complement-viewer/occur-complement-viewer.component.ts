import { CommonModule } from "@angular/common";
import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbModal, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { Subscription, interval, forkJoin, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { FileAccessResponse } from "../../../../../core/model/file/file-access.model";
import { FileResponse } from "../../../../../core/model/file/file-response.model";
import { FilesResponse } from "../../../../../core/model/file/files-response.model";
import { CloseOccur } from "../../../../../core/model/occur/occur-close-request.model";
import { ReportOccur } from "../../../../../core/model/occur/occur-report-request.model";
import { Occur } from "../../../../../core/model/occur/occur.model";
import { FileService } from "../../../../../core/service/file/file.service";
import { LoadingService } from "../../../../../core/service/loading/loading.service";
import { OccurService } from "../../../../../core/service/occur/occur.service";
import { SessionService } from "../../../../../core/service/session/session.service";

interface EditRequest {
  id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  description: string;
  requestedBy: string;
  requestedAt: string;
}

interface Activity {
  id: number;
  type: "CREATE" | "UPDATE" | "ATTACHMENT" | "COMMENT";
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
  selector: "app-occur-complement-viewer",
  imports: [CommonModule, NgbNavModule, FormsModule],
  templateUrl: "./occur-complement-viewer.component.html",
  styleUrl: "./occur-complement-viewer.component.scss",
  standalone: true,
})
export class OccurComplementViewerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) occur!: Occur;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild("uploadProgressModal") uploadProgressModal: any;

  activeTab: string = "attachments";

  existingFiles: FileResponse[] = [];
  attachedFiles: File[] = [];
  editRequests: EditRequest[] = [];
  activities: Activity[] = [];
  ratings: DaltonRating[] = [];

  isDaltonEnabled: boolean = false;
  isOccurOpener: boolean = false;
  isOccurInspector: boolean = false;
  hasInspectorRole: boolean = false;
  isSavingAttachments: boolean = false;

  inspectionReport: string = "";
  generateNonConformity: boolean = false;
  closeInfo: string = "";

  maxFiles: number = 10;
  uploadProgress = {
    percent: 0,
    message: "Enviando arquivos...",
  };

  private refreshTimerSubscription?: Subscription;
  private readonly REFRESH_INTERVAL_MS = 120000;

  constructor(
    private fileService: FileService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private occurService: OccurService,
    private modalService: NgbModal,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isDaltonEnabled =
      this.sessionService.getItem("isDaltonEnabled") === "true";
    this.isOccurOpener =
      Number(this.sessionService.getItem("userId")) === this.occur?.opener?.id;
    this.isOccurInspector =
      Number(this.sessionService.getItem("userId")) ===
      this.occur?.inspector?.id;
    this.hasInspectorRole = this.sessionService.hasRole(
      "COMMON_QUALITY_INSPECTOR",
    );

    if (this.occur?.id && this.occur.status !== "DRAFT_OPENED") {
      this.loadAttachments();
      this.startAutoRefresh();
    }

    if (this.occur?.id) {
      this.loadEditRequests();
      this.loadActivities();
      this.loadRatings();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();
    this.refreshTimerSubscription = interval(
      this.REFRESH_INTERVAL_MS,
    ).subscribe(() => {
      if (
        this.activeTab === "attachments" &&
        this.occur?.status !== "DRAFT_OPENED"
      ) {
        this.loadAttachmentsSilently();
      }
    });
  }

  private stopAutoRefresh(): void {
    if (this.refreshTimerSubscription) {
      this.refreshTimerSubscription.unsubscribe();
      this.refreshTimerSubscription = undefined;
    }
  }

  refreshAttachments(): void {
    if (!this.occur?.id) return;
    this.loadAttachments();
  }

  private loadAttachments(): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    this.fileService
      .getFiles(this.occur.id.toString(), "OCCUR", 0, 10)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
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
          this.showAlert("ERROR", "Erro ao carregar arquivos da ocorrência.");
        },
      });
  }

  private loadAttachmentsSilently(): void {
    if (!this.occur?.id) return;

    this.fileService
      .getFiles(this.occur.id.toString(), "OCCUR", 0, 10)
      .subscribe({
        next: (response: FilesResponse) => {
          const newFiles =
            response && response.files && Array.isArray(response.files)
              ? response.files
              : response && Array.isArray(response)
                ? response
                : [];

          this.existingFiles = newFiles;
        },
        error: () => {
          console.error("Erro ao carregar anexos automaticamente");
        },
      });
  }

  private showAlert(
    type: "SUCCESS" | "WARNING" | "ERROR",
    message: string,
  ): void {
    this.router.navigate([], { queryParams: { action: type, message } });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    const totalFiles = this.existingFiles.length + this.attachedFiles.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (totalFiles + i >= this.maxFiles) {
        this.showAlert(
          "WARNING",
          `Limite máximo de ${this.maxFiles} anexos atingido.`,
        );
        break;
      }

      const allowedExtensions = [
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
        ".heic",
        ".xml",
      ];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        this.showAlert(
          "WARNING",
          `Tipo de arquivo não suportado: ${file.name}. Formatos permitidos: PDF, JPG, PNG, HEIC, XML.`,
        );
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.showAlert(
          "WARNING",
          `Arquivo muito grande: ${file.name} (máximo 10MB).`,
        );
        continue;
      }

      this.attachedFiles.push(file);
    }

    input.value = "";
  }

  removeNewFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  removeExistingFile(file: FileResponse): void {
    if (!this.occur?.id || !file.id) return;

    this.loadingService.show();

    this.fileService
      .deleteFile(file.id.toString(), this.occur.id.toString(), "OCCUR")
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: () => {
          this.loadAttachments();
          this.showAlert("SUCCESS", "Arquivo removido com sucesso!");
        },
        error: () => {
          this.showAlert("ERROR", "Erro ao remover arquivo. Tente novamente.");
        },
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

    this.fileService
      .getFileAccess(file.id!, this.occur.id.toString(), "OCCUR", file.hash!)
      .subscribe({
        next: (response: FileAccessResponse) => {
          this.loadingService.hide();
          window.open(`${response.url}?${response.access_token}`, "_blank");
        },
        error: () => {
          this.loadingService.hide();
          this.showAlert(
            "ERROR",
            "Erro ao acessar o arquivo. Tente novamente.",
          );
        },
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  openInspectModal(content: any): void {
    this.modalService.open(content, { size: "lg", centered: true });
  }

  confirmInspection(): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    const reportData: ReportOccur = {
      inspectorReport: this.inspectionReport,
      hasRNCOpened: this.generateNonConformity,
    };

    this.occurService
      .reportOccurInspection(this.occur.id, reportData)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.router.navigate(["/occurs"], {
            queryParams: {
              action: "SUCCESS",
              message: `Inspeção da ocorrência ${this.occur?.code} realizada com sucesso!`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao inspecionar ocorrência. Tente novamente.`,
            },
          });
        },
      });
  }

  openCloseModal(content: any): void {
    this.modalService.open(content, { size: "lg", centered: true });
  }

  confirmClose(): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    const closeData: CloseOccur = {
      closeReason: this.closeInfo,
    };

    this.occurService.closeOccur(this.occur.id, closeData).subscribe({
      next: () => {
        this.loadingService.hide();
        this.router.navigate(["/occurs"], {
          queryParams: {
            action: "SUCCESS",
            message: `Ocorrência ${this.occur?.code} encerrada com sucesso!`,
          },
        });
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao encerrar ocorrência. Tente novamente.`,
          },
        });
      },
    });
  }

  async saveAttachments(): Promise<void> {
    if (!this.occur?.id || this.attachedFiles.length === 0) return;

    const totalAfterAdd = this.existingFiles.length + this.attachedFiles.length;
    if (totalAfterAdd > this.maxFiles) {
      this.showAlert(
        "WARNING",
        `Limite máximo de ${this.maxFiles} anexos. Você pode adicionar no máximo ${this.maxFiles - this.existingFiles.length}.`,
      );
      return;
    }

    this.isSavingAttachments = true;
    this.modalService.open(this.uploadProgressModal, {
      centered: true,
      backdrop: "static",
      keyboard: false,
      size: "md",
    });

    let currentProgress = 0;

    try {
      this.uploadProgress.percent = 10;
      this.uploadProgress.message = "Comprimindo imagens...";

      const compressedFiles = await Promise.all(
        this.attachedFiles.map((file) => this.fileService.compressImage(file)),
      );

      this.uploadProgress.percent = 20;
      this.uploadProgress.message = "Enviando arquivos...";
      currentProgress = 20;

      const totalFiles = compressedFiles.length;
      let completedFiles = 0;

      const uploads = compressedFiles.map((file) =>
        this.fileService
          .createFile(this.occur!.id!.toString(), "OCCUR", file, file.name)
          .pipe(
            map(() => {
              completedFiles++;
              const newPercent =
                20 + Math.floor((completedFiles / totalFiles) * 80);
              if (newPercent > currentProgress) {
                currentProgress = newPercent;
                this.uploadProgress.percent = currentProgress;
              }
              return true;
            }),
            catchError(() => of(false)),
          ),
      );

      const results = await forkJoin(uploads).toPromise();
      const failedCount = results?.filter((r) => r === false).length || 0;

      if (failedCount > 0) {
        this.showAlert("ERROR", `${failedCount} arquivo(s) não foram salvos.`);
      } else {
        this.attachedFiles = [];
        await this.loadAttachments();
        this.showAlert(
          "SUCCESS",
          `${compressedFiles.length} anexo(s) adicionado(s) com sucesso!`,
        );
      }

      this.modalService.dismissAll();
    } catch (error) {
      this.modalService.dismissAll();
      this.showAlert("ERROR", "Erro ao adicionar anexos. Tente novamente.");
    } finally {
      this.isSavingAttachments = false;
    }
  }
}
