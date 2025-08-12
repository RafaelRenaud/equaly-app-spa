import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { DepartmentResponse } from "../../../core/model/department/department-response.model";
import { DepartmentService } from "../../../core/service/department/department.service";
import { LoadingService } from "../../../core/service/loading/loading.service";

@Component({
  selector: "app-department-edit",
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: "./department-edit.component.html",
  styleUrl: "./department-edit.component.scss",
  standalone: true
})
export class DepartmentEditComponent {
  selectedDepartment: DepartmentResponse | null = null;
  departmentForm!: FormGroup;

  canSubmit: boolean = false;
  invalidDepartmentName: boolean = false;
  invalidDepartmentDescription: boolean = false;

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
      // Tratar caso o id não exista
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
        this.router.navigate(["/departments"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar departamento",
          },
        });
        this.loadingService.hide();
      },
    });
  }

  editDepartment() {
    this.invalidDepartmentName = false;
    this.invalidDepartmentDescription = false;

    if (this.departmentForm.invalid) {
      if (this.departmentForm.get("departmentName")?.invalid) {
        this.invalidDepartmentName = true;
      }
      if (this.departmentForm.get("departmentDescription")?.invalid) {
        this.invalidDepartmentDescription = true;
      }
      this.canSubmit = false;
    } else {
      this.canSubmit = true;
    }

    if (!this.canSubmit) {
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
              message:
                `Departamento ` +
                this.selectedDepartment?.id +
                ` atualizado com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/departments"], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao atualizar departamento`,
            },
          });
        },
      });
  }
}
