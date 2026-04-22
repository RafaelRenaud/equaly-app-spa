import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from "rxjs/operators";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { OccurTypeService } from "../../../core/service/occurType/occur-type.service";
import { SessionService } from "../../../core/service/session/session.service";
import { CompanySearchComponent } from "../../company/search/company-search.component";

@Component({
  selector: "app-occur-type-create",
  standalone: true,
  imports: [CompanySearchComponent, ReactiveFormsModule, RouterModule],
  templateUrl: "./occur-type-create.component.html",
  styleUrl: "./occur-type-create.component.scss",
})
export class OccurTypeCreateComponent {
  occurTypeForm!: FormGroup;
  selectedCompany: CompanyResponse | null = null;
  isEqualyMasterAdmin: boolean = false;
  private isCheckingDuplicate: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private occurTypeService: OccurTypeService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.isEqualyMasterAdmin = sessionService.hasRole("EQUALY_MASTER_ADMIN");

    this.occurTypeForm = this.formBuilder.group({
      occurTypeName: [
        "",
        {
          validators: [
            Validators.required,
            Validators.minLength(2),
            Validators.maxLength(64),
          ],
          asyncValidators: [this.duplicateNameValidator.bind(this)],
          updateOn: "blur",
        },
      ],
      occurTypeDescription: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(256),
        ],
      ],
    });
  }

  duplicateNameValidator(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 2 || !this.getCompanyId()) {
      return of(null);
    }

    this.loadingService.show();

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((name) => {
        return this.occurTypeService.getOccurTypes("name", name, this.getCompanyId(), "NONE", 0, 10);
      }),
      map((response) => {
        const existingType = response.occurTypes?.find(
          (item) => item.name.toLowerCase() === control.value.toLowerCase()
        );
        return existingType ? { duplicateName: true } : null;
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  private getCompanyId(): number | null {
    if (this.isEqualyMasterAdmin && this.selectedCompany) {
      return this.selectedCompany.id;
    }
    const companyId = this.sessionService.getItem("companyId");
    return companyId ? Number(companyId) : null;
  }

  onSelectCompany(company: CompanyResponse | null) {
    this.selectedCompany = company;
    this.occurTypeForm.get("occurTypeName")?.updateValueAndValidity();
  }

  submitOccurType() {
    if (this.occurTypeForm.invalid || this.isCheckingDuplicate) {
      this.occurTypeForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    this.occurTypeService
      .createOccurType({
        name: this.occurTypeForm.get("occurTypeName")?.value,
        description: this.occurTypeForm.get("occurTypeDescription")?.value,
        company: { id: this.selectedCompany?.id ?? Number(this.sessionService.getItem("companyId")) },
      })
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "SUCCESS",
              message: `Tipo de Ocorrência ${response.id} cadastrada com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao cadastrar Tipo de Ocorrência`,
            },
          });
        },
      });
  }
}