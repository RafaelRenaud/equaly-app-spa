import { CommonModule } from "@angular/common";
import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  NgbModal,
  NgbNavModule,
} from "@ng-bootstrap/ng-bootstrap";
import { Subscription, forkJoin, of } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { FileAccessResponse } from "../../../../core/model/file/file-access.model";
import { FileResponse } from "../../../../core/model/file/file-response.model";
import { FilesResponse } from "../../../../core/model/file/files-response.model";
import { RncFormEfficacyRequest } from "../../../../core/model/rnc/rnc-form-efficacy-request.model";
import { RncFormImplementationRequest } from "../../../../core/model/rnc/rnc-form-implementation-request.model";
import { RncFormValidationRequest } from "../../../../core/model/rnc/rnc-form-validation-request.model";
import { RncForm } from "../../../../core/model/rnc/rnc-form.model";
import { Rnc } from "../../../../core/model/rnc/rnc.model";
import { FileService } from "../../../../core/service/file/file.service";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { RncAutoRefreshService } from "../../../../core/service/rnc/rnc-auto-refresh.service";
import { RncService } from "../../../../core/service/rnc/rnc-service.service";
import { SessionService } from "../../../../core/service/session/session.service";
import { AuditComponent } from "../../../audit/audit.component";

@Component({
  selector: "app-rnc-complement-viewer",
  imports: [
    CommonModule,
    NgbNavModule,
    FormsModule,
    AuditComponent,
  ],
  templateUrl: "./rnc-complement-viewer.component.html",
  styleUrl: "./rnc-complement-viewer.component.scss",
  standalone: true,
})
export class RncComplementViewerComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) rnc!: Rnc;
  @Input({ required: true }) rncForm!: RncForm | null;
  @ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(AuditComponent) auditComponent!: AuditComponent;

  activeTab: string = "attachments";

  existingFiles: FileResponse[] = [];
  attachedFiles: File[] = [];

  private typingTimeout: any;

  isDaltonEnabled: boolean = false;
  isRncReporter: boolean = false;
  isRncInspector: boolean = false;
  isSavingAttachments: boolean = false;
  isUploading: boolean = false;

  validationDescription: string = "";
  isSubmittingValidation: boolean = false;

  implementationDescription: string = "";
  isSubmittingImplementation: boolean = false;

  efficacyDescription: string = "";
  isSubmittingEfficacy: boolean = false;
  selectedDeniedStatus: 'VALIDATION_EDITION' | 'IMPLEMENTATION_EDITION' = 'IMPLEMENTATION_EDITION';

  maxFiles: number = 20;
  uploadProgress = {
    percent: 0,
    message: "Enviando arquivos...",
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private fileService: FileService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private rncService: RncService,
    private modalService: NgbModal,
    private router: Router,
    private autoRefresh: RncAutoRefreshService,
  ) { }

  ngOnInit(): void {
    this.isDaltonEnabled = this.sessionService.getItem("isDaltonEnabled") === "true";
    this.isRncReporter = this.rnc?.reporter?.id === Number(this.sessionService.getItem("userId"));
    this.isRncInspector = this.rnc?.inspector?.id === Number(this.sessionService.getItem("userId"));

    this.subscriptions.push(
      this.autoRefresh.refresh$.subscribe(() => {
        if (this.activeTab === "attachments" && this.rnc?.status !== "OPENED" && this.rncForm?.id) {
          this.loadAttachmentsSilently();
        }
        if (this.auditComponent && typeof this.auditComponent.loadAudits === 'function') {
          this.auditComponent.loadAudits();
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rncForm'] && changes['rncForm'].currentValue) {
      const form = changes['rncForm'].currentValue;
      if (form?.id) {
        this.loadAttachments();
      }
    }
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

  onModalClose(): void {
    this.autoRefresh.setModalOpen(false);
  }

  refreshAttachments(): void {
    if (!this.rncForm?.id) return;
    this.loadAttachments();
  }

  private loadAttachments(): void {
    if (!this.rncForm?.id) return;

    this.loadingService.show();

    this.fileService
      .getFiles(this.rncForm.id.toString(), "RNC", 0, 20)
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
          this.showAlert("ERROR", "Erro ao carregar arquivos da RNC.");
        },
      });
  }

  private loadAttachmentsSilently(): void {
    if (!this.rncForm?.id) return;

    this.fileService
      .getFiles(this.rncForm.id.toString(), "RNC", 0, 20)
      .subscribe({
        next: (response: FilesResponse) => {
          const newFiles = response && response.files && Array.isArray(response.files)
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    const totalFiles = this.existingFiles.length + this.attachedFiles.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (totalFiles + i >= this.maxFiles) {
        this.showAlert("WARNING", `Limite máximo de ${this.maxFiles} anexos atingido.`);
        break;
      }

      const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".heic", ".xml"];
      const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        this.showAlert("WARNING", `Tipo de arquivo não suportado: ${file.name}. Formatos permitidos: PDF, JPG, PNG, HEIC, XML.`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.showAlert("WARNING", `Arquivo muito grande: ${file.name} (máximo 10MB).`);
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
    if (!this.rncForm?.id || !file.id) return;

    this.loadingService.show();

    this.fileService
      .deleteFile(file.id.toString(), this.rncForm.id.toString(), "RNC")
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
    if (!this.rncForm?.id) return;

    this.loadingService.show();

    this.fileService
      .getFileAccess(file.id!, this.rncForm.id.toString(), "RNC", file.hash!)
      .subscribe({
        next: (response: FileAccessResponse) => {
          this.loadingService.hide();
          window.open(`${response.url}?${response.access_token}`, "_blank");
        },
        error: () => {
          this.loadingService.hide();
          this.showAlert("ERROR", "Erro ao acessar o arquivo. Tente novamente.");
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

  async saveAttachments(): Promise<void> {
    if (!this.rncForm?.id || this.attachedFiles.length === 0) return;

    const totalAfterAdd = this.existingFiles.length + this.attachedFiles.length;
    if (totalAfterAdd > this.maxFiles) {
      this.showAlert("WARNING", `Limite máximo de ${this.maxFiles} anexos. Você pode adicionar no máximo ${this.maxFiles - this.existingFiles.length}.`);
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
          .createFile(this.rncForm!.id!.toString(), "RNC", compressedFile, originalFile.name)
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
            catchError(() => {
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
          this.showAlert("WARNING", `${successCount} arquivo(s) salvos com sucesso, mas ${failedCount} arquivo(s) falharam. Os arquivos com erro permanecem na lista para nova tentativa.`);
        }
      } else {
        this.attachedFiles = [];
        this.showAlert("SUCCESS", `${filesToUpload.length} anexo(s) adicionado(s) com sucesso!`);
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

  canShowValidation(): boolean {
    return !!(this.rncForm && this.rncForm.status === 'AWAITING_VALIDATION' && this.isRncInspector);
  }

  openValidationModal(content: any, isApproved: boolean): void {
    this.autoRefresh.setModalOpen(true);
    if (isApproved) {
      this.submitValidation(true);
    } else {
      this.modalService.open(content, { size: "lg", centered: true, backdrop: 'static' });
    }
  }

  confirmValidationReproval(): void {
    this.submitValidation(false);
  }

  private submitValidation(isApproved: boolean): void {
    if (!this.rncForm?.id || this.isSubmittingValidation) return;
    if (!this.validationDescription || this.validationDescription.length < 32) {
      this.showAlert("WARNING", "A descrição deve ter pelo menos 32 caracteres.");
      return;
    }

    this.isSubmittingValidation = true;
    this.loadingService.show();

    const data: RncFormValidationRequest = {
      status: isApproved ? 'APPROVED' : 'DENIED',
      description: this.validationDescription
    };

    this.rncService.validateRncForm(this.rncForm.id, data).subscribe({
      next: () => {
        this.isSubmittingValidation = false;
        this.loadingService.hide();
        this.validationDescription = '';
        this.onModalClose();
        this.showAlert('SUCCESS', isApproved ? 'Formulário movido para implementação.' : 'Formulário reprovado para correção do responsável.');
        this.reloadRncAndForm();
      },
      error: () => {
        this.isSubmittingValidation = false;
        this.loadingService.hide();
        this.onModalClose();
        this.showAlert('ERROR', 'Erro ao validar formulário. Tente novamente.');
      }
    });
  }

  canShowImplementation(): boolean {
    return !!(this.rncForm && (this.rncForm.status === 'AWAITING_IMPLEMENTATION' || this.rncForm.status === 'IMPLEMENTATION_EDITION') && this.isRncReporter);
  }

  submitImplementation(): void {
    if (!this.rncForm?.id || this.isSubmittingImplementation) return;
    if (!this.implementationDescription || this.implementationDescription.length < 32) {
      this.showAlert("WARNING", "A descrição deve ter pelo menos 32 caracteres.");
      return;
    }

    this.isSubmittingImplementation = true;
    this.loadingService.show();

    const data: RncFormImplementationRequest = {
      description: this.implementationDescription
    };

    this.rncService.implementRncForm(this.rncForm.id, data).subscribe({
      next: () => {
        this.isSubmittingImplementation = false;
        this.loadingService.hide();
        this.implementationDescription = '';
        this.showAlert('SUCCESS', 'Implementação enviada com sucesso!');
        this.reloadRncAndForm();
      },
      error: () => {
        this.isSubmittingImplementation = false;
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao enviar implementação. Tente novamente.');
      }
    });
  }

  canShowEfficacy(): boolean {
    return !!(this.rncForm && this.rncForm.status === 'AWAITING_EFFICACY_ANALYSIS' && this.isRncInspector);
  }

  openEfficacyModal(content: any, isApproved: boolean): void {
    this.autoRefresh.setModalOpen(true);

    if (!this.efficacyDescription || this.efficacyDescription.length < 32) {
      this.showAlert("WARNING", "A descrição deve ter pelo menos 32 caracteres.");
      return;
    }

    if (isApproved) {
      this.modalService.open(content, { size: "lg", centered: true, backdrop: 'static' });
    } else {
      this.selectedDeniedStatus = 'IMPLEMENTATION_EDITION';
      this.modalService.open(content, { size: "lg", centered: true, backdrop: 'static' });
    }
  }

  confirmEfficacyApproval(): void {
    this.submitEfficacy(true);
  }

  confirmEfficacyDenial(): void {
    this.submitEfficacy(false);
  }

  private submitEfficacy(isApproved: boolean): void {
    if (!this.rncForm?.id || this.isSubmittingEfficacy) return;
    if (!this.efficacyDescription || this.efficacyDescription.length < 32) {
      this.showAlert("WARNING", "A descrição deve ter pelo menos 32 caracteres.");
      return;
    }

    this.isSubmittingEfficacy = true;
    this.loadingService.show();

    const data: RncFormEfficacyRequest = {
      status: isApproved ? 'APPROVED' : 'DENIED',
      description: this.efficacyDescription
    };

    if (!isApproved) {
      data.efficacy = { deniedStatus: this.selectedDeniedStatus };
    }

    this.rncService.analyseRncForm(this.rncForm.id, data).subscribe({
      next: () => {
        this.isSubmittingEfficacy = false;
        this.loadingService.hide();
        this.efficacyDescription = '';
        this.onModalClose();
        this.showAlert('SUCCESS', isApproved ? 'Análise de eficácia aprovada. Não-Conformidade encerrada com sucesso!' : 'Análise de eficácia registrada. Formulário retornará para o estado selecionado.');
        this.reloadRncAndForm();
      },
      error: () => {
        this.isSubmittingEfficacy = false;
        this.loadingService.hide();
        this.onModalClose();
        this.showAlert('ERROR', 'Erro ao analisar eficácia. Tente novamente.');
      }
    });
  }

  private reloadRncAndForm(): void {
    setTimeout(() => {
      this.autoRefresh.forceRefresh();
    }, 500);
  }

  private showAlert(type: "SUCCESS" | "WARNING" | "ERROR", message: string): void {
    this.router.navigate([], { queryParams: { action: type, message } });
  }

  canAddAttachments(): boolean {
    if (!this.rncForm || !this.isRncReporter) return false;
    const restrictedStatuses = ['DRAFT_OPENED', 'AWAITING_EFFICACY_ANALYSIS', 'CLOSED'];
    return !restrictedStatuses.includes(this.rncForm.status);
  }

  shouldShowAttachmentsAlert(): boolean {
    return !!(this.rncForm && this.rncForm.status === 'DRAFT_OPENED' && this.isRncReporter);
  }

  canShowAttachmentsTab(): boolean {
    return this.rnc?.status !== 'OPENED' && !!this.rncForm;
  }
}