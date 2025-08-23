import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";

@Component({
  selector: "app-department-edit",
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: "./department-edit.component.html",
  styleUrl: "./department-edit.component.scss",
})
export class DepartmentEditComponent {
  selectedDepartment: DepartmentResponse | null = null;
  departmentForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private departmentService: DepartmentService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
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
  }

  ngOnInit() {
    this.loadingService.show();
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.router.navigate(["/departments"], {
        queryParams: {
          action: "ERROR",
          message: "ID do departamento inválido",
        },
      });
      return;
    }

    const id = +idParam;
    this.departmentService.getDepartment(id).subscribe({
      next: (department: DepartmentResponse) => {
        this.selectedDepartment = department;
        this.departmentForm.patchValue({
          departmentName: department.name,
          departmentDescription: department.description,
        });
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(["/departments"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar departamento",
          },
        });
      },
    });
  }

  editDepartment() {
    if (this.departmentForm.invalid) {
      this.departmentForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    this.departmentService
      .updateDepartment(this.selectedDepartment!.id.toString(), {
        name: this.departmentForm.get("departmentName")?.value,
        description: this.departmentForm.get("departmentDescription")?.value,
      })
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "SUCCESS",
              message: `Departamento ${this.selectedDepartment?.id} atualizado com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao atualizar departamento",
            },
          });
        },
      });
  }
}
