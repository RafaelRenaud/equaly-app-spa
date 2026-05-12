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
import {
  NgbModal,
  NgbNavModule,
  NgbPaginationModule,
} from "@ng-bootstrap/ng-bootstrap";
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
import { EditRequestService } from "../../../../../core/service/edit-request/edit-request.service";
import { EditRequest } from "../../../../../core/model/edit-request/edit-request.model";

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
  imports: [CommonModule, NgbNavModule, FormsModule, NgbPaginationModule],
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

  editRequestJustification: string = "";
  isSubmittingEditRequest: boolean = false;
  selectedEditRequest: EditRequest | null = null;

  editRequestsPage: number = 0;
  editRequestsPageSize: number = 5;
  editRequestsTotal: number = 0;
  isLoadingEditRequests: boolean = false;

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
    private editRequestService: EditRequestService,
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

    if (this.occur?.id) {
      this.loadAttachments();
      this.loadEditRequests();
      this.loadActivities();
      this.loadRatings();
    }

    if (this.occur?.id && this.occur.status !== "DRAFT_OPENED") {
      this.startAutoRefresh();
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
      if (this.activeTab === "editRequests") {
        this.loadEditRequestsSilently();
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

  loadEditRequests(): void {
    if (!this.occur?.id) return;

    this.isLoadingEditRequests = true;

    this.editRequestService
      .getEditRequests(
        { subjectId: this.occur.id, subjectType: "OCCUR" },
        this.editRequestsPage,
        this.editRequestsPageSize,
      )
      .pipe(finalize(() => (this.isLoadingEditRequests = false)))
      .subscribe({
        next: (response) => {
          this.editRequests = response.editRequests || [];
          this.editRequestsTotal = response.pageable?.totalElements || 0;
        },
        error: () => {
          this.editRequests = [];
          this.showAlert("ERROR", "Erro ao carregar solicitações de edição.");
        },
      });
  }

  private loadEditRequestsSilently(): void {
    if (!this.occur?.id) return;

    this.editRequestService
      .getEditRequests(
        { subjectId: this.occur.id, subjectType: "OCCUR" },
        this.editRequestsPage,
        this.editRequestsPageSize,
      )
      .subscribe({
        next: (response) => {
          this.editRequests = response.editRequests || [];
          this.editRequestsTotal = response.pageable?.totalElements || 0;
        },
        error: () => {
          console.error(
            "Erro ao carregar solicitações de edição automaticamente",
          );
        },
      });
  }

  onEditRequestsPageChange(page: number): void {
    this.editRequestsPage = page;
    this.loadEditRequests();
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

  openEditRequestModal(content: any): void {
    if (
      this.occur.status === "AWAITING_REPORT" &&
      this.isOccurOpener &&
      !this.occur.hasInspectorAssigned
    ) {
      this.submitEditRequest();
      return;
    }

    this.editRequestJustification = "";
    this.modalService.open(content, { size: "lg", centered: true });
  }

  submitEditRequest(): void {
    if (!this.occur?.id) return;

    if (
      this.occur.status === "AWAITING_REPORT" &&
      this.isOccurOpener &&
      !this.occur.hasInspectorAssigned
    ) {
      this.loadingService.show();
      this.isSubmittingEditRequest = true;

      this.editRequestService
        .createEditRequest(
          { justification: "WORKFLOW DE BYPASS EXECUTADO COM SUCESSO" },
          this.occur.id,
          "OCCUR",
        )
        .subscribe({
          next: () => {
            this.isSubmittingEditRequest = false;
            this.loadingService.hide();
            this.loadEditRequests();
            this.showAlert(
              "SUCCESS",
              "Solicitação de edição enviada com sucesso!",
            );
            this.occurService.getOccur(this.occur!.id!).subscribe({
              next: (updatedOccur) => {
                this.occur = updatedOccur;
              },
            });
          },
          error: () => {
            this.isSubmittingEditRequest = false;
            this.loadingService.hide();
            this.showAlert(
              "ERROR",
              "Erro ao enviar solicitação de edição. Tente novamente.",
            );
          },
        });
      return;
    }

    if (!this.editRequestJustification.trim()) return;

    this.isSubmittingEditRequest = true;

    this.editRequestService
      .createEditRequest(
        { justification: this.editRequestJustification },
        this.occur.id,
        "OCCUR",
      )
      .subscribe({
        next: () => {
          this.isSubmittingEditRequest = false;
          this.modalService.dismissAll();
          this.loadEditRequests();
          this.showAlert(
            "SUCCESS",
            "Solicitação de edição enviada com sucesso!",
          );
        },
        error: () => {
          this.isSubmittingEditRequest = false;
          this.showAlert(
            "ERROR",
            "Erro ao enviar solicitação de edição. Tente novamente.",
          );
        },
      });
  }

  viewEditRequest(editRequest: EditRequest, content: any): void {
    this.selectedEditRequest = editRequest;
    this.modalService.open(content, { size: "lg", centered: true });
  }

  approveEditRequest(editRequest: EditRequest): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    this.editRequestService
      .updateEditRequest(
        editRequest.id!.toString(),
        "APPROVE",
        "OCCUR",
        this.occur.id,
      )
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.loadEditRequests();
          this.showAlert(
            "SUCCESS",
            "Solicitação de edição aprovada com sucesso!",
          );
        },
        error: () => {
          this.loadingService.hide();
          this.showAlert("ERROR", "Erro ao aprovar solicitação de edição.");
        },
      });
  }

  rejectEditRequest(editRequest: EditRequest): void {
    if (!this.occur?.id) return;

    this.loadingService.show();

    this.editRequestService
      .updateEditRequest(
        editRequest.id!.toString(),
        "DENY",
        "OCCUR",
        this.occur.id,
      )
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.loadEditRequests();
          this.showAlert("SUCCESS", "Solicitação de edição rejeitada.");
        },
        error: () => {
          this.loadingService.hide();
          this.showAlert("ERROR", "Erro ao rejeitar solicitação de edição.");
        },
      });
  }

  getEditRequestStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: "Pendente",
      APPROVED: "Aprovada",
      REJECTED: "Rejeitada",
    };
    return statusMap[status] || status;
  }

  getEditRequestStatusClass(status: string): string {
    const classMap: Record<string, string> = {
      PENDING: "bg-warning",
      APPROVED: "bg-success",
      REJECTED: "bg-danger",
    };
    return classMap[status] || "bg-secondary";
  }

  get pendingEditRequest(): EditRequest | undefined {
    return this.editRequests.find((er) => er.status === "PENDING");
  }
}
