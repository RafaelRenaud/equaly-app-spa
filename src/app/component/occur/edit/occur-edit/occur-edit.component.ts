// occur-edit.component.ts

import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgbAccordionModule, NgbModal, NgbNav, NgbNavModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { FileResponse } from '../../../../core/model/file/file-response.model';
import { Address, Complainant, CreateUpdateComplaint, CreateUpdateOccur } from '../../../../core/model/occur/occur-create-update.model';
import { Occur } from '../../../../core/model/occur/occur.model';
import { OccurTypeResponse } from '../../../../core/model/occurType/occur-type-response.model';
import { UserResponse } from '../../../../core/model/user/user-response.model';
import { AddressService } from '../../../../core/service/address/address.service';
import { FileService } from '../../../../core/service/file/file.service';
import { LoadingService } from '../../../../core/service/loading/loading.service';
import { OccurService } from '../../../../core/service/occur/occur.service';
import { OccurStatusPipe } from '../../../../pipe/occur-status-pipe.pipe';
import { OccurTypeHeadSearchComponent } from "../../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../../user/search/user-type-head-search/user-type-head-search.component";

interface FieldConfig {
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  email?: boolean;
}

interface UploadProgress {
  current: number;
  total: number;
  status: 'uploading' | 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-occur-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbProgressbarModule,
    UserTypeHeadSearchComponent,
    OccurTypeHeadSearchComponent,
    OccurStatusPipe
  ],
  templateUrl: './occur-edit.component.html',
  styleUrl: './occur-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OccurEditComponent implements OnInit, AfterViewInit {
  @ViewChild('nav') nav!: NgbNav;
  @ViewChild('uploadProgressModal') uploadProgressModal: any;

  occurrenceForm!: FormGroup;
  complaintType: 'INTERNAL' | 'EXTERNAL' | null = null;
  showAnonymousOption = false;
  showComplainerSection = true;
  showInternalId = false;
  attachedFiles: File[] = [];
  existingFiles: FileResponse[] = [];
  maxFiles = 10;
  isLoadingCep = false;
  activeTab = 'occurrence';
  isSubmitting = false;
  occurId = 0;
  occurData!: Occur;
  isDraft = false;
  isAwaitingEdit = false;
  isLoading = true;

  // IDs para os typeheads
  initialOccurTypeId: number | null = null;
  initialInspectorId: number | null = null;
  initialInternalComplainerId: number | null = null;

  uploadProgress: UploadProgress = {
    current: 0,
    total: 0,
    status: 'uploading',
    message: 'Enviando arquivos...'
  };

  readonly fieldConfigs = {
    title: { min: 8, max: 128, required: true },
    description: { min: 128, max: 1024, required: true },
    complement: { max: 512 },
    complaintDescription: { min: 32, max: 256, required: true },
    complaintComplement: { max: 128 },
    orderNumber: { max: 64 },
    nf1: { max: 44 },
    nf2: { max: 44 },
    nf3: { max: 44 },
    nf4: { max: 44 },
    nf5: { max: 44 },
    complainerName: { max: 128 },
    complainerPhone: { min: 4, max: 16 },
    complainerEmail: { max: 128, email: true },
    complainerStreet: { max: 128 },
    complainerNumber: { max: 8 },
    complainerDistrict: { max: 64 },
    complainerAddressComplement: { max: 128 },
    complainerCity: { max: 128 }
  } as const;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public loadingService: LoadingService,
    public addressService: AddressService,
    private cdr: ChangeDetectorRef,
    public modalService: NgbModal,
    private occurService: OccurService,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
    this.loadOccurrence();
  }

  ngAfterViewInit(): void {
    // Sem manipulação direta do DOM
  }

  // ==================================================
  // CARREGAMENTO
  // ==================================================

  private loadOccurrence(): void {
    this.occurId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.occurId) {
      this.redirectWithError('ID da ocorrência não informado.');
      return;
    }

    this.loadingService.show();

    this.occurService.getOccur(this.occurId).subscribe({
      next: (occur) => {
        this.loadingService.hide();
        this.occurData = occur;
        this.isLoading = false;

        if (occur.status !== 'DRAFT_OPENED' && occur.status !== 'AWAITING_EDIT') {
          this.redirectWithWarning('Não é possível editar a ocorrência.');
          return;
        }

        this.isDraft = occur.status === 'DRAFT_OPENED';
        this.isAwaitingEdit = occur.status === 'AWAITING_EDIT';

        this.populateForm(occur);

        if (!this.isDraft) {
          this.loadFiles();
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingService.hide();
        this.isLoading = false;
        this.redirectWithError('Erro ao carregar ocorrência. Tente novamente.');
      }
    });
  }

  private loadFiles(): void {
    this.fileService.getFiles(this.occurId.toString(), 'OCCUR', 0, 100).subscribe({
      next: (response) => {
        this.existingFiles = response.files || [];
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Erro ao carregar arquivos:', error)
    });
  }

  // ==================================================
  // FORMULÁRIO
  // ==================================================

  private getValidators(config: FieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (config.required) validators.push(Validators.required);
    if (config.min) validators.push(Validators.minLength(config.min));
    if (config.max) validators.push(Validators.maxLength(config.max));
    if (config.email) validators.push(Validators.email);
    if (config.pattern) validators.push(Validators.pattern(config.pattern));
    return validators;
  }

  private initializeForm(): void {
    this.occurrenceForm = this.fb.group({
      occurrenceType: ['', Validators.required],
      priority: ['', Validators.required],
      qualityInspector: [''],
      occurrenceDate: [null, [Validators.required, this.futureDateValidator()]],
      nf1: ['', this.getValidators(this.fieldConfigs.nf1)],
      nf2: ['', this.getValidators(this.fieldConfigs.nf2)],
      nf3: ['', this.getValidators(this.fieldConfigs.nf3)],
      nf4: ['', this.getValidators(this.fieldConfigs.nf4)],
      nf5: ['', this.getValidators(this.fieldConfigs.nf5)],
      title: ['', this.getValidators(this.fieldConfigs.title)],
      description: ['', this.getValidators(this.fieldConfigs.description)],
      complement: ['', this.getValidators(this.fieldConfigs.complement)],
      orderNumber: ['', this.getValidators(this.fieldConfigs.orderNumber)],
      complaintType: ['', Validators.required],
      complaintDescription: ['', this.getValidators(this.fieldConfigs.complaintDescription)],
      complaintComplement: ['', this.getValidators(this.fieldConfigs.complaintComplement)],
      anonymousComplainer: [false],
      internalComplainer: [''],
      complainerId: [{ value: '', disabled: true }],
      complainerName: [''],
      complainerPhone: [''],
      complainerEmail: [''],
      complainerCep: ['', Validators.pattern(/^\d{5}-\d{3}$/)],
      complainerStreet: ['', this.getValidators(this.fieldConfigs.complainerStreet)],
      complainerNumber: ['', this.getValidators(this.fieldConfigs.complainerNumber)],
      complainerDistrict: ['', this.getValidators(this.fieldConfigs.complainerDistrict)],
      complainerAddressComplement: ['', this.getValidators(this.fieldConfigs.complainerAddressComplement)],
      complainerCity: [{ value: '', disabled: true }, this.getValidators(this.fieldConfigs.complainerCity)],
      complainerState: [{ value: '', disabled: true }]
    });
  }

  private futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;

      let date: Date;
      if (typeof val === 'object' && val.year) {
        date = new Date(val.year, val.month - 1, val.day);
      } else if (typeof val === 'string' && val.includes('/')) {
        const [d, m, y] = val.split('/').map(Number);
        date = new Date(y, m - 1, d);
      } else {
        return null;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date > today ? { futureDate: true } : null;
    };
  }

  // ==================================================
  // PREENCHIMENTO
  // ==================================================

  private emptyAudit() {
    return {
      createdAt: new Date().toISOString(),
      createdBy: '',
      updatedAt: null,
      updatedBy: null,
      disabledAt: null,
      disabledBy: null
    };
  }

  private buildUserResponse(id: number, username: string, email: string, status: string): UserResponse {
    return {
      id,
      universalUser: { id: 0, name: username, document: '', documentType: '' },
      company: { id: 0, name: '' },
      department: { id: 0, name: '' },
      roles: [],
      login: username,
      username,
      nickname: username,
      email,
      status: status as 'ACTIVE' | 'INACTIVE',
      lastLoginAt: new Date().toISOString(),
      avatarUri: null,
      audit: this.emptyAudit()
    };
  }

  private formatDateToInput(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  private populateForm(occur: Occur): void {
    // Tipo de Ocorrência
    if (occur.occurType?.id) {
      this.initialOccurTypeId = occur.occurType.id;
      const occurType: OccurTypeResponse = {
        id: occur.occurType.id,
        company: { id: 0, name: '' },
        name: occur.occurType.name || '',
        description: occur.occurType.description || '',
        status: occur.occurType.status || 'ACTIVE',
        audit: this.emptyAudit()
      };
      this.onOccurTypeSelected(occurType);
    }

    // Prioridade
    if (occur.priority) {
      this.occurrenceForm.patchValue({ priority: occur.priority });
    }

    // Inspetor
    if (occur.inspector?.id) {
      this.initialInspectorId = occur.inspector.id;
      const inspector = this.buildUserResponse(
        occur.inspector.id,
        occur.inspector.username || '',
        occur.inspector.email || '',
        occur.inspector.status || 'ACTIVE'
      );
      this.onInspectorSelected(inspector);
    }

    // Data - CORREÇÃO: formata a data para string no formato dd/MM/yyyy
    if (occur.occurredDate) {
      const formattedDate = this.formatDateToInput(occur.occurredDate);
      this.occurrenceForm.patchValue({ occurrenceDate: formattedDate });
    }

    // Textos
    if (occur.title) this.occurrenceForm.patchValue({ title: occur.title });
    if (occur.description) this.occurrenceForm.patchValue({ description: occur.description });
    if (occur.complement) this.occurrenceForm.patchValue({ complement: occur.complement });

    // Notas fiscais
    if (occur.invoiceNotes?.length) {
      occur.invoiceNotes.forEach((note, index) => {
        if (index < 5) this.occurrenceForm.patchValue({ [`nf${index + 1}`]: note });
      });
    }

    // Reclamação
    if (occur.complaint) {
      if (occur.complaint.type) this.occurrenceForm.patchValue({ complaintType: occur.complaint.type });
      if (occur.complaint.orderId) this.occurrenceForm.patchValue({ orderNumber: occur.complaint.orderId });
      if (occur.complaint.request?.description) {
        this.occurrenceForm.patchValue({ complaintDescription: occur.complaint.request.description });
      }
      if (occur.complaint.request?.complement) {
        this.occurrenceForm.patchValue({ complaintComplement: occur.complaint.request.complement });
      }
      if (occur.complaint.isAnonymous !== undefined) {
        this.occurrenceForm.patchValue({ anonymousComplainer: occur.complaint.isAnonymous });
      }

      // Reclamante
      if (occur.complaint.complainant && !occur.complaint.isAnonymous) {
        const c = occur.complaint.complainant;

        if (c.id) {
          this.showInternalId = true;
          this.initialInternalComplainerId = c.id;
          const internalComplainer = this.buildUserResponse(c.id, c.name || '', c.email || '', 'ACTIVE');
          this.onInternalComplinantSelect(internalComplainer);
          this.occurrenceForm.patchValue({ complainerId: c.id });
        }

        if (c.name) this.occurrenceForm.patchValue({ complainerName: c.name });
        if (c.phone) this.occurrenceForm.patchValue({ complainerPhone: c.phone });
        if (c.email) this.occurrenceForm.patchValue({ complainerEmail: c.email });

        if (c.address) {
          const addr = c.address;
          if (addr.zipCode) {
            const cep = addr.zipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2');
            this.occurrenceForm.patchValue({ complainerCep: cep });
          }
          if (addr.street) this.occurrenceForm.patchValue({ complainerStreet: addr.street });
          if (addr.number) this.occurrenceForm.patchValue({ complainerNumber: addr.number });
          if (addr.district) this.occurrenceForm.patchValue({ complainerDistrict: addr.district });
          if (addr.complement) this.occurrenceForm.patchValue({ complainerAddressComplement: addr.complement });
          if (addr.city) this.occurrenceForm.patchValue({ complainerCity: addr.city });
          if (addr.uf) this.occurrenceForm.patchValue({ complainerState: addr.uf });
        }
      }
    }
  }

  // ==================================================
  // EVENTOS DOS TYPEHEADS
  // ==================================================

  onOccurTypeSelected(occurType: OccurTypeResponse | null): void {
    if (occurType) {
      this.occurrenceForm.patchValue({ occurrenceType: `${occurType.id} - ${occurType.name}` });
      this.occurrenceForm.get('occurrenceType')?.setErrors(null);
    } else {
      this.occurrenceForm.patchValue({ occurrenceType: '' });
    }
  }

  onInspectorSelected(inspector: UserResponse | null): void {
    if (inspector) {
      this.occurrenceForm.patchValue({ qualityInspector: `${inspector.id} - ${inspector.username}` });
      this.occurrenceForm.get('qualityInspector')?.setErrors(null);
    } else {
      this.occurrenceForm.patchValue({ qualityInspector: '' });
    }
  }

  onInternalComplinantSelect(complainer: UserResponse | null): void {
    if (complainer) {
      this.occurrenceForm.patchValue({
        internalComplainer: `${complainer.id} - ${complainer.username}`,
        complainerId: complainer.id,
        complainerName: complainer.username
      });
      this.occurrenceForm.get('internalComplainer')?.setErrors(null);
      if (complainer.email && !complainer.email.includes('*')) {
        this.occurrenceForm.patchValue({ complainerEmail: complainer.email });
      }
    } else {
      this.occurrenceForm.patchValue({ internalComplainer: '', complainerId: '', complainerName: '', complainerEmail: '' });
    }
  }

  // ==================================================
  // VALIDAÇÕES PÚBLICAS
  // ==================================================

  getFieldLength(fieldName: string): number {
    const value = this.occurrenceForm.get(fieldName)?.value;
    return typeof value === 'string' ? value.length : 0;
  }

  getFieldConfig(fieldName: string): FieldConfig | undefined {
    return this.fieldConfigs[fieldName as keyof typeof this.fieldConfigs];
  }

  getFieldHelpText(fieldName: string): string {
    const config = this.getFieldConfig(fieldName);
    if (!config) return '';

    const parts: string[] = [];
    if (config.min !== undefined && config.max !== undefined) {
      parts.push(`Mínimo ${config.min} | Máximo ${config.max} caracteres`);
    } else if (config.min !== undefined) {
      parts.push(`Mínimo ${config.min} caracteres`);
    } else if (config.max !== undefined) {
      parts.push(`Máximo ${config.max} caracteres`);
    }
    if (config.email) {
      parts.push('Formato de e-mail válido');
    }
    return parts.join(' | ');
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.occurrenceForm.get(fieldName);
    return !!control?.invalid && !!control?.touched;
  }

  shouldShowCounter(fieldName: string): boolean {
    const control = this.occurrenceForm.get(fieldName);
    const value = control?.value;
    return !!(value && value.toString().trim().length > 0);
  }

  shouldValidateComplainant(): boolean {
    return this.showComplainerSection && !this.occurrenceForm.get('anonymousComplainer')?.value;
  }

  isInternalComplaint(): boolean {
    return this.complaintType === 'INTERNAL';
  }

  shouldShowComplainantTab(): boolean {
    return this.showComplainerSection && !this.occurrenceForm.get('anonymousComplainer')?.value;
  }

  // ==================================================
  // SUBMISSÕES
  // ==================================================

  openSaveDraftModal(content: any): void {
    if (!this.isDraft) {
      this.showAlert('WARNING', 'Apenas rascunhos podem ser salvos como rascunho.');
      return;
    }

    this.updateComplainantValidators();

    if (!this.isDraftValid()) {
      this.markDraftInvalidFields();
      this.showAlert('WARNING', 'Preencha corretamente os campos obrigatórios');
      return;
    }

    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmSaveDraft(): void {
    this.updateComplainantValidators();
    this.loadingService.show();

    this.occurService.updateOccur(this.occurId, this.buildOccurData('DRAFT_OPENED')).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.redirectWithSuccess(`Rascunho atualizado com sucesso! Código: ${response.code || this.occurId}`);
      },
      error: () => {
        this.loadingService.hide();
        this.redirectWithError('Erro ao salvar rascunho. Tente novamente.');
      }
    });
  }

  openDeleteModal(content: any): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  confirmDeleteOccurrence(): void {
    this.loadingService.show();
    this.occurService.deleteOccur(this.occurId).subscribe({
      next: () => {
        this.loadingService.hide();
        this.redirectWithSuccess('Ocorrência removida com sucesso!');
      },
      error: () => {
        this.loadingService.hide();
        this.redirectWithError('Erro ao remover ocorrência. Tente novamente.');
      }
    });
  }

  confirmUpdateOccurrence(): void {
    this.updateComplainantValidators();

    if (!this.isSubmissionValid()) {
      this.markAllRequiredAsTouched();
      this.showAlert('WARNING', 'Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    this.modalService.open(this.uploadProgressModal, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
      size: 'md'
    });

    this.uploadProgress = { current: 0, total: 100, status: 'uploading', message: 'Atualizando ocorrência (20%)...' };
    this.cdr.detectChanges();

    this.occurService.updateOccur(this.occurId, this.buildOccurData('AWAITING_REPORT')).pipe(
      switchMap((response) => {
        this.uploadProgress.current = 20;
        this.uploadProgress.message = 'Ocorrência atualizada! Processando arquivos...';
        this.cdr.detectChanges();
        return this.uploadFiles().pipe(map((uploadResult) => ({ response, ...uploadResult })));
      })
    ).subscribe({
      next: (result) => {
        this.modalService.dismissAll();
        const message = result.success
          ? `Ocorrência atualizada com sucesso! Código: ${result.response.code || this.occurId}`
          : `Ocorrência ${result.response.code || this.occurId} atualizada, mas ${result.failedCount} arquivo(s) não anexados.`;
        this.redirectWithSuccess(message);
      },
      error: () => {
        this.modalService.dismissAll();
        this.redirectWithError('Erro ao atualizar ocorrência. Tente novamente.');
      }
    });
  }

  private uploadFiles(): Observable<{ success: boolean; failedCount: number }> {
    if (this.attachedFiles.length === 0) {
      return of({ success: true, failedCount: 0 });
    }

    return this.fileService.deleteFiles(this.occurId.toString(), 'OCCUR').pipe(
      switchMap(() => {
        this.uploadProgress.current = 30;
        this.uploadProgress.message = 'Enviando novos arquivos...';
        this.cdr.detectChanges();

        const percentPerFile = 60 / this.attachedFiles.length;
        let currentProgress = 40;

        const uploads = this.attachedFiles.map((file, index) =>
          this.fileService.createFile(this.occurId.toString(), 'OCCUR', file, file.name).pipe(
            map(() => {
              currentProgress += percentPerFile;
              this.uploadProgress.current = Math.min(currentProgress, 100);
              this.uploadProgress.message = `Enviando arquivo ${index + 1}/${this.attachedFiles.length} (${Math.round(this.uploadProgress.current)}%)...`;
              this.cdr.detectChanges();
              return true;
            }),
            catchError(() => {
              currentProgress += percentPerFile;
              this.uploadProgress.current = Math.min(currentProgress, 100);
              this.cdr.detectChanges();
              return of(false);
            })
          )
        );

        return forkJoin(uploads).pipe(
          map((results) => ({
            success: results.every(r => r === true),
            failedCount: results.filter(r => r === false).length
          }))
        );
      }),
      catchError(() => of({ success: false, failedCount: this.attachedFiles.length }))
    );
  }

  // ==================================================
  // VALIDAÇÕES INTERNAS
  // ==================================================

  private updateComplainantValidators(): void {
    const shouldValidate = this.shouldValidateComplainant();
    const isInternal = this.complaintType === 'INTERNAL';

    const nameCtrl = this.occurrenceForm.get('complainerName');
    const phoneCtrl = this.occurrenceForm.get('complainerPhone');
    const emailCtrl = this.occurrenceForm.get('complainerEmail');
    const cepCtrl = this.occurrenceForm.get('complainerCep');

    if (shouldValidate) {
      if (isInternal) {
        nameCtrl?.clearValidators();
        phoneCtrl?.setValidators(this.getValidators(this.fieldConfigs.complainerPhone));
        emailCtrl?.setValidators(this.getValidators(this.fieldConfigs.complainerEmail));
        cepCtrl?.clearValidators();
      } else {
        nameCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs.complainerName)]);
        phoneCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs.complainerPhone)]);
        emailCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs.complainerEmail)]);
        cepCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]);
      }
    } else {
      [nameCtrl, phoneCtrl, emailCtrl, cepCtrl].forEach(ctrl => ctrl?.clearValidators());
    }

    [nameCtrl, phoneCtrl, emailCtrl, cepCtrl].forEach(ctrl => ctrl?.updateValueAndValidity({ emitEvent: false }));
  }

  private isDraftValid(): boolean {
    const type = this.occurrenceForm.get('occurrenceType')?.value;
    const priority = this.occurrenceForm.get('priority')?.value;
    if (!type || !priority) return false;

    for (const control of Object.values(this.occurrenceForm.controls)) {
      if (!control.disabled && control.value != null && control.value !== '' && control.invalid) {
        return false;
      }
    }
    return true;
  }

  private markDraftInvalidFields(): void {
    this.occurrenceForm.updateValueAndValidity();
    ['occurrenceType', 'priority'].forEach(field => {
      const control = this.occurrenceForm.get(field);
      if (control?.invalid) control.markAsTouched();
    });
  }

  private markAllRequiredAsTouched(): void {
    this.updateComplainantValidators();
    const fields = ['occurrenceType', 'priority', 'occurrenceDate', 'title', 'description', 'complaintType', 'complaintDescription'];
    if (this.shouldValidateComplainant() && this.complaintType !== 'INTERNAL') {
      fields.push('complainerName', 'complainerPhone', 'complainerEmail', 'complainerCep');
    }
    fields.forEach(f => this.occurrenceForm.get(f)?.markAsTouched());
  }

  isSubmissionValid(): boolean {
    this.updateComplainantValidators();
    this.occurrenceForm.updateValueAndValidity();
    return this.occurrenceForm.valid;
  }

  // ==================================================
  // CONSTRUÇÃO DOS DADOS
  // ==================================================

  private buildOccurData(status: 'DRAFT_OPENED' | 'AWAITING_REPORT'): CreateUpdateOccur {
    const raw = this.occurrenceForm.getRawValue();
    const occurTypeId = parseInt(raw.occurrenceType?.split(' - ')[0]) || 0;
    const inspectorId = raw.qualityInspector ? parseInt(raw.qualityInspector.split(' - ')[0]) : undefined;
    const invoiceNotes = [raw.nf1, raw.nf2, raw.nf3, raw.nf4, raw.nf5].filter((n: string) => n?.trim());

    let occurredDate: string | undefined;
    if (raw.occurrenceDate && typeof raw.occurrenceDate === 'string') {
      const [day, month, year] = raw.occurrenceDate.split('/');
      occurredDate = `${year}-${month}-${day}`;
    }

    let complaint: CreateUpdateComplaint | undefined;
    if (raw.complaintType && raw.complaintDescription?.trim()) {
      const isAnonymous = raw.anonymousComplainer === true;
      let complainant: Complainant | undefined;

      if (!isAnonymous && this.shouldValidateComplainant()) {
        const address: Address = {};
        if (raw.complainerStreet) address.street = raw.complainerStreet;
        if (raw.complainerNumber) address.number = raw.complainerNumber;
        if (raw.complainerDistrict) address.district = raw.complainerDistrict;
        if (raw.complainerAddressComplement) address.complement = raw.complainerAddressComplement;
        if (raw.complainerCity) address.city = raw.complainerCity;
        if (raw.complainerState) {
          const ufMatch = raw.complainerState.match(/^([A-Z]{2})/);
          address.uf = ufMatch ? ufMatch[1] : '';
        }
        if (raw.complainerCep) address.zipCode = raw.complainerCep.replace(/\D/g, '');

        complainant = {
          id: raw.complainerId || undefined,
          name: raw.complainerName || undefined,
          phone: raw.complainerPhone || undefined,
          email: raw.complainerEmail || undefined,
          address: Object.keys(address).length ? address : undefined
        };
      }

      complaint = {
        orderId: raw.orderNumber || undefined,
        type: raw.complaintType,
        isAnonymous,
        complainant,
        request: { description: raw.complaintDescription, complement: raw.complaintComplement || undefined }
      };
    }

    return {
      occurType: { id: occurTypeId },
      priority: raw.priority,
      status,
      inspector: inspectorId ? { id: inspectorId } : undefined,
      occurredDate,
      invoiceNotes: invoiceNotes.length ? invoiceNotes : undefined,
      title: raw.title || undefined,
      description: raw.description || undefined,
      complement: raw.complement || undefined,
      complaint
    };
  }

  // ==================================================
  // UTILITÁRIOS
  // ==================================================

  viewFile(file: FileResponse): void {
    this.loadingService.show();
    this.fileService.getFileAccess(file.id!, this.occurId.toString(), 'OCCUR', file.hash!).subscribe({
      next: (response) => {
        this.loadingService.hide();
        window.open(`${response.url}?access_token=${response.access_token}`, '_blank');
      },
      error: () => {
        this.loadingService.hide();
        this.showAlert('ERROR', 'Erro ao acessar o arquivo. Tente novamente.');
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.attachedFiles.length >= this.maxFiles) {
        this.showAlert('WARNING', `Limite de ${this.maxFiles} arquivos atingido`);
        break;
      }

      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/xml', 'text/xml'];
      if (!allowed.includes(file.type)) {
        this.showAlert('WARNING', `Tipo de arquivo não permitido: ${file.name}`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        this.showAlert('WARNING', `Arquivo muito grande: ${file.name} (máximo 10MB)`);
        continue;
      }

      this.attachedFiles.push(file);
    }
    input.value = '';
    this.cdr.detectChanges();
  }

  removeNewFile(index: number): void {
    this.attachedFiles.splice(index, 1);
    this.cdr.detectChanges();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  applyCepMask(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) val = val.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    this.occurrenceForm.get('complainerCep')?.setValue(val, { emitEvent: false });
  }

  searchCep(): void {
    const cep = this.occurrenceForm.get('complainerCep')?.value;
    if (!cep) return;
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;

    this.isLoadingCep = true;
    this.cdr.detectChanges();

    this.addressService.getAddressByCep(cep).subscribe({
      next: (addr) => {
        if (addr.erro) {
          this.occurrenceForm.patchValue({
            complainerCep: null,
            complainerStreet: null,
            complainerAddressComplement: null,
            complainerDistrict: null,
            complainerCity: null,
            complainerState: null
          });
          this.occurrenceForm.get('complainerCep')?.setErrors({ cepNotFound: true });
        } else {
          this.occurrenceForm.patchValue({
            complainerCep: addr.cep,
            complainerStreet: addr.logradouro,
            complainerAddressComplement: addr.complemento,
            complainerDistrict: addr.bairro,
            complainerCity: addr.localidade?.substring(0, 128),
            complainerState: `${addr.uf} - ${addr.estado}`
          });
          this.occurrenceForm.get('complainerCep')?.setErrors(null);
        }
        this.isLoadingCep = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCep = false;
        this.occurrenceForm.get('complainerCep')?.setErrors({ cepError: true });
        this.cdr.detectChanges();
      }
    });
  }

  onTabChange(event: { nextId: string; activeId: string }): void {
    if (event.nextId === 'complainant' && !this.shouldShowComplainantTab()) {
      this.activeTab = event.activeId;
    }
  }

  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '');
    if (val.length >= 2 && val.length < 4) val = val.slice(0, 2) + '/' + val.slice(2);
    else if (val.length >= 4 && val.length < 6) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4);
    else if (val.length >= 6) val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4, 8);
    input.value = val;

    if (val.length === 10) {
      const [d, m, y] = val.split('/').map(Number);
      const date = new Date(y, m - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(date.getTime())) {
        this.occurrenceForm.get('occurrenceDate')?.setErrors({ invalidDate: true });
      } else if (date > today) {
        this.occurrenceForm.get('occurrenceDate')?.setErrors({ futureDate: true });
      } else {
        this.occurrenceForm.get('occurrenceDate')?.setErrors(null);
        this.occurrenceForm.get('occurrenceDate')?.setValue(val);
      }
    } else if (val.length > 0 && val.length < 10) {
      this.occurrenceForm.get('occurrenceDate')?.setErrors({ incompleteDate: true });
    }
    this.cdr.detectChanges();
  }

  getProgressPercentage(): number {
    return Math.round(this.uploadProgress.current);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  private setupFormListeners(): void {
    this.occurrenceForm.get('complaintType')?.valueChanges.subscribe(val => {
      if (this.isSubmitting) return;
      this.complaintType = val;
      this.showAnonymousOption = val === 'EXTERNAL';
      this.showInternalId = val === 'INTERNAL';

      const nameCtrl = this.occurrenceForm.get('complainerName');
      if (val === 'INTERNAL') {
        nameCtrl?.disable();
        this.showComplainerSection = true;
        this.occurrenceForm.get('anonymousComplainer')?.setValue(false);
        this.occurrenceForm.get('anonymousComplainer')?.disable();
      } else {
        nameCtrl?.enable();
        this.occurrenceForm.get('anonymousComplainer')?.enable();
      }

      this.updateComplainantValidators();
      if (this.activeTab === 'complainant' && !this.shouldShowComplainantTab()) {
        this.activeTab = 'complaint';
      }
      this.cdr.detectChanges();
    });

    this.occurrenceForm.get('anonymousComplainer')?.valueChanges.subscribe(val => {
      if (this.isSubmitting) return;
      this.showComplainerSection = !val;
      if (val) this.clearComplainerFields();
      this.updateComplainantValidators();
      if (this.activeTab === 'complainant' && !this.shouldShowComplainantTab()) {
        this.activeTab = 'complaint';
      }
      this.cdr.detectChanges();
    });
  }

  private clearComplainerFields(): void {
    const fields = [
      'complainerName', 'complainerPhone', 'complainerEmail', 'complainerCep',
      'complainerStreet', 'complainerNumber', 'complainerDistrict',
      'complainerAddressComplement', 'complainerCity', 'complainerState'
    ];
    fields.forEach(f => this.occurrenceForm.get(f)?.setValue(''));
  }

  private redirectWithSuccess(message: string): void {
    this.router.navigate(['/occurs'], { queryParams: { action: 'SUCCESS', message } });
  }

  private redirectWithWarning(message: string): void {
    this.router.navigate([], { queryParams: { action: 'WARNING', message } });
  }

  private redirectWithError(message: string): void {
    this.router.navigate(['/occurs'], { queryParams: { action: 'ERROR', message } });
  }

  private showAlert(type: 'SUCCESS' | 'WARNING' | 'ERROR', message: string): void {
    this.router.navigate([], { queryParams: { action: type, message } });
  }
}