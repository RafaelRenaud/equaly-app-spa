import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbAccordionModule, NgbModal, NgbNavModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { forkJoin, of, Subscription } from "rxjs";
import { catchError, finalize, map } from "rxjs/operators";
import { FileResponse } from "../../../../core/model/file/file-response.model";
import { CreateUpdateRncForm } from "../../../../core/model/rnc/rnc-form-create-update.model";
import { RncForm } from "../../../../core/model/rnc/rnc-form.model";
import { Rnc } from "../../../../core/model/rnc/rnc.model";
import { UserResponse } from "../../../../core/model/user/user-response.model";
import { FileService } from "../../../../core/service/file/file.service";
import { LoadingService } from "../../../../core/service/loading/loading.service";
import { RncService } from "../../../../core/service/rnc/rnc-service.service";
import { SessionService } from "../../../../core/service/session/session.service";
import { UserTypeHeadSearchComponent } from "../../../user/search/user-type-head-search/user-type-head-search.component";
import { RncMainViewerComponent } from "../../view/rnc-main-viewer/rnc-main-viewer.component";

interface UploadProgress {
  current: number;
  total: number;
  status: "uploading" | "success" | "error";
  message: string;
}

@Component({
  selector: "app-rnc-form-edit",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbNavModule,
    RncMainViewerComponent,
    UserTypeHeadSearchComponent
  ],
  templateUrl: "./rnc-form-edit.component.html",
  styleUrl: "./rnc-form-edit.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RncFormEditComponent implements OnInit, OnDestroy {
  rnc: Rnc | null = null;
  rncForm: RncForm | null = null;
  occur: any = null;

  formGroup!: FormGroup;
  activeTab = "analysis";

  isSubmitting = false;
  isLoading = true;
  isNewForm = false;
  isRncReporter = false;
  isInternalInvolved = false;

  existingFiles: FileResponse[] = [];
  attachedFiles: File[] = [];
  maxFiles = 20;
  isSavingAttachments = false;
  isUploading = false;
  uploadProgress: UploadProgress = {
    current: 0,
    total: 0,
    status: "uploading",
    message: "Enviando arquivos...",
  };

  initialInvolvedId: number | null = null;

  private subscriptions: Subscription[] = [];
  private rncId = 0;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public modalService: NgbModal,
    private loadingService: LoadingService,
    private rncService: RncService,
    private fileService: FileService,
    private sessionService: SessionService,
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadData(): void {
    this.rncId = Number(this.route.snapshot.paramMap.get("id"));

    if (!this.rncId) {
      this.redirectWithError("ID da RNC não informado.");
      return;
    }

    this.loadingService.show();

    this.rncService.getRnc(this.rncId).subscribe({
      next: (rnc) => {
        this.rnc = rnc;
        this.isRncReporter = rnc.reporter?.id === Number(this.sessionService.getItem("userId"));

        if (!this.isRncReporter) {
          this.loadingService.hide();
          this.redirectWithError("Você não tem permissão para editar este formulário.");
          return;
        }

        if (rnc.hasFormAssigned && rnc.form?.id) {
          this.isNewForm = false;
          this.loadRncForm(rnc.form.id);
        } else {
          this.isNewForm = true;
          this.isLoading = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loadingService.hide();
        this.redirectWithError("Erro ao carregar RNC. Tente novamente.");
      },
    });
  }

  private loadRncForm(formId: number): void {
    this.rncService.getRncForm(formId).subscribe({
      next: (rncForm) => {
        this.rncForm = rncForm;

        if (rncForm.status !== "DRAFT_OPENED" && rncForm.status !== "VALIDATION_EDITION") {
          this.loadingService.hide();
          this.redirectWithError("Este formulário não está disponível para edição.");
          return;
        }

        this.isLoading = false;
        this.loadingService.hide();
        this.populateForm(rncForm);
        this.loadAttachments();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingService.hide();
        this.redirectWithError("Erro ao carregar formulário. Tente novamente.");
      },
    });
  }

  private initializeForm(): void {
    this.formGroup = this.fb.group({
      problem: ["", [Validators.required, Validators.minLength(16), Validators.maxLength(128)]],
      questions: this.fb.array([]),
      causes: this.fb.array([]),
      actionPlanDescription: ["", [Validators.required, Validators.minLength(32), Validators.maxLength(1024)]],
      followUp: ["", [Validators.required]],
      involvedType: ["internal"],
      involvedInternal: [null],
      involvedExternal: ["", [Validators.minLength(8), Validators.maxLength(128)]],
    });

    for (let i = 1; i <= 5; i++) {
      this.addQuestion(i);
    }

    this.formGroup.get("involvedType")?.valueChanges.subscribe((val) => {
      this.isInternalInvolved = val === "internal";
      this.updateInvolvedValidators();
    });
  }

  private updateInvolvedValidators(): void {
    const internalCtrl = this.formGroup.get("involvedInternal");
    const externalCtrl = this.formGroup.get("involvedExternal");

    if (this.isInternalInvolved) {
      internalCtrl?.setValidators([Validators.required]);
      externalCtrl?.clearValidators();
    } else {
      internalCtrl?.clearValidators();
      externalCtrl?.setValidators([Validators.required, Validators.minLength(8), Validators.maxLength(128)]);
    }

    internalCtrl?.updateValueAndValidity({ emitEvent: false });
    externalCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  get questions(): FormArray {
    return this.formGroup.get("questions") as FormArray;
  }

  get causes(): FormArray {
    return this.formGroup.get("causes") as FormArray;
  }

  addQuestion(level: number): void {
    const questionGroup = this.fb.group({
      level: [level, Validators.required],
      answer: ["", [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
    });
    this.questions.push(questionGroup);
  }

  addCause(): void {
    if (this.causes.length >= 5) {
      this.showAlert("WARNING", "Limite máximo de 5 causas atingido.");
      return;
    }
    const causeGroup = this.fb.group({
      category: ["", Validators.required],
      causeType: ["", Validators.required],
      description: ["", [Validators.required, Validators.minLength(16), Validators.maxLength(256)]],
    });
    this.causes.push(causeGroup);
  }

  removeCause(index: number): void {
    if (this.causes.length > 1) {
      this.causes.removeAt(index);
    }
  }

  private populateForm(form: RncForm): void {
    if (form.analysis) {
      this.formGroup.patchValue({
        problem: form.analysis.problem || "",
      });

      if (form.analysis.questions?.length) {
        this.questions.clear();
        form.analysis.questions.forEach((q) => {
          const group = this.fb.group({
            level: [q.level, Validators.required],
            answer: [q.answer || "", [Validators.required, Validators.minLength(8), Validators.maxLength(64)]],
          });
          this.questions.push(group);
        });
      }

      if (form.analysis.causes?.length) {
        this.causes.clear();
        form.analysis.causes.forEach((c) => {
          const group = this.fb.group({
            category: [c.category || "", Validators.required],
            causeType: [c.causeType || "", Validators.required],
            description: [c.description || "", [Validators.required, Validators.minLength(16), Validators.maxLength(256)]],
          });
          this.causes.push(group);
        });
      }
    }

    if (form.actionPlan) {
      this.formGroup.patchValue({
        actionPlanDescription: form.actionPlan.description || "",
        followUp: form.actionPlan.followUp || "",
      });

      if (form.actionPlan.involved?.id) {
        this.isInternalInvolved = true;
        this.formGroup.patchValue({ involvedType: "internal" });
        this.initialInvolvedId = form.actionPlan.involved.id;
        const involved: UserResponse = {
          id: form.actionPlan.involved.id,
          universalUser: { id: 0, name: form.actionPlan.involved.name || "", document: "", documentType: "" },
          company: { id: 0, name: "" },
          department: { id: 0, name: "" },
          roles: [],
          login: form.actionPlan.involved.name || "",
          username: form.actionPlan.involved.name || "",
          nickname: form.actionPlan.involved.name || "",
          email: "",
          status: "ACTIVE",
          lastLoginAt: new Date().toISOString(),
          avatarUri: null,
          audit: this.emptyAudit(),
        };
        this.onInvolvedSelected(involved);
        this.updateInvolvedValidators();
      } else if (form.actionPlan.involved?.name) {
        this.isInternalInvolved = false;
        this.formGroup.patchValue({
          involvedType: "external",
          involvedExternal: form.actionPlan.involved.name,
        });
        this.updateInvolvedValidators();
      }
    }
  }

  private emptyAudit() {
    return {
      createdAt: new Date().toISOString(),
      createdBy: "",
      updatedAt: null,
      updatedBy: null,
      disabledAt: null,
      disabledBy: null,
    };
  }

  // ==================================================
  // ANEXOS
  // ==================================================

  private loadAttachments(): void {
    if (!this.rncForm?.id) return;

    this.fileService
      .getFiles(this.rncForm.id.toString(), "RNC", 0, 20)
      .subscribe({
        next: (response) => {
          this.existingFiles = response.files || [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.showAlert("ERROR", "Erro ao carregar arquivos.");
        },
      });
  }

  refreshAttachments(): void {
    this.loadAttachments();
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
    this.cdr.detectChanges();
  }

  removeNewFile(index: number): void {
    this.attachedFiles.splice(index, 1);
    this.cdr.detectChanges();
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
        next: (response) => {
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
      this.uploadProgress.current = 10;
      this.uploadProgress.message = "Comprimindo imagens...";

      const compressedFiles = await Promise.all(
        filesToUpload.map((file) => this.fileService.compressImage(file)),
      );

      this.uploadProgress.current = 20;
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
                this.uploadProgress.current = currentProgress;
              }
              return true;
            }),
            catchError(() => {
              failedFiles.push(originalFile);
              completedFiles++;
              const newPercent = 20 + Math.floor((completedFiles / totalFiles) * 80);
              if (newPercent > currentProgress) {
                currentProgress = newPercent;
                this.uploadProgress.current = currentProgress;
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
      this.uploadProgress.current = 0;
    }
  }

  // ==================================================
  // EVENTOS DO TYPEHEAD
  // ==================================================

  onInvolvedSelected(user: UserResponse | null): void {
    if (user) {
      this.formGroup.patchValue({
        involvedInternal: `${user.id} - ${user.username}`,
      });
      this.formGroup.get("involvedInternal")?.setErrors(null);
    } else {
      this.formGroup.patchValue({ involvedInternal: "" });
    }
  }

  // ==================================================
  // SUBMISSÃO
  // ==================================================

  openSaveDraftModal(content: any): void {
    if (!this.isFormValid(true)) {
      this.markDraftInvalidFields();
      this.showAlert("WARNING", "Preencha corretamente os campos obrigatórios para salvar o rascunho.");
      return;
    }

    this.modalService.open(content, { centered: true, backdrop: "static" });
  }

  confirmSaveDraft(): void {
    this.submitForm("DRAFT_OPENED");
  }

  openSubmitModal(content: any): void {
    if (!this.isFormValid(false)) {
      this.markAllRequiredAsTouched();
      this.showAlert("WARNING", "Preencha todos os campos obrigatórios corretamente.");
      return;
    }

    this.modalService.open(content, { centered: true, backdrop: "static" });
  }

  confirmSubmitForm(): void {
    this.submitForm("AWAITING_VALIDATION");
  }

  private submitForm(status: "DRAFT_OPENED" | "AWAITING_VALIDATION"): void {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.loadingService.show();

    const data = this.buildFormData(status);

    const request = this.isNewForm
      ? this.rncService.createRncForm(data)
      : this.rncService.updateRncForm(this.rncForm!.id!, data);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.loadingService.hide();
        this.modalService.dismissAll();

        const message = status === "DRAFT_OPENED"
          ? "Rascunho salvo com sucesso!"
          : "Formulário enviado para validação com sucesso!";

        this.router.navigate(["/rncs", this.rncId], {
          queryParams: { action: "SUCCESS", message },
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.loadingService.hide();
        this.modalService.dismissAll();
        this.showAlert("ERROR", "Erro ao salvar formulário. Tente novamente.");
      },
    });
  }

  // ==================================================
  // VALIDAÇÕES
  // ==================================================

  get today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private isFormValid(isDraft: boolean): boolean {
    const requiredFields = ["problem", "actionPlanDescription", "followUp"];

    if (isDraft) {
      for (const field of requiredFields) {
        const control = this.formGroup.get(field);
        if (control?.value && control?.invalid) {
          return false;
        }
      }
      return true;
    }

    for (const field of requiredFields) {
      const control = this.formGroup.get(field);
      if (!control?.value || control?.invalid) {
        return false;
      }
    }

    const questions = this.questions.controls;
    let filledQuestions = 0;
    for (const q of questions) {
      const answer = q.get("answer");
      if (answer?.value) {
        filledQuestions++;
      }
      if (answer?.value && answer?.invalid) {
        return false;
      }
    }
    if (filledQuestions < 3) {
      return false;
    }

    const causes = this.causes.controls;
    if (causes.length === 0) {
      return false;
    }

    let rootCount = 0;
    for (const c of causes) {
      const category = c.get("category");
      const causeType = c.get("causeType");
      const description = c.get("description");
      if (!category?.value || !causeType?.value || !description?.value) {
        return false;
      }
      if (causeType.value === "ROOT") {
        rootCount++;
      }
    }
    if (rootCount !== 1) {
      return false;
    }

    return true;
  }

  private markDraftInvalidFields(): void {
    const controls = this.formGroup.controls;
    for (const key of Object.keys(controls)) {
      const control = controls[key];
      if (control?.value && control?.invalid) {
        control.markAsTouched();
      }
    }
  }

  private markAllRequiredAsTouched(): void {
    const fields = ["problem", "actionPlanDescription", "followUp"];
    fields.forEach((f) => this.formGroup.get(f)?.markAsTouched());

    this.questions.controls.forEach((q) => q.get("answer")?.markAsTouched());
    this.causes.controls.forEach((c) => {
      c.get("category")?.markAsTouched();
      c.get("causeType")?.markAsTouched();
      c.get("description")?.markAsTouched();
    });
    this.updateInvolvedValidators();
  }

  // ==================================================
  // UTILITÁRIOS
  // ==================================================

  private buildFormData(status: "DRAFT_OPENED" | "AWAITING_VALIDATION"): CreateUpdateRncForm {
    const raw = this.formGroup.getRawValue();

    const data: CreateUpdateRncForm = {
      rnc: { id: this.rncId },
      status,
    };

    if (raw.problem || this.questions.length > 0 || this.causes.length > 0) {
      data.analysis = {
        problem: raw.problem || "",
        questions: this.questions.controls.map((q) => ({
          level: q.get("level")?.value || 0,
          answer: q.get("answer")?.value || "",
        })),
        causes: this.causes.controls.map((c) => ({
          category: c.get("category")?.value || "",
          causeType: c.get("causeType")?.value || "",
          description: c.get("description")?.value || "",
        })),
      };
    }

    if (raw.actionPlanDescription || raw.followUp) {
      data.actionPlan = {
        description: raw.actionPlanDescription || "",
        followUp: raw.followUp || "",
      };

      if (this.isInternalInvolved && raw.involvedInternal) {
        const id = parseInt(raw.involvedInternal.split(" - ")[0]);
        if (!isNaN(id)) {
          data.actionPlan.involved = { id, name: raw.involvedInternal.split(" - ")[1] || "" };
        }
      } else if (!this.isInternalInvolved && raw.involvedExternal) {
        data.actionPlan.involved = { id: 0, name: raw.involvedExternal };
      }
    }

    return data;
  }

  goBack(): void {
    this.router.navigate(["/rncs", this.rncId]);
  }

  private showAlert(type: "SUCCESS" | "WARNING" | "ERROR", message: string): void {
    this.router.navigate([], { queryParams: { action: type, message } });
  }

  private redirectWithError(message: string): void {
    this.router.navigate(["/"], {
      queryParams: { action: "ERROR", message },
    });
  }

  getFieldLength(fieldName: string): number {
    const control = this.formGroup.get(fieldName);
    const value = control?.value;
    if (typeof value === "string") return value.length;
    return 0;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!control?.invalid && !!control?.touched;
  }

  getCausesCount(): number {
    return this.causes.length;
  }

  canRemoveCause(): boolean {
    return this.causes.length > 1;
  }

  onRncReloaded(rnc: Rnc): void {
    this.rnc = rnc;
  }
}