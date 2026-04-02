import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule, NgbTooltipModule, NgbNav, NgbNavModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { SessionService } from '../../../core/service/session/session.service';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../core/service/address/address.service';
import { OccurTypeHeadSearchComponent } from "../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../user/search/user-type-head-search/user-type-head-search.component";
import { UserResponse } from '../../../core/model/user/user-response.model';
import { OccurTypeResponse } from '../../../core/model/occurType/occur-type-response.model';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';

interface FieldConfig {
  min?: number;
  max?: number;
  required?: boolean;
  pattern?: RegExp;
  email?: boolean;
}

@Component({
  selector: 'app-occur-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbAccordionModule,
    NgbTooltipModule,
    NgbNavModule,
    OccurTypeHeadSearchComponent,
    UserTypeHeadSearchComponent
  ],
  templateUrl: './occur-create.component.html',
  styleUrl: './occur-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OccurCreateComponent implements OnInit, AfterViewInit {
  @ViewChild('cepInput') cepInput!: ElementRef;
  @ViewChild('nav') nav!: NgbNav;

  occurrenceForm!: FormGroup;
  complaintType: 'INTERNAL' | 'EXTERNAL' | null = null;
  showAnonymousOption = false;
  showComplainerSection = true;
  showInternalId = false;
  attachedFiles: File[] = [];
  maxFiles = 10;
  isLoadingCep: boolean = false;
  activeTab: string = 'occurrence';
  private flatpickrInstance: any;
  private isSubmitting: boolean = false;

  // Configurações dos campos para exibição dos contadores
  readonly fieldConfigs: Record<string, FieldConfig> = {
    title: { min: 8, max: 64, required: true },
    description: { min: 256, max: 1024, required: true },
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
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public loadingService: LoadingService,
    public sessionService: SessionService,
    public addressService: AddressService,
    private cdr: ChangeDetectorRef,
    public modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initFlatpickr(), 100);
  }

  // ==================================================
  // MÉTODOS PÚBLICOS PARA O HTML
  // ==================================================

  getFieldLength(fieldName: string): number {
    const control = this.occurrenceForm.get(fieldName);
    const value = control?.value;
    if (typeof value === 'string') return value.length;
    if (value && typeof value === 'object') return 0;
    return 0;
  }

  getFieldConfig(fieldName: string): FieldConfig | undefined {
    return this.fieldConfigs[fieldName];
  }

  getFieldHelpText(fieldName: string): string {
    const config = this.getFieldConfig(fieldName);
    if (!config) return '';

    const parts: string[] = [];
    if (config.min && config.max) {
      parts.push(`Mínimo ${config.min} | Máximo ${config.max} caracteres`);
    } else if (config.min) {
      parts.push(`Mínimo ${config.min} caracteres`);
    } else if (config.max) {
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

  // ==================================================
  // MODAL
  // ==================================================

  openSaveDraftModal(content: any): void {
    // Primeiro valida os campos obrigatórios do rascunho
    this.isSubmitting = true;
    this.updateComplainantValidators();

    if (!this.isDraftValid()) {
      this.markDraftInvalidFields();
      this.router.navigate([], { queryParams: { action: 'WARNING', message: 'Preencha corretamente os campos obrigatórios' } });
      this.isSubmitting = false;
      return;
    }

    // Se a validação passar, abre o modal
    this.isSubmitting = false;
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  confirmSaveDraft(): void {
    this.isSubmitting = true;
    this.updateComplainantValidators();

    this.loadingService.show();
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['/occurs'], { queryParams: { action: 'SUCCESS', message: 'Rascunho salvo com sucesso' } });
      this.isSubmitting = false;
    }, 1000);
  }

  // ==================================================
  // FLATPICKR
  // ==================================================

  private initFlatpickr(): void {
    const dateInput = document.getElementById('floatingOccurrenceDate') as HTMLInputElement;
    if (dateInput && !this.flatpickrInstance) {
      this.flatpickrInstance = flatpickr(dateInput, {
        locale: Portuguese,
        dateFormat: 'd/m/Y',
        allowInput: true,
        maxDate: 'today',
        onChange: (selectedDates: Date[], dateStr: string) => {
          this.occurrenceForm.get('occurrenceDate')?.setValue(dateStr);
          this.cdr.detectChanges();
        }
      });
    }
  }

  private reinitFlatpickr(): void {
    setTimeout(() => {
      const dateInput = document.getElementById('floatingOccurrenceDate') as HTMLInputElement;
      if (dateInput) {
        if (this.flatpickrInstance) this.flatpickrInstance.destroy();
        this.flatpickrInstance = null;
        this.initFlatpickr();

        const savedDate = this.occurrenceForm.get('occurrenceDate')?.value;
        if (savedDate && typeof savedDate === 'object' && savedDate.year) {
          const day = String(savedDate.day).padStart(2, '0');
          const month = String(savedDate.month).padStart(2, '0');
          const year = savedDate.year;
          dateInput.value = `${day}/${month}/${year}`;
        }
      }
    }, 100);
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
      // Dados da Ocorrência
      occurrenceType: ['', Validators.required],
      priority: ['', Validators.required],
      qualityInspector: ['', Validators.required],
      occurrenceDate: [null, [Validators.required, this.futureDateValidator()]],
      nf1: ['', this.getValidators(this.fieldConfigs['nf1'])],
      nf2: ['', this.getValidators(this.fieldConfigs['nf2'])],
      nf3: ['', this.getValidators(this.fieldConfigs['nf3'])],
      nf4: ['', this.getValidators(this.fieldConfigs['nf4'])],
      nf5: ['', this.getValidators(this.fieldConfigs['nf5'])],
      title: ['', this.getValidators(this.fieldConfigs['title'])],
      description: ['', this.getValidators(this.fieldConfigs['description'])],
      complement: ['', this.getValidators(this.fieldConfigs['complement'])],
      orderNumber: ['', this.getValidators(this.fieldConfigs['orderNumber'])],
      complaintType: ['', Validators.required],
      complaintDescription: ['', this.getValidators(this.fieldConfigs['complaintDescription'])],
      complaintComplement: ['', this.getValidators(this.fieldConfigs['complaintComplement'])],
      anonymousComplainer: [false],
      internalComplainer: [''],
      complainerId: [{ value: '', disabled: true }],
      complainerName: [''],
      complainerPhone: [''],
      complainerEmail: [''],
      complainerCep: ['', Validators.pattern(/^\d{5}-\d{3}$/)],
      complainerStreet: ['', this.getValidators(this.fieldConfigs['complainerStreet'])],
      complainerNumber: ['', this.getValidators(this.fieldConfigs['complainerNumber'])],
      complainerDistrict: ['', this.getValidators(this.fieldConfigs['complainerDistrict'])],
      complainerAddressComplement: ['', this.getValidators(this.fieldConfigs['complainerAddressComplement'])],
      complainerCity: [{ value: '', disabled: true }, this.getValidators(this.fieldConfigs['complainerCity'])],
      complainerState: [{ value: '', disabled: true }]
    });
  }

  shouldShowCounter(fieldName: string): boolean {
    const control = this.occurrenceForm.get(fieldName);
    const value = control?.value;

    const hasValue = value && value.toString().trim().length > 0;
    const isFocused = document.activeElement?.id === this.getFieldId(fieldName);
    return hasValue || isFocused;
  }

  getFieldId(fieldName: string): string {
    const idMap: Record<string, string> = {
      title: 'floatingTitle',
      description: 'floatingDescription',
      complement: 'floatingComplement',
      complaintDescription: 'floatingComplaintDescription',
      complaintComplement: 'floatingComplaintComplement',
      orderNumber: 'floatingOrderNumber',
      nf1: 'floatingNf1',
      nf2: 'floatingNf2',
      nf3: 'floatingNf3',
      nf4: 'floatingNf4',
      nf5: 'floatingNf5',
      complainerName: 'floatingComplainerName',
      complainerPhone: 'floatingComplainerPhone',
      complainerEmail: 'floatingComplainerEmail',
      complainerStreet: 'floatingComplainerStreet',
      complainerNumber: 'floatingComplainerNumber',
      complainerDistrict: 'floatingComplainerDistrict',
      complainerAddressComplement: 'floatingComplainerAddressComplement'
    };
    return idMap[fieldName] || `field-${fieldName}`;
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
  // VALIDAÇÕES CONDICIONAIS (RECLAMANTE)
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
        phoneCtrl?.setValidators(this.getValidators(this.fieldConfigs['complainerPhone']));
        emailCtrl?.setValidators(this.getValidators(this.fieldConfigs['complainerEmail']));
        cepCtrl?.clearValidators();
      } else {
        nameCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs['complainerName'])]);
        phoneCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs['complainerPhone'])]);
        emailCtrl?.setValidators([Validators.required, ...this.getValidators(this.fieldConfigs['complainerEmail'])]);
        cepCtrl?.setValidators([Validators.required, Validators.pattern(/^\d{5}-\d{3}$/)]);
      }
    } else {
      [nameCtrl, phoneCtrl, emailCtrl, cepCtrl].forEach(ctrl => ctrl?.clearValidators());
    }

    [nameCtrl, phoneCtrl, emailCtrl, cepCtrl].forEach(ctrl => ctrl?.updateValueAndValidity({ emitEvent: false }));
  }

  // ==================================================
  // SUBMISSÃO (RASCUNHO / CADASTRO)
  // ==================================================

  private isDraftValid(): boolean {
    const type = this.occurrenceForm.get('occurrenceType')?.value;
    const priority = this.occurrenceForm.get('priority')?.value;
    if (!type || !priority) return false;

    for (const control of Object.values(this.occurrenceForm.controls)) {
      if (!control.disabled && control.value != null && control.value !== '' && control.invalid) return false;
    }
    return true;
  }

  private markDraftInvalidFields(): void {
    Object.values(this.occurrenceForm.controls).forEach(ctrl => {
      if (!ctrl.disabled && ctrl.value != null && ctrl.value !== '' && ctrl.invalid) ctrl.markAsTouched();
    });
  }

  private markAllRequiredAsTouched(): void {
    this.updateComplainantValidators();
    const fields = [
      'occurrenceType', 'priority', 'qualityInspector', 'occurrenceDate',
      'title', 'description', 'complaintType', 'complaintDescription'
    ];
    if (this.shouldValidateComplainant() && this.complaintType !== 'INTERNAL') {
      fields.push('complainerName', 'complainerPhone', 'complainerEmail', 'complainerCep');
    }
    fields.forEach(f => this.occurrenceForm.get(f)?.markAsTouched());
  }

  public shouldValidateComplainant(): boolean {
    return this.showComplainerSection && !this.occurrenceForm.get('anonymousComplainer')?.value;
  }

  public isSubmissionValid(): boolean {
    this.updateComplainantValidators();
    this.occurrenceForm.updateValueAndValidity();
    return this.occurrenceForm.valid;
  }

  createOccurrence(): void {
    this.isSubmitting = true;
    this.updateComplainantValidators();

    if (!this.isSubmissionValid()) {
      this.markAllRequiredAsTouched();
      this.router.navigate([], { queryParams: { action: 'WARNING', message: 'Preencha todos os campos obrigatórios corretamente.' } });
      this.isSubmitting = false;
      return;
    }
    this.loadingService.show();
    const formData = new FormData();
    formData.append('occurrenceData', JSON.stringify(this.prepareSubmissionData()));
    this.attachedFiles.forEach((f, i) => formData.append(`file${i}`, f, f.name));
    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['/occurs'], { queryParams: { action: 'SUCCESS', message: 'Ocorrência cadastrada com sucesso' } });
      this.isSubmitting = false;
    }, 1500);
  }

  private prepareSubmissionData(): any {
    const raw = this.occurrenceForm.getRawValue();
    const sub: any = { ...raw };

    if (sub.complainerState) {
      const match = sub.complainerState.match(/^([A-Z]{2})/);
      sub.complainerState = match ? match[1] : '';
    }
    if (sub.complainerCity) sub.complainerCity = sub.complainerCity.substring(0, 128);

    const date = sub.occurrenceDate;
    if (date && typeof date === 'object' && date.year) {
      sub.occurrenceDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    } else if (typeof date === 'string' && date.includes('/')) {
      const [d, m, y] = date.split('/');
      sub.occurrenceDate = `${y}-${m}-${d}`;
    }
    return sub;
  }

  // ==================================================
  // EVENTOS E LISTENERS
  // ==================================================

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
      if (this.activeTab === 'complainant' && !this.shouldShowComplainantTab()) this.activeTab = 'complaint';
      this.cdr.detectChanges();
    });

    this.occurrenceForm.get('anonymousComplainer')?.valueChanges.subscribe(val => {
      if (this.isSubmitting) return;
      this.showComplainerSection = !val;
      if (val) this.clearComplainerFields();
      this.updateComplainantValidators();
      if (this.activeTab === 'complainant' && !this.shouldShowComplainantTab()) this.activeTab = 'complaint';
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

  getFormattedDate(): string {
    const date = this.occurrenceForm.get('occurrenceDate')?.value;
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date.year) {
      return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
    }
    return '';
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
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (isNaN(date.getTime())) this.occurrenceForm.get('occurrenceDate')?.setErrors({ invalidDate: true });
      else if (date > today) this.occurrenceForm.get('occurrenceDate')?.setErrors({ futureDate: true });
      else {
        this.occurrenceForm.get('occurrenceDate')?.setErrors(null);
        this.occurrenceForm.get('occurrenceDate')?.setValue({ year: y, month: m, day: d });
      }
    } else if (val.length > 0 && val.length < 10) {
      this.occurrenceForm.get('occurrenceDate')?.setErrors({ incompleteDate: true });
    }
    this.cdr.detectChanges();
  }

  isInternalComplaint(): boolean {
    return this.complaintType === 'INTERNAL';
  }

  shouldShowComplainantTab(): boolean {
    return this.showComplainerSection && !this.occurrenceForm.get('anonymousComplainer')?.value;
  }

  onTabChange(event: any): void {
    if (event.nextId === 'complainant' && !this.shouldShowComplainantTab()) event.preventDefault();
    if (event.nextId === 'occurrence') this.reinitFlatpickr();
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (this.attachedFiles.length >= this.maxFiles) { alert(`Limite de ${this.maxFiles} arquivos atingido`); break; }
      const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'application/xml', 'text/xml'];
      if (!allowed.includes(file.type)) { alert(`Tipo de arquivo não permitido: ${file.name}`); continue; }
      if (file.size > 10 * 1024 * 1024) { alert(`Arquivo muito grande: ${file.name} (máximo 10MB)`); continue; }
      this.attachedFiles.push(file);
    }
    event.target.value = '';
  }

  removeFile(index: number): void { this.attachedFiles.splice(index, 1); }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  goBack(): void { this.router.navigate(['/occurs']); }

  applyCepMask(event: any): void {
    let val = event.target.value.replace(/\D/g, '');
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
          this.occurrenceForm.get('complainerCep')?.markAsTouched();
        } else {
          let cidade = addr.localidade;
          if (cidade?.length > 128) cidade = cidade.substring(0, 128);
          this.occurrenceForm.patchValue({
            complainerCep: addr.cep,
            complainerStreet: addr.logradouro,
            complainerAddressComplement: addr.complemento,
            complainerDistrict: addr.bairro,
            complainerCity: cidade,
            complainerState: addr.uf + " - " + addr.estado
          });
          this.occurrenceForm.get('complainerCep')?.setErrors(null);
        }
        this.isLoadingCep = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoadingCep = false;
        this.occurrenceForm.get('complainerCep')?.setErrors({ cepError: true });
        this.occurrenceForm.get('complainerCep')?.markAsTouched();
        this.cdr.detectChanges();
      }
    });
  }

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
      if (complainer.email && !complainer.email.includes("*")) {
        this.occurrenceForm.patchValue({ complainerEmail: complainer.email });
      }
    } else {
      this.occurrenceForm.patchValue({ internalComplainer: '', complainerId: '', complainerName: '', complainerEmail: '' });
    }
  }
}