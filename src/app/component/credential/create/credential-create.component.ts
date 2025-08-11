import { Component } from "@angular/core";
import { CompanySearchComponent } from "../../company/search/company-search.component";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CompanyResponse } from "../../../core/model/company/company-response.model";
import { CredentialService } from "../../../core/service/credential/credential.service";
import { LoadingService } from "../../../core/service/loading/loading.service";
import { Router, RouterModule } from "@angular/router";

@Component({
  selector: "app-credential-create",
  imports: [CompanySearchComponent, ReactiveFormsModule, RouterModule],
  templateUrl: "./credential-create.component.html",
  styleUrl: "./credential-create.component.scss",
  standalone: true,
})
export class CredentialCreateComponent {
  credentialForm!: FormGroup;

  canSubmit: boolean = false;
  invalidCredential: boolean = false;
  selectedCompany: CompanyResponse | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private credentialService: CredentialService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.credentialForm = this.formBuilder.group({
      type: ["", [Validators.required]],
    });

    // dispara verificação quando mudar tipo
    this.credentialForm.get("type")?.valueChanges.subscribe(() => {
      this.checkCredentialExists();
    });
  }

  onSelectCompany(company: CompanyResponse | null) {
    this.selectedCompany = company;
    this.checkCredentialExists();
  }

  private checkCredentialExists() {
    this.invalidCredential = false;
    this.canSubmit = false;

    const type = this.credentialForm.get("type")?.value;
    const companyId = this.selectedCompany?.id;

    if (!type || !companyId) {
      return;
    }

    this.loadingService.show();
    this.credentialService
      .getCredentials(
        "credentialType",
        type,
        "ACTIVE",
        companyId.toString(),
        0,
        1
      )
      .subscribe({
        next: (res) => {
          this.loadingService.hide();

          if (res.credentials && res.credentials.length > 0) {
            this.invalidCredential = true;
          } else {
            this.invalidCredential = false;
            this.canSubmit = this.credentialForm.valid;
          }
        },
        error: () => {
          this.loadingService.hide();
        },
      });
  }

  submitCredential() {
    if (!this.canSubmit || this.invalidCredential || !this.selectedCompany) {
      return;
    }

    this.loadingService.show();
    this.credentialService
      .createCredential(
        +this.selectedCompany.id,
        this.credentialForm.get("type")?.value
      )
      .subscribe({
        next: () => {
          this.loadingService.hide();
          this.router.navigate(["/credentials"], {
            queryParams: {
              action: "SUCCESS",
              message: `Credencial cadastrada com sucesso`,
            },
          });
        },
        error: () => {
          this.loadingService.hide();
          this.router.navigate(["/credentials"], {
            queryParams: {
              action: "ERROR",
              message: `Erro ao cadastrar credencial`,
            },
          });
        },
      });
  }
}
