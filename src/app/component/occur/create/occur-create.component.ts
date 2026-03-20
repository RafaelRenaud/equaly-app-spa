import { Component, OnInit, HostListener, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbAccordionModule, NgbDatepickerModule, NgbTooltipModule, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { LoadingService } from '../../../core/service/loading/loading.service';
import { SessionService } from '../../../core/service/session/session.service';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../core/service/address/address.service';
import { OccurTypeHeadSearchComponent } from "../../occur-type/search/occur-type-head-search/occur-type-head-search.component";
import { UserTypeHeadSearchComponent } from "../../user/search/user-type-head-search/user-type-head-search.component";
import { UserResponse } from '../../../core/model/user/user-response.model';
import { OccurTypeResponse } from '../../../core/model/occurType/occur-type-response.model';

@Component({
  selector: 'app-occur-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgbAccordionModule,
    NgbDatepickerModule,
    NgbTooltipModule,
    OccurTypeHeadSearchComponent,
    UserTypeHeadSearchComponent
  ],
  templateUrl: './occur-create.component.html',
  styleUrl: './occur-create.component.scss'
})
export class OccurCreateComponent implements OnInit {
  @ViewChild('datePicker') datePicker!: NgbDatepicker;
  @ViewChild('cepInput') cepInput!: ElementRef;

  occurrenceForm!: FormGroup;
  complaintType: 'INTERNAL' | 'EXTERNAL' | null = null;
  showAnonymousOption = false;
  showComplainerSection = true;
  showInternalId = false;
  showDatePicker = false;
  attachedFiles: File[] = [];
  maxFiles = 10;
  isLoadingCep: boolean = false;

