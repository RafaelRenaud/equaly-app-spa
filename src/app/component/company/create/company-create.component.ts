import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { CompanyService } from "../../../core/service/company/company.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { finalize } from "rxjs/operators";

@Component({
  selector: "company-create",
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: "./company-create.component.html",
  styleUrls: ["./company-create.component.scss"], // corrigido para plural
})
export class CompanyCreateComponent {
  companyForm!: FormGroup;

  invalidCompanyName = false;
  invalidCompanyDisplayName = false;
  invalidCompanyAlias = false;
  invalidCompanyTradingName = false;
  invalidCompanyDocument = false;
  invalidCompanyContact = false;

  canSubmit: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private companyService: CompanyService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.companyForm = this.formBuilder.group({
      companyName: [
        "",
        [
          Validators.required,
          Validators.maxLength(256),
        ],
      ],
      companyDisplayName: [
        "",
        [
          Validators.required,
          Validators.maxLength(128),
        ],
      ],
      companyAlias: [
        "",
        [
          Validators.required,
          Validators.maxLength(32),
        ],
      ],
      companyTradingName: [
        "",
        [Validators.maxLength(128)],
      ],
      companyDocument: [
        "",
        [Validators.required, Validators.pattern(/^\d{14}$/)],
      ],
      companyContact: ["", [Validators.required, Validators.email]],
    });

    this.companyForm.statusChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  validateCompanyExists(field: "name" | "alias" | "tradingName" | "document") {
    const control = this.companyForm.get(this.getFormControlName(field));
    const value = control?.value?.trim();

    if (!value || !control?.valid) return; // <-- só continua se for válido

    this.loadingService.show();

    this.companyService
      .getCompanies(field, value, "ACTIVE", 0, 1)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (res) => {
          const exists = res.companies.length > 0;
          switch (field) {
            case "name":
              this.invalidCompanyName = exists;
              break;
            case "alias":
              this.invalidCompanyAlias = exists;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = exists;
              break;
            case "document":
              this.invalidCompanyDocument = exists;
              break;
          }
          this.updateFormValidity();
        },
        error: () => {
          switch (field) {
            case "name":
              this.invalidCompanyName = true;
              break;
            case "alias":
              this.invalidCompanyAlias = true;
              break;
            case "tradingName":
              this.invalidCompanyTradingName = true;
              break;
            case "document":
              this.invalidCompanyDocument = true;
              break;
          }
          this.updateFormValidity();
        },
      });
  }

  private updateFormValidity() {
    const allValid =
      !this.invalidCompanyName &&
      !this.invalidCompanyAlias &&
      !this.invalidCompanyTradingName &&
      !this.invalidCompanyDocument &&
      this.companyForm.valid;
    this.canSubmit = allValid;
  }

  submitCompany() {
    if (!this.canSubmit || this.companyForm.invalid) {
      this.markAllFieldsAsTouched();
      return;
    }

    const companyRequest = {
      name: this.companyForm.value.companyName.trim(),
      alias: this.companyForm.value.companyAlias.trim(),
      tradingName: this.companyForm.value.companyTradingName?.trim() || "",
      displayName: this.companyForm.value.companyDisplayName.trim(),
      document: this.companyForm.value.companyDocument.trim(),
      contact: this.companyForm.value.companyContact.trim(),
    };

    this.loadingService.show();

    this.companyService
      .createCompany(companyRequest)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.router.navigate(["/companies"], {
            queryParams: {
              action: "SUCCESS",
              message: `Empresa ${response.id} cadastrada com sucesso`,
            },
          });
        },
        error: () => {
          this.router.navigate([], {
            queryParams: {
              action: "ERROR",
              message: "Erro ao cadastrar empresa",
            },
          });
        },
      });
  }

  private markAllFieldsAsTouched() {
    Object.values(this.companyForm.controls).forEach((control) => {
      control.markAsTouched();
    });
  }

  private getFormControlName(field: string): string {
    switch (field) {
      case "name":
        return "companyName";
      case "alias":
        return "companyAlias";
      case "tradingName":
        return "companyTradingName";
      case "document":
        return "companyDocument";
      default:
        return "";
    }
  }
}
