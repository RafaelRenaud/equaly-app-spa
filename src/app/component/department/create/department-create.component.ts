import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";
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
    this.departmentForm = this.formBuilder.group({
      departmentName: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(64),
        ],
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

    this.isEqualyMasterAdmin = sessionService.hasRole("EQUALY_MASTER_ADMIN");
  }

  onSelectCompany(company: CompanyResponse | null) {
    this.selectedCompany = company;
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
        company: { id: this.selectedCompany?.id ?? null },
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