  // Propriedades para o datepicker
  maxDate: NgbDateStruct;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    public loadingService: LoadingService,
    public sessionService: SessionService,
    public addressService: AddressService,
    private cdr: ChangeDetectorRef
  ) {
    // Configurar datas mínima e máxima
    const today = new Date();
    this.maxDate = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupFormListeners();
  }

  private initializeForm(): void {
    this.occurrenceForm = this.formBuilder.group({
      // Dados da Ocorrência
      occurrenceType: ['', Validators.required],
      priority: ['', Validators.required],
      qualityInspector: ['', Validators.required],
      occurrenceDate: [null, Validators.required],
      nf1: [''],
      nf2: [''],
      nf3: [''],
      nf4: [''],
      nf5: [''],
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      complement: ['', Validators.maxLength(500)],

      // Dados da Reclamação
      orderNumber: ['', Validators.required],
      complaintType: ['', Validators.required],
      complaintDescription: ['', [Validators.required, Validators.maxLength(1000)]],
      complaintComplement: ['', Validators.maxLength(500)],
      anonymousComplainer: [false],

      // Dados do Reclamante
      internalComplainer: [''],
      complainerId: [{ value: '', disabled: true }],
      complainerName: ['', Validators.maxLength(200)],
      complainerPhone: ['', Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)],
      complainerEmail: ['', Validators.email],
      complainerCep: ['', Validators.pattern(/^\d{5}-\d{3}$/)],
      complainerStreet: ['', Validators.maxLength(200)],
      complainerNumber: ['', Validators.maxLength(10)],
      complainerDistrict: ['', Validators.maxLength(100)],
      complainerAddressComplement: ['', Validators.maxLength(100)],
      complainerCity: [{ value: '', disabled: true }],
      complainerState: [{ value: '', disabled: true }]
    });
  }

  private setupFormListeners(): void {
    // Monitora mudanças no tipo de reclamação
    this.occurrenceForm.get('complaintType')?.valueChanges.subscribe(value => {
      this.complaintType = value;
      this.showAnonymousOption = value === 'EXTERNAL';
      this.showInternalId = value === 'INTERNAL';

      const nameControl = this.occurrenceForm.get('complainerName');
      if (value === 'INTERNAL') {
        nameControl?.disable();
        this.showComplainerSection = true;
        this.occurrenceForm.get('anonymousComplainer')?.setValue(false);
        this.occurrenceForm.get('anonymousComplainer')?.disable();
      } else {
        nameControl?.enable();
        this.occurrenceForm.get('anonymousComplainer')?.enable();
      }
    });

    // Monitora mudanças no checkbox de anonimato
    this.occurrenceForm.get('anonymousComplainer')?.valueChanges.subscribe(value => {
      this.showComplainerSection = !value;
      if (value) {
        this.clearComplainerFields();
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const datePickerContainer = document.querySelector('ngb-datepicker');
    const dateInput = document.getElementById('floatingOccurrenceDate');
    const calendarButton = target.closest('button[type="button"]');

    if (datePickerContainer &&
      !datePickerContainer.contains(target) &&
      target !== dateInput &&
      !calendarButton) {
      this.showDatePicker = false;
      this.cdr.detectChanges();
    }
  }

  private clearComplainerFields(): void {
    const fields = [
      'complainerName', 'complainerPhone', 'complainerEmail',
      'complainerCep', 'complainerStreet', 'complainerNumber',
      'complainerDistrict', 'complainerAddressComplement',
      'complainerCity', 'complainerState'
    ];

    fields.forEach(field => {
      this.occurrenceForm.get(field)?.setValue('');
    });
  }

  getFormattedDate(): string {
    const date = this.occurrenceForm.get('occurrenceDate')?.value;
    if (!date) return '';

    if (typeof date === 'string' && date.includes('/')) {
      return date;
    } else if (typeof date === 'object' && date.year) {
      const day = date.day.toString().padStart(2, '0');
      const month = date.month.toString().padStart(2, '0');
      const year = date.year;
      return `${day}/${month}/${year}`;
    }
    return '';
  }

  toggleDatePicker(): void {
    this.showDatePicker = !this.showDatePicker;
    this.cdr.detectChanges();
  }

  onDateSelect(date: NgbDateStruct): void {
    this.occurrenceForm.get('occurrenceDate')?.setValue(date);
    this.showDatePicker = false;
    this.cdr.detectChanges();
  }

  // Método para permitir digitação manual da data
  onDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Aplicar máscara DD/MM/AAAA
    if (value.length >= 2 && value.length < 4) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    } else if (value.length >= 4 && value.length < 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4);
    } else if (value.length >= 6) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
    }

    input.value = value;

    // Validar data
    if (value.length === 10) {
      const [day, month, year] = value.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Validar se a data é válida
      if (date instanceof Date && !isNaN(date.getTime())) {
        // Validar se não é data futura
        if (date > today) {
          this.occurrenceForm.get('occurrenceDate')?.setErrors({ futureDate: true });
        } else {
          this.occurrenceForm.get('occurrenceDate')?.setErrors(null);
          // Atualizar o valor do form com a data
          this.occurrenceForm.get('occurrenceDate')?.setValue({
            year: year,
            month: month,
            day: day
          });
        }
      } else {
        this.occurrenceForm.get('occurrenceDate')?.setErrors({ invalidDate: true });
      }
    } else if (value.length > 0 && value.length < 10) {
      this.occurrenceForm.get('occurrenceDate')?.setErrors({ incompleteDate: true });
    }

    this.cdr.detectChanges();
  }

  isInternalComplaint(): boolean {
    return this.complaintType === 'INTERNAL';
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (this.attachedFiles.length >= this.maxFiles) {
          alert(`Limite de ${this.maxFiles} arquivos atingido`);
          break;
        }

        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/heic',
          'application/xml',
          'text/xml'
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(`Tipo de arquivo não permitido: ${file.name}`);
          continue;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert(`Arquivo muito grande: ${file.name} (máximo 10MB)`);
          continue;
        }

        this.attachedFiles.push(file);
      }

      event.target.value = '';
    }
  }

  removeFile(index: number): void {
    this.attachedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  saveDraft(): void {
    if (this.occurrenceForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    console.log('Salvando rascunho:', this.occurrenceForm.value);

    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['/occurs'], {
        queryParams: {
          action: 'SUCCESS',
          message: 'Rascunho salvo com sucesso'
        }
      });
    }, 1000);
  }

  createOccurrence(): void {
    if (this.occurrenceForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loadingService.show();

    const formData = new FormData();
    formData.append('occurrenceData', JSON.stringify(this.occurrenceForm.value));

    this.attachedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });

    console.log('Criando ocorrência:', this.occurrenceForm.value);

    setTimeout(() => {
      this.loadingService.hide();
      this.router.navigate(['/occurs'], {
        queryParams: {
          action: 'SUCCESS',
          message: 'Ocorrência cadastrada com sucesso'
        }
      });
    }, 1500);
  }

  private markAllAsTouched(): void {
    Object.values(this.occurrenceForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/occurs']);
  }

  applyCepMask(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d{0,3})/, '$1-$2');
    }
    this.occurrenceForm.get('complainerCep')?.setValue(value, { emitEvent: false });
  }

  searchCep(): void {
    const cepControl = this.occurrenceForm.get('complainerCep');
    const cep = cepControl?.value;

    if (!cep) {
      return;
    }

    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      return;
    }

    this.isLoadingCep = true;
    this.cdr.detectChanges();

    this.addressService.getAddressByCep(cep).subscribe({
      next: (address) => {
        if (address.erro) {
          this.occurrenceForm.patchValue({
            complainerCep: null,
            complainerStreet: null,
            complainerAddressComplement: null,
            complainerDistrict: null,
            complainerCity: null,
            complainerState: null
          });
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: "CEP não encontrado, tente novamente",
            },
          });
        } else {
          this.occurrenceForm.patchValue({
            complainerCep: address.cep,
            complainerStreet: address.logradouro,
            complainerAddressComplement: address.complemento,
            complainerDistrict: address.bairro,
            complainerCity: address.localidade,
            complainerState: address.uf + " - " + address.estado
          });
        }
        this.isLoadingCep = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao buscar CEP:', err);
        this.isLoadingCep = false;
        this.cdr.detectChanges();
        this.router.navigate([], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao buscar CEP, contate o time de suporte",
          },
        });
      }
    });
  }

  onOccurTypeSelected(occurType: OccurTypeResponse | null): void {
    this.occurrenceForm.patchValue({
      occurrenceType: occurType ? `${occurType.id} - ${occurType.name}` : ''
    });
  }

  onInspectorSelected(inspector: UserResponse | null): void {
    this.occurrenceForm.patchValue({
      qualityInspector: inspector ? `${inspector.id} - ${inspector.username}` : ''
    });
  }

  onInternalComplinantSelect(complainer: UserResponse | null): void {
    if (complainer) {
      this.occurrenceForm.patchValue({
        internalComplainer: `${complainer.id} - ${complainer.username}`,
        complainerId: complainer.id,
        complainerName: complainer.username
      });

      if (complainer.email && !complainer.email.includes("*")) {
        this.occurrenceForm.patchValue({
          complainerEmail: complainer.email
        });
      }
    } else {
      this.occurrenceForm.patchValue({
        internalComplainer: '',
        complainerId: '',
        complainerName: '',
        complainerEmail: ''
      });
    }
  }
}