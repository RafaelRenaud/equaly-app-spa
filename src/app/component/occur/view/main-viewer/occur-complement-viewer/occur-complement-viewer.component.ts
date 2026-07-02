import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  NgbModal,
  NgbNavModule,
  NgbPaginationModule,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription, forkJoin, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { FileAccessResponse } from "../../../../../core/model/file/file-access.model";
import { FileResponse } from "../../../../../core/model/file/file-response.model";
import { FilesResponse } from "../../../../../core/model/file/files-response.model";
import { CloseOccur } from "../../../../../core/model/occur/occur-close-request.model";
import { ReportOccur } from "../../../../../core/model/occur/occur-report-request.model";
import { Occur } from "../../../../../core/model/occur/occur.model";
import { UserResponse } from "../../../../../core/model/user/user-response.model";
import { FileService } from "../../../../../core/service/file/file.service";
import { LoadingService } from "../../../../../core/service/loading/loading.service";
import { OccurAutoRefreshService } from "../../../../../core/service/occur/occur-auto-refresh.service";
import { OccurService } from "../../../../../core/service/occur/occur.service";
import { SessionService } from "../../../../../core/service/session/session.service";
import { AuditComponent } from "../../../../audit/audit.component";
import { UserTypeHeadSearchComponent } from "../../../../user/search/user-type-head-search/user-type-head-search.component";

@Component({
  selector: "app-occur-complement-viewer",
  imports: [
    CommonModule,
    NgbNavModule,
    FormsModule,
    NgbPaginationModule,
    AuditComponent,
    UserTypeHeadSearchComponent
  ],
  templateUrl: "./occur-complement-viewer.component.html",
  styleUrl: "./occur-complement-viewer.component.scss",
  standalone: true,
})
export class OccurComplementViewerComponent implements OnInit, OnDestroy {
  @Input({ required: true }) occur!: Occur;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild("uploadProgressModal") uploadProgressModal: any;
  @ViewChild(AuditComponent) auditComponent!: AuditComponent;
  @ViewChild("rncTypeHead") rncTypeHead!: UserTypeHeadSearchComponent;

  activeTab: string = "attachments";

  existingFiles: FileResponse[] = [];
  attachedFiles: File[] = [];

  private typingTimeout: any;

  isDaltonEnabled: boolean = false;
  isOccurOpener: boolean = false;
  isOccurInspector: boolean = false;
  hasInspectorRole: boolean = false;
  isSavingAttachments: boolean = false;
  isUploading: boolean = false;

  inspectionReport: string = "";
  generateNonConformity: boolean = false;
  closeInfo: string = "";

  rncPriority: 'LOW' | 'MEDIUM' | 'HIGH' = this.occur?.priority || 'MEDIUM';
  rncReporter: UserResponse | null = null;
  isRncPriorityModalOpen: boolean = false;

  maxFiles: number = 10;
  uploadProgress = {
    percent: 0,
    message: "Enviando arquivos...",
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private fileService: FileService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private occurService: OccurService,
    private modalService: NgbModal,
    private router: Router,
    private autoRefresh: OccurAutoRefreshService,
  ) {
  }

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

    this.rncPriority = this.occur?.priority || 'MEDIUM';

    if (this.occur?.id) {
      this.loadAttachments();
    }

