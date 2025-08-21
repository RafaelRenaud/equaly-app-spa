import { Component } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { OccurTypeService } from "../../../core/service/occurType/occur-type.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { SessionService } from "../../../core/service/session/session.service";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-occur-type-create",
  imports: [CompanySearchComponent, ReactiveFormsModule, RouterModule],
  templateUrl: "./occur-type-create.component.html",
  styleUrl: "./occur-type-create.component.scss",
  standalone: true
})
export class OccurTypeCreateComponent {
  occurTypeForm!: FormGroup;

  canSubmit: boolean = false;
  invalidOccurTypeName: boolean = false;
  invalidOccurTypeDescription: boolean = false;
  selectedCompany: CompanyResponse | null = null;

  isEqualyMasterAdmin: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private occurTypeService: OccurTypeService,
    private loadingService: LoadingService,
    private sessionService: SessionService,
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

    if (sessionService.hasRole("EQUALY_MASTER_ADMIN")) {
      this.isEqualyMasterAdmin = true;
    }
  }

  onSelectCompany(company: CompanyResponse | null) {
    this.selectedCompany = company;
  }

  submitOccurType() {
    this.invalidOccurTypeName = false;
    this.invalidOccurTypeDescription = false;

    if (this.occurTypeForm.invalid) {
      if (this.occurTypeForm.get("occurTypeName")?.invalid) {
        this.invalidOccurTypeName = true;
      }
      if (this.occurTypeForm.get("occurTypeDescription")?.invalid) {
        this.invalidOccurTypeDescription = true;
      }
      this.canSubmit = false;
    } else {
      this.canSubmit = true;
    }

    if (!this.canSubmit) {
      return;
    }

    this.loadingService.show();
    this.occurTypeService
      .createOccurType({
        name: this.occurTypeForm.get("occurTypeName")?.value,
        description: this.occurTypeForm.get("occurTypeDescription")?.value,
        company: {
          id: this.selectedCompany ? this.selectedCompany.id : null,
        },
      })
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.router.navigate(["/occur-types"], {
            queryParams: {
              action: "SUCCESS",
              message:
                `Tipo de Ocorrência ` + response.id + ` cadastrada com sucesso`,
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
