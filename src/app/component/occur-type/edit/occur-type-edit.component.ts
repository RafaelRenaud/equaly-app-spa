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
import { OccurTypeResponse } from "../../../core/model/occurType/occur-type-response.model";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { OccurTypeService } from "../../../core/service/occurType/occur-type.service";
import { SessionService } from "../../../core/service/session/session.service";

@Component({
  selector: "app-occur-type-edit",
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: "./occur-type-edit.component.html",
  styleUrl: "./occur-type-edit.component.scss",
})
export class OccurTypeEditComponent {
  selectedOccurType: OccurTypeResponse | null = null;
  occurTypeForm!: FormGroup;
  private isCheckingDuplicate: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private occurTypeService: OccurTypeService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
    private route: ActivatedRoute,
    private router: Router
  ) {
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
    if (!control.value || control.value.length < 2 || !this.selectedOccurType) {
      return of(null);
    }

    this.loadingService.show();

    return of(control.value).pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((name) => {
        return this.occurTypeService.getOccurTypes("name", name, this.selectedOccurType?.company?.id ?? null, "NONE", 0, 10);
      }),
      map((response) => {
        const existingType = response.occurTypes?.find(
          (item) =>
            item.name.toLowerCase() === control.value.toLowerCase() &&
            item.id !== this.selectedOccurType?.id
        );
        return existingType ? { duplicateName: true } : null;
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
      this.router.navigate(["/occur-types"], {
        queryParams: {
          action: "ERROR",
          message: "ID do Tipo de Ocorrência inválido",
        },
      });
      return;
    }

    const id = +idParam;
    this.occurTypeService.getOccurType(id).subscribe({
      next: (occurType: OccurTypeResponse) => {
        this.selectedOccurType = occurType;
        this.occurTypeForm.patchValue({
          occurTypeName: occurType.name,
          occurTypeDescription: occurType.description,
        });
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        this.router.navigate(["/occur-types"], {
          queryParams: {
            action: "ERROR",
            message: "Erro ao carregar Tipo de Ocorrência",
          },
        });
      },
    });
  }

  editOccurType() {
    if (this.occurTypeForm.invalid || this.isCheckingDuplicate) {
      this.occurTypeForm.markAllAsTouched();
      return;
    }

    this.loadingService.show();
    this.occurTypeService
      .updateOccurType(this.selectedOccurType!.id.toString(), {
        name: this.occurTypeForm.get("occurTypeName")?.value,
        description: this.occurTypeForm.get("occurTypeDescription")?.value,
      })
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "SUCCESS",
              message: `Tipo de Ocorrência ${this.selectedOccurType?.id} atualizado com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao atualizar Tipo de Ocorrência",
            },
          });
        },
      });
  }
}