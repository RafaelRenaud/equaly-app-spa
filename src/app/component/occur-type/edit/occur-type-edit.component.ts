import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { OccurTypeResponse } from "../../../core/model/occurType/occur-type-response.model";
import { OccurTypeService } from "../../../core/service/occurType/occur-type.service";
import { LoadingService } from "../../../core/service/loading/loading.service";

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

  constructor(
    private formBuilder: FormBuilder,
    private occurTypeService: OccurTypeService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.occurTypeForm = this.formBuilder.group({
      occurTypeName: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(64),
        ],
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

  ngOnInit() {
    this.loadingService.show();
    const idParam = this.route.snapshot.paramMap.get("id");
    if (!idParam) {
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
    if (this.occurTypeForm.invalid) {
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
