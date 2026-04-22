import { Component } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { Observable, of } from "rxjs";
import { debounceTime, distinctUntilChanged, finalize, map, switchMap } from "rxjs/operators";
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
    if (!control.value || control.value.length < 2 || !this.selectedDepartment) {
      return of(null);
    }

    this.loadingService.show();

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((name) => {
        return this.departmentService.getDepartments("name", name, this.selectedDepartment?.company?.id ?? null, "NONE", 0, 10);
      }),
      map((response) => {
        const existingDepartment = response.departments?.find(
          (item) =>
            item.name.toLowerCase() === control.value.toLowerCase() &&
            item.id !== this.selectedDepartment?.id
        );
        return existingDepartment ? { duplicateName: true } : null;
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  ngOnInit() {
    this.loadingService.show();
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
      this.loadingService.hide();
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