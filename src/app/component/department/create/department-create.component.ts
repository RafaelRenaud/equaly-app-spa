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
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { SessionService } from "../../../core/service/session/session.service";
import { CompanySearchComponent } from "../../company/search/company-search.component";

@Component({
  selector: "app-department-create",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CompanySearchComponent],
  templateUrl: "./department-create.component.html",
  styleUrl: "./department-create.component.scss",
})
export class DepartmentCreateComponent {
  departmentForm!: FormGroup;
  selectedCompany: CompanyResponse | null = null;
  isEqualyMasterAdmin: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private router: Router
  ) {
    this.isEqualyMasterAdmin = sessionService.hasRole("EQUALY_MASTER_ADMIN");

    this.departmentForm = this.formBuilder.group({
      departmentName: [
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
      departmentDescription: [
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
        return this.departmentService.getDepartments("name", name, this.getCompanyId(), "NONE", 0, 10);
      }),
      map((response) => {
        const existingDepartment = response.departments?.find(
          (item) => item.name.toLowerCase() === control.value.toLowerCase()
        );
        return existingDepartment ? { duplicateName: true } : null;
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
    this.departmentForm.get("departmentName")?.updateValueAndValidity();
  }

  submitDepartment() {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    this.departmentService
      .createDepartment({
        name: this.departmentForm.get("departmentName")?.value,
        description: this.departmentForm.get("departmentDescription")?.value,
        company: { id: this.selectedCompany?.id ?? Number(this.sessionService.getItem("companyId")) },
      })
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "SUCCESS",
              message: `Departamento ${response.id} cadastrado com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao cadastrar departamento`,
            },
          });
        },
      });
  }
}