    this.subscriptions.push(
      this.autoRefresh.refresh$.subscribe(() => {
        if (this.activeTab === "attachments" && this.occur?.status !== "DRAFT_OPENED") {
          this.loadAttachmentsSilently();
        }
        if (this.auditComponent && typeof this.auditComponent.loadAudits === 'function') {
          this.auditComponent.loadAudits();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  onTypingStart(): void {
    this.autoRefresh.setInteractionActive(true);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  onTypingEnd(): void {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    this.typingTimeout = setTimeout(() => {
      this.autoRefresh.setInteractionActive(false);
    }, 2000);
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
      .pipe(finalize(() => {
        this.loadingService.hide();
      }))
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

    this.loadingService.show();

    this.fileService
      .getFiles(this.occur.id.toString(), "OCCUR", 0, 10)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        })
      )
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
    this.autoRefresh.setModalOpen(true);

    if (this.generateNonConformity) {
      this.openRncModal(content);
    } else {
      this.modalService.open(content, {
        size: "lg",
        centered: true,
        backdrop: 'static'
      });
    }
  }

  private openRncModal(content: any): void {
    this.rncReporter = null;
    if (this.rncTypeHead) {
      this.rncTypeHead.clear();
    }

    this.isRncPriorityModalOpen = true;
    this.modalService.open(content, {
      size: "lg",
      centered: true,
      backdrop: 'static'
    });
  }

  confirmInspectionWithRnc(): void {
    if (!this.occur?.id) return;

    if (!this.rncReporter) {
      this.showAlert("WARNING", "Por favor, selecione um responsável para a Não-Conformidade.");
      return;
    }

    this.loadingService.show();

    const reportData: ReportOccur = {
      inspectorReport: this.inspectionReport,
      rnc: {
        priority: this.rncPriority,
        reporter: {
          id: this.rncReporter.id
        }
      }
    };

    this.occurService
      .reportOccurInspection(this.occur.id, reportData)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.onModalClose();
          this.isRncPriorityModalOpen = false;
          this.router.navigate(["/occurs"], {
            queryParams: {
              action: "SUCCESS",
              message: `Inspeção da ocorrência ${this.occur?.code} realizada com sucesso! RNC criada com responsável ${this.rncReporter?.username}.`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.onModalClose();
          this.isRncPriorityModalOpen = false;
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao inspecionar ocorrência. Tente novamente.`,
            },
          });
        },
      });
  }

  confirmInspection(): void {
    if (!this.occur?.id) return;

    if (this.generateNonConformity) {
      this.confirmInspectionWithRnc();
      return;
    }

    this.loadingService.show();

    const reportData: ReportOccur = {
      inspectorReport: this.inspectionReport,
      rnc: null as any
    };

    this.occurService
      .reportOccurInspection(this.occur.id, reportData)
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.onModalClose();
          this.router.navigate(["/occurs"], {
            queryParams: {
              action: "SUCCESS",
              message: `Inspeção da ocorrência ${this.occur?.code} realizada com sucesso!`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.onModalClose();
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
    this.autoRefresh.setModalOpen(true);
    this.modalService.open(content, {
      size: "lg",
      centered: true,
      backdrop: 'static'
    });
  }

  onModalClose(): void {
    this.autoRefresh.setModalOpen(false);
    this.isRncPriorityModalOpen = false;
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
        this.onModalClose();
        this.router.navigate(["/occurs"], {
          queryParams: {
            action: "SUCCESS",
            message: `Ocorrência ${this.occur?.code} encerrada com sucesso!`,
          },
        });
      },
      error: () => {
        this.loadingService.hide();
        this.onModalClose();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: `Erro ao encerrar ocorrência. Tente novamente.`,
          },
        });
      },
    });
  }

  onRncReporterSelected(user: UserResponse | null): void {
    this.rncReporter = user;
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
    this.isUploading = true;
    let currentProgress = 0;

    const filesToUpload = [...this.attachedFiles];

    try {
      this.uploadProgress.percent = 10;
      this.uploadProgress.message = "Comprimindo imagens...";

      const compressedFiles = await Promise.all(
        filesToUpload.map((file) => this.fileService.compressImage(file)),
      );

      this.uploadProgress.percent = 20;
      this.uploadProgress.message = "Enviando arquivos...";
      currentProgress = 20;

      const totalFiles = compressedFiles.length;
      let completedFiles = 0;
      const failedFiles: File[] = [];

      const uploads = compressedFiles.map((compressedFile, index) => {
        const originalFile = filesToUpload[index];
        return this.fileService
          .createFile(this.occur!.id!.toString(), "OCCUR", compressedFile, originalFile.name)
          .pipe(
            map(() => {
              completedFiles++;
              const newPercent = 20 + Math.floor((completedFiles / totalFiles) * 80);
              if (newPercent > currentProgress) {
                currentProgress = newPercent;
                this.uploadProgress.percent = currentProgress;
              }
              return true;
            }),
            catchError((error) => {
              failedFiles.push(originalFile);
              completedFiles++;
              const newPercent = 20 + Math.floor((completedFiles / totalFiles) * 80);
              if (newPercent > currentProgress) {
                currentProgress = newPercent;
                this.uploadProgress.percent = currentProgress;
              }
              return of(false);
            }),
          );
      });

      const results = await forkJoin(uploads).toPromise();
      const failedCount = results?.filter((r) => r === false).length || 0;

      this.isUploading = false;

      this.loadAttachments();

      if (failedCount > 0) {
        this.attachedFiles = failedFiles;

        if (failedCount === filesToUpload.length) {
          this.showAlert("ERROR", `Todos os ${failedCount} arquivo(s) falharam ao serem salvos. Tente novamente.`);
        } else {
          const successCount = filesToUpload.length - failedCount;
          this.showAlert(
            "WARNING",
            `${successCount} arquivo(s) salvos com sucesso, mas ${failedCount} arquivo(s) falharam. Os arquivos com erro permanecem na lista para nova tentativa.`
          );
        }
      } else {
        this.attachedFiles = [];
        this.showAlert(
          "SUCCESS",
          `${filesToUpload.length} anexo(s) adicionado(s) com sucesso!`,
        );
      }
    } catch (error) {
      this.isUploading = false;
      this.attachedFiles = filesToUpload;
      this.showAlert("ERROR", "Erro ao adicionar anexos. Tente novamente.");
    } finally {
      this.isSavingAttachments = false;
      this.uploadProgress.percent = 0;
    }
  }
}